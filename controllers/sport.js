'use strict'

const router = require('express').Router()
const auth = require('../Libs/auth')
const valid = require('../Libs/validation')
const _ = require('lodash')
const Sport = require('../Models/SportModel')
const { body } = require('express-validator')
const boom = require('boom')
const geoloc = require('../Libs/geoloc')
const mongoose = require('mongoose')
const extractByKey = require('../utils/extractByKey')
const sportList = extractByKey('value', require('../json/sportsList.json'))
const level = _.map(sportList.tennis.level, level => { return level.value })
console.log(level)
router.get('/',
  auth,
  (req, res, next) => {
    Sport.findOne({ userId: _.get(req, 'token.payload.user._id', null) })
      .then(sport => {
        res.json(sport)
      })
      .catch(err => next(err))
  }
)

router.post('/',
  body('value')
    .exists()
    .isString()
    .isIn(Object.keys(sportList)),
  body('level')
    .exists()
    .custom((value, { req }) => {
      const res = _.map(sportList[req.body.value].level, level => {
        return level.value
      }).filter(list => list === value)
      if (res.length > 0) {
        return true
      } else {
        throw new Error(`Value ${value} is not allowed`)
      }
    }),
  body('availability')
    .exists()
    .isArray(),
  body('availability.*.day')
    .exists()
    .isNumeric(),
  body('availability.*.startAt')
    .exists()
    .isNumeric(),
  body('availability.*.endAt')
    .exists()
    .isNumeric(),
  valid,
  auth,
  (req, res, next) => {
    const data = _.pick(req.body, ['value', 'level', 'availability'])
    const newSport = new Sport(
      data
    )
    newSport.save()
      .then(res.json({ status: true }))
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
  app.use('/sport', router)
}
