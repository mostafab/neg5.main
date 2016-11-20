import passport from 'passport';
import passportFB from './facebook';

function initializePassport() {
    
    let passportInstance = passport;
    
    passportFB(passportInstance);
    
    return passportInstance;
    
}

export default initializePassport();