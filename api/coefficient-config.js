import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // GET - 获取所有系数配置
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('coefficient_config')
        .select('*')
      
      if (error) throw error
      
      console.log('返回系数数据:', data)
      
      res.status(200).json({ success: true, data: data || [] })
    } catch (error) {
      console.error('获取系数失败:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  // PUT - 更新系数
  else if (req.method === 'PUT') {
    try {
      const { category, label, factor } = req.body
      
      const { data, error } = await supabase
        .from('coefficient_config')
        .update({ factor, updated_at: new Date().toISOString() })
        .eq('category', category)
        .eq('label', label)
        .select()
      
      if (error) throw error
      
      res.status(200).json({ success: true, data })
    } catch (error) {
      console.error('更新系数失败:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}