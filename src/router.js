import { createRouter, createWebHashHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./components/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('./components/AdminPanel.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('./components/Shop.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/login',
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const auth = getAuth();
  const db = getFirestore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  // Wait for Firebase Auth to initialize
  const getCurrentUser = () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  };

  const user = await getCurrentUser();

  if (!user && requiresAuth) {
    next('/login');
    return;
  }

  if (user && to.path === '/login') {
    // Check user type and redirect accordingly
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().type === 'admin') {
      next('/admin');
      return;
    } else {
      next('/shop');
      return;
    }
  }

  if (requiresAdmin) {
    if (!user) {
      next('/login');
      return;
    }
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().type !== 'admin') {
      next('/shop');
      return;
    }
  }

  if (requiresAuth && user) {
    // If user is admin and tries to access /shop, redirect to /admin
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().type === 'admin' && to.path === '/shop') {
      next('/admin');
      return;
    }
  }

  next();
});

export default router;
