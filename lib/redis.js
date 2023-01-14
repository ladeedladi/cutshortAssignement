const Redis = require('ioredis')

const connection = async () => {

    let redisClient = new Redis({
        port: process.env.ELASTI_CACHE_PORT,
    })

    return redisClient
}

const setEx = async (key, expiry, data) => {

    try {
        const client = await connection()
        let x = await client.setex(key, expiry, JSON.stringify(data))
        client.disconnect()
        return x
    } catch (err) {
        throw err
    }
}

const hset = async (key, hash, data) => {

    try {
        const client = await connection()
        let x = await client.hset(key, hash, JSON.stringify(data))
        client.disconnect()
        return x
    } catch (err) {
        throw err
    }
}

const hmget = async (key, hash) => {

    try {
        const client = await connection()
        let data = await client.hmget(key, hash)
        client.disconnect()
        return JSON.parse(data[0])
    } catch (err) {
        throw err
    }
}

const hgetall = async (key) => {

    try {
        const client = await connection()
        let data = await client.hgetall(key)
        client.disconnect()
        return data
    } catch (err) {
        throw err
    }
}

const get = async (key) => {

    try {
        const client = await connection()
        const data = await client.get(key)
        client.disconnect()
        return JSON.parse(data)
    } catch (err) {
        throw err
    }
}

const del = async (key) => {

    try {
        const client = await connection()
        let x = await client.del(key)
        client.disconnect()
        return x
    } catch (err) {
        throw err
    }
}

const expire = async (key, expiry) => {

    try {
        const client = await connection()
        let x = await client.expire(key, expiry)
        client.disconnect()
        return x
    } catch (err) {
        throw err
    }
}

const hdel = async (key, hash) => {

    try {
        const client = await connection()
        let x = await client.hdel(key, hash)
        client.disconnect()
        return x
    } catch (err) {
        throw err
    }
}

module.exports = {
    setEx,
    hset,
    hmget,
    del,
    hdel
}