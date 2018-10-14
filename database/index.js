const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: "./storage/database/sqlite/db.sqlite",
    }
});

const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;