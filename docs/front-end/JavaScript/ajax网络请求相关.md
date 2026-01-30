# AJAX 网络请求相关

## 关联阅读
- [网络请求学习路径](./网络请求学习路径)
- [fetch / axios 配置与常用写法](./fetch%20axios配置)

## 1. 基本概念
AJAX（Asynchronous JavaScript And XML）指在**不刷新页面**的情况下，通过 JavaScript 与服务器进行数据交换并更新页面内容。

常见术语：
- **request / response**：请求与响应
- **接口 / API / endpoint**：后端提供的可访问地址
- **header / body**：请求头与请求体
- **query / params**：URL 查询参数

## 2. 原生 XHR 基本流程
步骤：
1. 创建 `XMLHttpRequest` 对象
2. `open()` 设置请求方法与 URL
3. `send()` 发送请求
4. 监听 `readystatechange` / `load` / `error`

```javascript
const xhr = new XMLHttpRequest();

xhr.open('GET', '/api/user?id=1', true);

xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    if (xhr.status >= 200 && xhr.status < 300) {
      const data = JSON.parse(xhr.responseText);
      console.log(data);
    } else {
      console.error('请求失败:', xhr.status);
    }
  }
};

xhr.send();
```

### readyState 状态码
- 0：未初始化
- 1：已调用 `open()`
- 2：已收到响应头
- 3：正在下载响应体
- 4：完成

### HTTP 状态码速记
- 2xx：成功（如 200）
- 3xx：重定向（如 304、307）
- 4xx：客户端错误（如 400、401、403、404）
- 5xx：服务端错误（如 500、502、503）

## 3. GET / POST 参数传递
### GET（URL 参数）
```javascript
const params = new URLSearchParams({
  username: 'tom',
  password: '123456'
});

xhr.open('GET', `/api/login?${params.toString()}`);
xhr.send();
```

### POST（表单 / JSON）
**x-www-form-urlencoded**：
```javascript
xhr.open('POST', '/api/login');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

const body = new URLSearchParams({
  username: 'tom',
  password: '123456'
});

xhr.send(body.toString());
```

**application/json**：
```javascript
xhr.open('POST', '/api/login');
xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

xhr.send(JSON.stringify({ username: 'tom', password: '123456' }));
```

## 4. JSON 解析
- 字符串 -> 对象：`JSON.parse()`
- 对象 -> 字符串：`JSON.stringify()`

## 5. 错误处理与超时
```javascript
xhr.timeout = 8000;

xhr.ontimeout = function () {
  console.error('请求超时');
};

xhr.onerror = function () {
  console.error('网络错误');
};
```

注意：
- `onerror` 只代表网络层错误，**HTTP 4xx/5xx 不会触发**
- 需要在 `readyState === 4` 时判断 `status`

## 6. XHR Level2 常用能力
- `timeout` + `ontimeout`：超时控制
- `responseType`：设置响应类型（`json` / `blob` / `arraybuffer`）
- `onprogress`：下载进度
- `xhr.upload.onprogress`：上传进度
- `FormData`：表单与文件上传

```javascript
const form = new FormData();
form.append('avatar', fileInput.files[0]);

xhr.open('POST', '/api/upload');

xhr.upload.onprogress = function (e) {
  if (e.lengthComputable) {
    const percent = Math.round((e.loaded / e.total) * 100);
    console.log('上传进度:', percent + '%');
  }
};

xhr.send(form);
```

## 7. fetch（现代推荐）
`fetch` 基于 Promise，配合 `async/await` 使用更直观。

```javascript
async function getUser() {
  const res = await fetch('/api/user?id=1');
  if (!res.ok) throw new Error(`请求失败: ${res.status}`);
  const data = await res.json();
  return data;
}
```

POST 示例：
```javascript
await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'tom', password: '123456' })
});
```

## 8. axios（工程常用）
axios 基于 Promise，语法简洁，支持拦截器、默认配置等。

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 8000
});

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err)
);

const user = await api.get('/user', { params: { id: 1 } });
```

## 9. 调试与排错（DevTools）
1. 打开浏览器开发者工具（F12）
2. Network 面板 -> 选择 XHR / Fetch
3. 查看 Request Headers / Response Headers / Response
4. 确认：URL、方法、参数、状态码、返回数据

常见问题：
- 404：接口地址不对
- 401/403：鉴权失败（token / cookie）
- 500：服务端异常
- CORS：跨域限制（需后端允许或使用代理）

## 10. 简单封装（Promise 版 XHR）
```javascript
function ajax({ method = 'GET', url, data = {}, headers = {} }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const upper = method.toUpperCase();

    let finalURL = url;
    if (upper === 'GET') {
      const qs = new URLSearchParams(data).toString();
      if (qs) finalURL += (finalURL.includes('?') ? '&' : '?') + qs;
    }

    xhr.open(upper, finalURL, true);

    Object.keys(headers).forEach((k) => {
      xhr.setRequestHeader(k, headers[k]);
    });

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('网络错误'));

    if (upper === 'GET') {
      xhr.send();
    } else {
      xhr.send(JSON.stringify(data));
    }
  });
}
```

---

**建议**：新项目优先使用 `fetch` 或 `axios`；需要兼容低版本浏览器时才使用 XHR。
[[fetch axios配置]]
