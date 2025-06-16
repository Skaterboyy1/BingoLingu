// script.js

// --- phrases for the bingo board ---
const phrases = [
    "omoară limba română", "„bilele mele”", "quote/mention Răgălie", "o face de sânge", "îi da praise lu' Imogen",
    "„pause”", "se ia de chat", "pleacă afară după live", "„ce prost sunt”", "întârziere minim 10 min",
    "bea cola/energizant", "„liber”", "IMAGE", "„atentie”", "se strică scena",
    "tottenhamfan și fcscuipandunare top 5 la bingo si dariusJR", "pleacă din cameră+gol spam", "sphinx dă gifted memberships", "„regele”", "fără sponsorizare/pleacă monetizarea",
    "„e bună mă”", "uită de donații", "minim un timeout pe chat", "pula spam", "j*b mentioned"
];

const boardEl = document.getElementById('board');
const resetBtn = document.getElementById('resetBtn');
// --- bingo celebration song ---
const bingoSong = new Audio('troll.m4a');
bingoSong.volume = 0.3;
bingoSong.loop = true; // optional: set to true if you want it to repeat


let cells = [];

function createBoard() {
    const frag = document.createDocumentFragment();
    phrases.forEach((text, i) => {
        const div = document.createElement('div');
        div.className = 'cell';
        div.dataset.idx = i;
        if (text === 'IMAGE') {
            const img = new Image();
            img.src = 'vlad-freespace.jpg';
            img.alt = 'Vlad Lungu';
            div.append(img);
            div.classList.add('checked');
        } else {
            div.textContent = text;
        }
        frag.append(div);
        cells.push(div);
    });
    boardEl.append(frag);
}

// --- check for winning patterns & trigger celebration ---
let animating = false;
let bingoTime = 0;

function checkBingo() {
    const patterns = [
        [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
    ];

    // clear previous highlights
    cells.forEach(c => c.classList.remove('winning'));

    // find a winning line
    const win = patterns.find(p =>
        p.every(i => cells[i].classList.contains('checked'))
    );

    if (win) {
        win.forEach(i => cells[i].classList.add('winning'));
        if (!animating) celebrate();
    }
}

// --- click handler ---
boardEl.addEventListener('click', e => {
    const c = e.target.closest('.cell');
    if (!c) return;
    if (c.querySelector('img')) return; // free-space stays checked
    c.classList.toggle('checked');
    checkBingo();
});

// --- reset handler ---
resetBtn.addEventListener('click', () => {
    // 1) clear all checked/winning marks
    cells.forEach(c => {
        c.classList.remove('checked', 'winning');
        if (c.querySelector('img')) c.classList.add('checked');
    });

    // 2) stop any ongoing animation
    animating = false;

    bingoSong.pause();
    bingoSong.currentTime = 0;

    // 3) remove all remaining confetti particles
    confetti = [];

    // 4) clear the canvas immediately
    ctx.clearRect(0, 0, W, H);
});


// --- canvas confetti setup ---
const canvas = document.getElementById('celebration');
const ctx = canvas.getContext('2d');
let W, H, confetti = [];

function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- confetti particle ---
class Particle {
    constructor() {
        this.x     = Math.random() * W;
        this.y     = -10;
        this.size  = 5 + Math.random() * 8;
        this.speedY = 4 + Math.random() * 4;   // faster fall
        this.spin  = Math.random() * 0.2 - 0.1;
        this.color = `hsl(${Math.random()*360}, 80%, 60%)`;
    }
    update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y / 10) * 2;
        this.angle = (this.angle || 0) + this.spin;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

// --- animation loop ---
function loop() {
    if (!animating) return;

    // 1) clear the canvas
    ctx.clearRect(0, 0, W, H);

    // 2) **bonus**: add a few fresh confetti each frame
    for (let i = 0; i < 5; i++) {
        confetti.push(new Particle());
    }

    // 3) update & draw all confetti
    confetti.forEach(p => {
        p.update();
        p.draw();
    });

    // 4) remove off-screen bits
    confetti = confetti.filter(p => p.y < H + 20);

    // 5) draw the big pulsing BINGO text
    const elapsed = Date.now() - bingoTime;
    const t       = Math.min(1, elapsed / 3000);
    const alpha   = 1 - t;
    const scale   = 1 + 0.15 * Math.sin(t * Math.PI * 4);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(W/2, H/2);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 8vw sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 B I N G O! 🎉', 0, 0);
    ctx.restore();

    // 6) keep animating while there’s confetti or text-fade time left
    if (confetti.length || elapsed < 3000) {
        requestAnimationFrame(loop);
    } else {
        animating = false;
        ctx.clearRect(0, 0, W, H);
    }
}


// --- launch confetti + text ---
function celebrate() {
    for (let i = 0; i < 250; i++) {
        confetti.push(new Particle());
    }
    bingoTime = Date.now();
    animating = true;
    bingoSong.currentTime = 0;
    bingoSong.play();
    loop();
}

// --- start everything ---
createBoard();
