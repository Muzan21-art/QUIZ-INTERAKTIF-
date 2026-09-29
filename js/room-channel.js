/**
 * SMART QUIZ SMP 19 PALEMBANG - Realtime Room Channel
 * Menggunakan BroadcastChannel API & Storage Event untuk sinkronisasi antar-tab/layar
 * Memungkinkan layar guru di proyektor dan layar siswa di tab/perangkat lain sinkron secara live!
 */

class RoomChannel {
  constructor() {
    this.channelName = 'smartquiz_smp19_live_bus';
    this.listeners = new Map();
    this.activeRoom = null;

    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.onmessage = (event) => this.handleMessage(event.data);
    } else {
      this.channel = null;
    }

    // Fallback storage event untuk tab/window berbeda
    window.addEventListener('storage', (e) => {
      if (e.key === 'smartquiz_live_event' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          this.handleMessage(payload);
        } catch (err) {
          console.error('Storage sync parse error:', err);
        }
      }
    });
  }

  // Kirim event ke seluruh tab/layar yang aktif
  broadcast(action, payload = {}) {
    const message = {
      action,
      payload,
      timestamp: Date.now()
    };

    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.warn('Channel postMessage error:', err);
      }
    }

    // Fallback melalui storage
    try {
      localStorage.setItem('smartquiz_live_event', JSON.stringify(message));
    } catch (e) {
      // Ignore quota/private browsing issues
    }

    // Panggil juga listener lokal pada tab saat ini
    this.handleMessage(message);
  }

  // Daftarkan callback event
  on(action, callback) {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, []);
    }
    this.listeners.get(action).push(callback);
  }

  // Hapus listener
  off(action, callback) {
    if (!this.listeners.has(action)) return;
    const filtered = this.listeners.get(action).filter(cb => cb !== callback);
    this.listeners.set(action, filtered);
  }

  // Internal dispatch
  handleMessage(message) {
    if (!message || !message.action) return;
    const callbacks = this.listeners.get(message.action);
    if (callbacks && Array.isArray(callbacks)) {
      callbacks.forEach(cb => {
        try {
          cb(message.payload, message.timestamp);
        } catch (e) {
          console.error(`Error in listener for ${message.action}:`, e);
        }
      });
    }
  }

  // Simpan / update status room di localStorage agar siswa yang baru join bisa query
  setRoomState(roomData) {
    if (!roomData || !roomData.pin) return;
    this.activeRoom = roomData;
    localStorage.setItem(`smartquiz_room_${roomData.pin}`, JSON.stringify(roomData));
    this.broadcast('ROOM_STATE_UPDATED', roomData);
  }

  getRoomState(pin) {
    if (!pin) return null;
    try {
      const data = localStorage.getItem(`smartquiz_room_${pin}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  // Tambahkan pemain ke room secara persisten & broadcast
  addPlayerToRoom(pin, player) {
    if (!pin || !player) return null;
    let room = this.getRoomState(pin);
    if (!room) {
      room = {
        pin: pin,
        quiz: null,
        state: 'lobby',
        players: []
      };
    }
    if (!room.players) room.players = [];

    // Cek apakah pemain dengan nama atau ID sama sudah ada
    const existingIndex = room.players.findIndex(p => p.id === player.id || p.name.toLowerCase() === player.name.toLowerCase());
    if (existingIndex >= 0) {
      room.players[existingIndex] = { ...room.players[existingIndex], ...player };
    } else {
      room.players.push(player);
    }

    this.setRoomState(room);
    this.broadcast('ROOM_PLAYERS_UPDATE', {
      pin: pin,
      players: room.players,
      count: room.players.length,
      newPlayer: player
    });

    return room;
  }

  getRoomPlayers(pin) {
    const room = this.getRoomState(pin);
    return (room && Array.isArray(room.players)) ? room.players : [];
  }

  removeRoom(pin) {
    localStorage.removeItem(`smartquiz_room_${pin}`);
    this.broadcast('ROOM_CLOSED', { pin });
  }
}

// Global room channel singleton
window.smartChannel = new RoomChannel();
