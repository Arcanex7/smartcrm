const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email:{ type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minLength:8  },

    organizationId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    //Role within the organization (e.g., admin,manager,rep,viewer)

    role:{
        type: String,
        enum: ['admin', 'manager', 'rep', 'viewer'],
        default: 'admin'
    },
    avatar: { type: String, default: '' },
    phone:{type: String, default: '' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// userSchema.index({ email: 1 });
userSchema.index({ organizationId: 1, role:1 });
module.exports = mongoose.model('User', userSchema);