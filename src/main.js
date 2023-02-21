import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Vue3Menus } from 'vue3-menus'

createApp(App).use(router).component('vue3-menus', Vue3Menus).mount('#app')
