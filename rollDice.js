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

function startRolling() {
  // collect all the dice to be rolled
  const diceSides = buildDiceList();

  // if there are no dice, you can't do anything!
  if (!diceSides.length) {
      document.getElementById('output').innerHTML = "<p>Please enter some dice.</p>";
      return;
  }

  let dicePool = [...diceSides];
  let mealRating = 0;
  let flavourList = [0, 0, 0, 0, 0, 0]; // [sweet, salty, bitter, sour, savoury, weird]

  async function rollSequence() {
    // clear the output for the new result
    document.getElementById('output').innerHTML = "";

    // while more than a single dice in the pool remains, keep rolling
    while (dicePool.length >= 2) {
      /* roll the dice, resulting in an array like:
        [{ type: 4, rollValue: 2 }, { type: 4, rollValue: 3 }, { type: 6, rollValue: 6 }, { type: 8, rollValue: 3 }]
      */
      const dicePoolResults = dicePool.map(s => ({ type: s, rollValue: rollDie(s) }));
      const rollResults = dicePoolResults.map(d => d.rollValue);

      console.log('******* Dice Results:', dicePoolResults)

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

      console.log('******* Counts:', counts);

      // get list of values that are pairs - ex. ['3']
      const pairs = Object.keys(counts).filter(v => counts[v].length >= 2);

      console.log('******* Pairs:', pairs);

      // dice shake before result
      document.body.classList.add("shake");
      await delay(400);
      document.body.classList.remove("shake");
      await delay(400);

      // if pairs were found, add them to the total and remove those dice from the dice pool
      if (pairs.length > 0) {
        console.log('******* Found Pairs!');
        pairs.forEach(rollValue => {
          const numberOfTimesRolled = counts[rollValue].length;
          const numberOfPairs = Math.floor(numberOfTimesRolled / 2);
          const rollValueAsNumber = Number(rollValue)

          // add all pairs onto the meal rating
          mealRating += (rollValueAsNumber * numberOfPairs);

          // remove pairs from the dice to be rolled next time
          const numberOfDiceToRemove = numberOfPairs * 2;
          console.log('******* Number of dice to remove:', numberOfDiceToRemove);

          const rollsToRemove = counts[rollValue].slice(0, numberOfDiceToRemove);
          console.log('******* Rolls to remove:', rollsToRemove);
          rollsToRemove.forEach(roll => {
            const indexToRemove = dicePool.findIndex(diceType => diceType === roll.type);
            dicePool.splice(indexToRemove, 1);
          });
        });

      // if no pair was found, remove lowest roll value
      } else {
        console.log('******* No Pairs!');
        const lowestRolledValue = findMinimum(rollResults);
        console.log('******* Lowest rolled value:', lowestRolledValue);
        const firstIndexOfDieWithRollValue = dicePoolResults.findIndex(dicePoolResult => dicePoolResult.rollValue === lowestRolledValue);
        console.log('******* Index to remove:', firstIndexOfDieWithRollValue);
        dicePool.splice(firstIndexOfDieWithRollValue, 1);
      }

      console.log('******* Remaining Dice:', dicePool);
      console.log('******************************************')
      console.log('******************************************')
      console.log('******************************************')
    }

    // let tableHTML = `<table><tr><th>Round</th><th>Action</th><th>Meal Rating Gain</th><th>Dice Pool</th></tr>`;
    // for (let row of results) {
    //     tableHTML += `<tr>
    //         <td>${row[0]}</td>
    //         <td>${row[1]}</td>
    //         <td>${row[2]}</td>
    //         <td>${row[3].join(", ")}</td>
    //     </tr>`;
    // }
    // tableHTML += `</table><div id="result-container"><p id="result" class="final-output"><strong>Final Meal Rating:</strong> ${mealRating}</p></div>`;
    let resultHtml = `<div id="result-container"><p id="result" class="final-output"><strong>Final Meal Rating:</strong> ${mealRating}</p></div>`
    document.getElementById('output').innerHTML = resultHtml;

    document.getElementById('result').scrollIntoView({ behavior: "smooth", block: "start" })
  }

  rollSequence();
}
