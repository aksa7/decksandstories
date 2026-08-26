// ============================================================
// content.js — single source of truth for all page content.
// Add an episode/session/etc = push one object here.
// Image `base` names map to public/img/<base>-<w>.{avif,webp} (see F1 pipeline).
// ============================================================

export const nav = [
  { href: "#about", label: "About" },
  { href: "#episodes", label: "Episodes" },
  { href: "#studio", label: "Studio Sessions" },
  { href: "#pick-question", label: "Pick a Question" },
  { href: "#gallery", label: "Gallery" },
  { href: "submit/", label: "Submit", external: true },
];

// Brands / partners shown in the "Who trusts us" strip.
export const trustLogos = [
  { base: "sun365logo", alt: "SUN365", url: "https://www.instagram.com/sun365juices/", w: 341, h: 376 },
  { base: "proeventsLogo", alt: "proevents", url: "https://proevents.lt/", w: 493, h: 81 },
  { base: "teileLogo", alt: "TEILE", url: "https://www.instagram.com/teile.life/", w: 480, h: 418 },
  { base: "beskarLogo", alt: "beskar", url: "https://www.instagram.com/beskarbookings/", w: 1200, h: 400 },
  { base: "runemark", alt: "runemark", url: "https://www.instagram.com/runemarkmusic/", w: 320, h: 320 },
];

export const countries = [
  { name: "USA", flag: "🇺🇸", iso2: "US", artists: ["DJ Rees"] },
  { name: "Zimbabwe", flag: "🇿🇼", iso2: "ZW", artists: ["Jay"] },
  { name: "Italy", flag: "🇮🇹", iso2: "IT", artists: ["Vincenzo Facino"] },
  { name: "Lithuania", flag: "🇱🇹", iso2: "LT", artists: ["Herma"] },
  { name: "Denmark", flag: "🇩🇰", iso2: "DK", artists: ["Rigbass"] },
  { name: "Netherlands", flag: "🇳🇱", iso2: "NL", artists: ["Bassbrewer"] },
  { name: "Germany", flag: "🇩🇪", iso2: "DE", artists: ["Mzungu Music"] },
  { name: "Mexico", flag: "🇲🇽", iso2: "MX", artists: ["Raffa Miller"] },
  { name: "France", flag: "🇫🇷", iso2: "FR", artists: ["Milo"] },
  { name: "Greece", flag: "🇬🇷", iso2: "GR", artists: ["Azem"] },
  { name: "Morocco", flag: "🇲🇦", iso2: "MA", artists: ["Mixxo"] },
  { name: "Canada", flag: "🇨🇦", iso2: "CA", artists: ["Cody Garth"] },
  { name: "Sweden", flag: "🇸🇪", iso2: "SE", artists: ["Raj El Rey"] },
  { name: "Brazil", flag: "🇧🇷", iso2: "BR", artists: ["Tainara Bunn"] },
  { name: "Syria", flag: "🇸🇾", iso2: "SY", artists: ["Richi"] },
  { name: "England", flag: "🏴", iso2: "GB", artists: ["Psyberfunk"] },
  { name: "Nigeria", flag: "🇳🇬", iso2: "NG", artists: ["Pizzle"] },
  { name: "Spain", flag: "🇪🇸", iso2: "ES", artists: ["Enry Castelo"] },
  { name: "Israel", flag: "🇮🇱", iso2: "IL", artists: ["Niva"] },
  { name: "Turkey", flag: "🇹🇷", iso2: "TR", artists: ["Ldrk"] },
  { name: "Pakistan", flag: "🇵🇰", iso2: "PK", artists: ["Raffay"] },
  { name: "Lebanon", flag: "🇱🇧", iso2: "LB", artists: ["James"] },
  { name: "Belgium", flag: "🇧🇪", iso2: "BE", artists: ["Kevin Major K"] },
  { name: "Argentina", flag: "🇦🇷", iso2: "AR", artists: ["Sebastian Blanco"] },
  { name: "Georgia", flag: "🇬🇪", iso2: "GE", artists: ["Anto9o9"] },
  { name: "Taiwan", flag: "🇹🇼", iso2: "TW", artists: ["Krisas"] },
  { name: "Tunisia", flag: "🇹🇳", iso2: "TN", artists: ["Playhouse"] },
  { name: "South Africa", flag: "🇿🇦", iso2: "ZA", artists: ["Dj Mabero"] },
  { name: "Norway", flag: "🇳🇴", iso2: "NO", artists: ["Cr0w4y"] },
  { name: "Austria", flag: "🇦🇹", iso2: "AT", artists: ["Nikø Nøx"] },
  { name: "Venezuela", flag: "🇻🇪", iso2: "VE", artists: ["Izxrrxx"] },
];

export const countriesStat = { featured: countries.length, total: 195 };

// Episodes: full DJ-mix episodes. thumb = YouTube thumbnail (swapped to a
// local optimized facade thumb in F6).
export const episodes = [
  { title: "NUIT BLANCHE", genre: "Hard Techno", number: 78, ytId: "Aefbm9BLmds", text: "Dark, raw hard techno from Paris — high-energy underground rhythms built to take over the room." },
  { title: "CR0W4Y", genre: "Progressive / Indie House", number: 77, ytId: "a_00qO7WGjI", text: "Raw progressive and indie house from Norway — underground grooves with deep atmosphere and real drive." },
  { title: "Nikø Nøx", genre: "Peak-Time / Hard Techno", number: 76, ytId: "uvTwCcGTdIU", text: "Relentless peak-time and hard techno from Vienna — raw energy built straight for the dancefloor." },
  { title: "JPSC", genre: "House / Trance", number: 75, ytId: "ZA0CM7Hmx-U", text: "High-energy house and trance at 130–135 BPM — driving grooves with melodic, euphoric builds." },
  { title: "AURELIJANO", genre: "Melodic Techno / Progressive House", number: 74, ytId: "KN5tW1YNhpE", text: "Immersive melodic techno and progressive house — atmospheric storytelling that lands in the heart." },
  { title: "TRAYSIEE", genre: "Electronic / Progressive House", number: 73, ytId: "rIYYC7oHM0U", text: "Warm progressive and deep house from Vilnius — patient digging and a journey built on real connection." },
];

// Studio Sessions: in-studio sets recorded in Kaunas.
export const sessions = [
  { title: "Boy From Suburbs", genre: "Organic / Hypnotic", number: 84, ytId: "xwyaBcyROGg", text: "Organic, hypnotic electronics meet Afro house energy — grooves built for the club and the sunrise." },
  { title: "Kdun Albaz", genre: "Organic Afro / Melodic Techno", number: 83, ytId: "VEe9dQvlBAM", text: "Organic Afro house and melodic techno with a warm hypnotic pulse — deep grooves and open feeling." },
  { title: "Martin Pleašes B2B Eldar", genre: "Groovy House", number: 82, ytId: "BuyU5AOh4C8", text: "Upbeat B2B house with groovy basslines and playful twists — energy that lifts the room track by track." },
  { title: "Cats House", genre: "Melodic Techno / Progressive", number: 81, ytId: "01EthOkb8hA", text: "Melodic techno and progressive house with cinematic depth — hypnotic grooves and emotional tension." },
  { title: "Topuma", genre: "Groove Driven House", number: 80, ytId: "ltucCQZumqE", text: "Groove-driven house with rhythm and growing confidence — a second studio chapter led by instinct." },
  { title: "Agnnn", genre: "House / Electronic", number: 79, ytId: "cW1hsb7jY1Y", text: "Warm house grooves and memorable melodies — a personal set shaped by connection, movement and love." },
];

// Pick a Question: Instagram community-answer clips.
export const pickAQuestion = [
  { title: "VILBØ", base: "pickaquestionas", url: "https://www.instagram.com/p/DZkgTdsOmk9/", text: "He is bringing his open energy, honest answers, and a few unexpected stories into the game. A familiar face, which we get to know better even more!" },
  { title: "Krisas", base: "pickaquestionas", url: "https://www.instagram.com/p/DZcyTMXOT7q/", text: "A DJ with an instinctive, elegant club language, creating warm tension, bright peaks, and immersive turns that pull you into his world right away." },
  { title: "Profesorius", base: "pickaquestionas", url: "https://www.instagram.com/p/DZKwJFsOTUq/", text: "Known for his groove-driven sound, emotional touch, and ability to create a journey that keeps people locked in from the first track to the last." },
  { title: "Auremas", base: "pickaquestionas", url: "https://www.instagram.com/p/DYUrgNpOeiU/", text: "He is known for his uplifting house selections, bright energy behind the decks, and ability to turn every set into a feel-good experience." },
  { title: "Garino", base: "pickaquestionas", url: "https://www.instagram.com/p/DXHcN_YET1R/", text: "A Vilnius-based artist whose sound moves between raw grooves, analog textures, and personal moods shaped by everyday life." },
  { title: "Judoc", base: "pickaquestionas", url: "https://www.instagram.com/p/DW_RhtCDvVY/", text: "Dutch electronic music selector who shaped his sound from late '90s vinyl beginnings to stages like Danceboulevard." },
];

// Gallery: local optimized images. `widths` lists which srcset variants exist.
export const gallery = [
  { base: "kultura", w: 800, h: 1067, widths: [480, 800, 1200], alt: "Decks&Stories event photo" },
  { base: "decksandstoriesAndBeskarBookings", w: 800, h: 1067, widths: [480, 800], alt: "Decks&Stories × beskar bookings" },
  { base: "teamPhoto", w: 1200, h: 800, widths: [480, 800, 1200], alt: "Decks&Stories team photo at TEILE" },
  { base: "vancoAksendo", w: 1200, h: 800, widths: [480, 800, 1200], alt: "AKSENDO & VANCO at ADE 2025" },
  { base: "IMG_7775", w: 1200, h: 800, widths: [480, 800, 1200], alt: "ADE 2025 photo" },
  { base: "IMG_7778", w: 1200, h: 800, widths: [480, 800, 1200], alt: "ADE 2025 photo" },
  { base: "vilboUnfazed", w: 1200, h: 800, widths: [480, 800, 1200], alt: "VILBØ x unfazed in Madrid" },
  { base: "decksAdamTen", w: 1200, h: 800, widths: [480, 800, 1200], alt: "VILBØ, H€rm4 with Adam Ten in Madrid" },
  { base: "vilboDJKay", w: 1200, h: 800, widths: [480, 800, 1200], alt: "VILBØ with DJ Kay at ADE 2025" },
  { base: "messagetotheWorld", w: 1200, h: 800, widths: [480, 800, 1200], alt: "Decks&Stories interview moment: message to the people" },
  { base: "dcks", w: 1200, h: 800, widths: [480, 800], alt: "Decks&Stories Sunday Sessions moment" },
  { base: "dcksbatai", w: 1200, h: 800, widths: [480, 800, 1200], alt: "Utopija x Decks&Stories photo" },
];

export const socials = [
  { base: "fbLogo_500x500", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61575745327452", w: 480, h: 480 },
  { base: "instagram_500x500", label: "Instagram", url: "https://www.instagram.com/decksandstories/", w: 480, h: 480 },
  { base: "buymeacoffee_500x500", label: "Buy Me a Coffee", url: "https://buymeacoffee.com/decksandstories", w: 480, h: 480 },
  { base: "youtube_500x500", label: "YouTube", url: "https://www.youtube.com/@decksandstories", w: 480, h: 480 },
];
