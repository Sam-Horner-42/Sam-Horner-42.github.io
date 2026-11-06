// Shared by the section pages (projects, work and volunteer): a helper for writing text
// with placeholders, and the zoom in from the home page and back out again.
//
// Each page sets:
//   <body data-section="...">   which block on the chip it belongs to
//   data-zoom-target            what the colour shrinks onto when you arrive
//   data-zoom-fallback          used instead when the target starts off screen (phones)


// ---------- Writing text ----------

// Put text into an element. Parts in [square brackets] are placeholders, so they
// get greyed out to show they still need filling in.
function writeText(element, text = "") {
    element.replaceChildren();

    String(text).split(/(\[[^\]]*\])/).forEach((part) => {
        if (!part) return;

        if (part.startsWith("[")) {
            const placeholder = document.createElement("span");
            placeholder.className = "placeholder";
            placeholder.textContent = part;
            element.append(placeholder);
        } else {
            element.append(part);
        }
    });
}


// ---------- Zooming in from (and back out to) the home page ----------
// Arriving: the screen starts solid in the block's colour (where the zoom on the home page
// ended) and shrinks down onto the page's contents. The page's own script hears
// "zoom-arrived" and plays its loading animation.
// Leaving through Home: the same thing backwards, then the home page zooms back out.
//
// (Wrapped in { } so these names stay private and can't clash with the page's own script.)

{
    const page = document.documentElement;
    const section = document.body.dataset.section;
    const cover = document.querySelector(".zoom-cover");
    const homeLink = document.querySelector(".social--home");
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const FULL_SCREEN = "inset(0px 0px 0px 0px round 0px)";

    // The target's outline on screen, as a clip-path
    function outline() {
        const target = document.querySelector("[data-zoom-target]");
        const fallback = document.querySelector("[data-zoom-fallback]") || target;
        let box = target.getBoundingClientRect();
        if (box.top > innerHeight * 0.75) box = fallback.getBoundingClientRect();

        // Only the part that's on screen
        const top = Math.max(0, box.top);
        const left = Math.max(0, box.left);
        const right = Math.max(0, innerWidth - box.right);
        const bottom = Math.max(0, innerHeight - Math.min(innerHeight, box.bottom));

        return `inset(${top}px ${right}px ${bottom}px ${left}px round 6px)`;
    }

    function arrive() {
        cover.classList.add("is-visible");

        const shrink = cover.animate(
            [{ clipPath: FULL_SCREEN }, { clipPath: outline() }],
            { duration: 700, easing: "cubic-bezier(0.3, 0, 0.2, 1)", fill: "forwards" }
        );

        shrink.finished.then(() => {
            document.dispatchEvent(new CustomEvent("zoom-arrived"));

            cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "forwards" })
                .finished.then(() => {
                    cover.classList.remove("is-visible");
                    page.classList.remove("is-entering");
                    cover.getAnimations().forEach((animation) => animation.cancel());
                });
        });
    }

    // Leave a note for the home page, so it knows which block to zoom back out of
    function markReturnTrip() {
        try {
            sessionStorage.setItem("zoom-out", JSON.stringify({ section, time: Date.now() }));
        } catch (error) {}
    }

    function leave(url) {
        document.dispatchEvent(new CustomEvent("zoom-leaving"));
        cover.classList.add("is-visible");

        const start = outline();
        const grow = cover.animate(
            [
                { opacity: 0, clipPath: start, easing: "ease-out" },
                { opacity: 1, clipPath: start, offset: 0.25, easing: "cubic-bezier(0.6, 0, 0.85, 0.35)" },
                { opacity: 1, clipPath: FULL_SCREEN },
            ],
            { duration: 850, fill: "forwards" }
        );

        grow.finished.then(() => {
            markReturnTrip();
            location.href = url;
        });
    }

    homeLink.addEventListener("click", (event) => {
        // Ctrl/Cmd/Shift-clicks (new tab or window) and reduced motion just follow the link
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || reduceMotion.matches) return;

        event.preventDefault();
        leave(homeLink.getAttribute("href"));
    });

    // The browser's back button can't be animated on the way out, but leaving the note
    // lets the home page still zoom back out to the chip when it appears.
    window.addEventListener("pagehide", markReturnTrip);

    // Coming back to this page with the back button after leaving: open it up again
    window.addEventListener("pageshow", (event) => {
        if (!event.persisted || !cover.classList.contains("is-visible")) return;

        cover.getAnimations().forEach((animation) => animation.cancel());
        arrive();
    });

    // Arriving from the home page: wait for the fonts so the target is measured where it
    // will really be (the head script already put the colour up with is-entering)
    if (page.classList.contains("is-entering")) {
        Promise.race([document.fonts.ready, new Promise((done) => setTimeout(done, 600))]).then(arrive);
    }
}
