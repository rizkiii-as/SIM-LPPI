// bibaq2.js - Module Pendaftaran BIBAQ (Bimbingan Baca Al-Quran)
// Menggunakan ES6 Module, clean code, dan maintainable

import { checkAuth } from "./auth.js";
import { pembimbingData, kelompokData, presensiTemplate } from "./databibaq.js";

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

// Ambang batas kehadiran BIBAQ: wajib 100% hadir untuk lulus
const AMBANG_KELULUSAN_BIBAQ = 100;

const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ==================== HELPER PRESENSI ====================

// Data presensi umum (sama untuk semua user)
function getPresensiData() {
  return [...presensiTemplate]; // Copy array agar tidak mutable
}

function hitungStatistikPresensi(presensiList) {
  let hadir = 0,
    izin = 0,
    alpha = 0,
    belum = 0;

  presensiList.forEach((item) => {
    const status = item.status.toLowerCase();
    if (status === "hadir") hadir++;
    else if (status === "izin") izin++;
    else if (status === "alpha") alpha++;
    else belum++;
  });

  const total = presensiList.length;
  const persentaseKehadiran = total > 0 ? Math.round((hadir / total) * 100) : 0;

  return { hadir, izin, alpha, belum, persentaseKehadiran };
}

function hitungHasilKelulusan(statusPendaftaran, statusPelaksanaan, persentaseKehadiran) {
  if (statusPendaftaran === STATUS_PENDAFTARAN.TERVERIFIKASI && statusPelaksanaan === STATUS_PELAKSANAAN.SELESAI) {
    return persentaseKehadiran >= AMBANG_KELULUSAN_BIBAQ ? STATUS_HASIL.LULUS : STATUS_HASIL.TIDAK_LULUS;
  }

  // Semua kondisi lain (Berjalan / Belum Diverifikasi / Ditolak) → belum ada hasil
  return "-";
}

// ==================== DATA MANAGEMENT ====================

function getBIBAQData(nim) {
  const data = sessionStorage.getItem(`bibaqData_${nim}`);
  return data ? JSON.parse(data) : null;
}

function saveBIBAQData(bibaqData) {
  sessionStorage.setItem(`bibaqData_${bibaqData.nim}`, JSON.stringify(bibaqData));
}

function initializeBIBAQData(user) {
  return {
    nim: user.nim,
    nama: user.nama,
    fakultas: user.fakultas || "",
    prodi: user.prodi || "",
    jenisKelamin: user.jenisKelamin || "",
    kontak: user.kontak || "",
    pendaftaranStatus: null,
    statusPelaksanaan: null,
    statusHasil: null,
    persentaseKehadiran: 0,
  };
}

// ==================== RENDER PENDAFTARAN ====================

function renderPendaftaran(bibaqData) {
  const statusArea = document.getElementById("bibaqRegistrationStatusArea");
  const buttonArea = document.getElementById("bibaqRegistrationButtonArea");
  const formArea = document.getElementById("formBIBAQPendaftaranArea");

  if (!statusArea || !buttonArea || !formArea) return;

  const btnDaftar = document.getElementById("btnDaftarBIBAQ");

  if (bibaqData.pendaftaranStatus?.status) {
    statusArea.innerHTML = bibaqData.pendaftaranStatus.html;
    formArea.style.display = "none";
    buttonArea.style.display = "block";

    if (btnDaftar) {
      btnDaftar.disabled = true;
      btnDaftar.innerHTML = `Daftar BIBAQ`;
    }
  } else {
    statusArea.innerHTML = `
      <div class="alert alert-info mb-4 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-info-circle-fill me-2 fs-5"></i>Informasi Pendaftaran</h5>
        <p class="mb-0 fs-6 fw-normal text-black">
          Silakan isi data diri Anda untuk mendaftar pada Program Bimbingan Baca Al Qur'an 
          tahun ajaran ${TAHUN_AJARAN_SEKARANG}.
        </p>
      </div>
    `;

    buttonArea.style.display = "block";
    formArea.style.display = "none";

    if (btnDaftar) {
      btnDaftar.disabled = false;
      btnDaftar.innerHTML = `Daftar BIBAQ`;
    }
  }
}

// ==================== RENDER PEMBIMBING & KELOMPOK ====================

function renderPembimbingKelompok(bibaqData, user) {
  const container = document.getElementById("pembimbingKelompokContent");
  if (!container) return;

  if (!bibaqData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-people-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Bimbingan Baca Al-Quran. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  if (bibaqData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning "></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  if (bibaqData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger "></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  // Pembimbing (ambil yang pertama sebagai contoh)
  const pembimbing = pembimbingData[0];

  let html = `
    <div class="pembimbing-card p-3 rounded-4 mb-4">
      <h5 class="fs-5 text-white fw-semibold mb-2"><i class="bi bi-person-video2 me-2 fs-5"></i>Pembimbing BIBAQ</h5>
      <p class="mb-1 fs-6 fw-normal text-white">Nama: ${pembimbing.nama}</p>
      <p class="mb-1 fs-6 fw-normal text-white">Fakultas: ${pembimbing.fakultas}</p>
      <p class="mb-1 fs-6 fw-normal text-white">Program Studi: ${pembimbing.prodi}</p>
      <p class="mb-1 fs-6 fw-normal text-white">Kontak: ${pembimbing.kontak}</p>
    </div>

    <div>
    <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-people-fill me-2 fs-5"></i>Anggota Kelompok</h5>
    <div class="table-responsive table-container rounded-4">
      <table class="table table-custom m-0 rounded-4 overflow-hidden">
        <thead class="fs-6 fw-semibold">
          <tr>
            <th>No</th>
            <th>NIM</th>
            <th>Nama Lengkap</th>
            <th>Fakultas</th>
            <th>Program Studi</th>
            <th>Kontak</th>
          </tr>
        </thead>
        <tbody class="fs-6 fw-normal">
  `;

  kelompokData.forEach((anggota, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${anggota.nim}</td>
        <td>${anggota.nama}</td>
        <td>${anggota.fakultas}</td>
        <td>${anggota.prodi}</td>
        <td>${anggota.kontak}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
    </div>
  `;

  container.innerHTML = html;
}

// ==================== RENDER PRESENSI ====================

function renderPresensi(bibaqData) {
  const container = document.getElementById("presensiContent");
  if (!container) return;

  if (!bibaqData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-calendar-check-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Bimbingan Baca Al-Quran. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  // DAFTAR BELUM VERIFIKASI
  if (bibaqData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning"></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  // DAFTAR DITOLAK
  if (bibaqData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  const presensiList = getPresensiData();
  const stats = hitungStatistikPresensi(presensiList);

  let html = `
    <div class="row">
      <div class="col-md-3 col-6 mb-2 p-1">
        <div class="presensi-card p-3 rounded-4 border-start border-2 border-success">
          <h5 class="text-success fs-5 fw-semibold">Hadir</h5>
          <p class="mb-0 fs-4 fs-medium text-success">${stats.hadir}</p>
        </div>
      </div>

      <div class="col-md-3 col-6 mb-2 p-1">
        <div class="presensi-card p-3 rounded-4 border-start border-2 border-warning">
          <h5 class="text-warning fs-5 fw-semibold">Izin</h5>
          <p class="mb-0 fs-4 fs-medium text-warning">${stats.izin}</p>
        </div>
      </div>

      <div class="col-md-3 col-6 mb-2 p-1">
        <div class="presensi-card p-3 rounded-4 border-start border-2 border-danger">
          <h5 class="text-danger fs-5 fw-semibold"><i class="bi bi-x-circle me-2"></i>Alpha</h5>
          <p class="mb-0 fs-4 fs-medium text-danger">${stats.alpha}</p>
        </div>
      </div>

      <div class="col-md-3 col-6 mb-2 p-1">
        <div class="presensi-card p-3 rounded-4 border-start border-2 border-info">
          <h6 class="text-info fs-5 fw-semibold"><i class="bi bi-clock me-2"></i>Belum Dilaksanakan</h6>
          <p class="mb-0 fs-4 fs-medium text-info">${stats.belum}</p>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <h5 class="fs-5 fw-semibold text-black">Persentase Kehadiran</h5>
      <div class="rounded-4 overflow-hidden">
        <div class="progress-bar d-flex align-items-center justify-content-center bg-success fs-6 fw-semibold text-white" role="progressbar" style="width: ${stats.persentaseKehadiran}%" aria-valuenow="${stats.persentaseKehadiran}" aria-valuemin="0" aria-valuemax="100">
          ${stats.persentaseKehadiran}%
        </div>
      </div>
    </div>

    <h5 class="fs-5 text-black fw-semibold mb-2">Rekap Presensi Lengkap</h5>
    <div class="table-responsive table-container rounded-4">
      <table class="table table-custom m-0 rounded-4 overflow-hidden">
        <thead class="fs-6 fw-semibold">
          <tr>
            <th>Pertemuan</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody class="fs-6 fw-normal">
  `;

  presensiList.forEach((presensi) => {
    let statusClass = "";
    if (presensi.status === "Hadir") statusClass = "text-success";
    else if (presensi.status === "Izin") statusClass = "text-warning";
    else if (presensi.status === "Alpha") statusClass = "text-danger";
    else statusClass = "info";

    html += `
      <tr>
        <td>Pertemuan ${presensi.pertemuan}</td>
        <td>${formatTanggal(presensi.tanggal)}</td>
        <td><span class="status-badge ${statusClass}">${presensi.status}</span></td>
        <td>${presensi.keterangan}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

// ==================== RENDER HASIL (MEMO BIBAQ) ====================

function renderHasilBIBAQ(bibaqData, user) {
  const container = document.getElementById("memoBIBAQContent");
  if (!container) return;

  // Tidak dapat diakses jika belum terverifikasi
  if (!bibaqData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-file-earmark-text-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Bimbingan Baca Al-Quran. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  // DAFTAR BELUM VERIFIKASI
  if (bibaqData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning"></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  // DAFTAR DITOLAK
  if (bibaqData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  // Program masih berjalan — hasil belum tersedia
  if (bibaqData.statusPelaksanaan === STATUS_PELAKSANAAN.BERJALAN) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4 border border-warning">
        <i class="bi bi-hourglass-split text-warning mb-3"></i>
        <h5 class="fw-semibold text-warning fs-5">Program Mentoring Sedang Berjalan</h5>
      </div>
    `;
    return;
  }

  // Program selesai — hitung kelulusan berdasarkan presensi (wajib 100% hadir)
  if (bibaqData.statusHasil === STATUS_HASIL.LULUS) {
    // Peserta lulus — tampilkan memo BIBAQ
    container.innerHTML = `
      <div class="memo-card d-flex flex-column align-items-center justify-content-center rounded-4 p-5 mb-4 text-white text-center overflow-hidden">
        <i class="bi bi-file-earmark-text-fill"></i>
        <h4 class="mb-0 fs-4 fw-bold">Memo Bimbingan Baca Al-Quran (BIBAQ)</h4>
        <p class="mb-2">Sebagai persyaratan dalam proses pendaftaran Tes Baca Al Quran bagi mahasiswa yang mengulang</p>
        
        <div class="d-flex gap-2 align-items-center justify-content-center mt-3">
          <button class="btn btn-primary btn-lg fs-5 fw-semibold" onclick="printMemoBIBAQ('${user.nama}', '${user.nim}')">Cetak Memo</button>
          <button class="btn btn-primary btn-lg fs-5 fw-semibold" onclick="downloadMemoBIBAQ('${user.nama}', '${user.nim}')">Download Memo</button>
        </div>
      </div>
      <div class="alert alert-info m-0 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-info-circle-fill me-2 fs-5"></i>Langkah Selanjutnya</h5>
        <p class="mb-0 fs-6 text-black">Memo BIBAQ digunakan sebagai persyaratan dalam proses pendaftaran Tes Baca Al Quran bagi mahasiswa yang mengulang. Dokumen tersebut wajib diunggah pada saat pendaftaran TBA.</p>
      </div>
    `;
  } else {
    // Peserta tidak lulus — kehadiran kurang dari 100%
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4 border border-danger">
        <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
        <p class="m-0 fs-5 fw-semibold text-danger">Tidak Lulus</p>
        <p class="m-0 fs-6 text-muted mt-2">
          Tingkat kehadiran Anda (${bibaqData.persentaseKehadiran}%) belum memenuhi syarat minimal 
          ${AMBANG_KELULUSAN_BIBAQ}%. Anda wajib mengikuti kembali program BIBAQ untuk dapat 
          mendapatkan Memo BIBAQ.
        </p>
      </div>
    `;
  }
}

// Fungsi Cetak Memo
window.printMemoBIBAQ = function (nama, nim) {
  alert(`Memo BIBAQ untuk ${nama} (${nim}) sedang dicetak`);
};

// Fungsi Download Memo (Simulasi)
window.downloadMemoBIBAQ = function (nama, nim) {
  alert(`Memo BIBAQ untuk ${nama} (${nim}) sedang diunduh`);
};

// ==================== HANDLE SUBMIT PENDAFTARAN ====================

function handlePendaftaranSubmit(bibaqData, user) {
  const namaLengkap = document.getElementById("bibaq_namaLengkap").value.trim();
  const nimPendaftaran = document.getElementById("bibaq_nim").value.trim();
  const jenisKelamin = document.getElementById("bibaq_jenisKelamin").value;
  const fakultas = document.getElementById("bibaq_fakultas").value.trim();
  const prodi = document.getElementById("bibaq_prodi").value.trim();
  const kontak = document.getElementById("bibaq_kontak").value.trim();

  // Validasi pernyataan
  const pernyataanYa = document.getElementById("bibaq_pernyataan_ya").checked;

  if (!namaLengkap || !nimPendaftaran || !jenisKelamin || !fakultas || !prodi || !kontak || !pernyataanYa) {
    alert("Mohon lengkapi semua field yang wajib diisi dan setujui pernyataan.");
    return;
  }

  const tanggalSekarang = new Date().toISOString().split("T")[0];

  // Update data
  bibaqData.nama = namaLengkap;
  bibaqData.nim = nimPendaftaran;
  bibaqData.jenisKelamin = jenisKelamin;
  bibaqData.fakultas = fakultas;
  bibaqData.prodi = prodi;
  bibaqData.kontak = kontak;

  const statusPendaftaranBaru = STATUS_PENDAFTARAN.TERVERIFIKASI;
  let statusHtml = "";

  if (statusPendaftaranBaru === STATUS_PENDAFTARAN.TERVERIFIKASI) {
    statusHtml = `
    <div class="alert alert-success mb-2 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-check-circle-fill me-2 fs-5"></i>Pendaftaran Terverifikasi</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Selamat ${namaLengkap}! Pendaftaran Anda pada Program Bimbingan Baca Al-Quran tahun ajaran 
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
          Pendaftaran Anda pada Program Bimbingan Baca Al-Quran tahun ajaran
          <strong>${TAHUN_AJARAN_SEKARANG}</strong> telah berhasil dikirim dan sedang menunggu verifikasi.
        </p>
      </div>
      <div class="bg-white p-3 rounded-4 border border-warning border-1 mb-4">
        <h5 class="fs-5 text-warning mb-2 fw-semibold"><i class="bi bi-clipboard-check me-2 fs-5"></i>Status Pendaftaran: <span class="status-badge warning rounded-4 fw-semibold p-2">Belum Diverifikasi</span></h5>
        <p class="mb-0 fs-6 fw-normal">
          Tanggal Pendaftaran: ${formatTanggal(tanggalSekarang)}<br/>
          Tahun Ajaran: ${TAHUN_AJARAN_SEKARANG}
        </p>
      </div>
    `;
  } else {
    statusHtml = `
    <div class="alert alert-danger mb-2 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-x-circle-fill me-2 fs-5"></i>Pendaftaran Ditolak</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Maaf ${namaLengkap}, Pendaftaran Anda pada Program Bimbingan Baca Al-Quran tahun ajaran 
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

  bibaqData.pendaftaranStatus = {
    status: statusPendaftaranBaru,
    html: statusHtml,
  };

  const stats = hitungStatistikPresensi(getPresensiData());
  bibaqData.statusPelaksanaan = STATUS_PELAKSANAAN.SELESAI;
  bibaqData.statusHasil = hitungHasilKelulusan(statusPendaftaranBaru, bibaqData.statusPelaksanaan, stats.persentaseKehadiran);
  bibaqData.persentaseKehadiran = stats.persentaseKehadiran;

  saveBIBAQData(bibaqData);

  // Render ulang semua section
  renderPendaftaran(bibaqData);
  renderPembimbingKelompok(bibaqData, user);
  renderPresensi(bibaqData);
  renderHasilBIBAQ(bibaqData, user);

  // Scroll ke status
  document.getElementById("bibaqRegistrationStatusArea").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ==================== EVENT LISTENERS ====================

function setupPendaftaranListeners(bibaqData, user) {
  const btnDaftar = document.getElementById("btnDaftarBIBAQ");
  if (btnDaftar) {
    btnDaftar.addEventListener("click", () => {
      document.getElementById("formBIBAQPendaftaranArea").style.display = "block";
      document.getElementById("bibaqRegistrationButtonArea").style.display = "none";
    });
  }

  const btnBatal = document.getElementById("btnBatalBIBAQ");
  if (btnBatal) {
    btnBatal.addEventListener("click", () => {
      document.getElementById("formBIBAQPendaftaranArea").style.display = "none";
      document.getElementById("bibaqRegistrationButtonArea").style.display = "block";
      document.getElementById("formBIBAQPendaftaran").reset();
    });
  }

  const form = document.getElementById("formBIBAQPendaftaran");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handlePendaftaranSubmit(bibaqData, user);
    });
  }
}

// ==================== INIT FUNCTION ====================

export function initBIBAQ2() {
  const user = checkAuth();
  if (!user) return;

  let bibaqData = getBIBAQData(user.nim);

  if (!bibaqData) {
    bibaqData = initializeBIBAQData(user);
    saveBIBAQData(bibaqData);
  }

  renderPendaftaran(bibaqData);
  renderPembimbingKelompok(bibaqData, user);
  renderPresensi(bibaqData);
  renderHasilBIBAQ(bibaqData, user);

  setupPendaftaranListeners(bibaqData, user);
}
