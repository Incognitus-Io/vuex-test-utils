import { ActionContext, CommitOptions } from 'vuex';
import { AssertionError } from 'assert';


declare global {
    namespace Chai { // tslint:disable-line:no-namespace
        interface Assertion {
            commit: VuexCommits;
            payload(payload: any): Assertion;
        }

        // interface PromisedAssertion {
        //     displayed: PromisedAssertion;
        // }

        interface VuexCommits {
            (type: string): Assertion;
            in: VuexOrder;
            containing: VuexContaining;
        }

        interface VuexContaining {
            payload: (payload: any) => Assertion;
        }

        interface VuexOrder {
            order: (...types: string[]) => Assertion;
        }
    }
}

interface ObservedCommits {
    type: string;
    payload?: any;
}
type commitFn = (_: string, __?: any, ___?: CommitOptions) => void;
type actionFn = (_: ActionContext<any, any>, __?: any) => void | Promise<void>;

export const vuexChai = (chai: Chai.ChaiStatic, _: Chai.ChaiUtils) => {
    const Assertion = chai.Assertion;

    const store = {
        executedCommits: 'executedCommits',
        currentCommit: 'currentCommit',
    };
    const messages = {
        expected: {
            commitedType: 'expected #{exp} commit but found #{act} commit(s)',
            orderedCommitedType: 'expected #{exp} commit but found #{act}',
            commitedPayload: 'expected payload #{exp} but found #{act}',
        },
        notExpected: {
            commitedType: 'expected #{exp} to not be commmited but found #{act} commit(s)',
            orderedCommitedType: 'expected #{exp} to not be commited but found #{act}',
            commitedPayload: 'expected payload #{exp} to not be commmited but found #{act}',
        },
    };

    [
        nameof<Chai.VuexCommits>((x) => x.in),
        nameof<Chai.VuexCommits>((x) => x.containing),
    ].forEach((x) => {
        Assertion.addProperty(x);
    });

    Assertion.addMethod(nameof<Chai.VuexOrder>((x) => x.order), function (...types: string[]) {
        const executedCommits: ObservedCommits[] = _.flag(this, store.executedCommits);
        let executedTypes = executedCommits.map((x) => x.type);

        const firstCommitIdx = executedTypes.indexOf(types[0]);
        executedTypes = executedTypes.splice(firstCommitIdx, types.length);

        executedTypes.forEach((executed, idx) => this.assert(
            executed === types[idx],
            messages.expected.orderedCommitedType,
            messages.notExpected.orderedCommitedType,
            types[idx], executed,
            true,
        ));
    });

    Assertion.addChainableMethod(nameof<Chai.Assertion>((x) => x.commit), function (type: string) {
        const executedCommits: ObservedCommits[] = _.flag(this, store.executedCommits);
        const executedTypes = executedCommits.map((x) => x.type);

        const currentCommitIdx = executedTypes.indexOf(type);
        const results = currentCommitIdx !== -1;

        if (results) {
            const currentCommit = executedCommits[currentCommitIdx];
            _.flag(this, store.currentCommit, currentCommit);

            executedCommits.splice(currentCommitIdx, 1);
            _.flag(this, store.executedCommits, executedCommits);
        }

        this.assert(
            results,
            messages.expected.commitedType, messages.notExpected.commitedType,
            type, executedTypes.join(', '),
        );
    }, function () {
        const action = this._obj as actionFn;
        const hasExecAction = _.flag(this, store.executedCommits) !== undefined;

        if (!hasExecAction) {
            execAction(action, this);
        }
    });

    Assertion.addMethod(nameof<Chai.Assertion>((x) => x.payload), function (payload: any) {
        const executedCommits: ObservedCommits[] = _.flag(this, 'executedCommits');

        if (!executedCommits) {
            throw new AssertionError({ message: `expected 'dispatch' to be asserted before 'payload'` });
        }

        const executedPayloads = executedCommits.map((x) => x.payload);
        const results = executedPayloads.some((x) => _.eql(payload, x));
        this.assert(
            results,
            messages.expected.commitedPayload, messages.notExpected.commitedPayload,
            payload, executedPayloads,
        );
    });

    const execAction = (action: actionFn, obj: object) => {
        const executedCommits: ObservedCommits[] = [];
        const commit = emitCommit(executedCommits);

        action({ commit } as ActionContext<any, any>);
        _.flag(obj, store.executedCommits, executedCommits);
    };

    const emitCommit = (executedCommits: ObservedCommits[]): commitFn => {
        return (type: string, payload?: any) => {
            executedCommits.push({
                type,
                payload,
            });
        };
    };
};

export default vuexChai;
