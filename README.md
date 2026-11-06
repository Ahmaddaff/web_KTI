# Juraganweb — Landing Page

Landing page satu halaman untuk **Juraganweb**, agency jasa pembuatan website & software dengan model kontrak **beli putus** (sekali bayar, tanpa biaya bulanan wajib).

Halaman ini adalah satu file HTML mandiri — tanpa build step, tanpa dependency yang perlu di-install.

## Menjalankan secara lokal

Cukup buka `index.html` di browser, atau jalankan server statis:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Lalu buka <http://127.0.0.1:8000/index.html>.

## Isi halaman

| Bagian | Keterangan |
| --- | --- |
| Hero | Judul utama, animasi cahaya ala Raycast, jendela command + ilustrasi keyboard, strip keunggulan, dan mockup dashboard interaktif (5 tab bisa diklik) |
| Modul Sistem | Daftar modul yang bisa dipilih sesuai kebutuhan |
| Cara Kerja Kontrak | 4 langkah alur kerja, dari kesepakatan awal sampai website online |
| Biaya Proyek | 3 paket harga + add-on, semua harga tampil utuh tanpa biaya tersembunyi |
| Portofolio | Contoh proyek yang sudah dikerjakan |
| FAQ | Pertanyaan yang sering diajukan calon klien |

## Detail teknis

- **Tailwind CSS** lewat CDN dengan konfigurasi tema inline. Semua ramp warna lama (biru/cyan/oranye/dll.) dipetakan ulang ke palet **DEEP GREEN** (berpusat pada `#043927`, hue 160°) + **NEUTRAL**, sehingga hijau hanya muncul sebagai aksen: CTA utama, status aktif, dan satu garis tipis.
- **Tema Apple-inspired** (`<style id="appleTheme">`): navbar kaca dengan `backdrop-filter: blur(20px) saturate(180%)`, hero full-bleed bertipografi `clamp(2.5rem, 5.2vw, 4.75rem)` + `text-wrap: balance`, kartu dengan bayangan sangat tipis, dan tautan sekunder bergaya Apple dengan panah `→`. CTA aslinya berbentuk pill, lalu ditimpa menjadi rounded-rect oleh lapisan Raycast di bawah.
- **Konsep elemen Raycast.com** (`<style id="raycastConcept">` + `<script id="raycastCmd">`): geometri dan gerak; seluruh warnanya kini mengikuti palet Deep Green `#043927`.
  - Navbar menjadi satu bar mengambang `width: min(1280px, 100%)`, radius 12px, tinggi 60px, `white-space: nowrap` + gap terukur supaya tidak ada label yang terbungkus atau terpotong di 390–1920 px. Bayangan mengencang saat halaman mulai digulir (`rc-scrolled`).
  - Semua tombol, chip, badge, dan tab berubah dari pill ke **rounded-rect 8px**; kartu/panel/modal ke **12px** dengan hairline border dan highlight 1px di sisi atas.
  - Dashboard mockup jadi jendela launcher: traffic-light dinetralkan (dua abu + satu hijau), kolom URL jadi field pencarian, sidebar jadi daftar hasil dengan baris terpilih bergaris hijau lurus, dan baris tabel diberi jeda masuk 20ms.
  - Hover memakai spring `cubic-bezier(.34, 1.42, .64, 1)`, plus spotlight radial yang mengikuti kursor (satu listener delegasi menulis `--rc-mx/--rc-my`). Sweep neon lama diperlambat dan diredupkan.
  - **Command palette** berisi 8 perintah (6 section + Hitung Estimasi + WhatsApp). Buka dengan `Ctrl/⌘ + K`, `/`, atau tombol **Cari**; `↑`/`↓` memilih, `Enter` menjalankan, `ESC`/klik backdrop menutup. Hasil pencarian diurutkan: kecocokan judul didahulukan sebelum teks bantu. Palette memakai `role="dialog"`, mengunci scroll halaman saat terbuka, dan mengembalikan fokus setelah ditutup.
- **Palet hijau `#043927` (Deep Green / hutan tua)** (`<style id="limeHero">`): ramp Tailwind, variabel `--ap-accent` / `--ap-cta`, 31 literal `#043927`, 4 literal sekunder `#0E7A52`, 3 literal glow `#14A473`, ramp 50–950 (`#EFF8F3` → `#011309`), dan seluruh tinta di stage gelap digeser ke hue 160°. Nama identifier lama (`limeHero`, `limeShimmer`, `limeCaret`, …) sengaja dipertahankan — itu sekadar nama, bukan nilai warna — supaya patch tetap minimal dan tidak ada referensi silang yang putus. Lima penyesuaian fungsional yang memang diperlukan:
  - **Label CTA dibalik menjadi putih** (`--ap-cta-text:#FFFFFF`). Tinta gelap lama `#101013` di atas `#043927` hanya `1.47:1`; putih mencapai `12.97:1`. Aturan yang sama juga mewarnai kotak logo di header, yang isiannya sama-sama hijau tua.
  - **Keluarga glow memakai hijau semeton yang lebih terang** `#14A473` → `rgba(20,164,115,…)` (92 literal). `#043927` murni dengan alpha rendah akan hilang di atas stage keyboard yang nyaris hitam, jadi beam, halo, dan hot-key memakai turunan lebih terang sementara aksen solid tetap `#043927`.
  - **`.text-rose-300` masuk ke override `--ap-accent-ink`**, karena 4 label "Terisi" berada di kartu terang dengan warna ramp-300 yang pucat. Kini semuanya `#043927` (`12.97:1`).
  - **Caret dan garis baris terpilih di stage gelap tetap `#14A473`** (`5.97:1` di atas `#04130D`). Kalau keduanya ikut menjadi `#043927`, kontrasnya cuma `1.47:1` dan praktis tak terlihat di atas panggung yang nyaris hitam.
  - Karena `#043927` sendiri sangat gelap, teks hijau kecil aman memakai warna primer yang sama (`--ap-accent-ink:#043927`, `12.97:1` di atas putih); tidak dibutuhkan turunan gelap tambahan. Judul hero memakai gradient `#043927 → #0E7A52 → #043927` yang bergerak pelan (`limeShimmer`) supaya tetap terbaca.
- **Animasi hero ala Raycast.com**: 7 diagonal light beams hijau bergerak di belakang headline (`#heroBeams`, `limeBeamDrift`), wash radial berdenyut, badge mengambang, plus stage gelap dengan beam + glow yang merespons pointer (parallax lewat satu `requestAnimationFrame`). Jendela command mengambang (`hsFloat`) dengan efek mengetik 4 frasa, caret berkedip, dan 3 baris hasil bergiliran aktif tiap 2,3 detik.
- **Gambar keyboard ala Raycast.com**: ilustrasi CSS murni (bukan bitmap) di `#heroStage` — 5 baris, 64 tombol, `⌘ command` + space menyala lewat `hsHot`, dan gelombang nyala `hsKeyWave` berurutan memakai `--i`. Di ≤640 px label `command` disembunyikan supaya tidak terpotong. Layer beam dibungkus `.hs-beam-clip` agar tidak menciptakan scroll internal, dan stage sengaja dikeluarkan dari scroll-reveal.
- **Font**: `-apple-system`, `BlinkMacSystemFont`, `SF Pro`, `Inter`, lalu fallback `Helvetica Neue, Arial`.
- **Kanvas selalu terang**: `color-scheme: light` dan override `prefers-color-scheme: dark` sengaja dihapus, jadi sistem operasi gelap tidak mengubah tampilan. Latar `#FFFFFF`, permukaan kartu `#F5F5F7`, teks `#101013` (judul `#0B0B0D`), teks bantu `#5C5C63`. Hijau aksen **Deep Green** `#043927` (sekunder `#0E7A52`, garis halus `#DCEFE5`, glow `#14A473`, label CTA `#FFFFFF`) — tidak memakai LimeGreen `#32CD32`, kuning-lime `#78C22B`, maupun sage pucat.
- **Grid halus**: background `<body>` memakai 4 lapisan `linear-gradient` (garis minor 48px, garis mayor 192px) + satu `radial-gradient` hijau sangat lemah di atas, dengan `background-attachment: fixed`. Kartu dan footer tetap solid sehingga grid hanya terlihat di ruang kosong.
- **Ikon**: Lucide, dirender lewat `lucide.createIcons()`.
- **Animasi scroll**: konten muncul sekali saat masuk viewport — memudar sambil naik, lalu menetap. Tidak ada animasi keluar, jadi teks tidak pernah meredup saat digulir lewat.
  - Section bergeser 40px, blok di dalamnya 20px, dan kartu 24px; kartu dalam satu baris diberi jeda 70ms sehingga muncul berurutan.
  - Digerakkan `IntersectionObserver` + CSS `transition` (560ms, ease-out), jadi tidak ada penulisan style per frame saat scroll.
  - Ada jaring pengaman: bila scroll sangat cepat melewati sebuah blok antar-frame, sapuan ringan akan memunculkannya supaya tidak tertinggal transparan.
- **Background**: stack animasi lama (conic-gradient, aurora, dot matrix, partikel canvas, beam, film grain) dimatikan lewat `#bgLayers { display:none }`; loop partikel juga diberi guard agar tidak berjalan sia-sia. Markupnya tetap dipertahankan supaya mudah diaktifkan kembali.
- **Navigasi**: satu halaman penuh dengan smooth scroll, highlight menu otomatis mengikuti section aktif, dan header yang menyembunyikan diri saat scroll ke bawah lalu muncul lagi saat scroll ke atas.
- **Aksesibilitas**: animasi dihormati lewat `prefers-reduced-motion` — palette, beam, keyboard, caret, dan gradient judul semuanya mati; teks yang diketik langsung tampil utuh. Kontras diuji dengan perhitungan luminansi WCAG — label CTA putih di atas `#043927` `12.97:1`, teks hijau kecil `#043927` di atas putih `12.97:1`, teks biasa `19:1`, teks bantu `6.63:1`, sekunder `#0E7A52` `5.35:1`. Glow `#14A473` (`3.19:1`) sengaja hanya dipakai sebagai cahaya, bukan teks. Tema gelap OS tetap menghasilkan kanvas putih.
- **Responsif**: diuji tanpa overflow horizontal pada lebar 390, 768, 1024, 1280, 1440, dan 1920 px; navbar tidak terpotong, stage tidak punya overflow internal, tidak ada label tombol keyboard yang terpotong, dan tidak ada label menu yang turun baris. 0 error konsol, interaksi palette/dashboard/modal/SPA nav tetap berfungsi.

## Struktur

```
.
└── index.html    # seluruh halaman: markup, CSS, dan JS
```

## Kontak

Pemesanan dan konsultasi lewat tombol **Konsultasi WhatsApp** di halaman.
