const express = require('express')
const server = express()
server.use('/', express.static('../mxgraph-fishbone'))

module.exports = server.listen(9000, () => {
    console.log('已启动 : http://localhost:9000/')
})