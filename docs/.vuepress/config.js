const sidebar = {
  base: [
    {
      title: "JavaScript高级",
      sidebarDepth: 1,
      collapsable: false,
      children: [
        "",
        "javascript/prototype",
        "javascript/scope",
        "javascript/ECS",
        "javascript/VO",
        "javascript/scope-chain",
        "javascript/this",
        "javascript/closure",
        "javascript/arguments",
        "javascript/var",
        "javascript/arrow-function",
        "javascript/async-plan",
        "javascript/async-achieve",
        "javascript/event-loop",
        "javascript/set-map",
        "javascript/proxy-reflect",
        "javascript/module",
        "javascript/decorator",
      ],
    },
    {
      title: "浏览器与网络",
      collapsable: false,
      sidebarDepth: 1,
      children: [
        "browser/browser-start",
        "browser/http-history",
        "browser/network-OSI",
        "browser/network-tcp",
        "browser/network-websocket",
        "browser/http-message",
        "browser/http-status",
        "browser/http-methods",
        "browser/web-storage",
        "browser/DNS",
        "browser/browser-cache",
        "browser/browser-render",
        "browser/cross-domain",
        "browser/web-security",
        "browser/web-attack",
        "browser/js-gc",
        "browser/dom-event",
      ],
    },
    {
      title: "CSS基础",
      collapsable: false,
      sidebarDepth: 1,
      children: [
        "css-basis/css-rule",
        "css-basis/css-box",
        "css-basis/css-bfc",
        "css-basis/css-ifc",
        "css-basis/css-cc",
        "css-basis/css-layout",
        "css-basis/css-knowledge",
        "css-basis/css-isuess",
      ],
    },
    {
      title: "CSS进阶",
      collapsable: false,
      sidebarDepth: 1,
      children: [
        "css-advanced/animation",
        "css-advanced/canvas",
        "css-advanced/css-text",
      ],
    },
  ],
  vue: [
    {
      title: "Vue",
      collapsable: false,
      sidebarDepth: 1,
      children: [
        "",
        "warmup/vue-symbols",
        "warmup/vue-optimization",
        "warmup/vue-router",
        "warmup/vue-vuex",
      ],
    },
    {
      title: "Vue源码解析",
      collapsable: false,
      sidebarDepth: 1,
      children: [
        "vue/github",
        "vue/vue-render",
        "vue/vue-init",
        "vue/vue-component",
        "vue/vue-observer",
        "vue/vue-template",
        "vue/vue-diff",
        "vue/vue-nextTick",
        "vue/vue-lifecycle",
        "vue/vue-computed",
        "vue/vue-slot",
        "vue/vue-directive",
        "vue/vue-event",
      ],
    },
    {
      title: "VueRouter源码解析",
      collapsable: false,
      sidebarDepth: 2,
      children: [
        "vue-router/abstract",
        "vue-router/warmUp",
        "vue-router/plugin",
        "vue-router/initialization",
        "vue-router/transitions",
        "vue-router/match",
        "vue-router/summary",
      ],
    },
    {
      title: "Vuex源码解析",
      collapsable: false,
      sidebarDepth: 2,
      children: [
        "vuex/abstract",
        "vuex/warmUp",
        "vuex/initialization",
        "vuex/state",
        "vuex/getters",
        "vuex/mutations",
        "vuex/actions",
        "vuex/modules",
        "vuex/others",
      ],
    },
    {
      title: "Vue3新特性",
      sidebarDepth: 2,
      collapsable: false,
      children: [
        "vue3.x/reactivity",
        "vue3.x/features",
        "vue3.x/performance",
      ],
    },
    {
      title: "VueNext",
      sidebarDepth: 1,
      collapsable: false,
      children: [
        "vue3/reactivity",
        "vue3/diff",
        "vue3/components",
        "vue3/inner-components",
        "vue3/compiler",
        "vue3/hooks",
        "vue3/vue-router4",
        "vue3/pinia",
        "vue3/ssr",
      ],
    },
  ],
  react: [
    {
      title: "React",
      collapsable: false,
      sidebarDepth: 1,
      children: [
        "",
        "warmup/react-component",
        "warmup/react-state",
        "warmup/react-props",
        "warmup/react-lifecycle",
        "warmup/react-ref",
        "warmup/react-context",
        "warmup/react-css",
        "warmup/react-hoc",
        "warmup/react-render",
        "warmup/react-router",
        "warmup/react-redux",
        "warmup/react-mobx",
        "warmup/react-keepalive",
        "warmup/react-state-v18",
        "warmup/react-transition",
        "warmup/react-suspense",
        "warmup/react-useSyncExternalStore",
        "warmup/react-ssr",
      ],
    },
    {
      title: "React源码解析",
      collapsable: false,
      sidebarDepth: 1,
      children: [
        "react/react-reconciler",
        "react/react-priority",
        "react/react-scheduler",
        "react/react-render",
        "react/react-commit",
        "react/react-diff",
        "react/react-hooks",
        "react/react-context",
        "react/react-event",
      ],
    },
  ],
  node: [
    {
      title: "基础与实战",
      sidebarDepth: 2,
      collapsable: false,
      children: [""],
    },
  ],
  devops: [
    {
      title: "Webpack",
      collapsable: false,
      sidebarDepth: 1,
      children: [
        "",
        "webpack/building",
        "webpack/dependency-graph",
        "webpack/chunk",
        "webpack/compile",
        "webpack/hmr",
        "webpack/loader",
        "webpack/plugin",
        "webpack/module-federation",
        "webpack/cache",
        "webpack/parallel",
        "webpack/split-chunks",
        "webpack/compress",
        "webpack/tree-shaking",
        "webpack/others",
      ],
    },
    {
      title: "Vite",
      sidebarDepth: 1,
      collapsable: false,
      children: [
        "vite/esm",
        "vite/css",
        "vite/prebuild",
        "vite/engines",
        "vite/rollup",
        "vite/building",
        "vite/plugin",
        "vite/hmr",
        "vite/ssr",
        "vite/legacy",
        "vite/split-code",
        "vite/mini",
        "vite/vite-news",
      ],
    },
    {
      title: "性能优化",
      sidebarDepth: 1,
      collapsable: false,
      children: [
        "performance/indicator",
        "performance/webpack",
        "performance/network",
        "performance/render",
        "performance/code",
        "performance/analysis",
        "performance/optimization",
      ],
    },
    {
      title: "代码与包管理",
      sidebarDepth: 1,
      collapsable: false,
      children: ["git/git", "git/package"],
    },
  ],
  mobile: [
    {
      title: "跨端技术",
      collapsable: false,
      sidebarDepth: 1,
      children: ["", "h5/jsbridge", "h5/webview", "h5/pwa", "h5/mobile-fit"],
    },
    {
      title: "小程序",
      collapsable: false,
      sidebarDepth: 1,
      children: ["mini/framework", "mini/render", "mini/page", "mini/security"],
    },
  ],
  architecture: [
    {
      title: "前端架构",
      collapsable: false,
      sidebarDepth: 1,
      children: [
        "",
        "framework/Islands",
        "framework/micro-frontend",
        "framework/shadowbox",
        "framework/icestark",
        "framework/wujie",
        "framework/ali-lowcode-engine",
        "framework/materialin-engine",
        "framework/choreography-engine",
        "framework/lowcode-extend"
      ],
    },
    {
      title: "其他",
      collapsable: false,
      sidebarDepth: 1,
      children: ["others/web-worker", "others/service-worker"],
    },
  ],
  // code: [
  //   {
  //     title: "算法&编程",
  //     collapsable: false,
  //     sidebarDepth: 1,
  //     children: [""],
  //   },
  // ],
  // weekly: [
  //   {
  //     title: "文渊阁",
  //     collapsable: false,
  //     sidebarDepth: 1,
  //     children: [""],
  //   },
  // ],
};

module.exports = {
  base: "/blog/",
  title: "前端那些事儿",
  description: "我命由我不由天，学习吧少年",
  head: [
    ["link", { rel: "icon", href: "/logo.png" }],
    ["link", { rel: "manifest", href: "/manifest.json" }],
    ["meta", { name: "theme-color", content: "#3eaf7c" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    [
      "meta",
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
    ],
    [
      "link",
      { rel: "apple-touch-icon", href: "/images/icons/apple-icon-152x152.png" },
    ],
    [
      "meta",
      {
        name: "msapplication-TileImage",
        content: "/icons/ms-icon-144x144.png",
      },
    ],
    ["meta", { name: "msapplication-TileColor", content: "#000000" }],
  ],
  dest: "docs/.vuepress/dist",
  smoothScroll: true,
  port: 9999,
  themeConfig: {
    logo: "/logo.png",
    sidebarDepth: 2,
    smoothScroll: true,
    nav: [
      { text: "主页", link: "/" },
      { text: "前端基础", link: "/base/" },
      { text: "Vue", link: "/vue/" },
      { text: "React", link: "/react/" },
      { text: "Node", link: "/node/" },
      { text: "前端工程化", link: "/devops/" },
      { text: "泛客户端", link: "/mobile/" },
      { text: "架构&方案", link: "/architecture/" },
      // { text: "算法&编程", link: "/code/" },
      // { text: "前端周刊", link: "/weekly/" },
      {
        text: "GitHub",
        items: [
          { text: "GitHub", link: "https://github.com/jonny-wei" },
          { text: "JS 寿司", link: "https://github.com/jonny-wei/sushi-js" },
        ],
      },
    ],
    sidebar: {
      "/base/": sidebar.base,
      "/vue/": sidebar.vue,
      "/react/": sidebar.react,
      "/node/": sidebar.node,
      "/devops/": sidebar.devops,
      "/mobile/": sidebar.mobile,
      "/architecture/": sidebar.architecture,
      // "/code/": sidebar.code,
      // "/weekly/": sidebar.weekly,
    },
  },
  markdown: {
    lineNumbers: true,
  },
  plugins: [
    ["@vuepress/back-to-top", true],
    ["@vuepress/medium-zoom", true],
    ["vuepress-plugin-reading-time"],
    ["reading-progress"],
    [
      "@vuepress/pwa",
      {
        serviceWorker: true,
        updatePopup: true,
      },
    ],
    [
      "vuepress-plugin-right-anchor",
      {
        showDepth: 1,
        ignore: ["/", "/vue/"],
        expand: {
          default: true,
          trigger: "hover",
        },
        customClass: "right-anchor",
        disableGlobalUI: false,
      },
    ],
  ],
};
