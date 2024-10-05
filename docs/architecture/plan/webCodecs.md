# WebCodecs

## 简介

音视频技术在 Web 平台上的应用非常广泛，已有许多 Web API 间接调用了编解码器来实现特定功能：

- 视频播放：MSE、HTMLMediaElement
- 音频解码：WebAudio
- 录制视频：MediaRecorder
- 实时流媒体：WebRTC

但没有方法可以灵活配置或直接访问编解码器，所以许多应用使用 JS 或 WASM （比如 ffmpeg.wasm）来实现编解码功能，尽管存在诸多缺陷或限制：

- 低性能（WebCodecs 编码速度可达到 ffmpeg.wasm 的 20 倍）
- 高功耗
- 额外网络开销（下载已内置的编解码器）

这么做的原因是以前的 Web API 在特定场景都存在难以克服的障碍：

- WebAudio 只能解码完整的音频文件，但不支持数据流、不提供解码进度信息、更不支持编码
- MediaRecorder 只能录制特定格式（WebM、MP4）的视频，无法控制编码速度、输出缓冲区等
- WebRTC 与 MediaStream API 高度耦合，且不透明，仅能用于实时音视频通信
- Video 标签、MSE 最常用于视频播放，但无法控制解码速率、缓冲区长度，且只支持播放部分视频容器格式

WebCodecs API 正是为了解决这些问题而设计的。它允许开发者直接访问浏览器内置的编解码器，从而实现对视频流各个组件的低级别控制，而无需重新编写或引入额外的编解码器。以下是 WebCodecs API 的一些关键优势：

- 直接硬件加速：WebCodecs API 可以利用浏览器内置的硬件加速编解码器，提供高性能的视频处理能力。此外还可以在 WebWorker 中使用多线程处理编解码。
- 低延迟：通过直接操作视频帧，WebCodecs API 可以显著减少处理延迟，这对于实时应用（如直播、视频会议）至关重要。
- 灵活性与广泛协议支持：开发者可以直接处理原始的音视频帧，实现自定义的图像处理和音频处理，如滤镜效果、色彩调整等。WebCodecs API 支持多种流行的编解码格式，包括 H.264、HEVC (H.265)、VP8、VP9 和 AV1。

[WebCodecs 视频编解码处理](https://developer.chrome.com/docs/web-platform/best-practices/webcodecs?hl=zh-cn)

[WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)

## 视频编解码

![webCodecs](/blog/images/architecture/webCodecs.png)

WebCodecs 是相对底层 API，简单功能可能也需要写非常多的辅助代码，可以借助 WebAV 封装的工具函数来快速实现功能

### 可控解码

```js
// 引入 MP4Clip 类
import { MP4Clip } from '@webav/av-cliper';

// 获取 Canvas 元素和其上下文
const cvs = document.getElementById('videoCanvas');
const ctx = cvs.getContext('2d');

/**
 * 解码并渲染视频帧的函数
 * @param {string} url - MP4 文件的 URL
 */
async function decodeAndRenderVideo(url) {
    try {
        // 使用 fetch 获取 MP4 文件的流
        const response = await fetch(url);
        const body = response.body;

        // 初始化 MP4Clip 实例
        const clip = new MP4Clip(body);

        // 等待 MP4Clip 实例准备好
        await clip.ready;

        // 初始化时间变量，单位为微秒
        let time = 0;

        // 最快速度渲染视频所有帧
        while (true) {
            // 调用 tick 方法获取当前时间点的视频帧
            const { state, video: videoFrame } = await clip.tick(time);

            // 如果状态为 'done'，表示视频已经结束，退出循环
            if (state === 'done') break;

            // 如果成功获取到视频帧
            if (videoFrame != null && state === 'success') {
                // 清除 Canvas 上的旧帧
                ctx.clearRect(0, 0, cvs.width, cvs.height);

                // 将视频帧绘制到 Canvas 上
                ctx.drawImage(
                    videoFrame,
                    0,
                    0,
                    videoFrame.codedWidth,
                    videoFrame.codedHeight
                );

                // 释放视频帧资源
                videoFrame.close();
            }

            // 增加时间，单位为微秒，每秒大约 30 帧
            time += 33000;
        }

        // 清理资源
        clip.destroy();
    } catch (error) {
        // 捕获并处理可能出现的任何异常
        console.error('Error decoding video:', error);
    }
}

// 调用函数并传入 MP4 文件的 URL
decodeAndRenderVideo('path/to/your/video.mp4');
```

### 添加水印

```js
// 引入必要的类
import { MP4Clip, ImgClip, OffscreenSprite, Combinator } from '@webav/av-cliper';

// 获取 Canvas 元素和其上下文
const cvs = document.getElementById('videoCanvas');
const ctx = cvs.getContext('2d');

/**
 * 创建文本水印图片
 * @param {string} text - 文本内容
 * @returns {Promise<HTMLCanvasElement>} - 包含文本的 Canvas 元素
 */
async function createTextImage(text) {
    const textCanvas = document.createElement('canvas');
    const textCtx = textCanvas.getContext('2d');

    // 设置画布大小
    textCanvas.width = 200;
    textCanvas.height = 100;

    // 绘制文本
    textCtx.font = '30px Arial';
    textCtx.fillStyle = 'white';
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.fillText(text, textCanvas.width / 2, textCanvas.height / 2);

    return textCanvas;
}

/**
 * 创建并配置水印动画
 * @param {HTMLCanvasElement} textCanvas - 包含文本的 Canvas 元素
 * @returns {OffscreenSprite} - 配置好的水印 Sprite
 */
function createWatermarkSprite(textCanvas) {
    const watermarkClip = new ImgClip(textCanvas);

    const watermarkSprite = new OffscreenSprite(watermarkClip);

    // 设置水印动画
    watermarkSprite.setAnimation([
        { offset: 0, x: 0, y: 0 },
        { offset: 0.5, x: 100, y: 50 },
        { offset: 1, x: 200, y: 100 }
    ]);

    return watermarkSprite;
}

/**
 * 解码并渲染视频帧，同时添加水印
 * @param {string} videoUrl - 视频文件的 URL
 * @param {string} text - 水印文本
 */
async function decodeAndRenderVideoWithWatermark(videoUrl, text) {
    try {
        // 创建文本水印图片
        const textCanvas = await createTextImage(text);

        // 初始化 MP4Clip 实例
        const videoClip = new MP4Clip((await fetch(videoUrl)).body);
        await videoClip.ready;

        // 创建并配置水印 Sprite
        const watermarkSprite = createWatermarkSprite(textCanvas);

        // 初始化组合器
        const combinator = new Combinator();

        // 添加视频 Sprite 到组合器
        await combinator.add(new OffscreenSprite(videoClip), { main: true });

        // 添加水印 Sprite 到组合器
        await combinator.add(watermarkSprite, { offset: 0 });

        // 初始化时间变量，单位为微秒
        let time = 0;

        // 最快速度渲染视频所有帧
        while (true) {
            // 调用 tick 方法获取当前时间点的组合帧
            const { state, video: combinedFrame } = await combinator.tick(time);

            // 如果状态为 'done'，表示视频已经结束，退出循环
            if (state === 'done') break;

            // 如果成功获取到组合帧
            if (combinedFrame != null && state === 'success') {
                // 清除 Canvas 上的旧帧
                ctx.clearRect(0, 0, cvs.width, cvs.height);

                // 将组合帧绘制到 Canvas 上
                ctx.drawImage(
                    combinedFrame,
                    0,
                    0,
                    combinedFrame.codedWidth,
                    combinedFrame.codedHeight
                );

                // 释放组合帧资源
                combinedFrame.close();
            }

            // 增加时间，单位为微秒，每秒大约 30 帧
            time += 33000;
        }

        // 清理资源
        videoClip.destroy();
        watermarkSprite.destroy();
        combinator.destroy();
    } catch (error) {
        // 捕获并处理可能出现的任何异常
        console.error('Error decoding video or creating watermark:', error);
    }
}

// 调用函数并传入视频文件的 URL 和水印文本
decodeAndRenderVideoWithWatermark('path/to/your/video.mp4', 'Sample Watermark');
```

### 使用 mp4box.js 和 WebCodecs 解码并渲染视频

```js
import React, { useEffect, useRef, useState } from 'react';
import { MP4Box } from 'https://cdn.jsdelivr.net/npm/mp4box@0.2.2/dist/mp4box.all.min.js';

const VideoPlayer = () => {
    // 使用 useRef 获取 Canvas 元素的引用
    const canvasRef = useRef(null);

    // 使用 useState 管理解码后的视频帧和时间戳
    const [videoFrames, setVideoFrames] = useState([]);
    const [lastTime, setLastTime] = useState(0);

    // 视频文件的 URL
    const mp4url = './rains-s.mp4';

    // 创建 MP4Box 实例
    const mp4box = MP4Box.createFile();

    // 生成 VideoDecoder.configure 需要的描述信息
    const getExtradata = () => {
        // 获取视频轨道的编解码配置信息
        const entry = mp4box.moov?.traks?.[0]?.mdia?.minf?.stbl?.stsd?.entries?.[0];
        const box = entry?.avcC ?? entry?.hvcC ?? entry?.vpcC;
        if (box != null) {
            // 将配置信息写入 DataStream
            const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
            box.write(stream);
            // 移除 moov box 的 header 信息
            return new Uint8Array(stream.buffer.slice(8));
        }
    };

    // 当 MP4Box 解析完毕时的回调
    const onReady = (info) => {
        // 获取视频轨道信息
        const videoTrack = info.videoTracks[0];
        if (videoTrack != null) {
            // 设置提取选项，指定要提取的视频样本数量
            mp4box.setExtractionOptions(videoTrack.id, 'video', { nbSamples: 100 });
        }

        // 获取视频的宽度和高度
        const videoW = videoTrack.track_width;
        const videoH = videoTrack.track_height;

        // 创建视频解码器实例
        const videoDecoder = new VideoDecoder({
            output: (videoFrame) => {
                // 将解码后的视频帧转换为 ImageBitmap
                createImageBitmap(videoFrame).then((img) => {
                    // 更新视频帧数组
                    setVideoFrames(prevFrames => [
                        ...prevFrames,
                        { img, duration: videoFrame.duration, timestamp: videoFrame.timestamp }
                    ]);
                    // 关闭视频帧以释放资源
                    videoFrame.close();
                });
            },
            error: (err) => {
                // 处理解码器错误
                console.error('videoDecoder 错误：', err);
            }
        });

        // 获取视频样本总数
        const nbSampleTotal = videoTrack.nb_samples;

        // 配置视频解码器
        videoDecoder.configure({
            codec: videoTrack.codec,
            codedWidth: videoW,
            codedHeight: videoH,
            description: getExtradata()
        });

        // 开始解析 MP4 文件
        mp4box.start();
    };

    // 当有新的视频样本时的回调
    const onSamples = (trackId, ref, samples) => {
        // 获取视频轨道信息
        const videoTrack = mp4box.info?.videoTracks?.[0];
        if (videoTrack.id === trackId) {
            // 停止解析
            mp4box.stop();

            // 遍历所有样本
            for (const sample of samples) {
                // 判断样本类型（关键帧或非关键帧）
                const type = sample.is_sync ? 'key' : 'delta';

                // 创建 EncodedVideoChunk 对象
                const chunk = new EncodedVideoChunk({
                    type,
                    timestamp: sample.cts,
                    duration: sample.duration,
                    data: sample.data
                });

                // 将样本传递给解码器进行解码
                videoDecoder.decode(chunk);
            }
        }
    };

    // 使用 useEffect 钩子处理副作用
    useEffect(() => {
        // 设置 MP4Box 的回调函数
        mp4box.onReady = onReady;
        mp4box.onSamples = onSamples;

        // 获取视频文件的 ArrayBuffer 数据
        fetch(mp4url)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                // 设置文件起始位置
                buffer.fileStart = 0;
                // 将数据追加到 MP4Box 实例中
                mp4box.appendBuffer(buffer);
                // 刷新 MP4Box 实例
                mp4box.flush();
            });

        // 定义渲染视频帧的函数
        const renderFrame = (currentTime) => {
            // 查找当前时间戳对应的视频帧
            const frame = videoFrames.find(frame => frame.timestamp <= currentTime && frame.timestamp > lastTime);
            if (frame) {
                // 获取 Canvas 上下文
                const ctx = canvasRef.current.getContext('2d');
                // 清除 Canvas
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                // 绘制视频帧
                ctx.drawImage(frame.img, 0, 0, frame.img.width, frame.img.height);
                // 更新上一帧的时间戳
                setLastTime(frame.timestamp);
            }
            // 请求下一帧
            requestAnimationFrame(renderFrame);
        };

        // 启动渲染
        requestAnimationFrame(renderFrame);

        // 清理函数，移除 MP4Box 的回调函数
        return () => {
            mp4box.off('ready', onReady);
            mp4box.off('samples', onSamples);
        };
    }, [mp4url]);

    // 返回 Canvas 元素
    return (
        <canvas ref={canvasRef} width="640" height="480"></canvas>
    );
};

export default VideoPlayer;
```