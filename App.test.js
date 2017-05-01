import React from 'react'
import renderer from 'react-test-renderer'
import App from './App'

xdescribe('App', () => {
  it('renders without crashing', () => {
    renderer.create(<App />).toJSON()
  })
})

