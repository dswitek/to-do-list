<template>
  <div class="container">
    <div class="task">
      <div class="title">
        <h2>Lista To Do</h2>
      </div>
      <div class="container-list" v-if="accountType !== 'local'">
        <div class="choose-list">
          <h3>Wybierz listę</h3>
          <div v-if="accountType === 'google'">
            <select v-model="selectedGoogleTaskList" @change="onGoogleTaskListChange">
            <option v-for="list in googleTaskLists" :key="list.id" :value="list">
            {{ list.title }}
            </option>
            </select>
          </div>
        </div>
        <div class="add-new-list">
          <router-link to="/create-list"><h2>Dodaj nową listę</h2></router-link>
        </div>
        <div class="remove-list">
          <button @click="removeList()"><h2>Usuń wybraną listę</h2></button>
        </div>
      </div>
      <div class="form">
        <input
          type="text"
          placeholder="Nowe zadanie"
          v-model="newTask"
          @keyup.enter="addTask"
        />
        <button class="btn-addtask" @click="addTask"><i class="fas fa-plus"></i></button>
      </div>
      <div class="taskItems">
        <ul>
          <task-item
            v-bind:task="task"
            v-for="(task, index) in tasksCopy"
            :key="task.id"
            @remove="removeTask(index)"
            @complete="completeTask(task)"
          ></task-item>
        </ul>
      </div>
      <div class="clearBtns">
        <button @click="clearCompleted">Usuń ukończone</button>
        <button @click="clearAll">Usuń wszystkie</button>
      </div>
      <div class="pendingTasks">
        <span>Oczekujące zadania: {{ incomplete }}</span>
      </div>
    </div>
    <button class="btn-logout" @click="logout">Wyloguj się</button>
  </div>
</template>

<script>
import { gapi } from 'gapi-script';
import TaskItem from "./Task-item";

export default {
  name: "Task",
  props: ["tasks"],
  components: {
    TaskItem,
  },
  data() {
    return {
      newTask: "",
      tasksCopy: [], 
      googleTaskLists: [],
      newListTitle: "",
      selectedGoogleTaskList: null,
      accountType: localStorage.getItem("accountType") || "local",
    };
  },
  computed: {
    incomplete() {
      return this.tasksCopy.filter(this.inProgress).length;
    },
  },
  methods: {
    loadTasks() {
    const accountType = localStorage.getItem("accountType");

    if (accountType === "local") {
      this.loadTasksFromLocalStorage();
    } else if (accountType === "google") {
      this.loadGoogleTasks();
    }
  },
    loadTasksFromLocalStorage() {
      if (this.accountType === 'local') {
      const loggedInUsername = localStorage.getItem("loggedInUsername");
      if (loggedInUsername) {
        const tasksFromStorage = localStorage.getItem(loggedInUsername + "_tasks");
        if (tasksFromStorage) {
          try {
              const parsedTasks = JSON.parse(tasksFromStorage);
              this.tasksCopy = parsedTasks.map(task => ({
                ...task,
                accountType: "local",
              }));
            } catch (error) {
            console.error("Błąd podczas wczytywania zadań z Local Storage:", error);
          }
        }
      }
    }
    },
    saveTasksToLocalStorage() {
      if (this.accountType === "google") {
      return;
    }
      const loggedInUsername = localStorage.getItem("loggedInUsername");
      if (loggedInUsername) {
        localStorage.setItem(loggedInUsername + "_tasks", JSON.stringify(this.tasksCopy));
      } else {
        console.log("Brak zalogowanego użytkownika. Nie zapisuję zadań.");
      }
    },
      async fetchGoogleTaskLists() {
          if (this.accountType === "google"){

            const token = localStorage.getItem('googleToken');
            if (!token) {
              console.error("Brak tokena dostępu.");
              this.errorMessage = "Brak tokena dostępu. Proszę zalogować się ponownie.";
              return;
            }
            gapi.auth.setToken({
              access_token: token,
            });

            this.loading = true;
            this.errorMessage = '';

            try {
            const googleAuth = gapi.auth2.getAuthInstance();
            const googleUser = googleAuth.currentUser.get();

            if (!googleUser.isSignedIn()) {
              console.error("Użytkownik nie jest zalogowany do Google.");
              this.errorMessage = "Proszę zalogować się do Google.";
              return;
            }

            if (!gapi.client.tasks) {
            await gapi.client.load('tasks', 'v1');
          }

            const response = await gapi.client.tasks.tasklists.list();
            console.log("Odpowiedź z Google API: ", response);

            if (response && response.result && response.result.items) {
              this.googleTaskLists = response.result.items;
              console.log("Listy zadań Google:", this.googleTaskLists);

              
            if (!this.selectedGoogleTaskList && this.googleTaskLists.length > 0) {
              this.selectedGoogleTaskList = this.googleTaskLists[0];
            }
            } else {
              console.error("Nie znaleziono żadnych list zadań.");
            }
          } catch (error) {
            console.error("Nie udało się pobrać list zadań:", error);
          } finally {
          this.loading = false;
        }
          }
        },
      async loadGoogleTasks() {
          if (!this.selectedGoogleTaskList) {
        console.error("Nie wybrano listy Google Tasks.");
        return;
      }
      try {
        const response = await gapi.client.tasks.tasks.list({
          tasklist: this.selectedGoogleTaskList.id,
        });
        const tasksFromGoogle = response.result.items || [];
        
        this.tasksCopy = tasksFromGoogle.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.status === 'completed',  
          accountType: "google",
        }));

        console.log("Wczytane zadania z Google:", this.tasksCopy);  
      } catch (error) {
        console.error("Nie udało się pobrać zadań z Google Tasks:", error);
      }
        },
        onGoogleTaskListChange() {
          console.log("Lista zadań została zmieniona:", this.selectedGoogleTaskList);
          this.loadGoogleTasks();
      },
      async addTaskToGoogle(newTaskTitle) {
        if (!this.selectedGoogleTaskList) {
          alert("Wybierz listę Google Tasks przed dodaniem zadania.");
          return;
        }
        try {
          gapi.auth.setToken({ access_token: localStorage.getItem('googleToken') });

          const response = await gapi.client.tasks.tasks.insert({
            tasklist: this.selectedGoogleTaskList.id,
            resource: {
              title: newTaskTitle,
            },
          });

          console.log("Zadanie dodane do Google Tasks:", response.result);

          this.tasksCopy.push({
            id: response.result.id,
            title: response.result.title,
            completed: false,
          });

          this.newTask = "";
        } catch (error) {
          console.error("Nie udało się dodać zadania do Google Tasks:", error);
        }
      },
    async createGoogleTaskList(newListTitle) {
        gapi.auth.setToken({
          access_token: localStorage.getItem("googleToken"),
        });

        const loggedInUsername = localStorage.getItem("loggedInUsername");
        if (loggedInUsername) {
        localStorage.setItem(loggedInUsername + "_tasks", JSON.stringify(this.tasksCopy));
      }
        try {
          const response = await gapi.client.tasks.tasklists.insert({
            resource: {
              title: newListTitle,
            },
          });

          console.log("Nowa lista zadań została utworzona:", response.result);
          this.googleTaskLists.push(response.result);
          await this.fetchGoogleTaskLists();
          this.selectedGoogleTaskList = response.result;
          this.loadGoogleTasks();
        } catch (error) {
          console.error("Nie udało się stworzyć nowej listy zadań:", error);
        }
      },
      async removeList() {
        if (!this.selectedGoogleTaskList) {
          alert("Nie wybrano listy do usunięcia.");
          return;
        }

        if (this.googleTaskLists[0] && this.selectedGoogleTaskList.id === this.googleTaskLists[0].id) {
          alert("Nie można usunąć pierwszej listy.");
          return;
        }

        try {
          gapi.auth.setToken({
            access_token: localStorage.getItem('googleToken'),
          });

          const response = await gapi.client.tasks.tasklists.delete({
          tasklist: this.selectedGoogleTaskList.id,
          });
          console.log("Odpowiedź z usunięcia listy:", response);


          this.googleTaskLists = this.googleTaskLists.filter(
            (list) => list.id !== this.selectedGoogleTaskList.id
          );

          this.selectedGoogleTaskList = this.googleTaskLists.length > 0
          ? this.googleTaskLists[0]
          : null;

          alert("Lista została usunięta.");
          console.log("Lista została pomyślnie usunięta.");
        } catch (error) {
          console.error("Nie udało się usunąć listy:", error);
          alert("Wystąpił błąd podczas usuwania listy. Spróbuj ponownie.");
        }
      },
      addTask() {
          if (this.accountType === "google") {
        if (this.newTask.trim()) {
          this.addTaskToGoogle(this.newTask);
        } else {
          alert("Nie można dodać pustego zadania.");
        }
      } else {
        const loggedInUsername = localStorage.getItem("loggedInUsername");
        if (loggedInUsername && this.newTask.trim()) {
          const newTask = {
            id: Date.now(),
            title: this.newTask,
            completed: false,
            accountType: "local",
            username: loggedInUsername,
          };
          this.tasksCopy = [...this.tasksCopy, newTask];
          this.newTask = "";
          this.saveTasksToLocalStorage();
        } else {
          alert("Musisz być zalogowany, aby dodać zadanie.");
        }
      }
    },
    removeTask(index) {
      const task = this.tasksCopy[index];

  if (!task.id || !this.selectedGoogleTaskList || !this.selectedGoogleTaskList.id) {
    console.error("Brak wymaganych danych do usunięcia zadania.");
    return;
  }

  if (this.accountType === "google" && task.id) {
    try {
      const token = localStorage.getItem('googleToken');
      if (!token) {
        console.error("Brak tokena dostępu.");
        return;
      }

      gapi.auth.setToken({ access_token: token });

      gapi.client.tasks.tasks.delete({
        tasklist: this.selectedGoogleTaskList.id,
        task: task.id,
      }).then(() => {
        console.log("Zadanie zostało usunięte z Google Tasks.");
        this.tasksCopy.splice(index, 1);
        this.loadGoogleTasks();
      }).catch((error) => {
        console.error("Nie udało się usunąć zadania z Google Tasks:", error);
        alert("Błąd podczas usuwania zadania. Spróbuj ponownie.");
      });
      } catch (error) {
        console.error("Nie udało się usunąć zadania z Google Tasks:", error);
        alert("Błąd podczas usuwania zadania. Spróbuj ponownie.");
      }
    } else {
      this.tasksCopy.splice(index, 1);
      this.saveTasksToLocalStorage();
    }
    },
    clearCompleted() {
      this.tasksCopy = this.tasksCopy.filter(this.inProgress); 
      this.saveTasksToLocalStorage();

      if (this.accountType === "google") {
        this.updateGoogleTaskStatus("clearCompleted")
      } else {
        this.saveTasksToLocalStorage();
      }
    },
    clearAll() {
      this.tasksCopy = [];
      this.saveTasksToLocalStorage();

      if (this.accountType === "google") {
        this.updateGoogleTaskStatus("clearAll")
      } else {
        this.saveTasksToLocalStorage();
      }
    },
    completeTask(task) {
      task.completed = !task.completed;

      if (this.accountType === "google") {
        this.updateGoogleTaskStatus(task);
      } else {
        this.saveTasksToLocalStorage();
      }
    },
    async updateGoogleTaskStatus(task) {
    if (!this.selectedGoogleTaskList) {
      console.error("Nie wybrano listy zadań Google.");
      return;
    }
    console.log("Wybrana lista zadań:", this.selectedGoogleTaskList);
    console.log("Status do ustawienia:", task.completed ? 'completed' : 'needsAction');
    console.log("Sprawdzanie zadania:", task);


        const googleAuth = gapi.auth2.getAuthInstance();
        const token = googleAuth.currentUser.get().getAuthResponse().access_token;
        if (!token) {
          console.error("Brak tokena dostępu.");
          this.errorMessage = "Brak tokena dostępu. Proszę zalogować się ponownie.";
          return;
        }
        gapi.auth.setToken({ access_token: localStorage.getItem('googleToken') });

        if (task === "clearAll") {

        try {
          console.log("Usuwanie wszystkich zadań z listy:", this.selectedGoogleTaskList.id);

          const response = await gapi.client.tasks.tasks.list({
            tasklist: this.selectedGoogleTaskList.id,
          });

          if (response.status !== 200) {
            console.error("Błąd podczas pobierania zadań:", response.status, response.statusText);
            return;
          }

          const tasks = response.result.items;
          if (tasks && tasks.length > 0) {
            for (const taskToDelete of tasks) {
              console.log(`Usuwam zadanie: ${taskToDelete.id}`);
              await gapi.client.tasks.tasks.delete({
                tasklist: this.selectedGoogleTaskList.id,
                task: taskToDelete.id,
              });
            }
            console.log("Wszystkie zadania zostały usunięte.");
          } else {
            console.log("Brak zadań do usunięcia.");
          }

          this.tasksCopy = [];
          this.saveTasksToLocalStorage();

        } catch (error) {
          console.error("Błąd podczas usuwania zadań z Google Tasks:", error);
        }
        return;
      }

      if (task === "clearCompleted") {
      try {
        console.log("Usuwanie ukończonych zadań z listy:", this.selectedGoogleTaskList.id);

        const response = await gapi.client.tasks.tasks.list({
          tasklist: this.selectedGoogleTaskList.id,
          completed: true,
        });

        if (response.status !== 200) {
          console.error("Błąd podczas pobierania zadań:", response.status, response.statusText);
          return;
        }

        const tasks = response.result.items;
        if (tasks && tasks.length > 0) {
          for (const taskToDelete of tasks) {
            console.log(`Usuwam ukończone zadanie: ${taskToDelete.id}`);
            await gapi.client.tasks.tasks.delete({
              tasklist: this.selectedGoogleTaskList.id,
              task: taskToDelete.id,
            });
          }
          console.log("Wszystkie ukończone zadania zostały usunięte.");
        } else {
          console.log("Brak ukończonych zadań do usunięcia.");
        }
        this.tasksCopy = this.tasksCopy.filter(task => !task.completed);
        this.saveTasksToLocalStorage();

      } catch (error) {
        console.error("Błąd podczas usuwania ukończonych zadań z Google Tasks:", error);
      }
      return; 
    }
    
      const taskToUpdate = {
      "tasklist": this.selectedGoogleTaskList.id,
      "task": task.id,
      "resource": {
      "status": task.completed ? 'completed' : 'needsAction',
      },
    };

    if (!taskToUpdate.tasklist || !taskToUpdate.task) {
      console.error("Nie można zaktualizować zadania - brak wymaganych danych.", taskToUpdate);
      return;
    }

    console.log("Dane do wysłania do API:", taskToUpdate);

      if (!taskToUpdate.tasklist) {
        console.error("Brakuje ID listy zadań.");
      }
      
      if (!taskToUpdate.task) {
        console.error("Brak ID zadania:", taskToUpdate);
        return;
      }
    
      try {
        console.log("Token używany do autoryzacji:", token);
        console.log(gapi.client.tasks.tasks.update(taskToUpdate));

      const response = await gapi.client.tasks.tasks.update(taskToUpdate);
      console.log("Full API response:", response);
        if (response.status !== 200) { 
            console.error("Google Tasks API error:", response.status, response.statusText);
            console.error("Error details:", response.result || response.error); 
            return; 
        }

      console.log("Zaktualizowano zadanie w Google Tasks:", response.result);
      
      const index = this.tasksCopy.findIndex(t => t.id === task.id);
      console.log("Index zadania:", index);
      if (index !== -1) {
        console.log("Zadanie przed aktualizacją:", this.tasksCopy[index]);
        this.tasksCopy[index].completed = task.completed;
        console.log("Zadanie po aktualizacji:", this.tasksCopy[index]);
      } else {
        console.error("Nie znaleziono zadania w tasksCopy");
      }

      console.log("ID listy:", this.selectedGoogleTaskList.id);
      console.log("ID zadania:", task.id);

      this.saveTasksToLocalStorage();
    } catch (error) {
      console.error("Nie udało się zaktualizować zadania w Google Tasks:", error);
    }
  },
    inProgress(task) {
      return !task.completed;
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
    checkLoginStatus() {
      const loggedInUsername = localStorage.getItem("loggedInUsername");
      if (loggedInUsername) {
        this.isLoggedIn = true;
      }
    },
    checkGoogleLoginStatus() {
      const googleAuth = gapi.auth2.getAuthInstance();
      const googleUser = googleAuth.currentUser.get();

      if (googleUser.isSignedIn()) {
        this.isLoggedInGoogle = true;
        this.fetchGoogleTaskLists();
      } else {
        this.isLoggedInGoogle = false;
      }
    },
      async checkTokenValidity() {
      if (this.accountType === "google"){
        const token = localStorage.getItem('googleToken');
        if (token) {
          try {
            const googleAuth = gapi.auth2.getAuthInstance();
            const currentUser = googleAuth.currentUser.get();
            const tokenExpiryTime = currentUser.getAuthResponse().expires_at;
            const currentTime = new Date().getTime() / 1000;

            if (tokenExpiryTime <= currentTime) {
              console.log("Token wygasł, rozpoczynam ponowne logowanie.");
              await this.reauthenticate();
            }
          } catch (error) {
            console.error("Błąd podczas weryfikacji tokena:", error);
          }
        }
      }
      },
      async loadGapiTasksAPI() {
        if (!gapi.client.tasks) {
         try {
          const token = localStorage.getItem('googleToken');
          if (!token) {
            console.error("Brak tokena dostępu w localStorage.");
            return;
          }
          console.log("Token używany do autoryzacji:", token);
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
  },
  watch: {
    googleTaskLists: {
    handler(newVal) {
      console.log("Zaktualizowano googleTaskLists:", newVal);
      if (!this.selectedGoogleTaskList && newVal.length > 0) {
        this.selectedGoogleTaskList = newVal[0];
      }
    },
    immediate: true,
  },
    selectedGoogleTaskList: {
    immediate: true,
    handler(newVal) {
      if (newVal) {
        console.log(`Wybrano nową listę: ${newVal.title}`);
        this.loadGoogleTasks();
      }
    },
  },
    tasks: {
    immediate: true,
    handler(newTasks) {
      if (Array.isArray(newTasks)) {
        this.tasksCopy = [...newTasks];
      } else {
        console.warn("Oczekiwano tablicy w 'tasks', ale otrzymano:", newTasks);
        this.tasksCopy = [];
      }
    },
    accountType(newType) {
    if (newType === "local") {
      this.loadTasksFromLocalStorage();
    } else if (newType === "google") {
      if (localStorage.getItem('googleToken')) {
        this.fetchGoogleTaskLists();
    }
  }
  },
  },
  },
  mounted() {
    const loggedInUsername = localStorage.getItem("loggedInUsername");

  if (!loggedInUsername) {
    this.$router.push({ name: 'login' }); 
  } else {
    this.accountType = localStorage.getItem("accountType") || 'local';

    if (this.accountType === "google") {
      this.fetchGoogleTaskLists();
      this.checkGoogleLoginStatus();
      this.checkAuthStatus();
    } else {
      this.loadTasksFromLocalStorage();
      this.checkLoginStatus();
    }
  }
}
};
</script>
