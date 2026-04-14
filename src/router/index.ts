import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('@/views/LibraryView.vue'),
    },
    {
      path: '/reader/:id',
      name: 'reader',
      component: () => import('@/views/ReaderView.vue'),
      props: true,
    },
    {
      path: '/infographics/:id',
      redirect: (to) => ({ path: `/reader/${to.params.id}`, query: { tab: 'infographics' } }),
    },
    {
      path: '/mindmap/:id',
      redirect: (to) => ({ path: `/reader/${to.params.id}`, query: { tab: 'mindmap' } }),
    },
  ],
})

export default router
