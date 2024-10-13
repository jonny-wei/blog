# 图片主题色智能提取

图片主题色的提取是图像处理中的一个常见需求，例如音频播放器根据封面图动态显示背景色，配合封面图起到很好视觉效果，沉浸式的用户体验。图片主题色提取也在图像分类，搜索识别等方面有利用。

下面以音频播放器场景为例，提取封面图主题色，动态显示播放器的背景色。

## 实现方案

在实际应用中可直接使用类似 `ColorThief` 这样的库。这里主要介绍图片主题色提取的实现方案和原理。

一般的技术方案主要为以下几个步骤：

- **获取图片数据**：使用 canvas 元素来获取图片的像素数据。首先，需要通过 `drawImage()` 方法将图片绘制到 canvas 上，然后通过 `getImageData()` 方法获取图片的像素数据。这个过程需要确保图片已经加载完成，否则可能会获取到错误的数据。如果图片较多，为了不影响主线程性能，可以使用 OffscreenCanvas 在 Web Worker 中进行 Canvas 离屏渲染，这样可以避免主线程被密集的计算任务阻塞。

- **空间转换与预处理**：将图片从 RGB 颜色空间转换到更适合处理的颜色空间，如 HSV 或 LAB。为了减少计算量并提高提取算法的准确性，可通过降噪、缩放、去皮等对数据进行预处理。例如，通过高斯滤波、均值滤波、中值滤波等方式对图像降噪处理去除图像中的干扰。

- **提取主题色**：采用颜色量化算法进行颜色提取。常用的颜色量化算法有最小差值法、中位切分法、八叉树算法、聚类、色彩建模法等。其中聚类和色彩建模法需要对提取函数和样本、特征变量等进行调参和回归计算不太适用于 JS 实践。

- **设置背景色主题色**：将提取出的主题色设置到对应元素上。

- **优化调整**：可根据实际效果进行调整，比如通过间隔采样、优化切割点查找等方式来优化性能和准确性。
  
## 提取算法

颜色量化（Color Quantization）是一种减少图像中颜色数量的技术，它将图像从高颜色深度转换为低颜色深度，同时尽量保持图像的视觉质量。颜色量化通常用于：图像压缩与传输、索引颜色图像的创建（调色板）等。常见的颜色量化算法有：

1. **中位切分法（Median Cut）**：中位切分法是一种颜色量化算法，它将颜色空间划分为多个区域，并计算每个区域的中位色作为该区域的主题色。算法从整个图像作为一个长方体开始，选择 RGB 中最长的一边从颜色统计的中位数一切为二，使得到的两个长方体所包含的像素数量相同，重复上述步骤，直到最终切分得到长方体的数量等于主题颜色数量为止。

- 优点：可以很好地保持图像中颜色的分布，适用于快速获取主题色，并且对图像细节不太关心的场景。
- 缺点：在某些条件下，可能会存在体积大但只包含少量像素的长方体，导致颜色表示不准确。此外，算法的运行时间可能会较长。

2. **八叉树算法（Octree）**：八叉树算法将颜色空间划分为一个八叉树结构，每个节点代表一个颜色区域。通过递归地将颜色空间划分为更小的区域来提取主题色。颜色成分转换成二进制后，较低位的数值被压缩进较高位，从而实现颜色的量化。

- 优点：可以保留更多的细节信息，适用于需要精细颜色量化的场景。
- 缺点：计算量较大，对于大规模图像数据，可能会有性能瓶颈。

3. **K-Means聚类算法**：一种无监督学习算法，用于将数据点分成 K 个簇。在图像主题色提取中，每个像素点被视为一个数据点，通过迭代计算，将像素点分配到最近的簇中心，从而形成主题色。算法开始时随机选择 K 个像素作为初始簇中心，然后通过迭代过程，不断更新簇中心，直到满足停止条件（如达到最大迭代次数或簇中心变化小于某个阈值）。

- 优点：简单易懂，实现容易，对于大规模数据集相对高效。
- 缺点：对初始簇中心的选择敏感，可能导致不同的结果。对于颜色空间的分布不均匀的问题，可能无法得到最佳的聚类效果。此外，K 值的选择也对结果有较大影响，但并没有一个统一的标准来确定最优的 K 值。

4. **最小差值法**：最小差值法是在给定调色板的情况下，找到与色差最小的颜色。对于每个像素，算法会计算它与调色板中每种颜色的差距，选择差距最小的颜色作为代表色。

- 优点：实现简单，对于有固定调色板的应用场景非常适用。
- 缺点：对于没有固定调色板的场景，需要预先定义调色板，这可能限制了算法的适用性。此外，对于色彩分布不均匀的图像，可能无法得到最佳的颜色表示。

5. **流行色算法**：流行色算法选择图像中出现频率最高的 K 个颜色作为图像的颜色映射表，然后计算选择映射表中距离图像各像素颜色值最近的颜色作为该像素的映射颜色。

- 优点：能够保留图像中的主要颜色，对于颜色分布集中的图像效果较好。
- 缺点：在计算过程中寻找最高频 K 颜色时将十分消耗内存，同时，做颜色映射的距离度量方式虽然可以有多种选择，但是最终得到的效果也相对较差。

### 中位切分法

```js
/**
 * 对给定的颜色数组执行中位数切割算法。
 * @param {Array} colors - 颜色数组，每个元素是一个包含r, g, b属性的对象。
 * @param {number} maxColors - 最终想要得到的颜色数量。
 * @returns {Array} - 返回一个包含最终颜色的数组。
 */
function medianCut(colors, maxColors) {
    if (colors.length <= maxColors) return colors;

    let boxes = [new Box(colors)];

    while (boxes.length < maxColors) {
        let boxToSplit = boxes.reduce((maxBox, box) => box.range > maxBox.range ? box : maxBox, boxes[0]);
        const newBoxes = boxToSplit.split();
        boxes.splice(boxes.indexOf(boxToSplit), 1, ...newBoxes);
    }

    return boxes.map(box => box.getAverageColor());
}

class Box {
    constructor(colors) {
        this.colors = colors;
        this.calculateRange();
    }

    calculateRange() {
        let minR = 255, maxR = 0,
            minG = 255, maxG = 0,
            minB = 255, maxB = 0;

        this.colors.forEach(color => {
            if (color.r < minR) minR = color.r;
            if (color.r > maxR) maxR = color.r;
            if (color.g < minG) minG = color.g;
            if (color.g > maxG) maxG = color.g;
            if (color.b < minB) minB = color.b;
            if (color.b > maxB) maxB = color.b;
        });

        this.range = Math.max(maxR - minR, maxG - minG, maxB - minB);
    }

    split() {
        let channel = 'r';
        let maxRange = this.range;

        // 确定哪个通道的范围最大
        ['r', 'g', 'b'].forEach(c => {
            const range = Math.max(...this.colors.map(color => color[c])) - Math.min(...this.colors.map(color => color[c]));
            if (range > maxRange) {
                maxRange = range;
                channel = c;
            }
        });

        // 根据最大范围的通道排序并切割
        this.colors.sort((a, b) => a[channel] - b[channel]);
        const midIndex = Math.floor(this.colors.length / 2);

        return [new Box(this.colors.slice(0, midIndex)), new Box(this.colors.slice(midIndex))];
    }

    getAverageColor() {
        let totalR = 0, totalG = 0, totalB = 0;

        this.colors.forEach(color => {
            totalR += color.r;
            totalG += color.g;
            totalB += color.b;
        });

        const count = this.colors.length;
        return {
            r: Math.round(totalR / count),
            g: Math.round(totalG / count),
            b: Math.round(totalB / count)
        };
    }
}

// 测试用例：
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    // 假设这里已经有一张图片绘制在canvas上
    // 例如：ctx.drawImage(image, 0, 0);

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 提取颜色数据
    const colors = [];
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // 可以选择忽略透明度为0的像素
        if (data[i + 3] !== 0) {
            colors.push({ r, g, b });
        }
    }

    // 应用中位数切割算法
    const resultColors = medianCut(colors, 5); // 假设我们希望得到5种主要颜色
    console.log(resultColors);
});
```

### 八叉树算法

```js


/**
 * 八叉树类
 */
class Octree {
    constructor() {
        this.root = null;
        this.maxDepth = 5; // 八叉树的最大深度
        this.colorMap = {}; // 存储最终的颜色映射
    }

    /**
     * 添加颜色到八叉树
     * @param {Object} color - 包含r, g, b属性的颜色对象
     */
    addColor(color) {
        if (!this.root) {
            this.root = new OctreeNode(0);
        }
        this.root.insert(color, 0);
    }

    /**
     * 减少颜色数量
     * @param {number} maxColors - 最终想要得到的颜色数量
     * @returns {Array} - 返回一个包含最终颜色的数组
     */
    reduceColors(maxColors) {
        const nodes = this.getLeafNodes(this.root);
        nodes.sort((a, b) => b.volume - a.volume);

        while (nodes.length > maxColors) {
            const node = nodes.pop();
            node.reduce();
            this.updateParentVolumes(node.parent);
        }

        this.buildColorMap(this.root);
        return Object.values(this.colorMap);
    }

    /**
     * 获取所有叶子节点
     * @param {OctreeNode} node - 当前节点
     * @returns {Array} - 返回所有叶子节点的数组
     */
    getLeafNodes(node) {
        if (!node.children) {
            return [node];
        }

        let leafNodes = [];
        for (let child of node.children) {
            leafNodes = leafNodes.concat(this.getLeafNodes(child));
        }
        return leafNodes;
    }

    /**
     * 更新父节点的体积
     * @param {OctreeNode} node - 当前节点
     */
    updateParentVolumes(node) {
        if (node) {
            node.calculateVolume();
            this.updateParentVolumes(node.parent);
        }
    }

    /**
     * 构建颜色映射
     * @param {OctreeNode} node - 当前节点
     */
    buildColorMap(node) {
        if (!node.children) {
            this.colorMap[node.averageColor] = node.averageColor;
        } else {
            for (let child of node.children) {
                this.buildColorMap(child);
            }
        }
    }
}

/**
 * 八叉树节点类
 */
class OctreeNode {
    constructor(depth) {
        this.depth = depth;
        this.children = null;
        this.volume = 0;
        this.totalR = 0;
        this.totalG = 0;
        this.totalB = 0;
        this.pixelCount = 0;
    }

    /**
     * 插入颜色到节点
     * @param {Object} color - 包含r, g, b属性的颜色对象
     * @param {number} level - 当前深度
     */
    insert(color, level) {
        if (level === this.depth || !this.children) {
            this.totalR += color.r;
            this.totalG += color.g;
            this.totalB += color.b;
            this.pixelCount++;
            this.calculateVolume();
            return;
        }

        if (!this.children) {
            this.children = [];
            for (let i = 0; i < 8; i++) {
                this.children.push(new OctreeNode(this.depth + 1));
            }
        }

        const index = this.getIndex(color, level);
        this.children[index].insert(color, level + 1);
    }

    /**
     * 计算节点的体积
     */
    calculateVolume() {
        this.volume = this.pixelCount;
    }

    /**
     * 获取颜色在当前深度的索引
     * @param {Object} color - 包含r, g, b属性的颜色对象
     * @param {number} level - 当前深度
     * @returns {number} - 返回索引
     */
    getIndex(color, level) {
        const mask = 0x80 >> level;
        const r = Boolean(color.r & mask);
        const g = Boolean(color.g & mask);
        const b = Boolean(color.b & mask);
        return (r << 2) | (g << 1) | b;
    }

    /**
     * 减少节点
     */
    reduce() {
        this.children = null;
        this.calculateVolume();
    }

    /**
     * 获取节点的平均颜色
     * @returns {Object} - 包含r, g, b属性的颜色对象
     */
    get averageColor() {
        return {
            r: Math.round(this.totalR / this.pixelCount),
            g: Math.round(this.totalG / this.pixelCount),
            b: Math.round(this.totalB / this.pixelCount)
        };
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    // 假设这里已经有一张图片绘制在canvas上
    // 例如：ctx.drawImage(image, 0, 0);

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 提取颜色数据
    const colors = [];
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // 可以选择忽略透明度为0的像素
        if (data[i + 3] !== 0) {
            colors.push({ r, g, b });
        }
    }

    const octree = new Octree();
    colors.forEach(color => octree.addColor(color));
    const resultColors = octree.reduceColors(5); // 假设我们希望得到5种主要颜色
    console.log(resultColors);
});
```

中位切分法适用于资源有限且需要快速提取图像主题色的场景，尤其适合实时或大规模处理需求。它的简单性和计算效率使其在这些场景下成为很好的选择，尤其是当主要目标是从图像中快速捕捉主题颜色而不需要过多考虑细节和渐变色时。而八叉树在动态适应性和处理颜色渐变方面具有优势，适用于需要保持细节不和平滑度的图像颜色提取任务，但其算法复杂度较高，内存消耗较大。
