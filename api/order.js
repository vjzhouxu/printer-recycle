import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

function generateOrderNo() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `RE${year}${month}${day}${random}`
}

export default async function handler(req, res) {
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
      accessories, estimate, imageUrl
    } = req.body

    console.log('收到订单:', { brand, model, phone, estimate })

    if (!brand || !model || !phone) {
      return res.status(400).json({ error: '缺少必填字段' })
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: '手机号格式不正确' })
    }

    const orderNo = generateOrderNo()
    
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        orderNo,
        brand,
        model,
        condition: condition || '95新',
        usage: usage || '100小时内',
        fault: fault || '无故障',
        accessories: accessories || '[]',
        estimatePrice: parseInt(estimate) || 0,
        phone,
        imageUrl: imageUrl || '',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase 错误:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('订单保存成功:', orderNo)
    
    res.status(200).json({
      success: true,
      data: { orderNo: order.orderNo }
    })
  } catch (error) {
    console.error('服务器错误:', error)
    res.status(500).json({ error: error.message || '服务器错误' })
  }
}