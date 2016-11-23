import Account from '../../models/sql-models/account';
import {hasToken} from '../../auth/middleware/token';
import Passport from '../../config/passport/passport';

export default (app) => {
    
    app.route('/api/account')
        .post((req, res) => {
            const accountCredentials = req.body;
            Account.create(accountCredentials)
                .then(user => {
                    return res.json({user: user, success: true});
                })
                .catch(error => {
                    return res.status(500).json({error: error, success: false});
            });
        })
        
    app.route('/api/account/authenticate')
        .post((req, res) => {
            const accountCredentials = req.body;
            Account.findOne(accountCredentials)
                .then(token => {
                    res.json({success: true, token: token})
                })
                .catch(errorMessage => {
                    console.log(errorMessage);
                    if (errorMessage.error) {
                        return res.status(500).json({success: false, error: errorMessage})
                    } else if (!errorMessage.authenticated) {
                        return res.status(403).json({success: false, authenticated: false})
                    }                  
                });
        });

    app.get('/api/users', hasToken, (req, res) => {
        Account.findByQuery(req.query.search)
            .then(users => res.json({users, currentUser: req.currentUser, success: true}))
            .catch(error => res.send({error, success: false}))
    })
    
    app.get('/auth/facebook', Passport.authenticate('facebook', {session: false}));
    
    app.get('/auth/facebook/callback', Passport.authenticate('facebook', {
        failureRedirect: '/',
        session: false
    }), (req, res) => {
        res.json(req.user)
    });
    
    app.get('/auth/google', Passport.authenticate('google', {
        session: false,
        scope: ['email profile']
    }))
    
    app.get('/auth/google/callback', Passport.authenticate('google', {
        failureRedirect: '/',
        session: false
    }), (req, res) => {
        res.cookie('nfToken', req.user);
        res.redirect('/tournaments');
    })
    
}