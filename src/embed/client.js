import fetch from 'unfetch';
import main_template from './main.jst.html';
import comments_template from './comments.jst.html';

//const parseurl = require('parseurl');

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

export default class GhostComments {
    constructor(options) {
        this.options = options;
        this.options.endpoint = `${options.host}/comments/${options.slug}`;
        this.initialized = false;
        this.firstLoad = true;

        var url = new URL(options.host);
        //        const url = parseurl(options.host);

        if (url.hostname !== 'localhost') {
            document.domain = url.hostname.split('.').slice(1).join('.');
        }

        this.refresh();
    }

    refresh() {
        const {
            target,
            slug,
            host,
            endpoint
        } = this.options;

        fetch(endpoint, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(r => r.json())
            .then((data) => {
                data.comments_template = comments_template;
                $(target).innerHTML = main_template(data);

                const above = $(`${target} div.comments-ui`);
                const form = $(`${target} div.comment-form`);
                const textarea = $(`${target} textarea.post-body`);
                const preview = $(`${target} .comment-form .post-preview-body`);

                const draft = window.localStorage.getItem(`comment-draft-${slug}`);
                if (draft && textarea) textarea.value = draft;

                const postBtn = $(target + ' .btn-post-comment');
                const previewBtn = $(target + ' .btn-preview');
                const writeBtn = $(target + ' .btn-edit');
                const cancelReplyBtn = $(target + ' .btn-cancel');
                const replyBtns = $$(target + ' .btn-comment-reply');
                const deleteBtns = $$(target + ' .btn-comment-delete');
                const updateDisplayNameBtn = $(target + ' .btn-update-name');
                const updateDisplayNameFail = $(target + ' #alertUpdateNameFailure');

                const updatedName = $(target + ' .updated-name');

                if (postBtn) {
                    postBtn.addEventListener('click', (d) => {
                        const body = textarea.value;
                        fetch(endpoint, {
                                credentials: 'include',
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    comment: body,
                                    replyTo: form.dataset.reply
                                })
                            })
                            .then(r => r.json())
                            .then((res) => {
                                textarea.value = '';
                                window.localStorage.setItem(`comment-draft-${slug}`, textarea.value);
                                if (res.id) {
                                    this.firstLoad = true;
                                    window.location.hash = '#comment-' + res.id;
                                }
                                this.refresh();
                            });
                    });

                    previewBtn.addEventListener('click', (d) => {
                        const body = textarea.value;
                        textarea.style.display = 'none';
                        previewBtn.style.display = 'none';
                        preview.style.display = 'block';
                        writeBtn.style.display = 'inline';
                        fetch(`${host}/markdown`, {
                                credentials: 'include',
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    comment: body
                                })
                            })
                            .then(r => r.json())
                            .then((res) => {
                                preview.innerHTML = res.html;
                                // refresh();
                            });
                    });

                    writeBtn.addEventListener('click', (d) => {
                        textarea.style.display = 'inline';
                        previewBtn.style.display = 'inline';
                        preview.style.display = 'none';
                        writeBtn.style.display = 'none';
                    });

                    textarea.addEventListener('keyup', () => {
                        window.localStorage.setItem(`comment-draft-${slug}`, textarea.value);
                    });

                    replyBtns.forEach((btn) => {
                        btn.addEventListener('click', () => {
                            form.dataset.reply = btn.dataset.replyTo;
                            cancelReplyBtn.style.display = 'inline-block';
                            btn.parentElement.appendChild(form);
                        });
                    });

                    updateDisplayNameBtn.addEventListener('click', () => {
                        fetch(`${host}/user/name`, {
                                credentials: 'include',
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    name: updatedName.value
                                })
                            })
                            .then(r => r.json())
                            .then((res) => {
                                if (res.status == undefined || res.status != 'ok') {
                                    var error = new Error('failed to update');
                                    return Promise.reject(error);
                                }
                            })
                            .then(() => this.refresh())
                            .catch(e => {
                                updateDisplayNameFail.style.display = 'block';
                            });
                    });

                    cancelReplyBtn.addEventListener('click', () => {
                        above.appendChild(form);
                        delete form.dataset.reply;
                        cancelReplyBtn.style.display = 'none';
                    });

                    deleteBtns.forEach((btn) => {
                        btn.addEventListener('click', () => {
                            const commentId = btn.dataset.commentId;
                            fetch(`${host}/comment/` + commentId, {
                                    credentials: 'include',
                                    method: 'DELETE',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                })
                                .then(() => this.refresh());
                        });
                    });
                }
                if (data.user) {
                    const signout = $('a.signout');
                    if (signout) signout.addEventListener('click', (e) => {
                        e.preventDefault();
                        fetch(`${host}/signout`, {
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                            })
                            .then(() => this.refresh());
                    });
                } else {
                    data.auth.forEach((provider) => {
                        const btn = $(target + ' .signin-' + provider.id);
                        if (btn) btn.addEventListener('click', (d) => {
                            let windowRef = window.open(
                                `${host}/auth/${provider.id}`, provider.name + ' Sign-In', 'resizable,scrollbars,status,width=600,height=500'
                            );
                            window.__wait_for_oauth = () => {
                                windowRef.close();
                                this.refresh();
                            };
                        });
                    });
                }

                if (data.user && data.user.admin) {
                    if (!this.initialized) {
                        const push = document.createElement('script');
                        push.setAttribute('src', `${host}/push.js`);
                        document.head.appendChild(push);
                        this.initialized = true;
                    }

                    const action = (evt) => {
                        const btn = evt.target;
                        const data = btn.dataset;
                        fetch(`${host}/${data.class}/${data.target}/${data.action}`, {
                                credentials: 'include',
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: ''
                            })
                            .then(() => this.refresh());
                    };
                    document.querySelectorAll('.btn-action').forEach((btn) => {
                        btn.addEventListener('click', action);
                    });
                }

                if (this.firstLoad && window.location.hash.match(/^#comment-\d+$/)) {
                    const hl = document.querySelector(window.location.hash);
                    hl.scrollIntoView();
                    hl.classList.add('highlight');
                    this.firstLoad = false;
                }
            });
    }
}