import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSend, FiMessageSquare, FiUser } from "react-icons/fi";
import { useAuthContext } from "../context/useAuthContext";

const CommentSection = ({ reportId, onAuthRequired }) => {
  const { user } = useAuthContext();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/comments/${reportId}`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await axios.post(`/api/comments/${reportId}`, {
        text: newComment,
      });

      // Add new comment to top of list
      setComments([res.data, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to post comment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
      <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FiMessageSquare className="text-blue-500" />
        Discussion ({comments.length})
      </h4>

      {/* Comment Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <FiSend size={16} />
            </button>
          </div>
        </form>
      ) : (
        <div
          onClick={onAuthRequired}
          className="cursor-pointer text-center py-4 bg-blue-50 hover:bg-blue-100 rounded-xl mb-4 text-sm text-blue-600 font-bold border border-blue-100 transition-colors"
        >
          Login to participate in the discussion
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500 mb-3 text-center">{error}</p>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <p className="text-xs text-gray-400 text-center">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center italic">
            No comments yet. Be the first to start the conversation!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 items-start">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  comment.user.role === "admin"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {comment.user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-2 inline-block max-w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold ${
                        comment.user.role === "admin"
                          ? "text-purple-700"
                          : "text-gray-900"
                      }`}
                    >
                      {comment.user.username}
                    </span>
                    {comment.user.role === "admin" && (
                      <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 rounded-full font-bold">
                        Admin
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-snug break-words">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
