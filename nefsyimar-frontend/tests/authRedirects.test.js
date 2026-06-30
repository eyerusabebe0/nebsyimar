const test = require('node:test')
const assert = require('node:assert/strict')
const { getSafeRedirectPath } = require('../lib/authRedirects')

test('returns the provided safe internal path', () => {
  assert.equal(getSafeRedirectPath('/repatriation', '/dashboard'), '/repatriation')
})

test('falls back to dashboard for external or invalid redirects', () => {
  assert.equal(getSafeRedirectPath('https://example.com', '/dashboard'), '/dashboard')
  assert.equal(getSafeRedirectPath('//evil.com', '/dashboard'), '/dashboard')
  assert.equal(getSafeRedirectPath('', '/dashboard'), '/dashboard')
})
