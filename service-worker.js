/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "4fb20a7bba4fc0d0dffddf27628832ee"
  },
  {
    "url": "assets/css/0.styles.b7c5b679.css",
    "revision": "2a0adde080415c4008e81f7a21e53908"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.ddd9f677.js",
    "revision": "495a1091052eb2b9ba913dde8ea4c452"
  },
  {
    "url": "assets/js/100.e9466354.js",
    "revision": "ca859950391e9d43ca14ca49a19b1908"
  },
  {
    "url": "assets/js/101.24adea02.js",
    "revision": "2acfaee6754ba0f4e9bd4e1890a6633a"
  },
  {
    "url": "assets/js/102.bc8fb250.js",
    "revision": "2bb1b61419e382dd8ff38c0dbc8d1a1e"
  },
  {
    "url": "assets/js/103.1285b8ce.js",
    "revision": "6a73ad0f9804217794bf7017e49727c3"
  },
  {
    "url": "assets/js/104.21b5b344.js",
    "revision": "63524250a358e8fb6dbbe7ecbe2771aa"
  },
  {
    "url": "assets/js/105.4c00e388.js",
    "revision": "f3d9141889573c171bd30e14f9e773f1"
  },
  {
    "url": "assets/js/106.67383971.js",
    "revision": "c492a3c53b8e3fbc5644236ef1498c86"
  },
  {
    "url": "assets/js/107.1fd799a4.js",
    "revision": "ccffbe70c4231e4276f6310bc0ab4262"
  },
  {
    "url": "assets/js/108.235fcf18.js",
    "revision": "57080b1485e7e182a02d94f751955f12"
  },
  {
    "url": "assets/js/109.94071645.js",
    "revision": "34701bfaaccd9e41a5a2ac35f4160d95"
  },
  {
    "url": "assets/js/11.c67ac9c5.js",
    "revision": "3a822e80b2628efe60e9eef8efba9291"
  },
  {
    "url": "assets/js/12.c10ed981.js",
    "revision": "81db4ffc464d93ba1db5ec1884a70967"
  },
  {
    "url": "assets/js/13.5d1a37d5.js",
    "revision": "2ec407f0d60c3038bc3ba7abb2ea9151"
  },
  {
    "url": "assets/js/14.ec6c1f14.js",
    "revision": "1dbb61cc6f85bc68640d75dedc29bd03"
  },
  {
    "url": "assets/js/15.d9da5e1a.js",
    "revision": "e5c7e75287a670811581c8879f077e17"
  },
  {
    "url": "assets/js/16.75a9427e.js",
    "revision": "61e94535067e5ca17fbefae30d0ba2f7"
  },
  {
    "url": "assets/js/17.3fd1312e.js",
    "revision": "b5eb7f84c5c9fe15dabde7be3376318e"
  },
  {
    "url": "assets/js/18.4a419527.js",
    "revision": "f77a190df4fd25e9a4bb1a56a7f2d028"
  },
  {
    "url": "assets/js/19.9e1b122b.js",
    "revision": "48ac2ca46f71e9dfbd077d23b2a8ae66"
  },
  {
    "url": "assets/js/2.55125c9d.js",
    "revision": "0ac7e40dd890b6cfd3fe3829761b67fe"
  },
  {
    "url": "assets/js/20.1704a347.js",
    "revision": "66d979d3bd31fd6a60c4c7be415c4f34"
  },
  {
    "url": "assets/js/21.f6842552.js",
    "revision": "e0573cfdfeeda01aabcbcae414250179"
  },
  {
    "url": "assets/js/22.e2575ad8.js",
    "revision": "2e155dc4a579bc2e8252d91a4b95bb4d"
  },
  {
    "url": "assets/js/23.7cd980ee.js",
    "revision": "d142b7645423aa969ec80a366243a576"
  },
  {
    "url": "assets/js/24.371b29db.js",
    "revision": "0747391b8218e81187c54ce311566613"
  },
  {
    "url": "assets/js/25.fc81e277.js",
    "revision": "2c15ff27f275ff1ef29a85e2c1371614"
  },
  {
    "url": "assets/js/26.43328759.js",
    "revision": "2586031b8def3830a526ea0ea3749785"
  },
  {
    "url": "assets/js/27.773c6820.js",
    "revision": "2f4dfaa7fb26053b5e9b1de4495fa00c"
  },
  {
    "url": "assets/js/28.d9c22597.js",
    "revision": "7cc17f99b732da9156b11333bd766527"
  },
  {
    "url": "assets/js/29.624a74b7.js",
    "revision": "29f68f99919839aaf79affa7161b20f7"
  },
  {
    "url": "assets/js/3.6b7316b6.js",
    "revision": "d1d4591ec617013367481c47f9d8dd9a"
  },
  {
    "url": "assets/js/30.45f3e74c.js",
    "revision": "181194fa0c7f494e1abf110c944f72c9"
  },
  {
    "url": "assets/js/31.e0e30491.js",
    "revision": "1507eb36e978a79216d5ce794daa789d"
  },
  {
    "url": "assets/js/32.1455e707.js",
    "revision": "41944cdc70769ea487190701c56457e4"
  },
  {
    "url": "assets/js/33.38d992a0.js",
    "revision": "021b61efa89b03933351148fe2397e32"
  },
  {
    "url": "assets/js/34.3c379f18.js",
    "revision": "b1f7a830aec71e5b78a18f19eb9a1b99"
  },
  {
    "url": "assets/js/35.cea61e10.js",
    "revision": "b179c981de0ca6638d6a12d592423f38"
  },
  {
    "url": "assets/js/36.5d61b32b.js",
    "revision": "19881ee665ce31c365f2cb1b2972e8c1"
  },
  {
    "url": "assets/js/37.b0f52ec8.js",
    "revision": "c550c0f7e12ae69f9f9de8084c572116"
  },
  {
    "url": "assets/js/38.2f5d8f9c.js",
    "revision": "61026fe01ef45267612205047075ecfa"
  },
  {
    "url": "assets/js/39.0fc0c2ed.js",
    "revision": "6f1787dc5ee86217f62fc5cd6ff2f1d1"
  },
  {
    "url": "assets/js/4.f8e09ced.js",
    "revision": "fb68c479f1c5dc819f7ac6ba11b3c5da"
  },
  {
    "url": "assets/js/40.faa8fb6c.js",
    "revision": "955521ca83d262b78b5ba70996417fa8"
  },
  {
    "url": "assets/js/41.201c93c2.js",
    "revision": "6a45e2ca5e44f55181481bcd9f3288a5"
  },
  {
    "url": "assets/js/42.6a11c78f.js",
    "revision": "d8dff034d09b03afedc4850008446cf2"
  },
  {
    "url": "assets/js/43.4eac5c07.js",
    "revision": "0ac993f78ab1ca8fc512dade37accc7b"
  },
  {
    "url": "assets/js/44.8a0d16c1.js",
    "revision": "8083b37d5b584b9034373912996f630c"
  },
  {
    "url": "assets/js/45.518378b7.js",
    "revision": "23dce464704a88f0935be31be7c0ba3e"
  },
  {
    "url": "assets/js/46.bf036cb4.js",
    "revision": "d801d4533a6505498992722613cdce0e"
  },
  {
    "url": "assets/js/47.62e42ee2.js",
    "revision": "a4cff84c31009b489a95736417176a05"
  },
  {
    "url": "assets/js/48.c5e17f76.js",
    "revision": "bc19999823296c062e1b1ecab0fc448a"
  },
  {
    "url": "assets/js/49.7e3fe945.js",
    "revision": "8227cc6fd416117d93a3bead28ea94b2"
  },
  {
    "url": "assets/js/5.cca85946.js",
    "revision": "cb123224273f521dad9db9fe8eadf54e"
  },
  {
    "url": "assets/js/50.dbe5a987.js",
    "revision": "c310e39ff54f7b405cfa4e49ee4a7527"
  },
  {
    "url": "assets/js/51.1c5994d3.js",
    "revision": "29144b6241c52bf5d2a78d9b21a87e0a"
  },
  {
    "url": "assets/js/52.66a85293.js",
    "revision": "1c89575796be2bea1bd1f2e2a9a20839"
  },
  {
    "url": "assets/js/53.06886e2c.js",
    "revision": "296e96ed5d18ae517ccfe6dc6a6c49d5"
  },
  {
    "url": "assets/js/54.7514f356.js",
    "revision": "90600fa6ac073b3ae50c51808e796ac0"
  },
  {
    "url": "assets/js/55.53be2816.js",
    "revision": "5f13692693730a561be740894dbecfd3"
  },
  {
    "url": "assets/js/56.6ed0ac4e.js",
    "revision": "c30e7719e6c9bca00027cdde72ee1c9b"
  },
  {
    "url": "assets/js/57.9d6c574e.js",
    "revision": "457113f1522af8ab20ecc8e5f8793c7f"
  },
  {
    "url": "assets/js/58.8f794f64.js",
    "revision": "134ae9e2aedc597410645f8be3484509"
  },
  {
    "url": "assets/js/59.17b4059d.js",
    "revision": "178a880d84b9c2b2fdd13f94c7d8f28e"
  },
  {
    "url": "assets/js/6.a30fe84d.js",
    "revision": "da9b62ee6f5566b0a6171be856ef4bf3"
  },
  {
    "url": "assets/js/60.73ec82c3.js",
    "revision": "d5d302af291c4a751a343dca88960c06"
  },
  {
    "url": "assets/js/61.7182b045.js",
    "revision": "1a41beff32b64f2b1628fce3b8dbad93"
  },
  {
    "url": "assets/js/62.941e0764.js",
    "revision": "1600d92afa5b08a8a56b70bcd4557554"
  },
  {
    "url": "assets/js/63.ef1046b3.js",
    "revision": "8124a047e9d9080fec380fb76fbf1412"
  },
  {
    "url": "assets/js/64.0f7bb0d8.js",
    "revision": "577780b682244f332bbeb69fdd243d29"
  },
  {
    "url": "assets/js/65.4ff22467.js",
    "revision": "4402602a75e2e7b7f801862f7c188f2a"
  },
  {
    "url": "assets/js/66.32e54eae.js",
    "revision": "4cebb2b74701dcf651f04a8b1eb0fdda"
  },
  {
    "url": "assets/js/67.9b6bdad5.js",
    "revision": "edd1f75ca8395a70c64de38eee1f256a"
  },
  {
    "url": "assets/js/68.c87b0c1e.js",
    "revision": "d75590bcc0e09dd2e9662876459dd072"
  },
  {
    "url": "assets/js/69.84767f25.js",
    "revision": "611f1f4ab000f7f7ac592b4be24c16c4"
  },
  {
    "url": "assets/js/7.11530215.js",
    "revision": "45806526b603a8588b17b8cd9cd16939"
  },
  {
    "url": "assets/js/70.e605b467.js",
    "revision": "c2b119733f62d82ec44f778b0d8ee485"
  },
  {
    "url": "assets/js/71.b6e0edfa.js",
    "revision": "557b96024fba11986e4c5296d612359f"
  },
  {
    "url": "assets/js/72.800052d5.js",
    "revision": "5252674ac1c4e1a97e771b7bc8aa318f"
  },
  {
    "url": "assets/js/73.43b24ebe.js",
    "revision": "c595b62db299d78d144a6e59981c991f"
  },
  {
    "url": "assets/js/74.34455322.js",
    "revision": "512de7ad18c6eea5415e2ab7693b0d3d"
  },
  {
    "url": "assets/js/75.cca4339d.js",
    "revision": "bdc5eb30f4c2b29fa80f45b7f9793868"
  },
  {
    "url": "assets/js/76.81cfff89.js",
    "revision": "ddcb3de923b90a3eaf11e251c5ede35b"
  },
  {
    "url": "assets/js/77.9fe9caac.js",
    "revision": "84b455d6d4b2fe03e348407d2bae509b"
  },
  {
    "url": "assets/js/78.d963f528.js",
    "revision": "2c21ac915e9e5dc61aaaf7dfd0a4cb90"
  },
  {
    "url": "assets/js/79.37fefdc0.js",
    "revision": "aed9e9ee63bbb674f408b9e9edb81fd3"
  },
  {
    "url": "assets/js/8.441834aa.js",
    "revision": "190994d1c10977ce04a025ee369fc3ed"
  },
  {
    "url": "assets/js/80.10359ae9.js",
    "revision": "16d9a50d9a5543f67b681a690905051d"
  },
  {
    "url": "assets/js/81.b470d135.js",
    "revision": "fcd0de93cb24b9bbe7e098c018bf5b4c"
  },
  {
    "url": "assets/js/82.371a3626.js",
    "revision": "80f2ddfb3ad0161b02ae2cc4523d65d0"
  },
  {
    "url": "assets/js/83.03bfecdb.js",
    "revision": "cbdd61a02dce2c06805d85f31cf7f4e5"
  },
  {
    "url": "assets/js/84.7ccdfbaf.js",
    "revision": "097ecf28b184d575dee8f38d53afd0b3"
  },
  {
    "url": "assets/js/85.ba1d1c0b.js",
    "revision": "42e7343673ba6e651e5d0078ae0a2bec"
  },
  {
    "url": "assets/js/86.9227467a.js",
    "revision": "0722c2529e204e209b69f40c1f7953b0"
  },
  {
    "url": "assets/js/87.e1886951.js",
    "revision": "cf23743fa9269c17c567dad0e730bf4d"
  },
  {
    "url": "assets/js/88.a14c11e2.js",
    "revision": "b78d87d4a84bd9ddd2946919818fb9d8"
  },
  {
    "url": "assets/js/89.19745fb8.js",
    "revision": "e1c96d10ac71403af0ef19d5b7240e06"
  },
  {
    "url": "assets/js/9.4f173aec.js",
    "revision": "cf4ba0e6d87498212e98a2bacdcfaba7"
  },
  {
    "url": "assets/js/90.f45df808.js",
    "revision": "5810afe3bdfda9a0396b91fda280ac01"
  },
  {
    "url": "assets/js/91.cfd9a851.js",
    "revision": "577e4ca6381634504d13329fdf1ed8b4"
  },
  {
    "url": "assets/js/92.78eff178.js",
    "revision": "c9b1acc8526b9934a8f6512dd54ed57d"
  },
  {
    "url": "assets/js/93.6744b020.js",
    "revision": "edddeca37aae5106b379e143f1cef334"
  },
  {
    "url": "assets/js/94.a1d78644.js",
    "revision": "d303e3113787218ef09131f59a3b9555"
  },
  {
    "url": "assets/js/95.8df34a7a.js",
    "revision": "644477c7cbb09ee0b543cd75c6a127b7"
  },
  {
    "url": "assets/js/96.b4bc5675.js",
    "revision": "1953dd74661152f421f1d6fc0f9a3781"
  },
  {
    "url": "assets/js/97.eb4beeba.js",
    "revision": "13fe26e1e5eae142032fbf1274772726"
  },
  {
    "url": "assets/js/98.4fc5f710.js",
    "revision": "c05e8f2ecfddfb40df0968a7de06a088"
  },
  {
    "url": "assets/js/99.0d73ab7c.js",
    "revision": "7fca32f44f034d442db6b8983688f71d"
  },
  {
    "url": "assets/js/app.1c3bfb52.js",
    "revision": "2c39e3b68242ce23f2b2d87cf95d57aa"
  },
  {
    "url": "css/advanced/animation.html",
    "revision": "d5f1c2aa2d68c6f6304bc8a81c09efcb"
  },
  {
    "url": "css/basis/css-bfc.html",
    "revision": "2b9b450e08b81e2cca2825c09260d60c"
  },
  {
    "url": "css/basis/css-box.html",
    "revision": "ec18c5dcc83598090991665de27c1710"
  },
  {
    "url": "css/basis/css-isuess.html",
    "revision": "64d5bf6aeb48b5a6c85fa6af56f95752"
  },
  {
    "url": "css/basis/css-layout.html",
    "revision": "9f69aa8bd3e12c44e629108b6640e9f9"
  },
  {
    "url": "css/index.html",
    "revision": "4bd553c55e8b228a2322c21f7bd0f37d"
  },
  {
    "url": "hero.jpg",
    "revision": "fa94c3c6ee1117d73a9da4392072af45"
  },
  {
    "url": "images/0001.png",
    "revision": "7b891149f4699fd9f75f956d82e0a935"
  },
  {
    "url": "images/css/IE盒模型.png",
    "revision": "59602bb158f99f70dad86669f940b623"
  },
  {
    "url": "images/css/W3C盒模型.png",
    "revision": "35f30a9ea485340b4d7b296d248ed9b3"
  },
  {
    "url": "images/flow.png",
    "revision": "983ea11f68f23d6a3229e13eafea6dc7"
  },
  {
    "url": "images/icons/android-icon-192x192.png",
    "revision": "5d10eaab941eb596ee59ffc53652d035"
  },
  {
    "url": "images/icons/android-icon-48x48.png",
    "revision": "0d33c4fc51e2bb020bf8dd7cd05db875"
  },
  {
    "url": "images/icons/android-icon-72x72.png",
    "revision": "702c4fafca31d670f9bd8b2d185ced39"
  },
  {
    "url": "images/icons/android-icon-96x96.png",
    "revision": "0ebff702851985ea6ba891cf6e6e7ddd"
  },
  {
    "url": "images/icons/apple-icon-144x144.png",
    "revision": "e67b8d54852c2fbf40be2a8eb0590f5b"
  },
  {
    "url": "images/icons/apple-icon-152x152.png",
    "revision": "f53787bf41febf2b044931a305ccaf2a"
  },
  {
    "url": "images/icons/ms-icon-144x144.png",
    "revision": "e67b8d54852c2fbf40be2a8eb0590f5b"
  },
  {
    "url": "images/javascript/chrome事件循环.png",
    "revision": "6e4dbe0c4f1e468b65b2cd15a16370fc"
  },
  {
    "url": "images/javascript/CSRF攻击.png",
    "revision": "8b67dcf1ce7febf0cb8daf801db30b14"
  },
  {
    "url": "images/javascript/CSS解析1.png",
    "revision": "29d67ba690faf21867bc0385cbef3fad"
  },
  {
    "url": "images/javascript/CSS解析2.png",
    "revision": "f10e2a5094168216dd665d00962ed3c0"
  },
  {
    "url": "images/javascript/CSS解析3.png",
    "revision": "294c957255a56244e1d52b3259d7da47"
  },
  {
    "url": "images/javascript/DNS1.png",
    "revision": "5add57e300281cbd24fa4f6bd1ed4416"
  },
  {
    "url": "images/javascript/DOM事件模型.png",
    "revision": "cfe28b458998c13b5969bba54b4e9d7a"
  },
  {
    "url": "images/javascript/HTML解析.png",
    "revision": "536fac8435a030e5bf275bbb81f122ef"
  },
  {
    "url": "images/javascript/HTML解析2.png",
    "revision": "061d5c6167375d05dfb62789669d3ac5"
  },
  {
    "url": "images/javascript/http0.9.png",
    "revision": "be066276d47f090ed722ec4c1afc77d0"
  },
  {
    "url": "images/javascript/http1.0.png",
    "revision": "2cace845ae4111c6e154290c80061890"
  },
  {
    "url": "images/javascript/http2.0.png",
    "revision": "1e2614a6cf39fdd4c1ae0dd04280a24a"
  },
  {
    "url": "images/javascript/http3.0-1.png",
    "revision": "b08890167b69846d007fdea6814f417d"
  },
  {
    "url": "images/javascript/http3.0.png",
    "revision": "f977e1412d4e589322e49aee47e1b8e0"
  },
  {
    "url": "images/javascript/https传输.png",
    "revision": "2095096d2e207fb204d111af0da92487"
  },
  {
    "url": "images/javascript/https数字证书.png",
    "revision": "19d8513346ca486e19b5fe6dcd5f06e2"
  },
  {
    "url": "images/javascript/http发展史.png",
    "revision": "2695b81304b733751994ff59588dd794"
  },
  {
    "url": "images/javascript/http响应报文.png",
    "revision": "f21347d6e001b00fc85406f1ffff82d4"
  },
  {
    "url": "images/javascript/http安全层.png",
    "revision": "5841a961ee2fceaf29840dca48dc2e67"
  },
  {
    "url": "images/javascript/http状态码.png",
    "revision": "30d1deb88d490309636d1bc980b2afb6"
  },
  {
    "url": "images/javascript/http请求报文.png",
    "revision": "c1cd156cd323098750346d8b2764dd98"
  },
  {
    "url": "images/javascript/http请求方法1.png",
    "revision": "69dbc98d31776c3d4bba530ff69c979f"
  },
  {
    "url": "images/javascript/http请求方法2.png",
    "revision": "c5c1da53e75ecb0c192dfbfafda1d7b6"
  },
  {
    "url": "images/javascript/JS编译执行流程.png",
    "revision": "16cb8f650b723a2d62e869cb50f0eb98"
  },
  {
    "url": "images/javascript/OSI七层模型.png",
    "revision": "23d1be7e686c8d6292b9cd3080516cc3"
  },
  {
    "url": "images/javascript/Promise2.png",
    "revision": "ceebbd1e67a5eb64dbdfbbc91b21af57"
  },
  {
    "url": "images/javascript/promiseA.png",
    "revision": "dc4bef591a808b2f858a7cb084a859bc"
  },
  {
    "url": "images/javascript/prototype1.png",
    "revision": "5fa1915a3676d13accbace386d218273"
  },
  {
    "url": "images/javascript/prototype2.png",
    "revision": "0eda1a47a5b7c2c7c9e52ccc217854bb"
  },
  {
    "url": "images/javascript/prototype3.png",
    "revision": "b81ab344ff53db546cbbf905dff010dc"
  },
  {
    "url": "images/javascript/setTimeout存储.png",
    "revision": "af85bbbf95d7e7d7b9bc67d7d710329f"
  },
  {
    "url": "images/javascript/setTimeout触发.png",
    "revision": "4cd9a4f6643c32a9657360edec713f85"
  },
  {
    "url": "images/javascript/sushijs-cover.png",
    "revision": "c5e1e59008c297ff75b54ae4eb7f4c1d"
  },
  {
    "url": "images/javascript/TCP三次握手.png",
    "revision": "0802046ac9f330f158084bf9b6072044"
  },
  {
    "url": "images/javascript/TCP四次挥手.png",
    "revision": "78b3b120dbd3cb6f191521386be63165"
  },
  {
    "url": "images/javascript/tcp报文.png",
    "revision": "c7407b2a17c4572d321fe74673e8b905"
  },
  {
    "url": "images/javascript/TCP模型1.png",
    "revision": "d388b39ef632d9ff09e3812f7246c1dc"
  },
  {
    "url": "images/javascript/TCP模型2.png",
    "revision": "1058dfc626d551fcfda81f7035812667"
  },
  {
    "url": "images/javascript/TCP模型3.png",
    "revision": "3bb7af668e5d923f4d8c9b38d535dc3d"
  },
  {
    "url": "images/javascript/TCP模型4.png",
    "revision": "c127fc64a0f95eff5f152771aeabf781"
  },
  {
    "url": "images/javascript/this.png",
    "revision": "edfd90e5e77c2bce1499217b15e1ce44"
  },
  {
    "url": "images/javascript/web安全.png",
    "revision": "3a5046ba6a6196bc8bc606566bc91345"
  },
  {
    "url": "images/javascript/事件循环.png",
    "revision": "31c6fdc64cd4ebccc729bdd639aa787a"
  },
  {
    "url": "images/javascript/从url到页面渲染.png",
    "revision": "49b4883e54928a834d5fbbaf069d682e"
  },
  {
    "url": "images/javascript/分层.png",
    "revision": "daf97beb7531524ca19820c7f91adf47"
  },
  {
    "url": "images/javascript/合成.png",
    "revision": "222ed465220aff3b83a3c80d3914f0db"
  },
  {
    "url": "images/javascript/垃圾回收1.png",
    "revision": "1135c88ae74da8f05b628f2519bd9911"
  },
  {
    "url": "images/javascript/垃圾回收2.png",
    "revision": "9cf949d066532979a61cfee512cd0346"
  },
  {
    "url": "images/javascript/垃圾回收3.png",
    "revision": "b3257a1dd96ab6e07a6dd003619e6755"
  },
  {
    "url": "images/javascript/布局树.png",
    "revision": "dec4fb9cc6cb146ab8d1ea1bd8cc74ab"
  },
  {
    "url": "images/javascript/异步方案.png",
    "revision": "7765d13495baee326096d4c0d2b61aee"
  },
  {
    "url": "images/javascript/微任务.png",
    "revision": "28145da8e1aefd3c37eecf44092656c0"
  },
  {
    "url": "images/javascript/栅格化1.png",
    "revision": "6dba08eabb8bfcde4ab02eb55baf3c21"
  },
  {
    "url": "images/javascript/栅格化2.png",
    "revision": "7cc97dbe3d11f817aff2ef9b3afe0e36"
  },
  {
    "url": "images/javascript/栅格化3.png",
    "revision": "303a36090f792a9b18635d61efc5e297"
  },
  {
    "url": "images/javascript/浏览器安全.png",
    "revision": "112e16e39fb915e127eaf52edbe7c839"
  },
  {
    "url": "images/javascript/浏览器安全架构.png",
    "revision": "a232eae964d2cc3d74ebc47499f8822a"
  },
  {
    "url": "images/javascript/浏览器渲染流程.png",
    "revision": "aed9017d3d4c155b229387b3877e7f32"
  },
  {
    "url": "images/javascript/浏览器渲染流程2.png",
    "revision": "311f24bf1de0a6661039da290de58aa6"
  },
  {
    "url": "images/javascript/浏览器渲染线程.png",
    "revision": "d18340ec081c8df22f806338c5401b01"
  },
  {
    "url": "images/javascript/浏览器缓存.png",
    "revision": "1139c12306af59cd4796b175898c7bb1"
  },
  {
    "url": "images/javascript/浏览器缓存流程.png",
    "revision": "bb0e2a6c61ab4be4efe6420f47c9b9fb"
  },
  {
    "url": "images/javascript/浏览器进程.png",
    "revision": "ccc1770b8910de467520d1ada1822a26"
  },
  {
    "url": "images/javascript/绘制.png",
    "revision": "aa2fb18bbaf298dd85a80efc8e5af17d"
  },
  {
    "url": "images/javascript/重排.png",
    "revision": "68dab6eb592f3831a24bd40a4a2568e4"
  },
  {
    "url": "images/javascript/重绘.png",
    "revision": "7b48961c3bcf8cfc5e3f3cb1818652ff"
  },
  {
    "url": "images/observe1.jpg",
    "revision": "418a8b1743d8667553e5ac156f64be86"
  },
  {
    "url": "images/observe2.jpg",
    "revision": "43cef9defc524ebbe1aa57295a2fa848"
  },
  {
    "url": "images/observe3.jpg",
    "revision": "a57934f8ad6b51dd7f4b2357b6af39a7"
  },
  {
    "url": "images/optimization/CDN原理1.png",
    "revision": "4ebf069bff0005ad6b1de04d8d47444d"
  },
  {
    "url": "images/optimization/CDN原理2.png",
    "revision": "253fdffc0b150e87d45de31b52234ca3"
  },
  {
    "url": "images/optimization/浏览器渲染过程.png",
    "revision": "96e4764c46ce288cd9999504a4f1d64f"
  },
  {
    "url": "images/optimization/渲染流水线.png",
    "revision": "c56ca03370fbeeaf2a1a6d521bc896cb"
  },
  {
    "url": "images/proxy1.jpg",
    "revision": "97e5c2eaad406f2702c0e48e46f84347"
  },
  {
    "url": "images/proxy2.jpg",
    "revision": "d42e80843512a53c5f6f0a51234b590b"
  },
  {
    "url": "images/vue/vue响应式原理1.png",
    "revision": "1a679364db50d1e67bf87992a55380ed"
  },
  {
    "url": "images/vue/vue响应式原理2.png",
    "revision": "c9e2ac37da79756f05c65ed8c88880c4"
  },
  {
    "url": "images/vue/更新节点.png",
    "revision": "7b0442aa3cd674f486654c33280ecdfa"
  },
  {
    "url": "images/vue/模板编译与渲染1.png",
    "revision": "8168243d5185707b354082d0ed707708"
  },
  {
    "url": "images/vue/模板编译与渲染2.png",
    "revision": "5e163110b118ea7a67e7b2e4cfc5b584"
  },
  {
    "url": "images/vuex.png",
    "revision": "288a0dc913bab3fe765baf18fb4bac27"
  },
  {
    "url": "index.html",
    "revision": "1868be72aff46c795323def17da5fe7e"
  },
  {
    "url": "javascript/browser/browser-cache.html",
    "revision": "ce10b2af510c0be8c776a3aba401de46"
  },
  {
    "url": "javascript/browser/browser-render.html",
    "revision": "fa7a0f49ac8796ee4e33d270ac30364a"
  },
  {
    "url": "javascript/browser/browser-start.html",
    "revision": "9b5514683148d0d25059696d1907a8f6"
  },
  {
    "url": "javascript/browser/cross-domain.html",
    "revision": "d3e9f54567deef10860d83eef49565ef"
  },
  {
    "url": "javascript/browser/DNS.html",
    "revision": "7a948b30a9fe384f457e76c7f191790b"
  },
  {
    "url": "javascript/browser/http-history.html",
    "revision": "9e9466a76a533dafbf6fd3772f3faac6"
  },
  {
    "url": "javascript/browser/http-message.html",
    "revision": "156302f9cd9f25ed122b8a9e23147b06"
  },
  {
    "url": "javascript/browser/http-methods.html",
    "revision": "1ecd7c29f7d3368c020bf5ffc9733f82"
  },
  {
    "url": "javascript/browser/http-status.html",
    "revision": "6a453b7c0a1d8d7bc46e6e52d5262860"
  },
  {
    "url": "javascript/browser/js-gc.html",
    "revision": "83ee5f31252bd6de48e06a423abab1f1"
  },
  {
    "url": "javascript/browser/network-OSI.html",
    "revision": "6b4b2137176f693666ccf345f6f471a0"
  },
  {
    "url": "javascript/browser/network-tcp.html",
    "revision": "702d82aa76de3c8e8fc65490a2e0d1fe"
  },
  {
    "url": "javascript/browser/network-websocket.html",
    "revision": "8d8ce4022f8495ff5f4be8cfaa8b25b2"
  },
  {
    "url": "javascript/browser/reference.html",
    "revision": "0080d8a389f0f8644646305325a1924e"
  },
  {
    "url": "javascript/browser/web-attack.html",
    "revision": "1599532f409828dd549d5ba7ca33f559"
  },
  {
    "url": "javascript/browser/web-security.html",
    "revision": "739aab8f5e77a7a4b2fed6383826d25c"
  },
  {
    "url": "javascript/browser/web-storage.html",
    "revision": "a40e67638ed17711ec3688ebec58c81c"
  },
  {
    "url": "javascript/depth/arguments.html",
    "revision": "9827ceb9555dfc100a1845b1f52eb094"
  },
  {
    "url": "javascript/depth/arrow-function.html",
    "revision": "f3c120a423458504c586c9e60206c6a4"
  },
  {
    "url": "javascript/depth/async-achieve.html",
    "revision": "1eb772211d3d8c946792e1b71879e798"
  },
  {
    "url": "javascript/depth/async-plan.html",
    "revision": "0307cb5fd8429a59884347cc6f5d6532"
  },
  {
    "url": "javascript/depth/closure.html",
    "revision": "06c014c88f0cbe0680a65fc7a4a08597"
  },
  {
    "url": "javascript/depth/decorator.html",
    "revision": "eef2af0eec29f69d3707cd522d0a2f14"
  },
  {
    "url": "javascript/depth/ECS.html",
    "revision": "e1c738b55336dfa14912a10230f85c77"
  },
  {
    "url": "javascript/depth/event-loop.html",
    "revision": "c903249efb928299e7f4fa9a65291260"
  },
  {
    "url": "javascript/depth/module.html",
    "revision": "be570dc5df1525c0ff34bc1dd4af2362"
  },
  {
    "url": "javascript/depth/prototype.html",
    "revision": "8b01882cdc516605c01ff9a23627c664"
  },
  {
    "url": "javascript/depth/proxy-reflect.html",
    "revision": "b5110bd9711a1ce2eac16f7d2afbad21"
  },
  {
    "url": "javascript/depth/reference.html",
    "revision": "624ee9a298b1801dfaaa9b73259aebba"
  },
  {
    "url": "javascript/depth/scope-chain.html",
    "revision": "b9d9005ead7a52c92ebfa5a84b9f8fe2"
  },
  {
    "url": "javascript/depth/scope.html",
    "revision": "34340e99128bc63a8a052944a2a2876b"
  },
  {
    "url": "javascript/depth/set-map.html",
    "revision": "19eaaf3f12f3fb5f17d79ad9aa66a3c4"
  },
  {
    "url": "javascript/depth/this.html",
    "revision": "8062693293aa26259d8e268ebe20532b"
  },
  {
    "url": "javascript/depth/var.html",
    "revision": "038401e85f1cbfb3493f59411fc74c4e"
  },
  {
    "url": "javascript/depth/VO.html",
    "revision": "c5e406b1685bb59b4923a2e1fddaff05"
  },
  {
    "url": "javascript/dom/dom-event.html",
    "revision": "767a3fec71d3d17bf7093c9a0928b7df"
  },
  {
    "url": "javascript/index.html",
    "revision": "f89d74fb426f80ecf5d2b3392e1fa348"
  },
  {
    "url": "logo.png",
    "revision": "f85f82780b0ebed5e2eae82a64fe3022"
  },
  {
    "url": "mobile/index.html",
    "revision": "b4e939ccaccd9ef472563dbd00780f40"
  },
  {
    "url": "node/index.html",
    "revision": "cd8ce163bae2626a59a4b2acb333a747"
  },
  {
    "url": "node/optimization/http.html",
    "revision": "87568cd0b206b8f5242a1c2af664db0a"
  },
  {
    "url": "optimization/error/capture.html",
    "revision": "8373f4432882b517aa8c40f3bd199193"
  },
  {
    "url": "optimization/error/monitor.html",
    "revision": "01b32b83fd7f00750c83811bc909a868"
  },
  {
    "url": "optimization/images/reference.html",
    "revision": "294024da3f35401941708512b85a19b5"
  },
  {
    "url": "optimization/index.html",
    "revision": "bc43050e3f2ec2c7716bafdba35f3ec7"
  },
  {
    "url": "optimization/performance/analysis.html",
    "revision": "9d82810a2f0d483bef4c30fb5ba737f7"
  },
  {
    "url": "optimization/performance/code.html",
    "revision": "b99f8eec95c0268d5e791b61e6c8a367"
  },
  {
    "url": "optimization/performance/network.html",
    "revision": "abb8e52a83d34555dd29bb82251bb35b"
  },
  {
    "url": "optimization/performance/render.html",
    "revision": "cb68e3846399c60ea8f0a2beac37e827"
  },
  {
    "url": "optimization/performance/webpack.html",
    "revision": "fdb5d18c53a012252e7606bbaef40de9"
  },
  {
    "url": "optimization/webpack/abstract.html",
    "revision": "71bc643721bae2cedd470bf1cc69ce07"
  },
  {
    "url": "optimization/webpack/application.html",
    "revision": "25f48fc9639dfe4b0a30c075bf765a54"
  },
  {
    "url": "optimization/webpack/configuration.html",
    "revision": "9463cd1580e4c79f2ae20b726735d783"
  },
  {
    "url": "talk/auth.html",
    "revision": "cd4aeb2b51bcdc4b383e9bc66fadf2fa"
  },
  {
    "url": "talk/BFF.html",
    "revision": "384bbf90e784ee0e69f71c233e5e3530"
  },
  {
    "url": "talk/friendship-link.html",
    "revision": "9ece703519728778dc2cee77b2281176"
  },
  {
    "url": "talk/index.html",
    "revision": "164314214e4eef88e99f473044135fd4"
  },
  {
    "url": "talk/micro-frontend.html",
    "revision": "e73a71146ca1b0fcb81888cf168f60e4"
  },
  {
    "url": "typescript/advanced/abstract.html",
    "revision": "be7df379845503ef7ea7629f4ce68249"
  },
  {
    "url": "typescript/basis/abstract.html",
    "revision": "144d1c6cd7b3d4e4229433a49901f462"
  },
  {
    "url": "typescript/index.html",
    "revision": "92d44beb918719d9189985a3e703c894"
  },
  {
    "url": "vue/index.html",
    "revision": "52522382aa20434c564a336b0a43b38c"
  },
  {
    "url": "vue/interview/vue-communication.html",
    "revision": "4d57580c6b49154acb8dfb6500c1612c"
  },
  {
    "url": "vue/interview/vue-symbols.html",
    "revision": "e139216ae2f3232728bedddc199e185e"
  },
  {
    "url": "vue/interview/vue-test.html",
    "revision": "3da17f8c1ba37b90a6b597babd093f03"
  },
  {
    "url": "vue/vue-router/abstract.html",
    "revision": "9c6077adf8d562a41bebad4f58818d9a"
  },
  {
    "url": "vue/vue-router/initialization.html",
    "revision": "dd2018aec20722e8f074dd403079f0c5"
  },
  {
    "url": "vue/vue-router/match.html",
    "revision": "1d529c0e4c9916773bad28b4ed55e5ec"
  },
  {
    "url": "vue/vue-router/plugin.html",
    "revision": "b3db4f5121f98ac7a0d836b3d6921045"
  },
  {
    "url": "vue/vue-router/scroll.html",
    "revision": "0bb826d8056b068c27202b064997c1aa"
  },
  {
    "url": "vue/vue-router/summary.html",
    "revision": "4f5853e168bd82f1069d601a07cec632"
  },
  {
    "url": "vue/vue-router/transitions.html",
    "revision": "5057254976175e3dc67cb3f81bb50bfa"
  },
  {
    "url": "vue/vue-router/warmUp.html",
    "revision": "71210fec982f7b0c54b59820a8d985ec"
  },
  {
    "url": "vue/vue/github.html",
    "revision": "e4636f6e2096bf8f3665e7a6f3e7e416"
  },
  {
    "url": "vue/vue/vue-diff.html",
    "revision": "01067d5193daac89448d1d1952e63100"
  },
  {
    "url": "vue/vue/vue-init.html",
    "revision": "f57d25d9cc2e8bd84d07bf2724cd132b"
  },
  {
    "url": "vue/vue/vue-observer.html",
    "revision": "040f8ed7a378bc106ee2181f315f4f6c"
  },
  {
    "url": "vue/vue/vue-render.html",
    "revision": "cbbee0174d68db50f1d1d41df2d4f64d"
  },
  {
    "url": "vue/vue/vue-router.html",
    "revision": "40d25b709f0c5665a0028e1fd19d3e14"
  },
  {
    "url": "vue/vue/vue-template.html",
    "revision": "6dd27bb64d43fb191741c8f5cfa81bc0"
  },
  {
    "url": "vue/vue/vue-vuex.html",
    "revision": "10acfab6145e4495826ceac69675a48e"
  },
  {
    "url": "vue/vue3.x/abstract.html",
    "revision": "731593e18740e319ca760a58071f6c5b"
  },
  {
    "url": "vue/vue3.x/features.html",
    "revision": "de6560399c00cb4245c1192048b52791"
  },
  {
    "url": "vue/vue3.x/performance.html",
    "revision": "d3ec4b9a79670ff6cda256a820847f69"
  },
  {
    "url": "vue/vue3.x/reactivity.html",
    "revision": "8dbe141833d20ed284c28866765938b1"
  },
  {
    "url": "vue/vuex/abstract.html",
    "revision": "0e479e721e9517c2ea93ca80c818d427"
  },
  {
    "url": "vue/vuex/actions.html",
    "revision": "ff4744149f6b4759153809438a2bd47f"
  },
  {
    "url": "vue/vuex/getters.html",
    "revision": "8d7f7d3367b4812c1029a4dec5fde0b5"
  },
  {
    "url": "vue/vuex/initialization.html",
    "revision": "e94dd7634c4bdb615a20d2b29b305327"
  },
  {
    "url": "vue/vuex/modules.html",
    "revision": "6b4ec993ab957460027c001364bd377a"
  },
  {
    "url": "vue/vuex/mutations.html",
    "revision": "8e5239fb5f68a457b4591ea596fb831e"
  },
  {
    "url": "vue/vuex/others.html",
    "revision": "0987be36f087b98118d65c0d3c701b74"
  },
  {
    "url": "vue/vuex/state.html",
    "revision": "a447fb40cb0bc9fb57da2103e4825850"
  },
  {
    "url": "vue/vuex/warmUp.html",
    "revision": "dbbfa3c6e749d212cfa5b8ddf65192a5"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
