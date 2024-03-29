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
    this.mids = 1;
    this.history = new Chat.History();
});
Chat.ClientsPool.prototype = {
    create: function (request){
        var client = new Chat.Client(request, this);
        client.setIndex(this.add(client));
        client.setID(this.ids++);
        var that = this;
        client.connection.on('close', function(connection) {
            that.remove(client.profile.id);
        });
        return client;
    },
    broadcast: function (message, noneId){
        var D = new Date();
        message.date = D;
        message.id = this.mids++;
        
        this.clients.each(function (c){
            if(! c instanceof Chat.Client) {return;}
            if(c.profile.id != noneId){
                c.connection.sendMessage(message);
            }
        });
        
    },
    get: function (){
        var users = [];
        this.clients.each(function (c){
            users.push(c.profile);
        });
        return users;
    },
    add: function (client){
        return this.clients.push(client)-1;
    },
    remove: function (ID){
        
        var client = false;
        var _this = this;
        this.clients.each(function (c, index){
            if(c.profile.id == ID){
                client = _this.clients.splice(index, 1);
                return false;
            }
        });
        
        this.broadcast({
                    type:'LeftUser',
                    user: client.profile,
                    user_id: ID
                });
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
                    user: this.profile
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
            history: this.pool.history.get(),
            users: this.pool.get()
        };
    },
    onText: function (message){
        message.author = this.profile;
        this.pool.history.add(message);
        this.pool.broadcast(message, this.profile.id);
    }
    
});

Chat.Client = (function (request, pool){
    var _this = this;
    
    this.pool = pool;
    this.handler = false;
    this.setProtocol(GuestProtocol);
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
//        try {
            var jmes = JSON.parse(message.utf8Data);
            
            console.log(typeof(jmes.type));
            
            if( typeof(jmes.type) == 'undefined'){
                console.log('Message is not valid: ', jmes.type);
                return;
            }else
            // here is message handling
            if(_this.handler.onmessage.call(_this, jmes)!==false){
                
            }
//        } catch (e) {
//            console.log('Message is not valid: ', e);
//            return;
//        }
        
    });
});
Chat.Client.prototype = {
    setProtocol: function (protocol){
        this.handler = new Rose.MessageHandler(protocol);
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