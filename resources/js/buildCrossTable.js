'use strict';

function buildTable(nodes, tableId) {
	
	// local serialization helper functions
	function escape(text) {
		return text.toString().replaceAll("'", "&apos;").replaceAll('"', "&quot;");
	}
	
	function buildTHCell(textData, id) {
		return $("<th title='" + escape(textData[id]) + "'>" + id + "</th>");
	}
	function buildTDCell(currentBigrams, comparableBigrams) {
		let commonBigrams = getCommon(currentBigrams, comparableBigrams);
		let currentValue = commonBigrams.length / currentBigrams.length;
		let currentPercentage = parseFloat( 100 * currentValue ).toFixed(1) + "%";
		return $("<td title='" + escape(commonBigrams) + "'>" + currentPercentage + "</td>");
	}
	
	// main function
	let textData = {};
	let bigramData = {};
	for (let i = 0; i < nodes.length; i++) {
	  textData[nodes[i].id] = nodes[i].text;
	  bigramData[nodes[i].id] = getBigrams(normalizeText(nodes[i].text));
	}
	
	let table = $("<table id='" + tableId + "'></table>");
	let header = $("<tr/>");
	header.append("<th/>");
	Object.keys(textData).sort().forEach(function(id) {
		header.append(buildTHCell(textData, id));
	});
	table.append(header);

	Object.keys(textData).sort().forEach(function(firstId) {
		let row = $("<tr/>");
		row.append(buildTHCell(textData, firstId)); // add left header
		
		let currentBigrams = bigramData[firstId];
		Object.keys(textData).sort().forEach(function(secondId) {
			row.append(buildTDCell(currentBigrams, bigramData[secondId]));
		});
		table.append(row);
	});
	
	return table;
}
