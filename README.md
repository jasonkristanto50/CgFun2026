You are an expert full-stack Next.js developer and creative UI designer. Build a complete, production-ready, mobile-first interactive web application for "CG FUN 2026 — Operation: Find the Code" inside this repository.

## 1. TECH STACK & SETUP
- Framework: Next.js (App Router, TypeScript)
- Styling: Tailwind CSS + Google Fonts (`Playfair Display` or `Cinzel` for vintage newspaper headlines, `Space Mono` or `Courier Prime` for classified agent tickers/numbers, and `Plus Jakarta Sans` or `Inter` for clean body text).
- Animations & Icons: `framer-motion`, `lucide-react`, `html-to-image` (or `canvas` for downloadable Agent ID Card generation).
- Ensure `package.json` has standard `dev`, `build`, and `start` scripts so Vercel builds automatically on push.

## 2. VISUAL DIRECTION (DIRECT REFERENCE: "FARMING DAY / FARM CHRONICLE")
We are adapting the exact layout and vintage tactile aesthetic of "Bojong Gede Farm Chronicle" into a Secret Agent / Detective Newspaper theme called "SURABAYA SECRET CHRONICLE — Special Classified Edition":
- Background & Texture: Deep vintage espresso/dark charcoal-sepia background (`#231F1A` / `#1C1915`) with a subtle CSS noise/grain overlay and vintage paper borders (`#4A4235`).
- Typography & Accents: Cream/off-white newspaper ink (`#EDE6D6`), classified crimson red stamps/underlines (`#C84B31`), and vintage brass/gold CTA buttons (`#8C6D2E` and deep forest green `#213A2B`).
- Mobile-First Container: Center the experience in a sleek mobile-first newspaper column (`max-w-md` or `max-w-lg` on desktop with framed borders) so it feels like holding a physical secret newspaper/dossier on a phone.

## 3. ENVIRONMENT VARIABLE & GOOGLE SHEETS API (`app/api/sheets/route.ts`)
Vercel has an environment variable named `CG_FUN_AppScript` containing our Google Apps Script Web App URL.
Create a Next.js API route at `app/api/sheets/route.ts` that accepts `POST` requests from the frontend and forwards the JSON body to `process.env.CG_FUN_AppScript` using `fetch(url, { method: 'POST', body: JSON.stringify(body), redirect: 'follow' })`.
- If `process.env.CG_FUN_AppScript` is missing during local dev, return a mock `{ result: 'success', mocked: true }` with a console warning so the UI still works seamlessly.

The Google Apps Script expects two exact JSON schemas:

Schema A — RSVP Registration:
{
  "type": "RSVP",
  "nama": "string (Full Name + Codename e.g. 'Jason (Agent Falcon)')",
  "nomorTelepon": "string",
  "alamat": "string",
  "status": "Ikut" | "Masih Ragu",
  "statusCg": "CG People" | "VIP / Teman Baru"
}

Schema B — Live Game Progress:
{
  "type": "GAME",
  "teamName": "string",
  "currentMission": "Mission 1" | "Mission 2" | "Mission 3" | "Mission 4" | "Mission 5" | "Mission 6" | "FINISHED",
  "wrongAttempts": number,
  "score": number,
  "status": "In Progress" | "FINISHED"
}

## 4. PAGE 1: THE INVITATION & REGISTRATION (`app/page.tsx`)
Follow this exact top-to-bottom section structure inspired by the Farming Day reference:

1. **Newspaper Masthead (Top Header):**
   - Left micro-text: "SECRET AGENTS / STRONGER / TOGETHER"
   - Center Title: "CIPUTRA WORLD / THE CG FUN CHRONICLE"
   - Right micro-text: "SHARP MINDS / BETTER / PEOPLE"
   - Sub-bar: "SPECIAL MISSION EDITION" | "SURABAYA, INDONESIA" | "EST. 2026"

2. **Live Breaking News Marquee Ticker:**
   - Red badge `[• BREAKING]` followed by an infinite scrolling ticker: `"Kode rahasia dipecah menjadi 6 bagian di Ciputra World ◆ Trust your team ◆ 60 menit waktu operasi ◆ Jangan sampai tertangkap..."`

3. **Hero Section:**
   - Huge vintage serif title: `OPERATION: FIND THE CODE` with a hand-drawn double red strike/underline accent under `FIND THE CODE`.
   - Circular rotating/tilted rubber stamp badge on the right: `"CG FUN 2026 • SECRET AGENT • SURABAYA"`.
   - Subtitle: `A REAL-WORLD MALL MISSION & HANGOUT GAME`
   - Lore text: *"Bekerja sama dalam tim, pecahkan petunjuk lokasi di Ciputra World, kumpulkan 6 fragmen angka rahasia, dan buka brankas FILE 07 sebelum waktu habis."*
   - Vintage halftone/duotone illustration card (use stylized SVG/CSS mystery building or detective silhouette).
   - Primary gold button: `DAFTAR JADI AGENT ->` (smooth scrolls to registration form) + Secondary button: `BUKA TERMINAL MISI (HARI H) ->` (links to `/game`).
   - 3-Column Quick Info Footer Bar:
     - `TANGGAL`: Segera Hadir / Oktober 2026 (editable in config)
     - `LOKASI`: Ciputra World Surabaya
     - `TIM OPERASI`: 20-30 Agent (4-5 / Tim)

4. **Manifesto Panitia (Quote Section):**
   - Small red header: `MANIFESTO PANITIA`
   - Giant red quotation marks `“`
   - Massive serif statement: `"WE DON'T JUST HANG OUT, WE BUILD FAMILY."` with a red hand-drawn underline under `FAMILY.`
   - Attribution: `- Panitia CG Fun 2026`

5. **Game Universe (4 Jenis Misi, 1 Kode Final):**
   - 4 circular metallic/vintage emblem badges in a row:
     1. `OBSERVASI` (*Mata Elang*)
     2. `KRIPTOGRAFI` (*Pecah Sandi*)
     3. `LOGIKA TIM` (*Berpikir Satu*)
     4. `POLA & KODE` (*File 07*)

6. **Peta Area (Eksplorasi Ciputra World):**
   - Vintage styled blueprint/map card of Ciputra World checkpoints with 4 colored location pins and a compass rose in the bottom right corner.
   - Caption: `GBR. 1 - Peta area operasi Ciputra World Surabaya. Ketuk untuk memperbesar.` (opens a modal with mission briefing rules).

7. **Pengumuman Panitia — Petunjuk Hari H:**
   - Structured table matching the reference:
     - `WAKTU OPERASI`: 60 Menit (Briefing tepat waktu)
     - `TITIK KUMPUL`: Ciputra World Surabaya, Jl. Mayjen Sungkono No.89, Surabaya (`Buka Maps ->` link)
     - `ATURAN & PERLENGKAPAN`: Sepatu nyaman untuk jalan, 1 HP utama per tim, dilarang berlari atau mengganggu tenant.
   - Embedded Google Maps iframe pointing to Ciputra World Surabaya (`https://www.google.com/maps?q=Ciputra+World+Surabaya&output=embed`).

8. **Agent Registration ("✂️ Gunting di sini" Dashed Coupon Form):**
   - Wrapped in a dashed border box (`border-dashed border-2`) with a `"✂️ Gunting di sini"` badge on the top-left border.
   - Header: `AGENT REGISTRATION — Daftar sekarang dan dapatkan AGENT ID CARD digital.`
   - Numbered fields (`01` to `06`):
     - `01 FOTO WAJAH (Opsional)`: Upload photo preview used solely to render their downloadable digital Agent ID Card on screen after submitting.
     - `02 NAMA LENGKAP`: Input text (maps to `nama`).
     - `03 NAMA SAMARAN (CODENAME)`: Input text + `[🎲 ACAK]` button that generates funny Indonesian secret agent codenames (e.g., *"Si Pengintai Es Teh"*, *"Agen Tahu Tek"*, *"Detektif Mall Lantai 3"*, *"Bayangan Foodcourt"*). Append this to `nama` when sending to Google Sheets!
     - `04 NO. WHATSAPP`: `+62` prefix + phone input (maps to `nomorTelepon`).
     - `05 ALAMAT / DOMISILI`: Input text (maps to `alamat`).
     - `06 STATUS KEHADIRAN & CG`: Two clean pill selectors for `status` (`Ikut` / `Masih Ragu`) and `statusCg` (`CG People` / `Teman Baru`).
   - Submit Button: `Daftar & Ambil Kartu ->`
   - **Digital Agent ID Card Modal:** Upon successful submission to `/api/sheets`, display a vintage "CLASSIFIED AGENT ID CARD" featuring their photo, Full Name, Codename, and CG Status that they can screenshot or download!

9. **Footer Callout Card ("SIAP UNTUK CG FUN 2026?"):**
   - Checklist with checkmarks:
     - Bentuk tim 4-5 orang.
     - Pecahkan 6 petunjuk lokasi.
     - Kumpulkan 6 fragmen angka.
     - Buka brankas FILE 07.
     - Kembali ke titik finish tercepat.

## 5. PAGE 2: THE INTERACTIVE MALL MISSION GAME (`app/game/page.tsx`)
Build "Operation: Find the Code" in the same vintage spy-chronicle / classified dossier theme.
Store all mission data inside a single clean configuration file (`src/config/missions.ts`) so the committee can easily edit questions and photos after their Ciputra World survey.

### Game Mechanics & State (`localStorage` persisted):
- **5 Game Screens:**
  1. `START SCREEN`: Enter `Team Name`, read the 8 official game rules, and click `MULAI OPERASI`.
  2. `MISSION SCREEN (Missions 1 to 6)`: Shows current Mission Number, Timer elapsed, Current Score, Story Lore, Physical Location Clue, optional Clue Image, and 4 Multiple-Choice options (A, B, C, D).
  3. `PENALTY & REWARD FEEDBACK`:
     - Correct Answer: Adds `+100 points`, reveals the Mission's **Secret Digit** in a dramatic classified stamp animation, sends a background POST to `/api/sheets` (`type: "GAME"`), and unlocks the Next Mission button.
     - Wrong Answer: Increments `wrongAttempts` and triggers a **10-second cooldown lock** with a visible countdown timer before the team can tap another choice.
  4. `FINAL VAULT SCREEN`: Shows all 6 collected digits (`4`, `8`, `2`, `6`, `1`, `5`) and an interactive 6-digit combination lock input to open **FILE 07** with code **`482615`** (`+200 points`, total max score `800`).
  5. `COMPLETION SCREEN ("MISSION COMPLETE")`: Sends final POST to `/api/sheets` (`status: "FINISHED"`, `score: 800`), displays Team Name, Final Score, Total Time, Wrong Attempts, and instructs the team to return to the Game Master at the Finish Line. Includes a hidden/confirmable "Reset Game" button at the very bottom for testing.

### Default Missions Data in `src/config/missions.ts`:
- **MISSION 01 — The Starting Point (Tebak Lokasi):**
  - Lore: "Agent, misi pertamamu dimulai sekarang. Temukan tempat yang menjadi pusat informasi bagi pengunjung yang ingin mengetahui arah dan fasilitas di dalam gedung."
  - Task: Cari meja informasi (Information Desk) di Ciputra World.
  - Question: "Apa fungsi utama tempat ini?"
  - Options: A. Menjual tiket bioskop | B. Memberikan informasi dan petunjuk arah (CORRECT) | C. Menjual makanan | D. Menyediakan tempat parkir
  - Secret Digit Unlocked: `4`

- **MISSION 02 — Eyes Everywhere (Observasi Visual):**
  - Lore: "Seorang agen meninggalkan bukti visual di area yang telah ditentukan. Perhatikan lingkungan sekitarmu. Detail kecil dapat mengungkap petunjuk besar."
  - Task: Temukan objek dekorasi/instalasi asli di mall yang cocok dengan potongan foto bukti visual ini (include a clean placeholder SVG/image that panitia can replace at `/public/clues/mission2.jpg`).
  - Question: "Berapa jumlah bintang yang terlihat pada objek ini?"
  - Options: A. 2 | B. 3 (CORRECT) | C. 4 | D. 5
  - Secret Digit Unlocked: `8`

- **MISSION 03 — Crack the Cipher (Pecahkan Kode):**
  - Lore: "Intercepted message: informasi lokasi berikutnya telah dienkripsi. Gunakan kunci sandi untuk memulihkan pesan: 3 - 1 - 6 - 5 (Petunjuk: A=1, B=2, C=3, dst)."
  - Task: Temukan area CAFE atau tempat duduk publik yang telah ditetapkan panitia.
  - Question: "Kode angka untuk huruf C-A-F-E adalah?"
  - Options: A. 3-1-6-5 (CORRECT) | B. 3-2-6-5 | C. 4-1-6-5 | D. 3-1-5-6
  - Secret Digit Unlocked: `2`

- **MISSION 04 — Think as One (Logika Tim):**
  - Lore: "Informasi yang kamu miliki tidak lengkap. Hanya tim yang bisa menggabungkan semua petunjuk yang akan lolos."
  - Task: Diskusikan bersama seluruh anggota tim di area publik yang ditentukan.
  - Question: "Empat agen menyelesaikan misi secara berurutan. Bima selesai sebelum Citra. Danu selesai setelah Citra. Andi selesai sebelum Bima. Siapa yang menyelesaikan misi paling pertama?"
  - Options: A. Andi (CORRECT) | B. Bima | C. Citra | D. Danu
  - Secret Digit Unlocked: `6`

- **MISSION 05 — Find the Pattern (Pencarian Pola):**
  - Lore: "Tiga simbol ditemukan di lokasi berbeda. Cari pola pada papan petunjuk arah / direktori mall untuk menentukan tujuan berikutnya."
  - Task: Amati papan direktori mall dan pecahkan deret angka berikut: 2, 4, 8, 16, ?
  - Question: "Angka selanjutnya dari pola 2, 4, 8, 16, ? adalah..."
  - Options: A. 18 | B. 24 | C. 32 (CORRECT) | D. 36
  - Secret Digit Unlocked: `1`

- **MISSION 06 — The Final Vault (Pertanyaan Penutup):**
  - Lore: "Agent, hampir seluruh fragmen berhasil ditemukan. Jawab pertanyaan verifikasi terakhir untuk mendapatkan digit keenam dan membuka brankas FILE 07."
  - Question: "Berapa jumlah misi sebelum misi final ini?"
  - Options: A. 4 | B. 5 (CORRECT) | C. 6 | D. 7
  - Secret Digit Unlocked: `5`
  - Final 6-Digit Vault Code: `482615`

Please initialize the Next.js project if not already initialized, install all required packages, build all pages and components, test that `npm run build` succeeds with zero TypeScript or ESLint errors, and let me know when it is ready to push to GitHub.
