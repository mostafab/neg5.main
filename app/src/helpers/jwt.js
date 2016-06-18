import jwt from 'jwt-simple';
import configuration from '../config/configuration';

const secret = configuration.jwt.secret;

export let encode = (payload) => {
    return new Promise((resolve, reject) => {
        let token = jwt.encode(payload, secret);
        resolve(token);
    })
}