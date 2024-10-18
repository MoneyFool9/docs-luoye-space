# 原生JS 进阶

## 1.封装动画函数

```js
//动画函数封装

//setInterval (func, delay)

//offsetLeft

function animate (obj, target){

	var timer = setInterval (function () {

		if(obj.offsetLeft >= target){

			clearInterval(timer);

		}

		obj.style.left = obj.offsetLeft +1 + ‘px’;

	},    30);

}

function animate (obj, target){

	obj.timer = setInterval (function () {

		if(obj.offsetLeft >= target){

			clearInterval(obj.timer);

		}

	obj.style.left = obj.offsetLeft +1 + ‘px’;

	},    30);

}

//缓动

var step = (target-obj.offsetLeft) / 10;

function animate (obj, target){

	obj.timer = setInterval (function () {

			if(obj.offsetLeft >= target){

				clearInterval(obj.timer);

			}

	obj.style.left = obj.offsetLeft +step+ ‘px’;

	},    30);

}

var step = Math.ceil((target-obj.offsetLeft) / 10);

var step = (target-obj.offsetLeft) / 10;

step = step > 0 ? Math.ceil(step) : Math.floor (step);

//回调函数

function animate (obj, target, callback){

	obj.timer = setInterval (function () {

			var step = (target-obj.offsetLeft) / 10;

			step = step > 0 ? Math.ceil(step) : Math.floor (step);

			if(obj.offsetLeft >= target){

					clearInterval(obj.timer);

					if(callback) {

							callback();

					}

			}

	obj.style.left = obj.offsetLeft +step+ ‘px’;

	},    30);

}
```

## 2.瀑布流写法

```js
window.addEventListener('DOMContentLoaded', () => {  // 监听DOM加载出来后执行
    ; (function (doc) { //立即执行函数，传document对象
        var oItems = doc.getElementsByClassName('J_bookItem'),  //拿到所有Item的数组
            oItemsLen = oItems.length,
            _arr = [];

        var init = function () {
            setImgPos();  //在init入口函数执行
        }

        function setImgPos() {   // 封装瀑布流函数
            var item;

            for (var i = 0; i < oItemsLen; i++) {
                item = oItems[i];
                item.style.width = '187px';  //wrap --width /2 - gap

                if (i < 2) {
                    _arr.push(item.offsetHeight);
                    item.style.top = '0';

                    if ((i + 1) % 2 === 1) {
                        item.style.left = '0';
                    } else {
                        item.style.left = i * (187 + 10) + 'px';
                    }
                } else {
                    minIdx = getMinIdx(_arr);
                    item.style.left = oItems[minIdx].offsetLeft + 'px';
                    item.style.top = (_arr[minIdx] + 10) + 'px';
                    _arr[minIdx] += (item.offsetHeight + 10);
                }
            }
        }

        function getMinIdx(arr) {
            return [].indexOf.call(arr, Math.min.apply(null, arr));
        }

        init();

    })(document);
})
```

## 3.防抖节流函数

```js
function throttle(fn, delay) {
    var t = null,
        begin = new Date().getTime();

    return function () {
        var _self = this,
            args = arguments,
            cur = new Date().getTime();

        clearTimeout(t);

        if (cur - begin >= delay) {
            fn.apply(_self, args);
            begin = cur;
        } else {
            t = setTimeout(function () {
                fn.apply(_self, args);
            }, delay);
        }
    }
}
function debounce(fn, delay) {
    var timer = null;
    return function () {
        var _self = this,
            args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            fn.apply(_self, args);
        }, delay);
    }
}
```

## 4.时间格式化函数

```JS
function getDateTime(ts, type) {

    var dt = new Date(ts),
        y = dt.getFullYear(),
        m = addZero(dt.getMonth() + 1),
        d = addZero(dt.getDate()),
        h = addZero(dt.getHours()),
        i = addZero(dt.getMinutes()),
        s = addZero(dt.getSeconds());

    switch (type) {
        case 'date':
            return y + '-' + m + '-' + d;
            break;
        case 'time':
            return h + ':' + i + ':' + s;
            break;
        case 'dateTime':
            return y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;
            break;
        default:
            return y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;
    }

    function addZero(num) {
        return num < 10 ? ('0' + num) : num;
    }
}
```

## 5.触底判断

```js
function scrollToBottom(callback) {
    if (Math.ceil(getScrollTop()) + Math.ceil(getWindowHeight()) === Math.ceil(getScrollHeight())) {
        callback();
    }
}

/****** 内部函数 ******/
function getScrollTop() {
    var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
    if (document.body) {
        bodyScrollTop = document.body.scrollTop;
    }
    if (document.documentElement) {
        documentScrollTop = document.documentElement.scrollTop;
    }
    scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
    return scrollTop;
}

function getScrollHeight() {
    var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
    if (document.body) {
        bodyScrollHeight = document.body.scrollHeight;
    }
    if (document.documentElement) {
        documentScrollHeight = document.documentElement.scrollHeight;
    }
    scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
    return scrollHeight;
}

function getWindowHeight() {
    var windowHeight = 0;
    if (document.compatMode == "CSS1Compat") {
        windowHeight = document.documentElement.clientHeight;
    } else {
        windowHeight = document.body.clientHeight;
    }
    return windowHeight;
}

```





## 【其他】

```js
function trimSpace(str) {
    return str.replace(/\s+/gim, '');
}

function getUrlQueryValue(key) {
    const reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i');
    const res = window.location.search.substring(1).match(reg);

    return res !== null ? decodeURIComponent(res[2]) : null;
}
```

