if (target.isEnemy()) {
  var id = target._enemyId;
  $gameSystem.addHpGaugeEnemy(id);
  var type = "";
  var weakness = "";
  var resist = "";
  var immune = "";
  var absorb = "";
  var elements = $dataSystem.elements;
  for (var i = 1; i < elements.length; i++) {
    var name = elements[i];

    var rate = target.elementRate(i);
    if (rate > 1 && rate < 3 && rate != 2.01 && i < 18) {
      weakness += name + " ";
    } else if (rate < 0 && i < 18) {
      absorb += name + " ";
    } else if (rate === 0 && i < 18) {
      immune += name + " ";
    } else if (rate < 1 && i < 18) {
      resist += name + " ";
    } else if (rate >= 3) {
      type += name + " ";
    }
  }

  var text = "\\msgrows[auto]" + "\\fs[36]" + "\\hc[fcf4ac]" + "\\fb" + target.name() + "\\fr" + "\\fs[22]" + "\n" + "\\c[0]" + `${type} ` + "\\c[0]" + " " + "\n" + "\n";
  text += "\\px[100]\\i[791] \\hc[ff4d4d]HP:\\c[0] " + target.hp;
  text += " / " + target.mhp;
  text += "\\px[400]\\i[792] \\hc[3bb0e3]MP:\\c[0] " + target.mp;
  text += " / " + target.mmp;
  text += "\\px[700]\\i[793] \\hc[3cbd19]TP:\\c[0] " + target.tp;
  text += "\n";
  text += "\\px[100]\\i[794] \\hc[de1818]ATK:\\c[0] " + target.atk;
  text += "\\px[400]\\i[796] \\hc[eb5ed8]MAT:\\c[0] " + target.mat;
  text += "\\px[700]\\i[798] \\hc[0af021]AGI:\\c[0] " + target.agi;
  text += "\n";
  text += "\\px[100]\\i[795] \\hc[eb9d0c]DEF:\\c[0] " + target.def;
  text += "\\px[400]\\i[797] \\hc[b23feb]MDF:\\c[0] " + target.mdf;
  text += "\\px[700]\\i[799] \\hc[e3df14]LUK:\\c[0] " + target.luk + "\n";
  $gameMessage.add(text);

  if (weakness === "") weakness = "--None--";
  if (resist === "") resist = "--None--";
  if (immune === "") immune = "--None--";
  if (absorb === "") absorb = "--None--";
  weakness = "\\c[4]Weakness:\\c[0] " + weakness + "\n";
  resist = "\\c[4]Resist:\\c[0] " + resist + "\n";
  immune = "\\c[4]Immune:\\c[0] " + immune + "\n";
  absorb = "\\c[4]Absorb:\\c[0] " + absorb;
  text = weakness + resist + immune + absorb;
  $gameMessage.add(text);
}
