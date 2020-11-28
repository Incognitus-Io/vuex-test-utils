# Vuex-Test-Utils

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

## Chained assertions
With some additional configuration you can also chain assertions.  This allows for checking multiple things happened in the same test.  Alternatively you could also specify the expect multiple times.

jest.config.js
```javascript
module.export = {
  setupFilesAfterEnv: ['@incognitus/vuex-test-utils', 'jest-chain'],
}
```

Javascript
```javascript
expect.action(actions.foofizz)
  .toCommit('foobar')
  .toCommit('fizzbuzz')
```

Typescript
```typescript
(expect.action(actions.foofizz) as jest.ChainedActionMatchers)
  .toCommit('foobar')
  .toCommit('fizzbuzz')
```


## Passing action payload and contexts

Payload, state, root state, getters, and root getters can also be passed in with the option parameters on the `expect.action` method

```javascript
// Payload
expect.action(actions.foobar, {foo: bar})

// Context
exect.action(actions.foobar, undefined, {state: {foo: 'bar'}, rootState: {version: '1.0.0'}, etc..})
```
