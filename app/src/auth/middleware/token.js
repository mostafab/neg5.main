import { decode } from './../../helpers/jwt';

/* eslint-disable no-param-reassign */
export const hasToken = (req, res, next) => {
  const jwt = req.body.token || req.query.token || req.cookies.nfToken;
  if (jwt) {
    try {
      const user = decode(jwt).username;
      if (!user) {
        return res.status(403).send({ message: `Invalid token: ${jwt}` });
      }
      req.currentUser = user;
      return next();
    } catch (error) {
      return res.status(403).send({ message: `Invalid token: ${jwt}`, success: false });
    }
  } else {
    return res.status(403).send({ message: 'This route requires authorization.', success: false });
  }
};
