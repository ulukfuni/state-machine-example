import { Box } from 'rebass/styled-components'
import { Label, Input } from '@rebass/forms'
import { Machine } from 'xstate'
import { useMachine } from '@xstate/react'
import { useState } from 'react'

import Flex from '../components/Flex'
import Button from '../components/Button'
import { options, loginMachineConfig } from '../machine'

export default () => {
  // const loginMachine = Machine(loginMachineConfig, options)
  // const [ current, send ] = useMachine(loginMachine)
  return (
    <Flex
      center
      height="100vh"
    >
      <Box py={3}>
        <Flex mx={-2} mb={3}>
          <Box width={1/2} px={2}>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
              defaultValue=''
            />
          </Box>
          <Box width={1/2} px={2}>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              name='password'
              defaultValue=''
            />
          </Box>
        </Flex>
        <Flex mx={-2} flexWrap='wrap'>
          <Box px={2} ml='auto'>
            <Button variant="grey">Log In</Button>
          </Box>
        </Flex>
      </Box>
    </Flex>
  )
}