const fastify = require('fastify')()
const path = require('path')
const fastifyStatic = require('@fastify/static')

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'static'),
  prefix: '/'
})

fastify.listen({port: 3000}, function(err, addr) {
  console.log("Listening on", addr)
})