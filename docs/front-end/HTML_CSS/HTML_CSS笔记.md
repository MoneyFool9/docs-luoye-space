# HTML CSS

## HTML基础

- 对于标题`<h1> - <h6>`
- 对于段落`<p>`
- 对于链接`<a href>`    在 href 属性中指定链接的地址。
- 对于图像 `img src`     图像的名称和尺寸是以属性的形式提供的。
- 换行符  `<br>`

基本语法

- HTML 元素以**开始标签**起始
- HTML 元素以**结束标签**终止
- **元素的内容**是开始标签与结束标签之间的内容
- 某些 HTML 元素具有**空内容（empty content）**
- 空元素**在开始标签中进行关闭**（以开始标签的结束而结束）
- 大多数 HTML 元素可拥有**属性**
- 没有内容的 HTML 元素被称为空元素。空元素是在开始标签 (在开始标签中添加斜杠，比如 `<br />`，是关闭空元素的正确方法) 中关闭的。
- 在 XHTML、XML 以及未来版本的 HTML 中，所有元素都必须被关闭。

属性

- HTML 元素可以设置**属性**
- 属性可以在元素中添加**附加信息**
- 属性一般描述于**开始标签**
- 属性总是以名称/值对的形式出现，**比如：name="value"**。
- 属性值应该始终被包括在引号内。

文本

- `<hr>`创建一条水平线
- 注释 <!    >
- `<b>`加粗 ` <strong>`   `<i>`斜体   `<em>``  <big>` ` <sub>`` <sup>` ` <ins>` ` <del>`
- `<pre>` 读取空行，空格
- `<code>`计算机输出  `<kbd>`键盘输入  `<tt>`打字机文本  `<samp>`计算机代码样本  `<var>`计算机变量
- `<address>` 地址文本
- `<abbr>` `<acronym>` 显示title
- `<bdo dir="rtl">`该段落文字从右到左显示。`</bdo>`
- 引用`<q>`  `<blockquote>` ` <cite>`  `<dfn>`

超文本链接 `<a> href`

- 一个未访问过的链接显示为蓝色字体并带有下划线。
- 访问过的链接显示为紫色并带有下划线。
- 点击链接时，链接显示为红色并带有下划线。
- `href`：指定链接目标的URL，这是链接的最重要属性。可以是另一个网页的URL、文件的URL或其他资源的URL。
- `target`（可选）：指定链接如何在浏览器中打开。常见的值包括 `_blank`（在新标签或窗口中打开链接）和 `_self`（在当前标签或窗口中打开链接）。
- `title`（可选）：提供链接的额外信息，通常在鼠标悬停在链接上时显示为工具提示。
- `rel`（可选）：指定与链接目标的关系，如 nofollow、noopener 等。
- 锚点

```html
<a href="#section2">跳转到第二部分</a>
<!-- 在页面中的某个位置 -->
<a name="section2"></a>
```

- download下载文档
`<a href="document.pdf" download>下载文档</a>`
- target属性

```html
<a href="https://www.runoob.com/" target="_blank" rel="noopener noreferrer">访问菜鸟教程!</a>
```

- id属性

```
    <a id="tips">有用的</a>
<a href="#tips">访问</a>
```

- <img - border> 边框
- 连接到邮箱

```html
<a [href="mailto:someone@example.com](mailto:href=%22mailto:someone@example.com)?Subject=Hello%20again" target="_top">
发送邮件</a>

<a [href="mailto:someone@example.com](mailto:href=%22mailto:someone@example.com)?cc=someoneelse@example.com&bcc=andsomeoneelse@example.com&subject=Summer%20Party&body=You%20are%20invited%20to%20a%20big%20summer%20party!" target="_top">发送邮件!</a>
</p>
```

头部

- <base> 标签描述了基本的链接地址/链接目标，该标签作为HTML文档中所有的链接标签的默认链接:
- `<link>` 标签定义了文档与外部资源之间的关系。
- `<style>` 标签定义了HTML文档的样式文件引用地址.
- `<meta>` 标签提供了元数据.元数据也不显示在页面上，但会被浏览器解析。
- `<script>` 标签用于加载脚本文件，如： JavaScript。

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled.png)

如何使用CSS

- 内联样式- 在HTML元素中使用"style" **属性**
- 内部样式表 -在HTML文档头部 `<head>` 区域使用`<style>` **元素** 来包含CSS
- 外部引用 - 使用外部 CSS **文件**

**最好的方式是通过外部引用CSS文件**

```html
<head>
<style type="text/css">
body {background-color:yellow;}
p {color:blue;}
</style>
</head>
```

```html
<head>
<link rel="stylesheet" type="text/css" href="mystyle.css">
</head>
```

图像

- src  —source
- Alt属性—-alt 属性用来为图像定义一串预备的可替换的文本。在浏览器无法载入图像时，替换文本属性告诉读者她们失去的信息。
- <map>  <area>  align属性
- style float   浮动

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>菜鸟教程([runoob.com](http://runoob.com/))</title>
</head>
<body><p>点击太阳或其他行星，注意变化：</p>
<img src="planets.gif" width="145" height="126" alt="Planets" usemap="#planetmap">
<map name="planetmap">
<area shape="rect" coords="0,0,82,126" alt="Sun" href="sun.htm">
<area shape="circle" coords="90,58,3" alt="Mercury" href="mercur.htm">
<area shape="circle" coords="124,58,8" alt="Venus" href="venus.htm">
</map></body>
</html>
```

表格Table

- **tr**：tr 是 table row 的缩写，表示表格的一行。
- **td**：td 是 table data 的缩写，表示表格的数据单元格。
- **th**：th 是 table header的缩写，表示表格的表头单元格。
- <caption>

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%201.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%202.png)

**区块**

- 大多数 HTML 元素被定义为**块级元素**或**内联元素**。
- HTML 可以通过 `<div>` 和` <span>`将元素组合起来。
- `<div>` 元素的另一个常见的用途是文档布局
- HTML` <span>` 元素是内联元素，可用作文本的容器
- 当与 CSS 一同使用时，`<span>` 元素可用于为部分文本设置样式属性。

**布局**

- CSS 用于对元素进行定位，或者为页面创建背景以及色彩丰富的外观。
- 使用 CSS 最大的好处是，如果把 CSS 代码存放到外部样式表中，那么站点会更易于维护。通过编辑单一的文件，就可以改变所有页面的布局。
- 定义 span，用来组合文档中的行内元素。

**表单与输入**

> HTML 表单用于收集用户的输入信息。
> 

> HTML 表单表示文档中的一个区域，此区域包含交互控件，将用户收集到的信息发送到 Web 服务器。
> 

> HTML 表单通常包含各种输入字段、复选框、单选按钮、下拉列表等元素。
> 

> 表单元素是允许用户在表单中输入内容，比如：文本域（textarea）、下拉列表（select）、单选框（radio-buttons）、复选框（checkbox） 等等。
> 
- `<form>` 元素用于创建表单，`action` 属性定义了表单数据提交的目标 URL，`method` 属性定义了提交数据的 HTTP 方法（这里使用的是 "post"）。
- `<label>` 元素用于为表单元素添加标签，提高可访问性。
- `<input>` 元素是最常用的表单元素之一，它可以创建文本输入框、密码框、单选按钮、复选框等。`type` 属性定义了输入框的类型，`id` 属性用于关联 `<label>` 元素，`name` 属性用于标识表单字段。
- `<select>` 元素用于创建下拉列表，而 `<option>` 元素用于定义下拉列表中的选项。

以上实例中有一个 **method** 属性，它用于定义表单数据的提交方式，可以是以下值：

- **post**：指的是 HTTP POST 方法，表单数据会包含在表单体内然后发送给服务器，用于提交敏感数据，如用户名与密码等。
- **get**：默认值，指的是 HTTP GET 方法，表单数据会附加在 **action** 属性的 URL 中，并以 **?**作为分隔符，一般用于不敏感信息，如分页等。例如：https://www.runoob.com/?page=1，这里的 page=1 就是 get 方法提交的数据。

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%203.png)

**框架**

```html
<iframe src="demo_iframe.htm" width="200" height="200"></iframe>
```

**颜色**

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%204.png)

**脚本**

JavaScript 使 HTML 页面具有更强的动态和交互性。

- `<script>` 标签用于定义客户端脚本，比如 JavaScript。
- `<script>` 元素既可包含脚本语句，也可通过 src 属性指向外部脚本文件。
- JavaScript 最常用于图片操作、表单验证以及内容动态更新。
- `<noscript>`元素可包含普通 HTML 页面的 body 元素中能够找到的所有元素。

实体字符

![Untitled](HTML%20CSS%204acfd67486b4421db301d8fbd2904309/Untitled%205.png)

URL

- scheme - 定义因特网服务的类型。最常见的类型是 http
- host - 定义域主机（http 的默认主机是 www）
- domain - 定义因特网域名，比如 runoob.com
- :port - 定义主机上的端口号（http 的默认端口号是 80）
- path - 定义服务器上的路径（如果省略，则文档必须位于网站的根目录中）。
- filename - 定义文档/资源的名称

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%206.png)

- URL 编码使用 "%" 其后跟随两位的十六进制数来替换非 ASCII 字符。
- URL 不能包含空格。URL 编码通常使用 + 来替换空格。
- URL 只能使用 [ASCII 字符集](https://www.runoob.com/tags/html-ascii.html).
- XHTML 指的是可扩展超文本标记语言
- XHTML 是更严格更纯净的 HTML 版本
- XHTML 是以 XML 应用的方式定义的 HTML
- `<html>`, `<head>`,` <title>`, 和 `<body>` 元素也必须存在，并且必须使用` <html>` 中的 xmlns 属性为文档规定 xml 命名空间。

## **HTML5中的新特性**

- 用于绘画的 canvas 元素
- 用于媒介回放的 video 和 audio 元素
- 对本地离线存储的更好的支持
- 新的特殊内容元素，比如 article、footer、header、nav、section
- 新的表单控件，比如 calendar、date、time、email、url、search
- video和audio，本地存储  SQL数据，完全支持CSS3，web应用，2D/3D制图
- 缓存引用
- Javascript 工作者
- XHTMLHttpRequest 2

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%207.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%208.png)

1. `<canvas>` 标签定义图形，比如图表和其他图像。该标签基于 JavaScript 的绘图 API

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%209.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2010.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2011.png)

创建一个画布，开始使用JavaScript脚本绘图

首先，找到 `<canvas>` 元素:

> var c=document.getElementById("myCanvas");
> 

然后，创建 context 对象：

> var ctx=c.getContext("2d");
> 

getContext("2d") 对象是内建的 HTML5 对象，拥有多种绘制路径、矩形、圆形、字符以及添加图像的方法。

下面的两行代码绘制一个红色的矩形：

> ctx.fillStyle="#FF0000";
> 

> ctx.fillRect(0,0,150,75);
> 

设置fillStyle属性可以是CSS颜色，渐变，或图案。fillStyle 默认设置是#000000（黑色）。

fillRect(*x,y,width,height*) 方法定义了矩形当前的填充方式。

canvas 是一个二维网格。

canvas 的左上角坐标为 (0,0)

上面的 fillRect 方法拥有参数 (0,0,150,75)。

意思是：在画布上绘制 150x75 的矩形，从左上角开始 (0,0)。

**划线**

- moveTo(*x,y*) 定义线条开始坐标
- lineTo(*x,y*) 定义线条结束坐标

**文本**

- font - 定义字体
- fillText(*text,x,y*) - 在 canvas 上绘制实心的文本
- strokeText(*text,x,y*) - 在 canvas 上绘制空心的文本

`ctx.strokeText("Hello World",10,50);`

**渐变**

- createLinearGradient(*x,y,x1,y1*) - 创建线条渐变
- createRadialGradient(*x,y,r,x1,y1,r1*) - 创建一个径向/圆渐变
- addColorStop()方法指定颜色停止，参数使用坐标来描述，可以是0至1.
- 设置fillStyle或strokeStyle的值为 渐变
- 绘制形状，如矩形，文本，或一条线。使用 createLinearGradient():
- drawImage(*image,x,y*)

## SVG

SVG 定义为可缩放矢量图形。

HTML5 支持内联 SVG。

HTML **`<svg>`** 元素是 SVG 图形的容器。

SVG 有多种绘制路径、框、圆、文本和图形图像的方法。

- SVG 指可伸缩矢量图形 (Scalable Vector Graphics)
- SVG 用于定义用于网络的基于矢量的图形
- SVG 使用 XML 格式定义图形
- SVG 图像在放大或改变尺寸的情况下其图形质量不会有损失
- SVG 是万维网联盟的标准

优势

- SVG 图像可通过文本编辑器来创建和修改
- SVG 图像可被搜索、索引、脚本化或压缩
- SVG 是可伸缩的
- SVG 图像可在任何的分辨率下被高质量地打印
- SVG 可在图像质量不下降的情况下被放大

## SVG 与 Canvas两者间的区别

SVG 是一种使用 XML 描述 2D 图形的语言。

Canvas 通过 JavaScript 来绘制 2D 图形。

SVG 基于 XML，这意味着 SVG DOM 中的每个元素都是可用的。您可以为某个元素附加 JavaScript 事件处理器。

在 SVG 中，每个被绘制的图形均被视为对象。如果 SVG 对象的属性发生变化，那么浏览器能够自动重现图形。

Canvas 是逐像素进行渲染的。在 canvas 中，一旦图形被绘制完成，它就不会继续得到浏览器的关注。如果其位置发生变化，那么整个场景也需要重新绘制，包括任何或许已被图形覆盖的对象。

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2012.png)

**拖放 Drag Drop**

1. 首先，为了使元素可拖动，把 draggable 属性设置为 true ：

`<img draggable="true">`

1. 然后，规定当元素被拖动时，会发生什么。

在上面的例子中，ondragstart 属性调用了一个函数，drag(event)，它规定了被拖动的数据。

dataTransfer.setData() 方法设置被拖数据的数据类型和值：

`function drag(ev){    ev.dataTransfer.setData("Text",ev.target.id);}`

Text 是一个 DOMString 表示要添加到 drag object 的拖动数据的类型。值是可拖动元素的 id ("drag1")。

1. 放到何处 

ondragover 事件规定在何处放置被拖动的数据。

默认地，无法将数据/元素放置到其他元素中。如果需要设置允许放置，我们必须阻止对元素的默认处理方式。

这要通过调用 ondragover 事件的 event.preventDefault() 方法：

`*event*.preventDefault()`

1. 进行放置 ondrop

当放置被拖数据时，会发生 drop 事件。

在上面的例子中，ondrop 属性调用了一个函数，drop(event)：

`function drop(ev){    ev.preventDefault();    var data=ev.dataTransfer.getData("Text");    ev.target.appendChild(document.getElementById(data));}`

代码解释：

- 调用 preventDefault() 来避免浏览器对数据的默认处理（drop 事件的默认行为是以链接形式打开）
- 通过 dataTransfer.getData("Text") 方法获得被拖的数据。该方法将返回在 setData() 方法中设置为相同类型的任何数据。
- 被拖数据是被拖元素的 id ("drag1")
- 把被拖元素追加到放置元素（目标元素）中

**使用地理定位**

请使用 getCurrentPosition() 方法来获得用户的位置。

- 检测是否支持地理定位
- 如果支持，则运行 getCurrentPosition() 方法。如果不支持，则向用户显示一段消息。
- 如果 getCurrentPosition() 运行成功，则向参数showPosition中规定的函数返回一个 coordinates 对象
- showPosition() 函数获得并显示经度和纬度

getCurrentPosition() 方法的第二个参数用于处理错误。它规定当获取用户位置失败时运行的函数：

- Permission denied - 用户不允许地理定位
- Position unavailable - 无法获取当前位置
- Timeout - 操作超时

**在地图中显示结果**

  如需在地图中显示结果，您需要访问可使用经纬度的地图服务，比如谷歌地图或百度地图

给定位置的信息

本页演示的是如何在地图上显示用户的位置。不过，地理定位对于给定位置的信息同样很有用处。

可用于:

- 更新本地信息
- 显示用户周围的兴趣点
- 交互式车载导航系统 (GPS)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2013.png)

## Geolocation 对象 - 其他有趣的方法

watchPosition() - 返回用户的当前位置，并继续返回用户移动时的更新位置（就像汽车上的 GPS）。

clearWatch() - 停止 watchPosition() 方法

下面的例子展示 watchPosition() 方法。您需要一台精确的 GPS 设备来测试该例（比如 iPhone）：

## 媒体播放

` <video> ` 元素提供了 播放、暂停和音量控件来控制视频。


同时 `<video>` 元素也提供了 width 和 height 属性控制视频的尺寸.如果设置的高度和宽度，所需的视频空间会在页面加载时保留。如果没有设置这些属性，浏览器不知道大小的视频，浏览器就不能再加载时保留特定的空间，页面就会根据原始视频的大小而改变。

`<video>` 与`</video>` 标签之间插入的内容是提供给不支持 video 元素的浏览器显示的。

`<video>` 元素支持多个 `<source>` 元素. `<source>` 元素可以链接不同的视频文件。浏览器将使用第一个可识别的格式：


HTML5 `<video>` 和 `<audio>` 元素同样拥有方法、属性和事件。

`<video>` 和 `<audio>`元素的方法、属性和事件可以使用JavaScript进行控制.


其中的方法用于播放、暂停以及加载等。其中的属性（比如时长、音量等）可以被读取或设置。其中的 DOM 事件能够通知您，比方说，`<video>` 元素开始播放、已暂停，已停止，等等。

control 属性供添加播放、暂停和音量控件。

在`<audio>` 与` </audio>` 之间你需要插入浏览器不支持的`<audio>`元素的提示文本 。

`<audio>` 元素允许使用多个 `<source>` 元素. `<source>` 元素可以链接不同的音频文件，浏览器将使用第一个支持的音频文件


## HTML5 新的 Input 类型

HTML5 拥有多个新的表单输入类型。这些新特性提供了更好的输入控制和验证。

本章全面介绍这些新的输入类型：

- color
- date
- datetime
- datetime-local
- email
- month
- number
- range
- search
- tel
- time
- url
- week

**注意:**并不是所有的主流浏览器都支持新的input类型，不过您已经可以在所有主流的浏览器中使用它们了。即使不被支持，仍然可以显示为常规的文本域。

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2014.png)

---

**表单元素**

HTML5 有以下新的表单元素:

- `<datalist>`
- `<keygen>`
- `<output>`

**注意:**不是所有的浏览器都支持HTML5 新的表单元素，但是你可以在使用它们，即使浏览器不支持表单属性，仍然可以显示为常规的表单元素。

`<datalist>` 元素规定输入域的选项列表。

`<datalist>` 属性规定 form 或 input 域应该拥有自动完成功能。当用户在自动完成域中开始输入时，浏览器应该在该域中显示填写的选项：


使用 `<input> `元素的列表属性与` <datalist>` 元素绑定.

`<keygen>` 元素的作用是提供一种验证用户的可靠方法。

`<keygen>`标签规定用于表单的密钥对生成器字段。

当提交表单时，会生成两个键，一个是私钥，一个公钥。

私钥（private key）存储于客户端，公钥（public key）则被发送到服务器。公钥可用于之后验证用户的客户端证书（client certificate）

HTML5 的 `<form>` 和 `<input>`标签添加了几个新属性.

`<form>`新属性：


- autocomplete
- novalidate

`<input>`新属性：

- autocomplete
- autofocus
- form
- formaction
- formenctype
- formmethod
- formnovalidate
- formtarget
- height 与 width
- list
- min 与 max
- multiple
- pattern (regexp)
- placeholder
- required
- step

## `<form>` / `<input>` autocomplete 属性

autocomplete 属性规定 form 或 input 域应该拥有自动完成功能。

当用户在自动完成域中开始输入时，浏览器应该在该域中显示填写的选项。

**提示:** autocomplete 属性有可能在 form元素中是开启的，而在input元素中是关闭的。

**注意:** autocomplete 适用于 `<form>` 标签，以及以下类型的 `<input>` 标签：text, search, url, telephone, email, password, datepickers, range 以及 color。

## `<input>` autofocus 属性

autofocus 属性是一个布尔属性。

autofocus 属性规定在页面加载时，域自动地获得焦点。

# **CSS—层叠样式表**

3.19第一期Q&A

1. CSS是什么？
2. CSS的基本写法？选择器的类型？
3. CSS的在HTML中的三种应用方式？ 
4. 常用的样式属性？border的使用？复合多值-border-style的设置？
5. 样式设置是怎么覆盖的？
6. 选择器的优先级？内联的优先级怎么样？三种选择器的优先级？是不是优先级高的先渲染？
7. 像素？颜色信息？显示单元？ 

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2015.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2016.png)

1. 单位尺寸内放进去的像素数意味着什么？—ppi
2. 什么是物理分辨率？什么是逻辑分辨率？ 对应的虚拟显示单元，什么是打组？
3. 物理分辨率与逻辑分辨率的比意味着什么？—dpr
4. 普通屏与高倍屏的区别？
5. div与span的表现差异？块级元素，行内元素的特征？常用的标签有哪些？ 什么是行内块级元素？

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2017.png)

1. 什么是盒模型？不设置宽高会怎么样？ fit-content属性？
2. 子父级元素如何利用盒模型控制距离？

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2018.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2019.png)

1. 如何对盒模型的border做样式？background-clip

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2020.png)

1. 如何设置 margin和padding？（上右下左）
2. 如何设置content尺寸？box-sizing

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2021.png)

1. 用css中取消标签html和body的默认样式？
2. display属性的作用？block   inline
3. 常用的单位有哪些？绝对单位和相对单位的概念？想对单位有哪些？%相对父元素   em相对父元素  rem 相对于html   视口单位？vh  vw  vmin  vmax
4. 常用色值有哪些？

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2022.png)

1. CSS值的类型有哪些？什么是样式继承  全局值？inherit  initial  unset
2. 文字(TypeFace)的样式怎么设置？什么是衬线体   非衬线体？字重，字足

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2023.png)

1. 关于字体的常用的CSS属性有哪些？font-family  system-ui

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2024.png)

1. 特定字体的设置？—设备上的已安装字体   服务器的远程字体
2. 如何使用在线字体？Google font
3. 如何使用内部字体文件？@font-face{font-family; src; font-display; style; weight} 字体文件格式有哪些？ttf  otf

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2025.png)

## **3.20Q&A**

1. local()先加载本地，在连接服务器，它的作用？
2. font-display的用法？auto optional   常用为swap

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2026.png)

1. 可变字体？(Variable Fonts) 少量中文字体的处理？SVG字体格式  (工具)font-spider
2. 文字如何换行？如何处理文字溢出？white-space([no wrap]  pre pre-wrap)  word-break(break-all)  overflow-wrap(break-word)  text-overflow(ellipsis)
3. 关于文字对齐的设置？text-align(justify)  vertical-align(相对父元素行内空间) top text-top   (div  span  img)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2027.png)

1. 什么是flex布局？怎么使用flex布局？

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2028.png)

1. flex布局中什么是主轴？在主轴的排布方式(分配)？
2. flex布局中什么是交叉轴？行在交叉轴的分配？

## 3.21实战

项目实战（布局）border-radius  capitalize  input::属性

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2029.png)

## 3.22Q&A

1. 什么是响应式布局？min-   max   百分比宽度 —相对单位
2. 边框border-radius是怎么作用于边角的？   附加Border-image  Source  Slice  Width   Repeat
3. 点九切图是什么？应用场景？
4. 背景(background)元素有哪些？绘制区域？精灵图（雪碧图）？position: top 20px;

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2030.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2031.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2032.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2033.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2034.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2035.png)

1. 元素的渐变背景如何设置？什么是径向渐变， 线性渐变，锥形渐变  1turn=360°  deg角度 (degree)，to left  to right

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2036.png)

1. 多层背景？混合模式？bk-blend-mode

(一些小案例)

<渐变边框>—-parent and child——-background-image

```css
.parent{
 padding: 1px;
 border-radius
 background-image: linear-gradient(white, rgba)
}
.child {
 height
 width
 background-color
 border-radius
}

a div picture{
 width: 50% 
 herght
 aspect-ratio:16 / 9;
 background-image: url
 border
 background-size
 background-repeat
}

```

1. 怎么设置元素的投影？设计投影？

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2037.png)

(一些小案例)

```css
body{
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.parent{
  width: 180px;
  height: 180px;
  background-color: rgb(248, 248, 248);
  display: flex;
  justify-content: center;
  align-items: center;
  border: 6px solid white;
  border-radius: 60px;
  box-shadow: 0px 18px 40px rgba(0, 0, 0, 0.1);
}

.child{
  width: 100px;
  height: 100px;
  /* background-color: bisque; */
  background-image: linear-gradient(rgb(255, 226, 8),rgb(255, 149, 2));
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 40px;
  border: 6px solid rgba(255, 255, 255, 0.357);
  background-origin: border-box;
  box-shadow: 0px 10px 40px -6px rgba(255, 166, 0, 0.742);
}
```

1. 元素的蒙版和遮罩？Alpha遮罩？不透明度？ (越黑遮罩越重) (灰度值)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2038.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2039.png)

1. 毛玻璃？滤镜(filter)  backdrop-fliter  invert() 反向

```css
.child{
 width
 height
 border-radius
 background-color
 backdrop-filter: blur(18px);
 border
}
```

1. 什么是浏览器前缀？ `-<webkit>-`transform

(补充)  什么是继承？  outline - input list-style列表样式  ul   ol  dl  `<li>` `<dd  dt>`

1. 伪类选择器？hover  transition 覆盖 (opacity, 0.3s, ease-in-out 2s)delay  (all)  -hover中的元素
2. 布局与定位有哪些point  基础模式(默认，flex, grid )  定位逻辑(position)  层级逻辑(z-index)
3. 定位的元素是什么？ static  relative定完top 1   absolute   fixed   sticky

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2040.png)

1. overflow的用法？-scroll w浮动float? 文档流？-Normal Flow
2. 相对定位？绝对定位？

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2041.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2042.png)

(position: absolution   -flex       justify-content: flex-end)   

1. 绝对定位的所属？对父元素的影响？绝对定位后的所属？(答：会改变元素的所属)
2. 固定定位？粘性定位？fixed sticky

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2043.png)

![Untitled](HTML%20CSS%204acfd67486b4421db301d8fbd2904309/Untitled%2044.png)

（被(直接)父元素直接带走？不脱离文档流。 限制在父元素content区域）

1. 滚动条的设置？—对父元素做scroll效果

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2045.png)

1. 元素的层叠？—z-index  堆叠—把元素放在不同的层

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2046.png)

1. 根 堆叠上下文？z-index中的层级关系？

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2047.png)

## 3.23Q&A

1. 层叠机制代码实操  当中的z-index起到了什么作用？谁是祖先元素？哪个产生了堆叠上下文？

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2048.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2049.png)

1. display的属性对元素内部和外部的影响？eg.flex对内部文档流起作用
2. inline-block      行内-块级   inline-flex   inline-grid    外-内  none  脱离 visibility-hidden 不脱离文档流    contents  
3. flex布局当中的主轴(main axis) 交叉轴(cross axis)在方向上的作用？
4. flex-grow的作用效果？flex-shrink -默认为1  flex中会自动收缩    flex-basis对主轴尺寸起作用
5. 水平垂直居中的多种css样式设置方式？
6. 其他flex属性

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2050.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2051.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2052.png)

1. margin是负值会有什么效果？
2. 什么是grid布局？它的应用场景有哪些？  —网格布局
3. **如何画网格？**
4. **如何把容器中的元素放置到网格中？**
5. **在小格子中的元素如何放置？**
6. **整个网格在容器空间中如何放置？**   -justify-content  align-content

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2053.png)

1. grid布局当中的属性有哪些？如何设置？—-grid-template-columns  rows
2. 一些相关值？  % px rem em vh vw   min-content  max-content  fit-content  —-响应式
3. fr单位的用法？   fraction  单元格   类似于flex-grow
4. auto的用法？上空间挤占   minmax()  范围[100px, 300px]
5. repeat的设置   auto-fill   重复的网格元素  auto-fit
6. 网格盒子的设置  grid-auto-flow   dense 排列-先行后列  会有拉伸效果
7. 单元格上的网格线和网格线编号    grid-column: 2(start) / 4(end)   grid-row
8. 如何自定义网格线名称？
9. 新的选择器   .类 > 元素(选择器)    直接子元素

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2054.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2055.png)

1. grid-template-areas —容器属性  给一个或多个网格设置一个名字 grid-areas  

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2056.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2057.png)

1. 隐形网格的设置？超过放置的网格会自动产生单元格——隐形网格  grid-auto-row   column

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2058.png)

1. 元素与网格的位置设置？   justify-items   align-items  对直接子元素的设置    align-self 垂直方向上的    justify-self水平     place-self
2. 什么是iconfont字体图标？

## 3.24实战：迅雷静态临摹

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2059.png)

### 关于css3的学习

CSS3 被拆分为"模块"。旧规范已拆分成小块，还增加了新的。

一些最重要 CSS3 模块如下：

- 选择器
- 盒模型
- 背景和边框
- 文字特效
- 2D/3D转换
- 动画
- 多列布局
- 用户界面

`border-image:url(border.png) 30 30 round;`

2D转换

transform—-   translate平移   rotate旋转    scale缩放   skew  matrix  

matrix 方法有六个参数，包含旋转，缩放，移动（平移）和倾斜功能。

<重要>**过渡效果  动画**    

指定属性，  指定时间

要创建 CSS3 动画，你需要了解 @keyframes 规则。

@keyframes 规则内指定一个 CSS 样式和动画将逐步从目前的样式更改为新的样式。

```css
@keyframes myfirst
{
    0%   {background: red;}
    25%  {background: yellow;}
    50%  {background: blue;}
    100% {background: green;}
}
```

`animation` 属性用来指定一组或多组动画，每组之间用逗号相隔。

[CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS) **animation** 属性是 [`animation-name`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-name)，[`animation-duration`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-duration), [`animation-timing-function`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-timing-function)，[`animation-delay`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-delay)，[`animation-iteration-count`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-iteration-count)，[`animation-direction`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-direction)，[`animation-fill-mode`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-fill-mode) 和 [`animation-play-state`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation-play-state) 属性的一个简写属性形式。

```css
/* @keyframes duration | easing-function | delay |
iteration-count | direction | fill-mode | play-state | name */
animation: 3s ease-in 1s 2 reverse both paused slidein;
```

多列  column  -count   -gap  -style

resize    box-sizing   outline-offset——响应式

```css
img {
    max-width: 100%;
    height: auto;
}
.button1 {
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
}
 
.button2:hover {
    box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
}
```

```css
.button {
  display: inline-block;
  padding: 15px 25px;
  font-size: 24px;
  cursor: pointer;
  text-align: center;   
  text-decoration: none;
  outline: none;
  color: #fff;
  background-color: #4CAF50;
  border: none;
  border-radius: 15px;
  box-shadow: 0 9px #999;
}

.button:hover {background-color: #3e8e41}

.button:active {
  background-color: #3e8e41;
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}
```

```css
.button {
    position: relative;
    background-color: #4CAF50;
    border: none;
    font-size: 28px;
    color: #FFFFFF;
    padding: 20px;
    width: 200px;
    text-align: center;
    -webkit-transition-duration: 0.4s; /* Safari */
    transition-duration: 0.4s;
    text-decoration: none;
    overflow: hidden;
    cursor: pointer;
}

.button:after {
    content: "";
    background: #90EE90;
    display: block;
    position: absolute;
    padding-top: 300%;
    padding-left: 350%;
    margin-left: -20px!important;
    margin-top: -120%;
    opacity: 0;
    transition: all 0.8s
}

.button:active:after {
    padding: 0;
    margin: 0;
    opacity: 1;
    transition: 0s
}
```

**媒体查询**可用于检测很多事情，例如：

- viewport(视窗) 的宽度与高度
- 设备的宽度与高度
- 朝向 (智能手机横屏，竖屏) 。
- 分辨率

```css
@media screen and (min-width: 480px) {
    #leftsidebar {width:200px;float:left;}
    #main {margin-left:216px;}
}
@media screen and (max-width: 600px) {
  div.example {
    display: none;
  }
}
```

响应式：minmax>fr>auto       空间占用优先级    最大空间和最小空间      为了保证最小空间   网格是可能会超出容器元素的范围的  fr   auto 内部元素的宽或高

  在 CSS 中，**`float`** 是一个用于控制元素浮动的属性。当你设置一个元素的 **`float`** 属性时，它会脱离正常文档流，并且向左或向右浮动到其容器的左边缘或右边缘，直到碰到容器边界或另一个浮动元素为止。

清理浮动的方法？ clear  overflow: hidden

`after{content: ‘ ’; clear: both; overflow: hidden; display: block}`

区别在于选择器的作用范围：**`.nav-list > li`** 选择直接子元素，而**`.nav-list li`** 选择所有后代元素。

文字居中 line-height = height

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2060.png)

keyframes?  —-transform   animation     name    time     mode      infinite      reverse

### 3.25对于响应式布局的深入学习

响应式布局    （自适应网页设计）

"自适应网页设计"的核心，就是CSS3引入的Media Query模块。

自动探测屏幕宽度，然后加载相应的CSS文件。

由于网页会根据屏幕宽度调整布局，所以不能使用绝对宽度的布局，也不能使用具有绝对宽度的元素。这一条非常重要。

具体说，CSS代码不能指定像素宽度

字体也不能使用绝对大小（px），而只能使用相对大小（em）。

除了布局和文本，"自适应网页设计"还必须实现图片的自动缩放。

这只要一行CSS代码：

`img { max-width: 100%;}`

这行代码对于大多数嵌入网页的视频也有效，所以可以写成：

`img, object { max-width: 100%;}`

不过，有条件的话，最好还是根据不同大小的屏幕，加载不同分辨率的图片。有很多方法可以做到这一条，服务器端和客户端都可以实现。

移动优先原则

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2061.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2062.png)

### 3.26小米网站临摹实战

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2063.png)

对于浮动中的溢出该如何处理？

```css
    white-space: nowrap; /**/
    overflow: hidden;  /**/
    text-overflow: ellipsis;  /*文本溢出部分省略号表示*/
```

一段有意思的代码

```css
    width: 0;
    height: 0;
    border-left: 8px solid #fff;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
```

### 3.27对git/github的学习  以及对exercism的临摹

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2064.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2065.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2066.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2067.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2068.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2069.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2070.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2071.png)

![Untitled](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/Untitled%2072.png)

## 【补充内容】

HTML5引入了许多语义化标签，这些标签可以更清晰地描述网页的内容结构，提高可访问性，并对搜索引擎优化(SEO)有所帮助。以下是一些HTML5语义化标签的示例：

1. `<header>`：表示页面或者页面的一部分的页眉。通常包含站点的标题、导航栏或者其他一些引导性的内容。
2. `<nav>`：表示导航链接的部分，通常包含站点内或站点之间的链接。
3. `<main>`：表示文档的主要内容。一个文档中应该只有一个`<main>`标签，用来包含除页眉、页脚和导航之外的主要内容。
4. `<article>`：表示页面中独立的内容，如博客帖子、新闻文章等。通常包含自己的标题和内容。
5. `<section>`：表示文档中的一个部分或者一个章节，通常包含相关的内容组。
6. `<aside>`：表示页面的附属内容，通常出现在页面的侧边栏或者其他位置。通常包含与主要内容相关的辅助性信息，如侧边栏、广告、相关链接等。
7. `<footer>`：表示页面或页面的一部分的页脚。通常包含版权信息、联系方式、相关链接等内容。
8. `<figure>` 和 `<figcaption>`：`<figure>` 用于包含和引用图片、图表、照片等内容，而 `<figcaption>` 用于为 `<figure>` 元素提供标题。

这些标签不仅能够更清晰地描述页面的结构，也有助于辅助技术（如屏幕阅读器）更好地理解网页内容，提高网站的可访问性。

这些标签在页面布局中通常用于定义不同的区块，例如页眉、导航、主要内容、文章、侧边栏、页脚等。它们的块级特性使得它们适合用于划分页面结构。

HTML5语义化标签的设计目的是提高网页的可读性、可访问性和搜索引擎优化。例如，使用**`<header>`**、**`<nav>`**和**`<footer>`**等标签可以帮助搜索引擎更好地理解页面的结构，提高网页在搜索结果中的排名。此外，这些标签也有助于屏幕阅读器等辅助技术更好地理解页面内容，提高网页的可访问性。

`em` 和 `rem` 是用于定义字体大小的单位，它们在 CSS 中的使用有一些不同之处：

1. **em**：`em` 单位是相对于父元素的字体大小来计算的。例如，如果一个元素的字体大小为 `1em`，它将与其父元素的字体大小相同。如果父元素的字体大小是 `16px`，那么 `1em` 就等于 `16px`。如果元素的字体大小是 `0.5em`，那么它将是父元素字体大小的一半。
   
    ```css
    .parent {
        font-size: 16px;
    }
    
    .child {
        font-size: 0.5em; /* 0.5倍的父元素的字体大小，即 8px */
    }
    
    ```
    
2. **rem**：`rem` 单位是相对于根元素（即 `<html>` 元素）的字体大小来计算的。默认情况下，根元素的字体大小为浏览器的默认字体大小，通常是 `16px`。因此，`1rem` 就等于根元素的字体大小。
   
    ```css
    html {
        font-size: 16px;
    }
    
    .child {
        font-size: 2rem; /* 2倍的根元素的字体大小，即 32px */
    }
    
    ```
    

**理解 em 和 rem 的区别**：

- `em` 是相对于父元素的字体大小来计算的，因此如果父元素的字体大小发生变化，所有子元素的字体大小也会相应地变化。
- `rem` 是相对于根元素的字体大小来计算的，因此它不受父元素字体大小的影响，只受根元素字体大小的影响。

通常来说，建议使用 `rem` 单位来定义字体大小，因为它更具灵活性，而且可以更方便地控制整个页面的字体大小。但在某些情况下，如果需要相对于父元素的字体大小进行计算，那么 `em` 单位也是有用的。

