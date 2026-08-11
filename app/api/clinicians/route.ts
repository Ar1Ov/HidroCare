import { NextRequest, NextResponse } from "next/server";

const NPI_API = "https://npiregistry.cms.hhs.gov/api/";

type NpiResult = {
  number?: string;
  basic?: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    name_suffix?: string;
    credential?: string;
    status?: string;
  };
  addresses?: Array<{
    address_purpose?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    telephone_number?: string;
  }>;
  taxonomies?: Array<{
    desc?: string;
    primary?: boolean;
    state?: string;
    license?: string;
  }>;
};

function clean(value: string | null, pattern: RegExp, maxLength: number) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length <= maxLength && pattern.test(trimmed) ? trimmed : "";
}

function namePart(value?: string) {
  if (!value || value === "--") return "";
  return value.toLowerCase().replace(/(^|[ '-])\p{L}/gu, (letter) => letter.toUpperCase());
}

export async function GET(request: NextRequest) {
  const city = clean(request.nextUrl.searchParams.get("city"), /^[a-zA-Z .'-]*$/, 60);
  const state = clean(request.nextUrl.searchParams.get("state"), /^[a-zA-Z]{0,2}$/, 2).toUpperCase();
  const postalCode = clean(request.nextUrl.searchParams.get("postalCode"), /^\d{0,5}$/, 5);

  if (!city && !state && !postalCode) {
    return NextResponse.json({ error: "Enter a city, state, or ZIP code." }, { status: 400 });
  }

  const params = new URLSearchParams({
    version: "2.1",
    enumeration_type: "NPI-1",
    taxonomy_description: "Dermatology",
    address_purpose: "LOCATION",
    country_code: "US",
    limit: "50",
  });
  if (city) params.set("city", city);
  if (state) params.set("state", state);
  if (postalCode) params.set("postal_code", postalCode);

  try {
    const response = await fetch(`${NPI_API}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86_400 },
    });
    if (!response.ok) throw new Error(`NPI Registry returned ${response.status}`);
    const payload = (await response.json()) as { results?: NpiResult[] };
    const clinicians = (payload.results ?? []).map((record) => {
      const basic = record.basic ?? {};
      const location = record.addresses?.find((address) => address.address_purpose === "LOCATION") ?? record.addresses?.[0];
      const primaryTaxonomy = record.taxonomies?.find((taxonomy) => taxonomy.primary) ?? record.taxonomies?.[0];
      const name = [basic.first_name, basic.middle_name, basic.last_name, basic.name_suffix]
        .map(namePart)
        .filter(Boolean)
        .join(" ");
      return {
        npi: record.number ?? "",
        name,
        credentials: basic.credential ?? "",
        specialty: primaryTaxonomy?.desc ?? "Dermatology",
        status: basic.status ?? "",
        address: [location?.address_1, location?.address_2].filter(Boolean).join(", "),
        city: location?.city ?? "",
        state: location?.state ?? "",
        postalCode: location?.postal_code?.slice(0, 5) ?? "",
        phone: location?.telephone_number ?? "",
        licenseState: primaryTaxonomy?.state ?? "",
        license: primaryTaxonomy?.license ?? "",
      };
    });
    return NextResponse.json({ clinicians });
  } catch (error) {
    console.error("NPI clinician search failed", error);
    return NextResponse.json({ error: "The NPI Registry could not be reached. Please try again shortly." }, { status: 502 });
  }
}
