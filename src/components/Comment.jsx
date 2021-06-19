import React, { Component } from 'react';
import {Button, Modal, ListGroup} from 'react-bootstrap';
import Identicon from 'identicon.js';
import Profile from './Profile';

class Comment extends Component{
    constructor(props){
        super(props);
        this.state={
            showUserProfileModal: false,
            isLoadingProfileModal: true,
            viewingPosts: []
        }
        this.getUserInfo = this.getUserInfo.bind(this);
    }

    openUserProfileModal = () => {
        this.setState({ showUserProfileModal: true }, () => this.getUserInfo());
    }

    closeUserProfileModal = () => {
        this.setState({ showUserProfileModal: false });
    }

    async getUserInfo(){
        this.setState({ isLoadingProfileModal: true });
        const userInfo = await this.props.socialNetwork.methods.getUserData(this.props.commentData.authorId).call({from: this.props.account});
        // const userPosts = await this.props.socialNetwork.methods.getMyPosts(this.props.commentData.authorId).call({from: this.props.account});
        console.log("User Data:", userInfo);
        this.setState({ isLoadingProfileModal: false, userData: {
            id: userInfo[0],
            name: userInfo[1],
            followersCount: userInfo[2],
            followingCount: userInfo[3],
            tipObtained: userInfo[4],
            tipDonated: userInfo[5]
          }
        //   , viewingPosts: userPosts[1]
         });
    }
 
    render(){
        const {commentData} = this.props;
        return(
            <div>
                <div className="commentsContainer" key={this.props.index}>
                    <div style={{ width: '85%', display: 'flex', flexDirection: 'row' }}>
                        <div style={{ width: '25%',display: 'flex', flexDirection: 'row'}} onClick={this.openUserProfileModal}>
                            <img
                                className='mr-2'
                                width='30'
                                height='30'
                                alt={`identicon-${commentData.cid}`}
                                src={`data:image/png;base64,${new Identicon(commentData.author, 30).toString()}`}
                            />
                            <strong>{commentData.authorName}</strong>
                        </div>
                        <div style={{ maxWidth: '75%', overflowWrap: 'break-word'}}>
                            <div>{commentData.comment}</div>
                        </div>
                    </div>
                </div>
                <Modal
                    show={this.state.showUserProfileModal}
                    onHide={this.closeUserProfileModal}
                    backdrop="static"
                    keyboard={false}
                    size={'xl'}
                    >
                    <Modal.Header closeButton>
                        <Modal.Title>{commentData.authorName}</Modal.Title>
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
                        <Button variant="secondary" onClick={this.closeUserProfileModal}>
                           Close
                        </Button>
                    </Modal.Footer>
                    </Modal>
            </div>
        );
    }

}

export default Comment;