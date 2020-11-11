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
    "revision": "831f6558a43dfaa1a1fdb37f9695dd79"
  },
  {
    "url": "assets/css/0.styles.5d9a4cea.css",
    "revision": "6e90722dc6f2bbd502ce8aa5ee83c26e"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.1e40663f.js",
    "revision": "bc962cfdd6c87a3520df3d7c668e59c9"
  },
  {
    "url": "assets/js/11.34ce1eef.js",
    "revision": "04b9d06161ecf898f5871880ef2d0766"
  },
  {
    "url": "assets/js/12.4974fb88.js",
    "revision": "e4b3548b0593cbb7ba9e037db8a27d4e"
  },
  {
    "url": "assets/js/13.6ddf4259.js",
    "revision": "4f2175801e46a17950e4b87d1f897d60"
  },
  {
    "url": "assets/js/14.451572de.js",
    "revision": "01ce4319bffdb0f6731b3b45a5ead6cb"
  },
  {
    "url": "assets/js/15.031b72e4.js",
    "revision": "b2b9aa5a1e37af167e85c48f96c6e4a6"
  },
  {
    "url": "assets/js/16.ef37b8de.js",
    "revision": "e5e3bbd0dd61acb4263cec588adf4740"
  },
  {
    "url": "assets/js/17.e87a4def.js",
    "revision": "e85d0610d91bb54127291e2ae003204e"
  },
  {
    "url": "assets/js/18.322991d6.js",
    "revision": "c9670d73fea50dd2ff7f05499c931c99"
  },
  {
    "url": "assets/js/19.79f43984.js",
    "revision": "d79fd4f1fbfcf704755056d3b811009c"
  },
  {
    "url": "assets/js/2.4f9efc98.js",
    "revision": "17a61760616a0c551279fa586e709188"
  },
  {
    "url": "assets/js/20.763be9b6.js",
    "revision": "8cda1fde59fd5480ae1aef7cdc5838e1"
  },
  {
    "url": "assets/js/21.b87283a8.js",
    "revision": "f37dfd9170ed52ddc0ff5c0b1dab247d"
  },
  {
    "url": "assets/js/22.bfea1beb.js",
    "revision": "6bd03cb5bb7150275a3a157d42596cac"
  },
  {
    "url": "assets/js/23.b019702b.js",
    "revision": "5cedf1b0bdf016b01b57e1a5deb2f7e2"
  },
  {
    "url": "assets/js/24.430624b7.js",
    "revision": "8f91d5e60056758adbc89772434c3cb2"
  },
  {
    "url": "assets/js/25.8fd7fb08.js",
    "revision": "e9411f9c94a179255836af91e360bc12"
  },
  {
    "url": "assets/js/26.8b84139e.js",
    "revision": "4af65ea5a7f4b9bf8dd1437127152605"
  },
  {
    "url": "assets/js/27.bc664401.js",
    "revision": "5a1911cc1fffb1c15df4b3ad2b2294d6"
  },
  {
    "url": "assets/js/28.6cdbdc05.js",
    "revision": "0a32616e591283cc0aeac73641c96f87"
  },
  {
    "url": "assets/js/29.afe662e4.js",
    "revision": "b719f4d55978b04b2d0730f1e4350023"
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
    "url": "assets/js/31.c81caf9f.js",
    "revision": "729a5677d35df6d072b8c920cd258f55"
  },
  {
    "url": "assets/js/32.82a30c77.js",
    "revision": "e351630aae8f31c2596d3b4dc7ba7a17"
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
    "url": "assets/js/35.1441a461.js",
    "revision": "ff8b2144da4251c4ff9e5bbf23eb2bd6"
  },
  {
    "url": "assets/js/36.282bdad1.js",
    "revision": "aa6a6d97d7726bbf34811d054dca929a"
  },
  {
    "url": "assets/js/37.68296a07.js",
    "revision": "8a37d6e537ee0182304e743d837715de"
  },
  {
    "url": "assets/js/38.4017e48c.js",
    "revision": "092e173e87d06c22bdbbe3ca1358f46b"
  },
  {
    "url": "assets/js/39.55b1622a.js",
    "revision": "c9021de99853f3922ee198064b24a05f"
  },
  {
    "url": "assets/js/4.d42ebbba.js",
    "revision": "b6c1712223a9da006af9fd855b3fab50"
  },
  {
    "url": "assets/js/40.a3805d1d.js",
    "revision": "f57ab66495a8384f4ea198d739c5b14e"
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
    "url": "assets/js/45.d7dcfb9a.js",
    "revision": "ce5b8c66eb188bf1580fc942139a7108"
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
    "url": "assets/js/9.fe99acee.js",
    "revision": "ca210d0929bc53645dc292a027bfa3bd"
  },
  {
    "url": "assets/js/app.20ceb659.js",
    "revision": "786a4ab371e521ee6ee0a9331fe5a783"
  },
  {
    "url": "config.html",
    "revision": "1bc7b18e5640303f487faa42c693dd61"
  },
  {
    "url": "css/advanced/abstract.html",
    "revision": "b521b5137c9344fbe83f7b25a3455021"
  },
  {
    "url": "css/basis/abstract.html",
    "revision": "cbc359db0f9b5ad9ed749b3b8dcdbc65"
  },
  {
    "url": "css/basis/layout.html",
    "revision": "bbfbe960df94a9fe62a4e75aff4c2c42"
  },
  {
    "url": "css/index.html",
    "revision": "68eae305886a4a4b0e39a2be6fb7c4e3"
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
    "revision": "b94bd1989cc54eb2bfa9bb3c9b7e399d"
  },
  {
    "url": "logo.png",
    "revision": "f85f82780b0ebed5e2eae82a64fe3022"
  },
  {
    "url": "mobile/index.html",
    "revision": "df765880816d264bff1ea4bc790cd7a2"
  },
  {
    "url": "optimization/index.html",
    "revision": "06420224e8346711a2675dba51b7998b"
  },
  {
    "url": "optimization/webpack/abstract.html",
    "revision": "438bdc4d1e0a6c3eeb056eca0b7ec5cb"
  },
  {
    "url": "optimization/webpack/application.html",
    "revision": "10fbd1997cfa12b4c055b9795ab8e08c"
  },
  {
    "url": "optimization/webpack/configuration.html",
    "revision": "6145407ca64057d6d6fb005b0be53fa4"
  },
  {
    "url": "typescript/advanced/abstract.html",
    "revision": "5d48213d2bb631aa94cabd3c35498073"
  },
  {
    "url": "typescript/basis/abstract.html",
    "revision": "acb3c440638b644bae978e26f551bbba"
  },
  {
    "url": "typescript/index.html",
    "revision": "6eed51ae9a6a6f61dd0e252d0468c072"
  },
  {
    "url": "vue/index.html",
    "revision": "7ace9d1c30c01a5221cbc2add7af2367"
  },
  {
    "url": "vue/vue-router/abstract.html",
    "revision": "d01348136bb39fcabce6e9184ebd9a16"
  },
  {
    "url": "vue/vue-router/initialization.html",
    "revision": "9805f5437d69095c95d9b1ba4fd9b855"
  },
  {
    "url": "vue/vue-router/match.html",
    "revision": "87a65e7b1c29633999ed7ddc37927c68"
  },
  {
    "url": "vue/vue-router/plugin.html",
    "revision": "a86f321b9d61b106a3bb1a3ea75a2a54"
  },
  {
    "url": "vue/vue-router/scroll.html",
    "revision": "1a322fbd0d69adc5dce6f2674f558f9a"
  },
  {
    "url": "vue/vue-router/summary.html",
    "revision": "cbb73c3fb714169005024c0124132e65"
  },
  {
    "url": "vue/vue-router/transitions.html",
    "revision": "f6e29a0c2e0dadf4838cb81647a6337e"
  },
  {
    "url": "vue/vue-router/warmUp.html",
    "revision": "defe2da7eb3ea2ddc072ef605ec4efa6"
  },
  {
    "url": "vue/vue/guide.html",
    "revision": "d131f1be27b1de7aea3bd5b259df0054"
  },
  {
    "url": "vue/vue/vue-render.html",
    "revision": "74cdb1d9b8a0c3965bd987fcfd8608d8"
  },
  {
    "url": "vue/vue3.x/abstract.html",
    "revision": "03fbda5ddf3391fef3ddad39670c3a6e"
  },
  {
    "url": "vue/vue3.x/features.html",
    "revision": "a02d4e8f4df7e1680dc5681ca8a5b8cc"
  },
  {
    "url": "vue/vue3.x/performance.html",
    "revision": "2859c00a1869574c00a3dce665bbabdc"
  },
  {
    "url": "vue/vue3.x/reactivity.html",
    "revision": "971a19af87b976342fe62a0a3901c04c"
  },
  {
    "url": "vue/vuex/abstract.html",
    "revision": "94864f701d8a4b57f1f5357f836efc88"
  },
  {
    "url": "vue/vuex/actions.html",
    "revision": "a06866dc315d050199f582f6fd8848ec"
  },
  {
    "url": "vue/vuex/getters.html",
    "revision": "13b112fb0acfe529d785c1d04cf0a5e5"
  },
  {
    "url": "vue/vuex/initialization.html",
    "revision": "dfb3b478d6c4de8811905dcf8a29a949"
  },
  {
    "url": "vue/vuex/modules.html",
    "revision": "2cd076f6b16a5f4de54ea528775c83cf"
  },
  {
    "url": "vue/vuex/mutations.html",
    "revision": "e72ba1649b32c4255c6c811a522915e8"
  },
  {
    "url": "vue/vuex/others.html",
    "revision": "92260acc14bac59bc9abbd12aa4b2a45"
  },
  {
    "url": "vue/vuex/state.html",
    "revision": "4c7cfb246c2c2e1603b8fb79decfbe58"
  },
  {
    "url": "vue/vuex/warmUp.html",
    "revision": "5f8cbbe5bf24eca69fea1ce92edec469"
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
