<template>
    <div class="create-list-container">
      <h2>Utwórz nową listę zadań</h2>
      <form @submit.prevent="createList">
        <div>
          <label for="listTitle">Tytuł listy</label>
          <input 
            type="text" 
            id="listTitle" 
            v-model="newListTitle" 
            placeholder="Wpisz tytuł nowej listy"
            required
          />
        </div>
        <button type="submit" class="btn-create">Utwórz listę</button>
      </form>
      <div v-if="loading" class="loading">Tworzenie listy...</div>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      
      <button class="btn-logout" @click="logout">Wyloguj się</button>
    </div>
  </template>
  
  <script>
  import { gapi } from 'gapi-script';
  
  export default {
    data() {
      return {
        newListTitle: '',
        loading: false,
        errorMessage: '',
      };
    },
    methods: {
    async loadGapiTasksAPI() {
        if (!gapi.client.tasks) {
         try {
         await gapi.client.load('tasks', 'v1');
         console.log('Google Tasks API zostało załadowane.');
         } catch (error) {
         console.error('Błąd podczas ładowania Google Tasks API:', error);
         throw new Error('Nie udało się załadować Google Tasks API.');
        }
        } else {
            console.log('Google Tasks API jest już załadowane.');
        }
        },
    async createList() {
        if (!this.newListTitle.trim()) {
          alert('Proszę podać tytuł listy.');
          return;
        }
  
        this.loading = true;
        this.errorMessage = '';
        
        try {
          if (!gapi.client || !gapi.client.tasks) {
            console.log('gapi.tasks jest niedostępne, czekam na załadowanie...');
            await this.loadGapiTasksAPI();
        }

        const token = localStorage.getItem('googleToken');
        if (!token) {
          throw new Error('Brak tokena dostępu.');
        }

        gapi.auth.setToken({
          access_token: localStorage.getItem("googleToken"),
        });

          if (!gapi.client.tasks) {
            throw new Error('API Google Tasks nie jest załadowane.');
        }
        
        if (!gapi.client.tasks) {
          await gapi.client.load('tasks', 'v1');
        }

          const response = await gapi.client.tasks.tasklists.insert({
            resource: {
              title: this.newListTitle,
            },
          });
          
          this.selectedGoogleTaskList = response.result;
          console.log('Nowa lista zadań została utworzona:', response.result);
          
          this.$router.push({ name: 'todo' });
  
        } catch (error) {
          this.errorMessage = 'Nie udało się utworzyć listy. Spróbuj ponownie.';
          console.error('Błąd podczas tworzenia listy:', error);
        } finally {
          this.loading = false;
        }
      },
      logout() {
        this.username = "";
        this.password = "";
        localStorage.removeItem("loggedInUsername");
        localStorage.removeItem("accountType");
        const loggedInUsername = localStorage.getItem("loggedInUsername");
        if (loggedInUsername) {
          localStorage.setItem(loggedInUsername + "_tasks", JSON.stringify([]));
        }
        this.tasksCopy = []; 
        this.$router.push({ name: 'login' }); 
        alert("Wylogowano!");
      },
      async googleSignOut() {
        try {
          const googleAuth = gapi.auth2.getAuthInstance();
          await googleAuth.signOut();
          this.tasksCopy = []; 
          localStorage.removeItem("loggedInUsername");
          localStorage.removeItem("accountType");
        } catch (error) {
          console.error('Wylogowanie z Google nie powiodło się:', error);
        }
      },
      async signInWithScopes() {
    try {
        const authInstance = gapi.auth2.getAuthInstance();
        await authInstance.signIn({
        scope: 'https://www.googleapis.com/auth/tasks',
        });
        console.log('Użytkownik został pomyślnie zalogowany i udzielił uprawnień');
    } catch (error) {
        console.error('Błąd podczas logowania:', error);
    }
    },
    async checkAuthStatus() {
     const authInstance = gapi.auth2.getAuthInstance();
  
    if (authInstance.isSignedIn.get()) {
        const token = authInstance.currentUser.get().getAuthResponse().access_token;
        console.log("Token dostępu:", token);
        
        const grantedScopes = authInstance.currentUser.get().getGrantedScopes();
        if (grantedScopes.includes("https://www.googleapis.com/auth/tasks")) {
        console.log("Użytkownik ma dostęp do Google Tasks API.");
        } else {
        console.log("Brak wymaganych uprawnień, wymagane ponowne logowanie.");
        await this.signInWithScopes();
        }
    } else {
        console.log("Użytkownik nie jest zalogowany.");
        await this.signInWithScopes();
    }
    },
    }
  };
  </script>
  