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
                    <todo v-for="task in tasks" :text="task.todo" :id="task.id" :tx="task.tx" v-on:error="onerror"></todo>
                    <spinner v-if="isLoadingTasks"></spinner>
                    <div v-if="tasks.length === 0 && !isLoadingTasks">🤘🏻 All done!</div>
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
    import todo from "./components/ToDo";
    import Vue from "vue";
    import spinner from "./components/Spinner";

    export default {
        name: "app",
        components: {
            todo,
            spinner
        },
        data() {
            return {
                error: undefined,
                newTodo: undefined,
                tasks: [],
                isLoadingTasks: true
            }
        },
        computed: {
            user() {
                return Vue.getUser()
            }
        },
        watch: {
            error(v) {
                console.error(v);
            }
        },
        methods: {
            add() {
                Vue
                    .deployed()
                    .then(contract => contract.add(this.newTodo))
                    .then(receipt => {
                        this.tasks.push({todo: this.newTodo, tx: receipt.tx});
                        this.newTodo = undefined;
                    })
                    .catch(e => this.error = e);
            },
            onerror(e) {
                this.error = e;
            }
        },
        created() {
            console.log("App.vue");
            return Vue
                .deployed()
                .then(contract => contract
                    .getMyToDos.call()
                    .then(todos => {
                            this.isLoadingTasks = false;
                            todos.map(id => {
                                    const dId = window.web3.toDecimal(id);
                                    contract.getById
                                        .call(dId)
                                        .then(todo => this.tasks.push({id: dId, todo}))
                                }
                            )
                        }
                    )
                );
        }
    };


</script>
<style scoped>
</style>