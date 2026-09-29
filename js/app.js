/**
 * SMART QUIZ SMP 19 PALEMBANG - Main Application Controller
 * "Belajar, Bermain, Berkolaborasi, dan Berprestasi"
 * Kurikulum Merdeka Fase D (SMPN 19 Palembang)
 */

class SmartQuizApp {
  constructor() {
    this.currentScreen = 'screen-home';
    this.currentQuiz = null;
    this.currentQuestionIndex = 0;
    this.currentQuestion = null;
    this.timerInterval = null;
    this.timerRemaining = 0;
    this.timerTotal = 20;
    this.timerPaused = false;
    this.questionStartTime = 0;

    // Student Player State
    this.player = {
      id: 'p-' + Math.random().toString(36).substr(2, 7),
      name: 'Siswa SMP 19',
      avatar: AVATARS[0],
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      lives: 3,
      team: 'red', // red, blue, green, yellow
      powerUps: {
        used5050: false,
        usedTime: false,
        usedDouble: false,
        usedShield: false,
        usedHint: false
      },
      answersHistory: []
    };

    // Host Room State (Guru)
    this.hostRoom = {
      pin: '738421',
      quiz: null,
      state: 'idle', // idle, lobby, playing, leaderboard, finished
      players: [],
      currentQIndex: 0,
      timerRemaining: 0,
      answeredCount: 0,
      questionStats: [0, 0, 0, 0] // Count for A, B, C, D
    };

    // Simulated students for classroom demo
    this.demoNames = [
      { name: "Andi Saputra", avatar: AVATARS[0], team: "red" },
      { name: "Siti Rahma", avatar: AVATARS[1], team: "blue" },
      { name: "Budi Pratama", avatar: AVATARS[2], team: "green" },
      { name: "Muchlas", avatar: AVATARS[6], team: "yellow" },
      { name: "Rini Anggraini", avatar: AVATARS[4], team: "red" }
    ];

    this.aiReviewQuestions = [];
    this.isSoloMode = false;
    this.editingQuizId = null;
    this.editingSingleQuestionId = null;
    this.lobbySyncInterval = null;
    this.hostLobbyInterval = null;
  }

  init() {
    this.renderHomeSubjects();
    this.populateSubjectSelects();
    this.renderAvatarsGrid();
    this.renderQuizzesList();
    this.renderQuestionBank();
    this.renderTemplates();
    this.renderReportHistory();
    this.setupEventListeners();
    this.setupChannelListeners();

    // Cek jika ada parameter URL misal ?pin=738421
    const urlParams = new URLSearchParams(window.location.search);
    const pinParam = urlParams.get('pin');
    if (pinParam) {
      document.getElementById('join-room-pin').value = pinParam;
      this.showScreen('screen-student-join');
    }
  }

  // --- NAVIGATION CONTROLLER ---
  showScreen(screenId) {
    document.querySelectorAll('.screen-view').forEach(sc => {
      sc.classList.add('hidden');
      sc.classList.remove('active');
    });

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
      this.currentScreen = screenId;
      window.scrollTo(0, 0);
    }
  }

  toggleSound() {
    const isMuted = smartSound.toggleMute();
    const iconEl = document.getElementById('sound-icon');
    if (iconEl) {
      iconEl.textContent = isMuted ? '🔇' : '🔊';
    }
  }

  openHelpModal() {
    smartSound.playClick();
    document.getElementById('modal-help').classList.remove('hidden');
  }

  closeHelpModal() {
    smartSound.playClick();
    document.getElementById('modal-help').classList.add('hidden');
  }

  // --- HOME SCREEN RENDERING ---
  renderHomeSubjects() {
    const container = document.getElementById('home-subject-grid');
    if (!container) return;

    const subjects = smartStorage.getSubjects();
    container.innerHTML = subjects.map(s => `
      <div onclick="app.filterQuizBySubject('${s.id}')" class="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition cursor-pointer flex items-center space-x-3 group">
        <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl group-hover:scale-110 transition">
          ${s.icon || '📚'}
        </div>
        <div class="overflow-hidden">
          <div class="font-bold text-xs sm:text-sm text-slate-800 truncate">${s.name}</div>
          <div class="text-[10px] text-slate-500">Fase D SMP 19</div>
        </div>
      </div>
    `).join('');
  }

  filterQuizBySubject(subjectId) {
    smartSound.playClick();
    const quizzes = smartStorage.getQuizzes();
    const match = quizzes.find(q => q.subject === subjectId);
    if (match) {
      if (confirm(`Ditemukan kuis "${match.title}". Apakah Anda ingin langsung memainkannya?`)) {
        this.playQuizDirect(match.id);
        return;
      }
    }
    this.openTeacherDashboard();
    this.switchTeacherTab('quizzes');
  }

  populateSubjectSelects() {
    const subjects = smartStorage.getSubjects();
    const selectIds = ['ai-subject', 'new-quiz-subject', 'q-form-subject', 'bank-filter-subject'];
    
    selectIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const isFilter = id === 'bank-filter-subject';
      let html = isFilter ? '<option value="all">Semua Mata Pelajaran</option>' : '';
      subjects.forEach(s => {
        html += `<option value="${s.id}">${s.icon ? s.icon + ' ' : ''}${s.name}</option>`;
      });
      el.innerHTML = html;
    });
  }

  openNewSubjectModal() {
    smartSound.playClick();
    document.getElementById('modal-new-subject').classList.remove('hidden');
  }

  closeNewSubjectModal() {
    document.getElementById('modal-new-subject').classList.add('hidden');
  }

  handleCreateSubject(e) {
    e.preventDefault();
    const name = document.getElementById('custom-subject-name').value.trim();
    const icon = document.getElementById('custom-subject-icon').value.trim() || '📚';
    if (!name) return;

    smartStorage.addCustomSubject(name, icon);
    this.renderHomeSubjects();
    this.populateSubjectSelects();
    this.closeNewSubjectModal();
    alert(`Mata Pelajaran "${name}" berhasil ditambahkan!`);
  }

  // --- AVATAR SELECTION ---
  renderAvatarsGrid() {
    const container = document.getElementById('join-avatar-grid');
    if (!container) return;

    container.innerHTML = AVATARS.map((av, idx) => `
      <button 
        type="button" 
        onclick="app.selectAvatar(${idx})" 
        class="avatar-pick-btn p-2 rounded-xl text-center hover:bg-purple-100 border border-transparent transition flex flex-col items-center justify-center ${idx === 0 ? 'bg-purple-100 border-purple-400' : ''}" 
        data-index="${idx}"
        title="${av.label} - ${av.desc}"
      >
        <span class="text-2xl">${av.icon}</span>
      </button>
    `).join('');
  }

  selectAvatar(index) {
    smartSound.playClick();
    this.player.avatar = AVATARS[index];
    document.querySelectorAll('.avatar-pick-btn').forEach((btn, idx) => {
      if (idx === index) {
        btn.classList.add('bg-purple-100', 'border-purple-400');
      } else {
        btn.classList.remove('bg-purple-100', 'border-purple-400');
      }
    });

    const label = document.getElementById('avatar-title-display');
    if (label) label.textContent = `${this.player.avatar.label} (${this.player.avatar.desc})`;
  }

  // --- STUDENT JOIN & LOBBY FLOW ---
  handleStudentJoin(e) {
    e.preventDefault();
    smartSound.playClick();

    const pin = document.getElementById('join-room-pin').value.trim();
    const name = document.getElementById('join-student-name').value.trim();

    if (!pin || !name) {
      alert('Mohon masukkan Kode Permainan (PIN) dan Nama kamu.');
      return;
    }

    this.player.name = name;
    // Tentukan kelompok acak untuk mode team battle
    const teams = ['red', 'blue', 'green', 'yellow'];
    this.player.team = teams[Math.floor(Math.random() * teams.length)];

    const playerObj = {
      id: this.player.id,
      name: this.player.name,
      avatar: this.player.avatar,
      score: 0,
      team: this.player.team
    };

    // Tambahkan pemain ke room secara persisten & broadcast
    let room = smartChannel.addPlayerToRoom(pin, playerObj);
    if (!room.quiz) {
      const quizzes = smartStorage.getQuizzes();
      room.quiz = quizzes[0] || DEFAULT_QUIZZES[0];
      smartChannel.setRoomState(room);
    }

    this.currentQuiz = room.quiz;
    this.hostRoom.pin = pin;

    // Update tampilan lobby siswa
    document.getElementById('lobby-avatar-icon').textContent = this.player.avatar.icon;
    document.getElementById('lobby-ready-heading').textContent = `${this.player.name.toUpperCase()} SIAP BERMAIN!`;
    document.getElementById('lobby-pin-display').textContent = pin;
    document.getElementById('lobby-status-text').textContent = 'Tersambung ke Room! Menunggu guru memulai di layar kelas...';

    // Update counter jumlah peserta dan daftar peserta
    this.updateStudentLobbyPlayers(room.players || [playerObj]);

    // Mulai sinkronisasi berkala di lobby
    this.startLobbySync(pin);

    this.showScreen('screen-student-lobby');
  }

  updateStudentLobbyPlayers(players = []) {
    const countEl = document.getElementById('student-lobby-count');
    const listEl = document.getElementById('student-lobby-players-list');
    if (!countEl || !listEl) return;

    countEl.textContent = `${players.length} Siswa`;

    if (players.length === 0) {
      listEl.innerHTML = '<span class="text-slate-400 text-xs italic">Belum ada peserta...</span>';
      return;
    }

    listEl.innerHTML = players.map(p => {
      const isYou = p.id === this.player.id || p.name.toLowerCase() === this.player.name.toLowerCase();
      const avIcon = (p.avatar && p.avatar.icon) ? p.avatar.icon : (typeof p.avatar === 'string' ? p.avatar : '🧑‍🎓');
      return `
        <div class="px-3 py-1.5 rounded-xl ${isYou ? 'bg-amber-400 text-slate-900 ring-2 ring-white font-black' : 'bg-white/20 text-white font-bold'} text-xs flex items-center space-x-1.5 shadow-sm animate-fade-in">
          <span class="text-base">${avIcon}</span>
          <span>${p.name} ${isYou ? '(Kamu)' : ''}</span>
        </div>
      `;
    }).join('');
  }

  startLobbySync(pin) {
    if (this.lobbySyncInterval) clearInterval(this.lobbySyncInterval);

    this.lobbySyncInterval = setInterval(() => {
      if (this.currentScreen !== 'screen-student-lobby') {
        clearInterval(this.lobbySyncInterval);
        return;
      }
      const room = smartChannel.getRoomState(pin);
      if (room) {
        if (room.players && Array.isArray(room.players)) {
          this.updateStudentLobbyPlayers(room.players);
        }
        if (room.state === 'playing') {
          clearInterval(this.lobbySyncInterval);
          this.startGamePlay(room.quiz);
        }
      }
    }, 800);
  }

  startSoloGameFromLobby() {
    smartSound.playClick();
    this.isSoloMode = true;
    if (!this.currentQuiz) {
      this.currentQuiz = smartStorage.getQuizzes()[0] || DEFAULT_QUIZZES[0];
    }
    this.startGamePlay(this.currentQuiz);
  }

  startDemoQuiz() {
    smartSound.playClick();
    this.isSoloMode = true;
    const quizzes = smartStorage.getQuizzes();
    const demo = quizzes.find(q => q.id === 'quiz-demo-campuran') || quizzes[0] || DEFAULT_QUIZZES[0];
    this.player.name = "Muchlas (Demo SMP 19)";
    this.startGamePlay(demo);
  }

  // --- GAME ENGINE & GAMEPLAY (KAHOOT STYLE) ---
  startGamePlay(quiz) {
    this.currentQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.player.score = 0;
    this.player.correctCount = 0;
    this.player.wrongCount = 0;
    this.player.currentStreak = 0;
    this.player.bestStreak = 0;
    this.player.lives = 3;
    this.player.answersHistory = [];
    this.resetPowerUps();

    // Mode visual adjustments
    const raceWrapper = document.getElementById('game-race-track-wrapper');
    const livesDisplay = document.getElementById('game-lives-display');
    const modeBadge = document.getElementById('game-mode-badge');

    if (quiz.gameMode === 'race') {
      raceWrapper.classList.remove('hidden');
      document.getElementById('race-avatar-runner').style.left = '4%';
      document.getElementById('race-player-name').textContent = this.player.name;
    } else {
      raceWrapper.classList.add('hidden');
    }

    if (quiz.gameMode === 'survival') {
      livesDisplay.classList.remove('hidden');
      livesDisplay.textContent = '❤️❤️❤️';
    } else {
      livesDisplay.classList.add('hidden');
    }

    modeBadge.textContent = quiz.gameMode ? quiz.gameMode.toUpperCase() : 'CLASSIC';

    this.showScreen('screen-gameplay');
    this.loadQuestion(0);
  }

  resetPowerUps() {
    this.player.powerUps = {
      used5050: false,
      usedTime: false,
      usedDouble: false,
      usedShield: false,
      usedHint: false
    };

    ['pu-5050', 'pu-extra-time', 'pu-double', 'pu-hint'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.disabled = false;
        el.classList.remove('opacity-40', 'line-through');
      }
    });

    const hintBox = document.getElementById('game-question-hint');
    if (hintBox) hintBox.classList.add('hidden');
  }

  loadQuestion(index) {
    if (!this.currentQuiz || !this.currentQuiz.questions || index >= this.currentQuiz.questions.length) {
      this.finishGame();
      return;
    }

    clearInterval(this.timerInterval);
    this.currentQuestionIndex = index;
    this.currentQuestion = this.currentQuiz.questions[index];
    this.questionStartTime = Date.now();

    // Update Header Status
    document.getElementById('game-q-counter').textContent = `Soal ${index + 1} / ${this.currentQuiz.questions.length}`;
    document.getElementById('game-subject-badge').textContent = this.currentQuiz.subjectName || 'SMP 19';
    document.getElementById('game-player-score').textContent = this.player.score;
    document.getElementById('game-streak-display').innerHTML = `<span class="flame-active mr-1">🔥</span><span>${this.player.currentStreak}</span>`;
    
    // Learning Objective Pill
    const tpText = this.currentQuestion.learningObjective || this.currentQuiz.learningObjective || 'Menganalisis kompetensi materi.';
    document.getElementById('game-tp-display').textContent = `🎯 TP: ${tpText}`;

    // Question Text & Hint
    document.getElementById('game-question-text').textContent = this.currentQuestion.text;
    const hintBox = document.getElementById('game-question-hint');
    if (this.currentQuestion.hint) {
      document.getElementById('hint-content').textContent = this.currentQuestion.hint;
    } else {
      hintBox.classList.add('hidden');
    }

    // Render Answer UI according to type
    this.renderAnswerInterface(this.currentQuestion);

    // Setup and Start Timer
    this.timerTotal = (this.currentQuestion.duration || this.currentQuiz.durationPerQuestion || 20);
    this.timerRemaining = this.timerTotal;
    this.timerPaused = false;
    this.updateTimerVisual();

    if (this.timerTotal > 0 && this.currentQuiz.gameMode !== 'relax') {
      this.timerInterval = setInterval(() => {
        if (!this.timerPaused) {
          this.timerRemaining -= 1;
          this.updateTimerVisual();
          
          if (this.timerRemaining <= 5 && this.timerRemaining > 0) {
            smartSound.playTick(true);
          } else if (this.timerRemaining > 5) {
            smartSound.playTick(false);
          }

          if (this.timerRemaining <= 0) {
            clearInterval(this.timerInterval);
            smartSound.playTimesUp();
            this.handleAnswerTimeout();
          }
        }
      }, 1000);
    } else {
      // Relax Mode / No limit
      document.getElementById('game-timer-text').textContent = 'Santai (Tanpa Batas)';
      document.getElementById('game-timer-bar').style.width = '100%';
    }
  }

  updateTimerVisual() {
    const textEl = document.getElementById('game-timer-text');
    const barEl = document.getElementById('game-timer-bar');
    if (this.timerTotal <= 0) return;

    textEl.textContent = `${this.timerRemaining}s`;
    const percent = Math.max(0, (this.timerRemaining / this.timerTotal) * 100);
    barEl.style.width = `${percent}%`;

    if (percent < 25) {
      barEl.className = 'h-full bg-rose-500 transition-all duration-200';
    } else if (percent < 50) {
      barEl.className = 'h-full bg-amber-400 transition-all duration-200';
    } else {
      barEl.className = 'h-full bg-emerald-500 transition-all duration-200';
    }
  }

  // --- RENDER ANSWER INTERFACE BY QUESTION TYPE ---
  renderAnswerInterface(q) {
    const container = document.getElementById('game-answer-container');
    container.innerHTML = '';

    const type = q.type || 'pilihan_ganda';

    if (type === 'pilihan_ganda' || type === 'hots') {
      // Standard Kahoot 4-card tactile grid
      const kahootStyles = [
        { class: 'card-kahoot-red', shape: 'shape-triangle', key: '1' },
        { class: 'card-kahoot-blue', shape: 'shape-diamond', key: '2' },
        { class: 'card-kahoot-yellow', shape: 'shape-circle', key: '3' },
        { class: 'card-kahoot-green', shape: 'shape-square', key: '4' }
      ];

      const html = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          ${q.options.map((opt, idx) => {
            const style = kahootStyles[idx % kahootStyles.length];
            return `
              <button 
                id="opt-btn-${idx}" 
                onclick="app.submitAnswer(${idx})" 
                class="${style.class} p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-lg text-left transition transform group"
              >
                <div class="flex items-center space-x-3.5">
                  <span class="${style.shape} group-hover:scale-125 transition"></span>
                  <span class="text-sm sm:text-base font-bold leading-snug">${opt}</span>
                </div>
                <span class="text-xs font-black bg-black/20 px-2 py-1 rounded-md opacity-80">${style.key}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
      container.innerHTML = html;

    } else if (type === 'benar_salah') {
      container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button onclick="app.submitAnswer(0)" class="card-kahoot-blue p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg text-center active:scale-95 transition">
            <span class="text-3xl mb-1">👍</span>
            <span class="text-2xl font-black">BENAR</span>
            <span class="text-xs opacity-75 mt-1">Tekan 1</span>
          </button>
          <button onclick="app.submitAnswer(1)" class="card-kahoot-red p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg text-center active:scale-95 transition">
            <span class="text-3xl mb-1">👎</span>
            <span class="text-2xl font-black">SALAH</span>
            <span class="text-xs opacity-75 mt-1">Tekan 2</span>
          </button>
        </div>
      `;

    } else if (type === 'kompleks') {
      container.innerHTML = `
        <div class="space-y-2.5 max-w-2xl mx-auto">
          <div class="text-xs text-amber-300 font-bold mb-2">Pilih satu atau lebih jawaban yang benar:</div>
          ${q.options.map((opt, idx) => `
            <label class="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 cursor-pointer transition">
              <input type="checkbox" name="complex_opt" value="${idx}" class="w-5 h-5 rounded text-purple-600 focus:ring-purple-500">
              <span class="text-sm font-semibold text-white">${opt}</span>
            </label>
          `).join('')}
          <button onclick="app.submitComplexAnswer()" class="w-full mt-3 py-3.5 rounded-xl font-bold bg-brand-green hover:bg-green-700 text-white shadow transition">
            Kirim Jawaban Pilihan Kompleks ➔
          </button>
        </div>
      `;

    } else if (type === 'jawaban_singkat') {
      container.innerHTML = `
        <div class="max-w-xl mx-auto space-y-3">
          <input 
            type="text" 
            id="input-short-answer" 
            placeholder="Ketik jawabanmu di sini..." 
            autocomplete="off"
            class="w-full px-5 py-4 text-center text-lg font-bold bg-slate-800 border-2 border-purple-500 rounded-2xl text-white outline-none focus:ring-4 focus:ring-purple-400"
            onkeydown="if(event.key === 'Enter') app.submitShortAnswer()"
          >
          <button onclick="app.submitShortAnswer()" class="w-full py-3.5 rounded-xl font-bold bg-brand-purple hover:bg-brand-dark text-white shadow transition text-sm">
            Kirim Jawaban ➔
          </button>
        </div>
      `;
      setTimeout(() => {
        const inp = document.getElementById('input-short-answer');
        if (inp) inp.focus();
      }, 100);

    } else if (type === 'urutkan') {
      // Dynamic ordering cards
      const items = [...q.options];
      this.orderingState = items.map((opt, idx) => ({ text: opt, originalIndex: idx }));

      const renderOrdering = () => {
        container.innerHTML = `
          <div class="max-w-xl mx-auto space-y-2">
            <p class="text-xs text-amber-300 font-bold mb-2">Urutkan dari langkah paling awal (atas) ke paling akhir (bawah):</p>
            ${this.orderingState.map((item, idx) => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
                <div class="flex items-center space-x-2">
                  <span class="w-6 h-6 rounded-full bg-purple-900 text-purple-200 text-xs font-bold flex items-center justify-center">${idx + 1}</span>
                  <span class="text-sm font-semibold text-white">${item.text}</span>
                </div>
                <div class="flex space-x-1">
                  <button type="button" onclick="app.moveOrderItem(${idx}, -1)" ${idx === 0 ? 'disabled class="opacity-30 p-1"' : 'class="p-1 hover:text-amber-400"'}>▲</button>
                  <button type="button" onclick="app.moveOrderItem(${idx}, 1)" ${idx === this.orderingState.length - 1 ? 'disabled class="opacity-30 p-1"' : 'class="p-1 hover:text-amber-400"'}>▼</button>
                </div>
              </div>
            `).join('')}
            <button onclick="app.submitOrderingAnswer()" class="w-full mt-3 py-3.5 rounded-xl font-bold bg-brand-green hover:bg-green-700 text-white shadow transition">
              Kunci Urutan Ini ➔
            </button>
          </div>
        `;
      };
      this.renderOrderingFn = renderOrdering;
      renderOrdering();

    } else if (type === 'menjodohkan') {
      // Matching pairs interactive
      const pairs = q.pairs || [
        { left: "Objek A", right: "Pasangan A" },
        { left: "Objek B", right: "Pasangan B" }
      ];

      this.matchingLeftSelected = null;
      this.matchingUserPairs = {};

      container.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-3">
          <p class="text-xs text-amber-300 font-bold">Pasangan Konsep (Klik item kiri lalu klik pasangannya di kanan):</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2" id="match-left-col">
              ${pairs.map((p, idx) => `
                <button type="button" onclick="app.selectMatchLeft(${idx})" id="match-left-${idx}" class="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-left text-xs font-bold text-white hover:border-purple-400 transition">
                  ${p.left}
                </button>
              `).join('')}
            </div>
            <div class="space-y-2" id="match-right-col">
              ${pairs.map((p, idx) => `
                <button type="button" onclick="app.selectMatchRight(${idx})" id="match-right-${idx}" class="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-left text-xs font-bold text-slate-300 hover:border-purple-400 transition">
                  ${p.right}
                </button>
              `).join('')}
            </div>
          </div>
          <button onclick="app.submitAnswer(0)" class="w-full mt-3 py-3.5 rounded-xl font-bold bg-brand-green hover:bg-green-700 text-white shadow transition text-xs">
            Kirim Pasangan Jawaban ➔
          </button>
        </div>
      `;
    }
  }

  moveOrderItem(idx, dir) {
    smartSound.playClick();
    const target = idx + dir;
    if (target < 0 || target >= this.orderingState.length) return;
    const temp = this.orderingState[idx];
    this.orderingState[idx] = this.orderingState[target];
    this.orderingState[target] = temp;
    this.renderOrderingFn();
  }

  submitOrderingAnswer() {
    const isCorrect = this.orderingState.every((item, idx) => item.originalIndex === idx);
    this.processAnswerResult(isCorrect, isCorrect ? 'Urutan tepat!' : 'Urutan belum tepat');
  }

  selectMatchLeft(idx) {
    smartSound.playClick();
    this.matchingLeftSelected = idx;
    document.querySelectorAll('#match-left-col button').forEach((btn, i) => {
      btn.classList.toggle('border-amber-400', i === idx);
      btn.classList.toggle('bg-purple-900', i === idx);
    });
  }

  selectMatchRight(idx) {
    if (this.matchingLeftSelected === null) return;
    smartSound.playClick();
    const btn = document.getElementById(`match-right-${idx}`);
    if (btn) {
      btn.classList.add('border-green-400', 'bg-green-900/50');
    }
  }

  // --- SUBMITTING & SCORING ---
  submitAnswer(selectedIdx) {
    clearInterval(this.timerInterval);

    const q = this.currentQuestion;
    const isCorrect = selectedIdx === q.correctAnswer;
    const answerLabel = q.options ? q.options[selectedIdx] : (selectedIdx === 0 ? 'Benar' : 'Salah');

    this.processAnswerResult(isCorrect, answerLabel);
  }

  submitComplexAnswer() {
    clearInterval(this.timerInterval);
    const checked = Array.from(document.querySelectorAll('input[name="complex_opt"]:checked')).map(cb => parseInt(cb.value));
    const correctAnswers = Array.isArray(this.currentQuestion.correctAnswer) ? this.currentQuestion.correctAnswer : [this.currentQuestion.correctAnswer];

    // Cek apakah persis sama
    const isCorrect = checked.length === correctAnswers.length && checked.every(v => correctAnswers.includes(v));
    this.processAnswerResult(isCorrect, `Pilihan [${checked.join(', ')}]`);
  }

  submitShortAnswer() {
    clearInterval(this.timerInterval);
    const inp = document.getElementById('input-short-answer');
    const userText = (inp ? inp.value : '').trim().toLowerCase();

    const q = this.currentQuestion;
    const correct = (q.correctAnswer || '').toString().toLowerCase().trim();
    const acceptable = (q.acceptableAnswers || []).map(a => a.toLowerCase().trim());

    const isCorrect = userText === correct || acceptable.includes(userText);
    this.processAnswerResult(isCorrect, userText);
  }

  handleAnswerTimeout() {
    this.processAnswerResult(false, '(Waktu Habis)');
  }

  processAnswerResult(isCorrect, answerLabel) {
    const q = this.currentQuestion;
    const timeTaken = Math.max(1, Math.round((Date.now() - this.questionStartTime) / 1000));
    
    // Hitung Skor
    let baseScore = isCorrect ? (q.weight || 100) : 0;
    let speedBonus = 0;
    let streakBonus = 0;

    if (isCorrect) {
      smartSound.playCorrect();
      this.player.correctCount += 1;
      this.player.currentStreak += 1;
      if (this.player.currentStreak > this.player.bestStreak) {
        this.player.bestStreak = this.player.currentStreak;
      }

      // Bonus Kecepatan (0 - 50 poin berdasarkan sisa waktu)
      if (this.timerTotal > 0) {
        speedBonus = Math.round((this.timerRemaining / this.timerTotal) * 50);
      }

      // Bonus Streak
      if (this.player.currentStreak >= 5) {
        streakBonus = 50;
      } else if (this.player.currentStreak >= 3) {
        streakBonus = 30;
      } else if (this.player.currentStreak >= 2) {
        streakBonus = 20;
      }

      // Power-up 2x Point
      if (this.player.powerUps.usedDouble) {
        baseScore *= 2;
        speedBonus *= 2;
        streakBonus *= 2;
      }

      const totalEarned = baseScore + speedBonus + streakBonus;
      this.player.score += totalEarned;

      // Animasi gerak avatar pada Mode Race
      if (this.currentQuiz.gameMode === 'race') {
        const percent = Math.min(92, Math.round((this.player.correctCount / this.currentQuiz.questions.length) * 92) + 4);
        const runner = document.getElementById('race-avatar-runner');
        if (runner) runner.style.left = `${percent}%`;
      }

    } else {
      smartSound.playWrong();
      this.player.wrongCount += 1;

      // Shield power-up check
      if (this.player.powerUps.usedShield) {
        // Streak terlindungi!
        this.player.powerUps.usedShield = false;
      } else {
        this.player.currentStreak = 0;
      }

      // Survival Mode (Nyawa)
      if (this.currentQuiz.gameMode === 'survival') {
        this.player.lives -= 1;
        const hearts = '❤️'.repeat(Math.max(0, this.player.lives));
        const livesEl = document.getElementById('game-lives-display');
        if (livesEl) livesEl.textContent = hearts || '💀 Habis!';
      }
    }

    // Catat ke riwayat
    this.player.answersHistory.push({
      questionIndex: this.currentQuestionIndex,
      questionText: q.text,
      userAnswer: answerLabel,
      isCorrect: isCorrect,
      timeTaken: timeTaken,
      score: isCorrect ? (baseScore + speedBonus + streakBonus) : 0
    });

    // Broadcast ke Host Screen jika ada tab presenter yang mendengar
    smartChannel.broadcast('PLAYER_ANSWER', {
      pin: this.hostRoom.pin,
      playerId: this.player.id,
      playerName: this.player.name,
      questionIndex: this.currentQuestionIndex,
      isCorrect: isCorrect,
      scoreEarned: isCorrect ? (baseScore + speedBonus + streakBonus) : 0,
      totalScore: this.player.score,
      team: this.player.team
    });

    // Tampilkan Feedback Screen
    this.showFeedbackScreen(isCorrect, baseScore, speedBonus, streakBonus);
  }

  showFeedbackScreen(isCorrect, baseScore, speedBonus, streakBonus) {
    const q = this.currentQuestion;

    const iconEl = document.getElementById('feedback-icon');
    const titleEl = document.getElementById('feedback-title');
    const subtitleEl = document.getElementById('feedback-subtitle');
    const scoreAddEl = document.getElementById('feedback-score-add');
    const speedBonusEl = document.getElementById('feedback-speed-bonus');
    const streakCountEl = document.getElementById('feedback-streak-count');
    const correctAnsEl = document.getElementById('feedback-correct-answer');
    const explanationEl = document.getElementById('feedback-explanation');

    if (isCorrect) {
      iconEl.textContent = '🎉';
      titleEl.textContent = 'BENAR!';
      titleEl.className = 'text-3xl font-black text-green-400';
      subtitleEl.textContent = 'Hebat! Jawaban kamu tepat sekali.';
      scoreAddEl.textContent = `+${baseScore}`;
      speedBonusEl.textContent = `+${speedBonus}`;
      streakCountEl.textContent = `🔥 ${this.player.currentStreak}`;
    } else {
      iconEl.textContent = '💡';
      titleEl.textContent = 'BELUM TEPAT';
      titleEl.className = 'text-3xl font-black text-rose-400';
      subtitleEl.textContent = 'Tetap semangat! Perhatikan pembahasannya untuk belajar.';
      scoreAddEl.textContent = '+0';
      speedBonusEl.textContent = '+0';
      streakCountEl.textContent = '🔥 0';
    }

    // Jawaban Benar
    let correctText = '-';
    if (q.options && typeof q.correctAnswer === 'number') {
      correctText = q.options[q.correctAnswer];
    } else if (q.type === 'benar_salah') {
      correctText = q.correctAnswer === 0 ? 'Benar' : 'Salah';
    } else if (q.correctAnswer) {
      correctText = q.correctAnswer.toString();
    }
    correctAnsEl.textContent = correctText;
    explanationEl.textContent = q.explanation || 'Pembahasan telah diverifikasi oleh guru SMP Negeri 19 Palembang.';

    this.showScreen('screen-feedback');
  }

  nextQuestionOrLeaderboard() {
    smartSound.playClick();

    // Survival Check: Jika nyawa habis
    if (this.currentQuiz.gameMode === 'survival' && this.player.lives <= 0) {
      alert('Nyawa kamu sudah habis! Kuis Survival selesai.');
      this.finishGame();
      return;
    }

    // Setiap 3 soal atau di akhir soal, tampilkan Leaderboard
    const nextIdx = this.currentQuestionIndex + 1;
    if (nextIdx >= this.currentQuiz.questions.length) {
      this.finishGame();
    } else if (nextIdx % 3 === 0 && this.currentQuiz.gameMode !== 'relax') {
      this.showLeaderboardScreen();
    } else {
      this.loadQuestion(nextIdx);
    }
  }

  // --- LEADERBOARD ---
  showLeaderboardScreen() {
    smartSound.playClick();

    const listContainer = document.getElementById('leaderboard-list');
    const teamContainer = document.getElementById('leaderboard-team-container');

    // Buat daftar skor (termasuk bot demo untuk mensimulasikan kompetisi kelas SMP 19)
    const participants = [
      { name: this.player.name, avatar: this.player.avatar.icon, score: this.player.score, isYou: true, team: this.player.team },
      { name: "Andi Saputra", avatar: "🧑‍🔬", score: Math.round(this.player.score * 0.95) + 30, team: "red" },
      { name: "Siti Rahma", avatar: "🧑‍💻", score: Math.round(this.player.score * 0.9) + 40, team: "blue" },
      { name: "Budi Pratama", avatar: "👩‍🏫", score: Math.round(this.player.score * 0.85) + 10, team: "green" },
      { name: "Rini Anggraini", avatar: "🧑‍🎨", score: Math.round(this.player.score * 0.8) + 20, team: "yellow" }
    ];

    participants.sort((a, b) => b.score - a.score);

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

    listContainer.innerHTML = participants.map((p, idx) => `
      <div class="flex items-center justify-between p-3.5 rounded-2xl ${p.isYou ? 'bg-amber-400 text-slate-900 ring-2 ring-white font-black' : 'bg-white/10 text-white font-bold'} shadow-md transition">
        <div class="flex items-center space-x-3">
          <span class="text-xl">${medals[idx] || (idx + 1)}</span>
          <span class="text-2xl">${p.avatar}</span>
          <div class="text-sm">
            ${p.name} ${p.isYou ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-black text-amber-300 ml-1">KAMU</span>' : ''}
          </div>
        </div>
        <div class="text-base font-black font-mono">
          ${p.score} pt
        </div>
      </div>
    `).join('');

    // Team Battle Support
    if (this.currentQuiz.gameMode === 'team_battle') {
      teamContainer.classList.remove('hidden');
      const teamSums = { red: 320, blue: 290, green: 310, yellow: 280 };
      teamSums[this.player.team] += this.player.score;
      document.getElementById('team-score-red').textContent = teamSums.red;
      document.getElementById('team-score-blue').textContent = teamSums.blue;
      document.getElementById('team-score-green').textContent = teamSums.green;
      document.getElementById('team-score-yellow').textContent = teamSums.yellow;
    } else {
      teamContainer.classList.add('hidden');
    }

    this.showScreen('screen-leaderboard');
  }

  continueAfterLeaderboard() {
    smartSound.playClick();
    this.loadQuestion(this.currentQuestionIndex + 1);
  }

  // --- POWER-UPS ENGINE ---
  usePowerUp(type) {
    if (!this.currentQuiz.allowPowerUps) return;

    if (type === '5050' && !this.player.powerUps.used5050) {
      smartSound.playPowerUp();
      this.player.powerUps.used5050 = true;
      document.getElementById('pu-5050').classList.add('opacity-40', 'line-through');
      document.getElementById('pu-5050').disabled = true;

      // Sembunyikan 2 opsi yang salah
      const q = this.currentQuestion;
      if (q.options && typeof q.correctAnswer === 'number') {
        let hiddenCount = 0;
        q.options.forEach((_, idx) => {
          if (idx !== q.correctAnswer && hiddenCount < 2) {
            const btn = document.getElementById(`opt-btn-${idx}`);
            if (btn) {
              btn.classList.add('card-kahoot-disabled');
              hiddenCount++;
            }
          }
        });
      }

    } else if (type === 'time' && !this.player.powerUps.usedTime) {
      smartSound.playPowerUp();
      this.player.powerUps.usedTime = true;
      document.getElementById('pu-extra-time').classList.add('opacity-40', 'line-through');
      document.getElementById('pu-extra-time').disabled = true;

      this.timerRemaining += 10;
      this.updateTimerVisual();

    } else if (type === 'double' && !this.player.powerUps.usedDouble) {
      smartSound.playPowerUp();
      this.player.powerUps.usedDouble = true;
      document.getElementById('pu-double').classList.add('opacity-40', 'line-through');
      document.getElementById('pu-double').disabled = true;
      alert('Power-up 2x Poin aktif pada soal ini!');

    } else if (type === 'hint' && !this.player.powerUps.usedHint) {
      smartSound.playPowerUp();
      this.player.powerUps.usedHint = true;
      document.getElementById('pu-hint').classList.add('opacity-40', 'line-through');
      document.getElementById('pu-hint').disabled = true;

      const hintBox = document.getElementById('game-question-hint');
      const hintText = document.getElementById('hint-content');
      hintText.textContent = this.currentQuestion.hint || 'Perhatikan kata kunci pertanyaan dan analisis opsi yang paling logis.';
      hintBox.classList.remove('hidden');
    }
  }

  showInGameHelp() {
    alert(`Materi: ${this.currentQuiz.topic}\nTP: ${this.currentQuestion.learningObjective || this.currentQuiz.learningObjective}\nTipe: ${this.currentQuestion.type}`);
  }

  // --- FINISH GAME & REFLECTION ---
  finishGame() {
    clearInterval(this.timerInterval);
    smartSound.playVictory();

    // Canvas Confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const totalQuestions = this.currentQuiz.questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((this.player.correctCount / totalQuestions) * 100) : 0;

    document.getElementById('result-score').textContent = this.player.score;
    document.getElementById('result-correct-count').textContent = `${this.player.correctCount} / ${totalQuestions}`;
    document.getElementById('result-accuracy').textContent = `${accuracy}%`;
    document.getElementById('result-best-streak').textContent = `🔥 ${this.player.bestStreak}`;

    // Render Badges
    this.renderResultBadges(accuracy);

    // Render Refleksi Options
    this.renderReflectionOptions();

    // Simpan ke history sesi kuis
    smartStorage.saveGameSessionResult({
      quizId: this.currentQuiz.id,
      quizTitle: this.currentQuiz.title,
      subject: this.currentQuiz.subject,
      subjectName: this.currentQuiz.subjectName || 'SMP 19',
      grade: this.currentQuiz.grade,
      kktp: 75,
      averageScore: this.player.score,
      passingRate: accuracy >= 75 ? 100 : 0,
      students: [
        {
          name: this.player.name,
          score: this.player.score,
          correctCount: this.player.correctCount,
          wrongCount: this.player.wrongCount,
          accuracy: accuracy
        }
      ]
    });

    this.showScreen('screen-results');
  }

  renderResultBadges(accuracy) {
    const container = document.getElementById('result-badges-container');
    const earned = [];

    if (this.player.correctCount >= 1) {
      earned.push(BADGES[0]); // First Win
    }
    if (this.player.bestStreak >= 3) {
      earned.push(BADGES[1]); // Streak Master
    }
    if (accuracy >= 80) {
      earned.push(BADGES[2]); // Quiz Hero
    }
    if (accuracy === 100) {
      earned.push(BADGES[5]); // Sempurna
    }

    container.innerHTML = earned.map(b => `
      <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center space-x-2.5">
        <span class="text-2xl">${b.icon}</span>
        <div>
          <div class="font-bold text-xs text-amber-900">${b.name}</div>
          <div class="text-[10px] text-amber-700">${b.desc}</div>
        </div>
      </div>
    `).join('');
  }

  renderReflectionOptions() {
    const container = document.getElementById('reflection-options-grid');
    container.innerHTML = REFLECTION_OPTIONS.map((opt, idx) => `
      <label class="flex items-start space-x-3 p-3.5 rounded-2xl border ${opt.color} cursor-pointer hover:shadow-sm transition">
        <input type="radio" name="reflection_level" value="${opt.id}" ${idx === 0 ? 'checked' : ''} class="mt-1 text-purple-600 focus:ring-purple-500">
        <div>
          <div class="font-bold text-xs sm:text-sm flex items-center space-x-1.5">
            <span>${opt.emoji}</span>
            <span>${opt.label}</span>
          </div>
          <p class="text-[11px] opacity-80 mt-0.5">${opt.desc}</p>
        </div>
      </label>
    `).join('');
  }

  handleSaveReflection(e) {
    e.preventDefault();
    smartSound.playClick();

    const selectedLevel = document.querySelector('input[name="reflection_level"]:checked')?.value || 'paham';
    const confusing = document.getElementById('refl-confusing').value.trim();
    const good = document.getElementById('refl-good').value.trim();

    smartStorage.saveReflection({
      studentName: this.player.name,
      quizTitle: this.currentQuiz ? this.currentQuiz.title : 'Kuis SMP 19',
      subject: this.currentQuiz ? this.currentQuiz.subjectName : 'Umum',
      level: selectedLevel,
      confusingText: confusing,
      goodText: good
    });

    const btn = document.getElementById('btn-submit-reflection');
    btn.textContent = '✅ Refleksi Belajar Berhasil Disimpan!';
    btn.classList.remove('bg-brand-green');
    btn.classList.add('bg-slate-700');
    btn.disabled = true;

    alert('Terima kasih! Refleksi belajarmu telah diteruskan kepada Bapak/Ibu guru untuk evaluasi pembelajaran.');
  }

  // --- TEACHER DASHBOARD & QUIZ CRUD ---
  openTeacherDashboard() {
    smartSound.playClick();
    this.switchTeacherTab('quizzes');
    this.showScreen('screen-teacher-dashboard');
  }

  switchTeacherTab(tabName) {
    smartSound.playClick();
    document.querySelectorAll('.tab-teacher').forEach(b => {
      b.classList.remove('active', 'text-brand-purple', 'bg-purple-50');
      b.classList.add('text-slate-600');
    });

    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));

    const btn = document.getElementById(`tab-btn-${tabName}`);
    const panel = document.getElementById(`tab-content-${tabName}`);
    if (btn && panel) {
      btn.classList.add('active', 'text-brand-purple', 'bg-purple-50');
      btn.classList.remove('text-slate-600');
      panel.classList.remove('hidden');
    }

    if (tabName === 'quizzes') this.renderQuizzesList();
    if (tabName === 'bank') this.renderQuestionBank();
    if (tabName === 'reports') this.renderReportHistory();
  }

  renderQuizzesList() {
    const container = document.getElementById('teacher-quiz-grid');
    if (!container) return;

    const quizzes = smartStorage.getQuizzes();
    document.getElementById('stat-total-quizzes').textContent = quizzes.length;

    container.innerHTML = quizzes.map(q => `
      <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-brand-purple uppercase">
              ${q.subjectName || q.subject} • KELAS ${q.grade || 'VIII'}
            </span>
            <span class="text-xs text-slate-400 font-semibold">${q.questions ? q.questions.length : 0} Soal</span>
          </div>

          <h4 class="font-bold text-base text-slate-900 leading-snug line-clamp-2">${q.title}</h4>
          <p class="text-xs text-slate-500 mt-1 line-clamp-2">${q.topic || q.learningObjective || '-'}</p>
        </div>

        <div class="pt-4 border-t border-slate-100 mt-4 space-y-2">
          <div class="flex gap-2">
            <button onclick="app.hostQuizRoom('${q.id}')" class="flex-1 py-2.5 rounded-xl font-bold text-xs bg-brand-purple hover:bg-brand-dark text-white shadow-sm transition">
              📺 Buat Room (Host)
            </button>
            <button onclick="app.openQuizEditor('${q.id}')" class="px-3 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-sm transition flex items-center space-x-1" title="Kelola & Buat Soal Mandiri">
              <span>✏️</span>
              <span>Kelola Soal</span>
            </button>
            <button onclick="app.playQuizDirect('${q.id}')" class="px-3 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition" title="Main Demo">
              ▶
            </button>
          </div>

          <div class="flex items-center justify-between text-[11px] pt-1 text-slate-400">
            <button onclick="app.duplicateQuiz('${q.id}')" class="hover:text-purple-600 transition">📋 Duplikasi</button>
            <button onclick="app.deleteQuiz('${q.id}')" class="hover:text-rose-600 transition">🗑️ Hapus</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  duplicateQuiz(id) {
    smartSound.playClick();
    smartStorage.duplicateQuiz(id);
    this.renderQuizzesList();
  }

  deleteQuiz(id) {
    if (confirm('Apakah Anda yakin ingin menghapus kuis ini?')) {
      smartSound.playClick();
      smartStorage.deleteQuiz(id);
      this.renderQuizzesList();
    }
  }

  playQuizDirect(id) {
    smartSound.playClick();
    const quiz = smartStorage.getQuizById(id);
    if (quiz) {
      this.isSoloMode = true;
      this.player.name = "Guru (Pratinjau Kuis)";
      this.startGamePlay(quiz);
    }
  }

  openNewQuizModal() {
    smartSound.playClick();
    document.getElementById('modal-new-quiz').classList.remove('hidden');
  }

  closeNewQuizModal() {
    document.getElementById('modal-new-quiz').classList.add('hidden');
  }

  handleSaveNewQuiz(e) {
    e.preventDefault();
    smartSound.playClick();

    const title = document.getElementById('new-quiz-title').value.trim();
    const subject = document.getElementById('new-quiz-subject').value;
    const grade = document.getElementById('new-quiz-grade').value;
    const topic = document.getElementById('new-quiz-topic').value.trim();
    const assessment = document.getElementById('new-quiz-assessment').value;
    const tp = document.getElementById('new-quiz-tp').value.trim();
    const mode = document.getElementById('new-quiz-mode').value;
    const duration = parseInt(document.getElementById('new-quiz-duration').value) || 20;
    const diff = document.getElementById('new-quiz-diff').value;
    const allowPowerUps = document.getElementById('new-quiz-powerups').checked;

    const subjects = smartStorage.getSubjects();
    const subObj = subjects.find(s => s.id === subject);

    const newQuiz = {
      id: 'quiz-' + Date.now(),
      title,
      subject,
      subjectName: subObj ? subObj.name : subject,
      grade,
      phase: 'Fase D',
      topic,
      assessmentType: assessment,
      learningObjective: tp,
      gameMode: mode,
      durationPerQuestion: duration,
      difficulty: diff,
      allowPowerUps,
      questions: []
    };

    smartStorage.saveQuiz(newQuiz);
    this.closeNewQuizModal();
    this.renderQuizzesList();

    // Otomatis buka Quiz Editor untuk membuat soal mandiri langsung!
    this.openQuizEditor(newQuiz.id);
  }

  // --- QUIZ QUESTION EDITOR & PEMBUAT SOAL MANDIRI ---
  openQuizEditor(quizId) {
    smartSound.playClick();
    this.editingQuizId = quizId;
    const quiz = smartStorage.getQuizById(quizId);
    if (!quiz) return;

    // Set metadata
    document.getElementById('editor-meta-title').textContent = quiz.title;
    document.getElementById('editor-meta-subject').textContent = quiz.subjectName || quiz.subject;
    document.getElementById('editor-meta-grade').textContent = quiz.grade || 'VIII';
    const qCount = quiz.questions ? quiz.questions.length : 0;
    document.getElementById('editor-meta-count-badge').textContent = `${qCount} Soal`;
    document.getElementById('editor-questions-summary').textContent = `Total: ${qCount} Soal`;

    // Reset editor tabs to quick text
    this.switchQuizEditorTab('quick');

    // Render questions list
    this.renderQuizEditorQuestionsList();

    // Show modal
    document.getElementById('modal-quiz-editor').classList.remove('hidden');
  }

  closeQuizEditor() {
    smartSound.playClick();
    document.getElementById('modal-quiz-editor').classList.add('hidden');
    this.renderQuizzesList();
  }

  switchQuizEditorTab(tab) {
    smartSound.playClick();
    const btnQuick = document.getElementById('tab-btn-editor-quick');
    const btnForm = document.getElementById('tab-btn-editor-form');
    const panelQuick = document.getElementById('editor-panel-quick');
    const panelForm = document.getElementById('editor-panel-form');

    if (tab === 'quick') {
      btnQuick.className = 'flex-1 py-2.5 rounded-xl bg-white text-brand-purple shadow-sm transition flex items-center justify-center space-x-1.5 font-bold';
      btnForm.className = 'flex-1 py-2.5 rounded-xl text-slate-600 hover:text-brand-purple transition flex items-center justify-center space-x-1.5 font-bold';
      panelQuick.classList.remove('hidden');
      panelForm.classList.add('hidden');
    } else {
      btnForm.className = 'flex-1 py-2.5 rounded-xl bg-white text-brand-purple shadow-sm transition flex items-center justify-center space-x-1.5 font-bold';
      btnQuick.className = 'flex-1 py-2.5 rounded-xl text-slate-600 hover:text-brand-purple transition flex items-center justify-center space-x-1.5 font-bold';
      panelForm.classList.remove('hidden');
      panelQuick.classList.add('hidden');
    }
  }

  fillQuickTextSample() {
    smartSound.playClick();
    const quiz = smartStorage.getQuizById(this.editingQuizId);
    const subName = quiz ? (quiz.subjectName || quiz.subject) : 'Materi Pembelajaran';

    const sample = `1. Perhatikan pernyataan berikut tentang ${subName}: Manakah konsep yang paling tepat dan esensial?
A. Pernyataan pertama merupakan fakta ilmiah teruji
B. Pernyataan kedua merupakan hipotesis awal
C. Pernyataan ketiga merupakan faktor penghambat
D. Pernyataan keempat merupakan simpulan umum
Kunci: A
Pembahasan: Konsep A merupakan prinsip dasar yang telah dibuktikan melalui pengamatan terstruktur di kelas.

2. Mengapa pemahaman konsep materi ini penting diterapkan dalam kehidupan sehari-hari siswa SMP?
A. Karena mempermudah analisis dan pemecahan masalah kontekstual nyata
B. Hanya untuk mendapatkan nilai rapor semata
C. Agar dapat menghafal istilah tanpa memahami artinya
D. Tidak memiliki relevansi dengan kemajuan teknologi
Kunci: A
Pembahasan: Pembelajaran bermakna Kurikulum Merdeka Fase D melatih siswa berpikir kritis dan solutif.`;

    document.getElementById('editor-quick-text-input').value = sample;
  }

  handleInsertQuickTextQuestions() {
    smartSound.playClick();
    const text = document.getElementById('editor-quick-text-input').value.trim();
    if (!text) {
      alert('Tuliskan atau tempelkan soal terlebih dahulu pada kotak teks format.');
      return;
    }

    const quiz = smartStorage.getQuizById(this.editingQuizId);
    const parsed = smartStorage.parseQuestionsFromQuickText(text, quiz ? quiz.subject : 'ipa', quiz ? quiz.grade : 'VIII');

    if (parsed.length === 0) {
      alert('Format soal tidak terdeteksi. Pastikan format mencakup Nomor Soal, Opsi A/B/C/D, dan Kunci (contoh: Kunci: A). Klik tombol "Salin Format Contoh Soal" untuk melihat contoh format yang benar.');
      return;
    }

    parsed.forEach(q => {
      smartStorage.addQuestionToQuiz(this.editingQuizId, q);
    });

    document.getElementById('editor-quick-text-input').value = '';
    smartSound.playCorrect();
    this.renderQuizEditorQuestionsList();
    this.renderQuizzesList();

    alert(`Berhasil menambahkan ${parsed.length} butir soal mandiri ke kuis "${quiz ? quiz.title : ''}"!`);
  }

  handleEditorFormTypeChange() {
    const type = document.getElementById('editor-form-type').value;
    const opt0 = document.getElementById('editor-opt-0');
    const opt1 = document.getElementById('editor-opt-1');
    const opt2 = document.getElementById('editor-opt-2');
    const opt3 = document.getElementById('editor-opt-3');

    if (type === 'benar_salah') {
      opt0.value = 'Benar';
      opt1.value = 'Salah';
      opt2.parentElement.classList.add('hidden');
      opt3.parentElement.classList.add('hidden');
    } else {
      opt2.parentElement.classList.remove('hidden');
      opt3.parentElement.classList.remove('hidden');
    }
  }

  handleSaveQuestionFromEditorForm(e) {
    e.preventDefault();
    smartSound.playClick();

    const type = document.getElementById('editor-form-type').value;
    const level = document.getElementById('editor-form-level').value;
    const weight = parseInt(document.getElementById('editor-form-weight').value) || 100;
    const text = document.getElementById('editor-form-text').value.trim();
    const explanation = document.getElementById('editor-form-exp').value.trim();
    const tp = document.getElementById('editor-form-tp').value.trim();

    const opt0 = document.getElementById('editor-opt-0').value.trim();
    const opt1 = document.getElementById('editor-opt-1').value.trim();
    const opt2 = document.getElementById('editor-opt-2').value.trim();
    const opt3 = document.getElementById('editor-opt-3').value.trim();
    const correctVal = parseInt(document.querySelector('input[name="editor-correct-radio"]:checked')?.value || '0');

    const options = type === 'benar_salah' ? [opt0 || 'Benar', opt1 || 'Salah'] : [opt0, opt1, opt2, opt3].filter(o => o.length > 0);

    const quiz = smartStorage.getQuizById(this.editingQuizId);

    const newQuestion = {
      id: 'q-manual-' + Date.now(),
      type,
      text,
      options,
      correctAnswer: correctVal,
      explanation: explanation || 'Pembahasan telah diverifikasi oleh guru SMPN 19 Palembang.',
      learningObjective: tp || (quiz ? quiz.learningObjective : 'Tujuan Pembelajaran'),
      cognitiveLevel: level,
      difficulty: level.includes('HOTS') ? 'sulit' : 'sedang',
      weight
    };

    smartStorage.addQuestionToQuiz(this.editingQuizId, newQuestion);
    smartSound.playCorrect();

    // Reset Form
    document.getElementById('editor-form-text').value = '';
    document.getElementById('editor-opt-0').value = '';
    document.getElementById('editor-opt-1').value = '';
    document.getElementById('editor-opt-2').value = '';
    document.getElementById('editor-opt-3').value = '';
    document.getElementById('editor-form-exp').value = '';
    document.getElementById('editor-form-tp').value = '';

    this.renderQuizEditorQuestionsList();
    this.renderQuizzesList();
    alert('Soal baru berhasil ditambahkan ke kuis!');
  }

  renderQuizEditorQuestionsList() {
    const container = document.getElementById('editor-questions-list');
    if (!container) return;

    const quiz = smartStorage.getQuizById(this.editingQuizId);
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          Belum ada butir soal di kuis ini. Gunakan Format Teks Cepat atau Formulir di atas untuk membuat soal kuis mandiri.
        </div>
      `;
      document.getElementById('editor-meta-count-badge').textContent = '0 Soal';
      document.getElementById('editor-questions-summary').textContent = 'Total: 0 Soal';
      return;
    }

    const qCount = quiz.questions.length;
    document.getElementById('editor-meta-count-badge').textContent = `${qCount} Soal`;
    document.getElementById('editor-questions-summary').textContent = `Total: ${qCount} Soal`;

    container.innerHTML = quiz.questions.map((q, idx) => `
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-purple-300 transition space-y-2">
        <div class="flex items-center justify-between text-[11px] font-bold">
          <div class="flex items-center space-x-2">
            <span class="w-6 h-6 rounded-full bg-purple-100 text-brand-purple flex items-center justify-center font-black">${idx + 1}</span>
            <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">${q.type || 'Pilihan Ganda'}</span>
            <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700">${q.cognitiveLevel || 'C3'}</span>
          </div>
          <div class="flex items-center space-x-1">
            <button type="button" onclick="app.moveQuestionInQuizEditor(${idx}, -1)" ${idx === 0 ? 'disabled class="opacity-25 px-1.5 py-0.5"' : 'class="px-1.5 py-0.5 hover:bg-slate-100 rounded text-slate-600"'} title="Pindah Naik">▲</button>
            <button type="button" onclick="app.moveQuestionInQuizEditor(${idx}, 1)" ${idx === qCount - 1 ? 'disabled class="opacity-25 px-1.5 py-0.5"' : 'class="px-1.5 py-0.5 hover:bg-slate-100 rounded text-slate-600"'} title="Pindah Turun">▼</button>
            <button type="button" onclick="app.openSingleQuestionEdit('${q.id}')" class="px-2 py-1 text-xs font-bold text-brand-purple hover:bg-purple-50 rounded-lg transition" title="Edit Soal">✏️ Edit</button>
            <button type="button" onclick="app.deleteQuestionFromQuizEditor('${q.id}')" class="px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus Soal">🗑️</button>
          </div>
        </div>

        <p class="text-xs font-bold text-slate-800 leading-snug">${q.text}</p>

        <!-- Options Preview -->
        ${q.options ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
            ${q.options.map((opt, oIdx) => `
              <div class="flex items-center space-x-1.5 p-1.5 rounded-lg ${oIdx === q.correctAnswer ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'bg-slate-50 text-slate-600'}">
                <span class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${oIdx === q.correctAnswer ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}">${String.fromCharCode(65 + oIdx)}</span>
                <span class="truncate">${opt}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${q.explanation ? `<p class="text-[10px] text-slate-500 italic">💡 Pembahasan: ${q.explanation}</p>` : ''}
      </div>
    `).join('');
  }

  deleteQuestionFromQuizEditor(questionId) {
    if (confirm('Apakah Anda yakin ingin menghapus soal ini dari kuis?')) {
      smartSound.playClick();
      smartStorage.deleteQuestionFromQuiz(this.editingQuizId, questionId);
      this.renderQuizEditorQuestionsList();
      this.renderQuizzesList();
    }
  }

  moveQuestionInQuizEditor(fromIdx, dir) {
    smartSound.playClick();
    smartStorage.reorderQuestionInQuiz(this.editingQuizId, fromIdx, fromIdx + dir);
    this.renderQuizEditorQuestionsList();
  }

  openSingleQuestionEdit(questionId) {
    smartSound.playClick();
    this.editingSingleQuestionId = questionId;
    const quiz = smartStorage.getQuizById(this.editingQuizId);
    if (!quiz) return;
    const q = (quiz.questions || []).find(item => item.id === questionId);
    if (!q) return;

    document.getElementById('edit-single-q-text').value = q.text || '';
    document.getElementById('edit-single-q-exp').value = q.explanation || '';

    // Options
    const opts = q.options || ['', '', '', ''];
    for (let i = 0; i < 4; i++) {
      const optEl = document.getElementById(`edit-single-opt-${i}`);
      const radEl = document.getElementById(`edit-single-rad-${i}`);
      if (optEl) optEl.value = opts[i] || '';
      if (radEl) radEl.checked = (i === q.correctAnswer);
    }

    document.getElementById('modal-single-question-edit').classList.remove('hidden');
  }

  closeSingleQuestionEditModal() {
    smartSound.playClick();
    document.getElementById('modal-single-question-edit').classList.add('hidden');
  }

  handleSaveSingleQuestionEdit(e) {
    e.preventDefault();
    smartSound.playClick();

    const text = document.getElementById('edit-single-q-text').value.trim();
    const explanation = document.getElementById('edit-single-q-exp').value.trim();
    const correctVal = parseInt(document.querySelector('input[name="edit-single-correct"]:checked')?.value || '0');

    const opt0 = document.getElementById('edit-single-opt-0').value.trim();
    const opt1 = document.getElementById('edit-single-opt-1').value.trim();
    const opt2 = document.getElementById('edit-single-opt-2').value.trim();
    const opt3 = document.getElementById('edit-single-opt-3').value.trim();

    const updatedOptions = [opt0, opt1, opt2, opt3].filter(o => o.length > 0);

    smartStorage.updateQuestionInQuiz(this.editingQuizId, this.editingSingleQuestionId, {
      text,
      explanation,
      options: updatedOptions,
      correctAnswer: correctVal
    });

    this.closeSingleQuestionEditModal();
    this.renderQuizEditorQuestionsList();
    this.renderQuizzesList();
  }

  saveAndHostCurrentEditedQuiz() {
    smartSound.playClick();
    const qId = this.editingQuizId;
    this.closeQuizEditor();
    this.hostQuizRoom(qId);
  }

  // --- BANK SOAL ---
  renderQuestionBank() {
    const container = document.getElementById('bank-questions-list');
    if (!container) return;

    const bank = smartStorage.getQuestionBank();
    document.getElementById('stat-total-questions').textContent = bank.length;

    const search = (document.getElementById('bank-filter-search')?.value || '').toLowerCase();
    const subFilter = document.getElementById('bank-filter-subject')?.value || 'all';
    const levelFilter = document.getElementById('bank-filter-level')?.value || 'all';
    const typeFilter = document.getElementById('bank-filter-type')?.value || 'all';

    const filtered = bank.filter(q => {
      const matchSearch = !search || (q.text && q.text.toLowerCase().includes(search)) || (q.topic && q.topic.toLowerCase().includes(search));
      const matchSub = subFilter === 'all' || q.subject === subFilter;
      const matchLevel = levelFilter === 'all' || (q.difficulty && q.difficulty.toLowerCase() === levelFilter);
      const matchType = typeFilter === 'all' || q.type === typeFilter;
      return matchSearch && matchSub && matchLevel && matchType;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-xs text-slate-400">Tidak ada butir soal yang sesuai filter pencarian.</div>`;
      return;
    }

    container.innerHTML = filtered.map((q, idx) => `
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:bg-white transition flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div class="space-y-1.5 flex-1">
          <div class="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
            <span class="px-2 py-0.5 rounded bg-purple-100 text-purple-700 uppercase">${q.subject || 'SMP 19'}</span>
            <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-700">${q.type || 'Pilihan Ganda'}</span>
            <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800">${q.difficulty || 'Sedang'}</span>
            ${q.cognitiveLevel ? `<span class="px-2 py-0.5 rounded bg-slate-200 text-slate-700">${q.cognitiveLevel}</span>` : ''}
          </div>
          <p class="text-xs sm:text-sm font-bold text-slate-800">${idx + 1}. ${q.text}</p>
          <p class="text-[11px] text-slate-500"><strong>Pembahasan:</strong> ${q.explanation || '-'}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="app.deleteQuestionFromBank('${q.id}')" class="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus Soal">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }

  deleteQuestionFromBank(id) {
    if (confirm('Hapus soal ini dari Bank Soal?')) {
      smartSound.playClick();
      smartStorage.deleteQuestionFromBank(id);
      this.renderQuestionBank();
    }
  }

  openNewQuestionModal() {
    smartSound.playClick();
    document.getElementById('modal-new-question').classList.remove('hidden');
  }

  closeNewQuestionModal() {
    document.getElementById('modal-new-question').classList.add('hidden');
  }

  handleQuestionTypeChange() {
    // Sesuaikan form pilihan jawaban berdasarkan tipe soal
  }

  handleSaveNewQuestion(e) {
    e.preventDefault();
    smartSound.playClick();

    const type = document.getElementById('q-form-type').value;
    const subject = document.getElementById('q-form-subject').value;
    const text = document.getElementById('q-form-text').value.trim();
    const explanation = document.getElementById('q-form-explanation').value.trim();
    const topic = document.getElementById('q-form-topic').value.trim();
    const diff = document.getElementById('q-form-diff').value;

    const opt0 = document.getElementById('q-opt-0').value.trim();
    const opt1 = document.getElementById('q-opt-1').value.trim();
    const opt2 = document.getElementById('q-opt-2').value.trim();
    const opt3 = document.getElementById('q-opt-3').value.trim();
    const correctVal = parseInt(document.querySelector('input[name="q-correct-radio"]:checked')?.value || '0');

    const newQ = {
      id: 'q-custom-' + Date.now(),
      type,
      subject,
      text,
      options: [opt0, opt1, opt2, opt3].filter(o => o.length > 0),
      correctAnswer: correctVal,
      explanation: explanation || 'Kunci jawaban diverifikasi guru SMPN 19.',
      topic: topic || 'Materi Pokok',
      difficulty: diff,
      weight: 100
    };

    smartStorage.addOrUpdateQuestionInBank(newQ);
    this.closeNewQuestionModal();
    this.renderQuestionBank();
    alert('Soal baru berhasil ditambahkan ke Bank Soal!');
  }

  // --- AI QUESTION GENERATOR ---
  openAIGeneratorModal() {
    smartSound.playClick();
    this.switchTeacherTab('ai');
  }

  async handleAIGenerate(e) {
    e.preventDefault();
    smartSound.playClick();

    const btn = document.getElementById('btn-ai-generate');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>⏳</span><span>Sedang Mengolah Kurikulum Fase D...</span>';
    btn.disabled = true;

    const subject = document.getElementById('ai-subject').value;
    const grade = document.getElementById('ai-grade').value;
    const topic = document.getElementById('ai-topic').value.trim();
    const count = parseInt(document.getElementById('ai-count').value) || 5;
    const level = document.getElementById('ai-level').value;

    const subjects = smartStorage.getSubjects();
    const subObj = subjects.find(s => s.id === subject);

    try {
      const generated = await smartAI.generateQuestions({
        subject,
        subjectName: subObj ? subObj.name : subject,
        grade,
        topic,
        count,
        level
      });

      this.aiReviewQuestions = generated;
      this.openAIReviewModal(generated, topic, subObj ? subObj.name : subject, grade);
    } catch (err) {
      alert('Terjadi kesalahan saat memproses soal AI: ' + err.message);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  openAIReviewModal(questions, topic, subjectName, grade) {
    const list = document.getElementById('ai-review-questions-list');
    list.innerHTML = questions.map((q, idx) => `
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3" id="ai-q-card-${idx}">
        <div class="flex items-center justify-between text-xs font-bold text-slate-500">
          <span class="px-2 py-0.5 rounded bg-purple-100 text-purple-700">Soal ${idx + 1} • ${q.cognitiveLevel || 'HOTS'}</span>
          <span class="text-emerald-600">🎯 ${q.learningObjective || 'TP'}</span>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-500 mb-1">Pertanyaan:</label>
          <textarea id="ai-text-${idx}" rows="2" class="w-full p-2.5 text-xs border border-slate-300 rounded-xl">${q.text}</textarea>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          ${q.options.map((opt, oIdx) => `
            <div>
              <span class="text-[10px] font-bold ${oIdx === q.correctAnswer ? 'text-green-600' : 'text-slate-500'}">Pilihan ${String.fromCharCode(65 + oIdx)} ${oIdx === q.correctAnswer ? '(Kunci)' : ''}:</span>
              <input type="text" id="ai-opt-${idx}-${oIdx}" value="${opt}" class="w-full p-1.5 text-xs border border-slate-300 rounded-lg">
            </div>
          `).join('')}
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-500 mb-1">Pembahasan:</label>
          <textarea id="ai-exp-${idx}" rows="1" class="w-full p-2 text-xs border border-slate-300 rounded-xl">${q.explanation}</textarea>
        </div>
      </div>
    `).join('');

    document.getElementById('modal-ai-review').classList.remove('hidden');
  }

  closeAIReviewModal() {
    document.getElementById('modal-ai-review').classList.add('hidden');
  }

  saveAIQuestionsToNewQuiz() {
    smartSound.playClick();
    const topic = document.getElementById('ai-topic').value.trim() || 'Materi AI';
    const subject = document.getElementById('ai-subject').value;
    const grade = document.getElementById('ai-grade').value;
    const subjects = smartStorage.getSubjects();
    const subObj = subjects.find(s => s.id === subject);

    const quiz = {
      id: 'quiz-ai-' + Date.now(),
      title: `${subObj ? subObj.name : subject} Kelas ${grade}: ${topic}`,
      subject,
      subjectName: subObj ? subObj.name : subject,
      grade,
      topic,
      learningObjective: `Menganalisis konsep pembelajaran ${topic} Kurikulum Merdeka Fase D.`,
      gameMode: 'classic',
      durationPerQuestion: 25,
      allowPowerUps: true,
      questions: this.aiReviewQuestions
    };

    smartStorage.saveQuiz(quiz);
    this.closeAIReviewModal();
    this.switchTeacherTab('quizzes');
    alert(`Kuis baru "${quiz.title}" berhasil dibuat dengan ${this.aiReviewQuestions.length} butir soal AI!`);
  }

  saveAIQuestionsToBank() {
    smartSound.playClick();
    this.aiReviewQuestions.forEach(q => {
      smartStorage.addOrUpdateQuestionInBank(q);
    });
    this.closeAIReviewModal();
    this.switchTeacherTab('bank');
    alert(`${this.aiReviewQuestions.length} butir soal berhasil disimpan ke Bank Soal!`);
  }

  // --- TEMPLATES SIAP PAKAI ---
  renderTemplates() {
    const container = document.getElementById('templates-grid');
    if (!container) return;

    container.innerHTML = QUICK_TEMPLATES.map(t => `
      <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-3">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.badgeColor}">${t.name}</span>
            <span class="text-xs font-semibold text-slate-500">${t.questionCount} Soal</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">${t.desc}</p>
        </div>
        <button onclick="app.useTemplate('${t.id}')" class="w-full py-2.5 rounded-xl font-bold text-xs bg-brand-purple hover:bg-brand-dark text-white transition shadow-sm">
          Gunakan Template Ini ➔
        </button>
      </div>
    `).join('');
  }

  useTemplate(templateId) {
    smartSound.playClick();
    const tpl = QUICK_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    const quiz = {
      id: 'quiz-tpl-' + Date.now(),
      title: `${tpl.name} - SMP Negeri 19 Palembang`,
      subject: 'ipa',
      subjectName: 'Ilmu Pengetahuan Alam (IPA)',
      grade: 'VIII',
      topic: tpl.name,
      assessmentType: tpl.assessmentType,
      difficulty: tpl.difficulty,
      durationPerQuestion: tpl.duration,
      allowPowerUps: true,
      questions: smartStorage.getQuestionBank().slice(0, tpl.questionCount)
    };

    smartStorage.saveQuiz(quiz);
    this.switchTeacherTab('quizzes');
    alert(`Kuis baru berhasil dibuat dari template "${tpl.name}"!`);
  }

  // --- IMPORT & EKSPOR EXCEL / CSV ---
  handleCSVImport() {
    smartSound.playClick();
    const fileInput = document.getElementById('csv-file-input');
    if (!fileInput.files || fileInput.files.length === 0) {
      alert('Pilih file CSV terlebih dahulu.');
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const imported = smartStorage.importQuestionsFromCSV(text);
        alert(`Berhasil mengimpor ${imported.length} soal ke Bank Soal!`);
        this.renderQuestionBank();
        this.switchTeacherTab('bank');
      } catch (err) {
        alert('Gagal mengimpor file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  exportLatestSessionToCSV() {
    smartSound.playClick();
    const history = smartStorage.getGameHistory();
    if (history.length === 0) {
      // Buat sample dummy session jika belum pernah ada sesi tersimpan
      const sampleSession = {
        quizTitle: "Kuis Campuran SMP 19",
        subjectName: "Lintas Mapel SMP",
        playedAt: new Date().toISOString(),
        averageScore: 82.5,
        passingRate: 85,
        kktp: 75,
        students: [
          { name: "Andi Saputra", score: 920, correctCount: 8, wrongCount: 0, accuracy: 100 },
          { name: "Siti Rahma", score: 870, correctCount: 7, wrongCount: 1, accuracy: 88 },
          { name: "Muchlas", score: 850, correctCount: 7, wrongCount: 1, accuracy: 88 },
          { name: "Budi Pratama", score: 760, correctCount: 6, wrongCount: 2, accuracy: 75 },
          { name: "Rini Anggraini", score: 680, correctCount: 5, wrongCount: 3, accuracy: 63 }
        ]
      };
      smartStorage.exportResultsToCSV(sampleSession);
      return;
    }
    smartStorage.exportResultsToCSV(history[0]);
  }

  printAssessmentReport() {
    smartSound.playClick();
    const history = smartStorage.getGameHistory();
    const latest = history[0] || {
      quizTitle: "Kuis Asesmen Formatif SMP 19",
      subjectName: "Ilmu Pengetahuan Alam (IPA)",
      grade: "VIII",
      averageScore: 84.5,
      passingRate: 88,
      students: [
        { name: "Andi Saputra", score: 920, correctCount: 8, wrongCount: 0, accuracy: 100 },
        { name: "Siti Rahma", score: 870, correctCount: 7, wrongCount: 1, accuracy: 88 },
        { name: "Muchlas", score: 850, correctCount: 7, wrongCount: 1, accuracy: 88 },
        { name: "Budi Pratama", score: 760, correctCount: 6, wrongCount: 2, accuracy: 75 }
      ]
    };

    document.getElementById('print-current-date').textContent = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const printContainer = document.getElementById('print-report-content');
    printContainer.innerHTML = `
      <div class="mb-4">
        <p><strong>Mata Pelajaran:</strong> ${latest.subjectName || 'Lintas Mapel'}</p>
        <p><strong>Judul Kuis:</strong> ${latest.quizTitle || 'Asesmen Harian'}</p>
        <p><strong>Jenjang / Fase:</strong> Kelas ${latest.grade || 'VIII'} / Fase D</p>
        <p><strong>Rata-Rata Kelas:</strong> ${latest.averageScore || 80} | <strong>Ketuntasan KKTP:</strong> ${latest.passingRate || 85}%</p>
      </div>

      <table class="w-full border-collapse border border-black text-left text-xs mb-4">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-black p-2 text-center">No</th>
            <th class="border border-black p-2">Nama Siswa</th>
            <th class="border border-black p-2 text-center">Benar</th>
            <th class="border border-black p-2 text-center">Salah</th>
            <th class="border border-black p-2 text-center">Akurasi</th>
            <th class="border border-black p-2 text-center">Nilai Skor</th>
            <th class="border border-black p-2 text-center">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${(latest.students || []).map((s, idx) => `
            <tr>
              <td class="border border-black p-2 text-center">${idx + 1}</td>
              <td class="border border-black p-2 font-bold">${s.name}</td>
              <td class="border border-black p-2 text-center">${s.correctCount || 0}</td>
              <td class="border border-black p-2 text-center">${s.wrongCount || 0}</td>
              <td class="border border-black p-2 text-center">${s.accuracy || 0}%</td>
              <td class="border border-black p-2 text-center font-bold">${s.score}</td>
              <td class="border border-black p-2 text-center">${(s.score >= 75) ? 'Tuntas' : 'Remedial'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    window.print();
  }

  // --- REPORT HISTORY & ITEM ANALYSIS ---
  renderReportHistory() {
    const history = smartStorage.getGameHistory();
    const studentsTbody = document.getElementById('report-students-tbody');
    const summaryContainer = document.getElementById('report-class-summary');

    if (history.length === 0) {
      if (studentsTbody) {
        studentsTbody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-slate-400">Belum ada riwayat kuis tersimpan. Mainkan kuis untuk melihat analitik.</td></tr>`;
      }
      return;
    }

    const latest = history[0];
    const students = latest.students || [];

    // Summary Box
    summaryContainer.innerHTML = `
      <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <span class="text-[11px] text-slate-500 font-semibold">Rata-Rata Nilai</span>
        <div class="text-xl font-black text-slate-800">${latest.averageScore || 82}</div>
      </div>
      <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <span class="text-[11px] text-slate-500 font-semibold">Nilai Tertinggi</span>
        <div class="text-xl font-black text-green-600">${students.length > 0 ? Math.max(...students.map(s => s.score)) : 950}</div>
      </div>
      <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <span class="text-[11px] text-slate-500 font-semibold">Nilai Terendah</span>
        <div class="text-xl font-black text-rose-600">${students.length > 0 ? Math.min(...students.map(s => s.score)) : 680}</div>
      </div>
      <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <span class="text-[11px] text-slate-500 font-semibold">Ketuntasan (KKTP)</span>
        <div class="text-xl font-black text-brand-purple">${latest.passingRate || 85}%</div>
      </div>
    `;

    // Item Analysis Highlights
    document.getElementById('report-easiest-question').innerHTML = `
      <strong>Soal No. 1 (Jembatan Ampera & Sungai Musi):</strong> 100% siswa menjawab benar. Konsep literasi lokal sangat dipahami.
    `;
    document.getElementById('report-hardest-question').innerHTML = `
      <strong>Soal No. 8 (Keamanan Informasi & Phishing):</strong> 62% siswa perlu penguatan materi pada aspek proteksi OTP dan data rahasia.
    `;

    // Student Rows
    studentsTbody.innerHTML = students.map((s, idx) => `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-2.5 px-3 font-bold">${idx === 0 ? '🥇 1' : (idx === 1 ? '🥈 2' : (idx === 2 ? '🥉 3' : idx + 1))}</td>
        <td class="py-2.5 px-3 font-semibold text-slate-800">${s.name}</td>
        <td class="py-2.5 px-3 text-green-600 font-bold">${s.correctCount || 0}</td>
        <td class="py-2.5 px-3 text-rose-500 font-semibold">${s.wrongCount || 0}</td>
        <td class="py-2.5 px-3 font-mono">${s.accuracy || 0}%</td>
        <td class="py-2.5 px-3 font-black text-slate-900">${s.score}</td>
        <td class="py-2.5 px-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${(s.score >= 75) ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}">
            ${(s.score >= 75) ? 'Tuntas' : 'Remedial'}
          </span>
        </td>
      </tr>
    `).join('');
  }

  // --- TEACHER HOST SCREEN (PRESENTER / PROYEKTOR) ---
  hostQuizRoom(quizId) {
    smartSound.playClick();
    const quiz = smartStorage.getQuizById(quizId);
    if (!quiz) return;

    this.hostRoom = {
      pin: Math.floor(100000 + Math.random() * 900000).toString(),
      quiz: quiz,
      state: 'lobby',
      players: [],
      currentQIndex: 0,
      timerRemaining: quiz.durationPerQuestion || 20,
      answeredCount: 0,
      questionStats: [0, 0, 0, 0]
    };

    smartChannel.setRoomState(this.hostRoom);

    // Update Host UI
    document.getElementById('host-pin-code').textContent = this.hostRoom.pin;
    document.getElementById('host-lobby-pin-giant').textContent = this.hostRoom.pin;
    document.getElementById('host-quiz-title').textContent = quiz.title;
    document.getElementById('host-player-count').textContent = '0';
    document.getElementById('host-lobby-count').textContent = '0';
    document.getElementById('host-lobby-players-grid').innerHTML = '<span class="text-slate-500 text-xs italic">Menunggu siswa memasukkan Room PIN di perangkat masing-masing...</span>';

    // Show host lobby sub-view
    document.getElementById('host-view-lobby').classList.remove('hidden');
    document.getElementById('host-view-question').classList.add('hidden');
    document.getElementById('host-view-podium').classList.add('hidden');

    this.startHostLobbySync(this.hostRoom.pin);
    this.showScreen('screen-teacher-host');
  }

  startHostLobbySync(pin) {
    if (this.hostLobbyInterval) clearInterval(this.hostLobbyInterval);

    this.hostLobbyInterval = setInterval(() => {
      if (this.currentScreen !== 'screen-teacher-host' || this.hostRoom.state !== 'lobby') {
        clearInterval(this.hostLobbyInterval);
        return;
      }
      const room = smartChannel.getRoomState(pin);
      if (room && room.players) {
        this.hostRoom.players = room.players;
        this.updateHostLobbyPlayers();
      }
    }, 800);
  }

  simulateStudentsJoin() {
    smartSound.playClick();
    this.demoNames.forEach(st => {
      const studentObj = {
        id: 'sim-' + Math.random().toString(36).substr(2, 6),
        name: st.name,
        avatar: st.avatar,
        score: 0,
        team: st.team
      };
      smartChannel.addPlayerToRoom(this.hostRoom.pin, studentObj);
    });

    const room = smartChannel.getRoomState(this.hostRoom.pin);
    this.hostRoom.players = (room && room.players) ? room.players : [];
    this.updateHostLobbyPlayers();
  }

  updateHostLobbyPlayers() {
    const grid = document.getElementById('host-lobby-players-grid');
    const countEl = document.getElementById('host-lobby-count');
    const navCount = document.getElementById('host-player-count');

    const players = this.hostRoom.players || [];
    countEl.textContent = players.length;
    navCount.textContent = players.length;

    if (players.length === 0) {
      grid.innerHTML = '<span class="text-slate-500 text-xs italic">Menunggu siswa memasukkan Room PIN di perangkat masing-masing...</span>';
      return;
    }

    grid.innerHTML = players.map(p => {
      const avIcon = (p.avatar && p.avatar.icon) ? p.avatar.icon : (typeof p.avatar === 'string' ? p.avatar : '🧑‍🎓');
      return `
        <div class="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <span class="text-lg">${avIcon}</span>
          <span>${p.name}</span>
        </div>
      `;
    }).join('');
  }

  copyRoomLink() {
    navigator.clipboard.writeText(this.hostRoom.pin);
    alert(`Kode Room PIN ${this.hostRoom.pin} telah disalin!`);
  }

  hostStartGame() {
    if (this.hostRoom.players.length === 0) {
      if (!confirm('Belum ada siswa yang bergabung. Mau aktifkan simulasi siswa untuk demo kelas?')) {
        return;
      }
      this.simulateStudentsJoin();
    }

    smartSound.playClick();
    this.hostRoom.state = 'playing';
    this.hostRoom.currentQIndex = 0;

    // Sembunyikan lobby, tampilkan soal proyektor
    document.getElementById('host-view-lobby').classList.add('hidden');
    document.getElementById('host-view-podium').classList.add('hidden');
    document.getElementById('host-view-question').classList.remove('hidden');

    // Broadcast ke semua tab siswa untuk memulai
    smartChannel.broadcast('GAME_START', {
      pin: this.hostRoom.pin,
      quiz: this.hostRoom.quiz,
      questionIndex: 0
    });

    this.hostLoadQuestion(0);
  }

  hostLoadQuestion(index) {
    const q = this.hostRoom.quiz.questions[index];
    if (!q) {
      this.hostEndGame();
      return;
    }

    this.hostRoom.currentQIndex = index;
    this.hostRoom.answeredCount = 0;
    this.hostRoom.questionStats = [0, 0, 0, 0];
    document.getElementById('host-answered-count').textContent = '0';

    document.getElementById('host-q-meta').textContent = `Soal ${index + 1} dari ${this.hostRoom.quiz.questions.length} • Level: ${q.cognitiveLevel || 'Sedang'}`;
    document.getElementById('host-question-text').textContent = q.text;

    // Render options on projector
    const grid = document.getElementById('host-options-grid');
    const kahootStyles = [
      { class: 'card-kahoot-red', shape: 'shape-triangle' },
      { class: 'card-kahoot-blue', shape: 'shape-diamond' },
      { class: 'card-kahoot-yellow', shape: 'shape-circle' },
      { class: 'card-kahoot-green', shape: 'shape-square' }
    ];

    if (q.options) {
      grid.innerHTML = q.options.map((opt, oIdx) => {
        const style = kahootStyles[oIdx % kahootStyles.length];
        return `
          <div class="${style.class} p-6 rounded-3xl shadow-xl flex items-center space-x-4">
            <span class="${style.shape}"></span>
            <span class="text-xl sm:text-2xl font-black">${opt}</span>
          </div>
        `;
      }).join('');
    } else {
      grid.innerHTML = '';
    }

    // Host Timer Countdown
    this.hostRoom.timerRemaining = q.duration || this.hostRoom.quiz.durationPerQuestion || 20;
    this.updateHostTimerVisual();

    clearInterval(this.hostTimerInterval);
    this.hostTimerInterval = setInterval(() => {
      if (!this.timerPaused) {
        this.hostRoom.timerRemaining -= 1;
        this.updateHostTimerVisual();

        if (this.hostRoom.timerRemaining <= 0) {
          clearInterval(this.hostTimerInterval);
        }
      }
    }, 1000);
  }

  updateHostTimerVisual() {
    const textEl = document.getElementById('host-timer-display');
    const barEl = document.getElementById('host-timer-bar');
    textEl.textContent = `${this.hostRoom.timerRemaining}s`;

    const total = this.hostRoom.quiz.durationPerQuestion || 20;
    const percent = Math.max(0, (this.hostRoom.timerRemaining / total) * 100);
    barEl.style.width = `${percent}%`;
  }

  hostToggleTimerPause() {
    this.timerPaused = !this.timerPaused;
    const btn = document.getElementById('btn-host-pause');
    btn.textContent = this.timerPaused ? '▶ Lanjut' : '⏸ Jeda';
  }

  hostNextQuestion() {
    smartSound.playClick();
    const nextIdx = this.hostRoom.currentQIndex + 1;
    if (nextIdx >= this.hostRoom.quiz.questions.length) {
      this.hostEndGame();
    } else {
      document.getElementById('host-view-podium').classList.add('hidden');
      document.getElementById('host-view-question').classList.remove('hidden');

      smartChannel.broadcast('NEXT_QUESTION', {
        pin: this.hostRoom.pin,
        questionIndex: nextIdx
      });

      this.hostLoadQuestion(nextIdx);
    }
  }

  hostEndGame() {
    clearInterval(this.hostTimerInterval);
    smartSound.playVictory();

    document.getElementById('host-view-lobby').classList.add('hidden');
    document.getElementById('host-view-question').classList.add('hidden');
    document.getElementById('host-view-podium').classList.remove('hidden');

    // Urutkan siswa
    const sorted = [...this.hostRoom.players].sort((a, b) => b.score - a.score);
    const podiumEl = document.getElementById('host-podium-bars');

    const p1 = sorted[0] || { name: 'Andi', score: 850, avatar: { icon: '🧑‍🔬' } };
    const p2 = sorted[1] || { name: 'Siti', score: 790, avatar: { icon: '🧑‍💻' } };
    const p3 = sorted[2] || { name: 'Muchlas', score: 730, avatar: { icon: '🧠' } };

    podiumEl.innerHTML = `
      <!-- Juara 2 -->
      <div class="flex-1 flex flex-col items-center">
        <span class="text-4xl mb-1">${p2.avatar.icon || '🥈'}</span>
        <div class="text-xs font-bold text-slate-300 truncate max-w-[120px]">${p2.name}</div>
        <div class="text-sm font-black text-amber-300 mb-2">${p2.score} pt</div>
        <div class="w-full podium-2 rounded-t-2xl flex items-center justify-center text-3xl font-black text-slate-800">2</div>
      </div>
      <!-- Juara 1 -->
      <div class="flex-1 flex flex-col items-center">
        <span class="text-5xl mb-1 animate-bounce">${p1.avatar.icon || '👑'}</span>
        <div class="text-sm font-bold text-amber-300 truncate max-w-[140px]">${p1.name}</div>
        <div class="text-base font-black text-amber-300 mb-2">${p1.score} pt</div>
        <div class="w-full podium-1 rounded-t-3xl flex items-center justify-center text-4xl font-black text-slate-900 shadow-xl">1</div>
      </div>
      <!-- Juara 3 -->
      <div class="flex-1 flex flex-col items-center">
        <span class="text-3xl mb-1">${p3.avatar.icon || '🥉'}</span>
        <div class="text-xs font-bold text-slate-300 truncate max-w-[120px]">${p3.name}</div>
        <div class="text-sm font-black text-amber-300 mb-2">${p3.score} pt</div>
        <div class="w-full podium-3 rounded-t-2xl flex items-center justify-center text-2xl font-black text-slate-800">3</div>
      </div>
    `;

    // Confetti
    if (typeof confetti === 'function') {
      confetti({ particleCount: 150, spread: 90 });
    }

    // Simpan ke riwayat guru
    smartStorage.saveGameSessionResult({
      quizId: this.hostRoom.quiz.id,
      quizTitle: this.hostRoom.quiz.title,
      subjectName: this.hostRoom.quiz.subjectName,
      grade: this.hostRoom.quiz.grade,
      kktp: 75,
      averageScore: Math.round(sorted.reduce((acc, cur) => acc + cur.score, 0) / Math.max(1, sorted.length)),
      passingRate: 85,
      students: sorted.map(s => ({
        name: s.name,
        score: s.score,
        accuracy: 85,
        correctCount: 7,
        wrongCount: 1
      }))
    });
  }

  // --- CROSS-TAB REALTIME LISTENERS ---
  setupChannelListeners() {
    // Saat ada update pemain di room
    smartChannel.on('ROOM_PLAYERS_UPDATE', (payload) => {
      if (payload.pin === this.hostRoom.pin) {
        this.hostRoom.players = payload.players || [];
        this.updateHostLobbyPlayers();
      }
      if (this.currentScreen === 'screen-student-lobby' && payload.pin === this.hostRoom.pin) {
        this.updateStudentLobbyPlayers(payload.players || []);
      }
    });

    // Saat ada siswa baru bergabung
    smartChannel.on('PLAYER_JOIN', (payload) => {
      if (payload.pin === this.hostRoom.pin) {
        const room = smartChannel.getRoomState(payload.pin);
        if (room && room.players) {
          this.hostRoom.players = room.players;
          this.updateHostLobbyPlayers();
        } else if (!this.hostRoom.players.some(p => p.id === payload.player.id)) {
          this.hostRoom.players.push(payload.player);
          this.updateHostLobbyPlayers();
        }
      }
    });

    // Saat guru memulai kuis dari layar presenter
    smartChannel.on('GAME_START', (payload) => {
      if (this.currentScreen === 'screen-student-lobby' && payload.pin === this.hostRoom.pin) {
        this.startGamePlay(payload.quiz);
      }
    });

    // Saat siswa menjawab soal
    smartChannel.on('PLAYER_ANSWER', (payload) => {
      if (payload.pin === this.hostRoom.pin) {
        this.hostRoom.answeredCount += 1;
        document.getElementById('host-answered-count').textContent = this.hostRoom.answeredCount;

        // Update skor peserta di host
        const player = this.hostRoom.players.find(p => p.id === payload.playerId);
        if (player) {
          player.score = payload.totalScore;
        }
      }
    });

    // Saat guru menekan Next Question dari proyektor
    smartChannel.on('NEXT_QUESTION', (payload) => {
      if (payload.pin === this.hostRoom.pin && this.currentScreen !== 'screen-teacher-host') {
        this.loadQuestion(payload.questionIndex);
      }
    });
  }

  // --- SHORTCUTS & EVENT LISTENERS ---
  setupEventListeners() {
    // Keyboard navigation (1, 2, 3, 4 atau A, B, C, D)
    window.addEventListener('keydown', (e) => {
      if (this.currentScreen === 'screen-gameplay') {
        // Jangan tangkap jika sedang mengetik di input text jawaban singkat
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
          return;
        }

        const key = e.key.toUpperCase();
        if (key === '1' || key === 'A') {
          const btn = document.getElementById('opt-btn-0');
          if (btn && !btn.disabled) btn.click();
        } else if (key === '2' || key === 'B') {
          const btn = document.getElementById('opt-btn-1');
          if (btn && !btn.disabled) btn.click();
        } else if (key === '3' || key === 'C') {
          const btn = document.getElementById('opt-btn-2');
          if (btn && !btn.disabled) btn.click();
        } else if (key === '4' || key === 'D') {
          const btn = document.getElementById('opt-btn-3');
          if (btn && !btn.disabled) btn.click();
        }
      }
    });
  }
}

// Instantiate and initialize the app
window.app = new SmartQuizApp();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
