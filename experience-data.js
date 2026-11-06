// The roles on work.html and volunteer.html. Each role is one "line" in the page's cache,
// loaded in from memory when the page opens. List them newest first.
//
// Anything in [square brackets] is a placeholder: it shows up greyed out on the page
// so it's easy to spot. Replace it with your own words.
//
//   org        -> the company or organisation's name
//   logo       -> its logo, e.g. "media/logos/bmr.png" (any shape fits the white label)
//   logoScale  -> optional: zooms the logo in if the image has a lot of empty space around it
//   site       -> link to its website
//   role       -> your job title
//   dates      -> when you were there
//   place      -> where
//   about      -> 1-2 sentences on the role and what you gained from it

const WORK = [
    {
        org: "Spiritleaf",
        logo: "media/logos/spiritleaf.png",
        site: "https://spiritleaf.ca/",
        role: "Concierge/Budtender",
        dates: "Feb 2023 – Oct 2026",
        place: "Ottawa, ON",
        about: "Learned about proper regulatory practices regarding legal cannabis sale and consumption. ",
    },
    {
        org: "Tim Hortons",
        logo: "media/logos/tim-hortons.png",
        site: "https://www.timhortons.ca/",
        role: "Counter Staff",
        dates: "Apr 2022 – Feb 2023",
        place: "Ottawa, ON",
        about: "Learned how to operate efficiently and effectively in a fast-pased environment serving 100s of customers per shift.",
    },
    {
        org: "BMR",
        logo: "media/logos/bmr.png",
        site: "https://www.bmr.ca/en/",
        role: "Floor, Garden Centre & Lumberyard Staff",
        dates: "Jul 2015 – Aug 2021",
        place: "Winchester, ON",
        about: "Learned general maintenance skills including plumbing, electrical work, framing and carpentry.",
    },
];

const VOLUNTEER = [
    {
        org: "Connected Canadians",
        logo: "media/logos/connected-canadians.png",
        site: "https://www.connectedcanadians.ca/",
        role: "Front-line Technology Support Volunteer",
        dates: "Dec 2025 – Present",
        place: "Ottawa, ON",
        about: "Gained a deeper understanding of the challenges faced by older adults navigating technology.",
    },
    {
        org: "The Ottawa Mission",
        logo: "media/logos/ottawa-mission.svg",
        site: "https://ottawamission.com/",
        role: "Kitchen Volunteer",
        dates: "Sep 2021 – Present",
        place: "Ottawa, ON",
        about: "Gained more perspective regarding unhoused individuals and a deeper appreciation for what I have.",
    },
];
