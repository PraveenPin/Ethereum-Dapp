import React, { Component } from 'react';
import {Button, Modal, ListGroup} from 'react-bootstrap';
import Identicon from 'identicon.js';
import Profile from './Profile';

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
    this.getUsersData = this.getUsersData.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
  }

  componentDidMount(){
    this.getUsersData();
  }

  async getUsersData(){
    this.setState({ isLoading: true });
    for(let i = 0; i<this.state.idList.length;i++){
      let userInfo = await this.props.socialNetwork.methods.getUserData(this.state.idList[i]).call({from: this.props.account});
      this.setState({ totalUsersInfo: [...this.state.totalUsersInfo, userInfo]});
    }
    this.setState({ isLoading: false });
  }

  async getUserInfo(id){
    this.setState({ isLoadingProfileModal: true });
    const userInfo = await this.props.socialNetwork.methods.getUserData(id).call({from: this.props.account});
    console.log("User Data:", userInfo);
    this.setState({ isLoadingProfileModal: false, userData: {
        id: userInfo[0],
        name: userInfo[1],
        followersCount: userInfo[2],
        followingCount: userInfo[3],
        tipObtained: userInfo[4],
        tipDonated: userInfo[5]
      }});
}

  handleClose = () => {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  }

  handleShowProfileModal = (id) => {
    this.setState({ showProfileModal: true });
    this.getUserInfo(id);
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
        <Button className="ModalButton" variant="primary" onClick={this.handleShow}>
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
            <ListGroup variant="flush" className="userList">
              {this.state.isLoading ? "Loading ...." : iterablePosts.length === 0 ? `${this.props.heading} No one` :
              iterablePosts.map((userData,index) => (
                <ListGroup.Item key={`list-group-item-${index}`} onClick={() => console.log("Click")}
                  className="otherProfileCard">
                  {/* <details> */}
                    <summary>
                      <div>
                        <h3>
                          <strong>{userData[1]}</strong>
                        </h3>
                      </div>
                    </summary>
                    <div>
                      <dl>
                        <div>
                          <dt>Id: </dt>
                          <dd>{window.web3.utils.hexToNumber(userData[0])}</dd>
                        </div>
                        <div>
                          <dt>Followers</dt>
                          <dd>{window.web3.utils.hexToNumber(userData[2])}</dd>
                        </div>

                        <div>
                          <dt>Following</dt>
                          <dd>{window.web3.utils.hexToNumberString(userData[3])}</dd>
                        </div>
                        <div>
                          <dt>Tip Obtained</dt>
                          <dd>{window.web3.utils.fromWei(userData[4].toString(), 'Ether')} ETH</dd>
                        </div>

                        <div>
                          <dt>Tip Donated </dt>
                          <dd>{window.web3.utils.fromWei(userData[5].toString(), 'Ether')} ETH</dd>
                        </div>
                      </dl>
                    </div>
                  {/* </details> */}
                  
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
              (<Profile 
                  account={this.props.account}
                  socialNetwork={this.props.socialNetwork} 
                  userData={this.state.userData}

                />)}
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