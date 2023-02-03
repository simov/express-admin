
var moment = require('moment')
var validator = require('mysql-validator')


exports.value = (column, value) => {

  if (value === '' || value === null || value === undefined
    || (value instanceof Array && !value.length)) {

    // should check for column.defaultValue when creating a record

    if (column.allowNull) return null
    if (column.control.binary) return null // temp disabled
    return new Error('Column '+column.name+' cannot be empty.')
  }

  value = format(column, value)

  return validator.check(value, column.type)
}

function format (column, value) {
  if (column.control.date) {
    if (!value || !moment(value).isValid()) return value
    return moment(value).format('YYYY-MM-DD')
  }
  else if (column.control.datetime) {
    if (!value || !moment(value).isValid()) return value
    return moment(value).format('YYYY-MM-DD HH:mm:ss')
  }
  // else if (column.control.radio) {
  //   if (value === true) return 't'
  //   else if (value === false) return 'f'
  // }
  else {
    return value
  }
}
