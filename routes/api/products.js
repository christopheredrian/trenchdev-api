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
        const account_id = parseInt(req.header('x-account-id'));
        console.log('Request from account id: ', account_id);

        // check if no account id  
        if (!account_id) {
            return res.status(401).json({ msg: 'No account id' });
        }

        // see if account exists 
        const account = await Account.query().findOne({ id: account_id });

        if (!account) {
            return res.status(400).json({ errors: [{ msg: "Error in parsing account" }] });
        }

        const product_categories = await getAllProductCategories(account_id);

        res.json({ product_categories });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

// @route   GET api/products/parent_categories
// @desc    Get all parent product categories
// @access  Public
router.get('/parent_categories', async (req, res) => {

    try {
        const account_id = parseInt(req.header('x-account-id'));
        console.log('Request from account id: ', account_id);

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
            .andWhere('parent_id', null)
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
        const account_id = parseInt(req.header('x-account-id'));
        console.log('Request from account id: ', account_id);

        // check if no account id  
        if (!account_id) {
            return res.status(401).json({ msg: 'No account id' });
        }

        // see if account exists 
        const account = await Account.query().findOne({ id: account_id });

        if (!account) {
            return res.status(400).json({ errors: [{ msg: "Error in parsing account" }] });
        }

        const product_category = await getProductCategoryById(account_id, req.params.category_id);

        // see if category exists
        if (!product_category) {
            return res.status(400).json({ errors: [{ msg: "Category not found." }] });
        }

        // see if requested category is from requested account or if no product category
        if (parseInt(product_category.account_id) !== parseInt(account_id)) {
            return res.status(400).json({ errors: [{ msg: "Unauthorized" }] });
        }

        res.json({ product_category });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

// @route   POST api/products/upsert_product_category
// @desc    Upsert product category
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

    const { id, name, is_featured, parent_id } = req.body;

    try {
        const account_id = parseInt(req.header('x-account-id'));

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

        // see if provided parent id exists (ex. 0, 1 .. but not null)
        if (parent_id && parent_id !== null) {
            const parent_category = await ProductCategory.query().findOne({ id: parent_id });

            if (!parent_category) {
                return res.status(400).json({ errors: [{ msg: "Error in handling saving of category" }] });
            }
        }

        if (id) {
            const product_category = await ProductCategory.query().patchAndFetchById(id, {
                name,
                parent_id: parent_id ? parent_id : null,
                is_featured
            });

            return res.json({ product_category });
        } else {
            const productCategoryObj = {
                name,
                parent_id: parent_id ? parent_id : null,
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

const getAllProductCategories = async (account_id) => {
    const productCategories = await ProductCategory.query()
        .where('account_id', account_id)
        .orderBy('name', 'asc')
        .orderBy('parent_id', 'desc');

    const parentCategories = {};

    productCategories.forEach(row => {
        if (!row.parent_id) {
            // is a parent category
            parentCategories[row.id] = row;
        } else {
            // is a child
            if (parentCategories[row.parent_id].children) {
                // children array already exists
                parentCategories[row.parent_id].children.push(row);
            } else {
                // children array does not exist
                parentCategories[row.parent_id].children = [row];
            }
        }

    })

    const sortedProductCategories = Object.values(parentCategories).sort((a, b) => {
        return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
    });

    return sortedProductCategories;
}

const getProductCategoryById = async (account_id, product_category_id) => {
    const productCategory = await ProductCategory.query()
        .findOne({ id: product_category_id, account_id })

    const childCategories = await ProductCategory.query()
        .where('account_id', account_id)
        .andWhere('parent_id', product_category_id)
        .orderBy('name', 'asc');

    let product_category = {};

    if (productCategory) {
        product_category = { ...productCategory }

        if (childCategories.length !== 0) {
            product_category.children = childCategories;
        }
    } else {
        product_category = productCategory;
    }

    return product_category;
}

module.exports = router;