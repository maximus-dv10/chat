/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var Chat = {};
Chat.Connection = {};
Chat.FE = {};
Chat.FE.Protocol = {
    _current: false,
    set: function (protocol){
        Chat.FE.Protocol._current = protocol;
        Chat.Connection.setEvents(protocol);
        
        console.log('New PROTOCOL setuped', protocol);
    }
};
Chat.FE.Screens = {
    defaultScreen: 'Loginbox',
    Templates : new TemplateStorage({
        message: '/chat/fe-chat/templates/message.tpl',
        loginbox: '/chat/fe-chat/templates/loginbox.tpl',
        content: '/chat/fe-chat/templates/content.tpl'
    }),
    currentScreen: false,
    /**
     * Clear body
     */
    clear: function (){
        $('body').empty();
    },
    changeScreen: function (screen){
        this.clear();
        if(_.has(Chat.FE.Screens, screen)){
            
            Chat.FE.Screens.currentScreen = new Chat.FE.Screens[screen];
            Chat.FE.Protocol.set(new Chat.FE.MessageHandler(Chat.FE.Screens.currentScreen.getProtocol()));
        }
    }
};

Chat.FE.MessageHandler = function (protocol){
    Rose.MessageHandler.call(this, protocol);
    
    this.onerror = function (error){};
    this.onopen = function (){};
    this.onnowebsocket = function (){
        $('body').html('<h1 class="no-support">There is no WebSocket support in your browser</h1>');
    };
}

Rose.extend(Chat.FE.MessageHandler, Rose.MessageHandler, {
    
});