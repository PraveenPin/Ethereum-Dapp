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

        it('creates posts', async () => {
            result  = await socialNetwork.createPost('This is my first post', {from: author}); 
            /*Although createPost requires only one arg, we send other metadata from vars 
            which are used inside that function is original code, 
            this author above corresponds to msg.sender in original code*/
            postCount = await socialNetwork.postCount();
            //SUCCESS
            assert.equal(postCount,1);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(event.content, 'This is my first post','content is correct');
            assert.equal(event.tipAmount, '0', 'Tip Amount is correct');
            assert.equal(event.author, author,'Author is correct');

            await socialNetwork.createPost('',{from : author}).should.be.rejected;
        })
        
        it('lists posts', async () => {

        })
        
        it('allow users to tip posts', async () => {

        })
    })
})