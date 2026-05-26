import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

function generateOrderNo() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `RE${year}${month}${day}${random}`
}

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      brand, model, phone, condition, usage, fault, 
      accessories, estimate
    } = req.body

    console.log('收到订单:', { brand, model, phone })

    // 保存订单到 Supabase
    const orderNo = generateOrderNo()
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        orderNo,
        brand,
        model,
        condition,
        usage,
        fault,
        accessories: accessories || '[]',
        estimatePrice: parseInt(estimate),
        phone,
        imageUrl: '',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('保存订单失败:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('订单保存成功:', orderNo)
    
    res.status(200).json({
      success: true,
      data: { orderNo: order.orderNo }
    })
  } catch (error) {
    console.error('服务器错误:', error)
    res.status(500).json({ error: '服务器错误' })
  }
}