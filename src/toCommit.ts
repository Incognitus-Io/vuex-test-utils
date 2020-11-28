import { matcherHint, printReceived, printExpected } from 'jest-matcher-utils';
import { ActionResults } from './index';

const passMessage = (actual: ActionResults, received: string) => () =>
    matcherHint('.not.toCommit', 'received', '') +
    '\n\n' +
    'Expected to not have been commited:\n' +
    ` ${printExpected(received)}\n` +
    ' but received:\n' +
    ` ${printReceived(actual.commits.map(x => x.type))}`;

const failMessage = (actual: ActionResults, received: string) => () =>
    matcherHint('.toCommit', 'received', '') +
    '\n\n' +
    'Expected to have been commited:\n' +
    ` ${printExpected(received)}\n` +
    ' but received:\n' +
    ` ${printReceived(actual.commits.map(x => x.type))}`;

const predicate = (actual: ActionResults, expected: string): boolean => {
    return actual.commits.some(x => x.type === expected);
}

const toCommit = (actual: ActionResults, expected: string) => {
    const pass = predicate(actual, expected);
    if (pass) {
        return { pass: true, message: passMessage(actual, expected) };
    }

    return { pass: false, message: failMessage(actual, expected) };
};

export default {
    toCommit
};
