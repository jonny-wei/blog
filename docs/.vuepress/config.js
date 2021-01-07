const sidebar = {
  vue: [
    {
      title: 'Vue秘籍',
      collapsable: false,
      sidebarDepth: 2,
      children: [
        '/vue/'
      ]
    },
    {
      title: 'Vue源码解析',
      collapsable: false,
      sidebarDepth: 2,
      children: [
        'vue/github',
        'vue/vue-render',
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
      sidebarDepth: 2,
      children: [
        'basis/abstract',
        'basis/layout',
      ]
    },
    {
      title: 'CSS进阶',
      collapsable: false,
      sidebarDepth: 2,
      children: [
        'advanced/abstract',
      ]
    },
  ],
  javascript: [
    {
      title: 'JavaScript高级',
      sidebarDepth: 2,
      collapsable: false,
      children: [
        'DOM',
        'sushi-js',
        'advanced',
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
  optimization: [
    {
      title: 'Webpack',
      collapsable: false,
      sidebarDepth: 2,
      children: [
        'webpack/abstract',
        'webpack/configuration',
        'webpack/application'
      ]
    },
    {
      title: '性能优化',
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
      {text: '优化', link: '/optimization/'},
      {text: '移动端', link: '/mobile/'},
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
        '/optimization/': sidebar.optimization,
        '/mobile/': sidebar.mobile
      }
  },
  markdown: {},
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
