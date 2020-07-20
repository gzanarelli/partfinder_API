const mongoose = require('mongoose')

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  refreshToken: [new mongoose.Schema({
    token: String,
    date: {
      type: Date,
      default: Date.now
    },
    userAgent: String
  })],
  createAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('refreshTokens', refreshTokenSchema)
