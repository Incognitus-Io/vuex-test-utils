describe('Release Library', () => {
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

                await expect.action(actions.foobar)
                    .resolves
                    .toCommit('fizzbuzz');
            });

            it('Should fail when commit types do not match', async () => {
                const expectedCommit = 'somthing not right';
                actions.foobar = async (ctx) => {
                    ctx.commit('foobar');
                };

                try {
                    await expect.action(actions.foobar)
                        .resolves
                        .toCommit(expectedCommit);
                    assert.fail();
                } catch (err) {
                    expect(err.message).toMatchSnapshot();
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
                    await expect.action(actions.foobar)
                        .resolves
                        .toDispatch(expectedDispatch);
                    assert.fail();
                } catch (err) {
                    expect(err.message).toMatchSnapshot();
                }
            });
        });
    });
});
