import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const ADMIN_KEY = 'admin123456'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
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
      
      const conditions = data.filter(c => c.type === 'condition')
      const usages = data.filter(c => c.type === 'usage')
      const faults = data.filter(c => c.type === 'fault')
      
      res.status(200).json({ 
        success: true, 
        data: { conditions, usages, faults }
      })
    } catch (error) {
      console.error('获取系数失败:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  // PUT - 更新系数（需要管理员权限）
  else if (req.method === 'PUT') {
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${ADMIN_KEY}`) {
      return res.status(401).json({ error: '未授权' })
    }
    
    try {
      const { type, label, factor } = req.body
      
      const { data, error } = await supabase
        .from('coefficient_config')
        .update({ factor })
        .eq('type', type)
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