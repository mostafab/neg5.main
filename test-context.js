const context = require.context('./app/public/javascript', true, /.spec\.js/);
context.keys().forEach(context);

