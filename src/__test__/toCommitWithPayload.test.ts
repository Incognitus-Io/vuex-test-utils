import { ActionTree, ActionContext } from 'vuex';

import { action } from '../actions';
import matcher from '../toCommitWithPayload';

expect.extend(matcher)

interface SyncAction extends ActionTree<any, any> {
    foobar(ctx: ActionContext<any, any>): void;
}

describe('.toCommitWithPayload', () => {
    describe('strict', () => {
        it('passes when the action commits a mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b' })
                .toCommitWithPayload('fizzbuzz', { a: 'b' }, true);
        });
        it('fails when the action commits the wrong mutation mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b' })
                .toCommitWithPayload('foobar', { a: 'b' }, true)
            ).toThrowErrorMatchingSnapshot();
        });
        it('fails when the action commits a mutation with the wrong payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b' })
                .toCommitWithPayload('fizzbuzz', { c: 'd' }, true)
            ).toThrowErrorMatchingSnapshot();
        });
    });
    describe('loose', () => {
        it('passes when the action commits a mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b', c: 'd' })
                .toCommitWithPayload('fizzbuzz', { a: 'b' });
        });
        it('fails when the action commits the wrong mutation mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b' })
                .toCommitWithPayload('foobar', { a: 'b' }, true)
            ).toThrowErrorMatchingSnapshot();
        });
        it('fails when the action commits a mutation with the wrong payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b' })
                .toCommitWithPayload('fizzbuzz', { c: 'd' })
            ).toThrowErrorMatchingSnapshot();
        });
    });

    it('handles primitive types', () => {
        const actions = {
            foobar: (ctx, payload) => {
                ctx.commit('primitive', payload)
            }
        };

        action(actions.foobar, 'string')
            .toCommitWithPayload('primitive', 'string');
        action(actions.foobar, true)
            .toCommitWithPayload('primitive', true);
        action(actions.foobar, 98)
            .toCommitWithPayload('primitive', 98);
    });

    it('handles array types', () => {
        const actions = {
            foobar: (ctx, payload) => {
                ctx.dispatch('array', payload)
            }
        };

        action(actions.foobar, [1, 2, 3])
            .toDispatchWithPayload('array', [1, 2, 3]);
    });
});

describe('.not.toCommitWithPayload', () => {
    describe('strict', () => {
        it('fails when the action commits a mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b' })
                .not.toCommitWithPayload('fizzbuzz', { a: 'b' }, true)
            ).toThrowErrorMatchingSnapshot();
        });
        it('passes when the action commits the wrong mutation mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b' })
                .not.toCommitWithPayload('foobar', { a: 'b' }, true);
        });
        it('passes when the action commits a mutation with the wrong payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b' })
                .not.toCommitWithPayload('fizzbuzz', { c: 'd' }, true);
        });
    });
    describe('loose', () => {
        it('fails when the action commits a mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            expect(() => action(actions.foobar, { a: 'b', c: 'd' })
                .not.toCommitWithPayload('fizzbuzz', { a: 'b' })
            ).toThrowErrorMatchingSnapshot();
        });
        it('passes when the action commits the wrong mutation mutation with the correct payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b' })
                .not.toCommitWithPayload('foobar', { a: 'b' }, true);
        });
        it('passes when the action commits a mutation with the wrong payload', () => {
            const actions = {
                foobar: (ctx, payload) => {
                    ctx.commit('fizzbuzz', payload);
                }
            } as SyncAction;

            action(actions.foobar, { a: 'b' })
                .not.toCommitWithPayload('fizzbuzz', { c: 'd' });
        });
    });
});
