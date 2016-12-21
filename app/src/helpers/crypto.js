import bcryptjs from 'bcryptjs';

const SALT_WORK_FACTOR = 10;

export const hashExpression = expression => new Promise((resolve, reject) => {
  bcryptjs.genSalt(SALT_WORK_FACTOR, (saltErr, salt) => {
    if (saltErr) return reject(saltErr);
    bcryptjs.hash(expression, salt, (hashErr, hash) => {
      if (hashErr) return reject(hashErr);
      return resolve(hash);
    });
  });
});

export const compareToHash = (expression, hash) => new Promise((resolve, reject) => {
  bcryptjs.compare(expression, hash, (err, result) => {
    if (err) return reject(err);
    return resolve({ match: result });
  });
});
