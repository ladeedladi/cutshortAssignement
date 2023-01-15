const express = require('express')
const { signUp, login, getAllUser, searchUsers } = require('../Controllers/userController')
const router = express.Router()

router.post(`/user`, signUp)
router.post(`/login`, login)
router.get(`/user`, getAllUser)
router.post(`/user/search`, searchUsers)

module.exports = router