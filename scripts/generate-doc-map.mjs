import fs from 'fs'
import { glob } from 'glob'

/**
 * 生成文档路径映射表
 * 将文件名映射到完整路径，用于 AI 助手引用跳转
 */
async function generateDocMap() {
  console.log('🔨 生成文档路径映射表...\n')

  // 扫描所有 markdown 文件
  const files = await glob('docs/**/*.md', {
    cwd: process.cwd(),
    absolute: false
  })

  if (files.length === 0) {
    console.log('⚠️  未找到任何 markdown 文件')
    return
  }

  console.log(`📁 找到 ${files.length} 个 markdown 文件\n`)

  // 生成映射表
  const docMap = {}
  const duplicates = new Set()

  files.forEach(file => {
    // 标准化路径分隔符为 /
    const normalizedPath = file.replace(/\\/g, '/')
    const fileName = normalizedPath.split('/').pop()  // 获取文件名

    if (docMap[fileName]) {
      // 同名文件，转换为数组
      if (!Array.isArray(docMap[fileName])) {
        docMap[fileName] = [docMap[fileName]]
      }
      docMap[fileName].push(normalizedPath)
      duplicates.add(fileName)
    } else {
      docMap[fileName] = normalizedPath
    }
  })

  // 输出统计信息
  console.log(`📊 映射统计:`)
  console.log(`   - 唯一文件名: ${Object.keys(docMap).length - duplicates.size}`)
  console.log(`   - 同名文件: ${duplicates.size}`)

  if (duplicates.size > 0) {
    console.log(`\n⚠️  发现同名文件（将返回第一个匹配）:`)
    duplicates.forEach(name => {
      console.log(`   - ${name}:`)
      const paths = Array.isArray(docMap[name]) ? docMap[name] : [docMap[name]]
      paths.forEach(path => console.log(`      * ${path}`))
    })
  }

  // 写入映射文件
  const outputPath = '.vitepress/doc-path-map.json'
  fs.writeFileSync(outputPath, JSON.stringify(docMap, null, 2), 'utf-8')

  console.log(`\n✅ 映射表已生成: ${outputPath}`)
  console.log(`   文件大小: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`)
}

// 执行生成
generateDocMap().catch(error => {
  console.error('❌ 生成映射表失败:', error)
  process.exit(1)
})
