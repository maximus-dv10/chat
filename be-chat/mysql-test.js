var mysql = require('mysql');

var client = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : ''
});
 
client.connect(); // Устанавливаем соединение
client.query('USE js_chat'); // Выполняем запрос на выбор БД
//  Запрос на вставку
client.query('INSERT INTO users VALUES (null,"test","test","",0);',
    function(err){
        if(err){
            throw err;
        }
        // Запрос на выборку
        client.query('SELECT * FROM users', function(error, result, fields){
            // Если возникла ошибка выбрасываем исключение
            if (error){
                throw error;
            }
            // выводим результат
            console.log(fields);
            console.log(result);
            // Завершаем соединение
            client.end();
        });
    });