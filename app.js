const menuButton = document.querySelector("#menu-button");
const mainMenu = document.querySelector("#main-menu");
const drawerOverlay = document.querySelector("#drawer-overlay");
const menuOptions = document.querySelectorAll(".menu-option");
const panels = document.querySelectorAll(".panel");
const itineraryView = document.querySelector("#itinerary-view");
const yenInput = document.querySelector("#yen-value");
const rateInput = document.querySelector("#exchange-rate");
const result = document.querySelector("#conversion-result");
const converterEyebrow = document.querySelector("#converter-eyebrow");
const currencyValueLabel = document.querySelector("#currency-value-label");
const exchangeRateLabel = document.querySelector("#exchange-rate-label");
const currencyButtons = document.querySelectorAll(".currency-button");
const checklistForm = document.querySelector("#checklist-form");
const checklistInput = document.querySelector("#checklist-input");
const checklistItems = document.querySelector("#checklist-items");
const documentForm = document.querySelector("#document-form");
const documentFileInput = document.querySelector("#document-file");
const documentFileButton = document.querySelector("#document-file-button");
const selectedFile = document.querySelector("#selected-file");
const documentNameInput = document.querySelector("#document-name");
const documentCategoryInput = document.querySelector("#document-category");
const documentGroups = document.querySelector("#document-groups");
const favoriteCountryFilter = document.querySelector("#favorite-country-filter");
const favoriteCityFilter = document.querySelector("#favorite-city-filter");
const favoriteNeighborhoodFilter = document.querySelector("#favorite-neighborhood-filter");
const addFavoriteButton = document.querySelector("#add-favorite-button");
const favoriteGroups = document.querySelector("#favorite-groups");
const favoriteModal = document.querySelector("#favorite-modal");
const favoriteForm = document.querySelector("#favorite-form");
const favoriteModalTitle = document.querySelector("#favorite-modal-title");
const closeFavoriteModal = document.querySelector("#close-favorite-modal");
const cancelFavoriteModal = document.querySelector("#cancel-favorite-modal");
const favoriteIdInput = document.querySelector("#favorite-id");
const favoriteNameInput = document.querySelector("#favorite-name");
const favoriteTypeInput = document.querySelector("#favorite-type");
const favoriteCountryInput = document.querySelector("#favorite-country");
const favoriteCityInput = document.querySelector("#favorite-city");
const favoriteNeighborhoodInput = document.querySelector("#favorite-neighborhood");
const favoriteNeighborhoodOptions = document.querySelector("#favorite-neighborhood-options");
const favoriteNoteInput = document.querySelector("#favorite-note");
const previewModal = document.querySelector("#preview-modal");
const previewTitle = document.querySelector("#preview-title");
const previewBody = document.querySelector("#preview-body");
const closePreview = document.querySelector("#close-preview");

const CHECKLIST_STORAGE_KEY = "japan-2026-checklist";
const ITINERARY_STORAGE_KEY = "japan-2026-itinerary";
const CONVERTER_STORAGE_KEY = "japan-2026-converter";
const FAVORITES_STORAGE_KEY = "japan-2026-favorites";
const ALL_NEIGHBORHOODS = "Todos";
const DOCUMENT_DB_NAME = "japan-2026-documents";
const DOCUMENT_STORE = "documents";
const DOCUMENT_CATEGORIES = ["Voos", "Hospedagem", "Ingressos", "Seguro", "Outros"];

const DEFAULT_ITINERARY_DAYS = [
  {
    id: "day-1",
    dayNumber: 1,
    date: "31/08",
    title: "Shinjuku",
    attractions: [
      { id: "shinjuku-gyoen", name: "Shinjuku Gyoen" },
      { id: "hanazono-shrine", name: "Hanazono Shrine" },
      { id: "lumine-est", name: "Lumine EST" },
      { id: "tokyo-metropolitan", name: "Tokyo Metropolitan Government Building" },
      { id: "omoide-yokocho", name: "Omoide Yokocho" }
    ]
  },
  {
    id: "day-2",
    dayNumber: 2,
    date: "01/09",
    title: "Asakusa e Akihabara",
    attractions: [
      { id: "sensoji", name: "Templo Senso-ji" },
      { id: "nakamise-dori", name: "Nakamise-dori" },
      { id: "ueno", name: "Ueno" },
      { id: "akihabara", name: "Akihabara" }
    ]
  },
  {
    id: "day-3",
    dayNumber: 3,
    date: "02/09",
    title: "Kyoto",
    attractions: [
      { id: "shinkansen-kyoto", name: "Trem-bala para Kyoto" },
      { id: "fushimi-inari", name: "Fushimi Inari" },
      { id: "gion", name: "Gion" }
    ]
  }
];

const DEFAULT_FAVORITES = [
  {
    id: "fav-ichiran",
    name: "Ichiran Shinjuku",
    type: "restaurant",
    country: "Japão",
    city: "Tokyo",
    neighborhood: "Shinjuku",
    note: "Ramen rápido e fácil."
  },
  {
    id: "fav-donki",
    name: "Don Quijote",
    type: "shop",
    country: "Japão",
    city: "Tokyo",
    neighborhood: "Shinjuku",
    note: "Compras de última hora."
  }
];

const FAVORITE_LOCATIONS = {
  "Japão": {
    Tokyo: [ALL_NEIGHBORHOODS, "Shinjuku", "Shibuya", "Asakusa", "Ueno", "Akihabara", "Ginza", "Harajuku", "Ikebukuro", "Roppongi"],
    Osaka: [ALL_NEIGHBORHOODS, "Namba", "Umeda", "Shinsaibashi", "Dotonbori", "Tennoji"],
    Kyoto: [ALL_NEIGHBORHOODS, "Gion", "Higashiyama", "Arashiyama", "Kawaramachi", "Fushimi"],
    Nara: [ALL_NEIGHBORHOODS, "Nara Park", "Kintetsu Nara", "JR Nara"],
    Hiroshima: [ALL_NEIGHBORHOODS, "Hondori", "Hiroshima Station", "Peace Memorial Park", "Miyajima"]
  },
  China: {
    Xangai: [ALL_NEIGHBORHOODS]
  }
};

let itineraryDays = loadItinerary();
let activeDayId = "";
let openedActionItem = null;
let dragState = null;
let converterState = loadConverterState();
let checklist = loadChecklist();
let favorites = loadFavorites();
let favoriteFilters = {
  country: "",
  city: "",
  neighborhood: ""
};
let documents = [];
let selectedDocumentFile = null;
let previewUrl = "";
let openedDocumentMenu = null;
let favoriteModalHeightLocked = false;
let drawerDrag = null;
let drawerOpenDrag = null;
let drawerTouchOpenDrag = null;
let lockedScrollY = 0;
let scrollLockCount = 0;
let menuScrollLocked = false;

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeItinerary(days) {
  return days.map((day, index) => ({
    id: day.id || createId("day"),
    dayNumber: day.dayNumber || index + 1,
    date: day.date || "",
    title: day.title || day.area || day.city || `Dia ${index + 1}`,
    attractions: (day.attractions || []).map((attraction) => ({
      id: attraction.id || createId("attraction"),
      name: attraction.name || attraction.nome || "Atração"
    }))
  }));
}

function loadItinerary() {
  const savedItinerary = localStorage.getItem(ITINERARY_STORAGE_KEY);

  try {
    return normalizeItinerary(savedItinerary ? JSON.parse(savedItinerary) : DEFAULT_ITINERARY_DAYS);
  } catch {
    return normalizeItinerary(DEFAULT_ITINERARY_DAYS);
  }
}

function saveItinerary(nextItinerary = itineraryDays) {
  itineraryDays = normalizeItinerary(nextItinerary);
  localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(itineraryDays));
}

function findDayById(dayId) {
  return itineraryDays.find((day) => day.id === dayId);
}

function addAttraction(dayId, name) {
  const day = findDayById(dayId);

  if (!day || !name.trim()) {
    return;
  }

  day.attractions.push({
    id: createId("attraction"),
    name: name.trim()
  });
  saveItinerary();
}

function addDay() {
  const lastDayNumber = itineraryDays.reduce((maxDay, day) => {
    return Math.max(maxDay, Number(day.dayNumber) || 0);
  }, 0);

  itineraryDays.push({
    id: createId("day"),
    dayNumber: lastDayNumber + 1,
    date: "",
    title: "",
    attractions: []
  });
  itineraryDays.sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber));
  saveItinerary();
}

function editDay(dayId) {
  const day = findDayById(dayId);

  if (!day) {
    return;
  }

  const nextDayNumber = prompt("Dia da viagem", day.dayNumber);
  if (nextDayNumber === null) {
    return;
  }

  const nextTitle = prompt("Título do dia", day.title);
  if (nextTitle === null) {
    return;
  }

  const nextDate = prompt("Data", day.date || "");
  if (nextDate === null) {
    return;
  }

  day.dayNumber = Number(nextDayNumber) || day.dayNumber;
  day.title = nextTitle.trim();
  day.date = nextDate.trim();
  itineraryDays.sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber));
  saveItinerary();
}

function deleteDay(dayId) {
  if (!confirm("Excluir este dia do roteiro?")) {
    return;
  }

  itineraryDays = itineraryDays.filter((day) => day.id !== dayId);
  saveItinerary();
}

function editAttraction(dayId, attractionId, name) {
  const day = findDayById(dayId);
  const attraction = day?.attractions.find((item) => item.id === attractionId);

  if (!attraction || !name.trim()) {
    return;
  }

  attraction.name = name.trim();
  saveItinerary();
}

function deleteAttraction(dayId, attractionId) {
  const day = findDayById(dayId);

  if (!day || !confirm("Excluir esta atração?")) {
    return;
  }

  day.attractions = day.attractions.filter((item) => item.id !== attractionId);
  saveItinerary();
}

function reorderAttraction(dayId, fromIndex, toIndex) {
  const day = findDayById(dayId);

  if (!day || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return;
  }

  if (fromIndex >= day.attractions.length || toIndex >= day.attractions.length) {
    return;
  }

  const [movedAttraction] = day.attractions.splice(fromIndex, 1);
  day.attractions.splice(toIndex, 0, movedAttraction);
  saveItinerary();
}

function lockPageScroll() {
  if (scrollLockCount === 0) {
    lockedScrollY = window.scrollY;
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.classList.add("scroll-locked");
  }

  scrollLockCount += 1;
}

function unlockPageScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);

  if (scrollLockCount === 0) {
    document.body.classList.remove("scroll-locked");
    document.body.style.top = "";
    window.scrollTo(0, lockedScrollY);
  }
}

function updateFavoriteModalHeight() {
  if (favoriteModalHeightLocked) {
    return;
  }

  const viewportHeight = window.innerHeight;
  const safeTop = 16;
  const modalHeight = Math.max(280, Math.floor(viewportHeight * 0.5) - safeTop);
  document.documentElement.style.setProperty("--favorite-modal-height", `${modalHeight}px`);
}

function showSection(sectionId) {
  menuOptions.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === sectionId);
  });
}

function closeMenu() {
  const hasMenuState = mainMenu.classList.contains("open") ||
    mainMenu.classList.contains("dragging") ||
    document.body.classList.contains("menu-open") ||
    !drawerOverlay.hidden;

  if (!hasMenuState) {
    return;
  }

  mainMenu.classList.remove("dragging");
  mainMenu.style.transform = "";
  drawerOverlay.style.opacity = "";
  mainMenu.classList.remove("open");
  drawerOverlay.classList.remove("open");
  document.body.classList.remove("menu-open");
  mainMenu.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");

  closeMenu.timeoutId = window.setTimeout(() => {
    if (!mainMenu.classList.contains("open")) {
      drawerOverlay.hidden = true;
    }
  }, 240);

  if (menuScrollLocked) {
    menuScrollLocked = false;
    unlockPageScroll();
  }
}

function openMenu() {
  drawerOverlay.hidden = false;
  document.body.classList.add("menu-open");

  if (!menuScrollLocked) {
    menuScrollLocked = true;
    lockPageScroll();
  }

  menuButton.setAttribute("aria-expanded", "true");
  mainMenu.setAttribute("aria-hidden", "false");
  mainMenu.style.transform = "";
  drawerOverlay.style.opacity = "";

  window.clearTimeout(closeMenu.timeoutId);
  requestAnimationFrame(() => {
    mainMenu.classList.add("open");
    drawerOverlay.classList.add("open");
  });
}

function prepareMenuForOpeningDrag() {
  drawerOverlay.hidden = false;
  document.body.classList.add("menu-open");

  if (!menuScrollLocked) {
    menuScrollLocked = true;
    lockPageScroll();
  }

  menuButton.setAttribute("aria-expanded", "true");
  mainMenu.setAttribute("aria-hidden", "false");
  mainMenu.classList.add("dragging");
  drawerOverlay.classList.add("open");
  window.clearTimeout(closeMenu.timeoutId);
}

function toggleMenu() {
  if (mainMenu.classList.contains("open")) {
    closeMenu();
  } else {
    openMenu();
  }
}

function startDrawerDrag(event) {
  if (!mainMenu.classList.contains("open") || event.pointerType === "mouse") {
    return;
  }

  drawerDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    currentX: event.clientX,
    startTime: performance.now(),
    width: mainMenu.offsetWidth
  };

  mainMenu.classList.add("dragging");
  mainMenu.setPointerCapture(event.pointerId);
}

function moveDrawerDrag(event) {
  if (!drawerDrag || event.pointerId !== drawerDrag.pointerId) {
    return;
  }

  const deltaX = Math.min(0, event.clientX - drawerDrag.startX);
  const hiddenRatio = Math.min(Math.abs(deltaX) / drawerDrag.width, 1);

  drawerDrag.currentX = event.clientX;
  mainMenu.style.transform = `translateX(${deltaX}px)`;
  drawerOverlay.style.opacity = String(1 - hiddenRatio * 0.7);
}

function finishDrawerDrag(event) {
  if (!drawerDrag || event.pointerId !== drawerDrag.pointerId) {
    return;
  }

  const deltaX = Math.min(0, drawerDrag.currentX - drawerDrag.startX);
  const elapsed = Math.max(performance.now() - drawerDrag.startTime, 1);
  const speed = Math.abs(deltaX) / elapsed;
  const shouldClose = Math.abs(deltaX) > drawerDrag.width * 0.5 || (Math.abs(deltaX) > 40 && speed > 0.65);

  drawerDrag = null;
  mainMenu.classList.remove("dragging");
  mainMenu.style.transform = "";
  drawerOverlay.style.opacity = "";

  if (shouldClose) {
    closeMenu();
  }
}

function cancelDrawerDrag(event) {
  if (!drawerDrag || event.pointerId !== drawerDrag.pointerId) {
    return;
  }

  drawerDrag = null;
  mainMenu.classList.remove("dragging");
  mainMenu.style.transform = "";
  drawerOverlay.style.opacity = "";
}

function startDrawerOpenDrag(event) {
  const isInteractiveSwipe = event.target.closest(".simple-attraction-item, .simple-day-item, .checklist-item, .document-item, .favorite-card-item, .favorite-modal, .converter, .checklist-form, .document-form, .simple-add-form, input, textarea, select, button");

  if (mainMenu.classList.contains("open") || event.pointerType !== "pen" || isInteractiveSwipe) {
    return;
  }

  const drawerWidth = mainMenu.offsetWidth || Math.min(window.innerWidth * 0.82, 340);

  drawerOpenDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    currentX: event.clientX,
    startTime: performance.now(),
    width: drawerWidth,
    activated: false
  };
}

function moveDrawerOpenDrag(event) {
  if (!drawerOpenDrag || event.pointerId !== drawerOpenDrag.pointerId) {
    return;
  }

  const deltaX = Math.max(0, event.clientX - drawerOpenDrag.startX);
  const deltaY = Math.abs(event.clientY - drawerOpenDrag.startY);

  if (!drawerOpenDrag.activated) {
    const isHorizontalSwipe = deltaX > 24 && deltaX > deltaY * 1.15;
    const isVerticalScroll = deltaY > 20 && deltaY > deltaX * 1.2;

    if (isVerticalScroll) {
      drawerOpenDrag = null;
      return;
    }

    if (!isHorizontalSwipe) {
      return;
    }

    prepareMenuForOpeningDrag();
    mainMenu.style.transform = `translateX(-${drawerOpenDrag.width}px)`;
    drawerOverlay.style.opacity = "0";
    drawerOpenDrag.activated = true;

    if (event.target.setPointerCapture) {
      event.target.setPointerCapture(event.pointerId);
    }
  }

  event.preventDefault();
  drawerOpenDrag.currentX = event.clientX;

  const progress = Math.max(0, Math.min(deltaX / drawerOpenDrag.width, 1));
  const translateX = -drawerOpenDrag.width + drawerOpenDrag.width * progress;
  mainMenu.style.transform = `translateX(${translateX}px)`;
  drawerOverlay.style.opacity = String(progress);
}

function finishDrawerOpenDrag(event) {
  if (!drawerOpenDrag || event.pointerId !== drawerOpenDrag.pointerId) {
    return;
  }

  const deltaX = Math.max(0, drawerOpenDrag.currentX - drawerOpenDrag.startX);
  const elapsed = Math.max(performance.now() - drawerOpenDrag.startTime, 1);
  const speed = deltaX / elapsed;
  const shouldOpen = deltaX > drawerOpenDrag.width * 0.5 || (deltaX > 40 && speed > 0.65);
  const wasActivated = drawerOpenDrag.activated;

  drawerOpenDrag = null;
  mainMenu.classList.remove("dragging");
  mainMenu.style.transform = "";
  drawerOverlay.style.opacity = "";

  if (!wasActivated) {
    return;
  }

  if (shouldOpen) {
    mainMenu.classList.add("open");
    drawerOverlay.classList.add("open");
  } else {
    closeMenu();
  }
}

function cancelDrawerOpenDrag(event) {
  if (!drawerOpenDrag || event.pointerId !== drawerOpenDrag.pointerId) {
    return;
  }

  drawerOpenDrag = null;
  mainMenu.classList.remove("dragging");
  mainMenu.style.transform = "";
  drawerOverlay.style.opacity = "";

  closeMenu();
}

function startDrawerOpenTouch(event) {
  const touch = event.touches[0];
  const isInteractiveSwipe = event.target.closest(".simple-attraction-item, .simple-day-item, .checklist-item, .document-item, .favorite-card-item, .favorite-modal, .converter, .checklist-form, .document-form, .simple-add-form, input, textarea, select, button");

  if (!touch || event.touches.length !== 1 || mainMenu.classList.contains("open") || isInteractiveSwipe) {
    return;
  }

  const drawerWidth = mainMenu.offsetWidth || Math.min(window.innerWidth * 0.82, 340);

  drawerTouchOpenDrag = {
    startX: touch.clientX,
    startY: touch.clientY,
    currentX: touch.clientX,
    startTime: performance.now(),
    width: drawerWidth,
    activated: false
  };
}

function moveDrawerOpenTouch(event) {
  if (!drawerTouchOpenDrag || event.touches.length !== 1) {
    return;
  }

  const touch = event.touches[0];
  const deltaX = Math.max(0, touch.clientX - drawerTouchOpenDrag.startX);
  const deltaY = Math.abs(touch.clientY - drawerTouchOpenDrag.startY);

  if (!drawerTouchOpenDrag.activated) {
    const isHorizontalSwipe = deltaX > 24 && deltaX > deltaY * 1.15;
    const isVerticalScroll = deltaY > 20 && deltaY > deltaX * 1.2;

    if (isVerticalScroll) {
      drawerTouchOpenDrag = null;
      return;
    }

    if (!isHorizontalSwipe) {
      return;
    }

    prepareMenuForOpeningDrag();
    mainMenu.style.transform = `translateX(-${drawerTouchOpenDrag.width}px)`;
    drawerOverlay.style.opacity = "0";
    drawerTouchOpenDrag.activated = true;
  }

  event.preventDefault();
  drawerTouchOpenDrag.currentX = touch.clientX;

  const progress = Math.max(0, Math.min(deltaX / drawerTouchOpenDrag.width, 1));
  const translateX = -drawerTouchOpenDrag.width + drawerTouchOpenDrag.width * progress;

  mainMenu.style.transform = `translateX(${translateX}px)`;
  drawerOverlay.style.opacity = String(progress);
}

function finishDrawerOpenTouch() {
  if (!drawerTouchOpenDrag) {
    return;
  }

  const deltaX = Math.max(0, drawerTouchOpenDrag.currentX - drawerTouchOpenDrag.startX);
  const elapsed = Math.max(performance.now() - drawerTouchOpenDrag.startTime, 1);
  const speed = deltaX / elapsed;
  const shouldOpen = deltaX > drawerTouchOpenDrag.width * 0.5 || (deltaX > 40 && speed > 0.65);
  const wasActivated = drawerTouchOpenDrag.activated;

  drawerTouchOpenDrag = null;
  mainMenu.classList.remove("dragging");
  mainMenu.style.transform = "";
  drawerOverlay.style.opacity = "";

  if (!wasActivated) {
    return;
  }

  if (shouldOpen) {
    mainMenu.classList.add("open");
    drawerOverlay.classList.add("open");
  } else {
    closeMenu();
  }
}

function cancelDrawerOpenTouch() {
  if (!drawerTouchOpenDrag) {
    return;
  }

  const wasActivated = drawerTouchOpenDrag.activated;
  drawerTouchOpenDrag = null;
  mainMenu.classList.remove("dragging");
  mainMenu.style.transform = "";
  drawerOverlay.style.opacity = "";

  if (wasActivated) {
    closeMenu();
  }
}

function renderItineraryList() {
  activeDayId = "";
  openedActionItem = null;
  itineraryView.innerHTML = "";

  const list = document.createElement("div");
  list.className = "itinerary-list";

  itineraryDays.forEach((day) => {
    const wrapper = document.createElement("div");
    wrapper.className = "simple-day-item";
    wrapper.dataset.wasSwiping = "false";

    const actions = document.createElement("div");
    actions.className = "swipe-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => {
      editDay(day.id);
      renderItineraryList();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Excluir";
    deleteButton.className = "danger-action";
    deleteButton.addEventListener("click", () => {
      deleteDay(day.id);
      renderItineraryList();
    });

    actions.append(editButton, deleteButton);

    const card = document.createElement("div");
    card.className = "day-summary-card simple-day-card swipe-content";
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.addEventListener("click", () => {
      if (!wrapper.classList.contains("actions-open") && wrapper.dataset.wasSwiping !== "true") {
        renderItineraryDay(day.id);
      }
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        renderItineraryDay(day.id);
      }
    });

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = `Dia ${day.dayNumber}`;

    const content = document.createElement("div");
    if (day.title) {
      const title = document.createElement("h3");
      title.textContent = day.title;
      content.appendChild(title);
    }

    const metaParts = [];
    if (day.date) {
      metaParts.push(day.date);
    }
    if (day.title) {
      metaParts.push(`${day.attractions.length} atrações`);
    }

    if (metaParts.length > 0) {
      const meta = document.createElement("p");
      meta.textContent = metaParts.join(" • ");
      content.appendChild(meta);
    }

    card.append(dayNumber, content);
    wrapper.append(actions, card);
    setupSwipeActions(wrapper, card);
    list.appendChild(wrapper);
  });

  const addDayButton = document.createElement("button");
  addDayButton.className = "add-day-button";
  addDayButton.type = "button";
  addDayButton.textContent = "+ Adicionar dia";
  addDayButton.addEventListener("click", () => {
    addDay();
    renderItineraryList();
  });

  itineraryView.appendChild(list);
  itineraryView.appendChild(addDayButton);
}

function renderItineraryDay(dayId) {
  const day = findDayById(dayId);
  activeDayId = dayId;
  openedActionItem = null;

  if (!day) {
    renderItineraryList();
    return;
  }

  itineraryView.innerHTML = "";

  const detail = document.createElement("div");
  detail.className = "simple-day-detail";

  const backButton = document.createElement("button");
  backButton.className = "back-button";
  backButton.type = "button";
  backButton.textContent = "Voltar aos dias";
  backButton.addEventListener("click", renderItineraryList);

  const header = document.createElement("div");
  header.className = "simple-day-header";

  const title = document.createElement("h3");
  title.textContent = `${day.date || "Sem data"} — ${day.title}`;

  header.appendChild(title);

  const list = document.createElement("ol");
  list.className = "simple-attraction-list";

  day.attractions.forEach((attraction, index) => {
    list.appendChild(createSimpleAttractionItem(day, attraction, index));
  });

  const addForm = document.createElement("form");
  addForm.className = "simple-add-form";
  addForm.autocomplete = "off";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Nova atração";
  input.setAttribute("aria-label", "Nome da nova atração");

  const addButton = document.createElement("button");
  addButton.type = "submit";
  addButton.textContent = "+ Adicionar";

  addForm.append(input, addButton);
  addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addAttraction(day.id, input.value);
    renderItineraryDay(day.id);
  });

  detail.append(backButton, header, list, addForm);
  itineraryView.appendChild(detail);
}

function createSimpleAttractionItem(day, attraction, index) {
  const item = document.createElement("li");
  item.className = "simple-attraction-item";
  item.dataset.index = String(index);

  const actions = document.createElement("div");
  actions.className = "swipe-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";
  editButton.addEventListener("click", () => {
    const nextName = prompt("Nome da atração", attraction.name);

    if (nextName !== null) {
      editAttraction(day.id, attraction.id, nextName);
      renderItineraryDay(day.id);
    }
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Excluir";
  deleteButton.className = "danger-action";
  deleteButton.addEventListener("click", () => {
    deleteAttraction(day.id, attraction.id);
    renderItineraryDay(day.id);
  });

  actions.append(editButton, deleteButton);

  const content = document.createElement("div");
  content.className = "attraction-row swipe-content";
  content.textContent = attraction.name;

  item.append(actions, content);
  setupAttractionGestures(item, content, day.id);
  return item;
}

function closeOpenedActions(exceptItem = null) {
  if (openedActionItem && openedActionItem !== exceptItem) {
    openedActionItem.classList.remove("actions-open");
    const row = openedActionItem.querySelector(".swipe-content");

    if (row) {
      row.style.transform = "";
    }
  }

  if (!exceptItem) {
    openedActionItem = null;
  }
}

function setupSwipeActions(item, content) {
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let isSwiping = false;

  item.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".swipe-actions button")) {
      return;
    }

    startX = event.clientX;
    startY = event.clientY;
    currentX = startX;
    isSwiping = false;
  });

  item.addEventListener("pointermove", (event) => {
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    currentX = event.clientX;

    if (Math.abs(deltaX) > 18 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping = true;
      item.dataset.wasSwiping = "true";
      const translateX = Math.max(-142, Math.min(0, deltaX));
      content.style.transform = `translateX(${translateX}px)`;
    }
  });

  item.addEventListener("pointerup", () => {
    if (!isSwiping) {
      return;
    }

    const shouldOpen = currentX - startX < -60;
    content.style.transform = "";
    item.classList.toggle("actions-open", shouldOpen);

    if (shouldOpen) {
      closeOpenedActions(item);
      openedActionItem = item;
    } else if (openedActionItem === item) {
      openedActionItem = null;
    }

    window.setTimeout(() => {
      item.dataset.wasSwiping = "false";
    }, 0);
  });

  item.addEventListener("pointercancel", () => {
    content.style.transform = "";
    item.dataset.wasSwiping = "false";
  });
}

function setupAttractionGestures(item, content, dayId) {
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let isSwiping = false;
  let isDragging = false;
  let longPressTimer = 0;

  item.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) {
      return;
    }

    startX = event.clientX;
    startY = event.clientY;
    currentX = startX;
    currentY = startY;
    isSwiping = false;
    isDragging = false;

    longPressTimer = window.setTimeout(() => {
      isDragging = true;
      closeOpenedActions();
      item.classList.add("dragging");
      item.setPointerCapture(event.pointerId);
    }, 320);
  });

  item.addEventListener("pointermove", (event) => {
    currentX = event.clientX;
    currentY = event.clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (!isDragging && Math.abs(deltaY) > 12) {
      window.clearTimeout(longPressTimer);
    }

    if (isDragging) {
      event.preventDefault();
      item.style.transform = `translateY(${deltaY}px)`;
      item.classList.toggle("drag-up", deltaY < 0);
      item.classList.toggle("drag-down", deltaY > 0);
      return;
    }

    if (Math.abs(deltaX) > 18 && Math.abs(deltaX) > Math.abs(deltaY)) {
      window.clearTimeout(longPressTimer);
      isSwiping = true;
      const translateX = Math.max(-142, Math.min(0, deltaX));
      content.style.transform = `translateX(${translateX}px)`;
    }
  });

  item.addEventListener("pointerup", (event) => {
    window.clearTimeout(longPressTimer);

    if (isDragging) {
      const day = findDayById(dayId);
      const fromIndex = Number(item.dataset.index);
      const itemHeight = item.offsetHeight || 64;
      const movement = Math.round((currentY - startY) / itemHeight);
      const toIndex = Math.max(0, Math.min(day.attractions.length - 1, fromIndex + movement));

      item.classList.remove("dragging", "drag-up", "drag-down");
      item.style.transform = "";
      reorderAttraction(dayId, fromIndex, toIndex);
      renderItineraryDay(dayId);
      return;
    }

    if (isSwiping) {
      const shouldOpen = currentX - startX < -60;
      content.style.transform = "";
      item.classList.toggle("actions-open", shouldOpen);

      if (shouldOpen) {
        closeOpenedActions(item);
        openedActionItem = item;
      } else if (openedActionItem === item) {
        openedActionItem = null;
      }
      return;
    }

    if (openedActionItem && !event.target.closest(".simple-attraction-item.actions-open")) {
      closeOpenedActions();
    }
  });

  item.addEventListener("pointercancel", () => {
    window.clearTimeout(longPressTimer);
    item.classList.remove("dragging", "drag-up", "drag-down");
    item.style.transform = "";
    content.style.transform = "";
  });
}

function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function updateConversion() {
  const amount = Number(yenInput.value);
  const rate = Number(rateInput.value);
  const total = amount * rate;

  result.textContent = formatBRL(Number.isFinite(total) ? total : 0);
}

function loadConverterState() {
  const defaultState = {
    activeCurrency: "yen",
    rates: {
      yen: 0.034,
      yuan: 0.78
    }
  };
  const savedState = localStorage.getItem(CONVERTER_STORAGE_KEY);

  try {
    return savedState ? { ...defaultState, ...JSON.parse(savedState) } : defaultState;
  } catch {
    return defaultState;
  }
}

function saveConverterState() {
  localStorage.setItem(CONVERTER_STORAGE_KEY, JSON.stringify(converterState));
}

function getCurrencyLabel(currency) {
  return currency === "yuan" ? "yuan" : "ienes";
}

function renderConverter() {
  const currency = converterState.activeCurrency;
  const currencyText = getCurrencyLabel(currency);

  currencyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.currency === currency);
  });

  converterEyebrow.textContent = `${currency === "yuan" ? "Yuan" : "Iene"} para real`;
  currencyValueLabel.textContent = `Valor em ${currencyText}`;
  exchangeRateLabel.textContent = `Cotação: 1 ${currency === "yuan" ? "yuan" : "iene"} em reais`;
  rateInput.value = converterState.rates[currency];
  updateConversion();
}

function setCurrency(currency) {
  converterState.activeCurrency = currency;
  saveConverterState();
  renderConverter();
}

function loadChecklist() {
  const savedItems = localStorage.getItem(CHECKLIST_STORAGE_KEY);

  try {
    return savedItems ? JSON.parse(savedItems) : [];
  } catch {
    return [];
  }
}

function saveChecklist() {
  localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklist));
}

function renderChecklist() {
  checklistItems.innerHTML = "";

  checklist.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.className = "checklist-item";
    listItem.classList.toggle("done", item.done);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    checkbox.setAttribute("aria-label", `Marcar ${item.text} como concluido`);
    checkbox.addEventListener("change", () => toggleChecklistItem(item.id));

    const text = document.createElement("span");
    text.className = "checklist-text";
    text.textContent = item.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-item";
    deleteButton.type = "button";
    deleteButton.textContent = "x";
    deleteButton.setAttribute("aria-label", `Excluir ${item.text}`);
    deleteButton.addEventListener("click", () => deleteChecklistItem(item.id));

    listItem.append(checkbox, text, deleteButton);
    checklistItems.appendChild(listItem);
  });
}

function addChecklistItem(text) {
  checklist.push({
    id: Date.now(),
    text,
    done: false
  });

  saveChecklist();
  renderChecklist();
}

function toggleChecklistItem(id) {
  checklist = checklist.map((item) => {
    return item.id === id ? { ...item, done: !item.done } : item;
  });

  saveChecklist();
  renderChecklist();
}

function deleteChecklistItem(id) {
  checklist = checklist.filter((item) => item.id !== id);
  saveChecklist();
  renderChecklist();
}

function loadFavorites() {
  const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);

  try {
    const loadedFavorites = savedFavorites ? JSON.parse(savedFavorites) : cloneData(DEFAULT_FAVORITES);
    return loadedFavorites.map(normalizeFavorite);
  } catch {
    return cloneData(DEFAULT_FAVORITES).map(normalizeFavorite);
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

function normalizeFavorite(favorite) {
  const neighborhood = (favorite.neighborhood || "").trim();

  return {
    ...favorite,
    neighborhood: neighborhood.toLowerCase() === "todos" || !neighborhood ? ALL_NEIGHBORHOODS : neighborhood
  };
}

function getFavoriteCountries() {
  return Object.keys(FAVORITE_LOCATIONS);
}

function getFavoriteCities(country) {
  return Object.keys(FAVORITE_LOCATIONS[country] || {});
}

function uniqueFavoriteValues(values) {
  const seenValues = new Set();

  return values.reduce((uniqueValues, value) => {
    const normalizedValue = (value || "").trim();
    const key = normalizedValue.toLowerCase();

    if (!normalizedValue || seenValues.has(key)) {
      return uniqueValues;
    }

    seenValues.add(key);
    uniqueValues.push(normalizedValue);
    return uniqueValues;
  }, []);
}

function getFavoriteNeighborhoods(country, city) {
  const defaultNeighborhoods = FAVORITE_LOCATIONS[country]?.[city] || [ALL_NEIGHBORHOODS];
  const savedNeighborhoods = favorites
    .filter((favorite) => favorite.country === country && favorite.city === city)
    .map((favorite) => normalizeFavorite(favorite).neighborhood);

  return uniqueFavoriteValues([ALL_NEIGHBORHOODS, ...defaultNeighborhoods, ...savedNeighborhoods]);
}

function fillFilter(select, values, currentValue) {
  select.innerHTML = "";

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  select.value = values.includes(currentValue) ? currentValue : values[0] || "";
}

function renderFavoriteFilters() {
  const countries = getFavoriteCountries();
  fillFilter(favoriteCountryFilter, countries, favoriteFilters.country);
  favoriteFilters.country = favoriteCountryFilter.value;

  const cities = getFavoriteCities(favoriteFilters.country);
  fillFilter(favoriteCityFilter, cities, favoriteFilters.city);
  favoriteFilters.city = favoriteCityFilter.value;

  const neighborhoods = getFavoriteNeighborhoods(favoriteFilters.country, favoriteFilters.city);
  fillFilter(favoriteNeighborhoodFilter, neighborhoods, favoriteFilters.neighborhood || ALL_NEIGHBORHOODS);
  favoriteFilters.neighborhood = favoriteNeighborhoodFilter.value || ALL_NEIGHBORHOODS;
}

function getFilteredFavorites() {
  return favorites.filter((favorite) => {
    const neighborhood = normalizeFavorite(favorite).neighborhood;

    return favorite.country === favoriteFilters.country &&
      favorite.city === favoriteFilters.city &&
      (favoriteFilters.neighborhood === ALL_NEIGHBORHOODS || neighborhood === favoriteFilters.neighborhood);
  });
}

function renderFavorites() {
  renderFavoriteFilters();
  favoriteGroups.innerHTML = "";

  [
    { type: "restaurant", title: "Restaurantes" },
    { type: "shop", title: "Lojas" }
  ].forEach((group) => {
    const section = document.createElement("section");
    section.className = "favorite-section";

    const title = document.createElement("h3");
    title.textContent = group.title;

    const list = document.createElement("div");
    list.className = "favorite-list";

    const groupFavorites = getFilteredFavorites().filter((favorite) => favorite.type === group.type);

    if (groupFavorites.length === 0) {
      const empty = document.createElement("p");
      empty.className = "favorite-empty";
      empty.textContent = "Nenhum favorito aqui.";
      list.appendChild(empty);
    }

    groupFavorites.forEach((favorite) => {
      list.appendChild(createFavoriteCard(favorite));
    });

    section.append(title, list);
    favoriteGroups.appendChild(section);
  });
}

function createFavoriteCard(favorite) {
  const card = document.createElement("article");
  card.className = "favorite-card-item";

  const content = document.createElement("div");

  const title = document.createElement("h4");
  title.textContent = favorite.name;

  const meta = document.createElement("p");
  meta.textContent = `${favorite.type === "restaurant" ? "Restaurante" : "Loja"} • ${normalizeFavorite(favorite).neighborhood}`;

  content.append(title, meta);

  if (favorite.note) {
    const note = document.createElement("p");
    note.className = "favorite-note";
    note.textContent = favorite.note;
    content.appendChild(note);
  }

  const actions = document.createElement("div");
  actions.className = "favorite-card-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Editar";
  editButton.addEventListener("click", () => openFavoriteForm(favorite.id));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Excluir";
  deleteButton.className = "delete-small-button";
  deleteButton.addEventListener("click", () => deleteFavorite(favorite.id));

  actions.append(editButton, deleteButton);
  card.append(content, actions);
  return card;
}

function fillFavoriteSelect(select, values, currentValue) {
  select.innerHTML = "";

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  select.value = values.includes(currentValue) ? currentValue : values[0] || "";
}

function updateFavoriteCityOptions(currentCity = "") {
  const cities = getFavoriteCities(favoriteCountryInput.value);
  fillFavoriteSelect(favoriteCityInput, cities, currentCity);
}

function updateFavoriteNeighborhoodOptions(currentNeighborhood = ALL_NEIGHBORHOODS) {
  const neighborhoods = getFavoriteNeighborhoods(favoriteCountryInput.value, favoriteCityInput.value);
  const selectedNeighborhood = normalizeFavorite({ neighborhood: currentNeighborhood }).neighborhood;

  favoriteNeighborhoodOptions.innerHTML = "";
  neighborhoods.forEach((neighborhood) => {
    const option = document.createElement("option");
    option.value = neighborhood;
    favoriteNeighborhoodOptions.appendChild(option);
  });

  favoriteNeighborhoodInput.value = selectedNeighborhood === ALL_NEIGHBORHOODS ? "" : selectedNeighborhood;
}

function openFavoriteForm(favoriteId = "") {
  const favorite = favorites.find((item) => item.id === favoriteId);

  favoriteForm.reset();
  favoriteIdInput.value = favoriteId;
  favoriteModalTitle.textContent = favorite ? "Editar favorito" : "Adicionar favorito";
  fillFavoriteSelect(favoriteCountryInput, getFavoriteCountries(), favorite?.country || favoriteFilters.country || "Japão");
  updateFavoriteCityOptions(favorite?.city || favoriteFilters.city);
  updateFavoriteNeighborhoodOptions(favorite?.neighborhood || favoriteFilters.neighborhood || ALL_NEIGHBORHOODS);

  if (favorite) {
    favoriteNameInput.value = favorite.name;
    favoriteTypeInput.value = favorite.type;
    favoriteNoteInput.value = favorite.note || "";
  }

  favoriteModalHeightLocked = false;
  updateFavoriteModalHeight();
  favoriteModalHeightLocked = true;
  lockPageScroll();
  favoriteModal.hidden = false;
  window.setTimeout(() => favoriteNameInput.focus(), 80);
}

function closeFavoriteForm() {
  if (favoriteModal.hidden) {
    return;
  }

  favoriteModal.hidden = true;
  favoriteForm.reset();
  favoriteModalHeightLocked = false;
  unlockPageScroll();
}

function saveFavoriteFromForm() {
  const favorite = normalizeFavorite({
    id: favoriteIdInput.value || createId("favorite"),
    name: favoriteNameInput.value.trim(),
    type: favoriteTypeInput.value,
    country: favoriteCountryInput.value,
    city: favoriteCityInput.value,
    neighborhood: favoriteNeighborhoodInput.value.trim() || ALL_NEIGHBORHOODS,
    note: favoriteNoteInput.value.trim()
  });

  if (!favorite.name || !favorite.country || !favorite.city) {
    alert("Preencha nome, país e cidade.");
    return;
  }

  const existingIndex = favorites.findIndex((item) => item.id === favorite.id);

  if (existingIndex >= 0) {
    favorites[existingIndex] = favorite;
  } else {
    favorites.push(favorite);
  }

  favoriteFilters.country = favorite.country;
  favoriteFilters.city = favorite.city;
  favoriteFilters.neighborhood = favorite.neighborhood;
  saveFavorites();
  closeFavoriteForm();
  renderFavorites();
}

function deleteFavorite(favoriteId) {
  if (!confirm("Excluir este favorito?")) {
    return;
  }

  favorites = favorites.filter((favorite) => favorite.id !== favoriteId);
  saveFavorites();
  renderFavorites();
}

function openDocumentsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DOCUMENT_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(DOCUMENT_STORE)) {
        db.createObjectStore(DOCUMENT_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runDocumentTransaction(mode, action) {
  return openDocumentsDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DOCUMENT_STORE, mode);
      const store = transaction.objectStore(DOCUMENT_STORE);
      const request = action(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => db.close();
    });
  });
}

function getStoredDocuments() {
  return runDocumentTransaction("readonly", (store) => store.getAll());
}

function getStoredDocument(id) {
  return runDocumentTransaction("readonly", (store) => store.get(id));
}

function saveStoredDocument(documentItem) {
  return runDocumentTransaction("readwrite", (store) => store.put(documentItem));
}

function deleteStoredDocument(id) {
  return runDocumentTransaction("readwrite", (store) => store.delete(id));
}

function saveStoredDocuments(documentItems) {
  return openDocumentsDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DOCUMENT_STORE, "readwrite");
      const store = transaction.objectStore(DOCUMENT_STORE);

      documentItems.forEach((documentItem) => store.put(documentItem));
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function normalizeDocumentOrder(documentItems) {
  const categoryIndexes = {};

  return documentItems.map((item) => {
    if (Number.isFinite(item.order)) {
      return item;
    }

    const nextIndex = categoryIndexes[item.category] || 0;
    categoryIndexes[item.category] = nextIndex + 1;
    return { ...item, order: nextIndex };
  });
}

function getCategoryDocuments(category) {
  return documents
    .filter((item) => item.category === category)
    .sort((a, b) => {
      const orderA = Number.isFinite(a.order) ? a.order : 0;
      const orderB = Number.isFinite(b.order) ? b.order : 0;
      return orderA - orderB;
    });
}

function getNextDocumentOrder(category) {
  const categoryDocuments = getCategoryDocuments(category);

  if (categoryDocuments.length === 0) {
    return 0;
  }

  return Math.max(...categoryDocuments.map((item) => Number.isFinite(item.order) ? item.order : 0)) + 1;
}

function reorderDocument(category, fromIndex, toIndex) {
  if (fromIndex === toIndex) {
    return;
  }

  const categoryDocuments = getCategoryDocuments(category);
  const [movedDocument] = categoryDocuments.splice(fromIndex, 1);

  if (!movedDocument) {
    return;
  }

  categoryDocuments.splice(toIndex, 0, movedDocument);
  const reorderedDocuments = categoryDocuments.map((item, index) => ({ ...item, order: index }));
  const reorderedIds = new Set(reorderedDocuments.map((item) => item.id));

  documents = documents
    .filter((item) => !reorderedIds.has(item.id))
    .concat(reorderedDocuments);

  saveStoredDocuments(reorderedDocuments).then(renderDocuments);
}

function renderDocuments() {
  documentGroups.innerHTML = "";

  DOCUMENT_CATEGORIES.forEach((category) => {
    const categoryDocuments = getCategoryDocuments(category);
    const section = document.createElement("section");
    section.className = "document-category";

    const title = document.createElement("h3");
    title.textContent = category;
    section.appendChild(title);

    const list = document.createElement("ul");
    list.className = "document-list";

    if (categoryDocuments.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "document-item empty-document";
      emptyItem.textContent = "Nenhum documento salvo.";
      list.appendChild(emptyItem);
    }

    categoryDocuments.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.className = "document-item";
      listItem.dataset.category = category;
      listItem.dataset.index = categoryDocuments.indexOf(item);

      const info = document.createElement("div");
      info.className = "document-name";
      info.textContent = item.name;

      const meta = document.createElement("span");
      meta.className = "document-meta";
      meta.textContent = `${item.fileName} • ${formatFileSize(item.size)}`;
      info.appendChild(meta);

      const actionMenu = createDocumentActionMenu(item);

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-item";
      deleteButton.type = "button";
      deleteButton.textContent = "x";
      deleteButton.setAttribute("aria-label", `Excluir ${item.name}`);
      deleteButton.addEventListener("click", () => removeDocument(item.id));

      listItem.append(info, actionMenu, deleteButton);
      setupDocumentReorder(listItem);
      list.appendChild(listItem);
    });

    section.appendChild(list);
    documentGroups.appendChild(section);
  });
}

function setupDocumentReorder(item) {
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  let longPressTimer = 0;
  let scrollLocked = false;

  function finishDocumentReorderGesture() {
    item.classList.remove("reordering", "reorder-up", "reorder-down");
    item.style.transform = "";

    if (scrollLocked) {
      scrollLocked = false;
      unlockPageScroll();
    }
  }

  ["selectstart", "dragstart", "contextmenu"].forEach((eventName) => {
    item.addEventListener(eventName, (event) => {
      if (!event.target.closest("button, .document-action-menu")) {
        event.preventDefault();
      }
    });
  });

  item.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, .document-action-menu")) {
      return;
    }

    startY = event.clientY;
    currentY = startY;
    isDragging = false;

    longPressTimer = window.setTimeout(() => {
      isDragging = true;
      scrollLocked = true;
      lockPageScroll();
      closeDocumentActionMenu();
      item.classList.add("reordering");
      item.setPointerCapture(event.pointerId);
    }, 320);
  });

  item.addEventListener("pointermove", (event) => {
    currentY = event.clientY;
    const deltaY = currentY - startY;

    if (!isDragging && Math.abs(deltaY) > 12) {
      window.clearTimeout(longPressTimer);
      return;
    }

    if (!isDragging) {
      return;
    }

    event.preventDefault();
    item.style.transform = `translateY(${deltaY}px)`;
    item.classList.toggle("reorder-up", deltaY < 0);
    item.classList.toggle("reorder-down", deltaY > 0);
  });

  item.addEventListener("pointerup", () => {
    window.clearTimeout(longPressTimer);

    if (!isDragging) {
      return;
    }

    const category = item.dataset.category;
    const categoryDocuments = getCategoryDocuments(category);
    const fromIndex = Number(item.dataset.index);
    const itemHeight = item.offsetHeight || 66;
    const movement = Math.round((currentY - startY) / itemHeight);
    const toIndex = Math.max(0, Math.min(categoryDocuments.length - 1, fromIndex + movement));

    finishDocumentReorderGesture();
    reorderDocument(category, fromIndex, toIndex);
  });

  item.addEventListener("pointercancel", () => {
    window.clearTimeout(longPressTimer);
    finishDocumentReorderGesture();
  });
}

function refreshDocuments() {
  getStoredDocuments()
    .then((storedDocuments) => {
      documents = normalizeDocumentOrder(storedDocuments.sort((a, b) => b.createdAt - a.createdAt));
      renderDocuments();
    })
    .catch(() => {
      documentGroups.textContent = "Não foi possível carregar os documentos neste navegador.";
    });
}

function closeDocumentActionMenu() {
  if (!openedDocumentMenu) {
    return;
  }

  openedDocumentMenu.menu.hidden = true;
  openedDocumentMenu.button.setAttribute("aria-expanded", "false");
  openedDocumentMenu = null;
}

function createShareFile(item) {
  const blob = item?.file;
  const type = blob?.type || item?.type || "application/octet-stream";
  const fileName = item?.fileName || blob?.name || item?.name || "documento";

  return new File([blob], fileName, { type });
}

function logShareDiagnostics(item, file, canShareResult, error = null) {
  console.error("Diagnóstico do compartilhamento de documento", {
    hasNavigatorShare: Boolean(navigator.share),
    hasNavigatorCanShare: Boolean(navigator.canShare),
    mimeType: file?.type || item?.type || item?.file?.type || "",
    fileName: file?.name || item?.fileName || item?.name || "",
    size: file?.size || item?.size || item?.file?.size || 0,
    canShareResult,
    error
  });
}

function createDocumentActionMenu(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "document-action-menu";

  const menuButton = document.createElement("button");
  menuButton.className = "document-menu-button";
  menuButton.type = "button";
  menuButton.textContent = "⋮";
  menuButton.setAttribute("aria-label", `Opções de ${item.name}`);
  menuButton.setAttribute("aria-haspopup", "menu");
  menuButton.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.className = "document-menu-options";
  menu.setAttribute("role", "menu");
  menu.hidden = true;

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.textContent = "Abrir";
  openButton.setAttribute("role", "menuitem");
  openButton.addEventListener("click", () => {
    closeDocumentActionMenu();
    openStoredDocument(item.id);
  });

  menu.appendChild(openButton);

  const shareButton = document.createElement("button");
  shareButton.type = "button";
  shareButton.textContent = "Compartilhar";
  shareButton.setAttribute("role", "menuitem");
  shareButton.addEventListener("click", () => {
    closeDocumentActionMenu();
    shareStoredDocument(item.id);
  });
  menu.appendChild(shareButton);

  menuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const shouldOpen = menu.hidden;
    closeDocumentActionMenu();
    menu.hidden = !shouldOpen;
    menuButton.setAttribute("aria-expanded", String(shouldOpen));
    openedDocumentMenu = shouldOpen ? { menu, button: menuButton } : null;
  });

  wrapper.append(menuButton, menu);
  return wrapper;
}

function openStoredDocument(id) {
  const newWindow = window.open("", "_blank");

  if (!newWindow) {
    alert("O navegador bloqueou a abertura do documento. Permita pop-ups para este site e tente novamente.");
    return;
  }

  getStoredDocument(id)
    .then((item) => {
      if (!item?.file) {
        newWindow.close();
        alert("Não foi possível abrir este documento.");
        return;
      }

      const blob = item.file.type
        ? item.file
        : new Blob([item.file], { type: item.type || "application/octet-stream" });
      const objectUrl = URL.createObjectURL(blob);

      newWindow.location.href = objectUrl;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5 * 60 * 1000);
    })
    .catch(() => {
      newWindow.close();
      alert("Não foi possível abrir este documento neste navegador.");
    });
}

function shareStoredDocument(id) {
  getStoredDocument(id)
    .then((item) => {
      let file = null;
      let canShareResult = false;

      if (!navigator.share || !navigator.canShare || !item?.file) {
        logShareDiagnostics(item, file, canShareResult);
        alert("Este arquivo não pode ser compartilhado diretamente neste navegador.");
        return;
      }

      file = createShareFile(item);

      try {
        canShareResult = navigator.canShare({ files: [file] });
      } catch (error) {
        logShareDiagnostics(item, file, canShareResult, error);
        alert("Este arquivo não pode ser compartilhado diretamente neste navegador.");
        return;
      }

      logShareDiagnostics(item, file, canShareResult);

      if (!canShareResult) {
        alert("Este arquivo não pode ser compartilhado diretamente neste navegador.");
        return;
      }

      navigator.share({ files: [file] }).catch((error) => {
        logShareDiagnostics(item, file, canShareResult, error);

        if (error?.name !== "AbortError") {
          alert("Este arquivo não pode ser compartilhado diretamente neste navegador.");
        }
      });
    })
    .catch((error) => {
      logShareDiagnostics(null, null, false, error);
      alert("Este arquivo não pode ser compartilhado diretamente neste navegador.");
    });
}

function previewDocument(id) {
  const item = documents.find((documentItem) => documentItem.id === id);

  if (!item) {
    return;
  }

  closeDocumentPreview();
  previewUrl = URL.createObjectURL(item.file);
  previewTitle.textContent = item.name;

  if (item.type.startsWith("image/")) {
    const image = document.createElement("img");
    image.src = previewUrl;
    image.alt = item.name;
    previewBody.appendChild(image);
  } else {
    const frame = document.createElement("iframe");
    frame.src = previewUrl;
    frame.title = item.name;
    previewBody.appendChild(frame);
  }

  if (previewModal.hidden) {
    lockPageScroll();
    previewModal.hidden = false;
  }
}

function closeDocumentPreview() {
  if (previewModal.hidden) {
    return;
  }

  previewModal.hidden = true;
  previewBody.innerHTML = "";

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = "";
  }

  unlockPageScroll();
}

function removeDocument(id) {
  deleteStoredDocument(id).then(refreshDocuments);
}

menuButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleMenu();
});

menuOptions.forEach((button) => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
    closeMenu();
  });
});

drawerOverlay.addEventListener("click", closeMenu);
mainMenu.addEventListener("pointerdown", startDrawerDrag);
mainMenu.addEventListener("pointermove", moveDrawerDrag);
mainMenu.addEventListener("pointerup", finishDrawerDrag);
mainMenu.addEventListener("pointercancel", cancelDrawerDrag);
document.addEventListener("pointerdown", startDrawerOpenDrag);
document.addEventListener("pointermove", moveDrawerOpenDrag, { passive: false });
document.addEventListener("pointerup", finishDrawerOpenDrag);
document.addEventListener("pointercancel", cancelDrawerOpenDrag);
document.addEventListener("touchstart", startDrawerOpenTouch, { passive: false });
document.addEventListener("touchmove", moveDrawerOpenTouch, { passive: false });
document.addEventListener("touchend", finishDrawerOpenTouch);
document.addEventListener("touchcancel", cancelDrawerOpenTouch);

document.addEventListener("click", (event) => {
  if (!event.target.closest(".simple-attraction-item, .simple-day-item")) {
    closeOpenedActions();
  }

  if (!event.target.closest(".document-action-menu")) {
    closeDocumentActionMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainMenu.classList.contains("open")) {
    closeMenu();
  }

  if (event.key === "Escape") {
    closeDocumentActionMenu();
  }
});

yenInput.addEventListener("input", updateConversion);
rateInput.addEventListener("input", () => {
  converterState.rates[converterState.activeCurrency] = Number(rateInput.value) || 0;
  saveConverterState();
  updateConversion();
});
currencyButtons.forEach((button) => {
  button.addEventListener("click", () => setCurrency(button.dataset.currency));
});
renderConverter();

checklistForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = checklistInput.value.trim();
  if (!text) {
    return;
  }

  addChecklistItem(text);
  checklistInput.value = "";
  checklistInput.focus();
});

documentFileButton.addEventListener("click", () => {
  documentFileInput.click();
});

favoriteCountryFilter.addEventListener("change", () => {
  favoriteFilters.country = favoriteCountryFilter.value;
  favoriteFilters.city = "";
  favoriteFilters.neighborhood = "";
  renderFavorites();
});

favoriteCityFilter.addEventListener("change", () => {
  favoriteFilters.city = favoriteCityFilter.value;
  favoriteFilters.neighborhood = "";
  renderFavorites();
});

favoriteNeighborhoodFilter.addEventListener("change", () => {
  favoriteFilters.neighborhood = favoriteNeighborhoodFilter.value;
  renderFavorites();
});

addFavoriteButton.addEventListener("click", () => openFavoriteForm());

favoriteCountryInput.addEventListener("change", () => {
  updateFavoriteCityOptions();
  updateFavoriteNeighborhoodOptions(ALL_NEIGHBORHOODS);
});

favoriteCityInput.addEventListener("change", () => {
  updateFavoriteNeighborhoodOptions(ALL_NEIGHBORHOODS);
});

favoriteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveFavoriteFromForm();
});

closeFavoriteModal.addEventListener("click", closeFavoriteForm);
cancelFavoriteModal.addEventListener("click", closeFavoriteForm);

favoriteModal.addEventListener("click", (event) => {
  if (event.target === favoriteModal) {
    closeFavoriteForm();
  }
});

window.addEventListener("resize", updateFavoriteModalHeight);

documentFileInput.addEventListener("change", () => {
  selectedDocumentFile = documentFileInput.files[0] || null;

  if (!selectedDocumentFile) {
    selectedFile.textContent = "Nenhum arquivo selecionado";
    return;
  }

  selectedFile.textContent = selectedDocumentFile.name;

  if (!documentNameInput.value.trim()) {
    documentNameInput.value = selectedDocumentFile.name.replace(/\.[^/.]+$/, "");
  }
});

documentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = documentNameInput.value.trim();

  if (!selectedDocumentFile || !name) {
    alert("Escolha um arquivo e informe um nome.");
    return;
  }

  const isAcceptedFile = selectedDocumentFile.type === "application/pdf" ||
    selectedDocumentFile.type.startsWith("image/");

  if (!isAcceptedFile) {
    alert("Use apenas arquivos PDF ou imagens.");
    return;
  }

  const documentItem = {
    id: Date.now(),
    name,
    category: documentCategoryInput.value,
    order: getNextDocumentOrder(documentCategoryInput.value),
    fileName: selectedDocumentFile.name,
    type: selectedDocumentFile.type,
    size: selectedDocumentFile.size,
    createdAt: Date.now(),
    file: selectedDocumentFile
  };

  saveStoredDocument(documentItem).then(() => {
    selectedDocumentFile = null;
    documentForm.reset();
    selectedFile.textContent = "Nenhum arquivo selecionado";
    refreshDocuments();
  });
});

closePreview.addEventListener("click", closeDocumentPreview);

previewModal.addEventListener("click", (event) => {
  if (event.target === previewModal) {
    closeDocumentPreview();
  }
});

renderItineraryList();
renderChecklist();
renderFavorites();
refreshDocuments();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js", { scope: "./" })
      .catch((error) => {
        console.error("Não foi possível registrar o service worker.", error);
      });
  });
}
