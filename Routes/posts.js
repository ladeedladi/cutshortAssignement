const express = require('express')
const { createPost, getPost, getAllPosts, addComment, searchPosts } = require('../Controllers/postsController')

const auth = require("../middleware/userAuthorizer")
const router = express.Router()

router.post(`/post`, auth, createPost)
router.post(`/post/search`, auth, searchPosts)
router.get(`/post`, getAllPosts)
router.get(`/post/:id`, getPost)
router.post(`/comment/:id`, auth, addComment)

module.exports = router