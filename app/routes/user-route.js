var users = require('../../app/controllers/user-controller');

module.exports = function(app) {
    app.route('/users/register')
        .post(users.create);
};
