const express = require('express')
const user = require('./Routes/user')
const todos = require('./Routes/todos')
const posts = require('./Routes/posts')
const cors = require('cors')

require('dotenv').config()

const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())

//routes

app.use(user)
app.use(todos)
app.use(posts)

app.get(`/`, (req, res, next) => {
    res.json({ message: `working!!` })
})

app.listen(3000, () => {
    console.log(`listening at 3000!!!`)
})