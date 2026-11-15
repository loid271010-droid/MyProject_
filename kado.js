/* =====================================================================
   ISI KADO. Semua yang perlu kamu ganti ada di file ini.
   Buka dengan Notepad atau VS Code, ganti tulisan di dalam tanda kutip "...", lalu simpan.
   Jangan hapus tanda kutip, koma, atau kurung. Setelah disimpan, muat ulang index.html.
   ===================================================================== */
window.KADO = {

  /* --- Nama dan tanggal --- */
  "untuk": "Ayangku tercinta",                 // nama penerima
  "dari": "By",                  // namamu
  "inisial": "F & S",              // tulisan di tengah rasi bintang berbentuk hati
  "tanggal": "28 Agustus 2025",   // tampil di judul dan lembar kenangan

  /* --- 7 pesan, satu untuk tiap bintang (urut dari bintang 1 sampai 7). Maksimal sekitar 180 huruf --- */
  "pesan": [
    "Terima kasih sudah sabar menungguku, bahkan saat aku lupa memberi kabar.",
    "Aku sayang dan cinta sekali kepada mu wahai bidadarikuu. ",
    "Kadang hari hari ku terasa berat. ketika kamu ada, hari ku berubah total.",
    "Kopi hangat, hujan sore, lagu lama. Semuanya terasa lebih indah bila bersama dengan mu.",
    "Maaf sudah membuat mu kecewa tapi In syaa allah dgn ini km bisa bahagia kembali.",
    "Aku mau belajar jadi orang yang datang, bukan hanya sekedar janji.",
    "Kamu bukan beban. Kamu tempat pulang. Jadilah rumah yang hangat untukku, dan aku akan selalu menjadi rumah untukmu."
  ],

  /* --- Foto kenangan. Taruh file fotonya di folder "foto", lalu tulis satu baris per foto.
         "teks" adalah keterangan di bawah foto (boleh dikosongkan: "").
         Empat foto pertama tampil di lembar kenangan, semuanya tampil di galeri (maksimal 12).
         Tiga foto di bawah ini hanya CONTOH. Ganti atau hapus sebelum kado dikirim. --- */
  "foto": [
    { "src": "foto/WhatsApp Image 2026-11-15 at 16.45.08 (1).jpeg", "teks": "Wajah indah cantik dan rupawan" },
    { "src": "foto/WhatsApp Image 2026-11-15 at 16.45.08.jpeg", "teks": "Wajah yang begitu tidak bisa di lupakan" },
    { "src": "foto/WhatsApp Image 2026-11-15 at 16.45.09.jpeg", "teks": "Sang bidadari pun kalah Menawan" }
  ],

  /* --- Kata-kata lain. {untuk}, {dari}, {tanggal}, dan {inisial} diganti otomatis --- */
  "kata": {
    "buka": "Dari {dari}, untuk {untuk}. Tujuh bintang menunggu dibuka.",   // di bawah "Ada kado untukmu"
    "judul": "Untuk {untuk}",                                               // judul besar setelah rasi bintang
    "subjudul": "dari {dari} · {tanggal}",                                  // baris kecil di bawah judul
    "penutup": "Terima kasih sudah membaca sampai bintang terakhir.",       // kalimat penutup. Kosongkan "" kalau tidak mau
    "stikerHati": "dari hati"                                               // tulisan di stiker biru
  },

  /* --- Alamat web kado ini untuk QR code. Kosongkan "" kalau tidak yakin:
         QR akan memakai alamat halaman yang sedang dibuka. --- */
  "linkBagikan": ""
};
