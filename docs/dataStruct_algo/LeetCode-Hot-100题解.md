# LeetCode Hot 100 题解 (JavaScript)

> LeetCode 热题 100 是最经典的面试算法题集合，涵盖数组、链表、树、动态规划等核心知识点。

---

## 目录

- [[#一、哈希表]]
- [[#二、双指针]]
- [[#三、滑动窗口]]
- [[#四、子串]]
- [[#五、普通数组]]
- [[#六、矩阵]]
- [[#七、链表]]
- [[#八、二叉树]]
- [[#九、图论]]
- [[#十、回溯]]
- [[#十一、二分查找]]
- [[#十二、栈]]
- [[#十三、堆]]
- [[#十四、贪心]]
- [[#十五、动态规划]]
- [[#十六、多维动态规划]]
- [[#十七、技巧]]

---

## 一、哈希表

### 1. 两数之和 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/two-sum/)

给定一个整数数组 `nums` 和一个目标值 `target`，找出和为目标值的两个数的下标。

**💡 思路**：用哈希表存储已遍历的数及其索引，对于每个数查找 `target - num` 是否存在。

```javascript
function twoSum(nums, target) {
  const map = new Map();                    // 存「值 → 下标」，便于 O(1) 查找
  for (let i = 0; i < nums.length; i++) {   // 遍历每个数
    const complement = target - nums[i];    // 当前数需要的「另一半」
    if (map.has(complement)) {              // 若之前已见过 complement
      return [map.get(complement), i];      // 直接返回两下标
    }
    map.set(nums[i], i);                    // 否则记录当前数及其下标
  }
  return [];                                // 无解
}
```

**💡 思路**：使用双指针需要先保存原数组索引

```javascript
function twoSum(nums, target) {
	const indexed = nums.map((val, idx) => ({val, idx}));
	
	indexed.sort((a, b) => a.val - b.val);
	
	let left = 0, right = indexed.length - 1;
	while(left < right) {
		const sum = indexed[left].val + indexed[right].val;
		
		if(sum === target) {
			return [indexed[left].idx, indexed[right].idx];
		} else if(sum < target) {
			left ++;
		} else {
			right--;
		}
	}
	return []
}
```

**复杂度**：时间 O(n)，空间 O(n)

---

### 49. 字母异位词分组 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/group-anagrams/)

给定一个字符串数组，将字母异位词组合在一起。

**💡 思路**：将每个字符串排序后作为 key，相同 key 的字符串归为一组。

```javascript
function groupAnagrams(strs) {
  const map = new Map();                    // key: 排序后的串, value: 原串数组
  for (const str of strs) {
    const key = [...str].sort().join('');   // 异位词排序后必相同，作为 key
    if (!map.has(key)) {
      map.set(key, []);                     // 该 key 首次出现，建空数组
    }
    map.get(key).push(str);                 // 当前串归入该组
  }
  return [...map.values()];                 // 返回所有分组（每组是字符串数组）
}
```

**复杂度**：时间 O(n * k * log k)，空间 O(n * k)

---

### 128. 最长连续序列 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/longest-consecutive-sequence/)

给定一个未排序的整数数组，找出最长连续序列的长度。

**💡 思路**：用 Set 去重，只从序列起点（num-1 不存在）开始向后计数，避免重复计算。

```javascript
function longestConsecutive(nums) {
  const set = new Set(nums);                // 去重 + O(1) 查找
  let maxLength = 0;
  for (const num of set) {
    if (!set.has(num - 1)) {               // 只从「序列起点」开始数，避免重复算
      let currentNum = num;
      let currentLength = 1;
      while (set.has(currentNum + 1)) {    // 往后连续能走多远
        currentNum++;
        currentLength++;
      }
      maxLength = Math.max(maxLength, currentLength);
    }
  }
  return maxLength;
}
```

**复杂度**：时间 O(n)，空间 O(n)

---

## 二、双指针

### 283. 移动零 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/move-zeroes/)

将所有 0 移动到数组末尾，保持非零元素的相对顺序。

**💡 思路**：快慢指针，快指针遍历数组，遇到非零就与慢指针交换，慢指针前进。

```javascript
function moveZeroes(nums) {
  let slow = 0;                            // 非零区末尾，即下一个可放非零的下标
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {                // 遇到非零就往前挪到 slow 位置
      [nums[slow], nums[fast]] = [nums[fast], nums[slow]];
      slow++;                              // 非零区右扩一位
    }
  }
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 11. 盛最多水的容器 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/container-with-most-water/)

给定 n 个非负整数，找出能容纳最多水的两条线。

**💡 思路**：双指针从两端向中间收缩，每次移动较短的那条线，因为移动较长的不可能得到更大面积。

```javascript
function maxArea(height) {
  let left = 0, right = height.length - 1;  // 两端指针
  let maxWater = 0;
  while (left < right) {
    const water = Math.min(height[left], height[right]) * (right - left);
    maxWater = Math.max(maxWater, water);   // 更新当前最大面积
    if (height[left] < height[right]) {     // 移动短边才可能让面积变大
      left++;
    } else {
      right--;
    }
  }
  return maxWater;
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 15. 三数之和 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/3sum/)

找出所有和为 0 的三元组。

**💡 思路**：排序后固定一个数，用双指针在其右侧找两数之和等于其相反数，注意跳过重复元素。

```javascript
function threeSum(nums) {
  nums.sort((a, b) => a - b);               // 排序后才能用双指针
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;  // 固定数去重
    let left = i + 1, right = nums.length - 1;       // 在 i 右侧找两数
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;   // 左去重
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;                             // 和太小，左指针右移
      } else {
        right--;                            // 和太大，右指针左移
      }
    }
  }
  return result;
}
```

**复杂度**：时间 O(n²)，空间 O(1)

---

### 42. 接雨水 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/trapping-rain-water/)

给定 n 个非负整数表示柱子高度，计算能接多少雨水。

**💡 思路**：双指针从两端向中间移动，每个位置能接的水 = min(左侧最高, 右侧最高) - 当前高度。

```javascript
function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;            // 左/右已扫描过的最高
  let water = 0;
  
  while (left < right) {
    if (height[left] < height[right]) {     // 哪边矮先算哪边（矮边决定水位）
      if (height[left] >= leftMax) {
        leftMax = height[left];             // 更新左侧最高
      } else {
        water += leftMax - height[left];    // 当前格可接水
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }
  return water;
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

## 三、滑动窗口

### 3. 无重复字符的最长子串 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

找出不含重复字符的最长子串长度。

**💡 思路**：滑动窗口 + Set，右指针扩展窗口，遇到重复字符时左指针收缩直到无重复。

```javascript
function lengthOfLongestSubstring(s) {
  const set = new Set();                    // 当前窗口内的字符集合
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {             // 右字符已存在则收缩左边界
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);                     // 将当前字符纳入窗口
    maxLen = Math.max(maxLen, right - left + 1);  // 更新最长无重复长度
  }
  return maxLen;
}
```

**复杂度**：时间 O(n)，空间 O(min(m, n))

---

### 438. 找到字符串中所有字母异位词 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)

找到 s 中所有 p 的异位词的起始索引。

**💡 思路**：固定长度的滑动窗口，用数组统计字符频率，窗口滑动时更新频率并比较。

```javascript
function findAnagrams(s, p) {
  const result = [];
  const pCount = new Array(26).fill(0);     // p 中各字母出现次数
  const sCount = new Array(26).fill(0);     // 当前窗口内各字母出现次数
  for (const c of p) {
    pCount[c.charCodeAt(0) - 97]++;         // 统计 p 的字符频率
  }
  for (let i = 0; i < s.length; i++) {
    sCount[s[i].charCodeAt(0) - 97]++;      // 右边界纳入新字符
    if (i >= p.length) {
      sCount[s[i - p.length].charCodeAt(0) - 97]--;  // 左边界滑出，减掉旧字符
    }
    if (pCount.join() === sCount.join()) {  // 频率一致则为异位词
      result.push(i - p.length + 1);       // 记录窗口起点下标
    }
  }
  return result;
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

## 四、子串

### 560. 和为 K 的子数组 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/subarray-sum-equals-k/)

找到和为 k 的连续子数组的个数。

**💡 思路**：前缀和 + 哈希表，若 prefixSum[j] - prefixSum[i] = k，则 i+1 到 j 的子数组和为 k。

```javascript
function subarraySum(nums, k) {
  const map = new Map([[0, 1]]);            // 前缀和 → 出现次数，前缀和 0 出现 1 次
  let sum = 0, count = 0;
  for (const num of nums) {
    sum += num;                             // 当前前缀和
    if (map.has(sum - k)) {                 // 若存在前缀和 = sum - k，则存在区间和为 k
      count += map.get(sum - k);
    }
    map.set(sum, (map.get(sum) || 0) + 1);  // 记录当前前缀和出现次数
  }
  return count;
}
```

**复杂度**：时间 O(n)，空间 O(n)

---
### 1109. 航班预订统计

🔗 [LeetCode 链接](https://leetcode.cn/problems/corporate-flight-bookings/description/)

输入航班n和预定表bookings，其中`bookings[i] = [firsti, lasti, seatsi]` 意味着在从 `firsti` 到 `lasti` （**包含** `firsti` 和 `lasti` ）的 **每个航班** 上预订了 `seatsi` 个座位，返回一个包含每个航班预定的座位总数的数组

思路：使用差分数组 + 前缀和

```javascript
var corpFlightBookings = function(bookings, n) {
    const diff = new Array(n + 1).fill(0);
    for(const [first, last, seats] of bookings) {
        diff[first - 1] += seats;
        diff[last] -= seats;

    }
    const answer = new Array(n);
    answer[0] = diff[0];
    for(let i = 1; i < n; i++) {
        answer[i] = answer[i - 1] + diff[i];

    }
    return answer

};
```
### 239. 滑动窗口最大值 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/sliding-window-maximum/)

返回滑动窗口中的最大值数组。

**💡 思路**：单调递减队列，队首始终是窗口最大值，新元素入队前移除所有比它小的元素。

```javascript
function maxSlidingWindow(nums, k) {
  const result = [];
  const deque = [];                        // 存下标，队首到队尾对应值单调递减
  for (let i = 0; i < nums.length; i++) {
    if (deque.length && deque[0] <= i - k) {
      deque.shift();                       // 队首已滑出窗口，移除
    }
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();                         // 队尾比当前小则弹出，保证单调减
    }
    deque.push(i);                         // 当前下标入队尾
    if (i >= k - 1) {
      result.push(nums[deque[0]]);         // 队首即窗口内最大值
    }
  }
  return result;
}
```

**复杂度**：时间 O(n)，空间 O(k)

---

### 76. 最小覆盖子串 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/minimum-window-substring/)

找出 s 中包含 t 所有字符的最小子串。

**💡 思路**：滑动窗口，右指针扩展直到包含所有字符，然后左指针收缩寻找最小窗口。

```javascript
function minWindow(s, t) {
  const need = new Map();                  // t 中每个字符需要的个数
  const window = new Map();                // 当前窗口内各字符已包含的个数
  for (const c of t) {
    need.set(c, (need.get(c) || 0) + 1);
  }
  let left = 0, right = 0;
  let valid = 0;                           // 已满足条件的字符种数（个数达标）
  let start = 0, len = Infinity;
  while (right < s.length) {
    const c = s[right];
    right++;                               // 右扩
    if (need.has(c)) {
      window.set(c, (window.get(c) || 0) + 1);
      if (window.get(c) === need.get(c)) {
        valid++;                           // 该字符已凑够
      }
    }
    while (valid === need.size) {          // 窗口已包含 t 全部字符，尝试收缩
      if (right - left < len) {
        start = left;
        len = right - left;                // 记录更小的窗口
      }
      const d = s[left];
      left++;                              // 左缩
      if (need.has(d)) {
        if (window.get(d) === need.get(d)) {
          valid--;                         // 该字符将不达标
        }
        window.set(d, window.get(d) - 1);
      }
    }
  }
  return len === Infinity ? '' : s.substring(start, start + len);
}
```

**复杂度**：时间 O(n)，空间 O(k)

---

## 五、普通数组

### 53. 最大子数组和 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/maximum-subarray/)

找出具有最大和的连续子数组。

**💡 思路**：动态规划/Kadane 算法，当前位置最大和 = max(当前值, 当前值 + 前一位置最大和)。

```javascript
function maxSubArray(nums) {
  let maxSum = nums[0];                    // 全局最大子数组和
  let currentSum = nums[0];                // 以当前元素结尾的最大子数组和
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);  // 要么重新从 i 开始，要么接上前面
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 56. 合并区间 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/merge-intervals/)

合并所有重叠的区间。

**💡 思路**：按起点排序，遍历时若当前区间与结果最后一个重叠则合并，否则直接加入结果。

```javascript
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);     // 按左端点排序
  const result = [intervals[0]];             // 先放入第一个区间
  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];  // 结果中最后一个区间
    if (intervals[i][0] <= last[1]) {        // 当前与 last 有重叠
      last[1] = Math.max(last[1], intervals[i][1]);  // 合并：右端点取较大
    } else {
      result.push(intervals[i]);             // 无重叠，直接加入
    }
  }
  return result;
}
```

**复杂度**：时间 O(n log n)，空间 O(n)

---

### 189. 轮转数组 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/rotate-array/)

将数组向右轮转 k 个位置。

**💡 思路**：三次翻转法——先整体翻转，再分别翻转前 k 个和后 n-k 个元素。

```javascript
function rotate(nums, k) {
  k = k % nums.length;                      // 轮转 n 次等于不转
  const reverse = (left, right) => {        // 反转 [left, right] 闭区间
    while (left < right) {
      [nums[left], nums[right]] = [nums[right], nums[left]];
      left++;
      right--;
    }
  };
  reverse(0, nums.length - 1);               // 整体反转
  reverse(0, k - 1);                         // 反转前 k 个
  reverse(k, nums.length - 1);              // 反转后 n-k 个
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 238. 除自身以外数组的乘积 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/product-of-array-except-self/)

返回数组，其中每个元素是其他所有元素的乘积。

**💡 思路**：两次遍历，第一次计算每个位置左侧所有元素的乘积，第二次乘以右侧乘积。

```javascript
function productExceptSelf(nums) {
  const n = nums.length;
  const result = new Array(n).fill(1);
  let left = 1;                             // 当前位置左侧所有数的乘积
  for (let i = 0; i < n; i++) {
    result[i] = left;                       // 先放左侧乘积
    left *= nums[i];                        // 为下一位置更新 left
  }
  let right = 1;                            // 当前位置右侧所有数的乘积
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= right;                     // 乘上右侧乘积
    right *= nums[i];                       // 为前一位置更新 right
  }
  return result;
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 41. 缺失的第一个正数 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/first-missing-positive/)

找出未出现的最小正整数。

**💡 思路**：原地哈希，将数字 x 放到索引 x-1 的位置，然后找第一个 nums[i] ≠ i+1 的位置。

```javascript
function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      [nums[nums[i] - 1], nums[i]] = [nums[i], nums[nums[i] - 1]];  // 把 nums[i] 换到下标 nums[i]-1
    }
  }
  for (let i = 0; i < n; i++) {
    if (nums[i] !== i + 1) {                // 下标 i 上不是 i+1，说明 i+1 没出现过
      return i + 1;
    }
  }
  return n + 1;                            // 1..n 都出现过，答案是 n+1
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

## 六、矩阵

### 73. 矩阵置零 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/set-matrix-zeroes/)

如果一个元素为 0，则将其所在行列都设为 0。

**💡 思路**：用第一行和第一列作为标记数组，记录哪些行列需要置零，最后统一处理。

```javascript
function setZeroes(matrix) {
  const m = matrix.length, n = matrix[0].length;
  let firstRowZero = false, firstColZero = false;  // 第一行/列自身是否要变 0
  for (let i = 0; i < m; i++) if (matrix[i][0] === 0) firstColZero = true;
  for (let j = 0; j < n; j++) if (matrix[0][j] === 0) firstRowZero = true;
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][j] === 0) {
        matrix[i][0] = 0;                   // 用第一列标记该行要置零
        matrix[0][j] = 0;                   // 用第一行标记该列要置零
      }
    }
  }
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][0] === 0 || matrix[0][j] === 0) {
        matrix[i][j] = 0;                   // 根据标记置零
      }
    }
  }
  if (firstColZero) for (let i = 0; i < m; i++) matrix[i][0] = 0;
  if (firstRowZero) for (let j = 0; j < n; j++) matrix[0][j] = 0;
}
```

**复杂度**：时间 O(mn)，空间 O(1)

---

### 54. 螺旋矩阵 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/spiral-matrix/)

按螺旋顺序返回矩阵所有元素。

**💡 思路**：定义上下左右四个边界，按右→下→左→上顺序遍历，每遍历完一边收缩对应边界。

```javascript
function spiralOrder(matrix) {
  const result = [];
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let i = left; i <= right; i++) result.push(matrix[top][i]);   // 上边：左→右
    top++;
    for (let i = top; i <= bottom; i++) result.push(matrix[i][right]); // 右边：上→下
    right--;
    if (top <= bottom) {
      for (let i = right; i >= left; i--) result.push(matrix[bottom][i]); // 下边：右→左
      bottom--;
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) result.push(matrix[i][left]);  // 左边：下→上
      left++;
    }
  }
  return result;
}
```

**复杂度**：时间 O(mn)，空间 O(1)

---

### 48. 旋转图像 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/rotate-image/)

将图像顺时针旋转 90 度。

**💡 思路**：先沿主对角线转置矩阵，再将每行水平翻转，即可实现顺时针旋转 90 度。

```javascript
function rotate(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];  // 沿主对角线转置
    }
  }
  for (let i = 0; i < n; i++) {
    matrix[i].reverse();                    // 每行水平翻转 → 顺时针 90°
  }
}
```

**复杂度**：时间 O(n²)，空间 O(1)

---

### 240. 搜索二维矩阵 II (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/search-a-2d-matrix-ii/)

在每行每列递增的矩阵中搜索目标值。

**💡 思路**：从右上角开始搜索，当前值大于目标则左移，小于目标则下移，利用有序性剪枝。

```javascript
function searchMatrix(matrix, target) {
  let row = 0, col = matrix[0].length - 1;  // 从右上角出发
  while (row < matrix.length && col >= 0) {
    if (matrix[row][col] === target) {
      return true;
    } else if (matrix[row][col] > target) {
      col--;                                 // 当前太大，左移（减小）
    } else {
      row++;                                 // 当前太小，下移（增大）
    }
  }
  return false;
}
```

**复杂度**：时间 O(m + n)，空间 O(1)

---

## 七、链表

### 160. 相交链表 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/intersection-of-two-linked-lists/)

找到两个链表相交的起始节点。

**💡 思路**：双指针分别遍历两链表，到末尾后切换到另一链表头，相遇点即为交点（路程相等）。

```javascript
function getIntersectionNode(headA, headB) {
  let pA = headA, pB = headB;
  while (pA !== pB) {
    pA = pA ? pA.next : headB;               // A 走完接 B 头
    pB = pB ? pB.next : headA;               // B 走完接 A 头，路程相等则相遇于交点
  }
  return pA;                                 // 相遇点或 null
}
```

**复杂度**：时间 O(m + n)，空间 O(1)

---

### 206. 反转链表 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/reverse-linked-list/)

反转单链表。

**💡 思路**：迭代法，用 prev 记录前一节点，遍历时将当前节点的 next 指向 prev，然后前进。

```javascript
function reverseList(head) {
  let prev = null, curr = head;              // prev 为已反转部分的头
  while (curr) {
    const next = curr.next;                  // 先记下后继，避免断链
    curr.next = prev;                        // 当前指向前驱
    prev = curr;                             // 已反转部分扩展
    curr = next;                             // 移到下一个
  }
  return prev;                               // 新头
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 234. 回文链表 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/palindrome-linked-list/)

判断链表是否为回文链表。

**💡 思路**：快慢指针找中点，反转后半部分，然后从头和从中间同时遍历比较。

```javascript
function isPalindrome(head) {
  let slow = head, fast = head;             // 快慢指针找中点
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let prev = null;                          // 反转后半段
  while (slow) {
    const next = slow.next;
    slow.next = prev;
    prev = slow;
    slow = next;
  }
  let left = head, right = prev;             // 前半头、后半头（已反转）
  while (right) {
    if (left.val !== right.val) return false;
    left = left.next;
    right = right.next;
  }
  return true;
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 141. 环形链表 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/linked-list-cycle/)

判断链表是否有环。

**💡 思路**：快慢指针，快指针每次走两步，慢指针每次走一步，若有环必相遇。

```javascript
function hasCycle(head) {
  let slow = head, fast = head;             // 快慢指针，快走 2 步慢走 1 步
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;         // 相遇则有环
  }
  return false;
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 142. 环形链表 II (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/linked-list-cycle-ii/)

找到环的入口节点。

**💡 思路**：快慢指针相遇后，将一个指针移到头部，两指针同速前进，再次相遇点即为环入口。

```javascript
function detectCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {                    // 相遇后，一个从 head 一个从相遇点同速走
      let ptr = head;
      while (ptr !== slow) {
        ptr = ptr.next;
        slow = slow.next;
      }
      return ptr;                           // 再次相遇即为环入口
    }
  }
  return null;
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 21. 合并两个有序链表 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/merge-two-sorted-lists/)

合并两个升序链表为一个新链表。

**💡 思路**：双指针比较两链表当前节点，较小者接入结果链表，直到一方遍历完。

```javascript
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);            // 哑节点，方便统一处理
  let curr = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      curr.next = l1;                       // 接上较小者
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }
  curr.next = l1 || l2;                     // 接上剩余段
  return dummy.next;
}
```

**复杂度**：时间 O(n + m)，空间 O(1)

---

### 2. 两数相加 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/add-two-numbers/)

两个链表表示的数字相加。

**💡 思路**：模拟加法，从低位到高位逐位相加，注意进位处理，直到两链表和进位都处理完。

```javascript
function addTwoNumbers(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;
  let carry = 0;                            // 进位
  while (l1 || l2 || carry) {               // 任一方未走完或还有进位就继续
    const sum = (l1?.val || 0) + (l2?.val || 0) + carry;
    carry = Math.floor(sum / 10);           // 新进位
    curr.next = new ListNode(sum % 10);    // 当前位
    curr = curr.next;
    l1 = l1?.next;
    l2 = l2?.next;
  }
  return dummy.next;
}
```

**复杂度**：时间 O(max(m, n))，空间 O(1)

---

### 19. 删除链表的倒数第 N 个节点 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

**💡 思路**：快指针先走 n+1 步，然后快慢指针同时走，快指针到末尾时慢指针正好在目标前一位。

```javascript
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);       // 哑节点，方便删头
  let slow = dummy, fast = dummy;
  for (let i = 0; i <= n; i++) {
    fast = fast.next;                      // 快指针先走 n+1 步
  }
  while (fast) {
    slow = slow.next;
    fast = fast.next;                      // 快到底时，slow 在待删节点前一个
  }
  slow.next = slow.next.next;             // 跳过倒数第 n 个
  return dummy.next;
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 24. 两两交换链表中的节点 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/swap-nodes-in-pairs/)

**💡 思路**：迭代法，每次处理两个节点的交换，用 prev 指针连接交换后的节点对。

```javascript
function swapPairs(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy;                         // 当前对的前驱
  while (prev.next && prev.next.next) {
    const first = prev.next;
    const second = prev.next.next;          // 要交换的两个节点
    first.next = second.next;               // first 接下一对
    second.next = first;                    // second 换到前面
    prev.next = second;                     // 前驱接新顺序
    prev = first;                           // 下一对的前驱
  }
  return dummy.next;
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 25. K 个一组翻转链表 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/reverse-nodes-in-k-group/)

**💡 思路**：先找到每组的第 k 个节点，然后对这 k 个节点进行翻转，递归或迭代处理下一组。

```javascript
function reverseKGroup(head, k) {
  const dummy = new ListNode(0, head);
  let prevGroupEnd = dummy;                 // 上一组的尾（或哑节点）
  while (true) {
    const kth = getKth(prevGroupEnd, k);    // 从 prevGroupEnd 往后第 k 个
    if (!kth) break;                        // 不足 k 个则结束
    const nextGroupStart = kth.next;       // 下一组头，也是反转后的尾的后继
    let prev = nextGroupStart;
    let curr = prevGroupEnd.next;           // 本组头
    while (curr !== nextGroupStart) {      // 反转本组 k 个节点
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next;
    }
    const tmp = prevGroupEnd.next;          // 本组原头（反转后变尾）
    prevGroupEnd.next = kth;                // 上一组尾接本组新头
    prevGroupEnd = tmp;                     // 本组新尾作为下一轮上一组尾
  }
  return dummy.next;
}
function getKth(node, k) {                 // 从 node 往后走 k 步，返回第 k 个节点
  while (node && k > 0) {
    node = node.next;
    k--;
  }
  return node;
}
```

**复杂度**：时间 O(n)，空间 O(1)

---

### 138. 随机链表的复制 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/copy-list-with-random-pointer/)

**💡 思路**：用哈希表建立原节点到新节点的映射，第二次遍历时设置 next 和 random 指针。

```javascript
function copyRandomList(head) {
  if (!head) return null;
  const map = new Map();                    // 原节点 → 新节点
  let curr = head;
  while (curr) {
    map.set(curr, new Node(curr.val));      // 先建出所有新节点
    curr = curr.next;
  }
  curr = head;
  while (curr) {
    map.get(curr).next = map.get(curr.next) || null;   // 接 next
    map.get(curr).random = map.get(curr.random) || null; // 接 random
    curr = curr.next;
  }
  return map.get(head);
}
```

**复杂度**：时间 O(n)，空间 O(n)

---

### 148. 排序链表 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/sort-list/)

归并排序链表。

**💡 思路**：归并排序，快慢指针找中点断开链表，递归排序两半，然后合并两个有序链表。

```javascript
function sortList(head) {
  if (!head || !head.next) return head;
  let slow = head, fast = head.next;        // 快慢指针找中点（slow 偏左）
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  const mid = slow.next;
  slow.next = null;                         // 断成两段
  const left = sortList(head);
  const right = sortList(mid);
  return mergeTwoLists(left, right);
}
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }
  curr.next = l1 || l2;
  return dummy.next;
}
```

**复杂度**：时间 O(n log n)，空间 O(log n)

---

### 23. 合并 K 个升序链表 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/merge-k-sorted-lists/)

**💡 思路**：分治法，两两合并链表，递归将问题规模减半，最终合并为一个有序链表。

```javascript
function mergeKLists(lists) {
  if (!lists.length) return null;
  const merge = (left, right) => {          // 合并 [left, right] 区间内的链表
    if (left > right) return null;
    if (left === right) return lists[left];
    const mid = Math.floor((left + right) / 2);
    const l1 = merge(left, mid);
    const l2 = merge(mid + 1, right);
    return mergeTwoLists(l1, l2);
  };
  return merge(0, lists.length - 1);
}
```

**复杂度**：时间 O(n log k)，空间 O(log k)

---

### 146. LRU 缓存 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/lru-cache/)

**💡 思路**：用 Map 保持插入顺序，get/put 时删除再重新插入实现"最近使用"，超容量时删除最早的。

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();                 // Map 按插入顺序，尾部为最近使用
  }
  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);             // 删掉再插入，挪到「最近」
    return value;
  }
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);               // 已存在则先删，再插入更新顺序
    } else if (this.cache.size >= this.capacity) {
      this.cache.delete(this.cache.keys().next().value);  // 删最久未用（第一个 key）
    }
    this.cache.set(key, value);
  }
}
```

**复杂度**：时间 O(1)，空间 O(capacity)

---

## 八、二叉树

### 94. 二叉树的中序遍历 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/binary-tree-inorder-traversal/)

**💡 思路**：迭代法，用栈模拟递归，先将左子树全部入栈，弹出访问后转向右子树。

```javascript
function inorderTraversal(root) {
  const result = [];
  const stack = [];
  let curr = root;
  while (curr || stack.length) {
    while (curr) {
      stack.push(curr);                     // 一路向左入栈
      curr = curr.left;
    }
    curr = stack.pop();                     // 弹栈即左-根-右的「根」
    result.push(curr.val);
    curr = curr.right;                      // 转向右子树
  }
  return result;
}
```

---

### 104. 二叉树的最大深度 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

**💡 思路**：递归，树的最大深度 = 1 + max(左子树深度, 右子树深度)。

```javascript
function maxDepth(root) {
  if (!root) return 0;                      // 空树深度 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));  // 根 + 左右最大深度
}
```

---

### 226. 翻转二叉树 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/invert-binary-tree/)

**💡 思路**：递归交换每个节点的左右子树，前序或后序遍历时交换即可。

```javascript
function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [root.right, root.left];  // 交换左右子
  invertTree(root.left);
  invertTree(root.right);
  return root;
}
```

---

### 101. 对称二叉树 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/symmetric-tree/)

**💡 思路**：递归比较左右子树是否镜像，即左子树的左 = 右子树的右，左子树的右 = 右子树的左。

```javascript
function isSymmetric(root) {
  const check = (left, right) => {           // 判断两棵子树是否镜像
    if (!left && !right) return true;
    if (!left || !right) return false;
    return left.val === right.val &&
           check(left.left, right.right) &&  // 左的左 vs 右的右
           check(left.right, right.left);    // 左的右 vs 右的左
  };
  return check(root?.left, root?.right);
}
```

---

### 543. 二叉树的直径 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/diameter-of-binary-tree/)

**💡 思路**：直径 = 某节点左子树深度 + 右子树深度的最大值，在计算深度时更新全局最大值。

```javascript
function diameterOfBinaryTree(root) {
  let maxDiameter = 0;                      // 全局最大直径
  const depth = (node) => {                  // 返回以 node 为根的深度
    if (!node) return 0;
    const left = depth(node.left);
    const right = depth(node.right);
    maxDiameter = Math.max(maxDiameter, left + right);  // 经过 node 的直径
    return 1 + Math.max(left, right);
  };
  depth(root);
  return maxDiameter;
}
```

---

### 102. 二叉树的层序遍历 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

**💡 思路**：BFS，用队列逐层处理节点，每层处理前记录队列长度，处理该层所有节点后进入下一层。

```javascript
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length) {
    const level = [];
    const size = queue.length;               // 当前层节点数
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
```

---

### 108. 将有序数组转换为二叉搜索树 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/)

**💡 思路**：取中间元素作为根，左半部分递归构建左子树，右半部分递归构建右子树。

```javascript
function sortedArrayToBST(nums) {
  const build = (left, right) => {
    if (left > right) return null;
    
    const mid = Math.floor((left + right) / 2);
    const node = new TreeNode(nums[mid]);
    node.left = build(left, mid - 1);
    node.right = build(mid + 1, right);
    
    return node;
  };
  
  return build(0, nums.length - 1);
}
```

---

### 98. 验证二叉搜索树 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/validate-binary-search-tree/)

**💡 思路**：递归时传递当前节点的合法范围 (min, max)，每个节点值必须在范围内。

```javascript
function isValidBST(root) {
  const validate = (node, min, max) => {
    if (!node) return true;
    if (node.val <= min || node.val >= max) return false;
    return validate(node.left, min, node.val) &&
           validate(node.right, node.val, max);
  };
  
  return validate(root, -Infinity, Infinity);
}
```

---

### 230. 二叉搜索树中第 K 小的元素 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/)

**💡 思路**：BST 中序遍历结果是升序的，中序遍历到第 k 个节点即为答案。

```javascript
function kthSmallest(root, k) {
  const stack = [];
  let curr = root;
  
  while (curr || stack.length) {
    while (curr) {
      stack.push(curr);
      curr = curr.left;
    }
    curr = stack.pop();
    k--;
    if (k === 0) return curr.val;
    curr = curr.right;
  }
}
```

---

### 199. 二叉树的右视图 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/binary-tree-right-side-view/)

**💡 思路**：层序遍历，每层只取最后一个节点的值（或 DFS 时优先访问右子树）。

```javascript
function rightSideView(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length) {
    const size = queue.length;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      if (i === size - 1) result.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  
  return result;
}
```

---

### 114. 二叉树展开为链表 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/)

**💡 思路**：对于每个节点，将左子树插入到右子树的位置，原右子树接到左子树的最右节点。

```javascript
function flatten(root) {
  let curr = root;
  
  while (curr) {
    if (curr.left) {
      let prev = curr.left;
      while (prev.right) prev = prev.right;
      prev.right = curr.right;
      curr.right = curr.left;
      curr.left = null;
    }
    curr = curr.right;
  }
}
```

---

### 105. 从前序与中序遍历序列构造二叉树 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

**💡 思路**：前序第一个是根，在中序中找到根的位置，左边是左子树，右边是右子树，递归构建。

```javascript
function buildTree(preorder, inorder) {
  const map = new Map();
  inorder.forEach((val, i) => map.set(val, i));
  
  const build = (preStart, preEnd, inStart, inEnd) => {
    if (preStart > preEnd) return null;
    
    const rootVal = preorder[preStart];
    const root = new TreeNode(rootVal);
    const inRoot = map.get(rootVal);
    const leftSize = inRoot - inStart;
    
    root.left = build(preStart + 1, preStart + leftSize, inStart, inRoot - 1);
    root.right = build(preStart + leftSize + 1, preEnd, inRoot + 1, inEnd);
    
    return root;
  };
  
  return build(0, preorder.length - 1, 0, inorder.length - 1);
}
```

---

### 437. 路径总和 III (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/path-sum-iii/)

**💡 思路**：前缀和 + 回溯，用哈希表记录路径上的前缀和，当前前缀和 - 目标值存在则找到一条路径。

```javascript
function pathSum(root, targetSum) {
  const prefixSum = new Map([[0, 1]]);
  let count = 0;
  
  const dfs = (node, currSum) => {
    if (!node) return;
    
    currSum += node.val;
    count += prefixSum.get(currSum - targetSum) || 0;
    prefixSum.set(currSum, (prefixSum.get(currSum) || 0) + 1);
    
    dfs(node.left, currSum);
    dfs(node.right, currSum);
    
    prefixSum.set(currSum, prefixSum.get(currSum) - 1);
  };
  
  dfs(root, 0);
  return count;
}
```

---

### 236. 二叉树的最近公共祖先 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/)

**💡 思路**：递归查找，若当前节点是 p 或 q 则返回；若 p、q 分别在左右子树则当前节点是 LCA。

```javascript
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  
  if (left && right) return root;
  return left || right;
}
```

---

### 124. 二叉树中的最大路径和 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)

**💡 思路**：递归计算每个节点的最大贡献值（只能选左或右），同时更新经过该节点的最大路径和。

```javascript
function maxPathSum(root) {
  let maxSum = -Infinity;
  
  const dfs = (node) => {
    if (!node) return 0;
    
    const left = Math.max(0, dfs(node.left));
    const right = Math.max(0, dfs(node.right));
    
    maxSum = Math.max(maxSum, node.val + left + right);
    
    return node.val + Math.max(left, right);
  };
  
  dfs(root);
  return maxSum;
}
```

---

## 九、图论

### 200. 岛屿数量 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/number-of-islands/)

**💡 思路**：遍历网格，遇到陆地就计数并 DFS/BFS 将连通的陆地标记为已访问（沉岛）。

```javascript
function numIslands(grid) {
  const m = grid.length, n = grid[0].length;
  let count = 0;
  
  const dfs = (i, j) => {
    if (i < 0 || i >= m || j < 0 || j >= n || grid[i][j] === '0') return;
    
    grid[i][j] = '0';
    dfs(i + 1, j);
    dfs(i - 1, j);
    dfs(i, j + 1);
    dfs(i, j - 1);
  };
  
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === '1') {
        count++;
        dfs(i, j);
      }
    }
  }
  
  return count;
}
```

---

### 994. 腐烂的橘子 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/rotting-oranges/)

**💡 思路**：多源 BFS，所有腐烂橘子同时入队作为起点，每分钟向四周扩散，统计扩散轮数。

```javascript
function orangesRotting(grid) {
  const m = grid.length, n = grid[0].length;
  const queue = [];
  let fresh = 0;
  
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 2) queue.push([i, j]);
      else if (grid[i][j] === 1) fresh++;
    }
  }
  
  if (fresh === 0) return 0;
  
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let minutes = 0;
  
  while (queue.length) {
    const size = queue.length;
    
    for (let i = 0; i < size; i++) {
      const [x, y] = queue.shift();
      
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        
        if (nx >= 0 && nx < m && ny >= 0 && ny < n && grid[nx][ny] === 1) {
          grid[nx][ny] = 2;
          fresh--;
          queue.push([nx, ny]);
        }
      }
    }
    
    if (queue.length) minutes++;
  }
  
  return fresh === 0 ? minutes : -1;
}
```

---

### 207. 课程表 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/course-schedule/)

**💡 思路**：拓扑排序，用入度数组和邻接表建图，BFS 从入度为 0 的节点开始，检查能否完成所有课程。

```javascript
function canFinish(numCourses, prerequisites) {
  const graph = new Array(numCourses).fill(0).map(() => []);
  const inDegree = new Array(numCourses).fill(0);
  
  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    inDegree[course]++;
  }
  
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  
  let count = 0;
  
  while (queue.length) {
    const course = queue.shift();
    count++;
    
    for (const next of graph[course]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }
  
  return count === numCourses;
}
```

---

### 208. 实现 Trie（前缀树）(Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/implement-trie-prefix-tree/)

**💡 思路**：用嵌套对象表示树结构，每个节点包含子节点和结束标记，按字符逐层查找/插入。

```javascript
class Trie {
  constructor() {
    this.root = {};
  }
  
  insert(word) {
    let node = this.root;
    for (const c of word) {
      if (!node[c]) node[c] = {};
      node = node[c];
    }
    node.isEnd = true;
  }
  
  search(word) {
    let node = this.root;
    for (const c of word) {
      if (!node[c]) return false;
      node = node[c];
    }
    return !!node.isEnd;
  }
  
  startsWith(prefix) {
    let node = this.root;
    for (const c of prefix) {
      if (!node[c]) return false;
      node = node[c];
    }
    return true;
  }
}
```

---

## 十、回溯

### 46. 全排列 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/permutations/)

**💡 思路**：回溯，每次选择一个未使用的数加入路径，递归后撤销选择，直到路径长度等于数组长度。

```javascript
function permute(nums) {
  const result = [];
  
  const backtrack = (path, used) => {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      
      path.push(nums[i]);
      used[i] = true;
      backtrack(path, used);
      path.pop();
      used[i] = false;
    }
  };
  
  backtrack([], []);
  return result;
}
```

---

### 78. 子集 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/subsets/)

**💡 思路**：回溯，每个位置可选可不选，从当前位置向后遍历避免重复，每个状态都是一个有效子集。

```javascript
function subsets(nums) {
  const result = [];
  
  const backtrack = (start, path) => {
    result.push([...path]);
    
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  };
  
  backtrack(0, []);
  return result;
}
```

---

### 17. 电话号码的字母组合 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/)

**💡 思路**：回溯，建立数字到字母的映射，每个数字依次选择一个字母加入路径，直到处理完所有数字。

```javascript
function letterCombinations(digits) {
  if (!digits) return [];
  
  const map = {
    '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
    '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
  };
  
  const result = [];
  
  const backtrack = (index, path) => {
    if (index === digits.length) {
      result.push(path);
      return;
    }
    
    for (const c of map[digits[index]]) {
      backtrack(index + 1, path + c);
    }
  };
  
  backtrack(0, '');
  return result;
}
```

---

### 39. 组合总和 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/combination-sum/)

**💡 思路**：回溯，同一个数可以重复选，所以递归时从当前位置开始而非下一位置，剪枝条件为和超过目标。

```javascript
function combinationSum(candidates, target) {
  const result = [];
  
  const backtrack = (start, path, sum) => {
    if (sum === target) {
      result.push([...path]);
      return;
    }
    if (sum > target) return;
    
    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      backtrack(i, path, sum + candidates[i]);
      path.pop();
    }
  };
  
  backtrack(0, [], 0);
  return result;
}
```

---

### 22. 括号生成 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/generate-parentheses/)

**💡 思路**：回溯，左括号数量小于 n 时可加左括号，右括号数量小于左括号时可加右括号。

```javascript
function generateParenthesis(n) {
  const result = [];
  
  const backtrack = (path, open, close) => {
    if (path.length === 2 * n) {
      result.push(path);
      return;
    }
    
    if (open < n) backtrack(path + '(', open + 1, close);
    if (close < open) backtrack(path + ')', open, close + 1);
  };
  
  backtrack('', 0, 0);
  return result;
}
```

---

### 79. 单词搜索 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/word-search/)

**💡 思路**：DFS + 回溯，从每个格子出发尝试匹配单词，访问过的格子临时标记，回溯时恢复。

```javascript
function exist(board, word) {
  const m = board.length, n = board[0].length;
  
  const dfs = (i, j, k) => {
    if (k === word.length) return true;
    if (i < 0 || i >= m || j < 0 || j >= n || board[i][j] !== word[k]) return false;
    
    const temp = board[i][j];
    board[i][j] = '#';
    
    const found = dfs(i + 1, j, k + 1) || dfs(i - 1, j, k + 1) ||
                  dfs(i, j + 1, k + 1) || dfs(i, j - 1, k + 1);
    
    board[i][j] = temp;
    return found;
  };
  
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (dfs(i, j, 0)) return true;
    }
  }
  
  return false;
}
```

---

### 131. 分割回文串 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/palindrome-partitioning/)

**💡 思路**：回溯，每次尝试从当前位置切出一个回文子串，若是回文则加入路径并递归处理剩余部分。

```javascript
function partition(s) {
  const result = [];
  
  const isPalindrome = (str, left, right) => {
    while (left < right) {
      if (str[left] !== str[right]) return false;
      left++;
      right--;
    }
    return true;
  };
  
  const backtrack = (start, path) => {
    if (start === s.length) {
      result.push([...path]);
      return;
    }
    
    for (let i = start; i < s.length; i++) {
      if (isPalindrome(s, start, i)) {
        path.push(s.substring(start, i + 1));
        backtrack(i + 1, path);
        path.pop();
      }
    }
  };
  
  backtrack(0, []);
  return result;
}
```

---

### 51. N 皇后 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/n-queens/)

**💡 思路**：回溯，逐行放置皇后，检查列和两条对角线是否有冲突，有效则递归下一行。

```javascript
function solveNQueens(n) {
  const result = [];
  const board = new Array(n).fill(0).map(() => new Array(n).fill('.'));
  
  const isValid = (row, col) => {
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') return false;
    }
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') return false;
    }
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 'Q') return false;
    }
    return true;
  };
  
  const backtrack = (row) => {
    if (row === n) {
      result.push(board.map(r => r.join('')));
      return;
    }
    
    for (let col = 0; col < n; col++) {
      if (isValid(row, col)) {
        board[row][col] = 'Q';
        backtrack(row + 1);
        board[row][col] = '.';
      }
    }
  };
  
  backtrack(0);
  return result;
}
```

---

## 十一、二分查找

### 35. 搜索插入位置 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/search-insert-position/)

**💡 思路**：标准二分查找，找到则返回位置，否则 left 指针停在第一个大于 target 的位置。

```javascript
function searchInsert(nums, target) {
  let left = 0, right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return left;
}
```

---

### 74. 搜索二维矩阵 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/search-a-2d-matrix/)

**💡 思路**：将二维矩阵看作一维有序数组，用 mid / n 和 mid % n 转换坐标，进行二分查找。

```javascript
function searchMatrix(matrix, target) {
  const m = matrix.length, n = matrix[0].length;
  let left = 0, right = m * n - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const val = matrix[Math.floor(mid / n)][mid % n];
    
    if (val === target) return true;
    if (val < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return false;
}
```

---

### 34. 在排序数组中查找元素的第一个和最后一个位置 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/)

**💡 思路**：两次二分，第一次找左边界（第一个 >= target 的位置），第二次找右边界或直接向右扩展。

```javascript
function searchRange(nums, target) {
  const findFirst = () => {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (nums[mid] >= target) right = mid - 1;
      else left = mid + 1;
    }
    return left;
  };
  
  const first = findFirst();
  if (nums[first] !== target) return [-1, -1];
  
  let last = first;
  while (nums[last + 1] === target) last++;
  
  return [first, last];
}
```

---

### 33. 搜索旋转排序数组 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/search-in-rotated-sorted-array/)

**💡 思路**：二分时判断哪半边有序，若 target 在有序半边范围内则去该半边，否则去另一半边。

```javascript
function search(nums, target) {
  let left = 0, right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) return mid;
    
    if (nums[left] <= nums[mid]) {
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  
  return -1;
}
```

---

### 153. 寻找旋转排序数组中的最小值 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/)

**💡 思路**：二分，比较 mid 与 right，若 mid > right 则最小值在右半边，否则在左半边（含 mid）。

```javascript
function findMin(nums) {
  let left = 0, right = nums.length - 1;
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] > nums[right]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  
  return nums[left];
}
```

---

### 4. 寻找两个正序数组的中位数 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/median-of-two-sorted-arrays/)

**💡 思路**：二分查找分割点，使得左半部分元素个数等于右半部分，且左边最大 ≤ 右边最小。

```javascript
function findMedianSortedArrays(nums1, nums2) {
  if (nums1.length > nums2.length) {
    [nums1, nums2] = [nums2, nums1];
  }
  
  const m = nums1.length, n = nums2.length;
  let left = 0, right = m;
  
  while (left <= right) {
    const i = Math.floor((left + right) / 2);
    const j = Math.floor((m + n + 1) / 2) - i;
    
    const maxLeft1 = i === 0 ? -Infinity : nums1[i - 1];
    const minRight1 = i === m ? Infinity : nums1[i];
    const maxLeft2 = j === 0 ? -Infinity : nums2[j - 1];
    const minRight2 = j === n ? Infinity : nums2[j];
    
    if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
      if ((m + n) % 2 === 1) {
        return Math.max(maxLeft1, maxLeft2);
      }
      return (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2;
    } else if (maxLeft1 > minRight2) {
      right = i - 1;
    } else {
      left = i + 1;
    }
  }
}
```

---

## 十二、栈

### 20. 有效的括号 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/valid-parentheses/)

**💡 思路**：遍历字符串，左括号入栈，右括号与栈顶匹配则出栈，最后栈空则有效。

```javascript
function isValid(s) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };
  
  for (const c of s) {
    if (c === '(' || c === '[' || c === '{') {
      stack.push(c);
    } else {
      if (stack.pop() !== map[c]) return false;
    }
  }
  
  return stack.length === 0;
}
```

---

### 155. 最小栈 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/min-stack/)

**💡 思路**：用辅助栈同步记录每个状态下的最小值，主栈入栈时辅助栈也入栈当前最小值。

```javascript
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }
  
  push(val) {
    this.stack.push(val);
    this.minStack.push(
      this.minStack.length === 0 
        ? val 
        : Math.min(val, this.minStack[this.minStack.length - 1])
    );
  }
  
  pop() {
    this.stack.pop();
    this.minStack.pop();
  }
  
  top() {
    return this.stack[this.stack.length - 1];
  }
  
  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}
```

---

### 394. 字符串解码 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/decode-string/)

**💡 思路**：用两个栈分别存数字和字符串，遇到 `[` 入栈，遇到 `]` 出栈并重复拼接。

```javascript
function decodeString(s) {
  const numStack = [];
  const strStack = [];
  let num = 0;
  let str = '';
  
  for (const c of s) {
    if (c >= '0' && c <= '9') {
      num = num * 10 + parseInt(c);
    } else if (c === '[') {
      numStack.push(num);
      strStack.push(str);
      num = 0;
      str = '';
    } else if (c === ']') {
      str = strStack.pop() + str.repeat(numStack.pop());
    } else {
      str += c;
    }
  }
  
  return str;
}
```

---

### 739. 每日温度 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/daily-temperatures/)

**💡 思路**：单调递减栈存索引，遍历时将所有比当前温度低的出栈并计算天数差。

```javascript
function dailyTemperatures(temperatures) {
  const n = temperatures.length;
  const result = new Array(n).fill(0);
  const stack = []; // 单调递减栈，存索引
  
  for (let i = 0; i < n; i++) {
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const j = stack.pop();
      result[j] = i - j;
    }
    stack.push(i);
  }
  
  return result;
}
```

---

### 84. 柱状图中最大的矩形 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/largest-rectangle-in-histogram/)

**💡 思路**：单调递增栈，对于每个柱子找左右第一个更矮的位置，面积 = 高度 × (右边界 - 左边界 - 1)。

```javascript
function largestRectangleArea(heights) {
  const stack = [-1];
  let maxArea = 0;
  
  for (let i = 0; i < heights.length; i++) {
    while (stack[stack.length - 1] !== -1 && 
           heights[stack[stack.length - 1]] >= heights[i]) {
      const height = heights[stack.pop()];
      const width = i - stack[stack.length - 1] - 1;
      maxArea = Math.max(maxArea, height * width);
    }
    stack.push(i);
  }
  
  while (stack[stack.length - 1] !== -1) {
    const height = heights[stack.pop()];
    const width = heights.length - stack[stack.length - 1] - 1;
    maxArea = Math.max(maxArea, height * width);
  }
  
  return maxArea;
}
```

---

## 十三、堆

### 215. 数组中的第 K 个最大元素 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

**💡 思路**：快速选择算法，类似快排分区，根据 pivot 位置决定在左半边还是右半边继续查找。

```javascript
function findKthLargest(nums, k) {
  const partition = (left, right) => {
    const pivot = nums[right];
    let i = left;
    
    for (let j = left; j < right; j++) {
      if (nums[j] > pivot) {
        [nums[i], nums[j]] = [nums[j], nums[i]];
        i++;
      }
    }
    
    [nums[i], nums[right]] = [nums[right], nums[i]];
    return i;
  };
  
  let left = 0, right = nums.length - 1;
  
  while (true) {
    const pivotIndex = partition(left, right);
    
    if (pivotIndex === k - 1) return nums[pivotIndex];
    if (pivotIndex < k - 1) left = pivotIndex + 1;
    else right = pivotIndex - 1;
  }
}
```

---

### 347. 前 K 个高频元素 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/top-k-frequent-elements/)

**💡 思路**：统计频率后用桶排序，以频率为索引放入桶中，从高频桶向低频桶收集 k 个元素。

```javascript
function topKFrequent(nums, k) {
  const map = new Map();
  for (const num of nums) {
    map.set(num, (map.get(num) || 0) + 1);
  }
  
  // 桶排序
  const buckets = new Array(nums.length + 1).fill(0).map(() => []);
  for (const [num, freq] of map) {
    buckets[freq].push(num);
  }
  
  const result = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    result.push(...buckets[i]);
  }
  
  return result.slice(0, k);
}
```

---

### 295. 数据流的中位数 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/find-median-from-data-stream/)

**💡 思路**：用大顶堆存较小一半，小顶堆存较大一半，保持两堆平衡，中位数从堆顶获取。

```javascript
class MedianFinder {
  constructor() {
    this.small = []; // 大顶堆（存负数模拟）
    this.large = []; // 小顶堆
  }
  
  addNum(num) {
    this.small.push(-num);
    this.small.sort((a, b) => a - b);
    
    this.large.push(-this.small.shift());
    this.large.sort((a, b) => a - b);
    
    if (this.large.length > this.small.length) {
      this.small.push(-this.large.shift());
      this.small.sort((a, b) => a - b);
    }
  }
  
  findMedian() {
    if (this.small.length > this.large.length) {
      return -this.small[0];
    }
    return (-this.small[0] + this.large[0]) / 2;
  }
}
```

---

## 十四、贪心

### 121. 买卖股票的最佳时机 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

**💡 思路**：遍历时记录到目前为止的最低价，用当前价减最低价更新最大利润。

```javascript
function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  
  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  
  return maxProfit;
}
```

---

### 55. 跳跃游戏 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/jump-game/)

**💡 思路**：贪心维护能到达的最远位置，若某位置超过最远位置则无法到达，否则更新最远位置。

```javascript
function canJump(nums) {
  let maxReach = 0;
  
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  
  return true;
}
```

---

### 45. 跳跃游戏 II (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/jump-game-ii/)

**💡 思路**：贪心，在当前跳跃范围内找能跳最远的位置作为下一跳的终点，到达边界时跳数+1。

```javascript
function jump(nums) {
  let jumps = 0;
  let currentEnd = 0;
  let farthest = 0;
  
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }
  
  return jumps;
}
```

---

### 763. 划分字母区间 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/partition-labels/)

**💡 思路**：先记录每个字母最后出现的位置，遍历时更新当前片段的结束位置，到达结束位置时切分。

```javascript
function partitionLabels(s) {
  const last = {};
  for (let i = 0; i < s.length; i++) {
    last[s[i]] = i;
  }
  
  const result = [];
  let start = 0, end = 0;
  
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s[i]]);
    
    if (i === end) {
      result.push(end - start + 1);
      start = i + 1;
    }
  }
  
  return result;
}
```

---

## 十五、动态规划

### 70. 爬楼梯 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/climbing-stairs/)

**💡 思路**：斐波那契数列，到达第 n 阶的方法数 = 到达第 n-1 阶 + 到达第 n-2 阶的方法数。

```javascript
function climbStairs(n) {
  if (n <= 2) return n;
  
  let prev2 = 1, prev1 = 2;
  
  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  
  return prev1;
}
```

---

### 118. 杨辉三角 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/pascals-triangle/)

**💡 思路**：每行首尾为 1，中间元素 = 上一行相邻两元素之和，逐行构建。

```javascript
function generate(numRows) {
  const result = [[1]];
  
  for (let i = 1; i < numRows; i++) {
    const prev = result[i - 1];
    const row = [1];
    
    for (let j = 1; j < i; j++) {
      row.push(prev[j - 1] + prev[j]);
    }
    
    row.push(1);
    result.push(row);
  }
  
  return result;
}
```

---

### 198. 打家劫舍 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/house-robber/)

**💡 思路**：dp[i] = max(dp[i-1], dp[i-2] + nums[i])，每家可选偷或不偷，取最大值。

```javascript
function rob(nums) {
  if (nums.length === 1) return nums[0];
  
  let prev2 = nums[0];
  let prev1 = Math.max(nums[0], nums[1]);
  
  for (let i = 2; i < nums.length; i++) {
    const curr = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = curr;
  }
  
  return prev1;
}
```

---

### 279. 完全平方数 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/perfect-squares/)

**💡 思路**：完全背包问题，dp[i] = min(dp[i], dp[i - j²] + 1)，枚举所有可用的完全平方数。

```javascript
function numSquares(n) {
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j * j <= i; j++) {
      dp[i] = Math.min(dp[i], dp[i - j * j] + 1);
    }
  }
  
  return dp[n];
}
```

---

### 322. 零钱兑换 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/coin-change/)

**💡 思路**：完全背包，dp[i] 表示凑成金额 i 的最少硬币数，枚举每种硬币更新状态。

```javascript
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

---

### 139. 单词拆分 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/word-break/)

**💡 思路**：dp[i] 表示前 i 个字符能否被拆分，枚举分割点 j，若 dp[j] 为真且 s[j:i] 在字典中则 dp[i] 为真。

```javascript
function wordBreak(s, wordDict) {
  const wordSet = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && wordSet.has(s.substring(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  
  return dp[s.length];
}
```

---

### 300. 最长递增子序列 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/longest-increasing-subsequence/)

**💡 思路**：贪心 + 二分，维护一个数组 tails，tails[i] 是长度为 i+1 的 LIS 的最小末尾元素。

```javascript
function lengthOfLIS(nums) {
  // 初始化tails数组，维护不同长度递增子序列的最小末尾元素
  const tails = [];
  // 遍历原数组的每一个数组
  for (const num of nums) {
    // 二分查找的左右边界：left从0开始，right初始为tails的长度
    // 左闭右开区间 [left,right)
    let left = 0, right = tails.length;
    // 二分查找核心循环：找到第一个>=num的位置left
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      // < 的话，说明num需要往右找，左边界右移
      if (tails[mid] < num) left = mid + 1;
      
      else right = mid;
    }
    // 替换tails，保证tails的递增性，且末尾元素最小
    tails[left] = num;
  }
  
  return tails.length;
}

// 常规动态规划打法
var lengthOfLIS = function(nums) { 
	// 处理边界：空数组直接返回0 
	if (nums.length === 0) return 0; 
	// dp数组：dp[i] 表示以nums[i]为**最后一个元素**的最长递增子序列的长度 
	const dp = new Array(nums.length).fill(1); 
	// 记录全局最大长度，初始为1（单个元素的子序列长度最小为1） 
	let maxLen = 1; 
	// 遍历每个元素，作为子序列的末尾元素 
	for (let i = 1; i < nums.length; i++) { 
		// 遍历i之前的所有元素，寻找能接在nums[j]后面的情况 
		for (let j = 0; j < i; j++) { 
		// 满足递增：nums[j] < nums[i]，则dp[i]可更新为dp[j]+1 
			if (nums[j] < nums[i]) { 
				dp[i] = Math.max(dp[i], dp[j] + 1); 
			} 
		} 
		// 更新全局最长长度 
		maxLen = Math.max(maxLen, dp[i]); 
	} 
	return maxLen; 
};
```

---

### 152. 乘积最大子数组 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/maximum-product-subarray/)

**💡 思路**：同时维护以当前位置结尾的最大和最小乘积（因为负数可能翻转大小关系）。

```javascript
function maxProduct(nums) {
  let maxProd = nums[0];
  let minProd = nums[0];
  let result = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    const candidates = [nums[i], maxProd * nums[i], minProd * nums[i]];
    maxProd = Math.max(...candidates);
    minProd = Math.min(...candidates);
    result = Math.max(result, maxProd);
  }
  
  return result;
}
```

---

### 416. 分割等和子集 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/partition-equal-subset-sum/)

**💡 思路**：0-1 背包，目标容量为总和的一半，dp[j] 表示能否恰好凑出和为 j。

```javascript
function canPartition(nums) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum % 2 !== 0) return false;
  
  const target = sum / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  
  for (const num of nums) {
    for (let j = target; j >= num; j--) {
      dp[j] = dp[j] || dp[j - num];
    }
  }
  
  return dp[target];
}
```

---

### 32. 最长有效括号 (Hard)

🔗 [LeetCode 链接](https://leetcode.cn/problems/longest-valid-parentheses/)

**💡 思路**：用栈存索引，栈底始终保留最后一个未匹配右括号的位置，用于计算有效长度。

```javascript
function longestValidParentheses(s) {
  const stack = [-1];
  let maxLen = 0;
  
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i);
      } else {
        maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
      }
    }
  }
  
  return maxLen;
}
```

---

## 十六、多维动态规划

### 62. 不同路径 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/unique-paths/)

**💡 思路**：dp[i][j] = dp[i-1][j] + dp[i][j-1]，可优化为一维数组，每个位置累加左边的值。

```javascript
function uniquePaths(m, n) {
  const dp = new Array(n).fill(1);
  
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] += dp[j - 1];
    }
  }
  
  return dp[n - 1];
}
```

---

### 64. 最小路径和 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/minimum-path-sum/)

**💡 思路**：dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])，可原地修改节省空间。

```javascript
function minPathSum(grid) {
  const m = grid.length, n = grid[0].length;
  
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (i === 0 && j === 0) continue;
      else if (i === 0) grid[i][j] += grid[i][j - 1];
      else if (j === 0) grid[i][j] += grid[i - 1][j];
      else grid[i][j] += Math.min(grid[i - 1][j], grid[i][j - 1]);
    }
  }
  
  return grid[m - 1][n - 1];
}
```

---

### 5. 最长回文子串 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/longest-palindromic-substring/)

**💡 思路**：中心扩展法，枚举每个位置作为中心向两边扩展，分别处理奇偶长度的回文。

```javascript
function longestPalindrome(s) {
  let start = 0, maxLen = 0;
  
  const expand = (left, right) => {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      if (right - left + 1 > maxLen) {
        start = left;
        maxLen = right - left + 1;
      }
      left--;
      right++;
    }
  };
  
  for (let i = 0; i < s.length; i++) {
    expand(i, i);     // 奇数长度
    expand(i, i + 1); // 偶数长度
  }
  
  return s.substring(start, start + maxLen);
}
```

---

### 1143. 最长公共子序列 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/longest-common-subsequence/)

**💡 思路**：dp[i][j] 表示 text1 前 i 个和 text2 前 j 个字符的 LCS 长度，相等则 +1，否则取较大值。

```javascript
function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = new Array(m + 1).fill(0).map(() => new Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}
```

---

### 72. 编辑距离 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/edit-distance/)

**💡 思路**：dp[i][j] 表示 word1 前 i 个变成 word2 前 j 个的最少操作，相等则不操作，否则取插入/删除/替换的最小值 +1。

```javascript
function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = new Array(m + 1).fill(0).map(() => new Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}
```

---

## 十七、技巧

### 136. 只出现一次的数字 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/single-number/)

**💡 思路**：异或运算，相同的数异或为 0，0 异或任何数为该数本身，所有数异或结果即为单独的数。

```javascript
function singleNumber(nums) {
  return nums.reduce((a, b) => a ^ b, 0);
}
```

---

### 169. 多数元素 (Easy)

🔗 [LeetCode 链接](https://leetcode.cn/problems/majority-element/)

**💡 思路**：摩尔投票法，维护候选人和计数，相同则 +1，不同则 -1，归零时换候选人。

```javascript
function majorityElement(nums) {
  let candidate = nums[0];
  let count = 1;
  
  for (let i = 1; i < nums.length; i++) {
    if (count === 0) {
      candidate = nums[i];
      count = 1;
    } else if (nums[i] === candidate) {
      count++;
    } else {
      count--;
    }
  }
  
  return candidate;
}
```

---

### 75. 颜色分类 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/sort-colors/)

**💡 思路**：荷兰国旗问题，三指针分别指向 0 区末尾、当前位置、2 区开头，根据当前值交换。

```javascript
function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
}
```

---

### 31. 下一个排列 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/next-permutation/)

**💡 思路**：从右向左找第一个递减的数，与其右侧第一个更大的数交换，然后反转其右侧部分。

```javascript
function nextPermutation(nums) {
  let i = nums.length - 2;
  
  // 从右向左找第一个递减的位置
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;
  
  if (i >= 0) {
    // 从右向左找第一个大于 nums[i] 的数
    let j = nums.length - 1;
    while (nums[j] <= nums[i]) j--;
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  
  // 反转 i+1 之后的部分
  let left = i + 1, right = nums.length - 1;
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
    left++;
    right--;
  }
}
```

---

### 287. 寻找重复数 (Medium)

🔗 [LeetCode 链接](https://leetcode.cn/problems/find-the-duplicate-number/)

**💡 思路**：快慢指针（Floyd 判圈），将数组看作链表（值为 next 指针），找环的入口即为重复数。

```javascript
function findDuplicate(nums) {
  let slow = nums[0];
  let fast = nums[0];
  
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  
  slow = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  
  return slow;
}
```

---

## 题目分类速查

### 按难度

| 难度 | 数量 | 代表题目 |
|------|:----:|----------|
| Easy | ~20 | 两数之和、反转链表、二叉树最大深度 |
| Medium | ~65 | 三数之和、LRU 缓存、最长递增子序列 |
| Hard | ~15 | 接雨水、合并 K 个链表、N 皇后 |

### 按知识点

| 知识点 | 题号 |
|--------|------|
| 哈希表 | 1, 49, 128 |
| 双指针 | 11, 15, 42, 283 |
| 滑动窗口 | 3, 76, 239, 438 |
| 链表 | 2, 19, 21, 23, 25, 141, 142, 146, 148, 160, 206, 234 |
| 二叉树 | 94, 98, 101, 102, 104, 105, 114, 124, 199, 226, 230, 236, 437, 543 |
| 动态规划 | 5, 32, 62, 64, 70, 72, 118, 139, 152, 198, 279, 300, 322, 416, 1143 |
| 回溯 | 17, 22, 39, 46, 51, 78, 79, 131 |
| 二分查找 | 4, 33, 34, 35, 74, 153 |

---

#LeetCode #算法 #数据结构 #JavaScript #面试
