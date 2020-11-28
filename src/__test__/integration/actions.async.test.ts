/// <reference path="../../../types/index.d.ts"/>

import { ActionContext, ActionTree } from "vuex";

interface SyncAction extends ActionTree<any, any> {
  foobar(ctx: ActionContext<any, any>): Promise<void>;
}

describe("Integration async", () => {
  describe(".toCommit", () => {
    it("passes when the action commits a mutation", async () => {
      const actions = {
        foobar: async (ctx) => {
          await Promise.resolve();
          ctx.commit("fizzbuzz");
        },
      } as SyncAction;

      await expect.action(actions.foobar).resolves.toCommit("fizzbuzz");
    });
    it("fails when the action does not commits a mutation", async () => {
      const actions = {
        foobar: async (ctx) => {
          ctx.commit("fizzbuzz");
          await Promise.resolve();
          ctx.commit("fizz");
        },
      } as SyncAction;

      await expect(() =>
        expect.action(actions.foobar).resolves.toCommit("foobar")
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe(".toCommitAsRoot", () => {
    it("passes when the action commits mutations as root", async () => {
      const actions = {
        foobar: async (ctx) => {
          await Promise.resolve();
          ctx.commit("1", undefined, { root: true });
        },
      } as SyncAction;

      await expect.action(actions.foobar).resolves.toCommitAsRoot("1");
    });
    it("fails when the action commits mutations but not as root", async () => {
      const actions = {
        foobar: async (ctx) => {
          ctx.commit("1", undefined, { root: false });
          await Promise.resolve();
          ctx.commit("2", undefined, { root: false });
        },
      } as SyncAction;

      await expect(() =>
        expect.action(actions.foobar).resolves.toCommitAsRoot("2")
      ).rejects.toThrowErrorMatchingSnapshot();
    });
    it("fails when the action does not commits mutations", async () => {
      const actions = {
        foobar: async (ctx) => {
          ctx.commit("1", undefined, { root: true });
          await Promise.resolve();
          ctx.commit("2", undefined, { root: true });
        },
      } as SyncAction;

      await expect(() =>
        expect.action(actions.foobar).resolves.toCommitAsRoot("NotIt")
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe(".toCommitInOrder", () => {
    it("passes when the action commits mutations", async () => {
      const actions = {
        foobar: async (ctx) => {
          ctx.commit("1");
          ctx.commit("2");
          await Promise.resolve();
          ctx.commit("3");
        },
      } as SyncAction;

      await expect.action(actions.foobar).resolves.toCommitInOrder(["1", "2", "3"]);
    });
    it("passes when the acton commits some mutations when not strict", async () => {
      const actions = {
        foobar: async (ctx) => {
          ctx.commit("1");
          ctx.commit("2");
          await Promise.resolve();
          ctx.commit("3");
        },
      } as SyncAction;

      await expect.action(actions.foobar).resolves.toCommitInOrder(["1", "3"], false);
    });
    it("fails when the action does not commits mutations", async () => {
      const actions = {
        foobar: async (ctx) => {
          ctx.commit("1");
          ctx.commit("2");
          await Promise.resolve();
          ctx.commit("3");
        },
      } as SyncAction;

      await expect(() =>
        expect.action(actions.foobar).resolves.toCommitInOrder(["1", "2"])
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe(".toCommitWithPayload", () => {
    describe("strict", () => {
      it("passes when the action commits a mutation with the correct payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.commit("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect
          .action(actions.foobar, { a: "b" }).resolves
          .toCommitWithPayload("fizzbuzz", { a: "b" }, true);
      });
      it("fails when the action commits the wrong mutation mutation with the correct payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.commit("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect(async () =>
          await expect
            .action(actions.foobar, { a: "b" }).resolves
            .toCommitWithPayload("foobar", { a: "b" }, true)
        ).rejects.toThrowErrorMatchingSnapshot();
      });
      it("fails when the action commits a mutation with the wrong payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.commit("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect( async () =>
          await expect
            .action(actions.foobar, { a: "b" }).resolves
            .toCommitWithPayload("fizzbuzz", { c: "d" }, true)
        ).rejects.toThrowErrorMatchingSnapshot();
      });
    });
    describe("loose", () => {
      it("passes when the action commits a mutation with the correct payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.commit("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect
          .action(actions.foobar, { a: "b", c: "d" }).resolves
          .toCommitWithPayload("fizzbuzz", { a: "b" });
      });
      it("fails when the action commits the wrong mutation mutation with the correct payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.commit("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect(async () =>
          await expect
            .action(actions.foobar, { a: "b" }).resolves
            .toCommitWithPayload("foobar", { a: "b" }, true)
        ).rejects.toThrowErrorMatchingSnapshot();
      });
      it("fails when the action commits a mutation with the wrong payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.commit("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect(async () =>
          await expect
            .action(actions.foobar, { a: "b" }).resolves
            .toCommitWithPayload("fizzbuzz", { c: "d" })
        ).rejects.toThrowErrorMatchingSnapshot();
      });
    });
  });

  describe(".toDispatch", () => {
    it("passes when the action dispatchs a mutation", async () => {
      const actions = {
        foobar: async (ctx) => {
          await Promise.resolve();
          ctx.dispatch("fizzbuzz");
        },
      } as SyncAction;

      await expect.action(actions.foobar).resolves.toDispatch("fizzbuzz");
    });
    it("fails when the action does not dispatchs a mutation", async () => {
      const actions = {
        foobar: async (ctx) => {
          await Promise.resolve();
          ctx.dispatch("fizzbuzz");
        },
      } as SyncAction;

      await expect(async () =>
        await expect.action(actions.foobar).resolves.toDispatch("foobar")
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe(".toDispatchAsRoot", () => {
    it("passes when the action dispatchs mutations as root", async () => {
      const actions = {
        foobar: async (ctx) => {
          await Promise.resolve();
          ctx.dispatch("1", undefined, { root: true });
        },
      } as SyncAction;

      await expect.action(actions.foobar).resolves.toDispatchAsRoot("1");
    });
    it("fails when the action dispatchs mutations but not as root", async () => {
      const actions = {
        foobar: async (ctx) => {
          await Promise.resolve();
          ctx.dispatch("1", undefined, { root: false });
        },
      } as SyncAction;

      await expect(async () =>
        await expect.action(actions.foobar).resolves.toDispatchAsRoot("1")
      ).rejects.toThrowErrorMatchingSnapshot();
    });
    it("fails when the action does not dispatchs mutations", async () => {
      const actions = {
        foobar: async (ctx) => {
          await Promise.resolve();
          ctx.dispatch("1", undefined, { root: true });
        },
      } as SyncAction;

      await expect(async () =>
        await expect.action(actions.foobar).resolves.toDispatchAsRoot("NotIt")
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe(".toDispatchWithPayload", () => {
    describe("strict", () => {
      it("passes when the action dispatchs a mutation with the correct payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.dispatch("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect.action(actions.foobar, { a: "b" }).resolves.toDispatchWithPayload(
          "fizzbuzz",
          { a: "b" },
          true
        );
      });
      it("fails when the action dispatchs the wrong mutation mutation with the correct payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.dispatch("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect(async () =>
          await expect.action(actions.foobar, { a: "b" }).resolves.toDispatchWithPayload(
            "foobar",
            { a: "b" },
            true
          )
        ).rejects.toThrowErrorMatchingSnapshot();
      });
      it("fails when the action dispatchs a mutation with the wrong payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.dispatch("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect(async () =>
          await expect.action(actions.foobar, { a: "b" }).resolves.toDispatchWithPayload(
            "fizzbuzz",
            { c: "d" },
            true
          )
        ).rejects.toThrowErrorMatchingSnapshot();
      });
    });

    describe("loose", () => {
      it("passes when the action dispatchs a mutation with the correct payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.dispatch("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect.action(actions.foobar, {
          a: "b",
          c: "d",
        }).resolves.toDispatchWithPayload("fizzbuzz", { a: "b" });
      });
      it("fails when the action dispatchs the wrong mutation mutation with the correct payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.dispatch("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect(async () =>
          await expect.action(actions.foobar, { a: "b" }).resolves.toDispatchWithPayload(
            "foobar",
            { a: "b" },
            true
          )
        ).rejects.toThrowErrorMatchingSnapshot();
      });
      it("fails when the action dispatchs a mutation with the wrong payload", async () => {
        const actions = {
          foobar: async (ctx, payload) => {
            await Promise.resolve();
            ctx.dispatch("fizzbuzz", payload);
          },
        } as SyncAction;

        await expect(async () =>
          await expect.action(actions.foobar, { a: "b" }).resolves.toDispatchWithPayload("fizzbuzz", {
            c: "d",
          })
        ).rejects.toThrowErrorMatchingSnapshot();
      });
    });
  });
});
