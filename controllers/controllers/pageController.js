/* Controlador: gestiona eventos, navegación y recuerdos persistentes. */
window.PageController = (() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const storageKey = "aniversario-future-memories";

  function goTo(path) {
    document.body.classList.add("is-leaving");
    window.setTimeout(() => { window.location.href = path; }, 260);
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

  function init() {
    fillText();
    bindNavigation();
    bindBook();
    bindMemories();
  }
  return { init, goTo };
})();

