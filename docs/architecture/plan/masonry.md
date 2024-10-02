# 瀑布流虚拟列表实践

瀑布流布局的核心实现思想：

- 控制容器内每一列卡片的宽度相同（不同图片尺寸等比例缩放）。
- 第一行卡片紧挨着排列，第二行开始采取贪心思想，每张卡片摆放到当前所有列中高度最小的一列下面。

一般情况下瀑布流布局后端返回的数据不止有图片的链接还有图片的宽高信息。有了这些信息前端使用时无需再单独获取图片元素就能够快速计算卡片缩放后的宽高以及后续的位置信息。但如果后端没有返回这些信息只给了图片链接那就只能全部交给前端来处理，因为图片尺寸信息在瀑布流实现中是必须要获取到的，这里就需要用到图片预加载技术。假设如果有很多图片，那么就必须要保证所有图片全部加载完毕获取到尺寸信息后才能开始瀑布流布局流程，如果一旦有一张图片加载失败就会导致瀑布流布局出现问题。好处就是用户看到的图片是直接从缓存进行加载的速度很快，坏处就是刚开始等待所有图片加载会很慢，而如果后端返回图片尺寸信息我们就无需考虑图片是否加载完成，直接根据其尺寸信息先进行布局，之后利用图片懒加载技术即可，所以真实业务场景肯定还是后端携带信息更好。

## 瀑布流布局

1. 确定列数和列宽：根据容器的宽度和每个项目的最小宽度来确定列数和列宽。通过计算容器宽度和项目最小宽度的比例，确定合适的列数。每列的宽度则根据容器宽度和列数以及列间距进行计算。
2. 初始化列的高度：为每一列维护一个高度数组，初始值为0。这个数组用于记录每一列的当前高度，以便在放置项目时选择最短的列。
3. 计算项目的位置：遍历项目列表，为每个项目计算其在瀑布流中的位置。具体步骤包括选择当前高度最短的列，将项目放置在该列中，计算项目的x坐标和y坐标，并更新该列的高度。
4. 动态更新布局：为了确保瀑布流布局能够自适应屏幕宽度，需要监听容器尺寸的变化。使用 ResizeObserver 可以更高效地检测容器尺寸变化，并及时更新布局。当容器尺寸发生变化时，重新计算列数和列宽，并更新项目的布局。
5. 渲染项目：使用绝对定位将每个项目放置在计算好的位置上，确保每个项目都能正确显示在瀑布流布局中。

```js
import React, { useState, useEffect, useRef } from 'react';

const Waterfall = ({ items, gap }) => {
  const containerRef = useRef(null); // 创建一个引用，用于保存容器元素

  const [columnCount, setColumnCount] = useState(3); // 初始列数
  const [columnHeights, setColumnHeights] = useState(new Array(columnCount).fill(0)); // 每列的高度数组
  const [itemPositions, setItemPositions] = useState([]); // 项目的位置信息

  // 监听容器尺寸变化，更新布局
  useEffect(() => {
    const updateLayout = () => {
      const containerWidth = containerRef.current.offsetWidth; // 获取容器宽度
      const newColumnCount = Math.max(1, Math.floor(containerWidth / 200)); // 计算新的列数，每个项目的最小宽度为200px
      setColumnCount(newColumnCount);

      const columnWidth = (containerWidth - (newColumnCount - 1) * gap) / newColumnCount; // 计算每列的宽度

      const positions = items.map((item, index) => {
        const columnIndex = getShortestColumnIndex(columnHeights); // 获取最短列的索引
        const x = columnIndex * (columnWidth + gap); // 计算项目的 x 坐标
        const y = columnHeights[columnIndex]; // 计算项目的 y 坐标

        columnHeights[columnIndex] += item.height + gap; // 更新最短列的高度

        return {
          ...item,
          x,
          y,
          width: columnWidth,
        };
      });

      setItemPositions(positions);
    };

    updateLayout();

    const resizeObserver = new ResizeObserver(updateLayout);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [items, gap, columnHeights]);

  // 获取最短列的索引
  const getShortestColumnIndex = (heights) => {
    let minIndex = 0; // 最短列索引
    let minHeight = heights[0]; // 最短列高度

    for (let i = 1; i < heights.length; i++) {
      if (heights[i] < minHeight) {
        minIndex = i;
        minHeight = heights[i];
      }
    }

    return minIndex;
  };

  // 渲染组件
  return (
    <div ref={containerRef} className="waterfall-container">
      {itemPositions.map((item, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height,
            backgroundColor: 'lightblue',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};

export default Waterfall;


// 示例
import React from 'react';
import Waterfall from './Waterfall';
import './Waterfall.css';

// 应用组件
const App = () => {
  const items = [
    { content: 'Item 1', height: 200 },
    { content: 'Item 2', height: 150 },
    { content: 'Item 3', height: 250 },
    { content: 'Item 4', height: 180 },
    { content: 'Item 5', height: 220 },
    { content: 'Item 6', height: 170 },
    { content: 'Item 7', height: 230 },
    { content: 'Item 8', height: 190 },
  ]; // 示例项目列表

  return (
    <div className="App">
      <Waterfall items={items} gap={20} />
    </div>
  );
};

export default App;
```

## 瀑布流虚拟列表

### 贪心算法实现

```js
import React, { useEffect, useMemo, useRef, useState } from 'react';

const FsVirtualWaterfall = (props) => {
  const containerRef = useRef(null); // 容器引用

  // 管理数据加载的状态
  const [dataState, setDataState] = useState({
    loading: false, // 是否正在加载
    isFinish: false, // 是否已加载完所有数据
    currentPage: 1, // 当前页码
    list: [] // 项目列表
  });

  // 管理滚动状态
  const [scrollState, setScrollState] = useState({
    viewWidth: 0, // 视口宽度
    viewHeight: 0, // 视口高度
    start: 0 // 滚动起始位置
  });

  // 管理列队列的状态
  const [queueState, setQueueState] = useState({
    queue: new Array(props.column).fill(0).map(() => ({ list: [], height: 0 })),
    len: 0 // 当前项目的总数
  });

  // 管理瀑布流容器的高度
  const [listStyle, setListStyle] = useState({});

  // 计算每个项目的尺寸信息
  const itemSizeInfo = useMemo(() => {
    return dataState.list.reduce((pre, current) => {
      const itemWidth = Math.floor((scrollState.viewWidth - (props.column - 1) * props.gap) / props.column);
      pre.set(current.id, {
        width: itemWidth,
        height: Math.floor((itemWidth * current.height) / current.width)
      });
      return pre;
    }, new Map());
  }, [dataState.list, scrollState.viewWidth, props.column, props.gap]);

  // 当项目尺寸信息更新时，将项目添加到队列中
  useEffect(() => {
    if (itemSizeInfo.size) {
      addInQueue();
    }
  }, [itemSizeInfo]);

  // 计算滚动结束位置
  const end = useMemo(() => scrollState.viewHeight + scrollState.start, [scrollState]);

  // 将所有列的项目合并成一个数组
  const cardList = useMemo(
    () => queueState.queue.reduce((pre, { list }) => pre.concat(list), []),
    [queueState]
  );

  // 过滤出当前视口内的项目
  const renderList = useMemo(
    () => cardList.filter((i) => i.h + i.y > scrollState.start && i.y < end),
    [cardList, end, scrollState.start]
  );

  // 计算当前最短列的索引和高度
  const computedHeight = () => {
    let minIndex = 0;
    let minHeight = Infinity;
    let maxHeight = -Infinity;
    queueState.queue.forEach(({ height }, index) => {
      if (height < minHeight) {
        minHeight = height;
        minIndex = index;
      }
      if (height > maxHeight) {
        maxHeight = height;
      }
    });
    setListStyle({ height: `${maxHeight}px` }); // 更新瀑布流容器的高度
    return { minIndex, minHeight };
  };

  // 将项目添加到最短列中
  const addInQueue = (size = props.pageSize) => {
    const queue = queueState.queue;
    let len = queueState.len;
    for (let i = 0; i < size; i++) {
      const minIndex = computedHeight().minIndex; // 获取最短列的索引
      const currentColumn = queue[minIndex]; // 获取最短列
      const before = currentColumn.list[currentColumn.list.length - 1] || null; // 获取最短列的最后一个项目
      const dataItem = dataState.list[len]; // 获取当前项目
      if (!dataItem) break; // 如果没有更多项目，退出循环
      const item = generatorItem(dataItem, before, minIndex); // 生成项目的信息
      currentColumn.list.push(item); // 将项目添加到最短列
      currentColumn.height += item.h; // 更新最短列的高度
      len++;
    }
    setQueueState({ queue: [...queue], len }); // 更新队列状态
  };

  // 生成项目的信息
  const generatorItem = (item, before, index) => {
    const rect = itemSizeInfo.get(item.id); // 获取项目的尺寸信息
    const width = rect.width;
    const height = rect.height;
    let y = 0;
    if (before) y = before.y + before.h + props.gap; // 计算项目的y坐标
    return {
      item,
      y,
      h: height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate3d(${index === 0 ? 0 : (width + props.gap) * index}px, ${y}px, 0)` // 设置项目的绝对定位
      }
    };
  };

  // 异步加载数据
  const loadDataList = async () => {
    if (dataState.isFinish) return; // 如果已加载完所有数据，退出
    setDataState({ ...dataState, loading: true }); // 设置加载状态
    const list = await props.request(dataState.currentPage++, props.pageSize); // 请求数据
    if (!list.length) {
      setDataState({ ...dataState, isFinish: true }); // 如果没有更多数据，设置加载完成状态
      return;
    }
    setDataState({ ...dataState, list: [...dataState.list, ...list], loading: false }); // 更新项目列表和加载状态
  };

  // 处理滚动事件
  const handleScroll = rafThrottle(() => {
    const { scrollTop, clientHeight } = containerRef.current; // 获取容器的滚动位置和高度
    setScrollState({ ...scrollState, start: scrollTop }); // 更新滚动状态
    if (scrollTop + clientHeight > computedHeight().minHeight) {
      if (!dataState.loading) {
        loadDataList(); // 如果滚动到底部且未加载数据，加载更多数据
      }
    }
  });

  // 初始化滚动状态
  const initScrollState = () => {
    setScrollState({
      viewWidth: containerRef.current.clientWidth,
      viewHeight: containerRef.current.clientHeight,
      start: containerRef.current.scrollTop
    });
  };

  // 初始化组件，设置初始滚动状态并加载数据
  const init = async () => {
    initScrollState();
    await loadDataList();
  };

  // 在组件挂载时初始化
  useEffect(() => {
    init();
  }, []);

  // 渲染组件
  return (
    <div className="w-full h-full overflow-y-scroll overflow-x-hidden" ref={containerRef} onScroll={handleScroll}>
      <div className="relative w-full" style={listStyle}>
        {renderList.map(({ item, style }) => (
          <div className="absolute top-0 left-0 box-border" key={item.id} style={style}>
            {props.children(item)} {/* 渲染项目内容 */}
          </div>
        ))}
      </div>
    </div>
  );
};

// 请求节流函数，使用 requestAnimationFrame 进行节流
const rafThrottle = (fn) => {
  let isPending = false;
  return () => {
    if (!isPending) {
      isPending = true;
      requestAnimationFrame(() => {
        fn();
        isPending = false;
      });
    }
  };
};

export default FsVirtualWaterfall;
```

贪心算法实现思路：

1. 初始化状态
   - 数据状态：管理数据加载的状态，包括是否正在加载、是否已加载完、当前页码和项目列表。
   - 滚动状态：管理滚动状态，包括视口宽度、视口高度和滚动起始位置。
   - 列队列状态：管理列队列的状态，包括每列的项目列表和高度，以及当前项目的总数。
   - 瀑布流容器高度：管理瀑布流容器的高度。
2. 计算项目尺寸

- 项目尺寸计算：根据屏幕宽度和项目原始尺寸，计算每个项目的实际宽度和高度。这一步是通过 useMemo 钩子来完成的，确保在项目列表或屏幕宽度变化时重新计算。

3. 动态布局

- 放置项目：遍历项目列表，将每个项目放置在当前高度最小的列中。这是通过 addInQueue 函数实现的，每次放置项目后都会更新该列的高度。
- 计算最短列：使用 computedHeight 函数计算当前高度最小的列的索引和高度，确保项目能够均匀分布。

4. 虚拟化渲染

- 过滤项目：根据当前滚动位置，过滤出当前视口内的项目。这是通过 renderList 计算得出的。
- 渲染项目：使用 map 遍历过滤后的项目列表，生成每个项目的 DOM 元素，并设置其样式。

5. 滚动加载

- 滚动事件处理：监听滚动事件，当滚动到底部时加载更多数据。这是通过 handleScroll 函数实现的，使用 requestAnimationFrame 进行节流处理，避免频繁的计算和渲染操作。
- 初始化滚动状态：在组件挂载时初始化滚动状态，设置初始滚动位置和视口大小

### 动态规划实现

```js
import React, { useEffect, useMemo, useRef, useState } from 'react';

const FsVirtualWaterfall = (props) => {
  const containerRef = useRef(null); // 容器引用

  // 管理数据加载的状态
  const [dataState, setDataState] = useState({
    loading: false, // 是否正在加载
    isFinish: false, // 是否已加载完所有数据
    currentPage: 1, // 当前页码
    list: [] // 项目列表
  });

  // 管理滚动状态
  const [scrollState, setScrollState] = useState({
    viewWidth: 0, // 视口宽度
    viewHeight: 0, // 视口高度
    start: 0 // 滚动起始位置
  });

  // 管理列队列的状态
  const [queueState, setQueueState] = useState({
    queue: new Array(props.column).fill(0).map(() => ({ list: [], height: 0 })),
    len: 0 // 当前项目的总数
  });

  // 管理瀑布流容器的高度
  const [listStyle, setListStyle] = useState({});

  // 计算每个项目的尺寸信息
  const itemSizeInfo = useMemo(() => {
    return dataState.list.reduce((pre, current) => {
      const itemWidth = Math.floor((scrollState.viewWidth - (props.column - 1) * props.gap) / props.column);
      pre.set(current.id, {
        width: itemWidth,
        height: Math.floor((itemWidth * current.height) / current.width)
      });
      return pre;
    }, new Map());
  }, [dataState.list, scrollState.viewWidth, props.column, props.gap]);

  // 当项目尺寸信息更新时，将项目添加到队列中
  useEffect(() => {
    if (itemSizeInfo.size) {
      addInQueue();
    }
  }, [itemSizeInfo]);

  // 计算滚动结束位置
  const end = useMemo(() => scrollState.viewHeight + scrollState.start, [scrollState]);

  // 将所有列的项目合并成一个数组
  const cardList = useMemo(
    () => queueState.queue.reduce((pre, { list }) => pre.concat(list), []),
    [queueState]
  );

  // 过滤出当前视口内的项目
  const renderList = useMemo(
    () => cardList.filter((i) => i.h + i.y > scrollState.start && i.y < end),
    [cardList, end, scrollState.start]
  );

  // 动态规划算法，计算每个项目的最佳放置位置
  const dynamicProgramming = (items, columns) => {
    const dp = Array.from({ length: items.length + 1 }, () => Array(columns).fill(0)); // 动态规划表
    const path = Array.from({ length: items.length + 1 }, () => Array(columns).fill(0)); // 回溯路径

    for (let i = 1; i <= items.length; i++) {
      const item = items[i - 1];
      const rect = itemSizeInfo.get(item.id);
      const height = rect.height;

      for (let j = 0; j < columns; j++) {
        let minHeight = Infinity;
        let bestColumn = -1;

        for (let k = 0; k < columns; k++) {
          const newHeight = dp[i - 1][k] + (k === j ? height : 0);
          if (newHeight < minHeight) {
            minHeight = newHeight;
            bestColumn = k;
          }
        }

        dp[i][j] = minHeight;
        path[i][j] = bestColumn;
      }
    }

    let result = [];
    let currentColumn = 0;
    for (let i = items.length; i > 0; i--) {
      const item = items[i - 1];
      const rect = itemSizeInfo.get(item.id);
      const height = rect.height;
      const y = dp[i - 1][currentColumn];
      result.push({
        item,
        y,
        h: height,
        style: {
          width: `${rect.width}px`,
          height: `${height}px`,
          transform: `translate3d(${currentColumn === 0 ? 0 : (rect.width + props.gap) * currentColumn}px, ${y}px, 0)`
        }
      });
      currentColumn = path[i][currentColumn];
    }

    return result.reverse();
  };

  // 将项目添加到队列中
  const addInQueue = (size = props.pageSize) => {
    const items = dataState.list.slice(queueState.len, queueState.len + size);
    const newItems = dynamicProgramming(items, props.column);
    const newQueue = new Array(props.column).fill(0).map(() => ({ list: [], height: 0 }));

    newItems.forEach(item => {
      const index = Math.floor((item.style.transform.match(/\d+/g) || [0])[0] / (item.style.width + props.gap));
      newQueue[index].list.push(item);
      newQueue[index].height += item.h;
    });

    setQueueState({
      queue: queueState.queue.map((col, index) => ({
        list: [...col.list, ...newQueue[index].list],
        height: col.height + newQueue[index].height
      })),
      len: queueState.len + size
    });

    const maxHeight = Math.max(...queueState.queue.map(col => col.height));
    setListStyle({ height: `${maxHeight}px` });
  };

  // 异步加载数据
  const loadDataList = async () => {
    if (dataState.isFinish) return; // 如果已加载完所有数据，退出
    setDataState({ ...dataState, loading: true }); // 设置加载状态
    const list = await props.request(dataState.currentPage++, props.pageSize); // 请求数据
    if (!list.length) {
      setDataState({ ...dataState, isFinish: true }); // 如果没有更多数据，设置加载完成状态
      return;
    }
    setDataState({ ...dataState, list: [...dataState.list, ...list], loading: false }); // 更新项目列表和加载状态
  };

  // 处理滚动事件
  const handleScroll = rafThrottle(() => {
    const { scrollTop, clientHeight } = containerRef.current; // 获取容器的滚动位置和高度
    setScrollState({ ...scrollState, start: scrollTop }); // 更新滚动状态
    if (scrollTop + clientHeight > queueState.queue.reduce((max, col) => Math.max(max, col.height), 0)) {
      if (!dataState.loading) {
        loadDataList(); // 如果滚动到底部且未加载数据，加载更多数据
      }
    }
  });

  // 初始化滚动状态
  const initScrollState = () => {
    setScrollState({
      viewWidth: containerRef.current.clientWidth,
      viewHeight: containerRef.current.clientHeight,
      start: containerRef.current.scrollTop
    });
  };

  // 初始化组件，设置初始滚动状态并加载数据
  const init = async () => {
    initScrollState();
    await loadDataList();
  };

  // 在组件挂载时初始化
  useEffect(() => {
    init();
  }, []);

  // 渲染组件
  return (
    <div className="w-full h-full overflow-y-scroll overflow-x-hidden" ref={containerRef} onScroll={handleScroll}>
      <div className="relative w-full" style={listStyle}>
        {renderList.map(({ item, style }) => (
          <div className="absolute top-0 left-0 box-border" key={item.id} style={style}>
            {props.children(item)} {/* 渲染项目内容 */}
          </div>
        ))}
      </div>
    </div>
  );
};

// 请求节流函数，使用 requestAnimationFrame 进行节流
const rafThrottle = (fn) => {
  let isPending = false;
  return () => {
    if (!isPending) {
      isPending = true;
      requestAnimationFrame(() => {
        fn();
        isPending = false;
      });
    }
  };
};

export default FsVirtualWaterfall;
```

1. 初始化状态
   - 数据状态：与贪心算法相同，管理数据加载的状态。
   - 滚动状态：与贪心算法相同，管理滚动状态。
   - 列队列状态：与贪心算法相同，管理列队列的状态。
   - 瀑布流容器高度：与贪心算法相同，管理瀑布流容器的高度。
2. 计算项目尺寸
   - 项目尺寸计算：与贪心算法相同，根据屏幕宽度和项目原始尺寸，计算每个项目的实际宽度和高度。
3. 动态规划
   - 动态规划表：创建一个二维数组 dp，表示每个项目在每个列中的最小高度。同时创建一个二维数组 path，记录每个项目的最佳放置位置。
   - 填充动态规划表：遍历项目列表，对于每个项目，计算其在每个列中的最小高度，并记录最佳放置位置。
   - 回溯路径：从最后一个项目开始，回溯路径，确定每个项目的最佳放置位置。这是通过 dynamicProgramming 函数实现的。
4. 更新列高度
   - 放置项目：根据最佳放置位置，将项目添加到相应的列中，并更新列的高度。这是通过 addInQueue 函数实现的。
5. 虚拟化渲染
   - 过滤项目：与贪心算法相同，根据当前滚动位置，过滤出当前视口内的项目。
   - 渲染项目：与贪心算法相同，使用 map 遍历过滤后的项目列表，生成每个项目的 DOM 元素，并设置其样式。
6. 滚动加载
   - 滚动事件处理：与贪心算法相同，监听滚动事件，当滚动到底部时加载更多数据。
   - 初始化滚动状态：与贪心算法相同，在组件挂载时初始化滚动状态。

[瀑布流虚拟列表实现](https://juejin.cn/post/7327971289743278121)

[用动态规划写瀑布流布局](https://juejin.cn/post/6844904178544820237?searchId=202410011732100C7FE802C17BEEC25380)

[更整齐的瀑布流算法](https://mp.weixin.qq.com/s/Sw4_ROo9sDuDcxE-g8_bFA)
