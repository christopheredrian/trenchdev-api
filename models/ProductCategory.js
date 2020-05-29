const { Model } = require('objection');
const knex = require('../db/knex');

Model.knex(knex);

class ProductCategory extends Model {

  static get tableName() {
    return 'product_categories';
  }
}

module.exports = ProductCategory;