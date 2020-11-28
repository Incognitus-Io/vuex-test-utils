import { ActionTree, ActionContext } from 'vuex';

import { action } from '../actions';
import matcher from '../toCommit';

expect.extend(matcher)

interface SyncAction extends ActionTree<any, any> {
    foobar(ctx: ActionContext<any, any>): void;
}
interface AsyncAction extends ActionTree<any, any> {
    foobar(ctx: ActionContext<any, any>): Promise<void>;
}

describe('.toCommit', () => {
    it('passes when the action commits a mutation', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('fizzbuzz');
            }
        } as SyncAction;

        action(actions.foobar).toCommit('fizzbuzz');
    });
    it('fails when the action does not commits a mutation', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('fizzbuzz');
            }
        } as SyncAction;

        expect(() => action(actions.foobar).toCommit('foobar')).toThrowErrorMatchingSnapshot();
    });

    it('handles async actions', async () => {
        const actions = {
            foobar: async (ctx) => {
                ctx.commit('fizzbuzz');
                await new Promise(resolve => setImmediate(() => resolve()));
                ctx.commit('foo');
            }
        } as AsyncAction;
        
        await action(actions.foobar).resolves.toCommit('foo');
    });
});

describe('.not.toCommit', () => {
    it('passes when the action does not commits a mutation', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('fizzbuzz');
            }
        } as SyncAction;

        action(actions.foobar).not.toCommit('foobar');
    });
    it('fails when the action commits a mutation', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.commit('fizzbuzz');
            }
        } as SyncAction;

        expect(() => action(actions.foobar).not.toCommit('fizzbuzz')).toThrowErrorMatchingSnapshot();
    });
});
