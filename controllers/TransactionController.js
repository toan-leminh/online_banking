const Joi = require('@hapi/joi');
const Account = require('../models/AccountModel');
const Transaction = require('../models/TransactionModel');

exports.listTransactions = async (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }
    // Get all accounts
    const accounts = await Account.find({ created_by: req.user._id, status: 'Active' }).lean();

    const searchSchema = Joi.object({
        account_no: Joi.string().optional().allow(''),
        transaction_type: Joi.string().optional().allow(''),
        description: Joi.string().optional().allow(''),
        min_amount: Joi.number().positive().optional().allow(''),
        max_amount: Joi.number().positive().optional().allow(''),
        from_date: Joi.date().optional().allow(''),
        to_date: Joi.date().optional().allow('') // Allow empty string for date fields,
    });
    
    const { error, value } = searchSchema.validate(req.query, {abortEarly: false});
    if (error) {
        console.log("Validated error: ", error);
        const errors = {};
        error.details.forEach((detail) => {
            errors[detail.path[0]] = detail.message;
        });
        transactions = [];
        return res.status(400).render('user/transaction_list', {
            errors: errors,
            data: { ...req.query, accounts, transactions }, 
        });
    }

    // Get all search parameters from query
    const { account_no, transaction_type, description, min_amount, max_amount, from_date, to_date } = req.query;

    // Check account_no belongs to the user
    if (account_no) {
        const account = accounts.find(acc => acc.account_no === account_no);
        if (!account) {
            return res.status(400).render('user/transaction_list', {
                errors: { account_no: 'Invalid account number' },
                data: { ...req.query, accounts }, 
            });
        }
    }

    // Build the query object based on search parameters
    const query = { created_by: req.user._id };

    if (account_no) {
        query.$or = [
            { from_account_no: account_no },
            { to_account_no: account_no }
        ];
    }

    if (transaction_type) {
        query.transaction_type = transaction_type;
    }

    if (description) {
        query.description = { $regex: description, $options: 'i' }; // Partial match (regex), case-insensitive(i)
    }

    if (min_amount) {
        query.amount = { ...query.amount, $gte: parseFloat(min_amount) };
    }

    if (max_amount) {
        query.amount = { ...query.amount, $lte: parseFloat(max_amount) };
    }

    if (from_date) {
        query.created_at = { ...query.created_at, $gte: new Date(from_date) };
    }

    if (to_date) {
        toDate = new Date(to_date);
        toDate.setDate(toDate.getDate() + 1); // Add 1 day to include the end date
        query.created_at = { ...query.created_at, $lte: toDate };
    }   

    try {
        const transactions = await Transaction.find(query).lean();
        res.render('user/transaction_list', {
            errors: {},
            data: {...req.query, transactions, accounts}, 
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
            'any.invalid': 'To account must be different from From account',
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