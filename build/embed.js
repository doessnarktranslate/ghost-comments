!function(){"use strict";var n="function"==typeof fetch?fetch.bind():function(n,t){return t=t||{},new Promise(function(e,s){function a(){var n,t=[],e=[],s={};return o.getAllResponseHeaders().replace(/^(.*?):\s*([\s\S]*?)$/gm,function(a,o,c){t.push(o=o.toLowerCase()),e.push([o,c]),n=s[o],s[o]=n?n+","+c:c}),{ok:1==(o.status/200|0),status:o.status,statusText:o.statusText,url:o.responseURL,clone:a,text:function(){return Promise.resolve(o.responseText)},json:function(){return Promise.resolve(o.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([o.response]))},headers:{keys:function(){return t},entries:function(){return e},get:function(n){return s[n.toLowerCase()]},has:function(n){return n.toLowerCase()in s}}}}var o=new XMLHttpRequest;o.open(t.method||"get",n);for(var c in t.headers)o.setRequestHeader(c,t.headers[c]);o.withCredentials="include"==t.credentials,o.onload=function(){e(a())},o.onerror=s,o.send(t.body)})},t=function(n){var t,e="";return n.user?e+='\n<div class="schnack-form">\n    <textarea class="schnack-body"></textarea><br>\n    <button class="schnack-button">Send comment</button>\n    (signed in as <span class="schnack-user">@'+(null==(t=n.user.name)?"":t)+"</span>)\n</div>\n":e+='\n<button class="schnack-signin-twitter">Login with Twitter to post comment</button>\n',e+='\n<ul class="schnack-comments">\n    ',n.comments.forEach(function(s){e+='\n        <li class="schnack-comment',s.approved||(e+=" schnack-not-approved"),e+='">\n            <div class="schnack-dateline">\n                <span class="schnack-author">'+(null==(t=s.name)?"":t)+'</span>\n                <span class="schnack-date">'+(null==(t=s.created_at_s)?"":t)+':</span>\n            </div>\n            <blockquote class="schnack-body">\n                <p>'+(null==(t=s.comment)?"":t)+"</p>\n            </blockquote>\n            ",s.approved||(e+='\n            <div class="schnack-awaiting-approval">\n                This comment is still waiting for '+(null==(t=n.user.admin?"your ":"")?"":t)+"approval"+(null==(t=n.user.admin?"":" by the site owner")?"":t)+".\n                ",n.user.admin&&["approve","reject"].forEach(function(n){e+='\n                <button class="schnack-action" data-target="'+(null==(t=s.id)?"":t)+'" data-class="comment" data-action="'+(null==(t=n)?"":t)+'">'+(null==(t=n)?"":t)+"</button>\n                "}),e+="\n            </div>\n            "),e+="\n        </li>\n    "}),e+="\n</ul>"};!function(){function e(){n(u,{credentials:"include",headers:{"Content-Type":"application/json"}}).then(function(n){return n.json()}).then(function(a){s(d).innerHTML=t(a);var o=s(d+" .schnack-button"),c=s(d+" .schnack-signin-twitter");if(c&&c.addEventListener("click",function(n){window.open(l,"Twitter Sign-In","resizable,scrollbars,status,width=600,height=500")}),o&&o.addEventListener("click",function(t){var a={comment:s(d+" .schnack-body").value};n(u,{credentials:"include",method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}).then(function(n){return n.json()}).then(function(n){console.log(n),e()})}),a.user&&a.user.admin){var r=function(t){var s=t.target.dataset;n(i+"/"+s.class+"/"+s.target+"/"+s.action,{credentials:"include",method:"POST",headers:{"Content-Type":"application/json"},body:""}).then(function(n){return n.json()}).then(function(n){console.log(n),e()})};document.querySelectorAll(".schnack-action").forEach(function(n){n.addEventListener("click",r)})}})}var s=function(n){return document.querySelector(n)},a=s("script[data-schnack-target]");if(!a)return console.warn("schnack script tag needs some data attributes");var o=a.dataset,c=o.schnackSlug,r=new URL(a.getAttribute("src")),i=r.protocol+"//"+r.host,u=i+"/comments/"+c,l=i+"/auth/twitter",d=o.schnackTarget;e()}()}();
