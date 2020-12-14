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
    "revision": "e4380b3b3eaa258964cb8c41d91b2874"
  },
  {
    "url": "assets/css/0.styles.929686f3.css",
    "revision": "be533b455b21cb83238ea9fcefb6a9fc"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.8e33bb1b.js",
    "revision": "75c7f8798f2d353fc5c71ff00f13fb20"
  },
  {
    "url": "assets/js/11.10d5ee71.js",
    "revision": "02469d386408f6675b815b853bdde6ac"
  },
  {
    "url": "assets/js/12.a0a2aa11.js",
    "revision": "4c532d872245b5ad007f87386a06de35"
  },
  {
    "url": "assets/js/13.4c074348.js",
    "revision": "769799ba8e0506190d889f6a2a63492a"
  },
  {
    "url": "assets/js/14.65da9136.js",
    "revision": "6a3abf2cde12d4cedf2ba53305825a11"
  },
  {
    "url": "assets/js/15.01d97c00.js",
    "revision": "3dcd7632734e29781bf6a5e6a6823744"
  },
  {
    "url": "assets/js/16.05c67fe1.js",
    "revision": "de09f810e7fb3d0aae0a4a513ee6c070"
  },
  {
    "url": "assets/js/17.a08acd33.js",
    "revision": "9c1f7b66ff8edb31df060cc41ea6fe6e"
  },
  {
    "url": "assets/js/18.fef2972b.js",
    "revision": "2bdb04fc18bc8284c01f53e195313fdc"
  },
  {
    "url": "assets/js/19.8fdf03fa.js",
    "revision": "2b9ee74c6b0f8c6e5a4b5df86b0ca179"
  },
  {
    "url": "assets/js/2.4f9efc98.js",
    "revision": "17a61760616a0c551279fa586e709188"
  },
  {
    "url": "assets/js/20.6bddb5f0.js",
    "revision": "ccd19be699f6251fa959831a1f79e923"
  },
  {
    "url": "assets/js/21.36723882.js",
    "revision": "0140005156dda6d6deb4dfc8c4cefc88"
  },
  {
    "url": "assets/js/22.49991c62.js",
    "revision": "1032fb7ed85985ef9c6dd8d999cd605e"
  },
  {
    "url": "assets/js/23.da8d99c1.js",
    "revision": "c933c8d757587b801cbcf1d182e46850"
  },
  {
    "url": "assets/js/24.19a6cda8.js",
    "revision": "0bc827809f7475108b6ac96a5451827f"
  },
  {
    "url": "assets/js/25.450fae14.js",
    "revision": "9de66d6fc8b93f4de60436be13b98fae"
  },
  {
    "url": "assets/js/26.a582340d.js",
    "revision": "c33bae3f9d93fd87d9948270243652f9"
  },
  {
    "url": "assets/js/27.e3fc8783.js",
    "revision": "9c1b227d6e5664b6d70be25e88644301"
  },
  {
    "url": "assets/js/28.b5e55880.js",
    "revision": "30352d36b5311d44aeb3b91ef943dfe7"
  },
  {
    "url": "assets/js/29.88598901.js",
    "revision": "048b47a7cc61b60696e585de65f690ac"
  },
  {
    "url": "assets/js/3.07d27621.js",
    "revision": "4270f1a92575283cdcd263757149b603"
  },
  {
    "url": "assets/js/30.a04d7db5.js",
    "revision": "8bc590f8f8b255c681938fa3b31b6013"
  },
  {
    "url": "assets/js/31.c0271ce5.js",
    "revision": "57ec21247159096cfb234f2ad996a834"
  },
  {
    "url": "assets/js/32.868e3fcb.js",
    "revision": "66f60370853743a43b143c93c569cda7"
  },
  {
    "url": "assets/js/33.cafffcd9.js",
    "revision": "bf5f9488feb812f371fffcf92352774c"
  },
  {
    "url": "assets/js/34.dddf0f07.js",
    "revision": "b1738a75295fcaf20382f95c4c7b7b85"
  },
  {
    "url": "assets/js/35.34426bc4.js",
    "revision": "1f0a508cd200f99ca95b6f69a37ab22f"
  },
  {
    "url": "assets/js/36.5b0de54c.js",
    "revision": "2b1397e6ca63be04a58ec3b6aa016143"
  },
  {
    "url": "assets/js/37.655da42d.js",
    "revision": "11b568a2b45e93380bfe363c78766e75"
  },
  {
    "url": "assets/js/38.4f64b21c.js",
    "revision": "9b13d2598f56b1c2c1e32abb9c33b4ed"
  },
  {
    "url": "assets/js/39.487a0e99.js",
    "revision": "7a7308a040ef492a0f8bde3717768600"
  },
  {
    "url": "assets/js/4.b0e220cb.js",
    "revision": "8cd2169ddcb5b850add64674f9e705bd"
  },
  {
    "url": "assets/js/40.a99c1f80.js",
    "revision": "e355c07f1eebb0e8b4dd5e7328bc9c38"
  },
  {
    "url": "assets/js/41.85d4c69c.js",
    "revision": "59a0b4b3d863c3b32bd36633bd640be2"
  },
  {
    "url": "assets/js/42.9937dbb4.js",
    "revision": "def806c93b2abf2eda79f230fbe639bd"
  },
  {
    "url": "assets/js/43.a8d2331e.js",
    "revision": "8a56fda03d46964d065ce28136511ea7"
  },
  {
    "url": "assets/js/44.10872e84.js",
    "revision": "04627282a11e352be3b95bcd714ec725"
  },
  {
    "url": "assets/js/45.5983f568.js",
    "revision": "27b2ef4e1425f3b23738b4ffe0c9d5dd"
  },
  {
    "url": "assets/js/46.049ff464.js",
    "revision": "804e723169b5bbb1f4aaf120b4698c33"
  },
  {
    "url": "assets/js/47.06b56147.js",
    "revision": "9167ef9d6b4cbe5f4d18544f3ff901b2"
  },
  {
    "url": "assets/js/5.c7940abc.js",
    "revision": "751860de568d0a77dde92d296a602bb2"
  },
  {
    "url": "assets/js/6.21f0c4d5.js",
    "revision": "c53163d4245b0d919fcfea56a663a6da"
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
    "url": "assets/js/9.d8c96343.js",
    "revision": "ab1672dcbc4dadd5af1eec898ba6229a"
  },
  {
    "url": "assets/js/app.25369e4c.js",
    "revision": "64e8644c6e41e18d24a764b2155ba2ed"
  },
  {
    "url": "css/advanced/abstract.html",
    "revision": "884d0ccb6c5f14ebb64e59fe44f4f3d5"
  },
  {
    "url": "css/basis/abstract.html",
    "revision": "99a07b47a7b994222eb5599f8d9f5739"
  },
  {
    "url": "css/basis/layout.html",
    "revision": "ddecc7101763389b3fcdfabdb1bb08f5"
  },
  {
    "url": "css/index.html",
    "revision": "7ed398daa2d9080e0a1343931f54840e"
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
    "revision": "741d15e8df3d417daef542d73690f340"
  },
  {
    "url": "javascript/advanced.html",
    "revision": "cd58a72b9ee17882532ba2767a0212de"
  },
  {
    "url": "javascript/index.html",
    "revision": "6ef004bc86b772b2b9adcacdf49ebf08"
  },
  {
    "url": "logo.png",
    "revision": "f85f82780b0ebed5e2eae82a64fe3022"
  },
  {
    "url": "mobile/index.html",
    "revision": "2691cc931563508bfa364b90a771e6f7"
  },
  {
    "url": "optimization/index.html",
    "revision": "6e5d1de08c6469b6de9786374852de9c"
  },
  {
    "url": "optimization/webpack/abstract.html",
    "revision": "1ec78c5680ac733e6de7ace122175680"
  },
  {
    "url": "optimization/webpack/application.html",
    "revision": "20f460ed2d177e3bd3bba87374313020"
  },
  {
    "url": "optimization/webpack/configuration.html",
    "revision": "a6bbf646b32a11112ceadd3c25b0254b"
  },
  {
    "url": "typescript/advanced/abstract.html",
    "revision": "761bb70f198e71e18aed3341baab0ee4"
  },
  {
    "url": "typescript/basis/abstract.html",
    "revision": "776c305dd5b3f412932696343060822b"
  },
  {
    "url": "typescript/index.html",
    "revision": "4521dcbdabf42a4348758bdbeb5c2e2a"
  },
  {
    "url": "vue/index.html",
    "revision": "4fab22d52f6a96f6c6de0fe005447912"
  },
  {
    "url": "vue/vue-router/abstract.html",
    "revision": "87e6a8cd994d0275b0ada30f767fd669"
  },
  {
    "url": "vue/vue-router/initialization.html",
    "revision": "3d3641af0e37a4c0b2f8c0be3e54ffb7"
  },
  {
    "url": "vue/vue-router/match.html",
    "revision": "3509e379b69d31222f7fbbabf149fa08"
  },
  {
    "url": "vue/vue-router/plugin.html",
    "revision": "1350d5e576c1817fddaccb6b72224dad"
  },
  {
    "url": "vue/vue-router/scroll.html",
    "revision": "ddeabb168558fffa978f9a3a718eb620"
  },
  {
    "url": "vue/vue-router/summary.html",
    "revision": "7368a994e2e3e23a943d1371087d5529"
  },
  {
    "url": "vue/vue-router/transitions.html",
    "revision": "fc35be8b2001ca83853e746635ce62e3"
  },
  {
    "url": "vue/vue-router/warmUp.html",
    "revision": "f66bdcbd3622e7bd5bd66a01c00f8f3f"
  },
  {
    "url": "vue/vue/github.html",
    "revision": "e5da6526761912b4d757ad6055439baf"
  },
  {
    "url": "vue/vue/vue-render.html",
    "revision": "e38f4d13ed2827eeb24f3ae28a8d2ad5"
  },
  {
    "url": "vue/vue3.x/abstract.html",
    "revision": "112772f0a1a58c93e91092a8d8b7aabc"
  },
  {
    "url": "vue/vue3.x/features.html",
    "revision": "2c1980adfc3a75fea852d2c756037bc5"
  },
  {
    "url": "vue/vue3.x/performance.html",
    "revision": "49ee483be2786fa48c8ead646625dc71"
  },
  {
    "url": "vue/vue3.x/reactivity.html",
    "revision": "fca34e2695e53c508fce6d59cb6a493a"
  },
  {
    "url": "vue/vuex/abstract.html",
    "revision": "0ee0fa2f203ac150276c6386d4520042"
  },
  {
    "url": "vue/vuex/actions.html",
    "revision": "ec943906eea10083767292dae1545511"
  },
  {
    "url": "vue/vuex/getters.html",
    "revision": "045f45ad35c4b1744fc5f57ad0009d2e"
  },
  {
    "url": "vue/vuex/initialization.html",
    "revision": "66232cd8788f2311a5c3f37ca175a04d"
  },
  {
    "url": "vue/vuex/modules.html",
    "revision": "575dbf7ddf982b570b76c5d1e5b4d735"
  },
  {
    "url": "vue/vuex/mutations.html",
    "revision": "92284cce9088b637bf19edeea6f51711"
  },
  {
    "url": "vue/vuex/others.html",
    "revision": "9f3116578f9329453f5fcc949af1645e"
  },
  {
    "url": "vue/vuex/state.html",
    "revision": "f3086abea8a2f48c6251042b82da6b64"
  },
  {
    "url": "vue/vuex/warmUp.html",
    "revision": "76516f9726805c563da3a3aa4268aaa5"
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
