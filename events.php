<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Events Test</title>
        
        <script src="common/jquery-1.8.2.min.js"></script>
        <script src="common/underscore-min.js"></script>
        <script>
          $(function (){
            
            $('body').on('custom.test', function (event, params){
                console.log(params, event);
            });
            
            $('body').trigger('custom.test', {test:1,b:2,c:[1,2,3,4]});
            
          });
        </script>
    </head>
    <body>
    </body>
</html>