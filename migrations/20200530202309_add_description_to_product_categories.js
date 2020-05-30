
exports.up = function (knex) {
    return knex.schema.table('product_categories', function (t) {
        t.string('description');
    })
};

exports.down = function (knex) {
    return knex.schema.table('product_categories', function (table) {
        table.dropColumn('description');
    })
};
