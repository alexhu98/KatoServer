import { Application } from 'https://deno.land/x/abc/mod.ts'
import { browse, browseMediaFolder, postMediaFile, deleteMediaFile } from './controllers/browser.ts'

const PORT = parseInt(Deno.env.get('PORT') || '8002')

const app = new Application()

app
  .get('/api/media', browse)
  .get('/api/media/:name', browseMediaFolder)
  .post('/api/media', postMediaFile)
  .delete('/api/media', deleteMediaFile)
  .start({ port: PORT })
