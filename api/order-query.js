import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phone } = req.query
    
    if (!phone) {
      return res.status(400).json({ error: '请提供手机号码' })
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('phone', phone)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('查询失败:', error)
      return res.status(500).json({ error: error.message })
    }

    res.status(200).json({ success: true, data: orders })
  } catch (error) {
    console.error('服务器错误:', error)
    res.status(500).json({ error: '服务器错误' })
  }
}