import {decode} from './../../helpers/jwt';

export let hasToken = (req, res, next) => {
        const jwt = req.body.token || req.query.token || req.cookies.nfToken;
        if (jwt) {
            req.currentUser = decode(jwt);
            next();
        } else {
            return res.status(403).send({message: 'This route requires authorization.', success: false});
        }
    }    

export let isValidToken = (req, res, next) => {
    
}