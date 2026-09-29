/**
 * SMART QUIZ SMP 19 PALEMBANG - Master Data & Defaults
 * Kurikulum Merdeka - Fase D (Kelas VII, VIII, IX)
 */

const SMART_CONFIG = {
  schoolName: "SMP NEGERI 19 PALEMBANG",
  appName: "SMART QUIZ SMP 19 PALEMBANG",
  tagline: "Belajar, Bermain, Berkolaborasi, dan Berprestasi",
  motto: "Belajar tidak harus membosankan. Yuk, belajar sambil bermain!",
  version: "2.5.0-KahootStyle"
};

const DEFAULT_SUBJECTS = [
  { id: "ipa", name: "IPA", icon: "🔬", color: "from-emerald-500 to-teal-600" },
  { id: "matematika", name: "Matematika", icon: "📐", color: "from-blue-500 to-indigo-600" },
  { id: "b_indo", name: "Bahasa Indonesia", icon: "📖", color: "from-amber-500 to-orange-600" },
  { id: "b_inggris", name: "Bahasa Inggris", icon: "🌍", color: "from-violet-500 to-purple-600" },
  { id: "ips", name: "IPS", icon: "🏛️", color: "from-cyan-500 to-sky-600" },
  { id: "ppkn", name: "PPKn / Pendidikan Pancasila", icon: "🇮🇩", color: "from-red-500 to-rose-600" },
  { id: "informatika", name: "Informatika", icon: "💻", color: "from-fuchsia-500 to-pink-600" },
  { id: "seni_budaya", name: "Seni Budaya", icon: "🎨", color: "from-rose-500 to-pink-500" },
  { id: "pjok", name: "PJOK", icon: "⚽", color: "from-lime-500 to-green-600" },
  { id: "prakarya", name: "Prakarya", icon: "🛠️", color: "from-yellow-500 to-amber-600" },
  { id: "agama", name: "Pendidikan Agama", icon: "🤲", color: "from-emerald-600 to-green-700" },
  { id: "b_daerah", name: "Bahasa Daerah", icon: "🗣️", color: "from-teal-500 to-cyan-600" },
  { id: "muatan_lokal", name: "Muatan Lokal", icon: "🛶", color: "from-amber-600 to-orange-700" },
  { id: "lainnya", name: "Mata Pelajaran Lainnya", icon: "✨", color: "from-gray-500 to-slate-700" }
];

const AVATARS = [
  { id: "ilmuwan", icon: "🧑‍🔬", label: "Ilmuwan", desc: "Peneliti Cilik" },
  { id: "programmer", icon: "🧑‍💻", label: "Programmer", desc: "Jago Coding" },
  { id: "guru", icon: "👩‍🏫", label: "Guru", desc: "Mentor Teladan" },
  { id: "seniman", icon: "🧑‍🎨", label: "Seniman", desc: "Kreator Seni" },
  { id: "penjelajah", icon: "🧑‍🚀", label: "Penjelajah", desc: "Astronot Luar Angkasa" },
  { id: "pelajar", icon: "🧑‍🎓", label: "Pelajar", desc: "Siswa Berprestasi" },
  { id: "genius", icon: "🧠", label: "Genius", desc: "Otak Super Cepat" },
  { id: "singa", icon: "🦁", label: "Singa Cerdas", desc: "Pemberani & Tangguh" },
  { id: "burung_hantu", icon: "🦉", label: "Cendekia", desc: "Bijak & Cermat" },
  { id: "kilat", icon: "⚡", label: "Kilat", desc: "Cepat & Tepat" },
  { id: "juara", icon: "🎯", label: "Target Juara", desc: "Fokus Akurat" },
  { id: "bintang", icon: "⭐", label: "Bintang 19", desc: "Semangat Juara" }
];

const QUESTION_TYPES = [
  { id: "pilihan_ganda", name: "Pilihan Ganda", desc: "4 pilihan dengan 1 kunci jawaban", icon: "🔘" },
  { id: "benar_salah", name: "Benar / Salah", desc: "Siswa menentukan pernyataan benar atau salah", icon: "⚖️" },
  { id: "kompleks", name: "Pilihan Ganda Kompleks", desc: "Dapat memilih lebih dari satu jawaban benar", icon: "☑️" },
  { id: "menjodohkan", name: "Menjodohkan", desc: "Mencocokkan pasangan stimulus dan respon", icon: "🔗" },
  { id: "urutkan", name: "Urutkan", desc: "Menyusun kartu jawaban ke urutan kronologis/logis", icon: "🔢" },
  { id: "jawaban_singkat", name: "Jawaban Singkat", desc: "Mengetik kata/istilah kunci", icon: "✍️" },
  { id: "tebak_gambar", name: "Tebak Gambar", desc: "Menebak objek visual bertahap", icon: "🖼️" },
  { id: "soal_gambar", name: "Soal Berbasis Gambar", desc: "Menggunakan diagram/foto/grafik sebagai stimulus", icon: "📊" },
  { id: "soal_video", name: "Soal Berbasis Video", desc: "Stimulus video edukasi singkat", icon: "🎬" },
  { id: "hots", name: "HOTS (Analisis / Evaluasi)", desc: "Pemecahan masalah, analisis data & studi kasus", icon: "💡" }
];

const GAME_MODES = [
  {
    id: "classic",
    name: "Classic Quiz",
    icon: "🎮",
    badge: "Populer",
    desc: "Siswa bermain individu. Skor berdasarkan ketepatan dan kecepatan menjawab.",
    features: ["Skor Ketepatan", "Bonus Kecepatan", "Leaderboard Live"]
  },
  {
    id: "team_battle",
    name: "Team Battle",
    icon: "⚔️",
    badge: "Seru!",
    desc: "Siswa otomatis dibagi menjadi 4 kelompok (Merah, Biru, Hijau, Kuning). Akumulasi poin tim!",
    features: ["4 Kelompok Warna", "Skor Tim Realtime", "Kolaborasi Kelas"]
  },
  {
    id: "race",
    name: "Race (Balapan Avatar)",
    icon: "🏎️",
    badge: "Visual Interaktif",
    desc: "Avatar siswa melesat maju di lintasan balap setiap kali menjawab benar!",
    features: ["Lintasan Bergerak", "Finish Line", "Animasi Balapan"]
  },
  {
    id: "survival",
    name: "Survival Mode",
    icon: "❤️",
    badge: "Menantang",
    desc: "Setiap siswa memiliki 3 nyawa. Jawaban salah memotong 1 nyawa!",
    features: ["3 Nyawa (Lives)", "Tantangan Ketelitian", "Bertahan Hingga Akhir"]
  },
  {
    id: "streak",
    name: "Streak Master",
    icon: "🔥",
    badge: "Combo Poin",
    desc: "Menjawab benar beruntun melipatgandakan poin bonus (+20, +30, +50)!",
    features: ["Multiplier Poin", "Efek Api Combo", "Tantangan Fokus"]
  },
  {
    id: "relax",
    name: "Relax Mode (Latihan)",
    icon: "🧘",
    badge: "Formatif Mandiri",
    desc: "Tanpa tekanan waktu & peringkat. Langsung menampilkan pembahasan ramah setelah dijawab.",
    features: ["Tanpa Batas Waktu", "Pembahasan Langsung", "Ramah Remedial"]
  }
];

const ASSESSMENT_TYPES = [
  { id: "diagnostik", label: "Asesmen Diagnostik", desc: "Memetakan kemampuan awal siswa" },
  { id: "formatif", label: "Asesmen Formatif", desc: "Pemantauan berkala proses belajar" },
  { id: "sumatif", label: "Asesmen Sumatif", desc: "Penilaian akhir materi / bab" },
  { id: "latihan", label: "Latihan Soal", desc: "Penguatan konsep materi harian" },
  { id: "remedial", label: "Remedial", desc: "Bimbingan konsep bertahap untuk penuntasan" },
  { id: "pengayaan", label: "Pengayaan", desc: "Tantangan level tinggi untuk perluasan materi" },
  { id: "review", label: "Review Materi", desc: "Pengulangan kilat sebelum ujian" }
];

const BADGES = [
  { id: "first_win", name: "FIRST WIN", icon: "⭐", desc: "Menjawab benar pertama kali" },
  { id: "streak_master", name: "STREAK MASTER", icon: "🔥", desc: "5 jawaban benar berturut-turut" },
  { id: "quiz_hero", name: "QUIZ HERO", icon: "🏆", desc: "Menyelesaikan kuis dengan skor memuaskan" },
  { id: "knowledge_explorer", name: "KNOWLEDGE EXPLORER", icon: "🗺️", desc: "Menjelajahi aneka ragam mata pelajaran" },
  { id: "speed_runner", name: "SPEED RUNNER", icon: "⚡", desc: "Menjawab kilat dalam tempo kurang dari 3 detik" },
  { id: "perfect_score", name: "SEMPURNA!", icon: "👑", desc: "Mencapai akurasi 100% tanpa kesalahan" }
];

// DATA KUIS BAWAAN (READY TO PLAY OUT-OF-THE-BOX)
const DEFAULT_QUIZZES = [
  {
    id: "quiz-demo-campuran",
    title: "KUIS CAMPURAN SMP 19 (Demo Eksklusif)",
    subject: "lainnya",
    subjectName: "Lintas Mata Pelajaran SMP",
    grade: "VIII",
    phase: "Fase D",
    topic: "Literasi Sains, Numerasi, Bahasa, dan Digital SMP 19",
    learningObjective: "Menguji wawasan holistik siswa SMP lintas disiplin ilmu dengan variasi tipe soal interaktif.",
    assessmentType: "latihan",
    difficulty: "sedang",
    durationPerQuestion: 20,
    gameMode: "classic",
    allowPowerUps: true,
    coverColor: "from-indigo-600 via-purple-600 to-pink-600",
    questions: [
      {
        id: "q-demo-1",
        type: "pilihan_ganda",
        cognitiveLevel: "C2 - Pemahaman",
        weight: 100,
        text: "Jembatan Ampera yang megah di Palembang melintasi sungai terpanjang di Sumatera, yaitu...",
        options: [
          "Sungai Musi",
          "Sungai Batanghari",
          "Sungai Ogan",
          "Sungai Komering"
        ],
        correctAnswer: 0,
        explanation: "Jembatan Ampera melintasi Sungai Musi yang membelah kota Palembang menjadi Seberang Ulu dan Seberang Ilir.",
        topic: "IPS / Geografi Lokal",
        hint: "Ikon kebanggaan kota Palembang yang terkenal dengan wisata airnya."
      },
      {
        id: "q-demo-2",
        type: "pilihan_ganda",
        cognitiveLevel: "C3 - Aplikasi Numerasi",
        weight: 100,
        text: "Jika suhu udara di ruang kelas SMP Negeri 19 Palembang adalah 28°C, berapakah suhunya dalam skala Kelvin?",
        options: [
          "301 K",
          "245 K",
          "300 K",
          "280 K"
        ],
        correctAnswer: 0,
        explanation: "Konversi Celcius ke Kelvin: K = °C + 273 = 28 + 273 = 301 K.",
        topic: "IPA - Suhu dan Kalor",
        hint: "Tambahkan nilai Celcius dengan angka 273."
      },
      {
        id: "q-demo-3",
        type: "benar_salah",
        cognitiveLevel: "C2 - Pemahaman Konsep",
        weight: 100,
        text: "Dalam struktur teks laporan hasil observasi (LHO), bagian 'Definisi Umum' selalu berada di akhir paragraf teks.",
        options: [
          "Benar",
          "Salah"
        ],
        correctAnswer: 1, // Salah
        explanation: "Pernyataan SALAH. Definisi umum (pernyataan umum) terletak di bagian AWAL teks LHO untuk memperkenalkan objek yang diobservasi.",
        topic: "Bahasa Indonesia - Teks LHO",
        hint: "Pikirkan di mana pengenalan awal suatu objek biasanya diletakkan."
      },
      {
        id: "q-demo-4",
        type: "kompleks",
        cognitiveLevel: "C4 - Analisis Berpikir",
        weight: 100,
        text: "Manakah yang merupakan komponen perangkat lunak (software) aplikasi pengolah angka dan presentasi? (Pilih semua yang benar)",
        options: [
          "Microsoft Excel",
          "Google Sheets",
          "Prosesor Intel Core",
          "Canva / PowerPoint"
        ],
        correctAnswer: [0, 1, 3], // Multiple answers
        explanation: "Excel, Google Sheets, dan Canva/PowerPoint adalah software. Prosesor Intel Core adalah komponen perangkat keras (hardware).",
        topic: "Informatika - Sistem Komputer",
        hint: "Satu opsi adalah fisik keras yang ada di dalam motherboard."
      },
      {
        id: "q-demo-5",
        type: "urutkan",
        cognitiveLevel: "C3 - Prosedural",
        weight: 100,
        text: "Urutkan tahapan metode ilmiah berikut ini dari langkah awal hingga akhir yang benar!",
        options: [
          "Merumuskan masalah",
          "Menyusun hipotesis",
          "Melakukan eksperimen",
          "Menarik kesimpulan"
        ],
        correctAnswer: [0, 1, 2, 3],
        explanation: "Urutan metode ilmiah standar: (1) Merumuskan masalah -> (2) Menyusun hipotesis -> (3) Melakukan eksperimen -> (4) Menarik kesimpulan.",
        topic: "IPA - Hakikat Sains",
        hint: "Dimulai dari pertanyaan masalah dan diakhiri dengan kesimpulan."
      },
      {
        id: "q-demo-6",
        type: "menjodohkan",
        cognitiveLevel: "C2 - Pemahaman",
        weight: 100,
        text: "Jodohkan bangun datar berikut dengan rumus luas yang tepat!",
        pairs: [
          { left: "Persegi", right: "sisi × sisi" },
          { left: "Segitiga", right: "½ × alas × tinggi" },
          { left: "Lingkaran", right: "π × r²" },
          { left: "Persegi Panjang", right: "panjang × lebar" }
        ],
        explanation: "Rumus luas bangun datar: Persegi = s², Segitiga = ½ × a × t, Lingkaran = πr², Persegi panjang = p × l.",
        topic: "Matematika - Geometri",
        hint: "Ingat rumus luas dasar sekolah menengah."
      },
      {
        id: "q-demo-7",
        type: "jawaban_singkat",
        cognitiveLevel: "C1 - Mengingat",
        weight: 100,
        text: "Apa nama zat hijau daun pada tumbuhan yang berfungsi menyerap energi cahaya matahari untuk fotosintesis?",
        correctAnswer: "klorofil",
        acceptableAnswers: ["klorofil", "chlorophyll", "zat klorofil"],
        explanation: "Klorofil adalah pigmen hijau pada daun yang terdapat di kloroplas dan bertugas menangkap foton cahaya matahari.",
        topic: "IPA - Struktur Tumbuhan",
        hint: "Dimulai dengan huruf K dan berakhir dengan L."
      },
      {
        id: "q-demo-8",
        type: "hots",
        cognitiveLevel: "C5 - Evaluasi Kritis",
        weight: 100,
        text: "Sebuah akun media sosial menawarkan hadiah kupon dengan meminta memasukkan PIN dan OTP bank orang tua. Tindakan pencegahan terbaik adalah...",
        options: [
          "Segera mengisi form agar tidak ketinggalan batas promo",
          "Menolak, memblokir pengirim, dan tidak membagikan OTP karena itu modus Phishing",
          "Membagikan tautan promo ke grup kelas terlebih dahulu",
          "Menjawab chat dengan meminta bukti foto KTP pengirim"
        ],
        correctAnswer: 1,
        explanation: "Meminta PIN atau OTP adalah ciri utama serangan rekayasa sosial (phishing). OTP bersifat rahasia dan tidak boleh dibagikan kepada siapapun.",
        topic: "Informatika - Keamanan Informasi Digital",
        hint: "OTP dan PIN adalah rahasia pribadi yang tidak boleh diberikan ke siapapun."
      }
    ]
  },
  {
    id: "quiz-ipa-smp19",
    title: "IPA Fase D: Ekosistem & Lingkungan Hidup",
    subject: "ipa",
    subjectName: "Ilmu Pengetahuan Alam (IPA)",
    grade: "VII",
    phase: "Fase D",
    topic: "Interaksi Makhluk Hidup dengan Lingkungan",
    learningObjective: "Menganalisis interaksi antarkomponen ekosistem dan dampak pencemaran terhadap keanekaragaman hayati.",
    assessmentType: "formatif",
    difficulty: "sedang",
    durationPerQuestion: 25,
    gameMode: "team_battle",
    allowPowerUps: true,
    coverColor: "from-emerald-600 to-teal-700",
    questions: [
      {
        id: "q-ipa-1",
        type: "pilihan_ganda",
        cognitiveLevel: "C2 - Pemahaman",
        weight: 100,
        text: "Organisme yang mampu memproduksi makanannya sendiri melalui fotosintesis disebut sebagai komponen...",
        options: ["Autotrof", "Heterotrof", "Dekomposer", "Detritivor"],
        correctAnswer: 0,
        explanation: "Autotrof adalah organisme (seperti tumbuhan hijau) yang dapat membuat makanan sendiri dengan bantuan energi surya.",
        topic: "Rantai Makanan"
      },
      {
        id: "q-ipa-2",
        type: "benar_salah",
        cognitiveLevel: "C3 - Aplikasi",
        weight: 100,
        text: "Penebangan pohon di hulu Sungai Musi dapat meningkatkan risiko banjir bandang di hilir kota Palembang saat musim penghujan.",
        options: ["Benar", "Salah"],
        correctAnswer: 0,
        explanation: "Pohon berfungsi sebagai daerah resapan air. Jika hutan gundul, air hujan mengalir langsung ke sungai dan memicu luapan banjir.",
        topic: "Kelestarian Ekosistem"
      },
      {
        id: "q-ipa-3",
        type: "kompleks",
        cognitiveLevel: "C4 - Analisis",
        weight: 100,
        text: "Manakah tindakan ramah lingkungan yang dapat dilakukan siswa di lingkungan SMP Negeri 19 Palembang? (Pilih semua yang tepat)",
        options: [
          "Membawa botol minum (tumbler) isi ulang",
          "Memilah sampah organik dan anorganik di tempat sampah sekolah",
          "Membuang bungkus plastik makanan ke saluran air parit",
          "Mematikan lampu dan kipas angin kelas saat tidak digunakan"
        ],
        correctAnswer: [0, 1, 3],
        explanation: "Membawa tumbler, memilah sampah, dan hemat energi listrik adalah wujud nyata budaya sekolah Adiwiyata ramah lingkungan.",
        topic: "Konservasi Energi dan Sampah"
      }
    ]
  },
  {
    id: "quiz-mtk-smp19",
    title: "Matematika Fase D: Aljabar & Persamaan Linear",
    subject: "matematika",
    subjectName: "Matematika",
    grade: "VIII",
    phase: "Fase D",
    topic: "Operasi Aljabar dan Persamaan Linear Satu Variabel (PLSV)",
    learningObjective: "Menyelesaikan model matematika dan operasi hitung bentuk aljabar dalam kehidupan nyata.",
    assessmentType: "sumatif",
    difficulty: "sedang",
    durationPerQuestion: 30,
    gameMode: "race",
    allowPowerUps: true,
    coverColor: "from-blue-600 to-indigo-700",
    questions: [
      {
        id: "q-mtk-1",
        type: "pilihan_ganda",
        cognitiveLevel: "C3 - Aplikasi",
        weight: 100,
        text: "Berapakah nilai x dari persamaan linear: 3x + 7 = 22?",
        options: ["x = 5", "x = 4", "x = 6", "x = 3"],
        correctAnswer: 0,
        explanation: "3x = 22 - 7 => 3x = 15 => x = 15 / 3 = 5.",
        topic: "PLSV"
      },
      {
        id: "q-mtk-2",
        type: "jawaban_singkat",
        cognitiveLevel: "C2 - Pemahaman",
        weight: 100,
        text: "Sederhanakan bentuk aljabar: 4a + 7b - 2a + 3b. Koefisien dari variabel b adalah...",
        correctAnswer: "10",
        acceptableAnswers: ["10", "sepuluh"],
        explanation: "Kumpulkan suku sejenis: (4a - 2a) + (7b + 3b) = 2a + 10b. Koefisien dari b adalah 10.",
        topic: "Operasi Bentuk Aljabar"
      }
    ]
  }
];

// TEMPLATE KUIS CEPAT
const QUICK_TEMPLATES = [
  {
    id: "tpl_icebreaking",
    name: "Ice Breaking Ceria",
    questionCount: 5,
    duration: 15,
    assessmentType: "latihan",
    difficulty: "mudah",
    desc: "5 soal santai untuk apersepsi, penyemangat awal jam belajar, dan ice breaking akademik.",
    badgeColor: "bg-amber-100 text-amber-800"
  },
  {
    id: "tpl_review",
    name: "Review Materi Kilat",
    questionCount: 10,
    duration: 20,
    assessmentType: "review",
    difficulty: "sedang",
    desc: "10 soal komprehensif untuk menyegarkan ingatan siswa sebelum ulangan harian.",
    badgeColor: "bg-blue-100 text-blue-800"
  },
  {
    id: "tpl_formatif",
    name: "Asesmen Formatif Standar",
    questionCount: 15,
    duration: 25,
    assessmentType: "formatif",
    difficulty: "sedang",
    desc: "15 soal standar ketercapaian tujuan pembelajaran (KKTP) Fase D.",
    badgeColor: "bg-emerald-100 text-emerald-800"
  },
  {
    id: "tpl_hots",
    name: "Tantangan HOTS Analisis",
    questionCount: 10,
    duration: 35,
    assessmentType: "pengayaan",
    difficulty: "sulit",
    desc: "10 soal penalaran tingkat tinggi (Analisis, Evaluasi, Pemecahan Kasus Kontekstual).",
    badgeColor: "bg-purple-100 text-purple-800"
  },
  {
    id: "tpl_remedial",
    name: "Remedial Bertahap",
    questionCount: 8,
    duration: 30,
    assessmentType: "remedial",
    difficulty: "mudah",
    desc: "Soal dengan tangga kesulitan bertahap dilengkapi petunjuk untuk bimbingan ketuntasan.",
    badgeColor: "bg-rose-100 text-rose-800"
  },
  {
    id: "tpl_pengayaan",
    name: "Pengayaan Eksploratif",
    questionCount: 12,
    duration: 30,
    assessmentType: "pengayaan",
    difficulty: "sulit",
    desc: "Soal perluasan wawasan sains, teknologi, dan literasi kritis bagi siswa berprestasi.",
    badgeColor: "bg-indigo-100 text-indigo-800"
  }
];

// REFLEKSI BELAJAR SISWA OPTIONS
const REFLECTION_OPTIONS = [
  { id: "paham", emoji: "😊", label: "Saya sudah paham", desc: "Materi dapat saya pahami dan kuasai dengan baik.", color: "border-green-500 bg-green-50 text-green-800" },
  { id: "cukup", emoji: "😐", label: "Saya cukup paham", desc: "Sebagian besar konsep saya mengerti, butuh sedikit latihan.", color: "border-blue-500 bg-blue-50 text-blue-800" },
  { id: "belajar_lagi", emoji: "🤔", label: "Saya masih perlu belajar", desc: "Ada beberapa materi yang masih membingungkan bagi saya.", color: "border-amber-500 bg-amber-50 text-amber-800" },
  { id: "butuh_bantuan", emoji: "🆘", label: "Saya membutuhkan bantuan", desc: "Saya butuh bimbingan tambahan dari Bapak/Ibu guru.", color: "border-red-500 bg-red-50 text-red-800" }
];
