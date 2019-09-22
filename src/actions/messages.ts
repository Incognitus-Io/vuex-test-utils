export const messages = {
    expected: {
        commitedType: 'expected #{exp} commit but found #{act} commit(s)',
        orderedCommitedType: 'expected #{exp} commit but found #{act}',
        payload: 'expected payload #{exp} but found #{act}',
        missingRootCommitOptions: 'expected to be a root commit, but found no commit options',
        missingSilentCommitOptions: 'expected to be a silent commit, but found no commit options',
        missingRootDispatchOptions: 'expected to be a root dispatch, but found no dispatch options',
        dispatchType: 'expected #{exp} dispatch but found #{act} dispatch(s)',
        orderedDispatchType: 'expected #{exp} dispatch but found #{act}',
    },
    notExpected: {
        commitedType: 'expected #{exp} to not be commmited but found #{act} commit(s)',
        orderedCommitedType: 'expected #{exp} to not be commited but found #{act}',
        payload: 'expected payload #{exp} to not be defined but found #{act}',
        dispatchType: 'expected #{exp} to not be dispatched but found #{act} dispatches(s)',
        orderedDispatchType: 'expected #{exp} to not be dispatched but found #{act}',
    },
};
