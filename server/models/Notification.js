const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['query_reply', 'market_update', 'market_new', 'general'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    // For query replies — links back to the contact
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        default: null
    },
    // For market updates — links back to the market price
    marketPriceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MarketPrice',
        default: null
    },
    // Which user email should see this (null = broadcast to all)
    targetEmail: {
        type: String,
        default: null,
        trim: true,
        lowercase: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
