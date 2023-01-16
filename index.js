const express = require('express')
const user = require('./Routes/user')
const admin = require('./Routes/admin')
const todos = require('./Routes/todos')
const posts = require('./Routes/posts')
const rateLimiter = require('./lib/limiter')
const cors = require('cors')

require('dotenv').config()

const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())

app.use(rateLimiter)
//routes
app.use(user)
app.use(todos)
app.use(posts)
app.use(admin)

app.get(`/`, (req, res, next) => {
    res.json({ message: `working!!` })
})

app.listen(3000, () => {
    console.log(`listening at 3000!!!`)
})