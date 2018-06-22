import Vue from "vue";
import App from "./App";
import contract from "../build/contracts/ToDoFactory.json";
import W3Plug from "./w3plug";

Vue.use(W3Plug, {contract, name: "ToDoFactory"});
Vue
    .initWeb3()
    .then(Vue.initContract)
    .catch(e => e)
    .then(e => {
        new Vue({
            el: "#app",
            render: h => h(App),
            data: {
                globalError: e
            }
        });
    });