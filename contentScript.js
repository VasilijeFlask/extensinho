// ======================
// GLOBAL DATA
// ======================

const dataPairs = [];
const targetHeaders = [
  'Winner',
  'Map handicap',
  'Map 1 - winner',
  'Map 2 - winner',
  'Map 3 - winner',
  'Map 4 - winner',
  'Map 5 - winner',
  'Map 1 - winner (Incl. Overtime)',
  'Map 2 - winner (Incl. Overtime)',
  'Map 3 - winner (Incl. Overtime)',
  'Map 4 - winner (Incl. Overtime)',
  'Map 5 - winner (Incl. Overtime)',
];

// ======================
// UTILITY FUNCTIONS
// ======================

/**
 * Computes the new odds X and Y based on the old odds.
 */
function computeOdds(odds1, odds2) {
  const o1 = parseFloat(odds1);
  const o2 = parseFloat(odds2);

  const M = (1 / o1) + (1 / o2) - 1;
  const X = parseFloat(((2 * o1) / (2 - (M * o1))).toFixed(3));
  const Y = parseFloat(((2 * o2) / (2 - (M * o2))).toFixed(3));

  return [X, Y];
}

/**
 * Creates or updates the div for the computed odds.
 */
function handleDivCreationOrUpdate(targetDiv, data) {
  const existingComputedOdds = targetDiv.nextSibling && targetDiv.nextSibling.classList.contains('computed-odds');
  let newDiv;

  if (existingComputedOdds) {
    newDiv = targetDiv.nextSibling;
  } else {
    newDiv = document.createElement('div');
    newDiv.className = 'computed-odds';
  }

  newDiv.textContent = `${data.header}: ${data.odds[0]} -------------------------------------------------------------------- ${data.odds[1]}`;

  if (!existingComputedOdds) {
    if (targetDiv.nextSibling) {
      targetDiv.parentNode.insertBefore(newDiv, targetDiv.nextSibling);
    } else {
      targetDiv.parentNode.appendChild(newDiv);
    }
  }
}

/**
 * Process the given odds and store in dataPairs.
 */
function processOdds(header, oddsList) {
  for (let i = 0; i < oddsList.length; i += 2) {
    let [odd1, odd2] = [parseFloat(oddsList[i]), parseFloat(oddsList[i+1])];
    if (!isNaN(odd1) && !isNaN(odd2)) {
      let M = 1 / odd1 + 1 / odd2 - 1;
      let X = (2 * odd1) / (2 - (M * odd1));
      let Y = (2 * odd2) / (2 - (M * odd2));
      
      X = parseFloat(X.toFixed(3));
      Y = parseFloat(Y.toFixed(3));

      dataPairs.push({
        header: `${header}${i/2 + 1}`,
        odds: [X, Y]
      });
    }
  }
}

// ======================
// CORE PROCESSING FUNCTIONS
// ======================

/**
 * Process a single target div and update associated elements.
 */
function processDiv(targetDiv) {
  let nameTag = targetDiv.querySelector('h6');
  let numberTags = Array.from(targetDiv.querySelectorAll('.css-lkx2y'));
  
  if (nameTag) {
    let header = nameTag.textContent.trim();
    if (!targetHeaders.includes(header)) return;

    let oddsList = [];
    numberTags.forEach(numberTag => {
      const value = numberTag.textContent.trim();
      if (!isNaN(value)) {
        oddsList.push(value);
      }
    });

    for (let i = 0; i < oddsList.length; i += 2) {
      let oddsPair = computeOdds(oddsList[i], oddsList[i + 1]);
      if (oddsPair) {
        const newEntry = {
          header: `${header}${i / 2 + 1}`,
          odds: oddsPair
        };
        handleDivCreationOrUpdate(targetDiv, newEntry);
        dataPairs.push(newEntry);
      }
    }
  }
}

/**
 * Iterates through relevant divs, updating dataPairs and the DOM.
 */
function updateDataPairs() {
  dataPairs.length = 0;
  document.querySelectorAll('.css-gt4orj').forEach(processDiv);
  console.log(dataPairs);
}

// ======================
// OBSERVER SETUP
// ======================

const observer = new MutationObserver(mutationsList => {
  for (let mutation of mutationsList) {
    if (mutation.target.classList.contains('css-gt4orj') || 
        mutation.target.closest('.css-gt4orj')) {
      updateDataPairs();
    }
  }
});

observer.observe(document, { childList: true, subtree: true, attributes: true });
