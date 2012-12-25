<li id="<%= post.id %>" class="post" data-time="<%= post.time %>">    
    <div class="post-content " data-role="post-content">        
        <div class="indicator"></div>                        
        <div class="avatar hovercard">            
            <a data-user="<%= post.author.id %>" data-action="profile" class="user" href="#">                
                <img alt="Avatar" src="<%- post.author.avatar %>">            
            </a>        
        </div>                
        <div class="post-body">            
            <header>                                    
                <span class="publisher-anchor-color">
                    <a data-user="<%= post.author.id %>" class="profile-show" ><%- post.author.name %></a>
                </span>                                                                    
                <span aria-hidden="true" class="bullet">•</span>                                    
                <a class="time-ago" data-role="relative-time" href="#">a few seconds ago</a>                                                
                <ul class="post-menu">                    
                    <li class="collapse">
                        <a title="Collapse" data-action="collapse" href="#">−</a>
                    </li>                    
                    <li style="display:none" class="expand">
                        <a title="Expand" data-action="collapse" href="#">+</a>
                    </li>                    
                </ul>            
            </header>            
            <div data-role="message" class="post-message publisher-anchor-color ">                                    
                <p>
                    <%- post.body %>
                </p>                            
            </div>                        
            <footer>                        
                <menu>        
                    <li data-role="realtime-notification:1" class="realtime">            
                        <a data-action="load-queued-posts" class="btn small" style="display:none;">
                            <span class="indicator"></span>
                            Show <span class="replies-count">0</span> new replies
                        </a>             
                    </li>        
                    <li data-role="voting" class="voting">                
                        <a title="Vote up" data-action="upvote" class="vote-up " >        
                            <span data-role="likes" class="updatable count"><%= post.likes %></span>        
                            <span class="control">
                                <i class="icon-arrow-2" aria-hidden="true"></i>
                            </span>    
                        </a>    
                        <a title="Vote down" data-action="downvote" class="vote-down " >        
                            <span data-role="dislikes" class="updatable count count-0"><%= post.dislikes %></span>        
                            <span class="control">
                                <i class="icon-arrow" aria-hidden="true"></i>
                            </span>    
                        </a>        
                    </li>        
                    <li aria-hidden="true" class="bullet">•</li>                        
                    <li class="reply">
                        <a data-action="reply" >Reply</a>
                    </li>        
                    <li aria-hidden="true" class="bullet">•</li>                
                    <li class="share">            
                        <a class="toggle">Share ›</a>            
                        <ul>                
                            <li class="twitter">
                                <a data-action="share:twitter" data-url="<%- _REF %>" data-text="%22<%- post.body %>%22%20%E2%80%94%20<%- post.author.name%>" >Twitter</a>
                            </li>                
                            <li class="facebook">
                                <a data-action="share:facebook" data-url="<%- _REF %>" data-text="%22<%- post.body %>%22%20%E2%80%94%20<%- post.author.name%>">Facebook</a>
                            </li>                
                            <li class="link">
                                <a href="#">Link</a>
                            </li>            
                        </ul>        
                    </li>    
                </menu>                
            </footer>        
        </div>                
        <div data-role="blacklist-form">
        </div>    
    </div>    
    <!-- Child comments are appended here -->    
    <ul class="children" data-role="children">
        
    </ul>
</li>