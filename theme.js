// The dark mode push button. Shared by every page.
// On the home page the button is wired into the chip: pressing it sends a pulse
// down the wire into the control unit, then the new theme spreads out from there.
// On pages without the chip, the new theme spreads out from the button itself.

const root = document.documentElement;
const themeSwitch = document.querySelector(".power-switch");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

// These only exist on the home page
const chipSvg = document.querySelector(".cpu");
const pad = document.getElementById("wire-pad");
const wire = document.querySelector(".wire");
const wirePulse = document.querySelector(".wire-pulse");
const inputPulse = document.querySelector(".input-pulse");
const controlUnit = document.querySelector(".unit--control .unit__body");
const hasWire = Boolean(chipSvg && pad && wire);

let switching = false;

themeSwitch.setAttribute("aria-pressed", root.dataset.theme === "dark");


// ---------- The wire from the button to the chip ----------
// The button sits in the corner and the chip is centred, so the wire's
// route depends on the screen size. It's redrawn whenever the page resizes.
//
// While the chip zooms into or out of a section (script.js), the wire is unplugged:
// it pulls back into the button, and only plugs back into the chip once the chip has
// settled, so it's never left hanging in the wrong place while the chip moves.

let chipMoving = false;       // the chip is mid-zoom, so measuring it now would be wrong
let wireUnplugged = false;

function drawWire() {
    if (chipMoving) return;

    const page = document.body.getBoundingClientRect();
    const leg = document.getElementById("switch-terminal").getBoundingClientRect();
    const padBox = pad.getBoundingClientRect();
    const nameBox = document.querySelector(".name").getBoundingClientRect();

    // Start under the button's leg, end under the pad on the chip
    const x1 = leg.left + leg.width / 2 - page.left;
    const y1 = leg.top + leg.height * 0.6 - page.top;
    const x2 = padBox.left + padBox.width / 2 - page.left;
    const y2 = padBox.top + padBox.height / 2 - page.top;

    // Run the horizontal stretch through the gap between the name and the chip
    const yMid = Math.max((nameBox.bottom + padBox.top) / 2 - page.top, y1 + 20);

    // Rounded corners, kept small enough to fit the shortest stretch
    const r = Math.max(0, Math.min(12, Math.abs(x1 - x2) / 2, (yMid - y1) / 2, (y2 - yMid) / 2));
    const dir = x2 < x1 ? -1 : 1;

    const d = `M${x1} ${y1} V${yMid - r} Q${x1} ${yMid} ${x1 + dir * r} ${yMid}` +
              ` H${x2 - dir * r} Q${x2} ${yMid} ${x2} ${yMid + r} V${y2}`;

    // Same thickness as the input trace on the chip (5 units in the chip's drawing)
    const width = (5 * chipSvg.getBoundingClientRect().width) / 664;

    wire.setAttribute("d", d);
    wirePulse.setAttribute("d", d);
    wire.style.strokeWidth = width;
    wirePulse.style.strokeWidth = width * 1.5;
}

// Animate how much of the wire is showing, measured from the button end:
// 1 = plugged into the chip, 0 = pulled right back into the button
function slideWire(from, to, duration, easing) {
    const length = wire.getTotalLength();
    wire.getAnimations().forEach((animation) => animation.cancel());

    return wire.animate(
        [
            { strokeDasharray: `${length} ${length}`, strokeDashoffset: length * (1 - from) },
            { strokeDasharray: `${length} ${length}`, strokeDashoffset: length * (1 - to) },
        ],
        { duration: reduceMotion.matches ? 0 : duration, easing, fill: "forwards" }
    );
}

// The chip is about to zoom: pull the wire back into the button, quickly,
// before the chip has moved far
function unplugWire() {
    chipMoving = true;
    if (wireUnplugged) return;

    wireUnplugged = true;
    slideWire(1, 0, 160, "ease-in");
}

// The chip has settled: measure again and run the wire back out into the chip's pad
function plugInWire() {
    chipMoving = false;
    drawWire();

    if (!wireUnplugged) return;
    wireUnplugged = false;

    slideWire(0, 1, 450, "cubic-bezier(0.3, 0, 0.2, 1)").finished.then(() => {
        wire.getAnimations().forEach((animation) => animation.cancel());
    });
}

if (hasWire) {
    new ResizeObserver(drawWire).observe(document.body);
    document.fonts.ready.then(drawWire);

    // script.js announces when the chip starts zooming, and when it's back in place
    document.addEventListener("chip-zooming", unplugWire);
    document.addEventListener("chip-settled", plugInWire);

    // Coming back from a section page, the chip starts zoomed in: start unplugged
    if (root.classList.contains("is-returning")) {
        chipMoving = true;
        wireUnplugged = true;
    }
}


// ---------- Switching theme ----------

function setTheme(theme) {
    root.dataset.theme = theme;
    themeSwitch.setAttribute("aria-pressed", theme === "dark");
    try { localStorage.setItem("theme", theme); } catch (error) {}
}

// Light a path up from its start to its end
function sendPulse(path, duration) {
    // Clear away the last press's pulse first, in case it's still fading out
    path.getAnimations().forEach((animation) => animation.cancel());

    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.opacity = 1;

    return path.animate(
        [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
        { duration, easing: "ease-in", fill: "forwards" }
    ).finished;
}

// Fade a pulse out. The faded-out pulse is left in place rather than tidied up once
// the fade ends: if the button is pressed again mid-fade, a late tidy-up would cancel
// the new press's pulse. sendPulse clears it away when the next press starts instead.
function clearPulse(path) {
    path.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" });
}

// Switch theme with a circle growing out from (x, y), where supported
function revealTheme(theme, x, y) {
    if (!document.startViewTransition || reduceMotion.matches) {
        setTheme(theme);
        return Promise.resolve();
    }

    const transition = document.startViewTransition(() => setTheme(theme));

    transition.ready.then(() => {
        const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 650, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
        );
    }).catch(() => {});

    return transition.finished;
}

function centreOf(element) {
    const box = element.getBoundingClientRect();
    return [box.left + box.width / 2, box.top + box.height / 2];
}

themeSwitch.addEventListener("click", async (event) => {
    if (switching) return;
    switching = true;

    // Keyboard presses don't trigger :active, so show the press here instead
    if (event.detail === 0) {
        themeSwitch.classList.add("is-pressed");
        setTimeout(() => themeSwitch.classList.remove("is-pressed"), 150);
    }

    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";

    // `finally` frees the button up again even if something goes wrong mid-switch,
    // so one error can't leave it stuck and ignoring every press after
    try {
        if (hasWire) {
            if (!reduceMotion.matches) {
                await sendPulse(wirePulse, 380);
                await sendPulse(inputPulse, 140);
            }

            // Tell the chip the control unit has received the signal (script.js lights it up)
            document.dispatchEvent(new CustomEvent("signal-received"));

            await revealTheme(nextTheme, ...centreOf(controlUnit));
            clearPulse(wirePulse);
            clearPulse(inputPulse);
        } else {
            await revealTheme(nextTheme, ...centreOf(themeSwitch));
        }
    } finally {
        switching = false;
    }
});
