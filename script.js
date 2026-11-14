// 3D Liquid Glass Effect using Three.js

const init3D = () => {
    const container = document.getElementById('canvas-container');

    // Detect mobile for performance optimizations
    const isMobile = window.innerWidth <= 768;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    container.appendChild(renderer.domElement);

    // Create a complex shape (Icosahedron) — lower detail on mobile
    const detailLevel = isMobile ? 8 : 20;
    const geometry = new THREE.IcosahedronGeometry(2, detailLevel);

    // Create Glass/Liquid Material
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x8c0c1b, // Dark red tint
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9, // Glass-like transparency
        ior: 1.5, // Index of refraction
        envMapIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
        transparent: true
    });

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff0000, 2, 50); // Red light
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1, 50); // White light
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.001;
        mouseY = (event.clientY - windowHalfY) * 0.001;
    });

    // Vertex displacement logic for "liquid" effect
    const originalPositions = geometry.attributes.position.clone();
    const positionAttribute = geometry.attributes.position;

    let time = 0;

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);

        time += 0.02;

        // Smoothly move object towards mouse
        targetX = mouseX * 2;
        targetY = mouseY * 2;

        mesh.rotation.y += 0.05 * (targetX - mesh.rotation.y);
        mesh.rotation.x += 0.05 * (targetY - mesh.rotation.x);

        // Continuous rotation
        mesh.rotation.y += 0.005;
        mesh.rotation.z += 0.002;

        // Liquid morphing effect
        for (let i = 0; i < positionAttribute.count; i++) {
            const ix = originalPositions.getX(i);
            const iy = originalPositions.getY(i);
            const iz = originalPositions.getZ(i);

            // Simple noise-like sine wave displacement
            const offset = 0.2 * Math.sin(ix * 2 + time) + 0.1 * Math.cos(iy * 3 + time * 1.5) + 0.1 * Math.sin(iz * 1.5 + time * 0.8);

            // Apply displacement along normal (roughly, since it's a sphere)
            const length = Math.sqrt(ix * ix + iy * iy + iz * iz);
            const newLength = length + offset;

            positionAttribute.setXYZ(i,
                (ix / length) * newLength,
                (iy / length) * newLength,
                (iz / length) * newLength
            );
        }

        positionAttribute.needsUpdate = true;
        geometry.computeVertexNormals();

        renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

const initMediaFallbacks = () => {
    const defaultFallback = 'portfolio image.jpg';

    document.querySelectorAll('.project-image img, .project-image video').forEach((media) => {
        const fallbackSrc = media.dataset.fallback || defaultFallback;

        if (media.tagName === 'VIDEO') {
            media.muted = true;
            media.playsInline = true;
        }

        media.addEventListener('error', () => {
            media.onerror = null;

            if (media.tagName === 'VIDEO') {
                const fallbackImage = document.createElement('img');
                fallbackImage.src = fallbackSrc;
                fallbackImage.alt = media.getAttribute('alt') || 'Portfolio preview';
                fallbackImage.loading = 'lazy';
                media.replaceWith(fallbackImage);
                return;
            }

            media.src = fallbackSrc;
        }, { once: true });
    });
};

// Scroll Animations
const initScrollAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.15 });

    const slideUpElements = document.querySelectorAll('.project-card, .timeline-item, .ed-item, .section-header');
    slideUpElements.forEach(el => { el.classList.add('slide-up'); observer.observe(el); });

    const slideRightElements = document.querySelectorAll('.hero-left, .footer-left, .education, .skills');
    slideRightElements.forEach(el => { el.classList.add('slide-right'); observer.observe(el); });

    const slideLeftElements = document.querySelectorAll('.hero-right, .footer-contact, .footer-image');
    slideLeftElements.forEach(el => { el.classList.add('slide-left'); observer.observe(el); });

    const fadeElements = document.querySelectorAll('.desc, .background-text, .quote-content, .stats');
    fadeElements.forEach(el => { el.classList.add('fade'); observer.observe(el); });
};

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        init3D();
    }
    initMediaFallbacks();
    initScrollAnimations();
});
