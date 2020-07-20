const mongoose = require('mongoose')

const sportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  geolocation: { type: mongoose.Schema.Types.ObjectId, ref: 'geolocations' },
  sport: [
    new mongoose.Schema({
      _id: String,
      value: String,
      level: Number,
      availability: [
        new mongoose.Schema({
          day: String,
          startAt: Number,
          endAt: Number
        })]
    })]
})

module.exports = mongoose.model('sports', sportSchema)
