import jwt from 'jwt-simple';
import configuration from '../config/configuration';

const secret = configuration.jwt.secret;

export const encode = payload => jwt.encode(payload, secret);

export const decode = token => jwt.decode(token, secret);

export const buildUserToken = (username) => {
  const token = {
    username,
    issuedAt: new Date(),
  };
  return encode(token);
};
