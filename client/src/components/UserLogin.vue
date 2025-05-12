<template>
  <div class="user-login">
    <h2>ログイン</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="ユーザー名" required />
      <input v-model="password" type="password" placeholder="パスワード" required />
      <button type="submit">ログイン</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')

const login = async () => {
  try {
    const response = await axios.post('http://localhost:3000/users/login', {
      username: username.value,
      password: password.value,
    })
    
    // トークンとユーザー情報を保存
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('username', username.value)
    localStorage.setItem('role', response.data.user.role)
    
    username.value = ''
    password.value = ''
    
    // ホームページにリダイレクト
    window.location.href = '/'
    // ページをリロードしてヘッダーを更新
    window.location.reload()
  } catch (error) {
    alert('エラーが発生しました: ' + error.response.data.error)
  }
}
</script>

<style scoped>
.user-login {
  margin: 1rem 0;
}
form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
input {
  padding: 0.5rem;
}
</style>