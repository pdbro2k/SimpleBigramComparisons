'use strict';

function normalizeText(text) {
  let normalizedText = text.trim(); // remove leading/trailing whitespace
  normalizedText = text.toLowerCase(); // ignore case
  return normalizedText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("ł", "l"); // ignore diacritics
}

function getBigrams(text) {
  text = " " + text + " "; // wrap with whitespace
  text = text.replaceAll(" ", "#");
  let bigrams = [];
  for (let i = 0; i < text.length - 1; i++) {
    let bigram = text[i] + text[i + 1];
    bigrams.push(bigram);
  }
  return bigrams;
}

function getCommonBigramData(bigramData, relative = true) {	
  let equalBigramData = {};
  for (let firstId in bigramData) {
    let currentEqualBigramData = {};
    for (let secondId in bigramData) {
      if (firstId !== secondId) {
        let value = getCommon(bigramData[firstId], bigramData[secondId]).length;
        if (relative)
          value = value / bigramData[firstId].length
        currentEqualBigramData[secondId] = value;
      }
    }
    equalBigramData[firstId] = currentEqualBigramData;
  }
  return equalBigramData;
}

function buildBigramLinks(nodes) {
  // local helper functions
  function getNestedAverage(nestedData) {
    let sum = 0;
    let count = 0;
    for (let key in nestedData) {
      for (let nestedId in nestedData[key]) {
        count += 1;
        sum += nestedData[key][nestedId];
      }
    }
    return sum / count;
  }

  // main function
  // get bigrams
  let bigramData = {};
  for (let i = 0; i < nodes.length; i++) {
    bigramData[nodes[i].id] = getBigrams(normalizeText(nodes[i].text));
  }

  // get relative equal bigrams
  let commonBigramData = getCommonBigramData(bigramData, false);

  // get the average as an scaling factor
  let scalingFactor = getNestedAverage(commonBigramData);

  // build links
  let links = [];
  for (let key in commonBigramData) {
    for (let nestedId in commonBigramData[key]) {
      let value = commonBigramData[key][nestedId];
      if (value > 0) {
        let normalizedValue = value / scalingFactor;
        links.push({
          'source': key,
          'target': nestedId,
          'strength': normalizedValue
        })
      }
    }
  }
  return links;
}
