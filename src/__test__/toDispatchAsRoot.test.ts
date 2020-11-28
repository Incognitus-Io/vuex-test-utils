import { ActionTree, ActionContext } from 'vuex';

import { action } from '../actions';
import matcher from '../toDispatchAsRoot';

expect.extend(matcher)

interface SyncAction extends ActionTree<any, any> {
    foobar(ctx: ActionContext<any, any>): void;
}

describe('.toDispatchAsRoot', () => {
    it('passes when the action dispatchs mutations as root', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1', undefined, { root: true });
            }
        } as SyncAction;

        action(actions.foobar).toDispatchAsRoot('1');
    });
    it('fails when the action dispatchs mutations but not as root', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1', undefined, { root: false });
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .toDispatchAsRoot('1')
        ).toThrowErrorMatchingSnapshot();
    });
    it('fails when the action does not dispatchs mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1', undefined, { root: true });
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .toDispatchAsRoot('NotIt')
        ).toThrowErrorMatchingSnapshot();
    });
});

describe('.not.toDispatchAsRoot', () => {
    it('passes when the action does not dispatchs mutations as root', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1', undefined, { root: false });
            }
        } as SyncAction;

        action(actions.foobar).not.toDispatchAsRoot('1');
    });
    it('passes when the action does not dispatchs mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1', undefined, { root: true });
            }
        } as SyncAction;

        action(actions.foobar).not.toDispatchAsRoot('NotIt');
    });
    it('fails when the action dispatchs mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('1', undefined, { root: true });
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .not.toDispatchAsRoot('1')
        ).toThrowErrorMatchingSnapshot();
    });
});
