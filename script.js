// Default scripts data
const defaultScripts = [
    {
        id: 1,
        category: "Jokes",
        title: "Why so serious?",
        content: "Why did the developer go broke?\nBecause he used up all his cache!"
    },
    {
        id: 2,
        category: "Tips",
        title: "Pro Tip",
        content: "Always save your work!\nYour future self will thank you."
    },
    {
        id: 3,
        category: "Memes",
        title: "Classic",
        content: "It works on my machine!\n- Every developer ever"
    }
];

class ScriptHub {
    constructor() {
        this.currentUser = this.loadUser();
        this.scripts = this.loadScripts();
        this.filteredScripts = [...this.scripts];
        this.editingId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUserDisplay();
        this.renderScripts();
        this.populateCategories();
        this.loadTheme();
    }

    loadUser() {
        return localStorage.getItem('currentUser') || 'Guest';
    }

    saveUser(username) {
        this.currentUser = username;
        localStorage.setItem('currentUser', username);
        this.updateUserDisplay();
    }

    loadScripts() {
        const key = `scripts_${this.currentUser}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultScripts;
    }

    saveScripts() {
        const key = `scripts_${this.currentUser}`;
        localStorage.setItem(key, JSON.stringify(this.scripts));
    }

    getAllUsers() {
        const users = new Set();
        for (let key in localStorage) {
            if (key.startsWith('scripts_')) {
                users.add(key.replace('scripts_', ''));
            }
        }
        users.add(this.currentUser);
        return Array.from(users).sort();
    }

    setupEventListeners() {
        document.getElementById('editModeBtn').addEventListener('click', () => this.openEditModal());
        document.getElementById('addScriptBtn').addEventListener('click', () => this.openFormModal());
        document.getElementById('userBtn').addEventListener('click', () => this.openUserModal());
        document.getElementById('closeUserModal').addEventListener('click', () => this.closeUserModal());
        document.getElementById('createUserBtn').addEventListener('click', () => this.createUser());

        document.getElementById('searchInput').addEventListener('input', () => this.filterScripts());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterScripts());

        document.getElementById('closeFormModal').addEventListener('click', () => this.closeFormModal());
        document.getElementById('cancelFormBtn').addEventListener('click', () => this.closeFormModal());
        document.getElementById('scriptForm').addEventListener('submit', (e) => this.saveScript(e));

        document.getElementById('closeEditModal').addEventListener('click', () => this.closeEditModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeEditModal());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveScriptChanges());

        document.getElementById('themeSelect').addEventListener('change', (e) => this.setTheme(e.target.value));

        window.addEventListener('click', (e) => {
            const userModal = document.getElementById('userModal');
            const formModal = document.getElementById('scriptFormModal');
            const editModal = document.getElementById('editModal');
            if (e.target === userModal) this.closeUserModal();
            if (e.target === formModal) this.closeFormModal();
            if (e.target === editModal) this.closeEditModal();
        });
    }

    updateUserDisplay() {
        document.getElementById('currentUser').textContent = `👤 ${this.currentUser}`;
    }

    openUserModal() {
        const modal = document.getElementById('userModal');
        const userList = document.getElementById('userList');
        const users = this.getAllUsers();
        
        userList.innerHTML = users.map(user => `
            <button class="user-item ${user === this.currentUser ? 'active' : ''}" onclick="scriptHub.switchUser('${user}')">\n                ${user} ${user === this.currentUser ? '✓' : ''}
            </button>
        `).join('');
        
        modal.classList.add('show');
    }

    closeUserModal() {
        document.getElementById('userModal').classList.remove('show');
    }

    switchUser(username) {
        this.saveUser(username);
        this.scripts = this.loadScripts();
        this.filteredScripts = [...this.scripts];
        this.renderScripts();
        this.populateCategories();
        this.closeUserModal();
        this.showToast(`✓ Switched to ${username}`);
    }

    createUser() {
        const username = document.getElementById('newUsername').value.trim();
        if (!username) {
            alert('Please enter a username');
            return;
        }
        if (this.getAllUsers().includes(username)) {
            alert('User already exists');
            return;
        }
        this.switchUser(username);
        document.getElementById('newUsername').value = '';
    }

    renderScripts() {
        const grid = document.getElementById('scriptsGrid');
        
        if (this.filteredScripts.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1;" class="empty-state">
                    <h2>No scripts yet</h2>
                    <p>Click ➕ Add Script to get started!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredScripts.map(script => `
            <div class="script-card" data-id="${script.id}">
                <div class="script-card-header">
                    <span class="script-category">${script.category}</span>
                    <div class="script-actions">
                        <button class="btn-edit" onclick="scriptHub.editScript(${script.id})" title="Edit">✏️</button>
                        <button class="btn-delete" onclick="scriptHub.deleteScript(${script.id})" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="script-title">${script.title}</div>
                <div class="script-content" id="content-${script.id}">${this.escapeHtml(script.content)}</div>
                <button class="btn-copy" onclick="scriptHub.copyToClipboard(${script.id}, '${script.title}')">📋 Copy</button>
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
                title.textContent = '✏️ Edit Script';
                document.getElementById('scriptTitle').value = script.title;
                document.getElementById('scriptCategory').value = script.category;
                document.getElementById('scriptContent').value = script.content;
                this.editingId = id;
            }
        } else {
            title.textContent = '➕ Add New Script';
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
            alert('Please fill in all fields');
            return;
        }

        if (this.editingId) {
            const script = this.scripts.find(s => s.id === this.editingId);
            if (script) {
                script.title = title;
                script.category = category;
                script.content = content;
                this.showToast('✓ Script updated!');
            }
        } else {
            const newId = Math.max(...this.scripts.map(s => s.id), 0) + 1;
            this.scripts.push({ id: newId, title, category, content });
            this.showToast('✓ Script added!');
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
            this.showToast('✓ Script deleted!');
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
                throw new Error('Must be an array');
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
            this.showToast('✓ Scripts updated!');
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
        const savedTheme = localStorage.getItem('scriptTheme') || 'neon-blue';
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