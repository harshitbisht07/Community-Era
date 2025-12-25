const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'on-time', 'delayed', 'completed'],
    default: 'pending'
  },
  completedAt: Date
});

const projectTimelineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['road', 'water', 'electricity', 'sanitation', 'other'],
    required: true
  },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    city: String,
    area: String
  },
  milestones: [milestoneSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'planning'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expectedEndDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update milestone status based on deadline
milestoneSchema.pre('save', function(next) {
  if (this.deadline && !this.completedAt) {
    const now = new Date();
    if (now > this.deadline) {
      this.status = 'delayed';
    } else {
      this.status = 'pending';
    }
  }
  if (this.completedAt) {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('ProjectTimeline', projectTimelineSchema);

