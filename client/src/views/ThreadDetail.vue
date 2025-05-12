<template>
  <div class="thread-detail">
    <!-- スレッド本文 -->
    <div class="thread-main" v-if="thread">
      <h2>{{ thread.title }}</h2>
      <div class="thread-info">
        <span>投稿者: {{ thread.author }}</span>
        <span>{{ formatDate(thread.createdAt) }}</span>
      </div>
      <p class="thread-content">{{ thread.content }}</p>
    </div>

    <!-- レスポンス一覧 -->
    <div class="responses">
    <h3>返信一覧</h3>
    <div v-for="response in responses" 
         :key="response.id" 
         class="response-item">
      <div class="response-content">
        {{ response.content }}
        <!-- 編集・削除ボタンを追加 -->
        <div class="response-actions" v-if="response.author === username">
          <button @click="startEdit(response)" class="edit-btn">編集</button>
          <button @click="deleteResponse(response.id)" class="delete-btn">削除</button>
        </div>
      </div>
      <!-- 編集フォーム -->
      <div v-if="editingResponse && editingResponse.id === response.id" class="edit-form">
        <textarea v-model="editContent"></textarea>
        <div class="edit-actions">
          <button @click="saveEdit(response.id)" class="save-btn">保存</button>
          <button @click="cancelEdit" class="cancel-btn">キャンセル</button>
        </div>
      </div>
      <div class="response-info">
        <span>{{ response.author }}</span>
        <span>{{ formatDate(response.createdAt) }}</span>
      </div>
    </div>
  </div>

    <!-- 返信フォーム -->
    <div class="response-form" v-if="isLoggedIn">
    <h3>返信を投稿</h3>
    <form @submit.prevent="submitResponse">
      <textarea v-model="newResponse.content" placeholder="返信を入力" required></textarea>
      <button type="submit">返信する</button>
    </form>
  </div>
  <div v-else class="login-prompt">
    <p>返信するには<router-link to="/login">ログイン</router-link>してください</p>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const thread = ref(null);
const responses = ref([]);
const isLoggedIn = ref(!!localStorage.getItem('token')); 
const newResponse = ref({
  author: localStorage.getItem('username') || '',
  content: ''
});

const editingResponse = ref(null);
const editContent = ref(''); 
const username = localStorage.getItem('username'); 

const fetchThread = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/posts/threads/${route.params.id}`);
    thread.value = res.data.thread;
    responses.value = res.data.responses;
  } catch (error) {
    console.error('スレッドの取得に失敗しました:', error);
  }
};

const submitResponse = async () => {
  try {
    if (!isLoggedIn.value) {
      router.push('/login');
      return;
    }

    await axios.post(
      `http://localhost:3000/posts/threads/${route.params.id}/responses`,
      {
        ...newResponse.value,
        author: localStorage.getItem('username')
      }
    );
    newResponse.value.content = '';
    await fetchThread();
  } catch (error) {
    console.error('返信の投稿に失敗しました:', error);
  }
};

const formatDate = (iso) => new Date(iso).toLocaleString();

const startEdit = (response) => {
  editingResponse.value = response;
  editContent.value = response.content;
};

const cancelEdit = () => {
  editingResponse.value = null;
  editContent.value = '';
};

const saveEdit = async (postId) => {
  try {
    const currentUsername = localStorage.getItem('username');
    
    if (!currentUsername) {
      alert('ログインが必要です');
      return;
    }

    await axios.put(`http://localhost:3000/posts/threads/${postId}`, {
      content: editContent.value,
      author: currentUsername
    });
    
    await fetchThread();
    cancelEdit();
  } catch (error) {
    console.error('編集エラー:', error);
    if (error.response?.data?.error) {
      alert(error.response.data.error);
    } else {
      alert('編集に失敗しました');
    }
  }
};

const deleteResponse = async (postId) => {
  if (!confirm('本当に削除しますか？')) return;
  
  try {
    await axios.delete(`http://localhost:3000/posts/threads/${postId}`, {
      data: { author: username.value }
    });
    await fetchThread();
  } catch (error) {
    console.error('削除エラー:', error);
    alert('削除に失敗しました');
  }
};

onMounted(fetchThread);
</script>

<style scoped>
.thread-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.thread-main {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.thread-info {
  color: #666;
  font-size: 0.9em;
  margin: 10px 0;
  display: flex;
  gap: 20px;
}

.thread-content {
  white-space: pre-wrap;
}

.responses {
  margin-top: 30px;
}

.response-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}

.response-info {
  color: #666;
  font-size: 0.9em;
  margin-top: 5px;
  display: flex;
  gap: 20px;
}

.response-form {
  margin-top: 30px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input, textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

textarea {
  min-height: 100px;
}

button {
  padding: 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #45a049;
}

.response-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.edit-btn, .delete-btn, .save-btn, .cancel-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 4px;
}

.edit-btn {
  background-color: #4CAF50;
}

.delete-btn {
  background-color: #f44336;
}

.edit-form {
  margin-top: 0.5rem;
}

.edit-form textarea {
  width: 100%;
  min-height: 100px;
  margin-bottom: 0.5rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>