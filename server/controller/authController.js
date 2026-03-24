const User = require('../models/User')
const Organization = require('../models/Organization')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const niches = require('../config/niches')

//Register a new user and create an organization
const register = async (req,res) =>{
    try{
        const{
            name,email,password,organizationName,niche,city,monthlyTarget
        } = req.body
        //check if user already exists

        const existingUser = await User.findOne({ email })
        if(existingUser){
            return res.status(400).json({ message: 'User already exists' })
        }
        //Validate niche
        if(!niches[niche]){
            return res.status(400).json({ message: 'Invalid niche' })
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)
        //create user first
        const user = await User.create({name,
            email,
            password: hashedPassword,
            role:'admin'
        })

        //create organization and link user
        const organization = await Organization.create({
            name: organizationName,
            ownerId: user._id,
            niche,
            city: city || '',
            monthlyTarget: monthlyTarget || 0,
            members:[{userId: user._id, role:'admin'}]
        })

        user.organizationId = organization._id
        await user.save()

        //generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                organizationId: organization._id,
                niche: organization.niche
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )
        res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: organization._id,
        organizationName: organization.name,
        niche: organization.niche,
        nicheConfig: niches[niche]
      }
    })

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

const login = async (req,res) =>{
    try{
        const { email, password } = req.body

        const user = await User.findOne({ email }).populate('organizationId')
        if(!user){
            return res.status(400).json({ message: 'Invalid credentials' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        const organization = await Organization.findById(user.organizationId)
        if(!organization){
            return res.status(400).json({ message: 'Organization not found' })
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                organizationId: user.organizationId,
                niche: organization.niche
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )
        res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: organization._id,
        organizationName: organization.name,
        niche: organization.niche,
        nicheConfig: niches[organization.niche]
      }
    })
}
catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// GET current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    const organization = await Organization.findById(req.user.organizationId)

    res.status(200).json({
      user: {
        ...user.toObject(),
        organizationName: organization.name,
        niche: organization.niche,
        nicheConfig: niches[organization.niche],
        monthlyTarget: organization.monthlyTarget,
        currency: organization.currency
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET all niches — for onboarding screen
const getNiches = (req, res) => {
  const nicheList = Object.values(niches).map(n => ({
    id: n.id,
    label: n.label,
    description: n.description,
    icon: n.icon,
    color: n.color
  }))
  res.status(200).json({ niches: nicheList })
}

module.exports = { register, login, getMe, getNiches }