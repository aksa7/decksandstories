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

  // DEFAULT – kai puslapis užsikrauna, aktyvi MIX forma ir mix hero mygtukas
  activateForm("mix-form");

  // Tabs logika
  tabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = tab.getAttribute("data-target");
      if (!targetId) return;

      activateForm(targetId);
      scrollToForm(targetId);
    });
  });

  // HERO mygtukai (viršuje)
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
  // Formspree submit + redirect į thank-you
  // -------------------------

  // jei turi /thank-you/index.html – šitas URL yra ok
  const redirectUrl = "https://decksandstories.com/thank-you";

  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); // sustabdom default redirect į Formspree

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
          // Formspree priėmė – varom į savo thank-you puslapį
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

// NAV linkų logika (palikta iš tavo esamo kodo)
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("#nav .nav-link");

  function setActiveLink(element) {
    navLinks.forEach((link) => link.classList.remove("active"));
    if (element) element.classList.add("active");
  }

  // CLICK — nustato active iškart
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveLink(link);
    });
  });

  // SCROLL — highlight’ina pagal tai, kuri sekcija šiuo metu matosi
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
