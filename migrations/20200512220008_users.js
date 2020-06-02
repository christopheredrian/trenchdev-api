
exports.up = function (knex) {
    return knex.schema.createTable('users', t => {
        t.increments('id');
        t.string('name');
        t.enu('role', ['admin', 'business_owner', 'customer']);
        t.string('email');
        t.string('password');
        t.timestamp('created_at').defaultTo(knex.fn.now());
        t.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
