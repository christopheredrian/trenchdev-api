// Update with your config settings.

module.exports = {

  development: {
    client: process.env.DB_CLIENT || 'mysql2',
    connection: {
      database: process.env.DB_NAME || '',
      user:     process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || ''
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: process.env.DB_CLIENT || 'mysql2',
    connection: {
      database: process.env.DB_NAME || '',
      user:     process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || ''
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: process.env.DB_CLIENT || 'mysql2',
    connection: {
      database: process.env.DB_NAME || '',
      user:     process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || ''
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
