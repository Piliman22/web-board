<template>
  <div class="admin-panel">
    <h2>管理者パネル</h2>
    
    <div class="users-list">
      <h3>ユーザー一覧</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>ユーザー名</th>
            <th>ロール</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.role }}</td>
            <td>
              <select 
                v-model="user.role"
                @change="updateUserRole(user.id, $event.target.value)"
              >
                <option value="user">ユーザー</option>
                <option value="admin">管理者</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const users = ref([])

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:3000/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    users.value = response.data
  } catch (error) {
    console.error('ユーザー一覧の取得に失敗:', error)
    if (error.response?.status === 403) {
      alert('管理者権限が必要です')
      router.push('/')
    }
  }
}

const updateUserRole = async (userId, newRole) => {
  try {
    const token = localStorage.getItem('token')
    await axios.put(`http://localhost:3000/admin/users/${userId}/role`, 
      { role: newRole },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    alert('ロールを更新しました')
  } catch (error) {
    console.error('ロールの更新に失敗:', error)
    alert('ロールの更新に失敗しました')
  }
}

onMounted(() => {
  const userRole = localStorage.getItem('role')
  if (userRole !== 'admin') {
    alert('管理者権限が必要です')
    router.push('/')
    return
  }
  fetchUsers()
})
</script>

<style scoped>
.admin-panel {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.users-list {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
}

select {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

h2, h3 {
  color: #333;
}
</style>