!function(){"use strict";var C="function"==typeof fetch?fetch.bind():function(s,o){return o=o||{},new Promise(function(n,t){var e=new XMLHttpRequest;for(var a in e.open(o.method||"get",s),o.headers)e.setRequestHeader(a,o.headers[a]);function l(){var a,s=[],o=[],i={};return e.getAllResponseHeaders().replace(/^(.*?):\s*([\s\S]*?)$/gm,function(n,t,e){s.push(t=t.toLowerCase()),o.push([t,e]),a=i[t],i[t]=a?a+","+e:e}),{ok:1==(e.status/200|0),status:e.status,statusText:e.statusText,url:e.responseURL,clone:l,text:function(){return Promise.resolve(e.responseText)},json:function(){return Promise.resolve(e.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([e.response]))},headers:{keys:function(){return s},entries:function(){return o},get:function(n){return i[n.toLowerCase()]},has:function(n){return n.toLowerCase()in i}}}}e.withCredentials="include"==o.credentials,e.onload=function(){n(l())},e.onerror=t,e.send(o.body)})};function L(n){var e,a="";return a+='\x3c!-- Comments Template --\x3e\n<ul class="comments">\n    \x3c!-- handle no posted comments --\x3e\n    ',(null==n.comments||n.comments.length<1)&&!n.user&&(a+='\n        <div class="no-comments">Be the first to comment on this post.</div>\n    '),a+="\n\n    \x3c!-- iterate comments --\x3e\n    ",n.comments.forEach(function(t){a+='\n        <li id="comment-'+(null==(e=t.id)?"":e)+'" data-id="'+(null==(e=t.id)?"":e)+'" class="comment ',t.approved||t.trusted||(a+="comment-not-approved"),a+='">\n            \x3c!-- Author and date line --\x3e\n            <div class="comment-author-dateline">\n                <span class="comment-author">',t.author_url&&(a+='<a href="'+(null==(e=t.author_url)?"":e)+'" target="_blank">'),a+=null==(e=t.display_name||t.name)?"":e,t.author_url&&(a+="</a>"),a+="</span>\n                ",n.user&&n.user.admin&&!t.trusted&&(a+='\n                    <div class="user-admin-actions">\n                        ',["trust","block"].forEach(function(n){a+='\n                            <button class="btn btn-default btn-action btn-user-admin-action" data-target="'+(null==(e=t.user_id)?"":e)+'" data-class="user" data-action="'+(null==(e=n)?"":e)+'">\n                                 <i class="icon icon-action user-action-icon-'+(null==(e=n)?"":e)+'"></i> <span>'+(null==(e=n)?"":e)+"</span>\n                            </button>\n                            "}),a+="\n                    </div>\n                    "),a+='\n                <span class="comment-date"><a href="#comment-'+(null==(e=t.id)?"":e)+'">'+(null==(e=t.created_at_s)?"":e)+'</a></span>\n            </div>\n            \x3c!-- Comment body --\x3e\n            <div class="comment-body">\n                '+(null==(e=t.comment)?"":e)+"\n            </div>\n            \x3c!-- Comment not approved status and actions --\x3e\n            ",t.approved||t.trusted?n.user&&(a+='\n                <div class="comment-user-actions">\n                    <button class="btn btn-default btn-comment-reply" data-reply-to="'+(null==(e=t.id)?"":e)+'">reply</button>\n                    \x3c!-- Admin Actions --\x3e\n                    ',n.user&&n.user.admin&&(a+='\n                        <button class="btn btn-primary btn-comment-delete" data-comment-id="'+(null==(e=t.id)?"":e)+'">delete</button>\n                    '),a+="\n                </div>\n            "):(a+='\n                <div class="comment-awaiting-approval">\n                    \x3c!-- Admin View --\x3e\n                    ',n.user&&n.user.admin&&(a+='\n                        <div class="comment-admin-actions">\n                            ',["approve","reject"].forEach(function(n){a+='\n                                <button class="btn btn-default btn-action comment-admin-action" data-target="'+(null==(e=t.id)?"":e)+'" data-class="comment" data-action="'+(null==(e=n)?"":e)+'">\n                                     <i class="icon icon-action comment-action-icon-'+(null==(e=n)?"":e)+'"></i>\n                              </button>\n                                '}),a+="\n                        </div>\n                    "),a+=' \x3c!-- end admin view --\x3e\n\n                    \x3c!-- Unapproved status text --\x3e\n                    <div class="bug">\n                            Comment is still waiting for approval by the moderators.\n                    </div>\n                </div>\n                '),a+="\n            ",n.replies[t.id]&&(n.comments=n.replies[t.id],a+="\n            "+(null==(e=n.comments_template(n))?"":e)+"\n        "),a+=" \x3c!-- end for..each --\x3e\n        </li>\n    "}),a+="\n</ul>\n"}var T=function(n){return document.querySelector(n)},_=function(n){return document.querySelectorAll(n)},o=function(n){this.options=n,this.options.endpoint=n.host+"/comments/"+n.slug,this.initialized=!1,this.firstLoad=!0;var t=new URL(n.host);"localhost"!==t.hostname&&(document.domain=t.hostname.split(".").slice(1).join(".")),this.refresh()};o.prototype.refresh=function(){var g=this,n=this.options,w=n.target,x=n.slug,E=n.host,k=n.endpoint;C(k,{credentials:"include",headers:{"Content-Type":"application/json"}}).then(function(n){return n.json()}).then(function(n){n.comments_template=L,T(w).innerHTML=function(t){var e,a="";a+='<div class="comments-ui">\n',t.user?(a+="\n    \x3c!-- Admin acions --\x3e\n    ",t.user.admin&&(a+='\n        <div class="admin-settings" style="display:none;">\n            <button class="btn btn-action admin-action" data-target="notification" data-class="setting" data-action="true">un</button>\n            <button class="btn btn-action admin-action" data-target="notification" data-class="setting" data-action="false">mute notifications</button>\n        </div>\n    '),a+='\n    \x3c!-- User / Authentication --\x3e\n    <div class="login-status">\n        \x3c!-- Modal dialog to allow user to change display name --\x3e\n        <div id="commentDisplayNameChangeModal" class="modal fade" role="dialog">\n            <div class="modal-dialog">\n                <div class="modal-content">\n                    <div class="modal-body">\n                        <form>\n                            <div class="form-group">\n                                <label for="inputCommentDisplayName">Update the display name on your comments:</label>\n                                <input type="text" class="form-control updated-name" id="inputCommentDisplayName" aria-describedby="displayNameHelp" value="'+(null==(e=t.user.display_name)?"":e)+'">\n                                <small id="displayNameHelp" class="form-text text-muted">\n                                Please choose a name to display with your comments. To protect our users, we allow you to use a name different \n                                than the real name returned by your authorization service provider. Names should be 3 to 30 characters long, \n                                family-friendly and unique. \n                                </small>\n                            </div>\n                        </form>\n                    </div>\n                    <div class="modal-footer">\n                        <button type="btn button" class="btn btn-primary btn-update-name" data-dismiss="modal" id="updateDisplayName">OK</button>\n                        <button type="btn button" class="btn btn-default" data-dismiss="modal">Cancel</button>\n                    </div>\n                </div>\n            </div>\n        </div>\n        \n        <div id="alertUpdateNameFailure" class="alert alert-danger" style="display:none" role="alert">\n            <span>Please select a different display name.</span>\n        </div>\n\n        \x3c!-- User display --\x3e\n        <span class="commenting-as-label">Commenting as: </span><span class="user">'+(null==(e=t.user.display_name)?"":e)+'</span>\n            <span class="user-options" style="float:right">\n                <a class="update-name" data-toggle="modal" data-target="#commentDisplayNameChangeModal" href="#">change name</a> | <a class="signout" href="#">sign out</a>\n            </span>\n    </div>\n    \n    <div class="comment-entry">\n        <div class="comment-form">\n            <textarea rows="6" class="post-body" placeholder="enter your comment here..."></textarea>\n            <div class="post-preview">\n                <div class="post-preview-body" style="display:none"></div>\n            </div>\n            <button class="btn btn-primary btn-post-comment">Post Comment</button>\n            <button class="btn btn-default btn-preview" style="display:none">Preview</button>\n            <button class="btn btn-default btn-edit" style="display:none">Edit</button>\n            <button class="btn btn-default btn-cancel" style="display:none">Cancel</button>\n            <span class="comment-formatting-help"><a href="/comment-formatting/" target="_blank">formatting comments</a></span>\n        </div>\n    </div>\n'):(a+='\n    \x3c!-- No user / authentication --\x3e\n    <div class="signin">\n        <span class="signin-text">Sign in <span class="hidden-sm hidden-xs">with one of the following </span>to comment: </span>\n        <div class="signin-providers">\n            ',t.auth.forEach(function(n,t){a+='\n                <button class="signin-provider signin-'+(null==(e=n.id)?"":e)+'" title="'+(null==(e=n.name)?"":e)+'"><i class="icon signin-icon-'+(null==(e=n.id)?"":e)+'"></i></button>\n            '}),a+="\n        </div>\n    </div>\n</div>                        \n"),a+="\n                    \n";var s=[];return t.replies={},t.comments.forEach(function(n){n.reply_to?(t.replies[n.reply_to]||(t.replies[n.reply_to]=[]),t.replies[n.reply_to].push(n)):s.push(n)}),t.comments=s,a+="\n"+(null==(e=t.comments_template(t))?"":e)+'\n\x3c!-- IMPORTANT - disables click handling on children of buttons --\x3e\n<style type="text/css">\n    .btn-action > * { pointer-events: none; }\n</style>'}(n);var t=T(w+" div.comments-ui"),e=T(w+" div.comment-form"),a=T(w+" textarea.post-body"),s=T(w+" .comment-form .post-preview-body"),o=window.localStorage.getItem("comment-draft-"+x);o&&a&&(a.value=o);var i=T(w+" .btn-post-comment"),l=T(w+" .btn-preview"),r=T(w+" .btn-edit"),c=T(w+" .btn-cancel"),d=_(w+" .btn-comment-reply"),u=_(w+" .btn-comment-delete"),m=T(w+" .btn-update-name"),p=T(w+" #alertUpdateNameFailure"),f=T(w+" .updated-name");if(i&&(i.addEventListener("click",function(n){var t=a.value;C(k,{credentials:"include",method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({comment:t,replyTo:e.dataset.reply})}).then(function(n){return n.json()}).then(function(n){a.value="",window.localStorage.setItem("comment-draft-"+x,a.value),n.id&&(g.firstLoad=!0,window.location.hash="#comment-"+n.id),g.refresh()})}),l.addEventListener("click",function(n){var t=a.value;a.style.display="none",l.style.display="none",s.style.display="block",r.style.display="inline",C(E+"/markdown",{credentials:"include",method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({comment:t})}).then(function(n){return n.json()}).then(function(n){s.innerHTML=n.html})}),r.addEventListener("click",function(n){a.style.display="inline",l.style.display="inline",s.style.display="none",r.style.display="none"}),a.addEventListener("keyup",function(){window.localStorage.setItem("comment-draft-"+x,a.value)}),Array.from(d).forEach(function(n){n.addEventListener("click",function(){e.dataset.reply=n.dataset.replyTo,c.style.display="inline-block",n.parentElement.appendChild(e)})}),m.addEventListener("click",function(){C(E+"/user/name",{credentials:"include",method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:f.value})}).then(function(n){return n.json()}).then(function(n){if(null==n.status||"ok"!=n.status){var t=new Error("failed to update");return Promise.reject(t)}}).then(function(){return g.refresh()}).catch(function(n){p.style.display="block"})}),c.addEventListener("click",function(){t.appendChild(e),delete e.dataset.reply,c.style.display="none"}),Array.from(u).forEach(function(t){t.addEventListener("click",function(){var n=t.dataset.commentId;C(E+"/comment/"+n,{credentials:"include",method:"DELETE",headers:{"Content-Type":"application/json"}}).then(function(){return g.refresh()})})})),n.user){var h=T("a.signout");h&&h.addEventListener("click",function(n){n.preventDefault(),C(E+"/signout",{credentials:"include",headers:{"Content-Type":"application/json"}}).then(function(){return g.refresh()})})}else n.auth.forEach(function(e){var n=T(w+" .signin-"+e.id);n&&n.addEventListener("click",function(n){var t=window.open(E+"/auth/"+e.id,e.name+" Sign-In","resizable,scrollbars,status,width=600,height=500");window.__wait_for_oauth=function(){t.close(),g.refresh()}})});if(n.user&&n.user.admin){if(!g.initialized){var v=document.createElement("script");v.setAttribute("src",E+"/push.js"),document.head.appendChild(v),g.initialized=!0}var y=function(n){var t=n.target.dataset;C(E+"/"+t.class+"/"+t.target+"/"+t.action,{credentials:"include",method:"POST",headers:{"Content-Type":"application/json"},body:""}).then(function(){return g.refresh()})};Array.from(document.querySelectorAll(".btn-action")).forEach(function(n){n.addEventListener("click",y)})}if(g.firstLoad&&window.location.hash.match(/^#comment-\d+$/)){var b=document.querySelector(window.location.hash);b.scrollIntoView(),b.classList.add("highlight"),g.firstLoad=!1}})},function(){var n=document.querySelector("script[data-schnack-target]");if(!n)return console.warn("schnack script tag needs some data attributes");var t=n.dataset,e=t.schnackSlug,a=new URL(n.getAttribute("src")),s=a.protocol+"//"+a.host;new o({target:t.schnackTarget,slug:e,host:s})}()}();
