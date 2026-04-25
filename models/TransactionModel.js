const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    from_account_no: {type: String, required: true },
    to_account_no: {type: String, required: true },
    amount: { type: Number, required: true },
    transaction_type: { type: String, enum: ['Transfer', 'Debit', 'Credit'], required: true },
    description: { type: String },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);