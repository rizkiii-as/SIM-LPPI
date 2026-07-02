// main.js - Entry point untuk semua module JavaScript SIM LPPI UMP

import { initSidebar } from "./sidebar.js";
import { initAuth, checkAuth, displayUserInfo, initLogout } from "./auth.js";
import { initProfil, updateAvatarDisplay } from "./profil.js";
import { initMentor2 } from "./mentor2.js";
import { initMentee2 } from "./mentee2.js";
import { initTBA2 } from "./tba2.js";
import { initBIBAQ2 } from "./bibaq2.js";
import { initBerprestasi2 } from "./seleksiberprestasi2.js";
import { initDashboard } from "./dashboard.js";

// Fungsi untuk menginisialisasi aplikasi
function initApp() {
  // Cek halaman mana yang sedang aktif
  const currentPage = window.location.pathname;

  if (currentPage.includes("login.html") || currentPage.endsWith("/")) {
    // Halaman Login
    initAuth();
  } else if (
    currentPage.includes("dashboard.html") ||
    currentPage.includes("mentor.html") ||
    currentPage.includes("mentee.html") ||
    currentPage.includes("tba.html") ||
    currentPage.includes("bibaq.html") ||
    currentPage.includes("seleksiberprestasi.html") ||
    currentPage.includes("profil.html")
  ) {
    // Halaman Dashboard dan halaman lainnya yang memiliki sidebar
    // Cek autentikasi terlebih dahulu
    checkAuth();

    // Tampilkan informasi user
    displayUserInfo();

    // Update avatar display (untuk menampilkan foto profil di sidebar)
    updateAvatarDisplay();

    // Inisialisasi sidebar
    initSidebar();

    // Inisialisasi logout
    initLogout();

    // Jika halaman Dashboard, inisialisasi modul Dashboard
    if (currentPage.includes("dashboard.html")) {
      initDashboard();
    }

    if (currentPage.includes("mentor.html")) {
      initMentor2();
    }

    if (currentPage.includes("mentee.html")) {
      initMentee2();
    }

    // Jika halaman TBA, inisialisasi modul TBA
    if (currentPage.includes("tba.html")) {
      initTBA2();
    }

    // Jika halaman BIBAQ, inisialisasi modul BIBAQ
    if (currentPage.includes("bibaq.html")) {
      initBIBAQ2();
    }

    // Jika halaman Seleksi Berprestasi, inisialisasi modul Seleksi Berprestasi
    if (currentPage.includes("seleksiberprestasi.html")) {
      initBerprestasi2();
    }

    // Jika halaman profil, inisialisasi modul profil
    if (currentPage.includes("profil.html")) {
      initProfil();
    }
  }
}

// Jalankan aplikasi setelah DOM loaded
document.addEventListener("DOMContentLoaded", initApp);
