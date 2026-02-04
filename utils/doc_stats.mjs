import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";

// 导入配置
import { ENTRY, NOT_READ, textMap } from './config.js'

const DIR_PATH = path.resolve();

/**
 * 获取文件的 Git 最后更新时间
 * @param {string} filePath 文件路径
 * @returns {Date|null} 最后更新时间
 */
function getFileLastModified(filePath) {
  try {
    // 尝试从 Git 获取最后提交时间
    const timestamp = execSync(
      `git log -1 --format=%at "${filePath}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();
    
    if (timestamp) {
      return new Date(parseInt(timestamp) * 1000);
    }
  } catch (error) {
    // Git 命令失败，使用文件系统时间
  }
  
  // 回退到文件系统修改时间
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  } catch {
    return null;
  }
}

/**
 * 读取 Markdown 文件并统计字数
 * @param {string} filePath 文件路径
 * @returns {number} 字数
 */
function countWords(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // 移除 frontmatter
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---/, '');
    // 中文字符
    const chineseChars = withoutFrontmatter.match(/[\u4e00-\u9fa5]/g) || [];
    // 英文单词
    const englishWords = withoutFrontmatter.match(/[a-zA-Z]+/g) || [];
    return chineseChars.length + englishWords.length;
  } catch {
    return 0;
  }
}

/**
 * 递归扫描目录获取所有 Markdown 文件
 * @param {string} dirPath 目录路径
 * @param {string} relativePath 相对路径
 * @returns {Array} 文件信息数组
 */
function scanDirectory(dirPath, relativePath = '') {
  const files = fs.readdirSync(dirPath);
  let results = [];

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const relPath = relativePath ? `${relativePath}/${file}` : file;
    
    if (fs.statSync(fullPath).isDirectory()) {
      // 跳过不需要的目录
      if (!NOT_READ.includes(file)) {
        results = results.concat(scanDirectory(fullPath, relPath));
      }
    } else if (file.endsWith('.md')) {
      const lastModified = getFileLastModified(fullPath);
      const wordCount = countWords(fullPath);
      
      results.push({
        name: file.replace('.md', ''),
        path: relPath,
        fullPath: fullPath,
        lastModified: lastModified,
        wordCount: wordCount,
        category: relativePath.split('/')[0] || 'root'
      });
    }
  });

  return results;
}

/**
 * 生成文档统计信息
 * @returns {Object} 统计信息对象
 */
export function generateDocStats() {
  const entryPath = path.join(DIR_PATH, ENTRY);
  const allDocs = scanDirectory(entryPath);

  // 按分类统计
  const categoryStats = {};
  allDocs.forEach(doc => {
    const category = doc.category;
    if (!categoryStats[category]) {
      categoryStats[category] = {
        count: 0,
        wordCount: 0,
        displayName: textMap[category] || category
      };
    }
    categoryStats[category].count++;
    categoryStats[category].wordCount += doc.wordCount;
  });

  // 最近更新的文档（前10篇）
  const recentDocs = allDocs
    .filter(doc => doc.lastModified)
    .sort((a, b) => b.lastModified - a.lastModified)
    .slice(0, 10)
    .map(doc => ({
      name: doc.name,
      path: `/${ENTRY}/${doc.path.replace(/\.md$/, '.html')}`,
      lastModified: doc.lastModified.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      category: textMap[doc.category] || doc.category
    }));

  // 总体统计
  const totalStats = {
    totalDocs: allDocs.length,
    totalWords: allDocs.reduce((sum, doc) => sum + doc.wordCount, 0),
    categories: Object.keys(categoryStats).length,
    lastUpdate: allDocs.length > 0 && allDocs[0].lastModified 
      ? new Date(Math.max(...allDocs.map(d => d.lastModified?.getTime() || 0)))
          .toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
      : '未知'
  };

  return {
    total: totalStats,
    byCategory: categoryStats,
    recent: recentDocs
  };
}

/**
 * 将统计信息保存为 JSON 文件
 * @param {string} outputPath 输出文件路径
 */
export function saveDocStats(outputPath = '.vitepress/doc-stats.json') {
  const stats = generateDocStats();
  const fullPath = path.join(DIR_PATH, outputPath);
  
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(stats, null, 2), 'utf-8');
  
  console.log(`📊 文档统计信息已生成: ${outputPath}`);
  console.log(`   总文档数: ${stats.total.totalDocs}`);
  console.log(`   总字数: ${stats.total.totalWords.toLocaleString()}`);
  console.log(`   分类数: ${stats.total.categories}`);
}
