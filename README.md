# Vuex-Test-Utils
This is a collection of test utilities for vuex.  For actions you can check if things are commited or dispatched, and what their payload was.

To do this you can say something like the following:

```javascript
expect.action(actions.foobar).to.commit('foo').with.payload('bar')
```

or

```javascript
expect.action(actions.fizzbuzz).to.dispatch('fizz').with.payload('buzz')
```

assertions can also be chained

```javascript
expect.action(actions.foofizz).to.commit('foobar').and.commit('fizzbuzz')
```

For payloads you must either assert a commit or dispatch before the payload. You do not have to say what type of commit or dispatch is preformed if you just want to look at the payload.  When there are multiple commits and you want to check the order, you must also use the `order` chained property.

```javascript
exect.action(actions.foofizz).to.commit.in.order('foobar', 'fizzbuzz')
```

## Passing action payload and contexts

Payload, state, root state, getters, and root getters can also be passed in with the option parameters on the `expect.action` method

```javascript
// Payload
expect.action(actions.foobar, {foo: bar})

// Context
exect.action(actions.foobar, undefined, {state: {foo: 'bar'}, rootState: {version: '1.0.0'}, etc..})
```

## Notes on asyncronus actions

When asserting on async actions you must return the awaiter to the mocha runner.

```javascript
it('Is an async action', () => {
    return expect.action(actions.foobarAsync).to.commit.getAwaiter;
})
```

or using async/await

```javascript
it('Is an async action', async () => {
    const act = expect.action(actions.foobarAsync).to.commit.getAwaiter;
    await act;
})
```
