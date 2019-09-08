/// <reference types="chai" />

declare module Chai {
    interface ChaiUtils {
        eql(expected: any, actual: any): boolean;
    }
    interface AssertionStatic extends AssertionPrototype {
        addProperty(name: string, getter?: (this: AssertionStatic) => any): void;
        addChainableMethod(
            name: string,
            method: (this: AssertionStatic, ...args: any[]) => void,
            chainingBehavior?: (this: AssertionStatic) => void
        ): void;
    }
    interface AssertionPrototype {
        assert(
            test: any,
            failMessage: Chai.Message, negFailMessage: Chai.Message,
            expected: any, actual?: any,
            showDiff?: boolean
        ): void;
    }
}
