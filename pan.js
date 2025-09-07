const animation = document.getElementById('animation');
const pan = document.getElementById('pan');
const dice = document.getElementById('dice');
const ns = 'http://www.w3.org/2000/svg';
const colors = ["#fafafa", "#f398c3", "#f44e24", "#f4d730", "#23b247"];

function makeDie(sides) {
  const pts = [];
  const r = 10;
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI;
    pts.push({
      x: r * Math.cos(angle),
      y: r * Math.sin(angle)
    });
  }

  const elt = document.createElementNS(ns, 'path');
  elt.setAttribute('stroke', 'none');
  // elt.setAttribute('fill', '#FFF');
  elt.setAttribute('d', pts.map((pt, i) => {
    if (i === 0) return `M${pt.x.toFixed(2)},${pt.y.toFixed(2)}`;
    return `L${pt.x.toFixed(2)},${pt.y.toFixed(2)}`;
  }).join(' ') + ' Z')
  elt.style.fill = colors[Math.floor(Math.random() * colors.length)];
  elt.classList.add('die');
  return elt;
}

const sidesIn2D = {
  4: 3,
  6: 4,
  8: 6,
  10: 6,
  12: 10,
  20: 6,
};

function nextFrame() {
  return new Promise(res => window.requestAnimationFrame(res));
}

async function flip(diceToRoll) {

  pan.classList.add('flip');
  await delay(200);
  for (const sides of diceToRoll) {
    const die = makeDie(sidesIn2D[sides]);
    const dieParent = document.createElementNS(ns, 'g');
    die.classList.add('jump');
    die.style.animationDelay = `${Math.random() * 50}ms`;
    dieParent.style.transform = `translateX(${((Math.random() - 0.5) * 60 - 40).toFixed(2)}px)`;
    dieParent.appendChild(die);
    dice.appendChild(dieParent);
  }
  await delay(500 - 200);
  pan.classList.remove('flip');
  await delay(400);

  while (dice.children.length > 0) {
    dice.removeChild(dice.children[0]);
  }
  await nextFrame();
}

function showPan() {
  animation.classList.remove('hidden');
}

function hidePan() {
  animation.classList.add('hidden');
}
