// Default scripts data
const defaultScripts = [
    {
        id: 1,
        category: "Greeting",
        title: "Welcome Call",
        content: "Hello! Thank you for contacting us. How can I assist you today?"
    },
    {
        id: 2,
        category: "Greeting",
        title: "Follow-up Call",
        content: "Hi there! I'm following up on your recent inquiry. Do you have any questions for me?"
    },
    {
        id: 3,
        category: "Issue Resolution",
        title: "Troubleshooting",
        content: "I understand you're experiencing an issue. Let me gather some information to better help you:\n\n1. When did this problem start?\n2. Have you tried any troubleshooting steps?\n3. What error message are you seeing?"
    },
    {
        id: 4,
        category: "Issue Resolution",
        title: "Problem Escalation",
        content: "I appreciate you providing those details. This issue needs specialized attention. Let me escalate this to our technical team who will follow up with you within 24 hours."
    },
    {
        id: 5,
        category: "Billing",
        title: "Payment Inquiry",
        content: "Thank you for your interest. Could you please provide:\n\n- Your account number\n- The type of billing question\n- Your preferred contact method\n\nI'll be happy to assist!"
    },
    {
        id: 6,
        category: "Billing",
        title: "Invoice Explanation",
        content: "Looking at your invoice from [DATE], I can see charges for [SERVICES]. Let me break this down for you..."
    },
    {
        id: 7,
        category: "Closing",
        title: "Resolution Confirmation",
        content: "Perfect! So to confirm, we've resolved [ISSUE]. Is there anything else I can help you with today?"
    },
    {
        id: 8,
        category: "Closing",
        title: "Thank You",
        content: "Thank you for choosing us! We appreciate your business. If you need anything else, please don't hesitate to reach out. Have a great day!"
    }
];

class ScriptManager {
    constructor() {
        this.scripts = this.loadScripts();
        this.filteredScripts = [...this.scripts];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderScripts();
        this.populateCategories();
    }

    loadScripts() {
        const stored = localStorage.getItem('customerServiceScripts');
        return stored ? JSON.parse(stored) : defaultScripts;
    }

    saveScripts() {
        localStorage.setItem('customerServiceScripts', JSON.stringify(this.scripts));
    }

    setupEventListeners() {
        // Edit mode button
        document.getElementById('editModeBtn').addEventListener('click', () => this.openEditModal());

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => this.filterScripts());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterScripts());

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => this.closeEditModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeEditModal());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveScriptChanges());

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('editModal');
            if (e.target === modal) {
                this.closeEditModal();
            }
        });
    }

    renderScripts() {
        const grid = document.getElementById('scriptsGrid');
        
        if (this.filteredScripts.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1;" class="empty-state">
                    <h2>No scripts found</h2>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredScripts.map(script => `
            <div class="script-card" onclick="scriptManager.copyToClipboard('${this.escapeHtml(script.content)}', '${script.title}')">
                <span class="script-category">${script.category}</span>
                <div class="script-title">${script.title}</div>
                <div class="script-content">${this.escapeHtml(script.content)}</div>
                <div class="copy-hint">Click to copy</div>
            </div>
        `).join('');
    }

    copyToClipboard(content, title) {
        navigator.clipboard.writeText(content).then(() => {
            this.showToast(`Copied: ${title}`);
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
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
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
            
            // Validate scripts structure
            if (!Array.isArray(newScripts)) {
                throw new Error('Scripts must be an array');
            }

            newScripts.forEach((script, index) => {
                if (!script.title || !script.content || !script.category) {
                    throw new Error(`Script ${index + 1} is missing required fields (title, content, category)`);
                }
                if (!script.id) {
                    script.id = Math.max(...this.scripts.map(s => s.id), 0) + 1;
                }
            });

            this.scripts = newScripts;
            this.saveScripts();
            this.filteredScripts = [...this.scripts];
            this.renderScripts();
            this.closeEditModal();
            this.showToast('Scripts updated successfully!');
            
            // Repopulate categories
            document.getElementById('categoryFilter').innerHTML = '<option value="">All Categories</option>';
            this.populateCategories();
        } catch (error) {
            alert('Error parsing scripts:\n\n' + error.message + '\n\nPlease check the JSON format and try again.');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
let scriptManager;

document.addEventListener('DOMContentLoaded', () => {
    scriptManager = new ScriptManager();

    // Setup save button in modal
    document.getElementById('saveBtn').addEventListener('click', () => {
        scriptManager.saveScriptChanges();
    });
});