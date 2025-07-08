import React, { useState } from 'react';

export default function Legal() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#7E41FF]">
                Legal Information
              </span>
            </h1>
            <p className="text-[#F2F2F2]/80 text-lg max-w-2xl mx-auto">
              Our commitment to transparency and protecting your rights
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-10">
            <div className="backdrop-blur-md bg-[#0E0E10]/40 rounded-lg border border-[#FFFFFF]/10 flex overflow-hidden">
              <button
                onClick={() => setActiveTab('terms')}
                className={`px-6 py-3 text-lg font-medium transition-all duration-300 ${
                  activeTab === 'terms'
                    ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-b-2 border-[#00F0FF]'
                    : 'text-[#F2F2F2]/70 hover:text-[#00F0FF]/80'
                }`}
              >
                Terms of Service
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`px-6 py-3 text-lg font-medium transition-all duration-300 ${
                  activeTab === 'privacy'
                    ? 'bg-[#7E41FF]/10 text-[#7E41FF] border-b-2 border-[#7E41FF]'
                    : 'text-[#F2F2F2]/70 hover:text-[#7E41FF]/80'
                }`}
              >
                Privacy Policy
              </button>
            </div>
          </div>
          
          {/* Content Container */}
          <div className="backdrop-blur-md bg-[#0E0E10]/40 rounded-xl border border-[#FFFFFF]/10 shadow-[0_0_15px_rgba(0,0,0,0.2)] overflow-hidden relative p-8">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-28 h-28">
              <div className="absolute top-0 left-0 w-[2px] h-16 bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.6)]"></div>
              <div className="absolute top-0 left-0 w-16 h-[2px] bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.6)]"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-28 h-28">
              <div className="absolute bottom-0 right-0 w-[2px] h-16 bg-[#7E41FF] shadow-[0_0_8px_rgba(126,65,255,0.6)]"></div>
              <div className="absolute bottom-0 right-0 w-16 h-[2px] bg-[#7E41FF] shadow-[0_0_8px_rgba(126,65,255,0.6)]"></div>
            </div>
            
            {/* Terms of Service */}
            {activeTab === 'terms' && (
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold mb-6 text-[#00F0FF]">
                  Terms of Service
                </h2>
                <p className="text-[#F2F2F2]/80 mb-6">
                  <strong>Effective Date:</strong> {currentDate}
                </p>
                <p className="text-[#F2F2F2]/80 mb-6">
                  Welcome to LIQIFY. By accessing or using our website and services, you agree to be bound by the following Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-white">1. Use of Services</h3>
                <ul className="space-y-2 text-[#F2F2F2]/80 mb-6">
                  <li>You must be at least 18 years old or the age of majority in your jurisdiction.</li>
                  <li>You agree to use the services for lawful purposes only.</li>
                  <li>You are responsible for maintaining the security of your account and wallet.</li>
                </ul>
                
                <h3 className="text-xl font-bold mb-3 text-white">2. Decentralized Nature</h3>
                <ul className="space-y-2 text-[#F2F2F2]/80 mb-6">
                  <li>LIQIFY is a decentralized application and does not hold or control user funds.</li>
                  <li>Users interact with smart contracts at their own risk.</li>
                </ul>
                
                <h3 className="text-xl font-bold mb-3 text-white">3. No Financial Advice</h3>
                <ul className="space-y-2 text-[#F2F2F2]/80 mb-6">
                  <li>LIQIFY does not offer investment advice.</li>
                  <li>All trades and decisions are your own responsibility.</li>
                </ul>
                
                <h3 className="text-xl font-bold mb-3 text-white">4. Prohibited Activities</h3>
                <p className="text-[#F2F2F2]/80 mb-3">You may not:</p>
                <ul className="space-y-2 text-[#F2F2F2]/80 mb-6">
                  <li>Use bots or automation to exploit the platform.</li>
                  <li>Attempt to reverse engineer or interfere with our services.</li>
                  <li>Upload or transmit harmful or illegal content.</li>
                </ul>
                
                <h3 className="text-xl font-bold mb-3 text-white">5. Intellectual Property</h3>
                <ul className="space-y-2 text-[#F2F2F2]/80 mb-6">
                  <li>All content, branding, and designs are owned by LIQIFY.</li>
                  <li>You may not use any content without our prior written permission.</li>
                </ul>
                
                <h3 className="text-xl font-bold mb-3 text-white">6. Limitation of Liability</h3>
                <ul className="space-y-2 text-[#F2F2F2]/80 mb-6">
                  <li>LIQIFY is provided "as is" without warranties of any kind.</li>
                  <li>We are not liable for any losses or damages resulting from the use of our services.</li>
                </ul>
                
                <h3 className="text-xl font-bold mb-3 text-white">7. Modifications</h3>
                <p className="text-[#F2F2F2]/80 mb-6">
                  We may update these Terms of Service at any time. Continued use means you accept the changes.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-white">8. Contact</h3>
                <p className="text-[#F2F2F2]/80 mb-6">
                  For questions, contact us at: <a href="mailto:support@liqify.xyz" className="text-[#00F0FF] hover:underline">support@liqify.xyz</a>
                </p>
              </div>
            )}
            
            {/* Privacy Policy */}
            {activeTab === 'privacy' && (
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold mb-6 text-[#7E41FF]">
                  Privacy Policy
                </h2>
                <p className="text-[#F2F2F2]/80 mb-6">
                  <strong>Effective Date:</strong> {currentDate}
                </p>
                <p className="text-[#F2F2F2]/80 mb-6">
                  Your privacy is important to us. This Privacy Policy explains what information we collect, how we use it, and your rights.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-white">1. Information We Collect</h3>
                <p className="text-[#F2F2F2]/80 mb-3">
                  We do not collect personal data unless you provide it voluntarily (e.g., via a contact form or support request).
                </p>
                <p className="text-[#F2F2F2]/80 mb-3">We may collect:</p>
                <ul className="space-y-2 text-[#F2F2F2]/80 mb-6">
                  <li>Public wallet addresses</li>
                  <li>Device and browser information (for analytics)</li>
                  <li>IP address (for security and analytics)</li>
                </ul>
                
                <h3 className="text-xl font-bold mb-3 text-white">2. How We Use Information</h3>
                <ul className="space-y-2 text-[#F2F2F2]/80 mb-6">
                  <li>To provide and improve our services</li>
                  <li>To detect fraud or abuse</li>
                  <li>To communicate with users (when applicable)</li>
                </ul>
                
                <h3 className="text-xl font-bold mb-3 text-white">3. Cookies</h3>
                <p className="text-[#F2F2F2]/80 mb-3">We may use cookies or local storage to:</p>
                <ul className="space-y-2 text-[#F2F2F2]/80 mb-6">
                  <li>Remember preferences</li>
                  <li>Measure usage analytics (e.g., Google Analytics)</li>
                </ul>
                
                <h3 className="text-xl font-bold mb-3 text-white">4. Third-Party Services</h3>
                <p className="text-[#F2F2F2]/80 mb-3">We may use third-party services like:</p>
                <ul className="space-y-2 text-[#F2F2F2]/80 mb-6">
                  <li>Analytics providers (e.g., Google Analytics)</li>
                  <li>Wallet providers (e.g., MetaMask, WalletConnect)</li>
                </ul>
                <p className="text-[#F2F2F2]/80 mb-6">
                  These third parties may collect data subject to their own privacy policies.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-white">5. Data Security</h3>
                <p className="text-[#F2F2F2]/80 mb-6">
                  We implement reasonable security measures but cannot guarantee 100% protection.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-white">6. Your Rights</h3>
                <p className="text-[#F2F2F2]/80 mb-3">You may request:</p>
                <ul className="space-y-2 text-[#F2F2F2]/80 mb-6">
                  <li>Access to data we hold about you</li>
                  <li>Deletion of your data (where applicable)</li>
                </ul>
                <p className="text-[#F2F2F2]/80 mb-6">
                  Email <a href="mailto:privacy@liqify.xyz" className="text-[#7E41FF] hover:underline">privacy@liqify.xyz</a> for any data-related requests.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-white">7. Changes to This Policy</h3>
                <p className="text-[#F2F2F2]/80 mb-6">
                  We may update this Privacy Policy. Changes will be posted on this page with an updated date.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
