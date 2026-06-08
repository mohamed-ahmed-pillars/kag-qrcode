"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    Figma,
    MonitorIcon,
    SendIcon,
    Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import Image from "next/image";
import { getIcon, ICON_IMAGE_MAP } from "@/lib/icons";
import { Typewriter } from "@/components/ui/typewriter";
import { GradientAlert } from "@/components/ui/alert";

export interface SocialLink {
    id: string;
    label: string;
    url: string;
    iconName: string | null;
}

const SUGGESTED_PROMPTS: string[] = [
    "What products and services does KAG provide?",
    "How can I reach customer service?",
    "Where are your offices located?",
    "How do I request a quote?",
];

const SOCIAL_COLORS: Record<string, string> = {
    instagram: "#e1306c",
    facebook: "#1877f2",
    twitter: "#1da1f2",
    whatsapp: "#25d366",
    "message-circle": "#25d366",
    globe: "#006443",
    link: "#94a3b8",
    youtube: "#ff0000",
    linkedin: "#0a66c2",
    phone: "#34c759",
    mail: "#ea4335",
    email: "#ea4335",
};

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    containerClassName?: string;
    showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, containerClassName, showRing = true, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);

        return (
            <div className={cn("relative", containerClassName)}>
                <textarea
                    className={cn(
                        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                        "transition-all duration-200 ease-in-out",
                        "placeholder:text-muted-foreground",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
                        className
                    )}
                    ref={ref}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {showRing && isFocused && (
                    <motion.span
                        className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}

                {props.onChange && (
                    <div
                        className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-violet-500 rounded-full"
                        style={{ animation: "none" }}
                        id="textarea-ripple"
                    />
                )}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

export function AnimatedAIChat({ socialLinks = [] }: { socialLinks?: SocialLink[] }) {
    const [value, setValue] = useState("");
    const [, startTransition] = useTransition();
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [, setRecentCommand] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const commandPaletteRef = useRef<HTMLDivElement>(null);

    const commandSuggestions: CommandSuggestion[] = [
        {
            icon: <ImageIcon className="w-4 h-4" />,
            label: "Clone UI",
            description: "Generate a UI from a screenshot",
            prefix: "/clone",
        },
        {
            icon: <Figma className="w-4 h-4" />,
            label: "Import Figma",
            description: "Import a design from Figma",
            prefix: "/figma",
        },
        {
            icon: <MonitorIcon className="w-4 h-4" />,
            label: "Create Page",
            description: "Generate a new web page",
            prefix: "/page",
        },
        {
            icon: <Sparkles className="w-4 h-4" />,
            label: "Improve",
            description: "Improve existing UI design",
            prefix: "/improve",
        },
    ];

    useEffect(() => {
        if (value.startsWith("/") && !value.includes(" ")) {
            setShowCommandPalette(true);
            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );
            setActiveSuggestion(matchingSuggestionIndex >= 0 ? matchingSuggestionIndex : -1);
        } else {
            setShowCommandPalette(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector("[data-command-button]");
            if (
                commandPaletteRef.current &&
                !commandPaletteRef.current.contains(target) &&
                !commandButton?.contains(target)
            ) {
                setShowCommandPalette(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSendMessage = () => {
        if (!value.trim()) return;
        startTransition(() => {
            setShowAlert(true);
            setValue("");
            adjustHeight(true);
            if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
            alertTimerRef.current = setTimeout(() => setShowAlert(false), 4000);
        });
    };

    useEffect(() => {
        return () => {
            if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveSuggestion((prev) =>
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveSuggestion((prev) =>
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === "Tab" || e.key === "Enter") {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setValue(selectedCommand.prefix + " ");
                    setShowCommandPalette(false);
                    setRecentCommand(selectedCommand.label);
                    setTimeout(() => setRecentCommand(null), 3500);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    const openSocialLink = (link: SocialLink) => {
        let protocol: string;
        try {
            protocol = new URL(link.url).protocol;
        } catch {
            return;
        }
        const allowed = ["https:", "http:", "tel:", "mailto:"];
        if (!allowed.includes(protocol)) return;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(link.id);
        if (isUuid) {
            fetch(`/api/track/social_link/${link.id}`, { method: "POST" }).catch(() => { });
        }

        if (protocol === "tel:" || protocol === "mailto:") {
            window.location.href = link.url;
        } else {
            window.open(link.url, "_blank", "noopener,noreferrer");
        }
    };

    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        setValue(selectedCommand.prefix + " ");
        setShowCommandPalette(false);
        setRecentCommand(selectedCommand.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    return (
        <div className="min-h-screen flex flex-col w-full items-center justify-center bg-transparent text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
            </div>
            <div className="w-full max-w-2xl mx-auto relative">
                <motion.div
                    className="relative z-10 space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="rounded-3xl bg-black/60 backdrop-blur-sm shadow-2xl p-6 sm:p-8 space-y-8 outline outline-2 sm:outline-1 outline-white -outline-offset-2 sm:-outline-offset-1">
                        <div className="text-center space-y-3">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-block"
                            >
                                <div className="flex justify-center pb-2">
                                    <Image
                                        src="/icon-light.png"
                                        alt="KAG — Khalid Abdelhamid Group"
                                        width={280}
                                        height={175}
                                        priority
                                        className="h-auto w-[220px] sm:w-[260px] drop-shadow-[0_4px_24px_rgba(255,255,255,0.08)]"
                                    />
                                </div>
                                <motion.div
                                    className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "100%", opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                />
                            </motion.div>
                            <motion.div
                                className="text-base text-white/70 leading-6 h-12 flex items-start justify-center overflow-hidden px-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Typewriter
                                    text={[
                                        "Welcome To KAG, I'm Fahem, I can speak English. How can I help you?",
                                        "أهلًا وسهلًا في كيه ايه جي، أنا فاهم، بتكلم عربي. إزاي أقدر أساعدك؟",
                                        "Bienvenue chez KAG, je suis Fahem, je parle français. Comment puis-je vous aider ?",
                                    ]}
                                    speed={55}
                                    waitTime={2200}
                                    deleteSpeed={25}
                                    cursorChar="_"
                                    className="text-white/80"
                                    cursorClassName="ml-0.5 text-white/50"
                                />
                            </motion.div>
                        </div>

                        <motion.div
                            className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl shadow-2xl outline outline-2 sm:outline-1 outline-white -outline-offset-2 sm:-outline-offset-1"
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <AnimatePresence>
                                {showCommandPalette && (
                                    <motion.div
                                        ref={commandPaletteRef}
                                        className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <div className="py-1 bg-black/95">
                                            {commandSuggestions.map((suggestion, index) => (
                                                <motion.div
                                                    key={suggestion.prefix}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                                                        activeSuggestion === index
                                                            ? "bg-white/10 text-white"
                                                            : "text-white/70 hover:bg-white/5"
                                                    )}
                                                    onClick={() => selectCommandSuggestion(index)}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.03 }}
                                                >
                                                    <div className="w-5 h-5 flex items-center justify-center text-white/60">
                                                        {suggestion.icon}
                                                    </div>
                                                    <div className="font-medium">{suggestion.label}</div>
                                                    <div className="text-white/40 text-xs ml-1">
                                                        {suggestion.prefix}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="p-4">
                                <Textarea
                                    ref={textareaRef}
                                    value={value}
                                    onChange={(e) => {
                                        setValue(e.target.value);
                                        adjustHeight();
                                    }}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setInputFocused(true)}
                                    onBlur={() => setInputFocused(false)}
                                    placeholder="Ask Fahem a question..."
                                    containerClassName="w-full"
                                    className={cn(
                                        "w-full px-4 py-3",
                                        "resize-none",
                                        "bg-transparent",
                                        "border-none",
                                        "text-white/90 text-base sm:text-sm",
                                        "focus:outline-none",
                                        "placeholder:text-white",
                                        "min-h-[60px]"
                                    )}
                                    style={{ overflow: "hidden" }}
                                    showRing={false}
                                />
                            </div>

                            <div className="p-4 border-t border-white/[0.05] flex items-center justify-end gap-4">
                                <motion.button
                                    type="button"
                                    onClick={handleSendMessage}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!value.trim()}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        "flex items-center gap-2",
                                        value.trim()
                                            ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                                            : "bg-white/[0.05] text-white/40"
                                    )}
                                >
                                    <SendIcon className="w-4 h-4" />
                                    <span>Send</span>
                                </motion.button>
                            </div>
                        </motion.div>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {SUGGESTED_PROMPTS.map((prompt, index) => (
                                <motion.button
                                    key={prompt}
                                    type="button"
                                    onClick={() => {
                                        setValue(prompt);
                                        setTimeout(() => {
                                            textareaRef.current?.focus();
                                            adjustHeight();
                                        }, 0);
                                    }}
                                    className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.09] rounded-full text-xs text-white/70 hover:text-white border border-white/[0.06] transition-all"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + index * 0.06 }}
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {prompt}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {socialLinks.map((link, index) => {
                            const key = (link.iconName ?? "link").toLowerCase();
                            const color = SOCIAL_COLORS[key] ?? "#94a3b8";
                            const imageSrc = ICON_IMAGE_MAP[key];
                            const LucideIco = imageSrc ? null : getIcon(link.iconName);
                            return (
                                <motion.button
                                    key={link.id}
                                    type="button"
                                    onClick={() => openSocialLink(link)}
                                    aria-label={link.label}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white transition-all relative group backdrop-blur-md shadow-lg shadow-[#374c9b]/30 hover:shadow-[#374c9b]/50"
                                    style={{
                                        background:
                                            "linear-gradient(180deg, rgba(85,108,189,0.40) 0%, rgba(55,76,155,0.32) 60%, rgba(40,56,125,0.40) 100%)",
                                    }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.07 }}
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <span
                                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                        style={{ background: `${color}26` }}
                                    >
                                        {imageSrc ? (
                                            <Image
                                                src={imageSrc}
                                                alt=""
                                                width={14}
                                                height={14}
                                                className="object-contain"
                                            />
                                        ) : LucideIco ? (
                                            <LucideIco style={{ color, width: 13, height: 13 }} strokeWidth={1.75} />
                                        ) : null}
                                    </span>
                                    <span>{link.label}</span>
                                    <motion.div
                                        className="absolute inset-0 border border-white/[0.06] rounded-lg pointer-events-none"
                                        initial={false}
                                        animate={{ opacity: [0, 1], scale: [0.98, 1] }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    />
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md pointer-events-none">
                <AnimatePresence>
                    {showAlert && (
                        <div className="pointer-events-auto">
                            <GradientAlert
                                variant="information"
                                title="Under Construction"
                                description="This feature isn't available yet — coming soon."
                                onClose={() => setShowAlert(false)}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {inputFocused && (
                <motion.div
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}
        </div>
    );
}

const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;

if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.innerHTML = rippleKeyframes;
    document.head.appendChild(style);
}
