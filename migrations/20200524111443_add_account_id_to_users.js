
exports.up = async function (knex) {
    return knex.schema.table('users', function (t) {
        t.integer('account_id').unsigned().defaultTo(null);

        t.foreign('account_id').references('id').inTable('accounts');
    });
};

exports.down = async function (knex) {
    return knex.schema.table('users', function (t) {
        t.dropForeign('account_id');
        t.dropColumn('account_id');
    })
};
