import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 手动解析 multipart/form-data
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)
    
    // 解析 boundary
    const contentType = req.headers['content-type']
    const boundary = contentType.split('boundary=')[1]
    if (!boundary) {
      return res.status(400).json({ error: 'Invalid form data' })
    }
    
    // 简单解析文件
    const parts = buffer.toString().split(`--${boundary}`)
    let fileData = null
    let filename = null
    
    for (const part of parts) {
      if (part.includes('filename=')) {
        const filenameMatch = part.match(/filename="(.+?)"/)
        if (filenameMatch) filename = filenameMatch[1]
        
        const dataStart = part.indexOf('\r\n\r\n') + 4
        const dataEnd = part.lastIndexOf('\r\n--')
        if (dataStart > 0 && dataEnd > dataStart) {
          fileData = Buffer.from(part.substring(dataStart, dataEnd), 'binary')
        }
        break
      }
    }
    
    if (!fileData || !filename) {
      return res.status(400).json({ error: '没有上传文件' })
    }
    
    const timestamp = Date.now()
    const safeFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, '')}`
    
    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('order-images')
      .upload(safeFilename, fileData, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      console.error('上传失败:', error)
      return res.status(500).json({ error: error.message })
    }
    
    const { data: urlData } = supabase.storage
      .from('order-images')
      .getPublicUrl(safeFilename)
    
    res.status(200).json({ success: true, url: urlData.publicUrl })
  } catch (error) {
    console.error('上传错误:', error)
    res.status(500).json({ error: error.message })
  }
}