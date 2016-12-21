import { decode } from './../../helpers/jwt';

export const hasToken = (req, res, next) => {
  const jwt = req.body.token || req.query.token || req.cookies.nfToken;
  if (jwt) {
    try {
      req.currentUser = decode(jwt);
      return next();
    } catch (error) {
      return res.status(403).send({ message: `Invalid token: ${jwt}`, success: false });
    }
  } else {
    return res.status(403).send({ message: 'This route requires authorization.', success: false });
  }
};
