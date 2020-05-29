const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const authMiddleware = require('../../middleware/auth');

const User = require('../../models/User');
const Account = require('../../models/Account');
const ProductCategory = require('../../models/ProductCategory');

// @route   POST api/products/
// @desc    Register user 
// @access  Public
router.get('/', authMiddleware, async (req, res) => {

    console.log(req.user);

    try {

        // see if account exists 
        const account = await Account.query().findOne({ id: req.user.account_id });

        if (!account) {
            return res.status(400).json({ errors: [{ msg: "Error in parsing account" }] });
        }

        // see if user exists 
        let user = await User.query().findOne({ account_id: req.user.account_id });

        if (!user) {
            return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const product_categories = await ProductCategory.query()
            .where('account_id', req.user.account_id);

        res.json({ product_categories });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

module.exports = router;