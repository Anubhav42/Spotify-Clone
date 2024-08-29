console.log("lets write javascript");
let currentSong = new Audio();
let songs=[];
let currFolder;

function formatTime(seconds) {
  seconds=Math.floor(seconds);
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Format minutes and seconds to always have two digits
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  // Return the formatted time as "MM:SS"
  return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder){

    currFolder = folder;
    let a= await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response= await a.text()
    console.log(response)

    let div= document.createElement("div")
    div.innerHTML = response;

    songs=[]
    let as=div.getElementsByTagName("a")
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp4")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        
    }
    // return songs

    //show all the songs in the playlist
    let songUL= document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML= songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20"," ")}</div>
                  <div>Anubhav</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="img/play.svg" alt="">
                </div> </li>`;
        
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => { 
      e.addEventListener("click", element=>{
        console.log(e.querySelector(".info").firstElementChild.innerHTML)
        playMusic(e.querySelector(".info").firstElementChild.innerHTML)

      })

    })

    return songs;

}

const playMusic = (track , pause=false)=>{
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if(!pause){
      currentSong.play()
      play.src="img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML ="00:00/00:00"

    // document.querySelector(".circle").style.left = "0%";


}

async function displayAlbums(){
    let a= await fetch(`http://127.0.0.1:3000/songs/`)
    let response= await a.text();
    let div= document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
      for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
      

        if(e.href.includes("/songs")){
          let folder= e.href.split("/").slice(-2)[0] //name of the folders
          //Get the metadata of the folder
          let a= await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
          let response= await a.json();
          console.log(response)
          cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4 L20 12 L4 20 Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
              </div>

              <img src="/songs/${folder}/cover.jpg" alt="">
              <h3>${response.title}</h3>
              <p>${response.description}</p>
              </div>`
              }
      }    
          
      // Load the playlist whenever the card is clicked
      Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
          console.log("Fetching Songs")
          // songs= await getSongs("songs/ncs")
          songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
          playMusic(songs[0])
       })
      })


}


async function main(){

    //get the list of these songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)
    
    //Display all the albums on the page
    displayAlbums()
    

    //Attach an event listener to play, next and previous
    play.addEventListener("click", ()=>{
      if(currentSong.paused){
        currentSong.play()
        play.src = "img/pause.svg"
      }
      else{
        currentSong.pause()
        play.src = "img/play.svg"
      }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
      console.log(currentSong.currentTime, currentSong.duration);
      document.querySelector(".songtime").innerHTML = 
      `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;

      const progress = (currentSong.currentTime / currentSong.duration) * 100;
      document.querySelector(".circle").style.left = progress + "%";
    } )

    document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration)* 100 + "%"

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
       let percent= (e.offsetX/e.target.getBoundingClientRect().width )*100;
       document.querySelector(".circle").style.left= percent + "%";
       currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener to previous 
    previous.addEventListener("click", ()=> {
      currentSong.pause()
      console.log("Previous clicked")
      console.log(currentSong)
      let index= songs.indexOf(currentSong.src.split("/").slice(-1)[0])
      // console.log(songs, index)

      if((index-1) >= 0){
        playMusic(songs[index-1])
      }



    })

    // Add an event listener to  next
    next.addEventListener("click", ()=> {
      currentSong.pause()
      console.log("Next clicked")

      let index= songs.indexOf(currentSong.src.split("/").slice(-1)[0])
      // console.log(songs, index)

      if((index+1) < songs.length){
        playMusic(songs[index+1])
      }
      else {
        playMusic(songs[0]);
      }

    })

     // Add an event to volume(making the volume slider work)
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
      console.log("Setting volume to" ,e.target.value, "/100")
      currentSong.volume= parseInt(e.target.value)/100
    })
  
    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
      if(e.target.src.includes("volume.svg")){
          e.target.src = e.target.src.replace("volume.svg", "mute.svg")
          currentSong.volume = 0;
          document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
          console.log("Volume muted")
      }
      else{
          e.target.src = e.target.src.replace("mute.svg", "volume.svg")
          currentSong.volume = .10;
          document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
          console.log("Volume unmuted")
      }
    })  
    


}

main()
