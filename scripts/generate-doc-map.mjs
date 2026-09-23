import fs from 'fs'
import { glob } from 'glob'
import { buildShardEntryMap } from './lib/dify-shard.mjs'

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

  // 追加 Dify 知识库分片名映射
  // 知识库按目录合并为分片文档（详见 scripts/lib/dify-shard.mjs），
  // AI 回答引用的文档名可能是分片名（如 React.md），这里补上入口文件的映射，
  // 否则 DifyChat.vue 用 basename 查不到路径，引用就点不动。
  const shardSources = files.map(file => {
    const normalizedPath = file.replace(/\\/g, '/')
    const rel = normalizedPath.replace(/^docs\//, '')
    return { rel, dir: rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '.', text: '' }
  })
  const shardMap = buildShardEntryMap(shardSources)
  let shardAdded = 0
  for (const [shardName, entryPath] of Object.entries(shardMap)) {
    if (docMap[shardName]) continue  // 不覆盖真实文件名
    docMap[shardName] = entryPath
    shardAdded++
  }

  // 输出统计信息
  console.log(`📊 映射统计:`)
  console.log(`   - 唯一文件名: ${Object.keys(docMap).length - duplicates.size - shardAdded}`)
  console.log(`   - 同名文件: ${duplicates.size}`)
  console.log(`   - 知识库分片名: ${shardAdded}`)

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
