var Rose = require('../common/MessageHandler.js');
var _ = require('../common/underscore-min.js');
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
    // increment of connection id
    this.ids = 1;
    this.history = new Chat.History();
});
Chat.ClientsPool.prototype = {
    create: function (request){
        var client = new Chat.Client(request, this);
        client.setIndex(this.add(client));
        client.setID(this.ids++);
        var that = this;
        client.connection.on('close', function(connection) {
            that.remove(client.index);
        });
        return client;
    },
    broadcast: function (message, noneId){
        var D = new Date();
        message.date = D;
        for(var i in this.clients){
            var c = this.clients[i];
            
            if(c.profile.id != noneId){
                c.connection.sendMessage(message);
            }
        }
    },
    get: function (){
        
    },
    add: function (client){
        return this.clients.push(client)-1;
    },
    remove: function (index){
        var client = this.clients.splice(index, 1);
        this.broadcast({
                    type:'LeftUser',
                    user: client.profile,
                    date: D
                }, client.profile.id);
    }
};

var GuestProtocol = _.extend(Rose.DefaultProtocol , {
    init: function (){
    },
    onHello: function (message, c){
        return {
            type:'Accept'
        };
    },
    onLogin: function (message, c){
        this.profile.username = message.username;
        this.profile.color = message.color;
        
        // broadcast event
        this.pool.broadcast({
                    type:'NewUser',
                    user: this.profile,
                    date: D
                }, this.profile.id);
                
        this.setProtocol(RoomProtocol);         
                
        return {
            type:'Logged'
        };
    }
});

var RoomProtocol = _.extend(Rose.DefaultProtocol , {
    init: function (){
    },
    onGetInfo: function (message, c){
        
        return {
            type:'Wellcome',
            history: History.get(),
            users: []
        };
    },
    onText: function (message){
        this.broadcast(message, this.profile.id);
    }
    
});

Chat.Client = (function (request, pool){
    var _this = this;
    
    this.pool = pool;
    this.handler = false;
    // default profile
    this.profile = {
        id:0,
        username:'Anonymus',
        avatar:'',
        color: 'black'
        };
        
    // get connection
    this.connection = request.accept(null, request.origin);
    this.connection.sendMessage = function (data){
        _this.connection.sendUTF(JSON.stringify( data ));
    };
    
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
            
            console.log(typeof(jmes.type));
            
            if( typeof(jmes.type) == 'undefined'){
                console.log('Message is not valid: ', jmes.type);
                return;
            }else
            // here is message handling
            if(_this.handler.onmessage.call(_this, jmes)!==false){
                console.log('Message is handled successfuly');
            }
        } catch (e) {
            console.log('Message is not valid: ', e);
            return;
        }
        
    });
    this.setProtocol(GuestProtocol);
});
Chat.Client.prototype = {
    setProtocol: function (protocol){
        this.handler = protocol;
    },
    setID : function (id){
        this.profile.id = id;
    },
    setIndex: function (index){
        this.index = index;
        
        console.log((new Date()) + ' Connection accepted. New INDEX  = ' + index);
    }
};

module.exports = new Chat.ClientsPool();