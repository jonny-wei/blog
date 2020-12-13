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
    "revision": "916d2293d09fecbd8f6b29e7f3e91bcd"
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
    "url": "assets/js/10.82279177.js",
    "revision": "09fc7cba8ec9b1a3342693e31abb0094"
  },
  {
    "url": "assets/js/11.10d5ee71.js",
    "revision": "02469d386408f6675b815b853bdde6ac"
  },
  {
    "url": "assets/js/12.2bbdcd23.js",
    "revision": "9272c58631d17d9b6039662b93d8abde"
  },
  {
    "url": "assets/js/13.cf8edc87.js",
    "revision": "01c417da9b9a2a20e516df74ed44f1a3"
  },
  {
    "url": "assets/js/14.657e48dc.js",
    "revision": "7788561482cc2f9b4362ef147723a1e5"
  },
  {
    "url": "assets/js/15.5d599b7b.js",
    "revision": "1b1c6eb3c8a809078e3ad982dee626e0"
  },
  {
    "url": "assets/js/16.23aed1a1.js",
    "revision": "879520b041f1dd4acf7072a23d180c52"
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
    "url": "assets/js/19.b3877911.js",
    "revision": "c4be1bf87a182cd86f77579b902c3cb5"
  },
  {
    "url": "assets/js/2.2a4e8c54.js",
    "revision": "17a61760616a0c551279fa586e709188"
  },
  {
    "url": "assets/js/20.6643f154.js",
    "revision": "4b34c7e89944e7270f2d7d7c0063671f"
  },
  {
    "url": "assets/js/21.61c59154.js",
    "revision": "f1aaba2333e4c9c60bd69d7546d6a210"
  },
  {
    "url": "assets/js/22.49991c62.js",
    "revision": "1032fb7ed85985ef9c6dd8d999cd605e"
  },
  {
    "url": "assets/js/23.a90d4dc2.js",
    "revision": "b91f3a31f38b113d3dde1d60952e54b3"
  },
  {
    "url": "assets/js/24.5033fc61.js",
    "revision": "c9b0cfdde87504051f8d0c106244a4de"
  },
  {
    "url": "assets/js/25.c85cf3ad.js",
    "revision": "49b62cb43f074806b83906b97d1dfc4f"
  },
  {
    "url": "assets/js/26.a665c613.js",
    "revision": "bbf488875ecb9d80fc9938a1491b7816"
  },
  {
    "url": "assets/js/27.501345fc.js",
    "revision": "b3f22c8832a709b5988318f213ad3a62"
  },
  {
    "url": "assets/js/28.8761abe9.js",
    "revision": "b55bb1ce7ceb92654a63ac6983f5e01e"
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
    "url": "assets/js/30.36af5247.js",
    "revision": "f2d5cfe2e6d8215efffd14182d20ff0e"
  },
  {
    "url": "assets/js/31.0bc47dcb.js",
    "revision": "24c95857febaab86062883ed72135a51"
  },
  {
    "url": "assets/js/32.369db133.js",
    "revision": "516c5d1bf6e5e46d6bd04394a6bcc13f"
  },
  {
    "url": "assets/js/33.ed9d308b.js",
    "revision": "f81b1f0ec8977007810bd71b64d5b664"
  },
  {
    "url": "assets/js/34.63d3ed65.js",
    "revision": "2b1c6201cb7d534fc0348b7ff5e84f16"
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
    "url": "assets/js/37.0958b6d4.js",
    "revision": "3aefc9e958d1fcec832db71b2e1e08d2"
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
    "url": "assets/js/4.d6a54567.js",
    "revision": "465b1f159e84592eff59fecd8a9a8c5b"
  },
  {
    "url": "assets/js/40.d4985ae3.js",
    "revision": "8ccc91ca7e87d3e2a2b6934e915502e8"
  },
  {
    "url": "assets/js/41.fe05acbd.js",
    "revision": "fba31c351b8717b2e2d41157dcd51b31"
  },
  {
    "url": "assets/js/42.6669f0d5.js",
    "revision": "eb45ae3dbed5645358e12d7696676b89"
  },
  {
    "url": "assets/js/43.0a65983c.js",
    "revision": "0cd52609254fa3a6b14234bf06a407d4"
  },
  {
    "url": "assets/js/44.0c1ab18f.js",
    "revision": "b0c8322977a696bae192411727f5c136"
  },
  {
    "url": "assets/js/45.5983f568.js",
    "revision": "27b2ef4e1425f3b23738b4ffe0c9d5dd"
  },
  {
    "url": "assets/js/46.e97294bf.js",
    "revision": "e7ee820829538650871ec1885d1e1c38"
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
    "url": "assets/js/9.c00eacba.js",
    "revision": "29e2c7e14307a4e6aec19d2f2ae2976a"
  },
  {
    "url": "assets/js/app.59bd3c74.js",
    "revision": "551ccd8c3635c7b8c5b43c39fe05885c"
  },
  {
    "url": "css/advanced/abstract.html",
    "revision": "b4add100e96f2e2d881eb14629e8f2f5"
  },
  {
    "url": "css/basis/abstract.html",
    "revision": "3765931d21ac9db326f6fd19b56ddeef"
  },
  {
    "url": "css/basis/layout.html",
    "revision": "cb98d0cb999c986c01e73480a2fc5317"
  },
  {
    "url": "css/index.html",
    "revision": "9f3445d4baeb80ddbeb08a28e7febd0c"
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
    "revision": "eb7ec7cb4ce77086d1168e93397af94f"
  },
  {
    "url": "javascript/advanced.html",
    "revision": "84d32bbb3dcd3ea4e0e6d1fda5cd8878"
  },
  {
    "url": "javascript/index.html",
    "revision": "6e02117122d87433c8bfa05ba6b6fcd6"
  },
  {
    "url": "logo.png",
    "revision": "f85f82780b0ebed5e2eae82a64fe3022"
  },
  {
    "url": "mobile/index.html",
    "revision": "462d12232b85263531ade2c4859d61e6"
  },
  {
    "url": "optimization/index.html",
    "revision": "804e6793c383186453dabd5b43c91965"
  },
  {
    "url": "optimization/webpack/abstract.html",
    "revision": "4f56b9ce0815a165bdc5a3bb388c5d78"
  },
  {
    "url": "optimization/webpack/application.html",
    "revision": "79f1d853c0b79842e9267d39eecc23d0"
  },
  {
    "url": "optimization/webpack/configuration.html",
    "revision": "752583d952de440a8c6b05c318d9378d"
  },
  {
    "url": "typescript/advanced/abstract.html",
    "revision": "937b1cea6bc590302f79910852624a75"
  },
  {
    "url": "typescript/basis/abstract.html",
    "revision": "3383dbb7624765b9bf87d6e289ef6b2b"
  },
  {
    "url": "typescript/index.html",
    "revision": "6547cfb6e63e0ab746581f6bc5ed4e27"
  },
  {
    "url": "vue/index.html",
    "revision": "02ea86f7f43232b7260c883a1d174742"
  },
  {
    "url": "vue/vue-router/abstract.html",
    "revision": "e8380d6c5fdbc61b9c2df200f166150c"
  },
  {
    "url": "vue/vue-router/initialization.html",
    "revision": "51c7b210180038835ea966b049000da4"
  },
  {
    "url": "vue/vue-router/match.html",
    "revision": "4a5a10291b147f00be3c37f8368b473e"
  },
  {
    "url": "vue/vue-router/plugin.html",
    "revision": "7df3c2134127c4cfaa3e947badd3a58a"
  },
  {
    "url": "vue/vue-router/scroll.html",
    "revision": "3d39e6ef0d7ef51222b0077b21e5c534"
  },
  {
    "url": "vue/vue-router/summary.html",
    "revision": "6b979a9af61490e719cd274e51348557"
  },
  {
    "url": "vue/vue-router/transitions.html",
    "revision": "9e8d90d3b7f500d8eddaf02de5bd7bdd"
  },
  {
    "url": "vue/vue-router/warmUp.html",
    "revision": "0ead58e8dc8fd8ecf3f0a350027b78aa"
  },
  {
    "url": "vue/vue/github.html",
    "revision": "230ae5c3ce994f99e724d6b98534fd8f"
  },
  {
    "url": "vue/vue/vue-render.html",
    "revision": "5546b1e094adf562a77ea8a02918073b"
  },
  {
    "url": "vue/vue3.x/abstract.html",
    "revision": "56a4f6b09b5804e9ab4fda28d0163c9d"
  },
  {
    "url": "vue/vue3.x/features.html",
    "revision": "6483a5b5054c69463d3878f29b661c9d"
  },
  {
    "url": "vue/vue3.x/performance.html",
    "revision": "f36a57c1f6a8c8916c0e323d0d5e3ae6"
  },
  {
    "url": "vue/vue3.x/reactivity.html",
    "revision": "6a69e0cfb71fcd945a83d335b243984d"
  },
  {
    "url": "vue/vuex/abstract.html",
    "revision": "24e7b3bc05f2b807fab51c8eff9a8af8"
  },
  {
    "url": "vue/vuex/actions.html",
    "revision": "786778a3df4e1d1762f30efa8c7ad26b"
  },
  {
    "url": "vue/vuex/getters.html",
    "revision": "568945015490195e49bc980e102afdf6"
  },
  {
    "url": "vue/vuex/initialization.html",
    "revision": "54b7dcc750fb65f2bd284acc26af640c"
  },
  {
    "url": "vue/vuex/modules.html",
    "revision": "28095ec736c18e9398e693235dbe66e2"
  },
  {
    "url": "vue/vuex/mutations.html",
    "revision": "8fd6d0d4e42c7d3313c14e42f8f95c96"
  },
  {
    "url": "vue/vuex/others.html",
    "revision": "29dee68f5c3784770b80b0a334d36dfe"
  },
  {
    "url": "vue/vuex/state.html",
    "revision": "0d384ec94b9b36411cf13ac300b02ea1"
  },
  {
    "url": "vue/vuex/warmUp.html",
    "revision": "ce683a9e3fd1b26a4183128e8c4f6041"
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
