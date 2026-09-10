const audio = document.getElementById('audio');
const playButtons = document.querySelectorAll('.play-btn');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const seekbar = document.getElementById('seekbar');
const signupModal = document.getElementById('signup-modal');
const loginModal = document.getElementById('login-modal');

document.querySelector('.signbtn').addEventListener('click', () => {
  signupModal.classList.remove('hidden');
});

document.querySelector('.loginbtn').addEventListener('click', () => {
  loginModal.classList.remove('hidden');
});

document.getElementById('close-signup').addEventListener('click', () => {
  signupModal.classList.add('hidden');
});

document.getElementById('close-login').addEventListener('click', () => {
  loginModal.classList.add('hidden');
});

// Helper: convert seconds -> "m:ss" format
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

let currentPlaylistSongs = [];
let currentPlaylistIndex = 0;

playButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const src = btn.getAttribute('data-src');
    const name = btn.getAttribute('data-name');

    if (audio.src.includes(src) && !audio.paused) {
      audio.pause();
    } else {
      audio.src = src;
      audio.play();

      // Set this as the current queue so next/prev can navigate through all songs
      currentPlaylistSongs = songLibrary;
      currentPlaylistIndex = songLibrary.findIndex(song => song.src === src);
    }
  });
});

// Runs continuously while the song plays
audio.addEventListener('timeupdate', () => {
  currentTimeEl.textContent = formatTime(audio.currentTime);
  seekbar.value = (audio.currentTime / audio.duration) * 100 || 0;
});

// Runs once, as soon as the song's metadata (including duration) loads
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});

// Let the user drag the seekbar to jump to a point in the song
seekbar.addEventListener('input', () => {
  audio.currentTime = (seekbar.value / 100) * audio.duration;
});

// Play / pause toggle button
const playPauseBtn = document.getElementById('play-pause-btn');

playPauseBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});

// Keep the icon in sync with actual playback state
audio.addEventListener('play', () => {
  playPauseBtn.src = 'https://ico.hugeicons.com/pause-stroke-rounded@2x.webp?x=1330058034';
});

audio.addEventListener('pause', () => {
  playPauseBtn.src = 'https://ico.hugeicons.com/play-stroke-rounded@2x.webp?x=1330058034';
});

// Build a songs array directly from your existing play buttons
const songLibrary = Array.from(playButtons).map(btn => ({
  name: btn.getAttribute('data-name'),
  src: btn.getAttribute('data-src')
}));

// Where saved playlists live (in-memory only — resets on refresh)
let playlists = [];

const createPlaylistBtn = document.getElementById('create-playlist-btn');
const playlistModal = document.getElementById('playlist-modal');
const songChecklist = document.getElementById('song-checklist');
const playlistError = document.getElementById('playlist-error');

createPlaylistBtn.addEventListener('click', () => {
  // Build checkboxes fresh each time the modal opens
  songChecklist.innerHTML = songLibrary.map((song, index) => `
    <label style="display: block; color: white; margin: 6px 0;">
      <input type="checkbox" value="${index}"> ${song.name}
    </label>
  `).join('');

  playlistModal.classList.remove('hidden');
});

document.getElementById('close-playlist').addEventListener('click', () => {
  playlistModal.classList.add('hidden');
});

const playlistSubmit = document.getElementById('playlist-submit');

playlistSubmit.addEventListener('click', () => {
  const name = document.getElementById('playlist-name').value.trim();
  playlistError.textContent = '';

  if (!name) {
    playlistError.textContent = 'Please enter a playlist name.';
    return;
  }

  // Grab every checked checkbox inside the checklist
  const checked = songChecklist.querySelectorAll('input[type="checkbox"]:checked');

  if (checked.length === 0) {
    playlistError.textContent = 'Select at least one song.';
    return;
  }

  // Convert checked checkboxes -> actual song objects from songLibrary
  const selectedSongs = Array.from(checked).map(cb => songLibrary[cb.value]);

  playlists.push({ name, songs: selectedSongs });

  playlistModal.classList.add('hidden');
  document.getElementById('playlist-name').value = ''; // reset for next time

  renderPlaylists();
});

const playlistsContainer = document.getElementById('playlists-container');
function renderPlaylists() {
  playlistsContainer.innerHTML = playlists.map((playlist, index) => `
    <div class="user-playlist" data-playlist-index="${index}" style="color: white; padding: 8px 0; cursor: pointer; border-bottom: 1px solid #333;">
      <strong>Playlist ${index + 1}: ${playlist.name}</strong>
      <div style="font-size: 12px; color: #b3b3b3;">${playlist.songs.length} song${playlist.songs.length !== 1 ? 's' : ''}</div>
    </div>
  `).join('');
}

playlistsContainer.addEventListener('click', (e) => {
  const playlistEl = e.target.closest('.user-playlist');
  if (!playlistEl) return;

  const index = playlistEl.getAttribute('data-playlist-index');
  const playlist = playlists[index];

  playCurrentPlaylist(playlist);
});

function playCurrentPlaylist(playlist) {
  currentPlaylistSongs = playlist.songs;
  currentPlaylistIndex = 0;
  playSongAtIndex(currentPlaylistIndex);
}

function playSongAtIndex(index) {
  const song = currentPlaylistSongs[index];
  if (!song) return;

  audio.src = song.src;
  audio.play();
}

// When a song ends, auto-advance to the next one in the current playlist
audio.addEventListener('ended', () => {
  if (currentPlaylistSongs.length === 0) return; // not playing from a playlist

  currentPlaylistIndex++;
  if (currentPlaylistIndex < currentPlaylistSongs.length) {
    playSongAtIndex(currentPlaylistIndex);
  } else {
    currentPlaylistSongs = []; // playlist finished
  }
});

// Previous / Next buttons
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

prevBtn.addEventListener('click', () => {
  if (currentPlaylistSongs.length === 0) return;

  currentPlaylistIndex--;
  if (currentPlaylistIndex < 0) {
    currentPlaylistIndex = currentPlaylistSongs.length - 1; // wrap to last song
  }
  playSongAtIndex(currentPlaylistIndex);
});

nextBtn.addEventListener('click', () => {
  if (currentPlaylistSongs.length === 0) return;

  currentPlaylistIndex++;
  if (currentPlaylistIndex >= currentPlaylistSongs.length) {
    currentPlaylistIndex = 0; // wrap to first song
  }
  playSongAtIndex(currentPlaylistIndex);
});

// Home / About modal
const homeBtn = document.getElementById('home-btn');

// Podcasts view switching
const mainView = document.getElementById('main-view');
const podcastsView = document.getElementById('podcasts-view');
const browsePodcastsBtn = document.getElementById('browse-podcasts-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');

browsePodcastsBtn.addEventListener('click', () => {
  mainView.classList.add('hidden');
  podcastsView.classList.remove('hidden');
});

backToHomeBtn.addEventListener('click', () => {
  podcastsView.classList.add('hidden');
  mainView.classList.remove('hidden');
});

const signupSubmit = document.getElementById('signup-submit');
const loginSubmit = document.getElementById('login-submit');
const signupError = document.getElementById('signup-error');
const loginError = document.getElementById('login-error');

signupSubmit.addEventListener('click', async () => {
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  signupError.textContent = ''; // clear old error, if any

  try {
    const response = await fetch('http://localhost:3001/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      signupError.textContent = data.error;
      return;
    }

    // Success
    signupModal.classList.add('hidden');
    alert('Account created! You can now log in.');
  } catch (err) {
    console.error(err);
    signupError.textContent = 'Something went wrong. Try again.';
  }
});

loginSubmit.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  loginError.textContent = '';

  try {
    const response = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      loginError.textContent = data.error;
      return;
    }

    // Success
    loginModal.classList.add('hidden');
    checkLoginStatus();
  } catch (err) {
    console.error(err);
    loginError.textContent = 'Something went wrong. Try again.';
  }
});

const authButtons = document.getElementById('auth-buttons');

async function checkLoginStatus() {
  try {
    const response = await fetch('http://localhost:3001/me', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      showLoggedInUI(data.username);
    } else {
      showLoggedOutUI();
    }
  } catch (err) {
    console.error(err);
    showLoggedOutUI();
  }
}

function showLoggedInUI(username) {
  authButtons.innerHTML = `
    <span style="color: white; margin-right: 10px;">Welcome, ${username}</span>
    <button id="logout-btn">Logout</button>
  `;

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('http://localhost:3001/logout', {
      method: 'POST',
      credentials: 'include'
    });
    showLoggedOutUI();
  });
}

function showLoggedOutUI() {
  authButtons.innerHTML = `
    <button class="signbtn">Signup</button>
    <button class="loginbtn">Login</button>
  `;

  // Re-attach listeners since these buttons were just recreated
  document.querySelector('.signbtn').addEventListener('click', () => {
    signupModal.classList.remove('hidden');
  });

  document.querySelector('.loginbtn').addEventListener('click', () => {
    loginModal.classList.remove('hidden');
  });
}

checkLoginStatus(); // run once when the page loads
