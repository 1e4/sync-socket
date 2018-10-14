exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('room_members', function(table) {
            table.integer('user_id').unsigned().references('users.id');
            table.integer('room_id').unsigned().references('rooms.id');
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('room_members')
    ])
};