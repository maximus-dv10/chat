/* 
 * Default protocol and message handler
 */
if(!Rose){
    var Rose = require('../common/Rose.js');
}
if(!_){
    var _ = require('../common/underscore-min.js');
}
Rose.MessageHandler = (function (protocol){
    var _this = this;
    
    this.protocol = protocol;
    
    
    this.onerror = function (error){};
    this.onopen = function (){};
    this.onnowebsocket = function (){};
    
    this.onmessage = function (message){
        var result = _this.handle(this.connection, message, this);
        if(_.isObject(result) && typeof(result.type) !== 'undefined'){
            this.connection.sendMessage(result);
        }
    };
    
});
/**
 * 
 */
Rose.MessageHandler.prototype = {
    
    handle: function (connection , message, context){
        Rose.callIf(this.protocol, 'beforeMessage', context , [connection, message]);
        var result = Rose.callIf(this.protocol, 'on' + message.type, context, [message, connection]);
        Rose.callIf(this.protocol, 'afterMessage', context, [connection, message, result]);
        return result;
    }
};
/**
 * 
 */
Rose.DefaultProtocol = {
    init: function (){},
    
    //
    
    beforeMessage: function (connection, message){},
    afterMessage: function (connection, message,result){}
};

module.exports = Rose;