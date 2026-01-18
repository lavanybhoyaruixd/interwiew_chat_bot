import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const LegalPage = () => {
  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    const prevColor = document.body.style.color;
    document.body.style.backgroundColor = '#0b0f17';
    document.body.style.color = '#ffffff';
    return () => {
      document.body.style.backgroundColor = prevBg;
      document.body.style.color = prevColor;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0b0f17]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            HireMate
          </Link>
          <Link
            to="/"
            className="text-sm text-white/60 hover:text-white transition"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
        {/* Privacy Policy Section */}
        <section id="privacy" className="mb-16">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-white/70 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-white/80 leading-relaxed">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                We collect information that you provide directly to us, including your name, email address, 
                resume data, and any other information you choose to provide when using HireMate services.
              </p>
              <p className="mb-2"><strong className="text-white/90">Personal Information:</strong></p>
              <ul className="list-disc list-inside mb-3 space-y-1 ml-4">
                <li>Name, email address, phone number</li>
                <li>Professional information (work experience, education, skills)</li>
                <li>Resume/CV documents and portfolio links</li>
                <li>Account credentials and authentication data</li>
              </ul>
              <p className="mb-2"><strong className="text-white/90">Usage Information:</strong></p>
              <ul className="list-disc list-inside mb-3 space-y-1 ml-4">
                <li>Interview practice sessions and responses</li>
                <li>Chat history with AI assistants</li>
                <li>Performance metrics and analytics</li>
                <li>Device information, IP address, browser type</li>
                <li>Log data and usage statistics</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">
                We use the information we collect to provide, maintain, and improve our services, including 
                AI-powered interview preparation, resume analysis, and job matching features.
              </p>
              <p className="mb-2"><strong className="text-white/90">Specifically, we use your information to:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide personalized interview coaching and feedback</li>
                <li>Analyze resumes and match you with relevant job opportunities</li>
                <li>Generate AI-powered interview questions based on your profile</li>
                <li>Track your progress and provide performance insights</li>
                <li>Send you notifications about new features and updates</li>
                <li>Improve our algorithms and AI models</li>
                <li>Respond to your support requests and inquiries</li>
                <li>Detect and prevent fraud, abuse, and security incidents</li>
                <li>Comply with legal obligations and enforce our terms</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Data Security</h2>
              <p className="mb-3">
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p className="mb-2"><strong className="text-white/90">Our security measures include:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Industry-standard SSL/TLS encryption for data transmission</li>
                <li>Encrypted storage of sensitive information</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Secure authentication with JWT tokens</li>
                <li>Role-based access control and principle of least privilege</li>
                <li>Regular backups and disaster recovery procedures</li>
                <li>Employee training on data protection best practices</li>
              </ul>
              <p className="mt-3">
                While we strive to protect your data, no method of transmission over the internet is 100% secure. 
                We cannot guarantee absolute security but continuously work to maintain the highest standards.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Your Rights</h2>
              <p className="mb-3">
                You have the right to access, update, or delete your personal information at any time. 
                Contact us at contact.lavanyabhoyar@gmail.com for any privacy-related requests.
              </p>
              <p className="mb-2"><strong className="text-white/90">Under applicable data protection laws, you have the right to:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (right to be forgotten)</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
                <li><strong>Restriction:</strong> Request restriction of processing your data</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, please email us at contact.lavanyabhoyar@gmail.com. 
                We will respond to your request within 30 days.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">5. Data Sharing and Third Parties</h2>
              <p className="mb-3">
                We do not sell your personal information. We may share your information with trusted third-party 
                service providers who assist us in operating our platform.
              </p>
              <p className="mb-2"><strong className="text-white/90">We may share data with:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Cloud hosting providers (for infrastructure and storage)</li>
                <li>AI/ML service providers (for interview analysis and feedback)</li>
                <li>Analytics providers (to understand usage patterns)</li>
                <li>Payment processors (for subscription and payment handling)</li>
                <li>Email service providers (for communications)</li>
              </ul>
              <p className="mt-3">
                All third-party service providers are contractually obligated to protect your data and 
                use it only for the purposes we specify.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Cookies and Tracking Technologies</h2>
              <p className="mb-3">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and deliver personalized content.
              </p>
              <p className="mb-2"><strong className="text-white/90">Types of cookies we use:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Essential cookies:</strong> Required for basic site functionality</li>
                <li><strong>Performance cookies:</strong> Help us understand how you use our site</li>
                <li><strong>Functional cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics cookies:</strong> Track usage patterns and site performance</li>
              </ul>
              <p className="mt-3">
                You can control cookies through your browser settings. However, disabling certain cookies 
                may limit your ability to use some features of our platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and 
                fulfill the purposes outlined in this policy. When you delete your account, we will delete 
                or anonymize your personal data within 90 days, except where we're required to retain it 
                for legal, regulatory, or security purposes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">8. Children's Privacy</h2>
              <p>
                HireMate is not intended for users under 18 years of age. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a 
                child, please contact us immediately.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country 
                of residence. We ensure appropriate safeguards are in place to protect your data in 
                accordance with applicable data protection laws.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new policy on this page and updating the "Last updated" date. 
                Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </div>
        </section>

        {/* Terms of Service Section */}
        <section id="terms" className="mb-16">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-white/70 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-white/80 leading-relaxed">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p className="mb-3">
                By accessing and using HireMate, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and HireMate. By creating an 
                account or using our platform, you acknowledge that you have read, understood, and agree to be 
                bound by these Terms and our Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">2. Use of Services</h2>
              <p className="mb-3">
                You agree to use HireMate services only for lawful purposes and in accordance with these Terms. 
                You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              <p className="mb-2"><strong className="text-white/90">You agree NOT to:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any part of the platform</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use automated scripts or bots without permission</li>
                <li>Impersonate any person or entity</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Share your account credentials with others</li>
                <li>Reverse engineer or decompile any part of the service</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Account Registration and Security</h2>
              <p className="mb-3">
                To use certain features of HireMate, you must create an account. You are responsible for 
                maintaining the security of your account and for all activities that occur under your account.
              </p>
              <p className="mb-2"><strong className="text-white/90">Account Requirements:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You must provide accurate and complete information</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>You must keep your password secure and confidential</li>
                <li>You must notify us immediately of any unauthorized access</li>
                <li>One person may not maintain more than one account</li>
              </ul>
              <p className="mt-3">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage 
                in suspicious activity.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Intellectual Property</h2>
              <p className="mb-3">
                All content, features, and functionality of HireMate are owned by us and are protected by 
                international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="mb-2"><strong className="text-white/90">Our intellectual property includes:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Software code, algorithms, and AI models</li>
                <li>Website design, graphics, and user interface</li>
                <li>Brand names, logos, and trademarks</li>
                <li>Interview questions database and content library</li>
                <li>Documentation, guides, and tutorials</li>
              </ul>
              <p className="mt-3">
                You may not copy, modify, distribute, sell, or lease any part of our services without 
                explicit written permission. You may not use our trademarks or branding without authorization.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">5. User Content</h2>
              <p className="mb-3">
                You retain ownership of any content you submit to HireMate. By submitting content, you grant 
                us a license to use, modify, and display such content for the purpose of providing our services.
              </p>
              <p className="mb-2"><strong className="text-white/90">By uploading content, you:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Represent that you own or have rights to the content</li>
                <li>Grant us a worldwide, non-exclusive license to use your content</li>
                <li>Allow us to process your content with AI for analysis and feedback</li>
                <li>Agree that your content doesn't violate any laws or third-party rights</li>
                <li>Accept responsibility for any content you upload</li>
              </ul>
              <p className="mt-3">
                We reserve the right to remove any content that violates these Terms or is deemed 
                inappropriate at our sole discretion.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Payment and Subscriptions</h2>
              <p className="mb-3">
                Some features of HireMate may require payment. By subscribing to a paid plan, you agree 
                to pay all applicable fees.
              </p>
              <p className="mb-2"><strong className="text-white/90">Payment Terms:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All fees are in INR (Indian Rupees) unless otherwise stated</li>
                <li>Subscription fees are billed in advance on a recurring basis</li>
                <li>You can cancel your subscription at any time</li>
                <li>Refunds are provided according to our refund policy</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
                <li>Payment information is processed securely through third-party processors</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
              <p className="mb-3">
                HireMate is provided "as is" without warranties of any kind. We are not liable for any damages 
                arising from your use of our services.
              </p>
              <p className="mb-2"><strong className="text-white/90">To the maximum extent permitted by law:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>We do not guarantee specific interview or job placement outcomes</li>
                <li>We are not responsible for errors or interruptions in service</li>
                <li>We are not liable for data loss due to technical issues</li>
                <li>We do not warrant that the service will be error-free or secure</li>
                <li>Our total liability shall not exceed the amount you paid in the last 6 months</li>
              </ul>
              <p className="mt-3">
                Some jurisdictions do not allow limitation of liability, so some of these limitations 
                may not apply to you.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">8. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless HireMate, its officers, directors, employees, and 
                agents from any claims, damages, losses, or expenses arising from your use of the service, 
                violation of these Terms, or infringement of any third-party rights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">9. Termination</h2>
              <p className="mb-3">
                We reserve the right to terminate or suspend your account at any time for violation of these 
                Terms or for any other reason at our discretion.
              </p>
              <p className="mb-2"><strong className="text-white/90">Grounds for termination include:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or illegal activity</li>
                <li>Abusive behavior towards other users or staff</li>
                <li>Non-payment of fees</li>
                <li>Prolonged inactivity (at our discretion)</li>
              </ul>
              <p className="mt-3">
                Upon termination, your right to use the service will immediately cease. You may also 
                terminate your account at any time through your account settings.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">10. Dispute Resolution</h2>
              <p>
                Any disputes arising from these Terms shall be resolved through binding arbitration in 
                accordance with Indian law. The arbitration shall take place in Mumbai, India. You agree 
                to waive any right to a jury trial or class action lawsuit.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">11. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, 
                without regard to its conflict of law provisions. Any legal action must be brought in 
                the courts of Mumbai, Maharashtra, India.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">12. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. We will notify you of material changes via email 
                or through the platform. Your continued use of the service after changes take effect 
                constitutes acceptance of the modified Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">13. Contact and Support</h2>
              <p>
                For questions about these Terms or to report violations, please contact us at 
                contact.lavanyabhoyar@gmail.com. We aim to respond to all inquiries within 48 hours.
              </p>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="mb-16">
          <h1 className="text-4xl font-bold mb-6">Security</h1>
          <p className="text-white/70 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-white/80 leading-relaxed">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Data Encryption</h2>
              <p className="mb-3">
                We use industry-standard encryption protocols (SSL/TLS) to protect data transmission between 
                your device and our servers. All sensitive data is encrypted both in transit and at rest.
              </p>
              <p className="mb-2"><strong className="text-white/90">Encryption Standards:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>TLS 1.3 for all data transmitted over the network</li>
                <li>AES-256 encryption for data stored at rest</li>
                <li>Encrypted database connections and secure APIs</li>
                <li>Hashed and salted password storage using bcrypt</li>
                <li>End-to-end encryption for sensitive resume data</li>
              </ul>
              <p className="mt-3">
                We regularly update our encryption methods to stay ahead of emerging security threats and 
                maintain compliance with industry best practices.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">2. Authentication & Access Control</h2>
              <p className="mb-3">
                We implement secure authentication mechanisms including JWT tokens and secure session management. 
                Access to user data is strictly controlled and monitored.
              </p>
              <p className="mb-2"><strong className="text-white/90">Security Features:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Multi-factor authentication (MFA) available for enhanced security</li>
                <li>JWT tokens with short expiration times</li>
                <li>Secure session management with automatic timeout</li>
                <li>Role-based access control (RBAC) for internal systems</li>
                <li>IP whitelisting and rate limiting to prevent brute force attacks</li>
                <li>Account lockout after multiple failed login attempts</li>
                <li>Password complexity requirements and regular password rotation prompts</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Infrastructure Security</h2>
              <p className="mb-3">
                Our infrastructure is built on secure, industry-leading cloud platforms with multiple 
                layers of protection.
              </p>
              <p className="mb-2"><strong className="text-white/90">Infrastructure Protection:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Hosted on secure cloud providers with ISO 27001 certification</li>
                <li>DDoS protection and traffic filtering</li>
                <li>Firewall configuration and network segmentation</li>
                <li>Intrusion detection and prevention systems (IDS/IPS)</li>
                <li>Load balancing and redundancy for high availability</li>
                <li>Virtual Private Cloud (VPC) for isolated network environments</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Regular Security Audits</h2>
              <p className="mb-3">
                Our systems undergo regular security assessments and vulnerability testing to identify and 
                address potential security risks.
              </p>
              <p className="mb-2"><strong className="text-white/90">Audit Practices:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Quarterly security audits by third-party experts</li>
                <li>Automated vulnerability scanning on a weekly basis</li>
                <li>Penetration testing performed bi-annually</li>
                <li>Code reviews with security focus for all major releases</li>
                <li>Dependency scanning to detect vulnerable libraries</li>
                <li>Security compliance assessments (GDPR, ISO standards)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">5. Data Backup and Recovery</h2>
              <p className="mb-3">
                We maintain regular backups of your data to prevent data loss. Backups are stored securely 
                and can be restored in case of system failures.
              </p>
              <p className="mb-2"><strong className="text-white/90">Backup Strategy:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Automated daily backups of all user data</li>
                <li>Incremental backups every 6 hours</li>
                <li>Geo-redundant backup storage across multiple regions</li>
                <li>Encrypted backups with separate encryption keys</li>
                <li>30-day backup retention policy</li>
                <li>Regular backup restoration testing</li>
                <li>Disaster recovery plan with RTO (Recovery Time Objective) of 4 hours</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Application Security</h2>
              <p className="mb-3">
                We follow secure coding practices and implement multiple layers of application-level 
                security controls.
              </p>
              <p className="mb-2"><strong className="text-white/90">Application Safeguards:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Input validation and sanitization to prevent injection attacks</li>
                <li>Protection against Cross-Site Scripting (XSS)</li>
                <li>Cross-Site Request Forgery (CSRF) protection</li>
                <li>SQL injection prevention through parameterized queries</li>
                <li>Rate limiting to prevent API abuse</li>
                <li>Content Security Policy (CSP) headers</li>
                <li>Secure file upload with virus scanning</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Incident Response</h2>
              <p className="mb-3">
                In the event of a security breach, we have procedures in place to respond quickly, mitigate 
                damage, and notify affected users as required by law.
              </p>
              <p className="mb-2"><strong className="text-white/90">Incident Response Plan:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>24/7 security monitoring and alerting system</li>
                <li>Dedicated incident response team</li>
                <li>Immediate containment procedures to limit breach impact</li>
                <li>Forensic analysis to determine breach scope and cause</li>
                <li>User notification within 72 hours as required by GDPR</li>
                <li>Coordination with law enforcement when necessary</li>
                <li>Post-incident review and security improvements</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">8. Employee Security Training</h2>
              <p>
                All employees undergo regular security awareness training to ensure they understand 
                and follow best practices for protecting user data. Access to user data is granted 
                on a need-to-know basis only, and all access is logged and monitored.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">9. Third-Party Security</h2>
              <p className="mb-3">
                We carefully vet all third-party service providers and ensure they meet our security 
                standards. All third parties are required to sign data processing agreements and 
                comply with applicable security regulations.
              </p>
              <p className="mb-2"><strong className="text-white/90">Third-Party Requirements:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Security certifications (SOC 2, ISO 27001)</li>
                <li>Regular security audits and compliance reviews</li>
                <li>Data processing agreements (DPA) in place</li>
                <li>Minimum encryption and access control standards</li>
                <li>Incident notification procedures</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">10. Reporting Security Issues</h2>
              <p className="mb-3">
                If you discover a security vulnerability, please report it to us immediately at 
                contact.lavanyabhoyar@gmail.com. We appreciate responsible disclosure and will work with 
                you to address the issue promptly.
              </p>
              <p className="mb-2"><strong className="text-white/90">When reporting, please include:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Detailed description of the vulnerability</li>
                <li>Steps to reproduce the issue</li>
                <li>Potential impact assessment</li>
                <li>Any proof-of-concept code (if applicable)</li>
                <li>Your contact information for follow-up</li>
              </ul>
              <p className="mt-3">
                We commit to acknowledging security reports within 24 hours and providing a resolution 
                timeline within 72 hours. We may offer recognition or rewards for valid security findings 
                through our bug bounty program.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <div className="mt-12 p-6 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold mb-2">Questions?</h3>
          <p className="text-white/70">
            If you have any questions about our policies, please contact us at{' '}
            <a href="mailto:contact.lavanyabhoyar@gmail.com" className="text-indigo-400 hover:text-indigo-300">
              contact.lavanyabhoyar@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0b0f17] mt-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 text-center">
          <div className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} HireMate. All rights reserved.
          </div>
          <div className="text-xs text-white/40 mt-2">
            Designed & Developed with <span className="text-red-400">♥</span> by{' '}
            <span className="text-white/60 font-medium">Lavanya Bhoyar</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalPage;
