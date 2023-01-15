
const MongoClient = require('mongodb').MongoClient
const { ObjectId } = require('mongodb')
const { hset, hmget, del, hdel } = require('../lib/redis')

const createTodo = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const todos = database.collection("todos")

    try {
        const email = req.requestInfo || false

        let { task } = req.body

        let status = "pending"

        if (!task) {
            return res.status(400).json({ message: "Mandatory Fields Cannot Be Empty" })
        }

        let date = new Date()
        await client.connect()

        await todos.insertOne({
            task: task, status: status, uploadedBy: email, createdDate: date, updatedDate: date
        })

        await del("todos")
        return res.status(201).json({ message: `Successfuly Added`, data: req.body })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}


const deleteTodo = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const todos = database.collection("todos")

    try {
        const { id } = req.params
        const email = req.requestInfo || false

        if (!id) {
            return res.status(400).json({ message: "Id Not Passed" })
        }

        await client.connect()
        const todo = await todos.findOne({ _id: ObjectId(id) })

        if (!todo) return res.status(404).json({ message: "Todo Not Found" })
        if (todo.uploadedBy !== email) return res.status(401).json({ message: "User Not Authorized" })

        await todos.deleteOne({ _id: ObjectId(id) })
        return res.status(200).json({ message: `Successfuly Deleted Todo List ${id}` })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}

const getTodo = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const todos = database.collection("todos")

    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Id Not Passed" })
        }

        let cachedData = await hmget("todo", `${id}`)
        if (cachedData) {
            return res.status(200).json({ message: `Successfuly Fetched Todo List ${id}`, data: cachedData })
        }

        await client.connect()
        const data = await todos.findOne({ _id: ObjectId(id) })
        await hset("todo", `${id}`, data)

        return res.status(200).json({ message: `Successfuly Fetched Todo List ${id}`, data: data })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}

const getAllTodo = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const todos = database.collection("todos")

    let { page, limit, sortBy } = req.query || false

    page = page ? parseInt(page) : 1
    limit = limit ? parseInt(limit) : 10
    sortBy = sortBy ?? {}

    try {

        let cachedData = await hmget("todos", `${page + limit + sortBy}`)
        if (cachedData) {
            return res.status(200).json({ message: "Successfuly Fetched All Todo Lists ", data: cachedData })
        }

        await client.connect()
        const data = await todos.find({}).limit(limit)
            .skip((page - 1) * limit)
            .sort(sortBy).toArray()

        await hset("todos", `${page + limit + sortBy}`, data)

        return res.status(200).json({ message: `Successfuly Fetched All Todo Lists`, data: data })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}


const updateTodo = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const todos = database.collection("todos")

    try {
        const email = req.requestInfo || false
        const { id } = req.params
        if (!id) {
            return res.status(400).json({ message: "Id Not Passed" })
        }

        let { task } = req.body
        if (!task) {
            return res.status(400).json({ message: "Mandatory Fields Cannot Be Empty" })
        }

        let date = new Date()

        await client.connect()
        const todo = await todos.findOne({ _id: ObjectId(id) })

        if (!todo) return res.status(404).json({ message: "Todo Not Found" })
        if (todo.uploadedBy !== email) return res.status(401).json({ message: "User Not Authorized" })

        let update = await todos.updateOne({ _id: ObjectId(id) }, { $set: { task: task, uploadedBy: email, updatedDate: date } })
        if (update.modifiedCount !== 0) {
            await hdel("todo", `${id}`)
        }

        return res.status(201).json({ message: `Successfully Updated Todo list ${id}`, data: req.body })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}


const updateTodoListStatus = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const todos = database.collection("todos")

    try {
        const email = req.requestInfo || false
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Id Not Passed" })
        }

        let { status } = req.query
        if (!status) {
            return res.status(400).json({ message: "Status  Cannot Be Empty" })
        }

        let date = new Date()

        await client.connect()
        const todo = await todos.findOne({ _id: ObjectId(id) })

        if (!todo) return res.status(404).json({ message: "Todo Not Found" })
        if (todo.uploadedBy !== email) return res.status(401).json({ message: "User Not Authorized" })

        let update = await todos.updateOne({ _id: ObjectId(id) }, { $set: { status: status, updatedDate: date } })
        if (update.modifiedCount !== 0) {
            await hdel("todo", `${id}`)
        }

        return res.status(201).json({ message: `Successfully Updated Todo list Status to ${status}` })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}

const searchTodo = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const todos = database.collection("todos")

    let { page, limit } = req.query || false

    page = page ? parseInt(page) : 1
    limit = limit ? parseInt(limit) : 10

    try {

        let { searchBy, value } = req.query || false

        await client.connect()

        const data = await todos.find({ [searchBy]: { $regex: `${value}`, $options: '/^/' } }).limit(limit)
            .skip((page - 1) * limit)
            .sort({}).toArray()

        return res.status(200).json({ message: `Successfuly Fetched Blogs`, data: data })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}

module.exports = {
    createTodo,
    deleteTodo,
    getTodo,
    getAllTodo,
    updateTodo,
    updateTodoListStatus,
    searchTodo
}