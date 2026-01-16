console.log('Lets write javascript!');
let currentSong = new Audio();
const playIcon = document.getElementById("play");
const menu = document.getElementById("menu")
const cross = document.getElementById("cross")
const navMenu = document.getElementById("navMenu")
const close = document.getElementById("closeNav")
const leftContent = document.querySelector(".left-content");
const nav = document.querySelector(".nav");
const tap = document.querySelector(".right-content");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const vol = document.getElementById("vol");
let toastBox = document.getElementById("toastBox")
let lastVolume = 1;

let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5501/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3") || element.href.endsWith(".mp4") || element.href.endsWith(".m4a")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }

    }
    //Show all the songs in the playlist

    let songUl = document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";

    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                                        <i class='bx bxs-music'></i>
                                        <div class="info">
                                            <div>${song.replaceAll("%20", " ")}</div>
                                            <div>Arjit Singh</div> 
                                        </div>
                                        <div class="playbox flex">
                                            Play Now<i class = 'playbox bx bx-play-circle'></i>
                                        </div></li>`;

    }
    return songs;

}


const playMusic = (track) => {
    // let audio = new Audio(`/${folder}/` + track);
    currentSong.src = `/${currFolder}/` + decodeURIComponent(track);
    currentSong.play();
    playIcon.classList.remove("bx-play");
    playIcon.classList.add("bx-pause");
    // sirf songinfo update karo, baaki div intact rahe
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songTime").innerHTML = "00:00/00:00";
}

const playFirst = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + decodeURIComponent(track);
    if (!pause) {
        currentSong.play();
        playIcon.classList.remove("bx-play");
        playIcon.classList.add("bx-pause");
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songTime").innerHTML = "00:00/00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5501/songs/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {

            let folder = e.href.split("/").slice(-1)[0];
            if (folder === "songs") continue;
            let a = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`);

            if (!a.ok) {
                console.warn("info.json not found for folder:", folder);
                continue; // skip this folder
            }
            let response = await a.json();
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card border-card" data-folder="${folder}">
                        <div class="play"><i class='bx bx-play'></i></div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }

    }
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e)
        e.addEventListener("click", async item => {
            // console.log(item, item.currentTarget.dataset)
            await getsongs(`songs/${item.currentTarget.dataset.folder}`)

            playMusic(songs[0])
        })
    });

}
async function main() {
    // Get the list of all the songs
    await getsongs("songs/All_time_favorite_Songs")
    playFirst(songs[0], true)

    displayAlbums();

    // Attach an event listener to each song

    document.querySelector(".songsList").addEventListener("click", (e) => {
        let li = e.target.closest("li");
        if (!li) return;
        let song = li.querySelector(".info").firstElementChild.innerHTML.trim();
        let icon = li.querySelector(".playbox i");
        document.querySelectorAll(".playbox i").forEach(icon => {
            icon.classList.remove("bx-pause-circle");
            icon.classList.add("bx-play-circle");
        });

        icon.classList.remove("bx-play-circle");
        icon.classList.add("bx-pause-circle");

        playMusic(song);
    });

    // Attach an event listener to play, next, and previous.

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playIcon.classList.remove("bx-play");
            playIcon.classList.add("bx-pause");



        }
        else {
            currentSong.pause();
            playIcon.classList.remove("bx-pause");
            playIcon.classList.add("bx-play");
        }
    });

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime) / (currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })
    // Add an event listener for hamburger.
    menu.addEventListener("click", () => {
        leftContent.classList.toggle("open");
    });

    cross.addEventListener("click", () => {
        leftContent.classList.toggle("open");
    });

    navMenu.addEventListener("click", () => {

        nav.style.top = "0";
    });
    close.addEventListener("click", () => {
        nav.style.top = "-1000%";
    });

    tap.addEventListener("click", () => {

        leftContent.classList.remove("open");
    });

    tap.addEventListener("click", () => {
        nav.style.top = "-1000%";
    });


    function togglePlayPause() {
        if (currentSong.paused) {
            currentSong.play();
            playIcon.classList.remove("bx-play");
            playIcon.classList.add("bx-pause");
        }
        else {
            currentSong.pause();
            playIcon.classList.remove("bx-pause");
            playIcon.classList.add("bx-play");

        }
    }
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space" || e.key.toLowerCase() === "k") {
            e.preventDefault();
            togglePlayPause();
        }
    });

    //Add an evenlistener to privious
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1].replaceAll("%20", " "))
        }
        else {
            if (document.querySelector(".toast")) {
                return;
            }
            let toast = document.createElement("div");
            toast.classList.add("toast");
            toast.innerHTML = "<i class='bx bxs-info-circle'></i> You’re already at the first track.";
            toastBox.appendChild(toast);
            playIcon.classList.remove("bx-pause");
            playIcon.classList.add("bx-play");
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    });
    //Add an evenlistener to next
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1].replaceAll("%20", " "))
        }
        else {
            if (document.querySelector(".toast")) {
                return;
            }
            let toast = document.createElement("div");
            toast.classList.add("toast");
            toast.innerHTML = "<i class='bx bxs-info-circle'></i> You’ve reached the last track.";
            toastBox.appendChild(toast);
            playIcon.classList.remove("bx-pause");
            playIcon.classList.add("bx-play");
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    });

    // Auto play next song when current ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1].replaceAll("%20", " "));
        } else {
            // Last song reached → optionally show toast
            let toast = document.createElement("div");
            toast.classList.add("toast");
            toast.innerHTML = "<i class='bx bxs-info-circle'></i> You’ve reached the last track.";
            toastBox.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
            playIcon.classList.remove("bx-pause");
            playIcon.classList.add("bx-play");
        }
    });

    //Add an evenlistener to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        // console.log(e, e.target, e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100;
        lastVolume = currentSong.volume;

        if (currentSong.volume === 0) {
            vol.classList.remove("bxs-volume", "bxs-volume-full", "bxs-volume-low");
            vol.classList.add("bxs-volume-mute");

        }
        else if (currentSong.volume > 0 && currentSong.volume < 0.3) {
            vol.classList.remove("bxs-volume", "bxs-volume-full", "bxs-volume-mute");
            vol.classList.add("bxs-volume-low");
        }
        else if (currentSong.volume >= 0.3 && currentSong.volume <= 0.7) {
            vol.classList.remove("bxs-volume-low", "bxs-volume-full", "bxs-volume-mute");
            vol.classList.add("bxs-volume");
        }
        else if (currentSong.volume > 0.7) {
            vol.classList.remove("bxs-volume", "bxs-volume-low", "bxs-volume-mute");
            vol.classList.add("bxs-volume-full");
        }


    });

    vol.addEventListener("click", () => {
        if (currentSong.volume > 0) {
            lastVolume = currentSong.volume;
            currentSong.volume = 0;
            vol.classList.remove("bxs-volume", "bxs-volume-full", "bxs-volume-low");
            vol.classList.add("bxs-volume-mute");

            document.querySelector(".range input").value = 0;
        }
        else {
            currentSong.volume = lastVolume;
            document.querySelector(".range input").value = lastVolume * 100;


            if (lastVolume > 0 && lastVolume < 0.3) {
                vol.classList.remove("bxs-volume", "bxs-volume-full", "bxs-volume-mute");
                vol.classList.add("bxs-volume-low");
            }
            else if (lastVolume >= 0.3 && lastVolume <= 0.7) {
                vol.classList.remove("bxs-volume-low", "bxs-volume-full", "bxs-volume-mute");
                vol.classList.add("bxs-volume");
            }
            else if (lastVolume > 0.7) {
                vol.classList.remove("bxs-volume", "bxs-volume-low", "bxs-volume-mute");
                vol.classList.add("bxs-volume-full");
            }
        }

    });



}

main();