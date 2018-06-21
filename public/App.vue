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
    import todo from "./ToDo";
    import contract from "../build/contracts/ToDoFactory.json";

    window.Dapp = {
        contracts: {},
        web3Provider: undefined
    };

    export default {
        name: "app",
        components: {
            todo
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
                window.Dapp.contracts.ToDoFactory
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
            window.web3.currentProvider.publicConfigStore.on("update", initApp)//reload tasks on user change
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
            .catch(e => this.error = e);
    }

    function loadTodos() {
        this.tasks = [];
        return window.Dapp.contracts.ToDoFactory
            .deployed()
            .then(contract => contract
                .getMyToDos.call()
                .then(todos =>
                    todos.map(id =>
                        contract.getById
                            .call(window.web3.toDecimal(id))
                            .then(toDo => this.tasks.push(toDo))
                    )
                )
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
                window.Dapp.web3Provider = window.web3.currentProvider;
            } else {
                return reject(new Error("no injected web3 instance is detected"));
            }
            return resolve(new Web3(window.Dapp.web3Provider));
        });
    }

    function initContract() {
        window.Dapp.contracts.ToDoFactory = window.TruffleContract(contract);
        window.Dapp.contracts.ToDoFactory.setProvider(window.Dapp.web3Provider);
    }
</script>
<style scoped>
</style>