'use strict'

const router = require('express').Router()
const auth = require('../Libs/auth')
const valid = require('../Libs/validation')
const _ = require('lodash')
const Sport = require('../Models/SportModel')
const extractByKey = require('../utils/extractByKey')
const sportList = extractByKey('value', require('../json/sportsList.json'))
const validator = require('../validators/sports')
const level = _.map(sportList.tennis.level, level => { return level.value })
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
  validator.POST,
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

// A finir !
router.patch('/',
  validator.PATCH,
  valid,
  auth,
  (req, res, next) => {
    const data = _.pick(req.body, ['value', 'level', 'availability'])
    Sport.updateOne({ _id: _.get(req, 'body._id', null) }, {
      data
    })
      .then(res.json({ status: true }))
      .catch(err => next(err))
  })

// A finir !

router.delete('/:sportId',
  validator.DELETE,
  valid,
  auth,
  async (req, res, next) => {
    Sport.deleteOne({ _id: _.get(req, 'params.sportId', null) })
      .then(() => {
        res.json({ status: true })
      })
      .catch(err => next(err))
  }
)

module.exports = (app) => {
  app.use('/sport', router)
}
