const mongoose = require('mongoose')
require('dotenv').config()

const Lead = require('./models/Lead')
const User = require('./models/User')
const Organization = require('./models/Organization')

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected')

  const user = await User.findOne({ email: 'aryan@smartcrm.com' })
  const org = await Organization.findById(user.organizationId)

  await Lead.deleteMany({ organizationId: org._id })

  const leads = [
    {
      organizationId: org._id,
      assignedTo: user._id,
      name: 'Rahul Sharma',
      phone: '9876543210',
      email: 'rahul@example.com',
      stage: 'visitScheduled',
      value: 7800000,
      isHot: true,
      source: 'referral',
      lastContactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      nextFollowUpAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      customFields: new Map([
        ['propertyType', 'Residential Flat'],
        ['budget', '78,00,000'],
        ['location', 'Sector 17, Chandigarh'],
        ['bhk', '3 BHK'],
        ['source', 'Referral'],
        ['timeline', '1-3 months'],
        ['loanRequired', 'Pre-approved'],
      ]),
      activities: [
        { type: 'note', content: 'Lead created via referral', createdBy: user._id, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { type: 'call', content: 'Called — very interested in 3BHK. Budget confirmed at 78L. Pre-approved loan from HDFC.', createdBy: user._id, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { type: 'note', content: 'Site visit scheduled for tomorrow at 11AM', createdBy: user._id, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ],
    },
    {
      organizationId: org._id,
      assignedTo: user._id,
      name: 'Priya Mehta',
      phone: '9876500002',
      email: 'priya@example.com',
      stage: 'negotiation',
      value: 5500000,
      isHot: false,
      source: 'other',
      lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      customFields: new Map([
        ['propertyType', 'Residential Flat'],
        ['budget', '55,00,000'],
        ['location', 'Mohali'],
        ['bhk', '2 BHK'],
        ['source', 'Facebook Ads'],
        ['timeline', '3-6 months'],
        ['loanRequired', 'Yes'],
      ]),
      activities: [
        { type: 'note', content: 'Came through Facebook ad. Interested in 2BHK Mohali.', createdBy: user._id, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { type: 'meeting', content: 'Site visit done. Liked the property but negotiating price.', createdBy: user._id, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      ],
    },
    {
      organizationId: org._id,
      assignedTo: user._id,
      name: 'Vikram Patel',
      phone: '9876500003',
      email: 'vikram@example.com',
      stage: 'newLead',
      value: 24000000,
      isHot: false,
      source: 'other',
      lastContactedAt: null,
      customFields: new Map([
        ['propertyType', 'Commercial'],
        ['budget', '2,40,00,000'],
        ['location', 'IT City, Mohali'],
        ['source', 'Google Ads'],
        ['timeline', 'Immediate (0-1 month)'],
        ['loanRequired', 'No'],
      ]),
      activities: [
        { type: 'note', content: 'New inquiry via Google Ads. Looking for commercial space for 35 person team.', createdBy: user._id, createdAt: new Date() },
      ],
    },
    {
      organizationId: org._id,
      assignedTo: user._id,
      name: 'Neha Gupta',
      phone: '9876500004',
      email: 'neha@example.com',
      stage: 'tokenPaid',
      value: 11000000,
      isHot: true,
      source: 'referral',
      lastContactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      customFields: new Map([
        ['propertyType', 'Residential Flat'],
        ['budget', '1,10,00,000'],
        ['location', 'Sector 22, Chandigarh'],
        ['bhk', '4 BHK'],
        ['source', 'Referral'],
        ['timeline', 'Immediate (0-1 month)'],
        ['loanRequired', 'No'],
      ]),
      activities: [
        { type: 'note', content: 'Referred by existing client. High budget.', createdBy: user._id, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { type: 'meeting', content: 'Site visit done. Very happy with the flat.', createdBy: user._id, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { type: 'note', content: 'Token amount of ₹5L paid. Agreement to be signed next week.', createdBy: user._id, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ],
    },
    {
      organizationId: org._id,
      assignedTo: user._id,
      name: 'Rajan Singh',
      phone: '9876500005',
      email: 'rajan@example.com',
      stage: 'contacted',
      value: 4500000,
      isHot: false,
      source: 'other',
      lastContactedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      nextFollowUpAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      customFields: new Map([
        ['propertyType', 'Plot'],
        ['budget', '45,00,000'],
        ['location', 'Panchkula'],
        ['source', 'Housing.com'],
        ['timeline', '3-6 months'],
        ['loanRequired', 'Maybe'],
      ]),
      activities: [
        { type: 'note', content: 'Found us on Housing.com. Looking for plot in Panchkula.', createdBy: user._id, createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
      ],
    },
    {
      organizationId: org._id,
      assignedTo: user._id,
      name: 'Sunita Rao',
      phone: '9876500006',
      email: 'sunita@example.com',
      stage: 'closed',
      value: 6200000,
      isHot: false,
      source: 'referral',
      lastContactedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      customFields: new Map([
        ['propertyType', 'Residential Flat'],
        ['budget', '62,00,000'],
        ['location', 'Mohali'],
        ['bhk', '2 BHK'],
        ['source', 'Referral'],
        ['timeline', 'Immediate (0-1 month)'],
        ['loanRequired', 'Yes'],
      ]),
      activities: [
        { type: 'note', content: 'Deal closed! Registry done. Happy client.', createdBy: user._id, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      ],
    },
    {
      organizationId: org._id,
      assignedTo: user._id,
      name: 'Amit Verma',
      phone: '9876500007',
      email: 'amit@example.com',
      stage: 'visitDone',
      value: 6800000,
      isHot: true,
      source: 'other',
      lastContactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      nextFollowUpAt: new Date(),
      customFields: new Map([
        ['propertyType', 'Residential Flat'],
        ['budget', '68,00,000'],
        ['location', 'Sector 8, Chandigarh'],
        ['bhk', '3 BHK'],
        ['source', 'Instagram'],
        ['timeline', '1-3 months'],
        ['loanRequired', 'Yes'],
      ]),
      activities: [
        { type: 'note', content: 'Instagram ad lead. Very active on follow-ups.', createdBy: user._id, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { type: 'meeting', content: 'Site visit done yesterday. Very impressed. Asking for final quote.', createdBy: user._id, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ],
    },
    {
      organizationId: org._id,
      assignedTo: user._id,
      name: 'Deepak Nair',
      phone: '9876500008',
      email: 'deepak@example.com',
      stage: 'lost',
      value: 5200000,
      isHot: false,
      source: 'other',
      lastContactedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      customFields: new Map([
        ['propertyType', 'Residential Flat'],
        ['budget', '52,00,000'],
        ['location', 'Mohali'],
        ['bhk', '2 BHK'],
        ['source', 'MagicBricks'],
        ['timeline', 'Just exploring'],
      ]),
      activities: [
        { type: 'note', content: 'Lost to competitor. Bought a property in Zirakpur instead.', createdBy: user._id, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      ],
    },
  ]

  for (const leadData of leads) {
    const lead = new Lead(leadData)
    await lead.save()
  }

  console.log(`✅ Created ${leads.length} leads`)
  mongoose.disconnect()
}

seed().catch(err => { console.error(err); mongoose.disconnect() })