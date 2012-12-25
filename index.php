<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Simple Chat</title>

        <style>
            * { font-family:tahoma; font-size:12px; padding:0px; margin:0px; }
            p { line-height:18px; }
            div { width:500px; margin-left:auto; margin-right:auto;}
            #content { padding:5px; background:#ddd; border-radius:5px;
                       border:1px solid #CCC; margin-top:10px; }
            #input { border-radius:2px; border:1px solid #ccc;
                     margin-top:10px; padding:5px; width:400px;  }
            #status { width:88px; display:block; float:left; margin-top:15px; }
        </style>
        <!-- Common Libs -->
        <script src="common/jquery-1.8.2.min.js"></script>
        <script src="common/underscore-min.js"></script>
        <!-- Rose Lib -->
        <script src="common/TemplateStorage.js"></script>
        <script src="common/Rose.js"></script>
        <!-- Chat Lib -->
        <script src="common/MessageHandler.js"></script>
        <script src="fe-chat/Connection.js"></script>
        <script src="fe-chat/Chat.js"></script>
        <script src="fe-chat/Screens/Loginbox.js"></script>
        <script src="fe-chat/frontend.js"></script>
    </head>
    <body>
        Initializing...
    </body>
</html>