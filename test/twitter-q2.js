const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Twitter Project Quest 2 Tests", () => {
  let Twitter, twitter, addr1, addr2;

  beforeEach(async () => {
    Twitter = await ethers.getContractFactory("Twitter");
    twitter = await Twitter.deploy();
    [addr1, addr2, addr3, addr4] = await ethers.getSigners();

    await twitter.connect(addr1).registerAccount("Alice");
    await twitter.connect(addr2).registerAccount("Bob");
    await twitter.connect(addr3).registerAccount("Charlie");

    await twitter.connect(addr1).postTweet("Learning about Web3 is fun!");
    await twitter
      .connect(addr2)
      .postTweet(
        "I really like Data Science, but I guess Web3 development is kind of cool too"
      );
    await twitter.connect(addr3).postTweet("Apples are so tasty");
    await twitter
      .connect(addr2)
      .postTweet("Theres so much to cover in machine learning");
    await twitter
      .connect(addr3)
      .postTweet("Apple juice is basically sugar water");
    await twitter
      .connect(addr3)
      .postTweet("Green apples are better than red ones");
  });

  describe("followUser(), getFollowing() and getFollowers()", () => {
    beforeEach(async () => {
      await twitter.connect(addr1).followUser(addr2.address);
      await twitter.connect(addr1).followUser(addr3.address);
      await twitter.connect(addr2).followUser(addr3.address);
    });

    it("Should get following", async () => {
      const addr1Following = await twitter.connect(addr1).getFollowing();
      expect(addr1Following[0]).to.equal(addr2.address);
      expect(addr1Following[1]).to.equal(addr3.address);

      const addr2Following = await twitter.connect(addr2).getFollowing();
      expect(addr2Following[0]).to.equal(addr3.address);

      const addr3Following = await twitter.connect(addr3).getFollowing();
      expect(addr3Following.length).to.equal(0);
    });

    it("Should get followers", async () => {
      const addr1Followers = await twitter.connect(addr1).getFollowers();
      expect(addr1Followers.length).to.equal(0);

      const addr2Followers = await twitter.connect(addr2).getFollowers();
      expect(addr2Followers[0]).to.equal(addr1.address);

      const addr3Followers = await twitter.connect(addr3).getFollowers();
      expect(addr3Followers[0]).to.equal(addr1.address);
      expect(addr3Followers[1]).to.equal(addr2.address);
    });
  });

  describe("getTweetFeed()", async () => {
    it("Should get Tweet feed", async () => {
      const allTweets = await twitter.getTweetFeed();
      expect(allTweets.length).to.equal(6);

      expect(allTweets[0].author).to.equal(addr1.address);
      expect(allTweets[0].content).to.equal("Learning about Web3 is fun!");

      expect(allTweets[3].author).to.equal(addr2.address);
      expect(allTweets[3].content).to.equal(
        "Theres so much to cover in machine learning"
      );

      expect(allTweets[5].author).to.equal(addr3.address);
      expect(allTweets[5].content).to.equal(
        "Green apples are better than red ones"
      );
    });
  });

  describe("sendMessage() and readConversationWithUser()", async () => {
    beforeEach(async () => {
      await twitter
        .connect(addr1)
        .sendMessage(
          addr2.address,
          "Hi Bob! Wanna get lunch and catch up soon?"
        );
      await twitter
        .connect(addr2)
        .sendMessage(addr1.address, "Hey Alice, that sounds good!");
      await twitter
        .connect(addr1)
        .sendMessage(
          addr2.address,
          "Noice. Can you invite Charlie as well too please"
        );
      await twitter
        .connect(addr2)
        .sendMessage(
          addr3.address,
          "Hello Charlie, wanna join me and Alice for lunch?"
        );
    });

    it("Should update the messageId", async () => {
      expect(await twitter.nextMessageId()).to.equal(4);
    });

    it("Should get conversation with user", async () => {
      const addr1ToAddr2Convo = await twitter
        .connect(addr1)
        .getConversationWithUser(addr2.address);
      expect(addr1ToAddr2Convo[0].messageId).to.equal(0);
      expect(addr1ToAddr2Convo[0].content).to.equal(
        "Hi Bob! Wanna get lunch and catch up soon?"
      );
      expect(addr1ToAddr2Convo[0].from).to.equal(addr1.address);
      expect(addr1ToAddr2Convo[0].to).to.equal(addr2.address);

      expect(addr1ToAddr2Convo[1].messageId).to.equal(1);
      expect(addr1ToAddr2Convo[1].content).to.equal(
        "Hey Alice, that sounds good!"
      );
      expect(addr1ToAddr2Convo[1].from).to.equal(addr2.address);
      expect(addr1ToAddr2Convo[1].to).to.equal(addr1.address);

      const addr2ToAddr1Convo = await twitter
        .connect(addr2)
        .getConversationWithUser(addr1.address);
      expect(addr2ToAddr1Convo[1].messageId).to.equal(1);
      expect(addr2ToAddr1Convo[1].content).to.equal(
        "Hey Alice, that sounds good!"
      );
      expect(addr2ToAddr1Convo[1].from).to.equal(addr2.address);
      expect(addr2ToAddr1Convo[1].to).to.equal(addr1.address);

      expect(addr2ToAddr1Convo[2].messageId).to.equal(2);
      expect(addr2ToAddr1Convo[2].content).to.equal(
        "Noice. Can you invite Charlie as well too please"
      );
      expect(addr2ToAddr1Convo[2].from).to.equal(addr1.address);
      expect(addr2ToAddr1Convo[2].to).to.equal(addr2.address);

      const addr3toAddr2Convo = await twitter
        .connect(addr3)
        .getConversationWithUser(addr2.address);
      expect(addr3toAddr2Convo[0].messageId).to.equal(3);
      expect(addr3toAddr2Convo[0].content).to.equal(
        "Hello Charlie, wanna join me and Alice for lunch?"
      );
      expect(addr3toAddr2Convo[0].from).to.equal(addr2.address);
      expect(addr3toAddr2Convo[0].to).to.equal(addr3.address);
    });
  });
});
