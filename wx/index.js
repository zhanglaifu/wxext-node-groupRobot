const WebSocket = require("ws");
const axios = require("axios");

const { log4js } = require("../log4");
//默认群助手错误提示信息！
const defaultMsg = `
    格式不规范，请参照所需内容发送指定格式数据：
    1、工单执行详情
    例如：工单查询 + 33992
   
`;
const groupID = "您的群wxid"; //群id
const groupUserNick = "群里您的昵称"; //您所在群的本人的昵称
(async () => {
    const log4 = await log4js.getLogger("wxLog");
    const { data } = await axios.get("http://127.0.0.1:8203/ext/www/key.ini");
    const { name, key } = data;
    const WebSocketClient = new WebSocket(`ws://127.0.0.1:8202/wx?name=${name}&key=${key}`);
    WebSocketClient.on("open", function () {
        log4.info("websocket连接成功");
        WebSocketClient.send(JSON.stringify({
            "method": "show",
            "pid": 0
        }))
    })
    WebSocketClient.on("error", function (err) {
        log4.error("websocket连接错误: ", err);
    });
    WebSocketClient.on("close", function () {
        log4.warn("websocket连接断开");
    });

    WebSocketClient.on("message", async function (data) {
        data = JSON.parse(data);
        // console.log(data)
        if (data.method == "newmsg") {
            /**
             * fromid  群发送信息的用户id 
             * toid  群接受信息的用户id  默认谁打开的就是谁的id
             * msg  用户发送的群信息  如果有@别人的话 所有的信息都会在msg中，这个是经过转义后的
             * memid 群里发送者的成员id 用户@对方
             */
            const { fromid, memreMark, memid, msg, id, toid } = data.data;
            // console.log(fromid)
            if (fromid == groupID) {
                console.log(data)
                if (msg.indexOf(`@${groupUserNick}`) > -1) {  //检测发送信息是否是 @ 本人的，填写您的群昵称
                    const realMsg = msg.replace(`@${groupUserNick}`, "").trim(); //发送的实际内容
                    let sendMsg = realMsg;
                    const searchL = realMsg.split("+");
                    if (searchL.length < 2) {
                        sendMsg = defaultMsg;
                    } else {
                        log4.info("解析后数据为：" + JSON.stringify(searchL));
                        switch (searchL[0]) {
                            case "工单查询":
                                try {
                                    const orderId = searchL[1];
                                    //执行数据库查询逻辑，或者发送接口请求等！
                                    sendMsg="工单正在处理中。。。"
                                } catch (err) {
                                    sendMsg = "工单获取失败！"
                                }
                                break;

                            default:
                                sendMsg = "您的输入格式错误！"
                                break;
                        }
                    }

                    WebSocketClient.send(JSON.stringify({
                        "method": "sendText",
                        "wxid": fromid,
                        "msg": sendMsg,
                        "atid": memid,
                        "pid": 0
                    }))
                }

            } else if (toid == groupID) { //不可在pc端发送，只能在移动端才会触发
                console.log("自己发送的信息,记录发送的是什么即可！") //自己发送的信息method 为sendText_recv
            }
        }
    });
})()



