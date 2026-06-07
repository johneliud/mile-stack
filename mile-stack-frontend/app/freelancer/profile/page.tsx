"use client";

import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Save, X, GitBranch, Globe, CheckCircle, ArrowUpRight, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { WalletGuard } from "@/components/WalletGuard";
import { useNotification } from "@/components/Notification";
import { useWallet } from "@/contexts/WalletContext";
import { getProfile, upsertProfile } from "@/lib/profiles";

export default function EditProfilePage() {
  const { address, isConnected } = useWallet();
  const { notify } = useNotification();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const skillInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!address) return;
    getProfile(address)
      .then((profile) => {
        if (!profile) return;
        if (profile.name) setName(profile.name);
        if (profile.bio) setBio(profile.bio);
        if (profile.skills.length) setSkills(profile.skills);
        if (profile.github_url) setGithubUrl(profile.github_url);
        if (profile.portfolio_url) setPortfolioUrl(profile.portfolio_url);
      })
      .catch((err) => console.error("[EditProfile] load:", err));
  }, [address]);

  function addSkill(value: string) {
    const trimmed = value.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      setSkills((prev) => prev.slice(0, -1));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!address) return;
    setSaving(true);
    try {
      await upsertProfile({
        wallet_address: address,
        name: name.trim() || null,
        bio: bio.trim() || null,
        skills,
        github_url: githubUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
      });
      setSaved(true);
      notify("Profile saved.", "success");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("[EditProfile] save:", err);
      notify(err instanceof Error ? err.message : "Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-primary">My Profile</h1>
            <p className="mt-2 text-muted-foreground">
              Your public profile shown to clients when reviewing your applications.
            </p>
          </div>

          <WalletGuard message="Connect your Freighter wallet to set up your profile.">
            {isConnected && (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Left - form sections */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Basic info */}
                    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">
                      <h2 className="text-base font-semibold text-foreground">Basic Info</h2>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">
                          Display Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Jane Mwangi"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="bio" className="text-sm font-medium text-foreground">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          rows={4}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Brief intro. Your experience, what you build, what you're looking for..."
                          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                      <h2 className="text-base font-semibold text-foreground">Skills</h2>
                      <div
                        className="flex flex-wrap gap-2 min-h-[42px] w-full rounded-lg border border-border bg-background px-3 py-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-colors cursor-text"
                        onClick={() => skillInputRef.current?.focus()}
                      >
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSkill(skill);
                              }}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          ref={skillInputRef}
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleSkillKeyDown}
                          onBlur={() => addSkill(skillInput)}
                          placeholder={skills.length === 0 ? "Type a skill and press Enter..." : ""}
                          className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Press Enter or comma to add a skill.
                      </p>
                    </div>

                    {/* Links */}
                    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">
                      <h2 className="text-base font-semibold text-foreground">Links</h2>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="github" className="text-sm font-medium text-foreground">
                          GitHub
                        </label>
                        <div className="relative">
                          <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            id="github"
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/yourusername"
                            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="portfolio" className="text-sm font-medium text-foreground">
                          Portfolio / Website
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            id="portfolio"
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            placeholder="https://yourportfolio.com"
                            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right - actions + preview */}
                  <div className="flex flex-col gap-4 lg:sticky lg:top-24">
                    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                      <h2 className="text-base font-semibold text-foreground">Save Changes</h2>
                      <p className="text-xs text-muted-foreground">
                        Your profile is visible to any client browsing talent.
                      </p>
                      <Button type="submit" variant="primary" size="lg" loading={saving}>
                        {saved ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save Profile"}
                          </>
                        )}
                      </Button>
                    </div>

                    {address && (
                      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <h2 className="text-sm font-semibold text-foreground">Public Profile</h2>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This is what clients see when they view your profile.
                        </p>
                        <a
                          href={`/freelancers/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                        >
                          View public profile
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}
          </WalletGuard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
