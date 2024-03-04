import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './ContrabassApp.vue';
import 'ant-design-vue/dist/antd.css';
import router from './router';
import i18n from '@/locales';
import { createPinia } from 'pinia';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import '@/utils/ValidationRules';

const app = createApp(App);

app.use(Antd);
app.use(router);
app.use(i18n);
app.use(createPinia().use(piniaPluginPersistedState));

app.mount('#app');
