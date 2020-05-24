
exports.seed = function(knex) {

  // Deletes ALL existing entries
  return knex('application_types').del()
    .then(function () {
      // Inserts seed entries
      return knex('application_types').insert([
        {id: 1, name: 'shop'},
      ]);
    });
};
