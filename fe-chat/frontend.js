"use strict";

$(function (){

    
//    // new text message
//    $('body').on('chat.incoming.text', function (e, data){
//        var $message = $(Chat.FE.Templates.render('message', {
//                            message: data
//                       }));
//        $messagesList.append($message);
//    });

    // INIT CHAT
    Chat.Connection = new Rose.Connection({
        point:'ws://127.0.0.1:1337',
        onopen: function (){
            Chat.FE.Screens.changeScreen(Chat.FE.Screens.defaultScreen);  
        }
    });
    
    
});
