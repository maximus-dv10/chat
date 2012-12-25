/**
 * Login box screen and Protocol
 */
Chat.FE.Screens.Loginbox = (function (){
    this.$loginbox = false;
    this.initLayout();
});

Chat.FE.Screens.Loginbox.prototype = {
    initLayout : function (){
        
        // render template
        this.$loginbox = $(Chat.FE.Screens.Templates.render('loginbox', {}));
        
        // apply DOM events               
        this.$loginbox.on('click','button', function (){
            Chat.Connection.sendMessage({
                type:'Login',
                username: this.$loginbox.find('input[name="username"]').val(),
                color: this.$loginbox.find('input[name="username"]').val()
            });
        });
        // 
        $('body').append(this.$loginbox);
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