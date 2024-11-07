import { sum } from './sum'

describe('Sum function', () =>{
  test('Checks that 2 + 3 equals 5', () =>{
      expect(sum(2, 3)).toEqual(5)
  })
})