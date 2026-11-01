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
| Hero | Judul utama, strip keunggulan, dan mockup dashboard interaktif (sidebar bisa diklik) |
| Cara Kerja Kontrak | 4 langkah alur kerja, dari kesepakatan awal sampai website online |
| Biaya | 3 paket harga + add-on, semua harga tampil utuh tanpa biaya tersembunyi |
| Portofolio | Contoh proyek yang sudah dikerjakan |
| Modul Sistem | Daftar modul yang bisa dipilih sesuai kebutuhan |
| FAQ | Pertanyaan yang sering diajukan calon klien |

## Detail teknis

- **Tailwind CSS** lewat CDN dengan konfigurasi tema inline (palet `ink`, aksen biru/cyan/oranye).
- **Font**: Space Grotesk (display) + Inter (body) dari Google Fonts.
- **Ikon**: Lucide, dirender lewat `lucide.createIcons()`.
- **Animasi scroll**: konten muncul sekali saat masuk viewport — memudar sambil naik, lalu menetap. Tidak ada animasi keluar, jadi teks tidak pernah meredup saat digulir lewat.
  - Section bergeser 40px, blok di dalamnya 20px, dan kartu 24px; kartu dalam satu baris diberi jeda 70ms sehingga muncul berurutan.
  - Digerakkan `IntersectionObserver` + CSS `transition` (560ms, ease-out), jadi tidak ada penulisan style per frame saat scroll.
  - Ada jaring pengaman: bila scroll sangat cepat melewati sebuah blok antar-frame, sapuan ringan akan memunculkannya supaya tidak tertinggal transparan.
  - Garis cahaya di atas tiap section memancar dari tengah saat section itu masuk.
- **Background berlapis** (6 lapisan): conic-gradient berputar, aurora blob, dot matrix yang bergeser, partikel canvas, beam diagonal, dan film grain.
  - Partikel canvas: DPR dibatasi 2, jumlah adaptif terhadap ukuran layar, berhenti saat tab tidak aktif.
- **Navigasi**: satu halaman penuh dengan smooth scroll, highlight menu otomatis mengikuti section aktif, dan header yang menyembunyikan diri saat scroll ke bawah lalu muncul lagi saat scroll ke atas.
- **Aksesibilitas**: seluruh animasi dihormati lewat `prefers-reduced-motion` (animasi dimatikan, background tetap tampil statis).
- **Responsif**: diuji tanpa overflow horizontal pada lebar 390, 768, 1024, 1280, 1440, dan 1920 px.

## Struktur

```
.
└── index.html    # seluruh halaman: markup, CSS, dan JS
```

## Kontak

Pemesanan dan konsultasi lewat tombol **Konsultasi WhatsApp** di halaman.
