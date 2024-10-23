# 第一个uniapp应用

![image-20241018174649316](/Users/apple/Library/Application Support/typora-user-images/image-20241018174649316.png)

## uniapp语法入门

### 1.1【uniapp应用的文件构成】

[项目目录结构详解【官网】](https://uniapp.dcloud.net.cn/tutorial/project.html)

```
┌─uniCloud              云空间目录，支付宝小程序云为uniCloud-alipay，阿里云为uniCloud-aliyun，腾讯云为uniCloud-tcb（详见uniCloud）
│─components            符合vue组件规范的uni-app组件目录
│  └─comp-a.vue         可复用的a组件
├─utssdk                存放uts文件
├─pages                 业务页面文件存放的目录
│  ├─index
│  │  └─index.vue       index页面
│  └─list
│     └─list.vue        list页面
├─static                存放应用引用的本地静态资源（如图片、视频等）的目录，注意：静态资源都应存放于此目录
├─uni_modules           存放uni_module 
├─platforms             存放各平台专用页面的目录
├─nativeplugins         App原生语言插件 
├─nativeResources       App端原生资源目录
│  ├─android            Android原生资源目录 
|  └─ios                iOS原生资源目录 
├─hybrid                App端存放本地html文件的目录
├─wxcomponents          存放小程序组件的目录
├─unpackage             非工程代码，一般存放运行或发行的编译结果
├─main.js               Vue初始化入口文件
├─App.vue               应用配置，用来配置App全局样式以及监听 应用生命周期
├─pages.json            配置页面路由、导航条、选项卡等页面类信息
├─manifest.json         配置应用名称、appid、logo、版本等打包信息
├─AndroidManifest.xml   Android原生应用清单文件 
├─Info.plist            iOS原生应用配置文件 
└─uni.scss              内置的常用样式变量
```

### 1.2【新建一个uniapp页面】

<img src="https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241018175236805.png" alt="image-20241018175236805" style="zoom: 33%;float:left;" />

#### I -配置自定义模板

点击左下角的`自定义模板` 

![image-20241021164127302](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241021164127302.png)

#### II -页面生命周期



#### III -页面配置文件

### 1.3【基本内置组件】

> 在uniapp中，提供了丰富的基本内置组件来进行页面布局，主要对移动端开发的事件适配做了更好的修改

#### I -视图容器组件 `view` 和 `text` 

##### ①对比与HTML标签`div` 和`p`

- 都是用于包裹元素内容的
- view  和 text 带有一些特有的属性，因为它是二次封装的组件

##### ② 常用的属性

- `hover-stop-propagation` 指定是否阻止本节点的祖先节点出现点击态
- `selectable`  `user-select` text文本是否可选
-  `space`  text文本是否连续空格

##### ③注意

- 如果使用 `<span>` 组件编译时会被转换为 `<text>`
- 如果使用`<div>`编译时会被转换为 `<view>`

#### II -可滚动视图区域组件 `scroll-view` 

> 定义一个可滚动的区域

##### ① 代码示例

```html
<view>
				<scroll-view 
           :scroll-top="scrollTop" 
           scroll-y="true" 
           class="scroll-Y" 		
           @scrolltoupper="upper"
           @scrolltolower="lower" 
           @scroll="scroll"
				>
					<view id="demo1" class="scroll-view-item uni-bg-red">A</view>
					<view id="demo2" class="scroll-view-item uni-bg-green">B</view>
					<view id="demo3" class="scroll-view-item uni-bg-blue">C</view>
				</scroll-view>
</view>
```

##### ②常用属性和事件

- `scroll-x` 和 `scroll-y`定义滚动方式
- `show-scrollbar` 控制是否出现滚动条
- `@scroll` 每一次滚动时就会触发 
- `@scrolltoupper` 和`@scrolltolower` 分别触发滚动到头部和底部，配合属性 `scroll-top` 和 `scroll-left`

##### ③自定义下拉刷新和webview相关

#### III -滑块视图容器组件 `swiper`

> 一般用于左右滑动或上下滑动，比如banner轮播图。
>
> 注意滑动切换和滚动的区别，滑动切换是一屏一屏的切换。swiper下的每个swiper-item是一个滑动切换区域，不能停留在2个滑动区域之间。

##### ①代码示例

```html
<view class="uni-margin-wrap">
			<swiper 
          class="swiper" 
          circular 
          :indicator-dots="indicatorDots" 
          :autoplay="autoplay" 
          :interval="interval"
          :duration="duration"
       >
				<swiper-item>
					<view class="swiper-item uni-bg-red">A</view>
				</swiper-item>
				<swiper-item>
					<view class="swiper-item uni-bg-green">B</view>
				</swiper-item>
				<swiper-item>
					<view class="swiper-item uni-bg-blue">C</view>
				</swiper-item>
			</swiper>
		</view>
```

##### ②常用的属性和事件

- `indicator-dots` 显示面板指示点， `indicator-color` 和 `indicator-active-color` 定义指示点样式
- `autoplay` 滑块自动切换
- `current` 绑定当前滑块的index
- `circular` 启用无缝滑动
- `vertical` 定义滑动方向为纵向
- `internal` 自动切换间隔时间
- `@change`  current 改变时会触发 change 事件
- `@transition`  `@animationfinish`

#### IV -媒体组件 `image` 

> 区别于 `img` ，具备更多的属性和事件用于完成更多业务

##### ①属性 `mode` 说明

> mode 有 14 种模式，其中 5 种是缩放模式，9 种是裁剪模式。

如下：

<img src="https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241021190017189.png" alt="image-20241021190017189" style="zoom: 25%; float: left;" />

<img src="https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241021190123001.png" alt="image-20241021190123001" style="zoom: 33%; float: left;" />

<img src="https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241021190221336.png" alt="image-20241021190221336" style="zoom:33%;float:left" />

##### ②常用属性事件说明

-  懒加载   `lazy-load`  只针对page与scroll-view下的image有效
- `fade-show`   图片显示动画效果
- `draggable` 是否能拖动图片

#### V -路由组件 `navigator` 

> 该组件类似HTML中的`<a>`组件，但只能跳转本地页面。目标页面必须在pages.json中注册。

##### ①常用的属性事件

- `url` `open-type` 
- `target` 小程序之间的跳转![image-20241021191026568](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241021191026568.png)



##### ②注意

- 跳转tabbar页面，必须设置open-type="switchTab"或者reLaunch
- url有长度限制，太长的字符串会传递失败

#### VI -表单组件 `button` 和 `input`

> button 就是一个组件可以有更多的属性和事件回调，功能强大
>
> input针对移动端可以定义软键盘的按钮等等，同样功能强大

##### ①常用的属性和时间

`button`

- `size` `type`  `disabled` `plain` `loading`
- 更多配合复杂业务的回调

`input`

1. 属性 `inputmode`

![image-20241021192319259](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241021192319259.png)

2. 属性 `confirm-type`  设置键盘右下角按钮的文字，仅在 type="text" 时生效。

![image-20241021192411485](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241021192411485.png)

3. 属性 `type`

![image-20241021192533939](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241021192533939.png)

4. 事件说明

`@input`  `@focus`  `@blur`  `@confirm`

##### ②注意

- 

### 1.4【uniapp全局配置文件和API调用】



## uniapp中的Vue3基础

### 2.1【响应式基础】

>在Vue中，有着强大的响应式系统，实现了数据的动态更新和局部更新，我们可以利用响应式数据解决很多问题

#### I - `ref` 和`reactive`定义响应式数据

##### `ref`

- 可定义基本数据类型和复杂数据类型
- 使用`.value` 访问，但是在模板内可以自动解包

##### `reactive`

- 只可以定义复杂数据类型
- 定义的响应式对象可以自动解包
- 因为定义响应式对象其实是一个proxy，所以对解构操作不友好

### 2.2【Vue指令(directive)】

#### I -`v-bind` 绑定动态JavaScript语句

主要用于绑定Dom元素的类和样式，见以下几种情况

1. 在组件开发中
2. 绑定动态类名
3. 绑定处理样式

```html
<div :class="{ active: isActive }"></div>   /* 此时类active取决于isActive的真假值 */

<div :class="classObject"></div>  /* 使用一个计算属性动态渲染该DOM的样式 */
<script>
const isActive = ref(true)
const error = ref(null)

const classObject = computed(() => ({
  active: isActive.value && !error.value,
  'text-danger': error.value && error.value.type === 'fatal'
}))
</script>

<div :class="[activeClass, errorClass]"></div> /* 使用数组可以渲染多个class */
<div :class="[isActive ? activeClass : '', errorClass]"></div>
```

#### II -`v-if` 实现条件渲染

##### ①代码示例实现

```html
<button @click="awesome = !awesome">Toggle</button>

<h1 v-if="awesome">Vue is awesome!</h1>  /* 当awesome为真值时，显示 */
<h1 v-else>Oh no 😢</h1>   /* 当点击Toggle按钮，awesome取反，该DOM显示 */

<div v-if="type === 'A'">
  A
</div>
<div v-else-if="type === 'B'">
  B
</div>
<div v-else-if="type === 'C'">
  C
</div>
<div v-else>
  Not A/B/C
</div>

<template v-if="ok">
  <h1>Title</h1>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</template>
```

使用 `v-else-if` 和`v-else` 可以定义一个多条件的区域渲染，根据不同的条件渲染DOM节点

如果我们想要切换不止一个元素呢？在这种情况下我们可以在一个 `<template>` 元素上使用 `v-if`，这只是一个不可见的包装器元素，最后渲染的结果并不会包含这个 `<template>` 元素。

##### ②对比 `v-show` 有何差异

不同之处在于 `v-show` 会在 DOM 渲染中保留该元素；`v-show` 仅切换了该元素上名为 `display` 的 CSS 属性。

`v-show` 不支持在 `<template>` 元素上使用，也不能和 `v-else` 搭配使用。

#### III -`v-for` 实现列表渲染

> 我们可以使用 `v-for` 指令基于一个数组来渲染一个列表

##### ①代码示例

```html
<li v-for="(item, index) in items">
  {{ parentMessage }} - {{ index }} - {{ item.message }}    /* 渲染遍历数组的元素和索引 */
</li>
<script>
const parentMessage = ref('Parent')
const items = ref([{ message: 'Foo' }, { message: 'Bar' }])
</script>

<li v-for="{ message } in items">
  {{ message }}
</li>

<!-- 有 index 索引时 -->
<li v-for="({ message }, index) in items">   /* 可以使用解构来简化对象操作 */
  {{ message }} {{ index }}
</li>

<li v-for="item in items">
  <span v-for="childItem in item.children">   /* 多次v-for嵌套各级可访问到父级作用域 */
    {{ item.message }} {{ childItem }}
  </span>
</li>

<ul>
  <template v-for="item in items">  /* 同理，我们可以使用template来渲染多个同级DOM */
    <li>{{ item.msg }}</li>
    <li class="divider" role="presentation"></li>
  </template>
</ul>

<MyComponent                         /* 在组件里面使用v-for，需要传递props */
  v-for="(item, index) in items"
  :item="item"
  :index="index"
  :key="item.id"
/>
```

##### ②注意事项

如果 `v-if` 和`v-for` 要同时使用，则需要使用`template` 来做渲染：

```html
<template v-for="todo in todos">
  <li v-if="!todo.isComplete">
    {{ todo.name }}
  </li>
</template>
```

在使用`v-for` 实现列表渲染时，我们可以通过绑定一个key来管理状态

为了给 Vue 一个提示，以便它可以跟踪每个节点的标识，从而重用和重新排序现有的元素，你需要为每个元素对应的块提供一个唯一的 `key` attribute

推荐在任何可行的时候为 `v-for` 提供一个 `key` attribute

```html
<div v-for="item in items" :key="item.id">
  <!-- 内容 -->
</div>

<template v-for="todo in todos" :key="todo.name">
  <li>{{ todo.name }}</li>
</template>
```

有时，我们希望显示数组经过过滤或排序后的内容，而不实际变更或重置原始数据。在这种情况下，你可以创建返回已过滤或已排序数组的计算属性。

```vue
<script>
const numbers = ref([1, 2, 3, 4, 5])

const evenNumbers = computed(() => {
  return numbers.value.filter((n) => n % 2 === 0)
})
</script>
<li v-for="n in evenNumbers">{{ n }}</li>

<script> 
const sets = ref([
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10]
])

function even(numbers) {
  return numbers.filter((number) => number % 2 === 0)
}
</script>
<ul v-for="numbers in sets">
  <li v-for="n in even(numbers)">{{ n }}</li>
</ul>
```

#### IV -`v-on` 绑定事件处理函数

##### ①代码示例

```vue
/* 内联事件处理器 */
<button @click="count++">Add 1</button>
<p>Count is: {{ count }}</p>

/* 方法事件处理器 */
<script>
const name = ref('Vue.js')

function greet(event) {
  alert(`Hello ${name.value}!`)
  // `event` 是 DOM 原生事件
  if (event) {
    alert(event.target.tagName)
  }
}
</script>
<!-- `greet` 是上面定义过的方法名 -->
<button @click="greet">Greet</button>


<script>
function warn(message, event) {
  // 这里可以访问原生事件
  if (event) {
    event.preventDefault()
  }
  alert(message)
}
</script>
<!-- 使用特殊的 $event 变量 -->
<button @click="warn('Form cannot be submitted yet.', $event)">
  Submit
</button>

<!-- 使用内联箭头函数 -->
<button @click="(event) => warn('Form cannot be submitted yet.', event)">
  Submit
</button>
```

方法事件处理器会自动接收原生 DOM 事件并触发执行。在上面的例子中，我们能够通过被触发事件的 `event.target` 访问到该 DOM 元素。

Vue 为 `v-on` 提供了**事件修饰符**。修饰符是用 `.` 表示的指令后缀

```vue
<!-- 单击事件将停止传递 -->
<a @click.stop="doThis"></a>

<!-- 提交事件将不再重新加载页面 -->
<form @submit.prevent="onSubmit"></form>

<!-- 修饰语可以使用链式书写 -->
<a @click.stop.prevent="doThat"></a>

<!-- 也可以只有修饰符 -->
<form @submit.prevent></form>

<!-- 仅当 event.target 是元素本身时才会触发事件处理器 -->
<!-- 例如：事件处理器不来自子元素 -->
<div @click.self="doThat">...</div>

<!-- 添加事件监听器时，使用 `capture` 捕获模式 -->
<!-- 例如：指向内部元素的事件，在被内部元素处理前，先被外部处理 -->
<div @click.capture="doThis">...</div>

<!-- 点击事件最多被触发一次 -->
<a @click.once="doThis"></a>

<!-- 滚动事件的默认行为 (scrolling) 将立即发生而非等待 `onScroll` 完成 -->
<!-- 以防其中包含 `event.preventDefault()` -->
<div @scroll.passive="onScroll">...</div>

<!-- 仅在 `key` 为 `Enter` 时调用 `submit` -->
<input @keyup.enter="submit" />
```

##### ②注意事项

在使用事件修饰符时，注意调用的前后顺序。

#### V -`v-model` 实现表单双向绑定

##### ①代码示例

```vue
/* 文本类型的input或textarea会绑定value值并且监听input事件 */
<p>Message is: {{ message }}</p>
<input v-model="message" placeholder="edit me" />

/* 复选框checkbox，单选框radio 会绑定checked是一个布尔值并监听change事件 */
<div>Checked names: {{ checkedNames }}</div>

<input type="checkbox" id="jack" value="Jack" v-model="checkedNames" />
<label for="jack">Jack</label>

<input type="checkbox" id="john" value="John" v-model="checkedNames" />
<label for="john">John</label>

<input type="checkbox" id="mike" value="Mike" v-model="checkedNames" />
<label for="mike">Mike</label>

/* 选择器select会绑定value并监听change事件 */
<script>
const selected = ref('A')

const options = ref([
  { text: 'One', value: 'A' },
  { text: 'Two', value: 'B' },
  { text: 'Three', value: 'C' }
])
</script>
<select v-model="selected">
  <option v-for="option in options" :value="option.value">
    {{ option.text }}
  </option>
</select>

<div>Selected: {{ selected }}</div>
```

##### ②注意事项

默认情况下，`v-model` 会在每次 `input` 事件后更新数据，可以添加 `lazy` 修饰符来改为在每次 `change` 事件后更新数据

`number` 修饰符，`.trim` 修饰符可以对绑定的数据做一个初步处理

对于v-model的实现原理：

```html
<input
  :value="text"
  @input="event => text = event.target.value">
```

监听input事件，并返回更新后的value值。

### 2.3【计算属性和监听器】

##### `computed`

>  我们可以使用**计算属性**来描述依赖响应式状态的复杂逻辑

```vue
<p>Has published books:</p>
<span>{{ author.books.length > 0 ? 'Yes' : 'No' }}</span>
<span>{{ publishedBooksMessage }}</span>

/* 对于以上逻辑，我们可以定义一个计算属性来处理 */
<script setup>
import { reactive, computed } from 'vue'

const author = reactive({
  name: 'John Doe',
  books: [
    'Vue 2 - Advanced Guide',
    'Vue 3 - Basic Guide',
    'Vue 4 - The Mystery'
  ]
})

// 一个计算属性 ref
const publishedBooksMessage = computed(() => {
  return author.books.length > 0 ? 'Yes' : 'No'
}) 
</script>
```

相较于使用一个方法处理这个逻辑，使用computed：

**计算属性值会基于其响应式依赖被缓存**。一个计算属性仅会在其响应式依赖更新时才重新计算。这意味着只要 `author.books` 不改变，无论多少次访问 `publishedBooksMessage` 都会立即返回先前的计算结果，而不用重复执行 getter 函数。

##### `watched` 和 `watchedEffect`

> 计算属性允许我们声明性地计算衍生值。然而在有些情况下，我们需要在状态变化时执行一些“副作用”：例如更改 DOM，或是根据异步操作的结果去修改另一处的状态。

```vue
<script setup>
import { ref, watch } from 'vue'

const question = ref('')
const answer = ref('Questions usually contain a question mark. ;-)')
const loading = ref(false)

// 可以直接侦听一个 ref
watch(question, async (newQuestion, oldQuestion) => {
  if (newQuestion.includes('?')) {
    loading.value = true
    answer.value = 'Thinking...'
    try {
      const res = await fetch('https://yesno.wtf/api')
      answer.value = (await res.json()).answer
    } catch (error) {
      answer.value = 'Error! Could not reach the API. ' + error
    } finally {
      loading.value = false
    }
  }
})
</script>

<template>
  <p>
    Ask a yes/no question:
    <input v-model="question" :disabled="loading" />
  </p>
  <p>{{ answer }}</p>
</template>
```

注意，我们不能直接侦听响应式对象的属性值。需要用一个返回该属性的 getter 函数：

```js
// 提供一个 getter 函数
watch(
  () => obj.count,
  (count) => {
    console.log(`Count is: ${count}`)
  }
```

##### `watch` vs. `watchEffect`

`watch` 和 `watchEffect` 都能响应式地执行有副作用的回调。它们之间的主要区别是追踪响应式依赖的方式：

- `watch` 只追踪明确侦听的数据源。它不会追踪任何在回调中访问到的东西。另外，仅在数据源确实改变时才会触发回调。`watch` 会避免在发生副作用时追踪依赖，因此，我们能更加精确地控制回调函数的触发时机。
- `watchEffect`，则会在副作用发生期间追踪依赖。它会在同步执行过程中，自动追踪所有能访问到的响应式属性。这更方便，而且代码往往更简洁，但有时其响应性依赖关系会不那么明确。

### 2.4【组件和组件通信】

#### I -组件注册

##### ①全局注册组件

```js
import MyComponent from './App.vue'

app.component('MyComponent', MyComponent)

app
  .component('ComponentA', ComponentA)
  .component('ComponentB', ComponentB)
  .component('ComponentC', ComponentC)

<!-- 这在当前应用的任意组件中都可用 -->
<ComponentA/>
<ComponentB/>
<ComponentC/>
```



##### ②使用setup语法糖局部组件无需注册 

```vue
<script setup>
import ComponentA from './ComponentA.vue'
</script>

<template>
  <ComponentA />
</template>
```

#### II -传递props来实现组件通信

##### ①传递props的步骤

1. 在组件中使用`defineProps` API声明props变量作为出口
2. 在父组件复用组件时绑定attribute定义对应的props

##### ②props的声明方式和注意事项

```js
/* 使用字符串数组 */
const props = defineProps(['foo'])
/* 使用对象声明类型 */
defineProps({
  title: String,
  likes: Number
})
/* props校验 */
defineProps({
  propA: {
    type: [String, null],
    required: true
  },
  // Number 类型的默认值
  propB: {
    type: Number,
    default: 100
  },
  // 对象类型的默认值
  propC: {
    type: Object,
    // 对象或数组的默认值
    // 必须从一个工厂函数返回。
    // 该函数接收组件所接收到的原始 prop 作为参数。
    default(rawProps) {
      return { message: 'hello' }
    }
  },
})
```

#### III -定义emit监听和使用子组件数据

> 在子组件定义的数据变量如何在父组件访问操作呢？这个时候我们可以定义一个emit来实现双向通信

##### ①定义emit的步骤

1. 在组件中使用`defineEmits` API 声明emit事件作为出口
2. 在父组件使用 `v-on`绑定自定义事件
3. 在事件方法中传递事件对象来取到子组件数据
4. 使用`$emit()` 来触发自定义事件

```vue
<template>
<button @click="$emit('submit')">
  
  </button>
</template>
<script setup>
const emit = defineEmits(['inFocus', 'submit'])

function buttonClick() {
  emit('submit')
}
</script>
```

##### ②使用emit的注意事项

#### IV -定义组件的出入口 -slot插槽

##### ①在组件当中使用插槽

`<slot>` 元素是一个**插槽出口** (slot outlet)，标示了父元素提供的**插槽内容** (slot content) 将在哪里被渲染。

![image-20241023173536868](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241023173536868.png)



##### ②具名插槽和插槽作用域

`<slot>` 元素可以有一个特殊的 attribute `name`，用来给各个插槽分配唯一的 ID，使用`<template v-slot:name>`以确定每一处要渲染的内容：

![image-20241023173822893](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241023173822893.png)

```vue
<template>
  <div class="card">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    
    <div v-if="$slots.default" class="card-content">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

作用域插槽：往插槽传props，使用v-slot指令接收一个props对象

![image-20241023174448139](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241023174448139.png)

#### V -使用 `defineExpose` 暴露组件当中的属性和方法

1. 在组件中调用传入一个对象包含要向外暴露的属性和方法
2. 在父组件中使用`ref` attribute获得当前组件的实例

```vue
/* 父组件 */
<template>
 <Child :ref="ChildRef"/>
</template>
<script>
import Child from 'Child.vue'
import { ref,onMounted } from 'vue'
  
const ChildRef = ref(null)

onMounted(()=>{
  console.log(ChildRef.value)
})
</script>
/* 子组件 */
<template>
	<p>
    我是儿子
  </p>
</template>
<script>
import { ref } from 'vue'
  
const toy = ref('奥特曼')

function getChildToy(container){
  container = toy.value
}
  
defineExpose({
  toy,
  getChildToy
})
</script>
```

### 2.5【依赖注入和异步组件】

> 使用场景：
>
> 通常情况下，当我们需要从父组件向子组件传递数据时，会使用 props。想象一下这样的结构：有一些多层级嵌套的组件，形成了一棵巨大的组件树，而某个深层的子组件需要一个较远的祖先组件中的部分数据。在这种情况下，如果仅使用 props 则必须将其沿着组件链逐级传递下去，这会非常麻烦![image-20241023121555342](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241023121555342.png)
>
> `provide` 和 `inject` 可以帮助我们解决这一问题 。一个父组件相对于其所有的后代组件，会作为**依赖提供者**。任何后代的组件树，无论层级有多深，都可以**注入**由父组件提供给整条链路的依赖。![image-20241023121623443](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241023121623443.png)





### 2.6【生命周期钩子】

![image-20241023100217134](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241023100217134.png)

对比

![image-20241023100258483](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20241023100258483.png)