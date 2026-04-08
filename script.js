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
                }

                
                const activityEl = document.getElementById('discord-activity');
                if (activityEl) {
                    const nonCustomActivities = data.activities.filter(act => act.type !== 4);
                    if (data.listening_to_spotify && data.spotify) {
                        activityEl.innerHTML = `<img src="${data.spotify.album_art_url}" style="width:24px; height:24px; vertical-align:middle; border-radius:3px; margin-right:5px; box-shadow:0 0 3px rgba(0,0,0,0.5);"><span style="vertical-align:middle;">Listening to <strong>${data.spotify.song}</strong></span>`;
                    } else if (nonCustomActivities.length > 0) {
                        const activity = nonCustomActivities[0];
                        let appIconStr = '';
                        if (activity.application_id) {
                            appIconStr = `<img src="https://dcdn.dstn.to/app-icons/${activity.application_id}" style="width:24px; height:24px; vertical-align:middle; border-radius:4px; margin-right:5px; box-shadow:0 0 3px rgba(0,0,0,0.5);" onerror="this.style.display='none'">`;
                        } else if (activity.assets && activity.assets.large_image) {
                            let imgUrl = activity.assets.large_image.startsWith('mp:external/')
                                ? `https://media.discordapp.net/external/${activity.assets.large_image.split('mp:external/')[1]}`
                                : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
                            appIconStr = `<img src="${imgUrl}" style="width:24px; height:24px; vertical-align:middle; border-radius:4px; margin-right:5px; box-shadow:0 0 3px rgba(0,0,0,0.5);" onerror="this.style.display='none'">`;
                        }
                        activityEl.innerHTML = `${appIconStr}<span style="vertical-align:middle;">${activity.type === 0 ? 'Playing' : 'Activity'}: ${activity.name}</span>`;
                    } else {
                        activityEl.innerHTML = '<span style="vertical-align:middle;">None</span>';
                    }
                }

                
                const moodEl = document.getElementById('my-discord-mood');
                const messageEl = document.getElementById('my-discord-custom-message');
                const customStatus = data.activities.find(act => act.type === 4);
                const timeEl = document.getElementById('my-discord-time');

                function formatTimeAgo(ts) {
                    if (!ts) return '';
                    const seconds = Math.floor((Date.now() - ts) / 1000);
                    if (seconds <= 0) return ' just now';
                    if (seconds < 60) return ` ${seconds} seconds ago`;
                    const mins = Math.floor(seconds / 60);
                    if (mins < 60) return ` ${mins} min${mins > 1 ? 's' : ''} ago`;
                    const hours = Math.floor(mins / 60);
                    if (hours < 24) return ` ${hours} hour${hours > 1 ? 's' : ''} ago`;
                    const days = Math.floor(hours / 24);
                    return ` ${days} day${days > 1 ? 's' : ''} ago`;
                }

                if (customStatus) {
                    localStorage.removeItem('xey_status_cleared');
                    if (timeEl) timeEl.textContent = formatTimeAgo(customStatus.created_at);

                    if (moodEl) {
                        let emojiHtml = '💭';
                        if (customStatus.emoji) {
                            if (customStatus.emoji.id) {
                                emojiHtml = `<img src="https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${customStatus.emoji.animated ? 'gif' : 'webp'}?size=32" style="width:16px;vertical-align:middle">`;
                            } else {
                                emojiHtml = customStatus.emoji.name;
                            }
                        }
                        moodEl.innerHTML = `xeydev ${emojiHtml}`;
                    }
                    if (messageEl) {
                        messageEl.textContent = customStatus.state || 'Just chilling...';
                    }
                } else {
                    let clearedTime = localStorage.getItem('xey_status_cleared');
                    if (!clearedTime) {
                        clearedTime = Date.now();
                        localStorage.setItem('xey_status_cleared', clearedTime);
                    }
                    if (timeEl) timeEl.textContent = formatTimeAgo(parseInt(clearedTime, 10));

                    if (moodEl) moodEl.innerHTML = `xeydev`;
                    if (messageEl) messageEl.textContent = `If you see this, I'm probably offline.`;
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

    clock.innerHTML = `
        <span style="font-size: 26px; padding: 2px 7px; height:32px; display:inline-flex; align-items:center; justify-content:center;">${h[0]}</span>
        <span style="font-size: 26px; padding: 2px 7px; height:32px; display:inline-flex; align-items:center; justify-content:center;">${h[1]}</span>
        <b style="color:#00e5ff; margin:0 3px; font-size:20px; text-shadow:0 0 5px #00e5ff; display:inline-flex; align-items:center; justify-content:center; height:32px;">:</b>
        <span style="font-size: 26px; padding: 2px 7px; height:32px; display:inline-flex; align-items:center; justify-content:center;">${m[0]}</span>
        <span style="font-size: 26px; padding: 2px 7px; height:32px; display:inline-flex; align-items:center; justify-content:center;">${m[1]}</span>
        <b style="color:#00e5ff; margin:0 3px; font-size:20px; text-shadow:0 0 5px #00e5ff; display:inline-flex; align-items:center; justify-content:center; height:32px;">:</b>
        <span style="font-size: 26px; padding: 2px 7px; height:32px; display:inline-flex; align-items:center; justify-content:center;">${s[0]}</span>
        <span style="font-size: 26px; padding: 2px 7px; height:32px; display:inline-flex; align-items:center; justify-content:center;">${s[1]}</span>
    `;
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