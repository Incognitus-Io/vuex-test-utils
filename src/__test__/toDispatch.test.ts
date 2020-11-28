import { ActionTree, ActionContext } from 'vuex';

import { action } from '../actions';
import matcher from '../toDispatch';

expect.extend(matcher)

interface SyncAction extends ActionTree<any, any> {
    foobar(ctx: ActionContext<any, any>): void;
}

describe('.toDispatch', () => {
    it('passes when the action dispatchs a mutation', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('fizzbuzz');
            }
        } as SyncAction;

        action(actions.foobar).toDispatch('fizzbuzz');
    });
    it('fails when the action does not dispatchs a mutation', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('fizzbuzz');
            }
        } as SyncAction;

        expect(() => action(actions.foobar).toDispatch('foobar')).toThrowErrorMatchingSnapshot();
    });
});

describe('.not.toDispatch', () => {
    it('passes when the action does not dispatchs a mutation', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('fizzbuzz');
            }
        } as SyncAction;

        action(actions.foobar).not.toDispatch('foobar');
    });
    it('fails when the action dispatchs a mutation', () => {
        const actions = {
            foobar: (ctx) => {
                ctx.dispatch('fizzbuzz');
            }
        } as SyncAction;

        expect(() => action(actions.foobar).not.toDispatch('fizzbuzz')).toThrowErrorMatchingSnapshot();
    });
});
