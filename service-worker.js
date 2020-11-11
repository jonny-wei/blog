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
    "revision": "e12544bcb73cc9478ba926bb744a161c"
  },
  {
    "url": "assets/css/0.styles.dbb62a93.css",
    "revision": "00aeefb226400cb34d9c0106e5eb5038"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.e0ef691c.js",
    "revision": "993e15a30c28df4c218c5fb225790822"
  },
  {
    "url": "assets/js/11.34ce1eef.js",
    "revision": "04b9d06161ecf898f5871880ef2d0766"
  },
  {
    "url": "assets/js/12.a515e35b.js",
    "revision": "06fd8d519de7e0ea717eba9253c7741e"
  },
  {
    "url": "assets/js/13.270a6794.js",
    "revision": "0c6487f598521257321e19dfe0538648"
  },
  {
    "url": "assets/js/14.9092cece.js",
    "revision": "2faeaf11fe0691b05b6a51de68e08c81"
  },
  {
    "url": "assets/js/15.c63721c9.js",
    "revision": "e7b41691a23a71e9581c20d38f77adcc"
  },
  {
    "url": "assets/js/16.ab1faabc.js",
    "revision": "ec0fd00b45b917678cc8747ab29691c4"
  },
  {
    "url": "assets/js/17.447660d7.js",
    "revision": "ba2e6c2228599d120bff13972e5e4448"
  },
  {
    "url": "assets/js/18.88cfe15f.js",
    "revision": "75069fbce7baa55900fef8da0db0946b"
  },
  {
    "url": "assets/js/19.670ddd74.js",
    "revision": "b057261f074d15509b91feec01d1cd20"
  },
  {
    "url": "assets/js/2.4f9efc98.js",
    "revision": "17a61760616a0c551279fa586e709188"
  },
  {
    "url": "assets/js/20.d76d0bab.js",
    "revision": "a11cb9483f8fc3e16a4000eaffcea7a0"
  },
  {
    "url": "assets/js/21.3bd7d10d.js",
    "revision": "1e9c4bccf432bc3c87e25b71a99c9bc5"
  },
  {
    "url": "assets/js/22.bfea1beb.js",
    "revision": "6bd03cb5bb7150275a3a157d42596cac"
  },
  {
    "url": "assets/js/23.52be8b8c.js",
    "revision": "490862853c29dd6a853fc12bfd7a1744"
  },
  {
    "url": "assets/js/24.8de3d90d.js",
    "revision": "248dff3d1489f7110920c2c59e8a4ed1"
  },
  {
    "url": "assets/js/25.8fd7fb08.js",
    "revision": "e9411f9c94a179255836af91e360bc12"
  },
  {
    "url": "assets/js/26.996765cf.js",
    "revision": "59187e115c3d731e6a1a59a1310e7db4"
  },
  {
    "url": "assets/js/27.10dc293f.js",
    "revision": "e7a08ad94a2d9537d6f1754fac5277d1"
  },
  {
    "url": "assets/js/28.6cdbdc05.js",
    "revision": "0a32616e591283cc0aeac73641c96f87"
  },
  {
    "url": "assets/js/29.ae2811a9.js",
    "revision": "bbb35fae3016284048c4169b4fdea8d1"
  },
  {
    "url": "assets/js/3.07d27621.js",
    "revision": "4270f1a92575283cdcd263757149b603"
  },
  {
    "url": "assets/js/30.e8190a3f.js",
    "revision": "60d52deee6c98e73c4c682321dd4a62f"
  },
  {
    "url": "assets/js/31.7fbdde0b.js",
    "revision": "b25f0baf00632995e78b3237404e65ae"
  },
  {
    "url": "assets/js/32.82a30c77.js",
    "revision": "e351630aae8f31c2596d3b4dc7ba7a17"
  },
  {
    "url": "assets/js/33.59a8034b.js",
    "revision": "af1db2700cedf7ca906195af15796f9c"
  },
  {
    "url": "assets/js/34.e836d9f2.js",
    "revision": "9b37ed7220bcc06dff4f73cac79ba560"
  },
  {
    "url": "assets/js/35.1441a461.js",
    "revision": "ff8b2144da4251c4ff9e5bbf23eb2bd6"
  },
  {
    "url": "assets/js/36.b2d96674.js",
    "revision": "780babc40814f74ed7546f5fa8586675"
  },
  {
    "url": "assets/js/37.59ba895f.js",
    "revision": "2f312cc122f17a984cf9cbc260bf3832"
  },
  {
    "url": "assets/js/38.4017e48c.js",
    "revision": "092e173e87d06c22bdbbe3ca1358f46b"
  },
  {
    "url": "assets/js/39.625e0490.js",
    "revision": "a45cff8fd7fd0a8258abbbbee77007df"
  },
  {
    "url": "assets/js/4.d42ebbba.js",
    "revision": "b6c1712223a9da006af9fd855b3fab50"
  },
  {
    "url": "assets/js/40.ff816dd8.js",
    "revision": "39ec9c2b51a1a77e3a4e1fac59c1a227"
  },
  {
    "url": "assets/js/41.eb69ae8e.js",
    "revision": "c59f74e7aa0dd94e34ea9fb43fb4d7d4"
  },
  {
    "url": "assets/js/42.f2d91b93.js",
    "revision": "44c0c28529126b2c97085bb88a72d3ae"
  },
  {
    "url": "assets/js/43.828b72e0.js",
    "revision": "39fe096caac049c883392a64c99b3bdd"
  },
  {
    "url": "assets/js/44.bd86ca74.js",
    "revision": "f70cf4bc396e7c4ca75f36294eb74320"
  },
  {
    "url": "assets/js/45.d0b8236b.js",
    "revision": "5e8409ecc05fdc85e7b9a87b81836188"
  },
  {
    "url": "assets/js/46.0b7bd0c7.js",
    "revision": "69f3edbaecb0b321c07abce661a05452"
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
    "url": "assets/js/9.2f37877f.js",
    "revision": "7322c794700d140add6bbbb9ae212a13"
  },
  {
    "url": "assets/js/app.566cf3e9.js",
    "revision": "f1a48a25b6e2bdfeee6d4e315cb9a637"
  },
  {
    "url": "config.html",
    "revision": "4d1d119bfddbce9ee83413b52f9d5264"
  },
  {
    "url": "css/advanced/abstract.html",
    "revision": "5cec132103de82281b2ca9fbb88469ad"
  },
  {
    "url": "css/basis/abstract.html",
    "revision": "cb116a84a33fe13ad73e414dd3d586a4"
  },
  {
    "url": "css/basis/layout.html",
    "revision": "abd0bd32a11d469368cfe5953a1bcc0f"
  },
  {
    "url": "css/index.html",
    "revision": "a13176902a2fad97db62e84eefdc28fc"
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
    "revision": "f6d45b0179452942f33b0f8113334f56"
  },
  {
    "url": "logo.png",
    "revision": "f85f82780b0ebed5e2eae82a64fe3022"
  },
  {
    "url": "mobile/index.html",
    "revision": "f8be1df7ef99b84929506d6fc11db390"
  },
  {
    "url": "optimization/index.html",
    "revision": "c81b2b263f7453661924261ddf0ba523"
  },
  {
    "url": "optimization/webpack/abstract.html",
    "revision": "04e5c8c48069a221086d71f4cc025dab"
  },
  {
    "url": "optimization/webpack/application.html",
    "revision": "5eb8c0149e4d66457477003de648ee74"
  },
  {
    "url": "optimization/webpack/configuration.html",
    "revision": "b9a9a611055e556abb7281887ed6cc73"
  },
  {
    "url": "typescript/advanced/abstract.html",
    "revision": "920e85f2e01b61b171a30e9bfbf2da09"
  },
  {
    "url": "typescript/basis/abstract.html",
    "revision": "01ef4e24f5540fceb92bcf2f5b4657d5"
  },
  {
    "url": "typescript/index.html",
    "revision": "c826e456edc506e3516266dc08b26705"
  },
  {
    "url": "vue/index.html",
    "revision": "4c90c55b43e52fdbe1ecfc6b000f5397"
  },
  {
    "url": "vue/vue-router/abstract.html",
    "revision": "36e13ac93c5e527665b68729aebc5508"
  },
  {
    "url": "vue/vue-router/initialization.html",
    "revision": "a1b7e8ae63d24a29eeaab63acb6c69b5"
  },
  {
    "url": "vue/vue-router/match.html",
    "revision": "0e4038f9d5c3c2f5b5cef5023f543c8d"
  },
  {
    "url": "vue/vue-router/plugin.html",
    "revision": "e8be7e31751ffb30821be302ede57914"
  },
  {
    "url": "vue/vue-router/scroll.html",
    "revision": "958f38194d30ec22430b965bdca8871b"
  },
  {
    "url": "vue/vue-router/summary.html",
    "revision": "ad0dff493c0f7eacae238815ece4ec3f"
  },
  {
    "url": "vue/vue-router/transitions.html",
    "revision": "70d29223e656794cc6f4e4523a3ea141"
  },
  {
    "url": "vue/vue-router/warmUp.html",
    "revision": "f15a3f0b89885478014c8dc7328e6357"
  },
  {
    "url": "vue/vue/guide.html",
    "revision": "eb11f102ab48f2bce93bba6340e2e9cb"
  },
  {
    "url": "vue/vue/vue-render.html",
    "revision": "64806a1460cc61cbeb86e7368c748fda"
  },
  {
    "url": "vue/vue3.x/abstract.html",
    "revision": "2a6173333a8894abbee9298bfb53f210"
  },
  {
    "url": "vue/vue3.x/features.html",
    "revision": "4b149164b69ab86876544f4192437bf3"
  },
  {
    "url": "vue/vue3.x/performance.html",
    "revision": "771fc6e8a5ef9827e2258e52ea6ab6da"
  },
  {
    "url": "vue/vue3.x/reactivity.html",
    "revision": "219c4388995b55105ee8b590204962b4"
  },
  {
    "url": "vue/vuex/abstract.html",
    "revision": "96aed23b015a4db5239b8f3aab1dceb7"
  },
  {
    "url": "vue/vuex/actions.html",
    "revision": "5b7d5c0d7cb3855f7ef7f0582813b916"
  },
  {
    "url": "vue/vuex/getters.html",
    "revision": "51a8dc8c11346649311b9a6b0b9a567d"
  },
  {
    "url": "vue/vuex/initialization.html",
    "revision": "6b598cb1100d1713f45fced3fd50b655"
  },
  {
    "url": "vue/vuex/modules.html",
    "revision": "617fcc5a2a82f7ab08d20ac6dc970934"
  },
  {
    "url": "vue/vuex/mutations.html",
    "revision": "2a6fe29fb7cdd348bd50ff7ce81a3199"
  },
  {
    "url": "vue/vuex/others.html",
    "revision": "b8a314a172f8d6d0e00bb2bdc8092d36"
  },
  {
    "url": "vue/vuex/state.html",
    "revision": "13faa512469e25e90ee545aa68861c22"
  },
  {
    "url": "vue/vuex/warmUp.html",
    "revision": "4f496aa7dd53251971488d63ae1bda55"
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
