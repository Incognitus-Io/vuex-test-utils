import { ActionTree, ActionContext } from 'vuex';

import { action } from '../actions';
import matcher from '../toDispatchInOrder';

expect.extend(matcher)

interface SyncAction extends ActionTree<any, any> {
    foobar(ctx: ActionContext<any, any>): void;
}

describe('.toDispatchInOrder', () => {
    it('passes when the action dispatchs mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1');
                ctx.dispatch('2');
                ctx.dispatch('3');
            }
        } as SyncAction;

        action(actions.foobar).toDispatchInOrder(['1', '2', '3']);
    });
    it('passes when the acton dispatchs some mutations when not strict', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1');
                ctx.dispatch('2');
                ctx.dispatch('3');
            }
        } as SyncAction;

        action(actions.foobar).toDispatchInOrder(['1', '3'], false);
    });
    it('fails when the action does not dispatchs mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1');
                ctx.dispatch('2');
                ctx.dispatch('3');
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .toDispatchInOrder(['1', '2'])
        ).toThrowErrorMatchingSnapshot();
    });
});

describe('.not.toDispatchInOrder', () => {
    it('passes when the action does not dispatchs mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1');
                ctx.dispatch('2');
                ctx.dispatch('3');
            }
        } as SyncAction;

        action(actions.foobar).not.toDispatchInOrder(['1', '3', '2']);
    });
    it('fails when the action dispatchs mutations not strictly', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1');
                ctx.dispatch('2');
                ctx.dispatch('3');
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .not.toDispatchInOrder(['1', '3'], false)
        ).toThrowErrorMatchingSnapshot();
    });
    it('fails when the action dispatchs mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1');
                ctx.dispatch('2');
                ctx.dispatch('3');
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .not.toDispatchInOrder(['1', '2', '3'])
        ).toThrowErrorMatchingSnapshot();
    });
});
