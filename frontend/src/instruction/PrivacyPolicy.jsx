import React from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Shield, Lock, FileText, Eye } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-display font-bold mb-2">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-muted-foreground">
            Learn how we collect, use, and protect your personal information.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We collect personal information such as your name, email address,
              phone number, and payment details when you register, make a booking,
              or interact with our platform. We also collect non-personal data like
              browser type, IP address, and cookies for improving user experience.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>To process bookings and payments securely.</li>
              <li>To personalize your experience on HostelHub.</li>
              <li>To communicate updates, promotions, or support messages.</li>
              <li>To improve the platform’s security and performance.</li>
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">3. Data Protection</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We implement strict security measures to protect your personal data
              from unauthorized access, alteration, or disclosure. All payment
              transactions are encrypted and processed through trusted gateways
              like Razorpay.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">4. Sharing of Information</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell or rent your personal data. Information may be shared
              with trusted third parties only for essential operations like
              payment processing or hosting services — all bound by confidentiality
              agreements.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">5. Your Rights</h2>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>You can request access, update, or deletion of your personal data.</li>
              <li>You can opt out of marketing emails anytime.</li>
              <li>We comply with applicable data protection laws and regulations.</li>
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">6. Policy Updates</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated revision date. Please
              review it periodically to stay informed.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">7. Contact Us</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about our Privacy Policy or data handling
              practices, please contact us at{" "}
              <span className="text-primary font-medium">
                privacy@hostelhub.com
              </span>.
            </p>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
