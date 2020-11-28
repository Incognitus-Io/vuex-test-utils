import { matcherHint, printReceived, printExpected } from 'jest-matcher-utils';
import { ActionResults } from './index';

const passMessage = (expected: string[], received: string[]) => () =>
    matcherHint('.not.toCommitInOrder', 'received', '') +
    '\n\n' +
    'Expected to not have been commited:\n' +
    ` ${printExpected(expected)}\n` +
    'Received:\n' +
    ` ${printReceived(received)}`;

const failMessage = (expected: string[], received: string[]) => () =>
    matcherHint('.toCommitInOrder', 'received', '') +
    '\n\n' +
    'Expected to have been commit:\n' +
    ` ${printExpected(expected)}\n` +
    'Received:\n' +
    ` ${printReceived(received)}`;

const predicate = (actual: ActionResults, expected: string[], strict?: boolean): boolean => {
    const mutations = actual.commits.map(x => x.type);

    if (mutations === expected) return true;
    if (mutations == null || expected == null) return false;
    
    if (strict) {
        if (mutations.length !== expected.length) return false;
        return mutations.every((x, i) => x === expected[i])
    }
    
    return mutations.length !== expected.length;
}

const toCommitInOrder = (actual: ActionResults, expected: string[], strict = true) => {
    const pass = predicate(actual, expected, strict);
    if (pass) {
        return {
            pass: true,
            message: passMessage(expected, actual.commits.map(x => x.type))
        };
    }

    return {
        pass: false,
        message: failMessage(expected, actual.commits.map(x => x.type))
    };
};

export default {
    toCommitInOrder
};
