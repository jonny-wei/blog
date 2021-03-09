const sidebar = {
  vue: [
    {
      title: 'Vue秘籍',
      collapsable: false,
      sidebarDepth: 1,
      children: [
        '',
        'interview/vue-communication',
        'interview/vue-symbols',
        'interview/vue-test'
      ]
    },
    {
      title: 'Vue源码解析',
      collapsable: false,
      sidebarDepth: 1,
      children: [
        'vue/github',
        'vue/vue-render',
        'vue/vue-init',
        'vue/vue-observer',
        'vue/vue-template',
        'vue/vue-diff',
        'vue/vue-router',
        'vue/vue-vuex',
      ]
    },
    {
      title: 'VueRouter源码解析',
      collapsable: false,
      sidebarDepth: 2,
      children: [
        'vue-router/abstract',
        'vue-router/warmUp',
        'vue-router/plugin',
        'vue-router/initialization',
        'vue-router/transitions',
        'vue-router/match',
        'vue-router/scroll',
        'vue-router/summary',
      ]
    },
    {
      title: 'Vuex源码解析',
      collapsable: false,
      sidebarDepth: 2,
      children: [
        'vuex/abstract',
        'vuex/warmUp',
        'vuex/initialization',
        'vuex/state',
        'vuex/getters',
        'vuex/mutations',
        'vuex/actions',
        'vuex/modules',
        'vuex/others',
      ]
    },
    {
      title: 'Vue3新特性',
      sidebarDepth: 2,
      collapsable: false,
      children: [
        'vue3.x/abstract',
        'vue3.x/reactivity',
        'vue3.x/features',
        'vue3.x/performance',
      ]
    }
  ],
  css: [
    {
      title: 'CSS基础',
      collapsable: false,
      sidebarDepth: 1,
      children: [
        'basis/css-box',
        'basis/css-bfc',
        'basis/css-layout',
        'basis/css-isuess',
      ]
    },
    {
      title: 'CSS进阶',
      collapsable: false,
      sidebarDepth: 1,
      children: [
        'advanced/animation',
      ]
    },
  ],
  javascript: [
    {
      title: 'JavaScript高级',
      sidebarDepth: 1,
      collapsable: false,
      children: [
        '',
        'depth/prototype',
        'depth/scope',
        'depth/ECS',
        'depth/VO',
        'depth/scope-chain',
        'depth/this',
        'depth/closure',
        'depth/arguments',
        'depth/var',
        'depth/arrow-function',
        'depth/async-plan',
        'depth/async-achieve',
        'depth/event-loop',
        'depth/set-map',
        'depth/proxy-reflect',
        'depth/module',
        'depth/decorator',
        'depth/reference'
      ]
    },
    {
      title: '浏览器与网络',
      collapsable: false,
      sidebarDepth: 1,
      children: [
        'browser/browser-start',
        'browser/http-history',
        'browser/network-OSI',
        'browser/network-tcp',
        'browser/network-websocket',
        'browser/http-message',
        'browser/http-status',
        'browser/http-methods',
        'browser/web-storage',
        'browser/DNS',
        'browser/browser-cache',
        'browser/browser-render',
        'browser/cross-domain',
        'browser/web-security',
        'browser/web-attack',
        'browser/js-gc',
        'browser/reference'
      ]
    },
    {
      title: 'DOM',
      sidebarDepth: 2,
      collapsable: false,
      children: [
        'dom/dom-event',
      ]
    },
  ],
  typescript: [
    {
      title: 'TypeScript基础',
      sidebarDepth: 2,
      collapsable: false,
      children: [
        'basis/abstract',
      ]
    },
    {
      title: 'TypeScript进阶',
      sidebarDepth: 2,
      collapsable: false,
      children: [
        'advanced/abstract',
      ]
    },
  ],
  node: [
    {
      title: '基础与实战',
      sidebarDepth: 2,
      collapsable: false,
      children: [
        '',
      ]
    },
    {
      title: '性能调优',
      sidebarDepth: 2,
      collapsable: false,
      children: [
        
      ]
    },
    {
      title: '框架与工程化',
      sidebarDepth: 2,
      collapsable: false,
      children: [
        
      ]
    },
  ],
  optimization: [
    {
      title: 'Webpack',
      collapsable: false,
      sidebarDepth: 1,
      children: [
        '',
        'webpack/abstract',
        'webpack/configuration',
        'webpack/application'
      ]
    },
    {
      title: '性能优化',
      sidebarDepth: 1,
      collapsable: false,
      children: [
        'performance/network',
        'performance/webpack',
        'performance/render',
        'performance/code',
        'performance/analysis'
      ]
    },
    {
      title: '错误定位',
      sidebarDepth: 1,
      collapsable: false,
      children: [
        'error/capture',
        'error/monitor'
      ]
    },
    {
      title: '文件处理',
      sidebarDepth: 2,
      collapsable: false,
      children: []
    },
    {
      title: '图片处理',
      sidebarDepth: 2,
      collapsable: false,
      children: [
        'images/reference'
      ]
    },
    {
      title: '换肤',
      sidebarDepth: 2,
      collapsable: false,
      children: []
    },
  ],
  mobile: [
    {
      title: 'H5',
      collapsable: false,
      sidebarDepth: 2,
      children: []
    },
    {
      title: 'RN',
      collapsable: false,
      children: []
    },
    {
      title: 'Hybrid',
      collapsable: false,
      children: []
    },
    {
      title: '多端统一',
      collapsable: false,
      children: []
    },
    {
      title: '小程序',
      collapsable: false,
      children: []
    },
  ],
  talk: [
    {
      title: '项目',
      collapsable: false,
      sidebarDepth: 1,
      children: [
        '',
        'micro-frontend',
        'BFF',
        'auth',
        'friendship-link'
      ]
    }
  ]
};




module.exports = {
  base: '/blog/',
  title: '花帽子的博客',
  description: '我命由我不由天，学习吧少年',
  head: [
    ['link', {rel: 'icon', href: '/logo.png'}],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', {rel: 'apple-touch-icon',href: '/images/icons/apple-icon-152x152.png'}],
    ['meta', { name: 'msapplication-TileImage', content: '/icons/ms-icon-144x144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
  ],
  dest: 'docs/.vuepress/dist',
  smoothScroll: true,
  port: 9999,
  themeConfig: {
    logo: '/logo.png',
    sidebarDepth: 2,
    // lastUpdated: '最近更新',
    smoothScroll: true,
    nav: [
      {text: '主页', link: '/'},
      {text: 'Vue', link: '/vue/'},
      {text: 'CSS', link: '/css/'},
      {text: 'JS', link: '/javascript/'},
      {text: 'TS', link: '/typescript/'},
      {text: 'Node', link: '/node/'},
      {text: '优化', link: '/optimization/'},
      {text: '移动端', link: '/mobile/'},
      {text: '项目', link: '/talk/'},
      {
        text: 'GitHub',
        items: [
          {text: 'GitHub地址', link: 'https://github.com/jonny-wei'},
        ]
      }
    ],
    sidebar: {
        '/vue/': sidebar.vue,
        '/css/': sidebar.css,
        '/javascript/': sidebar.javascript,
        '/typescript/': sidebar.typescript,
        '/node/': sidebar.node,
        '/optimization/': sidebar.optimization,
        '/mobile/': sidebar.mobile,
        '/talk/': sidebar.talk
      }
  },
  markdown: {
    lineNumbers: true
  },
  plugins: [
    ['@vuepress/back-to-top',true],
    ['@vuepress/medium-zoom',true],
    ['vuepress-plugin-reading-time'],
    ['reading-progress'],
    [
      '@vuepress/pwa',
      {
        serviceWorker: true,
        updatePopup: true
      }
    ],
    [
      'vuepress-plugin-right-anchor',
      {
        showDepth: 1,
        ignore: [
          '/',
          '/vue/'
        ],
        expand: {
          default: true,
          trigger: 'hover'
        },
        customClass: 'right-anchor',
        disableGlobalUI: false,
      }
    ]
  ],
};
