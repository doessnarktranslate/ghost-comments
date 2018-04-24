const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const YahooStrategy = require('passport-yahoo-oauth').Strategy;
const AmazonStrategy = require('passport-amazon').Strategy;

const queries = require('./db/queries');
const config = require('./config');
const authConfig = config.get('oauth');
const trustConfig = config.get('trust');
const host = config.get('schnack_host');

const providers = [];

function init(app, db, domain) {
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: authConfig.secret,
        cookie: { domain: `.${domain}` },
        store: new SQLiteStore({ db: config.get('database').sessions })
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
        db.get(queries.find_user, [user.provider, user.id], (err, row) => {
            if (row) {
		// welcome back
		const u_args = [user.photos[0].value || '', user.provider, user.id];
		db.run(queries.update_user, u_args, (err, res) => {
		    if (err) return console.error(err);
		    db.get(queries.find_user, [user.provider, user.id], (err, row) => {
			if (row) return done(null, row);
			console.error('no user found after update');
		    });
		});
            }

	    // nice to meet you, new user!
            // check if id shows up in auto-trust config
            var trusted = trustConfig &&
                    trustConfig[user.provider] &&
                    trustConfig[user.provider].indexOf(user.id) > -1 ? 1 : 0;
            const c_args = [user.provider, user.id, user.displayName, user.username || user.displayName, trusted, user.photos[0].value || ''];
            db.run(queries.create_user, c_args, (err, res) => {
                if (err) return console.error(err);
                db.get(queries.find_user, [user.provider, user.id], (err, row) => {
                    if (row) return done(null, row);
                    console.error('no user found after insert');
                });
            });
        });
    });

    passport.deserializeUser((user, done) => {
        done(null, {
            provider: user.provider,
            id: user.provider_id
        });
    });


    // google oauth
    if (authConfig.google) {
        providers.push({ id: 'google', name: 'Google' });
        passport.use(new GoogleStrategy({
            clientID: authConfig.google.client_id,
            clientSecret: authConfig.google.client_secret,
            callbackURL: `${host}/auth/google/callback`
        }, (accessToken, refreshToken, profile, done) => {
            done(null, profile);
        }));

        app.get('/auth/google',
            passport.authenticate('google', {
                scope: ['https://www.googleapis.com/auth/plus.login']
            })
        );

        app.get('/auth/google/callback',
            passport.authenticate('google', {
                failureRedirect: '/login'
            }), (request, reply) => {
                reply.redirect('/success');
            }
        );
    }

    // twitter auth
    if (authConfig.twitter) {
        providers.push({ id: 'twitter', name: 'Twitter' });
        passport.use(new TwitterStrategy({
            consumerKey: authConfig.twitter.consumer_key,
            consumerSecret: authConfig.twitter.consumer_secret,
            callbackURL: `${host}/auth/twitter/callback`
        }, (token, tokenSecret, profile, done) => {
            done(null, profile);
        }));

        app.get('/auth/twitter',
            passport.authenticate('twitter')
        );

        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                failureRedirect: '/login'
            }), (request, reply) => {
                reply.redirect('/success');
            }
        );
    }

    // amazon oauth
    if (authConfig.amazon) {
        providers.push({
            id: 'amazon',
            name: 'Amazon'
        });
        passport.use(new AmazonStrategy({
            clientID: authConfig.amazon.client_id,
            clientSecret: authConfig.amazon.client_secret,
            callbackURL: `${host}/auth/amazon/callback`,
            scope: 'profile'
        }, (accessToken, refreshToken, profile, done) => {
            done(null, profile);
        }));

        app.get('/auth/amazon',
            passport.authenticate('amazon')
        );

        app.get('/auth/amazon/callback',
            passport.authenticate('amazon', {
                failureRedirect: '/login'
            }), (request, reply) => {
                reply.redirect('/success')
            }
        );
    }

    // facebook oauth
    if (authConfig.facebook) {
        providers.push({ id: 'facebook', name: 'Facebook' });
        passport.use(new FacebookStrategy({
            clientID: authConfig.facebook.client_id,
            clientSecret: authConfig.facebook.client_secret,
            callbackURL: `${host}/auth/facebook/callback`
        }, (accessToken, refreshToken, profile, done) => {
              done(null, profile);
        }));

        app.get('/auth/facebook',
            passport.authenticate('facebook')
        );

        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                failureRedirect: '/login'
            }), (request, reply) => {
                reply.redirect('/success')
            }
        );
    }

    // yahoo oauth
    if (authConfig.yahoo) {
        providers.push({
            id: 'yahoo',
            name: 'Yahoo'
        });
        passport.use(new YahooStrategy({
            consumerKey: authConfig.yahoo.client_id,
            consumerSecret: authConfig.yahoo.client_secret,
            callbackURL: `${host}/auth/yahoo/callback`
        }, (accessToken, refreshToken, profile, done) => {
            done(null, profile);
        }));

        app.get('/auth/yahoo',
            passport.authenticate('yahoo')
        );

        app.get('/auth/yahoo/callback',
            passport.authenticate('yahoo', {
                failureRedirect: '/login'
            }), (request, reply) => {
                reply.redirect('/success')
            }
        );
    }
    
    // github auth
    if (authConfig.github) {
        providers.push({ id: 'github', name: 'Github' });
        passport.use(new GitHubStrategy({
            clientID: authConfig.github.client_id,
            clientSecret: authConfig.github.client_secret,
            callbackURL: `${host}/auth/github/callback`
        }, (accessToken, refreshToken, profile, done) => {
            done(null, profile);
        }));

        app.get('/auth/github',
            passport.authenticate('github', {
                scope: ['user:email']
            })
        );

        app.get('/auth/github/callback',
            passport.authenticate('github', {
                failureRedirect: '/login'
            }), (request, reply) => {
                reply.redirect('/success');
            }
        );
    }

}

function getAuthorUrl(comment) {
    switch (comment.provider) {
        case 'twitter': return 'https://twitter.com/'+comment.name;
        case 'github': return 'https://github.com/'+comment.name;
        default: return;
    }
}

module.exports = {
    init,
    providers,
    getAuthorUrl
};
