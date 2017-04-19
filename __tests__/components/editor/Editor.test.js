import { ACTIVE_SERVICE_REGEXES } from '../../../src/components/editor/Editor'

describe('Editor', () => {
  it('has active services', () => {
    expect(ACTIVE_SERVICE_REGEXES.length).to.equal(1)
  })
})
