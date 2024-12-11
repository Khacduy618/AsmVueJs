import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/Home.vue";
import Login from "../components/Authentication/Login.vue";
import Register from "../components/Authentication/Register.vue";
import Item from "../components/ItemManagement/Item.vue";
import Customer from "../components/CustomerManagement/Customer.vue";
import Order from "../components/OrderManagement/Order.vue";
import Category from "../components/CategoryManagement/Category.vue";
import Roles from "../components/Roles/Roles.vue";
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:3000'

// Khôi phục token từ localStorage
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

const routes = [
    { path: '/', redirect: '/home',meta: { requiresAuth: true } },
    { path: '/home', name: 'Home', component: Home,meta: { requiresAuth: true } },
    { path: '/category', name: 'Category', component: Category,meta: { requiresAuth: true } },
    { path: '/item', name: 'Item', component: Item,meta: { requiresAuth: true } },
    { path: '/customer', name: 'Customer', component: Customer,meta: { requiresAuth: true } },
    { path: '/order', name: 'Order', component: Order,meta: { requiresAuth: true } },
    { path: '/login', name: 'Login', component: Login,meta: { requiresGuest: true } },
    { path: '/register', name: 'Register', component: Register },
    { path: '/roles', name: 'Roles', component: Roles,meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});



// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Kiểm tra nếu route yêu cầu xác thực
    if (!isAuthenticated) {
      // Nếu chưa đăng nhập, chuyển hướng về trang login
      next({
        path: '/login',
        query: { redirect: to.fullPath } // Lưu lại đường dẫn để redirect sau khi đăng nhập
      })
    } else {
      next() // Cho phép truy cập nếu đã đăng nhập
    }
  } else {
    next() // Cho phép truy cập các route không yêu cầu xác thực
  }
})

// Axios interceptor để xử lý token hết hạn
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default router;