const mongoose = require('mongoose')

const refreshToken = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  token: String,
  expiresAt: {
    type: Date,
    default: Date.now + process.env.REFRESH_EXPIRE
  },
  createdOn: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('refreshToken', refreshToken)
