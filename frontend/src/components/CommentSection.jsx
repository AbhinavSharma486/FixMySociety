import React from 'react';

const CommentSection = ({ comments }) => (
  <div className="space-y-4 mb-6">
    {comments.map(comment => (
      <div key={comment.id} className="bg-base-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{comment.author}</span>
          <span className="text-sm text-base-content/70">{new Date(comment.date).toLocaleDateString()}</span>
        </div>
        <p className="text-base-content/80">{comment.text}</p>
      </div>
    ))}
  </div>
);

export default CommentSection;