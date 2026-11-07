// The projects on projects.html. Each one is a "memory slot" that gets loaded into
// the registers. To add a project, copy one of the blocks below and change the values.
// The order here is the order of the memory slots.
//
// Anything in [square brackets] is a placeholder: it shows up greyed out on the page
// so it's easy to spot. Replace it with your own words.
//
// Where each value appears:
//   repo        -> Address register (link to the code). Use null if there's no public repo.
//   status      -> Program counter: "finished" or "in-progress"
//   statusNote  -> Program counter: one line about where the project is at
//   next        -> Program counter: where it's going next (leave out for finished projects)
//   build       -> Instruction register: one command or step per line
//   buildNote   -> Instruction register: what you need installed
//   role        -> R1     stack      -> R2     features   -> R3
//   highlights  -> R4     challenges / learned -> R5     results -> R6
//
// Optional, for the LCD screen below the registers (it's hidden if a project has neither):
//   media       -> screenshots or GIFs, each { src: "media/...", alt: "what it shows" }
//   pixelArt    -> true keeps low-resolution pixel art sharp when it's scaled up
//   screen      -> the screen's shape, e.g. "1 / 1" for square art (default "4 / 3")
//   play        -> a link to play it, e.g. an itch.io page (shown under the screen)

const PROJECTS = [
    {
        id: "mini-version-control",        // used in the page address: projects.html#mini-version-control
        name: "C++ Mini Version Control",
        repo: "https://github.com/Sam-Horner-42/CPPMiniVersionControl",

        status: "in-progress",
        statusNote: "A Git-like version control engine with a Qt desktop app.",
        next: "After school I would like to continue this project to add branching and a local installer via a .msi file.",

        build: [
            "git clone https://github.com/Sam-Horner-42/CPPMiniVersionControl.git",
            "cd CPPMiniVersionControl",
            "mkdir build && cd build",
            "cmake ..",
            "cmake --build .",
        ],
        buildNote: "Needs a C++17 compiler, Qt 5.15+ or Qt 6, and CMake 3.16+. It also opens in Qt Creator through the .pro file.",

        role: "One of five contributors, and the most active by commits. The QT interface was designed by me and I authored code for over 80% of files.",

        stack: {
            languages: ["C++17"],
            frameworks: ["Qt 6 / Qt 5.15 (Qt Widgets)"],
            tools: ["CMake", "qmake", "Qt Creator", "Git"],
        },

        features: [
            "Start version tracking in any local folder",
            "Stage files and commit snapshots with messages, authors and timestamps",
            "Line-by-line diffs of changes against earlier snapshots",
            "Browse the commit history in a Qt desktop app",
        ],

        highlights: [
            "Version control engine kept separate from the Qt interface, split into repository, hashing and diff modules",
            "File hashing to detect changes, check file integrity and build snapshot trees",
            "Builds with either CMake or qmake, on GCC, Clang or MSVC",
        ],

        challenges: ["Many merge conflicts, discovered CodeTogether on VisualStudio which saved us more than once."],
        learned: ["Commit often and have a good and agreed upon structure before you start coding, it will save you in the long run!"],

        results: [
            { value: "147", label: "commits" },
            { value: "44", label: "commits by me" },
            { value: "5", label: "contributors" },
            { value: "6 mo", label: "Mar to Sep 2026" },
        ],

        media: [
            {src: "media/cppminivcs/MiniVCSDemo.gif", alt: "Short gif showing basic functionality of the project"},
            { src: "media/cppminivcs/shot-1.png", alt: "Welcome screen listing the authors, with buttons to create or open a repository" },
            { src: "media/cppminivcs/shot-2.png", alt: "Dialog for starting a new repository from a file path and a name" },
            { src: "media/cppminivcs/shot-3.png", alt: "Main window with a newly added file, ready to stage and commit" },
            { src: "media/cppminivcs/shot-4.png", alt: "History tab showing the first commit, with a Restore button" },
            { src: "media/cppminivcs/shot-5.png", alt: "Diff tab showing one line added to the test file" },
            { src: "media/cppminivcs/shot-6.png", alt: "History tab with two commits" },
            { src: "media/cppminivcs/shot-7.png", alt: "Analytics tab with total commits, tracked files and edits per file" },
            { src: "media/cppminivcs/shot-8.png", alt: "Picking an existing repository to open" },
        ],
    },

    {
        id: "risky-dice-roller",
        name: "Cookie Conquest",
        repo: "https://github.com/Sam-Horner-42/DiceRoller",

        status: "finished",
        statusNote: "My first game jam entry, built in Java. Brackey's Game Jam 2025.2 Theme: RISK IT for the BISCUIT. Submitted 2 hours, 37 minutes before the deadline",

        build: [
            "Travel to: https://fabe-da-babe.itch.io/cookie-conquest",
            "Download CC4.zip",
            "Extract CC4.zip to somewhere on your computer.",
            "Run CookieConquest.exe",
        ],
        buildNote: "Needs a Java JDK. On Windows, use bin;src instead of bin:src.",

        role: "Main contributor, with 176 of the commits, working with two teammates. I was responsible for defining the level data, and coding the item and dice logic and then debugging the link between the backend and frontend.",

        stack: {
            languages: ["Java"],
            frameworks: ["Swing", "Java Sound API"],
            tools: ["VS Code", "Git"],
        },

        features: [
            "Roll dice to clear levels on a level map",
            "Starter dice and items at the beginning of a run",
            "Items including the Golden Egg, Chocolate Coin, Milk, Whisk and a Slot Machine",
            "Sound effects for dice rolls, level wins and failed levels",
        ],

        highlights: [
            "Model-View-Controller structure: a Model, a Swing view and a Controller, wired together in Driver",
            "Custom Swing panels with mouse listeners for dice, items and levels",
            "Images, a custom font and sounds loaded as classpath resources",
        ],

        challenges: ["The logic, using Java Swing was a mistake in hindsight. My partner for the jam had just finished learning it in school and neither of us knew a game engine."],
        learned: ["How hard it is to code game logic from scratch. How much fun it is to code game logic from scratch. The true importance of abstract classes."],

        results: [
            { value: "234", label: "commits" },
            { value: "8 days", label: "first to last commit" },
            { value: "2", label: "contributors" },
            { value: "August 31st 2025 at 6:00 AM", label: "jam deadline" },
        ],

        media: [
            { src: "media/cookie-conquest/CookieConquestDemo.gif", alt: "A demo gif of the cookie conquest game" },
            { src: "media/cookie-conquest/shot-1.png", alt: "The kingdom map: a continent of sweets with every cookie kingdom still locked" },
            { src: "media/cookie-conquest/shot-2.png", alt: "Rolling for the kingdom of Orlandough, which needs a roll between 3 and 9" },
            { src: "media/cookie-conquest/shot-3.png", alt: "The win screen after conquering every kingdom on the continent" },
        ],
    },

    {
        id: "employee-management-system",
        name: "Employee Management System",
        repo: "https://github.com/Sam-Horner-42/EmployeeManagementSystem",

        status: "finished",
        statusNote: "Handed in as Lab 5 for CST8219",

        build: [
            "git clone https://github.com/Sam-Horner-42/EmployeeManagementSystem.git",
            "cd EmployeeManagementSystem",
            "cmake -S . -B build",
            "cmake --build build",
        ],
        buildNote: "Needs CMake 3.10+ and a C++20 compiler. CMake presets are included as well.",

        role: "Solo project: I wrote every class.",

        stack: {
            languages: ["C++20"],
            frameworks: ["Standard library only"],
            tools: ["CMake", "Git"],
        },

        features: [
            "Salaried, hourly and commission employee types",
            "A payroll manager that handles every type of employee together",
        ],

        highlights: [
            "Each employee type derives from a shared Employee base class",
            "Virtual functions and runtime polymorphism through base-class pointers",
            "Smart pointers for safe memory management",
        ],

        challenges: ["Dealing with edge cases when a user inputs Employee information was challenging. The function clearInput() while simplistic saved me a lot of time."],
        learned: ["How to manage derived classes via a single Abstract class, input validation and the rule of 5."],

        results: [
            { value: "9", label: "commits" },
            { value: "3 weeks", label: "22 Mar to 13 Apr 2026" },
            { value: "1 day", label: "early for the deadline" },
            { value: "3", label: "employee types" },
        ],
    },

    {
        id: "blasteroids",
        name: "Blasteroids",
        repo: "https://github.com/Sam-Horner-42/pico-8",
        play: "https://skwidge.itch.io/blasteroids",

        status: "finished",
        statusNote: "A galaga-style shoot 'em up, released on itch.io where you can play it in the browser.",

        build: [
            "git clone https://github.com/Sam-Horner-42/pico-8.git",
            "Open PICO-8 and drag in carts/blasteroids/firstgame.p8",
            "Press Ctrl+R to run the cart",
        ],
        buildNote: "Needs PICO-8. The cart pulls in its .lua files with #include, so keep them in the same folder.",

        role: "Solo project, made for fun over a handful of months. All the sprites, sound effects and music were made by me by hand without AI.",

        stack: {
            languages: ["Lua"],
            frameworks: ["PICO-8"],
            tools: ["PICO-8 sprite and sound editors", "Git"],
        },

        features: [
            "Endless: destroy asteroids and chase a high score",
            "Twin blasters, rockets on Z and a timed laser weapon",
            "Pickups for shields, extra rockets, health and 500-point coins",
            "Warnings before an asteroid field arrives",
            "Title, game over and restart screens",
        ],

        highlights: [
            "Code split into Lua modules for the player, enemies, pickups and weapons, pulled into the cart with #include",
            "Enemies run on a small state machine (alive, hit, exploded) and can drop pickups",
            "Sprite outlines drawn by remapping the palette and drawing each sprite four times",
            "Runs at 60 fps with box and radius collision checks",
        ],

        challenges: ["Pico-8 is designed to be an 8-bit emulator which means only 4 tracks for sound. I had to remove one of the music tracks to fit in the sound effects."],
        learned: ["How hard pixel art is, and how much fun I can have banging my head against the wall until it works how I want."],

        results: [
            { value: "59", label: "commits to the repo" },
            { value: "5 mo", label: "Jun to Dec 2025" },
            { value: "8", label: "Lua modules" },
            { value: "60 fps", label: "game loop" },
        ],

        pixelArt: true,
        screen: "1 / 1",
        media: [
            { src: "media/blasteroids/firstgame_0.gif", alt: "Gif of gameplay"},
            { src: "media/blasteroids/01-title.png", alt: "Blasteroids title screen: press X to start" },
            { src: "media/blasteroids/02-warning.png", alt: "An asteroid field warning as the ship fires its twin blasters" },
            { src: "media/blasteroids/03-score-800.png", alt: "Shooting asteroids at 800 points, with a +100 pop-up" },
            { src: "media/blasteroids/04-score-1000.png", alt: "Asteroids drifting down the screen at 1000 points" },
            { src: "media/blasteroids/05-pickup.png", alt: "A pickup floating past the ship at 1400 points" },
            { src: "media/blasteroids/06-game-over.png", alt: "Game over screen with the final score" }

        ],
    },
];
