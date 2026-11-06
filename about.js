// The about page. Once the page opens (or the zoom lands), the control unit "decodes"
// the paragraph, writing it in a sentence at a time.
// The paragraph itself is in about.html.

const controlUnit = document.querySelector(".control-unit");
const aboutText = document.querySelector(".about__text");
const motionOff = matchMedia("(prefers-reduced-motion: reduce)");

// Wrap each sentence in a span so they can be written in one after another.
// (Skipped if the paragraph has links or other tags in it, so nothing gets lost.)
function splitSentences() {
    if (aboutText.children.length > 0) return;

    let endOfSentence;
    try {
        endOfSentence = new RegExp("(?<=[.!?])\\s+(?=[A-Z])");
    } catch (error) {
        return;                       // very old browsers just show the paragraph as it is
    }

    const sentences = aboutText.textContent.trim().split(endOfSentence);
    aboutText.replaceChildren();

    sentences.forEach((sentence, index) => {
        const span = document.createElement("span");
        span.className = "about__sentence";
        span.style.setProperty("--i", index);
        span.textContent = sentence;
        if (index > 0) aboutText.append(" ");
        aboutText.append(span);
    });
}

function writeIn() {
    if (motionOff.matches) return;
    controlUnit.classList.add("is-writing");
}

splitSentences();

// Arriving with the zoom (section.js): write it in once the colour has shrunk away
if (document.documentElement.classList.contains("is-entering")) {
    document.addEventListener("zoom-arrived", writeIn, { once: true });
} else {
    writeIn();
}
