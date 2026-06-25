import { translateToPlanguage } from "./planguage.js";

const cases = [
  ["for example", "pop epappe"],
  ["fff", "p"],
  ["apple", "apppe"],
  ["", ""],
  ["hello", "pepo"],
  ["123!", "123!"],
  ["Hi there!", "pi pepe!"],
  ["ppp", "ppp"],
  ["paper", "papep"],
  ["happy", "pappp"],
];

let passed = 0;
let failed = 0;

for (const [input, expected] of cases) {
  const actual = translateToPlanguage(input);
  if (actual === expected) {
    passed += 1;
    console.log(`PASS: ${JSON.stringify(input)} -> ${JSON.stringify(actual)}`);
  } else {
    failed += 1;
    console.error(
      `FAIL: ${JSON.stringify(input)} expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`
    );
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  throw new Error(`${failed} test(s) failed`);
}
