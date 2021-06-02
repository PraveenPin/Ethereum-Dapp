const { assert } = require('chai');

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

        it('has a name', async () => {
            const name = await socialNetwork.name();
            assert.notEqual(name,'ETH - Social Network');
        })
    })

    describe('posts', async () => {
        let result, postCount;

        before(async () => {
            result  = await socialNetwork.createPost('This is my first post', {from: author}); 
            /*Although createPost requires only one arg, we send other metadata from vars 
            which are used inside that function is original code, 
            this author above corresponds to msg.sender in original code*/
            postCount = await socialNetwork.postCount();
        })

        it('creates posts', async () => {
            //SUCCESS
            assert.equal(postCount,1);
            
            const event = result.logs[0].args;
            assert.equal(event.pid.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(event.content, 'This is my first post','content is correct');
            assert.equal(event.tipAmount, '0', 'Tip Amount is correct');
            assert.equal(event.author, author,'Author is correct');

            await socialNetwork.createPost('',{from : author}).should.be.rejected;
        })
        
        it('lists posts', async () => {
            const post = await socialNetwork.posts(postCount);
            assert.equal(post.pid.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(post.content, 'This is my first post','content is correct');
            assert.equal(post.tipAmount, '0', 'Tip Amount is correct');
            assert.equal(post.author, author,'Author is correct');
        })
        
        it('allow users to tip posts', async () => {
            let oldBal,newBal;
            oldBal = await web3.eth.getBalance(author);
            oldBal = new web3.utils.BN(oldBal);

            result =  await socialNetwork.tipAPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') });
            
            const event = result.logs[0].args;
            assert.equal(event.pid.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(event.content, 'This is my first post','content is correct');
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
    })
})