/// <reference path="../types/index.d.ts" />

import { DispatchOptions, CommitOptions, ActionContext } from 'vuex';

import { action } from "./actions";
import toCommit from "./toCommit";
import toCommitAsRoot from "./toCommitAsRoot";
import toCommitInOrder from "./toCommitInOrder";
import toCommitWithPayload from "./toCommitWithPayload";
import toDispatch from "./toDispatch";
import toDispatchAsRoot from "./toDispatchAsRoot";
import toDispatchInOrder from "./toDispatchInOrder";
import toDispatchWithPayload from "./toDispatchWithPayload";

expect.action = action;
expect.extend({
    ...toCommit,
    ...toCommitAsRoot,
    ...toCommitInOrder,
    ...toCommitWithPayload,
    ...toDispatch,
    ...toDispatchAsRoot,
    ...toDispatchInOrder,
    ...toDispatchWithPayload,
});

export interface ActionCtx<S, R> {
    state?: S;
    rootState?: R;
    getters?: any;
    rootGetters?: any;
  }

/** The results of an action expectation. */
export interface ActionResults {
    /** Any commit that was executed in order. */
    commits: ObservedCommit[];
    /** Any dispatch that was executed in order. */
    dispatches: ObservedDispatch[];
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
/** An Vuex action function. */
export type actionFn<S, R> = (_: ActionContext<S, R>, __?: any) => (any | Promise<any>);
export type actionPromise<S, R> = (_: ActionContext<S, R>, __?: any) => Promise<any>
export type actionMode = 'commit' | 'dispatch';