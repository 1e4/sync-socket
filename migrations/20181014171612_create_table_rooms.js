exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('rooms', function(table) {
            table.increments();
            table.string('name');
            // Slug is combo of id and slug option
            table.string('slug');
            table.string('password');
            table.timestamps();
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('rooms')
    ])
};