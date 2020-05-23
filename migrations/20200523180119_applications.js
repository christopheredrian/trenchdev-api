
exports.up = function (knex) {
    return knex.schema.createTable('applications', t => {
        t.increments('id');
        t.string('application_name');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('applications');
};
