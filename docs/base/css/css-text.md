# 文本溢出

## 解决方案

### 单行文本

```css
.text {
  overflow: hidden;           // 溢出隐藏
  text-overflow: ellipsis;    // 溢出用省略号显示
  white-space: nowrap;        // 规定段落中的文本不进行换行
}
```

- overflow: hidden（文字长度超出限定宽度，则隐藏超出的内容）
- white-space: nowrap（设置文字在一行显示，不能换行）
- text-overflow: ellipsis（规定当文本溢出时，显示省略符号来代表被修剪的文本）

### 多行文本（css）

```css
.text {
  overflow: hidden;            // 溢出隐藏
  text-overflow: ellipsis;     // 溢出用省略号显示
  display:-webkit-box;         // 作为弹性伸缩盒子模型显示。
  -webkit-line-clamp:3;        // 显示的行数
  -webkit-box-orient:vertical; // 设置伸缩盒子的子元素排列方式：从上到下垂直排列
}

// 加省略号
.mulLineTruncate {
  position: relative;
  max-height: 40px;
  overflow: hidden;
  line-height: 20px;
  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 0 20px 0 10px;
    content: "...";
  }
}
```

- -webkit-line-clamp: 2（用来限制在一个块元素显示的文本的行数, 2 表示最多显示 2 行。 为了实现该效果，它需要组合其他的 WebKit 属性）
- display: -webkit-box（和 1 结合使用，将对象作为弹性伸缩盒子模型显示 ）
- -webkit-box-orient: vertical（和 1 结合使用 ，设置或检索伸缩盒对象的子元素的排列方式 ）
- overflow: hidden（文本溢出限定的宽度就隐藏内容）
- text-overflow: ellipsis（多行文本的情况下，用省略号“…”隐藏溢出范围的文本)

### 多行文本（js）

- 监听 DOM 尺寸变化
- 判断是否溢出 scrollHeight > offsetHeight
- 二分查找多行截取字符临界值（算法的解法：判断字符串是否溢出，二分查找字符串溢出临界子串，控制...显示）

[巧用二分查找实现多行文本溢出显示省略号](https://jelly.jd.com/article/5fbcdff7cff6b301458364e9)

[【译】在 CSS 中处理长短文本](https://jelly.jd.com/article/5fe967d16c8ad2014c3f081e)

[如何实现单行／多行文本溢出的省略样式？](https://mp.weixin.qq.com/s/69DhD8cUliuZZZl5tml5yA)
