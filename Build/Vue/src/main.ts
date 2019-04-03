import Vue from 'vue';
import App from './App';
import store from './store/store';
import ModalContent from '@/components/ModalContent';


Vue.config.productionTip = false;

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app');


new Vue({
  store,
  render: (h) => h(ModalContent),
}).$mount('#vue-modalContent');
