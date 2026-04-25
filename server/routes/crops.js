const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

// GET /api/crops — Get all crops (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let filter = { isActive: true };

        if (category) filter.category = category;
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const crops = await Crop.find(filter).sort({ name: 1 });
        res.status(200).json({ success: true, count: crops.length, data: crops });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/crops/:slug — Get single crop by slug
router.get('/:slug', async (req, res) => {
    try {
        const crop = await Crop.findOne({ slug: req.params.slug });
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found' });
        }
        res.status(200).json({ success: true, data: crop });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/crops/category/:category — Get crops by category
router.get('/category/:category', async (req, res) => {
    try {
        const crops = await Crop.find({ category: req.params.category, isActive: true }).sort({ name: 1 });
        res.status(200).json({ success: true, count: crops.length, data: crops });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
