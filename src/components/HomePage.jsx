import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import logo from '../logo.png';
import ipfs from './ipfs';
import NavBar from './NavBar.jsx';
import Card from './Card.jsx';
import Profile from './Profile.jsx';
import { Loader } from './utils';
import { Tabs, Tab } from 'react-bootstrap';
import Ticker from 'react-ticker';

class HomePage extends Component {

  constructor(props){
    super(props);
    this.state = {
      postCount: 0,
      allPosts: [],
      myPosts: [],
      isLoading: true,
      userData: null,
      postSearchResult: [],
      tickerData: []

    }
    this.explorePosts = this.explorePosts.bind(this);
    // this.getNetworkPosts = this.getNetworkPosts.bind(this);
  }

  async componentDidMount(){
    this.explorePosts();
    this.fetchTickerExchangeData();
  }

 createAPost = (content, url, imageHash) => {
    this.setState({ isLoading: true });
    const gas = this.props.socialNetwork.methods.createPost(content, url, imageHash).estimateGas({ from : this.props.account });
    console.log("jhghjg",gas);
    this.props.socialNetwork.methods.createPost(content, url, imageHash).send({ from: this.props.account })
    .once('receipt', (receipt) => {
      console.log("receipt",receipt);
      this.setState({ isLoading: false, appple: 'apple' },() => console.log("C.",this.state));
    });
    this.setState({ isLoading: false });
  }

  tipAPost= (id, tipAmount)=>{
    this.setState({ isLoading: true });
    this.props.socialNetwork.methods.tipAPost(id).send({ from: this.props.account, value: tipAmount });
    this.setState({ isLoading: false });
  }

  async explorePosts(){
    const postCount = await this.props.socialNetwork.methods.postCount().call(); // this calls the method and returns the postCount
    //call methods just read data from blockchain, costs no gas
    //send methods writes data on blockchain, costs gas
    this.setState({ postCount });
    for(var i = 1; i <= postCount; i++){
      let post = await this.props.socialNetwork.methods.getPostFromPostId(i).call();
      this.setState({ isLoading: false, allPosts: [...this.state.allPosts, post ]});
    }
    this.setState({ isLoading: false });
  }

  // async getNetworkPosts(){
  //   const result = await this.state.socialNetwork.methods.getAllFollowingIds().call({from: this.state.account});
  //   this.setState({ myFollowingIds: result[0] ,myFollowerIds: result[1]});
  //   console.log("A:",this.state.myFollowingIds);
  //   for(let i = 0; i<this.state.myFollowingIds.length;i++){
  //     let posts = await this.state.socialNetwork.methods.getMyPosts(this.state.myFollowingIds[i]).call({from: this.state.account});
  //     console.log("PosA:",posts[1])
  //     this.setState({ followingPosts: [...this.state.followingPosts, posts[1]]});
  //   }
  //   for(let i = 0; i<this.state.myFollowerIds.length;i++){
  //     let posts = await this.state.socialNetwork.methods.getMyPosts(this.state.myFollowerIds[i]).call({from: this.state.account});
  //     console.log("PosB:",posts)
  //     this.setState({ followerPosts: [...this.state.followerPosts, posts[1]]});
  //   }
  // }

  fetchSearchKeyPosts = (searchKey) => {
    this.props.socialNetwork.methods.getPostsFromTag(searchKey).call()
    .then((result) => {
      console.log("TAGS",result);
      this.setState({ postSearchResult: result });
    })
  }

  fetchTickerExchangeData = () => {
    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR,INR")
    .then(res => res.json())
    .then( result => {
      const arr = [result.BTC + " BTC", result.USD + " USD", result.INR + " INR", result.EUR + " EUR"];
      this.setState({ tickerData: arr })
    })
  }

  render() {
    return (
        <div>
            <div>
              {this.state.tickerData.length !== 0 && // 👈 null and undefined check
              (<Ticker offset={15}>
                  {({ index }) => (
                      <>
                          <h1>{this.state.tickerData[index % (this.state.tickerData.length)]}&nbsp;&nbsp;&nbsp;&nbsp;</h1>
                      </>
                  )}
              </Ticker>)}
            </div>
            {this.state.isLoading ? 
              <Loader/> : 
                <div className="navTabContainer">
                    <Tabs defaultActiveKey="explore" id="uncontrolled-tab-example">
                      <Tab eventKey="explore" title="Explore">
                          <Card posts={this.state.allPosts} 
                            heading={"Explore"}
                            tipPost={this.tipAPost} 
                            createPost={this.createAPost}
                            socialNetwork={this.props.socialNetwork}
                            account={this.props.account}
                          />
                      </Tab>
                      <Tab eventKey="search" title="Search">
                          <Card posts={this.state.postSearchResult}  
                            heading={"Search"}
                            tipPost={this.tipAPost}
                            socialNetwork={this.props.socialNetwork}
                            account={this.props.account}
                            fetchSearchKeyPosts={this.fetchSearchKeyPosts}
                          />
                      </Tab>
                    </Tabs>               
                </div>}
        </div>
    );
  }
}

export default HomePage;
