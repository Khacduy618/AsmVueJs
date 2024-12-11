<script setup>
import { ref, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// Inject update function từ App.vue
const updateAuthStatus = inject('updateAuthStatus')

const login = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await axios.get(`/users?user_email=${email.value}`)
    const user = response.data[0]
    
    if (user && user.user_password === password.value) {
      const token = btoa(JSON.stringify({
        id: user.user_id,
        email: user.user_email,
        role: user.user_role,
        exp: new Date().getTime() + (24 * 60 * 60 * 1000)
      }))
      
      // Lưu token và user info
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Cập nhật header cho axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Cập nhật trạng thái xác thực
      updateAuthStatus(true,user.user_role)
      
      // Chuyển hướng dựa vào role
      if (user.user_role !== '0') {

        router.push('/home')
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        updateAuthStatus(false)
        error.value = 'Bạn không có quyền quản trị'
      }
    } else {
      error.value = 'Email hoặc mật khẩu không đúng'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Có lỗi xảy ra, vui lòng thử lại'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-lg border-0 rounded-lg">
          <div class="card-body p-4">
            <h3 class="card-title text-center mb-4">Đăng nhập</h3>
            
            <form @submit.prevent="login">
              <div class="form-floating mb-3">
                <input 
                  type="email" 
                  class="form-control" 
                  id="floatingEmail"
                  v-model="email"
                  required
                  placeholder="name@example.com"
                >
                <label for="floatingEmail">Email</label>
              </div>

              <div class="form-floating mb-3">
                <input 
                  type="password" 
                  class="form-control" 
                  id="floatingPassword"
                  v-model="password"
                  required
                  placeholder="Password"
                >
                <label for="floatingPassword">Mật khẩu</label>
              </div>

              <div v-if="error" class="alert alert-danger">
                {{ error }}
              </div>

              <button 
                type="submit" 
                class="btn btn-primary w-100"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>