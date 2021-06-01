import React, { Component } from 'react';
import logo from '../logo.png';
import './App.css';
import Web3 from 'web3';
import SocialNetwork from '../abis/SocialNetwork.json';
import NavBar from './NavBar.jsx';
import Main from './Main.jsx';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      isLoading: true
    }
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
      const postCount = await socialNetwork.methods.postCount().call(); // this calls the method and returns the postCount
      //call methods just read data from blockchain, costs no gas
      //send methods writes data on blockchain, costs gas
      this.setState({ postCount });
      for(var i = 0; i <= postCount; i++){
        let post = await socialNetwork.methods.posts(i).call();
        this.setState({ isLoading: false, posts: [...this.state.posts, post ]});
      }
    }
    else{
      window.alert("Social Network contract not deployed to detected network");
    }
  }

 createAPost = (content) => {
    this.setState({ loading: true });
    this.state.socialNetwork.methods.createPost(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      console.log("receipt",receipt);
      this.setState({ loading: false });
    });
  }

  tipAPost = (id, tipAmount) => {
    this.setState({ loading: true });
    this.state.socialNetwork.methods.tipAPost(id).send({ from: this.state.account, value: tipAmount })
    .once('receipt', (receipt) => {
      this.setState({ loading: false }, () => window.location.reload());
    })
  }

  render() {
    console.log("Posts:",this.state.posts);
    return (
      <div>
        <NavBar account = {this.state.account}/>
        {this.state.isLoading ? <div id="loader" className="text-center"> <p>Loading......</p></div> : 
                              <Main posts={this.state.posts} tipPost={this.tipAPost} createPost={this.createAPost}/>
        }
      </div>
    );
  }
}

export default App;
