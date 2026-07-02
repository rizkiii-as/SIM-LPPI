// mentor2.js - Module Pendaftaran Mentor
// Menggunakan ES6 Module, clean code, dan maintainable

import { checkAuth } from "./auth.js";
import { tahapanSeleksi, jadwalTOM, kelompokMenteeData } from "./datamentor.js";

// ==================== KONSTANTA & HELPER ====================

const TAHUN_AJARAN_SEKARANG = "2026-2027";
const MAX_SESI = 2;

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

// Nilai-nilai status pelaksanaan yang valid
const STATUS_PELAKSANAAN = {
  BERJALAN: "Berjalan",
  SELESAI: "Selesai",
};

const STATUS_PRESENSI = ["Hadir", "Izin", "Alpha"];

const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const escapeHtml = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// ==================== DATA MANAGEMENT ====================

function getMentorData(nim) {
  const data = sessionStorage.getItem(`mentorData_${nim}`);
  return data ? JSON.parse(data) : null;
}

function saveMentorData(mentorData) {
  sessionStorage.setItem(`mentorData_${mentorData.nim}`, JSON.stringify(mentorData));
}

function initializeMentorData(user) {
  return {
    nim: user.nim,
    nama: user.nama,
    fakultas: user.fakultas || "",
    prodi: user.prodi || "",
    jenisKelamin: user.jenisKelamin || "",
    kontak: user.kontak || "",
    pendaftaranStatus: null,
    statusPendaftaran: null,
    statusSeleksi: null,
    sesiMentoring: [],
  };
}

function getSesiList(mentorData) {
  return mentorData.sesiMentoring || [];
}

function getSesiById(mentorData, sesiId) {
  return getSesiList(mentorData).find((s) => s.id === sesiId) || null;
}

function createSesi(judul, tanggal, deskripsi) {
  return {
    id: generateId(),
    judul,
    tanggal,
    deskripsi,
    materi: [],
    tugas: [],
    presensi: kelompokMenteeData.map((m) => ({
      menteeId: m.id,
      nim: m.nim,
      nama: m.nama,
      status: "Hadir",
    })),
    feedback: [],
    createdAt: new Date().toISOString(),
  };
}

function createKonten(tipe, data) {
  return { id: generateId(), tipe, data, createdAt: new Date().toISOString() };
}

function getTahapanWithDynamicKeterangan(mentorData) {
  const isLolos = mentorData?.statusSeleksi === STATUS_SELEKSI.LOLOS;

  return tahapanSeleksi.map((tahap) => ({
    ...tahap,
    status: mentorData?.statusSeleksi || STATUS_SELEKSI.LOLOS,
    keterangan: isLolos ? "Selamat! Anda lolos ke tahap berikutnya" : "Anda tidak lolos ke tahap berikutnya",
  }));
}

// ==================== RENDER PENDAFTARAN ====================

function renderPendaftaran(mentorData) {
  const statusArea = document.getElementById("mentorRegistrationStatusArea");
  const buttonArea = document.getElementById("mentorRegistrationButtonArea");
  const formArea = document.getElementById("formMentorPendaftaranArea");

  if (!statusArea || !buttonArea || !formArea) return;

  const btnDaftar = document.getElementById("btnDaftarMentor");

  if (mentorData.pendaftaranStatus?.status) {
    statusArea.innerHTML = mentorData.pendaftaranStatus.html;
    formArea.style.display = "none";
    buttonArea.style.display = "block";

    if (btnDaftar) {
      btnDaftar.disabled = true;
      btnDaftar.innerHTML = `Daftar Mentor`;
    }
  } else {
    statusArea.innerHTML = `
      <div class="alert alert-info mb-4 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-info-circle-fill me-2 fs-5"></i>Informasi Pendaftaran</h5>
        <p class="mb-0 fs-6 fw-normal text-black">
          Silakan isi data diri Anda untuk mendaftar pada Program Mentor 
          tahun ajaran ${TAHUN_AJARAN_SEKARANG}.
        </p>
      </div>
    `;

    buttonArea.style.display = "block";
    formArea.style.display = "none";

    if (btnDaftar) {
      btnDaftar.disabled = false;
      btnDaftar.innerHTML = `Daftar Mentor`;
    }
  }
}

// ==================== RENDER STATUS SELEKSI ====================

function renderStatusSeleksi(mentorData) {
  const container = document.getElementById("statusSeleksiContent");
  if (!container) return;

  //KONDISI KETIKA BELUM MELAKUKAN PENDAFTARAN
  if (!mentorData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-clipboard-check-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Mentor. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  //KONDISI KETIKA STATUS PENDAFTARAN BELUM DIVERIFIKASI
  if (mentorData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning"></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  //KONDISI KETIKA STATUS PENDAFTARAN DITOLAK
  if (mentorData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  const isLolos = mentorData.statusSeleksi === STATUS_SELEKSI.LOLOS;
  const tahapanWithContent = getTahapanWithDynamicKeterangan(mentorData);

  let html = `
    <div class="timeline-seleksi ps-4 mb-4">
  `;

  tahapanWithContent.forEach((tahap) => {
    const statusClass = isLolos ? "completed" : "failed";

    html += `
      <div class="timeline-item rounded-4 mb-3 ${statusClass}">
        <div class="timeline-content p-3 rounded-4 bg-white ${statusClass}">
          <h5 class="fs-5 text-black fw-semibold mb-2">${tahap.tahap}</h5>
          <p class="text-black fs-6"><strong>Status:</strong> <span class="status-badge rounded-4 p-1 ${isLolos ? "success" : "danger"}">${tahap.status}</span></p>
          <p class="text-black fs-6 m-0"><i class="bi bi-calendar-event me-2"></i><strong>Tanggal:</strong> ${tahap.tanggal}</p>
          ${tahap.waktu ? `<p class="text-black fs-6 m-0"><i class="bi bi-clock me-2"></i><strong>Waktu:</strong> ${tahap.waktu}</p>` : ""}
          ${tahap.tempat ? `<p class="text-black fs-6 m-0"><i class="bi bi-geo-alt me-2"></i><strong>Tempat:</strong> ${tahap.tempat}</p>` : ""}
          <p class="fs-6 m-0 fw-semibold ${isLolos ? "text-success" : "text-danger"}">${tahap.keterangan || ""}</p>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  // Jadwal TOM (di bawah tahapan seleksi)
  if (isLolos) {
    const tom = jadwalTOM[0];
    html += `
  <div>
  <h4 class="fs-4 mb-4 text-black fw-bold"><i class="bi bi-calendar-event-fill text-black me-2 fs-4"></i>Jadwal Training of Mentor (TOM)</h4>
    <div class="jadwal-card text-white p-3 rounded-4 mb-3">
        <div class="mb-1 fs-6 fw-normal text-white"><i class="bi bi-clock me-2 fs-6"></i><span><strong>Hari:</strong> ${tom.hari}</span></div>
        <div class="mb-1 fs-6 fw-normal text-white"><i class="bi bi-calendar me-2 fs-6"></i><span><strong>Tanggal:</strong> ${tom.tanggal}</span></div>
        <div class="mb-1 fs-6 fw-normal text-white"><i class="bi bi-clock me-2 fs-6"></i><span><strong>Waktu:</strong> ${tom.waktu}</span></div>
        <div class="fs-6 fw-normal text-white"><i class="bi bi-geo-alt me-2 fs-6"></i><span><strong>Lokasi:</strong> ${tom.lokasi}</span></div>
    </div>  
    <div class="alert alert-info rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-info-circle-fill me-2 fs-5"></i>Persiapan TOM</h5>
        <ul class="fs-6 text-black fw-normal mb-0">
  `;

    tom.persiapan.forEach((item) => {
      html += `<li>${item}</li>`;
    });

    html += `</ul></div></div>`;
  }

  container.innerHTML = html;
}

// ==================== RENDER KELOMPOK MENTEE ====================

function renderKelompokMentee(mentorData) {
  const container = document.getElementById("kelompokMenteeContent");
  if (!container) return;

  // KONDISI KETIKA BELUM MELAKUKAN PENDAFTARAN
  if (!mentorData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-people-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Mentor. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  if (mentorData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning"></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  if (mentorData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  if (mentorData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.TERVERIFIKASI && mentorData.statusSeleksi === STATUS_SELEKSI.TIDAK_LOLOS) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4 border border-danger">
        <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
        <p class="m-0 fs-5 fw-semibold text-danger">Tidak Lolos</p>
        <p class="m-0 fs-6 text-muted mt-2">
          Anda dinyatakan tidak lolos pada Program Seleksi Mentor
          tahun ajaran ${TAHUN_AJARAN_SEKARANG}.
        </p>
      </div>
    `;
    return;
  }

  let html = `

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

  kelompokMenteeData.forEach((mentee, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${mentee.nim}</td>
        <td>${mentee.nama}</td>
        <td>${mentee.fakultas}</td>
        <td>${mentee.prodi}</td>
        <td>${mentee.kontak}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

// ==================== RENDER SERTIFIKAT MENTOR ====================

function renderSertifikatMentor(mentorData, user) {
  const container = document.getElementById("sertifikatMentorContent");
  if (!container) return;

  // KONDISI KETIKA BELUM MELAKUKAN PENDAFTARAN
  if (!mentorData.pendaftaranStatus) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-award-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Mentoring. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  //KONDISI KETIKA STATUS PENDAFTARAN BELUM DIVERIFIKASI
  if (mentorData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning"></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  //KONDISI KETIKA STATUS PENDAFTARAN DITOLAK
  if (mentorData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  // KONDISI KETIKA STATUS SELEKSI TIDAK LOLOS
  if (mentorData.statusSeleksi === STATUS_SELEKSI.TIDAK_LOLOS) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4 border border-danger">
        <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
        <p class="m-0 fs-5 fw-semibold text-danger">Tidak Lolos</p>
        <p class="m-0 fs-6 text-muted mt-2">
          Anda dinyatakan tidak lolos pada Program Seleksi Mentor
          tahun ajaran ${TAHUN_AJARAN_SEKARANG}.
        </p>
      </div>
    `;
    return;
  }

  const jumlahSesi = mentorData.sesiMentoring?.length || 0;

  // KONDISI JIKA SESI MENTORING BELUM MENCAPAI MAKSIMAL
  if (jumlahSesi < MAX_SESI) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-hourglass-split mb-3"></i>
        <p class="m-0 fs-5 fw-semibold">Sertifikat Belum Tersedia</p>
        <p class="m-0 fs-6 text-muted mt-2">
          Selesaikan seluruh <strong>${MAX_SESI} sesi mentoring</strong> untuk mendapatkan sertifikat. 
          Progress saat ini: <strong>${jumlahSesi}/${MAX_SESI}</strong> sesi.
        </p>
      </div>
    `;
    return;
  }

  // Seluruh sesi selesai — tampilkan sertifikat
  container.innerHTML = `
    <div class="certificate-card d-flex flex-column align-items-center justify-content-center rounded-4 p-5 text-white text-center overflow-hidden">
      <i class="bi bi-award-fill"></i>
      <h4 class="mb-0 fs-4 fw-bold">Sertifikat Mentor</h4>
      <p class="mb-2">Program Mentoring Kemuhammadiyahan</p>

      <div class="d-flex gap-2 align-items-center justify-content-center mt-3">
        <button class="btn btn-primary btn-lg fs-5 fw-semibold" onclick="printCertificateMentor('${user.nama}', '${user.nim}')">Cetak Sertifikat</button>
        <button class="btn btn-primary btn-lg fs-5 fw-semibold" onclick="downloadCertificateMentor('${user.nama}', '${user.nim}')">Download Sertifikat</button>
      </div>
    </div>
  `;
}

// Fungsi Cetak Sertifikat
window.printCertificateMentor = function (nama, nim) {
  alert(`Sertifikat Mentor untuk ${nama} (${nim}) sedang dicetak)`);
};

// Fungsi Download Sertifikat (Simulasi)
window.downloadCertificateMentor = function (nama, nim) {
  alert(`Sertifikat Mentor untuk ${nama} (${nim}) sedang diunduh)`);
};

// ==================== HANDLE SUBMIT PENDAFTARAN ====================

function handlePendaftaranSubmit(mentorData, user) {
  const namaLengkap = document.getElementById("mentor_namaLengkap").value.trim();
  const nimPendaftaran = document.getElementById("mentor_nim").value.trim();
  const jenisKelamin = document.getElementById("mentor_jenisKelamin").value;
  const fakultas = document.getElementById("mentor_fakultas").value.trim();
  const prodi = document.getElementById("mentor_prodi").value.trim();
  const kontak = document.getElementById("mentor_kontak").value.trim();

  if (!namaLengkap || !nimPendaftaran || !jenisKelamin || !fakultas || !prodi || !kontak) {
    alert("Mohon lengkapi semua field yang wajib diisi.");
    return;
  }

  const tanggalSekarang = new Date().toISOString().split("T")[0];

  // Update data
  mentorData.nama = namaLengkap;
  mentorData.nim = nimPendaftaran;
  mentorData.jenisKelamin = jenisKelamin;
  mentorData.fakultas = fakultas;
  mentorData.prodi = prodi;
  mentorData.kontak = kontak;

  const statusPendaftaranBaru = STATUS_PENDAFTARAN.TERVERIFIKASI;
  let statusHtml = "";

  if (statusPendaftaranBaru === STATUS_PENDAFTARAN.TERVERIFIKASI) {
    statusHtml = `
    <div class="alert alert-success mb-2 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-check-circle-fill me-2 fs-5"></i>Pendaftaran Terverifikasi</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Selamat ${namaLengkap}! Pendaftaran Anda pada Program Mentor tahun ajaran 
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
        <p class="mb-0 fs-6 fw-normal text-black">
          Pendaftaran <strong>${namaLengkap}</strong> pada Program Mentor tahun ajaran
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
          Maaf ${namaLengkap}, Pendaftaran Anda pada Program Mentor tahun ajaran 
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

  mentorData.pendaftaranStatus = {
    status: statusPendaftaranBaru,
    html: statusHtml,
  };

  mentorData.statusSeleksi = STATUS_SELEKSI.LOLOS;

  saveMentorData(mentorData);

  // Render ulang semua section
  renderPendaftaran(mentorData);
  renderStatusSeleksi(mentorData);
  renderKelompokMentee(mentorData);
  renderSertifikatMentor(mentorData, user);
  renderSesiMentoring(mentorData, user);

  // Scroll ke status
  document.getElementById("mentorRegistrationStatusArea").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ==================== EVENT LISTENERS ====================

function setupPendaftaranListeners(mentorData, user) {
  const btnDaftar = document.getElementById("btnDaftarMentor");
  if (btnDaftar) {
    btnDaftar.addEventListener("click", () => {
      document.getElementById("formMentorPendaftaranArea").style.display = "block";
      document.getElementById("mentorRegistrationButtonArea").style.display = "none";
    });
  }

  const btnBatal = document.getElementById("btnBatalMentor");
  if (btnBatal) {
    btnBatal.addEventListener("click", () => {
      document.getElementById("formMentorPendaftaranArea").style.display = "none";
      document.getElementById("mentorRegistrationButtonArea").style.display = "block";
      document.getElementById("formMentorPendaftaran").reset();
    });
  }

  const form = document.getElementById("formMentorPendaftaran");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handlePendaftaranSubmit(mentorData, user);
    });
  }
}

// ====================================================================================
// SESI MENTORING
// FIX UTAMA: Modal di-mount SEKALI ke <body> saat init, tidak pernah dihapus/dibuat ulang.
// renderSesiMentoring() hanya mengupdate #daftarSesiContainer & elemen header —
// TIDAK menyentuh modal sama sekali sehingga backdrop Bootstrap tidak pernah yatim.
// ====================================================================================

// Menyimpan AbortController aktif untuk cleanup listener modal sebelum dibuka ulang
let _modalListenerController = null;

/**
 * Mount modal ke <body> SEKALI SAJA saat inisialisasi.
 * Setelah ini modal selalu ada di DOM; hanya kontennya yang diganti saat dibuka.
 */
function mountModalDetailSesi() {
  if (document.getElementById("modalDetailSesi")) return; // sudah ada, skip

  const modalEl = document.createElement("div");
  modalEl.className = "modal fade";
  modalEl.id = "modalDetailSesi";
  modalEl.tabIndex = -1;
  modalEl.setAttribute("aria-labelledby", "modalDetailSesiLabel");
  modalEl.setAttribute("aria-hidden", "true");
  modalEl.innerHTML = `
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title" id="modalDetailSesiLabel">
            <i class="bi bi-journal-bookmark-fill me-2"></i>Detail Sesi Mentoring
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Tutup"></button>
        </div>
        <div class="modal-body" id="modalDetailSesiBody"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);

  // Bersihkan backdrop yang mungkin tersisa saat modal ditutup dengan cara apapun
  modalEl.addEventListener("hidden.bs.modal", () => {
    cleanupModalBackdrop();
  });
}

/**
 * Paksa bersihkan backdrop Bootstrap yang mungkin tertinggal di DOM.
 * Ini safety net — tidak seharusnya diperlukan jika modal di-mount sekali,
 * tapi melindungi dari edge case (mis. user menekan ESC, klik di luar modal, dll).
 */
function cleanupModalBackdrop() {
  // Hapus semua backdrop yang tertinggal
  document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
  // Pulihkan scroll body
  document.body.classList.remove("modal-open");
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("padding-right");
}

// ==================== SESI MENTORING - RENDER UTAMA ====================

/**
 * renderSesiMentoring: hanya mengupdate area di luar modal.
 * TIDAK membuat/menghapus modal — modal sudah ada di <body> via mountModalDetailSesi().
 */
function renderSesiMentoring(mentorData, user) {
  const container = document.getElementById("sesiMentoringContent");
  if (!container) return;

  if (!mentorData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-journal-text mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Mentor. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  //KONDISI KETIKA STATUS PENDAFTARAN BELUM DIVERIFIKASI
  if (mentorData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning fs-1 d-block animate-pulse"></i>
      <h5 class="fw-semibold text-warning">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  //KONDISI KETIKA STATUS PENDAFTARAN DITOLAK
  if (mentorData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger fs-1 d-block"></i>
      <h5 class="fw-semibold text-danger">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  //KONDISI KETIKA STATUS SELEKSI TIDAK LOLOS
  if (mentorData.statusSeleksi === STATUS_SELEKSI.TIDAK_LOLOS) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4 border border-danger">
        <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
        <p class="m-0 fs-5 fw-semibold text-danger">Tidak Lolos</p>
        <p class="m-0 fs-6 text-muted mt-2">
          Anda dinyatakan tidak lolos pada Program Seleksi Mentor
          tahun ajaran ${TAHUN_AJARAN_SEKARANG}.
        </p>
      </div>
    `;
    return;
  }

  const sesiList = getSesiList(mentorData);
  const jumlahSesi = sesiList.length;
  const sisaSesi = MAX_SESI - jumlahSesi;
  const sudahMaksimal = jumlahSesi >= MAX_SESI;

  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <p class="text-black small" id="sesiCounterText">
          Tahun Ajaran ${TAHUN_AJARAN_SEKARANG} &mdash;
          <strong>${jumlahSesi}</strong> / ${MAX_SESI} Sesi
          ${!sudahMaksimal ? `<span class="text-success">(Sisa ${sisaSesi} sesi)</span>` : `<span class="text-danger">(Batas maksimum tercapai)</span>`}
        </p>
      </div>
      <button
        id="btnTambahSesi"
        class="btn btn-primary"
        ${sudahMaksimal ? "disabled" : ""}
        title="${sudahMaksimal ? "Batas maksimum 2 sesi telah tercapai" : "Tambah sesi baru"}"
      >
        <i class="bi bi-plus-circle me-2"></i>Tambah Sesi
      </button>
    </div>
 
    
 
    <div class="sm-progress-wrap mb-4 px-3 py-2 rounded-4">
      <div class="d-flex justify-content-between small text-black">
        <span>Progress Sesi</span>
        <span id="sesiProgressText">${jumlahSesi} / ${MAX_SESI}</span>
      </div>
      <div class="progress rounded-4">
        <div
          class="progress-bar ${jumlahSesi >= MAX_SESI ? "bg-danger" : jumlahSesi > 30 ? "bg-warning" : "bg-success"}"
          role="progressbar"
          style="width: ${(jumlahSesi / MAX_SESI) * 100}%"
          aria-valuenow="${jumlahSesi}"
          aria-valuemin="0"
          aria-valuemax="${MAX_SESI}"
        ></div>
      </div>
    </div>
 
    <div id="formSesiWrap" class="sm-form-panel mb-4 rounded-4" style="display:none;"></div>
 
    <div id="daftarSesiContainer">
      ${renderDaftarSesiHTML(sesiList)}
    </div>
  `;

  setupSesiListeners(mentorData, user);
}

/**
 * Partial-refresh: hanya update bagian dalam #sesiMentoringContent yang bisa di-refresh
 * tanpa mempengaruhi modal. Dipanggil dari dalam konteks modal.
 */
function refreshDaftarSesi(mentorData) {
  const container = document.getElementById("daftarSesiContainer");
  if (!container) return;

  const sesiList = getSesiList(mentorData);
  const jumlahSesi = sesiList.length;
  const sisaSesi = MAX_SESI - jumlahSesi;
  const sudahMaksimal = jumlahSesi >= MAX_SESI;

  // 1. Refresh tabel daftar sesi
  container.innerHTML = renderDaftarSesiHTML(sesiList);

  // 2. Update teks header "X / 48 Sesi (Sisa Y sesi)"
  const counterText = document.getElementById("sesiCounterText");
  if (counterText) {
    counterText.innerHTML = `
      Tahun Ajaran ${TAHUN_AJARAN_SEKARANG} &mdash;
      <strong>${jumlahSesi}</strong> / ${MAX_SESI} Sesi
      ${!sudahMaksimal ? `<span class="text-success">(Sisa ${sisaSesi} sesi)</span>` : `<span class="text-danger">(Batas maksimum tercapai)</span>`}
    `;
  }

  // 3. Update teks progress bar label "X / 48"
  const progressText = document.getElementById("sesiProgressText");
  if (progressText) progressText.textContent = `${jumlahSesi} / ${MAX_SESI}`;

  // 4. Update progress bar fill & warna
  const progressBar = document.querySelector("#sesiMentoringContent .sm-progress-wrap .progress-bar");
  if (progressBar) {
    progressBar.style.width = `${(jumlahSesi / MAX_SESI) * 100}%`;
    progressBar.setAttribute("aria-valuenow", jumlahSesi);
    progressBar.className = `progress-bar ${sudahMaksimal ? "bg-danger" : jumlahSesi > 30 ? "bg-warning" : "bg-success"}`;
  }

  // 5. Update tombol Tambah Sesi
  const btnTambah = document.getElementById("btnTambahSesi");
  if (btnTambah) {
    btnTambah.disabled = sudahMaksimal;
    btnTambah.title = sudahMaksimal ? "Batas maksimum 2 sesi telah tercapai" : "Tambah sesi baru";
  }

  // 6. Tampilkan/sembunyikan alert batas maksimum (jika elemen ada)
  const alertMaksimal = document.getElementById("alertMaksimalSesi");
  if (alertMaksimal) alertMaksimal.style.display = sudahMaksimal ? "" : "none";

  const user = checkAuth();
  if (user) renderSertifikatMentor(mentorData, user);
}

// ==================== SESI MENTORING - RENDER DAFTAR SESI ====================

function renderDaftarSesiHTML(sesiList) {
  if (sesiList.length === 0) {
    return `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-journal-plus mb-3"></i>
        <p class="m-0 fs-6">Belum ada sesi mentoring. Klik <strong>Tambah Sesi</strong> untuk memulai.</p>
      </div>
    `;
  }

  const rows = sesiList
    .map(
      (sesi, idx) => `
    <tr>
      <td class="text-center fw-bold">${idx + 1}</td>
      <td>${escapeHtml(sesi.judul)}</td>
      <td>${formatTanggal(sesi.tanggal)}</td>
      <td class="text-center">
        <span class="badge bg-info text-dark">${sesi.materi.length} Materi</span>
      </td>
      <td class="text-center">
        <span class="badge bg-warning text-dark">${sesi.tugas.length} Tugas</span>
      </td>
      <td class="text-center">
        <span class="badge ${getPresensiSummaryClass(sesi)}">${getPresensiSummary(sesi)}</span>
      </td>
      <td class="text-center">
        <div class="d-flex gap-1 justify-content-center flex-wrap">
          <button class="btn btn-sm btn-outline-primary btn-detail-sesi" data-sesi-id="${sesi.id}" title="Detail Sesi">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-warning btn-edit-sesi" data-sesi-id="${sesi.id}" title="Edit Sesi">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-hapus-sesi" data-sesi-id="${sesi.id}" title="Hapus Sesi">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");

  return `
    <div class="table-responsive">
      <table class="table table-custom-mentor align-middle">
        <thead>
          <tr>
            <th class="text-center">No</th>
            <th class="text-center">Judul Sesi</th>
            <th class="text-center">Tanggal</th>
            <th class="text-center">Materi</th>
            <th class="text-center">Tugas</th>
            <th class="text-center">Presensi</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function getPresensiSummary(sesi) {
  const hadir = sesi.presensi.filter((p) => p.status === "Hadir").length;
  return `${hadir}/${sesi.presensi.length} Hadir`;
}

function getPresensiSummaryClass(sesi) {
  const hadir = sesi.presensi.filter((p) => p.status === "Hadir").length;
  const total = sesi.presensi.length;
  if (hadir === total) return "bg-success text-white";
  if (hadir >= total / 2) return "bg-warning text-dark";
  return "bg-danger text-white";
}

// ==================== SESI MENTORING - FORM TAMBAH / EDIT ====================

function renderFormSesi(sesi = null) {
  const isEdit = sesi !== null;
  return `
    <div class="p-3">
      <h5 class="mb-2 fs-5 fw-semibold">
        <i class="bi bi-${isEdit ? "pencil-square" : "plus-circle"} me-2 text black"></i>
        ${isEdit ? "Edit Sesi Mentoring" : "Tambah Sesi Mentoring"}
      </h5>
      <form id="formSesiMentoring" novalidate>
        <input type="hidden" id="sesiEditId" value="${isEdit ? sesi.id : ""}">
        <div class="row g-3">
          <div class="col-md-6">
            <label for="sesi_judul" class="form-label fs-6 fw-medium">Judul Sesi <span class="text-danger fs-6 fw-medium">*</span></label>
            <input
              type="text"
              class="form-control rounded-4 py-2 px-3"
              id="sesi_judul"
              placeholder="Contoh: Sesi 1 - Pengenalan Kemuhammadiyahan"
              value="${isEdit ? escapeHtml(sesi.judul) : ""}"
              required
              maxlength="150"
            >
            <div class="invalid-feedback">Judul sesi wajib diisi.</div>
          </div>
          <div class="col-md-6">
            <label for="sesi_tanggal" class="form-label fs-6 fw-medium">Tanggal Pelaksanaan <span class="text-danger fs-6 fw-medium">*</span></label>
            <input
              type="date"
              class="form-control rounded-4 py-2 px-3"
              id="sesi_tanggal"
              value="${isEdit ? sesi.tanggal : ""}"
              required
            >
            <div class="invalid-feedback">Tanggal wajib dipilih.</div>
          </div>
          <div class="col-12">
            <label for="sesi_deskripsi" class="form-label fs-6 fw-medium">Deskripsi Sesi <span class="text-danger fs-6 fw-medium">*</span></label>
            <textarea
              class="form-control rounded-4 py-2 px-3"
              id="sesi_deskripsi"
              rows="3"
              placeholder="Deskripsikan tujuan dan isi sesi mentoring ini..."
              required
              maxlength="500"
            >${isEdit ? escapeHtml(sesi.deskripsi) : ""}</textarea>
            <div class="invalid-feedback">Deskripsi sesi wajib diisi.</div>
          </div>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-success">
            <i class="bi bi-check-circle me-2"></i>${isEdit ? "Simpan Perubahan" : "Simpan Sesi"}
          </button>
          <button type="button" id="btnTutupFormSesi" class="btn btn-secondary">
            <i class="bi bi-x-circle me-2"></i>Batal
          </button>
        </div>
      </form>
    </div>
  `;
}

// ==================== SESI MENTORING - MODAL DETAIL (konten) ====================

function renderModalDetailSesi(sesi) {
  return `
    <div class="mb-3">
      <h5 class="text-primary mb-1">${escapeHtml(sesi.judul)}</h5>
      <p class="text-muted mb-1 small"><i class="bi bi-calendar me-1"></i>${formatTanggal(sesi.tanggal)}</p>
      <p class="mb-0">${escapeHtml(sesi.deskripsi)}</p>
    </div>
    <hr>
    <ul class="nav nav-tabs nav-tabs-sm mb-3" id="detailSesiTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="tab-materi" data-bs-toggle="tab" data-bs-target="#detail-materi" type="button" role="tab">
          <i class="bi bi-book me-1"></i>Materi
          <span class="badge bg-info text-dark ms-1">${sesi.materi.length}</span>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="tab-tugas" data-bs-toggle="tab" data-bs-target="#detail-tugas" type="button" role="tab">
          <i class="bi bi-clipboard2-check me-1"></i>Tugas
          <span class="badge bg-warning text-dark ms-1">${sesi.tugas.length}</span>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="tab-presensi" data-bs-toggle="tab" data-bs-target="#detail-presensi" type="button" role="tab">
          <i class="bi bi-person-check me-1"></i>Presensi
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="tab-feedback" data-bs-toggle="tab" data-bs-target="#detail-feedback" type="button" role="tab">
          <i class="bi bi-chat-left-text me-1"></i>Feedback
          <span class="badge bg-secondary ms-1">${sesi.feedback.length}</span>
        </button>
      </li>
    </ul>
    <div class="tab-content" id="detailSesiTabContent">
      <div class="tab-pane fade show active" id="detail-materi" role="tabpanel">
        ${renderKontenPanel(sesi, "materi")}
      </div>
      <div class="tab-pane fade" id="detail-tugas" role="tabpanel">
        ${renderKontenPanel(sesi, "tugas")}
      </div>
      <div class="tab-pane fade" id="detail-presensi" role="tabpanel">
        ${renderPresensiPanel(sesi)}
      </div>
      <div class="tab-pane fade" id="detail-feedback" role="tabpanel">
        ${renderFeedbackPanel(sesi)}
      </div>
    </div>
  `;
}

// ==================== MATERI & TUGAS - KONTEN PANEL ====================

function renderKontenPanel(sesi, jenis) {
  const label = jenis === "materi" ? "Materi" : "Tugas";
  const iconClass = jenis === "materi" ? "bi-book-fill" : "bi-clipboard2-check-fill";

  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fs-5 text-black fw-semibold">${label} Mentoring</h5>
      <button class="btn btn-sm btn-primary btn-tambah-konten" data-sesi-id="${sesi.id}" data-jenis="${jenis}">
        <i class="bi bi-plus-circle me-1"></i>Tambah ${label}
      </button>
    </div>
    <div id="formKonten_${jenis}_${sesi.id}" class="sm-form-panel mb-3 p-3 rounded-4" style="display:none;"></div>
    <div id="listKonten_${jenis}_${sesi.id}">
      ${renderKontenListHTML(sesi, jenis)}
    </div>
  `;
}

function renderKontenListHTML(sesi, jenis) {
  const items = sesi[jenis];
  if (items.length === 0) {
    return `
    <div class="empty-state p-5 text-center rounded-4">
      <i class="bi ${jenis === "materi" ? "bi-book-fill" : "bi-clipboard-check-fill"} mb-3"></i>
      <p class="m-0 fs-6">Belum ada ${jenis === "materi" ? "materi" : "tugas"}. Klik tombol di atas untuk menambahkan.</p>
    </div>
    `;
  }

  return items
    .map(
      (item) => `
    <div class="sm-konten-item mb-2 rounded-4 p-3" id="kontenItem_${item.id}">
      <div class="d-flex align-items-center gap-2">
        <div class="sm-konten-icon">${getKontenIcon(item.tipe)}</div>
        <div class="flex-grow-1 min-w-0">
          <div class="d-flex align-items-center gap-2">
            <span class="small rounded-4 fw-semibold text-uppercase badge sm-tipe-${item.tipe}">${getTipeLabel(item.tipe)}</span>
            <small class="text-muted">${formatTanggal(item.createdAt?.split("T")[0])}</small>
          </div>
          <div class="sm-konten-preview text-black fs-6">${renderKontenPreview(item)}</div>
        </div>
        <div class="d-flex gap-1 flex-shrink-0">
          <button class="btn btn-sm btn-outline-primary btn-edit-konten"
            data-sesi-id="${sesi.id}" data-jenis="${jenis}" data-konten-id="${item.id}" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-hapus-konten"
            data-sesi-id="${sesi.id}" data-jenis="${jenis}" data-konten-id="${item.id}" title="Hapus">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

function getKontenIcon(tipe) {
  const icons = {
    file: '<i class="bi bi-file-earmark-fill fs-6 text-secondary"></i>',
    link: '<i class="bi bi-link-45deg fs-6 text-info"></i>',
    video: '<i class="bi bi-play-circle-fill fs-6 text-danger"></i>',
    text: '<i class="bi bi-card-text fs-6 text-success"></i>',
  };
  return icons[tipe] || icons.file;
}

function getTipeLabel(tipe) {
  const labels = { file: "File", link: "Link", video: "Video", text: "Teks" };
  return labels[tipe] || tipe;
}

function renderKontenPreview(item) {
  switch (item.tipe) {
    case "link":
    case "video":
      return `<a href="${escapeHtml(item.data.url)}" target="_blank" rel="noopener noreferrer"
        class="text-truncate d-block" style="max-width:400px;">${escapeHtml(item.data.judul || item.data.url)}</a>`;
    case "file":
      return `<span class="text-truncate d-block" style="max-width:400px;">
        <i class="bi bi-paperclip me-1"></i>${escapeHtml(item.data.namaFile || "File")}</span>`;
    case "text":
      return `<p class="mb-0 sm-text-preview">${escapeHtml(item.data.konten || "").substring(0, 200)}${(item.data.konten || "").length > 200 ? "..." : ""}</p>`;
    default:
      return "";
  }
}

// ==================== FORM TAMBAH / EDIT KONTEN ====================

function renderFormKonten(sesiId, jenis, konten = null) {
  const isEdit = konten !== null;
  const label = jenis === "materi" ? "Materi" : "Tugas";
  const tipe = isEdit ? konten.tipe : "file";

  return `
    <div>
      <h5 class="mb-4"><i class="bi bi-${isEdit ? "pencil-fill" : "plus-circle-fill"} me-2 text-black"></i>${isEdit ? "Edit" : "Tambah"} ${label}</h5>
      <form id="formKontenInner_${jenis}_${sesiId}" novalidate>
        <input type="hidden" id="kontenEditId_${jenis}_${sesiId}" value="${isEdit ? konten.id : ""}">
        <div class="mb-3">
          <label class="form-label fs-6 fw-medium">Tipe ${label} <span class="text-danger fs-6 fw-medium">*</span></label>
          <div class="d-flex flex-wrap gap-1" id="tipeSelector_${jenis}_${sesiId}">
            ${["file", "link", "video", "text"]
              .map(
                (t) => `
              <button type="button"
                class="btn btn-sm ${(isEdit ? konten.tipe === t : t === "file") ? "btn-primary" : "btn-outline-secondary"} tipe-btn"
                data-tipe="${t}">
                ${getKontenIcon(t)} ${getTipeLabel(t)}
              </button>
            `,
              )
              .join("")}
          </div>
          <input type="hidden" id="kontenTipe_${jenis}_${sesiId}" value="${tipe}">
        </div>
        <div id="kontenFieldsWrap_${jenis}_${sesiId}">
          ${renderKontenFields(jenis, sesiId, tipe, isEdit ? konten : null)}
        </div>
        <div class="d-flex gap-2 mt-3">
          <button type="submit" class="btn btn-success btn-sm">
            <i class="bi bi-check-circle me-1"></i>${isEdit ? "Simpan Perubahan" : `Tambah ${label}`}
          </button>
          <button type="button" class="btn btn-secondary btn-sm btn-tutup-form-konten"
            data-jenis="${jenis}" data-sesi-id="${sesiId}">
            <i class="bi bi-x-circle me-1"></i>Batal
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderKontenFields(jenis, sesiId, tipe, konten = null) {
  const d = konten?.data || {};
  switch (tipe) {
    case "file":
      return `
        <div class="mb-2">
          <label class="form-label fs-6 fw-medium">Upload File <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="file" class="form-control rounded-4 py-2 px-3" id="kontenFile_${jenis}_${sesiId}"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png">
          <small class="text-muted">Format: PDF, DOC/DOCX, PPT/PPTX, JPG/JPEG/PNG</small>
          ${konten ? `<p class="text-muted small mt-1 mb-0"><i class="bi bi-paperclip me-1"></i>File saat ini: ${escapeHtml(d.namaFile || "-")}</p>` : ""}
          <div class="invalid-feedback">File wajib dipilih.</div>
        </div>
      `;
    case "link":
      return `
        <div class="mb-2">
          <label class="form-label fs-6 fw-medium">Judul Link <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="text" class="form-control rounded-4 py-2 px-3" id="kontenLinkJudul_${jenis}_${sesiId}"
            value="${escapeHtml(d.judul || "")}" placeholder="Contoh: Artikel Referensi" required>
          <div class="invalid-feedback">Judul wajib diisi.</div>
        </div>
        <div class="mb-2">
          <label class="form-label fs-6 fw-medium">URL <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="url" class="form-control rounded-4 py-2 px-3" id="kontenLinkUrl_${jenis}_${sesiId}"
            value="${escapeHtml(d.url || "")}" placeholder="https://..." required>
          <div class="invalid-feedback">URL valid wajib diisi.</div>
        </div>
      `;
    case "video":
      return `
        <div class="mb-2">
          <label class="form-label fs-6 fw-medium">Judul Video <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="text" class="form-control rounded-4 py-2 px-3" id="kontenVideoJudul_${jenis}_${sesiId}"
            value="${escapeHtml(d.judul || "")}" placeholder="Contoh: Video Tutorial" required>
          <div class="invalid-feedback">Judul wajib diisi.</div>
        </div>
        <div class="mb-2">
          <label class="form-label fs-6 fw-medium">URL Video <span class="text-danger fs-6 fw-medium">*</span></label>
          <input type="url" class="form-control rounded-4 py-2 px-3" id="kontenVideoUrl_${jenis}_${sesiId}"
            value="${escapeHtml(d.url || "")}" placeholder="https://youtube.com/..." required>
          <div class="invalid-feedback">URL valid wajib diisi.</div>
        </div>
      `;
    case "text":
      return `
        <div class="mb-2">
          <label class="form-label fs-6 fw-medium">Isi Teks <span class="text-danger fs-6 fw-medium">*</span></label>
          <textarea class="form-control rounded-4 py-2 px-3" id="kontenTextKonten_${jenis}_${sesiId}" rows="5"
            placeholder="Tulis konten ${jenis === "materi" ? "materi" : "tugas"} di sini..." required>${escapeHtml(d.konten || "")}</textarea>
          <div class="invalid-feedback">Isi teks wajib diisi.</div>
        </div>
      `;
    default:
      return "";
  }
}

// ==================== PRESENSI - PANEL ====================

function renderPresensiPanel(sesi) {
  const rekap = STATUS_PRESENSI.map((s) => ({
    status: s,
    count: sesi.presensi.filter((p) => p.status === s).length,
  }));

  const rekapHTML = rekap
    .map(
      (r) => `
    <div class="sm-rekap-item sm-rekap-${r.status.toLowerCase()}">
      <div class="sm-rekap-count">${r.count}</div>
      <div class="sm-rekap-label">${r.status}</div>
    </div>
  `,
    )
    .join("");

  const rows = sesi.presensi
    .map(
      (p, idx) => `
    <tr>
      <td class="text-center">${idx + 1}</td>
      <td>${escapeHtml(p.nim)}</td>
      <td>${escapeHtml(p.nama)}</td>
      <td class="text-center">
        <div class="d-flex gap-1 justify-content-center flex-wrap">
          ${STATUS_PRESENSI.map(
            (s) => `
            <button
              class="btn btn-sm ${p.status === s ? getPresensiActiveClass(s) : "btn-outline-secondary"} btn-status-presensi"
              data-sesi-id="${sesi.id}"
              data-mentee-id="${p.menteeId}"
              data-status="${s}"
            >${s}</button>
          `,
          ).join("")}
        </div>
      </td>
    </tr>
  `,
    )
    .join("");

  return `
    <div class="sm-rekap-wrap mb-3" id="rekapPresensi_${sesi.id}">${rekapHTML}</div>
    <div class="table-responsive">
      <table class="table table-custom align-middle">
        <thead>
          <tr>
            <th class="text-center" style="width:50px;">No</th>
            <th>NIM</th>
            <th>Nama Mentee</th>
            <th class="text-center">Status Kehadiran</th>
          </tr>
        </thead>
        <tbody id="tabelPresensiBody_${sesi.id}">${rows}</tbody>
      </table>
    </div>
    <div class="d-flex justify-content-end mt-2">
      <button class="btn btn-success btn-sm btn-simpan-presensi" data-sesi-id="${sesi.id}">
        <i class="bi bi-save me-1"></i>Simpan Presensi
      </button>
    </div>
  `;
}

function getPresensiActiveClass(status) {
  return { Hadir: "btn-success", Izin: "btn-warning", Alpha: "btn-danger" }[status] || "btn-secondary";
}

// ==================== FEEDBACK - PANEL ====================

function renderFeedbackPanel(sesi) {
  if (sesi.feedback.length === 0) {
    return `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-chat-left-text-fill mb-3"></i>
        <p class="m-0 fs-6">Belum ada feedback dari mentee untuk sesi ini.</p>
      </div>
    `;
  }

  return sesi.feedback
    .map(
      (fb) => `
    <div class="sm-feedback-item mb-3">
      <div class="d-flex align-items-center gap-2 mb-2">
        <div class="sm-feedback-avatar"><i class="bi bi-person-circle fs-4"></i></div>
        <div>
          <strong>${escapeHtml(fb.namaMentee)}</strong>
          <div class="text-muted small"><i class="bi bi-calendar me-1"></i>${formatTanggal(fb.tanggal)}</div>
        </div>
      </div>
      <div class="sm-feedback-isi">${escapeHtml(fb.isi)}</div>
    </div>
  `,
    )
    .join("");
}

// ==================== EVENT LISTENERS - SESI (di luar modal) ====================

function setupSesiListeners(mentorData, user) {
  const btnTambah = document.getElementById("btnTambahSesi");
  if (btnTambah) {
    btnTambah.addEventListener("click", () => {
      const wrap = document.getElementById("formSesiWrap");
      wrap.innerHTML = renderFormSesi();
      wrap.style.display = "block";
      wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setupFormSesiListeners(mentorData, user);
    });
  }

  const daftarContainer = document.getElementById("daftarSesiContainer");
  if (daftarContainer) {
    daftarContainer.addEventListener("click", (e) => {
      const target = e.target.closest("button");
      if (!target) return;

      const sesiId = target.dataset.sesiId;

      if (target.classList.contains("btn-detail-sesi")) {
        bukaModalDetailSesi(sesiId, mentorData, user);
        return;
      }
      if (target.classList.contains("btn-edit-sesi")) {
        bukaFormEditSesi(sesiId, mentorData, user);
        return;
      }
      if (target.classList.contains("btn-hapus-sesi")) {
        hapusSesi(sesiId, mentorData, user);
        return;
      }
    });
  }
}

function setupFormSesiListeners(mentorData, user) {
  const form = document.getElementById("formSesiMentoring");
  if (!form) return;

  const btnTutup = document.getElementById("btnTutupFormSesi");
  if (btnTutup) {
    btnTutup.addEventListener("click", () => {
      const wrap = document.getElementById("formSesiWrap");
      wrap.style.display = "none";
      wrap.innerHTML = "";
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const judul = document.getElementById("sesi_judul").value.trim();
    const tanggal = document.getElementById("sesi_tanggal").value;
    const deskripsi = document.getElementById("sesi_deskripsi").value.trim();
    const editId = document.getElementById("sesiEditId").value;

    if (editId) {
      const sesi = getSesiById(mentorData, editId);
      if (sesi) {
        sesi.judul = judul;
        sesi.tanggal = tanggal;
        sesi.deskripsi = deskripsi;
        saveMentorData(mentorData);
        showToast("Sesi berhasil diperbarui!", "success");
      }
    } else {
      if (mentorData.sesiMentoring.length >= MAX_SESI) {
        showToast(`Batas maksimum ${MAX_SESI} sesi telah tercapai!`, "danger");
        return;
      }
      const sesi = createSesi(judul, tanggal, deskripsi);
      mentorData.sesiMentoring.push(sesi);

      saveMentorData(mentorData);
      showToast("Sesi baru berhasil ditambahkan!", "success");
    }

    renderSertifikatMentor(mentorData, user);

    // Tutup form & refresh daftar — TIDAK re-render seluruh tab (modal tidak terlibat)
    const wrap = document.getElementById("formSesiWrap");
    wrap.style.display = "none";
    wrap.innerHTML = "";
    refreshDaftarSesi(mentorData);
  });
}

function bukaFormEditSesi(sesiId, mentorData, user) {
  const sesi = getSesiById(mentorData, sesiId);
  if (!sesi) return;

  const wrap = document.getElementById("formSesiWrap");
  wrap.innerHTML = renderFormSesi(sesi);
  wrap.style.display = "block";
  wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
  setupFormSesiListeners(mentorData, user);
}

function hapusSesi(sesiId, mentorData, user) {
  const sesi = getSesiById(mentorData, sesiId);
  if (!sesi) return;

  if (!confirm(`Yakin ingin menghapus sesi "${sesi.judul}"?\nSemua materi, tugas, dan presensi pada sesi ini juga akan dihapus.`)) return;

  mentorData.sesiMentoring = mentorData.sesiMentoring.filter((s) => s.id !== sesiId);

  saveMentorData(mentorData);
  showToast("Sesi berhasil dihapus.", "warning");
  refreshDaftarSesi(mentorData);
}

// ==================== MODAL DETAIL - BUKA ====================

function bukaModalDetailSesi(sesiId, mentorData, user) {
  const sesi = getSesiById(mentorData, sesiId);
  if (!sesi) return;

  // Cleanup listener lama sebelum attach listener baru
  if (_modalListenerController) {
    _modalListenerController.abort();
  }
  _modalListenerController = new AbortController();

  const body = document.getElementById("modalDetailSesiBody");
  body.innerHTML = renderModalDetailSesi(sesi);

  setupModalDetailListeners(sesi, mentorData, user, _modalListenerController.signal);

  const modalEl = document.getElementById("modalDetailSesi");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

// ==================== MODAL DETAIL - LISTENERS ====================

/**
 * Semua listener modal menggunakan AbortSignal sehingga
 * dibersihkan otomatis saat modal ditutup atau dibuka ulang.
 * TIDAK ada panggilan renderSesiMentoring() di sini —
 * hanya refreshDaftarSesi() yang aman (tidak menyentuh DOM modal).
 */
function setupModalDetailListeners(sesi, mentorData, user, signal) {
  const body = document.getElementById("modalDetailSesiBody");

  body.addEventListener(
    "click",
    (e) => {
      const target = e.target.closest("button");
      if (!target) return;

      // Tambah Konten
      if (target.classList.contains("btn-tambah-konten")) {
        bukaFormKonten(target.dataset.sesiId, target.dataset.jenis, null, mentorData, user, signal);
        return;
      }

      // Edit Konten
      if (target.classList.contains("btn-edit-konten")) {
        const { sesiId, jenis, kontenId } = target.dataset;
        const kontenSesi = getSesiById(mentorData, sesiId);
        const konten = kontenSesi?.[jenis]?.find((k) => k.id === kontenId);
        if (konten) bukaFormKonten(sesiId, jenis, konten, mentorData, user, signal);
        return;
      }

      // Hapus Konten
      if (target.classList.contains("btn-hapus-konten")) {
        hapusKonten(target.dataset.sesiId, target.dataset.jenis, target.dataset.kontenId, mentorData, user);
        return;
      }

      // Tutup Form Konten
      if (target.classList.contains("btn-tutup-form-konten")) {
        const { jenis, sesiId } = target.dataset;
        const formWrap = document.getElementById(`formKonten_${jenis}_${sesiId}`);
        if (formWrap) {
          formWrap.innerHTML = "";
          formWrap.style.display = "none";
        }
        return;
      }

      // Tipe Selector Konten
      if (target.classList.contains("tipe-btn")) {
        const parent = target.closest("[id^='tipeSelector']");
        if (!parent) return;
        // Parse "tipeSelector_jenis_sesiId" — sesiId bisa mengandung underscore
        const raw = parent.id.replace("tipeSelector_", "");
        const firstUnderscore = raw.indexOf("_");
        const jenis = raw.substring(0, firstUnderscore);
        const sesiId = raw.substring(firstUnderscore + 1);
        const tipe = target.dataset.tipe;

        parent.querySelectorAll(".tipe-btn").forEach((b) => {
          b.classList.remove("btn-primary");
          b.classList.add("btn-outline-secondary");
        });
        target.classList.remove("btn-outline-secondary");
        target.classList.add("btn-primary");

        const hiddenInput = document.getElementById(`kontenTipe_${jenis}_${sesiId}`);
        if (hiddenInput) hiddenInput.value = tipe;

        const fieldsWrap = document.getElementById(`kontenFieldsWrap_${jenis}_${sesiId}`);
        if (fieldsWrap) fieldsWrap.innerHTML = renderKontenFields(jenis, sesiId, tipe, null);
        return;
      }

      // Presensi - ubah status
      if (target.classList.contains("btn-status-presensi")) {
        const { sesiId, status } = target.dataset;
        const menteeId = parseInt(target.dataset.menteeId);
        ubahStatusPresensi(sesiId, menteeId, status, mentorData);
        return;
      }

      // Simpan Presensi
      if (target.classList.contains("btn-simpan-presensi")) {
        saveMentorData(mentorData);
        showToast("Data presensi berhasil disimpan!", "success");
        // Hanya refresh daftar sesi di background — TIDAK menutup/rebuild modal
        refreshDaftarSesi(mentorData);
        return;
      }
    },
    { signal },
  );
}

// ==================== KONTEN - FORM & SIMPAN ====================

function bukaFormKonten(sesiId, jenis, konten, mentorData, user, signal) {
  const formWrap = document.getElementById(`formKonten_${jenis}_${sesiId}`);
  if (!formWrap) return;

  formWrap.innerHTML = renderFormKonten(sesiId, jenis, konten);
  formWrap.style.display = "block";
  formWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });

  const form = document.getElementById(`formKontenInner_${jenis}_${sesiId}`);
  if (!form) return;

  form.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }

      const tipe = document.getElementById(`kontenTipe_${jenis}_${sesiId}`).value;
      const editId = document.getElementById(`kontenEditId_${jenis}_${sesiId}`).value;

      let data = null;
      let valid = true;

      switch (tipe) {
        case "file": {
          const fileInput = document.getElementById(`kontenFile_${jenis}_${sesiId}`);
          const file = fileInput?.files?.[0];
          if (!file && !editId) {
            showToast("Pilih file terlebih dahulu.", "danger");
            valid = false;
            break;
          }
          if (file) {
            const allowed = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".jpg", ".jpeg", ".png"];
            const ext = "." + file.name.split(".").pop().toLowerCase();
            if (!allowed.includes(ext)) {
              showToast("Format file tidak didukung. Gunakan PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, atau PNG.", "danger");
              valid = false;
              break;
            }
            data = { namaFile: file.name, ukuran: file.size, tipeFile: file.type };
          } else {
            const existing = getSesiById(mentorData, sesiId)?.[jenis]?.find((k) => k.id === editId);
            data = existing?.data || { namaFile: "-" };
          }
          break;
        }
        case "link": {
          const judul = document.getElementById(`kontenLinkJudul_${jenis}_${sesiId}`)?.value.trim();
          const url = document.getElementById(`kontenLinkUrl_${jenis}_${sesiId}`)?.value.trim();
          if (!judul || !url) {
            valid = false;
            break;
          }
          data = { judul, url };
          break;
        }
        case "video": {
          const judul = document.getElementById(`kontenVideoJudul_${jenis}_${sesiId}`)?.value.trim();
          const url = document.getElementById(`kontenVideoUrl_${jenis}_${sesiId}`)?.value.trim();
          if (!judul || !url) {
            valid = false;
            break;
          }
          data = { judul, url };
          break;
        }
        case "text": {
          const kontenVal = document.getElementById(`kontenTextKonten_${jenis}_${sesiId}`)?.value.trim();
          if (!kontenVal) {
            valid = false;
            break;
          }
          data = { konten: kontenVal };
          break;
        }
      }

      if (!valid || !data) {
        form.classList.add("was-validated");
        return;
      }

      const sesiObj = getSesiById(mentorData, sesiId);
      if (!sesiObj) return;

      if (editId) {
        const idx = sesiObj[jenis].findIndex((k) => k.id === editId);
        if (idx !== -1) {
          sesiObj[jenis][idx].tipe = tipe;
          sesiObj[jenis][idx].data = data;
        }
        showToast(`${jenis === "materi" ? "Materi" : "Tugas"} berhasil diperbarui!`, "success");
      } else {
        sesiObj[jenis].push(createKonten(tipe, data));
        showToast(`${jenis === "materi" ? "Materi" : "Tugas"} berhasil ditambahkan!`, "success");
      }

      saveMentorData(mentorData);

      // Refresh hanya list konten & badge — TIDAK menyentuh modal/backdrop
      const listEl = document.getElementById(`listKonten_${jenis}_${sesiId}`);
      if (listEl) listEl.innerHTML = renderKontenListHTML(sesiObj, jenis);

      refreshKontenBadge(sesiObj);
      refreshDaftarSesi(mentorData);

      // Tutup form konten
      formWrap.innerHTML = "";
      formWrap.style.display = "none";
    },
    { signal },
  );
}

function hapusKonten(sesiId, jenis, kontenId, mentorData, user) {
  const sesi = getSesiById(mentorData, sesiId);
  if (!sesi) return;

  if (!confirm(`Yakin ingin menghapus ${jenis === "materi" ? "materi" : "tugas"} ini?`)) return;

  sesi[jenis] = sesi[jenis].filter((k) => k.id !== kontenId);
  saveMentorData(mentorData);

  // Refresh hanya list konten & badge — TIDAK menyentuh modal/backdrop
  const listEl = document.getElementById(`listKonten_${jenis}_${sesiId}`);
  if (listEl) listEl.innerHTML = renderKontenListHTML(sesi, jenis);

  refreshKontenBadge(sesi);
  refreshDaftarSesi(mentorData);
  showToast(`${jenis === "materi" ? "Materi" : "Tugas"} berhasil dihapus.`, "warning");
}

function refreshKontenBadge(sesi) {
  const tabMateri = document.getElementById("tab-materi");
  const tabTugas = document.getElementById("tab-tugas");
  if (tabMateri) {
    const b = tabMateri.querySelector(".badge");
    if (b) b.textContent = sesi.materi.length;
  }
  if (tabTugas) {
    const b = tabTugas.querySelector(".badge");
    if (b) b.textContent = sesi.tugas.length;
  }
}

// ==================== PRESENSI - UBAH STATUS ====================

function ubahStatusPresensi(sesiId, menteeId, status, mentorData) {
  const sesi = getSesiById(mentorData, sesiId);
  if (!sesi) return;

  const presensi = sesi.presensi.find((p) => p.menteeId === menteeId);
  if (!presensi) return;
  presensi.status = status;

  // Update tombol di baris yang sama — surgical DOM update, tidak menyentuh modal
  const tbody = document.getElementById(`tabelPresensiBody_${sesiId}`);
  if (tbody) {
    const row = tbody.querySelector(`[data-mentee-id="${menteeId}"]`)?.closest("tr");
    if (row) {
      row.querySelectorAll(".btn-status-presensi").forEach((btn) => {
        const isActive = btn.dataset.status === status;
        // Reset semua ke outline dulu
        btn.className = btn.className
          .replace(/\bbtn-success\b/, "btn-outline-secondary")
          .replace(/\bbtn-warning\b/, "btn-outline-secondary")
          .replace(/\bbtn-danger\b/, "btn-outline-secondary");
        if (isActive) {
          btn.className = btn.className.replace("btn-outline-secondary", getPresensiActiveClass(status));
        }
      });
    }
  }

  // Update rekap presensi
  const rekapWrap = document.getElementById(`rekapPresensi_${sesiId}`);
  if (rekapWrap) {
    rekapWrap.innerHTML = STATUS_PRESENSI.map(
      (s) => `
      <div class="sm-rekap-item sm-rekap-${s.toLowerCase()}">
        <div class="sm-rekap-count">${sesi.presensi.filter((p) => p.status === s).length}</div>
        <div class="sm-rekap-label">${s}</div>
      </div>
    `,
    ).join("");
  }
}

// ==================== TOAST NOTIFIKASI ====================

function showToast(pesan, tipe = "success") {
  const existing = document.getElementById("smToastContainer");
  if (existing) existing.remove();

  const colorMap = {
    success: "bg-success text-white",
    danger: "bg-danger text-white",
    warning: "bg-warning text-dark",
    info: "bg-info text-dark",
  };
  const colorClass = colorMap[tipe] || "bg-secondary text-white";

  const wrap = document.createElement("div");
  wrap.id = "smToastContainer";
  wrap.style.cssText = "position:fixed;top:80px;right:20px;z-index:99999;min-width:260px;";
  wrap.innerHTML = `
    <div class="toast align-items-center ${colorClass} border-0 show"
      role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body fw-semibold">${pesan}</div>
        <button type="button" class="btn-close ${tipe === "warning" || tipe === "info" ? "" : "btn-close-white"} me-2 m-auto"
          aria-label="Tutup"></button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  // Tutup manual via tombol close
  wrap.querySelector(".btn-close").addEventListener("click", () => wrap.remove());

  setTimeout(() => {
    if (wrap.parentNode) wrap.remove();
  }, 3500);
}

// ==================== INIT FUNCTION ====================

export function initMentor2() {
  const user = checkAuth();
  if (!user) return;

  // Mount modal SEKALI ke <body> — tidak akan pernah terhapus oleh innerHTML lain
  mountModalDetailSesi();

  let mentorData = getMentorData(user.nim);

  if (!mentorData) {
    mentorData = initializeMentorData(user);
    saveMentorData(mentorData);
  }

  // Pastikan properti sesiMentoring ada (backward compatibility)
  if (!mentorData.sesiMentoring) {
    mentorData.sesiMentoring = [];
    saveMentorData(mentorData);
  }

  renderPendaftaran(mentorData);
  renderStatusSeleksi(mentorData);
  renderKelompokMentee(mentorData);
  renderSertifikatMentor(mentorData, user);
  renderSesiMentoring(mentorData, user);

  setupPendaftaranListeners(mentorData, user);
}
