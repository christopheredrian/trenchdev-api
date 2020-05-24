
exports.up = function (knex) {
    return knex.schema.table('users', function (t) {
        t.enu('role', ['admin', 'business_owner', 'customer']);
    })
};

exports.down = function (knex) {
    return knex.schema.table('users', function (table) {
        table.dropColumn('role');
    })
};
