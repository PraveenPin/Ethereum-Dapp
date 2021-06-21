const { assert, expect } = require('chai');

const SocialNetwork = artifacts.require('./SocialNetwork.sol');

require('chai')
.use(require('chai-as-promised'))
.should()

/* Skeleton for tests */
contract('SocialNetwork', ([deployer, author, tipper]) => {
    let socialNetwork;

    before(async () => {        
        socialNetwork = await SocialNetwork.deployed();
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = socialNetwork.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })

        it('has a name 1', async () => {
            const name = await socialNetwork.networkName();
            assert.notEqual(name,'Social Network');
        })

        it('has a name 2', async () => {
            const networkName = await socialNetwork.networkName();
            assert.notEqual(networkName,'ETH - Social Network');
        })
    })


    describe('User data', async () => {
        let user1,user2, userCount;

        before(async () => {
            user1 = await socialNetwork.autoCreateUser("Dummy User", {from : author});
            user2 = await socialNetwork.autoCreateUser("Fol User", {from : tipper});    
            userCount = await socialNetwork.userCount();                    
        })

        it('creates an user', async () => {
            const event = user1.logs[0].args;
            assert.equal(event.sender, author,'SENDER is correct');
            assert.equal(event.message, "Creating User", 'USER is getting created - check');

            await socialNetwork.autoCreateUser('',{from : author}).should.be.rejected;
        });

        it('get user id from address', async () => {
            const userId = await socialNetwork.getUserIdFromAddress(author);            
            assert.equal(userId.toNumber(), 1, 'USER ID is correct');
        })

        it('get user info', async () => {
            const response = await socialNetwork.getUserInfo({from: author});

            assert.equal(response[0].toNumber(),1, 'USER ID is correct');
            assert.equal(response[1],"Dummy User", 'USER NAME is correct');
            assert.equal(response[2].toNumber(),0, 'FOLLOWER COUNT is correct');
            assert.equal(response[3].toNumber(),0, 'FOLLOWING COUNT is correct');
        })

        it('get a particular user data', async () => {
            const response = await socialNetwork.getUserData(2, {from: author});

            assert.equal(response[0].toNumber(),2, 'USER ID is correct');
            assert.equal(response[1],"Fol User", 'USER NAME is correct');
            assert.equal(response[2].toNumber(),0, 'FOLLOWER COUNT is correct');
            assert.equal(response[3].toNumber(),0, 'FOLLOWING COUNT is correct');

        });

        it('follow count', async () => {
            const eventRes = await socialNetwork.followAuthor(2, {from: author});
            
            const event = eventRes.logs[0].args;
            assert.equal(event.sender, author, "SENDER is correct");
            assert.equal(event.senderId.toNumber(), 1, "SENDER ID is correct");
            assert.equal(event.author, 2, "AUTHOR is correct");
            assert.equal(event.message,"Following the author with new count", "FOLLOWING MESSAGE is correct");
            assert.equal(event.count, 1, "FOLLOWING COUNT is correct");
        });

        it('unfollow count', async () => {
            const eventRes = await socialNetwork.unFollowAuthor(2, {from: author});
            
            const event = eventRes.logs[0].args;
            assert.equal(event.sender, author, "SENDER is correct");
            assert.equal(event.senderId.toNumber(), 1, "SENDER ID is correct");
            assert.equal(event.author, 2, "AUTHOR is correct");
            assert.equal(event.message,"UnFollowing the author with new count", "UNFOLLOWING MESSAGE is correct");
            assert.equal(event.count, 0, "UNFOLLOWING COUNT is correct");
        })

        it('get my following and follower ids', async () => {
            const res = await socialNetwork.getAllFollowingIds({ from: author });
            
            const event = res.logs[0].args;
            assert.equal(event.sender,author,"GET MY NETWORK IDS - SENDER is correct");
            expect(event.followingIds).to.be.an('array');
            expect(event.followerIds).to.be.an('array');
        });

        it('get whole network for an id', async () => {
            const res = await socialNetwork.getWholeNetworkForAnId(1, { from: author });
            
            const event = res.logs[0].args;
            assert.equal(event.sender,author,"NETWORK IDS - SENDER is correct");
            expect(event.followingIds).to.be.an('array');
            expect(event.followerIds).to.be.an('array');
        });

    });

    describe('posts', async () => {
        let user1, user2, result, postCount;

        before(async () => {
            user1 = await socialNetwork.autoCreateUser("Dummy User", {from : author});
            user2 = await socialNetwork.autoCreateUser("Fol User", {from : tipper});   
            result  = await socialNetwork.createPost('This is my first post', 'http://www.google.com', "0x0", {from: author}); 
            /*Although createPost requires only one arg, we send other metadata from vars 
            which are used inside that function is original code, 
            this author above corresponds to msg.sender in original code*/
            postCount = await socialNetwork.postCount();
        })

        it('creates posts', async () => {
            //SUCCESS
            assert.equal(postCount,1);
            
            const event = result.logs[0].args;
            assert.equal(event.pid.toNumber(), postCount.toNumber(), 'POST ID is correct');
            assert.equal(event.content, 'This is my first post','CONTENT is correct');
            assert.equal(event.url, 'http://www.google.com', 'URL is correct')
            assert.equal(event.tipAmount, '0', 'TIP AMOUNT is correct');
            assert.equal(event.author, author,'AUTHOR is correct');
            assert.equal(event.authorId.toNumber(), 3, "AUTHOR ID is correct");
            assert.equal(event.imageHash, '0x0000000000000000000000000000000000000000000000000000000000000000','IMAGE HASH is correct');

            await socialNetwork.createPost('',{from : author}).should.be.rejected;
        })
        
        it('lists posts', async () => {
            const post = await socialNetwork.getPostFromPostId(postCount);
            assert.equal(post.content, 'This is my first post','content is correct');
            assert.equal(post.tipAmount, '0', 'Tip Amount is correct');
            assert.equal(post.author, author,'Author is correct');
        })

        it('get my posts', async () => {
            const resultPosts = await socialNetwork.getMyPosts(1, {from: author});

            const event = resultPosts.logs[0].args;
            assert.equal(event.addr, author, "MY POSTS - LOGS - AUTHOR is correct");
        })
        
        it('allow users to tip posts', async () => {
            let oldBal,newBal;
            oldBal = await web3.eth.getBalance(author);
            oldBal = new web3.utils.BN(oldBal);

            result =  await socialNetwork.tipAPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') });
            
            const event = result.logs[0].args;
            assert.equal(event.pid.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(event.tipAmount, '1000000000000000000', 'Tip Amount is correct');
            assert.equal(event.author, author,'Author is correct');

            newBal = await web3.eth.getBalance(author);
            newBal = new web3.utils.BN(newBal);

            let tipAmount = web3.utils.toWei('1','Ether');
            tipAmount = new web3.utils.BN(tipAmount);

            const expectedBal = oldBal.add(tipAmount);

            assert.equal(newBal.toString(), expectedBal.toString());

            //should not allow to tip a post that does not exist
            await socialNetwork.tipAPost(99, {from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

        })
    });

    describe('comments', async () => {
        
        let user1, user2, post, postCount, comment;

        before(async () => {
            user1 = await socialNetwork.autoCreateUser("Dummy User", {from : author});
            user2 = await socialNetwork.autoCreateUser("Fol User", {from : tipper});   
            post  = await socialNetwork.createPost('This is my first post', 'http://www.google.com', "0x0", {from: author}); 
            /*Although createPost requires only one arg, we send other metadata from vars 
            which are used inside that function is original code, 
            this author above corresponds to msg.sender in original code*/
            postCount = await socialNetwork.postCount();

            comment = await socialNetwork.createComment(postCount, "This is a test comment", { from: tipper });
        })

        it('creates a comment', async () => {
            const event = comment.logs[0].args;

            assert.equal(event.pid.toNumber(), 2, "POST'S ID is correct");
            assert.equal(event.cid.toNumber(), 1, "COMMENT'S ID is correct");
            assert.equal(event.comment, "This is a test comment", "COMMENT is correct");
            assert.equal(event.commentedUser, tipper, "COMMENTER ADDRESS is correct");
            assert.equal(event.authorName, "Fol User", "AUTHOR'S NAME is correct");
        });

        it('fetched all comments for a post', async () => {
            const res = await socialNetwork.fetchAllComments(2, {from: author});
            expect(res).to.be.an('array');
            // ary.forEach((elt, index) => {
            //     expect(
            //       elt instanceof MyType, 
            //       `ary[${index}] is not a MyType`
            //     ).to.be.true
            // })
            // assert.equal(res[0][0].toNumber(), 2, "POST'S ID is correct");
            // assert.equal(res[0].cid.toNumber(), 1, "COMMENT'S ID is correct");
            // assert.equal(res[0].comment, "This is a test comment", "COMMENT is correct");
            // assert.equal(res[0].author, tipper, "AUTHOR ADDRESS is correct");
            // assert.equal(res[0].authorName, "Fol User", "AUTHOR'S NAME is correct");
            // assert.equal(res[0].authorId.toNumber(), 2, "AUTHOR'S ID is correct");
        });

        it('creates a tag', async () => {
            const res = await socialNetwork.createTag("sample text for a tag", 2);

            const event = res.logs[0].args;
            assert.equal(event.postId, 2, "TAG - POST ID is correct");
            expect(event.tags).to.be.an('array');
        });

        it('get posts from tag', async () => {
            const res = await socialNetwork.getPostsFromTag('sample');

            const event = res.logs[0].args;
            assert.equal(event.tag, "sample", "TAG - Tag is matched");
            expect(event.posts).to.be.an('array');
        });
    });
})