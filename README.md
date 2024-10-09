# Reforge

## Projektbeschreibung
Diese Webanwendung wurde im Rahmen der Bachelorarbeit "Entwurf und Implementierung einer Webanwendung zur automatisierten Erstellung von TechReports für Abschlussarbeiten" entwickelt. Ziel des Projekts ist es, ein cs-techrep aus hochgeladenen Dateien mithilfe von einer LLM zu generieren.

## Frontend - Funktionen
- **Dateiupload**: Benutzer können entweder eine `.zip`-Datei, die einen LaTeX-Ordner enthält, oder direkt eine `.docx`-Datei hochladen.
- **Parameter-Eingabe**: Vor dem Hochladen müssen bestimmte Informationen angegeben werden:
   - **Autor**: Name des Autors der Datei.
   - **Titel**: Titel des Dokuments.
   - **Main .tex-Datei**: Falls ein LaTeX-Ordner als `.zip` hochgeladen wird, muss zusätzlich die Hauptdatei (`Main.tex`) eingegeben werden.
- **Ausgabeformat**: Der Benutzer kann das gewünschte Ausgabeformat wählen, entweder als LaTeX-Datei (`.tex`) oder als Word-Dokument (`.docx`).

## Installation
- **Repository klonen**:
    git clone https://github.com/cyberlytics/reforge
    cd reforge
- **.env-Datei konfigurieren**:
    OPENAI_API_KEY=dein-openai-api-schluessel
    DEEPL_API_KEY=dein-deepl-api-schluessel
- **Anwendung starten**:
    im backend & im frontend: npm start

## Autor
Autor: Stricker Natalie
Betreuer: Prof. Dr.-Ing. Christoph P. Neumann

