import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

// route level code-splitting
// this generates a separate chunk (queues.[hash].js) for this route
// which is lazy-loaded when the route is visited.
export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/apps',
      name: 'apps',
      component: () => import(/* webpackChunkName: "apps" */ './views/Apps.vue')
    },
    {
      path: '/queues',
      name: 'queues',
      component: () => import(/* webpackChunkName: "queues" */ './views/Queues.vue')
    },
    {
      path: '/sessions',
      name: 'sessions',
      component: () => import(/* webpackChunkName: "sessions" */ './views/Sessions.vue')
    },
  ],
})
