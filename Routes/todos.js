const express = require('express')
const { createTodo, deleteTodo, updateTodo, getTodo, getAllTodo, updateTodoListStatus } = require('../Controllers/todosController')

const userAuthorizer = require("../middleware/userAuthorizer")
const router = express.Router()

router.post(`/todo`, userAuthorizer, createTodo)
router.delete(`/todo/:id`, userAuthorizer, deleteTodo)
router.get(`/todo/:id`, getTodo)
router.get(`/todo`, userAuthorizer, getAllTodo)
router.put(`/todo/:id`, userAuthorizer, updateTodo)
router.put(`/updateTodoListStatus/:id`, userAuthorizer, updateTodoListStatus)
module.exports = router