// mentee2.js - Module Pendaftaran Mentee + Riwayat Program Mentoring
// Menggunakan ES6 Module, clean code, dan maintainable

import { checkAuth } from "./auth.js";
import { mentorData, kelompokData, basePresensi, materiTugasData } from "./datamentee.js";

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

// Ambang batas kehadiran untuk kelulusan (75%)
const AMBANG_KELULUSAN = 75;

const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Data presensi umum (sama untuk semua user)
function getPresensiData() {
  return [...basePresensi]; // Copy array agar tidak mutable
}

// Helper untuk menghitung statistik presensi
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
    return persentaseKehadiran >= AMBANG_KELULUSAN ? STATUS_HASIL.LULUS : STATUS_HASIL.TIDAK_LULUS;
  }
  return "-";
}

// ==================== DATA MANAGEMENT ====================

function getMenteeData(nim) {
  const data = sessionStorage.getItem(`menteeData_${nim}`);
  return data ? JSON.parse(data) : null;
}

function saveMenteeData(menteeData) {
  sessionStorage.setItem(`menteeData_${menteeData.nim}`, JSON.stringify(menteeData));
}

function initializeMenteeData(user) {
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
    persentaseKehadiran: 0,
  };
}

// ==================== RENDER PENDAFTARAN ====================

function renderPendaftaran(menteeData) {
  const statusArea = document.getElementById("registrationStatusArea");
  const buttonArea = document.getElementById("registrationButtonArea");
  const formArea = document.getElementById("formPendaftaranArea");

  if (!statusArea || !buttonArea || !formArea) return;

  const btnDaftar = document.getElementById("btnDaftar");

  if (menteeData.pendaftaranStatus?.status) {
    statusArea.innerHTML = menteeData.pendaftaranStatus.html;
    formArea.style.display = "none";
    buttonArea.style.display = "block";

    if (btnDaftar) {
      btnDaftar.disabled = true;
      btnDaftar.innerHTML = `Daftar Mentee`;
    }
  } else {
    statusArea.innerHTML = `
      <div class="alert alert-info mb-4 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-info-circle-fill me-2 fs-5"></i>Informasi Pendaftaran</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Silakan isi data diri Anda untuk mendaftar pada Program Mentoring 
          tahun ajaran ${TAHUN_AJARAN_SEKARANG}.
        </p>
      </div>
    `;

    buttonArea.style.display = "block";
    formArea.style.display = "none";

    if (btnDaftar) {
      btnDaftar.disabled = false;
      btnDaftar.innerHTML = `Daftar Mentee`;
    }
  }
}

// ==================== RENDER MENTOR & KELOMPOK ====================
function renderMentorKelompok(menteeData, user) {
  const container = document.getElementById("mentorKelompokContent");
  if (!container) return;

  if (!menteeData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-people-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Mentoring. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  if (menteeData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning "></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  // Jika status pendaftaran ditolak
  if (menteeData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  const mentor = mentorData[0];

  let html = `
  <div class="mentor-card p-3 rounded-4 mb-4">
    <h5 class=" fs-5 text-white fw-semibold mb-2"><i class="bi bi-person-video2 me-2 fs-5"></i>Mentor Pembimbing</h5>
    <div class="fs-6 text-white mb-1"><span>NIM: ${mentor.nim}</span></div>
    <div class="fs-6 text-white mb-1"><span>Nama: ${mentor.nama}</span></div>
    <div class="fs-6 text-white mb-1"><span>Fakultas: ${mentor.fakultas}</span></div>
    <div class="fs-6 text-white mb-1"><span>Program Studi: ${mentor.prodi}</span></div>
    <div class="fs-6 text-white"><span>Kontak: ${mentor.kontak}</span></div>
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

  kelompokData.forEach((anggota) => {
    html += `
      <tr>
        <td>${anggota.no}</td>
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

function renderPresensi(menteeData) {
  const container = document.getElementById("presensiContent");
  if (!container) return;

  //Jika belum melakukan pendaftaran atau status pendaftaran "-", null, " ", dan undefined
  if (!menteeData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-calendar-check-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Mentoring. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  //Jika status pendaftaran belum diverifikasi
  if (menteeData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning"></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  //Jika status pendaftaran ditolak
  if (menteeData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
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
          <h5 class="text-danger fs-5 fw-semibold">Alpha</h5>
          <p class="mb-0 fs-4 fs-medium text-danger">${stats.alpha}</p>
        </div>
      </div>
      <div class="col-md-3 col-6 mb-2 p-1">
        <div class="presensi-card p-3 rounded-4 border-start border-2 border-info">
          <h5 class="text-info fs-5 fw-semibold">Belum Dilaksanakan</h5>
          <p class="mb-0 fs-4 fs-medium text-info">${stats.belum}</p>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <h5 class="fs-5 fw-semibold text-black">Persentase Kehadiran</h5>
      <div class="rounded-4 overflow-hidden">
        <div class="progress-bar d-flex align-items-center justify-content-center bg-success fs-6 fw-semibold text-white" role="progressbar" 
             style="width: ${stats.persentaseKehadiran}%" 
             aria-valuenow="${stats.persentaseKehadiran}" 
             aria-valuemin="0" aria-valuemax="100">
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
        <td>${presensi.keterangan || "-"}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

// ==================== RENDER MATERI & TUGAS ====================

function renderMateriTugas(menteeData, user) {
  const container = document.getElementById("materiTugasContent");
  if (!container) return;

  // Jika belum melakukan pendaftaran atau status pendaftaran "-", null, " ", dan undefined
  if (!menteeData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-journal-text mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Mentoring. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  // Jika status pendaftaran belum diverifikasi
  if (menteeData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning"></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  // Jika status pendaftaran ditolak
  if (menteeData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  let html = `<div class="accordion-custom">`;

  materiTugasData.forEach((item, index) => {
    const tugasKey = `tugas_${user.nim}_pertemuan_${item.pertemuan}`;
    let savedFileName = sessionStorage.getItem(tugasKey);
    const feedbackKey = `feedback_${user.nim}_pertemuan_${item.pertemuan}`;
    let savedFeedback = sessionStorage.getItem(feedbackKey);

    if (!savedFileName && item.tugas?.sudahDikumpulkan) {
      savedFileName = item.tugas.fileTugas;
      sessionStorage.setItem(tugasKey, savedFileName); // simpan ke sessionStorage
    }

    const dummyFeedback = item.feedback?.isi?.trim();
    if (!savedFeedback && dummyFeedback) {
      savedFeedback = dummyFeedback;
      sessionStorage.setItem(feedbackKey, dummyFeedback); // simpan agar konsisten
    }

    html += `
      <div class="accordion-item rounded-4 mb-3">
        <h5 class="accordion-header">
          <button class="accordion-button ${index === 0 ? "" : "collapsed"}" type="button" data-bs-toggle="collapse" data-bs-target="#materi${item.pertemuan}">
            Pertemuan ${item.pertemuan} - ${item.judul}
          </button>
        </h5>

        <div id="materi${item.pertemuan}" class="accordion-collapse collapse ${index === 0 ? "show" : ""}">
          <div class="accordion-body p-3">
            <p class="fs-6 text-black">${item.deskripsi}</p>

            <!-- Materi Pembelajaran -->
            ${
              item.materiFiles?.length
                ? `
              <h5 class="fs-5 text-black fw-semibold mb-2">Materi Pembelajaran</h5>
              <div class="mb-3">
                ${item.materiFiles
                  .map(
                    (file) => `
                  <a href="${file.url}" class="file-link" target="_blank">
                    ${file.nama}
                  </a><br>
                `,
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            ${
              item.tugas
                ? `
              <div class="tugas-card p-3 border rounded mb-3">
                <h5 class="fs-5 text-black fw-semibold mb-3">Tugas: ${item.tugas.judul}</h5>
                <p class="fs-6 text-black fw-normal m-0">${item.tugas.deskripsi}</p>
                <p class="deadline fw-normal mb-2">Deadline: ${formatTanggal(item.tugas.deadline)}</p>

                ${
                  savedFileName
                    ? `
                  <div class="alert alert-success d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <span class="fs-6 text-black"><i class="bi bi-check-circle-fill"></i> Tugas sudah dikumpulkan: <strong>${savedFileName}</strong></span>
                    <div>
                      <button class="btn btn-sm btn-outline-success me-2" onclick="viewTugas('${savedFileName}')">
                        <i class="bi bi-eye"></i> Lihat File
                      </button>
                      <button class="btn btn-sm btn-outline-primary" onclick="replaceTugas(${item.pertemuan}, '${user.nim}')">
                        <i class="bi bi-arrow-repeat"></i> Ganti File
                      </button>
                    </div>
                  </div>
                `
                    : `
                  <div class="upload-area rounded-4 p-5 text-center" style="cursor:pointer" onclick="document.getElementById('uploadInput${item.pertemuan}').click()">
                    <i class="bi bi-cloud-upload mb-4"></i>
                    <p class="fs-6 fw-normal m-0">Klik untuk mengumpulkan tugas</p>
                    <input type="file" id="uploadInput${item.pertemuan}" class="d-none" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4">
                  </div>
                `
                }
              </div>
            `
                : ""
            }

            <div>
              <h5 class="fs-5 text-black fw-semibold mb-2">Feedback Anda</h5>
              ${
                savedFeedback
                  ? `
                <div class="alert alert-info fs-6 text-black fw-normal">${savedFeedback}</div>
              `
                  : `
                <textarea id="feedbackText${item.pertemuan}" class="form-control fs-6 text-black" rows="3" placeholder="Tuliskan feedback Anda..."></textarea>
                <button class="btn btn-primary fs-6 fw-normal px-3 py-2 mt-2" onclick="submitFeedback(${item.pertemuan}, '${user.nim}')">Kirim Feedback</button>
              `
              }
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;

  // Event listener upload
  materiTugasData.forEach((item) => {
    const input = document.getElementById(`uploadInput${item.pertemuan}`);
    if (input) {
      input.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          const fileName = e.target.files[0].name;
          const tugasKey = `tugas_${user.nim}_pertemuan_${item.pertemuan}`;
          sessionStorage.setItem(tugasKey, fileName);
          alert(`Tugas Pertemuan ${item.pertemuan} berhasil dikumpulkan!`);
          renderMateriTugas(menteeData, user);
        }
      });
    }
  });
}

// Fungsi global untuk melihat file tugas
window.viewTugas = function (fileName) {
  alert(`Membuka file: ${fileName}`);
};

// Fungsi global untuk mengganti file
window.replaceTugas = function (pertemuan, nim) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4";
  input.onchange = (e) => {
    if (e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      const tugasKey = `tugas_${nim}_pertemuan_${pertemuan}`;
      sessionStorage.setItem(tugasKey, fileName);
      alert(`Tugas Pertemuan ${pertemuan} berhasil diganti!\nFile baru: ${fileName}`);
      renderMateriTugas(getMenteeData(nim), { nim });
    }
  };
  input.click();
};

// Fungsi submit feedback
window.submitFeedback = function (pertemuan, nim) {
  const textarea = document.getElementById(`feedbackText${pertemuan}`);
  if (!textarea) return;
  const text = textarea.value.trim();
  if (!text) {
    alert("Mohon isi feedback terlebih dahulu.");
    return;
  }
  const feedbackKey = `feedback_${nim}_pertemuan_${pertemuan}`;
  sessionStorage.setItem(feedbackKey, text);
  alert("Feedback berhasil disimpan!");
  renderMateriTugas(getMenteeData(nim), { nim });
};

// ==================== RENDER HASIL (SERTIFIKAT) ====================

function renderHasil(menteeData, user) {
  const container = document.getElementById("sertifikatMenteeContent");
  if (!container) return;

  // Jika belum melakukan pendaftaran atau status pendaftaran "-", null, " ", dan undefined
  if (!menteeData.pendaftaranStatus) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4">
        <i class="bi bi-award-fill mb-3"></i>
        <p class="m-0 fs-6">Anda belum terdaftar pada Program Mentoring. Silakan lakukan pendaftaran terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  // Jika status pendaftaran belum diverifikasi
  if (menteeData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.BELUM_DIVERIFIKASI) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-warning bg-light-warning">
      <i class="bi bi-hourglass-split mb-3 text-warning"></i>
      <h5 class="fw-semibold text-warning fs-5">Pendaftaran Sedang Diproses</h5>
    </div>
    `;
    return;
  }

  // Jika status pendaftaran ditolak
  if (menteeData.pendaftaranStatus?.status === STATUS_PENDAFTARAN.DITOLAK) {
    container.innerHTML = `
    <div class="empty-state p-5 text-center rounded-4 border border-danger">
      <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
      <h5 class="fw-semibold text-danger fs-5">Pendaftaran Ditolak</h5>
    </div>
    `;
    return;
  }

  // Jika status pelaksanaan berjalan
  if (menteeData.statusPelaksanaan === STATUS_PELAKSANAAN.BERJALAN) {
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4 border border-warning">
        <i class="bi bi-hourglass-split text-warning mb-3"></i>
        <h5 class="fw-semibold text-warning fs-5">Program Mentoring Sedang Berjalan</h5>
      </div>
    `;
    return;
  }

  if (menteeData.statusHasil === STATUS_HASIL.LULUS) {
    container.innerHTML = `
      <div class="certificate-card d-flex flex-column align-items-center justify-content-center rounded-4 p-5 text-white text-center overflow-hidden">
        <i class="bi bi-award-fill"></i>
        <h4 class="mb-0 fs-4 fw-bold">Sertifikat Kelulusan</h4>
        <p class="mb-2">Program Mentoring Kemuhammadiyahan</p>
    
        <div class="d-flex gap-2 align-items-center justify-content-center mt-3">
          <button class="btn btn-primary btn-lg fs-5 fw-semibold" onclick="printCertificate('${user.nama}', '${user.nim}')">Cetak Sertifikat</button>
          <button class="btn btn-primary btn-lg fs-5 fw-semibold" onclick="downloadCertificate('${user.nama}', '${user.nim}')">Download Sertifikat</button>
        </div>
      </div>
    `;
  } else {
    // Tidak Lulus
    container.innerHTML = `
      <div class="empty-state p-5 text-center rounded-4 border border-danger">
        <i class="bi bi-x-circle-fill mb-3 text-danger"></i>
        <p class="m-0 fs-5 fw-semibold text-danger">Tidak Lulus</p>
        <p class="m-0 fs-6 text-muted mt-2">
          Tingkat kehadiran Anda (${menteeData.persentaseKehadiran}%) belum memenuhi syarat minimal 
          ${AMBANG_KELULUSAN}%. Anda wajib mengikuti kembali program pada tahun berikutnya.
        </p>
      </div>
    `;
  }
}

// Fungsi Cetak Sertifikat
window.printCertificate = function (nama, nim) {
  alert(`Sertifikat untuk ${nama} (${nim}) sedang dicetak)`);
};

// Fungsi Download Sertifikat (Simulasi)
window.downloadCertificate = function (nama, nim) {
  alert(`Sertifikat untuk ${nama} (${nim}) sedang diunduh)`);
  // Di produksi bisa menggunakan html2canvas + jsPDF
};

// ==================== HANDLE SUBMIT PENDAFTARAN ====================

function handlePendaftaranSubmit(menteeData, user) {
  const namaLengkap = document.getElementById("namaLengkap").value.trim();
  const nimPendaftaran = document.getElementById("nimPendaftaran").value.trim();
  const jenisKelamin = document.getElementById("jenisKelamin").value;
  const fakultas = document.getElementById("fakultas").value.trim();
  const prodi = document.getElementById("prodi").value.trim();
  const angkatan = document.getElementById("angkatan").value.trim();
  const kontak = document.getElementById("kontak").value.trim();

  if (!namaLengkap || !nimPendaftaran || !jenisKelamin || !fakultas || !prodi || !angkatan || !kontak) {
    alert("Mohon lengkapi semua field yang wajib diisi.");
    return;
  }

  const tanggalSekarang = new Date().toISOString().split("T")[0];

  // Update data mentee
  menteeData.nama = namaLengkap;
  menteeData.nim = nimPendaftaran;
  menteeData.jenisKelamin = jenisKelamin;
  menteeData.fakultas = fakultas;
  menteeData.prodi = prodi;
  menteeData.angkatan = angkatan;
  menteeData.kontak = kontak;

  const statusPendaftaranBaru = STATUS_PENDAFTARAN.TERVERIFIKASI;
  let statusHtml = "";

  if (statusPendaftaranBaru === STATUS_PENDAFTARAN.TERVERIFIKASI) {
    statusHtml = `
    <div class="alert alert-success mb-2 p-3 rounded-4">
        <h5 class="fs-5 text-black fw-semibold mb-2"><i class="bi bi-check-circle-fill me-2 fs-5"></i>Pendaftaran Terverifikasi</h5>
        <p class="m-0 fs-6 fw-normal text-black">
          Selamat ${namaLengkap}! Pendaftaran Anda pada Program Mentoring tahun ajaran 
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
          Pendaftaran Anda pada Program Mentoring tahun ajaran
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
          Maaf ${namaLengkap}, Pendaftaran Anda pada Program Mentoring tahun ajaran 
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

  menteeData.pendaftaranStatus = {
    status: statusPendaftaranBaru,
    html: statusHtml,
  };

  const stats = hitungStatistikPresensi(getPresensiData());
  menteeData.statusPelaksanaan = STATUS_PELAKSANAAN.SELESAI;
  menteeData.statusHasil = hitungHasilKelulusan(statusPendaftaranBaru, menteeData.statusPelaksanaan, stats.persentaseKehadiran);
  menteeData.persentaseKehadiran = stats.persentaseKehadiran;

  // Simpan ke sessionStorage
  saveMenteeData(menteeData);

  // Render ulang semua section
  renderPendaftaran(menteeData);
  renderMentorKelompok(menteeData, user);
  renderPresensi(menteeData);
  renderMateriTugas(menteeData, user);
  renderHasil(menteeData, user);

  // Scroll ke status pendaftaran
  document.getElementById("registrationStatusArea").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ==================== EVENT LISTENERS ====================

function setupPendaftaranListeners(menteeData, user) {
  // Tombol Daftar Sekarang
  const btnDaftar = document.getElementById("btnDaftar");
  if (btnDaftar) {
    btnDaftar.addEventListener("click", () => {
      document.getElementById("formPendaftaranArea").style.display = "block";
      document.getElementById("registrationButtonArea").style.display = "none";
    });
  }

  // Tombol Batal
  const btnBatal = document.getElementById("btnBatal");
  if (btnBatal) {
    btnBatal.addEventListener("click", () => {
      document.getElementById("formPendaftaranArea").style.display = "none";
      document.getElementById("registrationButtonArea").style.display = "block";
      document.getElementById("formPendaftaran").reset();
    });
  }

  // Form Submit
  const form = document.getElementById("formPendaftaran");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handlePendaftaranSubmit(menteeData, user);
    });
  }
}

// ==================== INIT FUNCTION ====================

export function initMentee2() {
  const user = checkAuth();
  if (!user) return;

  let menteeData = getMenteeData(user.nim);

  if (!menteeData) {
    menteeData = initializeMenteeData(user);
    saveMenteeData(menteeData);
  }

  // Render Pendaftaran & Riwayat
  renderPendaftaran(menteeData);
  renderMentorKelompok(menteeData, user);
  renderPresensi(menteeData);
  renderMateriTugas(menteeData, user);
  renderHasil(menteeData, user);

  // Setup listeners
  setupPendaftaranListeners(menteeData, user);
}
