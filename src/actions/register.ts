import { store } from './store';
import { Assertions as VuexTestUtilsAssertions } from './assertions';

export const chaiExtensions = (chai: Chai.ChaiStatic, _: Chai.ChaiUtils) => {
    const Assertion = chai.Assertion;
    const VuexAssertions = new VuexTestUtilsAssertions(Assertion, _);

    const isPromise = (obj: any) => obj && typeof obj.then === 'function';

    [
        nameof<Chai.VuexCommits>((x) => x.in),
        nameof<Chai.VuexCommits>((x) => x.containing),
        nameof<Chai.VuexAssertion>((x) => x.as),
    ].forEach((chain) => {
        Assertion.addProperty(chain);
    });

    Assertion.addProperty(nameof<Chai.Assertion>((x) => x.getAwaiter), function () {
        return this._obj as PromiseLike<any>;
    });

    Assertion.addMethod(nameof<Chai.VuexOrder>((x) => x.order), function (...types: string[]) {
        VuexAssertions.order(this, ...types);
    });

    Assertion.addChainableMethod(nameof<Chai.Assertion>((x) => x.commit), function (type: string) {
        if (isPromise(this._obj)) {
            const promise = this._obj as PromiseLike<any>;
            this._obj = promise.then(() => {
                VuexAssertions.commit(this, type);
            });
            return this;
        } else {
            VuexAssertions.commit(this, type);
        }
    }, function () {
        _.flag(this, store.actionMode, 'commit');
    });

    Assertion.addChainableMethod(nameof<Chai.Assertion>((x) => x.dispatch), function (type: string) {
        VuexAssertions.dispatch(this, type);
    }, function () {
        _.flag(this, store.actionMode, 'dispatch');
    });

    Assertion.addMethod(nameof<Chai.VuexContaining>((x) => x.payload), function (payload: any) {
        if (isPromise(this._obj)) {
            const promise = this._obj as PromiseLike<any>;
            this._obj = promise.then(() => {
                VuexAssertions.payload(this, payload);
            });
            return this;
        } else {
            VuexAssertions.payload(this, payload);
        }
    });

    Assertion.addProperty(nameof<Chai.VuexAssertion>((x) => x.root), function () {
        VuexAssertions.root(this);
    });

    Assertion.addProperty(nameof<Chai.VuexCommitAssertions>((x) => x.silent), function () {
        VuexAssertions.silent(this);
    });
};

export default chaiExtensions;
