<script setup>
import HelloWorld from './components/HelloWorld.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const user = ref(null);
const userType = ref(null);
const loading = ref(true);
const router = useRouter();

onMounted(() => {
  const auth = getAuth();
  const db = getFirestore();
  onAuthStateChanged(auth, async (u) => {
    user.value = u;
    if (u) {
      const userDoc = await getDoc(doc(db, 'users', u.uid));
      userType.value = userDoc.exists() ? userDoc.data().type : null;
      loading.value = false;
    } else {
      userType.value = null;
      loading.value = false;
      router.push('/login');
    }
  });
});
</script>

<template>
  <div v-if="loading">چاوەڕوان بە...</div>
  <div v-else>
    <router-view />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
