const express = require('express')
const { createTodo, deleteTodo, updateTodo, getTodo, getAllTodo, updateTodoListStatus } = require('../Controllers/todosController')

const authorizer = require("../middleware/authorizer")
const router = express.Router()

router.post(`/todo`, authorizer, createTodo)
router.delete(`/todo/:id`, authorizer, deleteTodo)
router.get(`/todo/:id`, getTodo)
router.get(`/todo`, authorizer, getAllTodo)
router.put(`/todo/:id`, authorizer, updateTodo)
router.put(`/updateTodoListStatus/:id`, authorizer, updateTodoListStatus)
module.exports = router