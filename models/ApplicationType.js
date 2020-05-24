const { Model } = require('objection');
const knex = require('../db/knex');

Model.knex(knex);

class ApplicationType extends Model {

  static get tableName() {
    return 'application_types';
  }
}

module.exports = Application;