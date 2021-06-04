import React, { Component } from 'react';
import logo from '../logo.png';
import './App.css';
import Web3 from 'web3';
import SocialNetwork from '../abis/SocialNetwork.json';
import NavBar from './NavBar.jsx';
import Card from './Card.jsx';
import Profile from './Profile.jsx';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      allPosts: [],
      myPosts: [],
      isLoading: true,
      userData: null
    }
    this.explorePosts = this.explorePosts.bind(this);
  }

  async componentDidMount(){
    await this.loadWeb3();
    await this.loadBlockChainData();
  }

  async loadWeb3(){
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          // web3.eth.sendTransaction({/* ... */});
      } catch (error) {
          // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(Web3.currentProvider);
      // Acccounts always exposed
      // web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockChainData(){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account : accounts[0]});
    await this.fetchPosts();    
  }

  async fetchPosts(){
    //Network Id, address, ABI
    const web3 = window.web3;
    const networkId = await web3.eth.net.getId();
    const networkData = SocialNetwork.networks[networkId];
    if(networkData){
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address);
      this.setState({ socialNetwork: socialNetwork });
     //await socialNetwork.methods.postCount(); this just returns the postCount method
      // var g = await socialNetwork.methods.autoCreateUser("PraveenPin").estimateGas({from:this.state.account});
      const user = await socialNetwork.methods.addressToUid(this.state.account).call();
      console.log("User Id:", web3.utils.hexToNumber(user));
      if(!(web3.utils.hexToNumber(user) > 0)){
        socialNetwork.methods.autoCreateUser("PraveePin").send({from: this.state.account});
      }
      else{
        const userInfo = await socialNetwork.methods.getUserInfo().call({from: this.state.account});
        const myPosts = await socialNetwork.methods.getMyPosts(userInfo[0]).call({from: this.state.account});
        console.log("A:", userInfo, myPosts);
        this.setState({ userData: {
          id: userInfo[0],
          name: userInfo[1],
          followersCount: userInfo[2],
          followingCount: userInfo[3],
          tipObtained: userInfo[4],
          tipDonated: userInfo[5]
        }, myPosts: myPosts });
      }      
      this.explorePosts();
    }
    else{
      window.alert("Social Network contract not deployed to detected network");
    }
  }

 createAPost = (content, url) => {
    this.setState({ isLoading: true });
    this.state.socialNetwork.methods.createPost(content, url).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      console.log("receipt",receipt);
      this.setState({ isLoading: false, appple: 'apple' },() => console.log("C.",this.state));
    });
    this.setState({ isLoading: false });
  }

  tipAPost= (id, tipAmount)=>{
    this.setState({ isLoading: true });
    console.log("isLoading:",this.state);
    this.state.socialNetwork.methods.tipAPost(id).send({ from: this.state.account, value: tipAmount });
    this.setState({ isLoading: false });
  }

  followAuthor = (authorId) => {
    this.state.socialNetwork.methods.followAuthor(authorId).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      console.log("r:",receipt);
    });
    //notification for following
  }

  async explorePosts(){
    const postCount = await this.state.socialNetwork.methods.postCount().call(); // this calls the method and returns the postCount
    //call methods just read data from blockchain, costs no gas
    //send methods writes data on blockchain, costs gas
    this.setState({ postCount });
    for(var i = 0; i <= postCount; i++){
      let post = await this.state.socialNetwork.methods.posts(i).call();
      this.setState({ isLoading: false, allPosts: [...this.state.allPosts, post ]});
    }
  }

  render() {
    return (
      <div>
        <NavBar account = {this.state.account}/>
        {this.state.isLoading ? <div id="loader" className="text-center"> <p style={{ marginTop: '65px'}}>Loading......</p></div> : 
                             <div style={{ display: 'flex', flexWrap: 'wrap', 
                                   marginTop: '3rem' , marginLeft: '2rem',height: '600px', scroll: 'auto'}}>
                                <div style={{ width: '30%' }}>
                                    {!!this.state.userData && (
                                        <Profile
                                          userData={this.state.userData}
                                          myPosts={this.state.myPosts}
                                        />
                                    )}
                                </div>
                                <div style={{ width: '70%' }}>
                                  <Card posts={this.state.allPosts} 
                                    tipPost={this.tipAPost} 
                                    createPost={this.createAPost}
                                    followAuthor={this.followAuthor}
                                  />
                                </div>
                             </div>
        }
      </div>
    );
  }
}

export default App;
