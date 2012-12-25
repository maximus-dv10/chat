var Chat = {};

Chat.History = (function (){
    this.messages = [];
});

Chat.History.prototype = {
    add: function (obj){
        this.messages.push(obj);
        this.messages = this.messages.slice(-100);
    },
    get: function (){
        return this.messages;
    }
}

Chat.ClientsPool = (function (){
    this.clients = [];
});
Chat.ClientsPool.prototype = {
    create: function (request){
        var client = new Chat.Client(request);
        client.setIndex(this.add(client));
        var that = this;
        client.connection.on('close', function(connection) {
            that.remove(client.index);
        });
        return client;
    },
    add: function (client){
        return this.clients.push(client)-1;
    },
    remove: function (index){
        this.clients.splice(index, 1);
    }
};


Chat.Client = (function (request){
    var _this = this;
    // get connection
    this.connection = request.accept(null, request.origin);
    
    this.onmessage = function (){};
    // save in pool
    this.index = -1;
    // handling incoming messages
    this.connection.on('message', function(message) {
        console.log((new Date()) + ' message ', message);
        // only UTF-8 messages
        if(message.type != 'utf8'){
            return;
        }
        // handle message
        try {
            var jmes = JSON.parse(message.utf8Data);
            if(typeof(jmes.type)=='undefined'){
                console.log('Message is not valid: ', message.data);
                return;
            }else
            // here is message handling
            console.log('Handling message');
            if(_this.onmessage.call(_this, jmes)!==false){
                console.log('Message is handled successfuly');
            }
        } catch (e) {
            console.log('Message is not valid: ', message.data);
            return;
        }
        
    });
    
});
Chat.Client.prototype = {
    setIndex: function (index){
        this.index = index;
        
        console.log((new Date()) + ' Connection accepted. New INDEX  = ' + index);
    }
};

module.exports = new Chat.ClientsPool();