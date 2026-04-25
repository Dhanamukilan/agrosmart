const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact — Submit a contact form
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const contact = await Contact.create({ name, email, subject, message });
        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully!',
            data: contact
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// GET /api/contact — Get all contact submissions
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
