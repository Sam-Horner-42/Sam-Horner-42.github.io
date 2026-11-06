// The chip on the home page.
// (theme.js also runs on this page. Plain scripts share their top-level names,
// so don't reuse a name that theme.js already declares, such as root or chipSvg.)


// ---------- Section highlighting ----------
// Hovering over (or tabbing to) a part of the CPU lights up the traces
// connected to it and shows a short description of that section.

const units = document.querySelectorAll(".unit");
const wires = document.querySelectorAll("[data-connects]");
const readoutText = document.querySelector(".readout__text");
const contactDetails = document.querySelector(".readout__contact");
const emailHint = document.querySelector(".readout__hint");
const copyStatus = document.querySelector("[role='status']");
const busUnit = document.querySelector(".unit--bus");
const defaultText = readoutText.textContent;
let copiedTimer = null;        // set for a moment after the email is copied

// Each trace gets a copy of itself drawn on top. The copy carries the
// moving dashes ("signals") while the trace is lit.
document.querySelectorAll(".trace").forEach((trace) => {
    const signal = trace.cloneNode();
    signal.setAttribute("class", "signal");
    signal.removeAttribute("data-connects");
    trace.after(signal);
});

function lightTraces(section) {
    wires.forEach((wire) => {
        const connected = wire.dataset.connects.split(" ").includes(section);
        wire.classList.toggle("is-lit", connected);
    });
}

function showText(text) {
    readoutText.textContent = text;
    readoutText.hidden = false;
    contactDetails.hidden = true;
}

function showContact() {
    readoutText.hidden = true;
    contactDetails.hidden = false;
}

function showSection(unit) {
    lightTraces(unit.dataset.section);

    if (unit === busUnit) {
        showContact();
    } else {
        showText(unit.dataset.blurb);
    }
}

// Back to the resting state. Just after the email is copied, keep the
// "copied" message up for a moment so people can see it worked.
function reset() {
    if (copiedTimer) {
        lightTraces("contact");
        showContact();
    } else {
        lightTraces(null);
        showText(defaultText);
    }
}

units.forEach((unit) => {
    unit.addEventListener("pointerenter", () => showSection(unit));
    unit.addEventListener("pointerleave", reset);
    unit.addEventListener("focus", () => showSection(unit));
    unit.addEventListener("blur", reset);
});

// Pressing the browser's back button can restore the page mid-hover.
window.addEventListener("pageshow", reset);


// ---------- Contact: copy the email address ----------
// The address is only written with "[at]" in the HTML, so scrapers don't pick it up.
// The real address is put together here, when someone clicks Contact.

const hintText = matchMedia("(hover: none)").matches ? "Tap Contact to copy" : "Click Contact to copy";
emailHint.textContent = hintText;

busUnit.addEventListener("click", async (event) => {
    event.preventDefault();
    const address = document.querySelector(".email").textContent.replace("[at]", "@");

    // Show the email straight away (needed on phones, where there's no hover)
    lightTraces("contact");
    showContact();

    try {
        await navigator.clipboard.writeText(address);
        emailHint.textContent = "Copied to clipboard";
        copyStatus.textContent = "Email address copied";
    } catch (error) {
        emailHint.textContent = "Couldn't copy, select it instead";
    }

    emailHint.classList.add("is-done");
    showContact();

    // Flash the readout's screen so it's obvious something happened
    const readout = document.querySelector(".readout");
    readout.classList.remove("is-flashing");
    void readout.offsetWidth;            // restarts the flash if Contact is clicked again
    readout.classList.add("is-flashing");

    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
        copiedTimer = null;
        emailHint.textContent = hintText;
        emailHint.classList.remove("is-done");
        copyStatus.textContent = "";

        if (busUnit.matches(":hover, :focus-visible")) {
            showSection(busUnit);
        } else {
            reset();
        }
    }, 2500);
});


// ---------- Zooming into and out of a section ----------
// Clicking a block marked data-zoom (Projects, Work experience, Volunteer experience)
// zooms the chip into it until the screen is solid in that block's colour, then opens
// its page, which starts on the same colour. Coming back plays the same zoom in reverse.

const zoomUnits = document.querySelectorAll(".unit[data-zoom]");
const pageContent = document.getElementById("content");
const zoomCover = document.querySelector(".zoom-cover");
const fadeOnEnter = document.querySelectorAll(".power-switch");   // (theme.js unplugs the wire itself)
const motionOff = matchMedia("(prefers-reduced-motion: reduce)");

function unitFor(section) {
    return document.querySelector(`.unit[data-zoom][data-section="${section}"]`);
}

// Where to scale the page from, and the transform that fills the screen with the block
function zoomOn(unit) {
    const block = unit.querySelector(".unit__body").getBoundingClientRect();
    const box = pageContent.getBoundingClientRect();
    const cx = block.left + block.width / 2;
    const cy = block.top + block.height / 2;

    // Big enough that the block covers the whole screen, centred on the screen
    const scale = Math.max(innerWidth / block.width, innerHeight / block.height) * 1.2;
    const dx = innerWidth / 2 - cx;
    const dy = innerHeight / 2 - cy;

    return {
        origin: `${cx - box.left}px ${cy - box.top}px`,
        zoomed: `translate(${dx}px, ${dy}px) scale(${scale})`,
    };
}

// Show the cover in the block's own colour (green registers, yellow caches)
function showCover(unit) {
    zoomCover.style.setProperty("--cover-color", getComputedStyle(unit.querySelector(".unit__body")).fill);
    zoomCover.classList.add("is-visible");
}

function stopZoomAnimations() {
    [pageContent, zoomCover, ...fadeOnEnter].forEach((element) =>
        element.getAnimations().forEach((animation) => animation.cancel())
    );
}

function zoomInto(unit) {
    // Let theme.js pull the button's wire back before the chip starts moving
    document.dispatchEvent(new CustomEvent("chip-zooming"));

    const { origin, zoomed } = zoomOn(unit);
    pageContent.style.transformOrigin = origin;
    pageContent.style.pointerEvents = "none";

    const zoom = pageContent.animate(
        [{ transform: "none" }, { transform: zoomed }],
        { duration: 900, easing: "cubic-bezier(0.6, 0, 0.85, 0.35)", fill: "forwards" }
    );

    // The push button isn't part of the section pages
    fadeOnEnter.forEach((element) =>
        element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" })
    );

    // Finish on the solid colour ("both" keeps it see-through until the delay passes)
    showCover(unit);
    zoomCover.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, delay: 620, fill: "both" });

    zoom.finished.then(() => {
        try { sessionStorage.setItem("zoom-in", unit.dataset.section); } catch (error) {}
        location.href = unit.getAttribute("href");
    });
}

// The reverse: start on the solid colour, zoomed into the block, and pull back out to the chip
function zoomOutOf(unit) {
    // The wire stays unplugged until the chip is back in place (theme.js)
    document.dispatchEvent(new CustomEvent("chip-zooming"));

    const { origin, zoomed } = zoomOn(unit);
    pageContent.style.transformOrigin = origin;
    showCover(unit);

    const zoom = pageContent.animate(
        [{ transform: zoomed }, { transform: "none" }],
        { duration: 900, easing: "cubic-bezier(0.15, 0.65, 0.4, 1)" }
    );

    zoomCover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: "forwards" });

    fadeOnEnter.forEach((element) =>
        element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 600, fill: "both" })
    );

    zoom.finished.then(() => {
        document.documentElement.classList.remove("is-returning");
        delete document.documentElement.dataset.returning;
        zoomCover.classList.remove("is-visible");
        zoomCover.style.removeProperty("--cover-color");
        stopZoomAnimations();

        // Tell theme.js the chip is back in place, so the button's wire can plug back into it
        document.dispatchEvent(new CustomEvent("chip-settled"));
    });
}

// Which section page did we just leave, if any? (section.js leaves a note on the way out)
function returnTrip() {
    try {
        const trip = JSON.parse(sessionStorage.getItem("zoom-out") || "null");
        sessionStorage.removeItem("zoom-out");
        if (trip && Date.now() - trip.time < 4000 && !motionOff.matches) return trip.section;
    } catch (error) {}
    return null;
}

zoomUnits.forEach((unit) => {
    unit.addEventListener("click", (event) => {
        // Ctrl/Cmd/Shift-clicks (new tab or window) and reduced motion just follow the link
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || motionOff.matches) return;

        event.preventDefault();
        zoomInto(unit);
    });
});

// Opened from a section page: the head script already put the colour up (is-returning)
// and noted which section it was. Wait for the fonts so the chip is measured where it
// will really sit.
const returningTo = unitFor(document.documentElement.dataset.returning);

if (document.documentElement.classList.contains("is-returning")) {
    if (returningTo) {
        Promise.race([document.fonts.ready, new Promise((done) => setTimeout(done, 500))])
            .then(() => zoomOutOf(returningTo));
    } else {
        // A note for a section that doesn't exist: just show the page as normal
        document.documentElement.classList.remove("is-returning");
        document.dispatchEvent(new CustomEvent("chip-settled"));
    }
}

// The back button can bring this page back from the browser's memory, still zoomed in
window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;

    stopZoomAnimations();
    pageContent.style.pointerEvents = "";

    const unit = unitFor(returnTrip());
    if (unit) {
        zoomOutOf(unit);
    } else {
        zoomCover.classList.remove("is-visible");
        document.dispatchEvent(new CustomEvent("chip-settled"));   // plug the wire back in
    }
});


// ---------- The dark mode signal ----------
// theme.js announces when the button's pulse reaches the control unit.

document.addEventListener("signal-received", () => {
    lightTraces("about");
    setTimeout(reset, 900);
});
