import { ActionContext, CommitOptions, DispatchOptions } from 'vuex';
import chaiEx from './register';
import { actionFn, ObservedCommit, ObservedDispatch, commitFn, dispatchFn } from './types';
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

        let test: Chai.Assertion;
        const actionRes = action(ctx, payload);
        if (isPromise(actionRes)) {
            const asyncAction = actionRes as Promise<Chai.Assertion>;
            test = new Assertion(asyncAction.then(() => {
                _.flag(test, store.executedCommits, executedCommits);
                _.flag(test, store.executedDispatches, executedDispatches);

                return test;
            }));
        } else {
            test = new Assertion(null);
            _.flag(test, store.executedCommits, executedCommits);
            _.flag(test, store.executedDispatches, executedDispatches);
        }

        return test;
    }

    const isPromise = (obj: any) => obj && typeof obj.then === 'function';

    const getPromiseOrDefault = (assertion: Chai.AssertionStatic): PromiseLike<any> | undefined =>
        (isPromise(assertion._obj)) ? assertion._obj as PromiseLike<any> : undefined;

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
                const promise = getPromiseOrDefault(this);
                if (promise) {
                    this._obj = promise.then((test) => { _.flag(test, store.notAsync, true); return test; });
                    return this;
                } else {
                    _super.call(this);
                }
            };
        });
    }
};
