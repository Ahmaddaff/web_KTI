# Juraganweb — Website

Situs **multi-halaman** untuk Juraganweb, agency jasa pembuatan website & software dengan model kontrak **beli putus** (sekali bayar, tanpa biaya bulanan wajib).

Setiap bagian punya halaman sendiri — bukan SPA. Navigasi berarti perpindahan halaman biasa, dan setiap halaman punya URL yang bisa dibagikan sendiri. Tidak ada build step dan tidak ada dependency yang perlu di-install.

## Halaman

| File | Isi |
| --- | --- |
| `index.html` | Beranda: hero, keunggulan, dan mockup dashboard interaktif |
| `modul.html` | Modul sistem dengan tab: kasir & stok, booking, invoice, CV, LPJ |
| `cara-kerja.html` | 4 langkah proses kontrak pengerjaan |
| `biaya.html` | 3 paket harga + kontrak maintenance tambahan |
| `portofolio.html` | Ulasan klien |
| `faq.html` | Pertanyaan yang sering diajukan |

## Menjalankan secara lokal

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Lalu buka <http://127.0.0.1:8000/index.html>.

Membuka `index.html` langsung dari filesystem juga bisa, karena semua aset diambil dari CDN.

## Detail teknis

- **Tailwind CSS** lewat CDN dengan konfigurasi tema inline (palet `ink`, aksen biru/cyan/oranye).
- **Font**: Space Grotesk (display) + Inter (body) dari Google Fonts.
- **Ikon**: Lucide, dirender lewat `lucide.createIcons()`.
- **Animasi masuk**: tiap halaman punya satu section, dan section itu melebar ke kiri–kanan sambil naik saat halaman dibuka (`scaleX 0.83 → 1`, `translateY 110px → 0`), dengan garis cahaya yang memancar dari tengah sebagai pembatas.
  - Nilai animasi ditulis langsung ke `element.style` setiap frame, dengan pemisahan tegas antara fase **baca** (semua `getBoundingClientRect()` dikumpulkan dulu) dan fase **tulis** — supaya tidak ada forced reflow di tengah frame.
  - Tidak memakai CSS `transition` pada elemen yang ditulis per frame, karena transisi akan membuat kotak "mengejar" targetnya dan terlihat lag.
- **Background berlapis** (6 lapisan): conic-gradient berputar, aurora blob, dot matrix yang bergeser, partikel canvas, beam diagonal, dan film grain.
  - Partikel canvas: DPR dibatasi 2, jumlah adaptif terhadap ukuran layar, berhenti saat tab tidak aktif.
- **Header**: menyembunyikan diri saat scroll ke bawah dan muncul lagi saat scroll ke atas. Menu aktif ditandai lewat `aria-current="page"`.
- **Aksesibilitas**: seluruh animasi dihormati lewat `prefers-reduced-motion` (animasi dimatikan, konten langsung tampil penuh).
- **Responsif**: diuji tanpa overflow horizontal pada lebar 390, 768, 1024, dan 1440 px di keenam halaman.

## Struktur

```
.
├── index.html          # Beranda
├── modul.html
├── cara-kerja.html
├── biaya.html
├── portofolio.html
├── faq.html
├── README.md
└── .gitignore
```

Header, footer, background, dan blok `<script>` memang diduplikasi di keenam file. Itu konsekuensi situs statis tanpa build step: setiap halaman harus bisa berdiri sendiri. Kalau mengubah navigasi atau footer, ubah di semua file.

## Kontak

Pemesanan dan konsultasi lewat tombol **Konsultasi WhatsApp** di setiap halaman.
