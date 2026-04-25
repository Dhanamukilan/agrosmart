const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');

// GET /api/schemes — Get all schemes (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let filter = { isActive: true };

        if (category && category !== 'all') filter.category = category;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const schemes = await Scheme.find(filter).sort({ title: 1 });
        res.status(200).json({ success: true, count: schemes.length, data: schemes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
