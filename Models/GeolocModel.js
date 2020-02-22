'use strict'

const mongoose = require('mongoose')
const paginate = require('mongoose-paginate')

const geolocSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'sports' },
    address: String,
    zipcode: Number,
    city: String,
    geolocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // Longitude, Latitude
            required: true
        }
    }
}).plugin(paginate)

geolocSchema.index({ 'geoloc.coordinates': '2d' })

module.exports = mongoose.model('geolocations', geolocSchema)