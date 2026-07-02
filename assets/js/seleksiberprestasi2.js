// seleksiberprestasi2.js - Module untuk Seleksi Berprestasi
// Menggunakan ES6 Module, clean code, dan maintainable

import { checkAuth } from "./auth.js";
import { tahapanSeleksi, pemenangData } from "./databerprestasi.js";

// ==================== KONSTANTA & HELPER ====================

const TAHUN_AJARAN_SEKARANG = "2025-2026";

// Nilai-nilai status pendaftaran yang valid
const STATUS_PENDAFTARAN = {
  BELUM_DIVERIFIKASI: "Belum Diverifikasi",
  TERVERIFIKASI: "Terverifikasi",
  DITOLAK: "Ditolak",
};

// Nilai-nilai status seleksi yang valid
const STATUS_SELEKSI = {
  LOLOS: "Lolos",
  TIDAK_LOLOS: "Tidak Lolos",
};

const STATUS_HASIL = {
  JUARA_1: "Juara 1",
  JUARA_2: "Juara 2",
  JUARA_3: "Juara 3",
};

const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ==================== DATA MANAGEMENT ====================

function getBerprestasiData(nim) {
  const data = sessionStorage.getItem(`berprestasiData_${nim}`);
  return data ? JSON.parse(data) : null;
}

function saveBerprestasiData(data) {
  sessionStorage.setItem(`berprestasiData_${data.nim}`, JSON.stringify(data));
}

function initializeBerprestasiData(user) {
  return {
    nim: user.nim,
    nama: user.nama,
    pendaftaranStatus: null,
    statusSeleksi: null,
    statusHasil: null,
    kategori: null,
  };
}

function getStatusAndKeterangan(kategori, isFinalStage = false) {
  if (kategori === "mentor") {
    return {
      status: STATUS_SELEKSI.LOLOS,
      keterangan: isFinalStage ? "Selamat! Anda dinyatakan lolos menjadi Mentor Berprestasi" : "Selamat! Anda lolos ke tahap berikutnya",
    };
  } else {
    return {
      status: STATUS_SELEKSI.TIDAK_LOLOS,
      keterangan: isFinalStage ? "Anda tidak dinyatakan lolos menjadi Mentee Berprestasi" : "Anda tidak lolos ke tahap berikutnya",
    };
  }
}

function getTahapanWithDynamicContent(berprestasiData) {
  if (!berprestasiData?.kategori) {
    return tahapanSeleksi.map((tahap, index) => ({
      ...tahap,
      status: STATUS_SELEKSI.LOLOS,
      keterangan: index === tahapanSeleksi.length - 1 ? "Selamat! Anda dinyatakan lolos menjadi Mentor Berprestasi" : "Selamat! Anda lolos ke tahap berikutnya",
    }));
  }
  const kategori = berprestasiData.kategori;
  return tahapanSeleksi.map((tahap, index) => {
    const isFinalStage = index === tahapanSeleksi.length - 1;
    const { status, keterangan } = getStatusAndKeterangan(kategori, isFinalStage);
    return { ...tahap, status, keterangan };
  });
}

function getPemenangSet(kategori) {
  return kategori === "mentor" ? pemenangData.pemenangMentor : pemenangData.pemenangMentee;
}

// ==================== RENDER PENDAFTARAN ====================

function renderPendaftaran(berprestasiData) {
  const statusArea = document.getElementById("berprestasiRegistrationStatusArea");
  const buttonArea = document.getElementById("berprestasiRegistrationButtonArea");
  const formArea = document.getElementById("formBerprestasiPendaftaranArea");

  if (!statusArea || !buttonArea || !formArea) return;

  const btnDaftar = document.getElementById("btnDaftarBerprestasi");

  if (berprestasiData.pendaftaranStatus?.status) {
    statusArea.innerHTML = berprestasiData.pendaftaranStatus.html;
    formArea.style.display = "none";
    buttonArea.style.display = "block";

    if (btnDaftar) {
      btnDaftar.disabled = true;
      btnDaftar.innerHTML = `Daftar Seleksi`;
    }
  } else {
    statusArea.innerHTML = `
      <div class="alert alert-info mb-4 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2">
          <i class="bi bi-info-circle-fill me-2 fs-5"></i>Informasi Pendaftaran
        </h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Silakan isi data diri Anda untuk mendaftar pada Program Seleksi Mentor dan Mentee Berprestasi 
          tahun ajaran ${TAHUN_AJARAN_SEKARANG}.
        </p>
      </div>
    `;

    buttonArea.style.display = "block";
    formArea.style.display = "none";

    if (btnDaftar) {
      btnDaftar.disabled = false;
      btnDaftar.innerHTML = `Daftar Seleksi`;
    }
  }
}

// ==================== FORM MULTI-STEP ====================

let selectedKategori = null; // 'mentor' atau 'mentee'

function renderMultiStepForm(kategori) {
  selectedKategori = kategori;
  const formArea = document.getElementById("formBerprestasiPendaftaranArea");
  if (!formArea) return;

  const isMentor = kategori === "mentor";

  let formHTML = `
    <form id="formBerprestasiPendaftaran">
      <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-person-fill me-2 fs-5"></i>Data Diri</h5>
      <div class="row mb-4">
        <div class="col-md-6 mb-3">
          <label for="bp_namaLengkap" class="form-label fs-6 fw-medium">Nama Lengkap <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="text" class="form-control rounded-4 py-2 px-3" id="bp_namaLengkap" placeholder="Masukkan nama lengkap" required>
        </div>
        <div class="col-md-6 mb-3">
          <label for="bp_nim" class="form-label fs-6 fw-medium">NIM <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="text" class="form-control rounded-4 py-2 px-3" id="bp_nim" placeholder="Masukkan NIM" required>
        </div>
        <div class="col-md-6 mb-3">
          <label for="bp_fakultas" class="form-label fs-6 fw-medium">Fakultas <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="text" class="form-control rounded-4 py-2 px-3" id="bp_fakultas" placeholder="Masukkan fakultas" required>
        </div>
        <div class="col-md-6 mb-3">
          <label for="bp_prodi" class="form-label fs-6 fw-medium">Program Studi <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="text" class="form-control rounded-4 py-2 px-3" id="bp_prodi" placeholder="Masukkan program studi" required>
        </div>
        <div class="col-md-6 mb-3">
          <label for="bp_ttl" class="form-label fs-6 fw-medium">Tempat, Tanggal Lahir <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="text" class="form-control rounded-4 py-2 px-3" id="bp_ttl" placeholder="Contoh: Purwokerto, 15 Januari 2000" required>
        </div>
        <div class="col-md-6 mb-3">
          <label for="bp_jenisKelamin" class="form-label fs-6 fw-medium">Jenis Kelamin <span class="text-danger fs-6 fw-medium">*</span></label>
          <select class="form-select rounded-4 py-2 px-3" id="bp_jenisKelamin" required>
            <option value="">Pilih Jenis Kelamin</option>
            <option value="Laki-Laki">Laki-Laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <div class="col-md-12 mb-3">
          <label for="bp_alamat" class="form-label fs-6 fw-medium">Alamat <span class="text-danger fs-6 fw-medium">*</span></label>
          <textarea class="form-control rounded-4 py-2 px-3" id="bp_alamat" rows="3" placeholder="Masukkan alamat lengkap" required></textarea>
        </div>
        <div class="col-md-6 mb-3">
          <label for="bp_kontak" class="form-label fs-6 fw-medium">Kontak <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="text" class="form-control rounded-4 py-2 px-3" id="bp_kontak" placeholder="Contoh: 08123456789" required>
        </div>
        <div class="col-md-6 mb-3">
          <label for="bp_mediaSosial" class="form-label fs-6 fw-medium">Media Sosial <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="text" class="form-control rounded-4 py-2 px-3" id="bp_mediaSosial" placeholder="Contoh: Instagram @username" required>
        </div>
        <div class="col-md-12 mb-3">
          <label for="bp_motivasi" class="form-label fs-6 fw-medium">Motivasi <span class="text-danger fs-6 fw-medium">*</span></label>
          <textarea class="form-control rounded-4 py-2 px-3" id="bp_motivasi" rows="4" placeholder="Tuliskan motivasi Anda mengikuti seleksi ini..." required></textarea>
        </div>
      </div>

      <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-file-earmark-arrow-up me-2"></i>Upload Dokumen Persyaratan</h5>
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="bp_transkrip" class="form-label fs-6 fw-medium">Upload Transkrip Nilai <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="file" class="form-control rounded-4 py-2 px-3" id="bp_transkrip" accept=".pdf" required>
          <div class="file-upload-info">Format: PDF</div>
        </div>
        <div class="col-md-6 mb-3">
          <label for="bp_syahadah" class="form-label fs-6 fw-medium">Upload Sertifikat Syahadah <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="file" class="form-control rounded-4 py-2 px-3" id="bp_syahadah" accept=".pdf" required>
          <div class="file-upload-info">Format: PDF</div>
        </div>
  `;

  if (isMentor) {
    formHTML += `
        <div class="col-md-6 mb-3">
          <label for="bp_sertifikatMentor" class="form-label fs-6 fw-medium">Upload Sertifikat Mentoring Menjadi Mentor <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="file" class="form-control rounded-4 py-2 px-3" id="bp_sertifikatMentor" accept=".pdf" required>
          <div class="file-upload-info">Format: PDF</div>
        </div>
    `;
  } else {
    formHTML += `
        <div class="col-md-6 mb-3">
          <label for="bp_sertifikatMentee" class="form-label fs-6 fw-medium">Upload Sertifikat Mentoring Menjadi Mentee <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="file" class="form-control rounded-4 py-2 px-3" id="bp_sertifikatMentee" accept=".pdf" required>
          <div class="file-upload-info">Format: PDF</div>
        </div>
    `;
  }

  formHTML += `
        <div class="col-md-6 mb-3">
          <label for="bp_specta" class="form-label fs-6 fw-medium">Upload Sertifikat Specta <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="file" class="form-control rounded-4 py-2 px-3" id="bp_specta" accept=".pdf" required>
          <div class="file-upload-info">Format: PDF</div>
        </div>
        <div class="col-md-6 mb-3">
          <label for="bp_great" class="form-label fs-6 fw-medium">Upload Sertifikat Great <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="file" class="form-control rounded-4 py-2 px-3" id="bp_great" accept=".pdf" required>
          <div class="file-upload-info">Format: PDF</div>
        </div>
        <div class="col-md-6 mb-3">
          <label for="bp_rekomendasi" class="form-label fs-6 fw-medium">${isMentor ? "Upload Rekomendasi Dari Pembina Mentor" : "Upload Rekomendasi Dari Mentor Kelompok"} <span class="text-danger">*</span></label>
          <input type="file" class="form-control rounded-4 py-2 px-3" id="bp_rekomendasi" accept=".pdf" required>
          <div class="file-upload-info">Format: PDF</div>
        </div>
      </div>

      <div class="d-flex justify-content-between">
        <button type="button" id="btnBatalBerprestasi" class="btn btn-secondary me-2"><i class="bi bi-x-circle me-2"></i>Batal</button>
        <button type="submit" class="btn btn-success"><i class="bi bi-check-circle me-2"></i>Submit</button>
      </div>
      
    </form>
  `;

  formArea.innerHTML = formHTML;
  formArea.style.display = "block";

  setupFormListeners();
}

// ==================== RENDER STATUS SELEKSI (BARU) ====================

function renderStatusSeleksi(berprestasiData) {
  const container = document.getElementById("statusSeleksiContent");
  if (!container) return;

  if (!berprestasiData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-clipboard-check-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Seleksi Mentor dan Mentee Berprestasi. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  if (berprestasiData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning "></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  if (berprestasiData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger "></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  const tahapanWithContent = getTahapanWithDynamicContent(berprestasiData);
  let html = `
    <div class="timeline-seleksi ps-4 mb-3">
  `;

  tahapanWithContent.forEach((tahap) => {
    const isLolos = tahap.status === STATUS_SELEKSI.LOLOS;
    const statusClass = isLolos ? "completed" : "failed";

    html += `
      <div class="timeline-item ${statusClass} rounded-4">
        <div class="timeline-content ${statusClass} p-3 rounded-4 bg-white">
          <h5 class="fs-5 text-black fw-semibold mb-2">${tahap.tahap}</h5>
          <p class="text-black fs-6"><strong>Status:</strong> <span class="status-badge rounded-4 p-1 ${isLolos ? "success" : "danger"}">${tahap.status}</span></p>
          <p class="text-black fs-6 m-0"><i class="bi bi-calendar-event me-2"></i><strong>Tanggal:</strong> ${tahap.tanggal}</p>
          ${tahap.waktu ? `<p class="text-black fs-6 m-0"><i class="bi bi-clock me-2"></i><strong>Waktu:</strong> ${tahap.waktu}</p>` : ""}
          ${tahap.tempat ? `<p class="text-black fs-6 m-0"><i class="bi bi-geo-alt me-2"></i><strong>Tempat:</strong> ${tahap.tempat}</p>` : ""}
          <p class="text-success fs-6 m-0 fw-semibold ${isLolos ? "text-success" : "text-danger"}">${tahap.keterangan}</p>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// ==================== RENDER PEMENANG ====================

function renderPemenang(berprestasiData) {
  const container = document.getElementById("pemenangContent");
  if (!container) return;

  // BELUM DAFTAR
  if (!berprestasiData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-trophy-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Seleksi Mentor dan Mentee Berprestasi. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  // DAFTAR BELUM VERIFIKASI
  if (berprestasiData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning "></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  // DAFTAR DITOLAK
  if (berprestasiData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  const winners = getPemenangSet(berprestasiData.kategori);

  let html = `
  <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-person-video2 me-2 fs-5"></i>Pemenang Mentor Berprestasi</h5><div class="row g-4">
  `;

  // Mentor Winners
  winners.mentor.forEach((winner) => {
    const rankClassMentor = winner.rank === 1 ? "gold" : winner.rank === 2 ? "silver" : "bronze";
    html += `
      <div class="col-md-4">
        <div class="winner-card p-4 rounded-4 text-white text-center overflow-hidden ${rankClassMentor}">
          <div class="fs-2 fw-bold mb-2">${winner.rank}</div>
          <div class="fs-4 fw-bold m-0">${winner.nama}</div>
          <div class="fs-6 m-0">${winner.nim}<br>${winner.prodi}</div>
          <div class="winner-category fs-6 mt-3 rounded-4 py-2 px-3">Mentor Berprestasi</div>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  // Mentee Winners
  html += `<h5 class="fs-5 text-black fw-semibold mb-2 mt-4"><i class="bi bi-person-badge me-2"></i>Pemenang Mentee Berprestasi</h5><div class="row g-4">`;

  winners.mentee.forEach((winner) => {
    const rankClassMentee = winner.rank === 1 ? "gold" : winner.rank === 2 ? "silver" : "bronze";
    html += `
      <div class="col-md-4">
        <div class="winner-card p-4 rounded-4 text-white text-center overflow-hidden ${rankClassMentee}">
          <div class="fs-2 fw-bold mb-2">${winner.rank}</div>
          <div class="fs-4 fw-bold m-0">${winner.nama}</div>
          <div class="fs-6 m-0">${winner.nim}</div>
          <div class="fs-6 m-0">${winner.prodi}</div>
          <div class="winner-category fs-6 mt-3 rounded-4 py-2 px-3">Mentee Berprestasi</div>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  container.innerHTML = html;
}

// ==================== RENDER HASIL & SERTIFIKAT ====================

function renderHasil(berprestasiData, user) {
  const container = document.getElementById("sertifikatBerprestasiContent");
  if (!container) return;

  // BELUM DAFTAR
  if (!berprestasiData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-award-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Mentor dan Mentee Berprestasi. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  // DAFTAR BELUM VERIFIKASI
  if (berprestasiData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning"></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  // DAFTAR DITOLAK
  if (berprestasiData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger "></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  // Peserta tidak lolos — Tab Hasil tidak dapat diakses (konten fallback)
  if (berprestasiData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.TERVERIFIKASI && berprestasiData.statusSeleksi !== STATUS_SELEKSI.LOLOS) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4 border border-danger">
        <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
        <p class="m-0 fs-5 fw-semibold text-danger">Tidak Lolos</p>
        <p class="m-0 fs-6 text-muted mt-2">
          Anda dinyatakan tidak lolos pada Program Seleksi Mentor dan Mentee Berprestasi 
          tahun ajaran ${TAHUN_AJARAN_SEKARANG}.
        </p>
      </div>
    `;
    return;
  }

  // Peserta lolos — tampilkan sertifikat dengan info juara
  container.innerHTML = `
    <div class="certificate-card d-flex flex-column align-items-center justify-content-center rounded-4 p-5 text-white text-center overflow-hidden">
      <i class="bi bi-award-fill"></i>
      <h4 class="mb-0 fs-4 fw-bold">Sertifikat Penghargaan</h4>
      <p class="mb-0">Program Seleksi Mentor & Mentee Berprestasi</p>
      <p class="mb-2 fs-5 fw-bold">${berprestasiData.statusHasil}</p>

      <div class="d-flex gap-2 align-items-center justify-content-center mt-3">
        <button class="btn btn-primary btn-lg fs-5 fw-semibold" onclick="printCertificateBerprestasi('${user.nama}', '${user.nim}')">Cetak Sertifikat</button>
        <button class="btn btn-primary btn-lg fs-5 fw-semibold" onclick="downloadCertificateBerprestasi('${user.nama}', '${user.nim}')">Download Sertifikat</button>
      </div>
    </div>
  `;
}

// Fungsi Cetak Sertifikat
window.printCertificateBerprestasi = function (nama, nim) {
  alert(`Sertifikat untuk ${nama} (${nim}) sedang dicetak)`);
};

// Fungsi Download Sertifikat (Simulasi)
window.downloadCertificateBerprestasi = function (nama, nim) {
  alert(`Sertifikat untuk ${nama} (${nim}) sedang diunduh)`);
};

// ==================== HANDLE SUBMIT ====================

function handlePendaftaranSubmit(berprestasiData, user) {
  const namaLengkap = document.getElementById("bp_namaLengkap").value.trim();
  const nim = document.getElementById("bp_nim").value.trim();

  if (!namaLengkap || !nim) {
    alert("Mohon lengkapi data diri Anda.");
    return;
  }

  const tanggalSekarang = new Date().toISOString().split("T")[0];

  const kategoriLabel = selectedKategori === "mentor" ? "Mentor Berprestasi" : "Mentee Berprestasi";

  const statusPendaftaranBaru = STATUS_PENDAFTARAN.TERVERIFIKASI;
  let statusHtml = "";

  if (statusPendaftaranBaru === STATUS_PENDAFTARAN.TERVERIFIKASI) {
    statusHtml = `
    <div class="alert alert-success mb-2 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-check-circle-fill me-2 fs-5"></i>Pendaftaran Terverifikasi</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Selamat ${namaLengkap}! Pendaftaran Anda pada Program Seleksi Mentor dan Mentee Berprestasi tahun ajaran 
          ${TAHUN_AJARAN_SEKARANG} telah <strong>Terverifikasi</strong>.
        </p>
      </div>
      <div class="bg-white p-3 rounded-4 border border-success border-1 mb-4">
        <h5 class="fs-5 text-success mb-2 fw-semibold"><i class="bi bi-clipboard-check me-2 fs-5"></i>Status Pendaftaran: 
          <span class="status-badge success rounded-4 fw-semibold p-2">Terverifikasi</span>
        </h5>
        <p class="mb-0 fs-6 fw-normal">
          Tanggal Pendaftaran: ${formatTanggal(tanggalSekarang)}<br/>
          Tahun Ajaran: ${TAHUN_AJARAN_SEKARANG}
          <br/>
          Kategori: ${kategoriLabel}
        </p>
      </div>
    `;
  } else if (statusPendaftaranBaru === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    statusHtml = `
   <div class="alert alert-warning mb-2 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-hourglass-split me-2 fs-5"></i>Pendaftaran Menunggu Verifikasi</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Pendaftaran <strong>${namaLengkap}</strong> pada Program Seleksi Mentor dan Mentee Berprestasi tahun ajaran 
          ${TAHUN_AJARAN_SEKARANG} telah berhasil dikirim dan sedang menunggu verifikasi.
        </p>
      </div>
      <div class="bg-white p-3 rounded-4 border border-warning border-1 mb-4">
        <h5 class="fs-5 text-warning mb-2 fw-semibold"><i class="bi bi-clipboard-check me-2 fs-5"></i>Status Pendaftaran: <span class="status-badge warning rounded-4 fw-semibold p-2">Belum Diverifikasi</span></h5>
        <p class="mb-0 fs-6 fw-normal">
          Tanggal Pendaftaran: ${formatTanggal(tanggalSekarang)}
          <br/>
          Tahun Ajaran: ${TAHUN_AJARAN_SEKARANG}
          <br/>
          Kategori: ${kategoriLabel}
        </p>
      </div>
    `;
  } else {
    statusHtml = `<div class="alert alert-danger mb-2 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-x-circle-fill me-2 fs-5"></i>Pendaftaran Ditolak</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Maaf ${namaLengkap}, Pendaftaran Anda pada Program Seleksi Mentor dan Mentee Berprestasi tahun ajaran 
          ${TAHUN_AJARAN_SEKARANG} telah <strong>Ditolak</strong>.
        </p>
      </div>
      <div class="bg-white p-3 rounded-4 border border-danger border-1 mb-4">
        <h5 class="fs-5 text-danger mb-2 fw-semibold"><i class="bi bi-clipboard-check me-2 fs-5"></i>Status Pendaftaran: 
          <span class="status-badge danger rounded-4 fw-semibold p-2">Ditolak</span>
        </h5>
        <p class="mb-0 fs-6 fw-normal">
          Tanggal Pendaftaran: ${formatTanggal(tanggalSekarang)}<br/>
          Tahun Ajaran: ${TAHUN_AJARAN_SEKARANG}
          <br/>
          Kategori: ${kategoriLabel}
        </p>
      </div>`;
  }

  berprestasiData.pendaftaranStatus = {
    status: statusPendaftaranBaru,
    html: statusHtml,
  };

  berprestasiData.kategori = selectedKategori;
  berprestasiData.statusSeleksi = getStatusAndKeterangan(selectedKategori, true).status;
  berprestasiData.statusHasil = berprestasiData.statusSeleksi === STATUS_SELEKSI.LOLOS ? STATUS_HASIL.JUARA_1 : null;

  saveBerprestasiData(berprestasiData);
  // Render ulang semua section
  renderPendaftaran(berprestasiData);
  renderStatusSeleksi(berprestasiData);
  renderPemenang(berprestasiData);
  renderHasil(berprestasiData, user);

  // Sembunyikan form setelah submit berhasil
  document.getElementById("formBerprestasiPendaftaranArea").style.display = "none";
}

// ==================== EVENT LISTENERS ====================

function setupFormListeners() {
  const form = document.getElementById("formBerprestasiPendaftaran");
  const btnBatal = document.getElementById("btnBatalBerprestasi");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = checkAuth();
      let berprestasiData = getBerprestasiData(user.nim);
      if (!berprestasiData) berprestasiData = initializeBerprestasiData(user);
      handlePendaftaranSubmit(berprestasiData, user);
    });
  }

  if (btnBatal) {
    btnBatal.addEventListener("click", () => {
      document.getElementById("formBerprestasiPendaftaranArea").style.display = "none";
      document.getElementById("berprestasiRegistrationButtonArea").style.display = "block";
    });
  }
}

function setupDaftarButton(berprestasiData) {
  const btnDaftar = document.getElementById("btnDaftarBerprestasi");
  if (!btnDaftar) return;

  btnDaftar.addEventListener("click", () => {
    // Tampilkan pilihan kategori
    const formArea = document.getElementById("formBerprestasiPendaftaranArea");
    formArea.innerHTML = `
      <div class="text-center mb-4">
        <h5 class="fs-5 text-black fw-semibold mb-2">Pilih Kategori Pendaftaran</h5>
        <div class="d-grid gap-2 col-md-8 mx-auto">
          <button onclick="pilihKategori('mentor')" class="btn btn-primary fs-6 fw-normal px-3 py-2 rounded-4">
            <i class="bi bi-person-video2 me-2"></i>Daftar sebagai Mentor Berprestasi
          </button>
          <button onclick="pilihKategori('mentee')" class="btn btn-primary fs-6 fw-normal px-3 py-2 rounded-4">
            <i class="bi bi-person-badge me-2"></i>Daftar sebagai Mentee Berprestasi
          </button>
        </div>
      </div>
    `;
    formArea.style.display = "block";
    document.getElementById("berprestasiRegistrationButtonArea").style.display = "none";
  });
}

// Global function untuk pilihan kategori
window.pilihKategori = function (kategori) {
  renderMultiStepForm(kategori);
};

// ==================== INIT FUNCTION ====================

export function initBerprestasi2() {
  const user = checkAuth();
  if (!user) return;

  let berprestasiData = getBerprestasiData(user.nim);
  if (!berprestasiData) {
    berprestasiData = initializeBerprestasiData(user);
    saveBerprestasiData(berprestasiData);
  }

  renderPendaftaran(berprestasiData);
  setupDaftarButton(berprestasiData);
  renderStatusSeleksi(berprestasiData);
  renderPemenang(berprestasiData);
  renderHasil(berprestasiData, user);
}
