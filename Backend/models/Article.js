const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, required: true, enum: ['Mountain', 'Beach', 'City Escapes', 'Other'] }, // Added type field
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Article', ArticleSchema);
