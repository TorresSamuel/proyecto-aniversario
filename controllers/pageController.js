/* Controlador: gestiona eventos, navegación y recuerdos persistentes. */
window.PageController = (() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  // Cada apartado usa una clave propia y siempre almacena una lista.
  const storageKey = "aniversario-future-memories";
  const letterKey = "aniversario-letters";
  const photoKey = "aniversario-event-memories";

  function readEntries(key) {
    try {
      const entries = JSON.parse(localStorage.getItem(key));
      // También permite recuperar los datos guardados por la versión anterior,
      // que usaba un único objeto para cartas y fotos.
      if (Array.isArray(entries)) return entries;
      return entries && typeof entries === "object" ? [entries] : [];
    } catch {
      return [];
    }
  }

  function addEntry(key, entry) {
    const entries = readEntries(key);
    entries.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toISOString(),
      ...entry
    });
    localStorage.setItem(key, JSON.stringify(entries));
    return entries;
  }

  function goTo(path) {
    document.body.classList.add("is-leaving");
    const isInsideViews = window.location.pathname.includes("/views/");
    const destination = path === "index.html" && !isInsideViews ? "/" : isInsideViews ? path : `/views/${path}`;
    window.setTimeout(() => { window.location.href = destination; }, 260);
  }

  function fillText() {
    const model = window.AnniversaryModel;
    document.querySelectorAll("[data-model]").forEach((element) => {
      const value = element.dataset.model.split(".").reduce((item, key) => item?.[key], model);
      if (value === undefined) return;
      if (element.dataset.splitTitle) {
        const finalWord = element.dataset.splitTitle;
        const beforeFinalWord = String(value).replace(new RegExp(`\\s*${finalWord}$`, "i"), "");
        const firstLine = document.createElement("span");
        const secondLine = document.createElement("span");
        firstLine.textContent = beforeFinalWord;
        secondLine.textContent = finalWord;
        element.replaceChildren(firstLine, secondLine);
        return;
      }
      element.textContent = value;
    });
    document.querySelectorAll("[data-letter]").forEach((container) => {
      const letter = model.letters[container.dataset.letter];
      $("[data-letter-title]", container).textContent = letter.title;
      $("[data-letter-body]", container).innerHTML = letter.paragraphs.map((text) => `<p>${text}</p>`).join("");
    });
  }

  function bindNavigation() {
    document.querySelectorAll("[data-go]").forEach((button) => {
      button.addEventListener("click", () => goTo(button.dataset.go));
    });
  }

  function bindBook() {
    const book = $("#love-book");
    const opener = $("#open-book");
    if (!book || !opener) return;
    opener.addEventListener("click", () => {
      book.classList.add("book--open");
      opener.setAttribute("aria-expanded", "true");
      opener.textContent = "Sigue leyendo ✦";
      $("#book-next").focus({ preventScroll: true });
    });
  }

  function getMemories() { return readEntries(storageKey); }
  function saveMemories(memories) { localStorage.setItem(storageKey, JSON.stringify(memories)); }

  function bindMemories() {
    const form = $("#memory-form");
    const reminder = $("#future-reminder");
    if (!form || !reminder) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const field = $("#memory-text");
      const text = field.value.trim();
      if (!text) return;
      const memory = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        text,
        date: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
      };
      saveMemories([...getMemories(), memory]);
      form.reset();
      reminder.textContent = "Guardado en Futuro. Puedes consultarlo desde el botón flotante.";
      field.focus();
    });
  }

  function bindTicketReference() {
    const ticketStack = $(".ticket-stack");
    if (!ticketStack || ticketStack.querySelector(".ticket-reference")) return;
    const frame = document.createElement("figure");
    frame.className = "ticket-reference-frame";
    frame.style.width = "min(100%, 760px)";
    frame.style.margin = "0 auto 32px";
    frame.style.padding = "clamp(16px, 3vw, 28px)";
    frame.style.background = "#ffeaf6";
    frame.style.boxShadow = "10px 10px 0 #5d163c";
    frame.style.clipPath = "polygon(0 0,100% 0,100% 94%,96% 97%,92% 94%,88% 97%,84% 94%,80% 97%,76% 94%,72% 97%,68% 94%,64% 97%,60% 94%,56% 97%,52% 94%,48% 97%,44% 94%,40% 97%,36% 94%,32% 97%,28% 94%,24% 97%,20% 94%,16% 97%,12% 94%,8% 97%,4% 94%,0 97%)";
    const title = document.createElement("figcaption");
    title.textContent = "ÁLVARO DÍAZ";
    title.style.font = "700 clamp(1.5rem, 5vw, 3rem)/.9 'Space Grotesk', sans-serif";
    title.style.letterSpacing = "-.05em";
    title.style.color = "#1c0b18";
    title.style.margin = "0 0 18px";
    const image = document.createElement("img");
    image.className = "ticket-reference";
    image.src = "../public/images/entradas-alvaro-diaz.jpeg";
    image.alt = "Entradas para el concierto de Álvaro Díaz";
    image.style.width = "100%";
    image.style.height = "auto";
    image.style.display = "block";
    image.style.objectFit = "contain";
    image.style.border = "1px solid #ff9bd766";
    frame.append(title, image);
    ticketStack.querySelector(".concert-ticket")?.remove();
    ticketStack.querySelector(".ticket-note")?.remove();
    ticketStack.prepend(frame);
    const concert = window.AnniversaryModel.concert;
    const ticket = document.createElement("article");
    ticket.className = "concert-ticket mini-ticket";
    ticket.style.width = "min(100%, 420px)";
    ticket.style.margin = "16px auto 0";
    ticket.style.boxShadow = "7px 7px 0 #ff4fb8";
    ticket.innerHTML = `<div class="concert-ticket__top"><span>ADMIT ONE</span><span>✦</span></div><p class="concert-ticket__artist">${concert.artist}</p><p class="concert-ticket__tour">${concert.tour}</p><div class="concert-ticket__info"><p><strong>CIUDAD</strong><span>${concert.city}</span></p><p><strong>FECHA</strong><span>${concert.date}</span></p><p><strong>HORA</strong><span>${concert.time}</span></p></div><div class="barcode" aria-label="Código de barras decorativo"></div><small>${concert.admission}</small>`;
    ticketStack.append(ticket);
  }

  function bindYokoAudio() {
    if (!document.querySelector(".neon-page") || $(".yoko-player")) return;
    const audio = document.createElement("audio");
    audio.className = "yoko-player";
    audio.autoplay = true;
    audio.loop = true;
    audio.preload = "auto";
    audio.src = "../public/audio/Yoko.mp3";
    document.querySelector(".concert-shell")?.prepend(audio);
  }

  function bindSecondLetter() {
    const form = $("#letter-form");
    const reminder = $("#letter-reminder");
    if (!form || !reminder) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const letter = { title: $("#letter-title").value.trim(), body: $("#letter-body").value.trim() };
      if (!letter.title || !letter.body) return;
      addEntry(letterKey, letter);
      form.reset();
      reminder.textContent = "Carta guardada. Puedes leerla desde el botón flotante Cartas.";
    });
  }

  function bindPhotoMemory() {
    const form = $("#photo-memory-form");
    const input = $("#memory-photo");
    const description = $("#photo-description");
    const reminder = $("#photo-reminder");
    if (!form || !input || !description || !reminder) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const file = input.files[0];
      const text = description.value.trim();
      if (!file || !text) {
        reminder.textContent = "Recuerda subir una foto y escribir su descripción mientras viven el evento.";
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const memory = { image: reader.result, description: text, title: "Recuerdo del evento" };
        try {
          addEntry(photoKey, memory);
          form.reset();
          reminder.textContent = "Recuerdo guardado. Puedes verlo desde el botón flotante Recuerdos.";
          reminder.classList.add("is-complete");
        } catch {
          reminder.textContent = "La foto es demasiado grande para guardarla. Prueba con una imagen más pequeña.";
        }
      });
      reader.readAsDataURL(file);
    });
  }

  function renderArchiveList(list, items, emptyText) {
    list.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "memory-empty";
      empty.textContent = emptyText;
      list.append(empty);
      return;
    }
    items.forEach((item) => {
      const entry = document.createElement("article");
      entry.className = "archive-entry";
      if (item.image) {
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = "Recuerdo guardado del evento";
        entry.append(image);
      }
      const title = document.createElement("h3");
      title.textContent = item.title;
      const body = document.createElement("p");
      body.textContent = item.body;
      entry.append(title, body);
      list.append(entry);
    });
  }

  function bindArchives() {
    const model = window.AnniversaryModel;
    document.querySelectorAll("[data-modal]").forEach((button) => {
      button.addEventListener("click", () => {
        const modal = $(`#${button.dataset.modal}`);
        if (!modal) return;
        if (button.dataset.modal === "letters-modal") {
          const letters = [{ title: model.letters.first.title, body: model.letters.first.paragraphs.join("\n\n") }];
          readEntries(letterKey).forEach((letter) => {
            if (letter.title && letter.body) letters.push(letter);
          });
          renderArchiveList($("#letters-archive"), letters, "Todavía no hay cartas guardadas.");
        }
        if (button.dataset.modal === "future-modal") {
          const future = getMemories().map((memory) => ({ title: memory.date, body: memory.text }));
          renderArchiveList($("#future-archive"), future, "Aquí aparecerán las cosas que quieran vivir en el futuro.");
        }
        if (button.dataset.modal === "memories-modal") {
          const memories = readEntries(photoKey)
            .filter((memory) => memory.image && memory.description)
            .map((memory) => ({ title: memory.title || "Recuerdo del evento", body: memory.description, image: memory.image }));
          renderArchiveList($("#memories-archive"), memories, "Aquí aparecerán sus fotos y descripciones.");
        }
        modal.showModal();
      });
    });
    document.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", () => button.closest("dialog")?.close());
    });
    document.querySelectorAll("dialog").forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.close();
      });
    });
  }

  function init() {
    fillText();
    bindNavigation();
    bindBook();
    bindMemories();
    bindTicketReference();
    bindYokoAudio();
    bindSecondLetter();
    bindPhotoMemory();
    bindArchives();
  }
  return { init, goTo };
})();
