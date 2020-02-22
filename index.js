'use strict'

const express = require('express')
const app = express()
const boom = require('boom')
const cors = require('cors')
require('dotenv').config()

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