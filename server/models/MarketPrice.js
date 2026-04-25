const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
    crop: {
        type: String,
        required: true,
        trim: true
    },
    market: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'quintal'
    },
    trend: {
        type: String,
        enum: ['up', 'down', 'stable'],
        default: 'stable'
    },
    trendPercent: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
