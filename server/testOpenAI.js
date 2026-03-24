require('dotenv').config()
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function test() {
  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Say hello in one line' }],
      max_tokens: 20
    })
    console.log('✅ Groq working:', res.choices[0].message.content)
  } catch (err) {
    console.log('❌ Error:', err.message)
  }
}

test()