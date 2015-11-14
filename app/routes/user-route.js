var users = require('../../app/controllers/user-controller');

module.exports = function(app) {
    app.route('/register')
        .post(users.create);

    app.route("/home")
        .post(users.login)
        .get(users.login);
        
};
