const url = require('url');
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');

const RSS = require('rss');
const marked = require('marked');

const dbHandler = require('./db');
const queries = require('./db/queries');
const auth = require('./auth');
const pushHandler = require('./push');
const commentEvents = require('./events');
const {
    error,
    getUser,
    isAdmin,
    checkOrigin,
    checkValidComment,
    getSchnackDomain
} = require('./helper');

const config = require('./config');

const awaiting_moderation = [];

marked.setOptions({
    sanitize: true
});

dbHandler.init()
    .then(db => run(db))
    .catch(err => console.error(err.message));

function run(db) {
    app.use(cors({
        credentials: true,
        origin: checkOrigin
    }));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // init session + passport middleware and auth routes
    auth.init(app, db, getSchnackDomain());
    pushHandler.init(app, db, awaiting_moderation);

    app.put('/user/name', (request, reply) => {
        const {
            name
        } = request.body;

        var invalidNameLength = false,
            invalidNameTaken = false;

        var user = getUser(request);
        if (!user) return error('access denied', request, reply, 403);

        // check if name is too short
        if (name.length < 3 || name.length > 30) {
            invalidNameLength = true;
        }

        // check if name is already in use
        db.get(queries.find_display_name, [name.toLowerCase()], (err, row) => {
            if (error(err, request, reply)) return;

            if (row) {
                invalidNameTaken = true;
            }
        });

        if (invalidNameLength) {
            reply.send({
                status: 'fail',
                reason: 'name too short or too long'
            });
        } else if (invalidNameTaken) {
            reply.send({
                status: 'fail',
                reason: 'name taken'
            });
        } else {
            let args = [name, user.id];
            db.run(queries.update_name, args, (err) => {
                if (error(err, request, reply)) return;

                user.display_name = name;

                reply.send({
                    status: 'ok'
                });
            });
        }

    });

    app.delete('/comment/:id', (request, reply) => {
        const {
            id
        } = request.params;
        const user = getUser(request);
        if (!isAdmin(user)) return reply.status(403).send(request.params);

        let query = queries.remove;
        db.run(query, id, id, (err) => {
            if (error(err, request, reply)) return;
            reply.send({
                status: 'ok'
            });
        });
    });

    app.get('/comments/:slug', (request, reply) => {
        const { 
            slug
        } = request.params;

        // check header for X-Total-Count header in request. If included, 
        // only return the count of comments.
        if (request.get('x-total-count') != undefined) {
            let query = queries.get_comments_count;
            let args = [slug];
            var c = -1;

            db.all(query, args, (err, row) => {
                if (error(err, request, reply)) return;
                reply.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                reply.setHeader("Pragma", "no-cache");
                reply.setHeader("Expires", 0);
                reply.send({
                    slug: slug,
                    count: row[0].count
                });
            });
        } else {

            const user = getUser(request);
            const providers = user ? null : auth.providers;

            let query = queries.get_comments;
            let args = [slug, user ? user.id : -1];

            if (isAdmin(user)) {
                user.admin = true;
                query = queries.admin_get_comments;
                args.length = 1;
            }

            const date_format = config.get('date_format');
            db.all(query, args, (err, comments) => {
                if (error(err, request, reply)) return;
                comments.forEach((c) => {
                    const m = moment.utc(c.created_at);
                    m_local = m.local(); // convert UTC time to (server's) local time
                    c.created_at_s = date_format ? m_local.format(date_format) : m_local.fromNow(); // return formatted local time
                    c.comment = marked(c.comment.trim());
                    c.author_url = auth.getAuthorUrl(c);
                });
                reply.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                reply.setHeader("Pragma", "no-cache");
                reply.setHeader("Expires", 0);
                reply.send({
                    user,
                    auth: providers,
                    slug,
                    comments
                });
            });
        }
    });

    app.get('/signout', (request, reply) => {
        delete request.session.passport;
        reply.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        reply.setHeader("Pragma", "no-cache");
        reply.setHeader("Expires", 0);
        reply.send({
            status: 'ok'
        });
    });

    // POST new comment
    app.post('/comments/:slug', (request, reply) => {
        const { 
            slug 
        } = request.params;
        const {
            comment,
            replyTo
        } = request.body;
        const user = getUser(request);

        if (!user) return error('access denied', request, reply, 403);
        checkValidComment(db, slug, user.id, comment, replyTo, (err) => {
            if (err) return reply.send({
                status: 'rejected',
                reason: err
            });
            let stmt = db
                .prepare(queries.insert, [user.id, slug, comment, replyTo ? +replyTo : null])
                .run(err => {
                    if (err) return error(err, request, reply);
                    if (!user.blocked && !user.trusted) {
                        awaiting_moderation.push({
                            slug
                        });
                    }
                    commentEvents.emit('new-comment', {
                        user: user,
                        slug,
                        id: stmt.lastID,
                        comment,
                        replyTo
                    });
                    reply.send({
                        status: 'ok',
                        id: stmt.lastID
                    });
                });
        });
    });

    // trust/block users or approve/reject comments
    app.post(/\/(?:comment\/(\d+)\/(approve|reject))|(?:user\/(\d+)\/(trust|block))/, (request, reply) => {
        const user = getUser(request);
        if (!isAdmin(user)) return reply.status(403).send(request.params);
        const action = request.params[1] || request.params[3];
        const target_id = +(request.params[0] || request.params[2]);
        db.run(queries[action], target_id, (err) => {
            if (error(err, request, reply)) return;
            reply.send({
                status: 'ok'
            });
        });
    });

    app.get('/success', (request, reply) => {
        const schnackDomain = getSchnackDomain();
        reply.send(`<script>
            document.domain = '${schnackDomain}';
            window.opener.__wait_for_oauth();
        </script>`);
    });

    app.get('/', (request, reply) => {
        reply.send({
            test: 'ok'
        });
    });

    // rss feed of comments in need of moderation
    app.get('/feed', (request, reply) => {
        var feed = new RSS({
            title: 'Awaiting moderation',
            site_url: getSchnackDomain()
        });
        db.each(queries.awaiting_moderation, (err, row) => {
            if (err) console.error(err.message);
            feed.item({
                title: `New comment on "${row.slug}"`,
                description: `A new comment on "${row.slug}" is awaiting moderation`,
                url: row.slug + '/' + row.id,
                guid: row.slug + '/' + row.id,
                date: row.created_at
            });
        }, (err) => {
            reply.send(feed.xml({
                indent: true
            }));
        });
    });

    // for markdown preview
    app.post('/markdown', (request, reply) => {
        const {
            comment
        } = request.body;
        reply.send({
            html: marked(comment.trim())
        });
    });

    // settings
    app.post('/setting/:property/:value', (request, reply) => {
        const {
            property,
            value
        } = request.params;
        const user = getUser(request);
        if (!isAdmin(user)) return reply.status(403).send(request.params);
        const setting = value ? 1 : 0;
        db.run(queries.set_settings, [property, setting], (err) => {
            if (error(err, request, reply)) return;
            reply.send({
                status: 'ok'
            });
        });
    });

    if (config.get('dev')) {
        // create dev user for testing purposes
        db.run('INSERT OR IGNORE INTO user (id,name,blocked,trusted,created_at) VALUES (1,"dev",0,1,datetime())');
    }

    var server = app.listen(config.get('port'), config.get('host'), (err) => {
        if (err) throw err;
        console.log(`server listening on ${server.address().port}`);
    });
}
