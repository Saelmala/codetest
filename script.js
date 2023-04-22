
const asset_api_url = "https://exposure.api.redbee.live:443/v1/customer/Eyevinn/businessunit/STSWE/content/asset?pageSize=50&pageNumber=1&fieldSet=PARTIAL&&&onlyPublished=true&&&&&&&&&includeTvShow=false&"
const token = "ses_099aa8ac-7b8f-4b1c-bdde-d47d62d32ca4p|05-102-B78B-89B2_29C72F|db16419c-3684-48d7-80ed-a125a3ecac6d|null|1681977151289|1713428436730|false|test|WEB||EyevinnSTSWE||/p7qG2fIYm1tJX+P0Vi/SwXYKlcFdbsgxa4dQXRnqZU="

// Används senare
let currentListItem = null
let currentVideoPlayer = null

// Hämtar assets och visar listan med videos
function loadVideoList() {
  fetch(asset_api_url)
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error("There was an error")
      }
    })
    .then(data => {
      console.log(data)
      displayVideoTitles(data)
    })
    .catch((error) => console.error("There was an error when fetching ", error))
}


function displayVideoTitles(data) {
  // Gjorde de fetchade videosen som en lista 
  const videoDiv = document.getElementById("video")
  const list = document.createElement("ul")
  
  // Ville inte ha några bulletpoints i listan
  list.style.listStyleType = "none"

  for (let i = 0; i < data.items.length; i++) {
    // Tar fram varje videos titel och assetId
    const title = data.items[i].localized[0].title
    const assetId = data.items[i].assetId

    // API Url för att göra play call
    const playURL = `https://exposure.api.redbee.live:443/v2/customer/Eyevinn/businessunit/STSWE/entitlement/${assetId}/play?audioOnly=false`

    const listItem = document.createElement("li")
    // Sätter titeln
    const heading = document.createElement("h1")
    heading.innerHTML = title
    listItem.appendChild(heading)

    // Tar fram första bilden för varje item i assets
    const img = document.createElement("img")
    img.src = data.items[i].localized[0].images[0].url
    img.width = 400
    img.height = 200
    listItem.appendChild(img)

    listItem.addEventListener("click", function() {

      // Kollar om det redan finns en video som spelar, stoppa den isåfall när man klickar på en ny
      if (currentVideoPlayer && currentListItem !== listItem) {
        currentVideoPlayer.reset()
        if (currentListItem.querySelector("img")) {
          currentListItem.querySelector("img").style.display = "block"
        }
        currentVideoPlayer = null
      }

      // Kollar om det man klickar är samma som det som man redan klickat på
      if (currentListItem !== listItem) {
        currentListItem = listItem
        if (currentListItem.querySelector("img")) {
          currentListItem.querySelector("img").style.display = "none"
        }
      // Fetchar playURL
        fetch(playURL, {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(info => {

          // Testade för att se så det stämde
          //console.log(assetId)
          //console.log(playURL)
          //console.log(info)

          // Skapar videoElement och sätter upp användarens kontroll + sätter upp video source
          const videoElement = document.createElement("video")
          videoElement.controls = true
          videoElement.src = info.formats[0].mediaLocator

          // Föredrog att ha samma storlek på videosarna som bilden innan
          videoElement.width = img.width
          videoElement.height = img.height

          // Tar bort listitem:ets bild och ersätter med videoelementet
          listItem.replaceChild(videoElement, img)

          // Sätter upp MediaPlayer och sätter som curentVideoPlayer
          currentVideoPlayer = dashjs.MediaPlayer().create()
          currentVideoPlayer.initialize(videoElement, videoElement.src, true)
          currentVideoPlayer.play()
        })
        .catch(error => console.error(error))

        // Test
        //console.log("Clicked On: " + title)
      }
    })

    list.appendChild(listItem)
  }

  videoDiv.appendChild(list)

  // Stylar titlarna
  videoDiv.style.fontSize = "10px"
  videoDiv.style.fontFamily = "Arial, sans-serif"
}

loadVideoList()
