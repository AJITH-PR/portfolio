window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("skeleton-screen");

    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.5s ease";

    setTimeout(() => {
      loader.style.display = "none";
    }, 250);

  }, 2000);
});