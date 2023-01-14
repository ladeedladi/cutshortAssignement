const express = require('express')
const { signUp, login, getAllUser } = require('../Controllers/userController')
const router = express.Router()

router.post(`/user`, signUp)
router.post(`/login`, login)
router.get(`/user`, getAllUser)

module.exports = router