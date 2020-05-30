const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Account = require('../../models/Account');
const ProductCategory = require('../../models/ProductCategory');

// @route   POST api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', async (req, res) => {

    try {
        const account_id = req.header('x-account-id');
        console.log(account_id);

        // check if no account id  
        if (!account_id) {
            return res.status(401).json({ msg: 'No account id' });
        }

        // see if account exists 
        const account = await Account.query().findOne({ id: account_id });

        if (!account) {
            return res.status(400).json({ errors: [{ msg: "Error in parsing account" }] });
        }

        const product_categories = await ProductCategory.query()
            .where('account_id', account_id);

        res.json({ product_categories });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

// @route   POST api/products/upsert_product_category
// @desc    Upsert product
// @access  Private
router.post('/upsert_product_category', [
    auth,
    check('name', 'Category name is required').not().isEmpty(),
    check('description', 'Please include category description').not().isEmpty(),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { product_id, name, description } = req.body;

    try {
        const account_id = req.header('x-account-id');

        // check if no account id  
        if (!account_id) {
            return res.status(401).json({ msg: 'No account id' });
        }

        // see if account exists 
        const account = await Account.query().findOne({ id: account_id });

        if (!account) {
            return res.status(400).json({ errors: [{ msg: "Error in handling saving of category" }] });
        }

        // see if user exists 
        let user = await User.query().findOne({ id: req.user.id, account_id });

        if (!user) {
            return res.status(400).json({ errors: [{ msg: "Error in handling saving of category" }] });
        }

        if (product_id) {
            const product_category = await ProductCategory.query().patchAndFetchById(product_id, { name, description });

            return res.json({ product_category });
        } else {
            const productCategoryObj = {
                name,
                description,
                account_id
            };

            const product_category = await ProductCategory.query().insert(productCategoryObj)

            return res.json({ product_category });
        }


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

module.exports = router;