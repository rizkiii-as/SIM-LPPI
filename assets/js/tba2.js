// tba.js - Module Pendaftaran TBA (Tes Baca Al-Quran)
// Menggunakan ES6 Module, clean code, dan maintainable

import { checkAuth } from "./auth.js";
import { pengujiData, jadwalData } from "./datatba.js";

// ==================== KONSTANTA & HELPER ====================

const TAHUN_AJARAN_SEKARANG = "2026-2027";

// Nilai-nilai status pendaftaran yang valid
const STATUS_PENDAFTARAN = {
  BELUM_DIVERIFIKASI: "Belum Diverifikasi",
  TERVERIFIKASI: "Terverifikasi",
  DITOLAK: "Ditolak",
};

// Nilai-nilai status pelaksanaan yang valid
const STATUS_PELAKSANAAN = {
  BERJALAN: "Berjalan",
  SELESAI: "Selesai",
};

const STATUS_HASIL = {
  LULUS: "Lulus",
  TIDAK_LULUS: "Tidak Lulus",
};

// Nilai TBA yang valid berdasarkan hasil
const NILAI_LULUS = ["L/A", "L/B"];
const NILAI_TIDAK_LULUS = ["TL/1", "TL/2", "TL/3", "TL/4", "TL/5"];

const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function isEmpty(value) {
  if (typeof value !== "string") {
    return !value;
  }

  const trimmed = value.trim();
  return trimmed === "" || trimmed === "-";
}

// ==================== DATA MANAGEMENT ====================

function getTBAData(nim) {
  const data = sessionStorage.getItem(`tbaData_${nim}`);
  return data ? JSON.parse(data) : null;
}

function saveTBAData(tbaData) {
  sessionStorage.setItem(`tbaData_${tbaData.nim}`, JSON.stringify(tbaData));
}

function initializeTBAData(user) {
  return {
    nim: user.nim,
    nama: user.nama,
    fakultas: user.fakultas || "",
    prodi: user.prodi || "",
    jenisKelamin: user.jenisKelamin || "",
    kontak: user.kontak || "",
    angkatan: user.angkatan || "",
    pendaftaranStatus: null,
    statusPelaksanaan: null,
    statusHasil: null,
    nilai: null,
  };
}

// ==================== RENDER PENDAFTARAN ====================

function renderPendaftaran(tbaData) {
  const statusArea = document.getElementById("tbaRegistrationStatusArea");
  const buttonArea = document.getElementById("tbaRegistrationButtonArea");
  const formArea = document.getElementById("formTBAPendaftaranArea");

  if (!statusArea || !buttonArea || !formArea) return;

  const btnDaftar = document.getElementById("btnDaftarTBA");

  if (tbaData.pendaftaranStatus?.status) {
    statusArea.innerHTML = tbaData.pendaftaranStatus.html;
    formArea.style.display = "none";
    buttonArea.style.display = "block";

    if (btnDaftar) {
      btnDaftar.disabled = true;
      btnDaftar.innerHTML = `Daftar TBA`;
    }
  } else {
    // Belum daftar
    statusArea.innerHTML = `
      <div class="alert alert-info mb-4 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-info-circle-fill me-2 fs-5"></i>Informasi Pendaftaran</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Silakan isi data diri Anda untuk mendaftar pada Program Tes Baca Al Quran 
          tahun ajaran ${TAHUN_AJARAN_SEKARANG}. Pastikan Anda telah menyelesaikan program BIBAQ dan memiliki Memo BIBAQ sebelum mendaftar TBA ulang.
        </p>
      </div>
    `;

    buttonArea.style.display = "block";
    formArea.style.display = "none";

    if (btnDaftar) {
      btnDaftar.disabled = false;
      btnDaftar.innerHTML = `Daftar TBA`;
    }
  }
}

// ==================== RENDER PENGUJI & JADWAL ====================

function renderPengujiJadwal(tbaData, user) {
  const container = document.getElementById("pengujiJadwalContent");
  if (!container) return;
  // BELUM DAFTAR
  if (!tbaData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-calendar-event-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Tes Baca Al-Quran. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  // DAFTAR BELUM VERIFIKASI
  if (tbaData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split text-warning mb-3"></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  // DAFTAR DITOLAK
  if (tbaData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger "></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  const jadwal = jadwalData[0]; // Mengambil jadwal pertama (sesuai data dummy)

  let html = `
  <div class="row">
    <div class="col-md-6 mb-3">
      <div class="penguji-card p-3 rounded-4 ">
        <h5 class="fs-5 text-white fw-semibold mb-2"><i class="bi bi-person-video2 me-2 fs-5"></i>Penguji TBA</h5>
        <p class="mb-1 fs-6 fw-normal text-white">Nama: ${jadwal.penguji.nama}</p>
        <p class="mb-1 fs-6 fw-normal text-white">Fakultas: ${jadwal.penguji.fakultas}</p>
        <p class="mb-1 fs-6 fw-normal text-white">Program Studi: ${jadwal.penguji.prodi}</p>
        <p class="mb-1 fs-6 fw-normal text-white">Kontak: ${jadwal.penguji.kontak}</p>
      </div>
    </div>
    <div class=" col-md-6 mb-3">
      <div class="jadwal-card p-3 rounded-4">
        <h5 class=" fs-5 text-white fw-semibold mb-2"><i class="bi bi-calendar-event me-2 fs-5"></i>Jadwal Tes Baca Al-Quran</h5>
        <p class="mb-1 fs-6 fw-normal text-white">Waktu: ${jadwal.waktu}</p>
        <p class="mb-1 fs-6 fw-normal text-white">Hari/Tanggal: ${jadwal.hari}, ${formatTanggal(jadwal.tanggal)}</p>
        <p class="mb-1 fs-6 fw-normal text-white">Tempat: ${jadwal.tempat}</p>
      </div>
    </div>
  </div>
    

    <!-- Informasi Penting -->
    <div class="alert alert-info rounded-4 p-3 border-0 m-0">
      <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-info-circle-fill me-2 fs-5"></i>Informasi Penting</h5>
      <ul class="fs-6 text-black fw-normal mb-0">
        <li>Harap hadir 15 menit sebelum waktu pelaksanaan</li>
        <li>Bawa KTM (Kartu Tanda Mahasiswa) yang masih berlaku</li>
        <li>Berpakaian rapi dan sopan</li>
        <li>Siapkan mental dan niat untuk mengikuti tes dengan serius</li>
      </ul>
    </div>
  `;

  container.innerHTML = html;
}

// ==================== RENDER HASIL (SERTIFIKAT) ====================

function renderHasilTBA(tbaData, user) {
  const container = document.getElementById("sertifikatTBAContent");
  if (!container) return;

  if (!tbaData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-award-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Tes Baca Al-Quran. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  if (tbaData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning"></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  if (tbaData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger "></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  if (tbaData.statusPelaksanaan === STATUS_PELAKSANAAN.BERJALAN) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4 border border-warning">
        <i class="bi bi-hourglass-split text-warning mb-3"></i>
        <h5 class="fw-semibold text-warning fs-5">Program Tes Baca Al-Quran Sedang Berjalan</h5>
      </div>
    `;
    return;
  }

  if (tbaData.statusHasil === STATUS_HASIL.LULUS) {
    container.innerHTML = `
      <div class="certificate-card d-flex flex-column align-items-center justify-content-center rounded-4 p-5 text-white text-center overflow-hidden">
        <i class="bi bi-award-fill"></i>
        <h4 class="mb-0 fs-4 fw-bold">Sertifikat Kelulusan</h4>
        <p class="mb-0">Program Tes Baca Al-Quran (TBA)</p>
        <p class="mb-2 fs-5 fw-bold">Nilai: ${tbaData.nilai}</p>

        <div class="d-flex gap-2 align-items-center justify-content-center mt-3">
          <button class="btn btn-primary btn-lg fs-5 fw-semibold" onclick="printCertificateTBA('${user.nama}', '${user.nim}')">Cetak Sertifikat</button>
          <button class="btn btn-primary btn-lg fs-5 fw-semibold" onclick="downloadCertificateTBA('${user.nama}', '${user.nim}')">Download Sertifikat</button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4 border border-danger">
        <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
        <p class="m-0 fs-5 fw-semibold text-danger">Tidak Lulus</p>
        <p class="m-0 fs-6 text-muted mt-2">
          Nilai TBA Anda: <strong>${tbaData.nilai}</strong>. 
          Anda dinyatakan belum lulus Program Tes Baca Al-Quran tahun ajaran ${TAHUN_AJARAN_SEKARANG}. 
          Silakan ikuti program BIBAQ untuk mempersiapkan diri mengikuti TBA ulang.
        </p>
      </div>
    `;
  }
}

// Fungsi Cetak Sertifikat
window.printCertificateTBA = function (nama, nim) {
  alert(`Sertifikat untuk ${nama} (${nim}) sedang dicetak`);
};

// Fungsi Download Sertifikat (Simulasi)
window.downloadCertificateTBA = function (nama, nim) {
  alert(`Sertifikat untuk ${nama} (${nim}) sedang diunduh`);
};

// ==================== HANDLE SUBMIT PENDAFTARAN ====================

function handlePendaftaranSubmit(tbaData, user) {
  const namaLengkap = document.getElementById("tba_namaLengkap").value.trim();
  const nimPendaftaran = document.getElementById("tba_nim").value.trim();
  const jenisKelamin = document.getElementById("tba_jenisKelamin").value;
  const fakultas = document.getElementById("tba_fakultas").value.trim();
  const prodi = document.getElementById("tba_prodi").value.trim();
  const angkatan = document.getElementById("tba_angkatan").value.trim();
  const kontak = document.getElementById("tba_kontak").value.trim();

  if (!namaLengkap || !nimPendaftaran || !jenisKelamin || !fakultas || !prodi || !angkatan || !kontak) {
    alert("Mohon lengkapi semua field yang wajib diisi.");
    return;
  }

  const tanggalSekarang = new Date().toISOString().split("T")[0];

  // Update data
  tbaData.nama = namaLengkap;
  tbaData.nim = nimPendaftaran;
  tbaData.jenisKelamin = jenisKelamin;
  tbaData.fakultas = fakultas;
  tbaData.prodi = prodi;
  tbaData.angkatan = angkatan;
  tbaData.kontak = kontak;

  const statusPendaftaranBaru = STATUS_PENDAFTARAN.TERVERIFIKASI;
  let statusHtml = "";

  if (statusPendaftaranBaru === STATUS_PENDAFTARAN.TERVERIFIKASI) {
    statusHtml = `
    <div class="alert alert-success mb-2 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-check-circle-fill me-2 fs-5"></i>Pendaftaran Terverifikasi</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Selamat ${namaLengkap}! Pendaftaran Anda pada Program Tes Baca Al-Quran tahun ajaran 
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
        </p>
      </div>
    `;
  } else if (statusPendaftaranBaru === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    statusHtml = `
   <div class="alert alert-warning mb-2 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-hourglass-split me-2 fs-5"></i>Pendaftaran Menunggu Verifikasi</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Pendaftaran ${namaLengkap} pada Program Tes Baca Al-Quran tahun ajaran
          ${TAHUN_AJARAN_SEKARANG} telah berhasil dikirim dan sedang menunggu verifikasi.
        </p>
      </div>
      <div class="bg-white p-3 rounded-4 border border-warning border-1 mb-4">
        <h5 class="fs-5 text-warning mb-2 fw-semibold"><i class="bi bi-clipboard-check me-2 fs-5"></i>Status Pendaftaran: <span class="status-badge warning rounded-4 fw-semibold p-2">Belum Diverifikasi</span></h5>
        <p class="mb-0 fs-6 fw-normal">
          Tanggal Pendaftaran: ${formatTanggal(tanggalSekarang)}
          <br/>
          Tahun Ajaran: ${TAHUN_AJARAN_SEKARANG}
        </p>
      </div>
    `;
  } else {
    statusHtml = `
    <div class="alert alert-danger mb-2 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-x-circle-fill me-2 fs-5"></i>Pendaftaran Ditolak</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Maaf ${namaLengkap}, Pendaftaran Anda pada Program Tes Baca Al-Quran tahun ajaran 
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
        </p>
      </div>`;
  }

  tbaData.pendaftaranStatus = {
    status: statusPendaftaranBaru,
    html: statusHtml,
  };

  tbaData.statusPelaksanaan = STATUS_PELAKSANAAN.SELESAI;
  tbaData.statusHasil = STATUS_HASIL.LULUS;
  tbaData.nilai = NILAI_LULUS[0];

  saveTBAData(tbaData);

  // Render ulang semua section
  renderPendaftaran(tbaData);
  renderPengujiJadwal(tbaData, user);
  renderHasilTBA(tbaData, user);

  // Scroll ke status
  document.getElementById("tbaRegistrationStatusArea").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ==================== EVENT LISTENERS ====================

function setupPendaftaranListeners(tbaData, user) {
  // Tombol Daftar Sekarang
  const btnDaftar = document.getElementById("btnDaftarTBA");
  if (btnDaftar) {
    btnDaftar.addEventListener("click", () => {
      document.getElementById("formTBAPendaftaranArea").style.display = "block";
      document.getElementById("tbaRegistrationButtonArea").style.display = "none";
    });
  }

  // Tombol Batal
  const btnBatal = document.getElementById("btnBatalTBA");
  if (btnBatal) {
    btnBatal.addEventListener("click", () => {
      document.getElementById("formTBAPendaftaranArea").style.display = "none";
      document.getElementById("tbaRegistrationButtonArea").style.display = "block";
      document.getElementById("formTBAPendaftaran").reset();
    });
  }

  // Form Submit
  const form = document.getElementById("formTBAPendaftaran");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handlePendaftaranSubmit(tbaData, user);
    });
  }
}

// ==================== INIT FUNCTION ====================

export function initTBA2() {
  const user = checkAuth();
  if (!user) return;

  let tbaData = getTBAData(user.nim);

  if (!tbaData) {
    tbaData = initializeTBAData(user);
    saveTBAData(tbaData);
  }

  // Render semua yang diperlukan
  renderPendaftaran(tbaData);
  renderPengujiJadwal(tbaData, user);
  renderHasilTBA(tbaData, user);

  // Setup listeners
  setupPendaftaranListeners(tbaData, user);
}
