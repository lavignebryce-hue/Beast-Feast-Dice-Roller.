function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

// Get list of all dice you will roll
function buildDiceList() {
  let dice = [];
  const sidesList = [20, 12, 10, 8, 6, 4];

  // for each dice type, get the number of them you will be rolling
  sidesList.forEach(diceType => {
    let numberOfDice = parseInt(document.getElementById(`d${diceType}`).value) || 0;
    for (let i = 0; i < numberOfDice; i++) {
      dice.push(diceType);
    }
  });

  return dice;
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function findMinimum(arr) {
  let minValue = Infinity;

  for (var num of arr){
    if (num < minValue) {
      minValue = num;
    }
  }
  return minValue;
}

const FlavourProfiles = {
  'sweet': 4,
  'salty': 6,
  'bitter': 8,
  'sour': 10,
  'savoury': 12,
  'weird': 20,
}

const FlavourProfileLabels = {
  [FlavourProfiles.sweet]: "🍬 Sweet",
    [FlavourProfiles.salty]: "🧂 Salty",
    [FlavourProfiles.bitter]: "☕ Bitter",
    [FlavourProfiles.sour]: "🍋 Sour",
    [FlavourProfiles.savoury]: "🧀 Savoury",
    [FlavourProfiles.weird]: "🤢 Weird"
}

async function startRolling() {
  // collect all the dice to be rolled
  const diceSides = buildDiceList();

  // if there are no dice, you can't do anything!
  if (!diceSides.length) {
      document.getElementById('output').innerHTML = "<p class='error-message'>Please pick some dice before rolling.</p>";
      return;
  }

  let dicePool = [...diceSides];
  let mealRating = 0;
  let flavourTotals = {
    [FlavourProfiles.sweet]: 0,
    [FlavourProfiles.salty]: 0,
    [FlavourProfiles.bitter]: 0,
    [FlavourProfiles.sour]: 0,
    [FlavourProfiles.savoury]: 0,
    [FlavourProfiles.weird]: 0
  }

  async function rollSequence() {
    // clear the output for the new result
    document.getElementById('output').innerHTML = "";
    showPan();

    // while more than a single dice in the pool remains, keep rolling
    while (dicePool.length >= 2) {
      /* roll the dice, resulting in an array like:
        [{ type: 4, rollValue: 2 }, { type: 4, rollValue: 3 }, { type: 6, rollValue: 6 }, { type: 8, rollValue: 3 }]
      */
      const dicePoolResults = dicePool.map(s => ({ type: s, rollValue: rollDie(s) }));
      const rollResults = dicePoolResults.map(d => d.rollValue);

      /* collect all the roll values together - from the example above, it would become:
        {
          '2': [{ type: 4, rollValue: 2 }],
          '3': [{ type: 4, rollValue: 3 },{ type: 8, rollValue: 3 }],
          '6': [{ type: 6, rollValue: 6 }]
        }
      */
      let counts = {};
      dicePoolResults.forEach(diceRoll => {
        const prevousValue = counts[diceRoll.rollValue] || [];
        counts[diceRoll.rollValue] = [...prevousValue, diceRoll];
      });

      // get list of values that are pairs - ex. ['3']
      const pairs = Object.keys(counts).filter(v => counts[v].length >= 2);

      // pan flip while loading
      await flip(dicePool);

      // if pairs were found, add them to the total and remove those dice from the dice pool
      if (pairs.length > 0) {
        pairs.forEach(rollValue => {
          const numberOfTimesRolled = counts[rollValue].length;
          const numberOfPairs = Math.floor(numberOfTimesRolled / 2);
          const rollValueAsNumber = Number(rollValue)

          // add all pairs onto the meal rating
          mealRating += (rollValueAsNumber * numberOfPairs);

          // remove pairs from the dice to be rolled next time
          const numberOfDiceToRemove = numberOfPairs * 2;

          const rollsToRemove = counts[rollValue].slice(0, numberOfDiceToRemove);
          rollsToRemove.forEach(roll => {
            // add roll value to the flavour totals
            flavourTotals[roll.type] = flavourTotals[roll.type] + roll.rollValue;

            // remove the dice pool
            const indexToRemove = dicePool.findIndex(diceType => diceType === roll.type);
            dicePool.splice(indexToRemove, 1);
          });
        });

      // if no pair was found, remove lowest roll value
      } else {
        const lowestRolledValue = findMinimum(rollResults);
        const firstIndexOfDieWithRollValue = dicePoolResults.findIndex(dicePoolResult => dicePoolResult.rollValue === lowestRolledValue);
        dicePool.splice(firstIndexOfDieWithRollValue, 1);
      }
    }

    // find most prominent flavour
    const flavours = Object.keys(flavourTotals).map(flavourVal => ({ flavour: FlavourProfileLabels[flavourVal], value: flavourTotals[flavourVal] }))
    console.log('**********flavourTotals', flavourTotals);
    console.log('**********flavours', flavours);
    let total = 0;
    flavours.forEach(flavour => {
      total += flavour.value;
    })
    const flavourPercents = flavours.map(f => ({ flavour: f.flavour, percent: Number(((f.value / total) * 100).toFixed(0)) }));
    console.log('**********flavourPercents', flavourPercents);

    // show the result
    const resultHtml = `
    <div class="flavour-profile">
    <div class="flavour-profile-pie" style="background-image:conic-gradient(
      #f398c3 0%,
      #f398c3 ${flavourPercents[0].percent}%,
      #fafafa ${flavourPercents[0].percent}%,
      #fafafa ${flavourPercents[0].percent + flavourPercents[1].percent}%,
      #78461f ${flavourPercents[0].percent + flavourPercents[1].percent}%,
      #78461f ${flavourPercents[0].percent + flavourPercents[1].percent + flavourPercents[2].percent}%,
      #f4d730 ${flavourPercents[0].percent + flavourPercents[1].percent + flavourPercents[2].percent}%,
      #f4d730 ${flavourPercents[0].percent + flavourPercents[1].percent + flavourPercents[2].percent + flavourPercents[3].percent}%,
      #f44e24 ${flavourPercents[0].percent + flavourPercents[1].percent + flavourPercents[2].percent + flavourPercents[3].percent}%,
      #f44e24 ${flavourPercents[0].percent + flavourPercents[1].percent + flavourPercents[2].percent + flavourPercents[3].percent + flavourPercents[4].percent}%,
      #23b247 ${flavourPercents[0].percent + flavourPercents[1].percent + flavourPercents[2].percent + flavourPercents[3].percent + flavourPercents[4].percent}%,
      #23b247 ${flavourPercents[0].percent + flavourPercents[1].percent + flavourPercents[2].percent + flavourPercents[3].percent + flavourPercents[4].percent + flavourPercents[5].percent}%
    );"></div>
      <div class="flavour-legend">
        <div class="legend-item">
          <div class="legend-item"><div class="legend-colour" style="background-color:#f398c3;"></div><span>${flavourPercents[0].flavour}: ${flavourPercents[0].percent}%</span></div>
        </div>
        <div class="legend-item">
          <div class="legend-item"><div class="legend-colour" style="background-color:#fafafa;"></div><span>${flavourPercents[1].flavour}: ${flavourPercents[1].percent}%</span></div>
        </div>
        <div class="legend-item">
          <div class="legend-item"><div class="legend-colour" style="background-color:#78461f;"></div><span>${flavourPercents[2].flavour}: ${flavourPercents[2].percent}%</span></div>
        </div>
        <div class="legend-item">
          <div class="legend-item"><div class="legend-colour" style="background-color:#f4d730;"></div><span>${flavourPercents[3].flavour}: ${flavourPercents[3].percent}%</span></div>
        </div>
        <div class="legend-item">
          <div class="legend-item"><div class="legend-colour" style="background-color:#f44e24;"></div><span>${flavourPercents[4].flavour}: ${flavourPercents[4].percent}%</span></div>
        </div>
        <div class="legend-item">
          <div class="legend-item"><div class="legend-colour" style="background-color:#23b247;"></div><span>${flavourPercents[5].flavour}: ${flavourPercents[5].percent}%</span></div>
        </div>
      </div>
    </div>
    <div class="result-container"><p id="result" class="final-output"><strong>Final Meal Rating:</strong> ${mealRating}</p></div>
    `
    document.getElementById('output').innerHTML = resultHtml;

    // scroll to the result
    document.getElementById('result').scrollIntoView({ behavior: "smooth", block: "start" })
  }

  await rollSequence();
  hidePan();
}
