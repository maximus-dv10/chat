"use strict";

var Chat = {};
Chat.Connection;
Chat.FE = {};
Chat.FE.Screens = {
    defaultScreen: 'Loginbox',
    Templates : new TemplateStorage({
        message: '/chat/fe-chat/templates/message.tpl',
        loginbox: '/chat/fe-chat/templates/loginbox.tpl',
        content: '/chat/fe-chat/templates/content.tpl'
    }),
    
    /**
     * Clear body
     */
    clear: function (){
        $('body').empty();
    },
    changeScreen: function (screen){
        this.clear();
        if(_.has(Chat.FE.Screens, screen)){
            Chat.FE.Screens[screen].init.call(Chat.FE.Screens[screen]);
        }
    }
};
/**
 * Login box screen
 */
Chat.FE.Screens.Loginbox = {
    init: function (){
        var $loginbox = $(Chat.FE.Screens.Templates.render('loginbox', {
                            
                       }));
        // apply DOM events               
        $loginbox.on('click','button', function (){
            
        });
                       
        $('body').append($loginbox);
    }, 
    getProtocol: function (){
        return {
            
        };
    }
};

$(function (){

    new Rose.MessageHandler(Rose.DefaultProtocol);
    /**
     * Chat UI
     */
    var $content = $('#content');
    var $messagesList = $('#content ul.list');

    $('body').on('chat.error', function (){
        $content.html('Error: Server is down');
    });
    $('body').on('chat.opened', function (){
        $content.html('Connection opened');
    });
    
    // new text message
    $('body').on('chat.incoming.text', function (e, data){
        var $message = $(Chat.FE.Templates.render('message', {
                            message: data
                       }));
        $messagesList.append($message);
    });

    var connection = new Rose.Connection({
        onerror : function (error){$('body').trigger('chat.error');},
        onopen : function (){$('body').trigger('chat.opened');},
        onmessage : function (message){$('body').trigger('chat.incoming', message);$('body').trigger('chat.incoming.' + message.type, message);},
        onnowebsocket : function (){$('body').trigger('chat.nosockets');}
    });
    
});
