const express = require('express')
const { createPost, getPost, getAllPosts, addComment } = require('../Controllers/postsController')
const rateLimiter = require('../lib/limiter')

const auth = require("../middleware/userAuthorizer")
const router = express.Router()

router.post(`/post`, auth, createPost)
router.get(`/post`, rateLimiter, getAllPosts)
router.get(`/post/:id`, rateLimiter, getPost)
router.post(`/comment/:id`, auth, addComment)

module.exports = router