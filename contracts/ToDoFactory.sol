pragma solidity ^0.4.17;

contract ToDoFactory {

    event ToDoAdded(uint id, string text);

    struct ToDo {
        string text;
        bool done;
    }

    ToDo[] todos;
    mapping(uint => address) todoOwner;
    mapping(address => uint) ownerTodoCount;

    modifier ownerOf(uint _id) {
        require(todoOwner[_id] == msg.sender);
        _;
    }

    function add(string _text) public {
        uint id = todos.push(ToDo(_text, false)) - 1;
        todoOwner[id] = msg.sender;
        ownerTodoCount[msg.sender]++;
    }

    function complete(uint _id, bool _undo) public ownerOf(_id) {
        if (_undo == true) {
            todos[_id].done = false;
        }
        else {
            todos[_id].done = true;
            ownerTodoCount[msg.sender]--;
        }

    }

    function getById(uint id) public view returns (string){
        ToDo memory todo = todos[id];
        return todo.text;
    }

    function getMyToDos() public view returns (uint[]) {
        uint [] memory out = new uint[](ownerTodoCount[msg.sender]);
        uint count = 0;
        for (uint i = 0; i < todos.length; i++) {
            ToDo memory current = todos[i];

            if (todoOwner[i] == msg.sender && current.done == false) {
                out[count] = i;
                count++;
            }
        }
        return out;
    }
}
