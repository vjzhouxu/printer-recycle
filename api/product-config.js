import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// 简单的内存缓存
let cachedData = null
let cacheTime = null
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate') // Vercel CDN 缓存
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // GET - 获取所有产品配置
  if (req.method === 'GET') {
    try {
      // 使用缓存
      if (cachedData && cacheTime && (Date.now() - cacheTime) < CACHE_DURATION) {
        return res.status(200).json({ success: true, data: cachedData })
      }
      
      const { data, error } = await supabase
        .from('product_config')
        .select('*')
        .order('brand', { ascending: true })
      
      if (error) throw error
      
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
      
      const result = Array.from(brandsMap.values())
      
      // 更新缓存
      cachedData = result
      cacheTime = Date.now()
      
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      console.error('获取产品失败:', error)
      res.status(500).json({ error: error.message })
    }
  }
  
  // PUT - 更新产品配置（附件价格）
  else if (req.method === 'PUT') {
    try {
      const { brand, model, accessories } = req.body
      
      // 清除缓存
      cachedData = null
      cacheTime = null
      
      const { data, error } = await supabase
        .from('product_config')
        .update({ accessories, updated_at: new Date().toISOString() })
        .eq('brand', brand)
        .eq('model', model)
        .select()
      
      if (error) throw error
      
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