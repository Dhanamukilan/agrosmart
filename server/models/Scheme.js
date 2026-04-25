const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['financial', 'insurance', 'technical'],
        required: true
    },
    icon: {
        type: String,
        default: 'fa-info-circle'
    },
    color: {
        type: String,
        default: 'success'
    },
    description: {
        type: String,
        required: true
    },
    benefits: [{
        type: String
    }],
    eligibility: {
        type: String,
        default: ''
    },
    applicationLink: {
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

module.exports = mongoose.model('Scheme', schemeSchema);
