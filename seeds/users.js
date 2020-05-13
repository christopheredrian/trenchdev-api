
const bcrypt = require('bcryptjs');

exports.seed = async(knex) => {

  // Deletes ALL existing entries
  return knex('users').del()
    .then(async () => {
      
      const salt = await bcrypt.genSalt(10); // generate salt with 10 rounds 
      const password = await bcrypt.hash('password', salt);
      // Inserts seed entries
      return knex('users').insert([
        {id: 1, email: 'test1@test.com', password, name: "John Tester 1"},
        {id: 2, email: 'test2@test.com', password, name: "Tester 2"},
        {id: 3, email: 'test3@test.com', password, name: "Tester 3"}
      ]);
    });
};
