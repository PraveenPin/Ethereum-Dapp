pragma solidity ^0.5.0;

contract SocialNetwork{
    /*Add code */
    string public name; /* State variable -> this value gets stored on block chain*/
    // we cannot know the length of any map and cannot iterate over it, we can only fetch individually
    mapping(uint => Post) public posts;/* Key Value Store, gets written to block chain itself */

    uint public postCount = 0;

    struct Post{
        uint pid;
        string content;
        uint tipAmount;
        address payable author;
    }

    constructor () public {
        name = "ETH - SocialNetwork";
    }

    event PostCreated(uint id, string content, uint tipAmount, address author);

    event PostTipped(uint id, string content, uint tipAmount, address author);

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

    function tipAPost(uint _id) public payable {
        require(_id > 0 && _id <= postCount);
        Post memory _post = posts[_id];
        address payable _author = _post.author;
        //paying the author by sending ether
        address(_author).transfer(msg.value);
        //here the tip should be ether, so we use function meta data
        _post.tipAmount = _post.tipAmount + msg.value;
        posts[_id] = _post;
        emit PostCreated(postCount, _post.content, _post.tipAmount, _author);
    }

}