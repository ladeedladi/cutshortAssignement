const bcrypt = require('bcrypt')
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

        await users.insertOne({ name, email, phone, password: hash, role: "admin" })

        await del("users")
        return res.status(200).json({ message: `Successfuly signed up` })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }


}


const updateUserStatus = async (req, res, next) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const users = database.collection("users")

    try {

        const { status, email } = req.query

        if (!email || !status) {
            return res.status(400).json({ message: "Status or Email is Missing" })
        }

        await client.connect()

        let user = await users.findOne({ email })
        console.log(user, `<<<user`)

        if (!user) {
            return res.status(400).json({ message: "User Does'nt Exists" })
        }

        if (user.role == "admin") {
            return res.status(400).json({ message: "You have No Permission To Update Admin's Status" })
        }

        await users.updateOne({ email: email }, { $set: { status: status } })

        await del("users")
        return res.status(200).json({ message: `Successfuly Changed User Status to ${status}` })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}


module.exports = {
    signUp, updateUserStatus
}

