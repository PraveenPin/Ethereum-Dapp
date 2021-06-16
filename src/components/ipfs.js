//old versions

// const IPFS = require('ipfs-api');
// const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});

// const {ipfsClient} = require('ipfs-http-client');
// const ipfs = new ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
// const ipfs = ipfsClient(new URL('https://ipfs.infura.io:5001'));


//new versions
const { create } = require('ipfs-http-client');
// connect to a different API
const ipfs = create(new URL('https://ipfs.infura.io:5001'))

export default ipfs;