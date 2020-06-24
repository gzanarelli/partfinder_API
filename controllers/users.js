'use strict'

const router = require('express').Router()
const auth = require('../Libs/auth')
const valid = require('../Libs/validation')
const _ = require('lodash')
const User = require('../Models/UserModel')
const GeolocModel = require('../Models/GeolocModel')
const boom = require('boom')
const geoloc = require('../Libs/geoloc')
const mongoose = require('mongoose')
const validUser = require('../validator/validUser')

router.get('/',
  auth,
  async (req, res, next) => {
    User.findOne({ _id: _.get(req, 'token._id', null) }).populate('geolocation').populate('sport')
      .then(user => {
        res.json(_.omit(user, ['password', 'email']))
      })
      .catch(err => next(err))
  }
)

router.post('/',
  validUser.LIST,
  valid,
  auth,
  async (req, res, next) => {
    const data = _.pick(req.body, ['firstname', 'lastname', 'gender', 'age'])
    const coor = await geoloc(req.body.address, req.body.zipcode)
    const Id = new mongoose.Types.ObjectId()
    User.updateOne(
      { _id: _.get(req, 'token._id', null) },
      { $set: data, location: Id }
    ).then(async (user) => {
      if (!user) {
        return next(boom.unauthorized())
      }
      new GeolocModel({
        _id: Id,
        userId: req.token._id,
        address: req.body.address,
        zipcode: req.body.zipcode,
        city: req.body.city,
        'location.coordinates': [coor[0].longitude, coor[0].latitude],
        'location.type': 'Point'
      }).save()
        .then(res.json({ status: true }))
    })
      .catch(err => next(err))
  })

router.patch('/',
  validUser.PATCH,
  valid,
  auth,
  async (req, res, next) => {
    const data = _.pick(req.body, ['firstname', 'lastname', 'gender', 'age'])
    const coor = await geoloc(req.body.address, req.body.zipcode)
    User.updateOne(
      { _id: _.get(req, 'token._id', null) },
      { $set: data }
    ).then(async (user) => {
      if (!user) {
        return next(boom.unauthorized())
      }
      new GeolocModel({
        userId: req.token._id,
        address: req.body.address,
        zipcode: req.body.zipcode,
        city: req.body.city,
        'location.coordinates': [coor[0].longitude, coor[0].latitude],
        'location.type': 'Point'
      })
        .then(res.json({ status: true }))
    })
      .catch(err => next(err))
  }
)

router.delete('/:userId',
  validUser.DELETE,
  valid,
  auth,
  async (req, res, next) => {
    User.deleteOne({ _id: _.get(req, 'token._id', null) })
      .then(() => {
        res.json({ status: true })
      })
      .catch(err => next(err))
  }
)

module.exports = (app) => {
  app.use('/account', router)
}
