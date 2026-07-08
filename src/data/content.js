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
  { base: "sun365logo", alt: "SUN365", url: "https://www.instagram.com/sun365juices/" },
  { base: "cult_300x300", alt: "CULT", url: "https://www.instagram.com/cult_lt/" },
  { base: "teileLogo", alt: "TEILE", url: "https://www.instagram.com/teile.life/" },
  { base: "beskarLogo", alt: "beskar", url: "https://www.instagram.com/beskarbookings/" },
  { base: "runemark", alt: "runemark", url: "https://www.instagram.com/runemarkmusic/" },
];

export const countriesStat = { featured: 26, total: 195 };

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
];

// Episodes: full DJ-mix episodes. thumb = YouTube thumbnail (swapped to a
// local optimized facade thumb in F6).
export const episodes = [
  { title: "MATERIUM", number: 68, ytId: "pYmWIkTUFa0", text: "Materium is the union of Eli Dante and Franz Naya, a couple whose shared passion for electronic music evolved into a creative partnership." },
  { title: "ANTO909", number: 67, ytId: "JLx1DEkDBFc", text: "What started as a childhood passion eventually evolved into DJing and music production, giving him an outlet to share his perspective through rhythm and groove." },
  { title: "SEBASTIAN BLANCO", number: 66, ytId: "gVrqrsQn73I", text: "He doesn’t try to tell people what to feel. He simply plays what feels right in the moment and lets everything unfold naturally." },
  { title: "JuanPE", number: 65, ytId: "1mhmr6pW93c", text: "Moving between deep grooves, hypnotic atmospheres, and perfectly timed melodic moments, his sets evolve slowly, giving the dancefloor space to breathe." },
  { title: "TOMNOISE", number: 64, ytId: "dBaTPnSDvxM", text: "Born in Poland and now based in Germany, he’s developed a sound shaped by deep afterhours sessions and hypnotic underground culture." },
  { title: "BALANDMENAS", number: 63, ytId: "Cc76n7vGXAY", text: "His sets are driven by groove, emotion, and the instinct to give everything back to the people in front of him." },
];

// Studio Sessions: in-studio sets recorded in Kaunas.
export const sessions = [
  { title: "Krisas", number: 69, ytId: "_1XBZdIJdoQ", text: "His sound moves through trance, progressive, tech house, and acid, balancing euphoric energy with hypnotic flow." },
  { title: "Profesorius", number: 68, ytId: "KYu_41dKqk0", text: "Profesorius is a producer and DJ driven by groove, rhythm, and the desire to create memorable moments through music." },
  { title: "VILBØ", number: 67, ytId: "giPVUShUgyI", text: "VILBØ is the person that every Studio Sessions guest has met, but this time, it's his turn to step behind the decks and share his story through music." },
  { title: "Alaburda", number: 66, ytId: "WZ52JwmNLj0", text: "From school dances to clubs and venues like Auditorija, Elastica, Opium, and cornèrcafe, his journey has been shaped by years behind the decks." },
  { title: "Domeika", number: 65, ytId: "PIxQ41b1Rbw", text: "Guided fully by instinct, his sets move through whatever feels right in the moment, creating journeys that feel personal and alive." },
  { title: "Auremas", number: 64, ytId: "9euVCRQ2J4g", text: "Auremas is a name already well recognized in the nightlife scene — a house music enthusiast, and someone who naturally brings positive energy wherever he plays." },
];

// Pick a Question: Instagram community-answer clips.
export const pickAQuestion = [
  { title: "VILBØ", base: "pickaquestionas", url: "https://www.instagram.com/p/DZkgTdsOmk9/", text: "He is bringing his open energy, honest answers, and a few unexpected stories into the game. A familiar face, which we get to know better even more!" },
  { title: "Krisas", base: "pickaquestionas", url: "https://www.instagram.com/p/DZcyTMXOT7q/", text: "A DJ with an instinctive, elegant club language, creating warm tension, bright peaks, and immersive turns that pull you into his world right away." },
  { title: "Profesorius", base: "pickaquestionas", url: "https://www.instagram.com/p/DZKwJFsOTUq/", text: "Known for his groove-driven sound, emotional touch, and ability to create a journey that keeps people locked in from the first track to the last." },
  { title: "Auremas", base: "pickaquestionas", url: "https://www.instagram.com/p/DYUrgNpOeiU/", text: "He is known for his uplifting house selections, bright energy behind the decks, and ability to turn every set into a feel-good experience." },
  { title: "Garino", base: "pickaquestionas", url: "https://www.instagram.com/p/DXHcN_YET1R/", text: "A Vilnius-based artist whose sound moves between raw grooves, analog textures, and personal moods shaped by everyday life." },
  { title: "Judoc", base: "judocPhoto", url: "https://www.instagram.com/p/DW_RhtCDvVY/", text: "Dutch electronic music selector who shaped his sound from late '90s vinyl beginnings to stages like Danceboulevard." },
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
  { base: "fbLogo_500x500", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61575745327452" },
  { base: "instagram_500x500", label: "Instagram", url: "https://www.instagram.com/decksandstories/" },
  { base: "buymeacoffee_500x500", label: "Buy Me a Coffee", url: "https://buymeacoffee.com/decksandstories" },
  { base: "youtube_500x500", label: "YouTube", url: "https://www.youtube.com/@decksandstories" },
];
