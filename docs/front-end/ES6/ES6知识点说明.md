# ES6 知识点说明文档

> 本文档基于 ES6 知识图谱整理，系统梳理 ECMAScript 2015 核心特性与用法。

---

## 1. let、const、全局变量与顶层对象

- **let**：块级作用域变量声明，不存在变量提升，同一作用域内不可重复声明。
- **const**：声明只读常量，声明后不可重新赋值；对于引用类型，引用不可改，内部属性可改。
- **全局变量**：在全局作用域声明的变量会挂载到顶层对象（浏览器为 `window`，Node 为 `global`）。
- **顶层对象**：ES2020 引入 `globalThis`，用于统一获取全局对象。

---

## 2. 块级作用域与暂时性死区

- **块级作用域**：`{}` 内形成独立作用域，`let`、`const` 声明的变量仅在该块内有效。
- **暂时性死区（TDZ）**：在声明语句之前访问 `let`/`const` 变量会报错，从块开始到声明语句之间的区域称为 TDZ。
- **块级作用域嵌套**：内层块可访问外层块变量，外层无法访问内层，形成清晰的作用域链。

---

## 3. 解构赋值与函数默认值

- **解构赋值**：从数组或对象中按模式提取值并赋给变量。
- **函数默认值**：形参可设默认值，如 `function fn(a = 1, b = 2)`。
- **数组解构**：`const [a, b, ...rest] = [1, 2, 3, 4]`，支持默认值和剩余项。
- **对象解构**：`const { a, b } = obj`，支持重命名、默认值、嵌套解构。

---

## 4. 隐式转换、参数解构与解构本质

- **隐式类型转换**：解构时会发生 ToObject 等转换，需注意 `null`、`undefined` 解构会报错。
- **函数参数的解构**：可直接在形参处写解构，如 `function fn({ x, y })`。
- **解构的本质**：基于迭代器/可迭代协议（数组）或属性访问（对象），不是新语法魔法。
- **圆括号 `()` 的用法**：在解构中，若左侧为变量声明，右侧为表达式时，整个解构需用 `()` 包裹，避免被解析为块。

---

## 5. 箭头函数

- **实质**：无自己的 `this`、`arguments`、不能作构造函数，无 `prototype`，`this` 继承自定义时的外层作用域。
- **使用场景**：回调函数、需要固定 `this` 的场景（如定时器、数组方法）；不适合需要动态 `this` 或作为构造函数的方法。

---

## 6. this 指向、箭头函数形式与 rest 运算符

- **this 指向总结**：普通函数中 `this` 由调用方式决定；箭头函数中 `this` 由定义时外层决定；可通过 `call`/`apply`/`bind` 显式指定。
- **箭头函数基本形式**：`(params) => expression` 或 `(params) => { statements }`，单参数可省略括号，单表达式可省略 `return`。
- **rest 运算符（剩余参数）**：`function fn(a, ...args)`，`args` 为剩余实参组成的数组，可替代 `arguments`。

---

## 7. 函数名扩展与对象扩展

- **函数名的扩展**：方法可写为 `method() {}` 简写；支持计算属性名作为方法名。
- **对象的扩展**：属性简写 `{ x, y }`、方法简写、计算属性名 `[expr]`。
- **属性描述符**：`Object.getOwnPropertyDescriptor`、`defineProperty` 中的 `configurable`、`enumerable`、`writable`、`value` 等。
- **getter 与 setter**：通过 `get`/`set` 定义访问器属性，在读取/写入时执行逻辑。

---

## 8. 对象密封与 assign、取值拷贝

- **对象密封的 4 种方式**：
  - `Object.preventExtensions(obj)`：禁止添加新属性
  - `Object.seal(obj)`：不可添加、删除属性，现有属性不可重新配置
  - `Object.freeze(obj)`：不可增删改属性，且属性不可写
  - 配套的 `Object.isExtensible`、`Object.isSealed`、`Object.isFrozen`
- **Object.assign**：浅拷贝可枚举自有属性到目标对象，常用于合并对象或浅拷贝。
- **取值函数的拷贝**：`assign` 只拷贝 getter 的返回值（即执行 getter 得到的数据），不会拷贝 getter 函数本身。

---

## 9. super、遍历方式与 Symbol 遍历

- **super**：在子类方法中指向父类原型或父类构造函数，用于调用父类方法或 `super()` 调用父类构造。
- **4 种遍历方式**：`for...in`（键）、`Object.keys`、`Object.getOwnPropertyNames`、`Object.getOwnPropertySymbols` 等，区别在于是否包含原型、是否包含 Symbol、是否包含不可枚举。
- **原型**：理解 `__proto__`、`prototype` 与继承链。
- **Symbol 遍历**：以 Symbol 为键的属性默认不被 `for...in`、`Object.keys` 枚举，需用 `Object.getOwnPropertySymbols` 或 `Reflect.ownKeys`。

---

## 10. Symbol、Iterator、for...of 与 TypedArray

- **Symbol 接口属性**：如 `Symbol.iterator`、`Symbol.toStringTag` 等，用于定义对象在语言层面的行为。
- **Iterator（迭代器）**：实现 `next()` 返回 `{ value, done }` 的对象，供 `for...of` 等消费。
- **for...of**：遍历可迭代对象（有 `Symbol.iterator` 的对象），如数组、Map、Set、部分 DOM 集合。
- **对象的迭代接口部署**：为对象添加 `[Symbol.iterator]` 方法即可被 `for...of` 遍历。
- **TypedArray**：`Int8Array`、`Uint8Array`、`Float32Array` 等类型化数组，用于二进制数据与高性能计算。

---

## 11. 数组的扩展

- **Array.of()**：根据参数创建数组，`Array.of(1,2,3)` 为 `[1,2,3]`，解决 `Array(3)` 与 `Array(1,2,3)` 行为不一致问题。
- **Array.from()**：将类数组或可迭代对象转为数组，可传映射函数和 this。
- **数组新增方法**：`find`、`findIndex`、`includes`、`fill`、`copyWithin` 等。
- **数组的遍历**：`forEach`、`map`、`filter`、`reduce` 以及 `for...of`。
- **数值的拓展**：如 `Number.isFinite`、`Number.isNaN`、`Number.isInteger`、`Math` 新增方法等。

---

## 12. 正则的扩展

- **正则构造函数的变化**：`RegExp` 可接受第二个参数（修饰符），且对已有正则复制时能正确拷贝修饰符。
- **正则方法的调整**：`match`、`replace`、`split` 等与 `RegExp` 的配合行为在 ES6 中更统一。
- **新增修饰符 u、s**：`u` 支持 Unicode 正确匹配；`s`（dotAll）使 `.` 匹配换行。
- **UTF-16 编码方式**：`u` 修饰符下对码点与代理对的正确处理。

---

## 13. 字符串的扩展

- **Unicode 表示法**：`\u{1F4A9}` 等大括号形式表示码点。
- **码点相关 API**：`codePointAt`、`String.fromCodePoint`，正确处理辅助平面字符。
- **字符串新增方法**：`includes`、`startsWith`、`endsWith`、`repeat`、`padStart`、`padEnd` 等。
- **模板字符串**：反引号 `` ` `` 支持换行与 `${expression}` 插值。
- **标签模板**：`tag`Hello ${name}` 会调用 `tag(strings, ...values)`，可用于 DSL、国际化、安全转义等。

---

## 14. Map 与 Set

- **Map**：键值对集合，键可为任意类型；有序；提供 `get`、`set`、`has`、`delete`、`clear`、`size` 及迭代方法。
- **Set**：唯一值集合，自动去重；有序；提供 `add`、`has`、`delete`、`clear`、`size` 及迭代方法。

---

## 15. WeakMap、WeakSet 与 Proxy、Reflect

- **WeakMap**：键仅能为对象，键被 GC 回收后条目自动移除，不可遍历，常用于存储与对象绑定的元数据。
- **WeakSet**：仅能存放对象引用，同样弱引用、不可遍历，适合存对象集合且不阻止 GC。
- **Proxy**：对对象进行代理，可拦截读取、赋值、枚举、函数调用等操作，实现响应式、校验、隐藏属性等。
- **Reflect**：提供与 Proxy 陷阱一一对应的反射方法，便于在代理中转发默认行为并统一返回值（如成功返回布尔）。

---

## 16. 类（Class）

- **类的定义**：`class Name { }`，内部可定义构造函数 `constructor` 和实例方法。
- **类的继承**：`class B extends A { }`，子类中通过 `super` 调用父类构造或方法。
- **类的实现**：类本质是构造函数与原型的语法糖，继承基于原型链。
- **类的修饰**：可指装饰器（Decorator）对类或类成员进行元编程，或访问修饰符等（在 TypeScript 中常见）。

---

## 17. Promise 与 promisify

- **Promise 的使用**：`new Promise((resolve, reject) => { })`，链式调用 `then`/`catch`/`finally`，或使用 `Promise.all`、`Promise.race`、`Promise.allSettled` 等。
- **自定义 promisify**：将遵循“回调最后一个参数为 (err, data)”风格的函数封装成返回 Promise 的函数，Node 中可用 `util.promisify`。

---

## 18. Iterator 与 Generator

- **Iterator**：迭代器协议（`next()` 返回 `{ value, done }`），使对象可被 `for...of`、展开运算符等消费。
- **Generator**：`function* gen()` 定义生成器，`yield` 暂停并返回值，`next()` 恢复执行，用于惰性序列、异步流程控制等。

---

## 19. async/await 与 Module

- **async/await**：`async` 函数返回 Promise，`await` 在 Promise 完成前暂停函数执行，语法上以同步方式写异步逻辑。
- **Module**：ES Module 使用 `import`/`export`，静态分析、 Tree Shaking，替代 CommonJS 等模块方案。

---

## 20. JS 引擎逻辑

- 涉及事件循环、调用栈、任务队列（宏任务/微任务）、垃圾回收、JIT 编译等底层机制，是理解异步与性能的基础。

---

## 参考

- 知识图谱来源：es6 相关.md 中的图片
- 视频参考：[blibili 小野森森 - ES6 相关](https://www.bilibili.com/video/BV1pU4y177NA/)
