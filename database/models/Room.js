let db = require('../index'),
    User = require('./User');

let Room = db.Model.extend({
    tableName: 'rooms',
    users: function () {
        return this.hasMany(User);
    }
});

module.exports = Room;