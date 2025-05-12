import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import ThreadDetail from './views/ThreadDetail.vue'
import UserRegistration from './components/UserRegistration.vue'
import UserLogin from './components/UserLogin.vue'
import Admin from './views/Admin.vue'
import path from 'path'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/thread/:id',
    name: 'ThreadDetail',
    component: ThreadDetail
  },
  {
    path: '/register',
    name: 'Register',
    component: UserRegistration
  },
  {
    path: '/login',
    name: 'Login',
    component: UserLogin
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router