let log4js = require('log4js');
// log4js的输出级别6个: trace, debug, info, warn, error, fatal

log4js.configure({
    //输出位置的基本信息设置
    appenders: {
        out: {type: 'console'},
        wxLog: {
            type: 'dateFile',
            filename: './log/wxLog/logs',
            pattern: '_yyyy-MM-dd.log',
            alwaysIncludePattern: true
        }
    },
    //不同等级的日志追加到不同的输出位置：appenders: ['out', 'allLog']  categories 作为getLogger方法的键名对应
    categories: {
        wxLog: {appenders: ["out", "wxLog"], level: 'info'},
        default: {appenders: ["out", "wxLog"], level: 'info'},
    }

});

module.exports = {log4js};
