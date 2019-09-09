import { ActionContext, CommitOptions, DispatchOptions } from 'vuex';
import { AssertionError } from 'assert';


declare global {
    namespace Chai { // tslint:disable-line:no-namespace
        interface Assertion {
            commit: VuexCommits;
            dispatch: VuexDispatch;
            actionPayload(payload: any): Assertion;
            actionContext<S, R>(ctx: ActionCtx<S, R>): Assertion;
            // payload(payload: any): Assertion;
        }

        // interface PromisedAssertion {
        // displayed: PromisedAssertion;
        // }

        interface VuexAssertion extends Assertion {
            and: VuexAssertion;
            as: VuexAssertion;
            is: VuexAssertion;
            not: VuexAssertion;
            root: VuexAssertion;
            containing: VuexContaining;
        }

        interface VuexCommitAssertions extends VuexAssertion {
            is: VuexCommitAssertions;
            not: VuexCommitAssertions;
            silent: VuexCommitAssertions;
        }

        interface VuexCommits {
            (type: string): VuexCommitAssertions;
            in: VuexOrder;
            containing: VuexContaining;
        }

        interface VuexDispatch {
            (type: string): VuexAssertion;
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
            getters?: any;
            rootGetters?: any;
        }
    }
}
interface ObservedBase {
    type: string;
    payload?: any;
}
interface ObservedDispatch extends ObservedBase {
    options?: DispatchOptions;
}
interface ObservedCommit extends ObservedBase {
    options?: CommitOptions;
}
type commitFn = (_: string, __?: any, ___?: CommitOptions) => void;
type dispatchFn = (_: string, __?: any, ___?: DispatchOptions) => any;
type actionFn = (_: ActionContext<any, any>, __?: any) => void | Promise<void>;

export const vuexChai = (chai: Chai.ChaiStatic, _: Chai.ChaiUtils) => {
    const Assertion = chai.Assertion;

    const store = {
        not: 'negate',
        executedCommits: 'executedCommits',
        currentCommit: 'currentCommit',
        executedDispatches: 'executedDispatches',
        currentDispatch: 'currentDispatch',
        actionPayload: nameof<Chai.Assertion>((x) => x.actionPayload),
        actionCtx: nameof<Chai.Assertion>((x) => x.actionContext),
    };
    const messages = {
        expected: {
            commitedType: 'expected #{exp} commit but found #{act} commit(s)',
            orderedCommitedType: 'expected #{exp} commit but found #{act}',
            payload: 'expected payload #{exp} but found #{act}',
            missingRootCommitOptions: 'expected to be a root commit, but found no commit options',
            missingSilentCommitOptions: 'expected to be a silent commit, but found no commit options',
            dispatchType: 'expected #{exp} dispatch but found #{act} dispatch(s)',
            orderedDispatchType: 'expected #{exp} dispatch but found #{act}',
        },
        notExpected: {
            commitedType: 'expected #{exp} to not be commmited but found #{act} commit(s)',
            orderedCommitedType: 'expected #{exp} to not be commited but found #{act}',
            payload: 'expected payload #{exp} to not be defined but found #{act}',
            dispatchType: 'expected #{exp} to not be dispatched but found #{act} dispatches(s)',
            orderedDispatchType: 'expected #{exp} to not be dispatched but found #{act}',
        },
    };

    [
        nameof<Chai.VuexCommits>((x) => x.in),
        nameof<Chai.VuexCommits>((x) => x.containing),
        nameof<Chai.VuexAssertion>((x) => x.as),
    ].forEach((chain) => {
        Assertion.addProperty(chain);
    });

    Assertion.addMethod(nameof<Chai.Assertion>((x) => x.actionPayload), function (payload: any) {
        _.flag(this, store.actionPayload, payload);
    });

    Assertion.addMethod(nameof<Chai.Assertion>((x) => x.actionContext), function (ctx: Chai.ActionCtx<any, any>) {
        _.flag(this, store.actionCtx, ctx);
    });

    Assertion.addMethod(nameof<Chai.VuexOrder>((x) => x.order), function (...types: string[]) {
        const executedCommits: ObservedCommit[] = _.flag(this, store.executedCommits);
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
        const executedCommits: ObservedCommit[] = _.flag(this, store.executedCommits);
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
        execActionBehavior(this);
    });

    Assertion.addChainableMethod(nameof<Chai.Assertion>((x) => x.dispatch), function (type: string) {
        const executedDispatches: ObservedDispatch[] = _.flag(this, store.executedDispatches);
        const executedTypes = executedDispatches.map((x) => x.type);

        const currentDispatchIdx = executedTypes.indexOf(type);
        const results = currentDispatchIdx !== -1;

        if (results) {
            const currentDispatch = executedDispatches[currentDispatchIdx];
            _.flag(this, store.currentDispatch, currentDispatch);

            executedDispatches.splice(currentDispatchIdx, 1);
            _.flag(this, store.executedDispatches, executedDispatches);
        }

        this.assert(
            results,
            messages.expected.dispatchType, messages.notExpected.dispatchType,
            type, executedTypes.join(', '),
        );
    }, function () {
        execActionBehavior(this);
    });

    Assertion.addMethod(nameof<Chai.VuexContaining>((x) => x.payload), function (payload: any) {
        const currentCommit: ObservedBase = _.flag(this, store.currentCommit);
        const currentDispatch: ObservedBase = _.flag(this, store.currentDispatch);
        const executedCommits: ObservedBase[] = _.flag(this, store.executedCommits);
        const executedDispatches: ObservedBase[] = _.flag(this, store.executedDispatches);

        let executed: ObservedBase[];
        if (currentCommit || currentDispatch) {
            executed = [currentCommit || currentDispatch];
        } else if (executedCommits  && executedCommits.length > 0) {
            executed = executedCommits;
        } else {
            executed = executedDispatches;
        }

        const executedPayloads = executed.map((x) => x.payload);
        const results = executedPayloads.some((x) => _.eql(payload, x));
        this.assert(
            results,
            messages.expected.payload, messages.notExpected.payload,
            payload, executedPayloads,
        );
    });

    Assertion.addProperty(nameof<Chai.VuexAssertion>((x) => x.root), function () {
        const currentCommit: ObservedCommit = _.flag(this, store.currentCommit);
        const negated = _.flag(this, store.not) || false;

        if (!currentCommit.options) {
            throw new AssertionError({ message: messages.expected.missingRootCommitOptions });
        }

        const test = new Assertion(currentCommit.options.root).to.be;
        // tslint:disable-next-line:no-unused-expression
        (negated) ? test.false : test.true;
    });

    Assertion.addProperty(nameof<Chai.VuexCommitAssertions>((x) => x.silent), function () {
        const currentCommit: ObservedCommit = _.flag(this, store.currentCommit);
        const negated = _.flag(this, store.not) || false;

        if (!currentCommit.options) {
            throw new AssertionError({ message: messages.expected.missingSilentCommitOptions });
        }

        const test = new Assertion(currentCommit.options.silent).to.be;
        // tslint:disable-next-line:no-unused-expression
        (negated) ? test.false : test.true;
    });

    const execActionBehavior = (obj: Chai.AssertionStatic) => {
        const action = obj._obj as actionFn;
        const payload = _.flag(obj, store.actionPayload);
        const hasExecAction = _.flag(obj, store.executedCommits) !== undefined;

        if (!hasExecAction) {
            execAction(action, payload, obj);
        }
    };

    const execAction = (action: actionFn, payload: any, obj: object) => {
        const executedCommits: ObservedCommit[] = [];
        const executedDispatches: ObservedDispatch[] = [];
        const ctx: ActionContext<any, any> = _.flag(obj, store.actionCtx) || {};
        ctx.commit = emitCommit(executedCommits);
        ctx.dispatch = emitDispatch(executedDispatches);

        action(ctx, payload);

        _.flag(obj, store.executedCommits, executedCommits);
        _.flag(obj, store.executedDispatches, executedDispatches);
    };

    const emitCommit = (executedCommits: ObservedCommit[]): commitFn => {
        return (type: string, payload?: any, options?: CommitOptions) => {
            executedCommits.push({
                type,
                payload,
                options,
            });
        };
    };

    const emitDispatch = (executedDispatches: ObservedDispatch[]): dispatchFn => {
        return (type: string, payload?: any, options?: DispatchOptions) => {
            executedDispatches.push({
                type,
                payload,
                options,
            });
        };
    };
};

export default vuexChai;
