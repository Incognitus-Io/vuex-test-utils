import { ActionContext, CommitOptions, DispatchOptions } from 'vuex';
import { ActionResults, ObservedCommit, ObservedDispatch, actionFn, commitFn, dispatchFn, ActionCtx } from './index';

export const action = <S, R>(
    action: actionFn<S, R>,
    payload?: any,
    config?: ActionCtx<S, R>): jest.JestMatchers<ActionResults> => {
    const executedCommits: ObservedCommit[] = [];
    const executedDispatches: ObservedDispatch[] = [];
    const ctx = config as ActionContext<S, R> || {}
    ctx.commit = emitCommit(executedCommits);
    ctx.dispatch = emitDispatch(executedDispatches);

    action(ctx, payload);

    return expect({
        commits: executedCommits,
        dispatches: executedDispatches,
    });
};

const emitCommit = (executedCommits: ObservedCommit[]): commitFn => {
    return (type: string, payload?: any, options?: CommitOptions) => {
        executedCommits.push({
            type,
            payload,
            options,
        });
    };
};

const emitDispatch = (executedDispatches: ObservedDispatch[]): dispatchFn => {
    return (type: string, payload?: any, options?: DispatchOptions) => {
        executedDispatches.push({
            type,
            payload,
            options,
        });
    };
};