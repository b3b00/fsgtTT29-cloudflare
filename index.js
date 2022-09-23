import { Router } from 'itty-router'
import calendars from './calendars'
import { getTemplate } from './Template'
import * as fs from 'fs';

const router = Router()

const groups = `
<option value='a'>a</option>
<option value='b'>b</option>
<option value='c'>c</option>
<option value='d'>d</option>
<option value='e'>e</option>
<option value='f'>f</option>`;


const GetCalendar = async function(request) {
  var group = request.params.group;
  var team = request.params.team;
  let ics = await calendars.GetCalendar(group,team);

  let response = new Response(ics);  
  response.headers.set('Content-Type', 'text/calendar')  
  return response;
}

const index = async function(request) {
  let template = getTemplate();
  const groups = `
<option value='a'>a</option>
<option value='b'>b</option>
<option value='c'>c</option>
<option value='d'>d</option>
<option value='e'>e</option>
<option value='f'>f</option>`;
  const teamsByGroup = await calendars.scrapper.getTeamsByGroup(['a','b','c','d','e','f']);  
  template = template.replace("<%=teamsByGroup%>",JSON.stringify(teamsByGroup));
  template = template.replace("<%=groupsOptions%>",groups);
  let response = new Response(template);  
  response.headers.set('Content-type','text/html');
  return response;
}



router.get('/', index);


router.get('/calendars/:group/:team', GetCalendar)


router.all("*", () => new Response("404, not found!", { status: 404 }))


addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})

