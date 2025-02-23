const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    first_Name: { type: String, required: true },
    last_Name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
