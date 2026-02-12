import { useTranslations } from "next-intl";

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <div className="prose prose-emerald max-w-none text-gray-600">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>
                    At AI Legal Assistant, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website.
                </p>
                <h2>1. Information We Collect</h2>
                <p>
                    We may collect personal identification information (Name, email address, etc.) and data related to your documents uploaded for analysis.
                </p>
                <h2>2. How We Use Your Information</h2>
                <p>
                    We use the information we collect to operate and maintain our Service, improve your experience, and respond to your inquiries.
                </p>
                <h2>3. Data Security</h2>
                <p>
                    We implement appropriate technical and organizational security measures to protect your data. Documents are stored securely and are not shared with third parties without your consent.
                </p>
                <p className="italic mt-8">
                    This is a placeholder policy. Please consult with a legal professional to create a comprehensive privacy policy compliant with GDPR and local laws.
                </p>
            </div>
        </div>
    );
}
