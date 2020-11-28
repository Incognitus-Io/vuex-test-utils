import { ActionTree, ActionContext } from 'vuex';

import { action } from '../actions';
import matcher from '../toCommitInOrder';

expect.extend(matcher)

interface SyncAction extends ActionTree<any, any> {
    foobar(ctx: ActionContext<any, any>): void;
}

describe('.toCommitInOrder', () => {
    it('passes when the action commits mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1');
                ctx.commit('2');
                ctx.commit('3');
            }
        } as SyncAction;

        action(actions.foobar).toCommitInOrder(['1', '2', '3']);
    });
    it('passes when the acton commits some mutations when not strict', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1');
                ctx.commit('2');
                ctx.commit('3');
            }
        } as SyncAction;

        action(actions.foobar).toCommitInOrder(['1', '3'], false);
    });
    it('fails when the action does not commits mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1');
                ctx.commit('2');
                ctx.commit('3');
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .toCommitInOrder(['1', '2'])
        ).toThrowErrorMatchingSnapshot();
    });
});

describe('.not.toCommitInOrder', () => {
    it('passes when the action does not commits mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1');
                ctx.commit('2');
                ctx.commit('3');
            }
        } as SyncAction;

        action(actions.foobar).not.toCommitInOrder(['1', '3', '2']);
    });
    it('fails when the action commits mutations not strictly', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1');
                ctx.commit('2');
                ctx.commit('3');
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .not.toCommitInOrder(['1', '3'], false)
        ).toThrowErrorMatchingSnapshot();
    });
    it('fails when the action commits mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1');
                ctx.commit('2');
                ctx.commit('3');
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .not.toCommitInOrder(['1', '2', '3'])
        ).toThrowErrorMatchingSnapshot();
    });
});
