const express = require('express')
const { signUp, login, getAllUser, searchUsers } = require('../Controllers/userController')
const rateLimiter = require('../lib/limiter')
const router = express.Router()

router.post(`/user`, signUp)
router.post(`/login`, login)
router.get(`/user`, rateLimiter, getAllUser)
router.post(`/user/search`, searchUsers)

module.exports = router