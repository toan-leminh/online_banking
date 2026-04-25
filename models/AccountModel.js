const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    account_name: { type: String, required: true},
    account_no: { type: String, required: true, unique: true },
    account_type: { type: String, enum: ['Saving', 'Checking', 'Business'], required: true }, // 'Saving', 'Checking', 'Business'
    address: { type: String, required: true },
    phone_number: { type: String, required: true },
    balance: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Account', accountSchema);