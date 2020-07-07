'use strict'

const router = require('express').Router()
const valid = require('../Libs/validation')
const _ = require('lodash')
const boom = require('boom')
const { body } = require('express-validator')
const crypt = require('../Libs/crypt')
const UserModel = require('../Models/UserModel')
const jwt = require('../Libs/jwt')
const Promise = require('bluebird')
const crypto = require('crypto')
const ms = require('ms')
const RefreshTokenModel = require('../Models/RefreshTokenModel')

router.post('/signin',
  body('email')
    .exists()
    .withMessage('This field is required.')
    .isEmail()
    .withMessage('A valid email is required.'),
  body('password')
    .exists()
    .withMessage('This field is required.')
    .isLength(8),
  valid,
  (req, res, next) => {
    const { email, password } = req.body
    UserModel.findOne({ email: email })
      .then(user => {
        if (!user) {
          return next(boom.unauthorized())
        }
        crypt.compare(password, user.password)
          .then(confirm => {
            if (!confirm) {
              return next(boom.unauthorized())
            }
            // Mettre le xsrf ici !
            const xsrfToken = crypto.randomBytes(64).toString('hex')
            Promise.props({
              'access-token': jwt.sign(user, process.env.TOKEN_HS512, process.env.TOKEN_EXPIRE, xsrfToken),
              refreshToken: jwt.sign(user, process.env.REFRESH_HS512, process.env.REFRESH_EXPIRE)
            }).then(props => {
              RefreshTokenModel.findOne({ userId: _.get(user, '_id') })
                .then(token => {
                  if (token) {
                    token.refreshToken.push({
                      token: props.refreshToken,
                      device: 'test'
                    })
                    token.save()
                  } else {
                    const refresh = new RefreshTokenModel({
                      userId: _.get(user, '_id'),
                      refreshToken: [{
                        token: props.refreshToken,
                        device: 'test'
                      }]
                    })
                    refresh.save()
                  }
                  res.cookie('x-access-token', props['access-token'])
                  res.cookie('x-refresh-token', props.refreshToken)
                  res.json({ tokenExpireIn: ms(process.env.TOKEN_EXPIRE), refreshTokenExpireIn: ms(process.env.REFRESH_EXPIRE), xsrfToken, user })
                })
            })
              .catch(err => { return next(err) })
          })
          .catch(err => { return next(err) })
      })
      .catch(err => { return next(err) })
  }
)

router.post('/signup',
  body('email')
    .exists()
    .withMessage('This field is required.')
    .isEmail()
    .withMessage('A valid email is required.'),
  body('password')
    .exists()
    .withMessage('This field is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
  valid,
  (req, res, next) => {
    console.log('entrer')
    const { email, password } = req.body
    UserModel.findOne({ email })
      .then(user => {
        console.log(user)
        if (user) {
          return next(boom.conflict())
        }
        crypt.hash(password, 10)
          .then(async (crypto) => {
            console.log(crypto)
            const user = await new UserModel({
              email,
              password: crypto,
              roles: 'user',
              createOn: Date.now()
            }).save()
            res.json({ user: _.omit(user, ['password']) })
          })
          .catch(err => { return next(err) })
      })
      .catch(err => { return next(err) })
  }
)

module.exports = (app) => {
  app.use('/', router)
}
