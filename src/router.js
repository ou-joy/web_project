import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import Cats from './components/Cats.vue'
import CatDetail from './components/CatDetail.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/cats', component: Cats },
  { path: '/cat/:id', component: CatDetail }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
