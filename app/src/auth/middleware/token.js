export let hasToken = (req, res, next) => {
        if (req.body.jwt || req.query.jwt || req.cookies.jwt) {
            next();
        } else {
            return res.status(403).send({message: 'This route requires authorization.', success: false});
        }
    }    

export let isValidToken = (req, res, next) => {
    
}