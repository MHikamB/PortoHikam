// Ambil elemen DOM
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const canvas = document.getElementById('three-canvas');
const homeContactButton = document.getElementById('home-contact-button');
const homeMainButton = document.getElementById('home-main-button');
const navbar = document.getElementById('navbar');
const profileBorder = document.getElementById('profile-border');
const navLinks = document.querySelectorAll('.nav-link'); // Semua link navigasi

// Ambil semua elemen yang terpengaruh untuk tema
const linkTexts = document.querySelectorAll('.link-text');
const skillIcons = document.querySelectorAll('.skill-icon');
const projectCards = document.querySelectorAll('.project-card');
const projectTitles = document.querySelectorAll('.project-title');
const projectButtons = document.querySelectorAll('.project-button');
const contactIconsBg = document.querySelectorAll('.contact-icon-bg');
const contactLinks = document.querySelectorAll('.contact-link');
const titles = [
    document.getElementById('about-title'),
    document.getElementById('education-title'),
    document.getElementById('skills-title'),
    document.getElementById('projects-title'),
    document.getElementById('contact-title'),
];


// --- 3D ANIMATION SETUP (THREE.JS) ---
let scene, camera, renderer;
let particles = [];
let particleGeometry, particleMaterial;
let lineGeometry, lineMaterial;
let lineMesh;
const NUM_PARTICLES = 300;
const PARTICLE_RANGE = 400; // Jangkauan partikel

function init3D() {
    // 1. Scene
    scene = new THREE.Scene();

    // 2. Camera (Perspektif)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 250;

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // 4. Particle Setup
    particleGeometry = new THREE.BufferGeometry();
    const positions = [];
    const particleData = [];
    
    for (let i = 0; i < NUM_PARTICLES; i++) {
        const x = (Math.random() - 0.5) * PARTICLE_RANGE * 2;
        const y = (Math.random() - 0.5) * PARTICLE_RANGE * 2;
        const z = (Math.random() - 0.5) * PARTICLE_RANGE * 2;
        positions.push(x, y, z);
        
        particleData.push({ 
            x: x, 
            y: y, 
            z: z, 
            vx: Math.random() * 0.1 - 0.05,
            vy: Math.random() * 0.1 - 0.05,
            vz: Math.random() * 0.1 - 0.05,
            pulse: Math.random() * 2 * Math.PI
        });
    }

    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particles = particleData; 

    // Material Partikel (Akan diperbarui oleh fungsi tema)
    particleMaterial = new THREE.PointsMaterial({
        color: 0x00ffff, 
        size: 2.5,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    const points = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(points);

    // Garis Penghubung (Akan diperbarui oleh fungsi tema)
    lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff, 
        opacity: 0.15,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        linewidth: 1
    });
    lineGeometry = new THREE.BufferGeometry();
    lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);
}

// Fungsi untuk menggerakkan partikel dan menggambar garis (koneksi)
function updateLines() {
    const maxDistance = 70;
    const tempLines = [];
    const positions = particleGeometry.attributes.position.array;

    for (let i = 0; i < NUM_PARTICLES; i++) {
        const xi = positions[i * 3];
        const yi = positions[i * 3 + 1];
        const zi = positions[i * 3 + 2];
        
        particles[i].pulse += 0.05;
        
        // Gerakan partikel
        positions[i * 3] += particles[i].vx * 0.1;
        positions[i * 3 + 1] += particles[i].vy * 0.1;
        positions[i * 3 + 2] += particles[i].vz * 0.1;
        
        // Batas ruang
        if (Math.abs(positions[i * 3]) > PARTICLE_RANGE) particles[i].vx *= -1;
        if (Math.abs(positions[i * 3 + 1]) > PARTICLE_RANGE) particles[i].vy *= -1;
        if (Math.abs(positions[i * 3 + 2]) > PARTICLE_RANGE) particles[i].vz *= -1;
        
        // Periksa koneksi dengan partikel lain
        for (let j = i + 1; j < NUM_PARTICLES; j++) {
            const xj = positions[j * 3];
            const yj = positions[j * 3 + 1];
            const zj = positions[j * 3 + 2];

            const dx = xi - xj;
            const dy = yi - yj;
            const dz = zi - zj;
            const distanceSq = dx * dx + dy * dy + dz * dz;

            if (distanceSq < maxDistance * maxDistance) {
                // Tambahkan koordinat untuk garis
                tempLines.push(xi, yi, zi, xj, yj, zj);
            }
        }
    }
    
    // Perbarui geometri
    particleGeometry.attributes.position.needsUpdate = true;
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tempLines, 3));
    lineGeometry.attributes.position.needsUpdate = true;
}

// Loop Animasi
function animate() {
    requestAnimationFrame(animate);

    // Rotasi Scene lambat
    scene.rotation.y += 0.0005;
    scene.rotation.x += 0.0002;

    updateLines();

    renderer.render(scene, camera);
}

// Tangani perubahan ukuran jendela
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);


// --- THEME LOGIC (Mengganti warna 3D dan UI) ---

function updateUIColors(theme) {
    const isDark = theme === 'dark-theme';
    
    // Define Colors based on Theme
    const neonColor = '#00ffff';      // Warna Neon untuk Dark Theme
    const darkAccent = '#1a202c';     // Warna Hitam/Gelap untuk Light Theme
    const primaryDarkText = isDark ? '#e2e8f0' : '#1a202c'; // Warna Teks Utama

    const currentAccentColor = isDark ? neonColor : darkAccent;
    const currentHoverColor = isDark ? 'hover:text-accent-neon' : 'hover:text-accent-dark';
    const currentRingColor = isDark ? 'ring-accent-neon' : 'ring-accent-dark';
    const currentButtonBg = isDark ? 'bg-accent-neon' : 'bg-accent-dark';
    const currentButtonHoverBg = isDark ? 'hover:bg-cyan-500' : 'hover:bg-gray-700';
    const currentButtonText = isDark ? 'text-primary-dark' : 'text-primary-light';
    
    // 1. Update kelas navbar dan footer background/color
    navbar.classList.remove('dark-theme', 'light-theme');
    navbar.classList.add(theme);

    projectCards.forEach(card => {
        card.classList.remove('dark-theme', 'light-theme', 'hover:ring-accent-neon', 'hover:ring-accent-dark');
        card.classList.add(theme);
        // Atur ulang ring hover Tailwind secara manual (atau pakai CSS custom)
        if(isDark) {
            card.classList.add('hover:ring-accent-neon');
        } else {
            card.classList.add('hover:ring-accent-dark');
        }
    });

    const footer = document.getElementById('footer');
    footer.style.backgroundColor = isDark ? '#0f172a' : '#f7fafc';
    footer.style.color = isDark ? '#cbd5e0' : '#4a5568';
    
    // 2. Nav Brand & Profile Border
    document.getElementById('nav-brand-text').style.color = currentAccentColor;
    profileBorder.style.borderColor = isDark ? 'rgba(0, 255, 255, 0.5)' : currentAccentColor;


    // 3. Home Section Subtitle
    const homeSubtitle = document.getElementById('home-subtitle');
    if (homeSubtitle) {
         homeSubtitle.style.color = currentAccentColor;
    }

    // 4. Home Main Button (Kenali Saya Lebih Lanjut)
    // Hapus kelas lama
    homeMainButton.classList.remove('bg-accent-neon', 'text-primary-dark', 'hover:bg-cyan-500', 'bg-accent-dark', 'text-primary-light', 'hover:bg-gray-700');
    // Tambah kelas baru
    homeMainButton.classList.add(currentButtonBg, currentButtonText, currentButtonHoverBg);

    // 5. Home Contact Button (Hubungi Saya)
    homeContactButton.style.color = currentAccentColor;
    homeContactButton.style.borderColor = currentAccentColor;
    
    // 6. Navigation Links & Contact Links
    navLinks.forEach(link => {
        // Hapus hover lama (kelas link-text tidak ada lagi di link <a>, tapi dipertahankan untuk elemen lain)
        link.classList.remove('hover:text-accent-neon', 'hover:text-accent-dark');
        // Tambah hover baru
        link.classList.add(currentHoverColor);
    });
    contactLinks.forEach(link => {
        link.classList.remove('hover:text-accent-neon', 'hover:text-accent-dark');
        link.classList.add(currentHoverColor);
        link.style.color = currentAccentColor;
    });

    // 7. Section Titles, Skill Icons, Project Titles, Project Buttons, Contact Icons
    const accentElements = [...titles, ...skillIcons, ...projectTitles];
    
    accentElements.forEach(el => {
        if (el) {
            el.style.color = currentAccentColor;
        }
    });

    // Project Buttons (Tombol "Lihat Detail")
    projectButtons.forEach(btn => {
        btn.classList.remove('bg-accent-neon', 'text-primary-dark', 'hover:bg-cyan-500', 'bg-accent-dark', 'text-primary-light', 'hover:bg-gray-700');
        btn.classList.add(currentButtonBg, currentButtonText, currentButtonHoverBg);
    });

    // Contact Icons Background (Circle)
    contactIconsBg.forEach(iconBg => {
        iconBg.classList.remove('bg-accent-neon', 'text-primary-dark', 'bg-accent-dark', 'text-primary-light');
        iconBg.classList.add(currentButtonBg, currentButtonText); // Gunakan skema warna tombol
    });
    
    // 8. Tombol Tema (Update warna ring offset)
    themeToggle.style.color = isDark ? primaryDarkText : currentAccentColor;
    themeToggle.style.backgroundColor = isDark ? '#4a5568' : '#e2e8f0';
    themeToggle.style.setProperty('--tw-ring-offset-color', isDark ? '#0f172a' : '#ffffff');


    // 9. Animasi 3D
    if (particleMaterial && lineMaterial) {
        if (isDark) {
            // Dark Theme: Neon Cyan, Visibilitas Penuh
            particleMaterial.color.setHex(0x00ffff);
            particleMaterial.opacity = 1.0;
            lineMaterial.color.setHex(0x00ffff);
            lineMaterial.opacity = 0.15;
        } else {
            // Light Theme: Accent Dark (Black), Opasitas diatur
            const darkHex = parseInt(darkAccent.replace('#', ''), 16);
            particleMaterial.color.setHex(darkHex); 
            particleMaterial.opacity = 0.7; 
            lineMaterial.color.setHex(darkHex); 
            lineMaterial.opacity = 0.10;
        }
        particleMaterial.needsUpdate = true;
        lineMaterial.needsUpdate = true;
    }
}


function applyTheme(theme) {
    // Ganti kelas body
    body.classList.remove('dark-theme', 'light-theme');
    body.classList.add(theme);
    localStorage.setItem('theme', theme);

    // Ganti ikon
    if (theme === 'dark-theme') {
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    } else {
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    }
    
    updateUIColors(theme);
}

// --- LOGIKA STATUS AKTIF (GARIS BAWAH) ---

/**
 * Menambahkan atau menghapus kelas 'active' pada tautan navigasi.
 * @param {string | null} activeId - ID bagian yang sedang aktif (contoh: 'about').
 */
function setActiveNav(activeId) {
    navLinks.forEach(link => {
        if (link.dataset.section === activeId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Siapkan Intersection Observer
const observerOptions = {
    // Navigasi akan aktif ketika bagian tersebut berada di 20% dari bagian atas viewport.
    rootMargin: '-20% 0px -80% 0px', 
    threshold: 0 // Tidak terlalu penting karena ada rootMargin
};

const sectionObserver = new IntersectionObserver((entries) => {
    let activeId = null;

    // Cari entri yang paling dekat ke pusat pandangan
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Ambil ID dari bagian yang saat ini terlihat
            activeId = entry.target.id; 
        }
    });

    if (activeId) {
        setActiveNav(activeId);
    }
    
}, observerOptions);

function observeSections() {
    // Ambil semua elemen section yang memiliki ID
    const sections = document.querySelectorAll('main section[id]');
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}


// --- FUNGSI BARU: SMOOTH SCROLLING ---
/**
 * Menggulir halaman secara mulus ke elemen tujuan.
 * @param {Event} e - Event klik.
 */
function smoothScroll(e) {
    // Pastikan ini adalah tautan anchor internal
    const link = e.target.closest('A');
    if (!link) return;

    const href = link.getAttribute('href');

    if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // 1. Terapkan kelas 'active' secara instan pada tautan yang diklik
            setActiveNav(targetId);
            
            // 2. Gulir ke target dengan animasi mulus
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
}

// Event Listener untuk Tombol Toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
    const newTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    applyTheme(newTheme);
});

function handleScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled'); // TAMBAHKAN kelas "scrolled"
    } else {
        navbar.classList.remove('scrolled'); // HAPUS kelas "scrolled"
    }
}
window.addEventListener('scroll', handleScroll);

// Inisialisasi Aplikasi (dipanggil setelah window.onload)
function initializeApp() {
    // 1. Inisialisasi 3D
    if (typeof THREE !== 'undefined') {
        init3D();
        animate();
    } else {
        console.error("THREE.js (Three.min.js) tidak dimuat. Animasi 3D tidak akan berjalan.");
    }
    
    // 2. Terapkan Tema yang Tersimpan
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    applyTheme(savedTheme);

    // 3. Tambahkan Smooth Scrolling ke seluruh tautan internal
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', smoothScroll);
    });

    // 4. Mulai mengamati bagian untuk status aktif navigasi
    observeSections();
    
    // Set status aktif awal untuk section 'home' saat load
    setActiveNav('home'); 
}

// Mulai aplikasi saat jendela dimuat
window.onload = initializeApp;