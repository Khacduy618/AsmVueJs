<template>
  <div class="container-fluid">
    <!-- Header Section -->
    <div class="d-flex flex-column">
    <h2 class="mb-4 fw-bold">Orders</h2>
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
      <div class="col-12 col-sm-6 col-md-auto ms-md-auto">
        <button class="btn btn-primary w-100">
          <i class="bi bi-plus-lg"></i> Create order
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
                <h3 class="mb-0">21</h3>
              </div>
              <div class="text-success">
                <small>↑ 25.2% last week</small>
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
          <button :class="['btn', selectedFilter === 'Shipping' ? 'btn-primary' : 'btn-outline-secondary']"
            @click="selectedFilter = 'Shipping'">
            Shipping
          </button>
          <button :class="['btn', selectedFilter === 'Archived' ? 'btn-primary' : 'btn-outline-secondary']"
            @click="selectedFilter = 'Archived'">
            Archived
          </button>
          <button :class="['btn', selectedFilter === 'Pending' ? 'btn-primary' : 'btn-outline-secondary']"
            @click="selectedFilter = 'Pending'">
            Pending
          </button>
          <button :class="['btn', selectedFilter === 'Approved' ? 'btn-primary' : 'btn-outline-secondary']"
            @click="selectedFilter = 'Approved'">
            Approved
          </button>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="card">
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Delivery</th>
              <th>Items</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td>#{{ order.id }}</td>
              <td>{{ order.date }}</td>
              <td>{{ order.customer }}</td>
              <td>
                <span :class="['badge', order.payment === 'Pending' ? 'bg-warning' : 'bg-success']">
                  {{ order.payment }}
                </span>
              </td>
              <td>${{ order.total }}</td>
              <td>{{ order.delivery }}</td>
              <td>{{ order.items }} items</td>
              <td>
                <div v-if="editStatusId === order.id">
                   <select 
                        v-model="order.status" 
                        class="form-select" 
                        @change="saveStatus(order)">
                        <option v-for="status in status" :key="status" :value="status">
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
                  >
                    <i :class="editStatusId === order.id ? 'bi bi-check-circle' : 'bi bi-pencil'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';


const startDate = ref('');
const endDate = ref('');
const selectedFilter = ref('all');
const editStatusId = ref(null);

const selectedPeriod = ref(null);



const status = computed(() => [
  'Approved',
  'Shipping sent',
  'Shipping',
  'Delivered',
  'Archived'
])
const saveStatus = (order) => {
  editStatusId.value = null; 
};
const uniqueStatus = computed(() => [...new Set(orders.value.map(order => order.status))]);

const orders = ref([
  {
    id: '1002',
    date: '2024-02-11',
    customer: 'Wade Warren',
    payment: 'Pending',
    total: '200.00',
    delivery: 'N/A',
    items: 2,
    status: 'Archived'
  },
  {
    id: '1004',
    date: '2024-02-13',
    customer: 'Esther Howard',
    payment: 'Success',
    total: '22.00',
    delivery: 'N/A',
    items: 3,
    status: 'Shipping'
  },
  {
    id: '1007',
    date: '2024-02-15',
    customer: 'Jenny Wilson',
    payment: 'Pending',
    total: '25.00',
    delivery: 'N/A',
    items: 1,
    status: 'Approved'
  },
]);


const getStatusClass = (status) => {
  const classes = {
    'Wait' : 'bg-info-subtle text-info',
    'Approved': 'bg-warning-subtle text-warning',
    'Shipping sent': 'bg-info-subtle text-info',
    'Shipping': 'bg-danger-subtle text-danger',
    'Delivered': 'bg-success-subtle text-success',
    'Archived': 'bg-secondary-subtle text-secondary'
  }
  return classes[status] || 'bg-secondary-subtle text-secondary'
}

const getStatusIcon = (status) => {
  const icons = {
    'Wait': 'bi bi-clock-fill',
    'Approved': 'bi bi-egg-fried',
    'Shipping sent': 'bi bi-cup-straw',
    'Shipping': 'bi bi-cake2',
    'Delivered': 'bi bi-truck-fast',
    'Archived': 'bi bi-archive'
  }
  return icons[status] || 'bi bi-tag'
}



// Format date for comparison
const formatDate = (dateStr) => {
  return new Date(dateStr).getTime();
};

const datePeriods = [
  { days: 7, label: 'Last 7 days' },
  { days: 14, label: 'Last 14 days' },
  { days: 30, label: 'Last 30 days' },
];

const dateFormat = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const selectDatePeriod = (days) => {
  selectedPeriod.value = days;
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  
  endDate.value = end;
  startDate.value = start;
};

// Cập nhật hàm reset
const resetDateFilter = () => {
  startDate.value = '';
  endDate.value = '';
  selectedPeriod.value = null;
};

// Cập nhật computed filteredOrders
const filteredOrders = computed(() => {
  let filtered = orders.value;

  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value).setHours(0, 0, 0, 0);
    const end = new Date(endDate.value).setHours(23, 59, 59, 999);
    
    filtered = filtered.filter(order => {
      const orderDate = new Date(order.date).getTime();
      return orderDate >= start && orderDate <= end;
    });
  }


  if (selectedFilter.value !== 'all') {
    if (selectedFilter.value === 'Shipping') {
      filtered = filtered.filter(order => order.status === 'Shipping');
    }
    if (selectedFilter.value === 'Approved') {
      filtered = filtered.filter(order => order.status === 'Approved');
    }
    if (selectedFilter.value === 'Archived') {
      filtered = filtered.filter(order => order.status === 'Archived');
    }
    if (selectedFilter.value === 'Pending') {
      filtered = filtered.filter(order => order.payment === 'Pending');
    }
  }

  return filtered;
});


</script>

<style scoped>
.card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.box {
  max-width: 290px;
}
.table th {
  font-weight: 500;
  color: #6b7280;
}

.badge {
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
}

.btn {
  border-radius: 8px;
}

.btn-outline-secondary {
  border-color: #e5e7eb;
}

.form-control {
  border-radius: 8px;
  border-color: #e5e7eb;
  min-width: 150px;
}

.dp__main {
  width: 100%;
}
.dp__input {
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  width: 100%;
}

</style>