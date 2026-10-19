import { ref as H, inject as It, provide as ba, computed as v, toValue as Pt, shallowRef as wt, watch as we, onScopeDispose as Zt, getCurrentScope as An, defineComponent as oe, onMounted as Bs, onBeforeUnmount as We, resolveComponent as qs, openBlock as f, createElementBlock as m, normalizeStyle as Ee, Fragment as ne, renderList as me, toDisplayString as F, createCommentVNode as I, createElementVNode as C, createBlock as Q, nextTick as Nt, useId as Tn, unref as A, normalizeClass as dt, Teleport as _l, createVNode as ce, withDirectives as ft, withKeys as nt, withModifiers as Fe, vModelText as bn, renderSlot as $e, useSlots as Jt, createTextVNode as Oe, withCtx as xe, reactive as fs, resolveDynamicComponent as $a, createSlots as hn, useModel as Ht, mergeModels as $n, vShow as xn, Comment as yl, Text as wl, h as kl } from "vue";
const Vs = Symbol("dc.routeAdapter");
function Be(e) {
  if (!e) return "";
  const t = e.replace(/^[?]/, "");
  return t ? `?${t}` : "";
}
function bl() {
  const e = typeof window < "u", t = H(e ? Be(window.location.search) : ""), n = H(e ? window.location.pathname : "/"), a = () => {
    t.value = Be(window.location.search), n.value = window.location.pathname;
  };
  e && window.addEventListener("popstate", a);
  const s = (r, i) => {
    const o = Be(r);
    if (!e) {
      t.value = o;
      return;
    }
    const l = `${window.location.pathname}${o}${window.location.hash}`;
    i === "push" ? window.history.pushState(window.history.state, "", l) : window.history.replaceState(window.history.state, "", l), t.value = o, n.value = window.location.pathname;
  };
  return {
    search: t,
    path: n,
    href(r) {
      return e ? `${window.location.pathname}${Be(r)}${window.location.hash}` : `${n.value}${Be(r)}`;
    },
    push: (r) => s(r, "push"),
    replace: (r) => s(r, "replace"),
    dispose: () => {
      e && window.removeEventListener("popstate", a);
    }
  };
}
const Ks = ["list", "cards", "grid", "images", "table", "links", "preview"], lp = [
  "minimal",
  "mono-size",
  "dark",
  "light",
  "auto",
  "macos",
  "windows",
  "inherit"
], dn = ["ok", "running", "queued", "review", "failed"], op = [
  "identity",
  "reference",
  "metric",
  "state",
  "updated",
  "image",
  "tint"
], ip = [480, 620, 760, 900, 1100], $l = "cards", xl = "table";
function Yt(e, t = {}) {
  const n = (s) => s && Hs(s) ? s : void 0;
  if (e === null) return n(t.view) ?? $l;
  const a = t.landing === "entity" ? n(t.view) : void 0;
  return n(t.entityView) ?? a ?? xl;
}
function ps(e, t, n, a = {}) {
  return e === Yt(t, a) ? Yt(n, a) : e;
}
const ra = "updated";
function Hs(e) {
  return typeof e == "string" && Ks.includes(e);
}
const Ml = {
  list: "List",
  cards: "Cards",
  grid: "Grid",
  images: "Images",
  table: "Table",
  links: "Links",
  preview: "Preview"
};
function Rn(e, t) {
  const [n] = t ?? [];
  return n === void 0 || t?.includes(e) ? e : n;
}
function Et(e, t) {
  return t ? e.entities.find((n) => n.key === t) ?? null : null;
}
function Ws(e, t = {}) {
  const n = Et(e, t.entity), a = e.entities[0];
  if (!n && !a) throw new Error(`Schema "${e.key}" declares no entities`);
  return n ?? a;
}
function Us(e, t = null) {
  return e?.columns ?? t?.columns ?? [];
}
function js(e, t = null) {
  if (e?.sorts?.length) return e.sorts;
  const n = /* @__PURE__ */ new Set(), a = [];
  for (const s of Us(e, t))
    !s.sort || n.has(s.sort) || (n.add(s.sort), a.push({ key: s.sort, label: (s.label ?? s.sort).toLowerCase() }));
  return a;
}
const Cl = { key: ra, label: ra };
function ct(e, t, n = null) {
  const a = js(e, n);
  return (t ? a.find((r) => r.key === t) : void 0) ?? a.find((r) => r.key === ra) ?? a[0] ?? Cl;
}
function xa(e) {
  switch (e.kind) {
    case "chips":
      return { kind: "chips", selected: [] };
    case "range":
      return { kind: "range", min: null, max: null };
    case "toggle":
      return { kind: "toggle", on: !1 };
  }
}
function Ft(e) {
  const t = {};
  for (const n of e?.facets ?? []) t[n.key] = xa(n);
  return t;
}
function Gs(e) {
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
function Xs(e) {
  return Object.values(e).some(Gs);
}
function Ma(e) {
  return e.entity === null && e.expr.trim() === "" && !Xs(e.facets);
}
function cp(e) {
  return e.entity !== null;
}
function Ca(e, t) {
  return e.entity === null && Rn(e.view, t) === "cards";
}
function Sl(e, t) {
  return t <= 0 ? 1 : Math.max(1, Math.ceil(e / t));
}
function Sa(e, t = {}) {
  const a = t.landing === "entity" ? Ws(e, t) : null;
  return {
    entity: a?.key ?? null,
    view: Yt(a?.key ?? null, t),
    sort: ct(a, t.sort).key,
    dir: t.dir === "asc" ? "asc" : "desc",
    expr: "",
    facets: Ft(a),
    page: 1
  };
}
const Pa = ["entity", "sort", "dir", "expr", "facets"];
function Hn(e) {
  return Pa.some((t) => t in e);
}
function Ys(e, t) {
  const n = {};
  for (const a of e?.facets ?? []) {
    const s = t[a.key];
    n[a.key] = s && s.kind === a.kind ? s : xa(a);
  }
  return n;
}
function mn(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n++)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return Math.abs(t);
}
function Pl(e) {
  if (!Number.isFinite(e)) return "—";
  const t = Math.abs(e);
  return t >= 1e6 ? `${(e / 1e6).toFixed(1)}m` : t >= 1e3 ? `${(e / 1e3).toFixed(1)}k` : String(Math.round(e));
}
function Mt(e) {
  return Number.isFinite(e) ? Math.round(e).toLocaleString("en-US") : "—";
}
function El(e) {
  const t = new Date(e);
  if (Number.isNaN(t.getTime())) return "—";
  const n = String(t.getUTCDate()).padStart(2, "0"), a = String(t.getUTCMonth() + 1).padStart(2, "0");
  return `${n}.${a}.${t.getUTCFullYear()}`;
}
function Al(e) {
  return String(e + 1).padStart(2, "0");
}
const la = "—";
function Ge(e, t) {
  return e.find((n) => n.role === t);
}
function Qs(e, t) {
  return e.filter((n) => n.role === t);
}
function Tl(e, t) {
  const n = (t ? t.columns : e?.columns) ?? [], a = t ? "scoped" : "everything";
  return n.filter(
    (s) => s.role !== "tint" && ((s.when ?? "always") === "always" || s.when === a)
  );
}
const Rl = ["id", "entityKey", "entityLabel"];
function Ke(e, t) {
  if (e.value) return e.value(t);
  const n = e.field ?? e.key;
  if (n !== void 0) {
    if (t.fields && n in t.fields) return t.fields[n];
    if (Rl.includes(n))
      return t[n];
  }
}
function vs(e, t) {
  const n = e.key ?? e.field ?? e.label;
  return n?.trim() ? n.trim() : `column-${t}`;
}
function zl(e, t) {
  return e.id?.trim() ? e.id : `${e.entityKey || "row"}-${t}`;
}
function Ll(e, t) {
  if (e == null || e === "") return la;
  if (t === "number") {
    const n = typeof e == "number" ? e : Number(e);
    return Number.isFinite(n) ? Pl(n) : String(e);
  }
  return t === "date" ? El(String(e)) : Array.isArray(e) ? e.length ? e.join(", ") : la : String(e);
}
function en(e, t) {
  const n = Ke(e, t);
  return e.format ? e.format(n, t) : Ll(n, e.kind);
}
function Il(e) {
  return typeof e == "number" ? Number.isFinite(e) ? String(e) : "" : typeof e == "string" ? e : Array.isArray(e) ? e.join(", ") : "";
}
function Zs(e, t) {
  const n = en(e, t), a = Il(Ke(e, t));
  return a && a !== n ? a : n;
}
function gn(e, t) {
  return e ? en(e, t) : "";
}
function hs(e) {
  return e.align ? e.align : e.kind === "number" || e.kind === "ordinal" ? "right" : "left";
}
const Nl = {
  ordinal: "dc-table__num",
  number: "dc-table__number",
  date: "dc-table__date",
  status: "dc-table__state"
};
function ms(e) {
  return [Nl[e.kind ?? "text"], e.class].filter(Boolean).join(" ");
}
function oa(e) {
  if (e.truncate !== void 0) return e.truncate;
  const t = e.kind ?? "text";
  return t === "text" || t === "number" || t === "date";
}
const Fl = /^([A-Za-z_][\w.-]*)\s*(>=|<=|:|=|>|<)\s*(.*)$/;
function Ol(e) {
  const t = [];
  let n = "", a = null;
  const s = () => {
    n && t.push(n), n = "";
  };
  for (let r = 0; r < e.length; r++) {
    const i = e[r];
    if (a) {
      i === a ? a = null : n += i;
      continue;
    }
    if (i === '"' || i === "'") {
      a = i;
      continue;
    }
    if (/\s/.test(i)) {
      if (/(?:>=|<=|[:=><])$/.test(n) || e.slice(r + 1).match(/^\s*(>=|<=|[:=><])/) && n) continue;
      s();
      continue;
    }
    n += i;
  }
  return s(), t;
}
function Ne(e) {
  const t = e.trim();
  if (!t) return [];
  const n = [];
  let a = [];
  for (const s of Ol(t)) {
    const r = s.toUpperCase();
    if (r === "AND" || r === "&&") continue;
    if (r === "OR" || r === "||") {
      a.length && n.push(a), a = [];
      continue;
    }
    const i = s.length > 1 && s.startsWith("-"), o = i ? s.slice(1) : s, l = i ? { negated: !0 } : {}, c = Fl.exec(o);
    c && c[3] !== "" ? a.push({
      kind: "field",
      field: c[1].toLowerCase(),
      comparator: c[2],
      value: c[3],
      ...l
    }) : a.push({ kind: "text", value: o, ...l });
  }
  return a.length && n.push(a), n;
}
const At = (e) => e.toLowerCase().replace(/\s+/g, ""), Js = [
  ["status", "state"],
  ["state", "state"],
  ["updated", "updated"],
  ["date", "updated"],
  ["name", "identity"],
  ["ref", "reference"]
];
function Dl(e, t, n) {
  const a = At(e), s = n.columns ?? [];
  if (a === "entity") return t.entityKey;
  if (e in t.fields) return t.fields[e];
  const r = s.find(
    (c) => c.key?.toLowerCase() === e.toLowerCase() || c.field?.toLowerCase() === e.toLowerCase() || c.label !== void 0 && At(c.label) === a
  );
  if (r) return Ke(r, t);
  const i = n.facets.find((c) => At(c.label) === a);
  if (i && i.key in t.fields) return t.fields[i.key];
  const o = Js.find(([c]) => c === a)?.[1];
  if (o) {
    const c = Ge(s, o);
    if (c) return Ke(c, t);
  }
  const l = /^metric(\d+)$/.exec(a);
  if (l) {
    const c = Qs(s, "metric")[Number(l[1]) - 1];
    if (c) return Ke(c, t);
  }
}
function er(e) {
  return (e.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).map((t) => t.charAt(0)).join("");
}
const gs = /^[a-z_][\w.-]*$/;
function tr(e) {
  const t = (e.key ?? e.field)?.toLowerCase();
  if (t !== void 0) return gs.test(t) ? t : void 0;
  const n = e.label === void 0 ? void 0 : At(e.label);
  return n !== void 0 && gs.test(n) ? n : void 0;
}
function Bl(e, t) {
  const n = At(e);
  if (n === "entity" || Js.some(([s]) => s === n) || /^metric\d+$/.test(n)) return !0;
  const a = (s) => s !== void 0 && At(s) === n;
  return (t.columns ?? []).some(
    (s) => a(s.key) || a(s.field) || a(s.label)
  ) || t.facets.some((s) => a(s.key) || a(s.label));
}
function Mn(e, t) {
  if (!t) return e;
  let n = !1;
  const a = Ne(e).map(
    (s) => s.map((r) => {
      if (r.kind !== "field") return r;
      const i = nr(r.field, t), o = i && tr(i);
      return o ? (n = !0, { ...r, field: o }) : r;
    })
  );
  return n ? rt(a) : e;
}
function nr(e, t) {
  if (!(!e || Bl(e, t)))
    return (t.columns ?? []).find(
      (n) => n.label !== void 0 && er(n.label) === e
    );
}
function ql(e, t) {
  if (!t || e.label === void 0 || !tr(e)) return;
  const n = er(e.label);
  return nr(n, t) === e ? n : void 0;
}
function Wn(e, t) {
  const n = e.toLowerCase(), a = t.toLowerCase();
  if (!a.includes("*")) return n.includes(a);
  const s = a.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(s).test(n);
}
function _s(e, t) {
  return e.toLowerCase() === t.toLowerCase();
}
function Vl(e, t, n) {
  if (e.kind === "text") {
    const i = n.columns ?? [];
    return ["identity", "reference"].some((o) => {
      const l = Ge(i, o), c = l ? Ke(l, t) : void 0;
      return typeof c == "string" && Wn(c, e.value);
    });
  }
  const a = Dl(e.field, t, n);
  if (a === void 0) return null;
  if (Array.isArray(a))
    return e.comparator === ":" || e.comparator === "=" ? a.some(
      (o) => e.comparator === "=" ? _s(String(o), e.value) : Wn(String(o), e.value)
    ) : null;
  if (e.comparator === ":" || e.comparator === "=") {
    if (typeof a == "boolean") {
      const i = e.value.toLowerCase();
      return i === "true" || i === "yes" ? a : i === "false" || i === "no" ? !a : null;
    }
    if (typeof a == "number") {
      const i = Number(e.value);
      return Number.isFinite(i) ? a === i : null;
    }
    return e.comparator === "=" ? _s(String(a), e.value) : Wn(String(a), e.value);
  }
  const s = Number(e.value), r = typeof a == "number" ? a : Number(a);
  return !Number.isFinite(s) || !Number.isFinite(r) ? null : Kl(e.comparator, r, s);
}
function ys(e, t, n) {
  const a = Vl(e, t, n);
  return a === null ? !0 : e.negated ? !a : a;
}
function Kl(e, t, n) {
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
function ws(e) {
  return e.kind === "field" && !e.negated && (e.comparator === ":" || e.comparator === "=");
}
function Hl(e, t, n) {
  return e.length ? e.some((a) => {
    const s = /* @__PURE__ */ new Map();
    for (const r of a)
      ws(r) && s.set(r.field, (s.get(r.field) ?? !1) || ys(r, t, n));
    return a.every(
      (r) => ws(r) ? s.get(r.field) === !0 : ys(r, t, n)
    );
  }) : !0;
}
function ks(e) {
  return /[\s"']/.test(e) ? `"${e.replace(/["']/g, "")}"` : e;
}
function tn(e) {
  const t = e.negated ? "-" : "";
  return e.kind === "text" ? t + ks(e.value) : `${t}${e.field}${e.comparator}${ks(e.value)}`;
}
function Wl(e) {
  if (!e.negated) return { ...e, negated: !0 };
  const { negated: t, ...n } = e;
  return n;
}
function rt(e) {
  return e.filter((t) => t.length).map((t) => t.map(tn).join(" ")).join(" OR ");
}
function Ul(e, t, n) {
  return e.map((a, s) => s === t ? a.filter((r, i) => i !== n) : a).filter((a) => a.length);
}
function jl(e) {
  const t = Ne(e);
  if (t.length > 1) return { parts: [], text: e.trim() };
  const n = t[0] ?? [];
  return {
    parts: n.filter((a) => a.kind === "field"),
    text: n.filter((a) => a.kind === "text").map(tn).join(" ")
  };
}
function bs(e, t) {
  return [...e.map(tn), t.trim()].filter(Boolean).join(" ");
}
const $s = (e, t) => e.toLowerCase() === t.toLowerCase();
function ia(e, t) {
  return !!e.negated == !!t.negated && ar(e, t);
}
function Gl(e, t) {
  return !!e.negated != !!t.negated && ar(e, t);
}
function ar(e, t) {
  return e.kind === "field" ? t.kind === "field" && e.field === t.field && e.comparator === t.comparator && $s(e.value, t.value) : t.kind === "text" && $s(e.value, t.value);
}
function Xl(e, t) {
  return t.filter((n) => !e.some((a) => ia(a, n)));
}
function Ea(e, t) {
  return sr(e, t, (n) => n);
}
function ca(e, t) {
  return sr(
    e,
    t,
    (n, a) => n.filter((s) => !a.some((r) => Gl(s, r)))
  );
}
const Yl = /^[A-Za-z_][\w.-]*\s*(?:>=|<=|:|=|>|<)$/;
function Ql(e) {
  return rt(
    Ne(e).map(
      (t) => t.filter(
        (n) => n.kind !== "text" || n.value !== "-" && !Yl.test(n.value)
      )
    ).filter((t) => t.length > 0)
  );
}
function sr(e, t, n) {
  const a = Ne(e), s = Ne(t);
  return a.length ? s.length ? rt(
    a.flatMap(
      (r) => s.map((i) => [...n(r, i), ...Xl(r, i)])
    )
  ) : rt(a) : rt(s);
}
const xs = [
  "oklch(0.36 0.06 240)",
  "oklch(0.34 0.07 290)",
  "oklch(0.36 0.06 160)",
  "oklch(0.38 0.06 80)",
  "oklch(0.35 0.07 30)",
  "oklch(0.34 0.05 200)"
];
function rr(e, t) {
  return `${e}_${1e4 + t * 7}`;
}
const Zl = 7, Jl = 3;
function eo(e, t, n, a) {
  const s = (t * Zl + mn(n)) % a, r = [];
  for (let i = 0; i < Math.min(Jl, a); i++)
    r.push(rr(e, (s + i) % a));
  return r;
}
function to(e, t) {
  switch (e.kind) {
    case "chips":
      return e.multiple ? no(e.options, t) : e.options[t % e.options.length] ?? "";
    case "range": {
      const n = Math.max(0, e.max - e.min);
      return e.min + (n === 0 ? 0 : t % (n + 1));
    }
    case "toggle":
      return t % 3 === 0;
  }
}
function no(e, t) {
  if (!e.length) return [];
  const n = 1 + (t >> 5) % Math.min(3, e.length), a = t % e.length, s = /* @__PURE__ */ new Set();
  for (let r = 0; r < n; r++) s.add((a + r) % e.length);
  return [...s].sort((r, i) => r - i).map((r) => e[r]);
}
function ao(e, t) {
  const { hash: n, sample: a, revision: s, updatedAt: r } = t, i = s ? ` · rev ${s + 1}` : "";
  switch (e.role) {
    case "identity":
      return `${a[0]}${i}`;
    case "reference":
      return s ? `${a[1]}-${s + 1}` : a[1];
    case "state":
      return dn[n % dn.length];
    case "updated":
      return r;
    case "tint":
      return xs[n % xs.length];
    case "metric":
      return 1 + n % 940;
  }
  switch (e.kind) {
    case "number":
      return 1 + n % 940;
    case "status":
      return dn[n % dn.length];
    case "date":
      return r;
    default:
      return;
  }
}
function so(e, t = {}) {
  const n = t.population ?? 48, a = t.seed ?? "", s = t.now ?? /* @__PURE__ */ new Date("2026-08-25T00:00:00Z"), r = e.samples, i = t.scopes ?? [];
  if (!r.length) return [];
  const o = [];
  for (let l = 0; l < n; l++) {
    const c = r[l % r.length], d = Math.floor(l / r.length), h = mn(`${a}:${e.key}:${c[0]}:${l}`), k = rr(e.key, l), g = new Date(s.getTime() - h % 900 * 36e5).toISOString(), y = {};
    for (const b of e.columns ?? []) {
      const M = b.field ?? b.key;
      if (!M || b.value) continue;
      const w = ao(b, {
        hash: mn(`${h}:${M}`),
        sample: c,
        revision: d,
        updatedAt: g
      });
      w !== void 0 && (y[M] = w);
    }
    for (const b of e.facets)
      y[b.key] = to(b, mn(`${h}:${b.key}`));
    for (const [b, M] of i)
      y[b] = M === e.key ? k : eo(M, l, b, n);
    o.push({ id: k, entityKey: e.key, entityLabel: e.label, fields: y });
  }
  return o;
}
function ro(e, t) {
  for (const [n, a] of Object.entries(t)) {
    const s = e.fields[n];
    switch (a.kind) {
      case "chips": {
        if (!a.selected.length) break;
        if (Array.isArray(s)) {
          if (!s.some((r) => a.selected.includes(String(r)))) return !1;
          break;
        }
        if (typeof s != "string" || !a.selected.includes(s)) return !1;
        break;
      }
      case "range": {
        if (a.min === null && a.max === null) break;
        const r = typeof s == "number" ? s : Number(s);
        if (!Number.isFinite(r) || a.min !== null && r < a.min || a.max !== null && r > a.max) return !1;
        break;
      }
      case "toggle": {
        if (!a.on) break;
        if (s !== !0) return !1;
        break;
      }
    }
  }
  return !0;
}
function lo(e, t) {
  const n = e.find((i) => i.sort === t);
  if (!n) return () => 0;
  const a = n.kind ?? "text", s = a === "number" || n.role === "metric", r = a === "date" || n.role === "updated";
  return (i, o) => {
    const l = Ke(n, i), c = Ke(n, o);
    return s ? Number(c ?? 0) - Number(l ?? 0) : r ? Date.parse(String(c ?? "")) - Date.parse(String(l ?? "")) : String(c ?? "").localeCompare(String(l ?? ""));
  };
}
function oo(e = {}) {
  const t = /* @__PURE__ */ new Map(), n = (a, s) => {
    const r = t.get(a.key);
    if (r) return r;
    const i = e.scopes ?? s.entities.flatMap(
      (l) => l.scope ? [[l.scope, l.key]] : []
    ), o = so(a, { ...e, scopes: i });
    return t.set(a.key, o), o;
  };
  return {
    query({ query: a, schema: s, entity: r, limit: i, offset: o }) {
      const l = Ne(a.expr), c = r ? [r] : s.entities, d = [], h = [];
      for (const y of c)
        for (const b of n(y, s))
          d.push(b), (r ? ro(b, a.facets) : !0) && Hl(l, b, y) && h.push(b);
      const k = ct(r, a.sort, s), g = h.sort(lo(Us(r, s), k.key));
      return a.dir === "asc" && g.reverse(), {
        // One page out of the middle. `total` stays the whole match, which is
        // what the shell counts pages with.
        rows: g.slice(o, o + i),
        total: h.length,
        unfiltered: h.length === d.length
      };
    }
  };
}
function zn(e, t) {
  return lr(e, t.id);
}
function lr(e, t) {
  const n = e?.scope;
  return n ? `${n}="${t.replace(/"/g, "")}"` : null;
}
function Ln(e, t) {
  if (e.kind !== "field" || t.kind !== "field") return ia(e, t);
  const n = (a) => a.comparator === ":" || a.comparator === "=";
  return ia(e, { ...t, comparator: n(e) && n(t) ? e.comparator : t.comparator });
}
function Cn(e, t) {
  return Ln(e, Wl(t));
}
function Wt(e, t) {
  return zn(
    e.entities.find((n) => n.key === t.entityKey),
    t
  );
}
function Aa(e, t) {
  if (!t) return e;
  const n = e.trim();
  if (!n) return t;
  const [a] = Ne(t).flat();
  if (!a) return n;
  const s = Ne(n);
  return s.some((o) => o.some((l) => Ln(l, a))) ? n : s.some((o) => o.some((l) => Cn(l, a))) ? rt(
    s.map(
      (o) => o.map((l) => Cn(l, a) ? a : l)
    )
  ) : `${n} ${t}`;
}
function or(e) {
  if (!e) return null;
  const t = e.trim();
  return t ? t.startsWith("-") ? t.slice(1) : `-${t}` : null;
}
function Ta(e, t) {
  if (!t || !e.trim()) return null;
  const [n] = Ne(t).flat();
  if (!n) return null;
  const a = Ne(e).flat();
  return a.some((s) => Ln(s, n)) ? n.negated ? "out" : "in" : a.some((s) => Cn(s, n)) ? n.negated ? "in" : "out" : null;
}
function ir(e, t) {
  if (!t || !e.trim()) return e;
  const [n] = Ne(t).flat();
  if (!n) return e;
  const a = Ne(e), s = a.map(
    (r) => r.filter((i) => !Ln(i, n) && !Cn(i, n))
  );
  return s.every((r, i) => r.length === a[i]?.length) ? e : rt(s);
}
function ua(e, t, n) {
  return t ? n === null ? ir(e, t) : Aa(e, n === "out" ? or(t) : t) : e;
}
function cr(e) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0;
}
function In(e) {
  return e.altKey ? { exclude: !0 } : {};
}
function Un(e, t, n, a = {}) {
  const s = Wt(e, n);
  return Aa(t.expr, a.exclude ? or(s) : s);
}
function ur(e, t) {
  const n = e?.scope?.toLowerCase();
  if (!n || e?.keepsScope || !t.trim()) return t;
  const a = Ne(t), s = a.map(
    (r) => r.filter((i) => i.kind !== "field" || i.field !== n)
  );
  return s.every((r, i) => r.length === a[i]?.length) ? t : rt(s);
}
function dr(e, t) {
  const n = t.toLowerCase();
  return e.entities.find((a) => a.scope?.toLowerCase() === n) ?? null;
}
const fr = Symbol("dc.shellContext");
function io(e) {
  const t = e.liveQuery ? e : co(e);
  return ba(fr, t), t;
}
function co(e) {
  const t = e.draft ?? H("");
  return {
    draft: t,
    liveQuery: e.query,
    drafting: v(() => !1),
    commitDraft() {
      const n = t.value.trim();
      n && (e.setExpression(
        ca(e.query.value.expr, Mn(n, e.entity.value))
      ), t.value = "");
    },
    abandonDraft() {
      t.value = "";
    },
    ...e
  };
}
function be() {
  const e = It(fr, null);
  if (!e)
    throw new Error(
      "[header-content-layout] No shell context found. Render this component inside <DataShell>."
    );
  return e;
}
const Ra = "e", za = "v", La = "s", Ia = "d", Na = "q", Fa = "p", Oa = "f_", pr = "*", uo = [
  Ra,
  za,
  La,
  Ia,
  Na,
  Fa
], da = "..", vr = ",", fo = [
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
function jn(e) {
  let t = encodeURIComponent(e);
  for (const [n, a] of fo) t = t.replace(n, a);
  return t;
}
function st(e) {
  try {
    return decodeURIComponent(e.replace(/\+/g, " "));
  } catch {
    return e.replace(/\+/g, " ");
  }
}
function hr(e) {
  const t = e.replace(/^[?]/, "");
  if (!t) return [];
  const n = [];
  for (const a of t.split("&")) {
    if (!a) continue;
    const s = a.indexOf("="), r = s === -1 ? a : a.slice(0, s), i = s === -1 ? "" : a.slice(s + 1);
    n.push([st(r), i]);
  }
  return n;
}
function po(e) {
  return uo.includes(e) || e.startsWith(Oa);
}
function Ms(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function vo(e, t) {
  const n = st(t);
  switch (e.kind) {
    case "chips": {
      const a = new Set(
        n.split(vr).map((r) => r.trim()).filter(Boolean)
      );
      return { kind: "chips", selected: e.options.filter((r) => a.has(r)) };
    }
    case "range": {
      const a = n.indexOf(da), s = (a === -1 ? n : n.slice(0, a)).trim(), r = (a === -1 ? "" : n.slice(a + da.length)).trim(), i = s === "" ? null : Number(s), o = r === "" ? null : Number(r);
      let l = i !== null && Number.isFinite(i) ? Ms(i, e.min, e.max) : null, c = o !== null && Number.isFinite(o) ? Ms(o, e.min, e.max) : null;
      return l !== null && c !== null && l > c && ([l, c] = [c, l]), { kind: "range", min: l, max: c };
    }
    case "toggle":
      return { kind: "toggle", on: n === "1" || n === "true" };
  }
}
function ho(e, t) {
  switch (e.kind) {
    case "chips":
      return e.selected.length ? (t.kind === "chips" ? t.options.filter((a) => e.selected.includes(a)) : e.selected).join(vr) : null;
    case "range":
      return e.min === null && e.max === null ? null : `${e.min ?? ""}${da}${e.max ?? ""}`;
    case "toggle":
      return e.on ? "1" : null;
  }
}
function mo(e, t, n = {}) {
  const a = Sa(t, n), s = new Map(hr(e)), r = s.get(Ra), i = r === void 0 ? a.entity : st(r), o = i === pr ? null : Et(t, i), l = s.get(za), c = l && Hs(st(l)) ? st(l) : Yt(o?.key ?? null, n), d = s.get(La), h = ct(o, d ? st(d) : n.sort, t), k = s.get(Ia), g = k ? st(k) === "asc" ? "asc" : "desc" : a.dir, y = s.get(Na), b = s.get(Fa), M = b === void 0 ? 1 : Number(st(b)), w = Number.isFinite(M) ? Math.max(1, Math.floor(M)) : 1, S = {};
  for (const z of o?.facets ?? []) {
    const x = s.get(`${Oa}${z.key}`);
    S[z.key] = x === void 0 ? xa(z) : vo(z, x);
  }
  return {
    entity: o?.key ?? null,
    view: c,
    sort: h.key,
    dir: g,
    expr: y === void 0 ? "" : st(y),
    facets: Ys(o, S),
    page: w
  };
}
function Gn(e, t, n = {}, a = "") {
  const s = Sa(t, n), r = Et(t, e.entity), i = hr(a).filter(([h]) => !po(h)), o = [], l = (h, k) => o.push([h, jn(k)]), c = r?.key ?? null;
  c !== s.entity && l(Ra, c ?? pr), e.view !== Yt(c, n) && l(za, e.view), e.sort !== s.sort && l(La, e.sort), e.dir !== s.dir && l(Ia, e.dir), e.expr.trim() !== "" && l(Na, e.expr);
  for (const h of r?.facets ?? []) {
    const k = e.facets[h.key];
    if (!k) continue;
    const g = ho(k, h);
    g !== null && o.push([`${Oa}${h.key}`, jn(g)]);
  }
  e.page > 1 && l(Fa, String(e.page));
  const d = [
    ...i.map(([h, k]) => [jn(h), k]),
    ...o
  ];
  return d.length ? `?${d.map(([h, k]) => k === "" ? h : `${h}=${k}`).join("&")}` : "";
}
const Sn = "entity", Qt = "expr";
function go(e, t) {
  const n = e.label.toLowerCase();
  switch (t.kind) {
    case "chips":
      return t.selected.map((a) => ({
        id: `${e.key}:${a}`,
        label: `${n}:${a}`,
        facetKey: e.key,
        option: a
      }));
    case "range": {
      if (t.min === null && t.max === null) return [];
      const a = t.min !== null && t.max !== null ? `${t.min} ≤ ${n} ≤ ${t.max}` : t.max !== null ? `${n} ≤ ${t.max}` : `${n} ≥ ${t.min}`;
      return [{ id: e.key, label: a, facetKey: e.key }];
    }
    case "toggle":
      return t.on ? [{ id: e.key, label: `${n}:on`, facetKey: e.key }] : [];
  }
}
function Da(e, t) {
  const n = [];
  t && n.push({
    id: Sn,
    label: `entity:${t.key}`,
    facetKey: Sn
  });
  for (const a of t?.facets ?? []) {
    const s = e.facets[a.key];
    s && Gs(s) && n.push(...go(a, s));
  }
  return Ne(e.expr).forEach((a, s) => {
    a.forEach((r, i) => {
      n.push({
        id: `${Qt}:${s}:${i}`,
        label: tn(r),
        facetKey: Qt,
        group: s,
        index: i,
        ...r.kind === "field" ? { field: r.field, value: r.value } : {},
        ...r.negated ? { negated: !0 } : {}
      });
    });
  }), n;
}
function _o(e, t, n = null) {
  if (Ma(e)) {
    const r = ct(t, e.sort, n);
    return `everything · ${e.view} · ${r.label}`;
  }
  const a = Da(e, t).filter((r) => r.facetKey !== Qt).map((r) => r.label), s = e.expr.trim();
  return s && a.push(`"${s}"`), a.join(" · ");
}
function yo(e) {
  const { adapter: t } = e, n = v(() => Pt(e.schema)), a = v(() => Pt(e.defaults) ?? {}), s = v(() => mo(t.search.value, n.value, a.value)), r = v(() => Et(n.value, s.value.entity)), i = v(() => r.value ?? Ws(n.value, a.value)), o = v(() => js(r.value, n.value)), l = v(() => ct(r.value, s.value.sort, n.value)), c = (w, S) => {
    const z = Gn(w, n.value, a.value, t.search.value);
    return z === t.search.value ? !1 : (S === "push" ? t.push(z) : t.replace(z), !0);
  }, d = () => Pt(e.navigationMode) ?? "push", h = () => Pt(e.facetNavigationMode) ?? "replace", k = (w, S) => {
    const z = w.page ?? (Hn(w) ? 1 : s.value.page);
    return c({ ...s.value, ...w, page: z }, S);
  }, g = (w) => {
    const S = w.page ?? (Hn(w) ? 1 : s.value.page), z = Gn({ ...s.value, ...w, page: S }, n.value, a.value, t.search.value);
    return t.href ? t.href(z) : `${t.path.value}${z}`;
  }, y = (w, S) => {
    const z = s.value.facets[w];
    if (!z) return;
    const x = { ...s.value.facets, [w]: S(z) };
    k({ facets: x }, h());
  }, b = (w) => {
    const S = w === null ? null : Et(n.value, w);
    return (S?.key ?? null) === s.value.entity ? {} : {
      entity: S?.key ?? null,
      view: ps(s.value.view, s.value.entity, S?.key ?? null, a.value),
      sort: ct(S, s.value.sort, n.value).key,
      facets: Ft(S)
    };
  }, M = (w) => {
    const S = b(w);
    Object.keys(S).length && k(S, d());
  };
  return {
    query: s,
    entity: r,
    focus: i,
    sort: l,
    sorts: o,
    summary: v(() => _o(s.value, r.value, n.value)),
    terms: v(() => Da(s.value, r.value)),
    isPristine: v(() => Ma(s.value)),
    isEverything: v(() => s.value.entity === null),
    hasFacets: v(() => Xs(s.value.facets)),
    setEntity: M,
    entityHref: (w) => g(b(w)),
    clearEntity: () => M(null),
    setView(w) {
      k({ view: w }, d());
    },
    setSort(w) {
      k({ sort: ct(r.value, w, n.value).key }, d());
    },
    toggleDirection() {
      k({ dir: s.value.dir === "desc" ? "asc" : "desc" }, d());
    },
    setExpression(w) {
      return k({ expr: w }, d());
    },
    narrow(w, S, z) {
      return k({ expr: w, ...b(S), ...z ? { view: z } : {} }, d());
    },
    narrowHref(w, S, z) {
      return g({ expr: w, ...b(S), ...z ? { view: z } : {} });
    },
    setPage(w, S) {
      k({ page: Math.max(1, Math.floor(w)) }, S ?? d());
    },
    setFacet(w, S) {
      y(w, () => S);
    },
    toggleChip(w, S) {
      y(w, (z) => z.kind !== "chips" ? z : { kind: "chips", selected: z.selected.includes(S) ? z.selected.filter((E) => E !== S) : [...z.selected, S] });
    },
    setRange(w, S, z) {
      y(w, (x) => x.kind === "range" ? { kind: "range", min: S, max: z } : x);
    },
    toggleFlag(w) {
      y(
        w,
        (S) => S.kind === "toggle" ? { kind: "toggle", on: !S.on } : S
      );
    },
    removeTerm(w) {
      if (w.facetKey === Sn) {
        M(null);
        return;
      }
      if (w.facetKey === Qt) {
        const S = Ul(Ne(s.value.expr), w.group ?? 0, w.index ?? 0);
        k({ expr: rt(S) }, d());
        return;
      }
      y(w.facetKey, (S) => S.kind === "chips" && w.option ? { kind: "chips", selected: S.selected.filter((z) => z !== w.option) } : S.kind === "range" ? { kind: "range", min: null, max: null } : S.kind === "toggle" ? { kind: "toggle", on: !1 } : S);
    },
    clearFilters() {
      k({ ...b(null), expr: "", facets: Ft(null) }, d());
    },
    reset() {
      c(Sa(n.value, a.value), d());
    },
    hrefFor(w) {
      const S = { ...s.value, ...w };
      return "entity" in w && !("view" in w) && (S.view = ps(s.value.view, s.value.entity, S.entity, a.value)), S.page = w.page ?? (Hn(w) ? 1 : s.value.page), S.facets = Ys(Et(n.value, S.entity), S.facets), `${t.path.value}${Gn(S, n.value, a.value, t.search.value)}`;
    }
  };
}
function wo(e) {
  const t = wt([]), n = H(0), a = H(!1), s = H(!1), r = wt(null);
  let i = 0, o = null, l = null;
  const c = v(() => (e.query.value.page - 1) * e.limit.value), d = v(() => Sl(n.value, e.limit.value)), h = () => {
    const x = e.query.value, E = e.within?.value.trim(), O = ur(e.entity.value, x.expr);
    return E ? { ...x, expr: Ea(E, O) } : O === x.expr ? x : { ...x, expr: O };
  }, k = (x, E) => {
    t.value = x.rows, n.value = x.total, r.value = null, g(E);
  }, g = (x) => {
    o = { key: x, total: n.value }, s.value = !1;
  }, y = (x) => {
    r.value = x, t.value = [], n.value = 0, o = null, s.value = !1;
  }, b = (x, E, O, P) => {
    let R = !0;
    const T = () => x === i;
    let K = 0, W = !1;
    const U = (le) => {
      K = le, W = !0, P === void 0 && (n.value = le);
    }, ue = () => {
      R && (R = !1, t.value = [], U(0)), r.value = null;
    };
    return {
      get open() {
        return T();
      },
      insert(le, Ae) {
        if (!T()) return;
        const $ = Array.isArray(le) ? le : [le];
        if (!$.length) return;
        ue();
        const D = [...t.value];
        D.splice(Ae ?? D.length, 0, ...$), t.value = E > 0 ? D.slice(0, E) : D, U(K + $.length);
      },
      set(le) {
        T() && (le.rows && (ue(), t.value = E > 0 ? le.rows.slice(0, E) : le.rows, U(le.rows.length)), le.total !== void 0 && U(le.total));
      },
      close() {
        T() && (a.value = !1, W && (n.value = K), g(O));
      },
      fail(le) {
        T() && (y(le), a.value = !1);
      }
    };
  }, M = () => {
    const x = l;
    l = null, x?.();
  }, w = () => {
    const x = ++i;
    M();
    const E = S.value, O = o?.key === E ? o.total : void 0;
    s.value = O === void 0;
    const P = {
      query: h(),
      schema: e.schema.value,
      entity: e.entity.value,
      limit: e.limit.value,
      offset: c.value
    }, R = e.source.value;
    if (R.stream) {
      a.value = !0;
      try {
        l = R.stream(P, b(x, P.limit, E, O)) ?? null;
      } catch (K) {
        y(K), a.value = !1;
      }
      return;
    }
    let T;
    try {
      T = R.query(P);
    } catch (K) {
      y(K);
      return;
    }
    if (!(T instanceof Promise)) {
      k(T, E), a.value = !1;
      return;
    }
    a.value = !0, T.then((K) => {
      x === i && k(K, E);
    }).catch((K) => {
      x === i && y(K);
    }).finally(() => {
      x === i && (a.value = !1);
    });
  }, S = v(() => {
    const x = h();
    return `${e.entity.value?.key ?? e.schema.value.entities[0]?.key ?? ""}|${JSON.stringify(Pa.map((O) => x[O]))}`;
  }), z = v(() => `${S.value}|${e.query.value.page}`);
  return we([e.source, z, e.limit], w, {
    immediate: !0
  }), Zt(() => {
    i++, M();
  }, !0), { rows: t, total: n, offset: c, pageCount: d, pending: a, counting: s, error: r, refresh: w };
}
const ko = 150;
function bo(e) {
  const t = e.delay ?? ko, n = H(""), a = H("");
  let s = !1, r;
  const i = () => {
    clearTimeout(r), r = void 0;
  }, o = v(() => Mn(Ql(a.value), e.entity.value)), l = v(() => o.value.trim() !== ""), c = v(
    () => JSON.stringify([o.value, ...Pa.map((g) => e.query.value[g])])
  ), d = wt(null), h = v(() => {
    const g = e.query.value;
    if (!l.value) return g;
    const y = d.value?.of === c.value ? d.value.page : 1;
    return { ...g, expr: ca(g.expr, o.value), page: y };
  });
  we(n, (g) => {
    if (i(), !g.trim()) {
      s || (a.value = "");
      return;
    }
    s = !1, r = setTimeout(() => {
      r = void 0, a.value = n.value;
    }, t);
  }), we(
    e.query,
    () => {
      s && (s = !1, a.value = "");
    },
    { flush: "sync" }
  );
  const k = (g) => {
    i(), s = !0, n.value = "", !g() && s && (s = !1, a.value = "");
  };
  return An() && Zt(i), {
    text: n,
    live: h,
    drafting: l,
    setPage(g) {
      d.value = { of: c.value, page: Math.max(1, Math.floor(g)) };
    },
    commit() {
      const g = n.value.trim();
      if (!g) return;
      const y = ca(
        e.query.value.expr,
        Mn(g, e.entity.value)
      );
      a.value = g, k(() => e.setExpression(y));
    },
    abandon() {
      i(), s = !1, n.value = "", a.value = "";
    },
    release: k
  };
}
const Ut = (e) => e.separator !== !0 && e.heading !== !0 && e.disabled !== !0, $o = ["aria-label"], xo = ["role", "aria-label"], Mo = ["data-dc-item"], Co = {
  key: 0,
  class: "dc-menu__rule",
  role: "separator"
}, So = ["role", "aria-checked", "aria-haspopup", "aria-expanded", "aria-disabled", "disabled", "data-dc-item", "onClick", "onMouseenter"], Po = {
  class: "dc-menu__mark",
  "aria-hidden": "true"
}, Eo = { class: "dc-menu__label dc-truncate" }, Ao = {
  key: 0,
  class: "dc-menu__key dc-mono"
}, To = {
  key: 1,
  class: "dc-menu__more",
  "aria-hidden": "true"
}, Ro = /* @__PURE__ */ oe({
  __name: "MenuList",
  props: {
    items: {},
    at: {},
    label: {},
    autofocus: { type: Boolean }
  },
  emits: ["choose", "dismiss"],
  setup(e, { expose: t, emit: n }) {
    const a = e, s = n, r = H(null), i = H([]), o = H(null), l = H(null), c = H(null), d = H(!1), h = v(
      () => a.items.flatMap((P, R) => Ut(P) ? [R] : [])
    ), k = v(() => {
      const P = [{ entries: [] }];
      return a.items.forEach((R, T) => {
        R.heading ? P.push({ heading: R, entries: [] }) : P[P.length - 1]?.entries.push({ item: R, index: T });
      }), P.filter((R) => R.entries.length > 0);
    }), g = H({ x: a.at.x, y: a.at.y });
    async function y() {
      g.value = { x: a.at.x, y: a.at.y }, await Nt();
      const P = r.value?.getBoundingClientRect();
      if (!P) return;
      const R = 8;
      let T = a.at.x, K = a.at.y;
      if (T + P.width > window.innerWidth - R) {
        const W = a.at.mirrorX === void 0 ? null : a.at.mirrorX - P.width;
        T = W !== null && W >= R ? W : window.innerWidth - P.width - R;
      }
      K + P.height > window.innerHeight - R && (K = window.innerHeight - P.height - R), g.value = { x: Math.max(R, T), y: Math.max(R, K) };
    }
    const b = v(() => ({ left: `${g.value.x}px`, top: `${g.value.y}px` }));
    function M(P) {
      o.value = P, P !== null && Nt(() => i.value[P]?.focus());
    }
    function w(P, R) {
      const T = h.value;
      if (T.length === 0) return null;
      if (P === null) return R === 1 ? T[0] ?? null : T[T.length - 1] ?? null;
      const K = T.indexOf(P);
      return K === -1 ? T[0] ?? null : T[(K + R + T.length) % T.length] ?? null;
    }
    function S(P, R) {
      if (!a.items[P]?.items?.length) return;
      const K = i.value[P]?.getBoundingClientRect(), W = r.value?.getBoundingClientRect();
      !K || !W || (c.value = { x: W.right - 4, y: K.top - 4, mirrorX: W.left + 4 }, l.value = P, d.value = R);
    }
    function z(P) {
      const R = l.value;
      l.value = null, c.value = null, P && R !== null && M(R);
    }
    function x(P) {
      const R = a.items[P];
      if (!(!R || !Ut(R))) {
        if (R.items?.length) {
          S(P, !0);
          return;
        }
        s("choose", R);
      }
    }
    function E(P) {
      const R = P.key;
      if (R === "Escape") {
        P.preventDefault(), P.stopPropagation(), l.value !== null ? z(!0) : s("dismiss");
        return;
      }
      if (R === "ArrowDown" || R === "ArrowUp") {
        P.preventDefault(), P.stopPropagation(), z(!1), M(w(o.value, R === "ArrowDown" ? 1 : -1));
        return;
      }
      if (R === "Home" || R === "End") {
        P.preventDefault(), P.stopPropagation(), z(!1), M(w(null, R === "Home" ? 1 : -1));
        return;
      }
      if (R === "ArrowRight") {
        const T = o.value;
        T !== null && a.items[T]?.items?.length && (P.preventDefault(), P.stopPropagation(), S(T, !0));
        return;
      }
      if (R === "ArrowLeft") {
        l.value !== null && (P.preventDefault(), P.stopPropagation(), z(!0));
        return;
      }
      if (R === "Enter" || R === " ") {
        const T = o.value;
        if (T === null) return;
        P.preventDefault(), P.stopPropagation(), x(T);
      }
    }
    function O(P) {
      const R = a.items[P];
      !R || !Ut(R) || (l.value !== null && l.value !== P && z(!1), M(P), R.items?.length && S(P, !1));
    }
    return Bs(() => {
      y(), a.autofocus && M(w(null, 1));
    }), we(() => a.at, y, { deep: !0 }), we(() => a.items, () => void y(), { deep: !0 }), We(() => {
      l.value = null;
    }), t({ root: r }), (P, R) => {
      const T = qs("MenuList", !0);
      return f(), m("div", {
        ref_key: "root",
        ref: r,
        class: "dc-menu",
        role: "menu",
        "aria-label": e.label,
        style: Ee(b.value),
        onKeydown: E
      }, [
        (f(!0), m(ne, null, me(k.value, (K, W) => (f(), m("div", {
          key: `${W}-${K.heading?.label ?? ""}`,
          class: "dc-menu__group",
          role: K.heading ? "group" : "none",
          "aria-label": K.heading?.label
        }, [
          K.heading ? (f(), m("div", {
            key: 0,
            class: "dc-menu__heading dc-truncate",
            "aria-hidden": "true",
            "data-dc-item": K.heading.id
          }, F(K.heading.label), 9, Mo)) : I("", !0),
          (f(!0), m(ne, null, me(K.entries, ({ item: U, index: ue }) => (f(), m(ne, {
            key: U.id ?? `${ue}-${U.label ?? ""}`
          }, [
            U.separator ? (f(), m("div", Co)) : (f(), m("button", {
              key: 1,
              ref_for: !0,
              ref: (le) => {
                le && (i.value[ue] = le);
              },
              type: "button",
              class: "dc-menu__item",
              role: U.checked === void 0 ? "menuitem" : "menuitemcheckbox",
              "aria-checked": U.checked === void 0 ? void 0 : U.checked,
              "aria-haspopup": U.items?.length ? "menu" : void 0,
              "aria-expanded": U.items?.length ? l.value === ue : void 0,
              "aria-disabled": U.disabled ? "true" : void 0,
              disabled: U.disabled,
              "data-dc-item": U.id,
              tabindex: "-1",
              onClick: (le) => x(ue),
              onMouseenter: (le) => O(ue)
            }, [
              C("span", Po, F(U.checked ? "✓" : ""), 1),
              C("span", Eo, F(U.label), 1),
              U.shortcut ? (f(), m("span", Ao, F(U.shortcut), 1)) : U.items?.length ? (f(), m("span", To, "›")) : I("", !0)
            ], 40, So))
          ], 64))), 128))
        ], 8, xo))), 128)),
        l.value !== null && c.value ? (f(), Q(T, {
          key: l.value,
          items: e.items[l.value]?.items ?? [],
          at: c.value,
          label: e.items[l.value]?.label,
          autofocus: d.value,
          onChoose: R[0] || (R[0] = (K) => s("choose", K)),
          onDismiss: R[1] || (R[1] = (K) => z(!0))
        }, null, 8, ["items", "at", "label", "autofocus"])) : I("", !0)
      ], 44, $o);
    };
  }
}), fe = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [a, s] of t)
    n[a] = s;
  return n;
}, Ba = /* @__PURE__ */ fe(Ro, [["__scopeId", "data-v-9b1413fa"]]), zo = { class: "dc-pick" }, Lo = ["id"], Io = ["id", "aria-expanded", "aria-labelledby", "data-dc-value"], No = { class: "dc-pick__label" }, Fo = /* @__PURE__ */ oe({
  __name: "PickControl",
  props: {
    modelValue: {},
    options: {},
    label: {},
    mono: { type: Boolean }
  },
  emits: ["update:modelValue", "open", "close"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = Tn() ?? "dc-pick", r = H(null), i = H(null), o = H(null), l = H(!1), c = v(() => o.value !== null), d = H(null), h = v(
      () => n.options.find((x) => x.key === n.modelValue) ?? n.options[0]
    ), k = v(
      () => n.options.map((x) => ({
        id: x.key,
        label: x.label,
        checked: x.key === n.modelValue
      }))
    ), g = v(
      () => o.value ? { maxHeight: `${window.innerHeight - o.value.y - 8}px` } : void 0
    );
    function y(x) {
      const E = r.value?.getBoundingClientRect();
      E && (d.value = r.value?.closest(".dc-shell") ?? document.body, o.value = { x: E.left, y: E.bottom + 4, mirrorX: E.right }, l.value = x, a("open"));
    }
    function b(x) {
      o.value && a("close"), o.value = null, x && r.value?.focus();
    }
    function M() {
      c.value ? b(!0) : y(!1);
    }
    function w(x) {
      x.key !== "ArrowDown" && x.key !== "ArrowUp" || c.value || (x.preventDefault(), y(!0));
    }
    function S(x) {
      const E = x.target;
      E && (r.value?.contains(E) || i.value?.root?.contains(E) || b(!1));
    }
    we(c, (x) => {
      x ? window.addEventListener("pointerdown", S, !0) : window.removeEventListener("pointerdown", S, !0);
    }), We(() => window.removeEventListener("pointerdown", S, !0));
    function z(x) {
      b(!0), !(x.id === void 0 || x.id === n.modelValue) && a("update:modelValue", x.id);
    }
    return (x, E) => (f(), m("span", zo, [
      C("span", {
        id: `${A(s)}-name`,
        class: "dc-pick__name"
      }, F(e.label), 9, Lo),
      C("button", {
        id: `${A(s)}-value`,
        ref_key: "trigger",
        ref: r,
        type: "button",
        class: dt(["dc-pick__button", { "dc-mono": e.mono }]),
        "aria-haspopup": "menu",
        "aria-expanded": c.value,
        "aria-labelledby": `${A(s)}-name ${A(s)}-value`,
        "data-dc-value": e.modelValue,
        onClick: M,
        onKeydown: w
      }, [
        C("span", No, F(h.value?.label), 1)
      ], 42, Io),
      E[1] || (E[1] = C("span", {
        class: "dc-pick__mark",
        "aria-hidden": "true"
      }, "▾", -1)),
      o.value && d.value ? (f(), Q(_l, {
        key: 0,
        to: d.value
      }, [
        ce(Ba, {
          ref_key: "menu",
          ref: i,
          class: "dc-pick__list",
          style: Ee(g.value),
          items: k.value,
          at: o.value,
          label: e.label,
          autofocus: l.value,
          onChoose: z,
          onDismiss: E[0] || (E[0] = (O) => b(!0))
        }, null, 8, ["style", "items", "at", "label", "autofocus"])
      ], 8, ["to"])) : I("", !0)
    ]));
  }
}), Cs = /* @__PURE__ */ fe(Fo, [["__scopeId", "data-v-d21ebf1b"]]);
function Oo(e) {
  const t = wt(/* @__PURE__ */ new Map()), n = H(!0);
  let a = 0, s;
  const r = () => {
    a++, s?.abort(), s = void 0;
  }, i = () => {
    r();
    const o = a, { signal: l } = s = new AbortController(), c = e.query.value, d = e.schema.value, h = e.entities.value, k = e.within?.value.trim() ?? "";
    n.value = c.expr.trim() === "" && !k;
    const g = /* @__PURE__ */ new Map();
    let y = !0;
    for (const b of h) {
      const M = ur(b, c.expr), w = k ? Ea(k, M) : M;
      let S = !1;
      const z = (E) => {
        if (o !== a) return;
        if (y) {
          g.set(b.key, E);
          return;
        }
        const O = new Map(t.value);
        O.set(b.key, E), t.value = O;
      }, x = e.source.value.query({
        query: { ...c, entity: b.key, expr: w, facets: Ft(b), page: 1 },
        schema: d,
        entity: b,
        limit: 0,
        offset: 0,
        signal: l,
        progress: (E) => {
          S || z({ total: E, pending: !0, counted: !0 });
        }
      });
      x instanceof Promise ? (g.has(b.key) || g.set(b.key, { total: 0, pending: !0, counted: !1 }), x.then((E) => {
        S = !0, z({ total: E.total, pending: !1, counted: !0 });
      })) : (S = !0, g.set(b.key, { total: x.total, pending: !1, counted: !0 }));
    }
    y = !1, t.value = g;
  };
  return An() && Zt(r), { counts: t, pristine: n, refresh: i, cancel: r };
}
const Do = 25, mr = (e, t) => e.toLowerCase() === t.toLowerCase();
function Bo(e, t) {
  return e.find((n) => mr(n.id, t));
}
function qo(e) {
  const t = wt(/* @__PURE__ */ new Map()), n = /* @__PURE__ */ new Set(), a = (o) => {
    if (o.facetKey !== Qt || !o.field || !o.value) return null;
    const l = dr(e.schema.value, o.field);
    return l ? { entity: l, id: o.value, key: `${l.key}:${o.value}` } : null;
  }, s = (o) => {
    const { entity: l, id: c } = o, d = e.query.value;
    return e.source.value.query({
      query: {
        ...d,
        entity: l.key,
        // The reference on its own. The rest of the query is about the rows on
        // screen, which are of another type entirely.
        expr: lr(l, c) ?? "",
        facets: Ft(l),
        sort: ct(l, d.sort, e.schema.value).key,
        page: 1
      },
      schema: e.schema.value,
      entity: l,
      limit: Do,
      offset: 0
    });
  }, r = (o, l) => {
    const c = gn(Ge(o.columns ?? [], "identity"), l);
    return c === la || mr(c, l.id) ? "" : c;
  }, i = () => {
    const o = /* @__PURE__ */ new Map();
    for (const d of e.terms.value) {
      const h = a(d);
      h && !t.value.has(h.key) && !n.has(h.key) && o.set(h.key, h);
    }
    if (!o.size) return;
    const l = [...o.values()].map((d) => ({
      reference: d,
      outcome: s(d)
    })), c = (d) => {
      const h = new Map(t.value);
      d.forEach((k, g) => {
        const { reference: y } = l[g], b = Bo(k.rows, y.id);
        h.set(y.key, b ? r(y.entity, b) : "");
      }), t.value = h;
    };
    if (l.every(({ outcome: d }) => !(d instanceof Promise))) {
      c(l.map(({ outcome: d }) => d));
      return;
    }
    for (const { reference: d } of l) n.add(d.key);
    Promise.all(l.map(({ outcome: d }) => Promise.resolve(d))).then(c).catch(() => {
    }).finally(() => {
      for (const { reference: d } of l) n.delete(d.key);
    });
  };
  return we([e.source, e.schema, e.terms], () => {
    try {
      i();
    } catch {
    }
  }, { immediate: !0 }), {
    names: t,
    nameOf(o) {
      const l = a(o);
      return l && t.value.get(l.key) || null;
    }
  };
}
const Vo = ["data-dc-expanded"], Ko = { class: "dc-header__domain" }, Ho = {
  key: 0,
  class: "dc-header__within"
}, Wo = ["title"], Uo = ["data-dc-more", "title"], jo = {
  key: 0,
  class: "dc-header__or dc-mono",
  "aria-hidden": "true"
}, Go = ["title", "aria-label", "onClick"], Xo = ["onKeydown"], Yo = ["aria-expanded", "aria-controls"], Qo = {
  class: "dc-header__chevron",
  "aria-hidden": "true"
}, Zo = { class: "dc-header__sr" }, Jo = {
  key: 0,
  class: "dc-header__pages",
  "aria-label": "Pages"
}, ei = ["disabled"], ti = ["title"], ni = ["value", "onKeydown"], ai = {
  class: "dc-header__page-total",
  "aria-hidden": "true"
}, si = {
  class: "dc-header__sr",
  "aria-live": "polite"
}, ri = ["disabled"], li = {
  key: 1,
  class: "dc-header__actions"
}, oi = "…", ii = /* @__PURE__ */ oe({
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
    const n = e, a = t, s = be(), r = v(() => s.schema.value), i = v(
      () => s.hasFacets.value || !!s.liveQuery.value.expr.trim() || !!s.within.value
    ), o = v(() => r.value.formatCount ?? Mt), l = Oo({
      source: s.source,
      schema: s.schema,
      // What each type holds of what is on screen, the draft's results included:
      // a count of the committed query would disagree with the rows under it.
      query: s.liveQuery,
      entities: s.entities,
      within: s.within
    });
    function c(q) {
      if (n.hideCount) return q.count;
      if (q.key === s.query.value.entity && i.value) return o.value(s.total.value);
      if (l.pristine.value) return q.count;
      const G = l.counts.value.get(q.key);
      return G ? G.counted ? `${G.pending ? "~" : ""}${o.value(G.total)}` : oi : q.count;
    }
    function d(q) {
      return `${q.label} · ${c(q)}`;
    }
    const h = v(() => [
      { key: "", label: "Everything" },
      ...s.entities.value.map((q) => ({ key: q.key, label: d(q) }))
    ]), k = v(() => {
      const q = s.within.value.trim();
      return q ? Da({ ...s.query.value, expr: q, facets: {} }, null) : [];
    }), g = v(
      () => (n.views ?? [...Ks]).map((q) => ({ key: q, label: Ml[q] }))
    ), y = v(() => Rn(s.query.value.view, n.views)), b = v(() => g.value.length > 1), M = v(() => s.query.value.entity !== null);
    function w(q) {
      s.setView(q);
    }
    const S = v(() => {
      const q = s.entity.value, X = q?.keepsScope ? void 0 : q?.scope?.toLowerCase();
      return s.terms.value.filter((G) => G.facetKey !== Sn).map((G, De, Bt) => {
        const B = Bt[De - 1];
        return {
          term: G,
          or: B?.group !== void 0 && G.group !== void 0 && G.group !== B.group,
          idle: !!X && G.field?.toLowerCase() === X
        };
      });
    }), z = qo({
      source: s.source,
      schema: s.schema,
      query: s.query,
      // The scope's parts as well as the query's: it names a record more often
      // than a typed term does, being what a record's own page is built on.
      terms: v(() => [...k.value, ...s.terms.value])
    });
    function x(q) {
      return dr(r.value, q)?.scopeLabel ?? q;
    }
    function E(q) {
      return q.replace(/\s*\([^()]*\)\s*$/, "");
    }
    function O(q) {
      const X = z.nameOf(q);
      return X ? `${q.negated ? "-" : ""}${x(q.field)}: ${E(X)}` : q.label;
    }
    function P(q) {
      s.setEntity(q || null);
    }
    const R = H(null);
    function T() {
      s.abandonDraft(), R.value?.blur();
    }
    function K(q) {
      if (s.draft.value) return;
      const X = S.value.at(-1);
      X && (q.preventDefault(), s.removeTerm(X.term));
    }
    function W(q) {
      q.target?.closest("button, select, label, input") || a("toggle");
    }
    const U = H(null), ue = H("");
    function le() {
      const q = U.value;
      if (!q) {
        ue.value = "";
        return;
      }
      const X = q.scrollLeft > 1, G = q.scrollWidth - q.clientWidth - q.scrollLeft > 1;
      ue.value = X && G ? "both" : X ? "start" : G ? "end" : "";
    }
    let Ae = null;
    we(
      U,
      (q) => {
        Ae?.disconnect(), Ae = null, le(), !(!q || typeof ResizeObserver > "u") && (Ae = new ResizeObserver(le), Ae.observe(q));
      },
      { flush: "post" }
    ), we(S, le, { flush: "post" }), We(() => Ae?.disconnect());
    const $ = v(() => s.liveQuery.value.page), D = v(
      () => (s.pageCount.value > 1 || !!n.pagesNote) && !Ca(s.query.value, n.views)
    ), ie = v(
      () => `${s.counting.value ? "~" : ""}${Mt(s.pageCount.value)}`
    ), te = v(() => {
      let q = `Page ${Mt($.value)} of ${ie.value}`;
      const X = s.rows.value.length;
      if (X) {
        const G = s.offset.value + 1, De = `${s.counting.value ? "~" : ""}${Mt(s.total.value)}`;
        q += ` — rows ${Mt(G)} to ${Mt(G + X - 1)} of ${De}`;
      }
      return n.pagesNote ? `${q}
${n.pagesNote}` : q;
    }), ye = H(null), ze = v(() => ye.value ?? String($.value)), Ze = v(
      () => `calc(${Math.max(2, String(s.pageCount.value).length)}ch + 10px)`
    );
    function Je(q) {
      q.target.select();
    }
    function et(q) {
      const X = q.target, G = X.value.replace(/[^0-9]/g, "");
      X.value !== G && (X.value = G), ye.value = G;
    }
    function Ue(q) {
      const X = q.target, G = Number(ye.value);
      ye.value = null;
      const De = Number.isFinite(G) && G >= 1 ? Math.min(Math.trunc(G), Math.max(1, s.pageCount.value)) : $.value;
      X.value = String(De), De !== $.value && s.setPage(De);
    }
    function je(q) {
      const X = q.target;
      ye.value = null, X.value = String($.value), X.blur();
    }
    return (q, X) => (f(), m("div", {
      class: "dc-header",
      "data-dc-expanded": e.expanded ? "true" : "false"
    }, [
      C("div", {
        class: "dc-header__trigger",
        onClick: W
      }, [
        C("span", Ko, F(r.value.label), 1),
        k.value.length ? (f(), m("span", Ho, [
          X[5] || (X[5] = C("span", { class: "dc-header__sr" }, "Within", -1)),
          (f(!0), m(ne, null, me(k.value, (G) => (f(), m("span", {
            key: `scope:${G.id}`,
            class: "dc-within dc-mono dc-truncate",
            title: O(G)
          }, F(O(G)), 9, Wo))), 128))
        ])) : I("", !0),
        C("div", {
          ref_key: "termBar",
          ref: U,
          class: "dc-header__query dc-header__terms",
          "data-dc-more": ue.value,
          title: A(s).summary.value,
          onScroll: le
        }, [
          M.value ? (f(), Q(Cs, {
            key: 0,
            class: "dc-header__pick dc-header__scope-select",
            label: "Type",
            "model-value": A(s).query.value.entity ?? "",
            options: h.value,
            onOpen: A(l).refresh,
            onClose: A(l).cancel,
            "onUpdate:modelValue": P
          }, null, 8, ["model-value", "options", "onOpen", "onClose"])) : I("", !0),
          b.value ? (f(), Q(Cs, {
            key: 1,
            class: "dc-header__pick dc-header__view-select",
            label: "View",
            "model-value": y.value,
            options: g.value,
            "onUpdate:modelValue": w
          }, null, 8, ["model-value", "options"])) : I("", !0),
          (f(!0), m(ne, null, me(S.value, (G) => (f(), m(ne, {
            key: G.term.id
          }, [
            G.or ? (f(), m("span", jo, "or")) : I("", !0),
            C("button", {
              type: "button",
              class: dt(["dc-term dc-mono", { "dc-term--idle": G.idle }]),
              title: G.idle ? `Not applied to ${A(s).entity.value?.label} — remove ${O(G.term)}` : `Remove ${O(G.term)}`,
              "aria-label": `Remove ${O(G.term)}`,
              onClick: (De) => A(s).removeTerm(G.term)
            }, F(O(G.term)), 11, Go)
          ], 64))), 128)),
          ft(C("input", {
            ref_key: "searchBox",
            ref: R,
            "onUpdate:modelValue": X[0] || (X[0] = (G) => A(s).draft.value = G),
            class: "dc-header__search dc-mono",
            type: "text",
            autocomplete: "off",
            spellcheck: "false",
            placeholder: "Search…",
            "aria-label": "Search",
            onKeydown: [
              X[1] || (X[1] = nt(Fe(
                //@ts-ignore
                (...G) => A(s).commitDraft && A(s).commitDraft(...G),
                ["prevent"]
              ), ["enter"])),
              nt(Fe(T, ["prevent"]), ["esc"]),
              nt(K, ["backspace"])
            ]
          }, null, 40, Xo), [
            [bn, A(s).draft.value]
          ])
        ], 40, Uo),
        C("button", {
          type: "button",
          class: "dc-header__toggle",
          "aria-expanded": e.expanded,
          "aria-controls": e.panelId,
          onClick: X[2] || (X[2] = (G) => a("toggle"))
        }, [
          C("span", Qo, F(e.expanded ? "▲" : "▼"), 1),
          C("span", Zo, F(e.expanded ? "Hide query panel" : "Edit query"), 1)
        ], 8, Yo)
      ]),
      D.value ? (f(), m("nav", Jo, [
        C("button", {
          type: "button",
          class: "dc-header__step",
          "aria-label": "Previous page",
          disabled: $.value <= 1,
          onClick: X[3] || (X[3] = (G) => A(s).setPage($.value - 1))
        }, [...X[6] || (X[6] = [
          C("span", { "aria-hidden": "true" }, "‹", -1)
        ])], 8, ei),
        C("span", {
          class: "dc-header__page dc-mono",
          title: te.value
        }, [
          C("input", {
            class: "dc-header__page-box dc-mono",
            type: "text",
            inputmode: "numeric",
            autocomplete: "off",
            "aria-label": "Page",
            style: Ee({ width: Ze.value }),
            value: ze.value,
            onFocus: Je,
            onInput: et,
            onKeydown: [
              nt(Fe(Ue, ["prevent"]), ["enter"]),
              nt(Fe(je, ["prevent"]), ["esc"])
            ],
            onBlur: Ue
          }, null, 44, ni),
          C("span", ai, "/ " + F(ie.value), 1)
        ], 8, ti),
        C("span", si, F(te.value), 1),
        C("button", {
          type: "button",
          class: "dc-header__step",
          "aria-label": "Next page",
          disabled: $.value >= A(s).pageCount.value,
          onClick: X[4] || (X[4] = (G) => A(s).setPage($.value + 1))
        }, [...X[7] || (X[7] = [
          C("span", { "aria-hidden": "true" }, "›", -1)
        ])], 8, ri)
      ])) : I("", !0),
      q.$slots.actions ? (f(), m("div", li, [
        $e(q.$slots, "actions", {}, void 0, !0)
      ])) : I("", !0)
    ], 8, Vo));
  }
}), gr = /* @__PURE__ */ fe(ii, [["__scopeId", "data-v-d4f7546d"]]), ci = { class: "dc-facet" }, ui = ["id"], di = { class: "dc-facet__body" }, fi = ["aria-labelledby"], pi = ["aria-pressed", "data-dc-active", "onClick"], vi = ["aria-labelledby"], hi = ["aria-label", "placeholder", "onKeydown"], mi = ["aria-label", "placeholder", "onKeydown"], gi = ["aria-checked"], _i = { class: "dc-switch__text" }, yi = ["data-dc-active"], wi = /* @__PURE__ */ oe({
  __name: "FacetControl",
  props: {
    facet: {},
    value: {}
  },
  emits: ["update"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = v(
      () => n.value.kind === "chips" ? new Set(n.value.selected) : /* @__PURE__ */ new Set()
    );
    function r(h) {
      if (n.value.kind !== "chips") return;
      const k = s.value.has(h) ? n.value.selected.filter((g) => g !== h) : [...n.value.selected, h];
      a("update", { kind: "chips", selected: k });
    }
    const i = H(""), o = H("");
    we(
      () => n.value,
      (h) => {
        h.kind === "range" && (i.value = h.min === null ? "" : h.min, o.value = h.max === null ? "" : h.max);
      },
      { immediate: !0, deep: !0 }
    );
    function l(h) {
      if (typeof h == "number") return Number.isFinite(h) ? h : null;
      const k = h.trim();
      if (!k) return null;
      const g = Number(k);
      return Number.isFinite(g) ? g : null;
    }
    function c() {
      if (n.value.kind !== "range") return;
      const h = l(i.value), k = l(o.value);
      h === n.value.min && k === n.value.max || a("update", { kind: "range", min: h, max: k });
    }
    function d() {
      n.value.kind === "toggle" && a("update", { kind: "toggle", on: !n.value.on });
    }
    return (h, k) => (f(), m("div", ci, [
      C("span", {
        id: `dc-facet-${e.facet.key}`,
        class: "dc-facet__label"
      }, F(e.facet.label), 9, ui),
      C("div", di, [
        e.facet.kind === "chips" && e.value.kind === "chips" ? (f(), m("div", {
          key: 0,
          class: "dc-facet__chips",
          role: "group",
          "aria-labelledby": `dc-facet-${e.facet.key}`
        }, [
          (f(!0), m(ne, null, me(e.facet.options, (g) => (f(), m("button", {
            key: g,
            type: "button",
            class: "dc-chip",
            "aria-pressed": s.value.has(g),
            "data-dc-active": s.value.has(g) ? "true" : "false",
            onClick: (y) => r(g)
          }, F(g), 9, pi))), 128))
        ], 8, fi)) : e.facet.kind === "range" && e.value.kind === "range" ? (f(), m("div", {
          key: 1,
          class: "dc-facet__range",
          role: "group",
          "aria-labelledby": `dc-facet-${e.facet.key}`
        }, [
          ft(C("input", {
            "onUpdate:modelValue": k[0] || (k[0] = (g) => i.value = g),
            class: "dc-input dc-mono",
            type: "number",
            inputmode: "numeric",
            "aria-label": `${e.facet.label} minimum`,
            placeholder: String(e.facet.min),
            onChange: c,
            onBlur: c,
            onKeydown: nt(Fe(c, ["prevent"]), ["enter"])
          }, null, 40, hi), [
            [bn, i.value]
          ]),
          k[2] || (k[2] = C("span", {
            class: "dc-facet__dash",
            "aria-hidden": "true"
          }, "–", -1)),
          ft(C("input", {
            "onUpdate:modelValue": k[1] || (k[1] = (g) => o.value = g),
            class: "dc-input dc-mono",
            type: "number",
            inputmode: "numeric",
            "aria-label": `${e.facet.label} maximum`,
            placeholder: String(e.facet.max),
            onChange: c,
            onBlur: c,
            onKeydown: nt(Fe(c, ["prevent"]), ["enter"])
          }, null, 40, mi), [
            [bn, o.value]
          ])
        ], 8, vi)) : e.facet.kind === "toggle" && e.value.kind === "toggle" ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-switch",
          role: "switch",
          "aria-checked": e.value.on,
          onClick: d
        }, [
          C("span", _i, F(e.facet.text), 1),
          C("span", {
            class: "dc-switch__track",
            "data-dc-active": e.value.on ? "true" : "false",
            "aria-hidden": "true"
          }, [...k[3] || (k[3] = [
            C("span", { class: "dc-switch__knob" }, null, -1)
          ])], 8, yi)
        ], 8, gi)) : I("", !0)
      ])
    ]));
  }
}), _r = /* @__PURE__ */ fe(wi, [["__scopeId", "data-v-36d1334b"]]), ki = ["id"], bi = { class: "dc-panel__section dc-panel__rows" }, $i = { class: "dc-panel__row" }, xi = ["for"], Mi = ["title", "aria-label", "onClick"], Ci = ["id", "placeholder", "onKeydown"], Si = { class: "dc-panel__actions" }, Pi = ["disabled"], Ei = {
  key: 0,
  class: "dc-panel__section"
}, Ai = /* @__PURE__ */ oe({
  __name: "QueryPanel",
  props: {
    panelId: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = t, a = Jt(), s = be(), r = v(() => jl(s.query.value.expr)), i = v(() => r.value.parts.map(tn)), o = H(r.value.text), l = H(null);
    we(
      () => r.value.text,
      (b) => {
        o.value = b;
      }
    );
    const c = v(() => o.value !== r.value.text);
    function d() {
      if (c.value) {
        const b = Mn(o.value, s.entity.value);
        s.setExpression(bs(r.value.parts, b));
      }
      n("close");
    }
    function h(b) {
      const { parts: M, text: w } = r.value;
      s.setExpression(bs(M.filter((S, z) => z !== b), w));
    }
    function k(b) {
      const { parts: M } = r.value;
      o.value || !M.length || (b.preventDefault(), h(M.length - 1));
    }
    function g() {
      o.value = "", s.clearFilters();
    }
    function y(b, M) {
      s.setFacet(b, M);
    }
    return Nt(() => l.value?.focus()), (b, M) => (f(), m("div", {
      id: e.panelId,
      class: "dc-panel",
      role: "dialog",
      "aria-label": "Query",
      onKeydown: M[2] || (M[2] = nt(Fe((w) => n("close"), ["stop"]), ["esc"]))
    }, [
      C("section", bi, [
        C("div", $i, [
          C("label", {
            class: "dc-panel__field-label",
            for: `${e.panelId}-expr`
          }, "Expression", 8, xi),
          C("div", {
            class: "dc-field",
            onMousedown: M[1] || (M[1] = Fe((w) => l.value?.focus(), ["self", "prevent"]))
          }, [
            (f(!0), m(ne, null, me(i.value, (w, S) => (f(), m("button", {
              key: `${S}:${w}`,
              type: "button",
              class: "dc-part dc-mono",
              title: `Remove ${w}`,
              "aria-label": `Remove ${w}`,
              onClick: (z) => h(S)
            }, F(w), 9, Mi))), 128)),
            ft(C("input", {
              id: `${e.panelId}-expr`,
              ref_key: "expressionField",
              ref: l,
              "onUpdate:modelValue": M[0] || (M[0] = (w) => o.value = w),
              class: "dc-expression dc-mono",
              type: "text",
              autocomplete: "off",
              spellcheck: "false",
              placeholder: i.value.length ? "" : A(s).schema.value.placeholder,
              onKeydown: [
                nt(Fe(d, ["prevent"]), ["enter"]),
                nt(k, ["backspace"])
              ]
            }, null, 40, Ci), [
              [bn, o.value]
            ])
          ], 32)
        ]),
        A(s).entity.value ? (f(!0), m(ne, { key: 0 }, me(A(s).entity.value.facets, (w) => (f(), Q(_r, {
          key: w.key,
          facet: w,
          value: A(s).query.value.facets[w.key],
          onUpdate: (S) => y(w.key, S)
        }, null, 8, ["facet", "value", "onUpdate"]))), 128)) : I("", !0),
        C("div", Si, [
          C("button", {
            type: "button",
            class: "dc-button dc-button--primary",
            onClick: d
          }, " Run query "),
          C("button", {
            type: "button",
            class: "dc-button",
            disabled: A(s).isPristine.value && !c.value,
            onClick: g
          }, " Reset ", 8, Pi)
        ])
      ]),
      a["panel-section"] ? (f(), m("section", Ei, [
        $e(b.$slots, "panel-section", {}, void 0, !0)
      ])) : I("", !0)
    ], 40, ki));
  }
}), yr = /* @__PURE__ */ fe(Ai, [["__scopeId", "data-v-640ae2f5"]]), Ti = ["checked", "indeterminate"], wr = /* @__PURE__ */ oe({
  __name: "PageTick",
  setup(e) {
    const t = be(), n = v(() => t.rows.value.filter((r) => t.isSelected(r)).length), a = v(
      () => t.rows.value.length > 0 && n.value === t.rows.value.length
    ), s = v(() => n.value > 0 && !a.value);
    return (r, i) => (f(), m("input", {
      class: "dc-tick",
      type: "checkbox",
      checked: a.value,
      indeterminate: s.value,
      "aria-label": "Select every row on this page",
      title: "Select every row on this page",
      onChange: i[0] || (i[0] = (o) => A(t).selectPage(!a.value))
    }, null, 40, Ti));
  }
}), Ri = {
  key: 0,
  class: "dc-actions"
}, zi = {
  key: 0,
  class: "dc-actions__select"
}, Li = {
  key: 0,
  class: "dc-actions__all"
}, Ii = {
  class: "dc-actions__count",
  "aria-live": "polite"
}, Ni = {
  key: 1,
  class: "dc-actions__count dc-actions__all",
  "aria-live": "polite"
}, Fi = { class: "dc-actions__ops" }, Oi = ["disabled"], Di = ["data-dc-operation", "disabled", "onClick"], Bi = ["disabled"], qi = /* @__PURE__ */ oe({
  __name: "RecordActions",
  props: {
    views: {}
  },
  setup(e) {
    const t = e, n = be(), a = v(() => n.entity.value), s = v(() => !Ca(n.query.value, t.views)), r = v(() => s.value && n.selectable.value), i = v(
      () => Rn(n.query.value.view, t.views) === "table"
    ), o = v(
      () => s.value && (r.value || !!(a.value?.create || a.value?.duplicate || a.value?.delete || a.value?.operations?.length))
    ), l = v(() => n.selection.value.ids.length), c = v(() => l.value ? `${l.value} selected` : i.value ? "None selected" : "Select all");
    function d(h) {
      return l.value ? `${h} ${l.value}` : h;
    }
    return (h, k) => o.value ? (f(), m("div", Ri, [
      r.value ? (f(), m("div", zi, [
        i.value ? (f(), m("span", Ni, F(c.value), 1)) : (f(), m("label", Li, [
          ce(wr),
          C("span", Ii, F(c.value), 1)
        ])),
        l.value ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-actions__clear",
          onClick: k[0] || (k[0] = (g) => A(n).clearSelection())
        }, " Clear ")) : I("", !0)
      ])) : I("", !0),
      C("div", Fi, [
        a.value?.create ? (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-actions__op dc-actions__new",
          onClick: k[1] || (k[1] = (g) => A(n).create(a.value))
        }, [
          k[4] || (k[4] = C("span", {
            class: "dc-actions__plus",
            "aria-hidden": "true"
          }, "+", -1)),
          Oe(" " + F(a.value.create), 1)
        ])) : I("", !0),
        a.value?.duplicate ? (f(), m("button", {
          key: 1,
          type: "button",
          class: "dc-actions__op",
          disabled: !l.value,
          onClick: k[2] || (k[2] = (g) => A(n).duplicate())
        }, F(d(a.value.duplicate)), 9, Oi)) : I("", !0),
        (f(!0), m(ne, null, me(a.value?.operations ?? [], (g) => (f(), m("button", {
          key: g.key,
          type: "button",
          class: "dc-actions__op",
          "data-dc-operation": g.key,
          disabled: !l.value,
          onClick: (y) => A(n).operate(g.key)
        }, F(d(g.label)), 9, Di))), 128)),
        a.value?.delete ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-actions__op dc-actions__danger",
          disabled: !l.value,
          onClick: k[3] || (k[3] = (g) => A(n).delete())
        }, F(d(a.value.delete)), 9, Bi)) : I("", !0)
      ])
    ])) : I("", !0);
  }
}), kr = /* @__PURE__ */ fe(qi, [["__scopeId", "data-v-8548a5bf"]]), Vi = ["href"], Ki = /* @__PURE__ */ oe({
  __name: "PressLink",
  props: {
    href: {}
  },
  emits: ["press"],
  setup(e, { emit: t }) {
    const n = e, a = t;
    function s(r) {
      if (n.href && cr(r)) {
        r.stopPropagation();
        return;
      }
      r.preventDefault(), a("press", In(r), r);
    }
    return (r, i) => e.href ? (f(), m("a", {
      key: 0,
      href: e.href,
      class: "dc-press",
      onClick: s
    }, [
      $e(r.$slots, "default", {}, void 0, !0)
    ], 8, Vi)) : (f(), m("button", {
      key: 1,
      type: "button",
      class: "dc-press",
      onClick: s
    }, [
      $e(r.$slots, "default", {}, void 0, !0)
    ]));
  }
}), Ye = /* @__PURE__ */ fe(Ki, [["__scopeId", "data-v-a9383f64"]]);
function Hi(e, t) {
  if (!e) return null;
  const n = Ke(e, t);
  return typeof n == "string" && n.trim() ? n : null;
}
function Wi(e, t) {
  const n = Ge(t, "state"), a = Ge(t, "tint");
  return {
    identity: gn(Ge(t, "identity"), e),
    reference: gn(Ge(t, "reference"), e),
    metrics: Qs(t, "metric").map((s) => ({
      column: s,
      label: s.label ?? "",
      text: en(s, e)
    })),
    state: n ? Ke(n, e) ?? null : null,
    updated: gn(Ge(t, "updated"), e),
    image: Hi(Ge(t, "image"), e),
    tint: a ? Ke(a, e) ?? null : null
  };
}
function br(e, t, n, a, s = !1) {
  const r = n?.columns ?? [];
  return {
    row: e,
    key: zl(e, t),
    entityLabel: e.entityLabel,
    entity: n,
    columns: r,
    ordinal: Al(t),
    parts: Wi(e, r),
    pinned: a,
    selected: s
  };
}
function bt() {
  const e = be(), t = v(
    () => new Map(e.entities.value.map((n) => [n.key, n]))
  );
  return v(
    () => e.rows.value.map(
      (n, a) => br(
        n,
        e.offset.value + a,
        t.value.get(n.entityKey) ?? null,
        e.isPinned(n),
        e.isSelected(n)
      )
    )
  );
}
const Ui = ["data-dc-status"], ji = /* @__PURE__ */ oe({
  __name: "StatusPill",
  props: {
    status: {}
  },
  setup(e) {
    return (t, n) => (f(), m("span", {
      class: "dc-pill",
      "data-dc-status": e.status
    }, F(e.status), 9, Ui));
  }
}), nn = /* @__PURE__ */ fe(ji, [["__scopeId", "data-v-23e59fbf"]]), Gi = { key: 1 }, Xi = /* @__PURE__ */ oe({
  __name: "MetricDrill",
  props: {
    entry: {},
    column: {}
  },
  setup(e) {
    const t = e, n = be(), a = v(() => !t.entry.entity?.scope || !t.column.drill ? null : n.entities.value.find((c) => c.key === t.column.drill) ?? null), s = v(() => t.column.label ?? ""), r = v(() => en(t.column, t.entry.row)), i = v(() => a.value ? n.drillHref(t.entry.row, a.value) : null);
    function o(l, c) {
      c.stopPropagation(), a.value && n.drill(t.entry.row, a.value, l);
    }
    return (l, c) => a.value ? (f(), Q(Ye, {
      key: 0,
      class: "dc-drill",
      href: i.value,
      title: `${s.value} of ${e.entry.parts.identity} — show the ${a.value.label.toLowerCase()}`,
      onPress: o
    }, {
      default: xe(() => [
        $e(l.$slots, "default", {}, () => [
          Oe(F(r.value), 1)
        ], !0)
      ]),
      _: 3
    }, 8, ["href", "title"])) : (f(), m("span", Gi, [
      $e(l.$slots, "default", {}, () => [
        Oe(F(r.value), 1)
      ], !0)
    ]));
  }
}), an = /* @__PURE__ */ fe(Xi, [["__scopeId", "data-v-d3e7f4e0"]]), Yi = ["data-dc-active", "aria-pressed", "aria-label"], Qi = /* @__PURE__ */ oe({
  __name: "PinStar",
  props: {
    row: {},
    pinned: { type: Boolean },
    name: {}
  },
  setup(e) {
    const t = e, n = be();
    function a(s) {
      s.stopPropagation(), n.togglePin(t.row);
    }
    return (s, r) => (f(), m("button", {
      type: "button",
      class: "dc-star",
      "data-dc-active": e.pinned ? "true" : "false",
      "aria-pressed": e.pinned,
      "aria-label": e.pinned ? `Unpin ${e.name}` : `Pin ${e.name}`,
      onClick: a
    }, F(e.pinned ? "★" : "☆"), 9, Yi));
  }
}), qa = /* @__PURE__ */ fe(Qi, [["__scopeId", "data-v-ef63d763"]]), Zi = ["src"], Ji = /* @__PURE__ */ oe({
  __name: "RowPicture",
  props: {
    src: {}
  },
  setup(e) {
    const t = e, n = H(!1);
    return we(
      () => t.src,
      () => {
        n.value = !1;
      }
    ), (a, s) => e.src.trim() && !n.value ? (f(), m("img", {
      key: 0,
      class: "dc-picture",
      src: e.src,
      alt: "",
      loading: "lazy",
      decoding: "async",
      onError: s[0] || (s[0] = (r) => n.value = !0)
    }, null, 40, Zi)) : I("", !0);
  }
}), Nn = /* @__PURE__ */ fe(Ji, [["__scopeId", "data-v-afaab300"]]), ec = ["data-dc-standing", "title", "aria-label"], tc = /* @__PURE__ */ oe({
  __name: "QueryMark",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = be(), a = v(() => zn(t.entry.entity, t.entry.row)), s = v(() => Ta(n.query.value.expr, a.value)), r = v(
      () => s.value === "in" ? `The query narrows to ${t.entry.parts.identity} — press to lift that` : `The query leaves out ${t.entry.parts.identity} — press to lift that`
    );
    function i(o) {
      o.stopPropagation(), n.setExpression(ir(n.query.value.expr, a.value));
    }
    return (o, l) => s.value ? (f(), m("button", {
      key: 0,
      type: "button",
      class: "dc-standing",
      "data-dc-standing": s.value,
      title: r.value,
      "aria-label": r.value,
      onClick: i
    }, F(s.value === "in" ? "+" : "−"), 9, ec)) : I("", !0);
  }
}), Va = /* @__PURE__ */ fe(tc, [["__scopeId", "data-v-4b8d4166"]]), nc = ["aria-label"], ac = ["data-dc-standing", "data-dc-active", "aria-checked", "title", "aria-label", "onClick"], sc = /* @__PURE__ */ oe({
  __name: "StandingControl",
  props: {
    standing: {},
    mixed: { type: Boolean },
    name: {}
  },
  emits: ["set"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = v(() => [
      { standing: "in", sign: "+", hint: `Narrow the query to ${n.name}` },
      { standing: null, sign: "·", hint: `Let the query say nothing about ${n.name}` },
      { standing: "out", sign: "−", hint: `Leave ${n.name} out of the query` }
    ]), r = (o) => !n.mixed && n.standing === o;
    function i(o, l) {
      o.stopPropagation(), a("set", l);
    }
    return (o, l) => (f(), m("span", {
      class: "dc-standing-control",
      role: "radiogroup",
      "aria-label": `Where the query stands on ${e.name}`
    }, [
      (f(!0), m(ne, null, me(s.value, (c) => (f(), m("button", {
        key: c.sign,
        type: "button",
        role: "radio",
        class: "dc-standing-control__choice",
        "data-dc-standing": c.standing ?? "none",
        "data-dc-active": r(c.standing) ? "true" : "false",
        "aria-checked": r(c.standing),
        title: c.hint,
        "aria-label": c.hint,
        onClick: (d) => i(d, c.standing)
      }, F(c.sign), 9, ac))), 128))
    ], 8, nc));
  }
}), fa = /* @__PURE__ */ fe(sc, [["__scopeId", "data-v-adaa8412"]]), $r = /* @__PURE__ */ oe({
  __name: "RowStanding",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = be(), a = v(() => zn(t.entry.entity, t.entry.row)), s = v(() => Ta(n.query.value.expr, a.value));
    function r(i) {
      n.setExpression(ua(n.query.value.expr, a.value, i));
    }
    return (i, o) => a.value !== null ? (f(), Q(fa, {
      key: 0,
      class: "dc-row-standing",
      standing: s.value,
      name: e.entry.parts.identity,
      onSet: r
    }, null, 8, ["standing", "name"])) : I("", !0);
  }
}), rc = /* @__PURE__ */ oe({
  __name: "ScopeMark",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = be(), a = v(
      () => n.narrowsOnPress.value ? null : t.entry.entity?.scope ?? null
    ), s = H(null);
    function r(d) {
      s.value = In(d).exclude ? "out" : "in";
    }
    function i(d) {
      r(d), window.addEventListener("keydown", r), window.addEventListener("keyup", r);
    }
    function o() {
      s.value = null, window.removeEventListener("keydown", r), window.removeEventListener("keyup", r);
    }
    We(o);
    const l = v(() => a.value ? n.drillHref(t.entry.row, null) : null);
    function c(d, h) {
      h.stopPropagation(), n.drill(t.entry.row, null, d);
    }
    return (d, h) => a.value ? (f(), Q(Ye, {
      key: 0,
      class: "dc-scope",
      href: l.value,
      "data-dc-pending": s.value ?? void 0,
      title: `Narrow everything to ${a.value}: ${e.entry.row.id} — ⌥-click to leave it out`,
      "aria-label": `Narrow everything to ${e.entry.parts.identity}`,
      onPointerenter: i,
      onPointermove: r,
      onPointerleave: o,
      onPress: c
    }, {
      default: xe(() => [...h[0] || (h[0] = [
        Oe(" → ", -1)
      ])]),
      _: 1
    }, 8, ["href", "data-dc-pending", "title", "aria-label"])) : I("", !0);
  }
}), sn = /* @__PURE__ */ fe(rc, [["__scopeId", "data-v-05d2c233"]]), lc = ["checked", "aria-label"], $t = /* @__PURE__ */ oe({
  __name: "SelectTick",
  props: {
    row: {},
    selected: { type: Boolean },
    name: {}
  },
  setup(e) {
    const t = e, n = be();
    function a(s) {
      s.stopPropagation(), n.toggleSelect(t.row);
    }
    return (s, r) => (f(), m("input", {
      class: "dc-tick",
      type: "checkbox",
      checked: e.selected,
      "aria-label": `Select ${e.name}`,
      onClick: a
    }, null, 8, lc));
  }
}), oc = { class: "dc-card__top dc-mono" }, ic = { class: "dc-card__lead" }, cc = {
  key: 2,
  class: "dc-card__entity"
}, uc = { class: "dc-card__top-right" }, dc = { class: "dc-card__names" }, fc = { class: "dc-card__primary" }, pc = {
  key: 0,
  class: "dc-card__secondary dc-mono"
}, vc = {
  key: 0,
  class: "dc-card__metrics dc-mono"
}, hc = {
  key: 0,
  class: "dc-card__date"
}, mc = /* @__PURE__ */ oe({
  __name: "CardsView",
  setup(e) {
    const t = be(), n = bt(), a = v(() => t.isEverything.value), s = (i) => i.entity?.card === "picture", r = v(() => n.value.length > 0 && n.value.every(s));
    return (i, o) => (f(), m("div", {
      class: dt(["dc-cards", { "dc-cards--pictures": r.value }])
    }, [
      (f(!0), m(ne, null, me(A(n), (l) => (f(), m("div", {
        key: l.key,
        class: dt(["dc-card", { "dc-card--picture": s(l) }])
      }, [
        C("div", oc, [
          C("span", ic, [
            A(t).selectable.value ? (f(), Q($t, {
              key: 0,
              row: l.row,
              selected: l.selected,
              name: l.parts.identity
            }, null, 8, ["row", "selected", "name"])) : I("", !0),
            s(l) ? I("", !0) : (f(), m(ne, { key: 1 }, [
              Oe(F(l.ordinal), 1)
            ], 64)),
            a.value ? (f(), m("span", cc, F(l.entityLabel), 1)) : I("", !0)
          ]),
          C("span", uc, [
            l.parts.state && !s(l) ? (f(), Q(nn, {
              key: 0,
              status: l.parts.state
            }, null, 8, ["status"])) : I("", !0),
            s(l) ? (f(), Q(Va, {
              key: 1,
              entry: l
            }, null, 8, ["entry"])) : (f(), Q($r, {
              key: 2,
              entry: l
            }, null, 8, ["entry"])),
            ce(sn, { entry: l }, null, 8, ["entry"]),
            A(t).pinnable.value ? (f(), Q(qa, {
              key: 3,
              row: l.row,
              name: l.parts.identity,
              pinned: l.pinned
            }, null, 8, ["row", "name", "pinned"])) : I("", !0)
          ])
        ]),
        ce(Ye, {
          class: "dc-card__open",
          href: A(t).pressHref(l.row),
          onPress: (c) => A(t).activate(l.row, c)
        }, {
          default: xe(() => [
            l.parts.image ? (f(), Q(Nn, {
              key: 0,
              class: "dc-card__image",
              src: l.parts.image
            }, null, 8, ["src"])) : I("", !0),
            C("span", dc, [
              C("span", fc, F(l.parts.identity), 1),
              s(l) ? I("", !0) : (f(), m("span", pc, F(l.parts.reference), 1))
            ])
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        s(l) ? I("", !0) : (f(), m("div", vc, [
          (f(!0), m(ne, null, me(l.parts.metrics.slice(0, 2), (c) => (f(), Q(an, {
            key: c.column.key ?? c.label,
            entry: l,
            column: c.column
          }, {
            default: xe(() => [
              Oe(F(c.label) + " " + F(c.text), 1)
            ]),
            _: 2
          }, 1032, ["entry", "column"]))), 128)),
          l.parts.updated ? (f(), m("span", hc, F(l.parts.updated), 1)) : I("", !0)
        ]))
      ], 2))), 128))
    ], 2));
  }
}), xr = /* @__PURE__ */ fe(mc, [["__scopeId", "data-v-046f11c3"]]), gc = { class: "dc-grid" }, _c = { class: "dc-tile__scrim" }, yc = { class: "dc-tile__top dc-mono" }, wc = { class: "dc-tile__chip" }, kc = { class: "dc-tile__caption" }, bc = { class: "dc-tile__secondary dc-truncate" }, $c = { class: "dc-tile__primary" }, xc = /* @__PURE__ */ oe({
  __name: "GridView",
  setup(e) {
    const t = be(), n = bt();
    return (a, s) => (f(), m("div", gc, [
      (f(!0), m(ne, null, me(A(n), (r) => (f(), m("div", {
        key: r.key,
        class: "dc-grid__cell"
      }, [
        ce(Ye, {
          class: "dc-tile",
          style: Ee({ "--dc-tile-tint": r.parts.tint ?? void 0 }),
          href: A(t).pressHref(r.row),
          onPress: (i) => A(t).activate(r.row, i)
        }, {
          default: xe(() => [
            r.parts.image ? (f(), Q(Nn, {
              key: 0,
              class: "dc-tile__image",
              src: r.parts.image
            }, null, 8, ["src"])) : I("", !0),
            C("span", _c, [
              C("span", yc, [
                C("span", wc, F(r.ordinal), 1)
              ]),
              C("span", kc, [
                C("span", bc, F(r.parts.reference), 1),
                C("span", $c, F(r.parts.identity), 1)
              ])
            ])
          ]),
          _: 2
        }, 1032, ["style", "href", "onPress"]),
        A(t).selectable.value ? (f(), Q($t, {
          key: 0,
          class: "dc-grid__tick",
          row: r.row,
          selected: r.selected,
          name: r.parts.identity
        }, null, 8, ["row", "selected", "name"])) : I("", !0)
      ]))), 128))
    ]));
  }
}), Mr = /* @__PURE__ */ fe(xc, [["__scopeId", "data-v-12dd4d94"]]);
function Ss(e, t, n, a) {
  return (n - a * (t - 1)) / e;
}
function Xn(e, t) {
  return e > 0 ? Math.min(t, e) : t;
}
function Mc(e) {
  return e > 0 ? e : 1 / 0;
}
function Cc(e, t, n) {
  const { width: a, height: s, gap: r = 0 } = n;
  if (!e.length) return [];
  if (!(a > 0) || !(s > 0)) return [{ items: [...e], height: s, filled: !1 }];
  const i = [];
  let o = [], l = 0, c = 0;
  for (const d of e) {
    const h = t(d), k = Math.max(h.ratio, Number.EPSILON), g = h.height && h.height > 0 ? Math.max(c, h.height) : c, y = Xn(g, s), b = Ss(l + k, o.length + 1, a, r);
    if (b > y) {
      o.push(d), l += k, c = g;
      continue;
    }
    const M = Xn(c, s), w = o.length ? Ss(l, o.length, a, r) : 1 / 0;
    w <= Mc(c) && w - M < y - b ? (i.push({ items: o, height: w, filled: !0 }), o = [d], l = k, c = h.height && h.height > 0 ? h.height : 0) : (i.push({ items: [...o, d], height: b, filled: !0 }), o = [], l = 0, c = 0);
  }
  return o.length && i.push({ items: o, height: Xn(c, s), filled: !1 }), i;
}
const Sc = { class: "dc-images" }, Pc = {
  key: 1,
  class: "dc-images__blank",
  "aria-hidden": "true"
}, Ec = 240, fn = 8, Ac = 1, Tc = /* @__PURE__ */ oe({
  __name: "ImagesView",
  setup(e) {
    const t = be(), n = bt(), a = fs(/* @__PURE__ */ new Map()), s = fs(/* @__PURE__ */ new Set());
    function r(y, b) {
      const M = b.target;
      M.naturalWidth > 0 && M.naturalHeight > 0 && a.set(y, { width: M.naturalWidth, height: M.naturalHeight });
    }
    function i(y) {
      const b = y.parts.image;
      return b && !s.has(b) ? b : null;
    }
    function o(y) {
      const b = i(y);
      return b ? a.get(b) : void 0;
    }
    function l(y) {
      const b = o(y);
      return b ? { ratio: b.width / b.height, height: b.height } : { ratio: Ac };
    }
    const c = H(null), d = H(0);
    let h = null;
    function k() {
      d.value = c.value?.clientWidth ?? 0;
    }
    Bs(() => {
      k(), !(!c.value || typeof ResizeObserver > "u") && (h = new ResizeObserver(k), h.observe(c.value));
    }), We(() => {
      h?.disconnect(), h = null;
    });
    const g = v(() => {
      const y = Cc(n.value, l, {
        width: d.value,
        height: Ec,
        gap: fn
      }), b = [];
      let M = 0;
      for (const w of y) {
        let S = 0;
        for (const z of w.items) {
          const x = l(z).ratio * w.height, E = o(z), O = E !== void 0 && E.height < w.height;
          b.push({
            entry: z,
            style: {
              top: `${M}px`,
              left: `${S}px`,
              width: `${x}px`,
              height: `${w.height}px`
            },
            picture: O ? { width: `${E.width}px`, height: `${E.height}px` } : { width: "100%", height: "100%" }
          }), S += x + fn;
        }
        M += w.height + fn;
      }
      return { boxes: b, height: y.length ? M - fn : 0 };
    });
    return (y, b) => (f(), m("div", Sc, [
      C("div", {
        ref_key: "wall",
        ref: c,
        class: "dc-images__wall",
        style: Ee({ height: `${g.value.height}px` })
      }, [
        (f(!0), m(ne, null, me(g.value.boxes, ({ entry: M, style: w, picture: S }) => (f(), m("div", {
          key: M.key,
          class: "dc-images__cell",
          style: Ee(w)
        }, [
          ce(Ye, {
            class: "dc-images__open",
            title: M.parts.identity,
            "aria-label": M.parts.identity,
            href: A(t).pressHref(M.row),
            onPress: (z) => A(t).activate(M.row, z)
          }, {
            default: xe(() => [
              i(M) ? (f(), Q(Nn, {
                key: 0,
                class: "dc-images__picture",
                style: Ee(S),
                src: i(M),
                onLoad: (z) => r(i(M), z),
                onError: (z) => s.add(i(M))
              }, null, 8, ["style", "src", "onLoad", "onError"])) : (f(), m("span", Pc, F(M.parts.identity), 1))
            ]),
            _: 2
          }, 1032, ["title", "aria-label", "href", "onPress"]),
          A(t).selectable.value ? (f(), Q($t, {
            key: 0,
            class: "dc-images__tick",
            row: M.row,
            selected: M.selected,
            name: M.parts.identity
          }, null, 8, ["row", "selected", "name"])) : I("", !0)
        ], 4))), 128))
      ], 4)
    ]));
  }
}), Cr = /* @__PURE__ */ fe(Tc, [["__scopeId", "data-v-d77205b8"]]), Rc = { class: "dc-links" }, zc = { class: "dc-link__primary dc-truncate" }, Lc = { class: "dc-link__secondary dc-mono dc-truncate" }, Ic = /* @__PURE__ */ oe({
  __name: "LinksView",
  setup(e) {
    const t = be(), n = bt();
    return (a, s) => (f(), m("div", Rc, [
      (f(!0), m(ne, null, me(A(n), (r) => (f(), m("span", {
        key: r.key,
        class: "dc-links__item"
      }, [
        A(t).selectable.value ? (f(), Q($t, {
          key: 0,
          row: r.row,
          selected: r.selected,
          name: r.parts.identity
        }, null, 8, ["row", "selected", "name"])) : I("", !0),
        ce(Ye, {
          class: "dc-link",
          href: A(t).pressHref(r.row),
          onPress: (i) => A(t).activate(r.row, i)
        }, {
          default: xe(() => [
            C("span", zc, F(r.parts.identity), 1),
            C("span", Lc, F(r.parts.reference), 1)
          ]),
          _: 2
        }, 1032, ["href", "onPress"])
      ]))), 128))
    ]));
  }
}), Sr = /* @__PURE__ */ fe(Ic, [["__scopeId", "data-v-f47b75cf"]]), Nc = {
  class: "dc-list",
  role: "list"
}, Fc = { class: "dc-list__ordinal dc-mono" }, Oc = { class: "dc-list__identity" }, Dc = { class: "dc-list__primary dc-truncate" }, Bc = { class: "dc-list__secondary dc-mono dc-truncate" }, qc = {
  key: 1,
  class: "dc-list__entity dc-mono"
}, Vc = { class: "dc-list__metrics dc-mono" }, Kc = { class: "dc-list__trailing" }, Hc = /* @__PURE__ */ oe({
  __name: "ListView",
  setup(e) {
    const t = be(), n = bt(), a = v(() => t.isEverything.value);
    return (s, r) => (f(), m("div", Nc, [
      (f(!0), m(ne, null, me(A(n), (i) => (f(), m("div", {
        key: i.key,
        class: "dc-list__row",
        role: "listitem"
      }, [
        A(t).selectable.value ? (f(), Q($t, {
          key: 0,
          class: "dc-list__tick",
          row: i.row,
          selected: i.selected,
          name: i.parts.identity
        }, null, 8, ["row", "selected", "name"])) : I("", !0),
        ce($r, {
          class: "dc-list__standing",
          entry: i
        }, null, 8, ["entry"]),
        ce(Ye, {
          class: "dc-list__open",
          href: A(t).pressHref(i.row),
          onPress: (o) => A(t).activate(i.row, o)
        }, {
          default: xe(() => [
            C("span", Fc, F(i.ordinal), 1),
            C("span", Oc, [
              C("span", Dc, F(i.parts.identity), 1),
              C("span", Bc, F(i.parts.reference), 1)
            ])
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        a.value ? (f(), m("span", qc, F(i.entityLabel), 1)) : I("", !0),
        C("span", Vc, [
          (f(!0), m(ne, null, me(i.parts.metrics.slice(0, 2), (o) => (f(), Q(an, {
            key: o.column.key ?? o.label,
            entry: i,
            column: o.column
          }, null, 8, ["entry", "column"]))), 128))
        ]),
        C("span", Kc, [
          i.parts.state ? (f(), Q(nn, {
            key: 0,
            status: i.parts.state
          }, null, 8, ["status"])) : I("", !0),
          ce(sn, { entry: i }, null, 8, ["entry"]),
          A(t).pinnable.value ? (f(), Q(qa, {
            key: 1,
            row: i.row,
            name: i.parts.identity,
            pinned: i.pinned
          }, null, 8, ["row", "name", "pinned"])) : I("", !0)
        ])
      ]))), 128))
    ]));
  }
}), pa = /* @__PURE__ */ fe(Hc, [["__scopeId", "data-v-9b2e8a87"]]), Wc = { class: "dc-preview" }, Uc = { class: "dc-preview__pager dc-mono" }, jc = ["disabled"], Gc = { "aria-live": "polite" }, Xc = ["disabled"], Yc = {
  key: 0,
  class: "dc-preview__card"
}, Qc = ["src"], Zc = { class: "dc-preview__body" }, Jc = { class: "dc-preview__top" }, eu = { class: "dc-preview__badges" }, tu = { class: "dc-preview__entity dc-mono" }, nu = { class: "dc-preview__marks" }, au = { class: "dc-preview__primary" }, su = { class: "dc-preview__secondary dc-mono" }, ru = { class: "dc-preview__fields" }, lu = { class: "dc-preview__key" }, ou = { class: "dc-preview__value dc-mono" }, iu = /* @__PURE__ */ oe({
  __name: "PreviewView",
  setup(e) {
    const t = be(), n = bt(), a = H(0);
    we(n, (l) => {
      a.value > l.length - 1 && (a.value = Math.max(0, l.length - 1));
    });
    const s = v(() => n.value[a.value]), r = v(() => {
      const l = s.value;
      if (!l) return [];
      const c = Ge(l.columns, "reference"), d = Ge(l.columns, "updated");
      return [
        ...c ? [{ key: c.label ?? "Reference", value: l.parts.reference, column: null }] : [],
        ...l.parts.metrics.map((h) => ({
          key: h.label,
          value: h.text,
          column: h.column
        })),
        ...d ? [{ key: d.label ?? "Updated", value: l.parts.updated, column: null }] : []
      ];
    }), i = v(() => {
      if (!n.value.length) return "0 / 0";
      const l = t.total.value > n.value.length ? ` of ${t.total.value}` : "";
      return `${a.value + 1} / ${n.value.length}${l}`;
    }), o = (l) => {
      const c = n.value.length;
      c && (a.value = Math.min(c - 1, Math.max(0, a.value + l)));
    };
    return (l, c) => (f(), m("div", Wc, [
      C("div", Uc, [
        C("button", {
          type: "button",
          class: "dc-preview__step",
          "aria-label": "Previous result",
          disabled: a.value === 0,
          onClick: c[0] || (c[0] = (d) => o(-1))
        }, " ‹ ", 8, jc),
        C("span", Gc, F(i.value), 1),
        C("button", {
          type: "button",
          class: "dc-preview__step",
          "aria-label": "Next result",
          disabled: a.value >= A(n).length - 1,
          onClick: c[1] || (c[1] = (d) => o(1))
        }, " › ", 8, Xc)
      ]),
      s.value ? (f(), m("div", Yc, [
        C("div", {
          class: "dc-preview__media",
          style: Ee({ background: s.value.parts.tint ?? void 0 }),
          "aria-hidden": "true"
        }, [
          s.value.parts.image ? (f(), m("img", {
            key: 0,
            class: "dc-preview__image",
            src: s.value.parts.image,
            alt: ""
          }, null, 8, Qc)) : (f(), m(ne, { key: 1 }, [
            Oe(" preview ")
          ], 64))
        ], 4),
        C("div", Zc, [
          C("div", Jc, [
            C("span", eu, [
              A(t).selectable.value ? (f(), Q($t, {
                key: 0,
                row: s.value.row,
                selected: s.value.selected,
                name: s.value.parts.identity
              }, null, 8, ["row", "selected", "name"])) : I("", !0),
              s.value.parts.state ? (f(), Q(nn, {
                key: 1,
                status: s.value.parts.state
              }, null, 8, ["status"])) : I("", !0),
              C("span", tu, F(s.value.entityLabel), 1)
            ]),
            C("span", nu, [
              ce(Va, { entry: s.value }, null, 8, ["entry"]),
              ce(sn, { entry: s.value }, null, 8, ["entry"]),
              A(t).pinnable.value ? (f(), Q(qa, {
                key: 0,
                row: s.value.row,
                name: s.value.parts.identity,
                pinned: s.value.pinned
              }, null, 8, ["row", "name", "pinned"])) : I("", !0)
            ])
          ]),
          C("div", null, [
            C("div", au, F(s.value.parts.identity), 1),
            C("div", su, F(s.value.parts.reference), 1)
          ]),
          C("dl", ru, [
            (f(!0), m(ne, null, me(r.value, (d) => (f(), m("div", {
              key: d.key,
              class: "dc-preview__field"
            }, [
              C("dt", lu, F(d.key), 1),
              C("dd", ou, [
                d.column && s.value ? (f(), Q(an, {
                  key: 0,
                  entry: s.value,
                  column: d.column
                }, null, 8, ["entry", "column"])) : (f(), m(ne, { key: 1 }, [
                  Oe(F(d.value), 1)
                ], 64))
              ])
            ]))), 128))
          ]),
          ce(Ye, {
            class: "dc-preview__open",
            href: s.value ? A(t).pressHref(s.value.row) : null,
            onPress: c[2] || (c[2] = (d) => s.value && A(t).activate(s.value.row, d))
          }, {
            default: xe(() => [...c[3] || (c[3] = [
              Oe(" Open record → ", -1)
            ])]),
            _: 1
          }, 8, ["href"])
        ])
      ])) : I("", !0)
    ]));
  }
}), Pr = /* @__PURE__ */ fe(iu, [["__scopeId", "data-v-1bc19613"]]);
function cu() {
  const e = be();
  return v(() => Tl(e.schema.value, e.entity.value));
}
const uu = {
  key: 5,
  class: "dc-cell__text"
}, du = /* @__PURE__ */ oe({
  __name: "ColumnCell",
  props: {
    column: {},
    entry: {}
  },
  setup(e) {
    const t = e, n = be(), a = v(() => t.column.kind ?? "text"), s = v(() => Ke(t.column, t.entry.row)), r = v(
      () => a.value === "ordinal" ? t.entry.ordinal : en(t.column, t.entry.row)
    ), i = v(() => s.value), o = v(() => t.column.activate === !0 || !!t.column.click), l = v(() => oa(t.column)), c = v(() => Zs(t.column, t.entry.row));
    function d(g) {
      o.value && (g.stopPropagation(), h(In(g)));
    }
    function h(g) {
      t.column.click?.(t.entry.row, g), t.column.activate && n.activate(t.entry.row, g);
    }
    const k = v(
      () => t.column.activate && !t.column.click ? n.pressHref(t.entry.row) : null
    );
    return (g, y) => a.value === "component" && e.column.component ? (f(), Q($a(e.column.component), {
      key: 0,
      row: e.entry.row,
      entry: e.entry,
      value: s.value,
      column: e.column
    }, null, 8, ["row", "entry", "value", "column"])) : a.value === "status" ? (f(), Q(nn, {
      key: 1,
      status: i.value
    }, null, 8, ["status"])) : a.value === "image" ? (f(), Q(Nn, {
      key: 2,
      class: "dc-cell__image",
      src: typeof s.value == "string" ? s.value : "",
      style: Ee({ maxHeight: e.column.height }),
      onClick: d
    }, null, 8, ["src", "style"])) : e.column.drill ? (f(), Q(an, {
      key: 3,
      entry: e.entry,
      column: e.column
    }, null, 8, ["entry", "column"])) : o.value ? (f(), Q(Ye, {
      key: 4,
      class: dt(["dc-table__open", { "dc-truncate": l.value }]),
      href: k.value,
      title: c.value,
      onPress: y[0] || (y[0] = (b, M) => {
        M.stopPropagation(), h(b);
      })
    }, {
      default: xe(() => [
        Oe(F(r.value), 1)
      ]),
      _: 1
    }, 8, ["class", "href", "title"])) : (f(), m("span", uu, F(r.value), 1));
  }
}), Ps = /* @__PURE__ */ fe(du, [["__scopeId", "data-v-af24c370"]]), fu = {
  key: 0,
  class: "dc-table__none"
}, pu = { class: "dc-table__detail" }, vu = ["data-dc-wrap"], hu = {
  key: 0,
  class: "dc-table__pick",
  scope: "col"
}, mu = {
  key: 1,
  class: "dc-table__standing",
  scope: "col"
}, gu = ["data-dc-align", "data-dc-hide", "aria-sort", "title"], _u = ["onClick"], yu = {
  key: 2,
  class: "dc-table__head"
}, wu = ["onClick"], ku = {
  key: 0,
  class: "dc-table__pick"
}, bu = {
  key: 1,
  class: "dc-table__standing"
}, $u = ["data-dc-align", "data-dc-hide", "title"], xu = {
  key: 0,
  class: "dc-table__name"
}, Mu = /* @__PURE__ */ oe({
  __name: "TableView",
  setup(e) {
    const t = be(), n = bt(), a = cu();
    function s(T, K) {
      const W = t.pressHref(T);
      if (W && cr(K)) {
        const U = K.shiftKey ? `noopener,popup,width=${window.outerWidth},height=${window.outerHeight}` : "noopener";
        window.open(W, "_blank", U);
        return;
      }
      t.activate(T, In(K));
    }
    function r(T) {
      const K = ql(T, t.entity.value), W = K ? `Shortcut: ${K}` : void 0;
      return [T.hint, W].filter(Boolean).join(`
`) || void 0;
    }
    const i = v(
      () => a.value.find((T) => T.scope)
    ), o = v(
      () => t.entity.value ? !!t.entity.value.scope : t.entities.value.some((T) => T.scope)
    ), l = (T) => zn(T.entity, T.row), c = (T) => Ta(t.query.value.expr, l(T));
    function d(T, K) {
      t.setExpression(ua(t.query.value.expr, l(T), K));
    }
    const h = v(() => {
      const T = n.value.filter((W) => l(W) !== null), K = T.filter((W) => W.selected);
      return K.length ? K : T;
    }), k = v(() => h.value.some((T) => T.selected)), g = v(() => {
      const T = h.value[0];
      return T ? c(T) : null;
    }), y = v(
      () => h.value.some((T) => c(T) !== g.value)
    ), b = v(
      () => k.value ? "the ticked rows" : "every row on this page"
    );
    function M(T) {
      t.setExpression(
        h.value.reduce(
          (K, W) => ua(K, l(W), T),
          t.query.value.expr
        )
      );
    }
    const w = v(
      () => a.value.some((T) => T.kind === "image" || T.height !== void 0)
    );
    function S(T) {
      T && (t.query.value.sort === T ? t.toggleDirection() : t.setSort(T));
    }
    const z = v(() => t.entity.value?.label ?? "The result set"), x = v(() => new Set(t.sorts.value.map((T) => T.key))), E = (T) => T.sort !== void 0 && x.value.has(T.sort), O = (T) => {
      if (E(T))
        return t.query.value.sort !== T.sort ? "none" : t.query.value.dir === "desc" ? "descending" : "ascending";
    };
    function P(T) {
      return [
        ms(T),
        T.muted ? "dc-table__muted" : "",
        T.mono ? "dc-mono" : "",
        oa(T) ? "dc-truncate" : ""
      ].filter(Boolean).join(" ");
    }
    function R(T, K) {
      if (!(!oa(T) || T.activate || T.click))
        return Zs(T, K.row);
    }
    return (T, K) => A(a).length ? (f(), m("table", {
      key: 1,
      class: "dc-table",
      "data-dc-wrap": w.value ? "" : void 0
    }, [
      C("thead", null, [
        C("tr", null, [
          A(t).selectable.value ? (f(), m("th", hu, [
            ce(wr)
          ])) : I("", !0),
          o.value ? (f(), m("th", mu, [
            h.value.length ? (f(), Q(fa, {
              key: 0,
              standing: g.value,
              mixed: y.value,
              name: b.value,
              onSet: M
            }, null, 8, ["standing", "mixed", "name"])) : I("", !0)
          ])) : I("", !0),
          (f(!0), m(ne, null, me(A(a), (W, U) => (f(), m("th", {
            key: A(vs)(W, U),
            scope: "col",
            class: dt(A(ms)(W)),
            style: Ee({ width: W.width }),
            "data-dc-align": A(hs)(W),
            "data-dc-hide": W.hideBelow,
            "aria-sort": O(W),
            title: r(W)
          }, [
            E(W) ? (f(), m("button", {
              key: 0,
              type: "button",
              class: "dc-table__sort",
              onClick: (ue) => S(W.sort)
            }, F(W.label), 9, _u)) : (f(), m(ne, { key: 1 }, [
              Oe(F(W.label), 1)
            ], 64)),
            W.header ? (f(), m("span", yu, [
              (f(), Q($a(W.header), {
                column: W,
                entity: A(t).entity.value
              }, null, 8, ["column", "entity"]))
            ])) : I("", !0)
          ], 14, gu))), 128))
        ])
      ]),
      C("tbody", null, [
        (f(!0), m(ne, null, me(A(n), (W) => (f(), m("tr", {
          key: W.key,
          class: "dc-table__row",
          onClick: (U) => s(W.row, U)
        }, [
          A(t).selectable.value ? (f(), m("td", ku, [
            ce($t, {
              row: W.row,
              selected: W.selected,
              name: W.parts.identity
            }, null, 8, ["row", "selected", "name"])
          ])) : I("", !0),
          o.value ? (f(), m("td", bu, [
            l(W) !== null ? (f(), Q(fa, {
              key: 0,
              standing: c(W),
              name: W.parts.identity,
              onSet: (U) => d(W, U)
            }, null, 8, ["standing", "name", "onSet"])) : I("", !0)
          ])) : I("", !0),
          (f(!0), m(ne, null, me(A(a), (U, ue) => (f(), m("td", {
            key: A(vs)(U, ue),
            class: dt(P(U)),
            "data-dc-align": A(hs)(U),
            "data-dc-hide": U.hideBelow,
            title: R(U, W)
          }, [
            U === i.value ? (f(), m("span", xu, [
              ce(Ps, {
                column: U,
                entry: W
              }, null, 8, ["column", "entry"]),
              ce(sn, { entry: W }, null, 8, ["entry"])
            ])) : (f(), Q(Ps, {
              key: 1,
              column: U,
              entry: W
            }, null, 8, ["column", "entry"]))
          ], 10, $u))), 128))
        ], 8, wu))), 128))
      ])
    ], 8, vu)) : (f(), m("p", fu, [
      K[2] || (K[2] = C("span", { class: "dc-table__headline" }, "No columns declared", -1)),
      C("span", pu, [
        Oe(F(z.value) + " has no ", 1),
        K[0] || (K[0] = C("code", null, "columns", -1)),
        K[1] || (K[1] = Oe(" in the schema, so there is no table to draw. ", -1))
      ])
    ]));
  }
}), Er = /* @__PURE__ */ fe(Mu, [["__scopeId", "data-v-a4e80859"]]);
function Cu(e) {
  const t = wt([]), n = H(!1), a = wt(null);
  let s = 0;
  const r = (l, c, d, h, k) => ({
    entity: l,
    rows: e.limit.value > 0 ? c.rows.map((g, y) => br(g, y, l, e.isPinned(g.id))) : [],
    total: c.total,
    count: d ? l.count : String(c.total),
    pinned: Su(h, c, k)
  }), i = () => {
    const l = ++s, c = e.query.value, d = e.schema.value, h = e.entities.value, k = e.limit.value, g = e.within?.value.trim() ?? "", y = Ma(c) && !g, b = g ? Ea(g, c.expr) : c.expr, M = h.map((w) => ({
      entity: w,
      // Scope the query to this entity, keeping the expression and ordering
      // but dropping facets, which belong to whichever entity is selected.
      outcome: e.source.value.query({
        // Each card is the top few of its type, wherever the shell's own
        // result set has been paged to — so this asks for the first page.
        query: { ...c, entity: w.key, expr: b, facets: Ft(w), page: 1 },
        schema: d,
        entity: w,
        /*
         * One row where none are shown, not none: to a source a limit of 0 is
         * no limit, which would fetch every record of every type to draw a
         * count. The one row is still read — it is what says whether the type
         * holds nothing but the record the query named.
         */
        limit: Math.max(k, 1),
        offset: 0
      })
    }));
    if (M.every(({ outcome: w }) => !(w instanceof Promise))) {
      t.value = M.map(
        ({ entity: w, outcome: S }) => r(w, S, y, d, b)
      ), a.value = null, n.value = !1;
      return;
    }
    n.value = !0, Promise.all(M.map(({ outcome: w }) => Promise.resolve(w))).then((w) => {
      l === s && (t.value = w.map(
        (S, z) => r(M[z].entity, S, y, d, b)
      ), a.value = null);
    }).catch((w) => {
      l === s && (a.value = w, t.value = []);
    }).finally(() => {
      l === s && (n.value = !1);
    });
  }, o = () => {
    try {
      i();
    } catch (l) {
      a.value = l, t.value = [], n.value = !1;
    }
  };
  return we(
    [
      e.source,
      e.schema,
      e.query,
      e.entities,
      e.limit,
      () => e.within?.value
    ],
    o,
    { immediate: !0 }
  ), { previews: t, pending: n, error: a, refresh: o };
}
function Su(e, t, n) {
  const a = t.rows[0];
  if (t.total !== 1 || t.rows.length !== 1 || !a)
    return !1;
  const s = n.trim();
  if (!s)
    return !1;
  const r = Wt(e, a);
  return !!r && Aa(s, r) === s;
}
const Pu = ["data-dc-pending", "data-dc-heads-only"], Eu = {
  key: 0,
  class: "dc-types__state",
  role: "alert"
}, Au = {
  key: 1,
  class: "dc-types__state",
  "aria-live": "polite"
}, Tu = {
  key: 2,
  class: "dc-types__state"
}, Ru = ["data-dc-empty"], zu = { class: "dc-type__name" }, Lu = { class: "dc-type__count dc-mono" }, Iu = { class: "dc-type__sr" }, Nu = {
  key: 0,
  class: "dc-type__description"
}, Fu = {
  key: 0,
  class: "dc-type__empty"
}, Ou = { class: "dc-type__identity" }, Du = { class: "dc-type__primary dc-truncate" }, Bu = { class: "dc-type__secondary dc-mono dc-truncate" }, qu = { class: "dc-type__trailing dc-mono" }, Vu = { class: "dc-type__metric-value" }, Ku = { class: "dc-type__metric-label" }, Hu = {
  key: 0,
  class: "dc-type__date"
}, Wu = ["onClick"], Uu = /* @__PURE__ */ oe({
  __name: "TypeCardsView",
  setup(e) {
    const t = be(), { previews: n, pending: a, error: s } = Cu({
      source: t.source,
      schema: t.schema,
      // The query as the results are read under it, so a word being typed in the
      // header narrows the cards as it narrows any list — see `liveQuery`.
      query: t.liveQuery,
      entities: t.entities,
      limit: t.previewsPerType,
      within: t.within,
      isPinned: (l) => t.isPinnedId(l)
    }), r = v(
      () => !t.isPristine.value || !!t.within.value || t.drafting.value
    ), i = v(() => t.previewsPerType.value <= 0), o = v(
      () => n.value.filter(
        (l) => !l.pinned && (l.total > 0 || !i.value && l.entity.create)
      )
    );
    return (l, c) => (f(), m("div", {
      class: "dc-types",
      "data-dc-pending": A(a) ? "true" : "false",
      "data-dc-heads-only": i.value ? "true" : "false"
    }, [
      $e(l.$slots, "before", {}, void 0, !0),
      A(s) ? (f(), m("p", Eu, " Could not load results: " + F(A(s) instanceof Error ? A(s).message : "the data source failed."), 1)) : !o.value.length && A(a) ? (f(), m("p", Au, " Running query… ")) : o.value.length ? I("", !0) : (f(), m("p", Tu, F(r.value ? "Nothing matches this query" : "Nothing here yet"), 1)),
      (f(!0), m(ne, null, me(o.value, (d) => (f(), m("section", {
        key: d.entity.key,
        class: "dc-type",
        "data-dc-empty": d.total ? "false" : "true"
      }, [
        ce(Ye, {
          class: "dc-type__head",
          href: A(t).entityHref(d.entity.key),
          onPress: (h) => A(t).setEntity(d.entity.key)
        }, {
          default: xe(() => [
            C("span", zu, F(d.entity.label), 1),
            C("span", Lu, F(d.count), 1),
            c[0] || (c[0] = C("span", {
              class: "dc-type__go",
              "aria-hidden": "true"
            }, "→", -1)),
            C("span", Iu, "Show only " + F(d.entity.label.toLowerCase()), 1),
            d.entity.description ? (f(), m("span", Nu, F(d.entity.description), 1)) : I("", !0)
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        d.total ? I("", !0) : (f(), m("p", Fu, F(r.value ? "No matches" : "Nothing here yet"), 1)),
        (f(!0), m(ne, null, me(d.rows, (h) => (f(), m("div", {
          key: h.key,
          class: "dc-type__row"
        }, [
          ce(Ye, {
            class: "dc-type__open",
            href: A(t).pressHref(h.row),
            onPress: (k) => A(t).activate(h.row, k)
          }, {
            default: xe(() => [
              C("span", Ou, [
                C("span", Du, F(h.parts.identity), 1),
                C("span", Bu, F(h.parts.reference), 1)
              ])
            ]),
            _: 2
          }, 1032, ["href", "onPress"]),
          C("span", qu, [
            (f(!0), m(ne, null, me(h.parts.metrics.slice(0, 1), (k) => (f(), Q(an, {
              key: k.column.key ?? k.label,
              class: "dc-type__metric",
              entry: h,
              column: k.column
            }, {
              default: xe(() => [
                C("span", Vu, F(k.text), 1),
                C("span", Ku, F(k.label), 1)
              ]),
              _: 2
            }, 1032, ["entry", "column"]))), 128)),
            h.parts.updated ? (f(), m("span", Hu, F(h.parts.updated), 1)) : I("", !0),
            ce(Va, { entry: h }, null, 8, ["entry"]),
            ce(sn, { entry: h }, null, 8, ["entry"])
          ])
        ]))), 128)),
        d.entity.create && !i.value ? (f(), m("button", {
          key: 1,
          type: "button",
          class: "dc-type__new",
          onClick: (h) => A(t).create(d.entity)
        }, [
          c[1] || (c[1] = C("span", {
            class: "dc-type__plus",
            "aria-hidden": "true"
          }, "+", -1)),
          Oe(" " + F(d.entity.create), 1)
        ], 8, Wu)) : I("", !0)
      ], 8, Ru))), 128)),
      $e(l.$slots, "after", {}, void 0, !0)
    ], 8, Pu));
  }
}), Ar = /* @__PURE__ */ fe(Uu, [["__scopeId", "data-v-4b62e4f9"]]), ju = ["data-dc-pending"], Gu = {
  key: 1,
  class: "dc-results__state",
  role: "alert"
}, Xu = { class: "dc-results__detail" }, Yu = {
  key: 2,
  class: "dc-results__state",
  "aria-live": "polite"
}, Qu = {
  key: 3,
  class: "dc-results__state"
}, Zu = { class: "dc-results__detail" }, Ju = /* @__PURE__ */ oe({
  __name: "ResultsArea",
  props: {
    views: {}
  },
  setup(e) {
    const t = e, n = be(), a = Jt(), s = {
      list: pa,
      cards: xr,
      grid: Mr,
      images: Cr,
      table: Er,
      links: Sr,
      preview: Pr
    }, r = v(() => Ca(n.query.value, t.views)), i = v(() => Rn(n.query.value.view, t.views)), o = v(() => s[i.value] ?? pa), l = v(() => n.rows.value.length > 0), c = v(() => n.error.value !== null), d = H(null);
    return we(
      // The page on screen, which is the draft's own while one is being typed.
      () => n.liveQuery.value.page,
      () => {
        d.value && (d.value.scrollTop = 0);
      }
    ), (h, k) => (f(), m("div", {
      ref_key: "scroller",
      ref: d,
      class: "dc-results",
      "data-dc-pending": A(n).pending.value ? "true" : "false"
    }, [
      r.value ? (f(), Q(Ar, { key: 0 }, hn({ _: 2 }, [
        a["cards-before"] ? {
          name: "before",
          fn: xe(() => [
            $e(h.$slots, "cards-before", {}, void 0, !0)
          ]),
          key: "0"
        } : void 0,
        a["cards-after"] ? {
          name: "after",
          fn: xe(() => [
            $e(h.$slots, "cards-after", {}, void 0, !0)
          ]),
          key: "1"
        } : void 0
      ]), 1024)) : c.value ? (f(), m("p", Gu, [
        k[1] || (k[1] = C("span", { class: "dc-results__headline" }, "Could not load results", -1)),
        C("span", Xu, F(A(n).error.value instanceof Error ? A(n).error.value.message : "The data source failed."), 1)
      ])) : !l.value && A(n).pending.value ? (f(), m("p", Yu, [...k[2] || (k[2] = [
        C("span", { class: "dc-results__detail" }, "Running query…", -1)
      ])])) : l.value ? (f(), Q($a(o.value), { key: 4 })) : (f(), m("div", Qu, [
        k[3] || (k[3] = C("span", { class: "dc-results__headline" }, "Nothing matches this query", -1)),
        C("span", Zu, F(A(n).summary.value), 1),
        A(n).isPristine.value ? I("", !0) : (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-results__clear",
          onClick: k[0] || (k[0] = (g) => A(n).clearFilters())
        }, F(A(n).isEverything.value ? "Clear filters" : "Search everything instead"), 1))
      ]))
    ], 8, ju));
  }
}), Tr = /* @__PURE__ */ fe(Ju, [["__scopeId", "data-v-d06f9125"]]), ed = ["data-dc-theme"], td = ["data-dc-width", "data-dc-align"], nd = { class: "dc-shell__panel" }, ad = /* @__PURE__ */ oe({
  __name: "DataShell",
  props: /* @__PURE__ */ $n({
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
  emits: /* @__PURE__ */ $n(["activate", "create", "duplicate", "delete", "operate", "drill", "query-change", "toggle-pin"], ["update:open", "update:pinned", "update:selected"]),
  setup(e, { expose: t, emit: n }) {
    const a = e, s = n, r = Ht(e, "open"), i = Ht(e, "pinned"), o = Ht(e, "selected"), l = Jt(), c = It(Vs, null), d = a.route || c ? null : bl(), h = a.route ?? c ?? d;
    We(() => d?.dispose?.());
    const k = v(() => oo({ seed: a.schema.key })), g = v(() => a.source ?? k.value), y = yo({
      schema: () => a.schema,
      adapter: h,
      defaults: () => a.defaults,
      navigationMode: () => a.navigationMode,
      facetNavigationMode: () => a.facetNavigationMode
    }), b = v(() => a.within?.trim() ?? ""), M = bo({
      query: y.query,
      entity: y.entity,
      setExpression: y.setExpression
    }), w = wo({
      source: g,
      query: M.live,
      schema: v(() => a.schema),
      entity: y.entity,
      limit: v(() => a.limit),
      within: b
    });
    we(y.query, ($) => s("query-change", $)), we(
      [w.pageCount, w.pending, y.query, M.drafting],
      () => {
        if (w.pending.value || M.drafting.value) return;
        const $ = w.pageCount.value;
        y.query.value.page > $ && y.setPage($, "replace");
      },
      // Immediately, since a pasted URL is past the end before anything changes;
      // and after the render, so the correction is a navigation the mounted shell
      // makes rather than one it makes on the way up. An async source is still
      // pending here and corrects itself when its count lands.
      { immediate: !0, flush: "post" }
    );
    const S = Tn() ?? "dc-query-panel", z = H(null);
    function x() {
      r.value && (r.value = !1, Nt(() => {
        z.value?.$el?.querySelector(".dc-header__toggle")?.focus();
      }));
    }
    const E = v(() => new Set(i.value));
    function O($) {
      const D = new Set(E.value);
      D.has($.id) ? D.delete($.id) : D.add($.id), i.value = [...D], s("toggle-pin", $);
    }
    const P = v(() => {
      if (a.selectable === !0) return !0;
      const $ = y.entity.value;
      return !!($?.duplicate || $?.delete || $?.operations?.length);
    }), R = v(() => new Set(o.value));
    function T($) {
      const D = new Set(R.value);
      D.has($.id) ? D.delete($.id) : D.add($.id), o.value = [...D];
    }
    function K($) {
      const D = new Set(R.value);
      for (const ie of w.rows.value)
        $ ? D.add(ie.id) : D.delete(ie.id);
      o.value = [...D];
    }
    function W() {
      o.value.length && (o.value = []);
    }
    const U = v(() => ({
      ids: [...o.value],
      rows: w.rows.value.filter(($) => R.value.has($.id)),
      entity: y.entity.value
    }));
    we(() => y.query.value.entity, W);
    function ue($, D, ie = {}) {
      const te = Un(a.schema, y.query.value, $, ie);
      ie.exclude ? y.narrow(te, D?.key ?? y.query.value.entity) : M.release(() => y.narrow(te, D?.key ?? null, D ? void 0 : "cards")), s("drill", $, D, ie);
    }
    const le = io({
      ...y,
      draft: M.text,
      liveQuery: M.live,
      drafting: M.drafting,
      commitDraft: M.commit,
      abandonDraft: M.abandon,
      /*
       * A page of what is on screen: the draft's, while one is live, which are
       * held beside it rather than in the URL — see `liveQuery`.
       */
      setPage: ($, D) => {
        M.drafting.value ? M.setPage($) : y.setPage($, D);
      },
      schema: v(() => a.schema),
      entities: v(() => a.schema.entities),
      rows: w.rows,
      total: w.total,
      limit: v(() => a.limit),
      offset: w.offset,
      pageCount: w.pageCount,
      pending: w.pending,
      counting: w.counting,
      error: w.error,
      source: g,
      previewsPerType: v(() => a.previewsPerType),
      within: b,
      pinnable: v(() => a.pinnable === !0),
      isPinned: ($) => E.value.has($.id),
      isPinnedId: ($) => E.value.has($),
      togglePin: O,
      selectable: P,
      selection: U,
      isSelected: ($) => R.value.has($.id),
      toggleSelect: T,
      selectPage: K,
      clearSelection: W,
      narrowsOnPress: v(() => a.rowPress === "narrow"),
      /*
       * The one place a press is read, so every view gets the same answer without
       * knowing which of the two it is: they all call this.
       */
      activate: ($, D = {}) => {
        if (a.rowPress === "narrow" && Wt(a.schema, $)) {
          ue($, null, D);
          return;
        }
        s("activate", $);
      },
      pressHref: ($) => a.rowPress === "narrow" && Wt(a.schema, $) ? y.narrowHref(Un(a.schema, y.query.value, $), null, "cards") : null,
      drillHref: ($, D) => Wt(a.schema, $) ? y.narrowHref(
        Un(a.schema, y.query.value, $),
        D?.key ?? null,
        D ? void 0 : "cards"
      ) : null,
      create: ($) => s("create", $),
      duplicate: () => s("duplicate", U.value),
      delete: () => s("delete", U.value),
      operate: ($) => s("operate", $, U.value),
      drill: ue
    }), Ae = v(() => {
      if (!(!a.accent && !a.tokens))
        return { ...a.tokens, ...a.accent ? { "--dc-accent": a.accent } : {} };
    });
    return t({
      query: y.query,
      openPanel: () => {
        r.value = !0;
      },
      closePanel: x
    }), ($, D) => (f(), m("div", {
      class: "dc-shell",
      "data-dc-theme": e.theme,
      style: Ee(Ae.value)
    }, [
      C("div", {
        class: "dc-shell__head",
        "data-dc-width": e.matchWidth,
        "data-dc-align": e.matchWidth === "shrink" ? e.headAlign : void 0
      }, [
        ce(gr, {
          ref_key: "headerRef",
          ref: z,
          expanded: r.value,
          "panel-id": A(S),
          views: e.views,
          "pages-note": e.pagesNote,
          onToggle: D[0] || (D[0] = (ie) => r.value = !r.value)
        }, hn({ _: 2 }, [
          l.actions ? {
            name: "actions",
            fn: xe(() => [
              $e($.$slots, "actions", {}, void 0, !0)
            ]),
            key: "0"
          } : void 0
        ]), 1032, ["expanded", "panel-id", "views", "pages-note"]),
        r.value ? (f(), m(ne, { key: 0 }, [
          C("div", {
            class: "dc-shell__scrim",
            onClick: x
          }),
          C("div", nd, [
            ce(yr, {
              "panel-id": A(S),
              onClose: x
            }, hn({ _: 2 }, [
              l["panel-section"] ? {
                name: "panel-section",
                fn: xe(() => [
                  $e($.$slots, "panel-section", {}, void 0, !0)
                ]),
                key: "0"
              } : void 0
            ]), 1032, ["panel-id"])
          ])
        ], 64)) : I("", !0)
      ], 8, td),
      ce(kr, { views: e.views }, null, 8, ["views"]),
      $e($.$slots, "results", {
        rows: A(le).rows.value,
        total: A(le).total.value,
        offset: A(le).offset.value,
        pageCount: A(le).pageCount.value,
        query: A(le).liveQuery.value,
        pending: A(le).pending.value
      }, () => [
        ce(Tr, { views: e.views }, hn({ _: 2 }, [
          l["cards-before"] ? {
            name: "cards-before",
            fn: xe(() => [
              $e($.$slots, "cards-before", {}, void 0, !0)
            ]),
            key: "0"
          } : void 0,
          l["cards-after"] ? {
            name: "cards-after",
            fn: xe(() => [
              $e($.$slots, "cards-after", {}, void 0, !0)
            ]),
            key: "1"
          } : void 0
        ]), 1032, ["views"])
      ], !0)
    ], 12, ed));
  }
}), sd = /* @__PURE__ */ fe(ad, [["__scopeId", "data-v-441e22d4"]]), rd = ["data-dc-muted", "data-dc-collapsed"], ld = ["data-dc-collapsible"], od = ["aria-expanded", "aria-controls"], id = { class: "dc-shell-card__sr" }, cd = { class: "dc-shell-card__title" }, ud = {
  key: 0,
  class: "dc-shell-card__count dc-mono"
}, dd = {
  key: 1,
  class: "dc-shell-card__aside"
}, fd = ["data-dc-flush"], pd = /* @__PURE__ */ oe({
  __name: "ShellCard",
  props: {
    title: {},
    count: {},
    span: {},
    flush: { type: Boolean },
    muted: { type: Boolean },
    collapsible: { type: Boolean },
    collapsed: { type: Boolean, default: void 0 },
    defaultCollapsed: { type: Boolean }
  },
  emits: ["update:collapsed"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = H(n.defaultCollapsed === !0), r = v(() => n.span === "all" ? { gridColumn: "1 / -1" } : void 0), i = Jt();
    function o(P) {
      return l(P?.() ?? []);
    }
    function l(P) {
      return P.some((R) => R.type === yl ? !1 : R.type === wl ? String(R.children ?? "").trim().length > 0 : R.type === ne ? l(R.children ?? []) : !0);
    }
    const c = v(() => !!n.title || d.value || o(i.head)), d = v(() => o(i.aside)), h = v(() => o(i.default)), k = v(() => o(i.foot)), g = v(() => n.collapsible === !0 && c.value), y = v(() => g.value && (n.collapsed ?? s.value));
    function b() {
      const P = !y.value;
      s.value = P, a("update:collapsed", P);
    }
    const M = Tn() ?? "dc-shell-card", w = `${M}-body`, S = `${M}-foot`, z = v(
      () => [h.value ? w : "", k.value ? S : ""].filter(Boolean).join(" ") || void 0
    ), x = [
      "a[href]",
      "button",
      "input",
      "select",
      "textarea",
      "label",
      "summary",
      '[contenteditable]:not([contenteditable="false"])',
      '[role="button"]',
      '[role="link"]',
      '[role="checkbox"]',
      '[role="switch"]',
      '[role="tab"]',
      '[role="menuitem"]'
    ].join(", "), E = H(null);
    function O(P) {
      if (!g.value) return;
      const R = P.target?.closest(x);
      R && E.value?.contains(R) || typeof window < "u" && window.getSelection()?.toString() || b();
    }
    return (P, R) => (f(), m("section", {
      class: "dc-shell-card",
      style: Ee(r.value),
      "data-dc-muted": e.muted ? "true" : "false",
      "data-dc-collapsed": y.value ? "true" : "false"
    }, [
      c.value ? (f(), m("header", {
        key: 0,
        ref_key: "head",
        ref: E,
        class: "dc-shell-card__head",
        "data-dc-collapsible": g.value ? "true" : "false",
        onClick: O
      }, [
        g.value ? (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-shell-card__toggle",
          "aria-expanded": y.value ? "false" : "true",
          "aria-controls": z.value,
          onClick: b
        }, [
          R[0] || (R[0] = C("svg", {
            class: "dc-shell-card__chevron",
            viewBox: "0 0 10 10",
            "aria-hidden": "true"
          }, [
            C("path", { d: "M2 3.5 5 6.5 8 3.5" })
          ], -1)),
          C("span", id, F(e.title || "Card"), 1)
        ], 8, od)) : I("", !0),
        $e(P.$slots, "head", {}, () => [
          C("h2", cd, F(e.title), 1),
          e.count !== void 0 ? (f(), m("span", ud, F(e.count), 1)) : I("", !0)
        ], !0),
        d.value ? (f(), m("span", dd, [
          $e(P.$slots, "aside", {}, void 0, !0)
        ])) : I("", !0)
      ], 8, ld)) : I("", !0),
      h.value ? ft((f(), m("div", {
        key: 1,
        id: w,
        class: "dc-shell-card__body",
        "data-dc-flush": e.flush ? "true" : "false"
      }, [
        $e(P.$slots, "default", {}, void 0, !0)
      ], 8, fd)), [
        [xn, !y.value]
      ]) : I("", !0),
      k.value ? ft((f(), m("footer", {
        key: 2,
        id: S,
        class: "dc-shell-card__foot"
      }, [
        $e(P.$slots, "foot", {}, void 0, !0)
      ], 512)), [
        [xn, !y.value]
      ]) : I("", !0)
    ], 12, rd));
  }
}), up = /* @__PURE__ */ fe(pd, [["__scopeId", "data-v-1caf8572"]]), vd = ["aria-label"], hd = ["aria-checked", "data-dc-active", "tabindex", "onClick", "onKeydown"], md = /* @__PURE__ */ oe({
  __name: "SegmentedControl",
  props: {
    modelValue: {},
    options: {},
    label: {},
    mono: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = H([]);
    function r(i, o) {
      const l = n.options.length;
      let c = null;
      if (i.key === "ArrowRight" || i.key === "ArrowDown" ? c = (o + 1) % l : i.key === "ArrowLeft" || i.key === "ArrowUp" ? c = (o - 1 + l) % l : i.key === "Home" ? c = 0 : i.key === "End" && (c = l - 1), c === null) return;
      i.preventDefault();
      const d = n.options[c];
      d && (a("update:modelValue", d.key), s.value[c]?.focus());
    }
    return (i, o) => (f(), m("div", {
      class: "dc-segmented",
      role: "radiogroup",
      "aria-label": e.label
    }, [
      (f(!0), m(ne, null, me(e.options, (l, c) => (f(), m("button", {
        key: l.key,
        ref_for: !0,
        ref_key: "buttons",
        ref: s,
        type: "button",
        role: "radio",
        class: dt(["dc-segmented__item", { "dc-segmented__item--mono": e.mono }]),
        "aria-checked": l.key === e.modelValue,
        "data-dc-active": l.key === e.modelValue ? "true" : "false",
        tabindex: l.key === e.modelValue ? 0 : -1,
        onClick: (d) => a("update:modelValue", l.key),
        onKeydown: (d) => r(d, c)
      }, F(l.label), 43, hd))), 128))
    ], 8, vd));
  }
}), gd = /* @__PURE__ */ fe(md, [["__scopeId", "data-v-63fb5482"]]), _d = ["data-dc-theme", "aria-label"], yd = ["aria-expanded", "aria-disabled", "disabled", "data-dc-menu", "tabindex", "onClick", "onMouseenter"], wd = /* @__PURE__ */ oe({
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
    const n = e, a = v(() => {
      if (!(!n.accent && !n.tokens))
        return { ...n.tokens, ...n.accent ? { "--dc-accent": n.accent } : {} };
    }), s = t, r = H(null), i = H([]), o = H(null), l = H(null), c = H(!1), d = v(
      () => n.menus.flatMap((x, E) => Ut(x) ? [E] : [])
    );
    function h(x, E) {
      const O = i.value[x]?.getBoundingClientRect(), P = n.menus[x];
      !O || !P || !Ut(P) || (l.value = { x: O.left, y: O.bottom + 2, mirrorX: O.right }, o.value = x, c.value = E);
    }
    function k(x) {
      const E = o.value;
      o.value = null, l.value = null, x && E !== null && i.value[E]?.focus();
    }
    function g(x) {
      o.value === x ? k(!0) : h(x, !1);
    }
    function y(x) {
      o.value === null || o.value === x || h(x, !1);
    }
    function b(x, E) {
      const O = d.value;
      if (O.length === 0) return null;
      if (x === null) return E === 1 ? O[0] ?? null : O[O.length - 1] ?? null;
      const P = O.indexOf(x);
      return P === -1 ? O[0] ?? null : O[(P + E + O.length) % O.length] ?? null;
    }
    function M(x) {
      const E = x.key;
      if (E === "Escape") {
        if (o.value === null) return;
        x.preventDefault(), k(!0);
        return;
      }
      if (E === "ArrowDown" && o.value === null) {
        const R = w();
        if (R === null) return;
        x.preventDefault(), h(R, !0);
        return;
      }
      if (E !== "ArrowLeft" && E !== "ArrowRight") return;
      const O = o.value ?? w(), P = b(O, E === "ArrowRight" ? 1 : -1);
      P !== null && (x.preventDefault(), o.value !== null ? h(P, !0) : i.value[P]?.focus());
    }
    function w() {
      const x = i.value.findIndex((E) => E === document.activeElement);
      return x === -1 ? d.value[0] ?? null : x;
    }
    function S(x) {
      const E = x.target;
      !E || r.value?.contains(E) || k(!1);
    }
    we(o, (x) => {
      x !== null ? window.addEventListener("pointerdown", S, !0) : window.removeEventListener("pointerdown", S, !0);
    }), We(() => window.removeEventListener("pointerdown", S, !0));
    function z(x) {
      k(!0), x.action?.(), s("choose", x);
    }
    return (x, E) => (f(), m("div", {
      ref_key: "bar",
      ref: r,
      class: "dc-shell dc-menubar",
      role: "menubar",
      "data-dc-theme": e.theme,
      "aria-label": e.label ?? "Main menu",
      style: Ee(a.value),
      onKeydown: M
    }, [
      (f(!0), m(ne, null, me(e.menus, (O, P) => (f(), m("button", {
        key: O.id ?? O.label ?? P,
        ref_for: !0,
        ref: (R) => {
          R && (i.value[P] = R);
        },
        type: "button",
        class: "dc-menubar__item",
        role: "menuitem",
        "aria-haspopup": "menu",
        "aria-expanded": o.value === P,
        "aria-disabled": O.disabled ? "true" : void 0,
        disabled: O.disabled,
        "data-dc-menu": O.id ?? O.label,
        tabindex: P === (d.value[0] ?? 0) ? 0 : -1,
        onClick: (R) => g(P),
        onMouseenter: (R) => y(P)
      }, F(O.label), 41, yd))), 128)),
      o.value !== null && l.value ? (f(), Q(Ba, {
        key: o.value,
        items: e.menus[o.value]?.items ?? [],
        at: l.value,
        label: e.menus[o.value]?.label,
        autofocus: c.value,
        onChoose: z,
        onDismiss: E[0] || (E[0] = (O) => k(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : I("", !0)
    ], 44, _d));
  }
}), dp = /* @__PURE__ */ fe(wd, [["__scopeId", "data-v-93dbd2e4"]]), kd = ["aria-label", "aria-expanded", "disabled"], bd = { "aria-hidden": "true" }, $d = /* @__PURE__ */ oe({
  __name: "MenuButton",
  props: {
    items: {},
    label: {},
    glyph: { default: "⋯" }
  },
  emits: ["choose"],
  setup(e, { emit: t }) {
    const n = t, a = H(null), s = H(null), r = H(null), i = H(!1), o = v(() => r.value !== null);
    function l(y) {
      const b = a.value?.getBoundingClientRect();
      b && (r.value = { x: b.left, y: b.bottom + 4, mirrorX: b.right }, i.value = y);
    }
    function c(y) {
      r.value = null, y && a.value?.focus();
    }
    function d() {
      o.value ? c(!0) : l(!1);
    }
    function h(y) {
      y.key !== "ArrowDown" || o.value || (y.preventDefault(), l(!0));
    }
    function k(y) {
      const b = y.target;
      b && (a.value?.contains(b) || s.value?.root?.contains(b) || c(!1));
    }
    we(o, (y) => {
      y ? window.addEventListener("pointerdown", k, !0) : window.removeEventListener("pointerdown", k, !0);
    }), We(() => window.removeEventListener("pointerdown", k, !0));
    function g(y) {
      c(!0), y.action?.(), n("choose", y);
    }
    return (y, b) => (f(), m(ne, null, [
      C("button", {
        ref_key: "trigger",
        ref: a,
        type: "button",
        class: "dc-menu-button",
        "aria-label": e.label,
        "aria-haspopup": "menu",
        "aria-expanded": o.value,
        disabled: e.items.length === 0,
        onClick: d,
        onKeydown: h
      }, [
        C("span", bd, F(e.glyph), 1)
      ], 40, kd),
      r.value ? (f(), Q(Ba, {
        key: 0,
        ref_key: "menu",
        ref: s,
        items: e.items,
        at: r.value,
        label: e.label,
        autofocus: i.value,
        onChoose: g,
        onDismiss: b[0] || (b[0] = (M) => c(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : I("", !0)
    ], 64));
  }
}), Ka = /* @__PURE__ */ fe($d, [["__scopeId", "data-v-48f5ada5"]]), Dt = (e) => e.kind === "split", Z = (e) => e.kind === "group", re = (e) => e.kind === "float", gt = { x: 16, y: 16, w: 360, h: 260 }, Pn = 28, Rr = 120, va = 220, zr = 38, Ct = 6;
function rn(e, t) {
  let n = !1;
  const a = e.frames.map((s, r) => {
    const i = t(s.node, r);
    return i === s.node ? s : (n = !0, { ...s, node: i });
  });
  return n ? { ...e, frames: a } : e;
}
function Xe(e) {
  return { kind: "group", panels: [e] };
}
function fp(e, t, n) {
  return {
    kind: "group",
    panels: e,
    ...t ? { active: t } : {},
    ...n ? { title: n } : {}
  };
}
const _e = (e) => typeof e == "string", Ha = (e) => _e(e) ? Xe(e) : e, ln = (e) => _e(e) ? [e] : He(e), Es = (e) => e.panels.filter(_e), xd = (e) => e.panels.filter((t) => !_e(t)), Ve = (e, t) => e.panels.includes(t);
function on(e, t, n) {
  let a = !1;
  const s = e.panels.map((r) => {
    if (_e(r) || !ve(r, t)) return r;
    const i = n(r);
    return i !== r && (a = !0), i;
  });
  return a ? { ...e, panels: s } : e;
}
function Fn(e, t) {
  return { node: e, rect: { ...gt, ...t } };
}
function Wa(e, t) {
  return t ? { kind: "float", frames: e, title: t } : { kind: "float", frames: e };
}
function Ua(e, t) {
  const n = { ...gt, ...t };
  return Wa(
    e.map(
      (a, s) => Fn(a, {
        ...n,
        x: n.x + s * Pn,
        y: n.y + s * Pn
      })
    )
  );
}
function ja(e, t, n, a) {
  return {
    kind: "split",
    direction: e,
    children: t,
    ...n ? { sizes: n } : {},
    ...a ? { title: a } : {}
  };
}
const Ga = (e, t, n) => ja("row", e, t, n), pp = (e, t, n) => ja("column", e, t, n);
function Me(e) {
  return {
    ...e.title ? { title: e.title } : {},
    ...e.fixedView ? { fixedView: !0 } : {},
    ...e.headless ? { headless: !0 } : {}
  };
}
const kt = (e) => e.fixedView === !0 || e.headless === !0 || !!e.title, Md = (e) => ({ ...e, headless: !0 }), vp = (e) => ({ ...e, fixedView: !0 }), Cd = (e) => e === "left" || e === "right" ? "row" : "column";
function He(e) {
  return Z(e) ? e.panels.flatMap(ln) : re(e) ? e.frames.flatMap((t) => He(t.node)) : e.children.flatMap(He);
}
function ve(e, t) {
  return Z(e) ? e.panels.some((n) => _e(n) ? n === t : ve(n, t)) : re(e) ? e.frames.some((n) => ve(n.node, t)) : e.children.some((n) => ve(n, t));
}
const Lr = (e) => He(e).length === 0, ha = (e) => !Z(e) && kt(e), ma = (e) => Lr(e) && !ha(e);
function On(e) {
  return Dt(e) ? e.children.map((t, n) => ({ node: t, index: n })) : re(e) ? e.frames.map((t, n) => ({ node: t.node, index: n })) : e.panels.flatMap((t, n) => _e(t) ? [] : [{ node: t, index: n }]);
}
const Xa = (e) => On(e).map((t) => t.node);
function xt(e) {
  const t = e.active;
  if (t) {
    const n = e.panels.findIndex(
      (a) => _e(a) ? a === t : ve(a, t)
    );
    if (n >= 0) return n;
  }
  return 0;
}
function Ir(e) {
  const t = e.panels[xt(e)];
  return t !== void 0 && _e(t) ? t : "";
}
function Re(e) {
  if (_e(e)) return e;
  if (Z(e)) {
    const n = e.panels[xt(e)];
    return n === void 0 ? "" : Re(n);
  }
  if (re(e)) {
    const n = e.frames[e.frames.length - 1];
    return n ? Re(n.node) : "";
  }
  const t = e.children[0];
  return t ? Re(t) : "";
}
function Tt(e, t) {
  if (Z(e) && Ve(e, t)) return e;
  for (const n of Xa(e)) {
    const a = Tt(n, t);
    if (a) return a;
  }
  return null;
}
function Sd(e) {
  const t = Xa(e).flatMap(Sd);
  return Z(e) ? [e, ...t] : t;
}
function Pe(e, t) {
  if (Z(e)) {
    for (const n of xd(e)) {
      const a = Pe(n, t);
      if (a) return a;
    }
    return null;
  }
  if (re(e)) {
    for (const n of e.frames)
      if (ve(n.node, t))
        return Pe(n.node, t) ?? n;
    return null;
  }
  for (const n of e.children) {
    const a = Pe(n, t);
    if (a) return a;
  }
  return null;
}
function Yn(e, t, n = Rr) {
  const a = (o, l) => l > 0 ? Math.max(Math.min(o, l), Math.min(n, l)) : Math.max(o, n), s = a(e.w, t.w), r = a(e.h, t.h), i = (o, l, c) => Math.min(Math.max(o, 0), Math.max(c - l, 0));
  return {
    x: Math.round(i(e.x, s, t.w)),
    y: Math.round(i(e.y, r, t.h)),
    w: Math.round(s),
    h: Math.round(r)
  };
}
function As(e, t, n, a, s = Rr) {
  let { x: r, y: i, w: o, h: l } = e;
  return t.includes("e") && (o = e.w + n), t.includes("w") && (o = e.w - n, r = e.x + n), t.includes("s") && (l = e.h + a), t.includes("n") && (l = e.h - a, i = e.y + a), o < s && (t.includes("w") && (r = e.x + e.w - s), o = s), l < s && (t.includes("n") && (i = e.y + e.h - s), l = s), { x: r, y: i, w: o, h: l };
}
const Nr = (e, t) => e.x === t.x && e.y === t.y && e.w === t.w && e.h === t.h;
function Rt(e, t, n) {
  if (Z(e)) return on(e, t, (r) => Rt(r, t, n));
  if (re(e)) {
    let r = !1;
    const i = e.frames.map((o) => {
      if (!ve(o.node, t)) return o;
      if (Pe(o.node, t)) {
        const c = Rt(o.node, t, n);
        return c === o.node ? o : (r = !0, { ...o, node: c });
      }
      const l = n(o);
      return l === o ? o : (r = !0, l);
    });
    return r ? { ...e, frames: i } : e;
  }
  if (!ve(e, t)) return e;
  let a = !1;
  const s = e.children.map((r) => {
    const i = Rt(r, t, n);
    return i !== r && (a = !0), i;
  });
  return a ? { ...e, children: s } : e;
}
function Pd(e, t, n) {
  return Rt(e, t, (a) => Nr(a.rect, n) ? a : { ...a, rect: n });
}
const it = (e) => e.maximized === !0, Fr = (e) => (t) => {
  if (it(t) === e) return t;
  if (e) {
    const { minimized: s, ...r } = t;
    return { ...r, maximized: !0 };
  }
  const { maximized: n, ...a } = t;
  return a;
};
function Ed(e, t, n = !0) {
  return Rt(e, t, Fr(n));
}
function hp(e, t) {
  const n = Pe(e, t);
  return n ? Ed(e, t, !it(n)) : e;
}
const mt = (e) => e.minimized === !0, Or = (e) => (t) => {
  if (mt(t) === e) return t;
  if (e) {
    const { maximized: s, ...r } = t;
    return { ...r, minimized: !0 };
  }
  const { minimized: n, ...a } = t;
  return a;
};
function Ad(e, t, n = !0) {
  return Rt(e, t, Or(n));
}
function mp(e, t) {
  const n = Pe(e, t);
  return n ? Ad(e, t, !mt(n)) : e;
}
function ht(e, t) {
  const n = t[t.length - 1];
  if (n === void 0) return null;
  const a = ut(e, t.slice(0, -1));
  return !a || !re(a) ? null : a.frames[n] ?? null;
}
function ga(e, t) {
  if (re(e)) {
    for (const [n, a] of e.frames.entries()) {
      if (!ve(a.node, t)) continue;
      const s = ga(a.node, t);
      return s ? [n, ...s] : [n];
    }
    return null;
  }
  for (const { node: n, index: a } of On(e)) {
    if (!ve(n, t)) continue;
    const s = ga(n, t);
    return s ? [a, ...s] : null;
  }
  return null;
}
function Ya(e, t, n) {
  const a = t[t.length - 1];
  if (a === void 0) return e;
  const s = t.slice(0, -1), r = ut(e, s);
  if (!r || !re(r)) return e;
  const i = r.frames[a];
  if (!i) return e;
  const o = n(i);
  if (o === i) return e;
  const l = [...r.frames];
  return l[a] = o, yt(e, s, { ...r, frames: l });
}
function Ts(e, t, n) {
  return Ya(
    e,
    t,
    (a) => Nr(a.rect, n) ? a : { ...a, rect: n }
  );
}
function Td(e, t, n = !0) {
  return Ya(e, t, Fr(n));
}
function Rd(e, t, n = !0) {
  return Ya(e, t, Or(n));
}
function jt(e, t) {
  const [n, ...a] = t;
  if (n === void 0) return e;
  if (re(e)) {
    const i = e.frames[n];
    if (!i) return e;
    const o = jt(i.node, a), l = o === i.node ? i : { ...i, node: o };
    if (n === e.frames.length - 1 && l === i) return e;
    const c = [...e.frames];
    return c.splice(n, 1), c.push(l), { ...e, frames: c };
  }
  const s = ut(e, [n]);
  if (!s) return e;
  const r = jt(s, a);
  return r === s ? e : yt(e, [n], r);
}
function zd(e, t) {
  const n = [...t];
  let a = e;
  return t.forEach((s, r) => {
    a && (re(a) && (n[r] = a.frames.length - 1), a = ut(a, [s]));
  }), n;
}
function _n(e, t, n, a) {
  if (Z(e)) return on(e, n, (i) => _n(i, t, n, a));
  if (re(e)) {
    const i = e.frames.findIndex((l) => ve(l.node, n)), o = e.frames[i];
    if (!o) return e;
    if (Pe(o.node, n)) {
      const l = _n(o.node, t, n, a);
      if (l === o.node) return e;
      const c = [...e.frames];
      return c[i] = { ...o, node: l }, { ...e, frames: c };
    }
    return { ...e, frames: [...e.frames, Fn(Xe(t), a)] };
  }
  if (!ve(e, n)) return e;
  let s = !1;
  const r = e.children.map((i) => {
    const o = _n(i, t, n, a);
    return o !== i && (s = !0), o;
  });
  return s ? { ...e, children: r } : e;
}
function Rs(e, t, n, a) {
  if (t === n || !ve(e, t) || !ve(e, n) || !Pe(e, n)) return e;
  const s = _t(e, t);
  if (!s) return e;
  const r = _n(s, t, n, a);
  return r === s ? e : Ce(r);
}
function Ld(e, t, n) {
  return re(e) ? { ...e, frames: [...e.frames, Fn(Xe(t), n)] } : Z(e) ? Br(e, t) : {
    kind: "split",
    direction: e.direction,
    children: [...e.children, Xe(t)],
    sizes: [...lt(e), 1],
    ...Me(e)
  };
}
function Dr(e, t, n, a) {
  const s = n[0];
  if (s === void 0) return Ld(e, t, a);
  const r = n.slice(1), i = (d, h) => h === s ? Dr(d, t, r, a) : _t(d, t);
  if (re(e)) {
    const d = e.frames.flatMap((h, k) => {
      const g = i(h.node, k);
      return g ? [g === h.node ? h : { ...h, node: g }] : [];
    });
    return { ...e, frames: d };
  }
  if (Z(e)) {
    const d = xt(e), h = [];
    e.panels.forEach((y, b) => {
      if (_e(y)) {
        y !== t && h.push(y);
        return;
      }
      const M = i(y, b);
      M && h.push(M);
    });
    const g = e.active && h.some((y) => ln(y).includes(e.active)) ? e.active : Re(h[d] ?? h[h.length - 1]);
    return {
      kind: "group",
      panels: h,
      ...g ? { active: g } : {},
      ...Me(e)
    };
  }
  const o = lt(e), l = [], c = [];
  return e.children.forEach((d, h) => {
    const k = i(d, h);
    k && (l.push(k), c.push(o[h] ?? 0));
  }), { kind: "split", direction: e.direction, children: l, sizes: c, ...Me(e) };
}
function zs(e, t, n, a) {
  const s = ut(e, n);
  return !s || !Lr(s) || !ve(e, t) ? e : Ce(Dr(e, t, n, a));
}
function Qn(e, t) {
  if (Z(e)) return on(e, t, (s) => Qn(s, t));
  if (re(e)) {
    const s = e.frames.findIndex((c) => ve(c.node, t)), r = e.frames[s];
    if (!r) return e;
    const i = Qn(r.node, t), o = i === r.node ? r : { ...r, node: i };
    if (s === e.frames.length - 1 && o === r) return e;
    const l = [...e.frames];
    return l.splice(s, 1), l.push(o), { ...e, frames: l };
  }
  if (!ve(e, t)) return e;
  let n = !1;
  const a = e.children.map((s) => {
    const r = Qn(s, t);
    return r !== s && (n = !0), r;
  });
  return n ? { ...e, children: a } : e;
}
function Qa(e, t) {
  if (e <= 0) return [];
  const n = () => Array.from({ length: e }, () => 1 / e);
  if (!t || t.length !== e) return n();
  const a = t.map((r) => Number.isFinite(r) && r > 0 ? r : 0), s = a.reduce((r, i) => r + i, 0);
  return s <= 0 ? n() : a.map((r) => r / s);
}
const lt = (e) => Qa(e.children.length, e.sizes), Qe = (e) => {
  const t = Z(e) ? e.panels.length : e.children.length;
  return e.places?.length === t ? e.places : void 0;
};
function Ce(e) {
  if (Z(e)) return Id(e);
  if (re(e)) {
    const o = e.frames.flatMap((l) => {
      const c = Ce(l.node);
      return ma(c) ? [] : [c === l.node ? l : { ...l, node: c }];
    });
    return o.length === e.frames.length && o.every((l, c) => l === e.frames[c]) ? e : { ...e, frames: o };
  }
  if (e.children.length === 0) return e;
  const t = lt(e), n = Qe(e), a = [], s = [], r = [];
  e.children.forEach((o, l) => {
    const c = Ce(o), d = t[l] ?? 0;
    if (ma(c)) return;
    if (!n && Dt(c) && c.direction === e.direction && !Qe(c) && !kt(c)) {
      const k = lt(c);
      c.children.forEach((g, y) => {
        a.push(g), s.push(d * (k[y] ?? 0));
      });
      return;
    }
    a.push(c), s.push(d);
    const h = n?.[l];
    h && r.push(h);
  });
  const i = a[0];
  return a.length === 1 && i && !kt(e) ? i : {
    kind: "split",
    direction: e.direction,
    children: a,
    sizes: Qa(a.length, s),
    ...Me(e),
    ...r.length === a.length && r.length > 0 ? { places: r } : {}
  };
}
function Id(e) {
  if (e.panels.every(_e)) return e;
  const t = Re(e), n = Qe(e), a = [], s = [];
  e.panels.forEach((o, l) => {
    const c = n?.[l];
    if (_e(o)) {
      a.push(o), c && s.push(c);
      return;
    }
    const d = Ce(o);
    if (!ma(d)) {
      if (Z(d) && !kt(d) && !Qe(d)) {
        a.push(...d.panels);
        return;
      }
      a.push(d), c && s.push(c);
    }
  });
  const r = a[0];
  if (a.length === 1 && r !== void 0 && !_e(r) && !kt(e))
    return r;
  if (a.length === e.panels.length && a.every((o, l) => o === e.panels[l]))
    return e;
  const i = t && a.some((o) => ln(o).includes(t)) ? t : void 0;
  return {
    kind: "group",
    panels: a,
    ...i ? { active: i } : {},
    ...Me(e),
    ...s.length === a.length && s.length > 0 ? { places: s } : {}
  };
}
function _t(e, t) {
  if (re(e)) {
    const i = e.frames.flatMap((o) => {
      const l = _t(o.node, t);
      return l ? [l === o.node ? o : { ...o, node: l }] : [];
    });
    return i.length === 0 && !ha(e) ? null : { ...e, frames: i };
  }
  if (Z(e)) {
    if (!ve(e, t)) return e;
    const i = xt(e), o = [];
    for (const d of e.panels) {
      if (_e(d)) {
        d !== t && o.push(d);
        continue;
      }
      const h = _t(d, t);
      h && o.push(h);
    }
    if (o.length === 0) return null;
    const c = e.active && o.some((d) => ln(d).includes(e.active)) ? e.active : Re(o[i] ?? o[o.length - 1]);
    return c ? { kind: "group", panels: o, active: c, ...Me(e) } : { kind: "group", panels: o, ...Me(e) };
  }
  const n = lt(e), a = [], s = [];
  if (e.children.forEach((i, o) => {
    const l = _t(i, t);
    l && (a.push(l), s.push(n[o] ?? 0));
  }), a.length === 0)
    return ha(e) ? { kind: "split", direction: e.direction, children: a, sizes: [], ...Me(e) } : null;
  const r = a[0];
  return a.length === 1 && r && !kt(e) ? r : Ce({
    kind: "split",
    direction: e.direction,
    children: a,
    sizes: s,
    ...Me(e)
  });
}
function Br(e, t, n) {
  const a = e.panels.filter((r) => r !== t), s = n === void 0 ? a.length : Math.max(0, Math.min(n, a.length));
  return a.splice(s, 0, t), { kind: "group", panels: a, active: t, ...Me(e) };
}
function Kt(e, t, n, a, s) {
  const r = (g) => rn(
    g,
    (y) => ve(y, n) ? Kt(y, t, n, a, s) : y
  );
  if (a === "float") return e;
  const i = (g) => on(g, n, (y) => Kt(y, t, n, a, s));
  if (a === "center")
    return Z(e) ? Ve(e, n) ? Br(e, t, s) : i(e) : re(e) ? r(e) : {
      ...e,
      children: e.children.map(
        (g) => ve(g, n) ? Kt(g, t, n, a, s) : g
      )
    };
  const o = Cd(a), l = a === "left" || a === "top", c = (g) => ({
    kind: "split",
    direction: o,
    children: l ? [Xe(t), g] : [g, Xe(t)],
    sizes: [0.5, 0.5]
  });
  if (Z(e)) return Ve(e, n) ? c(e) : i(e);
  if (re(e)) return r(e);
  const d = lt(e), h = e.children.findIndex(
    (g) => Z(g) && Ve(g, n)
  );
  if (h >= 0 && e.direction === o) {
    const g = (d[h] ?? 0) / 2, y = [...e.children], b = [...d];
    return y.splice(l ? h : h + 1, 0, Xe(t)), b.splice(h, 1, g, g), {
      kind: "split",
      direction: o,
      children: y,
      sizes: b,
      ...Me(e)
    };
  }
  const k = e.children.map((g) => ve(g, n) ? Z(g) && Ve(g, n) ? c(g) : Kt(g, t, n, a) : g);
  return {
    kind: "split",
    direction: e.direction,
    children: k,
    sizes: d,
    ...Me(e)
  };
}
function zt(e, t) {
  if (Z(e)) {
    if (Ve(e, t))
      return Ir(e) === t ? e : { ...e, active: t };
    const s = e.panels.findIndex((l) => !_e(l) && ve(l, t)), r = e.panels[s];
    if (r === void 0 || _e(r)) return e;
    const i = zt(r, t);
    if (i === r && e.active === t) return e;
    const o = [...e.panels];
    return o[s] = i, { ...e, panels: o, active: t };
  }
  if (!ve(e, t)) return e;
  if (re(e)) return rn(e, (s) => zt(s, t));
  let n = !1;
  const a = e.children.map((s) => {
    const r = zt(s, t);
    return r !== s && (n = !0), r;
  });
  return n ? { ...e, children: a } : e;
}
function Gt(e, t, n) {
  if (Z(e)) {
    if (!Ve(e, t)) return on(e, t, (c) => Gt(c, t, n));
    const a = e.panels.indexOf(t), s = Math.max(0, Math.min(n, e.panels.length - 1));
    if (a === s) return e;
    const r = [...e.panels];
    r.splice(a, 1), r.splice(s, 0, t);
    const i = Qe(e), o = i ? [...i] : void 0;
    o && o.splice(s, 0, ...o.splice(a, 1));
    const l = Re(e);
    return {
      kind: "group",
      panels: r,
      ...l ? { active: l } : {},
      ...Me(e),
      ...o ? { places: o } : {}
    };
  }
  return ve(e, t) ? re(e) ? rn(e, (a) => Gt(a, t, n)) : { ...e, children: e.children.map((a) => Gt(a, t, n)) } : e;
}
function yn(e, t, n) {
  if (t === n) return e;
  if (Z(e)) {
    if (!ve(e, t) && !ve(e, n)) return e;
    const a = (r) => r === t ? n : r === n ? t : r, s = e.panels.map((r) => _e(r) ? a(r) : yn(r, t, n));
    return { ...e, panels: s, ...e.active ? { active: a(e.active) } : {} };
  }
  return re(e) ? rn(e, (a) => yn(a, t, n)) : { ...e, children: e.children.map((a) => yn(a, t, n)) };
}
function pn(e, t, n, a, s) {
  if (a === "float" || !ve(e, t) || !ve(e, n)) return e;
  const r = Tt(e, t);
  if (a === "center" && r && Ve(r, n)) {
    if (s === void 0) return e;
    const o = r.panels.indexOf(t), l = s > o ? s - 1 : s;
    return l === o ? e : zt(Gt(e, t, l), t);
  }
  if (t === n) return e;
  const i = _t(e, t);
  return i ? Ce(Kt(i, t, n, a, s)) : e;
}
function qr(e, t, n) {
  if (Z(e)) {
    const s = e.panels[t];
    if (s === void 0 || _e(s)) return e;
    const r = [...e.panels];
    return r[t] = n, { ...e, panels: r };
  }
  if (re(e)) {
    const s = e.frames[t];
    if (!s) return e;
    const r = [...e.frames];
    return r[t] = { ...s, node: n }, { ...e, frames: r };
  }
  const a = [...e.children];
  return a[t] = n, { ...e, children: a };
}
function cn(e, t, n) {
  const a = On(e);
  if (!Z(e) && a.some(({ node: s }) => Z(s) && Ve(s, t))) {
    const s = n(e);
    return s === e ? null : s;
  }
  for (const { node: s, index: r } of a) {
    if (!ve(s, t)) continue;
    const i = cn(s, t, n);
    return i ? qr(e, r, i) : null;
  }
  return null;
}
function gp(e, t, n) {
  const a = cn(
    e,
    t,
    (s) => Dt(s) && s.direction !== n ? { ...s, direction: n } : s
  );
  return a ? Ce(a) : e;
}
function Vr(e) {
  return re(e) ? [e] : Qe(e) || kt(e) ? [e] : Z(e) ? [...e.panels] : e.children.flatMap(Vr);
}
function Kr(e, t) {
  if (Z(e)) return e;
  const n = Xa(e).map(Vr), a = n.flat(), s = t && a.some((i) => ln(i).includes(t)) ? t : void 0, r = Nd(e, n);
  return Ce({
    kind: "group",
    panels: a,
    ...s ? { active: s } : {},
    ...Me(e),
    ...r ? { places: r } : {}
  });
}
function Nd(e, t) {
  const n = re(e) ? e.frames.map(({ node: a, ...s }) => s) : Qe(e);
  if (n)
    return t.every((a) => a.length === 1) ? n : void 0;
}
function Fd(e, t) {
  const n = cn(e, t, (a) => Kr(a, t));
  return n ? Ce(n) : e;
}
function Za(e, t, n) {
  if (Z(e) && Ve(e, t)) {
    const a = n(e);
    return a === e ? null : a;
  }
  for (const { node: a, index: s } of On(e)) {
    if (!ve(a, t)) continue;
    const r = Za(a, t, n);
    return r ? qr(e, s, r) : null;
  }
  return null;
}
function Ls(e, t, n) {
  const a = Za(e, t, (s) => {
    if (s.panels.length < 2) return s;
    const r = Qe(s);
    return {
      ...ja(n, s.panels.map(Ha)),
      ...Me(s),
      ...r ? { places: r } : {}
    };
  });
  return a ? Ce(a) : e;
}
function _a(e, t) {
  if (Z(e)) return e;
  if (re(e)) {
    const s = e.frames.findIndex(
      (o) => Z(o.node) && o.node.panels.includes(t)
    ), r = e.frames[s], i = r && Z(r.node) ? r.node : null;
    if (r && i && i.panels.length > 1) {
      const o = Ua(i.panels.map(Ha), r.rect).frames;
      return {
        ...e,
        frames: [...e.frames.slice(0, s), ...o, ...e.frames.slice(s + 1)]
      };
    }
    return rn(e, (o) => _a(o, t));
  }
  if (!ve(e, t)) return e;
  let n = !1;
  const a = e.children.map((s) => {
    const r = _a(s, t);
    return r !== s && (n = !0), r;
  });
  return n ? { ...e, children: a } : e;
}
function Od(e, t, n) {
  const a = Tt(e, t);
  if (!a || a.panels.length < 2) return e;
  if (Pe(e, t)?.node === a) {
    const i = _a(e, t);
    return i === e ? e : Ce(i);
  }
  const r = Za(e, t, (i) => ({
    ...Wa(Hr(i.panels.map(Ha), Qe(i), n)),
    ...Me(i)
  }));
  return r ? Ce(r) : e;
}
function Hr(e, t, n) {
  return t ? e.map((a, s) => ({ ...t[s], node: a })) : Ua(e, n).frames;
}
function Wr(e, t) {
  return { ...Wa(Hr(e.children, Qe(e), t)), ...Me(e) };
}
function _p(e, t, n) {
  const a = cn(
    e,
    t,
    (s) => re(s) ? s : Wr(s, n)
  );
  return a ? Ce(a) : Z(e) && Ve(e, t) ? Ua([e], n) : e;
}
function Dd(e, t) {
  const n = (s) => t === "column" ? s.rect.y : s.rect.x, a = (s) => t === "column" ? s.rect.x : s.rect.y;
  return [...e].sort((s, r) => n(s) - n(r) || a(s) - a(r));
}
function Ur(e, t) {
  const n = Dd(e.frames, t);
  return {
    kind: "split",
    direction: t,
    children: n.map((a) => a.node),
    ...Me(e),
    places: n.map(({ node: a, ...s }) => s)
  };
}
function yp(e, t, n = "row") {
  const a = cn(
    e,
    t,
    (s) => re(s) ? Ur(s, n) : s
  );
  return a ? Ce(a) : e;
}
function jr(e) {
  if (re(e)) return null;
  const t = Z(e) ? e.panels.length === 1 ? e.panels[0] : void 0 : e.children.length === 1 ? e.children[0] : void 0;
  return t === void 0 || _e(t) || Z(t) && t.panels.length === 1 && _e(t.panels[0]) ? null : t;
}
const Bd = (e) => {
  const { title: t, fixedView: n, headless: a, ...s } = e;
  return s;
};
function qd(e, t) {
  const n = jr(e);
  return n ? t === "inner" ? n : { ...Bd(n), ...Me(e) } : e;
}
function Ot(e) {
  return e.title ? e.title : Z(e) ? "" : re(e) ? "Desktop" : e.direction === "row" ? "Row" : "Column";
}
function Xt(e, t) {
  if (Z(e)) {
    const a = e.panels[xt(e)];
    return a === void 0 ? "" : _e(a) ? t(a) ?? a : Ot(a) || Xt(a, t);
  }
  if (e.title) return e.title;
  if (re(e)) {
    const a = e.frames[e.frames.length - 1];
    return a ? a.title ?? Xt(a.node, t) : "";
  }
  const n = e.children[0];
  return n ? Xt(n, t) : "";
}
function ut(e, t) {
  let n = e;
  for (const a of t) {
    if (!n) return null;
    if (Dt(n)) n = n.children[a];
    else if (re(n)) n = n.frames[a]?.node;
    else {
      const s = n.panels[a];
      n = s === void 0 || _e(s) ? void 0 : s;
    }
  }
  return n ?? null;
}
function yt(e, t, n) {
  if (t.length === 0) return n;
  const [a, ...s] = t;
  if (a === void 0) return e;
  if (re(e)) {
    const l = e.frames[a];
    if (!l) return e;
    const c = yt(l.node, s, n);
    if (c === l.node) return e;
    const d = [...e.frames];
    return d[a] = { ...l, node: c }, { ...e, frames: d };
  }
  if (Z(e)) {
    const l = e.panels[a];
    if (l === void 0 || _e(l)) return e;
    const c = yt(l, s, n);
    if (c === l) return e;
    const d = [...e.panels];
    return d[a] = c, { ...e, panels: d };
  }
  const r = e.children[a];
  if (!r) return e;
  const i = yt(r, s, n);
  if (i === r) return e;
  const o = [...e.children];
  return o[a] = i, { ...e, children: o };
}
function wn(e, t, n) {
  if (t.length === 0)
    return Dt(e) ? { ...e, sizes: Qa(e.children.length, n) } : e;
  const [a, ...s] = t;
  if (a === void 0) return e;
  if (re(e)) {
    const o = e.frames[a];
    if (!o) return e;
    const l = wn(o.node, s, n);
    if (l === o.node) return e;
    const c = [...e.frames];
    return c[a] = { ...o, node: l }, { ...e, frames: c };
  }
  if (Z(e)) {
    const o = e.panels[a];
    if (o === void 0 || _e(o)) return e;
    const l = wn(o, s, n);
    if (l === o) return e;
    const c = [...e.panels];
    return c[a] = l, { ...e, panels: c };
  }
  const r = e.children[a];
  if (!r) return e;
  const i = [...e.children];
  return i[a] = wn(r, s, n), { ...e, children: i };
}
function Is(e, t, n, a = 0.02) {
  const s = e[t], r = e[t + 1];
  if (s === void 0 || r === void 0) return e;
  const i = s + r;
  if (i < a * 2) return e;
  const o = [...e], l = Math.min(Math.max(s + n, a), i - a);
  return o[t] = l, o[t + 1] = i - l, o;
}
function En(e) {
  if (!Z(e) || e.panels.length >= 2) return e;
  const t = e.panels[0];
  return t !== void 0 && !_e(t) ? e : { ...Ga([Vd(e)]), ...Me(e) };
}
const Vd = (e) => {
  if (!e.title) return e;
  const { title: t, ...n } = e;
  return n;
};
function Ns(e) {
  return e.length === 0 ? null : Ga(e.map(Xe));
}
function Kd(e, t) {
  if (!e) return Ns(t);
  const n = new Set(t), a = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
  for (const l of He(e))
    !n.has(l) || a.has(l) ? s.add(l) : a.add(l);
  let r = e;
  for (const l of s)
    r = r ? _t(r, l) : null;
  const i = new Set(r ? He(r) : []), o = t.filter((l) => !i.has(l));
  if (o.length === 0) return r ? En(Ce(r)) : null;
  if (!r) return Ns(o);
  if (re(r)) {
    const l = r.frames.length;
    return {
      ...r,
      frames: [
        ...r.frames,
        ...o.map(
          (c, d) => Fn(Xe(c), {
            x: gt.x + (l + d) * Pn,
            y: gt.y + (l + d) * Pn
          })
        )
      ]
    };
  }
  return En(Ce(Ga([r, ...o.map(Xe)])));
}
const Ja = Symbol("dc.windowContext");
function Hd(e) {
  return ba(Ja, e), e;
}
function Dn() {
  const e = It(Ja, null);
  if (!e)
    throw new Error(
      "[header-content-layout] No window context found. Render this component inside <WindowFrame>."
    );
  return e;
}
const Wd = 320, Ud = 240;
function jd(e) {
  if (!e || typeof window > "u") return;
  const t = e.getBoundingClientRect();
  if (t.width <= 0 || t.height <= 0) return;
  const n = Math.max(0, window.outerHeight - window.innerHeight);
  return {
    width: Math.round(t.width),
    height: Math.round(t.height),
    left: Math.round(window.screenX + t.left),
    top: Math.round(window.screenY + n + t.top)
  };
}
function Gd(e, t) {
  if (typeof window > "u") return null;
  const n = Math.max(Wd, Math.round(t?.width ?? window.innerWidth)), a = Math.max(Ud, Math.round(t?.height ?? window.innerHeight)), s = ["popup", `width=${n}`, `height=${a}`];
  t?.left !== void 0 && s.push(`left=${t.left}`), t?.top !== void 0 && s.push(`top=${t.top}`);
  const r = window.open(e, "_blank", s.join(","));
  if (r)
    try {
      r.opener = null;
    } catch {
    }
  return r;
}
const Xd = ["data-dc-glyph"], Yd = { class: "dc-glyph__line" }, Qd = ["d"], Zd = {
  key: 0,
  class: "dc-glyph__aqua"
}, Jd = ["d"], ef = /* @__PURE__ */ oe({
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
    return (a, s) => (f(), m("svg", {
      class: "dc-glyph",
      "data-dc-glyph": e.kind,
      viewBox: "0 0 10 10",
      "aria-hidden": "true",
      focusable: "false"
    }, [
      C("g", Yd, [
        (f(!0), m(ne, null, me(t[e.kind], (r) => (f(), m("path", {
          key: r,
          d: r
        }, null, 8, Qd))), 128))
      ]),
      n[e.kind] ? (f(), m("g", Zd, [
        (f(!0), m(ne, null, me(n[e.kind], (r) => (f(), m("path", {
          key: r,
          d: r
        }, null, 8, Jd))), 128))
      ])) : I("", !0)
    ], 8, Xd));
  }
}), Lt = /* @__PURE__ */ fe(ef, [["__scopeId", "data-v-4d2872c0"]]), tf = ["data-dc-order", "data-dc-path", "data-dc-maximized", "data-dc-minimized", "data-dc-dragging"], nf = ["data-dc-movable"], af = { class: "dc-float__title dc-truncate" }, sf = {
  key: 1,
  class: "dc-float__controls dc-controls"
}, rf = ["aria-label", "aria-pressed", "data-dc-minimize"], lf = ["aria-label", "aria-pressed", "data-dc-maximize"], of = ["aria-label", "data-dc-close"], cf = { class: "dc-float__content" }, uf = ["data-dc-handle", "onPointerdown"], df = /* @__PURE__ */ oe({
  __name: "WindowFloat",
  props: {
    frame: {},
    path: {},
    order: {},
    place: {}
  },
  setup(e) {
    const t = e, n = Dn(), a = v(() => Re(t.frame.node)), s = v(() => n.panelFor(a.value)?.fixed === !0), r = v(() => it(t.frame)), i = v(() => mt(t.frame)), o = v(() => r.value || i.value), l = v(() => n.resizable.value && !s.value && !o.value), c = v(() => n.movable.value && !s.value && !o.value), d = v(() => {
      const E = He(t.frame.node);
      return E.length === 1 ? E[0] ?? null : null;
    }), h = v(() => d.value !== null && n.closable(d.value)), k = v(() => t.frame.node.headless === !0), g = v(
      () => !k.value && (!Z(t.frame.node) || i.value)
    ), y = v(
      () => t.frame.title || Ot(t.frame.node) || Xt(t.frame.node, (E) => n.panelFor(E)?.title)
    ), b = v(() => n.spaceMenu(t.path));
    function M(E) {
      E.target?.closest("button, a, input, select, textarea, label") || n.beginFrameDragAt(t.path, E, "move");
    }
    function w(E) {
      E.target?.closest("button, a, input, select, textarea, label") || (i.value ? n.toggleMinimizeAt(t.path) : n.toggleMaximizeAt(t.path));
    }
    const S = v(() => {
      const E = n.framing.value;
      return E !== null && ve(t.frame.node, E);
    }), z = v(() => ({
      // Neither maximizing nor rolling up overwrites the rect: it is where the
      // window goes back to, and both are a way of not being there for a while.
      ...r.value ? { inset: "0" } : i.value && t.place ? {
        left: `${t.place.x}px`,
        bottom: `${t.place.bottom}px`,
        width: `${va}px`,
        height: `${zr}px`
      } : {
        left: `${t.frame.rect.x}px`,
        top: `${t.frame.rect.y}px`,
        width: `${t.frame.rect.w}px`,
        height: `${t.frame.rect.h}px`
      },
      // Back to front. The DOM order says the same thing, but a frame that paints
      // a shadow over its neighbour should not depend on that being noticed.
      zIndex: t.order + 1
    })), x = ["n", "s", "e", "w", "nw", "ne", "sw", "se"];
    return (E, O) => (f(), m("div", {
      class: "dc-float",
      style: Ee(z.value),
      "data-dc-order": e.order,
      "data-dc-path": e.path.join("/"),
      "data-dc-maximized": r.value ? "true" : "false",
      "data-dc-minimized": i.value ? "true" : "false",
      "data-dc-dragging": S.value ? "true" : "false",
      onPointerdown: O[3] || (O[3] = (P) => A(n).raiseAt(e.path))
    }, [
      g.value ? (f(), m("header", {
        key: 0,
        class: "dc-float__bar",
        "data-dc-movable": c.value ? "true" : "false",
        onPointerdown: M,
        onDblclick: w
      }, [
        C("span", af, F(y.value), 1),
        b.value.length ? (f(), Q(Ka, {
          key: 0,
          items: b.value,
          label: `${y.value} menu`
        }, null, 8, ["items", "label"])) : I("", !0),
        !s.value || i.value && h.value && d.value ? (f(), m("div", sf, [
          s.value ? I("", !0) : (f(), m("button", {
            key: 0,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `${i.value ? "Unroll" : "Minimize"} ${y.value}`,
            "aria-pressed": i.value,
            "data-dc-minimize": a.value,
            onClick: O[0] || (O[0] = (P) => A(n).toggleMinimizeAt(e.path))
          }, [
            ce(Lt, {
              kind: i.value ? "unroll" : "minimize"
            }, null, 8, ["kind"])
          ], 8, rf)),
          s.value ? I("", !0) : (f(), m("button", {
            key: 1,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `${r.value ? "Restore" : "Maximize"} ${y.value}`,
            "aria-pressed": r.value,
            "data-dc-maximize": a.value,
            onClick: O[1] || (O[1] = (P) => A(n).toggleMaximizeAt(e.path))
          }, [
            ce(Lt, {
              kind: r.value ? "restore" : "maximize"
            }, null, 8, ["kind"])
          ], 8, lf)),
          i.value && h.value && d.value ? (f(), m("button", {
            key: 2,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `Close ${y.value}`,
            "data-dc-close": d.value,
            onClick: O[2] || (O[2] = (P) => A(n).close(d.value))
          }, [
            ce(Lt, { kind: "close" })
          ], 8, of)) : I("", !0)
        ])) : I("", !0)
      ], 40, nf)) : I("", !0),
      C("div", cf, [
        $e(E.$slots, "default", {}, void 0, !0)
      ]),
      (f(!0), m(ne, null, me(l.value ? x : [], (P) => (f(), m("span", {
        key: P,
        class: "dc-float__grip",
        "data-dc-handle": P,
        "aria-hidden": "true",
        onPointerdown: Fe((R) => A(n).beginFrameDragAt(e.path, R, P), ["stop"])
      }, null, 40, uf))), 128))
    ], 44, tf));
  }
}), ff = /* @__PURE__ */ fe(df, [["__scopeId", "data-v-f035684c"]]), es = Symbol("dc.paneContext");
function Gr(e) {
  return ba(es, e), e;
}
function wp() {
  return It(es, null);
}
function kp(e) {
  const t = It(Ja, null), n = It(es, null);
  if (!t || !n) return () => {
  };
  const a = t.registerMenu(
    () => n.panel.value,
    () => Pt(e)
  );
  return An() && Zt(a), a;
}
const pf = ["data-dc-panel"], vf = /* @__PURE__ */ oe({
  __name: "WindowPaneBody",
  props: {
    panel: {},
    active: { type: Boolean }
  },
  setup(e) {
    const t = e, n = Dn();
    Gr({ panel: v(() => t.panel) });
    const a = () => {
      const s = n.panelFor(t.panel);
      return s ? n.renderContent(s, n.viewFor(t.panel), t.active) ?? null : null;
    };
    return (s, r) => (f(), m("div", {
      class: "dc-pane__content",
      "data-dc-panel": t.panel
    }, [
      ce(a)
    ], 8, pf));
  }
}), hf = /* @__PURE__ */ fe(vf, [["__scopeId", "data-v-31c655fd"]]), mf = ["data-dc-panel", "data-dc-panels", "data-dc-tabbed", "data-dc-floating", "data-dc-maximized", "data-dc-headless", "data-dc-active", "data-dc-dragging", "aria-label"], gf = ["data-dc-movable"], _f = ["aria-label", "aria-pressed"], yf = ["data-dc-space-name"], wf = { class: "dc-truncate" }, kf = ["aria-label"], bf = {
  key: 0,
  class: "dc-pane__insert",
  "aria-hidden": "true"
}, $f = ["id", "data-dc-panel", "data-dc-space", "aria-selected", "aria-controls", "tabindex", "onPointerdown", "onClick", "onKeydown"], xf = { class: "dc-tab__name dc-truncate" }, Mf = {
  key: 0,
  class: "dc-pane__sub dc-mono dc-truncate"
}, Cf = ["aria-label", "data-dc-close", "onClick"], Sf = {
  key: 0,
  class: "dc-pane__insert",
  "aria-hidden": "true"
}, Pf = { class: "dc-pane__tools" }, Ef = {
  key: 2,
  class: "dc-pane__controls dc-controls"
}, Af = ["aria-label", "data-dc-minimize"], Tf = ["aria-label", "aria-pressed", "data-dc-maximize"], Rf = ["aria-label", "data-dc-close"], zf = ["id", "role", "aria-labelledby"], Lf = ["id", "role", "aria-labelledby"], If = ["data-dc-edge"], Nf = /* @__PURE__ */ oe({
  __name: "WindowPane",
  props: {
    group: {},
    path: {}
  },
  setup(e) {
    const t = e, n = Dn(), a = Tn() ?? "dc-pane", s = v(
      () => t.group.panels.flatMap((B, Y) => {
        if (!_e(B)) {
          const Te = Ot(B) || Xt(B, (Le) => n.panelFor(Le)?.title);
          return [{ kind: "space", index: Y, id: `space-${Y}`, title: Te, node: B }];
        }
        const J = n.panelFor(B);
        return J ? [{ kind: "panel", index: Y, id: B, title: J.title, panel: J }] : [];
      })
    ), r = v(() => s.value.length > 1), i = v(() => {
      const B = xt(t.group);
      return s.value.find((Y) => Y.index === B) ?? s.value[0] ?? null;
    }), o = v(() => i.value?.kind === "space" ? i.value.node : null), l = v(() => o.value ? "" : Ir(t.group)), c = v(() => o.value ? null : n.panelFor(l.value)), d = v(() => i.value?.title ?? ""), h = v(() => n.spaceNames.value ? t.group.title ?? "" : ""), k = v(() => [...t.path, i.value?.index ?? 0]), g = v(() => l.value || Es(t.group)[0] || ""), y = v(() => n.viewFor(l.value)), b = v(() => t.group.headless === !0), M = v(() => n.focused.value === l.value), w = v(() => n.dragging.value === l.value), S = v(() => n.moving.value === l.value), z = v(() => n.frameOf(g.value) !== null), x = v(() => n.panelFor(g.value)?.fixed === !0), E = v(
      () => !o.value && (n.canMove(l.value) || z.value && n.movable.value && !x.value)
    ), O = v(
      () => o.value ? n.spaceMenu(k.value) : n.menuFor(l.value)
    ), P = (B) => n.closable(B);
    Gr({ panel: l });
    const R = v(() => n.maximized(g.value)), T = v(
      () => z.value && !x.value || !r.value && !!c.value && P(c.value.id)
    ), K = (B) => `${a}-tab-${B}`, W = v(() => `${a}-body`), U = v(() => {
      const B = n.dropTarget.value;
      return !B || !Ve(t.group, B.panel) || B.edge === "float" ? null : B;
    }), ue = v(() => U.value?.index === void 0 ? U.value?.edge ?? null : null), le = v(() => U.value?.index ?? null), Ae = v(
      () => s.value.flatMap(
        (B) => B.kind === "panel" && (B.id === l.value || B.panel.keepAlive === !0) ? [B.id] : []
      )
    ), $ = H(null), D = /* @__PURE__ */ new Map();
    we(
      l,
      (B, Y) => {
        const J = $.value;
        if (!J || (Y && D.set(Y, J.scrollTop), !n.panelFor(B)?.keepAlive || !D.has(B))) return;
        const Te = D.get(B);
        Nt(() => {
          $.value && ($.value.scrollTop = Te);
        });
      },
      { flush: "pre" }
    );
    const ie = () => c.value ? n.renderActions(c.value, y.value, M.value) ?? null : null;
    let te = null;
    function ye(B) {
      const Y = te !== null && Math.hypot(B.clientX - te.x, B.clientY - te.y) >= 4;
      return te = null, Y;
    }
    const ze = (B) => B.kind === "panel" ? B.id : Re(B.node);
    function Ze(B, Y) {
      Y.kind !== "space" && (n.focus(Y.id), te = { x: B.clientX, y: B.clientY }, n.beginDrag(Y.id, B));
    }
    function Je(B, Y) {
      if (ye(B)) return;
      const J = ze(Y);
      J && n.selectPanel(J);
    }
    function et(B) {
      l.value && n.focus(l.value), !B.target?.closest(".dc-tab, button, a, input, select, textarea, label") && (z.value ? n.beginFrameDrag(g.value, B, "move") : n.beginDrag(l.value, B));
    }
    function Ue(B) {
      te = { x: B.clientX, y: B.clientY }, n.beginDrag(l.value, B);
    }
    function je(B) {
      ye(B) || n.toggleMoveMode(l.value);
    }
    const q = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down"
    };
    function X(B) {
      if (!S.value) return;
      if (B.key === "Escape") {
        B.preventDefault(), n.toggleMoveMode(l.value);
        return;
      }
      const Y = q[B.key];
      Y && (B.preventDefault(), z.value ? n.nudgeFrame(l.value, Y, B.shiftKey) : n.nudge(l.value, Y, B.shiftKey));
    }
    function G(B) {
      !z.value || B.target?.closest(".dc-tab, button, a, input, select, textarea, label") || n.toggleMaximize(g.value);
    }
    function De(B, Y) {
      B.stopPropagation(), te = null, n.close(Y);
    }
    function Bt(B, Y) {
      const J = s.value.length;
      let Te = null;
      if (B.key === "ArrowRight" ? Te = (Y + 1) % J : B.key === "ArrowLeft" ? Te = (Y - 1 + J) % J : B.key === "Home" ? Te = 0 : B.key === "End" && (Te = J - 1), Te === null) return;
      B.preventDefault();
      const Le = s.value[Te];
      if (!Le) return;
      const qt = ze(Le);
      qt && n.selectPanel(qt);
    }
    return (B, Y) => i.value ? (f(), m("section", {
      key: 0,
      class: "dc-pane",
      "data-dc-panel": l.value || void 0,
      "data-dc-panels": A(Es)(e.group).join(" ") || void 0,
      "data-dc-tabbed": r.value ? "true" : "false",
      "data-dc-floating": z.value ? "true" : "false",
      "data-dc-maximized": R.value ? "true" : "false",
      "data-dc-headless": b.value ? "true" : "false",
      "data-dc-active": M.value ? "true" : "false",
      "data-dc-dragging": w.value ? "true" : "false",
      "aria-label": d.value,
      onFocusin: Y[7] || (Y[7] = (J) => l.value && A(n).focus(l.value))
    }, [
      b.value ? I("", !0) : (f(), m("header", {
        key: 0,
        class: "dc-pane__head",
        "data-dc-movable": E.value ? "true" : "false",
        onPointerdown: et,
        onDblclick: G
      }, [
        E.value ? (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-pane__grip",
          "aria-label": `Move ${d.value}`,
          "aria-pressed": S.value,
          onPointerdown: Ue,
          onClick: je,
          onKeydown: X
        }, [...Y[8] || (Y[8] = [
          C("span", { "aria-hidden": "true" }, "⠿", -1)
        ])], 40, _f)) : I("", !0),
        h.value ? (f(), m("span", {
          key: 1,
          class: "dc-pane__name",
          "data-dc-space-name": h.value
        }, [
          C("span", wf, F(h.value), 1)
        ], 8, yf)) : I("", !0),
        C("div", {
          class: "dc-pane__tabs",
          role: "tablist",
          "aria-label": `${d.value} panels`
        }, [
          (f(!0), m(ne, null, me(s.value, (J, Te) => (f(), m(ne, {
            key: J.id
          }, [
            le.value === Te ? (f(), m("span", bf)) : I("", !0),
            C("button", {
              id: K(J.id),
              type: "button",
              role: "tab",
              class: "dc-tab",
              "data-dc-panel": J.kind === "panel" ? J.id : void 0,
              "data-dc-space": J.kind === "space" ? J.title : void 0,
              "aria-selected": J.index === i.value.index,
              "aria-controls": W.value,
              tabindex: J.index === i.value.index ? 0 : -1,
              onPointerdown: (Le) => Ze(Le, J),
              onClick: (Le) => Je(Le, J),
              onKeydown: (Le) => Bt(Le, Te)
            }, [
              C("span", xf, F(J.title), 1),
              J.kind === "panel" && J.panel.subtitle ? (f(), m("span", Mf, F(J.panel.subtitle), 1)) : I("", !0),
              r.value && J.kind === "panel" && P(J.id) ? (f(), m("span", {
                key: 1,
                class: "dc-tab__close",
                role: "button",
                tabindex: "-1",
                "aria-label": `Close ${J.title}`,
                "data-dc-close": J.id,
                onPointerdown: Y[0] || (Y[0] = Fe(() => {
                }, ["stop"])),
                onClick: (Le) => De(Le, J.id)
              }, [...Y[9] || (Y[9] = [
                C("span", { "aria-hidden": "true" }, "×", -1)
              ])], 40, Cf)) : I("", !0)
            ], 40, $f)
          ], 64))), 128)),
          le.value === s.value.length ? (f(), m("span", Sf)) : I("", !0)
        ], 8, kf),
        C("div", Pf, [
          ce(ie),
          O.value.length ? (f(), Q(Ka, {
            key: 0,
            items: O.value,
            label: `${d.value} menu`
          }, null, 8, ["items", "label"])) : I("", !0)
        ]),
        T.value ? (f(), m("div", Ef, [
          z.value && !x.value ? (f(), m("button", {
            key: 0,
            type: "button",
            class: "dc-pane__button dc-control",
            "aria-label": `Minimize ${d.value}`,
            "data-dc-minimize": g.value,
            onPointerdown: Y[1] || (Y[1] = Fe(() => {
            }, ["stop"])),
            onClick: Y[2] || (Y[2] = (J) => A(n).toggleMinimize(g.value))
          }, [
            ce(Lt, { kind: "minimize" })
          ], 40, Af)) : I("", !0),
          z.value && !x.value ? (f(), m("button", {
            key: 1,
            type: "button",
            class: "dc-pane__button dc-control",
            "aria-label": `${R.value ? "Restore" : "Maximize"} ${d.value}`,
            "aria-pressed": R.value,
            "data-dc-maximize": g.value,
            onPointerdown: Y[3] || (Y[3] = Fe(() => {
            }, ["stop"])),
            onClick: Y[4] || (Y[4] = (J) => A(n).toggleMaximize(g.value))
          }, [
            ce(Lt, {
              kind: R.value ? "restore" : "maximize"
            }, null, 8, ["kind"])
          ], 40, Tf)) : I("", !0),
          !r.value && c.value && P(c.value.id) ? (f(), m("button", {
            key: 2,
            type: "button",
            class: "dc-pane__close dc-control",
            "aria-label": `Close ${d.value}`,
            "data-dc-close": c.value.id,
            onPointerdown: Y[5] || (Y[5] = Fe(() => {
            }, ["stop"])),
            onClick: Y[6] || (Y[6] = (J) => A(n).close(c.value.id))
          }, [
            ce(Lt, { kind: "close" })
          ], 40, Rf)) : I("", !0)
        ])) : I("", !0)
      ], 40, gf)),
      o.value ? (f(), m("div", {
        key: 1,
        id: W.value,
        class: "dc-pane__space",
        role: b.value ? void 0 : "tabpanel",
        "aria-labelledby": b.value ? void 0 : K(i.value.id)
      }, [
        $e(B.$slots, "space", {
          node: o.value,
          path: k.value
        }, void 0, !0)
      ], 8, zf)) : I("", !0),
      !o.value || Ae.value.length ? ft((f(), m("div", {
        key: 2,
        id: o.value ? void 0 : W.value,
        ref_key: "body",
        ref: $,
        class: "dc-pane__body",
        role: b.value || o.value ? void 0 : "tabpanel",
        "aria-labelledby": b.value || o.value ? void 0 : K(l.value)
      }, [
        (f(!0), m(ne, null, me(Ae.value, (J) => ft((f(), Q(hf, {
          key: J,
          panel: J,
          active: J === l.value && M.value
        }, null, 8, ["panel", "active"])), [
          [xn, J === l.value]
        ])), 128))
      ], 8, Lf)), [
        [xn, !o.value]
      ]) : I("", !0),
      ue.value ? (f(), m("div", {
        key: 3,
        class: "dc-pane__drop",
        "data-dc-edge": ue.value,
        "aria-hidden": "true"
      }, null, 8, If)) : I("", !0)
    ], 40, mf)) : I("", !0);
  }
}), Xr = /* @__PURE__ */ fe(Nf, [["__scopeId", "data-v-2c3c5ecf"]]), Ff = ["data-dc-space", "data-dc-path", "data-dc-bare", "aria-label"], Of = {
  key: 0,
  class: "dc-space__head"
}, Df = { class: "dc-space__title dc-truncate" }, Bf = ["data-dc-direction"], qf = {
  key: 0,
  class: "dc-space__drop",
  "aria-hidden": "true"
}, Vf = ["aria-orientation", "aria-label", "aria-valuenow", "aria-disabled", "tabindex", "onPointerdown", "onKeydown"], Kf = /* @__PURE__ */ oe({
  __name: "WindowNode",
  props: {
    node: {},
    path: {},
    framed: { type: Boolean }
  },
  setup(e) {
    const t = e, n = Dn(), a = H(null), s = v(() => Z(t.node) ? t.node : null), r = v(() => Dt(t.node) ? t.node : null), i = v(() => re(t.node) ? t.node : null), o = v(
      () => r.value ? r.value.children : i.value?.frames.map(($) => $.node) ?? []
    ), l = v(() => r.value ? lt(r.value) : []), c = v(
      () => (i.value?.frames ?? []).map(($, D) => ({
        held: $,
        /** Place in the stack, counted from the back — what `z-index` follows. */
        order: D,
        key: R($.node),
        path: [...t.path, D]
      })).sort(($, D) => $.key < D.key ? -1 : $.key > D.key ? 1 : 0)
    ), d = v(() => Ot(t.node)), h = v(() => n.spaceMenu(t.path)), k = v(() => t.node.headless === !0), g = v(() => t.path.length === 0 && !n.rootBar.value), y = v(() => i.value ? "desktop" : r.value?.direction ?? ""), b = H(null), M = H(0);
    let w = null;
    we(
      b,
      ($) => {
        w?.disconnect(), w = null, !(!$ || typeof ResizeObserver > "u") && (M.value = $.clientWidth, w = new ResizeObserver(([D]) => {
          M.value = D?.contentRect.width ?? 0;
        }), w.observe($));
      },
      { immediate: !0 }
    ), We(() => w?.disconnect());
    const S = v(() => {
      const $ = Math.max(
        1,
        Math.floor((M.value + Ct) / (va + Ct))
      ), D = /* @__PURE__ */ new Map();
      let ie = 0;
      for (const te of c.value)
        te.held.minimized === !0 && (D.set(te.key, {
          x: Ct + ie % $ * (va + Ct),
          bottom: Ct + Math.floor(ie / $) * (zr + Ct)
        }), ie += 1);
      return D;
    }), z = ($) => !!$ && $.join("/") === t.path.join("/"), x = v(() => {
      const $ = n.dropTarget.value, D = i.value;
      if (!D || !$?.rect || $.edge !== "float") return null;
      if ($.space) return z($.space) ? $.rect : null;
      const ie = Pe(D, $.panel);
      return ie && D.frames.includes(ie) ? $.rect : null;
    }), E = v(() => {
      const $ = n.dropTarget.value;
      return !!$ && !$.rect && z($.space);
    }), O = v(() => r.value?.direction === "row"), P = v(() => o.value.map(($, D) => [...t.path, D])), R = ($) => [...He($)].sort().join("/"), T = ($) => {
      const D = He($)[0];
      return (D ? n.panelFor(D)?.title : null) ?? D ?? "panel";
    }, K = ($) => {
      const D = o.value[$], ie = o.value[$ + 1];
      return !D || !ie ? "Resize panels" : `Resize ${T(D)} and ${T(ie)}`;
    }, W = ($) => {
      const D = l.value[$] ?? 0, ie = l.value[$ + 1] ?? 0, te = D + ie;
      return te > 0 ? Math.round(D / te * 100) : 50;
    };
    function U() {
      const $ = a.value, D = $ ? O.value ? $.clientWidth : $.clientHeight : 0;
      return D <= 0 ? 0.05 : Math.min(n.minPanelSize.value / D, 0.4);
    }
    let ue = null;
    function le($, D) {
      const ie = r.value, te = a.value;
      if (!n.resizable.value || !ie || !te || $.button !== 0) return;
      const ye = O.value ? te.clientWidth : te.clientHeight;
      if (ye <= 0) return;
      const ze = O.value ? $.clientX : $.clientY, Ze = lt(ie), Je = Math.min(n.minPanelSize.value / ye, 0.4);
      $.preventDefault();
      const et = (q) => {
        const X = ((O.value ? q.clientX : q.clientY) - ze) / ye;
        n.setSizes(t.path, Is(Ze, D, X, Je));
      }, Ue = () => ue?.(), je = (q) => {
        q.key === "Escape" && (n.setSizes(t.path, Ze), ue?.());
      };
      ue = () => {
        window.removeEventListener("pointermove", et), window.removeEventListener("pointerup", Ue), window.removeEventListener("pointercancel", Ue), window.removeEventListener("keydown", je), ue = null;
      }, window.addEventListener("pointermove", et), window.addEventListener("pointerup", Ue), window.addEventListener("pointercancel", Ue), window.addEventListener("keydown", je);
    }
    We(() => ue?.());
    function Ae($, D) {
      const ie = r.value;
      if (!n.resizable.value || !ie) return;
      const te = O.value ? "ArrowRight" : "ArrowDown", ye = O.value ? "ArrowLeft" : "ArrowUp", ze = $.shiftKey ? 0.1 : 0.02;
      if ($.key !== te && $.key !== ye) return;
      const Ze = $.key === te ? ze : -ze;
      $.preventDefault(), n.setSizes(t.path, Is(lt(ie), D, Ze, U()));
    }
    return ($, D) => {
      const ie = qs("WindowNode", !0);
      return s.value ? (f(), Q(Xr, {
        key: 0,
        group: s.value,
        path: e.path
      }, {
        space: xe(({ node: te, path: ye }) => [
          ce(ie, {
            node: te,
            path: ye,
            framed: ""
          }, null, 8, ["node", "path"])
        ]),
        _: 1
      }, 8, ["group", "path"])) : (f(), m("section", {
        key: 1,
        class: "dc-space",
        "data-dc-space": y.value,
        "data-dc-path": e.path.join("/"),
        "data-dc-bare": g.value ? "true" : void 0,
        "aria-label": d.value
      }, [
        !e.framed && !k.value && !g.value ? (f(), m("header", Of, [
          C("span", Df, F(d.value), 1),
          h.value.length ? (f(), Q(Ka, {
            key: 0,
            items: h.value,
            label: `${d.value} menu`
          }, null, 8, ["items", "label"])) : I("", !0)
        ])) : I("", !0),
        i.value ? (f(), m("div", {
          key: 1,
          ref_key: "desktop",
          ref: b,
          class: "dc-window__desktop"
        }, [
          x.value ? (f(), m("div", {
            key: 0,
            class: "dc-window__drop",
            style: Ee({
              left: `${x.value.x}px`,
              top: `${x.value.y}px`,
              width: `${x.value.w}px`,
              height: `${x.value.h}px`
            }),
            "aria-hidden": "true"
          }, null, 4)) : I("", !0),
          (f(!0), m(ne, null, me(c.value, (te) => (f(), Q(ff, {
            key: te.key,
            frame: te.held,
            path: te.path,
            order: te.order,
            place: S.value.get(te.key) ?? null
          }, {
            default: xe(() => [
              ce(ie, {
                node: te.held.node,
                path: te.path,
                framed: te.held.node.kind !== "group"
              }, null, 8, ["node", "path", "framed"])
            ]),
            _: 2
          }, 1032, ["frame", "path", "order", "place"]))), 128))
        ], 512)) : r.value ? (f(), m("div", {
          key: 2,
          ref_key: "container",
          ref: a,
          class: "dc-window__split",
          "data-dc-direction": r.value.direction
        }, [
          E.value ? (f(), m("div", qf)) : I("", !0),
          (f(!0), m(ne, null, me(o.value, (te, ye) => (f(), m(ne, {
            key: R(te)
          }, [
            C("div", {
              class: "dc-window__cell",
              style: Ee({ flexGrow: l.value[ye] ?? 1 })
            }, [
              ce(ie, {
                node: te,
                path: P.value[ye] ?? []
              }, null, 8, ["node", "path"])
            ], 4),
            ye < o.value.length - 1 ? (f(), m("div", {
              key: 0,
              class: "dc-window__gutter",
              role: "separator",
              "aria-orientation": O.value ? "vertical" : "horizontal",
              "aria-label": K(ye),
              "aria-valuenow": W(ye),
              "aria-valuemin": "0",
              "aria-valuemax": "100",
              "aria-disabled": A(n).resizable.value ? void 0 : "true",
              tabindex: A(n).resizable.value ? 0 : -1,
              onPointerdown: (ze) => le(ze, ye),
              onKeydown: (ze) => Ae(ze, ye)
            }, null, 40, Vf)) : I("", !0)
          ], 64))), 128))
        ], 8, Bf)) : I("", !0)
      ], 8, Ff));
    };
  }
}), Hf = /* @__PURE__ */ fe(Kf, [["__scopeId", "data-v-0d942d5e"]]), Wf = ["data-dc-theme", "data-dc-dragging", "data-dc-docking"], Uf = {
  key: 1,
  class: "dc-window__empty"
}, jf = {
  class: "dc-window__live",
  "aria-live": "polite",
  role: "status"
}, vn = 16, Gf = /* @__PURE__ */ oe({
  __name: "WindowFrame",
  props: /* @__PURE__ */ $n({
    panels: {},
    movable: { type: Boolean, default: !1 },
    resizable: { type: Boolean, default: !0 },
    minPanelSize: { default: 120 },
    closable: { type: Boolean, default: !1 },
    menu: { type: Boolean, default: !0 },
    spaceNames: { type: Boolean, default: !0 },
    rootBar: { type: Boolean, default: !0 },
    paneMenu: {},
    popOut: {},
    solo: { type: Boolean, default: !1 },
    accent: {},
    tokens: {},
    theme: { default: "minimal" }
  }, {
    layout: { default: null },
    layoutModifiers: {},
    views: { default: () => ({}) },
    viewsModifiers: {}
  }),
  emits: /* @__PURE__ */ $n(["panel-move", "view-change", "panel-activate", "tab-select", "frame-change", "frame-maximize", "frame-minimize", "panel-close", "panel-pop-out"], ["update:layout", "update:views"]),
  setup(e, { expose: t, emit: n }) {
    const a = e, s = n, r = Ht(e, "layout"), i = Ht(e, "views"), o = Jt(), l = v(() => new Map(a.panels.map((u) => [u.id, u]))), c = v(() => a.panels.map((u) => u.id)), d = v(() => Kd(r.value, h.value)), h = v(() => {
      if (!a.solo || !r.value) return c.value;
      const u = new Set(He(r.value)), p = c.value.filter((_) => u.has(_));
      return p.length ? p : c.value;
    }), k = H(null), g = H(null), y = H(null), b = H(!0), M = H(null), w = H(null), S = H(null), z = H(""), x = H(null);
    function E() {
      const u = x.value;
      return u ? [...u.querySelectorAll(".dc-pane[data-dc-panels]")].filter((_) => _.closest(".dc-window") === u).map((_) => ({ panels: (_.dataset.dcPanels ?? "").split(" "), element: _ })) : [];
    }
    function O(u) {
      const p = [];
      let _ = u.closest(".dc-float");
      for (; _; )
        p.unshift(Number(_.dataset.dcOrder ?? 0)), _ = _.parentElement?.closest(".dc-float") ?? null;
      return p;
    }
    function P() {
      return E().map((u) => ({ pane: u, order: O(u.element) })).sort((u, p) => {
        const _ = Math.max(u.order.length, p.order.length);
        for (let L = 0; L < _; L += 1) {
          const N = (u.order[L] ?? -1) - (p.order[L] ?? -1);
          if (N !== 0) return N;
        }
        return 0;
      }).map((u) => u.pane);
    }
    const R = (u) => E().find((p) => p.panels.includes(u)) ?? null;
    function T(u) {
      const p = l.value.get(u);
      if (!p) return "";
      const _ = i.value[u];
      return _ && p.views?.some((L) => L.key === _) ? _ : p.defaultView ?? p.views?.[0]?.key ?? "";
    }
    function K(u, p) {
      i.value = { ...i.value, [u]: p }, s("view-change", { panel: u, view: p });
    }
    const W = v(
      () => a.panels.filter((u) => u.fixed !== !0).length
    );
    function U(u) {
      return !a.movable || W.value < 1 || a.panels.length < 2 ? !1 : l.value.get(u)?.fixed !== !0;
    }
    function ue(u, p) {
      const _ = d.value;
      !u || !_ || u === _ || (r.value = u, p && s("panel-move", p));
    }
    function le(u, p, _) {
      if (u.width <= 0 || u.height <= 0) return "center";
      const L = (p - u.left) / u.width, N = (_ - u.top) / u.height, V = 0.3;
      return L > V && L < 1 - V && N > V && N < 1 - V ? "center" : [
        { edge: "left", distance: L },
        { edge: "right", distance: 1 - L },
        { edge: "top", distance: N },
        { edge: "bottom", distance: 1 - N }
      ].reduce(
        (de, j) => j.distance < de.distance ? j : de
      ).edge;
    }
    function Ae(u, p) {
      const _ = [...u.querySelectorAll(".dc-tab")], L = _.findIndex((N) => {
        const V = N.getBoundingClientRect();
        return p < V.left + V.width / 2;
      });
      return L === -1 ? _.length : L;
    }
    function $(u, p, _) {
      for (const { panels: L, element: N } of P().reverse()) {
        const V = N.getBoundingClientRect();
        if (u < V.left || u > V.right || p < V.top || p > V.bottom) continue;
        const pe = L.find((ae) => ae !== _), de = N.querySelector(".dc-pane__tabs"), j = de?.getBoundingClientRect();
        if (de && j && p >= j.top && p <= j.bottom)
          return pe ? { panel: pe, edge: "center", index: Ae(de, u) } : null;
        const ee = N.querySelector(":scope > .dc-pane__space");
        if (ee) {
          const ae = ee.getBoundingClientRect();
          if (u >= ae.left && u <= ae.right && p >= ae.top && p <= ae.bottom) continue;
        }
        return pe ? { panel: pe, edge: le(V, u, p) } : null;
      }
      return ie(u, p, _) ?? ze(u, p);
    }
    function D() {
      const u = x.value;
      return u ? [...u.querySelectorAll(".dc-window__desktop")].filter((p) => p.closest(".dc-window") === u).reverse() : [];
    }
    function ie(u, p, _) {
      const L = d.value;
      if (!L) return null;
      for (const N of D()) {
        const V = N.getBoundingClientRect();
        if (u < V.left || u > V.right || p < V.top || p > V.bottom) continue;
        const pe = Ze(N), de = pe.flatMap((he) => he.panels).find((he) => he !== _);
        if (!de && pe.length > 0) return null;
        const j = Pe(L, _)?.rect, ee = Yn(
          {
            x: u - V.left - 24,
            y: p - V.top - 12,
            w: j?.w ?? gt.w,
            h: j?.h ?? gt.h
          },
          { w: N.clientWidth, h: N.clientHeight },
          a.minPanelSize
        );
        if (de) return { panel: de, edge: "float", rect: ee };
        const ae = te(N);
        return ae ? { panel: "", space: ae, edge: "float", rect: ee } : null;
      }
      return null;
    }
    function te(u) {
      const p = u.closest(".dc-space")?.getAttribute("data-dc-path");
      return p == null ? null : p === "" ? [] : p.split("/").map(Number);
    }
    function ye() {
      const u = x.value;
      return u ? [...u.querySelectorAll(".dc-space")].filter((p) => p.closest(".dc-window") === u).filter((p) => !p.querySelector(".dc-pane")).reverse().flatMap((p) => {
        const _ = te(p);
        return _ ? [{ element: p, path: _ }] : [];
      }) : [];
    }
    function ze(u, p) {
      for (const { element: _, path: L } of ye()) {
        if (_.dataset.dcSpace === "desktop") continue;
        const N = _.getBoundingClientRect();
        if (!(u < N.left || u > N.right || p < N.top || p > N.bottom))
          return { panel: "", space: L, edge: "center" };
      }
      return null;
    }
    function Ze(u) {
      return E().filter(
        (p) => p.element.closest(".dc-window__desktop") === u
      );
    }
    let Je = null;
    const et = (u) => u.altKey;
    function Ue(u, p) {
      if (!U(u) || g.value || w.value || p.button !== 0) return;
      const _ = p.clientX, L = p.clientY;
      let N = !1, V = et(p);
      const pe = () => {
        const ge = S.value;
        ge && (y.value = V ? ie(ge.x, ge.y, u) : $(ge.x, ge.y, u));
      }, de = (ge) => {
        if (!N) {
          if (Math.hypot(ge.clientX - _, ge.clientY - L) < 4) return;
          N = !0, g.value = u, M.value = null;
        }
        V = et(ge), b.value = !V, S.value = { x: ge.clientX, y: ge.clientY }, pe();
      }, j = (ge) => {
        et(ge) !== V && (V = !V, b.value = !V, N && pe());
      }, ee = (ge) => {
        Je?.();
        const se = y.value, Ie = d.value;
        if (ge && N && se && Ie) {
          const ot = se.space ? zs(Ie, u, se.space, se.rect) : se.edge === "float" && se.rect ? Rs(Ie, u, se.panel, se.rect) : pn(Ie, u, se.panel, se.edge, se.index);
          ue(ot, {
            panel: u,
            target: se.panel,
            edge: se.edge,
            ...se.space === void 0 ? {} : { space: se.space },
            ...se.index === void 0 ? {} : { index: se.index },
            ...se.rect === void 0 ? {} : { rect: se.rect }
          });
        }
        g.value = null, y.value = null, S.value = null, b.value = !0;
      }, ae = () => ee(!0), he = () => ee(!1), ke = (ge) => {
        if (ge.key === "Escape") {
          ee(!1);
          return;
        }
        j(ge);
      };
      Je = () => {
        window.removeEventListener("pointermove", de), window.removeEventListener("pointerup", ae), window.removeEventListener("pointercancel", he), window.removeEventListener("keydown", ke), window.removeEventListener("keyup", j), Je = null;
      }, window.addEventListener("pointermove", de), window.addEventListener("pointerup", ae), window.addEventListener("pointercancel", he), window.addEventListener("keydown", ke), window.addEventListener("keyup", j);
    }
    We(() => Je?.());
    let je = null;
    function q(u) {
      const p = x.value;
      return p ? [...p.querySelectorAll(
        `.dc-float[data-dc-path="${u.join("/")}"]`
      )].find((N) => N.closest(".dc-window") === p)?.parentElement ?? null : null;
    }
    function X(u) {
      const p = d.value;
      return p ? ga(p, u) : null;
    }
    function G(u) {
      const p = d.value;
      if (!p) return;
      const _ = jt(p, u);
      _ !== p && (r.value = _);
    }
    function De(u) {
      const p = X(u);
      p && G(p);
    }
    function Bt(u) {
      const p = d.value, _ = p ? Pe(p, u) : null;
      return _ !== null && it(_);
    }
    function B(u) {
      const p = d.value, _ = p ? Pe(p, u) : null;
      return _ !== null && mt(_);
    }
    function Y(u) {
      const p = d.value, _ = p ? ht(p, u) : null;
      return _ ? Re(_.node) : "";
    }
    function J(u) {
      const p = d.value, _ = p ? ht(p, u) : null;
      if (!p || !_) return;
      const L = Re(_.node);
      if (l.value.get(L)?.fixed === !0) return;
      const N = !mt(_);
      let V = Rd(p, u, N);
      V !== p && (N || (V = jt(V, u)), r.value = V, s("frame-minimize", { panel: L, minimized: N }));
    }
    function Te(u) {
      const p = X(u);
      p && J(p);
    }
    function Le(u) {
      const p = d.value, _ = p ? ht(p, u) : null;
      if (!p || !_) return;
      const L = Re(_.node);
      if (l.value.get(L)?.fixed === !0) return;
      const N = !it(_);
      let V = Td(p, u, N);
      V !== p && (N && (V = jt(V, u)), r.value = V, s("frame-maximize", { panel: L, maximized: N }));
    }
    function qt(u) {
      const p = X(u);
      p && Le(p);
    }
    function as(u, p, _) {
      const L = d.value, N = L ? ht(L, u) : null;
      if (!L || !N || p.button !== 0 || g.value || w.value) return;
      const V = Re(N.node);
      if (l.value.get(V)?.fixed === !0 || it(N) || mt(N) || (_ === "move" ? !a.movable : !a.resizable)) return;
      const pe = q(u), de = zd(L, u);
      G(u);
      const j = { w: pe?.clientWidth ?? 0, h: pe?.clientHeight ?? 0 }, ee = { ...N.rect }, ae = p.clientX, he = p.clientY, ke = a.minPanelSize;
      w.value = V;
      const ge = (qe) => {
        const at = d.value;
        if (!at) return;
        const Vt = Ts(at, de, Yn(qe, j, ke));
        Vt !== at && (r.value = Vt);
      }, se = (qe) => {
        qe.preventDefault();
        const at = qe.clientX - ae, Vt = qe.clientY - he;
        ge(
          _ === "move" ? { ...ee, x: ee.x + at, y: ee.y + Vt } : As(ee, _, at, Vt, ke)
        );
      }, Ie = (qe) => {
        if (je?.(), w.value = null, !qe) {
          ge(ee);
          return;
        }
        const at = d.value ? ht(d.value, de) : null;
        at && s("frame-change", { panel: Y(de), rect: at.rect });
      }, ot = () => Ie(!0), pt = () => Ie(!1), vt = (qe) => {
        qe.key === "Escape" && Ie(!1);
      };
      je = () => {
        window.removeEventListener("pointermove", se), window.removeEventListener("pointerup", ot), window.removeEventListener("pointercancel", pt), window.removeEventListener("keydown", vt), je = null;
      }, window.addEventListener("pointermove", se), window.addEventListener("pointerup", ot), window.addEventListener("pointercancel", pt), window.addEventListener("keydown", vt);
    }
    function el(u, p, _) {
      const L = X(u);
      L && as(L, p, _);
    }
    function tl(u, p, _ = !1) {
      const L = d.value, N = X(u), V = L && N ? ht(L, N) : null;
      if (!L || !N || !V || l.value.get(u)?.fixed === !0 || (_ ? !a.resizable : !a.movable)) return;
      if (it(V) || mt(V)) {
        z.value = `${tt(u)} is ${it(V) ? "maximized" : "minimized"}, so it cannot be moved.`;
        return;
      }
      const pe = p === "left" ? -vn : p === "right" ? vn : 0, de = p === "up" ? -vn : p === "down" ? vn : 0, j = q(N), ee = { w: j?.clientWidth ?? 0, h: j?.clientHeight ?? 0 }, ae = _ ? As(V.rect, "se", pe, de, a.minPanelSize) : { ...V.rect, x: V.rect.x + pe, y: V.rect.y + de }, he = Ts(L, N, Yn(ae, ee, a.minPanelSize));
      if (he === L) {
        z.value = _ ? `${tt(u)} cannot be resized further.` : `${tt(u)} cannot move ${p}.`;
        return;
      }
      r.value = he;
      const ke = ht(he, N);
      ke && (s("frame-change", { panel: u, rect: ke.rect }), z.value = _ ? `${tt(u)} resized to ${ke.rect.w} by ${ke.rect.h}.` : `${tt(u)} moved to ${ke.rect.x}, ${ke.rect.y}.`);
    }
    We(() => je?.());
    function nl(u, p) {
      const _ = R(u), L = _?.element.getBoundingClientRect();
      if (!_ || !L) return null;
      const N = p === "left" || p === "right", V = (j) => {
        if (!(N ? j.bottom > L.top + 1 && j.top < L.bottom - 1 : j.right > L.left + 1 && j.left < L.right - 1)) return null;
        const ae = p === "left" ? L.left - j.right : p === "right" ? j.left - L.right : p === "up" ? L.top - j.bottom : j.top - L.bottom;
        return ae < -1 ? null : ae;
      }, pe = [];
      for (const j of E()) {
        if (j === _ || j.element === _.element) continue;
        const ee = V(j.element.getBoundingClientRect());
        if (ee === null) continue;
        const ae = j.panels.find((he) => he !== u);
        ae && pe.push({ to: { panel: ae }, distance: ee });
      }
      for (const { element: j, path: ee } of ye()) {
        const ae = V(j.getBoundingClientRect());
        ae !== null && pe.push({ to: { space: ee }, distance: ae });
      }
      return pe.reduce(
        (j, ee) => j && j.distance <= ee.distance ? j : ee,
        null
      )?.to ?? null;
    }
    function al(u) {
      const p = d.value ? Pe(d.value, u) !== null : !1;
      if (!p && !U(u)) return;
      M.value = M.value === u ? null : u;
      const _ = tt(u);
      if (!M.value) {
        z.value = `${_}: move mode off.`;
        return;
      }
      z.value = p ? `${_}: move mode on. Arrow keys move the window, shift and an arrow resize it, Escape leaves move mode.` : `${_}: move mode on. Arrow keys move the panel, shift and an arrow make it a tab of the panel that way, Escape leaves move mode.`;
    }
    const tt = (u) => l.value.get(u)?.title ?? u, sl = {
      left: "left",
      right: "right",
      up: "top",
      down: "bottom"
    };
    function rl(u, p, _ = !1) {
      if (!U(u)) return;
      const L = d.value;
      if (!L) return;
      const N = tt(u), V = Tt(L, u);
      if (!_ && V && (p === "left" || p === "right") && V.panels.length > 1) {
        const he = V.panels.indexOf(u), ke = p === "left" ? he - 1 : he + 1;
        if (ke >= 0 && ke < V.panels.length) {
          ue(Gt(L, u, ke), { panel: u, target: u, edge: "center", index: ke }), z.value = `${N} moved ${p}, now tab ${ke + 1} of ${V.panels.length}.`, Bn(u);
          return;
        }
      }
      const de = nl(u, p);
      if (!de || de.panel !== void 0 && !U(de.panel)) {
        z.value = `${N} cannot move ${p}.`;
        return;
      }
      const j = sl[p];
      if (de.space) {
        const he = de.space, ke = ut(L, he), ge = Pe(L, u)?.rect, se = { ...gt, ...ge ? { w: ge.w, h: ge.h } : {} };
        ue(zs(L, u, he, se), { panel: u, target: "", space: he, edge: j }), z.value = `${N} moved ${p}, into ${ke ? Ot(ke) : "the space"}.`, Bn(u);
        return;
      }
      const ee = de.panel, ae = V?.panels.length === 1 && Tt(L, ee)?.panels.length === 1;
      _ ? (ue(pn(L, u, ee, "center"), {
        panel: u,
        target: ee,
        edge: "center"
      }), z.value = `${N} joined ${tt(ee)} as a tab.`) : ae ? (ue(yn(L, u, ee), { panel: u, target: ee, edge: j }), z.value = `${N} moved ${p}, trading places with ${tt(ee)}.`) : (ue(pn(L, u, ee, j), { panel: u, target: ee, edge: j }), z.value = `${N} moved ${p}, beside ${tt(ee)}.`), Bn(u);
    }
    function Bn(u) {
      Nt(() => {
        R(u)?.element.querySelector(".dc-pane__grip")?.focus();
      });
    }
    function ll(u, p) {
      const _ = d.value;
      _ && (r.value = wn(_, u, p));
    }
    function qn(u) {
      const p = d.value;
      if (!p) return;
      const _ = zt(p, u);
      _ !== p && (r.value = _, s("tab-select", { panel: u }));
    }
    function Vn(u) {
      return l.value.get(u)?.closable ?? a.closable;
    }
    function ss(u) {
      Vn(u) && s("panel-close", u);
    }
    const Kn = H(/* @__PURE__ */ new Map());
    let ol = 0;
    function il(u, p) {
      const _ = ol += 1;
      return Kn.value.set(_, { panel: u, items: p }), () => {
        Kn.value.delete(_);
      };
    }
    function cl(u) {
      const p = [];
      for (const _ of Kn.value.values())
        _.panel() === u && p.push(..._.items());
      return p;
    }
    function rs(u) {
      const p = u.filter((_) => _.items.length > 0);
      return p.length < 2 ? p.flatMap((_) => _.items) : p.flatMap((_) => [
        { id: _.id, heading: !0, label: _.title },
        ..._.items
      ]);
    }
    const ls = (u) => u.title || "These tabs";
    function os(u, p) {
      const _ = p.id, L = Tt(u, _), N = (L?.panels.length ?? 0) > 1, V = L?.fixedView === !0, pe = (ae) => ({
        action: () => {
          ae !== u && (r.value = ae);
        }
      }), de = [], j = [], ee = p.views ?? [];
      if (ee.length > 1 && !V) {
        const ae = T(_);
        de.push({
          id: "view",
          label: "View",
          items: ee.map((he) => ({
            id: `view-${he.key}`,
            label: he.label,
            checked: he.key === ae,
            action: () => K(_, he.key)
          }))
        });
      }
      return N && !V && j.push(
        { id: "show-row", label: "Row", checked: !1, ...pe(Ls(u, _, "row")) },
        {
          id: "show-column",
          label: "Column",
          checked: !1,
          ...pe(Ls(u, _, "column"))
        },
        // Already true, and nothing to collapse: these panes are tabs. Ticked
        // and choosable all the same — collapsing a strip into a strip hands
        // back the tree it was given, so it is the no-op it looks like.
        {
          id: "show-tabs",
          label: "Tabs",
          checked: !0,
          ...pe(Fd(u, _))
        },
        {
          id: "show-desktop",
          label: "Desktop",
          checked: !1,
          ...pe(Od(u, _))
        }
      ), N && L && (j.length && j.push({ separator: !0 }), j.push(...is(L, _))), { panel: de, tabs: j, tabsTitle: L ? ls(L) : "" };
    }
    function is(u, p) {
      const _ = xt(u), L = (N) => {
        const V = u.panels[(_ + N + u.panels.length) % u.panels.length];
        return (V === void 0 ? "" : Re(V)) || p;
      };
      return [
        { id: "next-tab", label: "Next tab", action: () => qn(L(1)) },
        { id: "previous-tab", label: "Previous tab", action: () => qn(L(-1)) },
        ...ul(u)
      ];
    }
    function ul(u) {
      const p = He(u).filter(Vn);
      return p.length ? [
        { separator: !0 },
        { id: "close-all", label: "Close all", action: () => p.forEach(ss) }
      ] : [];
    }
    function un(u) {
      return u.title ? u.title : Z(u) ? u.panels.length > 1 ? "these tabs" : "the strip" : Ot(u);
    }
    function cs(u) {
      if (!u || re(u) || u.fixedView === !0 || !u.title && u.headless !== !0 || Qe(u)) return null;
      const p = jr(u);
      return p && p.fixedView !== !0 ? p : null;
    }
    function us(u) {
      const p = d.value;
      if (!a.menu || !p) return [];
      const _ = ut(p, u);
      if (!_ || Z(_)) return [];
      if (_.fixedView) return [];
      const L = re(_) ? "desktop" : _.direction, N = (se, Ie, ot) => ({
        id: `show-${se}`,
        label: Ie,
        checked: L === se,
        action: () => {
          const pt = d.value, vt = ot();
          !pt || vt === _ || (r.value = En(Ce(yt(pt, u, vt))));
        }
      }), V = () => {
        const se = Kr(_, dl(_));
        if (Z(se) && se.panels.length === 0) return _;
        const Ie = Z(se) && se.panels.length === 1 ? se.panels[0] : void 0;
        return Ie !== void 0 && _e(Ie) ? _ : se;
      }, pe = (se) => () => re(_) ? Ur(_, se) : _.direction === se ? _ : { ..._, direction: se }, de = u.slice(0, -1), j = u.length > 0 ? ut(p, de) : null, ee = j && Z(j) && j.panels.length > 1 ? j : null, ae = j && cs(j) === _ ? j : null, he = cs(_), ke = _.title || "this space", ge = (se, Ie, ot, pt, vt) => ({
        id: se,
        label: vt,
        action: () => {
          const qe = d.value;
          qe && (r.value = En(Ce(yt(qe, Ie, qd(ot, pt)))));
        }
      });
      return rs([
        {
          id: "about-space",
          /*
           * Its own name, or what it is rather than how it is shown: `spaceTitle`
           * would answer "Row" for an unnamed row, which is the item directly
           * under it and the one already ticked.
           */
          title: _.title || "This space",
          items: [
            N("row", "Row", pe("row")),
            N("column", "Column", pe("column")),
            // Everything in this space in one strip: the panes as tabs, and a
            // desktop among them as a tab of its own, keeping the windows on it.
            N("tabs", "Tabs", () => V()),
            N("desktop", "Desktop", () => re(_) ? _ : Wr(_))
          ]
        },
        {
          id: "about-around",
          title: he ? `Around ${un(he)}` : "",
          items: he ? [
            // Keeping this space's bar drops the one inside, so it is offered
            // only where the space inside has no name to be dropped with it.
            ...he.title ? [] : [ge("merge-around-keep-this", u, _, "outer", `Keep ${ke}`)],
            ..._.title ? [] : [ge("merge-around-keep-that", u, _, "inner", `Keep ${un(he)}`)]
          ] : []
        },
        {
          id: "about-inside",
          title: ae ? `Inside ${un(ae)}` : "",
          items: ae ? [
            ..._.title ? [] : [ge("merge-inside-keep-that", de, ae, "outer", `Keep ${un(ae)}`)],
            ...ae.title ? [] : [ge("merge-inside-keep-this", de, ae, "inner", `Keep ${ke}`)]
          ] : []
        },
        {
          id: "about-tabs",
          title: ee ? ls(ee) : "",
          items: ee ? is(ee, Re(_)) : []
        }
      ]);
    }
    function dl(u) {
      const p = k.value;
      return p && ve(u, p) ? p : void 0;
    }
    function fl(u) {
      const p = d.value, _ = l.value.get(u);
      if (!p || !_) return [];
      const L = a.menu ? os(p, _) : null, N = cl(u);
      N.length && L?.panel.length && N.push({ separator: !0 }), L && N.push(...L.panel);
      const V = vl(_);
      V && (N.length && N.push({ separator: !0 }), N.push(V));
      const pe = rs([
        { id: "about-panel", title: _.title, items: N },
        { id: "about-tabs", title: L?.tabsTitle ?? "", items: L?.tabs ?? [] }
      ]);
      return a.paneMenu ? a.paneMenu(_, pe) : pe;
    }
    const pl = v(() => {
      const u = d.value;
      if (!u) return [];
      if (!Z(u)) return us([]);
      const p = l.value.get(Re(u));
      return a.menu && p ? os(u, p).tabs : [];
    });
    function vl(u) {
      const p = a.popOut?.(u);
      return !p || a.solo && d.value && He(d.value).length <= 1 ? null : {
        id: "pop-out",
        label: "Pop out to new window",
        action: () => {
          const _ = x.value?.querySelector(`.dc-pane[data-dc-panel="${CSS.escape(u.id)}"]`);
          Gd(p, jd(_)) && s("panel-pop-out", { panel: u.id, href: p });
        }
      };
    }
    function hl(u, p) {
      return o[`${u}-${p}`] ?? o[u];
    }
    function ds(u, p, _, L) {
      return hl(u, p.id)?.({ panel: p, view: _, active: L });
    }
    Hd({
      panelFor: (u) => l.value.get(u) ?? null,
      viewFor: T,
      setView: K,
      movable: v(() => a.movable),
      resizable: v(() => a.resizable),
      minPanelSize: v(() => a.minPanelSize),
      spaceNames: v(() => a.spaceNames),
      rootBar: v(() => a.rootBar),
      focused: k,
      dragging: g,
      dropTarget: y,
      moving: M,
      framing: w,
      canMove: U,
      focus(u) {
        k.value !== u && (k.value = u, s("panel-activate", u));
      },
      selectPanel: qn,
      beginDrag: Ue,
      toggleMoveMode: al,
      nudge: rl,
      setSizes: ll,
      frameOf: (u) => d.value ? Pe(d.value, u) : null,
      beginFrameDrag: el,
      nudgeFrame: tl,
      raise: De,
      maximized: Bt,
      toggleMaximize: qt,
      minimized: B,
      toggleMinimize: Te,
      beginFrameDragAt: as,
      raiseAt: G,
      toggleMaximizeAt: Le,
      toggleMinimizeAt: J,
      menuFor: fl,
      spaceMenu: us,
      registerMenu: il,
      closable: Vn,
      close: ss,
      renderContent: (u, p, _) => ds("panel", u, p, _),
      renderActions: (u, p, _) => ds("actions", u, p, _),
      layout: d
    });
    const ml = v(() => {
      if (!(!a.accent && !a.tokens))
        return { ...a.tokens, ...a.accent ? { "--dc-accent": a.accent } : {} };
    }), gl = () => {
      const u = g.value, p = S.value;
      return !u || !p ? null : kl(
        "div",
        {
          class: "dc-window__ghost",
          style: { left: `${p.x}px`, top: `${p.y}px` },
          "aria-hidden": "true"
        },
        l.value.get(u)?.title ?? u
      );
    };
    return t({
      /** The layout as rendered, reconciled against the current panels. */
      layout: d,
      /** Moves a panel programmatically — the same operation a drag performs. */
      move(u, p, _, L) {
        const N = d.value;
        N && ue(pn(N, u, p, _, L), {
          panel: u,
          target: p,
          edge: _,
          ...L === void 0 ? {} : { index: L }
        });
      },
      /** Brings a panel's tab to the top of its group. */
      select(u) {
        const p = d.value;
        p && (r.value = zt(p, u));
      },
      /** Lifts a panel onto the float holding `near`, as a window of its own. */
      float(u, p, _) {
        const L = d.value;
        L && ue(Rs(L, u, p, _), {
          panel: u,
          target: p,
          edge: "float",
          rect: _
        });
      },
      /** Puts a floating frame somewhere else, or makes it another size. */
      setRect(u, p) {
        const _ = d.value;
        if (!_) return;
        const L = Pd(_, u, p);
        if (L === _) return;
        r.value = L;
        const N = Pe(L, u);
        N && s("frame-change", { panel: u, rect: N.rect });
      },
      /**
       * Puts a panel on one of its views, the way its menu would — the way a pane
       * whose space fixed its view, or took its bar away, is switched at all.
       */
      setView: K,
      /**
       * The menu of the space at the root: how the whole window is shown. For a
       * host's menu bar, when `rootBar` takes away the bar it was on.
       */
      rootMenu: pl,
      /** Brings a floating frame to the front of its stack. */
      raise: De,
      /** Fills the float with a window, or puts it back where it was. */
      toggleMaximize: qt,
      /** Rolls a window up to its title bar, or unrolls it. */
      toggleMinimize: Te
    }), (u, p) => (f(), m("div", {
      ref_key: "root",
      ref: x,
      class: "dc-shell dc-window",
      "data-dc-theme": e.theme,
      "data-dc-dragging": g.value ? "true" : "false",
      "data-dc-docking": b.value ? "true" : "false",
      style: Ee(ml.value)
    }, [
      d.value ? (f(), Q(Hf, {
        key: 0,
        node: d.value,
        path: []
      }, null, 8, ["node"])) : (f(), m("p", Uf, " This window has no panels. ")),
      ce(gl),
      C("p", jf, F(z.value), 1)
    ], 12, Wf));
  }
}), Xf = /* @__PURE__ */ fe(Gf, [["__scopeId", "data-v-a7bf2b5c"]]), Yf = (e) => Math.round(e * 1e3) / 1e3;
function Zn(e, t) {
  return e.title && (t.t = e.title), e.headless && (t.h = !0), e.fixedView && (t.v = !0), t;
}
function Qf(e) {
  return [Math.round(e.x), Math.round(e.y), Math.round(e.w), Math.round(e.h)];
}
function Jn(e) {
  const t = { b: Qf(e.rect) };
  return e.title && (t.t = e.title), e.maximized && (t.M = !0), e.minimized && (t.m = !0), t;
}
function Zf(e) {
  if (e.kind !== "group" || e.panels.length !== 1) return null;
  const t = e.panels[0];
  return typeof t != "string" || e.title || e.headless || e.fixedView || e.places ? null : t;
}
function ya(e) {
  const t = Zf(e);
  return t !== null ? t : Yr(e);
}
function Yr(e) {
  if (e.kind === "group") {
    const n = { g: e.panels.map((a) => typeof a == "string" ? a : Yr(a)) };
    return e.active !== void 0 && e.active !== e.panels[0] && (n.a = e.active), e.places && (n.p = e.places.map(Jn)), Zn(e, n);
  }
  if (e.kind === "split") {
    const n = { [e.direction === "row" ? "r" : "c"]: e.children.map(ya) };
    return e.sizes && (n.z = e.sizes.map(Yf)), e.places && (n.p = e.places.map(Jn)), Zn(e, n);
  }
  const t = {
    f: e.frames.map((n) => ({ n: ya(n.node), ...Jn(n) }))
  };
  return Zn(e, t);
}
class Qr extends Error {
}
const Se = () => {
  throw new Qr();
}, wa = (e) => typeof e == "object" && e !== null && !Array.isArray(e), St = (e) => Array.isArray(e) ? e : Se(), ts = (e) => e === void 0 ? void 0 : typeof e == "string" ? e : Se(), Zr = (e) => St(e).map((t) => typeof t == "number" && Number.isFinite(t) ? t : Se());
function Jf(e) {
  const [t, n, a, s] = Zr(e);
  return s === void 0 && Se(), { x: t, y: n, w: a, h: s };
}
function ea(e) {
  if (!wa(e)) return Se();
  const t = { rect: Jf(e.b) }, n = ts(e.t);
  return n && (t.title = n), e.M === !0 && (t.maximized = !0), e.m === !0 && (t.minimized = !0), t;
}
function ta(e, t) {
  const n = ts(e.t);
  return n && (t.title = n), e.h === !0 && (t.headless = !0), e.v === !0 && (t.fixedView = !0), t;
}
function kn(e) {
  if (typeof e == "string") return { kind: "group", panels: [e] };
  if (!wa(e)) return Se();
  if (e.g !== void 0) {
    const n = St(e.g).map((r) => typeof r == "string" ? r : kn(r));
    n.length === 0 && Se();
    const a = { kind: "group", panels: n }, s = ts(e.a);
    return s !== void 0 && (a.active = s), e.p !== void 0 && (a.places = St(e.p).map(ea)), ta(e, a);
  }
  const t = e.r !== void 0 ? "row" : e.c !== void 0 ? "column" : null;
  if (t) {
    const n = St(t === "row" ? e.r : e.c).map(kn), a = { kind: "split", direction: t, children: n };
    return e.z !== void 0 && (a.sizes = Zr(e.z)), e.p !== void 0 && (a.places = St(e.p).map(ea)), ta(e, a);
  }
  if (e.f !== void 0) {
    const a = { kind: "float", frames: St(e.f).map((s) => !wa(s) || s.n === void 0 ? Se() : { node: kn(s.n), ...ea(s) }) };
    return ta(e, a);
  }
  return Se();
}
const Jr = /[ '!:(),*@$]/, ep = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][-+]?\d+)?$/;
function Fs(e) {
  return e !== "" && !Jr.test(e) && !/^[-\d]/.test(e) ? e : `'${e.replace(/[!']/g, (n) => `!${n}`)}'`;
}
function ka(e) {
  return e === null ? "!n" : e === !0 ? "!t" : e === !1 ? "!f" : typeof e == "number" ? Number.isFinite(e) ? String(e) : "!n" : typeof e == "string" ? Fs(e) : Array.isArray(e) ? `!(${e.map(ka).join(",")})` : `(${Object.entries(e).map(([t, n]) => `${Fs(t)}:${ka(n)}`).join(",")})`;
}
function tp(e) {
  let t = 0;
  const n = () => e[t], a = (o) => e[t++] === o ? void 0 : Se(), s = () => {
    if (n() === "'") {
      t++;
      let l = "";
      for (; ; ) {
        const c = e[t++];
        if (c === void 0) return Se();
        if (c === "'") return l;
        if (c === "!") {
          const d = e[t++];
          d !== "!" && d !== "'" && Se(), l += d;
        } else l += c;
      }
    }
    const o = t;
    for (; t < e.length && !Jr.test(e[t]); ) t++;
    return t === o && Se(), e.slice(o, t);
  }, r = () => {
    const o = n();
    if (o === "(") {
      t++;
      const c = {};
      if (n() === ")")
        return t++, c;
      for (; ; ) {
        const d = s();
        a(":"), c[d] = r();
        const h = e[t++];
        if (h === ")") return c;
        h !== "," && Se();
      }
    }
    if (o === "!") {
      t++;
      const c = e[t++];
      if (c === "t") return !0;
      if (c === "f") return !1;
      if (c === "n") return null;
      if (c !== "(") return Se();
      const d = [];
      if (n() === ")")
        return t++, d;
      for (; ; ) {
        d.push(r());
        const h = e[t++];
        if (h === ")") return d;
        h !== "," && Se();
      }
    }
    if (o === "'") return s();
    const l = s();
    return ep.test(l) ? Number(l) : l;
  }, i = r();
  return t !== e.length && Se(), i;
}
function na(e) {
  return ka(ya(e));
}
function np(e) {
  try {
    return kn(tp(e));
  } catch (t) {
    if (t instanceof Qr) return null;
    throw t;
  }
}
function aa(e, t) {
  for (const n of e.replace(/^[?]/, "").split("&")) {
    const a = n.indexOf("="), s = a === -1 ? n : n.slice(0, a);
    if (ns(s) === t) return a === -1 ? "" : n.slice(a + 1);
  }
  return null;
}
function sa(e, t, n) {
  const a = e.replace(/^[?]/, "").split("&").filter(Boolean), s = a.findIndex((i) => {
    const o = i.indexOf("=");
    return ns(o === -1 ? i : i.slice(0, o)) === t;
  }), r = n === null ? null : `${encodeURIComponent(t)}=${n}`;
  return s === -1 ? r && a.push(r) : r ? a[s] = r : a.splice(s, 1), a.length ? `?${a.join("&")}` : "";
}
function ns(e) {
  try {
    return decodeURIComponent(e.replace(/\+/g, " "));
  } catch {
    return e;
  }
}
const ap = [
  [/%2C/g, ","],
  [/%3A/g, ":"],
  [/%2F/g, "/"],
  [/%40/g, "@"],
  [/%24/g, "$"],
  [/%20/g, "+"]
], Os = (e) => {
  let t = encodeURIComponent(e);
  for (const [n, a] of ap) t = t.replace(n, a);
  return t;
};
function bp(e, t) {
  const { adapter: n } = t, a = t.param ?? "w", s = t.soloParam ?? "solo", r = t.delay ?? 200, i = () => Pt(t.home) ?? null;
  let o = aa(n.search.value, a), l = null;
  const c = () => {
    l !== null && clearTimeout(l), l = null;
  }, d = (y) => y === null ? i() : np(ns(y)) ?? i(), h = () => {
    c();
    const y = e.value, b = i(), M = y ? na(y) : null, w = M === null || b && M === na(b) ? null : Os(M);
    o = w;
    const S = sa(n.search.value, a, w);
    S !== n.search.value && n.replace(S);
  }, k = d(o);
  return k && (e.value = k), we(e, () => {
    c(), l = setTimeout(h, r);
  }), we(n.search, (y) => {
    const b = aa(y, a);
    if (b === o) return;
    c(), o = b;
    const M = d(b);
    M && (e.value = M);
  }), An() && Zt(() => l !== null ? h() : void 0), {
    flush: () => l !== null ? h() : void 0,
    popOutHref: (y) => {
      let b = sa(n.search.value, a, Os(na(Md(Xe(y)))));
      return b = sa(b, s, "1"), n.href ? n.href(b) : `${n.path.value}${b}`;
    },
    solo: v(() => aa(n.search.value, s) !== null)
  };
}
function $p(e = "", t = "/") {
  const n = H(Be(e)), a = H(t), s = [`${a.value}${n.value}`];
  return {
    search: n,
    path: a,
    history: s,
    href(r) {
      return `${a.value}${Be(r)}`;
    },
    push(r) {
      n.value = Be(r), s.push(`${a.value}${n.value}`);
    },
    replace(r) {
      n.value = Be(r), s[s.length - 1] = `${a.value}${n.value}`;
    }
  };
}
function Ds(e) {
  const t = e.indexOf("?");
  if (t === -1) return "";
  const n = e.slice(t), a = n.indexOf("#");
  return Be(a === -1 ? n : n.slice(0, a));
}
function xp(e) {
  const t = H(Ds(e.currentRoute.value.fullPath)), n = v(() => e.currentRoute.value.path), a = we(
    () => e.currentRoute.value.fullPath,
    (s) => {
      t.value = Ds(s);
    }
  );
  return {
    search: t,
    path: n,
    push: (s) => e.push(`${n.value}${Be(s)}`),
    replace: (s) => e.replace(`${n.value}${Be(s)}`),
    href: (s) => {
      const r = `${n.value}${Be(s)}`;
      return e.resolve?.(r).href ?? r;
    },
    dispose: a
  };
}
const sp = {
  DataShell: sd,
  ShellHeader: gr,
  QueryPanel: yr,
  RecordActions: kr,
  ResultsArea: Tr,
  FacetControl: _r,
  SegmentedControl: gd,
  StatusPill: nn,
  WindowFrame: Xf,
  WindowPane: Xr,
  ListView: pa,
  CardsView: xr,
  GridView: Mr,
  ImagesView: Cr,
  TableView: Er,
  LinksView: Sr,
  PreviewView: Pr,
  TypeCardsView: Ar
}, Mp = {
  install(e, t = {}) {
    const n = t.prefix ?? "";
    for (const [a, s] of Object.entries(sp))
      e.component(`${n}${a}`, s);
    t.route && e.provide(Vs, t.route);
  }
};
export {
  Pn as CASCADE_STEP,
  ip as COLUMN_BREAKPOINTS,
  op as COLUMN_ROLES,
  xr as CardsView,
  Ps as ColumnCell,
  xl as DEFAULT_ENTITY_VIEW,
  gt as DEFAULT_FRAME,
  ra as DEFAULT_SORT,
  $l as DEFAULT_VIEW,
  ko as DRAFT_DELAY,
  sd as DataShell,
  la as EMPTY_CELL,
  pr as ENTITY_ALL,
  Sn as ENTITY_TERM,
  Qt as EXPRESSION_TERM,
  Oa as FACET_PREFIX,
  _r as FacetControl,
  Mr as GridView,
  Mp as HeaderContentLayoutPlugin,
  Cr as ImagesView,
  Sr as LinksView,
  pa as ListView,
  Ct as MINIMIZED_GAP,
  zr as MINIMIZED_HEIGHT,
  va as MINIMIZED_WIDTH,
  Rr as MIN_FRAME,
  xs as MOCK_TINTS,
  dp as MenuBar,
  Ka as MenuButton,
  Ba as MenuList,
  an as MetricDrill,
  es as PANE_CONTEXT_KEY,
  Ia as PARAM_DIR,
  Ra as PARAM_ENTITY,
  Na as PARAM_EXPR,
  Fa as PARAM_PAGE,
  La as PARAM_SORT,
  za as PARAM_VIEW,
  qa as PinStar,
  Pr as PreviewView,
  Va as QueryMark,
  yr as QueryPanel,
  dn as RECORD_STATUSES,
  Pa as RESULT_FIELDS,
  Vs as ROUTE_ADAPTER_KEY,
  kr as RecordActions,
  Tr as ResultsArea,
  fr as SHELL_CONTEXT_KEY,
  lp as SHELL_THEMES,
  sn as ScopeMark,
  gd as SegmentedControl,
  $t as SelectTick,
  up as ShellCard,
  gr as ShellHeader,
  fa as StandingControl,
  nn as StatusPill,
  Er as TableView,
  Ar as TypeCardsView,
  Ks as VIEW_KINDS,
  Ml as VIEW_LABELS,
  Ja as WINDOW_CONTEXT_KEY,
  Xf as WindowFrame,
  Xr as WindowPane,
  Ir as activePanel,
  xt as activeTab,
  Aa as addTerm,
  Ea as andExpression,
  Cd as axisOf,
  Ua as cascade,
  Zs as cellFull,
  en as cellText,
  gn as cellTextOf,
  Ke as cellValue,
  Hn as changesResults,
  Yn as clampRect,
  Kr as collapseSpace,
  Fd as collapseToTabs,
  pp as column,
  hs as columnAlign,
  ms as columnClass,
  vs as columnKey,
  er as columnShortcut,
  ql as columnShortcutOf,
  oa as columnTruncates,
  Tl as columnsFor,
  Sl as countPages,
  bl as createHistoryAdapter,
  $p as createMemoryAdapter,
  oo as createMockDataSource,
  xp as createVueRouterAdapter,
  np as decodeLayout,
  Ll as defaultCellText,
  Ns as defaultLayout,
  Sa as defaultQuery,
  Yt as defaultViewFor,
  Un as drillExpression,
  zs as dropIntoSpace,
  Ft as emptyFacetState,
  xa as emptyFacetValue,
  na as encodeLayout,
  or as excludingTerm,
  Mn as expandShortcuts,
  Et as findEntity,
  ct as findSort,
  vp as fixedView,
  Wa as float,
  Rs as floatPanel,
  Wr as floatSplit,
  Od as floatTabs,
  mn as fnv1a,
  Ws as focusEntity,
  Mt as formatCount,
  El as formatDate,
  rt as formatExpression,
  Pl as formatMetric,
  Al as formatOrdinal,
  tn as formatTerm,
  Fn as frame,
  ht as frameAt,
  Pe as frameOf,
  ga as framePathOf,
  Re as frontPanel,
  so as generateRows,
  fp as group,
  Tt as groupOf,
  Sd as groups,
  Xs as hasActiveFacets,
  ve as hasPanel,
  Md as headless,
  Kt as insertPanel,
  Ut as isChoosable,
  cp as isEntityScoped,
  Gs as isFacetActive,
  re as isFloat,
  Z as isGroup,
  it as isMaximized,
  mt as isMinimized,
  _e as isPanelTab,
  Ma as isPristineQuery,
  Dt as isSplit,
  Ve as isTabOf,
  Ca as isTypeCardsQuery,
  Hs as isViewKind,
  bs as joinExpression,
  ir as liftTerm,
  Hl as matchesExpression,
  ro as matchesFacets,
  Ed as maximizeFrame,
  Td as maximizeFrameAt,
  qd as mergeSpace,
  Ad as minimizeFrame,
  Rd as minimizeFrameAt,
  pn as movePanel,
  Gt as moveTab,
  Wl as negateTerm,
  ut as nodeAt,
  Xt as nodeTitle,
  Ce as normalizeLayout,
  Be as normalizeSearch,
  Qa as normalizeSizes,
  jr as onlySpace,
  Gd as openPopOut,
  Gl as oppositeTerm,
  He as panelIds,
  Xe as panelNode,
  Es as panelTabs,
  Ne as parseExpression,
  mo as parseQuery,
  jd as popOutRect,
  Wi as presentParts,
  br as presentRow,
  In as pressOptions,
  Gr as providePaneContext,
  io as provideShellContext,
  Hd as provideWindowContext,
  Qn as raiseFrame,
  jt as raiseFrameAt,
  zd as raisedPath,
  Ql as readDraft,
  Ys as reconcileFacets,
  Kd as reconcileLayout,
  lr as recordTerm,
  ca as refineExpression,
  _t as removePanel,
  yt as replaceAt,
  As as resizeRect,
  Is as resizeSplit,
  Rn as resolveView,
  Ge as roleColumn,
  Qs as roleColumns,
  En as rootSpace,
  Ga as row,
  zl as rowKey,
  ia as sameTerm,
  zn as scopeTerm,
  Wt as scopeTermFor,
  dr as scopedEntity,
  Gn as serializeQuery,
  zt as setActivePanel,
  Pd as setFrameRect,
  Ts as setFrameRectAt,
  wn as setSizesAt,
  gp as setSplitDirection,
  lt as sizesOf,
  js as sortsFor,
  Me as spaceChrome,
  Ot as spaceTitle,
  ja as split,
  jl as splitExpression,
  Ls as spreadTabs,
  _o as summarizeQuery,
  Da as summaryTerms,
  yn as swapPanels,
  Ha as tabNode,
  ln as tabPanels,
  Ta as termStanding,
  Ur as tileFloat,
  _p as toFloat,
  yp as toTiled,
  hp as toggleMaximized,
  mp as toggleMinimized,
  cu as useColumns,
  bo as useDraft,
  Oo as useEntityCounts,
  Cu as useEntityPreviews,
  bp as useLayoutRoute,
  wp as usePaneContext,
  kp as usePaneMenu,
  bt as usePresentedRows,
  yo as useQueryState,
  qo as useRecordNames,
  wo as useResults,
  be as useShellContext,
  Dn as useWindowContext,
  ps as viewAcross,
  ua as withStanding,
  ur as withoutOwnScope,
  Ul as withoutTerm
};
