import { ActionCtx, actionFn, ActionResults } from "../src/index";

declare global {
  namespace jest {
    interface Expect {
      <T = any>(actual: T): JestMatchers<T>;
      /**
       * Sets up and executes a mocked out action.
       *
       * @param action - The action function under test.
       * @param payload - Any payload to be submitted to the action under test.
       * @param config - The mocked context including the immediate state/getters
       *                 along with any root state/getters.
       *
       * @returns the Jest matcher given the results of the action's execution.
       */
      action<S, R>(
        action: actionFn<S, R>,
        payload?: any,
        config?: ActionCtx<S, R>
      ): JestMatchers<ActionResults>;
    }

    interface Matchers<R, T> {
      /**
       * Asserts weather a specific mutation was commited.
       *
       * @param mutation - The name of the mutation expected to be commited.
       */
      toCommit: (mutation: string) => R;
      /**
       * Asserts weather a specific mutation was commited as root.
       *
       * @param mutation - The name of the mutation expected to be commited.
       */
      toCommitAsRoot: (mutation: string) => R;
      /**
       * Asserts weather a list of mutations were commited in order.
       *
       * @param mutation - The names of the mutations expected to be commited.
       */
      toCommitInOrder: (mutations: string[], strict?: boolean) => R;
      /**
       * Asserts weather a specific mutation with a payload was commited.
       *
       * @param mutation - The name of the mutation expected to be commited.
       * @param payload - The payload that the mutation was expected to be commited with.
       * @param strict - Weather to strictly check all propertys on the payload. (True)
       */
      toCommitWithPayload: (
        mutation: string,
        payload: any,
        strict?: boolean
      ) => R;
      /**
       * Asserts weather a specific action was dispatched.
       *
       * @param action - The name of the action expected to be dispatched.
       */
      toDispatch: (action: string) => R;
      /**
       * Asserts weather a specific action was dispatched as root.
       *
       * @param mutation - The name of the action expected to be dispatched.
       */
      toDispatchAsRoot: (action: string) => R;
      /**
       * Asserts weather a list of actions were dispatched in order.
       *
       * @param actions - The names of the actions expected to be dispatched.
       */
      toDispatchInOrder: (actions: string[], strict?: boolean) => R;
      /**
       * Asserts weather a specific action with a payload was dispatched.
       *
       * @param action - The name of the action expected to be dispatched.
       * @param payload - The payload that the action was expected to be dispatched with.
       * @param strict - Weather to strictly check all propertys on the payload. (True)
       */
      toDispatchWithPayload: (
        action: string,
        payload: any,
        strict?: boolean
      ) => R;
    }
  }
}
