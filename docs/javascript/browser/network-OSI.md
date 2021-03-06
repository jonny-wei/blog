# 网络通信模型

## OSI 七层模型

### 定义

OSI（Open System Interconnection）即开放式系统互联通信参考模型。该模型是国际标准化组织（ISO）制定的一个用于计算机或通信系统间互联的标准体系，一般称为 OSI 参考模型或七层模型。

### 核心技术
- 分层结构

  把一个网络系统分成若干层，每一层都去实现不同的功能，每一层的功能都以协议形式正规描述，协议定义了某层同远方一个对等层通信所使用的一套规则和约定。

- 虚拟通信

  从概念上来讲，每一层都与一个远方对等层通信，但实际上该层所产生的协议信息单元是借助于相邻下层所提供的服务传送的。这种对等层之间的通信称为虚拟通信。
  
- 接口通信

  每一层对于上一层来讲是透明的，上层只需要使用下层提供的接口，并不关心下层是如何实现的。

### 七层浅析

![OSI七层模型](/blog/images/javascript/OSI七层模型.png)

#### 应用层

OSI 参考模型中最靠近用户的一层，是为计算机用户提供应用接口，也为用户直接提供各种网络服务。

**具体功能**：文件传输，电子邮件，文件服务，虚拟终端

#### 表示层

表示层提供各种用于应用层数据的编码和转换功能，确保一个系统的应用层发送的数据能被另一个系统的应用层识别。如果必要，该层可提供一种标准表示形式，用于将计算机内部的多种数据格式转换成通信中采用的标准表示形式。数据压缩和加密也是表示层可提供的转换功能之一。

**具体功能**：数据格式化，代码转换，数据加密

#### 会话层

会话层就是负责建立、管理和终止表示层实体之间的通信会话。该层的通信由不同设备中的应用程序之间的服务请求和响应组成。

**具体功能**： 解除或者建立与别的接点的联系

#### 传输层

传输层建立了主机端到端的链接，传输层的作用是为上层协议提供端到端的可靠和透明的数据传输服务，包括处理**差错控制**和**流量控制**等问题。该层向高层屏蔽了下层数据通信的细节，使高层用户看到的只是在两个传输实体间的一条主机到主机的、可由用户控制和设定的、可靠的数据通路。我们通常说的，TCP 和 UDP 就是在这一层。端口号既是这里的“端”。

**具体功能**：提供端对端的接口

#### 网络层

本层通过 IP 寻址来建立两个节点之间的连接，为源端的运输层送来的分组，选择合适的路由和交换节点，正确无误地按照地址传送给目的端的运输层。就是通常说的 IP 层。这一层就是我们经常说的 IP 协议层, IP 协议是 Internet 的基础。

**具体功能**：为数据包选择路由

#### 数据链路层

将比特组合成字节，再将字节组合成帧，使用链路层地址 (以太网使用 MAC 地址)来访问介质，并进行差错检测，数据链路层又分为2个子层：逻辑链路控制子层（LLC）和媒体访问控制子层（MAC）。MAC子层处 CSMA/CD 算法、数据出错校验、成帧等；LLC 子层定义了一些字段使上次协议能共享数据链路层。在实际使用中，LLC子层并非必需的。

**具体功能**：传输有地址的帧以及错误检测功能

#### 物理层

实际最终信号的传输是通过物理层实现的。通过物理介质传输比特流。规定了电平、速度和电缆针脚。常用设备有（各种物理设备）集线器、中继器、调制解调器、网线、双绞线、同轴电缆。这些都是物理层的传输介质。

**具体功能**：使用二进制流的形式传输数据

::: tip 小结
数据由传送端的最上层(通常是指应用程序)产生，由上层往下层传送。每经过一层，都在前端增加一些该层专用的信息，这些信息称为报头，然后才传给下一层，可将加上报头想象为套上一层信封。因此到了最底层时，原本的数据已经套上了七层信封，而后通过网线、电话线、光纤等介质，传送到接收端。

接收端接收到数据后，从最底层向上层传送，每经过一层就拆掉一层信封(即去除该层所认识的报头)，直到最上层，数据便恢复成当初从传送端最上层产生时的原貌。

如果以网络的术语来说，这种每一层将原始数据加上报头的操作，便是数据的封装，而封装前的原始数据则称为数据承载。在传送端，上层将数据传给下层，下层将上层传过来的数据当成数据承载，再将数据承载封装成新的数据，继续传给更下层去封装，直到最底层为止。
:::

## TCP/IP 五层模型

### 对应关系

TCP/IP五层协议和OSI的七层协议对应关系如下：

![TCP模型1](/blog/images/javascript/TCP模型1.png)

### 工作设备

每层对应的工作设备

![TCP模型2](/blog/images/javascript/TCP模型2.png)

### 主要协议

每层对应的主要协议

![TCP模型3](/blog/images/javascript/TCP模型3.png)

## TCP/IP 四层模型

TCP/IP 是一个四层的体系结构，它包含应用层、运输层、网际层(又称为网络层)和网络接口层(包括数据链路层和物理层)，对于计算机网络来说，这一层并没有什么特别新的具体的内容，因此在学习计算机网络原理是往往采用折中的办法，即综合 OSI 和 TCP/IP 的优点，采用一种只有五层协议的体系结构，这样既简洁又能将概念阐述清楚，所以问TCP/IP有几层，说四层和五层都不错，严格来说，应该是四层，这个来自计算机网络第四版编著原话。

![TCP模型4](/blog/images/javascript/TCP模型4.png)

## 常见端口号

- 21端口：FTP 文件传输服务
- 22端口：SSH 远程连接服务
- 23端口：TELNET 终端仿真服务
- 25端口：SMTP 简单邮件传输服务
- **53端口**：DNS 域名解析服务
- **80端口**：HTTP 超文本传输服务
- **443端口**：HTTPS 加密的超文本传输服务

- 3306端口：MYSQL数据库端口
- 5432端口：PostgreSQL数据库端口
- 6379端口：Redis数据库端口
- 8080端口：TCP服务端默认端口
- 8888端口：Nginx服务器的端口
- 9200端口：Elasticsearch服务器端口
- 27017端口：mongoDB数据库默认端口
- 22122端口：fastdfs服务器默认端口