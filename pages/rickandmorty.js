import Flex from '../components/Flex'
import Button from '../components/Button'

import { Box, Image } from 'rebass/styled-components'
import { Label, Input } from '@rebass/forms'
import { Machine, assign } from 'xstate'
import { useMachine } from '@xstate/react'

// form with one input and one button
// enter character name and get a bunch of chars
// states: ready, enteringName, searching, displayResults, noResults, error
// transistions are UPPERCASE and will the events we send to the machine to make states change
const config = {
  id: 'charSearch',
  context: {
    name: '',
    results: [],
    msg: 'ready',
    info: {}
  },
  initial: 'ready',
  states: {
    ready: {
      on: {
        INPUT_NAME: {
          actions: assign((ctx, evt) => ({
            name: evt.name,
            msg: 'got name'
          }))
        },
        SUBMIT: {
          target: 'searching'
        }
      }
    },
    // 400 status from service
    error: {
      on: {
        // if in error state, and the input name transistion is triggered, machine will go to ready state
        INPUT_NAME: {
          target: 'ready'
        },
        // if in error state and submit transistion triggered, machine will go to searching state
        SUBMIT: {
          target: 'searching'
        }
      },
      // sub state for errors that can occur
      states: {
        tooManyRequests: {},
        notWorking: {},
        invalidCharName: {}
      }
    },
    // 200 status but no chars returned
    noResults: {},
    // waiting for response
    searching: {
      // allows us to declare a promise and then transition to different states depending on promise response
      invoke: {
        id: 'getChar',
        // name of service
        src: 'getCharacter',
        onDone: {
          target: 'success',
          actions:  assign({
            results: (ctx, evt) => {
              console.log(ctx, evt)
              return evt.data.results
            },
            info: (ctx, evt) => evt.data.info,
            msg: 'searching'
          })
        },
        onError: {
          target: 'error',
          actions: assign({ msg: 'error' })
        },
        // guards and targets for all errors
        // onError: [
        //   {
        //     // name of guard
        //     cond: 'isServiceErr',
        //     target: 'error'
        //   },
        //   {
        //     // not sure how to do this guard since its a 200
        //     cond: 'isNoResults',
        //     target: 'noResults'
        //   }
        // ]
      }
    },
    // 200 and results from service
    success: {
      // final state
      // type: 'final',
      actions: assign({ msg: 'done' })
    }
  }
}

// where all your functions are held, the names will correspond to cond and actions in the config
const options = {
  guards: {},
  actions: {
    showResults: (ctx, evt) => console.log('done', ctx)
  },
  services: {
    getCharacter: (ctx, evt) => fetch(`https://rickandmortyapi.com/api/character/?name=${ctx.name}`)
      .then(res => res.json())
  }
}

export default props => {
  const ramMachine = Machine(config)
  const [ current, send ] = useMachine(ramMachine, options)
  return (
    <Flex center height="100vh">
      {current.context.results.length === 0 && (
        <Box py={3}>
          {/* <Box>{current.}</Box> */}
          <Box px={2} mb={3}>
            <Label htmlFor='email'>Character Name</Label>
            <Input
              id='email'
              name='email'
              defaultValue=''
              onChange={(e) => send({ type:'INPUT_NAME', name: e.target.value })}
            />
          </Box>
          <Box px={2} ml='auto'>
            <Button variant="grey" onClick={() => send({ type: 'SUBMIT', msg: 'sending name'})}>Search: {current.context.msg}</Button>
          </Box>
          {Object.keys(current.context.info).length > 0 && (
            <Box px={2}>
              <p>Count: {current.context.info.count}</p>
              <p>Pages: {current.context.info.pages}</p>
            </Box>
          )}
        </Box>
      )}
      {current.context.results.length > 0 && (
        <Flex px={2} flexWrap="wrap" height="100%" center>
          {current.context.results.map(char => (
            <Box key={char.name}>
              <Image src={char.image} />
              <p>Name: {char.name}</p>
              <p>Species: {char.species}</p>
              <p>Status: {char.status}</p>
              <p>Origin: {char.origin.name}</p>
            </Box>
          ))}
        </Flex>
      )}
    </Flex>
  )
}