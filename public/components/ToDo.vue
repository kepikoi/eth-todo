<template>
    <div :class="{done : isDone}">
        <div class="input-group mb-1" :class="[tid&&tx?'add-confirm':'add-transit']">
            <spinner v-if="transitional"></spinner>
            <input type="text" class="form-control" placeholder="ToDo" aria-label="ToDo" v-model="text" readonly>
            <div class="input-group-append">
                <button v-if="isDone" type="button" @click="complete(true)" class="btn btn-light undo-btn">Undo</button>
                <button v-else :disabled="transitional" type="button" @click="complete(false)" class="btn btn-dark done-btn">Done</button>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from "vue";
    import spinner from "./Spinner";

    export default {
        name: "todo",
        props: ["text", "id", "tx"],
        components: {
            spinner
        },
        data() {
            return {
                isDone: false,
                isModified: false,
                tid: this.id //avoid manipulating prop
            };
        },
        computed: {
            transitional() {
                //task is transitional when it has no id or was flagged as isModified
                return typeof this.tid !== "number" || this.isModified;
            }
        },
        methods: {
            /**
             * complete task
             * @param {Boolean} undo - pass tru to undo the task completion
             * @returns {Promise}
             */
            complete(undo) {
                return Vue.deployed()
                    .then(contract => {
                        //store tx number and listen for block confirmation
                        contract
                            .complete(this.tid, undo)
                            .then(receipt => {
                                this.isModified = true;
                                return receipt.tx;
                            })
                            .then(tx => contract
                                .TaskModified({}, {sender: tx})
                                .watch((err, result) => {
                                    if (err) {
                                        return this.$emit('error', err);
                                    }
                                    this.isDone = !undo;
                                    this.isModified = false;
                                })
                            )


                    })
                    .catch(err => this.$emit('error', err))
            },
        },
        created() {
            if (this.tx) {
                //we're not getting the id for newly created tasks from ethereum, since the block is not yet written, so we need to listen
                // to a specific event which will transmit the id
                Vue.deployed()
                    .then(contract => {
                        console.log("watch",this.tx);
                            const added = contract
                                .TaskAdded({}, {sender: this.tx});

                            added.watch((err, result) => {
                                //await TaskAdded event for given transaction and save the id
                                if (err) {
                                    return this.$emit('error', err);
                                }
                                this.tid = window.web3.toDecimal(result.args.id);
                            })
                        }
                    );
            }
        }
    };
</script>
<style scoped>
</style>
