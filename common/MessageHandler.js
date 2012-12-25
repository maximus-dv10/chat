/* 
 * Default protocol and message handler
 */

Rose.MessageHandler = (function (protocol){
    var _this = this;
    
    this.protocol = protocol;
    
    
    this.onerror = function (error){};
    this.onopen = function (){};
    this.onnowebsocket = function (){};
    
    this.onmessage = function (message){
        _this.handle(message, this.connection);
    };
    
    this.protocol.init();
});
/**
 * 
 */
Rose.MessageHandler.prototype = {
    
    handle: function (connection , message){
        
        Rose.callIf(this.protocol, 'beforeMessage', this , [connection, message]);
        var result = Rose.callIf(this.protocol, 'on' + message.type, this, [message, connection]);
        Rose.callIf(this.protocol, 'afterMessage', this, [connection, message, result]);
        
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