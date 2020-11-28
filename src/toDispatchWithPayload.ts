import { matcherHint, printReceived, printExpected } from 'jest-matcher-utils';
import deepEqual from 'deep-equal';
import { ActionResults, ObservedDispatch } from './index';

const passMessage = (actual: ObservedDispatch[], received: any) => () =>
    matcherHint('.not.toDispatchWithPayload', 'received', '') +
    '\n\n' +
    'Expected to not have been dispatched with payload:\n' +
    ` ${printExpected(received)}\n` +
    'Received:\n' +
    ` ${printReceived(actual.map(x => ({type: x.type, payload: x.payload})))}`;

const failMessage = (actual: ObservedDispatch[], received: any) => () =>
    matcherHint('.toDispatchWithPayload', 'received', '') +
    '\n\n' +
    'Expected to have been dispatched with payload:\n' +
    ` ${printExpected(received)}\n` +
    'Received:\n' +
    ` ${printReceived(actual.map(x => ({type: x.type, payload: x.payload})))}`;

const pick = (...props: any[]) => (o: any) =>
    props.reduce((a, e) => ({ ...a, [e]: o[e] }), {});


const predicate = (
    actual: ActionResults,
    expectedMutation: string,
    expectedPayload: string,
    strict: boolean
): boolean => {
    const mutation = actual.dispatches.find(x => x.type === expectedMutation);

    if (mutation === undefined) {
        return false;
    }

    if (strict) {
        return deepEqual(mutation.payload, expectedPayload);
    }

    const partialPayload = pick(...Object.keys(expectedPayload))(mutation.payload);
    return deepEqual(partialPayload, expectedPayload);
}

const toDispatchWithPayload = (
    actual: ActionResults,
    expectedMutation: string,
    expectedPayload: string,
    strict: boolean
) => {
    const pass = predicate(actual, expectedMutation, expectedPayload, strict);
    if (pass) {
        return {
            pass: true,
            message: passMessage(actual.dispatches, {
                type: expectedMutation,
                payload: expectedPayload
            })
        };
    }

    return {
        pass: false,
        message: failMessage(actual.dispatches, {
            type: expectedMutation,
            payload: expectedPayload
        })
    };
};

export default {
    toDispatchWithPayload
};
