<template>
  <div class="app">
    <header>
      <h1>掲示板</h1>
      <nav>
        <router-link to="/" class="nav-button">ホーム</router-link>
        <template v-if="isLoggedIn">
          <router-link
            v-if="ifAdmin"
            to="/admin"
            class="nav-button">管理者ページ</router-link>
          <span class="user-info">{{ username }}さん</span>
          <button @click="logout" class="nav-button logout">ログアウト</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-button">ログイン</router-link>
          <router-link to="/register" class="nav-button">新規登録</router-link>
        </template>
      </nav>
    </header>
    
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoggedIn = ref(false);
const username = ref('');
const ifAdmin = ref(false);

const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  const storedUsername = localStorage.getItem('username');
  const userRole = localStorage.getItem('role');

  if (token && storedUsername) {
    isLoggedIn.value = true;
    username.value = storedUsername;
    ifAdmin.value = userRole === 'admin';
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  isLoggedIn.value = false;
  username.value = '';
  router.push('/login');
};

onMounted(() => {
  checkLoginStatus();
});
</script>

<style>
.app {
  max-width: 800px;
  margin: auto;
  padding: 1rem;
}

header {
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

nav {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  align-items: center;
}

.nav-button {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.nav-button:hover {
  background-color: #45a049;
}

.user-info {
  margin-left: auto;
  color: #666;
  font-weight: bold;
}

.logout {
  background-color: #f44336;
}

.logout:hover {
  background-color: #da190b;
}
</style>