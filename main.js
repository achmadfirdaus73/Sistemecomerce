import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
        import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
        import { getFirestore, doc, getDoc, setDoc, updateDoc, addDoc, collection, onSnapshot, query, where, writeBatch, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyCxJsjO39UnnEBzJ_OrUb_kH2InwNRDTdU",
            authDomain: "ecomercee-28797.firebaseapp.com",
            projectId: "ecomercee-28797",
            storageBucket: "ecomercee-28797.appspot.com",
            messagingSenderId: "53572493438",
            appId: "1:53572493438:web:23608b2d75f81f7e70b82f",
        };
        const firebaseApp = initializeApp(firebaseConfig);
        const auth = getAuth(firebaseApp);
        const db = getFirestore(firebaseApp);

        const { createApp, ref, reactive, computed, watch, onMounted } = Vue;
        const { createVuetify, useDisplay } = Vuetify;
        const vuetify = createVuetify();

        // =================================================================
        // KOMPONEN-KOMPONEN VUE
        // =================================================================

        const PromoCarousel = {
            props: ['promos'],
            template: `<v-carousel v-if="promos && promos.length" cycle height="250" hide-delimiter-background show-arrows="hover" class="rounded-lg mb-4"><v-carousel-item v-for="promo in promos" :key="promo.id"><v-responsive v-if="promo.type === 'video'" :aspect-ratio="16/9"><iframe :src="promo.url" width="100%" height="100%" style="border:0;" allowfullscreen></iframe></v-responsive><v-img v-else :src="promo.url" height="100%" cover></v-img></v-carousel-item></v-carousel>`
        };

        const helpers = { methods: { formatTimestamp(ts) { return ts ? new Date(ts.toDate()).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : 'Baru saja'; }, statusColor(status) { return ({ 'Proses': 'orange', 'Pengiriman': 'blue', 'Terkirim': 'cyan', 'Lunas': 'green' }[status] || 'grey'); }, parseIndonesianDate(dateString) { if (!dateString) return null; const months = { 'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11 }; const parts = dateString.split(' '); if (parts.length < 3) return null; const day = parseInt(parts[0], 10), month = months[parts[1]], year = parseInt(parts[2], 10); return (!isNaN(day) && month !== undefined && !isNaN(year)) ? new Date(year, month, day) : null; } } };
        const LoginPage = { props: ['loading', 'errorMessage'], emits: ['login', 'register', 'error'], template: `<div v-if="showSplash" class="d-flex flex-column justify-center align-center" style="height: 100vh; background-color: white;"><v-img src="https://raw.githubusercontent.com/achmadfirdaus73/firdaus/refs/heads/main/DT_G18_E-commerce-Animated-GIF-Icon.gif" alt="Loading..." width="350" height="300" contain></v-img><p class="text-grey mt-4">Loading e-commerce...</p></div><v-container v-else class="fill-height" fluid><v-row align="center" justify="center"><v-col cols="12" sm="8" md="4"><v-card class="elevation-12 pa-2"><v-toolbar color="teal" dark flat><v-toolbar-title class="d-flex align-center"><v-icon class="mr-2">mdi-truck-fast</v-icon>{{ isRegister ? 'Daftar Akun Baru' : 'Selamat Datang!' }}</v-toolbar-title></v-toolbar><v-card-text class="pt-4"><v-form ref="form" @submit.prevent="handleSubmit"><v-text-field v-model="email" label="Alamat E-mail" prepend-inner-icon="mdi-email" type="email" variant="outlined" required :rules="[rules.required, rules.email]"></v-text-field><v-text-field v-model="password" label="Password" prepend-inner-icon="mdi-lock" :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showPassword = !showPassword" variant="outlined" required :rules="[rules.required, rules.min6]"></v-text-field><v-text-field v-if="isRegister" v-model="confirmPassword" label="Konfirmasi Password" prepend-inner-icon="mdi-lock-check" type="password" variant="outlined" required :rules="[rules.required, rules.passwordMatch]"></v-text-field><v-alert v-if="errorMessage" type="error" dense class="mb-4" :text="errorMessage"></v-alert></v-form></v-card-text><v-card-actions class="d-flex flex-column px-4 pb-4"><v-btn :loading="loading" color="teal" @click="handleSubmit" block size="large">{{ isRegister ? 'Daftar' : 'Login' }}</v-btn><v-btn variant="plain" class="mt-2" @click="isRegister = !isRegister; $emit('error', '')">{{ isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar' }}</v-btn></v-card-actions></v-card></v-col></v-row></v-container>`, data: () => ({ showSplash: true, isRegister: false, email: '', password: '', confirmPassword: '', showPassword: false }), computed: { rules() { return { required: v => !!v || 'Wajib diisi', min6: v => (v && v.length >= 6) || 'Minimal 6 karakter', email: v => /.+@.+\..+/.test(v) || 'E-mail tidak valid', passwordMatch: v => v === this.password || 'Password tidak cocok' } } }, methods: { async handleSubmit() { const { valid } = await this.$refs.form.validate(); if (!valid) return; this.$emit('error', ''); if (this.isRegister) this.$emit('register', { email: this.email, password: this.password }); else this.$emit('login', { email: this.email, password: this.password }); } }, mounted() { setTimeout(() => { this.showSplash = false; }, 2000); } };
        const ProfileForm = { props: ['user', 'loading'], emits: ['save'], template: `<v-container class="fill-height"><v-row align="center" justify="center"><v-col cols="12" md="8" lg="6"><v-card><v-card-title class="text-h5">Lengkapi Profil Anda</v-card-title><v-card-subtitle>Data ini diperlukan untuk melanjutkan pemesanan.</v-card-subtitle><v-form ref="form" @submit.prevent="submitProfile"><v-card-text><v-row><v-col cols="12" sm="6"><v-text-field v-model="profile.namaLengkap" label="Nama Lengkap" :rules="[rules.required]"></v-text-field></v-col><v-col cols="12" sm="6"><v-text-field v-model="profile.jenisUsaha" label="Jenis Usaha" :rules="[rules.required]"></v-text-field></v-col><v-col cols="12"><v-textarea v-model="profile.alamatRumah" label="Alamat Rumah" rows="2" :rules="[rules.required]"></v-textarea></v-col><v-col cols="12"><v-textarea v-model="profile.alamatUsaha" label="Alamat Usaha" rows="2" :rules="[rules.required]"></v-textarea></v-col><v-col cols="12" sm="6"><v-text-field v-model="profile.noHape" label="No. HP (WhatsApp)" type="tel" :rules="[rules.required]"></v-text-field></v-col><v-col cols="12" sm="6"><v-text-field v-model="profile.nomorKtp" label="No. KTP" type="number" :rules="[rules.required]"></v-text-field></v-col><v-col cols="12"><v-text-field v-model="profile.namaSales" label="Nama Sales (Jika ada)"></v-text-field></v-col></v-row></v-card-text><v-card-actions class="pa-4"><v-spacer></v-spacer><v-btn color="primary" size="large" type="submit" :loading="loading">Simpan Profil</v-btn></v-card-actions></v-form></v-card></v-col></v-row></v-container>`, data() { return { profile: { namaLengkap: this.user.namaLengkap || this.user.email || '', jenisUsaha: this.user.jenisUsaha || '', alamatRumah: this.user.alamatRumah || '', alamatUsaha: this.user.alamatUsaha || '', noHape: this.user.noHape || '', nomorKtp: this.user.nomorKtp || '', namaSales: this.user.namaSales || '' }, rules: { required: v => !!v || 'Wajib diisi' } } }, methods: { async submitProfile() { const { valid } = await this.$refs.form.validate(); if (valid) this.$emit('save', this.profile); } } };
        
        const KonsumenDashboard = {
            props: ['user', 'appData', 'activeItem'],
            emits: ['logout', 'action', 'update:activeItem'],
            mixins: [helpers],
            components: { 'promo-carousel': PromoCarousel },
            template: `
                <v-container>
                    <v-text-field v-if="localActiveItem === 'produk'" v-model="searchTerm" placeholder="Cari produk..." prepend-inner-icon="mdi-magnify" variant="solo" clearable class="my-4"></v-text-field>
                    <v-window v-model="localActiveItem">
                        <v-window-item value="produk">
                            <promo-carousel :promos="appData.promos" />
                            <h2 class="text-h5 my-4 d-flex align-center"><v-icon start>mdi-store</v-icon>Etalase Produk</h2>
                            <v-row>
                                <v-col v-for="product in filteredProducts" :key="product.id" cols="12" sm="6" md="4">
                                    <v-card hover @click="openProductModal(product)">
                                        <v-img :src="product.images[0]" height="200px" cover></v-img>
                                        <v-card-title>{{ product.name }}</v-card-title>
                                        <v-card-subtitle>Mulai dari Rp {{ calculateMinInstallment(product).toLocaleString('id-ID') }}/hari</v-card-subtitle>
                                        <v-card-actions><v-chip color="teal" variant="flat">Lihat Opsi Angsuran</v-chip></v-card-actions>
                                    </v-card>
                                </v-col>
                                <v-col v-if="filteredProducts.length === 0" cols="12"><v-alert type="info">Tidak ada produk yang cocok.</v-alert></v-col>
                            </v-row>
                        </v-window-item>
                        <v-window-item value="keranjang">
                            <h2 class="text-h5 my-4 d-flex align-center"><v-icon start>mdi-cart</v-icon>Keranjang Saya</h2>
                            <v-card v-if="appData.cartItems.length > 0">
                                <v-list lines="two">
                                    <v-list-item v-for="(item, i) in appData.cartItems" :key="item.cartId" :prepend-avatar="item.product.images[0]" :title="item.product.name">
                                        <template v-slot:subtitle><div>Tenor {{ item.tenor }} hari @ Rp {{ item.installmentPrice.toLocaleString('id-ID') }}/{{ item.paymentFrequency }}</div></template>
                                        <template v-slot:append><v-btn icon="mdi-delete" variant="text" color="red" @click="removeFromCart(item.cartId)"></v-btn></template>
                                    </v-list-item>
                                </v-list>
                                <v-divider></v-divider>
                                <v-card-actions class="pa-4"><v-spacer></v-spacer><v-btn size="large" color="primary" @click="checkoutModal = true">Checkout ({{ appData.cartItems.length }})</v-btn></v-card-actions>
                            </v-card>
                            <v-alert v-else type="info">Keranjang Anda masih kosong.</v-alert>
                        </v-window-item>
                        <v-window-item value="order">
                            <h2 class="text-h5 my-4 d-flex align-center"><v-icon start>mdi-receipt-text</v-icon>Riwayat Pesanan</h2>
                            <v-list lines="two" v-if="userOrders.length > 0">
                                <v-list-item v-for="order in userOrders" :key="order.id" :title="order.productName" :subtitle="order.date">
                                    <template v-slot:append><v-chip :color="statusColor(order.status)" variant="flat" size="small">{{ order.status }}</v-chip></template>
                                </v-list-item>
                            </v-list>
                            <v-alert v-else type="info">Anda belum memiliki riwayat pesanan.</v-alert>
                        </v-window-item>
                        <v-window-item value="pemberitahuan">
                            <h2 class="text-h5 my-4 d-flex align-center"><v-icon start>mdi-bell</v-icon>Pemberitahuan</h2>
                            <v-list lines="two" v-if="appData.broadcasts.length > 0">
                                <v-list-item v-for="msg in appData.broadcasts" :key="msg.id" :title="msg.message" :subtitle="formatTimestamp(msg.timestamp)"></v-list-item>
                            </v-list>
                            <v-alert v-else type="info">Tidak ada pemberitahuan baru.</v-alert>
                        </v-window-item>
                        <v-window-item value="profile">
                            <h2 class="text-h5 my-4 d-flex align-center"><v-icon start>mdi-account-circle</v-icon>Profil & Tagihan</h2>
                            <v-card class="mb-4">
                                <v-list>
                                    <v-list-item prepend-icon="mdi-account" title="Nama" :subtitle="user.namaLengkap"></v-list-item>
                                    <v-list-item prepend-icon="mdi-briefcase" title="Jenis Usaha" :subtitle="user.jenisUsaha"></v-list-item>
                                    <v-list-item prepend-icon="mdi-home" title="Alamat Rumah" :subtitle="user.alamatRumah"></v-list-item>
                                    <v-list-item prepend-icon="mdi-phone" title="No. HP" :subtitle="user.noHape"></v-list-item>
                                </v-list>
                                <v-card-actions><v-btn color="red" @click="$emit('logout')" class="ma-2">Logout</v-btn></v-card-actions>
                            </v-card>
                            <h3 class="text-h6 mb-2">Tagihan Aktif</h3>
                            <v-list v-if="activeBills.length > 0">
                                <v-list-item v-for="bill in activeBills" :key="bill.id" :title="bill.productName" @click="openBillModal(bill)">
                                    <template v-slot:subtitle>Angsuran Rp {{bill.installmentPrice.toLocaleString('id-ID')}}</template>
                                    <template v-slot:append><v-icon>mdi-chevron-right</v-icon></template>
                                </v-list-item>
                            </v-list>
                            <v-alert v-else type="info">Tidak ada tagihan aktif.</v-alert>
                        </v-window-item>
                    </v-window>
                </v-container>
                <v-dialog v-model="productModal" max-width="800px">
                    <v-card v-if="selectedProduct">
                        <v-toolbar color="primary" dark><v-toolbar-title>{{ selectedProduct.name }}</v-toolbar-title><v-spacer></v-spacer><v-btn icon="mdi-close" @click="productModal=false"></v-btn></v-toolbar>
                        <v-card-text class="pa-4">
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-img :src="activeImage" class="rounded-lg" height="300" cover></v-img>
                                    <div class="thumbnail-gallery">
                                        <img v-for="(img, i) in selectedProduct.images" :key="i" :src="img" :class="['thumbnail', { 'active-thumbnail': img === activeImage }]" @click="activeImage = img" />
                                    </div>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <p class="body-1 mb-4">{{ selectedProduct.description }}</p>
                                    <v-select v-model="selectedTenor" :items="tenorOptions" item-title="text" item-value="days" label="Pilih Tenor"></v-select>
                                    <v-radio-group v-model="paymentFrequency" inline label="Frekuensi Bayar">
                                        <v-radio label="Harian" value="harian"></v-radio>
                                        <v-radio label="Mingguan (6 hari)" value="mingguan"></v-radio>
                                    </v-radio-group>
                                    <v-alert color="green-lighten-5" class="mt-4">
                                        <div class="text-h6 text-green-darken-2">Angsuran Anda</div>
                                        <div class="text-h5 font-weight-bold text-green-darken-4">Rp {{ calculatedInstallment.toLocaleString('id-ID') }} / {{ paymentFrequency }}</div>
                                    </v-alert>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions class="pa-4">
                            <v-spacer></v-spacer>
                            <v-btn variant="text" @click="productModal=false">Batal</v-btn>
                            <v-btn color="primary" size="large" @click="addToCart"><v-icon start>mdi-cart-plus</v-icon>Tambah ke Keranjang</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="checkoutModal" max-width="500px">
                    <v-card>
                        <v-card-title>Konfirmasi Alamat Pengiriman</v-card-title>
                        <v-card-text>
                            <v-radio-group v-model="selectedAddress">
                                <v-radio value="rumah"><template v-slot:label><div><strong>Alamat Rumah</strong><p>{{ user.alamatRumah }}</p></div></template></v-radio>
                                <v-radio value="usaha"><template v-slot:label><div><strong>Alamat Usaha</strong><p>{{ user.alamatUsaha }}</p></div></template></v-radio>
                            </v-radio-group>
                        </v-card-text>
                        <v-card-actions><v-spacer></v-spacer><v-btn @click="checkoutModal=false">Batal</v-btn><v-btn color="primary" @click="confirmCheckout">Konfirmasi Pesanan</v-btn></v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="billModal" max-width="600px">
                    <v-card v-if="selectedBill">
                        <v-card-title>Detail Tagihan: {{ selectedBill.productName }}</v-card-title>
                        <v-card-text>
                            <v-list-item class="px-0">
                                <template v-slot:prepend><v-icon>mdi-information-outline</v-icon></template>
                                <v-list-item-title>Info Tagihan</v-list-item-title>
                                <v-list-item-subtitle>
                                    <div>Angsuran: Rp {{ selectedBill.installmentPrice.toLocaleString('id-ID') }} / {{ selectedBill.paymentFrequency }}</div>
                                    <div v-if="selectedBill.tanggalLunas" class="text-blue-darken-2 mt-1"><v-icon start size="small">mdi-calendar-check</v-icon>Estimasi Lunas: {{ selectedBill.tanggalLunas }}</div>
                                    <v-chip v-if="lateDaysCount > 0" color="red" size="small" class="mt-1" prepend-icon="mdi-alert-circle">Telat {{ lateDaysCount }} hari</v-chip>
                                </template>
                            </v-list-item>
                            <p class="mt-2"><strong>Progress:</strong> {{ (selectedBill.payments || []).length }} / {{ selectedBill.tenor }}</p>
                            <v-progress-linear :model-value="billProgress" color="teal" height="20" rounded class="my-4"><strong>{{ Math.ceil(billProgress) }}%</strong></v-progress-linear>
                            <h4 class="text-h6 mt-4">Riwayat Kunjungan & Pembayaran</h4>
                            <v-timeline v-if="combinedHistory.length > 0" side="end" density="compact" class="mt-2" style="max-height: 200px; overflow-y: auto;">
                                <v-timeline-item v-for="(item, i) in combinedHistory" :key="i" :dot-color="item.status === 'paid' ? 'green' : 'red'" :icon="item.status === 'paid' ? 'mdi-check-circle' : 'mdi-alert-circle'" size="small">
                                    <div><strong>{{ item.date }} - {{ item.time }}</strong></div>
                                    <div v-if="item.status === 'paid'">Pembayaran diterima oleh {{ item.collectedBy }}</div>
                                    <div v-else>Kunjungan Penagihan (Telat Bayar)</div>
                                </v-timeline-item>
                            </v-timeline>
                            <v-alert v-else type="info" class="mt-2">Belum ada riwayat kunjungan.</v-alert>
                        </v-card-text>
                        <v-card-actions><v-spacer></v-spacer><v-btn color="primary" @click="billModal=false">Tutup</v-btn></v-card-actions>
                    </v-card>
                </v-dialog>
            `,
            setup(props, { emit }) {
                const localActiveItem = computed({ get: () => props.activeItem, set: (value) => emit('update:activeItem', value) });
                const searchTerm = ref('');
                const productModal = ref(false); const selectedProduct = ref(null); const activeImage = ref(''); const selectedTenor = ref(60); const paymentFrequency = ref('harian');
                const checkoutModal = ref(false); const selectedAddress = ref('rumah');
                const billModal = ref(false); const selectedBill = ref(null);
                const tenorOptions = [ { days: 60, multiplier: 1.20, text: '60 Hari' }, { days: 90, multiplier: 1.25, text: '90 Hari' }, { days: 120, multiplier: 1.30, text: '120 Hari' }, { days: 150, multiplier: 1.35, text: '150 Hari' }, { days: 180, multiplier: 1.40, text: '180 Hari' } ];
                
                const customRound = (price) => {
                    const base = Math.floor(price / 1000) * 1000;
                    const hundreds = price % 1000;
                    if (hundreds === 0) return price;
                    if (hundreds > 0 && hundreds <= 700) return base + 500;
                    return base + 1000;
                };

                const filteredProducts = computed(() => { if (!props.appData.products) return []; return props.appData.products.filter(p => p.name.toLowerCase().includes(searchTerm.value.toLowerCase())); });
                const userOrders = computed(() => (props.appData.orders || []).filter(o => o.userId === props.user?.uid).sort((a,b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0)));
                const activeBills = computed(() => (userOrders.value || []).filter(o => o.status === 'Terkirim' && o.payments.length < o.tenor));
                const calculatedInstallment = computed(() => { if (!selectedProduct.value) return 0; const option = tenorOptions.find(o => o.days === selectedTenor.value); if (!option) return 0; const rawDailyPrice = (selectedProduct.value.hargaModal * option.multiplier) / option.days; const roundedDailyPrice = customRound(rawDailyPrice); return paymentFrequency.value === 'mingguan' ? roundedDailyPrice * 6 : roundedDailyPrice; });
                const billProgress = computed(() => { if (!selectedBill.value) return 0; const payments = (selectedBill.value.payments || []).length; const tenor = selectedBill.value.tenor; return tenor > 0 ? (payments / tenor) * 100 : 0; });
                const combinedHistory = computed(() => { if (!selectedBill.value) return []; const payments = (selectedBill.value.payments || []).map(p => ({ ...p, status: 'paid', sortDate: helpers.methods.parseIndonesianDate(p.date) })); const notes = (selectedBill.value.collectionNotes || []).map(n => ({ ...n, status: 'unpaid', sortDate: helpers.methods.parseIndonesianDate(n.date) })); return [...payments, ...notes].sort((a, b) => b.sortDate - a.sortDate); });
                const lateDaysCount = computed(() => {
                    if (!selectedBill.value || selectedBill.value.status !== 'Terkirim') return 0;
                    const startDate = selectedBill.value.timestamp?.toDate();
                    if (!startDate) return 0;
                    let expectedPayments = 0; let currentDate = new Date(startDate); const today = new Date();
                    while(currentDate <= today) {
                        const dayOfWeek = currentDate.getDay(); const dateString = currentDate.toISOString().split('T')[0];
                        if (dayOfWeek !== 0 && !props.appData.holidays.includes(dateString)) expectedPayments++;
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                    const actualPayments = (selectedBill.value.payments || []).length;
                    const lateDays = expectedPayments - actualPayments;
                    return lateDays > 0 ? lateDays : 0;
                });
                const openProductModal = (product) => { selectedProduct.value = product; activeImage.value = product.images[0] || ''; selectedTenor.value = 60; paymentFrequency.value = 'harian'; productModal.value = true; };
                const addToCart = () => { emit('action', { type: 'add-to-cart', payload: { product: selectedProduct.value, tenor: selectedTenor.value, paymentFrequency: paymentFrequency.value, installmentPrice: calculatedInstallment.value, cartId: Date.now() } }); productModal.value = false; };
                const removeFromCart = (cartId) => { emit('action', { type: 'remove-from-cart', payload: cartId }); };
                const confirmCheckout = () => { const shippingAddress = selectedAddress.value === 'rumah' ? props.user.alamatRumah : props.user.alamatUsaha; emit('action', { type: 'new-order', payload: { shippingAddress } }); checkoutModal.value = false; localActiveItem.value = 'order'; };
                const openBillModal = (bill) => { selectedBill.value = bill; billModal.value = true; };
                const calculateMinInstallment = (product) => { const option = tenorOptions[0]; const rawDailyPrice = (product.hargaModal * option.multiplier) / option.days; return customRound(rawDailyPrice); };
                return { localActiveItem, searchTerm, productModal, selectedProduct, activeImage, selectedTenor, paymentFrequency, checkoutModal, selectedAddress, billModal, selectedBill, tenorOptions, filteredProducts, userOrders, activeBills, calculatedInstallment, billProgress, combinedHistory, lateDaysCount, openProductModal, addToCart, removeFromCart, confirmCheckout, openBillModal, calculateMinInstallment };
            }
        };

        const AdminDashboard = {
            props: ['user', 'appData', 'activeItem'],
            emits: ['logout', 'action', 'update:activeItem'],
            mixins: [helpers],
            components: { 'promo-carousel': PromoCarousel },
            template: `
                <v-layout>
                    <v-navigation-drawer v-model="drawer" :permanent="!isMobile">
                        <v-list-item :title="user.email" subtitle="Administrator"></v-list-item>
                        <v-divider></v-divider>
                        <v-list nav v-model:selected="localActiveItem">
                            <v-list-item v-for="item in menuItems" :key="item.value" :prepend-icon="item.icon" :title="item.text" :value="item.value"></v-list-item>
                        </v-list>
                        <template v-slot:append><div class="pa-2"><v-btn block color="red" @click="$emit('logout')">Logout</v-btn></div></template>
                    </v-navigation-drawer>
                    <v-main>
                        <v-container fluid>
                            <v-btn v-if="isMobile" icon="mdi-menu" @click.stop="drawer = !drawer" variant="text" class="ma-2"></v-btn>
                            <v-window v-model="localActiveItem">
                                <v-window-item value="produk">
                                    <v-row>
                                        <v-col v-for="stat in stats" :key="stat.title" cols="6" md="3"><v-card><v-card-text class="text-center"><div class="text-h4">{{ stat.value }}</div><div class="text-subtitle-1">{{ stat.title }}</div></v-card-text></v-card></v-col>
                                    </v-row>
                                    <h3 class="text-h6 my-4">Gambar Carousel</h3>
                                    <promo-carousel :promos="appData.promos" />
                                    <v-row>
                                        <v-col cols="12" md="6"><v-card><v-card-title>Tambah Produk Baru</v-card-title><v-card-text><v-form ref="newProductForm" @submit.prevent="addProduct"><v-text-field v-model="newProduct.name" label="Nama Barang"></v-text-field><v-textarea v-model="newProduct.description" label="Deskripsi" rows="2"></v-textarea><v-text-field v-model.number="newProduct.hargaModal" label="Harga Modal" type="number"></v-text-field><v-textarea v-model="newProduct.images" label="URL Foto (pisahkan dgn koma)" rows="2"></v-textarea><v-btn type="submit" color="primary">Tambah Produk</v-btn></v-form></v-card-text></v-card></v-col>
                                        <v-col cols="12" md="6"><v-card><v-card-title>Tambah Konten Carousel</v-card-title><v-card-text><v-form ref="newPromoForm" @submit.prevent="addPromo"><v-select v-model="newPromo.type" :items="['image', 'video']" label="Tipe Konten"></v-select><v-text-field v-model="newPromo.url" label="URL Konten"></v-text-field><v-btn type="submit" color="teal">Tambah Konten</v-btn></v-form></v-card-text></v-card></v-col>
                                    </v-row>
                                    <h3 class="text-h6 my-4">Daftar Semua Produk</h3>
                                    <v-row><v-col v-for="p in appData.products" :key="p.id" cols="12" sm="6" md="4" lg="3"><v-card><v-img :src="p.images[0]" height="150px" cover></v-img><v-card-title>{{ p.name }}</v-card-title><v-card-subtitle>Rp {{ (p.hargaModal || 0).toLocaleString('id-ID') }}</v-card-subtitle><v-card-actions><v-spacer></v-spacer><v-btn color="primary" @click="openEditProduct(p)">Edit</v-btn></v-card-actions></v-card></v-col></v-row>
                                </v-window-item>
                                <v-window-item value="order">
                                    <v-card>
                                        <v-card-title>Semua Pesanan</v-card-title>
                                        <v-text-field v-model="orderFilterDate" type="date" label="Tampilkan pesanan untuk tanggal" class="ma-4" clearable @click:clear="orderFilterDate = null"></v-text-field>
                                        <v-list lines="three" v-if="sortedOrders.length > 0"><template v-for="(order, i) in sortedOrders" :key="order.id"><v-list-subheader v-if="i === 0 || order.date !== sortedOrders[i-1].date">{{ order.date }}</v-list-subheader><v-list-item>
                                        <v-list-item-title>{{ order.productName }} ({{order.id}})</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <div>Pemesan: <strong>{{ order.consumerName }}</strong> | Sales: <strong>{{ order.namaSales }}</strong></div>
                                            <div v-if="order.tanggalLunas" class="text-blue-darken-2"><v-icon start size="small">mdi-calendar-check</v-icon>Estimasi Lunas: {{ order.tanggalLunas }}</div>
                                            <v-chip v-if="calculateLateDays(order) > 0" color="red" size="x-small" class="mt-1">Telat {{ calculateLateDays(order) }} hari</v-chip>
                                        </v-list-item-subtitle>
                                        <template v-slot:append><div class="d-flex flex-column align-end ga-2" style="width: 150px;"><v-chip :color="statusColor(order.status)" size="small">{{ order.status }}</v-chip><v-btn size="small" variant="outlined" @click="openOrderDetailModal(order)">Detail</v-btn><v-btn v-if="order.status === 'Proses'" size="small" color="blue" @click="updateOrderStatus(order, 'Pengiriman')">Kirim</v-btn><v-btn v-if="order.status === 'Pengiriman'" size="small" color="teal" @click="updateOrderStatus(order, 'Terkirim')">Terkirim</v-btn><v-select v-if="order.status === 'Terkirim' && !order.assignedCollector" :items="collectorOptions" v-model="order.selectedCollector" @update:modelValue="assignCollector(order, $event)" label="Tugaskan" density="compact" hide-details style="width: 150px;"></v-select><div v-if="order.assignedCollector"><v-icon start>mdi-account-check</v-icon>{{ order.assignedCollector }}</div></div></template></v-list-item><v-divider v-if="i < sortedOrders.length - 1"></v-divider></template></v-list>
                                        <v-card-text v-else><v-alert type="info">Tidak ada pesanan pada tanggal yang dipilih.</v-alert></v-card-text>
                                    </v-card>
                                </v-window-item>
                                <v-window-item value="broadcast"><v-card max-width="600"><v-card-title>Kirim Pesan Broadcast</v-card-title><v-card-text><v-form @submit.prevent="sendBroadcast"><v-textarea v-model="broadcastMessage" label="Pesan untuk Semua Konsumen" rows="4"></v-textarea><v-btn type="submit" color="primary">Kirim Pesan</v-btn></v-form></v-card-text></v-card></v-window-item>
                                <v-window-item value="data_konsumen"><v-card><v-card-title>Data Konsumen</v-card-title><v-text-field v-model="consumerSearch" label="Cari Konsumen" prepend-inner-icon="mdi-magnify" class="pa-4"></v-text-field><v-data-table :headers="consumerHeaders" :items="consumersWithBillStatus" :search="consumerSearch" :items-per-page="5"><template v-slot:item.billStatus="{ item }"><v-chip :color="item.billStatus.color" size="small">{{ item.billStatus.text }}</v-chip></template></v-data-table></v-card></v-window-item>
                                <v-window-item value="laporan">
                                    <div v-if="!selectedCollectorForReport">
                                        <h3 class="text-h6 my-4">Laporan Kolektor</h3>
                                        <v-card><v-card-title>Pilih Kolektor</v-card-title><v-list><v-list-item v-for="c in appData.collectors" :key="c.uid" :title="c.namaLengkap || c.email" @click="selectedCollectorForReport = c"><template v-slot:append><v-icon>mdi-chevron-right</v-icon></template></v-list-item></v-list></v-card>
                                    </div>
                                    <div v-else>
                                        <v-btn variant="text" @click="selectedCollectorForReport = null" class="mb-2"><v-icon start>mdi-arrow-left</v-icon>Kembali ke Daftar</v-btn>
                                        <h3 class="text-h6 my-4">Laporan Harian: {{ selectedCollectorForReport.namaLengkap }}</h3>
                                        <v-text-field v-model="adminReportDate" type="date" label="Tampilkan laporan untuk tanggal" class="mb-4"></v-text-field>
                                        <v-card class="mb-4">
                                            <v-card-text>
                                                <v-row>
                                                    <v-col class="text-center"><div class="text-h6">{{ collectorDailyReport.assignedCount }}</div><div class="text-caption">Total Tagihan</div></v-col>
                                                    <v-col class="text-center"><div class="text-h6 text-green">Rp {{ collectorDailyReport.subtotal.toLocaleString('id-ID') }}</div><div class="text-caption">Uang Tertagih</div></v-col>
                                                    <v-col class="text-center"><div class="text-h6">Rp {{ collectorDailyReport.potentialTotal.toLocaleString('id-ID') }}</div><div class="text-caption">Seharusnya Tertagih</div></v-col>
                                                    <v-col class="text-center">
                                                        <v-progress-circular :model-value="collectorDailyReport.performance" :size="50" :width="5" color="green">{{ collectorDailyReport.performance }}%</v-progress-circular>
                                                        <div class="text-caption">Berhasil Tertagih</div>
                                                    </v-col>
                                                    <v-col class="text-center">
                                                        <v-progress-circular :model-value="collectorDailyReport.failureRate" :size="50" :width="5" color="red">{{ collectorDailyReport.failureRate }}%</v-progress-circular>
                                                        <div class="text-caption">Gagal Tertagih</div>
                                                    </v-col>
                                                </v-row>
                                            </v-card-text>
                                        </v-card>
                                        <v-card><v-card-title>Detail Penagihan Konsumen</v-card-title>
                                        <v-list><v-list-item v-for="item in collectorDailyReport.billList" :key="item.orderId" :title="item.consumerName" :subtitle="item.productName">
                                            <template v-slot:append>
                                                <div class="text-right">
                                                    <v-chip :color="item.status.color" size="small">{{ item.status.text }}</v-chip>
                                                    <div v-if="item.status.time" class="text-caption text-grey">{{ item.status.time }}</div>
                                                </div>
                                            </template>
                                            <v-list-item-subtitle v-if="item.status.reason" class="pt-1">Alasan: {{ item.status.reason }}</v-list-item-subtitle>
                                        </v-list-item></v-list>
                                        </v-card>
                                    </div>
                                </v-window-item>
                            </v-window>
                        </v-container>
                    </v-main>
                    <v-dialog v-model="editDialog.show" max-width="600px"><v-card><v-card-title>Edit Produk: {{ editDialog.data.name }}</v-card-title><v-card-text><v-text-field v-model="editDialog.data.name" label="Nama Barang"></v-text-field><v-textarea v-model="editDialog.data.description" label="Deskripsi"></v-textarea><v-text-field v-model.number="editDialog.data.hargaModal" label="Harga Modal" type="number"></v-text-field><v-textarea v-model="editDialog.data.images" label="URL Gambar (pisahkan koma)"></v-textarea></v-card-text><v-card-actions><v-spacer></v-spacer><v-btn @click="editDialog.show = false">Batal</v-btn><v-btn color="primary" @click="saveProductEdit">Simpan</v-btn></v-card-actions></v-card></v-dialog>
                    <v-dialog v-model="orderDetailModal.show" max-width="600px">
                        <v-card v-if="orderDetailModal.data">
                            <v-card-title>Detail Pesanan {{ orderDetailModal.data.id }}</v-card-title>
                            <v-card-text>
                                <v-list lines="two">
                                    <v-list-subheader>INFO PESANAN</v-list-subheader>
                                    <v-list-item title="Produk" :subtitle="orderDetailModal.data.productName"></v-list-item>
                                    <v-list-item title="Status" :subtitle="orderDetailModal.data.status"></v-list-item>
                                    <v-list-item title="Tanggal Pesan" :subtitle="orderDetailModal.data.date"></v-list-item>
                                    <v-list-item v-if="orderDetailModal.data.tanggalLunas" title="Estimasi Lunas" :subtitle="orderDetailModal.data.tanggalLunas"></v-list-item>
                                    <v-divider class="my-2"></v-divider>
                                    <v-list-subheader>INFO KONSUMEN</v-list-subheader>
                                    <v-list-item title="Nama" :subtitle="orderDetailModal.data.consumerName"></v-list-item>
                                    <v-list-item title="Jenis Usaha" :subtitle="orderDetailModal.data.jenisUsaha"></v-list-item>
                                    <v-list-item title="NIK KTP" :subtitle="orderDetailModal.data.nomorKtp"></v-list-item>
                                    <v-list-item title="Alamat Usaha" :subtitle="orderDetailModal.data.alamatUsaha"></v-list-item>
                                    <v-list-item title="Alamat Rumah" :subtitle="orderDetailModal.data.alamatRumah"></v-list-item>
                                    <v-list-item title="Sales" :subtitle="orderDetailModal.data.namaSales || '-'"></v-list-item>
                                </v-list>
                            </v-card-text>
                            <v-card-actions><v-spacer></v-spacer><v-btn color="primary" @click="orderDetailModal.show = false">Tutup</v-btn></v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-layout>
            `,
            setup(props, { emit }) {
                const { mobile } = useDisplay();
                const drawer = ref(!mobile.value);
                const localActiveItem = computed({ get: () => props.activeItem, set: (value) => emit('update:activeItem', value) });
                const menuItems = [ { value: 'produk', text: 'Produk & Data', icon: 'mdi-store' }, { value: 'order', text: 'Order', icon: 'mdi-inbox' }, { value: 'broadcast', text: 'Broadcast', icon: 'mdi-bullhorn' }, { value: 'data_konsumen', text: 'Data Konsumen', icon: 'mdi-account-group' }, { value: 'laporan', text: 'Laporan', icon: 'mdi-chart-bar' } ];
                const newProduct = ref({ name: '', description: '', hargaModal: '', images: '' });
                const newPromo = ref({ type: 'image', url: '' });
                const broadcastMessage = ref('');
                const editDialog = reactive({ show: false, data: {} });
                const consumerSearch = ref('');
                const selectedCollectorForReport = ref(null);
                const adminReportDate = ref(new Date().toISOString().split('T')[0]);
                const orderFilterDate = ref(null);
                const orderDetailModal = reactive({ show: false, data: null });

                const stats = computed(() => [ { title: 'Pesanan', value: props.appData.orders.length }, { title: 'Produk', value: props.appData.products.length }, { title: 'Konsumen', value: props.appData.consumers.length }, { title: 'Kolektor', value: props.appData.collectors.length }, ]);
                const sortedOrders = computed(() => {
                    const filtered = props.appData.orders.filter(order => {
                        if (!orderFilterDate.value) return true;
                        const selectedDateString = new Date(orderFilterDate.value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                        return order.date === selectedDateString;
                    });
                    return filtered.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0))
                });
                const collectorOptions = computed(() => props.appData.collectors.map(c => ({ title: c.namaLengkap || c.email, value: c.uid })));
                const getSalesName = (email) => props.appData.consumers.find(c => c.email === email)?.namaSales || 'N/A';
                const consumerHeaders = [ { title: 'Nama', key: 'namaLengkap' }, { title: 'Jenis Usaha', key: 'jenisUsaha' }, { title: 'No. HP', key: 'noHape' }, { title: 'Alamat Usaha', key: 'alamatUsaha' }, { title: 'Sales', key: 'namaSales' }, { title: 'Status Tagihan', key: 'billStatus' } ];
                const consumersWithBillStatus = computed(() => props.appData.consumers.map(c => { const hasAnyOrder = props.appData.orders.some(o => o.consumerEmail === c.email); const hasActiveBill = hasAnyOrder && props.appData.orders.some(o => o.consumerEmail === c.email && o.status !== 'Lunas'); let billStatus = { text: '-', color: 'grey' }; if (hasActiveBill) billStatus = { text: 'Berjalan', color: 'orange' }; else if (hasAnyOrder) billStatus = { text: 'Lunas', color: 'green' }; return { ...c, billStatus }; }));
                
                const collectorDailyReport = computed(() => {
                    if (!selectedCollectorForReport.value) return { subtotal: 0, potentialTotal: 0, assignedCount: 0, billList: [], performance: 0, failureRate: 0 };
                    const selectedDateString = new Date(adminReportDate.value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    let subtotal = 0;
                    let potentialTotal = 0;
                    const billList = [];
                    const assignedOrders = props.appData.orders.filter(o => o.assignedCollectorUid === selectedCollectorForReport.value.uid && o.status === 'Terkirim');
                    
                    let paidCount = 0;
                    let unpaidCount = 0;

                    assignedOrders.forEach(order => {
                        potentialTotal += order.installmentPrice || 0;
                        const paymentToday = (order.payments || []).find(p => p.date === selectedDateString && p.collectedBy === (selectedCollectorForReport.value.namaLengkap || selectedCollectorForReport.value.email));
                        const noteToday = (order.collectionNotes || []).find(n => n.date === selectedDateString && n.collectedBy === (selectedCollectorForReport.value.namaLengkap || selectedCollectorForReport.value.email));
                        
                        let status = { text: 'Belum Dikunjungi', color: 'grey' };
                        if (paymentToday) {
                            paidCount++;
                            subtotal += order.installmentPrice || 0;
                            status = { text: `Bayar`, color: 'green', time: paymentToday.time };
                        } else if (noteToday) {
                            unpaidCount++;
                            status = { text: 'Tidak Bayar', color: 'red', reason: noteToday.reason, time: noteToday.time };
                        }
                        billList.push({ consumerName: order.consumerName, productName: order.productName, orderId: order.id, status });
                    });

                    const visitedCount = paidCount + unpaidCount;
                    const performance = visitedCount > 0 ? Math.round((paidCount / visitedCount) * 100) : 0;
                    const failureRate = assignedOrders.length > 0 ? Math.round((unpaidCount / assignedOrders.length) * 100) : 0;

                    return { subtotal, potentialTotal, assignedCount: assignedOrders.length, billList, performance, failureRate };
                });

                const calculateLateDays = (order) => {
                    if (!order || order.status !== 'Terkirim') return 0;
                    const startDate = order.timestamp?.toDate();
                    if (!startDate) return 0;
                    let expectedPayments = 0; let currentDate = new Date(startDate); const today = new Date();
                    while(currentDate <= today) {
                        const dayOfWeek = currentDate.getDay(); const dateString = currentDate.toISOString().split('T')[0];
                        if (dayOfWeek !== 0 && !props.appData.holidays.includes(dateString)) expectedPayments++;
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                    const actualPayments = (order.payments || []).length;
                    const lateDays = expectedPayments - actualPayments;
                    return lateDays > 0 ? lateDays : 0;
                };
                const addProduct = () => emit('action', { type: 'add-product', payload: { ...newProduct.value, images: newProduct.value.images.split(',').map(s=>s.trim()) } });
                const addPromo = () => emit('action', { type: 'add-promo', payload: newPromo.value });
                const sendBroadcast = () => { emit('action', { type: 'add-broadcast', payload: broadcastMessage.value }); broadcastMessage.value = ''; };
                const updateOrderStatus = (order, status) => emit('action', { type: 'update-order-status', payload: { order, status } });
                const assignCollector = (order, collectorUid) => { const collector = props.appData.collectors.find(c => c.uid === collectorUid); emit('action', { type: 'assign-collector', payload: { firebaseDocId: order.firebaseDocId, collectorUid, collectorName: collector.namaLengkap || collector.email } }); };
                const openEditProduct = (product) => { editDialog.data = { ...product, images: Array.isArray(product.images) ? product.images.join(', ') : '' }; editDialog.show = true; };
                const saveProductEdit = () => { const payload = { ...editDialog.data, images: editDialog.data.images.split(',').map(s => s.trim()) }; emit('action', { type: 'update-product', payload }); editDialog.show = false; };
                const openOrderDetailModal = (order) => { orderDetailModal.data = order; orderDetailModal.show = true; };
                return { isMobile: mobile, drawer, localActiveItem, menuItems, stats, newProduct, newPromo, broadcastMessage, sortedOrders, collectorOptions, getSalesName, updateOrderStatus, assignCollector, addProduct, addPromo, sendBroadcast, editDialog, openEditProduct, saveProductEdit, consumerHeaders, consumersWithBillStatus, consumerSearch, calculateLateDays, selectedCollectorForReport, adminReportDate, collectorDailyReport, orderFilterDate, orderDetailModal, openOrderDetailModal };
            }
        };

        const KolektorDashboard = {
            props: ['user', 'appData', 'activeItem'],
            emits: ['logout', 'action', 'update:activeItem'],
            mixins: [helpers],
            template: `
                <v-container>
                    <v-window v-model="localActiveItem">
                        <v-window-item value="tagihan">
                            <h3 class="text-h6 my-4">Daftar Tagihan Anda</h3>
                            <v-text-field v-model="searchTerm" label="Cari nama konsumen..." prepend-inner-icon="mdi-magnify" variant="solo" class="mb-4"></v-text-field>
                            <v-list lines="two" v-if="filteredBills.length > 0">
                                <v-list-item v-for="bill in filteredBills" :key="bill.id" @click="openBillModal(bill)">
                                    <v-list-item-title>{{ bill.consumerName }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ bill.productName }} - {{ getConsumerInfo(bill.consumerEmail).jenisUsaha }} ({{ bill.paymentFrequency }})</v-list-item-subtitle>
                                    <template v-slot:append><v-btn size="small">Lihat Detail</v-btn></template>
                                </v-list-item>
                            </v-list>
                            <v-alert v-else type="info">Tidak ada tagihan yang cocok.</v-alert>
                        </v-window-item>
                        <v-window-item value="riwayat">
                            <h3 class="text-h6 my-4">Laporan Harian</h3>
                            <v-text-field v-model="historyDate" type="date" label="Tampilkan laporan untuk tanggal" class="mb-4"></v-text-field>
                            <v-card>
                                <v-card-text>
                                    <div class="text-h6">Subtotal Pemasukan: <span class="text-green">Rp {{ dailyReport.subtotal.toLocaleString('id-ID') }}</span></div>
                                </v-card-text>
                                <v-divider></v-divider>
                                <v-card-title>Daftar Konsumen Tidak Bayar</v-card-title>
                                <v-list v-if="dailyReport.unpaidList.length > 0">
                                    <v-list-item v-for="(item, i) in dailyReport.unpaidList" :key="i" :title="item.consumerName" :subtitle="'Alasan: ' + item.reason"></v-list-item>
                                </v-list>
                                <v-card-text v-else><v-alert type="info" variant="tonal">Tidak ada data kunjungan tanpa pembayaran pada tanggal ini.</v-alert></v-card-text>
                            </v-card>
                        </v-window-item>
                        <v-window-item value="profil">
                            <h3 class="text-h6 my-4">Profil & Statistik Harian</h3>
                            <v-card>
                                <v-card-text>
                                    <p><strong>Nama:</strong> {{ user.namaLengkap || user.email }}</p>
                                    <v-row class="mt-4 text-center">
                                        <v-col><div class="text-h5">{{ dailyStats.total }}</div><div class="text-caption">Total Aktif</div></v-col>
                                        <v-col>
                                            <v-progress-circular :model-value="dailyStats.performance" :size="50" :width="5" color="green">{{ dailyStats.performance }}%</v-progress-circular>
                                            <div class="text-caption">Berhasil Tertagih</div>
                                        </v-col>
                                        <v-col>
                                            <v-progress-circular :model-value="dailyStats.failureRate" :size="50" :width="5" color="red">{{ dailyStats.failureRate }}%</v-progress-circular>
                                            <div class="text-caption">Gagal Tertagih</div>
                                        </v-col>
                                    </v-row>
                                    <v-btn color="red" @click="$emit('logout')" class="mt-4">Logout</v-btn>
                                </v-card-text>
                            </v-card>
                            <h3 class="text-h6 my-4">Konsumen Belum Ditagih Hari Ini</h3>
                            <v-list v-if="unpaidTodayList.length > 0">
                                <v-list-item v-for="item in unpaidTodayList" :key="item.bill.id" @click="openBillModal(item.bill)">
                                    <v-list-item-title>{{ item.bill.consumerName }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ item.bill.productName }}</v-list-item-subtitle>
                                    <template v-slot:append><v-icon>mdi-chevron-right</v-icon></template>
                                </v-list-item>
                            </v-list>
                            <v-alert v-else type="info">Semua konsumen yang aktif telah ditangani hari ini.</v-alert>
                        </v-window-item>
                    </v-window>
                </v-container>
                <v-dialog v-model="billModal" max-width="700px">
                    <v-card v-if="selectedBill" class="pa-2" style="position: relative; overflow: hidden;">
                        <div v-if="paymentProcessing" class="stamp-animation">
                            <v-icon size="128" color="green-darken-2">mdi-check-decagram</v-icon>
                            <div class="text-h2 font-weight-bold" style="position: absolute; color: rgba(0, 80, 0, 0.8); transform: rotate(-15deg);">LUNAS</div>
                        </div>
                        <v-row no-gutters>
                            <v-col cols="8">
                                <v-card-title>Detail Tagihan</v-card-title>
                                <v-card-text>
                                    <v-list-item class="px-0" :title="selectedBill.productName" :subtitle="'ID: ' + selectedBill.id"></v-list-item>
                                    <v-divider class="my-2"></v-divider>
                                    <v-list-item class="px-0" title="Info Konsumen">
                                        <template v-slot:subtitle><div>{{ consumerInfo.namaLengkap }} ({{ consumerInfo.jenisUsaha }})</div><div>{{ consumerInfo.alamatUsaha }}</div><div>{{ consumerInfo.noHape }}</div></template>
                                    </v-list-item>
                                </v-card-text>
                            </v-col>
                            <v-col cols="4" class="d-flex flex-column justify-center align-center pa-4" style="border-left: 2px dashed #BDBDBD;">
                                <div class="text-center">
                                    <div v-if="selectedBill.paymentFrequency === 'mingguan'" class="text-subtitle-2">Minggu Ke-{{ Math.floor((selectedBill.payments || []).length / 6) + 1 }} dari {{ selectedBill.tenor / 6 }}</div>
                                    <div v-else class="text-subtitle-2">Angsuran Ke-{{ (selectedBill.payments || []).length + 1 }} dari {{ selectedBill.tenor }}</div>
                                    <div class="font-weight-bold text-h6">Rp {{ selectedBill.installmentPrice.toLocaleString('id-ID') }}</div>
                                    <div v-if="!isActionTakenToday" class="mt-4">
                                        <v-btn color="green" block @click="confirmPayment" class="mb-2">Bayar</v-btn>
                                        <v-btn color="red" block variant="outlined" @click="openUnpaidReasonModal">Tidak Bayar</v-btn>
                                    </div>
                                    <v-chip v-else :color="todayAction.status === 'paid' ? 'green' : 'red'" class="mt-4"><v-icon start>mdi-check</v-icon>Dicatat</v-chip>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="unpaidReasonModal" max-width="500px">
                    <v-card>
                        <v-card-title>Alasan Tidak Bayar</v-card-title>
                        <v-card-text>
                            <v-radio-group v-model="unpaidReason">
                                <v-radio label="Konsumen tidak di tempat" value="Konsumen tidak di tempat"></v-radio>
                                <v-radio label="Minta tunda pembayaran" value="Minta tunda pembayaran"></v-radio>
                                <v-radio label="Tidak ada uang" value="Tidak ada uang"></v-radio>
                                <v-radio label="Lainnya" value="Lainnya"></v-radio>
                            </v-radio-group>
                            <v-textarea v-if="unpaidReason === 'Lainnya'" v-model="customUnpaidReason" label="Sebutkan alasan lain" rows="2"></v-textarea>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="unpaidReasonModal = false">Batal</v-btn>
                            <v-btn color="primary" @click="saveUnpaidReason">Simpan Alasan</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            `,
            setup(props, { emit }) {
                const localActiveItem = computed({ get: () => props.activeItem, set: (value) => emit('update:activeItem', value) });
                const searchTerm = ref('');
                const billModal = ref(false);
                const selectedBill = ref(null);
                const unpaidReasonModal = ref(false);
                const unpaidReason = ref('');
                const customUnpaidReason = ref('');
                const paymentProcessing = ref(false);
                const todayString = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                const historyDate = ref(new Date().toISOString().split('T')[0]);

                const myActiveBills = computed(() => props.appData.orders.filter(o => o.assignedCollectorUid === props.user.uid && o.status !== 'Lunas'));
                const getConsumerInfo = (email) => props.appData.consumers.find(c => c.email === email) || {};
                const filteredBills = computed(() => myActiveBills.value.filter(b => b.consumerName.toLowerCase().includes(searchTerm.value.toLowerCase())));
                
                const todayAction = computed(() => { if (!selectedBill.value) return null; const payment = (selectedBill.value.payments || []).find(p => p.date === todayString); if(payment) return { status: 'paid' }; const note = (selectedBill.value.collectionNotes || []).find(n => n.date === todayString); if(note) return { status: 'unpaid', reason: note.reason }; return null; });
                const isActionTakenToday = computed(() => !!todayAction.value);

                const dailyStats = computed(() => {
                    const total = myActiveBills.value.length;
                    if (total === 0) return { total: 0, paid: 0, unpaid: 0, performance: 0, failureRate: 0 };
                    const paidCount = myActiveBills.value.filter(b => (b.payments || []).some(p => p.date === todayString)).length;
                    const unpaidCount = myActiveBills.value.filter(b => (b.collectionNotes || []).some(n => n.date === todayString)).length;
                    const visitedCount = paidCount + unpaidCount;
                    const performance = visitedCount > 0 ? Math.round((paidCount / visitedCount) * 100) : 0;
                    const failureRate = total > 0 ? Math.round((unpaidCount / total) * 100) : 0;
                    return { total, paid: paidCount, unpaid: unpaidCount, performance, failureRate };
                });
                
                const dailyReport = computed(() => {
                    const selectedDateString = new Date(historyDate.value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    let subtotal = 0;
                    const unpaidList = [];
                    const assignedOrders = props.appData.orders.filter(o => o.assignedCollectorUid === props.user.uid);
                    assignedOrders.forEach(order => {
                        const paymentToday = (order.payments || []).find(p => p.date === selectedDateString && p.collectedBy === (props.user.namaLengkap || props.user.email));
                        if (paymentToday) subtotal += order.installmentPrice || 0;
                        const noteToday = (order.collectionNotes || []).find(n => n.date === selectedDateString && n.collectedBy === (props.user.namaLengkap || props.user.email));
                        if (noteToday) unpaidList.push({ consumerName: order.consumerName, reason: noteToday.reason });
                    });
                    return { subtotal, unpaidList };
                });

                const unpaidTodayList = computed(() => myActiveBills.value.filter(bill => !(bill.payments || []).some(p => p.date === todayString) && !(bill.collectionNotes || []).some(n => n.date === todayString)).map(bill => ({ bill })));
                const consumerInfo = computed(() => { if (!selectedBill.value) return {}; return props.appData.consumers.find(c => c.email === selectedBill.value.consumerEmail) || {}; });
                
                const openBillModal = (bill) => { selectedBill.value = bill; billModal.value = true; };
                const confirmPayment = () => {
                    paymentProcessing.value = true;
                    setTimeout(() => {
                        emit('action', { type: 'log-payment', payload: selectedBill.value });
                        billModal.value = false;
                        paymentProcessing.value = false;
                    }, 1500);
                };
                const openUnpaidReasonModal = () => { unpaidReason.value = ''; customUnpaidReason.value = ''; unpaidReasonModal.value = true; };
                const saveUnpaidReason = () => {
                    const finalReason = unpaidReason.value === 'Lainnya' ? customUnpaidReason.value : unpaidReason.value;
                    if (!finalReason) { emit('action', { type: 'notify', payload: { text: 'Alasan tidak boleh kosong', color: 'error' }}); return; }
                    emit('action', { type: 'log-unpaid-visit', payload: { firebaseDocId: selectedBill.value.firebaseDocId, reason: finalReason, currentNotes: selectedBill.value.collectionNotes || [] }});
                    unpaidReasonModal.value = false;
                    billModal.value = false;
                };

                return { localActiveItem, searchTerm, billModal, selectedBill, myActiveBills, filteredBills, isActionTakenToday, todayAction, dailyStats, dailyReport, historyDate, unpaidTodayList, consumerInfo, openBillModal, confirmPayment, unpaidReasonModal, unpaidReason, customUnpaidReason, openUnpaidReasonModal, saveUnpaidReason, getConsumerInfo, paymentProcessing };
            }
        };

        // =================================================================
        // APLIKASI VUE UTAMA
        // =================================================================
        createApp({
            components: { LoginPage, ProfileForm, KonsumenDashboard, AdminDashboard, KolektorDashboard },
            setup() {
                const { mobile } = useDisplay();
                const user = ref(null);
                const loading = ref(true);
                const authLoading = ref(false);
                const profileLoading = ref(false);
                const authError = ref('');
                const snackbar = reactive({ show: false, text: '', color: 'success' });
                const appData = reactive({ products: [], orders: [], promos: [], consumers: [], collectors: [], broadcasts: [], cartItems: [], holidays: [] });
                const activeItem = ref(null);

                const isProfileComplete = computed(() => !user.value || user.value.role !== 'konsumen' || (user.value.namaLengkap && user.value.noHape && user.value.alamatRumah));
                
                const navMenus = {
                    admin: [ { value: 'produk', text: 'Produk', icon: 'mdi-store' }, { value: 'order', text: 'Order', icon: 'mdi-inbox' }, { value: 'broadcast', text: 'Broadcast', icon: 'mdi-bullhorn' }, { value: 'data_konsumen', text: 'Konsumen', icon: 'mdi-account-group' }, { value: 'laporan', text: 'Laporan', icon: 'mdi-chart-bar' } ],
                    kolektor: [ { value: 'tagihan', text: 'Tagihan', icon: 'mdi-format-list-bulleted' }, { value: 'riwayat', text: 'Riwayat', icon: 'mdi-history' }, { value: 'profil', text: 'Profil', icon: 'mdi-account' } ],
                    konsumen: [ { value: 'produk', text: 'Produk', icon: 'mdi-store' }, { value: 'keranjang', text: 'Keranjang', icon: 'mdi-cart' }, { value: 'order', text: 'Order', icon: 'mdi-receipt-text' }, { value: 'pemberitahuan', text: 'Notif', icon: 'mdi-bell' }, { value: 'profile', text: 'Profil', icon: 'mdi-account-circle' } ]
                };

                const currentDashboardComponent = computed(() => { if (!user.value) return null; switch (user.value.role) { case 'admin': return 'admin-dashboard'; case 'kolektor': return 'kolektor-dashboard'; case 'konsumen': return 'konsumen-dashboard'; default: return null; } });
                const currentNavItems = computed(() => !user.value?.role ? [] : navMenus[user.value.role]);
                const navColor = computed(() => { if (!user.value) return 'primary'; return { admin: 'primary', kolektor: 'blue-grey', konsumen: 'teal' }[user.value.role]; });

                watch(user, (newUser) => { if (newUser) activeItem.value = currentNavItems.value[0]?.value; });
                
                const showNotification = ({ text, color = 'success' }) => { snackbar.text = text; snackbar.color = color; snackbar.show = true; };
                const getFriendlyErrorMessage = (code) => ({ 'auth/user-not-found': 'Email tidak terdaftar.', 'auth/wrong-password': 'Password salah.', 'auth/email-already-in-use': 'Email ini sudah digunakan.', 'auth/invalid-email': 'Format email tidak valid.', 'auth/weak-password': 'Password terlalu lemah.' }[code] || 'Terjadi kesalahan.');

                const handleLogin = async ({ email, password }) => { authLoading.value = true; authError.value = ''; try { await signInWithEmailAndPassword(auth, email, password); showNotification({ text: 'Login berhasil!', color: 'success' }); } catch (e) { authError.value = getFriendlyErrorMessage(e.code); } finally { authLoading.value = false; } };
                const handleRegister = async ({ email, password }) => { authLoading.value = true; authError.value = ''; try { const cred = await createUserWithEmailAndPassword(auth, email, password); await setDoc(doc(db, "users", cred.user.uid), { email, role: 'konsumen', namaLengkap: email }); showNotification({ text: 'Registrasi berhasil! Silakan login.', color: 'success' }); } catch (e) { authError.value = getFriendlyErrorMessage(e.code); } finally { authLoading.value = false; } };
                const handleLogout = async () => { await signOut(auth); showNotification({ text: 'Anda telah logout.', color: 'info' }); };
                const handleSaveProfile = async (profileData) => { profileLoading.value = true; try { await updateDoc(doc(db, "users", user.value.uid), profileData); user.value = { ...user.value, ...profileData }; showNotification({ text: 'Profil berhasil disimpan!', color: 'success' }); } catch (e) { showNotification({ text: 'Gagal menyimpan profil.', color: 'error' }); } finally { profileLoading.value = false; } };

                const calculateMaturityDate = (startDate, tenor, holidays) => {
                    let currentDate = new Date(startDate);
                    let daysCounted = 0;
                    while (daysCounted < tenor) {
                        currentDate.setDate(currentDate.getDate() + 1);
                        const dayOfWeek = currentDate.getDay(); // 0 = Minggu
                        const dateString = currentDate.toISOString().split('T')[0];
                        if (dayOfWeek !== 0 && !holidays.includes(dateString)) {
                            daysCounted++;
                        }
                    }
                    return currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                };

                const handleAction = async ({ type, payload }) => {
                    try {
                        let successMsg = 'Aksi berhasil!';
                        if (type === 'add-to-cart') { appData.cartItems.push(payload); showNotification({ text: 'Ditambahkan ke keranjang', color: 'success' }); return; }
                        if (type === 'remove-from-cart') { appData.cartItems = appData.cartItems.filter(i => i.cartId !== payload); return; }
                        if (type === 'new-order') {
                            const batch = writeBatch(db);
                            appData.cartItems.forEach(item => {
                                const orderRef = doc(collection(db, "orders"));
                                const consumerProfile = {
                                    jenisUsaha: user.value.jenisUsaha,
                                    alamatUsaha: user.value.alamatUsaha,
                                    alamatRumah: user.value.alamatRumah,
                                    nomorKtp: user.value.nomorKtp,
                                    namaSales: user.value.namaSales,
                                };
                                batch.set(orderRef, { id: `#${Date.now().toString().slice(-5)}${Math.random().toString().slice(-2)}`, date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), timestamp: serverTimestamp(), productName: item.product.name, tenor: item.tenor, installmentPrice: item.installmentPrice, paymentFrequency: item.paymentFrequency, status: 'Proses', payments: [], assignedCollector: null, assignedCollectorUid: null, userId: user.value.uid, consumerName: user.value.namaLengkap, consumerEmail: user.value.email, shippingAddress: payload.shippingAddress, ...consumerProfile });
                            });
                            await batch.commit();
                            appData.cartItems = [];
                            successMsg = 'Pesanan berhasil dibuat!';
                        }
                        else if (type === 'add-product') { await addDoc(collection(db, 'products'), payload); successMsg = 'Produk berhasil ditambahkan!'; }
                        else if (type === 'add-promo') { await addDoc(collection(db, 'promos'), payload); successMsg = 'Promo berhasil ditambahkan!'; }
                        else if (type === 'add-broadcast') { await addDoc(collection(db, 'broadcasts'), { message: payload, timestamp: serverTimestamp() }); successMsg = 'Broadcast terkirim!'; }
                        else if (type === 'update-order-status') {
                            const { order, status } = payload;
                            let updateData = { status };
                            if (status === 'Terkirim' && !order.tanggalLunas) {
                                updateData.tanggalLunas = calculateMaturityDate(new Date(), order.tenor, appData.holidays);
                            }
                            await updateDoc(doc(db, 'orders', order.firebaseDocId), updateData);
                        }
                        else if (type === 'assign-collector') await updateDoc(doc(db, 'orders', payload.firebaseDocId), { assignedCollector: payload.collectorName, assignedCollectorUid: payload.collectorUid });
                        else if (type === 'update-product') { const { firebaseDocId, ...dataToSave } = payload; await updateDoc(doc(db, 'products', firebaseDocId), dataToSave); successMsg = 'Produk berhasil diperbarui!'; }
                        else if (type === 'log-payment') {
                            const order = payload;
                            const { firebaseDocId, tenor, payments = [], paymentFrequency } = order;
                            if (payments.length >= tenor) { showNotification({ text: 'Tagihan ini sudah lunas!', color: 'info' }); return; }
                            
                            const newPayments = [];
                            const paymentInfo = { date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'}), collectedBy: user.value.namaLengkap || user.value.email };
                            
                            const paymentsToAdd = paymentFrequency === 'mingguan' ? 6 : 1;
                            for (let i = 0; i < paymentsToAdd; i++) {
                                if ((payments.length + newPayments.length) < tenor) {
                                    newPayments.push(paymentInfo);
                                }
                            }

                            const updatedPayments = [...payments, ...newPayments];
                            const newStatus = updatedPayments.length >= tenor ? 'Lunas' : 'Terkirim';
                            await updateDoc(doc(db, 'orders', firebaseDocId), { payments: updatedPayments, status: newStatus });
                            successMsg = `Pembayaran ${paymentFrequency} dicatat. Status: ${newStatus}`;
                        }
                        else if (type === 'log-unpaid-visit') {
                            const { firebaseDocId, reason, currentNotes } = payload;
                            const newNote = { date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'}), reason, collectedBy: user.value.namaLengkap || user.value.email };
                            await updateDoc(doc(db, 'orders', firebaseDocId), { collectionNotes: [...currentNotes, newNote] });
                            successMsg = 'Catatan kunjungan disimpan.';
                        }
                        showNotification({ text: successMsg, color: 'success' });
                    } catch (e) { showNotification({ text: 'Aksi gagal.', color: 'error' }); console.error(e); }
                };

                onMounted(async () => {
                    try {
                        const year = new Date().getFullYear();
                        const response = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`);
                        const data = await response.json();
                        if (Array.isArray(data)) {
                            appData.holidays = data.filter(d => d.is_national_holiday).map(d => d.holiday_date);
                        }
                    } catch (e) { console.error("Gagal mengambil data hari libur:", e); }

                    let unsubscribers = [];
                    onAuthStateChanged(auth, async (authUser) => {
                        unsubscribers.forEach(unsub => unsub()); unsubscribers = [];
                        if (authUser) {
                            const userDoc = await getDoc(doc(db, "users", authUser.uid));
                            if (userDoc.exists()) {
                                user.value = { uid: authUser.uid, ...userDoc.data() };
                                unsubscribers.push(onSnapshot(collection(db, 'products'), snap => { appData.products = snap.docs.map(d => ({...d.data(), firebaseDocId: d.id})) }));
                                unsubscribers.push(onSnapshot(collection(db, 'orders'), snap => { appData.orders = snap.docs.map(d => ({...d.data(), firebaseDocId: d.id})) }));
                                unsubscribers.push(onSnapshot(collection(db, 'promos'), snap => { appData.promos = snap.docs.map(d => ({...d.data(), id: d.id})) }));
                                unsubscribers.push(onSnapshot(query(collection(db, 'broadcasts'), orderBy('timestamp', 'desc')), snap => { appData.broadcasts = snap.docs.map(d => ({...d.data(), id: d.id})) }));
                                unsubscribers.push(onSnapshot(query(collection(db, 'users'), where('role', '==', 'konsumen')), snap => { appData.consumers = snap.docs.map(d => ({...d.data(), uid: d.id})) }));
                                unsubscribers.push(onSnapshot(query(collection(db, 'users'), where('role', '==', 'kolektor')), snap => { appData.collectors = snap.docs.map(d => ({...d.data(), uid: d.id})) }));
                            } else { await signOut(auth); }
                        } else { user.value = null; }
                        loading.value = false; authError.value = '';
                    });
                });

                return { user, loading, authLoading, profileLoading, authError, snackbar, appData, isProfileComplete, isMobile: mobile, activeItem, currentDashboardComponent, currentNavItems, navColor, showNotification, handleLogin, handleRegister, handleLogout, handleSaveProfile, handleAction };
            }
        }).use(vuetify).mount('#app');