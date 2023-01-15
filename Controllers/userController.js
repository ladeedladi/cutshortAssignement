const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient
const { hset, hmget, del } = require('../lib/redis')

const generateAccessToken = (id) => {
    return jwt.sign({ id: id }, process.env.TOKEN_SECRET, { expiresIn: "7d" })
}
const generateRefreshToken = (id) => {
    return jwt.sign({ id: id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "365d" })
}

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
            return res.status(403).json({ message: "User Already Exists, Please Login" })
        }
        const saltRounds = 10
        const hash = await bcrypt.hash(password, saltRounds)

        await users.insertOne({ name, email, phone, password: hash, status: "active" })

        await del("users")
        return res.status(200).json({ message: `Successfuly signed up` })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }


}

const login = async (req, res) => {


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
        const refreshtoken = generateRefreshToken(user.email)
        return res.json({ token: token, refreshtoken: refreshtoken, success: true, message: `Successfully Logged In`, user: user.name })

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
        let data = await users.find({ role: { $ne: "admin" } }, { "projection": { name: 1, email: 1, phone: 1 } }).limit(limit)
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

const searchUsers = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const users = database.collection("users")

    try {
        let { searchBy, value } = req.query || false

        await client.connect()

        const data = await users.find(
            { role: { $ne: "admin" }, [searchBy]: { $regex: `${value}`, $options: '/^/' } }, { "projection": { name: 1, email: 1, phone: 1 } }
        ).toArray()

        return res.status(200).json({ message: `Successfuly Fetched Users`, data: data })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}

const refreshToken = async (req, res, next) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const users = database.collection("users")

    try {
        const refreshToken = req.headers

        let decoded = jwt.verify(refreshToken.refreshtoken, process.env.REFRESH_TOKEN_SECRET)

        if (!decoded.id) {
            return res.status(403).json({ message: "user not authorized" })
        }

        await client.connect()
        let user = await users.findOne({ email: decoded.id })
        console.log(user)

        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        const token = generateAccessToken(user.email)
        const refreshtoken = generateRefreshToken(user.email)

        return res.json({ token: token, refreshtoken: refreshtoken, success: true, message: `Successfully Logged In`, user: user.name })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }


}


module.exports = {
    signUp, login, getAllUser, searchUsers, refreshToken
}