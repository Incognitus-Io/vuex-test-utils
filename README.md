# Vuex-Test-Utils

![](https://github.com/Incognitus-Io/vuex-test-utils/workflows/Node%20CI/badge.svg?branch=master) 
[![Coverage Status](https://coveralls.io/repos/github/Incognitus-Io/vuex-test-utils/badge.svg)](https://coveralls.io/github/Incognitus-Io/vuex-test-utils)   
This is a collection of test utilities for vuex.  For actions you can check if things are commited or dispatched, and what their payload was.

## Getting started

1. install using `yarn add -D @incognitus/vuex-test-utils`
2. configure `jest.config.js`
```javascript
module.export = {
  setupFilesAfterEnv: ['@incognitus/vuex-test-utils'],
}
```

## Basic useage

```javascript
expect.action(actions.foobar).toCommitWithPayload('foo', 'bar')
```

or

```javascript
expect.action(actions.fizzbuzz).toDispatchWithPayload('fizz', 'buzz')
```

when checking order

```javascript
exect.action(actions.foofizz).toCommitInOrder('foobar', 'fizzbuzz')
```

Things that can be checked are:

* toCommit
* toCommitWithPayload
* toCommitAsRoot
* toCommitInOrder
* toDispatch
* toDispatchWithPayload
* toDispatchAsRoot
* toDispatchInOrder

## Passing action payload and contexts

Payload, state, root state, getters, and root getters can also be passed in with the option parameters on the `expect.action` method

```javascript
// Payload
expect.action(actions.foobar, {foo: bar})

// Context
exect.action(actions.foobar, undefined, {state: {foo: 'bar'}, rootState: {version: '1.0.0'}, etc..})
```
