const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    account_type: { type: String, required: true }, // e.g., 'Savings', 'Checking'
    balance: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Account', accountSchema);