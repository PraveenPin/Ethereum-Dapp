import React, { Component } from 'react';
import {Button, Modal, ListGroup} from 'react-bootstrap';
import Identicon from 'identicon.js';

class Comment extends Component{
    constructor(props){
        super(props);
        this.state={
            showUserProfileModal: false,
            isLoadingProfileModal: true,
            viewingPosts: []
        }
        this.getUserPosts = this.getUserPosts.bind(this);
    }

    openUserProfileModal = () => {
        this.setState({ showUserProfileModal: true }, () => this.getUserPosts());
    }

    closeUserProfileModal = () => {
        this.setState({ showUserProfileModal: false });
    }

    async getUserPosts(){
        this.setState({ isLoadingProfileModal: true });
        let userPosts = await this.props.socialNetwork.methods.getMyPosts(this.props.commentData.authorId).call({from: this.props.account});    
        console.log("ViewingPosts:",userPosts);
        this.setState({ isLoadingProfileModal: false, viewingPosts: userPosts[1] });
    }
 
    render(){
        const {commentData} = this.props;
        return(
            <div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row'}} key={this.props.index}>
                    <div style={{ width: '85%', display: 'flex', flexDirection: 'row' }}>
                        <div style={{ width: '15%',display: 'flex', flexDirection: 'row'}} onClick={this.openUserProfileModal}>
                            <img
                                className='mr-2'
                                width='30'
                                height='30'
                                alt={`identicon-${commentData.cid}`}
                                src={`data:image/png;base64,${new Identicon(commentData.author, 30).toString()}`}
                            />
                            <div>{commentData.authorName}</div>
                        </div>
                        <div style={{ maxWidth: '85%', overflowWrap: 'break-word'}}>
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
                                        disabled={this.props.account.localeCompare(post.author) === 0}
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