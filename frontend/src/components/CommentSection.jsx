import React from 'react';
import { User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const CommentSection = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-4 hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {comment.author?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="font-semibold text-gray-800">{comment.author}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(comment.date).toLocaleDateString()}</span>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default CommentSection;