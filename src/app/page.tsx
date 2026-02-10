import Link from "next/link";
import { ArrowRight, Users, BarChart3, Bell, Shield, Zap, CheckCircle2, Sparkles, TrendingUp, Clock } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f7f8fa] via-white to-[#f7f8fa]">
            {/* Navigation */}
            <nav className="border-b border-app bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-app-sm">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-info flex items-center justify-center shadow-app-md">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-[#1a1d1f]">
                                    Lead Dashboard
                                </span>
                                <p className="text-xs text-[#6b7280] hidden sm:block">Professionelles Lead-Management</p>
                            </div>
                        </div>
                        <Link
                            href="/login"
                            className="px-6 py-2.5 bg-gradient-to-r from-accent to-info text-white rounded-xl hover:shadow-app-lg transition-all font-medium transform hover:scale-105"
                        >
                            Anmelden
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-32 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute top-0 right-0 -z-10 transform translate-x-1/3 -translate-y-1/3">
                    <div className="w-[500px] h-[500px] bg-gradient-to-br from-accent/20 to-info/20 rounded-full blur-3xl animate-pulse"></div>
                </div>
                <div className="absolute bottom-0 left-0 -z-10 transform -translate-x-1/3 translate-y-1/3">
                    <div className="w-[500px] h-[500px] bg-gradient-to-br from-info/15 to-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="text-center max-w-5xl mx-auto relative">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-light to-info-light border border-accent/20 rounded-full mb-8 shadow-app">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-accent">
                            Modernes Lead-Management System
                        </span>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-[#1a1d1f] mb-8 leading-[1.1]">
                        Verwalten Sie Ihre Leads
                        <span className="block text-accent mt-3">
                            einfach und effizient
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-xl sm:text-2xl text-[#6b7280] mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                        Behalten Sie den Überblick über alle Ihre Kontakte, verfolgen Sie den Fortschritt
                        und arbeiten Sie nahtlos mit Ihrem Team zusammen.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href="/login"
                            className="group px-8 py-4 bg-gradient-to-r from-accent to-info text-white rounded-xl hover:shadow-app-xl transition-all font-semibold flex items-center gap-2 w-full sm:w-auto justify-center transform hover:scale-105 shadow-app-lg"
                        >
                            Zum Dashboard
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#features"
                            className="px-8 py-4 bg-white border-2 border-[#e1e4e8] text-[#1a1d1f] rounded-xl hover:border-accent/40 hover:shadow-app-md transition-all font-semibold w-full sm:w-auto text-center"
                        >
                            Mehr erfahren
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-accent mb-1">
                                247+
                            </div>
                            <div className="text-sm text-[#6b7280] font-medium">Aktive Leads</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-accent mb-1">
                                12+
                            </div>
                            <div className="text-sm text-[#6b7280] font-medium">Kampagnen</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-accent mb-1">
                                99%
                            </div>
                            <div className="text-sm text-[#6b7280] font-medium">Zufriedenheit</div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Preview - Enhanced */}
                <div className="mt-24 relative max-w-6xl mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-info/20 blur-3xl rounded-full transform scale-150"></div>
                    <div className="relative bg-white border border-app rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                        {/* Browser chrome */}
                        <div className="bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg)] px-6 py-4 border-b border-app flex items-center gap-3">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-error shadow-sm"></div>
                                <div className="w-3 h-3 rounded-full bg-warning shadow-sm"></div>
                                <div className="w-3 h-3 rounded-full bg-success shadow-sm"></div>
                            </div>
                            <div className="flex-1 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-app rounded-lg">
                                    <Shield className="w-3.5 h-3.5 text-success" />
                                    <span className="text-xs font-medium text-muted">dashboard.example.com</span>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard content */}
                        <div className="p-8 bg-gradient-to-br from-[var(--bg)] to-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {/* Stat Card 1 */}
                                <div className="bg-white border border-app rounded-2xl p-6 shadow-app hover:shadow-app-md transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-semibold text-muted">Aktive Leads</span>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-light to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Users className="w-6 h-6 text-accent" />
                                        </div>
                                    </div>
                                    <div className="text-4xl font-bold text-[var(--text)] mb-2">247</div>
                                    <div className="flex items-center gap-1 text-success text-sm font-medium">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>+12% diese Woche</span>
                                    </div>
                                </div>

                                {/* Stat Card 2 */}
                                <div className="bg-white border border-app rounded-2xl p-6 shadow-app hover:shadow-app-md transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-semibold text-muted">Kampagnen</span>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-light to-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <BarChart3 className="w-6 h-6 text-success" />
                                        </div>
                                    </div>
                                    <div className="text-4xl font-bold text-[var(--text)] mb-2">12</div>
                                    <div className="flex items-center gap-1 text-info text-sm font-medium">
                                        <Clock className="w-4 h-4" />
                                        <span>3 aktiv</span>
                                    </div>
                                </div>

                                {/* Stat Card 3 */}
                                <div className="bg-white border border-app rounded-2xl p-6 shadow-app hover:shadow-app-md transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-semibold text-muted">Benachrichtigungen</span>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-light to-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Bell className="w-6 h-6 text-warning" />
                                        </div>
                                    </div>
                                    <div className="text-4xl font-bold text-[var(--text)] mb-2">8</div>
                                    <div className="flex items-center gap-1 text-warning text-sm font-medium">
                                        <Sparkles className="w-4 h-4" />
                                        <span>Neu heute</span>
                                    </div>
                                </div>
                            </div>

                            {/* Lead Card */}
                            <div className="bg-white border border-app rounded-2xl p-6 shadow-app hover:shadow-app-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-info flex items-center justify-center shadow-app-md">
                                        <span className="text-xl font-bold text-white">MK</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-lg text-[var(--text)] mb-1">Max Kunde</div>
                                        <div className="text-sm text-muted">max@beispiel.de • +49 123 456789</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="px-4 py-1.5 bg-gradient-to-r from-success-light to-success/10 text-success text-sm font-semibold rounded-full border border-success/20">
                                            Aktiv
                                        </span>
                                        <span className="text-xs text-muted">Zuletzt aktualisiert: Heute</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="max-w-7xl mx-auto px-6 sm:px-8 py-24 scroll-mt-20">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-light border border-accent/20 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-accent">Funktionen</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold text-[#1a1d1f] mb-6">
                        Alles, was Sie brauchen
                    </h2>
                    <p className="text-xl text-[#6b7280] max-w-3xl mx-auto leading-relaxed">
                        Unser Dashboard bietet Ihnen alle Werkzeuge für erfolgreiches Lead-Management
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature Cards */}
                    {[
                        {
                            icon: Users,
                            title: "Lead-Verwaltung",
                            description: "Verwalten Sie alle Ihre Kontakte an einem Ort. Fügen Sie neue Leads hinzu, bearbeiten Sie Informationen und behalten Sie den Überblick.",
                            gradient: "from-accent to-info"
                        },
                        {
                            icon: BarChart3,
                            title: "Kampagnen-Tracking",
                            description: "Organisieren Sie Leads in Kampagnen und verfolgen Sie deren Fortschritt in Echtzeit mit übersichtlichen Dashboards.",
                            gradient: "from-success to-accent"
                        },
                        {
                            icon: Bell,
                            title: "Benachrichtigungen",
                            description: "Bleiben Sie auf dem Laufenden mit Echtzeit-Benachrichtigungen über wichtige Änderungen und Aktivitäten.",
                            gradient: "from-warning to-success"
                        },
                        {
                            icon: Shield,
                            title: "Sicher & Geschützt",
                            description: "Ihre Daten sind mit modernsten Sicherheitsstandards geschützt. Multi-Tenant-Architektur garantiert Datentrennung.",
                            gradient: "from-info to-accent"
                        },
                        {
                            icon: Zap,
                            title: "Schnell & Effizient",
                            description: "Moderne Technologie sorgt für blitzschnelle Ladezeiten und eine reibungslose Benutzererfahrung.",
                            gradient: "from-accent to-warning"
                        },
                        {
                            icon: CheckCircle2,
                            title: "Einfach zu Bedienen",
                            description: "Intuitive Benutzeroberfläche ermöglicht es Ihnen, sofort loszulegen ohne lange Einarbeitung.",
                            gradient: "from-success to-info"
                        }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="group bg-white border border-app rounded-2xl p-8 shadow-app hover:shadow-app-xl transition-all hover:-translate-y-2 duration-300"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-app`}>
                                <feature.icon className="w-8 h-8 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1a1d1f] mb-3">{feature.title}</h3>
                            <p className="text-[#6b7280] leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-6 sm:px-8 py-24">
                <div className="relative rounded-3xl p-12 sm:p-20 text-center shadow-2xl overflow-hidden" style={{
                    background: 'linear-gradient(to right, #4f46e5, #3b82f6, #4f46e5)'
                }}>
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zm0-10c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '60px 60px'
                        }}></div>
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-sm font-semibold text-white">Jetzt starten</span>
                        </div>
                        <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6">
                            Bereit anzufangen?
                        </h2>
                        <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Melden Sie sich an und beginnen Sie noch heute mit der Verwaltung Ihrer Leads
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-accent rounded-xl hover:bg-blue-50 transition-all shadow-app-xl hover:shadow-2xl font-bold text-lg transform hover:scale-105"
                        >
                            Jetzt anmelden
                            <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-app bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-info flex items-center justify-center shadow-app">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-[#1a1d1f]">
                                    Lead Dashboard
                                </span>
                                <p className="text-xs text-[#6b7280]">Professionelles Lead-Management</p>
                            </div>
                        </div>
                        <div className="text-sm text-[#6b7280]">
                            © 2026 Lead Dashboard. Alle Rechte vorbehalten.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
