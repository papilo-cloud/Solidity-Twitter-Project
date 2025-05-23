// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Twitter {
    // ----- START OF DO-NOT-EDIT ----- //
    struct Tweet {
        uint tweetId;
        address author;
        string content;
        uint createdAt;
    }

    struct User {
        address wallet;
        string name;
        uint[] userTweets;
    }

    mapping(address => User) public users;
    mapping(uint => Tweet) public tweets;
    uint256 public nextTweetId;
    // ----- END OF DO-NOT-EDIT ----- //

    function registerAccount(string calldata _name) external {
        bytes memory checkString = bytes(_name);
        require(checkString.length > 0, "Name cannot be an empty string");

        User storage user = users[msg.sender];
        user.wallet = msg.sender;
        user.name = _name;
    }

    modifier accountExists(address _addr) {
        User storage user = users[_addr];
        bytes memory checkString = bytes(user.name);
        require(checkString.length > 0, "This wallet does not belong to any account.");
        _;
    }

    function postTweet(string calldata _content) external accountExists(msg.sender) {    
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
        uint256[] storage userTweetIds = user.userTweets;
        Tweet[] memory userTweets = new Tweet[](userTweetIds.length);

        for (uint i = 0; i < userTweetIds.length; i++) {
            userTweets[i] = tweets[userTweetIds[i]];
        }
        return userTweets;
    }
}