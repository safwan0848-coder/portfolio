document.addEventListener("DOMContentLoaded", () => {
    // ------------------------------------------------------------------
    // PREMIUM CINEMATIC PRELOADER
    // ------------------------------------------------------------------

    // DOM Elements
    const bootScreen = document.getElementById('boot-screen');
    const logoTop = document.getElementById('snake-top');
    const logoBottom = document.getElementById('snake-bottom');
    const loadingText = document.querySelector('.loading-text');
    const progressFill = document.querySelector('.progress-fill');
    const percentText = document.querySelector('.percent-text');
    const statusText = document.querySelector('.status-text');
    const mainContent = document.querySelectorAll('nav, section, canvas#bg-canvas, .scanline, #cursor');

    // Hide main content initially (optional, but good for focus)
    // gsap.set(mainContent, { opacity: 0 });

    const tl = gsap.timeline({
        onComplete: () => {
            // Unlock Scroll/Interaction
            document.body.style.overflow = 'auto';
        }
    });

    const statusMessages = [
        "Initializing Core Modules...",
        "Optimizing Backend Runtime...",
        "Loading React Components...",
        "Establishing Secure Database Connection...",
        "Deployment Complete."
    ];

    // ------------------------------------------------------------------
    // ANIMATION SEQUENCE
    // ------------------------------------------------------------------

    // 1. Initial State
    tl.set(bootScreen, { display: 'flex' })
        .set([logoTop, logoBottom], { opacity: 0 })
        .set(logoTop, { y: -50 })
        .set(logoBottom, { y: 50 })
        .set(".loader-container", { opacity: 0 })
        .set(statusText, { text: "" });

    // 2. Text Fade In
    tl.to(loadingText, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });

    // 3. Logo Assemble (Join)
    tl.to([logoTop, logoBottom], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1
    }, "-=0.3");

    // 4. Logo Glow Pulse
    tl.to(".python-logo", {
        filter: "drop-shadow(0 0 15px rgba(55, 118, 171, 0.3))",
        duration: 0.5
    });

    // 5. Progress Bar & Status Text
    tl.to(".loader-container", { opacity: 1, duration: 0.3 }, "-=0.3");

    // Animate Progress Bar (0 -> 100%)
    tl.to(progressFill, {
        width: "100%",
        duration: 1.5,
        ease: "power1.inOut",
        onUpdate: function () {
            // Update percentage counter
            const progress = Math.round(this.progress() * 100);
            percentText.innerText = `${progress}%`;

            // Update status text based on progress
            const msgIndex = Math.min(
                Math.floor(this.progress() * statusMessages.length),
                statusMessages.length - 1
            );
            statusText.innerText = statusMessages[msgIndex];
        }
    }, "<");

    // 6. Completion & Exit
    tl.to(loadingText, {
        text: "SYSTEM READY",
        color: "#fff",
        duration: 0.3
    });

    tl.to(".python-logo", {
        scale: 1.1,
        filter: "drop-shadow(0 0 30px rgba(55, 118, 171, 0.6))",
        duration: 0.4,
        ease: "power2.inOut"
    });

    // Fade Out Preloader
    tl.to(bootScreen, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
            bootScreen.style.display = 'none';
        }
    });

    // Reveal Main Content
    tl.from(mainContent, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out",
        clearProps: "all"
    }, "-=0.3");

});
