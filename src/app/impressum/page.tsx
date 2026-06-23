import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata = {
  title: "Impressum — k8s YAML Trainer",
};

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <LegalSection title="Angaben gemäß § 5 DDG">
        <p>
          <strong className="text-slate-100">Marc Wilnauer</strong>
          <br />
          Im Brühl 4
          <br />
          79279 Vörstetten
          <br />
          Deutschland
        </p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          E-Mail:{" "}
          <a
            href="mailto:wilnauermarc@gmail.com"
            className="text-sky-400 underline-offset-2 hover:underline"
          >
            wilnauermarc@gmail.com
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>
          Marc Wilnauer
          <br />
          Im Brühl 4
          <br />
          79279 Vörstetten
        </p>
      </LegalSection>

      <LegalSection title="Haftung für Inhalte">
        <p>
          Als Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten
          nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG bin ich als
          Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
          Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
          Tätigkeit hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
          allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
          erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
          Bekanntwerden von entsprechenden Rechtsverletzungen werde ich diese Inhalte umgehend
          entfernen.
        </p>
      </LegalSection>

      <LegalSection title="Haftung für Links">
        <p>
          Dieses Angebot enthält Links zu externen Websites Dritter (z. B. LinkedIn, persönliche
          Website, Buy Me a Coffee), auf deren Inhalte ich keinen Einfluss habe. Deshalb kann ich
          für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
          Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
        </p>
      </LegalSection>

      <LegalSection title="Urheberrecht">
        <p>
          Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
          der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
          Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
