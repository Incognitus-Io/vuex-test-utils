import chai, { assert, expect } from 'chai';
import { ActionTree, ActionContext } from 'vuex';
import { AssertionError } from 'assert';

import { vuexChai } from '../actions';

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

    describe('Synchronous action', () => {
        interface SyncAction extends ActionTree<ModuleState, RootState> {
            foobar(ctx: ActionContext<ModuleState, RootState>, payload: any): void;
        }
        let actions: SyncAction;

        beforeEach(() => {
            actions = {
                foobar(_, __) { return; },
            };
        });

        describe('commit', () => {
            it('Should commit a mutation', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('fizzbuzz');
                };

                expect.action(actions.foobar).to.commit('fizzbuzz');
            });

            it('Should fail when commit types do not match', () => {
                const expectedCommit = 'somthing not right';
                actions.foobar = (ctx) => {
                    ctx.commit('foobar');
                };

                try {
                    expect.action(actions.foobar).to.commit(expectedCommit);
                    assert.fail();
                } catch (err) {
                    const failedAssert = err as AssertionError;
                    expect(failedAssert.message).to.eq(`expected '${expectedCommit}' commit but found 'foobar' commit(s)`);
                }
            });

            it('Should chain for multiple commits', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('fizzbuzz');
                    ctx.commit('foobar');
                };
                expect.action(actions.foobar).to.commit('fizzbuzz').and.commit('foobar');
            });

            it('Should only run the action once per expectation', () => {
                let count = 0;

                actions.foobar = (ctx) => {
                    ctx.commit('1');
                    ctx.commit('2');
                    count++;
                };
                expect.action(actions.foobar).to.commit('1').and.commit('2');

                expect(count).to.eq(1);
            });

            it('Should fail if checking the same commit type multiple times', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('foobar');
                };

                try {
                    expect.action(actions.foobar).to.commit('foobar').and.commit('foobar');
                    assert.fail();
                } catch (err) {
                    const failedAssert = err as AssertionError;
                    expect(failedAssert.message).to.eq(`expected 'foobar' commit but found '' commit(s)`);
                }
            });

            it('Should find the specified commit between multiple commits', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('loading');
                    ctx.commit('foobar');
                    ctx.commit('loaded');
                };

                expect.action(actions.foobar).to.commit('foobar');
            });

            describe('payload', () => {
                it('Should commit with a payload', () => {
                    const expectedPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = (ctx) => {
                        ctx.commit('fizzbuzz', expectedPayload);
                    };

                    expect.action(actions.foobar).to.commit.containing.payload(expectedPayload);
                });

                it('Should fail when commit payload does not match', () => {
                    const expectedPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = (ctx) => {
                        ctx.commit('fizzbuzz', {});
                    };

                    try {
                        expect.action(actions.foobar).to.commit.containing.payload(expectedPayload);
                        throw new Error();
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
                    actions.foobar = (ctx) => {
                        ctx.commit('not what you`re looking for', { big: 'bang' });
                        ctx.commit(expectedCommit, expectedPayload);
                    };

                    expect.action(actions.foobar).to.commit(expectedCommit).containing.payload(expectedPayload);
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
                    actions.foobar = (ctx) => {
                        ctx.commit('Something', new Foobar({
                            version: '1.0.0',
                            name: 'Fizzbuzz',
                        } as Foobar));
                    };

                    expect.action(actions.foobar)
                        .to.commit
                        .partially.containing
                        .payload(expectedPayload);
                });

                it('Should disable partial support after assertion', () => {
                    class Foobar {
                        public version?: string;
                        public name?: string;

                        constructor(value: Partial<Foobar>) {
                            Object.assign(this, value);
                        }
                    }
                    const expectedPayload = { version: '1.0.0' } as Foobar;
                    actions.foobar = (ctx) => {
                        ctx.commit('Something', new Foobar({
                            version: '1.0.0',
                            name: 'Fizzbuzz',
                        } as Foobar));
                        ctx.commit('Somehting', 'foobar');
                    };

                    try {
                        expect.action(actions.foobar)
                            .to.commit
                            .partially.containing
                            .payload(expectedPayload)
                            .and.commit
                            .containing.payload('fooba');
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
                    const tag = 'API Error';
                    const test = new Foobar({ message: 'foobar', tags: [tag] });

                    actions.foobar = (ctx) => {
                        ctx.commit('Something', test);
                    };

                    expect.action(actions.foobar)
                        .to.commit
                        .partially.containing.payload(test);
                });
            });

            describe('in.order', () => {
                it('Should check order loosely', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading');
                        ctx.commit('fizzbuzz');
                        ctx.commit('foobar');
                        ctx.commit('loaded');
                    };

                    expect.action(actions.foobar).to.commit.in.order('fizzbuzz', 'foobar');
                });

                it('Should when checking order fail when unexpected commit between expected commits', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading');
                        ctx.commit('foobar');
                        ctx.commit('loaded');
                    };

                    try {
                        expect.action(actions.foobar).to.commit.in.order('loading', 'loaded');
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected 'loaded' commit but found 'foobar'`);
                    }
                });
            });

            describe('as.root', () => {
                it('Should fail when no options are provided', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, undefined);
                    };

                    try {
                        expect.action(actions.foobar).to.commit('loading').as.root;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected to be a root commit, but found no commit options`);
                    }
                });

                it('Should fail when not a root commit but expected', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, { root: false });
                    };

                    try {
                        expect.action(actions.foobar).to.commit('loading').as.root;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected false to be true`);
                    }
                });

                it('Should pass when is a root commit', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, { root: true });
                    };

                    expect.action(actions.foobar).to.commit('loading').as.root;
                });
            });

            describe('not.as.root', () => {
                it('Should fail when no options are provided', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, undefined);
                    };

                    try {
                        expect.action(actions.foobar).to.commit('loading').not.as.root;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected to be a root commit, but found no commit options`);
                    }
                });

                it('Should fail when is root commit but not expected', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, { root: true });
                    };

                    try {
                        expect.action(actions.foobar).to.commit('loading').not.as.root;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected true to be false`);
                    }
                });

                it('Should pass when is not root commit', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, { root: false });
                    };

                    expect.action(actions.foobar).to.commit('loading').not.as.root;
                });
            });

            describe('is.silent', () => {
                it('Should fail when no options are provided', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, undefined);
                    };

                    try {
                        expect.action(actions.foobar).to.commit('loading').is.silent;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message)
                            .to.eq(`expected to be a silent commit, but found no commit options`);
                    }
                });

                it('Should fail when not a root commit but expected', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, { silent: false });
                    };

                    try {
                        expect.action(actions.foobar).to.commit('loading').is.silent;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected false to be true`);
                    }
                });

                it('Should pass when is a root commit', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, { silent: true });
                    };

                    expect.action(actions.foobar).to.commit('loading').is.silent;
                });
            });

            describe('is.not.silent', () => {
                it('Should fail when no options are provided', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, undefined);
                    };

                    try {
                        expect.action(actions.foobar).to.commit('loading').is.not.silent;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message)
                            .to.eq(`expected to be a silent commit, but found no commit options`);
                    }
                });

                it('Should fail when is root commit but not expected', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, { silent: true });
                    };

                    try {
                        expect.action(actions.foobar).to.commit('loading').is.not.silent;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected true to be false`);
                    }
                });

                it('Should pass when is not root commit', () => {
                    actions.foobar = (ctx) => {
                        ctx.commit('loading', undefined, { silent: false });
                    };

                    expect.action(actions.foobar).to.commit('loading').is.not.silent;
                });
            });
        });

        describe('dispatch', () => {
            it('Should dispatch an action', () => {
                actions.foobar = (ctx) => {
                    ctx.dispatch('fizzbuzz');
                };

                expect.action(actions.foobar).to.dispatch('fizzbuzz');
            });

            it('Should fail when dispatch types do not match', () => {
                const expectedDispatch = 'somthing not right';
                actions.foobar = (ctx) => {
                    ctx.dispatch('fizzbuzz');
                };

                try {
                    expect.action(actions.foobar).to.dispatch(expectedDispatch);
                    assert.fail();
                } catch (err) {
                    const failedAssert = err as AssertionError;
                    expect(failedAssert.message).to.eq(`expected '${expectedDispatch}' dispatch but found 'fizzbuzz' dispatch(s)`);
                }
            });

            it('Should chain for multiple dispatches', () => {
                actions.foobar = (ctx) => {
                    ctx.dispatch('fizzbuzz');
                    ctx.dispatch('foobar');
                };
                expect.action(actions.foobar)
                    .to.dispatch('fizzbuzz')
                    .and.dispatch('foobar');
            });

            it('Should only run the action once per expectation', () => {
                let count = 0;

                actions.foobar = (ctx) => {
                    ctx.dispatch('1');
                    ctx.dispatch('2');
                    count++;
                };
                expect.action(actions.foobar).to.dispatch('1').and.dispatch('2');

                expect(count).to.eq(1);
            });

            it('Should fail if checking the same dispatch type multiple times', () => {
                actions.foobar = (ctx) => {
                    ctx.dispatch('foobar');
                };

                try {
                    expect.action(actions.foobar).to.dispatch('foobar').and.dispatch('foobar');
                    assert.fail();
                } catch (err) {
                    const failedAssert = err as AssertionError;
                    expect(failedAssert.message).to.eq(`expected 'foobar' dispatch but found '' dispatch(s)`);
                }
            });

            it('Should find the specified dispatch between multiple dispatches', () => {
                actions.foobar = (ctx) => {
                    ctx.dispatch('loading');
                    ctx.dispatch('foobar');
                    ctx.dispatch('loaded');
                };

                expect.action(actions.foobar).to.dispatch('foobar');
            });

            describe('payload', () => {
                it('Should dispatch with a payload', () => {
                    const expectedPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = (ctx) => {
                        ctx.dispatch('fizzbuzz', expectedPayload);
                    };

                    expect.action(actions.foobar).to.dispatch.containing.payload(expectedPayload);
                });

                it('Should fail when payload does not match', () => {
                    const expectedPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = (ctx) => {
                        ctx.dispatch('fizzbuzz', {});
                    };

                    try {
                        expect.action(actions.foobar).to.dispatch.containing.payload(expectedPayload);
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
                    actions.foobar = (ctx) => {
                        ctx.dispatch('not what you`re looking for', { big: 'bang' });
                        ctx.dispatch(expectedDispatch, expectedPayload);
                    };

                    expect.action(actions.foobar).to.dispatch(expectedDispatch).containing.payload(expectedPayload);
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
                    actions.foobar = (ctx) => {
                        ctx.dispatch('Something', new Foobar({
                            version: '1.0.0',
                            name: 'Fizzbuzz',
                        } as Foobar));
                    };

                    expect.action(actions.foobar)
                        .to.dispatch
                        .partially.containing
                        .payload(expectedPayload);
                });
            });

            describe('in.order', () => {
                it('Should check order loosely', () => {
                    actions.foobar = (ctx) => {
                        ctx.dispatch('loading');
                        ctx.dispatch('fizzbuzz');
                        ctx.dispatch('foobar');
                        ctx.dispatch('loaded');
                    };

                    expect.action(actions.foobar).to.dispatch.in.order('fizzbuzz', 'foobar');
                });

                it('Should fail when unexpected dispatch between expected dispatches', () => {
                    actions.foobar = (ctx) => {
                        ctx.dispatch('loading');
                        ctx.dispatch('foobar');
                        ctx.dispatch('loaded');
                    };

                    try {
                        expect.action(actions.foobar).to.dispatch.in.order('loading', 'loaded');
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected 'loaded' dispatch but found 'foobar'`);
                    }
                });
            });

            describe('as.root', () => {
                it('Should fail when no options are provided', () => {
                    actions.foobar = (ctx) => {
                        ctx.dispatch('loading', undefined, undefined);
                    };

                    try {
                        expect.action(actions.foobar).to.dispatch('loading').as.root;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected to be a root dispatch, but found no dispatch options`);
                    }
                });

                it('Should fail when not a root dispatch but expected', () => {
                    actions.foobar = (ctx) => {
                        ctx.dispatch('loading', undefined, { root: false });
                    };

                    try {
                        expect.action(actions.foobar).to.dispatch('loading').as.root;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected false to be true`);
                    }
                });

                it('Should pass when is a root dispatch', () => {
                    actions.foobar = (ctx) => {
                        ctx.dispatch('loading', undefined, { root: true });
                    };

                    expect.action(actions.foobar).to.dispatch('loading').as.root;
                });
            });

            describe('not.as.root', () => {
                it('Should fail when no options are provided', () => {
                    actions.foobar = (ctx) => {
                        ctx.dispatch('loading', undefined, undefined);
                    };

                    try {
                        expect.action(actions.foobar).to.dispatch('loading').not.as.root;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected to be a root dispatch, but found no dispatch options`);
                    }
                });

                it('Should fail when is root dispatch but not expected', () => {
                    actions.foobar = (ctx) => {
                        ctx.dispatch('loading', undefined, { root: true });
                    };

                    try {
                        expect.action(actions.foobar).to.dispatch('loading').not.as.root;
                        assert.fail();
                    } catch (err) {
                        const failedAssert = err as AssertionError;
                        expect(failedAssert.message).to.eq(`expected true to be false`);
                    }
                });

                it('Should pass when is not root dispatch', () => {
                    actions.foobar = (ctx) => {
                        ctx.dispatch('loading', undefined, { root: false });
                    };

                    expect.action(actions.foobar).to.dispatch('loading').not.as.root;
                });
            });
        });

        describe('Setup', () => {
            describe('actionPayload', () => {
                it('Should execute the action with the payload', () => {
                    let actualActionPayload: any;
                    const expectedActionPayload = {
                        foo: 'bar',
                    };
                    actions.foobar = (_, payload) => {
                        actualActionPayload = payload;
                    };

                    expect.action(actions.foobar, expectedActionPayload).to.commit;

                    expect(actualActionPayload).to.eql(expectedActionPayload);
                });
            });

            describe('actonContext', () => {
                it('Should allow setting state', () => {
                    let actualActionState: any;
                    const expectedActionState = {
                        fizz: 'buzz',
                    };
                    actions.foobar = (ctx, _?) => {
                        actualActionState = ctx.state;
                    };

                    expect.action(actions.foobar, null, { state: expectedActionState }).commit;

                    expect(actualActionState).to.eql(expectedActionState);
                });

                it('Should allow setting root state', () => {
                    let actualActionState: any;
                    const expectedActionState = {
                        version: 'buzz',
                    };
                    actions.foobar = (ctx, _?) => {
                        actualActionState = ctx.rootState;
                    };

                    expect.action(actions.foobar, null, { rootState: expectedActionState }).to.commit;

                    expect(actualActionState).to.eql(expectedActionState);
                });

                it('Should allow setting getters', () => {
                    let actualActionGetters: any;
                    const expectedActionGetters = {
                        fizz: 'buzz',
                    };
                    actions.foobar = (ctx, _?) => {
                        actualActionGetters = ctx.getters;
                    };

                    expect.action(actions.foobar, null, { getters: expectedActionGetters }).to.commit;

                    expect(actualActionGetters).to.eql(expectedActionGetters);
                });

                it('Should allow setting root getters', () => {
                    let actualActionGetters: any;
                    const expectedActionGetters = {
                        fizz: 'buzz',
                    };
                    actions.foobar = (ctx, _?) => {
                        actualActionGetters = ctx.rootGetters;
                    };

                    expect.action(actions.foobar, null, { rootGetters: expectedActionGetters }).to.commit;

                    expect(actualActionGetters).to.eql(expectedActionGetters);
                });
            });
        });
    });
});
