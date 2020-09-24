import { assert, assertEquals, assertNotEquals, assertStringContains } from 'https://deno.land/std/testing/asserts.ts'
import type { MediaFolder,MediaFile } from '../models.ts'

const waitForServerToStart = async () => {
  let retryCount = 0
  while (retryCount++ < 10) {
    try {
      const response = await fetch('http://localhost:8000/browse')
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
  const response = await fetch('http://localhost:8000/browse')
  const result = await response.json()
  assertNotEquals(result.length, 0)
  const folder: MediaFolder = result[0]
  console.log(folder)
  assertStringContains(folder.url, 'tstream')
  assert(folder.url.indexOf(' ') < 0, 'No space in url allowed')
})

Deno.test('browseMediaFolder', async () => {
  await waitForServerToStart()
  const response = await fetch('http://localhost:8000/browse/tstream')
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
/*
Deno.test('flagMediaFile', async () => {
  await waitForServerToStart()
  const browseResponse = await fetch('http://localhost:8000/browse/tstream')
  const result = await browseResponse.json()
  assertNotEquals(result.length, 0)
  const file: MediaFile = result[0]
  const url = file.url
  console.log(url)
  const response = await fetch('http://localhost:8000/browse', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ action: 'FLAG', url }),
  })
  console.log(`${response.status} ${await response.text()}`, )
  assert(response.ok, 'response.ok')
})

Deno.test('moveMediaFile', async () => {
  await waitForServerToStart()
  const browseResponse = await fetch('http://localhost:8000/browse/tstream')
  const result = await browseResponse.json()
  assertNotEquals(result.length, 0)
  const file: MediaFile = result[0]
  const url = file.url
  console.log(url)
  const response = await fetch('http://localhost:8000/browse', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ action: 'MOVE', url }),
  })
  console.log(`${response.status} ${await response.text()}`, )
  assert(response.ok, 'response.ok')
})

Deno.test('moveAllMediaFiles', async () => {
  await waitForServerToStart()
  const browseResponse = await fetch('http://localhost:8000/browse/tstream')
  const result = await browseResponse.json()
  assertNotEquals(result.length, 0)
  const file: MediaFile = result[0]
  const url = file.url
  console.log(url)
  const response = await fetch('http://localhost:8000/browse', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ action: 'MOVE_ALL', url }),
  })
  console.log(`${response.status} ${await response.text()}`, )
  assert(response.ok, 'response.ok')
})

Deno.test('deleteMediaFile', async () => {
  await waitForServerToStart()
  const browseResponse = await fetch('http://localhost:8000/browse/tstream')
  const result = await browseResponse.json()
  assertNotEquals(result.length, 0)
  const file: MediaFile = result[0]
  const url = file.url
  console.log(url)
  const response = await fetch('http://localhost:8000/browse', {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ url }),
  })
  console.log(`${response.status} ${await response.text()}`, )
  assert(response.ok, 'response.ok')
})
*/
