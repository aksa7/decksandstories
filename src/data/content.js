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

export const countriesStat = { featured: 28, total: 195 };

export const countries = [
  { name: "Lithuania", flag: "🇱🇹", iso2: "LT" },
  { name: "USA", flag: "🇺🇸", iso2: "US" },
  { name: "Zimbabwe", flag: "🇿🇼", iso2: "ZW" },
  { name: "Italy", flag: "🇮🇹", iso2: "IT" },
  { name: "France", flag: "🇫🇷", iso2: "FR" },
  { name: "Canada", flag: "🇨🇦", iso2: "CA" },
  { name: "Brazil", flag: "🇧🇷", iso2: "BR" },
  { name: "Mexico", flag: "🇲🇽", iso2: "MX" },
  { name: "Sweden", flag: "🇸🇪", iso2: "SE" },
  { name: "Denmark", flag: "🇩🇰", iso2: "DK" },
  { name: "Netherlands", flag: "🇳🇱", iso2: "NL" },
  { name: "Germany", flag: "🇩🇪", iso2: "DE" },
  { name: "Greece", flag: "🇬🇷", iso2: "GR" },
  { name: "Morocco", flag: "🇲🇦", iso2: "MA" },
  { name: "Syria", flag: "🇸🇾", iso2: "SY" },
  { name: "England", flag: "🇬🇧", iso2: "GB" },
  { name: "Nigeria", flag: "🇳🇬", iso2: "NG" },
  { name: "Spain", flag: "🇪🇸", iso2: "ES" },
  { name: "Israel", flag: "🇮🇱", iso2: "IL" },
  { name: "Turkey", flag: "🇹🇷", iso2: "TR" },
  { name: "Pakistan", flag: "🇵🇰", iso2: "PK" },
  { name: "Lebanon", flag: "🇱🇧", iso2: "LB" },
  { name: "Argentina", flag: "🇦🇷", iso2: "AR" },
  { name: "Georgia", flag: "🇬🇪", iso2: "GE" },
  { name: "Belgium", flag: "🇧🇪", iso2: "BE" },
  { name: "Taiwan", flag: "🇹🇼", iso2: "TW" },
  { name: "South Africa", flag: "🇿🇦", iso2: "ZA" },
  { name: "Tunisia", flag: "🇹🇳", iso2: "TN" },
];

// Episodes: full DJ-mix episodes. thumb = YouTube thumbnail (swapped to a
// local optimized facade thumb in F6).
export const episodes = [
  { title: "MALIKETH", genre: "Schranz / Hardcore", number: 72, ytId: "cOiLrjFn4ak", text: "MALIKETH brings a relentless, high-powered Schranz and hardcore mix built for raw intensity and pure dancefloor energy." },
  { title: "MABERO", genre: "Deep House / Soulful / Afro House", number: 71, ytId: "Od-InSY8vRM", text: "DJ MABERO delivers soulful, uplifting house built on rhythm, warmth and pure connection." },
  { title: "LIL BOO", genre: "Deep House / Afro House", number: 70, ytId: "cmfvOi8Po0E", text: "Every performance is built around human connection - blending deep grooves with powerful energy behind the decks." },
  { title: "PLAYHOUSE", genre: "Deep House / Afro House", number: 69, ytId: "XipxxnANzPw", text: "Play House bridges raw minimalist deep house with intense afro and latin rhythms, focusing on direct sonic connection over commercial fluff." },
  { title: "MATERIUM", genre: "Melodic Techno / Indie Dance", number: 68, ytId: "pYmWIkTUFa0", text: "Materium is the union of Eli Dante and Franz Naya, a couple whose shared passion for electronic music evolved into a creative partnership." },
  { title: "ANTO909", genre: "Minimal / Techno", number: 67, ytId: "JLx1DEkDBFc", text: "What started as a childhood passion eventually evolved into DJing and music production, giving him an outlet to share his perspective through rhythm and groove." },
];

// Studio Sessions: in-studio sets recorded in Kaunas.
export const sessions = [
  { title: "Izxrrxx", genre: "Industrial Hardcore", number: 75, ytId: "uNdVgCILYMk", text: "Industrial hardcore, hardgroove, schranz and trance with a raw emotional core - intensity, movement and uncompromising energy." },
  { title: "Balandmenas", genre: "House & Disco", number: 74, ytId: "0AshTruBrQ4", text: "House, groove and harder sounds with a feel-good pulse - a set built around energy, emotion and making people move." },
  { title: "Shimva", genre: "Electronic", number: 73, ytId: "d4HiY7aYT_Y", text: "Energetic, dynamic sets built around feeling rather than genre - moving through different shades of electronic music." },
  { title: "Eitutis", genre: "House / Trance", number: 72, ytId: "49Ofs8lWuUs", text: "A tribute to early 2000s house and trance - filled with warm, familiar sounds and timeless energy." },
  { title: "Fand", genre: "Trance / Hard House", number: 71, ytId: "tELowRwyWI0", text: "Happy trance, groovy hard house, and indie dance - music as an invitation to simply feel it, dance it, and stay with FAND." },
  { title: "Ambroza", genre: "House", number: 70, ytId: "cp-6zavN7Dc", text: "Guided by instinct rather than genre - sets that feel honest and personal, built from tracks worth sharing." },
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
