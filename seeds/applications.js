
exports.seed = function(knex) {

  // Deletes ALL existing entries
  return knex('applications').del()
    .then(function () {
      // Inserts seed entries
      return knex('applications').insert([
        {id: 1, application_name: 'shop'},
      ]);
    });
};
