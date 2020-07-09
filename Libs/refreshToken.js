'use strict'

const jwt = require('../Libs/jwt')
const Promise = require('bluebird')
const _ = require('lodash')
const ms = require('ms')
const RefreshTokenModel = require('../Models/RefreshTokenModel')

module.exports = (payload, xsrfToken, user) => {
  return new Promise((resolve, reject) => {
    Promise.props({
      'access-token': jwt.sign({ payload, xsrfToken }, process.env.TOKEN_HS512, process.env.TOKEN_EXPIRE),
      refreshToken: jwt.sign({ payload }, process.env.REFRESH_HS512, process.env.REFRESH_EXPIRE)
    }).then(props => {
      RefreshTokenModel.findOne({ userId: _.get(payload, '_id') })
        .then(token => {
          if (token) {
            token.refreshToken.push({
              token: props.refreshToken,
              device: 'test'
            })
            token.save()
          } else {
            const refresh = new RefreshTokenModel({
              userId: _.get(payload, '_id'),
              refreshToken: [{
                token: props.refreshToken,
                device: 'test'
              }]
            })
            refresh.save()
          }
          resolve({
            'x-access-token': props['access-token'],
            'x-refresh-token': props.refreshToken,
            tokenExpireIn: ms(process.env.TOKEN_EXPIRE),
            refreshTokenExpireIn: ms(process.env.REFRESH_EXPIRE),
            xsrfToken,
            user
          })
        })
    })
      .catch(err => { reject(err) })
  })
}
