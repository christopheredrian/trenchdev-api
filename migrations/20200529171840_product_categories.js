
exports.up = function (knex) {
    return knex.schema.createTable('product_categories', t => {
        t.increments('id');
        t.string('name');
        t.boolean('is_featured').defaultTo(false);
        t.boolean('is_archived').defaultTo(false);
        t.integer('parent_id').unsigned().nullable().defaultTo(null);
        t.integer('account_id').unsigned().notNullable();
        t.timestamp('created_at').defaultTo(knex.fn.now());
        t.timestamp('updated_at').defaultTo(knex.fn.now());
        t.timestamp('deleted_at').nullable().defaultTo(null);

        t.foreign('parent_id').references('id').inTable('product_categories');
        t.foreign('account_id').references('id').inTable('accounts');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('product_categories');
};
