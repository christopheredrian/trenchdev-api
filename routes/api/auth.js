const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Account = require('../../models/Account');
const authMiddleware = require('../../middleware/auth');

const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');


// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', authMiddleware, async (req, res) => {

    try {
        const user = await User.query().findOne({ id: req.user.id });
        res.json(user);
    } catch (error) {
        res.status(400).json({ errors: { msg: "User not found" } });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user and get token 
// @access  Public
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;

    try {
        const account_id = parseInt(req.header('x-account-id'));
        console.log('Request from account id: ',account_id);

        // see if account exists 
        const account = await Account.query().findOne({ id: account_id });

        if (!account) {
            return res.status(400).json({ errors: [{ msg: "Error in parsing account" }] });
        }

        // see if user exists 
        let user = await User.query().findOne({ email, account_id });

        if (!user) {
            return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const salt = await bcrypt.genSalt(10); // generate salt with 10 rounds 
        user.password = await bcrypt.hash(password, salt);

        // return json web token 

        const payload = {
            user: {
                id: user.id,
                account_id: user.account_id,
            }
        };

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 3600 * 100 }, // 3600 seconds * 100 
            (err, token) => {
                if (err) throw err;
                res.json({
                    user: {
                        'name': user.name,
                        'email': user.email,
                        'role': user.role,
                        token
                    }
                });
            }
        );

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});


module.exports = router;