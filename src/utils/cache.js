class SimpleCache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlMs = 0) {
    const record = { value, expiresAt: ttlMs > 0 ? Date.now() + ttlMs : 0 };
    this.store.set(key, record);
  }

  get(key) {
    const rec = this.store.get(key);
    if (!rec) return null;
    if (rec.expiresAt && Date.now() > rec.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return rec.value;
  }

  del(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}
module.exports = new SimpleCache();

