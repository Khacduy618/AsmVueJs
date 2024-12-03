<template>
  <div class="container-fluid">
    <!-- Header Section -->
    <div class="align-items-center mb-3">
        <h2>Items Management</h2>
    </div>
    <!-- Search and Filter Section -->
    <div class="row mb-3 gap-1">
      <div class="col-md-3">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input 
            type="text" 
            class="form-control" 
            v-model="searchQuery"
            placeholder="Search items..."
          >
        </div>
      </div>
      <div class="col-md-2">
        <select class="form-select" v-model="categoryFilter">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
            {{ cat.category_name }}
          </option>
        </select>
      </div>
      <div class="fill col-md-2">
        <select class="form-select" v-model="statusFilter">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="pre_order">Pre Order</option>
        </select>
      </div>
      <div class="fill col-md-2">
        <select class="form-select" v-model="sortBy">
          <option value="id">Sort by id</option>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>
      <div class="col-md-3 d-flex justify-content-end gap-3 align-items-center">
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
          <i class="bi bi-plus-circle me-2"></i>Add new item
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
      <button class="btn btn-sm btn-outline-danger ms-3" @click="fetchItems">
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredItems.length === 0" class="text-center py-5">
      <i class="bi bi-inbox display-1 text-muted"></i>
      <p class="mt-3 text-muted">No items found</p>
      <button class="btn btn-primary mt-2" @click="openAddModal">
        Add your first item
      </button>
    </div>

    <!-- List View -->
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
            <th @click="setSortBy('price')" class="cursor-pointer">
              Price <i class="bi" :class="getSortIcon('price')"></i>
            </th>
            <th>Category</th>
            <th>Discount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedItems" :key="item.id">
            <td>{{ item.product_id }}</td>
            <td>
              <img 
                :src="item.product_img" 
                :alt="item.product_name" 
                class="item-img"
                @error="handleImageError"
              />
            </td>
            <td>{{ item.product_name }}</td>
            <td>${{ formatPrice(item.product_price) }}</td>
            <td>{{ getCategoryName(item.product_cat) }}</td>
            <td>{{ item.product_discount }}%</td>
            <td>
              <span class="status-badge" :class="getStatusClass(item.product_status)">
                {{ item.product_status.replace('_', ' ') }}
              </span>
            </td>
            <td>
              <div class="action-button-container">
                <button class="btn btn-link text-secondary" 
                        @click="toggleActionMenu(item.product_id)"
                        ref="actionButton">
                  <i class="bi bi-gear"></i>
                </button>
                
                <div v-if="activeMenu === item.product_id" 
                     class="action-menu shadow" 
                     @mouseleave="closeActionMenu">
                  <button class="action-item" @click="viewDetails(item)">
                    <i class="bi bi-eye-fill text-primary"></i>
                    View Details
                  </button>
                  <button class="action-item" @click="openEditModal(item)">
                    <i class="bi bi-pencil-fill text-success"></i>
                    Edit
                  </button>
                  <button class="action-item" @click="openDeleteModal(item)">
                    <i class="bi bi-trash-fill text-danger"></i>
                    Delete
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Grid View -->
    <div v-else class="row g-4">
      <div v-for="item in paginatedItems" :key="item.id" class="col-md-4 col-lg-3 p-2">
        <div class="card h-100">
          <img 
            :src="item.product_img" 
            class="card-img-top" 
            :alt="item.product_name"
            style="height: 200px; object-fit: cover;"
            @error="handleImageError"
          >
          <div class="card-body">
            <h5 class="card-title">{{ item.product_name }}</h5>
            <p class="card-text text-truncate">{{ item.product_description || 'No description available' }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="h5 mb-0">${{ formatPrice(item.product_price) }}</span>
              <span class="category-badge">
                {{ getCategoryName(item.product_cat) }}
              </span>
            </div>
          </div>
          <div class="card-footer bg-white">
            <div class="d-flex justify-content-between align-items-center">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :checked="item.product_status === 'available'"
                  @change="toggleStatus(item)"
                >
              </div>
              <div class="btn-group">
                <button class="btn btn-light btn-sm" @click="viewDetails(item)">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-light btn-sm" @click="openEditModal(item)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-light btn-sm" @click="openDeleteModal(item)">
                  <i class="bi bi-trash-fill text-danger"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-4">
      <span class="text-secondary">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredItems?.length || 0 }} items
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
        <select class="form-select" v-model="itemsPerPage">
          <option :value="12">12 / page</option>
          <option :value="24">24 / page</option>
          <option :value="50">50 / page</option>
        </select>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" id="itemModal" tabindex="-1" ref="itemModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit item' : 'Add New item' }}</h5>
            <button type="button" class="btn-close" @click="closeItemModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitItem">
              <div class="mb-3">
                <img 
                        :src="imagePreview || formData.product_img || 'https://via.placeholder.com/150'" 
                        class="rounded preview-img"
                        :alt="formData.product_name || 'product preview'"
                        style="max-width: 200px; height: auto;"
                      >
                <input 
                        type="file" 
                  class="form-control" 
                  accept="image/*"
                  @change="handleImageUpload"
                  :class="{ 'is-invalid': formErrors.product_img }"
                >
                <div class="invalid-feedback">{{ formErrors.product_img }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Name</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="formData.product_name"
                  :class="{ 'is-invalid': formErrors.product_name }"
                >
                <div class="invalid-feedback">{{ formErrors.product_name }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Price</label>
                <input 
                  type="number" 
                  class="form-control"
                  v-model="formData.product_price"
                  :class="{ 'is-invalid': formErrors.product_price }"
                  step="0.01"
                >
                <div class="invalid-feedback">{{ formErrors.product_price }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Category</label>
                <select 
                  class="form-select"
                  v-model="formData.product_cat"
                  :class="{ 'is-invalid': formErrors.product_cat }"
                >
                  <option value="">Select Category</option>
                  <option 
                    v-for="cat in categories" 
                    :key="cat.category_id" 
                    :value="cat.category_id"
                  >
                    {{ cat.category_name }}
                  </option>
                </select>
                <div class="invalid-feedback">{{ formErrors.category_name }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Discount (%)</label>
                <input 
                  type="number" 
                  class="form-control"
                  v-model="formData.product_discount"
                  :class="{ 'is-invalid': formErrors.product_discount }"
                  min="0"
                  max="100"
                  @input="(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 100) e.target.value = 100;
                    if (value < 0) e.target.value = 0;
                    formData.product_discount = parseInt(e.target.value);
                  }"
                >
                <div class="invalid-feedback">{{ formErrors.product_discount }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Status</label>
                <select 
                  class="form-select"
                  v-model="formData.product_status"
                >
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="pre_order">Pre Order</option>
                </select>
              </div>

              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeItemModal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ isEditing ? 'Update' : 'Add' }} Item
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
            <h5 class="modal-title">Item Details</h5>
            <button type="button" class="btn-close" @click="closeViewModal"></button>
          </div>
          <div class="modal-body" v-if="selecteditem">
            <div class="row">
              <div class="col-md-4">
                <img 
                  :src="selecteditem.product_img" 
                  :alt="selecteditem.product_name"
                  class="img-fluid rounded"
                  @error="handleImageError"
                >
              </div>
              <div class="col-md-8">
                <h4>{{ selecteditem.product_name }}</h4>
                <p class="mb-2">
                  <strong>Category:</strong> 
                  {{ getCategoryName(selecteditem.product_cat) }}
                </p>
                <p class="mb-2">
                  <strong>Price:</strong> 
                  ${{ formatPrice(selecteditem.product_price) }}
                </p>
                <p class="mb-2">
                  <strong>Discount:</strong> 
                  {{ selecteditem.product_discount }}%
                </p>
                <p class="mb-2">
                  <strong>Status:</strong> 
                  <span :class="getStatusClass(selecteditem.product_status)">
                    {{ selecteditem.product_status.replace('_', ' ') }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="deleteModal" tabindex="-1" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this item?</p>
            <p class="text-danger"><small>This will mark the item as unavailable.</small></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
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


// State
const activeMenu = ref(null)
const viewMode = ref('list')
const loading = ref(true)
const error = ref(null)
const items = ref([])
const selecteditem = ref(null)
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const sortBy = ref('id')
const sortDirection = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const categories = ref([])
const imageFile = ref(null)
const imagePreview = ref(null)

// Toggle action menu
const toggleActionMenu = (itemId) => {
  activeMenu.value = activeMenu.value === itemId ? null : itemId
}

const closeActionMenu = () => {
  activeMenu.value = null
}

const formData = ref({
  product_id: '',
  product_name: '',
  product_price: 0,
  product_img: '',
  product_discount: 0,
  product_cat: '',
  product_status: 'available'
})
const formErrors = ref({})
const isEditing = ref(false)

// Modal refs
const itemModal = ref(null)
const viewModal = ref(null)
const deleteModal = ref(null)
const itemToDelete = ref(null)



const filteredItems = computed(() => {
  if (!items.value) return []
  
  let result = [...items.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.product_name.toLowerCase().includes(query)
    )
  }

  if (categoryFilter.value) {
    result = result.filter(item => 
      item.product_cat.toString() === categoryFilter.value
    )
  }

  if (statusFilter.value) {
    result = result.filter(item => 
      item.product_status === statusFilter.value
    )
  }

  // Sorting
  result.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'price') {
      comparison = a.product_price - b.product_price
    } else if (sortBy.value === 'id') {
      comparison = parseInt(a.product_id) - parseInt(b.product_id)
    } else {
      comparison = a[`product_${sortBy.value}`].localeCompare(b[`product_${sortBy.value}`])
    }
    return sortDirection.value === 'asc' ? comparison : -comparison
  })

  return result
})

const paginatedItems = computed(() => {
  if (!filteredItems.value) return []
  
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

const totalPages = computed(() => {
  if (!filteredItems.value) return 1
  return Math.ceil(filteredItems.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  if (!filteredItems.value?.length) return 0
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  if (!filteredItems.value?.length) return 0
  const end = startIndex.value + itemsPerPage.value
  return Math.min(end, filteredItems.value.length)
})



const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/150'
}

const formatPrice = (price) => {
  return Number(price).toFixed(2)
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
  
  if (!formData.value.product_name) {
    errors.product_name = 'Name is required'
  }
  
  if (!formData.value.product_price) {
    errors.product_price = 'Price is required'
  } else if (formData.value.product_price <= 0) {
    errors.product_price = 'Price must be greater than 0'
  }
  
  if (!formData.value.product_cat) {
    errors.product_cat = 'Category is required'
  }
  
  // Validate discount
  if (formData.value.product_discount < 0) {
    errors.product_discount = 'Discount cannot be negative'
  } else if (formData.value.product_discount > 100) {
    errors.product_discount = 'Discount cannot exceed 100%'
  }
  
  // Only validate image for new items
  if (!isEditing.value && !imageFile.value && !formData.value.product_img) {
    errors.product_img = 'Image is required'
  }

  formErrors.value = errors
  return Object.keys(errors).length === 0
}


// Reset form
const resetForm = async () => {
  try {
    const response = await axios.get('http://localhost:3000/products')
    const allProducts = response.data
    const maxId = Math.max(...allProducts.map(product => product.product_id), 0)
    formData.value = {
      product_id: maxId + 1,
      product_img: '',
      product_name: '',
      product_price: 0,
      product_discount: 0,
      product_cat: '',
      product_status: 'available'
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
  const modal = new Modal(itemModal.value)
  modal.show()
}

const openEditModal = (item) => {
  isEditing.value = true
  formData.value = { ...item }
  const modal = new Modal(itemModal.value)
  modal.show()
}

const closeItemModal = () => {
  const modal = Modal.getInstance(itemModal.value)
  if (modal) {
    modal.hide()
    resetForm()
  }
}


const viewDetails = (item) => {
  selecteditem.value = item
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


// Submit item
const submitItem = async () => {
  if (!validateForm()) return

  try {
    let imagePath = formData.value.product_img
    
    if (imageFile.value) {
      imagePath = await uploadImage(imageFile.value)
      if (!imagePath) throw new Error('Failed to upload image')
    }
    
    const itemData = {
      ...formData.value,
      product_img: imagePath
    }

    const baseUrl = 'http://localhost:3000/products'
    if (isEditing.value) {
      // Tìm ID chính xác c��a item đang edit
      const existingItem = items.value.find(item => item.product_id === formData.value.product_id)
      if (!existingItem) throw new Error('Item not found')
      
      // Sử dụng ID từ item hiện có
      await axios.put(`${baseUrl}/${existingItem.id}`, itemData)
    } else {
      await axios.post(baseUrl, itemData)
    }
    
    await fetchItems()
    closeItemModal()
  } catch (err) {
    console.error('Submit error:', err)
    error.value = err.message || 'An error occurred'
    // Thêm thông báo chi tiết hơn cho người dùng
    if (err.response?.status === 404) {
      error.value = 'Item not found. Please refresh and try again.'
    }
  }
}

// Toggle status
const toggleStatus = async (item) => {
  try {
    const newStatus = item.product_status === 'available' ? 'out_of_stock' : 'available'
    
    await axios.patch(`http://localhost:3000/products/${item.id}`, {
      product_status: newStatus
    })

    await fetchItems()
  } catch (err) {
    console.error('Error updating status:', err)
    error.value = 'Failed to update status'
  }
}

// Upload image
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
    console.error('Image upload failed:', err)
    throw err
  }
}





// Fetch categories
const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:3000/categories')
    categories.value = response.data
  } catch (err) {
    console.error('Error loading categories:', err)
    error.value = 'Failed to load categories'
  }
}
// Format helpers
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.category_id === parseInt(categoryId))
  return category ? category.category_name : 'Unknown'
}

const getStatusClass = (status) => {
  const classes = {
    'available': 'bg-success-subtle text-success',
    'out_of_stock': 'bg-danger-subtle text-danger',
    'pre_order': 'bg-warning-subtle text-warning',
    'unavailable': 'bg-secondary-subtle text-secondary'
  }
  return classes[status] || 'bg-secondary-subtle text-secondary'
}

// Image handling
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.type.match(/image.*/)) {
    formErrors.value.image = 'Please upload an image file'
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    formErrors.value.image = 'Image size should be less than 5MB'
    return
  }
  
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  formErrors.value.image = ''
}

// Fetch items from API
const fetchItems = async () => {
  try {
    loading.value = true
    const response = await axios.get('http://localhost:3000/products')
    items.value = response.data
  } catch (err) {
    error.value = 'Failed to load items. Please try again.'
    console.error('Error loading items:', err)
  } finally {
    loading.value = false
  }
}


// Replace the existing watchers with this structure
watch(
  [searchQuery, categoryFilter, statusFilter],
  () => {
    currentPage.value = 1
  },
  { deep: true }
)

watch(
  itemsPerPage,
  () => {
    currentPage.value = 1
  }
)

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([fetchItems(), fetchCategories()])
})
const openDeleteModal = (item) => {
  itemToDelete.value = item
  const modal = new Modal(deleteModal.value)
  modal.show()
  closeActionMenu() // Close the action menu when opening delete modal
}

const closeDeleteModal = () => {
  const modal = Modal.getInstance(deleteModal.value)
  if (modal) {
    modal.hide()
    itemToDelete.value = null
  }
}

const confirmDelete = async () => {
  try {
    if (!itemToDelete.value) return

    const response = await fetch(`http://localhost:3000/products/${itemToDelete.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_status: 'unavailable'
      })
    })

    if (!response.ok) throw new Error('Failed to delete item')

    // Refresh the items list
    await fetchItems()
    closeDeleteModal()
    
    // Show success message (optional)
    alert('Item has been marked as unavailable')
  } catch (err) {
    console.error('Delete error:', err)
    error.value = 'Failed to delete item'
  }
}
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
.action-item.delete {
  color: #dc3545;
}

.action-item.delete:hover {
  background-color: #dc3545;
  color: white;
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
  transform: translateY(0);
  background: white;
  border-radius: 8px;
  min-width: 160px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  padding: 0.5rem 0;
  margin-top: 5px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 1rem;
  border: none;
  background: none;
  text-align: left;
  transition: all 0.2s ease;
  color: #333;
  font-size: 0.875rem;
  cursor: pointer;
}

.action-item:hover {
  background-color: #f8f9fa;
  color: #ff5733;
}

.action-item i {
  font-size: 1rem;
}

/* Add a container for the action button to help with positioning */
.action-button-container {
  position: relative;
}

/* Optional: Add a small arrow at the top of the menu */


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
</style>