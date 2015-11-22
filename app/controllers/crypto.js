var bcryptjs = require("bcryptjs");
var salt = bcryptjs.genSaltSync(10);

function encrypt(password) {
    return bcryptjs.hashSync(password, salt);
}

exports.encrypt = encrypt;
