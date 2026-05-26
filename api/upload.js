import { createClient } from '@supabase/supabase-js'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

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
    const form = formidable({})
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })
    
    const imageFile = files.image?.[0] || files.image
    
    if (!imageFile) {
      return res.status(400).json({ error: '没有上传文件' })
    }
    
    const fileBuffer = fs.readFileSync(imageFile.filepath)
    const timestamp = Date.now()
    const filename = `${timestamp}-${imageFile.originalFilename}`
    
    const { data, error } = await supabase.storage
      .from('order-images')
      .upload(filename, fileBuffer, {
        contentType: imageFile.mimetype,
        cacheControl: '3600'
      })
    
    if (error) {
      console.error('上传失败:', error)
      return res.status(500).json({ error: error.message })
    }
    
    const { data: urlData } = supabase.storage
      .from('order-images')
      .getPublicUrl(filename)
    
    res.status(200).json({ success: true, url: urlData.publicUrl })
  } catch (error) {
    console.error('上传错误:', error)
    res.status(500).json({ error: error.message })
  }
}