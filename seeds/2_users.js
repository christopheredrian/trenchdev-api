
const bcrypt = require('bcryptjs');

exports.seed = async(knex) => {

  // Deletes ALL existing entries
  return knex('users').del()
    .then(async () => {
      
      const salt = await bcrypt.genSalt(10); // generate salt with 10 rounds 
      const password = await bcrypt.hash('password', salt);
      // Inserts seed entries
      // Manually set account_id in database
      return knex('users').insert([
        {email: 'admin@test.com', password, name: "Admin", role: 'admin', account_id: null},
        {email: 'test1@test.com', password, name: "John Tester 1", role: 'business_owner', account_id: null},
        {email: 'test2@test.com', password, name: "Tester 2", role: 'customer', account_id: null},
        {email: 'test3@test.com', password, name: "Tester 3", role: 'customer', account_id: null},
        
      ]);
    });
};
