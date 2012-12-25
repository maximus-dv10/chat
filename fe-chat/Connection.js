/* 
 * ROSE CHAT CONNECTION
 * @author Ezhov Maxim <ezhov.maxim@gmail.com>
 */

Rose.Connection = (function (params){
    
    params = _.defaults( params || {} , {
        onerror : function (error){},
        onopen : function (){},
        onmessage : function (message){},
        onnowebsocket : function (){},
        point:'ws://127.0.0.1:1337'
    });
    
    // proxy events
    this.setEvents(params);
    
    // for further use in closures
    var that = this;
    
    // point of connection, server address
    this.point = params.point;
    
    /**
     * Establish connection
     */
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        console.log('No WebSocket');
        this.onnowebsocket();
        return;
    }
    this.connection = new WebSocket(this.point);
    this.connection.onopen = function () {
        console.log('Connected!');
        that.onopen.call(that);
    };
    this.connection.onerror = function (error) {
        console.log('Error',error);
        that.onerror.call(that, error);
    };
    this.connection.onmessage = function (message) {
        try {
            var jmes = JSON.parse(message.data);
            if(typeof(jmes.type)=='undefined'){
                console.log('Message is not valid: ', message.data);
                return;
            }else
            // here is message handling
            if(that.onmessage.call(that, jmes)!==false){
                console.log('Message is handled successfuly');
            }
        } catch (e) {
            console.log('Message is not valid: ', message.data);
            return;
        }
    };
    
    // default connection for messages
    Rose.Connection.defaultConnection = this.connection;
    
});
Rose.Connection.prototype = {
    setEvents: function (params){
        this.onerror = params.onerror;
        this.onopen = params.onopen;
        this.onmessage = params.onmessage;
        this.onnowebsocket = params.onnowebsocket;
    },
    sendMessage : function (data){
        return this.connection.send(JSON.stringify(data));
    }
};
Rose.Connection.defaultConnection = false;