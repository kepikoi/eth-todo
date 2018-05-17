const ToDoFactory = artifacts.require("./ToDoFactory.sol");
module.exports = function(deployer) {
    deployer.deploy(ToDoFactory);
};