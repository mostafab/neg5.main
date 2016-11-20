import {Strategy as FacebookStrategy} from 'passport-facebook';

export default (passport) => passport.use(new FacebookStrategy(
    {
        clientID: 'sdada',
        clientSecret: 'MySecret',
        callbackURL: 'http://test.com/callback'            
    },
    (accessToken, refreshToken, profile, done) => {
        
    }
)) 