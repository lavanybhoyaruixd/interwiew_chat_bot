const logger = require('../utils/logger');

class DomainService {
  constructor() {
    this.domains = {
      'software-developer': {
        name: 'Software Developer',
        description: 'Full-stack development, programming languages, algorithms',
        categories: ['frontend', 'backend', 'full-stack', 'mobile', 'algorithms'],
        skills: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'Git'],
        interviewTypes: ['technical', 'coding', 'system-design', 'behavioral']
      },
      'web-developer': {
        name: 'Web Developer',
        description: 'Frontend, backend, and full-stack web development',
        categories: ['frontend', 'backend', 'full-stack', 'ui-ux'],
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular', 'Node.js'],
        interviewTypes: ['technical', 'coding', 'portfolio-review', 'behavioral']
      },
      'ui-ux-designer': {
        name: 'UI/UX Designer',
        description: 'User interface design, user experience, design thinking',
        categories: ['ui-design', 'ux-research', 'prototyping', 'design-systems'],
        skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Design Systems'],
        interviewTypes: ['portfolio-review', 'design-challenge', 'case-study', 'behavioral']
      },
      'data-scientist': {
        name: 'Data Scientist',
        description: 'Data analysis, machine learning, statistical modeling',
        categories: ['machine-learning', 'data-analysis', 'statistics', 'visualization'],
        skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'TensorFlow'],
        interviewTypes: ['technical', 'case-study', 'coding', 'behavioral']
      },
      'mobile-developer': {
        name: 'Mobile Developer',
        description: 'iOS, Android, and cross-platform mobile development',
        categories: ['ios', 'android', 'cross-platform', 'mobile-ui'],
        skills: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
        interviewTypes: ['technical', 'coding', 'app-review', 'behavioral']
      },
      'devops-engineer': {
        name: 'DevOps Engineer',
        description: 'Infrastructure, deployment, CI/CD, cloud technologies',
        categories: ['infrastructure', 'deployment', 'monitoring', 'automation'],
        skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'Linux', 'Git'],
        interviewTypes: ['technical', 'scenario-based', 'system-design', 'behavioral']
      },
      'product-manager': {
        name: 'Product Manager',
        description: 'Product strategy, roadmap planning, stakeholder management',
        categories: ['strategy', 'analytics', 'user-research', 'roadmap'],
        skills: ['Product Strategy', 'Analytics', 'User Research', 'Agile', 'Roadmapping'],
        interviewTypes: ['case-study', 'behavioral', 'product-sense', 'execution']
      },
      'cybersecurity': {
        name: 'Cybersecurity Specialist',
        description: 'Security analysis, threat detection, risk assessment',
        categories: ['network-security', 'application-security', 'incident-response'],
        skills: ['Network Security', 'Penetration Testing', 'Risk Assessment', 'SIEM', 'Compliance'],
        interviewTypes: ['technical', 'scenario-based', 'case-study', 'behavioral']
      }
    };
  }

  // Get all available domains
  getAllDomains() {
    return Object.entries(this.domains).map(([key, domain]) => ({
      id: key,
      name: domain.name,
      description: domain.description,
      skillCount: domain.skills.length,
      interviewTypes: domain.interviewTypes
    }));
  }

  // Get domain by ID
  getDomain(domainId) {
    return this.domains[domainId] || null;
  }

  // Get domain-specific interview context
  getDomainContext(domainId, userLevel = 'mid') {
    const domain = this.getDomain(domainId);
    if (!domain) return null;

    return {
      domain: domain.name,
      role: domain.name,
      skills: domain.skills,
      categories: domain.categories,
      interviewTypes: domain.interviewTypes,
      level: userLevel,
      context: `You are interviewing for a ${domain.name} position. Focus on ${domain.description}.`
    };
  }

  // Generate domain-specific system prompt
  generateSystemPrompt(domainId, userLevel = 'mid', companyType = 'tech-startup') {
    const domain = this.getDomain(domainId);
    if (!domain) return this.getDefaultSystemPrompt();

    const levelDescriptions = {
      'junior': 'entry-level candidate with 0-2 years of experience',
      'mid': 'mid-level candidate with 2-5 years of experience', 
      'senior': 'senior candidate with 5+ years of experience',
      'lead': 'lead/principal candidate with leadership experience'
    };

    const companyContexts = {
      'tech-startup': 'a fast-paced tech startup that values innovation and adaptability',
      'enterprise': 'a large enterprise company that values stability and best practices',
      'consulting': 'a consulting firm that values problem-solving and client interaction',
      'agency': 'a creative agency that values creativity and collaboration'
    };

    return `You are an experienced HR interviewer and ${domain.name} hiring manager at ${companyContexts[companyType] || companyContexts['tech-startup']}. 

ROLE CONTEXT:
- Position: ${domain.name}
- Candidate Level: ${levelDescriptions[userLevel] || levelDescriptions['mid']}
- Focus Areas: ${domain.description}
- Key Skills: ${domain.skills.slice(0, 5).join(', ')}

INTERVIEW GUIDELINES:
1. Act professionally but friendly, like a real HR interviewer
2. Ask relevant questions based on the candidate's level and domain
3. Provide constructive feedback and follow-up questions
4. Focus on both technical skills and behavioral aspects
5. Assess problem-solving ability and cultural fit
6. Give specific, actionable advice for improvement

QUESTION TYPES TO USE:
${domain.interviewTypes.map(type => `- ${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}`).join('\n')}

ASSESSMENT CRITERIA:
- Technical competency in ${domain.name} skills
- Problem-solving and analytical thinking
- Communication and collaboration skills
- Learning ability and adaptability
- Cultural fit and motivation

Start the conversation by welcoming the candidate and asking an appropriate opening question for a ${domain.name} position. Be encouraging while maintaining professional standards.`;
  }

  // Default system prompt for general interviews
  getDefaultSystemPrompt() {
    return `You are an experienced HR interviewer conducting a general interview. 

INTERVIEW GUIDELINES:
1. Act professionally but friendly, like a real HR interviewer
2. Ask relevant questions to assess the candidate's fit
3. Provide constructive feedback and follow-up questions
4. Focus on problem-solving, communication, and motivation
5. Give specific, actionable advice for improvement

Start by welcoming the candidate and asking about their background and interests.`;
  }

  // Get suggested questions for domain
  getSuggestedQuestions(domainId, userLevel = 'mid', count = 5) {
    const domain = this.getDomain(domainId);
    if (!domain) return [];

    const questionTemplates = {
      'software-developer': {
        junior: [
          "Tell me about a programming project you're proud of",
          "How do you approach debugging a complex issue?",
          "What's your experience with version control like Git?",
          "Describe how you would design a simple web application",
          "What motivates you to pursue software development?"
        ],
        mid: [
          "Walk me through how you would architect a scalable web application",
          "Tell me about a time you had to optimize application performance",
          "How do you stay updated with new technologies and frameworks?",
          "Describe your experience with database design and optimization",
          "How do you handle code reviews and team collaboration?"
        ],
        senior: [
          "How would you design a system to handle millions of users?",
          "Tell me about a time you led a technical decision that had significant impact",
          "How do you mentor junior developers?",
          "Describe your approach to technical debt management",
          "What's your strategy for evaluating and adopting new technologies?"
        ]
      },
      'ui-ux-designer': {
        junior: [
          "Walk me through your design process for a mobile app",
          "How do you ensure your designs are accessible?",
          "Tell me about a design challenge you recently solved",
          "What tools do you use for prototyping and why?",
          "How do you handle feedback and iteration in your designs?"
        ],
        mid: [
          "How do you conduct user research and incorporate findings?",
          "Tell me about a time you had to design for multiple platforms",
          "How do you collaborate with developers during implementation?",
          "Describe your approach to creating design systems",
          "How do you measure the success of your designs?"
        ],
        senior: [
          "How do you influence product strategy through design?",
          "Tell me about leading a design team or mentoring designers",
          "How do you balance user needs with business requirements?",
          "Describe your experience with design operations",
          "How do you establish design culture in an organization?"
        ]
      }
    };

    const questions = questionTemplates[domainId]?.[userLevel] || 
                     questionTemplates[domainId]?.['mid'] || 
                     this.getGeneralQuestions();

    return questions.slice(0, count);
  }

  // General questions fallback
  getGeneralQuestions() {
    return [
      "Tell me about yourself and your background",
      "What interests you about this position?",
      "Describe a challenging project you've worked on",
      "How do you handle working under pressure?",
      "Where do you see yourself in the next few years?"
    ];
  }

  // Get domain-specific follow-up questions
  getFollowUpQuestions(domainId, previousAnswer, context = {}) {
    const domain = this.getDomain(domainId);
    if (!domain) return [];

    // This could be enhanced with AI to generate dynamic follow-ups
    return [
      "Can you elaborate on the technical challenges you faced?",
      "How did you measure the success of this solution?",
      "What would you do differently if you had to do it again?",
      "How did you collaborate with team members on this?",
      "What did you learn from this experience?"
    ];
  }
}

module.exports = new DomainService();
