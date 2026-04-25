const mongoose = require('mongoose');

const profitCalculationSchema = new mongoose.Schema({
    landSize: {
        type: Number,
        required: true
    },
    seedCostPerAcre: {
        type: Number,
        required: true
    },
    fertilizerCostPerAcre: {
        type: Number,
        required: true
    },
    laborCostPerAcre: {
        type: Number,
        required: true
    },
    expectedYieldPerAcre: {
        type: Number,
        required: true
    },
    marketPricePerQuintal: {
        type: Number,
        required: true
    },
    totalInvestment: {
        type: Number,
        required: true
    },
    grossRevenue: {
        type: Number,
        required: true
    },
    netProfit: {
        type: Number,
        required: true
    },
    profitability: {
        type: String,
        enum: ['high', 'moderate', 'loss'],
        default: 'moderate'
    },
    userIp: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProfitCalculation', profitCalculationSchema);
