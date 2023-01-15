const express = require('express')
const { createTodo, deleteTodo, updateTodo, getTodo, getAllTodo, updateTodoListStatus } = require('../Controllers/todosController')
const rateLimiter = require('../lib/limiter')

const userAuthorizer = require("../middleware/userAuthorizer")
const router = express.Router()

router.post(`/todo`, userAuthorizer, createTodo)
router.delete(`/todo/:id`, userAuthorizer, deleteTodo)
router.get(`/todo/:id`, rateLimiter, getTodo)
router.get(`/todo`, rateLimiter, userAuthorizer, getAllTodo)
router.put(`/todo/:id`, userAuthorizer, updateTodo)
router.put(`/updateTodoListStatus/:id`, userAuthorizer, updateTodoListStatus)
module.exports = router