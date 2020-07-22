'use strict'

const { body, param } = require('express-validator')
const extractByKey = require('../utils/extractByKey')
const sportList = extractByKey('value', require('../json/sportsList.json'))
const _ = require('lodash')

module.exports = {
  POST: [
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
      .isNumeric()
  ],
  PATCH: [
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
      .isNumeric()
  ],
  DELETE: [
    param('sportId')
      .exists()
      .isMongoId()
  ]
}
