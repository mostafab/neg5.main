import passport from 'passport';
import passportFB from './facebook';
import passportGoogle from './google';

function initializePassport() {
  const passportInstance = passport;
  passportFB(passportInstance);
  passportGoogle(passportInstance);
  return passportInstance;
}

export default initializePassport();
