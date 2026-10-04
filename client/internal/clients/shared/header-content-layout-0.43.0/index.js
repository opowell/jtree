import { ref as W, inject as Lt, provide as ss, computed as v, toValue as Mt, shallowRef as Rt, watch as ke, onScopeDispose as Cn, defineComponent as oe, onMounted as Ca, onBeforeUnmount as Ve, resolveComponent as Ma, openBlock as f, createElementBlock as m, normalizeStyle as Ee, Fragment as ne, renderList as ve, toDisplayString as N, createCommentVNode as T, createElementVNode as x, createBlock as te, nextTick as Ft, useId as as, unref as A, normalizeClass as Nt, Teleport as al, createVNode as pe, getCurrentScope as rs, withDirectives as It, withKeys as Je, withModifiers as Fe, vModelText as wn, renderSlot as xe, useSlots as Qt, createTextVNode as je, withCtx as et, reactive as Us, resolveDynamicComponent as ls, createSlots as pn, useModel as Wt, mergeModels as kn, Comment as rl, Text as ll, vShow as js, h as ol } from "vue";
const Sa = Symbol("dc.routeAdapter");
function at(e) {
  if (!e) return "";
  const t = e.replace(/^[?]/, "");
  return t ? `?${t}` : "";
}
function il() {
  const e = typeof window < "u", t = W(e ? at(window.location.search) : ""), n = W(e ? window.location.pathname : "/"), s = () => {
    t.value = at(window.location.search), n.value = window.location.pathname;
  };
  e && window.addEventListener("popstate", s);
  const a = (r, i) => {
    const l = at(r);
    if (!e) {
      t.value = l;
      return;
    }
    const o = `${window.location.pathname}${l}${window.location.hash}`;
    i === "push" ? window.history.pushState(window.history.state, "", o) : window.history.replaceState(window.history.state, "", o), t.value = l, n.value = window.location.pathname;
  };
  return {
    search: t,
    path: n,
    push: (r) => a(r, "push"),
    replace: (r) => a(r, "replace"),
    dispose: () => {
      e && window.removeEventListener("popstate", s);
    }
  };
}
const Ea = ["list", "cards", "grid", "images", "table", "links", "preview"], Kf = [
  "minimal",
  "mono-size",
  "dark",
  "light",
  "auto",
  "macos",
  "windows",
  "inherit"
], cn = ["ok", "running", "queued", "review", "failed"], Wf = [
  "identity",
  "reference",
  "metric",
  "state",
  "updated",
  "image",
  "tint"
], Hf = [480, 620, 760, 900, 1100], cl = "cards", Wn = "updated";
function Pa(e) {
  return typeof e == "string" && Ea.includes(e);
}
const ul = {
  list: "List",
  cards: "Cards",
  grid: "Grid",
  images: "Images",
  table: "Table",
  links: "Links",
  preview: "Preview"
};
function os(e, t) {
  const [n] = t ?? [];
  return n === void 0 || t?.includes(e) ? e : n;
}
function St(e, t) {
  return t ? e.entities.find((n) => n.key === t) ?? null : null;
}
function Aa(e, t = {}) {
  const n = St(e, t.entity), s = e.entities[0];
  if (!n && !s) throw new Error(`Schema "${e.key}" declares no entities`);
  return n ?? s;
}
function za(e, t = null) {
  return e?.columns ?? t?.columns ?? [];
}
function Ta(e, t = null) {
  if (e?.sorts?.length) return e.sorts;
  const n = /* @__PURE__ */ new Set(), s = [];
  for (const a of za(e, t))
    !a.sort || n.has(a.sort) || (n.add(a.sort), s.push({ key: a.sort, label: (a.label ?? a.sort).toLowerCase() }));
  return s;
}
const dl = { key: Wn, label: Wn };
function ct(e, t, n = null) {
  const s = Ta(e, n);
  return (t ? s.find((r) => r.key === t) : void 0) ?? s.find((r) => r.key === Wn) ?? s[0] ?? dl;
}
function is(e) {
  switch (e.kind) {
    case "chips":
      return { kind: "chips", selected: [] };
    case "range":
      return { kind: "range", min: null, max: null };
    case "toggle":
      return { kind: "toggle", on: !1 };
  }
}
function Ot(e) {
  const t = {};
  for (const n of e?.facets ?? []) t[n.key] = is(n);
  return t;
}
function La(e) {
  if (!e) return !1;
  switch (e.kind) {
    case "chips":
      return e.selected.length > 0;
    case "range":
      return e.min !== null || e.max !== null;
    case "toggle":
      return e.on;
  }
}
function Ra(e) {
  return Object.values(e).some(La);
}
function cs(e) {
  return e.entity === null && e.expr.trim() === "" && !Ra(e.facets);
}
function Uf(e) {
  return e.entity !== null;
}
function us(e) {
  return e.entity === null && e.view === "cards";
}
function fl(e, t) {
  return t <= 0 ? 1 : Math.max(1, Math.ceil(e / t));
}
function ds(e, t = {}) {
  const s = t.landing === "entity" ? Aa(e, t) : null;
  return {
    entity: s?.key ?? null,
    view: t.view && Pa(t.view) ? t.view : cl,
    sort: ct(s, t.sort).key,
    dir: t.dir === "asc" ? "asc" : "desc",
    expr: "",
    facets: Ot(s),
    page: 1
  };
}
const Fa = ["entity", "sort", "dir", "expr", "facets"];
function Gs(e) {
  return Fa.some((t) => t in e);
}
function Na(e, t) {
  const n = {};
  for (const s of e?.facets ?? []) {
    const a = t[s.key];
    n[s.key] = a && a.kind === s.kind ? a : is(s);
  }
  return n;
}
function vn(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n++)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return Math.abs(t);
}
function pl(e) {
  if (!Number.isFinite(e)) return "—";
  const t = Math.abs(e);
  return t >= 1e6 ? `${(e / 1e6).toFixed(1)}m` : t >= 1e3 ? `${(e / 1e3).toFixed(1)}k` : String(Math.round(e));
}
function $t(e) {
  return Number.isFinite(e) ? Math.round(e).toLocaleString("en-US") : "—";
}
function vl(e) {
  const t = new Date(e);
  if (Number.isNaN(t.getTime())) return "—";
  const n = String(t.getUTCDate()).padStart(2, "0"), s = String(t.getUTCMonth() + 1).padStart(2, "0");
  return `${n}.${s}.${t.getUTCFullYear()}`;
}
function hl(e) {
  return String(e + 1).padStart(2, "0");
}
const Hn = "—";
function Ue(e, t) {
  return e.find((n) => n.role === t);
}
function Ia(e, t) {
  return e.filter((n) => n.role === t);
}
function ml(e, t) {
  const n = (t ? t.columns : e?.columns) ?? [], s = t ? "scoped" : "everything";
  return n.filter(
    (a) => a.role !== "tint" && ((a.when ?? "always") === "always" || a.when === s)
  );
}
const gl = ["id", "entityKey", "entityLabel"];
function qe(e, t) {
  if (e.value) return e.value(t);
  const n = e.field ?? e.key;
  if (n !== void 0) {
    if (t.fields && n in t.fields) return t.fields[n];
    if (gl.includes(n))
      return t[n];
  }
}
function Xs(e, t) {
  const n = e.key ?? e.field ?? e.label;
  return n?.trim() ? n.trim() : `column-${t}`;
}
function _l(e, t) {
  return e.id?.trim() ? e.id : `${e.entityKey || "row"}-${t}`;
}
function yl(e, t) {
  if (e == null || e === "") return Hn;
  if (t === "number") {
    const n = typeof e == "number" ? e : Number(e);
    return Number.isFinite(n) ? pl(n) : String(e);
  }
  return t === "date" ? vl(String(e)) : Array.isArray(e) ? e.length ? e.join(", ") : Hn : String(e);
}
function Zt(e, t) {
  const n = qe(e, t);
  return e.format ? e.format(n, t) : yl(n, e.kind);
}
function wl(e) {
  return typeof e == "number" ? Number.isFinite(e) ? String(e) : "" : typeof e == "string" ? e : Array.isArray(e) ? e.join(", ") : "";
}
function Oa(e, t) {
  const n = Zt(e, t), s = wl(qe(e, t));
  return s && s !== n ? s : n;
}
function hn(e, t) {
  return e ? Zt(e, t) : "";
}
function Ys(e) {
  return e.align ? e.align : e.kind === "number" || e.kind === "ordinal" ? "right" : "left";
}
const kl = {
  ordinal: "dc-table__num",
  number: "dc-table__number",
  date: "dc-table__date",
  status: "dc-table__state"
};
function Qs(e) {
  return [kl[e.kind ?? "text"], e.class].filter(Boolean).join(" ");
}
function Un(e) {
  if (e.truncate !== void 0) return e.truncate;
  const t = e.kind ?? "text";
  return t === "text" || t === "number" || t === "date";
}
const bl = /^([A-Za-z_][\w.-]*)\s*(>=|<=|:|=|>|<)\s*(.*)$/;
function $l(e) {
  const t = [];
  let n = "", s = null;
  const a = () => {
    n && t.push(n), n = "";
  };
  for (let r = 0; r < e.length; r++) {
    const i = e[r];
    if (s) {
      i === s ? s = null : n += i;
      continue;
    }
    if (i === '"' || i === "'") {
      s = i;
      continue;
    }
    if (/\s/.test(i)) {
      if (/(?:>=|<=|[:=><])$/.test(n) || e.slice(r + 1).match(/^\s*(>=|<=|[:=><])/) && n) continue;
      a();
      continue;
    }
    n += i;
  }
  return a(), t;
}
function Ne(e) {
  const t = e.trim();
  if (!t) return [];
  const n = [];
  let s = [];
  for (const a of $l(t)) {
    const r = a.toUpperCase();
    if (r === "AND" || r === "&&") continue;
    if (r === "OR" || r === "||") {
      s.length && n.push(s), s = [];
      continue;
    }
    const i = a.length > 1 && a.startsWith("-"), l = i ? a.slice(1) : a, o = i ? { negated: !0 } : {}, c = bl.exec(l);
    c && c[3] !== "" ? s.push({
      kind: "field",
      field: c[1].toLowerCase(),
      comparator: c[2],
      value: c[3],
      ...o
    }) : s.push({ kind: "text", value: l, ...o });
  }
  return s.length && n.push(s), n;
}
const Et = (e) => e.toLowerCase().replace(/\s+/g, ""), Da = [
  ["status", "state"],
  ["state", "state"],
  ["updated", "updated"],
  ["date", "updated"],
  ["name", "identity"],
  ["ref", "reference"]
];
function xl(e, t, n) {
  const s = Et(e), a = n.columns ?? [];
  if (s === "entity") return t.entityKey;
  if (e in t.fields) return t.fields[e];
  const r = a.find(
    (c) => c.key?.toLowerCase() === e.toLowerCase() || c.field?.toLowerCase() === e.toLowerCase() || c.label !== void 0 && Et(c.label) === s
  );
  if (r) return qe(r, t);
  const i = n.facets.find((c) => Et(c.label) === s);
  if (i && i.key in t.fields) return t.fields[i.key];
  const l = Da.find(([c]) => c === s)?.[1];
  if (l) {
    const c = Ue(a, l);
    if (c) return qe(c, t);
  }
  const o = /^metric(\d+)$/.exec(s);
  if (o) {
    const c = Ia(a, "metric")[Number(o[1]) - 1];
    if (c) return qe(c, t);
  }
}
function Ba(e) {
  return (e.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).map((t) => t.charAt(0)).join("");
}
const Zs = /^[a-z_][\w.-]*$/;
function qa(e) {
  const t = (e.key ?? e.field)?.toLowerCase();
  if (t !== void 0) return Zs.test(t) ? t : void 0;
  const n = e.label === void 0 ? void 0 : Et(e.label);
  return n !== void 0 && Zs.test(n) ? n : void 0;
}
function Cl(e, t) {
  const n = Et(e);
  if (n === "entity" || Da.some(([a]) => a === n) || /^metric\d+$/.test(n)) return !0;
  const s = (a) => a !== void 0 && Et(a) === n;
  return (t.columns ?? []).some(
    (a) => s(a.key) || s(a.field) || s(a.label)
  ) || t.facets.some((a) => s(a.key) || s(a.label));
}
function Va(e, t) {
  if (!t) return e;
  let n = !1;
  const s = Ne(e).map(
    (a) => a.map((r) => {
      if (r.kind !== "field") return r;
      const i = Ka(r.field, t), l = i && qa(i);
      return l ? (n = !0, { ...r, field: l }) : r;
    })
  );
  return n ? ut(s) : e;
}
function Ka(e, t) {
  if (!(!e || Cl(e, t)))
    return (t.columns ?? []).find(
      (n) => n.label !== void 0 && Ba(n.label) === e
    );
}
function Ml(e, t) {
  if (!t || e.label === void 0 || !qa(e)) return;
  const n = Ba(e.label);
  return Ka(n, t) === e ? n : void 0;
}
function Fn(e, t) {
  const n = e.toLowerCase(), s = t.toLowerCase();
  if (!s.includes("*")) return n.includes(s);
  const a = s.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(a).test(n);
}
function Js(e, t) {
  return e.toLowerCase() === t.toLowerCase();
}
function Sl(e, t, n) {
  if (e.kind === "text") {
    const i = n.columns ?? [];
    return ["identity", "reference"].some((l) => {
      const o = Ue(i, l), c = o ? qe(o, t) : void 0;
      return typeof c == "string" && Fn(c, e.value);
    });
  }
  const s = xl(e.field, t, n);
  if (s === void 0) return null;
  if (Array.isArray(s))
    return e.comparator === ":" || e.comparator === "=" ? s.some(
      (l) => e.comparator === "=" ? Js(String(l), e.value) : Fn(String(l), e.value)
    ) : null;
  if (e.comparator === ":" || e.comparator === "=") {
    if (typeof s == "boolean") {
      const i = e.value.toLowerCase();
      return i === "true" || i === "yes" ? s : i === "false" || i === "no" ? !s : null;
    }
    if (typeof s == "number") {
      const i = Number(e.value);
      return Number.isFinite(i) ? s === i : null;
    }
    return e.comparator === "=" ? Js(String(s), e.value) : Fn(String(s), e.value);
  }
  const a = Number(e.value), r = typeof s == "number" ? s : Number(s);
  return !Number.isFinite(a) || !Number.isFinite(r) ? null : El(e.comparator, r, a);
}
function ea(e, t, n) {
  const s = Sl(e, t, n);
  return s === null ? !0 : e.negated ? !s : s;
}
function El(e, t, n) {
  switch (e) {
    case ">":
      return t > n;
    case ">=":
      return t >= n;
    case "<":
      return t < n;
    case "<=":
      return t <= n;
    default:
      return t === n;
  }
}
function ta(e) {
  return e.kind === "field" && !e.negated && (e.comparator === ":" || e.comparator === "=");
}
function Pl(e, t, n) {
  return e.length ? e.some((s) => {
    const a = /* @__PURE__ */ new Map();
    for (const r of s)
      ta(r) && a.set(r.field, (a.get(r.field) ?? !1) || ea(r, t, n));
    return s.every(
      (r) => ta(r) ? a.get(r.field) === !0 : ea(r, t, n)
    );
  }) : !0;
}
function na(e) {
  return /[\s"']/.test(e) ? `"${e.replace(/["']/g, "")}"` : e;
}
function Jt(e) {
  const t = e.negated ? "-" : "";
  return e.kind === "text" ? t + na(e.value) : `${t}${e.field}${e.comparator}${na(e.value)}`;
}
function jf(e) {
  if (!e.negated) return { ...e, negated: !0 };
  const { negated: t, ...n } = e;
  return n;
}
function ut(e) {
  return e.filter((t) => t.length).map((t) => t.map(Jt).join(" ")).join(" OR ");
}
function Al(e, t, n) {
  return e.map((s, a) => a === t ? s.filter((r, i) => i !== n) : s).filter((s) => s.length);
}
function zl(e) {
  const t = Ne(e);
  if (t.length > 1) return { parts: [], text: e.trim() };
  const n = t[0] ?? [];
  return {
    parts: n.filter((s) => s.kind === "field"),
    text: n.filter((s) => s.kind === "text").map(Jt).join(" ")
  };
}
function sa(e, t) {
  return [...e.map(Jt), t.trim()].filter(Boolean).join(" ");
}
const aa = (e, t) => e.toLowerCase() === t.toLowerCase();
function Mn(e, t) {
  return !!e.negated == !!t.negated && Wa(e, t);
}
function Xt(e, t) {
  return !!e.negated != !!t.negated && Wa(e, t);
}
function Wa(e, t) {
  return e.kind === "field" ? t.kind === "field" && e.field === t.field && e.comparator === t.comparator && aa(e.value, t.value) : t.kind === "text" && aa(e.value, t.value);
}
function Tl(e, t) {
  return t.filter((n) => !e.some((s) => Mn(s, n)));
}
function fs(e, t) {
  return Ha(e, t, (n) => n);
}
function Ll(e, t) {
  return Ha(
    e,
    t,
    (n, s) => n.filter((a) => !s.some((r) => Xt(a, r)))
  );
}
function Ha(e, t, n) {
  const s = Ne(e), a = Ne(t);
  return s.length ? a.length ? ut(
    s.flatMap(
      (r) => a.map((i) => [...n(r, i), ...Tl(r, i)])
    )
  ) : ut(s) : ut(a);
}
const ra = [
  "oklch(0.36 0.06 240)",
  "oklch(0.34 0.07 290)",
  "oklch(0.36 0.06 160)",
  "oklch(0.38 0.06 80)",
  "oklch(0.35 0.07 30)",
  "oklch(0.34 0.05 200)"
];
function Ua(e, t) {
  return `${e}_${1e4 + t * 7}`;
}
const Rl = 7, Fl = 3;
function Nl(e, t, n, s) {
  const a = (t * Rl + vn(n)) % s, r = [];
  for (let i = 0; i < Math.min(Fl, s); i++)
    r.push(Ua(e, (a + i) % s));
  return r;
}
function Il(e, t) {
  switch (e.kind) {
    case "chips":
      return e.multiple ? Ol(e.options, t) : e.options[t % e.options.length] ?? "";
    case "range": {
      const n = Math.max(0, e.max - e.min);
      return e.min + (n === 0 ? 0 : t % (n + 1));
    }
    case "toggle":
      return t % 3 === 0;
  }
}
function Ol(e, t) {
  if (!e.length) return [];
  const n = 1 + (t >> 5) % Math.min(3, e.length), s = t % e.length, a = /* @__PURE__ */ new Set();
  for (let r = 0; r < n; r++) a.add((s + r) % e.length);
  return [...a].sort((r, i) => r - i).map((r) => e[r]);
}
function Dl(e, t) {
  const { hash: n, sample: s, revision: a, updatedAt: r } = t, i = a ? ` · rev ${a + 1}` : "";
  switch (e.role) {
    case "identity":
      return `${s[0]}${i}`;
    case "reference":
      return a ? `${s[1]}-${a + 1}` : s[1];
    case "state":
      return cn[n % cn.length];
    case "updated":
      return r;
    case "tint":
      return ra[n % ra.length];
    case "metric":
      return 1 + n % 940;
  }
  switch (e.kind) {
    case "number":
      return 1 + n % 940;
    case "status":
      return cn[n % cn.length];
    case "date":
      return r;
    default:
      return;
  }
}
function Bl(e, t = {}) {
  const n = t.population ?? 48, s = t.seed ?? "", a = t.now ?? /* @__PURE__ */ new Date("2026-08-25T00:00:00Z"), r = e.samples, i = t.scopes ?? [];
  if (!r.length) return [];
  const l = [];
  for (let o = 0; o < n; o++) {
    const c = r[o % r.length], u = Math.floor(o / r.length), h = vn(`${s}:${e.key}:${c[0]}:${o}`), y = Ua(e.key, o), w = new Date(a.getTime() - h % 900 * 36e5).toISOString(), b = {};
    for (const $ of e.columns ?? []) {
      const _ = $.field ?? $.key;
      if (!_ || $.value) continue;
      const C = Dl($, {
        hash: vn(`${h}:${_}`),
        sample: c,
        revision: u,
        updatedAt: w
      });
      C !== void 0 && (b[_] = C);
    }
    for (const $ of e.facets)
      b[$.key] = Il($, vn(`${h}:${$.key}`));
    for (const [$, _] of i)
      b[$] = _ === e.key ? y : Nl(_, o, $, n);
    l.push({ id: y, entityKey: e.key, entityLabel: e.label, fields: b });
  }
  return l;
}
function ql(e, t) {
  for (const [n, s] of Object.entries(t)) {
    const a = e.fields[n];
    switch (s.kind) {
      case "chips": {
        if (!s.selected.length) break;
        if (Array.isArray(a)) {
          if (!a.some((r) => s.selected.includes(String(r)))) return !1;
          break;
        }
        if (typeof a != "string" || !s.selected.includes(a)) return !1;
        break;
      }
      case "range": {
        if (s.min === null && s.max === null) break;
        const r = typeof a == "number" ? a : Number(a);
        if (!Number.isFinite(r) || s.min !== null && r < s.min || s.max !== null && r > s.max) return !1;
        break;
      }
      case "toggle": {
        if (!s.on) break;
        if (a !== !0) return !1;
        break;
      }
    }
  }
  return !0;
}
function Vl(e, t) {
  const n = e.find((i) => i.sort === t);
  if (!n) return () => 0;
  const s = n.kind ?? "text", a = s === "number" || n.role === "metric", r = s === "date" || n.role === "updated";
  return (i, l) => {
    const o = qe(n, i), c = qe(n, l);
    return a ? Number(c ?? 0) - Number(o ?? 0) : r ? Date.parse(String(c ?? "")) - Date.parse(String(o ?? "")) : String(c ?? "").localeCompare(String(o ?? ""));
  };
}
function Kl(e = {}) {
  const t = /* @__PURE__ */ new Map(), n = (s, a) => {
    const r = t.get(s.key);
    if (r) return r;
    const i = e.scopes ?? a.entities.flatMap(
      (o) => o.scope ? [[o.scope, o.key]] : []
    ), l = Bl(s, { ...e, scopes: i });
    return t.set(s.key, l), l;
  };
  return {
    query({ query: s, schema: a, entity: r, limit: i, offset: l }) {
      const o = Ne(s.expr), c = r ? [r] : a.entities, u = [], h = [];
      for (const b of c)
        for (const $ of n(b, a))
          u.push($), (r ? ql($, s.facets) : !0) && Pl(o, $, b) && h.push($);
      const y = ct(r, s.sort, a), w = h.sort(Vl(za(r, a), y.key));
      return s.dir === "asc" && w.reverse(), {
        // One page out of the middle. `total` stays the whole match, which is
        // what the shell counts pages with.
        rows: w.slice(l, l + i),
        total: h.length,
        unfiltered: h.length === u.length
      };
    }
  };
}
function ps(e, t) {
  return ja(e, t.id);
}
function ja(e, t) {
  const n = e?.scope;
  return n ? `${n}:"${t.replace(/"/g, "")}"` : null;
}
function vs(e, t) {
  return ps(
    e.entities.find((n) => n.key === t.entityKey),
    t
  );
}
function hs(e, t) {
  if (!t) return e;
  const n = e.trim();
  if (!n) return t;
  const [s] = Ne(t).flat();
  if (!s) return n;
  const a = Ne(n);
  return a.some((l) => l.some((o) => Mn(o, s))) ? n : a.some((l) => l.some((o) => Xt(o, s))) ? ut(
    a.map(
      (l) => l.map((o) => Xt(o, s) ? s : o)
    )
  ) : `${n} ${t}`;
}
function Ga(e) {
  if (!e) return null;
  const t = e.trim();
  return t ? t.startsWith("-") ? t.slice(1) : `-${t}` : null;
}
function Xa(e, t) {
  if (!t || !e.trim()) return null;
  const [n] = Ne(t).flat();
  if (!n) return null;
  const s = Ne(e).flat();
  return s.some((a) => Mn(a, n)) ? n.negated ? "out" : "in" : s.some((a) => Xt(a, n)) ? n.negated ? "in" : "out" : null;
}
function Ya(e, t) {
  if (!t || !e.trim()) return e;
  const [n] = Ne(t).flat();
  if (!n) return e;
  const s = Ne(e), a = s.map(
    (r) => r.filter((i) => !Mn(i, n) && !Xt(i, n))
  );
  return a.every((r, i) => r.length === s[i]?.length) ? e : ut(a);
}
function la(e, t, n) {
  return t ? n === null ? Ya(e, t) : hs(e, n === "out" ? Ga(t) : t) : e;
}
function Ke(e) {
  return e.metaKey || e.ctrlKey || e.shiftKey ? { exclude: !0 } : {};
}
function Wl(e, t, n, s = {}) {
  const a = vs(e, n);
  return hs(t.expr, s.exclude ? Ga(a) : a);
}
function Qa(e, t) {
  const n = e?.scope?.toLowerCase();
  if (!n || e?.keepsScope || !t.trim()) return t;
  const s = Ne(t), a = s.map(
    (r) => r.filter((i) => i.kind !== "field" || i.field !== n)
  );
  return a.every((r, i) => r.length === s[i]?.length) ? t : ut(a);
}
function Za(e, t) {
  const n = t.toLowerCase();
  return e.entities.find((s) => s.scope?.toLowerCase() === n) ?? null;
}
const Ja = Symbol("dc.shellContext");
function Hl(e) {
  return ss(Ja, e), e;
}
function be() {
  const e = Lt(Ja, null);
  if (!e)
    throw new Error(
      "[header-content-layout] No shell context found. Render this component inside <DataShell>."
    );
  return e;
}
const ms = "e", gs = "v", _s = "s", ys = "d", ws = "q", ks = "p", bs = "f_", er = "*", Ul = [
  ms,
  gs,
  _s,
  ys,
  ws,
  ks
], jn = "..", tr = ",", jl = [
  [/%2C/g, ","],
  [/%3A/g, ":"],
  [/%2F/g, "/"],
  [/%40/g, "@"],
  [/%2A/g, "*"],
  [/%24/g, "$"],
  [/%28/g, "("],
  [/%29/g, ")"],
  [/%21/g, "!"],
  [/%27/g, "'"],
  [/%20/g, "+"]
];
function Nn(e) {
  let t = encodeURIComponent(e);
  for (const [n, s] of jl) t = t.replace(n, s);
  return t;
}
function st(e) {
  try {
    return decodeURIComponent(e.replace(/\+/g, " "));
  } catch {
    return e.replace(/\+/g, " ");
  }
}
function nr(e) {
  const t = e.replace(/^[?]/, "");
  if (!t) return [];
  const n = [];
  for (const s of t.split("&")) {
    if (!s) continue;
    const a = s.indexOf("="), r = a === -1 ? s : s.slice(0, a), i = a === -1 ? "" : s.slice(a + 1);
    n.push([st(r), i]);
  }
  return n;
}
function Gl(e) {
  return Ul.includes(e) || e.startsWith(bs);
}
function oa(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Xl(e, t) {
  const n = st(t);
  switch (e.kind) {
    case "chips": {
      const s = new Set(
        n.split(tr).map((r) => r.trim()).filter(Boolean)
      );
      return { kind: "chips", selected: e.options.filter((r) => s.has(r)) };
    }
    case "range": {
      const s = n.indexOf(jn), a = (s === -1 ? n : n.slice(0, s)).trim(), r = (s === -1 ? "" : n.slice(s + jn.length)).trim(), i = a === "" ? null : Number(a), l = r === "" ? null : Number(r);
      let o = i !== null && Number.isFinite(i) ? oa(i, e.min, e.max) : null, c = l !== null && Number.isFinite(l) ? oa(l, e.min, e.max) : null;
      return o !== null && c !== null && o > c && ([o, c] = [c, o]), { kind: "range", min: o, max: c };
    }
    case "toggle":
      return { kind: "toggle", on: n === "1" || n === "true" };
  }
}
function Yl(e, t) {
  switch (e.kind) {
    case "chips":
      return e.selected.length ? (t.kind === "chips" ? t.options.filter((s) => e.selected.includes(s)) : e.selected).join(tr) : null;
    case "range":
      return e.min === null && e.max === null ? null : `${e.min ?? ""}${jn}${e.max ?? ""}`;
    case "toggle":
      return e.on ? "1" : null;
  }
}
function Ql(e, t, n = {}) {
  const s = ds(t, n), a = new Map(nr(e)), r = a.get(ms), i = r === void 0 ? s.entity : st(r), l = i === er ? null : St(t, i), o = a.get(gs), c = o && Pa(st(o)) ? st(o) : s.view, u = a.get(_s), h = ct(l, u ? st(u) : n.sort, t), y = a.get(ys), w = y ? st(y) === "asc" ? "asc" : "desc" : s.dir, b = a.get(ws), $ = a.get(ks), _ = $ === void 0 ? 1 : Number(st($)), C = Number.isFinite(_) ? Math.max(1, Math.floor(_)) : 1, L = {};
  for (const D of l?.facets ?? []) {
    const M = a.get(`${bs}${D.key}`);
    L[D.key] = M === void 0 ? is(D) : Xl(D, M);
  }
  return {
    entity: l?.key ?? null,
    view: c,
    sort: h.key,
    dir: w,
    expr: b === void 0 ? "" : st(b),
    facets: Na(l, L),
    page: C
  };
}
function ia(e, t, n = {}, s = "") {
  const a = ds(t, n), r = St(t, e.entity), i = nr(s).filter(([h]) => !Gl(h)), l = [], o = (h, y) => l.push([h, Nn(y)]), c = r?.key ?? null;
  c !== a.entity && o(ms, c ?? er), e.view !== a.view && o(gs, e.view), e.sort !== a.sort && o(_s, e.sort), e.dir !== a.dir && o(ys, e.dir), e.expr.trim() !== "" && o(ws, e.expr);
  for (const h of r?.facets ?? []) {
    const y = e.facets[h.key];
    if (!y) continue;
    const w = Yl(y, h);
    w !== null && l.push([`${bs}${h.key}`, Nn(w)]);
  }
  e.page > 1 && o(ks, String(e.page));
  const u = [
    ...i.map(([h, y]) => [Nn(h), y]),
    ...l
  ];
  return u.length ? `?${u.map(([h, y]) => y === "" ? h : `${h}=${y}`).join("&")}` : "";
}
const bn = "entity", Yt = "expr";
function Zl(e, t) {
  const n = e.label.toLowerCase();
  switch (t.kind) {
    case "chips":
      return t.selected.map((s) => ({
        id: `${e.key}:${s}`,
        label: `${n}:${s}`,
        facetKey: e.key,
        option: s
      }));
    case "range": {
      if (t.min === null && t.max === null) return [];
      const s = t.min !== null && t.max !== null ? `${t.min} ≤ ${n} ≤ ${t.max}` : t.max !== null ? `${n} ≤ ${t.max}` : `${n} ≥ ${t.min}`;
      return [{ id: e.key, label: s, facetKey: e.key }];
    }
    case "toggle":
      return t.on ? [{ id: e.key, label: `${n}:on`, facetKey: e.key }] : [];
  }
}
function $s(e, t) {
  const n = [];
  t && n.push({
    id: bn,
    label: `entity:${t.key}`,
    facetKey: bn
  });
  for (const s of t?.facets ?? []) {
    const a = e.facets[s.key];
    a && La(a) && n.push(...Zl(s, a));
  }
  return Ne(e.expr).forEach((s, a) => {
    s.forEach((r, i) => {
      n.push({
        id: `${Yt}:${a}:${i}`,
        label: Jt(r),
        facetKey: Yt,
        group: a,
        index: i,
        ...r.kind === "field" ? { field: r.field, value: r.value } : {},
        ...r.negated ? { negated: !0 } : {}
      });
    });
  }), n;
}
function Jl(e, t, n = null) {
  if (cs(e)) {
    const r = ct(t, e.sort, n);
    return `everything · ${e.view} · ${r.label}`;
  }
  const s = $s(e, t).filter((r) => r.facetKey !== Yt).map((r) => r.label), a = e.expr.trim();
  return a && s.push(`"${a}"`), s.join(" · ");
}
function eo(e) {
  const { adapter: t } = e, n = v(() => Mt(e.schema)), s = v(() => Mt(e.defaults) ?? {}), a = v(() => Ql(t.search.value, n.value, s.value)), r = v(() => St(n.value, a.value.entity)), i = v(() => r.value ?? Aa(n.value, s.value)), l = v(() => Ta(r.value, n.value)), o = v(() => ct(r.value, a.value.sort, n.value)), c = (_, C) => {
    const L = ia(_, n.value, s.value, t.search.value);
    L !== t.search.value && (C === "push" ? t.push(L) : t.replace(L));
  }, u = () => Mt(e.navigationMode) ?? "push", h = () => Mt(e.facetNavigationMode) ?? "replace", y = (_, C) => {
    const L = _.page ?? (Gs(_) ? 1 : a.value.page);
    c({ ...a.value, ..._, page: L }, C);
  }, w = (_, C) => {
    const L = a.value.facets[_];
    if (!L) return;
    const D = { ...a.value.facets, [_]: C(L) };
    y({ facets: D }, h());
  }, b = (_) => {
    const C = _ === null ? null : St(n.value, _);
    return (C?.key ?? null) === a.value.entity ? {} : {
      entity: C?.key ?? null,
      sort: ct(C, a.value.sort, n.value).key,
      facets: Ot(C)
    };
  }, $ = (_) => {
    const C = b(_);
    Object.keys(C).length && y(C, u());
  };
  return {
    query: a,
    entity: r,
    focus: i,
    sort: o,
    sorts: l,
    summary: v(() => Jl(a.value, r.value, n.value)),
    terms: v(() => $s(a.value, r.value)),
    isPristine: v(() => cs(a.value)),
    isEverything: v(() => a.value.entity === null),
    hasFacets: v(() => Ra(a.value.facets)),
    setEntity: $,
    clearEntity: () => $(null),
    setView(_) {
      y({ view: _ }, u());
    },
    setSort(_) {
      y({ sort: ct(r.value, _, n.value).key }, u());
    },
    toggleDirection() {
      y({ dir: a.value.dir === "desc" ? "asc" : "desc" }, u());
    },
    setExpression(_) {
      y({ expr: _ }, u());
    },
    narrow(_, C, L) {
      y({ expr: _, ...b(C), ...L ? { view: L } : {} }, u());
    },
    setPage(_, C) {
      y({ page: Math.max(1, Math.floor(_)) }, C ?? u());
    },
    setFacet(_, C) {
      w(_, () => C);
    },
    toggleChip(_, C) {
      w(_, (L) => L.kind !== "chips" ? L : { kind: "chips", selected: L.selected.includes(C) ? L.selected.filter((M) => M !== C) : [...L.selected, C] });
    },
    setRange(_, C, L) {
      w(_, (D) => D.kind === "range" ? { kind: "range", min: C, max: L } : D);
    },
    toggleFlag(_) {
      w(
        _,
        (C) => C.kind === "toggle" ? { kind: "toggle", on: !C.on } : C
      );
    },
    removeTerm(_) {
      if (_.facetKey === bn) {
        $(null);
        return;
      }
      if (_.facetKey === Yt) {
        const C = Al(Ne(a.value.expr), _.group ?? 0, _.index ?? 0);
        y({ expr: ut(C) }, u());
        return;
      }
      w(_.facetKey, (C) => C.kind === "chips" && _.option ? { kind: "chips", selected: C.selected.filter((L) => L !== _.option) } : C.kind === "range" ? { kind: "range", min: null, max: null } : C.kind === "toggle" ? { kind: "toggle", on: !1 } : C);
    },
    clearFilters() {
      y({ entity: null, expr: "", facets: Ot(null) }, u());
    },
    reset() {
      c(ds(n.value, s.value), u());
    },
    hrefFor(_) {
      const C = { ...a.value, ..._ };
      return C.page = _.page ?? (Gs(_) ? 1 : a.value.page), C.facets = Na(St(n.value, C.entity), C.facets), `${t.path.value}${ia(C, n.value, s.value, t.search.value)}`;
    }
  };
}
function to(e) {
  const t = Rt([]), n = W(0), s = W(!1), a = W(!1), r = Rt(null);
  let i = 0, l = null, o = null;
  const c = v(() => (e.query.value.page - 1) * e.limit.value), u = v(() => fl(n.value, e.limit.value)), h = () => {
    const M = e.query.value, E = e.within?.value.trim(), V = Qa(e.entity.value, M.expr);
    return E ? { ...M, expr: fs(E, V) } : V === M.expr ? M : { ...M, expr: V };
  }, y = (M, E) => {
    t.value = M.rows, n.value = M.total, r.value = null, w(E);
  }, w = (M) => {
    l = { key: M, total: n.value }, a.value = !1;
  }, b = (M) => {
    r.value = M, t.value = [], n.value = 0, l = null, a.value = !1;
  }, $ = (M, E, V, P) => {
    let k = !0;
    const K = () => M === i;
    let R = 0, Z = !1;
    const X = (ue) => {
      R = ue, Z = !0, P === void 0 && (n.value = ue);
    }, ye = () => {
      k && (k = !1, t.value = [], X(0)), r.value = null;
    };
    return {
      get open() {
        return K();
      },
      insert(ue, S) {
        if (!K()) return;
        const I = Array.isArray(ue) ? ue : [ue];
        if (!I.length) return;
        ye();
        const j = [...t.value];
        j.splice(S ?? j.length, 0, ...I), t.value = E > 0 ? j.slice(0, E) : j, X(R + I.length);
      },
      set(ue) {
        K() && (ue.rows && (ye(), t.value = E > 0 ? ue.rows.slice(0, E) : ue.rows, X(ue.rows.length)), ue.total !== void 0 && X(ue.total));
      },
      close() {
        K() && (s.value = !1, Z && (n.value = R), w(V));
      },
      fail(ue) {
        K() && (b(ue), s.value = !1);
      }
    };
  }, _ = () => {
    const M = o;
    o = null, M?.();
  }, C = () => {
    const M = ++i;
    _();
    const E = L.value, V = l?.key === E ? l.total : void 0;
    a.value = V === void 0;
    const P = {
      query: h(),
      schema: e.schema.value,
      entity: e.entity.value,
      limit: e.limit.value,
      offset: c.value
    }, k = e.source.value;
    if (k.stream) {
      s.value = !0;
      try {
        o = k.stream(P, $(M, P.limit, E, V)) ?? null;
      } catch (R) {
        b(R), s.value = !1;
      }
      return;
    }
    let K;
    try {
      K = k.query(P);
    } catch (R) {
      b(R);
      return;
    }
    if (!(K instanceof Promise)) {
      y(K, E), s.value = !1;
      return;
    }
    s.value = !0, K.then((R) => {
      M === i && y(R, E);
    }).catch((R) => {
      M === i && b(R);
    }).finally(() => {
      M === i && (s.value = !1);
    });
  }, L = v(() => {
    const M = h();
    return `${e.entity.value?.key ?? e.schema.value.entities[0]?.key ?? ""}|${JSON.stringify(Fa.map((V) => M[V]))}`;
  }), D = v(() => `${L.value}|${e.query.value.page}`);
  return ke([e.source, D, e.limit], C, {
    immediate: !0
  }), Cn(() => {
    i++, _();
  }, !0), { rows: t, total: n, offset: c, pageCount: u, pending: s, counting: a, error: r, refresh: C };
}
const Ht = (e) => e.separator !== !0 && e.heading !== !0 && e.disabled !== !0, no = ["aria-label"], so = ["role", "aria-label"], ao = ["data-dc-item"], ro = {
  key: 0,
  class: "dc-menu__rule",
  role: "separator"
}, lo = ["role", "aria-checked", "aria-haspopup", "aria-expanded", "aria-disabled", "disabled", "data-dc-item", "onClick", "onMouseenter"], oo = {
  class: "dc-menu__mark",
  "aria-hidden": "true"
}, io = { class: "dc-menu__label dc-truncate" }, co = {
  key: 0,
  class: "dc-menu__key dc-mono"
}, uo = {
  key: 1,
  class: "dc-menu__more",
  "aria-hidden": "true"
}, fo = /* @__PURE__ */ oe({
  __name: "MenuList",
  props: {
    items: {},
    at: {},
    label: {},
    autofocus: { type: Boolean }
  },
  emits: ["choose", "dismiss"],
  setup(e, { expose: t, emit: n }) {
    const s = e, a = n, r = W(null), i = W([]), l = W(null), o = W(null), c = W(null), u = W(!1), h = v(
      () => s.items.flatMap((P, k) => Ht(P) ? [k] : [])
    ), y = v(() => {
      const P = [{ entries: [] }];
      return s.items.forEach((k, K) => {
        k.heading ? P.push({ heading: k, entries: [] }) : P[P.length - 1]?.entries.push({ item: k, index: K });
      }), P.filter((k) => k.entries.length > 0);
    }), w = W({ x: s.at.x, y: s.at.y });
    async function b() {
      w.value = { x: s.at.x, y: s.at.y }, await Ft();
      const P = r.value?.getBoundingClientRect();
      if (!P) return;
      const k = 8;
      let K = s.at.x, R = s.at.y;
      if (K + P.width > window.innerWidth - k) {
        const Z = s.at.mirrorX === void 0 ? null : s.at.mirrorX - P.width;
        K = Z !== null && Z >= k ? Z : window.innerWidth - P.width - k;
      }
      R + P.height > window.innerHeight - k && (R = window.innerHeight - P.height - k), w.value = { x: Math.max(k, K), y: Math.max(k, R) };
    }
    const $ = v(() => ({ left: `${w.value.x}px`, top: `${w.value.y}px` }));
    function _(P) {
      l.value = P, P !== null && Ft(() => i.value[P]?.focus());
    }
    function C(P, k) {
      const K = h.value;
      if (K.length === 0) return null;
      if (P === null) return k === 1 ? K[0] ?? null : K[K.length - 1] ?? null;
      const R = K.indexOf(P);
      return R === -1 ? K[0] ?? null : K[(R + k + K.length) % K.length] ?? null;
    }
    function L(P, k) {
      if (!s.items[P]?.items?.length) return;
      const R = i.value[P]?.getBoundingClientRect(), Z = r.value?.getBoundingClientRect();
      !R || !Z || (c.value = { x: Z.right - 4, y: R.top - 4, mirrorX: Z.left + 4 }, o.value = P, u.value = k);
    }
    function D(P) {
      const k = o.value;
      o.value = null, c.value = null, P && k !== null && _(k);
    }
    function M(P) {
      const k = s.items[P];
      if (!(!k || !Ht(k))) {
        if (k.items?.length) {
          L(P, !0);
          return;
        }
        a("choose", k);
      }
    }
    function E(P) {
      const k = P.key;
      if (k === "Escape") {
        P.preventDefault(), P.stopPropagation(), o.value !== null ? D(!0) : a("dismiss");
        return;
      }
      if (k === "ArrowDown" || k === "ArrowUp") {
        P.preventDefault(), P.stopPropagation(), D(!1), _(C(l.value, k === "ArrowDown" ? 1 : -1));
        return;
      }
      if (k === "Home" || k === "End") {
        P.preventDefault(), P.stopPropagation(), D(!1), _(C(null, k === "Home" ? 1 : -1));
        return;
      }
      if (k === "ArrowRight") {
        const K = l.value;
        K !== null && s.items[K]?.items?.length && (P.preventDefault(), P.stopPropagation(), L(K, !0));
        return;
      }
      if (k === "ArrowLeft") {
        o.value !== null && (P.preventDefault(), P.stopPropagation(), D(!0));
        return;
      }
      if (k === "Enter" || k === " ") {
        const K = l.value;
        if (K === null) return;
        P.preventDefault(), P.stopPropagation(), M(K);
      }
    }
    function V(P) {
      const k = s.items[P];
      !k || !Ht(k) || (o.value !== null && o.value !== P && D(!1), _(P), k.items?.length && L(P, !1));
    }
    return Ca(() => {
      b(), s.autofocus && _(C(null, 1));
    }), ke(() => s.at, b, { deep: !0 }), ke(() => s.items, () => void b(), { deep: !0 }), Ve(() => {
      o.value = null;
    }), t({ root: r }), (P, k) => {
      const K = Ma("MenuList", !0);
      return f(), m("div", {
        ref_key: "root",
        ref: r,
        class: "dc-menu",
        role: "menu",
        "aria-label": e.label,
        style: Ee($.value),
        onKeydown: E
      }, [
        (f(!0), m(ne, null, ve(y.value, (R, Z) => (f(), m("div", {
          key: `${Z}-${R.heading?.label ?? ""}`,
          class: "dc-menu__group",
          role: R.heading ? "group" : "none",
          "aria-label": R.heading?.label
        }, [
          R.heading ? (f(), m("div", {
            key: 0,
            class: "dc-menu__heading dc-truncate",
            "aria-hidden": "true",
            "data-dc-item": R.heading.id
          }, N(R.heading.label), 9, ao)) : T("", !0),
          (f(!0), m(ne, null, ve(R.entries, ({ item: X, index: ye }) => (f(), m(ne, {
            key: X.id ?? `${ye}-${X.label ?? ""}`
          }, [
            X.separator ? (f(), m("div", ro)) : (f(), m("button", {
              key: 1,
              ref_for: !0,
              ref: (ue) => {
                ue && (i.value[ye] = ue);
              },
              type: "button",
              class: "dc-menu__item",
              role: X.checked === void 0 ? "menuitem" : "menuitemcheckbox",
              "aria-checked": X.checked === void 0 ? void 0 : X.checked,
              "aria-haspopup": X.items?.length ? "menu" : void 0,
              "aria-expanded": X.items?.length ? o.value === ye : void 0,
              "aria-disabled": X.disabled ? "true" : void 0,
              disabled: X.disabled,
              "data-dc-item": X.id,
              tabindex: "-1",
              onClick: (ue) => M(ye),
              onMouseenter: (ue) => V(ye)
            }, [
              x("span", oo, N(X.checked ? "✓" : ""), 1),
              x("span", io, N(X.label), 1),
              X.shortcut ? (f(), m("span", co, N(X.shortcut), 1)) : X.items?.length ? (f(), m("span", uo, "›")) : T("", !0)
            ], 40, lo))
          ], 64))), 128))
        ], 8, so))), 128)),
        o.value !== null && c.value ? (f(), te(K, {
          key: o.value,
          items: e.items[o.value]?.items ?? [],
          at: c.value,
          label: e.items[o.value]?.label,
          autofocus: u.value,
          onChoose: k[0] || (k[0] = (R) => a("choose", R)),
          onDismiss: k[1] || (k[1] = (R) => D(!0))
        }, null, 8, ["items", "at", "label", "autofocus"])) : T("", !0)
      ], 44, no);
    };
  }
}), ce = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, a] of t)
    n[s] = a;
  return n;
}, xs = /* @__PURE__ */ ce(fo, [["__scopeId", "data-v-9b1413fa"]]), po = { class: "dc-pick" }, vo = ["id"], ho = ["id", "aria-expanded", "aria-labelledby", "data-dc-value"], mo = { class: "dc-pick__label" }, go = /* @__PURE__ */ oe({
  __name: "PickControl",
  props: {
    modelValue: {},
    options: {},
    label: {},
    mono: { type: Boolean }
  },
  emits: ["update:modelValue", "open", "close"],
  setup(e, { emit: t }) {
    const n = e, s = t, a = as() ?? "dc-pick", r = W(null), i = W(null), l = W(null), o = W(!1), c = v(() => l.value !== null), u = W(null), h = v(
      () => n.options.find((M) => M.key === n.modelValue) ?? n.options[0]
    ), y = v(
      () => n.options.map((M) => ({
        id: M.key,
        label: M.label,
        checked: M.key === n.modelValue
      }))
    ), w = v(
      () => l.value ? { maxHeight: `${window.innerHeight - l.value.y - 8}px` } : void 0
    );
    function b(M) {
      const E = r.value?.getBoundingClientRect();
      E && (u.value = r.value?.closest(".dc-shell") ?? document.body, l.value = { x: E.left, y: E.bottom + 4, mirrorX: E.right }, o.value = M, s("open"));
    }
    function $(M) {
      l.value && s("close"), l.value = null, M && r.value?.focus();
    }
    function _() {
      c.value ? $(!0) : b(!1);
    }
    function C(M) {
      M.key !== "ArrowDown" && M.key !== "ArrowUp" || c.value || (M.preventDefault(), b(!0));
    }
    function L(M) {
      const E = M.target;
      E && (r.value?.contains(E) || i.value?.root?.contains(E) || $(!1));
    }
    ke(c, (M) => {
      M ? window.addEventListener("pointerdown", L, !0) : window.removeEventListener("pointerdown", L, !0);
    }), Ve(() => window.removeEventListener("pointerdown", L, !0));
    function D(M) {
      $(!0), !(M.id === void 0 || M.id === n.modelValue) && s("update:modelValue", M.id);
    }
    return (M, E) => (f(), m("span", po, [
      x("span", {
        id: `${A(a)}-name`,
        class: "dc-pick__name"
      }, N(e.label), 9, vo),
      x("button", {
        id: `${A(a)}-value`,
        ref_key: "trigger",
        ref: r,
        type: "button",
        class: Nt(["dc-pick__button", { "dc-mono": e.mono }]),
        "aria-haspopup": "menu",
        "aria-expanded": c.value,
        "aria-labelledby": `${A(a)}-name ${A(a)}-value`,
        "data-dc-value": e.modelValue,
        onClick: _,
        onKeydown: C
      }, [
        x("span", mo, N(h.value?.label), 1)
      ], 42, ho),
      E[1] || (E[1] = x("span", {
        class: "dc-pick__mark",
        "aria-hidden": "true"
      }, "▾", -1)),
      l.value && u.value ? (f(), te(al, {
        key: 0,
        to: u.value
      }, [
        pe(xs, {
          ref_key: "menu",
          ref: i,
          class: "dc-pick__list",
          style: Ee(w.value),
          items: y.value,
          at: l.value,
          label: e.label,
          autofocus: o.value,
          onChoose: D,
          onDismiss: E[0] || (E[0] = (V) => $(!0))
        }, null, 8, ["style", "items", "at", "label", "autofocus"])
      ], 8, ["to"])) : T("", !0)
    ]));
  }
}), ca = /* @__PURE__ */ ce(go, [["__scopeId", "data-v-d21ebf1b"]]);
function _o(e) {
  const t = Rt(/* @__PURE__ */ new Map()), n = W(!0);
  let s = 0, a;
  const r = () => {
    s++, a?.abort(), a = void 0;
  }, i = () => {
    r();
    const l = s, { signal: o } = a = new AbortController(), c = e.query.value, u = e.schema.value, h = e.entities.value, y = e.within?.value.trim() ?? "";
    n.value = c.expr.trim() === "" && !y;
    const w = /* @__PURE__ */ new Map();
    let b = !0;
    for (const $ of h) {
      const _ = Qa($, c.expr), C = y ? fs(y, _) : _;
      let L = !1;
      const D = (E) => {
        if (l !== s) return;
        if (b) {
          w.set($.key, E);
          return;
        }
        const V = new Map(t.value);
        V.set($.key, E), t.value = V;
      }, M = e.source.value.query({
        query: { ...c, entity: $.key, expr: C, facets: Ot($), page: 1 },
        schema: u,
        entity: $,
        limit: 0,
        offset: 0,
        signal: o,
        progress: (E) => {
          L || D({ total: E, pending: !0, counted: !0 });
        }
      });
      M instanceof Promise ? (w.has($.key) || w.set($.key, { total: 0, pending: !0, counted: !1 }), M.then((E) => {
        L = !0, D({ total: E.total, pending: !1, counted: !0 });
      })) : (L = !0, w.set($.key, { total: M.total, pending: !1, counted: !0 }));
    }
    b = !1, t.value = w;
  };
  return rs() && Cn(r), { counts: t, pristine: n, refresh: i, cancel: r };
}
const yo = 25, sr = (e, t) => e.toLowerCase() === t.toLowerCase();
function wo(e, t) {
  return e.find((n) => sr(n.id, t));
}
function ko(e) {
  const t = Rt(/* @__PURE__ */ new Map()), n = /* @__PURE__ */ new Set(), s = (l) => {
    if (l.facetKey !== Yt || !l.field || !l.value) return null;
    const o = Za(e.schema.value, l.field);
    return o ? { entity: o, id: l.value, key: `${o.key}:${l.value}` } : null;
  }, a = (l) => {
    const { entity: o, id: c } = l, u = e.query.value;
    return e.source.value.query({
      query: {
        ...u,
        entity: o.key,
        // The reference on its own. The rest of the query is about the rows on
        // screen, which are of another type entirely.
        expr: ja(o, c) ?? "",
        facets: Ot(o),
        sort: ct(o, u.sort, e.schema.value).key,
        page: 1
      },
      schema: e.schema.value,
      entity: o,
      limit: yo,
      offset: 0
    });
  }, r = (l, o) => {
    const c = hn(Ue(l.columns ?? [], "identity"), o);
    return c === Hn || sr(c, o.id) ? "" : c;
  }, i = () => {
    const l = /* @__PURE__ */ new Map();
    for (const u of e.terms.value) {
      const h = s(u);
      h && !t.value.has(h.key) && !n.has(h.key) && l.set(h.key, h);
    }
    if (!l.size) return;
    const o = [...l.values()].map((u) => ({
      reference: u,
      outcome: a(u)
    })), c = (u) => {
      const h = new Map(t.value);
      u.forEach((y, w) => {
        const { reference: b } = o[w], $ = wo(y.rows, b.id);
        h.set(b.key, $ ? r(b.entity, $) : "");
      }), t.value = h;
    };
    if (o.every(({ outcome: u }) => !(u instanceof Promise))) {
      c(o.map(({ outcome: u }) => u));
      return;
    }
    for (const { reference: u } of o) n.add(u.key);
    Promise.all(o.map(({ outcome: u }) => Promise.resolve(u))).then(c).catch(() => {
    }).finally(() => {
      for (const { reference: u } of o) n.delete(u.key);
    });
  };
  return ke([e.source, e.schema, e.terms], () => {
    try {
      i();
    } catch {
    }
  }, { immediate: !0 }), {
    names: t,
    nameOf(l) {
      const o = s(l);
      return o && t.value.get(o.key) || null;
    }
  };
}
const bo = ["data-dc-expanded"], $o = { class: "dc-header__domain" }, xo = {
  key: 0,
  class: "dc-header__within"
}, Co = ["title"], Mo = ["data-dc-more", "title"], So = {
  key: 0,
  class: "dc-header__or dc-mono",
  "aria-hidden": "true"
}, Eo = ["title", "aria-label", "onClick"], Po = ["onKeydown"], Ao = ["aria-expanded", "aria-controls"], zo = {
  class: "dc-header__chevron",
  "aria-hidden": "true"
}, To = { class: "dc-header__sr" }, Lo = {
  key: 0,
  class: "dc-header__pages",
  "aria-label": "Pages"
}, Ro = ["disabled"], Fo = ["title"], No = ["value", "onKeydown"], Io = {
  class: "dc-header__page-total",
  "aria-hidden": "true"
}, Oo = {
  class: "dc-header__sr",
  "aria-live": "polite"
}, Do = ["disabled"], Bo = {
  key: 1,
  class: "dc-header__actions"
}, qo = "…", Vo = /* @__PURE__ */ oe({
  __name: "ShellHeader",
  props: {
    expanded: { type: Boolean },
    panelId: {},
    hideCount: { type: Boolean },
    views: {},
    pagesNote: {}
  },
  emits: ["toggle"],
  setup(e, { emit: t }) {
    const n = e, s = t, a = be(), r = v(() => a.schema.value), i = v(
      () => a.hasFacets.value || !!a.query.value.expr.trim() || !!a.within.value
    ), l = v(() => r.value.formatCount ?? $t), o = _o({
      source: a.source,
      schema: a.schema,
      query: a.query,
      entities: a.entities,
      within: a.within
    });
    function c(B) {
      if (n.hideCount) return B.count;
      if (B.key === a.query.value.entity && i.value) return l.value(a.total.value);
      if (o.pristine.value) return B.count;
      const G = o.counts.value.get(B.key);
      return G ? G.counted ? `${G.pending ? "~" : ""}${l.value(G.total)}` : qo : B.count;
    }
    function u(B) {
      return `${B.label} · ${c(B)}`;
    }
    const h = v(() => [
      { key: "", label: "Everything" },
      ...a.entities.value.map((B) => ({ key: B.key, label: u(B) }))
    ]), y = v(() => {
      const B = a.within.value.trim();
      return B ? $s({ ...a.query.value, expr: B, facets: {} }, null) : [];
    }), w = v(
      () => (n.views ?? [...Ea]).map((B) => ({ key: B, label: ul[B] }))
    ), b = v(() => os(a.query.value.view, n.views)), $ = v(() => a.query.value.entity !== null);
    function _(B) {
      a.setView(B);
    }
    const C = v(() => {
      const B = a.entity.value, J = B?.keepsScope ? void 0 : B?.scope?.toLowerCase();
      return a.terms.value.filter((G) => G.facetKey !== bn).map((G, Oe, O) => {
        const U = O[Oe - 1];
        return {
          term: G,
          or: U?.group !== void 0 && G.group !== void 0 && G.group !== U.group,
          idle: !!J && G.field?.toLowerCase() === J
        };
      });
    }), L = ko({
      source: a.source,
      schema: a.schema,
      query: a.query,
      // The scope's parts as well as the query's: it names a record more often
      // than a typed term does, being what a record's own page is built on.
      terms: v(() => [...y.value, ...a.terms.value])
    });
    function D(B) {
      return Za(r.value, B)?.scopeLabel ?? B;
    }
    function M(B) {
      return B.replace(/\s*\([^()]*\)\s*$/, "");
    }
    function E(B) {
      const J = L.nameOf(B);
      return J ? `${B.negated ? "-" : ""}${D(B.field)}: ${M(J)}` : B.label;
    }
    function V(B) {
      a.setEntity(B || null);
    }
    const P = W(""), k = W(null);
    function K() {
      const B = P.value.trim();
      B && (a.setExpression(
        Ll(a.query.value.expr, Va(B, a.entity.value))
      ), P.value = "");
    }
    function R() {
      P.value = "", k.value?.blur();
    }
    function Z(B) {
      if (P.value) return;
      const J = C.value.at(-1);
      J && (B.preventDefault(), a.removeTerm(J.term));
    }
    function X(B) {
      B.target?.closest("button, select, label, input") || s("toggle");
    }
    const ye = W(null), ue = W("");
    function S() {
      const B = ye.value;
      if (!B) {
        ue.value = "";
        return;
      }
      const J = B.scrollLeft > 1, G = B.scrollWidth - B.clientWidth - B.scrollLeft > 1;
      ue.value = J && G ? "both" : J ? "start" : G ? "end" : "";
    }
    let I = null;
    ke(
      ye,
      (B) => {
        I?.disconnect(), I = null, S(), !(!B || typeof ResizeObserver > "u") && (I = new ResizeObserver(S), I.observe(B));
      },
      { flush: "post" }
    ), ke(C, S, { flush: "post" }), Ve(() => I?.disconnect());
    const j = v(() => a.query.value.page), le = v(
      () => (a.pageCount.value > 1 || !!n.pagesNote) && !us(a.query.value)
    ), ge = v(
      () => `${a.counting.value ? "~" : ""}${$t(a.pageCount.value)}`
    ), Pe = v(() => {
      let B = `Page ${$t(j.value)} of ${ge.value}`;
      const J = a.rows.value.length;
      if (J) {
        const G = a.offset.value + 1, Oe = `${a.counting.value ? "~" : ""}${$t(a.total.value)}`;
        B += ` — rows ${$t(G)} to ${$t(G + J - 1)} of ${Oe}`;
      }
      return n.pagesNote ? `${B}
${n.pagesNote}` : B;
    }), ze = W(null), Xe = v(() => ze.value ?? String(j.value)), Ye = v(
      () => `calc(${Math.max(2, String(a.pageCount.value).length)}ch + 10px)`
    );
    function Qe(B) {
      B.target.select();
    }
    function We(B) {
      const J = B.target, G = J.value.replace(/[^0-9]/g, "");
      J.value !== G && (J.value = G), ze.value = G;
    }
    function Ie(B) {
      const J = B.target, G = Number(ze.value);
      ze.value = null;
      const Oe = Number.isFinite(G) && G >= 1 ? Math.min(Math.trunc(G), Math.max(1, a.pageCount.value)) : j.value;
      J.value = String(Oe), Oe !== j.value && a.setPage(Oe);
    }
    function He(B) {
      const J = B.target;
      ze.value = null, J.value = String(j.value), J.blur();
    }
    return (B, J) => (f(), m("div", {
      class: "dc-header",
      "data-dc-expanded": e.expanded ? "true" : "false"
    }, [
      x("div", {
        class: "dc-header__trigger",
        onClick: X
      }, [
        x("span", $o, N(r.value.label), 1),
        y.value.length ? (f(), m("span", xo, [
          J[4] || (J[4] = x("span", { class: "dc-header__sr" }, "Within", -1)),
          (f(!0), m(ne, null, ve(y.value, (G) => (f(), m("span", {
            key: `scope:${G.id}`,
            class: "dc-within dc-mono dc-truncate",
            title: E(G)
          }, N(E(G)), 9, Co))), 128))
        ])) : T("", !0),
        x("div", {
          ref_key: "termBar",
          ref: ye,
          class: "dc-header__query dc-header__terms",
          "data-dc-more": ue.value,
          title: A(a).summary.value,
          onScroll: S
        }, [
          $.value ? (f(), te(ca, {
            key: 0,
            class: "dc-header__pick dc-header__scope-select",
            label: "Type",
            "model-value": A(a).query.value.entity ?? "",
            options: h.value,
            onOpen: A(o).refresh,
            onClose: A(o).cancel,
            "onUpdate:modelValue": V
          }, null, 8, ["model-value", "options", "onOpen", "onClose"])) : T("", !0),
          pe(ca, {
            class: "dc-header__pick dc-header__view-select",
            label: "View",
            "model-value": b.value,
            options: w.value,
            "onUpdate:modelValue": _
          }, null, 8, ["model-value", "options"]),
          (f(!0), m(ne, null, ve(C.value, (G) => (f(), m(ne, {
            key: G.term.id
          }, [
            G.or ? (f(), m("span", So, "or")) : T("", !0),
            x("button", {
              type: "button",
              class: Nt(["dc-term dc-mono", { "dc-term--idle": G.idle }]),
              title: G.idle ? `Not applied to ${A(a).entity.value?.label} — remove ${E(G.term)}` : `Remove ${E(G.term)}`,
              "aria-label": `Remove ${E(G.term)}`,
              onClick: (Oe) => A(a).removeTerm(G.term)
            }, N(E(G.term)), 11, Eo)
          ], 64))), 128)),
          It(x("input", {
            ref_key: "searchBox",
            ref: k,
            "onUpdate:modelValue": J[0] || (J[0] = (G) => P.value = G),
            class: "dc-header__search dc-mono",
            type: "text",
            autocomplete: "off",
            spellcheck: "false",
            placeholder: "Search…",
            "aria-label": "Search",
            onKeydown: [
              Je(Fe(K, ["prevent"]), ["enter"]),
              Je(Fe(R, ["prevent"]), ["esc"]),
              Je(Z, ["backspace"])
            ]
          }, null, 40, Po), [
            [wn, P.value]
          ])
        ], 40, Mo),
        x("button", {
          type: "button",
          class: "dc-header__toggle",
          "aria-expanded": e.expanded,
          "aria-controls": e.panelId,
          onClick: J[1] || (J[1] = (G) => s("toggle"))
        }, [
          x("span", zo, N(e.expanded ? "▲" : "▼"), 1),
          x("span", To, N(e.expanded ? "Hide query panel" : "Edit query"), 1)
        ], 8, Ao)
      ]),
      le.value ? (f(), m("nav", Lo, [
        x("button", {
          type: "button",
          class: "dc-header__step",
          "aria-label": "Previous page",
          disabled: j.value <= 1,
          onClick: J[2] || (J[2] = (G) => A(a).setPage(j.value - 1))
        }, [...J[5] || (J[5] = [
          x("span", { "aria-hidden": "true" }, "‹", -1)
        ])], 8, Ro),
        x("span", {
          class: "dc-header__page dc-mono",
          title: Pe.value
        }, [
          x("input", {
            class: "dc-header__page-box dc-mono",
            type: "text",
            inputmode: "numeric",
            autocomplete: "off",
            "aria-label": "Page",
            style: Ee({ width: Ye.value }),
            value: Xe.value,
            onFocus: Qe,
            onInput: We,
            onKeydown: [
              Je(Fe(Ie, ["prevent"]), ["enter"]),
              Je(Fe(He, ["prevent"]), ["esc"])
            ],
            onBlur: Ie
          }, null, 44, No),
          x("span", Io, "/ " + N(ge.value), 1)
        ], 8, Fo),
        x("span", Oo, N(Pe.value), 1),
        x("button", {
          type: "button",
          class: "dc-header__step",
          "aria-label": "Next page",
          disabled: j.value >= A(a).pageCount.value,
          onClick: J[3] || (J[3] = (G) => A(a).setPage(j.value + 1))
        }, [...J[6] || (J[6] = [
          x("span", { "aria-hidden": "true" }, "›", -1)
        ])], 8, Do)
      ])) : T("", !0),
      B.$slots.actions ? (f(), m("div", Bo, [
        xe(B.$slots, "actions", {}, void 0, !0)
      ])) : T("", !0)
    ], 8, bo));
  }
}), ar = /* @__PURE__ */ ce(Vo, [["__scopeId", "data-v-682f5b6d"]]), Ko = { class: "dc-facet" }, Wo = ["id"], Ho = { class: "dc-facet__body" }, Uo = ["aria-labelledby"], jo = ["aria-pressed", "data-dc-active", "onClick"], Go = ["aria-labelledby"], Xo = ["aria-label", "placeholder", "onKeydown"], Yo = ["aria-label", "placeholder", "onKeydown"], Qo = ["aria-checked"], Zo = { class: "dc-switch__text" }, Jo = ["data-dc-active"], ei = /* @__PURE__ */ oe({
  __name: "FacetControl",
  props: {
    facet: {},
    value: {}
  },
  emits: ["update"],
  setup(e, { emit: t }) {
    const n = e, s = t, a = v(
      () => n.value.kind === "chips" ? new Set(n.value.selected) : /* @__PURE__ */ new Set()
    );
    function r(h) {
      if (n.value.kind !== "chips") return;
      const y = a.value.has(h) ? n.value.selected.filter((w) => w !== h) : [...n.value.selected, h];
      s("update", { kind: "chips", selected: y });
    }
    const i = W(""), l = W("");
    ke(
      () => n.value,
      (h) => {
        h.kind === "range" && (i.value = h.min === null ? "" : h.min, l.value = h.max === null ? "" : h.max);
      },
      { immediate: !0, deep: !0 }
    );
    function o(h) {
      if (typeof h == "number") return Number.isFinite(h) ? h : null;
      const y = h.trim();
      if (!y) return null;
      const w = Number(y);
      return Number.isFinite(w) ? w : null;
    }
    function c() {
      if (n.value.kind !== "range") return;
      const h = o(i.value), y = o(l.value);
      h === n.value.min && y === n.value.max || s("update", { kind: "range", min: h, max: y });
    }
    function u() {
      n.value.kind === "toggle" && s("update", { kind: "toggle", on: !n.value.on });
    }
    return (h, y) => (f(), m("div", Ko, [
      x("span", {
        id: `dc-facet-${e.facet.key}`,
        class: "dc-facet__label"
      }, N(e.facet.label), 9, Wo),
      x("div", Ho, [
        e.facet.kind === "chips" && e.value.kind === "chips" ? (f(), m("div", {
          key: 0,
          class: "dc-facet__chips",
          role: "group",
          "aria-labelledby": `dc-facet-${e.facet.key}`
        }, [
          (f(!0), m(ne, null, ve(e.facet.options, (w) => (f(), m("button", {
            key: w,
            type: "button",
            class: "dc-chip",
            "aria-pressed": a.value.has(w),
            "data-dc-active": a.value.has(w) ? "true" : "false",
            onClick: (b) => r(w)
          }, N(w), 9, jo))), 128))
        ], 8, Uo)) : e.facet.kind === "range" && e.value.kind === "range" ? (f(), m("div", {
          key: 1,
          class: "dc-facet__range",
          role: "group",
          "aria-labelledby": `dc-facet-${e.facet.key}`
        }, [
          It(x("input", {
            "onUpdate:modelValue": y[0] || (y[0] = (w) => i.value = w),
            class: "dc-input dc-mono",
            type: "number",
            inputmode: "numeric",
            "aria-label": `${e.facet.label} minimum`,
            placeholder: String(e.facet.min),
            onChange: c,
            onBlur: c,
            onKeydown: Je(Fe(c, ["prevent"]), ["enter"])
          }, null, 40, Xo), [
            [wn, i.value]
          ]),
          y[2] || (y[2] = x("span", {
            class: "dc-facet__dash",
            "aria-hidden": "true"
          }, "–", -1)),
          It(x("input", {
            "onUpdate:modelValue": y[1] || (y[1] = (w) => l.value = w),
            class: "dc-input dc-mono",
            type: "number",
            inputmode: "numeric",
            "aria-label": `${e.facet.label} maximum`,
            placeholder: String(e.facet.max),
            onChange: c,
            onBlur: c,
            onKeydown: Je(Fe(c, ["prevent"]), ["enter"])
          }, null, 40, Yo), [
            [wn, l.value]
          ])
        ], 8, Go)) : e.facet.kind === "toggle" && e.value.kind === "toggle" ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-switch",
          role: "switch",
          "aria-checked": e.value.on,
          onClick: u
        }, [
          x("span", Zo, N(e.facet.text), 1),
          x("span", {
            class: "dc-switch__track",
            "data-dc-active": e.value.on ? "true" : "false",
            "aria-hidden": "true"
          }, [...y[3] || (y[3] = [
            x("span", { class: "dc-switch__knob" }, null, -1)
          ])], 8, Jo)
        ], 8, Qo)) : T("", !0)
      ])
    ]));
  }
}), rr = /* @__PURE__ */ ce(ei, [["__scopeId", "data-v-36d1334b"]]), ti = ["id"], ni = { class: "dc-panel__section dc-panel__rows" }, si = { class: "dc-panel__row" }, ai = ["for"], ri = ["title", "aria-label", "onClick"], li = ["id", "placeholder", "onKeydown"], oi = { class: "dc-panel__actions" }, ii = ["disabled"], ci = {
  key: 0,
  class: "dc-panel__section"
}, ui = /* @__PURE__ */ oe({
  __name: "QueryPanel",
  props: {
    panelId: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = t, s = Qt(), a = be(), r = v(() => zl(a.query.value.expr)), i = v(() => r.value.parts.map(Jt)), l = W(r.value.text), o = W(null);
    ke(
      () => r.value.text,
      ($) => {
        l.value = $;
      }
    );
    const c = v(() => l.value !== r.value.text);
    function u() {
      if (c.value) {
        const $ = Va(l.value, a.entity.value);
        a.setExpression(sa(r.value.parts, $));
      }
      n("close");
    }
    function h($) {
      const { parts: _, text: C } = r.value;
      a.setExpression(sa(_.filter((L, D) => D !== $), C));
    }
    function y($) {
      const { parts: _ } = r.value;
      l.value || !_.length || ($.preventDefault(), h(_.length - 1));
    }
    function w() {
      l.value = "", a.clearFilters();
    }
    function b($, _) {
      a.setFacet($, _);
    }
    return Ft(() => o.value?.focus()), ($, _) => (f(), m("div", {
      id: e.panelId,
      class: "dc-panel",
      role: "dialog",
      "aria-label": "Query",
      onKeydown: _[2] || (_[2] = Je(Fe((C) => n("close"), ["stop"]), ["esc"]))
    }, [
      x("section", ni, [
        x("div", si, [
          x("label", {
            class: "dc-panel__field-label",
            for: `${e.panelId}-expr`
          }, "Expression", 8, ai),
          x("div", {
            class: "dc-field",
            onMousedown: _[1] || (_[1] = Fe((C) => o.value?.focus(), ["self", "prevent"]))
          }, [
            (f(!0), m(ne, null, ve(i.value, (C, L) => (f(), m("button", {
              key: `${L}:${C}`,
              type: "button",
              class: "dc-part dc-mono",
              title: `Remove ${C}`,
              "aria-label": `Remove ${C}`,
              onClick: (D) => h(L)
            }, N(C), 9, ri))), 128)),
            It(x("input", {
              id: `${e.panelId}-expr`,
              ref_key: "expressionField",
              ref: o,
              "onUpdate:modelValue": _[0] || (_[0] = (C) => l.value = C),
              class: "dc-expression dc-mono",
              type: "text",
              autocomplete: "off",
              spellcheck: "false",
              placeholder: i.value.length ? "" : A(a).schema.value.placeholder,
              onKeydown: [
                Je(Fe(u, ["prevent"]), ["enter"]),
                Je(y, ["backspace"])
              ]
            }, null, 40, li), [
              [wn, l.value]
            ])
          ], 32)
        ]),
        A(a).entity.value ? (f(!0), m(ne, { key: 0 }, ve(A(a).entity.value.facets, (C) => (f(), te(rr, {
          key: C.key,
          facet: C,
          value: A(a).query.value.facets[C.key],
          onUpdate: (L) => b(C.key, L)
        }, null, 8, ["facet", "value", "onUpdate"]))), 128)) : T("", !0),
        x("div", oi, [
          x("button", {
            type: "button",
            class: "dc-button dc-button--primary",
            onClick: u
          }, " Run query "),
          x("button", {
            type: "button",
            class: "dc-button",
            disabled: A(a).isPristine.value && !c.value,
            onClick: w
          }, " Reset ", 8, ii)
        ])
      ]),
      s["panel-section"] ? (f(), m("section", ci, [
        xe($.$slots, "panel-section", {}, void 0, !0)
      ])) : T("", !0)
    ], 40, ti));
  }
}), lr = /* @__PURE__ */ ce(ui, [["__scopeId", "data-v-640ae2f5"]]), di = ["checked", "indeterminate"], or = /* @__PURE__ */ oe({
  __name: "PageTick",
  setup(e) {
    const t = be(), n = v(() => t.rows.value.filter((r) => t.isSelected(r)).length), s = v(
      () => t.rows.value.length > 0 && n.value === t.rows.value.length
    ), a = v(() => n.value > 0 && !s.value);
    return (r, i) => (f(), m("input", {
      class: "dc-tick",
      type: "checkbox",
      checked: s.value,
      indeterminate: a.value,
      "aria-label": "Select every row on this page",
      title: "Select every row on this page",
      onChange: i[0] || (i[0] = (l) => A(t).selectPage(!s.value))
    }, null, 40, di));
  }
}), fi = {
  key: 0,
  class: "dc-actions"
}, pi = {
  key: 0,
  class: "dc-actions__select"
}, vi = {
  key: 0,
  class: "dc-actions__all"
}, hi = {
  class: "dc-actions__count",
  "aria-live": "polite"
}, mi = {
  key: 1,
  class: "dc-actions__count dc-actions__all",
  "aria-live": "polite"
}, gi = { class: "dc-actions__ops" }, _i = ["disabled"], yi = ["disabled"], wi = /* @__PURE__ */ oe({
  __name: "RecordActions",
  props: {
    views: {}
  },
  setup(e) {
    const t = e, n = be(), s = v(() => n.entity.value), a = v(() => !us(n.query.value)), r = v(() => a.value && n.selectable.value), i = v(
      () => os(n.query.value.view, t.views) === "table"
    ), l = v(
      () => a.value && (r.value || !!(s.value?.create || s.value?.duplicate || s.value?.delete))
    ), o = v(() => n.selection.value.ids.length), c = v(() => o.value ? `${o.value} selected` : i.value ? "None selected" : "Select all");
    function u(h) {
      return o.value ? `${h} ${o.value}` : h;
    }
    return (h, y) => l.value ? (f(), m("div", fi, [
      r.value ? (f(), m("div", pi, [
        i.value ? (f(), m("span", mi, N(c.value), 1)) : (f(), m("label", vi, [
          pe(or),
          x("span", hi, N(c.value), 1)
        ])),
        o.value ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-actions__clear",
          onClick: y[0] || (y[0] = (w) => A(n).clearSelection())
        }, " Clear ")) : T("", !0)
      ])) : T("", !0),
      x("div", gi, [
        s.value?.create ? (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-actions__op dc-actions__new",
          onClick: y[1] || (y[1] = (w) => A(n).create(s.value))
        }, [
          y[4] || (y[4] = x("span", {
            class: "dc-actions__plus",
            "aria-hidden": "true"
          }, "+", -1)),
          je(" " + N(s.value.create), 1)
        ])) : T("", !0),
        s.value?.duplicate ? (f(), m("button", {
          key: 1,
          type: "button",
          class: "dc-actions__op",
          disabled: !o.value,
          onClick: y[2] || (y[2] = (w) => A(n).duplicate())
        }, N(u(s.value.duplicate)), 9, _i)) : T("", !0),
        s.value?.delete ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-actions__op dc-actions__danger",
          disabled: !o.value,
          onClick: y[3] || (y[3] = (w) => A(n).delete())
        }, N(u(s.value.delete)), 9, yi)) : T("", !0)
      ])
    ])) : T("", !0);
  }
}), ir = /* @__PURE__ */ ce(wi, [["__scopeId", "data-v-03ff2a91"]]);
function ki(e, t) {
  if (!e) return null;
  const n = qe(e, t);
  return typeof n == "string" && n.trim() ? n : null;
}
function bi(e, t) {
  const n = Ue(t, "state"), s = Ue(t, "tint");
  return {
    identity: hn(Ue(t, "identity"), e),
    reference: hn(Ue(t, "reference"), e),
    metrics: Ia(t, "metric").map((a) => ({
      column: a,
      label: a.label ?? "",
      text: Zt(a, e)
    })),
    state: n ? qe(n, e) ?? null : null,
    updated: hn(Ue(t, "updated"), e),
    image: ki(Ue(t, "image"), e),
    tint: s ? qe(s, e) ?? null : null
  };
}
function cr(e, t, n, s, a = !1) {
  const r = n?.columns ?? [];
  return {
    row: e,
    key: _l(e, t),
    entityLabel: e.entityLabel,
    entity: n,
    columns: r,
    ordinal: hl(t),
    parts: bi(e, r),
    pinned: s,
    selected: a
  };
}
function wt() {
  const e = be(), t = v(
    () => new Map(e.entities.value.map((n) => [n.key, n]))
  );
  return v(
    () => e.rows.value.map(
      (n, s) => cr(
        n,
        e.offset.value + s,
        t.value.get(n.entityKey) ?? null,
        e.isPinned(n),
        e.isSelected(n)
      )
    )
  );
}
const $i = ["data-dc-status"], xi = /* @__PURE__ */ oe({
  __name: "StatusPill",
  props: {
    status: {}
  },
  setup(e) {
    return (t, n) => (f(), m("span", {
      class: "dc-pill",
      "data-dc-status": e.status
    }, N(e.status), 9, $i));
  }
}), en = /* @__PURE__ */ ce(xi, [["__scopeId", "data-v-23e59fbf"]]), Ci = ["title"], Mi = { key: 1 }, Si = /* @__PURE__ */ oe({
  __name: "MetricDrill",
  props: {
    entry: {},
    column: {}
  },
  setup(e) {
    const t = e, n = be(), s = v(() => !t.entry.entity?.scope || !t.column.drill ? null : n.entities.value.find((o) => o.key === t.column.drill) ?? null), a = v(() => t.column.label ?? ""), r = v(() => Zt(t.column, t.entry.row));
    function i(l) {
      l.stopPropagation(), s.value && n.drill(t.entry.row, s.value, Ke(l));
    }
    return (l, o) => s.value ? (f(), m("button", {
      key: 0,
      type: "button",
      class: "dc-drill",
      title: `${a.value} of ${e.entry.parts.identity} — show the ${s.value.label.toLowerCase()}`,
      onClick: i
    }, [
      xe(l.$slots, "default", {}, () => [
        je(N(r.value), 1)
      ], !0)
    ], 8, Ci)) : (f(), m("span", Mi, [
      xe(l.$slots, "default", {}, () => [
        je(N(r.value), 1)
      ], !0)
    ]));
  }
}), tn = /* @__PURE__ */ ce(Si, [["__scopeId", "data-v-f2501b17"]]), Ei = ["data-dc-active", "aria-pressed", "aria-label"], Pi = /* @__PURE__ */ oe({
  __name: "PinStar",
  props: {
    row: {},
    pinned: { type: Boolean },
    name: {}
  },
  setup(e) {
    const t = e, n = be();
    function s(a) {
      a.stopPropagation(), n.togglePin(t.row);
    }
    return (a, r) => (f(), m("button", {
      type: "button",
      class: "dc-star",
      "data-dc-active": e.pinned ? "true" : "false",
      "aria-pressed": e.pinned,
      "aria-label": e.pinned ? `Unpin ${e.name}` : `Pin ${e.name}`,
      onClick: s
    }, N(e.pinned ? "★" : "☆"), 9, Ei));
  }
}), Cs = /* @__PURE__ */ ce(Pi, [["__scopeId", "data-v-ef63d763"]]), Ai = ["src"], zi = /* @__PURE__ */ oe({
  __name: "RowPicture",
  props: {
    src: {}
  },
  setup(e) {
    const t = e, n = W(!1);
    return ke(
      () => t.src,
      () => {
        n.value = !1;
      }
    ), (s, a) => e.src.trim() && !n.value ? (f(), m("img", {
      key: 0,
      class: "dc-picture",
      src: e.src,
      alt: "",
      loading: "lazy",
      decoding: "async",
      onError: a[0] || (a[0] = (r) => n.value = !0)
    }, null, 40, Ai)) : T("", !0);
  }
}), Sn = /* @__PURE__ */ ce(zi, [["__scopeId", "data-v-afaab300"]]), Ti = ["data-dc-standing", "title", "aria-label"], Li = /* @__PURE__ */ oe({
  __name: "QueryMark",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = be(), s = v(() => ps(t.entry.entity, t.entry.row)), a = v(() => Xa(n.query.value.expr, s.value)), r = v(
      () => a.value === "in" ? `The query narrows to ${t.entry.parts.identity} — press to lift that` : `The query leaves out ${t.entry.parts.identity} — press to lift that`
    );
    function i(l) {
      l.stopPropagation(), n.setExpression(Ya(n.query.value.expr, s.value));
    }
    return (l, o) => a.value ? (f(), m("button", {
      key: 0,
      type: "button",
      class: "dc-standing",
      "data-dc-standing": a.value,
      title: r.value,
      "aria-label": r.value,
      onClick: i
    }, N(a.value === "in" ? "+" : "−"), 9, Ti)) : T("", !0);
  }
}), En = /* @__PURE__ */ ce(Li, [["__scopeId", "data-v-4b8d4166"]]), Ri = ["data-dc-pending", "title", "aria-label"], Fi = /* @__PURE__ */ oe({
  __name: "ScopeMark",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = be(), s = v(
      () => n.narrowsOnPress.value ? null : t.entry.entity?.scope ?? null
    ), a = W(null);
    function r(c) {
      a.value = Ke(c).exclude ? "out" : "in";
    }
    function i(c) {
      r(c), window.addEventListener("keydown", r), window.addEventListener("keyup", r);
    }
    function l() {
      a.value = null, window.removeEventListener("keydown", r), window.removeEventListener("keyup", r);
    }
    Ve(l);
    function o(c) {
      c.stopPropagation(), n.drill(t.entry.row, null, Ke(c));
    }
    return (c, u) => s.value ? (f(), m("button", {
      key: 0,
      type: "button",
      class: "dc-scope",
      "data-dc-pending": a.value ?? void 0,
      title: `Narrow everything to ${s.value}: ${e.entry.row.id} — ⌘-click to leave it out`,
      "aria-label": `Narrow everything to ${e.entry.parts.identity}`,
      onPointerenter: i,
      onPointermove: r,
      onPointerleave: l,
      onClick: o
    }, " → ", 40, Ri)) : T("", !0);
  }
}), nn = /* @__PURE__ */ ce(Fi, [["__scopeId", "data-v-9efd42ac"]]), Ni = ["checked", "aria-label"], kt = /* @__PURE__ */ oe({
  __name: "SelectTick",
  props: {
    row: {},
    selected: { type: Boolean },
    name: {}
  },
  setup(e) {
    const t = e, n = be();
    function s(a) {
      a.stopPropagation(), n.toggleSelect(t.row);
    }
    return (a, r) => (f(), m("input", {
      class: "dc-tick",
      type: "checkbox",
      checked: e.selected,
      "aria-label": `Select ${e.name}`,
      onClick: s
    }, null, 8, Ni));
  }
}), Ii = { class: "dc-cards" }, Oi = { class: "dc-card__top dc-mono" }, Di = { class: "dc-card__lead" }, Bi = {
  key: 1,
  class: "dc-card__entity"
}, qi = { class: "dc-card__top-right" }, Vi = ["onClick"], Ki = { class: "dc-card__names" }, Wi = { class: "dc-card__primary" }, Hi = { class: "dc-card__secondary dc-mono" }, Ui = { class: "dc-card__metrics dc-mono" }, ji = {
  key: 0,
  class: "dc-card__date"
}, Gi = /* @__PURE__ */ oe({
  __name: "CardsView",
  setup(e) {
    const t = be(), n = wt(), s = v(() => t.isEverything.value);
    return (a, r) => (f(), m("div", Ii, [
      (f(!0), m(ne, null, ve(A(n), (i) => (f(), m("div", {
        key: i.key,
        class: "dc-card"
      }, [
        x("div", Oi, [
          x("span", Di, [
            A(t).selectable.value ? (f(), te(kt, {
              key: 0,
              row: i.row,
              selected: i.selected,
              name: i.parts.identity
            }, null, 8, ["row", "selected", "name"])) : T("", !0),
            je(" " + N(i.ordinal) + " ", 1),
            s.value ? (f(), m("span", Bi, N(i.entityLabel), 1)) : T("", !0)
          ]),
          x("span", qi, [
            i.parts.state ? (f(), te(en, {
              key: 0,
              status: i.parts.state
            }, null, 8, ["status"])) : T("", !0),
            pe(En, { entry: i }, null, 8, ["entry"]),
            pe(nn, { entry: i }, null, 8, ["entry"]),
            A(t).pinnable.value ? (f(), te(Cs, {
              key: 1,
              row: i.row,
              name: i.parts.identity,
              pinned: i.pinned
            }, null, 8, ["row", "name", "pinned"])) : T("", !0)
          ])
        ]),
        x("button", {
          type: "button",
          class: "dc-card__open",
          onClick: (l) => A(t).activate(i.row, A(Ke)(l))
        }, [
          i.parts.image ? (f(), te(Sn, {
            key: 0,
            class: "dc-card__image",
            src: i.parts.image
          }, null, 8, ["src"])) : T("", !0),
          x("span", Ki, [
            x("span", Wi, N(i.parts.identity), 1),
            x("span", Hi, N(i.parts.reference), 1)
          ])
        ], 8, Vi),
        x("div", Ui, [
          (f(!0), m(ne, null, ve(i.parts.metrics.slice(0, 2), (l) => (f(), te(tn, {
            key: l.column.key ?? l.label,
            entry: i,
            column: l.column
          }, {
            default: et(() => [
              je(N(l.label) + " " + N(l.text), 1)
            ]),
            _: 2
          }, 1032, ["entry", "column"]))), 128)),
          i.parts.updated ? (f(), m("span", ji, N(i.parts.updated), 1)) : T("", !0)
        ])
      ]))), 128))
    ]));
  }
}), ur = /* @__PURE__ */ ce(Gi, [["__scopeId", "data-v-28581543"]]), Xi = { class: "dc-grid" }, Yi = ["onClick"], Qi = { class: "dc-tile__scrim" }, Zi = { class: "dc-tile__top dc-mono" }, Ji = { class: "dc-tile__chip" }, ec = { class: "dc-tile__caption" }, tc = { class: "dc-tile__secondary dc-truncate" }, nc = { class: "dc-tile__primary" }, sc = /* @__PURE__ */ oe({
  __name: "GridView",
  setup(e) {
    const t = be(), n = wt();
    return (s, a) => (f(), m("div", Xi, [
      (f(!0), m(ne, null, ve(A(n), (r) => (f(), m("div", {
        key: r.key,
        class: "dc-grid__cell"
      }, [
        x("button", {
          type: "button",
          class: "dc-tile",
          style: Ee({ "--dc-tile-tint": r.parts.tint ?? void 0 }),
          onClick: (i) => A(t).activate(r.row, A(Ke)(i))
        }, [
          r.parts.image ? (f(), te(Sn, {
            key: 0,
            class: "dc-tile__image",
            src: r.parts.image
          }, null, 8, ["src"])) : T("", !0),
          x("span", Qi, [
            x("span", Zi, [
              x("span", Ji, N(r.ordinal), 1)
            ]),
            x("span", ec, [
              x("span", tc, N(r.parts.reference), 1),
              x("span", nc, N(r.parts.identity), 1)
            ])
          ])
        ], 12, Yi),
        A(t).selectable.value ? (f(), te(kt, {
          key: 0,
          class: "dc-grid__tick",
          row: r.row,
          selected: r.selected,
          name: r.parts.identity
        }, null, 8, ["row", "selected", "name"])) : T("", !0)
      ]))), 128))
    ]));
  }
}), dr = /* @__PURE__ */ ce(sc, [["__scopeId", "data-v-7df25d40"]]);
function ua(e, t, n, s) {
  return (n - s * (t - 1)) / e;
}
function In(e, t) {
  return e > 0 ? Math.min(t, e) : t;
}
function ac(e) {
  return e > 0 ? e : 1 / 0;
}
function rc(e, t, n) {
  const { width: s, height: a, gap: r = 0 } = n;
  if (!e.length) return [];
  if (!(s > 0) || !(a > 0)) return [{ items: [...e], height: a, filled: !1 }];
  const i = [];
  let l = [], o = 0, c = 0;
  for (const u of e) {
    const h = t(u), y = Math.max(h.ratio, Number.EPSILON), w = h.height && h.height > 0 ? Math.max(c, h.height) : c, b = In(w, a), $ = ua(o + y, l.length + 1, s, r);
    if ($ > b) {
      l.push(u), o += y, c = w;
      continue;
    }
    const _ = In(c, a), C = l.length ? ua(o, l.length, s, r) : 1 / 0;
    C <= ac(c) && C - _ < b - $ ? (i.push({ items: l, height: C, filled: !0 }), l = [u], o = y, c = h.height && h.height > 0 ? h.height : 0) : (i.push({ items: [...l, u], height: $, filled: !0 }), l = [], o = 0, c = 0);
  }
  return l.length && i.push({ items: l, height: In(c, a), filled: !1 }), i;
}
const lc = { class: "dc-images" }, oc = ["title", "aria-label", "onClick"], ic = {
  key: 1,
  class: "dc-images__blank",
  "aria-hidden": "true"
}, cc = 240, un = 8, uc = 1, dc = /* @__PURE__ */ oe({
  __name: "ImagesView",
  setup(e) {
    const t = be(), n = wt(), s = Us(/* @__PURE__ */ new Map()), a = Us(/* @__PURE__ */ new Set());
    function r(b, $) {
      const _ = $.target;
      _.naturalWidth > 0 && _.naturalHeight > 0 && s.set(b, { width: _.naturalWidth, height: _.naturalHeight });
    }
    function i(b) {
      const $ = b.parts.image;
      return $ && !a.has($) ? $ : null;
    }
    function l(b) {
      const $ = i(b);
      return $ ? s.get($) : void 0;
    }
    function o(b) {
      const $ = l(b);
      return $ ? { ratio: $.width / $.height, height: $.height } : { ratio: uc };
    }
    const c = W(null), u = W(0);
    let h = null;
    function y() {
      u.value = c.value?.clientWidth ?? 0;
    }
    Ca(() => {
      y(), !(!c.value || typeof ResizeObserver > "u") && (h = new ResizeObserver(y), h.observe(c.value));
    }), Ve(() => {
      h?.disconnect(), h = null;
    });
    const w = v(() => {
      const b = rc(n.value, o, {
        width: u.value,
        height: cc,
        gap: un
      }), $ = [];
      let _ = 0;
      for (const C of b) {
        let L = 0;
        for (const D of C.items) {
          const M = o(D).ratio * C.height, E = l(D), V = E !== void 0 && E.height < C.height;
          $.push({
            entry: D,
            style: {
              top: `${_}px`,
              left: `${L}px`,
              width: `${M}px`,
              height: `${C.height}px`
            },
            picture: V ? { width: `${E.width}px`, height: `${E.height}px` } : { width: "100%", height: "100%" }
          }), L += M + un;
        }
        _ += C.height + un;
      }
      return { boxes: $, height: b.length ? _ - un : 0 };
    });
    return (b, $) => (f(), m("div", lc, [
      x("div", {
        ref_key: "wall",
        ref: c,
        class: "dc-images__wall",
        style: Ee({ height: `${w.value.height}px` })
      }, [
        (f(!0), m(ne, null, ve(w.value.boxes, ({ entry: _, style: C, picture: L }) => (f(), m("div", {
          key: _.key,
          class: "dc-images__cell",
          style: Ee(C)
        }, [
          x("button", {
            type: "button",
            class: "dc-images__open",
            title: _.parts.identity,
            "aria-label": _.parts.identity,
            onClick: (D) => A(t).activate(_.row, A(Ke)(D))
          }, [
            i(_) ? (f(), te(Sn, {
              key: 0,
              class: "dc-images__picture",
              style: Ee(L),
              src: i(_),
              onLoad: (D) => r(i(_), D),
              onError: (D) => a.add(i(_))
            }, null, 8, ["style", "src", "onLoad", "onError"])) : (f(), m("span", ic, N(_.parts.identity), 1))
          ], 8, oc),
          A(t).selectable.value ? (f(), te(kt, {
            key: 0,
            class: "dc-images__tick",
            row: _.row,
            selected: _.selected,
            name: _.parts.identity
          }, null, 8, ["row", "selected", "name"])) : T("", !0)
        ], 4))), 128))
      ], 4)
    ]));
  }
}), fr = /* @__PURE__ */ ce(dc, [["__scopeId", "data-v-f708d83f"]]), fc = { class: "dc-links" }, pc = ["onClick"], vc = { class: "dc-link__primary dc-truncate" }, hc = { class: "dc-link__secondary dc-mono dc-truncate" }, mc = /* @__PURE__ */ oe({
  __name: "LinksView",
  setup(e) {
    const t = be(), n = wt();
    return (s, a) => (f(), m("div", fc, [
      (f(!0), m(ne, null, ve(A(n), (r) => (f(), m("span", {
        key: r.key,
        class: "dc-links__item"
      }, [
        A(t).selectable.value ? (f(), te(kt, {
          key: 0,
          row: r.row,
          selected: r.selected,
          name: r.parts.identity
        }, null, 8, ["row", "selected", "name"])) : T("", !0),
        x("button", {
          type: "button",
          class: "dc-link",
          onClick: (i) => A(t).activate(r.row, A(Ke)(i))
        }, [
          x("span", vc, N(r.parts.identity), 1),
          x("span", hc, N(r.parts.reference), 1)
        ], 8, pc)
      ]))), 128))
    ]));
  }
}), pr = /* @__PURE__ */ ce(mc, [["__scopeId", "data-v-08d0266c"]]), gc = {
  class: "dc-list",
  role: "list"
}, _c = ["onClick"], yc = { class: "dc-list__ordinal dc-mono" }, wc = { class: "dc-list__identity" }, kc = { class: "dc-list__primary dc-truncate" }, bc = { class: "dc-list__secondary dc-mono dc-truncate" }, $c = {
  key: 1,
  class: "dc-list__entity dc-mono"
}, xc = { class: "dc-list__metrics dc-mono" }, Cc = { class: "dc-list__trailing" }, Mc = /* @__PURE__ */ oe({
  __name: "ListView",
  setup(e) {
    const t = be(), n = wt(), s = v(() => t.isEverything.value);
    return (a, r) => (f(), m("div", gc, [
      (f(!0), m(ne, null, ve(A(n), (i) => (f(), m("div", {
        key: i.key,
        class: "dc-list__row",
        role: "listitem"
      }, [
        A(t).selectable.value ? (f(), te(kt, {
          key: 0,
          class: "dc-list__tick",
          row: i.row,
          selected: i.selected,
          name: i.parts.identity
        }, null, 8, ["row", "selected", "name"])) : T("", !0),
        x("button", {
          type: "button",
          class: "dc-list__open",
          onClick: (l) => A(t).activate(i.row, A(Ke)(l))
        }, [
          x("span", yc, N(i.ordinal), 1),
          x("span", wc, [
            x("span", kc, N(i.parts.identity), 1),
            x("span", bc, N(i.parts.reference), 1)
          ])
        ], 8, _c),
        s.value ? (f(), m("span", $c, N(i.entityLabel), 1)) : T("", !0),
        x("span", xc, [
          (f(!0), m(ne, null, ve(i.parts.metrics.slice(0, 2), (l) => (f(), te(tn, {
            key: l.column.key ?? l.label,
            entry: i,
            column: l.column
          }, null, 8, ["entry", "column"]))), 128))
        ]),
        x("span", Cc, [
          i.parts.state ? (f(), te(en, {
            key: 0,
            status: i.parts.state
          }, null, 8, ["status"])) : T("", !0),
          pe(En, { entry: i }, null, 8, ["entry"]),
          pe(nn, { entry: i }, null, 8, ["entry"]),
          A(t).pinnable.value ? (f(), te(Cs, {
            key: 1,
            row: i.row,
            name: i.parts.identity,
            pinned: i.pinned
          }, null, 8, ["row", "name", "pinned"])) : T("", !0)
        ])
      ]))), 128))
    ]));
  }
}), Gn = /* @__PURE__ */ ce(Mc, [["__scopeId", "data-v-11b9f46c"]]), Sc = { class: "dc-preview" }, Ec = { class: "dc-preview__pager dc-mono" }, Pc = ["disabled"], Ac = { "aria-live": "polite" }, zc = ["disabled"], Tc = {
  key: 0,
  class: "dc-preview__card"
}, Lc = ["src"], Rc = { class: "dc-preview__body" }, Fc = { class: "dc-preview__top" }, Nc = { class: "dc-preview__badges" }, Ic = { class: "dc-preview__entity dc-mono" }, Oc = { class: "dc-preview__marks" }, Dc = { class: "dc-preview__primary" }, Bc = { class: "dc-preview__secondary dc-mono" }, qc = { class: "dc-preview__fields" }, Vc = { class: "dc-preview__key" }, Kc = { class: "dc-preview__value dc-mono" }, Wc = /* @__PURE__ */ oe({
  __name: "PreviewView",
  setup(e) {
    const t = be(), n = wt(), s = W(0);
    ke(n, (o) => {
      s.value > o.length - 1 && (s.value = Math.max(0, o.length - 1));
    });
    const a = v(() => n.value[s.value]), r = v(() => {
      const o = a.value;
      if (!o) return [];
      const c = Ue(o.columns, "reference"), u = Ue(o.columns, "updated");
      return [
        ...c ? [{ key: c.label ?? "Reference", value: o.parts.reference, column: null }] : [],
        ...o.parts.metrics.map((h) => ({
          key: h.label,
          value: h.text,
          column: h.column
        })),
        ...u ? [{ key: u.label ?? "Updated", value: o.parts.updated, column: null }] : []
      ];
    }), i = v(() => {
      if (!n.value.length) return "0 / 0";
      const o = t.total.value > n.value.length ? ` of ${t.total.value}` : "";
      return `${s.value + 1} / ${n.value.length}${o}`;
    }), l = (o) => {
      const c = n.value.length;
      c && (s.value = Math.min(c - 1, Math.max(0, s.value + o)));
    };
    return (o, c) => (f(), m("div", Sc, [
      x("div", Ec, [
        x("button", {
          type: "button",
          class: "dc-preview__step",
          "aria-label": "Previous result",
          disabled: s.value === 0,
          onClick: c[0] || (c[0] = (u) => l(-1))
        }, " ‹ ", 8, Pc),
        x("span", Ac, N(i.value), 1),
        x("button", {
          type: "button",
          class: "dc-preview__step",
          "aria-label": "Next result",
          disabled: s.value >= A(n).length - 1,
          onClick: c[1] || (c[1] = (u) => l(1))
        }, " › ", 8, zc)
      ]),
      a.value ? (f(), m("div", Tc, [
        x("div", {
          class: "dc-preview__media",
          style: Ee({ background: a.value.parts.tint ?? void 0 }),
          "aria-hidden": "true"
        }, [
          a.value.parts.image ? (f(), m("img", {
            key: 0,
            class: "dc-preview__image",
            src: a.value.parts.image,
            alt: ""
          }, null, 8, Lc)) : (f(), m(ne, { key: 1 }, [
            je(" preview ")
          ], 64))
        ], 4),
        x("div", Rc, [
          x("div", Fc, [
            x("span", Nc, [
              A(t).selectable.value ? (f(), te(kt, {
                key: 0,
                row: a.value.row,
                selected: a.value.selected,
                name: a.value.parts.identity
              }, null, 8, ["row", "selected", "name"])) : T("", !0),
              a.value.parts.state ? (f(), te(en, {
                key: 1,
                status: a.value.parts.state
              }, null, 8, ["status"])) : T("", !0),
              x("span", Ic, N(a.value.entityLabel), 1)
            ]),
            x("span", Oc, [
              pe(En, { entry: a.value }, null, 8, ["entry"]),
              pe(nn, { entry: a.value }, null, 8, ["entry"]),
              A(t).pinnable.value ? (f(), te(Cs, {
                key: 0,
                row: a.value.row,
                name: a.value.parts.identity,
                pinned: a.value.pinned
              }, null, 8, ["row", "name", "pinned"])) : T("", !0)
            ])
          ]),
          x("div", null, [
            x("div", Dc, N(a.value.parts.identity), 1),
            x("div", Bc, N(a.value.parts.reference), 1)
          ]),
          x("dl", qc, [
            (f(!0), m(ne, null, ve(r.value, (u) => (f(), m("div", {
              key: u.key,
              class: "dc-preview__field"
            }, [
              x("dt", Vc, N(u.key), 1),
              x("dd", Kc, [
                u.column && a.value ? (f(), te(tn, {
                  key: 0,
                  entry: a.value,
                  column: u.column
                }, null, 8, ["entry", "column"])) : (f(), m(ne, { key: 1 }, [
                  je(N(u.value), 1)
                ], 64))
              ])
            ]))), 128))
          ]),
          x("button", {
            type: "button",
            class: "dc-preview__open",
            onClick: c[2] || (c[2] = (u) => A(t).activate(a.value.row, A(Ke)(u)))
          }, " Open record → ")
        ])
      ])) : T("", !0)
    ]));
  }
}), vr = /* @__PURE__ */ ce(Wc, [["__scopeId", "data-v-6be41155"]]);
function Hc() {
  const e = be();
  return v(() => ml(e.schema.value, e.entity.value));
}
const Uc = ["title"], jc = {
  key: 5,
  class: "dc-cell__text"
}, Gc = /* @__PURE__ */ oe({
  __name: "ColumnCell",
  props: {
    column: {},
    entry: {}
  },
  setup(e) {
    const t = e, n = be(), s = v(() => t.column.kind ?? "text"), a = v(() => qe(t.column, t.entry.row)), r = v(
      () => s.value === "ordinal" ? t.entry.ordinal : Zt(t.column, t.entry.row)
    ), i = v(() => a.value), l = v(() => t.column.activate === !0 || !!t.column.click), o = v(() => Un(t.column)), c = v(() => Oa(t.column, t.entry.row));
    function u(h) {
      if (!l.value) return;
      h.stopPropagation();
      const y = Ke(h);
      t.column.click?.(t.entry.row, y), t.column.activate && n.activate(t.entry.row, y);
    }
    return (h, y) => s.value === "component" && e.column.component ? (f(), te(ls(e.column.component), {
      key: 0,
      row: e.entry.row,
      entry: e.entry,
      value: a.value,
      column: e.column
    }, null, 8, ["row", "entry", "value", "column"])) : s.value === "status" ? (f(), te(en, {
      key: 1,
      status: i.value
    }, null, 8, ["status"])) : s.value === "image" ? (f(), te(Sn, {
      key: 2,
      class: "dc-cell__image",
      src: typeof a.value == "string" ? a.value : "",
      style: Ee({ maxHeight: e.column.height }),
      onClick: u
    }, null, 8, ["src", "style"])) : e.column.drill ? (f(), te(tn, {
      key: 3,
      entry: e.entry,
      column: e.column
    }, null, 8, ["entry", "column"])) : l.value ? (f(), m("button", {
      key: 4,
      type: "button",
      class: Nt(["dc-table__open", { "dc-truncate": o.value }]),
      title: c.value,
      onClick: u
    }, N(r.value), 11, Uc)) : (f(), m("span", jc, N(r.value), 1));
  }
}), da = /* @__PURE__ */ ce(Gc, [["__scopeId", "data-v-70ba8aa2"]]), Xc = ["aria-label"], Yc = ["data-dc-standing", "data-dc-active", "aria-checked", "title", "aria-label", "onClick"], Qc = /* @__PURE__ */ oe({
  __name: "StandingControl",
  props: {
    standing: {},
    mixed: { type: Boolean },
    name: {}
  },
  emits: ["set"],
  setup(e, { emit: t }) {
    const n = e, s = t, a = v(() => [
      { standing: "in", sign: "+", hint: `Narrow the query to ${n.name}` },
      { standing: null, sign: "·", hint: `Let the query say nothing about ${n.name}` },
      { standing: "out", sign: "−", hint: `Leave ${n.name} out of the query` }
    ]), r = (l) => !n.mixed && n.standing === l;
    function i(l, o) {
      l.stopPropagation(), s("set", o);
    }
    return (l, o) => (f(), m("span", {
      class: "dc-standing-control",
      role: "radiogroup",
      "aria-label": `Where the query stands on ${e.name}`
    }, [
      (f(!0), m(ne, null, ve(a.value, (c) => (f(), m("button", {
        key: c.sign,
        type: "button",
        role: "radio",
        class: "dc-standing-control__choice",
        "data-dc-standing": c.standing ?? "none",
        "data-dc-active": r(c.standing) ? "true" : "false",
        "aria-checked": r(c.standing),
        title: c.hint,
        "aria-label": c.hint,
        onClick: (u) => i(u, c.standing)
      }, N(c.sign), 9, Yc))), 128))
    ], 8, Xc));
  }
}), fa = /* @__PURE__ */ ce(Qc, [["__scopeId", "data-v-adaa8412"]]), Zc = {
  key: 0,
  class: "dc-table__none"
}, Jc = { class: "dc-table__detail" }, eu = ["data-dc-wrap"], tu = {
  key: 0,
  class: "dc-table__pick",
  scope: "col"
}, nu = {
  key: 1,
  class: "dc-table__standing",
  scope: "col"
}, su = ["data-dc-align", "data-dc-hide", "aria-sort", "title"], au = ["onClick"], ru = {
  key: 2,
  class: "dc-table__head"
}, lu = ["onClick"], ou = {
  key: 0,
  class: "dc-table__pick"
}, iu = {
  key: 1,
  class: "dc-table__standing"
}, cu = ["data-dc-align", "data-dc-hide", "title"], uu = {
  key: 0,
  class: "dc-table__name"
}, du = /* @__PURE__ */ oe({
  __name: "TableView",
  setup(e) {
    const t = be(), n = wt(), s = Hc();
    function a(k) {
      const K = Ml(k, t.entity.value), R = K ? `Shortcut: ${K}` : void 0;
      return [k.hint, R].filter(Boolean).join(`
`) || void 0;
    }
    const r = v(
      () => s.value.find((k) => k.scope)
    ), i = v(
      () => t.entity.value ? !!t.entity.value.scope : t.entities.value.some((k) => k.scope)
    ), l = (k) => ps(k.entity, k.row), o = (k) => Xa(t.query.value.expr, l(k));
    function c(k, K) {
      t.setExpression(la(t.query.value.expr, l(k), K));
    }
    const u = v(() => {
      const k = n.value.filter((R) => l(R) !== null), K = k.filter((R) => R.selected);
      return K.length ? K : k;
    }), h = v(() => u.value.some((k) => k.selected)), y = v(() => {
      const k = u.value[0];
      return k ? o(k) : null;
    }), w = v(
      () => u.value.some((k) => o(k) !== y.value)
    ), b = v(
      () => h.value ? "the ticked rows" : "every row on this page"
    );
    function $(k) {
      t.setExpression(
        u.value.reduce(
          (K, R) => la(K, l(R), k),
          t.query.value.expr
        )
      );
    }
    const _ = v(
      () => s.value.some((k) => k.kind === "image" || k.height !== void 0)
    );
    function C(k) {
      k && (t.query.value.sort === k ? t.toggleDirection() : t.setSort(k));
    }
    const L = v(() => t.entity.value?.label ?? "The result set"), D = v(() => new Set(t.sorts.value.map((k) => k.key))), M = (k) => k.sort !== void 0 && D.value.has(k.sort), E = (k) => {
      if (M(k))
        return t.query.value.sort !== k.sort ? "none" : t.query.value.dir === "desc" ? "descending" : "ascending";
    };
    function V(k) {
      return [
        Qs(k),
        k.muted ? "dc-table__muted" : "",
        k.mono ? "dc-mono" : "",
        Un(k) ? "dc-truncate" : ""
      ].filter(Boolean).join(" ");
    }
    function P(k, K) {
      if (!(!Un(k) || k.activate || k.click))
        return Oa(k, K.row);
    }
    return (k, K) => A(s).length ? (f(), m("table", {
      key: 1,
      class: "dc-table",
      "data-dc-wrap": _.value ? "" : void 0
    }, [
      x("thead", null, [
        x("tr", null, [
          A(t).selectable.value ? (f(), m("th", tu, [
            pe(or)
          ])) : T("", !0),
          i.value ? (f(), m("th", nu, [
            u.value.length ? (f(), te(fa, {
              key: 0,
              standing: y.value,
              mixed: w.value,
              name: b.value,
              onSet: $
            }, null, 8, ["standing", "mixed", "name"])) : T("", !0)
          ])) : T("", !0),
          (f(!0), m(ne, null, ve(A(s), (R, Z) => (f(), m("th", {
            key: A(Xs)(R, Z),
            scope: "col",
            class: Nt(A(Qs)(R)),
            style: Ee({ width: R.width }),
            "data-dc-align": A(Ys)(R),
            "data-dc-hide": R.hideBelow,
            "aria-sort": E(R),
            title: a(R)
          }, [
            M(R) ? (f(), m("button", {
              key: 0,
              type: "button",
              class: "dc-table__sort",
              onClick: (X) => C(R.sort)
            }, N(R.label), 9, au)) : (f(), m(ne, { key: 1 }, [
              je(N(R.label), 1)
            ], 64)),
            R.header ? (f(), m("span", ru, [
              (f(), te(ls(R.header), {
                column: R,
                entity: A(t).entity.value
              }, null, 8, ["column", "entity"]))
            ])) : T("", !0)
          ], 14, su))), 128))
        ])
      ]),
      x("tbody", null, [
        (f(!0), m(ne, null, ve(A(n), (R) => (f(), m("tr", {
          key: R.key,
          class: "dc-table__row",
          onClick: (Z) => A(t).activate(R.row, A(Ke)(Z))
        }, [
          A(t).selectable.value ? (f(), m("td", ou, [
            pe(kt, {
              row: R.row,
              selected: R.selected,
              name: R.parts.identity
            }, null, 8, ["row", "selected", "name"])
          ])) : T("", !0),
          i.value ? (f(), m("td", iu, [
            l(R) !== null ? (f(), te(fa, {
              key: 0,
              standing: o(R),
              name: R.parts.identity,
              onSet: (Z) => c(R, Z)
            }, null, 8, ["standing", "name", "onSet"])) : T("", !0)
          ])) : T("", !0),
          (f(!0), m(ne, null, ve(A(s), (Z, X) => (f(), m("td", {
            key: A(Xs)(Z, X),
            class: Nt(V(Z)),
            "data-dc-align": A(Ys)(Z),
            "data-dc-hide": Z.hideBelow,
            title: P(Z, R)
          }, [
            Z === r.value ? (f(), m("span", uu, [
              pe(da, {
                column: Z,
                entry: R
              }, null, 8, ["column", "entry"]),
              pe(nn, { entry: R }, null, 8, ["entry"])
            ])) : (f(), te(da, {
              key: 1,
              column: Z,
              entry: R
            }, null, 8, ["column", "entry"]))
          ], 10, cu))), 128))
        ], 8, lu))), 128))
      ])
    ], 8, eu)) : (f(), m("p", Zc, [
      K[2] || (K[2] = x("span", { class: "dc-table__headline" }, "No columns declared", -1)),
      x("span", Jc, [
        je(N(L.value) + " has no ", 1),
        K[0] || (K[0] = x("code", null, "columns", -1)),
        K[1] || (K[1] = je(" in the schema, so there is no table to draw. ", -1))
      ])
    ]));
  }
}), hr = /* @__PURE__ */ ce(du, [["__scopeId", "data-v-98495b60"]]);
function fu(e) {
  const t = Rt([]), n = W(!1), s = Rt(null);
  let a = 0;
  const r = (o, c, u, h, y) => ({
    entity: o,
    rows: c.rows.map(
      (w, b) => cr(w, b, o, e.isPinned(w.id))
    ),
    total: c.total,
    count: u ? o.count : String(c.total),
    pinned: pu(h, c, y)
  }), i = () => {
    const o = ++a, c = e.query.value, u = e.schema.value, h = e.entities.value, y = e.limit.value, w = e.within?.value.trim() ?? "", b = cs(c) && !w, $ = w ? fs(w, c.expr) : c.expr, _ = h.map((C) => ({
      entity: C,
      // Scope the query to this entity, keeping the expression and ordering
      // but dropping facets, which belong to whichever entity is selected.
      outcome: e.source.value.query({
        // Each card is the top few of its type, wherever the shell's own
        // result set has been paged to — so this asks for the first page.
        query: { ...c, entity: C.key, expr: $, facets: Ot(C), page: 1 },
        schema: u,
        entity: C,
        limit: y,
        offset: 0
      })
    }));
    if (_.every(({ outcome: C }) => !(C instanceof Promise))) {
      t.value = _.map(
        ({ entity: C, outcome: L }) => r(C, L, b, u, $)
      ), s.value = null, n.value = !1;
      return;
    }
    n.value = !0, Promise.all(_.map(({ outcome: C }) => Promise.resolve(C))).then((C) => {
      o === a && (t.value = C.map(
        (L, D) => r(_[D].entity, L, b, u, $)
      ), s.value = null);
    }).catch((C) => {
      o === a && (s.value = C, t.value = []);
    }).finally(() => {
      o === a && (n.value = !1);
    });
  }, l = () => {
    try {
      i();
    } catch (o) {
      s.value = o, t.value = [], n.value = !1;
    }
  };
  return ke(
    [
      e.source,
      e.schema,
      e.query,
      e.entities,
      e.limit,
      () => e.within?.value
    ],
    l,
    { immediate: !0 }
  ), { previews: t, pending: n, error: s, refresh: l };
}
function pu(e, t, n) {
  const s = t.rows[0];
  if (t.total !== 1 || t.rows.length !== 1 || !s)
    return !1;
  const a = n.trim();
  if (!a)
    return !1;
  const r = vs(e, s);
  return !!r && hs(a, r) === a;
}
const vu = ["data-dc-pending"], hu = {
  key: 0,
  class: "dc-types__state",
  role: "alert"
}, mu = {
  key: 1,
  class: "dc-types__state",
  "aria-live": "polite"
}, gu = {
  key: 2,
  class: "dc-types__state"
}, _u = ["data-dc-empty"], yu = ["onClick"], wu = { class: "dc-type__name" }, ku = { class: "dc-type__count dc-mono" }, bu = { class: "dc-type__sr" }, $u = {
  key: 0,
  class: "dc-type__empty"
}, xu = ["onClick"], Cu = { class: "dc-type__identity" }, Mu = { class: "dc-type__primary dc-truncate" }, Su = { class: "dc-type__secondary dc-mono dc-truncate" }, Eu = { class: "dc-type__trailing dc-mono" }, Pu = { class: "dc-type__metric-value" }, Au = { class: "dc-type__metric-label" }, zu = {
  key: 0,
  class: "dc-type__date"
}, Tu = ["onClick"], Lu = /* @__PURE__ */ oe({
  __name: "TypeCardsView",
  setup(e) {
    const t = be(), { previews: n, pending: s, error: a } = fu({
      source: t.source,
      schema: t.schema,
      query: t.query,
      entities: t.entities,
      limit: t.previewsPerType,
      within: t.within,
      isPinned: (l) => t.isPinnedId(l)
    }), r = v(() => !t.isPristine.value || !!t.within.value), i = v(
      () => n.value.filter(
        (l) => !l.pinned && (l.rows.length > 0 || l.entity.create)
      )
    );
    return (l, o) => (f(), m("div", {
      class: "dc-types",
      "data-dc-pending": A(s) ? "true" : "false"
    }, [
      xe(l.$slots, "before", {}, void 0, !0),
      A(a) ? (f(), m("p", hu, " Could not load results: " + N(A(a) instanceof Error ? A(a).message : "the data source failed."), 1)) : !i.value.length && A(s) ? (f(), m("p", mu, " Running query… ")) : i.value.length ? T("", !0) : (f(), m("p", gu, N(r.value ? "Nothing matches this query" : "Nothing here yet"), 1)),
      (f(!0), m(ne, null, ve(i.value, (c) => (f(), m("section", {
        key: c.entity.key,
        class: "dc-type",
        "data-dc-empty": c.rows.length ? "false" : "true"
      }, [
        x("button", {
          type: "button",
          class: "dc-type__head",
          onClick: (u) => A(t).setEntity(c.entity.key)
        }, [
          x("span", wu, N(c.entity.label), 1),
          x("span", ku, N(c.count), 1),
          o[0] || (o[0] = x("span", {
            class: "dc-type__go",
            "aria-hidden": "true"
          }, "→", -1)),
          x("span", bu, "Show only " + N(c.entity.label.toLowerCase()), 1)
        ], 8, yu),
        c.rows.length ? T("", !0) : (f(), m("p", $u, N(r.value ? "No matches" : "Nothing here yet"), 1)),
        (f(!0), m(ne, null, ve(c.rows, (u) => (f(), m("div", {
          key: u.key,
          class: "dc-type__row"
        }, [
          x("button", {
            type: "button",
            class: "dc-type__open",
            onClick: (h) => A(t).activate(u.row, A(Ke)(h))
          }, [
            x("span", Cu, [
              x("span", Mu, N(u.parts.identity), 1),
              x("span", Su, N(u.parts.reference), 1)
            ])
          ], 8, xu),
          x("span", Eu, [
            (f(!0), m(ne, null, ve(u.parts.metrics.slice(0, 1), (h) => (f(), te(tn, {
              key: h.column.key ?? h.label,
              class: "dc-type__metric",
              entry: u,
              column: h.column
            }, {
              default: et(() => [
                x("span", Pu, N(h.text), 1),
                x("span", Au, N(h.label), 1)
              ]),
              _: 2
            }, 1032, ["entry", "column"]))), 128)),
            u.parts.updated ? (f(), m("span", zu, N(u.parts.updated), 1)) : T("", !0),
            pe(En, { entry: u }, null, 8, ["entry"]),
            pe(nn, { entry: u }, null, 8, ["entry"])
          ])
        ]))), 128)),
        c.entity.create ? (f(), m("button", {
          key: 1,
          type: "button",
          class: "dc-type__new",
          onClick: (u) => A(t).create(c.entity)
        }, [
          o[1] || (o[1] = x("span", {
            class: "dc-type__plus",
            "aria-hidden": "true"
          }, "+", -1)),
          je(" " + N(c.entity.create), 1)
        ], 8, Tu)) : T("", !0)
      ], 8, _u))), 128)),
      xe(l.$slots, "after", {}, void 0, !0)
    ], 8, vu));
  }
}), mr = /* @__PURE__ */ ce(Lu, [["__scopeId", "data-v-c7b8f990"]]), Ru = ["data-dc-pending"], Fu = {
  key: 1,
  class: "dc-results__state",
  role: "alert"
}, Nu = { class: "dc-results__detail" }, Iu = {
  key: 2,
  class: "dc-results__state",
  "aria-live": "polite"
}, Ou = {
  key: 3,
  class: "dc-results__state"
}, Du = { class: "dc-results__detail" }, Bu = /* @__PURE__ */ oe({
  __name: "ResultsArea",
  props: {
    views: {}
  },
  setup(e) {
    const t = e, n = be(), s = Qt(), a = {
      list: Gn,
      cards: ur,
      grid: dr,
      images: fr,
      table: hr,
      links: pr,
      preview: vr
    }, r = v(() => us(n.query.value)), i = v(() => os(n.query.value.view, t.views)), l = v(() => a[i.value] ?? Gn), o = v(() => n.rows.value.length > 0), c = v(() => n.error.value !== null), u = W(null);
    return ke(
      () => n.query.value.page,
      () => {
        u.value && (u.value.scrollTop = 0);
      }
    ), (h, y) => (f(), m("div", {
      ref_key: "scroller",
      ref: u,
      class: "dc-results",
      "data-dc-pending": A(n).pending.value ? "true" : "false"
    }, [
      r.value ? (f(), te(mr, { key: 0 }, pn({ _: 2 }, [
        s["cards-before"] ? {
          name: "before",
          fn: et(() => [
            xe(h.$slots, "cards-before", {}, void 0, !0)
          ]),
          key: "0"
        } : void 0,
        s["cards-after"] ? {
          name: "after",
          fn: et(() => [
            xe(h.$slots, "cards-after", {}, void 0, !0)
          ]),
          key: "1"
        } : void 0
      ]), 1024)) : c.value ? (f(), m("p", Fu, [
        y[1] || (y[1] = x("span", { class: "dc-results__headline" }, "Could not load results", -1)),
        x("span", Nu, N(A(n).error.value instanceof Error ? A(n).error.value.message : "The data source failed."), 1)
      ])) : !o.value && A(n).pending.value ? (f(), m("p", Iu, [...y[2] || (y[2] = [
        x("span", { class: "dc-results__detail" }, "Running query…", -1)
      ])])) : o.value ? (f(), te(ls(l.value), { key: 4 })) : (f(), m("div", Ou, [
        y[3] || (y[3] = x("span", { class: "dc-results__headline" }, "Nothing matches this query", -1)),
        x("span", Du, N(A(n).summary.value), 1),
        A(n).isPristine.value ? T("", !0) : (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-results__clear",
          onClick: y[0] || (y[0] = (w) => A(n).clearFilters())
        }, N(A(n).isEverything.value ? "Clear filters" : "Search everything instead"), 1))
      ]))
    ], 8, Ru));
  }
}), gr = /* @__PURE__ */ ce(Bu, [["__scopeId", "data-v-c131c5c3"]]), qu = ["data-dc-theme"], Vu = ["data-dc-width", "data-dc-align"], Ku = { class: "dc-shell__panel" }, Wu = /* @__PURE__ */ oe({
  __name: "DataShell",
  props: /* @__PURE__ */ kn({
    schema: {},
    source: {},
    route: {},
    defaults: {},
    within: {},
    limit: { default: 50 },
    previewsPerType: { default: 3 },
    views: {},
    accent: {},
    tokens: {},
    theme: { default: "minimal" },
    matchWidth: { default: "grow" },
    headAlign: { default: "center" },
    pinnable: { type: Boolean },
    selectable: { type: Boolean },
    rowPress: { default: "narrow" },
    pagesNote: {},
    navigationMode: { default: "push" },
    facetNavigationMode: { default: "replace" }
  }, {
    open: { type: Boolean, default: !1 },
    openModifiers: {},
    pinned: { default: () => [] },
    pinnedModifiers: {},
    selected: { default: () => [] },
    selectedModifiers: {}
  }),
  emits: /* @__PURE__ */ kn(["activate", "create", "duplicate", "delete", "drill", "query-change", "toggle-pin"], ["update:open", "update:pinned", "update:selected"]),
  setup(e, { expose: t, emit: n }) {
    const s = e, a = n, r = Wt(e, "open"), i = Wt(e, "pinned"), l = Wt(e, "selected"), o = Qt(), c = Lt(Sa, null), u = s.route || c ? null : il(), h = s.route ?? c ?? u;
    Ve(() => u?.dispose?.());
    const y = v(() => Kl({ seed: s.schema.key })), w = v(() => s.source ?? y.value), b = eo({
      schema: () => s.schema,
      adapter: h,
      defaults: () => s.defaults,
      navigationMode: () => s.navigationMode,
      facetNavigationMode: () => s.facetNavigationMode
    }), $ = v(() => s.within?.trim() ?? ""), _ = to({
      source: w,
      query: b.query,
      schema: v(() => s.schema),
      entity: b.entity,
      limit: v(() => s.limit),
      within: $
    });
    ke(b.query, (S) => a("query-change", S)), ke(
      [_.pageCount, _.pending, b.query],
      () => {
        if (_.pending.value) return;
        const S = _.pageCount.value;
        b.query.value.page > S && b.setPage(S, "replace");
      },
      // Immediately, since a pasted URL is past the end before anything changes;
      // and after the render, so the correction is a navigation the mounted shell
      // makes rather than one it makes on the way up. An async source is still
      // pending here and corrects itself when its count lands.
      { immediate: !0, flush: "post" }
    );
    const C = as() ?? "dc-query-panel", L = W(null);
    function D() {
      r.value && (r.value = !1, Ft(() => {
        L.value?.$el?.querySelector(".dc-header__toggle")?.focus();
      }));
    }
    const M = v(() => new Set(i.value));
    function E(S) {
      const I = new Set(M.value);
      I.has(S.id) ? I.delete(S.id) : I.add(S.id), i.value = [...I], a("toggle-pin", S);
    }
    const V = v(() => {
      if (s.selectable === !0) return !0;
      const S = b.entity.value;
      return !!(S?.duplicate || S?.delete);
    }), P = v(() => new Set(l.value));
    function k(S) {
      const I = new Set(P.value);
      I.has(S.id) ? I.delete(S.id) : I.add(S.id), l.value = [...I];
    }
    function K(S) {
      const I = new Set(P.value);
      for (const j of _.rows.value)
        S ? I.add(j.id) : I.delete(j.id);
      l.value = [...I];
    }
    function R() {
      l.value.length && (l.value = []);
    }
    const Z = v(() => ({
      ids: [...l.value],
      rows: _.rows.value.filter((S) => P.value.has(S.id)),
      entity: b.entity.value
    }));
    ke(() => b.query.value.entity, R);
    function X(S, I, j = {}) {
      const le = Wl(s.schema, b.query.value, S, j);
      j.exclude ? b.narrow(le, I?.key ?? b.query.value.entity) : b.narrow(le, I?.key ?? null, I ? void 0 : "cards"), a("drill", S, I, j);
    }
    const ye = Hl({
      ...b,
      schema: v(() => s.schema),
      entities: v(() => s.schema.entities),
      rows: _.rows,
      total: _.total,
      limit: v(() => s.limit),
      offset: _.offset,
      pageCount: _.pageCount,
      pending: _.pending,
      counting: _.counting,
      error: _.error,
      source: w,
      previewsPerType: v(() => s.previewsPerType),
      within: $,
      pinnable: v(() => s.pinnable === !0),
      isPinned: (S) => M.value.has(S.id),
      isPinnedId: (S) => M.value.has(S),
      togglePin: E,
      selectable: V,
      selection: Z,
      isSelected: (S) => P.value.has(S.id),
      toggleSelect: k,
      selectPage: K,
      clearSelection: R,
      narrowsOnPress: v(() => s.rowPress === "narrow"),
      /*
       * The one place a press is read, so every view gets the same answer without
       * knowing which of the two it is: they all call this.
       */
      activate: (S, I = {}) => {
        if (s.rowPress === "narrow" && vs(s.schema, S)) {
          X(S, null, I);
          return;
        }
        a("activate", S);
      },
      create: (S) => a("create", S),
      duplicate: () => a("duplicate", Z.value),
      delete: () => a("delete", Z.value),
      drill: X
    }), ue = v(() => {
      if (!(!s.accent && !s.tokens))
        return { ...s.tokens, ...s.accent ? { "--dc-accent": s.accent } : {} };
    });
    return t({
      query: b.query,
      openPanel: () => {
        r.value = !0;
      },
      closePanel: D
    }), (S, I) => (f(), m("div", {
      class: "dc-shell",
      "data-dc-theme": e.theme,
      style: Ee(ue.value)
    }, [
      x("div", {
        class: "dc-shell__head",
        "data-dc-width": e.matchWidth,
        "data-dc-align": e.matchWidth === "shrink" ? e.headAlign : void 0
      }, [
        pe(ar, {
          ref_key: "headerRef",
          ref: L,
          expanded: r.value,
          "panel-id": A(C),
          views: e.views,
          "pages-note": e.pagesNote,
          onToggle: I[0] || (I[0] = (j) => r.value = !r.value)
        }, pn({ _: 2 }, [
          o.actions ? {
            name: "actions",
            fn: et(() => [
              xe(S.$slots, "actions", {}, void 0, !0)
            ]),
            key: "0"
          } : void 0
        ]), 1032, ["expanded", "panel-id", "views", "pages-note"]),
        r.value ? (f(), m(ne, { key: 0 }, [
          x("div", {
            class: "dc-shell__scrim",
            onClick: D
          }),
          x("div", Ku, [
            pe(lr, {
              "panel-id": A(C),
              onClose: D
            }, pn({ _: 2 }, [
              o["panel-section"] ? {
                name: "panel-section",
                fn: et(() => [
                  xe(S.$slots, "panel-section", {}, void 0, !0)
                ]),
                key: "0"
              } : void 0
            ]), 1032, ["panel-id"])
          ])
        ], 64)) : T("", !0)
      ], 8, Vu),
      pe(ir, { views: e.views }, null, 8, ["views"]),
      xe(S.$slots, "results", {
        rows: A(ye).rows.value,
        total: A(ye).total.value,
        offset: A(ye).offset.value,
        pageCount: A(ye).pageCount.value,
        query: A(ye).query.value,
        pending: A(ye).pending.value
      }, () => [
        pe(gr, { views: e.views }, pn({ _: 2 }, [
          o["cards-before"] ? {
            name: "cards-before",
            fn: et(() => [
              xe(S.$slots, "cards-before", {}, void 0, !0)
            ]),
            key: "0"
          } : void 0,
          o["cards-after"] ? {
            name: "cards-after",
            fn: et(() => [
              xe(S.$slots, "cards-after", {}, void 0, !0)
            ]),
            key: "1"
          } : void 0
        ]), 1032, ["views"])
      ], !0)
    ], 12, qu));
  }
}), Hu = /* @__PURE__ */ ce(Wu, [["__scopeId", "data-v-a366aa47"]]), Uu = ["data-dc-muted"], ju = {
  key: 0,
  class: "dc-shell-card__head"
}, Gu = { class: "dc-shell-card__title" }, Xu = {
  key: 0,
  class: "dc-shell-card__count dc-mono"
}, Yu = {
  key: 0,
  class: "dc-shell-card__aside"
}, Qu = ["data-dc-flush"], Zu = {
  key: 2,
  class: "dc-shell-card__foot"
}, Ju = /* @__PURE__ */ oe({
  __name: "ShellCard",
  props: {
    title: {},
    count: {},
    span: {},
    flush: { type: Boolean },
    muted: { type: Boolean }
  },
  setup(e) {
    const t = e, n = v(() => t.span === "all" ? { gridColumn: "1 / -1" } : void 0), s = Qt();
    function a(u) {
      return r(u?.() ?? []);
    }
    function r(u) {
      return u.some((h) => h.type === rl ? !1 : h.type === ll ? String(h.children ?? "").trim().length > 0 : h.type === ne ? r(h.children ?? []) : !0);
    }
    const i = v(() => !!t.title || l.value || a(s.head)), l = v(() => a(s.aside)), o = v(() => a(s.default)), c = v(() => a(s.foot));
    return (u, h) => (f(), m("section", {
      class: "dc-shell-card",
      style: Ee(n.value),
      "data-dc-muted": e.muted ? "true" : "false"
    }, [
      i.value ? (f(), m("header", ju, [
        xe(u.$slots, "head", {}, () => [
          x("h2", Gu, N(e.title), 1),
          e.count !== void 0 ? (f(), m("span", Xu, N(e.count), 1)) : T("", !0)
        ], !0),
        l.value ? (f(), m("span", Yu, [
          xe(u.$slots, "aside", {}, void 0, !0)
        ])) : T("", !0)
      ])) : T("", !0),
      o.value ? (f(), m("div", {
        key: 1,
        class: "dc-shell-card__body",
        "data-dc-flush": e.flush ? "true" : "false"
      }, [
        xe(u.$slots, "default", {}, void 0, !0)
      ], 8, Qu)) : T("", !0),
      c.value ? (f(), m("footer", Zu, [
        xe(u.$slots, "foot", {}, void 0, !0)
      ])) : T("", !0)
    ], 12, Uu));
  }
}), Gf = /* @__PURE__ */ ce(Ju, [["__scopeId", "data-v-75f2ef0b"]]), ed = ["aria-label"], td = ["aria-checked", "data-dc-active", "tabindex", "onClick", "onKeydown"], nd = /* @__PURE__ */ oe({
  __name: "SegmentedControl",
  props: {
    modelValue: {},
    options: {},
    label: {},
    mono: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = e, s = t, a = W([]);
    function r(i, l) {
      const o = n.options.length;
      let c = null;
      if (i.key === "ArrowRight" || i.key === "ArrowDown" ? c = (l + 1) % o : i.key === "ArrowLeft" || i.key === "ArrowUp" ? c = (l - 1 + o) % o : i.key === "Home" ? c = 0 : i.key === "End" && (c = o - 1), c === null) return;
      i.preventDefault();
      const u = n.options[c];
      u && (s("update:modelValue", u.key), a.value[c]?.focus());
    }
    return (i, l) => (f(), m("div", {
      class: "dc-segmented",
      role: "radiogroup",
      "aria-label": e.label
    }, [
      (f(!0), m(ne, null, ve(e.options, (o, c) => (f(), m("button", {
        key: o.key,
        ref_for: !0,
        ref_key: "buttons",
        ref: a,
        type: "button",
        role: "radio",
        class: Nt(["dc-segmented__item", { "dc-segmented__item--mono": e.mono }]),
        "aria-checked": o.key === e.modelValue,
        "data-dc-active": o.key === e.modelValue ? "true" : "false",
        tabindex: o.key === e.modelValue ? 0 : -1,
        onClick: (u) => s("update:modelValue", o.key),
        onKeydown: (u) => r(u, c)
      }, N(o.label), 43, td))), 128))
    ], 8, ed));
  }
}), sd = /* @__PURE__ */ ce(nd, [["__scopeId", "data-v-63fb5482"]]), ad = ["data-dc-theme", "aria-label"], rd = ["aria-expanded", "aria-disabled", "disabled", "data-dc-menu", "tabindex", "onClick", "onMouseenter"], ld = /* @__PURE__ */ oe({
  __name: "MenuBar",
  props: {
    menus: {},
    label: {},
    accent: {},
    tokens: {},
    theme: { default: "minimal" }
  },
  emits: ["choose"],
  setup(e, { emit: t }) {
    const n = e, s = v(() => {
      if (!(!n.accent && !n.tokens))
        return { ...n.tokens, ...n.accent ? { "--dc-accent": n.accent } : {} };
    }), a = t, r = W(null), i = W([]), l = W(null), o = W(null), c = W(!1), u = v(
      () => n.menus.flatMap((M, E) => Ht(M) ? [E] : [])
    );
    function h(M, E) {
      const V = i.value[M]?.getBoundingClientRect(), P = n.menus[M];
      !V || !P || !Ht(P) || (o.value = { x: V.left, y: V.bottom + 2, mirrorX: V.right }, l.value = M, c.value = E);
    }
    function y(M) {
      const E = l.value;
      l.value = null, o.value = null, M && E !== null && i.value[E]?.focus();
    }
    function w(M) {
      l.value === M ? y(!0) : h(M, !1);
    }
    function b(M) {
      l.value === null || l.value === M || h(M, !1);
    }
    function $(M, E) {
      const V = u.value;
      if (V.length === 0) return null;
      if (M === null) return E === 1 ? V[0] ?? null : V[V.length - 1] ?? null;
      const P = V.indexOf(M);
      return P === -1 ? V[0] ?? null : V[(P + E + V.length) % V.length] ?? null;
    }
    function _(M) {
      const E = M.key;
      if (E === "Escape") {
        if (l.value === null) return;
        M.preventDefault(), y(!0);
        return;
      }
      if (E === "ArrowDown" && l.value === null) {
        const k = C();
        if (k === null) return;
        M.preventDefault(), h(k, !0);
        return;
      }
      if (E !== "ArrowLeft" && E !== "ArrowRight") return;
      const V = l.value ?? C(), P = $(V, E === "ArrowRight" ? 1 : -1);
      P !== null && (M.preventDefault(), l.value !== null ? h(P, !0) : i.value[P]?.focus());
    }
    function C() {
      const M = i.value.findIndex((E) => E === document.activeElement);
      return M === -1 ? u.value[0] ?? null : M;
    }
    function L(M) {
      const E = M.target;
      !E || r.value?.contains(E) || y(!1);
    }
    ke(l, (M) => {
      M !== null ? window.addEventListener("pointerdown", L, !0) : window.removeEventListener("pointerdown", L, !0);
    }), Ve(() => window.removeEventListener("pointerdown", L, !0));
    function D(M) {
      y(!0), M.action?.(), a("choose", M);
    }
    return (M, E) => (f(), m("div", {
      ref_key: "bar",
      ref: r,
      class: "dc-shell dc-menubar",
      role: "menubar",
      "data-dc-theme": e.theme,
      "aria-label": e.label ?? "Main menu",
      style: Ee(s.value),
      onKeydown: _
    }, [
      (f(!0), m(ne, null, ve(e.menus, (V, P) => (f(), m("button", {
        key: V.id ?? V.label ?? P,
        ref_for: !0,
        ref: (k) => {
          k && (i.value[P] = k);
        },
        type: "button",
        class: "dc-menubar__item",
        role: "menuitem",
        "aria-haspopup": "menu",
        "aria-expanded": l.value === P,
        "aria-disabled": V.disabled ? "true" : void 0,
        disabled: V.disabled,
        "data-dc-menu": V.id ?? V.label,
        tabindex: P === (u.value[0] ?? 0) ? 0 : -1,
        onClick: (k) => w(P),
        onMouseenter: (k) => b(P)
      }, N(V.label), 41, rd))), 128)),
      l.value !== null && o.value ? (f(), te(xs, {
        key: l.value,
        items: e.menus[l.value]?.items ?? [],
        at: o.value,
        label: e.menus[l.value]?.label,
        autofocus: c.value,
        onChoose: D,
        onDismiss: E[0] || (E[0] = (V) => y(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : T("", !0)
    ], 44, ad));
  }
}), Xf = /* @__PURE__ */ ce(ld, [["__scopeId", "data-v-93dbd2e4"]]), od = ["aria-label", "aria-expanded", "disabled"], id = { "aria-hidden": "true" }, cd = /* @__PURE__ */ oe({
  __name: "MenuButton",
  props: {
    items: {},
    label: {},
    glyph: { default: "⋯" }
  },
  emits: ["choose"],
  setup(e, { emit: t }) {
    const n = t, s = W(null), a = W(null), r = W(null), i = W(!1), l = v(() => r.value !== null);
    function o(b) {
      const $ = s.value?.getBoundingClientRect();
      $ && (r.value = { x: $.left, y: $.bottom + 4, mirrorX: $.right }, i.value = b);
    }
    function c(b) {
      r.value = null, b && s.value?.focus();
    }
    function u() {
      l.value ? c(!0) : o(!1);
    }
    function h(b) {
      b.key !== "ArrowDown" || l.value || (b.preventDefault(), o(!0));
    }
    function y(b) {
      const $ = b.target;
      $ && (s.value?.contains($) || a.value?.root?.contains($) || c(!1));
    }
    ke(l, (b) => {
      b ? window.addEventListener("pointerdown", y, !0) : window.removeEventListener("pointerdown", y, !0);
    }), Ve(() => window.removeEventListener("pointerdown", y, !0));
    function w(b) {
      c(!0), b.action?.(), n("choose", b);
    }
    return (b, $) => (f(), m(ne, null, [
      x("button", {
        ref_key: "trigger",
        ref: s,
        type: "button",
        class: "dc-menu-button",
        "aria-label": e.label,
        "aria-haspopup": "menu",
        "aria-expanded": l.value,
        disabled: e.items.length === 0,
        onClick: u,
        onKeydown: h
      }, [
        x("span", id, N(e.glyph), 1)
      ], 40, od),
      r.value ? (f(), te(xs, {
        key: 0,
        ref_key: "menu",
        ref: a,
        items: e.items,
        at: r.value,
        label: e.label,
        autofocus: i.value,
        onChoose: w,
        onDismiss: $[0] || ($[0] = (_) => c(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : T("", !0)
    ], 64));
  }
}), Ms = /* @__PURE__ */ ce(cd, [["__scopeId", "data-v-48f5ada5"]]), Bt = (e) => e.kind === "split", Y = (e) => e.kind === "group", re = (e) => e.kind === "float", mt = { x: 16, y: 16, w: 360, h: 260 }, $n = 28, _r = 120, Xn = 220, yr = 38, xt = 6;
function sn(e, t) {
  let n = !1;
  const s = e.frames.map((a, r) => {
    const i = t(a.node, r);
    return i === a.node ? a : (n = !0, { ...a, node: i });
  });
  return n ? { ...e, frames: s } : e;
}
function tt(e) {
  return { kind: "group", panels: [e] };
}
function Yf(e, t, n) {
  return {
    kind: "group",
    panels: e,
    ...t ? { active: t } : {},
    ...n ? { title: n } : {}
  };
}
const _e = (e) => typeof e == "string", Ss = (e) => _e(e) ? tt(e) : e, an = (e) => _e(e) ? [e] : lt(e), pa = (e) => e.panels.filter(_e), ud = (e) => e.panels.filter((t) => !_e(t)), Be = (e, t) => e.panels.includes(t);
function rn(e, t, n) {
  let s = !1;
  const a = e.panels.map((r) => {
    if (_e(r) || !de(r, t)) return r;
    const i = n(r);
    return i !== r && (s = !0), i;
  });
  return s ? { ...e, panels: a } : e;
}
function Pn(e, t) {
  return { node: e, rect: { ...mt, ...t } };
}
function Es(e, t) {
  return t ? { kind: "float", frames: e, title: t } : { kind: "float", frames: e };
}
function Ps(e, t) {
  const n = { ...mt, ...t };
  return Es(
    e.map(
      (s, a) => Pn(s, {
        ...n,
        x: n.x + a * $n,
        y: n.y + a * $n
      })
    )
  );
}
function As(e, t, n, s) {
  return {
    kind: "split",
    direction: e,
    children: t,
    ...n ? { sizes: n } : {},
    ...s ? { title: s } : {}
  };
}
const zs = (e, t, n) => As("row", e, t, n), Qf = (e, t, n) => As("column", e, t, n);
function $e(e) {
  return {
    ...e.title ? { title: e.title } : {},
    ...e.fixedView ? { fixedView: !0 } : {},
    ...e.headless ? { headless: !0 } : {}
  };
}
const yt = (e) => e.fixedView === !0 || e.headless === !0 || !!e.title, Zf = (e) => ({ ...e, headless: !0 }), Jf = (e) => ({ ...e, fixedView: !0 }), dd = (e) => e === "left" || e === "right" ? "row" : "column";
function lt(e) {
  return Y(e) ? e.panels.flatMap(an) : re(e) ? e.frames.flatMap((t) => lt(t.node)) : e.children.flatMap(lt);
}
function de(e, t) {
  return Y(e) ? e.panels.some((n) => _e(n) ? n === t : de(n, t)) : re(e) ? e.frames.some((n) => de(n.node, t)) : e.children.some((n) => de(n, t));
}
const wr = (e) => lt(e).length === 0, Yn = (e) => !Y(e) && yt(e), Qn = (e) => wr(e) && !Yn(e);
function An(e) {
  return Bt(e) ? e.children.map((t, n) => ({ node: t, index: n })) : re(e) ? e.frames.map((t, n) => ({ node: t.node, index: n })) : e.panels.flatMap((t, n) => _e(t) ? [] : [{ node: t, index: n }]);
}
const Ts = (e) => An(e).map((t) => t.node);
function bt(e) {
  const t = e.active;
  if (t) {
    const n = e.panels.findIndex(
      (s) => _e(s) ? s === t : de(s, t)
    );
    if (n >= 0) return n;
  }
  return 0;
}
function kr(e) {
  const t = e.panels[bt(e)];
  return t !== void 0 && _e(t) ? t : "";
}
function Re(e) {
  if (_e(e)) return e;
  if (Y(e)) {
    const n = e.panels[bt(e)];
    return n === void 0 ? "" : Re(n);
  }
  if (re(e)) {
    const n = e.frames[e.frames.length - 1];
    return n ? Re(n.node) : "";
  }
  const t = e.children[0];
  return t ? Re(t) : "";
}
function Pt(e, t) {
  if (Y(e) && Be(e, t)) return e;
  for (const n of Ts(e)) {
    const s = Pt(n, t);
    if (s) return s;
  }
  return null;
}
function fd(e) {
  const t = Ts(e).flatMap(fd);
  return Y(e) ? [e, ...t] : t;
}
function Se(e, t) {
  if (Y(e)) {
    for (const n of ud(e)) {
      const s = Se(n, t);
      if (s) return s;
    }
    return null;
  }
  if (re(e)) {
    for (const n of e.frames)
      if (de(n.node, t))
        return Se(n.node, t) ?? n;
    return null;
  }
  for (const n of e.children) {
    const s = Se(n, t);
    if (s) return s;
  }
  return null;
}
function On(e, t, n = _r) {
  const s = (l, o) => o > 0 ? Math.max(Math.min(l, o), Math.min(n, o)) : Math.max(l, n), a = s(e.w, t.w), r = s(e.h, t.h), i = (l, o, c) => Math.min(Math.max(l, 0), Math.max(c - o, 0));
  return {
    x: Math.round(i(e.x, a, t.w)),
    y: Math.round(i(e.y, r, t.h)),
    w: Math.round(a),
    h: Math.round(r)
  };
}
function va(e, t, n, s, a = _r) {
  let { x: r, y: i, w: l, h: o } = e;
  return t.includes("e") && (l = e.w + n), t.includes("w") && (l = e.w - n, r = e.x + n), t.includes("s") && (o = e.h + s), t.includes("n") && (o = e.h - s, i = e.y + s), l < a && (t.includes("w") && (r = e.x + e.w - a), l = a), o < a && (t.includes("n") && (i = e.y + e.h - a), o = a), { x: r, y: i, w: l, h: o };
}
const br = (e, t) => e.x === t.x && e.y === t.y && e.w === t.w && e.h === t.h;
function At(e, t, n) {
  if (Y(e)) return rn(e, t, (r) => At(r, t, n));
  if (re(e)) {
    let r = !1;
    const i = e.frames.map((l) => {
      if (!de(l.node, t)) return l;
      if (Se(l.node, t)) {
        const c = At(l.node, t, n);
        return c === l.node ? l : (r = !0, { ...l, node: c });
      }
      const o = n(l);
      return o === l ? l : (r = !0, o);
    });
    return r ? { ...e, frames: i } : e;
  }
  if (!de(e, t)) return e;
  let s = !1;
  const a = e.children.map((r) => {
    const i = At(r, t, n);
    return i !== r && (s = !0), i;
  });
  return s ? { ...e, children: a } : e;
}
function pd(e, t, n) {
  return At(e, t, (s) => br(s.rect, n) ? s : { ...s, rect: n });
}
const it = (e) => e.maximized === !0, $r = (e) => (t) => {
  if (it(t) === e) return t;
  if (e) {
    const { minimized: a, ...r } = t;
    return { ...r, maximized: !0 };
  }
  const { maximized: n, ...s } = t;
  return s;
};
function vd(e, t, n = !0) {
  return At(e, t, $r(n));
}
function ep(e, t) {
  const n = Se(e, t);
  return n ? vd(e, t, !it(n)) : e;
}
const ht = (e) => e.minimized === !0, xr = (e) => (t) => {
  if (ht(t) === e) return t;
  if (e) {
    const { maximized: a, ...r } = t;
    return { ...r, minimized: !0 };
  }
  const { minimized: n, ...s } = t;
  return s;
};
function hd(e, t, n = !0) {
  return At(e, t, xr(n));
}
function tp(e, t) {
  const n = Se(e, t);
  return n ? hd(e, t, !ht(n)) : e;
}
function vt(e, t) {
  const n = t[t.length - 1];
  if (n === void 0) return null;
  const s = dt(e, t.slice(0, -1));
  return !s || !re(s) ? null : s.frames[n] ?? null;
}
function Zn(e, t) {
  if (re(e)) {
    for (const [n, s] of e.frames.entries()) {
      if (!de(s.node, t)) continue;
      const a = Zn(s.node, t);
      return a ? [n, ...a] : [n];
    }
    return null;
  }
  for (const { node: n, index: s } of An(e)) {
    if (!de(n, t)) continue;
    const a = Zn(n, t);
    return a ? [s, ...a] : null;
  }
  return null;
}
function Ls(e, t, n) {
  const s = t[t.length - 1];
  if (s === void 0) return e;
  const a = t.slice(0, -1), r = dt(e, a);
  if (!r || !re(r)) return e;
  const i = r.frames[s];
  if (!i) return e;
  const l = n(i);
  if (l === i) return e;
  const o = [...r.frames];
  return o[s] = l, _t(e, a, { ...r, frames: o });
}
function ha(e, t, n) {
  return Ls(
    e,
    t,
    (s) => br(s.rect, n) ? s : { ...s, rect: n }
  );
}
function md(e, t, n = !0) {
  return Ls(e, t, $r(n));
}
function gd(e, t, n = !0) {
  return Ls(e, t, xr(n));
}
function Ut(e, t) {
  const [n, ...s] = t;
  if (n === void 0) return e;
  if (re(e)) {
    const i = e.frames[n];
    if (!i) return e;
    const l = Ut(i.node, s), o = l === i.node ? i : { ...i, node: l };
    if (n === e.frames.length - 1 && o === i) return e;
    const c = [...e.frames];
    return c.splice(n, 1), c.push(o), { ...e, frames: c };
  }
  const a = dt(e, [n]);
  if (!a) return e;
  const r = Ut(a, s);
  return r === a ? e : _t(e, [n], r);
}
function _d(e, t) {
  const n = [...t];
  let s = e;
  return t.forEach((a, r) => {
    s && (re(s) && (n[r] = s.frames.length - 1), s = dt(s, [a]));
  }), n;
}
function mn(e, t, n, s) {
  if (Y(e)) return rn(e, n, (i) => mn(i, t, n, s));
  if (re(e)) {
    const i = e.frames.findIndex((o) => de(o.node, n)), l = e.frames[i];
    if (!l) return e;
    if (Se(l.node, n)) {
      const o = mn(l.node, t, n, s);
      if (o === l.node) return e;
      const c = [...e.frames];
      return c[i] = { ...l, node: o }, { ...e, frames: c };
    }
    return { ...e, frames: [...e.frames, Pn(tt(t), s)] };
  }
  if (!de(e, n)) return e;
  let a = !1;
  const r = e.children.map((i) => {
    const l = mn(i, t, n, s);
    return l !== i && (a = !0), l;
  });
  return a ? { ...e, children: r } : e;
}
function ma(e, t, n, s) {
  if (t === n || !de(e, t) || !de(e, n) || !Se(e, n)) return e;
  const a = gt(e, t);
  if (!a) return e;
  const r = mn(a, t, n, s);
  return r === a ? e : Ce(r);
}
function yd(e, t, n) {
  return re(e) ? { ...e, frames: [...e.frames, Pn(tt(t), n)] } : Y(e) ? Mr(e, t) : {
    kind: "split",
    direction: e.direction,
    children: [...e.children, tt(t)],
    sizes: [...rt(e), 1],
    ...$e(e)
  };
}
function Cr(e, t, n, s) {
  const a = n[0];
  if (a === void 0) return yd(e, t, s);
  const r = n.slice(1), i = (u, h) => h === a ? Cr(u, t, r, s) : gt(u, t);
  if (re(e)) {
    const u = e.frames.flatMap((h, y) => {
      const w = i(h.node, y);
      return w ? [w === h.node ? h : { ...h, node: w }] : [];
    });
    return { ...e, frames: u };
  }
  if (Y(e)) {
    const u = bt(e), h = [];
    e.panels.forEach((b, $) => {
      if (_e(b)) {
        b !== t && h.push(b);
        return;
      }
      const _ = i(b, $);
      _ && h.push(_);
    });
    const w = e.active && h.some((b) => an(b).includes(e.active)) ? e.active : Re(h[u] ?? h[h.length - 1]);
    return {
      kind: "group",
      panels: h,
      ...w ? { active: w } : {},
      ...$e(e)
    };
  }
  const l = rt(e), o = [], c = [];
  return e.children.forEach((u, h) => {
    const y = i(u, h);
    y && (o.push(y), c.push(l[h] ?? 0));
  }), { kind: "split", direction: e.direction, children: o, sizes: c, ...$e(e) };
}
function ga(e, t, n, s) {
  const a = dt(e, n);
  return !a || !wr(a) || !de(e, t) ? e : Ce(Cr(e, t, n, s));
}
function Dn(e, t) {
  if (Y(e)) return rn(e, t, (a) => Dn(a, t));
  if (re(e)) {
    const a = e.frames.findIndex((c) => de(c.node, t)), r = e.frames[a];
    if (!r) return e;
    const i = Dn(r.node, t), l = i === r.node ? r : { ...r, node: i };
    if (a === e.frames.length - 1 && l === r) return e;
    const o = [...e.frames];
    return o.splice(a, 1), o.push(l), { ...e, frames: o };
  }
  if (!de(e, t)) return e;
  let n = !1;
  const s = e.children.map((a) => {
    const r = Dn(a, t);
    return r !== a && (n = !0), r;
  });
  return n ? { ...e, children: s } : e;
}
function Rs(e, t) {
  if (e <= 0) return [];
  const n = () => Array.from({ length: e }, () => 1 / e);
  if (!t || t.length !== e) return n();
  const s = t.map((r) => Number.isFinite(r) && r > 0 ? r : 0), a = s.reduce((r, i) => r + i, 0);
  return a <= 0 ? n() : s.map((r) => r / a);
}
const rt = (e) => Rs(e.children.length, e.sizes), Ge = (e) => {
  const t = Y(e) ? e.panels.length : e.children.length;
  return e.places?.length === t ? e.places : void 0;
};
function Ce(e) {
  if (Y(e)) return wd(e);
  if (re(e)) {
    const l = e.frames.flatMap((o) => {
      const c = Ce(o.node);
      return Qn(c) ? [] : [c === o.node ? o : { ...o, node: c }];
    });
    return l.length === e.frames.length && l.every((o, c) => o === e.frames[c]) ? e : { ...e, frames: l };
  }
  if (e.children.length === 0) return e;
  const t = rt(e), n = Ge(e), s = [], a = [], r = [];
  e.children.forEach((l, o) => {
    const c = Ce(l), u = t[o] ?? 0;
    if (Qn(c)) return;
    if (!n && Bt(c) && c.direction === e.direction && !Ge(c) && !yt(c)) {
      const y = rt(c);
      c.children.forEach((w, b) => {
        s.push(w), a.push(u * (y[b] ?? 0));
      });
      return;
    }
    s.push(c), a.push(u);
    const h = n?.[o];
    h && r.push(h);
  });
  const i = s[0];
  return s.length === 1 && i && !yt(e) ? i : {
    kind: "split",
    direction: e.direction,
    children: s,
    sizes: Rs(s.length, a),
    ...$e(e),
    ...r.length === s.length && r.length > 0 ? { places: r } : {}
  };
}
function wd(e) {
  if (e.panels.every(_e)) return e;
  const t = Re(e), n = Ge(e), s = [], a = [];
  e.panels.forEach((l, o) => {
    const c = n?.[o];
    if (_e(l)) {
      s.push(l), c && a.push(c);
      return;
    }
    const u = Ce(l);
    if (!Qn(u)) {
      if (Y(u) && !yt(u) && !Ge(u)) {
        s.push(...u.panels);
        return;
      }
      s.push(u), c && a.push(c);
    }
  });
  const r = s[0];
  if (s.length === 1 && r !== void 0 && !_e(r) && !yt(e))
    return r;
  if (s.length === e.panels.length && s.every((l, o) => l === e.panels[o]))
    return e;
  const i = t && s.some((l) => an(l).includes(t)) ? t : void 0;
  return {
    kind: "group",
    panels: s,
    ...i ? { active: i } : {},
    ...$e(e),
    ...a.length === s.length && a.length > 0 ? { places: a } : {}
  };
}
function gt(e, t) {
  if (re(e)) {
    const i = e.frames.flatMap((l) => {
      const o = gt(l.node, t);
      return o ? [o === l.node ? l : { ...l, node: o }] : [];
    });
    return i.length === 0 && !Yn(e) ? null : { ...e, frames: i };
  }
  if (Y(e)) {
    if (!de(e, t)) return e;
    const i = bt(e), l = [];
    for (const u of e.panels) {
      if (_e(u)) {
        u !== t && l.push(u);
        continue;
      }
      const h = gt(u, t);
      h && l.push(h);
    }
    if (l.length === 0) return null;
    const c = e.active && l.some((u) => an(u).includes(e.active)) ? e.active : Re(l[i] ?? l[l.length - 1]);
    return c ? { kind: "group", panels: l, active: c, ...$e(e) } : { kind: "group", panels: l, ...$e(e) };
  }
  const n = rt(e), s = [], a = [];
  if (e.children.forEach((i, l) => {
    const o = gt(i, t);
    o && (s.push(o), a.push(n[l] ?? 0));
  }), s.length === 0)
    return Yn(e) ? { kind: "split", direction: e.direction, children: s, sizes: [], ...$e(e) } : null;
  const r = s[0];
  return s.length === 1 && r && !yt(e) ? r : Ce({
    kind: "split",
    direction: e.direction,
    children: s,
    sizes: a,
    ...$e(e)
  });
}
function Mr(e, t, n) {
  const s = e.panels.filter((r) => r !== t), a = n === void 0 ? s.length : Math.max(0, Math.min(n, s.length));
  return s.splice(a, 0, t), { kind: "group", panels: s, active: t, ...$e(e) };
}
function Kt(e, t, n, s, a) {
  const r = (w) => sn(
    w,
    (b) => de(b, n) ? Kt(b, t, n, s, a) : b
  );
  if (s === "float") return e;
  const i = (w) => rn(w, n, (b) => Kt(b, t, n, s, a));
  if (s === "center")
    return Y(e) ? Be(e, n) ? Mr(e, t, a) : i(e) : re(e) ? r(e) : {
      ...e,
      children: e.children.map(
        (w) => de(w, n) ? Kt(w, t, n, s, a) : w
      )
    };
  const l = dd(s), o = s === "left" || s === "top", c = (w) => ({
    kind: "split",
    direction: l,
    children: o ? [tt(t), w] : [w, tt(t)],
    sizes: [0.5, 0.5]
  });
  if (Y(e)) return Be(e, n) ? c(e) : i(e);
  if (re(e)) return r(e);
  const u = rt(e), h = e.children.findIndex(
    (w) => Y(w) && Be(w, n)
  );
  if (h >= 0 && e.direction === l) {
    const w = (u[h] ?? 0) / 2, b = [...e.children], $ = [...u];
    return b.splice(o ? h : h + 1, 0, tt(t)), $.splice(h, 1, w, w), {
      kind: "split",
      direction: l,
      children: b,
      sizes: $,
      ...$e(e)
    };
  }
  const y = e.children.map((w) => de(w, n) ? Y(w) && Be(w, n) ? c(w) : Kt(w, t, n, s) : w);
  return {
    kind: "split",
    direction: e.direction,
    children: y,
    sizes: u,
    ...$e(e)
  };
}
function zt(e, t) {
  if (Y(e)) {
    if (Be(e, t))
      return kr(e) === t ? e : { ...e, active: t };
    const a = e.panels.findIndex((o) => !_e(o) && de(o, t)), r = e.panels[a];
    if (r === void 0 || _e(r)) return e;
    const i = zt(r, t);
    if (i === r && e.active === t) return e;
    const l = [...e.panels];
    return l[a] = i, { ...e, panels: l, active: t };
  }
  if (!de(e, t)) return e;
  if (re(e)) return sn(e, (a) => zt(a, t));
  let n = !1;
  const s = e.children.map((a) => {
    const r = zt(a, t);
    return r !== a && (n = !0), r;
  });
  return n ? { ...e, children: s } : e;
}
function jt(e, t, n) {
  if (Y(e)) {
    if (!Be(e, t)) return rn(e, t, (c) => jt(c, t, n));
    const s = e.panels.indexOf(t), a = Math.max(0, Math.min(n, e.panels.length - 1));
    if (s === a) return e;
    const r = [...e.panels];
    r.splice(s, 1), r.splice(a, 0, t);
    const i = Ge(e), l = i ? [...i] : void 0;
    l && l.splice(a, 0, ...l.splice(s, 1));
    const o = Re(e);
    return {
      kind: "group",
      panels: r,
      ...o ? { active: o } : {},
      ...$e(e),
      ...l ? { places: l } : {}
    };
  }
  return de(e, t) ? re(e) ? sn(e, (s) => jt(s, t, n)) : { ...e, children: e.children.map((s) => jt(s, t, n)) } : e;
}
function gn(e, t, n) {
  if (t === n) return e;
  if (Y(e)) {
    if (!de(e, t) && !de(e, n)) return e;
    const s = (r) => r === t ? n : r === n ? t : r, a = e.panels.map((r) => _e(r) ? s(r) : gn(r, t, n));
    return { ...e, panels: a, ...e.active ? { active: s(e.active) } : {} };
  }
  return re(e) ? sn(e, (s) => gn(s, t, n)) : { ...e, children: e.children.map((s) => gn(s, t, n)) };
}
function dn(e, t, n, s, a) {
  if (s === "float" || !de(e, t) || !de(e, n)) return e;
  const r = Pt(e, t);
  if (s === "center" && r && Be(r, n)) {
    if (a === void 0) return e;
    const l = r.panels.indexOf(t), o = a > l ? a - 1 : a;
    return o === l ? e : zt(jt(e, t, o), t);
  }
  if (t === n) return e;
  const i = gt(e, t);
  return i ? Ce(Kt(i, t, n, s, a)) : e;
}
function Sr(e, t, n) {
  if (Y(e)) {
    const a = e.panels[t];
    if (a === void 0 || _e(a)) return e;
    const r = [...e.panels];
    return r[t] = n, { ...e, panels: r };
  }
  if (re(e)) {
    const a = e.frames[t];
    if (!a) return e;
    const r = [...e.frames];
    return r[t] = { ...a, node: n }, { ...e, frames: r };
  }
  const s = [...e.children];
  return s[t] = n, { ...e, children: s };
}
function ln(e, t, n) {
  const s = An(e);
  if (!Y(e) && s.some(({ node: a }) => Y(a) && Be(a, t))) {
    const a = n(e);
    return a === e ? null : a;
  }
  for (const { node: a, index: r } of s) {
    if (!de(a, t)) continue;
    const i = ln(a, t, n);
    return i ? Sr(e, r, i) : null;
  }
  return null;
}
function np(e, t, n) {
  const s = ln(
    e,
    t,
    (a) => Bt(a) && a.direction !== n ? { ...a, direction: n } : a
  );
  return s ? Ce(s) : e;
}
function Er(e) {
  return re(e) ? [e] : Ge(e) || yt(e) ? [e] : Y(e) ? [...e.panels] : e.children.flatMap(Er);
}
function Pr(e, t) {
  if (Y(e)) return e;
  const n = Ts(e).map(Er), s = n.flat(), a = t && s.some((i) => an(i).includes(t)) ? t : void 0, r = kd(e, n);
  return Ce({
    kind: "group",
    panels: s,
    ...a ? { active: a } : {},
    ...$e(e),
    ...r ? { places: r } : {}
  });
}
function kd(e, t) {
  const n = re(e) ? e.frames.map(({ node: s, ...a }) => a) : Ge(e);
  if (n)
    return t.every((s) => s.length === 1) ? n : void 0;
}
function bd(e, t) {
  const n = ln(e, t, (s) => Pr(s, t));
  return n ? Ce(n) : e;
}
function Fs(e, t, n) {
  if (Y(e) && Be(e, t)) {
    const s = n(e);
    return s === e ? null : s;
  }
  for (const { node: s, index: a } of An(e)) {
    if (!de(s, t)) continue;
    const r = Fs(s, t, n);
    return r ? Sr(e, a, r) : null;
  }
  return null;
}
function _a(e, t, n) {
  const s = Fs(e, t, (a) => {
    if (a.panels.length < 2) return a;
    const r = Ge(a);
    return {
      ...As(n, a.panels.map(Ss)),
      ...$e(a),
      ...r ? { places: r } : {}
    };
  });
  return s ? Ce(s) : e;
}
function Jn(e, t) {
  if (Y(e)) return e;
  if (re(e)) {
    const a = e.frames.findIndex(
      (l) => Y(l.node) && l.node.panels.includes(t)
    ), r = e.frames[a], i = r && Y(r.node) ? r.node : null;
    if (r && i && i.panels.length > 1) {
      const l = Ps(i.panels.map(Ss), r.rect).frames;
      return {
        ...e,
        frames: [...e.frames.slice(0, a), ...l, ...e.frames.slice(a + 1)]
      };
    }
    return sn(e, (l) => Jn(l, t));
  }
  if (!de(e, t)) return e;
  let n = !1;
  const s = e.children.map((a) => {
    const r = Jn(a, t);
    return r !== a && (n = !0), r;
  });
  return n ? { ...e, children: s } : e;
}
function $d(e, t, n) {
  const s = Pt(e, t);
  if (!s || s.panels.length < 2) return e;
  if (Se(e, t)?.node === s) {
    const i = Jn(e, t);
    return i === e ? e : Ce(i);
  }
  const r = Fs(e, t, (i) => ({
    ...Es(Ar(i.panels.map(Ss), Ge(i), n)),
    ...$e(i)
  }));
  return r ? Ce(r) : e;
}
function Ar(e, t, n) {
  return t ? e.map((s, a) => ({ ...t[a], node: s })) : Ps(e, n).frames;
}
function zr(e, t) {
  return { ...Es(Ar(e.children, Ge(e), t)), ...$e(e) };
}
function sp(e, t, n) {
  const s = ln(
    e,
    t,
    (a) => re(a) ? a : zr(a, n)
  );
  return s ? Ce(s) : Y(e) && Be(e, t) ? Ps([e], n) : e;
}
function xd(e, t) {
  const n = (a) => t === "column" ? a.rect.y : a.rect.x, s = (a) => t === "column" ? a.rect.x : a.rect.y;
  return [...e].sort((a, r) => n(a) - n(r) || s(a) - s(r));
}
function Tr(e, t) {
  const n = xd(e.frames, t);
  return {
    kind: "split",
    direction: t,
    children: n.map((s) => s.node),
    ...$e(e),
    places: n.map(({ node: s, ...a }) => a)
  };
}
function ap(e, t, n = "row") {
  const s = ln(
    e,
    t,
    (a) => re(a) ? Tr(a, n) : a
  );
  return s ? Ce(s) : e;
}
function Lr(e) {
  if (re(e)) return null;
  const t = Y(e) ? e.panels.length === 1 ? e.panels[0] : void 0 : e.children.length === 1 ? e.children[0] : void 0;
  return t === void 0 || _e(t) || Y(t) && t.panels.length === 1 && _e(t.panels[0]) ? null : t;
}
const Cd = (e) => {
  const { title: t, fixedView: n, headless: s, ...a } = e;
  return a;
};
function Md(e, t) {
  const n = Lr(e);
  return n ? t === "inner" ? n : { ...Cd(n), ...$e(e) } : e;
}
function Dt(e) {
  return e.title ? e.title : Y(e) ? "" : re(e) ? "Desktop" : e.direction === "row" ? "Row" : "Column";
}
function Gt(e, t) {
  if (Y(e)) {
    const s = e.panels[bt(e)];
    return s === void 0 ? "" : _e(s) ? t(s) ?? s : Dt(s) || Gt(s, t);
  }
  if (e.title) return e.title;
  if (re(e)) {
    const s = e.frames[e.frames.length - 1];
    return s ? s.title ?? Gt(s.node, t) : "";
  }
  const n = e.children[0];
  return n ? Gt(n, t) : "";
}
function dt(e, t) {
  let n = e;
  for (const s of t) {
    if (!n) return null;
    if (Bt(n)) n = n.children[s];
    else if (re(n)) n = n.frames[s]?.node;
    else {
      const a = n.panels[s];
      n = a === void 0 || _e(a) ? void 0 : a;
    }
  }
  return n ?? null;
}
function _t(e, t, n) {
  if (t.length === 0) return n;
  const [s, ...a] = t;
  if (s === void 0) return e;
  if (re(e)) {
    const o = e.frames[s];
    if (!o) return e;
    const c = _t(o.node, a, n);
    if (c === o.node) return e;
    const u = [...e.frames];
    return u[s] = { ...o, node: c }, { ...e, frames: u };
  }
  if (Y(e)) {
    const o = e.panels[s];
    if (o === void 0 || _e(o)) return e;
    const c = _t(o, a, n);
    if (c === o) return e;
    const u = [...e.panels];
    return u[s] = c, { ...e, panels: u };
  }
  const r = e.children[s];
  if (!r) return e;
  const i = _t(r, a, n);
  if (i === r) return e;
  const l = [...e.children];
  return l[s] = i, { ...e, children: l };
}
function _n(e, t, n) {
  if (t.length === 0)
    return Bt(e) ? { ...e, sizes: Rs(e.children.length, n) } : e;
  const [s, ...a] = t;
  if (s === void 0) return e;
  if (re(e)) {
    const l = e.frames[s];
    if (!l) return e;
    const o = _n(l.node, a, n);
    if (o === l.node) return e;
    const c = [...e.frames];
    return c[s] = { ...l, node: o }, { ...e, frames: c };
  }
  if (Y(e)) {
    const l = e.panels[s];
    if (l === void 0 || _e(l)) return e;
    const o = _n(l, a, n);
    if (o === l) return e;
    const c = [...e.panels];
    return c[s] = o, { ...e, panels: c };
  }
  const r = e.children[s];
  if (!r) return e;
  const i = [...e.children];
  return i[s] = _n(r, a, n), { ...e, children: i };
}
function ya(e, t, n, s = 0.02) {
  const a = e[t], r = e[t + 1];
  if (a === void 0 || r === void 0) return e;
  const i = a + r;
  if (i < s * 2) return e;
  const l = [...e], o = Math.min(Math.max(a + n, s), i - s);
  return l[t] = o, l[t + 1] = i - o, l;
}
function xn(e) {
  if (!Y(e) || e.panels.length >= 2) return e;
  const t = e.panels[0];
  return t !== void 0 && !_e(t) ? e : { ...zs([Sd(e)]), ...$e(e) };
}
const Sd = (e) => {
  if (!e.title) return e;
  const { title: t, ...n } = e;
  return n;
};
function wa(e) {
  return e.length === 0 ? null : zs(e.map(tt));
}
function Ed(e, t) {
  if (!e) return wa(t);
  const n = new Set(t), s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set();
  for (const o of lt(e))
    !n.has(o) || s.has(o) ? a.add(o) : s.add(o);
  let r = e;
  for (const o of a)
    r = r ? gt(r, o) : null;
  const i = new Set(r ? lt(r) : []), l = t.filter((o) => !i.has(o));
  if (l.length === 0) return r ? xn(Ce(r)) : null;
  if (!r) return wa(l);
  if (re(r)) {
    const o = r.frames.length;
    return {
      ...r,
      frames: [
        ...r.frames,
        ...l.map(
          (c, u) => Pn(tt(c), {
            x: mt.x + (o + u) * $n,
            y: mt.y + (o + u) * $n
          })
        )
      ]
    };
  }
  return xn(Ce(zs([r, ...l.map(tt)])));
}
const Ns = Symbol("dc.windowContext");
function Pd(e) {
  return ss(Ns, e), e;
}
function zn() {
  const e = Lt(Ns, null);
  if (!e)
    throw new Error(
      "[header-content-layout] No window context found. Render this component inside <WindowFrame>."
    );
  return e;
}
const Ad = ["data-dc-glyph"], zd = { class: "dc-glyph__line" }, Td = ["d"], Ld = {
  key: 0,
  class: "dc-glyph__aqua"
}, Rd = ["d"], Fd = /* @__PURE__ */ oe({
  __name: "WindowGlyph",
  props: {
    kind: {}
  },
  setup(e) {
    const t = {
      minimize: ["M2 5h6"],
      // Rolled up, the window is its own bar. A second square beside the maximize
      // one would be a riddle at this size; what unrolls is the body coming back
      // down, so that is the mark.
      unroll: ["M2.4 4l2.6 2.6L7.6 4"],
      maximize: ["M2.5 2.5h5v5h-5z"],
      // The near square, with the one it came from behind it.
      restore: ["M2 4.5h3.5V8H2z", "M4 4.5V2h4v4H5.5"],
      close: ["M2.4 2.4l5.2 5.2", "M7.6 2.4l-5.2 5.2"]
    }, n = {
      minimize: ["M2.2 4.3h5.6v1.4H2.2z"],
      unroll: ["M2.2 4.3h5.6v1.4H2.2z"],
      maximize: ["M8.4 1.6v4.2l-4.2-4.2z", "M1.6 8.4v-4.2l4.2 4.2z"],
      restore: ["M5 5h4.2L5 0.8z", "M5 5H0.8L5 9.2z"]
    };
    return (s, a) => (f(), m("svg", {
      class: "dc-glyph",
      "data-dc-glyph": e.kind,
      viewBox: "0 0 10 10",
      "aria-hidden": "true",
      focusable: "false"
    }, [
      x("g", zd, [
        (f(!0), m(ne, null, ve(t[e.kind], (r) => (f(), m("path", {
          key: r,
          d: r
        }, null, 8, Td))), 128))
      ]),
      n[e.kind] ? (f(), m("g", Ld, [
        (f(!0), m(ne, null, ve(n[e.kind], (r) => (f(), m("path", {
          key: r,
          d: r
        }, null, 8, Rd))), 128))
      ])) : T("", !0)
    ], 8, Ad));
  }
}), Tt = /* @__PURE__ */ ce(Fd, [["__scopeId", "data-v-4d2872c0"]]), Nd = ["data-dc-order", "data-dc-path", "data-dc-maximized", "data-dc-minimized", "data-dc-dragging"], Id = ["data-dc-movable"], Od = { class: "dc-float__title dc-truncate" }, Dd = {
  key: 1,
  class: "dc-float__controls dc-controls"
}, Bd = ["aria-label", "aria-pressed", "data-dc-minimize"], qd = ["aria-label", "aria-pressed", "data-dc-maximize"], Vd = ["aria-label", "data-dc-close"], Kd = { class: "dc-float__content" }, Wd = ["data-dc-handle", "onPointerdown"], Hd = /* @__PURE__ */ oe({
  __name: "WindowFloat",
  props: {
    frame: {},
    path: {},
    order: {},
    place: {}
  },
  setup(e) {
    const t = e, n = zn(), s = v(() => Re(t.frame.node)), a = v(() => n.panelFor(s.value)?.fixed === !0), r = v(() => it(t.frame)), i = v(() => ht(t.frame)), l = v(() => r.value || i.value), o = v(() => n.resizable.value && !a.value && !l.value), c = v(() => n.movable.value && !a.value && !l.value), u = v(() => {
      const E = lt(t.frame.node);
      return E.length === 1 ? E[0] ?? null : null;
    }), h = v(() => u.value !== null && n.closable(u.value)), y = v(() => t.frame.node.headless === !0), w = v(
      () => !y.value && (!Y(t.frame.node) || i.value)
    ), b = v(
      () => t.frame.title || Dt(t.frame.node) || Gt(t.frame.node, (E) => n.panelFor(E)?.title)
    ), $ = v(() => n.spaceMenu(t.path));
    function _(E) {
      E.target?.closest("button, a, input, select, textarea, label") || n.beginFrameDragAt(t.path, E, "move");
    }
    function C(E) {
      E.target?.closest("button, a, input, select, textarea, label") || (i.value ? n.toggleMinimizeAt(t.path) : n.toggleMaximizeAt(t.path));
    }
    const L = v(() => {
      const E = n.framing.value;
      return E !== null && de(t.frame.node, E);
    }), D = v(() => ({
      // Neither maximizing nor rolling up overwrites the rect: it is where the
      // window goes back to, and both are a way of not being there for a while.
      ...r.value ? { inset: "0" } : i.value && t.place ? {
        left: `${t.place.x}px`,
        bottom: `${t.place.bottom}px`,
        width: `${Xn}px`,
        height: `${yr}px`
      } : {
        left: `${t.frame.rect.x}px`,
        top: `${t.frame.rect.y}px`,
        width: `${t.frame.rect.w}px`,
        height: `${t.frame.rect.h}px`
      },
      // Back to front. The DOM order says the same thing, but a frame that paints
      // a shadow over its neighbour should not depend on that being noticed.
      zIndex: t.order + 1
    })), M = ["n", "s", "e", "w", "nw", "ne", "sw", "se"];
    return (E, V) => (f(), m("div", {
      class: "dc-float",
      style: Ee(D.value),
      "data-dc-order": e.order,
      "data-dc-path": e.path.join("/"),
      "data-dc-maximized": r.value ? "true" : "false",
      "data-dc-minimized": i.value ? "true" : "false",
      "data-dc-dragging": L.value ? "true" : "false",
      onPointerdown: V[3] || (V[3] = (P) => A(n).raiseAt(e.path))
    }, [
      w.value ? (f(), m("header", {
        key: 0,
        class: "dc-float__bar",
        "data-dc-movable": c.value ? "true" : "false",
        onPointerdown: _,
        onDblclick: C
      }, [
        x("span", Od, N(b.value), 1),
        $.value.length ? (f(), te(Ms, {
          key: 0,
          items: $.value,
          label: `${b.value} menu`
        }, null, 8, ["items", "label"])) : T("", !0),
        !a.value || i.value && h.value && u.value ? (f(), m("div", Dd, [
          a.value ? T("", !0) : (f(), m("button", {
            key: 0,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `${i.value ? "Unroll" : "Minimize"} ${b.value}`,
            "aria-pressed": i.value,
            "data-dc-minimize": s.value,
            onClick: V[0] || (V[0] = (P) => A(n).toggleMinimizeAt(e.path))
          }, [
            pe(Tt, {
              kind: i.value ? "unroll" : "minimize"
            }, null, 8, ["kind"])
          ], 8, Bd)),
          a.value ? T("", !0) : (f(), m("button", {
            key: 1,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `${r.value ? "Restore" : "Maximize"} ${b.value}`,
            "aria-pressed": r.value,
            "data-dc-maximize": s.value,
            onClick: V[1] || (V[1] = (P) => A(n).toggleMaximizeAt(e.path))
          }, [
            pe(Tt, {
              kind: r.value ? "restore" : "maximize"
            }, null, 8, ["kind"])
          ], 8, qd)),
          i.value && h.value && u.value ? (f(), m("button", {
            key: 2,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `Close ${b.value}`,
            "data-dc-close": u.value,
            onClick: V[2] || (V[2] = (P) => A(n).close(u.value))
          }, [
            pe(Tt, { kind: "close" })
          ], 8, Vd)) : T("", !0)
        ])) : T("", !0)
      ], 40, Id)) : T("", !0),
      x("div", Kd, [
        xe(E.$slots, "default", {}, void 0, !0)
      ]),
      (f(!0), m(ne, null, ve(o.value ? M : [], (P) => (f(), m("span", {
        key: P,
        class: "dc-float__grip",
        "data-dc-handle": P,
        "aria-hidden": "true",
        onPointerdown: Fe((k) => A(n).beginFrameDragAt(e.path, k, P), ["stop"])
      }, null, 40, Wd))), 128))
    ], 44, Nd));
  }
}), Ud = /* @__PURE__ */ ce(Hd, [["__scopeId", "data-v-f035684c"]]), Is = Symbol("dc.paneContext");
function Rr(e) {
  return ss(Is, e), e;
}
function rp() {
  return Lt(Is, null);
}
function lp(e) {
  const t = Lt(Ns, null), n = Lt(Is, null);
  if (!t || !n) return () => {
  };
  const s = t.registerMenu(
    () => n.panel.value,
    () => Mt(e)
  );
  return rs() && Cn(s), s;
}
const jd = ["data-dc-panel"], Gd = /* @__PURE__ */ oe({
  __name: "WindowPaneBody",
  props: {
    panel: {},
    active: { type: Boolean }
  },
  setup(e) {
    const t = e, n = zn();
    Rr({ panel: v(() => t.panel) });
    const s = () => {
      const a = n.panelFor(t.panel);
      return a ? n.renderContent(a, n.viewFor(t.panel), t.active) ?? null : null;
    };
    return (a, r) => (f(), m("div", {
      class: "dc-pane__content",
      "data-dc-panel": t.panel
    }, [
      pe(s)
    ], 8, jd));
  }
}), Xd = /* @__PURE__ */ ce(Gd, [["__scopeId", "data-v-31c655fd"]]), Yd = ["data-dc-panel", "data-dc-panels", "data-dc-tabbed", "data-dc-floating", "data-dc-maximized", "data-dc-headless", "data-dc-active", "data-dc-dragging", "aria-label"], Qd = ["data-dc-movable"], Zd = ["aria-label", "aria-pressed"], Jd = ["data-dc-space-name"], ef = { class: "dc-truncate" }, tf = ["aria-label"], nf = {
  key: 0,
  class: "dc-pane__insert",
  "aria-hidden": "true"
}, sf = ["id", "data-dc-panel", "data-dc-space", "aria-selected", "aria-controls", "tabindex", "onPointerdown", "onClick", "onKeydown"], af = { class: "dc-tab__name dc-truncate" }, rf = {
  key: 0,
  class: "dc-pane__sub dc-mono dc-truncate"
}, lf = ["aria-label", "data-dc-close", "onClick"], of = {
  key: 0,
  class: "dc-pane__insert",
  "aria-hidden": "true"
}, cf = { class: "dc-pane__tools" }, uf = {
  key: 2,
  class: "dc-pane__controls dc-controls"
}, df = ["aria-label", "data-dc-minimize"], ff = ["aria-label", "aria-pressed", "data-dc-maximize"], pf = ["aria-label", "data-dc-close"], vf = ["id", "role", "aria-labelledby"], hf = ["id", "role", "aria-labelledby"], mf = ["data-dc-edge"], gf = /* @__PURE__ */ oe({
  __name: "WindowPane",
  props: {
    group: {},
    path: {}
  },
  setup(e) {
    const t = e, n = zn(), s = as() ?? "dc-pane", a = v(
      () => t.group.panels.flatMap((O, U) => {
        if (!_e(O)) {
          const Ae = Dt(O) || Gt(O, (Te) => n.panelFor(Te)?.title);
          return [{ kind: "space", index: U, id: `space-${U}`, title: Ae, node: O }];
        }
        const Q = n.panelFor(O);
        return Q ? [{ kind: "panel", index: U, id: O, title: Q.title, panel: Q }] : [];
      })
    ), r = v(() => a.value.length > 1), i = v(() => {
      const O = bt(t.group);
      return a.value.find((U) => U.index === O) ?? a.value[0] ?? null;
    }), l = v(() => i.value?.kind === "space" ? i.value.node : null), o = v(() => l.value ? "" : kr(t.group)), c = v(() => l.value ? null : n.panelFor(o.value)), u = v(() => i.value?.title ?? ""), h = v(() => n.spaceNames.value ? t.group.title ?? "" : ""), y = v(() => [...t.path, i.value?.index ?? 0]), w = v(() => o.value || pa(t.group)[0] || ""), b = v(() => n.viewFor(o.value)), $ = v(() => t.group.headless === !0), _ = v(() => n.focused.value === o.value), C = v(() => n.dragging.value === o.value), L = v(() => n.moving.value === o.value), D = v(() => n.frameOf(w.value) !== null), M = v(() => n.panelFor(w.value)?.fixed === !0), E = v(
      () => !l.value && (n.canMove(o.value) || D.value && n.movable.value && !M.value)
    ), V = v(
      () => l.value ? n.spaceMenu(y.value) : n.menuFor(o.value)
    ), P = (O) => n.closable(O);
    Rr({ panel: o });
    const k = v(() => n.maximized(w.value)), K = v(
      () => D.value && !M.value || !r.value && !!c.value && P(c.value.id)
    ), R = (O) => `${s}-tab-${O}`, Z = v(() => `${s}-body`), X = v(() => {
      const O = n.dropTarget.value;
      return !O || !Be(t.group, O.panel) || O.edge === "float" ? null : O;
    }), ye = v(() => X.value?.index === void 0 ? X.value?.edge ?? null : null), ue = v(() => X.value?.index ?? null), S = v(
      () => a.value.flatMap(
        (O) => O.kind === "panel" && (O.id === o.value || O.panel.keepAlive === !0) ? [O.id] : []
      )
    ), I = W(null), j = /* @__PURE__ */ new Map();
    ke(
      o,
      (O, U) => {
        const Q = I.value;
        if (!Q || (U && j.set(U, Q.scrollTop), !n.panelFor(O)?.keepAlive || !j.has(O))) return;
        const Ae = j.get(O);
        Ft(() => {
          I.value && (I.value.scrollTop = Ae);
        });
      },
      { flush: "pre" }
    );
    const le = () => c.value ? n.renderActions(c.value, b.value, _.value) ?? null : null;
    let ge = null;
    function Pe(O) {
      const U = ge !== null && Math.hypot(O.clientX - ge.x, O.clientY - ge.y) >= 4;
      return ge = null, U;
    }
    const ze = (O) => O.kind === "panel" ? O.id : Re(O.node);
    function Xe(O, U) {
      U.kind !== "space" && (n.focus(U.id), ge = { x: O.clientX, y: O.clientY }, n.beginDrag(U.id, O));
    }
    function Ye(O, U) {
      if (Pe(O)) return;
      const Q = ze(U);
      Q && n.selectPanel(Q);
    }
    function Qe(O) {
      o.value && n.focus(o.value), !O.target?.closest(".dc-tab, button, a, input, select, textarea, label") && (D.value ? n.beginFrameDrag(w.value, O, "move") : n.beginDrag(o.value, O));
    }
    function We(O) {
      ge = { x: O.clientX, y: O.clientY }, n.beginDrag(o.value, O);
    }
    function Ie(O) {
      Pe(O) || n.toggleMoveMode(o.value);
    }
    const He = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down"
    };
    function B(O) {
      if (!L.value) return;
      if (O.key === "Escape") {
        O.preventDefault(), n.toggleMoveMode(o.value);
        return;
      }
      const U = He[O.key];
      U && (O.preventDefault(), D.value ? n.nudgeFrame(o.value, U, O.shiftKey) : n.nudge(o.value, U, O.shiftKey));
    }
    function J(O) {
      !D.value || O.target?.closest(".dc-tab, button, a, input, select, textarea, label") || n.toggleMaximize(w.value);
    }
    function G(O, U) {
      O.stopPropagation(), ge = null, n.close(U);
    }
    function Oe(O, U) {
      const Q = a.value.length;
      let Ae = null;
      if (O.key === "ArrowRight" ? Ae = (U + 1) % Q : O.key === "ArrowLeft" ? Ae = (U - 1 + Q) % Q : O.key === "Home" ? Ae = 0 : O.key === "End" && (Ae = Q - 1), Ae === null) return;
      O.preventDefault();
      const Te = a.value[Ae];
      if (!Te) return;
      const qt = ze(Te);
      qt && n.selectPanel(qt);
    }
    return (O, U) => i.value ? (f(), m("section", {
      key: 0,
      class: "dc-pane",
      "data-dc-panel": o.value || void 0,
      "data-dc-panels": A(pa)(e.group).join(" ") || void 0,
      "data-dc-tabbed": r.value ? "true" : "false",
      "data-dc-floating": D.value ? "true" : "false",
      "data-dc-maximized": k.value ? "true" : "false",
      "data-dc-headless": $.value ? "true" : "false",
      "data-dc-active": _.value ? "true" : "false",
      "data-dc-dragging": C.value ? "true" : "false",
      "aria-label": u.value,
      onFocusin: U[7] || (U[7] = (Q) => o.value && A(n).focus(o.value))
    }, [
      $.value ? T("", !0) : (f(), m("header", {
        key: 0,
        class: "dc-pane__head",
        "data-dc-movable": E.value ? "true" : "false",
        onPointerdown: Qe,
        onDblclick: J
      }, [
        E.value ? (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-pane__grip",
          "aria-label": `Move ${u.value}`,
          "aria-pressed": L.value,
          onPointerdown: We,
          onClick: Ie,
          onKeydown: B
        }, [...U[8] || (U[8] = [
          x("span", { "aria-hidden": "true" }, "⠿", -1)
        ])], 40, Zd)) : T("", !0),
        h.value ? (f(), m("span", {
          key: 1,
          class: "dc-pane__name",
          "data-dc-space-name": h.value
        }, [
          x("span", ef, N(h.value), 1)
        ], 8, Jd)) : T("", !0),
        x("div", {
          class: "dc-pane__tabs",
          role: "tablist",
          "aria-label": `${u.value} panels`
        }, [
          (f(!0), m(ne, null, ve(a.value, (Q, Ae) => (f(), m(ne, {
            key: Q.id
          }, [
            ue.value === Ae ? (f(), m("span", nf)) : T("", !0),
            x("button", {
              id: R(Q.id),
              type: "button",
              role: "tab",
              class: "dc-tab",
              "data-dc-panel": Q.kind === "panel" ? Q.id : void 0,
              "data-dc-space": Q.kind === "space" ? Q.title : void 0,
              "aria-selected": Q.index === i.value.index,
              "aria-controls": Z.value,
              tabindex: Q.index === i.value.index ? 0 : -1,
              onPointerdown: (Te) => Xe(Te, Q),
              onClick: (Te) => Ye(Te, Q),
              onKeydown: (Te) => Oe(Te, Ae)
            }, [
              x("span", af, N(Q.title), 1),
              Q.kind === "panel" && Q.panel.subtitle ? (f(), m("span", rf, N(Q.panel.subtitle), 1)) : T("", !0),
              r.value && Q.kind === "panel" && P(Q.id) ? (f(), m("span", {
                key: 1,
                class: "dc-tab__close",
                role: "button",
                tabindex: "-1",
                "aria-label": `Close ${Q.title}`,
                "data-dc-close": Q.id,
                onPointerdown: U[0] || (U[0] = Fe(() => {
                }, ["stop"])),
                onClick: (Te) => G(Te, Q.id)
              }, [...U[9] || (U[9] = [
                x("span", { "aria-hidden": "true" }, "×", -1)
              ])], 40, lf)) : T("", !0)
            ], 40, sf)
          ], 64))), 128)),
          ue.value === a.value.length ? (f(), m("span", of)) : T("", !0)
        ], 8, tf),
        x("div", cf, [
          pe(le),
          V.value.length ? (f(), te(Ms, {
            key: 0,
            items: V.value,
            label: `${u.value} menu`
          }, null, 8, ["items", "label"])) : T("", !0)
        ]),
        K.value ? (f(), m("div", uf, [
          D.value && !M.value ? (f(), m("button", {
            key: 0,
            type: "button",
            class: "dc-pane__button dc-control",
            "aria-label": `Minimize ${u.value}`,
            "data-dc-minimize": w.value,
            onPointerdown: U[1] || (U[1] = Fe(() => {
            }, ["stop"])),
            onClick: U[2] || (U[2] = (Q) => A(n).toggleMinimize(w.value))
          }, [
            pe(Tt, { kind: "minimize" })
          ], 40, df)) : T("", !0),
          D.value && !M.value ? (f(), m("button", {
            key: 1,
            type: "button",
            class: "dc-pane__button dc-control",
            "aria-label": `${k.value ? "Restore" : "Maximize"} ${u.value}`,
            "aria-pressed": k.value,
            "data-dc-maximize": w.value,
            onPointerdown: U[3] || (U[3] = Fe(() => {
            }, ["stop"])),
            onClick: U[4] || (U[4] = (Q) => A(n).toggleMaximize(w.value))
          }, [
            pe(Tt, {
              kind: k.value ? "restore" : "maximize"
            }, null, 8, ["kind"])
          ], 40, ff)) : T("", !0),
          !r.value && c.value && P(c.value.id) ? (f(), m("button", {
            key: 2,
            type: "button",
            class: "dc-pane__close dc-control",
            "aria-label": `Close ${u.value}`,
            "data-dc-close": c.value.id,
            onPointerdown: U[5] || (U[5] = Fe(() => {
            }, ["stop"])),
            onClick: U[6] || (U[6] = (Q) => A(n).close(c.value.id))
          }, [
            pe(Tt, { kind: "close" })
          ], 40, pf)) : T("", !0)
        ])) : T("", !0)
      ], 40, Qd)),
      l.value ? (f(), m("div", {
        key: 1,
        id: Z.value,
        class: "dc-pane__space",
        role: $.value ? void 0 : "tabpanel",
        "aria-labelledby": $.value ? void 0 : R(i.value.id)
      }, [
        xe(O.$slots, "space", {
          node: l.value,
          path: y.value
        }, void 0, !0)
      ], 8, vf)) : T("", !0),
      !l.value || S.value.length ? It((f(), m("div", {
        key: 2,
        id: l.value ? void 0 : Z.value,
        ref_key: "body",
        ref: I,
        class: "dc-pane__body",
        role: $.value || l.value ? void 0 : "tabpanel",
        "aria-labelledby": $.value || l.value ? void 0 : R(o.value)
      }, [
        (f(!0), m(ne, null, ve(S.value, (Q) => It((f(), te(Xd, {
          key: Q,
          panel: Q,
          active: Q === o.value && _.value
        }, null, 8, ["panel", "active"])), [
          [js, Q === o.value]
        ])), 128))
      ], 8, hf)), [
        [js, !l.value]
      ]) : T("", !0),
      ye.value ? (f(), m("div", {
        key: 3,
        class: "dc-pane__drop",
        "data-dc-edge": ye.value,
        "aria-hidden": "true"
      }, null, 8, mf)) : T("", !0)
    ], 40, Yd)) : T("", !0);
  }
}), Fr = /* @__PURE__ */ ce(gf, [["__scopeId", "data-v-2c3c5ecf"]]), _f = ["data-dc-space", "data-dc-path", "aria-label"], yf = {
  key: 0,
  class: "dc-space__head"
}, wf = { class: "dc-space__title dc-truncate" }, kf = ["data-dc-direction"], bf = {
  key: 0,
  class: "dc-space__drop",
  "aria-hidden": "true"
}, $f = ["aria-orientation", "aria-label", "aria-valuenow", "aria-disabled", "tabindex", "onPointerdown", "onKeydown"], xf = /* @__PURE__ */ oe({
  __name: "WindowNode",
  props: {
    node: {},
    path: {},
    framed: { type: Boolean }
  },
  setup(e) {
    const t = e, n = zn(), s = W(null), a = v(() => Y(t.node) ? t.node : null), r = v(() => Bt(t.node) ? t.node : null), i = v(() => re(t.node) ? t.node : null), l = v(
      () => r.value ? r.value.children : i.value?.frames.map((S) => S.node) ?? []
    ), o = v(() => r.value ? rt(r.value) : []), c = v(
      () => (i.value?.frames ?? []).map((S, I) => ({
        held: S,
        /** Place in the stack, counted from the back — what `z-index` follows. */
        order: I,
        key: P(S.node),
        path: [...t.path, I]
      })).sort((S, I) => S.key < I.key ? -1 : S.key > I.key ? 1 : 0)
    ), u = v(() => Dt(t.node)), h = v(() => n.spaceMenu(t.path)), y = v(() => t.node.headless === !0), w = v(() => i.value ? "desktop" : r.value?.direction ?? ""), b = W(null), $ = W(0);
    let _ = null;
    ke(
      b,
      (S) => {
        _?.disconnect(), _ = null, !(!S || typeof ResizeObserver > "u") && ($.value = S.clientWidth, _ = new ResizeObserver(([I]) => {
          $.value = I?.contentRect.width ?? 0;
        }), _.observe(S));
      },
      { immediate: !0 }
    ), Ve(() => _?.disconnect());
    const C = v(() => {
      const S = Math.max(
        1,
        Math.floor(($.value + xt) / (Xn + xt))
      ), I = /* @__PURE__ */ new Map();
      let j = 0;
      for (const le of c.value)
        le.held.minimized === !0 && (I.set(le.key, {
          x: xt + j % S * (Xn + xt),
          bottom: xt + Math.floor(j / S) * (yr + xt)
        }), j += 1);
      return I;
    }), L = (S) => !!S && S.join("/") === t.path.join("/"), D = v(() => {
      const S = n.dropTarget.value, I = i.value;
      if (!I || !S?.rect || S.edge !== "float") return null;
      if (S.space) return L(S.space) ? S.rect : null;
      const j = Se(I, S.panel);
      return j && I.frames.includes(j) ? S.rect : null;
    }), M = v(() => {
      const S = n.dropTarget.value;
      return !!S && !S.rect && L(S.space);
    }), E = v(() => r.value?.direction === "row"), V = v(() => l.value.map((S, I) => [...t.path, I])), P = (S) => [...lt(S)].sort().join("/"), k = (S) => {
      const I = lt(S)[0];
      return (I ? n.panelFor(I)?.title : null) ?? I ?? "panel";
    }, K = (S) => {
      const I = l.value[S], j = l.value[S + 1];
      return !I || !j ? "Resize panels" : `Resize ${k(I)} and ${k(j)}`;
    }, R = (S) => {
      const I = o.value[S] ?? 0, j = o.value[S + 1] ?? 0, le = I + j;
      return le > 0 ? Math.round(I / le * 100) : 50;
    };
    function Z() {
      const S = s.value, I = S ? E.value ? S.clientWidth : S.clientHeight : 0;
      return I <= 0 ? 0.05 : Math.min(n.minPanelSize.value / I, 0.4);
    }
    let X = null;
    function ye(S, I) {
      const j = r.value, le = s.value;
      if (!n.resizable.value || !j || !le || S.button !== 0) return;
      const ge = E.value ? le.clientWidth : le.clientHeight;
      if (ge <= 0) return;
      const Pe = E.value ? S.clientX : S.clientY, ze = rt(j), Xe = Math.min(n.minPanelSize.value / ge, 0.4);
      S.preventDefault();
      const Ye = (Ie) => {
        const He = ((E.value ? Ie.clientX : Ie.clientY) - Pe) / ge;
        n.setSizes(t.path, ya(ze, I, He, Xe));
      }, Qe = () => X?.(), We = (Ie) => {
        Ie.key === "Escape" && (n.setSizes(t.path, ze), X?.());
      };
      X = () => {
        window.removeEventListener("pointermove", Ye), window.removeEventListener("pointerup", Qe), window.removeEventListener("pointercancel", Qe), window.removeEventListener("keydown", We), X = null;
      }, window.addEventListener("pointermove", Ye), window.addEventListener("pointerup", Qe), window.addEventListener("pointercancel", Qe), window.addEventListener("keydown", We);
    }
    Ve(() => X?.());
    function ue(S, I) {
      const j = r.value;
      if (!n.resizable.value || !j) return;
      const le = E.value ? "ArrowRight" : "ArrowDown", ge = E.value ? "ArrowLeft" : "ArrowUp", Pe = S.shiftKey ? 0.1 : 0.02;
      if (S.key !== le && S.key !== ge) return;
      const ze = S.key === le ? Pe : -Pe;
      S.preventDefault(), n.setSizes(t.path, ya(rt(j), I, ze, Z()));
    }
    return (S, I) => {
      const j = Ma("WindowNode", !0);
      return a.value ? (f(), te(Fr, {
        key: 0,
        group: a.value,
        path: e.path
      }, {
        space: et(({ node: le, path: ge }) => [
          pe(j, {
            node: le,
            path: ge,
            framed: ""
          }, null, 8, ["node", "path"])
        ]),
        _: 1
      }, 8, ["group", "path"])) : (f(), m("section", {
        key: 1,
        class: "dc-space",
        "data-dc-space": w.value,
        "data-dc-path": e.path.join("/"),
        "aria-label": u.value
      }, [
        !e.framed && !y.value ? (f(), m("header", yf, [
          x("span", wf, N(u.value), 1),
          h.value.length ? (f(), te(Ms, {
            key: 0,
            items: h.value,
            label: `${u.value} menu`
          }, null, 8, ["items", "label"])) : T("", !0)
        ])) : T("", !0),
        i.value ? (f(), m("div", {
          key: 1,
          ref_key: "desktop",
          ref: b,
          class: "dc-window__desktop"
        }, [
          D.value ? (f(), m("div", {
            key: 0,
            class: "dc-window__drop",
            style: Ee({
              left: `${D.value.x}px`,
              top: `${D.value.y}px`,
              width: `${D.value.w}px`,
              height: `${D.value.h}px`
            }),
            "aria-hidden": "true"
          }, null, 4)) : T("", !0),
          (f(!0), m(ne, null, ve(c.value, (le) => (f(), te(Ud, {
            key: le.key,
            frame: le.held,
            path: le.path,
            order: le.order,
            place: C.value.get(le.key) ?? null
          }, {
            default: et(() => [
              pe(j, {
                node: le.held.node,
                path: le.path,
                framed: le.held.node.kind !== "group"
              }, null, 8, ["node", "path", "framed"])
            ]),
            _: 2
          }, 1032, ["frame", "path", "order", "place"]))), 128))
        ], 512)) : r.value ? (f(), m("div", {
          key: 2,
          ref_key: "container",
          ref: s,
          class: "dc-window__split",
          "data-dc-direction": r.value.direction
        }, [
          M.value ? (f(), m("div", bf)) : T("", !0),
          (f(!0), m(ne, null, ve(l.value, (le, ge) => (f(), m(ne, {
            key: P(le)
          }, [
            x("div", {
              class: "dc-window__cell",
              style: Ee({ flexGrow: o.value[ge] ?? 1 })
            }, [
              pe(j, {
                node: le,
                path: V.value[ge] ?? []
              }, null, 8, ["node", "path"])
            ], 4),
            ge < l.value.length - 1 ? (f(), m("div", {
              key: 0,
              class: "dc-window__gutter",
              role: "separator",
              "aria-orientation": E.value ? "vertical" : "horizontal",
              "aria-label": K(ge),
              "aria-valuenow": R(ge),
              "aria-valuemin": "0",
              "aria-valuemax": "100",
              "aria-disabled": A(n).resizable.value ? void 0 : "true",
              tabindex: A(n).resizable.value ? 0 : -1,
              onPointerdown: (Pe) => ye(Pe, ge),
              onKeydown: (Pe) => ue(Pe, ge)
            }, null, 40, $f)) : T("", !0)
          ], 64))), 128))
        ], 8, kf)) : T("", !0)
      ], 8, _f));
    };
  }
}), Cf = /* @__PURE__ */ ce(xf, [["__scopeId", "data-v-fb5b403f"]]), Mf = ["data-dc-theme", "data-dc-dragging", "data-dc-docking"], Sf = {
  key: 1,
  class: "dc-window__empty"
}, Ef = {
  class: "dc-window__live",
  "aria-live": "polite",
  role: "status"
}, fn = 16, Pf = /* @__PURE__ */ oe({
  __name: "WindowFrame",
  props: /* @__PURE__ */ kn({
    panels: {},
    movable: { type: Boolean, default: !1 },
    resizable: { type: Boolean, default: !0 },
    minPanelSize: { default: 120 },
    closable: { type: Boolean, default: !1 },
    menu: { type: Boolean, default: !0 },
    spaceNames: { type: Boolean, default: !0 },
    paneMenu: {},
    accent: {},
    tokens: {},
    theme: { default: "minimal" }
  }, {
    layout: { default: null },
    layoutModifiers: {},
    views: { default: () => ({}) },
    viewsModifiers: {}
  }),
  emits: /* @__PURE__ */ kn(["panel-move", "view-change", "panel-activate", "tab-select", "frame-change", "frame-maximize", "frame-minimize", "panel-close"], ["update:layout", "update:views"]),
  setup(e, { expose: t, emit: n }) {
    const s = e, a = n, r = Wt(e, "layout"), i = Wt(e, "views"), l = Qt(), o = v(() => new Map(s.panels.map((d) => [d.id, d]))), c = v(() => s.panels.map((d) => d.id)), u = v(() => Ed(r.value, c.value)), h = W(null), y = W(null), w = W(null), b = W(!0), $ = W(null), _ = W(null), C = W(null), L = W(""), D = W(null);
    function M() {
      const d = D.value;
      return d ? [...d.querySelectorAll(".dc-pane[data-dc-panels]")].filter((g) => g.closest(".dc-window") === d).map((g) => ({ panels: (g.dataset.dcPanels ?? "").split(" "), element: g })) : [];
    }
    function E(d) {
      const p = [];
      let g = d.closest(".dc-float");
      for (; g; )
        p.unshift(Number(g.dataset.dcOrder ?? 0)), g = g.parentElement?.closest(".dc-float") ?? null;
      return p;
    }
    function V() {
      return M().map((d) => ({ pane: d, order: E(d.element) })).sort((d, p) => {
        const g = Math.max(d.order.length, p.order.length);
        for (let z = 0; z < g; z += 1) {
          const F = (d.order[z] ?? -1) - (p.order[z] ?? -1);
          if (F !== 0) return F;
        }
        return 0;
      }).map((d) => d.pane);
    }
    const P = (d) => M().find((p) => p.panels.includes(d)) ?? null;
    function k(d) {
      const p = o.value.get(d);
      if (!p) return "";
      const g = i.value[d];
      return g && p.views?.some((z) => z.key === g) ? g : p.defaultView ?? p.views?.[0]?.key ?? "";
    }
    function K(d, p) {
      i.value = { ...i.value, [d]: p }, a("view-change", { panel: d, view: p });
    }
    const R = v(
      () => s.panels.filter((d) => d.fixed !== !0).length
    );
    function Z(d) {
      return !s.movable || R.value < 1 || s.panels.length < 2 ? !1 : o.value.get(d)?.fixed !== !0;
    }
    function X(d, p) {
      const g = u.value;
      !d || !g || d === g || (r.value = d, p && a("panel-move", p));
    }
    function ye(d, p, g) {
      if (d.width <= 0 || d.height <= 0) return "center";
      const z = (p - d.left) / d.width, F = (g - d.top) / d.height, q = 0.3;
      return z > q && z < 1 - q && F > q && F < 1 - q ? "center" : [
        { edge: "left", distance: z },
        { edge: "right", distance: 1 - z },
        { edge: "top", distance: F },
        { edge: "bottom", distance: 1 - F }
      ].reduce(
        (ie, H) => H.distance < ie.distance ? H : ie
      ).edge;
    }
    function ue(d, p) {
      const g = [...d.querySelectorAll(".dc-tab")], z = g.findIndex((F) => {
        const q = F.getBoundingClientRect();
        return p < q.left + q.width / 2;
      });
      return z === -1 ? g.length : z;
    }
    function S(d, p, g) {
      for (const { panels: z, element: F } of V().reverse()) {
        const q = F.getBoundingClientRect();
        if (d < q.left || d > q.right || p < q.top || p > q.bottom) continue;
        const he = z.find((se) => se !== g), ie = F.querySelector(".dc-pane__tabs"), H = ie?.getBoundingClientRect();
        if (ie && H && p >= H.top && p <= H.bottom)
          return he ? { panel: he, edge: "center", index: ue(ie, d) } : null;
        const ee = F.querySelector(":scope > .dc-pane__space");
        if (ee) {
          const se = ee.getBoundingClientRect();
          if (d >= se.left && d <= se.right && p >= se.top && p <= se.bottom) continue;
        }
        return he ? { panel: he, edge: ye(q, d, p) } : null;
      }
      return j(d, p, g) ?? Pe(d, p);
    }
    function I() {
      const d = D.value;
      return d ? [...d.querySelectorAll(".dc-window__desktop")].filter((p) => p.closest(".dc-window") === d).reverse() : [];
    }
    function j(d, p, g) {
      const z = u.value;
      if (!z) return null;
      for (const F of I()) {
        const q = F.getBoundingClientRect();
        if (d < q.left || d > q.right || p < q.top || p > q.bottom) continue;
        const he = ze(F), ie = he.flatMap((fe) => fe.panels).find((fe) => fe !== g);
        if (!ie && he.length > 0) return null;
        const H = Se(z, g)?.rect, ee = On(
          {
            x: d - q.left - 24,
            y: p - q.top - 12,
            w: H?.w ?? mt.w,
            h: H?.h ?? mt.h
          },
          { w: F.clientWidth, h: F.clientHeight },
          s.minPanelSize
        );
        if (ie) return { panel: ie, edge: "float", rect: ee };
        const se = le(F);
        return se ? { panel: "", space: se, edge: "float", rect: ee } : null;
      }
      return null;
    }
    function le(d) {
      const p = d.closest(".dc-space")?.getAttribute("data-dc-path");
      return p == null ? null : p === "" ? [] : p.split("/").map(Number);
    }
    function ge() {
      const d = D.value;
      return d ? [...d.querySelectorAll(".dc-space")].filter((p) => p.closest(".dc-window") === d).filter((p) => !p.querySelector(".dc-pane")).reverse().flatMap((p) => {
        const g = le(p);
        return g ? [{ element: p, path: g }] : [];
      }) : [];
    }
    function Pe(d, p) {
      for (const { element: g, path: z } of ge()) {
        if (g.dataset.dcSpace === "desktop") continue;
        const F = g.getBoundingClientRect();
        if (!(d < F.left || d > F.right || p < F.top || p > F.bottom))
          return { panel: "", space: z, edge: "center" };
      }
      return null;
    }
    function ze(d) {
      return M().filter(
        (p) => p.element.closest(".dc-window__desktop") === d
      );
    }
    let Xe = null;
    const Ye = (d) => d.altKey;
    function Qe(d, p) {
      if (!Z(d) || y.value || _.value || p.button !== 0) return;
      const g = p.clientX, z = p.clientY;
      let F = !1, q = Ye(p);
      const he = () => {
        const me = C.value;
        me && (w.value = q ? j(me.x, me.y, d) : S(me.x, me.y, d));
      }, ie = (me) => {
        if (!F) {
          if (Math.hypot(me.clientX - g, me.clientY - z) < 4) return;
          F = !0, y.value = d, $.value = null;
        }
        q = Ye(me), b.value = !q, C.value = { x: me.clientX, y: me.clientY }, he();
      }, H = (me) => {
        Ye(me) !== q && (q = !q, b.value = !q, F && he());
      }, ee = (me) => {
        Xe?.();
        const ae = w.value, Le = u.value;
        if (me && F && ae && Le) {
          const ot = ae.space ? ga(Le, d, ae.space, ae.rect) : ae.edge === "float" && ae.rect ? ma(Le, d, ae.panel, ae.rect) : dn(Le, d, ae.panel, ae.edge, ae.index);
          X(ot, {
            panel: d,
            target: ae.panel,
            edge: ae.edge,
            ...ae.space === void 0 ? {} : { space: ae.space },
            ...ae.index === void 0 ? {} : { index: ae.index },
            ...ae.rect === void 0 ? {} : { rect: ae.rect }
          });
        }
        y.value = null, w.value = null, C.value = null, b.value = !0;
      }, se = () => ee(!0), fe = () => ee(!1), we = (me) => {
        if (me.key === "Escape") {
          ee(!1);
          return;
        }
        H(me);
      };
      Xe = () => {
        window.removeEventListener("pointermove", ie), window.removeEventListener("pointerup", se), window.removeEventListener("pointercancel", fe), window.removeEventListener("keydown", we), window.removeEventListener("keyup", H), Xe = null;
      }, window.addEventListener("pointermove", ie), window.addEventListener("pointerup", se), window.addEventListener("pointercancel", fe), window.addEventListener("keydown", we), window.addEventListener("keyup", H);
    }
    Ve(() => Xe?.());
    let We = null;
    function Ie(d) {
      const p = D.value;
      return p ? [...p.querySelectorAll(
        `.dc-float[data-dc-path="${d.join("/")}"]`
      )].find((F) => F.closest(".dc-window") === p)?.parentElement ?? null : null;
    }
    function He(d) {
      const p = u.value;
      return p ? Zn(p, d) : null;
    }
    function B(d) {
      const p = u.value;
      if (!p) return;
      const g = Ut(p, d);
      g !== p && (r.value = g);
    }
    function J(d) {
      const p = He(d);
      p && B(p);
    }
    function G(d) {
      const p = u.value, g = p ? Se(p, d) : null;
      return g !== null && it(g);
    }
    function Oe(d) {
      const p = u.value, g = p ? Se(p, d) : null;
      return g !== null && ht(g);
    }
    function O(d) {
      const p = u.value, g = p ? vt(p, d) : null;
      return g ? Re(g.node) : "";
    }
    function U(d) {
      const p = u.value, g = p ? vt(p, d) : null;
      if (!p || !g) return;
      const z = Re(g.node);
      if (o.value.get(z)?.fixed === !0) return;
      const F = !ht(g);
      let q = gd(p, d, F);
      q !== p && (F || (q = Ut(q, d)), r.value = q, a("frame-minimize", { panel: z, minimized: F }));
    }
    function Q(d) {
      const p = He(d);
      p && U(p);
    }
    function Ae(d) {
      const p = u.value, g = p ? vt(p, d) : null;
      if (!p || !g) return;
      const z = Re(g.node);
      if (o.value.get(z)?.fixed === !0) return;
      const F = !it(g);
      let q = md(p, d, F);
      q !== p && (F && (q = Ut(q, d)), r.value = q, a("frame-maximize", { panel: z, maximized: F }));
    }
    function Te(d) {
      const p = He(d);
      p && Ae(p);
    }
    function qt(d, p, g) {
      const z = u.value, F = z ? vt(z, d) : null;
      if (!z || !F || p.button !== 0 || y.value || _.value) return;
      const q = Re(F.node);
      if (o.value.get(q)?.fixed === !0 || it(F) || ht(F) || (g === "move" ? !s.movable : !s.resizable)) return;
      const he = Ie(d), ie = _d(z, d);
      B(d);
      const H = { w: he?.clientWidth ?? 0, h: he?.clientHeight ?? 0 }, ee = { ...F.rect }, se = p.clientX, fe = p.clientY, we = s.minPanelSize;
      _.value = q;
      const me = (De) => {
        const nt = u.value;
        if (!nt) return;
        const Vt = ha(nt, ie, On(De, H, we));
        Vt !== nt && (r.value = Vt);
      }, ae = (De) => {
        De.preventDefault();
        const nt = De.clientX - se, Vt = De.clientY - fe;
        me(
          g === "move" ? { ...ee, x: ee.x + nt, y: ee.y + Vt } : va(ee, g, nt, Vt, we)
        );
      }, Le = (De) => {
        if (We?.(), _.value = null, !De) {
          me(ee);
          return;
        }
        const nt = u.value ? vt(u.value, ie) : null;
        nt && a("frame-change", { panel: O(ie), rect: nt.rect });
      }, ot = () => Le(!0), ft = () => Le(!1), pt = (De) => {
        De.key === "Escape" && Le(!1);
      };
      We = () => {
        window.removeEventListener("pointermove", ae), window.removeEventListener("pointerup", ot), window.removeEventListener("pointercancel", ft), window.removeEventListener("keydown", pt), We = null;
      }, window.addEventListener("pointermove", ae), window.addEventListener("pointerup", ot), window.addEventListener("pointercancel", ft), window.addEventListener("keydown", pt);
    }
    function Br(d, p, g) {
      const z = He(d);
      z && qt(z, p, g);
    }
    function qr(d, p, g = !1) {
      const z = u.value, F = He(d), q = z && F ? vt(z, F) : null;
      if (!z || !F || !q || o.value.get(d)?.fixed === !0 || (g ? !s.resizable : !s.movable)) return;
      if (it(q) || ht(q)) {
        L.value = `${Ze(d)} is ${it(q) ? "maximized" : "minimized"}, so it cannot be moved.`;
        return;
      }
      const he = p === "left" ? -fn : p === "right" ? fn : 0, ie = p === "up" ? -fn : p === "down" ? fn : 0, H = Ie(F), ee = { w: H?.clientWidth ?? 0, h: H?.clientHeight ?? 0 }, se = g ? va(q.rect, "se", he, ie, s.minPanelSize) : { ...q.rect, x: q.rect.x + he, y: q.rect.y + ie }, fe = ha(z, F, On(se, ee, s.minPanelSize));
      if (fe === z) {
        L.value = g ? `${Ze(d)} cannot be resized further.` : `${Ze(d)} cannot move ${p}.`;
        return;
      }
      r.value = fe;
      const we = vt(fe, F);
      we && (a("frame-change", { panel: d, rect: we.rect }), L.value = g ? `${Ze(d)} resized to ${we.rect.w} by ${we.rect.h}.` : `${Ze(d)} moved to ${we.rect.x}, ${we.rect.y}.`);
    }
    Ve(() => We?.());
    function Vr(d, p) {
      const g = P(d), z = g?.element.getBoundingClientRect();
      if (!g || !z) return null;
      const F = p === "left" || p === "right", q = (H) => {
        if (!(F ? H.bottom > z.top + 1 && H.top < z.bottom - 1 : H.right > z.left + 1 && H.left < z.right - 1)) return null;
        const se = p === "left" ? z.left - H.right : p === "right" ? H.left - z.right : p === "up" ? z.top - H.bottom : H.top - z.bottom;
        return se < -1 ? null : se;
      }, he = [];
      for (const H of M()) {
        if (H === g || H.element === g.element) continue;
        const ee = q(H.element.getBoundingClientRect());
        if (ee === null) continue;
        const se = H.panels.find((fe) => fe !== d);
        se && he.push({ to: { panel: se }, distance: ee });
      }
      for (const { element: H, path: ee } of ge()) {
        const se = q(H.getBoundingClientRect());
        se !== null && he.push({ to: { space: ee }, distance: se });
      }
      return he.reduce(
        (H, ee) => H && H.distance <= ee.distance ? H : ee,
        null
      )?.to ?? null;
    }
    function Kr(d) {
      const p = u.value ? Se(u.value, d) !== null : !1;
      if (!p && !Z(d)) return;
      $.value = $.value === d ? null : d;
      const g = Ze(d);
      if (!$.value) {
        L.value = `${g}: move mode off.`;
        return;
      }
      L.value = p ? `${g}: move mode on. Arrow keys move the window, shift and an arrow resize it, Escape leaves move mode.` : `${g}: move mode on. Arrow keys move the panel, shift and an arrow make it a tab of the panel that way, Escape leaves move mode.`;
    }
    const Ze = (d) => o.value.get(d)?.title ?? d, Wr = {
      left: "left",
      right: "right",
      up: "top",
      down: "bottom"
    };
    function Hr(d, p, g = !1) {
      if (!Z(d)) return;
      const z = u.value;
      if (!z) return;
      const F = Ze(d), q = Pt(z, d);
      if (!g && q && (p === "left" || p === "right") && q.panels.length > 1) {
        const fe = q.panels.indexOf(d), we = p === "left" ? fe - 1 : fe + 1;
        if (we >= 0 && we < q.panels.length) {
          X(jt(z, d, we), { panel: d, target: d, edge: "center", index: we }), L.value = `${F} moved ${p}, now tab ${we + 1} of ${q.panels.length}.`, Tn(d);
          return;
        }
      }
      const ie = Vr(d, p);
      if (!ie || ie.panel !== void 0 && !Z(ie.panel)) {
        L.value = `${F} cannot move ${p}.`;
        return;
      }
      const H = Wr[p];
      if (ie.space) {
        const fe = ie.space, we = dt(z, fe), me = Se(z, d)?.rect, ae = { ...mt, ...me ? { w: me.w, h: me.h } : {} };
        X(ga(z, d, fe, ae), { panel: d, target: "", space: fe, edge: H }), L.value = `${F} moved ${p}, into ${we ? Dt(we) : "the space"}.`, Tn(d);
        return;
      }
      const ee = ie.panel, se = q?.panels.length === 1 && Pt(z, ee)?.panels.length === 1;
      g ? (X(dn(z, d, ee, "center"), {
        panel: d,
        target: ee,
        edge: "center"
      }), L.value = `${F} joined ${Ze(ee)} as a tab.`) : se ? (X(gn(z, d, ee), { panel: d, target: ee, edge: H }), L.value = `${F} moved ${p}, trading places with ${Ze(ee)}.`) : (X(dn(z, d, ee, H), { panel: d, target: ee, edge: H }), L.value = `${F} moved ${p}, beside ${Ze(ee)}.`), Tn(d);
    }
    function Tn(d) {
      Ft(() => {
        P(d)?.element.querySelector(".dc-pane__grip")?.focus();
      });
    }
    function Ur(d, p) {
      const g = u.value;
      g && (r.value = _n(g, d, p));
    }
    function Ln(d) {
      const p = u.value;
      if (!p) return;
      const g = zt(p, d);
      g !== p && (r.value = g, a("tab-select", { panel: d }));
    }
    function Bs(d) {
      return o.value.get(d)?.closable ?? s.closable;
    }
    function jr(d) {
      Bs(d) && a("panel-close", d);
    }
    const Rn = W(/* @__PURE__ */ new Map());
    let Gr = 0;
    function Xr(d, p) {
      const g = Gr += 1;
      return Rn.value.set(g, { panel: d, items: p }), () => {
        Rn.value.delete(g);
      };
    }
    function Yr(d) {
      const p = [];
      for (const g of Rn.value.values())
        g.panel() === d && p.push(...g.items());
      return p;
    }
    function qs(d) {
      const p = d.filter((g) => g.items.length > 0);
      return p.length < 2 ? p.flatMap((g) => g.items) : p.flatMap((g) => [
        { id: g.id, heading: !0, label: g.title },
        ...g.items
      ]);
    }
    const Vs = (d) => d.title || "These tabs";
    function Qr(d, p) {
      const g = p.id, z = Pt(d, g), F = (z?.panels.length ?? 0) > 1, q = z?.fixedView === !0, he = (se) => ({
        action: () => {
          se !== d && (r.value = se);
        }
      }), ie = [], H = [], ee = p.views ?? [];
      if (ee.length > 1 && !q) {
        const se = k(g);
        ie.push({
          id: "view",
          label: "View",
          items: ee.map((fe) => ({
            id: `view-${fe.key}`,
            label: fe.label,
            checked: fe.key === se,
            action: () => K(g, fe.key)
          }))
        });
      }
      return F && !q && H.push(
        { id: "show-row", label: "Row", checked: !1, ...he(_a(d, g, "row")) },
        {
          id: "show-column",
          label: "Column",
          checked: !1,
          ...he(_a(d, g, "column"))
        },
        // Already true, and nothing to collapse: these panes are tabs. Ticked
        // and choosable all the same — collapsing a strip into a strip hands
        // back the tree it was given, so it is the no-op it looks like.
        {
          id: "show-tabs",
          label: "Tabs",
          checked: !0,
          ...he(bd(d, g))
        },
        {
          id: "show-desktop",
          label: "Desktop",
          checked: !1,
          ...he($d(d, g))
        }
      ), F && z && (H.length && H.push({ separator: !0 }), H.push(...Ks(z, g))), { panel: ie, tabs: H, tabsTitle: z ? Vs(z) : "" };
    }
    function Ks(d, p) {
      const g = bt(d), z = (F) => {
        const q = d.panels[(g + F + d.panels.length) % d.panels.length];
        return (q === void 0 ? "" : Re(q)) || p;
      };
      return [
        { id: "next-tab", label: "Next tab", action: () => Ln(z(1)) },
        { id: "previous-tab", label: "Previous tab", action: () => Ln(z(-1)) }
      ];
    }
    function on(d) {
      return d.title ? d.title : Y(d) ? d.panels.length > 1 ? "these tabs" : "the strip" : Dt(d);
    }
    function Ws(d) {
      if (!d || re(d) || d.fixedView === !0 || !d.title && d.headless !== !0 || Ge(d)) return null;
      const p = Lr(d);
      return p && p.fixedView !== !0 ? p : null;
    }
    function Zr(d) {
      const p = u.value;
      if (!s.menu || !p) return [];
      const g = dt(p, d);
      if (!g || Y(g)) return [];
      if (g.fixedView) return [];
      const z = re(g) ? "desktop" : g.direction, F = (ae, Le, ot) => ({
        id: `show-${ae}`,
        label: Le,
        checked: z === ae,
        action: () => {
          const ft = u.value, pt = ot();
          !ft || pt === g || (r.value = xn(Ce(_t(ft, d, pt))));
        }
      }), q = () => {
        const ae = Pr(g, Jr(g));
        if (Y(ae) && ae.panels.length === 0) return g;
        const Le = Y(ae) && ae.panels.length === 1 ? ae.panels[0] : void 0;
        return Le !== void 0 && _e(Le) ? g : ae;
      }, he = (ae) => () => re(g) ? Tr(g, ae) : g.direction === ae ? g : { ...g, direction: ae }, ie = d.slice(0, -1), H = d.length > 0 ? dt(p, ie) : null, ee = H && Y(H) && H.panels.length > 1 ? H : null, se = H && Ws(H) === g ? H : null, fe = Ws(g), we = g.title || "this space", me = (ae, Le, ot, ft, pt) => ({
        id: ae,
        label: pt,
        action: () => {
          const De = u.value;
          De && (r.value = xn(Ce(_t(De, Le, Md(ot, ft)))));
        }
      });
      return qs([
        {
          id: "about-space",
          /*
           * Its own name, or what it is rather than how it is shown: `spaceTitle`
           * would answer "Row" for an unnamed row, which is the item directly
           * under it and the one already ticked.
           */
          title: g.title || "This space",
          items: [
            F("row", "Row", he("row")),
            F("column", "Column", he("column")),
            // Everything in this space in one strip: the panes as tabs, and a
            // desktop among them as a tab of its own, keeping the windows on it.
            F("tabs", "Tabs", () => q()),
            F("desktop", "Desktop", () => re(g) ? g : zr(g))
          ]
        },
        {
          id: "about-around",
          title: fe ? `Around ${on(fe)}` : "",
          items: fe ? [
            // Keeping this space's bar drops the one inside, so it is offered
            // only where the space inside has no name to be dropped with it.
            ...fe.title ? [] : [me("merge-around-keep-this", d, g, "outer", `Keep ${we}`)],
            ...g.title ? [] : [me("merge-around-keep-that", d, g, "inner", `Keep ${on(fe)}`)]
          ] : []
        },
        {
          id: "about-inside",
          title: se ? `Inside ${on(se)}` : "",
          items: se ? [
            ...g.title ? [] : [me("merge-inside-keep-that", ie, se, "outer", `Keep ${on(se)}`)],
            ...se.title ? [] : [me("merge-inside-keep-this", ie, se, "inner", `Keep ${we}`)]
          ] : []
        },
        {
          id: "about-tabs",
          title: ee ? Vs(ee) : "",
          items: ee ? Ks(ee, Re(g)) : []
        }
      ]);
    }
    function Jr(d) {
      const p = h.value;
      return p && de(d, p) ? p : void 0;
    }
    function el(d) {
      const p = u.value, g = o.value.get(d);
      if (!p || !g) return [];
      const z = s.menu ? Qr(p, g) : null, F = Yr(d);
      F.length && z?.panel.length && F.push({ separator: !0 }), z && F.push(...z.panel);
      const q = qs([
        { id: "about-panel", title: g.title, items: F },
        { id: "about-tabs", title: z?.tabsTitle ?? "", items: z?.tabs ?? [] }
      ]);
      return s.paneMenu ? s.paneMenu(g, q) : q;
    }
    function tl(d, p) {
      return l[`${d}-${p}`] ?? l[d];
    }
    function Hs(d, p, g, z) {
      return tl(d, p.id)?.({ panel: p, view: g, active: z });
    }
    Pd({
      panelFor: (d) => o.value.get(d) ?? null,
      viewFor: k,
      setView: K,
      movable: v(() => s.movable),
      resizable: v(() => s.resizable),
      minPanelSize: v(() => s.minPanelSize),
      spaceNames: v(() => s.spaceNames),
      focused: h,
      dragging: y,
      dropTarget: w,
      moving: $,
      framing: _,
      canMove: Z,
      focus(d) {
        h.value !== d && (h.value = d, a("panel-activate", d));
      },
      selectPanel: Ln,
      beginDrag: Qe,
      toggleMoveMode: Kr,
      nudge: Hr,
      setSizes: Ur,
      frameOf: (d) => u.value ? Se(u.value, d) : null,
      beginFrameDrag: Br,
      nudgeFrame: qr,
      raise: J,
      maximized: G,
      toggleMaximize: Te,
      minimized: Oe,
      toggleMinimize: Q,
      beginFrameDragAt: qt,
      raiseAt: B,
      toggleMaximizeAt: Ae,
      toggleMinimizeAt: U,
      menuFor: el,
      spaceMenu: Zr,
      registerMenu: Xr,
      closable: Bs,
      close: jr,
      renderContent: (d, p, g) => Hs("panel", d, p, g),
      renderActions: (d, p, g) => Hs("actions", d, p, g),
      layout: u
    });
    const nl = v(() => {
      if (!(!s.accent && !s.tokens))
        return { ...s.tokens, ...s.accent ? { "--dc-accent": s.accent } : {} };
    }), sl = () => {
      const d = y.value, p = C.value;
      return !d || !p ? null : ol(
        "div",
        {
          class: "dc-window__ghost",
          style: { left: `${p.x}px`, top: `${p.y}px` },
          "aria-hidden": "true"
        },
        o.value.get(d)?.title ?? d
      );
    };
    return t({
      /** The layout as rendered, reconciled against the current panels. */
      layout: u,
      /** Moves a panel programmatically — the same operation a drag performs. */
      move(d, p, g, z) {
        const F = u.value;
        F && X(dn(F, d, p, g, z), {
          panel: d,
          target: p,
          edge: g,
          ...z === void 0 ? {} : { index: z }
        });
      },
      /** Brings a panel's tab to the top of its group. */
      select(d) {
        const p = u.value;
        p && (r.value = zt(p, d));
      },
      /** Lifts a panel onto the float holding `near`, as a window of its own. */
      float(d, p, g) {
        const z = u.value;
        z && X(ma(z, d, p, g), {
          panel: d,
          target: p,
          edge: "float",
          rect: g
        });
      },
      /** Puts a floating frame somewhere else, or makes it another size. */
      setRect(d, p) {
        const g = u.value;
        if (!g) return;
        const z = pd(g, d, p);
        if (z === g) return;
        r.value = z;
        const F = Se(z, d);
        F && a("frame-change", { panel: d, rect: F.rect });
      },
      /**
       * Puts a panel on one of its views, the way its menu would — the way a pane
       * whose space fixed its view, or took its bar away, is switched at all.
       */
      setView: K,
      /** Brings a floating frame to the front of its stack. */
      raise: J,
      /** Fills the float with a window, or puts it back where it was. */
      toggleMaximize: Te,
      /** Rolls a window up to its title bar, or unrolls it. */
      toggleMinimize: Q
    }), (d, p) => (f(), m("div", {
      ref_key: "root",
      ref: D,
      class: "dc-shell dc-window",
      "data-dc-theme": e.theme,
      "data-dc-dragging": y.value ? "true" : "false",
      "data-dc-docking": b.value ? "true" : "false",
      style: Ee(nl.value)
    }, [
      u.value ? (f(), te(Cf, {
        key: 0,
        node: u.value,
        path: []
      }, null, 8, ["node"])) : (f(), m("p", Sf, " This window has no panels. ")),
      pe(sl),
      x("p", Ef, N(L.value), 1)
    ], 12, Mf));
  }
}), Af = /* @__PURE__ */ ce(Pf, [["__scopeId", "data-v-711565af"]]), zf = (e) => Math.round(e * 1e3) / 1e3;
function Bn(e, t) {
  return e.title && (t.t = e.title), e.headless && (t.h = !0), e.fixedView && (t.v = !0), t;
}
function Tf(e) {
  return [Math.round(e.x), Math.round(e.y), Math.round(e.w), Math.round(e.h)];
}
function qn(e) {
  const t = { b: Tf(e.rect) };
  return e.title && (t.t = e.title), e.maximized && (t.M = !0), e.minimized && (t.m = !0), t;
}
function Lf(e) {
  if (e.kind !== "group" || e.panels.length !== 1) return null;
  const t = e.panels[0];
  return typeof t != "string" || e.title || e.headless || e.fixedView || e.places ? null : t;
}
function es(e) {
  const t = Lf(e);
  return t !== null ? t : Nr(e);
}
function Nr(e) {
  if (e.kind === "group") {
    const n = { g: e.panels.map((s) => typeof s == "string" ? s : Nr(s)) };
    return e.active !== void 0 && e.active !== e.panels[0] && (n.a = e.active), e.places && (n.p = e.places.map(qn)), Bn(e, n);
  }
  if (e.kind === "split") {
    const n = { [e.direction === "row" ? "r" : "c"]: e.children.map(es) };
    return e.sizes && (n.z = e.sizes.map(zf)), e.places && (n.p = e.places.map(qn)), Bn(e, n);
  }
  const t = {
    f: e.frames.map((n) => ({ n: es(n.node), ...qn(n) }))
  };
  return Bn(e, t);
}
class Ir extends Error {
}
const Me = () => {
  throw new Ir();
}, ts = (e) => typeof e == "object" && e !== null && !Array.isArray(e), Ct = (e) => Array.isArray(e) ? e : Me(), Os = (e) => e === void 0 ? void 0 : typeof e == "string" ? e : Me(), Or = (e) => Ct(e).map((t) => typeof t == "number" && Number.isFinite(t) ? t : Me());
function Rf(e) {
  const [t, n, s, a] = Or(e);
  return a === void 0 && Me(), { x: t, y: n, w: s, h: a };
}
function Vn(e) {
  if (!ts(e)) return Me();
  const t = { rect: Rf(e.b) }, n = Os(e.t);
  return n && (t.title = n), e.M === !0 && (t.maximized = !0), e.m === !0 && (t.minimized = !0), t;
}
function Kn(e, t) {
  const n = Os(e.t);
  return n && (t.title = n), e.h === !0 && (t.headless = !0), e.v === !0 && (t.fixedView = !0), t;
}
function yn(e) {
  if (typeof e == "string") return { kind: "group", panels: [e] };
  if (!ts(e)) return Me();
  if (e.g !== void 0) {
    const n = Ct(e.g).map((r) => typeof r == "string" ? r : yn(r));
    n.length === 0 && Me();
    const s = { kind: "group", panels: n }, a = Os(e.a);
    return a !== void 0 && (s.active = a), e.p !== void 0 && (s.places = Ct(e.p).map(Vn)), Kn(e, s);
  }
  const t = e.r !== void 0 ? "row" : e.c !== void 0 ? "column" : null;
  if (t) {
    const n = Ct(t === "row" ? e.r : e.c).map(yn), s = { kind: "split", direction: t, children: n };
    return e.z !== void 0 && (s.sizes = Or(e.z)), e.p !== void 0 && (s.places = Ct(e.p).map(Vn)), Kn(e, s);
  }
  if (e.f !== void 0) {
    const s = { kind: "float", frames: Ct(e.f).map((a) => !ts(a) || a.n === void 0 ? Me() : { node: yn(a.n), ...Vn(a) }) };
    return Kn(e, s);
  }
  return Me();
}
const Dr = /[ '!:(),*@$]/, Ff = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][-+]?\d+)?$/;
function ka(e) {
  return e !== "" && !Dr.test(e) && !/^[-\d]/.test(e) ? e : `'${e.replace(/[!']/g, (n) => `!${n}`)}'`;
}
function ns(e) {
  return e === null ? "!n" : e === !0 ? "!t" : e === !1 ? "!f" : typeof e == "number" ? Number.isFinite(e) ? String(e) : "!n" : typeof e == "string" ? ka(e) : Array.isArray(e) ? `!(${e.map(ns).join(",")})` : `(${Object.entries(e).map(([t, n]) => `${ka(t)}:${ns(n)}`).join(",")})`;
}
function Nf(e) {
  let t = 0;
  const n = () => e[t], s = (l) => e[t++] === l ? void 0 : Me(), a = () => {
    if (n() === "'") {
      t++;
      let o = "";
      for (; ; ) {
        const c = e[t++];
        if (c === void 0) return Me();
        if (c === "'") return o;
        if (c === "!") {
          const u = e[t++];
          u !== "!" && u !== "'" && Me(), o += u;
        } else o += c;
      }
    }
    const l = t;
    for (; t < e.length && !Dr.test(e[t]); ) t++;
    return t === l && Me(), e.slice(l, t);
  }, r = () => {
    const l = n();
    if (l === "(") {
      t++;
      const c = {};
      if (n() === ")")
        return t++, c;
      for (; ; ) {
        const u = a();
        s(":"), c[u] = r();
        const h = e[t++];
        if (h === ")") return c;
        h !== "," && Me();
      }
    }
    if (l === "!") {
      t++;
      const c = e[t++];
      if (c === "t") return !0;
      if (c === "f") return !1;
      if (c === "n") return null;
      if (c !== "(") return Me();
      const u = [];
      if (n() === ")")
        return t++, u;
      for (; ; ) {
        u.push(r());
        const h = e[t++];
        if (h === ")") return u;
        h !== "," && Me();
      }
    }
    if (l === "'") return a();
    const o = a();
    return Ff.test(o) ? Number(o) : o;
  }, i = r();
  return t !== e.length && Me(), i;
}
function ba(e) {
  return ns(es(e));
}
function If(e) {
  try {
    return yn(Nf(e));
  } catch (t) {
    if (t instanceof Ir) return null;
    throw t;
  }
}
function $a(e, t) {
  for (const n of e.replace(/^[?]/, "").split("&")) {
    const s = n.indexOf("="), a = s === -1 ? n : n.slice(0, s);
    if (Ds(a) === t) return s === -1 ? "" : n.slice(s + 1);
  }
  return null;
}
function Of(e, t, n) {
  const s = e.replace(/^[?]/, "").split("&").filter(Boolean), a = s.findIndex((i) => {
    const l = i.indexOf("=");
    return Ds(l === -1 ? i : i.slice(0, l)) === t;
  }), r = n === null ? null : `${encodeURIComponent(t)}=${n}`;
  return a === -1 ? r && s.push(r) : r ? s[a] = r : s.splice(a, 1), s.length ? `?${s.join("&")}` : "";
}
function Ds(e) {
  try {
    return decodeURIComponent(e.replace(/\+/g, " "));
  } catch {
    return e;
  }
}
const Df = [
  [/%2C/g, ","],
  [/%3A/g, ":"],
  [/%2F/g, "/"],
  [/%40/g, "@"],
  [/%24/g, "$"],
  [/%20/g, "+"]
], Bf = (e) => {
  let t = encodeURIComponent(e);
  for (const [n, s] of Df) t = t.replace(n, s);
  return t;
};
function op(e, t) {
  const { adapter: n } = t, s = t.param ?? "w", a = t.delay ?? 200, r = () => Mt(t.home) ?? null;
  let i = $a(n.search.value, s), l = null;
  const o = () => {
    l !== null && clearTimeout(l), l = null;
  }, c = (y) => y === null ? r() : If(Ds(y)) ?? r(), u = () => {
    o();
    const y = e.value, w = r(), b = y ? ba(y) : null, $ = b === null || w && b === ba(w) ? null : Bf(b);
    i = $;
    const _ = Of(n.search.value, s, $);
    _ !== n.search.value && n.replace(_);
  }, h = c(i);
  return h && (e.value = h), ke(e, () => {
    o(), l = setTimeout(u, a);
  }), ke(n.search, (y) => {
    const w = $a(y, s);
    if (w === i) return;
    o(), i = w;
    const b = c(w);
    b && (e.value = b);
  }), rs() && Cn(() => l !== null ? u() : void 0), { flush: () => l !== null ? u() : void 0 };
}
function ip(e = "", t = "/") {
  const n = W(at(e)), s = W(t), a = [`${s.value}${n.value}`];
  return {
    search: n,
    path: s,
    history: a,
    push(r) {
      n.value = at(r), a.push(`${s.value}${n.value}`);
    },
    replace(r) {
      n.value = at(r), a[a.length - 1] = `${s.value}${n.value}`;
    }
  };
}
function xa(e) {
  const t = e.indexOf("?");
  if (t === -1) return "";
  const n = e.slice(t), s = n.indexOf("#");
  return at(s === -1 ? n : n.slice(0, s));
}
function cp(e) {
  const t = W(xa(e.currentRoute.value.fullPath)), n = v(() => e.currentRoute.value.path), s = ke(
    () => e.currentRoute.value.fullPath,
    (a) => {
      t.value = xa(a);
    }
  );
  return {
    search: t,
    path: n,
    push: (a) => e.push(`${n.value}${at(a)}`),
    replace: (a) => e.replace(`${n.value}${at(a)}`),
    dispose: s
  };
}
const qf = {
  DataShell: Hu,
  ShellHeader: ar,
  QueryPanel: lr,
  RecordActions: ir,
  ResultsArea: gr,
  FacetControl: rr,
  SegmentedControl: sd,
  StatusPill: en,
  WindowFrame: Af,
  WindowPane: Fr,
  ListView: Gn,
  CardsView: ur,
  GridView: dr,
  ImagesView: fr,
  TableView: hr,
  LinksView: pr,
  PreviewView: vr,
  TypeCardsView: mr
}, up = {
  install(e, t = {}) {
    const n = t.prefix ?? "";
    for (const [s, a] of Object.entries(qf))
      e.component(`${n}${s}`, a);
    t.route && e.provide(Sa, t.route);
  }
};
export {
  $n as CASCADE_STEP,
  Hf as COLUMN_BREAKPOINTS,
  Wf as COLUMN_ROLES,
  ur as CardsView,
  da as ColumnCell,
  mt as DEFAULT_FRAME,
  Wn as DEFAULT_SORT,
  cl as DEFAULT_VIEW,
  Hu as DataShell,
  Hn as EMPTY_CELL,
  er as ENTITY_ALL,
  bn as ENTITY_TERM,
  Yt as EXPRESSION_TERM,
  bs as FACET_PREFIX,
  rr as FacetControl,
  dr as GridView,
  up as HeaderContentLayoutPlugin,
  fr as ImagesView,
  pr as LinksView,
  Gn as ListView,
  xt as MINIMIZED_GAP,
  yr as MINIMIZED_HEIGHT,
  Xn as MINIMIZED_WIDTH,
  _r as MIN_FRAME,
  ra as MOCK_TINTS,
  Xf as MenuBar,
  Ms as MenuButton,
  xs as MenuList,
  tn as MetricDrill,
  Is as PANE_CONTEXT_KEY,
  ys as PARAM_DIR,
  ms as PARAM_ENTITY,
  ws as PARAM_EXPR,
  ks as PARAM_PAGE,
  _s as PARAM_SORT,
  gs as PARAM_VIEW,
  Cs as PinStar,
  vr as PreviewView,
  En as QueryMark,
  lr as QueryPanel,
  cn as RECORD_STATUSES,
  Fa as RESULT_FIELDS,
  Sa as ROUTE_ADAPTER_KEY,
  ir as RecordActions,
  gr as ResultsArea,
  Ja as SHELL_CONTEXT_KEY,
  Kf as SHELL_THEMES,
  nn as ScopeMark,
  sd as SegmentedControl,
  kt as SelectTick,
  Gf as ShellCard,
  ar as ShellHeader,
  fa as StandingControl,
  en as StatusPill,
  hr as TableView,
  mr as TypeCardsView,
  Ea as VIEW_KINDS,
  ul as VIEW_LABELS,
  Ns as WINDOW_CONTEXT_KEY,
  Af as WindowFrame,
  Fr as WindowPane,
  kr as activePanel,
  bt as activeTab,
  hs as addTerm,
  fs as andExpression,
  dd as axisOf,
  Ps as cascade,
  Oa as cellFull,
  Zt as cellText,
  hn as cellTextOf,
  qe as cellValue,
  Gs as changesResults,
  On as clampRect,
  Pr as collapseSpace,
  bd as collapseToTabs,
  Qf as column,
  Ys as columnAlign,
  Qs as columnClass,
  Xs as columnKey,
  Ba as columnShortcut,
  Ml as columnShortcutOf,
  Un as columnTruncates,
  ml as columnsFor,
  fl as countPages,
  il as createHistoryAdapter,
  ip as createMemoryAdapter,
  Kl as createMockDataSource,
  cp as createVueRouterAdapter,
  If as decodeLayout,
  yl as defaultCellText,
  wa as defaultLayout,
  ds as defaultQuery,
  Wl as drillExpression,
  ga as dropIntoSpace,
  Ot as emptyFacetState,
  is as emptyFacetValue,
  ba as encodeLayout,
  Ga as excludingTerm,
  Va as expandShortcuts,
  St as findEntity,
  ct as findSort,
  Jf as fixedView,
  Es as float,
  ma as floatPanel,
  zr as floatSplit,
  $d as floatTabs,
  vn as fnv1a,
  Aa as focusEntity,
  $t as formatCount,
  vl as formatDate,
  ut as formatExpression,
  pl as formatMetric,
  hl as formatOrdinal,
  Jt as formatTerm,
  Pn as frame,
  vt as frameAt,
  Se as frameOf,
  Zn as framePathOf,
  Re as frontPanel,
  Bl as generateRows,
  Yf as group,
  Pt as groupOf,
  fd as groups,
  Ra as hasActiveFacets,
  de as hasPanel,
  Zf as headless,
  Kt as insertPanel,
  Ht as isChoosable,
  Uf as isEntityScoped,
  La as isFacetActive,
  re as isFloat,
  Y as isGroup,
  it as isMaximized,
  ht as isMinimized,
  _e as isPanelTab,
  cs as isPristineQuery,
  Bt as isSplit,
  Be as isTabOf,
  us as isTypeCardsQuery,
  Pa as isViewKind,
  sa as joinExpression,
  Ya as liftTerm,
  Pl as matchesExpression,
  ql as matchesFacets,
  vd as maximizeFrame,
  md as maximizeFrameAt,
  Md as mergeSpace,
  hd as minimizeFrame,
  gd as minimizeFrameAt,
  dn as movePanel,
  jt as moveTab,
  jf as negateTerm,
  dt as nodeAt,
  Gt as nodeTitle,
  Ce as normalizeLayout,
  at as normalizeSearch,
  Rs as normalizeSizes,
  Lr as onlySpace,
  Xt as oppositeTerm,
  lt as panelIds,
  tt as panelNode,
  pa as panelTabs,
  Ne as parseExpression,
  Ql as parseQuery,
  bi as presentParts,
  cr as presentRow,
  Ke as pressOptions,
  Rr as providePaneContext,
  Hl as provideShellContext,
  Pd as provideWindowContext,
  Dn as raiseFrame,
  Ut as raiseFrameAt,
  _d as raisedPath,
  Na as reconcileFacets,
  Ed as reconcileLayout,
  ja as recordTerm,
  Ll as refineExpression,
  gt as removePanel,
  _t as replaceAt,
  va as resizeRect,
  ya as resizeSplit,
  os as resolveView,
  Ue as roleColumn,
  Ia as roleColumns,
  xn as rootSpace,
  zs as row,
  _l as rowKey,
  Mn as sameTerm,
  ps as scopeTerm,
  vs as scopeTermFor,
  Za as scopedEntity,
  ia as serializeQuery,
  zt as setActivePanel,
  pd as setFrameRect,
  ha as setFrameRectAt,
  _n as setSizesAt,
  np as setSplitDirection,
  rt as sizesOf,
  Ta as sortsFor,
  $e as spaceChrome,
  Dt as spaceTitle,
  As as split,
  zl as splitExpression,
  _a as spreadTabs,
  Jl as summarizeQuery,
  $s as summaryTerms,
  gn as swapPanels,
  Ss as tabNode,
  an as tabPanels,
  Xa as termStanding,
  Tr as tileFloat,
  sp as toFloat,
  ap as toTiled,
  ep as toggleMaximized,
  tp as toggleMinimized,
  Hc as useColumns,
  _o as useEntityCounts,
  fu as useEntityPreviews,
  op as useLayoutRoute,
  rp as usePaneContext,
  lp as usePaneMenu,
  wt as usePresentedRows,
  eo as useQueryState,
  ko as useRecordNames,
  to as useResults,
  be as useShellContext,
  zn as useWindowContext,
  la as withStanding,
  Qa as withoutOwnScope,
  Al as withoutTerm
};
