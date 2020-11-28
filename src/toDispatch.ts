import { matcherHint, printReceived, printExpected } from 'jest-matcher-utils';
import { ActionResults } from './index';

const passMessage = (actual: ActionResults, received: string) => () =>
    matcherHint('.not.toDispatch', 'received', '') +
    '\n\n' +
    'Expected to not have been dispatched:\n' +
    ` ${printExpected(received)}\n` +
    ' but received:\n' +
    ` ${printReceived(actual.dispatches.map(x => x.type))}`;

const failMessage = (actual: ActionResults, received: string) => () =>
    matcherHint('.toDispatch', 'received', '') +
    '\n\n' +
    'Expected to have been dispatched:\n' +
    ` ${printExpected(received)}\n` +
    ' but received:\n' +
    ` ${printReceived(actual.dispatches.map(x => x.type))}`;

const predicate = (actual: ActionResults, expected: string): boolean => {
    return actual.dispatches.some(x => x.type === expected);
}

const toDispatch = (actual: ActionResults, expected: string) => {
    const pass = predicate(actual, expected);
    if (pass) {
        return { pass: true, message: passMessage(actual, expected) };
    }

    return { pass: false, message: failMessage(actual, expected) };
};

export default {
    toDispatch
};
