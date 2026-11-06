// The registers page. One project at a time is "loaded" from memory into the
// registers. The projects themselves are listed in projects-data.js.

const root = document.documentElement;
const memory = document.querySelector(".memory");
const memoryName = document.querySelector(".memory__name");
const memorySlot = document.querySelector(".memory__slot");
const memoryMap = document.getElementById("memory-map");
const memoryList = memoryMap.querySelector(".memory-map__list");
const cpuBox = document.querySelector(".cpu-box");
const registerFile = document.querySelector(".register-file");
const addressLink = document.querySelector(".address");
const addressText = document.querySelector(".address__text");
const addressLast = document.querySelector(".address__last");
const programCounter = document.querySelector(".register--pc");
const display = document.querySelector(".display");
const displayTitle = document.getElementById("display-title");
const screenLink = document.querySelector(".display__screen");
const screenImage = document.querySelector(".display__image");
const shotControls = document.querySelector(".display__controls");
const shotCount = document.querySelector(".display__count");
const playLink = document.querySelector(".display__play");
const motionOff = matchMedia("(prefers-reduced-motion: reduce)");

let current = 0;
let shot = 0;               // which picture the LCD is showing
let loadTimer = null;


// ---------- Writing values into the registers ----------

// Memory addresses for the slots: 0x00, 0x01, ...
function slotAddress(index) {
    return "0x" + index.toString(16).toUpperCase().padStart(2, "0");
}

function field(name) {
    return cpuBox.querySelector(`[data-field="${name}"]`);
}

// (writeText, which greys out [placeholders], is shared and lives in section.js)

function writeList(list, items = []) {
    list.replaceChildren(...items.map((item) => {
        const li = document.createElement("li");
        writeText(li, item);
        return li;
    }));
}

function writeStack(list, stack = {}) {
    const groups = [
        ["Languages", stack.languages],
        ["Frameworks", stack.frameworks],
        ["Tools", stack.tools],
    ];

    list.replaceChildren();
    groups.forEach(([label, items]) => {
        if (!items || items.length === 0) return;
        const term = document.createElement("dt");
        const value = document.createElement("dd");
        term.textContent = label;
        writeText(value, items.join(", "));
        list.append(term, value);
    });
}

function writeResults(list, results = []) {
    list.replaceChildren(...results.map(({ value, label }) => {
        const cell = document.createElement("li");
        const number = document.createElement("span");
        const caption = document.createElement("span");
        number.className = "results__value";
        caption.className = "results__label";
        writeText(number, value);
        writeText(caption, label);
        cell.append(number, caption);
        return cell;
    }));
}

function render(project) {
    // Memory
    memoryName.textContent = project.name;
    memorySlot.textContent = slotAddress(current);
    document.title = `${project.name} - Projects - Samuel Horner`;

    // Address register: a link to the code. The last part of the address stays on the
    // same line as the ↗ icon, so the icon never wraps onto a line by itself.
    if (project.repo) {
        const address = project.repo.replace(/^https?:\/\//, "");
        const split = address.lastIndexOf("/") + 1;
        addressLink.href = project.repo;
        addressText.textContent = address.slice(0, split);
        addressLast.textContent = address.slice(split);
    } else {
        addressLink.removeAttribute("href");
        addressText.textContent = "No public repository";
        addressLast.textContent = "";
    }

    // Program counter: status, and where it goes next (or HALT when it's finished)
    const finished = project.status === "finished";
    programCounter.classList.toggle("is-finished", finished);
    programCounter.classList.toggle("is-running", !finished);
    field("state").textContent = finished ? "Finished" : "In progress";
    writeText(field("statusNote"), project.statusNote);
    field("op").textContent = finished ? "HALT" : "NEXT";
    writeText(field("next"), project.next || (finished ? "End of program." : "[Where the project is heading next]"));

    // Instruction register: how to build it
    writeList(field("build"), project.build);
    writeText(field("buildNote"), project.buildNote);

    // Numbered registers
    writeText(field("role"), project.role);
    writeStack(field("stack"), project.stack);
    writeList(field("features"), project.features);
    writeList(field("highlights"), project.highlights);
    writeList(field("challenges"), project.challenges);
    writeList(field("learned"), project.learned);
    writeResults(field("results"), project.results);

    renderDisplay(project);
}


// ---------- LCD screen ----------
// Shows a project's screenshots or GIF, with buttons to step through them,
// plus a "Play it" link when there is one. Hidden when a project has neither.

function showShot(index, flicker) {
    const media = PROJECTS[current].media || [];
    if (media.length === 0) return;

    shot = (index + media.length) % media.length;
    screenImage.src = media[shot].src;
    screenImage.alt = media[shot].alt || "";
    screenLink.href = media[shot].src;          // click the screen to open it full size
    shotCount.textContent = `${shot + 1} / ${media.length}`;

    if (flicker && !motionOff.matches) restartClass(screenLink, "is-changing");
}

function renderDisplay(project) {
    const media = project.media || [];
    const hasMedia = media.length > 0;
    const onlyGifs = hasMedia && media.every((item) => /\.gif$/i.test(item.src));

    display.hidden = !hasMedia && !project.play;
    display.classList.toggle("is-off", !hasMedia);
    display.classList.toggle("is-pixel-art", Boolean(project.pixelArt));
    // The screen's shape, e.g. "4 / 3", and the same shape as a number for sizing it in CSS
    const screen = project.screen || "4 / 3";
    const [across, down] = screen.split("/").map(Number);
    display.style.setProperty("--screen", screen);
    display.style.setProperty("--screen-ratio", across / down || 4 / 3);
    displayTitle.textContent = onlyGifs ? "In action" : "Screenshots";
    shotControls.hidden = media.length < 2;

    if (hasMedia) {
        showShot(0, false);
    } else {
        screenImage.removeAttribute("src");
        screenLink.removeAttribute("href");
    }

    playLink.hidden = !project.play;
    if (project.play) playLink.href = project.play;
}

document.querySelectorAll(".display__button").forEach((button) => {
    button.addEventListener("click", () => showShot(shot + Number(button.dataset.shot), true));
});


// ---------- Loading a project ----------

// Restart a CSS animation by taking its class off and putting it back
function restartClass(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
}

// The bus lights up and each register is rewritten in turn
function playLoad(direction) {
    if (motionOff.matches) return;

    memory.style.setProperty("--dir", direction);
    restartClass(memory, "is-switching");
    restartClass(cpuBox, "is-writing");
    cpuBox.classList.add("is-loading");

    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => {
        cpuBox.classList.remove("is-loading", "is-writing");
        memory.classList.remove("is-switching");
    }, 1200);
}

function load(index, direction = 1) {
    current = (index + PROJECTS.length) % PROJECTS.length;   // wraps round at either end
    const project = PROJECTS[current];

    render(project);
    updateMemoryMap();
    playLoad(direction);

    // Put the project in the page address (projects.html#its-id) so it can be shared
    try {
        history.replaceState(null, "", location.href.split("#")[0] + "#" + project.id);
    } catch (error) {}
}

document.querySelectorAll(".step").forEach((button) => {
    const direction = Number(button.dataset.step);
    button.addEventListener("click", () => load(current + direction, direction));
});


// ---------- Memory map: pick any project ----------

const slots = PROJECTS.map((project, index) => {
    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "memory-map__slot";

    const address = document.createElement("span");
    const name = document.createElement("span");
    const state = document.createElement("span");
    address.className = "memory-map__addr";
    name.className = "memory-map__name";
    state.className = "memory-map__state";
    address.textContent = slotAddress(index);
    name.textContent = project.name;
    slot.append(address, name, state);

    slot.addEventListener("click", () => {
        closeMemoryMap(true);
        if (index !== current) load(index, index > current ? 1 : -1);
    });

    const item = document.createElement("li");
    item.append(slot);
    memoryList.append(item);
    return slot;
});

function updateMemoryMap() {
    slots.forEach((slot, index) => {
        const loaded = index === current;
        slot.setAttribute("aria-current", loaded);
        slot.querySelector(".memory-map__state").textContent = loaded ? "LOADED" : "";
    });
}

function openMemoryMap() {
    memoryMap.hidden = false;
    memory.setAttribute("aria-expanded", "true");
    slots[current].focus();
}

function closeMemoryMap(returnFocus) {
    memoryMap.hidden = true;
    memory.setAttribute("aria-expanded", "false");
    if (returnFocus) memory.focus();
}

memory.addEventListener("click", () => {
    if (memoryMap.hidden) openMemoryMap();
    else closeMemoryMap(false);
});

// Click anywhere else to close it
document.addEventListener("click", (event) => {
    if (!memoryMap.hidden && !event.target.closest(".memory-wrap")) closeMemoryMap(false);
});

// Up and down arrows move through the list
memoryMap.addEventListener("keydown", (event) => {
    const index = slots.indexOf(document.activeElement);
    const moves = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: slots.length - 1 };
    if (!(event.key in moves)) return;

    event.preventDefault();
    slots[(moves[event.key] + slots.length) % slots.length].focus();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !memoryMap.hidden) {
        closeMemoryMap(true);
        return;
    }

    // Left and right arrow keys step through the projects
    if (!memoryMap.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest("input, textarea, select, [contenteditable]")) return;

    if (event.key === "ArrowLeft") load(current - 1, -1);
    if (event.key === "ArrowRight") load(current + 1, 1);
});

window.addEventListener("hashchange", () => {
    const index = PROJECTS.findIndex((project) => "#" + project.id === location.hash);
    if (index !== -1 && index !== current) load(index, index > current ? 1 : -1);
});


// ---------- Start ----------

const fromAddress = PROJECTS.findIndex((project) => "#" + project.id === location.hash);
current = Math.max(fromAddress, 0);
render(PROJECTS[current]);
updateMemoryMap();

// Arriving with the zoom (section.js): write the project in once the colour has shrunk away
if (root.classList.contains("is-entering")) {
    document.addEventListener("zoom-arrived", () => playLoad(1), { once: true });
} else {
    playLoad(1);
}

// Leaving with the zoom: tidy away the memory map first
document.addEventListener("zoom-leaving", () => closeMemoryMap(false));
