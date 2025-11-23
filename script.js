let allPhotos = [];
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('photo-grid');
    allPhotos = [];

    for (let i = 1; i <= 30; i++) {
        const thumb = document.createElement('div');
        thumb.className = 'thumb';

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = `Photo ${i}`;

        img.src = `photos/photo${i}.jpeg`;
        img.onerror = () => {
            img.src = `photos/photo${i}.jpg`;
            img.onerror = () => thumb.remove();
        };

        img.onclick = () => {
            currentIndex = allPhotos.indexOf(img.src);
            if (currentIndex === -1) {
                allPhotos.push(img.src);
                currentIndex = allPhotos.length - 1;
            }
            openLightbox(img.src);
        };

        if (!img.src.includes('about:blank')) allPhotos.push(img.src);
        thumb.appendChild(img);
        grid.appendChild(thumb);
    }
});

function openLightbox(src) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox').classList.remove('hidden');
    updateArrows();
}

function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
}

function showPrev() {
    currentIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
    document.getElementById('lightbox-img').src = allPhotos[currentIndex];
}

function showNext() {
    currentIndex = (currentIndex + 1) % allPhotos.length;
    document.getElementById('lightbox-img').src = allPhotos[currentIndex];
}

function updateArrows() {
    const arrows = allPhotos.length > 1 ? 'block' : 'none';
    document.getElementById('prev-arrow').style.display = arrows;
    document.getElementById('next-arrow').style.display = arrows;
}

document.getElementById('lightbox').addEventListener('click', e => {
    if (e.target.id === 'lightbox' || e.target.className === 'lightbox-close') closeLightbox();
});
document.getElementById('prev-arrow').addEventListener('click', showPrev);
document.getElementById('next-arrow').addEventListener('click', showNext);
document.addEventListener('keydown', e => {
    if (document.getElementById('lightbox').classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'Escape') closeLightbox();
});

// ============================================
// RSVP – FINAL LIVE VERSION (sends to YOUR Google Sheet)
// ============================================
document.getElementById('rsvp-form').addEventListener('submit', async e => {
    e.preventDefault();

    const ind2 = document.getElementById('ind2-fields');
    const hasInd2 = !ind2.classList.contains('disabled') && document.getElementById('ind2-name').value.trim();

    const data = {
        ind1Name: document.getElementById('ind1-name').value,
        ind1Main: document.getElementById('ind1-main').value,
        ind1Dessert: document.getElementById('ind1-dessert').value + 
            (document.getElementById('ind1-dessert').value === 'fondant' ? ' – ' + document.getElementById('fondant1-with').value : ''),
        ind2Name: hasInd2 ? document.getElementById('ind2-name').value : '',
        ind2Main: hasInd2 ? document.getElementById('ind2-main').value : '',
        ind2Dessert: hasInd2 ? document.getElementById('ind2-dessert').value + 
            (document.getElementById('ind2-dessert').value === 'fondant' ? ' – ' + document.getElementById('fondant2-with').value : '') : '',
        rsvp: document.querySelector('input[name="rsvp"]:checked').value,
        dietary: document.getElementById('dietary').value,
        songRequest: document.getElementById('song-request').value
    };

    // ←←← YOUR REAL WORKING URL
    const liveUrl = "https://script.google.com/macros/s/AKfycbzxGMXmQq_fO-MM60UcAsr7e_kq7WOdCTyZhkwe0FX2wXGhFUU2rZuz-4lXeuRY4hQx/exec";

    try {
        await fetch(liveUrl, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        });

        document.getElementById('rsvp-form').style.display = 'none';
        document.getElementById('thank-you').classList.remove('hidden');
    } catch (err) {
        console.error("Submit failed:", err);
        alert("Something went wrong – please try again or WhatsApp Francois");
    }
});

// ============================================
// REST OF YOUR ORIGINAL CODE (unchanged)
// ============================================
async function renderPDF() {
    try {
        const url = 'invite.pdf';
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const canvas = document.getElementById('pdf-canvas');
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
    } catch (err) {
        document.querySelector('.pdf-viewer').innerHTML = '<p>Could not load invite.pdf</p>';
    }
}
renderPDF();

document.querySelector('.scroll-btn').addEventListener('click', () => {
    document.querySelector('.rsvp').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('na-btn').addEventListener('click', () => {
    const fields = document.getElementById('ind2-fields');
    fields.classList.toggle('disabled');
    fields.querySelectorAll('input, select').forEach(el => {
        el.disabled = !el.disabled;
        if (el.disabled) el.value = '';
    });
    document.getElementById('fondant2-option').classList.add('hidden');
});

function toggleFondant(selectId, optionDivId) {
    const select = document.getElementById(selectId);
    const div = document.getElementById(optionDivId);
    if (select.value === 'fondant') div.classList.remove('hidden');
    else div.classList.add('hidden');
}
document.getElementById('ind1-dessert').addEventListener('change', () => toggleFondant('ind1-dessert', 'fondant1-option'));
document.getElementById('ind2-dessert').addEventListener('change', () => toggleFondant('ind2-dessert', 'fondant2-option'));

document.querySelectorAll('.faq-item h3').forEach(h3 => {
    h3.addEventListener('click', () => {
        const p = h3.nextElementSibling;
        p.style.display = p.style.display === 'block' ? 'none' : 'block';
    });
});

function updateCountdown() {
    const wedding = new Date('2026-04-07T16:50:00');
    const now = new Date();
    const diff = wedding - now;
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    const minutes = Math.floor((diff % (1000*60*60)) / (1000*60));
    const seconds = Math.floor((diff % (1000*60)) / 1000);

    document.getElementById('timer').innerHTML = 
        `${days} Days ${hours.toString().padStart(2,'0')} Hours ${minutes.toString().padStart(2,'0')} Minutes ${seconds.toString().padStart(2,'0')} Seconds`;
}
setInterval(updateCountdown, 1000);
updateCountdown();