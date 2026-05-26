import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const ADMIN_KEY = 'admin123456'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // GET - 获取所有产品配置
  if (req.method === 'GET') {
    try {
      const { data: products, error } = await supabase
        .from('product_config')
        .select('*')
        .order('brand', { ascending: true })
      
      if (error) throw error
      
      // 转换为前端需要的格式
      const brands = {}
      products.forEach(product => {
        if (!brands[product.brand]) {
          brands[product.brand] = {
            name: product.brand,
            models: []
          }
        }
        brands[product.brand].models.push({
          name: product.model,
          releaseYear: product.release_year,
          originalPrice: product.original_price,
          accessories: product.accessories || []
        })
      })
      
      res.status(200).json({ success: true, data: Object.values(brands) })
    } catch (error) {
      console.error('获取配置失败:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  // POST - 更新附件价格（需要管理员权限）
  else if (req.method === 'POST') {
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${ADMIN_KEY}`) {
      return res.status(401).json({ error: '未授权' })
    }
    
    try {
      const { brand, model, accessories } = req.body
      
      const { data, error } = await supabase
        .from('product_config')
        .update({ accessories, updated_at: new Date().toISOString() })
        .eq('brand', brand)
        .eq('model', model)
        .select()
      
      if (error) throw error
      
      res.status(200).json({ success: true, data })
    } catch (error) {
      console.error('更新失败:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  // PUT - 添加或更新产品
  else if (req.method === 'PUT') {
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${ADMIN_KEY}`) {
      return res.status(401).json({ error: '未授权' })
    }
    
    try {
      const { brand, model, releaseYear, originalPrice, accessories } = req.body
      
      const { data, error } = await supabase
        .from('product_config')
        .upsert({
          brand,
          model,
          release_year: releaseYear,
          original_price: originalPrice,
          accessories: accessories || [],
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (error) throw error
      
      res.status(200).json({ success: true, data })
    } catch (error) {
      console.error('保存失败:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  // DELETE - 删除产品
  else if (req.method === 'DELETE') {
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${ADMIN_KEY}`) {
      return res.status(401).json({ error: '未授权' })
    }
    
    try {
      const { brand, model } = req.query
      
      const { error } = await supabase
        .from('product_config')
        .delete()
        .eq('brand', brand)
        .eq('model', model)
      
      if (error) throw error
      
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('删除失败:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}