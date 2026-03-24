const Lead = require('../models/Lead')
const Organization = require('../models/Organization')
const { permissions } = require('../Middleware/rbacMiddleware')

// GET all leads — filtered by role
const getLeads = async (req, res) => {
  try {
    const { stage, search, assignedTo, page = 1, limit = 20 } = req.query

    let query = {
      organizationId: req.user.organizationId,
      isArchived: false
    }

    // Reps can only see their own leads
    if (req.user.role === 'rep') {
      query.assignedTo = req.user.id
    } else if (assignedTo) {
      query.assignedTo = assignedTo
    }

    if (stage) query.stage = stage

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit
    const total = await Lead.countDocuments(query)
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.status(200).json({
      leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET single lead
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    }).populate('assignedTo', 'name email avatar')
      .populate('activities.createdBy', 'name avatar')

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' })
    }

    // Reps can only view their own leads
    if (req.user.role === 'rep' &&
        lead.assignedTo?._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.status(200).json({ lead })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// CREATE lead
const createLead = async (req, res) => {
  try {
    const {
      name, email, phone, company,
      source, stage, assignedTo,
      value, tags, customFields, notes
    } = req.body

    // Get org to find first pipeline stage if none provided
    const organization = await Organization.findById(req.user.organizationId)
    const niches = require('../config/niches')
    const nicheConfig = niches[organization.niche]
    const defaultStage = nicheConfig.pipelineStages[0].id

    const lead = await Lead.create({
      organizationId: req.user.organizationId,
      name,
      email: email || '',
      phone: phone || '',
      company: company || '',
      source: source || 'other',
      stage: stage || defaultStage,
      assignedTo: assignedTo || req.user.id,
      value: value || 0,
      tags: tags || [],
      customFields: customFields || {},
      activities: notes ? [{
        type: 'note',
        content: notes,
        createdBy: req.user.id
      }] : [{
        type: 'note',
        content: 'Lead created',
        createdBy: req.user.id
      }]
    })

    await lead.populate('assignedTo', 'name email avatar')

    // Emit real-time event to org room
    const { io } = require('../index')
    io.to(req.user.organizationId.toString()).emit('lead_created', { lead })

    res.status(201).json({ message: 'Lead created', lead })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// UPDATE lead
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' })
    }

    if (!permissions.canEditLead(req, lead)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const oldStage = lead.stage
    const updates = req.body

    // If stage changed, add to activity timeline
    if (updates.stage && updates.stage !== oldStage) {
      lead.activities.push({
        type: 'status_change',
        content: `Stage changed from ${oldStage} to ${updates.stage}`,
        createdBy: req.user.id
      })
    }

    Object.assign(lead, updates)
    await lead.save()
    await lead.populate('assignedTo', 'name email avatar')

    // Emit real-time event
    const { io } = require('../index')
    io.to(req.user.organizationId.toString()).emit('lead_updated', { lead })

    res.status(200).json({ message: 'Lead updated', lead })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// UPDATE lead stage only — for kanban drag and drop
const updateLeadStage = async (req, res) => {
  try {
    const { stage } = req.body
    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })

    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    const oldStage = lead.stage
    lead.stage = stage
    lead.activities.push({
      type: 'status_change',
      content: `Moved from ${oldStage} to ${stage}`,
      createdBy: req.user.id
    })

    await lead.save()

    const { io } = require('../index')
    io.to(req.user.organizationId.toString()).emit('lead_stage_changed', {
      leadId: lead._id,
      oldStage,
      newStage: stage,
      lead
    })

    res.status(200).json({ message: 'Stage updated', lead })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ADD activity to lead
const addActivity = async (req, res) => {
  try {
    const { type, content } = req.body
    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })

    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    lead.activities.push({
      type,
      content,
      createdBy: req.user.id
    })

    lead.lastContactedAt = new Date()
    await lead.save()
    await lead.populate('activities.createdBy', 'name avatar')

    const { io } = require('../index')
    io.to(req.user.organizationId.toString()).emit('activity_added', {
      leadId: lead._id,
      activity: lead.activities[lead.activities.length - 1]
    })

    res.status(201).json({
      message: 'Activity added',
      activity: lead.activities[lead.activities.length - 1]
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE lead
const deleteLead = async (req, res) => {
  try {
    if (!permissions.canDeleteLead(req)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { isArchived: true },
      { new: true }
    )

    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    const { io } = require('../index')
    io.to(req.user.organizationId.toString()).emit('lead_deleted', {
      leadId: lead._id
    })

    res.status(200).json({ message: 'Lead archived' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET pipeline — leads grouped by stage
const getPipeline = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organizationId)
    const niches = require('../config/niches')
    const nicheConfig = niches[organization.niche]

    let baseQuery = {
      organizationId: req.user.organizationId,
      isArchived: false
    }

    if (req.user.role === 'rep') {
      baseQuery.assignedTo = req.user.id
    }

    const leads = await Lead.find(baseQuery)
      .populate('assignedTo', 'name avatar')
      .sort({ createdAt: -1 })

    // Group by stage
    const pipeline = {}
    nicheConfig.pipelineStages.forEach(stage => {
      pipeline[stage.id] = {
        stage: stage,
        leads: leads.filter(l => l.stage === stage.id),
        count: 0,
        value: 0
      }
      pipeline[stage.id].count = pipeline[stage.id].leads.length
      pipeline[stage.id].value = pipeline[stage.id].leads.reduce(
        (sum, l) => sum + (l.value || 0), 0
      )
    })

    res.status(200).json({ pipeline, totalLeads: leads.length })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
const getDashboard = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organizationId)
    const niches = require('../config/niches')
    const nicheConfig = niches[organization.niche]

    let baseQuery = {
      organizationId: req.user.organizationId,
      isArchived: false
    }

    if (req.user.role === 'rep') baseQuery.assignedTo = req.user.id

    const leads = await Lead.find(baseQuery)
      .populate('assignedTo', 'name avatar')
      .sort({ updatedAt: -1 })

    // Pipeline breakdown
    const pipeline = {}
    nicheConfig.pipelineStages.forEach(stage => {
      const stageLeads = leads.filter(l => l.stage === stage.id)
      pipeline[stage.id] = {
        label: stage.label,
        color: stage.color,
        count: stageLeads.length,
        value: stageLeads.reduce((s, l) => s + (l.value || 0), 0)
      }
    })

    // Recent activity — last 10 leads updated
    const recentLeads = leads.slice(0, 10)

    // Stats
    const totalLeads = leads.length
    const totalValue = leads.reduce((s, l) => s + (l.value || 0), 0)

    // This month
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const thisMonthLeads = leads.filter(l => new Date(l.createdAt) >= monthStart)

    // Closed/won this month
    const closedStages = ['closed', 'closedWon', 'issued', 'completed', 'confirmed']
    const closedThisMonth = leads.filter(l =>
      closedStages.includes(l.stage) &&
      new Date(l.updatedAt) >= monthStart
    )

    // Overdue follow-ups
    const now = new Date()
    const overdueFollowUps = leads.filter(l =>
      l.nextFollowUpAt && new Date(l.nextFollowUpAt) < now &&
      !closedStages.includes(l.stage)
    )

    // Idle leads — not contacted in 7+ days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const idleLeads = leads.filter(l =>
      !closedStages.includes(l.stage) &&
      (!l.lastContactedAt || new Date(l.lastContactedAt) < sevenDaysAgo)
    )

    res.status(200).json({
      stats: {
        totalLeads,
        totalValue,
        thisMonthLeads: thisMonthLeads.length,
        closedThisMonth: closedThisMonth.length,
        closedValue: closedThisMonth.reduce((s, l) => s + (l.value || 0), 0),
        overdueFollowUps: overdueFollowUps.length,
        idleLeads: idleLeads.length,
        monthlyTarget: organization.monthlyTarget,
        targetProgress: organization.monthlyTarget > 0
          ? Math.round((closedThisMonth.reduce((s, l) => s + (l.value || 0), 0) / organization.monthlyTarget) * 100)
          : 0
      },
      pipeline,
      recentLeads,
      idleLeads: idleLeads.slice(0, 3),
      nicheConfig,
      organizationName: organization.name,
      currency: organization.currency || '₹'
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
// Toggle hot lead
const toggleHotLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    lead.isHot = !lead.isHot
    lead.hotReason = req.body.reason || null
    lead.activities.push({
      type: 'note',
      content: lead.isHot ? `Marked as hot lead${req.body.reason ? ': ' + req.body.reason : ''}` : 'Removed from hot leads',
      createdBy: req.user.id
    })
    await lead.save()

    const { io } = require('../index')
    io.to(req.user.organizationId.toString()).emit('lead_updated', { lead })

    res.status(200).json({ message: lead.isHot ? 'Marked as hot' : 'Removed from hot', lead })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Add follow-up reminder
const addReminder = async (req, res) => {
  try {
    const { date, note } = req.body
    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    lead.followUpReminders.push({ date, note })
    lead.nextFollowUpAt = new Date(date)
    await lead.save()

    res.status(201).json({ message: 'Reminder added', lead })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get today's follow-ups
const getTodayFollowUps = async (req, res) => {
  try {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const leads = await Lead.find({
      organizationId: req.user.organizationId,
      isArchived: false,
      nextFollowUpAt: { $gte: start, $lte: end }
    }).populate('assignedTo', 'name')

    res.status(200).json({ leads, count: leads.length })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get WhatsApp message template for a lead
const getWhatsAppMessage = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    const organization = await Organization.findById(req.user.organizationId)
    const niches = require('../config/niches')
    const nicheConfig = niches[organization.niche]

    let template = nicheConfig.whatsappTemplate || 'Hi {name}, following up on your enquiry. Are you still interested?'

    // Replace placeholders
    template = template.replace('{name}', lead.name)
    const fields = lead.customFields || {}
    Object.keys(fields).forEach(key => {
      template = template.replace(`{${key}}`, fields[key] || '')
    })

    const phone = lead.phone?.replace(/\D/g, '')
    const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(template)}`

    res.status(200).json({ message: template, waUrl, phone })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
const generateAIContent = async (req, res) => {
  try {
    const { type, leadId, customPrompt } = req.body

    const organization = await Organization.findById(req.user.organizationId)
    const niches = require('../config/niches')
    const nicheConfig = niches[organization.niche]

    let lead = null
    if (leadId) {
      lead = await Lead.findOne({
        _id: leadId,
        organizationId: req.user.organizationId
      })
    }

    // ✅ Define context FIRST
    const systemContext = `You are an expert sales assistant for ${nicheConfig.aiPromptContext}.
Be concise, professional and personalized. Always write in a warm tone.
Organization: ${organization.name}. Currency: ${organization.currency || '₹'}.`

    let userPrompt = ''

    // =========================
    // PROMPT LOGIC
    // =========================

    if (type === 'followup' && lead) {
      userPrompt = `Write a short WhatsApp follow-up:
Name: ${lead.name}
Stage: ${lead.stage}
Value: ${lead.value}
Recent activity: ${lead.activities?.slice(-3).map(a => a.content).join('. ')}

Keep it under 80 words and action-oriented.`

    } else if (type === 'email' && lead) {
      userPrompt = `Write a professional follow-up email:
Name: ${lead.name}
Stage: ${lead.stage}
Include subject line.`

    } else if (type === 'brief' && lead) {
      userPrompt = `Generate meeting prep:
Name: ${lead.name}
Stage: ${lead.stage}
Value: ${lead.value}

Include talking points, objections, goal.`

    } else if (type === 'score' && lead) {
      userPrompt = `Score this lead (0-100):
Name: ${lead.name}
Stage: ${lead.stage}
Value: ${lead.value}

Respond ONLY JSON:
{"score": 75, "reason": "why", "nextAction": "what to do"}`
    } else if (type === 'custom') {
      userPrompt = customPrompt || 'Give sales advice.'
    } else {
      return res.status(400).json({ message: 'Invalid request' })
    }

    // =========================
    // GROQ API
    // =========================

    const Groq = require('groq-sdk')
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    const content = completion.choices[0].message.content

    // =========================
    // HANDLE SCORE JSON
    // =========================

    if (type === 'score' && lead) {
      try {
        const clean = content.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)

        lead.aiScore = parsed.score
        lead.aiScoreReason = parsed.reason
        lead.lastAiUpdate = new Date()

        await lead.save()

        return res.status(200).json({ content, parsed, lead })
      } catch {
        return res.status(200).json({ content })
      }
    }

    res.status(200).json({ content })

  } catch (error) {
    console.error('AI error:', error.message)
    res.status(500).json({ message: 'AI error', error: error.message })
  }
}

module.exports = {
  getLeads, getLead, createLead,
  updateLead, updateLeadStage,
  addActivity, deleteLead, getPipeline,
  getDashboard, toggleHotLead,
  addReminder, getTodayFollowUps,
  getWhatsAppMessage,generateAIContent
}