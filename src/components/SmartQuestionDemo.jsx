import React, { useState } from 'react';

const SmartQuestionDemo = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Static questions and answers data
  const questionData = {
    'Software Engineer': [
      {
        question: "Explain the difference between REST and GraphQL APIs.",
        answer: "REST APIs follow a resource-based architecture where each endpoint represents a specific resource. GraphQL uses a single endpoint and allows clients to request exactly the data they need, reducing over-fetching and under-fetching. REST typically returns fixed data structures, while GraphQL gives clients control over the response structure."
      },
      {
        question: "How do you handle state management in a React application?",
        answer: "For simple applications, I use React's built-in useState and useContext hooks. For complex applications, I prefer Redux Toolkit for predictable state updates, or Zustand for a simpler alternative. I also consider server state management with React Query for API data."
      },
      {
        question: "Describe your approach to debugging a complex issue.",
        answer: "I start by reproducing the issue consistently, then isolate the problem by checking logs and adding debugging statements. I use breakpoints in the browser dev tools or IDE. I also check for common issues like race conditions, null/undefined values, or API failures. Finally, I write a test to prevent regression."
      }
    ],
    'Data Scientist': [
      {
        question: "Explain the bias-variance tradeoff in machine learning.",
        answer: "Bias is the error from incorrect assumptions in the learning algorithm. High bias leads to underfitting. Variance is the error from sensitivity to small fluctuations in the training set. High variance leads to overfitting. The tradeoff is finding the sweet spot where both are minimized for optimal model performance."
      },
      {
        question: "How do you handle missing data in a dataset?",
        answer: "I first assess the pattern of missingness (MCAR, MAR, MNAR). For small amounts of missing data, I might use listwise deletion. For numerical data, I could use mean/median imputation or more advanced methods like KNN imputation. For categorical data, mode imputation or predictive modeling works well."
      },
      {
        question: "Walk me through your model evaluation process.",
        answer: "I start with train/validation/test splits, then evaluate using appropriate metrics (accuracy, precision, recall, F1 for classification; MSE, MAE, R² for regression). I check for overfitting with learning curves and cross-validation. I also perform error analysis to understand model weaknesses and iterate on improvements."
      }
    ],
    'Product Manager': [
      {
        question: "How do you prioritize features for a new product?",
        answer: "I use frameworks like RICE (Reach, Impact, Confidence, Effort) or Kano model. I consider user needs, business value, technical feasibility, and competitive landscape. I also gather input from stakeholders and validate assumptions with user research. The goal is to deliver maximum value with available resources."
      },
      {
        question: "Describe a time when you had to say no to a feature request.",
        answer: "I explained the opportunity cost and how pursuing this feature would delay more impactful initiatives. I provided data showing current priorities and their expected ROI. I offered alternatives like a simplified version or future roadmap inclusion. This maintained trust while keeping the team focused."
      },
      {
        question: "How do you measure product success?",
        answer: "I define clear KPIs aligned with business goals: user acquisition, retention, engagement metrics, revenue, and customer satisfaction. I use cohort analysis, A/B testing, and user feedback. I also track leading indicators and regularly review metrics to ensure we're moving toward our north star goals."
      }
    ],
    'UI/UX Designer': [
      {
        question: "How do you approach user research for a new product?",
        answer: "I start with stakeholder interviews to understand business goals, then conduct user interviews and surveys to identify pain points. I create user personas and journey maps. I also analyze competitor products and conduct usability testing. This ensures designs solve real user problems."
      },
      {
        question: "Explain your design process from concept to delivery.",
        answer: "I begin with research and problem definition, then create wireframes and low-fidelity prototypes for validation. After user testing and iteration, I develop high-fidelity designs with proper design systems. I collaborate with developers for implementation and conduct final usability testing before launch."
      },
      {
        question: "How do you handle conflicting feedback from stakeholders?",
        answer: "I seek to understand the underlying goals behind each opinion. I use data from user research to guide decisions and create multiple options showing trade-offs. I facilitate workshops to align on priorities and use design principles to justify recommendations. Clear communication of rationale helps reach consensus."
      }
    ],
    'DevOps Engineer': [
      {
        question: "How do you ensure system reliability and uptime?",
        answer: "I implement monitoring and alerting systems, automate deployment pipelines, and use blue-green or canary deployments for zero-downtime releases. I establish SLAs and error budgets, implement chaos engineering practices, and maintain comprehensive backup and disaster recovery procedures."
      },
      {
        question: "Explain your approach to infrastructure as code.",
        answer: "I use tools like Terraform or CloudFormation to define infrastructure declaratively. This ensures consistency, version control, and repeatability across environments. I follow immutable infrastructure principles, implement automated testing, and use modules for reusability."
      },
      {
        question: "How do you handle a critical production incident?",
        answer: "I follow an incident response process: assess impact, communicate with stakeholders, contain the issue, investigate root cause, implement fix, and conduct post-mortem. I focus on learning and preventing recurrence through improved monitoring, automation, or process changes."
      }
    ]
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSelectedQuestion(null);
  };

  const QuestionIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const AnswerIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-[Space_Grotesk]">
            Smart Question <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Generation</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto font-[Inter]">
            AI crafts tailored questions from your resume and job role for realistic practice.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Role Selection */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-[#18181b]/90 to-[#1a1a1f]/90 border border-[#23272f] shadow-2xl p-8 glassmorphism">
              <h3 className="text-2xl font-bold text-white mb-6 font-[Space_Grotesk]">Select Your Role</h3>

              <div className="space-y-3">
                {Object.keys(questionData).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`w-full p-4 rounded-xl border transition-all duration-300 text-left font-[Inter] ${
                      selectedRole === role
                        ? 'bg-purple-600/20 border-purple-400 text-purple-300 shadow-lg shadow-purple-500/20'
                        : 'bg-[#23272f]/50 border-[#404040] text-white/80 hover:bg-[#23272f]/70 hover:border-[#505050]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{role}</span>
                      <svg
                        className={`w-5 h-5 transition-transform duration-300 ${
                          selectedRole === role ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Questions */}
          <div className="space-y-6">
            {selectedRole ? (
              <div className="rounded-3xl bg-gradient-to-br from-[#18181b]/90 to-[#1a1a1f]/90 border border-[#23272f] shadow-2xl p-8 glassmorphism">
                <h3 className="text-2xl font-bold text-white mb-6 font-[Space_Grotesk] flex items-center gap-2">
                  <QuestionIcon />
                  {selectedRole} Questions
                </h3>

                <div className="space-y-4">
                  {questionData[selectedRole].map((item, index) => (
                    <div key={index} className="space-y-3">
                      <button
                        onClick={() => setSelectedQuestion(selectedQuestion === index ? null : index)}
                        className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                          selectedQuestion === index
                            ? 'bg-cyan-600/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                            : 'bg-[#23272f]/50 border-[#404040] text-white/80 hover:bg-[#23272f]/70 hover:border-[#505050]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                            {index + 1}
                          </span>
                          <span className="font-[Inter] leading-relaxed">{item.question}</span>
                        </div>
                      </button>

                      {selectedQuestion === index && (
                        <div className="ml-9 p-4 rounded-xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-400/30 text-emerald-200 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-start gap-3">
                            <AnswerIcon />
                            <div className="font-[Inter] leading-relaxed">
                              <div className="font-semibold text-emerald-300 mb-2">Sample Answer:</div>
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-gradient-to-br from-[#18181b]/90 to-[#1a1a1f]/90 border border-[#23272f] shadow-2xl p-8 glassmorphism flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <QuestionIcon />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2 font-[Space_Grotesk]">Select a Role</h4>
                  <p className="text-white/60 font-[Inter]">Choose a job role above to see sample interview questions and answers</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => window.location.href = '/smart-questions'}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Try Full AI Question Generation
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SmartQuestionDemo;