const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  firstname: String,
  lastname: String,
  age: Number,
  gender: String,
  sport: { type: mongoose.Schema.Types.ObjectId, ref: 'sports' },
  geolocation: { type: mongoose.Schema.Types.ObjectId, ref: 'geolocations' },
  createdOn: {
    type: Date,
    default: Date.now
  },
  modifyOn: {
    type: Date,
    default: Date.now
  }
})

userSchema.pre('updateOne', function () {
  this.modifyOn = new Date()
})

module.exports = mongoose.model('users', userSchema)
