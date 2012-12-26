/**
 * Main room screen and Protocol
 */
Chat.FE.Screens.Room = (function (){
    this.$content = false;
    this.$list = false;
    this.$userlist = false;
    this.$memo = false;
    this.mid = 0;
    this.user = {
        id:'self',
        username:'ME'
    };
    this.initLayout();
});

Chat.FE.Screens.Room.prototype = {
    initLayout : function (){
        var _this = this;
        // render template
        this.$content = $(Chat.FE.Screens.Templates.render('content', {}));
        this.$list = this.$content.find('ul.list');
        this.$userlist = this.$content.find('ul.user-list');
        this.$memo = this.$content.find('textarea');
        // apply DOM events               
        this.$content.on('click','button', function (){
            Chat.Connection.sendMessage({
                type:'Text',
                content:_this.$memo.val()
            });
            
            _this.addMessage({
                id:'my-' + (_this.mid++),
                content:_this.$memo.val(),
                author: _this.user
            });
            _this.$memo.val('');
        });
        // 
        $('body').append(this.$content);
    }, 
    addMessage: function (data){
        var $message = $(Chat.FE.Screens.Templates.render('message', {
                            message: data
                       }));
        this.$list.append($message);
    },
    addUser: function (data){
        var $message = $(Chat.FE.Templates.render('user', {
                            user: data
                       }));
        this.$list.append($message);
    },
    getProtocol : function (){
        
        var _this = this;
        
        return _.extend(Rose.DefaultProtocol , {
            init: function (){
                Chat.Connection.sendMessage({type:'GetInfo'});
            },
            onWellcome: function (message, c){
                message.history.each(function (mes){
                    _this.addMessage(mes);
                });
                message.users.each(function (mes){
                    _this.addMessage(mes);
                });
            },
            onText: function (message, c){
                _this.addMessage(message);
            }
        });
    }
};