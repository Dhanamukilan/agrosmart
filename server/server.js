require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');

// Import routes
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter');
const cropRoutes = require('./routes/crops');
const schemeRoutes = require('./routes/schemes');
const marketRoutes = require('./routes/market');
const calculatorRoutes = require('./routes/calculator');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Serve static files (HTML, CSS, JS, images) ──────────
app.use(express.static(path.join(__dirname, '..')));

// ─── API Routes ──────────────────────────────────────────
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health check endpoint ───────────────────────────────
app.get('/api/health', async (req, res) => {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const stateMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };

    let collections = {};
    if (dbState === 1) {
        const db = mongoose.connection.db;
        const colls = await db.listCollections().toArray();
        for (const c of colls) {
            const count = await db.collection(c.name).countDocuments();
            collections[c.name] = count;
        }
    }

    res.json({
        status: 'OK',
        message: '🌾 AgroSmart server is running!',
        database: stateMap[dbState] || 'Unknown',
        dbName: mongoose.connection.name,
        collections,
        timestamp: new Date().toISOString()
    });
});

// ─── Connect to DB and Start Server ──────────────────────
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`\n🌾 ═══════════════════════════════════════════`);
        console.log(`   AgroSmart Server is running!`);
        console.log(`   🌐 URL:      http://localhost:${PORT}`);
        console.log(`   📦 Database: agrosmart`);
        console.log(`   🕐 Started:  ${new Date().toLocaleString()}`);
        console.log(`\n   📡 API Endpoints:`);
        console.log(`      GET  /api/health`);
        console.log(`      GET  /api/crops`);
        console.log(`      GET  /api/crops/:slug`);
        console.log(`      GET  /api/schemes`);
        console.log(`      GET  /api/market`);
        console.log(`      GET  /api/market/states`);
        console.log(`      POST /api/calculator`);
        console.log(`      POST /api/contact`);
        console.log(`      POST /api/newsletter`);
        console.log(``);
        console.log(`   🔐 Admin Endpoints:`);
        console.log(`      POST /api/admin/login`);
        console.log(`      GET  /api/admin/stats`);
        console.log(`      GET  /api/admin/queries`);
        console.log(`      POST /api/admin/queries/:id/reply`);
        console.log(`      CRUD /api/admin/market`);
        console.log(`      GET  /api/admin/notifications`);
        console.log(`🌾 ═══════════════════════════════════════════\n`);
    });
};

startServer();
