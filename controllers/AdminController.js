const Joi = require('@hapi/joi');
const Account = require('../models/AccountModel');
const Transaction = require('../models/TransactionModel');
const User = require('../models/UserModel');

exports.listAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({}).populate('created_by', 'username').lean();

        res.render('admin/account_list', {
            errors: {},
            data: {accounts}, 
        });
    } catch (e) {
        console.error("Error fetching accounts:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.editAccount = async (req, res) => {
    try {
        const account = await Account.findOne({ _id: req.params.id }).lean();
        if (!account) {
            return res.status(404).send("Account not found");
        }
        res.render('admin/account_edit', { 
            errors: {}, 
            data: {account},
        });
    } catch (e) {
        console.error("Error fetching account for edit:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.postEditAccount = async (req, res) => {
    try {
        const account = await Account.findOne({ _id: req.params.id }).lean();
        if (!account) {
            return res.status(404).send("Account not found");
        }
        
        const schema = Joi.object({
            _csrf: Joi.string().required(),
            //account_no: Joi.string().required(),
            // account_name: Joi.string().required(),
            // address: Joi.string().required(),
            // phone: Joi.string().required(),
            // account_type: Joi.string().valid('Saving', 'Checking', 'Business').required(),
            balance: Joi.number().min(0).required(),
            status: Joi.string().valid('Active', 'Inactive').required(),
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            console.log("Validated error: ", error);
            return res.status(400).render('admin/account_edit', {
                errors: error.details.reduce((acc, curr) => ({ ...acc, [curr.path[0]]: curr.message }), {}),
                data: {account: {...account, ...req.body}},
            });
        }

        await Account.updateOne({ _id: req.params.id }, {
            balance: value.balance,
            status: value.status,
        });

        req.flash('success', 'Account updated successfully');
        res.redirect('/admin/accounts');
    } catch (e) {
        console.error("Error updating account:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.listUsers = async (req, res) => {
    try {
        const users = await User.find({}).lean();

        res.render('admin/user_list', {
            errors: {},
            data: {users}, 
        });
    } catch (e) {
        console.error("Error fetching users:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.editUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id }).lean();
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.render('admin/user_edit', { 
            errors: {}, 
            data: {user},
        });
    }   catch (e){
        console.error("Error fetching user for edit:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.postEditUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id }).lean();
        if (!user) {
            return res.status(404).send("User not found");
        }
        
        const schema = Joi.object({
            _csrf: Joi.string().required(),
            status: Joi.string().valid('Active', 'Inactive').required(),
            is_admin: Joi.boolean().required(),
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            console.log("Validated error: ", error);
            return res.status(400).render('admin/user_edit', {
                errors: error.details.reduce((acc, curr) => ({ ...acc, [curr.path[0]]: curr.message }), {}),
                data: {user: {...user, ...req.body}},
            });
        }

        await User.updateOne({ _id: req.params.id }, {
            status: value.status,
            is_admin: value.is_admin,
        });

        req.flash('success', 'User updated successfully');
        res.redirect('/admin/users');
    } catch (e) {
        console.error("Error updating user:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.listTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({}).populate('created_by', 'username').lean();

        res.render('admin/transaction_list', {
            errors: {},
            data: {transactions}, 
        });
    } catch (e) {
        console.error("Error fetching transactions:", e);
        res.status(500).send("Internal Server Error");
    }
}