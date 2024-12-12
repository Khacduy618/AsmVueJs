<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import axios from 'axios'
  import { Modal } from 'bootstrap'
  import { Country, State, City }  from 'country-state-city';

// Khai báo các ref cơ bản trước
const roles = ref([])
const showRoleModal = ref(false)
const editingRole = ref(null)
const activeMenu = ref(null)
  const viewMode = ref('list')
  const loading = ref(true)
  const error = ref(null)
  const admin = ref([])
  const selecteditem = ref(null)
  const searchQuery = ref('')
  const statusFilter = ref('')
  const sortBy = ref('id')
  const sortDirection = ref('asc')
  const currentPage = ref(1)
  const adminPerPage = ref(12)
 
  const toggleActionMenu = (adminId) => {
    activeMenu.value = activeMenu.value === adminId ? null : adminId
  }
 
  const closeActionMenu = () => {
    activeMenu.value = null
  }

  const formData = ref({
    user_image: '',
    user_name: '',
    user_email: '',
    user_phone: '',
    street: '',
    city: '',
    country: '',
    user_role: 'staff',
    user_status: true,
    permissions: []
  })
  const formErrors = ref({})
  const isEditing = ref(false)


  const imageFile = ref(null)
  const imagePreview = ref(null)
 
  const adminModal = ref(null)
  const viewModal = ref(null)
 
 
 
  const filteredadmin = computed(() => {
    let filtered = [...admin.value]
 
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(admin =>
        admin.user_name?.toLowerCase().includes(query) ||
        admin.user_email?.toLowerCase().includes(query) ||
        admin.street?.toLowerCase().includes(query) ||
        admin.city?.toLowerCase().includes(query) ||
        admin.country?.toLowerCase().includes(query)
      )
    }
 
   
 
    if (statusFilter.value !== '') {
      const status = statusFilter.value === 'true'
      filtered = filtered.filter(a => a.user_status === status)
    }
 
    if (sortBy.value) {
      filtered.sort((a, b) => {
        if (sortBy.value === 'id') return a.user_id - b.user_id
        if (sortBy.value === 'name') return a.user_name.localeCompare(b.user_name)
        return 0
      })
    }
 
    return filtered
  })
 
  const paginatedadmin = computed(() => {
    const start = (currentPage.value - 1) * adminPerPage.value
    const end = start + adminPerPage.value
    return filteredadmin.value.slice(start, end)
  })
 
  const totalPages = computed(() => {
    return Math.ceil(filteredadmin.value.length / adminPerPage.value)
  })
 
  const startIndex = computed(() => {
    return (currentPage.value - 1) * adminPerPage.value
  })
 
  const endIndex = computed(() => {
    const end = startIndex.value + adminPerPage.value
    return Math.min(end, filteredadmin.value.length)
  })
 
 const fetchAdmins = async () => {
 try {
   loading.value = true
   const response = await axios.get('http://localhost:3000/users')
   const allUsers = response.data
   admin.value = allUsers
     .filter(user => user.user_role != '0')
     .map(user => ({
       ...user,
       permissions: user.permissions || []
     }))
 } catch (err) {
   error.value = 'Failed to load admin. Please try again.'
   console.error('Error loading admin:', err)
 } finally {
   loading.value = false
 }
}

 const handleImageError = (event) => {
   event.target.src = 'https://via.placeholder.com/150'
 }


 const setSortBy = (field) => {
   if (sortBy.value === field) {
     sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
   } else {
     sortBy.value = field
     sortDirection.value = 'asc'
   }
 }

 const getSortIcon = (field) => {
   if (sortBy.value !== field) return 'bi-arrow-down-up'
   return sortDirection.value === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'
 }
 const validateForm = () => {
  const errors = {}
 
  if (!formData.value.user_name?.trim()) {
    errors.user_name = 'Name is required'
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.value.user_email?.trim()) {
    errors.user_email = 'Email is required'
  } else if (!emailRegex.test(formData.value.user_email)) {
    errors.user_email = 'Invalid email format'
  }


  const phoneRegex = /^\d{11}$/
  if (!formData.value.user_phone?.trim()) {
    errors.user_phone = 'Phone number is required'
  } else if (!phoneRegex.test(formData.value.user_phone)) {
    errors.user_phone = 'Phone number must be 11 digits'
  }


  if (!formData.value.street?.trim()) {
    errors.street = 'Street address is required'
  }


  if (!formData.value.country) {
    errors.country = 'Please select a country'
  }


  if (!formData.value.city) {
    errors.city = 'Please select a city'
  }


  formErrors.value = errors
  return Object.keys(errors).length === 0
}
 


const resetForm = async () => {
  try {
    const response = await axios.get('http://localhost:3000/users')
    const allUsers = response.data
    const maxId = Math.max(...allUsers.map(user => user.user_id), 0)
     
    formData.value = {
      user_id: maxId + 1,
      user_name: "",
      user_email: "",
      user_phone: "",
      street: "",
      city: "",
      country: "",
      user_role: "staff",
      user_status: true,
      permissions: []
    }
    cities.value = []
    imageFile.value = null
    imagePreview.value = null
    formErrors.value = {}
    isEditing.value = false
  } catch (err) {
    console.error('Error resetting form:', err)
    error.value = 'Failed to reset form'
  }
}


  // Modal handlers
  const openAddModal = () => {
    resetForm()
    const modal = new Modal(adminModal.value)
    modal.show()
  }
 
  const openEditModal = (admin) => {
    isEditing.value = true
    formData.value = { ...admin }
    const modal = new Modal(adminModal.value)
    modal.show()
  }
 
  const closeadminModal = () => {
    const modal = Modal.getInstance(adminModal.value)
    if (modal) {
      modal.hide()
      resetForm()
    }
  }
 
  const validateImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'))
      return
    }


    // Check file type
    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      reject(new Error('Please upload a valid image file (JPEG, PNG, or GIF)'))
      return
    }


    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('Image size should be less than 2MB'))
      return
    }


    const img = new Image()
    img.src = URL.createObjectURL(file)


    img.onload = () => {
      URL.revokeObjectURL(img.src)
      if (img.width > 2000 || img.height > 2000) {
        reject(new Error('Photo size not more than 2000px x 2000px'))
      } else {
        resolve(true)
      }
    }


    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image for validation'))
    }
  })
}


const submitAdmin = async () => {
  if (!validateForm()) return


  try {
    let imagePath = formData.value.user_image
   
    if (imageFile.value) {
      imagePath = await uploadImage(imageFile.value)
      if (!imagePath) throw new Error('Failed to upload image')
    }
   
    // Tạo object mới với toàn bộ dữ liệu form và thay thế hoàn toàn permissions
    const adminData = {
      ...formData.value,
      user_image: imagePath,
      permissions: formData.value.permissions || [] // Đảm bảo luôn có mảng permissions, ngay cả khi rỗng
    }


    let adminId = null
    if (isEditing.value) {
      const existingAdmin = admin.value.find(a => a.user_id === formData.value.user_id)
      adminId = existingAdmin?.id
      if (!adminId) throw new Error('Admin not found')
    }


    const baseUrl = 'http://localhost:3000/users'
    if (isEditing.value) {
      await axios.put(`${baseUrl}/${adminId}`, adminData)
    } else {
      await axios.post(baseUrl, adminData)
    }
   
    await fetchAdmins()
    closeadminModal()
  } catch (err) {
    console.error('Submit error:', err)
    error.value = err.message || 'An error occurred'
  }
}




const toggleStatus = async (admin) => {
  try {
    const updatedAdmin = {
      ...admin,
      user_status: !admin.user_status
    }


    await axios.patch(`http://localhost:3000/users/${admin.id}`, {
      user_status: updatedAdmin.user_status
    })


    await fetchAdmins()
  } catch (err) {
    admin.user_status = !admin.user_status
    error.value = 'Failed to update status. Please try again.'
    console.error('Error toggling status:', err)
  }
}


const uploadImage = async (file) => {
  if (!file) return null;
 
  const formData = new FormData();
  formData.append('image', file);
 
  try {
    const response = await axios.post('http://localhost:3001/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
   
    return `http://localhost:3001${response.data.imagePath}`;
  } catch (err) {
    console.error('Image upload failed:', err);
    throw err;
  }
}


// Add image handling methods
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return


  try {
    await validateImage(file)
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
    formErrors.value.image = ''
  } catch (err) {
    formErrors.value.image = err.message
    imageFile.value = null
    imagePreview.value = null
    event.target.value = '' // Reset input
  }
}
 
 
  const viewDetails = (admin) => {
    selecteditem.value = admin
    const modal = new Modal(viewModal.value)
    modal.show()
  }
 
  const closeViewModal = () => {
    const modal = Modal.getInstance(viewModal.value)
    if (modal) {
      modal.hide()
      selecteditem.value = null
    }
  }
  const getRoleName = (roleId) => {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : 'No Role'
}
//   const updateUserRole = async (userId, newRoleId) => {
//   try {
//     const user = users.value.find(u => u.id === userId)
//     if (user) {
//       user.role_id = newRoleId
//       await axios.put(`http://localhost:3000/users/${userId}`, user)
//       console.log(`User ${userId} role updated to ${newRoleId}`)
//     }
//   } catch (err) {
//     console.error('Failed to update user role:', err)
//   }
// }
 
 
  watch([searchQuery, statusFilter], () => {
    currentPage.value = 1
  })
 
  watch(adminPerPage, () => {
    currentPage.value = 1
  })
 
  const countries = ref([])
  const cities = ref([])
  const states = ref([])


  const fetchCountries = () => {
    try {
      countries.value = Country.getAllCountries().map(country => ({
        name: country.name,
        code: country.isoCode,
        flag: country.flag
      }))
    } catch (err) {
      console.error('Error fetching countries:', err)
      error.value = 'Failed to load countries'
    }
  }


  const handleCountryChange = () => {
    formData.value.city = ''
    cities.value = []
    states.value = []
   
    if (!formData.value.country) return
   
    try {
      const selectedCountry = countries.value.find(c => c.name === formData.value.country)
      if (selectedCountry) {
        states.value = State.getStatesOfCountry(selectedCountry.code)
        const allCities = City.getCitiesOfCountry(selectedCountry.code)
        cities.value = allCities.map(city => city.name)
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
      error.value = 'Failed to load cities'
    }
  }



// Khai báo availablePermissions trước khi sử dụng trong defaultRoles
const availablePermissions = ref([
  {
    id: 'dashboard',
    name: 'Dashboard Access',
    collections: ['view', 'none'],
    description: 'Access to view dashboard statistics'
  },
  {
    id: 'categories',
    name: 'Categories Management',
    collections: ['view', 'curate', 'none'],
    description: 'Manage product categories'
  },
  {
    id: 'products',
    name: 'Products Management',
    collections: ['view', 'curate', 'none'],
    description: 'Manage product inventory'
  },
  {
    id: 'customers',
    name: 'Customers Management',
    collections: ['view', 'curate', 'none'],
    description: 'Manage customer information'
  },
  {
    id: 'orders',
    name: 'Orders Management',
    collections: ['view', 'curate', 'none'],
    description: 'Process and manage orders'
  },
  {
    id: 'roles',
    name: 'Roles Management',
    collections: ['view', 'curate', 'none'],
    description: 'Manage roles'
  }
])

// Và formData
const formDataRole = ref({
  name: '',
  permissions: availablePermissions.value.map(p => ({
    id: p.id,
    access: 'none'
  }))
})

// Thêm ref để lưu trữ danh sách users
const usersRole = ref([])



// Computed property để tính số lượng members cho mỗi role
const getMemberCount = (roleId) => {
  
  return usersRole.value.filter(user => user.user_role == roleId).length
}

// Các methods
const fetchRoles = async () => {
  try {
    loading.value = true
    const [rolesResponse, usersResponse] = await Promise.all([
      axios.get('http://localhost:3000/roles'),
      axios.get('http://localhost:3000/users')
    ])
    roles.value = rolesResponse.data
    usersRole.value = usersResponse.data
    console.log(usersRole.value);
  } catch (err) {
    error.value = 'Failed to load roles'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const submitRole = async () => {
  try {
    const roleData = {
      name: formDataRole.value.name,
        permissions: formDataRole.value.permissions,
      created_at: new Date().toISOString()
    }

    if (editingRole.value) {
      await axios.put(`http://localhost:3000/roles/${editingRole.value.id}`, roleData)
    } else {
      await axios.post('http://localhost:3000/roles', roleData)
    }

    await fetchRoles()
    closeRoleModal()
  } catch (err) {
    error.value = 'Failed to save role'
    console.error(err)
  }
}

const openAddRoleModal = () => {
  editingRole.value = null
  formDataRole.value = {
    name: '',
    permissions: availablePermissions.value.map(p => ({
      id: p.id,
      access: 'none'
    }))
  }
  showRoleModal.value = true
}

const openEditRoleModal = (role) => {
  editingRole.value = role
  
  const permissions = availablePermissions.value.map(p => {
    const existingPerm = role.permissions?.find(rp => rp.id === p.id)
    return {
      id: p.id,
      access: existingPerm?.access || 'none'
    }
  })

  formDataRole.value = {
    name: role.name,
    permissions: permissions
  }
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  editingRole.value = null
  formDataRole.value = {
    name: '',
    permissions: availablePermissions.value.map(p => ({
      id: p.id,
      access: 'none'
    }))
  }
}

const getPermissionAccess = (permId) => {
  const permission = formDataRole.value.permissions.find(p => p.id === permId)
  return permission?.access || 'none'
}

// Định nghĩa hàm updatePermission
const updatePermission = (permId, event) => {
  const permission = formDataRole.value.permissions.find(p => p.id === permId)
  if (permission) {
    permission.access = event.target.value
  }
}

// Thêm biến để theo dõi trạng thái chỉnh sửa role
const editRoleId = ref(null)

// Hàm để lưu role sau khi chỉnh sửa
const saveRole = async (admin) => {
  try {
    await axios.patch(`http://localhost:3000/users/${admin.id}`, {
      user_role: admin.user_role
    })
    editRoleId.value = null
    console.log(`User ${admin.id} role updated to ${admin.user_role}`)
    await fetchAdmins() // Refresh danh sách users sau khi cập nhật
  } catch (err) {
    console.error('Failed to update user role:', err)
  }
}

onMounted(async () =>  {
  await fetchAdmins()
  fetchRoles()
   fetchCountries()
})
</script>

<template>
  <div class="container-fluid mb-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Role Management</h2>
      <button class="btn btn-primary" @click="openAddRoleModal">
        <i class="bi bi-plus-circle me-2"></i>Create New Role
      </button>
    </div>

    <!-- Role List -->
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Permissions</th>
                <th>Members</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in roles" :key="role.id">
                <td>{{ role.name }}</td>
                <td>
                  <div class="permission-dots">
                    <span v-for="perm in role.permissions" 
                          :key="perm.id"
                          class="badge"
                          :class="{
                            'bg-success': perm.access === 'curate',
                            'bg-info': perm.access === 'view',
                            'bg-secondary': perm.access === 'none'
                          }"
                    >
                      {{ perm.id }}: {{ perm.access }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="badge bg-info">
                    {{ getMemberCount(role.id) }} users
                  </span>
                </td>
                <td>{{ new Date(role.created_at).toLocaleDateString() }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-2" @click="openEditRoleModal(role)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

    <!-- Role Modal -->
    <div class="modal" :class="{ 'd-block': showRoleModal }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingRole ? 'Edit Role' : 'Create New Role' }}
            </h5>
            <button type="button" class="btn-close" @click="closeRoleModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitRole">
              <div class="mb-3">
                <label class="form-label">Role Name</label>
                <input type="text" class="form-control" v-model="formDataRole.name" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Permissions</label>
                <div class="row g-3">
                  <div v-for="perm in availablePermissions" 
                       :key="perm.id" 
                       class="col-md-6">
                    <div class="card">
                      <div class="card-body">
                        <h6>{{ perm.name }}</h6>
                        <p class="text-muted small">{{ perm.description }}</p>
                        <select class="form-select" 
                                v-model="formDataRole.permissions.find(p => p.id === perm.id).access"
                                @change="updatePermission(perm.id, $event)">
                          <option v-for="access in perm.collections" 
                                  :key="access" 
                                  :value="access">
                            {{ access }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeRoleModal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Role</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-3 gap-1 justify-content-around">
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input
              type="text"
              class="form-control"
              v-model="searchQuery"
              placeholder="Search by name, email or address..."
            >
          </div>
        </div>
       
        <div class="fill col-md-2">
          <select class="form-select" v-model="statusFilter">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div class="fill col-md-2">
          <select class="form-select" v-model="sortBy">
            <option value="">Sort by</option>
            <option value="id">Sort by id</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
        <div class="col-md-3 ms-auto gap-2 d-flex justify-content-end align-items-center">
          <div class="btn-group">
            <button
              class="btn"
              :class="{'btn-primary': viewMode === 'list', 'btn-light': viewMode !== 'list'}"
              @click="viewMode = 'list'"
            >
            <i class="bi bi-list"></i>
          </button>
            <button
              class="btn"
              :class="{'btn-primary': viewMode === 'grid', 'btn-light': viewMode !== 'grid'}"
              @click="viewMode = 'grid'"
            >
              <i class="bi bi-grid"></i>
            </button>
          </div>
          <button class="btn btn-danger" @click="openAddModal">
            <i class="bi bi-plus-circle me-2"></i>Add new staff
          </button>
        </div>
  </div>
     
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
 
      <div v-else-if="error" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-3" @click="retryLoading">
          Retry
        </button>
      </div>
 
      <div v-else-if="filteredadmin.length === 0" class="text-center py-5">
        <i class="bi bi-inbox display-1 text-muted"></i>
        <p class="mt-3 text-muted">No admin found</p>
        <button class="btn btn-primary mt-2" @click="openAddModal">
          Add your first admin
        </button>
      </div>
 
      <div v-else-if="viewMode === 'list'" class="table-responsive">
        <table class="table align-middle">
          <thead class="bg-light">
            <tr>
              <th @click="setSortBy('id')" class="cursor-pointer">
                ID # <i class="bi" :class="getSortIcon('id')"></i>
              </th>
              <th>Image</th>
              <th @click="setSortBy('name')" class="cursor-pointer">
                Name <i class="bi" :class="getSortIcon('name')"></i>
              </th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Address</th>
              <th>Status</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in paginatedadmin" :key="admin.id">
              <td>{{ admin.user_id }}</td>
              <td>
                <img
                  :src="admin.user_image"
                  :alt="admin.user_name"
                  class="item-img"
                  @error="handleImageError"
                />
              </td>
              <td>{{ admin.user_name }}</td>
              <td>{{ admin.user_email }}</td>
              <td>{{ admin.user_phone }}</td>
              <td>{{ admin.street }} {{ admin.city }} {{ admin.country }}</td>
             
              <td>
                <div class="status-switch form-switch">
                  <input
                    class="status-switch-input"
                    :id="'status' + admin.id"
                    type="checkbox"
                    :checked="admin.user_status"
                    @change="toggleStatus(admin)"
                  >
                  <label class="status-switch-label" :for="'status' + admin.id">
                    {{ admin.user_status ? 'Active' : 'Inactive' }}
                  </label>
                </div>
              </td>
              <td>
                <div class="d-flex align-items-center">
                  <div v-if="editRoleId === admin.id">
                    <select 
                      v-model="admin.user_role" 
                      class="form-select" 
                      @change="saveRole(admin)"
                    >
                      <option v-for="role in roles" :key="role.id" :value="role.id">
                        {{ role.name }}
                      </option>
                    </select>
                  </div>
                  <div v-else>
                    <span>{{ getRoleName(admin.user_role) }}</span>
                    <button 
                      class="btn btn-sm btn-outline-secondary ms-2" 
                      @click="editRoleId = editRoleId === admin.id ? null : admin.id"
                    >
                      <i :class="editRoleId === admin.id ? 'bi bi-check-circle' : 'bi bi-pencil'"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td class="position-relative">
                <button class="btn btn-link text-secondary"
                        @click="toggleActionMenu(admin.id)"
                        ref="actionButton">
                  <i class="bi bi-gear"></i>
                </button>
               
                <div v-if="activeMenu === admin.id"
                     class="action-menu shadow"
                     @mouseleave="closeActionMenu">
                  
                  <button class="action-item" @click="openEditModal(admin)">
                    <i class="bi bi-pencil-fill text-success"></i>
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
 
      <div v-else class="row g-4">
        <div v-for="admin in paginatedadmin" :key="admin.id" class="col-md-4 col-lg-3 p-2">
          <div class="card h-100">
            <img
              :src="admin.user_image"
              class="card-img-top"
              :alt="admin.user_name"
              style="height: 200px; object-fit: cover;"
              @error="handleImageError"
            >
            <div class="card-body">
              <h5 class="card-title">{{ admin.user_name }}</h5>
              <p class="card-text text-truncate">{{ admin.user_email }}</p>
              <p class="card-text mb-1">
                <i class="bi bi-telephone me-2"></i>
                {{ admin.user_phone }}
              </p>
              <p class="card-text mb-2">
                <i class="bi bi-geo-alt me-2"></i>
                {{ admin.street }} {{ admin.city }} {{ admin.country }}
              </p>
            </div>
            <div class="card-footer bg-white">
              <div class="d-flex justify-content-between align-items-center">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :checked="admin.user_status"
                    @change="toggleStatus(admin)"
                  >
                  <label class="form-check-label">
                    {{ admin.user_status ? 'Active' : 'Inactive' }}
                  </label>
                </div>
                <div class="btn-group">
                  <button class="btn btn-light btn-sm" @click="viewDetails(admin)">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-light btn-sm" @click="openEditModal(admin)">
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
 
     
      <div class="d-flex justify-content-between align-items-center mt-4">
        <span class="text-secondary">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredadmin.length }} admin
        </span>
        <div class="d-flex gap-2 align-items-center">
          <nav aria-label="Page navigation">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li
              v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
          <select class="form-select" v-model="adminPerPage">
            <option :value="12">12 / page</option>
            <option :value="24">24 / page</option>
            <option :value="50">50 / page</option>
          </select>
        </div>
      </div>
 
     
      <div class="modal fade" id="adminModal" tabindex="-1" ref="adminModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditing ? 'Edit admin' : 'Add New admin' }}</h5>
              <button type="button" class="btn-close" @click="closeadminModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitAdmin" class="needs-validation" novalidate>
               
                <div class="text-center mb-3">
                      <img
                      :src="imagePreview || formData.user_image || 'https://via.placeholder.com/150'"
                        class="rounded preview-img"
                        :alt="formData.user_name || 'user preview'"
                        style="max-width: 200px; height: auto;"
                      >
                    </div>
 
                <div class="row g-3">
                  <div class="col-12">
                  <label class="form-label">Avatar</label>
                  <div class="input-group">
                      <input
                        type="file"
                        class="form-control"
                        accept="image/*"
                        @change="handleImageUpload"
                        :class="{ 'is-invalid': formErrors.user_image }"
                      > <span class="input-group-text">
                        <i class="bi bi-check-circle-fill text-success" v-if="imageFile"></i>
                        <i class="bi bi-image text-muted" v-else></i>
                      </span>
                    </div>
                    <div v-if="formErrors.image" class="invalid-feedback d-block">{{ formErrors.image }}</div>
                <small v-else-if="imageFile == '' || imageFile == null" class="text-muted">
                  Suggested image size is around 2mb and less than 2000px x 2000px
                </small>
                <small v-else class="text-success">
                  <i class="bi bi-check-circle-fill"></i> Image selected successfully
                </small>
                </div>
                  <div class="col-12">
                    <label class="form-label">Name</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.user_name"
                      :class="{ 'is-invalid': formErrors.user_name }"
                      required
                    ></input>
                    <div class="invalid-feedback">{{ formErrors.user_name }}</div>
                  </div>
                  <div class="col-md-12 d-flex justify-content-between">
                      <div class="col-50">
                          <label class="form-label">Email</label>
                          <div class="input-group">
                          <input
                              type="email"
                              class="form-control"
                              v-model="formData.user_email"
                              :class="{ 'is-invalid': formErrors.user_email }"
                              required
                          >
                          <div class="invalid-feedback">{{ formErrors.user_email }}</div>
                          </div>
                      </div>
                      <div class="col-50">
                      <label class="form-label">Phone Number</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.user_phone"
                        :class="{ 'is-invalid': formErrors.user_phone }"
                        required
                      >
                      <div class="invalid-feedback">{{ formErrors.user_phone }}</div>
                    </div>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Address</label>
                    <div class="row g-3">
                      <div class="col-md-12">
                        <label class="form-label">Street</label>
                        <input
                        type="text"
                          class="form-control"
                          v-model="formData.street"
                          :class="{ 'is-invalid': formErrors.street }"
                          required
                        >
                        <div class="invalid-feedback">{{ formErrors.street }}</div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Country</label>
                        <select
                          class="form-select"
                          v-model="formData.country"
                          :class="{ 'is-invalid': formErrors.country }"
                          @change="handleCountryChange"
                          required
                        >
                          <option value="">Select Country</option>
                          <option v-for="country in countries"
                                  :key="country.code"
                                  :value="country.name">
                            {{ country.name }}
                          </option>
                        </select>
                        <div class="invalid-feedback">{{ formErrors.country }}</div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">City</label>
                        <select
                          class="form-select"
                          v-model="formData.city"
                          :class="{ 'is-invalid': formErrors.city }"
                          required
                          :disabled="!formData.country || !cities.length"
                        >
                          <option value="">Select City</option>
                          <option v-for="city in cities"
                                  :key="city"
                                  :value="city">
                            {{ city }}
                          </option>
                        </select>
                        <div class="invalid-feedback">{{ formErrors.city }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-12 d-flex justify-content-between">
                     
                      <div class="col-50">
                        <label class="form-label">Status</label>
                        <div class="form-check form-switch">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            v-model="formData.user_status"
                          >
                          <label class="form-check-label">
                            {{ formData.user_status ? 'Active' : 'Inactive' }}
                          </label>
                        </div>
                      </div>
                  </div>
                  
                </div>
 
                <div class="mt-4">
                  <button type="submit" class="btn btn-primary me-2">
                    {{ isEditing ? 'Update admin' : 'Add admin' }}
                  </button>
                  <button type="button" class="btn btn-light" @click="closeadminModal">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
 
      <div class="modal fade" id="viewModal" tabindex="-1" ref="viewModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">admin Details</h5>
              <button type="button" class="btn-close" @click="closeViewModal"></button>
            </div>
            <div class="modal-body" v-if="selecteditem">
              <div class="row">
                <div class="col-md-3 me-2">
                  <img
                    :src="selecteditem.user_image"
                    :alt="selecteditem.user_name"
                    class="img-fluid rounded"
                    @error="handleImageError"
                    />
                </div>
                <div class="col-md-7">
                    <h4>{{ selecteditem.user_name }}</h4>
                    <h5>{{ selecteditem.user_email }}</h5>
                    <h5>{{ selecteditem.user_phone}}</h5>
                    <div class="mb-3">
                       
                        <span
                        class="status-badge ms-2"
                        :class="selecteditem.user_status ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'"
                        >
                        {{ selecteditem.user_status ? 'Active' : 'Inactive' }}
                        </span>
                    </div>
                    
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  </div>
  

      
</template>
 

<style scoped>
.fill{
  max-width: 185px;
}
.col-50{
  width: 378px;
}
.table-responsive{
  border-radius:  10px;
  margin-bottom: 20px;
  padding: 1rem;
  box-shadow: 0 5px 8px rgba(73, 72, 72, 0.3);
  background-color: #fff;
}
.cursor-pointer {
  cursor: pointer;
}

.preview-img {
  max-width: 200px;
  height: 200px;
  object-fit: cover;
}

.item-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.action-menu {
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border-radius: 8px;
  min-width: 150px;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  text-align: left;
  transition: background-color 0.2s;
}

.action-item:hover {
  background-color: #f8f9fa;
}

.pagination {
  gap: 0.25rem;
}

.page-link {
  border-radius: 4px !important;
  border: none;
  padding: 0.5rem 0.75rem;
  color: #666;
}

.page-link:hover {
  background-color: #f8f9fa;
  color: #000;
}

.page-item.active .page-link {
  background-color: #ff5733;
  color: white;
}

.btn-danger {
  background-color: #ff5733;
  border-color: #ff5733;
}

/* Card view styles */
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.modal-lg {
  max-width: 800px;
}
.status-switch {
  position: relative;
  display: inline-block;
  width: 120px;
  height: 34px;
}

.status-switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.status-switch-label {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ccc;
  border-radius: 34px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.status-switch-input:checked + .status-switch-label {
  background-color: #50a9f1;
  color: white;
}

.status-switch-input:not(:checked) + .status-switch-label {
  background-color: #ebe7e7;
  border:#bdbaba solid 1px;
  color: rgb(182, 180, 180);
}

.status-switch-input:checked + .status-switch-label::before {
  transform: translateX(85px);
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.permission-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #e9ecef;
  border-radius: 20px;
  font-size: 0.875rem;
}

.permission-badge i {
  font-size: 0.875rem;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.permission-item {
  padding: 0.5rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: background-color 0.2s;
}

.permission-item:hover {
  background-color: #e9ecef;
  cursor: pointer;
  border: 1px solid #0d6efd;
}

.permission-item .form-check {
  margin: 0;
}

.permission-item .form-check-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.permission-item i {
  font-size: 1rem;
  color: #6c757d;
}

.permission-dots {
  display: flex;
  gap: 4px;
}

.permission-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #dee2e6;
}

.permission-dot.active {
  background-color: #0d6efd;
}

.permissions-edit-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.permission-edit-item {
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.2s;
}

.permission-edit-item:hover {
  background-color: #e9ecef;
}

.permission-edit-item.active {
  background-color: #e7f1ff;
}

.permission-edit-item .form-check {
  margin: 0;
  padding-left: 0;
}

.permission-edit-item .form-check-label {
  display: flex;
  align-items: center;
  margin-left: 1rem;
  cursor: pointer;
}

.permission-edit-item i {
  font-size: 1.1rem;
  color: #6c757d;
}

.permission-edit-item.active i {
  color: #0d6efd;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.permission-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  font-size: 0.875rem;
  padding: 0.5em 0.75em;
}

.bg-info {
  background-color: #17a2b8;
}

.form-select-sm {
  min-width: 150px;
}

.current-role {
  font-weight: 500;
  color: #0d6efd;
}

.form-select {
  min-width: 150px;
  transition: all 0.2s ease;
}

.form-select:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.btn-outline-secondary {
  border-color: #e5e7eb;
}

.btn-outline-secondary:hover {
  background-color: #f8f9fa;
}

.badge {
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.badge:hover {
  transform: scale(1.05);
}
</style>