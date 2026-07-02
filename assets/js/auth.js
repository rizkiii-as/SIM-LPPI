// auth.js - Module untuk autentikasi login

import { users } from "./datalogin.js";

//FUNGSI INISIALISASI AUTHENTICATION LOGIN
export function initAuth() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    initValidation();
    loginForm.addEventListener("submit", handleLogin);
  }
}

//FUNGSI INISIALISASI VALIDATION FORM
function initValidation() {
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false,
    );
  });
}

// Fungsi untuk mengecek apakah user sudah login
export function checkAuth() {
  const loggedInUser = sessionStorage.getItem("loggedInUser");

  if (!loggedInUser && window.location.pathname.includes("dashboard.html")) {
    // Jika belum login tapi mencoba akses dashboard, redirect ke login
    window.location.href = "login.html";
    return null;
  }

  try {
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

function handleLogin(e) {
  e.preventDefault();

  const form = e.target;
  const nimInput = document.getElementById("nim");
  const passwordInput = document.getElementById("password");
  const submitBtn = form.querySelector('button[type="submit"]');

  const originalBtnText = submitBtn.innerHTML;

  // Reset validasi sebelumnya
  form.classList.remove("was-validated");

  // Trigger Bootstrap validation
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return; // Stop jika validasi gagal
  }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
    Logging in...
  `;

  const nimValue = nimInput.value.trim();
  const passwordValue = passwordInput.value.trim();

  // Cari user
  const user = users.find((u) => u.nim === nimValue && u.password === passwordValue);

  if (user) {
    // Login berhasil
    const existingUserData = sessionStorage.getItem("loggedInUser");
    let userData = { ...user };

    // Preserve profile photo jika ada
    if (existingUserData) {
      try {
        const parsedData = JSON.parse(existingUserData);
        if (parsedData.nim === user.nim && parsedData.profilePhoto) {
          userData.profilePhoto = parsedData.profilePhoto;
        }
      } catch (error) {
        console.error("Error parsing existing user data:", error);
      }
    }

    sessionStorage.setItem("loggedInUser", JSON.stringify(userData));

    // Trigger custom event
    window.dispatchEvent(
      new CustomEvent("user:login", {
        detail: userData,
      }),
    );

    // Redirect dengan delay kecil
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);
  } else {
    // Login gagal
    showAlert("NIM atau password salah!", "danger");

    // Reset tombol
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

//FUNGSI MEMUNCULKAN PESAN PERINGATAN
function showAlert(message, type = "danger") {
  const alertContainer = document.getElementById("alertContainer");
  if (!alertContainer) return;

  alertContainer.innerHTML = /*html*/ `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
  ${message}
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
  alertContainer.classList.remove("d-none");

  setTimeout(() => {
    alertContainer.classList.add("d-none");
  }, 3000);
}

//FUNGSI UNTUK MENAMPILKAN DATA USER DI DASHBOARD
export function displayUserInfo() {
  const user = checkAuth();
  if (user) {
    // Update user name dan user id di sidebar
    const userNameElements = document.querySelectorAll(".user-name");
    const userIdElements = document.querySelectorAll(".user-id");

    userNameElements.forEach((el) => {
      el.textContent = user.nama;
    });

    userIdElements.forEach((el) => {
      el.textContent = user.nim;
    });

    // Update avatar dengan foto profil jika ada
    updateAvatarWithPhoto(user);
  }
}

//FUNGSI UNTUK UPDATE AVATAR DENGAN FOTO PROFIL
function updateAvatarWithPhoto(user) {
  const avatarElements = document.querySelectorAll(".user-avatar");
  if (user.profilePhoto) {
    // Jika ada foto profil, tampilkan foto
    avatarElements.forEach((avatar) => {
      avatar.innerHTML = `<img src="${user.profilePhoto}" alt="Avatar">`;
    });
  } else {
    // Jika tidak ada foto profil, tampilkan icon default
    avatarElements.forEach((avatar) => {
      avatar.innerHTML = '<i class="bi bi-person-fill"></i>';
    });
  }
}

//FUNGSI LOGOUT
export function logout() {
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// INISIALISASI BUTTON LOGOUT
export function initLogout() {
  const logoutButtons = document.querySelectorAll('.menu-item[href="#"]:has(.bi-box-arrow-right)');
  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  });
}
