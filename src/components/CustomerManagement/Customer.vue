<template>
  <div class="container-fluid">
    <div class="align-items-center mb-3">
        <h1 class="heading">Customers Management</h1>
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
      <div class="col-md-3 gap-2 d-flex justify-content-end ms-auto align-items-center">
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
          <i class="bi bi-plus-circle me-2"></i>Add new customer
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

    <div v-else-if="filteredcustomers.length === 0" class="text-center py-5">
      <i class="bi bi-inbox display-1 text-muted"></i>
      <p class="mt-3 text-muted">No customers found</p>
      <button class="btn btn-primary mt-2" @click="openAddModal">
        Add your first customer
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in paginatedcustomers" :key="customer.user_id">
            <td>{{ customer.user_id }}</td>
            <td>
              <img 
                :src="customer.user_image || 'https://via.placeholder.com/150'" 
                :alt="customer.user_name" 
                class="item-img"
                @error="handleImageError"
              />
            </td>
            <td>{{ customer.user_name }}</td>
            <td>{{ customer.user_email }}</td>
            <td>{{ customer.user_phone }}</td>
            <td>{{ customer.street }}, {{ customer.city }}, {{ customer.country }}</td>
            
            <td>
              <div class="status-switch form-switch">
                <input 
                  class="status-switch-input" 
                  :id="'status' + customer.user_id"
                  type="checkbox" 
                  :checked="customer.user_status"
                  @change="toggleStatus(customer)"
                >
                <label class="status-switch-label" :for="'status' + customer.user_id">
                  {{ customer.user_status ? 'Active' : 'Inactive' }}
                </label>
              </div>
            </td>
            <td class="position-relative">
              <button class="btn btn-link text-secondary" 
                      @click="toggleActionMenu(customer.user_id)"
                      ref="actionButton">
                <i class="bi bi-gear"></i>
              </button>
              
              <div v-if="activeMenu === customer.user_id" 
                   class="action-menu shadow" 
                   @mouseleave="closeActionMenu">
                <button class="action-item" @click="viewDetails(customer)">
                  <i class="bi bi-eye-fill text-primary"></i>
                  View Details
                </button>
                <button class="action-item" @click="openEditModal(customer)">
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
      <div v-for="customer in paginatedcustomers" :key="customer.user_id" class="col-md-4 col-lg-3 p-2">
        <div class="card h-100">
          <img 
            :src="customer.user_image" 
            class="card-img-top" 
            :alt="customer.user_name"
            style="height: 200px; object-fit: cover;"
            @error="handleImageError"
          >
          <div class="card-body">
            <h5 class="card-title">{{ customer.user_name }}</h5>
            <p class="card-text text-truncate">{{ customer.user_email }}</p>
              <h6 class="h5 mb-1">{{ customer.user_phone }}</h6>
              <h6 class="h5 mb-1">{{ customer.user_address }}</h6>
              
          </div>
          <div class="card-footer bg-white">
            <div class="d-flex justify-content-between align-items-center">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :checked="customer.user_status"
                  @change="toggleStatus(customer)"
                >
              </div>
              <div class="btn-group">
                <button class="btn btn-light btn-sm" @click="viewDetails(customer)">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-light btn-sm" @click="openEditModal(customer)">
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
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredcustomers.length }} customers
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
        <select class="form-select" v-model="customersPerPage">
          <option :value="12">12 / page</option>
          <option :value="24">24 / page</option>
          <option :value="50">50 / page</option>
        </select>
      </div>
    </div>

   
    <div class="modal fade" id="customerModal" tabindex="-1" ref="customerModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Customer' : 'Add New Customer' }}</h5>
            <button type="button" class="btn-close" @click="closecustomerModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitCustomer" class="needs-validation" novalidate>
              
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
                        :class="{ 'is-invalid': formErrors.image }"
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
                  {{ isEditing ? 'Update customer' : 'Add customer' }}
                </button>
                <button type="button" class="btn btn-light" @click="closecustomerModal">
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
            <h5 class="modal-title">Customer Details</h5>
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
                <h5>{{ selecteditem.user_phone }}</h5>
                <h5>{{ selecteditem.street }}, {{ selecteditem.city }}, {{ selecteditem.country }}</h5>
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

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Country, State, City }  from 'country-state-city';
import { Modal } from 'bootstrap'
import axios from 'axios'


const activeMenu = ref(null)
const viewMode = ref('list')
const loading = ref(true)
const error = ref(null)
const customers = ref([])
const selecteditem = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('id')
const sortDirection = ref('asc')
const currentPage = ref(1)
const customersPerPage = ref(12)

console.log(Country.getAllCountries())
console.log(State.getAllStates())
console.log(City.getAllCities())
const toggleActionMenu = (customerId) => {
  activeMenu.value = activeMenu.value === customerId ? null : customerId
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
  user_role: '0',
  user_status: true
})
const formErrors = ref({})
const isEditing = ref(false)

const imageFile = ref(null)
const imagePreview = ref(null)

const customerModal = ref(null)
const viewModal = ref(null)


const filteredcustomers = computed(() => {
  let filtered = [...customers.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(customer => 
      // Tìm theo tên
      customer.user_name?.toLowerCase().includes(query) ||
      // Tìm theo email
      customer.user_email?.toLowerCase().includes(query) ||
      // Tìm theo địa chỉ (street, city, country)
      customer.street?.toLowerCase().includes(query) ||
      customer.city?.toLowerCase().includes(query) ||
      customer.country?.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (statusFilter.value !== '') {
    const status = statusFilter.value === 'true'
    filtered = filtered.filter(c => c.user_status === status)
  }

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0
    if(sortBy.value === 'id') {
      comparison = parseInt(a.user_id) - parseInt(b.user_id)
    } else if(sortBy.value === 'name') {
      comparison = a.user_name.localeCompare(b.user_name)
    }
    return sortDirection.value === 'asc' ? comparison : -comparison
  })

  return filtered
})

const paginatedcustomers = computed(() => {
  const start = (currentPage.value - 1) * customersPerPage.value
  const end = start + customersPerPage.value
  return filteredcustomers.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredcustomers.value.length / customersPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * customersPerPage.value
})

const endIndex = computed(() => {
  const end = startIndex.value + customersPerPage.value
  return Math.min(end, filteredcustomers.value.length)
})


// Methods
const fetchCustomers = async () => {
  try {
    loading.value = true
    const response = await axios.get('http://localhost:3000/users')
    const allUsers = response.data
    customers.value = allUsers.filter(user => user.user_role === '0')
  } catch (err) {
    error.value = 'Failed to load customers. Please try again.'
    console.error('Error loading customers:', err)
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
  
  // Name validation
  const nameValue = formData.value.user_name?.trim()
  if (!nameValue) {
    errors.user_name = 'Name is required'
  } else if (nameValue.length < 3) {
    errors.user_name = 'Name must be at least 3 characters long'
  } else if (!/^[A-Za-z][A-Za-z0-9\s]*$/.test(nameValue)) {
    errors.user_name = 'Name must start with a letter and contain only letters, numbers and spaces'
  }

  // Email validation
  const emailValue = formData.value.user_email?.trim()
  if (!emailValue) {
    errors.user_email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    errors.user_email = 'Please enter a valid email address'
  }

  // Phone validation
  const phoneValue = formData.value.user_phone?.trim()
  if (!phoneValue) {
    errors.user_phone = 'Phone number is required'
  } else if (!/^[0-9]{10,11}$/.test(phoneValue)) {
    errors.user_phone = 'Phone number must be 10-11 digits'
  }

  // Street validation
  const streetValue = formData.value.street?.trim()
  if (!streetValue) {
    errors.street = 'Street address is required'
  } else if (streetValue.length < 5) {
    errors.street = 'Street address must be at least 5 characters long'
  }

  // Country validation
  if (!formData.value.country) {
    errors.country = 'Please select a country'
  }

  // City validation
  if (!formData.value.city) {
    errors.city = 'Please select a city'
  }

  // Image validation for new customers
  if (!isEditing.value && !imageFile.value && !formData.value.user_image) {
    errors.image = 'Profile image is required'
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
      user_role: "0",
      user_status: true
    }
    cities.value = [] // Reset cities list
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
const openAddModal = async () => {
  await resetForm()
  const modal = new Modal(customerModal.value)
  modal.show()
}

const openEditModal = (customer) => {
  isEditing.value = true
  formData.value = { ...customer }
  imagePreview.value = customer.user_image
  const modal = new Modal(customerModal.value)
  modal.show()
}

const closecustomerModal = () => {
  const modal = Modal.getInstance(customerModal.value)
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

const submitCustomer = async () => {
  if (!validateForm()) return

  try {
    let imagePath = formData.value.user_image
    
    if (imageFile.value) {
      imagePath = await uploadImage(imageFile.value)
      if (!imagePath) throw new Error('Failed to upload image')
    }
    
    const customerData = {
      ...formData.value,
      user_image: imagePath
    }

    let customerId = null
    if (isEditing.value) {
      const customer = customers.value.find(c => c.user_id === formData.value.user_id)
      customerId = customer?.id
      if (!customerId) throw new Error('Customer not found')
    }

    const baseUrl = 'http://localhost:3000/users'
    if (isEditing.value) {
      await axios.put(`${baseUrl}/${customerId}`, customerData)
    } else {
      await axios.post(baseUrl, customerData)
    }
    
    await fetchCustomers()
    closecustomerModal()
  } catch (err) {
    console.error('Submit error:', err)
    error.value = err.message || 'An error occurred'
  }
}

const viewDetails = (customer) => {
  selecteditem.value = customer
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



const toggleStatus = async (customer) => {
  try {
    const updatedCustomer = {
      ...customer,
      user_status: !customer.user_status
    }

    await axios.patch(`http://localhost:3000/users/${customer.id}`, {
      user_status: updatedCustomer.user_status
    })

    await fetchCustomers()
  } catch (err) {
    customer.user_status = !customer.user_status
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


watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

watch(customersPerPage, () => {
  currentPage.value = 1
})

onMounted(() => {
  fetchCustomers()
})

const countries = ref([])
const cities = ref([])
const states = ref([])

// Fetch countries khi component được mount
onMounted(async () => {
  await fetchCustomers()
  fetchCountries()
})

// Fetch danh sách countries
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

// Cập nhật hàm handleCountryChange
const handleCountryChange = () => {
  formData.value.city = '' // Reset city when country changes
  cities.value = []
  states.value = []
  
  if (!formData.value.country) return
  
  try {
    // Lấy country code
    const selectedCountry = countries.value.find(c => c.name === formData.value.country)
    if (selectedCountry) {
      // Lấy danh sách states c���a country
      states.value = State.getStatesOfCountry(selectedCountry.code)
      
      // Lấy tất cả thành phố của country
      const allCities = City.getCitiesOfCountry(selectedCountry.code)
      cities.value = allCities.map(city => city.name)
    }
  } catch (err) {
    console.error('Error fetching cities:', err)
    error.value = 'Failed to load cities'
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
</style>