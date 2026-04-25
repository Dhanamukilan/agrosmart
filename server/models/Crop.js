const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    image: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['cereal', 'pulse', 'oilseed', 'cash_crop', 'vegetable', 'fruit', 'spice', 'plantation', 'millet', 'tuber'],
        required: true
    },
    soil: {
        type: String,
        required: true
    },
    season: {
        type: String,
        required: true
    },
    fertilizer: {
        type: String,
        required: true
    },
    yield: {
        type: String,
        required: true
    },
    advice: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    waterRequirement: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    growthDuration: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Auto-generate slug from name
cropSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Crop', cropSchema);
