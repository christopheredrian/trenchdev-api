
exports.up = function (knex) {
    return knex.schema.createTable('application_types', t => {
        t.increments('id');
        t.string('name');
        t.timestamp('created_at').defaultTo(knex.fn.now());
        t.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('application_types');
};
