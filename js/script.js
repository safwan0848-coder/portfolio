// Initialize AOS
AOS.init({ duration: 1000, once: true, offset: 100 });

// Three.js 3D Background
function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const material = new THREE.PointsMaterial({
        size: 0.025,
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // --- CYBER SNAKES IMPLEMENTATION ---
    class CyberSnake {
        constructor(scene, color, speed, offset) {
            this.scene = scene;
            this.color = color;
            this.speed = speed;
            this.offset = offset;
            this.segments = [];
            this.numSegments = 40;
            this.segmentSize = 0.08;

            this.init();
        }

        init() {
            const geometry = new THREE.BoxGeometry(this.segmentSize, this.segmentSize, this.segmentSize);
            const material = new THREE.MeshBasicMaterial({
                color: this.color,
                wireframe: true,
                transparent: true,
                opacity: 0.6
            });

            for (let i = 0; i < this.numSegments; i++) {
                const mesh = new THREE.Mesh(geometry, material);
                // Start them off-screen or clustered
                mesh.position.set(0, 0, 0);
                this.segments.push(mesh);
                this.scene.add(mesh);
            }
        }

        update(time) {
            // Head follows a sine-wave path
            const t = time * this.speed + this.offset;
            const headX = Math.sin(t) * 4;
            const headY = Math.cos(t * 0.7) * 2.5;
            const headZ = Math.sin(t * 0.3) * 2;

            // Move body segments
            // Starting from tail, move to position of previous segment
            for (let i = this.numSegments - 1; i > 0; i--) {
                const current = this.segments[i];
                const prev = this.segments[i - 1];

                // Lerp towards previous segment for smooth trailing
                current.position.lerp(prev.position, 0.4);
                current.rotation.x = prev.rotation.x;
                current.rotation.y = prev.rotation.y;
            }

            // Move head
            const head = this.segments[0];
            head.position.set(headX, headY, headZ);
            head.rotation.x += 0.05;
            head.rotation.y += 0.05;
        }
    }

    // Create Snakes
    // Python Blue (#3b82f6) and Python Yellow (#eab308 / #fbbf24)
    const snake1 = new CyberSnake(scene, 0x3b82f6, 0.5, 0);
    const snake2 = new CyberSnake(scene, 0xfbbf24, 0.4, 100);

    camera.position.z = 5;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    const clock = new THREE.Clock();

    function animate() {
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        const elapsedTime = clock.getElapsedTime();

        // Animate Particles (Starfield)
        particlesMesh.rotation.y = -0.05 * elapsedTime;
        particlesMesh.rotation.x += 0.02 * (targetY - particlesMesh.rotation.x);
        particlesMesh.rotation.y += 0.02 * (targetX - particlesMesh.rotation.y);

        // Update Snakes
        snake1.update(elapsedTime);
        snake2.update(elapsedTime);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

initThreeJS();

// Initialize VanillaTilt (With exclusions for pulled cards)
VanillaTilt.init(document.querySelectorAll(".bento-card:not(.no-tilt)"), {
    max: 5,
    speed: 400,
    glare: true,
    "max-glare": 0.15,
    gyroscope: true,
});

// Custom Cursor
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
document.addEventListener('mousemove', e => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 });
    gsap.to(follower, { x: e.clientX - 20, y: e.clientY - 20, duration: 0.2 });
});

// Clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', { hour12: false });
    document.getElementById('live-clock').innerText = timeString;
}
updateClock();
setInterval(updateClock, 1000);

// ============================================
// AI CHATBOT - BACKEND INTEGRATED VERSION
// ============================================
const chatBox = document.getElementById('ai-chat');
const typingUi = document.getElementById('typing-ui');
const aiInput = document.getElementById('ai-input');

async function runAI() {
    const query = aiInput.value.trim();
    if (!query) return;

    // Add user message
    appendMsg(`
        <div class="flex items-center gap-2 mb-2">
            <i class="bi bi-person-circle text-lg"></i>
            <span class="font-bold text-xs uppercase tracking-wider">YOU</span>
        </div>
        ${escapeHtml(query)}
    `, 'text-zinc-300 bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 chat-message');

    aiInput.value = '';
    typingUi.classList.remove('hidden');

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: query }) // Ensure JSON stringify
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        const text = data.reply;

        typingUi.classList.add('hidden');

        appendMsg(`
            <div class="flex items-center gap-2 mb-2">
                <i class="bi bi-robot text-lg"></i>
                <span class="font-bold text-xs uppercase tracking-wider">SAF_AGENT</span>
            </div>
            ${escapeHtml(text)}
        `, 'text-blue-400 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 chat-message');

    } catch (error) {
        console.error('AI Error:', error);
        typingUi.classList.add('hidden');

        appendMsg(`
            <div class="flex items-center gap-2 mb-2">
                <i class="bi bi-exclamation-triangle text-lg"></i>
                <span class="font-bold text-xs uppercase tracking-wider">SYSTEM</span>
            </div>
            [ERROR] Connection to backend failed. Ensure server is running on port 3000.
        `, "text-red-400 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 chat-message");
    }
}

function appendMsg(html, classes) {
    const div = document.createElement('div');
    div.className = `${classes} opacity-0 translate-y-2 transition-all duration-500`;
    div.innerHTML = html;
    chatBox.appendChild(div);

    setTimeout(() => {
        div.classList.remove('opacity-0', 'translate-y-2');
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 50);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

aiInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        runAI();
    }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
// ============================================
// CONTACT SESSION BOX (MODAL)
// ============================================
const contactModal = document.getElementById('contact-modal');
const modalPanel = document.getElementById('modal-panel');

function openContactModal() {
    contactModal.classList.remove('hidden');
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        contactModal.classList.remove('opacity-0', 'pointer-events-none');
        modalPanel.classList.remove('scale-95');
        modalPanel.classList.add('scale-100');
    }, 10);
}

function closeContactModal() {
    contactModal.classList.add('opacity-0', 'pointer-events-none');
    modalPanel.classList.remove('scale-100');
    modalPanel.classList.add('scale-95');

    // Wait for transition to finish before hiding
    setTimeout(() => {
        contactModal.classList.add('hidden');
    }, 300);
}

function sendEmail() {
    const subject = document.getElementById('email-subject').value;
    const body = document.getElementById('email-body').value;

    // Construct Mailto Link
    const mailtoLink = `mailto:safwan0848@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open default mail client
    window.location.href = mailtoLink;

    // Close modal after sending
    closeContactModal();
}

// Close modal when clicking outside
contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
        closeContactModal();
    }
});
// Handle On-Page Contact Form
// Handle On-Page Contact Form (Direct AJAX Email via Web3Forms)
function handleContactForm(e) {
    e.preventDefault();

    const form = e.target;
    // Get the button and its spans/icons
    const btn = form.querySelector('button');
    const btnTextSpan = btn.querySelector('span');
    const btnIcon = btn.querySelector('i');

    // Store original state
    const originalText = btnTextSpan ? btnTextSpan.innerText : btn.innerText;
    const originalIconClass = btnIcon ? btnIcon.className : '';

    // Set Loading State
    if (btnTextSpan) btnTextSpan.innerText = "ESTABLISHING UPLINK...";
    if (btnIcon) btnIcon.className = "bi bi-activity animate-spin";
    btn.style.opacity = "0.7";
    btn.disabled = true;

    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: json
    })
        .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
                // Success State
                if (btnTextSpan) btnTextSpan.innerText = "TRANSMISSION COMPLETE";
                if (btnIcon) btnIcon.className = "bi bi-check-circle-fill";
                btn.classList.add('sent-success'); // Ensure you have CSS for this or it just adds a class
                btn.style.opacity = "1";

                // Reset form
                form.reset();

                // Success Alert (Stylized)
                setTimeout(() => {
                    alert("SUCCESS: Data Packet transmitted to safwan0848@gmail.com.");

                    // Revert Button
                    if (btnTextSpan) btnTextSpan.innerText = "INITIATE HANDSHAKE";
                    if (btnIcon) btnIcon.className = "bi bi-hand-index-thumb-fill";
                    btn.classList.remove('sent-success');
                    btn.disabled = false;
                }, 3000); // Wait a bit longer to show success state
            } else {
                console.log(response);
                throw new Error(json.message || "Submission failed");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (btnTextSpan) btnTextSpan.innerText = "UPLINK FAILED";
            if (btnIcon) btnIcon.className = "bi bi-exclamation-triangle-fill";
            btn.classList.add('bg-red-600');

            setTimeout(() => {
                alert("ERROR: Connection blocked. Please verify network or try safwan0848@gmail.com directly.");

                // Revert Button
                if (btnTextSpan) btnTextSpan.innerText = originalText;
                if (btnIcon) btnIcon.className = originalIconClass;
                btn.classList.remove('bg-red-600');
                btn.disabled = false;
            }, 3000);
        });
}

// ============================================
// CINEMATIC MOTION EFFECTS (GSAP)
// ============================================

// 1. Profile Image Entrance & Rotation
// Ensure GSAP plugins are registered
gsap.registerPlugin(ScrollTrigger);

gsap.fromTo("#profile-img",
    { opacity: 0, scale: 0.9, rotationY: -15 },
    {
        opacity: 0.8,
        scale: 1,
        rotationY: 0,
        duration: 2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#profile-img",
            start: "top 85%", // Trigger slightly earlier
        }
    }
);

// Continuous subtle rotation on scroll
gsap.to("#profile-img", {
    rotationY: 10, // Subtle 10deg rotation
    ease: "none",
    scrollTrigger: {
        trigger: "#about",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
    }
});

// 2. Project Curtain Reveal (Staggered)
const projectWrappers = gsap.utils.toArray('.project-card-wrapper');

projectWrappers.forEach((wrapper, i) => {
    const curtain = wrapper.querySelector('.project-curtain');
    const image = wrapper.querySelector('img');
    const card = wrapper.querySelector('.project-card');

    // Animate curtain height to 0 to reveal
    if (curtain) {
        gsap.to(curtain, {
            height: 0,
            duration: 1.2,
            ease: "power3.inOut",
            scrollTrigger: {
                trigger: wrapper,
                start: "top 85%"
            }
        });
    }

    // Parallax scale for image
    if (image) {
        gsap.from(image, {
            scale: 1.2,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: wrapper,
                start: "top 85%"
            }
        });
    }

    // Staggered Fade Up for the whole card
    gsap.from(card, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1, // Stagger effect
        ease: "power3.out",
        scrollTrigger: {
            trigger: wrapper,
            start: "top 90%"
        }
    });
});

// 3. Liquid Slime Pull Effect (Final Fix)
try {
    const turbulence = document.querySelector('#jelly-distortion feTurbulence');
    const displacementMap = document.querySelector('#jelly-distortion feDisplacementMap');
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
        const img = card.querySelector('img');
        if (!img) return;

        // Configuration
        card.style.userSelect = 'none';
        card.style.webkitUserSelect = 'none';
        card.style.touchAction = 'none'; // Prevent scroll while pulling

        let isPulling = false;
        let startX, startY;

        const startPull = (e) => {
            // Only pull if clicking the image container, not links
            if (e.target.closest('a') || e.target.closest('button')) return;

            isPulling = true;
            card.classList.add('no-tilt'); // Pause tilt
            if (card.vanillaTilt) card.vanillaTilt.destroy(); // Force kill tilt during pull

            const rect = card.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;

            // Apply filter and set origin
            gsap.set(img, {
                filter: 'url(#jelly-distortion)',
                webkitFilter: 'url(#jelly-distortion)',
                transformOrigin: `${offsetX}px ${offsetY}px`
            });

            gsap.to(img, {
                scale: 0.9,
                duration: 0.2,
                ease: "power2.out"
            });
        };

        const movePull = (e) => {
            if (!isPulling) return;

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const dx = clientX - startX;
            const dy = clientY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // LIQUID PHYSICS
            gsap.to(img, {
                x: dx * 0.4, // More pronounced drag
                y: dy * 0.4,
                rotationX: -dy * 0.05, // 3D bend
                rotationY: dx * 0.05,
                scaleX: 1 + Math.abs(dx) * 0.002,
                scaleY: 1 + Math.abs(dy) * 0.002,
                duration: 0.2,
                overwrite: 'auto'
            });

            if (turbulence) {
                gsap.to(turbulence, {
                    attr: { baseFrequency: `${0.01 + dist * 0.0005} 0.012` },
                    duration: 0.2,
                    overwrite: 'auto'
                });
            }

            if (displacementMap) {
                gsap.to(displacementMap, {
                    attr: { scale: Math.min(dist * 0.8, 100) }, // Ultra distortion
                    duration: 0.2,
                    overwrite: 'auto'
                });
            }
        };

        const endPull = () => {
            if (!isPulling) return;
            isPulling = false;

            // SNAP BACK
            gsap.to(img, {
                x: 0,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 1.5,
                ease: "elastic.out(1, 0.3)",
                onComplete: () => {
                    if (!isPulling) {
                        gsap.set(img, { filter: 'none', webkitFilter: 'none' });
                        // Re-init tilt if needed (optional)
                    }
                }
            });

            // Reset SVG
            gsap.to(turbulence, { attr: { baseFrequency: '0.01 0.01' }, duration: 1 });
            if (displacementMap) gsap.to(displacementMap, { attr: { scale: 0 }, duration: 1 });
        };

        card.addEventListener('mousedown', startPull);
        card.addEventListener('touchstart', startPull, { passive: true });
        window.addEventListener('mousemove', movePull);
        window.addEventListener('touchmove', movePull, { passive: false });
        window.addEventListener('mouseup', endPull);
        window.addEventListener('touchend', endPull);
    });
} catch (e) {
    console.error("Liquid Slime error:", e);
}

// ============================================
// HERO 3D ROTATION (STRICT & ROBUST)
// ============================================

window.addEventListener('load', () => {
    // Ensure accurate layout calculations
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();

    const heroContainer = document.querySelector('.hero-perspective-container');
    const heroWrapper = document.querySelector('.hero-image-wrapper');

    if (heroContainer && heroWrapper) {
        // Reset and prepare
        gsap.set(heroWrapper, { clearProps: "all" }); // Clear any previous styles 

        // Main Rotation Timeline
        const heroTl = gsap.timeline({
            scrollTrigger: {
                trigger: heroContainer,
                start: "top 60%", // Start when container is near middle of viewport
                end: "bottom top", // End when it leaves the top
                scrub: 1, // Smooth matching
                markers: false
            }
        });

        heroTl.to(heroWrapper, {
            rotationY: 180,
            ease: "none"
        });

        // Intro Animation
        gsap.fromTo(heroWrapper,
            { scale: 0.8, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 1.5,
                ease: "power3.out",
                delay: 0.5
            }
        );
    }
});

