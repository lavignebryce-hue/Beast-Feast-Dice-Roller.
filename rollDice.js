function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function buildDiceList() {
  let dice = [];
  const sidesList = [4, 6, 8, 10, 12, 20];
  sidesList.forEach(sides => {
      let count = parseInt(document.getElementById(`d${sides}`).value) || 0;
      for (let i = 0; i < count; i++) {
          dice.push(sides);
      }
  });
  return dice;
}

function startRolling() {
  let diceSides = buildDiceList();
  if (!diceSides.length) {
      document.getElementById('output').innerHTML = "<p>Please enter some dice.</p>";
      return;
  }

  let dicePool = diceSides.map(s => rollDie(s));
  let mealRating = 0;
  let roundNumber = 1;
  let results = [];

  function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  async function rollSequence() {
      document.getElementById('output').innerHTML = "";
      while (dicePool.length >= 2) {
          let table = document.querySelector("table");
          let counts = {};
          for (let die of dicePool) counts[die] = (counts[die] || 0) + 1;
          let pairs = Object.keys(counts).filter(v => counts[v] >= 2).map(Number);

          // Dice shake before result
          document.body.classList.add("shake");
          await delay(400);
          document.body.classList.remove("shake");

          if (pairs.length) {
              let highestPair = Math.max(...pairs);
              mealRating += highestPair;
              results.push([roundNumber, `Pair of ${highestPair}'s`, `+${highestPair}`, [...dicePool]]);
              let removed = 0;
              dicePool = dicePool.filter(die => {
                  if (die === highestPair && removed < 2) { removed++; return false; }
                  return true;
              });
          } else {
              let lowest = Math.min(...dicePool);
              results.push([roundNumber, `Dropped ${lowest}`, "+0", [...dicePool]]);
              dicePool.splice(dicePool.indexOf(lowest), 1);
          }

          dicePool = dicePool.map((_, i) => rollDie(diceSides[i]));
          roundNumber++;
      }

      let tableHTML = `<table><tr><th>Round</th><th>Action</th><th>Meal Rating Gain</th><th>Dice Pool</th></tr>`;
      for (let row of results) {
          tableHTML += `<tr>
              <td>${row[0]}</td>
              <td>${row[1]}</td>
              <td>${row[2]}</td>
              <td>${row[3].join(", ")}</td>
          </tr>`;
      }
      tableHTML += `</table><div id="result-container"><p id="result" class="final-output"><strong>Final Meal Rating:</strong> ${mealRating}</p></div>`;
      document.getElementById('output').innerHTML = tableHTML;

      document.getElementById('result').scrollIntoView({ behavior: "smooth", block: "start" })
  }

  rollSequence();
}
