const icons = {
  level: '\u{1F396}',
  attack: '\u{2694}',
  defence: '\u{1F6E1}',
  health: '\u{2764}',
};

export default function showInfoCharacter(hero) {
  return `${icons.level}${hero.level}${icons.attack}${hero.attack}${icons.defence}${hero.defence}${icons.health}${hero.health}`;
}
