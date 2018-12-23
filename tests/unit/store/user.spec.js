import { shallowMount } from "@vue/test-utils";
import Store from "@/components/store/Store";
import flushPromises from "flush-promises";
import { ComponentWrapper } from "~/wrapper";

import userModule from "@/store/modules/user";

import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import cloneDeep from "lodash.clonedeep";
import axios from "axios";

jest.mock("axios");

describe("testing vuex store as instance", () => {
  // Mutations and actions are the inputs for a store
  // The output of a store is the store state or result of getters

  beforeEach(() => {
    const localVue = createLocalVue();
    localVue.use(Vuex);
  });

  it("updates name", async () => {
    expect.assertions(4);

    let userStore = cloneDeep(userModule);
    axios.post.mockImplementation(() => Promise.resolve());
    userStore.state.name = "foo";
    userStore.state.lastName = "bar";
    userStore.state.loading = false;
    let store = new Vuex.Store({ modules: { user: userStore } });
    expect(store.getters["user/fullName"]).toBe("foo bar");

    store.dispatch("user/updateName", "abc");

    expect(store.state.user.loading).toBeTruthy();
    await flushPromises();
    expect(store.state.user.loading).toBeFalsy();
    expect(store.getters["user/fullName"]).toBe("abc bar");
  });
  it("init", async () => {
    expect.assertions(2);

    let userStore = cloneDeep(userModule);
    userStore.state.name = "foo";
    userStore.state.lastName = "bar";
    let store = new Vuex.Store({ modules: { user: userStore } });

    store.dispatch("user/init", { name: "bar", lastName: "baz" });

    expect(store.state.user.name).toBe("bar");
    expect(store.state.user.lastName).toBe("baz");
  });
});

describe("testing vuex parts separately", () => {
  it("fullName getter", () => {
    let state = {
      name: "foo",
      lastName: "bar"
    };

    expect(userModule.getters.fullName(state)).toBe("foo bar");
  });
  it("Set name mutation", () => {
    let state = {
      name: "foo",
      lastName: "bar"
    };
    userModule.mutations.SET_NAME(state, { name: "bar", lastName: "baz" });

    expect(state.name).toBe("bar");
    expect(state.lastName).toBe("baz");
  });
  it("updateName", async () => {
    // extreme mocking is needed
    expect.assertions(3);

    const context = {
      commit: jest.fn(),
      state: {}
    };
    axios.post.mockImplementation(() => Promise.resolve());
    userModule.actions.updateName(context, "foo");
    await flushPromises();

    expect(context.commit).toHaveBeenNthCalledWith(1, "SET_LOADING", true);
    expect(context.commit).toHaveBeenNthCalledWith(2, "SET_NAME", {
      name: "foo",
      lastName: undefined
    });
    expect(context.commit).toHaveBeenNthCalledWith(3, "SET_LOADING", false);
  });
});