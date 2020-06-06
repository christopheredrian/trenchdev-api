
exports.up = function (knex) {
    return knex.schema.createTable('products', t => {
        t.increments('id');
        t.integer('category_id').unsigned().notNullable();
        t.string('name');
        t.timestamp('created_at').defaultTo(knex.fn.now());
        t.timestamp('updated_at').defaultTo(knex.fn.now());
        t.timestamp('deleted_at').nullable().defaultTo(null);

        t.foreign('category_id').references('id').inTable('product_categories');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('products');
};
