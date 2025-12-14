import React from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { ShieldCheck, FileText, AlertTriangle } from "lucide-react";

const TermsOfService = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-display font-bold mb-2">
            Terms <span className="gradient-text">of Service</span>
          </h1>
          <p className="text-muted-foreground">
            Please read these terms carefully before using our platform.
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
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using HostelHub, you agree to be bound by these
              Terms of Service and our Privacy Policy. If you disagree with any
              part of these terms, please do not use our platform.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">2. User Responsibilities</h2>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>You must provide accurate and complete information during registration.</li>
              <li>You are responsible for maintaining the confidentiality of your account.</li>
              <li>Any fraudulent activity may result in suspension or termination of your account.</li>
              <li>Use of the platform for illegal or abusive behavior is strictly prohibited.</li>
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">3. Payments and Refunds</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Payments are processed securely via Razorpay. Refunds, if
              applicable, will be handled as per our refund policy. HostelHub
              does not store any payment information on its servers.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">4. Limitation of Liability</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              HostelHub shall not be liable for any indirect, incidental, or
              consequential damages arising out of or in connection with your
              use of the platform, including but not limited to loss of data or
              profits.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">5. Changes to Terms</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Changes
              will be effective immediately upon posting. Continued use of the
              platform signifies your acceptance of the updated terms.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">6. Contact Us</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at{" "}
              <span className="text-primary font-medium">support@hostelhub.com</span>.
            </p>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
