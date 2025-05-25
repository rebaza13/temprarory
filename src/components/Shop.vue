<template>
  <div class="shop-container">
    <header>
      <span>NOBEL RAYAN SHOP</span>
      <button class="logout-btn btn" @click="logout">چوونەدەرەوە</button>
    </header>
    <div class="balance card-body">
      باڵانس: <span class="fw-bold">{{ balance }}</span> IQD
    </div>
    <div class="code-input card-body">
      <input v-model="redeemInput" type="text" placeholder="کۆدی باڵانس داخل بکە" class="form-control">
      <button @click="redeemCode" class="btn btn-primary">زیادکردن</button>
    </div>
    <div class="products">
      <div v-for="(p, i) in products" :key="p.id" class="product card">
        <img :src="p.image" class="card-img-top product-image" />
        <div class="product-info card-body">
          <h3 class="card-title">{{ p.name }}</h3>
          <p class="card-text">{{ p.desc }}</p>
          <strong class="text-primary">{{ p.price }} IQD</strong>
        </div>
        <button @click="initiatePurchase(i)" class="btn btn-success w-100">کڕین</button>
      </div>
    </div>
    <div class="transactions card">
      <h2 class="card-header">مامەڵەکان</h2>
      <ul class="list-group list-group-flush">
        <li v-for="t in transactions" :key="t.time" class="list-group-item entry">
          [{{ t.time }}] {{ t.text }}
        </li>
        <li v-if="!transactions.length" class="list-group-item">هیچ مامەڵەیەک نەکراوە.</li>
      </ul>
    </div>
    <!-- Confirm Modal -->
    <div class="confirm-modal modal" v-if="showModal" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">دڵنیایت لە کڕینی ئەم بەرهەمە؟</h5>
            <button type="button" class="btn-close" @click="cancelPurchase"></button>
          </div>
          <div class="modal-body">
            <p>تکایە پشتڕاستی بکەوە کە دەتەوێت ئەم بەرهەمە بکڕیت.</p>
          </div>
          <div class="modal-footer">
            <button @click="confirmPurchase" class="btn btn-primary">دڵنیام</button>
            <button @click="cancelPurchase" class="btn btn-secondary">نەخێر</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show"></div>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const db = getFirestore();
const auth = getAuth();
const router = useRouter();
const balance = ref(0);
const redeemInput = ref('');
const products = ref([]);
const transactions = ref([]);
const showModal = ref(false);
const selectedProductIndex = ref(null);
const error = ref('');
const success = ref('');

// Load user balance, products, and transactions
onMounted(async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user logged in");
      return;
    }
    console.log("Loading data for user:", user.uid);
    
    // Load balance
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      console.log("User document found, balance:", userDoc.data().balance);
      balance.value = userDoc.data().balance ? userDoc.data().balance : 0;
    } else {
      console.log("User document not found");
      balance.value = 0;
    }
    
    // Load products (with codes)
    const productsSnap = await getDocs(collection(db, 'products'));
    products.value = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`Loaded ${products.value.length} products`);
    
    // Load transactions
    const txSnap = await getDocs(collection(db, 'users', user.uid, 'transactions'));
    transactions.value = txSnap.docs.map(d => d.data()).sort((a, b) => b.time.localeCompare(a.time));
    console.log(`Loaded ${transactions.value.length} transactions`);
  } catch (err) {
    console.error("Error loading shop data:", err);
    error.value = 'هەڵەیەک ڕوویدا لە بارکردنی زانیاریەکان';
  }
});

// Redeem balance code (search by code field, not doc id)
async function redeemCode() {
  error.value = '';
  success.value = '';
  if (!redeemInput.value) {
    error.value = 'کۆد بنووسە';
    return;
  }
  // Search for code in balanceCodes collection
  const codesSnap = await getDocs(collection(db, 'balanceCodes'));
  let foundDoc = null;
  let foundId = null;
  codesSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.code === redeemInput.value && !data.used) {
      foundDoc = data;
      foundId = docSnap.id;
    }
  });
  if (!foundDoc) {
    error.value = 'کۆدی هەڵە یان بەکارهاتووە!';
    return;
  }
  const amount = foundDoc.amount;
  // Update user balance
  const user = auth.currentUser;
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  const newBalance = (userDoc.data().balance || 0) + amount;
  await updateDoc(userRef, { balance: newBalance });
  await setDoc(doc(db, 'users', user.uid, 'transactions', Date.now().toString()), {
    text: `زیادکردنی باڵانس بە کۆدی ${redeemInput.value}`,
    time: new Date().toLocaleString()
  });
  // Mark code as used
  await updateDoc(doc(db, 'balanceCodes', foundId), { used: true, usedAt: new Date(), usedBy: user.uid });
  balance.value = newBalance;
  transactions.value.unshift({ text: `زیادکردنی باڵانس بە کۆدی ${redeemInput.value}`, time: new Date().toLocaleString() });
  redeemInput.value = '';
  success.value = 'باڵانس زیادکرا!';
}

function initiatePurchase(index) {
  selectedProductIndex.value = index;
  showModal.value = true;
}

// Buy product: use codes array from product doc
async function confirmPurchase() {
  try {
    error.value = '';
    success.value = '';
    const i = selectedProductIndex.value;
    const p = products.value[i];
    const user = auth.currentUser;
    
    if (!user) {
      error.value = 'تکایە دووبارە بچۆ ناو ئەکاونت';
      showModal.value = false;
      return;
    }
    
    if (!p.codes || !p.codes.length) {
      error.value = 'بەرهەم بەردەست نیە';
      showModal.value = false;
      return;
    }
    
    if (balance.value < p.price) {
      error.value = 'باڵانست ناکێشێت';
      showModal.value = false;
      return;
    }

    // Get the user's current balance from Firestore to ensure it's up to date
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      error.value = 'بەکارهێنەرەکەت نەدۆزرایەوە';
      showModal.value = false;
      return;
    }
    
    const currentBalance = userDoc.data().balance || 0;
    
    // Make sure balance is sufficient based on the latest data
    if (currentBalance < p.price) {
      error.value = 'باڵانست ناکێشێت';
      balance.value = currentBalance; // Update local balance to match Firestore
      showModal.value = false;
      return;
    }
    
    // Calculate new balance
    const newBalance = currentBalance - p.price;
    
    // Get code to provide to user
    const code = p.codes[0];
    const newCodes = p.codes.slice(1);
    
    // Update Firebase in sequence
    // 1. First update the product's codes
    await updateDoc(doc(db, 'products', p.id), { codes: newCodes });
    
    // 2. Then deduct balance from user
    await updateDoc(userRef, { balance: newBalance });
    
    // 3. Add transaction record
    const tx = { 
      text: `کڕینی ${p.name} بە ${p.price} IQD`, 
      time: new Date().toLocaleString(),
      productId: p.id,
      price: p.price,
      code: code
    };
    await setDoc(doc(db, 'users', user.uid, 'transactions', Date.now().toString()), tx);
    
    // Update local state
    balance.value = newBalance;
    transactions.value.unshift(tx);
    
    // Update local product codes
    products.value[i].codes = newCodes;
    
    // Show success message with the code
    showModal.value = false;
    success.value = `کۆدی بەرهەمەکەت: ${code}`;
    setTimeout(() => { success.value = ''; }, 10000);
    
    console.log("Purchase completed successfully. New balance:", newBalance);
  } catch (err) {
    console.error("Error during purchase:", err);
    error.value = 'هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵ بدەوە';
    showModal.value = false;
  }
}

function cancelPurchase() {
  showModal.value = false;
}

async function logout() {
  await signOut(auth);
  router.push('/login');
}
</script>

<style scoped>
.shop-container {
  max-width: 800px;
  margin: 2rem auto;
  background: var(--page-bg-color, #f5f6fa);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.10);
}
header {
  background: linear-gradient(to right, #0077ff, #00c6ff);
  color: white;
  padding: 1.2rem 1.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logout-btn {
  /* Base .btn styles from global CSS will apply */
  background: #fff;
  color: #0077ff;
  border: 1.5px solid #0077ff;
}
.logout-btn:hover {
  background: #0077ff;
  color: #fff;
}
.balance {
  margin-bottom: 1rem; /* Adjusted from margin: 1rem */
  font-size: 1.2rem;
  background-color: var(--card-bg-color, white);
  border-radius: var(--bs-border-radius, 0.375rem);
  padding: 1rem;
}
.code-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem; /* Adjusted from padding: 1rem */
  background-color: var(--card-bg-color, white);
  border-radius: var(--bs-border-radius, 0.375rem);
  padding: 1rem;
}

.products {
  /* padding: 1rem; Removed, handled by card */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.product.card {
  display: flex; /* Keep flex for internal layout */
  flex-direction: column; /* Stack image, body, button */
}
.product-image {
  width: 100%;
  height: 180px; /* Or aspect-ratio if preferred */
  object-fit: cover;
  border-top-left-radius: var(--bs-card-inner-border-radius, calc(0.375rem - 1px));
  border-top-right-radius: var(--bs-card-inner-border-radius, calc(0.375rem - 1px));
}
.product-info.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.product-info h3 {
  margin-bottom: 0.5rem;
}
.product-info p {
  flex-grow: 1;
  margin-bottom: 0.75rem;
}
.product-info strong {
  margin-top: auto; /* Pushes price to the bottom if card-body is flex column */
}

/* .alert classes will style error/success messages */
.alert {
  /* margin-top: 1rem; - Added via mt-3 class */
  text-align: center;
}

/* Remove old input, button, .error, .success if fully replaced by Bootstrap/global classes */

.shop-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #333;
}
</style>
