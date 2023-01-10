import { assert, describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import accountList from './mock/accounts.json'
import management from '@/lib/managementApi'

const gapiMock = vi.fn(() => ({
  client: {
    analytics: {
      management: {
        accountSummaries: {
          list: () => {
            return accountList
          }
        }
      }
    }
  }
}))

vi.stubGlobal('gapi', gapiMock)


describe('get accounts', () => {
  let accounts

  beforeEach( () => {
    accounts =  management.getAccounts()
    console.log(accounts)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should have all items', () => {
    assert.equal(accounts.length, 3)
  })

  // it('all items should have name and id', () => {
  //   expect(1 + 1).eq(2)
  // })

  // it('snapshot', () => {
  //   expect({ foo: 'bar' }).toMatchSnapshot()
  // })
})
