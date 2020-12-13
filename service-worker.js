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
    "revision": "3ebb43e6287725c850b32fbd207b1c14"
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
    "url": "assets/js/19.a185a979.js",
    "revision": "98926607863ce72092ffb6fbdb3292f1"
  },
  {
    "url": "assets/js/2.2a4e8c54.js",
    "revision": "17a61760616a0c551279fa586e709188"
  },
  {
    "url": "assets/js/20.6bddb5f0.js",
    "revision": "ccd19be699f6251fa959831a1f79e923"
  },
  {
    "url": "assets/js/21.450e1fbd.js",
    "revision": "88c9111a881133e04ef89d35815e6a12"
  },
  {
    "url": "assets/js/22.676f1356.js",
    "revision": "4df784b8ba279a42854a905a6388fd64"
  },
  {
    "url": "assets/js/23.3c90cfe0.js",
    "revision": "a30ddfd57ed59ce1a7aeef500de632bd"
  },
  {
    "url": "assets/js/24.de3e5e3a.js",
    "revision": "4ed0d957457f4ecbc7ff363eeb8d4bce"
  },
  {
    "url": "assets/js/25.0fb5bb97.js",
    "revision": "0aefb61833d16a6f36a2f85c1a5b74a2"
  },
  {
    "url": "assets/js/26.a665c613.js",
    "revision": "bbf488875ecb9d80fc9938a1491b7816"
  },
  {
    "url": "assets/js/27.5fdc4518.js",
    "revision": "9eec63f707487bf1ef5526c48d6dbd0b"
  },
  {
    "url": "assets/js/28.d1c6c513.js",
    "revision": "26d26cafba65fef7defa875630688d52"
  },
  {
    "url": "assets/js/29.9a2fe779.js",
    "revision": "f4067e12740f5b99db47aa89f3a986f1"
  },
  {
    "url": "assets/js/3.07d27621.js",
    "revision": "4270f1a92575283cdcd263757149b603"
  },
  {
    "url": "assets/js/30.3fed51d6.js",
    "revision": "b9c9974a135f4f550bad3e394b03a9e5"
  },
  {
    "url": "assets/js/31.c0271ce5.js",
    "revision": "57ec21247159096cfb234f2ad996a834"
  },
  {
    "url": "assets/js/32.d1a9af06.js",
    "revision": "41e86be6264d40ac975828d2db97dbdc"
  },
  {
    "url": "assets/js/33.b1aed921.js",
    "revision": "9783505c67428b0f12135d517cb08054"
  },
  {
    "url": "assets/js/34.dddf0f07.js",
    "revision": "b1738a75295fcaf20382f95c4c7b7b85"
  },
  {
    "url": "assets/js/35.9acad26a.js",
    "revision": "0745ed610f350e9bccf6f7efe1181f8f"
  },
  {
    "url": "assets/js/36.c1e5741c.js",
    "revision": "51db31cf6717d6c5417b483b6b3bd3a4"
  },
  {
    "url": "assets/js/37.f2b745ce.js",
    "revision": "9d0ac65b24f310711bdaa8c9868f206e"
  },
  {
    "url": "assets/js/38.fca7e5a9.js",
    "revision": "bec05b99451380af7b7de3f84f9fe460"
  },
  {
    "url": "assets/js/39.f9f4ecfd.js",
    "revision": "d31f62c6fb20dc4249c00a7569883ed9"
  },
  {
    "url": "assets/js/4.d6a54567.js",
    "revision": "465b1f159e84592eff59fecd8a9a8c5b"
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
    "url": "assets/js/43.08222341.js",
    "revision": "1c461cbba7f403caf69cacd68f52b1d6"
  },
  {
    "url": "assets/js/44.a89d758f.js",
    "revision": "6d32b54473b914657dc32a35e256061d"
  },
  {
    "url": "assets/js/45.49aa04e9.js",
    "revision": "a51f7711f3c1f6861c43b1932ab73438"
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
    "url": "assets/js/9.d8c96343.js",
    "revision": "ab1672dcbc4dadd5af1eec898ba6229a"
  },
  {
    "url": "assets/js/app.8e480e14.js",
    "revision": "dabfd0a935017a2e73cae332442ca145"
  },
  {
    "url": "css/advanced/abstract.html",
    "revision": "ea449e434a46d4a48f0365d8c4601cfb"
  },
  {
    "url": "css/basis/abstract.html",
    "revision": "3a1250f78b849aaf19c3aa40c7933521"
  },
  {
    "url": "css/basis/layout.html",
    "revision": "a6e37d7bec9fdebe37c8a23b70448726"
  },
  {
    "url": "css/index.html",
    "revision": "ccf885a673846eee3bfe0e1614cc2f2b"
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
    "revision": "c1438ed65e5fc342e506444cabdd1937"
  },
  {
    "url": "javascript/advanced.html",
    "revision": "16974da82f06e0bfd1d52abbd47b1748"
  },
  {
    "url": "javascript/index.html",
    "revision": "6cda71520508aafc105fc64e54569ee0"
  },
  {
    "url": "logo.png",
    "revision": "f85f82780b0ebed5e2eae82a64fe3022"
  },
  {
    "url": "mobile/index.html",
    "revision": "e50d0588eb19bc1ff6e88595d2c45ca8"
  },
  {
    "url": "optimization/index.html",
    "revision": "b4edd209d16dcf98c2c716eef3528182"
  },
  {
    "url": "optimization/webpack/abstract.html",
    "revision": "10b12f64817d60fc95044c9924df3906"
  },
  {
    "url": "optimization/webpack/application.html",
    "revision": "03cfe677daa906753e39567054840662"
  },
  {
    "url": "optimization/webpack/configuration.html",
    "revision": "75814788d7fdf3e104709ef308c50605"
  },
  {
    "url": "typescript/advanced/abstract.html",
    "revision": "f193b06018eb0384258ae4b86db601ee"
  },
  {
    "url": "typescript/basis/abstract.html",
    "revision": "7998d3ceab3df48430ceddc83130c900"
  },
  {
    "url": "typescript/index.html",
    "revision": "c17066cfe056e5494d066376b0072a6f"
  },
  {
    "url": "vue/index.html",
    "revision": "89d1f43621c6204f54e904bdb9db546b"
  },
  {
    "url": "vue/vue-router/abstract.html",
    "revision": "56e60b0d2f860940eba47a7b5d84ccf4"
  },
  {
    "url": "vue/vue-router/initialization.html",
    "revision": "541f9658ed1436b95f3cafca70b8b16a"
  },
  {
    "url": "vue/vue-router/match.html",
    "revision": "52e8e6ae4c13cd56f1018839d5ea24d6"
  },
  {
    "url": "vue/vue-router/plugin.html",
    "revision": "f6ba7b430751ddef4b22023fb8d82b00"
  },
  {
    "url": "vue/vue-router/scroll.html",
    "revision": "807ddf1bb768a83abf0958bb35505613"
  },
  {
    "url": "vue/vue-router/summary.html",
    "revision": "f704bbd5a6da2ad956df24c1c63695ec"
  },
  {
    "url": "vue/vue-router/transitions.html",
    "revision": "7bc67267cac6bf820b8ad5977604ce23"
  },
  {
    "url": "vue/vue-router/warmUp.html",
    "revision": "4ca85a1397f136c6c59ef215b99ed8e1"
  },
  {
    "url": "vue/vue/github.html",
    "revision": "b496869aeca9f2f105bb3083f643efb2"
  },
  {
    "url": "vue/vue/vue-render.html",
    "revision": "22e9162ac902951dd75bd4b9d3f1e132"
  },
  {
    "url": "vue/vue3.x/abstract.html",
    "revision": "26170b42a31f5f9e2966026a21973726"
  },
  {
    "url": "vue/vue3.x/features.html",
    "revision": "78e7623da2cb214db5c2c11803c07c41"
  },
  {
    "url": "vue/vue3.x/performance.html",
    "revision": "83c76f6ab9d7b2e71e34951848d5232d"
  },
  {
    "url": "vue/vue3.x/reactivity.html",
    "revision": "e98ef8b51a7d0bff33bb0f407769a61b"
  },
  {
    "url": "vue/vuex/abstract.html",
    "revision": "130ccfe45f18300255a8eba42252dd97"
  },
  {
    "url": "vue/vuex/actions.html",
    "revision": "70687f48468ef64647dd4e57a8770448"
  },
  {
    "url": "vue/vuex/getters.html",
    "revision": "1b88805032dc5b7ec851b36e8caf8dc4"
  },
  {
    "url": "vue/vuex/initialization.html",
    "revision": "cd54a0854f362513b429a2f0b80c0a5e"
  },
  {
    "url": "vue/vuex/modules.html",
    "revision": "1ce8c1cb4f1a042714d1b0329e000b15"
  },
  {
    "url": "vue/vuex/mutations.html",
    "revision": "9115b3adb4976d0e478e32bb27a9b09e"
  },
  {
    "url": "vue/vuex/others.html",
    "revision": "da719bc5324e84b2af293b123f719b18"
  },
  {
    "url": "vue/vuex/state.html",
    "revision": "a2da74bff8375936f941ad2d6b652f90"
  },
  {
    "url": "vue/vuex/warmUp.html",
    "revision": "7c2752c2220288ffe5de27629d794993"
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
