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
  await updateStats(data);

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

async function updateStats(data) {
  const formatNum = (num, places) => String(num).padStart(places, "0");

  var labels = [];
  var date = new Date(data.hourly[0].dt);
  var time = date.getHours();
  for (let i = 0; i < data.hourly.length; i++) {
    time += 1;
    if (time >= 24) time -= 24;
    labels.push(`${formatNum(time, 2)}:00`);
  }

  var tempData = [];
  var rainData = [];
  for (let i = 0; i < data.hourly.length; i++) {
    var hour = data.hourly[i];
    tempData.push(Math.floor(hour.temp));
    rainData.push(hour.pop * 100);
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Precipitation",
        backgroundColor: "rgba(55, 162, 235, .4)",
        fill: true,
        borderColor: "rgb(55, 162, 235)",
        data: rainData,
        yAxisID: "rainAxis",
      },
      {
        label: "Temperature",
        backgroundColor: "rgba(255, 99, 132, .5)",
        fill: true,
        borderColor: "rgb(255, 99, 132)",
        data: tempData,
        yAxisID: "y",
      },
    ],
  };

  const config = {
    type: "line",
    data: chartData,
    options: {
      scales: {
        y: {
          beginAtZero: true,
          type: "linear",
          position: "left",
          ticks: {
            callback: (value, index, values) => {
              return `${value}°C`;
            },
          },
        },
        rainAxis: {
          beginAtZero: true,
          type: "linear",
          position: "right",
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            callback: (value, index, values) => {
              return `${value}%`;
            },
          },
        },
      },
    },
  };

  const myChart = new Chart(document.getElementById("myChart"), config);
}

getLocation();
document.querySelector(".moreStatsToggle").addEventListener("click", (e) => {
  document.querySelector(".moreStats").classList.add("active");
});

document.querySelector(".timesToggle").addEventListener("click", (e) => {
  document.querySelector(".times").classList.add("active");
});
