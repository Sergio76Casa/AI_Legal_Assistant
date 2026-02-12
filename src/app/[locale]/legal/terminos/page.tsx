export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
            <div className="prose prose-emerald max-w-none text-gray-600">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Agreement to Terms</h2>
                <p>
                    These Terms and Conditions constitute a legally binding agreement made between you and AI Legal Assistant. By accessing the site, you agree to bound by these terms.
                </p>

                <h2>2. Nature of Services</h2>
                <p className="font-bold text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
                    DISCLAIMER: The AI Legal Assistant is an informational tool powered by artificial intelligence. It does NOT provide legal advice and does NOT replace a professional lawyer. All information should be verified by a qualified attorney.
                </p>

                <h2>3. Intellectual Property</h2>
                <p>
                    Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site are owned or controlled by us.
                </p>

                <h2>4. User Representations</h2>
                <p>
                    By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information.
                </p>
            </div>
        </div>
    );
}
