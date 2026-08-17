import { describe, expect, it } from "vitest";
import { parseIcsStages } from "../stage-parsers/ics";
import { parseJsonLdStages } from "../stage-parsers/jsonld";
import {
  detectExplicitLanguage,
  isEligibleStageTitle,
  parseLooseStageHtml,
} from "../stage-parsers/shared";
import {
  parseShvOfferPayload,
  parseShvTrainingHtml,
} from "../stage-parsers/shv";
import {
  parseBhpaCourses,
  parseDatedLinkCalendar,
  parseHeadingMonthSchedule,
  parseItalianDatedArticle,
  parseProAeroCourse,
  parseSpanishEventTable,
  parseWooCommerceCourseCards,
} from "../stage-parsers/specialized";
import type { StageSourceDefinition } from "../stage-source-registry";

const source: StageSourceDefinition = {
  id: "test-source",
  name: "École test",
  organizerCountry: "Suisse",
  organizerType: "school",
  url: "https://example.com/calendar",
  parser: "jsonld",
  language: null,
  active: true,
  defaults: {
    location: "Alpes",
    department: "Alpes",
    region: "Alpes",
    country: "Suisse",
  },
};

describe("stage eligibility", () => {
  it("keeps training and coached travel", () => {
    expect(isEligibleStageTitle("Stage SIV avancé")).toBe(true);
    expect(isEligibleStageTitle("Thermal coaching week in Spain")).toBe(true);
  });

  it("rejects competitions, tandem discovery flights and free outings", () => {
    expect(isEligibleStageTitle("Belgian Paragliding Open 2026")).toBe(false);
    expect(isEligibleStageTitle("Vol biplace découverte")).toBe(false);
    expect(isEligibleStageTitle("Sortie libre du club")).toBe(false);
  });
});

describe("detectExplicitLanguage", () => {
  it("only returns a language when the offer publishes it", () => {
    expect(detectExplicitLanguage("Briefing and coaching in English")).toBe("en");
    expect(detectExplicitLanguage("Unterrichtssprache: Deutsch")).toBe("de");
    expect(detectExplicitLanguage("Curso de parapente en Àger")).toBeNull();
  });
});

describe("parseShvTrainingHtml", () => {
  it("extracts dated training offers from the federation cards", () => {
    const html = `
      <div class="map-items-list">
        <a class="map-item" href="/einfach-finden/angebot/siku-intensiv/">
          <div class="travel-cats"><span class="travel-cat">Coaching | </span><span class="travel-cat">SiKus</span></div>
          <div class="travel-text">
            <h2>SIKU Intensivtraining (EN)</h2>
            <p>20.08.2026 - 23.08.2026<br />Urmiberg, Brunnen<br/></p>
            <p><strong>Fr. 1&#039;090.00</strong></p>
          </div>
        </a>
      </div>`;
    const [stage] = parseShvTrainingHtml(
      html,
      { ...source, parser: "shv" },
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );

    expect(stage).toMatchObject({
      title: "SIKU Intensivtraining (EN)",
      startDate: "2026-08-20",
      endDate: "2026-08-23",
      location: "Urmiberg, Brunnen",
      country: "Suisse",
      language: "en",
      price: 1090,
      currency: "CHF",
      discipline: "SIV / Pilotage",
      sourceUrl: "https://example.com/einfach-finden/angebot/siku-intensiv/",
    });
  });

  it("extracts the live federation JSON feed with coordinates", () => {
    const [stage] = parseShvOfferPayload(
      JSON.stringify([
        {
          title: "SIKU BRIEFING UND SIMULATIONSTAG (EN)",
          offerStartDate: "18.08.2026",
          offerEndDate: "18.08.2026",
          location: "Dallenwil",
          countriesShort: "Switzerland",
          price: "Fr. 120.00",
          uri: "/en/einfach-finden/angebot/siku-en/",
          latitude: "46.9266909",
          longitude: "8.3887447",
          categories: [{ title: "SiKus" }],
          user: {
            firstName: "Flugschule",
            lastName: "touch and go...",
          },
        },
      ]),
      { ...source, parser: "shv" },
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );

    expect(stage).toMatchObject({
      title: "SIKU BRIEFING UND SIMULATIONSTAG (EN)",
      country: "Suisse",
      language: "en",
      price: 120,
      currency: "CHF",
      organizer: "Flugschule touch and go...",
      organizerType: "school",
      latitude: 46.9266909,
      longitude: 8.3887447,
      locationPrecision: "exact",
    });
  });
});

describe("specialized official calendars", () => {
  it("extracts BHPA qualification course rows", () => {
    const html = `<table><tr class="tr2"><td>24 - 25 October 2026</td><td>Club Coach Course</td><td>Kernow / South Devon</td><td>Contact</td></tr></table>`;
    const [stage] = parseBhpaCourses(
      html,
      { ...source, parser: "bhpa", organizerCountry: "Royaume-Uni", language: "en" },
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );
    expect(stage).toMatchObject({
      title: "Club Coach Course",
      startDate: "2026-10-24",
      endDate: "2026-10-25",
      location: "Kernow / South Devon",
      language: "en",
      discipline: "Qualification",
    });
  });

  it("extracts dated WooCommerce course cards, prices and mixed-month ranges", () => {
    const html = `<h2 class="woocommerce-loop-product__title"><a href="/shop/siv-1">26th Sept &#8211; 2nd Oct 2026 &#8211; SIV/ACRO</a></h2><span class="price">£1,095.00</span>`;
    const [stage] = parseWooCommerceCourseCards(
      html,
      { ...source, organizerCountry: "Royaume-Uni", language: "en", defaults: { ...source.defaults, location: "Ölüdeniz", country: "Turquie" } },
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );
    expect(stage).toMatchObject({
      startDate: "2026-09-26",
      endDate: "2026-10-02",
      language: "en",
      price: 1095,
      currency: "GBP",
      country: "Turquie",
    });
  });

  it("extracts the Italian PRO AERO course from its labelled fields", () => {
    const html = `<h1>Corso PRO AERO 2026</h1><p><strong>Sede del corso:</strong><br>Scuola PINK BARON, 6825 Capolago / TI</p><p><strong>Lingua del corso:</strong><br>Italiano</p><p><strong>Date del corso:</strong><br>02. - 07.11.2026</p>`;
    const [stage] = parseProAeroCourse(
      html,
      { ...source, parser: "pro-aero", language: "it" },
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );
    expect(stage).toMatchObject({
      title: "Corso PRO AERO 2026",
      startDate: "2026-11-02",
      endDate: "2026-11-07",
      location: "Capolago",
      language: "it",
      price: null,
    });
  });

  it("keeps a single published start date when an article omits the end date", () => {
    const html = `<h1>Corso parapendio autunno 2026</h1><meta name="description" content="Aperte le iscrizioni. Inizio 5 settembre.">`;
    const [stage] = parseItalianDatedArticle(
      html,
      { ...source, language: "it", defaults: { ...source.defaults, location: "Monte Grappa", country: "Italie" } },
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );
    expect(stage).toMatchObject({
      title: "Corso parapendio autunno 2026",
      startDate: "2026-09-05",
      endDate: "2026-09-05",
      language: "it",
    });
  });

  it("extracts Spanish WooCommerce event tables and sold-out status", () => {
    const html = `<tr class="product-type-simple"><td><span>17 - 20</span><span>agosto</span></td><td><h3><a href="/curso-siv-8/">CURSO SIV</a></h3><span>17 de agosto de 2026</span><span>20 de agosto de 2026</span><bdi>790,00<span>&euro;</span></bdi><span>Tickets are not available</span></td></tr>`;
    const [stage] = parseSpanishEventTable(
      html,
      { ...source, language: "es", defaults: { ...source.defaults, location: "Organyà", country: "Espagne" } },
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );
    expect(stage).toMatchObject({
      title: "CURSO SIV",
      startDate: "2026-08-17",
      endDate: "2026-08-20",
      price: 790,
      currency: "EUR",
      availability: "full",
      language: "es",
    });
  });

  it("extracts German dated calendar links", () => {
    const html = `<a href="/termine/siv-18">Gleitschirm Sicherheitstraining S18 22.08.2026 – 27.08.2026</a>`;
    const [stage] = parseDatedLinkCalendar(
      html,
      { ...source, language: "de", organizerCountry: "Allemagne", defaults: { ...source.defaults, location: "Allgäu", country: "Allemagne" } },
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );
    expect(stage).toMatchObject({
      startDate: "2026-08-22",
      endDate: "2026-08-27",
      language: "de",
      country: "Allemagne",
    });
  });

  it("extracts month-grouped SIV dates and full status", () => {
    const html = `<h1>Dates for our SIV course.</h1><h2>September 2026</h2><h5>23rd – 25th – FULLY BOOKED</h5><h5>27th – 29th</h5>`;
    const stages = parseHeadingMonthSchedule(
      html,
      { ...source, language: "en", defaults: { ...source.defaults, location: "Lake Garda", country: "Italie" } },
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );
    expect(stages).toHaveLength(2);
    expect(stages[0]).toMatchObject({
      startDate: "2026-09-23",
      endDate: "2026-09-25",
      availability: "full",
      language: "en",
    });
  });
});

describe("parseJsonLdStages", () => {
  it("extracts an EducationEvent and explicit teaching language", () => {
    const html = `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationEvent",
      name: "Curso SIV avanzado",
      inLanguage: "es",
      startDate: "2026-09-03",
      endDate: "2026-09-06",
      location: {
        "@type": "Place",
        name: "Organyà",
        address: { addressRegion: "Cataluña", addressCountry: "España" },
      },
      offers: {
        price: "790.00",
        priceCurrency: "EUR",
        availability: "https://schema.org/SoldOut",
        url: "https://example.com/curso-siv",
      },
    })}</script>`;

    const [stage] = parseJsonLdStages(
      html,
      source,
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );

    expect(stage).toMatchObject({
      title: "Curso SIV avanzado",
      language: "es",
      startDate: "2026-09-03",
      endDate: "2026-09-06",
      location: "Organyà",
      region: "Cataluña",
      country: "Espagne",
      price: 790,
      currency: "EUR",
      availability: "full",
    });
  });
});

describe("parseIcsStages", () => {
  it("extracts a future training event and its explicit language", () => {
    const ics = `BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:italy-1\r\nDTSTART;VALUE=DATE:20260912\r\nDTEND;VALUE=DATE:20260915\r\nSUMMARY;LANGUAGE=it:Corso parapendio avanzato\r\nLOCATION:Bassano del Grappa, Italia\r\nURL:https://example.com/corso\r\nEND:VEVENT\r\nEND:VCALENDAR`;

    const [stage] = parseIcsStages(
      ics,
      { ...source, parser: "ics", organizerCountry: "Italie" },
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );

    expect(stage).toMatchObject({
      title: "Corso parapendio avanzato",
      language: "it",
      startDate: "2026-09-12",
      endDate: "2026-09-14",
      location: "Bassano del Grappa",
      country: "Italie",
      sourceUrl: "https://example.com/corso",
    });
  });
});

describe("parseLooseStageHtml", () => {
  it("extracts a dated stage card while leaving language unknown", () => {
    const html = `<article><h2>Curso de perfeccionamiento térmico</h2><p>17/09/2026 - 20/09/2026</p><p>Àger, España</p><a href="/curso-termica">Detalles</a></article>`;
    const [stage] = parseLooseStageHtml(
      html,
      { ...source, parser: "loose", organizerCountry: "Espagne" },
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
    );

    expect(stage).toMatchObject({
      title: "Curso de perfeccionamiento térmico",
      startDate: "2026-09-17",
      endDate: "2026-09-20",
      language: null,
    });
  });
});
