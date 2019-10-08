import { Machine, assign } from 'xstate';
import { useMachine } from '@xstate/react'
import { Box } from 'rebass/styled-components'

const increment = context => context.count + 1;
const decrement = context => context.count - 1;

import Button from './Button'

const counterMachine = Machine({
  initial: 'active',
  context: {
    count: 0
  },
  states: {
    active: {
      on: {
        INC: { actions: assign({ count: increment }) },
        DEC: { actions: assign({ count: decrement }) }
      }
    }
  }
});

export default props => {
  const [ current, send ] = useMachine(counterMachine)
  return (
    <Box>
      {current.context.count}
      <Button variant="grey" onClick={() => send('INC')}>+</Button>
      <Button variant="grey" onClick={() => send('DEC')}>-</Button>
    </Box>
  )
}