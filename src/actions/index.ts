import { ActionContext, CommitOptions, DispatchOptions } from 'vuex';
import chaiEx from './register';
import { actionFn, ObservedCommit, ObservedDispatch, commitFn, dispatchFn, actionFnSync } from './types';
import { store } from './store';

export const vuexChai = (chai: Chai.ChaiStatic, _: Chai.ChaiUtils) => {
    const Assertion = chai.Assertion;
    chaiEx(chai, _);
    supportAsyncNot();

    chai.expect.action = <S, R>(
        action: actionFn<S, R>,
        payload?: any,
        config?: Chai.ActionCtx<S, R>,
    ): Chai.Assertion => execAction(action, payload, config as ActionContext<S, R> || {});

    function execAction<S, R>(action: actionFn<S, R>, payload: any, ctx: ActionContext<S, R>) {
        const executedCommits: ObservedCommit[] = [];
        const executedDispatches: ObservedDispatch[] = [];
        ctx.commit = emitCommit(executedCommits);
        ctx.dispatch = emitDispatch(executedDispatches);

        let test: Chai.Assertion | Chai.PromisedAssertion;
        const actionRes = action(ctx, payload);
        if (isPromise(actionRes)) {

            const asyncAction = actionRes as Promise<void>;
            test = new Assertion(asyncAction.then(() => {

                _.flag(test, store.executedCommits, executedCommits);
                _.flag(test, store.executedDispatches, executedDispatches);
            }));
        } else {
            test = new Assertion(null);
            _.flag(test, store.executedCommits, executedCommits);
            _.flag(test, store.executedDispatches, executedDispatches);
        }

        return test;
    }

    const isPromise = (obj: any) => obj && typeof obj.then === 'function';

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

    function supportAsyncNot() {
        // tslint:disable-next-line: variable-name
        chai.Assertion.overwriteProperty('not', (_super) => {
            return function () {
                if (isPromise(this._obj)) {
                    _.flag(this, store.notAsync, true);
                    return this;
                } else {
                    _super.call(this);
                }
            };
        });
    }
};
