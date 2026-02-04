# React 表单处理

> 基础篇第 5 章：掌握 React 中的表单处理技巧。

返回 [[React学习路线]] | 上一章 [[React-04-路由与导航]] | 下一章 [[React-06-样式方案]]

---

## 一、受控组件

### 1.1 基本用法

```jsx
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 1.2 统一状态管理

```jsx
function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <textarea name="message" value={formData.message} onChange={handleChange} />
    </form>
  );
}
```

---

## 二、不同表单元素

### 2.1 各类型输入

```jsx
function AllInputTypes() {
  const [form, setForm] = useState({
    text: '',
    password: '',
    number: 0,
    checkbox: false,
    radio: 'option1',
    select: '',
    multiSelect: [],
    textarea: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <form>
      {/* 文本输入 */}
      <input type="text" name="text" value={form.text} onChange={handleChange} />

      {/* 密码 */}
      <input type="password" name="password" value={form.password} onChange={handleChange} />

      {/* 数字 */}
      <input type="number" name="number" value={form.number} onChange={handleChange} />

      {/* 复选框 */}
      <input type="checkbox" name="checkbox" checked={form.checkbox} onChange={handleChange} />

      {/* 单选框 */}
      <input type="radio" name="radio" value="option1" checked={form.radio === 'option1'} onChange={handleChange} />
      <input type="radio" name="radio" value="option2" checked={form.radio === 'option2'} onChange={handleChange} />

      {/* 下拉选择 */}
      <select name="select" value={form.select} onChange={handleChange}>
        <option value="">Select...</option>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </select>

      {/* 多行文本 */}
      <textarea name="textarea" value={form.textarea} onChange={handleChange} />
    </form>
  );
}
```

### 2.2 多选复选框

```jsx
function MultiCheckbox() {
  const [selected, setSelected] = useState([]);
  const options = ['React', 'Vue', 'Angular'];

  const handleChange = (option) => {
    setSelected(prev => 
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div>
      {options.map(option => (
        <label key={option}>
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => handleChange(option)}
          />
          {option}
        </label>
      ))}
    </div>
  );
}
```

---

## 三、表单验证

### 3.1 基础验证

```jsx
function FormWithValidation() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // 提交表单
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={errors.email ? 'error' : ''}
      />
      {errors.email && <span className="error-message">{errors.email}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 3.2 自定义 Hook

```jsx
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    if (validate) {
      setErrors(validate(values));
    }
  };

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    const validationErrors = validate ? validate(values) : {};
    setErrors(validationErrors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  };

  return { values, errors, touched, handleChange, handleBlur, handleSubmit };
}

// 使用
function LoginForm() {
  const validate = (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Required';
    if (!values.password) errors.password = 'Required';
    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { email: '', password: '' },
    validate
  );

  return (
    <form onSubmit={handleSubmit((values) => console.log(values))}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.email && errors.email && <span>{errors.email}</span>}
      {/* ... */}
    </form>
  );
}
```

---

## 四、表单库推荐

### 4.1 React Hook Form

```jsx
import { useForm } from 'react-hook-form';

function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { 
        required: 'Email is required',
        pattern: {
          value: /\S+@\S+\.\S+/,
          message: 'Invalid email'
        }
      })} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password', { 
        required: 'Password is required',
        minLength: {
          value: 6,
          message: 'Min 6 characters'
        }
      })} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### 4.2 表单库对比

| 库 | 特点 | 适用场景 |
|---|------|----------|
| React Hook Form | 性能好、体积小 | 推荐首选 |
| Formik | 功能全面 | 复杂表单 |
| 原生实现 | 完全控制 | 简单表单 |

---

## 五、本章小结

| 模式 | 适用场景 |
|------|----------|
| 受控组件 | 需要实时验证、联动 |
| 非受控组件 | 简单场景、文件上传 |
| 表单库 | 复杂表单、验证逻辑多 |

### 下一步

- [[React-06-样式方案]] - 学习样式处理方案

---

#React #表单 #验证 #ReactHookForm
