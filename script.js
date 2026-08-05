/* ============================================================
   THE FISH HOUSE — script.js
   ============================================================ */

// >>> Numero WhatsApp degli host (formato internazionale, senza + o spazi) <<<
const WHATSAPP_NUMBER = "393480294212";

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------------------------
     NAVBAR: sfondo su scroll + menu hamburger
  --------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------------------------------------------------------
     SCROLL REVEAL: aggiunge la classe .reveal a blocchi chiave
     e li rivela con IntersectionObserver
  --------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    ".phi-card, .room-card, .rules-list li, .gallery-item, .booking-form, .section-title, .philosophy-text"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("visible"));
  }

  /* ---------------------------------------------------------
     CARD SISTEMAZIONI: "Scelgo questa" -> precompila il form
  --------------------------------------------------------- */
  const roomSelect = document.getElementById("room");
  const chooseButtons = document.querySelectorAll(".btn-choose");

  chooseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".room-card");
      const roomName = card.dataset.room;

      chooseButtons.forEach((b) => b.classList.remove("chosen"));
      btn.classList.add("chosen");

      if (roomSelect) {
        roomSelect.value = roomName;
      }

      const target = document.getElementById("prenota");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      showToast(`Hai scelto: ${roomName} 🎉`);
    });
  });

  /* ---------------------------------------------------------
     GALLERIA -> LIGHTBOX
  --------------------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const full = item.dataset.full;
      const alt = item.querySelector("img")?.alt || "";
      lightboxImg.src = full;
      lightboxImg.alt = alt;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightbox();
      closeModal();
    }
  });

  /* ---------------------------------------------------------
     FORM DI PRENOTAZIONE: validazione + riepilogo + WhatsApp
  --------------------------------------------------------- */
  const form = document.getElementById("bookingForm");
  const modal = document.getElementById("summaryModal");
  const summaryContent = document.getElementById("summaryContent");
  const modalClose = document.getElementById("modalClose");
  const modalEdit = document.getElementById("modalEdit");
  const modalConfirm = document.getElementById("modalConfirm");

  const errorMessages = {
    fullname: "Senza nome non sapremo chi mettere sul divano.",
    phone: "Serve un numero per avvisarti quando il tramonto è pronto.",
    guests: "Quanti amici affamati stiamo aspettando?",
    checkin: "Serve una data di arrivo, il mare non aspetta.",
    checkout: "Serve una data di partenza (anche se nessuno vuole andarsene).",
    checkoutOrder: "Alla Fish House il tempo scorre in avanti: la partenza deve essere successiva all'arrivo.",
    room: "Scegli almeno una sistemazione: il pianerottolo non è ancora prenotabile.",
    check1: "Per entrare devi certificare ufficialmente il tuo buonumore.",
    check2: "Serve la tua promessa solenne: Mimmo russa, è un fatto.",
    check3: "La supremazia organizzativa della Brizzi va accettata, è nel regolamento non scritto.",
  };

  function setError(fieldName, message) {
    const errEl = form.querySelector(`.form-error[data-for="${fieldName}"]`);
    if (errEl) errEl.textContent = message || "";
  }

  function clearAllErrors() {
    form.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  }

  function validateForm(data) {
    let valid = true;
    clearAllErrors();

    if (!data.fullname.trim()) {
      setError("fullname", errorMessages.fullname);
      valid = false;
    }
    if (!data.phone.trim()) {
      setError("phone", errorMessages.phone);
      valid = false;
    }
    if (!data.guests || Number(data.guests) < 1) {
      setError("guests", errorMessages.guests);
      valid = false;
    }
    if (!data.checkin) {
      setError("checkin", errorMessages.checkin);
      valid = false;
    }
    if (!data.checkout) {
      setError("checkout", errorMessages.checkout);
      valid = false;
    }
    if (data.checkin && data.checkout) {
      const inDate = new Date(data.checkin);
      const outDate = new Date(data.checkout);
      if (outDate <= inDate) {
        setError("checkout", errorMessages.checkoutOrder);
        valid = false;
      }
    }
    if (!data.room) {
      setError("room", errorMessages.room);
      valid = false;
    }
    if (!data.check1) {
      setError("check1", errorMessages.check1);
      valid = false;
    }
    if (!data.check2) {
      setError("check2", errorMessages.check2);
      valid = false;
    }
    if (!data.check3) {
      setError("check3", errorMessages.check3);
      valid = false;
    }

    return valid;
  }

  function formatDate(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr + "T00:00:00");
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  }

  function getFormData() {
    const fd = new FormData(form);
    return {
      fullname: (fd.get("fullname") || "").toString(),
      phone: (fd.get("phone") || "").toString(),
      guests: (fd.get("guests") || "").toString(),
      checkin: (fd.get("checkin") || "").toString(),
      checkout: (fd.get("checkout") || "").toString(),
      room: (fd.get("room") || "").toString(),
      payment: (fd.get("payment") || "").toString(),
      notes: (fd.get("notes") || "").toString(),
      check1: form.querySelector("#check1").checked,
      check2: form.querySelector("#check2").checked,
      check3: form.querySelector("#check3").checked,
    };
  }

  let currentData = null;

  function buildSummaryRow(label, value) {
    const row = document.createElement("div");
    row.className = "sum-row";
    const l = document.createElement("span");
    l.className = "sum-label";
    l.textContent = label;
    const v = document.createElement("span");
    v.className = "sum-value";
    v.textContent = value || "—";
    row.appendChild(l);
    row.appendChild(v);
    return row;
  }

  function renderSummary(data) {
    summaryContent.innerHTML = "";
    summaryContent.appendChild(buildSummaryRow("Nome", data.fullname));
    summaryContent.appendChild(buildSummaryRow("Telefono", data.phone));
    summaryContent.appendChild(buildSummaryRow("Ospiti", data.guests));
    summaryContent.appendChild(buildSummaryRow("Arrivo", formatDate(data.checkin)));
    summaryContent.appendChild(buildSummaryRow("Partenza", formatDate(data.checkout)));
    summaryContent.appendChild(buildSummaryRow("Sistemazione", data.room));
    summaryContent.appendChild(buildSummaryRow("Proposta di pagamento", data.payment || "da concordare"));
    if (data.notes.trim()) {
      summaryContent.appendChild(buildSummaryRow("Note", data.notes));
    }
  }

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  modalClose.addEventListener("click", closeModal);
  modalEdit.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getFormData();
    if (!validateForm(data)) {
      const firstError = form.querySelector(".form-error:not(:empty)");
      if (firstError) {
        firstError.closest(".form-field, .form-checks")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      showToast("Manca ancora qualche dettaglio: dai un'occhiata al modulo 👀");
      return;
    }
    currentData = data;
    renderSummary(data);
    openModal();
  });

  function buildWhatsAppMessage(data) {
    const lines = [
      "🐟 *Richiesta di prenotazione — The Fish House* 🐟",
      "",
      `*Nome:* ${data.fullname}`,
      `*Telefono:* ${data.phone}`,
      `*Numero ospiti:* ${data.guests}`,
      `*Arrivo:* ${formatDate(data.checkin)}`,
      `*Partenza:* ${formatDate(data.checkout)}`,
      `*Sistemazione scelta:* ${data.room}`,
      `*Proposta di pagamento:* ${data.payment || "da concordare"}`,
    ];
    if (data.notes.trim()) {
      lines.push(`*Note:* ${data.notes.trim()}`);
    }
    lines.push("");
    lines.push("✅ Dichiaro di essere sorridente, spensierato e disposto a non pagare in euro.");
    lines.push("✅ Prometto di non lamentarmi se Mimmo russa.");
    lines.push("✅ Accetto la possibile superiorità organizzativa della Brizzi.");
    lines.push("");
    lines.push("In attesa del vostro inequivocabile: «Va bene, venite!» 🌅");
    return lines.join("\n");
  }

  modalConfirm.addEventListener("click", () => {
    if (!currentData) return;
    const message = buildWhatsAppMessage(currentData);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    closeModal();
    form.reset();
    chooseButtons.forEach((b) => b.classList.remove("chosen"));
    showToast("Richiesta pronta su WhatsApp! Ora tocca a Mimmo e Barbara 🐠");
  });

  /* ---------------------------------------------------------
     TOAST
  --------------------------------------------------------- */
  const toast = document.getElementById("toast");
  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  /* ---------------------------------------------------------
     Data minima per check-in = oggi (piccola comodità)
  --------------------------------------------------------- */
  const checkinInput = document.getElementById("checkin");
  const checkoutInput = document.getElementById("checkout");
  const today = new Date().toISOString().split("T")[0];
  if (checkinInput) checkinInput.setAttribute("min", today);
  if (checkoutInput) checkoutInput.setAttribute("min", today);
  if (checkinInput && checkoutInput) {
    checkinInput.addEventListener("change", () => {
      checkoutInput.setAttribute("min", checkinInput.value || today);
    });
  }
});
