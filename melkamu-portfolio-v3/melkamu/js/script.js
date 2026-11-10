// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  });
});

// Dark / light theme preference
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("melkamu-portfolio-theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-theme");
  themeToggle.textContent = "☾";
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("melkamu-portfolio-theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☾" : "☼";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
});

// Project filtering
const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    projectCards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
  });
});

// Contact form: validate, then prepare an email in the visitor's email application.
const contactForm = document.getElementById("contactForm");
const formFeedback = document.getElementById("formFeedback");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("visitorName").value.trim();
  const email = document.getElementById("visitorEmail").value.trim();
  const message = document.getElementById("visitorMessage").value.trim();

  if (!name || !email || !message) {
    formFeedback.textContent = "Please complete all fields before continuing.";
    formFeedback.classList.remove("success");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    formFeedback.textContent = "Please enter a valid email address.";
    formFeedback.classList.remove("success");
    return;
  }

  formFeedback.textContent = "Opening your email application...";
  formFeedback.classList.add("success");

  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  window.location.href = `mailto:melkamudejen78@gmail.com?subject=${subject}&body=${body}`;
});

// Current year in footer
document.getElementById("currentYear").textContent = new Date().getFullYear();
