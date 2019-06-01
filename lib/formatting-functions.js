const formattingFunctions = {};

formattingFunctions.formatStateKey = (state, district, chamber) => {
  if (!district) {
    return;
  }
  const regEx = /(\d{2}|\d{1})/g;
  const districtNo = district.match(regEx) ? Number(district.match(regEx)[0]) : NaN;
  const chamberMap = {
    HD: 'lower',
    SD: 'upper',
  };
  const checkedChamber = chamber || chamberMap[district.match(/\w{2}/g)[0]];
  if (!isNaN(districtNo) && checkedChamber) {
    return `${state}-${checkedChamber}-${districtNo}`;
  } 
};

formattingFunctions.formatCongressionalDistrict = (district) => {
  if (district.abr) {
    let state = district.abr;
    let districtNo = district.dis;
    return `${state}-${parseInt(districtNo)}`;
  }
  if (district.split('-').length === 2) {
    let districtNo = parseInt(district.split('-')[1]);
    let stateAbr = district.split('-')[0].toUpperCase();
    if ((districtNo || districtNo === 0) && stateAbr.match(/[A-Z]{2}/g)[0]) {
      return `${stateAbr.match(/[A-Z]{2}/g)[0]}-${parseInt(district.split('-')[1])}`;
    }
  }
  return false;
};

module.exports = formattingFunctions;