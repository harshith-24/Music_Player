document.addEventListener('DOMContentLoaded', function() {
    // Music data
    const songs = [
        {
            title: "Danda Kadiyal",
            artist: "KoshalWorld",
            src: "../uploads/DandaKadiyal(KoshalWorld.Com).mp3",
        },
        {
            title: "Golden Sparrow",
            artist: "KoshalWorld",
            src: "../uploads/Golden Sparrow(KoshalWorld.Com).mp3",
        },
        {
            title: "Jaan Hai Meri",
            artist: "KoshalWorld",
            src: "../uploads/Jaan Hai Meri(KoshalWorld.Com).mp3",
        },
        {
            title: "Niyat Kharab",
            artist: "KoshalWorld",
            src: "../uploads/Niyat Kharab(KoshalWorld.Com).mp3",
        },
        {
            title: "Pasoori x Despacito Mashup",
            artist: "KoshalWorld",
            src: "../uploads/Pasoori x Despacito Mashup(KoshalWorld.Com).mp3",
        },
        {
            title: "Ramana Aei",
            artist: "KoshalWorld",
            src: "../uploads/Ramana Aei(KoshalWorld.Com).mp3",
        },
        {
            title: "Aazma Lenge Dum",
            artist: "KoshalWorld",
            src: "../uploads/Aazma Lenge Dum(KoshalWorld.Com).mp3",
        },
        {
            title: "Barbaad",
            artist: "KoshalWorld",
            src: "../uploads/Barbaad(KoshalWorld.Com).mp3",
        },
        {
            title: "Aankhon Mein Jal Raha Hai Kyun",
            artist: "KoshalWorld",
            src: "../uploads/Aankhon Mein Jal Raha Hai Kyun(KoshalWorld.Com).mp3",
        },
        {
            title: "Chal Ghar Chalen",
            artist: "KoshalWorld",
            src: "../uploads/Chal Ghar Chalen(KoshalWorld.Com).mp3",
        }
    ];

    // DOM Elements
    const audioPlayer = document.getElementById('audio-player');
    const playButton = document.getElementById('play-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const songNameElement = document.getElementById('song-name');
    const artistNameElement = document.getElementById('artist-name');
    const currentTimeElement = document.getElementById('current-time');
    const totalTimeElement = document.getElementById('total-time');
    const progressBar = document.getElementById('progress');
    const progressHandle = document.getElementById('progress-handle');
    const progressContainer = document.querySelector('.progress-bar');
    const volumeProgress = document.getElementById('volume-progress');
    const volumeHandle = document.getElementById('volume-handle');
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const playlistElement = document.getElementById('playlist');

    // State variables
    let currentSongIndex = 0;
    let isPlaying = false;
    let volume = 0.7;
    let autoplay = true;
    let previousVolume = 0.7;

    // Initialize the player
    initPlayer();

    // Event listeners for controls
    playButton.addEventListener('click', () => togglePlay());
    prevButton.addEventListener('click', playPreviousSong);
    nextButton.addEventListener('click', playNextSong);
    
    // Progress bar events
    progressContainer.addEventListener('click', seekTo);
    
    // Volume control events
    volumeSlider.addEventListener('click', changeVolume);
    volumeIcon.addEventListener('click', toggleMute);
    
    // Audio player events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', handleSongEnd);
    audioPlayer.addEventListener('loadedmetadata', updateTotalTime);

    // Initialize the player
    function initPlayer() {
        // Set initial volume1
        audioPlayer.volume = volume;
        updateVolumeUI();
        
        // Populate playlist
        populatePlaylist();
        
        // Load first song
        loadSong(currentSongIndex);
    }

    // Populate the playlist
    function populatePlaylist() {
        playlistElement.innerHTML = '';
        
        songs.forEach((song, index) => {
            const row = document.createElement('tr');
            row.className = index === currentSongIndex ? 'song-row song-active' : 'song-row';
            row.dataset.index = index;
            
            // Format song duration (to be updated when song metadata is loaded)
            const songDuration = '0:00';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${song.title}</td>
                <td>${song.artist}</td>
                <td class="song-duration" id="duration-${index}">${songDuration}</td>
            `;
            
            row.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(currentSongIndex);
                togglePlay(true); // Force play
            });
            
            playlistElement.appendChild(row);
        });
        
        // Load song durations
        loadAllSongDurations();
    }
    
    // Load all song durations
    function loadAllSongDurations() {
        songs.forEach((song, index) => {
            const tempAudio = new Audio();
            tempAudio.src = song.src;
            
            tempAudio.addEventListener('loadedmetadata', () => {
                const durationElement = document.getElementById(`duration-${index}`);
                if (durationElement) {
                    durationElement.textContent = formatTime(tempAudio.duration);
                }
            });
            
            tempAudio.addEventListener('error', () => {
                const durationElement = document.getElementById(`duration-${index}`);
                if (durationElement) {
                    durationElement.textContent = 'Error';
                }
            });
        });
    }

    // Load a song
    function loadSong(index) {
        // Update current song index
        currentSongIndex = index;
        
        // Update the audio source
        audioPlayer.src = songs[index].src;
        
        // Update the song and artist display
        songNameElement.textContent = songs[index].title;
        artistNameElement.textContent = songs[index].artist;
        
        // Reset progress
        progressBar.style.width = '0%';
        currentTimeElement.textContent = '0:00';
        
        // Update active song in playlist
        updateActiveInPlaylist();
    }

    // Update active song in playlist
    function updateActiveInPlaylist() {
        const songRows = document.querySelectorAll('.song-row');
        songRows.forEach(row => {
            row.classList.remove('song-active');
        });
        
        const activeRow = document.querySelector(`.song-row[data-index="${currentSongIndex}"]`);
        if (activeRow) {
            activeRow.classList.add('song-active');
        }
    }

    // Play or pause the current song
    function togglePlay(forcePlay = false) {
        if (audioPlayer.paused || forcePlay) {
            audioPlayer.play()
                .then(() => {
                    isPlaying = true;
                    playButton.innerHTML = '<i class="fas fa-pause"></i>';
                })
                .catch(error => {
                    console.error('Error playing the audio:', error);
                });
        } else {
            audioPlayer.pause();
            isPlaying = false;
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    }


    // Play next song
    function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        
        if (isPlaying || autoplay) {
            togglePlay(true);
        }
    }

    // Play previous song
    function playPreviousSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
        
        if (isPlaying || autoplay) {
            togglePlay(true);
        }
    }

    // Update progress bar
    function updateProgress() {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        
        if (duration) {
            // Update progress bar width
            const progressPercent = (currentTime / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            progressHandle.style.left = `${progressPercent}%`;
            
            // Update current time display
            currentTimeElement.textContent = formatTime(currentTime);
        }
    }

    // Update total time display
    function updateTotalTime() {
        const duration = audioPlayer.duration;
        totalTimeElement.textContent = formatTime(duration);
    }

    // Format time in MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Handle song end
    function handleSongEnd() {
        if (autoplay) {
            playNextSong();
        } else {
            isPlaying = false;
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    // Seek to position in the song
    function seekTo(event) {
        const width = progressContainer.clientWidth;
        const clickPosition = event.offsetX;
        const duration = audioPlayer.duration;
        
        audioPlayer.currentTime = (clickPosition / width) * duration;
    }

    // Change volume
    function changeVolume(event) {
        const width = volumeSlider.clientWidth;
        const clickPosition = event.offsetX;
        
        volume = clickPosition / width;
        if (volume > 1) volume = 1;
        if (volume < 0) volume = 0;
        
        audioPlayer.volume = volume;
        previousVolume = volume;
        
        updateVolumeUI();
        updateVolumeIcon();
    }

    // Update volume UI
    function updateVolumeUI() {
        volumeProgress.style.width = `${volume * 100}%`;
        volumeHandle.style.left = `${volume * 100}%`;
    }

    // Toggle mute
    function toggleMute() {
        if (audioPlayer.volume > 0) {
            previousVolume = audioPlayer.volume;
            audioPlayer.volume = 0;
            volume = 0;
        } else {
            audioPlayer.volume = previousVolume;
            volume = previousVolume;
        }
        
        updateVolumeUI();
        updateVolumeIcon();
    }

    // Update volume icon based on volume level
    function updateVolumeIcon() {
        volumeIcon.className = '';
        
        if (volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume <= 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }

    // Keyboard controls
    document.addEventListener('keydown', function(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                // Rewind 5 seconds
                audioPlayer.currentTime -= 5;
                break;
            case 'ArrowRight':
                // Forward 5 seconds
                audioPlayer.currentTime += 5;
                break;
            case 'ArrowUp':
                // Increase volume
                volume = Math.min(1, volume + 0.1);
                audioPlayer.volume = volume;
                updateVolumeUI();
                updateVolumeIcon();
                break;
            case 'ArrowDown':
                // Decrease volume
                volume = Math.max(0, volume - 0.1);
                audioPlayer.volume = volume;
                updateVolumeUI();
                updateVolumeIcon();
                break;
        }
    });

    // Make the progress and volume sliders draggable
    let isDraggingProgress = false;
    let isDraggingVolume = false;

    progressContainer.addEventListener('mousedown', () => {
        isDraggingProgress = true;
    });

    volumeSlider.addEventListener('mousedown', () => {
        isDraggingVolume = true;
    });

    document.addEventListener('mouseup', () => {
        isDraggingProgress = false;
        isDraggingVolume = false;
    });

    document.addEventListener('mousemove', (event) => {
        if (isDraggingProgress) {
            const rect = progressContainer.getBoundingClientRect();
            const position = (event.clientX - rect.left) / progressContainer.clientWidth;
            const clampedPosition = Math.max(0, Math.min(1, position));
            
            audioPlayer.currentTime = clampedPosition * audioPlayer.duration;
            progressBar.style.width = `${clampedPosition * 100}%`;
            progressHandle.style.left = `${clampedPosition * 100}%`;
        }
        
        if (isDraggingVolume) {
            const rect = volumeSlider.getBoundingClientRect();
            const position = (event.clientX - rect.left) / volumeSlider.clientWidth;
            const clampedPosition = Math.max(0, Math.min(1, position));
            
            volume = clampedPosition;
            audioPlayer.volume = volume;
            previousVolume = volume;
            volumeProgress.style.width = `${clampedPosition * 100}%`;
            volumeHandle.style.left = `${clampedPosition * 100}%`;
            updateVolumeIcon();
        }
    });
});