# Instalacja 
npm install <br />
npm install idb


# Uruchomienie
npm run serve

# Opis aplikacji
Aplikacja ma zapewnić narzędzie listy to-do z możliwością synchronizacji z Google Tasks.


# Napotkane problemy i sposoby ich rozwiązania (za pomocą Vue.js)
Błędy podczas interakcji z Google Tasks API <br />
    Dodano odpowiednią obsługę błędów w przypadku braku tokena dostępu, co uniemożliwia wykonywanie operacji na API. Jeśli token wygasa lub jest nieprawidłowy, system prosi użytkownika o  ponowne zalogowanie się. <br />
    Każda interakcja z Google Tasks API (np. dodawanie, usuwanie zadań) jest otoczona blokiem try-catch, co pozwala na wykrywanie błędów i ich odpowiednią obsługę. Komunikaty o błędach są wyświetlane w konsoli oraz, w razie potrzeby, w interfejsie użytkownika. <br />
Błędy w przetwarzaniu danych z Google Tasks API <br />
    Dodanie pliku vue.config.js umożliwiło skonfigurowanie proxy, które kieruje zapytania do Google Tasks API poprzez lokalny serwer deweloperski, omijając blokady CORS. Określono również dodatkowe nagłówki zabezpieczeń, które pozwalają na bezpieczne wykonywanie zapytań i łączenie się z Google API. <br />
Dostęp niezalogowanego użytkownika do aplikacji <br />
    Używając BeforeEach sprawdzane jest czy użytkownik chce wejść na stronę, która wymaga zalogowania, jeśli tak, a użytkownik nie jest zalogowany to jest przekierowywany na stronę logowania. <br />
    
Problemy z inicjalizacją bazy danych IndexedDB. <br />
Opis problemu: <br />

Podczas pierwszego uruchomienia aplikacji nie tworzono odpowiednich przestrzeni na dane (objectStore), co powodowało błędy podczas dodawania lub pobierania danych.
Brak synchronizacji bazy IndexedDB z komponentami Vue prowadził do sytuacji, w której zmiany w danych nie były widoczne w interfejsie.
Rozwiązanie: <br />

Dodano funkcję initDatabase w pliku database.js, która sprawdza istnienie bazy danych i odpowiednich objectStore. W przypadku ich braku, są one automatycznie tworzone: <br />

Błędy podczas dodawania i usuwania danych w IndexedDB <br />
Opis problemu: <br />

Podczas dodawania użytkowników do IndexedDB czasami generowany był błąd związany z duplikatami ID.
Przy usuwaniu danych zdarzało się, że aplikacja próbowała usunąć rekord, który już nie istniał w bazie danych, co powodowało błędy.
Rozwiązanie: <br />

W procesie dodawania użytkowników (addUserToDB) dodano logikę sprawdzającą, czy użytkownik z danym ID już istnieje <br />

Brak synchronizacji stanu Vue z IndexedDB. <br />
Opis problemu: <br />

Po dodaniu lub usunięciu danych w IndexedDB zmiany nie były od razu widoczne w interfejsie użytkownika.
Dane ładowano jedynie podczas początkowej inicjalizacji aplikacji, co prowadziło do niespójności w stanie aplikacji.
Rozwiązanie: <br />

Po każdej operacji (np. dodawanie, usuwanie, czyszczenie bazy) dodano ponowne pobieranie danych z IndexedDB i aktualizację stanu aplikacji <br />

Brak obsługi błędów w metodach pracy z IndexedDB. <br />
Opis problemu: <br />

Jeśli podczas wykonywania operacji IndexedDB wystąpił błąd (np. z powodu zamkniętej bazy), brakowało odpowiedniej obsługi błędów, co prowadziło do awarii aplikacji.
Rozwiązanie: <br />

Każda operacja na IndexedDB została otoczona blokiem try-catch, aby wychwycić potencjalne błędy i wyświetlić odpowiednie komunikaty w konsoli lub w interfejsie użytkownika <br />

 Brak obsługi czyszczenia bazy danych IndexedDB. <br />
Opis problemu: <br />

Użytkownicy zgłaszali, że nie mogli zresetować całej bazy danych IndexedDB.
Brakowało funkcjonalności, która usuwa wszystkie dane z bazy. <br />
Rozwiązanie: <br />

Dodano funkcję clearUsersInDB, która usuwa wszystkie rekordy z bazy

Problemy z odświeżaniem danych po odświeżeniu strony <br />
Opis problemu: <br />

Po odświeżeniu strony użytkownicy zgłaszali brak synchronizacji danych między IndexedDB a komponentami Vue.
Aplikacja nie odczytywała poprawnie danych zapisanych w IndexedDB po ponownym uruchomieniu. <br />
Rozwiązanie: <br />

Dodano automatyczne pobieranie danych z IndexedDB podczas inicjalizacji aplikacji (mounted) <br />

Problemy z synchronizacją między IndexedDB a zewnętrznymi źródłami danych (np. Google Tasks API). <br />
Opis problemu: <br />

Dane zapisane lokalnie w IndexedDB nie były synchronizowane z danymi z Google Tasks API, co prowadziło do niespójności. <br />
Rozwiązanie: <br />

W metodzie fetchTodos (lub odpowiedniku dla użytkowników) połączono dane z IndexedDB i Google Tasks API, eliminując duplikaty <br />