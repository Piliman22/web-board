<template>
  <div class="user-registration">
    <h2>アカウント作成</h2>
    <form @submit.prevent="registerUser">
      <input v-model="username" placeholder="ユーザー名" required />
      <input v-model="password" type="password" placeholder="パスワード" required />
      <button type="submit">アカウント作成</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const username = ref('')
const password = ref('')
const role = ref('user')

const registerUser = async () => {
  try {
    await axios.post('http://localhost:3000/users/register', {
      username: username.value,
      password: password.value,
      role: role.value,
    })
    username.value = ''
    password.value = ''
    role.value = 'user'
    alert('ユーザーが作成されました')
  } catch (error) {
    alert('エラーが発生しました: ' + error.response.data.error)
  }
}
</script>

<style scoped>
.user-registration {
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