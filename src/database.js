import { openDB } from "idb";

const DB_NAME = "users-database";
const DB_VERSION = 1;

// Inicjalizacja bazy danych
export const initDatabase = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
      }
    },
  });
  return db;
};

// Dodaj użytkownika do bazy
export const addUserToDB = async (user) => {
  const db = await initDatabase();
  await db.add("users", user);
};

// Pobierz wszystkich użytkowników
export const getAllUsersFromDB = async () => {
  const db = await initDatabase();
  return await db.getAll("users");
};

// Usuń użytkownika z bazy
export const deleteUserFromDB = async (id) => {
  const db = await initDatabase();
  await db.delete("users", id);
};

// Wyczyść wszystkich użytkowników
export const clearUsersInDB = async () => {
  const db = await initDatabase();
  await db.clear("users");
};
