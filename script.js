function saveToLocalStorage() {
  localStorage.setItem('users', JSON.stringify(storage.users));
  localStorage.setItem('debts', JSON.stringify(storage.debts));
  localStorage.setItem('currentUser', JSON.stringify(storage.currentUser));
}

function loadFromLocalStorage() {
  const users = localStorage.getItem('users');
  const debts = localStorage.getItem('debts');
  const currentUser = localStorage.getItem('currentUser');

  if (users) storage.users = JSON.parse(users);
  if (debts) storage.debts = JSON.parse(debts);
  if (currentUser) storage.currentUser = JSON.parse(currentUser);
}

let storage = {
  users: [],
  currentUser: null,
  debts: [],
};

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Auth functions
function showRegister() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
  clearMessages();
}

function showLogin() {
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
  clearMessages();
}

function clearMessages() {
  document.getElementById('loginError').textContent = '';
  document.getElementById('registerError').textContent = '';
  document.getElementById('registerSuccess').textContent = '';
  document.getElementById('piutangError').textContent = '';
  document.getElementById('hutangError').textContent = '';
}

function register() {
  const name = document.getElementById('registerName').value.trim();
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!name || !username || !password) {
    document.getElementById('registerError').textContent = 'Semua field harus diisi!';
    return;
  }

  if (storage.users.find((user) => user.username === username)) {
    document.getElementById('registerError').textContent = 'Username sudah digunakan!';
    return;
  }

  storage.users.push({
    id: Date.now(),
    name: name,
    username: username,
    password: password,
  });
  saveToLocalStorage();

  document.getElementById('registerSuccess').textContent = 'Registrasi berhasil! Silakan login.';
  document.getElementById('registerError').textContent = '';

  // Clear form
  document.getElementById('registerName').value = '';
  document.getElementById('registerUsername').value = '';
  document.getElementById('registerPassword').value = '';

  setTimeout(() => {
    showLogin();
  }, 1500);
}

function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!username || !password) {
    document.getElementById('loginError').textContent = 'Username dan password harus diisi!';
    return;
  }

  const user = storage.users.find((u) => u.username === username && u.password === password);
  if (!user) {
    document.getElementById('loginError').textContent = 'Username atau password salah!';
    return;
  }

  storage.currentUser = user;
  saveToLocalStorage();
  document.getElementById('welcomeUser').textContent = `Halo, ${user.name}`;
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('appSection').classList.remove('hidden');


  // Set default dates
  document.getElementById('piutangDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('hutangDate').value = new Date().toISOString().split('T')[0];

  updateSummary();
  renderPiutang();
  renderHutang();
}

function logout() {
  storage.currentUser = null;
  saveToLocalStorage();
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('appSection').classList.add('hidden');

  // Clear login form
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
  clearMessages();
  showLogin();
}

document.addEventListener('DOMContentLoaded', function () {
  loadFromLocalStorage();

  // Tampilkan langsung app jika sudah login sebelumnya
  if (storage.currentUser) {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('appSection').classList.remove('hidden');
    document.getElementById('welcomeUser').textContent = `Halo, ${storage.currentUser.name}`;
    updateSummary();
    renderPiutang();
    renderHutang();
  }

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('piutangDate').value = today;
  document.getElementById('hutangDate').value = today;
});

// Tab functions
function showTab(tab) {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach((t) => t.classList.remove('active'));

  if (tab === 'piutang') {
    document.getElementById('piutangSection').classList.remove('hidden');
    document.getElementById('hutangSection').classList.add('hidden');
    tabs[0].classList.add('active');
  } else {
    document.getElementById('piutangSection').classList.add('hidden');
    document.getElementById('hutangSection').classList.remove('hidden');
    tabs[1].classList.add('active');
  }
}

// Debt functions
function addPiutang() {
  const person = document.getElementById('piutangPerson').value.trim();
  const amount = parseFloat(document.getElementById('piutangAmount').value);
  const description = document.getElementById('piutangDescription').value.trim();
  const date = document.getElementById('piutangDate').value;

  if (!person || !amount || amount <= 0 || !date) {
    document.getElementById('piutangError').textContent = 'Semua field harus diisi dengan benar!';
    return;
  }

  storage.debts.push({
    id: Date.now(),
    userId: storage.currentUser.id,
    type: 'piutang',
    person: person,
    amount: amount,
    description: description,
    date: date,
    createdAt: new Date().toISOString(),
  });
  saveToLocalStorage();

  // Clear form
  document.getElementById('piutangPerson').value = '';
  document.getElementById('piutangAmount').value = '';
  document.getElementById('piutangDescription').value = '';
  document.getElementById('piutangDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('piutangError').textContent = '';

  updateSummary();
  renderPiutang();
}

function addHutang() {
  const person = document.getElementById('hutangPerson').value.trim();
  const amount = parseFloat(document.getElementById('hutangAmount').value);
  const description = document.getElementById('hutangDescription').value.trim();
  const date = document.getElementById('hutangDate').value;

  if (!person || !amount || amount <= 0 || !date) {
    document.getElementById('hutangError').textContent = 'Semua field harus diisi dengan benar!';
    return;
  }

  storage.debts.push({
    id: Date.now(),
    userId: storage.currentUser.id,
    type: 'hutang',
    person: person,
    amount: amount,
    description: description,
    date: date,
    createdAt: new Date().toISOString(),
  });
  saveToLocalStorage();

  // Clear form
  document.getElementById('hutangPerson').value = '';
  document.getElementById('hutangAmount').value = '';
  document.getElementById('hutangDescription').value = '';
  document.getElementById('hutangDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('hutangError').textContent = '';

  updateSummary();
  renderHutang();
}

function deleteDebt(id) {
  if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
    storage.debts = storage.debts.filter((debt) => debt.id !== id);
    saveToLocalStorage();
    updateSummary();
    renderPiutang();
    renderHutang();
  }
}

// Render functions
function renderPiutang() {
  const piutangList = document.getElementById('piutangList');
  const piutangs = storage.debts.filter((debt) => debt.userId === storage.currentUser.id && debt.type === 'piutang').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (piutangs.length === 0) {
    piutangList.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Belum ada catatan piutang.</p>';
    return;
  }

  piutangList.innerHTML = piutangs
    .map(
      (debt) => `
                <div class="debt-card">
                    <div class="debt-person">${debt.person}</div>
                    <div class="debt-amount">${formatCurrency(debt.amount)}</div>
                    <div class="debt-description">${debt.description}</div>
                    <div class="debt-date">📅 ${formatDate(debt.date)}</div>
                    <button onclick="deleteDebt(${debt.id})" class="danger" style="margin-top: 15px;">Hapus</button>
                </div>
            `
    )
    .join('');
}

function renderHutang() {
  const hutangList = document.getElementById('hutangList');
  const hutangs = storage.debts.filter((debt) => debt.userId === storage.currentUser.id && debt.type === 'hutang').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (hutangs.length === 0) {
    hutangList.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Belum ada catatan hutang.</p>';
    return;
  }

  hutangList.innerHTML = hutangs
    .map(
      (debt) => `
                <div class="debt-card">
                    <div class="debt-person">${debt.person}</div>
                    <div class="debt-amount negative">-${formatCurrency(debt.amount)}</div>
                    <div class="debt-description">${debt.description}</div>
                    <div class="debt-date">📅 ${formatDate(debt.date)}</div>
                    <button onclick="deleteDebt(${debt.id})" class="danger" style="margin-top: 15px;">Hapus</button>
                </div>
            `
    )
    .join('');
}

function updateSummary() {
  if (!storage.currentUser) return;

  const userDebts = storage.debts.filter((debt) => debt.userId === storage.currentUser.id);
  const totalPiutang = userDebts.filter((debt) => debt.type === 'piutang').reduce((sum, debt) => sum + debt.amount, 0);
  const totalHutang = userDebts.filter((debt) => debt.type === 'hutang').reduce((sum, debt) => sum + debt.amount, 0);

  document.getElementById('totalPiutang').textContent = formatCurrency(totalPiutang);
  document.getElementById('totalHutang').textContent = formatCurrency(totalHutang);
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('piutangDate').value = today;
  document.getElementById('hutangDate').value = today;
});
