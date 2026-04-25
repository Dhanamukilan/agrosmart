const mongoose = require('mongoose');

const weatherLogSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        default: 0
    },
    windSpeed: {
        type: Number,
        default: 0
    },
    cloudCover: {
        type: Number,
        default: 0
    },
    precipitation: {
        type: Number,
        default: 0
    },
    weatherCondition: {
        type: String,
        default: ''
    },
    advisory: {
        type: String,
        default: ''
    },
    recordedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WeatherLog', weatherLogSchema);
