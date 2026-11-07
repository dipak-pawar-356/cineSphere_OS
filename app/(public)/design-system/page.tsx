"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Search,
  Check,
  AlertCircle,
  Play,
  Calendar,
  CreditCard,
  Building2,
  Film,
  Ticket,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OtpInput } from "@/components/ui/otp-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/forms/checkbox";
import { RadioGroup } from "@/components/forms/radio";
import { Switch } from "@/components/forms/switch";
import { Select } from "@/components/forms/select";
import { MultiSelect } from "@/components/forms/multi-select";
import { Slider } from "@/components/forms/slider";
import { Rating } from "@/components/forms/rating";
import { ColorPicker } from "@/components/forms/color-picker";
import { UploadPlaceholder } from "@/components/forms/upload-placeholder";
import { AvatarPicker } from "@/components/forms/avatar-picker";
import { Alert } from "@/components/feedback/alert";
import { Banner } from "@/components/feedback/banner";
import { ConfirmationDialog } from "@/components/feedback/dialog";
import { Tooltip } from "@/components/feedback/tooltip";
import { ProgressBar, CircularLoader } from "@/components/feedback/progress";
import { EnterpriseTable } from "@/components/tables/enterprise-table";
import { UniversalSearch } from "@/components/search/universal-search";
import { Tabs } from "@/components/navigation/tabs";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { DropdownMenu } from "@/components/navigation/dropdown-menu";
import { AnalyticsCard } from "@/components/cards/analytics-card";
import { MiniChartCard, QuickActionCard, SystemStatusCard } from "@/components/dashboard/dashboard-widgets";
import { ActivityTimeline, NotificationList, UserList } from "@/components/lists";
import { Avatar, PosterPlaceholder } from "@/components/media";

export default function DesignSystemShowcase() {
  const [activeTab, setActiveTab] = useState("buttons");
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [radioVal, setRadioVal] = useState("laser");
  const [selectVal, setSelectVal] = useState("imax");
  const [multiVal, setMultiVal] = useState(["atmos", "recliner"]);
  const [sliderVal, setSliderVal] = useState(72);
  const [ratingVal, setRatingVal] = useState(4);
  const [colorVal, setColorVal] = useState("#FBBF24");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sampleTableData = [
    { id: "1", complex: "Apex Grand IMAX", city: "New York, NY", screens: 12, occupancy: "94.2%", health: "Optimal" },
    { id: "2", complex: "Velvet Lumière", city: "Los Angeles, CA", screens: 8, occupancy: "88.6%", health: "Optimal" },
    { id: "3", complex: "Starlight Megaplex", city: "Chicago, IL", screens: 16, occupancy: "79.4%", health: "Attention" },
  ];

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <Breadcrumb items={[{ label: "System Core" }, { label: "Design System Specification" }]} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-[#FBBF24] text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>CineSphere OS Design System v1.0</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Enterprise UI Component Library
            </h1>
            <p className="text-sm text-[#94A3B8] max-w-2xl mt-1">
              Independent, accessible, typed design primitives and tokens built to support all customer, administrative, and operations modules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(true)}>
              Test Dialog Modal
            </Button>
            <DropdownMenu
              trigger={<Button variant="secondary" size="sm">Export Tokens ▾</Button>}
              items={[
                { id: "css", label: "Copy CSS Tokens", onClick: () => alert("CSS Variables Copied") },
                { id: "tailwind", label: "Copy Tailwind v4 Map", onClick: () => alert("Tailwind Tokens Copied") },
                { id: "ts", label: "Export TypeScript Registry", onClick: () => alert("TS Registry Exported"), divider: true },
              ]}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="pt-4 overflow-x-auto">
          <Tabs
            tabs={[
              { id: "buttons", label: "Buttons & Badges" },
              { id: "inputs", label: "Inputs & Forms" },
              { id: "cards", label: "Cards & Telemetry" },
              { id: "feedback", label: "Feedback & Modals" },
              { id: "tables", label: "Tables & Lists" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pill"
          />
        </div>
      </div>

      {/* TAB 1: BUTTONS & BADGES */}
      {activeTab === "buttons" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
            <CardHeader className="p-0 pb-4 border-b border-[#2A3445]">
              <CardTitle>Button System (10 Variants)</CardTitle>
              <CardDescription>
                Enterprise functional buttons supporting loading states, icon placement, rounded, and square shapes.
              </CardDescription>
            </CardHeader>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Surface</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="info">Info</Button>
              <Button variant="dark">Dark</Button>
              <Button variant="light">Light</Button>
            </div>

            <div className="pt-4 border-t border-[#2A3445]/60 flex flex-wrap items-center gap-3">
              <span className="text-xs text-[#94A3B8] w-full font-bold uppercase tracking-wider">
                Sizes & Modifiers
              </span>
              <Button size="xs" variant="primary">XS Button</Button>
              <Button size="sm" variant="primary">SM Button</Button>
              <Button size="md" variant="primary">MD Button</Button>
              <Button size="lg" variant="primary">LG Button</Button>
              <Button size="xl" variant="primary">XL Button</Button>
              <Button variant="primary" isLoading>Loading</Button>
              <Button variant="secondary" iconLeft={<Film className="h-4 w-4" />}>Icon Left</Button>
              <Button variant="secondary" iconRight={<ArrowRight className="h-4 w-4" />}>Icon Right</Button>
              <Button variant="primary" square><Sparkles className="h-4 w-4" /></Button>
              <Button variant="secondary" rounded>Pill Rounded</Button>
            </div>
          </Card>

          {/* Badges */}
          <Card variant="elevated" className="p-6 sm:p-8 space-y-4">
            <CardHeader className="p-0 pb-4 border-b border-[#2A3445]">
              <CardTitle>Badge System</CardTitle>
              <CardDescription>Status and indicator chips with dot support.</CardDescription>
            </CardHeader>

            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="primary" dot>Primary Dot</Badge>
              <Badge variant="success" dot>Confirmed</Badge>
              <Badge variant="warning" dot>Processing</Badge>
              <Badge variant="danger" dot>Cancelled</Badge>
              <Badge variant="info" dot>4K Laser Ingest</Badge>
              <Badge variant="outline">Outline Clean</Badge>
              <Badge variant="solid">Solid Gold</Badge>
              <Badge variant="soft">Soft Muted</Badge>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: INPUTS & FORMS */}
      {activeTab === "inputs" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
            <CardHeader className="p-0 pb-4 border-b border-[#2A3445]">
              <CardTitle>Input Primitives & Validation States</CardTitle>
              <CardDescription>All standard input controls with icon slots and validation states.</CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Standard Input"
                placeholder="Enter multiplex name..."
                leftIcon={<Building2 className="h-4 w-4" />}
              />
              <Input
                type="password"
                placeholder="Enter secure master key..."
                state="default"
              />
              <Input
                placeholder="Validated field"
                value="amc-chicago-east"
                state="success"
                successMessage="Domain identifier validated"
              />
              <Input
                placeholder="Error demonstration"
                value="invalid_port:9999"
                state="error"
                errorMessage="Port conflict: address already bound"
              />
              <Input
                placeholder="Loading state demonstration..."
                isLoading
              />
              <Input
                placeholder="Disabled state..."
                disabled
              />
            </div>

            <div className="pt-4 border-t border-[#2A3445] space-y-3">
              <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider block">
                6-Digit Security OTP
              </span>
              <OtpInput />
            </div>

            <div className="pt-4 border-t border-[#2A3445] space-y-2">
              <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider block">
                Multiline Textarea
              </span>
              <Textarea placeholder="Auditorium throw notes, lens offset details, and acoustic absorption comments..." />
            </div>
          </Card>

          {/* Form Controls */}
          <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
            <CardHeader className="p-0 pb-4 border-b border-[#2A3445]">
              <CardTitle>Form Components & Controls</CardTitle>
              <CardDescription>Checkbox, Radio, Switch, Custom Select, MultiSelect, Sliders, and Uploaders.</CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Checkboxes & Switches */}
              <div className="space-y-4">
                <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider block">
                  Toggles & Checks
                </span>
                <Checkbox
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                  label="Dolby Atmos 128ch Enabled"
                  description="Broadcast 3D spatial coordinate channels"
                />
                <Switch
                  checked={switchChecked}
                  onChange={setSwitchChecked}
                  label="Automated Cleaning Turnaround"
                  description="Enforce 20-minute gap schedule"
                />
              </div>

              {/* Selects & MultiSelect */}
              <div className="space-y-4">
                <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider block">
                  Select Dropdowns
                </span>
                <Select
                  options={[
                    { value: "imax", label: "Laser IMAX Dual-4K" },
                    { value: "4dx", label: "4DX Dynamic Environmental" },
                    { value: "dolby", label: "Dolby Cinema & Atmos" },
                  ]}
                  value={selectVal}
                  onChange={setSelectVal}
                />
                <MultiSelect
                  options={[
                    { value: "atmos", label: "Dolby Atmos" },
                    { value: "recliner", label: "VIP Recliner" },
                    { value: "dine_in", label: "Gourmet Dine-in" },
                    { value: "laser", label: "Laser Projection" },
                  ]}
                  selectedValues={multiVal}
                  onChange={setMultiVal}
                />
              </div>

              {/* Sliders & Ratings */}
              <div className="space-y-4">
                <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider block">
                  Ratios & Metrics
                </span>
                <Slider
                  label="Target Hall Occupancy Threshold"
                  unit="%"
                  value={sliderVal}
                  onChange={setSliderVal}
                />
                <div className="pt-2">
                  <span className="text-xs text-[#94A3B8] block mb-2 font-semibold">
                    Auditorium Experience Rating
                  </span>
                  <Rating value={ratingVal} onChange={setRatingVal} size="lg" />
                </div>
              </div>
            </div>

            {/* Upload and Color Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#2A3445]">
              <UploadPlaceholder label="Drop DCP Projection Key or Manifest" />
              <div className="space-y-4">
                <ColorPicker
                  label="Cinema Brand Accent Color"
                  value={colorVal}
                  onChange={setColorVal}
                />
                <div className="pt-2 flex items-center gap-4">
                  <span className="text-xs text-[#94A3B8]">Avatar Identity:</span>
                  <AvatarPicker />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: CARDS & TELEMETRY */}
      {activeTab === "cards" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCard
              title="Box Office Gross"
              value="$4,892,400"
              change="+24.8%"
              isPositive
              icon={<CreditCard className="h-5 w-5" />}
            />
            <AnalyticsCard
              title="Screen Occupancy"
              value="88.4%"
              change="+6.2%"
              isPositive
              icon={<Film className="h-5 w-5" />}
            />
            <MiniChartCard
              label="Real-time Admissions"
              value="248,910"
              trend="+18.4%"
            />
            <SystemStatusCard />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickActionCard
              title="Provision New Complex"
              description="Deploy a new multi-screen physical location with automated acoustic zoning."
              icon={<Building2 className="h-5 w-5" />}
              actionLabel="Launch Wizard"
              onAction={() => alert("Action triggered")}
            />
            <QuickActionCard
              title="Schedule Theatrical Run"
              description="Matrix balancer to drag-and-drop DCP manifests into hall rosters without collision."
              icon={<Calendar className="h-5 w-5" />}
              actionLabel="Open Matrix"
              onAction={() => alert("Action triggered")}
            />
            <QuickActionCard
              title="Emergency Intermission Protocol"
              description="Remotely broadcast halt signal and emergency house lights across connected auditoriums."
              icon={<AlertCircle className="h-5 w-5" />}
              actionLabel="Trigger Protocol"
              onAction={() => alert("Action triggered")}
            />
          </div>
        </div>
      )}

      {/* TAB 4: FEEDBACK & MODALS */}
      {activeTab === "feedback" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
            <CardHeader className="p-0 pb-4 border-b border-[#2A3445]">
              <CardTitle>Enterprise Banners & Alerts</CardTitle>
              <CardDescription>Inline and floating notification signals for system operations.</CardDescription>
            </CardHeader>

            <div className="space-y-4">
              <Banner
                type="info"
                title="DCP Ingest Underway"
                action={<Button size="xs" variant="primary">View Manifest</Button>}
              >
                Screen 4 is downloading 4K Laser encrypted package for Chrono Nexus (42% completed).
              </Banner>

              <Alert type="success" title="Cluster Calibrated">
                All 154 projection nodes are communicating over high-speed telemetry channels.
              </Alert>

              <Alert type="warning" title="Lamp Hour Warning">
                Auditorium 2 xenon bulb reached 1,450 hours. Replacement recommended within 48 hours.
              </Alert>

              <Alert type="danger" title="Audio Processor Mismatch">
                Dolby CP950 at Waterfront Pavilion reported buffer underflow. Fallback analog stereo engaged.
              </Alert>
            </div>

            <div className="pt-6 border-t border-[#2A3445] flex items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#94A3B8]">Progress Bar:</span>
                <div className="w-48">
                  <ProgressBar value={76} label="Reel Sync" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#94A3B8]">Circular Loader:</span>
                <CircularLoader size={28} />
              </div>

              <Tooltip content="Tooltip demonstration on enterprise button">
                <Button size="sm" variant="secondary">Hover for Tooltip</Button>
              </Tooltip>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: TABLES & LISTS */}
      {activeTab === "tables" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <EnterpriseTable
            columns={[
              { key: "complex", header: "Complex Name", sortable: true },
              { key: "city", header: "Metropolitan Location" },
              { key: "screens", header: "Screens", align: "center" },
              { key: "occupancy", header: "Prime Fill Rate", align: "right" },
              {
                key: "health",
                header: "Telemetry",
                align: "right",
                render: (row) => (
                  <Badge variant={row.health === "Optimal" ? "success" : "warning"} dot size="sm">
                    {row.health}
                  </Badge>
                ),
              },
            ]}
            data={sampleTableData}
            keyExtractor={(r) => r.id}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="elevated" className="p-6">
              <h4 className="text-sm font-bold text-white mb-4">Live Activity Timeline</h4>
              <ActivityTimeline
                items={[
                  { id: "1", title: "IMAX Laser Calibration Complete", description: "Apex Grand Hall 1 passed THX certification scan", timestamp: "4m ago" },
                  { id: "2", title: "Box Office Milestone Cleared", description: "Weekend presale threshold crossed $1,400,000", timestamp: "18m ago" },
                  { id: "3", title: "New Release Manifest Published", description: "Aetheria: Sky Kingdom scheduled on 112 screens", timestamp: "1h ago" },
                ]}
              />
            </Card>

            <Card variant="elevated" className="p-6">
              <h4 className="text-sm font-bold text-white mb-4">Operations Notification Feed</h4>
              <NotificationList
                items={[
                  { id: "1", title: "Cleaning Buffer Alert", message: "Hall 3 requires turn around before 8:30 PM show", timestamp: "2m ago", isUnread: true },
                  { id: "2", title: "VIP Lounger Sensor", message: "Seat E14 motor obstruction cleared by staff", timestamp: "25m ago", isUnread: false },
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Demo */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() => alert("Confirmed operational command")}
        title="Emergency Intermission Broadcast"
        description="This will pause projection in Hall 1 and trigger house illumination at 50% lux."
        confirmLabel="Execute Pause"
        isDestructive
      />
    </div>
  );
}
