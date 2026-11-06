// The work and volunteer pages. Each role is a line in an L1 cache: a line number,
// a valid bit, the tag (who it was with) and the data (the role itself). When the page
// opens, the lines are filled in from memory one at a time, just like the registers.
// The roles are listed in experience-data.js.

const cache = document.querySelector(".cache");
const lineList = document.querySelector(".cache__lines");
const roles = cache.dataset.roles === "volunteer" ? VOLUNTEER : WORK;
const motionOff = matchMedia("(prefers-reduced-motion: reduce)");

// The ↗ icon used on external links
const EXTERNAL_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/></svg>';


// ---------- Building the lines ----------

// Line numbers: 0x0, 0x1, ...
function lineAddress(index) {
    return "0x" + index.toString(16).toUpperCase();
}

// "https://www.bmr.ca/en/" -> "bmr.ca/en"
function siteLabel(url) {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

// Make an element, with optional text (writeText from section.js greys out [placeholders])
function make(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) writeText(element, text);
    return element;
}

function buildLine(role, index) {
    const line = make("li", "line");
    line.style.setProperty("--i", index);

    // Line number and valid bit (just for show, so screen readers skip them)
    const number = make("span", "line__index", lineAddress(index));
    const valid = make("span", "line__valid");
    valid.append(make("span", "line__bit", "0"));
    number.setAttribute("aria-hidden", "true");
    valid.setAttribute("aria-hidden", "true");

    // Tag: who it was with
    const tag = make("div", "line__tag");

    if (role.logo) {
        const logo = make("span", "line__logo");
        const image = document.createElement("img");
        image.src = role.logo;
        image.alt = "";                 // the name is written right below it
        if (role.logoScale) image.style.scale = role.logoScale;
        logo.append(image);
        tag.append(logo);
    }

    tag.append(make("h2", "line__org", role.org));

    if (role.site) {
        const link = make("a", "line__site", siteLabel(role.site));
        link.href = role.site;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.insertAdjacentHTML("beforeend", EXTERNAL_ICON);
        tag.append(link);
    }

    // Data: the role itself
    const data = make("div", "line__data");
    data.append(
        make("p", "line__role", role.role),
        make("p", "line__meta", [role.dates, role.place].filter(Boolean).join(" · ")),
        make("p", "line__about", role.about)
    );

    line.append(number, valid, tag, data);
    return line;
}

roles.forEach((role, index) => lineList.append(buildLine(role, index)));


// ---------- Filling the cache ----------

function markValid(line) {
    line.classList.add("is-valid");
    line.querySelector(".line__bit").textContent = "1";
}

// The lines are loaded in from memory one at a time
function fill() {
    const lines = [...lineList.children];

    if (motionOff.matches) {
        lines.forEach(markValid);
        return;
    }

    lines.forEach((line, index) => setTimeout(() => markValid(line), 200 + index * 260));
}

// Arriving with the zoom (section.js): fill the cache once the colour has shrunk away
if (document.documentElement.classList.contains("is-entering")) {
    document.addEventListener("zoom-arrived", fill, { once: true });
} else {
    fill();
}
