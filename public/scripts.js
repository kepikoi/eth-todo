const ajax = function (url, callback, type) {
    type = type === ("GET" || "POST") ? type : "GET";
    let request;

    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        request = new XMLHttpRequest();
    }
    else { // IE
        try {
            request = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                request = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
                console.warn("couldn't initiate ActiveXObject", e);
            }
        }
    }

    request.open(type, url, true);

    if (window.XMLHttpRequest) {
        request.addEventListener("load", function () {
            return callback(request.response);
        });
        request.addEventListener("error", e => {
            return callback(undefined, e);
        });
    }

    try {
        request.send(null);
    }
    catch (e) {
        return callback(undefined, e);
    }
};
let key = 0;

const
    App = {contracts: {}},
    ToDo = Vue.component("todo", {
        props: ["text"],
        data() {
            return {
                isDone: false,
                key: ++key,
            };
        },
        methods: {
            complete() {
                this.isDone = true;
            },
            undo() {
                this.isDone = false;
            }
        },
        template: `
            <div :class="{done : isDone}">
                    <div class="input-group my-2">
                        <input type="text" class="form-control" placeholder="ToDo" aria-label="ToDo" v-model="text" readonly>
                        <div class="input-group-append">
                        <button v-if="isDone" type="button" @click="undo" class="btn btn-light">Undo</button>
                        <button v-else type="button" @click="complete" class="btn btn-dark">Done</button>
                        </div>
                     </div>
            </div>
        `
    }),
    vue = new Vue({
        el: "#app",
        components: {
            ToDo
        },
        data: {
            error: undefined,
            newTodo: undefined,
            tasks: [],
            user: undefined
        },
        watch: {
            error(v) {
                // eslint-disable-next-line no-console
                console.error(v);
            }
        },
        methods: {
            add() {
                App.contracts.ToDoFactory
                    .deployed()
                    .then(contract => contract.add((this.newTodo), {from: this.user}))
                    .then(id => {
                        this.tasks.push(this.newTodo);
                        this.newTodo = undefined;
                    })
                    .catch(e => this.error = e);
            }
        },
        created() {
            Promise.resolve()
                .then(() => initWeb3()
                    .then(w => window.web3 = w))
                .then(() => checkUser()
                    .then(u => this.user = u))
                .then(() => initContract())
                .then(() => loadTodos()
                    .then(todos => this.tasks = todos))
                .catch(e => this.error = e);
        }
    });

function loadTodos() {
    return App.contracts.ToDoFactory
        .deployed()
        .then(contract => contract.getMyToDos.call())
        .then(todos => this.tasks = todos);
}

function checkUser() {
    return new Promise((resolve, reject) => {
        window.web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                return reject(error);
            }
            return resolve(accounts[0]);
        });
    });
}

function initWeb3() {
    return new Promise((resolve, reject) => {
        if (typeof window.web3 !== "undefined") {
            App.web3Provider = window.web3.currentProvider;
        } else {
            console.warn("no injected web3 instance is detected, fall back to Ganache");
            App.web3Provider = new Web3.providers.HttpProvider("http://127.0.0.1:8855");
        }
        return resolve(new Web3(App.web3Provider));
    });
}

function initContract() {
    return new Promise((resolve, reject) => {
        ajax("ToDoFactory.json", (data, err) => {
            if (err) {
                return reject(err);
            }
            const contract = JSON.parse(data);
            App.contracts.ToDoFactory = TruffleContract(contract);
            App.contracts.ToDoFactory.setProvider(App.web3Provider);
            return resolve();
        });
    });
}
