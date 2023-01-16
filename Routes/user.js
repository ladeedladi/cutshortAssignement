const express = require('express')
const { signUp, login, getAllUser, searchUsers, refreshToken } = require('../Controllers/userController')
const router = express.Router()

router.post(`/user`, signUp)
router.post(`/login`, login)
router.get(`/user`, getAllUser)
router.post(`/user/search`, searchUsers)
router.get(`/user/refreshToken`, refreshToken)

module.exports = router