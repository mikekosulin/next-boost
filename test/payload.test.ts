import { decodePayload, encodePayload } from '../src/payload'

describe('payload encode/decode', () => {
  it('encode', () => {
    const headers = { a: 1, b: 2 }
    const body = Buffer.from('hello world')
    const payload = encodePayload({ headers, body })
    const rv = decodePayload(payload)
    expect(rv.headers).toEqual(headers)
    expect(rv.body).toEqual(body)
  })

  it('complex headers', () => {
    const payload = {
      headers: {
        'content-type': 'application/json',
        'x-custom-header': 'custom value',
        'nested': { key: 'value' }
      },
      body: Buffer.from('{"key": "value"}')
    }
    const encoded = encodePayload(payload)
    const decoded = decodePayload(encoded)
    expect(decoded).toEqual(payload)
  })

  it('encode with empty header', () => {
    const headers = null
    const body = Buffer.from('hello world')
    const payload = encodePayload({ headers, body })
    const rv = decodePayload(payload)
    expect(rv.headers).toBeNull()
    expect(rv.body).toEqual(body)
  })

  it('encode with empty body', () => {
    const headers = { a: 1, b: 2 }
    const body = null
    const payload = encodePayload({ headers, body })
    const rv = decodePayload(payload)
    expect(rv.headers).toEqual(headers)
    expect(rv.body).toEqual(Buffer.alloc(0))
  })

  it('null body to empty buffer', () => {
    const payload = {
      headers: { 'content-type': 'application/json' },
      body: Buffer.alloc(0)
    }
    const encoded = encodePayload(payload)
    const decoded = decodePayload(encoded)
    expect(decoded).toEqual(payload)
  })

  it('invalid crafted payload', () => {
    const invalidPayload = Buffer.from([
      ...Buffer.from('%NB%'),
      0, 0, 0, 2,  // header length
      123, 125,    // empty JSON object {}
      0, 0         // invalid body
    ])
    expect(() => decodePayload(invalidPayload)).toThrow('Invalid payload: Payload does not meet validation criteria')
  })

  it('invalid payload', () => {
    const payload = Buffer.from('hello world')
    expect(() => decodePayload(payload)).toThrow('Invalid payload')
  })

  it('undefined payload', () => {
    const rv = decodePayload(undefined)
    expect(rv.headers).toEqual({})
    expect(rv.body).toEqual(Buffer.alloc(0))
  })
})
