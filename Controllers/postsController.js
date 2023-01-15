
const MongoClient = require('mongodb').MongoClient
const { ObjectId } = require('mongodb')
const { hset, hmget, del, hdel } = require('../lib/redis')

const createPost = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const posts = database.collection("posts")

    try {
        const email = req.requestInfo || false
        console.log(email)
        const { title, post } = req.body
        if (!post) {
            return res.status(400).json({ message: "Post  Cannot Be Empty" })
        }

        let date = new Date()
        await client.connect()
        await posts.insertOne({ post: post, title: title, uploadedBy: email, createdDate: date, updatedDate: date })
        await del("posts")

        return res.status(200).json({ message: `Successfuly Added`, data: req.body })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}


const getPost = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const posts = database.collection("posts")
    const comments = database.collection("comments")

    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Id Not Passed" })
        }


        let cachedData = await hmget("post", `${id}`)
        if (cachedData) {
            return res.status(200).json({ message: `Successfully Fetched Post`, data: cachedData })
        }

        await client.connect()
        let data = await posts.findOne({ _id: ObjectId(id) })

        if (!data) {
            res.status(404).json({ message: "Post Not Found" })
        }

        const commentsForThePost = await comments.find({ postId: id }).toArray()
        data.comments = commentsForThePost ?? []

        await hset("post", `${id}`, data)

        return res.status(200).json({ message: `Successfully Fetched Post`, data: data })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}


const getAllPosts = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const posts = database.collection("posts")

    let { page, limit, sortBy } = req.query || false

    page = page ? parseInt(page) : 1
    limit = limit ? parseInt(limit) : 10
    sortBy = sortBy ?? {}

    try {
        let cachedData = await hmget("posts", `${page + limit + sortBy}`)
        if (cachedData) {
            return res.status(200).json({ message: `Successfuly Fetched  Posts`, data: cachedData })
        }

        await client.connect()
        const data = await posts.find({}).limit(limit)
            .skip((page - 1) * limit)
            .sort(sortBy).toArray()

        await hset("posts", `${page + limit + sortBy}`, data)

        return res.status(200).json({ message: `Successfuly Fetched  Posts`, data: data })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}


const addComment = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const comments = database.collection("comments")

    try {
        const email = req.requestInfo || false
        console.log(email)

        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Id Not Passed" })
        }

        const { comment } = req.body
        if (!comment) {
            return res.status(400).json({ message: "Comment  Cannot Be Empty" })
        }

        let date = new Date()
        await client.connect()
        await comments.insertOne({ postId: id, comment: comment, commentedBy: email, createdDate: date })

        await hdel("post", `${id}`)
        return res.status(200).json({ message: `Successfuly Added`, data: req.body })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        await client.close()
    }

}

const searchPosts = async (req, res) => {

    const client = await new MongoClient(process.env.MONGODB_URI)
    const database = client.db("dbs")
    const posts = database.collection("posts")

    let { page, limit } = req.query || false

    page = page ? parseInt(page) : 1
    limit = limit ? parseInt(limit) : 10

    try {

        let { searchBy, value } = req.query || false

        await client.connect()

        const data = await posts.find({ [searchBy]: { $regex: `${value}`, $options: '/^/' } }).limit(limit)
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
    createPost,
    getPost,
    getAllPosts,
    addComment,
    searchPosts
}


