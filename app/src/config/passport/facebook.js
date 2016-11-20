import {Strategy as FacebookStrategy} from 'passport-facebook';
import Config from './config';

export default (passport) => {
    
    const {clientID, clientSecret} = Config.facebook;
    
    passport.use(new FacebookStrategy(
        {
            clientID,
            clientSecret,
            callbackURL: 'http://test.com/callback'            
        },
        (accessToken, refreshToken, profile, verifyCallback) => {
               
        }
    )) 

}