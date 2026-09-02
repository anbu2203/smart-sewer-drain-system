from pathlib import Path
p=Path('/home/ubuntu/ssop-dashboard/client/src/pages/Home.tsx')
t=p.read_text()
t=t.replace('type View = "Overview" | "Live Map" | "Alerts" | "Tickets" | "Crew Dispatch" | "Ticket History" | "Risk Analytics" | "Sensor Health" | "Citizen Reports" | "Settings";', 'type View = "Overview" | "Live Map" | "Alerts" | "Tickets" | "Crew Dispatch" | "Ticket History" | "Risk Analytics" | "Sensor Health" | "Citizen Reports" | "Settings" | "My Tasks";\ntype Role = "Admin" | "Employee";')
t=t.replace('function TicketDrawer({ ticket, onClose, onToast, onDispatch, onRequestVerification, proofPhotos, onPhotosChange }: { ticket: typeof tickets[number] | null;', 'function TicketDrawer({ ticket, onClose, onToast, onDispatch, onRequestVerification, proofPhotos, onPhotosChange, role }: { ticket: typeof tickets[number] | null; role: Role;')
# restore the rest of the signature after the replacement's duplicated segment
# The replacement above intentionally injects role before the old remainder; normalize its type block.
t=t.replace('role: Role; typeof tickets[number] | null;', 'role: Role;')
t=t.replace('onPhotosChange: (ticketId: string, photos: string[]) => void }) {', 'onPhotosChange: (ticketId: string, photos: string[]) => void; role: Role }) {',1)
t=t.replace('<div className="update-composer"><input value={update}', '{role === "Admin" && <div className="update-composer"><input value={update}',1)
t=t.replace('</button></div></div><div className="drawer-section"><div className="drawer-section-title"><strong>Proof of work</strong>', '</button></div>}</div><div className="drawer-section"><div className="drawer-section-title"><strong>Proof of work</strong>',1)
t=t.replace('<div className="drawer-actions"><button className="button secondary" disabled={sending}', '<div className="drawer-actions">{role === "Admin" && <button className="button secondary" disabled={sending}',1)
t=t.replace('</button><button className="button primary" onClick={() => onRequestVerification(ticket.id)}>', '</button>}<button className="button primary" onClick={() => onRequestVerification(ticket.id)}>',1)
# Insert employee task view before DetailView
marker='function DetailView('
employee='''function EmployeeTasksView({ activeTickets, openTicket, verificationCount, navigate }: { activeTickets: Ticket[]; openTicket: (id: string) => void; verificationCount: number; navigate: (view: View) => void }) { return <section className="detail-view"><SectionHead icon={ClipboardList} title="My assigned tasks" description="Employee workspace · submit proof and track assigned work" action={<button className="button secondary" onClick={() => navigate("Alerts")}><Bell size={14} /> Notifications {verificationCount > 0 && <b>{verificationCount}</b>}</button>} /><div className="employee-banner"><div><span className="map-side-label">EMPLOYEE ACCESS</span><h2>Field work queue</h2><p>Dashboard commands are restricted. Open a task to upload proof of work and request supervisor verification.</p></div><ShieldCheck size={28} /></div><div className="detail-table employee-task-list">{activeTickets.filter((item) => item.crew === "Crew Alpha").map((task) => <button className="detail-row" key={task.id} onClick={() => openTicket(task.id)}><span className="severity-dot red" /><span className="row-primary"><strong>{task.id} · {task.manhole}</strong><small>{task.title} · Due {task.deadline} IST</small></span><span>{task.status}</span><ChevronRight size={15} /></button>)}{!activeTickets.some((item) => item.crew === "Crew Alpha") && <div className="empty-state"><CheckCircle2 size={18} /><strong>No assigned tasks</strong><span>New field tasks will appear here.</span></div>}</div></section>; }

'''
t=t.replace(marker,employee+marker,1)
# DetailView props and branch
t=t.replace('activeTickets, proofPhotos, historyEntries, historyLoading, onOpenHistory }: { view: View;', 'activeTickets, proofPhotos, historyEntries, historyLoading, onOpenHistory, role, onRoleChange }: { view: View;')
t=t.replace('onOpenHistory: (entry: HistoryEntry) => void }) {', 'onOpenHistory: (entry: HistoryEntry) => void; role: Role; onRoleChange: (role: Role) => void }) {',1)
t=t.replace('if (view === "Tickets") return <TicketsView openTicket={openTicket} activeTickets={activeTickets} />;', 'if (view === "My Tasks") return <EmployeeTasksView activeTickets={activeTickets} openTicket={openTicket} verificationCount={verificationTicketIds.length} navigate={navigate} />; if (view === "Tickets") return <TicketsView openTicket={openTicket} activeTickets={activeTickets} />;',1)
# add settings switcher action
t=t.replace('description="Configure operating city, roles, alerts, and report delivery" />', 'description="Configure operating city, roles, alerts, and report delivery" action={<div className="role-switcher"><span>Current user</span><button className={role === "Admin" ? "active" : ""} onClick={() => onRoleChange("Admin")}>Admin</button><button className={role === "Employee" ? "active" : ""} onClick={() => onRoleChange("Employee")}>Employee</button></div>} />',1)
# home state and navigation
t=t.replace('export default function Home() { const [activeView, setActiveView] = useState<View>("Overview");', 'export default function Home() { const [role, setRole] = useState<Role>("Admin"); const [activeView, setActiveView] = useState<View>("Overview");',1)
t=t.replace('const navigate = (view: View) => { setActiveView(view);', 'const navigate = (view: View) => { if (role === "Employee" && !["My Tasks", "Settings", "Alerts"].includes(view)) { toastAction("Admin access required for command-centre views"); return; } setActiveView(view);',1)
t=t.replace('const dispatch = (crew: string) => {', 'const changeRole = (nextRole: Role) => { setRole(nextRole); setActiveView(nextRole === "Employee" ? "My Tasks" : "Overview"); toastAction(`Switched to ${nextRole} workspace`); }; const dispatch = (crew: string) => {',1)
# replace menu map use with visibleMenu
needle='<nav className="nav-groups">{menu.map((group) =>'
replacement='<nav className="nav-groups">{(role === "Admin" ? menu : [{ label: "Employee workspace", items: [{ label: "My Tasks", icon: ClipboardList }, { label: "Alerts", icon: Bell }, { label: "Settings", icon: Settings2 }] }]).map((group) =>'
t=t.replace(needle,replacement,1)
# profile label
t=t.replace('<strong>ANBU</strong><span>Commissioner view</span>', '<strong>{role === "Admin" ? "ANBU" : "Field operator"}</strong><span>{role === "Admin" ? "Commissioner view" : "Employee view"}</span>',1)
# main DetailView props
t=t.replace('historyEntries={(historyQuery.data ?? []) as HistoryEntry[]} historyLoading={historyQuery.isLoading} onOpenHistory={setHistoryEntry} onApprove={approveTicket}', 'historyEntries={(historyQuery.data ?? []) as HistoryEntry[]} historyLoading={historyQuery.isLoading} onOpenHistory={setHistoryEntry} onApprove={approveTicket} role={role} onRoleChange={changeRole}',1)
# overview route guard: employee should not see overview even if stale active view
t=t.replace('{activeView === "Overview" ? <Overview', '{activeView === "Overview" && role === "Admin" ? <Overview',1)
# ticket drawer role
t=t.replace('<TicketDrawer ticket={ticket}', '<TicketDrawer role={role} ticket={ticket}',1)
p.write_text(t)
