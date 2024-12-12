<template>
    <div class="container-fluid">
      <!-- Header Section -->
      <div class="align-items-center mb-3">
          <h1 class="heading">Category Management</h1>
      </div>
      <!-- Search and Filter Section -->
      <div class="row mb-3 gap-1">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input 
              type="text" 
              class="form-control" 
              v-model="searchQuery"
              placeholder="Search categories..."
            >
          </div>
        </div>
        <div class="fill col-md-2">
          <select class="form-select" v-model="sortBy">
            <option value="id">Sort by ID</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
        <div class="col-md-3 d-flex justify-content-end gap-3 align-items-center ms-md-auto">
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
            <i class="bi bi-plus-circle me-2"></i>Add new category
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
  
      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-3" @click="retryLoading">
          Retry
        </button>
      </div>
  
      <!-- Empty State -->
      <div v-else-if="filteredCategories.length === 0" class="text-center py-5">
        <i class="bi bi-inbox display-1 text-muted"></i>
        <p class="mt-3 text-muted">No categories found</p>
        <button class="btn btn-primary mt-2" @click="openAddModal">
          Add your first category
        </button>
      </div>
  
      <!-- List View -->
      <div v-else-if="viewMode === 'list'" class="table-responsive">
        <table class="table table-hover align-middle">
          <thead >
            <tr>
              <th @click="setSortBy('id')" class="cursor-pointer">
                ID # <i class="bi" :class="getSortIcon('id')"></i>
              </th>
              <th>Image</th>
              <th @click="setSortBy('name')" class="cursor-pointer">
                Name <i class="bi" :class="getSortIcon('name')"></i>
              </th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in paginatedCategories" :key="category.category_id">
              <td>{{ category.category_id }}</td>
              <td>
                    <img :src="category.category_img" 
                    :alt="category.category_name" 
                    class="item-img"
                    @error="handleImageError"
                    />
              </td>
              <td>{{ category.category_name }}</td>
              <td class="text-truncate" style="max-width: 300px">
                {{ category.category_desc }}
              </td>
              <td class="position-relative">
                <button class="btn btn-link text-secondary" 
                        @click="toggleActionMenu(category.category_id)"
                        ref="actionButton">
                  <i class="bi bi-gear"></i>
                </button>
                
                <div v-if="activeMenu === category.category_id" 
                     class="action-menu shadow" 
                     @mouseleave="closeActionMenu">
                  <button class="action-item" @click="viewDetails(category)">
                    <i class="bi bi-eye-fill text-primary"></i>
                    View Details
                  </button>
                  <button class="action-item" @click="openEditModal(category)">
                    <i class="bi bi-pencil-fill text-success"></i>
                    Edit
                  </button>
                  <button class="action-item" @click="confirmDelete(category)">
                    <i class="bi bi-trash-fill text-danger"></i>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="row g-4">
        <div v-for="category in paginatedCategories" :key="category.category_id" class="col-md-4 col-lg-3 p-2">
            <div class="card h-100">
            <img 
                :src="category.category_img" 
                class="card-img-top" 
                :alt="category.category_name"
                style="height: 200px; object-fit: cover;"
                @error="handleImageError"
            >
            <div class="card-body">
                <h5 class="card-title">{{ category.category_name }}</h5>
                <p class="card-text text-truncate">{{ category.category_desc }}</p>
            </div>
          <div class="card-footer bg-white">
            <div class="d-flex align-items-center">
              <div class="btn-group">
                <button class="btn btn-light btn-sm" @click="viewDetails(category)">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-light btn-sm" @click="openEditModal(category)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-light btn-sm" @click="confirmDelete(category)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      <!-- Grid View -->
      
      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-4">
        <span class="text-secondary">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredCategories.length }} category
        </span>
        <div class="d-flex gap-2 align-items-center">
          <nav aria-label="Page navigation">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page" 
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
          <select class="form-select" v-model="itemsPerPage">
            <option :value="10">10 / page</option>
            <option :value="20">20 / page</option>
            <option :value="30">30 / page</option>
            <option :value="50">50 / page</option>
          </select>
        </div>
      </div>
  
      <!-- Add/Edit Modal -->
      <div class="modal fade" id="itemModal" tabindex="-1" ref="itemModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditing ? 'Edit Category' : 'Add New Category' }}</h5>
              <button type="button" class="btn-close" @click="closeCategoryModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitCategory" class="needs-validation" novalidate>
                <div class="row g-3">
                  <div class="col-12">
                    <div class="text-center mb-3">
                      <img 
                        :src="imagePreview || formData.category_img || 'https://via.placeholder.com/150'" 
                        class="rounded preview-img"
                        :alt="formData.category_name || 'category preview'"
                        style="max-width: 200px; height: auto;"
                      >
                    </div>
                    
                    <label class="form-label">Category Image</label>
                    <div class="input-group">
                      <input 
                        type="file" 
                        class="form-control" 
                        accept="image/*"
                        @change="handleImageUpload"
                        :class="{ 'is-invalid': formErrors.image }"
                      >
                      <span class="input-group-text">
                        <i class="bi bi-check-circle-fill text-success" v-if="imageFile"></i>
                        <i class="bi bi-image text-muted" v-else></i>
                      </span>
                    </div>
                    <div v-if="formErrors.image" class="invalid-feedback d-block">{{ formErrors.image }}</div>
                    <small v-else-if="imageFile == '' || imageFile == null" class="text-muted">
                      Suggested image size is around 2mb and less than 150px x 150px
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
                      v-model="formData.category_name"
                      :class="{ 'is-invalid': formErrors.name }"
                      required
                    >
                    <div class="invalid-feedback">{{ formErrors.name }}</div>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea 
                      class="form-control" 
                      v-model="formData.category_desc"
                      :class="{ 'is-invalid': formErrors.description }"
                      rows="3"
                      required
                    ></textarea>
                    <div class="invalid-feedback">{{ formErrors.description }}</div>
                  </div>
                </div>

                <div class="mt-4">
                  <button type="submit" class="btn btn-primary me-2">
                    {{ isEditing ? 'Update Category' : 'Add Category' }}
                  </button>
                  <button type="button" class="btn btn-light" @click="closeCategoryModal">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  <!-- View Modal -->
      <div class="modal fade" id="viewModal" tabindex="-1" ref="viewModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Category Details</h5>
              <button type="button" class="btn-close" @click="closeViewModal"></button>
            </div>
            <div class="modal-body" v-if="selectedCategory">
              <div class="row">
                <div class="col-md-3 me-2">
                  <img 
                    :src="selectedCategory.category_img" 
                    :alt="selectedCategory.category_name"
                    class="img-fluid rounded"
                    @error="handleImageError"
                  />
                </div>
                <div class="col-md-7">
                  <h4>{{ selectedCategory.category_name }}</h4>
                  <p class="text-muted">{{ selectedCategory.category_desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      <div class="modal fade" id="deleteModal" tabindex="-1" ref="deleteModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">Confirm Delete</h5>
              <button type="button" class="btn-close" @click="closeDeleteModal"></button>
            </div>
            <div class="modal-body" v-if="selectedCategory">
              <p>Are you sure you want to delete "{{ selectedCategory.category_name }}"?</p>
              <p class="text-muted small">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light" @click="closeDeleteModal">Cancel</button>
              <button type="button" class="btn btn-danger" @click="deleteCategory">
                <i class="bi bi-trash me-1"></i> Delete
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
  
  
  
  
  // State declarations
  const categories = ref([])
  const selectedCategory = ref(null)
  const activeMenu = ref(null)
  const viewMode = ref('list')
  const loading = ref(true)
  const error = ref(null)
  const searchQuery = ref('')
  const sortBy = ref('id')
  const sortDirection = ref('asc')
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const isEditing = ref(false)
  
  // Modal refs
  const itemModal = ref(null)
  const viewModal = ref(null)
  const deleteModal = ref(null)
  
  // Form data
  const formData = ref({
    category_name: '',
    category_desc: '',
    category_img: ''
  })
  
  const formErrors = ref({})
  
  // Add new refs for image handling
  const imageFile = ref(null)
  const imagePreview = ref(null)
  
  // API Functions
  const fetchCategories = async () => {
    try {
      loading.value = true
      const response = await axios.get('/categories')
      categories.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
    } finally {
      loading.value = false
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
        if (img.width > 150 || img.height > 150) {
          reject(new Error('Image dimensions should not exceed 150x150 pixels'))
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
  
  const validateForm = () => {
    const errors = {}
    
    // Name validation
    const nameValue = formData.value.category_name?.trim()
    if (!nameValue) {
      errors.name = 'Name is required'
    } else if (nameValue.length < 5) {
      errors.name = 'Name must be at least 5 characters long'
    } else if (!/^[A-Za-z][A-Za-z\s]*$/.test(nameValue)) {
      errors.name = 'Name must start with a letter and contain only letters and spaces'
    }
    
    // Description validation
    const descValue = formData.value.category_desc?.trim()
    if (!descValue) {
      errors.description = 'Description is required'
    } else if (descValue.length < 10) {
      errors.description = 'Description must be at least 10 characters long'
    }

    formErrors.value = errors
    return Object.keys(errors).length === 0
  }
  
  const submitCategory = async () => {
    if (!validateForm()) return
  
    try {
      // Step 1: Upload image first (if there's a new image)
      let imagePath = formData.value.category_img
      if (imageFile.value) {
        try {
          imagePath = await uploadImage(imageFile.value)
          if (!imagePath) {
            throw new Error('Failed to upload image')
          }
        } catch (err) {
          // Show image upload error to user
          error.value = 'Image upload failed: ' + (err.response?.data?.message || err.message || 'Please try again')
          return // Stop here if image upload fails
        }
      }

      // Step 2: Submit category data
      const categoryData = {
        ...formData.value,
        category_img: imagePath
      }

      // Find the category's 'id' when editing
      let categoryId = null
      if (isEditing.value) {
        const category = categories.value.find(c => c.category_id === formData.value.category_id)
        categoryId = category?.id
        if (!categoryId) throw new Error('Category not found')
      }

      // Submit to API
      const baseUrl = '/categories'
      const response = await axios({
        method: isEditing.value ? 'put' : 'post',
        url: isEditing.value ? `${baseUrl}/${categoryId}` : baseUrl,
        data: categoryData,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Success handling
      await fetchCategories()
      closeCategoryModal()
      
      // Show success message
      alert(isEditing.value ? 'Category updated successfully!' : 'Category added successfully!')

    } catch (err) {
      console.error('Submit error:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to save category'
    }
  }
  
  const deleteCategory = async () => {
    if (!selectedCategory.value) return
    
    try {
      const category = categories.value.find(
        c => c.category_id === selectedCategory.value.category_id
      )
      
      if (!category?.id) {
        throw new Error('Category not found')
      }

      await axios.delete(`/categories/${category.id}`)
      
      await fetchCategories()
      closeDeleteModal()
    } catch (err) {
      error.value = err.response?.data?.message || err.message
    }
  }
  
  // Computed Properties
  const filteredCategories = computed(() => {
    let filtered = [...categories.value]
  
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(c => 
        c.category_name.toLowerCase().includes(query) ||
        c.category_desc.toLowerCase().includes(query)
      )
    }
    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy.value === 'id') {
        comparison = a.category_id - b.category_id
      } else if (sortBy.value === 'name') {
        comparison = a.category_name.localeCompare(b.category_name)
      }
      return sortDirection.value === 'asc' ? comparison : -comparison
    })
  
    return filtered
  })
  
  const paginatedCategories = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredCategories.value.slice(start, end)
  })
  
  const totalPages = computed(() => {
    return Math.ceil(filteredCategories.value.length / itemsPerPage.value)
  })
  
  const startIndex = computed(() => {
    return (currentPage.value - 1) * itemsPerPage.value
  })
  
  const endIndex = computed(() => {
    const end = startIndex.value + itemsPerPage.value
    return Math.min(end, filteredCategories.value.length)
  })
  
  // Methods
  const resetForm = () => {
    // Tìm category_id lớn nhất trong danh sách hiện tại
    const maxId = Math.max(...categories.value.map(c => c.category_id), 0);
    
    formData.value = {
        category_id: maxId + 1, // Lấy max ID + 1
        category_name: '',
        category_desc: '',
        category_img: ''
    }
    imageFile.value = null
    imagePreview.value = null
    formErrors.value = {}
    isEditing.value = false
  }
  
  const openAddModal = () => {
    resetForm()
    const modal = new Modal(itemModal.value)
    modal.show()
  }
  
  const openEditModal = (category) => {
    isEditing.value = true
    formData.value = { ...category }
    imagePreview.value = category.category_img
    const modal = new Modal(itemModal.value)
    modal.show()
  }
  
  const closeCategoryModal = () => {
    const modal = Modal.getInstance(itemModal.value)
    if (modal) {
      modal.hide()
      resetForm()
    }
  }
  
  const viewDetails = (category) => {
    selectedCategory.value = category
    const modal = new Modal(viewModal.value)
    modal.show()
  }
  
  const closeViewModal = () => {
    const modal = Modal.getInstance(viewModal.value)
    if (modal) {
      modal.hide()
      selectedCategory.value = null
    }
  }
  
  const confirmDelete = (category) => {
    selectedCategory.value = category
    const modal = new Modal(deleteModal.value)
    modal.show()
  }
  
  const closeDeleteModal = () => {
    const modal = Modal.getInstance(deleteModal.value)
    if (modal) {
      modal.hide()
      selectedCategory.value = null
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
  
  // Action Menu Methods
  const toggleActionMenu = (categoryId) => {
    activeMenu.value = activeMenu.value === categoryId ? null : categoryId
  }
  
  const closeActionMenu = () => {
    activeMenu.value = null
  }
  
  // Enhanced image upload handler
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
      event.target.value = ''
    }
  }
  
  const uploadImage = async (file) => {
    if (!file) return null
    
    const formData = new FormData()
    formData.append('image', file)
    
    try {
      const response = await axios.post('http://localhost:3001/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return `http://localhost:3001${response.data.imagePath}`
    } catch (err) {
      console.error('Image upload error:', err)
      throw new Error(err.response?.data?.message || 'Failed to upload image')
    }
  }
  
  // Pagination controls
  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      // Reset to page 1 if current page exceeds total pages after changing items per page
      if (currentPage.value > totalPages.value) {
        currentPage.value = 1
      }
    }
  }
  
  // Watch for changes in itemsPerPage
  watch(itemsPerPage, () => {
    // Reset to first page when items per page changes
    currentPage.value = 1
  })
  
  // Lifecycle hooks
  onMounted(() => {
    fetchCategories()
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
    right: 0;
    top: 100%;
    background: white;
    border-radius: 4px;
    padding: 0.5rem 0;
    min-width: 160px;
    z-index: 1000;
  }
  
  .action-item {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
  }
  
  .action-item:hover {
    background-color: #f8f9fa;
  }
  
  .action-item i {
    margin-right: 0.5rem;
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
    border: 1px solid rgba(0,0,0,.125);
  }
  
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
  
  .card .category-icon {
    height: 200px;
    overflow: hidden;
  }
  
  .card .category-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .card-title {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  .card-text {
    color: #6c757d;
    font-size: 0.9rem;
  }
  
  .card-footer {
    background-color: transparent;
    border-top: 1px solid rgba(0,0,0,.125);
    padding: 0.75rem;
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
  
  .category-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background-color: #f8f9fa;
  }
  
  .preview-img {
    max-width: 200px;
    max-height: 200px;
    object-fit: contain;
    margin-bottom: 1rem;
  }
  
  .image-upload {
    position: relative;
    overflow: hidden;
  }
  
  .image-upload input[type=file] {
    position: absolute;
    font-size: 100px;
    right: 0;
    top: 0;
    opacity: 0;
    cursor: pointer;
  }
  </style>