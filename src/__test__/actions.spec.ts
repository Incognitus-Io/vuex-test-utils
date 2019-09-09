import chai, { expect, assert } from 'chai';
import { vuexChai } from '../actions';
import { ActionTree, ActionContext } from 'vuex';
import { AssertionError } from 'assert';

chai.use(vuexChai);

// tslint:disable:no-unused-expression
describe('Actions.ts', () => {
    interface RootState {
        version: string;
    }
    interface ModuleState {
        version: string;
    }

    describe('Synchronous action', () => {
        interface SyncAction extends ActionTree<ModuleState, RootState> {
            foobar(ctx: ActionContext<ModuleState, RootState>, payload: any): void;
        }
        let actions: SyncAction;

        beforeEach(() => {
            actions = {
                foobar(ctx, payload) { return; },
            };
        });

        describe('commit', () => {
            it('Should commit a mutation', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('fizzbuzz');
                };

                expect(actions.foobar).to.commit('fizzbuzz');
            });

            it('Should fail when commit types do not match', () => {
                const expectedCommit = 'somthing not right';
                actions.foobar = (ctx) => {
                    ctx.commit('foobar');
                };

                try {
                    expect(actions.foobar).to.commit(expectedCommit);
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
                expect(actions.foobar).to.commit('fizzbuzz').and.commit('foobar');
            });

            it('Should only run the action once per expectation', () => {
                let count = 0;

                actions.foobar = (ctx) => {
                    ctx.commit('1');
                    ctx.commit('2');
                    count++;
                };
                expect(actions.foobar).to.commit('1').and.commit('2');

                expect(count).to.eq(1);
            });

            it('Should fail if checking the same commit type multiple times', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('foobar');
                };

                try {
                    expect(actions.foobar).to.commit('foobar').and.commit('foobar');
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

                expect(actions.foobar).to.commit('foobar');
            });
        });

        describe('payload', () => {
            it('Should commit with a payload', () => {
                const expectedPayload = {
                    foo: 'bar',
                };
                actions.foobar = (ctx) => {
                    ctx.commit('fizzbuzz', expectedPayload);
                };

                expect(actions.foobar).to.commit.containing.payload(expectedPayload);
            });

            it('Should fail when commit payload does not match', () => {
                const expectedPayload = {
                    foo: 'bar',
                };
                actions.foobar = (ctx) => {
                    ctx.commit('fizzbuzz', {});
                };

                try {
                    expect(actions.foobar).to.commit.containing.payload(expectedPayload);
                    throw new Error();
                } catch (err) {
                    const failedAssert = err as AssertionError;
                    expect(failedAssert.message).to.eq(`expected payload { foo: 'bar' } but found [ {} ]`);
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

                expect(actions.foobar).to.commit(expectedCommit).containing.payload(expectedPayload);
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

                expect(actions.foobar).to.commit.in.order('fizzbuzz', 'foobar');
            });

            it('Should when checking order fail when unexpected commit between expected commits', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('loading');
                    ctx.commit('foobar');
                    ctx.commit('loaded');
                };

                try {
                    expect(actions.foobar).to.commit.in.order('loading', 'loaded');
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
                    expect(actions.foobar).to.commit('loading').as.root;
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
                    expect(actions.foobar).to.commit('loading').as.root;
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

                expect(actions.foobar).to.commit('loading').as.root;
            });
        });

        describe('not.as.root', () => {
            it('Should fail when no options are provided', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('loading', undefined, undefined);
                };

                try {
                    expect(actions.foobar).to.commit('loading').not.as.root;
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
                    expect(actions.foobar).to.commit('loading').not.as.root;
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

                expect(actions.foobar).to.commit('loading').not.as.root;
            });
        });

        describe('is.silent', () => {
            it('Should fail when no options are provided', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('loading', undefined, undefined);
                };

                try {
                    expect(actions.foobar).to.commit('loading').as.silent;
                    assert.fail();
                } catch (err) {
                    const failedAssert = err as AssertionError;
                    expect(failedAssert.message).to.eq(`expected to be a silent commit, but found no commit options`);
                }
            });

            it('Should fail when not a root commit but expected', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('loading', undefined, { silent: false });
                };

                try {
                    expect(actions.foobar).to.commit('loading').is.silent;
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

                expect(actions.foobar).to.commit('loading').is.silent;
            });
        });

        describe('is.not.silent', () => {
            it('Should fail when no options are provided', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('loading', undefined, undefined);
                };

                try {
                    expect(actions.foobar).to.commit('loading').is.not.silent;
                    assert.fail();
                } catch (err) {
                    const failedAssert = err as AssertionError;
                    expect(failedAssert.message).to.eq(`expected to be a silent commit, but found no commit options`);
                }
            });

            it('Should fail when is root commit but not expected', () => {
                actions.foobar = (ctx) => {
                    ctx.commit('loading', undefined, { silent: true });
                };

                try {
                    expect(actions.foobar).to.commit('loading').is.not.silent;
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

                expect(actions.foobar).to.commit('loading').is.not.silent;
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

                    expect(actions.foobar).with.actionPayload(expectedActionPayload).commit;

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

                    expect(actions.foobar).with.actionContext({ state: expectedActionState }).commit;

                    expect(actualActionState).to.eql(expectedActionState);
                });

                it('Should allow setting root state', () => {
                    let actualActionState: any;
                    const expectedActionState = {
                        fizz: 'buzz',
                    };
                    actions.foobar = (ctx, _?) => {
                        actualActionState = ctx.rootState;
                    };

                    expect(actions.foobar).with.actionContext({ rootState: expectedActionState }).commit;

                    expect(actualActionState).to.eql(expectedActionState);
                });
            });
        });

        // describe('Commit', () => {
        //     it('')
        // });
    });
});
