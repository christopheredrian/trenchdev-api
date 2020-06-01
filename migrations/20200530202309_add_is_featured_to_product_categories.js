
exports.up = function (knex) {
    return knex.schema.table('product_categories', function (t) {
        t.boolean('is_featured').defaultTo(false);
    })
};

exports.down = function (knex) {
    return knex.schema.table('product_categories', function (table) {
        table.dropColumn('is_featured');
    })
};
