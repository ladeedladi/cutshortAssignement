const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient


module.exports = async (req, res, next) => {

    const token = req.headers.authorization
    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const users = database.collection("users")

    try {

        const verify = await jwt.verify(token, process.env.TOKEN_SECRET)
        console.log("verify: " + verify)
        const id = verify

        if (id) {


            await client.connect()

            const findUser = await users.findOne({ email: id })
            console.log(findUser)

            if (findUser && findUser.status == "active") {
                console.log("middle ware passed")
                req.requestInfo = findUser.email
                next()
            } else {
                return res.status(403).json({ message: "user not authorized" })
            }
        } else {
            return res.status(400).json({ message: "invalid token" })
        }

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await client.close()
    }
}

