import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import { register } from 'vue-advanced-chat'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

register()
app.mount('#app')
