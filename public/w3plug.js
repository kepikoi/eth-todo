/* eslint-disable no-console */
export default {
    install(Vue, options) {
        Vue.Dapp = {
            contracts: {},
            web3Provider: undefined
        };
        Vue.initWeb3 = () =>
            new Promise((resolve, reject) => {
                console.log("initWeb3");
                if (typeof window.web3 !== "undefined") {
                    Vue.Dapp.web3Provider = window.web3.currentProvider;
                } else {
                    return reject(new Error("no injected web3 instance is detected"));
                }
                window.web3 = new window.Web3(Vue.Dapp.web3Provider);
                return resolve(window.web3);
            });
        Vue.initContract = () => {
            console.log("initContract");
            Vue.Dapp.contracts[options.name] = window.TruffleContract(options.contract);
            Vue.Dapp.contracts[options.name].setProvider(Vue.Dapp.web3Provider);
        };
        Vue.getUser = () => window.web3.eth.accounts[0];
        Vue.deployed = () => Vue.Dapp.contracts[options.name].deployed();
        //Vue.filter = address => new Promise((resolve, reject) => window.web3.eth.filter({address}).get((err, results) => err ? reject(err) : resolve(results)));
    }
};