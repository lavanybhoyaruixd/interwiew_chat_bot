class JobMatchingService {
  scoreJob(job, context) {
    const { skills = [], preferredRoles = [], strengths = [] } = context;
    const titleLower = job.title.toLowerCase();
    const roleMatch = preferredRoles.some(r => titleLower.includes(r)) ? 30 : 0;
    const jobTokens = (job.tags || []).map(t => t.toLowerCase());
    let skillHits = 0;
    skills.forEach(sk => { if (jobTokens.includes(sk)) skillHits++; });
    const skillScore = Math.min(skillHits * 5, 40);
    let strengthHits = 0;
    strengths.forEach(s => { if (titleLower.includes(s)) strengthHits++; });
    const strengthScore = Math.min(strengthHits * 3, 15);
    let freshness = 0;
    if (job.publicationDate) {
      const days = (Date.now() - new Date(job.publicationDate).getTime()) / 86400000;
      if (days < 7) freshness = 15; else if (days < 30) freshness = 5;
    }
    return roleMatch + skillScore + strengthScore + freshness;
  }
  rankJobs(jobs, context) {
    return jobs.map(j => ({ ...j, matchScore: this.scoreJob(j, context) }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}
module.exports = new JobMatchingService();
