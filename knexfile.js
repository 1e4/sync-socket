// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './storage/database/sqlite/db.sqlite'
    }
  },

  staging: {
    // client: 'postgresql',
    // connection: {
    //   database: 'my_db',
    //   user:     'username',
    //   password: 'password'
    // },
    // pool: {
    //   min: 2,
    //   max: 10
    // },
    // migrations: {
    //   tableName: 'knex_migrations'
    // }

      client: 'sqlite3',
      connection: {
          filename: './storage/database/sqlite/db.sqlite'
      }
  },

  production: {

      client: 'sqlite3',
      connection: {
          filename: './storage/database/sqlite/db.sqlite'
      }
    // client: 'postgresql',
    // connection: {
    //   database: 'my_db',
    //   user:     'username',
    //   password: 'password'
    // },
    // pool: {
    //   min: 2,
    //   max: 10
    // },
    // migrations: {
    //   tableName: 'knex_migrations'
    // }
  }

};
