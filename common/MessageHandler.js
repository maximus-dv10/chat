/* 
 * Default protocol and message handler
 */

Rose.MessageHandler = (function (protocol){
    this.protocol = protocol;
});
/**
 * 
 */
Rose.MessageHandler.prototype = {
    handle: function (connection , message){
        
        Rose.callIf(this.protocol, 'beforeMessage', this , [connection, message]);
        var result = Rose.callIf(this.protocol, 'on' + message.type, this, [connection, message]);
        Rose.callIf(this.protocol, 'afterMessage', this, [connection, message, result]);
        
    }
};
/**
 * 
 */
Rose.DefaultProtocol = {
    beforeMessage: function (connection, message){},
    afterMessage: function (connection, message,result){}
};