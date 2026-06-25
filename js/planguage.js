const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function isLetter(char) {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function isConsonant(char) {
  return isLetter(char) && !VOWELS.has(char.toLowerCase());
}

/**
 * @typedef {{ char: string, natural: boolean, replacement: boolean }} Token
 */

/** @returns {Token[]} */
function tokenize(text) {
  const tokens = [];

  for (const char of text) {
    if (char.toLowerCase() === "p" && isLetter(char)) {
      tokens.push({ char: "p", natural: true, replacement: false });
      continue;
    }

    if (isConsonant(char)) {
      tokens.push({ char: "p", natural: false, replacement: true });
      continue;
    }

    tokens.push({ char, natural: false, replacement: false });
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

    let naturalCount = 0;
    let hasReplacement = false;
    let runEnd = index;

    while (runEnd < tokens.length && tokens[runEnd].char === "p") {
      if (tokens[runEnd].natural) {
        naturalCount += 1;
      }
      if (tokens[runEnd].replacement) {
        hasReplacement = true;
      }
      runEnd += 1;
    }

    const collapsedCount = naturalCount + (hasReplacement ? 1 : 0);
    for (let i = 0; i < collapsedCount; i += 1) {
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
