'use strict'

const mongoose = require('mongoose')

const options = {
  useNewUrlParser: true,
  user: process.env.MONGODB_ADDON_USER,
  pass: process.env.MONGODB_ADDON_PASSWORD,
  useUnifiedTopology: true
}

if (process.env.NODE_ENV === 'development') {
  options.authSource = 'admin'
}

module.exports = connection()

function connection () {
  mongoose.connect(
    process.env.MONGODB_ADDON_URI,
    options,
    (err) => {
      if (err) {
        console.log(err)
        setTimeout(connection, 20000)
      } else {
        console.log('Db is up')
      }
    }
  )
}
