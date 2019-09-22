import { DispatchOptions, CommitOptions, ActionContext } from 'vuex';

declare global {
    namespace Chai {
        export interface ExpectStatic {
            action<S, R>(
                action: actionFn<S, R>,
                payload?: any,
                config?: ActionCtx<S, R>,
            ): Assertion;

            actionAsync<S, R>(
                action: actionFn<S, R>,
                payload?: any,
                config?: ActionCtx<S, R>,
            ): Promise<Assertion>;
        }

        interface Assertion {
            commit: VuexCommits;
            dispatch: VuexDispatch;
        }

        interface VuexAssertion extends Assertion {
            and: VuexAssertion;
            as: VuexAssertion;
            is: VuexAssertion;
            not: VuexAssertion;
            root: VuexAssertion;
            containing: VuexContaining;
        }

        interface VuexCommitAssertions extends VuexAssertion {
            is: VuexCommitAssertions;
            not: VuexCommitAssertions;
            silent: VuexCommitAssertions;
        }

        interface VuexCommits {
            (type: string): VuexCommitAssertions;
            in: VuexOrder;
            containing: VuexContaining;
        }

        interface VuexDispatch {
            (type: string): VuexAssertion;
            in: VuexOrder;
            containing: VuexContaining;
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
export type actionMode = 'commit' | 'dispatch';