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
        Assertion.addProperty(chain, function () {
            if (isPromise(this._obj)) {
                return this;
            }
        });
    });

    Assertion.addProperty(nameof<Chai.Assertion>((x) => x.getAwaiter), function () {
        return this._obj as PromiseLike<any>;
    });

    Assertion.addProperty(nameof<Chai.VuexActionCtxAssertions>((x) => x.partially), function () {
        const promise = getPromiseOrDefault(this);
        if (promise) {
            this._obj = promise.then((test) => {
                _.flag(test, store.partially, true);
                _.flag(test, store.deep, true);
                return test; });
            return this;
        } else {
            _.flag(this, store.partially, true);
        }
    });

    Assertion.addMethod(nameof<Chai.VuexOrder>((x) => x.order), function (...types: string[]) {
        const promise = getPromiseOrDefault(this);
        if (promise) {
            this._obj = promise.then((test) => VuexAssertions.order(test, ...types));
            return this;
        } else {
            VuexAssertions.order(this, ...types);
        }
    });

    Assertion.addChainableMethod(nameof<Chai.Assertion>((x) => x.commit), function (type?: string) {
        const promise = getPromiseOrDefault(this);
        if (promise) {
            if (type) {
                this._obj = promise.then((test) => VuexAssertions.commit(test, type));
            }
            return this;
        } else {
            VuexAssertions.commit(this, type!);
        }
    }, function () {
        const promise = getPromiseOrDefault(this);
        if (promise) {
            this._obj = promise.then((test) => {
                _.transferFlags(this as any, test);
                _.flag(test, store.actionMode, 'commit');
                _.flag(test, store.not, _.flag(test, store.notAsync));
                return test;
            });
        } else {
            _.flag(this, store.actionMode, 'commit');
        }
    });

    Assertion.addChainableMethod(nameof<Chai.Assertion>((x) => x.dispatch), function (type: string) {
        const promise = getPromiseOrDefault(this);
        if (promise) {
            this._obj = promise.then((test) => VuexAssertions.dispatch(test, type));
            return this;
        } else {
            VuexAssertions.dispatch(this, type);
        }
    }, function () {
        const promise = getPromiseOrDefault(this);
        if (promise) {
            this._obj = promise.then((test) => {
                _.transferFlags(this as any, test);
                _.flag(test, store.actionMode, 'dispatch');
                _.flag(test, store.not, _.flag(test, store.notAsync));
                return test;
            });
        } else {
            _.flag(this, store.actionMode, 'dispatch');
        }
    });

    Assertion.addMethod(nameof<Chai.VuexContaining>((x) => x.payload), function (payload: any) {

        const promise = getPromiseOrDefault(this);
        if (promise) {
            this._obj = promise.then((test) => VuexAssertions.payload(test, payload));
            return this;
        } else {
            VuexAssertions.payload(this, payload);
        }
    });

    Assertion.addProperty(nameof<Chai.VuexAssertion>((x) => x.root), function () {
        const promise = getPromiseOrDefault(this);
        if (promise) {
            this._obj = promise.then((test) => VuexAssertions.root(test));
            return this;
        } else {
            VuexAssertions.root(this);
        }
    });

    Assertion.addProperty(nameof<Chai.VuexCommitAssertions>((x) => x.silent), function () {
        const promise = getPromiseOrDefault(this);
        if (promise) {
            this._obj = promise.then((test) => VuexAssertions.silent(test));
            return this;
        } else {
            VuexAssertions.silent(this);
        }
    });

    const getPromiseOrDefault = (assertion: Chai.AssertionStatic): PromiseLike<any> | undefined =>
        (isPromise(assertion._obj)) ? assertion._obj as PromiseLike<any> : undefined;
};

export default chaiExtensions;
