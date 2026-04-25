const express = require('express');
const router = express.Router();
const MarketPrice = require('../models/MarketPrice');

// GET /api/market — Get all market prices (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { state, crop, search } = req.query;
        let filter = {};

        if (state) filter.state = state;
        if (crop) filter.crop = { $regex: crop, $options: 'i' };
        if (search) {
            filter.$or = [
                { crop: { $regex: search, $options: 'i' } },
                { market: { $regex: search, $options: 'i' } },
                { state: { $regex: search, $options: 'i' } }
            ];
        }

        const prices = await MarketPrice.find(filter).sort({ crop: 1 });
        res.status(200).json({ success: true, count: prices.length, data: prices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/market/states — Get all unique states
router.get('/states', async (req, res) => {
    try {
        const states = await MarketPrice.distinct('state');
        res.status(200).json({ success: true, data: states });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
