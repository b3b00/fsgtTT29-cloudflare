const cheerio = require("cheerio");
const moment = require("moment");

//const request = require("sync-request");
const fs = require("fs");

const groupe_url_schema = "http://t2t.29.fsgt.org/groupe/groupe";

const team_url_schema = "http://t2t.29.fsgt.org/equipe";

// http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt

/* utf.js - UTF-8 <=> UTF-16 convertion
 *
 * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */

const Utf8ArrayToStr = function(array) {
  var out, i, len, c;
  var char2, char3;

  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(
          ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0)
        );
        break;
    }
  }
  return out;
};

const iCalendarGeneration = {
  /*
   * format match name
   */
  getMatchLabel: function(match, team) {
    if (match.local == team.Name) {
      return (
        "FSGT : "+(match.day.replace("\t", "") +
        " " +
        match.remote.replace("\t", "") +
        " (dom.)")
      );
    } else {
      return (
        "FSGT : "+(match.day.replace("\t", "") +
        " " +
        match.local.replace("\t", "") +
        " (ext.)")
      );
    }
  },

  getTeam: function(teams, teamName) {
    for (let i = 0; i < teams.length; i++) {
      if (
        teams[i].Name == teamName ||
        fsgtScrapper.shortName(teams[i]) == teamName
      ) {
        return teams[i];
      }
    }
    return null;
  },

  getLocalTeamWeekDay: function(day) {
    let mapping = {
      lundi: 0,
      mardi: 1,
      mercredi: 2,
      jeudi: 3,
      vendredi: 4,
      samedi: 5,
      dimanche: 6
    };
    return mapping[day]+1;
  },

  /*
   * format match date
   */
  getMatchDate: function(match, teams) {
    let localTeam = this.getTeam(teams, match.local);
    let d = moment(match.date, "DD/MM/YYYY");
    let dayInWeek = d.weekday();
    let localTeamDay = this.getLocalTeamWeekDay(localTeam.Day);
    if (dayInWeek < localTeamDay) {
      d.add(localTeamDay - dayInWeek, "days");
    } else if (dayInWeek > localTeamDay) {
      d.subtract(dayInWeek - localTeamDay, "days");
    }

    let dateStr = d.format("YYYYMMDDT");

    return dateStr;
  },

  /*
   * write a match event to ics file
   */
  writeMatchEvent: function(calFile, match, teams, team) {
    fs.appendFileSync(calFile, "\r\nBEGIN:VEVENT\r\n");
    fs.appendFileSync(calFile, "\r\nX-WR-TIMEZONE:Europe/Paris\r\n");
    fs.appendFileSync(calFile,"UID:"+crypto.randomUUID().toUpperCase()+"\r\n");
    let date = this.getMatchDate(match, teams);
    fs.appendFileSync(calFile, "DTSTART;TZID=/Europe/Paris:" + date + "203000\r\n");
    fs.appendFileSync(calFile, "DTEND;TZID=/Europe/Paris:" + date + "220000\r\n");
    let lbl = this.getMatchLabel(match, team);
    fs.appendFileSync(calFile, "SUMMARY:" + lbl + "\r\n");
    fs.appendFileSync(calFile, "DESCRIPTION:" + lbl + "\r\n");
    fs.appendFileSync(calFile, "END:VEVENT\r\n");
  },

  getICS: function(matches, group, teams, team) {
    let content = "";

    content += "BEGIN:VCALENDAR\r\n";
    content += "X-WR-CALNAME:FSGT\r\n";
    content += "VERSION:2.0\r\n";
    for (let l = 0; l < matches.length; l++) {
      let m = matches[l];
      if (m.local == team.Name || m.remote == team.Name) {
        content += this.getMatchEvent(m, teams, team);
      }
    }
    content += "END:VCALENDAR\r\n";
    return content;
  },

  getMatchEvent: function(match, teams, team) {
    let content = "\r\nBEGIN:VEVENT\r\n";
    // content += "\r\nX-WR-TIMEZONE:Europe/Paris\r\n";
    let date = this.getMatchDate(match, teams);
    content += "DTSTART;TZID=/Europe/Paris:" + date + "203000\r\n";
    content +="UID:"+crypto.randomUUID().toUpperCase()+"\r\n";
    content += "DTEND;TZID=/Europe/Paris:" + date + "220000\r\n";
    let lbl = this.getMatchLabel(match, team);
    content += "SUMMARY:" + lbl + "\r\n";
    content += "DESCRIPTION:" + lbl + "\r\n";
    content += "END:VEVENT\r\n";
    return content;
  },

  /*
   * write ics file for a team
   */
  writeCalendar: function(matches, group, teams, team) {
    let calFile =
      "calendars/" +
      group +
      "/" +
      team.Name.replace(" ", "").toLocaleLowerCase() +
      ".ics";

    let dir = "./calendars";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    dir = "./calendars/" + group;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.writeFileSync(calFile, getICS(matches, group, teams, team));
  }
};

const scrapper = {
  /*
   * from a node (node) extract all child node with name == tagName
   * apply mapping to create an object :
   * mmaping is an associative map int -> attribute name.
   * for each mapping i -> attributeName: select the ith child node and extract
   * value to attibuteName attribute in the resulting object.
   * Usefull to selectively extract data from a row to an object.
   */
  extractInnerTagsValueToObject: function(
    tagName,
    mapping,
    node,
    acceptMissingItems
  ) {
    let object = {};

    let chs = node.childNodes;
    let k = 0;
    for (let j = 0; j < chs.length; j++) {
      let child = chs[j];
      if (child.type == "tag" && child.name == tagName) {
        if (mapping["" + k] !== undefined) {
          if (child.childNodes[0] != undefined && child.childNodes[0] != null) {
            object[mapping["" + k]] = child.childNodes[0].data;
          } else {
            j++;
            if (!acceptMissingItems) {
              // object = null;
              return null;
            }
          }
        }
        k++;
      }
    }
    return object;
  },

  etxractdataFromNodeArray: function(html, selector) {
    let values = Array();
    let content = cheerio.load(html);
    let nodes = content(selector);
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      name = node.childNodes[0].data;
      values.push(name);
    }
    return values;
  }
};

 const fsgtScrapper = {
  getTeamDay: async function(team) {
    let url =
      "http://t2t.29.fsgt.org/equipe/" + team.replace(/ /g, "-").toLowerCase();

    console.log(`loading team ${team} from ${url}`);

    let res = await fetch(url);
    console.log("...");
    let day = "";

    console.log(`team (${team}) fetch done : ${res.status}`);

    if (res.status == 200) {
      let html = await res.text();

      console.log(`**************************************`)
      console.log(`***                                 **`)
      console.log(`*** ${team}`)
      console.log(`***                                 **`)
      //fs.writeFileSync(`c:/temp/${team.replace(/ /g, "-").toLowerCase()}.html`,content);
//      console.log(`content :\n[${html}]`);
      console.log(`**************************************`)
      console.log(`**************************************`)
      let i = html.indexOf("Reçoit le ");
      if (i > 0) {
        console.log(`[${team}] : pattern found.`)
        html = html.substring(i);
        i = html.indexOf("<");
        html = html.substring(0, i);
        html = html.trim().replace(".", "");
        let words = html.split(" ");

        day = words[words.length - 1];
        console.log(`[${team}] : day found => ${day}`);
      } 
      else {
        console.log(`[${team}] : pattern not found`);
      }
    }
    return day;
  },

  shortName(team) {
    return team != null ? team.Name.replace(" ", "").toLocaleLowerCase() : "";
  },

  /*
   * get the teams
   */

   

  getTeams: async function(html, light) {
    let teamNames = scrapper.etxractdataFromNodeArray(
      html,
      "div#classement table tr td.nom"
    );
    let teams = [];

    for (let i = 0; i < teamNames.length; i++) {
      let team = {};
      team.Name = teamNames[i];
      if (!light) {
        console.log(`loading playing day for ${team.Name}`)
        const d = await fsgtScrapper.getTeamDay(team.Name);
        console.log(`getTeamDay(${team.Name}) => ${d}`)
        team.Day = d;
      }
      teams.push(team);
    }

    return teams;
  },

  getTeamsByGroup: async function(groups,light) {
    let teamsGrouped = {};
    for (let i = 0; i < groups.length; i++) {
      let url = groupe_url_schema + "-" + groups[i];
      
      if (groups[i] == "a") {
        url = groupe_url_schema;
      }
      console.log(`loading group ${groups[i]} from ${url}`);
      let res = await fetch(url);

      console.log(`group ${groups[i]} fetch done ${res.status}`);
      if (res.status == 200) {
        let html = await res.text();

        let teams = await fsgtScrapper.getTeams(html,light);        
        console.log(`${teams.length} teams found:`);
        console.log(teams);
        teamsGrouped[groups[i]] = teams;        
      }      
    }
    return teamsGrouped;
  },

  extractMatchFromRow: function(row) {
    let mapping = {
      "0": "day",
      "1": "date",
      "5": "local",
      "8": "remote"
    };

    let match = scrapper.extractInnerTagsValueToObject(
      "td",
      mapping,
      row,
      false
    );

    return match;
  },

  /*
   * get the matches
   */
  getMatches: function(html) {
    let content = cheerio.load(html);
    let matches = content("div#matchs table.matchs tr.match");
    let matchArray = Array();

    for (let i = 0; i < matches.length; i++) {
      let day = matches[i];
      let match = {};

      match = this.extractMatchFromRow(day);

      if (match != null) {
        matchArray.push(match);
      }
    }
    return matchArray;
  }
};

/*
 * main call
 */

let groups = ["a", "b", "c", "d", "e", "f", "g"];

module.exports.scrapper = fsgtScrapper;

module.exports.GetCalendar = async function(group, team) {
  let url = groupe_url_schema + "-" + group;

  if (group == "a") {
    url = groupe_url_schema;
  }
console.log(`fetch calendar for ${team} in ${group} from ${url}`)
  let res = await fetch(url);
console.log(`calendar fetch done ${res.status} - ${res.statusText}`)
  if (res.status == 200) {
    let html =await res.text();

    let teams = await fsgtScrapper.getTeams(html,false);
    console.log(`found ${teams.length} teams in group ${team} (for team ${team})`);
    let matchArray = fsgtScrapper.getMatches(html);

    if (team != null) {
      let te = iCalendarGeneration.getTeam(teams, team);
      console.log(`team ${team} object :`,te);
      if (te != null) {
        console.log(`generating ICS for ${team}`);
        return iCalendarGeneration.getICS(matchArray, group, teams, te);
      }
      console.log(`team object for ${team} not found in `,teams);
    }
    console.log('team is null !');
    return null;
  }

  module.exports.downloadGroup = async function(group, team) {
    let url = groupe_url_schema + "-" + group;

    if (group == "a") {
      url = groupe_url_schema;
    }

    console.log(`download group ${group} from ${url}`);
    let res = await fetch(url);

    if (res.status == 200) {
      let html =await res.text();

      let teams = fsgtScrapper.getTeams(html);

      let matchArray = fsgtScrapper.getMatches(html);

      if (team != null) {
        let te = iCalendarGeneration.getTeam(teams, team);
        if (te != null) {
          iCalendarGeneration.writeCalendar(matchArray, group, teams, te);
        }
      } else {
        for (let t = 0; t < teams.length; t++) {
          iCalendarGeneration.writeCalendar(matchArray, group, teams, teams[t]);
        }
      }
    } else {
      console.log("error on (" + group + ") : " + url);
    }
  };
};

