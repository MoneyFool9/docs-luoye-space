// 替换名字且具有索引的函数
export const textAndIndexMap = {
    // 根目录
    'front-end': { name: '前端', index: 1000 },
    'spider': { name: '爬虫', index: 999 },
    'software-test': { name: '软件测试', index: 996 },
    'fundamental-concept': { name: '基础概念', index: 666 },
    'problems': { name: '问题', index: 555 },
    'temp': { name: '施工中', index: 0 },
  
    // front-end的子目录
    'JavaScript': { name: 'JavaScript', index: 2000 },
    'ES6': { name: 'ES6', index: 1999 },
    'Vue': { name: 'Vue', index: 1500 },
    'React': { name: 'React', index: 1400 },
    // 'interview': { name: '面试', index: 1300 },
    'next-front-end': { name: '前端进阶', index: 1000 },
    'bugfix': { name: 'BUG解决方案', index: 666 },
    // 'read': { name: '读书笔记', index: 555 },
    // 'some-library': { name: '一些库', index: 444 },
  
    // problems的子目录
    'algorithm': { name: '算法', index: 1000 },
    'lanqiao': { name: '蓝桥杯', index: 900 },
  
    // spider的子目录
    'reverse-engineering': { name: '逆向工程', index: 2000 },
  
    // Vue目录下的文件
    '技术复盘': {name: '技术复盘', index: 2000},
    '语法点': {name: '语法点', index: 1000},
    'Vue.js 设计与实现': {name: 'Vue.js 设计与实现', index: 999},
    'Vue源码解读': {name: 'Vue源码解读', index: 666}
  }
  
  // 替换名字的textMap
  export const textMap = Object.fromEntries(new Map(Object.entries(textAndIndexMap).map(([key, value]) => [key, value.name])));
  
  // 入口文件夹名称
  export const ENTRY = 'docs'
  
  // 屏蔽的文件夹名称
  export const NOT_READ = ['public', 'utils']
  
  // 替换名字的方法
  export const textMapFn = (textMap, text) => {
    if (text in textMap) {
        return textMap[text]
    } else {
        return text
    }
  }
  
  export const sortFn = (map, arr) => {
    // 第一层
    map = map instanceof Map ? map : new Map(Object.values(map).map(item => [item.name, item.index]))
    arr.sort((a, b) => map.has(a.text) && map.has(b.text) && map.get(b.text) - map.get(a.text))
    // 深度
    arr.forEach(child => child.items && child.items.length > 1 && sortFn(map, child.items))
    return arr
  }