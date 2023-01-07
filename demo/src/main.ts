import App from './App.vue'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'

import './assets/main.css'

const app = createApp(App)
app.use(PrimeVue)

app.mount('#app')
