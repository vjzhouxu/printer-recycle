import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const ADMIN_KEY = 'admin123456'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${ADMIN_KEY}`) {
    return res.status(401).json({ error: '未授权' })
  }

  // GET - 获取订单列表
  if (req.method === 'GET') {
    try {
      const { status } = req.query
      
      let query = supabase.from('orders').select('*')
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }
      
      const { data: orders, error } = await query.order('createdAt', { ascending: false })
      
      if (error) throw error
      
      res.status(200).json({ success: true, data: orders })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  
  // PUT - 更新订单状态
  else if (req.method === 'PUT') {
    try {
      const { id, status, remark } = req.body
      
      const { data: order, error } = await supabase
        .from('orders')
        .update({ status, remark, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      res.status(200).json({ success: true, data: order })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}