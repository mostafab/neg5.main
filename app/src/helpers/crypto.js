import bcryptjs from 'bcryptjs';

const SALT_WORK_FACTOR = 10;

export let hashExpression = (expression) => {
    return new Promise((resolve, reject) => {
       bcryptjs.genSalt(SALT_WORK_FACTOR, (saltErr, salt) => {
           if (saltErr) return reject (err);
           bcryptjs.hash(expression, salt, (hashErr, hash) => {
               if (hashErr) return reject (hashErr);
               resolve(hash);
           });
       }); 
    });
}

export let compareToHash = (expression, hash) => {
    return new Promise((resolve, reject) => {
       bcryptjs.compare(expression, hash, (err, result) => {
          if (err) return reject(err);
          resolve({match : result}); 
       }); 
    });
}