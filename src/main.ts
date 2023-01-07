import Demo from './Demo.vue'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'

import '@/assets/main.css'

const app = createApp(Demo)
app.use(PrimeVue)

app.mount('#app')
