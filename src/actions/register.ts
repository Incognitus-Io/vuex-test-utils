import { store } from './store';
import { Assertions as VuexTestUtilsAssertions } from './assertions';

export const chaiExtensions = (chai: Chai.ChaiStatic, _: Chai.ChaiUtils) => {
    const Assertion = chai.Assertion;
    const VuexAssertions = new VuexTestUtilsAssertions(Assertion, _);

    [
        nameof<Chai.VuexCommits>((x) => x.in),
        nameof<Chai.VuexCommits>((x) => x.containing),
        nameof<Chai.VuexAssertion>((x) => x.as),
    ].forEach((chain) => {
        Assertion.addProperty(chain);
    });

    Assertion.addMethod(nameof<Chai.VuexOrder>((x) => x.order), function (...types: string[]) {
        VuexAssertions.order(this, ...types);
    });

    Assertion.addChainableMethod(nameof<Chai.Assertion>((x) => x.commit), function (type: string) {
        VuexAssertions.commit(this, type);
    }, function () {
        _.flag(this, store.actionMode, 'commit');
    });

    Assertion.addChainableMethod(nameof<Chai.Assertion>((x) => x.dispatch), function (type: string) {
        VuexAssertions.dispatch(this, type);
    }, function () {
        _.flag(this, store.actionMode, 'dispatch');
    });

    Assertion.addMethod(nameof<Chai.VuexContaining>((x) => x.payload), function (payload: any) {
        VuexAssertions.payload(this, payload);
    });

    Assertion.addProperty(nameof<Chai.VuexAssertion>((x) => x.root), function () {
        VuexAssertions.root(this);
    });

    Assertion.addProperty(nameof<Chai.VuexCommitAssertions>((x) => x.silent), function () {
        VuexAssertions.silent(this);
    });
};

export default chaiExtensions;
