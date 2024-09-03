import path from "node:path";
import fs from "node:fs";

// 文件根目录
const DIR_PATH = path.resolve();

// 入口文件夹名称
import { ENTRY } from './config'

// 判断是否是文件夹
const isDirectory = (path) => fs.lstatSync(path).isDirectory();

// 替换名字的textMap
import { textMap } from './config'

// 替换名字且具有索引的函数
import { textAndIndexMap } from "./config";

// 不需要引入的文件夹
import { NOT_READ } from './config'

// 替换名字的方法
import { textMapFn } from './config'

import { sortFn } from "./config";

// 获得侧边栏的方法
function getSidebarCol(params, path1, pathname) {
  // [ 'front-end', 'spider' ] e:\docs\docs docs
  let result = []
  params.forEach(element => {
    const dir = path.resolve(path1, element)
    
    if (isDirectory(dir)) {
      // 是目录，推进递归
      // 获得递归参数，文件夹子文件，路径，路径名
      const files = fs.readdirSync(dir)
      // 推进
      result.push({
        text: textMapFn(textMap, element),
        collapsed: true,
        items: getSidebarCol(files, dir, `${pathname}/${element}`)
      })
    } else {
      // 不是目录，终结子项
      // 排除非md文件
      result.push({
        text: element,
        link: `/${pathname}/${element}`
      })
    }
  });
  // 对name做一下处理，把后缀删除
  result.map((item) => {
    item.text = item.text.replace(/\.md$/, "");
  });
  return sortFn(textAndIndexMap, result)
}

// 获得导航栏的方法
function getNav(files, dirPath, entry) {
    const result = [
        {
            text: '首页', link: '/'
        },
    ]
    // console.log(files) // docs入口下的所有文件夹
    files.forEach((element, index) => {
        const path1 = path.join(dirPath, element)
        // console.log(path1) // C:\Users\Administrator\code\docs\docs\front-end
        // console.log(element)
        result.push({
            text: textMapFn(textMap, element),
            items: []
        })
        // 实际上path1一定是文件夹 这里可以重构
        if (isDirectory(path1)) {
            const filesChild = fs.readdirSync(path1)
            // filesChild可能是二级文件夹，也可能是单个文件
            filesChild.forEach(child => {
                const path2 = path.join(path1, child)
                if (isDirectory(path2)) {
                    // 获得文件在这里
                    const filesMarkdown = fs.readdirSync(path2)
                    // 因为filesMarkdown是一坨文件，这里是导航栏，只需要导航到索引零提供访问即可。
                    result[index + 1].items.push({
                        text: textMapFn(textMap, child),
                        link: `/${entry}/${element}/${child}/${filesMarkdown[0]}`
                    })
                    // console.log(result[index + 1].items[0].link);
                } else {
                  // 如果不是目录，直接呈现以文档形式
                  if(result[index + 1].items === ''){
                    delete result[index + 1].items;
                  }
                  result[index + 1].link = `/${entry}/${element}/${child}`;
                  // console.log(result[index + 1].link);
                }
            });
        }
    });
    return sortFn(textAndIndexMap, result)
    
}

// 导出方法
export const set_nav_and_sidebar = () => {
  const entry = ENTRY
  // 获取pathname的路径
  const dirPath = path.join(DIR_PATH, entry);
  // 读取pathname下的所有文件或者文件夹
  let files = fs.readdirSync(dirPath);

  // 去除不需要的文件夹
  files = files.filter(file => !NOT_READ.includes(file));

  const result = {}
  // 生成导航栏
  result.nav = getNav(files, dirPath, entry)
  // 生成侧边栏
  result.sidebar = getSidebarCol(files, dirPath, entry)

  return result;
};