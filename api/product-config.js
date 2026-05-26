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

  // GET - 获取所有产品配置
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('product_config')
        .select('*')
        .order('brand', { ascending: true })
      
      if (error) {
        console.error('查询产品失败:', error)
        return res.status(500).json({ error: error.message })
      }
      
      // 转换为前端需要的格式
      const brandsMap = new Map()
      data.forEach(product => {
        if (!brandsMap.has(product.brand)) {
          brandsMap.set(product.brand, {
            name: product.brand,
            models: []
          })
        }
        brandsMap.get(product.brand).models.push({
          name: product.model,
          releaseYear: product.release_year,
          originalPrice: product.original_price,
          accessories: product.accessories || []
        })
      })
      
      res.status(200).json({ success: true, data: Array.from(brandsMap.values()) })
    } catch (error) {
      console.error('获取产品失败:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  // PUT - 更新产品配置（附件价格）
  else if (req.method === 'PUT') {
    try {
      const { brand, model, accessories } = req.body
      
      console.log('更新附件:', { brand, model, accessories })
      
      const { data, error } = await supabase
        .from('product_config')
        .update({ accessories, updated_at: new Date().toISOString() })
        .eq('brand', brand)
        .eq('model', model)
        .select()
      
      if (error) {
        console.error('更新产品失败:', error)
        return res.status(500).json({ error: error.message })
      }
      
      console.log('更新成功:', data)
      res.status(200).json({ success: true, data })
    } catch (error) {
      console.error('更新产品失败:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}