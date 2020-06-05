const { Model } = require('objection');
const knex = require('../db/knex');

Model.knex(knex);

class User extends Model {

    $beforeInsert() {
        this.created_at = new Date().toISOString();
    }

    $beforeUpdate() {
        this.updated_at = new Date().toISOString();
    }

    static get tableName() {
        return 'users';
    }
}

module.exports = User;