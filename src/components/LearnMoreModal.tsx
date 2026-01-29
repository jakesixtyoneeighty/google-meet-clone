import React from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface LearnMoreModalProps {
    open: boolean;
    onClose: () => void;
}

const LearnMoreModal = ({ open, onClose }: LearnMoreModalProps) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            <div className="relative bg-nj-grey-900 border border-nj-grey-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-zoom-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-nj-grey-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <div className="p-8 space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">What this is</h2>
                        <div className="space-y-4 text-nj-grey-300 leading-relaxed">
                            <p>
                                Right now, this space is organized and hosted by Jake.
                                Streams and meetups are planned intentionally — music, tech, hangouts, conversations, and whatever makes sense in the moment.
                            </p>
                            <p>
                                Down the road, the door might open to others. Or it might not.
                                This isn’t a growth experiment or a promise. We’ll see how it goes.
                            </p>
                            <p>
                                Running this isn’t free, and it isn’t automated. It’s curated, on purpose.
                            </p>
                        </div>
                    </section>

                    <div className="h-px bg-nj-grey-800" />

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">About nudity & behavior</h2>
                        <div className="space-y-4 text-nj-grey-300 leading-relaxed">
                            <p>
                                You will see naked people here.
                                That’s not a joke, a gimmick, or an invitation.
                            </p>
                            <div className="bg-nj-red/10 border border-nj-red/20 rounded-lg p-4">
                                <p className="text-white font-medium mb-2">This is a non-sexual, body-normal space.</p>
                                <p>No flirting. No sexual comments. No creep behavior. No “testing boundaries.”</p>
                            </div>
                            <p>
                                There are plenty of other corners of the internet for that.
                                This is not one of them.
                            </p>
                            <p>
                                If you’re here, act like you’re in a room with real humans — because you are.
                            </p>
                        </div>
                    </section>

                    <div className="h-px bg-nj-grey-800" />

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Age & moderation</h2>
                        <div className="space-y-4 text-nj-grey-300 leading-relaxed">
                            <p>You must be of legal age to participate.</p>
                            <p>Moderation is simple and unapologetic:</p>
                            <p className="font-medium text-white">
                                If you’re a problem, you’re gone.
                                Bans are immediate and not up for debate.
                            </p>
                            <p>This space values comfort, respect, and trust over second chances.</p>
                        </div>
                    </section>

                    <div className="h-px bg-nj-grey-800" />

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">How to stay in the loop</h2>
                        <div className="space-y-4 text-nj-grey-300 leading-relaxed">
                            <p>
                                For meetup schedules, access codes, and updates, check out:{' '}
                                <a
                                    href="https://www.deviantart.com/sixtyoneeighty"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-nj-red hover:text-white transition-colors"
                                >
                                    deviantart.com/sixtyoneeighty
                                </a>
                            </p>
                            <p>
                                Or reach out directly:{' '}
                                <a
                                    href="mailto:nakedjake@sixtyoneeighty.net"
                                    className="text-nj-red hover:text-white transition-colors"
                                >
                                    nakedjake@sixtyoneeighty.net
                                </a>
                            </p>
                            <div className="pt-4 text-lg font-medium text-white">
                                <p>If it sounds like your kind of place, welcome.</p>
                                <p className="text-nj-grey-400">If it doesn’t, that’s okay too.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default LearnMoreModal;
