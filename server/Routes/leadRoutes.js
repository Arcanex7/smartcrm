const express = require('express')
const router = express.Router()

const { protect } = require('../middleware/authMiddleware')
const { requireRole } = require('../middleware/rbacMiddleware')

const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  updateLeadStage,
  addActivity,
  deleteLead,
  getPipeline,
  getDashboard,
  toggleHotLead,
  addReminder,
  getTodayFollowUps,
  getWhatsAppMessage,
  generateAIContent
} = require('../controller/leadController')

// Dashboard & Pipeline
router.get('/dashboard', protect, getDashboard)
router.get('/pipeline', protect, getPipeline)

// Follow-ups
router.get('/followups/today', protect, getTodayFollowUps)

// AI
router.post('/ai/generate', protect, generateAIContent)

// Leads CRUD
router.get('/', protect, getLeads)
router.post('/', protect, requireRole('rep'), createLead)
router.get('/:id', protect, getLead)
router.put('/:id', protect, requireRole('rep'), updateLead)
router.patch('/:id/stage', protect, requireRole('rep'), updateLeadStage)
router.patch('/:id/hot', protect, requireRole('rep'), toggleHotLead)
router.post('/:id/activity', protect, requireRole('rep'), addActivity)
router.post('/:id/reminder', protect, requireRole('rep'), addReminder)
router.get('/:id/whatsapp', protect, getWhatsAppMessage)
router.delete('/:id', protect, requireRole('manager'), deleteLead)

module.exports = router