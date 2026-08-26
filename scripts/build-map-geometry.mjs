/**
 * One-shot local geometry build — NOT part of vite build.
 * Run: node scripts/build-map-geometry.mjs
 * Writes: src/data/world-geometry.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { geoNaturalEarth1, geoPath, geoCentroid } from "d3-geo";
import { feature } from "topojson-client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(import.meta.url);

/** Featured countries (numeric ISO → alpha-2). */
const FEATURED_NUMERIC_TO_ISO2 = {
  "840": "US",
  "716": "ZW",
  "380": "IT",
  "440": "LT",
  "208": "DK",
  "528": "NL",
  "276": "DE",
  "484": "MX",
  "250": "FR",
  "300": "GR",
  "504": "MA",
  "124": "CA",
  "752": "SE",
  "076": "BR",
  "760": "SY",
  "826": "GB",
  "566": "NG",
  "724": "ES",
  "376": "IL",
  "792": "TR",
  "586": "PK",
  "422": "LB",
  "056": "BE",
  "032": "AR",
  "268": "GE",
  "158": "TW",
  "788": "TN",
  "710": "ZA",
  "578": "NO",
  "040": "AT",
  "862": "VE",
};

/** Broader numeric→iso2 so every landmass gets a stable key (not just featured). */
const NUMERIC_TO_ISO2 = {
  ...FEATURED_NUMERIC_TO_ISO2,
  "004": "AF", "008": "AL", "012": "DZ", "016": "AS", "020": "AD", "024": "AO",
  "028": "AG", "031": "AZ", "036": "AU", "044": "BS", "048": "BH", "050": "BD",
  "051": "AM", "052": "BB", "064": "BT", "068": "BO", "070": "BA", "072": "BW",
  "084": "BZ", "090": "SB", "096": "BN", "100": "BG", "104": "MM", "108": "BI",
  "112": "BY", "116": "KH", "120": "CM", "132": "CV", "140": "CF", "144": "LK",
  "148": "TD", "152": "CL", "156": "CN", "170": "CO", "174": "KM", "178": "CG",
  "180": "CD", "188": "CR", "191": "HR", "192": "CU", "196": "CY", "203": "CZ",
  "204": "BJ", "212": "DM", "214": "DO", "218": "EC", "222": "SV", "226": "GQ",
  "231": "ET", "232": "ER", "233": "EE", "242": "FJ", "246": "FI", "262": "DJ",
  "266": "GA", "270": "GM", "275": "PS", "288": "GH", "296": "KI", "308": "GD",
  "320": "GT", "324": "GN", "328": "GY", "332": "HT", "340": "HN", "348": "HU",
  "352": "IS", "356": "IN", "360": "ID", "364": "IR", "368": "IQ", "372": "IE",
  "388": "JM", "392": "JP", "398": "KZ", "400": "JO", "404": "KE", "408": "KP",
  "410": "KR", "414": "KW", "417": "KG", "418": "LA", "426": "LS", "428": "LV",
  "430": "LR", "434": "LY", "438": "LI", "442": "LU", "450": "MG", "454": "MW",
  "458": "MY", "462": "MV", "466": "ML", "470": "MT", "478": "MR", "480": "MU",
  "496": "MN", "498": "MD", "499": "ME", "508": "MZ", "512": "OM", "516": "NA",
  "520": "NR", "524": "NP", "540": "NC", "548": "VU", "554": "NZ", "558": "NI",
  "562": "NE", "570": "NU", "583": "FM", "584": "MH", "585": "PW", "591": "PA",
  "598": "PG", "600": "PY", "604": "PE", "608": "PH", "616": "PL", "620": "PT",
  "624": "GW", "626": "TL", "630": "PR", "634": "QA", "642": "RO", "643": "RU",
  "646": "RW", "662": "LC", "670": "VC", "678": "ST", "682": "SA", "686": "SN",
  "688": "RS", "690": "SC", "694": "SL", "702": "SG", "703": "SK", "704": "VN",
  "705": "SI", "706": "SO", "728": "SS", "729": "SD", "740": "SR", "748": "SZ",
  "756": "CH", "762": "TJ", "764": "TH", "768": "TG", "776": "TO", "780": "TT",
  "784": "AE", "800": "UG", "804": "UA", "807": "MK", "818": "EG", "834": "TZ",
  "854": "BF", "858": "UY", "860": "UZ", "887": "YE", "894": "ZM",
};

const topology = JSON.parse(
  readFileSync(require.resolve("world-atlas/countries-110m.json"), "utf8"),
);
const collection = feature(topology, topology.objects.countries);
const features = collection.features.filter((f) => String(f.id).padStart(3, "0") !== "010");

const projection = geoNaturalEarth1().fitSize([980, 480], {
  type: "FeatureCollection",
  features,
});
const path = geoPath(projection);

const featuredIso = new Set(Object.values(FEATURED_NUMERIC_TO_ISO2));
const out = [];

for (const f of features) {
  const numeric = String(f.id).padStart(3, "0");
  const iso2 = NUMERIC_TO_ISO2[numeric];
  if (!iso2) continue;

  const d = path(f);
  if (!d) continue;

  const isFeatured = featuredIso.has(iso2);
  let cx = null;
  let cy = null;
  if (isFeatured) {
    const [x, y] = projection(geoCentroid(f));
    if (Number.isFinite(x) && Number.isFinite(y)) {
      cx = Math.round(x * 1000) / 1000;
      cy = Math.round(y * 1000) / 1000;
    }
  }

  out.push({ iso2, d, cx, cy, isFeatured });
}

out.sort((a, b) => a.iso2.localeCompare(b.iso2));

const dest = join(root, "src/data/world-geometry.json");
writeFileSync(dest, JSON.stringify(out));
console.log(
  `Wrote ${out.length} countries → ${dest} (${out.filter((c) => c.isFeatured).length} featured)`,
);
