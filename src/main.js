import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './pinia'
import './firebase'

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
