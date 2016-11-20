import passport from 'passport';
import passportFB from './facebook';

export default () => {
    
    passportFB(passport);
    
}