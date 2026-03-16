import { createServer } from 'http'
import next from 'next'
import {  parse } from 'url'

const port = process.env.PORT || 3000
const app = next({ dev: false })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port)

  console.log(`Server listening at http://localhost:${port}`)
})
