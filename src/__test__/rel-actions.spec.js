const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
const vuexChai = require('../../Release/dist/cjs/index').vuexChai;

describe('Release Library', () => {
    beforeEach(() => {
        chai.use(vuexChai);
        chai.use(chaiAsPromised);
    });

    describe('Asynchronous action', () => {
        let actions;

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

                return expect.action(actions.foobar)
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
        });

        describe('dispatch', () => {
            it('Should fail when dispatch types do not match', async () => {
                const expectedDispatch = 'somthing not right';
                actions.foobar = async (ctx) => {
                    ctx.dispatch('foobar');
                };

                try {
                    const act = expect.action(actions.foobar)
                        .to.dispatch(expectedDispatch)
                        .getAwaiter;
                    await act;
                    assert.fail();
                } catch (err) {
                    expect(err.message).to.equal(`expected '${expectedDispatch}' dispatch but found 'foobar' dispatch(s)`);
                }
            });
        });
    });
});
