import React from 'react'
import renderer from 'react-test-renderer'
import App from './App'

const initialState = {
  authentication: {},
  editor: {},
  profile: {},
}

it('renders without crashing', () => {
  renderer.create(<App jsState={JSON.stringify(initialState)} />).toJSON()
})
