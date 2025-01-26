import Vue from 'vue'
import App from './App.vue'
import router from './router';
import { gapi } from 'gapi-script';

Vue.config.productionTip = false;

import './assets/css/main.css';

function initGapi() {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          clientId: '601871836773-fq4crbbco6cr9qknm3h15mdn5fcqsf23.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/tasks',
          prompt: 'consent',
        });
        const authInstance = gapi.auth2.getAuthInstance();
        
        if (!authInstance.isSignedIn.get()) {
          await authInstance.signIn();
        }
        resolve(); 
      } catch (error) {
        console.error('Błąd inicjalizacji gapi:', error);
        reject(error);
      }
    });
  });
}

initGapi()
  .then(() => {
    console.log('gapi zainicjowane!');
    new Vue({
      render: h => h(App),
      router,
    }).$mount('#app');
  })
  .catch(error => {
    console.error('Nie udało się zainicjować gapi:', error);
  });
