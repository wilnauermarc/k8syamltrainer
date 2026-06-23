import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata = {
  title: "Datenschutz — k8s YAML Trainer",
};

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p className="text-slate-400">Stand: Juni 2026</p>

      <LegalSection title="1. Verantwortlicher">
        <p>
          Marc Wilnauer
          <br />
          Im Brühl 4
          <br />
          79279 Vörstetten
          <br />
          E-Mail:{" "}
          <a
            href="mailto:wilnauermarc@gmail.com"
            className="text-sky-400 underline-offset-2 hover:underline"
          >
            wilnauermarc@gmail.com
          </a>
        </p>
      </LegalSection>

      <LegalSection title="2. Überblick">
        <p>
          Der Kubernetes YAML Trainer ist ein kostenloses Lernangebot im Browser. Es werden{" "}
          <strong className="text-slate-100">keine Benutzerkonten</strong> angelegt und{" "}
          <strong className="text-slate-100">keine personenbezogenen Daten an einen eigenen
          Server</strong> übermittelt. Lernfortschritt und Einstellungen werden ausschließlich lokal
          in deinem Browser gespeichert.
        </p>
      </LegalSection>

      <LegalSection title="3. Lokale Speicherung (localStorage)">
        <p>
          Zur Verbesserung deines Lern-Erlebnisses speichert die Anwendung Daten im{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-200">localStorage</code>{" "}
          deines Browsers. Dabei werden keine personenbezogenen Profile erstellt; gespeichert werden
          nur technische Lern-Daten auf deinem Gerät:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-slate-100">Lernfortschritt</strong> (Übungsversuche, Scores,
            Streaks, Schwachstellen)
          </li>
          <li>
            <strong className="text-slate-100">Einstellungen</strong> (z. B. Pause vor Hinweisen)
          </li>
          <li>
            <strong className="text-slate-100">Welcome-Hinweis</strong> (ob der Willkommens-Dialog
            geschlossen wurde)
          </li>
        </ul>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer
          funktionsfähigen Lernanwendung). Du kannst diese Daten jederzeit löschen, indem du den
          Website-Speicher deines Browsers für diese Seite entfernst.
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies">
        <p>
          Diese Anwendung setzt <strong className="text-slate-100">keine Tracking-Cookies</strong>{" "}
          ein. Es werden keine Analyse- oder Marketing-Cookies verwendet.
        </p>
      </LegalSection>

      <LegalSection title="5. Externe Links">
        <p>
          Auf einigen Seiten können Links zu externen Diensten erscheinen (z. B. LinkedIn, persönliche
          Website, Buy Me a Coffee). Wenn du diese Links anklickst, verlässt du diese Anwendung. Für
          die Datenverarbeitung auf den Zielseiten sind ausschließlich die jeweiligen Anbieter
          verantwortlich. Es gelten deren Datenschutzerklärungen.
        </p>
      </LegalSection>

      <LegalSection title="6. Hosting">
        <p>
          Diese Website wird bei einem externen Hosting-Anbieter betrieben (z. B. Netlify). Beim
          Aufruf der Seite können dabei technisch notwendige Server-Logdaten verarbeitet werden
          (z. B. IP-Adresse, Zeitpunkt des Zugriffs, angeforderte Datei, Browsertyp). Diese
          Verarbeitung dient der Bereitstellung und Sicherheit der Website.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Der Hosting-Anbieter verarbeitet Daten in
          unserem Auftrag; es wird ein Auftragsverarbeitungsvertrag geschlossen, soweit
          erforderlich.
        </p>
      </LegalSection>

      <LegalSection title="7. Schriftarten">
        <p>
          Schriftarten werden über Next.js lokal eingebunden. Beim normalen Betrieb werden dafür keine
          Daten an Google übermittelt.
        </p>
      </LegalSection>

      <LegalSection title="8. Deine Rechte">
        <p>
          Du hast nach der DSGVO insbesondere das Recht auf Auskunft, Berichtigung, Löschung,
          Einschränkung der Verarbeitung, Widerspruch und Datenübertragbarkeit — soweit
          personenbezogene Daten verarbeitet werden.
        </p>
        <p>
          Da wir keine personenbezogenen Kontodaten speichern, betrifft dies vor allem Daten, die du
          uns per E-Mail mitteilst. Du hast zudem das Recht, dich bei einer Datenschutz-Aufsichtsbehörde
          zu beschweren.
        </p>
      </LegalSection>

      <LegalSection title="9. Kontakt Datenschutz">
        <p>
          Bei Fragen zum Datenschutz erreichst du mich unter:{" "}
          <a
            href="mailto:wilnauermarc@gmail.com"
            className="text-sky-400 underline-offset-2 hover:underline"
          >
            wilnauermarc@gmail.com
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
