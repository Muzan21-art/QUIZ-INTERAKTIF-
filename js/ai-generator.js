/**
 * SMART QUIZ SMP 19 PALEMBANG - AI Question Generator
 * Generator Soal Berbasis AI untuk Kurikulum Merdeka Fase D (SMP Kelas 7, 8, 9)
 * Menghasilkan soal lengkap dengan TP, Level Kognitif, Kunci, dan Pembahasan
 */

class AIQuestionGenerator {
  constructor() {
    // Knowledge base topik kurikulum SMP Fase D untuk generator kontekstual
    this.knowledgeBase = {
      ipa: {
        "sistem pencernaan": [
          {
            text: "Seorang siswa menguji kandungan bahan makanan dengan reagen Biuret dan menghasilkan warna ungu. Berdasarkan hasil uji tersebut, zat makanan yang terkandung dan fungsi utamanya adalah...",
            options: [
              "Protein; untuk pertumbuhan sel dan pengganti jaringan tubuh yang rusak",
              "Karbohidrat; sebagai sumber energi utama bagi aktivitas sel",
              "Lemak; sebagai pelarut vitamin A, D, E, dan K",
              "Glukosa; untuk menjaga kestabilan kadar gula darah"
            ],
            correct: 0,
            exp: "Reagen Biuret yang menghasilkan perubahan warna ungu spesifik menunjukkan adanya kandungan protein (ikatan peptida). Protein berfungsi sebagai zat pembangun dan perbaikan sel.",
            level: "C4 - Analisis Hasil Eksperimen",
            tp: "Menganalisis kandungan nutrisi bahan makanan melalui uji reagen laboratorium."
          },
          {
            text: "Organ pencernaan yang memiliki jonjot usus (vili) untuk memperluas bidang penyerapan sari makanan adalah...",
            options: ["Usus halus (ileum)", "Lambung (ventrikulus)", "Usus besar (kolon)", "Kerongkongan (esofagus)"],
            correct: 0,
            exp: "Vili dan mikrovili berada pada dinding usus halus (terutama ileum) untuk memaksimalkan penyerapan nutrisi ke dalam aliran darah.",
            level: "C2 - Pemahaman Struktur Organ",
            tp: "Mengidentifikasi keterkaitan struktur jaringan organ pencernaan dengan fungsinya."
          }
        ],
        "sistem peredaran darah": [
          {
            text: "Dinding bilik kiri (ventrikel sinister) jantung lebih tebal dan berotot kuat dibandingkan bilik kanan karena...",
            options: [
              "Harus memompa darah bertekanan tinggi ke seluruh tubuh",
              "Hanya memompa darah berkarbon dioksida menuju paru-paru",
              "Menerima darah langsung dari serambi kiri",
              "Menampung volume darah yang paling banyak di jantung"
            ],
            correct: 0,
            exp: "Bilik kiri memompa darah bersih kaya oksigen ke seluruh bagian tubuh melalui aorta, sehingga membutuhkan tekanan kontraksi miokardium yang jauh lebih kuat.",
            level: "C4 - Analisis Fungsional",
            tp: "Menganalisis prinsip kerja dan fisiologi organ peredaran darah manusia."
          }
        ],
        "ekosistem": [
          {
            text: "Jika populasi burung pemangsa seperti elang di ekosistem persawahan punah karena perburuan liar, dampak ekologis berantai yang paling mungkin terjadi adalah...",
            options: [
              "Populasi tikus meningkat drastis sehingga hasil panen padi petani merosot",
              "Populasi tanaman padi akan bertambah subur",
              "Populasi ular sawah akan langsung mengalami kepunahan",
              "Kadar oksigen di area sawah akan menurun tajam"
            ],
            correct: 0,
            exp: "Hilangnya predator puncak (elang) menyebabkan populasi konsumen tingkat II/I (seperti tikus) melonjak tanpa kendali, mengakibatkan kerusakan parah pada produsen (padi).",
            level: "C5 - Evaluasi Keseimbangan Ekosistem",
            tp: "Memprediksi dinamika rantai makanan dan keseimbangan jaring-jaring kehidupan."
          }
        ]
      },
      matematika: {
        "aljabar": [
          {
            text: "Sebuah toko buku memberikan diskon berupa potongan harga (3x - 15) ribu rupiah dari total belanja (8x + 40) ribu rupiah. Berapakah sisa uang yang harus dibayar pembeli?",
            options: [
              "(5x + 55) ribu rupiah",
              "(5x + 25) ribu rupiah",
              "(11x + 25) ribu rupiah",
              "(5x - 55) ribu rupiah"
            ],
            correct: 0,
            exp: "Harga yang harus dibayar = (8x + 40) - (3x - 15) = 8x - 3x + 40 - (-15) = 5x + 55 ribu rupiah.",
            level: "C3 - Aplikasi Pemodelan",
            tp: "Menyelesaikan operasi pengurangan bentuk aljabar dalam konteks jual-beli."
          },
          {
            text: "Jika nilai x = 4 dan y = -2, maka nilai dari bentuk aljabar 2x² - 3xy + y² adalah...",
            options: ["60", "44", "28", "52"],
            correct: 0,
            exp: "Substitusi nilai: 2(4)² - 3(4)(-2) + (-2)² = 2(16) - (-24) + 4 = 32 + 24 + 4 = 60.",
            level: "C3 - Aplikasi Operasi Hitung",
            tp: "Menghitung nilai numerik bentuk aljabar dengan variabel bilangan bulat."
          }
        ],
        "teorema pythagoras": [
          {
            text: "Sebuah kapal berlayar dari dermaga ke arah Utara sejauh 12 km, kemudian berbelok ke arah Timur sejauh 9 km. Jarak terpendek kapal sekarang dari dermaga semula adalah...",
            options: ["15 km", "21 km", "18 km", "13 km"],
            correct: 0,
            exp: "Lintasan membentuk segitiga siku-siku. Menggunakan Teorema Pythagoras: c = √(12² + 9²) = √(144 + 81) = √225 = 15 km.",
            level: "C4 - Analisis Geometri Ruang",
            tp: "Menerapkan teorema Pythagoras dalam menyelesaikan masalah jarak kontekstual."
          }
        ]
      },
      b_indo: {
        "teks lho": [
          {
            text: "Bacalah kutipan berikut:\n'Harimau sumatera (Panthera tigris sumatrina) merupakan subspesies harimau yang habitat aslinya di Pulau Sumatera. Satwa ini memiliki corak garis loreng lebih rapat dan warna kulit paling gelap di antara subspesies lainnya.'\nBagian teks LHO di atas merupakan struktur...",
            options: [
              "Pernyataan umum / Definisi umum",
              "Deskripsi bagian morfologi",
              "Deskripsi manfaat ekologis",
              "Kesimpulan penutup"
            ],
            correct: 0,
            exp: "Kutipan tersebut memperkenalkan klasifikasi ilmiah dan definisi umum objek yang dilaporkan.",
            level: "C2 - Pemahaman Struktur Teks",
            tp: "Mengidentifikasi struktur teks laporan hasil observasi dengan tepat."
          }
        ]
      },
      informatika: {
        "berpikir komputasional": [
          {
            text: "Memecah masalah sistem perpustakaan sekolah yang rumit menjadi bagian-bagian lebih kecil seperti pendaftaran anggota, pencatatan buku, dan denda keterlambatan merupakan penerapan pilar...",
            options: [
              "Dekomposisi (Decomposition)",
              "Pengenalan Pola (Pattern Recognition)",
              "Abstraksi (Abstraction)",
              "Algoritma (Algorithm Design)"
            ],
            correct: 0,
            exp: "Dekomposisi adalah teknik memecah masalah kompleks menjadi sub-masalah yang lebih sederhana dan terkelola.",
            level: "C4 - Analisis Masalah Komputasi",
            tp: "Menerapkan 4 pilar computational thinking dalam merancang solusi persoalan sehari-hari."
          }
        ]
      }
    };
  }

  /**
   * Menghasilkan daftar soal berdasarkan parameter yang dimasukkan guru
   */
  async generateQuestions({ subject, subjectName, grade, topic, count = 5, level = "HOTS", customPrompt = "" }) {
    // Simulasi delay AI generasi (500-1200ms agar terasa natural)
    await new Promise(r => setTimeout(r, 600));

    const generated = [];
    const lowerTopic = (topic || "").toLowerCase();
    const subKey = subject || "ipa";

    // Cek apakah ada bibit di knowledge base
    let candidatePool = [];
    if (this.knowledgeBase[subKey]) {
      for (const [k, questions] of Object.entries(this.knowledgeBase[subKey])) {
        if (lowerTopic.includes(k) || k.includes(lowerTopic)) {
          candidatePool.push(...questions);
        }
      }
      if (candidatePool.length === 0) {
        // Ambil semua dari subjek terkait jika topik spesifik tidak pas
        Object.values(this.knowledgeBase[subKey]).forEach(list => candidatePool.push(...list));
      }
    }

    // Generator algoritma sintetik untuk melengkapi target jumlah soal
    for (let i = 0; i < count; i++) {
      if (i < candidatePool.length) {
        const item = candidatePool[i];
        generated.push({
          id: `ai-q-${Date.now()}-${i + 1}`,
          type: "pilihan_ganda",
          text: item.text,
          options: [...item.options],
          correctAnswer: item.correct,
          explanation: item.exp,
          topic: topic || "Materi Kurikulum Merdeka",
          cognitiveLevel: level === "HOTS" ? item.level : "C3 - Aplikasi Terapan",
          learningObjective: item.tp,
          difficulty: level.toLowerCase().includes("hots") || level.toLowerCase().includes("sulit") ? "sulit" : "sedang",
          weight: 100
        });
      } else {
        // Sintesis soal dinamis kontekstual
        const dynamicQ = this.synthesizeDynamicQuestion(subjectName || subject, grade, topic, i + 1, level);
        generated.push(dynamicQ);
      }
    }

    return generated;
  }

  synthesizeDynamicQuestion(subjectName, grade, topic, index, level) {
    const isHots = level.toUpperCase().includes("HOTS") || level.toUpperCase().includes("SULIT");
    const safeTopic = topic || "Pembelajaran Fase D";

    const questionTemplates = [
      {
        lead: `Perhatikan fenomena yang berkaitan dengan materi "${safeTopic}" di lingkungan sekitar siswa SMP Negeri 19 Palembang berikut ini:`,
        stem: `Berdasarkan analisis konsep yang telah dipelajari di Kelas ${grade}, kesimpulan ilmiah yang paling tepat adalah...`,
        options: [
          `Pernyataan A merupakan hubungan sebab-akibat langsung yang memperkuat konsep ${safeTopic}`,
          `Pernyataan B merupakan faktor penghambat yang tidak berkaitan dengan efisiensi proses`,
          `Pernyataan C merupakan anomali yang hanya terjadi pada kondisi laboratorium terkontrol`,
          `Pernyataan D menunjukkan bahwa tidak ada pengaruh variabel bebas terhadap variabel terikat`
        ],
        correct: 0,
        exp: `Analisis mendalam terhadap ${safeTopic} menunjukkan adanya hubungan konsisten antara variabel yang diuji sesuai kaidah Kurikulum Merdeka Fase D.`,
        cog: isHots ? "C4 - Analisis Kritis" : "C3 - Aplikasi Konsep",
        tp: `Menganalisis prinsip dasar dan implikasi konsep ${safeTopic} dalam pemecahan masalah.`
      },
      {
        lead: `Dalam suatu studi kasus tentang "${safeTopic}", disajikan data pengukuran yang menunjukkan fluktuasi nilai dari waktu ke waktu.`,
        stem: `Langkah evaluatif atau solusi inovatif yang paling tepat untuk mengoptimalkan hasil belajar adalah...`,
        options: [
          `Melakukan perbaikan sistematis pada tahapan perencanaan dan monitoring berkala`,
          `Menghentikan proses penyelidikan tanpa mencatat faktor ketidakpastian data`,
          `Mengganti seluruh instrumen tanpa menganalisis sumber kesalahan sebelumnya`,
          `Mengabaikan deviasi data dan mengambil kesimpulan secara tergesa-gesa`
        ],
        correct: 0,
        exp: `Pendekatan solutif dan evaluatif memerlukan perbaikan terencana serta monitoring berbasis data yang valid.`,
        cog: isHots ? "C5 - Evaluasi dan Solusi Masalah" : "C2 - Pemahaman Prinsip",
        tp: `Mengevaluasi keabsahan data dan merumuskan solusi efektif terkait ${safeTopic}.`
      },
      {
        lead: `Penerapan konsep "${safeTopic}" sangat relevan dengan Profil Pelajar Pancasila (Bernalar Kritis dan Mandiri).`,
        stem: `Manakah contoh tindakan nyata siswa yang mencerminkan pemahaman mendalam tentang materi tersebut?`,
        options: [
          `Mengembangkan ide kreatif untuk memecahkan persoalan nyata di sekolah menggunakan prinsip ${safeTopic}`,
          `Hanya menghafal definisi tanpa memahami cara kerja konsep dalam kehidupan sehari-hari`,
          `Menolak berdiskusi dalam kelompok dan memilih bekerja tanpa acuan literatur`,
          `Menunggu instruksi guru tanpa melakukan observasi mandiri di kelas`
        ],
        correct: 0,
        exp: `Pemahaman bermakna (meaningful learning) tercermin saat siswa mampu mentransfer pengetahuan ke situasi kontekstual nyata.`,
        cog: isHots ? "C6 - Kreasi dan Inovasi" : "C3 - Penerapan Praktis",
        tp: `Mengkreasi solusi berbasis penalaran ilmiah pada materi ${safeTopic}.`
      }
    ];

    const pick = questionTemplates[(index - 1) % questionTemplates.length];

    return {
      id: `ai-q-syn-${Date.now()}-${index}`,
      type: "pilihan_ganda",
      text: `${pick.lead}\n${pick.stem}`,
      options: pick.options,
      correctAnswer: pick.correct,
      explanation: pick.exp,
      topic: safeTopic,
      cognitiveLevel: pick.cog,
      learningObjective: pick.tp,
      difficulty: isHots ? "sulit" : "sedang",
      weight: 100
    };
  }
}

// Global AI generator singleton
window.smartAI = new AIQuestionGenerator();
