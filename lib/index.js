'use strict';

var fs = require('fs');
var _ = require('lodash');

function createDataObjects(file) {
  var trafficData = fs.readFileSync('./data/' + file + '.csv')
                      .toString()
                      .split('\r\n')
                      .map(function(row) { return row.split(',') })

  var headers = _.first(trafficData);
  var data = _.rest(trafficData);

  return _.map(data, function(dataRow){
    return _.zipObject(headers, dataRow);
  });
}

function filterAccidents(incidents, attribute, filter) {
  if (filter) {
    incidents = _.filter(incidents, function(incident){
      return incident['OFFENSE_CATEGORY_ID'] !== filter
    })
  }
  return _.chain(incidents)
          .filter(function(incident) { return incident[attribute]; })
          .groupBy(function(incident) { return incident[attribute]; })
          .map(function(value, key) { return [key, value.length]; })
          .sortBy(function(countByAddress) { return -countByAddress[1]; })
          .slice(0, 5)
          .value();
}

console.time('entire traffic process');
var trafficObjects = createDataObjects('traffic-accidents');
var addressAccidents = filterAccidents(trafficObjects,
                                                   'INCIDENT_ADDRESS');
var neighborhoodAccidents = filterAccidents(trafficObjects,
                                                        'NEIGHBORHOOD_ID');
console.log(addressAccidents);
console.log(neighborhoodAccidents);
console.timeEnd('entire traffic process');

console.time('entire crime process');
var crimeObjects = createDataObjects('crime');
var neighborhoodCrimes = filterAccidents(crimeObjects,
                                                     'NEIGHBORHOOD_ID',
                                                     'traffic-accident');
console.log(neighborhoodCrimes);
console.timeEnd('entire crime process');
