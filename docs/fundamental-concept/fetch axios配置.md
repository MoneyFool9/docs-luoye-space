# fetch / axios 配置与常用写法

## 关联阅读
- [网络请求学习路径](./网络请求学习路径)
- [AJAX 网络请求相关](./ajax网络请求相关)

> 目标：统一请求入口、默认配置、错误处理、鉴权头、超时与取消。

## 1. fetch 基础与统一封装
`fetch` 只有**网络层错误**才会 reject，HTTP 4xx/5xx 需要手动判断 `res.ok`。

```javascript
const defaultHeaders = {
  'Content-Type': 'application/json'
};

async function request(url, {
  method = 'GET',
  headers = {},
  body,
  signal,
  credentials = 'include' // 需要 cookie 时
} = {}) {
  const res = await fetch(url, {
    method,
    headers: { ...defaultHeaders, ...headers },
    body,
    signal,
    credentials
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${text}`);
  }

  // 根据需要选择 json / text / blob
  return res.json();
}
```

### GET / POST 示例
```javascript
// GET
request('/api/user?id=1');

// POST JSON
request('/api/login', {
  method: 'POST',
  body: JSON.stringify({ username: 'tom', password: '123456' })
});
```

### 超时与取消
```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 8000);

request('/api/user', { signal: controller.signal })
  .finally(() => clearTimeout(timeout));
```

### 常用配置点
- `headers`：统一 token / content-type
- `credentials`：是否携带 cookie
- `signal`：取消请求
- `cache` / `mode` / `redirect`：按需设置

## 2. axios 基础配置
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// 请求拦截：加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：统一返回 / 错误处理
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.message;
    return Promise.reject(new Error(`HTTP ${status || 'NETWORK'} ${msg}`));
  }
);
```

### GET / POST 示例
```javascript
api.get('/user', { params: { id: 1 } });

api.post('/login', {
  username: 'tom',
  password: '123456'
});
```

## 3. axios 进阶配置
### 自定义 params 序列化
```javascript
import qs from 'qs';

const api = axios.create({
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' })
});
```

### 取消请求（AbortController）
```javascript
const controller = new AbortController();

api.get('/user', { signal: controller.signal });

// 需要取消时
controller.abort();
```

### 上传文件与进度
```javascript
const form = new FormData();
form.append('file', fileInput.files[0]);

api.post('/upload', form, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: (e) => {
    if (e.total) {
      const percent = Math.round((e.loaded / e.total) * 100);
      console.log('上传进度', percent + '%');
    }
  }
});
```

## 4. 常见问题
- **fetch 不会自动 reject 4xx/5xx**：需要手动判断 `res.ok`
- **axios 默认带 JSON**：`Content-Type` 需匹配实际请求体
- **跨域**：需要后端 CORS 或前端代理
- **401/403**：token 失效，重登或刷新 token

---

建议：
- 小型项目：`fetch` + 轻量封装
- 中大型项目：`axios` + 拦截器 + 统一错误处理
