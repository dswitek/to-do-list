<template>
    <div class="registerPage">
      <h2 class="title">Rejestracja</h2>
      <form @submit.prevent="register" method="post">
        <input v-model="username" type="text" placeholder="Nazwa użytkownika" required />
        <input v-model="password" type="password" placeholder="Hasło" required />
        <button class="btn-register" type="submit">Zarejestruj się</button>
        <p>Masz już konto? <router-link class ="btn-login" to="/login">Zaloguj się</router-link></p>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: "",
        password: "",
        isLoggedIn: false,
        isLoggedInGoogle: false, 
        showRegisterForm: false,
      };
    },
    methods: {
      register() {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const existingUser = users.find(u => u.username === this.username);
  
        if (existingUser) {
          alert("Nazwa użytkownika jest już zajęta!");
          return;
        }
  
        users.push({ username: this.username, password: this.password });
        localStorage.setItem("users", JSON.stringify(users));
        alert("Rejestracja zakończona pomyślnie! Możesz się teraz zalogować.");
        this.$router.push({ name: "login" });
      },
    },
  };
  </script>
  