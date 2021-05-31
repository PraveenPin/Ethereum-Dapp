pragma solidity ^0.5.0;

contract SocialNetwork{
    /*Add code */
    string public name; /* State variable -> this value gets stored on block chain*/
    mapping(uint => Post) public posts;/* Key Value Store, gets written to block chain itself */
    uint public postCount = 0;

    struct Post{
        uint pid;
        string content;
        uint tipAmount;
        address author;
    }

    constructor () public {
        name = "ETH - SocialNetwork";
    }

    event PostCreated(uint id, string content, uint tipAmount, address author);

    function createPost(string memory _content) public{ 
        //require valid content
        require(bytes(_content).length > 0); //if false it stops execution and gas used will be refunded back to caller, else continues execution

        
        /* Here _content is a local var and underscore is just a conventions for local vars*/
        postCount++;        
        posts[postCount] = Post(postCount, _content, 0, msg.sender); /* Instantiates Post, adds it into map */

        //Trigger event from solidity smart contracts
        //these posts can be open for subscription by consumers
        emit PostCreated(postCount, _content, 0, msg.sender);

    }

}