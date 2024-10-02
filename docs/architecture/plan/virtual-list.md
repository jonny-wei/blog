# 无限滚动虚拟列表

虚拟列表是一种用于优化长列表性能的技术，适用于需要展示大量数据的场景。在传统的方法中，如果一次性渲染所有列表项，将会消耗大量的内存资源，可能导致页面加载缓慢、卡顿等问题，严重影响用户体验。虚拟列表的核心思想：

- **只渲染可见区域**：虚拟列表的核心在于仅渲染当前屏幕可见区域内的列表项，对于不可见的列表项（即超出当前视口范围的列表项），则不进行渲染或者延迟渲染。
- **滚动时动态加载**：当用户滚动列表时，虚拟列表会动态计算哪些列表项进入了视口范围，并及时渲染这些项；同时，将那些已经滚动出视口的列表项卸载或复用，以减少内存占用。

虚拟列表根据列表容器的可视范围，动态计算出在可视范围内的列表节点 item，然后只渲染视野边界内容的 item，通过控制页面节点数避免内存线性增加。无论时定高还是不定高均需要确定可是范围内元素的高度。

![virtual1](/blog/images/architecture/virtual1.png)

## 定高的虚拟列表

定高的虚拟列表，滚动列表中子元素高度相等，只渲染固定个数的元素。一个视口高度是固定的，子元素的高度也是固定的，我们可以算出一个视口中渲染元素的个数。计算当前视口内可见的列表项第一个可见元素和最后一个可见元素的索引。

```js
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

不定高的虚拟列表，滚动列表中子元素高度都随机且不相等。每个列表项的高度可能不同，因此需要在加载数据时计算并存储每个项的高度。可见无论时定高还是不定高都需要确定给个元素项的高度。

- 预测每个元素的高度。定高的虚拟列表实现要求用户传入固定的 item 高度，而现在我们不需要传入固定值，只需传入预测的 item 高度，而这里的高度值是有一定要求的：需要保证预测的 item 高度尽量比真实的每一项 item 的高度要小或者接近所有 item 高度的平均值。我们内部需要根据预测的 item 高度来计算整个虚拟列表的最大容量，假设如果你的预测 item 高度过大，就会出现真实 item 渲染到视图上时出现留白的情况。而如果预测高度比真实 item 高度都要小，那就能保证预测计算出的最大容量一定会大于真实 item 渲染视图列表的最大容量，这样就不会出现留白的情况。当然也不能过小，具体需要看真实 items 的高度情况，如果出现最小 item 和 最大 item 相差较大那也会造成最大容纳量设置过大的问题。恰当的设置是所有 item 高度的平均值，这样计算更符合真实渲染，如果无法拿捏就设置一个最小值。
- 存储元素位置信息。如何计算出列表的高度和滚动偏移量？考虑之前定高的实现我们可以直接用 `数据源长度 * 元素高度`，但现在元素高度不固定，那肯定就需要我们手动获取 DOM 信息再计算，我们可以直接通过 list DOM 来获取高度，但是偏移量怎么办？滚动时的偏移量根据每滚动出去一项然后进行计算的，如果单单只获取 list 高度好像并不能解决这个问题
因此将引入一个新的变量：`positions`，它用来存储每个元素的信息。

```js
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

[定高虚拟列表的实现](https://juejin.cn/post/7121551701731409934)

[不定高虚拟列表的实现](https://juejin.cn/post/7317820788546977811)
