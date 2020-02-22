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

module.exports = function connection () {
		mongoose.connect(
		process.MONGODB_ADDON_URI,
		option,
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