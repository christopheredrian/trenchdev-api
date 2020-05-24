const { Model } = require('objection');
const knex = require('../db/knex');

Model.knex(knex);

class Account extends Model {

  static get tableName() {
    return 'accounts';
  }
}

module.exports = Account;