import { Router } from 'itty-router'
import calendars from './calendars'

const router = Router()

const GetCalendar = async function(request) {
    var group = request.params.group
    var team = request.params.team
    let ics = await calendars.GetCalendar(group, team)

    let response = new Response(ics)
    response.headers.set('Content-Type', 'text/calendar')
    return response
}

const index = async function(request) {
  console.log("INDEX => getting asset index.html");
    return await GetAsset('index.html')
}

const getGroups = async function(request) {
    
    console.log(`loading groups`)

    const teamsByGroup = await calendars.scrapper.getTeamsByGroup(
        ['a','b','c','d','e','f'],
        true
    );
    console.log('groups ::: ',teamsByGroup);
    let response = new Response(JSON.stringify(teamsByGroup))
    response.headers.set('Content-type', 'application/json')
    return response
}

const GetAssetHandler = async function(request) {
    const assetName = request.params.name
    return await GetAsset(assetName)
}

const GetAsset = async function(assetName) {
    const assets = await DEVASSETS.list()
    console.log('asset list', assets)
    const items = assetName.split('.')
    const name = items[0]
    const extension = items[1]

    let matches = assets.keys.filter(
        x => x.name.startsWith(name) && x.name.endsWith(extension)
    )
    console.log(`found assets that matches ${assetName} :`,matches);

    if (matches && matches.length > 0) {
        assetName = matches[0].name;
        console.log(`getting ${assetName} from KV`);

        const assetBody = await DEVASSETS.get(assetName)
        if (assetBody) {
          console.log(`${assetName} found in KV`);
          console.log(assetBody);
            let response = new Response(assetBody)
            if (assetName.endsWith('.html')) {
              console.log('asset is html');
                response.headers.set('Content-type', 'text/html')
            } else if (assetName.endsWith('.css')) {
                response.headers.set('Content-type', 'text/css')
                console.log('asset is css');
            } else if (assetName.endsWith('.js')) {
              console.log('asset is javascript');
                response.headers.set('Content-type', 'text/javascript')
            } else {
              console.log('asset is plain text');
                response.headers.set('content-type', 'text/plain')
            }
            return response;
        } else {
          console.log(`${assetName} not found in KV`);
            new Response(`404, ${assetName} not found!`, { status: 404 })
        }
    } else {
      console.log(`no asset match ${assetName} in KV`);
        new Response(`404, ${assetName} not found!`, { status: 404 })
    }
}

router.get('/', index)

router.get('/calendars/:group/:team', GetCalendar)

router.get('/groups', getGroups)

// router.get('/table', table)

router.get('/assets/:name', GetAssetHandler)

router.get('/table',table);

router.all('*', () => new Response('404, not found!', { status: 404 }))


export default {
  async fetch(request, environment, context) {
    return router.handle(request, environment, context);
  },
  async scheduled(controller, environment, context) {
    // await doATask();
  }
}
