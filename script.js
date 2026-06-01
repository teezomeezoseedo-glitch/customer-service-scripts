// Default scripts data
const defaultScripts = [
    {
        id: 1,
        category: "Templates",
        title: "Getting Started",
        content: "Welcome to Script Manager. Create your first script to get started."
    }
];

class ScriptHub {
    constructor() {
        this.currentUser = null;
        this.isOwner = false;
        this.scripts = [];
        this.filteredScripts = [];
        this.viewingUser = null;
        this.viewingScripts = [];
        this.viewingFilteredScripts = [];
        this.editingId = null;
        this.checkAuth();
    }

    checkAuth() {
        const user = localStorage.getItem('currentUser');
        const userPassword = localStorage.getItem('userPassword');
        
        if (user && userPassword) {
            this.currentUser = user;
            this.isOwner = true;
            this.init();
        } else {
            this.showAuthScreen();
        }
    }

    showAuthScreen() {
        const authModal = document.getElementById('authModal');
        const authContent = document.getElementById('authContent');
        
        authContent.innerHTML = `
            <div style="display: flex; gap: 20px; margin-top: 20px;">
                <div style="flex: 1;">
                    <h3>Sign In</h3>
                    <input type="text" id="loginUsername" placeholder="Username" class="auth-input">
                    <input type="password" id="loginPassword" placeholder="Password" class="auth-input">
                    <button id="loginBtn" class="btn btn-save" style="width: 100%; margin-top: 10px;">Sign In</button>
                </div>
                <div style="flex: 1;">
                    <h3>Create Account</h3>
                    <input type="text" id="signupUsername" placeholder="Username" class="auth-input">
                    <input type="password" id="signupPassword" placeholder="Password" class="auth-input">
                    <input type="password" id="signupConfirm" placeholder="Confirm Password" class="auth-input">
                    <button id="signupBtn" class="btn btn-save" style="width: 100%; margin-top: 10px;">Create</button>
                </div>
            </div>
        `;
        
        authModal.classList.add('show');
        
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('signupBtn').addEventListener('click', () => this.handleSignup());
    }

    handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            alert('Please enter username and password');
            return;
        }
        
        const storedPassword = localStorage.getItem(`user_${username}_password`);
        if (!storedPassword || storedPassword !== password) {
            alert('Invalid username or password');
            return;
        }
        
        this.loginUser(username);
    }

    handleSignup() {
        const username = document.getElementById('signupUsername').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirm').value;
        
        if (!username || !password || !confirm) {
            alert('Please fill all fields');
            return;
        }
        
        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }
        
        if (localStorage.getItem(`user_${username}_password`)) {
            alert('Username already exists');
            return;
        }
        
        localStorage.setItem(`user_${username}_password`, password);
        this.loginUser(username);
    }

    loginUser(username) {
        this.currentUser = username;
        this.isOwner = true;
        localStorage.setItem('currentUser', username);
        localStorage.setItem('userPassword', localStorage.getItem(`user_${username}_password`));
        document.getElementById('authModal').classList.remove('show');
        this.init();
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userPassword');
        this.currentUser = null;
        this.isOwner = false;
        this.showAuthScreen();
        this.scripts = [];
        this.filteredScripts = [];
    }

    getAllUsers() {
        const users = new Set();
        for (let key in localStorage) {
            if (key.startsWith('user_') && key.endsWith('_password')) {
                const username = key.replace('user_', '').replace('_password', '');
                users.add(username);
            }
        }
        return Array.from(users).sort();
    }

    init() {
        this.scripts = this.loadScripts();
        this.filteredScripts = [...this.scripts];
        this.setupEventListeners();
        this.updateUserDisplay();
        this.renderUsersList();
        this.renderScripts();
        this.populateCategories();
        this.loadTheme();
    }

    loadScripts() {
        const key = `scripts_${this.currentUser}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultScripts));
    }

    saveScripts() {
        const key = `scripts_${this.currentUser}`;
        localStorage.setItem(key, JSON.stringify(this.scripts));
    }

    setupEventListeners() {
        document.getElementById('editModeBtn').addEventListener('click', () => this.openEditModal());
        document.getElementById('addScriptBtn').addEventListener('click', () => this.openFormModal());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        document.getElementById('searchInput').addEventListener('input', () => this.filterScripts());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterScripts());

        document.getElementById('viewSearchInput').addEventListener('input', () => this.filterViewScripts());
        document.getElementById('viewCategoryFilter').addEventListener('change', () => this.filterViewScripts());

        document.getElementById('closeFormModal').addEventListener('click', () => this.closeFormModal());
        document.getElementById('cancelFormBtn').addEventListener('click', () => this.closeFormModal());
        document.getElementById('scriptForm').addEventListener('submit', (e) => this.saveScript(e));

        document.getElementById('closeViewModal').addEventListener('click', () => this.closeViewModal());
        document.getElementById('closeEditModal').addEventListener('click', () => this.closeEditModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeEditModal());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveScriptChanges());

        document.getElementById('themeSelect').addEventListener('change', (e) => this.setTheme(e.target.value));

        window.addEventListener('click', (e) => {
            const formModal = document.getElementById('scriptFormModal');
            const viewModal = document.getElementById('viewUserModal');
            const editModal = document.getElementById('editModal');
            if (e.target === formModal) this.closeFormModal();
            if (e.target === viewModal) this.closeViewModal();
            if (e.target === editModal) this.closeEditModal();
        });
    }

    updateUserDisplay() {
        const userEl = document.getElementById('currentUser');
        userEl.textContent = `${this.currentUser} (Owner)`;
    }

    renderUsersList() {
        const usersList = document.getElementById('usersList');
        const allUsers = this.getAllUsers();
        
        usersList.innerHTML = allUsers.map(user => {
            const scriptCount = this.getUserScriptCount(user);
            return `
                <div class="user-profile">
                    <div class="user-profile-info">
                        <div class="user-profile-name">${user}</div>
                        <div class="user-profile-meta">${scriptCount} script${scriptCount !== 1 ? 's' : ''}</div>
                    </div>
                    <button class="btn btn-view" onclick="scriptHub.viewUserScripts('${user}')">View Scripts</button>
                </div>
            `;
        }).join('');
    }

    getUserScriptCount(username) {
        const key = `scripts_${username}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored).length;
            } catch (e) {
                return 0;
            }
        }
        return 0;
    }

    getUserScripts(username) {
        const key = `scripts_${username}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    }

    viewUserScripts(username) {
        this.viewingUser = username;
        this.viewingScripts = this.getUserScripts(username);
        this.viewingFilteredScripts = [...this.viewingScripts];
        
        document.getElementById('viewUserTitle').textContent = `${username}'s Scripts`;
        document.getElementById('viewUserModal').classList.add('show');
        
        this.populateViewCategories();
        this.renderViewScripts();
    }

    closeViewModal() {
        document.getElementById('viewUserModal').classList.remove('show');
        this.viewingUser = null;
        this.viewingScripts = [];
        this.viewingFilteredScripts = [];
    }

    populateViewCategories() {
        const categories = [...new Set(this.viewingScripts.map(s => s.category))].sort();
        const select = document.getElementById('viewCategoryFilter');
        
        select.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    renderViewScripts() {
        const grid = document.getElementById('viewScriptsGrid');
        
        if (this.viewingFilteredScripts.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <p>No scripts found</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.viewingFilteredScripts.map(script => `
            <div class="script-card" data-id="${script.id}">
                <div class="script-card-header">
                    <span class="script-category">${script.category}</span>
                </div>
                <div class="script-title">${script.title}</div>
                <div class="script-content" id="vcontent-${script.id}">${this.escapeHtml(script.content)}</div>
                <button class="btn-copy" onclick="scriptHub.copyViewScript(${script.id}, '${script.title}')">Copy</button>
            </div>
        `).join('');
    }

    filterViewScripts() {
        const searchTerm = document.getElementById('viewSearchInput').value.toLowerCase();
        const category = document.getElementById('viewCategoryFilter').value;

        this.viewingFilteredScripts = this.viewingScripts.filter(script => {
            const matchesSearch = script.title.toLowerCase().includes(searchTerm) ||
                                script.content.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || script.category === category;
            return matchesSearch && matchesCategory;
        });

        this.renderViewScripts();
    }

    copyViewScript(id, title) {
        const contentEl = document.getElementById(`vcontent-${id}`);
        const text = contentEl.innerText;
        
        navigator.clipboard.writeText(text).then(() => {
            this.showToast(`✓ Copied: ${title}`);
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showToast('Failed to copy', 'error');
        });
    }

    renderScripts() {
        const grid = document.getElementById('scriptsGrid');
        
        if (this.filteredScripts.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                    <h2>No scripts found</h2>
                    <p>Click + Add Script to create one</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredScripts.map(script => `
            <div class="script-card" data-id="${script.id}">
                <div class="script-card-header">
                    <span class="script-category">${script.category}</span>
                    <div class="script-actions">
                        <button class="btn-edit" onclick="scriptHub.editScript(${script.id})" title="Edit">✎</button>
                        <button class="btn-delete" onclick="scriptHub.deleteScript(${script.id})" title="Delete">✕</button>
                    </div>
                </div>
                <div class="script-title">${script.title}</div>
                <div class="script-content" id="content-${script.id}">${this.escapeHtml(script.content)}</div>
                <button class="btn-copy" onclick="scriptHub.copyToClipboard(${script.id}, '${script.title}')">Copy</button>
            </div>
        `).join('');
    }

    copyToClipboard(id, title) {
        const contentEl = document.getElementById(`content-${id}`);
        const text = contentEl.innerText;
        
        navigator.clipboard.writeText(text).then(() => {
            this.showToast(`✓ Copied: ${title}`);
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showToast('Failed to copy', 'error');
        });
    }

    filterScripts() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;

        this.filteredScripts = this.scripts.filter(script => {
            const matchesSearch = script.title.toLowerCase().includes(searchTerm) ||
                                script.content.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || script.category === category;
            return matchesSearch && matchesCategory;
        });

        this.renderScripts();
    }

    populateCategories() {
        const categories = [...new Set(this.scripts.map(s => s.category))].sort();
        const select = document.getElementById('categoryFilter');
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
        select.value = currentValue;
    }

    openFormModal(id = null) {
        const modal = document.getElementById('scriptFormModal');
        const form = document.getElementById('scriptForm');
        const title = document.getElementById('formTitle');
        
        if (id) {
            const script = this.scripts.find(s => s.id === id);
            if (script) {
                title.textContent = 'Edit Script';
                document.getElementById('scriptTitle').value = script.title;
                document.getElementById('scriptCategory').value = script.category;
                document.getElementById('scriptContent').value = script.content;
                this.editingId = id;
            }
        } else {
            title.textContent = 'Add Script';
            form.reset();
            this.editingId = null;
        }
        
        modal.classList.add('show');
    }

    closeFormModal() {
        document.getElementById('scriptFormModal').classList.remove('show');
        document.getElementById('scriptForm').reset();
        this.editingId = null;
    }

    saveScript(e) {
        e.preventDefault();
        
        const title = document.getElementById('scriptTitle').value.trim();
        const category = document.getElementById('scriptCategory').value.trim();
        const content = document.getElementById('scriptContent').value.trim();

        if (!title || !category || !content) {
            alert('Please fill all fields');
            return;
        }

        if (this.editingId) {
            const script = this.scripts.find(s => s.id === this.editingId);
            if (script) {
                script.title = title;
                script.category = category;
                script.content = content;
                this.showToast('✓ Script updated');
            }
        } else {
            const newId = Math.max(...this.scripts.map(s => s.id), 0) + 1;
            this.scripts.push({ id: newId, title, category, content });
            this.showToast('✓ Script added');
        }

        this.saveScripts();
        this.filteredScripts = [...this.scripts];
        this.renderScripts();
        this.populateCategories();
        this.closeFormModal();
    }

    editScript(id) {
        this.openFormModal(id);
    }

    deleteScript(id) {
        if (confirm('Delete this script?')) {
            this.scripts = this.scripts.filter(s => s.id !== id);
            this.saveScripts();
            this.filteredScripts = [...this.scripts];
            this.renderScripts();
            this.populateCategories();
            this.showToast('✓ Script deleted');
        }
    }

    openEditModal() {
        const modal = document.getElementById('editModal');
        const editor = document.getElementById('scriptsEditor');
        editor.value = JSON.stringify(this.scripts, null, 2);
        modal.classList.add('show');
    }

    closeEditModal() {
        document.getElementById('editModal').classList.remove('show');
    }

    saveScriptChanges() {
        const editor = document.getElementById('scriptsEditor');
        try {
            const newScripts = JSON.parse(editor.value);
            
            if (!Array.isArray(newScripts)) {
                throw new Error('Must be array');
            }

            newScripts.forEach((script, index) => {
                if (!script.title || !script.content || !script.category) {
                    throw new Error(`Script ${index + 1} missing fields`);
                }
                if (!script.id) script.id = Math.max(...this.scripts.map(s => s.id), 0) + 1;
            });

            this.scripts = newScripts;
            this.saveScripts();
            this.filteredScripts = [...this.scripts];
            this.renderScripts();
            this.closeEditModal();
            this.showToast('✓ Scripts updated');
            this.populateCategories();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    setTheme(theme) {
        document.body.className = `theme-${theme}`;
        localStorage.setItem('scriptTheme', theme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('scriptTheme') || 'dark-pro';
        document.getElementById('themeSelect').value = savedTheme;
        this.setTheme(savedTheme);
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

let scriptHub;
document.addEventListener('DOMContentLoaded', () => {
    scriptHub = new ScriptHub();
});