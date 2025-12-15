import { Header, Footer } from "../../Routes";
import { motion } from "framer-motion";

const TermsOfService = () => {
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
                    {/* Inner Card from Snippet */}
                    <div className="max-w-4xl w-full flex flex-col gap-10 text-left">

                        {/* Title Section */}
                        <header className="mb-4 text-center">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                                Terms Of Service
                            </h1>
                        </header>

                        {/* Effective Date */}
                        <section className="space-y-4">
                            <p className="text-base font-semibold text-gray-700 mb-4">
                                Effective Date: [Insert Date]
                            </p>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">
                                By accessing or using Formix, you agree to be bound by the following Terms of Service. These terms govern your use of our design subscription service.
                            </p>
                        </section>

                        {/* 1. Service Overview */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">1. Service Overview</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">
                                Formix provides unlimited design services under a monthly subscription model. Clients can submit design requests, which are completed in order or concurrently depending on their subscription tier (Starter or Pro).
                            </p>
                        </section>

                        {/* 2. Subscriptions & Payments */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">2. Subscriptions & Payments</h2>
                            <ul className="list-disc pl-5 space-y-2 text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070] marker:text-gray-500">
                                <li>All payments are billed automatically on a monthly basis unless canceled or paused.</li>
                                <li>No refunds are issued once a payment is processed.</li>
                                <li>You may cancel or pause your subscription at any time from your account or by contacting us.</li>
                            </ul>
                        </section>

                        {/* 3. Deliverables */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">3. Deliverables</h2>
                            <ul className="list-disc pl-5 space-y-2 text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070] marker:text-gray-500">
                                <li>Most tasks are delivered within 2–3 business days.</li>
                                <li>Complex requests may take longer, and timelines may vary.</li>
                                <li>Design files will be provided in standard formats (Figma, PNG, SVG, etc.) as appropriate.</li>
                            </ul>
                        </section>

                        {/* 4. Client Responsibilities */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">4. Client Responsibilities</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">You agree to:</p>
                            <ul className="list-disc pl-5 space-y-2 text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070] marker:text-gray-500">
                                <li>Provide clear briefs and feedback in a timely manner</li>
                                <li>Ensure all submitted content (e.g. logos, text, brand assets) is owned by you or licensed for use</li>
                                <li>Use the deliverables in accordance with applicable laws</li>
                            </ul>
                        </section>

                        {/* 5. Intellectual Property */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">5. Intellectual Property</h2>
                            <ul className="list-disc pl-5 space-y-2 text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070] marker:text-gray-500">
                                <li>All final approved design files are yours to use commercially.</li>
                                <li>We reserve the right to showcase work in our portfolio or marketing materials unless otherwise agreed.</li>
                            </ul>
                        </section>

                        {/* 6. Account Termination */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">6. Account Termination</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">We reserve the right to terminate access to the service if:</p>
                            <ul className="list-disc pl-5 space-y-2 text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070] marker:text-gray-500">
                                <li>There is abuse, inappropriate conduct, or violation of these terms</li>
                                <li>There is failure to pay or unauthorized use of the service</li>
                            </ul>
                        </section>

                        {/* 7. Limitation of Liability */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">7. Limitation of Liability</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">
                                Formix is not liable for any indirect or consequential damages arising from the use of the service. The service is provided "as-is" without warranties of any kind.
                            </p>
                        </section>

                        {/* 8. Changes to Terms */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">8. Changes to Terms</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">
                                We may update these Terms of Service periodically. Updates will be reflected on this page with a new "Effective Date."
                            </p>
                        </section>

                        {/* 9. Contact */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">9. Contact</h2>
                            <p className="text-[1.1rem] font-medium tracking-[-0.035em] leading-[1.35em] text-[#707070]">
                                If you have any questions or concerns about these terms, please contact us at: <br />
                                <a href="mailto:designedbymarso@gmail.com" className="hover:underline text-gray-900 font-medium">designedbymarso@gmail.com</a>
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

export default TermsOfService;
