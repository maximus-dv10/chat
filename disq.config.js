
/**
 * SYSTEM Singleton object
 * Настройки системы комментариев
 */
var SYSTEM = {
    // Пути к шаблонам, относительно корня скрипта
    Templates: {
        comment: 'disq/templates/comment.tpl',
        author_popover: 'disq/templates/author.popover.tpl',
        mypage: 'disq/templates/mypage.tpl',
        profile: 'disq/templates/profile.tpl'
    },
    // Частота загрузки новых событий
    EVENT_SYNC_TIME:100000,
    // Запоминать авторизацию в куках
    REMBER_AUTH_IN_DOMAIN:true,
    // Пути к файлам бэкенда
    URLS: {
        getcomments: 'disq/php/getComments.php',
        sendcomment: 'disq/php/addComment.php', // default development handler
        votefor: 'disq/php/defHandler.php',
        likepage: 'disq/php/defHandler.php',
        getprofile: 'disq/php/getProfile.php',
        getmypage: 'disq/php/getMypage.php',
        getauth: 'disq/php/auth.php',
        logout: 'disq/php/auth.php',
        getevents:'disq/php/getEvents.php'
    },
    // Сообщения в системе
    MESSAGES:{
        auth_cookie:'disq_auth_token',
        emptycommentbody:'Нельзя отправить пустой комментарий',
        requestfailed:'Неизвестный сбой в системе транспорта',
        noauthorized: 'Нужно авторизоваться в системе',
        newcommentsbutton:'Показать новые <b>%num</b> комментария'
    },
    // Сортировка по-умолчанию
    COMMENTS_ORDER: 'asc',
    // Вывод комментариев на страницу
    COMMENTS_ONPAGE: 5,
    // Как часто обновлять относительное время внутри комментария
    RELATIVE_TIMES_UPDATE: 1000,
    // Конфигурация относительного времени:
    // [мин секунд включительно,макс секунд,сообщение]
    RELATIVE_TIMES:[[0,5,'около 5 секунд назад'],[5,20,'около 20 секунд назад'],[20,60,'несколько секунд назад'],[60,320,'несколько минут назад'], ['давно']],
    
    
    // НЕ ТРОГАТЬ!
    COMMENTS_LIST:false,
    D: function (data){
        return _.extend(data||{} , {_REF:HTTP_REFERER});
    }
};

/**
 * Базовый пользователь системы. Гост.
 */
var CURRENT_USER = {
    id:0, // если 0 - значит неавторизован
    name:'Stranger', // имя гостя
    avatar:'disq/img/noavatar.jpg', // аватар гостя
    votes:0,
    comments:0,
    last_visit:0,
    bio: 'You are just a stranger' // Биография гостя
};