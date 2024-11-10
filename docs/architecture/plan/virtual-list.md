# 虚拟滚动与懒加载

虚拟列表是一种用于优化长列表性能的技术，适用于需要展示大量数据的场景。在传统的方法中，如果一次性渲染所有列表项，将会消耗大量的内存资源，可能导致页面加载缓慢、卡顿等问题，严重影响用户体验。虚拟列表的核心思想：

- **只渲染可见区域**：虚拟列表的核心在于仅渲染当前屏幕可见区域内的列表项，对于不可见的列表项（即超出当前视口范围的列表项），则不进行渲染或者延迟渲染。
- **滚动时动态加载**：当用户滚动列表时，虚拟列表会动态计算哪些列表项进入了视口范围，并及时渲染这些项；同时，将那些已经滚动出视口的列表项卸载或复用，以减少内存占用。

虚拟列表根据列表容器的可视范围，动态计算出在可视范围内的列表节点 item，然后只渲染视野边界内容的 item，通过控制页面节点数避免内存线性增加。无论时定高还是不定高均需要确定可是范围内元素的高度。

![virtual1](/blog/images/architecture/virtual1.png)

## 定高的虚拟列表

定高的虚拟列表，滚动列表中子元素高度相等，只渲染固定个数的元素。一个视口高度是固定的，子元素的高度也是固定的，我们可以算出一个视口中渲染元素的个数。计算当前视口内可见的列表项第一个可见元素和最后一个可见元素的索引。

对于定高的虚拟滚动，计算和渲染相对简单，只需要根据已知的 itemHeight 和滚动位置动态计算可见区域的起始和结束索引。由于每个项的高度相同，所有项所占的空间是可预测的，因此只需要通过容器的高度和滚动位置来快速计算出需要渲染的项。

对于定高的列表项，虚拟滚动的核心在于通过计算当前可视区域（即容器的高度）能够渲染哪些项，然后只渲染这些项，避免一次性渲染所有的 DOM 元素。

**步骤：**

1. **计算可视区域**：
   - 首先，我们需要知道每个列表项的固定高度 `itemHeight`，以及容器的高度 `containerHeight`。通过这两个值，我们可以计算出容器内能显示多少个项。

2. **计算当前滚动位置**：
   - 获取滚动容器的当前滚动位置 `scrollTop`。当用户滚动时，我们需要根据 `scrollTop` 来计算当前可视区域的起始项和结束项。

3. **计算可见项范围**：
   - 通过 `scrollTop` 和 `containerHeight`，我们可以计算出可见区域的索引范围。假设 `itemHeight = 50px`，`containerHeight = 500px`，那么可见区域内可以显示 `500px / 50px = 10` 个项。

   具体计算方法：
   - **起始索引**：`startIndex = Math.floor(scrollTop / itemHeight)`
   - **结束索引**：`endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight))`

4. **渲染可见项**：
   - 根据计算出的 `startIndex` 和 `endIndex`，从原始数据中选出当前可视区域内的项进行渲染。

5. **占位空间**：
   - 虽然我们只渲染部分项，但容器的高度必须等于所有项的总高度，以确保滚动条的长度和位置是正确的。即：
     - **容器的总高度** = `items.length * itemHeight`
   - 在虚拟滚动的实现中，我们使用一个容器元素来充当占位符，使得即使某些项没有渲染，它们所占的空间仍然存在。

简单代码示例

```jsx
import React, { useState, useRef, useEffect } from 'react';

const VirtualScroll = ({ items, itemHeight, loadMore }) => {
  const containerRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState([]);

  // 计算可见项的范围
  const calculateVisibleItems = () => {
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight));

    setVisibleItems(items.slice(startIndex, endIndex));
  };

  // 监听滚动事件
  const handleScroll = () => {
    calculateVisibleItems();

    // 当滚动到底部时加载更多
    const container = containerRef.current;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
      loadMore();
    }
  };

  useEffect(() => {
    calculateVisibleItems();
  }, [items]);

  return (
    <div
      ref={containerRef}
      style={{ height: '500px', overflowY: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight }}>
        {visibleItems.map((item, index) => (
          <div key={index} style={{ height: itemHeight }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualScroll;
```

较完整的实现：

```jsx
const VirtualList = (Component) => ({
  list,
  onRequest,
  onRefresh,
  itemHeight,
  containerHeight,
  bufferCount,
  offset,
  bottomThreshold = 100, // 默认底部阈值
  topThreshold = 50, // 默认顶部阈值
  ...props
}) => {
  // 状态变量，用于存储当前视口内第一个和最后一个可见的列表项的索引
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0); // 当前的偏移量

  // 引用列表容器
  const containerRef = useRef(null);

  // 计算当前视口内可见的列表项索引
  const calculateIndices = useCallback(() => {
    if (!containerRef.current) return; // 如果容器未挂载，直接返回

    const scrollTop = containerRef.current.scrollTop; // 获取当前滚动位置
    const visibleStartIndex = Math.floor((scrollTop - offset) / itemHeight); // 计算第一个可见项的索引，考虑偏移量
    const visibleEndIndex = visibleStartIndex + Math.ceil(containerHeight / itemHeight) + bufferCount; // 计算最后一个可见项的索引，加上缓冲数量

    setStartIndex(visibleStartIndex); // 更新第一个可见项的索引
    setEndIndex(visibleEndIndex); // 更新最后一个可见项的索引
    setCurrentOffset(scrollTop - (scrollTop % itemHeight)); // 更新当前的偏移量
  }, [itemHeight, containerHeight, bufferCount, offset]);

  // 监听滚动事件，当滚动时重新计算可见项索引
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(calculateIndices); // 使用 requestAnimationFrame 确保滚动事件处理在下一帧执行

      // 检测是否滚动到底部
      if (containerRef.current.scrollTop + containerRef.current.clientHeight >= containerRef.current.scrollHeight - bottomThreshold) {
        onRequest?.(); // 加载更多数据
      }

      // 检测是否滚动到顶部
      if (containerRef.current.scrollTop <= topThreshold) {
        onRefresh?.(); // 刷新数据
      }
    };

    containerRef.current?.addEventListener('scroll', handleScroll); // 添加滚动事件监听器
    return () => {
      containerRef.current?.removeEventListener('scroll', handleScroll); // 清除滚动事件监听器
    };
  }, [calculateIndices, onRequest, onRefresh, bottomThreshold, topThreshold]);

  // 初始渲染时计算可见项索引
  useEffect(() => {
    calculateIndices();
  }, [list, itemHeight, containerHeight, bufferCount, offset, calculateIndices]);

  // 渲染虚拟列表
  return (
    <div className="virtual-list-container" ref={containerRef} style={{ height: containerHeight, overflowY: 'auto' }}>
      {/* 占位，列表的总高度，用于生成滚动条 */}
      <div style={{ height: list.length * itemHeight }}>
        {/* 渲染区域 */}
        <div style={{ transform: `translate3d(0, ${currentOffset}px, 0)`, position: 'relative' }}>
          {list.slice(startIndex, endIndex).map((item) => (
            <div key={item} className="list-item" style={{ height: itemHeight }}>
              {/* 子组件 */}
              <Component id={item} {...props} />
            </div>
          ))}
        </div>
      </div>
      {list.length > 0 && <div className="loading-indicator">加载更多...</div>}
    </div>
  );
};

export default React.memo(VirtualList);


// App.js
import React, { useState, useEffect } from 'react';
import VirtualList from './VirtualList';
import ListItem from './ListItem';

const App = () => {
  const [list, setList] = useState(Array.from({ length: 100 }, (_, i) => i));
  const [loading, setLoading] = useState(false);

  const onRequest = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setList((prevList) => [
        ...prevList,
        ...Array.from({ length: 100 }, (_, i) => prevList.length + i),
      ]);
      setLoading(false);
    }, 1000);
  };

  const onRefresh = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setList((prevList) => Array.from({ length: 100 }, (_, i) => i));
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <h1>Virtual List Example</h1>
      <VirtualList
        Component={ListItem}
        list={list}
        onRequest={onRequest}
        onRefresh={onRefresh}
        itemHeight={65}
        containerHeight="500px"
        bufferCount={6}
        offset={0}
        bottomThreshold={100}
        topThreshold={50}
      />
    </div>
  );
};

export default App;
```

- startIndex 和 endIndex：这两个状态变量分别表示当前视口内第一个和最后一个可见的列表项的索引。
- containerRef：用于引用列表容器，以便获取其滚动位置及监听容器的滚动事件。
- calculateIndices：计算当前视口内可见的列表项第一个可见元素和最后一个可见元素的索引。使用 `Math.ceil(containerHeight / itemHeight) + 1`，加 1 是为了提供一些缓冲区，防止滚动时出现空白。
- loadMore: 无限滚动加载更多。
  - `containerRef.current.scrollTop`: 容器当前的滚动距离，即从顶部到当前滚动位置的距离
  - `containerRef.current.clientHeight`: 容器的可视区域高度，即用户当前能看到的部分的高度
  - `containerRef.current.scrollHeight`: 容器的总高度，包括了所有内容的高度，即使这些内容超出了可视区域
  - `containerRef.current.scrollTop + containerRef.current.clientHeight`：用户当前滚动到的位置加上可视区域的高度，即用户当前能看到的最底部的位置。
  - `containerRef.current.scrollHeight - 100`: 容器的总高度减去一个阈值（这里是100像素）。这个阈值是为了提前加载更多数据，避免用户滚动到底部时出现空白或延迟。

定高虚拟滚动列表的核心实现思路：通过只渲染当前视口内可见的列表项来减少 DOM 节点的数量，提高性能。首先，确定每个列表项的高度是固定的，这样可以准确计算每个列表项的位置和大小。接着，通过监听滚动事件，计算当前视口内第一个和最后一个可见的列表项的索引，并动态渲染这些可见项，使用 CSS 的 transform: translate3d 属性来移动列表项，利用硬件加速提高滚动性能。同时，通过设置缓冲区，提前加载即将进入视口的列表项，避免滚动时出现空白区域。此外，处理滚动到底部和顶部时，分别触发加载更多数据和刷新数据的回调函数，实现无限加载和刷新功能。这种机制能够高效地处理大量数据，提供流畅的滚动体验，同时保持较低的内存和 CPU 占用。

## 不定高的虚拟列表

不定高的虚拟列表，滚动列表中子元素高度都随机且不相等。例如，某些项可能包含较长的文本或图片，导致它们的高度不同。与定高列表项的实现相比，不定高的虚拟滚动需要在每次渲染时动态计算每个项的实际高度，并根据这些动态高度计算哪些项需要渲染。

**步骤：**

1. **获取每个项的高度**：
   - 对于不定高的项，首先需要获取每个项的实际高度。在初次渲染时，所有项的高度是未知的，因此需要通过测量 DOM 元素的 `offsetHeight` 来获取每个项的高度。

2. **计算可视区域**：
   - 获取容器的滚动位置 `scrollTop` 和容器的高度 `containerHeight`。
   - 由于每个项的高度不同，我们需要遍历所有项并动态累加它们的高度，直到我们找到哪些项是可见的。

3. **动态计算可见项范围**：
   - 从第一个项开始，逐项计算每个项的高度并累计，直到找到当前可视区域的起始和结束项。
   - 计算公式类似：
     - **起始索引**：`startIndex = Math.floor(scrollTop / height)`（逐项累加）
     - **结束索引**：`endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / height))`

4. **渲染可见项**：
   - 使用上述的动态计算方法来渲染当前可视区域内的项。

5. **占位空间**：
   - 因为每个项的高度不同，我们无法直接预设容器的高度。可以通过累加所有项的高度来得出容器的总高度，并根据已知的高度在滚动时调整渲染内容。

简单代码示例：

```jsx
import React, { useState, useRef, useEffect } from 'react';

const VirtualScroll = ({ items, loadMore }) => {
  const containerRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState([]);
  const [itemHeights, setItemHeights] = useState([]);

  // 计算每个项的实际高度
  const calculateItemHeights = () => {
    const heights = [];
    items.forEach((_, index) => {
      const item = document.getElementById(`item-${index}`);
      heights.push(item ? item.offsetHeight : 0);
    });
    setItemHeights(heights);
  };

  // 计算可见项的范围
  const calculateVisibleItems = () => {
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    let start = 0;
    let end = 0;
    let currentHeight = 0;

    // 从第一个项开始，计算哪些项是可见的
    for (let i

 = 0; i < items.length; i++) {
      currentHeight += itemHeights[i];
      if (currentHeight >= scrollTop && start === 0) {
        start = i;
      }
      if (currentHeight >= scrollTop + containerHeight) {
        end = i;
        break;
      }
    }

    setVisibleItems(items.slice(start, end));
  };

  // 监听滚动事件
  const handleScroll = () => {
    calculateVisibleItems();

    // 当滚动到底部时加载更多
    const container = containerRef.current;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
      loadMore();
    }
  };

  useEffect(() => {
    // 初次加载时计算每项高度
    calculateItemHeights();
  }, [items]);

  useEffect(() => {
    // 监听滚动事件
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [itemHeights]);

  return (
    <div
      ref={containerRef}
      style={{ height: '500px', overflowY: 'auto' }}
    >
      <div style={{ height: itemHeights.reduce((acc, height) => acc + height, 0) }}>
        {visibleItems.map((item, index) => (
          <div
            key={index}
            id={`item-${index}`}
            style={{ marginBottom: '10px' }} // 可选的间距
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualScroll;
```

- 预测每个元素的高度。定高的虚拟列表实现要求用户传入固定的 item 高度，而现在我们不需要传入固定值，只需传入预测的 item 高度，而这里的高度值是有一定要求的：需要保证预测的 item 高度尽量比真实的每一项 item 的高度要小或者接近所有 item 高度的平均值。我们内部需要根据预测的 item 高度来计算整个虚拟列表的最大容量，假设如果你的预测 item 高度过大，就会出现真实 item 渲染到视图上时出现留白的情况。而如果预测高度比真实 item 高度都要小，那就能保证预测计算出的最大容量一定会大于真实 item 渲染视图列表的最大容量，这样就不会出现留白的情况。当然也不能过小，具体需要看真实 items 的高度情况，如果出现最小 item 和 最大 item 相差较大那也会造成最大容纳量设置过大的问题。恰当的设置是所有 item 高度的平均值，这样计算更符合真实渲染，如果无法拿捏就设置一个最小值。
- 存储元素位置信息。如何计算出列表的高度和滚动偏移量？考虑之前定高的实现我们可以直接用 `数据源长度 * 元素高度`，但现在元素高度不固定，那肯定就需要我们手动获取 DOM 信息再计算，我们可以直接通过 list DOM 来获取高度，但是偏移量怎么办？滚动时的偏移量根据每滚动出去一项然后进行计算的，如果单单只获取 list 高度好像并不能解决这个问题
因此将引入一个新的变量：`positions`，它用来存储每个元素的信息。

```jsx
const VirtualList = ({ items, estimatedHeight, containerHeight, onLoadMore, onRefresh }) => {
  // 状态变量，用于存储当前视口内第一个和最后一个可见的列表项的索引
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [listHeight, setListHeight] = useState(0); // 列表的总高度
  const [positions, setPositions] = useState([]); // 每个列表项的位置信息

  // 引用列表容器和列表内容
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // 计算当前视口内可见的列表项索引
  const calculateIndices = useCallback(() => {
    if (!containerRef.current) return; // 如果容器未挂载，直接返回

    const scrollTop = containerRef.current.scrollTop; // 获取当前滚动位置
    const visibleStartIndex = binarySearch(positions, scrollTop); // 计算第一个可见项的索引
    const visibleEndIndex = visibleStartIndex + Math.ceil(containerHeight / estimatedHeight) + 1; // 计算最后一个可见项的索引，加上缓冲数量

    setStartIndex(visibleStartIndex); // 更新第一个可见项的索引
    setEndIndex(Math.min(items.length, visibleEndIndex)); // 更新最后一个可见项的索引
  }, [containerHeight, estimatedHeight, items, positions]);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    requestAnimationFrame(() => { // 使用 requestAnimationFrame 确保滚动事件处理在下一帧执行
      calculateIndices(); // 重新计算可见项索引

      const { scrollTop, clientHeight, scrollHeight } = containerRef.current; // 获取容器的滚动位置和尺寸
      const bottom = scrollHeight - clientHeight - scrollTop; // 计算距离底部的距离

      if (bottom <= 20) {
        onLoadMore?.(); // 滚动到底部时，加载更多数据
      }

      if (scrollTop <= 50) {
        onRefresh?.(); // 滚动到顶部时，刷新数据
      }
    });
  }, [calculateIndices, onLoadMore, onRefresh]);

  // 监听滚动事件
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll); // 添加滚动事件监听器
      return () => {
        containerRef.current.removeEventListener('scroll', handleScroll); // 清除滚动事件监听器
      };
    }
  }, [handleScroll]);

  // 初始化位置信息
  useEffect(() => {
    if (items.length) {
      initPositions(); // 初始化每个列表项的位置信息
    }
  }, [items]);

  // 更新位置信息
  useEffect(() => {
    if (listRef.current) {
      updatePositions(); // 更新每个列表项的真实高度和位置
    }
  }, [startIndex, items]);

  // 初始化每个列表项的位置信息
  const initPositions = () => {
    const newPositions = items.map((item, index) => ({
      index: item.id,
      height: estimatedHeight, // 预估高度
      top: index * estimatedHeight, // 顶部位置
      bottom: (index + 1) * estimatedHeight, // 底部位置
      dHeight: 0, // 高度差
    }));
    setPositions(newPositions); // 更新位置信息
    setListHeight(newPositions[newPositions.length - 1].bottom); // 更新列表的总高度
  };

  // 更新每个列表项的真实高度和位置
  const updatePositions = () => {
    const nodes = listRef.current.children; // 获取所有渲染的列表项
    if (!nodes || !nodes.length) return; // 如果没有渲染的列表项，直接返回

    const newPositions = positions.map((pos) => ({ ...pos })); // 深拷贝位置信息

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const rect = node.getBoundingClientRect(); // 获取列表项的实际位置和尺寸
      const item = newPositions[+node.id]; // 获取对应的位置信息
      const dHeight = item.height - rect.height; // 计算高度差

      if (dHeight) {
        item.height = rect.height; // 更新高度
        item.bottom = item.bottom - dHeight; // 更新底部位置
        item.dHeight = dHeight; // 更新高度差
      }
    }

    const startId = +nodes[0].id; // 获取第一个可见项的ID
    const len = newPositions.length; // 总列表项数量
    let startHeight = newPositions[startId].dHeight; // 第一个可见项的高度差
    newPositions[startId].dHeight = 0; // 重置高度差

    for (let i = startId + 1; i < len; i++) {
      const item = newPositions[i];
      item.top = newPositions[i - 1].bottom; // 更新顶部位置
      item.bottom = item.bottom - startHeight; // 更新底部位置

      if (item.dHeight !== 0) {
        startHeight += item.dHeight; // 累加高度差
        item.dHeight = 0; // 重置高度差
      }
    }

    setPositions(newPositions); // 更新位置信息
    setListHeight(newPositions[len - 1].bottom); // 更新列表的总高度
  };

  // 二分查找算法，用于计算当前滚动位置下的第一个可见项索引
  const binarySearch = (list, value) => {
    let left = 0;
    let right = list.length - 1;
    let templateIndex = -1;

    while (left < right) {
      const midIndex = Math.floor((left + right) / 2);
      const midValue = list[midIndex].bottom;

      if (midValue === value) return midIndex + 1;
      else if (midValue < value) left = midIndex + 1;
      else if (midValue > value) {
        if (templateIndex === -1 || templateIndex > midIndex) templateIndex = midIndex;
        right = midIndex;
      }
    }

    return templateIndex;
  };

  // 渲染虚拟列表
  return (
    <div className="virtual-list-container" ref={containerRef} style={{ height: containerHeight, overflowY: 'auto' }}>
      <div className="virtual-list" ref={listRef} style={{ height: listHeight }}>
        {items.slice(startIndex, endIndex).map((item) => (
          <div key={item.id} id={item.id} className="list-item" style={{ height: positions[item.id]?.height }}>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(VirtualList);

// 示例
import React, { useState, useEffect } from 'react';
import VirtualList from './VirtualList';
import './App.css';

const App = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 加载更多数据
  const onLoadMore = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      const newData = Array.from({ length: 20 }).map((_, i) => ({
        id: items.length + i,
        content: `Item ${items.length + i} - ${Math.random().toString(36).substring(7)}`
      }));
      setItems([...items, ...newData]);
      setLoading(false);
    }, 1000);
  };

  // 刷新数据
  const onRefresh = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      const newData = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        content: `Item ${i} - ${Math.random().toString(36).substring(7)}`
      }));
      setItems(newData);
      setLoading(false);
    }, 1000);
  };

  // 初始加载数据
  useEffect(() => {
    onLoadMore();
  }, []);

  return (
    <div className="app-container">
      <h1>Virtual List Example</h1>
      <VirtualList
        items={items}
        estimatedHeight={120}
        containerHeight="500px"
        onLoadMore={onLoadMore}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default App;
```

核心实现思路：虚拟滚动列表通过只渲染当前视口内可见的列表项来减少DOM节点的数量，从而显著提高性能。首先，在组件初始化时，根据传入的数据列表，计算每个列表项的预估高度、顶部位置和底部位置，这些信息存储在一个数组中，每个元素包含列表项的索引、高度、顶部位置、底部位置和高度差。通过监听滚动事件，获取当前容器的滚动位置，使用二分查找算法，根据滚动位置计算当前视口内第一个和最后一个可见的列表项的索引，二分查找算法能够高效地找到这些索引，避免了线性搜索的性能开销。根据计算出的可见项索引，从数据列表中提取出当前视口内的列表项进行渲染，只渲染这些可见项，而不是全部列表项，减少了DOM节点的数量，提高了渲染性能。在列表项渲染完成后，获取每个列表项的实际高度，并更新位置信息中的高度和位置，如果实际高度与预估高度不同，调整后续列表项的位置，确保列表的布局正确。使用requestAnimationFrame确保滚动事件处理在下一帧执行，避免过度渲染，在滚动事件处理中，重新计算可见项索引，并更新DOM，同时，检测是否滚动到底部或顶部，分别调用加载更多数据和刷新数据的回调函数。当用户滚动到底部时，触发加载更多数据的回调函数，动态增加数据列表，并重新计算位置信息，当用户滚动到顶部时，触发刷新数据的回调函数，更新数据列表，并重新初始化位置信息。通过上述步骤，实现了高性能的虚拟滚动列表，支持不定高、元素高度动态、上拉刷新和下拉无限滚动功能，这种机制能够高效地处理大量数据，提供流畅的滚动体验，同时保持较低的内存和CPU占用。

## 图片懒加载

图片在页面加载时不会立刻加载，而是等到图片进入视口（即用户可以看到的页面区域）时才开始加载。可以大幅提高页面加载性能，尤其是在有大量图片时，避免一次性加载所有图片导致页面卡顿。使用现代的 `Intersection Observer API` 或 `loading="lazy"` 属性实现懒加载，能够显著提升页面渲染性能和用户体验。

- 占位符：当页面加载时，所有图片的 src 属性指向一个占位符图像（比如一个 1x1 的透明像素图或模糊图）。这样，页面的初始加载速度就不会因为图片加载而受到影响。
- 图片加载：当图片进入浏览器视口（用户可见区域）时，JavaScript 会通过监听视口变化（如滚动事件或 Intersection Observer）来触发真实图片的加载。图片的 src 会被更新为实际图片的 URL，然后开始加载。
- 视口检测：通过 JavaScript 来监听页面滚动或使用现代浏览器的 Intersection Observer API，判断图片是否出现在视口内。一旦图片出现在视口内，才加载图片内容。

### 原理

实现步骤：

1. 给所有图片添加 data-src 属性来保存图片的真实路径。
2. 使用 Intersection Observer 监听图片是否进入视口。
3. 一旦图片进入视口，使用 data-src 属性设置真实的 src，从而加载图片。

```js
<img data-src="large-image.jpg" alt="Lazy Loaded Image" class="lazy-load" />

// 监听所有懒加载图片
const images = document.querySelectorAll('img.lazy-load');

const lazyLoad = (image) => {
  const realSrc = image.getAttribute('data-src');
  image.setAttribute('src', realSrc); // 加载真实图片
  image.onload = () => image.classList.add('loaded'); // 图片加载完成后的处理
};

// 使用 IntersectionObserver API
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      lazyLoad(entry.target);
      observer.unobserve(entry.target); // 一旦加载完成，停止观察该元素
    }
  });
}, {
  rootMargin: '0px 0px 200px 0px', // 提前加载，提前200px开始加载
});

images.forEach(image => observer.observe(image));
```

### 优化

图片懒加载可以显著提升页面加载性能，尤其是当页面中有大量图片时，通过延迟加载图片来减少页面初始加载的资源消耗，提升用户体验。然而，懒加载的实现和优化不仅仅是延迟加载，还涉及到图片压缩、格式选择、视觉体验等多个方面。以下是一些 **图片懒加载的优化技巧**，帮助提升页面的加载效率和用户体验。

#### 图片格式优化

使用合适的图片格式可以有效减少图片的大小，提高加载速度。

- **WebP 格式**：WebP 是一种较新的图像格式，提供了较高的压缩率，质量优于 JPEG 和 PNG。它比 JPEG 能减少 25-35% 的文件大小，同时提供较好的图像质量。尤其在网页图像中，WebP 是理想的选择。
  
  示例：使用 `srcset` 属性根据不同的设备支持 WebP 格式：

  ```html
  <img 
    src="image.jpg" 
    srcset="image.webp 1x, image-2x.webp 2x" 
    alt="Optimized Image"
  />
  ```

- **适应不同分辨率**：使用 `srcset` 和 `sizes` 属性可以根据不同的屏幕分辨率和设备特性加载不同分辨率的图片。这样可以确保高分辨率屏幕（如 Retina 屏幕）加载高质量图片，而低分辨率设备加载低质量图片。

  ```html
  <img 
    src="image.jpg" 
    srcset="image-320w.jpg 320w, image-800w.jpg 800w, image-1200w.jpg 1200w" 
    sizes="(max-width: 600px) 320px, (max-width: 1200px) 800px, 1200px" 
    alt="Responsive Image"
  />
  ```

#### 使用占位符

懒加载时，使用占位符（例如透明图像或模糊图像）可以避免页面出现布局闪烁或空白区域，提升用户体验。

- **透明占位符**：一个 1x1 像素的透明图像（如 `data:image/png;base64` 格式）可以作为占位符，直到图片加载完成后才用真实的图片替换。

  ```html
  <img 
    data-src="real-image.jpg" 
    src="data:image/png;base64,..." 
    class="lazy-load" 
    alt="Lazy Loaded Image" 
  />
  ```

- **模糊占位符**：加载时，先显示一个模糊的低质量图片，等到图片加载完成后替换成清晰图像。这种效果可以通过 CSS 的 `filter: blur()` 来实现，或者使用低质量的图片作为占位符（LQIP，Low-Quality Image Placeholder）。

  ```html
  <img 
    data-src="real-image.jpg" 
    src="low-quality-image.jpg" 
    class="lazy-load" 
    alt="Lazy Loaded Image" 
    style="filter: blur(10px);" 
  />
  ```

#### 优化 `rootMargin` 和加载时机

`Intersection Observer` API 中的 `rootMargin` 属性允许提前加载图片，避免图片在用户滚动到它们时才开始加载，从而减少加载延迟。

- **提前加载**：通过 `rootMargin` 属性来提前加载图片，使图片在接近视口时就开始加载，而不是等到完全进入视口。

  ```javascript
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute('data-src');
        observer.unobserve(img); // 停止观察
      }
    });
  }, {
    rootMargin: '200px 0px', // 提前 200px 加载图片
  });

  const images = document.querySelectorAll('img.lazy-load');
  images.forEach(image => observer.observe(image));
  ```

- **合适的提前加载范围**：合理设置 `rootMargin` 值，可以避免图片在接近可视区域时才开始加载，提前加载可以提高用户体验，避免图片加载时的空白。

#### 使用 `loading="lazy"` 属性

HTML 中的 `loading="lazy"` 是一种原生支持的懒加载方式，只需要在 `<img>` 标签上加上这个属性，浏览器会自动处理懒加载。虽然这是一种简单的实现方式，但其缺点是并不支持旧版本浏览器。因此，对于较为简单的场景，可以考虑使用该属性。

```html
<img src="large-image.jpg" alt="Lazy Loaded Image" loading="lazy" />
```

- **支持情况**：`loading="lazy"` 已经得到了 Chrome、Firefox 和 Edge 的支持，但 IE 和 Safari 不支持该属性。如果需要兼容不支持的浏览器，可以通过 JavaScript 结合 `Intersection Observer` 实现懒加载。

#### 减少 DOM 操作

懒加载过程中，频繁的 DOM 操作可能会导致性能下降。使用 `Intersection Observer` 或 `requestAnimationFrame` 来优化图片的加载过程。

- **避免每次滚动都更新 DOM**：避免使用 `scroll` 事件来实时检测图片位置，因为这种方式会增加浏览器的计算量，可以通过 `requestAnimationFrame` 来减少每次滚动触发时的 DOM 操作次数。

```javascript
const lazyLoadImages = () => {
  // 将 DOM 更新操作放在 requestAnimationFrame 中
  requestAnimationFrame(() => {
    images.forEach(image => {
      const rect = image.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        lazyLoad(image); // 加载图片
      }
    });
  });
};

window.addEventListener('scroll', lazyLoadImages);
```

#### 图片尺寸优化

图片的尺寸是影响加载速度的一个重要因素。确保图片在加载时已设置合适的尺寸，以避免布局抖动和加载延迟。

- **设置图片尺寸**：在 HTML 中为图片设置明确的 `width` 和 `height` 属性，防止浏览器在加载时重新计算布局。

  ```html
  <img 
    src="real-image.jpg" 
    width="600" 
    height="400" 
    alt="Optimized Image"
  />
  ```

- **避免图片放大**：使用合适的图像尺寸，不要让小图像在大尺寸容器中拉伸。这不仅影响加载速度，还会影响显示效果。

#### 图片懒加载与 SEO

懒加载会影响 SEO，因为爬虫可能无法在页面加载时抓取懒加载的图片。为了避免这种问题，可以采取以下措施：

- **为懒加载图片设置 `alt` 属性**：确保每个懒加载图片都有 `alt` 属性，这样即使图片未加载，搜索引擎爬虫也能抓取到该图片的替代文本。
  
  ```html
  <img data-src="real-image.jpg" alt="Optimized Image" class="lazy-load" />
  ```

- **懒加载图片与站点内容的相关性**：如果图片对页面内容至关重要，可以考虑在图片加载之前将其提前渲染，或者使用 `noscript` 标签为不支持懒加载的浏览器提供常规的图片加载方式。

#### 使用懒加载与媒体查询结合

如果页面的内容或图片有响应式设计，可以结合 CSS 媒体查询优化图片懒加载，使其在不同设备和屏幕尺寸下都有良好的展示效果。

- **使用 `srcset` 和 `sizes` 配合懒加载**：在响应式布局中，结合 `srcset` 和 `sizes` 属性，以及懒加载，可以根据设备的屏幕大小和分辨率加载合适尺寸的图片。

  ```html
  <img 
    src="image.jpg" 
    srcset="image-320w.jpg 320w, image-800w.jpg 800w, image-1200w.jpg 1200w" 
    sizes="(max-width: 600px) 320px, (max-width: 1200px) 800px, 1200px" 
    data-src="real-image.jpg" 
    alt="Responsive Image" 
    class="lazy-load"
  />
  ```

图片懒加载的优化不仅仅是延迟加载图片，还涉及多个方面的综合考虑，包括图片格式、尺寸、占位符、浏览器支持、以及性能优化。通过合理的技术选择和优化，可以显著提高页面的加载速度和用户体验。在实现时，可以结合现代浏览器的 `Intersection Observer` API 和原生 `loading="lazy"` 属性，合理使用占位符和动态加载策略，以确保页面在各种设备和环境下都能流畅加载。

## 实现

```js
import React, { useState, useEffect, useRef } from 'react';

const LazyLoadImage = ({
  src,
  alt = '',
  placeholder = 'data:image/svg+xml;base64,...', // 可以是一个小的占位符图像
  width,
  height,
  srcSet,
  sizes,
  onLoad,
  onError,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  // 使用 Intersection Observer 来监听图片是否进入视口
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true); // 图片进入视口，开始加载
          observer.unobserve(entry.target); // 停止观察当前图片
        }
      },
      {
        rootMargin: '200px', // 提前加载图片，距离视口顶部200px时开始加载
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  // 图片加载完成后的回调
  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e); // 执行外部传入的 onLoad 回调
  };

  // 图片加载失败后的回调
  const handleError = (e) => {
    setIsLoaded(false);
    if (onError) onError(e); // 执行外部传入的 onError 回调
  };

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : placeholder} // 如果图片还没进入视口，则显示占位符
      srcSet={isVisible ? srcSet : undefined} // 延迟加载 srcSet
      sizes={isVisible ? sizes : undefined} // 延迟加载 sizes
      alt={alt}
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out', // 添加平滑过渡
        ...props.style,
      }}
    />
  );
};

export default LazyLoadImage;
```

```js
import React from 'react';
import LazyLoadImage from './LazyLoadImage';

const App = () => {
  const handleImageLoad = () => {
    console.log('Image loaded successfully!');
  };

  const handleImageError = () => {
    console.log('Error loading image!');
  };

  return (
    <div>
      <h1>React 图片懒加载示例</h1>
      <LazyLoadImage
        src="https://example.com/real-image.jpg"
        alt="Sample Image"
        placeholder="https://example.com/placeholder.jpg"
        width="600"
        height="400"
        onLoad={handleImageLoad}
        onError={handleImageError}
        srcSet="https://example.com/real-image-320w.jpg 320w, https://example.com/real-image-640w.jpg 640w"
        sizes="(max-width: 600px) 100vw, 50vw"
      />
    </div>
  );
};

export default App;
```

[定高虚拟列表的实现](https://juejin.cn/post/7121551701731409934)

[不定高虚拟列表的实现](https://juejin.cn/post/7317820788546977811)
