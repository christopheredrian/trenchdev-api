
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('accounts').del()
    .then(function () {
      // Inserts seed entries
      return knex('accounts').insert([
        {id: 1, owner_user_id: 2, business_name: 'Déclencheur', application_type_id: 1, owner_user_id: null},
      ]);
    });
};
