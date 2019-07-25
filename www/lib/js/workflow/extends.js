/**
 邮局协议，其他模块通过这个邮局进行订阅与发布消息 *
 */
$.postOffice = ( function() {

    /**订阅消息
     * @param {Object} channel:订阅的频道
     * @param {Object} fn：回调函数
     */
    var subscribe = function(channel, fn, owner) {
            if (!$.postOffice.channels[channel]) {
                $.postOffice.channels[channel] = [];
            }
            if (owner) {
                $.postOffice.channels[channel].push({
                    context : owner, //这里的owner是订阅消息的对象，函数fn是其中的一个函数
                    callback : fn
                });
                return this;
                //注意，默认情况这里的this为邮局对象本身
            } else {
                $.postOffice.channels[channel].push({
                    context : this,
                    callback : fn
                });
                return this;
            }

        },

        unSubscribe = function(channel) {
            delete $.postOffice.channels[channel];//删除之
        },

        /**
         * 向某个频道发送消息，消息一旦发布，会立马查看订阅了该频道消息的的对象，并执行其回调函数
         * @param {Object} channel 频道
         */
        publish = function(channel) {
            if (!$.postOffice.channels[channel]) {
                return false;
            }

            //注意，发布消息时，除了第一个参数外，其他的参数作为回调函数的输入参数被输入
            var args = Array.prototype.slice.call(arguments, 1);

            //获取除chanel外的参数
            //扫描这个频道的订阅者
            for (var i = 0, l = $.postOffice.channels[channel].length; i < l; i++) {
                var subscription = $.postOffice.channels[channel][i];
                subscription.callback.apply(subscription.context, args);
            }
            return this;
        };

    
    
     
    return {
        channels : {
        },
        publish : publish,
        subscribe : subscribe,
        unSubscribe:unSubscribe,
       /**
         *  将消息安装到obj对象上，这样obj对象即为当前的工作上下文，等效于subscribe中的owner代理
         * @param {Object} obj
         */
        installTo : function(obj) {
            obj.subscribe = subscribe;
            obj.publish = publish;
            obj.unSubscribe=unSubscribe;
        }
    };

}());



// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function(fmt)
{ //author: meizz
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}



 
Date.parse=function(str){
    str = str.replace(/-/g,"/");

    return new Date(str );

}

// Generate a pseudo-GUID by concatenating random hexadecimal.
function GUID() {
    var S4=function(){
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
};

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
