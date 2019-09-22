import { ActionContext, CommitOptions, DispatchOptions } from 'vuex';
// import './types';
import chaiEx from './register';
import { actionFn, ObservedCommit, ObservedDispatch, commitFn, dispatchFn } from './types';
import { store } from './store';

export const vuexChai = (chai: Chai.ChaiStatic, _: Chai.ChaiUtils) => {
    const Assertion = chai.Assertion;
    chaiEx(chai, _);

    chai.expect.action = <S, R>(
        action: actionFn<S, R>,
        payload?: any,
        config?: Chai.ActionCtx<S, R>,
    ): Chai.Assertion  => {
        const test = new Assertion(action);
        _.flag(test, store.actionCtx, config);

        execAction(action, payload, test);

        return test;
    };

    const execAction = (action: actionFn<any, any>, payload: any, obj: object) => {
        const executedCommits: ObservedCommit[] = [];
        const executedDispatches: ObservedDispatch[] = [];
        const ctx: ActionContext<any, any> = _.flag(obj, store.actionCtx) || {};
        ctx.commit = emitCommit(executedCommits);
        ctx.dispatch = emitDispatch(executedDispatches);

        action(ctx, payload);

        _.flag(obj, store.executedCommits, executedCommits);
        _.flag(obj, store.executedDispatches, executedDispatches);
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
};
