'use strict'

const router = require('express').Router()
const auth = require('../Libs/auth')
const valid = require('../Libs/validation')
const _ = require('lodash')
const User = require('../Models/UserModel')
const GeolocModel = require('../Models/GeolocModel')
const { body } = require('express-validator')
const boom = require('boom')
const geoloc = require('../Libs/geoloc')
const mongoose = require('mongoose')

router.get('/',
  auth,
  async (req, res, next) => {
    User.findOne({ _id: _.get(req, 'token.payload.user._id', null) }).populate('geolocation').populate('sport')
      .then(user => {
        console.log(req.token)
        console.log('arrived')
        res.json(_.omit(user, ['password', 'email']))
      })
      .catch(err => next(err))
  }
)

router.post('/',
  body('firstname')
    .exists()
    .isString(),
  body('lastname')
    .exists()
    .isString(),
  body('gender')
    .exists()
    .isString()
    .isIn(['male', 'female'])
    .withMessage('Only male or female accepted'),
  body('age')
    .exists()
    .isNumeric(),
  body('address')
    .exists()
    .isString(),
  body('zipcode')
    .exists()
    .isNumeric(),
  body('city')
    .exists()
    .isString(),
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
      await new GeolocModel({
        _id: Id,
        userId: req.token._id,
        address: req.body.address,
        zipcode: req.body.zipcode,
        city: req.body.city,
        'location.coordinates': [coor[0].longitude, coor[0].latitude],
        'location.type': 'Point'
      }).save()
      res.json({ status: true })
    })
      .catch(err => next(err))
  })

router.patch('/',
  body('firstname')
    .exists()
    .isString(),
  body('lastname')
    .exists()
    .isString(),
  body('gender')
    .exists()
    .isString()
    .isIn(['male', 'female'])
    .withMessage('Only male or female accepted'),
  body('age')
    .exists()
    .isNumeric(),
  body('address')
    .exists()
    .isString(),
  body('zipcode')
    .exists()
    .isNumeric(),
  body('city')
    .exists()
    .isString(),
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
      await new GeolocModel({
        userId: req.token._id,
        address: req.body.address,
        zipcode: req.body.zipcode,
        city: req.body.city,
        'location.coordinates': [coor[0].longitude, coor[0].latitude],
        'location.type': 'Point'
      })
      res.json({ status: true })
    })
      .catch(err => next(err))
  }
)

router.delete('/:userId',
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
