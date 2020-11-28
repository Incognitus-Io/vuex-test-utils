/// <reference path="../../../types/index.d.ts"/>

import { ActionContext, ActionTree } from "vuex";

interface SyncAction extends ActionTree<any, any> {
  foobar(ctx: ActionContext<any, any>): Promise<void>;
}

describe("Integration async", () => {
  describe(".toCommit", () => {
    it("passes when the action commits a mutation", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.commit("fizzbuzz");
          return Promise.resolve();
        },
      } as SyncAction;

      expect.action(actions.foobar).toCommit("fizzbuzz");
    });
    it("fails when the action does not commits a mutation", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.commit("fizzbuzz");
          return Promise.resolve();
        },
      } as SyncAction;

      expect(() =>
        expect.action(actions.foobar).toCommit("foobar")
      ).toThrowErrorMatchingSnapshot();
    });
  });

  describe(".toCommitAsRoot", () => {
    it("passes when the action commits mutations as root", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.commit("1", undefined, { root: true });
          return Promise.resolve();
        },
      } as SyncAction;

      expect.action(actions.foobar).toCommitAsRoot("1");
    });
    it("fails when the action commits mutations but not as root", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.commit("1", undefined, { root: false });
          return Promise.resolve();
        },
      } as SyncAction;

      expect(() =>
        expect.action(actions.foobar).toCommitAsRoot("1")
      ).toThrowErrorMatchingSnapshot();
    });
    it("fails when the action does not commits mutations", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.commit("1", undefined, { root: true });
          return Promise.resolve();
        },
      } as SyncAction;

      expect(() =>
        expect.action(actions.foobar).toCommitAsRoot("NotIt")
      ).toThrowErrorMatchingSnapshot();
    });
  });

  describe(".toCommitInOrder", () => {
    it("passes when the action commits mutations", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.commit("1");
          ctx.commit("2");
          ctx.commit("3");
          return Promise.resolve();
        },
      } as SyncAction;

      expect.action(actions.foobar).toCommitInOrder(["1", "2", "3"]);
    });
    it("passes when the acton commits some mutations when not strict", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.commit("1");
          ctx.commit("2");
          ctx.commit("3");
          return Promise.resolve();
        },
      } as SyncAction;

      expect.action(actions.foobar).toCommitInOrder(["1", "3"], false);
    });
    it("fails when the action does not commits mutations", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.commit("1");
          ctx.commit("2");
          ctx.commit("3");
          return Promise.resolve();
        },
      } as SyncAction;

      expect(() =>
        expect.action(actions.foobar).toCommitInOrder(["1", "2"])
      ).toThrowErrorMatchingSnapshot();
    });
  });

  describe(".toCommitWithPayload", () => {
    describe("strict", () => {
      it("passes when the action commits a mutation with the correct payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.commit("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect
          .action(actions.foobar, { a: "b" })
          .toCommitWithPayload("fizzbuzz", { a: "b" }, true);
      });
      it("fails when the action commits the wrong mutation mutation with the correct payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.commit("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect(() =>
          expect
            .action(actions.foobar, { a: "b" })
            .toCommitWithPayload("foobar", { a: "b" }, true)
        ).toThrowErrorMatchingSnapshot();
      });
      it("fails when the action commits a mutation with the wrong payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.commit("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect(() =>
          expect
            .action(actions.foobar, { a: "b" })
            .toCommitWithPayload("fizzbuzz", { c: "d" }, true)
        ).toThrowErrorMatchingSnapshot();
      });
    });
    describe("loose", () => {
      it("passes when the action commits a mutation with the correct payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.commit("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect
          .action(actions.foobar, { a: "b", c: "d" })
          .toCommitWithPayload("fizzbuzz", { a: "b" });
      });
      it("fails when the action commits the wrong mutation mutation with the correct payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.commit("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect(() =>
          expect
            .action(actions.foobar, { a: "b" })
            .toCommitWithPayload("foobar", { a: "b" }, true)
        ).toThrowErrorMatchingSnapshot();
      });
      it("fails when the action commits a mutation with the wrong payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.commit("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect(() =>
          expect
            .action(actions.foobar, { a: "b" })
            .toCommitWithPayload("fizzbuzz", { c: "d" })
        ).toThrowErrorMatchingSnapshot();
      });
    });
  });

  describe(".toDispatch", () => {
    it("passes when the action dispatchs a mutation", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.dispatch("fizzbuzz");
          return Promise.resolve();
        },
      } as SyncAction;

      expect.action(actions.foobar).toDispatch("fizzbuzz");
    });
    it("fails when the action does not dispatchs a mutation", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.dispatch("fizzbuzz");
          return Promise.resolve();
        },
      } as SyncAction;

      expect(() =>
        expect.action(actions.foobar).toDispatch("foobar")
      ).toThrowErrorMatchingSnapshot();
    });
  });

  describe(".toDispatchAsRoot", () => {
    it("passes when the action dispatchs mutations as root", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.dispatch("1", undefined, { root: true });
          return Promise.resolve();
        },
      } as SyncAction;

      expect.action(actions.foobar).toDispatchAsRoot("1");
    });
    it("fails when the action dispatchs mutations but not as root", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.dispatch("1", undefined, { root: false });
          return Promise.resolve();
        },
      } as SyncAction;

      expect(() =>
        expect.action(actions.foobar).toDispatchAsRoot("1")
      ).toThrowErrorMatchingSnapshot();
    });
    it("fails when the action does not dispatchs mutations", () => {
      const actions = {
        foobar: (ctx) => {
          ctx.dispatch("1", undefined, { root: true });
          return Promise.resolve();
        },
      } as SyncAction;

      expect(() =>
        expect.action(actions.foobar).toDispatchAsRoot("NotIt")
      ).toThrowErrorMatchingSnapshot();
    });
  });

  describe(".toDispatchWithPayload", () => {
    describe("strict", () => {
      it("passes when the action dispatchs a mutation with the correct payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.dispatch("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect.action(actions.foobar, { a: "b" }).toDispatchWithPayload(
          "fizzbuzz",
          { a: "b" },
          true
        );
      });
      it("fails when the action dispatchs the wrong mutation mutation with the correct payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.dispatch("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect(() =>
          expect.action(actions.foobar, { a: "b" }).toDispatchWithPayload(
            "foobar",
            { a: "b" },
            true
          )
        ).toThrowErrorMatchingSnapshot();
      });
      it("fails when the action dispatchs a mutation with the wrong payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.dispatch("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect(() =>
          expect.action(actions.foobar, { a: "b" }).toDispatchWithPayload(
            "fizzbuzz",
            { c: "d" },
            true
          )
        ).toThrowErrorMatchingSnapshot();
      });
    });

    describe("loose", () => {
      it("passes when the action dispatchs a mutation with the correct payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.dispatch("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect.action(actions.foobar, {
          a: "b",
          c: "d",
        }).toDispatchWithPayload("fizzbuzz", { a: "b" });
      });
      it("fails when the action dispatchs the wrong mutation mutation with the correct payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.dispatch("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect(() =>
          expect.action(actions.foobar, { a: "b" }).toDispatchWithPayload(
            "foobar",
            { a: "b" },
            true
          )
        ).toThrowErrorMatchingSnapshot();
      });
      it("fails when the action dispatchs a mutation with the wrong payload", () => {
        const actions = {
          foobar: (ctx, payload) => {
            ctx.dispatch("fizzbuzz", payload);
            return Promise.resolve();
          },
        } as SyncAction;

        expect(() =>
          expect.action(actions.foobar, { a: "b" }).toDispatchWithPayload("fizzbuzz", {
            c: "d",
          })
        ).toThrowErrorMatchingSnapshot();
      });
    });
  });
});
