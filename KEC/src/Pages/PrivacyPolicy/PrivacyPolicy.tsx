import { Header, Footer } from "../../Routes";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
    return (
        <motion.div
            initial={{ y: "50vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100vh", opacity: 0 }}
            transition={{
                duration: 0.6,
                ease: "easeOut",
                opacity: { duration: 0.4 }
            }}
            className="font-sans w-full absolute top-0 left-0 min-h-screen flex flex-col justify-between bg-[#F0F0F0] z-[200]"
        >
            <Header />

            <div className="w-full border-t border-gray-200" />

            {/* Frame Wrapper matching Landing Page Border System */}
            <div className="w-[95%] max-w-[1440px] mx-auto border-x border-gray-200 flex-grow flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-start font-sans px-4 py-20 text-[#151619]">
                    {/* Inner Card from Snippet Styles */}
                    <div className="max-w-4xl w-full flex flex-col gap-10 text-left">

                        {/* Title Section */}
                        <header className="mb-4 text-center">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                                Privacy Policy
                            </h1>
                        </header>

                        {/* Effective Date & Intro */}
                        <section className="space-y-4">
                            <p className="text-base font-semibold text-gray-700 mb-4">
                                Effective Date: [Insert Date]
                            </p>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">
                                <span className="font-bold text-gray-900">KEC</span> respects your privacy and is committed to protecting the information you share with us. This Privacy Policy explains how we collect, use, and safeguard your data in connection with our design subscription service.
                            </p>
                        </section>

                        {/* 1. Information We Collect */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">We may collect the following types of information:</p>
                            <ul className="list-disc pl-5 space-y-2 text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070] marker:text-gray-500">
                                <li>
                                    <span className="font-bold text-gray-900">Personal information</span> such as your name, email address, and billing details when you subscribe to our service.
                                </li>
                                <li>
                                    <span className="font-bold text-gray-900">Project-related information</span> including design briefs, brand assets, and feedback that you share through our design portal.
                                </li>
                                <li>
                                    <span className="font-bold text-gray-900">Usage data</span> to understand how you interact with our site and improve the user experience.
                                </li>
                            </ul>
                        </section>

                        {/* 2. How We Use Your Information */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">We use your information to:</p>
                            <ul className="list-disc pl-5 space-y-2 text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070] marker:text-gray-500">
                                <li>Provide and manage your design subscription service</li>
                                <li>Communicate with you regarding requests, updates, and support</li>
                                <li>Improve and personalize your experience on our platform</li>
                                <li>Process payments and manage billing</li>
                                <li>Comply with legal and financial regulations</li>
                            </ul>
                        </section>

                        {/* 3. Data Sharing and Security */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">3. Data Sharing and Security</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">
                                We do <span className="font-bold text-gray-900">not</span> sell, rent, or share your personal information with third parties except:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070] marker:text-gray-500">
                                <li>When required by law</li>
                                <li>When necessary to deliver the service (e.g., payment processing providers)</li>
                                <li>To protect the rights and safety of our users and our business</li>
                            </ul>
                            <p className="text-base text-gray-600 leading-relaxed pt-2">
                                We implement industry-standard security measures to protect your data from unauthorized access.
                            </p>
                        </section>

                        {/* 4. Your Rights and Choices */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">4. Your Rights and Choices</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">You can:</p>
                            <ul className="list-disc pl-5 space-y-2 text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070] marker:text-gray-500">
                                <li>Update or correct your personal information</li>
                                <li>Cancel your subscription and request deletion of your data</li>
                                <li>Opt-out of non-essential communications at any time</li>
                            </ul>
                            <p className="text-base text-gray-600 leading-relaxed pt-2">
                                For any such request, please contact us at [your email here].
                            </p>
                        </section>

                        {/* 5. Changes to This Policy */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">5. Changes to This Policy</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">
                                We may update this Privacy Policy periodically. Changes will be reflected on this page with a new "Effective Date."
                            </p>
                        </section>

                        {/* 6. Contact */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">6. Contact</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">
                                If you have any questions about this Privacy Policy, feel free to reach out at: <br />
                                <a href="mailto:aarontwarimitswe@gmail.com" className="hover:underline text-gray-900 font-medium">aarontwarimitswe@gmail.com</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <div className="w-full border-t border-gray-200" />
            <Footer />
        </motion.div>
    );
};

export default PrivacyPolicy;
