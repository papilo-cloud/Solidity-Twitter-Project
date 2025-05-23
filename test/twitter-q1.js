const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Twitter Project Quest 1 Tests', () => {
    let Twitter, twitter, addr1, addr2;

    beforeEach(async () => {
        Twitter = await ethers.getContractFactory("Twitter");
        twitter = await Twitter.deploy();
        [addr1, addr2, addr3] = await ethers.getSigners();
    });

    describe('registerAccount()', () => {
        it("Should register an account", async() => {
            await twitter.connect(addr1).registerAccount('Alice');
            const user = await twitter.users(addr1.address);
            expect(user.wallet).to.equal(addr1.address);
            expect(user.name).to.equal('Alice');
        })

        it('Should not register an account with an empty string name', async() => {
            await expect(twitter.connect(addr1).registerAccount('')).to.be.revertedWith('Name cannot be an empty string');
        })
    })

    describe('postTweet()', () => {
        beforeEach(async() => {
            await twitter.connect(addr1).registerAccount('Alice');
            await twitter.connect(addr2).registerAccount('Bob');
        })

        it("It should post a tweet", async() => {
            await twitter.connect(addr1).postTweet('Learning about Web3 is fun!');
            const tweet = await twitter.tweets(0);
            expect(tweet.author).to.equal(addr1.address);
            expect(tweet.content).to.equal('Learning about Web3 is fun!');
            expect(await twitter.nextTweetId()).to.equal(1);
        })

        it("Should not post a tweet if wallet has not registered for an account", async() => {
            await expect(twitter.connect(addr3).postTweet('Learning about Web3 is fun!')).to.be.revertedWith('This wallet does not belong to any account.');
        })
    })

    describe('readTweets()', () => {
        it('Should read tweets', async() => {
            await twitter.connect(addr1).registerAccount('Alice');
            await twitter.connect(addr2).registerAccount('Bob');

            await twitter.connect(addr1).postTweet('Learning about Web3 is fun!');
            await twitter.connect(addr2).postTweet('I really like Data Science, but I guess Web3 development is kind of cool too');
            await twitter.connect(addr1).postTweet('Web3 development sure can be tough at times though...');

            const addr1Tweets = await twitter.readTweets(addr1.address);
            expect(addr1Tweets[0].tweetId).to.equal(0);
            expect(addr1Tweets[0].author).to.equal(addr1.address);
            expect(addr1Tweets[0].content).to.equal('Learning about Web3 is fun!');
            expect(addr1Tweets[1].tweetId).to.equal(2);
            expect(addr1Tweets[1].content).to.equal('Web3 development sure can be tough at times though...');

            const addr2Tweets = await twitter.readTweets(addr2.address);
            expect(addr2Tweets[0].tweetId).to.equal(1);
            expect(addr2Tweets[0].author).to.equal(addr2.address);
            expect(addr2Tweets[0].content).to.equal('I really like Data Science, but I guess Web3 development is kind of cool too');
        })
    })
})