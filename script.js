const audio = document.getElementById('audio');
const playButtons = document.querySelectorAll('.play-btn');
const nowPlayingName = document.getElementById('current-song-name');
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

playButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const src = btn.getAttribute('data-src');
    const name = btn.getAttribute('data-name');

    if (audio.src.includes(src) && !audio.paused) {
      audio.pause();
    } else {
      audio.src = src;
      audio.play();
      nowPlayingName.textContent = name; 
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


 
























