'use strict'

let express = require('express')
let app = express()

app.get('/', function (req, res) {
  res.send('Goals Api')
})

app.listen(3000, function () {
  console.log('server listening on port 3000')
})
