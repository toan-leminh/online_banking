const Joi = require('@hapi/joi');
const Account = require('../models/AccountModel');
const Transaction = require('../models/TransactionModel');

exports.listAccounts = async (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }

    try {
        const accounts = await Account.find({ created_by: req.user._id, status: 'Active' }).lean();
        res.render('user/account_list', {
            errors: {},
            data: {accounts}, 
        });
    } catch (e) {
        console.error("Error fetching accounts:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.createAccount = (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }

    res.render('user/account_create', {
        errors: {},
        data: {}, 
    });
}

exports.postCreateAccount = async (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }

    const accountSchema = Joi.object({
        _csrf: Joi.string().required(),
        account_name: Joi.string().required().messages({
            'any.required': 'This field is required',
        }),
        account_type: Joi.string().valid('Saving', 'Checking', 'Business').required().messages({
            'any.required': 'This field is required',
            'any.only': 'Invalid account type',
        }),
        address: Joi.string().required().messages({
            'any.required': 'This field is required',
        }),
        phone_number: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
            'any.required': 'This field is required',
            'string.pattern.base': 'Invalid phone number format',
        }),
    });

    const { error, value } = accountSchema.validate(req.body, {abortEarly: false});
    if (error) {
        console.log("Validated error: ", error);
        const errors = {};
        error.details.forEach((detail) => {
            errors[detail.path[0]] = detail.message;
        });

        return res.render('user/account_create', {
            errors,
            data: req.body,
        });
    }

    // Generate unique account number ( 3 attempts)
    let accountNo = Math.floor(Math.random() * 10000000).toString();
    for (let i = 0; i < 4; i++) {
        const accountExists = await Account.findOne({ account_no: accountNo });
        if (!accountExists) {
            break;
        }
        accountNo = Math.floor(Math.random() * 10000000).toString();

        if(i == 3) {
            console.error("Failed to generate unique account number after 3 attempts");
            return res.status(500).send("Internal Server Error");
        }   
    }

    try {
        const newAccount = new Account({
            account_name: value.account_name,
            account_type: value.account_type,
            address: value.address,
            phone_number: value.phone_number,
            account_no: accountNo,
            created_by: req.user.id,
            balance: 0,
        });
        await newAccount.save();

        req.flash('success', 'Account created successfully!');
        res.redirect('/user/accounts');
    } catch (e) {
        console.error("Error creating account:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.viewAccount = async (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }

    try {
        // Get account details
        const account = await Account.findOne({ _id: req.params.id, created_by: req.user._id }).lean();
        if (!account) {
            return res.status(404).send("Account not found");
        }

        // Get transactions related to this account
        const transactions = await Transaction.find({ 
            $or: [
                { from_account_no: account.account_no },
                { to_account_no: account.account_no }
            ] 
        }).sort({ created_at: -1 }).lean();

        res.render('user/account_detail', {
            errors: {},
            data: {account, transactions} 
        });

    } catch (e) {
        console.error("Error fetching account details:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.editAccount = async (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }

    try {
        const account = await Account.findOne({ _id: req.params.id, created_by: req.user._id }).lean();
        if (!account) {
            return res.status(404).send("Account not found");
        }
        res.render('user/account_edit', { 
            errors: {}, 
            data: {account},
        });
    } catch (e) {
        console.error("Error fetching account for edit:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.postEditAccount = async (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }

    const accountSchema = Joi.object({
        _csrf: Joi.string().required(),
        account_name: Joi.string().required().messages({
            'any.required': 'This field is required',
        }),
        address: Joi.string().required().messages({
            'any.required': 'This field is required',
        }),
        phone_number: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
            'any.required': 'This field is required',
            'string.pattern.base': 'Invalid phone number format',
        }),
    });

    const { error, value } = accountSchema.validate(req.body, {abortEarly: false});
    if (error) {
        console.log("Validated error: ", error);
        const errors = {};
        error.details.forEach((detail) => {
            errors[detail.path[0]] = detail.message;
        });

        return res.render('user/account_edit', {
            errors,
            data: { account: {...req.body, _id: req.params.id } },
        });
    }

    try {
        const account = await Account.findOne({ _id: req.params.id, created_by: req.user._id });
        if (!account) {
            return res.status(404).send("Account not found");
        }

        // Update account details
        account.account_name = value.account_name;
        account.address = value.address;
        account.phone_number = value.phone_number;
        await account.save();

        req.flash('success', 'Account updated successfully!');
        res.redirect('/user/accounts');
    } catch (e) {
        console.error("Error updating account:", e);
        res.status(500).send("Internal Server Error");
    }
}   