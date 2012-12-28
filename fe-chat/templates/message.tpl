<li id="<%= message.id %>">
    <div class="row">
    
        <div class="span1 author" data-username="<%= message.author.username %>">
            <img src="http://placehold.it/64x64" alt="o" width="64" />
            <span class="author-name"><%- message.author.username %></span>
        </div>
        <div class="span2 message color-<%= message.author.color %>">
            <%- message.content %>
        </div>
        
    </div>
</li>