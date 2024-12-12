<template>
  <nav v-if="isAuthenticated" class="navbar">
  <ul  class="navbar-nav">
    <li class="nav-item">
      <router-link class="nav-link" to="">
        <span class="icon">
          <div class="user">
            <img :src="userImage || userImg" alt="User Image">
          </div>
        </span>
        <span class="title">{{ userName }}</span>
      </router-link>
    </li>
    <li v-if="hasAccess('dashboard')" class="nav-item">
      <router-link class="nav-link" to="/home">
        <span class="icon">
          <ion-icon name="home-outline"></ion-icon>
        </span>
        <span class="title">Dashboard</span>
      </router-link>
    </li>
    <li v-if="hasAccess('categories')" class="nav-item">
      <router-link class="nav-link" to="/category">
        <span class="icon">
          <ion-icon name="pricetags-outline"></ion-icon>
        </span>
        <span class="title">Category Management</span>
      </router-link>
    </li>
    <li v-if="hasAccess('products')" class="nav-item">
      <router-link class="nav-link" to="/item">
        <span class="icon">
          <ion-icon name="list-circle-outline"></ion-icon>
        </span>
        <span class="title">Item Management</span>
      </router-link>
    </li>
    <li v-if="hasAccess('customers')" class="nav-item">
      <router-link class="nav-link" to="/customer">
        <span class="icon">
          <ion-icon name="albums-outline"></ion-icon>
        </span>
        <span class="title">Customer Management</span>
      </router-link>
    </li>
    <li v-if="hasAccess('orders')" class="nav-item">
      <router-link class="nav-link" to="/order">
        <span class="icon">
          <ion-icon name="cart-outline"></ion-icon>
        </span>
        <span class="title">Order Management</span>
      </router-link>
    </li>
    <li v-if="hasAccess('roles')" class="nav-item">
      <router-link class="nav-link" to="/roles">
        <span class="icon">
          <ion-icon name="people-outline"></ion-icon>
        </span>
        <span class="title">Staff Management</span>
      </router-link>
    </li>
  </ul>

</nav>
<div class="main" :class="{'active': !isAuthenticated}">
  <div v-if="isAuthenticated" class="container-fluid topbar">
    <div class="toggle" @click="toggleMenu">
      <ion-icon name="menu-outline"></ion-icon>
    </div>
    <button 
        v-if="isAuthenticated" 
        @click="logout" 
        class="btn btn-outline-danger ms-2"
      >
        <i class="bi bi-box-arrow-right"></i> Đăng xuất
      </button>
    <div v-if="!isAuthenticated" class="auth">
      <router-link to="/login">Login</router-link>
      <router-link to="/register">Register</router-link>
    </div>
  </div>
  <router-view />
</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide,computed } from 'vue';
import img from './assets/image/man.png';
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const isAuthenticated = ref(false)
const error = ref(false)
const isAdmin = ref(false)

// State để lưu trữ roles và permissions
const roles = ref([])
const userPermissions = ref([])

// Lấy thông tin user từ localStorage
const user = computed(() => {
  return JSON.parse(localStorage.getItem('user') || '{}')
})

// Fetch roles và permissions từ API
const fetchRolesAndPermissions = async () => {
  try {
    const response = await axios.get('http://localhost:3000/roles')
    roles.value = response.data
    
    // Tìm role của user hiện tại
    const userRole = roles.value.find(role => role.id === user.value.user_role)
    if (userRole) {
      userPermissions.value = userRole.permissions
    }
  } catch (error) {
    console.error('Error fetching roles:', error)
  }
}

// Kiểm tra quyền truy cập
const hasAccess = (menuId) => {
  const permission = userPermissions.value.find(p => p.id === menuId)
  return permission && ['view', 'curate'].includes(permission.access)
}

// Tạo hàm để cập nhật trạng thái xác thực
const updateAuthStatus = (status, userRole) => {
  if (userRole === 'customer') {
    // Xóa token và user trước
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Sau đó cập nhật trạng thái
    isAuthenticated.value = false
    isAdmin.value = false
    error.value = true
    // Cuối cùng mới chuyển trang
    router.push('/login')
    return
  }
  isAuthenticated.value = status
  error.value = false
  isAdmin.value = true

  if(status === true){
    setTimeout(() => {
      window.location.reload()
    }, 1);
  }
}
// Add these computed properties
const userName = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.user_name || 'Admin'
})
const userRole = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.user_role || 'Admin'
})
const userImage = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.user_image
})
// Kiểm tra token khi component được mount
const checkAuth = () => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (!token) {
    isAuthenticated.value = false
    error.value = false
    isAdmin.value = false
    router.push('/login')
    return
  }

  isAuthenticated.value = true
  error.value = false
  isAdmin.value = true
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  isAuthenticated.value = false
  isAdmin.value = false
  router.push('/login')
}

// Provide auth status và update function cho các component con
provide('isAuthenticated', isAuthenticated)
provide('updateAuthStatus', updateAuthStatus)


const userImg = ref(img);

const list = ref([]);

const slideIndex = ref(1);

const activeLink = (event) => {
  list.value.forEach((item) => {
    item.classList.remove("hovered");
  });
  event.target.classList.add("hovered");
};

const toggleMenu = () => {
  const navigation = document.querySelector(".navbar");
  const main = document.querySelector(".main");
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};

const checkTime = (i) => {
  return i < 10 ? "0" + i : i;
};

const updateClock = () => {
  const now = new Date();
  const h = now.getHours();
  const m = checkTime(now.getMinutes());
  const s = checkTime(now.getSeconds());
  const clockElement = document.getElementById('clock');
  if (clockElement) {
    clockElement.innerHTML = `${h}:${m}:${s}`;
  }
};

const toggleDacBiet = (checkbox) => {
  checkbox.value = checkbox.checked ? 1 : 0;
};
onMounted(() => {
  checkAuth()
  fetchRolesAndPermissions()
})

</script>
<style scoped>
/* =============== navbar ================ */
.navbar {
  position: fixed;
  width: 300px;
  height: 100%;
  background: var(--primary);
  border-left: 10px solid var(--primary);
  transition: 0.5s;
  overflow: hidden;
}

.navbar.active {
  width: 80px;
}

.navbar ul {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0;
  width: 100%;
}

.navbar ul li {
  position: relative;
  width: 100%;
  list-style: none;
  border-top-left-radius: 30px;
  border-bottom-left-radius: 30px;
}

.navbar ul li:hover,
.navbar ul li.hovered {
  background-color: var(--white);
}

.navbar ul li:nth-child(1) {
  margin-top: 30px;
  margin-bottom: 30px;
  pointer-events: none;
}

.navbar ul li a {
  position: relative;
  display: block;
  width: 100%;
  display: flex;
  text-decoration: none;
  color: var(--white);
}

.navbar ul li:hover a,
.navbar ul li.hovered a {
  color: var(--primary);
  font-weight: 600;
}

.navbar ul li a .icon {
  position: relative;
  display: flex;
  min-width: 60px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  align-items: center;
  justify-content: center;
}

.navbar ul li a .icon ion-icon {
  font-size: 1.75rem;
}

.navbar ul li a .title {
  position: relative;
  display: block;
  padding: 0 10px;
  height: 40px;
  line-height: 40px;
  text-align: start;
  white-space: nowrap;
}


/* --------- curve outside ---------- */
.navbar ul li:hover a::before,
.navbar ul li.hovered a::before {
  content: "";
  position: absolute;
  right: 0;
  top: -50px;
  width: 50px;
  height: 50px;
  background-color: transparent;
  border-radius: 50%;
  box-shadow: 35px 35px 0 10px var(--white);
  pointer-events: none;
}

.navbar ul li:hover a::after,
.navbar ul li.hovered a::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: -50px;
  width: 50px;
  height: 50px;
  background-color: transparent;
  border-radius: 50%;
  box-shadow: 35px -35px 0 10px var(--white);
  pointer-events: none;
}

/* ===================== main ===================== */
.main {
  position: absolute;
  width: calc(100% - 300px);
  left: 300px;
  min-height: 100vh;
  background: var(--white);
  transition: 0.5s;
  padding: 0 30px 0 0;
}

.main.active {
  width: calc(100% - 80px);
  left: 80px;
}

.topbar {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;

}

.toggle {
  position: relative;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  cursor: pointer;
}

.search {
  position: relative;
  width: 400px;
  margin: 0 10px;
}

.search label {
  position: relative;
  width: 100%;
}

.search label input {
  width: 100%;
  height: 40px;
  border-radius: 40px;
  padding: 5px 20px;
  padding-left: 35px;
  font-size: 18px;
  outline: none;
  border: 1px solid var(--black2);
}


.auth{
  width: 140px;
  padding-right: 20px;
  display: flex;
  justify-content: space-between;
}

.search label ion-icon {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.2rem;
}

.user {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.user img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

</style>