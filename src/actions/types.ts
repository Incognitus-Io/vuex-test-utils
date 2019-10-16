import { DispatchOptions, CommitOptions, ActionContext } from 'vuex';

declare global {
    namespace Chai {
        export interface ExpectStatic {
            action<S, R>(
                action: actionFn<S, R>,
                payload?: any,
                config?: ActionCtx<S, R>,
            ): Assertion | PromisedAssertion;
        }

        interface Assertion {
            commit: VuexCommits;
            dispatch: VuexDispatch;
            getAwaiter: PromiseLike<any>;
        }

        interface PromisedAssertion extends PromiseLike<any> {
            commit: VuexCommits;
            dispatch: VuexDispatch;
            getAwaiter: PromiseLike<any>;
        }

        interface VuexAssertion extends Assertion {
            and: VuexAssertion;
            as: VuexAssertion;
            is: VuexAssertion;
            not: VuexAssertion;
            root: VuexAssertion;
            partially: VuexActionCtxAssertions;
            containing: VuexContaining;
        }

        interface VuexCommitAssertions extends VuexAssertion {
            is: VuexCommitAssertions;
            not: VuexCommitAssertions;
            silent: VuexCommitAssertions;
        }

        interface VuexActionCtxAssertions {
            in: VuexOrder;
            partially: VuexActionCtxAssertions;
            containing: VuexContaining;
            getAwaiter: PromiseLike<any>;
        }

        interface VuexCommits extends VuexActionCtxAssertions {
            (type?: string): VuexCommitAssertions;
        }

        interface VuexDispatch extends VuexActionCtxAssertions {
            (type: string): VuexAssertion;
        }

        interface VuexContaining {
            payload: (payload: any) => Assertion;
        }

        interface VuexOrder {
            order: (...types: string[]) => Assertion;
        }

        interface ActionCtx<S, R> {
            state?: S;
            rootState?: R;
            getters?: any;
            rootGetters?: any;
        }
    }

}

export interface ObservedBase {
    type: string;
    payload?: any;
}
export interface ObservedDispatch extends ObservedBase {
    options?: DispatchOptions;
}
export interface ObservedCommit extends ObservedBase {
    options?: CommitOptions;
}
export type commitFn = (_: string, __?: any, ___?: CommitOptions) => void;
export type dispatchFn = (_: string, __?: any, ___?: DispatchOptions) => any;
export type actionFn<S, R> = (_: ActionContext<S, R>, __?: any) => void | Promise<void>;
export type actionFnSync<S, R> = (_: ActionContext<S, R>, __?: any) => void;
export type actionMode = 'commit' | 'dispatch';
