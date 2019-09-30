import chai, { expect, assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { vuexChai } from '../actions';
import { ActionTree, ActionContext } from 'vuex';
import { AssertionError } from 'assert';

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
        chai.use(chaiAsPromised);
    });

    describe('Asynchronous action', () => {
        interface SyncAction extends ActionTree<ModuleState, RootState> {
            foobar(ctx: ActionContext<ModuleState, RootState>, payload?: any): Promise<void>;
        }
        let actions: SyncAction;
        const emptyCtx = {} as ActionContext<ModuleState, RootState>;

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

            describe('payload', () => {
                // it('Should commit with a payload', () => {
                //     const expectedPayload = {
                //         foo: 'bar',
                //     };
                //     actions.foobar = async (ctx) => {
                //         ctx.commit('fizzbuzz', expectedPayload);
                //     };

                //     return expect.action(actions.foobar)
                //         .to.commit.containing.payload(expect)
                //         .getAwaiter;
                // });

                //         it('Should fail when commit payload does not match', () => {
                //             const expectedPayload = {
                //                 foo: 'bar',
                //             };
                //             actions.foobar = async (ctx) => {
                //                 ctx.commit('fizzbuzz', {});
                //             };

                //             try {
                //                 expect.actionAsync(actions.foobar).to.commit.containing.payload(expectedPayload);
                //                 throw new Error();
                //             } catch (err) {
                //                 const failedAssert = err as AssertionError;
                //                 expect(failedAssert.message).to.eq(`expected payload { foo: 'bar' } but found [ {} ]`);
                //             }
                //         });

                //         it('Should allow checking commit and payload', () => {
                //             const expectedCommit = 'fizzbuzz';
                //             const expectedPayload = {
                //                 foo: 'bar',
                //             };
                //             actions.foobar = async (ctx) => {
                //                 ctx.commit('not what you`re looking for', { big: 'bang' });
                //                 ctx.commit(expectedCommit, expectedPayload);
                //             };

                //             expect.actionAsync(actions.foobar).to.commit(expectedCommit).containing.payload(expectedPayload);
                //         });
            });

            //     describe('in.order', () => {
            //         it('Should check order loosely', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading');
            //                 ctx.commit('fizzbuzz');
            //                 ctx.commit('foobar');
            //                 ctx.commit('loaded');
            //             };

            //             expect.actionAsync(actions.foobar).to.commit.in.order('fizzbuzz', 'foobar');
            //         });

            //         it('Should when checking order fail when unexpected commit between expected commits', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading');
            //                 ctx.commit('foobar');
            //                 ctx.commit('loaded');
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.commit.in.order('loading', 'loaded');
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected 'loaded' commit but found 'foobar'`);
            //             }
            //         });
            //     });

            //     describe('as.root', () => {
            //         it('Should fail when no options are provided', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, undefined);
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.commit('loading').as.root;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected to be a root commit, but found no commit options`);
            //             }
            //         });

            //         it('Should fail when not a root commit but expected', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, { root: false });
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.commit('loading').as.root;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected false to be true`);
            //             }
            //         });

            //         it('Should pass when is a root commit', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, { root: true });
            //             };

            //             expect.actionAsync(actions.foobar).to.commit('loading').as.root;
            //         });
            //     });

            //     describe('not.as.root', () => {
            //         it('Should fail when no options are provided', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, undefined);
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.commit('loading').not.as.root;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected to be a root commit, but found no commit options`);
            //             }
            //         });

            //         it('Should fail when is root commit but not expected', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, { root: true });
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.commit('loading').not.as.root;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected true to be false`);
            //             }
            //         });

            //         it('Should pass when is not root commit', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, { root: false });
            //             };

            //             expect.actionAsync(actions.foobar).to.commit('loading').not.as.root;
            //         });
            //     });

            //     describe('is.silent', () => {
            //         it('Should fail when no options are provided', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, undefined);
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.commit('loading').is.silent;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message)
            //                     .to.eq(`expected to be a silent commit, but found no commit options`);
            //             }
            //         });

            //         it('Should fail when not a root commit but expected', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, { silent: false });
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.commit('loading').is.silent;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected false to be true`);
            //             }
            //         });

            //         it('Should pass when is a root commit', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, { silent: true });
            //             };

            //             expect.actionAsync(actions.foobar).to.commit('loading').is.silent;
            //         });
            //     });

            //     describe('is.not.silent', () => {
            //         it('Should fail when no options are provided', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, undefined);
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.commit('loading').is.not.silent;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message)
            //                     .to.eq(`expected to be a silent commit, but found no commit options`);
            //             }
            //         });

            //         it('Should fail when is root commit but not expected', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, { silent: true });
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.commit('loading').is.not.silent;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected true to be false`);
            //             }
            //         });

            //         it('Should pass when is not root commit', () => {
            //             actions.foobar = async (ctx) => {
            //                 ctx.commit('loading', undefined, { silent: false });
            //             };

            //             expect.actionAsync(actions.foobar).to.commit('loading').is.not.silent;
            //         });
            //     });
            // });

            // describe('dispatch', () => {
            //     it('Should dispatch an action', () => {
            //         actions.foobar = async (ctx) => {
            //             await ctx.dispatch('fizzbuzz');
            //         };

            //         expect.actionAsync(actions.foobar).to.dispatch('fizzbuzz');
            //     });

            //     it('Should fail when dispatch types do not match', () => {
            //         const expectedDispatch = 'somthing not right';
            //         actions.foobar = async (ctx) => {
            //             await ctx.dispatch('fizzbuzz');
            //         };

            //         try {
            //             expect.actionAsync(actions.foobar).to.dispatch(expectedDispatch);
            //             assert.fail();
            //         } catch (err) {
            //             const failedAssert = err as AssertionError;
            //             expect(failedAssert.message).to.eq(`expected '${expectedDispatch}' dispatch but found 'fizzbuzz' dispatch(s)`);
            //         }
            //     });

            //     it('Should chain for multiple dispatches', () => {
            //         actions.foobar = async (ctx) => {
            //             await ctx.dispatch('fizzbuzz');
            //             await ctx.dispatch('foobar');
            //         };
            //         expect.actionAsync(actions.foobar)
            //             .to.dispatch('fizzbuzz')
            //             .and.dispatch('foobar');
            //     });

            //     it('Should only run the action once per expectation', () => {
            //         let count = 0;

            //         actions.foobar = async (ctx) => {
            //             await ctx.dispatch('1');
            //             await ctx.dispatch('2');
            //             count++;
            //         };
            //         expect.actionAsync(actions.foobar).to.dispatch('1').and.dispatch('2');

            //         expect(count).to.eq(1);
            //     });

            //     it('Should fail if checking the same dispatch type multiple times', () => {
            //         actions.foobar = async (ctx) => {
            //             await ctx.dispatch('foobar');
            //         };

            //         try {
            //             expect.actionAsync(actions.foobar).to.dispatch('foobar').and.dispatch('foobar');
            //             assert.fail();
            //         } catch (err) {
            //             const failedAssert = err as AssertionError;
            //             expect(failedAssert.message).to.eq(`expected 'foobar' dispatch but found '' dispatch(s)`);
            //         }
            //     });

            //     it('Should find the specified dispatch between multiple dispatches', () => {
            //         actions.foobar = async (ctx) => {
            //             await ctx.dispatch('loading');
            //             await ctx.dispatch('foobar');
            //             await ctx.dispatch('loaded');
            //         };

            //         expect.actionAsync(actions.foobar).to.dispatch('foobar');
            //     });

            //     describe('payload', () => {
            //         it('Should dispatch with a payload', () => {
            //             const expectedPayload = {
            //                 foo: 'bar',
            //             };
            //             actions.foobar = async (ctx) => {
            //                 await ctx.dispatch('fizzbuzz', expectedPayload);
            //             };

            //             expect.actionAsync(actions.foobar).to.dispatch.containing.payload(expectedPayload);
            //         });

            //         it('Should fail when payload does not match', () => {
            //             const expectedPayload = {
            //                 foo: 'bar',
            //             };
            //             actions.foobar = async (ctx) => {
            //                 await ctx.dispatch('fizzbuzz', {});
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.dispatch.containing.payload(expectedPayload);
            //                 throw new Error();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected payload { foo: 'bar' } but found [ {} ]`);
            //             }
            //         });

            //         it('Should allow checking dispatch and payload', () => {
            //             const expectedDispatch = 'fizzbuzz';
            //             const expectedPayload = {
            //                 foo: 'bar',
            //             };
            //             actions.foobar = async (ctx) => {
            //                 await ctx.dispatch('not what you`re looking for', { big: 'bang' });
            //                 await ctx.dispatch(expectedDispatch, expectedPayload);
            //             };

            //             expect.actionAsync(actions.foobar)
            //                 .to.dispatch(expectedDispatch)
            //                 .containing.payload(expectedPayload);
            //         });
            //     });

            //     describe('in.order', () => {
            //         it('Should check order loosely', () => {
            //             actions.foobar = async (ctx) => {
            //                 await ctx.dispatch('loading');
            //                 await ctx.dispatch('fizzbuzz');
            //                 await ctx.dispatch('foobar');
            //                 await ctx.dispatch('loaded');
            //             };

            //             expect.actionAsync(actions.foobar).to.dispatch.in.order('fizzbuzz', 'foobar');
            //         });

            //         it('Should fail when unexpected dispatch between expected dispatches', () => {
            //             actions.foobar = async (ctx) => {
            //                 await ctx.dispatch('loading');
            //                 await ctx.dispatch('foobar');
            //                 await ctx.dispatch('loaded');
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.dispatch.in.order('loading', 'loaded');
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected 'loaded' dispatch but found 'foobar'`);
            //             }
            //         });
            //     });

            //     describe('as.root', () => {
            //         it('Should fail when no options are provided', () => {
            //             actions.foobar = async (ctx) => {
            //                 await ctx.dispatch('loading', undefined, undefined);
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.dispatch('loading').as.root;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected to be a root dispatch, but found no dispatch options`);
            //             }
            //         });

            //         it('Should fail when not a root dispatch but expected', () => {
            //             actions.foobar = async (ctx) => {
            //                 await ctx.dispatch('loading', undefined, { root: false });
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.dispatch('loading').as.root;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected false to be true`);
            //             }
            //         });

            //         it('Should pass when is a root dispatch', () => {
            //             actions.foobar = async (ctx) => {
            //                 await ctx.dispatch('loading', undefined, { root: true });
            //             };

            //             expect.actionAsync(actions.foobar).to.dispatch('loading').as.root;
            //         });
            //     });

            //     describe('not.as.root', () => {
            //         it('Should fail when no options are provided', () => {
            //             actions.foobar = async (ctx) => {
            //                 await ctx.dispatch('loading', undefined, undefined);
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.dispatch('loading').not.as.root;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected to be a root dispatch, but found no dispatch options`);
            //             }
            //         });

            //         it('Should fail when is root dispatch but not expected', () => {
            //             actions.foobar = async (ctx) => {
            //                 await ctx.dispatch('loading', undefined, { root: true });
            //             };

            //             try {
            //                 expect.actionAsync(actions.foobar).to.dispatch('loading').not.as.root;
            //                 assert.fail();
            //             } catch (err) {
            //                 const failedAssert = err as AssertionError;
            //                 expect(failedAssert.message).to.eq(`expected true to be false`);
            //             }
            //         });

            //         it('Should pass when is not root dispatch', () => {
            //             actions.foobar = async (ctx) => {
            //                 await ctx.dispatch('loading', undefined, { root: false });
            //             };

            //             expect.actionAsync(actions.foobar).to.dispatch('loading').not.as.root;
            //         });
            // });
        });

        describe('Setup', () => {
            // describe('actionPayload', () => {
            //     it('Should execute the action with the payload', () => {
            //         let actualActionPayload: any;
            //         const expectedActionPayload = {
            //             foo: 'bar',
            //         };
            //         actions.foobar = async (_, payload) => {
            //             actualActionPayload = payload;
            //         };

            //         expect.actionAsync(actions.foobar).with.actionPayload(expectedActionPayload).commit;

            //         expect(actualActionPayload).to.eql(expectedActionPayload);
            //     });
            // });

            // describe('actonContext', () => {
            //     it('Should allow setting state', () => {
            //         let actualActionState: any;
            //         const expectedActionState = {
            //             fizz: 'buzz',
            //         };
            //         actions.foobar = async (ctx, _?) => {
            //             actualActionState = ctx.state;
            //         };

            //         expect.actionAsync(actions.foobar).with.actionContext({ state: expectedActionState }).commit;

            //         expect(actualActionState).to.eql(expectedActionState);
            //     });

            //     it('Should allow setting root state', () => {
            //         let actualActionState: any;
            //         const expectedActionState = {
            //             fizz: 'buzz',
            //         };
            //         actions.foobar = async (ctx, _?) => {
            //             actualActionState = ctx.rootState;
            //         };

            //         expect.actionAsync(actions.foobar).with.actionContext({ rootState: expectedActionState }).commit;

            //         expect(actualActionState).to.eql(expectedActionState);
            //     });

            //     it('Should allow setting getters', () => {
            //         let actualActionGetters: any;
            //         const expectedActionGetters = {
            //             fizz: 'buzz',
            //         };
            //         actions.foobar = async (ctx, _?) => {
            //             actualActionGetters = ctx.getters;
            //         };

            //         expect.actionAsync(actions.foobar).with.actionContext({ getters: expectedActionGetters }).commit;

            //         expect(actualActionGetters).to.eql(expectedActionGetters);
            //     });

            //     it('Should allow setting root getters', () => {
            //         let actualActionGetters: any;
            //         const expectedActionGetters = {
            //             fizz: 'buzz',
            //         };
            //         actions.foobar = async (ctx, _?) => {
            //             actualActionGetters = ctx.rootGetters;
            //         };

            //         expect.actionAsync(actions.foobar).with.actionContext({ rootGetters: expectedActionGetters }).commit;

            //         expect(actualActionGetters).to.eql(expectedActionGetters);
            //     });
            // });
        });
    });
});
