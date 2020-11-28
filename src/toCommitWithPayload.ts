import { matcherHint, printReceived, printExpected } from 'jest-matcher-utils';
import deepEqual from 'deep-equal';
import { ActionResults, ObservedCommit } from './index';

const passMessage = (actual: ObservedCommit[], received: any) => () =>
    matcherHint('.not.toCommitWithPayload', 'received', '') +
    '\n\n' +
    'Expected to not have been commited with payload:\n' +
    ` ${printExpected(received)}\n` +
    'Received:\n' +
    ` ${printReceived(actual.map(x => ({type: x.type, payload: x.payload})))}`;

const failMessage = (actual: ObservedCommit[], received: any) => () =>
    matcherHint('.toCommitWithPayload', 'received', '') +
    '\n\n' +
    'Expected to have been commited with payload:\n' +
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
    const mutation = actual.commits.find(x => x.type === expectedMutation);

    if (mutation === undefined) {
        return false;
    }

    if (strict || Array.isArray(mutation.payload) || typeof mutation.payload !== 'object') {
        return deepEqual(mutation.payload, expectedPayload);
    }

    const partialPayload = pick(...Object.keys(expectedPayload))(mutation.payload);
    return deepEqual(partialPayload, expectedPayload);
}

const toCommitWithPayload = (
    actual: ActionResults,
    expectedMutation: string,
    expectedPayload: string,
    strict: boolean
) => {
    const pass = predicate(actual, expectedMutation, expectedPayload, strict);
    if (pass) {
        return {
            pass: true,
            message: passMessage(actual.commits, {
                type: expectedMutation,
                payload: expectedPayload
            })
        };
    }

    return {
        pass: false,
        message: failMessage(actual.commits, {
            type: expectedMutation,
            payload: expectedPayload
        })
    };
};

export default {
    toCommitWithPayload
};
