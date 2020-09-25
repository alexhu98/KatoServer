import { assert, assertEquals, assertNotEquals, assertStringContains } from 'https://deno.land/std/testing/asserts.ts'
import type { MediaFolder, MediaFile } from '../models.ts'

const PORT = parseInt(Deno.env.get('PORT') || '8002', 10)

const getMediaApi = (path: string = ''): string => `http://localhost:${PORT}/api/media${path}`

const waitForServerToStart = async () => {
  let retryCount = 0
  while (retryCount++ < 10) {
    try {
      const response = await fetch(getMediaApi())
      console.log(`waitForServerToStart -> ${response.status}`)
      await response.json()
      if (response.ok) {
        return
      }
    }
    catch (ex) {
      console.error(ex)
    }
  }
}

Deno.test('browse', async () => {
  await waitForServerToStart()
  const response = await fetch(getMediaApi())
  const result = await response.json()
  assertNotEquals(result.length, 0)
  const folder: MediaFolder = result[0]
  console.log(folder)
  assertStringContains(folder.url, 'tstream')
  assertEquals(folder.name, 'tstream')
  assert(folder.url.indexOf(' ') < 0, 'No space in url allowed')
})

Deno.test('browseMediaFolder', async () => {
  await waitForServerToStart()
  const response = await fetch(getMediaApi('/tstream'))
  const result = await response.json()
  assertNotEquals(result.length, 0)
  const file: MediaFile = result[0]
  console.log(file)
  assertStringContains(file.url, 'tstream')
  assertNotEquals(file.fileSize, 0)
  assertNotEquals(file.lastModified, 0)
  assertNotEquals(file.duration, 0)
  assert(file.url.indexOf(' ') < 0, 'No space in url allowed')
})

Deno.test('flagMediaFile', async () => {
  await waitForServerToStart()
  const browseResponse = await fetch(getMediaApi('/tstream'))
  let result = await browseResponse.json()
  assertNotEquals(result.length, 0)
  const file: MediaFile = result[0]
  const url = file.url
  console.log(url)
  const response = await fetch(getMediaApi(), {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ action: 'FLAG', list: [url] }),
  })
  result = await response.json()
  console.log(`${response.status} ${result.success} ${result.message}`)
  assert(response.ok, 'response.ok')
  assert(result.success, 'result.success')
})

Deno.test('moveMediaFile', async () => {
  await waitForServerToStart()
  const browseResponse = await fetch(getMediaApi('/tstream'))
  let result = await browseResponse.json()
  assertNotEquals(result.length, 0)
  const file: MediaFile = result[0]
  const url = file.url
  console.log(url)
  const response = await fetch(getMediaApi(), {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ action: 'MOVE', list: [url] }),
  })
  result = await response.json()
  console.log(`${response.status} ${result.success} ${result.message}`)
  assert(response.ok, 'response.ok')
  assert(result.success, 'result.success')
})

Deno.test('moveAllMediaFiles', async () => {
  await waitForServerToStart()
  const browseResponse = await fetch(getMediaApi('/tstream'))
  let result = await browseResponse.json()
  assertNotEquals(result.length, 0)
  const file: MediaFile = result[0]
  const url = file.url
  console.log(url)
  const response = await fetch(getMediaApi(), {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ action: 'MOVE_ALL' }),
  })
  result = await response.json()
  console.log(`${response.status} ${result.success} ${result.message}`)
  assert(response.ok, 'response.ok')
  assert(result.success, 'result.success')
})

Deno.test('deleteMediaFile', async () => {
  await waitForServerToStart()
  const browseResponse = await fetch(getMediaApi('/tstream'))
  let result = await browseResponse.json()
  assertNotEquals(result.length, 0)
  const file: MediaFile = result[0]
  const url = file.url
  console.log(url)
  const response = await fetch(getMediaApi(), {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ action: 'DELETE', list: [url] }),
  })
  result = await response.json()
  console.log(`${response.status} ${result.success} ${result.message}`)
  assert(response.ok, 'response.ok')
  assert(result.success, 'result.success')
})
