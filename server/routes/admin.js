const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const MarketPrice = require('../models/MarketPrice');
const Notification = require('../models/Notification');
const Newsletter = require('../models/Newsletter');
const Crop = require('../models/Crop');
const Scheme = require('../models/Scheme');

const ADMIN_EMAIL = 'agrosmart@gmail.com';
const ADMIN_PASSWORD = 'agro123';

// ─── Admin Login ─────────────────────────────────────────
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });
    if (email.toLowerCase().trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        return res.json({ success: true, message: 'Admin login successful!', data: { email: ADMIN_EMAIL, role: 'admin' } });
    }
    return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
});

// ─── Dashboard Stats ─────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const [totalQueries, pendingQueries, repliedQueries, totalMarketPrices, totalSubscribers, totalNotifications, totalCrops, totalSchemes] = await Promise.all([
            Contact.countDocuments(), Contact.countDocuments({ status: 'pending' }), Contact.countDocuments({ status: 'replied' }),
            MarketPrice.countDocuments(), Newsletter.countDocuments(), Notification.countDocuments(),
            Crop.countDocuments(), Scheme.countDocuments()
        ]);
        res.json({ success: true, data: { totalQueries, pendingQueries, repliedQueries, totalMarketPrices, totalSubscribers, totalNotifications, totalCrops, totalSchemes } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ═══════════════════════════════════════════════════════════
//  CONTACT QUERIES + CONVERSATION
// ═══════════════════════════════════════════════════════════
router.get('/queries', async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status && status !== 'all') filter.status = status;
        const queries = await Contact.find(filter).sort({ updatedAt: -1 });
        res.json({ success: true, count: queries.length, data: queries });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// GET single query with conversation
router.get('/queries/:id', async (req, res) => {
    try {
        const query = await Contact.findById(req.params.id);
        if (!query) return res.status(404).json({ success: false, message: 'Query not found.' });
        res.json({ success: true, data: query });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// POST reply (adds to conversation)
router.post('/queries/:id/reply', async (req, res) => {
    try {
        const { reply } = req.body;
        if (!reply || !reply.trim()) return res.status(400).json({ success: false, message: 'Reply is required.' });
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ success: false, message: 'Query not found.' });

        contact.conversation.push({ sender: 'admin', text: reply.trim() });
        contact.adminReply = reply.trim();
        contact.status = 'replied';
        contact.repliedAt = new Date();
        await contact.save();

        await Notification.create({
            type: 'query_reply', title: 'Expert Reply Received',
            message: `Your query "${contact.subject || contact.message.substring(0, 40)}..." has been answered.`,
            contactId: contact._id, targetEmail: contact.email
        });
        res.json({ success: true, message: 'Reply sent!', data: contact });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// POST user reply (adds to conversation from user side)
router.post('/queries/:id/user-reply', async (req, res) => {
    try {
        const { reply, email } = req.body;
        if (!reply || !reply.trim()) return res.status(400).json({ success: false, message: 'Reply is required.' });
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ success: false, message: 'Query not found.' });

        contact.conversation.push({ sender: 'user', text: reply.trim() });
        contact.status = 'pending'; // re-open for admin attention
        await contact.save();

        await Notification.create({
            type: 'query_reply', title: 'User Follow-up',
            message: `${contact.name} replied to query "${contact.subject || contact.message.substring(0, 40)}..."`,
            contactId: contact._id, targetEmail: null // admin broadcast
        });
        res.json({ success: true, message: 'Reply sent!', data: contact });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/queries/:id', async (req, res) => {
    try {
        const c = await Contact.findByIdAndDelete(req.params.id);
        if (!c) return res.status(404).json({ success: false, message: 'Not found.' });
        res.json({ success: true, message: 'Deleted.' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ═══════════════════════════════════════════════════════════
//  MARKET PRICE MANAGEMENT
// ═══════════════════════════════════════════════════════════
router.get('/market', async (req, res) => {
    try { const p = await MarketPrice.find().sort({ crop: 1 }); res.json({ success: true, count: p.length, data: p }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/market', async (req, res) => {
    try {
        const { crop, market, state, price, unit, trend, trendPercent } = req.body;
        if (!crop || !market || !state || !price) return res.status(400).json({ success: false, message: 'All fields required.' });
        const np = await MarketPrice.create({ crop: crop.trim(), market: market.trim(), state: state.trim(), price: parseFloat(price), unit: unit || 'quintal', trend: trend || 'stable', trendPercent: parseFloat(trendPercent) || 0, lastUpdated: new Date() });
        await Notification.create({ type: 'market_new', title: 'New Market Price', message: `${crop} @ ₹${parseFloat(price).toLocaleString()}/${unit||'quintal'} at ${market}, ${state}.`, marketPriceId: np._id, targetEmail: null });
        res.status(201).json({ success: true, message: `${crop} added & users notified!`, data: np });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/market/:id', async (req, res) => {
    try {
        const old = await MarketPrice.findById(req.params.id);
        if (!old) return res.status(404).json({ success: false, message: 'Not found.' });
        const { price, trend, trendPercent } = req.body;
        const upd = {}; if (price !== undefined) upd.price = parseFloat(price); if (trend) upd.trend = trend; if (trendPercent !== undefined) upd.trendPercent = parseFloat(trendPercent); upd.lastUpdated = new Date();
        const updated = await MarketPrice.findByIdAndUpdate(req.params.id, upd, { new: true });
        const dir = parseFloat(price) > old.price ? '📈 increased' : parseFloat(price) < old.price ? '📉 decreased' : 'unchanged';
        await Notification.create({ type: 'market_update', title: 'Price Updated', message: `${updated.crop} ${dir}: ₹${old.price}→₹${parseFloat(price)}/${updated.unit} at ${updated.market}.`, marketPriceId: updated._id, targetEmail: null });
        res.json({ success: true, message: `${updated.crop} updated!`, data: updated });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/market/:id', async (req, res) => {
    try { const p = await MarketPrice.findByIdAndDelete(req.params.id); if (!p) return res.status(404).json({ success: false, message: 'Not found.' }); res.json({ success: true, message: 'Deleted.' }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ═══════════════════════════════════════════════════════════
//  CROP ADVISORY MANAGEMENT
// ═══════════════════════════════════════════════════════════
router.get('/crops', async (req, res) => {
    try { const c = await Crop.find().sort({ name: 1 }); res.json({ success: true, count: c.length, data: c }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/crops', async (req, res) => {
    try {
        const { name, category, soil, season, fertilizer, yield: yld, advice, waterRequirement, growthDuration } = req.body;
        if (!name || !category) return res.status(400).json({ success: false, message: 'Name and category required.' });
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const crop = await Crop.create({ name, slug, category, soil, season, fertilizer, yield: yld, advice, waterRequirement: waterRequirement || 'medium', growthDuration, image: 'default.jpg' });
        await Notification.create({ type: 'general', title: 'New Crop Advisory', message: `Advisory for "${name}" has been added with planting tips.`, targetEmail: null });
        res.status(201).json({ success: true, message: `${name} advisory added!`, data: crop });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/crops/:id', async (req, res) => {
    try {
        const crop = await Crop.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
        if (!crop) return res.status(404).json({ success: false, message: 'Not found.' });
        await Notification.create({ type: 'general', title: 'Crop Advisory Updated', message: `Advisory for "${crop.name}" has been updated.`, targetEmail: null });
        res.json({ success: true, message: `${crop.name} updated!`, data: crop });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/crops/:id', async (req, res) => {
    try { const c = await Crop.findByIdAndDelete(req.params.id); if (!c) return res.status(404).json({ success: false, message: 'Not found.' }); res.json({ success: true, message: 'Deleted.' }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ═══════════════════════════════════════════════════════════
//  SCHEMES MANAGEMENT
// ═══════════════════════════════════════════════════════════
router.get('/schemes', async (req, res) => {
    try { const s = await Scheme.find().sort({ title: 1 }); res.json({ success: true, count: s.length, data: s }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/schemes', async (req, res) => {
    try {
        const { title, category, description, benefits, eligibility, applicationLink, icon, color } = req.body;
        if (!title || !category) return res.status(400).json({ success: false, message: 'Title and category required.' });
        const scheme = await Scheme.create({ title, category, description, benefits: benefits || [], eligibility, applicationLink, icon: icon || 'fa-seedling', color: color || 'success' });
        await Notification.create({ type: 'general', title: 'New Scheme Added', message: `Government scheme "${title}" is now available. Check eligibility!`, targetEmail: null });
        res.status(201).json({ success: true, message: `${title} added!`, data: scheme });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/schemes/:id', async (req, res) => {
    try {
        const s = await Scheme.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
        if (!s) return res.status(404).json({ success: false, message: 'Not found.' });
        await Notification.create({ type: 'general', title: 'Scheme Updated', message: `Scheme "${s.title}" details have been updated.`, targetEmail: null });
        res.json({ success: true, message: `${s.title} updated!`, data: s });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/schemes/:id', async (req, res) => {
    try { const s = await Scheme.findByIdAndDelete(req.params.id); if (!s) return res.status(404).json({ success: false, message: 'Not found.' }); res.json({ success: true, message: 'Deleted.' }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ═══════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════════════════
router.get('/notifications', async (req, res) => {
    try {
        const { email } = req.query;
        let filter = email ? { $or: [{ targetEmail: email.toLowerCase().trim() }, { targetEmail: null }] } : { targetEmail: null };
        const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
        const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });
        res.json({ success: true, count: notifications.length, unreadCount, data: notifications });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/notifications/:id/read', async (req, res) => {
    try { await Notification.findByIdAndUpdate(req.params.id, { isRead: true }); res.json({ success: true }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/notifications/read-all', async (req, res) => {
    try {
        const { email } = req.body;
        let filter = email ? { $or: [{ targetEmail: email.toLowerCase() }, { targetEmail: null }], isRead: false } : { isRead: false };
        await Notification.updateMany(filter, { isRead: true });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET user's queries (for conversation on non-admin side)
router.get('/my-queries', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: 'Email required.' });
        const queries = await Contact.find({ email: email.toLowerCase() }).sort({ updatedAt: -1 });
        res.json({ success: true, count: queries.length, data: queries });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
