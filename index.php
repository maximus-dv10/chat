<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Simple Chat</title>

        <style>
            * { font-family:tahoma; font-size:12px; padding:0px; margin:0px; }
            p { line-height:18px; }
            #input { border-radius:2px; border:1px solid #ccc;
                     margin-top:10px; padding:5px; width:400px;  }
            
            .messages.list li {
              list-style: none;
            }
            
            .color-red {color:red}
            .color-green {color:green}
            .color-blue {color:blue}
            .color-magenta {color:magenta}
            .color-purple {color:purple}
            .color-plum {color:plum}
            .color-orange {color:orange}
            
            span.author-name {clear:both;}
        </style>
        <link href="bootstrap/css/bootstrap.min.css" rel="stylesheet" media="screen">
        <!-- Common Libs -->
        <script src="common/jquery-1.8.2.min.js"></script>
        <script src="common/underscore-min.js"></script>
        <script src="bootstrap/js/bootstrap.min.js"></script>
        <!-- Rose Lib -->
        <script src="common/TemplateStorage.js"></script>
        <script src="fe-chat/nodejsEmulate.js"></script>
        <script src="common/Rose.js"></script>
        <!-- Chat Lib -->
        <script src="common/MessageHandler.js"></script>
        <script src="fe-chat/Connection.js"></script>
        <script src="fe-chat/Chat.js"></script>
        <script src="fe-chat/Screens/Loginbox.js"></script>
        <script src="fe-chat/Screens/Room.js"></script>
        <script src="fe-chat/frontend.js"></script>
        
    </head>
    <body>
        Initializing...
    </body>
</html>