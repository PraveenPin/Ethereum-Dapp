import React, { Component } from 'react';
import {Button, Modal, ListGroup} from 'react-bootstrap';
import Identicon from 'identicon.js';

class UserList extends Component {

  constructor(props){
    super(props);
    this.state = {
      show: false,
      showProfileModal: false,
      isLoading: true,
      isLoadingProfileModal: true,
      idList: this.props.idList,
      usersInfo: [],
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
      this.setState({ usersInfo: [...this.state.usersInfo, userInfo]});
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
    console.log("Account:",this.props.account);
    this.props.socialNetwork.methods.unfollowAuthor(authorId).send({ from: this.props.account })
    .once('receipt', (receipt) => {
      console.log("r:",receipt);
    });
    //notification for following
  }

  render() {
    //remove this and place this call in onClick of ListGroupItem
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
            <Modal.Title>{this.props.heading}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup variant="flush">
              {this.state.isLoading ? "Loading ...." :
              this.state.usersInfo.map((userData,index) => (
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
                  <Button variant="primary">
                    {`UnFollow`}
                  </Button>
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
                          src={`data:image/png;base64,${new Identicon(post.author, 30).toString()}`}
                        />
                        <small className="text-muted">{post.author}:{window.web3.utils.hexToNumber(post.authorId)}</small>
                      </div>
                      <ul id="postList" className="list-group list-group-flush">
                        <li className="list-group-item">
                          <p>{post.content}</p>
                        </li>
                        <li className="list-group-item">
                          <p>{post.url}</p>
                        </li>
                        <li key={index} className="list-group-item py-2">
                          <small className="float-left mt-1 text-muted">
                            TIPS: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')} ETH
                          </small>
                          <button
                            className="btn btn-link btn-sm float-right pt-0"
                            name={post.pid}
                            onClick={(event) => {
                              let tipAmount = window.web3.utils.toWei('0.1', 'Ether');
                              console.log(event.target.name, tipAmount);
                              this.props.tipPost(event.target.name, tipAmount);
                            }}
                          >
                            TIP 0.1 ETH
                          </button>
                          <button
                            className="btn btn-link btn-sm float-right pt-0"
                            name={`follow-${post.pid}`}
                            onClick={(event) => {
                              console.log(event.target.name, "Following the author");
                              this.unFollowAuthor(post.authorId);
                            }}
                          >
                            UnFollow Author
                          </button>
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