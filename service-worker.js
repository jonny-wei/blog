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
    "revision": "5cf26e5d7ea44882319345c19512386e"
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
    "url": "assets/js/10.a1529350.js",
    "revision": "75c7f8798f2d353fc5c71ff00f13fb20"
  },
  {
    "url": "assets/js/11.c1a0135c.js",
    "revision": "82bbd3bdb217b8b25583cc271ef6e98f"
  },
  {
    "url": "assets/js/12.99ded477.js",
    "revision": "8c1e2326a953add4237f01862ab19f93"
  },
  {
    "url": "assets/js/13.2521a16e.js",
    "revision": "becd89cee18d7f35242c649155988742"
  },
  {
    "url": "assets/js/14.133aa108.js",
    "revision": "e873d0271ae9728925bbd7fee81ad60f"
  },
  {
    "url": "assets/js/15.6d4bda15.js",
    "revision": "b0e33af66e2f18a8b1928898e660337c"
  },
  {
    "url": "assets/js/16.ba074823.js",
    "revision": "9f6fb0847b597a78ed10852046b0d512"
  },
  {
    "url": "assets/js/17.301089ac.js",
    "revision": "738d2a859c97fcbbb745bf2c09cad1ad"
  },
  {
    "url": "assets/js/18.322991d6.js",
    "revision": "c9670d73fea50dd2ff7f05499c931c99"
  },
  {
    "url": "assets/js/19.ec1e3725.js",
    "revision": "59d5c37d49d3953387ba3caae1719399"
  },
  {
    "url": "assets/js/2.2a4e8c54.js",
    "revision": "17a61760616a0c551279fa586e709188"
  },
  {
    "url": "assets/js/20.1783200a.js",
    "revision": "6629c3fcfd8ee206a83cac94c0e8ffdf"
  },
  {
    "url": "assets/js/21.0c26b5a2.js",
    "revision": "f1aaba2333e4c9c60bd69d7546d6a210"
  },
  {
    "url": "assets/js/22.52e001de.js",
    "revision": "4d704a404a2182cbaf8be6bbadb6242f"
  },
  {
    "url": "assets/js/23.23588340.js",
    "revision": "bacb85ffbc41c81f0383e01d76561124"
  },
  {
    "url": "assets/js/24.db64810d.js",
    "revision": "d0b3346b4a9b482ab69add8922bd4c8d"
  },
  {
    "url": "assets/js/25.66cef743.js",
    "revision": "c3097e408484b9c86e2a633f4bff97fb"
  },
  {
    "url": "assets/js/26.5e4dba4d.js",
    "revision": "5cde4b9dc7663a5200e38dc46cbc1d77"
  },
  {
    "url": "assets/js/27.784c53fa.js",
    "revision": "8702be2062ca477153b1819188f55e5e"
  },
  {
    "url": "assets/js/28.7fa06bfa.js",
    "revision": "f87487ce4ce980c8bc37c095577b7e05"
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
    "url": "assets/js/30.8f0c5b22.js",
    "revision": "6afc19b6d3885f14c7ed6f8c9675ee64"
  },
  {
    "url": "assets/js/31.491bf9df.js",
    "revision": "b41ba01c4680b61764085e6735cacaca"
  },
  {
    "url": "assets/js/32.ed67849a.js",
    "revision": "2e454e3d27f18770a4de3248fb060c95"
  },
  {
    "url": "assets/js/33.85317e03.js",
    "revision": "4732266a76f9037125143549b6c0cca6"
  },
  {
    "url": "assets/js/34.03e230e0.js",
    "revision": "b074693829b47ce5996d991a486e73f3"
  },
  {
    "url": "assets/js/35.7918ce2c.js",
    "revision": "6fa7b9e315e4d7476f5bf3139db8a650"
  },
  {
    "url": "assets/js/36.a6ec54e2.js",
    "revision": "8c3fe176a4e98a079d7f8fe5117fb3bf"
  },
  {
    "url": "assets/js/37.1efa4804.js",
    "revision": "f8b1788bbd804b0d8d5e2fe9ac59b01f"
  },
  {
    "url": "assets/js/38.fedd23b0.js",
    "revision": "230e3cba210f4b80257b30de9fb32c65"
  },
  {
    "url": "assets/js/39.13426ff2.js",
    "revision": "d13acbaf4de5870f8f5eb6b0c6c41c09"
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
    "url": "assets/js/41.77314b0c.js",
    "revision": "7365ef9dd87cc0e6db457e8e61f204bf"
  },
  {
    "url": "assets/js/42.04df6381.js",
    "revision": "8d811c9df5481b7be4867ca76c567c22"
  },
  {
    "url": "assets/js/43.6c0cc2ec.js",
    "revision": "658e39c96aaa34d31b71601c0f7c1395"
  },
  {
    "url": "assets/js/44.e2d4ba71.js",
    "revision": "17563d9a5cc2a02218dd1a5cd2c2776e"
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
    "url": "assets/js/9.72652230.js",
    "revision": "8abc736f703fcf94b8074df418ad6a31"
  },
  {
    "url": "assets/js/app.8c0e21f4.js",
    "revision": "8cb4ab2dd47cebbe64b178c6db88d7fb"
  },
  {
    "url": "css/advanced/abstract.html",
    "revision": "99e99314cffd97244f093585d93a3f48"
  },
  {
    "url": "css/basis/abstract.html",
    "revision": "cd7ceed5b72cefd09ec6ae23b7b5621d"
  },
  {
    "url": "css/basis/layout.html",
    "revision": "d08b76884d04360afcf387f6fe93a257"
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
    "revision": "40ec8fc7376c1b0c5a965d589afdbdc8"
  },
  {
    "url": "javascript/book/chapter1.html",
    "revision": "23e89ecffd0b8bc711b2848754310055"
  },
  {
    "url": "javascript/book/chapter2.html",
    "revision": "6e5db1f3573cb3db49037fba3bc70edf"
  },
  {
    "url": "logo.png",
    "revision": "f85f82780b0ebed5e2eae82a64fe3022"
  },
  {
    "url": "mobile/index.html",
    "revision": "1a0efc352d15fe61ba921267a031121f"
  },
  {
    "url": "optimization/index.html",
    "revision": "e5067a6b87112b38e4c3ea0343d95144"
  },
  {
    "url": "optimization/webpack/abstract.html",
    "revision": "24e9ed23e31fd3020f2e9070b20e4317"
  },
  {
    "url": "optimization/webpack/application.html",
    "revision": "efe15937038287f12261416d660f77ee"
  },
  {
    "url": "optimization/webpack/configuration.html",
    "revision": "07a98ad2f6f4123b857433496363ec12"
  },
  {
    "url": "typescript/advanced/abstract.html",
    "revision": "d4e3c5356434b74365dee9cc7adfc08a"
  },
  {
    "url": "typescript/basis/abstract.html",
    "revision": "37c039c9ee78d21b05f0b3a82fa0aee2"
  },
  {
    "url": "typescript/index.html",
    "revision": "d80dcc60d6f96c268cf8e3c5c7530b4d"
  },
  {
    "url": "vue/vue-router/abstract.html",
    "revision": "398174a86c430b00e66498ce5eb09f2a"
  },
  {
    "url": "vue/vue-router/initialization.html",
    "revision": "4623cdd3362dad084b7e6911988f490d"
  },
  {
    "url": "vue/vue-router/match.html",
    "revision": "01a41a47de3f84b3f7e46009ca6d4cc1"
  },
  {
    "url": "vue/vue-router/plugin.html",
    "revision": "d301d001bf8ab1418dc1d2ddb1908e90"
  },
  {
    "url": "vue/vue-router/scroll.html",
    "revision": "f406be3c4fae342b7b4e0608b7de8d8e"
  },
  {
    "url": "vue/vue-router/summary.html",
    "revision": "8bf46c4fe0a20273089a8efa19145500"
  },
  {
    "url": "vue/vue-router/transitions.html",
    "revision": "dd48be17d8fac204968a7f0c66c6fd88"
  },
  {
    "url": "vue/vue-router/warmUp.html",
    "revision": "cd14256320a59f2cdc603ce09bcd3f2d"
  },
  {
    "url": "vue/vue/guide.html",
    "revision": "642d2074eb86e39709609bfe8c90ce19"
  },
  {
    "url": "vue/vue/vue-render.html",
    "revision": "65761944e77c7b44e2f0040ac98e1ec2"
  },
  {
    "url": "vue/vue3.x/abstract.html",
    "revision": "24861b18826449ef9718b11971565742"
  },
  {
    "url": "vue/vue3.x/features.html",
    "revision": "ad26e3c335e0fa55001431f0bba53fcd"
  },
  {
    "url": "vue/vue3.x/performance.html",
    "revision": "659a04bf97e5aa4b927f13efc1f4492f"
  },
  {
    "url": "vue/vue3.x/reactivity.html",
    "revision": "f8ef483e88462f9bf94aa23e5c03ef49"
  },
  {
    "url": "vue/vuex/abstract.html",
    "revision": "3e560234be7de5d8996f0e9eeb15f749"
  },
  {
    "url": "vue/vuex/actions.html",
    "revision": "7f923e947498c7477f1d6d18ce3d4f66"
  },
  {
    "url": "vue/vuex/getters.html",
    "revision": "a05dc63f06b6e0a3b5473f6b5a506b20"
  },
  {
    "url": "vue/vuex/initialization.html",
    "revision": "82f8f86bb1450fb2d4c0dae306359106"
  },
  {
    "url": "vue/vuex/modules.html",
    "revision": "158d7221aa39312e9c7e51443fc410eb"
  },
  {
    "url": "vue/vuex/mutations.html",
    "revision": "b050a725c0ab3cca32553073b87f0480"
  },
  {
    "url": "vue/vuex/others.html",
    "revision": "96f2abc74914159ea702dca7b2004c92"
  },
  {
    "url": "vue/vuex/state.html",
    "revision": "6809b64297a742e9fd4f1b845473aa46"
  },
  {
    "url": "vue/vuex/warmUp.html",
    "revision": "3f1eee428cbc056b30c29885abc750d7"
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
