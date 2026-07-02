// sidebar.js - Module untuk mengelola sidebar dashboard

export function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const toggleBtn = document.getElementById("toggleBtn");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const menuItems = document.querySelectorAll(".menu-item");
  const mentoringMenu = document.getElementById("mentoringMenu");
  const mentoringSubmenu = document.getElementById("mentoringSubmenu");
  const submenuItems = document.querySelectorAll(".submenu-item");

  // Toggle Sidebar (Desktop)
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");

    // Close submenu when sidebar collapsed
    if (sidebar.classList.contains("collapsed")) {
      mentoringSubmenu.classList.remove("show");
      mentoringMenu.classList.remove("expanded");
    }
  });

  // Toggle Mentoring Submenu
  mentoringMenu.addEventListener("click", (e) => {
    e.preventDefault();
    mentoringSubmenu.classList.toggle("show");
    mentoringMenu.classList.toggle("expanded");
  });

  // Mobile Menu Toggle
  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
    sidebarOverlay.classList.toggle("active");
  });

  // Close sidebar when clicking overlay
  sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.remove("show");
    sidebarOverlay.classList.remove("active");
  });

  // Setup navigation untuk setiap menu
  setupNavigation();

  // Set active menu berdasarkan halaman saat ini
  setActiveMenuFromCurrentPage();

  // Handle menu item clicks
  menuItems.forEach((item) => {
    // Skip the mentoring menu (already handled)
    if (item.id === "mentoringMenu") return;

    item.addEventListener("click", (e) => {
      // Jika menu memiliki href yang valid (bukan # atau logout), biarkan navigasi berjalan
      const href = item.getAttribute("href");
      if (href && href !== "#" && !item.querySelector(".bi-box-arrow-right")) {
        // Navigasi akan terjadi secara otomatis
        return;
      }

      // Untuk menu tanpa href atau #, prevent default
      if (href === "#") {
        e.preventDefault();
      }

      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("show");
        sidebarOverlay.classList.remove("active");
      }
    });
  });

  // Handle submenu item clicks
  submenuItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      // Jika submenu memiliki href yang valid, biarkan navigasi berjalan
      const href = item.getAttribute("href");
      if (href && href !== "#") {
        // Navigasi akan terjadi secara otomatis
        return;
      }

      e.preventDefault();

      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("show");
        sidebarOverlay.classList.remove("active");
      }
    });
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("show");
      sidebarOverlay.classList.remove("active");
    }
  });

  // Tooltip functionality
  initTooltips();
}

// Fungsi untuk setup navigasi pada setiap menu
function setupNavigation() {
  // Mapping menu ke halaman
  const menuPages = {
    dashboard: "dashboard.html",
    mentor: "mentor.html",
    mentee: "mentee.html",
    tba: "tba.html",
    bibaq: "bibaq.html",
    seleksiberprestasi: "seleksiberprestasi.html",
    profil: "profil.html",
  };

  // Setup untuk menu utama
  document.querySelectorAll(".menu-item").forEach((item) => {
    const text = item.querySelector(".menu-text");
    if (!text) return;

    const menuText = text.textContent.trim().toLowerCase();

    // Menu Dashboard
    if (menuText === "dashboard") {
      item.setAttribute("href", menuPages.dashboard);
    }
    // Menu TBA
    else if (menuText === "tba") {
      item.setAttribute("href", menuPages.tba);
    }
    // Menu BIBAQ
    else if (menuText === "bibaq") {
      item.setAttribute("href", menuPages.bibaq);
    }
    // Menu Seleksi Berprestasi
    else if (menuText === "seleksi berprestasi") {
      item.setAttribute("href", menuPages.seleksiberprestasi);
    }
    // Menu Profil
    else if (menuText === "profil") {
      item.setAttribute("href", menuPages.profil);
    }
  });

  // Setup untuk submenu
  document.querySelectorAll(".submenu-item").forEach((item) => {
    const text = item.querySelector("span");
    if (!text) return;

    const submenuText = text.textContent.trim().toLowerCase();

    // Submenu Mentor
    if (submenuText === "mentor") {
      item.setAttribute("href", menuPages.mentor);
    }
    // Submenu Mentee
    else if (submenuText === "mentee") {
      item.setAttribute("href", menuPages.mentee);
    }
  });
}

// Fungsi untuk set active menu berdasarkan halaman saat ini
function setActiveMenuFromCurrentPage() {
  const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";

  // Remove active class dari semua menu
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active");
  });
  document.querySelectorAll(".submenu-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Mapping halaman ke menu
  const pageMenuMap = {
    "dashboard.html": "dashboard",
    "mentor.html": "mentor",
    "mentee.html": "mentee",
    "tba.html": "tba",
    "bibaq.html": "bibaq",
    "seleksiberprestasi.html": "seleksi berprestasi",
    "profil.html": "profil",
  };

  const activeMenuName = pageMenuMap[currentPage];

  if (!activeMenuName) return;

  // Cek apakah menu ada di submenu (Mentor atau Mentee)
  if (activeMenuName === "mentor" || activeMenuName === "mentee") {
    // Set active pada submenu item
    document.querySelectorAll(".submenu-item").forEach((item) => {
      const text = item.querySelector("span");
      if (text && text.textContent.trim().toLowerCase() === activeMenuName) {
        item.classList.add("active");
      }
    });

    // Set active pada parent menu (Mentoring)
    const mentoringMenu = document.getElementById("mentoringMenu");
    if (mentoringMenu) {
      mentoringMenu.classList.add("active");
      // Buka submenu secara default
      const mentoringSubmenu = document.getElementById("mentoringSubmenu");
      if (mentoringSubmenu) {
        mentoringSubmenu.classList.add("show");
        mentoringMenu.classList.add("expanded");
      }
    }
  } else {
    // Set active pada menu utama
    document.querySelectorAll(".menu-item").forEach((item) => {
      const text = item.querySelector(".menu-text");
      if (text && text.textContent.trim().toLowerCase() === activeMenuName) {
        item.classList.add("active");
      }
    });
  }
}

function initTooltips() {
  document.querySelectorAll(".menu-item, .submenu-item").forEach((item) => {
    const tooltip = item.querySelector(".menu-tooltip");
    if (!tooltip) return;

    item.addEventListener("mousemove", (e) => {
      if (window.innerWidth <= 768) {
        tooltip.style.opacity = 0;
        return;
      }
      const collapsed = document.getElementById("sidebar").classList.contains("collapsed");
      if (!collapsed) {
        tooltip.style.opacity = 0;
        return;
      }
      tooltip.style.top = e.clientY + "px";
      tooltip.style.left = "75px";
      tooltip.style.opacity = 1;
    });

    item.addEventListener("mouseleave", () => {
      tooltip.style.opacity = 0;
    });

    item.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        tooltip.style.opacity = 0;
      }
    });
  });
}
