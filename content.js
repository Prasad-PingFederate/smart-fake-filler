// Smart Fake Filler — generates values that satisfy the field's own rules.

const FIRST_NAMES = ["James", "Mary", "John", "Priya", "Robert", "Anita", "Michael", "Sara", "David", "Aisha", "Rahul", "Emily", "Arjun", "Linda", "Omar", "Chen", "Noah", "Sofia", "Vikram", "Hannah"];
const LAST_NAMES = ["Sharma", "Patel", "Singh", "Johnson", "Garcia", "Chen", "Khan", "Brown", "Reddy", "Martin", "Iyer", "Nguyen", "Davis", "Kapoor", "Wilson"];
const CITIES = ["Mumbai", "Bengaluru", "Delhi", "Pune", "Hyderabad", "Chennai", "Austin", "London", "Singapore"];
const STREETS = ["MG Road", "Park Street", "Lake View Road", "Oak Avenue", "Residency Road"];
const MEDS = ["Vitamin D3", "Omega 3", "Magnesium", "Ibuprofen", "Atorvastatin", "Metformin", "Cetirizine", "Amoxicillin"];
const ALLERGIES = ["Penicillin", "Peanuts", "Dust", "Latex", "Shellfish", "Pollen", "Sulfa"];
const SWIFTS = ["DEUTDEFF", "CHASUS33", "BOFAUS3N", "HSBCHKHH", "BARCGB22", "BNPAFRPP", "UBSWCHZH", "SBININBB", "HDFCINBB", "ICICINBB", "CITIUS33"];
const IFSC_BANKS = ["SBIN", "HDFC", "ICIC", "UTIB", "PUNB", "BARB", "CNRB", "KKBK", "YESB", "IDIB"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(chars) {
  return chars[randomInt(0, chars.length - 1)];
}

function digits(n) {
  let s = "";
  for (let i = 0; i < n; i++) s += randomInt(i === 0 ? 1 : 0, 9);
  return s;
}

function letters(n, alphabet) {
  const alpha = alphabet || "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < n; i++) s += pick(alpha);
  return s;
}

function makePersona() {
  const first = randomItem(FIRST_NAMES);
  const last = randomItem(LAST_NAMES);
  const slug = (first + "." + last).toLowerCase().replace(/[^a-z.]/g, "");
  return {
    first,
    last,
    full: first + " " + last,
    email: slug + randomInt(1, 99) + "@example.com",
    phone: String(randomInt(6, 9)) + digits(9),
    city: randomItem(CITIES),
    address: randomInt(10, 999) + " " + randomItem(STREETS),
    org: randomItem(["Northwind Health", "Contoso Clinic", "Apex Labs", "Harbor Bank"]),
    password: "Test@" + randomInt(1000, 9999) + "a",
  };
}

function extractExample(text) {
  if (!text) return null;
  const m = String(text).match(/(?:e\.g\.?|for example|example|sample|such as|format|like)\s*[:\-]?\s*["'(]*([A-Za-z0-9][A-Za-z0-9 .+\-/_]{0,48})/i);
  if (!m) return null;
  return m[1].replace(/[.,;:]+$/, "").trim();
}

function varyExample(example) {
  if (!example) return example;
  return example.replace(/\d+/g, (run) => {
    let n = "";
    for (let i = 0; i < run.length; i++) n += randomInt(i === 0 ? 1 : 0, 9);
    return n;
  });
}

function pushRange(arr, a, b) {
  const start = a.codePointAt(0);
  const end = b.codePointAt(0);
  if (end < start || end - start > 120) {
    arr.push(a);
    return;
  }
  for (let c = start; c <= end; c++) arr.push(String.fromCodePoint(c));
}

function fullMatch(pattern, value) {
  let p = pattern;
  if (p.startsWith("^")) p = p.slice(1);
  if (p.endsWith("$") && !p.endsWith("\\$")) p = p.slice(0, -1);
  try {
    return new RegExp("^(?:" + p + ")$").test(value);
  } catch (e) {
    return false;
  }
}

function generateFromRegex(pattern, maxLen) {
  if (!pattern || pattern.length > 300) return null;
  if (/\\[1-9]|\(\?[=!<]/.test(pattern)) return null;

  let src = pattern;
  if (src.startsWith("^")) src = src.slice(1);
  if (src.endsWith("$") && !src.endsWith("\\$")) src = src.slice(0, -1);

  const cap = maxLen > 0 ? Math.min(maxLen, 80) : 48;
  let i = 0;

  function parseAlt() {
    const opts = [parseSeq()];
    while (src[i] === "|") {
      i++;
      opts.push(parseSeq());
    }
    return randomItem(opts);
  }

  function parseSeq() {
    let out = "";
    let guard = 0;
    while (i < src.length && src[i] !== ")" && src[i] !== "|" && guard < 80) {
      guard++;
      const start = i;
      const atom = parseAtom();
      if (atom == null) {
        if (i === start) break;
        break;
      }
      const q = parseQuantifier();
      const room = Math.max(0, cap - out.length);
      const n = quantCount(q, room);
      for (let k = 0; k < n; k++) {
        out += typeof atom === "function" ? atom() : atom;
        if (out.length >= cap) break;
      }
    }
    return out.slice(0, cap);
  }

  function parseAtom() {
    if (i >= src.length) return null;
    const c = src[i];
    if (c === "\\") {
      i++;
      const e = src[i++] || "";
      if (e === "d") return () => String(randomInt(0, 9));
      if (e === "D") return () => pick("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
      if (e === "w") return () => pick("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_");
      if (e === "s") return () => " ";
      if (e === "S" || e === "W") return () => pick("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
      return e;
    }
    if (c === ".") {
      i++;
      return () => pick("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
    }
    if (c === "[") return parseClass();
    if (c === "(") {
      i++;
      if (src.startsWith("?:,", i) || src.startsWith("?:", i)) i += 2;
      const inner = parseAlt();
      if (src[i] === ")") i++;
      return inner;
    }
    if (c === "*" || c === "+" || c === "?" || c === "{" || c === ")" || c === "|") return null;
    i++;
    return c;
  }

  function parseClass() {
    i++;
    let neg = false;
    if (src[i] === "^") {
      neg = true;
      i++;
    }
    const chars = [];
    while (i < src.length && src[i] !== "]") {
      if (src[i] === "\\") {
        i++;
        const e = src[i++] || "";
        if (e === "d") pushRange(chars, "0", "9");
        else if (e === "w") {
          pushRange(chars, "A", "Z");
          pushRange(chars, "a", "z");
          pushRange(chars, "0", "9");
          chars.push("_");
        } else if (e === "s") chars.push(" ");
        else chars.push(e);
        continue;
      }
      if (src[i + 1] === "-" && src[i + 2] && src[i + 2] !== "]") {
        pushRange(chars, src[i], src[i + 2]);
        i += 3;
      } else {
        chars.push(src[i]);
        i++;
      }
    }
    if (src[i] === "]") i++;
    let pool = chars;
    if (neg) {
      const ban = new Set(chars);
      pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("").filter((ch) => !ban.has(ch));
    }
    if (!pool.length) pool = ["A"];
    return () => pool[randomInt(0, pool.length - 1)];
  }

  function parseQuantifier() {
    if (src[i] === "*") {
      i++;
      return { min: 0, max: 3 };
    }
    if (src[i] === "+") {
      i++;
      return { min: 1, max: 4 };
    }
    if (src[i] === "?") {
      i++;
      return { min: 0, max: 1 };
    }
    if (src[i] === "{") {
      const m = src.slice(i).match(/^\{(\d+)(,(\d+)?)?\}/);
      if (!m) return null;
      i += m[0].length;
      const min = Number(m[1]);
      if (m[2] == null) return { min, max: min };
      if (m[3] == null) return { min, max: min + 2 };
      return { min, max: Number(m[3]) };
    }
    return null;
  }

  function quantCount(q, room) {
    if (!q) return room <= 0 ? 0 : 1;
    const max = Math.min(q.max, Math.max(room, 0));
    const min = Math.min(q.min, max);
    if (max < min || max < 0) return 0;
    return randomInt(min, Math.max(min, max));
  }

  try {
    return parseAlt();
  } catch (e) {
    return null;
  }
}

function tryPattern(pattern, maxLen) {
  for (let n = 0; n < 24; n++) {
    const value = generateFromRegex(pattern, maxLen);
    if (!value) continue;
    if (maxLen > 0 && value.length > maxLen) continue;
    if (fullMatch(pattern, value)) return value;
  }
  return null;
}

function generateSWIFT(maxLen) {
  const base = randomItem(SWIFTS);
  if (maxLen === 8) return base;
  if (maxLen >= 11) return base + "XXX";
  return base;
}

function ibanCheckDigits(country, bban) {
  const rearranged = (bban + country + "00").toUpperCase();
  let expanded = "";
  for (const ch of rearranged) {
    expanded += ch >= "A" && ch <= "Z" ? String(ch.charCodeAt(0) - 55) : ch;
  }
  let rem = 0;
  for (const ch of expanded) rem = (rem * 10 + Number(ch)) % 97;
  return country + String(98 - rem).padStart(2, "0") + bban;
}

function generateIBAN() {
  if (Math.random() < 0.5) return ibanCheckDigits("DE", digits(18));
  return ibanCheckDigits("GB", letters(4) + digits(6) + digits(8));
}

function ibanOk(iban) {
  const rearranged = (iban.slice(4) + iban.slice(0, 4)).toUpperCase();
  let expanded = "";
  for (const ch of rearranged) {
    expanded += ch >= "A" && ch <= "Z" ? String(ch.charCodeAt(0) - 55) : ch;
  }
  let rem = 0;
  for (const ch of expanded) rem = (rem * 10 + Number(ch)) % 97;
  return rem === 1;
}

function generateABA() {
  const d = [];
  for (let i = 0; i < 8; i++) d.push(randomInt(0, 9));
  const sum = 3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5]);
  const check = (10 - (sum % 10)) % 10;
  return d.join("") + String(check);
}

function abaOk(num) {
  if (!/^\d{9}$/.test(num)) return false;
  const d = num.split("").map(Number);
  const sum = 3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8]);
  return sum % 10 === 0;
}

function luhnCheckDigit(numWithoutCheck) {
  const digitsRev = String(numWithoutCheck).split("").reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < digitsRev.length; i++) {
    let n = digitsRev[i];
    if (i % 2 === 0) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return (10 - (sum % 10)) % 10;
}

function generateCard() {
  let body = "4";
  for (let i = 0; i < 14; i++) body += randomInt(0, 9);
  return body + String(luhnCheckDigit(body));
}

function luhnOk(num) {
  const clean = String(num).replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(clean)) return false;
  const body = clean.slice(0, -1);
  return Number(clean.slice(-1)) === luhnCheckDigit(body);
}

function generateIFSC() {
  let rest = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 6; i++) rest += pick(alphabet);
  return randomItem(IFSC_BANKS) + "0" + rest;
}

function generatePAN() {
  return letters(3) + "P" + letters(1) + digits(4) + letters(1);
}

function generateGSTIN() {
  const state = String(randomInt(1, 37)).padStart(2, "0");
  return state + generatePAN() + pick("123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ") + "Z" + pick("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
}

function generateSSN() {
  let area = randomInt(1, 899);
  if (area === 666) area = 667;
  return String(area).padStart(3, "0") + "-" + String(randomInt(1, 99)).padStart(2, "0") + "-" + String(randomInt(1, 9999)).padStart(4, "0");
}

function generateDosage(example) {
  if (example && /\d/.test(example) && /[a-z]/i.test(example)) return varyExample(example);
  const unitMatch = example && example.match(/mcg|mg|ml|iu|g/i);
  const unit = unitMatch ? unitMatch[0] : "mg";
  const amt = randomItem([5, 10, 20, 25, 50, 100, 250, 500, 1000]);
  return Math.random() < 0.6 ? amt + unit : amt + " " + unit;
}

function generatePostal(hints, max) {
  const h = hints.toLowerCase();
  if (/pin|india/.test(h) || max === 6) return digits(6);
  if (/united kingdom|\buk\b|post\s*code/.test(h)) {
    return pick("ABCEGHJKLMNPRSTUWXYZ") + pick("ABCEGHJKLMNPRSTUWXYZ") + randomInt(1, 9) + " " + randomInt(1, 9) + pick("ABD") + pick("ABD");
  }
  if (max === 5 || max === 10) {
    const zip = digits(5);
    return max === 10 ? zip + "-" + String(randomInt(1000, 9999)) : zip;
  }
  return digits(5);
}

function futureExpiry() {
  const d = new Date();
  d.setMonth(d.getMonth() + randomInt(4, 36));
  return String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getFullYear()).slice(2);
}

function formatDate(date, fmt) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  if (fmt === "DMY") return dd + "/" + mm + "/" + yyyy;
  if (fmt === "ISO") return yyyy + "-" + mm + "-" + dd;
  return mm + "/" + dd + "/" + yyyy;
}

function detectFmt(ctx, hints) {
  const h = (hints + " " + (ctx.placeholder || "")).toLowerCase();
  if (ctx.type === "date" || ctx.type === "datetime-local" || ctx.type === "month") return "ISO";
  if (/dd[\s./-]*mm/.test(h)) return "DMY";
  if (/yyyy[\s./-]*mm/.test(h)) return "ISO";
  return "MDY";
}

function dateRole(hints) {
  const h = hints.toLowerCase();
  if (/\b(dob|birth)\b/.test(h)) return "dob";
  if (/\bend\b/.test(h)) return "end";
  if (/\bstart\b/.test(h)) return "start";
  return "any";
}

function clampDate(date, ctx) {
  let d = new Date(date.getTime());
  if (ctx.min) {
    const min = new Date(ctx.min);
    if (!Number.isNaN(min.getTime()) && d < min) d = min;
  }
  if (ctx.max) {
    const max = new Date(ctx.max);
    if (!Number.isNaN(max.getTime()) && d > max) d = max;
  }
  return d;
}

function makeDate(role, session, fmt, ctx) {
  const now = new Date();
  let d;
  if (role === "dob") d = new Date(randomInt(1965, 2002), randomInt(0, 11), randomInt(1, 28));
  else if (role === "end") {
    const start = session.startDate ? new Date(session.startDate) : now;
    d = new Date(start.getTime());
    d.setDate(d.getDate() + randomInt(30, 400));
  } else if (role === "start") {
    d = new Date(now.getTime());
    d.setDate(d.getDate() - randomInt(30, 800));
    session.startDate = d.toISOString();
  } else {
    d = new Date(now.getTime());
    d.setDate(d.getDate() - randomInt(1, 300));
  }
  d = clampDate(d, ctx || {});
  if (role === "start") session.startDate = d.toISOString();
  return formatDate(d, fmt);
}

function numberValue(ctx) {
  const hasMin = ctx.min !== "" && ctx.min != null && !Number.isNaN(Number(ctx.min));
  const hasMax = ctx.max !== "" && ctx.max != null && !Number.isNaN(Number(ctx.max));
  let min = hasMin ? Number(ctx.min) : 1;
  let max = hasMax ? Number(ctx.max) : Math.max(min + 20, 100);
  if (max < min) max = min;
  const step = ctx.step && ctx.step !== "any" ? Number(ctx.step) : 1;
  const steps = Math.max(0, Math.floor((max - min) / (step || 1)));
  let n = min + randomInt(0, steps) * (step || 1);
  if (n > max) n = max;
  if (Number.isInteger(step) && Number.isInteger(min)) return String(Math.round(n));
  return String(Math.round(n * 100) / 100);
}

function strictValue(hints, ctx, session) {
  const h = hints.toLowerCase();
  const max = ctx.maxLength > 0 ? ctx.maxLength : 0;
  if (/\b(swift|bic)\b/.test(h) || /bank identifier/.test(h)) return generateSWIFT(max);
  if (/\biban\b/.test(h)) return generateIBAN();
  if (/\bifsc\b/.test(h)) return generateIFSC();
  if (/\bmicr\b/.test(h)) return digits(9);
  if (/\b(aba routing|routing number|routing no)\b/.test(h)) return generateABA();
  if (/\bsort\s*code\b/.test(h)) return digits(2) + "-" + digits(2) + "-" + digits(2);
  if (/\bbsb\b/.test(h)) return digits(6);
  if (/\bpan\b/.test(h)) return generatePAN();
  if (/\b(aadhaar|aadhar|uidai)\b/.test(h)) return digits(12);
  if (/\bgstin?\b/.test(h)) return generateGSTIN();
  if (/\b(ssn|social security)\b/.test(h)) return generateSSN();
  if (/\b(card number|credit card|debit card)\b/.test(h)) return generateCard();
  if (/\b(cvv|cvc)\b/.test(h)) return digits(max === 4 ? 4 : 3);
  if (/\b(expir|valid thru|valid through)\b/.test(h)) return futureExpiry();
  if (/\bupi\b/.test(h)) {
    const name = (session.person.first + session.person.last).toLowerCase().replace(/[^a-z]/g, "").slice(0, 12);
    return name + "@oksbi";
  }
  if (/\b(pin\s*code|postal|zip(\s*code)?|post\s*code)\b/.test(h)) return generatePostal(h, max);
  if (/\b(ndc)\b/.test(h)) return digits(5) + "-" + digits(4) + "-" + digits(2);
  return null;
}

function looseValue(hints, ctx, session) {
  const h = hints.toLowerCase();
  const p = session.person;
  const wantsMixed = /numbers and letters|letters and numbers|both numbers and letters|alphanumeric/.test(h);

  if (/\b(dosage|dose|strength)\b/.test(h) || (wantsMixed && /\b(mg|ml|mcg|iu)\b/.test(h))) {
    return generateDosage(extractExample(hints));
  }
  if (wantsMixed) return generateDosage(extractExample(hints));
  if (ctx.type === "email" || /\b(e-?mail)\b/.test(h)) return p.email;
  if (ctx.type === "tel" || /\b(phone|mobile|tel)\b/.test(h)) return p.phone;
  if (ctx.type === "password" || /\b(password|passcode|passwd)\b/.test(h)) return p.password;
  if (ctx.type === "url" || /\b(website|url|link)\b/.test(h)) return "https://example.com/" + p.first.toLowerCase();
  if (/\b(date|dob|birth)\b/.test(h) || /\bbday\b/.test(h)) return makeDate(dateRole(h), session, detectFmt(ctx, h), ctx);
  if (/\b(given-name|first\s*name|fname)\b/.test(h)) return p.first;
  if (/\b(family-name|last\s*name|surname|lname)\b/.test(h)) return p.last;
  if (/\b(preferred\s*name|nickname)\b/.test(h)) return p.full;
  if (/\b(user\s*name|username)\b/.test(h)) return (p.first + "." + p.last).toLowerCase();
  if (/\borg|company|employer\b/.test(h)) return p.org;
  if (/\b(supplement|medication|medicine|drug)\b/.test(h)) return randomItem(MEDS);
  if (/\ballerg/.test(h)) return randomItem(ALLERGIES);
  if (/\bblood\b/.test(h)) return randomItem(["O+", "A+", "B+", "AB+", "O-", "A-"]);
  if (/\bgender|sex\b/.test(h)) return randomItem(["Male", "Female", "Other"]);
  if (/\bnationality|citizenship\b/.test(h)) return "Indian";
  if (/\bcountry\b/.test(h)) return "India";
  if (/\bstate|province\b/.test(h)) return randomItem(["Karnataka", "Maharashtra", "California", "Texas"]);
  if (/\bcity|town\b/.test(h)) return p.city;
  if (/\b(address|street)\b/.test(h)) return p.address;
  if (/\b(note|notes|comment|description|remark|detail)\b/.test(h)) {
    return "Take as directed. Follow up if symptoms continue.";
  }
  if (/\b(age)\b/.test(h)) return String(randomInt(18, 75));
  if (/\b(percent|percentage)\b/.test(h)) return String(randomInt(1, 100));
  if (/\b(amount|price|cost|salary|balance|fee)\b/.test(h)) return randomInt(10, 5000) + ".00";
  if (/\b(qty|quantity|count|refill)\b/.test(h)) return String(randomInt(1, 30));
  if (/\b(account\s*(number|no|num)|acct)\b/.test(h)) return digits(Math.min(Math.max(ctx.maxLength > 0 ? ctx.maxLength : 12, 8), 16));
  if (/\b(full\s*name|^name\b|\bname\b)/.test(h) && !/user/.test(h)) return p.full;
  return null;
}

function typeValue(ctx, session, hints) {
  const type = ctx.type;
  if (type === "number" || type === "range") return numberValue(ctx);
  if (type === "date") return makeDate(dateRole(hints), session, "ISO", ctx);
  if (type === "datetime-local") return makeDate(dateRole(hints), session, "ISO", ctx) + "T09:30";
  if (type === "time") return "09:" + String(randomItem([0, 15, 30, 45])).padStart(2, "0");
  if (type === "month") return makeDate("any", session, "ISO", ctx).slice(0, 7);
  if (type === "week") return "2026-W12";
  if (type === "email") return session.person.email;
  if (type === "tel") return session.person.phone;
  if (type === "url") return "https://example.com";
  if (type === "password") return session.person.password;
  if (type === "color") return "#3b82f6";
  if (type === "textarea") return "Take as directed. Follow up if symptoms continue.";
  if ((ctx.inputMode || "").toLowerCase() === "numeric" || (ctx.inputMode || "").toLowerCase() === "decimal") {
    return digits(ctx.maxLength > 0 ? Math.min(ctx.maxLength, 8) : 4);
  }
  return null;
}

function tune(value, ctx, hints) {
  let v = String(value ?? "");
  const h = hints.toLowerCase();
  const wantsMixed = /numbers and letters|letters and numbers|both numbers and letters|alphanumeric/.test(h);
  if (wantsMixed && !(/\d/.test(v) && /[a-z]/i.test(v))) {
    v = generateDosage(extractExample(hints));
  }
  const max = ctx.maxLength > 0 ? ctx.maxLength : 0;
  const min = ctx.minLength > 0 ? ctx.minLength : 0;
  if (max && v.length > max) v = v.slice(0, max);
  if (min && v.length < min) {
    const pad = /\d/.test(v) && /[a-z]/i.test(v) ? "a1" : /\d/.test(v) ? "1" : "a";
    while (v.length < min) v += pad;
    if (max && v.length > max) v = v.slice(0, max);
  }
  if (ctx.type === "number" || ctx.type === "range") {
    const n = Number(v);
    if (!Number.isNaN(n)) {
      if (ctx.min !== "" && n < Number(ctx.min)) v = String(ctx.min);
      if (ctx.max !== "" && n > Number(ctx.max)) v = String(ctx.max);
    }
  }
  return v;
}

function accepts(value, ctx, pattern) {
  if (value == null || value === "") return false;
  const max = ctx.maxLength > 0 ? ctx.maxLength : 0;
  const min = ctx.minLength > 0 ? ctx.minLength : 0;
  if (max && String(value).length > max) return false;
  if (min && String(value).length < min) return false;
  if (pattern && !fullMatch(pattern, String(value))) return false;
  if ((ctx.type === "number" || ctx.type === "range") && Number.isNaN(Number(value))) return false;
  return true;
}

function valueFromContext(ctx, session) {
  const hints = [ctx.hints, ctx.placeholder, ctx.autocomplete].filter(Boolean).join(" ");
  const pattern = ctx.pattern || "";
  const example = extractExample(hints);
  const typedFirst = ["number", "range", "date", "datetime-local", "time", "month", "week", "email", "url", "password", "color"].includes(ctx.type);

  const candidates = [];
  const push = (v) => {
    if (v != null && v !== "") candidates.push(v);
  };

  if (typedFirst) push(typeValue(ctx, session, hints));
  if (example) push(varyExample(example));
  push(strictValue(hints, ctx, session));
  push(looseValue(hints, ctx, session));
  if (!typedFirst) push(typeValue(ctx, session, hints));
  if (ctx.type === "textarea") push("Take as directed. Follow up if symptoms continue.");
  push("Sample1");

  for (const candidate of candidates) {
    const tuned = tune(candidate, ctx, hints);
    if (accepts(tuned, ctx, pattern)) return tuned;
  }
  if (pattern) {
    const generated = tryPattern(pattern, ctx.maxLength);
    if (generated) return generated;
  }
  return tune(candidates[0] || "Sample1", ctx, hints);
}

function textOf(node) {
  if (!node) return "";
  return (node.innerText || node.textContent || "").trim();
}

function getHints(el) {
  const parts = [];
  const attrs = ["id", "name", "placeholder", "aria-label", "title", "autocomplete", "class"];
  attrs.forEach((attr) => {
    const v = el.getAttribute && el.getAttribute(attr);
    if (v) parts.push(v);
  });

  try {
    if (el.labels) {
      for (const label of el.labels) parts.push(textOf(label));
    }
  } catch (e) {}

  const doc = el.ownerDocument;
  if (doc && el.id) {
    const labels = doc.querySelectorAll ? doc.querySelectorAll("label[for]") : [];
    for (const label of labels) {
      if (label.htmlFor === el.id || (label.getAttribute && label.getAttribute("for") === el.id)) parts.push(textOf(label));
    }
    const described = el.getAttribute && el.getAttribute("aria-describedby");
    const errored = el.getAttribute && el.getAttribute("aria-errormessage");
    (described + " " + errored).split(/\s+/).forEach((id) => {
      if (!id || id === "null") return;
      const node = doc.getElementById && doc.getElementById(id);
      if (node) parts.push(textOf(node));
    });
  }

  const prev = el.previousElementSibling;
  if (prev && prev.tagName === "LABEL") parts.push(textOf(prev));

  const pushIfHint = (node) => {
    if (!node || node.nodeType !== 1) return;
    if (node.matches && node.matches("input,select,textarea,button")) return;
    if (node.querySelector && node.querySelector("input,select,textarea")) return;
    const t = textOf(node);
    if (t && t.length < 220) parts.push(t);
  };

  pushIfHint(el.nextElementSibling);
  const parent = el.parentElement;
  if (parent && parent.querySelectorAll && parent.querySelectorAll("input,textarea,select").length === 1) {
    for (const child of parent.children) {
      if (child !== el) pushIfHint(child);
    }
    pushIfHint(parent.nextElementSibling);
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function contextFromElement(el) {
  return {
    type: (el.type || (el.tagName || "")).toLowerCase(),
    pattern: (el.getAttribute && el.getAttribute("pattern")) || "",
    hints: getHints(el),
    placeholder: (el.getAttribute && el.getAttribute("placeholder")) || "",
    autocomplete: (el.getAttribute && el.getAttribute("autocomplete")) || "",
    maxLength: el.maxLength > 0 ? el.maxLength : -1,
    minLength: el.minLength > 0 ? el.minLength : -1,
    min: el.min || "",
    max: el.max || "",
    step: el.step || "",
    inputMode: (el.getAttribute && el.getAttribute("inputmode")) || "",
  };
}

function setNativeValue(el, value) {
  const tag = (el.tagName || "").toUpperCase();
  const proto = tag === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, "value");
  if (desc && desc.set) desc.set.call(el, value);
  else el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function setChecked(el, checked) {
  const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked");
  if (desc && desc.set) desc.set.call(el, checked);
  else el.checked = checked;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function isSkippable(el) {
  const type = (el.type || "").toLowerCase();
  if (["hidden", "submit", "button", "reset", "file", "image", "search"].includes(type)) return true;
  if (el.disabled || el.readOnly) return true;
  if (el.closest && el.closest("[hidden]")) return true;
  return false;
}

function fillSelect(el, session) {
  const options = [...el.options].filter((o) => !o.disabled && String(o.value) !== "" && !/^(select|choose|please)/i.test(o.text.trim()));
  if (!options.length) return;
  const ctx = contextFromElement(el);
  ctx.type = "text";
  const desired = String(looseValue(ctx.hints, ctx, session) || "").toLowerCase();
  const match = desired
    ? options.find((o) => {
        const text = o.text.trim().toLowerCase();
        const value = String(o.value).toLowerCase();
        return text === desired || value === desired || text.includes(desired) || desired.includes(text);
      })
    : null;
  const chosen = match || options[randomInt(0, options.length - 1)];
  el.value = chosen.value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function fillRadio(el, session, seen) {
  if (!el.name) {
    setChecked(el, true);
    return;
  }
  if (seen.has(el.name)) return;
  seen.add(el.name);
  const group = [...el.ownerDocument.querySelectorAll('input[type="radio"]')].filter((r) => r.name === el.name && !r.disabled);
  if (!group.length) return;
  const ctx = contextFromElement(el);
  ctx.type = "text";
  const desired = String(looseValue(ctx.hints, ctx, session) || "").toLowerCase();
  const match = desired
    ? group.find((r) => {
        const hint = getHints(r).toLowerCase();
        return hint.includes(desired) || String(r.value).toLowerCase() === desired;
      })
    : null;
  setChecked(match || group[randomInt(0, group.length - 1)], true);
}

function fillCheckbox(el) {
  const hints = getHints(el).toLowerCase();
  if (el.required || /\b(current|active|ongoing|primary|agree|accept|confirm)\b/.test(hints)) setChecked(el, true);
}

function collectFields(root, out) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll("input, textarea, select").forEach((el) => out.push(el));
  root.querySelectorAll("*").forEach((el) => {
    if (el.shadowRoot) collectFields(el.shadowRoot, out);
  });
}

function fillElement(el, session, radios) {
  if (isSkippable(el)) return;
  const tag = (el.tagName || "").toLowerCase();
  const type = (el.type || "").toLowerCase();
  if (tag === "select") {
    fillSelect(el, session);
    return;
  }
  if (type === "radio") {
    fillRadio(el, session, radios);
    return;
  }
  if (type === "checkbox") {
    fillCheckbox(el);
    return;
  }
  const value = valueFromContext(contextFromElement(el), session);
  if (value == null || value === "") return;
  setNativeValue(el, value);
}

function fillForm(root) {
  const doc = root || document;
  const session = { person: makePersona(), startDate: null };
  const fields = [];
  collectFields(doc, fields);
  const radios = new Set();
  fields.forEach((el) => {
    try {
      fillElement(el, session, radios);
    } catch (e) {}
  });
  doc.querySelectorAll('[role="switch"]').forEach((sw) => {
    const hints = ((sw.getAttribute("aria-label") || "") + " " + textOf(sw.parentElement)).toLowerCase();
    if (/\b(current|active|ongoing)\b/.test(hints) && sw.getAttribute("aria-checked") === "false") sw.click();
  });
}

function clearForm(root) {
  const doc = root || document;
  const fields = [];
  collectFields(doc, fields);
  fields.forEach((el) => {
    const type = (el.type || "").toLowerCase();
    if (["hidden", "submit", "button", "reset", "file", "image"].includes(type)) return;
    if ((el.tagName || "").toLowerCase() === "select") el.selectedIndex = 0;
    else if (type === "checkbox" || type === "radio") setChecked(el, false);
    else setNativeValue(el, "");
  });
}

if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "fillForm") fillForm(document);
    else if (msg.action === "clearForm") clearForm(document);
    sendResponse({ ok: true });
  });
}
