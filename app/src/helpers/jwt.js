import jwt from 'jwt-simple';
import configuration from '../config/configuration';

const secret = configuration.jwt.secret;

export const encode = payload => jwt.encode(payload, secret);

export const decode = token => jwt.decode(token, secret);
