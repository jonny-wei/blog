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
    "revision": "9c04874d535d5653b7ecc5aa2bcbed95"
  },
  {
    "url": "assets/css/0.styles.4a49bc7c.css",
    "revision": "586cf4e90812050898b092b499826254"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.8bc586ae.js",
    "revision": "f39ec13b585f59a19a70a2a568973dde"
  },
  {
    "url": "assets/js/11.dffbaf31.js",
    "revision": "c8553012bc268d1fb354778effc29083"
  },
  {
    "url": "assets/js/12.99ded477.js",
    "revision": "8c1e2326a953add4237f01862ab19f93"
  },
  {
    "url": "assets/js/13.5d9ddde9.js",
    "revision": "7c02cd8b8d704981c31276c9a3a09f4f"
  },
  {
    "url": "assets/js/14.31478e4a.js",
    "revision": "8a6b7844f12d5683b522f06812db3a08"
  },
  {
    "url": "assets/js/15.15f879db.js",
    "revision": "83ae5486e7b766dd5de26e2d93c36783"
  },
  {
    "url": "assets/js/16.014e0e4b.js",
    "revision": "6dec8392006c57c030ace7679eed2282"
  },
  {
    "url": "assets/js/17.6f2d16a9.js",
    "revision": "f27d0f0e591c9fd30e409e370c040022"
  },
  {
    "url": "assets/js/18.8f544422.js",
    "revision": "7972d350345a73aa31cb54c7af02021f"
  },
  {
    "url": "assets/js/19.1243c36b.js",
    "revision": "d210bac14f4248b01993c95aa9bf6310"
  },
  {
    "url": "assets/js/2.2a4e8c54.js",
    "revision": "17a61760616a0c551279fa586e709188"
  },
  {
    "url": "assets/js/20.d58dfb58.js",
    "revision": "cd8d96fb98757fe29783ae575d96f6c5"
  },
  {
    "url": "assets/js/21.0c26b5a2.js",
    "revision": "f1aaba2333e4c9c60bd69d7546d6a210"
  },
  {
    "url": "assets/js/22.e7b3da39.js",
    "revision": "a0f72ce0371e035ae97da40cb8f5f78b"
  },
  {
    "url": "assets/js/23.55982869.js",
    "revision": "558f871b90f9cc1f59b6f158d3721897"
  },
  {
    "url": "assets/js/24.6f093e2e.js",
    "revision": "fd8fa327a37c897880fc6bbe9fa67989"
  },
  {
    "url": "assets/js/25.816222a6.js",
    "revision": "5fd840e637da646b0ddc821b81c5a055"
  },
  {
    "url": "assets/js/26.372e2ea2.js",
    "revision": "c0d3f4da8af62888a52dc98415be95ce"
  },
  {
    "url": "assets/js/27.d2f42b13.js",
    "revision": "ae1d099e990617e43ebd74359d2636e3"
  },
  {
    "url": "assets/js/28.7b4fa31d.js",
    "revision": "9a280543535aeb69e04f30b3a470382d"
  },
  {
    "url": "assets/js/29.8555f961.js",
    "revision": "62e1cc5eec80769e89a0caf1bb9eb3e1"
  },
  {
    "url": "assets/js/3.07d27621.js",
    "revision": "4270f1a92575283cdcd263757149b603"
  },
  {
    "url": "assets/js/30.92fb85d7.js",
    "revision": "928e7dac799294e22b6a4c55f99ee575"
  },
  {
    "url": "assets/js/31.491bf9df.js",
    "revision": "b41ba01c4680b61764085e6735cacaca"
  },
  {
    "url": "assets/js/32.7e42bda4.js",
    "revision": "8feaee9c25f07266a572f5ea15aed31d"
  },
  {
    "url": "assets/js/33.1049c080.js",
    "revision": "dde8a872ba21f0b0464d8e351ff5a699"
  },
  {
    "url": "assets/js/34.03e230e0.js",
    "revision": "b074693829b47ce5996d991a486e73f3"
  },
  {
    "url": "assets/js/35.3c360fe7.js",
    "revision": "9b0c4609722dde4edbc268b4c4d2de16"
  },
  {
    "url": "assets/js/36.f40ed418.js",
    "revision": "f09c80591c89d06031592bec55458f9a"
  },
  {
    "url": "assets/js/37.97d4e6e2.js",
    "revision": "9c62fb8af140a4ebaaae41e3c364ad28"
  },
  {
    "url": "assets/js/38.5731e69b.js",
    "revision": "7c32fc8642f55dc1ddde9d560b8f56f3"
  },
  {
    "url": "assets/js/39.401cdb69.js",
    "revision": "d9e3cf8f62bc1cd39e3f3856cdc28b01"
  },
  {
    "url": "assets/js/4.2bef4353.js",
    "revision": "29cf7421a4ea69927a798f164f835563"
  },
  {
    "url": "assets/js/40.5681cfae.js",
    "revision": "de55ccf7d6606826ae5534623c666abf"
  },
  {
    "url": "assets/js/41.8df81454.js",
    "revision": "f49d47bf2b07683721b35faa1457324f"
  },
  {
    "url": "assets/js/42.a8beb787.js",
    "revision": "52a7bd1819199c97ef0277cfe7f0ae18"
  },
  {
    "url": "assets/js/43.d36b853e.js",
    "revision": "c56310a52781dffc8145bc133596b497"
  },
  {
    "url": "assets/js/44.7b662c60.js",
    "revision": "7fbf18a9fb1ab874978097e2a8198076"
  },
  {
    "url": "assets/js/45.d4830d14.js",
    "revision": "0b0d489d3a13be3185d46be0cfe05ba8"
  },
  {
    "url": "assets/js/5.5d40c251.js",
    "revision": "efc22723a51aff3f67319e723a515f44"
  },
  {
    "url": "assets/js/6.08d6e999.js",
    "revision": "e2077080f7fc9c020cab26cb4b735fd1"
  },
  {
    "url": "assets/js/7.96560134.js",
    "revision": "48eb7f7d5f8bcabb74c3cc7bc36f3158"
  },
  {
    "url": "assets/js/8.f4a7eed1.js",
    "revision": "3ba2dc84eb577d9e2dcbb8245aa56e8a"
  },
  {
    "url": "assets/js/9.1ef431dd.js",
    "revision": "7cf3cf8cc105dd0ab5a49d20671a205b"
  },
  {
    "url": "assets/js/app.8e3c4e3c.js",
    "revision": "33df55b2b0f735d4e6810ab912a57585"
  },
  {
    "url": "css/advanced/abstract.html",
    "revision": "e88ac2fc7561486b9804b8558f69e666"
  },
  {
    "url": "css/basis/abstract.html",
    "revision": "0e7c5d4d14d7b7bcb629dcf571271110"
  },
  {
    "url": "css/basis/layout.html",
    "revision": "7277cfac5820c5d7725164e215f3428c"
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
    "url": "images/proxy1.jpg",
    "revision": "97e5c2eaad406f2702c0e48e46f84347"
  },
  {
    "url": "images/proxy2.jpg",
    "revision": "d42e80843512a53c5f6f0a51234b590b"
  },
  {
    "url": "images/vuex.png",
    "revision": "288a0dc913bab3fe765baf18fb4bac27"
  },
  {
    "url": "index.html",
    "revision": "62c3350312dd2464395dc79653b33ad7"
  },
  {
    "url": "javascript/book/chapter1.html",
    "revision": "c0bcfa98e2f769d92db536f6c65dc225"
  },
  {
    "url": "javascript/book/chapter2.html",
    "revision": "6dccdf92b080f427a508d45e144c3731"
  },
  {
    "url": "logo.png",
    "revision": "f85f82780b0ebed5e2eae82a64fe3022"
  },
  {
    "url": "mobile/index.html",
    "revision": "859d8600c30a6a374628d25bfd909d7b"
  },
  {
    "url": "optimization/index.html",
    "revision": "1ac0345d2c23077cf9621e126a478bea"
  },
  {
    "url": "optimization/webpack/abstract.html",
    "revision": "3190e884e07278d2bbf00f0d8d5e72ef"
  },
  {
    "url": "optimization/webpack/application.html",
    "revision": "4fc212b7c95fb53ffaceb37e3481b41b"
  },
  {
    "url": "optimization/webpack/configuration.html",
    "revision": "73d2b66bb7a5732868a6039c92a9743b"
  },
  {
    "url": "typescript/advanced/abstract.html",
    "revision": "e120cc564e9c03603e00fa888d7ab30e"
  },
  {
    "url": "typescript/basis/abstract.html",
    "revision": "383263478ce8116c91159fe161a376c6"
  },
  {
    "url": "typescript/index.html",
    "revision": "0aee39612c038644be85a4d4d7782e97"
  },
  {
    "url": "vue/vue-router/abstract.html",
    "revision": "19b11196b6c7fe363fab99c23470f337"
  },
  {
    "url": "vue/vue-router/initialization.html",
    "revision": "f2c9f50452a526a8ddf1f0a448d7710a"
  },
  {
    "url": "vue/vue-router/match.html",
    "revision": "feac54790e5be18c303209d29edc8c77"
  },
  {
    "url": "vue/vue-router/plugin.html",
    "revision": "10b2df8272cd6b566c3d31984f7e6758"
  },
  {
    "url": "vue/vue-router/scroll.html",
    "revision": "192a58838569956905f26d70879d79d9"
  },
  {
    "url": "vue/vue-router/summary.html",
    "revision": "6474d507e2c42c2c6fe279ee921275d2"
  },
  {
    "url": "vue/vue-router/transitions.html",
    "revision": "ddb6d84eafaf26f9c2ccb7773eee920b"
  },
  {
    "url": "vue/vue-router/warmUp.html",
    "revision": "9f136323f573ae2bb92e38a4d918626f"
  },
  {
    "url": "vue/vue/guide.html",
    "revision": "df226746b910daa2b91c703134736b07"
  },
  {
    "url": "vue/vue/vue-render.html",
    "revision": "50efbc1b5f3204b424f46b8e865e13be"
  },
  {
    "url": "vue/vue3.x/abstract.html",
    "revision": "d97262247b5b2495f5c718aac8f598fe"
  },
  {
    "url": "vue/vue3.x/features.html",
    "revision": "897315b99c512f965c55b916683d817d"
  },
  {
    "url": "vue/vue3.x/performance.html",
    "revision": "b56b05c354c4a47be378876ca6c174b1"
  },
  {
    "url": "vue/vue3.x/reactivity.html",
    "revision": "b7b08450ad83d698fedd525db0ea39f8"
  },
  {
    "url": "vue/vuex/abstract.html",
    "revision": "3fe9ad9c68026151e57fcae5c51ebcd2"
  },
  {
    "url": "vue/vuex/actions.html",
    "revision": "e285ad64b51468dd51acd0473ace85d9"
  },
  {
    "url": "vue/vuex/getters.html",
    "revision": "4d09f1db4f346911be440f517208b73c"
  },
  {
    "url": "vue/vuex/initialization.html",
    "revision": "be7c3b7b24d63907cf2cd58f8304918a"
  },
  {
    "url": "vue/vuex/modules.html",
    "revision": "6ccaf9f2b9043886000183f8321c3e7b"
  },
  {
    "url": "vue/vuex/mutations.html",
    "revision": "682603621ef22b1364792515b5229b24"
  },
  {
    "url": "vue/vuex/others.html",
    "revision": "d31af35ef6e84240577547ecb341692d"
  },
  {
    "url": "vue/vuex/state.html",
    "revision": "395ad5094ab3f1d4b4774ee9e1bf3656"
  },
  {
    "url": "vue/vuex/warmUp.html",
    "revision": "0852c7f376d54e9505d6364d5a3ec0ee"
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
