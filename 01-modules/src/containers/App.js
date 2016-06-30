// Module imports to load in dependencies
// Uses both default & named imports
import React from 'react';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';

var App = React.createClass({
    propTypes: {
        url: React.PropTypes.string.isRequired,
        pollInterval: React.PropTypes.number
    },
    getDefaultProps: function() {
        return {
            pollInterval: 5000
        };
    },
    getInitialState: function() {
        return {
            comments: []
        };
    },
    componentDidMount: function() {
        this._loadCommentsFromServer();

        this._pollId = setInterval(this._loadCommentsFromServer, this.props.pollInterval);
    },
    componentWillUnmount: function() {
        clearInterval(this._pollId);
    },
    _loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(comments) {
                this.setState({comments: comments});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    _handleCommentSubmit: function(comment) {
        // Optimistically set an id on the new comment. It will be replaced by an
        // id generated by the server. In a production application you would likely
        // not use Date.now() for this and would have a more robust system in place.
        var newComment = comment;
        var comments = this.state.comments;
        var newComments;

        newComment.id = Date.now();

        newComments = comments.concat([comment]);
        this.setState({comments: newComments});

        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function(resComments) {
                this.setState({comments: resComments});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({comments: comments});
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        var comments = this.state.comments;

        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList comments={comments} />
                <CommentForm onCommentSubmit={this._handleCommentSubmit} />
            </div>
        );
    }
});

export default App;
