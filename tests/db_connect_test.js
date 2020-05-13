const knex = require('../db/knex');
const User = require('../models/User');

const main = async () => {

    try {
        /**
        * Knex usage
        */
        const rows = await knex.select('*')
            .from('users');

        console.table(rows);

        /**
         * Objection usage
         */

        const user = await User.query().select('*')
            .where('id', 2)
            .first();

        console.table(user);

    } catch (error) {
        
        console.error(error.message);
    } finally {
        knex.destroy();
    }

};

main();