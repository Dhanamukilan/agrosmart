const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: String, enum: ['user', 'admin'], required: true },
    text: { type: String, required: true, trim: true },
    sentAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    subject: { type: String, trim: true },
    message: { type: String, required: [true, 'Message is required'], trim: true },
    status: { type: String, enum: ['pending', 'replied', 'closed'], default: 'pending' },
    conversation: { type: [messageSchema], default: [] },
    adminReply: { type: String, trim: true, default: '' },
    repliedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
