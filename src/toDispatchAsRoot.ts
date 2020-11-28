import { matcherHint, printReceived, printExpected } from 'jest-matcher-utils';
import { ActionResults, ObservedDispatch } from './index';

const passMessage = (actual: ObservedDispatch[], received: any) => () =>
    matcherHint('.not.toDispatchAsRoot', 'received', '') +
    '\n\n' +
    'Expected to not have been dispatched as root:\n' +
    ` ${printExpected(received)}\n` +
    'Received:\n' +
    ` ${printReceived(actual.map(x => ({ type: x.type, options: x.options })))}`;

const failMessage = (actual: ObservedDispatch[], received: any) => () =>
    matcherHint('.toDispatchAsRoot', 'received', '') +
    '\n\n' +
    'Expected to have been dispatched as root:\n' +
    ` ${printExpected(received)}\n` +
    'Received:\n' +
    ` ${printReceived(actual.map(x => ({ type: x.type, options: x.options })))}`;

const predicate = (
    actual: ActionResults,
    expectedMutation: string,
): boolean => {
    const mutation = actual.dispatches.find(x => x.type === expectedMutation);

    if (mutation === undefined) {
        return false;
    }

    return mutation.options?.root === true;
}

const toDispatchAsRoot = (
    actual: ActionResults,
    expectedMutation: string
) => {
    const pass = predicate(actual, expectedMutation);
    if (pass) {
        return {
            pass: true,
            message: passMessage(actual.dispatches, {
                type: expectedMutation,
                options: {
                    root: true
                }
            })
        };
    }

    return {
        pass: false,
        message: failMessage(actual.dispatches, {
            type: expectedMutation,
            options: {
                root: true
            }
        })
    };
};

export default {
    toDispatchAsRoot
};
