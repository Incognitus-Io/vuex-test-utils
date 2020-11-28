import { matcherHint, printReceived, printExpected } from 'jest-matcher-utils';
import { ActionResults, ObservedCommit } from './index';

const passMessage = (actual: ObservedCommit[], received: any) => () =>
    matcherHint('.not.toCommitAsRoot', 'received', '') +
    '\n\n' +
    'Expected to not have been commited as root:\n' +
    ` ${printExpected(received)}\n` +
    'Received:\n' +
    ` ${printReceived(actual.map(x => ({ type: x.type, options: x.options })))}`;

const failMessage = (actual: ObservedCommit[], received: any) => () =>
    matcherHint('.toCommitAsRoot', 'received', '') +
    '\n\n' +
    'Expected to have been commited as root:\n' +
    ` ${printExpected(received)}\n` +
    'Received:\n' +
    ` ${printReceived(actual.map(x => ({ type: x.type, options: x.options })))}`;

const predicate = (
    actual: ActionResults,
    expectedMutation: string,
): boolean => {
    const mutation = actual.commits.find(x => x.type === expectedMutation);

    if (mutation === undefined) {
        return false;
    }

    return mutation.options?.root === true;
}

const toCommitAsRoot = (
    actual: ActionResults,
    expectedMutation: string
) => {
    const pass = predicate(actual, expectedMutation);
    if (pass) {
        return {
            pass: true,
            message: passMessage(actual.commits, {
                type: expectedMutation,
                options: {
                    root: true
                }
            })
        };
    }

    return {
        pass: false,
        message: failMessage(actual.commits, {
            type: expectedMutation,
            options: {
                root: true
            }
        })
    };
};

export default {
    toCommitAsRoot
};
