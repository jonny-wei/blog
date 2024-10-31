# 快速 Diff 算法

**简单 Diff 算法**：核心逻辑是拿新的一组子节点中的节点去旧的一组子节点中寻找可复用的节点。如果找到了，则记录该节点的位置索引。我们把这个位置索引称为最大索引。在整个更新过程中，如果一个节点的索引值小于最大索引，则说明该节点对应的真实 DOM 元素需要移动。其中主要利用虚拟节点的 key 属性（它就像虚拟节的身份证号），尽可能地复用 DOM 元素，并通过移动 DOM 的方式来完成更新，从而减少不断地创建和销毁 DOM 元素带来的性能开销。但简单 Diff 算法的问题在于，它对 DOM 的移动操作并不是最优的。

**双端 Diff 算法**：在简单 Diff 算法基础上，在新旧两组子节点的四个端点之间分别进行比较，并试图找到可复用的节点。相比简单 Diff 算法，双端 Diff 算法的优势在于，对于同样的更新场景，执行的 DOM 移动操作次数更少，提高了移动操作效率。

**快速 Diff 算法**：该算法最早应用于 ivi 和 inferno 这两个框架，Vue.js 3 借鉴并扩展了它，性能稍优于 Vue.js 2 所采用的双端 Diff 算法。在双端 Diff 算法的基础上做了一下预处理，减少不必要的 Diff。

## 相同的前置和后置节点

不同于简单 Diff 算法和双端 Diff 算法，快速 Diff 算法包含预处理步骤，这其实是借鉴了纯文本 Diff 算法的思路：

```js
function patchKeyedChildren(n1, n2, container) {
  const newChildren = n2.children;
  const oldChildren = n1.children;

  // 初始化索引
  let j = 0; // 前置节点开始索引
  let oldEnd = oldChildren.length - 1; // 旧子节点结束索引
  let newEnd = newChildren.length - 1; // 新子节点结束索引

  // 1. 更新相同的前置节点
  let oldVNode = oldChildren[j];
  let newVNode = newChildren[j];

  // 向前遍历，直到遇到不同 key 的节点
  while (oldVNode.key === newVNode.key && j <= oldEnd && j <= newEnd) {
    patch(oldVNode, newVNode, container); // 对相同 key 的节点进行更新
    j++;
    oldVNode = oldChildren[j];
    newVNode = newChildren[j];
  }

  // 2. 更新相同的后置节点
  oldVNode = oldChildren[oldEnd];
  newVNode = newChildren[newEnd];

  // 向后遍历，直到遇到不同 key 的节点
  while (oldVNode.key === newVNode.key && oldEnd >= j && newEnd >= j) {
    patch(oldVNode, newVNode, container); // 对相同 key 的节点进行更新
    oldEnd--;
    newEnd--;
    oldVNode = oldChildren[oldEnd];
    newVNode = newChildren[newEnd];
  }

  // 3. 如果新节点多于旧节点，插入新的节点
  if (j > oldEnd && j <= newEnd) {
    const anchorIndex = newEnd + 1;
    const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null;
    // 插入新的节点到容器中
    while (j <= newEnd) {
      patch(null, newChildren[j++], container, anchor);
    }
  }
  // 4. 如果旧节点多于新节点，卸载多余的旧节点
  else if (j > newEnd && j <= oldEnd) {
    while (j <= oldEnd) {
      unmount(oldChildren[j++]);
    }
  }
}

// 这里假设 patch 和 unmount 函数已经定义好
// patch 用于更新或创建节点
// unmount 用于卸载节点
function patch(oldVNode, newVNode, container, anchor) {
  // 实现细节省略
}

function unmount(vnode) {
  // 实现细节省略
}
```

1. **相同的前置节点预处理**：使用 while 循环查找所有相同的前置节点，并调用 `patch` 函数进行打补丁，直到遇到 `key` 值不同的节点为止。这样，我们就完成了对前置节点的更新。

2. **相同的后置节点预处理**：由于新旧两组子节点的数量可能不同，所以我们需要两个索引 `newEnd` 和 `oldEnd`，分别指向新旧两组子节点中的最后一个节点，然后再开启一个 `while` 循环，并从后向前遍历这两组子节点，直到遇到 key 值不同的节点为止，完成相同后置节点的处理。

当相同的前置节点和后置节点被处理完毕后，有可能存在新增的节点，也有可能存在需要删除的节点，如何判断呢？这需要我们观察三个索引 `j`、`newEnd` 和 `oldEnd` 之间的关系。

- 当 `oldEnd < j` 成立：说明在预处理过程中，所有旧子节点都处理完毕了。
- 当 `newEnd >= j` 成立：说明在预处理过后，在新的一组子节点中，仍然有未被处理的节点，而这些遗留的节点将被视作新增节点。

3. **如果新节点多于旧节点，插入新的节点**：当 `j > oldEnd && j <= newEnd` 成立，说明在新的一组子节点中，存在遗留节点，且这些节点都是新增节点。在新的一组子节点中，索引值处于 `j` 和 `newEnd` 之间的任何节点都需要作为新的子节点进行挂载。那么，应该怎样将这些节点挂载到正确位置呢？这就要求我们必须找到正确的锚点元素。

   - 首先计算锚点的索引值（即 `anchorIndex`）为 `newEnd + 1`。如果小于新的一组子节点的数量，则说明锚点元素在新的一组子节点中，所以直接使用 `newChildren[anchorIndex].el` 作为锚点元素；
   - 否则说明索引 `newEnd` 对应的节点已经是尾部节点了，这时无须提供锚点元素。有了锚点元素之后，我们开启了一个 `while` 循环，用来遍历索引 `j` 和索引 `newEnd` 之间的节点，并调用 `patch` 函数挂载它们。

4. **如果旧节点多于新节点，卸载多余的旧节点**: 当 `j > newEnd && j <= oldEnd` 成立，说明索引 `j` 和索引 `oldEnd` 之间的任何节点都应该被卸载。需要开启一个 `while` 循环，并调用 `unmount` 函数逐个卸载这些遗留节点.

## 进行 DOM 移动

当处理完相同的前置节点或后置节点后，新旧两组子节点中总会有一组子节点全部被处理完毕。在这种情况下，只需要简单地挂载、卸载节点即可。但有时情况会比较复杂，仅有少量相同的前置节点和后置节点，经过预处理后，无论是新的一组子节点，还是旧的一组子节点，都有部分节点未经处理，无论是双端 Diff 还是快速 Diff，需要进一步处理：

- 判断是否有节点需要移动，以及应该如何移动
- 找出那些需要被添加或移除的节点

```js
function patchKeyedChildren(n1, n2, container) {
  const newChildren = n2.children;
  const oldChildren = n1.children;

  // 初始化索引
  let j = 0; // 前置节点开始索引
  let oldEnd = oldChildren.length - 1; // 旧子节点结束索引
  let newEnd = newChildren.length - 1; // 新子节点结束索引

  // 1. 更新相同的前置节点
  let oldVNode = oldChildren[j];
  let newVNode = newChildren[j];

  // 向前遍历，直到遇到不同 key 的节点
  while (oldVNode.key === newVNode.key && j <= oldEnd && j <= newEnd) {
    patch(oldVNode, newVNode, container); // 对相同 key 的节点进行更新
    j++;
    oldVNode = oldChildren[j];
    newVNode = newChildren[j];
  }

  // 2. 更新相同的后置节点
  oldVNode = oldChildren[oldEnd];
  newVNode = newChildren[newEnd];

  // 向后遍历，直到遇到不同 key 的节点
  while (oldVNode.key === newVNode.key && oldEnd >= j && newEnd >= j) {
    patch(oldVNode, newVNode, container); // 对相同 key 的节点进行更新
    oldEnd--;
    newEnd--;
    oldVNode = oldChildren[oldEnd];
    newVNode = newChildren[newEnd];
  }

  // 3. 如果新节点多于旧节点，插入新的节点
  if (j > oldEnd && j <= newEnd) {
    const anchorIndex = newEnd + 1;
    const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null;
    // 插入新的节点到容器中
    while (j <= newEnd) {
      patch(null, newChildren[j++], container, anchor);
    }
  }
  // 4. 如果旧节点多于新节点，卸载多余的旧节点
  else if (j > newEnd && j <= oldEnd) {
    while (j <= oldEnd) {
      unmount(oldChildren[j++]);
    }
  }
  // 5. 处理中间部分节点
  else {
    // 构造 source 数组
    const count = newEnd - j + 1; // 需要处理的新节点数量
    const source = new Array(count).fill(-1); // 初始化 source 数组，用于记录新节点的位置映射

    const oldStart = j;
    const newStart = j;
    let moved = false; // 标记是否有节点被移动
    let pos = 0; // 记录最大位置
    const keyIndex = {}; // 用于存储新节点 key 到索引的映射

    for (let i = newStart; i <= newEnd; i++) {
      keyIndex[newChildren[i].key] = i; // 建立 key 到索引的映射
    }

    // 新增 patched 变量，代表更新过的节点数量
    let patched = 0;
    for (let i = oldStart; i <= oldEnd; i++) {
      oldVNode = oldChildren[i];
      // 如果更新过的节点数量小于等于需要更新的节点数量，则执行更新
      if (patched <= count) {
        const k = keyIndex[oldVNode.key]; // 查找旧节点在新节点中的位置
        if (typeof k !== 'undefined') {
          newVNode = newChildren[k];
          patch(oldVNode, newVNode, container); // 对相同 key 的节点进行更新
          // 每更新一个节点，都将 patched 变量 +1
          patched++;
          source[k - newStart] = i; // 记录旧节点在新节点数组中的位置
          if (k < pos) { // 如果当前位置小于之前的最大位置，说明有节点被移动
            moved = true;
          } else {
            pos = k; // 更新最大位置
          }
        } else {
          // 没找到对应的新节点，卸载旧节点
          unmount(oldVNode);
        }
      } else {
        // 如果更新过的节点数量大于需要更新的节点数量，则卸载多余的节点
        unmount(oldVNode);
      }
    }

    // 6. 如果有节点被移动，执行移动操作
    if (moved) {
      // 使用最长递增子序列算法优化移动操作
      const seq = lis(source);
      // s 指向最长递增子序列的最后一个元素
      let s = seq.length - 1; 
      for (let i = count - 1; i >= 0; i--) {
        if (source[i] === -1) {
          // 没有对应的旧节点，直接插入新节点
          const nextPos = i + newStart;
          const anchor = nextPos + 1 < newChildren.length ? newChildren[nextPos + 1].el : null;
          patch(null, newChildren[nextPos], container, anchor);
        } else if (s < 0 || i !== seq[s]) {
          // 需要移动的节点，如果节点的索引 i 不等于 seq[s] 的值，说明该节点需要移动
          const nextPos = i + newStart;
          const posInOld = source[i];
          const currentVNode = oldChildren[posInOld];
          const nextAnchor = nextPos + 1 < newChildren.length ? newChildren[nextPos + 1].el : null;
          container.insertBefore(currentVNode.el, nextAnchor);
        } else {
          // 当 i === seq[s] 时，说明该位置的节点不需要移动，只需 s 指向下一个位置
          s--;
        }
      }
    }
  }
}

// 最长递增子序列算法
function lis(arr) {
  // p 数组用于记录每个元素在 LIS 中的前驱元素的索引
  const p = arr.slice();
  // result 数组用于存储 LIS 的索引
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;

  // 遍历输入数组
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    // 跳过值为 0 的元素（在 diff 算法中，0 表示没有对应的旧节点）
    if (arrI !== 0) {
      // 获取当前 LIS 的最后一个元素的索引
      j = result[result.length - 1];
      // 如果当前元素大于 LIS 的最后一个元素，则将其添加到 LIS 的末尾
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      // 使用二分查找找到当前元素应该插入的位置
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = ((u + v) / 2) | 0; // 位运算取整，相当于 Math.floor((u + v) / 2)
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      // 如果当前元素小于 LIS 中的某个元素，则替换该元素
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }

  // 重构 LIS 序列
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }

  return result;
}

// 这里假设 patch 和 unmount 函数已经定义好
// patch 用于更新或创建节点
// unmount 用于卸载节点
function patch(oldVNode, newVNode, container, anchor) {
  // 实现细节省略
}

function unmount(vnode) {
  // 实现细节省略
}
```

- lis 函数：实现了**最长递增子序列算法**，用于优化节点的移动操作，减少不必要的移动。
- source 数组：用于**记录新节点在旧节点数组中的位置映射**，帮助判断哪些节点需要移动。该数组的长度等于新的一组子节点去掉相同的前置/后置节点后，剩余未处理节点的数量。source 数组中存储着新的一组子节点中的节点在旧的一组子节点中的位置，后面我们会根据 source 数组计算出一个最长递增子序列，用于 DOM 移动操作。
- moved 标记：用于标记**是否有节点被移动**，如果有则执行移动操作。
- pos 变量：记录遍历过程中遇到的**最大位置**，用于判断节点是否被移动。表遍历旧的一组子节点的过程中遇到的最大索引值 k。通过比较变量 k 与变量 pos 的值来判断是否需要移动节点。
- patched 变量：**记录已经更新的节点数量**，确保不会超出需要处理的新节点数量。已经更新过的节点数量应该小于新的一组子节点中需要更新的节点数量。一旦前者超过后者，则说明有多余的节点，我们应该将它们卸载。
- 移动操作：如果 moved 为 true，则使用 lis 算法计算出需要移动的节点，并执行相应的移动操作。

5. **找出需要移动的节点(可复用节点)**：第一个 for 循环用来**构建索引表，**索引表存储的是节点的 `key` 值与节点在新的一组子节点中位置索引之间的映射，第二个 for 循环用来**遍历旧的一组子节点**。可以看到，我们拿旧子节点的 `key` 值去索引表 `keyIndex` 中查找该节点在新的一组子节点中的位置，并将查找结果存储到变量 `k` 中。
   - **如果 `k` 存在，说明该节点是可复用的**，所以我们调用 `patch` 函数进行打补丁，并填充 `source` 数组；
   - 否则说明该节点已经不存在于新的一组子节点中了，这时我们需要调用 `unmount` 函数卸载它。
述流程执行完毕后，`source` 数组已经填充完毕了。接下来我们应该思考的是，如何判断节点是否需要移动。实际上，快速Diff 算法判断节点是否需要移动的方法与简单 Diff 算法类似

1. **移动复用的节点**: 首先要根据 source 数组计算出它的最长递增子序列。其实，最长递增子序列 seq 拥有一个非常重要的意义。例如子序列 seq 的值为 [0, 1]​，它的含义是：在新的一组子节点中，重新编号后索引值为 0 和 1 的这两个节点在更新前后顺序没有发生变化。

::: tip 最长递增子序列
给定一个数值序列，找到它的一个子序列，并且该子序列中的值是递增的，子序列中的元素在原序列中不一定连续。一个序列可能有很多个递增子序列，其中最长的那一个就称为最长递增子序列。举个例子，假设给定数值序列 [ 0, 8, 4, 12 ]​，那么它的最长递增子序列就是 [0, 8,12]​。当然，对于同一个数值序列来说，它的最长递增子序列可能有多个，例如 [0, 4, 12]。
:::

## 总结

快速 Diff 算法在实测中性能最优。它借鉴了文本 Diff 中的预处理思路，先处理新旧两组子节点中相同的前置节点和相同的后置节点。当前置节点和后置节点全部处理完毕后，如果无法简单地通过挂载新节点或者卸载已经不存在的节点来完成更新，则需要根据节点的索引关系，构造出一个最长递增子序列。最长递增子序列所指向的节点即为不需要移动的节点。

![vue3-diff](/blog/images/vue/vue3-diff.png)

::: warning 参考文献
[vue3.0 diff算法详解](https://zhuanlan.zhihu.com/p/150103393)
:::
