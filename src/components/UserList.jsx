import React, { Component } from 'react';
import {Button, Modal, ListGroup} from 'react-bootstrap';
import Identicon from 'identicon.js';
import { getIpfsHashFromBytes32 } from './utils';

class UserList extends Component {

  constructor(props){
    super(props);
    this.state = {
      show: false,
      showProfileModal: false,
      isLoading: true,
      isLoadingProfileModal: true,
      idList: this.props.idList,
      totalUsersInfo: [],
      usersInfo: [],
      searchIsOn: false,
      viewingPosts: []
    }
    this.getUserData = this.getUserData.bind(this);
    this.getUserPosts = this.getUserPosts.bind(this);
  }

  componentDidMount(){
    this.getUserData();
  }

  async getUserData(){
    this.setState({ isLoading: true });
    for(let i = 0; i<this.state.idList.length;i++){
      let userInfo = await this.props.socialNetwork.methods.getUserData(this.state.idList[i]).call({from: this.props.account});
      this.setState({ totalUsersInfo: [...this.state.totalUsersInfo, userInfo]});
    }
    this.setState({ isLoading: false });
  }

  async getUserPosts(id){
    this.setState({ isLoadingProfileModal: true });
    let userPosts = await this.props.socialNetwork.methods.getMyPosts(id).call({from: this.props.account});    
    console.log("ViewingPosts:",userPosts);
    this.setState({ isLoadingProfileModal: false, viewingPosts: userPosts[1] });
  }

  handleClose = () => {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  }

  handleShowProfileModal = (id) => {
    this.setState({ showProfileModal: true });
    this.getUserPosts(id);
  }

  handleCloseProfileModal = () => {
    this.setState({ showProfileModal: false });
  }

  unFollowAuthor = (authorId) => {
    this.props.socialNetwork.methods.unFollowAuthor(authorId).send({ from: this.props.account })
    .once('receipt', (receipt) => {
      console.log("r:",receipt);
    });
    //notification for following
  }

  followAuthor = (authorId) => {
    this.props.socialNetwork.methods.followAuthor(authorId).send({ from: this.props.account })
    .once('receipt', (receipt) => {
      console.log("r:",receipt);
    });
    //notification for following
  }  

  filterNames = (searchIdName) => {
    let usersInfo = [];
    this.state.totalUsersInfo.map((userInfo,index) => {
      if (userInfo[1].includes(searchIdName) || window.web3.utils.hexToNumberString(userInfo[0]).includes(searchIdName)){
        usersInfo.push(userInfo);
      }
    });
    this.setState({ searchIsOn: true, usersInfo: usersInfo });
  }

  clearSearchResults = () => {    
    this.setState({ searchIsOn: false, usersInfo: [] });
  }   

  render() {
    //remove this and place this call in onClick of ListGroupItem
    let iterablePosts = this.state.searchIsOn ? this.state.usersInfo : this.state.totalUsersInfo;
   return (
      <div>
        <Button variant="primary" onClick={this.handleShow}>
          {`See ${this.props.heading} List`}
        </Button>

        <Modal
          show={this.state.show}
          onHide={this.handleClose}
          backdrop="static"
          keyboard={false}
          size={'xl'}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <div style={{display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                  {this.props.heading}
                <form style={{ width: '70%' }} onSubmit={(event) => {
                      event.preventDefault();
                    this.filterNames(this.searchIdName.value);
                  }}>
                  <div className="form-group mr-sm-2">
                    <input
                      id="searchIdName"
                      type="text"
                      ref={(input) => { this.searchIdName = input }}
                      className="form-control"
                      placeholder="Search for a id or name ?"
                      required />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button style={{ width: '50%' }} type="submit" onClick={this.clearSearchResults} variant="primary">Search</Button>
                    <Button type="reset" onClick={this.clearSearchResults} variant="danger">Clear Below Results</Button> 
                  </div>
                </form>
            </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup variant="flush">
              {this.state.isLoading ? "Loading ...." : iterablePosts.length === 0 ? `${this.props.heading} No one` :
              iterablePosts.map((userData,index) => (
                <ListGroup.Item key={`list-group-item-${index}`} onClick={() => console.log("Click")}
                  style={{ display: 'flex', justifyContent: 'space-around'}}>
                  <div>Id: {window.web3.utils.hexToNumber(userData[0])}</div>
                  <div>Name: {userData[1]}</div>
                  <div>Followers: {window.web3.utils.hexToNumber(userData[2])}</div>
                  <div>Following: {window.web3.utils.hexToNumberString(userData[3])}</div>
                  <div>Total Tip Obtained : {window.web3.utils.fromWei(userData[4].toString(), 'Ether')} ETH</div>
                  <div>Total Tip Donated  : {window.web3.utils.fromWei(userData[5].toString(), 'Ether')} ETH</div>
                  
                  <Button variant="primary" onClick={() => this.handleShowProfileModal(userData[0])}>
                    {`Open Profile`}
                  </Button>                  
                  {(this.props.heading === "Followers" && (this.props.followingIdStringList.length === 0 || this.props.followingIdStringList.indexOf(userData[0].toString()) === -1)) ?
                  (<button
                    className="btn btn-link btn-sm float-right pt-0"
                    name={`follow-${index}`}
                    onClick={(event) => {
                      console.log(event.target.name, "Following the author");
                      this.followAuthor(userData[0]);
                    }}
                  >
                    Follow Author
                  </button>):
                  (<button
                    className="btn btn-link btn-sm float-right pt-0"
                    name={`unfollow-${index}`}
                    onClick={(event) => {
                      console.log(event.target.name, "unFollowing the author");
                      this.unFollowAuthor(userData[0]);
                    }}
                  >
                    UnFollow Author
                  </button>)}
                </ListGroup.Item>))}
            </ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            {/* <Button variant="primary">Understood</Button> */}
          </Modal.Footer>
        </Modal>



        <Modal
          show={this.state.showProfileModal}
          onHide={this.handleCloseProfileModal}
          backdrop="static"
          keyboard={false}
          size={'xl'}
        >
          <Modal.Header closeButton>
            <Modal.Title>{this.props.heading}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup variant="flush">
              {this.state.isLoadingProfileModal ? "Loading ...." :
              (<div>Posts:
                {this.state.viewingPosts.map((post, index) => {
                  return(
                    <div className="card mb-4" key={index} >
                      <div className="card-header">
                        <img
                          className='mr-2'
                          width='30'
                          height='30'
                          alt={`identicon-${index}`}
                          src={`data:image/png;base64,${new Identicon(post.author, 30).toString()}`}
                        />
                        <small className="text-muted">{post.authorName} : {window.web3.utils.hexToNumber(post.authorId)}</small>
                      </div>
                      <ul id="postList" className="list-group list-group-flush">
                        <li className="list-group-item">
                          <p>{post.content}</p>
                        </li>
                        <li className="list-group-item">
                          <p>{post.url}</p>
                        </li>                        
                        {!!post.picIpfsHash && (<li className="list-group-item">
                          <img alt={index} width= "100%" height="100%" src={`https://ipfs.io/ipfs/${getIpfsHashFromBytes32(post.picIpfsHash)}`}></img>
                        </li>)}
                        <li key={index} className="list-group-item py-2">
                          <small className="float-left mt-1 text-muted">
                            TIPS: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')} ETH
                          </small>
                          <button
                            id={`button-modal-tipAmount${index}`}
                            className="btn btn-link btn-sm float-right pt-0"
                            name={post.pid}
                            onClick={(event) => {
                              const tip = document.getElementById(`modal-tipAmount${index}`).value;
                              if(document.getElementById(`modal-tipAmount${index}`).value){
                                let tipAmount = window.web3.utils.toWei(tip.toString(), 'Ether');
                                console.log(event.target.name, tipAmount);
                                this.props.tipPost(event.target.name, tipAmount);
                              }
                            }}
                          >
                            TIP Ether
                          </button>                        
                          <input
                              id={`modal-tipAmount${index}`}
                              type="number"
                              className="btn btn-link btn-sm float-right pt-0"
                              placeholder="Tip 0.1 Ether?"
                          />
                         {(this.props.followingIdStringList.length === 0 || this.props.followingIdStringList.indexOf(post.authorId.toString()) === -1) ?
                         ( <button
                            className="btn btn-link btn-sm float-right pt-0"
                            name={`follow-${post.pid}`}
                            onClick={(event) => {
                              console.log(event.target.name, "Following the author");
                              this.followAuthor(post.authorId);
                            }}
                          >
                            Follow Author
                          </button>)
                         :( <button
                            className="btn btn-link btn-sm float-right pt-0"
                            name={`follow-${post.pid}`}
                            onClick={(event) => {
                              console.log(event.target.name, "UnFollowing the author");
                              this.unFollowAuthor(post.authorId);
                            }}
                          >
                            UnFollow Author
                          </button>)}
                        </li>
                      </ul>
                    </div>
                  )
                })}
              </div>)}
            </ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleCloseProfileModal}>
              Close
            </Button>
            {/* <Button variant="primary">Understood</Button> */}
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default UserList;