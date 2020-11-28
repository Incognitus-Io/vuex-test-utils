describe('Release Library', () => {
    describe('Asynchronous action', () => {
        let actions;

        beforeEach(() => {
            actions = {
                async foobar(_, __) { return; },
            };
        });

        describe('commit', () => {
            it('Should commit a mutation', () => {
                actions.foobar = async (ctx) => {
                    ctx.commit('fizzbuzz');
                };

                expect.action(actions.foobar)
                    .toCommit('fizzbuzz');
            });

            it('Should fail when commit types do not match', () => {
                const expectedCommit = 'somthing not right';
                actions.foobar = async (ctx) => {
                    ctx.commit('foobar');
                };

                try {
                    expect.action(actions.foobar)
                        .toCommit(expectedCommit);
                    assert.fail();
                } catch (err) {
                    expect(err.message).toMatchSnapshot();
                }
            });
        });

        describe('dispatch', () => {
            it('Should fail when dispatch types do not match', () => {
                const expectedDispatch = 'somthing not right';
                actions.foobar = async (ctx) => {
                    ctx.dispatch('foobar');
                };

                try {
                    expect.action(actions.foobar)
                        .toDispatch(expectedDispatch);
                    assert.fail();
                } catch (err) {
                    expect(err.message).toMatchSnapshot();
                }
            });
        });
    });
});
