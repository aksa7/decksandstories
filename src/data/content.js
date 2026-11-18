// ============================================================
// content.js — single source of truth for all page content.
// Add an episode/session/etc = push one object here.
// Image `base` names map to public/img/<base>-<w>.{avif,webp} (see F1 pipeline).
// ============================================================

export const nav = [
  { href: "submit/", label: "Submit your Mix", external: true },
  { href: "merch/", label: "Merch", external: true },
  { href: "thepuzzle/", label: "The Puzzle", external: true },
];

// Brands / partners shown in the "Who trusts us" strip.
export const trustLogos = [
  { base: "sun365logo", alt: "SUN365", url: "https://www.instagram.com/sun365juices/", w: 341, h: 376 },
  { base: "proeventsLogo", alt: "proevents", url: "https://proevents.lt/", w: 493, h: 81 },
  { base: "teileLogo", alt: "TEILE", url: "https://www.instagram.com/teile.life/", w: 480, h: 418 },
  { base: "runemark", alt: "runemark", url: "https://www.instagram.com/runemarkmusic/", w: 320, h: 320 },
  { base: "whatstheid-logo-bg", alt: "WhatsTheID", url: "https://whatstheid.com/", w: 1700, h: 424, format: "png" },
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
  { title: "DJVLDX", genre: "House / Afro House", number: 90, ytId: "Qu_ECx0iQWs", text: "House and afro house from Hunedoara, Romania - an unexpected start behind the decks that found its own groove." },
  { title: "LOODEWIJK", genre: "House / Deep House", number: 89, ytId: "MRKqIgCX9Eg", text: "Soulful house and deep digging from Utrecht - overlooked '90s records given another chance on the floor." },
  { title: "QUANTICO", genre: "House / Tech House / Indie Dance", number: 88, ytId: "n-O_1MGwNzI", text: "Groovy, melodic house from Kaunas - selections built on connection, with unreleased IDs in the mix." },
  { title: "GREGOOZ", genre: "Disco / House / Soul", number: 87, ytId: "Mf5XDXPjZaM", text: "Disco, soulful house and classics from Paris - groove and memory that keep the floor moving for hours." },
  { title: "BERT BICEP", genre: "UK Garage / House / Tech House", number: 86, ytId: "HtIPsuL1Tls", text: "UK garage energy from Amsterdam - bedroom practice turned into rolling grooves ready for a wider room." },
  { title: "IVESONCE", genre: "Disco / Funk / Soul", number: 85, ytId: "iQ-1HTXzp8c", text: "Disco, funk and soul from Nijmegen - hip-hop roots meeting Kaytranada-inspired blends across genres." },
];

// Studio Sessions: in-studio sets recorded in Kaunas.
export const sessions = [
  { title: "Ąnis", genre: "Deep / Dubby / Minimal", number: 97, ytId: "vbe1FvkZUBs", text: "Deep, dubby and slightly melancholic four-deck layering - a slow-build session he calls Deep Autumn Shenanigans." },
  { title: "aksendo", genre: "Minimal / Groovy House", number: 96, ytId: "Cp7i5hqdhGI", text: "Minimal and underground house with a twist - six CDJs in the room, only the first and sixth allowed." },
  { title: "Mantas T", genre: "Adult Modern Techno", number: 95, ytId: "4GfQCjgT3Wk", text: "Detroit-rooted modern techno from Cologne and Lithuania - constant sound revolt shaped by decades of digging." },
  { title: "Ged Jurga", genre: "New York House / Acid / Breaks", number: 94, ytId: "RWfxp4G7hJM", text: "Chicago grit, New York soul and obscure vinyl heat - warm basslines that slowly loosen the room." },
  { title: "Stein Ego", genre: "Progressive / Tech House", number: 93, ytId: "4vkmuBoxOwE", text: "Progressive and tech house from Vilnius - the first two tracks set the direction, everything after is the story." },
  { title: "Vėjas", genre: "Hardgroove", number: 92, ytId: "PbD0k_qsaM0", text: "Dark, physical hardgroove from a young Lithuanian selector - restless rhythm built as a journey, not a straight line." },
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
