const express = require('express');
const router = express.Router();
const ProfitCalculation = require('../models/ProfitCalculation');

// POST /api/calculator — Save a profit calculation
router.post('/', async (req, res) => {
    try {
        const { landSize, seedCostPerAcre, fertilizerCostPerAcre, laborCostPerAcre, expectedYieldPerAcre, marketPricePerQuintal } = req.body;

        const totalInvestment = (seedCostPerAcre + fertilizerCostPerAcre + laborCostPerAcre) * landSize;
        const grossRevenue = expectedYieldPerAcre * landSize * marketPricePerQuintal;
        const netProfit = grossRevenue - totalInvestment;

        let profitability = 'moderate';
        if (netProfit > totalInvestment * 0.5) profitability = 'high';
        else if (netProfit <= 0) profitability = 'loss';

        const calculation = await ProfitCalculation.create({
            landSize,
            seedCostPerAcre,
            fertilizerCostPerAcre,
            laborCostPerAcre,
            expectedYieldPerAcre,
            marketPricePerQuintal,
            totalInvestment,
            grossRevenue,
            netProfit,
            profitability,
            userIp: req.ip
        });

        res.status(201).json({
            success: true,
            data: calculation
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// GET /api/calculator — Get all calculations
router.get('/', async (req, res) => {
    try {
        const calculations = await ProfitCalculation.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ success: true, count: calculations.length, data: calculations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
