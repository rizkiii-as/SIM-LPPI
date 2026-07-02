// profil.js - Module untuk mengelola halaman profil user

import { checkAuth } from "./auth.js";

let isEditing = false;
let originalData = {};

export function initProfil() {
  const user = checkAuth();
  if (!user) return;

  // Load user data
  loadUserData(user);

  // Load profile photo
  loadProfilePhoto();

  // Setup event listeners
  setupEventListeners();

  // Setup breadcrumb
  setupBreadcrumb();
}

// Load user data ke form
function loadUserData(user) {
  document.getElementById("nama").value = user.nama || "";
  document.getElementById("nim").value = user.nim || "";
  document.getElementById("prodi").value = user.prodi || "";
  document.getElementById("fakultas").value = user.fakultas || "";
  document.getElementById("jenisKelamin").value = user.jenisKelamin || "";
  document.getElementById("agama").value = user.agama || "";
  document.getElementById("ttl").value = user.ttl || "";
  document.getElementById("kontak").value = user.kontak || "";

  // Simpan data original untuk cancel
  originalData = { ...user };
}

// Load profile photo dari memori
function loadProfilePhoto() {
  const user = checkAuth();
  if (!user) return;

  const profilePhoto = document.getElementById("profilePhoto");
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const deleteBtn = document.getElementById("deletePhotoBtn");

  // Cek apakah ada foto profil yang tersimpan
  const savedPhoto = user.profilePhoto;

  if (savedPhoto) {
    // Tampilkan foto
    profilePhoto.innerHTML = `<img src="${savedPhoto}" alt="Profile Photo">`;
    if (sidebarAvatar) {
      sidebarAvatar.innerHTML = `<img src="${savedPhoto}" alt="Avatar">`;
    }
    deleteBtn.style.display = "inline-block";
  } else {
    // Tampilkan icon default
    profilePhoto.innerHTML = '<i class="bi bi-person-fill"></i>';
    if (sidebarAvatar) {
      sidebarAvatar.innerHTML = '<i class="bi bi-person-fill"></i>';
    }
    deleteBtn.style.display = "none";
  }
}

// Setup event listeners
function setupEventListeners() {
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const profileForm = document.getElementById("profileForm");
  const uploadPhotoBtn = document.getElementById("uploadPhotoBtn");
  const deletePhotoBtn = document.getElementById("deletePhotoBtn");
  const photoInput = document.getElementById("photoInput");

  // Edit button
  editBtn.addEventListener("click", enableEditMode);

  // Save button
  profileForm.addEventListener("submit", handleSaveProfile);

  // Cancel button
  cancelBtn.addEventListener("click", disableEditMode);

  // Upload photo button
  uploadPhotoBtn.addEventListener("click", () => {
    photoInput.click();
  });

  // Photo input change
  photoInput.addEventListener("change", handlePhotoUpload);

  // Delete photo button
  deletePhotoBtn.addEventListener("click", handleDeletePhoto);
}

// Enable edit mode
function enableEditMode() {
  isEditing = true;

  // Enable semua input kecuali NIM
  const inputs = ["nama", "prodi", "fakultas", "jenisKelamin", "agama", "ttl", "kontak"];
  inputs.forEach((id) => {
    document.getElementById(id).disabled = false;
  });

  // Toggle buttons
  document.getElementById("editBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "inline-block";
}

// Disable edit mode
function disableEditMode() {
  isEditing = false;

  // Disable semua input
  const inputs = ["nama", "nim", "prodi", "fakultas", "jenisKelamin", "agama", "ttl", "kontak"];
  inputs.forEach((id) => {
    document.getElementById(id).disabled = true;
  });

  // Restore original data
  loadUserData(originalData);

  // Toggle buttons
  document.getElementById("editBtn").style.display = "inline-block";
  document.getElementById("saveBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "none";
}

// Handle save profile
function handleSaveProfile(e) {
  e.preventDefault();

  // Validasi form
  if (!validateForm()) {
    return;
  }

  // Get updated data
  const updatedUser = {
    nim: document.getElementById("nim").value.trim(),
    nama: document.getElementById("nama").value.trim(),
    prodi: document.getElementById("prodi").value.trim(),
    fakultas: document.getElementById("fakultas").value.trim(),
    jenisKelamin: document.getElementById("jenisKelamin").value,
    agama: document.getElementById("agama").value,
    ttl: document.getElementById("ttl").value.trim(),
    kontak: document.getElementById("kontak").value.trim(),
    password: originalData.password, // Keep original password
    profilePhoto: originalData.profilePhoto, // Keep profile photo
  };

  // Update user data (menggunakan variabel sementara karena sessionStorage tidak direkomendasikan)
  try {
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
    const mergedUser = { ...loggedInUser, ...updatedUser };
    sessionStorage.setItem("loggedInUser", JSON.stringify(mergedUser));

    // Update original data
    originalData = { ...mergedUser };

    // Update tampilan
    updateUserDisplay(mergedUser);

    // Disable edit mode
    disableEditMode();

    // Show success message
    showAlert("Profil berhasil diperbarui!", "success");
  } catch (error) {
    showAlert("Gagal menyimpan profil. Silakan coba lagi.", "danger");
    console.error("Error saving profile:", error);
  }
}

// Validate form
function validateForm() {
  const nama = document.getElementById("nama").value.trim();
  const prodi = document.getElementById("prodi").value.trim();
  const fakultas = document.getElementById("fakultas").value.trim();
  const jenisKelamin = document.getElementById("jenisKelamin").value;
  const agama = document.getElementById("agama").value;
  const ttl = document.getElementById("ttl").value.trim();
  const kontak = document.getElementById("kontak").value.trim();

  if (!nama || !prodi || !fakultas || !jenisKelamin || !agama || !ttl || !kontak) {
    showAlert("Semua field harus diisi!", "danger");
    return false;
  }

  // Validasi kontak (harus angka)
  if (!/^\d+$/.test(kontak)) {
    showAlert("Kontak harus berupa angka!", "danger");
    return false;
  }

  return true;
}

// Update user display di sidebar
function updateUserDisplay(user) {
  const userNameElements = document.querySelectorAll(".user-name");
  const userIdElements = document.querySelectorAll(".user-id");

  userNameElements.forEach((el) => {
    el.textContent = user.nama;
  });

  userIdElements.forEach((el) => {
    el.textContent = user.nim;
  });
}

// Handle photo upload
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Validasi file
  const validTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!validTypes.includes(file.type)) {
    showAlert("Format file harus JPG, PNG, atau JPEG!", "danger");
    return;
  }

  // Validasi ukuran file (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    showAlert("Ukuran file maksimal 2MB!", "danger");
    return;
  }

  // Read file dan convert ke base64
  const reader = new FileReader();
  reader.onload = function (event) {
    const photoDataUrl = event.target.result;

    // Update tampilan foto
    updateProfilePhoto(photoDataUrl);

    // Simpan ke user data
    saveProfilePhoto(photoDataUrl);

    showAlert("Foto profil berhasil diupload!", "success");
  };
  reader.readAsDataURL(file);
}

// Update profile photo display
function updateProfilePhoto(photoDataUrl) {
  const profilePhoto = document.getElementById("profilePhoto");
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const deleteBtn = document.getElementById("deletePhotoBtn");

  // Update main profile photo
  profilePhoto.innerHTML = `<img src="${photoDataUrl}" alt="Profile Photo">`;

  // Update sidebar avatar
  if (sidebarAvatar) {
    sidebarAvatar.innerHTML = `<img src="${photoDataUrl}" alt="Avatar">`;
  }

  // Update all sidebar avatars (for consistency across pages)
  const allAvatars = document.querySelectorAll(".user-avatar");
  allAvatars.forEach((avatar) => {
    avatar.innerHTML = `<img src="${photoDataUrl}" alt="Avatar">`;
  });

  // Show delete button
  deleteBtn.style.display = "inline-block";
}

// Save profile photo
function saveProfilePhoto(photoDataUrl) {
  try {
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
    loggedInUser.profilePhoto = photoDataUrl;
    sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    originalData.profilePhoto = photoDataUrl;
  } catch (error) {
    console.error("Error saving profile photo:", error);
  }
}

// Handle delete photo
function handleDeletePhoto() {
  if (!confirm("Apakah Anda yakin ingin menghapus foto profil?")) {
    return;
  }

  const profilePhoto = document.getElementById("profilePhoto");
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const deleteBtn = document.getElementById("deletePhotoBtn");

  // Reset to default icon
  profilePhoto.innerHTML = '<i class="bi bi-person-fill"></i>';
  if (sidebarAvatar) {
    sidebarAvatar.innerHTML = '<i class="bi bi-person-fill"></i>';
  }

  // Update all sidebar avatars
  const allAvatars = document.querySelectorAll(".user-avatar");
  allAvatars.forEach((avatar) => {
    avatar.innerHTML = '<i class="bi bi-person-fill"></i>';
  });

  // Hide delete button
  deleteBtn.style.display = "none";

  // Remove from user data
  try {
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
    delete loggedInUser.profilePhoto;
    sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    delete originalData.profilePhoto;
    showAlert("Foto profil berhasil dihapus!", "success");
  } catch (error) {
    console.error("Error deleting profile photo:", error);
  }
}

// Show alert message
function showAlert(message, type) {
  // Remove existing alert if any
  const existingAlert = document.querySelector(".alert-custom");
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create new alert
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show alert-custom`;
  alert.setAttribute("role", "alert");
  alert.innerHTML = `
		${message}
		<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
	`;

  // Insert alert before profile card
  const profileCard = document.querySelector(".dashboard-card");
  profileCard.parentNode.insertBefore(alert, profileCard);

  // Auto dismiss after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Setup breadcrumb
function setupBreadcrumb() {
  const breadcrumb = document.getElementById("breadcrumb");
  if (!breadcrumb) return;

  breadcrumb.innerHTML = `
		<li class="breadcrumb-item"><a href="dashboard.html">Dashboard</a></li>
		<li class="breadcrumb-item active" aria-current="page">Profil</li>
	`;
}

// Export function untuk update avatar di semua halaman
export function updateAvatarDisplay() {
  const user = checkAuth();
  if (!user) return;

  const allAvatars = document.querySelectorAll(".user-avatar");
  if (user.profilePhoto) {
    allAvatars.forEach((avatar) => {
      avatar.innerHTML = `<img src="${user.profilePhoto}" alt="Avatar">`;
    });
  } else {
    allAvatars.forEach((avatar) => {
      avatar.innerHTML = '<i class="bi bi-person-fill"></i>';
    });
  }
}
