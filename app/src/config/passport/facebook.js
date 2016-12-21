import { Strategy as FacebookStrategy } from 'passport-facebook';
import Config from './config';

export default (passport) => {
  if (Config.facebook) {
    const { clientID, clientSecret, callbackURL } = Config.facebook;
    passport.use(new FacebookStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
        (accessToken, refreshToken, profile, verifyCallback) => {
          const user = profile;
          user.token = 'TEST TOKEN';
          verifyCallback(null, user);
        }
    ));
  }
};
