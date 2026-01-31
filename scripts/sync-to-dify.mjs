import fs from 'fs'
import { glob } from 'glob'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const DIFY_API_KEY = process.env.DIFY_API_KEY
const DIFY_DATASET_ID = process.env.DIFY_DATASET_ID
const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1'

// 验证必需的环境变量
if (!DIFY_API_KEY || !DIFY_DATASET_ID) {
  console.error('❌ 错误：缺少必需的环境变量')
  console.error('请确保 .env 文件中设置了 DIFY_API_KEY 和 DIFY_DATASET_ID')
  process.exit(1)
}

/**
 * 上传或更新文档到Dify
 */
async function uploadDocument(fileName, content, filePath) {
  try {
    const formData = new FormData()
    
    // 创建Blob对象
    const blob = new Blob([content], { type: 'text/markdown' })
    formData.append('file', blob, fileName)
    formData.append('indexing_technique', 'high_quality')
    formData.append('process_rule', JSON.stringify({
      mode: 'automatic'
    }))

    const response = await fetch(`${DIFY_BASE_URL}/datasets/${DIFY_DATASET_ID}/document/create_by_file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API错误: ${error.message || response.statusText}`)
    }

    const result = await response.json()
    return { success: true, data: result, filePath }
  } catch (error) {
    return { success: false, error: error.message, filePath }
  }
}

/**
 * 获取已存在的文档列表
 */
async function getExistingDocuments() {
  try {
    const response = await fetch(`${DIFY_BASE_URL}/datasets/${DIFY_DATASET_ID}/documents?page=1&limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error(`获取文档列表失败: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.warn(`⚠️  警告：无法获取现有文档列表: ${error.message}`)
    return []
  }
}

/**
 * 主同步函数
 */
async function syncToDify() {
  console.log('🚀 开始同步文档到Dify...\n')

  // 扫描markdown文件
  const files = await glob('docs/**/*.md', {
    cwd: process.cwd(),
    absolute: false
  })

  if (files.length === 0) {
    console.log('⚠️  未找到任何markdown文件')
    return
  }

  console.log(`📁 找到 ${files.length} 个markdown文件\n`)

  // 获取已存在的文档（用于后续可能的增量更新）
  const existingDocs = await getExistingDocuments()
  console.log(`📚 知识库现有 ${existingDocs.length} 个文档\n`)

  const results = {
    success: [],
    failed: []
  }

  // 遍历并上传文件
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    // 使用完整的相对路径作为文件名，以便前端能准确跳转
    const fileName = file  // 例如: "docs/front-end/小程序/微信小程序基础.md"

    console.log(`[${i + 1}/${files.length}] 处理: ${file}`)

    try {
      const content = fs.readFileSync(file, 'utf-8')
      
      // 跳过空文件
      if (!content.trim()) {
        console.log(`  ⏭️  跳过空文件\n`)
        continue
      }

      const result = await uploadDocument(fileName, content, file)
      
      if (result.success) {
        console.log(`  ✅ 上传成功\n`)
        results.success.push(file)
      } else {
        console.log(`  ❌ 上传失败: ${result.error}\n`)
        results.failed.push({ file, error: result.error })
      }

      // 添加延迟避免API限流
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(`  ❌ 处理失败: ${error.message}\n`)
      results.failed.push({ file, error: error.message })
    }
  }

  // 输出同步报告
  console.log('═══════════════════════════════════════')
  console.log('📊 同步完成报告')
  console.log('═══════════════════════════════════════')
  console.log(`✅ 成功: ${results.success.length} 个文件`)
  console.log(`❌ 失败: ${results.failed.length} 个文件`)
  
  if (results.failed.length > 0) {
    console.log('\n失败的文件:')
    results.failed.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`)
    })
  }
  
  console.log('═══════════════════════════════════════\n')

  // 如果有失败的，返回错误码
  if (results.failed.length > 0) {
    process.exit(1)
  }
}

// 执行同步
syncToDify().catch(error => {
  console.error('❌ 同步过程发生错误:', error)
  process.exit(1)
})
