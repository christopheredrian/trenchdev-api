const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrpyt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');
const Account = require('../../models/Account');
const ApplicationType = require('../../models/ApplicationType');

// @route   POST api/users
// @desc    Register user 
// @access  Public
router.post('/', [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('accountId', 'Account ID is required').not().isEmpty(),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, accountId } = req.body;

    try {

        // see if account exists 
        const account = await Account.query().findOne({ id: accountId });

        if (!account) {
            return res.status(400).json({ errors: [{ msg: "Error in parsing account" }] });
        }

        // see if user exists 
        let user = await User.query().findOne({ email, account_id: accountId });
        console.log(user);

        if (user) {
            return res.status(400).json({ errors: [{ msg: "User already exists" }] });
        }

        const userObj = {
            name,
            email,
            password,
            role: 'customer', // Default
            account_id: accountId
        };

        const salt = await bcrpyt.genSalt(10); // generate salt with 10 rounds 
        userObj.password = await bcrpyt.hash(password, salt);

        // encrypt user password using bcrpytjs 

        user = await User.query().insert(userObj)

        // return json web token 

        const payload = {
            user: {
                id: user.id,
                accountId: user.account_id,
            }
        };

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 3600 * 100 }, // 3600 seconds * 100 
            (err, token) => {
                if (err) throw err;
                console.log(token);
                res.json({ token });
            }
        );

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

module.exports = router;