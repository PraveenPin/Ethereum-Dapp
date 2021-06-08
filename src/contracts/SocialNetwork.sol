pragma solidity ^0.8.0;

import './owned.sol';

contract SocialNetwork is owned{
    /*Add code */
    string public networkName; /* State variable -> this value gets stored on block chain*/
    // we cannot know the length of any map and cannot iterate over it, we can only fetch individually
    mapping(uint => Post) public posts;/* Key Value Store, gets written to block chain itself */
    mapping(uint => User) public users;
    mapping(address => uint) public addressToUid;
    mapping(uint => mapping(uint => Comment)) public comments;

    uint public postCount = 0;
    uint16 public userCount = 0;

    struct User{
        uint id;
        address userAddress;
        string name;        
        mapping(uint => bool) followerIds;
        mapping(uint => bool) myPostIds; //not user's id
        mapping(uint => bool) followingIds;
        uint followersCount;
        uint followingCount;
        uint tipObtained;
        uint tipDonated;
    } 

    struct Post{
        uint pid;
        string content;
        string url;
        uint tipAmount;
        address payable author;
        uint authorId;
        string authorName;
        uint commentsCount;
    }

    struct Comment{
        uint postId;
        uint cid;
        string comment;
        address author;
        uint authorId;
        string authorName;
    }

    constructor () {
        networkName = "ETH - SocialNetwork";
    }

    //events for creating user, following a user, unfollowing a user
    event AutoCreateUser(address indexed sender, string message);
    event FollowOrUnFollowUser(address indexed sender, uint senderId, uint author, string message, uint count);

    function autoCreateUser(string memory _uname) public {        
        require(bytes(_uname).length > 0);
        userCount++;
        User storage _user = users[userCount];
        emit AutoCreateUser(msg.sender, "Creating User");            
        _user.id = userCount;
        _user.name = _uname;
        _user.userAddress = msg.sender;
        _user.followersCount = 0;
        _user.followingCount = 0;
        _user.tipObtained = 0;
        _user.tipDonated = 0;
        addressToUid[msg.sender] = userCount;
        emit AutoCreateUser(msg.sender, "User Created");
    }

    function getUserInfo() public view returns (uint, string memory, uint, uint, uint, uint){     
        uint _userId = addressToUid[msg.sender];
        require(_userId > 0);   
        User storage _user = users[_userId];
        return (_user.id, _user.name, _user.followersCount, _user.followingCount, _user.tipObtained, _user.tipDonated);
    }

    function followAuthor(uint _authorId) public checkAddress{
        uint senderId = addressToUid[msg.sender];
        require(senderId != _authorId);
        uint followingCount = users[senderId].followingCount;
        uint authorsFollowersCount = users[_authorId].followersCount;
        users[senderId].followingIds[_authorId] = true;
        users[_authorId].followerIds[senderId] = true;
        users[senderId].followingCount = followingCount+1;
        users[_authorId].followersCount = authorsFollowersCount+1;
        emit FollowOrUnFollowUser(msg.sender, senderId, _authorId, "Following the author with new count", followingCount+1);
    }

    function unFollowAuthor(uint _authorId) public checkAddress{
        uint senderId = addressToUid[msg.sender];
        require(senderId != _authorId);
        uint followingCount = users[senderId].followingCount;
        uint authorsFollowersCount = users[_authorId].followersCount;
        users[senderId].followingIds[_authorId] = false;
        users[senderId].followingCount = followingCount-1;
        users[_authorId].followerIds[senderId] = false;
        users[_authorId].followersCount = authorsFollowersCount-1;
        emit FollowOrUnFollowUser(msg.sender, senderId, _authorId, "UnFollowing the author with new count", followingCount -1);
    }

    event FetchMyPosts(address indexed addr, uint[] myPostIds);

    event FetchMyNetworkIds(address indexed sender, uint[] followingIds, uint[] followerIds);

    function getMyPosts(uint _id) public returns (uint[] memory, Post[] memory){        
        uint myPostCount = 0;
        uint counter = 0;

        User storage _user = users[_id];
        for (uint i = 1; i <= postCount; i++){
            if(_user.myPostIds[i]){
                myPostCount++;
            }
        }
        
        uint[] memory postIds = new uint[](myPostCount);
        Post[] memory myPosts = new Post[](myPostCount);
        
        for (uint i = 1; i <= postCount; i++){
            if(_user.myPostIds[i]){
                postIds[counter] = i;
                myPosts[counter++] = posts[i];
            }
        }
        emit FetchMyPosts(msg.sender,postIds);
        return (postIds, myPosts);
    }

    function getAllFollowingIds() public returns (uint[] memory, uint[] memory){
        uint myId = addressToUid[msg.sender];
        require(myId > 0 && myId <= userCount);
        User storage _user = users[myId];
        uint[] memory followingIds = new uint[](_user.followingCount);
        uint[] memory followerIds = new uint[](_user.followersCount);
        uint counter = 0;
        for (uint i = 1; i <= userCount; i++){
            if(_user.followingIds[i]){
                followingIds[counter++] = i;
            }
        }
        counter = 0;
        for (uint i = 1; i <= userCount; i++){
            if(_user.followerIds[i]){
                followerIds[counter++] = i;
            }
        }
        emit FetchMyNetworkIds(msg.sender,followingIds,followerIds);
        return (followingIds,followerIds);
    }

    function getUserData(uint _uid) public view returns (uint, string memory, uint, uint, uint, uint){     
        require(_uid > 0);   
        User storage _user = users[_uid];
        return (_user.id, _user.name, _user.followersCount, _user.followingCount, _user.tipObtained, _user.tipDonated);
    }

    event PostCreated(address indexed id, uint pid, string content, string url, uint tipAmount, address author, uint authorId, string authorName);

    function createPost(string memory _content, string memory _url) public{ 
        //require valid content
        require(bytes(_content).length > 0); //if false it stops execution and gas used will be refunded back to caller, else continues execution
        
        /* Here _content is a local var and underscore is just a conventions for local vars*/
        postCount++;        
        uint userId = addressToUid[msg.sender];
        posts[postCount] = Post(postCount, _content, "https://github.com/PraveenPin/Simple-Social-Network", 0, payable(msg.sender), userId, users[userId].name, 0); /* Instantiates Post, adds it into map */        
        //adding the post id to the user
        users[userId].myPostIds[postCount] = true;

        //Trigger event from solidity smart contracts
        //these posts can be open for subscription by consumers
        emit PostCreated(msg.sender,postCount, _content, _url, 0, msg.sender, userId, users[userId].name);
    }

    event PostTipped(uint pid, uint tipAmount, address author);

    function tipAPost(uint _id) public payable {
        require(_id > 0 && _id <= postCount);
        Post memory _post = posts[_id];
        address payable _author = _post.author;
        //paying the author by sending ether
        payable(address(_author)).transfer(msg.value);
        //here the tip should be ether, so we use function meta data
        _post.tipAmount = _post.tipAmount + msg.value;
        posts[_id] = _post;
        
        //add tip amount to user donation
        users[addressToUid[msg.sender]].tipDonated += msg.value;
        //add tip amount to author's obtained tip
        users[_post.authorId].tipObtained += msg.value;
        emit PostTipped(postCount, _post.tipAmount, _author);
    }

    //functions, events to create and delete comments
    event CommentDeleted(uint pid, uint cid, string deletedComment, address commentAuthor, string authorName);
    event CommentCreated(uint pid, uint cid, string comment, address commentedUser, string authorName);

    function createComment(uint _pid, string memory _comment) public {
        require(_pid > 0 && _pid <= postCount);
        Post memory _post = posts[_pid];
        uint commentsCount = _post.commentsCount;
        commentsCount++;
        User storage _user = users[addressToUid[msg.sender]];
        comments[_pid][commentsCount] = Comment(_pid, commentsCount, _comment, msg.sender, _user.id, _user.name);
        posts[_pid].commentsCount = commentsCount;
        emit CommentCreated(_pid, commentsCount, _comment, msg.sender, _user.name);
    }

    function deleteComment(uint _pid, uint _cid) public {
        require(_pid > 0 && _pid <= postCount);
        Post memory _post = posts[_pid];
        uint commentsCount = _post.commentsCount;
        require(_cid > 0 && _cid <= commentsCount);
        Comment memory _comment = comments[_pid][_cid];
        delete comments[_pid][_cid];
        commentsCount--;
        posts[_pid].commentsCount = commentsCount;
        emit CommentDeleted(_pid, _cid, _comment.comment, _comment.author, _comment.authorName);

    }

    function fetchAllComments(uint _postId) public view returns (Comment[] memory){
        require(_postId > 0 && _postId <= postCount);
        Post memory _post = posts[_postId];
        uint commentsCount = _post.commentsCount;
        Comment[] memory postComments = new Comment[](commentsCount);

        for(uint i=1; i<= commentsCount; i++){
            postComments[i-1] = comments[_postId][i];
        }
        return postComments;
    }

    //self destruct event 
    event DestroyContract(address sender, address caller, uint balance);

    function destroyContract() public onlyOwner{
        emit DestroyContract(msg.sender, owner, owner.balance);
        selfdestruct(payable(msg.sender));
    }

}