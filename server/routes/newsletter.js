const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// POST /api/newsletter — Subscribe to newsletter
router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed!'
            });
        }
        const subscriber = await Newsletter.create({ email });
        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to the newsletter!',
            data: subscriber
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
