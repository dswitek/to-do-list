<template>
    <div class="loginPage">
      <h2 class="title">Zaloguj się</h2>

      <form @submit.prevent="login" method="post">
        <input v-model="username" type="text" placeholder="Nazwa użytkownika" required />
        <input v-model="password" type="password" placeholder="Hasło" required />
        <button class="btn-login" type='sumbit'>Zaloguj się</button>
        <button class="btn-login" type="button" @click="googleSignIn">Zaloguj się przez Google</button>
        <p>Nie masz konta? 
        <router-link class="btn-register" to="/register">Zarejestruj się</router-link>
      </p>
      </form>


    </div>
  </template>
  
  <script>
import { gapi } from 'gapi-script';

  export default {
    data() {
      return {
        username: '',
        password: '',
        isLoggedIn: false,
        isLoggedInGoogle: false, 
      };
    },
    methods: {
     async login() {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(u => u.username === this.username && u.password === this.password);

      if (user) {
        this.username = ""; 
        this.password = "";
        localStorage.setItem("loggedInUsername", user.username);
        localStorage.setItem("accountType", "local");
        console.log("loggedInUsername:", localStorage.getItem("loggedInUsername"));
        this.isLoggedIn = true; 
        this.$router.push({ name: 'todo' }); 

        alert("Zalogowano pomyślnie!");
      } else {
        alert("Niepoprawna nazwa użytkownika lub hasło!");
      }
      },
      async googleSignIn() {
        try {
          console.log('Próba inicjalizacji Google Auth...');
          const googleAuth = gapi.auth2.getAuthInstance();
          await googleAuth.signOut();
          const user = await googleAuth.signIn({
            prompt: 'select_account',
            ux_mode: 'popup',
          });
          console.log('Sprawdzanie stanu zalogowania...');
          if (!googleAuth.isSignedIn.get()) {
            console.log('Użytkownik nie jest zalogowany, próba logowania...');
            await googleAuth.signIn();  
          }
          console.log('Pomyślnie zalogowano użytkownika.');
          const token = googleAuth.currentUser.get().getAuthResponse().access_token;
          if (!token) {
              throw new Error("Brak tokena dostępu");
          }
          gapi.auth.setToken({ access_token: token });
          localStorage.setItem('googleToken', token);

          const profile = user.getBasicProfile();
          const username = profile.getName();
          localStorage.setItem("loggedInUsername", username);
          localStorage.setItem("accountType", "google");

          const isFirstLogin = !localStorage.getItem(username + "_tasks"); 

        if (isFirstLogin) {
          await this.$router.push({ name: 'create-list' });
        }
          this.isLoggedIn = true; 
          this.$router.push({ name: "todo" }); 
        } catch (error) {
          console.error('Logowanie do Google nie powiodło się:', error);
        }
      },

  }
  };
  </script>
  