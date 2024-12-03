<template>
    <div class="container-fluid">
      <div class="align-items-center mb-3">
          <h2>Admin Management</h2>
      </div>
      <div class="row mb-3 gap-1 justify-content-around">
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input 
              type="text" 
              class="form-control" 
              v-model="searchQuery"
              placeholder="Search admin..."
            >
          </div>
        </div>
        <div class="col-md-2">
          <select class="form-select" v-model="roleFilter">
            <option value="">All Roles</option>
            <option v-for="role in uniqueRoles" :key="role" :value="role">
              {{ role }}
            </option>
          </select>
        </div>
        <div class="fill col-md-2">
          <select class="form-select" v-model="statusFilter">
            <option value="">All Status</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
        <div class="fill col-md-2">
          <select class="form-select" v-model="sortBy">
            <option value="">Sort by</option>
            <option value="id">Sort by id</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
        <div class="col-md-3 gap-2 d-flex justify-content-end align-items-center">
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
            <i class="bi bi-plus-circle me-2"></i>Add new admin
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
              <th @click="setSortBy('role')" class="cursor-pointer">Role <i class="bi" :class="getSortIcon('role')"></i></th>
              <th>Status</th>
              <th>Permissions</th>
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
              <td>{{ admin.user_address }}</td>
              <td>
                <span class="category-badge" :class="getRoleClass(admin.user_role)">
                  <i :class="getRoleIcon(admin.user_role)"></i>
                  {{ admin.user_role }}
                </span>
              </td>
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
                    {{ admin.user_status ? 'Available' : 'Unavailable' }}
                  </label>
                </div>
              </td>
              <td>
                <div class="d-flex align-items-center">
                    <div class="permission-dots me-2 btn">
                    <span @click="editPermissions(admin)"
                        v-for="perm in availablePermissions" 
                        :key="perm.id"
                        class="permission-dot"
                        :class="{ 'active': admin.permissions && admin.permissions.includes(perm.name) }"
                        :title="perm.name"
                    ></span>
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
                  <button class="action-item" @click="viewDetails(admin)">
                    <i class="bi bi-eye-fill text-primary"></i>
                    View Details
                  </button>
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
                {{ admin.user_address }}
              </p>
              <span class="category-badge" :class="getRoleClass(admin.user_role)">
                <i :class="getRoleIcon(admin.user_role)"></i>
                {{ admin.user_role }}
              </span>
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
                    {{ admin.user_status ? 'Available' : 'Unavailable' }}
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
              <div class="permission-dots mt-2">
                <span
                  v-for="perm in availablePermissions" 
                  :key="perm.id"
                  class="permission-dot"
                  :class="{ 'active': admin.permissions && admin.permissions.includes(perm.name) }"
                  :title="perm.name"
                ></span>
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
                      >
                    </div>
                    <div class="invalid-feedback">{{ formErrors.user_image }}</div>
                    <small class="text-muted">
                      Leave empty to keep existing image when editing
                    </small>
                    <div class="invalid-feedback">{{ formErrors.user_image }}</div>
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
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="formData.user_address"
                      :class="{ 'is-invalid': formErrors.user_address }"
                      required
                    >
                    <div class="invalid-feedback">{{ formErrors.user_address }}</div>
                  </div>
                  <div class="col-md-12 d-flex justify-content-between">
                      <div class="col-50">
                        <label class="form-label">Role</label>
                        <select 
                          class="form-select" 
                          v-model="formData.user_role"
                          :class="{ 'is-invalid': formErrors.user_role }"
                          required
                        >
                          <option v-for="role in roles" :key="role" :value="role">
                            {{ role }}
                          </option>
                        </select>
                        <div class="invalid-feedback">{{ formErrors.user_role }}</div>
                      </div>
  
                      <div class="col-50">
                        <label class="form-label">Status</label>
                        <div class="form-check form-switch">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            v-model="formData.user_status"
                          >
                          <label class="form-check-label">
                            {{ formData.user_status ? 'Available' : 'Unavailable' }}
                          </label>
                        </div>
                      </div>
                  </div>
                  <div class="col-12 mt-3">
                    <label class="form-label fw-bold">Permissions</label>
                    <div class="permissions-grid">
                      <div 
                        v-for="perm in availablePermissions" 
                        :key="perm.id" 
                        class="permission-item"
                      >
                        <div class="form-check">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            :id="perm.id"
                            :value="perm.name"
                            v-model="formData.permissions"
                          >
                          <label class="form-check-label" :for="perm.id">
                            <i :class="'bi ' + perm.icon"></i>
                            {{ perm.name }}
                          </label>
                        </div>
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
                        <span class="category-badge" :class="getRoleClass(selecteditem.user_role)">
                        <i :class="getRoleIcon(selecteditem.user_role)"></i>
                        {{ selecteditem.user_role }}
                        </span>
                        <span 
                        class="status-badge ms-2" 
                        :class="selecteditem.user_status ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'"
                        >
                        {{ selecteditem.user_status ? 'Available' : 'Unavailable' }}
                        </span>
                    </div>
                    <div class="permissions-list">
                        <div v-if="selecteditem.permissions.length === 0" class="text-muted fst-italic">
                        No permissions assigned
                        </div>
                        <span 
                        v-for="perm in selecteditem.permissions" 
                        :key="perm"
                        class="permission-badge"
                        >
                        <i :class="getPermissionIcon(perm)"></i>
                        {{ perm }}
                        </span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="editPermissionsModal" tabindex="-1" ref="editPermissionsModal">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Edit Permissions</h5>
                <button type="button" class="btn-close" @click="closeEditPermissionsModal"></button>
            </div>
            <div class="modal-body">
                <div v-if="selecteditem">
                <div class="d-flex align-items-center mb-4">
                    <img 
                    :src="selecteditem.user_image" 
                    :alt="selecteditem.user_name"
                    class="rounded-circle me-3"
                    style="width: 48px; height: 48px; object-fit: cover;"
                    @error="handleImageError"
                    />
                    <div>
                    <h6 class="mb-1">{{ selecteditem.user_name }}</h6>
                    <span class="text-muted small">{{ selecteditem.user_email }}</span>
                    </div>
                </div>

                <div class="permissions-edit-list">
                    <div 
                    v-for="perm in availablePermissions" 
                    :key="perm.id"
                    class="permission-edit-item"
                    :class="{ 'active': tempPermissions.includes(perm.name) }"
                    >
                    
                        <div class="d-flex form-check form-switch">
                        <input 
                            class="ms-2 form-check-input" 
                            type="checkbox" 
                            :id="'perm_' + perm.id"
                            v-model="tempPermissions"
                            :value="perm.name"
                        >
                        <label class="form-check-label" :for="'perm_' + perm.id">
                            <i :class="'bi ' + perm.icon + ' me-2'"></i>
                            {{ perm.name }}
                        </label>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" @click="closeEditPermissionsModal">
                Cancel
                </button>
                <button type="button" class="btn btn-primary" @click="savePermissions">
                Save Changes
                </button>
            </div>
            </div>
        </div>
        </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { Modal } from 'bootstrap'
  
  import axios from 'axios'

  
  
  
  const activeMenu = ref(null)
  const viewMode = ref('list')
  const loading = ref(true)
  const error = ref(null)
  const admin = ref([])
  const selecteditem = ref(null)
  const searchQuery = ref('')
  const roleFilter = ref('')
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
    user_address: '',
    user_role: 'admin',
    user_status: true,
    permissions: []
  })
  const formErrors = ref({})
  const isEditing = ref(false)

  const imageFile = ref(null)
  const imagePreview = ref(null)
  
  const adminModal = ref(null)
  const viewModal = ref(null)
  
  const roles = computed(() => [
    'staff',
    'admin'
  ])
  
  const uniqueRoles = computed(() => {
    return [...new Set(admin.value.map(c => c.role))]
  })
  
  
  const filteredadmin = computed(() => {
    let filtered = [...admin.value]
  
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(a => 
        a.user_name.toLowerCase().includes(query) ||
        a.user_email.toLowerCase().includes(query)
      )
    }
  
    if (roleFilter.value) {
      filtered = filtered.filter(a => a.user_role === roleFilter.value)
    }
  
    if (statusFilter.value !== '') {
      const status = statusFilter.value === 'true'
      filtered = filtered.filter(a => a.user_status === status)
    }
  
    if (sortBy.value) {
      filtered.sort((a, b) => {
        let comparison = 0
        switch(sortBy.value) {
          case 'id':
            comparison = a.user_id - b.user_id
            break
          case 'name':
            comparison = a.user_name.localeCompare(b.user_name)
            break
          case 'role':
            comparison = a.user_role.localeCompare(b.user_role)
            break
        }
        return sortDirection.value === 'asc' ? comparison : -comparison
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
      .filter(user => user.user_role.toLowerCase() !== 'customer')
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
  
  if (!formData.value.user_name) errors.user_name = 'Name is required'
  if (!formData.value.user_email) errors.user_email = 'Email is required'
  if (!formData.value.user_phone) errors.user_phone = 'Phone number is required'
  if (!formData.value.user_address) errors.user_address = 'Address is required'
  
  // Only validate image for new customers
  if (!isEditing.value && !imageFile.value && !formData.value.user_image) {
    errors.user_image = 'Image is required'
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
      user_address: "",
      user_role: "admin",
      user_status: true,
      permissions: []
    }
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
const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // Kiểm tra file type
    if (!file.type.match(/image.*/)) {
      formErrors.value.image = 'Please upload an image file'
      return
    }
    
    // Kiểm tra file size (ví dụ: max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      formErrors.value.image = 'Image size should be less than 5MB'
      return
    }
    
    imageFile.value = file
    // Create preview
    imagePreview.value = URL.createObjectURL(file)
    
    // Clear error if exists
    formErrors.value.image = ''
    
    console.log('Image uploaded:', {
      file: imageFile.value,
      preview: imagePreview.value
    })
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
  
  
 
  
  
  const getRoleClass = (role) => {
    const classes = {
      'staff': 'bg-info-subtle text-info',
      'admin': 'bg-danger-subtle text-danger'
    }
    return classes[role] || 'bg-secondary-subtle text-secondary'
  }
  
  const getRoleIcon = (role) => {
    const icons = {
      'staff': 'bi bi-cup-straw',
      'admin': 'bi bi-cake2'
    }
    return icons[role] || 'bi bi-tag'
  }
  
  
  watch([searchQuery, statusFilter], () => {
    currentPage.value = 1
  })
  
  watch(adminPerPage, () => {
    currentPage.value = 1
  })
  
  onMounted(() => {
    fetchAdmins()
  })
  
  // Define availablePermissions
  const availablePermissions = ref([
    { id: 'categories', name: 'Manage Categories', icon: 'bi-grid' },
    { id: 'products', name: 'Manage Products', icon: 'bi-box' },
    { id: 'admin', name: 'Manage Admin', icon: 'bi-people' },
    { id: 'orders', name: 'Manage Orders', icon: 'bi-cart' }
  ])
  
  // Define getPermissionIcon function
  const getPermissionIcon = (permission) => {
    const perm = availablePermissions.value.find(p => p.name === permission)
    return perm ? 'bi ' + perm.icon : 'bi-check-circle'
  }
  const editPermissionsModal = ref(null)
const tempPermissions = ref([])

const editPermissions = (admin) => {
  selecteditem.value = admin
  tempPermissions.value = [...(admin.permissions || [])] // Thêm fallback cho trường hợp permissions là undefined
  const modal = new Modal(editPermissionsModal.value)
  modal.show()
}

const closeEditPermissionsModal = () => {
  const modal = Modal.getInstance(editPermissionsModal.value)
  if (modal) {
    modal.hide()
    selecteditem.value = null
    tempPermissions.value = []
  }
}


const savePermissions = async () => {
  if (!selecteditem.value) return

  try {
    // Lấy thông tin admin hiện tại để giữ nguyên các trường khác
    const currentAdmin = admin.value.find(a => a.id === selecteditem.value.id);
    if (!currentAdmin) throw new Error('Admin not found');

    // Tạo object mới với toàn bộ dữ liệu cũ và thay thế hoàn toàn mảng permissions cũ bằng mảng mới
    const updatedData = {
      ...currentAdmin,
      permissions: tempPermissions.value  // Thay thế trực tiếp bằng mảng permissions mới
    };

    // Gửi toàn bộ dữ liệu đã cập nhật lên server
    await axios.put(`http://localhost:3000/users/${selecteditem.value.id}`, updatedData);

    // Cập nhật state local
    const adminIndex = admin.value.findIndex(a => a.id === selecteditem.value.id);
    if (adminIndex !== -1) {
      admin.value[adminIndex] = updatedData;
    }

    closeEditPermissionsModal();
    await fetchAdmins();
    
  } catch (err) {
    console.error('Error updating permissions:', err);
    error.value = 'Failed to update permissions. Please try again.';
  }
}
  // Make sure to export the function by adding it to the setup scope
  defineExpose({
    getPermissionIcon
  })
  </script>
  
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
    /* border: 1px solid #0d6efd; */
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
  </style>