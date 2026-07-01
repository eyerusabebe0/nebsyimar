// Simple Next.js production server
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV === 'development'
if (!process.env.NODE_ENV) {
  console.warn('NODE_ENV is not set. Starting Next in production mode by default.')
}
console.log(`Starting Next server in ${dev ? 'development' : 'production'} mode (NODE_ENV=${process.env.NODE_ENV ?? 'undefined'})`)
const hostname = 'localhost'
const port = process.env.PORT || 3000

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
