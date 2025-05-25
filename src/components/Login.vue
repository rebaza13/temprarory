<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/vite.svg" alt="App Logo" class="logo" />
      <h2>{{ isLogin ? 'چوونەژوورەوە' : 'خۆتۆمارکردن' }}</h2>
      <form @submit.prevent="isLogin ? login() : signup()" class="auth-form">
        <div class="form-group">
          <label for="email">ئیمەیڵ</label>
          <input id="email" v-model="email" type="email" required placeholder="ئیمەیڵەکەت بنووسە" />
        </div>
        <div class="form-group">
          <label for="password">وشەی نهێنی</label>
          <input id="password" v-model="password" type="password" required placeholder="وشەی نهێنی بنووسە" />
        </div>
        <button type="submit" class="btn-primary">{{ isLogin ? 'چوونەژوورەوە' : 'خۆتۆمارکردن' }}</button>
      </form>
      <p class="switch-mode">
        <span v-if="isLogin">هەژمارت نیە؟ <a href="#" @click.prevent="isLogin = false">خۆتۆمارکردن</a></span>
        <span v-else>هەژمارت هەیە؟ <a href="#" @click.prevent="isLogin = true">چوونەژوورەوە</a></span>
      </p>
      <p v-if="error" class="error-message">{{ error }}</p>
      <div class="divider"><span>یان</span></div>
      <button class="btn-secondary demo-btn" @click="demoLogin">تاقیکردنەوەی دیمۆ</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const email = ref('');
const password = ref('');
const isLogin = ref(true);
const error = ref('');
const router = useRouter();
const auth = getAuth();
const db = getFirestore();

async function waitForAuthReady() {
  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        unsubscribe();
        resolve();
      }
    });
  });
}

async function signup() {
  error.value = '';
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    // Add user to Firestore with type 'user'
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email.value,
      type: 'user',
      balance: 0,
      createdAt: new Date()
    });
    await waitForAuthReady();
    router.push('/');
  } catch (e) {
    error.value = e.message;
  }
}

async function login() {
  error.value = '';
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    // Optionally check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      error.value = 'هەژمار نەدۆزرایەوە.';
      return;
    }
    await waitForAuthReady();
    window.location.reload();
    router.push('/');
  } catch (e) {
    error.value = e.message;
  }
}

function demoLogin() {
  email.value = 'demo@demo.com';
  password.value = 'demodemo';
  isLogin.value = true;
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6f8; /* Use global background */
  padding: 1rem;
}

.auth-card {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 400px; /* Control max width for larger screens */
  text-align: center;
}

.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
}

h2 {
  margin-bottom: 1.5rem;
  color: #1a2533;
  font-weight: 700;
}

.auth-form .form-group {
  margin-bottom: 1rem;
  text-align: right;
}

.auth-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  font-size: 1.05rem;
  margin-top: 0.5rem;
}

.btn-secondary {
  width: 100%;
  padding: 0.75rem;
  font-size: 1.05rem;
  background-color: #6c757d;
}
.btn-secondary:hover {
  background-color: #5a6268;
}

.demo-btn {
  margin-top: 0.5rem;
  background-color: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}
.demo-btn:hover {
  background-color: #007bff;
  color: #fff;
}

.switch-mode {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}
.switch-mode a {
  font-weight: 700;
}

.error-message {
  color: #dc3545; /* Bootstrap danger color */
  margin-top: 1rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #adb5bd;
}
.divider span {
  padding: 0 10px;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e9ecef;
}
</style>
