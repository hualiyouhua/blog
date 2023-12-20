module.exports = {
  title: '画里有画的博客',
  description: '技术栈：Vuepress',
  base: '/blog/',
  theme: 'reco',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: '博客',
        items: [
          { text: 'Github', link: 'https://github.com/hualiyouhua' },
          {
            text: '掘金',
            link: 'https://juejin.cn/user/1662117313778104/posts',
          },
        ],
      },
    ],
    sidebar: [
      {
        title: 'React原理',
        path: '/react/principle',
      },
    ],
    subSidebar: 'auto',
  },
};
