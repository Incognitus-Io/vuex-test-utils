/// <reference types="../typings" />

import { ActionTree, ActionContext } from 'vuex';

import { action } from '../actions';

describe('Action', () => {
    interface RootState {
        version: string;
    }
    interface ModuleState {
        fizz: string;
    }
    interface SyncAction extends ActionTree<ModuleState, RootState> {
        foobar(ctx: ActionContext<ModuleState, RootState>, payload: any): void;
    }
    let actions: SyncAction;

    beforeEach(() => {
        actions = {
            foobar(_, __) { return; },
        };
    });


    it('tracks each commit', () => {
        actions.foobar = (ctx) => {
            ctx.commit('fizzbuzz1');
            ctx.commit('fizzbuzz2');
            ctx.commit('fizzbuzz3');
        };

        const results = action(actions.foobar);

        results.toHaveProperty('commits', [
            { type: 'fizzbuzz1', payload: undefined, options: undefined },
            { type: 'fizzbuzz2', payload: undefined, options: undefined },
            { type: 'fizzbuzz3', payload: undefined, options: undefined },
        ])
    });

    it('tracks each dispatch', () => {
        actions.foobar = (ctx) => {
            ctx.dispatch('fizzbuzz1', "foo", { root: true });
            ctx.dispatch('fizzbuzz2');
            ctx.dispatch('fizzbuzz3');
        };

        const results = action(actions.foobar);

        
        results.toHaveProperty('dispatches', [
            { type: 'fizzbuzz1', payload: "foo", options: { root: true } },
            { type: 'fizzbuzz2', payload: undefined, options: undefined },
            { type: 'fizzbuzz3', payload: undefined, options: undefined },
        ])
    });
});
