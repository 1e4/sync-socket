exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', function(table) {
            table.increments();
            table.string('name');
            table.string('email').unique();
            table.string('password');
            table.timestamps();
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('users')
    ])
};
