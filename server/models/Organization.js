const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    ownerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    //This niche drives everything about the organization, from the types of customers they serve to the products they offer. It helps us understand their market and tailor our solutions to meet their specific needs.
    niche:{
        type: String,
        enum:['realEstate','saas','healthcare','education','freelance','finance','retail','restaurant','other'],
        required: true
    },
    //business details
    city: { type: String, default: '' },
    industry: { type: String, default: '' },
    monthlyTarget: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },

    members:[{
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',},
        role:{
            type: String,
            enum: ['admin', 'manager', 'rep', 'viewer'],
        },
        joinedAt: { type: Date, default: Date.now }
    }],

    //Invites tokens for pending invites
    pendingInvites:[{
        email:String,
        role: String,
        token: String,
        expiresAt: Date
    }],
    plan:{
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'},
},
    {timestamps: true }
)
organizationSchema.index({ ownerId: 1 })

module.exports = mongoose.model('Organization', organizationSchema)