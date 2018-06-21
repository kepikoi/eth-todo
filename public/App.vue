<template>
    <div class="container">
        <div v-if="user" class="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Login successfull</strong> Logged in as {{user}}

            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div v-if="error">
            <div class="alert alert-danger" role="alert">
                {{error.message}}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        </div>
        <div class="py-5 text-center">
            <h1> Eth To-Do</h1>
            <p>Blockchain-based ToDo app</p>
        </div>
        <div v-if="user">
            <div class="row">
                <div class="col-12">
                    <div class="form-group">
                        <input type="text" class="form-control pb-3" id="todo" v-model="newTodo"
                               placeholder="What needs to be done">
                    </div>
                    <button @click="add" :disabled="!newTodo" type="button" class="btn btn-primary btn-lg btn-block">Add</button>
                </div>
            </div>
            <div id="mytasks">
                <div class="py-5 text-center col-12">
                    <h2>My Tasks</h2>
                    <br>
                    <todo v-for="task in tasks" :text="task" :key="task.key">{{task}}</todo>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="alert alert-info" role="alert">
                Please login to Metamask
            </div>
        </div>
    </div>
</template>
<script>
    import TruffleContract from "truffle-contract";
    import ToDo from "./ToDo";
    import contract from "../build/contracts/ToDoFactory.json";

    const Dapp = {
        contracts: {},
        web3Provider: undefined
    };

    export default {
        name: "app",
        components: {
            ToDo
        },
        data() {
            return {
                error: undefined,
                newTodo: undefined,
                tasks: [],
                user: undefined
            }
        },
        watch: {
            error(v) {
                console.error(v);
            }
        },
        methods: {
            add() {
                Dapp.contracts.ToDoFactory
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
            const initApp = init.bind(this);
            initApp()
        }
    };

    function init() {
        Promise.resolve()
            .then(() => initWeb3()
                .then(w => window.web3 = w))
            .then(() => checkUser()
                .then(u => this.user = u))
            .then(() => initContract())
            .then(() => loadTodos.bind(this)())
            .then(() => web3.currentProvider.publicConfigStore.on("update", init)) //reload tasks on user change
            .catch(e => this.error = e);
    }

    function loadTodos() {
        this.tasks = [];
        return Dapp.contracts.ToDoFactory
            .deployed()
            .then(contract => contract
                .getMyToDos.call()
                .then(todos => {
                    todos.map(id =>
                        contract.getById.call(web3.toDecimal(id))
                            .then(toDo => {
                                this.tasks.push(toDo);
                            })
                            .catch(e => {
                                console.error(e);
                            })
                    );
                    console.log(todos);
                })
            );

    }

    function checkUser() {
        return new Promise((resolve) => {
            return resolve(window.web3.eth.accounts[0]);
        });
    }

    function initWeb3() {
        return new Promise((resolve, reject) => {
            if (typeof window.web3 !== "undefined") {
                Dapp.web3Provider = window.web3.currentProvider;
            } else {
                reject(new Error("no injected web3 instance is detected"));
            }
            return resolve(new Web3(Dapp.web3Provider));
        });
    }

    function initContract() {
        Dapp.contracts.ToDoFactory = TruffleContract(contract);
        Dapp.contracts.ToDoFactory.setProvider(Dapp.web3Provider);
    }
</script>
