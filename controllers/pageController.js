/* Controlador: gestiona eventos, navegación y recuerdos persistentes. */
window.PageController = (() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const storageKey = "aniversario-future-memories";

  function goTo(path) {
    document.body.classList.add("is-leaving");
    const destination = path === "index.html" ? "/" : path.startsWith("/") ? path : `/views/${path}`;
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

  function createMemoryCard(memory) {
    const article = document.createElement("article");
    article.className = "memory-card";
    const removeButton = document.createElement("button");
    removeButton.className = "memory-card__delete";
    removeButton.setAttribute("aria-label", "Eliminar recuerdo");
    removeButton.textContent = "×";
    const message = document.createElement("p");
    message.textContent = memory.text;
    const date = document.createElement("time");
    date.textContent = memory.date;
    article.append(removeButton, message, date);
    $(".memory-card__delete", article).addEventListener("click", () => {
      const memories = getMemories().filter((item) => item.id !== memory.id);
      saveMemories(memories);
      article.remove();
      renderEmptyState();
    });
    return article;
  }

  function getMemories() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; }
  }
  function saveMemories(memories) { localStorage.setItem(storageKey, JSON.stringify(memories)); }
  function renderEmptyState() {
    const list = $("#memory-list");
    if (!list) return;
    $("#memory-empty")?.remove();
    if (!list.children.length) {
      const empty = document.createElement("p");
      empty.id = "memory-empty";
      empty.className = "memory-empty";
      empty.textContent = "Aquí aparecerán las próximas páginas de nuestra historia.";
      list.append(empty);
    }
  }

  function bindMemories() {
    const form = $("#memory-form");
    const list = $("#memory-list");
    if (!form || !list) return;
    getMemories().forEach((memory) => list.append(createMemoryCard(memory)));
    renderEmptyState();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const field = $("#memory-text");
      const text = field.value.trim();
      if (!text) return;
      const memory = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), text, date: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) };
      saveMemories([...getMemories(), memory]);
      $("#memory-empty")?.remove();
      list.prepend(createMemoryCard(memory));
      form.reset();
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
    ticketStack.prepend(frame);
  }

  function init() {
    fillText();
    bindNavigation();
    bindBook();
    bindMemories();
    bindTicketReference();
  }
  return { init, goTo };
})();
