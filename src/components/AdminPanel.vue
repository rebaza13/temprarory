<template>
  <div class="admin-panel">
    <button class="logout-btn" @click="logout">
      <i class="icon">🚪</i> چوونەدەرەوە
    </button>

    <!-- Product List Table -->
    <div class="product-list-table-card">
      <h2 class="product-list-title">لیستی بەرهەمەکان</h2>
      <div v-if="productsLoading" class="loading">چاوەڕوان بە...</div>
      <div v-else-if="products.length === 0" class="no-data">هیچ بەرهەمێک نەدۆزرایەوە</div>
      <div v-else class="product-list-table-wrapper">
        <table class="product-list-table">
          <thead>
            <tr>
              <th>وێنە</th>
              <th>ناو</th>
              <th>نرخ</th>
              <th>وەسف</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td><img :src="product.image" alt="product image" class="product-table-image" /></td>
              <td>{{ product.name }}</td>
              <td>{{ product.price }} IQD</td>
              <td>{{ product.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Existing code for admin panel functionalities -->
    <div class="header">
      <h1>پانێڵی ئەدمین</h1>
      <p class="subtitle">بەڕێوەبردنی شۆپ و بەرهەمەکان</p>
    </div>

    <!-- زیادکردنی بەرهەم -->
    <div class="card">
      <div class="card-header">
        <h2><i class="icon">📦</i> زیادکردنی بەرهەم</h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>ناوی بەرهەم</label>
          <input 
            type="text" 
            v-model="newProduct.name" 
            placeholder="ناوی بەرهەم بنووسە"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>وەسف</label>
          <textarea 
            v-model="newProduct.desc" 
            placeholder="وەسفی بەرهەم بنووسە"
            class="form-textarea"
          ></textarea>
        </div>
        <div class="form-group">
          <label>نرخی بەرهەم (IQD)</label>
          <input 
            type="number" 
            v-model="newProduct.price" 
            placeholder="نرخ بە دینار"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>لینکی وێنە</label>
          <input 
            type="url" 
            v-model="newProduct.image" 
            placeholder="https://example.com/image.jpg"
            class="form-input"
          >
        </div>
        <button @click="addProduct" class="btn btn-primary">
          <i class="icon">➕</i> زیادکردن
        </button>
      </div>
    </div>

    <!-- زیادکردنی کۆدی بەرهەم -->
    <div class="card">
      <div class="card-header">
        <h2><i class="icon">🔑</i> زیادکردنی کۆدی بەرهەم</h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>ناوی بەرهەم</label>
          <input 
            type="text" 
            v-model="productCodes.productName" 
            placeholder="ناوی بەرهەم بنووسە"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>لیستی کۆد (هەریەک لە سەر هێڵێک)</label>
          <textarea 
            v-model="productCodes.codes" 
            placeholder="کۆدەکان بنووسە، هەریەک لە سەر هێڵێک"
            class="form-textarea"
          ></textarea>
        </div>
        <button @click="addCodes" class="btn btn-primary">
          <i class="icon">🔑</i> زیادکردنی کۆدەکان
        </button>
      </div>
    </div>

    <!-- زیادکردنی کۆدی باڵانس -->
    <div class="card">
      <div class="card-header">
        <h2><i class="icon">💰</i> زیادکردنی کۆدی باڵانس</h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>کۆد</label>
          <input 
            type="text" 
            v-model="balanceCode.code" 
            placeholder="کۆدی باڵانس بنووسە"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>نرخی کۆد (IQD)</label>
          <input 
            type="number" 
            v-model="balanceCode.amount" 
            placeholder="نرخ بە دینار"
            class="form-input"
          >
        </div>
        <button @click="addBalanceCode" class="btn btn-primary">
          <i class="icon">💰</i> زیادکردن
        </button>
      </div>
    </div>

    <!-- سڕینەوەی بەرهەم -->
    <div class="card">
      <div class="card-header">
        <h2><i class="icon">🗑️</i> سڕینەوەی بەرهەم</h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>ناوی بەرهەم</label>
          <input 
            type="text" 
            v-model="deleteProductName" 
            placeholder="ناوی بەرهەم بۆ سڕینەوە"
            class="form-input"
          >
        </div>
        <button @click="deleteProduct" class="btn btn-danger">
          <i class="icon">🗑️</i> سڕینەوە
        </button>
      </div>
    </div>

    <!-- ڕەشکردنەوەی هەموو بەرهەمەکان -->
    <div class="card">
      <div class="card-header">
        <h2><i class="icon">🧹</i> ڕەشکردنەوەی هەموو بەرهەمەکان</h2>
      </div>
      <div class="card-body">
        <p class="warning-text">ئەم کردارە هەموو بەرهەمەکان دەسڕێتەوە!</p>
        <button @click="clearProducts" class="btn btn-danger">
          <i class="icon">🧹</i> ڕەشکردنەوەی هەموو
        </button>
      </div>
    </div>

    <!-- بینینی ئەکاونتەکان -->
    <div class="card">
      <div class="card-header">
        <h2><i class="icon">👥</i> ئەکاونتە تۆمارکراوەکان</h2>
        <button @click="loadAccounts" class="btn btn-secondary btn-sm">
          <i class="icon">🔄</i> نوێکردنەوە
        </button>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading">
          <p>چاوەڕوان بە...</p>
        </div>
        <div v-else-if="accounts.length === 0" class="no-data">
          <p>هیچ ئەکاونتێک نەدۆزرایەوە</p>
        </div>
        <div v-else class="accounts-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ئیمەیڵ</th>
                <th>باڵانس</th>
                <th>بەروار</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(account, index) in accounts" :key="account.id">
                <td>{{ index + 1 }}</td>
                <td>{{ account.email }}</td>
                <td>{{ account.balance || 0 }} IQD</td>
                <td>{{ formatDate(account.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- پەیامی سەرکەوتن/هەڵە -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { getAuth, signOut } from 'firebase/auth'
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  updateDoc,
  arrayUnion 
} from 'firebase/firestore'

export default {
  name: 'AdminPanel',
  setup() {
    // Reactive data
    const newProduct = ref({
      name: '',
      desc: '',
      price: null,
      image: ''
    })

    const productCodes = ref({
      productName: '',
      codes: ''
    })

    const balanceCode = ref({
      code: '',
      amount: null
    })

    const deleteProductName = ref('')
    const accounts = ref([])
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('success')
    const products = ref([])
    const productsLoading = ref(true)

    // Utility functions
    const showMessage = (text, type = 'success') => {
      message.value = text
      messageType.value = type
      setTimeout(() => {
        message.value = ''
      }, 3000)
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return 'نەزانراو'
      return new Date(timestamp.toDate()).toLocaleDateString('ku')
    }

    // Product management functions
    const addProduct = async () => {
      try {
        if (!newProduct.value.name || !newProduct.value.desc || !newProduct.value.price || !newProduct.value.image) {
          showMessage('تکایە هەموو خانەکان پڕبکەوە', 'error')
          return
        }

        // Check if product already exists
        const q = query(collection(db, 'products'), where('name', '==', newProduct.value.name))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          showMessage('ئەم بەرهەمە پێشتر تۆمارکراوە', 'error')
          return
        }

        await addDoc(collection(db, 'products'), {
          ...newProduct.value,
          createdAt: new Date()
        })

        showMessage('بەرهەم بە سەرکەوتووی زیادکرا')
        
        // Reset form
        newProduct.value = {
          name: '',
          desc: '',
          price: null,
          image: ''
        }
      } catch (error) {
        console.error('Error adding product:', error)
        showMessage('هەڵەیەک ڕوویدا لە زیادکردنی بەرهەم', 'error')
      }
    }

    const addCodes = async () => {
      try {
        if (!productCodes.value.productName || !productCodes.value.codes.trim()) {
          showMessage('تکایە خانەکان پڕبکەوە', 'error')
          return
        }

        const codes = productCodes.value.codes.trim().split('\n').filter(code => code.trim())
        
        if (codes.length === 0) {
          showMessage('تکایە کۆدەکان بنووسە', 'error')
          return
        }

        // Check if product exists and get its document
        const q = query(collection(db, 'products'), where('name', '==', productCodes.value.productName))
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          showMessage('بەرهەمی دیاریکراو نەدۆزرایەوە', 'error')
          return
        }

        const productDoc = querySnapshot.docs[0]
        
        // Add codes to the product document
        await updateDoc(productDoc.ref, {
          codes: arrayUnion(...codes)
        })

        showMessage(`${codes.length} کۆد زیادکران`)
        
        // Reset form
        productCodes.value = {
          productName: '',
          codes: ''
        }
      } catch (error) {
        console.error('Error adding codes:', error)
        showMessage('هەڵەیەک ڕوویدا لە زیادکردنی کۆدەکان', 'error')
      }
    }

    const addBalanceCode = async () => {
      try {
        if (!balanceCode.value.code || !balanceCode.value.amount) {
          showMessage('تکایە خانەکان پڕبکەوە', 'error')
          return
        }

        // Check if balance code already exists
        const q = query(collection(db, 'balanceCodes'), where('code', '==', balanceCode.value.code))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          showMessage('ئەم کۆدە پێشتر تۆمارکراوە', 'error')
          return
        }

        await addDoc(collection(db, 'balanceCodes'), {
          code: balanceCode.value.code,
          amount: balanceCode.value.amount,
          used: false,
          createdAt: new Date()
        })

        showMessage('کۆدی باڵانس زیادکرا')
        
        // Reset form
        balanceCode.value = {
          code: '',
          amount: null
        }
      } catch (error) {
        console.error('Error adding balance code:', error)
        showMessage('هەڵەیەک ڕوویدا لە زیادکردنی کۆدی باڵانس', 'error')
      }
    }

    const deleteProduct = async () => {
      try {
        if (!deleteProductName.value.trim()) {
          showMessage('تکایە ناوی بەرهەم بنووسە', 'error')
          return
        }

        const q = query(collection(db, 'products'), where('name', '==', deleteProductName.value))
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          showMessage('بەرهەمی دیاریکراو نەدۆزرایەوە', 'error')
          return
        }

        const productDoc = querySnapshot.docs[0]
        await deleteDoc(productDoc.ref)

        showMessage('بەرهەم سڕایەوە')
        deleteProductName.value = ''
      } catch (error) {
        console.error('Error deleting product:', error)
        showMessage('هەڵەیەک ڕوویدا لە سڕینەوەی بەرهەم', 'error')
      }
    }

    const clearProducts = async () => {
      try {
        if (!confirm('دڵنیایت دەتەوێت هەموو بەرهەمەکان ڕەش بکەیتەوە؟')) {
          return
        }

        const querySnapshot = await getDocs(collection(db, 'products'))
        
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)

        showMessage('هەموو بەرهەمەکان ڕەشکرانەوە')
      } catch (error) {
        console.error('Error clearing products:', error)
        showMessage('هەڵەیەک ڕوویدا لە ڕەشکردنەوەی بەرهەمەکان', 'error')
      }
    }

    const loadAccounts = async () => {
      try {
        loading.value = true
        const querySnapshot = await getDocs(collection(db, 'users'))
        accounts.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error loading accounts:', error)
        showMessage('هەڵەیەک ڕوویدا لە بارکردنی ئەکاونتەکان', 'error')
      } finally {
        loading.value = false
      }
    }

    const fetchProducts = async () => {
      productsLoading.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'products'))
        products.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      } catch (e) {
        products.value = []
      } finally {
        productsLoading.value = false
      }
    }

    const logout = async () => {
      try {
        const auth = getAuth();
        await signOut(auth);
      } catch (e) {
        // ignore error, still redirect
      }
      window.location.href = '/login';
    };

    // Load accounts and products on component mount
    onMounted(() => {
      loadAccounts()
      fetchProducts()
    })

    return {
      newProduct,
      productCodes,
      balanceCode,
      deleteProductName,
      accounts,
      loading,
      message,
      messageType,
      products,
      productsLoading,
      addProduct,
      addCodes,
      addBalanceCode,
      deleteProduct,
      clearProducts,
      loadAccounts,
      formatDate,
      logout
    }
  }
}
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  direction: rtl;
  text-align: right;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: #f8fafc;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
}

.btn-danger:hover {
  box-shadow: 0 6px 20px rgba(238, 90, 82, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
}

.warning-text {
  color: #e53e3e;
  font-weight: 600;
  margin-bottom: 16px;
  padding: 12px;
  background: #fed7d7;
  border-radius: 8px;
  border-left: 4px solid #e53e3e;
}

.accounts-table {
  overflow-x: auto;
}

.accounts-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.accounts-table th,
.accounts-table td {
  padding: 12px 16px;
  text-align: right;
  border-bottom: 1px solid #e2e8f0;
}

.accounts-table th {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
}

.accounts-table tr:hover {
  background-color: #f8fafc;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px;
  color: #718096;
  font-size: 1.1rem;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 600;
  color: white;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.message.success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.message.error {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
}

.icon {
  font-size: 1.2em;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .admin-panel {
    padding: 16px;
  }
  
  .header {
    padding: 20px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .accounts-table {
    font-size: 0.9rem;
  }
  
  .message {
    right: 16px;
    left: 16px;
  }
}

.logout-btn {
  position: absolute;
  top: 24px;
  left: 24px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 10;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(238, 90, 82, 0.4);
}

.product-list-table-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 32px;
  padding: 24px;
}

.product-list-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 18px;
}

.product-list-table-wrapper {
  overflow-x: auto;
}

.product-list-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
}

.product-list-table th, .product-list-table td {
  padding: 12px 16px;
  text-align: right;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.product-list-table th {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  font-weight: 600;
  color: #2d3748;
  font-size: 0.98rem;
}

.product-list-table tr:hover {
  background-color: #f8fafc;
}

.product-table-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
  background: #e2e8f0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
</style>