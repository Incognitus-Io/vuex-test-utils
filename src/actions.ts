import { ActionContext, CommitOptions } from 'vuex';
import { AssertionError } from 'assert';


declare global {
    namespace Chai { // tslint:disable-line:no-namespace
        interface Assertion {
            commit: VuexCommits;
            actionPayload(payload: any): Assertion;
            actionContext<S, R>(ctx: ActionCtx<S, R>): Assertion;
            // payload(payload: any): Assertion;
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

        interface ActionCtx<S, R> {
            state?: S;
            rootState?: R;
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
        actionPayload: nameof<Chai.Assertion>((x) => x.actionPayload),
        actionCtx: nameof<Chai.Assertion>((x) => x.actionContext),
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

    Assertion.addMethod(nameof<Chai.Assertion>((x) => x.actionPayload), function (payload: any) {
        _.flag(this, store.actionPayload, payload);
    });

    Assertion.addMethod(nameof<Chai.Assertion>((x) => x.actionContext), function (ctx: Chai.ActionCtx<any, any>) {
        _.flag(this, store.actionCtx, ctx);
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
        const payload = _.flag(this, store.actionPayload);
        const hasExecAction = _.flag(this, store.executedCommits) !== undefined;

        if (!hasExecAction) {
            execAction(action, payload, this);
        }
    });

    Assertion.addMethod(nameof<Chai.VuexContaining>((x) => x.payload), function (payload: any) {
        const currentCommit: ObservedCommits =  _.flag(this, store.currentCommit);
        const executedCommits: ObservedCommits[] = (!currentCommit)
            ? _.flag(this, store.executedCommits)
            : [currentCommit];

        const executedPayloads = executedCommits.map((x) => x.payload);
        const results = executedPayloads.some((x) => _.eql(payload, x));
        this.assert(
            results,
            messages.expected.commitedPayload, messages.notExpected.commitedPayload,
            payload, executedPayloads,
        );
    });

    const execAction = (action: actionFn, payload: any, obj: object) => {
        const executedCommits: ObservedCommits[] = [];
        const ctx = _.flag(obj, store.actionCtx) || {};
        ctx.commit = emitCommit(executedCommits);

        action(ctx, payload);
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
