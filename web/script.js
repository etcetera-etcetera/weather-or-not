async function getData(location) {
  var { longitude, latitude } = location;

  var url = `https://fast-caverns-43300.herokuapp.com/?lat=${latitude}&lon=${longitude}`;

  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (location) => {
      await updateDisplay(location);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

async function updateDisplay(location) {
  var { coords } = location;
  var data = await getData(coords);

  await updateNavBar(coords);
  await updateMain(data);
  await updateTimes(data);
  await updateWeek(data);

  document.querySelector(".loader-wrapper").classList.add("inactive");
  document.querySelector(".main").classList.remove("loading");

  setInterval(async () => {
    await updateWeather(data, coords);
  }, 1000);
}

async function updateNavBar(coords) {
  const response = await fetch(
    `https://fast-caverns-43300.herokuapp.com/location?lat=${coords.latitude}&lon=${coords.longitude}`
  );
  const data = await response.json();

  document.querySelector(".location").textContent =
    data.data[0].administrative_area;

  var date = new Date();
  const formatNum = (num, places) => String(num).padStart(places, "0");

  document.querySelector(".date").textContent = `${formatNum(
    date.getDate(),
    2
  )}.${formatNum(date.getMonth(), 2)}.${date.getFullYear()}`;
}

async function updateMain(data) {
  document.querySelector(".temp").textContent = Math.floor(data.current.temp);

  const formatNum = (num, places) => String(num).padStart(places, "0");

  var date = new Date();
  document.querySelector(".currentTime").textContent = `${formatNum(
    date.getHours(),
    2
  )}:${formatNum(date.getMinutes(), 2)}`;

  var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  var dayNum = date.getDay();
  document.querySelector(".currentDay").textContent = days[dayNum];

  document.querySelector(".weatherStatus").textContent =
    data.current.weather[0].main;
}

async function updateTimes(data) {
  var timeTempElements = document.getElementsByClassName("timeTemp");
  var otherTimeElements = document.getElementsByClassName("otherTime");

  var { hourly } = data;

  const formatNum = (num, places) => String(num).padStart(places, "0");

  var today = new Date();
  var currentHour = today.getHours();

  for (let i = 0; i < 12; i++) {
    var time = currentHour + i;
    if (time == 23) {
      document
        .getElementsByClassName("timeWrapper")
        [i].classList.add("separator");
    }
    if (time >= 24) time -= 24;
    otherTimeElements[i].textContent = `${formatNum(time, 2)}:00`;
    timeTempElements[i].textContent = `${Math.floor(hourly[i].temp)}°`;
  }
}

async function updateWeek(data) {
  var daysDOM = document.getElementsByClassName("dayName");
  var tempDOM = document.getElementsByClassName("dayTemp");

  var { daily } = data;

  var today = new Date();
  var currentDay = today.getDay();
  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < 7; i++) {
    var dayNum = currentDay + i;
    if (dayNum >= 7) dayNum -= 7;
    daysDOM[i].textContent = days[dayNum];
    tempDOM[i].textContent = `${Math.floor(daily[i].temp.day)}`;
  }
}

async function updateWeather(data, coords) {
  await updateNavBar(coords);
  await updateMain(data);
  await updateTimes(data);
  await updateWeek(data);
}

getLocation();
document.querySelector(".moreStatsToggle").addEventListener("click", (e) => {
  document.querySelector(".moreStats").classList.add("active");
});
