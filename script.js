const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.3) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = (e.clientX - 3 + Math.random() * 10 - 5) + 'px';
        sparkle.style.top = (e.clientY - 3 + Math.random() * 10 - 5) + 'px';
        document.body.appendChild(sparkle);

        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 1000);
    }
});

const badges = document.querySelectorAll('.badge-btn');
badges.forEach(badge => {
    badge.addEventListener('click', () => {
        playBeep();
        const text = badge.innerText;
        badge.style.transform = 'rotate(' + (Math.random() * 20 - 10) + 'deg) scale(1.1)';
        setTimeout(() => {
            badge.style.transform = '';
        }, 200);
    });
});

const helloBtn = document.getElementById('hello-btn');
if (helloBtn) {
    helloBtn.addEventListener('click', () => {
        playBeep();
        alert('Welcome to xeydev.! Surfing the digital wave~');
    });
}

function fetchDiscordStatus() {
    fetch('https://api.lanyard.rest/v1/users/586802340607164417')
        .then(res => res.json())
        .then(json => {
            if (json.success && json.data) {
                const data = json.data;


                const statusEl = document.getElementById('discord-status');
                if (statusEl) {
                    const statusMapping = {
                        online: '🟢 Online',
                        idle: '🌙 Idle',
                        dnd: '🔴 Do Not Disturb',
                        offline: '⚫ Offline'
                    };
                    statusEl.textContent = statusMapping[data.discord_status] || data.discord_status;

                    const avatarEl = document.getElementById('discord-avatar');
                    if (avatarEl) {
                        const borderColors = { online: '#3ba55c', idle: '#faa61a', dnd: '#ed4245', offline: '#747f8d' };
                        avatarEl.style.borderColor = borderColors[data.discord_status] || '#747f8d';
                        avatarEl.style.boxShadow = `0 0 10px ${borderColors[data.discord_status] || '#747f8d'}88`;
                    }

                    const decoEl = document.getElementById('avatar-decoration');
                    if (decoEl && data.discord_user && data.discord_user.avatar_decoration_data) {
                        const asset = data.discord_user.avatar_decoration_data.asset;
                        decoEl.src = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=240&passthrough=true`;
                        decoEl.style.display = 'block';
                    }
                }


                const activityEl = document.getElementById('discord-activity');
                const msnActivityEl = document.getElementById('msn-activity');
                if (activityEl || msnActivityEl) {
                    const nonCustomActivities = data.activities.filter(act => act.type !== 4);
                    let activityText = 'none';
                    if (data.listening_to_spotify && data.spotify) {
                        const spotifyHtml = `<img src="${data.spotify.album_art_url}" style="width:24px; height:24px; vertical-align:middle; border-radius:3px; margin-right:5px;"><span style="vertical-align:middle;">Listening to <strong>${data.spotify.song}</strong></span>`;
                        if (activityEl) activityEl.innerHTML = spotifyHtml;
                        activityText = `🎵 ${data.spotify.song} – ${data.spotify.artist}`;
                    } else if (nonCustomActivities.length > 0) {
                        const activity = nonCustomActivities[0];
                        let appIconStr = '';
                        if (activity.application_id) {
                            appIconStr = `<img src="https://dcdn.dstn.to/app-icons/${activity.application_id}" style="width:24px; height:24px; vertical-align:middle; border-radius:4px; margin-right:5px;" onerror="this.style.display='none'">`;
                        }
                        if (activityEl) activityEl.innerHTML = `${appIconStr}<span style="vertical-align:middle;">${activity.type === 0 ? 'Playing' : 'Activity'}: ${activity.name}</span>`;
                        activityText = `${activity.type === 0 ? '🎮 Playing' : '⚡'} ${activity.name}`;
                    } else {
                        if (activityEl) activityEl.innerHTML = '<span>None</span>';
                        activityText = 'idle...';
                    }
                    if (msnActivityEl) msnActivityEl.textContent = activityText;
                }


                const moodEl = document.getElementById('my-discord-mood');
                const messageEl = document.getElementById('my-discord-custom-message');
                const msnMsgEl = document.getElementById('msn-custom-msg');
                const msnDot = document.getElementById('msn-dot');
                const msnStatusLabel = document.getElementById('msn-status-label');
                const customStatus = data.activities.find(act => act.type === 4);
                const timeEl = document.getElementById('my-discord-time');

                const dotColors = { online: '#3ba55c', idle: '#faa61a', dnd: '#ed4245', offline: '#747f8d' };
                const statusLabels = { online: '🟢 Online', idle: '🌙 Away', dnd: '🔴 Busy', offline: '⚫ Offline' };
                if (msnDot) msnDot.style.background = dotColors[data.discord_status] || '#747f8d';
                if (msnStatusLabel) msnStatusLabel.textContent = statusLabels[data.discord_status] || data.discord_status;
                if (msnStatusLabel) msnStatusLabel.style.color = dotColors[data.discord_status] || '#747f8d';

                function formatTimeAgo(ts) {
                    if (!ts) return '';
                    const seconds = Math.floor((Date.now() - ts) / 1000);
                    if (seconds <= 0) return 'just now';
                    if (seconds < 60) return `${seconds}s ago`;
                    const mins = Math.floor(seconds / 60);
                    if (mins < 60) return `${mins}m ago`;
                    const hours = Math.floor(mins / 60);
                    if (hours < 24) return `${hours}h ago`;
                    const days = Math.floor(hours / 24);
                    return `${days}d ago`;
                }

                if (customStatus) {
                    localStorage.removeItem('xey_status_cleared');
                    if (timeEl) timeEl.textContent = formatTimeAgo(customStatus.created_at);

                    let emojiHtml = '💭';
                    if (customStatus.emoji) {
                        emojiHtml = customStatus.emoji.id
                            ? `<img src="https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${customStatus.emoji.animated ? 'gif' : 'webp'}?size=32" style="width:16px;vertical-align:middle">`
                            : customStatus.emoji.name;
                    }
                    if (moodEl) moodEl.innerHTML = `xeydev ${emojiHtml}`;
                    const statusText = customStatus.state || 'Just chilling...';
                    if (messageEl) messageEl.textContent = statusText;
                    if (msnMsgEl) msnMsgEl.textContent = statusText;
                } else {
                    let clearedTime = localStorage.getItem('xey_status_cleared');
                    if (!clearedTime) {
                        clearedTime = Date.now();
                        localStorage.setItem('xey_status_cleared', clearedTime);
                    }
                    if (timeEl) timeEl.textContent = formatTimeAgo(parseInt(clearedTime, 10));
                    if (moodEl) moodEl.innerHTML = 'xeydev';
                    if (messageEl) messageEl.textContent = 'Life is not bibbidi bobbidi boowa.';
                    if (msnMsgEl) msnMsgEl.textContent = 'Life is not bibbidi bobbidi boowa😒';
                }
            }
        })
        .catch(err => console.error('Lanyard error:', err));
}

fetchDiscordStatus();
setInterval(fetchDiscordStatus, 15000);


const audio = new Audio();
const playlistItems = document.querySelectorAll('.playlist-item');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const timeDisplay = document.getElementById('timeDisplay');
const playlistToggle = document.getElementById('playlistToggle');
const playlistMenu = document.getElementById('playlistMenu');
const marqueeElement = document.getElementById('track-marquee');
let currentTrack = 0;
let isPlaying = false;

if (playlistToggle) {
    playlistToggle.addEventListener('click', () => {
        playlistMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.playlist-dropdown')) {
            playlistMenu.classList.remove('show');
        }
    });

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function loadTrack(index) {
        currentTrack = index;
        const track = playlistItems[index];
        audio.src = track.getAttribute('data-src');
        const title = track.getAttribute('data-title') || ('Track ' + (index + 1));
        marqueeElement.textContent = title;
        marqueeElement.style.animation = 'none';
        marqueeElement.offsetHeight;
        marqueeElement.style.animation = 'player-scroll 12s linear infinite';

        playlistItems.forEach(item => item.classList.remove('active'));
        track.classList.add('active');
        if (isPlaying) {
            audio.play();
            playBtn.textContent = '⏸';
        }
    }

    function playPause() {
        if (isPlaying) {
            audio.pause();
            playBtn.textContent = '▶';
        } else {
            audio.play();
            playBtn.textContent = '⏸';
        }
        isPlaying = !isPlaying;
    }

    function nextTrack() {
        currentTrack = (currentTrack + 1) % playlistItems.length;
        loadTrack(currentTrack);
    }

    function prevTrack() {
        currentTrack = (currentTrack - 1 + playlistItems.length) % playlistItems.length;
        loadTrack(currentTrack);
    }

    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            timeDisplay.textContent = formatTime(currentTime);
        }
    }

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if (duration) {
            audio.currentTime = (clickX / width) * duration;
        }
    }

    playBtn.addEventListener('click', playPause);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);
    audio.addEventListener('timeupdate', updateProgress);
    progressContainer.addEventListener('click', setProgress);
    audio.addEventListener('ended', nextTrack);

    playlistItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            loadTrack(index);
            if (!isPlaying) playPause();
            playlistMenu.classList.remove('show');
        });
    });

    loadTrack(0);
}


const calendarGrid = document.getElementById('calendarGrid');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

if (calendarGrid) {
    let currentDate = new Date();
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        currentMonthElement.textContent = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });

        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        days.forEach(day => {
            const el = document.createElement('div');
            el.className = 'calendar-day header';
            el.textContent = day;
            calendarGrid.appendChild(el);
        });

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        for (let i = firstDay - 1; i >= 0; i--) {
            const el = document.createElement('div');
            el.className = 'calendar-day other-month';
            el.textContent = daysInPrevMonth - i;
            calendarGrid.appendChild(el);
        }

        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-day';
            el.textContent = i;
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                el.className += ' today';
            }
            calendarGrid.appendChild(el);
        }

        const remainingCells = 42 - calendarGrid.children.length;
        for (let i = 1; i <= remainingCells && i <= 14; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-day other-month';
            el.textContent = i;
            calendarGrid.appendChild(el);
        }
    }

    function changeMonth(offset) {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        renderCalendar();
    }

    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));

    renderCalendar();
}

function switchView(viewId) {
    if (typeof event !== 'undefined' && event) event.preventDefault();
    const views = document.querySelectorAll('.page-view');
    views.forEach(v => v.style.display = 'none');
    if (document.getElementById(viewId)) document.getElementById(viewId).style.display = 'block';
}

function toggleDrawer(contentId, iconId) {
    const content = document.getElementById(contentId);
    const icon = document.getElementById(iconId);
    if (!content || !icon) return;
    content.classList.toggle('closed');
    if (content.classList.contains('closed')) {
        icon.textContent = '▶';
    } else {
        icon.textContent = '▼';
    }
}


function updateDigitalClock() {
    const clock = document.getElementById('digital-clock');
    if (!clock) return;

    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wib = new Date(utc + (3600000 * 7));

    const h = wib.getHours().toString().padStart(2, '0');
    const m = wib.getMinutes().toString().padStart(2, '0');
    const s = wib.getSeconds().toString().padStart(2, '0');
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const day = days[wib.getDay()];

    const d = (n) => `<span class="clk-d">${n}</span>`;
    const sep = `<span class="clk-sep">:</span>`;

    clock.innerHTML =
        `<div class="clk-row">${d(h[0])}${d(h[1])}${sep}${d(m[0])}${d(m[1])}${sep}${d(s[0])}${d(s[1])}</div>
         <div class="clk-sub">${day} &bull; WIB</div>`;
}

if (!document.getElementById('clk-style')) {
    const st = document.createElement('style');
    st.id = 'clk-style';
    st.textContent = `
        #digital-clock { text-align:center; }
        .clk-row {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 3px;
        }
        .clk-d {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 34px;
            background: #001a1a;
            color: #00ffea;
            font-family: 'VT323', monospace;
            font-size: 24px;
            border-radius: 4px;
            border: 1px solid #003344;
            box-shadow: 0 0 6px #00e5ff44 inset;
            text-shadow: 0 0 8px #00ffea, 0 0 16px #00b8d4;
        }
        .clk-sep {
            color: #00ffea;
            font-family: 'VT323', monospace;
            font-size: 22px;
            text-shadow: 0 0 8px #00ffea;
            animation: blink-sep 1s step-end infinite;
            line-height: 1;
            margin: 0 1px;
        }
        .clk-sub {
            font-family: 'VT323', monospace;
            font-size: 12px;
            letter-spacing: 2px;
            color: #00b8d4;
            text-shadow: 0 0 5px #00e5ff;
            opacity: 0.75;
            margin-top: 4px;
        }
    `;
    document.head.appendChild(st);
}

setInterval(updateDigitalClock, 1000);
updateDigitalClock();


const kaomojis = ['>_<', '>_-', '-_<', '-_-'];
let kaomojiIndex = 0;
const kaomojiEl = document.getElementById('kaomoji');
if (kaomojiEl) {
    setInterval(() => {
        kaomojiIndex = (kaomojiIndex + 1) % kaomojis.length;
        kaomojiEl.textContent = kaomojis[kaomojiIndex];
    }, 1000);
}


let ringUrls = [];
let ringIndex = 0;

function updateRingButtons() {
    if (ringUrls.length === 0) return;
    const preview = document.getElementById('webring-preview');
    const prevBtn = document.getElementById('ring-prev');
    const randomBtn = document.getElementById('ring-random');
    const nextBtn = document.getElementById('ring-next');

    const prevIdx = (ringIndex - 1 + ringUrls.length) % ringUrls.length;
    const nextIdx = (ringIndex + 1) % ringUrls.length;
    const randomIdx = Math.floor(Math.random() * ringUrls.length);

    if (preview) preview.innerHTML = `🌐 <a href="${ringUrls[ringIndex]}" target="_blank" style="color:#005fa3; text-decoration:underline;">${ringUrls[ringIndex]}</a>`;
    if (prevBtn) { prevBtn.href = ringUrls[prevIdx]; prevBtn.onclick = (e) => { e.preventDefault(); ringIndex = prevIdx; updateRingButtons(); }; }
    if (randomBtn) { randomBtn.onclick = (e) => { e.preventDefault(); ringIndex = Math.floor(Math.random() * ringUrls.length); window.open(ringUrls[ringIndex], '_blank'); updateRingButtons(); }; }
    if (nextBtn) { nextBtn.href = ringUrls[nextIdx]; nextBtn.onclick = (e) => { e.preventDefault(); ringIndex = nextIdx; updateRingButtons(); }; }
}

fetch('misc/random.txt')
    .then(r => r.text())
    .then(text => {
        ringUrls = text.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
        if (ringUrls.length > 0) {
            ringIndex = Math.floor(Math.random() * ringUrls.length);
            updateRingButtons();
        }
    })
    .catch(() => {
        const preview = document.getElementById('webring-preview');
        if (preview) preview.textContent = 'Ring unavailable.';
    });

const GB_KEY = 'xeydev_guestbook';

function gbLoad() {
    try { return JSON.parse(localStorage.getItem(GB_KEY)) || []; }
    catch { return []; }
}

function gbSave(entries) {
    localStorage.setItem(GB_KEY, JSON.stringify(entries));
}

function gbTimeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' hr ago';
    if (s < 604800) return Math.floor(s / 86400) + ' day(s) ago';
    return new Date(ts).toLocaleDateString();
}

function gbRender() {
    const container = document.getElementById('gb-entries');
    if (!container) return;
    const entries = gbLoad();

    if (entries.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:24px; color:#6698c4; font-style:italic; font-size:14px;">
            no entries yet... be the first to sign! ✨</div>`;
        return;
    }

    container.innerHTML = entries.slice().reverse().map((e, i) => {
        const realIdx = entries.length - 1 - i;
        const moodColors = ['#c8e6ff', '#d4f5e0', '#ffe0ec', '#fff4cc', '#ead4ff'];
        const bg = moodColors[realIdx % moodColors.length];
        return `<div class="gb-entry" style="--entry-bg:${bg};">
            <div class="gb-entry-top">
                <span class="gb-icon">💌</span>
                <div>
                    <div class="gb-name">${e.url
                ? `<a href="${e.url}" target="_blank" rel="noopener" style="color:#0056a8;text-decoration:none;">${e.name} 🔗</a>`
                : e.name}</div>
                    <div class="gb-time">${gbTimeAgo(e.ts)}</div>
                </div>
                <button class="gb-del" onclick="gbDelete(${realIdx})" title="delete">✕</button>
            </div>
            <div class="gb-msg">${e.msg.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
        </div>`;
    }).join('');
}

function gbDelete(idx) {
    if (!confirm('delete this entry?')) return;
    const entries = gbLoad();
    entries.splice(idx, 1);
    gbSave(entries);
    gbRender();
}

const gbForm = document.getElementById('gb-form');
if (gbForm) {
    gbForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('gb-name').value.trim();
        const url = document.getElementById('gb-url').value.trim();
        const msg = document.getElementById('gb-msg').value.trim();
        if (!name) { alert('please enter your name!'); return; }
        if (!msg) { alert('please write a message!'); return; }
        const entries = gbLoad();
        entries.push({ name, url, msg, ts: Date.now() });
        gbSave(entries);
        gbForm.reset();
        gbRender();
        playBeep();
    });
}

gbRender();