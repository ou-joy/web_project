import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import Cats from './components/Cats.vue'
import About from './components/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/cats', component: Cats },
  { path: '/about', component: About }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
