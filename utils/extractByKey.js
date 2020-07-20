'use strict'

const _ = require('lodash')

module.exports = (key, datas) => {
  if (_.isArray(datas)) {
    let newFormat = {}
    datas.map(data => {
      newFormat = { ...newFormat, [data[key]]: data }
    })
    return newFormat
  } else {
    return datas
  }
}
