pragma solidity ^0.4.17;
import "./Dummy.sol";

contract ToDoFactory is Dummy{

    event ToDoAdded(uint id, string text);

    struct ToDo {
        string text;
        bool done;
    }

    ToDo[] todos;
    mapping(uint => address) public todoOwner;
    mapping(address => uint) ownerTodoCount;

    modifier ownerOf(uint _id) {
        require(todoOwner[_id] == msg.sender);
        _;
    }

    event TaskAdded(uint id);
    event TaskModified(uint id, bool undo);

    function add(string _text) external {
        uint id = todos.push(ToDo(_text, false)) - 1;
        todoOwner[id] = msg.sender;
        ownerTodoCount[msg.sender]++;
        emit TaskAdded(id);
    }

    function complete(uint _id, bool _undo) external ownerOf(_id) {
        ToDo storage todo = todos[_id];
        if (_undo == true) {
            assert(todo.done == true);
            todo.done = false;
            ownerTodoCount[msg.sender]++;
        }
        else {
            assert(todo.done == false);
            todos[_id].done = true;
            ownerTodoCount[msg.sender]--;
        }
        emit TaskModified(_id, _undo);
    }

    function getById(uint id) external view ownerOf(id) returns (string){
        ToDo memory todo = todos[id];
        return todo.text;
    }

    function getMyToDos() external view returns (uint[]) {
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
