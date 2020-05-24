
exports.up = function (knex) {
    return knex.schema.createTable('accounts', t => {
        t.increments('id');
        t.integer('owner_user_id').unsigned();
        t.string('business_name').notNullable();
        t.integer('application_type_id').unsigned().notNullable();
        t.timestamp('created_at').defaultTo(knex.fn.now());
        t.timestamp('updated_at').defaultTo(knex.fn.now());
        
        t.foreign('owner_user_id').references('id').inTable('users');
        t.foreign('application_type_id').references('id').inTable('application_types');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('accounts');
};
