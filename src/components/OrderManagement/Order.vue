<template>
  <div class="container-fluid">
    <!-- Header Section -->
    <div class="d-flex flex-column">
    <h1 class="heading">Orders</h1>
    <div class="row g-3 align-items-center mb-4">
      <div class="col-12 col-sm-6 col-md-2 me-md-2">
        <select class="form-select shadow-sm" v-model="selectedPeriod"  @change="selectDatePeriod(selectedPeriod)">
          <option v-for="period in datePeriods" :key="period.days"  :value="period.days">
            {{ period.label }}
          </option>
        </select>
      </div>
      <div class="col-12 col-sm-6 col-md-2 me-md-2">
        <Datepicker v-model="startDate" :max="endDate" :format="dateFormat" placeholder="Start date" class="shadow-sm" />
      </div>
      <div class="col-12 col-sm-6 col-md-2 me-md-2">
        <Datepicker v-model="endDate" :min="startDate" :format="dateFormat" placeholder="End date" class="shadow-sm" />
      </div>
      <div class="col-12 col-sm-6 col-md-auto">
        <button class="btn btn-outline-secondary w-100" @click="resetDateFilter">
          <i class="bi bi-arrow-counterclockwise"></i> Reset
        </button>
      </div>
    </div>
  </div>
      
    <!-- Stats Cards -->
    <div class="row justify-content-between mb-4">
      <div class="box col-12 col-sm-6 col-lg-3 ">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="text-muted">Total Orders</h6>
                <h3 class="mb-0">{{ orders.length }}</h3>
              </div>
              <div class="text-success">
                <small>↑ {{ Math.round(orders.length * 0.1) }}% last week</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="box col-12 col-sm-6 col-lg-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="text-muted">Order Items over time</h6>
                <h3 class="mb-0">15</h3>
              </div>
              <div class="text-success">
                <small>↑ 18.2% last week</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="box col-12 col-sm-6 col-lg-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="text-muted">Returns Orders</h6>
                <h3 class="mb-0">0</h3>
              </div>
              <div class="text-danger">
                <small>↓ 12% last week</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="box col-12 col-sm-6 col-lg-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="text-muted">Fulfilled orders over time</h6>
                <h3 class="mb-0">12</h3>
              </div>
              <div class="text-success">
                <small>↑ 12.2% last week</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex gap-3">
          <button :class="['btn', selectedFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary']"
            @click="selectedFilter = 'all'">
            All
          </button>
          <button :class="['btn', selectedFilter === 'Pending' ? 'btn-primary' : 'btn-outline-secondary']"
            @click="selectedFilter = 'Pending'">
            Pending
          </button>
          <button :class="['btn', selectedFilter === 'Approved' ? 'btn-primary' : 'btn-outline-secondary']"
            @click="selectedFilter = 'Approved'">
            Approved
          </button>
          <button :class="['btn', selectedFilter === 'Shipping sent' ? 'btn-primary' : 'btn-outline-secondary']"
            @click="selectedFilter = 'Shipping sent'">
            Shipping sent
          </button>
          <button :class="['btn', selectedFilter === 'Shipping' ? 'btn-primary' : 'btn-outline-secondary']"
            @click="selectedFilter = 'Shipping'">
            Shipping
          </button>
          <button :class="['btn', selectedFilter === 'Delivered' ? 'btn-primary' : 'btn-outline-secondary']"
            @click="selectedFilter = 'Delivered'">
            Delivered
          </button>
          <button :class="['btn', selectedFilter === 'Archived' ? 'btn-primary' : 'btn-outline-secondary']"
            @click="selectedFilter = 'Archived'">
            Archived
          </button>
        </div>
      </div>
    </div>

    <!-- Search Input -->
    <div class="mb-3">
      <input 
        type="text" 
        class="form-control" 
        placeholder="Search by customer name or bill ID" 
        v-model="searchQuery"
      />
    </div>

    <!-- Orders Table -->
    <div class="card">
      <div class="card-body">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td>#{{ order.billid }}</td>
              <td>{{ order.customer }}</td>
              <td>{{ order.date }}</td>
              <td>
                <div class="col-md-6" v-if="editStatusId === order.id">
                  <select 
                    v-model="order.status" 
                    class="form-select" 
                    @change="saveStatus(order)">
                    <option v-for="status in getNextStatus(order.status)" 
                            :key="status" 
                            :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>
                <div v-else>
                  <span :class="['badge', getStatusClass(order.status)]">
                    <i :class="getStatusIcon(order.status)"></i> {{ order.status }}
                  </span>
                </div>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <button 
                    class="btn btn-sm btn-outline-secondary" 
                    @click="editStatusId = editStatusId === order.id ? null : order.id"
                    :disabled="isUpdating"
                  >
                    <i :class="editStatusId === order.id ? 'bi bi-check-circle' : 'bi bi-pencil'"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-secondary" 
                    @click="loadBillDetails(order.id)"
                  >
                    Details
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="goToPage(currentPage - 1)">Previous</button>
            </li>
            <li 
              class="page-item" 
              v-for="page in totalPages" 
              :key="page" 
              :class="{ active: currentPage === page }"
            >
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="goToPage(currentPage + 1)">Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Add Modal -->
    <div class="modal fade" :class="{ 'show d-block': showModal }" tabindex="-1" v-if="showModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Order Details #{{ selectedBill?.id }}</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <h6 class="text-muted">Order Information</h6>
                <p class="mb-1"><strong>Date:</strong> {{ selectedBill?.date }}</p>
                <p class="mb-1"><strong>Customer:</strong> {{ selectedBill?.customer }}</p>
                <p class="mb-1"><strong>Status:</strong> 
                  <span :class="['badge', getStatusClass(selectedBill?.status)]">
                    <i :class="getStatusIcon(selectedBill?.status)"></i> {{ selectedBill?.status }}
                  </span>
                </p>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Order Summary</h6>
                <p class="mb-1"><strong>Total Amount:</strong> ${{ selectedBill?.total }}</p>
                <p class="mb-1"><strong>Total Items:</strong> {{ selectedBill?.items }}</p>
                <p class="mb-1"><strong>Payment Status:</strong> {{ selectedBill?.payment }}</p>
              </div>
            </div>

            <h6 class="text-muted mb-3">Products</h6>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in selectedBill?.products" :key="product.product_id">
                    <td>{{ product.product_name }}</td>
                    <td>{{ product.quantity }}</td>
                    <td>${{ product.price }}</td>
                    <td>${{ product.quantity * product.price }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Add backdrop when modal is open -->
    <div class="modal-backdrop fade show" v-if="showModal"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';


const startDate = ref('');
const endDate = ref('');
const selectedFilter = ref('all');
const editStatusId = ref(null);

const selectedPeriod = ref(0);

const isUpdating = ref(false);

const saveStatus = async (order) => {
  try {
    isUpdating.value = true;
    await updateStatusInDb(order);
    editStatusId.value = null;
  } catch (error) {
    console.error('Error saving status:', error);
    // Có thể thêm thông báo lỗi cho người dùng ở đây
  } finally {
    isUpdating.value = false;
  }
};

const orders = ref([]);

// Fetch orders data and combine with user and bill details
const fetchOrders = async () => {
  try {
    const [billsRes, usersRes, billDetailsRes, productsRes] = await Promise.all([
      fetch('http://localhost:3000/bills'),
      fetch('http://localhost:3000/users'),
      fetch('http://localhost:3000/bill_details'),
      fetch('http://localhost:3000/products')
    ]);

    const [bills, users, billDetails, products] = await Promise.all([
      billsRes.json(),
      usersRes.json(),
      billDetailsRes.json(),
      productsRes.json()
    ]);

    // Map the data to our orders format
    orders.value = bills.map(bill => {
      const user = users.find(u => u.user_id === bill.user_id);
      const details = billDetails.filter(detail => detail.bill_id === bill.bill_id);
      
      // Calculate total items
      const totalItems = details.reduce((sum, detail) => sum + detail.quantity, 0);
      
      return {
        id: bill.id,
        billid: bill.bill_id,
        date: new Date(bill.bill_date).toLocaleDateString(),
        customer: user?.user_name || 'Unknown',
        payment:  bill.payment_method === 'Cash on delivery' ? 'Pay not yet' : 'Paid',
        total: bill.total_amount,
        items: totalItems,
        status: bill.bill_status,
        products: details.map(detail => {
          const product = products.find(p => p.product_id === detail.product_id);
          return {
            ...product,
            quantity: detail.quantity,
            price: product.product_price,
            total: product.product_price * detail.quantity
          };
        })
      };
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

// Call fetchOrders when component mounts
fetchOrders();

const getStatusClass = (status) => {
  const classes = {
    'Pending': 'bg-warning-subtle text-warning',
    'Approved': 'bg-info-subtle text-info',
    'Shipping sent': 'bg-primary-subtle text-primary',
    'Shipping': 'bg-warning-subtle text-warning',
    'Delivered': 'bg-success-subtle text-success',
    'Archived': 'bg-secondary-subtle text-secondary'
  }
  return classes[status] || 'bg-secondary-subtle text-secondary'
}

const getStatusIcon = (status) => {
  const icons = {
    'Pending': 'bi bi-clock-history',
    'Approved': 'bi bi-check-circle',
    'Shipping sent': 'bi bi-box-seam',
    'Shipping': 'bi bi-truck',
    'Delivered': 'bi bi-check2-circle',
    'Completed': 'bi bi-check2-circle',
    'Archived': 'bi bi-archive'
  }
  return icons[status] || 'bi bi-tag'
}

const formatDate = (dateStr) => {
  return new Date(dateStr).getTime();
};

const datePeriods = [
  { days: 0, label: 'All days' },
  { days: 7, label: 'Last 7 days' },
  { days: 14, label: 'Last 14 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
];

const dateFormat = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const selectDatePeriod = (days) => {
  if (days === 0) {
    startDate.value = '';
    endDate.value = '';
    selectedPeriod.value = days;
  } else {
    selectedPeriod.value = days;
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    endDate.value = end;
    startDate.value = start;
  }
};

// Cập nhật hàm reset
const resetDateFilter = () => {
  startDate.value = '';
  endDate.value = '';
  selectedPeriod.value = null;
};

const currentPage = ref(1);
const itemsPerPage = 12;
const searchQuery = ref('');

// Tách filtered data thành một computed riêng
const filteredData = computed(() => {
  let filtered = orders.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => 
      order.customer.toLowerCase().includes(query) || 
      order.billid.toString().includes(query)
    );
  }

  // Filter by date range if set
  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value).setHours(0, 0, 0, 0);
    const end = new Date(endDate.value).setHours(23, 59, 59, 999);
    
    filtered = filtered.filter(order => {
      const orderDate = new Date(order.date).getTime();
      return orderDate >= start && orderDate <= end;
    });
  }

  // Filter by status if not 'all'
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(order => order.status === selectedFilter.value);
  }

  return filtered;
});

// Cập nhật computed filteredOrders để chỉ xử lý phân trang
const filteredOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredData.value.slice(start, end);
});

// Cập nhật cách tính totalPages
const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage));

// Thêm watcher để reset về trang 1 khi thay đổi bộ lọc
watch([searchQuery, selectedFilter, startDate, endDate], () => {
  currentPage.value = 1;
});

// Hàm để chuyển trang
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Function to update status in db.json
const updateStatusInDb = async (order) => {
  try {
    isUpdating.value = true;
    
    const updatedBill = {
      bill_status: order.status
    };
    console.log(updatedBill);
    console.log(order.id);
    const id = order.id;

    const response = await fetch(`http://localhost:3000/bills/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedBill),
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    // Refresh orders list after successful update
    await fetchOrders();
    
  } catch (error) {
    console.error('Error updating status:', error);
  } finally {
    isUpdating.value = false;
  }
};

// Function to get next possible status
const getNextStatus = (currentStatus) => {
  const statusOrder = ['Pending', 'Approved', 'Shipping sent', 'Shipping', 'Delivered', 'Archived'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  
  if (currentIndex === -1) return [currentStatus];
  
  const result = [currentStatus];
  
  // Add previous status if exists
  if (currentIndex > 0) {
    result.unshift(statusOrder[currentIndex - 1]);
  }
  
  // Add next status if exists
  if (currentIndex < statusOrder.length - 1) {
    result.push(statusOrder[currentIndex + 1]);
  }
  
  return result;
};


const showModal = ref(false);
const selectedBill = ref(null);

const loadBillDetails = (billId) => {
  selectedBill.value = orders.value.find(order => order.id === billId);
  showModal.value = true;
};

// Add onMounted to set initial period
onMounted(() => {
  selectDatePeriod(0); // Set initial period to 7 days
});

</script>

<style scoped>
.card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.box {
  max-width: 290px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.box:hover {
  box-shadow: 2px 6px 6px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  transform: translateY(-2px);
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

.btn {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
  
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-outline-secondary {
  border-color: #e5e7eb;
}

.form-control {
  border-radius: 8px;
  border-color: #e5e7eb;
  min-width: 150px;
  transition: all 0.2s ease;
}

.form-control:hover, .form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.dp__main {
  width: 100%;
}

.dp__input {
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  width: 100%;
  transition: all 0.2s ease;
}

.dp__input:hover {
  border-color: #3b82f6;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modal.show .modal-content {
  transform: translateY(0);
  opacity: 1;
}

.page-link {
  transition: all 0.2s ease;
}

.page-link:hover {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.page-item.active .page-link {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

body.modal-open {
  overflow: hidden;
}

/* Thêm hiệu ứng cho form-select */
.form-select {
  transition: all 0.2s ease;
}

.form-select:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Thêm hiệu ứng cho stats cards */

/* Thêm hiệu ứng cho filter buttons */
.card-body .btn {
  transition: all 0.2s ease;
}



.btn-primary:hover {
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
}
</style>