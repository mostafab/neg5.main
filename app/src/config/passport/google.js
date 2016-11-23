import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth';
import Config from './config';
import {encode} from './../../helpers/jwt';

export default (passport) => {
    
    const {clientID, clientSecret, callbackURL} = Config.google;
    
    passport.use(new GoogleStrategy(
        {
            clientID,
            clientSecret,
            callbackURL            
        },
        (accessToken, refreshToken, profile, verifyCallback) => {
            const user = profile;
            verifyCallback(null, encode(user));
        }
    )); 

}