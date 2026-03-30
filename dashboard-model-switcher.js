/**
 * TITANIO DASHBOARD — MODEL SWITCHER
 * Integração frontend para trocar modelos via backend real
 * 
 * Adicionar ao HTML:
 * <script src="dashboard-model-switcher.js"></script>
 * 
 * Ou no React:
 * import './dashboard-model-switcher.js'
 */

const BACKEND_URL = 'http://localhost:4444';

class TitanioDashboard {
  constructor() {
    this.currentModel = null;
    this.aliases = {};
    this.isLoading = false;
    this.init();
  }

  async init() {
    console.log('🐾 Tita Dashboard Initializing...');
    await this.loadCurrentModel();
    this.setupModelSwitcher();
  }

  async loadCurrentModel() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/openclaw/model`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.currentModel = data.model;
      this.aliases = data.aliases || {};
      
      console.log('✅ Loaded model:', this.currentModel);
      this.updateUI();
      return data;
    } catch (error) {
      console.error('❌ Failed to load current model:', error);
      return null;
    }
  }

  async switchModel(newModel) {
    if (this.isLoading) return;
    
    // Resolve alias (opus -> anthropic/claude-opus-4-6)
    const fullModel = this.aliases[newModel] || newModel;
    
    console.log(`🔄 Switching from ${this.currentModel} to ${fullModel}...`);
    this.isLoading = true;

    try {
      const response = await fetch(`${BACKEND_URL}/api/openclaw/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: newModel })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      
      if (result.success) {
        this.currentModel = fullModel;
        console.log('✅ Model switched successfully:', result.actual);
        this.updateUI();
        
        // Show success notification
        this.showNotification(`✅ Switched to ${newModel}`, 'success');
        
        return result;
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Failed to switch model:', error);
      this.showNotification(`❌ Failed: ${error.message}`, 'error');
      return null;
    } finally {
      this.isLoading = false;
    }
  }

  setupModelSwitcher() {
    // Find all model switcher buttons
    const buttons = document.querySelectorAll('[data-model-switch]');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const model = btn.getAttribute('data-model-switch');
        this.switchModel(model);
      });
    });

    // Setup dropdown if exists
    const dropdown = document.getElementById('model-select');
    if (dropdown) {
      dropdown.addEventListener('change', (e) => {
        this.switchModel(e.target.value);
      });
    }
  }

  updateUI() {
    // Update all displays of current model
    const displays = document.querySelectorAll('[data-model-display]');
    displays.forEach(el => {
      el.textContent = this.currentModel || 'Loading...';
      el.className = 'font-mono text-xs text-cyan-400';
    });

    // Highlight active button
    const buttons = document.querySelectorAll('[data-model-switch]');
    buttons.forEach(btn => {
      const model = btn.getAttribute('data-model-switch');
      const fullModel = this.aliases[model] || model;
      
      if (fullModel === this.currentModel) {
        btn.classList.add('bg-cyan-500/30', 'border-cyan-400');
        btn.classList.remove('hover:bg-white/5');
      } else {
        btn.classList.remove('bg-cyan-500/30', 'border-cyan-400');
        btn.classList.add('hover:bg-white/5');
      }
    });

    // Update dropdown
    const dropdown = document.getElementById('model-select');
    if (dropdown) {
      dropdown.value = this.getAliasForModel(this.currentModel) || this.currentModel;
    }
  }

  getAliasForModel(fullModel) {
    for (const [alias, model] of Object.entries(this.aliases)) {
      if (model === fullModel) return alias;
    }
    return null;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded text-white ${
      type === 'success' ? 'bg-emerald-500/80' :
      type === 'error' ? 'bg-red-500/80' :
      'bg-blue-500/80'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Public API
  getCurrentModel() {
    return this.currentModel;
  }

  getAliases() {
    return this.aliases;
  }
}

// Global instance
window.titanio = new TitanioDashboard();

// Export for Node/modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TitanioDashboard;
}
