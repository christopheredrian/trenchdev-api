const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Account = require('../../models/Account');
const ProductCategory = require('../../models/ProductCategory');

// @route   GET api/product_categories
// @desc    Get all product categories
// @access  Public
router.get('/', async (req, res) => {

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

// @route   GET api/product_categories/parent_categories
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
            .andWhere('deleted_at', null)
            .andWhere('parent_id', null)
            .orderBy('name', 'asc');

        res.json({ product_categories });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

// @route   GET api/product_categories/:category_id
// @desc    Get product category by id
// @access  Public
router.get('/:category_id', async (req, res) => {

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

// @route   POST api/product_categories/upsert
// @desc    Upsert product category
// @access  Private
router.post('/upsert', [
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

        // see if not admin or business owner 
        if (user.account_id !== account_id && (user.role !== 'business_owner' || user.role !== 'admin')) {
            return res.status(401).json({ errors: [{ msg: "Unauthorized" }] });
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

// @route   GET api/product_categories/delete/:category_id
// @desc    Delete product category
// @access  Private
router.get('/delete/:category_id', auth, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

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

        // see if not admin or business owner 
        if (user.account_id !== account_id && (user.role !== 'business_owner' || user.role !== 'admin')) {
            return res.status(401).json({ errors: [{ msg: "Unauthorized" }] });
        }

        const t_product_category = await ProductCategory.query().findOne({ id: req.params.category_id });

        if (!t_product_category) {
            return res.status(404).json({ errors: [{ msg: "Category not found" }] });
        }

        if (t_product_category.deleted_at !== null) {
            return res.status(400).json({ errors: [{ msg: "Category already deleted" }] });
        }

        console.log(`Category to delete: ID = ${t_product_category.id}  NAME = ${t_product_category.name}`);

        const deleted_at = new Date().toISOString();

        const product_category = await ProductCategory.query()
            .patchAndFetchById(req.params.category_id, { deleted_at, is_featured: false });

        const numUpdated = await ProductCategory.query()
            .patch({ deleted_at, is_featured: false })
            .where('parent_id', req.params.category_id);

        return res.json({ product_category });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

// @route   POST api/product_categories/toggle_is_archived/:category_id
// @desc    Disable product category
// @access  Private
router.get('/toggle_is_archived/:category_id', auth, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

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

        // see if not admin or business owner 
        if (user.account_id !== account_id && (user.role !== 'business_owner' || user.role !== 'admin')) {
            return res.status(401).json({ errors: [{ msg: "Unauthorized" }] });
        }

        const t_product_category = await ProductCategory.query().findOne({ id: req.params.category_id });

        if (!t_product_category) {
            return res.status(404).json({ errors: [{ msg: "Category not found" }] });
        }

        console.log(`Category to toggle is_archived flag: ID = ${t_product_category.id}  NAME = ${t_product_category.name}`);

        const product_category = await ProductCategory.query()
            .patchAndFetchById(req.params.category_id, {
                is_archived: !t_product_category.is_archived,
                is_featured: false
            });

        const numUpdated = await ProductCategory.query()
            .patch({
                is_archived: !t_product_category.is_archived,
                is_featured: false
            })
            .where('parent_id', req.params.category_id);

        return res.json({ product_category });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

// @route   POST api/product_categories/toggle_is_featured/:category_id
// @desc    Disable product category
// @access  Private
router.get('/toggle_is_featured/:category_id', auth, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

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

        // see if not admin or business owner 
        if (user.account_id !== account_id && (user.role !== 'business_owner' || user.role !== 'admin')) {
            return res.status(401).json({ errors: [{ msg: "Unauthorized" }] });
        }

        const t_product_category = await ProductCategory.query().findOne({ id: req.params.category_id });

        if (!t_product_category) {
            return res.status(404).json({ errors: [{ msg: "Category not found" }] });
        }

        console.log(`Category to toggle is_featured flag: ID = ${t_product_category.id}  NAME = ${t_product_category.name}`);

        const product_category = await ProductCategory.query()
            .patchAndFetchById(req.params.category_id, { is_featured: !t_product_category.is_featured });

        return res.json({ product_category });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }

});

const getAllProductCategories = async (account_id) => {
    const productCategories = await ProductCategory.query()
        .where('account_id', account_id)
        .andWhere('deleted_at', null)
        .orderBy('parent_id', 'desc')
        .orderBy('name', 'asc');

    const parentCategories = {};

    productCategories.forEach(row => {
        if (!row.parent_id) {
            // is a parent category
            parentCategories[row.id] = row;
        } else {
            // is a child
            if (parentCategories[row.parent_id] && parentCategories[row.parent_id].children) {
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
        .findOne({ id: product_category_id, account_id, deleted_at: null })

    const childCategories = await ProductCategory.query()
        .where('account_id', account_id)
        .andWhere('deleted_at', null)
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