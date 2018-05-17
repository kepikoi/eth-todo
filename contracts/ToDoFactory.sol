pragma solidity ^0.4.17;

contract ToDoFactory {

    event ToDoAdded(uint id, string text);

    struct ToDo {
        address user;
        string text;
        bool done;
    }

    ToDo[] todos;

    function add(string _text) public returns (uint) {
        uint id = todos.push(ToDo(msg.sender, _text, false)) - 1;
        return id;
    }

    function complete(uint _id, bool _undo) public {
        require(todos[_id].user == msg.sender);
        if (_undo == true) {
            todos[_id].done = false;
        }
        else {
            todos[_id].done = true;
        }
    }



    function getMyToDos() public view returns (string,string,string,string,string) {
        string[5] memory out;
        for (uint i = 0; i < 5; i++) {
            ToDo memory current = todos[i];

            if (current.user == msg.sender && current.done == false) {
                out[i] = current.text;
            }
        }
        return (out[0],out[1],out[2],out[3],out[4]);
    }
}
