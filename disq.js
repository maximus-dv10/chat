function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Связь между ДОМ и свойствами объекта
 */
function BindViewDOM (obj, settings){
    // default settings for Binding View
    settings = _.defaults(settings || {}, {
        container:'body',
        bindings:[],
        toggles:[]
    });
   
    obj.prototype.domViewSettings = settings;
    obj.prototype.syncView = function (){
        var _this = this;
        
        var F = function (v){
            if(_.isFunction(v))
                return v.call(_this);
            return v;
        }
        _.each(this.domViewSettings.bindings, function (val){
            var $container = this.get$Container();
            $container.find(F(val[0])).eq(0).html( eval('('+(val[1]).replace('this','_this')+')') );
        }, this);
        
        _.each(this.domViewSettings.toggles, function (val){
            var $container = this.get$Container();
            if(eval('('+(val.condition).replace('this','_this')+')'))
                $container.find(F(val.selector)).eq(0).addClass( val.toggleClass );
            else
                $container.find(F(val.selector)).eq(0).removeClass( val.toggleClass );
        }, this);
    }
}

/**
 * Хранилище темплейтов
 */
function TemplateStorage(data) {
    this.templates = data;
}
TemplateStorage.prototype.getTmpl = function (template){
    if(_.isFunction(this.templates[template]))
        return this.templates[template];
    if(_.has(this.templates, template)){
        $.ajax(this.templates[template], {
            async:false,
            method:'get',
            context:this
        }).done(function (rsp){
            this.templates[template] = _.template(rsp);
        });
        return this.templates[template];
    }
    return false;
}
TemplateStorage.prototype.render = function (template, data){
    data = data || {};
    var tpl = this.getTmpl(template);
    if(tpl)
        return tpl(data);
    
    return '';
}

var GUEST_USER = CURRENT_USER;

/**
 * Error Handling
 */
function showErrorMessage(message){
    $alert = $('.alert.error');
    $alert.find('span').html(message);
    $alert.show();
    $alert.effect("pulsate", {
        times:2
    }, 300);
}

/**
 * 
 *
 */
function Comment(data, parent){
    // current date
    var d = new Date;
    // parent node;
    this.parentComment = parent || '#post-list';
    // current node
    this.$comment = false;
    // default data
    if(_.isObject(data)){
        data = _.defaults( data || {}, {
            id:'post-'+getRandomInt(9999, 99999)+'-notsaved', // random ID inside GUI
            uid:0,
            pid:'',
            body:'',
            time:Math.ceil(d.getTime()/1000),
            likes:0,
            dislikes:0,
            myVote:0,
            author: CURRENT_USER,
            children:[]
        });
        this.modelData = data;
    }
    this.appendToParent();
}
/**
 * Связывание значений объекта с ДОМ
 */
BindViewDOM(Comment, {
    container:'',
    bindings:[
    ['.post-content > .post-body > footer > menu > .voting > .vote-up > span.count','this.modelData.likes'],
    ['.vote-down span.count:first','this.modelData.dislikes']
    ],
    toggles:[{
        condition:'this.modelData.dislikes == 0',
        selector:'.voting a.vote-down .count',
        toggleClass:'count-0'
    }]
});
Comment.prototype.newRecievedReply = function (){
    
    var $countSpan = this.$comment.find('footer .realtime span.replies-count').eq(0);
    $countSpan.html(parseInt($countSpan.html())+1);
    
    var $a = this.$comment.find('footer .realtime a.btn').eq(0).show().css('right','0px');
    var $ind = this.$comment.find('footer .realtime a.btn span.indicator').eq(0).css('width','4px');
    
}
Comment.prototype.get$Container = function (){
    return this.$comment;
}
Comment.prototype.getJson = function (){
    return $.toJSON(this.modelData);
}
/**
 * Отправка комментария на сервер
 */
Comment.prototype.sendComment = function (){
    var _this = this;
    $.post(SYSTEM.URLS.sendcomment, SYSTEM.D({
        Comment:this.getJson(),
        authorId:CURRENT_USER.id
    })).done(function (rsp){
        var rsp = eval('('+rsp+')');
        if(rsp.errorCode ==0){
            _this.modelData.id = rsp.id;
            _this.modelData.uid = rsp.uid;
            _this.$comment.attr('id',rsp.id);
        }
    });
}
Comment.prototype.createChildren = function (){
    _.each(this.modelData.children, function (post){
        
        SYSTEM.COMMENTS_LIST.addComment(post, this.$comment.children('ul.children'));
    }, this);
}
Comment.prototype.updateRelativeTime = function (){
    var d = new Date;
    var timeDiff =  Math.ceil( (d.getTime()/1000) ) - this.modelData.time;
    var text = '';
        
    for(var key in SYSTEM.RELATIVE_TIMES){
        var T = SYSTEM.RELATIVE_TIMES[key]; // shortness
            
        if(_.isString(T[0]) ||
            (timeDiff >= T[0] && timeDiff < T[1])
            ){
            text = _.isString(T[0])?T[0]:T[2];
            break;
        }
    }
        
    this.$comment.find('.time-ago').eq(0).html(text);
}
/**
 * Обновление кол-ва голосов с сервера
 */
Comment.prototype.updateVotes = function (){
    var _this = this;
    $.get(SYSTEM.URLS.updatevotes, SYSTEM.D({
        commentId:this.modelData.uid
    }), function (rsp){
        var json_rsp = eval('('+rsp+')');
        if(json_rsp.commentId == _this.modelData.uid){
            _this.modelData.likes = json_rsp.likes;
            _this.modelData.dislikes = json_rsp.dislikes;
        }
    });
}
/**
 * Голосование по комментарию
 * Учитывает, если пользователь уже голосовал
 */
Comment.prototype.voteFor = function (mark){
    var dislike = {
        controlClass:'vote-down',
        controlActiveClass:'downvoted',
        voteMark: -1,
        voteFieldName:'dislikes'
    };
    var like = {
        controlClass:'vote-up',
        controlActiveClass:'upvoted',
        voteMark: 1,
        voteFieldName:'likes'
    };
    
    if(mark==-1)
        var CFG = {
            c:dislike, 
            o:like
        };
    else
        var CFG = {
            c:like, 
            o:dislike
        };
    
    // not voted yet
    if(this.modelData.myVote == 0){
        this.$comment.find('.voting a.'+CFG.c.controlClass).eq(0).addClass(CFG.c.controlActiveClass).parent().addClass(CFG.c.controlActiveClass);
        this.modelData.myVote = CFG.c.voteMark;
        this.modelData[CFG.c.voteFieldName] += 1;
    }else
    // aleady voted same
    if(this.modelData.myVote == CFG.c.voteMark){
        this.$comment.find('.voting a.'+CFG.c.controlClass).eq(0).removeClass(CFG.c.controlActiveClass).parent().removeClass(CFG.c.controlActiveClass);
        this.modelData.myVote = 0;
        this.modelData[CFG.c.voteFieldName] -= 1;
    }else 
    // already voted up
    if(this.modelData.myVote == CFG.o.voteMark){
        
        this.$comment.find('.voting a.'+CFG.o.controlClass).eq(0).removeClass(CFG.o.controlActiveClass).parent().removeClass(CFG.o.controlActiveClass);
        this.$comment.find('.voting a.'+CFG.c.controlClass).eq(0).addClass(CFG.c.controlActiveClass).parent().addClass(CFG.c.controlActiveClass);
        
        this.modelData.myVote = CFG.c.voteMark;
        this.modelData[CFG.c.voteFieldName] += 1;
        this.modelData[CFG.o.voteFieldName] -= 1;
    }
    this.syncView();
    var _this = this;
    $.post(SYSTEM.URLS.votefor, SYSTEM.D({
        commentId:this.modelData.uid,
        userId:CURRENT_USER.id,
        vote:this.modelData.myVote
    }), function (rsp){
        var json_rsp = eval('('+rsp+')');
        if(json_rsp.commentId == _this.modelData.uid){
            _this.modelData.likes = json_rsp.likes;
            _this.modelData.dislikes = json_rsp.dislikes;
        }
    });
}
Comment.prototype.appendToParent = function (){
    // render comment template
    this.$comment = $(SYSTEM.Templates.render('comment', {
        post:this.modelData,
        _REF: HTTP_REFERER
    }));
    // mark as new
    if(_.has(this.modelData, 'isnew')){
        this.$comment.addClass('new');
    }
    // binding
    this.domViewSettings.container = this.$comment;
    // update reletive time
    this.updateRelativeTime();
    
    // local var for closures
    var _COMMENT = this;
    
    (function setParent(){
        _COMMENT.$comment.CommentModel = _COMMENT;
    })();
    
    // attach to DOM
    var DOM_Parent = _.isString(this.parentComment)?$(this.parentComment).eq(0):this.parentComment.eq(0);
    
    // sort order
    SYSTEM.COMMENTS_LIST.insertCommentIntoContainer(DOM_Parent,this.$comment);
    
    /**
     *=================
     * ATTACH EVENTS
     * ================
     */
    // recieved reply
    this.$comment.find('footer .realtime a.btn').eq(0).click(function (){
        _COMMENT.$comment.find('.post.new').show().effect("highlight", {}, 500).removeClass('new');
        _COMMENT.$comment.find('footer .realtime span.replies-count').eq(0).html(0);
        _COMMENT.$comment.find('footer .realtime a.btn span.indicator').eq(0).css('width','300px');
        _COMMENT.$comment.find('footer .realtime a.btn').eq(0).css('right','-300px');
        _COMMENT.$comment.find('footer .realtime a.btn').hide();
    });
    
    // collapse\expand:
    this.$comment.find('.post-menu .collapse a').eq(0).click(function (){
        _COMMENT.$comment.addClass('collapsed');
        $(this).parent().hide();
        _COMMENT.$comment.find('.post-menu .expand').show();
    });
    this.$comment.find('.post-menu .expand a').eq(0).click(function (){
        _COMMENT.$comment.removeClass('collapsed');
        $(this).parent().hide();
        _COMMENT.$comment.find('.post-menu .collapse').show();
    });
    
    this.$comment.find('a.profile-show').eq(0).click(function(e){
        var uid = $(this).data('user');
        if(uid){
            new UserProfile(uid);
        }
    });
    // avatar popover:
    this.$comment.find('.hovercard').eq(0).hover(function(e){
        var $this = $(this);
        
        if(e.type=='mouseenter'){
            $this.append(SYSTEM.Templates.render('author_popover', _COMMENT.modelData));
        }else
            $this.find('.tooltip-outer').detach();
        
    });
    
    // reply:
    this.$comment.find('li.reply a').eq(0).on('click',function (){
        var $children = _COMMENT.$comment.find('ul.children').eq(0);
        // if already exists - just focus on
        if($children.find('form').eq(0).length > 0){
            $children.find('form textarea').eq(0).focus();
            return;
        }
        // deep clone into children
        var $clonedForm = $('#form .reply').clone(true);
        $clonedForm.find('.alert').detach();
        $children.prepend($clonedForm)
        .find('form').unbind('submit').submit(function (){
            if(CURRENT_USER.id == 0){
                showErrorMessage(SYSTEM.MESSAGES.noauthorized);
                return false;
            }
        
            var $text = $(this).find('.textarea-wrapper textarea').eq(0);
        
            if($text.val().trim().length==0){
                showErrorMessage(SYSTEM.MESSAGES.emptycommentbody);
                return false;
            }
        
            $(this).parents('.reply').detach();
            SYSTEM.COMMENTS_LIST.sendComment({
                body:$text.val(),
                pid:_COMMENT.modelData.id
                },_COMMENT.$comment.find('ul.children'));
            
            return false;
        });
    });
    
    // like
    this.$comment.find('.voting a.vote-up').eq(0).on('click',function (){
        _COMMENT.voteFor(1);
    });
    
    // dislike
    this.$comment.find('.voting a.vote-down').eq(0).on('click',function (){
        _COMMENT.voteFor(-1);
    });
    
    // update relative timer
    this.timeUpdate = setInterval(function (){
        _COMMENT.updateRelativeTime();
    }, SYSTEM.RELATIVE_TIMES_UPDATE);
    
    // создание дочерних комментариев
    this.createChildren();
    
    // actualize info
    this.syncView();
}


/**
 * 
 * 
 */
function CommentsList (selector,options){
    this.$commentsList = $(selector);
    this.options = _.defaults(options||{}, {
        order:SYSTEM.COMMENTS_ORDER,
        onpage:SYSTEM.COMMENTS_ONPAGE,
        offset:0
    });
    this.lcData = {};
    this.commentsObjs = [];
}
/**
 * Связывание значений объекта с ДОМ
 */
BindViewDOM(CommentsList, {
    bindings:[
    ['[data-role="like-count"]','this.lcData.pageLiked'],
    ['h4 span#comment-total','this.lcData.commentsTotal']
    ]
});
CommentsList.prototype.get$Container = function (){
    return this.$commentsList;
}
CommentsList.prototype.setPageLiked = function (isLiked){
    $.get(SYSTEM.URLS.likepage, SYSTEM.D({
        state:isLiked, 
        userId:CURRENT_USER.id
    }));
}
/**
 * Подключаем события ДОМ к списку
 */
CommentsList.prototype.applyDOMEvents = function (){
    var _this = this;
    if(this.lcData.likedWithUser == 1)
        this.$commentsList.find('a[data-action="upvote"]').addClass('active');
    
    this.$commentsList.find('.textarea-wrapper textarea').css('overflow','hidden').autogrow();
    
    this.$commentsList.find('.textarea-wrapper textarea').on('focus',function (){
        $(this).parents('.reply').addClass('expanded');
    });
    
    // SORTING
    this.$commentsList.find('[data-action="sort"]').click(function (e){
        _this.lcData.order = $(this).data('sort');
        var DIR = $(this).data('sort')=='asc'?-1:1;
        
        _this.$commentsList.find('ul.post-list,ul.children').each(function (){
            var $this = $(this);
            var items = $this.children('li');
            
            items.sort(function(a,b){
                var chA = _this.findCommentModel($(a).attr('id')).modelData.time;
                var chB = _this.findCommentModel($(b).attr('id')).modelData.time;
                if (chA < chB) return -1 * DIR;
                if (chA > chB) return 1 * DIR;
                return 0;
            });
            
            
            var clonedUl = $this.clone(true).empty();
            var ul = $this;
//            var orderedItems = [];
            $.each(items, function(i, li){
                clonedUl.append( SYSTEM.COMMENTS_LIST.findCommentModel($(li).attr('id')).$comment );
            });
            
            ul.replaceWith(clonedUl);
        });
    }); 
    
    // SEND COMMENT
    this.$commentsList.find('form.send-comment').submit(function (e){
        if(CURRENT_USER.id == 0){
            showErrorMessage(SYSTEM.MESSAGES.noauthorized);
            return false;
        }
        
        var $text = $(this).find('.textarea-wrapper textarea').eq(0);
        
        if($text.val().trim().length==0){
            showErrorMessage(SYSTEM.MESSAGES.emptycommentbody);
            return false;
        }
        
        _this.sendComment($text.val());
        $(this).parents('.reply').removeClass('expanded');
        $text.val('');
        return false;
    });
    
    // PAGE LIKE\UNLIKE
    this.$commentsList.find('a[data-action="upvote"]').on('click',function (){
        var $this = $(this);
        
        if($this.is('.active')){
            // сейчас активен, становится не активным
            _this.setPageLiked(false);
        }else{
            // сейчас неактивен, становится активным
            _this.setPageLiked(true);
        }
        
    });

    this.$commentsList.find('#newComments').click(function (){
        _this.showNewComments();
    });
    
//    if(this.lcData.commentsTotal > this.commentsObjs.length)
//        this.$commentsList.find('.load-more').show();
}
CommentsList.prototype.renderComments = function (comments){
    _.each(comments, function (data){
        this.commentsObjs.push(new Comment(data));
    },this);
    // populate view with data
    this.syncView();
}
/**
 *
 */
CommentsList.prototype.insertCommentIntoContainer = function (DOM_Parent,$comment){
   if($('ul.sortlist li.active a').data('sort')=='desc'){
        DOM_Parent.append($comment);
    }else{
        DOM_Parent.prepend($comment);
    } 
}
/**
 * Отправляет комментарий в основной поток
 */
CommentsList.prototype.sendComment = function (body, parent){
    var c =new Comment(_.isObject(body)?body:{
        body:body
    },parent);
    c.sendComment();
    
    this.commentsObjs.push(c);
    this.lcData.commentsTotal += 1;
    this.syncView();
}
CommentsList.prototype.addComment = function (data, parent){
    this.commentsObjs.push(new Comment(data,parent));
}
CommentsList.prototype.findCommentModel = function (id){
    return _.find(this.commentsObjs, function (comm){
        return comm.modelData.id == id;
    }, this);
}
CommentsList.prototype.showNewComments = function (){
    $('#post-list > li.post.new').show().effect("highlight", {}, 500).removeClass('new');
    $('#newComments').hide();
}
/**
 * Load events
 */
CommentsList.prototype.loadEvents = function (){
    $.ajax(SYSTEM.URLS.getevents , {
        data:SYSTEM.D({
            syncTime:this.lcData.syncTime,
            userId:CURRENT_USER.id
        }),
        dataType:'json',
        async:true,
        method:'get',
        context:this
    }).done(function (rsp){
        if(rsp.errorCode == 0){
            this.lcData.syncTime = rsp.syncTime;
            this.lcData.commentsTotal = rsp.commentsTotal;
            this.lcData.pageLiked = rsp.pageLiked;
            
            _.each(rsp.events, function(event){
                switch(event.type){
                    case('new'):
                        this.addComment(_.extend(event.comment,{
                            isnew:true
                        }));
                        break;
                    case('reply'):
                        this.addComment(_.extend(event.comment,{
                            isnew:true
                        }), $('#'+event.pid+' ul.children').eq(0));
                        var commentModel = this.findCommentModel(event.pid);
                        commentModel.newRecievedReply();
                        break;
                    case('vote'):
                        var commentModel = this.findCommentModel(event.id);
                        commentModel.modelData.likes = event.likes;
                        commentModel.modelData.dislikes = event.dislikes;
                        commentModel.syncView();
                        break;
                }
            }, this);
            
            if(rsp.newComments>0){
                $('#newComments').html(SYSTEM.MESSAGES.newcommentsbutton.replace('%num',rsp.newComments)).fadeIn('fast');
            }
            
            this.syncView();
        }
    });
}
/**
 * Догрузка комментов
 */
CommentsList.prototype.moreComments = function (){
    // loading comments
    var _CL = this;
    $.ajax(SYSTEM.URLS.getcomments , {
        data:SYSTEM.D({
            order:_CL.options.order,
            offset:_CL.options.offset,
            onpage:_CL.options.onpage
        }),
        dataType:'json',
        async:false,
        method:'get',
        context:this
    }).done(function (rsp){
        this.lcData = rsp;
        this.applyDOMEvents();
        this.renderComments(this.lcData.comments);
        
        // @todo: 
        this.syncInterval = setInterval(function (){
            _CL.loadEvents();
        },SYSTEM.EVENT_SYNC_TIME);
    });
}
/**
 * Первичная загрузка комментариев
 */
CommentsList.prototype.loadComments = function (){
    // loading comments
    var _CL = this;
    $.ajax(SYSTEM.URLS.getcomments , {
        data:SYSTEM.D({
            order:_CL.options.order,
            offset:_CL.options.offset,
            onpage:_CL.options.onpage
        }),
        dataType:'json',
        async:false,
        method:'get',
        context:this
    }).done(function (rsp){
        this.lcData = rsp;
        this.applyDOMEvents();
        this.renderComments(this.lcData.comments);
        
        // @todo: 
        this.syncInterval = setInterval(function (){
            _CL.loadEvents();
        },SYSTEM.EVENT_SYNC_TIME);
    });
}

/**
 * My page object
 */
function MyPage(parentSelector){
    this.$parentSelector = $(parentSelector);
    this.modelData = {};
}
MyPage.prototype.appendToDOM = function (){
    this.$container = $(SYSTEM.Templates.render('mypage', {
        model:CURRENT_USER
    }));
    // binding
    this.domViewSettings.container = this.$container;
    // attach to DOM
    this.$parentSelector.prepend(this.$container);
}
MyPage.prototype.get$Container = function (){
    return this.$container;
}

/**
 * User profile
 */
function UserProfile(uid){
    this.$parentSelector = $('#profile');
    this.modelData = {};
    
    var _this = this;
    
    $.ajax(SYSTEM.URLS.getprofile, {
        async:false,
        method:'get',
        dataType:'json',
        data:SYSTEM.D({
            userId:uid
        }),
        success:function (rsp){
            if(rsp.errorCode == 0){
                _this.modelData = rsp.user;
                _this.appendToDOM();
                $('#showProfileTab').click();
            }
        }
    });
    
}
UserProfile.prototype.appendToDOM = function (){
    // attach to DOM
    this.$parentSelector.html($(SYSTEM.Templates.render('profile', {
        user:this.modelData
    })));
}
UserProfile.prototype.get$Container = function (){
    return this.$parentSelector;
}

function Login(token){
    $.getJSON(SYSTEM.URLS.getauth,SYSTEM.D({
        showtoken:token
    }), function (rsp){
        CURRENT_USER = rsp;
        $('.auth-section .connect').hide();
        $('.auth-section .username').html(CURRENT_USER.name);
        $('#myProfileAction').html(CURRENT_USER.name);
        $('.temp-post button').removeClass('disabled');
        $('.temp-post button').removeAttr('disabled');
        $('img.user-avatar').attr('src',CURRENT_USER.avatar);
        
        $.cookie(SYSTEM.MESSAGES.auth_cookie,  token);
    });
}

/**
 * Инициализация приложения после загрузки DOM
 */
 
(function ($){
    $.fn.moveUp = function() {
        $.each(this, function() {
             $(this).after($(this).prev());   
        });
    };
    $.fn.moveDown = function() {
        $.each(this, function() {
             $(this).before($(this).next());   
        });
    };
})(jQuery); 
 
$(function (){
    
    SYSTEM.Templates = new TemplateStorage(SYSTEM.Templates);
    
    // Sharing
    $(document).delegate('[data-action="share:twitter"],[data-action="share:facebook"]','click',function (){
       var $this = $(this);
       var url = $this.data('url');
       var text = $this.data('text');
       switch($this.data('action')){
           case('share:twitter'):
               window.open("https://twitter.com/intent/tweet?url="+url+"&text="+text,"Share on twitter","width=550,height=270,0,status=0,");
               
               break;
           case('share:facebook'):
               window.open("http://www.facebook.com/sharer.php?u="+url+"&t="+text,"Share on Facebook","width=550,height=270,0,status=0,");
               
               break;
       }
    });
    // authorization routines
    $(window).hashchange( function(){
        if(location.hash.substr(0, '#login/'.length) == '#login/'){
            Login(location.hash.substr('#login/'.length));
            location.hash='';
            $('#loginza_auth_form').detach();
        }
    });
    // auto authorize
    if(SYSTEM.REMBER_AUTH_IN_DOMAIN){
        var auth_token = $.cookie(SYSTEM.MESSAGES.auth_cookie);
        if(auth_token && auth_token!='0'){
            Login(auth_token);
        }
    }
    
    // popover view profile
    $('body').delegate('a.full-profile','click',function (){
        var uid = $(this).data('user');
        if(uid){
            new UserProfile(uid);
        }
    });
    
    $('#MyDis').click(function (){
       $('#dashboard').html( $(SYSTEM.Templates.render('mypage', {
            model:CURRENT_USER
        })));
    });
    
    $('#myProfileAction').click(function (){
        $('#MyDis').click();
    });
    
    $('a.logout').on('click',function(){
        $.get(SYSTEM.URLS.logout, {logout:true}, function (){
            CURRENT_USER = GUEST_USER;
            $('.auth-section .connect').show();
            $('.auth-section .username').html(CURRENT_USER.name);
            $('#myProfileAction').html(CURRENT_USER.name);
            $('.temp-post button').addClass('disabled');
            $('.temp-post button').attr('disabled','disabled');
            $('img.user-avatar').attr('src',CURRENT_USER.avatar);

        });
        $.cookie(SYSTEM.MESSAGES.auth_cookie,  null);
    });
    // global ajax errors handling:
    $('.alert.error span').ajaxError(function (){
        showErrorMessage(SYSTEM.MESSAGES.requestfailed); 
    });
    $('.alert.error span').ajaxSuccess(function (event,xhr){
        if(xhr.responseText.substr(0, 1)=='{'){
            var json_rsp = eval('('+xhr.responseText+')'); 
            if(json_rsp.errorCode > 0){
                showErrorMessage(json_rsp.errorMessage);
            }
        }
    });

    $('.close.alert-control').on('click',function(){
        $(this).parent().fadeOut('fast');
    });
    
    $(document).delegate('.return a.close-profile','click',function(){
        $('#convTab').click();
    });

    SYSTEM.COMMENTS_LIST = new CommentsList('#layout.comments-thread');
    SYSTEM.COMMENTS_LIST.loadComments();
    
    $('#disqus_thread').show();
});