"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Shield,
  Calendar,
  FolderGit2,
  Users,
  Camera,
  Cpu,
  Mail,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  Search,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  INITIAL_PROJECTS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_GALLERY,
  INITIAL_CONTACT_MESSAGES,
  EventData,
} from "@/lib/data/initialData";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "projects" | "members" | "gallery" | "messages">("overview");

  // Local state for dynamic changes in the dashboard session
  // Events are database rows now. They are fetched rather than seeded, so what
  // this list shows is what the public site shows.
  const [events, setEvents] = useState<EventData[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [members, setMembers] = useState(INITIAL_TEAM_MEMBERS);
  const [gallery, setGallery] = useState(INITIAL_GALLERY);
  const [messages, setMessages] = useState(INITIAL_CONTACT_MESSAGES);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load events.");
      setEvents(json.data ?? []);
    } catch (err: any) {
      setEventsError(err.message);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Form modal states
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    venue: "",
    time: "02:00 PM - 05:00 PM IST",
    category: "WORKSHOP" as any,
    description: "",
    maxSeats: 100,
  });

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    position: "",
    departmentName: "Technical Department",
    bio: "",
    skills: "AWS, Docker, Python",
  });

  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    shortDesc: "",
    problem: "",
    solution: "",
    technologies: "Next.js, Python, Terraform",
    awsServices: "AWS Lambda, Amazon S3, DynamoDB",
  });

  // Handlers
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEventsError(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          venue: newEvent.venue,
          time: newEvent.time,
          category: newEvent.category,
          maxSeats: Number(newEvent.maxSeats),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create the event.");

      // Re-read rather than splicing the response into local state: the server
      // is the only thing that knows the real list, and this is exactly where
      // the old version went wrong.
      await loadEvents();
      setShowAddEvent(false);
      setNewEvent({ title: "", venue: "", time: "02:00 PM - 05:00 PM IST", category: "WORKSHOP", description: "", maxSeats: 100 });
    } catch (err: any) {
      setEventsError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Delete this event? Registrations for it are kept, but the event disappears from the site.")) return;
    setEventsError(null);
    try {
      const res = await fetch(`/api/admin/events?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not delete the event.");
      await loadEvents();
    } catch (err: any) {
      setEventsError(err.message);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      position: newMember.position,
      departmentId: "dept-2",
      departmentName: newMember.departmentName,
      bio: newMember.bio,
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "member@sxcaws.club",
      isExecutive: false,
      skills: newMember.skills.split(",").map((s) => s.trim()),
      order: members.length + 1,
    };
    setMembers([...members, created]);
    setShowAddMember(false);
    setNewMember({ name: "", position: "", departmentName: "Technical Department", bio: "", skills: "AWS, Docker, Python" });
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `proj-${Date.now()}`,
      title: newProject.title,
      slug: newProject.title.toLowerCase().replace(/\s+/g, "-"),
      shortDesc: newProject.shortDesc,
      problem: newProject.problem,
      solution: newProject.solution,
      technologies: newProject.technologies.split(",").map((s) => s.trim()),
      awsServices: newProject.awsServices.split(",").map((s) => s.trim()),
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
      githubUrl: "https://github.com/sxc-aws-club",
      liveDemoUrl: "https://sxcaws.club",
      isFeatured: false,
      members: [{ name: "SXC Lead", role: "Architect", avatarUrl: "" }],
    };
    setProjects([created, ...projects]);
    setShowAddProject(false);
    setNewProject({ title: "", shortDesc: "", problem: "", solution: "", technologies: "Next.js, Python, Terraform", awsServices: "AWS Lambda, Amazon S3, DynamoDB" });
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleToggleReadMessage = (id: string) => {
    setMessages(
      messages.map((m) => (m.id === id ? { ...m, isRead: !m.isRead } : m))
    );
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter((m) => m.id !== id));
  };

  return (
    <div className="relative pt-28 pb-20 overflow-hidden">
      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>CONTROL PLANE & DASHBOARD</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              SXC AWS <span className="text-gradient-orange">Admin Center</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              PostgreSQL / In-Memory Online
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 py-6">
          {[
            { id: "overview", label: "System Metrics", icon: Shield },
            { id: "events", label: `Events (${events.length})`, icon: Calendar },
            { id: "projects", label: `Projects (${projects.length})`, icon: FolderGit2 },
            { id: "members", label: `Leadership (${members.length})`, icon: Users },
            { id: "gallery", label: `Gallery (${gallery.length})`, icon: Camera },
            { id: "messages", label: `Inquiries (${messages.length})`, icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                  isSelected
                    ? "bg-aws-orange text-black font-bold shadow-md shadow-aws-orange/20"
                    : "bg-navy-900/80 text-slate-300 border border-white/10 hover:border-aws-orange/40 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: System Metrics & Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-navy-900/70 border border-white/10 backdrop-blur-xl">
                <div className="text-xs font-mono text-slate-400">Total Events</div>
                <div className="text-3xl font-extrabold text-white mt-1">{events.length}</div>
                <div className="text-[11px] text-emerald-400 font-mono mt-2">
                  {events.filter((e) => e.status === "UPCOMING").length} Upcoming Open
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-navy-900/70 border border-white/10 backdrop-blur-xl">
                <div className="text-xs font-mono text-slate-400">Deployed Projects</div>
                <div className="text-3xl font-extrabold text-white mt-1">{projects.length}</div>
                <div className="text-[11px] text-aws-orange font-mono mt-2">
                  {projects.filter((p) => p.isFeatured).length} Featured
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-navy-900/70 border border-white/10 backdrop-blur-xl">
                <div className="text-xs font-mono text-slate-400">Club Leaders</div>
                <div className="text-3xl font-extrabold text-white mt-1">{members.length}</div>
                <div className="text-[11px] text-blue-400 font-mono mt-2">5 Active Depts</div>
              </div>

              <div className="p-6 rounded-2xl bg-navy-900/70 border border-white/10 backdrop-blur-xl">
                <div className="text-xs font-mono text-slate-400">Inbound Messages</div>
                <div className="text-3xl font-extrabold text-white mt-1">{messages.length}</div>
                <div className="text-[11px] text-pink-400 font-mono mt-2">
                  {messages.filter((m) => !m.isRead).length} Unread
                </div>
              </div>
            </div>

            {/* Quick Actions Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-navy-900/70 border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center justify-between">
                  <span>Recent Event Registrations</span>
                  <span className="text-xs font-mono text-aws-orange">Live Feed</span>
                </h3>
                <div className="space-y-2">
                  {events.slice(0, 3).map((e) => (
                    <div key={e.id} className="p-3 rounded-xl bg-navy-950/80 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white truncate max-w-xs">{e.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{e.venue}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-aws-orange/20 text-aws-orange font-mono font-bold">
                        {e.currentRegistrations} / {e.maxSeats}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-navy-900/70 border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center justify-between">
                  <span>Recent Inquiries & Feedback</span>
                  <span className="text-xs font-mono text-blue-400">PostgreSQL Store</span>
                </h3>
                <div className="space-y-2">
                  {messages.slice(0, 3).map((m) => (
                    <div key={m.id} className="p-3 rounded-xl bg-navy-950/80 border border-white/5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{m.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{m.email}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-1">{m.subject}: {m.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Events Management */}
        {activeTab === "events" && eventsError && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono">
            {eventsError}
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Events & Workshop Management</h2>
              <button
                onClick={() => setShowAddEvent(true)}
                className="px-4 py-2 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-xs font-mono flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Event</span>
              </button>
            </div>

            {showAddEvent && (
              <form onSubmit={handleAddEvent} className="p-6 rounded-2xl bg-navy-950 border border-aws-orange/40 space-y-4 animate-in fade-in">
                <h3 className="text-sm font-bold text-aws-orange font-mono">Add New Event to Database</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="Event Title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  />
                  <input
                    required
                    placeholder="Venue (e.g. Lab 302 or Main Hall)"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    placeholder="Time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  />
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  >
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="HACKATHON">HACKATHON</option>
                    <option value="BOOTCAMP">BOOTCAMP</option>
                    <option value="SEMINAR">SEMINAR</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Max Seats"
                    value={newEvent.maxSeats}
                    onChange={(e) => setNewEvent({ ...newEvent, maxSeats: Number(e.target.value) })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <textarea
                  required
                  placeholder="Short Description & Takeaways"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddEvent(false)}
                    className="px-4 py-1.5 rounded-xl bg-navy-800 text-slate-300 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 rounded-xl bg-aws-orange text-black font-bold text-xs font-mono disabled:opacity-50"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-navy-950/80 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Venue</th>
                    <th className="p-3">Seats</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.map((e) => (
                    <tr key={e.id} className="hover:bg-navy-900/60 transition-colors">
                      <td className="p-3 font-semibold text-white">{e.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-aws-orange">{e.category}</span>
                      </td>
                      <td className="p-3 text-slate-300">{e.venue}</td>
                      <td className="p-3 text-slate-300">{e.currentRegistrations} / {e.maxSeats}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">{e.status}</span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteEvent(e.id)}
                          className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Projects Management */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Cloud Projects Showcase Management</h2>
              <button
                onClick={() => setShowAddProject(true)}
                className="px-4 py-2 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-xs font-mono flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>

            {showAddProject && (
              <form onSubmit={handleAddProject} className="p-6 rounded-2xl bg-navy-950 border border-aws-orange/40 space-y-4 animate-in fade-in">
                <h3 className="text-sm font-bold text-aws-orange font-mono">Publish Student Cloud Project</h3>
                <input
                  required
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                />
                <input
                  required
                  placeholder="One-line Short Summary"
                  value={newProject.shortDesc}
                  onChange={(e) => setNewProject({ ...newProject, shortDesc: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <textarea
                    placeholder="Problem Statement"
                    value={newProject.problem}
                    onChange={(e) => setNewProject({ ...newProject, problem: e.target.value })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                    rows={2}
                  />
                  <textarea
                    placeholder="AWS Architecture Solution"
                    value={newProject.solution}
                    onChange={(e) => setNewProject({ ...newProject, solution: e.target.value })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    placeholder="Tech Stack (comma separated)"
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  />
                  <input
                    placeholder="AWS Services (comma separated)"
                    value={newProject.awsServices}
                    onChange={(e) => setNewProject({ ...newProject, awsServices: e.target.value })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddProject(false)}
                    className="px-4 py-1.5 rounded-xl bg-navy-800 text-slate-300 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-aws-orange text-black font-bold text-xs font-mono"
                  >
                    Publish Project
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-navy-900/70 border border-white/10 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{p.shortDesc}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.awsServices.slice(0, 3).map((s) => (
                        <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-aws-orange">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="p-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Members Management */}
        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Leadership & Team Members</h2>
              <button
                onClick={() => setShowAddMember(true)}
                className="px-4 py-2 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-xs font-mono flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </div>

            {showAddMember && (
              <form onSubmit={handleAddMember} className="p-6 rounded-2xl bg-navy-950 border border-aws-orange/40 space-y-4 animate-in fade-in">
                <h3 className="text-sm font-bold text-aws-orange font-mono">Add Member to Club Directory</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="Full Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  />
                  <input
                    required
                    placeholder="Position (e.g. DevOps Subhead)"
                    value={newMember.position}
                    onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    value={newMember.departmentName}
                    onChange={(e) => setNewMember({ ...newMember, departmentName: e.target.value })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  >
                    <option value="Executive Board">Executive Board</option>
                    <option value="Technical Department">Technical Department</option>
                    <option value="Marketing & Design">Marketing & Design</option>
                    <option value="Events & Logistics">Events & Logistics</option>
                    <option value="PR & Corporate Outreach">PR & Corporate Outreach</option>
                  </select>
                  <input
                    placeholder="Skills (comma separated)"
                    value={newMember.skills}
                    onChange={(e) => setNewMember({ ...newMember, skills: e.target.value })}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  />
                </div>
                <textarea
                  required
                  placeholder="Short Bio"
                  value={newMember.bio}
                  onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white"
                  rows={2}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="px-4 py-1.5 rounded-xl bg-navy-800 text-slate-300 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-aws-orange text-black font-bold text-xs font-mono"
                  >
                    Save Member
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-navy-900/70 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{m.name}</h4>
                    <div className="text-xs text-aws-orange font-mono">{m.position}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{m.departmentName}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    className="p-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Contact Messages Management */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Inbound Inquiries & Sponsorship Leads</h2>

            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    msg.isRead
                      ? "bg-navy-900/40 border-white/5 text-slate-400"
                      : "bg-navy-900/90 border-aws-orange/40 text-white shadow-lg"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                    <div>
                      <span className="font-bold text-sm text-white">{msg.name}</span>
                      <span className="text-xs font-mono text-aws-orange ml-2">({msg.email})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleToggleReadMessage(msg.id)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300"
                      >
                        {msg.isRead ? "Mark Unread" : "Mark Read"}
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 rounded bg-red-950 hover:bg-red-900 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="text-xs font-bold text-aws-orange-light">{msg.subject}</div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
