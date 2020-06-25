'use strict'

const router = require('express').Router()
const valid = require('../Libs/validation')
const _ = require('lodash')
const boom = require('boom')
const crypt = require('../Libs/crypt')
const crypto = require('crypto')
const User = require('../Models/UserModel')
const RefreshToken = require('../Models/RefreshToken')
const jwt = require('../Libs/jwt')
const Promise = require('bluebird')
const validAccount = require('../validator/validAccount')

router.post('/signin',
  validAccount.SIGNIN,
  valid,
  (req, res, next) => {
    const { email, password } = req.body
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          return next(boom.unauthorized())
        }
        crypt.compare(password, user.password)
          .then(async confirm => {
            if (!confirm) {
              return next(boom.unauthorized())
            }

            // create xsrfToken
            const xsrfToken = crypto.randomBytes(64).toString('hex')
            // create token
            const accessToken = await jwt.sign(user, xsrfToken, process.env.TOKEN_HS512, process.env.TOKEN_EXPIRE)
            // create refreshToken
            const refreshToken = crypto.randomBytes(128).toString('base64')

            // Save refreshToken in DB
            await RefreshToken.create({
              userId: user.id,
              token: refreshToken,
              expiresAt: Date.now() + process.env.REFRESH_EXPIRE
            })

            res.cookie('access_token', accessToken, {
              httpOnly: true,
              secure: true,
              maxAge: process.env.TOKEN_EXPIRE
            })

            res.cookie('refresh_token', refreshToken, {
              httpOnly: true,
              secure: true,
              maxAge: process.env.REFRESH_EXPIRE,
              path: '/token'
            })

            res.json({
              accessTokenExpiresIn: process.env.TOKEN_EXPIRE,
              refreshTokenExpiresIn: process.env.REFRESH_EXPIRE,
              xsrfToken
            })
          })
          .catch(err => { return next(err) })
      })
      .catch(err => { return next(err) })
  }
)

router.post('/signup',
  validAccount.SIGNUP,
  valid,
  (req, res, next) => {
    console.log('entrer')
    const { email, password } = req.body
    User.findOne({ email })
      .then(user => {
        console.log(user)
        if (user) {
          return next(boom.conflict())
        }
        crypt.hash(password, 10)
          .then(async (crypto) => {
            console.log(crypto)
            const user = await new User({
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
