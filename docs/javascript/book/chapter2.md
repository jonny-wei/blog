# 第2章 HTML 中的 JavaScript

## `<script>`元素

- 通过`<script>`元素将javascript代码插入html中。
- `<script>`的8个属性：async，charset(少用，忽略)，crossorigin，defer，integrity，language(废弃)，src，type(代替language)。
- 浏览器按`<script>`元素在页面出现的位置顺序执行，前提是未指定 async、defer。

async：立即下载脚本，不阻止其他页面动作(如不阻止其他页面下载资源)或等待其他脚本执行。只对外部脚本有效。立即下载，异步执行，不保证顺序执行，不必等脚本下载完再加载页面或加载其他脚本，异步脚本不应该在加载期间修改DOM，异步脚本会保证在页面 load 事件之前执行，但可能在 DOMContentLoaded 之前或之后。

defer：延迟到文档完全被解析和显示之后再执行，只对外部脚本有效。推迟执行脚本，脚本执行不改变页面结构。立即下载，但延迟顺序执行，且都在 DOMContentLoaded 事件之前执行(实际中不一定)。

动态加载脚本：通过 DOM API 动态向 DOM 中添加 script 元素，加载指定脚本，异步执行，相当于添加了async，但不是所有浏览器都支持 async。