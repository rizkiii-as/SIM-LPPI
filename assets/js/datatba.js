// datatba.js - Data dummy untuk fitur TBA (Tes Baca Al-Quran)

// Data Penguji TBA
export const pengujiData = [
  {
    id: 1,
    nama: "Dr. Asep Daud Kosasih, S.Pd., M.Ag",
    fakultas: "Keguruan dan Ilmu Pendidikan",
    prodi: "Pendidikan Sejarah",
    kontak: "081249823041",
  },
  {
    id: 2,
    nama: "Dr. Wage, M.Ag",
    fakultas: "Agama Islam",
    prodi: "Hukum Ekonomi Syariah",
    kontak: "081377219054",
  },
  {
    id: 3,
    nama: "Firdaus, M.Pd",
    fakultas: "Agama Islam",
    prodi: "Pendidikan Agama Islam",
    kontak: "085211348892",
  },
  {
    id: 4,
    nama: "Arian Sahidi, M.Pd",
    fakultas: "Agama Islam",
    prodi: "Pendidikan Agama Islam",
    kontak: "081755401293",
  },
  {
    id: 5,
    nama: "Bayu Dwi Cahyono, M.Pd",
    fakultas: "Agama Islam",
    prodi: "Pendidikan Agama Islam",
    kontak: "081933027741",
  },
];

// Data Jadwal TBA berdasarkan jenis kelamin
export const jadwalData = [
  {
    id: 1,
    waktu: "08:00 - 12:00 WIB",
    hari: "Senin",
    tanggal: "2026-12-22",
    tempat: "Auditorium Ukhuwah Islamiyah",
    penguji: pengujiData[0],
  },
];

// Kriteria penilaian TBA
export const kriteriaPenilaian = [
  {
    id: 1,
    kode: "L/A",
    label: "Lulus dengan Nilai A",
    deskripsi: "Mampu membaca dengan Lancar, Baik, dan Benar",
    kriteria: ["Fawatihus suwar", "Makhraj huruf", "Hukum Bacaan", "Panjang Pendek"],
    badgeClass: "success",
  },
  {
    id: 2,
    kode: "L/B",
    label: "Lulus dengan Nilai B",
    deskripsi: "Mampu membaca dengan Lancar dan Benar",
    kriteria: ["Panjang pendek", "Makhraj huruf"],
    badgeClass: "success",
  },
  {
    id: 3,
    kode: "TL/1",
    label: "Tidak Lulus - TL/1",
    deskripsi: "Sama sekali tidak bisa membaca",
    kriteria: [],
    badgeClass: "danger",
  },
  {
    id: 4,
    kode: "TL/2",
    label: "Tidak Lulus - TL/2",
    deskripsi: "Tidak mengenal huruf dengan baik",
    kriteria: [],
    badgeClass: "danger",
  },
  {
    id: 5,
    kode: "TL/3",
    label: "Tidak Lulus - TL/3",
    deskripsi: "Panjang pendek dan harokat",
    kriteria: [],
    badgeClass: "danger",
  },
  {
    id: 6,
    kode: "TL/4",
    label: "Tidak Lulus - TL/4",
    deskripsi: "Waqaf (Berhenti & Mulai)",
    kriteria: [],
    badgeClass: "danger",
  },
  {
    id: 7,
    kode: "TL/5",
    label: "Tidak Lulus - TL/5",
    deskripsi: "Kurang lancar dan tidak benar",
    kriteria: [],
    badgeClass: "danger",
  },
];
