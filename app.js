const express = require('express')
const app = express()
const port = 5000

app.get('/', (req, res) => {
  res.json({
    message: 'Hi from Samometer bot!',
    now: new Date()
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})