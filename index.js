'use strict'

const express = require('express')
const app = express()
const boom = require('boom')
const cors = require('cors')
const glob = require('glob')
const path = require('path')
const router = express.Router()
const debug = require('debug')('partfinder:start:controller')

/**
 * Set configs
 */
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

/**
 * Connect to Mongo Database
 */
require('./Libs/mongo')

/**
 * Middleware controllers
 */
glob
  .sync(path.join(__dirname, '/./controllers/*.js'))
  .map(function (controller) {
    debug('Require controller %s', controller)
		require(controller)(router)
  })


/**
 * Middleware Error
 */
app.use((err, req, res, next) => {
  err = boom.boomify(err)
  res.status(err.output.statusCode).json(err.output.payload)
})

/**
 * Middleware 404 Error not found
 */
app.use((req, res, next) => {
  res.status(404).json(boom.notFound())
})


app.listen(process.env.PORT || 8181, () => console.log(`Server is up on the port ${process.env.PORT}`))