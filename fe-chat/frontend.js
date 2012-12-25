"use strict";

/**
 *  0. 
 *     Connect
 *     > hello-message
 *     < accepted {index}
 *     -- render loginbox
 *     
 *     > login
 *     < ok
 *     -- change screen
 *
 */

$(function (){

    
//    // new text message
//    $('body').on('chat.incoming.text', function (e, data){
//        var $message = $(Chat.FE.Templates.render('message', {
//                            message: data
//                       }));
//        $messagesList.append($message);
//    });

    // create connection
    Chat.Connection = new Rose.Connection({
        point:'ws://127.0.0.1:1337'
    });
    
    Chat.FE.Screens.changeScreen(Chat.FE.Screens.defaultScreen);  
    
});
