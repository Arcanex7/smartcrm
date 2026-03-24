const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    type:{
        type: String,
        enum: ['call', 'email', 'meeting', 'note','status_change', 'ai_followup'],
        required: true
    },
    content:{type: String, required: true},
    createdAt:{type: Date, default: Date.now},
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    }
},
{timestamps: true})

const leadSchema = new mongoose.Schema({
    organizationId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    //Basic Info
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    source:{
        type: String,
        enum: ['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'other','walk_in'],
        default: 'other'
    },

    stage:{
        type: String,required: true,
    },
    assignedTo:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
    //Niceh specific fields
    //stored as key-value pairs for flexibility across niches
    customfields: { type: Map, of: String, default: {} },

    //Activity log for calls, emails, meetings, notes, status changes, and AI follow-ups
    aiScore:{
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    aiScoreReason: { type: String, default: '' },
    lastAiUpdate: { type: Date, default: null },

    //Activity timeline

    activities:[activitySchema],

    //tags
    tags:[{ type: String, trim: true }],
    
    isHot: { type: Boolean, default: false },
hotReason: { type: String, default: null },
whatsappSent: { type: Boolean, default: false },
followUpReminders: [{
  date: Date,
  note: String,
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}],

    //status

    isArchived: { type: Boolean, default: false },
    lastContactedAt: { type: Date, default: null },
    nextFollowUpAt: { type: Date, default: null },

    //deal value if applicable
    value: { type: Number, default: 0 },
},
{timestamps: true }
)

leadSchema.index({ organizationId: 1, stage: 1 })
leadSchema.index({ organizationId: 1, assignedTo: 1 })
leadSchema.index({ organizationId: 1, createdAt: -1 })
leadSchema.index({ name:'text', email:'text',phone:'text' })


module.exports = mongoose.model('Lead', leadSchema)