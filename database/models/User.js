let db = require('../index');

let User = db.Model.extend({
    tableName: 'users',

});

module.exports = User;