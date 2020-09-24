import { createRequire } from 'https://deno.land/std@0.70.0/node/module.ts'

const require = createRequire(import.meta.url)

export const R = require('ramda')
