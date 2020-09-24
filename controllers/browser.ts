import type { Context } from 'https://deno.land/x/abc/mod.ts'
import type { MediaFolder, MediaFile } from '../models.ts'
import { R } from '../deps.ts'

const DEFAULT_MEDIA_ROOT = 'x:/'
const DEFAULT_STREAMING_ROOT = 'http://192.168.0.78:8001/'
const DEFAULT_FLAG_FOLDER = 'x:/flagged/'
const DEFAULT_MOVE_FOLDER = 'x:/moved/'
const MOVE_ALL_COMMAND = 'x:/ystream/_move_to_all.bat'

const ACTION_FLAG = 'FLAG'
const ACTION_MOVE = 'MOVE'
const ACTION_MOVE_ALL = 'MOVE_ALL'

const getMediaRoot = () => {
  const folder = Deno.env.get('MEDIA_ROOT')
  return R.defaultTo(DEFAULT_MEDIA_ROOT, folder)
}

const getStreamingRoot = () => {
  const folder = Deno.env.get('STREAMING_ROOT')
  return R.defaultTo(DEFAULT_STREAMING_ROOT, folder)
}

const getFlagFolder = () => {
  const folder = Deno.env.get('FLAG_FOLDER')
  return R.defaultTo(DEFAULT_FLAG_FOLDER, folder)
}

const getMoveFolder = () => {
  const folder = Deno.env.get('MOVE_FOLDER')
  return R.defaultTo(DEFAULT_MOVE_FOLDER, folder)
}

const buildMediaFolder = (name: string): MediaFolder => {
  return {
    url: getStreamingRoot() + encodeURIComponent(name),
    name,
  }
}

const parseDuration = (lines: string[]): number => {
  let duration = 0
  R.forEach((line: string) => {
    line = line.trim()
    if (line.includes('.duration=') && !line.endsWith('"N/A"')) {
      // streams.stream.0.duration="7092.492375"
      duration = Math.floor(parseFloat(line.substring(27, line.length - 2)))
    }
    if (line.includes('.tags.DURATION') && !line.endsWith('"N/A"')) {
      // streams.stream.0.tags.DURATION="01:58:12.492000000"
      let tokens = line.split('=')
      if (tokens.length === 2) {
        const timestamp = tokens[1].substring(1, tokens[1].length - 2)
        const [timestamp1, timestamp2] = timestamp.split('.')
        tokens = timestamp1.split(':')
        let hours = 0
        let minutes = 0
        let seconds = 0
        if (tokens.length === 3) {
          hours = parseInt(tokens[0])
          minutes = parseInt(tokens[1])
          seconds = parseInt(tokens[2])
        }
        else if (tokens.length === 2) {
          minutes = parseInt(tokens[0])
          seconds = parseInt(tokens[1])
        }
        else if (tokens.length === 1) {
          seconds = parseInt(tokens[0])
        }
        duration = hours * 3600 + minutes * 60 + seconds
      }
    }
  }, lines)
  // console.log(`parseDuration ->`, duration)
  return duration
}

// TODO: cache the result
const getDuration = async (path: string): Promise<number> => {
  let duration = 0
  // console.log(`getDuration ${path}`)
  // const command = `D:/GoogleDrive/Workspace/AutoRecode/exe/ffprobe.exe -hide_banner -v quiet -show_streams -print_format -flat "${path}"`
  const process = Deno.run({
    cmd: [
      'D:/GoogleDrive/Workspace/AutoRecode/exe/ffprobe.exe',
      '-hide_banner',
      '-v',
      'quiet',
      '-show_streams',
      '-print_format',
      'flat',
      path,
    ],
    cwd: getMediaRoot(),
    stdout: 'piped',
    stderr: 'piped',
  })
  const { success } = await process.status()
  if (success) {
    const text = new TextDecoder().decode(await process.output())
    duration = parseDuration(text.split('\n'))
  }
  process.close()
  return duration
}

const mediaFolders: MediaFolder[] = [
  buildMediaFolder('tstream'),
  buildMediaFolder('ustream'),
  buildMediaFolder('wstream'),
  buildMediaFolder('xstream'),
  buildMediaFolder('ystream'),
  buildMediaFolder('zstream'),
]

export const browse = (ctx: Context) => {
  ctx.json(mediaFolders, 200)
}

export const browseMediaFolder = async (ctx: Context) => {
  const mediaFiles: MediaFile[] = []
  const { name: folderName } = ctx.params
  try {
    const folder = getMediaRoot() + folderName
    // console.log(`browseMediaFolder -> folder`, folder)
    for await (const directory of Deno.readDir(folder)) {
      const { isFile, name } = directory
      // console.log(`forawait -> directory`, directory)
      if (isFile) {
        if (name.endsWith('.mp4') || name.endsWith('.m4')) {
          const path = folder + '/' + name
          const stat = await Deno.lstat(path)
          // console.log(`browseMediaFolder -> stat`, stat)
          if (stat.mtime != null) {
            const mediaFile = {
              url: getStreamingRoot() + encodeURIComponent(folderName) + '/' + encodeURIComponent(name),
              fileSize: stat.size,
              lastModified: stat.mtime.getTime(),
              duration: await getDuration(path),
            }
            mediaFiles.push(mediaFile)
          }
        }
      }
    }
    return ctx.json(mediaFiles, 200)
  }
  catch (ex) {
    console.error(ex)
  }
  return ctx.string(`No such media folder: ${folderName}`, 404)
}

const parseMediaFileName = (url?: string): string[] => {
  let folder = ''
  let name = ''
  if (url) {
    const tokens = url.split('/')
    if (tokens.length > 2) {
      folder = decodeURIComponent(tokens[tokens.length - 2])
      name = decodeURIComponent(tokens[tokens.length - 1])
    }
  }
  return [folder, name]
}

const flagFile = async (path: string): Promise<void> => {
  console.log(`flagFile -> path =`, path)
  const [, name] = parseMediaFileName(path)
  await Deno.rename(path, getFlagFolder() + name)
}

const moveFile = async (path: string): Promise<void> => {
  console.log(`moveFile -> path =`, path)
  const [, name] = parseMediaFileName(path)
  await Deno.rename(path, getMoveFolder() + name)
}

const moveAllFiles = async (): Promise<void> => {
  const command = MOVE_ALL_COMMAND
  console.log(`moveAllFiles ${command}`)
  const process = Deno.run({
    cmd: [command]
  })
  const result = await process.status()
  console.log(`moveAllFiles -> result`, result)
  process.close()
}

export const postMediaFile = async (ctx: Context) => {
  const body: any = await ctx.body
  const { action, url } = body
  const [folder, name] = parseMediaFileName(url)
  const path = getMediaRoot() + folder + '/' + name
  try {
    switch (action) {
      case ACTION_FLAG:
        await flagFile(path)
        break

      case ACTION_MOVE:
        await moveFile(path)
        break

      case ACTION_MOVE_ALL:
        await moveAllFiles()
        break
    }
    return ctx.string(`${action} ${url}`, 200)
  }
  catch (ex) {
    console.error(`postMediaFile ->`, ex)
  }
  return ctx.string(`No such media file: ${url}`, 404)
}

export const deleteMediaFile = async (ctx: Context) => {
  const body: any = await ctx.body
  const { url } = body
  const [folder, name] = parseMediaFileName(url)
  const path = getMediaRoot() + folder + '/' + name
  try {
    await Deno.remove(path)
    return ctx.string(`DELETE ${url}`, 200)
  }
  catch (ex) {
  }
  return ctx.string(`No such media file: ${url}`, 404)
}
