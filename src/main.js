import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { app as firebaseApp } from './firebase/config';

const app = createApp(App)

app.use(createPinia())
app.use(router)


app.mount('#app')
