 
const myArgs = process.argv.slice(2);
const firebasedb = require('./setupFirebase');

const addZips = () => {
  const zip = myArgs.splice(0,1)[0];
  console.log(zip);
  myArgs.forEach((district)=>{
    let toPush = {
      dis: district.split('-')[1],
      abr: district.split('-')[0],
      zip: zip,
    };
    console.log(toPush);
    firebasedb.ref(`zipToDistrict/${zip}`).push(toPush);
  });
};

addZips();