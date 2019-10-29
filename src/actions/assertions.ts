import { ObservedBase, actionMode, ObservedCommit, ObservedDispatch } from './types';
import { store } from './store';
import { messages } from './messages';
import chai, { AssertionError } from 'chai';

export class Assertions {
    private Assertion: Chai.AssertionStatic;
    private flag: (obj: object, key: string, value?: any) => any;
    private transferFlags: (assertion: Chai.Assertion, obj: object, includeAll?: boolean) => void;
    private eql: (expected: any, actual?: any) => boolean;

    constructor(assertion: Chai.AssertionStatic, utils: Chai.ChaiUtils) {
        this.Assertion = assertion;
        this.flag = utils.flag;
        this.eql = utils.eql;
        this.transferFlags = utils.transferFlags;
    }

    public order(that: Chai.AssertionStatic, ...types: string[]) {
        let executed: ObservedBase[];
        let failMessage: string;
        let negFailMessage: string;
        const mode: actionMode = this.flag(that, store.actionMode);

        if (mode === 'commit') {
            executed = this.flag(that, store.executedCommits);
            failMessage = messages.expected.orderedCommitedType;
            negFailMessage = messages.notExpected.orderedCommitedType;
        } else {
            executed = this.flag(that, store.executedDispatches);
            failMessage = messages.expected.orderedDispatchType;
            negFailMessage = messages.notExpected.orderedDispatchType;
        }

        let executedTypes = executed.map((x) => x.type);

        const firstCommitIdx = executedTypes.indexOf(types[0]);
        executedTypes = executedTypes.splice(firstCommitIdx, types.length);

        executedTypes.forEach((type, idx) => that.assert(
            type === types[idx],
            failMessage, negFailMessage,
            types[idx], type,
            true,
        ));

        return that;
    }

    public commit(that: Chai.AssertionStatic, type: string) {
        const executedCommits: ObservedCommit[] = this.flag(that, store.executedCommits);
        const executedTypes = executedCommits.map((x) => x.type);

        const currentCommitIdx = executedTypes.indexOf(type);
        const results = currentCommitIdx !== -1;

        if (results) {
            const currentCommit = executedCommits[currentCommitIdx];
            this.flag(that, store.currentCommit, currentCommit);

            executedCommits.splice(currentCommitIdx, 1);
            this.flag(that, store.executedCommits, executedCommits);
        }

        that.assert(
            results,
            messages.expected.commitedType, messages.notExpected.commitedType,
            type, executedTypes.join(', '),
        );

        return that;
    }

    public dispatch(that: Chai.AssertionStatic, type: string) {
        const executedDispatches: ObservedDispatch[] = this.flag(that, store.executedDispatches);
        const executedTypes = executedDispatches.map((x) => x.type);

        const currentDispatchIdx = executedTypes.indexOf(type);
        const results = currentDispatchIdx !== -1;

        if (results) {
            const currentDispatch = executedDispatches[currentDispatchIdx];
            this.flag(that, store.currentDispatch, currentDispatch);

            executedDispatches.splice(currentDispatchIdx, 1);
            this.flag(that, store.executedDispatches, executedDispatches);
        }

        that.assert(
            results,
            messages.expected.dispatchType, messages.notExpected.dispatchType,
            type, executedTypes.join(', '),
        );

        return that;
    }

    public payload(that: Chai.AssertionStatic, payload: any) {
        let current: ObservedBase;
        let executed: ObservedBase[];
        const mode: actionMode = this.flag(that, store.actionMode);
        const partial: boolean = this.flag(that, store.partially);

        if (mode == null) {
            chai.assert.fail('Mode was not set');
        }

        if (mode === 'commit') {
            current = this.flag(that, store.currentCommit);
            executed = (!current)
                ? this.flag(that, store.executedCommits)
                : [current];
        } else {
            current = this.flag(that, store.currentDispatch);
            executed = (!current)
                ? this.flag(that, store.executedDispatches)
                : [current];
        }

        const executedPayloads = executed.map((x) => x.payload);

        let results = false;
        if (partial) {
            this.flag(that, store.partially, undefined);
            executedPayloads.forEach((x) => {
                try {
                    const partialPayload = new chai.Assertion(undefined);
                    this.transferFlags(that as any, partialPayload);
                    this.flag(partialPayload, store.object, x);
                    partialPayload.includes(payload);
                    results = true;
                } catch (err) {
                    if (err instanceof AssertionError) {
                        return;
                    }
                }
            });
        } else {
            results = executedPayloads.some((x) => this.eql(payload, x));
        }
        that.assert(
            results,
            messages.expected.payload, messages.notExpected.payload,
            JSON.stringify([payload]), JSON.stringify(executedPayloads),
        );

        return that;
    }

    public root(that: Chai.AssertionStatic) {
        let current: ObservedCommit | ObservedDispatch;
        let msg: string;
        const mode: actionMode = this.flag(that, store.actionMode);
        const negated = this.flag(that, store.not)
            || this.flag(that, store.notAsync)
            || false;

        if (mode === 'commit') {
            current = this.flag(that, store.currentCommit);
            msg = messages.expected.missingRootCommitOptions;
        } else {
            current = this.flag(that, store.currentDispatch);
            msg = messages.expected.missingRootDispatchOptions;
        }

        if (!current.options) {
            throw new AssertionError(msg);
        }

        const test = new this.Assertion(current.options.root).to.be;
        // tslint:disable-next-line:no-unused-expression
        (negated) ? test.false : test.true;

        return that;
    }

    public silent(that: Chai.AssertionStatic) {
        const currentCommit: ObservedCommit = this.flag(that, store.currentCommit);
        const negated = this.flag(that, store.not)
            || this.flag(that, store.notAsync)
            || false;

        if (!currentCommit.options) {
            throw new AssertionError(messages.expected.missingSilentCommitOptions);
        }

        const test = new this.Assertion(currentCommit.options.silent).to.be;
        // tslint:disable-next-line:no-unused-expression
        (negated) ? test.false : test.true;

        return that;
    }
}
