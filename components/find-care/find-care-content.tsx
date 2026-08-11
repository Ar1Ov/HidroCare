"use client";

import { useState } from "react";
import { Building2, ExternalLink, Loader2, MapPin, Phone, Search, ShieldCheck, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

const IHHS_FINDER = "https://www.sweathelp.org/taking-action/find-a-clinician.html";

const US_STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
  ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
  ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
  ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
  ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
] as const;

type Clinician = {
  npi: string;
  name: string;
  credentials: string;
  specialty: string;
  status: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  licenseState: string;
  license: string;
};

export function FindCareContent() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function search(event: React.FormEvent) {
    event.preventDefault();
    if (!city.trim() && !state.trim() && !postalCode.trim()) {
      setError("Enter a city, state, or ZIP code.");
      return;
    }
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (city.trim()) params.set("city", city.trim());
    if (state.trim()) params.set("state", state.trim());
    if (postalCode.trim()) params.set("postalCode", postalCode.trim());
    try {
      const response = await fetch(`/api/clinicians?${params.toString()}`);
      const payload = (await response.json()) as { clinicians?: Clinician[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Search failed.");
      setClinicians(payload.clinicians ?? []);
      setSearched(true);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 py-6 md:py-10">
      <section className="rounded-3xl border border-teal-200/70 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6 shadow-lg dark:border-teal-800/50 dark:from-teal-950/60 dark:via-slate-900 dark:to-cyan-950/40 sm:p-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-sm font-semibold text-teal-800 dark:border-teal-700 dark:bg-slate-900/70 dark:text-teal-200"><Stethoscope className="h-4 w-4" /> U.S. Dermatologist Finder</div>
          <h1 className="text-3xl font-bold tracking-tight text-teal-950 dark:text-teal-50 sm:text-4xl">Find a dermatologist near you</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground"><span className="font-semibold text-foreground">Searching in the United States?</span> Search public U.S. dermatologist records from the CMS National Plan and Provider Enumeration System.</p>
          <form onSubmit={search} className="mx-auto mt-7 grid max-w-4xl gap-3 sm:grid-cols-[1fr_200px_140px_auto]">
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" aria-label="City" className="h-12 rounded-xl border border-teal-300 bg-white px-4 text-foreground outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-teal-700 dark:bg-slate-900" />
            <select value={state} onChange={(event) => setState(event.target.value)} aria-label="State" className="h-12 rounded-xl border border-teal-300 bg-white px-3 text-foreground outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-teal-700 dark:bg-slate-900">
              <option value="">State</option>
              {US_STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
            <input value={postalCode} onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="ZIP code" aria-label="ZIP code" inputMode="numeric" maxLength={5} className="h-12 rounded-xl border border-teal-300 bg-white px-4 text-foreground outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-teal-700 dark:bg-slate-900" />
            <Button type="submit" size="lg" disabled={loading} className="h-12 gap-2 bg-teal-600 px-6 hover:bg-teal-700">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />} Search</Button>
          </form>
          {error && <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-teal-300 bg-teal-50/80 p-5 dark:border-teal-700 dark:bg-teal-950/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">Outside the United States or looking specifically for hyperhidrosis experience?</p><p className="mt-1 text-sm text-muted-foreground">Use the International Hyperhidrosis Society’s international Clinician Finder to search for clinicians who report familiarity with hyperhidrosis.</p></div>
          <a href={IHHS_FINDER} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-center text-sm font-semibold text-white hover:bg-teal-700">Open IHhS Clinician Finder <ExternalLink className="h-4 w-4" /></a>
        </div>
      </section>

      {searched && <div><h2 className="text-xl font-bold">Search results</h2><p className="mt-1 text-sm text-muted-foreground">{clinicians.length} dermatologist {clinicians.length === 1 ? "record" : "records"} found</p></div>}
      {searched && clinicians.length === 0 && <div className="rounded-2xl border border-dashed p-10 text-center"><Building2 className="mx-auto h-9 w-9 text-teal-600" /><h3 className="mt-3 font-semibold">No dermatologists found</h3><p className="mt-2 text-sm text-muted-foreground">Try searching with fewer fields or a nearby city or ZIP code.</p></div>}
      <section className="grid gap-5 lg:grid-cols-2">
        {clinicians.map((clinician) => (
          <article key={clinician.npi} className="rounded-2xl border border-teal-200/70 bg-card p-6 shadow-sm dark:border-teal-800/50">
            <div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-bold text-teal-950 dark:text-teal-50">{clinician.name}{clinician.credentials ? `, ${clinician.credentials}` : ""}</h3><p className="mt-1 text-sm font-medium text-teal-700 dark:text-teal-300">{clinician.specialty}</p></div>{clinician.status === "A" && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Active NPI</span>}</div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">{clinician.address && <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span>{clinician.address}<br />{[clinician.city, clinician.state, clinician.postalCode].filter(Boolean).join(", ")}</span></p>}{clinician.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" /><a href={`tel:${clinician.phone}`} className="hover:underline">{clinician.phone}</a></p>}</div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span>NPI: {clinician.npi}</span>{clinician.licenseState && <span>License state: {clinician.licenseState}</span>}</div>
            <a href={`https://npiregistry.cms.hhs.gov/provider-view/${clinician.npi}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300">View official NPI record <ExternalLink className="h-3.5 w-3.5" /></a>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"><h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" /> Important</h2><p className="mt-1 leading-relaxed">NPI Registry results show public federal provider records. CMS states that having an NPI does not validate licensing or credentials, and these results do not establish hyperhidrosis expertise. Verify credentials and contact the office to ask whether the clinician currently treats hyperhidrosis before booking.</p><p className="mt-3 text-xs">Source: CMS NPPES NPI Registry API, version 2.1. HidroCare is not affiliated with CMS or IHhS.</p></section>
    </div>
  );
}
