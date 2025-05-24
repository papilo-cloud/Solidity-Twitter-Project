// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Twitter {
    
    struct Tweet {
        uint tweetId;
        address author;
        string content;
        uint createdAt;
    }

    struct Message {
        uint messageId;
        string content;
        address from;
        address to;
    }

    struct User {
        address wallet;
        string name;
        uint[] userTweets;
        address[] following;
        address[] followers;
        mapping(address => Message[]) conversations;
    }

    mapping(address => User) public users;
    mapping(uint => Tweet) public tweets;

    uint256 public nextTweetId;
    uint256 public nextMessageId;

    function registerAccount(string calldata _name) external {
        bytes memory checkString = bytes(_name);
        require(checkString.length > 0, "Name cannot be an empty string");
        User storage user = users[msg.sender];
        user.wallet = msg.sender;
        user.name = _name;
    }

   
    function postTweet(string calldata _content) external accountExists(msg.sender){
        Tweet storage tweet = tweets[nextTweetId];
        User storage user = users[msg.sender];
    
        tweet.author = msg.sender;
        tweet.content = _content;
        tweet.createdAt = block.timestamp;
        tweet.tweetId = nextTweetId;
        user.userTweets.push(nextTweetId);
        nextTweetId++;
    }
        
     function readTweets(address _user) view external returns(Tweet[] memory) {
        User storage user = users[_user];
        uint[] storage userTweetIds = user.userTweets;
        Tweet[] memory userTweets = new Tweet[](userTweetIds.length);

        for (uint i = 0; i < userTweetIds.length; i++) {
            userTweets[i] = tweets[userTweetIds[i]];
        }
        return  userTweets;
    }

     modifier accountExists(address _addr) {
        User storage user = users[_addr];
        bytes memory checkString = bytes(user.name);

        require(checkString.length > 0, "This wallet does not belong to any account.");
        _;
    }

    function followUser(address _user) external accountExists(_user) accountExists(msg.sender) {
        User storage follow = users[msg.sender];
        User storage follower = users[_user];

        follow.following.push(_user);
        follower.followers.push(msg.sender);
    }

    function getFollowing() external view accountExists(msg.sender) returns(address[] memory) {
        return users[msg.sender].following;
    }

    function getFollowers() external view accountExists(msg.sender) returns(address[] memory) {
        return users[msg.sender].followers;
    }

    function getTweetFeed() external view returns(Tweet[] memory) {
        // In order to initialize an array from memory you have to do it like this:
        Tweet[] memory allTweets = new Tweet[](nextTweetId);
        for (uint i = 0; i < nextTweetId; i++) 
        {
            allTweets[i] = tweets[i];
        }
        return allTweets;
    }

    function sendMessage(address _recipient, string calldata _content) external accountExists(msg.sender) accountExists(_recipient) {
        Message memory newMessage = Message(nextMessageId, _content, msg.sender, _recipient);
        users[msg.sender].conversations[_recipient].push(newMessage);
        users[_recipient].conversations[msg.sender].push(newMessage);

        nextMessageId++;
    }

    function getConversationWithUser(address _user) external view returns(Message[] memory) {
        return users[msg.sender].conversations[_user];
    }
}