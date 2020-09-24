import { Application } from 'https://deno.land/x/abc/mod.ts'
import { browse, browseMediaFolder, postMediaFile, deleteMediaFile } from "./controllers/browser.ts"

const app = new Application()

app
  .get('/browse', browse)
  .get('/browse/:name', browseMediaFolder)
  .post('/browse', postMediaFile)
  .delete('/browse', deleteMediaFile)
  .start({ port: 8000 })
