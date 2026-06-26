const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function isLetter(char) {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function isConsonant(char) {
  return isLetter(char) && !VOWELS.has(char.toLowerCase());
}

/**
 * @typedef {{ char: string, natural: boolean, replacement: boolean, upper: boolean }} Token
 */

/** @returns {Token[]} */
function tokenize(text) {
  const tokens = [];

  for (const char of text) {
    if (char.toLowerCase() === "p" && isLetter(char)) {
      tokens.push({
        char: "p",
        natural: true,
        replacement: false,
        upper: char === "P",
      });
      continue;
    }

    if (isConsonant(char)) {
      tokens.push({ char: "p", natural: false, replacement: true, upper: false });
      continue;
    }

    tokens.push({ char, natural: false, replacement: false, upper: false });
  }

  return tokens;
}

/** @param {Token[]} tokens */
function collapseRuns(tokens) {
  const result = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];

    if (token.char !== "p") {
      result.push(token.char);
      index += 1;
      continue;
    }

    let hasReplacement = false;
    /** @type {boolean[]} */
    const naturalCases = [];
    let runEnd = index;

    while (runEnd < tokens.length && tokens[runEnd].char === "p") {
      if (tokens[runEnd].natural) {
        naturalCases.push(tokens[runEnd].upper);
      }
      if (tokens[runEnd].replacement) {
        hasReplacement = true;
      }
      runEnd += 1;
    }

    for (const upper of naturalCases) {
      result.push(upper ? "P" : "p");
    }
    if (hasReplacement) {
      result.push("p");
    }

    index = runEnd;
  }

  return result.join("");
}

/**
 * Translate English text into Planguage.
 * @param {string} text
 * @returns {string}
 */
export function translateToPlanguage(text) {
  if (!text) {
    return "";
  }

  return collapseRuns(tokenize(text));
}

function applyWordCase(original, translated) {
  if (original === original.toUpperCase()) {
    return translated.toUpperCase();
  }

  if (original[0] === original[0].toUpperCase()) {
    return translated[0].toUpperCase() + translated.slice(1);
  }

  return translated;
}

function splitSegments(text) {
  return text.match(/[a-zA-Z]+|[^a-zA-Z]+/g) ?? [];
}

/** @type {Map<string, string> | null} */
let reverseWordMap = null;

/** @type {Map<string, string> | null} */
let reversePhraseMap = null;

/** @type {Promise<void> | null} */
let reverseDictionaryPromise = null;

function buildReverseDictionary(words) {
  reverseWordMap = new Map();
  reversePhraseMap = new Map();

  for (const word of words) {
    const plWord = translateToPlanguage(word);

    if (word.includes(" ")) {
      if (!reversePhraseMap.has(plWord)) {
        reversePhraseMap.set(plWord, word);
      }
      continue;
    }

    if (!reverseWordMap.has(plWord)) {
      reverseWordMap.set(plWord, word);
    }
  }
}

export function ensureReverseDictionary() {
  if (reverseWordMap) {
    return Promise.resolve();
  }

  if (!reverseDictionaryPromise) {
    reverseDictionaryPromise = import("./words.js")
      .then(({ default: words }) => {
        buildReverseDictionary(words);
      })
      .catch((error) => {
        reverseDictionaryPromise = null;
        throw error;
      });
  }

  return reverseDictionaryPromise;
}

/**
 * Translate Planguage back to English using dictionary lookup.
 * @param {string} text
 * @returns {string}
 */
export function translateFromPlanguage(text) {
  if (!text) {
    return "";
  }

  if (!reverseWordMap || !reversePhraseMap) {
    return text;
  }

  const trimmed = text.trim();
  const phraseMatch = reversePhraseMap.get(trimmed.toLowerCase());
  if (phraseMatch) {
    return applyWordCase(trimmed, phraseMatch);
  }

  const segments = splitSegments(text);

  return segments
    .map((segment) => {
      if (!isLetter(segment[0])) {
        return segment;
      }

      const match = reverseWordMap.get(segment.toLowerCase());
      if (!match) {
        return segment;
      }

      return applyWordCase(segment, match);
    })
    .join("");
}
