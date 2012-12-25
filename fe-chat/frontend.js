"use strict";

$(function (){


    // INIT CHAT
    Chat.Connection = new Rose.Connection({
        point:'ws://127.0.0.1:1337',
        onopen: function (){
            Chat.FE.Screens.changeScreen(Chat.FE.Screens.defaultScreen);  
        }
    });
    
    
});
