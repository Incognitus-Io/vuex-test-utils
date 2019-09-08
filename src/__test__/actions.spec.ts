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

            it('Should fail if checking payload before dispatch', () => {
                try {
                    expect(actions.foobar).payload({});
                    assert.fail();
                } catch (err) {
                    const failedAssert = err as AssertionError;
                    expect(failedAssert.message).to.eq(`expected 'dispatch' to be asserted before 'payload'`);
                }
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

        // describe('Commit', () => {
        //     it('')
        // });
    });
});
