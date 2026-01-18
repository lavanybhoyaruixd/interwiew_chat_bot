const mongoose = require('mongoose');

const userPerformanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  averageScore: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  strengths: [String],
  weaknesses: [String],
  preferredRoles: [String],
  skills: [String],
  lastSessionAt: Date,
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

userPerformanceSchema.statics.updateFromSessions = async function(userId, sessions = []) {
  if (!sessions.length) {
    const existing = await this.findOne({ user: userId });
    return existing || this.create({ user: userId });
  }

  const totalSessions = sessions.length;
  const scored = sessions.filter(s => s.analytics && s.analytics.averageScore > 0);
  const averageScore = scored.length
    ? scored.reduce((sum, s) => sum + (s.analytics.averageScore || 0), 0) / scored.length
    : 0;

  const strengthsSet = new Set();
  const weaknessesSet = new Set();
  const roleSet = new Set();
  const skillSet = new Set();

  sessions.forEach(s => {
    (s.overallFeedback?.strengths || []).forEach(v => strengthsSet.add(v.toLowerCase()));
    (s.overallFeedback?.weaknesses || []).forEach(v => weaknessesSet.add(v.toLowerCase()));
    if (s.jobRole) roleSet.add(s.jobRole.toLowerCase());
    (s.resumeData?.skills || []).forEach(sk => skillSet.add(sk.toLowerCase()));
    (s.questions || []).forEach(q => {
      (q.aiAnalysis?.strengths || []).forEach(v => strengthsSet.add(v.toLowerCase()));
    });
  });

  const doc = await this.findOneAndUpdate(
    { user: userId },
    {
      averageScore: Math.round(averageScore * 100) / 100,
      totalSessions,
      strengths: Array.from(strengthsSet).slice(0, 25),
      weaknesses: Array.from(weaknessesSet).slice(0, 25),
      preferredRoles: Array.from(roleSet).slice(0, 25),
      skills: Array.from(skillSet).slice(0, 100),
      lastSessionAt: sessions[0].createdAt,
      updatedAt: new Date()
    },
    { new: true, upsert: true }
  );
  return doc;
};

module.exports = mongoose.model('UserPerformance', userPerformanceSchema);
