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
    "revision": "796fb07eb8954492acf5bf7cdc0cd822"
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
    "url": "assets/js/11.8933522e.js",
    "revision": "c47bab42330462fc5c40683ba3de297e"
  },
  {
    "url": "assets/js/12.6aca2eec.js",
    "revision": "7180ae448ef29cfcaaa20f747ceeaa4d"
  },
  {
    "url": "assets/js/13.4483cca5.js",
    "revision": "f926fd59addeb3904129508c216a61fb"
  },
  {
    "url": "assets/js/14.0b30bb7a.js",
    "revision": "5cfa45be629af344ed9b86ad6097c8f5"
  },
  {
    "url": "assets/js/15.6d4bda15.js",
    "revision": "b0e33af66e2f18a8b1928898e660337c"
  },
  {
    "url": "assets/js/16.2548dc75.js",
    "revision": "d1c755dc193c697659b4e73f56a6add2"
  },
  {
    "url": "assets/js/17.6f2d16a9.js",
    "revision": "f27d0f0e591c9fd30e409e370c040022"
  },
  {
    "url": "assets/js/18.2a098808.js",
    "revision": "cff782744a8aa7864f431810a7649fcd"
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
    "url": "assets/js/20.a66ddf5a.js",
    "revision": "14cdb88c4d6706dfbc6815816b6a4cca"
  },
  {
    "url": "assets/js/21.b87283a8.js",
    "revision": "f37dfd9170ed52ddc0ff5c0b1dab247d"
  },
  {
    "url": "assets/js/22.14480747.js",
    "revision": "7342c5af61ce72e8370e09a4f92499b7"
  },
  {
    "url": "assets/js/23.b019702b.js",
    "revision": "5cedf1b0bdf016b01b57e1a5deb2f7e2"
  },
  {
    "url": "assets/js/24.fe312cae.js",
    "revision": "ee2f9ff05608cf8ce43475bd5166704d"
  },
  {
    "url": "assets/js/25.127d7275.js",
    "revision": "78bf9c331183a9ea04b04d5506cd89b8"
  },
  {
    "url": "assets/js/26.640f204e.js",
    "revision": "a734dbe8670bbed0fd83c975f7c8b4c7"
  },
  {
    "url": "assets/js/27.8012df8b.js",
    "revision": "dd556d09394dd06139570caebf106a5c"
  },
  {
    "url": "assets/js/28.7018bfda.js",
    "revision": "b8e7ce8b242752963ad8c07889f367bc"
  },
  {
    "url": "assets/js/29.85251761.js",
    "revision": "48bbe6b045ce2af3d79120347ac62aaa"
  },
  {
    "url": "assets/js/3.07d27621.js",
    "revision": "4270f1a92575283cdcd263757149b603"
  },
  {
    "url": "assets/js/30.298db240.js",
    "revision": "7b1293905d59b40a205aebf9a9ed5ffe"
  },
  {
    "url": "assets/js/31.dc0692ba.js",
    "revision": "8cf46ea041cb1abf60ed874bb48df444"
  },
  {
    "url": "assets/js/32.12cc7491.js",
    "revision": "9fb55a57852ffc4ea8397a86033da169"
  },
  {
    "url": "assets/js/33.ff205614.js",
    "revision": "de2404ed37f50cb34ab351fe39dbd997"
  },
  {
    "url": "assets/js/34.f162aa54.js",
    "revision": "e528d04e0d715120a1ed92c0653937e4"
  },
  {
    "url": "assets/js/35.a8402b0c.js",
    "revision": "410e3a5258821906c101d8eca443f2e0"
  },
  {
    "url": "assets/js/36.32d100ae.js",
    "revision": "dce2c163e1f663fe3d7441cbf236a609"
  },
  {
    "url": "assets/js/37.0963c53b.js",
    "revision": "698f9fd262c7208412d760af75345cad"
  },
  {
    "url": "assets/js/38.b4d0348c.js",
    "revision": "57e583c67631421388dc8471134b626f"
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
    "url": "assets/js/40.ff816dd8.js",
    "revision": "39ec9c2b51a1a77e3a4e1fac59c1a227"
  },
  {
    "url": "assets/js/41.eb69ae8e.js",
    "revision": "c59f74e7aa0dd94e34ea9fb43fb4d7d4"
  },
  {
    "url": "assets/js/42.37e647b0.js",
    "revision": "d33503f8e7dc0d13592e6ddf56d2eebe"
  },
  {
    "url": "assets/js/43.4467a9f4.js",
    "revision": "bb0567ee3c1f9c67f14deeea1e9fae10"
  },
  {
    "url": "assets/js/44.9d27950f.js",
    "revision": "1d7fae8256124984c3e9ae403f0cdf83"
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
    "url": "assets/js/8.8e1fb46a.js",
    "revision": "a3c3d8baec3131a09195be73c3267f83"
  },
  {
    "url": "assets/js/9.74a07b91.js",
    "revision": "8fe55ae3463d96bb3f031fbb1229e11c"
  },
  {
    "url": "assets/js/app.66196ed2.js",
    "revision": "7bce3f93b9c7015b1b45d551890bd7fb"
  },
  {
    "url": "config.html",
    "revision": "831ffe85db0e8abd925d70bc47f95289"
  },
  {
    "url": "css/advanced/abstract.html",
    "revision": "e4a487856004735dac5878a61389663f"
  },
  {
    "url": "css/basis/abstract.html",
    "revision": "fda00da6c2cfda325dbb24a7dd8a037e"
  },
  {
    "url": "css/basis/layout.html",
    "revision": "9bf5b0d1aa91ce9c2fd67596cc8ef0d4"
  },
  {
    "url": "css/index.html",
    "revision": "ffa00777dae4b93be94f2869804dba59"
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
    "revision": "8c6ecd282014921840c2519c009a721c"
  },
  {
    "url": "logo.png",
    "revision": "f85f82780b0ebed5e2eae82a64fe3022"
  },
  {
    "url": "mobile/index.html",
    "revision": "f30bcf7b25ad6774ea78b8bae2baff0a"
  },
  {
    "url": "optimization/index.html",
    "revision": "0419e0409391ba6bafa98c8444857d90"
  },
  {
    "url": "optimization/webpack/abstract.html",
    "revision": "16d6ee989421fc411f270307605fc8df"
  },
  {
    "url": "optimization/webpack/application.html",
    "revision": "9ebbbadc4e05c2a2fd449a24066c3e7a"
  },
  {
    "url": "optimization/webpack/configuration.html",
    "revision": "b4da46308d35267b9d82cf2ec589d32a"
  },
  {
    "url": "typescript/advanced/abstract.html",
    "revision": "a898494875e0640e4ee020a20ae4d555"
  },
  {
    "url": "typescript/basis/abstract.html",
    "revision": "4c17747437d00f9f303985644eefbf03"
  },
  {
    "url": "typescript/index.html",
    "revision": "51b6ce6e0a7d7b2c3e1daaec4aad319d"
  },
  {
    "url": "vue/index.html",
    "revision": "c395803d72fea9e3bd517384d7ef591d"
  },
  {
    "url": "vue/vue-router/abstract.html",
    "revision": "35263faba8b73d70e553273a2cf399c5"
  },
  {
    "url": "vue/vue-router/initialization.html",
    "revision": "a5fdf837f7f9bfbe9b5d270cb3e5389f"
  },
  {
    "url": "vue/vue-router/match.html",
    "revision": "567be8de696c0c6557f4ee3394987f88"
  },
  {
    "url": "vue/vue-router/plugin.html",
    "revision": "acfda935e95aa59226c2a7c121f9c830"
  },
  {
    "url": "vue/vue-router/scroll.html",
    "revision": "5cc4658317060f153a1c0a9f5688c478"
  },
  {
    "url": "vue/vue-router/summary.html",
    "revision": "d1621459901b430718486b4adf6c296a"
  },
  {
    "url": "vue/vue-router/transitions.html",
    "revision": "920a7644127ac94b143e6bb2c8176461"
  },
  {
    "url": "vue/vue-router/warmUp.html",
    "revision": "10190bd26106e82a98e84f54ab0c9051"
  },
  {
    "url": "vue/vue/guide.html",
    "revision": "08714fded7eddedba4cae87484edb8c3"
  },
  {
    "url": "vue/vue/vue-render.html",
    "revision": "3d42b96685121b10cd084a3d674eabc7"
  },
  {
    "url": "vue/vue3.x/abstract.html",
    "revision": "09c308d3ce56fbba0a25b54053ee0b13"
  },
  {
    "url": "vue/vue3.x/features.html",
    "revision": "6c13ed74c28bce163f38dc77ab223297"
  },
  {
    "url": "vue/vue3.x/performance.html",
    "revision": "066467e577668a4187bb0b68ba257195"
  },
  {
    "url": "vue/vue3.x/reactivity.html",
    "revision": "b1121aaca510e86896266a7dfcbc0882"
  },
  {
    "url": "vue/vuex/abstract.html",
    "revision": "0abfd241aa83e51a80c4bde1941157d1"
  },
  {
    "url": "vue/vuex/actions.html",
    "revision": "cb4e450b49e99dd5bd0956470ad23ce5"
  },
  {
    "url": "vue/vuex/getters.html",
    "revision": "487b8548d02b7790639e7a17b8495b0d"
  },
  {
    "url": "vue/vuex/initialization.html",
    "revision": "cd826748d8fa2d10d507015f15e295ab"
  },
  {
    "url": "vue/vuex/modules.html",
    "revision": "43d9963d8db1b287ee938e18edd7328a"
  },
  {
    "url": "vue/vuex/mutations.html",
    "revision": "d7e947c8b91fb068f5d9dca1ad275462"
  },
  {
    "url": "vue/vuex/others.html",
    "revision": "89e5d3a1971431e5ea20068ebf8e0c43"
  },
  {
    "url": "vue/vuex/state.html",
    "revision": "971381ee1e819de907b9726bb80be882"
  },
  {
    "url": "vue/vuex/warmUp.html",
    "revision": "348046b59d68356c6b206058c2af8a16"
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
