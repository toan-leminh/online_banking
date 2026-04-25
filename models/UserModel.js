const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    is_admin: { type: Boolean, required: true, default: false},
    is_activate: { type: Boolean, required: true, default: false}
});

// Middleware encrypt password before save  with bscrypt
userSchema.pre('save', async function() {
    if (this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }
});

module.exports = mongoose.model('User', userSchema);