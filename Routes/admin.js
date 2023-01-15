const express = require('express')
const { signUp, updateUserStatus } = require('../Controllers/adminController')
const adminAuthorizer = require("../middleware/adminAuthorizer")
const router = express.Router()

router.post(`/admin`, signUp)
router.post(`/updateUserStatus`, adminAuthorizer, updateUserStatus)

module.exports = router