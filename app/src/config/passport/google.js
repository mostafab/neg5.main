import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth';
import Config from './config';

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
            user.token = 'TEST TOKEN';
            verifyCallback(null, user);
        }
    )); 

}