<li id="<%= message.id %>">
    <div class="author" data-username="<%= message.author.username %>">
        <img src="http://placehold.it/64x64" alt="o" width="64" />
    </div>
    <div class="message">
        <%= message.content %>
    </div>
</li>