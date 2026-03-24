const express = require('express')
const router = express.Router()
const { register, login, getMe, getNiches } = require('../controller/authController')
const { protect } = require('../Middleware/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.get('/niches', getNiches)

module.exports = router