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
        console.log('Request from account id: ',account_id);

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
            .where('account_id', account_id)
            .orderBy('is_featured', 'desc')
            .orderBy('name', 'asc');

        res.json({ product_categories });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

// @route   GET api/products/categories/:category_id
// @desc    Get product category by id
// @access  Public
router.get('/categories/:category_id', async (req, res) => {

    try {
        const account_id = req.header('x-account-id');
        console.log('Request from account id: ',account_id);

        // check if no account id  
        if (!account_id) {
            return res.status(401).json({ msg: 'No account id' });
        }

        // see if account exists 
        const account = await Account.query().findOne({ id: account_id });

        if (!account) {
            return res.status(400).json({ errors: [{ msg: "Error in parsing account" }] });
        }

        const product_category = await ProductCategory.query().findById(req.params.category_id);

        // see if category exists
        if(!product_category) {
            return res.status(400).json({ errors: [{ msg: "Category not found." }] });
        }

        // see if requested category is from requested account or if no product category
        if(parseInt(product_category.account_id) !== parseInt(account_id) ) {
            return res.status(400).json({ errors: [{ msg: "Unauthorized" }] });
        } 

        res.json({ product_category });

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
    check('is_featured', 'Is featured flag for category is required').not().isEmpty(),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { id, name, is_featured } = req.body;

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

        if (id) {
            const product_category = await ProductCategory.query().patchAndFetchById(id, { name, is_featured });

            return res.json({ product_category });
        } else {
            const productCategoryObj = {
                name,
                is_featured,
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