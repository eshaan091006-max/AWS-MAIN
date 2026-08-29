"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Camera,
  Cloud,
  ClipboardCheck,
  FolderGit2,
  LayoutGrid,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  INITIAL_PROJECTS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_CONTACT_MESSAGES,
  EventData,
} from "@/lib/data/initialData";
import { EventEditor } from "@/components/admin/EventEditor";
import { AttendanceChecklist } from "@/components/admin/AttendanceChecklist";
import { WalkInTab } from "@/components/admin/WalkInTab";
import { StatusStrip } from "@/components/admin/StatusStrip";
import { ConsoleInteractions } from "@/components/admin/ConsoleInteractions";
import { CustomCursor } from "@/components/admin/CustomCursor";
import { MotionToggle } from "@/components/admin/MotionToggle";
import { GalleryTab } from "@/components/admin/GalleryTab";
import { CommandPalette, type Command } from "@/components/admin/CommandPalette";

type Tab =
  | "overview"
  | "events"
  | "walkin"
  | "projects"
  | "members"
  | "gallery"
  | "messages";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Events are database rows, so this list is what the public site shows.
  const [events, setEvents] = useState<EventData[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [showEditor, setShowEditor] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [attendanceEvent, setAttendanceEvent] = useState<EventData | null>(null);

  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  const [regSummary, setRegSummary] = useState<{ total: number; present: number } | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // Static content, authored in lib/data/initialData.ts. Shown read-only —
  // these tabs used to offer Add and Delete buttons that only ever mutated
  // React state, so the data vanished on refresh while looking saved.
  const projects = INITIAL_PROJECTS;
  const members = INITIAL_TEAM_MEMBERS;
  const messages = INITIAL_CONTACT_MESSAGES;

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load events.");
      setEvents(json.data ?? []);
      setDbConnected(true);
    } catch (err: any) {
      setEventsError(err.message);
      setDbConnected(false);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/registrations", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.summary) setRegSummary(json.summary);
    } catch {
      // A missing headline number should not break the console.
    }
  }, []);

  useEffect(() => {
    loadEvents();
    loadSummary();
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.user && setSignedInAs(j.user.displayName || j.user.username))
      .catch(() => {});
  }, [loadEvents, loadSummary]);

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? Registrations are kept, but it disappears from the site.`)) {
      return;
    }
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

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const upcoming = events.filter((e) => e.status === "UPCOMING").length;

  const tabs: { id: Tab; label: string; icon: typeof Calendar; count?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "events", label: "Events", icon: Calendar, count: events.length },
    { id: "walkin", label: "Walk-in Desk", icon: UserPlus },
    { id: "messages", label: "Inquiries", icon: Mail, count: messages.length },
    { id: "projects", label: "Projects", icon: FolderGit2, count: projects.length },
    { id: "members", label: "Leadership", icon: Users, count: members.length },
    { id: "gallery", label: "Gallery", icon: Camera },
  ];

  const activeLabel = tabs.find((t) => t.id === activeTab)?.label ?? "";

  // Built from live state, so a newly created event is reachable from the
  // palette immediately without any registration step.
  const commands: Command[] = [
    ...tabs.map((tab) => ({
      id: `tab:${tab.id}`,
      label: `Go to ${tab.label}`,
      group: "Navigate",
      run: () => setActiveTab(tab.id),
    })),
    {
      id: "action:new-event",
      label: "Create a new event",
      group: "Events",
      keywords: "add make",
      run: () => {
        setEditingEvent(null);
        setAttendanceEvent(null);
        setShowEditor(true);
        setActiveTab("events");
      },
    },
    {
      id: "action:refresh",
      label: "Reload all data",
      group: "Console",
      keywords: "refetch sync",
      run: () => {
        loadEvents();
        loadSummary();
      },
    },
    ...events.flatMap((event) => [
      {
        id: `attend:${event.id}`,
        label: `Attendance — ${event.title}`,
        group: "Check-in",
        keywords: `${event.venue} register present`,
        run: () => {
          setAttendanceEvent(event);
          setShowEditor(false);
          setActiveTab("events");
        },
      },
      {
        id: `edit:${event.id}`,
        label: `Edit — ${event.title}`,
        group: "Events",
        keywords: event.venue,
        run: () => {
          setEditingEvent(event);
          setAttendanceEvent(null);
          setShowEditor(true);
          setActiveTab("events");
        },
      },
    ]),
    {
      id: "action:signout",
      label: "Sign out",
      group: "Console",
      run: signOut,
    },
  ];

  return (
    <div className="adm-shell">
      <ConsoleInteractions />
      <CustomCursor />
      <CommandPalette commands={commands} />

      {/* ---------------- Rail ---------------- */}
      <aside className="adm-rail">
        <div className="adm-brand">
          <span className="adm-brand-mark">
            <Cloud className="w-4 h-4" strokeWidth={2.4} />
          </span>
          <span className="min-w-0">
            <span className="block adm-mono text-[11px] tracking-[0.16em] uppercase leading-none">
              SXC AWS
            </span>
            <span className="block adm-mono text-[9px] tracking-[0.16em] uppercase mt-1" style={{ color: "var(--adm-faint)" }}>
              Console
            </span>
          </span>
        </div>

        <nav className="adm-nav adm-scroll">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="adm-navitem"
            >
              <tab.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="adm-navitem-count">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div
          className="hidden lg:block mt-auto p-4"
          style={{ borderTop: "1px solid var(--adm-line)" }}
        >
          <div className="adm-eyebrow">Signed in</div>
          <div className="adm-mono text-[11px] mt-1.5 truncate">{signedInAs ?? "—"}</div>
          <button type="button" onClick={signOut} className="adm-btn w-full mt-3">
            <LogOut className="w-3.5 h-3.5" />
            <span>SIGN OUT</span>
          </button>
        </div>
      </aside>

      {/* ---------------- Content ---------------- */}
      <div className="min-w-0">
        <header className="adm-header">
          <div className="min-w-0">
            <div className="adm-eyebrow">Console</div>
            <h1 className="adm-title mt-1">{activeLabel}</h1>
          </div>

          <div className="hidden md:block flex-1 min-w-0 px-4">
            <StatusStrip dbConnected={dbConnected} signedInAs={signedInAs} />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <MotionToggle />
            <button
              type="button"
              onClick={() => {
                loadEvents();
                loadSummary();
              }}
              className="adm-btn adm-btn-icon"
              title="Reload data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${eventsLoading ? "animate-spin" : ""}`} />
            </button>
            <button type="button" onClick={signOut} className="adm-btn lg:hidden adm-btn-icon" title="Sign out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <main className="adm-main space-y-6">
          {/* ---------------- Overview ---------------- */}
          {activeTab === "overview" && (
            <>
              <div className="adm-stats">
                <button type="button" className="adm-stat" data-index="01" onClick={() => setActiveTab("events")}>
                  <div className="adm-eyebrow">Events</div>
                  <div className="adm-stat-value">{events.length}</div>
                  <div className="adm-stat-note">{upcoming} upcoming</div>
                </button>
                <button type="button" className="adm-stat" data-index="02" onClick={() => setActiveTab("walkin")}>
                  <div className="adm-eyebrow">Registrations</div>
                  <div className="adm-stat-value" style={{ color: "var(--adm-accent)" }}>
                    {regSummary?.total ?? "—"}
                  </div>
                  <div className="adm-stat-note">across all events</div>
                </button>
                <div className="adm-stat" data-index="03">
                  <div className="adm-eyebrow">Checked in</div>
                  <div className="adm-stat-value" style={{ color: "var(--adm-ok)" }}>
                    {regSummary?.present ?? "—"}
                  </div>
                  <div className="adm-stat-note">
                    {regSummary && regSummary.total > 0
                      ? `${Math.round((regSummary.present / regSummary.total) * 100)}% of registered`
                      : "marked present"}
                  </div>
                  {/* Turnout against registrations — the one ratio here with a
                      real ceiling, so the only one that earns a meter. */}
                  {regSummary && regSummary.total > 0 && (
                    <div className="adm-meter">
                      <span
                        style={{
                          width: `${Math.min(100, (regSummary.present / regSummary.total) * 100)}%`,
                          background: "var(--adm-ok)",
                          boxShadow: "0 0 10px rgba(53,208,127,0.6)",
                        }}
                      />
                    </div>
                  )}
                </div>
                <button type="button" className="adm-stat" data-index="04" onClick={() => setActiveTab("messages")}>
                  <div className="adm-eyebrow">Inquiries</div>
                  <div className="adm-stat-value">{messages.length}</div>
                  <div className="adm-stat-note">
                    {messages.filter((m) => !m.isRead).length} unread
                  </div>
                </button>
              </div>

              <section className="adm-panel">
                <div className="adm-panel-head">
                  <span className="adm-eyebrow">Upcoming events</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("events")}
                    className="adm-btn"
                  >
                    MANAGE
                  </button>
                </div>
                {events.length === 0 ? (
                  <div className="adm-empty">
                    {eventsLoading ? "Loading…" : "No events yet."}
                  </div>
                ) : (
                  <div className="overflow-x-auto adm-scroll">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Date</th>
                          <th>Venue</th>
                          <th>Seats</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.slice(0, 5).map((e) => (
                          <tr key={e.id}>
                            <td className="font-semibold">{e.title}</td>
                            <td className="adm-mono adm-num" style={{ color: "var(--adm-dim)" }}>
                              {new Date(e.date).toLocaleDateString("en-GB")}
                            </td>
                            <td style={{ color: "var(--adm-dim)" }}>{e.venue}</td>
                            <td className="adm-mono adm-num" style={{ color: "var(--adm-dim)" }}>
                              {e.maxSeats}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ---------------- Events ---------------- */}
          {activeTab === "events" && (
            <>
              {eventsError && <div className="adm-alert">{eventsError}</div>}

              {attendanceEvent && (
                <AttendanceChecklist
                  event={attendanceEvent}
                  onClose={() => setAttendanceEvent(null)}
                />
              )}

              {showEditor && (
                <EventEditor
                  event={editingEvent}
                  onSaved={async () => {
                    await loadEvents();
                    setShowEditor(false);
                    setEditingEvent(null);
                  }}
                  onCancel={() => {
                    setShowEditor(false);
                    setEditingEvent(null);
                  }}
                />
              )}

              <section className="adm-panel">
                <div className="adm-panel-head">
                  <span className="adm-eyebrow">All events</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEvent(null);
                      setShowEditor(true);
                      setAttendanceEvent(null);
                    }}
                    className="adm-btn adm-btn-primary"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>NEW EVENT</span>
                  </button>
                </div>

                {eventsLoading && events.length === 0 ? (
                  <div className="adm-empty">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Loading events…
                  </div>
                ) : events.length === 0 ? (
                  <div className="adm-empty">No events yet. Create the first one.</div>
                ) : (
                  <div className="overflow-x-auto adm-scroll">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Venue</th>
                          <th>Seats</th>
                          <th>ECC</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((e) => (
                          <tr key={e.id}>
                            <td className="font-semibold">{e.title}</td>
                            <td>
                              <span className="adm-tag">{e.category}</span>
                            </td>
                            <td style={{ color: "var(--adm-dim)" }}>{e.venue}</td>
                            <td className="adm-mono adm-num" style={{ color: "var(--adm-dim)" }}>
                              {e.maxSeats}
                            </td>
                            <td className="adm-mono adm-num">
                              {e.eccPoints > 0 ? (
                                <span style={{ color: "var(--adm-accent)" }}>{e.eccPoints}</span>
                              ) : (
                                <span style={{ color: "var(--adm-ghost)" }}>—</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`adm-tag ${e.status === "UPCOMING" ? "adm-tag-ok" : ""}`}
                              >
                                <span className="adm-dot" />
                                {e.status}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAttendanceEvent(e);
                                    setShowEditor(false);
                                  }}
                                  className="adm-btn adm-btn-icon"
                                  title="Take attendance"
                                >
                                  <ClipboardCheck className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingEvent(e);
                                    setShowEditor(true);
                                    setAttendanceEvent(null);
                                  }}
                                  className="adm-btn adm-btn-icon"
                                  title="Edit event"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(e.id, e.title)}
                                  className="adm-btn adm-btn-icon adm-btn-danger"
                                  title="Delete event"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ---------------- Walk-in ---------------- */}
          {activeTab === "walkin" && <WalkInTab events={events} />}

          {activeTab === "gallery" && <GalleryTab />}

          {/* ---------------- Inquiries ---------------- */}
          {activeTab === "messages" && (
            <section className="adm-panel">
              <div className="adm-panel-head">
                <span className="adm-eyebrow">Contact form</span>
              </div>
              <div className="adm-panel-body space-y-3">
                <div className="adm-notice">
                  Showing sample data. Live messages need the messages API, which
                  is not built yet — submissions are saved in Supabase and
                  readable from the table editor.
                </div>
                {messages.map((m) => (
                  <article
                    key={m.id}
                    className="p-4"
                    style={{
                      background: "var(--adm-raised)",
                      border: "1px solid var(--adm-line)",
                      borderLeft: m.isRead
                        ? "3px solid var(--adm-line)"
                        : "3px solid var(--adm-accent)",
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold text-sm">{m.name}</span>
                      <span className="adm-mono text-[11px]" style={{ color: "var(--adm-faint)" }}>
                        {m.email}
                      </span>
                      {!m.isRead && <span className="adm-tag adm-tag-accent">New</span>}
                    </div>
                    <div className="adm-mono text-[11px] mt-2" style={{ color: "var(--adm-dim)" }}>
                      {m.subject}
                    </div>
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--adm-dim)" }}>
                      {m.message}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ---------------- Static content tabs ---------------- */}
          {(activeTab === "projects" || activeTab === "members") && (
            <section className="adm-panel">
              <div className="adm-panel-head">
                <span className="adm-eyebrow">{activeLabel}</span>
                <span className="adm-tag">Read only</span>
              </div>
              <div className="adm-panel-body space-y-4">
                <div className="adm-notice">
                  This content lives in <span className="adm-mono">lib/data/initialData.ts</span> and
                  is edited in code, not here. The Add and Delete controls that used
                  to sit on this tab only changed the page in front of you — nothing
                  was ever saved.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px" style={{ background: "var(--adm-line)" }}>
                  {activeTab === "projects" &&
                    projects.map((p) => (
                      <div key={p.id} className="p-4" style={{ background: "var(--adm-panel)" }}>
                        <div className="font-semibold text-sm">{p.title}</div>
                        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--adm-faint)" }}>
                          {p.shortDesc}
                        </p>
                      </div>
                    ))}

                  {activeTab === "members" &&
                    members.map((m) => (
                      <div key={m.id} className="p-4" style={{ background: "var(--adm-panel)" }}>
                        <div className="font-semibold text-sm">{m.name}</div>
                        <div className="adm-mono text-[11px] mt-1" style={{ color: "var(--adm-accent)" }}>
                          {m.position}
                        </div>
                      </div>
                    ))}

                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
