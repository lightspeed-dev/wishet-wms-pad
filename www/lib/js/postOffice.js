/**
 核心为一个邮局协议，其他模块通过这个邮局进行订阅与发布消息
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

    /*
     *返回对应的对象，
     */
    return {
        channels : {
        },
        publish : publish,
        subscribe : subscribe,
        /**
         *  将消息安装到obj对象上，这样obj对象即为当前的工作上下文，等效于subscribe中的owner代理
         * @param {Object} obj
         */
        installTo : function(obj) {
            obj.subscribe = subscribe;
            obj.publish = publish;
        }
    };

}());