/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  while(true){
    const indexCharacter = Math.floor(Math.random() * allowedTypes.length);
    const levelCharacter = Math.floor((Math.random() * maxLevel) + 1);
    yield new allowedTypes[indexCharacter](levelCharacter);
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const hero = characterGenerator(allowedTypes, maxLevel);
  const team = [];

  for (let i = 0; i< characterCount; i += 1)
  {
    team.push(hero.next().value);
  }

  return team;
}
