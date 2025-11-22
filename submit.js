// Tabs + HERO mygtukai + Formspree redirect submit puslapyje
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".submit-tab");
  const forms = document.querySelectorAll(".submit-form");
  const heroButtons = document.querySelectorAll(".submit-cta-row .submit-cta");

  if (!forms.length) return;

  function activateForm(targetId) {
    // Formos
    forms.forEach((form) => {
      form.classList.toggle("active", form.id === targetId);
    });

    // Tabs
    tabs.forEach((tab) => {
      const tabTarget = tab.getAttribute("data-target");
      tab.classList.toggle("active", tabTarget === targetId);
    });

    // HERO mygtukai
    heroButtons.forEach((btn) => {
      const btnTarget = btn.getAttribute("data-target");
      btn.classList.toggle("active", btnTarget === targetId);
    });
  }

  function scrollToForm(targetId) {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // DEFAULT – aktyvi MIX forma
  activateForm("mix-form");

  // Tabs
  tabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = tab.getAttribute("data-target");
      if (!targetId) return;
      activateForm(targetId);
      scrollToForm(targetId);
    });
  });

  // HERO mygtukai
  heroButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = btn.getAttribute("data-target");
      if (!targetId) return;
      activateForm(targetId);
      scrollToForm(targetId);
    });
  });

  // -------------------------
  // Pagalbinė funkcija: surenkam quiz klausimus + atsakymus į vieną lauką
  // -------------------------
  function buildQuizFieldForForm(form) {
    const quizField = form.querySelector("#quiz");
    if (!quizField) return;

    const answerInputs = form.querySelectorAll(".quiz-answer");
    if (!answerInputs.length) return;

    const lines = [];
    answerInputs.forEach((input) => {
      const question = input.dataset.question || "";
      const answer = (input.value || "").trim();
      lines.push(`${question} – ${answer}`);
    });

    quizField.value = lines.join("\n");
  }

  // -------------------------
  // Formspree submit + redirect į thank-you
  // -------------------------
  const redirectUrl = "https://decksandstories.com/thank-you";

  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // prieš siųsdami – surenkam quiz lauką (jei jis yra tame form)
      buildQuizFieldForForm(form);

      const formData = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          window.location.href = redirectUrl;
        } else {
          console.error("Formspree error:", await response.text());
          alert(
            "Something went wrong while submitting the form. Please try again or contact us directly."
          );
        }
      } catch (error) {
        console.error("Network error:", error);
        alert("Network error. Please try again later.");
      }
    });
  });
});

// NAV linkų logika (jei naudoji globalų nav)
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("#nav .nav-link");
  if (!navLinks.length) return;

  function setActiveLink(element) {
    navLinks.forEach((link) => link.classList.remove("active"));
    if (element) element.classList.add("active");
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveLink(link);
    });
  });

  const sectionIds = [...navLinks]
    .filter((link) => link.getAttribute("href").startsWith("#"))
    .map((link) => link.getAttribute("href"));

  const sections = sectionIds
    .map((id) => document.querySelector(id))
    .filter((s) => s !== null);

  window.addEventListener("scroll", () => {
    let current = null;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (
        rect.top <= window.innerHeight * 0.33 &&
        rect.bottom >= window.innerHeight * 0.33
      ) {
        current = section;
      }
    });

    if (current) {
      const id = "#" + current.id;
      const activeLink = document.querySelector(
        `#nav .nav-link[href='${id}']`
      );
      setActiveLink(activeLink);
    }
  });
});
