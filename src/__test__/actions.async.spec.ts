import chai, { expect, assert } from 'chai';
import { vuexChai } from '../actions';
import { ActionTree, ActionContext } from 'vuex';
import { AssertionError } from 'assert';

// tslint:disable:max-classes-per-file
// tslint:disable:no-unused-expression
describe('Actions.ts', () => {
    interface RootState {
        version: string;
    }
    interface ModuleState {
        fizz: string;
    }

    beforeEach(() => {
        chai.use(vuexChai);
    });

    describe('Asynchronous action', () => {
        interface SyncAction extends ActionTree<ModuleState, RootState> {
            foobar(ctx: ActionContext<ModuleState, RootState>, payload?: any): Promise<void>;
        }
        let actions: SyncAction;

        beforeEach(() => {
            actions = {
                async foobar(_, __) { return; },
            };
        });

        describe('commit', () => {
            it('Should commit a mutation', async () => {
                actions.foobar = async (ctx) => {
                    ctx.commit('fizzbuzz');
                };

                expect.action(actions.foobar)
                    .to.commit('fizzbuzz')
                    .getAwaiter;
            });

            it('Should fail when commit types do not match', async () => {
                const expectedCommit = 'somthing not right';
                actions.foobar = async (ctx) => {
                    ctx.commit('foobar');
                };

                try {
                    const act = expect.action(actions.foobar)
                        .to.commit(expectedCommit)
                        .getAwaiter;
                    await act;
                    assert.fail();
                } catch (err) {
                    expect(err.message).to.equal(`expected '${expectedCommit}' commit but found 'foobar' commit(s)`);
                }
            });

            it('Should chain for multiple commits', () => {
                actions.foobar = async (ctx) => {
                    ctx.commit('fizzbuzz');
                    ctx.commit('foobar');
                };

                return expect.action(actions.foobar)
                    .to.commit('fizzbuzz')
                    .and.commit('foobar')
                    .getAwaiter;
            });

            it('Should only run the action once per expectation', async () => {
                let count = 0;

                actions.foobar = async (ctx) => {
                    ctx.commit('1');
                    ctx.commit('2');
                    count++;
                };
                const act = expect.action(actions.foobar)
                    .to.commit('1').and.commit('2')
                    .getAwaiter;
                await act;

                expect(count).to.eq(1);
            });

            it('Should fail if checking the same commit type multiple times', async () => {
                actions.foobar = async (ctx) => {
                    ctx.commit('foobar');
                };

                try {
                    const act = expect.action(actions.foobar)
                        .to.commit('foobar').and.commit('foobar')
                        .getAwaiter;
                    await act;
                    assert.fail();
                } catch (err) {
                    const failedAssert = err as AssertionError;
                    expect(failedAssert.message).to.eq(`expected 'foobar' commit but found '' commit(s)`);
                }
            });

            it('Should find the specified commit between multiple commits', () => {
                actions.foobar = async (ctx) => {
                    ctx.commit('loading');
                    ctx.commit('foobar');
                    ctx.commit('loaded');
                };

                return expect.action(actions.foobar)
                    .to.commit('foobar')
                    .getAwaiter;
            });

            it('Should pass when checking for commit to not happen', () => {
                actions.foobar = async (ctx) => {
                    ctx.commit('SuperSecret');
                };

                return expect.action(actions.foobar)
                    .not.to.commit('Foobar')
                    .getAwaiter;
            });

            describe('payload', () => {
                it('Should commit with a payload', () => {
                    const expectedPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = async (ctx) => {
                        ctx.commit('fizzbuzz', expectedPayload);
                    };

                    return expect.action(actions.foobar)
                        .to.commit
                        .containing.payload(expectedPayload)
                        .getAwaiter;
                });

                it('Should fail when commit payload does not match', async () => {
                    const expectedPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = async (ctx) => {
                        ctx.commit('fizzbuzz', {});
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.commit
                            .containing.payload(expectedPayload)
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected payload '[{"foo":"bar"}]' but found '[{}]'`);
                    }
                });

                it('Should allow checking commit and payload', () => {
                    const expectedCommit = 'fizzbuzz';
                    const expectedPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = async (ctx) => {
                        ctx.commit('not what you`re looking for', { big: 'bang' });
                        ctx.commit(expectedCommit, expectedPayload);
                    };

                    return expect.action(actions.foobar)
                        .to.commit(expectedCommit)
                        .containing.payload(expectedPayload)
                        .getAwaiter;
                });

                it('Should support partial payload objects', () => {
                    class Foobar {
                        public version?: string;
                        public name?: string;

                        constructor(value: Partial<Foobar>) {
                            Object.assign(this, value);
                        }
                    }
                    const expectedPayload = { version: '1.0.0' } as Foobar;
                    actions.foobar = async (ctx) => {
                        ctx.commit('Something', new Foobar({
                            version: '1.0.0',
                            name: 'Fizzbuzz',
                        } as Foobar));
                    };

                    return expect.action(actions.foobar)
                        .to.commit
                        .partially.containing
                        .payload(expectedPayload)
                        .getAwaiter;
                });

                it('Should disable partial support after assertion', async () => {
                    class Foobar {
                        public version?: string;
                        public name?: string;

                        constructor(value: Partial<Foobar>) {
                            Object.assign(this, value);
                        }
                    }
                    const expectedPayload = { version: '1.0.0' } as Foobar;
                    actions.foobar = async (ctx) => {
                        ctx.commit('Something', new Foobar({
                            version: '1.0.0',
                            name: 'Fizzbuzz',
                        } as Foobar));
                        ctx.commit('Somehting', 'foobar');
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.commit
                            .partially.containing
                            .payload(expectedPayload)
                            .and.commit
                            .containing.payload('fooba')
                            .getAwaiter;
                        await act;
                        throw new Error('fail');
                    } catch (err) {
                        const failedAssert = err as Error;
                        expect(failedAssert.message).to.not.eq(`fail`);
                    }
                });

                it('Should handle deep objects on partials', () => {
                    class Foobar {
                        public message?: string;
                        public tags?: string[];

                        constructor(value: Partial<Foobar>) {
                            Object.assign(this, value);
                        }
                    }
                    const test = new Foobar({ message: 'foobar', tags: ['fizz', 'buzz'] });

                    actions.foobar = async (ctx) => {
                        ctx.commit('Something', test);
                    };

                    return expect.action(actions.foobar)
                        .to.commit
                        .partially.containing.payload(test)
                        .getAwaiter;
                });
            });

            describe('in.order', () => {
                it('Should check order loosely', () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading');
                        ctx.commit('fizzbuzz');
                        ctx.commit('foobar');
                        ctx.commit('loaded');
                    };

                    return expect.action(actions.foobar)
                        .to.commit
                        .in.order('fizzbuzz', 'foobar')
                        .getAwaiter;
                });

                it('Should when checking order fail when unexpected commit between expected commits', async () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading');
                        ctx.commit('foobar');
                        ctx.commit('loaded');
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.commit
                            .in.order('loading', 'loaded')
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected 'loaded' commit but found 'foobar'`);
                    }
                });
            });

            describe('as.root', () => {
                it('Should fail when no options are provided', async () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, undefined);
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.commit('loading')
                            .as.root
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected to be a root commit, but found no commit options`);
                    }
                });

                it('Should fail when not a root commit but expected', async () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, { root: false });
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.commit('loading')
                            .as.root
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected false to be true`);
                    }
                });

                it('Should pass when is a root commit', () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, { root: true });
                    };

                    return expect.action(actions.foobar)
                        .to.commit('loading')
                        .as.root
                        .getAwaiter;
                });
            });

            describe('not.as.root', () => {
                it('Should fail when no options are provided', async () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, undefined);
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.commit('loading')
                            .not.as.root
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected to be a root commit, but found no commit options`);
                    }
                });

                it('Should fail when is root commit but not expected', async () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, { root: true });
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.commit('loading')
                            .not.as.root
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected true to be false`);
                    }
                });

                it('Should pass when is not root commit', () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, { root: false });
                    };

                    return expect.action(actions.foobar)
                        .to.commit('loading')
                        .not.as.root
                        .getAwaiter;
                });
            });

            describe('is.silent', () => {
                it('Should fail when no options are provided', async () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, undefined);
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.commit('loading')
                            .is.silent
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message)
                            .to.eq(`expected to be a silent commit, but found no commit options`);
                    }
                });

                it('Should fail when not a root commit but expected', async () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, { silent: false });
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.commit('loading')
                            .is.silent
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected false to be true`);
                    }
                });

                it('Should pass when is a root commit', () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, { silent: true });
                    };

                    return expect.action(actions.foobar)
                        .to.commit('loading')
                        .is.silent
                        .getAwaiter;
                });
            });

            describe('is.not.silent', () => {
                it('Should fail when no options are provided', async () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, undefined);
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.commit('loading')
                            .is.not.silent
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message)
                            .to.eq(`expected to be a silent commit, but found no commit options`);
                    }
                });

                it('Should fail when is root commit but not expected', async () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, { silent: true });
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.commit('loading')
                            .is.not.silent
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected true to be false`);
                    }
                });

                it('Should pass when is not root commit', () => {
                    actions.foobar = async (ctx) => {
                        ctx.commit('loading', undefined, { silent: false });
                    };

                    return expect.action(actions.foobar)
                        .to.commit('loading')
                        .is.not.silent
                        .getAwaiter;
                });
            });
        });

        describe('dispatch', () => {
            it('Should dispatch an action', () => {
                actions.foobar = async (ctx) => {
                    await ctx.dispatch('fizzbuzz');
                };

                return expect.action(actions.foobar)
                    .to.dispatch('fizzbuzz')
                    .getAwaiter;
            });

            it('Should fail when dispatch types do not match', async () => {
                const expectedDispatch = 'somthing not right';
                actions.foobar = async (ctx) => {
                    await ctx.dispatch('fizzbuzz');
                };

                try {
                    const act = expect.action(actions.foobar)
                        .to.dispatch(expectedDispatch)
                        .getAwaiter;
                    await act;
                    assert.fail();
                } catch (err) {
                    const failedAssert = err as AssertionError;
                    expect(failedAssert.message).to.eq(`expected '${expectedDispatch}' dispatch but found 'fizzbuzz' dispatch(s)`);
                }
            });

            it('Should chain for multiple dispatches', () => {
                actions.foobar = async (ctx) => {
                    await ctx.dispatch('fizzbuzz');
                    await ctx.dispatch('foobar');
                };
                return expect.action(actions.foobar)
                    .to.dispatch('fizzbuzz')
                    .and.dispatch('foobar')
                    .getAwaiter;
            });

            it('Should only run the action once per expectation', async () => {
                let count = 0;

                actions.foobar = async (ctx) => {
                    await ctx.dispatch('1');
                    await ctx.dispatch('2');
                    count++;
                };

                const act = expect.action(actions.foobar).to.dispatch('1').and.dispatch('2').getAwaiter;
                await act;

                expect(count).to.eq(1);
            });

            it('Should fail if checking the same dispatch type multiple times', async () => {
                actions.foobar = async (ctx) => {
                    await ctx.dispatch('foobar');
                };

                try {
                    const act = expect.action(actions.foobar)
                        .to.dispatch('foobar')
                        .and.dispatch('foobar')
                        .getAwaiter;
                    await act;
                    assert.fail();
                } catch (err) {
                    const failedAssert = err as AssertionError;
                    expect(failedAssert.message).to.eq(`expected 'foobar' dispatch but found '' dispatch(s)`);
                }
            });

            it('Should find the specified dispatch between multiple dispatches', () => {
                actions.foobar = async (ctx) => {
                    await ctx.dispatch('loading');
                    await ctx.dispatch('foobar');
                    await ctx.dispatch('loaded');
                };

                return expect.action(actions.foobar)
                    .to.dispatch('foobar')
                    .getAwaiter;
            });

            it('Should pass when checking for dispatch to not happen', () => {
                actions.foobar = async (ctx) => {
                    ctx.dispatch('SuperSecret');
                };

                return expect.action(actions.foobar)
                    .not.to.dispatch('Foobar')
                    .getAwaiter;
            });

            describe('payload', () => {
                it('Should dispatch with a payload', () => {
                    const expectedPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = async (ctx) => {
                        await ctx.dispatch('fizzbuzz', expectedPayload);
                    };

                    return expect.action(actions.foobar)
                        .to.dispatch
                        .containing.payload(expectedPayload)
                        .getAwaiter;
                });

                it('Should fail when payload does not match', async () => {
                    const expectedPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = async (ctx) => {
                        await ctx.dispatch('fizzbuzz', {});
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.dispatch
                            .containing.payload(expectedPayload)
                            .getAwaiter;
                        await act;
                        throw new Error();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected payload '[{"foo":"bar"}]' but found '[{}]'`);
                    }
                });

                it('Should allow checking dispatch and payload', () => {
                    const expectedDispatch = 'fizzbuzz';
                    const expectedPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = async (ctx) => {
                        await ctx.dispatch('not what you`re looking for', { big: 'bang' });
                        await ctx.dispatch(expectedDispatch, expectedPayload);
                    };

                    return expect.action(actions.foobar)
                        .to.dispatch(expectedDispatch)
                        .containing.payload(expectedPayload)
                        .getAwaiter;
                });

                it('Should support partial payload objects', () => {
                    class Foobar {
                        public version?: string;
                        public name?: string;

                        constructor(value: Partial<Foobar>) {
                            Object.assign(this, value);
                        }
                    }
                    const expectedPayload = { version: '1.0.0' } as Foobar;
                    actions.foobar = async (ctx) => {
                        ctx.dispatch('Something', new Foobar({
                            version: '1.0.0',
                            name: 'Fizzbuzz',
                        } as Foobar));
                    };

                    return expect.action(actions.foobar)
                        .to.dispatch
                        .partially.containing
                        .payload(expectedPayload)
                        .getAwaiter;
                });
            });

            describe('in.order', () => {
                it('Should check order loosely', () => {
                    actions.foobar = async (ctx) => {
                        await ctx.dispatch('loading');
                        await ctx.dispatch('fizzbuzz');
                        await ctx.dispatch('foobar');
                        await ctx.dispatch('loaded');
                    };

                    return expect.action(actions.foobar)
                        .to.dispatch
                        .in.order('fizzbuzz', 'foobar')
                        .getAwaiter;
                });

                it('Should fail when unexpected dispatch between expected dispatches', async () => {
                    actions.foobar = async (ctx) => {
                        await ctx.dispatch('loading');
                        await ctx.dispatch('foobar');
                        await ctx.dispatch('loaded');
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.dispatch
                            .in.order('loading', 'loaded')
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected 'loaded' dispatch but found 'foobar'`);
                    }
                });
            });

            describe('as.root', () => {
                it('Should fail when no options are provided', async () => {
                    actions.foobar = async (ctx) => {
                        await ctx.dispatch('loading', undefined, undefined);
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.dispatch('loading')
                            .as.root
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected to be a root dispatch, but found no dispatch options`);
                    }
                });

                it('Should fail when not a root dispatch but expected', async () => {
                    actions.foobar = async (ctx) => {
                        await ctx.dispatch('loading', undefined, { root: false });
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.dispatch('loading')
                            .as.root
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected false to be true`);
                    }
                });

                it('Should pass when is a root dispatch', () => {
                    actions.foobar = async (ctx) => {
                        await ctx.dispatch('loading', undefined, { root: true });
                    };

                    expect.action(actions.foobar).to.dispatch('loading').as.root;
                });
            });

            describe('not.as.root', () => {
                it('Should fail when no options are provided', async () => {
                    actions.foobar = async (ctx) => {
                        await ctx.dispatch('loading', undefined, undefined);
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.dispatch('loading')
                            .not.as.root
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected to be a root dispatch, but found no dispatch options`);
                    }
                });

                it('Should fail when is root dispatch but not expected', async () => {
                    actions.foobar = async (ctx) => {
                        await ctx.dispatch('loading', undefined, { root: true });
                    };

                    try {
                        const act = expect.action(actions.foobar)
                            .to.dispatch('loading')
                            .not.as.root
                            .getAwaiter;
                        await act;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected true to be false`);
                    }
                });

                it('Should pass when is not root dispatch', () => {
                    actions.foobar = async (ctx) => {
                        await ctx.dispatch('loading', undefined, { root: false });
                    };

                    return expect.action(actions.foobar)
                        .to.dispatch('loading')
                        .not.as.root
                        .getAwaiter;
                });
            });
        });

        describe('Setup', () => {
            describe('actionPayload', () => {
                it('Should execute the action with the payload', async () => {
                    let actualActionPayload: any;
                    const expectedActionPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = async (_, payload) => {
                        actualActionPayload = payload;
                    };

                    const act = expect.action(actions.foobar, expectedActionPayload)
                        .commit.getAwaiter;
                    await act;

                    expect(actualActionPayload).to.eql(expectedActionPayload);
                });
            });

            describe('actonContext', () => {
                it('Should allow setting state', async () => {
                    let actualActionState: any;
                    const expectedActionState = {
                        fizz: 'buzz',
                    };
                    actions.foobar = async (ctx, _?) => {
                        actualActionState = ctx.state;
                    };

                    const act = expect.action(actions.foobar, undefined, { state: expectedActionState })
                        .commit
                        .getAwaiter;
                    await act;

                    expect(actualActionState).to.eql(expectedActionState);
                });

                it('Should allow setting root state', async () => {
                    let actualActionState: any;
                    const expectedActionState = {
                        version: 'buzz',
                    };
                    actions.foobar = async (ctx, _?) => {
                        actualActionState = ctx.rootState;
                    };

                    const act = expect.action(actions.foobar, undefined, { rootState: expectedActionState })
                        .commit
                        .getAwaiter;
                    await act;

                    expect(actualActionState).to.eql(expectedActionState);
                });

                it('Should allow setting getters', async () => {
                    let actualActionGetters: any;
                    const expectedActionGetters = {
                        fizz: 'buzz',
                    };
                    actions.foobar = async (ctx, _?) => {
                        actualActionGetters = ctx.getters;
                    };

                    const act = expect.action(actions.foobar, undefined, { getters: expectedActionGetters })
                        .commit
                        .getAwaiter;
                    await act;

                    expect(actualActionGetters).to.eql(expectedActionGetters);
                });

                it('Should allow setting root getters', async () => {
                    let actualActionGetters: any;
                    const expectedActionGetters = {
                        fizz: 'buzz',
                    };
                    actions.foobar = async (ctx, _?) => {
                        actualActionGetters = ctx.rootGetters;
                    };

                    const act = expect.action(actions.foobar, undefined, { rootGetters: expectedActionGetters })
                        .commit
                        .getAwaiter;
                    await act;

                    expect(actualActionGetters).to.eql(expectedActionGetters);
                });
            });
        });
    });
});
