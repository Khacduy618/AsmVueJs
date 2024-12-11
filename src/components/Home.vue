<template>
  <div class="container-fluid py-4">
    <h1 class="heading">Admin Dashboard</h1>
    <div class="cardBox">
      <div class="card" v-for="(item, index) in stats" :key="index">
        <div>
          <div class="numbers">{{ item.number }}</div>
          <div class="cardName">{{ item.name }}</div>
        </div>
        <div class="iconBx">
          <ion-icon :name="item.icon"></ion-icon>
        </div>
      </div>
    </div>

    <div class="row mt-4">
        <div class="details">
          <div class="recentOrders">
            <div class="cardHeader">
              <h4>Recent Orders</h4>
              <router-link to="/order" class="btn btn-primary btn-sm">View All</router-link>
            </div>
            <div class="table-responsive">
              <table class="table table-hover custom-table">
                <thead>
                  <tr>
                    <th class="text-center">Order ID</th>
                    <th class="text-center">Amount</th>
                    <th class="text-center">Status</th>
                    <th class="text-center">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in recentOrders" :key="order.bill_id">
                    <td>
                      <span class="order-id">#{{ order.bill_id }}</span>
                    </td>
                    <td class="text-center">
                      <span class="amount">${{ order.total_amount.toFixed(2) }}</span>
                    </td>
                    <td>
                      <span class="status">{{ order.bill_status }}</span></td>
                    <td>
                      <span class="date">{{ formatDate(order.bill_date) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="recentOrders">
            <div class="cardHeader">
            <h4>Best Selling Products</h4>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 bg-white">
              <thead class="bg-light">
                <tr>
                  <th>Product</th>
                  <th>Total Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in bestSellingProducts" :key="product.product_id">
                  <td>
                    <div class="d-flex align-items-center">
                      <img
                        :src="product.product_img"
                        class="rounded-circle product-img me-3"
                        :alt="product.product_name"
                      />
                      <div>
                        <p class="fw-bold mb-1">{{ product.product_name }}</p>
                        <p class="text-muted mb-0">#{{ product.product_id }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-success rounded-pill">{{ product.totalSold }}</span>
                  </td>
                  <td>
                    <span class="fw-bold text-success">${{ product.revenue.toFixed(2) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">

      <!-- Out of Stock Products -->
      <div class="col-md-6">
        <div class="details">
          <div class="recentOrders">
                      <div class="cardHeader">
            <h4>Out of Stock Products</h4>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 bg-white">
              <thead class="bg-light">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in outOfStockProducts" :key="product.product_id">
                  <td>
                    <div class="d-flex align-items-center">
                      <img
                        :src="product.product_img"
                        class="rounded-circle product-img me-3"
                        :alt="product.product_name"
                      />
                      <div>
                        <p class="fw-bold mb-1">{{ product.product_name }}</p>
                        <p class="text-muted mb-0">#{{ product.product_id }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-info rounded-pill">{{ getCategoryName(product.product_cat) }}</span>
                  </td>
                  <td>
                    <span class="fw-bold">${{ product.product_price.toFixed(2) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import axios from 'axios';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const stats = ref([]);
const chartData = ref({
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
  }]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
});

const recentOrders = ref([]);
const bestSellingProducts = ref([]);
const outOfStockProducts = ref([]);
const categories = ref([]);

const fetchStats = async () => {
  try {
    const [categoriesRes, productsRes, ordersRes, billDetailsRes] = await Promise.all([
      axios.get('http://localhost:3000/categories'),
      axios.get('http://localhost:3000/products'),
      axios.get('http://localhost:3000/bills'),
      axios.get('http://localhost:3000/bill_details')
    ]);

    categories.value = categoriesRes.data;
    
    // Update stats cards
    stats.value = [
      { 
        name: "Categories", 
        number: categoriesRes.data.length, 
        icon: "grid-outline" 
      },
      { 
        name: "Products", 
        number: productsRes.data.length, 
        icon: "cube-outline" 
      },
      { 
        name: "Orders", 
        number: ordersRes.data.length, 
        icon: "cart-outline" 
      },
      { 
        name: "Revenue", 
        number: `$${calculateTotalRevenue(ordersRes.data)}`, 
        icon: "cash-outline" 
      }
    ];

    // Update chart data - Product Status Distribution
    const statusStats = calculateStatusStats(productsRes.data);
    chartData.value.labels = ['Available', 'Out of Stock', 'Pre Order'];
    chartData.value.datasets[0].data = [
      statusStats.available || 0,
      statusStats.out_of_stock || 0,
      statusStats.pre_order || 0
    ];

    // Get recent orders
    recentOrders.value = ordersRes.data
      .sort((a, b) => new Date(b.bill_date) - new Date(a.bill_date))
      .slice(0, 5);

    // Calculate best selling products
    bestSellingProducts.value = calculateBestSelling(
      productsRes.data,
      billDetailsRes.data
    ).slice(0, 5);

    // Get out of stock products
    outOfStockProducts.value = productsRes.data
      .filter(product => product.product_status === 'out_of_stock')
      .slice(0, 5);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

const calculateTotalRevenue = (orders) => {
  const total = orders.reduce((sum, order) => sum + order.total_amount, 0);
  return total.toFixed(2);
};

const calculateStatusStats = (products) => {
  return products.reduce((acc, product) => {
    acc[product.product_status] = (acc[product.product_status] || 0) + 1;
    return acc;
  }, {});
};

const calculateBestSelling = (products, billDetails) => {
  // Calculate total quantity sold for each product
  const productSales = billDetails.reduce((acc, detail) => {
    acc[detail.product_id] = (acc[detail.product_id] || 0) + detail.quantity;
    return acc;
  }, {});

  // Combine with product details and calculate revenue
  return products.map(product => ({
    ...product,
    totalSold: productSales[product.product_id] || 0,
    revenue: (productSales[product.product_id] || 0) * product.product_price
  }))
  .sort((a, b) => b.totalSold - a.totalSold);
};

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.category_id === categoryId);
  return category ? category.category_name : 'Unknown';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.cardHeader h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.table-responsive {
  border-radius: 10px;
  margin-bottom: 0;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  color: #666;
}

.table tbody td {
  padding: 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #f0f0f0;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.product-img {
  width: 35px;
  height: 35px;
  object-fit: cover;
}

.badge {
  font-weight: 500;
  padding: 0.4em 0.8em;
  font-size: 0.75rem;
}

.cardBox {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card:hover {
  transform: translateY(-5px);
}

.numbers {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.cardName {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0;
}

.iconBx {
  font-size: 2.5rem;
  color: #ff5733;
  opacity: 0.9;
}

.heading {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
}

/* Table cell specific styles */
.table td p {
  margin: 0;
}

.table td .fw-bold {
  font-size: 0.875rem;
}

.table td .text-muted {
  font-size: 0.75rem;
}

/* Status badges */
.badge.bg-info {
  background-color: #17a2b8 !important;
}

.badge.bg-success {
  background-color: #28a745 !important;
}

.badge.bg-primary {
  background-color: #007bff !important;
}

/* Compact layout for product info */
.d-flex.align-items-center {
  gap: 0.75rem;
}

/* Chart container */
.chart-container {
  height: 300px;
  margin: 1rem 0;
}
.chart-card {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.chart-wrapper {
  flex: 1;
  position: relative;
  padding: 1rem;
}

/* Table styles */
.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.custom-table thead tr {
  background-color: #f8f9fa;
}

.custom-table th {
  padding: 1rem;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.custom-table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #e9ecef;
}

.order-id {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
}

.amount {
  color: #2e7d32;
  font-weight: 600;
}

.date {
  color: #757575;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #1976d2;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #1565c0;
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chart-card {
    min-height: 300px;
  }
  
  .custom-table th,
  .custom-table td {
    padding: 0.75rem;
  }
}
@media (max-width: 1200px) {
  .cardBox {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .cardBox {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .numbers {
    font-size: 1.75rem;
  }
  
  .iconBx {
    font-size: 2rem;
  }
}
</style>