const yearEl = document.getElementById("year");
const btn = document.getElementById("btnTerlihat");
const msg = document.getElementById("message");

if (yearEl) yearEl.textContent = new Date().getFullYear();

const pesan = [
  "Siap menampilkan kejutan…",
  "Hello World dari browser — selamat datang!",
  "Desain klasik: hangat, rapi, dan elegan.",
  "HTML membangun struktur, CSS memberi gaya, JavaScript menghidupkan.",
];

let i = 0;

function setMessage(text) {
  const textEl = msg?.querySelector(".message__text");
  if (textEl) textEl.textContent = text;
}

btn?.addEventListener("click", () => {
  i = Math.min(i + 1, pesan.length - 1);
  setMessage(pesan[i]);

  // Aksen kecil biar terasa hidup
  msg.animate(
    [
      { transform: "translateY(0px)" },
      { transform: "translateY(-2px)" },
      { transform: "translateY(0px)" },
    ],
    { duration: 260, easing: "ease-out" },
  );
});
