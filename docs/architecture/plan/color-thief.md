# 图片分类与主题色提取

## 图片智能分类

图片智能分类是计算机视觉领域的一个常见任务，通常涉及到从图片中提取特征并基于这些特征将图片分配到不同的类别。实现图片智能分类的步骤包括数据预处理、特征提取、训练分类模型、部署等。TensorFlow.js 提供了许多预训练模型，适合直接用于图像分类任务，无需进行训练。你可以使用这些模型来进行图片分类。

常见的预训练模型包括：

- MobileNet：是 Google 提出的一种轻量级神经网络架构，专为移动设备和嵌入式设备设计。其主要特点是使用深度可分离卷积（Depthwise Separable Convolutions），可以大幅度减少计算量和模型大小。。
- ResNet：适用于大规模图像分类任务，性能较强。是微软研究院提出的网络，它引入了“残差块”概念，通过跳跃连接来解决深度网络训练中的梯度消失问题，使得网络可以非常深，通常有几十层到几百层。
- Inception：也是一个高效的图像分类模型，通常用于更复杂的任务。是Google提出的模型，它引入了Inception模块，该模块通过不同尺寸的卷积核并行计算来提取不同尺度的特征。InceptionV3是目前使用最广泛的版本。

### 任务流程概述

- **数据收集与标注**：收集分类所需的图片数据，并为每个图片标注类别标签。常见的图片分类数据集有 ImageNet、COCO、CIFAR 等。
- **数据预处理**：包括调整图片大小、数据增强（如旋转、翻转、裁剪）等，以提高模型的泛化能力。
- **模型选择与训练**：使用卷积神经网络（CNN）等深度学习模型训练分类器，常用的框架包括 TensorFlow、Keras、PyTorch 等。
- **部署与集成**：将训练好的模型导出并部署到服务器，通过 Node.js 提供 API 接口供 React 前端调用。
- **前端展示与交互**：React 前端接收图片并通过 API 发送到后端进行分类，接收分类结果并显示给用户。

### 简单实现

TensorFlow.js 提供了许多预训练模型，适合直接用于图像分类任务，无需进行训练。你可以使用这些模型来进行图片分类。

常见的预训练模型包括：

- MobileNet：一个轻量级的卷积神经网络模型，适用于边缘设备。
- ResNet：适用于大规模图像分类任务，性能较强。
- Inception：也是一个高效的图像分类模型，通常用于更复杂的任务。

总体流程：

- 前端上传图片：用户上传图片后，前端会将图片发送到后端（Node.js），并且进行压缩或优化。
- 后端分类和打标：后端接收到图片后，通过已训练的模型（如 TensorFlow.js 或第三方 API）进行分类和打标，并- 将分类结果返回给前端。
- 优化性能：在上传过程中，使用图片压缩技术和异步处理方法，优化性能，避免阻塞主线程。
- 前端查询接口：前端可以定期查询接口获取已分类和标注过的图片，以显示不同类别的图片。

```js
const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const mongoose = require('mongoose');
const redis = require('redis');
const { createCanvas, loadImage } = require('canvas');
const imageModel = require('./models/Image'); // 图片数据库模型

// 创建 Redis 客户端
const redisClient = redis.createClient();
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// 连接 MongoDB
mongoose.connect('mongodb://localhost:27017/imageClassification', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();
const port = 3000;

// 设置 Multer 存储选项
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 加载预训练 MobileNet 模型
let model;
async function loadModel() {
  model = await mobilenet.load();
  console.log('MobileNet model loaded successfully');
}
loadModel();

// 图片上传接口
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // 图片存储路径
    const filePath = req.file.path;

    // 使用 sharp 处理图片（例如调整大小）
    const processedFilePath = filePath.replace(path.extname(filePath), '-processed' + path.extname(filePath));
    await sharp(filePath).resize(224, 224).toFile(processedFilePath); // MobileNet 输入尺寸是 224x224

    // 智能分类
    const classificationResult = await classifyImage(processedFilePath);

    // 存储图片和分类信息到数据库
    const imageData = new imageModel({
      filePath: processedFilePath,
      category: classificationResult.className,
      probability: classificationResult.probability,
    });
    await imageData.save();

    // 清理 Redis 缓存
    redisClient.del('image_list');  // 清理图片查询缓存

    res.json({
      message: 'File uploaded, processed, and classified successfully!',
      filePath: processedFilePath,
      classification: classificationResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing the file.');
  }
});

// 使用 MobileNet 进行智能分类
const classifyImage = async (imagePath) => {
  try {
    // 加载图片并转换为张量
    const image = await loadImage(imagePath);
    const tensor = tf.browser.fromPixels(image).toFloat();

    // 预处理图片（例如标准化）
    const processedTensor = tensor.div(tf.scalar(255)).expandDims(0); // 缩放到0-1之间并增加批次维度

    // 进行预测
    const predictions = await model.classify(processedTensor);

    // 返回详细的预测结果，包括类别和概率
    const category = predictions[0].className;  // 获取类别名称
    const probability = predictions[0].probability;  // 获取该类别的预测概率

    return {
      className: category,  // 类别名称
      probability: probability.toFixed(4),  // 分类的置信度，保留4位小数
    };
  } catch (error) {
    console.error('Error in classification:', error);
    return { className: 'Error', probability: 0 };
  }
};

// 查询图片接口（支持分页和按分类标签查询）
app.get('/images', async (req, res) => {
  const { page = 1, limit = 20, category = '' } = req.query;
  const skip = (page - 1) * limit;
  const cacheKey = `image_list_${category}_${page}`;

  // 尝试从 Redis 获取缓存的结果
  redisClient.get(cacheKey, async (err, cachedData) => {
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    try {
      // 查询数据库
      const query = category ? { category } : {};
      const images = await imageModel.find(query).skip(skip).limit(Number(limit));

      const result = {
        page: Number(page),
        limit: Number(limit),
        images,
      };

      // 缓存查询结果
      redisClient.setex(cacheKey, 3600, JSON.stringify(result));  // 缓存1小时

      res.json(result);
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).send('Error fetching images.');
    }
  });
});

// 监听服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

```

查询图片分类接口的数据返回值示例：

```json
{
  "page": 1,
  "limit": 20,
  "images": [
    {
      "_id": "60c72b2f9b1d8e3f9c8e87b6",
      "filePath": "./uploads/1632820581000.jpg",
      "category": "cat",
      "probability": 0.8765
    },
    {
      "_id": "60c72b2f9b1d8e3f9c8e87b7",
      "filePath": "./uploads/1632820582000.jpg",
      "category": "dog",
      "probability": 0.9123
    }
  ]
}

```

一张图片可以有多个分类标签，这种情况通常被称为**多标签分类**（Multi-label Classification）。在传统的图像分类任务中，每张图片通常只有一个标签，而在多标签分类任务中，图片可能属于多个类别。例如，一张图片既可能被标记为“猫”，也可能被标记为“宠物”或者“室内”，这些标签是并列的，图片可以同时属于多个类别。

对于每个类别，MobileNet 会返回一个分类概率，可以设置一个概率阈值（例如 0.5），如果该类别的概率超过阈值，就认为这张图片属于这个类别。这样就可以为每张图片分配多个标签：

```js
// 使用 MobileNet 进行智能分类（多标签）
const classifyImage = async (imagePath) => {
  try {
    // 加载图片并转换为张量
    const image = await loadImage(imagePath);
    const tensor = tf.browser.fromPixels(image).toFloat();

    // 预处理图片（例如标准化）
    const processedTensor = tensor.div(tf.scalar(255)).expandDims(0); // 缩放到0-1之间并增加批次维度

    // 进行预测
    const predictions = await model.classify(processedTensor);

    // 设定一个阈值，选择概率大于该阈值的标签
    const threshold = 0.5; // 你可以根据需求调整这个值
    const multiLabels = predictions.filter(prediction => prediction.probability > threshold)
                                   .map(prediction => prediction.className);

    return {
      labels: multiLabels,  // 返回所有预测出的标签
      probabilities: multiLabels.map(label => predictions.find(pred => pred.className === label).probability),
    };
  } catch (error) {
    console.error('Error in classification:', error);
    return { labels: ['Error'], probabilities: [0] };
  }
};
```

当查询图片时，可以返回所有与该图片相关的标签及其对应的概率：

```json
{
  "page": 1,
  "limit": 20,
  "images": [
    {
      "_id": "60c72b2f9b1d8e3f9c8e87b6",
      "filePath": "./uploads/1632820581000.jpg",
      "labels": ["cat", "pet", "indoor"],
      "probabilities": [0.8765, 0.9123, 0.8231]
    },
    {
      "_id": "60c72b2f9b1d8e3f9c8e87b7",
      "filePath": "./uploads/1632820582000.jpg",
      "labels": ["dog", "pet", "outdoor"],
      "probabilities": [0.9123, 0.8999, 0.8044]
    }
  ]
}
```

### 性能优化

图片分类是计算密集型任务，实时性要求高时，可能会面临延迟问题，尤其是在网络较差或图片较大的情况下。

- 选择合适的模型：采用轻量级模型（如MobileNet或EfficientNet）进行多标签分类，确保推理速度和准确度的平衡。
- 推理优化：通过量化、剪枝、推理引擎优化（如TensorFlow Lite）来加速推理过程。
- 上传与传输优化：通过图片压缩、分片上传和CDN加速优化上传过程，减少网络延迟。
- 数据库优化：使用对象存储存储图片，标签信息通过倒排索引和缓存机制提高查询效率。
- 前端与后端优化：使用分页、懒加载和任务队列等方法提升整体性能和用户体验。

## 主题色智能提取

图片主题色的提取是图像处理中的一个常见需求，例如音频播放器根据封面图动态显示背景色，配合封面图起到很好视觉效果，沉浸式的用户体验。图片主题色提取也在图像分类，搜索识别等方面有利用。

下面以音频播放器场景为例，提取封面图主题色，动态显示播放器的背景色。

### 实现方案

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
