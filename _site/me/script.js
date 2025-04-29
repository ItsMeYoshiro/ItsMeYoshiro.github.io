const video1 = document.getElementById("projectVideo1");
const video2 = document.getElementById("projectVideo2");
const video3 = document.getElementById("projectVideo3");
const hoverSign = document.querySelector(".hover-sign");

// sidebar elements
const sideBar = document.querySelector(".sidebar");
const menu = document.querySelector(".menu-icon");
const close = document.querySelector(".close-icon");

const videoList = [video1, video2, video3];

videoList.forEach((video) => {
  // Mute the video initially to allow autoplay
  video.muted = true;

  video.addEventListener("mouseover", () => {
    video.play().catch((error) => {
      console.error(`Error playing video: ${error}`);
    });
  });
  video.addEventListener("mouseout", () => {
    video.pause();
  });
});

// Open Sidebar
menu.addEventListener("click", () => {
  sideBar.classList.remove("close-sidebar"); // Remove closing animation
  sideBar.classList.add("open-sidebar"); // Add opening animation
});

// Close Sidebar
close.addEventListener("click", () => {
  sideBar.classList.remove("open-sidebar"); // Remove opening animation
  sideBar.classList.add("close-sidebar"); // Add closing animation
});
