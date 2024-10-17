## 大前端：开始学习nodejs

#### **Day 1：nodejs入门**

- 模块(module)，包(package)，commonJS
- 内置模块
  - http模块 (get, post, jsonp, cors, 爬虫)
  - url模块
  - querystring模块   api: parse, stringify   字符串编码规则escape
  - event模块
  - fs文件
  - stream流模块
  - zlib模块
  - crypto模块
  - 中间层转发
  - 垃圾回收机制

- 路由
  - 基础
  - 参数接收
  - Async
  - 静态资源
- 顶级对象process

#### **Day2：express框架**

- 基本路由  
- 静态资源
- 中间件  use()
- 获取请求参数
- 服务端渲染(SSR)和客户端渲染(SPA)
- 生成器  express-generator   express project --view

#### **Day3：**

1.  MangoDB 数据库

- 安装与启动

- 命令行操作
- 可视化操作
- nodejs操作

2. 登录鉴权(auth)

- Cookie与Session
- JWT

3. 文件上传
4. 接口文档（APIDOC）
5. koa

- 对比express
- 路由
- 静态资源
- 获取参数
- ejs模版
- cookie&session
- JWT
- 文件上传
- 操作mangoDB

6. MySQL

- spl语句
- nodejs操作

7. Socket

- ws模块
- socketio模块

#### Day4：

1. Mocha
   - 编写测试
   - 异步测试
   - http测试
   - 钩子函数

#### Day5：后台管理项目node端

![image-20241012174554865](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241012174554865.png)

优势：进行系统级别的操作

- 文件读写(File System)
- 网络通信(http / https)
- 进程管理(process management)

#### 模块化开发

![image-20241012180301512](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241012180301512.png)

包管理工具：npm   pnpm    yarn

```js
const http = require('http');
      
//创建本地服务器来从其接收数据
const server = http.createserver((req,res)=>{
  res.writeHead(200,{'content-Type':'application/json'}),
  res.end(JSON.stringify({
    data: 'He11o world!'
	}));
});
server.listen(8000);  //监听本地端口
```

api：createserver   接收两个参数 (req, res)  -request, response

req.url    路由path

插件   nodemon     node-dev

#### url模块

```js
pathname = url.parse(req.url).pathname
```

 url.parse    url.format     resolve    拼接![image-20241012202004382](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241012202004382.png)

样例代码

![](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241012202409024.png)

输出示例

![image-20241012202350803](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241012202350803.png)

新版URL实例

```js
const url = new URL(req.url, 'http://127.0.0.1:3000')
```

![image-20241012203041434](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241012203041434.png)

迭代器searchParams

![image-20241012204137708](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241012204137708.png)

![image-20241012205859459](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241012205859459.png)

#### http模块：jsonp

```js
const http = require('http')
const url= require('url')
const app =http.createserver((req,res)=>{
  let urlobj= url.parse(req.url, true)
	switch(urlobj.pathname){
    case '/api/user':
			res.end(`${urlobj.query.cb}({"name": "gp145"})`)   //jsonp 关键
			break
		default:
			res.end('404.');
			break;
})
app.listen(8080，()=>{console.1og('1ocalhost:8080')})
```

返回callback   执行callback接收到data，这时就没有跨域问题。这个过程需要将response接收到动态创建的script之后取到数据添加到document。

```js
const http = require('http')
const url= require('url')
const querystring =require( 'querystring')

const app = http.createserver((req,res)=>{
  let data = ''
	let urlobj = url.parse(req.url, true)
	res.writeHead(200，{
                'content-type':'application/json;charset=utf-8',
                'Access-control-A1low-0rigin':'*'
                })
	req.on('data',(chunk)=>{
    data += chunk
  })
	req.on('end',()=>{
		responseResult(querystring.parse(data))
		function responseResult(data){
      switch(urobj.pathname){
        case '/api/login':
          res.end(isoN.stringify({
            message: data
          })
}))

```

#### CORS问题     ``'Access-control-A1low-0rigin':'*'``

![image-20241012220843803](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241012220843803.png)

![image-20241012233145679](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241012233145679.png)

#### 爬虫功能：抓取数据

![image-20241012234832339](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241012234832339.png)

#### 事件的监听和触发     订阅发布模式

```js
const EventEmitter = require( 'events' )

class MyEventEmitter extends EventEmitter {}

const event = new MyEventEmitter()
event.on('play',(movie)=> {
  console.1og(movie)
})
event.emit('play'，'我和我的祖国')
event.emit('play'，'中国机长')
```

#### fs模块文件操作

```js
const fs = require('fs')
// 创建文件夹
fs.mkdir('./logs',(err)=>{
  console.1og('done.')
})
// 文件夹改名
fs.rename('./logs','./log',()=> {
  console.1og('done')
})
// 删除文件夹
fs.rmdir('./1og',()=>{
  console.1og('done.')
})
//写内容到文件里(有文件重置写入，无文件则创建并写入)
fs.writeFile('./logs/1og1.txt','hello',(err)=>{   // 错误优先的回调函数
  if(err){
    console.log(err.message)
	}
})
//追加写入到文件
fs.appendFile('./logs/1og1.txt','\n hello',(err)=>{   // 错误优先的回调函数
  if(err){
    console.log(err.message)
	}
})
//读文件
fs.readFile('./logs/log1.txt', (err, data)=>{
  if(!err){
    console.log(data.toString('utf-8'))
  }
})
fs.readFile('./logs/log1.txt','utf-8', (err, data)=>{
  if(!err){
    console.log(data)
  }
})
//删文件
fs.unlink('.logs/log1.txt', err=>{
  console.log(err)
})
//读文件夹
fs.readdir('./avatar', (err, data)=>{
  if(!err){
    console.log(data)
  }
})
// 返回一个布尔值，检查文件是否存在
fs.stat('./avatar', (err, data)=>{
  
})
// 读取文件/目录信息
fs.readdir('./', (err, data)=>{
  data.forEach((value, index)=>{
    fs.stat(`./${value}`, (err, stats)=>{
      console.log(value + ' is' + (stats.isDirectory() ? 'directory' : 'file'))
    })
  })
})
```

解决同步异步编程问题 (async)

```js
//同步创建，阻塞后面代码执行
fs.mkdirSync('.avatar')
//一定要进行错误处理
try {
  fs.mkdirSync('.avatar')
} catch(err){
  console.log(err)
}
```

封装一个文件操作方法：删除文件夹及其文件

```js
// 同步读取
fs.readdir('./avatar', (err, data)=>{
  data.forEach(item=>{
    fs.unlinkSync(`./avatar/${item}`)
  })
  
  fs.rmdir('./avatar', (err)=>{
    console.log(err)
  })
})

//promises异步
const fs = require('fs').promises

fs.readdir('./avatar').then(async (data)=>{
  let arr = []
  data.forEach(item=>{
    arr.push(fs.unlink(`./avatar/${item}`))
  })
  
  await Promise.all(arr)
  await fs.rmdir('./avatar')
})

fs.readdir('./avatar').then(async (data)=>{
  await Promise.all(data.map(item=>{fs.unlink(`./avatar/${item}`)}))
  await fs.rmdir('./avatar')
})
```

#### 流(stream)：监听文件流事件    管道(pipe)：

```js
var fs = require('fs')

var rs = fs.createReadStream('sample.txt', 'utf-8')

rs.on('data', (chunk)=>{
  
})

rs.on('end', ()=>{
  
})

rs.on('error', (err)=>{
  
})

const ws = fs.createWriteStream('sample.txt', 'utf-8')

ws.write('')
ws.end()

rs.pipe(ws) //  将ws  pipe到rs    完成文件的复制
```

#### Zlib   压缩

```js
const http = require('http')
const fs = require('fs')
const zlib = require('zlib')

const gzip = zlib.createGzip()

const readstream = fs.createReadStream('./node.txt')
const writestream = fs.createWriteStream('./node2.txt')

readstream
	.pipe(gzip)
	.pipe(writestream)

http.createServer((req, res)=>{
  res.writeHead(200, {
    "Content-Type": "application/x-javascript"; "charset-utf-8",
    "Content-Encoding": "gzip"
  })
}).listen(3000, ()=>{
  
})
```

#### MD5密码加密算法：不可逆只可以单向加密

```js
const crypto = require('crypto')

const hash = crypto.createHash('md5')   // 'sha1'算法

hash.update('Hello World!')

console.log(hash.digest('hex'))

// Hmac算法
const hmac = crypto.createHmac('sha256', 'secret-key')
```

AES  对称加密算法

```js
const crypto = require('crypto')

function encrypt(key, iv, data){
  let decipher = crypto.createCipheriv('aes-128-cbc', key, iv)
  
  return decipher.update(data, 'binary', 'hex') + decipher.final('hex')
}

function decrypt(key, iv, crypted){
  crypted = Buffer.from(crypted, 'hex').toString('binary')
	let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
  return decipher.update(crypted, 'binary', 'utf-8') + decipher.final('utf-8')
}
```

#### 实战：构建路由系统

![image-20241013144920309](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013144920309.png)

基本路由原理

![image-20241013145329399](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013145329399.png)

![image-20241013145456583](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013145456583.png)

![image-20241013150823619](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013150823619.png)

![image-20241013150858946](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013150858946.png)

路由的接口封装   use和server和route模块化

#### 接收参数 --静态资源管理

```js
// 接收参数
function render(res, pathname, type=''){
  res.writeHead(200, {"Content-Type": `${type ? type : 'text/html' };` + 'charset=utf8';})
  res.write(fs.readFileSync(pathname), 'utf-8')
}


// 静态资源管理
function readStaticFile(req, res){
  // 获取路径
  const myURL = new URL(req.url, 'http://127.0.0.1:3000')
  // 引入path模块根据系统拼接文件绝对路径
  const pathname = path.join(__dirname, '/static', myURL.pathname)
  
  if(fs.existsSync(pathname)){
    //使用mime接收数据类型
    render(res, pathname, mime.getType(myURL.pathname.split('.')[1]))  
    return true
  }else{
    return false
  }
}
```

#### 第一个express实例

```js
const express = require('express')

const app = express()

app.get('/', (req, res)=>{
  res.send('hello world')
})

app.listen(3000, ()=>{
  console.log('server start')
})
```

**回调函数数组**  --中间件

```js
app.get('', (req, res, next)=>{
  //作一下前置判断
  next()
}, (req, res)=>{
  res.send()   //成功发送
})
//  控制整一个异步过程的流程
function cb1(){}
function cb2(){}
function cb3(){}
app.get('', [cb1, cb2, cb3])
```

![image-20241013161041106](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013161041106.png)

> Express 是一个完全由路由和中间件构成的web开发框架，从本质上来说，一个Express应用就是在调用各种中间件

中间件是一个函数，它可以访问请求对象，响应对象，和web中处于请求-响应循环流程中的中间件。

它可以：

- 执行任何代码
- 修改请求和响应对象
- 终结请求-响应循环
- 调用堆栈中的下一个中间件

在Express应用中有如下几种中间件：

- 应用级中间件
- 路由级中间件
- 错误处理中间件
- 内置中间件
- 第三方中间件

```js
// 应用级中间件：使用app.use()挂到app
app.use(func) //在语句后使用app实例都要走这个中间件

app.use('/home', func)  

app.use('/', 路由模块)

const express = require('express')

const router = express.Router()
router.get('', func)
//错误信息级中间件
app.use((req, res)=>{
  res.status(404).send()
})
//内置中间件
app.use(express.static('public'))
app.use(express.static('assect'))
```

![image-20241013163007736](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013163007736.png)

第三方中间件

![image-20241013163514951](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013163514951.png)

**怎么拿到request传过来的参数？ **  ---req.query

**拿到参数后的后续？**

```js
// get请求的参数
app.get('', (req, res)=>{
  console.log(req.query)
})

//post的参数处理
app.use(express.urlencoded({extended: false}))  //接收from表单编码数据
app.use(express.json()) // 接收json数据的中间件
app.post('', (req, res)=>{
  console.log(req.body)
  const { username, password } = req.body    //后续
  if(username === 'jiah' && password === '123456'){
    res.send('success')
  }else{
    res.send('fail')
  }
})
```

利用Express托管静态文件

```js
// 传入静态资源目录 public和assect
app.use(express.static('public'))
app.use(express.static('assect'))
```

![image-20241013220200315](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013220200315.png)

#### **服务端渲染(SSR)和客户端渲染(SPA)**

模板引擎 (ejs模板)

1. 服务端渲染，后端嵌套模版，SSR（后端把页面组装）

​	a. 做好静态页面，动态效果。

​	b. 把前端代码提供给后端，后端要把静态html以及里面的假数据给删掉，通过模版进行动态生成	     html的内容

2. 前后端分离，BSR  (在前端中组装页面)

```js
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', (req, res)=>{
  res.render('login')   //找views文件夹下的login.ejs
})
```

![image-20241013223734109](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013223734109.png)

![image-20241013223959005](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013223959005.png)

![image-20241013224512138](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241013224512138.png)

```js
<%- variable%>   //可以被解析
<%# 注释%>
<%- include('./header', {isShow: true})%>
```

```js
// 配置模板引擎
app.set('views', './views')
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile) //支持直接渲染html文件
```

#### **mangoDB数据库**

![image-20241014003439260](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014003439260.png)

![image-20241014004012164](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014004012164.png)

![image-20241014004043287](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014004043287.png)

连接express    实现数据库的增删改查

![image-20241014010425063](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014010425063.png)

![image-20241014010443411](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014010443411.png)

![image-20241014010915390](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014010915390.png)

![image-20241014013143802](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014013143802.png)

![image-20241014013403356](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014013403356.png)

![image-20241014015628058](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014015628058.png)

#### mongoose模块

![image-20241014224629984](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014224629984.png)

![image-20241014224856191](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014224856191.png)

![image-20241014225631928](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014225631928.png)

![image-20241014225901595](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014225901595.png)

![image-20241014230855947](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014230855947.png)

#### RESTful架构

![image-20241014231527295](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014231527295.png)

#### MVC架构

![image-20241014233131216](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241014233131216.png)

![image-20241015020314917](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241015020314917.png)

![image-20241015020328459](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241015020328459.png)

![image-20241015020541888](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241015020541888.png)

#### Cookie&Session

![image-20241015085506933](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241015085506933.png)

```js
// express-session
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')

app = express()
app.use(session({
  name: '',  // 命名空间
  secret: '',  // 服务器生成session的签名
  resave: true,  // 访问自动重新计时
  saveUninitialized: true, // 强制为初始化的session存储
  cookie: { 
    maxAge: 1000 * 60 * 10,   // 过期时间
    secure: false  //https
  },
  rolling: true,  // 为true表示超时前刷新，cookie会重新计时; 反之则按照第一次刷新开始计时
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/kerwin_session',
    ttl: 1000 * 60 * 10
  })
}))

app.use((req, res, next)=>{
  if(req.url.includes('login')){
    next()
    return
  }
  
  if(req.session.user){  //  login请求时候修改session
    req.session.mydate = Date.now()
    next()
  }else{
    res.redirect('/login')
  }
})

router.get('logout', (req, res)=>{
  req.session.destroy(()=>{
    res.send()
  })
})
```

#### JSON  Web  Token

![image-20241015093334584](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241015093334584.png)

Cookie 存储着有效信息，容易被伪造。

![image-20241015093832577](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241015093832577.png)

```js
//jsonwebtoken 封装
const jsonwebtoken = require("jsonwebtoken")
const secret ="kerwin'
const JwT={
	generate(value,exprires){
  	return jsonwebtoken.sign(value,secret,{expiresIn:exprires})
	}，
  verify(token){
    try{
			return jsonwebtoken.verify(token,secret)}catch(e){
        return false
      }
	}
}
module.exports = JWT
```

#### 文件上传

1. formdata

```js
const upload = multer({ dest: 'public/uploads/' })

router.post('.user', upload.single('avatar'), UserController.addUser)
// 在接口中处理请求头发来的图片信息
const avatar = req.file ? `/uploads/${req.file.filename}` : '/images/default.png'
```

#### APIDOC - API文档生成工具

```
npm install -g apidoc
```

apidoc的特征：

1. 跨平台
2. 支持语言广泛，即使不支持，也方便扩展
3. 支持多个不同语言的多个项目生成一份文档
4. 输出模版可自定义
5. 根据文档生成mock数据

使用vscode扩展：apidoc-snippter

```
apidoc -i src/ -o doc/

//  apidoc.json

{
	"name"
	"version"
	"decription"
	"title"
}
```

#### koa框架

初始化

```js
const Koa = require('koa')

const app = new Koa()

app.use((ctx, next)=>{
  ctx.response.body
  ctx.body
  ctx.require.path
})
app.listen(3000)
```

![image-20241015154312563](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241015154312563.png)

对比express

- 不同的异步流程控制   --  callback     VS      async/await

- 不同的中间件模型   -- connect 线性模型      洋葱模型

<img src="https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241015155039945.png" alt="image-20241015155039945" style="zoom:50%; float:left;" />

![image-20241015155223336](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241015155223336.png)

如何理解洋葱模型？ -- 控制权会回溯到中间件上

![image-20241016153921711](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241016153921711.png)

koa的路由模块

```js
// 基本路由配置
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()

router.post('list', (ctx, next)=>{
  
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(3000)
```

配置静态资源

```js
app.use(static(path.join(__dirname, 'public')))
```

获取请求参数

```js
//get参数
ctx.query     ctx.querystring

//post参数
const bodyParser = require('koa-bodyparser')

app.use(bodyParser())
ctx.request.body
```

使用模板引擎

```js
//加载模板引擎
const views = require('koa-view')  //koa模块

app.use(views(path.join(__dirname, './views'), {
  extension: 'ejs'
}))

app.use(async (ctx)=>{
  let title = 'hello koa2'
  await ctx.render('index', {
    title,
  })
})
```

cookie&&session

```js
ctx.cookies.get(name, {options}) //读取上下文请求中的cookie
ctx.cookies.set(name, value, {options})  //在上下文中写入cookie

// session中间件  
const session = require('koa-session-minimal')
app.use(session({
  key:'SESSION_ID',
  cookie: {
    maxAge: 1000 * 60
  }
}))

app.use(async (ctx, next)=>{
  // 排除login相关的路由和接口
  if(ctx.url.includes('login')){
    await next()
    return
  }
  
  if(ctx.session.user){
    //重新设置一下session
    ctx.session.mydate = Date.now()
    await next()
  }else{
    ctx.redirect('/login')
  }
})
```

JWT

```js
// 相关模块引入操作同express
// 前后端分离的相关设置

app.use(async (ctx, next)=>{
  // 排login
  if(ctx.url.includes('login')){
    await next()
    return
  }
  const token = ctx.headers['authorization']?.split(' ')[1]
  if(token){
    const payload = JWT.verify(token)  // 解析token
    if(payload){
      //重新计算token过期时间
      const newToken = JWT.generate({
        _id: payload._id,
        username: payload.username
      }, '10s')
      
      ctx.set("Authorization", newToken)
      await next()
    }else{
      ctx.status = 401
      ctx.body = {errCode:-1,errInfo:'token过期'}
    }
  }else{
    await next()
  }
})
```

文件上传

```js
npm install --save @koa/multer multer

const multer = require('@koa/multer')
const upload = multer({dest: 'public.uploads/'})

router.post('/', upload.single('avatar'), (ctx, next)=>{
  console.log(ctx.request.body, ctx.file)
  ctx.body = {
    ok: 1,
    info: 'success'
  }
})
```

连接到mongoDB

![image-20241016165203307](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241016165203307.png)

#### MySQL

关系型数据库的概念

![image-20241016165539691](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241016165539691.png)

**Sql语句**

![image-20241016170930824](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241016170930824.png)

```sql
//插入
INSERT INTO `students` (`id`, `name`, `score`, `gender`) VALUES (null, 'fool', 100, 1)
// 更新
UPDATE `students` SET `name`='money', `score`=20, `gender`=0 WHERE id=2;
// 删除
DELETE FROM `students` WHERE id=2
//查询
// 查所有数据的所有字段
SELECT * FROM `students` WHERE 1;
//查所有数据的某个字段
SELECT `id`, `name`, `score`, `gender` FROM `students` WHERE 1;
// 条件查询
SELECT * FROM `students` WHERE score>=80;
SELECT * FROM `students` where score>=80 AND gender=1
// 模糊查询
SELECT * FROM `students` where name like '%k%'
//排序
SELECT id, name, gender, score FROM students ORDER BY score;
SELECT id, name, gender, score FROM students ORDER BY score DESC;
// 分页查询
SELECT id, name, gender, score FROM students LIMIT 50 OFFSET 0
// 记录条数
SELECT COUNT(*) FROM students;
SELECT COUNT(*) foolnum FROM students;

// 多表查询
SELECT * FROM students, classes; (这种多表查询又称笛卡尔查询，使用笛卡尔查询时要非常小心，由于结果集是目标表的行数乘积，对两个各有100行记录的表进行笛卡尔查询将返回1万条记录，对两个各有1万行记录的表进行笛卡尔查询将返回1亿条记录)

//  设置别名
SELECT 
	students.id sid,
	students.name,
	classes.id cid,
	classer.name
FROM students, classes; 


//联表查询  
SELECT s.id, s.name, s.class_id, c.name class_name, s.gender, s.score
FROM students s
INNER JOIN classes c
ON s.class_id = c.id;
(连接查询对多个表进行JOIN运算，简单地说，就是先确定一个主表作为结果集，然后，把其他表的行有选择性地“连接”在主表结果集上)
LEFT JOIN 
RIGHT JOIN
FULL JOIN
```

![image-20241016194419131](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241016194419131.png)

使用nodejs 操作数据库

```js
const express = require('express')
const app = express()
const mysql2 = require('mysql2')
const port = 9000

app.get('/', async (req, res)=>{
  const config = getDBconfig()
  const promisePool = mysql2.createPool(config).promise()
  //查
  let user = await promisePool.query('select * from students')
  let user = await promisePool.query('select * from students where name=? and gender=? order by score desc limit 2 offset 0', [name, 100])
  //增
  let user = await promisePool.query('insert into students (name, score, gender, class_id) values (?,?,?,?)',['kerwin', 100, 1, 3])
  //改
  let user = await promisePool.query('update students set name=? ,score=? where id=?', [name,99,9])
  //删
  let user await promisePool.query('delete from students where id=?', [9])
  
  if(user[0].length){
    res.send(user[0])
  }else{
    res.send({
      code: -2,
      msg: 'user not exsit'
    })
  }
})
app.listen(port)

function getDBConfig(){
  return {
    host: '127.0.0.1',
    user: 'root',
    port: 3306,
    password: '',
    database: 'test'
    connectionLimit: 1 //创建一个连接池
  }
}
```

#### websocket 通信方式

应用场景：

- 弹幕
- 媒体聊天
- 协同编辑
- 基于位置的应用
- 体育实况更新
- 实时更新

![image-20241016202559918](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241016202559918.png)

![image-20241016202716142](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241016202716142.png)

​	该响应代码 101表示本次连接的HTTP协议即将被更改，更改后的协议就是upgrade:websocket指定的Websocket协议。
​	版本号和子协议规定了双方能理解的数据格式，以及是否支持压缩等等。如果仅使用WebSocket的API，就不需要关心这些。
​	现在，一个WebSocket连接就建立成功，浏览器和服务器就可以随时主动发送消息给对方。消息有两种，一种是文本，一种是二进制数据。通常，我们可以发送ISON格式的文本，这样，在浏览器处理起来就十分容易。
​	为什么WebSocket连接可以实现全双工通信而HTTP连接不行呢?

​	实际上HTTP协议是建立在TCP协议之上的，TCP协议本身就实现了全双工通信，但是HTTP协议的请求-应答机制限制了全双工通信。Websocket连接建立以后，其实只是简单规定了一下:接下来，咱们通信就不使用HTTP协议了，直接互相发数据吧
​	安全的WebSocket连接机制和HTTPS类似。首先，浏览器用wss://xxx创建WebSocket连接时，会先通过HTTPS创建安全的连接，然后，该HTTPS连接升级为WebSocket连接，底层通信走的仍然是安全的SSL/TLS协议。

Ws模块

服务器：

```js
const webSocket = require('ws')
webSocketServer = WebSocket.WebSocketServer
const wss = new WebSocketServer({port: 8080})
wss.on('connection', function connection(ws, req){  //connection的另一个参数就是req请求体
  ws.on('message', function message(data){
     wss.clients.forEach(function each(client){
    	if(client !== ws && client.readyState === WebSocket.OPEN){
      	client.send(data, {binary: isBinary})
    	}
  })
  })
 
  
  ws.send('欢迎加入聊天室')
})


```

客户端：

```js
const ws = new WebSocket('ws://localhost:8080')

ws.onopen = ()=>{
  
}
ws.onmessage = ()=>{
  
}
ws.onerror = ()=>{
  
}
```

加入JWT鉴权

![image-20241017134403456](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241017134403456.png)

```js
ws.user = payload   //存储用户信息

const types = {
  Error: 0,
  GroupList: 1,
  GroupChat: 2,
  SingleChat: 3
}
case: WebSocketType.SingleChat:
	if(client.user.username === msgObj.to){
    
  }

function createMessage(type, user, data, to){
  return JSON.stringify({
    type,
    user, 
    data,
    to
  })
}
ws.on('close', ()=>{
  wss.clients.delete(es.user)
  sendALl()
})

function sendAll(){
  wss.clients.forEach(function each(client){
    if(client.readyState === WebSocket.OPEN){
      ws.send(createMessage(WebSocket.GroupList, null, 				    											  JSON.stringify(Array.from(wss.clients).map(item=>item.user))))  //set结构作对应的处理
    }
  })
}
//前端对于ws通信
switch(msgObj.type){
  	case WebSocketType.Error:
    	localStorage.removeItem('token')
    	location.href = '/login'
	  	break;  
    case WebSocketType.GroupList:
			console.log(JSON.parse(msgObj.data))
    	const onlineList = JSON.parse(msgObj.data)
      select.innerHTML = ''
    	select.innerHTML = '<option value='all'>all</option>'
        +
        onlineList.map(item=>`<option value=${item.username}>${item.username}</option>`).join('')
    	break;
  	case WebSocketType.GroupChat:
    	var title = msgObj.user ? msgObj.user.username : '广播'
      console.log(title + ' : ' + msgObj.data)
    	break;
	  case WebSocketType.SingleChat:
    	break;
}
```

#### Socket.io模块

文档：https://socket.io/zh-CN/

```js
socket.on(WebSocketType.SingleChat, (msgObj)=>{
  Array.from(io.sockets.sockets).forEach(item=>{
    if(item[1].user.username === msgObj.to){
      item[1].emit(WebSocketType.SingleChat, createMessage(socket.user, msgObj.data))
    }
  })
})

function sendAll(io){
  io.sockets.emit(WebSocketType.GroupList.createMessage(null, Array.from(io.sockets.sockets).map(item=>item[1].user).filter(item=>item)))
}

socket.on('disconnect', ()=>{
  
})
```

#### 单元测试

![image-20241017154855587](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241017154855587.png)
