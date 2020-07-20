'use strict'

const auth = require('../Libs/auth')
const SportModel = require('../Models/SportModel')
const GeolocModel = require('../Models/GeolocModel')
const _ = require('lodash')
const sportList = require('../json/sportsList.json')
const router = require('express').Router()

router.get('/',
  auth,
  async (req, res, next) => {
    let { rayon, sport, day, start, end, level } = req.query
    // set one sport in user for the moment
    if (!day) {
      day = { $in: ['monday', 'thursday', 'wednesday', 'tuesday', 'friday', 'saturday', 'sunday'] }
    }
    let userLevel
    let setLevel = { $lte: 100, $gte: 0 }
    if (level === 'true') {
      const user = await SportModel.findOne({ userId: _.get(req, 'token._id', null) })
      const select = sportList.find(e => e.value === sport)
      userLevel = user.sport.find(e => e.value === sport) === undefined ? select.level[select.level.length - 1].value : user.sport.find(e => e.value === sport).level
      setLevel = { $lte: userLevel + 2, $gte: userLevel - 2 }
    }
    GeolocModel.findOne({ userId: req.token._id }).populate('sport')
      .then(user => {
        GeolocModel.find()
          .where('location.coordinates')
          .near({
            center: [user.location.coordinates[0], user.location.coordinates[1]],
            maxDistance: rayon / 6371,
            spherical: true
          })
          .then(location => {
            const startV = start === undefined ? '0000' : start
            const endV = end === undefined ? '2359' : end
            const userId = location.map(val => { return val.userId })
            SportModel.find({
              userId: userId,
              sport: {
                $elemMatch: {
                  value: sport,
                  availability: {
                    $elemMatch: {
                      day: day,
                      startOn: { $lte: endV },
                      stopOn: { $gte: startV }
                    }
                  },
                  level: setLevel
                }
              }
            })
              .populate('userId')
              .populate('location')
              .sort({ location: 1 })
              .then(partners => {
                res.json(partners)
              })
              .catch(err => { return next(err) })
          })
          .catch(err => { return next(err) })
      })
      .catch(err => { return next(err) })
  }
)

module.exports = (app) => {
  app.use('/search', router)
}
