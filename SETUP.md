# Руководство по установке и настройке AniPlayer (SETUP.md)

---

## 1. Установка приложения

### Windows
1. Перейдите на страницу [GitHub Releases](https://github.com/vanaedynak/aniplayer-gemini/releases).
2. Скачайте файл **`AniPlayer-Setup-1.0.0.exe`**.
3. Запустите установщик. Программа автоматически установится и создаст ярлык на рабочем столе.
4. **Автообновления**: при выходе новой версии в шапке приложения появится зеленая кнопка **«Обновить»**, которая позволит скачать свежий релиз в один клик.

### iPad (iOS)
Поскольку приложение не публикуется в App Store, для iPad подготовлен неподписанный пакет **`.ipa`**, который можно установить с помощью любого удобного инструмента сайдлоада:

* **TrollStore** (для устройств с поддержкой TrollStore):
  1. Скачайте `AniPlayer.ipa` напрямую в Safari на iPad.
  2. Откройте файл через TrollStore — установка произойдет мгновенно и без ограничений по времени действия сертификата.
* **Sideloadly** (через ПК с Windows):
  1. Установите [Sideloadly](https://sideloadly.io/) на компьютер.
  2. Подключите iPad кабелем к компьютеру.
  3. Перетащите файл `AniPlayer.ipa` в окно Sideloadly, введите ваш бесплатный Apple ID и нажмите **Start**.
* **AltStore / SideStore**:
  1. Откройте AltStore на iPad.
  2. Во вкладке **My Apps** нажмите **+** и выберите скачанный `AniPlayer.ipa`.

---

## 2. Настройка синхронизации через Firebase

По умолчанию AniPlayer надежно сохраняет весь прогресс, историю, списки («Смотрю / В планах / Просмотрено») и статистику в локальном защищенном хранилище.

Если вы захотите включить облачную синхронизацию между ПК и iPad через Firebase:

1. Откройте [Firebase Console](https://console.firebase.google.com/) и создайте новый проект (например, `aniplayer-app`).
2. В боковом меню перейдите в **Build → Authentication** и нажмите **Get Started**:
   * Во вкладке **Sign-in method** включите провайдер **Anonymous** (для входа без ввода пароля) или **Email/Password**.
3. В боковом меню перейдите в **Build → Firestore Database** и нажмите **Create database**:
   * Выберите регион (например, `europe-west3` или ближайший).
   * Выберите режим правил (на этапе тестирования можно выбрать **Start in test mode**).
4. Перейдите в **Project Settings** (шестеренка вверху слева) → раздел **Your apps** → нажмите на иконку веб-приложения `</>`:
   * Задайте имя приложению (например, `AniPlayer Web`).
   * Скопируйте объект конфигурации `firebaseConfig`.
5. Создайте в корне проекта файл `.env` со значениями:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
6. При наличии этих переменных приложение автоматически связывает локальное хранилище с Firestore.

---

## 3. Локальная разработка и ручная сборка

* **Установка зависимостей:**
  ```bash
  npm install
  ```
* **Запуск режима разработки:**
  ```bash
  npm run dev
  ```
* **Сборка веб-версии:**
  ```bash
  npm run build
  ```
* **Сборка Windows установщика (NSIS):**
  ```bash
  npm run build:electron
  ```
* **Синхронизация iOS/iPad проекта:**
  ```bash
  npm run cap:sync
  ```
