import { Application } from 'https://deno.land/x/abc/mod.ts'
import { browse, browseMediaFolder, postMediaFile, prepareBrowser } from './controllers/browser.ts'

const PORT = parseInt(Deno.env.get('PORT') || '8002', 10)

const app = new Application()

await prepareBrowser()

app
  .get('/api/media', browse)
  .get('/api/media/:name', browseMediaFolder)
  .post('/api/media', postMediaFile)
  .start({ port: PORT })
