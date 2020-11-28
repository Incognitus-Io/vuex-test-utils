import { matcherHint, printReceived, printExpected } from 'jest-matcher-utils';
import { ActionResults } from './index';

const passMessage = (expected: string[], received: string[]) => () =>
    matcherHint('.not.toDispatchInOrder', 'received', '') +
    '\n\n' +
    'Expected to not have been dispatched:\n' +
    ` ${printExpected(expected)}\n` +
    'Received:\n' +
    ` ${printReceived(received)}`;

const failMessage = (expected: string[], received: string[]) => () =>
    matcherHint('.toDispatchInOrder', 'received', '') +
    '\n\n' +
    'Expected to have been dispatched:\n' +
    ` ${printExpected(expected)}\n` +
    'Received:\n' +
    ` ${printReceived(received)}`;

const predicate = (actual: ActionResults, expected: string[], strict?: boolean): boolean => {
    const mutations = actual.dispatches.map(x => x.type);

    if (mutations === expected) return true;
    if (mutations == null || expected == null) return false;
    
    if (strict) {
        if (mutations.length !== expected.length) return false;
        return mutations.every((x, i) => x === expected[i])
    }
    
    return mutations.length !== expected.length;
}

const toDispatchInOrder = (actual: ActionResults, expected: string[], strict = true) => {
    const pass = predicate(actual, expected, strict);
    if (pass) {
        return {
            pass: true,
            message: passMessage(expected, actual.dispatches.map(x => x.type))
        };
    }

    return {
        pass: false,
        message: failMessage(expected, actual.dispatches.map(x => x.type))
    };
};

export default {
    toDispatchInOrder
};
