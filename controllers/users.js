'use strict'

const router = require('express').Router()
const auth = require('../Libs/auth')
const valid = require('../Libs/validation')
const validator = require('../validators/users')
const _ = require('lodash')
const User = require('../Models/UserModel')
const GeolocModel = require('../Models/GeolocModel')
const boom = require('boom')
const geoloc = require('../Libs/geoloc')
const mongoose = require('mongoose')

router.get('/',
  auth,
  async (req, res, next) => {
    (await User.findOne({ _id: _.get(req, 'token.payload.user._id', null) }).populate('geolocation')).populate('sport')
      .then(user => {
        res.json(_.omit(user.toObject(), ['password', 'email']))
      })
      .catch(err => next(err))
  }
)

router.post('/',
  validator.POST,
  valid,
  auth,
  async (req, res, next) => {
    const data = _.pick(req.body, ['firstname', 'lastname', 'gender', 'age'])
    const coor = await geoloc(req.body.address, req.body.zipcode)
    console.log(coor)
    const Id = new mongoose.Types.ObjectId()
    User.updateOne(
      { _id: _.get(req, 'token.payload.user._id', null) },
      { $set: data, geolocation: Id }
    ).then(async (user) => {
      console.log(user)
      await new GeolocModel({
        _id: Id,
        userId: req.token.payload.user._id,
        address: req.body.address,
        zipcode: req.body.zipcode,
        city: req.body.city,
        'geolocation.coordinates': [coor[0].longitude, coor[0].latitude],
        'geolocation.type': 'Point'
      }).save()
      res.json({ status: true })
    })
      .catch(err => next(err))
  })

router.patch('/',
  validator.PATCH,
  valid,
  auth,
  async (req, res, next) => {
    const data = _.pick(req.body, ['firstname', 'lastname', 'gender', 'age', 'address', 'zipcode', 'city'])
    const coor = await geoloc(req.body.address, req.body.zipcode)
    User.updateOne(
      { _id: _.get(req, 'token.payload.user._id', null) },
      { $set: data }
    ).then(() => {
      GeolocModel.updateOne({ userId: req.token.payload.user._id }, {
        $set: {
          userId: req.token.payload.user._id,
          address: req.body.address,
          zipcode: req.body.zipcode,
          city: req.body.city,
          'geolocation.coordinates': [coor[0].longitude, coor[0].latitude],
          'geolocation.type': 'Point'
        }
      }).then((e) => {
        console.log(e)
        res.json({ status: true })
      })
        .catch(next)
    })
      .catch(err => next(err))
  }
)

router.delete('/:userId',
  validator.DELETE,
  valid,
  auth,
  (req, res, next) => {
    User.deleteOne({ _id: _.get(req, 'token.payload.user._id', null) })
      .then(() => {
        res.json({ status: true })
      })
      .catch(err => next(err))
  }
)

module.exports = (app) => {
  app.use('/account', router)
}
