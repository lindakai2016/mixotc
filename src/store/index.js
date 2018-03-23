import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger.js';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isLogin: false,
    loginForm: false,
    userInfo: null,
    oUserInfo: null
  },
  mutations: {
    changeLogin(state, {data}) {
      state.isLogin = data;
    },
    changeLoginform(state, {data}) {
      state.loginForm = data;
    },
    getUserInfo(state, {data}) {
      state.userInfo = data;
    },
    getOUserInfo(state, {data}) {
      state.oUserInfo = data;
    }
  },
  plugins: [createLogger()]
});

export default store;
