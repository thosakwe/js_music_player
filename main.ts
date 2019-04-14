type Song = {
    url: string;
    coverArt: string;
    title: string;
    artist: string;
    album: string;
    imageMimeType: string;
    size: string;
}

let songIndex = -1;
let songAudio: HTMLAudioElement;
const songCoverArt = <HTMLImageElement>document.querySelector('#song-cover-art');
const songs: Song[] = [
    {
        url: '13.Bbc.mp3',
        coverArt: 'bbc.jpg',
        title: 'BBC',
        artist: 'Jay-Z',
        album: 'Magna Carta',
        imageMimeType: 'image/jpeg',
        size: '512x512'
    },
    {
        url: 'run_this.mp3',
        coverArt: 'run_this.jpg',
        title: 'Run This Town',
        artist: 'Jay-Z',
        album: 'Blueprint 3',
        imageMimeType: 'image/jpeg',
        size: '512x512'
    },
    {
        url: 'wdyk.mp3',
        coverArt: 'wdyk.jpg',
        title: "What You Don't Know",
        artist: 'Jackson 5',
        album: 'Dancing Machine',
        imageMimeType: 'image/jpeg',
        size: '512x512'
    },
    {
        url: 'catch_me.mp3',
        coverArt: 'https://i1.sndcdn.com/artworks-nxskf4nGHUa3-0-t500x500.jpg',
        title: 'Catch Me Outside',
        artist: 'Ski Mask the Slump God',
        album: 'You Will Regret',
        imageMimeType: 'image/jpeg',
        size: '500x500'
    }
];

window.onload = () => {
    songAudio = document.querySelector('#song-audio');
    if (navigator.mediaSession) {
        songAudio.onpause = () => { navigator.mediaSession.playbackState = "paused" };
        songAudio.onplay = () => { navigator.mediaSession.playbackState = "playing" };
    }
};

function playNext(): void {
    if (++songIndex >= songs.length) songIndex = 0;
    playSong(songs[songIndex]);
}

function playPrevious(): void {
    if (--songIndex < 0) songIndex = songs.length - 1;
    playSong(songs[songIndex]);
}

function playSong(song: Song): void {
    document.title = `${song.title} - ${song.artist}`;
    songCoverArt.src = song.coverArt;
    songCoverArt.style.removeProperty('display');
    document.getElementById('song-title').textContent = song.title;
    document.getElementById('song-artist').textContent = song.artist;
    document.getElementById('song-album').textContent = song.album;
    songAudio.src = song.url;

    let prom: Promise<void>;

    if (!('mediaSession' in navigator)) {
        prom = songAudio.play();
    } else {
        prom = songAudio.play().then(() => {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.artist,
                album: song.album,
                artwork: [
                    {
                        src: song.coverArt,
                        sizes: song.size,
                        type: song.imageMimeType
                    }
                ]
            });

            const skipTime = 10;
            navigator.mediaSession.setActionHandler('play', () => songAudio.play());
            navigator.mediaSession.setActionHandler('pause', () => songAudio.pause());
            navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
            navigator.mediaSession.setActionHandler('nexttrack', playNext);
            navigator.mediaSession.setActionHandler('seekbackward', () => {
                // User clicked "Seek Backward" media notification icon.
                songAudio.currentTime = Math.max(songAudio.currentTime - skipTime, 0)
            })

            navigator.mediaSession.setActionHandler('seekforward', () => {
                // User clicked "Seek Forward" media notification icon.
                songAudio.currentTime = Math.min(songAudio.currentTime + skipTime,
                    songAudio.duration)
            });
        });
    }

    prom.then(async () => {
        const result = await Notification.requestPermission();
        if (Notification.permission === 'granted') {
            new Notification(song.title, {
                badge: song.coverArt,
                icon: song.coverArt,
                image: song.coverArt,
                body: song.artist,
                silent: true
            });
        }
        else {
            console.info(Notification.permission);
        }
    });
}