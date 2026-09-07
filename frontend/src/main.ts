import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/theme.css'

const app = createApp(App)
app.config.errorHandler = (error, _instance, info) => {
  console.error(`[Vue] ${info}`, error)
}
app.use(ElementPlus)
app.use(createPinia())
app.use(router)
app.mount('#app')
