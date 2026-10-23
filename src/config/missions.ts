/**
 * OPERATION: FIND THE CODE — mission data.
 *
 * Panitia: edit questions, options, answers, digits and clue photos here after the
 * Ciputra World survey. The final vault code is built automatically from the six
 * `digit` values (in order), so it always stays in sync.
 *
 * To add/replace a clue photo, put the file in /public/clues/ and point `clueImage.src` to it.
 */

export type OptionKey = "A" | "B" | "C" | "D";

export type Mission = {
  id: number;
  code: string;
  title: string;
  category: string;
  lore: string;
  task?: string;
  question: string;
  options: Record<OptionKey, string>;
  answer: OptionKey;
  digit: string;
  clueImage?: { src: string; alt: string; width: number; height: number };
};

export const MISSIONS: Mission[] = [
  {
    id: 1,
    code: "MISSION 01",
    title: "The Starting Point",
    category: "Tebak Lokasi",
    lore: "Agent, misi pertamamu dimulai sekarang. Temukan tempat yang menjadi pusat informasi bagi pengunjung yang ingin mengetahui arah dan fasilitas di dalam gedung.",
    task: "Cari meja informasi (Information Desk) di Ciputra World.",
    question: "Apa fungsi utama tempat ini?",
    options: {
      A: "Menjual tiket bioskop",
      B: "Memberikan informasi dan petunjuk arah",
      C: "Menjual makanan",
      D: "Menyediakan tempat parkir",
    },
    answer: "B",
    digit: "4",
  },
  {
    id: 2,
    code: "MISSION 02",
    title: "Eyes Everywhere",
    category: "Observasi Visual",
    lore: "Seorang agen meninggalkan bukti visual di area yang telah ditentukan. Perhatikan lingkungan sekitarmu. Detail kecil dapat mengungkap petunjuk besar.",
    task: "Temukan objek dekorasi/instalasi asli di mall yang cocok dengan potongan foto bukti visual ini.",
    question: "Berapa jumlah bintang yang terlihat pada objek ini?",
    options: { A: "2", B: "3", C: "4", D: "5" },
    answer: "B",
    digit: "8",
    // Placeholder — replace /public/clues/mission2.jpg with the real cropped photo (same filename).
    clueImage: {
      src: "/clues/mission2.jpg",
      alt: "Potongan foto bukti visual Mission 02",
      width: 1200,
      height: 800,
    },
  },
  {
    id: 3,
    code: "MISSION 03",
    title: "Crack the Cipher",
    category: "Pecahkan Kode",
    lore: "Intercepted message: informasi lokasi berikutnya telah dienkripsi. Gunakan kunci sandi untuk memulihkan pesan: 3 - 1 - 6 - 5 (Petunjuk: A=1, B=2, C=3, dst).",
    task: "Temukan area CAFE atau tempat duduk publik yang telah ditetapkan panitia.",
    question: "Kode angka untuk huruf C-A-F-E adalah?",
    options: { A: "3-1-6-5", B: "3-2-6-5", C: "4-1-6-5", D: "3-1-5-6" },
    answer: "A",
    digit: "2",
  },
  {
    id: 4,
    code: "MISSION 04",
    title: "Think as One",
    category: "Logika Tim",
    lore: "Informasi yang kamu miliki tidak lengkap. Hanya tim yang bisa menggabungkan semua petunjuk yang akan lolos.",
    task: "Diskusikan bersama seluruh anggota tim di area publik yang ditentukan.",
    question:
      "Empat agen menyelesaikan misi secara berurutan. Bima selesai sebelum Citra. Danu selesai setelah Citra. Andi selesai sebelum Bima. Siapa yang menyelesaikan misi paling pertama?",
    options: { A: "Andi", B: "Bima", C: "Citra", D: "Danu" },
    answer: "A",
    digit: "6",
  },
  {
    id: 5,
    code: "MISSION 05",
    title: "Find the Pattern",
    category: "Pencarian Pola",
    lore: "Tiga simbol ditemukan di lokasi berbeda. Cari pola pada papan petunjuk arah / direktori mall untuk menentukan tujuan berikutnya.",
    task: "Amati papan direktori mall dan pecahkan deret angka berikut: 2, 4, 8, 16, ?",
    question: "Angka selanjutnya dari pola 2, 4, 8, 16, ? adalah...",
    options: { A: "18", B: "24", C: "32", D: "36" },
    answer: "C",
    digit: "1",
  },
  {
    id: 6,
    code: "MISSION 06",
    title: "The Final Vault",
    category: "Pertanyaan Penutup",
    lore: "Agent, hampir seluruh fragmen berhasil ditemukan. Jawab pertanyaan verifikasi terakhir untuk mendapatkan digit keenam dan membuka brankas FILE 07.",
    question: "Berapa jumlah misi sebelum misi final ini?",
    options: { A: "4", B: "5", C: "6", D: "7" },
    answer: "B",
    digit: "5",
  },
];

/** "482615" with the default data. */
export const FINAL_VAULT_CODE = MISSIONS.map((m) => m.digit).join("");

export const POINTS_PER_MISSION = 100;
export const VAULT_POINTS = 200;
export const MAX_SCORE = MISSIONS.length * POINTS_PER_MISSION + VAULT_POINTS;
export const LOCKOUT_MS = 10_000;
