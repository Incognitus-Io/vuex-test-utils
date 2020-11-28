import { ActionTree, ActionContext } from 'vuex';

import { action } from '../actions';
import matcher from '../toDispatchWithPayload';

expect.extend(matcher)

interface SyncAction extends ActionTree<any, any> {
    foobar(ctx: ActionContext<any, any>): void;
}

describe('.toDispatchWithPayload', () => {
    describe('strict', () => {
        it('passes when the action dispatchs a mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b' })
                .toDispatchWithPayload('fizzbuzz', { a: 'b' }, true);
        });
        it('fails when the action dispatchs the wrong mutation mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b' })
                .toDispatchWithPayload('foobar', { a: 'b' }, true)
            ).toThrowErrorMatchingSnapshot();
        });
        it('fails when the action dispatchs a mutation with the wrong payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b' })
                .toDispatchWithPayload('fizzbuzz', { c: 'd' }, true)
            ).toThrowErrorMatchingSnapshot();
        });
    });
    describe('loose', () => {
        it('passes when the action dispatchs a mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b', c: 'd' })
                .toDispatchWithPayload('fizzbuzz', { a: 'b' });
        });
        it('fails when the action dispatchs the wrong mutation mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b' })
                .toDispatchWithPayload('foobar', { a: 'b' }, true)
            ).toThrowErrorMatchingSnapshot();
        });
        it('fails when the action dispatchs a mutation with the wrong payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b' })
                .toDispatchWithPayload('fizzbuzz', { c: 'd' })
            ).toThrowErrorMatchingSnapshot();
        });
    });
});

describe('.not.toDispatchWithPayload', () => {
    describe('strict', () => {
        it('fails when the action dispatchs a mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b' })
                .not.toDispatchWithPayload('fizzbuzz', { a: 'b' }, true)
            ).toThrowErrorMatchingSnapshot();
        });
        it('passes when the action dispatchs the wrong mutation mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b' })
                .not.toDispatchWithPayload('foobar', { a: 'b' }, true);
        });
        it('passes when the action dispatchs a mutation with the wrong payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b' })
                .not.toDispatchWithPayload('fizzbuzz', { c: 'd' }, true);
        });
    });
    describe('loose', () => {
        it('fails when the action dispatchs a mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b', c: 'd' })
                .not.toDispatchWithPayload('fizzbuzz', { a: 'b' })
            ).toThrowErrorMatchingSnapshot();
        });
        it('passes when the action dispatchs the wrong mutation mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b' })
                .not.toDispatchWithPayload('foobar', { a: 'b' }, true);
        });
        it('passes when the action dispatchs a mutation with the wrong payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.dispatch('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b' })
                .not.toDispatchWithPayload('fizzbuzz', { c: 'd' });
        });
    });
});
