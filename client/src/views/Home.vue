<template>
  <div class="home">
    <div class="announcements-section" v-if="announcements.length > 0">
      <h2>お知らせ</h2>
      <div class="announcement-list">
        <div v-for="announcement in announcements" :key="announcement.id" class="announcement-card">
          <h3>{{ announcement.title }}</h3>
          <div class="announcement-meta">
            <span>{{ formatDate(announcement.createdAt) }}</span>
          </div>
          <p class="announcement-content">{{ announcement.content }}</p>
          <button 
            v-if="isAdmin" 
            @click="deleteAnnouncement(announcement.id)" 
            class="delete-btn"
          >
            削除
          </button>
        </div>
      </div>
    </div>

    <!-- 管理者用：お知らせ作成フォーム -->
    <div v-if="isAdmin" class="create-announcement-section">
      <h2>新規お知らせ作成</h2>
      <form @submit.prevent="createAnnouncement" class="announcement-form">
        <div class="form-group">
          <input 
            v-model="newAnnouncement.title" 
            type="text" 
            placeholder="お知らせのタイトル" 
            required
          />
        </div>
        <div class="form-group">
          <textarea 
            v-model="newAnnouncement.content" 
            placeholder="お知らせの内容" 
            required
          ></textarea>
        </div>
        <button type="submit">作成</button>
      </form>
    </div>

    <!-- スレッド検索 -->
    <div class="search-section">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="スレッドを検索..."
        class="search-input"
        @input="handleSearch"
      />
    </div>
    <!-- スレッド作成セクション -->
    <div class="create-thread-section">
      <h2>新規スレッド作成</h2>
      <form @submit.prevent="createThread" class="thread-form">
        <div class="form-group">
          <input 
            v-model="newThread.title" 
            type="text" 
            placeholder="スレッドのタイトル" 
            required
          />
        </div>
        <div class="form-group">
          <textarea 
            v-model="newThread.content" 
            placeholder="スレッドの内容" 
            required
          ></textarea>
        </div>
        <button type="submit">作成</button>
      </form>
    </div>

    <!-- スレッド一覧セクション -->
    <div class="threads-section">
      <h2>スレッド一覧</h2>
      <div class="thread-list">
        <div v-for="thread in threads" :key="thread.id" class="thread-card">
          <router-link :to="`/thread/${thread.id}`" class="thread-link">
            <h3>{{ thread.title }}</h3>
            <div class="thread-meta">
              <span>作成者: {{ thread.author }}</span>
              <span>{{ formatDate(thread.createdAt) }}</span>
            </div>
            <p class="thread-preview">{{ thread.content }}</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const threads = ref([]);
const newThread = ref({
  title: '',
  content: '',
  author: localStorage.getItem('username') || ''
});

const announcements = ref([]);
const isAdmin = ref(localStorage.getItem('role') === 'admin');
const newAnnouncement = ref({
  title: '',
  content: ''
});

const searchQuery = ref('');

const filteredThreads = computed(() => {
  if (!searchQuery.value) {
    return threads.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return threads.value.filter(thread => 
    thread.title.toLowerCase().includes(query) ||
    thread.content.toLowerCase().includes(query)
  );
});

let searchTimeout;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchThreads();
  }, 300); // 300ミリ秒のデバウンス
};

const fetchThreads = async () => {
  try {
    const response = await axios.get('http://localhost:3000/posts/threads');
    threads.value = response.data;
  } catch (error) {
    console.error('スレッド取得エラー:', error);
  }
};

const createThread = async () => {
  try {
    if (!localStorage.getItem('token')) {
      alert('投稿するにはログインが必要です');
      router.push('/login');
      return;
    }

    const response = await axios.post('http://localhost:3000/posts/threads', {
      ...newThread.value,
      author: localStorage.getItem('username') // 常にログインユーザーの名前を使用
    });
    
    await fetchThreads();
    newThread.value = {
      title: '',
      content: '',
      author: localStorage.getItem('username') || ''
    };
  } catch (error) {
    console.error('スレッド作成エラー:', error);
  }
};

const searchThreads = async () => {
  try {
    if (!searchQuery.value.trim()) {
      await fetchThreads(); 
      return;
    }
    
    const response = await axios.get(
      `http://localhost:3000/posts/threads/search/${encodeURIComponent(searchQuery.value)}`
    );
    threads.value = response.data;
  } catch (error) {
    console.error('スレッド検索エラー:', error);
    // エラーメッセージの表示
    if (error.response?.status === 404) {
      threads.value = []; // 検索結果が見つからない場合は空配列を設定
    }
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('ja-JP');
};

const fetchAnnouncements = async () => {
  try {
    const response = await axios.get('http://localhost:3000/announce/announcements');
    announcements.value = response.data;
  } catch (error) {
    console.error('お知らせ取得エラー:', error);
  }
};

const createAnnouncement = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.post(
      'http://localhost:3000/announce/announcements',
      newAnnouncement.value,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    newAnnouncement.value = { title: '', content: '' };
    await fetchAnnouncements();
  } catch (error) {
    console.error('お知らせ作成エラー:', error);
    alert(error.response?.data?.error || 'お知らせの作成に失敗しました');
  }
};

const deleteAnnouncement = async (id) => {
  if (!confirm('このお知らせを削除してもよろしいですか？')) return;
  
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3000/announce/announcements/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchAnnouncements();
  } catch (error) {
    console.error('お知らせ削除エラー:', error);
    alert(error.response?.data?.error || 'お知らせの削除に失敗しました');
  }
};

onMounted(() => {
  fetchThreads();
});
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.create-thread-section, .threads-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.thread-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

input, textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

button {
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #45a049;
}

.thread-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.thread-card {
  background: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.2s;
}

.thread-card:hover {
  transform: translateY(-2px);
}

.thread-link {
  display: block;
  padding: 15px;
  text-decoration: none;
  color: inherit;
}

.thread-meta {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.9em;
  margin: 5px 0;
}

.thread-preview {
  color: #444;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

h3 {
  margin: 0;
  color: #2c3e50;
}

.search-section {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #4CAF50;
  outline: none;
}

.search-results {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 15px;
}

.announcements-section {
  background: #fff8dc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.announcement-card {
  background: #fff;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
  position: relative;
}

.announcement-meta {
  color: #666;
  font-size: 0.9em;
  margin: 5px 0;
}

.announcement-content {
  margin-top: 10px;
  white-space: pre-wrap;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4444;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.delete-btn:hover {
  background: #cc0000;
}
</style>