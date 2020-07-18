'use strict'

function JSONStringValidate (str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

module.exports = {
  JSONStringValidate
}