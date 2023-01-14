const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient
const { hset, hmget, del } = require('../lib/redis')

const signUp = async (req, res, next) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const users = database.collection("users")

    try {
        const { name, email, phone, password } = req.body
        console.log(name, email, phone, password)

        await client.connect()

        let user = await users.findOne({ email })
        console.log(user, `<<<user`)

        if (user) {
            return res.status(403).json({ message: "User already exists, please login" })
        }
        const saltRounds = 10
        const hash = await bcrypt.hash(password, saltRounds)

        await users.insertOne({ name, email, phone, password: hash })

        await del("users")
        return res.status(201).json({ message: `Successfuly signed up` })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }


}

const login = async (req, res) => {

    const generateAccessToken = (id) => {
        return jwt.sign(id, process.env.TOKEN_SECRET)
    }


    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const users = database.collection("users")

    try {
        const { email, password } = req.body
        console.log(email, password)

        await client.connect()
        let user = await users.findOne({ email: email })
        console.log(user)

        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        let userExist = await bcrypt.compare(password, user.password)
        console.log(userExist)

        if (!userExist) {
            return res.status(401).json({ success: false, message: `password does not match` })
        }
        const token = generateAccessToken(user.email)
        return res.json({ token: token, success: true, message: `Successfully Logged In`, user: user.name })

    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await client.close()
    }

}

const getAllUser = async (req, res) => {



    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const users = database.collection("users")

    try {

        let { page, limit, sortBy } = req.query

        page = parseInt(page) ?? 1
        limit = parseInt(limit) ?? 10
        sortBy = sortBy ?? {}

        let cachedData = await hmget("users", `${page + limit + sortBy}`)
        if (cachedData) {
            return res.status(200).json({ message: "Succesfully Fetched Users", data: cachedData })
        }

        await client.connect()
        let data = await users.find({}, { "projection": { name: 1, email: 1, phone: 1 } }).limit(limit)
            .skip((page - 1) * limit)
            .sort(sortBy).toArray()

        await hset("users", `${page + limit + sortBy}`, data)


        return res.status(200).json({ message: "Succesfully Fetched Users", data: data })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await client.close()
    }

}

module.exports = {
    signUp, login, getAllUser
}