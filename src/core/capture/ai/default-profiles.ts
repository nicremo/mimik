import type { ContextProfile } from './context-profiles';

// Built-in background context shipped with this local build. Used as the
// fallback when the user has never saved their own profiles. Once the user
// saves in Settings (even an empty list), their choice takes over and these
// defaults no longer apply, so deleting a profile sticks.
const BLUNATECH_CONTEXT = `BACKGROUND-CONTEXT: BLUNATECH (app.blunatech.com)

1. WAS IST BLUNATECH
BLUNATECH ist eine deutschsprachige SaaS-Web-App für Marketing von kleinen und mittleren Unternehmen (KMU). Nutzer planen ihr Marketing-Jahr, erstellen und versenden Newsletter und Briefe, pflegen Kontakte und bauen Anmeldeseiten. Vieles wird per KI aus dem Firmenprofil vorgeneriert. Alle UI-Texte sind deutsch (Siezen). Benutze beim Beschreiben immer die echten Produkt- und Feature-Namen unten, nicht generische Begriffe.

2. HAUPTBEREICHE & SEITEN (Sidebar-Label -> Route -> was man dort tut)
- Angaben für BLUNATECH (/onboarding/basics): Firmenprofil-Onboarding in 8 Schritten (Grundlagen, Identität, Zielgruppe, Stil, Ihre Inhalte, Emotion, Branding, Praktisch); KI kann Website analysieren und vorausfüllen.
- Erste Standortbestimmung (/erste-standortbestimmung): kurzes Marketing-Assessment.
- Vollständige Standortbestimmung (/standortbestimmung): großer KI-Marketing-Report in 17 Kapiteln im Buch-Format, mit PDF-Export und Teilen.
- BLUNATECH Werkstatt (/dashboard): Startseite, Marketing-Jahresplan als 12-Monats-Grid mit allen Kampagnen, Unternehmensübersicht, Achievements.
- BLUNATECH Briefe (/briefe): Liste persönlich wirkender Plain-Text-E-Mails (kein Design-Builder), nur im Profi-Modus.
- BLUNATECH Analytics (/analytics): Auswertungen, nur Profi-Modus.
- Kommunikationsschwerpunkt (/kommunikations-schwerpunkt): 1 bis 3 Themen-Prioritäten wählen, die die KI-Jahresplanung steuern.
- BLUNATECH Redaktion (/redaktion): redaktionelle Inhalte und Newsletter-Content per KI.
- BLUNATECH Maßnahmen (/massnahmen): durchsuchbare Bibliothek hunderter Marketing-Maßnahmen (Aktionen), Kategorien U/K/R/T/G/Q/P.
- Newsletter / "BLUNATECH Letter" (/newsletter): Liste aller visuellen Newsletter mit Status und Statistiken; Editor zum Bauen und Versenden.
- Kontakte (/kontakte): Tabelle der E-Mail-Kontakte (Abonnenten), Import/Export, Listen, Karteikarten.
- Kontakt Booster (/kontakt-booster): Baukasten für öffentliche Anmeldeseiten (Landing-Pages) mit QR-Code und Google-Rezensions-Variante.
- Einstellungen (/account): Konto-Verwaltung mit Tabs Profil, Sicherheit, Versand, Abo, Präferenzen.
- Nachfrageanalyse (/nachfrageanalyse): Suchvolumen und Trends per Keyword.

Account-Tabs: Profil, Sicherheit, Versand, Abo, Präferenzen.
Kampagnen-Editor-Tabs: Allgemein, je ein Tab pro Maßnahme, Doku.
Kontakt-Booster-Editor-Tabs: Bearbeiten, Vorschau, Übersicht, Teilen, Statistiken.

3. WICHTIGE BEGRIFFE / ENTITÄTEN
- Maßnahme: einzelne Marketing-Aktion aus der Bibliothek; kann einem Newsletter/Kampagnen-Monat zugewiesen werden. "Eigene Idee" = selbst erstellte Maßnahme.
- Kampagne: ein geplanter Newsletter-Versand (Datum, Empfänger, Blöcke, Maßnahmen).
- Newsletter / BLUNATECH Letter: visuelle Marketing-E-Mail aus dem Builder.
- Brief: einfache Text-E-Mail ohne Design-Wrapper.
- Kontakt / Abonnent / Empfänger: Person auf der E-Mail-Liste.
- Kontaktseite / Anmeldeseite: öffentliche Landing-Page (Double-Opt-in) zum Eintragen in die Liste.
- Jahresplan: Maßnahmen-Übersicht über 12 Monate.
- Kommunikationsschwerpunkt: Prioritäten, die die Planung steuern.
- Standortbestimmung: Marketing-Analyse/Report.
- Nachfrageanalyse: Markt-/Suchnachfrage-Auswertung.

Status-Begriffe Newsletter: Entwurf, Bereit, Geplant, Gesendet.
Status-Begriffe Kontakte/Briefe: Aktive, Abgemeldet, Ausstehend, Nicht verfügbar; Brief-Filter: Alle, Entwurf, Geplant, Versendet.

4. TYPISCHE AKTIONEN / BUTTON-LABELS (echte Strings)
Allgemein: Speichern, Abbrechen, Zurück, Weiter, Löschen, Bearbeiten, Schließen, Vorschau, Erstellen, Hinzufügen, Kopieren, Teilen, Duplizieren, Aktualisieren, Bestätigen, Anwenden, Herunterladen, Drucken, Exportieren, Import.
Newsletter/Versand: Fastlane, Manuell erstellen, Generieren, Text verbessern, Test senden, Senden, Jetzt senden, Einplanen, Jetzt einplanen, Statistiken anzeigen.
Planung/Maßnahmen: Kampagne erstellen, Maßnahme hinzufügen, Maßnahme suchen..., Zurück zur Kampagne, Prioritäten speichern, Jahresplan aktualisieren, Alles neu berechnen.
Kontakte: Kontakt (neu), Kontakt hinzufügen, Zu Liste, Karteikarte öffnen.
Kontakt Booster: Neue Kontaktseite, Google Rezension, Google-Rezensions-QR erstellen, Link kopieren, QR-Code, Über WhatsApp teilen, Per E-Mail teilen, Zur Übersicht, Jetzt anmelden.
Standortbestimmung: Analyse jetzt erstellen, Inhaltsverzeichnis, Als PDF speichern, Link kopieren.
Account/Abo: BLUNATECH freischalten, Jetzt ansehen, Profi-Modus aktivieren, Advanced-Modus.
Auth/Konto: Abmelden, Passwort zurücksetzen, Neues Passwort festlegen.

5. ROLLEN / MODI / VOKABULAR
- Profi-Modus / Advanced-Modus: schaltet erweiterte Bereiche frei (z.B. BLUNATECH Briefe, BLUNATECH Analytics).
- Demo-Konto vs. aktives Abo (Stripe): manche Funktionen erst nach Freischaltung.
- Werkstatt = das Dashboard (Startseite).
- Fastlane = KI-Schnellgenerierung von Newsletter-Varianten aus dem Firmenprofil.
- Auto-Versand = geplanter Newsletter geht am Termin automatisch raus.
- HCVO = EU-Health-Claims-Verordnung, Pflichtbestätigung vor Versand bei Gesundheits-/NEM-Kunden.
- Double-Opt-in = Anmeldung wird per Bestätigungs-E-Mail bestätigt.
- QR-Code = verlinkt auf die öffentliche Anmeldeseite.

Hinweis zum Stil der Schritt-Sätze: kurz, im Imperativ, mit echtem Label in Anführungszeichen, z.B. "Klicke in der Seitenleiste auf 'BLUNATECH Maßnahmen'." oder "Klicke auf 'Test senden'." Verwende den Bereichsnamen aus Abschnitt 2, wenn der Klick eine Navigation ist.`;

export const DEFAULT_CONTEXT_PROFILES: ContextProfile[] = [
  {
    id: 'blunatech-default',
    name: 'BLUNATECH',
    urlPattern: 'app.blunatech.com',
    context: BLUNATECH_CONTEXT,
    enabled: true,
  },
];
