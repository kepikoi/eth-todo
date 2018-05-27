pragma solidity ^0.4.17;

contract ToDoFactory {

    event ToDoAdded(uint id, string text);

    struct ToDo {
        string text;
        bool done;
    }

    ToDo[] todos;
    mapping(address => ToDo) userTodos;

    function add(string _text) public returns (uint) {
        userTodos[msg.sender] = ToDo(_text, false);
    }

    function complete(bool _undo) public {
        if (_undo == true) {
            userTodos[msg.sender].done = false;
        }
        else {
            userTodos[msg.sender].done = true;
        }
    }

    function getMyToDos() public view returns (string) {
        ToDo memory todo =  userTodos[msg.sender];
        return (todo.text);
    }
}
