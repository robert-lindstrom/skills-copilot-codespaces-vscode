// Create web server
const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Store comments
const commentsByPostId = {};

// Get comments by post id
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// Create comment
app.post('/posts/:id/comments', async (req, res) => {
  // Generate random id
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;
  // Get comments for post id
  const comments = commentsByPostId[req.params.id] || [];
  // Add new comment
  comments.push({ id: commentId, content, status: 'pending' });
  // Update comments
  commentsByPostId[req.params.id] = comments;
  // Emit event
  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending',
    },
  });
  // Send response
  res.status(201).send(comments);
});

// Receive event
app.post('/events', async (req, res) => {
  console.log('Received Event', req.body.type);
  const { type, data } = req.body;
  // Update comments
  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;
    // Get comments for post id
    const comments = commentsByPostId[postId];
    // Find comment
    const comment = comments.find((comment) => comment.id === id);
    // Update comment
    comment.status = status;
    // Emit event
    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        postId,
        status,
        content,
      },
    });
  }
  // Send response
  res.send({});
});

// Listen on port
app.listen(4001, () => {
  console.log('Listening on 4001');
});