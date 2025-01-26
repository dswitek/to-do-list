<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { initDatabase, addUserToDB, getAllUsersFromDB, deleteUserFromDB, clearUsersInDB } from "./database";

export default {
  name: "App",
  data() {
    return {
      users: [], // Lokalna lista użytkowników
    };
  },
  mounted() {
    this.initializeDatabase(); 
  },
  methods: {
    async initializeDatabase() {
      try {
        // Inicjalizacja bazy IndexedDB
        await initDatabase();
        console.log("IndexedDB zainicjalizowane.");
        // Pobierz użytkowników z IndexedDB
        this.users = await getAllUsersFromDB();
        console.log("Użytkownicy pobrani z IndexedDB:", this.users);
      } catch (error) {
        console.error("Błąd podczas inicjalizacji IndexedDB:", error);
      }
    },
    async addUser(user) {
      try {
        // Dodaj użytkownika do IndexedDB
        await addUserToDB(user);
        this.users = await getAllUsersFromDB();
        console.log("Użytkownik dodany:", user);
      } catch (error) {
        console.error("Błąd podczas dodawania użytkownika:", error);
      }
    },
    async deleteUser(id) {
      try {
        // Usuń użytkownika z IndexedDB
        await deleteUserFromDB(id);
        this.users = await getAllUsersFromDB();
        console.log("Użytkownik usunięty o ID:", id);
      } catch (error) {
        console.error("Błąd podczas usuwania użytkownika:", error);
      }
    },
    async clearUsers() {
      try {
        // Wyczyść wszystkich użytkowników z IndexedDB
        await clearUsersInDB();
        this.users = [];
        console.log("Wszyscy użytkownicy zostali usunięci.");
      } catch (error) {
        console.error("Błąd podczas czyszczenia bazy użytkowników:", error);
      }
    },
  },
};
</script>
