import { computed } from 'vue'
import {
  cellValue,
  findSort,
  matchesExpression,
  matchesFacets,
  parseExpression,
} from 'header-content-layout'
import type { ColumnDef, QueryRequest, QueryResult, ShellRow, SyncDataSource } from 'header-content-layout'
import { state } from './server/connection'
import { rowsFor } from './schema'

/**
 * Orders rows the way appfr's own source does, so the sort control means the
 * same thing here: numbers descend, dates run newest first, and text runs Z→A
 * so that reversing it reads A→Z.
 */
function comparator(columns: ColumnDef[], sortKey: string) {
  const column = columns.find((c) => c.sort === sortKey)
  if (!column) return () => 0
  const numeric = column.kind === 'number' || column.role === 'metric'
  const dated = column.kind === 'date' || column.role === 'updated'
  return (a: ShellRow, b: ShellRow) => {
    const left = cellValue(column, a)
    const right = cellValue(column, b)
    if (numeric) return Number(right ?? 0) - Number(left ?? 0)
    if (dated) return (Date.parse(String(right ?? '')) || 0) - (Date.parse(String(left ?? '')) || 0)
    return String(right ?? '').localeCompare(String(left ?? ''), undefined, { numeric: true })
  }
}

function query({ query, schema, entity, limit, offset }: QueryRequest): QueryResult {
  const expression = parseExpression(query.expr)
  const scope = entity ? [entity] : schema.entities
  let population = 0
  const matched: ShellRow[] = []

  for (const candidate of scope) {
    for (const row of rowsFor(candidate.key)) {
      population++
      // Facets belong to an entity, so they only narrow when one is chosen.
      const passesFacets = entity ? matchesFacets(row, query.facets) : true
      if (passesFacets && matchesExpression(expression, row, candidate)) matched.push(row)
    }
  }

  const sort = findSort(entity, query.sort, schema)
  matched.sort(comparator(entity?.columns ?? schema.columns ?? [], sort.key))
  if (query.dir === 'asc') matched.reverse()

  return {
    rows: matched.slice(offset, offset + limit),
    total: matched.length,
    unfiltered: matched.length === population,
  }
}

/**
 * A new source object whenever the server state changes. The shell re-runs
 * its query when the source it is handed changes, which is what keeps every
 * open list live without each one subscribing to the socket.
 */
export const source = computed<SyncDataSource>(() => {
  void state.version
  return { query }
})
