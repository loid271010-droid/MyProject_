# Toples Bintang (siap kirim)

Hadiah digital interaktif. Kamu atur sekali di file `kado.js`, lalu penerima tinggal membuka.
Tanpa server, tanpa database, tanpa install apa pun.

## Isi folder

```
index.html     halaman utama (jangan diubah)
css/style.css  tampilan
js/app.js      alur cerita
js/qr.js       pembuat QR code
kado.js        ISI KADO: nama, 7 pesan, foto, kata-kata. Ini satu-satunya file yang kamu ganti.
foto/          taruh foto kenangan di sini
```

## Langkah 1: atur isi kado

Buka `kado.js` dengan Notepad atau VS Code. Semua yang bisa diganti diberi penjelasan di dalamnya.

| Bagian | Fungsi |
| --- | --- |
| `untuk`, `dari` | nama penerima dan namamu |
| `inisial` | tulisan di tengah rasi bintang berbentuk hati |
| `tanggal` | tampil di judul dan lembar kenangan |
| `pesan` | 7 pesan, satu untuk tiap bintang |
| `foto` | daftar foto kenangan beserta keterangannya (sampai 12) |
| `kata` | kalimat pembuka, judul, kalimat penutup, tulisan stiker |

Ganti hanya tulisan di dalam tanda kutip `"..."`. Jangan hapus tanda kutip, koma, atau kurung.
Setelah disimpan, muat ulang `index.html` untuk melihat hasilnya.

### Foto kenangan

1. Salin foto ke folder `foto/` (nama huruf kecil tanpa spasi, misalnya `pantai.jpg`).
2. Daftarkan di `kado.js`, satu baris per foto:
   `{ "src": "foto/pantai.jpg", "teks": "Pantai, Juli 2024" },`
3. Empat foto pertama tampil di lembar kenangan. Semuanya tampil di galeri yang bisa digeser.
4. Tiga foto `contoh-1.jpg` sampai `contoh-3.jpg` hanya contoh. Hapus file dan barisnya sebelum dikirim.
5. Perkecil foto dulu (sisi terpanjang sekitar 1200 px) supaya cepat dimuat di HP.

### Cara lain: isi lewat form

Buka `index.html?edit=1`. Form muncul untuk mengisi nama, pesan, dan foto (foto ditanam langsung ke
file). Klik "Unduh kado.js" lalu timpa `kado.js` di folder. Tombol itu hanya muncul dengan `?edit=1`.

## Langkah 2: kirim ke penerima

**Paling mudah, lewat tautan dan QR code (cocok untuk HP):**
1. Buka app.netlify.com/drop.
2. Seret seluruh folder ini ke halamannya. Dalam beberapa detik kamu mendapat alamat web.
3. Kirim alamat itu lewat WhatsApp, atau tampilkan QR code dengan tombol "Bagikan" di pojok kanan atas.
   QR code otomatis berisi alamat web yang benar.

Alternatif gratis lain: GitHub Pages atau Cloudflare Pages.

**Tanpa internet:** kirim folder sebagai zip. Penerima ekstrak, lalu klik dua kali `index.html`.
Foto tetap tampil. Satu batasan: di mode ini tombol "Simpan gambar" tidak bisa memasukkan foto ke
gambar hasil, sedangkan lewat alamat web fotonya ikut.

## Kado untuk orang lain

Salin seluruh folder, lalu ulangi Langkah 1 di salinan itu. Satu folder berisi satu kado.

## Catatan

- Kata `{untuk}`, `{dari}`, `{tanggal}`, dan `{inisial}` di bagian `kata` diganti otomatis.
- Kosongkan `"penutup": ""` kalau tidak mau ada kalimat penutup.
- Tombol "Bagikan" memakai alamat halaman yang sedang dibuka. Kalau mau alamat lain di QR,
  isi `linkBagikan` di `kado.js`.
