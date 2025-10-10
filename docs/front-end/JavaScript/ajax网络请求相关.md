# 对于网络请求ajax的思考

-> 编写ajax程序，发送带有参数的http请求

-> 解析返回的json数据，处理DOM CSS渲染页面

一个异步请求request

首先通过js获取用户输入信息，创建ajax对象，让他去请求服务器，服务器接受请求，服务器处理请求，服务器响应数据返回给客户端ajax对象回调函数，客户端利用js去渲染响应的数据

原生ajax的请求步骤

1. 创建XMLHttpRequest对象
2. 准备发送 open()

open(‘请求方式get/post’, ’url地址’, boolean-true异步)

3. 发送请求 send()
4. 监听函数 —监听ajax各个状态，回调函数—返回数据

状态码：readyState  — 判断状态改变 0 1 2 3 4 

new-0  open- 1  send -1  fun-  接受 2 处理 3  响应 4

发送服务器请求  request  response

xhr.status  http协议知否请求成功

2xx   表示成功   200

3xx   重定向    304 页面存在  307  jd.com —>www.jd.com

4xx   资源不存在  404

5xx   服务器错误  500  505 

ajax报错  排错步骤

1. console  控制台
2. network  网络请求  all  xhr —ajax请求内容  online —网络模式
3. 打开xhr文件目录
4. 点开请求文件
5. 查看请求头Request Headers  响应头Response Headerss  响应体 Response 

ajax请求传递参数

xhr.open(‘get’, url, ture);

var url = ’06ajax_get.php?username =’ +uname+ ‘&password’ +mima

var data = ‘username = ${uname} & password = ${mima}’

xhr.setRequestHeader (“Content-type”, “application/x-www-form-urlencoded; charset = utf-8”)

xhr.send(data);

如何解析json数据？

字符串 -> 对象

JSON.parse ();  循环拼接字符串

使用ajax请求数据时，被请求的url地址就叫做接口

接口测试步骤

1. 选择请求的方式
2. 填写请求的URL地址
3. 填写请求的参数 / 选择body面板并勾选数据格式
4. （选择要向服务器发送的数据）
5. 点击Send按钮发起请求
6. 查看服务器响应的结果

接口文档：接口名称 接口URL 调用方式 参数格式  输出内容（响应格式）  返回实例

POST方式请求接口

form表单数据提交  一些常用的属性以及操作

表单的同步提交： submit后的行为

监听表单的提交事件 

get列表table数据  th  tb  

URL编码 encodeURL  decodeURL

XHR Level2 

1. timeout属性 传数值ms  ontimeout 可添加回调函数
2. FormData 
3. 上传文件 验证是否选择文件  向FormData中追加文件
4. 显示进度   渲染进度条

xhr.upload.onprogress 获取上传速度

var xhr = new XMLHttpRequest ();

xhr.open();

xhr.send();

 

xhr.onreadystatechange = function() {

   if(xhr.readyState == 4){

​      if (xhr.status == 200){  //http 协议状态 200成功 404找不到资源

​        console.log (xhr.responseText);

​      }

   }

}

封装ajax请求函数  

1. 传data对象参数
2. 处理data参数转化为查询字符串（封装resolveData）
3. 判断请求的类型 

```javascript
function resolveData (data) {

  var arr = []

  for (var k in data) {

​     var str = k + ‘=’ +data[k]

​     arr.push (str)

  }

}

return  arr.join (‘&’)

function ajax (options) {

  var xhr = new XMLHttpRequest ();

  var qs = resolveData (options.data)

  

  if(options.method.toUpperCase() == ‘GET’){

​    xhr.open(options.method, options.url + ‘?’ + qs)

​    xhr.send ()

  }else if (options.method.toUpperCase() == ‘POST’){

​     xhr.open (options.method, options.url)

​     xhr.setRequestHeader(‘Content-type’, ‘qpplication/x-ww-form-urlencoded’)

​     xhr.send(qs)

   }

  xhr.onreadystatechange = function() {

   if(xhr.readyState == 4 && xhr.status ==200){

​      var result = JSON.parse (xhr.responseText)

​      options.success(result)

   }

}
```

axios  一个库  专注于网络数据请求

Async await  (promise封装)