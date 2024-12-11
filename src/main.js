import { createApp } from 'vue'
import router from './router/router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import VCalendar from 'v-calendar'
import './style.css'
import 'v-calendar/style.css'
import App from './App.vue'


const app = createApp(App)
app.use(router)
app.use(VCalendar, {})
app.component('VueDatePicker', VueDatePicker)
app.mount('#app')

