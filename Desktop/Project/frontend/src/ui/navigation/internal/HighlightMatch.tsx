import Box from '@mui/material/Box';

/**
 * Bolds the matched substring in a result label (Phase 16.4 CommandPalette
 * spec). Presentation-only substring formatting — NOT fuzzy ranking or
 * search logic, which stays in the feature layer.
 *
 * Intentionally duplicated from forms/Autocomplete's identical helper
 * rather than imported: the ui/ dependency law forbids cross-tier imports
 * between sibling composite tiers (forms ↛ navigation), and this is a
 * ~15-line pure-presentation snippet, not a shared abstraction worth a new
 * dependency edge.
 */
export function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <Box component="span" sx={{ fontWeight: 600 }}>
        {text.slice(index, index + query.length)}
      </Box>
      {text.slice(index + query.length)}
    </>
  );
}
