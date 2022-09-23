import { Router } from 'itty-router'
const calendars = require('./calendars')
// const ejs = require('ejs');

// Create a new router
const router = Router()


const GetCalendar = function(request) {
  var group = request.params.group;
  var team = request.params.team;
  let ics = calendars.GetCalendar(group,team);

  let response = new Response(ics);  
  response.headers.set('Content-Type', 'text/calendar')  
  return response;
}

const index = function(request) {
  const groups = ["a", "b", "c", "d", "e", "f", "g"];
  const teamsByGroup = calendars.scrapper.getTeamsByGroup(groups);  
  
  //let content = ejs.render('pages/choose.ejs',{"groups" : groups, "teamsByGroup" : teamsByGroup});
  let response = new Response('<html><body><h1>fuck !</h1></body></html>');  
  response.headers.set('Content-type','text/html');
  //response.render('pages/choose.ejs',{"groups" : groups, "teamsByGroup" : teamsByGroup});
  return response;
}


/*
Our index route, a simple hello world.
*/
// router.get("/", (request) => {
//   return new Response("Hello, world! This is the root page of your Worker template.")
// })
router.get('/', index);

/*
This route demonstrates path parameters, allowing you to extract fragments from the request
URL.

Try visit /example/hello and see the response.
*/
router.get("/example/:text", ({ params }) => {
  // Decode text like "Hello%20world" into "Hello world"
  let input = decodeURIComponent(params.text)

  // Construct a buffer from our input
  let buffer = Buffer.from(input, "utf8")

  // Serialise the buffer into a base64 string
  let base64 = buffer.toString("base64")

  // Return the HTML with the string to the client
  return new Response(`<p>Base64 encoding: <code>${input} : ${base64}</code></p>`, {
    headers: {
      "Content-Type": "text/html"
    }
  })
})

router.get('/calendars/:group/:team', GetCalendar)



/*
This is the last route we define, it will match anything that hasn't hit a route we've defined
above, therefore it's useful as a 404 (and avoids us hitting worker exceptions, so make sure to include it!).

Visit any page that doesn't exist (e.g. /foobar) to see it in action.
*/
router.all("*", () => new Response("404, not found!", { status: 404 }))

/*
This snippet ties our worker to the router we deifned above, all incoming requests
are passed to the router where your routes are called and the response is sent.
*/
addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
