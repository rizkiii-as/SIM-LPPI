// databerprestasi.js - Data dummy untuk fitur Seleksi Berprestasi

export const pemenangData = {
  // Set untuk user yang mendaftar sebagai Mentor
  pemenangMentor: {
    mentor: [
      { rank: 1, nim: "2003040065", nama: "Rizki Abdilah S", fakultas: "Teknik dan Sains", prodi: "Teknik Informatika" },
      { rank: 2, nim: "1903040025", nama: "Siti Aisyah Putri", fakultas: "Agama Islam", prodi: "Pendidikan Agama Islam" },
      { rank: 3, nim: "1903040038", nama: "Budi Santoso", fakultas: "Ekonomi dan Bisnis", prodi: "Manajemen" },
    ],
    mentee: [
      { rank: 1, nim: "2003040089", nama: "Dewi Lestari", fakultas: "Keguruan dan Ilmu Pendidikan", prodi: "Pendidikan Bahasa Inggris" },
      { rank: 2, nim: "2003040102", nama: "Eko Prasetyo", fakultas: "Teknik dan Sains", prodi: "Teknik Elektro" },
      { rank: 3, nim: "2003040115", nama: "Fitri Handayani", fakultas: "Kesehatan", prodi: "Keperawatan" },
    ],
  },

  // Set untuk user yang mendaftar sebagai Mentee
  pemenangMentee: {
    mentor: [
      { rank: 1, nim: "2103040012", nama: "Ahmad Fauzi", fakultas: "Teknik dan Sains", prodi: "Teknik Sipil" },
      { rank: 2, nim: "2103040023", nama: "Nurul Hidayah", fakultas: "Agama Islam", prodi: "Pendidikan Agama Islam" },
      { rank: 3, nim: "2103040034", nama: "Dian Pratama", fakultas: "Ekonomi dan Bisnis", prodi: "Akuntansi" },
    ],
    mentee: [
      { rank: 1, nim: "2103040045", nama: "Sinta Wulandari", fakultas: "Keguruan dan Ilmu Pendidikan", prodi: "Pendidikan Matematika" },
      { rank: 2, nim: "2103040056", nama: "Rafi Setiawan", fakultas: "Teknik dan Sains", prodi: "Teknik Informatika" },
      { rank: 3, nim: "2103040067", nama: "Laras Ayu", fakultas: "Kesehatan", prodi: "Farmasi" },
    ],
  },
};

// Tahapan seleksi
export const tahapanSeleksi = [
  {
    id: 1,
    tahap: "Pendaftaran",
    tanggal: "1-15 Agustus 2025",
    keterangan: "Pendaftaran berhasil diverifikasi",
  },
  {
    id: 2,
    tahap: "Seleksi Tes Tulis",
    tanggal: "20 Agustus 2025",
    tempat: "Gedung LPPI UMP Lantai 2",
    waktu: "09:00 - 11:00 WIB",
  },
  {
    id: 3,
    tahap: "Wawancara",
    tanggal: "25 Agustus 2025",
    tempat: "Gedung LPPI UMP Lantai 3",
    waktu: "13:00 - 17:00 WIB",
  },
  {
    id: 4,
    tahap: "Seleksi FGD",
    tanggal: "28 Agustus 2025",
    tempat: "Gedung LPPI UMP Ruang Seminar",
    waktu: "09:00 - 15:00 WIB",
  },
  {
    id: 5,
    tahap: "Pengumuman Akhir",
    tanggal: "1 September 2025",
  },
];
