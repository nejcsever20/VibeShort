window.State = {
  db: null,
  currentUser: null,

  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VibeShortDB', 1);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stories')) {
          db.createObjectStore('stories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('relationships')) {
          db.createObjectStore('relationships', { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        this.seedInitialUsers().then(resolve);
      };

      request.onerror = (e) => reject(e);
    });
  },

  async seedInitialUsers() {
    const users = await this.getAll('users');
    if (users.length === 0) {
      const defaultUsers = [
        { id: 'user_sample1', email: 'sam@vibeshort.io', displayName: 'Sam Wilson', isConfirmed: true, avatarUrl: '' },
        { id: 'user_sample2', email: 'maria@vibeshort.io', displayName: 'Maria Garcia', isConfirmed: true, avatarUrl: '' }
      ];
      for (const u of defaultUsers) {
        await this.put('users', u);
      }
    }
  },

  put(storeName, item) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  get(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
};