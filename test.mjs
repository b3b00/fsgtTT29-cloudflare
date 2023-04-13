//import calendars from './calendars'

//const calendars = require("./calendars");

import calendars from './calendars.mjs';


const stq3='stadequilbignonnais 3';

const cal = await calendars.GetCalendar('d',stq3);

console.log(cal);

// let day = moment("06/10/2022","DD/MM/YYYY");

// const getLocalTeamWeekDay = function(day) {
//     let mapping = {
//       lundi: 0,
//       mardi: 1,
//       mercredi: 2,
//       jeudi: 3,
//       vendredi: 4,
//       samedi: 5,
//       dimanche: 6
//     };
//     return mapping[day]+1;
//   }

//   const test =  function(date, day, shouldBe) {
//     console.log(day);
//   let d = moment(date,"DD/MM/YYYY");
//   let dayInWeek = d.weekday();
//   let localTeamDay = getLocalTeamWeekDay(day);
//   console.log(`localteamday = ${localTeamDay}`)
//   if (dayInWeek < localTeamDay) {
//     // console.log(`adding ${localTeamDay} - ${dayInWeek} + 1 = ${localTeamDay - dayInWeek + 1} days`);
//     d.add(localTeamDay - dayInWeek, "days");
//   } else if (dayInWeek > localTeamDay) {
//     // console.log(`substracting ${dayInWeek} - ${localTeamDay}  = ${dayInWeek - localTeamDay - 1} days`);
//     d.subtract(dayInWeek - localTeamDay , "days");
//   }

//   let dateStr = d.format("DD/MM/YYYY");
//   console.log(`should be ${shouldBe} : ${dateStr}`);
//   console.log("");
  
// }




// test("13/10/2022","lundi","10/10/2022");
// test("13/10/2022","mardi","11/10/2022");
// test("13/10/2022","mercredi","12/10/2022");
// test("13/10/2022","jeudi","13/10/2022");
// test("13/10/2022","vendredi","14/10/2022");
// test("13/10/2022","samedi","15/10/2022");
// test("13/10/2022","dimanche","16/10/2022");
