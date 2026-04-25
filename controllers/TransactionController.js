const Joi = require('@hapi/joi');
const Account = require('../models/AccountModel');
const Transaction = require('../models/TransactionModel');

exports.listTransactions = async (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }

    try {
        const transactions = await Transaction.find({ created_by: req.user._id }).lean();
        res.render('user/transaction_list', {
            errors: {},
            data: {transactions}, 
        });
    } catch (e) {
        console.error("Error fetching transactions:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.createTransaction = async (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }

    try {
        const accounts = await Account.find({ created_by: req.user._id, status: 'Active' }).lean();
        res.render('user/transaction_create', {
            errors: {},
            data: {accounts}, 
        });
    } catch (e) {
        console.error("Error fetching accounts for transaction creation:", e);
        res.status(500).send("Internal Server Error");
    }
}

exports.postCreateTransaction = async (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }

    const schema = Joi.object({
        _csrf: Joi.string().required(),
        from_account: Joi.string().required(),
        to_account: Joi.string().required().invalid(Joi.ref('from_account')).messages({
            'any.required': 'This field is required',
            'any.invalid': 'To account must be different from from account',
        }),
        amount: Joi.number().positive().required(),
        transaction_type: Joi.string().valid('Transfer', 'Debit', 'Credit').required(),
        description: Joi.string().allow('')
    });

    try {
        const { error, value } = schema.validate(req.body);
        if (error) {
            const accounts = await Account.find({ created_by: req.user._id, status: 'Active' }).lean();

            console.log("Validated error: ", error);
            const errors = {};
            error.details.forEach((detail) => {
                errors[detail.path[0]] = detail.message;
            });
            return res.status(400).render('user/transaction_create', {
                errors: errors,
                data: { ...req.body, accounts },
            });
        }

        const fromAccount = await Account.findOne({ _id: value.from_account, created_by: req.user._id, status: 'Active' });
        if (!fromAccount) {
            throw new Error("From account not found or inactive");
        }

        const toAccount = await Account.findOne({ _id: value.to_account, created_by: req.user._id, status: 'Active' });
        if (!toAccount) {
            throw new Error("To account not found or inactive");
        }

        if (fromAccount.balance < value.amount) {
            throw new Error("Insufficient funds in the from account");
        }

        // Perform the transaction
        fromAccount.balance -= value.amount;
        toAccount.balance += value.amount;

        await fromAccount.save();
        await toAccount.save();

        const transaction = new Transaction({
            from_account_no: fromAccount.account_no,
            to_account_no: toAccount.account_no,
            amount: value.amount,
            transaction_type: value.transaction_type,
            description: value.description,
            created_by: req.user._id,
        });

        await transaction.save();

        req.flash('success', 'Transaction created successfully');
        res.redirect('/user/transactions');
    } catch (e) {
        console.error("Error creating transaction:", e);
        const accounts = await Account.find({ created_by: req.user._id, status: 'Active' }).lean();
        res.status(500).render('user/transaction_create', {
            errors: { general: e.message },
            data: { ...req.body, accounts }        
        });
    }
}

exports.viewTransaction = async (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }

    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, created_by: req.user._id }).lean();
        if (!transaction) {
            return res.status(404).send("Transaction not found");
        }

        res.render('user/transaction_detail', {
            errors: {},
            data: {transaction}, 
        });
    } catch (e) {
        console.error("Error fetching transaction details:", e);
        res.status(500).send("Internal Server Error");
    }
}