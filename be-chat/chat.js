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
    
    // get connection
    this.connection = request.accept(null, request.origin);
    // save in pool
    this.index = -1;
    //
    this.connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name
                // remember user name
                userName = htmlEntities(message.utf8Data);
                // get random color and send it back to the user
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify({
                    type:'color', 
                    data: userColor
                }));
                console.log((new Date()) + ' User is known as: ' + userName
                    + ' with ' + userColor + ' color.');

            } else { // log and broadcast the message
                console.log((new Date()) + ' Received Message from '
                    + userName + ': ' + message.utf8Data);
                
                // we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    text: htmlEntities(message.utf8Data),
                    author: userName,
                    color: userColor
                };
                history.push(obj);
                history = history.slice(-100);

                // broadcast message to all connected clients
                var json = JSON.stringify({
                    type:'message', 
                    data: obj
                });
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }
            }
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