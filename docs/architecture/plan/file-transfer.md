# 大文件上传

- 文件切片：将大文件分割成多个较小的块。目的是支持并行按需上传，提高上传成功率。
- 计算 Hash 值：对每个文件块计算哈希值。目的是支持断点续传、秒传、并行按需上传、保证文件完整性、避免重复上传、等。
- 秒传: 客户端会将待上传的文件分割成多个小块，并为每个小块计算唯一的哈希值（例如MD5、SHA-1等）。这些哈希值就像是每个文件块的数字指纹。然后，客户端将这些哈希值发送给服务器进行比对。服务器会检查自己的数据库中是否已经存在相同哈希值的文件块。存在相同的说明已上传过，服务端会给客户端返回已存在的信息。
- 断点续传：上传过程中意外中断，从上次中断的地方继续传输，而不需要重新开始整个文件的传输，上传分片前需先请求接口查询需要上传的分片，哪些块已存在，哪些块不存在，存在就秒传，不存在重新上传。
- 并行上传：多个分片同时上传并控制并发量，避免一次性上传过多切片资源过载，导致崩溃，而且可以更灵活地处理任务失败及重试。
- 发送合并请求：前端上传完毕之后主动通知服务端进行文件切片的合并。

## 文件切片及 Hash 计算

因为当文件体积较大时，如果对整个文件计算 md5 以及加载整个文件并进行分片都是很吃性能和耗时的操作，需要通过输入流对文件进行读取。这里 Hash 的计算使用 [spark-md5](https://www.npmjs.com/package/spark-md5) 它优化了大文件的哈希计算性能。读取文件通过 [FileReader](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader) 它用于异步读取文件内容，不会阻塞主线程，同时保持较低的内存使用率，支持多种读取方法，可以在读取文件的过程中进行其他操作，如进度更新、取消读取等，这里结合 spark-md5 在文件读取的过程中逐步计算哈希值。大文件切片和 Hash 的计算是个耗时的操作，可以考虑在 Worker 线程中执行。

```js
public getChunkListAndFileMd5(chunkSize: number, file: File): Promise<{ md5: string; chunkList: Blob[] }> {
  return new Promise((resolve, reject) => {
    const chunks = Math.ceil(file.size / chunkSize); // 计算总分片数
    const spark = new SparkMD5.ArrayBuffer(); // 创建 SparkMD5 实例，用于计算 hash
    const fileReader = new FileReader(); // 创建 FileReader 实例，用于读取文件
    const chunkList: Blob[] = []; // 存储分片的数组
    let currentChunk = 0; // 当前处理的分片索引

    // 文件读取完成的回调
    fileReader.onload = (e) => {
      if (e?.target?.result instanceof ArrayBuffer) {
        spark.append(e.target.result); // 将读取到的 ArrayBuffer 追加到 SparkMD5 实例中
      }
      currentChunk++; // 增加当前分片索引

      if (currentChunk < chunks) {
        loadNextChunk(); // 如果还有未处理的分片，继续加载下一个分片
      } else {
        const computedHash = spark.end(); // 计算最终的 MD5 哈希值
        resolve({ md5: computedHash, chunkList }); // 返回结果
      }
    };

    // 文件读取出错的回调
    fileReader.onerror = (e) => {
      console.error('Error reading file:', e);
      reject(new Error('Failed to read file')); // 拒绝Promise，传递错误信息
    };

    // 加载下一个分片
    function loadNextChunk() {
      const start = currentChunk * chunkSize; // 计算当前分片的起始位置
      const end = Math.min(start + chunkSize, file.size); // 计算当前分片的结束位置

      const chunk = file.slice(start, end); // 从文件中切出当前分片
      chunkList.push(chunk); // 将分片添加到分片列表中
      fileReader.readAsArrayBuffer(chunk); // 读取分片为 ArrayBuffer
    }

    // 开始加载第一个分片
    loadNextChunk();
  });
}
```

大文件切片和 Hash 的计算是个耗时的操作，可以考虑在 Worker 线程中执行：

```js
// fileProcessorWorker.ts

self.onmessage = async (event: MessageEvent<{ file: File; chunkSize: number }>) => {
  const { file, chunkSize } = event.data;
  const chunks = Math.ceil(file.size / chunkSize);
  const spark = new SparkMD5.ArrayBuffer();
  const fileReader = new FileReader();
  const chunkList: Blob[] = [];
  let currentChunk = 0;

  fileReader.onload = (e: ProgressEvent<FileReader>) => {
    if (e?.target?.result instanceof ArrayBuffer) {
      spark.append(e.target.result);
    }
    currentChunk++;

    if (currentChunk < chunks) {
      loadNextChunk();
    } else {
      const computedHash = spark.end();
      self.postMessage({ md5: computedHash, chunkList });
    }
  };

  fileReader.onerror = (e: ProgressEvent<FileReader>) => {
    console.error('Error reading file:', e);
    self.postMessage({ error: 'Failed to read file' });
  };

  function loadNextChunk() {
    const start = currentChunk * chunkSize;
    const end = Math.min(start + chunkSize, file.size);

    const chunk = file.slice(start, end);
    chunkList.push(chunk);
    fileReader.readAsArrayBuffer(chunk);
  }

  loadNextChunk();
};

const getChunkListAndFileMd5 = async (file: File): Promise<{ md5: string; chunkList: Blob[] }> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker();
    worker.postMessage({ file, chunkSize });

    worker.onmessage = (event: MessageEvent<{ md5: string; chunkList: Blob[]; error?: string }>) => {
      const { md5, chunkList, error } = event.data;
      if (error) {
        reject(new Error(error));
      } else {
        resolve({ md5, chunkList });
      }
    };

    worker.onerror = (e: ErrorEvent) => {
      console.error('Web Worker error:', e);
      reject(new Error('Web Worker error'));
    };
  });
};
```

## 断点续传及秒传

要实现断点续传和秒传还需要在上传前去服务器查询一下，是否已经存在当前文件。如果已存在，并且已经是上传成功的文件，则直接返回前端上传成功，即可实现 "秒传"。如果已存在，并且有一部分切片上传失败，则返回给前端已经上传成功的切片 name，前端拿到后，根据返回的切片，计算出未上传成功的剩余切片，然后把剩余的切片继续上传，即可实现 "断点续传"。

向服务端发送文件名和文件哈希，检查是否需要上传文件:

```js
async verifyUpload(filename, fileHash) {
  const { data } = await this.request({
    url: "https://your-api-host/api/verify",
    headers: {
      "content-type": "application/json"
    },
    data: JSON.stringify({
      filename,
      fileHash
    })
  });
  return JSON.parse(data);
}
```

## 并行上传

文件切片完成后，构建上传任务并行上传，这里采用 `PromisePool`(e.g. [p-queue](https://www.npmjs.com/package/p-queue)) 管理任务队列和控制并发任务的数量，避免资源过载。首先实现 PromisePool 类用于管理和控制上传任务：

```js
// src/utils/PromisePool.ts

class PromisePool {
    private concurrency: number; // 最大并发数
    private queue: Array<{ task: () => Promise<any>; priority: number; retries: number; timeout: number; onCompletion?: (result: any) => void }>; // 任务队列
    private running: number; // 当前正在运行的任务数
    private results: any[]; // 存储任务结果
    private errors: any[]; // 存储任务错误

    /**
     * 构造函数
     * @param { { concurrency?: number } } options - 配置选项
     * @param { number } options.concurrency - 最大并发数，默认为 5
     */
    constructor({ concurrency = 5 } = {}) {
        this.concurrency = concurrency;
        this.queue = [];
        this.running = 0;
        this.results = [];
        this.errors = [];
    }

    /**
     * 添加任务到队列
     * @param { (signal: AbortSignal) => Promise<any> } task - 任务函数
     * @param { { priority?: number, retries?: number, timeout?: number, onCompletion?: (result: any) => void } } options - 任务选项
     * @returns { Promise<any> } - 任务的 Promise
     */
    add(task: (signal: AbortSignal) => Promise<any>, { priority = 0, retries = 0, timeout = 0, onCompletion }: { priority?: number, retries?: number, timeout?: number, onCompletion?: (result: any) => void } = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const signal = controller.signal;

            const wrappedTask = async () => {
                let attempt = 0;
                while (attempt <= retries) {
                    try {
                        const result = await Promise.race([
                            task(signal), // 执行任务
                            this.createTimeout(timeout, controller) // 创建超时处理
                        ]);
                        this.results.push(result); // 记录任务结果
                        resolve(result); // 解决任务的 Promise
                        onCompletion?.(result); // 执行任务完成回调
                        return;
                    } catch (error) {
                        if (error.name === 'AbortError') {
                            this.errors.push(new Error('Task was aborted')); // 记录任务被取消的错误
                        } else {
                            this.errors.push(error); // 记录任务失败的错误
                        }
                        if (attempt < retries) {
                            console.warn(`Task failed, retrying... Attempt ${attempt + 1}/${retries}`); // 重试提示
                        } else {
                            reject(error); // 拒绝任务的 Promise
                            return;
                        }
                    }
                    attempt++;
                }
            };

            this.queue.push({ task: wrappedTask, priority, retries, timeout, onCompletion }); // 将任务添加到队列

            if (this.running < this.concurrency) {
                this.next(); // 如果当前运行的任务数小于最大并发数，则立即开始执行任务
            }
        });
    }

    /**
     * 从队列中取出下一个任务并执行
     */
    private next() {
        if (this.running < this.concurrency) {
            this.queue.sort((a, b) => b.priority - a.priority); // 按优先级排序任务队列
            if (this.queue.length > 0) {
                this.running++;
                const { task } = this.queue.shift()!; // 取出优先级最高的任务
                task().finally(() => {
                    this.running--; // 任务完成后减少正在运行的任务数
                    this.next(); // 继续执行下一个任务
                });
            }
        }
    }

    /**
     * 开始执行所有任务
     */
    start() {
        while (this.running < this.concurrency && this.queue.length > 0) {
            this.next(); // 开始执行任务直到达到最大并发数
        }
    }

    /**
     * 等待所有任务完成
     * @returns { Promise<{ results: any[], errors: any[] }> } - 任务结果和错误
     */
    async wait(): Promise<{ results: any[], errors: any[] }> {
        return new Promise((resolve) => {
            const checkCompletion = () => {
                if (this.running === 0 && this.queue.length === 0) {
                    resolve({
                        results: this.results, // 返回所有任务的结果
                        errors: this.errors // 返回所有任务的错误
                    });
                } else {
                    setTimeout(checkCompletion, 100); // 每隔100毫秒检查一次任务是否完成
                }
            };
            checkCompletion();
        });
    }

    /**
     * 创建超时处理
     * @param { number } timeout - 超时时间（毫秒）
     * @param { AbortController } controller - AbortController 实例
     * @returns { Promise<never> } - 超时的 Promise
     */
    private createTimeout(timeout: number, controller: AbortController): Promise<never> {
        return new Promise((_, reject) => {
            if (timeout > 0) {
                setTimeout(() => {
                    controller.abort(); // 超时后取消任务
                    reject(new Error('Task timed out')); // 拒绝任务的 Promise
                }, timeout);
            }
        });
    }

    /**
     * 取消所有任务
     */
    cancelAll() {
        this.queue.forEach(({ task }) => {
            task.signal?.abort(); // 取消所有任务
        });
        this.queue = []; // 清空任务队列
        this.running = 0; // 重置正在运行的任务数
    }
}

export default PromisePool;
```

基于 getChunkListAndFileMd5 和 PromisePool 实现文件上传，在上传之前需先验证是否需要上传文件，如果不需要则直接返回。如果需要上传，则继续处理文件切片和上传:

```js
async handleUpload() {
  if (!this.file) return;

  try {
    // 获取文件切片列表
    const { md5, chunkList } = await this.getChunkListAndFileMd5(this.file);

    // 验证是否需要上传文件
    const { shouldUpload, uploadedChunks } = await this.verifyUpload(this.file.name, md5);
    if (!shouldUpload) {
      console.log("文件已秒传");
      return;
    }

    // 初始化并发控制器
    const pool = new PromisePool({ concurrency: this.maxConcurrency });

    // 添加上传任务到池中
    chunkList.forEach((chunk, index) => {
      if (!uploadedChunks.includes(index)) {
        pool.add(async (signal: AbortSignal) => {
          await this.uploadPartFileFunc(chunk, index, md5, signal);
        }, {
          priority: 0,
          retries: 3, // 每个任务最多重试 3 次
          timeout: 10000, // 每个任务超时时间为 10 秒
          onCompletion: (result: any) => {
            console.log(`分片 ${index} 上传完成`, result);
          }
        });
      }
    });

    // 等待所有任务完成
    const { results, errors } = await pool.wait();

    if (errors.length > 0) {
      console.error(`文件上传失败: ${errors.map((error) => error.message).join(', ')}`);
    } else {
      console.log('文件上传成功');
      // 所有分片上传完成后，通知服务端进行文件切片的合并
      try {
        await this.mergeFileOnServer(md5, this.file.name);
        console.log('文件切片合并成功');
      } catch (mergeError) {
        console.error(`文件切片合并失败: ${mergeError.message}`);
      }
    }
  } catch (error) {
    console.error(`文件上传失败: ${error.message}`);
  }
}

const uploadPartFileFunc = async (chunk: Blob, index: number, uploadId: string) => {
  const formData = new FormData();
  formData.append('uploadId', uploadId);
  formData.append('partIndex', index.toString());
  formData.append('partFile', chunk);

  try {
    await axios.post(`https://your-api-host/api/uploadPart`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log(`上传分片 ${index} 完成`);
    // 所以分片上传完成后请求服务端合并
    this.mergeFileOnServer()
  } catch (error) {
    console.error(`上传分片 ${index} 失败: ${error.message}`);
    throw new Error(`上传分片 ${index} 失败`);
  }
};
```

## 合并切片

前端上传完毕之后主动通知服务端进行文件切片的合并：

```js
const mergeFileOnServer = async () => {
  try {
    await axios.post(`https://your-api-host/api/mergeFile`, {
      fileName: (fileInput.current as any).files[0].name
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`合并文件请求失败: ${error.message}`);
    throw new Error(`合并文件请求失败: ${error.message}`);
  }
};
```

[实现一个大文件上传和断点续传](https://juejin.cn/post/6844904046436843527?searchId=202410031035399CC8B600384DEA29E894)

[超详细的大文件分片上传](https://juejin.cn/post/7353106546827624463?searchId=202410031035399CC8B600384DEA29E894)

[简单实现大文件上传](https://mp.weixin.qq.com/s/ogg55GMbIJNUfQQCwhssBg)
