#!/usr/bin/env bash
set -euo pipefail

PRIORITY=(
  a i am an as at be by do for go he hi if in is it me my no of ok on or so the to up us we
  and are but can did get had has her him his how its let may new not now old one our out say
  she the too use was way who why you all any ask big boy day end far few fun got hot its job
  key law man men mom net off own pay per put ran red run saw set sit son sun ten top try two
  use war win yes yet zoo
  about after again being could every first found great group hello house large learn never other
  place point right small sound still story study their there these thing think those three under
  until where which while world would write years young example language planguage happy paper apple
  there hello people little before should because between another something everything
)

dict=$(grep -E '^[a-z]{2,12}$' /usr/share/dict/words)

{
  echo 'export default ['
  printf '  "%s",\n' "${PRIORITY[@]}"
  while IFS= read -r word; do
    skip=false
    for p in "${PRIORITY[@]}"; do
      if [[ "$word" == "$p" ]]; then
        skip=true
        break
      fi
    done
    if ! $skip; then
      printf '  "%s",\n' "$word"
    fi
  done <<< "$dict"
  echo '];'
} > js/words.js

wc -c js/words.js
