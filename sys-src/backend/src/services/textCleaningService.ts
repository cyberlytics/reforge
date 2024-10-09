export function cleanDocxText(html: string): string {
    // Regex für (h1-h6) und p-Tags
    const headingAndParagraphRegex = /<(h[1-6]|p)[^>]*>(.*?)<\/\1>/gi;
  
    // Überschriften & p-Tags rausfiltern
    const matches: RegExpMatchArray | null = html.match(headingAndParagraphRegex);
  
    // leerer String wenn keine übereinstimmung
    if (!matches) {
      return '';
    }
    // Entferne <img>, <a> innerhalb von p
    const cleanedMatches = matches.map(match => {
      return match.replace(/<img[^>]*>|<a[^>]*>(.*?)<\/a>/gi, '$1');
    });
  
    // Entferne []
    const finalResult = cleanedMatches.map(match => match.replace(/\[.*?\]/g, ''));
  
    return finalResult.join('');
}
  
export function cleanLatexText(latexContent: string): string {
    // lösche alles vor \chapter{}
    const chapterStartIndex = latexContent.search(/\\chapter\{/);
    if (chapterStartIndex !== -1) {
      latexContent = latexContent.substring(chapterStartIndex);
    }
  
    // Regex für commands
    const commandRegex = /\\[a-zA-Z]+\{[^}]*\}|\\[a-zA-Z]+\[[^\]]*\]|\\[a-zA-Z]+/g;
    // Regex für kommentare
    const commentRegex = /%.*$/gm;
    // Regex für begin & end
    const beginRegex = /\\begin\{[^}]*\}[\s\S]*?\\end\{[^}]*\}/g;
    // Regex für whitespace
    const whitespaceRegex = /\s+/g;
    
    let filteredContent = latexContent
      // Entfernt Kommentare
      .replace(commentRegex, '')
      // Entfernt Begin/End
      .replace(beginRegex, '')
      // Entfernt Commands außer Chapter
      .replace(commandRegex, (match) => {
        return match.startsWith('\\chapter{') ? match : '';
      })
      // Entfernt whitespace
      .replace(whitespaceRegex, ' ')
      .trim();
    
    return filteredContent;
}

export function removeSpecialChars(section: string): string {
    // entfernt '1.' '2.' etc. am anfang von einer section und special chars
    return section.replace(/\\section\{\d+\.\s*/g, '\\section{').replace(/[&#%_^~$]/g, '');
}