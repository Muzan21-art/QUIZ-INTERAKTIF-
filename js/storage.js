/**
 * SMART QUIZ SMP 19 PALEMBANG - Storage Manager
 * Mengelola penyimpanan lokal (LocalStorage), impor/ekspor data, dan riwayat asesmen
 */

class StorageManager {
  constructor() {
    this.KEY_QUIZZES = 'smartquiz_quizzes_v2';
    this.KEY_QUESTIONS = 'smartquiz_bank_v2';
    this.KEY_SUBJECTS = 'smartquiz_subjects_v2';
    this.KEY_HISTORY = 'smartquiz_history_v2';
    this.KEY_SETTINGS = 'smartquiz_settings_v2';
    this.KEY_REFLECTIONS = 'smartquiz_reflections_v2';

    this.initDefaults();
  }

  initDefaults() {
    // Inisialisasi kuis jika belum ada
    if (!localStorage.getItem(this.KEY_QUIZZES)) {
      localStorage.setItem(this.KEY_QUIZZES, JSON.stringify(DEFAULT_QUIZZES));
    }

    // Inisialisasi mata pelajaran
    if (!localStorage.getItem(this.KEY_SUBJECTS)) {
      localStorage.setItem(this.KEY_SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
    }

    // Inisialisasi bank soal dari kuis bawaan
    if (!localStorage.getItem(this.KEY_QUESTIONS)) {
      const initialBank = [];
      DEFAULT_QUIZZES.forEach(q => {
        q.questions.forEach(item => {
          initialBank.push({
            ...item,
            id: item.id || 'q-' + Math.random().toString(36).substr(2, 9),
            subject: q.subject,
            subjectName: q.subjectName,
            grade: q.grade,
            phase: q.phase || 'Fase D',
            quizTitle: q.title
          });
        });
      });
      localStorage.setItem(this.KEY_QUESTIONS, JSON.stringify(initialBank));
    }
  }

  // --- KUIS CRUD ---
  getQuizzes() {
    try {
      const data = localStorage.getItem(this.KEY_QUIZZES);
      return data ? JSON.parse(data) : DEFAULT_QUIZZES;
    } catch (e) {
      console.error('Error load quizzes:', e);
      return DEFAULT_QUIZZES;
    }
  }

  getQuizById(id) {
    const list = this.getQuizzes();
    return list.find(q => q.id === id) || null;
  }

  saveQuiz(quiz) {
    const list = this.getQuizzes();
    const index = list.findIndex(q => q.id === quiz.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...quiz, updatedAt: new Date().toISOString() };
    } else {
      quiz.id = quiz.id || 'quiz-' + Date.now();
      quiz.createdAt = new Date().toISOString();
      quiz.updatedAt = quiz.createdAt;
      list.unshift(quiz);
    }
    localStorage.setItem(this.KEY_QUIZZES, JSON.stringify(list));

    // Sinkronisasi otomatis ke Bank Soal
    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions.forEach(q => {
        this.addOrUpdateQuestionInBank({
          ...q,
          subject: quiz.subject,
          subjectName: quiz.subjectName,
          grade: quiz.grade,
          quizTitle: quiz.title
        });
      });
    }

    return quiz;
  }

  deleteQuiz(id) {
    let list = this.getQuizzes();
    list = list.filter(q => q.id !== id);
    localStorage.setItem(this.KEY_QUIZZES, JSON.stringify(list));
    return true;
  }

  duplicateQuiz(id) {
    const original = this.getQuizById(id);
    if (!original) return null;

    const copy = JSON.parse(JSON.stringify(original));
    copy.id = 'quiz-' + Date.now();
    copy.title = `${copy.title} (Salinan)`;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = copy.createdAt;

    // Beri id baru untuk soal-soal di dalamnya
    if (copy.questions) {
      copy.questions = copy.questions.map(q => ({
        ...q,
        id: 'q-' + Math.random().toString(36).substr(2, 9)
      }));
    }

    const list = this.getQuizzes();
    list.unshift(copy);
    localStorage.setItem(this.KEY_QUIZZES, JSON.stringify(list));
    return copy;
  }

  // Tambah soal langsung ke kuis tertentu
  addQuestionToQuiz(quizId, question) {
    const list = this.getQuizzes();
    const quiz = list.find(q => q.id === quizId);
    if (!quiz) return null;
    if (!quiz.questions) quiz.questions = [];

    question.id = question.id || 'q-' + Date.now() + Math.random().toString(36).substr(2, 4);
    question.weight = question.weight || 100;
    question.subject = quiz.subject;
    question.subjectName = quiz.subjectName;
    question.grade = quiz.grade;
    quiz.questions.push(question);
    quiz.updatedAt = new Date().toISOString();

    localStorage.setItem(this.KEY_QUIZZES, JSON.stringify(list));
    this.addOrUpdateQuestionInBank({ ...question, quizTitle: quiz.title });
    return question;
  }

  // Edit butir soal dalam kuis tertentu
  updateQuestionInQuiz(quizId, questionId, updatedData) {
    const list = this.getQuizzes();
    const quiz = list.find(q => q.id === quizId);
    if (!quiz || !quiz.questions) return null;

    const idx = quiz.questions.findIndex(q => q.id === questionId);
    if (idx >= 0) {
      quiz.questions[idx] = { ...quiz.questions[idx], ...updatedData };
      quiz.updatedAt = new Date().toISOString();
      localStorage.setItem(this.KEY_QUIZZES, JSON.stringify(list));
      this.addOrUpdateQuestionInBank({ ...quiz.questions[idx], quizTitle: quiz.title });
      return quiz.questions[idx];
    }
    return null;
  }

  // Hapus butir soal dari kuis tertentu
  deleteQuestionFromQuiz(quizId, questionId) {
    const list = this.getQuizzes();
    const quiz = list.find(q => q.id === quizId);
    if (!quiz || !quiz.questions) return false;

    quiz.questions = quiz.questions.filter(q => q.id !== questionId);
    quiz.updatedAt = new Date().toISOString();
    localStorage.setItem(this.KEY_QUIZZES, JSON.stringify(list));
    return true;
  }

  // Ubah urutan soal di kuis
  reorderQuestionInQuiz(quizId, fromIndex, toIndex) {
    const list = this.getQuizzes();
    const quiz = list.find(q => q.id === quizId);
    if (!quiz || !quiz.questions) return false;

    if (toIndex < 0 || toIndex >= quiz.questions.length) return false;
    const moved = quiz.questions.splice(fromIndex, 1)[0];
    quiz.questions.splice(toIndex, 0, moved);
    quiz.updatedAt = new Date().toISOString();
    localStorage.setItem(this.KEY_QUIZZES, JSON.stringify(list));
    return true;
  }

  // Parser pembuatan soal mandiri dari format teks cepat (Quick Text Format)
  parseQuestionsFromQuickText(text, defaultSubject = 'ipa', defaultGrade = 'VIII') {
    if (!text || !text.trim()) return [];

    // Pecah blok soal berdasarkan nomor (contoh: "1.", "2)", "[1]", "Soal 1", dsb.)
    const rawBlocks = text.split(/(?:^|\n)\s*(?=(?:\[?\d+[\.\)]\s+|Soal\s+\d+[:\.]?\s*))/i).filter(b => b.trim().length > 0);
    const parsedQuestions = [];

    rawBlocks.forEach((block, index) => {
      const lines = block.trim().split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) return;

      let questionStem = '';
      const options = [];
      let correctAnswer = 0;
      let explanation = 'Pembahasan telah diverifikasi oleh guru SMPN 19 Palembang.';
      let topic = 'Materi Kuis Mandiri';
      let cognitiveLevel = 'C3 - Aplikasi';

      let lineIdx = 0;
      // Ambil kalimat pertanyaan sebelum opsi pilihan
      while (lineIdx < lines.length) {
        const line = lines[lineIdx];
        if (/^[A-Da-d][\.\)]\s+/.test(line)) {
          break;
        }
        questionStem += (questionStem ? ' ' : '') + line.replace(/^\[?\d+[\.\)]\s*/, '').replace(/^Soal\s+\d+[:\.]?\s*/i, '');
        lineIdx++;
      }

      // Ambil opsi A, B, C, D dan kunci/pembahasan
      while (lineIdx < lines.length) {
        const line = lines[lineIdx];
        const optMatch = line.match(/^([A-Da-d])[\.\)]\s+(.*)$/);
        const keyMatch = line.match(/^(?:Kunci|Kunci Jawaban|Jawaban Benar|Jawaban|Key)\s*[:=]\s*([A-Da-d0-9]|Benar|Salah)/i);
        const expMatch = line.match(/^(?:Pembahasan|Penjelasan|Alasan|Explanation)\s*[:=]\s*(.*)$/i);
        const topicMatch = line.match(/^(?:Materi|Topik|Topic)\s*[:=]\s*(.*)$/i);

        if (optMatch) {
          options.push(optMatch[2].trim());
        } else if (keyMatch) {
          const rawKey = keyMatch[1].trim().toUpperCase();
          if (rawKey === 'A' || rawKey === '1') correctAnswer = 0;
          else if (rawKey === 'B' || rawKey === '2') correctAnswer = 1;
          else if (rawKey === 'C' || rawKey === '3') correctAnswer = 2;
          else if (rawKey === 'D' || rawKey === '4') correctAnswer = 3;
          else if (rawKey.toLowerCase() === 'benar') correctAnswer = 0;
          else if (rawKey.toLowerCase() === 'salah') correctAnswer = 1;
        } else if (expMatch) {
          explanation = expMatch[1].trim();
          while (lineIdx + 1 < lines.length && !/^[A-Da-d][\.\)]\s+/.test(lines[lineIdx + 1]) && !/^(?:Kunci|Jawaban)/i.test(lines[lineIdx + 1])) {
            lineIdx++;
            explanation += ' ' + lines[lineIdx];
          }
        } else if (topicMatch) {
          topic = topicMatch[1].trim();
        }
        lineIdx++;
      }

      if (questionStem && options.length >= 2) {
        parsedQuestions.push({
          id: 'q-manual-' + Date.now() + '-' + (index + 1),
          type: options.length === 2 && (options[0].toLowerCase() === 'benar' || options[0].toLowerCase() === 'salah') ? 'benar_salah' : 'pilihan_ganda',
          text: questionStem,
          options: options,
          correctAnswer: correctAnswer,
          explanation: explanation,
          topic: topic,
          subject: defaultSubject,
          grade: defaultGrade,
          cognitiveLevel: cognitiveLevel,
          difficulty: 'sedang',
          weight: 100
        });
      }
    });

    return parsedQuestions;
  }

  // --- BANK SOAL CRUD ---
  getQuestionBank() {
    try {
      const data = localStorage.getItem(this.KEY_QUESTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error load questions:', e);
      return [];
    }
  }

  addOrUpdateQuestionInBank(question) {
    const list = this.getQuestionBank();
    const index = list.findIndex(q => q.id === question.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...question };
    } else {
      question.id = question.id || 'q-' + Date.now() + Math.random().toString(36).substr(2, 4);
      list.unshift(question);
    }
    localStorage.setItem(this.KEY_QUESTIONS, JSON.stringify(list));
    return question;
  }

  deleteQuestionFromBank(id) {
    let list = this.getQuestionBank();
    list = list.filter(q => q.id !== id);
    localStorage.setItem(this.KEY_QUESTIONS, JSON.stringify(list));
    return true;
  }

  // --- MATA PELAJARAN ---
  getSubjects() {
    try {
      const data = localStorage.getItem(this.KEY_SUBJECTS);
      return data ? JSON.parse(data) : DEFAULT_SUBJECTS;
    } catch (e) {
      return DEFAULT_SUBJECTS;
    }
  }

  addCustomSubject(name, icon = '📚') {
    const list = this.getSubjects();
    const id = 'subj_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (list.some(s => s.id === id || s.name.toLowerCase() === name.toLowerCase())) {
      return list.find(s => s.name.toLowerCase() === name.toLowerCase());
    }
    const newSubj = {
      id,
      name,
      icon,
      color: "from-sky-500 to-indigo-600",
      custom: true
    };
    list.push(newSubj);
    localStorage.setItem(this.KEY_SUBJECTS, JSON.stringify(list));
    return newSubj;
  }

  // --- RIWAYAT PERMAINAN & LAPORAN ASESMEN ---
  getGameHistory() {
    try {
      const data = localStorage.getItem(this.KEY_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveGameSessionResult(result) {
    const list = this.getGameHistory();
    result.id = result.id || 'res-' + Date.now();
    result.playedAt = new Date().toISOString();
    list.unshift(result);
    // Simpan hingga 100 rekap permainan
    if (list.length > 100) list.pop();
    localStorage.setItem(this.KEY_HISTORY, JSON.stringify(list));
    return result;
  }

  getGameSessionById(id) {
    return this.getGameHistory().find(h => h.id === id) || null;
  }

  // --- REFLEKSI SISWA ---
  saveReflection(reflectionData) {
    try {
      const list = this.getReflections();
      reflectionData.id = 'refl-' + Date.now();
      reflectionData.createdAt = new Date().toISOString();
      list.unshift(reflectionData);
      localStorage.setItem(this.KEY_REFLECTIONS, JSON.stringify(list));
      return reflectionData;
    } catch (e) {
      console.error('Save reflection error:', e);
    }
  }

  getReflections() {
    try {
      const data = localStorage.getItem(this.KEY_REFLECTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // --- PENGATURAN UMUM ---
  getSettings() {
    try {
      const data = localStorage.getItem(this.KEY_SETTINGS);
      return data ? JSON.parse(data) : {
        soundEnabled: true,
        reducedMotion: false,
        highContrast: false,
        kktpScore: 75,
        defaultTimer: 20,
        enablePowerUps: true
      };
    } catch (e) {
      return { soundEnabled: true, reducedMotion: false, kktpScore: 75, defaultTimer: 20 };
    }
  }

  saveSettings(settings) {
    localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(settings));
  }

  // --- IMPORT DARI CSV / FORMAT EXCEL ---
  // Format: No,Pertanyaan,A,B,C,D,Kunci,Pembahasan,Materi,Level
  importQuestionsFromCSV(csvText, targetSubject = 'ipa', targetGrade = 'VIII') {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      throw new Error('File CSV kosong atau tidak memiliki baris data.');
    }

    const questions = [];
    // Parsing manual yang aman menangani koma di dalam tanda kutip
    const parseCSVLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    // Ambil header
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 7) continue;

      const questionText = cols[1] || cols[0];
      const optA = cols[2] || '';
      const optB = cols[3] || '';
      const optC = cols[4] || '';
      const optD = cols[5] || '';
      const rawKey = (cols[6] || 'A').toUpperCase().trim();
      const explanation = cols[7] || 'Pembahasan belum tersedia.';
      const topic = cols[8] || 'Umum';
      const level = cols[9] || 'Sedang';

      let correctIndex = 0;
      if (rawKey === 'B' || rawKey === '2') correctIndex = 1;
      else if (rawKey === 'C' || rawKey === '3') correctIndex = 2;
      else if (rawKey === 'D' || rawKey === '4') correctIndex = 3;

      const newQ = {
        id: 'q-imp-' + Date.now() + '-' + i,
        type: 'pilihan_ganda',
        text: questionText,
        options: [optA, optB, optC, optD].filter(o => o.length > 0),
        correctAnswer: correctIndex,
        explanation: explanation,
        topic: topic,
        difficulty: level.toLowerCase().includes('sulit') || level.toLowerCase().includes('hots') ? 'sulit' : (level.toLowerCase().includes('mudah') ? 'mudah' : 'sedang'),
        subject: targetSubject,
        grade: targetGrade,
        cognitiveLevel: level.toUpperCase().includes('HOTS') ? 'C4 / C5 - HOTS' : 'C2 / C3',
        weight: 100
      };

      questions.push(newQ);
      this.addOrUpdateQuestionInBank(newQ);
    }

    return questions;
  }

  // --- EKSPOR HASIL KUIS KE CSV ---
  exportResultsToCSV(sessionResult) {
    if (!sessionResult || !sessionResult.students) {
      alert('Tidak ada data hasil kuis untuk diekspor.');
      return;
    }

    const rows = [
      ['SMP NEGERI 19 PALEMBANG - REKAP LAPORAN SMART QUIZ'],
      ['Judul Kuis', sessionResult.quizTitle || '-'],
      ['Mata Pelajaran', sessionResult.subjectName || '-'],
      ['Tanggal Permainan', new Date(sessionResult.playedAt || Date.now()).toLocaleString('id-ID')],
      ['Rata-Rata Nilai', sessionResult.averageScore || 0],
      ['Ketuntasan Kelas', (sessionResult.passingRate || 0) + '%'],
      [],
      ['Ranking', 'Nama Siswa', 'Skor Akhir', 'Jawaban Benar', 'Jawaban Salah', 'Akurasi (%)', 'Status Ketuntasan']
    ];

    sessionResult.students.forEach((s, idx) => {
      rows.push([
        idx + 1,
        `"${s.name}"`,
        s.score || 0,
        s.correctCount || 0,
        s.wrongCount || 0,
        s.accuracy ? s.accuracy + '%' : '0%',
        (s.score >= (sessionResult.kktp || 75)) ? 'Tuntas' : 'Perlu Bimbingan'
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_SMP19_${(sessionResult.quizTitle || 'SmartQuiz').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Download template format Excel / CSV untuk guru
  downloadQuestionTemplateCSV() {
    const sampleRows = [
      ['No', 'Pertanyaan', 'A', 'B', 'C', 'D', 'Kunci', 'Pembahasan', 'Materi', 'Level'],
      [1, 'Organ apa yang menyaring darah dalam sistem ekskresi manusia?', 'Ginjal', 'Hati', 'Jantung', 'Paru-paru', 'A', 'Ginjal bertugas menyaring sisa metabolisme darah menghasilkan urine.', 'Sistem Ekskresi', 'Sedang'],
      [2, 'Nilai kemiringan (gradien) dari persamaan garis y = 3x - 5 adalah...', '3', '-5', '5', '-3', 'A', 'Pada bentuk persamaan y = mx + c, koefisien m adalah gradien. Maka m = 3.', 'Gradien Garis', 'Sedang'],
      [3, 'Manakah yang merupakan teks laporan observasi objektif?', 'Pantai itu sangat indah sekali', 'Candi Borobudur dibangun pada abad ke-8 Masehi', 'Saya suka sekali makan pempek', 'Pemandangannya sungguh menawan', 'B', 'Teks observasi menyajikan fakta objektif tanpa opini subjektif personal.', 'Teks LHO', 'HOTS']
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + sampleRows.map(e => e.map(item => `"${item}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Template_Bank_Soal_SMP19.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Global storage singleton
window.smartStorage = new StorageManager();
