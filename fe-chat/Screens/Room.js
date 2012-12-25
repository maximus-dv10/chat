/**
 * Main room screen and Protocol
 */
Chat.FE.Screens.Loginbox = (function (){
    this.$content = false;
    this.$list = false;
    this.initLayout();
});

Chat.FE.Screens.Loginbox.prototype = {
    initLayout : function (){
        
        // render template
        this.$content = $(Chat.FE.Screens.Templates.render('content', {}));
        
        // apply DOM events               
        this.$loginbox.on('click','button', function (){
            Chat.Connection.sendMessage({
                type:'text'
            });
        });
        // 
        $('body').append(this.$content);
    }, 
    enableLoginButton: function (){
        this.$loginbox.find('button').get(0).removeAttribute('disabled');
    },
    getProtocol : function (){
        
        var _this = this;
        
        return _.extend(Rose.DefaultProtocol , {
            init: function (){
                Chat.Connection.sendMessage({type:'Hello'});
            },
            onAccept: function (message, c){
                _this.enableLoginButton();
            },
            onLogged: function (message, c){
                Chat.FE.Screens.changeScreen('Room');  
            }
        });
    }
};