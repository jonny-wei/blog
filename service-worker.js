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
    "revision": "c7a0715999012caf15f1f1deee46449c"
  },
  {
    "url": "assets/css/0.styles.533f0e28.css",
    "revision": "4ccee70c5f7bdefc327ce00417fdad47"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.3410372d.js",
    "revision": "89376d6073868496a0f9667894eab1a3"
  },
  {
    "url": "assets/js/11.6c56b536.js",
    "revision": "3179e50555146be8d84a242130ddaaa4"
  },
  {
    "url": "assets/js/12.eee35601.js",
    "revision": "781dc302a852839816dd02654b8234f8"
  },
  {
    "url": "assets/js/13.270a6794.js",
    "revision": "0c6487f598521257321e19dfe0538648"
  },
  {
    "url": "assets/js/14.451572de.js",
    "revision": "01ce4319bffdb0f6731b3b45a5ead6cb"
  },
  {
    "url": "assets/js/15.ca64dcee.js",
    "revision": "8f377ca705567c5f4b9d26f40b8e146c"
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
    "url": "assets/js/18.2036e4f3.js",
    "revision": "5bc1977a04e76c2ede74b485b57267a6"
  },
  {
    "url": "assets/js/19.dc4f17ec.js",
    "revision": "6a07f9a9458e6f0befc525dbf66eb250"
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
    "url": "assets/js/21.18de6651.js",
    "revision": "abc42656df32f433155d8c2d6ed8c83f"
  },
  {
    "url": "assets/js/22.e67f6bbb.js",
    "revision": "b42bf284489446bc79399a6f2cc53544"
  },
  {
    "url": "assets/js/23.52be8b8c.js",
    "revision": "490862853c29dd6a853fc12bfd7a1744"
  },
  {
    "url": "assets/js/24.fe312cae.js",
    "revision": "ee2f9ff05608cf8ce43475bd5166704d"
  },
  {
    "url": "assets/js/25.6f72a1cb.js",
    "revision": "2f930bae2065ec79d6d2e8b8df9a8229"
  },
  {
    "url": "assets/js/26.bd83302b.js",
    "revision": "cedf7734de1cd6925f5528a130954dd4"
  },
  {
    "url": "assets/js/27.10dc293f.js",
    "revision": "e7a08ad94a2d9537d6f1754fac5277d1"
  },
  {
    "url": "assets/js/28.3d268ed5.js",
    "revision": "5a9869e9b9cb6add4d2d55ef0c8bfbf6"
  },
  {
    "url": "assets/js/29.d37af507.js",
    "revision": "334ca7f987b23c1ce0fe488da694c09a"
  },
  {
    "url": "assets/js/3.07d27621.js",
    "revision": "4270f1a92575283cdcd263757149b603"
  },
  {
    "url": "assets/js/30.3945b931.js",
    "revision": "4b9e873019131c121edd346b7f0438b3"
  },
  {
    "url": "assets/js/31.c81caf9f.js",
    "revision": "729a5677d35df6d072b8c920cd258f55"
  },
  {
    "url": "assets/js/32.bc272819.js",
    "revision": "8a20691e12eb42ed631a40bee465169b"
  },
  {
    "url": "assets/js/33.58cc081c.js",
    "revision": "38c7fcfa7cef110506a87e361434a663"
  },
  {
    "url": "assets/js/34.f162aa54.js",
    "revision": "e528d04e0d715120a1ed92c0653937e4"
  },
  {
    "url": "assets/js/35.f719bbdd.js",
    "revision": "1c5fbdcedc02a5787099b425f2bd50d6"
  },
  {
    "url": "assets/js/36.242ccf10.js",
    "revision": "7775fc11d5827abb4f4dfbde75904342"
  },
  {
    "url": "assets/js/37.0963c53b.js",
    "revision": "698f9fd262c7208412d760af75345cad"
  },
  {
    "url": "assets/js/38.9021aae8.js",
    "revision": "80a08ab69b16c76b01afcd019c1e4078"
  },
  {
    "url": "assets/js/39.82b23bc1.js",
    "revision": "f7f72ff567083c07161b41fa44a6bb1c"
  },
  {
    "url": "assets/js/4.d42ebbba.js",
    "revision": "b6c1712223a9da006af9fd855b3fab50"
  },
  {
    "url": "assets/js/40.0abd4217.js",
    "revision": "64b7b080c251fa5bb348415b143bd043"
  },
  {
    "url": "assets/js/41.6eb48082.js",
    "revision": "3f018b7bd1f4bb9cfbb3f7edba229c8a"
  },
  {
    "url": "assets/js/42.c241a12f.js",
    "revision": "b5224fc408974437b12e4a5c9fd566a3"
  },
  {
    "url": "assets/js/43.ad9be99f.js",
    "revision": "ff6fc9d7972fdc794753a034ead080d5"
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
    "url": "assets/js/9.0c0116f6.js",
    "revision": "4f4faee92c3c32f1ac4688f13c53e518"
  },
  {
    "url": "assets/js/app.2821f556.js",
    "revision": "7d62ef06c7137ba530312657903355b8"
  },
  {
    "url": "config.html",
    "revision": "421d726b2191343e2391e1cebf0c6101"
  },
  {
    "url": "css/advanced/abstract.html",
    "revision": "36464abe19b886e90a7643c51ca85a3e"
  },
  {
    "url": "css/basis/abstract.html",
    "revision": "0fbb157d2a9704227bb6ea96e1ba2d87"
  },
  {
    "url": "css/basis/layout.html",
    "revision": "ca178e3982e3a69aa85ed88d08261bf7"
  },
  {
    "url": "css/index.html",
    "revision": "58fe476e9cbd5c58de40f4704614abfb"
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
    "revision": "106d168dda63fe9f0b069bfda793d81c"
  },
  {
    "url": "logo.png",
    "revision": "f85f82780b0ebed5e2eae82a64fe3022"
  },
  {
    "url": "mobile/index.html",
    "revision": "a40c5f0ba8dd840cf9a575a57955eb94"
  },
  {
    "url": "optimization/index.html",
    "revision": "7a5bd6a86bffb34b4df00e9938f621e7"
  },
  {
    "url": "optimization/webpack/abstract.html",
    "revision": "3dff56492017425bddd9c2a16d5acadd"
  },
  {
    "url": "optimization/webpack/application.html",
    "revision": "9a1e9dc5de771aef09a434f2c7617ab0"
  },
  {
    "url": "optimization/webpack/configuration.html",
    "revision": "70a2d76959189db736552eacbb213b67"
  },
  {
    "url": "typescript/advanced/abstract.html",
    "revision": "b18c70655a71efde957c5a9fd571193e"
  },
  {
    "url": "typescript/basis/abstract.html",
    "revision": "b8365bf53ae15909b90700b308a3edf9"
  },
  {
    "url": "typescript/index.html",
    "revision": "28a752996212b0ceab7192d6c494578e"
  },
  {
    "url": "vue/index.html",
    "revision": "6058f0fc9a2732e569f311e2a6f0eb14"
  },
  {
    "url": "vue/vue-router/abstract.html",
    "revision": "7401e5f6da642b9bf33ec0efeb485585"
  },
  {
    "url": "vue/vue-router/initialization.html",
    "revision": "b108a6d14ea147d9ffbaf5583d753a44"
  },
  {
    "url": "vue/vue-router/match.html",
    "revision": "cca27024027acff1011a6efe8e03fa72"
  },
  {
    "url": "vue/vue-router/plugin.html",
    "revision": "71c877a242db5d88f54a8f096817a740"
  },
  {
    "url": "vue/vue-router/scroll.html",
    "revision": "8849c90040dfa39b190cd0db5d5fe6bc"
  },
  {
    "url": "vue/vue-router/summary.html",
    "revision": "0571c9490dcabf83287f5314a3c1b44d"
  },
  {
    "url": "vue/vue-router/transitions.html",
    "revision": "ba979c5ed07997d393360bdfb379197e"
  },
  {
    "url": "vue/vue-router/warmUp.html",
    "revision": "60a00351c67f58c9da9db34b309ea750"
  },
  {
    "url": "vue/vue/guide.html",
    "revision": "b3ac18b2d789d80a808025959de6746f"
  },
  {
    "url": "vue/vue/vue-render.html",
    "revision": "2c162a30e122ba6ab47a2589c2c176cf"
  },
  {
    "url": "vue/vue3.x/abstract.html",
    "revision": "2cc3ef6b1525f9e0f66e992ab7c0a4eb"
  },
  {
    "url": "vue/vue3.x/features.html",
    "revision": "2944ee01b33163720a98706a5b33e502"
  },
  {
    "url": "vue/vue3.x/performance.html",
    "revision": "09773d9eaa4f6eb913f16caa00ec4983"
  },
  {
    "url": "vue/vue3.x/reactivity.html",
    "revision": "ea01ec44be763a48e550de9c3023ae05"
  },
  {
    "url": "vue/vuex/abstract.html",
    "revision": "3ac54b074de06c6dd23398fedd2bc1a8"
  },
  {
    "url": "vue/vuex/actions.html",
    "revision": "03e84bffe36131399470adad15ffdcd1"
  },
  {
    "url": "vue/vuex/getters.html",
    "revision": "11a2db2e8a05a563781b8f4fb7f69182"
  },
  {
    "url": "vue/vuex/initialization.html",
    "revision": "e783ed2d637698a7eb0c8e9699c23250"
  },
  {
    "url": "vue/vuex/modules.html",
    "revision": "4193c6bc3d61773be1b8aa60e76c47fb"
  },
  {
    "url": "vue/vuex/mutations.html",
    "revision": "bc9a7fcb223631cdc513071ab1b6db21"
  },
  {
    "url": "vue/vuex/others.html",
    "revision": "eb7d47b2fd5c4a428ca12dd5fc013ed6"
  },
  {
    "url": "vue/vuex/state.html",
    "revision": "ba871e9cc7d7a58a36fe83e0483443b9"
  },
  {
    "url": "vue/vuex/warmUp.html",
    "revision": "83c4db959f756ad778054f0c0a818168"
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
