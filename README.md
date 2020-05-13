## Readme 

## Migrations

0. Check db credentials on `knexfile.js` (@todo pull from inidividual .env later)
1. Install knex globally `npm i -g knex`
2. migrate: `knex migrate:latest`  or `knex migrate:up` for all 
3. seed: `knex seed:run`
4. For reference on model usges check `tests/db_connect_test.js`