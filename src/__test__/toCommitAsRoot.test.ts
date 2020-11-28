import { ActionTree, ActionContext } from 'vuex';

import { action } from '../actions';
import matcher from '../toCommitAsRoot';

expect.extend(matcher)

interface SyncAction extends ActionTree<any, any> {
    foobar(ctx: ActionContext<any, any>): void;
}

describe('.toCommitAsRoot', () => {
    it('passes when the action commits mutations as root', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1', undefined, { root: true });
            }
        } as SyncAction;

        action(actions.foobar).toCommitAsRoot('1');
    });
    it('fails when the action commits mutations but not as root', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1', undefined, { root: false });
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .toCommitAsRoot('1')
        ).toThrowErrorMatchingSnapshot();
    });
    it('fails when the action does not commits mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1', undefined, { root: true });
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .toCommitAsRoot('NotIt')
        ).toThrowErrorMatchingSnapshot();
    });
});

describe('.not.toCommitAsRoot', () => {
    it('passes when the action does not commits mutations as root', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1', undefined, { root: false });
            }
        } as SyncAction;

        action(actions.foobar).not.toCommitAsRoot('1');
    });
    it('passes when the action does not commits mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1', undefined, { root: true });
            }
        } as SyncAction;

        action(actions.foobar).not.toCommitAsRoot('NotIt');
    });
    it('fails when the action commits mutations', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('1', undefined, { root: true });
            }
        } as SyncAction;

        expect(() => action(actions.foobar)
            .not.toCommitAsRoot('1')
        ).toThrowErrorMatchingSnapshot();
    });
});
