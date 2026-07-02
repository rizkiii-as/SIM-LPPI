import { checkAuth } from "./auth.js";
import { basePresensi, materiTugasData } from "./datamentee.js";
import { infoAkademik } from "./datadashboard.js";

// ==================== KONSTANTA ====================

const STATUS_PENDAFTARAN_TERVERIFIKASI = "Terverifikasi";
const STATUS_PENDAFTARAN_BELUM_DIVERIFIKASI = "Belum Diverifikasi";
const STATUS_PENDAFTARAN_DITOLAK = "Ditolak";

const STATUS_HASIL_LULUS = "Lulus";
const STATUS_HASIL_TIDAK_LULUS = "Tidak Lulus";

const STATUS_SELEKSI_LOLOS = "Lolos";
const STATUS_SELEKSI_TIDAK_LOLOS = "Tidak Lolos";

const MAX_SESI_MENTOR = 2;

const DOKUMEN_LIST = [
  { jenis: "mentor", label: "Sertifikat Mentor", subtitle: "Program Mentoring Kemuhammadiyahan", icon: "bi-person-video2", docType: "Sertifikat" },
  { jenis: "mentee", label: "Sertifikat Mentee", subtitle: "Program Mentoring Kemuhammadiyahan", icon: "bi-person-badge", docType: "Sertifikat" },
  { jenis: "tba", label: "Sertifikat TBA", subtitle: "Tes Baca Al-Quran", icon: "bi-file-earmark-text-fill", docType: "Sertifikat" },
  { jenis: "bibaq", label: "Memo BIBAQ", subtitle: "Bimbingan Baca Al-Quran", icon: "bi-chat-square-dots-fill", docType: "Memo" },
  { jenis: "berprestasi", label: "Sertifikat Berprestasi", subtitle: "Seleksi Mentor & Mentee Berprestasi", icon: "bi-trophy-fill", docType: "Sertifikat" },
];

// ==================== ENTRY POINT ====================

export function initDashboard() {
  const user = checkAuth();
  if (!user) return;

  const programs = getAllProgramData(user.nim);

  renderWelcomeBanner(user);
  renderStatusProgram(programs);
  renderProgressKehadiran(programs);
  renderUpcomingMeetings(programs);
  renderPendingTasks(programs, user.nim);
  renderProfilRingkas(user);
  renderNavigasiCepat(programs);
}

// ==================== DATA MANAGEMENT ====================

function readSessionData(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`Error parsing sessionStorage key "${key}":`, error);
    return null;
  }
}

function getAllProgramData(nim) {
  return {
    mentee: readSessionData(`menteeData_${nim}`),
    mentor: readSessionData(`mentorData_${nim}`),
    tba: readSessionData(`tbaData_${nim}`),
    bibaq: readSessionData(`bibaqData_${nim}`),
    berprestasi: readSessionData(`berprestasiData_${nim}`),
  };
}

function isMenteeTerverifikasi(programs) {
  return programs.mentee?.pendaftaranStatus?.status === STATUS_PENDAFTARAN_TERVERIFIKASI;
}

// ==================== HELPER TANGGAL & FORMAT ====================

function getSalam() {
  const jam = new Date().getHours();
  if (jam >= 5 && jam < 12) return "Pagi";
  if (jam >= 12 && jam < 15) return "Siang";
  if (jam >= 15 && jam < 18) return "Sore";
  return "Malam";
}

function formatTanggal(tanggal) {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTanggalSingkat(tanggal) {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getBadgeStatus(status) {
  const map = {
    hadir: "success",
    izin: "warning",
    alpha: "danger",
  };
  return map[status.toLowerCase()] ?? "secondary";
}

function hitungHariTersisa(deadline) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tgl = new Date(deadline);
  tgl.setHours(0, 0, 0, 0);
  return Math.round((tgl - today) / (1000 * 60 * 60 * 24));
}

function lockedStateMarkup(pesan) {
  return /*html*/ `
    <div class="text-center py-4 text-muted">
      <i class="bi bi-lock-fill fs-2 mb-2 d-block"></i>
      <p class="mb-2 small">${pesan}</p>
      <a href="mentee.html" class="btn btn-sm btn-outline-primary rounded-pill px-3">Daftar Mentee</a>
    </div>
  `;
}

// ==================== WELCOME BANNER ====================

function renderWelcomeBanner(user) {
  const container = document.getElementById("welcomeBanner");
  if (!container) return;

  const salam = getSalam();
  const tanggalHariIni = formatTanggal(new Date());

  container.innerHTML = /*html*/ `
    <div class="welcome-inner d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
      <div>
        <h4 class="welcome-greeting fs-4 fw-normal mb-1 text-white">Selamat ${salam}</h4>
        <h4 class="welcome-name mb-1 fs-4 fw-bold text-white">${user.nama}</h4>
        <p class="welcome-meta d-flex flex-wrap gap-1 mb-0 fs-6 text-white">
          <span class="me-3"><i class="bi bi-mortarboard-fill me-2"></i>${user.prodi}</span>
          <span><i class="bi bi-building me-2"></i>${user.fakultas}</span>
        </p>
      </div>
      <div class="welcome-date-box text-md-end rounded-4 p-3 text-white">
        <p class="welcome-date-label mb-1 small fs-medium"><i class="bi bi-calendar3 me-2"></i>${tanggalHariIni}</p>
        <p class="welcome-semester mb-0">
          <i class="bi bi-mortarboard me-1"></i>
          Semester ${infoAkademik.semesterAktif} &bull; TA ${infoAkademik.tahunAjaran}
        </p>
      </div>
    </div>
  `;
}

// ==================== STATUS PROGRAM ====================

function resolveStatusProgram(data, kind) {
  if (!data || !data.pendaftaranStatus?.status) {
    return { label: "Belum Mendaftar", color: "secondary" };
  }

  const statusPendaftaran = data.pendaftaranStatus.status;

  if (statusPendaftaran === STATUS_PENDAFTARAN_BELUM_DIVERIFIKASI) {
    return { label: "Menunggu Verifikasi", color: "warning" };
  }

  if (statusPendaftaran === STATUS_PENDAFTARAN_DITOLAK) {
    return { label: "Ditolak", color: "danger" };
  }

  switch (kind) {
    case "mentee":
    case "tba":
    case "bibaq":
      if (data.statusHasil === STATUS_HASIL_LULUS) return { label: "Lulus", color: "success" };
      if (data.statusHasil === STATUS_HASIL_TIDAK_LULUS) return { label: "Tidak Lulus", color: "danger" };
      return { label: "Berjalan", color: "info" };

    case "mentor":
      if (data.statusSeleksi === STATUS_SELEKSI_LOLOS) return { label: "Lolos Seleksi", color: "success" };
      if (data.statusSeleksi === STATUS_SELEKSI_TIDAK_LOLOS) return { label: "Tidak Lolos", color: "danger" };
      return { label: "Terverifikasi", color: "info" };

    case "berprestasi":
      if (data.statusHasil) return { label: data.statusHasil, color: "success" }; // Juara 1/2/3
      if (data.statusSeleksi === STATUS_SELEKSI_TIDAK_LOLOS) return { label: "Tidak Lolos", color: "danger" };
      return { label: "Terverifikasi", color: "info" };

    default:
      return { label: statusPendaftaran, color: "secondary" };
  }
}

function renderStatusProgram(programs) {
  const container = document.getElementById("statusProgramRow");
  if (!container) return;

  const daftarProgram = [
    { kind: "mentee", label: "Mentee", icon: "bi-person-badge", data: programs.mentee },
    { kind: "mentor", label: "Mentor", icon: "bi-person-video2", data: programs.mentor },
    { kind: "tba", label: "TBA", icon: "bi-file-earmark-text-fill", data: programs.tba },
    { kind: "bibaq", label: "BIBAQ", icon: "bi-chat-square-dots-fill", data: programs.bibaq },
    { kind: "berprestasi", label: "Seleksi Berprestasi", icon: "bi-trophy-fill", data: programs.berprestasi },
  ];

  container.innerHTML = daftarProgram
    .map((program) => {
      const status = resolveStatusProgram(program.data, program.kind);
      return /*html*/ `
        <div class="col-12">
          <div class="status-program-card bg-white rounded-4 shadow-sm p-3 h-100 text-center">
            <div class="status-program-icon d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2 fs-5 status-icon-${status.color}">
              <i class="bi ${program.icon}"></i>
            </div>
            <div class="fw-semibold text-black fs-6 mb-2">${program.label}</div>
            <span class="badge bg-${status.color} rounded-pill px-2 py-1 small mb-0">${status.label}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

// ==================== PROGRESS KEHADIRAN ====================

function renderProgressKehadiran(programs) {
  const container = document.getElementById("progressKehadiran");
  if (!container) return;

  const mentorTersedia = programs.mentor?.pendaftaranStatus?.status === STATUS_PENDAFTARAN_TERVERIFIKASI && programs.mentor?.statusSeleksi === STATUS_SELEKSI_LOLOS;
  const jumlahSesiMentor = programs.mentor?.sesiMentoring?.length || 0;
  const persenSesiMentor = Math.round((jumlahSesiMentor / MAX_SESI_MENTOR) * 100);

  const items = [
    {
      label: "Kehadiran Mentee",
      icon: "bi-person-badge",
      color: "primary",
      tersedia: isMenteeTerverifikasi(programs),
      persen: programs.mentee?.persentaseKehadiran ?? 0,
      keterangan: "",
    },
    {
      label: "Kehadiran BIBAQ",
      icon: "bi-chat-square-dots-fill",
      color: "success",
      tersedia: programs.bibaq?.pendaftaranStatus?.status === STATUS_PENDAFTARAN_TERVERIFIKASI,
      persen: programs.bibaq?.persentaseKehadiran ?? 0,
      keterangan: "",
    },
    {
      label: "Sesi Mentoring (Mentor)",
      icon: "bi-person-video2",
      color: "warning",
      tersedia: mentorTersedia,
      persen: persenSesiMentor,
      keterangan: mentorTersedia ? `${jumlahSesiMentor}/${MAX_SESI_MENTOR} sesi terlaksana` : "",
    },
  ];

  container.innerHTML = items
    .map((item) => {
      if (!item.tersedia) {
        return /*html*/ `
          <div class="progress-item py-2 mb-2">
            <div class="d-flex justify-content-between align-items-center">
              <span class="fs-6 fw-semibold text-black"><i class="bi ${item.icon} me-2 text-${item.color} fs-6"></i>${item.label}</span>
              <span class="badge bg-secondary-subtle text-secondary small">Belum Tersedia</span>
            </div>
          </div>
        `;
      }

      return /*html*/ `
        <div class="progress-item py-2">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="fs-6 fw-semibold text-black"><i class="bi ${item.icon} me-2 text-${item.color}"></i>${item.label}</span>
            <span class="fs-6 fw-semibold text-${item.color}">${item.persen}%</span>
          </div>
          <div class="progress progress-thin rounded-4" role="progressbar" aria-label="${item.label}" aria-valuenow="${item.persen}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar bg-${item.color}" style="width: ${item.persen}%"></div>
          </div>
          ${item.keterangan ? `<div class="text-muted small mt-1">${item.keterangan}</div>` : ""}
        </div>
      `;
    })
    .join("");
}

// ==================== PERTEMUAN BERIKUTNYA ====================

function getUpcomingMeetings(limit = 3) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return basePresensi.filter((m) => new Date(m.tanggal) >= today).slice(0, limit);
}

function renderUpcomingMeetings(programs) {
  const container = document.getElementById("upcomingMeetings");
  if (!container) return;

  if (!isMenteeTerverifikasi(programs)) {
    container.innerHTML = lockedStateMarkup("Daftar dan dapatkan verifikasi pada Program Mentee untuk melihat jadwal pertemuan berikutnya.");
    return;
  }

  const meetings = getUpcomingMeetings(3);

  if (meetings.length === 0) {
    container.innerHTML = /*html*/ `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-calendar-check fs-2 mb-2 d-block"></i>
        <p class="mb-0">Semua pertemuan telah selesai dilaksanakan.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = meetings
    .map(
      (meeting) => /*html*/ `
      <div class="upcoming-item d-flex flex-wrap align-items-center gap-3 py-3 border-bottom">
        <div class="d-flex align-items-center justify-content-center flex-shrink-0">
          <span class="badge-pertemuan d-flex flex-shrink-0 align-items-center justify-content-center rounded-circle fs-6 fw-bold">P${meeting.pertemuan}</span>
        </div>
        <div class="flex-grow-1 min-w-0">
          <div class="fw-semibold text-black fs-6 text-wrap mb-0">Pertemuan ${meeting.pertemuan}</div>
          <div class="text-muted small">${formatTanggalSingkat(meeting.tanggal)}</div>
        </div>
      </div>
    `,
    )
    .join("");
}

// ==================== TUGAS BELUM DIKUMPULKAN ====================

function getPendingTasks(nim) {
  return materiTugasData.filter((m) => {
    if (m.tugas === null) return false;
    const tugasKey = `tugas_${nim}_pertemuan_${m.pertemuan}`;
    return !sessionStorage.getItem(tugasKey);
  });
}

function renderPendingTasks(programs, nim) {
  const container = document.getElementById("pendingTasks");
  if (!container) return;

  if (!isMenteeTerverifikasi(programs)) {
    container.innerHTML = lockedStateMarkup("Daftar dan dapatkan verifikasi pada Program Mentee untuk melihat daftar tugas.");
    return;
  }

  const pending = getPendingTasks(nim);

  if (pending.length === 0) {
    container.innerHTML = /*html*/ `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-check-circle-fill fs-2 mb-2 d-block text-success"></i>
        <p class="mb-0">Semua tugas sudah dikumpulkan!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pending
    .map((item) => {
      const hariTersisa = hitungHariTersisa(item.tugas.deadline);
      const deadlineLewat = hariTersisa < 0;
      const warnaDeadline = deadlineLewat ? "danger" : hariTersisa <= 3 ? "warning" : "secondary";
      const labelDeadline = deadlineLewat ? `${Math.abs(hariTersisa)} hari lalu` : hariTersisa === 0 ? "Hari ini" : `${hariTersisa} hari lagi`;

      return /*html*/ `
      <div class="pending-item d-flex align-items-start gap-1 py-3 border-bottom flex-wrap">
        <div class="d-flex align-items-center justify-content-center flex-shrink-0">
          <span class="pending-pertemuan d-flex flex-shrink-0 align-items-center justify-content-center rounded-circle fs-6 fw-bold">P${item.pertemuan}</span>
        </div>
        
        <div class="flex-grow-1 min-w-0">
          <div class="fw-semibold text-black fs-6 text-wrap text-truncate mb-0">${item.tugas.judul}</div>
          <div class="text-muted small">Deadline: ${formatTanggalSingkat(item.tugas.deadline)}</div>
        </div>
      </div>
    `;
    })
    .join("");
}

// ==================== PROFIL PENGGUNA ====================
function renderProfilRingkas(user) {
  const container = document.getElementById("profilRingkas");
  if (!container) return;

  const fields = [
    { label: "Program Studi", value: user.prodi || "-", icon: "bi-book" },
    { label: "Fakultas", value: user.fakultas || "-", icon: "bi-building" },
    { label: "Angkatan", value: user.angkatan || "-", icon: "bi-calendar3" },
    { label: "Jenis Kelamin", value: user.jenisKelamin || "-", icon: "bi-gender-ambiguous" },
    { label: "Kontak", value: user.kontak || "-", icon: "bi-telephone" },
  ];

  container.innerHTML = /*html*/ `
    <div class="text-center mb-3">
      <div class="profil-avatar-mini d-flex flex-shrink-0 align-items-center justify-content-center mx-auto mb-2 fs-3 rounded-circle">
        ${user.profilePhoto ? `<img src="${user.profilePhoto}" alt="Avatar">` : '<i class="bi bi-person-fill"></i>'}
      </div>
      <div class="fw-bold text-black fs-6">${user.nama}</div>
      <div class="text-muted small">${user.nim}</div>
    </div>
    ${fields
      .map(
        (f) => /*html*/ `
        <div class="d-flex flex-wrap justify-content-between align-items-center p-2">
          <span class="text-muted small"><i class="bi ${f.icon} me-2"></i>${f.label}</span>
          <span class="fw-semibold small text-start text-md-end">${f.value}</span>
        </div>
      `,
      )
      .join("")}
    <div class="text-center mt-3">
      <a href="profil.html" class="btn btn-sm btn-outline-primary rounded-pill px-3">
        <i class="bi bi-pencil-square me-1"></i>Lihat Profil Lengkap
      </a>
    </div>
  `;
}

// ==================== NAVIGASI CEPAT (DOKUMEN) ====================

function isDokumenTersedia(jenis, programs) {
  switch (jenis) {
    case "mentor": {
      const d = programs.mentor;
      const jumlahSesi = d?.sesiMentoring?.length || 0;
      return d?.pendaftaranStatus?.status === STATUS_PENDAFTARAN_TERVERIFIKASI && d?.statusSeleksi === STATUS_SELEKSI_LOLOS && jumlahSesi >= MAX_SESI_MENTOR;
    }
    case "mentee": {
      const d = programs.mentee;
      return d?.pendaftaranStatus?.status === STATUS_PENDAFTARAN_TERVERIFIKASI && d?.statusHasil === STATUS_HASIL_LULUS;
    }
    case "tba": {
      const d = programs.tba;
      return d?.pendaftaranStatus?.status === STATUS_PENDAFTARAN_TERVERIFIKASI && d?.statusHasil === STATUS_HASIL_LULUS;
    }
    case "bibaq": {
      const d = programs.bibaq;
      return d?.pendaftaranStatus?.status === STATUS_PENDAFTARAN_TERVERIFIKASI && d?.statusHasil === STATUS_HASIL_LULUS;
    }
    case "berprestasi": {
      const d = programs.berprestasi;
      return d?.pendaftaranStatus?.status === STATUS_PENDAFTARAN_TERVERIFIKASI && d?.statusSeleksi === STATUS_SELEKSI_LOLOS;
    }
    default:
      return false;
  }
}

function getDokumenExtraInfo(jenis, programs) {
  switch (jenis) {
    case "tba":
      return `Nilai: ${programs.tba?.nilai ?? "-"}`;
    case "berprestasi":
      return programs.berprestasi?.statusHasil ?? "";
    case "mentee":
    case "bibaq":
      return "Status: Lulus";
    case "mentor":
      return "Status: Lolos Seleksi";
    default:
      return "";
  }
}

function renderNavigasiCepat(programs) {
  const container = document.getElementById("navigasiCepat");
  if (!container) return;

  container.innerHTML = DOKUMEN_LIST.map((item) => {
    const tersedia = isDokumenTersedia(item.jenis, programs);

    return /*html*/ `
      <div class="document-item d-flex align-items-center gap-1 py-2 flex-wrap">
        <div class="quick-icon-wrap quick-icon-${tersedia ? "success" : "secondary"} d-flex flex-shrink-0 align-items-center justify-content-center fs-6 rounded-4">
          <i class="bi ${item.icon}"></i>
        </div>
        <div class="flex-grow-1 min-w-0 flex-wrap">
          <div class="fw-semibold text-black fs-6">${item.label}</div>
        </div>
        <div class="d-flex gap-1 flex-shrink-0">
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            ${tersedia ? "" : "disabled"}
            onclick="cetakDokumenDashboard('${item.jenis}')"
            title="Cetak ${item.docType}"
            aria-label="Cetak ${item.label}">
            <i class="bi bi-printer"></i>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            ${tersedia ? "" : "disabled"}
            onclick="unduhDokumenDashboard('${item.jenis}')"
            title="Unduh ${item.docType}"
            aria-label="Unduh ${item.label}">
            <i class="bi bi-download"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function buildPrintableMarkup(item, programs, user) {
  const isMemo = item.docType === "Memo";
  const cardClass = isMemo ? "print-memo-card" : "print-certificate-card";
  const extra = getDokumenExtraInfo(item.jenis, programs);

  return /*html*/ `
    <div class="${cardClass}">
      <i class="bi ${isMemo ? "bi-file-earmark-text-fill" : "bi-award-fill"}"></i>
      <h4 class="print-title">${item.label}</h4>
      <p class="print-subtitle">${item.subtitle}</p>
      ${extra ? `<p class="print-extra">${extra}</p>` : ""}
      <p class="print-nama">${user.nama} (${user.nim})</p>
    </div>
  `;
}

window.cetakDokumenDashboard = function (jenis) {
  const user = checkAuth();
  if (!user) return;

  const programs = getAllProgramData(user.nim);
  const item = DOKUMEN_LIST.find((d) => d.jenis === jenis);

  if (!item || !isDokumenTersedia(jenis, programs)) {
    alert("Dokumen belum tersedia.");
    return;
  }

  alert(`${item.label} untuk ${user.nama} (${user.nim}) sedang dicetak`);
};

// Fungsi global untuk Unduh Dokumen dari Dashboard (Simulasi).
window.unduhDokumenDashboard = function (jenis) {
  const user = checkAuth();
  if (!user) return;

  const programs = getAllProgramData(user.nim);
  const item = DOKUMEN_LIST.find((d) => d.jenis === jenis);

  if (!item || !isDokumenTersedia(jenis, programs)) {
    alert("Dokumen belum tersedia.");
    return;
  }

  alert(`${item.label} untuk ${user.nama} (${user.nim}) sedang diunduh`);
};
