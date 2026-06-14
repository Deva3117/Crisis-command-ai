/* ========================= */
/* GLOBAL VARIABLES */
/* ========================= */

let currentUser = {};

let rescueTeams = [];

let emergencies = [];

let resources = [];

let notificationCounter = 0;

let map;

let userLat = null;
let userLng = null;

const GEMINI_API_KEY =
"YOUR API CODE_HERE";

/* ========================= */
/* SCREEN NAVIGATION */
/* ========================= */

function hideAllScreens(){

  document.querySelectorAll(".screen")
  .forEach(screen=>{
    screen.classList.remove("active");
  });

}

function openVictimForm(){

  hideAllScreens();

  document.getElementById("victimForm")
  .classList.add("active");

}

function openTeamForm(){

  hideAllScreens();

  document.getElementById("teamForm")
  .classList.add("active");

}

function openContributeScreen(){

  hideAllScreens();

  document.getElementById(
    "contributeScreen"
  ).classList.add("active");

}

function openReliefFund(){

  hideAllScreens();

  document.getElementById(
    "reliefFundScreen"
  ).classList.add("active");

}

function openRescuePanel(panelId){

document
.querySelectorAll(".rescuePanel")
.forEach(panel=>{

panel.classList.remove("active");

});

document
.getElementById(panelId)
.classList.add("active");

}

/* ========================= */
/* PHONE VALIDATION */
/* ========================= */

function validatePhone(phone){

  return /^[0-9]{10}$/.test(phone);

}

/* ========================= */
/* GPS LOCATION */
/* ========================= */

function getLiveLocation(callback){

  if(navigator.geolocation){

    navigator.geolocation.getCurrentPosition(

      function(position){

        userLat = position.coords.latitude;
        userLng = position.coords.longitude;

        callback();

      },

      function(){

        alert("Location permission denied");

      }

    );

  }else{

    alert("Geolocation not supported");

  }

}

/* ========================= */
/* VICTIM LOGIN */
/* ========================= */
function enterVictimDashboard(){

  let name =
  document.getElementById("victimName").value;

  let phone =
  document.getElementById("victimPhone").value;

  if(!validatePhone(phone)){

    alert("Enter valid 10 digit phone number");
    return;

  }

  currentUser = {

    role:"victim",
    name:name,
    phone:phone

  };

  hideAllScreens();

  document.getElementById("appScreen")
  .classList.add("active");

  getLiveLocation(function(){

    initMap();

  });

}
/* ========================= */
/* TEAM LOGIN */
/* ========================= */

function enterTeamDashboard(){

  let teamName =
  document.getElementById("teamName").value;

  let phone =
  document.getElementById("teamPhone").value;

  if(!validatePhone(phone)){

    alert("Enter valid 10 digit phone number");
    return;

  }

  currentUser = {

    role:"team",
    name:teamName,
    phone:phone

  };

  hideAllScreens();

  document.getElementById(
    "responseDashboard"
  ).classList.add("active");

  getLiveLocation(function(){

    let team = {

      id:Date.now(),

      name:teamName,

      phone:phone,

      lat:userLat,

      lng:userLng,

      available:true

    };

    rescueTeams.push(team);

    push(
  ref(window.db,"teams"),
  {
    id: team.id,
    name: team.name,
    phone: team.phone,
    lat: team.lat,
    lng: team.lng,
    available: true,
    timestamp: Date.now()
  }
);

    updateDashboard();

   initMap();

    renderTeams();

    renderResponseRequests();

  });

}

/* ========================= */
/* MAP */
/* ========================= */

function initMap(){

  if(!map){

    map = L.map("map")
    .setView(
      [userLat,userLng],
      13
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:"© OpenStreetMap"
      }
    ).addTo(map);

  }

  setTimeout(()=>{

    map.invalidateSize();

  },500);

}

/* ========================= */
/* RENDER TEAMS */
/* ========================= */

function renderTeams(){

  rescueTeams.forEach(team=>{

    L.circleMarker(

      [team.lat,team.lng],

      {

        radius:12,

        color:"blue"

      }

    )

    .addTo(map)

    .bindPopup(

      "🚑 Rescue Team: " +

      team.name

    );

  });

}

/* ========================= */
/* PAGE NAVIGATION */
/* ========================= */

function showPage(pageId){

  document.querySelectorAll(".page")
  .forEach(page=>{
    page.classList.remove("activePage");
  });

  document.getElementById(pageId)
  .classList.add("activePage");

if(map){

setTimeout(()=>{

map.invalidateSize();

},300);

}

  setTimeout(()=>{

    if(map){

      map.invalidateSize();

    }

  },100);

}

/* ========================= */
/* NEAREST TEAM */
/* ========================= */

function findNearestTeam(lat,lng){

  let nearest = null;

  let minDistance = Infinity;

  rescueTeams.forEach(team=>{

    if(team.available){

      let distance = Math.sqrt(

        Math.pow(team.lat-lat,2) +

        Math.pow(team.lng-lng,2)

      );

      if(distance < minDistance){

        minDistance = distance;

        nearest = team;

      }

    }

  });

  return nearest;

}

/* ========================= */
/* EMERGENCY REQUEST */
/* ========================= */

async function requestHelp(
  people,
  description
){

 
let aiResult = null;

try{

const aiResponse = await askGemini(

`Emergency description:

${description}

Number of people affected: ${people}

Return a short analysis with:
Priority,
Department,
Risk Level,
Resources Needed,
Suggested Action`

);

aiResult = {

incident_id:
"INC-" + Date.now(),

location:
"Location Unknown",

priority:
aiResponse.toUpperCase().includes("HIGH")
? "HIGH"
: "MEDIUM",

department:
"Disaster Response Team",

risk_level:
"HIGH",

resources:[
"Rescue Team",
"Medical Team"
],

actions:[
"Dispatch nearest responders",
"Assess situation"
],
assignedTeam:
"Team Bravo"

};

}
catch(error){

console.log(error);

aiResult = {

incident_id:
"INC-" + Date.now(),

location:
"Location Unknown",

priority:
"HIGH",

department:
"Disaster Response Team",

risk_level:
"CRITICAL",

resources:[
"3 Rescue Boats",
"2 Medical Teams",
"1 Disaster Unit"
],

actions:[
"Alert response team",
"Assess situation",
"Prepare resources"
],
assignedTeam:
"Team Bravo"

};

}

  let emergency = {

    id:Date.now(),

    victim:currentUser.name,

    phone:currentUser.phone,

    people:people,

    description:description,

    lat:userLat,

    lng:userLng,

    status:"pending"

  };
  console.log("EMERGENCY OBJECT");
console.log(emergency);
console.log("REACHED EMERGENCY CREATION");
console.log(emergency);

  emergencies.push(emergency);

  const emergencyRef =
push(
  ref(window.db,"emergencies")
);

set(
  emergencyRef,
  emergency
);

console.log("EMERGENCY SAVED");
console.log(emergency);

  renderResponseRequests();

console.log("AFTER PUSH");
console.log(emergencies);

console.log("ARRAY LENGTH");
console.log(emergencies.length);

console.log("FIRST ITEM");
console.log(emergencies[0]);

  addNotification(
  `🚨 ${aiResult?.priority}
  Incident at
  ${aiResult?.location}`
);
const incidentRef =
push(
  ref(window.db, "incidents")
);

set(
  incidentRef,
  {
    incident_id: aiResult?.incident_id,
    location: aiResult?.location,
    priority: aiResult?.priority,
    department: aiResult?.department,
    timestamp: Date.now()
  }
);
let history =
document.getElementById("incidentHistory");

if(history.innerHTML.includes("No incidents yet")){
    history.innerHTML = "";
}

history.innerHTML += `

<div>

  ${aiResult?.incident_id} |
  ${aiResult?.location} |
  ${aiResult?.priority}

</div>

`;

  updateDashboard();

  let team = null;

  const teamsRef = ref(window.db,"teams");

  const teamsData =
window.latestTeamsData;


console.log(
  "Firebase Teams",
  teamsData
);

window.latestTeamsData =
teamsData;


let minDistance =
Infinity;

if(!teamsData){

  console.log(
    "No Teams Data Yet"
  );

  return;

}

Object.values(
  teamsData
).forEach(t=>{

  if(t.available){

    const distance =
    Math.sqrt(

      Math.pow(
        t.lat-userLat,
        2
      ) +

      Math.pow(
        t.lng-userLng,
        2
      )

    );

    if(
      distance <
      minDistance
    ){

      minDistance =
      distance;

      team = t;

      console.log("TEAM FOUND");
console.log(team);

    }

  }

});
  


  


  renderTeams();

if(team){

    console.log("TEAM ASSIGNED");
    console.log(team);

    emergency.status = "assigned";

    emergency.team = team.name;

    emergency.assignedTeam = team.name;

    console.log("ASSIGNED TEAM NAME");
    console.log(emergency.assignedTeam);

    team.available = false;

    document.getElementById(
  "teamStatus"
).innerHTML = `

${team.name} 🔴 Deployed<br>
Team Bravo 🟢 Available<br>
Team Charlie 🟢 Available

`;

const distance =
Math.sqrt(

  Math.pow(
    team.lat-userLat,
    2
  )

  +

  Math.pow(
    team.lng-userLng,
    2
  )

);

const eta =
Math.round(
  distance * 10
);

addNotification(

`🚑 ${team.name}

ETA:
${eta} min

Distance:
${distance.toFixed(2)} km`

);



    L.polyline(
      [
        [team.lat,team.lng],
        [userLat,userLng]
      ],
      {
        color:"lime",
        weight:4
      }
    ).addTo(map);


map.setView(
[userLat,userLng],
13
);
  }

  /* VICTIM */

  L.circle(
    [userLat,userLng],
    {
      radius:3000,
      color:"red",
      fillOpacity:0.3
    }
  ).addTo(map);

  L.marker([userLat,userLng])
  .addTo(map)
  .bindPopup(
    "Emergency Request By " +
    currentUser.name
  );

await new Promise(resolve=>{

  setTimeout(
    resolve,
    1000
  );

});

  document.getElementById(
  "emergencyStatus"
).innerHTML = `

<div class="panel">

<h3>🚨 AI Emergency Analysis</h3>

<p><strong>Incident ID:</strong>
${aiResult?.incident_id}</p>

<p><strong>Location:</strong>
${aiResult?.location}</p>

<p><strong>Department:</strong>
${aiResult?.department}</p>

<p><strong>Priority:</strong>
${aiResult?.priority}</p>

<p><strong>Risk level:</strong>
${aiResult?.risk_level}</p>

<p><strong>Resources:</strong>
${aiResult?.resources?.join(", ")}</p>

<p><strong>Actions:</strong>
${aiResult?.actions?.join(" → ")}</p>

<p><strong>Assigned Team:</strong>
${team ? team.name : "Waiting"}</p>

<p><strong>Status:</strong>
${emergency.status}</p>

</div>

`;

  showPage("emergencyPage");

}

/* ========================= */
/* RESOURCE REQUEST */
/* ========================= */

function openResourceRequest(type){

  let people =
  prompt("How many people need " + type + "?");

  if(!people) return;

  let description =
  prompt("Describe the requirement");

  let resource = {

    id:Date.now(),

    type:type,

    people:people,

    description:description,

    lat:userLat,

    lng:userLng,

    requester:currentUser.name,

    phone:currentUser.phone

  };

  resources.push(resource);

  updateDashboard();

  /* ORANGE REQUEST */

  L.circle(
    [userLat,userLng],
    {
      radius:2000,
      color:"orange",
      fillOpacity:0.3
    }
  ).addTo(map);

  alert(
    type +
    " request submitted successfully"
  );

}

/* ========================= */
/* CHAT */
/* ========================= */

function sendMessage(){

  let input =
  document.getElementById("chatInput");

  let message =
  input.value;

  if(message.trim()==="") return;

  document.getElementById(
    "chatBox"
  ).innerHTML += `

    <div class="panel">

      <strong>
        ${currentUser.name}
      </strong>

      <p>
        ${message}
      </p>

    </div>

  `;

  input.value = "";

}

/* ========================= */
/* DASHBOARD */
/* ========================= */

function updateDashboard(){

  document.getElementById(
    "teamCount"
  ).innerText =
  rescueTeams.length;

  document.getElementById(
    "emergencyCount"
  ).innerText =
  emergencies.length;

  document.getElementById(
    "resourceCount"
  ).innerText =
  resources.length;

}

function submitEmergency(){

  let people =
  document.getElementById(
    "emergencyPeople"
  ).value;

  let description =
  document.getElementById(
    "emergencyDescription"
  ).value;

  if(!people || !description){

    alert("Fill all fields");

    return;

  }

  requestHelp(
    people,
    description
  );

}
function addNotification(message){

  let list =
  document.getElementById(
    "notificationList"
  );

  if(
    list.innerHTML.includes(
      "No notifications yet"
    )
  ){
    list.innerHTML = "";
  }

  notificationCounter++;

document.getElementById(
  "notificationCount"
).innerText =
`(${notificationCounter})`;

  list.innerHTML =
  `
  <div class="notificationCard">

    <h3>🚨 Emergency Alert</h3>

    <p>${message}</p>

    <small>
      ${new Date().toLocaleString()}
    </small>

  </div>
  `
  + list.innerHTML;

}


function loadIncidentHistory(){
  

  const incidentsRef =
  ref(window.db, "incidents");

  onValue(
    incidentsRef,
    (snapshot)=>{

      let history =
      document.getElementById(
        "incidentHistory"
      );

      history.innerHTML = "";

      snapshot.forEach((child)=>{

        let incident =
        child.val();

        history.innerHTML += `

        <div>

          ${incident.incident_id}
          |
          ${incident.location}
          |
          ${incident.priority}

        </div>

        `;

      });

    }
  );

}

 function submitFoundItem(){

  let itemCategory =
document.getElementById(
  "itemCategory"
).value;

let itemDescription =
document.getElementById(
  "itemDescription"
).value;

  let itemName =
  document.getElementById(
    "itemName"
  ).value;

  let finderName =
  document.getElementById(
    "finderName"
  ).value;

  let finderPhone =
  document.getElementById(
    "finderPhone"
  ).value;

  let foundLocation =
  document.getElementById(
    "foundLocation"
  ).value;

  let photoFile =
document.getElementById(
  "itemPhoto"
).files[0];


 if(
  !itemName ||
  !itemCategory ||
  !itemDescription ||
  !finderName ||
  !finderPhone ||
  !foundLocation ||
  !photoFile
){
  

    alert("Fill all fields");

    return;

  }
  const foundItemsRef =
ref(
  window.db,
  "foundItems"
);
  
const newItemRef =
push(foundItemsRef);

set(
  newItemRef,
  {
    itemName,
    itemCategory,
    itemDescription,
    finderName,
    finderPhone,
    foundLocation,
    photoName:
    photoFile.name,
    timestamp:
    Date.now()
  }
);


  document.getElementById(
    "foundItemsList"
  ).innerHTML += `

  <div class="panel">

    <h3>${itemName}</h3>
    <p>
    Photo Selected:
    ${photoFile.name}
    </p>

    <p>
Category:
${itemCategory}
</p>

<p>
Description:
${itemDescription}
</p>

    <p>
      Found By:
      ${finderName}
    </p>

    <p>
      Phone:
      ${finderPhone}
    </p>

    <p>
      Location:
      ${foundLocation}
    </p>

  </div>

  `;

}
function searchLostItems(){

  let input =
  document.getElementById(
    "searchLostItem"
  ).value.toLowerCase();

  let cards =
  document.querySelectorAll(
    "#foundItemsList .panel"
  );

  cards.forEach((card)=>{

    if(
      card.innerText
      .toLowerCase()
      .includes(input)
    ){
      card.style.display =
      "block";
    }
    else{
      card.style.display =
      "none";
    }

  });

}

function loadSOSAlerts(){

  const sosRef =
  ref(window.db,"sosAlerts");

  onValue(
    sosRef,
    (snapshot)=>{

      let panel =
      document.getElementById(
        "sosAlertsPanel"
      );

      if(!panel) return;

      panel.innerHTML = "";

      snapshot.forEach((child)=>{

let sos =
child.val();

panel.innerHTML += `

<div class="panel">

  <h3>
  🚨 ACTIVE SOS
  </h3>

  <p>
  Team:
  ${sos.team}
  </p>

  <p>
  Status:
  ${sos.status}
  </p>

  <button
  onclick="dispatchBackup('${child.key}')">

  🚑 DISPATCH BACKUP

  </button>

</div>

`;

});
    
  }
);
}

function dispatchBackup(id){

  alert(
    "🚑 Charlie Team Dispatched"
  );

}

function loadFoundItems(){
     
  const foundItemsRef =
  ref(
    window.db,
    "foundItems"
  );

  onValue(
    foundItemsRef,
    (snapshot)=>{

      let list =
      document.getElementById(
        "foundItemsList"
      );

      list.innerHTML = "";

      snapshot.forEach((child)=>{

        let item =
        child.val();

        list.innerHTML =
        `
        <div class="panel">

          <h3>
            ${item.itemName}
          </h3>

          <p>
          Photo Selected:
          ${item.photoName}
          </p>

          <p>
          Category:
          ${item.itemCategory}
          </p>

          <p>
          Description:
          ${item.itemDescription}
          </p>

          <p>
          Found By:
          ${item.finderName}
          </p>

          <p>
          Phone:
          ${item.finderPhone}
          </p>

          <p>
          Location:
          ${item.foundLocation}
          </p>

        </div>
        `
        +
        list.innerHTML;

      });

    }
  );

}

function loadTeams(){

  const teamsRef =
  ref(window.db,"teams");

  onValue(
    teamsRef,
    (snapshot)=>{

      window.latestTeamsData =
      snapshot.val();

      console.log(
        "TEAMS LOADED"
      );

      console.log(
        window.latestTeamsData
      );

    }
  );

}

function toggleLargeText(){

  document.body.classList.toggle(
    "largeText"
  );

}

function showRescueTab(tab){

  document.getElementById(
    "missionsTab"
  ).style.display="none";

  document.getElementById(
    "teamsTab"
  ).style.display="none";

  document.getElementById(
    "sosTab"
  ).style.display="none";

  document.getElementById(
    "mapTab"
  ).style.display="none";

  document.getElementById(
  "departmentsTab"
).style.display="none";

  document.getElementById(
    tab + "Tab"
  ).style.display="block";

}

window.addEventListener(
  "load",
  function(){

    loadIncidentHistory();
    loadFoundItems();
    loadTeams();
    loadSOSAlerts();
    
    updateAIAdvisor();

  }
);

function startDonation(){

  let amount =
  document.getElementById(
    "donationAmount"
  ).value;

  if(!amount){

    alert(
      "Please enter donation amount"
    );

    return;

  }

  alert(
    "Donation of ₹" +
    amount +
    " initiated successfully."
  );

  document.getElementById(
    "donationPopup"
  ).style.display =
  "none";

}

function renderResponseRequests(){

  let box =
  document.getElementById(
    "responseRequests"
  );

  if(!box) return;

  const emergencyRef =
  ref(
    window.db,
    "emergencies"
  );

  onValue(
    emergencyRef,
    (snapshot)=>{

      box.innerHTML = "";

      snapshot.forEach(child=>{

        let emergency =
        child.val();

        window.latestEmergencyData =
window.latestEmergencyData || {};

window.latestEmergencyData[
child.key
] = emergency;

        box.innerHTML += `

        <div class="panel">

          <h3>
🚨 ${emergency.priority || "Medium"} Priority
</h3>

          <p>
          Victim:
          ${emergency.victim}
          </p>

          <p>
          People:
          ${emergency.people}
          </p>

          <p>
          Description:
          ${emergency.description}
          </p>

         <p>
          📡 Status:
           ${emergency.status}
          </p>

          <p>
           🚑 Team:
           ${emergency.team || "Unassigned"}
            </p>

          <button onclick="acceptMission('${child.key}')">
ACCEPT MISSION
</button>

<br><br>

<button onclick="openRouteMap(${emergency.lat},${emergency.lng})">

🗺 Open Route

</button>

<button onclick="dispatchMission('${child.key}')">
🚑 DISPATCH
</button>

<button onclick="startRescue('${child.key}')">
🚨 START RESCUE
</button>

<button onclick="completeMission('${child.key}')">
✅ COMPLETE
</button>

        </div>

        `;

      });

    }
  );

}



function acceptMission(id){

  const emergencyRef =
  ref(
    window.db,
    "emergencies/" + id
  );

  const emergency =
  window.latestEmergencyData[id];

  set(
    emergencyRef,
    {
      ...emergency,
      status:"accepted",
      team:"Bravo Team"
    }
  );

  alert(
    "Mission Accepted 🚑"
  );

}

function dispatchMission(id){

const emergency =
window.latestEmergencyData[id];

set(
ref(window.db,"emergencies/"+id),
{
...emergency,
status:"Team Dispatched"
}
);

}

function startRescue(id){

const emergency =
window.latestEmergencyData[id];

set(
ref(window.db,"emergencies/"+id),
{
...emergency,
status:"Rescue In Progress"
}
);

}

function completeMission(id){

const emergency =
window.latestEmergencyData[id];

set(
ref(window.db,"emergencies/"+id),
{
...emergency,
status:"Completed"
}
);

}



function openDepartment(){

let search =
document.getElementById(
"departmentSearch"
).value.toLowerCase();

let result =
document.getElementById(
"departmentResult"
);

if(search.includes("civil")){

result.innerHTML = `

<div class="panel">

<h3>🛣 Civil Department</h3>

<p>
Road damage monitoring
</p>

<p>
Status: Standby
</p>

</div>

`;

}

else if(search.includes("water")){

result.innerHTML = `

<div class="panel">

<h3>💧 Water Department</h3>

<p>
Water contamination monitoring
</p>

<p>
Status: Standby
</p>

</div>

`;

}

else if(search.includes("health")){

result.innerHTML = `

<div class="panel">

<h3>🏥 Health Department</h3>

<p>
Medical response monitoring
</p>

<p>
Status: Standby
</p>

</div>

`;

}

else{

result.innerHTML = `

<div class="panel">

Department not found

</div>

`;

}

}

function openRouteMap(lat,lng){

const url =

`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

window.open(
url,
"_blank"
);

}

function sendRescueSOS(){

  const sosRef =
  push(
    ref(window.db,"sosAlerts")
  );

  set(
    sosRef,
    {
      team:"Bravo Team",
      status:"ACTIVE",
      lat:userLat,
      lng:userLng,
      timestamp:Date.now()
    }
  );

  alert(
    "🚨 Rescue Team SOS Sent"
  );

}
async function getWeatherPrediction(){

let city =
document.getElementById(
"predictionCity"
).value;

let apiKey =
"YOUR API KEY HERE";

let url =
`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

let response =
await fetch(url);

let data =
await response.json();

console.log(data);

let rain = 0;

if(data.rain){

rain =
data.rain["1h"] || 0;

}

let wind =
data.wind.speed;

let risk = "LOW";

if(rain > 20 || wind > 15){

risk = "MEDIUM";

}

if(rain > 50 || wind > 25){

risk = "HIGH";

}

let departments = [

"Rescue Team"

];

if(risk === "HIGH"){

departments.push(
"Civil Department"
);

departments.push(
"Medical Unit"
);

departments.push(
"Water Supply Department"
);

}

let recommendation = "";

if(risk === "HIGH"){

recommendation =
"Deploy rescue teams immediately. Prepare shelters and issue public alerts.";

}
else if(risk === "MEDIUM"){

recommendation =
"Monitor weather closely and keep emergency teams on standby.";

}
else{

recommendation =
"Normal conditions. Continue routine monitoring.";

}

document.getElementById(
"predictionResult"
).innerHTML = `

<div class="panel">

<h3>
🤖 AI Prediction
</h3>

<p>
City:
${city}
</p>

<p>
Temperature:
${data.main.temp}°C
</p>

<p>
Wind:
${wind} m/s
</p>

<p>
Rainfall:
${rain}
</p>

<p>
Risk:
${risk}
</p>

<p>
Departments:
${departments.join(", ")}
</p>

<p>

AI Recommendation:

${recommendation}

</p>



</div>

`;

}

function startVoiceReadout(){

let text =
document.body.innerText;

let speech =
new SpeechSynthesisUtterance(
text
);

speech.lang = "en-US";

speechSynthesis.speak(
speech
);

}

function toggleHighContrast(){

document.body.classList.toggle(
"highContrastMode"
);

}

function toggleVibration(){

if(navigator.vibrate){

navigator.vibrate(
[500,200,500]
);

alert(
"📳 Vibration Alert Activated"
);

}else{

alert(
"Device does not support vibration."
);

}

}
function changeLanguage(){

let lang =
document.getElementById(
"languageSelect"
).value;

let title =
document.getElementById(
"rescueCenterTitle"
);

if(lang==="tamil"){

title.innerText =
"🚑 மீட்பு மையம்";

document.getElementById(
"missionText"
).innerText =
"🚨 செயலில் உள்ள பணிகள்";

document.getElementById(
"teamText"
).innerText =
"👥 குழுக்கள்";

document.getElementById(
"sosText"
).innerText =
"📡 அவசர எச்சரிக்கை";

document.getElementById(
"mapText"
).innerText =
"🗺 வழி வரைபடம்";

document.getElementById(
"accessibilityText"
).innerText =
"♿ அணுகல் வசதி";

}

else if(lang==="hindi"){

title.innerText =
"🚑 बचाव केंद्र";



}

else if(lang==="kannada"){

title.innerText =
"🚑 ರಕ್ಷಣಾ ಕೇಂದ್ರ";

}

else if(lang==="telugu"){

title.innerText =
"🚑 రెస్క్యూ కేంద్రం";

}

else if(lang==="malayalam"){

title.innerText =
"🚑 രക്ഷാ കേന്ദ്രം";

}

else{

title.innerText =
"🚑 Rescue Center";

}

}

function toggleSignGuide(){

let panel =
document.getElementById(
"signGuidePanel"
);

if(panel.style.display==="none"){

panel.style.display="block";

}else{

panel.style.display="none";

}

}
async function askGemini(prompt){

const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[
{
parts:[
{
text:prompt
}
]
}
]
})
}
);

const data = await response.json();

console.log(data);

if(!data.candidates){

throw new Error(
JSON.stringify(data)
);

}

return data.candidates[0]
.content.parts[0]
.text;

}

function updateAIAdvisor(){

let aiBox =
document.getElementById(
"aiAdvisorText"
);

if(!aiBox) return;

const emergencyRef =
ref(
window.db,
"emergencies"
);

onValue(
emergencyRef,
(snapshot)=>{

let activeCount = 0;

snapshot.forEach(child=>{

let emergency =
child.val();

if(
emergency.status !==
"Completed"
){

activeCount++;

}

});

if(activeCount===0){

aiBox.innerHTML = `

<h3>🧠 Situation Analysis</h3>

<p>
No active incidents detected.
</p>

<hr>

<h3>⚠ Risk Assessment</h3>

<p>
LOW
</p>

<hr>

<h3>🚑 Suggested Actions</h3>

<ul>

<li>Continue monitoring</li>

<li>Keep teams on standby</li>

</ul>

`;

}

else{

(async()=>{

try{

const aiResponse =
await askGemini(

`There are ${activeCount} active emergencies.

Provide:

1. Situation Analysis

2. Risk Assessment

3. Recommended Departments

4. Suggested Actions

Keep response concise.`

);

aiBox.innerHTML = `

<h3>🤖 Gemini Crisis Analysis</h3>

<pre style="
white-space:pre-wrap;
font-family:inherit;
">
${aiResponse}
</pre>

`;

}
catch(error){

console.log(error);

aiBox.innerHTML = `

<h3>🤖 Crisis Command AI</h3>

<p>
Analyzing active emergency conditions...
</p>

<hr>

<p>
Active Emergencies: ${activeCount}
</p>

<p>
Priority Level: MEDIUM
</p>

<p>
Recommended Departments:
Health, Police, Water
</p>

<p>
Suggested Action:
🚑 Dispatch nearest rescue team
</p>

`;

}

})();

}

}

);

}
