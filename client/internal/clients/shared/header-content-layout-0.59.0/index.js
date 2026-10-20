import { ref as H, inject as It, provide as Ma, computed as v, toValue as Pt, shallowRef as wt, watch as we, onScopeDispose as Zt, getCurrentScope as An, defineComponent as oe, onMounted as Bs, onBeforeUnmount as Ue, resolveComponent as qs, openBlock as f, createElementBlock as m, normalizeStyle as Ee, Fragment as ne, renderList as me, toDisplayString as F, createCommentVNode as I, createElementVNode as C, createBlock as Z, nextTick as Nt, useId as Tn, unref as A, normalizeClass as ft, Teleport as bl, createVNode as ue, withDirectives as pt, withKeys as at, withModifiers as Fe, vModelText as bn, renderSlot as xe, useSlots as Jt, createTextVNode as Oe, withCtx as Me, reactive as ds, resolveDynamicComponent as Ca, createSlots as hn, useModel as Ht, mergeModels as $n, vShow as xn, Comment as $l, Text as xl, h as Ml } from "vue";
const Vs = Symbol("dc.routeAdapter");
function Be(e) {
  if (!e) return "";
  const t = e.replace(/^[?]/, "");
  return t ? `?${t}` : "";
}
function Cl() {
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
const Ks = ["list", "cards", "grid", "images", "table", "links", "preview"], dp = [
  "minimal",
  "mono-size",
  "dark",
  "light",
  "auto",
  "macos",
  "windows",
  "inherit"
], dn = ["ok", "running", "queued", "review", "failed"], fp = [
  "identity",
  "reference",
  "metric",
  "state",
  "updated",
  "image",
  "tint"
], pp = [480, 620, 760, 900, 1100], Sl = "cards", Pl = "table";
function Yt(e, t = {}) {
  const n = (s) => s && Hs(s) ? s : void 0;
  if (e === null) return n(t.view) ?? Sl;
  const a = t.landing === "entity" ? n(t.view) : void 0;
  return n(t.entityView) ?? a ?? Pl;
}
function fs(e, t, n, a = {}) {
  return e === Yt(t, a) ? Yt(n, a) : e;
}
const ia = "updated";
function Hs(e) {
  return typeof e == "string" && Ks.includes(e);
}
const El = {
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
const Al = { key: ia, label: ia };
function dt(e, t, n = null) {
  const a = js(e, n);
  return (t ? a.find((r) => r.key === t) : void 0) ?? a.find((r) => r.key === ia) ?? a[0] ?? Al;
}
function Sa(e) {
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
  for (const n of e?.facets ?? []) t[n.key] = Sa(n);
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
function Pa(e) {
  return e.entity === null && e.expr.trim() === "" && !Xs(e.facets);
}
function vp(e) {
  return e.entity !== null;
}
function Ea(e, t) {
  return e.entity === null && Rn(e.view, t) === "cards";
}
function Tl(e, t) {
  return t <= 0 ? 1 : Math.max(1, Math.ceil(e / t));
}
function Aa(e, t = {}) {
  const a = t.landing === "entity" ? Ws(e, t) : null;
  return {
    entity: a?.key ?? null,
    view: Yt(a?.key ?? null, t),
    sort: dt(a, t.sort).key,
    dir: t.dir === "asc" ? "asc" : "desc",
    expr: "",
    facets: Ft(a),
    page: 1
  };
}
const Ta = ["entity", "sort", "dir", "expr", "facets"];
function jn(e) {
  return Ta.some((t) => t in e);
}
function Ys(e, t) {
  const n = {};
  for (const a of e?.facets ?? []) {
    const s = t[a.key];
    n[a.key] = s && s.kind === a.kind ? s : Sa(a);
  }
  return n;
}
function mn(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n++)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return Math.abs(t);
}
function Rl(e) {
  if (!Number.isFinite(e)) return "—";
  const t = Math.abs(e);
  return t >= 1e6 ? `${(e / 1e6).toFixed(1)}m` : t >= 1e3 ? `${(e / 1e3).toFixed(1)}k` : String(Math.round(e));
}
function Mt(e) {
  return Number.isFinite(e) ? Math.round(e).toLocaleString("en-US") : "—";
}
function zl(e) {
  const t = new Date(e);
  if (Number.isNaN(t.getTime())) return "—";
  const n = String(t.getUTCDate()).padStart(2, "0"), a = String(t.getUTCMonth() + 1).padStart(2, "0");
  return `${n}.${a}.${t.getUTCFullYear()}`;
}
function Ll(e) {
  return String(e + 1).padStart(2, "0");
}
const ca = "—";
function Xe(e, t) {
  return e.find((n) => n.role === t);
}
function Qs(e, t) {
  return e.filter((n) => n.role === t);
}
function Il(e, t) {
  const n = (t ? t.columns : e?.columns) ?? [], a = t ? "scoped" : "everything";
  return n.filter(
    (s) => s.role !== "tint" && ((s.when ?? "always") === "always" || s.when === a)
  );
}
const Nl = ["id", "entityKey", "entityLabel"];
function He(e, t) {
  if (e.value) return e.value(t);
  const n = e.field ?? e.key;
  if (n !== void 0) {
    if (t.fields && n in t.fields) return t.fields[n];
    if (Nl.includes(n))
      return t[n];
  }
}
function ps(e, t) {
  const n = e.key ?? e.field ?? e.label;
  return n?.trim() ? n.trim() : `column-${t}`;
}
function Fl(e, t) {
  return e.id?.trim() ? e.id : `${e.entityKey || "row"}-${t}`;
}
function Ol(e, t) {
  if (e == null || e === "") return ca;
  if (t === "number") {
    const n = typeof e == "number" ? e : Number(e);
    return Number.isFinite(n) ? Rl(n) : String(e);
  }
  return t === "date" ? zl(String(e)) : Array.isArray(e) ? e.length ? e.join(", ") : ca : String(e);
}
function en(e, t) {
  const n = He(e, t);
  return e.format ? e.format(n, t) : Ol(n, e.kind);
}
function Dl(e) {
  return typeof e == "number" ? Number.isFinite(e) ? String(e) : "" : typeof e == "string" ? e : Array.isArray(e) ? e.join(", ") : "";
}
function Zs(e, t) {
  const n = en(e, t), a = Dl(He(e, t));
  return a && a !== n ? a : n;
}
function gn(e, t) {
  return e ? en(e, t) : "";
}
function vs(e) {
  return e.align ? e.align : e.kind === "number" || e.kind === "ordinal" ? "right" : "left";
}
const Bl = {
  ordinal: "dc-table__num",
  number: "dc-table__number",
  date: "dc-table__date",
  status: "dc-table__state"
};
function hs(e) {
  return [Bl[e.kind ?? "text"], e.class].filter(Boolean).join(" ");
}
function ua(e) {
  if (e.truncate !== void 0) return e.truncate;
  const t = e.kind ?? "text";
  return t === "text" || t === "number" || t === "date";
}
const ql = /^([A-Za-z_][\w.-]*)\s*(>=|<=|:|=|>|<)\s*(.*)$/;
function Vl(e) {
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
  for (const s of Vl(t)) {
    const r = s.toUpperCase();
    if (r === "AND" || r === "&&") continue;
    if (r === "OR" || r === "||") {
      a.length && n.push(a), a = [];
      continue;
    }
    const i = s.length > 1 && s.startsWith("-"), o = i ? s.slice(1) : s, l = i ? { negated: !0 } : {}, c = ql.exec(o);
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
function Kl(e, t, n) {
  const a = At(e), s = n.columns ?? [];
  if (a === "entity") return t.entityKey;
  if (e in t.fields) return t.fields[e];
  const r = s.find(
    (c) => c.key?.toLowerCase() === e.toLowerCase() || c.field?.toLowerCase() === e.toLowerCase() || c.label !== void 0 && At(c.label) === a
  );
  if (r) return He(r, t);
  const i = n.facets.find((c) => At(c.label) === a);
  if (i && i.key in t.fields) return t.fields[i.key];
  const o = Js.find(([c]) => c === a)?.[1];
  if (o) {
    const c = Xe(s, o);
    if (c) return He(c, t);
  }
  const l = /^metric(\d+)$/.exec(a);
  if (l) {
    const c = Qs(s, "metric")[Number(l[1]) - 1];
    if (c) return He(c, t);
  }
}
function er(e) {
  return (e.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).map((t) => t.charAt(0)).join("");
}
const ms = /^[a-z_][\w.-]*$/;
function tr(e) {
  const t = (e.key ?? e.field)?.toLowerCase();
  if (t !== void 0) return ms.test(t) ? t : void 0;
  const n = e.label === void 0 ? void 0 : At(e.label);
  return n !== void 0 && ms.test(n) ? n : void 0;
}
function Hl(e, t) {
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
  return n ? ot(a) : e;
}
function nr(e, t) {
  if (!(!e || Hl(e, t)))
    return (t.columns ?? []).find(
      (n) => n.label !== void 0 && er(n.label) === e
    );
}
function Wl(e, t) {
  if (!t || e.label === void 0 || !tr(e)) return;
  const n = er(e.label);
  return nr(n, t) === e ? n : void 0;
}
function Gn(e, t) {
  const n = e.toLowerCase(), a = t.toLowerCase();
  if (!a.includes("*")) return n.includes(a);
  const s = a.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(s).test(n);
}
function gs(e, t) {
  return e.toLowerCase() === t.toLowerCase();
}
function Ul(e, t, n) {
  if (e.kind === "text") {
    const i = n.columns ?? [];
    return ["identity", "reference"].some((o) => {
      const l = Xe(i, o), c = l ? He(l, t) : void 0;
      return typeof c == "string" && Gn(c, e.value);
    });
  }
  const a = Kl(e.field, t, n);
  if (a === void 0) return null;
  if (Array.isArray(a))
    return e.comparator === ":" || e.comparator === "=" ? a.some(
      (o) => e.comparator === "=" ? gs(String(o), e.value) : Gn(String(o), e.value)
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
    return e.comparator === "=" ? gs(String(a), e.value) : Gn(String(a), e.value);
  }
  const s = Number(e.value), r = typeof a == "number" ? a : Number(a);
  return !Number.isFinite(s) || !Number.isFinite(r) ? null : jl(e.comparator, r, s);
}
function _s(e, t, n) {
  const a = Ul(e, t, n);
  return a === null ? !0 : e.negated ? !a : a;
}
function jl(e, t, n) {
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
function ys(e) {
  return e.kind === "field" && !e.negated && (e.comparator === ":" || e.comparator === "=");
}
function Gl(e, t, n) {
  return e.length ? e.some((a) => {
    const s = /* @__PURE__ */ new Map();
    for (const r of a)
      ys(r) && s.set(r.field, (s.get(r.field) ?? !1) || _s(r, t, n));
    return a.every(
      (r) => ys(r) ? s.get(r.field) === !0 : _s(r, t, n)
    );
  }) : !0;
}
function ws(e) {
  return /[\s"']/.test(e) ? `"${e.replace(/["']/g, "")}"` : e;
}
function tn(e) {
  const t = e.negated ? "-" : "";
  return e.kind === "text" ? t + ws(e.value) : `${t}${e.field}${e.comparator}${ws(e.value)}`;
}
function Xl(e) {
  if (!e.negated) return { ...e, negated: !0 };
  const { negated: t, ...n } = e;
  return n;
}
function ot(e) {
  return e.filter((t) => t.length).map((t) => t.map(tn).join(" ")).join(" OR ");
}
function Yl(e, t, n) {
  return e.map((a, s) => s === t ? a.filter((r, i) => i !== n) : a).filter((a) => a.length);
}
function Ql(e) {
  const t = Ne(e);
  if (t.length > 1) return { parts: [], text: e.trim() };
  const n = t[0] ?? [];
  return {
    parts: n.filter((a) => a.kind === "field"),
    text: n.filter((a) => a.kind === "text").map(tn).join(" ")
  };
}
function ks(e, t) {
  return [...e.map(tn), t.trim()].filter(Boolean).join(" ");
}
const bs = (e, t) => e.toLowerCase() === t.toLowerCase();
function da(e, t) {
  return !!e.negated == !!t.negated && ar(e, t);
}
function Zl(e, t) {
  return !!e.negated != !!t.negated && ar(e, t);
}
function ar(e, t) {
  return e.kind === "field" ? t.kind === "field" && e.field === t.field && e.comparator === t.comparator && bs(e.value, t.value) : t.kind === "text" && bs(e.value, t.value);
}
function Jl(e, t) {
  return t.filter((n) => !e.some((a) => da(a, n)));
}
function Ra(e, t) {
  return sr(e, t, (n) => n);
}
function fa(e, t) {
  return sr(
    e,
    t,
    (n, a) => n.filter((s) => !a.some((r) => Zl(s, r)))
  );
}
const eo = /^[A-Za-z_][\w.-]*\s*(?:>=|<=|:|=|>|<)$/;
function to(e) {
  return ot(
    Ne(e).map(
      (t) => t.filter(
        (n) => n.kind !== "text" || n.value !== "-" && !eo.test(n.value)
      )
    ).filter((t) => t.length > 0)
  );
}
function sr(e, t, n) {
  const a = Ne(e), s = Ne(t);
  return a.length ? s.length ? ot(
    a.flatMap(
      (r) => s.map((i) => [...n(r, i), ...Jl(r, i)])
    )
  ) : ot(a) : ot(s);
}
const $s = [
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
const no = 7, ao = 3;
function so(e, t, n, a) {
  const s = (t * no + mn(n)) % a, r = [];
  for (let i = 0; i < Math.min(ao, a); i++)
    r.push(rr(e, (s + i) % a));
  return r;
}
function ro(e, t) {
  switch (e.kind) {
    case "chips":
      return e.multiple ? lo(e.options, t) : e.options[t % e.options.length] ?? "";
    case "range": {
      const n = Math.max(0, e.max - e.min);
      return e.min + (n === 0 ? 0 : t % (n + 1));
    }
    case "toggle":
      return t % 3 === 0;
  }
}
function lo(e, t) {
  if (!e.length) return [];
  const n = 1 + (t >> 5) % Math.min(3, e.length), a = t % e.length, s = /* @__PURE__ */ new Set();
  for (let r = 0; r < n; r++) s.add((a + r) % e.length);
  return [...s].sort((r, i) => r - i).map((r) => e[r]);
}
function oo(e, t) {
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
      return $s[n % $s.length];
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
function io(e, t = {}) {
  const n = t.population ?? 48, a = t.seed ?? "", s = t.now ?? /* @__PURE__ */ new Date("2026-08-25T00:00:00Z"), r = e.samples, i = t.scopes ?? [];
  if (!r.length) return [];
  const o = [];
  for (let l = 0; l < n; l++) {
    const c = r[l % r.length], d = Math.floor(l / r.length), h = mn(`${a}:${e.key}:${c[0]}:${l}`), k = rr(e.key, l), _ = new Date(s.getTime() - h % 900 * 36e5).toISOString(), y = {};
    for (const b of e.columns ?? []) {
      const M = b.field ?? b.key;
      if (!M || b.value) continue;
      const w = oo(b, {
        hash: mn(`${h}:${M}`),
        sample: c,
        revision: d,
        updatedAt: _
      });
      w !== void 0 && (y[M] = w);
    }
    for (const b of e.facets)
      y[b.key] = ro(b, mn(`${h}:${b.key}`));
    for (const [b, M] of i)
      y[b] = M === e.key ? k : so(M, l, b, n);
    o.push({ id: k, entityKey: e.key, entityLabel: e.label, fields: y });
  }
  return o;
}
function co(e, t) {
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
function uo(e, t) {
  const n = e.find((i) => i.sort === t);
  if (!n) return () => 0;
  const a = n.kind ?? "text", s = a === "number" || n.role === "metric", r = a === "date" || n.role === "updated";
  return (i, o) => {
    const l = He(n, i), c = He(n, o);
    return s ? Number(c ?? 0) - Number(l ?? 0) : r ? Date.parse(String(c ?? "")) - Date.parse(String(l ?? "")) : String(c ?? "").localeCompare(String(l ?? ""));
  };
}
function fo(e = {}) {
  const t = /* @__PURE__ */ new Map(), n = (a, s) => {
    const r = t.get(a.key);
    if (r) return r;
    const i = e.scopes ?? s.entities.flatMap(
      (l) => l.scope ? [[l.scope, l.key]] : []
    ), o = io(a, { ...e, scopes: i });
    return t.set(a.key, o), o;
  };
  return {
    query({ query: a, schema: s, entity: r, limit: i, offset: o }) {
      const l = Ne(a.expr), c = r ? [r] : s.entities, d = [], h = [];
      for (const y of c)
        for (const b of n(y, s))
          d.push(b), (r ? co(b, a.facets) : !0) && Gl(l, b, y) && h.push(b);
      const k = dt(r, a.sort, s), _ = h.sort(uo(Us(r, s), k.key));
      return a.dir === "asc" && _.reverse(), {
        // One page out of the middle. `total` stays the whole match, which is
        // what the shell counts pages with.
        rows: _.slice(o, o + i),
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
  if (e.kind !== "field" || t.kind !== "field") return da(e, t);
  const n = (a) => a.comparator === ":" || a.comparator === "=";
  return da(e, { ...t, comparator: n(e) && n(t) ? e.comparator : t.comparator });
}
function Cn(e, t) {
  return Ln(e, Xl(t));
}
function Wt(e, t) {
  return zn(
    e.entities.find((n) => n.key === t.entityKey),
    t
  );
}
function za(e, t) {
  if (!t) return e;
  const n = e.trim();
  if (!n) return t;
  const [a] = Ne(t).flat();
  if (!a) return n;
  const s = Ne(n);
  return s.some((o) => o.some((l) => Ln(l, a))) ? n : s.some((o) => o.some((l) => Cn(l, a))) ? ot(
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
function La(e, t) {
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
  return s.every((r, i) => r.length === a[i]?.length) ? e : ot(s);
}
function pa(e, t, n) {
  return t ? n === null ? ir(e, t) : za(e, n === "out" ? or(t) : t) : e;
}
function cr(e) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0;
}
function In(e) {
  return e.altKey ? { exclude: !0 } : {};
}
function Xn(e, t, n, a = {}) {
  const s = Wt(e, n);
  return za(t.expr, a.exclude ? or(s) : s);
}
function ur(e, t) {
  const n = e?.scope?.toLowerCase();
  if (!n || e?.keepsScope || !t.trim()) return t;
  const a = Ne(t), s = a.map(
    (r) => r.filter((i) => i.kind !== "field" || i.field !== n)
  );
  return s.every((r, i) => r.length === a[i]?.length) ? t : ot(s);
}
function dr(e, t) {
  const n = t.toLowerCase();
  return e.entities.find((a) => a.scope?.toLowerCase() === n) ?? null;
}
const fr = Symbol("dc.shellContext");
function po(e) {
  const t = e.liveQuery ? e : vo(e);
  return Ma(fr, t), t;
}
function vo(e) {
  const t = e.draft ?? H("");
  return {
    draft: t,
    liveQuery: e.query,
    drafting: v(() => !1),
    commitDraft() {
      const n = t.value.trim();
      n && (e.setExpression(
        fa(e.query.value.expr, Mn(n, e.entity.value))
      ), t.value = "");
    },
    abandonDraft() {
      t.value = "";
    },
    ...e
  };
}
function $e() {
  const e = It(fr, null);
  if (!e)
    throw new Error(
      "[header-content-layout] No shell context found. Render this component inside <DataShell>."
    );
  return e;
}
const Ia = "e", Na = "v", Fa = "s", Oa = "d", Da = "q", Ba = "p", qa = "f_", pr = "*", ho = [
  Ia,
  Na,
  Fa,
  Oa,
  Da,
  Ba
], va = "..", vr = ",", mo = [
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
function Yn(e) {
  let t = encodeURIComponent(e);
  for (const [n, a] of mo) t = t.replace(n, a);
  return t;
}
function lt(e) {
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
    n.push([lt(r), i]);
  }
  return n;
}
function go(e) {
  return ho.includes(e) || e.startsWith(qa);
}
function xs(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function _o(e, t) {
  const n = lt(t);
  switch (e.kind) {
    case "chips": {
      const a = new Set(
        n.split(vr).map((r) => r.trim()).filter(Boolean)
      );
      return { kind: "chips", selected: e.options.filter((r) => a.has(r)) };
    }
    case "range": {
      const a = n.indexOf(va), s = (a === -1 ? n : n.slice(0, a)).trim(), r = (a === -1 ? "" : n.slice(a + va.length)).trim(), i = s === "" ? null : Number(s), o = r === "" ? null : Number(r);
      let l = i !== null && Number.isFinite(i) ? xs(i, e.min, e.max) : null, c = o !== null && Number.isFinite(o) ? xs(o, e.min, e.max) : null;
      return l !== null && c !== null && l > c && ([l, c] = [c, l]), { kind: "range", min: l, max: c };
    }
    case "toggle":
      return { kind: "toggle", on: n === "1" || n === "true" };
  }
}
function yo(e, t) {
  switch (e.kind) {
    case "chips":
      return e.selected.length ? (t.kind === "chips" ? t.options.filter((a) => e.selected.includes(a)) : e.selected).join(vr) : null;
    case "range":
      return e.min === null && e.max === null ? null : `${e.min ?? ""}${va}${e.max ?? ""}`;
    case "toggle":
      return e.on ? "1" : null;
  }
}
function wo(e, t, n = {}) {
  const a = Aa(t, n), s = new Map(hr(e)), r = s.get(Ia), i = r === void 0 ? a.entity : lt(r), o = i === pr ? null : Et(t, i), l = s.get(Na), c = l && Hs(lt(l)) ? lt(l) : Yt(o?.key ?? null, n), d = s.get(Fa), h = dt(o, d ? lt(d) : n.sort, t), k = s.get(Oa), _ = k ? lt(k) === "asc" ? "asc" : "desc" : a.dir, y = s.get(Da), b = s.get(Ba), M = b === void 0 ? 1 : Number(lt(b)), w = Number.isFinite(M) ? Math.max(1, Math.floor(M)) : 1, S = {};
  for (const L of o?.facets ?? []) {
    const x = s.get(`${qa}${L.key}`);
    S[L.key] = x === void 0 ? Sa(L) : _o(L, x);
  }
  return {
    entity: o?.key ?? null,
    view: c,
    sort: h.key,
    dir: _,
    expr: y === void 0 ? "" : lt(y),
    facets: Ys(o, S),
    page: w
  };
}
function Qn(e, t, n = {}, a = "") {
  const s = Aa(t, n), r = Et(t, e.entity), i = hr(a).filter(([h]) => !go(h)), o = [], l = (h, k) => o.push([h, Yn(k)]), c = r?.key ?? null;
  c !== s.entity && l(Ia, c ?? pr), e.view !== Yt(c, n) && l(Na, e.view), e.sort !== s.sort && l(Fa, e.sort), e.dir !== s.dir && l(Oa, e.dir), e.expr.trim() !== "" && l(Da, e.expr);
  for (const h of r?.facets ?? []) {
    const k = e.facets[h.key];
    if (!k) continue;
    const _ = yo(k, h);
    _ !== null && o.push([`${qa}${h.key}`, Yn(_)]);
  }
  e.page > 1 && l(Ba, String(e.page));
  const d = [
    ...i.map(([h, k]) => [Yn(h), k]),
    ...o
  ];
  return d.length ? `?${d.map(([h, k]) => k === "" ? h : `${h}=${k}`).join("&")}` : "";
}
const Sn = "entity", Qt = "expr";
function ko(e, t) {
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
function Va(e, t) {
  const n = [];
  t && n.push({
    id: Sn,
    label: `entity:${t.key}`,
    facetKey: Sn
  });
  for (const a of t?.facets ?? []) {
    const s = e.facets[a.key];
    s && Gs(s) && n.push(...ko(a, s));
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
function bo(e, t, n = null) {
  if (Pa(e)) {
    const r = dt(t, e.sort, n);
    return `everything · ${e.view} · ${r.label}`;
  }
  const a = Va(e, t).filter((r) => r.facetKey !== Qt).map((r) => r.label), s = e.expr.trim();
  return s && a.push(`"${s}"`), a.join(" · ");
}
function $o(e) {
  const { adapter: t } = e, n = v(() => Pt(e.schema)), a = v(() => Pt(e.defaults) ?? {}), s = v(() => wo(t.search.value, n.value, a.value)), r = v(() => Et(n.value, s.value.entity)), i = v(() => r.value ?? Ws(n.value, a.value)), o = v(() => js(r.value, n.value)), l = v(() => dt(r.value, s.value.sort, n.value)), c = (w, S) => {
    const L = Qn(w, n.value, a.value, t.search.value);
    return L === t.search.value ? !1 : (S === "push" ? t.push(L) : t.replace(L), !0);
  }, d = () => Pt(e.navigationMode) ?? "push", h = () => Pt(e.facetNavigationMode) ?? "replace", k = (w, S) => {
    const L = w.page ?? (jn(w) ? 1 : s.value.page);
    return c({ ...s.value, ...w, page: L }, S);
  }, _ = (w) => {
    const S = w.page ?? (jn(w) ? 1 : s.value.page), L = Qn({ ...s.value, ...w, page: S }, n.value, a.value, t.search.value);
    return t.href ? t.href(L) : `${t.path.value}${L}`;
  }, y = (w, S) => {
    const L = s.value.facets[w];
    if (!L) return;
    const x = { ...s.value.facets, [w]: S(L) };
    k({ facets: x }, h());
  }, b = (w) => {
    const S = w === null ? null : Et(n.value, w);
    return (S?.key ?? null) === s.value.entity ? {} : {
      entity: S?.key ?? null,
      view: fs(s.value.view, s.value.entity, S?.key ?? null, a.value),
      sort: dt(S, s.value.sort, n.value).key,
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
    summary: v(() => bo(s.value, r.value, n.value)),
    terms: v(() => Va(s.value, r.value)),
    isPristine: v(() => Pa(s.value)),
    isEverything: v(() => s.value.entity === null),
    hasFacets: v(() => Xs(s.value.facets)),
    setEntity: M,
    entityHref: (w) => _(b(w)),
    clearEntity: () => M(null),
    setView(w) {
      k({ view: w }, d());
    },
    setSort(w) {
      k({ sort: dt(r.value, w, n.value).key }, d());
    },
    toggleDirection() {
      k({ dir: s.value.dir === "desc" ? "asc" : "desc" }, d());
    },
    setExpression(w) {
      return k({ expr: w }, d());
    },
    narrow(w, S, L) {
      return k({ expr: w, ...b(S), ...L ? { view: L } : {} }, d());
    },
    narrowHref(w, S, L) {
      return _({ expr: w, ...b(S), ...L ? { view: L } : {} });
    },
    setPage(w, S) {
      k({ page: Math.max(1, Math.floor(w)) }, S ?? d());
    },
    setFacet(w, S) {
      y(w, () => S);
    },
    toggleChip(w, S) {
      y(w, (L) => L.kind !== "chips" ? L : { kind: "chips", selected: L.selected.includes(S) ? L.selected.filter((E) => E !== S) : [...L.selected, S] });
    },
    setRange(w, S, L) {
      y(w, (x) => x.kind === "range" ? { kind: "range", min: S, max: L } : x);
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
        const S = Yl(Ne(s.value.expr), w.group ?? 0, w.index ?? 0);
        k({ expr: ot(S) }, d());
        return;
      }
      y(w.facetKey, (S) => S.kind === "chips" && w.option ? { kind: "chips", selected: S.selected.filter((L) => L !== w.option) } : S.kind === "range" ? { kind: "range", min: null, max: null } : S.kind === "toggle" ? { kind: "toggle", on: !1 } : S);
    },
    clearFilters() {
      k({ ...b(null), expr: "", facets: Ft(null) }, d());
    },
    reset() {
      c(Aa(n.value, a.value), d());
    },
    hrefFor(w) {
      const S = { ...s.value, ...w };
      return "entity" in w && !("view" in w) && (S.view = fs(s.value.view, s.value.entity, S.entity, a.value)), S.page = w.page ?? (jn(w) ? 1 : s.value.page), S.facets = Ys(Et(n.value, S.entity), S.facets), `${t.path.value}${Qn(S, n.value, a.value, t.search.value)}`;
    }
  };
}
function xo(e) {
  const t = wt([]), n = H(0), a = H(!1), s = H(!1), r = wt(null);
  let i = 0, o = null, l = null;
  const c = v(() => (e.query.value.page - 1) * e.limit.value), d = v(() => Tl(n.value, e.limit.value)), h = () => {
    const x = e.query.value, E = e.within?.value.trim(), D = ur(e.entity.value, x.expr);
    return E ? { ...x, expr: Ra(E, D) } : D === x.expr ? x : { ...x, expr: D };
  }, k = (x, E) => {
    t.value = x.rows, n.value = x.total, r.value = null, _(E);
  }, _ = (x) => {
    o = { key: x, total: n.value }, s.value = !1;
  }, y = (x) => {
    r.value = x, t.value = [], n.value = 0, o = null, s.value = !1;
  }, b = (x, E, D, P) => {
    let z = !0;
    const T = () => x === i;
    let K = 0, W = !1;
    const j = (le) => {
      K = le, W = !0, P === void 0 && (n.value = le);
    }, de = () => {
      z && (z = !1, t.value = [], j(0)), r.value = null;
    };
    return {
      get open() {
        return T();
      },
      insert(le, Ae) {
        if (!T()) return;
        const $ = Array.isArray(le) ? le : [le];
        if (!$.length) return;
        de();
        const B = [...t.value];
        B.splice(Ae ?? B.length, 0, ...$), t.value = E > 0 ? B.slice(0, E) : B, j(K + $.length);
      },
      set(le) {
        T() && (le.rows && (de(), t.value = E > 0 ? le.rows.slice(0, E) : le.rows, j(le.rows.length)), le.total !== void 0 && j(le.total));
      },
      close() {
        T() && (a.value = !1, W && (n.value = K), _(D));
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
    const E = S.value, D = o?.key === E ? o.total : void 0;
    s.value = D === void 0;
    const P = {
      query: h(),
      schema: e.schema.value,
      entity: e.entity.value,
      limit: e.limit.value,
      offset: c.value
    }, z = e.source.value;
    if (z.stream) {
      a.value = !0;
      try {
        l = z.stream(P, b(x, P.limit, E, D)) ?? null;
      } catch (K) {
        y(K), a.value = !1;
      }
      return;
    }
    let T;
    try {
      T = z.query(P);
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
    return `${e.entity.value?.key ?? e.schema.value.entities[0]?.key ?? ""}|${JSON.stringify(Ta.map((D) => x[D]))}`;
  }), L = v(() => `${S.value}|${e.query.value.page}`);
  return we([e.source, L, e.limit], w, {
    immediate: !0
  }), Zt(() => {
    i++, M();
  }, !0), { rows: t, total: n, offset: c, pageCount: d, pending: a, counting: s, error: r, refresh: w };
}
const Mo = 150;
function Co(e) {
  const t = e.delay ?? Mo, n = H(""), a = H("");
  let s = !1, r;
  const i = () => {
    clearTimeout(r), r = void 0;
  }, o = v(() => Mn(to(a.value), e.entity.value)), l = v(() => o.value.trim() !== ""), c = v(
    () => JSON.stringify([o.value, ...Ta.map((_) => e.query.value[_])])
  ), d = wt(null), h = v(() => {
    const _ = e.query.value;
    if (!l.value) return _;
    const y = d.value?.of === c.value ? d.value.page : 1;
    return { ..._, expr: fa(_.expr, o.value), page: y };
  });
  we(n, (_) => {
    if (i(), !_.trim()) {
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
  const k = (_) => {
    i(), s = !0, n.value = "", !_() && s && (s = !1, a.value = "");
  };
  return An() && Zt(i), {
    text: n,
    live: h,
    drafting: l,
    setPage(_) {
      d.value = { of: c.value, page: Math.max(1, Math.floor(_)) };
    },
    commit() {
      const _ = n.value.trim();
      if (!_) return;
      const y = fa(
        e.query.value.expr,
        Mn(_, e.entity.value)
      );
      a.value = _, k(() => e.setExpression(y));
    },
    abandon() {
      i(), s = !1, n.value = "", a.value = "";
    },
    release: k
  };
}
const Ut = (e) => e.separator !== !0 && e.heading !== !0 && e.disabled !== !0, So = ["aria-label"], Po = ["role", "aria-label"], Eo = ["data-dc-item"], Ao = {
  key: 0,
  class: "dc-menu__rule",
  role: "separator"
}, To = ["role", "aria-checked", "aria-haspopup", "aria-expanded", "aria-disabled", "disabled", "data-dc-item", "onClick", "onMouseenter"], Ro = {
  class: "dc-menu__mark",
  "aria-hidden": "true"
}, zo = { class: "dc-menu__label dc-truncate" }, Lo = {
  key: 0,
  class: "dc-menu__key dc-mono"
}, Io = {
  key: 1,
  class: "dc-menu__more",
  "aria-hidden": "true"
}, No = /* @__PURE__ */ oe({
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
      () => a.items.flatMap((P, z) => Ut(P) ? [z] : [])
    ), k = v(() => {
      const P = [{ entries: [] }];
      return a.items.forEach((z, T) => {
        z.heading ? P.push({ heading: z, entries: [] }) : P[P.length - 1]?.entries.push({ item: z, index: T });
      }), P.filter((z) => z.entries.length > 0);
    }), _ = H({ x: a.at.x, y: a.at.y });
    async function y() {
      _.value = { x: a.at.x, y: a.at.y }, await Nt();
      const P = r.value?.getBoundingClientRect();
      if (!P) return;
      const z = 8;
      let T = a.at.x, K = a.at.y;
      if (T + P.width > window.innerWidth - z) {
        const W = a.at.mirrorX === void 0 ? null : a.at.mirrorX - P.width;
        T = W !== null && W >= z ? W : window.innerWidth - P.width - z;
      }
      K + P.height > window.innerHeight - z && (K = window.innerHeight - P.height - z), _.value = { x: Math.max(z, T), y: Math.max(z, K) };
    }
    const b = v(() => ({ left: `${_.value.x}px`, top: `${_.value.y}px` }));
    function M(P) {
      o.value = P, P !== null && Nt(() => i.value[P]?.focus());
    }
    function w(P, z) {
      const T = h.value;
      if (T.length === 0) return null;
      if (P === null) return z === 1 ? T[0] ?? null : T[T.length - 1] ?? null;
      const K = T.indexOf(P);
      return K === -1 ? T[0] ?? null : T[(K + z + T.length) % T.length] ?? null;
    }
    function S(P, z) {
      if (!a.items[P]?.items?.length) return;
      const K = i.value[P]?.getBoundingClientRect(), W = r.value?.getBoundingClientRect();
      !K || !W || (c.value = { x: W.right - 4, y: K.top - 4, mirrorX: W.left + 4 }, l.value = P, d.value = z);
    }
    function L(P) {
      const z = l.value;
      l.value = null, c.value = null, P && z !== null && M(z);
    }
    function x(P) {
      const z = a.items[P];
      if (!(!z || !Ut(z))) {
        if (z.items?.length) {
          S(P, !0);
          return;
        }
        s("choose", z);
      }
    }
    function E(P) {
      const z = P.key;
      if (z === "Escape") {
        P.preventDefault(), P.stopPropagation(), l.value !== null ? L(!0) : s("dismiss");
        return;
      }
      if (z === "ArrowDown" || z === "ArrowUp") {
        P.preventDefault(), P.stopPropagation(), L(!1), M(w(o.value, z === "ArrowDown" ? 1 : -1));
        return;
      }
      if (z === "Home" || z === "End") {
        P.preventDefault(), P.stopPropagation(), L(!1), M(w(null, z === "Home" ? 1 : -1));
        return;
      }
      if (z === "ArrowRight") {
        const T = o.value;
        T !== null && a.items[T]?.items?.length && (P.preventDefault(), P.stopPropagation(), S(T, !0));
        return;
      }
      if (z === "ArrowLeft") {
        l.value !== null && (P.preventDefault(), P.stopPropagation(), L(!0));
        return;
      }
      if (z === "Enter" || z === " ") {
        const T = o.value;
        if (T === null) return;
        P.preventDefault(), P.stopPropagation(), x(T);
      }
    }
    function D(P) {
      const z = a.items[P];
      !z || !Ut(z) || (l.value !== null && l.value !== P && L(!1), M(P), z.items?.length && S(P, !1));
    }
    return Bs(() => {
      y(), a.autofocus && M(w(null, 1));
    }), we(() => a.at, y, { deep: !0 }), we(() => a.items, () => void y(), { deep: !0 }), Ue(() => {
      l.value = null;
    }), t({ root: r }), (P, z) => {
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
          }, F(K.heading.label), 9, Eo)) : I("", !0),
          (f(!0), m(ne, null, me(K.entries, ({ item: j, index: de }) => (f(), m(ne, {
            key: j.id ?? `${de}-${j.label ?? ""}`
          }, [
            j.separator ? (f(), m("div", Ao)) : (f(), m("button", {
              key: 1,
              ref_for: !0,
              ref: (le) => {
                le && (i.value[de] = le);
              },
              type: "button",
              class: "dc-menu__item",
              role: j.checked === void 0 ? "menuitem" : "menuitemcheckbox",
              "aria-checked": j.checked === void 0 ? void 0 : j.checked,
              "aria-haspopup": j.items?.length ? "menu" : void 0,
              "aria-expanded": j.items?.length ? l.value === de : void 0,
              "aria-disabled": j.disabled ? "true" : void 0,
              disabled: j.disabled,
              "data-dc-item": j.id,
              tabindex: "-1",
              onClick: (le) => x(de),
              onMouseenter: (le) => D(de)
            }, [
              C("span", Ro, F(j.checked ? "✓" : ""), 1),
              C("span", zo, F(j.label), 1),
              j.shortcut ? (f(), m("span", Lo, F(j.shortcut), 1)) : j.items?.length ? (f(), m("span", Io, "›")) : I("", !0)
            ], 40, To))
          ], 64))), 128))
        ], 8, Po))), 128)),
        l.value !== null && c.value ? (f(), Z(T, {
          key: l.value,
          items: e.items[l.value]?.items ?? [],
          at: c.value,
          label: e.items[l.value]?.label,
          autofocus: d.value,
          onChoose: z[0] || (z[0] = (K) => s("choose", K)),
          onDismiss: z[1] || (z[1] = (K) => L(!0))
        }, null, 8, ["items", "at", "label", "autofocus"])) : I("", !0)
      ], 44, So);
    };
  }
}), pe = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [a, s] of t)
    n[a] = s;
  return n;
}, Ka = /* @__PURE__ */ pe(No, [["__scopeId", "data-v-9b1413fa"]]), Fo = { class: "dc-pick" }, Oo = ["id"], Do = ["id", "aria-expanded", "aria-labelledby", "data-dc-value"], Bo = { class: "dc-pick__label" }, qo = /* @__PURE__ */ oe({
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
    ), _ = v(
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
    }), Ue(() => window.removeEventListener("pointerdown", S, !0));
    function L(x) {
      b(!0), !(x.id === void 0 || x.id === n.modelValue) && a("update:modelValue", x.id);
    }
    return (x, E) => (f(), m("span", Fo, [
      C("span", {
        id: `${A(s)}-name`,
        class: "dc-pick__name"
      }, F(e.label), 9, Oo),
      C("button", {
        id: `${A(s)}-value`,
        ref_key: "trigger",
        ref: r,
        type: "button",
        class: ft(["dc-pick__button", { "dc-mono": e.mono }]),
        "aria-haspopup": "menu",
        "aria-expanded": c.value,
        "aria-labelledby": `${A(s)}-name ${A(s)}-value`,
        "data-dc-value": e.modelValue,
        onClick: M,
        onKeydown: w
      }, [
        C("span", Bo, F(h.value?.label), 1)
      ], 42, Do),
      E[1] || (E[1] = C("span", {
        class: "dc-pick__mark",
        "aria-hidden": "true"
      }, "▾", -1)),
      o.value && d.value ? (f(), Z(bl, {
        key: 0,
        to: d.value
      }, [
        ue(Ka, {
          ref_key: "menu",
          ref: i,
          class: "dc-pick__list",
          style: Ee(_.value),
          items: k.value,
          at: o.value,
          label: e.label,
          autofocus: l.value,
          onChoose: L,
          onDismiss: E[0] || (E[0] = (D) => b(!0))
        }, null, 8, ["style", "items", "at", "label", "autofocus"])
      ], 8, ["to"])) : I("", !0)
    ]));
  }
}), Ms = /* @__PURE__ */ pe(qo, [["__scopeId", "data-v-d21ebf1b"]]);
function Vo(e) {
  const t = wt(/* @__PURE__ */ new Map()), n = H(!0);
  let a = 0, s;
  const r = () => {
    a++, s?.abort(), s = void 0;
  }, i = () => {
    r();
    const o = a, { signal: l } = s = new AbortController(), c = e.query.value, d = e.schema.value, h = e.entities.value, k = e.within?.value.trim() ?? "";
    n.value = c.expr.trim() === "" && !k;
    const _ = /* @__PURE__ */ new Map();
    let y = !0;
    for (const b of h) {
      const M = ur(b, c.expr), w = k ? Ra(k, M) : M;
      let S = !1;
      const L = (E) => {
        if (o !== a) return;
        if (y) {
          _.set(b.key, E);
          return;
        }
        const D = new Map(t.value);
        D.set(b.key, E), t.value = D;
      }, x = e.source.value.query({
        query: { ...c, entity: b.key, expr: w, facets: Ft(b), page: 1 },
        schema: d,
        entity: b,
        limit: 0,
        offset: 0,
        signal: l,
        progress: (E) => {
          S || L({ total: E, pending: !0, counted: !0 });
        }
      });
      x instanceof Promise ? (_.has(b.key) || _.set(b.key, { total: 0, pending: !0, counted: !1 }), x.then((E) => {
        S = !0, L({ total: E.total, pending: !1, counted: !0 });
      })) : (S = !0, _.set(b.key, { total: x.total, pending: !1, counted: !0 }));
    }
    y = !1, t.value = _;
  };
  return An() && Zt(r), { counts: t, pristine: n, refresh: i, cancel: r };
}
const Ko = 25, mr = (e, t) => e.toLowerCase() === t.toLowerCase();
function Ho(e, t) {
  return e.find((n) => mr(n.id, t));
}
function Wo(e) {
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
        sort: dt(l, d.sort, e.schema.value).key,
        page: 1
      },
      schema: e.schema.value,
      entity: l,
      limit: Ko,
      offset: 0
    });
  }, r = (o, l) => {
    const c = gn(Xe(o.columns ?? [], "identity"), l);
    return c === ca || mr(c, l.id) ? "" : c;
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
      d.forEach((k, _) => {
        const { reference: y } = l[_], b = Ho(k.rows, y.id);
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
const Uo = ["data-dc-expanded"], jo = { class: "dc-header__domain" }, Go = {
  key: 0,
  class: "dc-header__within"
}, Xo = ["title"], Yo = ["data-dc-more", "title"], Qo = {
  key: 0,
  class: "dc-header__or dc-mono",
  "aria-hidden": "true"
}, Zo = ["title", "aria-label", "onClick"], Jo = ["onKeydown"], ei = ["aria-expanded", "aria-controls"], ti = {
  class: "dc-header__chevron",
  "aria-hidden": "true"
}, ni = { class: "dc-header__sr" }, ai = {
  key: 0,
  class: "dc-header__pages",
  "aria-label": "Pages"
}, si = ["disabled"], ri = ["title"], li = ["value", "onKeydown"], oi = {
  class: "dc-header__page-total",
  "aria-hidden": "true"
}, ii = {
  class: "dc-header__sr",
  "aria-live": "polite"
}, ci = ["disabled"], ui = {
  key: 1,
  class: "dc-header__actions"
}, di = "…", fi = /* @__PURE__ */ oe({
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
    const n = e, a = t, s = $e(), r = v(() => s.schema.value), i = v(
      () => s.hasFacets.value || !!s.liveQuery.value.expr.trim() || !!s.within.value
    ), o = v(() => r.value.formatCount ?? Mt), l = Vo({
      source: s.source,
      schema: s.schema,
      // What each type holds of what is on screen, the draft's results included:
      // a count of the committed query would disagree with the rows under it.
      query: s.liveQuery,
      entities: s.entities,
      within: s.within
    });
    function c(V) {
      if (n.hideCount) return V.count;
      if (V.key === s.query.value.entity && i.value) return o.value(s.total.value);
      if (l.pristine.value) return V.count;
      const G = l.counts.value.get(V.key);
      return G ? G.counted ? `${G.pending ? "~" : ""}${o.value(G.total)}` : di : V.count;
    }
    function d(V) {
      return `${V.label} · ${c(V)}`;
    }
    const h = v(() => [
      { key: "", label: "Everything" },
      ...s.entities.value.map((V) => ({ key: V.key, label: d(V) }))
    ]), k = v(() => {
      const V = s.within.value.trim();
      return V ? Va({ ...s.query.value, expr: V, facets: {} }, null) : [];
    }), _ = v(
      () => (n.views ?? [...Ks]).map((V) => ({ key: V, label: El[V] }))
    ), y = v(() => Rn(s.query.value.view, n.views)), b = v(() => _.value.length > 1), M = v(() => s.query.value.entity !== null);
    function w(V) {
      s.setView(V);
    }
    const S = v(() => {
      const V = s.entity.value, X = V?.keepsScope ? void 0 : V?.scope?.toLowerCase();
      return s.terms.value.filter((G) => G.facetKey !== Sn).map((G, De, Bt) => {
        const q = Bt[De - 1];
        return {
          term: G,
          or: q?.group !== void 0 && G.group !== void 0 && G.group !== q.group,
          idle: !!X && G.field?.toLowerCase() === X
        };
      });
    }), L = Wo({
      source: s.source,
      schema: s.schema,
      query: s.query,
      // The scope's parts as well as the query's: it names a record more often
      // than a typed term does, being what a record's own page is built on.
      terms: v(() => [...k.value, ...s.terms.value])
    });
    function x(V) {
      return dr(r.value, V)?.scopeLabel ?? V;
    }
    function E(V) {
      return V.replace(/\s*\([^()]*\)\s*$/, "");
    }
    function D(V) {
      const X = L.nameOf(V);
      return X ? `${V.negated ? "-" : ""}${x(V.field)}: ${E(X)}` : V.label;
    }
    function P(V) {
      s.setEntity(V || null);
    }
    const z = H(null);
    function T() {
      s.abandonDraft(), z.value?.blur();
    }
    function K(V) {
      if (s.draft.value) return;
      const X = S.value.at(-1);
      X && (V.preventDefault(), s.removeTerm(X.term));
    }
    function W(V) {
      V.target?.closest("button, select, label, input") || a("toggle");
    }
    const j = H(null), de = H("");
    function le() {
      const V = j.value;
      if (!V) {
        de.value = "";
        return;
      }
      const X = V.scrollLeft > 1, G = V.scrollWidth - V.clientWidth - V.scrollLeft > 1;
      de.value = X && G ? "both" : X ? "start" : G ? "end" : "";
    }
    let Ae = null;
    we(
      j,
      (V) => {
        Ae?.disconnect(), Ae = null, le(), !(!V || typeof ResizeObserver > "u") && (Ae = new ResizeObserver(le), Ae.observe(V));
      },
      { flush: "post" }
    ), we(S, le, { flush: "post" }), Ue(() => Ae?.disconnect());
    const $ = v(() => s.liveQuery.value.page), B = v(
      () => (s.pageCount.value > 1 || !!n.pagesNote) && !Ea(s.query.value, n.views)
    ), ie = v(
      () => `${s.counting.value ? "~" : ""}${Mt(s.pageCount.value)}`
    ), te = v(() => {
      let V = `Page ${Mt($.value)} of ${ie.value}`;
      const X = s.rows.value.length;
      if (X) {
        const G = s.offset.value + 1, De = `${s.counting.value ? "~" : ""}${Mt(s.total.value)}`;
        V += ` — rows ${Mt(G)} to ${Mt(G + X - 1)} of ${De}`;
      }
      return n.pagesNote ? `${V}
${n.pagesNote}` : V;
    }), ye = H(null), ze = v(() => ye.value ?? String($.value)), Je = v(
      () => `calc(${Math.max(2, String(s.pageCount.value).length)}ch + 10px)`
    );
    function et(V) {
      V.target.select();
    }
    function tt(V) {
      const X = V.target, G = X.value.replace(/[^0-9]/g, "");
      X.value !== G && (X.value = G), ye.value = G;
    }
    function je(V) {
      const X = V.target, G = Number(ye.value);
      ye.value = null;
      const De = Number.isFinite(G) && G >= 1 ? Math.min(Math.trunc(G), Math.max(1, s.pageCount.value)) : $.value;
      X.value = String(De), De !== $.value && s.setPage(De);
    }
    function Ge(V) {
      const X = V.target;
      ye.value = null, X.value = String($.value), X.blur();
    }
    return (V, X) => (f(), m("div", {
      class: "dc-header",
      "data-dc-expanded": e.expanded ? "true" : "false"
    }, [
      C("div", {
        class: "dc-header__trigger",
        onClick: W
      }, [
        C("span", jo, F(r.value.label), 1),
        k.value.length ? (f(), m("span", Go, [
          X[5] || (X[5] = C("span", { class: "dc-header__sr" }, "Within", -1)),
          (f(!0), m(ne, null, me(k.value, (G) => (f(), m("span", {
            key: `scope:${G.id}`,
            class: "dc-within dc-mono dc-truncate",
            title: D(G)
          }, F(D(G)), 9, Xo))), 128))
        ])) : I("", !0),
        C("div", {
          ref_key: "termBar",
          ref: j,
          class: "dc-header__query dc-header__terms",
          "data-dc-more": de.value,
          title: A(s).summary.value,
          onScroll: le
        }, [
          M.value ? (f(), Z(Ms, {
            key: 0,
            class: "dc-header__pick dc-header__scope-select",
            label: "Type",
            "model-value": A(s).query.value.entity ?? "",
            options: h.value,
            onOpen: A(l).refresh,
            onClose: A(l).cancel,
            "onUpdate:modelValue": P
          }, null, 8, ["model-value", "options", "onOpen", "onClose"])) : I("", !0),
          b.value ? (f(), Z(Ms, {
            key: 1,
            class: "dc-header__pick dc-header__view-select",
            label: "View",
            "model-value": y.value,
            options: _.value,
            "onUpdate:modelValue": w
          }, null, 8, ["model-value", "options"])) : I("", !0),
          (f(!0), m(ne, null, me(S.value, (G) => (f(), m(ne, {
            key: G.term.id
          }, [
            G.or ? (f(), m("span", Qo, "or")) : I("", !0),
            C("button", {
              type: "button",
              class: ft(["dc-term dc-mono", { "dc-term--idle": G.idle }]),
              title: G.idle ? `Not applied to ${A(s).entity.value?.label} — remove ${D(G.term)}` : `Remove ${D(G.term)}`,
              "aria-label": `Remove ${D(G.term)}`,
              onClick: (De) => A(s).removeTerm(G.term)
            }, F(D(G.term)), 11, Zo)
          ], 64))), 128)),
          pt(C("input", {
            ref_key: "searchBox",
            ref: z,
            "onUpdate:modelValue": X[0] || (X[0] = (G) => A(s).draft.value = G),
            class: "dc-header__search dc-mono",
            type: "text",
            autocomplete: "off",
            spellcheck: "false",
            placeholder: "Search…",
            "aria-label": "Search",
            onKeydown: [
              X[1] || (X[1] = at(Fe(
                //@ts-ignore
                (...G) => A(s).commitDraft && A(s).commitDraft(...G),
                ["prevent"]
              ), ["enter"])),
              at(Fe(T, ["prevent"]), ["esc"]),
              at(K, ["backspace"])
            ]
          }, null, 40, Jo), [
            [bn, A(s).draft.value]
          ])
        ], 40, Yo),
        C("button", {
          type: "button",
          class: "dc-header__toggle",
          "aria-expanded": e.expanded,
          "aria-controls": e.panelId,
          onClick: X[2] || (X[2] = (G) => a("toggle"))
        }, [
          C("span", ti, F(e.expanded ? "▲" : "▼"), 1),
          C("span", ni, F(e.expanded ? "Hide query panel" : "Edit query"), 1)
        ], 8, ei)
      ]),
      B.value ? (f(), m("nav", ai, [
        C("button", {
          type: "button",
          class: "dc-header__step",
          "aria-label": "Previous page",
          disabled: $.value <= 1,
          onClick: X[3] || (X[3] = (G) => A(s).setPage($.value - 1))
        }, [...X[6] || (X[6] = [
          C("span", { "aria-hidden": "true" }, "‹", -1)
        ])], 8, si),
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
            style: Ee({ width: Je.value }),
            value: ze.value,
            onFocus: et,
            onInput: tt,
            onKeydown: [
              at(Fe(je, ["prevent"]), ["enter"]),
              at(Fe(Ge, ["prevent"]), ["esc"])
            ],
            onBlur: je
          }, null, 44, li),
          C("span", oi, "/ " + F(ie.value), 1)
        ], 8, ri),
        C("span", ii, F(te.value), 1),
        C("button", {
          type: "button",
          class: "dc-header__step",
          "aria-label": "Next page",
          disabled: $.value >= A(s).pageCount.value,
          onClick: X[4] || (X[4] = (G) => A(s).setPage($.value + 1))
        }, [...X[7] || (X[7] = [
          C("span", { "aria-hidden": "true" }, "›", -1)
        ])], 8, ci)
      ])) : I("", !0),
      V.$slots.actions ? (f(), m("div", ui, [
        xe(V.$slots, "actions", {}, void 0, !0)
      ])) : I("", !0)
    ], 8, Uo));
  }
}), gr = /* @__PURE__ */ pe(fi, [["__scopeId", "data-v-d4f7546d"]]), pi = { class: "dc-facet" }, vi = ["id"], hi = { class: "dc-facet__body" }, mi = ["aria-labelledby"], gi = ["aria-pressed", "data-dc-active", "onClick"], _i = ["aria-labelledby"], yi = ["aria-label", "placeholder", "onKeydown"], wi = ["aria-label", "placeholder", "onKeydown"], ki = ["aria-checked"], bi = { class: "dc-switch__text" }, $i = ["data-dc-active"], xi = /* @__PURE__ */ oe({
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
      const k = s.value.has(h) ? n.value.selected.filter((_) => _ !== h) : [...n.value.selected, h];
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
      const _ = Number(k);
      return Number.isFinite(_) ? _ : null;
    }
    function c() {
      if (n.value.kind !== "range") return;
      const h = l(i.value), k = l(o.value);
      h === n.value.min && k === n.value.max || a("update", { kind: "range", min: h, max: k });
    }
    function d() {
      n.value.kind === "toggle" && a("update", { kind: "toggle", on: !n.value.on });
    }
    return (h, k) => (f(), m("div", pi, [
      C("span", {
        id: `dc-facet-${e.facet.key}`,
        class: "dc-facet__label"
      }, F(e.facet.label), 9, vi),
      C("div", hi, [
        e.facet.kind === "chips" && e.value.kind === "chips" ? (f(), m("div", {
          key: 0,
          class: "dc-facet__chips",
          role: "group",
          "aria-labelledby": `dc-facet-${e.facet.key}`
        }, [
          (f(!0), m(ne, null, me(e.facet.options, (_) => (f(), m("button", {
            key: _,
            type: "button",
            class: "dc-chip",
            "aria-pressed": s.value.has(_),
            "data-dc-active": s.value.has(_) ? "true" : "false",
            onClick: (y) => r(_)
          }, F(_), 9, gi))), 128))
        ], 8, mi)) : e.facet.kind === "range" && e.value.kind === "range" ? (f(), m("div", {
          key: 1,
          class: "dc-facet__range",
          role: "group",
          "aria-labelledby": `dc-facet-${e.facet.key}`
        }, [
          pt(C("input", {
            "onUpdate:modelValue": k[0] || (k[0] = (_) => i.value = _),
            class: "dc-input dc-mono",
            type: "number",
            inputmode: "numeric",
            "aria-label": `${e.facet.label} minimum`,
            placeholder: String(e.facet.min),
            onChange: c,
            onBlur: c,
            onKeydown: at(Fe(c, ["prevent"]), ["enter"])
          }, null, 40, yi), [
            [bn, i.value]
          ]),
          k[2] || (k[2] = C("span", {
            class: "dc-facet__dash",
            "aria-hidden": "true"
          }, "–", -1)),
          pt(C("input", {
            "onUpdate:modelValue": k[1] || (k[1] = (_) => o.value = _),
            class: "dc-input dc-mono",
            type: "number",
            inputmode: "numeric",
            "aria-label": `${e.facet.label} maximum`,
            placeholder: String(e.facet.max),
            onChange: c,
            onBlur: c,
            onKeydown: at(Fe(c, ["prevent"]), ["enter"])
          }, null, 40, wi), [
            [bn, o.value]
          ])
        ], 8, _i)) : e.facet.kind === "toggle" && e.value.kind === "toggle" ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-switch",
          role: "switch",
          "aria-checked": e.value.on,
          onClick: d
        }, [
          C("span", bi, F(e.facet.text), 1),
          C("span", {
            class: "dc-switch__track",
            "data-dc-active": e.value.on ? "true" : "false",
            "aria-hidden": "true"
          }, [...k[3] || (k[3] = [
            C("span", { class: "dc-switch__knob" }, null, -1)
          ])], 8, $i)
        ], 8, ki)) : I("", !0)
      ])
    ]));
  }
}), _r = /* @__PURE__ */ pe(xi, [["__scopeId", "data-v-36d1334b"]]), Mi = ["id"], Ci = { class: "dc-panel__section dc-panel__rows" }, Si = { class: "dc-panel__row" }, Pi = ["for"], Ei = ["title", "aria-label", "onClick"], Ai = ["id", "placeholder", "onKeydown"], Ti = { class: "dc-panel__actions" }, Ri = ["disabled"], zi = {
  key: 0,
  class: "dc-panel__section"
}, Li = /* @__PURE__ */ oe({
  __name: "QueryPanel",
  props: {
    panelId: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = t, a = Jt(), s = $e(), r = v(() => Ql(s.query.value.expr)), i = v(() => r.value.parts.map(tn)), o = H(r.value.text), l = H(null);
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
        s.setExpression(ks(r.value.parts, b));
      }
      n("close");
    }
    function h(b) {
      const { parts: M, text: w } = r.value;
      s.setExpression(ks(M.filter((S, L) => L !== b), w));
    }
    function k(b) {
      const { parts: M } = r.value;
      o.value || !M.length || (b.preventDefault(), h(M.length - 1));
    }
    function _() {
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
      onKeydown: M[2] || (M[2] = at(Fe((w) => n("close"), ["stop"]), ["esc"]))
    }, [
      C("section", Ci, [
        C("div", Si, [
          C("label", {
            class: "dc-panel__field-label",
            for: `${e.panelId}-expr`
          }, "Expression", 8, Pi),
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
              onClick: (L) => h(S)
            }, F(w), 9, Ei))), 128)),
            pt(C("input", {
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
                at(Fe(d, ["prevent"]), ["enter"]),
                at(k, ["backspace"])
              ]
            }, null, 40, Ai), [
              [bn, o.value]
            ])
          ], 32)
        ]),
        A(s).entity.value ? (f(!0), m(ne, { key: 0 }, me(A(s).entity.value.facets, (w) => (f(), Z(_r, {
          key: w.key,
          facet: w,
          value: A(s).query.value.facets[w.key],
          onUpdate: (S) => y(w.key, S)
        }, null, 8, ["facet", "value", "onUpdate"]))), 128)) : I("", !0),
        C("div", Ti, [
          C("button", {
            type: "button",
            class: "dc-button dc-button--primary",
            onClick: d
          }, " Run query "),
          C("button", {
            type: "button",
            class: "dc-button",
            disabled: A(s).isPristine.value && !c.value,
            onClick: _
          }, " Reset ", 8, Ri)
        ])
      ]),
      a["panel-section"] ? (f(), m("section", zi, [
        xe(b.$slots, "panel-section", {}, void 0, !0)
      ])) : I("", !0)
    ], 40, Mi));
  }
}), yr = /* @__PURE__ */ pe(Li, [["__scopeId", "data-v-640ae2f5"]]), Ii = ["checked", "indeterminate"], wr = /* @__PURE__ */ oe({
  __name: "PageTick",
  setup(e) {
    const t = $e(), n = v(() => t.rows.value.filter((r) => t.isSelected(r)).length), a = v(
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
    }, null, 40, Ii));
  }
}), Ni = {
  key: 0,
  class: "dc-actions"
}, Fi = {
  key: 0,
  class: "dc-actions__select"
}, Oi = {
  key: 0,
  class: "dc-actions__all"
}, Di = {
  class: "dc-actions__count",
  "aria-live": "polite"
}, Bi = {
  key: 1,
  class: "dc-actions__count dc-actions__all",
  "aria-live": "polite"
}, qi = { class: "dc-actions__ops" }, Vi = ["disabled"], Ki = ["data-dc-operation", "disabled", "onClick"], Hi = ["disabled"], Wi = /* @__PURE__ */ oe({
  __name: "RecordActions",
  props: {
    views: {}
  },
  setup(e) {
    const t = e, n = $e(), a = v(() => n.entity.value), s = v(() => !Ea(n.query.value, t.views)), r = v(() => s.value && n.selectable.value), i = v(
      () => Rn(n.query.value.view, t.views) === "table"
    ), o = v(
      () => s.value && (r.value || !!(a.value?.create || a.value?.duplicate || a.value?.delete || a.value?.operations?.length))
    ), l = v(() => n.selection.value.ids.length), c = v(() => l.value ? `${l.value} selected` : i.value ? "None selected" : "Select all");
    function d(h) {
      return l.value ? `${h} ${l.value}` : h;
    }
    return (h, k) => o.value ? (f(), m("div", Ni, [
      r.value ? (f(), m("div", Fi, [
        i.value ? (f(), m("span", Bi, F(c.value), 1)) : (f(), m("label", Oi, [
          ue(wr),
          C("span", Di, F(c.value), 1)
        ])),
        l.value ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-actions__clear",
          onClick: k[0] || (k[0] = (_) => A(n).clearSelection())
        }, " Clear ")) : I("", !0)
      ])) : I("", !0),
      C("div", qi, [
        a.value?.create ? (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-actions__op dc-actions__new",
          onClick: k[1] || (k[1] = (_) => A(n).create(a.value))
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
          onClick: k[2] || (k[2] = (_) => A(n).duplicate())
        }, F(d(a.value.duplicate)), 9, Vi)) : I("", !0),
        (f(!0), m(ne, null, me(a.value?.operations ?? [], (_) => (f(), m("button", {
          key: _.key,
          type: "button",
          class: "dc-actions__op",
          "data-dc-operation": _.key,
          disabled: !l.value,
          onClick: (y) => A(n).operate(_.key)
        }, F(d(_.label)), 9, Ki))), 128)),
        a.value?.delete ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-actions__op dc-actions__danger",
          disabled: !l.value,
          onClick: k[3] || (k[3] = (_) => A(n).delete())
        }, F(d(a.value.delete)), 9, Hi)) : I("", !0)
      ])
    ])) : I("", !0);
  }
}), kr = /* @__PURE__ */ pe(Wi, [["__scopeId", "data-v-8548a5bf"]]), Ui = ["href"], ji = /* @__PURE__ */ oe({
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
      xe(r.$slots, "default", {}, void 0, !0)
    ], 8, Ui)) : (f(), m("button", {
      key: 1,
      type: "button",
      class: "dc-press",
      onClick: s
    }, [
      xe(r.$slots, "default", {}, void 0, !0)
    ]));
  }
}), Qe = /* @__PURE__ */ pe(ji, [["__scopeId", "data-v-a9383f64"]]);
function Gi(e, t) {
  if (!e) return null;
  const n = He(e, t);
  return typeof n == "string" && n.trim() ? n : null;
}
function Xi(e, t) {
  const n = Xe(t, "state"), a = Xe(t, "tint");
  return {
    identity: gn(Xe(t, "identity"), e),
    reference: gn(Xe(t, "reference"), e),
    metrics: Qs(t, "metric").map((s) => ({
      column: s,
      label: s.label ?? "",
      text: en(s, e)
    })),
    state: n ? He(n, e) ?? null : null,
    updated: gn(Xe(t, "updated"), e),
    image: Gi(Xe(t, "image"), e),
    tint: a ? He(a, e) ?? null : null
  };
}
function br(e, t, n, a, s = !1) {
  const r = n?.columns ?? [];
  return {
    row: e,
    key: Fl(e, t),
    entityLabel: e.entityLabel,
    entity: n,
    columns: r,
    ordinal: Ll(t),
    parts: Xi(e, r),
    pinned: a,
    selected: s
  };
}
function bt() {
  const e = $e(), t = v(
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
const Yi = ["data-dc-status"], Qi = /* @__PURE__ */ oe({
  __name: "StatusPill",
  props: {
    status: {}
  },
  setup(e) {
    return (t, n) => (f(), m("span", {
      class: "dc-pill",
      "data-dc-status": e.status
    }, F(e.status), 9, Yi));
  }
}), nn = /* @__PURE__ */ pe(Qi, [["__scopeId", "data-v-23e59fbf"]]), Zi = { key: 1 }, Ji = /* @__PURE__ */ oe({
  __name: "MetricDrill",
  props: {
    entry: {},
    column: {}
  },
  setup(e) {
    const t = e, n = $e(), a = v(() => !t.entry.entity?.scope || !t.column.drill ? null : n.entities.value.find((c) => c.key === t.column.drill) ?? null), s = v(() => t.column.label ?? ""), r = v(() => en(t.column, t.entry.row)), i = v(() => a.value ? n.drillHref(t.entry.row, a.value) : null);
    function o(l, c) {
      c.stopPropagation(), a.value && n.drill(t.entry.row, a.value, l);
    }
    return (l, c) => a.value ? (f(), Z(Qe, {
      key: 0,
      class: "dc-drill",
      href: i.value,
      title: `${s.value} of ${e.entry.parts.identity} — show the ${a.value.label.toLowerCase()}`,
      onPress: o
    }, {
      default: Me(() => [
        xe(l.$slots, "default", {}, () => [
          Oe(F(r.value), 1)
        ], !0)
      ]),
      _: 3
    }, 8, ["href", "title"])) : (f(), m("span", Zi, [
      xe(l.$slots, "default", {}, () => [
        Oe(F(r.value), 1)
      ], !0)
    ]));
  }
}), an = /* @__PURE__ */ pe(Ji, [["__scopeId", "data-v-d3e7f4e0"]]), ec = ["data-dc-active", "aria-pressed", "aria-label"], tc = /* @__PURE__ */ oe({
  __name: "PinStar",
  props: {
    row: {},
    pinned: { type: Boolean },
    name: {}
  },
  setup(e) {
    const t = e, n = $e();
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
    }, F(e.pinned ? "★" : "☆"), 9, ec));
  }
}), Ha = /* @__PURE__ */ pe(tc, [["__scopeId", "data-v-ef63d763"]]), nc = ["src"], ac = /* @__PURE__ */ oe({
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
    }, null, 40, nc)) : I("", !0);
  }
}), Nn = /* @__PURE__ */ pe(ac, [["__scopeId", "data-v-afaab300"]]), sc = ["data-dc-standing", "title", "aria-label"], rc = /* @__PURE__ */ oe({
  __name: "QueryMark",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = $e(), a = v(() => zn(t.entry.entity, t.entry.row)), s = v(() => La(n.query.value.expr, a.value)), r = v(
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
    }, F(s.value === "in" ? "+" : "−"), 9, sc)) : I("", !0);
  }
}), Wa = /* @__PURE__ */ pe(rc, [["__scopeId", "data-v-4b8d4166"]]), lc = ["aria-label"], oc = ["data-dc-standing", "data-dc-active", "aria-checked", "title", "aria-label", "onClick"], ic = /* @__PURE__ */ oe({
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
      }, F(c.sign), 9, oc))), 128))
    ], 8, lc));
  }
}), ha = /* @__PURE__ */ pe(ic, [["__scopeId", "data-v-adaa8412"]]), $r = /* @__PURE__ */ oe({
  __name: "RowStanding",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = $e(), a = v(() => zn(t.entry.entity, t.entry.row)), s = v(() => La(n.query.value.expr, a.value));
    function r(i) {
      n.setExpression(pa(n.query.value.expr, a.value, i));
    }
    return (i, o) => a.value !== null ? (f(), Z(ha, {
      key: 0,
      class: "dc-row-standing",
      standing: s.value,
      name: e.entry.parts.identity,
      onSet: r
    }, null, 8, ["standing", "name"])) : I("", !0);
  }
}), cc = /* @__PURE__ */ oe({
  __name: "ScopeMark",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = $e(), a = v(
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
    Ue(o);
    const l = v(() => a.value ? n.drillHref(t.entry.row, null) : null);
    function c(d, h) {
      h.stopPropagation(), n.drill(t.entry.row, null, d);
    }
    return (d, h) => a.value ? (f(), Z(Qe, {
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
      default: Me(() => [...h[0] || (h[0] = [
        Oe(" → ", -1)
      ])]),
      _: 1
    }, 8, ["href", "data-dc-pending", "title", "aria-label"])) : I("", !0);
  }
}), sn = /* @__PURE__ */ pe(cc, [["__scopeId", "data-v-05d2c233"]]), uc = ["checked", "aria-label"], $t = /* @__PURE__ */ oe({
  __name: "SelectTick",
  props: {
    row: {},
    selected: { type: Boolean },
    name: {}
  },
  setup(e) {
    const t = e, n = $e();
    function a(s) {
      s.stopPropagation(), n.toggleSelect(t.row);
    }
    return (s, r) => (f(), m("input", {
      class: "dc-tick",
      type: "checkbox",
      checked: e.selected,
      "aria-label": `Select ${e.name}`,
      onClick: a
    }, null, 8, uc));
  }
}), dc = { class: "dc-card__top dc-mono" }, fc = { class: "dc-card__lead" }, pc = {
  key: 2,
  class: "dc-card__entity"
}, vc = { class: "dc-card__top-right" }, hc = { class: "dc-card__names" }, mc = { class: "dc-card__primary" }, gc = {
  key: 0,
  class: "dc-card__secondary dc-mono"
}, _c = {
  key: 0,
  class: "dc-card__metrics dc-mono"
}, yc = {
  key: 0,
  class: "dc-card__date"
}, wc = /* @__PURE__ */ oe({
  __name: "CardsView",
  setup(e) {
    const t = $e(), n = bt(), a = v(() => t.isEverything.value), s = (i) => i.entity?.card === "picture", r = v(() => n.value.length > 0 && n.value.every(s));
    return (i, o) => (f(), m("div", {
      class: ft(["dc-cards", { "dc-cards--pictures": r.value }])
    }, [
      (f(!0), m(ne, null, me(A(n), (l) => (f(), m("div", {
        key: l.key,
        class: ft(["dc-card", { "dc-card--picture": s(l) }])
      }, [
        C("div", dc, [
          C("span", fc, [
            A(t).selectable.value ? (f(), Z($t, {
              key: 0,
              row: l.row,
              selected: l.selected,
              name: l.parts.identity
            }, null, 8, ["row", "selected", "name"])) : I("", !0),
            s(l) ? I("", !0) : (f(), m(ne, { key: 1 }, [
              Oe(F(l.ordinal), 1)
            ], 64)),
            a.value ? (f(), m("span", pc, F(l.entityLabel), 1)) : I("", !0)
          ]),
          C("span", vc, [
            l.parts.state && !s(l) ? (f(), Z(nn, {
              key: 0,
              status: l.parts.state
            }, null, 8, ["status"])) : I("", !0),
            s(l) ? (f(), Z(Wa, {
              key: 1,
              entry: l
            }, null, 8, ["entry"])) : (f(), Z($r, {
              key: 2,
              entry: l
            }, null, 8, ["entry"])),
            ue(sn, { entry: l }, null, 8, ["entry"]),
            A(t).pinnable.value ? (f(), Z(Ha, {
              key: 3,
              row: l.row,
              name: l.parts.identity,
              pinned: l.pinned
            }, null, 8, ["row", "name", "pinned"])) : I("", !0)
          ])
        ]),
        ue(Qe, {
          class: "dc-card__open",
          href: A(t).pressHref(l.row),
          onPress: (c) => A(t).activate(l.row, c)
        }, {
          default: Me(() => [
            l.parts.image ? (f(), Z(Nn, {
              key: 0,
              class: "dc-card__image",
              src: l.parts.image
            }, null, 8, ["src"])) : I("", !0),
            C("span", hc, [
              C("span", mc, F(l.parts.identity), 1),
              s(l) ? I("", !0) : (f(), m("span", gc, F(l.parts.reference), 1))
            ])
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        s(l) ? I("", !0) : (f(), m("div", _c, [
          (f(!0), m(ne, null, me(l.parts.metrics.slice(0, 2), (c) => (f(), Z(an, {
            key: c.column.key ?? c.label,
            entry: l,
            column: c.column
          }, {
            default: Me(() => [
              Oe(F(c.label) + " " + F(c.text), 1)
            ]),
            _: 2
          }, 1032, ["entry", "column"]))), 128)),
          l.parts.updated ? (f(), m("span", yc, F(l.parts.updated), 1)) : I("", !0)
        ]))
      ], 2))), 128))
    ], 2));
  }
}), xr = /* @__PURE__ */ pe(wc, [["__scopeId", "data-v-046f11c3"]]), kc = { class: "dc-grid" }, bc = { class: "dc-tile__scrim" }, $c = { class: "dc-tile__top dc-mono" }, xc = { class: "dc-tile__chip" }, Mc = { class: "dc-tile__caption" }, Cc = { class: "dc-tile__secondary dc-truncate" }, Sc = { class: "dc-tile__primary" }, Pc = /* @__PURE__ */ oe({
  __name: "GridView",
  setup(e) {
    const t = $e(), n = bt();
    return (a, s) => (f(), m("div", kc, [
      (f(!0), m(ne, null, me(A(n), (r) => (f(), m("div", {
        key: r.key,
        class: "dc-grid__cell"
      }, [
        ue(Qe, {
          class: "dc-tile",
          style: Ee({ "--dc-tile-tint": r.parts.tint ?? void 0 }),
          href: A(t).pressHref(r.row),
          onPress: (i) => A(t).activate(r.row, i)
        }, {
          default: Me(() => [
            r.parts.image ? (f(), Z(Nn, {
              key: 0,
              class: "dc-tile__image",
              src: r.parts.image
            }, null, 8, ["src"])) : I("", !0),
            C("span", bc, [
              C("span", $c, [
                C("span", xc, F(r.ordinal), 1)
              ]),
              C("span", Mc, [
                C("span", Cc, F(r.parts.reference), 1),
                C("span", Sc, F(r.parts.identity), 1)
              ])
            ])
          ]),
          _: 2
        }, 1032, ["style", "href", "onPress"]),
        A(t).selectable.value ? (f(), Z($t, {
          key: 0,
          class: "dc-grid__tick",
          row: r.row,
          selected: r.selected,
          name: r.parts.identity
        }, null, 8, ["row", "selected", "name"])) : I("", !0)
      ]))), 128))
    ]));
  }
}), Mr = /* @__PURE__ */ pe(Pc, [["__scopeId", "data-v-12dd4d94"]]);
function Cs(e, t, n, a) {
  return (n - a * (t - 1)) / e;
}
function Zn(e, t) {
  return e > 0 ? Math.min(t, e) : t;
}
function Ec(e) {
  return e > 0 ? e : 1 / 0;
}
function Ac(e, t, n) {
  const { width: a, height: s, gap: r = 0 } = n;
  if (!e.length) return [];
  if (!(a > 0) || !(s > 0)) return [{ items: [...e], height: s, filled: !1 }];
  const i = [];
  let o = [], l = 0, c = 0;
  for (const d of e) {
    const h = t(d), k = Math.max(h.ratio, Number.EPSILON), _ = h.height && h.height > 0 ? Math.max(c, h.height) : c, y = Zn(_, s), b = Cs(l + k, o.length + 1, a, r);
    if (b > y) {
      o.push(d), l += k, c = _;
      continue;
    }
    const M = Zn(c, s), w = o.length ? Cs(l, o.length, a, r) : 1 / 0;
    w <= Ec(c) && w - M < y - b ? (i.push({ items: o, height: w, filled: !0 }), o = [d], l = k, c = h.height && h.height > 0 ? h.height : 0) : (i.push({ items: [...o, d], height: b, filled: !0 }), o = [], l = 0, c = 0);
  }
  return o.length && i.push({ items: o, height: Zn(c, s), filled: !1 }), i;
}
const Tc = { class: "dc-images" }, Rc = {
  key: 1,
  class: "dc-images__blank",
  "aria-hidden": "true"
}, zc = 240, fn = 8, Lc = 1, Ic = /* @__PURE__ */ oe({
  __name: "ImagesView",
  setup(e) {
    const t = $e(), n = bt(), a = ds(/* @__PURE__ */ new Map()), s = ds(/* @__PURE__ */ new Set());
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
      return b ? { ratio: b.width / b.height, height: b.height } : { ratio: Lc };
    }
    const c = H(null), d = H(0);
    let h = null;
    function k() {
      d.value = c.value?.clientWidth ?? 0;
    }
    Bs(() => {
      k(), !(!c.value || typeof ResizeObserver > "u") && (h = new ResizeObserver(k), h.observe(c.value));
    }), Ue(() => {
      h?.disconnect(), h = null;
    });
    const _ = v(() => {
      const y = Ac(n.value, l, {
        width: d.value,
        height: zc,
        gap: fn
      }), b = [];
      let M = 0;
      for (const w of y) {
        let S = 0;
        for (const L of w.items) {
          const x = l(L).ratio * w.height, E = o(L), D = E !== void 0 && E.height < w.height;
          b.push({
            entry: L,
            style: {
              top: `${M}px`,
              left: `${S}px`,
              width: `${x}px`,
              height: `${w.height}px`
            },
            picture: D ? { width: `${E.width}px`, height: `${E.height}px` } : { width: "100%", height: "100%" }
          }), S += x + fn;
        }
        M += w.height + fn;
      }
      return { boxes: b, height: y.length ? M - fn : 0 };
    });
    return (y, b) => (f(), m("div", Tc, [
      C("div", {
        ref_key: "wall",
        ref: c,
        class: "dc-images__wall",
        style: Ee({ height: `${_.value.height}px` })
      }, [
        (f(!0), m(ne, null, me(_.value.boxes, ({ entry: M, style: w, picture: S }) => (f(), m("div", {
          key: M.key,
          class: "dc-images__cell",
          style: Ee(w)
        }, [
          ue(Qe, {
            class: "dc-images__open",
            title: M.parts.identity,
            "aria-label": M.parts.identity,
            href: A(t).pressHref(M.row),
            onPress: (L) => A(t).activate(M.row, L)
          }, {
            default: Me(() => [
              i(M) ? (f(), Z(Nn, {
                key: 0,
                class: "dc-images__picture",
                style: Ee(S),
                src: i(M),
                onLoad: (L) => r(i(M), L),
                onError: (L) => s.add(i(M))
              }, null, 8, ["style", "src", "onLoad", "onError"])) : (f(), m("span", Rc, F(M.parts.identity), 1))
            ]),
            _: 2
          }, 1032, ["title", "aria-label", "href", "onPress"]),
          A(t).selectable.value ? (f(), Z($t, {
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
}), Cr = /* @__PURE__ */ pe(Ic, [["__scopeId", "data-v-d77205b8"]]), Nc = { class: "dc-links" }, Fc = { class: "dc-link__primary dc-truncate" }, Oc = { class: "dc-link__secondary dc-mono dc-truncate" }, Dc = /* @__PURE__ */ oe({
  __name: "LinksView",
  setup(e) {
    const t = $e(), n = bt();
    return (a, s) => (f(), m("div", Nc, [
      (f(!0), m(ne, null, me(A(n), (r) => (f(), m("span", {
        key: r.key,
        class: "dc-links__item"
      }, [
        A(t).selectable.value ? (f(), Z($t, {
          key: 0,
          row: r.row,
          selected: r.selected,
          name: r.parts.identity
        }, null, 8, ["row", "selected", "name"])) : I("", !0),
        ue(Qe, {
          class: "dc-link",
          href: A(t).pressHref(r.row),
          onPress: (i) => A(t).activate(r.row, i)
        }, {
          default: Me(() => [
            C("span", Fc, F(r.parts.identity), 1),
            C("span", Oc, F(r.parts.reference), 1)
          ]),
          _: 2
        }, 1032, ["href", "onPress"])
      ]))), 128))
    ]));
  }
}), Sr = /* @__PURE__ */ pe(Dc, [["__scopeId", "data-v-f47b75cf"]]), Bc = {
  class: "dc-list",
  role: "list"
}, qc = { class: "dc-list__ordinal dc-mono" }, Vc = { class: "dc-list__identity" }, Kc = { class: "dc-list__primary dc-truncate" }, Hc = { class: "dc-list__secondary dc-mono dc-truncate" }, Wc = {
  key: 1,
  class: "dc-list__entity dc-mono"
}, Uc = { class: "dc-list__metrics dc-mono" }, jc = { class: "dc-list__trailing" }, Gc = /* @__PURE__ */ oe({
  __name: "ListView",
  setup(e) {
    const t = $e(), n = bt(), a = v(() => t.isEverything.value);
    return (s, r) => (f(), m("div", Bc, [
      (f(!0), m(ne, null, me(A(n), (i) => (f(), m("div", {
        key: i.key,
        class: "dc-list__row",
        role: "listitem"
      }, [
        A(t).selectable.value ? (f(), Z($t, {
          key: 0,
          class: "dc-list__tick",
          row: i.row,
          selected: i.selected,
          name: i.parts.identity
        }, null, 8, ["row", "selected", "name"])) : I("", !0),
        ue($r, {
          class: "dc-list__standing",
          entry: i
        }, null, 8, ["entry"]),
        ue(Qe, {
          class: "dc-list__open",
          href: A(t).pressHref(i.row),
          onPress: (o) => A(t).activate(i.row, o)
        }, {
          default: Me(() => [
            C("span", qc, F(i.ordinal), 1),
            C("span", Vc, [
              C("span", Kc, F(i.parts.identity), 1),
              C("span", Hc, F(i.parts.reference), 1)
            ])
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        a.value ? (f(), m("span", Wc, F(i.entityLabel), 1)) : I("", !0),
        C("span", Uc, [
          (f(!0), m(ne, null, me(i.parts.metrics.slice(0, 2), (o) => (f(), Z(an, {
            key: o.column.key ?? o.label,
            entry: i,
            column: o.column
          }, null, 8, ["entry", "column"]))), 128))
        ]),
        C("span", jc, [
          i.parts.state ? (f(), Z(nn, {
            key: 0,
            status: i.parts.state
          }, null, 8, ["status"])) : I("", !0),
          ue(sn, { entry: i }, null, 8, ["entry"]),
          A(t).pinnable.value ? (f(), Z(Ha, {
            key: 1,
            row: i.row,
            name: i.parts.identity,
            pinned: i.pinned
          }, null, 8, ["row", "name", "pinned"])) : I("", !0)
        ])
      ]))), 128))
    ]));
  }
}), ma = /* @__PURE__ */ pe(Gc, [["__scopeId", "data-v-9b2e8a87"]]), Xc = { class: "dc-preview" }, Yc = { class: "dc-preview__pager dc-mono" }, Qc = ["disabled"], Zc = { "aria-live": "polite" }, Jc = ["disabled"], eu = {
  key: 0,
  class: "dc-preview__card"
}, tu = ["src"], nu = { class: "dc-preview__body" }, au = { class: "dc-preview__top" }, su = { class: "dc-preview__badges" }, ru = { class: "dc-preview__entity dc-mono" }, lu = { class: "dc-preview__marks" }, ou = { class: "dc-preview__primary" }, iu = { class: "dc-preview__secondary dc-mono" }, cu = { class: "dc-preview__fields" }, uu = { class: "dc-preview__key" }, du = { class: "dc-preview__value dc-mono" }, fu = /* @__PURE__ */ oe({
  __name: "PreviewView",
  setup(e) {
    const t = $e(), n = bt(), a = H(0);
    we(n, (l) => {
      a.value > l.length - 1 && (a.value = Math.max(0, l.length - 1));
    });
    const s = v(() => n.value[a.value]), r = v(() => {
      const l = s.value;
      if (!l) return [];
      const c = Xe(l.columns, "reference"), d = Xe(l.columns, "updated");
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
    return (l, c) => (f(), m("div", Xc, [
      C("div", Yc, [
        C("button", {
          type: "button",
          class: "dc-preview__step",
          "aria-label": "Previous result",
          disabled: a.value === 0,
          onClick: c[0] || (c[0] = (d) => o(-1))
        }, " ‹ ", 8, Qc),
        C("span", Zc, F(i.value), 1),
        C("button", {
          type: "button",
          class: "dc-preview__step",
          "aria-label": "Next result",
          disabled: a.value >= A(n).length - 1,
          onClick: c[1] || (c[1] = (d) => o(1))
        }, " › ", 8, Jc)
      ]),
      s.value ? (f(), m("div", eu, [
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
          }, null, 8, tu)) : (f(), m(ne, { key: 1 }, [
            Oe(" preview ")
          ], 64))
        ], 4),
        C("div", nu, [
          C("div", au, [
            C("span", su, [
              A(t).selectable.value ? (f(), Z($t, {
                key: 0,
                row: s.value.row,
                selected: s.value.selected,
                name: s.value.parts.identity
              }, null, 8, ["row", "selected", "name"])) : I("", !0),
              s.value.parts.state ? (f(), Z(nn, {
                key: 1,
                status: s.value.parts.state
              }, null, 8, ["status"])) : I("", !0),
              C("span", ru, F(s.value.entityLabel), 1)
            ]),
            C("span", lu, [
              ue(Wa, { entry: s.value }, null, 8, ["entry"]),
              ue(sn, { entry: s.value }, null, 8, ["entry"]),
              A(t).pinnable.value ? (f(), Z(Ha, {
                key: 0,
                row: s.value.row,
                name: s.value.parts.identity,
                pinned: s.value.pinned
              }, null, 8, ["row", "name", "pinned"])) : I("", !0)
            ])
          ]),
          C("div", null, [
            C("div", ou, F(s.value.parts.identity), 1),
            C("div", iu, F(s.value.parts.reference), 1)
          ]),
          C("dl", cu, [
            (f(!0), m(ne, null, me(r.value, (d) => (f(), m("div", {
              key: d.key,
              class: "dc-preview__field"
            }, [
              C("dt", uu, F(d.key), 1),
              C("dd", du, [
                d.column && s.value ? (f(), Z(an, {
                  key: 0,
                  entry: s.value,
                  column: d.column
                }, null, 8, ["entry", "column"])) : (f(), m(ne, { key: 1 }, [
                  Oe(F(d.value), 1)
                ], 64))
              ])
            ]))), 128))
          ]),
          ue(Qe, {
            class: "dc-preview__open",
            href: s.value ? A(t).pressHref(s.value.row) : null,
            onPress: c[2] || (c[2] = (d) => s.value && A(t).activate(s.value.row, d))
          }, {
            default: Me(() => [...c[3] || (c[3] = [
              Oe(" Open record → ", -1)
            ])]),
            _: 1
          }, 8, ["href"])
        ])
      ])) : I("", !0)
    ]));
  }
}), Pr = /* @__PURE__ */ pe(fu, [["__scopeId", "data-v-1bc19613"]]);
function pu() {
  const e = $e();
  return v(() => Il(e.schema.value, e.entity.value));
}
const vu = {
  key: 5,
  class: "dc-cell__text"
}, hu = /* @__PURE__ */ oe({
  __name: "ColumnCell",
  props: {
    column: {},
    entry: {}
  },
  setup(e) {
    const t = e, n = $e(), a = v(() => t.column.kind ?? "text"), s = v(() => He(t.column, t.entry.row)), r = v(
      () => a.value === "ordinal" ? t.entry.ordinal : en(t.column, t.entry.row)
    ), i = v(() => s.value), o = v(() => t.column.activate === !0 || !!t.column.click), l = v(() => ua(t.column)), c = v(() => Zs(t.column, t.entry.row));
    function d(_) {
      o.value && (_.stopPropagation(), h(In(_)));
    }
    function h(_) {
      t.column.click?.(t.entry.row, _), t.column.activate && n.activate(t.entry.row, _);
    }
    const k = v(
      () => t.column.activate && !t.column.click ? n.pressHref(t.entry.row) : null
    );
    return (_, y) => a.value === "component" && e.column.component ? (f(), Z(Ca(e.column.component), {
      key: 0,
      row: e.entry.row,
      entry: e.entry,
      value: s.value,
      column: e.column
    }, null, 8, ["row", "entry", "value", "column"])) : a.value === "status" ? (f(), Z(nn, {
      key: 1,
      status: i.value
    }, null, 8, ["status"])) : a.value === "image" ? (f(), Z(Nn, {
      key: 2,
      class: "dc-cell__image",
      src: typeof s.value == "string" ? s.value : "",
      style: Ee({ maxHeight: e.column.height }),
      onClick: d
    }, null, 8, ["src", "style"])) : e.column.drill ? (f(), Z(an, {
      key: 3,
      entry: e.entry,
      column: e.column
    }, null, 8, ["entry", "column"])) : o.value ? (f(), Z(Qe, {
      key: 4,
      class: ft(["dc-table__open", { "dc-truncate": l.value }]),
      href: k.value,
      title: c.value,
      onPress: y[0] || (y[0] = (b, M) => {
        M.stopPropagation(), h(b);
      })
    }, {
      default: Me(() => [
        Oe(F(r.value), 1)
      ]),
      _: 1
    }, 8, ["class", "href", "title"])) : (f(), m("span", vu, F(r.value), 1));
  }
}), Ss = /* @__PURE__ */ pe(hu, [["__scopeId", "data-v-af24c370"]]), mu = {
  key: 0,
  class: "dc-table__none"
}, gu = { class: "dc-table__detail" }, _u = ["data-dc-wrap"], yu = {
  key: 0,
  class: "dc-table__pick",
  scope: "col"
}, wu = {
  key: 1,
  class: "dc-table__standing",
  scope: "col"
}, ku = ["data-dc-align", "data-dc-hide", "aria-sort", "title"], bu = ["onClick"], $u = {
  key: 2,
  class: "dc-table__head"
}, xu = ["onClick"], Mu = {
  key: 0,
  class: "dc-table__pick"
}, Cu = {
  key: 1,
  class: "dc-table__standing"
}, Su = ["data-dc-align", "data-dc-hide", "title"], Pu = {
  key: 0,
  class: "dc-table__name"
}, Eu = /* @__PURE__ */ oe({
  __name: "TableView",
  setup(e) {
    const t = $e(), n = bt(), a = pu();
    function s(T, K) {
      const W = t.pressHref(T);
      if (W && cr(K)) {
        const j = K.shiftKey ? `noopener,popup,width=${window.outerWidth},height=${window.outerHeight}` : "noopener";
        window.open(W, "_blank", j);
        return;
      }
      t.activate(T, In(K));
    }
    function r(T) {
      const K = Wl(T, t.entity.value), W = K ? `Shortcut: ${K}` : void 0;
      return [T.hint, W].filter(Boolean).join(`
`) || void 0;
    }
    const i = v(
      () => a.value.find((T) => T.scope)
    ), o = v(
      () => t.entity.value ? !!t.entity.value.scope : t.entities.value.some((T) => T.scope)
    ), l = (T) => zn(T.entity, T.row), c = (T) => La(t.query.value.expr, l(T));
    function d(T, K) {
      t.setExpression(pa(t.query.value.expr, l(T), K));
    }
    const h = v(() => {
      const T = n.value.filter((W) => l(W) !== null), K = T.filter((W) => W.selected);
      return K.length ? K : T;
    }), k = v(() => h.value.some((T) => T.selected)), _ = v(() => {
      const T = h.value[0];
      return T ? c(T) : null;
    }), y = v(
      () => h.value.some((T) => c(T) !== _.value)
    ), b = v(
      () => k.value ? "the ticked rows" : "every row on this page"
    );
    function M(T) {
      t.setExpression(
        h.value.reduce(
          (K, W) => pa(K, l(W), T),
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
    const L = v(() => t.entity.value?.label ?? "The result set"), x = v(() => new Set(t.sorts.value.map((T) => T.key))), E = (T) => T.sort !== void 0 && x.value.has(T.sort), D = (T) => {
      if (E(T))
        return t.query.value.sort !== T.sort ? "none" : t.query.value.dir === "desc" ? "descending" : "ascending";
    };
    function P(T) {
      return [
        hs(T),
        T.muted ? "dc-table__muted" : "",
        T.mono ? "dc-mono" : "",
        ua(T) ? "dc-truncate" : ""
      ].filter(Boolean).join(" ");
    }
    function z(T, K) {
      if (!(!ua(T) || T.activate || T.click))
        return Zs(T, K.row);
    }
    return (T, K) => A(a).length ? (f(), m("table", {
      key: 1,
      class: "dc-table",
      "data-dc-wrap": w.value ? "" : void 0
    }, [
      C("thead", null, [
        C("tr", null, [
          A(t).selectable.value ? (f(), m("th", yu, [
            ue(wr)
          ])) : I("", !0),
          o.value ? (f(), m("th", wu, [
            h.value.length ? (f(), Z(ha, {
              key: 0,
              standing: _.value,
              mixed: y.value,
              name: b.value,
              onSet: M
            }, null, 8, ["standing", "mixed", "name"])) : I("", !0)
          ])) : I("", !0),
          (f(!0), m(ne, null, me(A(a), (W, j) => (f(), m("th", {
            key: A(ps)(W, j),
            scope: "col",
            class: ft(A(hs)(W)),
            style: Ee({ width: W.width }),
            "data-dc-align": A(vs)(W),
            "data-dc-hide": W.hideBelow,
            "aria-sort": D(W),
            title: r(W)
          }, [
            E(W) ? (f(), m("button", {
              key: 0,
              type: "button",
              class: "dc-table__sort",
              onClick: (de) => S(W.sort)
            }, F(W.label), 9, bu)) : (f(), m(ne, { key: 1 }, [
              Oe(F(W.label), 1)
            ], 64)),
            W.header ? (f(), m("span", $u, [
              (f(), Z(Ca(W.header), {
                column: W,
                entity: A(t).entity.value
              }, null, 8, ["column", "entity"]))
            ])) : I("", !0)
          ], 14, ku))), 128))
        ])
      ]),
      C("tbody", null, [
        (f(!0), m(ne, null, me(A(n), (W) => (f(), m("tr", {
          key: W.key,
          class: "dc-table__row",
          onClick: (j) => s(W.row, j)
        }, [
          A(t).selectable.value ? (f(), m("td", Mu, [
            ue($t, {
              row: W.row,
              selected: W.selected,
              name: W.parts.identity
            }, null, 8, ["row", "selected", "name"])
          ])) : I("", !0),
          o.value ? (f(), m("td", Cu, [
            l(W) !== null ? (f(), Z(ha, {
              key: 0,
              standing: c(W),
              name: W.parts.identity,
              onSet: (j) => d(W, j)
            }, null, 8, ["standing", "name", "onSet"])) : I("", !0)
          ])) : I("", !0),
          (f(!0), m(ne, null, me(A(a), (j, de) => (f(), m("td", {
            key: A(ps)(j, de),
            class: ft(P(j)),
            "data-dc-align": A(vs)(j),
            "data-dc-hide": j.hideBelow,
            title: z(j, W)
          }, [
            j === i.value ? (f(), m("span", Pu, [
              ue(Ss, {
                column: j,
                entry: W
              }, null, 8, ["column", "entry"]),
              ue(sn, { entry: W }, null, 8, ["entry"])
            ])) : (f(), Z(Ss, {
              key: 1,
              column: j,
              entry: W
            }, null, 8, ["column", "entry"]))
          ], 10, Su))), 128))
        ], 8, xu))), 128))
      ])
    ], 8, _u)) : (f(), m("p", mu, [
      K[2] || (K[2] = C("span", { class: "dc-table__headline" }, "No columns declared", -1)),
      C("span", gu, [
        Oe(F(L.value) + " has no ", 1),
        K[0] || (K[0] = C("code", null, "columns", -1)),
        K[1] || (K[1] = Oe(" in the schema, so there is no table to draw. ", -1))
      ])
    ]));
  }
}), Er = /* @__PURE__ */ pe(Eu, [["__scopeId", "data-v-a4e80859"]]);
function Au(e) {
  const t = wt([]), n = H(!1), a = wt(null);
  let s = 0;
  const r = (l, c, d, h, k) => ({
    entity: l,
    rows: e.limit.value > 0 ? c.rows.map((_, y) => br(_, y, l, e.isPinned(_.id))) : [],
    total: c.total,
    count: d ? l.count : String(c.total),
    pinned: Tu(h, c, k)
  }), i = () => {
    const l = ++s, c = e.query.value, d = e.schema.value, h = e.entities.value, k = e.limit.value, _ = e.within?.value.trim() ?? "", y = Pa(c) && !_, b = _ ? Ra(_, c.expr) : c.expr, M = h.map((w) => ({
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
        (S, L) => r(M[L].entity, S, y, d, b)
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
function Tu(e, t, n) {
  const a = t.rows[0];
  if (t.total !== 1 || t.rows.length !== 1 || !a)
    return !1;
  const s = n.trim();
  if (!s)
    return !1;
  const r = Wt(e, a);
  return !!r && za(s, r) === s;
}
const Ru = ["data-dc-pending", "data-dc-heads-only"], zu = {
  key: 0,
  class: "dc-types__state",
  role: "alert"
}, Lu = {
  key: 1,
  class: "dc-types__state",
  "aria-live": "polite"
}, Iu = {
  key: 2,
  class: "dc-types__state"
}, Nu = ["data-dc-empty"], Fu = { class: "dc-type__name" }, Ou = { class: "dc-type__count dc-mono" }, Du = { class: "dc-type__sr" }, Bu = {
  key: 0,
  class: "dc-type__description"
}, qu = {
  key: 0,
  class: "dc-type__empty"
}, Vu = { class: "dc-type__identity" }, Ku = { class: "dc-type__primary dc-truncate" }, Hu = { class: "dc-type__secondary dc-mono dc-truncate" }, Wu = { class: "dc-type__trailing dc-mono" }, Uu = { class: "dc-type__metric-value" }, ju = { class: "dc-type__metric-label" }, Gu = {
  key: 0,
  class: "dc-type__date"
}, Xu = ["onClick"], Yu = /* @__PURE__ */ oe({
  __name: "TypeCardsView",
  setup(e) {
    const t = $e(), { previews: n, pending: a, error: s } = Au({
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
      xe(l.$slots, "before", {}, void 0, !0),
      A(s) ? (f(), m("p", zu, " Could not load results: " + F(A(s) instanceof Error ? A(s).message : "the data source failed."), 1)) : !o.value.length && A(a) ? (f(), m("p", Lu, " Running query… ")) : o.value.length ? I("", !0) : (f(), m("p", Iu, F(r.value ? "Nothing matches this query" : "Nothing here yet"), 1)),
      (f(!0), m(ne, null, me(o.value, (d) => (f(), m("section", {
        key: d.entity.key,
        class: "dc-type",
        "data-dc-empty": d.total ? "false" : "true"
      }, [
        ue(Qe, {
          class: "dc-type__head",
          href: A(t).entityHref(d.entity.key),
          onPress: (h) => A(t).setEntity(d.entity.key)
        }, {
          default: Me(() => [
            C("span", Fu, F(d.entity.label), 1),
            C("span", Ou, F(d.count), 1),
            c[0] || (c[0] = C("span", {
              class: "dc-type__go",
              "aria-hidden": "true"
            }, "→", -1)),
            C("span", Du, "Show only " + F(d.entity.label.toLowerCase()), 1),
            d.entity.description ? (f(), m("span", Bu, F(d.entity.description), 1)) : I("", !0)
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        d.total ? I("", !0) : (f(), m("p", qu, F(r.value ? "No matches" : "Nothing here yet"), 1)),
        (f(!0), m(ne, null, me(d.rows, (h) => (f(), m("div", {
          key: h.key,
          class: "dc-type__row"
        }, [
          ue(Qe, {
            class: "dc-type__open",
            href: A(t).pressHref(h.row),
            onPress: (k) => A(t).activate(h.row, k)
          }, {
            default: Me(() => [
              C("span", Vu, [
                C("span", Ku, F(h.parts.identity), 1),
                C("span", Hu, F(h.parts.reference), 1)
              ])
            ]),
            _: 2
          }, 1032, ["href", "onPress"]),
          C("span", Wu, [
            (f(!0), m(ne, null, me(h.parts.metrics.slice(0, 1), (k) => (f(), Z(an, {
              key: k.column.key ?? k.label,
              class: "dc-type__metric",
              entry: h,
              column: k.column
            }, {
              default: Me(() => [
                C("span", Uu, F(k.text), 1),
                C("span", ju, F(k.label), 1)
              ]),
              _: 2
            }, 1032, ["entry", "column"]))), 128)),
            h.parts.updated ? (f(), m("span", Gu, F(h.parts.updated), 1)) : I("", !0),
            ue(Wa, { entry: h }, null, 8, ["entry"]),
            ue(sn, { entry: h }, null, 8, ["entry"])
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
        ], 8, Xu)) : I("", !0)
      ], 8, Nu))), 128)),
      xe(l.$slots, "after", {}, void 0, !0)
    ], 8, Ru));
  }
}), Ar = /* @__PURE__ */ pe(Yu, [["__scopeId", "data-v-4b62e4f9"]]), Qu = ["data-dc-pending"], Zu = {
  key: 1,
  class: "dc-results__state",
  role: "alert"
}, Ju = { class: "dc-results__detail" }, ed = {
  key: 2,
  class: "dc-results__state",
  "aria-live": "polite"
}, td = {
  key: 3,
  class: "dc-results__state"
}, nd = { class: "dc-results__detail" }, ad = /* @__PURE__ */ oe({
  __name: "ResultsArea",
  props: {
    views: {}
  },
  setup(e) {
    const t = e, n = $e(), a = Jt(), s = {
      list: ma,
      cards: xr,
      grid: Mr,
      images: Cr,
      table: Er,
      links: Sr,
      preview: Pr
    }, r = v(() => Ea(n.query.value, t.views)), i = v(() => Rn(n.query.value.view, t.views)), o = v(() => s[i.value] ?? ma), l = v(() => n.rows.value.length > 0), c = v(() => n.error.value !== null), d = H(null);
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
      r.value ? (f(), Z(Ar, { key: 0 }, hn({ _: 2 }, [
        a["cards-before"] ? {
          name: "before",
          fn: Me(() => [
            xe(h.$slots, "cards-before", {}, void 0, !0)
          ]),
          key: "0"
        } : void 0,
        a["cards-after"] ? {
          name: "after",
          fn: Me(() => [
            xe(h.$slots, "cards-after", {}, void 0, !0)
          ]),
          key: "1"
        } : void 0
      ]), 1024)) : c.value ? (f(), m("p", Zu, [
        k[1] || (k[1] = C("span", { class: "dc-results__headline" }, "Could not load results", -1)),
        C("span", Ju, F(A(n).error.value instanceof Error ? A(n).error.value.message : "The data source failed."), 1)
      ])) : !l.value && A(n).pending.value ? (f(), m("p", ed, [...k[2] || (k[2] = [
        C("span", { class: "dc-results__detail" }, "Running query…", -1)
      ])])) : l.value ? (f(), Z(Ca(o.value), { key: 4 })) : (f(), m("div", td, [
        k[3] || (k[3] = C("span", { class: "dc-results__headline" }, "Nothing matches this query", -1)),
        C("span", nd, F(A(n).summary.value), 1),
        A(n).isPristine.value ? I("", !0) : (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-results__clear",
          onClick: k[0] || (k[0] = (_) => A(n).clearFilters())
        }, F(A(n).isEverything.value ? "Clear filters" : "Search everything instead"), 1))
      ]))
    ], 8, Qu));
  }
}), Tr = /* @__PURE__ */ pe(ad, [["__scopeId", "data-v-d06f9125"]]), sd = ["data-dc-theme"], rd = ["data-dc-width", "data-dc-align"], ld = { class: "dc-shell__panel" }, od = /* @__PURE__ */ oe({
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
    const a = e, s = n, r = Ht(e, "open"), i = Ht(e, "pinned"), o = Ht(e, "selected"), l = Jt(), c = It(Vs, null), d = a.route || c ? null : Cl(), h = a.route ?? c ?? d;
    Ue(() => d?.dispose?.());
    const k = v(() => fo({ seed: a.schema.key })), _ = v(() => a.source ?? k.value), y = $o({
      schema: () => a.schema,
      adapter: h,
      defaults: () => a.defaults,
      navigationMode: () => a.navigationMode,
      facetNavigationMode: () => a.facetNavigationMode
    }), b = v(() => a.within?.trim() ?? ""), M = Co({
      query: y.query,
      entity: y.entity,
      setExpression: y.setExpression
    }), w = xo({
      source: _,
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
    const S = Tn() ?? "dc-query-panel", L = H(null);
    function x() {
      r.value && (r.value = !1, Nt(() => {
        L.value?.$el?.querySelector(".dc-header__toggle")?.focus();
      }));
    }
    const E = v(() => new Set(i.value));
    function D($) {
      const B = new Set(E.value);
      B.has($.id) ? B.delete($.id) : B.add($.id), i.value = [...B], s("toggle-pin", $);
    }
    const P = v(() => {
      if (a.selectable === !0) return !0;
      const $ = y.entity.value;
      return !!($?.duplicate || $?.delete || $?.operations?.length);
    }), z = v(() => new Set(o.value));
    function T($) {
      const B = new Set(z.value);
      B.has($.id) ? B.delete($.id) : B.add($.id), o.value = [...B];
    }
    function K($) {
      const B = new Set(z.value);
      for (const ie of w.rows.value)
        $ ? B.add(ie.id) : B.delete(ie.id);
      o.value = [...B];
    }
    function W() {
      o.value.length && (o.value = []);
    }
    const j = v(() => ({
      ids: [...o.value],
      rows: w.rows.value.filter(($) => z.value.has($.id)),
      entity: y.entity.value
    }));
    we(() => y.query.value.entity, W);
    function de($, B, ie = {}) {
      const te = Xn(a.schema, y.query.value, $, ie);
      ie.exclude ? y.narrow(te, B?.key ?? y.query.value.entity) : M.release(() => y.narrow(te, B?.key ?? null, B ? void 0 : "cards")), s("drill", $, B, ie);
    }
    const le = po({
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
      setPage: ($, B) => {
        M.drafting.value ? M.setPage($) : y.setPage($, B);
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
      source: _,
      previewsPerType: v(() => a.previewsPerType),
      within: b,
      pinnable: v(() => a.pinnable === !0),
      isPinned: ($) => E.value.has($.id),
      isPinnedId: ($) => E.value.has($),
      togglePin: D,
      selectable: P,
      selection: j,
      isSelected: ($) => z.value.has($.id),
      toggleSelect: T,
      selectPage: K,
      clearSelection: W,
      narrowsOnPress: v(() => a.rowPress === "narrow"),
      /*
       * The one place a press is read, so every view gets the same answer without
       * knowing which of the two it is: they all call this.
       */
      activate: ($, B = {}) => {
        if (a.rowPress === "narrow" && Wt(a.schema, $)) {
          de($, null, B);
          return;
        }
        s("activate", $);
      },
      pressHref: ($) => a.rowPress === "narrow" && Wt(a.schema, $) ? y.narrowHref(Xn(a.schema, y.query.value, $), null, "cards") : null,
      drillHref: ($, B) => Wt(a.schema, $) ? y.narrowHref(
        Xn(a.schema, y.query.value, $),
        B?.key ?? null,
        B ? void 0 : "cards"
      ) : null,
      create: ($) => s("create", $),
      duplicate: () => s("duplicate", j.value),
      delete: () => s("delete", j.value),
      operate: ($) => s("operate", $, j.value),
      drill: de
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
    }), ($, B) => (f(), m("div", {
      class: "dc-shell",
      "data-dc-theme": e.theme,
      style: Ee(Ae.value)
    }, [
      C("div", {
        class: "dc-shell__head",
        "data-dc-width": e.matchWidth,
        "data-dc-align": e.matchWidth === "shrink" ? e.headAlign : void 0
      }, [
        ue(gr, {
          ref_key: "headerRef",
          ref: L,
          expanded: r.value,
          "panel-id": A(S),
          views: e.views,
          "pages-note": e.pagesNote,
          onToggle: B[0] || (B[0] = (ie) => r.value = !r.value)
        }, hn({ _: 2 }, [
          l.actions ? {
            name: "actions",
            fn: Me(() => [
              xe($.$slots, "actions", {}, void 0, !0)
            ]),
            key: "0"
          } : void 0
        ]), 1032, ["expanded", "panel-id", "views", "pages-note"]),
        r.value ? (f(), m(ne, { key: 0 }, [
          C("div", {
            class: "dc-shell__scrim",
            onClick: x
          }),
          C("div", ld, [
            ue(yr, {
              "panel-id": A(S),
              onClose: x
            }, hn({ _: 2 }, [
              l["panel-section"] ? {
                name: "panel-section",
                fn: Me(() => [
                  xe($.$slots, "panel-section", {}, void 0, !0)
                ]),
                key: "0"
              } : void 0
            ]), 1032, ["panel-id"])
          ])
        ], 64)) : I("", !0)
      ], 8, rd),
      ue(kr, { views: e.views }, null, 8, ["views"]),
      xe($.$slots, "results", {
        rows: A(le).rows.value,
        total: A(le).total.value,
        offset: A(le).offset.value,
        pageCount: A(le).pageCount.value,
        query: A(le).liveQuery.value,
        pending: A(le).pending.value
      }, () => [
        ue(Tr, { views: e.views }, hn({ _: 2 }, [
          l["cards-before"] ? {
            name: "cards-before",
            fn: Me(() => [
              xe($.$slots, "cards-before", {}, void 0, !0)
            ]),
            key: "0"
          } : void 0,
          l["cards-after"] ? {
            name: "cards-after",
            fn: Me(() => [
              xe($.$slots, "cards-after", {}, void 0, !0)
            ]),
            key: "1"
          } : void 0
        ]), 1032, ["views"])
      ], !0)
    ], 12, sd));
  }
}), id = /* @__PURE__ */ pe(od, [["__scopeId", "data-v-441e22d4"]]), cd = ["data-dc-muted", "data-dc-collapsed"], ud = ["data-dc-collapsible"], dd = ["aria-expanded", "aria-controls"], fd = { class: "dc-shell-card__sr" }, pd = { class: "dc-shell-card__title" }, vd = {
  key: 0,
  class: "dc-shell-card__count dc-mono"
}, hd = {
  key: 1,
  class: "dc-shell-card__aside"
}, md = ["data-dc-flush"], gd = /* @__PURE__ */ oe({
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
      return P.some((z) => z.type === $l ? !1 : z.type === xl ? String(z.children ?? "").trim().length > 0 : z.type === ne ? l(z.children ?? []) : !0);
    }
    const c = v(() => !!n.title || d.value || o(i.head)), d = v(() => o(i.aside)), h = v(() => o(i.default)), k = v(() => o(i.foot)), _ = v(() => n.collapsible === !0 && c.value), y = v(() => _.value && (n.collapsed ?? s.value));
    function b() {
      const P = !y.value;
      s.value = P, a("update:collapsed", P);
    }
    const M = Tn() ?? "dc-shell-card", w = `${M}-body`, S = `${M}-foot`, L = v(
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
    function D(P) {
      if (!_.value) return;
      const z = P.target?.closest(x);
      z && E.value?.contains(z) || typeof window < "u" && window.getSelection()?.toString() || b();
    }
    return (P, z) => (f(), m("section", {
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
        "data-dc-collapsible": _.value ? "true" : "false",
        onClick: D
      }, [
        _.value ? (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-shell-card__toggle",
          "aria-expanded": y.value ? "false" : "true",
          "aria-controls": L.value,
          onClick: b
        }, [
          z[0] || (z[0] = C("svg", {
            class: "dc-shell-card__chevron",
            viewBox: "0 0 10 10",
            "aria-hidden": "true"
          }, [
            C("path", { d: "M2 3.5 5 6.5 8 3.5" })
          ], -1)),
          C("span", fd, F(e.title || "Card"), 1)
        ], 8, dd)) : I("", !0),
        xe(P.$slots, "head", {}, () => [
          C("h2", pd, F(e.title), 1),
          e.count !== void 0 ? (f(), m("span", vd, F(e.count), 1)) : I("", !0)
        ], !0),
        d.value ? (f(), m("span", hd, [
          xe(P.$slots, "aside", {}, void 0, !0)
        ])) : I("", !0)
      ], 8, ud)) : I("", !0),
      h.value ? pt((f(), m("div", {
        key: 1,
        id: w,
        class: "dc-shell-card__body",
        "data-dc-flush": e.flush ? "true" : "false"
      }, [
        xe(P.$slots, "default", {}, void 0, !0)
      ], 8, md)), [
        [xn, !y.value]
      ]) : I("", !0),
      k.value ? pt((f(), m("footer", {
        key: 2,
        id: S,
        class: "dc-shell-card__foot"
      }, [
        xe(P.$slots, "foot", {}, void 0, !0)
      ], 512)), [
        [xn, !y.value]
      ]) : I("", !0)
    ], 12, cd));
  }
}), hp = /* @__PURE__ */ pe(gd, [["__scopeId", "data-v-1caf8572"]]), _d = ["aria-label"], yd = ["aria-checked", "data-dc-active", "tabindex", "onClick", "onKeydown"], wd = /* @__PURE__ */ oe({
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
        class: ft(["dc-segmented__item", { "dc-segmented__item--mono": e.mono }]),
        "aria-checked": l.key === e.modelValue,
        "data-dc-active": l.key === e.modelValue ? "true" : "false",
        tabindex: l.key === e.modelValue ? 0 : -1,
        onClick: (d) => a("update:modelValue", l.key),
        onKeydown: (d) => r(d, c)
      }, F(l.label), 43, yd))), 128))
    ], 8, _d));
  }
}), kd = /* @__PURE__ */ pe(wd, [["__scopeId", "data-v-63fb5482"]]), bd = ["data-dc-theme", "aria-label"], $d = ["aria-expanded", "aria-disabled", "disabled", "data-dc-menu", "tabindex", "onClick", "onMouseenter"], xd = /* @__PURE__ */ oe({
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
      const D = i.value[x]?.getBoundingClientRect(), P = n.menus[x];
      !D || !P || !Ut(P) || (l.value = { x: D.left, y: D.bottom + 2, mirrorX: D.right }, o.value = x, c.value = E);
    }
    function k(x) {
      const E = o.value;
      o.value = null, l.value = null, x && E !== null && i.value[E]?.focus();
    }
    function _(x) {
      o.value === x ? k(!0) : h(x, !1);
    }
    function y(x) {
      o.value === null || o.value === x || h(x, !1);
    }
    function b(x, E) {
      const D = d.value;
      if (D.length === 0) return null;
      if (x === null) return E === 1 ? D[0] ?? null : D[D.length - 1] ?? null;
      const P = D.indexOf(x);
      return P === -1 ? D[0] ?? null : D[(P + E + D.length) % D.length] ?? null;
    }
    function M(x) {
      const E = x.key;
      if (E === "Escape") {
        if (o.value === null) return;
        x.preventDefault(), k(!0);
        return;
      }
      if (E === "ArrowDown" && o.value === null) {
        const z = w();
        if (z === null) return;
        x.preventDefault(), h(z, !0);
        return;
      }
      if (E !== "ArrowLeft" && E !== "ArrowRight") return;
      const D = o.value ?? w(), P = b(D, E === "ArrowRight" ? 1 : -1);
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
    }), Ue(() => window.removeEventListener("pointerdown", S, !0));
    function L(x) {
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
      (f(!0), m(ne, null, me(e.menus, (D, P) => (f(), m("button", {
        key: D.id ?? D.label ?? P,
        ref_for: !0,
        ref: (z) => {
          z && (i.value[P] = z);
        },
        type: "button",
        class: "dc-menubar__item",
        role: "menuitem",
        "aria-haspopup": "menu",
        "aria-expanded": o.value === P,
        "aria-disabled": D.disabled ? "true" : void 0,
        disabled: D.disabled,
        "data-dc-menu": D.id ?? D.label,
        tabindex: P === (d.value[0] ?? 0) ? 0 : -1,
        onClick: (z) => _(P),
        onMouseenter: (z) => y(P)
      }, F(D.label), 41, $d))), 128)),
      o.value !== null && l.value ? (f(), Z(Ka, {
        key: o.value,
        items: e.menus[o.value]?.items ?? [],
        at: l.value,
        label: e.menus[o.value]?.label,
        autofocus: c.value,
        onChoose: L,
        onDismiss: E[0] || (E[0] = (D) => k(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : I("", !0)
    ], 44, bd));
  }
}), mp = /* @__PURE__ */ pe(xd, [["__scopeId", "data-v-93dbd2e4"]]), Md = ["aria-label", "aria-expanded", "disabled"], Cd = { "aria-hidden": "true" }, Sd = /* @__PURE__ */ oe({
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
    }), Ue(() => window.removeEventListener("pointerdown", k, !0));
    function _(y) {
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
        C("span", Cd, F(e.glyph), 1)
      ], 40, Md),
      r.value ? (f(), Z(Ka, {
        key: 0,
        ref_key: "menu",
        ref: s,
        items: e.items,
        at: r.value,
        label: e.label,
        autofocus: i.value,
        onChoose: _,
        onDismiss: b[0] || (b[0] = (M) => c(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : I("", !0)
    ], 64));
  }
}), Ua = /* @__PURE__ */ pe(Sd, [["__scopeId", "data-v-48f5ada5"]]), Dt = (e) => e.kind === "split", Y = (e) => e.kind === "group", ae = (e) => e.kind === "float", _t = { x: 16, y: 16, w: 360, h: 260 }, Pn = 28, Rr = 120, ga = 220, zr = 38, Ct = 6;
function rn(e, t) {
  let n = !1;
  const a = e.frames.map((s, r) => {
    const i = t(s.node, r);
    return i === s.node ? s : (n = !0, { ...s, node: i });
  });
  return n ? { ...e, frames: a } : e;
}
function Ye(e) {
  return { kind: "group", panels: [e] };
}
function gp(e, t, n) {
  return {
    kind: "group",
    panels: e,
    ...t ? { active: t } : {},
    ...n ? { title: n } : {}
  };
}
const _e = (e) => typeof e == "string", Fn = (e) => _e(e) ? Ye(e) : e, ln = (e) => _e(e) ? [e] : We(e), Ps = (e) => e.panels.filter(_e), Pd = (e) => e.panels.filter((t) => !_e(t)), Ve = (e, t) => e.panels.includes(t);
function on(e, t, n) {
  let a = !1;
  const s = e.panels.map((r) => {
    if (_e(r) || !ve(r, t)) return r;
    const i = n(r);
    return i !== r && (a = !0), i;
  });
  return a ? { ...e, panels: s } : e;
}
function On(e, t) {
  return { node: e, rect: { ..._t, ...t } };
}
function ja(e, t) {
  return t ? { kind: "float", frames: e, title: t } : { kind: "float", frames: e };
}
function Dn(e, t) {
  const n = { ..._t, ...t };
  return ja(
    e.map(
      (a, s) => On(a, {
        ...n,
        x: n.x + s * Pn,
        y: n.y + s * Pn
      })
    )
  );
}
function Ga(e, t, n, a) {
  return {
    kind: "split",
    direction: e,
    children: t,
    ...n ? { sizes: n } : {},
    ...a ? { title: a } : {}
  };
}
const Xa = (e, t, n) => Ga("row", e, t, n), _p = (e, t, n) => Ga("column", e, t, n);
function Ce(e) {
  return {
    ...e.title ? { title: e.title } : {},
    ...e.fixedView ? { fixedView: !0 } : {},
    ...e.headless ? { headless: !0 } : {}
  };
}
const kt = (e) => e.fixedView === !0 || e.headless === !0 || !!e.title, Ed = (e) => ({ ...e, headless: !0 }), yp = (e) => ({ ...e, fixedView: !0 }), Ad = (e) => e === "left" || e === "right" ? "row" : "column";
function We(e) {
  return Y(e) ? e.panels.flatMap(ln) : ae(e) ? e.frames.flatMap((t) => We(t.node)) : e.children.flatMap(We);
}
function ve(e, t) {
  return Y(e) ? e.panels.some((n) => _e(n) ? n === t : ve(n, t)) : ae(e) ? e.frames.some((n) => ve(n.node, t)) : e.children.some((n) => ve(n, t));
}
const Lr = (e) => We(e).length === 0, _a = (e) => !Y(e) && kt(e), ya = (e) => Lr(e) && !_a(e);
function Bn(e) {
  return Dt(e) ? e.children.map((t, n) => ({ node: t, index: n })) : ae(e) ? e.frames.map((t, n) => ({ node: t.node, index: n })) : e.panels.flatMap((t, n) => _e(t) ? [] : [{ node: t, index: n }]);
}
const Ya = (e) => Bn(e).map((t) => t.node);
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
  if (Y(e)) {
    const n = e.panels[xt(e)];
    return n === void 0 ? "" : Re(n);
  }
  if (ae(e)) {
    const n = e.frames[e.frames.length - 1];
    return n ? Re(n.node) : "";
  }
  const t = e.children[0];
  return t ? Re(t) : "";
}
function Tt(e, t) {
  if (Y(e) && Ve(e, t)) return e;
  for (const n of Ya(e)) {
    const a = Tt(n, t);
    if (a) return a;
  }
  return null;
}
function Td(e) {
  const t = Ya(e).flatMap(Td);
  return Y(e) ? [e, ...t] : t;
}
function Pe(e, t) {
  if (Y(e)) {
    for (const n of Pd(e)) {
      const a = Pe(n, t);
      if (a) return a;
    }
    return null;
  }
  if (ae(e)) {
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
function Jn(e, t, n = Rr) {
  const a = (o, l) => l > 0 ? Math.max(Math.min(o, l), Math.min(n, l)) : Math.max(o, n), s = a(e.w, t.w), r = a(e.h, t.h), i = (o, l, c) => Math.min(Math.max(o, 0), Math.max(c - l, 0));
  return {
    x: Math.round(i(e.x, s, t.w)),
    y: Math.round(i(e.y, r, t.h)),
    w: Math.round(s),
    h: Math.round(r)
  };
}
function Es(e, t, n, a, s = Rr) {
  let { x: r, y: i, w: o, h: l } = e;
  return t.includes("e") && (o = e.w + n), t.includes("w") && (o = e.w - n, r = e.x + n), t.includes("s") && (l = e.h + a), t.includes("n") && (l = e.h - a, i = e.y + a), o < s && (t.includes("w") && (r = e.x + e.w - s), o = s), l < s && (t.includes("n") && (i = e.y + e.h - s), l = s), { x: r, y: i, w: o, h: l };
}
const Nr = (e, t) => e.x === t.x && e.y === t.y && e.w === t.w && e.h === t.h;
function Rt(e, t, n) {
  if (Y(e)) return on(e, t, (r) => Rt(r, t, n));
  if (ae(e)) {
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
function Rd(e, t, n) {
  return Rt(e, t, (a) => Nr(a.rect, n) ? a : { ...a, rect: n });
}
const ut = (e) => e.maximized === !0, Fr = (e) => (t) => {
  if (ut(t) === e) return t;
  if (e) {
    const { minimized: s, ...r } = t;
    return { ...r, maximized: !0 };
  }
  const { maximized: n, ...a } = t;
  return a;
};
function zd(e, t, n = !0) {
  return Rt(e, t, Fr(n));
}
function wp(e, t) {
  const n = Pe(e, t);
  return n ? zd(e, t, !ut(n)) : e;
}
const gt = (e) => e.minimized === !0, Or = (e) => (t) => {
  if (gt(t) === e) return t;
  if (e) {
    const { maximized: s, ...r } = t;
    return { ...r, minimized: !0 };
  }
  const { minimized: n, ...a } = t;
  return a;
};
function Ld(e, t, n = !0) {
  return Rt(e, t, Or(n));
}
function kp(e, t) {
  const n = Pe(e, t);
  return n ? Ld(e, t, !gt(n)) : e;
}
function mt(e, t) {
  const n = t[t.length - 1];
  if (n === void 0) return null;
  const a = Ke(e, t.slice(0, -1));
  return !a || !ae(a) ? null : a.frames[n] ?? null;
}
function wa(e, t) {
  if (ae(e)) {
    for (const [n, a] of e.frames.entries()) {
      if (!ve(a.node, t)) continue;
      const s = wa(a.node, t);
      return s ? [n, ...s] : [n];
    }
    return null;
  }
  for (const { node: n, index: a } of Bn(e)) {
    if (!ve(n, t)) continue;
    const s = wa(n, t);
    return s ? [a, ...s] : null;
  }
  return null;
}
function Qa(e, t, n) {
  const a = t[t.length - 1];
  if (a === void 0) return e;
  const s = t.slice(0, -1), r = Ke(e, s);
  if (!r || !ae(r)) return e;
  const i = r.frames[a];
  if (!i) return e;
  const o = n(i);
  if (o === i) return e;
  const l = [...r.frames];
  return l[a] = o, st(e, s, { ...r, frames: l });
}
function As(e, t, n) {
  return Qa(
    e,
    t,
    (a) => Nr(a.rect, n) ? a : { ...a, rect: n }
  );
}
function Id(e, t, n = !0) {
  return Qa(e, t, Fr(n));
}
function Nd(e, t, n = !0) {
  return Qa(e, t, Or(n));
}
function jt(e, t) {
  const [n, ...a] = t;
  if (n === void 0) return e;
  if (ae(e)) {
    const i = e.frames[n];
    if (!i) return e;
    const o = jt(i.node, a), l = o === i.node ? i : { ...i, node: o };
    if (n === e.frames.length - 1 && l === i) return e;
    const c = [...e.frames];
    return c.splice(n, 1), c.push(l), { ...e, frames: c };
  }
  const s = Ke(e, [n]);
  if (!s) return e;
  const r = jt(s, a);
  return r === s ? e : st(e, [n], r);
}
function Fd(e, t) {
  const n = [...t];
  let a = e;
  return t.forEach((s, r) => {
    a && (ae(a) && (n[r] = a.frames.length - 1), a = Ke(a, [s]));
  }), n;
}
function _n(e, t, n, a) {
  if (Y(e)) return on(e, n, (i) => _n(i, t, n, a));
  if (ae(e)) {
    const i = e.frames.findIndex((l) => ve(l.node, n)), o = e.frames[i];
    if (!o) return e;
    if (Pe(o.node, n)) {
      const l = _n(o.node, t, n, a);
      if (l === o.node) return e;
      const c = [...e.frames];
      return c[i] = { ...o, node: l }, { ...e, frames: c };
    }
    return { ...e, frames: [...e.frames, On(Ye(t), a)] };
  }
  if (!ve(e, n)) return e;
  let s = !1;
  const r = e.children.map((i) => {
    const o = _n(i, t, n, a);
    return o !== i && (s = !0), o;
  });
  return s ? { ...e, children: r } : e;
}
function Ts(e, t, n, a) {
  if (t === n || !ve(e, t) || !ve(e, n) || !Pe(e, n)) return e;
  const s = yt(e, t);
  if (!s) return e;
  const r = _n(s, t, n, a);
  return r === s ? e : be(r);
}
function Od(e, t, n) {
  return ae(e) ? { ...e, frames: [...e.frames, On(Ye(t), n)] } : Y(e) ? Br(e, t) : {
    kind: "split",
    direction: e.direction,
    children: [...e.children, Ye(t)],
    sizes: [...it(e), 1],
    ...Ce(e)
  };
}
function Dr(e, t, n, a) {
  const s = n[0];
  if (s === void 0) return Od(e, t, a);
  const r = n.slice(1), i = (d, h) => h === s ? Dr(d, t, r, a) : yt(d, t);
  if (ae(e)) {
    const d = e.frames.flatMap((h, k) => {
      const _ = i(h.node, k);
      return _ ? [_ === h.node ? h : { ...h, node: _ }] : [];
    });
    return { ...e, frames: d };
  }
  if (Y(e)) {
    const d = xt(e), h = [];
    e.panels.forEach((y, b) => {
      if (_e(y)) {
        y !== t && h.push(y);
        return;
      }
      const M = i(y, b);
      M && h.push(M);
    });
    const _ = e.active && h.some((y) => ln(y).includes(e.active)) ? e.active : Re(h[d] ?? h[h.length - 1]);
    return {
      kind: "group",
      panels: h,
      ..._ ? { active: _ } : {},
      ...Ce(e)
    };
  }
  const o = it(e), l = [], c = [];
  return e.children.forEach((d, h) => {
    const k = i(d, h);
    k && (l.push(k), c.push(o[h] ?? 0));
  }), { kind: "split", direction: e.direction, children: l, sizes: c, ...Ce(e) };
}
function Rs(e, t, n, a) {
  const s = Ke(e, n);
  return !s || !Lr(s) || !ve(e, t) ? e : be(Dr(e, t, n, a));
}
function ea(e, t) {
  if (Y(e)) return on(e, t, (s) => ea(s, t));
  if (ae(e)) {
    const s = e.frames.findIndex((c) => ve(c.node, t)), r = e.frames[s];
    if (!r) return e;
    const i = ea(r.node, t), o = i === r.node ? r : { ...r, node: i };
    if (s === e.frames.length - 1 && o === r) return e;
    const l = [...e.frames];
    return l.splice(s, 1), l.push(o), { ...e, frames: l };
  }
  if (!ve(e, t)) return e;
  let n = !1;
  const a = e.children.map((s) => {
    const r = ea(s, t);
    return r !== s && (n = !0), r;
  });
  return n ? { ...e, children: a } : e;
}
function Za(e, t) {
  if (e <= 0) return [];
  const n = () => Array.from({ length: e }, () => 1 / e);
  if (!t || t.length !== e) return n();
  const a = t.map((r) => Number.isFinite(r) && r > 0 ? r : 0), s = a.reduce((r, i) => r + i, 0);
  return s <= 0 ? n() : a.map((r) => r / s);
}
const it = (e) => Za(e.children.length, e.sizes), Ze = (e) => {
  const t = Y(e) ? e.panels.length : e.children.length;
  return e.places?.length === t ? e.places : void 0;
};
function be(e) {
  if (Y(e)) return Dd(e);
  if (ae(e)) {
    const o = e.frames.flatMap((l) => {
      const c = be(l.node);
      return ya(c) ? [] : [c === l.node ? l : { ...l, node: c }];
    });
    return o.length === e.frames.length && o.every((l, c) => l === e.frames[c]) ? e : { ...e, frames: o };
  }
  if (e.children.length === 0) return e;
  const t = it(e), n = Ze(e), a = [], s = [], r = [];
  e.children.forEach((o, l) => {
    const c = be(o), d = t[l] ?? 0;
    if (ya(c)) return;
    if (!n && Dt(c) && c.direction === e.direction && !Ze(c) && !kt(c)) {
      const k = it(c);
      c.children.forEach((_, y) => {
        a.push(_), s.push(d * (k[y] ?? 0));
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
    sizes: Za(a.length, s),
    ...Ce(e),
    ...r.length === a.length && r.length > 0 ? { places: r } : {}
  };
}
function Dd(e) {
  if (e.panels.every(_e)) return e;
  const t = Re(e), n = Ze(e), a = [], s = [];
  e.panels.forEach((o, l) => {
    const c = n?.[l];
    if (_e(o)) {
      a.push(o), c && s.push(c);
      return;
    }
    const d = be(o);
    if (!ya(d)) {
      if (Y(d) && !kt(d) && !Ze(d) && !e.headless) {
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
    ...Ce(e),
    ...s.length === a.length && s.length > 0 ? { places: s } : {}
  };
}
function yt(e, t) {
  if (ae(e)) {
    const i = e.frames.flatMap((o) => {
      const l = yt(o.node, t);
      return l ? [l === o.node ? o : { ...o, node: l }] : [];
    });
    return i.length === 0 && !_a(e) ? null : { ...e, frames: i };
  }
  if (Y(e)) {
    if (!ve(e, t)) return e;
    const i = xt(e), o = [];
    for (const d of e.panels) {
      if (_e(d)) {
        d !== t && o.push(d);
        continue;
      }
      const h = yt(d, t);
      h && o.push(h);
    }
    if (o.length === 0) return null;
    const c = e.active && o.some((d) => ln(d).includes(e.active)) ? e.active : Re(o[i] ?? o[o.length - 1]);
    return c ? { kind: "group", panels: o, active: c, ...Ce(e) } : { kind: "group", panels: o, ...Ce(e) };
  }
  const n = it(e), a = [], s = [];
  if (e.children.forEach((i, o) => {
    const l = yt(i, t);
    l && (a.push(l), s.push(n[o] ?? 0));
  }), a.length === 0)
    return _a(e) ? { kind: "split", direction: e.direction, children: a, sizes: [], ...Ce(e) } : null;
  const r = a[0];
  return a.length === 1 && r && !kt(e) ? r : be({
    kind: "split",
    direction: e.direction,
    children: a,
    sizes: s,
    ...Ce(e)
  });
}
function Br(e, t, n) {
  const a = e.panels.filter((r) => r !== t), s = n === void 0 ? a.length : Math.max(0, Math.min(n, a.length));
  return a.splice(s, 0, t), { kind: "group", panels: a, active: t, ...Ce(e) };
}
function Kt(e, t, n, a, s) {
  const r = (_) => rn(
    _,
    (y) => ve(y, n) ? Kt(y, t, n, a, s) : y
  );
  if (a === "float") return e;
  const i = (_) => on(_, n, (y) => Kt(y, t, n, a, s));
  if (a === "center")
    return Y(e) ? Ve(e, n) ? Br(e, t, s) : i(e) : ae(e) ? r(e) : {
      ...e,
      children: e.children.map(
        (_) => ve(_, n) ? Kt(_, t, n, a, s) : _
      )
    };
  const o = Ad(a), l = a === "left" || a === "top", c = (_) => ({
    kind: "split",
    direction: o,
    children: l ? [Ye(t), _] : [_, Ye(t)],
    sizes: [0.5, 0.5]
  });
  if (Y(e)) return Ve(e, n) ? c(e) : i(e);
  if (ae(e)) return r(e);
  const d = it(e), h = e.children.findIndex(
    (_) => Y(_) && Ve(_, n)
  );
  if (h >= 0 && e.direction === o) {
    const _ = (d[h] ?? 0) / 2, y = [...e.children], b = [...d];
    return y.splice(l ? h : h + 1, 0, Ye(t)), b.splice(h, 1, _, _), {
      kind: "split",
      direction: o,
      children: y,
      sizes: b,
      ...Ce(e)
    };
  }
  const k = e.children.map((_) => ve(_, n) ? Y(_) && Ve(_, n) ? c(_) : Kt(_, t, n, a) : _);
  return {
    kind: "split",
    direction: e.direction,
    children: k,
    sizes: d,
    ...Ce(e)
  };
}
function zt(e, t) {
  if (Y(e)) {
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
  if (ae(e)) return rn(e, (s) => zt(s, t));
  let n = !1;
  const a = e.children.map((s) => {
    const r = zt(s, t);
    return r !== s && (n = !0), r;
  });
  return n ? { ...e, children: a } : e;
}
function Gt(e, t, n) {
  if (Y(e)) {
    if (!Ve(e, t)) return on(e, t, (c) => Gt(c, t, n));
    const a = e.panels.indexOf(t), s = Math.max(0, Math.min(n, e.panels.length - 1));
    if (a === s) return e;
    const r = [...e.panels];
    r.splice(a, 1), r.splice(s, 0, t);
    const i = Ze(e), o = i ? [...i] : void 0;
    o && o.splice(s, 0, ...o.splice(a, 1));
    const l = Re(e);
    return {
      kind: "group",
      panels: r,
      ...l ? { active: l } : {},
      ...Ce(e),
      ...o ? { places: o } : {}
    };
  }
  return ve(e, t) ? ae(e) ? rn(e, (a) => Gt(a, t, n)) : { ...e, children: e.children.map((a) => Gt(a, t, n)) } : e;
}
function yn(e, t, n) {
  if (t === n) return e;
  if (Y(e)) {
    if (!ve(e, t) && !ve(e, n)) return e;
    const a = (r) => r === t ? n : r === n ? t : r, s = e.panels.map((r) => _e(r) ? a(r) : yn(r, t, n));
    return { ...e, panels: s, ...e.active ? { active: a(e.active) } : {} };
  }
  return ae(e) ? rn(e, (a) => yn(a, t, n)) : { ...e, children: e.children.map((a) => yn(a, t, n)) };
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
  const i = yt(e, t);
  return i ? be(Kt(i, t, n, a, s)) : e;
}
function qr(e, t, n) {
  if (Y(e)) {
    const s = e.panels[t];
    if (s === void 0 || _e(s)) return e;
    const r = [...e.panels];
    return r[t] = n, { ...e, panels: r };
  }
  if (ae(e)) {
    const s = e.frames[t];
    if (!s) return e;
    const r = [...e.frames];
    return r[t] = { ...s, node: n }, { ...e, frames: r };
  }
  const a = [...e.children];
  return a[t] = n, { ...e, children: a };
}
function cn(e, t, n) {
  const a = Bn(e);
  if (!Y(e) && a.some(({ node: s }) => Y(s) && Ve(s, t))) {
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
function bp(e, t, n) {
  const a = cn(
    e,
    t,
    (s) => Dt(s) && s.direction !== n ? { ...s, direction: n } : s
  );
  return a ? be(a) : e;
}
function Vr(e) {
  return ae(e) ? [e] : Ze(e) || kt(e) ? [e] : Y(e) ? [...e.panels] : e.children.flatMap(Vr);
}
function Kr(e, t) {
  if (Y(e)) return e;
  const n = Ya(e).map(Vr), a = n.flat(), s = t && a.some((i) => ln(i).includes(t)) ? t : void 0, r = Bd(e, n);
  return be({
    kind: "group",
    panels: a,
    ...s ? { active: s } : {},
    ...Ce(e),
    ...r ? { places: r } : {}
  });
}
function Bd(e, t) {
  const n = ae(e) ? e.frames.map(({ node: a, ...s }) => s) : Ze(e);
  if (n)
    return t.every((a) => a.length === 1) ? n : void 0;
}
function qd(e, t) {
  const n = cn(e, t, (a) => Kr(a, t));
  return n ? be(n) : e;
}
function Ja(e, t, n) {
  if (Y(e) && Ve(e, t)) {
    const a = n(e);
    return a === e ? null : a;
  }
  for (const { node: a, index: s } of Bn(e)) {
    if (!ve(a, t)) continue;
    const r = Ja(a, t, n);
    return r ? qr(e, s, r) : null;
  }
  return null;
}
function zs(e, t, n) {
  const a = Ja(e, t, (s) => Hr(s, n));
  return a ? be(a) : e;
}
function Ls(e, t, n) {
  const a = Ke(e, t);
  return !a || !Y(a) || a.panels.length < 2 ? e : be(st(e, t, Hr(a, n)));
}
function Hr(e, t) {
  if (e.panels.length < 2) return e;
  const n = Ze(e);
  return {
    ...Ga(t, e.panels.map(Fn)),
    ...Ce(e),
    ...n ? { places: n } : {}
  };
}
function ka(e, t) {
  if (Y(e)) return e;
  if (ae(e)) {
    const s = e.frames.findIndex(
      (o) => Y(o.node) && o.node.panels.includes(t)
    ), r = e.frames[s], i = r && Y(r.node) ? r.node : null;
    if (r && i && i.panels.length > 1) {
      const o = Dn(i.panels.map(Fn), r.rect).frames;
      return {
        ...e,
        frames: [...e.frames.slice(0, s), ...o, ...e.frames.slice(s + 1)]
      };
    }
    return rn(e, (o) => ka(o, t));
  }
  if (!ve(e, t)) return e;
  let n = !1;
  const a = e.children.map((s) => {
    const r = ka(s, t);
    return r !== s && (n = !0), r;
  });
  return n ? { ...e, children: a } : e;
}
function Vd(e, t, n) {
  const a = Tt(e, t);
  if (!a || a.panels.length < 2) return e;
  if (Pe(e, t)?.node === a) {
    const i = ka(e, t);
    return i === e ? e : be(i);
  }
  const r = Ja(e, t, (i) => Wr(i, n));
  return r ? be(r) : e;
}
function Kd(e, t, n) {
  const a = Ke(e, t);
  if (!a || !Y(a) || a.panels.length < 2) return e;
  const s = t.slice(0, -1), r = t.length > 0 ? Ke(e, s) : null, i = t[t.length - 1], o = r && ae(r) && i !== void 0 ? r.frames[i] : void 0;
  if (r && ae(r) && o && i !== void 0) {
    const l = Dn(a.panels.map(Fn), o.rect).frames, c = [...r.frames.slice(0, i), ...l, ...r.frames.slice(i + 1)];
    return be(st(e, s, { ...r, frames: c }));
  }
  return be(st(e, t, Wr(a, n)));
}
function Wr(e, t) {
  return {
    ...ja(Ur(e.panels.map(Fn), Ze(e), t)),
    ...Ce(e)
  };
}
function Ur(e, t, n) {
  return t ? e.map((a, s) => ({ ...t[s], node: a })) : Dn(e, n).frames;
}
function jr(e, t) {
  return { ...ja(Ur(e.children, Ze(e), t)), ...Ce(e) };
}
function $p(e, t, n) {
  const a = cn(
    e,
    t,
    (s) => ae(s) ? s : jr(s, n)
  );
  return a ? be(a) : Y(e) && Ve(e, t) ? Dn([e], n) : e;
}
function Hd(e, t) {
  const n = (s) => t === "column" ? s.rect.y : s.rect.x, a = (s) => t === "column" ? s.rect.x : s.rect.y;
  return [...e].sort((s, r) => n(s) - n(r) || a(s) - a(r));
}
function Gr(e, t) {
  const n = Hd(e.frames, t);
  return {
    kind: "split",
    direction: t,
    children: n.map((a) => a.node),
    ...Ce(e),
    places: n.map(({ node: a, ...s }) => s)
  };
}
function xp(e, t, n = "row") {
  const a = cn(
    e,
    t,
    (s) => ae(s) ? Gr(s, n) : s
  );
  return a ? be(a) : e;
}
function Xr(e) {
  if (ae(e)) return null;
  const t = Y(e) ? e.panels.length === 1 ? e.panels[0] : void 0 : e.children.length === 1 ? e.children[0] : void 0;
  return t === void 0 || _e(t) || Y(t) && t.panels.length === 1 && _e(t.panels[0]) ? null : t;
}
const Wd = (e) => {
  const { title: t, fixedView: n, headless: a, ...s } = e;
  return s;
};
function Ud(e, t) {
  const n = Xr(e);
  return n ? t === "inner" ? n : { ...Wd(n), ...Ce(e) } : e;
}
function Ot(e) {
  return e.title ? e.title : Y(e) ? "" : ae(e) ? "Desktop" : e.direction === "row" ? "Row" : "Column";
}
function Xt(e, t) {
  if (Y(e)) {
    const a = e.panels[xt(e)];
    return a === void 0 ? "" : _e(a) ? t(a) ?? a : Ot(a) || Xt(a, t);
  }
  if (e.title) return e.title;
  if (ae(e)) {
    const a = e.frames[e.frames.length - 1];
    return a ? a.title ?? Xt(a.node, t) : "";
  }
  const n = e.children[0];
  return n ? Xt(n, t) : "";
}
function Ke(e, t) {
  let n = e;
  for (const a of t) {
    if (!n) return null;
    if (Dt(n)) n = n.children[a];
    else if (ae(n)) n = n.frames[a]?.node;
    else {
      const s = n.panels[a];
      n = s === void 0 || _e(s) ? void 0 : s;
    }
  }
  return n ?? null;
}
function st(e, t, n) {
  if (t.length === 0) return n;
  const [a, ...s] = t;
  if (a === void 0) return e;
  if (ae(e)) {
    const l = e.frames[a];
    if (!l) return e;
    const c = st(l.node, s, n);
    if (c === l.node) return e;
    const d = [...e.frames];
    return d[a] = { ...l, node: c }, { ...e, frames: d };
  }
  if (Y(e)) {
    const l = e.panels[a];
    if (l === void 0 || _e(l)) return e;
    const c = st(l, s, n);
    if (c === l) return e;
    const d = [...e.panels];
    return d[a] = c, { ...e, panels: d };
  }
  const r = e.children[a];
  if (!r) return e;
  const i = st(r, s, n);
  if (i === r) return e;
  const o = [...e.children];
  return o[a] = i, { ...e, children: o };
}
function wn(e, t, n) {
  if (t.length === 0)
    return Dt(e) ? { ...e, sizes: Za(e.children.length, n) } : e;
  const [a, ...s] = t;
  if (a === void 0) return e;
  if (ae(e)) {
    const o = e.frames[a];
    if (!o) return e;
    const l = wn(o.node, s, n);
    if (l === o.node) return e;
    const c = [...e.frames];
    return c[a] = { ...o, node: l }, { ...e, frames: c };
  }
  if (Y(e)) {
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
  if (!Y(e) || e.panels.length >= 2) return e;
  const t = e.panels[0];
  return t !== void 0 && !_e(t) ? e : { ...Xa([jd(e)]), ...Ce(e) };
}
const jd = (e) => {
  if (!e.title) return e;
  const { title: t, ...n } = e;
  return n;
};
function Ns(e) {
  return e.length === 0 ? null : Xa(e.map(Ye));
}
function Gd(e, t) {
  if (!e) return Ns(t);
  const n = new Set(t), a = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
  for (const l of We(e))
    !n.has(l) || a.has(l) ? s.add(l) : a.add(l);
  let r = e;
  for (const l of s)
    r = r ? yt(r, l) : null;
  const i = new Set(r ? We(r) : []), o = t.filter((l) => !i.has(l));
  if (o.length === 0) return r ? En(be(r)) : null;
  if (!r) return Ns(o);
  if (ae(r)) {
    const l = r.frames.length;
    return {
      ...r,
      frames: [
        ...r.frames,
        ...o.map(
          (c, d) => On(Ye(c), {
            x: _t.x + (l + d) * Pn,
            y: _t.y + (l + d) * Pn
          })
        )
      ]
    };
  }
  return En(be(Xa([r, ...o.map(Ye)])));
}
const es = Symbol("dc.windowContext");
function Xd(e) {
  return Ma(es, e), e;
}
function qn() {
  const e = It(es, null);
  if (!e)
    throw new Error(
      "[header-content-layout] No window context found. Render this component inside <WindowFrame>."
    );
  return e;
}
const Yd = 320, Qd = 240;
function Zd(e) {
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
function Jd(e, t) {
  if (typeof window > "u") return null;
  const n = Math.max(Yd, Math.round(t?.width ?? window.innerWidth)), a = Math.max(Qd, Math.round(t?.height ?? window.innerHeight)), s = ["popup", `width=${n}`, `height=${a}`];
  t?.left !== void 0 && s.push(`left=${t.left}`), t?.top !== void 0 && s.push(`top=${t.top}`);
  const r = window.open(e, "_blank", s.join(","));
  if (r)
    try {
      r.opener = null;
    } catch {
    }
  return r;
}
const ef = ["data-dc-glyph"], tf = { class: "dc-glyph__line" }, nf = ["d"], af = {
  key: 0,
  class: "dc-glyph__aqua"
}, sf = ["d"], rf = /* @__PURE__ */ oe({
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
      C("g", tf, [
        (f(!0), m(ne, null, me(t[e.kind], (r) => (f(), m("path", {
          key: r,
          d: r
        }, null, 8, nf))), 128))
      ]),
      n[e.kind] ? (f(), m("g", af, [
        (f(!0), m(ne, null, me(n[e.kind], (r) => (f(), m("path", {
          key: r,
          d: r
        }, null, 8, sf))), 128))
      ])) : I("", !0)
    ], 8, ef));
  }
}), Lt = /* @__PURE__ */ pe(rf, [["__scopeId", "data-v-4d2872c0"]]), lf = ["data-dc-order", "data-dc-path", "data-dc-maximized", "data-dc-minimized", "data-dc-dragging"], of = ["data-dc-movable"], cf = { class: "dc-float__title dc-truncate" }, uf = {
  key: 1,
  class: "dc-float__controls dc-controls"
}, df = ["aria-label", "aria-pressed", "data-dc-minimize"], ff = ["aria-label", "aria-pressed", "data-dc-maximize"], pf = ["aria-label", "data-dc-close"], vf = { class: "dc-float__content" }, hf = ["data-dc-handle", "onPointerdown"], mf = /* @__PURE__ */ oe({
  __name: "WindowFloat",
  props: {
    frame: {},
    path: {},
    order: {},
    place: {}
  },
  setup(e) {
    const t = e, n = qn(), a = v(() => Re(t.frame.node)), s = v(() => n.panelFor(a.value)?.fixed === !0), r = v(() => ut(t.frame)), i = v(() => gt(t.frame)), o = v(() => r.value || i.value), l = v(() => n.resizable.value && !s.value && !o.value), c = v(() => n.movable.value && !s.value && !o.value), d = v(() => {
      const E = We(t.frame.node);
      return E.length === 1 ? E[0] ?? null : null;
    }), h = v(() => d.value !== null && n.closable(d.value)), k = v(() => t.frame.node.headless === !0), _ = v(
      () => !k.value && (!Y(t.frame.node) || i.value)
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
    }), L = v(() => ({
      // Neither maximizing nor rolling up overwrites the rect: it is where the
      // window goes back to, and both are a way of not being there for a while.
      ...r.value ? { inset: "0" } : i.value && t.place ? {
        left: `${t.place.x}px`,
        bottom: `${t.place.bottom}px`,
        width: `${ga}px`,
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
    return (E, D) => (f(), m("div", {
      class: "dc-float",
      style: Ee(L.value),
      "data-dc-order": e.order,
      "data-dc-path": e.path.join("/"),
      "data-dc-maximized": r.value ? "true" : "false",
      "data-dc-minimized": i.value ? "true" : "false",
      "data-dc-dragging": S.value ? "true" : "false",
      onPointerdown: D[3] || (D[3] = (P) => A(n).raiseAt(e.path))
    }, [
      _.value ? (f(), m("header", {
        key: 0,
        class: "dc-float__bar",
        "data-dc-movable": c.value ? "true" : "false",
        onPointerdown: M,
        onDblclick: w
      }, [
        C("span", cf, F(y.value), 1),
        b.value.length ? (f(), Z(Ua, {
          key: 0,
          items: b.value,
          label: `${y.value} menu`
        }, null, 8, ["items", "label"])) : I("", !0),
        !s.value || i.value && h.value && d.value ? (f(), m("div", uf, [
          s.value ? I("", !0) : (f(), m("button", {
            key: 0,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `${i.value ? "Unroll" : "Minimize"} ${y.value}`,
            "aria-pressed": i.value,
            "data-dc-minimize": a.value,
            onClick: D[0] || (D[0] = (P) => A(n).toggleMinimizeAt(e.path))
          }, [
            ue(Lt, {
              kind: i.value ? "unroll" : "minimize"
            }, null, 8, ["kind"])
          ], 8, df)),
          s.value ? I("", !0) : (f(), m("button", {
            key: 1,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `${r.value ? "Restore" : "Maximize"} ${y.value}`,
            "aria-pressed": r.value,
            "data-dc-maximize": a.value,
            onClick: D[1] || (D[1] = (P) => A(n).toggleMaximizeAt(e.path))
          }, [
            ue(Lt, {
              kind: r.value ? "restore" : "maximize"
            }, null, 8, ["kind"])
          ], 8, ff)),
          i.value && h.value && d.value ? (f(), m("button", {
            key: 2,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `Close ${y.value}`,
            "data-dc-close": d.value,
            onClick: D[2] || (D[2] = (P) => A(n).close(d.value))
          }, [
            ue(Lt, { kind: "close" })
          ], 8, pf)) : I("", !0)
        ])) : I("", !0)
      ], 40, of)) : I("", !0),
      C("div", vf, [
        xe(E.$slots, "default", {}, void 0, !0)
      ]),
      (f(!0), m(ne, null, me(l.value ? x : [], (P) => (f(), m("span", {
        key: P,
        class: "dc-float__grip",
        "data-dc-handle": P,
        "aria-hidden": "true",
        onPointerdown: Fe((z) => A(n).beginFrameDragAt(e.path, z, P), ["stop"])
      }, null, 40, hf))), 128))
    ], 44, lf));
  }
}), gf = /* @__PURE__ */ pe(mf, [["__scopeId", "data-v-f035684c"]]), ts = Symbol("dc.paneContext");
function Yr(e) {
  return Ma(ts, e), e;
}
function Mp() {
  return It(ts, null);
}
function Cp(e) {
  const t = It(es, null), n = It(ts, null);
  if (!t || !n) return () => {
  };
  const a = t.registerMenu(
    () => n.panel.value,
    () => Pt(e)
  );
  return An() && Zt(a), a;
}
const _f = ["data-dc-panel"], yf = /* @__PURE__ */ oe({
  __name: "WindowPaneBody",
  props: {
    panel: {},
    active: { type: Boolean }
  },
  setup(e) {
    const t = e, n = qn();
    Yr({ panel: v(() => t.panel) });
    const a = () => {
      const s = n.panelFor(t.panel);
      return s ? n.renderContent(s, n.viewFor(t.panel), t.active) ?? null : null;
    };
    return (s, r) => (f(), m("div", {
      class: "dc-pane__content",
      "data-dc-panel": t.panel
    }, [
      ue(a)
    ], 8, _f));
  }
}), wf = /* @__PURE__ */ pe(yf, [["__scopeId", "data-v-31c655fd"]]), kf = ["data-dc-panel", "data-dc-panels", "data-dc-tabbed", "data-dc-floating", "data-dc-maximized", "data-dc-headless", "data-dc-active", "data-dc-dragging", "aria-label"], bf = ["data-dc-movable"], $f = ["aria-label", "aria-pressed"], xf = ["data-dc-space-name"], Mf = { class: "dc-truncate" }, Cf = ["aria-label"], Sf = {
  key: 0,
  class: "dc-pane__insert",
  "aria-hidden": "true"
}, Pf = ["id", "data-dc-panel", "data-dc-space", "aria-selected", "aria-controls", "tabindex", "onPointerdown", "onClick", "onKeydown"], Ef = { class: "dc-tab__name dc-truncate" }, Af = {
  key: 0,
  class: "dc-pane__sub dc-mono dc-truncate"
}, Tf = ["aria-label", "data-dc-close", "onClick"], Rf = {
  key: 0,
  class: "dc-pane__insert",
  "aria-hidden": "true"
}, zf = { class: "dc-pane__tools" }, Lf = {
  key: 2,
  class: "dc-pane__controls dc-controls"
}, If = ["aria-label", "data-dc-minimize"], Nf = ["aria-label", "aria-pressed", "data-dc-maximize"], Ff = ["aria-label", "data-dc-close"], Of = ["id", "role", "aria-labelledby"], Df = ["id", "role", "aria-labelledby"], Bf = ["data-dc-edge"], qf = /* @__PURE__ */ oe({
  __name: "WindowPane",
  props: {
    group: {},
    path: {}
  },
  setup(e) {
    const t = e, n = qn(), a = Tn() ?? "dc-pane", s = v(
      () => t.group.panels.flatMap((q, Q) => {
        if (!_e(q)) {
          const Te = Ot(q) || Xt(q, (Le) => n.panelFor(Le)?.title);
          return [{ kind: "space", index: Q, id: `space-${Q}`, title: Te, node: q }];
        }
        const ee = n.panelFor(q);
        return ee ? [{ kind: "panel", index: Q, id: q, title: ee.title, panel: ee }] : [];
      })
    ), r = v(() => s.value.length > 1), i = v(() => {
      const q = xt(t.group);
      return s.value.find((Q) => Q.index === q) ?? s.value[0] ?? null;
    }), o = v(() => i.value?.kind === "space" ? i.value.node : null), l = v(() => o.value ? "" : Ir(t.group)), c = v(() => o.value ? null : n.panelFor(l.value)), d = v(() => i.value?.title ?? ""), h = v(() => n.spaceNames.value ? t.group.title ?? "" : ""), k = v(() => [...t.path, i.value?.index ?? 0]), _ = v(() => l.value || Ps(t.group)[0] || ""), y = v(() => n.viewFor(l.value)), b = v(() => t.group.headless === !0), M = v(() => n.focused.value === l.value), w = v(() => n.dragging.value === l.value), S = v(() => n.moving.value === l.value), L = v(() => n.frameOf(_.value) !== null), x = v(() => n.panelFor(_.value)?.fixed === !0), E = v(
      () => !o.value && (n.canMove(l.value) || L.value && n.movable.value && !x.value)
    ), D = v(
      () => o.value ? n.spaceMenu(k.value) : n.menuFor(l.value)
    ), P = (q) => n.closable(q);
    Yr({ panel: l });
    const z = v(() => n.maximized(_.value)), T = v(
      () => L.value && !x.value || !r.value && !!c.value && P(c.value.id)
    ), K = (q) => `${a}-tab-${q}`, W = v(() => `${a}-body`), j = v(() => {
      const q = n.dropTarget.value;
      return !q || !Ve(t.group, q.panel) || q.edge === "float" ? null : q;
    }), de = v(() => j.value?.index === void 0 ? j.value?.edge ?? null : null), le = v(() => j.value?.index ?? null), Ae = v(
      () => s.value.flatMap(
        (q) => q.kind === "panel" && (q.id === l.value || q.panel.keepAlive === !0) ? [q.id] : []
      )
    ), $ = H(null), B = /* @__PURE__ */ new Map();
    we(
      l,
      (q, Q) => {
        const ee = $.value;
        if (!ee || (Q && B.set(Q, ee.scrollTop), !n.panelFor(q)?.keepAlive || !B.has(q))) return;
        const Te = B.get(q);
        Nt(() => {
          $.value && ($.value.scrollTop = Te);
        });
      },
      { flush: "pre" }
    );
    const ie = () => c.value ? n.renderActions(c.value, y.value, M.value) ?? null : null;
    let te = null;
    function ye(q) {
      const Q = te !== null && Math.hypot(q.clientX - te.x, q.clientY - te.y) >= 4;
      return te = null, Q;
    }
    const ze = (q) => q.kind === "panel" ? q.id : Re(q.node);
    function Je(q, Q) {
      Q.kind !== "space" && (n.focus(Q.id), te = { x: q.clientX, y: q.clientY }, n.beginDrag(Q.id, q));
    }
    function et(q, Q) {
      if (ye(q)) return;
      const ee = ze(Q);
      ee && n.selectPanel(ee);
    }
    function tt(q) {
      l.value && n.focus(l.value), !q.target?.closest(".dc-tab, button, a, input, select, textarea, label") && (L.value ? n.beginFrameDrag(_.value, q, "move") : n.beginDrag(l.value, q));
    }
    function je(q) {
      te = { x: q.clientX, y: q.clientY }, n.beginDrag(l.value, q);
    }
    function Ge(q) {
      ye(q) || n.toggleMoveMode(l.value);
    }
    const V = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down"
    };
    function X(q) {
      if (!S.value) return;
      if (q.key === "Escape") {
        q.preventDefault(), n.toggleMoveMode(l.value);
        return;
      }
      const Q = V[q.key];
      Q && (q.preventDefault(), L.value ? n.nudgeFrame(l.value, Q, q.shiftKey) : n.nudge(l.value, Q, q.shiftKey));
    }
    function G(q) {
      !L.value || q.target?.closest(".dc-tab, button, a, input, select, textarea, label") || n.toggleMaximize(_.value);
    }
    function De(q, Q) {
      q.stopPropagation(), te = null, n.close(Q);
    }
    function Bt(q, Q) {
      const ee = s.value.length;
      let Te = null;
      if (q.key === "ArrowRight" ? Te = (Q + 1) % ee : q.key === "ArrowLeft" ? Te = (Q - 1 + ee) % ee : q.key === "Home" ? Te = 0 : q.key === "End" && (Te = ee - 1), Te === null) return;
      q.preventDefault();
      const Le = s.value[Te];
      if (!Le) return;
      const qt = ze(Le);
      qt && n.selectPanel(qt);
    }
    return (q, Q) => i.value ? (f(), m("section", {
      key: 0,
      class: "dc-pane",
      "data-dc-panel": l.value || void 0,
      "data-dc-panels": A(Ps)(e.group).join(" ") || void 0,
      "data-dc-tabbed": r.value ? "true" : "false",
      "data-dc-floating": L.value ? "true" : "false",
      "data-dc-maximized": z.value ? "true" : "false",
      "data-dc-headless": b.value ? "true" : "false",
      "data-dc-active": M.value ? "true" : "false",
      "data-dc-dragging": w.value ? "true" : "false",
      "aria-label": d.value,
      onFocusin: Q[7] || (Q[7] = (ee) => l.value && A(n).focus(l.value))
    }, [
      b.value ? I("", !0) : (f(), m("header", {
        key: 0,
        class: "dc-pane__head",
        "data-dc-movable": E.value ? "true" : "false",
        onPointerdown: tt,
        onDblclick: G
      }, [
        E.value ? (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-pane__grip",
          "aria-label": `Move ${d.value}`,
          "aria-pressed": S.value,
          onPointerdown: je,
          onClick: Ge,
          onKeydown: X
        }, [...Q[8] || (Q[8] = [
          C("span", { "aria-hidden": "true" }, "⠿", -1)
        ])], 40, $f)) : I("", !0),
        h.value ? (f(), m("span", {
          key: 1,
          class: "dc-pane__name",
          "data-dc-space-name": h.value
        }, [
          C("span", Mf, F(h.value), 1)
        ], 8, xf)) : I("", !0),
        C("div", {
          class: "dc-pane__tabs",
          role: "tablist",
          "aria-label": `${d.value} panels`
        }, [
          (f(!0), m(ne, null, me(s.value, (ee, Te) => (f(), m(ne, {
            key: ee.id
          }, [
            le.value === Te ? (f(), m("span", Sf)) : I("", !0),
            C("button", {
              id: K(ee.id),
              type: "button",
              role: "tab",
              class: "dc-tab",
              "data-dc-panel": ee.kind === "panel" ? ee.id : void 0,
              "data-dc-space": ee.kind === "space" ? ee.title : void 0,
              "aria-selected": ee.index === i.value.index,
              "aria-controls": W.value,
              tabindex: ee.index === i.value.index ? 0 : -1,
              onPointerdown: (Le) => Je(Le, ee),
              onClick: (Le) => et(Le, ee),
              onKeydown: (Le) => Bt(Le, Te)
            }, [
              C("span", Ef, F(ee.title), 1),
              ee.kind === "panel" && ee.panel.subtitle ? (f(), m("span", Af, F(ee.panel.subtitle), 1)) : I("", !0),
              r.value && ee.kind === "panel" && P(ee.id) ? (f(), m("span", {
                key: 1,
                class: "dc-tab__close",
                role: "button",
                tabindex: "-1",
                "aria-label": `Close ${ee.title}`,
                "data-dc-close": ee.id,
                onPointerdown: Q[0] || (Q[0] = Fe(() => {
                }, ["stop"])),
                onClick: (Le) => De(Le, ee.id)
              }, [...Q[9] || (Q[9] = [
                C("span", { "aria-hidden": "true" }, "×", -1)
              ])], 40, Tf)) : I("", !0)
            ], 40, Pf)
          ], 64))), 128)),
          le.value === s.value.length ? (f(), m("span", Rf)) : I("", !0)
        ], 8, Cf),
        C("div", zf, [
          ue(ie),
          D.value.length ? (f(), Z(Ua, {
            key: 0,
            items: D.value,
            label: `${d.value} menu`
          }, null, 8, ["items", "label"])) : I("", !0)
        ]),
        T.value ? (f(), m("div", Lf, [
          L.value && !x.value ? (f(), m("button", {
            key: 0,
            type: "button",
            class: "dc-pane__button dc-control",
            "aria-label": `Minimize ${d.value}`,
            "data-dc-minimize": _.value,
            onPointerdown: Q[1] || (Q[1] = Fe(() => {
            }, ["stop"])),
            onClick: Q[2] || (Q[2] = (ee) => A(n).toggleMinimize(_.value))
          }, [
            ue(Lt, { kind: "minimize" })
          ], 40, If)) : I("", !0),
          L.value && !x.value ? (f(), m("button", {
            key: 1,
            type: "button",
            class: "dc-pane__button dc-control",
            "aria-label": `${z.value ? "Restore" : "Maximize"} ${d.value}`,
            "aria-pressed": z.value,
            "data-dc-maximize": _.value,
            onPointerdown: Q[3] || (Q[3] = Fe(() => {
            }, ["stop"])),
            onClick: Q[4] || (Q[4] = (ee) => A(n).toggleMaximize(_.value))
          }, [
            ue(Lt, {
              kind: z.value ? "restore" : "maximize"
            }, null, 8, ["kind"])
          ], 40, Nf)) : I("", !0),
          !r.value && c.value && P(c.value.id) ? (f(), m("button", {
            key: 2,
            type: "button",
            class: "dc-pane__close dc-control",
            "aria-label": `Close ${d.value}`,
            "data-dc-close": c.value.id,
            onPointerdown: Q[5] || (Q[5] = Fe(() => {
            }, ["stop"])),
            onClick: Q[6] || (Q[6] = (ee) => A(n).close(c.value.id))
          }, [
            ue(Lt, { kind: "close" })
          ], 40, Ff)) : I("", !0)
        ])) : I("", !0)
      ], 40, bf)),
      o.value ? (f(), m("div", {
        key: 1,
        id: W.value,
        class: "dc-pane__space",
        role: b.value ? void 0 : "tabpanel",
        "aria-labelledby": b.value ? void 0 : K(i.value.id)
      }, [
        xe(q.$slots, "space", {
          node: o.value,
          path: k.value
        }, void 0, !0)
      ], 8, Of)) : I("", !0),
      !o.value || Ae.value.length ? pt((f(), m("div", {
        key: 2,
        id: o.value ? void 0 : W.value,
        ref_key: "body",
        ref: $,
        class: "dc-pane__body",
        role: b.value || o.value ? void 0 : "tabpanel",
        "aria-labelledby": b.value || o.value ? void 0 : K(l.value)
      }, [
        (f(!0), m(ne, null, me(Ae.value, (ee) => pt((f(), Z(wf, {
          key: ee,
          panel: ee,
          active: ee === l.value && M.value
        }, null, 8, ["panel", "active"])), [
          [xn, ee === l.value]
        ])), 128))
      ], 8, Df)), [
        [xn, !o.value]
      ]) : I("", !0),
      de.value ? (f(), m("div", {
        key: 3,
        class: "dc-pane__drop",
        "data-dc-edge": de.value,
        "aria-hidden": "true"
      }, null, 8, Bf)) : I("", !0)
    ], 40, kf)) : I("", !0);
  }
}), Qr = /* @__PURE__ */ pe(qf, [["__scopeId", "data-v-2c3c5ecf"]]), Vf = ["data-dc-space", "data-dc-path", "data-dc-bare", "aria-label"], Kf = {
  key: 0,
  class: "dc-space__head"
}, Hf = { class: "dc-space__title dc-truncate" }, Wf = ["data-dc-direction"], Uf = {
  key: 0,
  class: "dc-space__drop",
  "aria-hidden": "true"
}, jf = ["aria-orientation", "aria-label", "aria-valuenow", "aria-disabled", "tabindex", "onPointerdown", "onKeydown"], Gf = /* @__PURE__ */ oe({
  __name: "WindowNode",
  props: {
    node: {},
    path: {},
    framed: { type: Boolean }
  },
  setup(e) {
    const t = e, n = qn(), a = H(null), s = v(() => Y(t.node) ? t.node : null), r = v(() => Dt(t.node) ? t.node : null), i = v(() => ae(t.node) ? t.node : null), o = v(
      () => r.value ? r.value.children : i.value?.frames.map(($) => $.node) ?? []
    ), l = v(() => r.value ? it(r.value) : []), c = v(
      () => (i.value?.frames ?? []).map(($, B) => ({
        held: $,
        /** Place in the stack, counted from the back — what `z-index` follows. */
        order: B,
        key: z($.node),
        path: [...t.path, B]
      })).sort(($, B) => $.key < B.key ? -1 : $.key > B.key ? 1 : 0)
    ), d = v(() => Ot(t.node)), h = v(() => n.spaceMenu(t.path)), k = v(() => t.node.headless === !0), _ = v(() => t.path.length === 0 && !n.rootBar.value), y = v(() => i.value ? "desktop" : r.value?.direction ?? ""), b = H(null), M = H(0);
    let w = null;
    we(
      b,
      ($) => {
        w?.disconnect(), w = null, !(!$ || typeof ResizeObserver > "u") && (M.value = $.clientWidth, w = new ResizeObserver(([B]) => {
          M.value = B?.contentRect.width ?? 0;
        }), w.observe($));
      },
      { immediate: !0 }
    ), Ue(() => w?.disconnect());
    const S = v(() => {
      const $ = Math.max(
        1,
        Math.floor((M.value + Ct) / (ga + Ct))
      ), B = /* @__PURE__ */ new Map();
      let ie = 0;
      for (const te of c.value)
        te.held.minimized === !0 && (B.set(te.key, {
          x: Ct + ie % $ * (ga + Ct),
          bottom: Ct + Math.floor(ie / $) * (zr + Ct)
        }), ie += 1);
      return B;
    }), L = ($) => !!$ && $.join("/") === t.path.join("/"), x = v(() => {
      const $ = n.dropTarget.value, B = i.value;
      if (!B || !$?.rect || $.edge !== "float") return null;
      if ($.space) return L($.space) ? $.rect : null;
      const ie = Pe(B, $.panel);
      return ie && B.frames.includes(ie) ? $.rect : null;
    }), E = v(() => {
      const $ = n.dropTarget.value;
      return !!$ && !$.rect && L($.space);
    }), D = v(() => r.value?.direction === "row"), P = v(() => o.value.map(($, B) => [...t.path, B])), z = ($) => [...We($)].sort().join("/"), T = ($) => {
      const B = We($)[0];
      return (B ? n.panelFor(B)?.title : null) ?? B ?? "panel";
    }, K = ($) => {
      const B = o.value[$], ie = o.value[$ + 1];
      return !B || !ie ? "Resize panels" : `Resize ${T(B)} and ${T(ie)}`;
    }, W = ($) => {
      const B = l.value[$] ?? 0, ie = l.value[$ + 1] ?? 0, te = B + ie;
      return te > 0 ? Math.round(B / te * 100) : 50;
    };
    function j() {
      const $ = a.value, B = $ ? D.value ? $.clientWidth : $.clientHeight : 0;
      return B <= 0 ? 0.05 : Math.min(n.minPanelSize.value / B, 0.4);
    }
    let de = null;
    function le($, B) {
      const ie = r.value, te = a.value;
      if (!n.resizable.value || !ie || !te || $.button !== 0) return;
      const ye = D.value ? te.clientWidth : te.clientHeight;
      if (ye <= 0) return;
      const ze = D.value ? $.clientX : $.clientY, Je = it(ie), et = Math.min(n.minPanelSize.value / ye, 0.4);
      $.preventDefault();
      const tt = (V) => {
        const X = ((D.value ? V.clientX : V.clientY) - ze) / ye;
        n.setSizes(t.path, Is(Je, B, X, et));
      }, je = () => de?.(), Ge = (V) => {
        V.key === "Escape" && (n.setSizes(t.path, Je), de?.());
      };
      de = () => {
        window.removeEventListener("pointermove", tt), window.removeEventListener("pointerup", je), window.removeEventListener("pointercancel", je), window.removeEventListener("keydown", Ge), de = null;
      }, window.addEventListener("pointermove", tt), window.addEventListener("pointerup", je), window.addEventListener("pointercancel", je), window.addEventListener("keydown", Ge);
    }
    Ue(() => de?.());
    function Ae($, B) {
      const ie = r.value;
      if (!n.resizable.value || !ie) return;
      const te = D.value ? "ArrowRight" : "ArrowDown", ye = D.value ? "ArrowLeft" : "ArrowUp", ze = $.shiftKey ? 0.1 : 0.02;
      if ($.key !== te && $.key !== ye) return;
      const Je = $.key === te ? ze : -ze;
      $.preventDefault(), n.setSizes(t.path, Is(it(ie), B, Je, j()));
    }
    return ($, B) => {
      const ie = qs("WindowNode", !0);
      return s.value ? (f(), Z(Qr, {
        key: 0,
        group: s.value,
        path: e.path
      }, {
        space: Me(({ node: te, path: ye }) => [
          ue(ie, {
            node: te,
            path: ye,
            framed: !s.value.headless
          }, null, 8, ["node", "path", "framed"])
        ]),
        _: 1
      }, 8, ["group", "path"])) : (f(), m("section", {
        key: 1,
        class: "dc-space",
        "data-dc-space": y.value,
        "data-dc-path": e.path.join("/"),
        "data-dc-bare": _.value ? "true" : void 0,
        "aria-label": d.value
      }, [
        !e.framed && !k.value && !_.value ? (f(), m("header", Kf, [
          C("span", Hf, F(d.value), 1),
          h.value.length ? (f(), Z(Ua, {
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
          (f(!0), m(ne, null, me(c.value, (te) => (f(), Z(gf, {
            key: te.key,
            frame: te.held,
            path: te.path,
            order: te.order,
            place: S.value.get(te.key) ?? null
          }, {
            default: Me(() => [
              ue(ie, {
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
          E.value ? (f(), m("div", Uf)) : I("", !0),
          (f(!0), m(ne, null, me(o.value, (te, ye) => (f(), m(ne, {
            key: z(te)
          }, [
            C("div", {
              class: "dc-window__cell",
              style: Ee({ flexGrow: l.value[ye] ?? 1 })
            }, [
              ue(ie, {
                node: te,
                path: P.value[ye] ?? []
              }, null, 8, ["node", "path"])
            ], 4),
            ye < o.value.length - 1 ? (f(), m("div", {
              key: 0,
              class: "dc-window__gutter",
              role: "separator",
              "aria-orientation": D.value ? "vertical" : "horizontal",
              "aria-label": K(ye),
              "aria-valuenow": W(ye),
              "aria-valuemin": "0",
              "aria-valuemax": "100",
              "aria-disabled": A(n).resizable.value ? void 0 : "true",
              tabindex: A(n).resizable.value ? 0 : -1,
              onPointerdown: (ze) => le(ze, ye),
              onKeydown: (ze) => Ae(ze, ye)
            }, null, 40, jf)) : I("", !0)
          ], 64))), 128))
        ], 8, Wf)) : I("", !0)
      ], 8, Vf));
    };
  }
}), Xf = /* @__PURE__ */ pe(Gf, [["__scopeId", "data-v-b394f0e4"]]), Yf = ["data-dc-theme", "data-dc-dragging", "data-dc-docking"], Qf = {
  key: 1,
  class: "dc-window__empty"
}, Zf = {
  class: "dc-window__live",
  "aria-live": "polite",
  role: "status"
}, vn = 16, Jf = /* @__PURE__ */ oe({
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
    const a = e, s = n, r = Ht(e, "layout"), i = Ht(e, "views"), o = Jt(), l = v(() => new Map(a.panels.map((u) => [u.id, u]))), c = v(() => a.panels.map((u) => u.id)), d = v(() => Gd(r.value, h.value)), h = v(() => {
      if (!a.solo || !r.value) return c.value;
      const u = new Set(We(r.value)), p = c.value.filter((g) => u.has(g));
      return p.length ? p : c.value;
    }), k = H(null), _ = H(null), y = H(null), b = H(!0), M = H(null), w = H(null), S = H(null), L = H(""), x = H(null);
    function E() {
      const u = x.value;
      return u ? [...u.querySelectorAll(".dc-pane[data-dc-panels]")].filter((g) => g.closest(".dc-window") === u).map((g) => ({ panels: (g.dataset.dcPanels ?? "").split(" "), element: g })) : [];
    }
    function D(u) {
      const p = [];
      let g = u.closest(".dc-float");
      for (; g; )
        p.unshift(Number(g.dataset.dcOrder ?? 0)), g = g.parentElement?.closest(".dc-float") ?? null;
      return p;
    }
    function P() {
      return E().map((u) => ({ pane: u, order: D(u.element) })).sort((u, p) => {
        const g = Math.max(u.order.length, p.order.length);
        for (let R = 0; R < g; R += 1) {
          const N = (u.order[R] ?? -1) - (p.order[R] ?? -1);
          if (N !== 0) return N;
        }
        return 0;
      }).map((u) => u.pane);
    }
    const z = (u) => E().find((p) => p.panels.includes(u)) ?? null;
    function T(u) {
      const p = l.value.get(u);
      if (!p) return "";
      const g = i.value[u];
      return g && p.views?.some((R) => R.key === g) ? g : p.defaultView ?? p.views?.[0]?.key ?? "";
    }
    function K(u, p) {
      i.value = { ...i.value, [u]: p }, s("view-change", { panel: u, view: p });
    }
    const W = v(
      () => a.panels.filter((u) => u.fixed !== !0).length
    );
    function j(u) {
      return !a.movable || W.value < 1 || a.panels.length < 2 ? !1 : l.value.get(u)?.fixed !== !0;
    }
    function de(u, p) {
      const g = d.value;
      !u || !g || u === g || (r.value = u, p && s("panel-move", p));
    }
    function le(u, p, g) {
      if (u.width <= 0 || u.height <= 0) return "center";
      const R = (p - u.left) / u.width, N = (g - u.top) / u.height, O = 0.3;
      return R > O && R < 1 - O && N > O && N < 1 - O ? "center" : [
        { edge: "left", distance: R },
        { edge: "right", distance: 1 - R },
        { edge: "top", distance: N },
        { edge: "bottom", distance: 1 - N }
      ].reduce(
        (ce, U) => U.distance < ce.distance ? U : ce
      ).edge;
    }
    function Ae(u, p) {
      const g = [...u.querySelectorAll(".dc-tab")], R = g.findIndex((N) => {
        const O = N.getBoundingClientRect();
        return p < O.left + O.width / 2;
      });
      return R === -1 ? g.length : R;
    }
    function $(u, p, g) {
      for (const { panels: R, element: N } of P().reverse()) {
        const O = N.getBoundingClientRect();
        if (u < O.left || u > O.right || p < O.top || p > O.bottom) continue;
        const fe = R.find((se) => se !== g), ce = N.querySelector(".dc-pane__tabs"), U = ce?.getBoundingClientRect();
        if (ce && U && p >= U.top && p <= U.bottom)
          return fe ? { panel: fe, edge: "center", index: Ae(ce, u) } : null;
        const J = N.querySelector(":scope > .dc-pane__space");
        if (J) {
          const se = J.getBoundingClientRect();
          if (u >= se.left && u <= se.right && p >= se.top && p <= se.bottom) continue;
        }
        return fe ? { panel: fe, edge: le(O, u, p) } : null;
      }
      return ie(u, p, g) ?? ze(u, p);
    }
    function B() {
      const u = x.value;
      return u ? [...u.querySelectorAll(".dc-window__desktop")].filter((p) => p.closest(".dc-window") === u).reverse() : [];
    }
    function ie(u, p, g) {
      const R = d.value;
      if (!R) return null;
      for (const N of B()) {
        const O = N.getBoundingClientRect();
        if (u < O.left || u > O.right || p < O.top || p > O.bottom) continue;
        const fe = Je(N), ce = fe.flatMap((he) => he.panels).find((he) => he !== g);
        if (!ce && fe.length > 0) return null;
        const U = Pe(R, g)?.rect, J = Jn(
          {
            x: u - O.left - 24,
            y: p - O.top - 12,
            w: U?.w ?? _t.w,
            h: U?.h ?? _t.h
          },
          { w: N.clientWidth, h: N.clientHeight },
          a.minPanelSize
        );
        if (ce) return { panel: ce, edge: "float", rect: J };
        const se = te(N);
        return se ? { panel: "", space: se, edge: "float", rect: J } : null;
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
        const g = te(p);
        return g ? [{ element: p, path: g }] : [];
      }) : [];
    }
    function ze(u, p) {
      for (const { element: g, path: R } of ye()) {
        if (g.dataset.dcSpace === "desktop") continue;
        const N = g.getBoundingClientRect();
        if (!(u < N.left || u > N.right || p < N.top || p > N.bottom))
          return { panel: "", space: R, edge: "center" };
      }
      return null;
    }
    function Je(u) {
      return E().filter(
        (p) => p.element.closest(".dc-window__desktop") === u
      );
    }
    let et = null;
    const tt = (u) => u.altKey;
    function je(u, p) {
      if (!j(u) || _.value || w.value || p.button !== 0) return;
      const g = p.clientX, R = p.clientY;
      let N = !1, O = tt(p);
      const fe = () => {
        const ge = S.value;
        ge && (y.value = O ? ie(ge.x, ge.y, u) : $(ge.x, ge.y, u));
      }, ce = (ge) => {
        if (!N) {
          if (Math.hypot(ge.clientX - g, ge.clientY - R) < 4) return;
          N = !0, _.value = u, M.value = null;
        }
        O = tt(ge), b.value = !O, S.value = { x: ge.clientX, y: ge.clientY }, fe();
      }, U = (ge) => {
        tt(ge) !== O && (O = !O, b.value = !O, N && fe());
      }, J = (ge) => {
        et?.();
        const re = y.value, Ie = d.value;
        if (ge && N && re && Ie) {
          const ct = re.space ? Rs(Ie, u, re.space, re.rect) : re.edge === "float" && re.rect ? Ts(Ie, u, re.panel, re.rect) : pn(Ie, u, re.panel, re.edge, re.index);
          de(ct, {
            panel: u,
            target: re.panel,
            edge: re.edge,
            ...re.space === void 0 ? {} : { space: re.space },
            ...re.index === void 0 ? {} : { index: re.index },
            ...re.rect === void 0 ? {} : { rect: re.rect }
          });
        }
        _.value = null, y.value = null, S.value = null, b.value = !0;
      }, se = () => J(!0), he = () => J(!1), ke = (ge) => {
        if (ge.key === "Escape") {
          J(!1);
          return;
        }
        U(ge);
      };
      et = () => {
        window.removeEventListener("pointermove", ce), window.removeEventListener("pointerup", se), window.removeEventListener("pointercancel", he), window.removeEventListener("keydown", ke), window.removeEventListener("keyup", U), et = null;
      }, window.addEventListener("pointermove", ce), window.addEventListener("pointerup", se), window.addEventListener("pointercancel", he), window.addEventListener("keydown", ke), window.addEventListener("keyup", U);
    }
    Ue(() => et?.());
    let Ge = null;
    function V(u) {
      const p = x.value;
      return p ? [...p.querySelectorAll(
        `.dc-float[data-dc-path="${u.join("/")}"]`
      )].find((N) => N.closest(".dc-window") === p)?.parentElement ?? null : null;
    }
    function X(u) {
      const p = d.value;
      return p ? wa(p, u) : null;
    }
    function G(u) {
      const p = d.value;
      if (!p) return;
      const g = jt(p, u);
      g !== p && (r.value = g);
    }
    function De(u) {
      const p = X(u);
      p && G(p);
    }
    function Bt(u) {
      const p = d.value, g = p ? Pe(p, u) : null;
      return g !== null && ut(g);
    }
    function q(u) {
      const p = d.value, g = p ? Pe(p, u) : null;
      return g !== null && gt(g);
    }
    function Q(u) {
      const p = d.value, g = p ? mt(p, u) : null;
      return g ? Re(g.node) : "";
    }
    function ee(u) {
      const p = d.value, g = p ? mt(p, u) : null;
      if (!p || !g) return;
      const R = Re(g.node);
      if (l.value.get(R)?.fixed === !0) return;
      const N = !gt(g);
      let O = Nd(p, u, N);
      O !== p && (N || (O = jt(O, u)), r.value = O, s("frame-minimize", { panel: R, minimized: N }));
    }
    function Te(u) {
      const p = X(u);
      p && ee(p);
    }
    function Le(u) {
      const p = d.value, g = p ? mt(p, u) : null;
      if (!p || !g) return;
      const R = Re(g.node);
      if (l.value.get(R)?.fixed === !0) return;
      const N = !ut(g);
      let O = Id(p, u, N);
      O !== p && (N && (O = jt(O, u)), r.value = O, s("frame-maximize", { panel: R, maximized: N }));
    }
    function qt(u) {
      const p = X(u);
      p && Le(p);
    }
    function ss(u, p, g) {
      const R = d.value, N = R ? mt(R, u) : null;
      if (!R || !N || p.button !== 0 || _.value || w.value) return;
      const O = Re(N.node);
      if (l.value.get(O)?.fixed === !0 || ut(N) || gt(N) || (g === "move" ? !a.movable : !a.resizable)) return;
      const fe = V(u), ce = Fd(R, u);
      G(u);
      const U = { w: fe?.clientWidth ?? 0, h: fe?.clientHeight ?? 0 }, J = { ...N.rect }, se = p.clientX, he = p.clientY, ke = a.minPanelSize;
      w.value = O;
      const ge = (qe) => {
        const rt = d.value;
        if (!rt) return;
        const Vt = As(rt, ce, Jn(qe, U, ke));
        Vt !== rt && (r.value = Vt);
      }, re = (qe) => {
        qe.preventDefault();
        const rt = qe.clientX - se, Vt = qe.clientY - he;
        ge(
          g === "move" ? { ...J, x: J.x + rt, y: J.y + Vt } : Es(J, g, rt, Vt, ke)
        );
      }, Ie = (qe) => {
        if (Ge?.(), w.value = null, !qe) {
          ge(J);
          return;
        }
        const rt = d.value ? mt(d.value, ce) : null;
        rt && s("frame-change", { panel: Q(ce), rect: rt.rect });
      }, ct = () => Ie(!0), vt = () => Ie(!1), ht = (qe) => {
        qe.key === "Escape" && Ie(!1);
      };
      Ge = () => {
        window.removeEventListener("pointermove", re), window.removeEventListener("pointerup", ct), window.removeEventListener("pointercancel", vt), window.removeEventListener("keydown", ht), Ge = null;
      }, window.addEventListener("pointermove", re), window.addEventListener("pointerup", ct), window.addEventListener("pointercancel", vt), window.addEventListener("keydown", ht);
    }
    function nl(u, p, g) {
      const R = X(u);
      R && ss(R, p, g);
    }
    function al(u, p, g = !1) {
      const R = d.value, N = X(u), O = R && N ? mt(R, N) : null;
      if (!R || !N || !O || l.value.get(u)?.fixed === !0 || (g ? !a.resizable : !a.movable)) return;
      if (ut(O) || gt(O)) {
        L.value = `${nt(u)} is ${ut(O) ? "maximized" : "minimized"}, so it cannot be moved.`;
        return;
      }
      const fe = p === "left" ? -vn : p === "right" ? vn : 0, ce = p === "up" ? -vn : p === "down" ? vn : 0, U = V(N), J = { w: U?.clientWidth ?? 0, h: U?.clientHeight ?? 0 }, se = g ? Es(O.rect, "se", fe, ce, a.minPanelSize) : { ...O.rect, x: O.rect.x + fe, y: O.rect.y + ce }, he = As(R, N, Jn(se, J, a.minPanelSize));
      if (he === R) {
        L.value = g ? `${nt(u)} cannot be resized further.` : `${nt(u)} cannot move ${p}.`;
        return;
      }
      r.value = he;
      const ke = mt(he, N);
      ke && (s("frame-change", { panel: u, rect: ke.rect }), L.value = g ? `${nt(u)} resized to ${ke.rect.w} by ${ke.rect.h}.` : `${nt(u)} moved to ${ke.rect.x}, ${ke.rect.y}.`);
    }
    Ue(() => Ge?.());
    function sl(u, p) {
      const g = z(u), R = g?.element.getBoundingClientRect();
      if (!g || !R) return null;
      const N = p === "left" || p === "right", O = (U) => {
        if (!(N ? U.bottom > R.top + 1 && U.top < R.bottom - 1 : U.right > R.left + 1 && U.left < R.right - 1)) return null;
        const se = p === "left" ? R.left - U.right : p === "right" ? U.left - R.right : p === "up" ? R.top - U.bottom : U.top - R.bottom;
        return se < -1 ? null : se;
      }, fe = [];
      for (const U of E()) {
        if (U === g || U.element === g.element) continue;
        const J = O(U.element.getBoundingClientRect());
        if (J === null) continue;
        const se = U.panels.find((he) => he !== u);
        se && fe.push({ to: { panel: se }, distance: J });
      }
      for (const { element: U, path: J } of ye()) {
        const se = O(U.getBoundingClientRect());
        se !== null && fe.push({ to: { space: J }, distance: se });
      }
      return fe.reduce(
        (U, J) => U && U.distance <= J.distance ? U : J,
        null
      )?.to ?? null;
    }
    function rl(u) {
      const p = d.value ? Pe(d.value, u) !== null : !1;
      if (!p && !j(u)) return;
      M.value = M.value === u ? null : u;
      const g = nt(u);
      if (!M.value) {
        L.value = `${g}: move mode off.`;
        return;
      }
      L.value = p ? `${g}: move mode on. Arrow keys move the window, shift and an arrow resize it, Escape leaves move mode.` : `${g}: move mode on. Arrow keys move the panel, shift and an arrow make it a tab of the panel that way, Escape leaves move mode.`;
    }
    const nt = (u) => l.value.get(u)?.title ?? u, ll = {
      left: "left",
      right: "right",
      up: "top",
      down: "bottom"
    };
    function ol(u, p, g = !1) {
      if (!j(u)) return;
      const R = d.value;
      if (!R) return;
      const N = nt(u), O = Tt(R, u);
      if (!g && O && (p === "left" || p === "right") && O.panels.length > 1) {
        const he = O.panels.indexOf(u), ke = p === "left" ? he - 1 : he + 1;
        if (ke >= 0 && ke < O.panels.length) {
          de(Gt(R, u, ke), { panel: u, target: u, edge: "center", index: ke }), L.value = `${N} moved ${p}, now tab ${ke + 1} of ${O.panels.length}.`, Vn(u);
          return;
        }
      }
      const ce = sl(u, p);
      if (!ce || ce.panel !== void 0 && !j(ce.panel)) {
        L.value = `${N} cannot move ${p}.`;
        return;
      }
      const U = ll[p];
      if (ce.space) {
        const he = ce.space, ke = Ke(R, he), ge = Pe(R, u)?.rect, re = { ..._t, ...ge ? { w: ge.w, h: ge.h } : {} };
        de(Rs(R, u, he, re), { panel: u, target: "", space: he, edge: U }), L.value = `${N} moved ${p}, into ${ke ? Ot(ke) : "the space"}.`, Vn(u);
        return;
      }
      const J = ce.panel, se = O?.panels.length === 1 && Tt(R, J)?.panels.length === 1;
      g ? (de(pn(R, u, J, "center"), {
        panel: u,
        target: J,
        edge: "center"
      }), L.value = `${N} joined ${nt(J)} as a tab.`) : se ? (de(yn(R, u, J), { panel: u, target: J, edge: U }), L.value = `${N} moved ${p}, trading places with ${nt(J)}.`) : (de(pn(R, u, J, U), { panel: u, target: J, edge: U }), L.value = `${N} moved ${p}, beside ${nt(J)}.`), Vn(u);
    }
    function Vn(u) {
      Nt(() => {
        z(u)?.element.querySelector(".dc-pane__grip")?.focus();
      });
    }
    function il(u, p) {
      const g = d.value;
      g && (r.value = wn(g, u, p));
    }
    function Kn(u) {
      const p = d.value;
      if (!p) return;
      const g = zt(p, u);
      g !== p && (r.value = g, s("tab-select", { panel: u }));
    }
    function Hn(u) {
      return l.value.get(u)?.closable ?? a.closable;
    }
    function rs(u) {
      Hn(u) && s("panel-close", u);
    }
    const Wn = H(/* @__PURE__ */ new Map());
    let cl = 0;
    function ul(u, p) {
      const g = cl += 1;
      return Wn.value.set(g, { panel: u, items: p }), () => {
        Wn.value.delete(g);
      };
    }
    function dl(u) {
      const p = [];
      for (const g of Wn.value.values())
        g.panel() === u && p.push(...g.items());
      return p;
    }
    function ls(u) {
      const p = u.filter((g) => g.items.length > 0);
      return p.length < 2 ? p.flatMap((g) => g.items) : p.flatMap((g) => [
        { id: g.id, heading: !0, label: g.title },
        ...g.items
      ]);
    }
    const os = (u) => u.title || "These tabs";
    function fl(u, p) {
      const g = p.id, R = Tt(u, g), N = (R?.panels.length ?? 0) > 1, O = R?.fixedView === !0, fe = (se) => ({
        action: () => {
          se !== u && (r.value = se);
        }
      }), ce = [], U = [], J = p.views ?? [];
      if (J.length > 1 && !O) {
        const se = T(g);
        ce.push({
          id: "view",
          label: "View",
          items: J.map((he) => ({
            id: `view-${he.key}`,
            label: he.label,
            checked: he.key === se,
            action: () => K(g, he.key)
          }))
        });
      }
      return N && !O && U.push(
        { id: "show-row", label: "Row", checked: !1, ...fe(zs(u, g, "row")) },
        {
          id: "show-column",
          label: "Column",
          checked: !1,
          ...fe(zs(u, g, "column"))
        },
        // Already true, and nothing to collapse: these panes are tabs. Ticked
        // and choosable all the same — collapsing a strip into a strip hands
        // back the tree it was given, so it is the no-op it looks like.
        {
          id: "show-tabs",
          label: "Tabs",
          checked: !0,
          ...fe(qd(u, g))
        },
        {
          id: "show-desktop",
          label: "Desktop",
          checked: !1,
          ...fe(Vd(u, g))
        }
      ), N && R && (U.length && U.push({ separator: !0 }), U.push(...Un(R, g))), { panel: ce, tabs: U, tabsTitle: R ? os(R) : "" };
    }
    function Un(u, p) {
      const g = xt(u), R = (N) => {
        const O = u.panels[(g + N + u.panels.length) % u.panels.length];
        return (O === void 0 ? "" : Re(O)) || p;
      };
      return [
        { id: "next-tab", label: "Next tab", action: () => Kn(R(1)) },
        { id: "previous-tab", label: "Previous tab", action: () => Kn(R(-1)) },
        ...pl(u)
      ];
    }
    function pl(u) {
      const p = We(u).filter(Hn);
      return p.length ? [
        { separator: !0 },
        { id: "close-all", label: "Close all", action: () => p.forEach(rs) }
      ] : [];
    }
    function un(u) {
      return u.title ? u.title : Y(u) ? u.panels.length > 1 ? "these tabs" : "the strip" : Ot(u);
    }
    function is(u) {
      if (!u || ae(u) || u.fixedView === !0 || !u.title && u.headless !== !0 || Ze(u)) return null;
      const p = Xr(u);
      return p && p.fixedView !== !0 ? p : null;
    }
    function cs(u) {
      const p = d.value;
      if (!a.menu || !p) return [];
      const g = Ke(p, u);
      if (!g || Y(g)) return [];
      if (g.fixedView) return [];
      const R = ae(g) ? "desktop" : g.direction, N = (re, Ie, ct) => ({
        id: `show-${re}`,
        label: Ie,
        checked: R === re,
        action: () => {
          const vt = d.value, ht = ct();
          !vt || ht === g || (r.value = En(be(st(vt, u, ht))));
        }
      }), O = () => {
        const re = Kr(g, vl(g));
        if (Y(re) && re.panels.length === 0) return g;
        const Ie = Y(re) && re.panels.length === 1 ? re.panels[0] : void 0;
        return Ie !== void 0 && _e(Ie) ? g : re;
      }, fe = (re) => () => ae(g) ? Gr(g, re) : g.direction === re ? g : { ...g, direction: re }, ce = u.slice(0, -1), U = u.length > 0 ? Ke(p, ce) : null, J = U && Y(U) && U.panels.length > 1 ? U : null, se = U && is(U) === g ? U : null, he = is(g), ke = g.title || "this space", ge = (re, Ie, ct, vt, ht) => ({
        id: re,
        label: ht,
        action: () => {
          const qe = d.value;
          qe && (r.value = En(be(st(qe, Ie, Ud(ct, vt)))));
        }
      });
      return ls([
        {
          id: "about-space",
          /*
           * Its own name, or what it is rather than how it is shown: `spaceTitle`
           * would answer "Row" for an unnamed row, which is the item directly
           * under it and the one already ticked.
           */
          title: g.title || "This space",
          items: [
            N("row", "Row", fe("row")),
            N("column", "Column", fe("column")),
            // Everything in this space in one strip: the panes as tabs, and a
            // desktop among them as a tab of its own, keeping the windows on it.
            N("tabs", "Tabs", () => O()),
            N("desktop", "Desktop", () => ae(g) ? g : jr(g))
          ]
        },
        {
          id: "about-around",
          title: he ? `Around ${un(he)}` : "",
          items: he ? [
            // Keeping this space's bar drops the one inside, so it is offered
            // only where the space inside has no name to be dropped with it.
            ...he.title ? [] : [ge("merge-around-keep-this", u, g, "outer", `Keep ${ke}`)],
            ...g.title ? [] : [ge("merge-around-keep-that", u, g, "inner", `Keep ${un(he)}`)]
          ] : []
        },
        {
          id: "about-inside",
          title: se ? `Inside ${un(se)}` : "",
          items: se ? [
            ...g.title ? [] : [ge("merge-inside-keep-that", ce, se, "outer", `Keep ${un(se)}`)],
            ...se.title ? [] : [ge("merge-inside-keep-this", ce, se, "inner", `Keep ${ke}`)]
          ] : []
        },
        {
          id: "about-tabs",
          title: J ? os(J) : "",
          items: J ? Un(J, Re(g)) : []
        }
      ]);
    }
    function vl(u) {
      const p = k.value;
      return p && ve(u, p) ? p : void 0;
    }
    function hl(u) {
      const p = d.value, g = l.value.get(u);
      if (!p || !g) return [];
      const R = a.menu ? fl(p, g) : null, N = dl(u);
      N.length && R?.panel.length && N.push({ separator: !0 }), R && N.push(...R.panel);
      const O = _l(g);
      O && (N.length && N.push({ separator: !0 }), N.push(O));
      const fe = ls([
        { id: "about-panel", title: g.title, items: N },
        { id: "about-tabs", title: R?.tabsTitle ?? "", items: R?.tabs ?? [] }
      ]);
      return a.paneMenu ? a.paneMenu(g, fe) : fe;
    }
    const ml = v(() => {
      const u = d.value;
      return u ? Y(u) ? gl([]) : cs([]) : [];
    });
    function gl(u) {
      const p = d.value, g = p ? Ke(p, u) : null;
      if (!a.menu || !g || !Y(g) || g.panels.length < 2) return [];
      const R = (O, fe, ce) => ({
        id: `show-${O}`,
        label: fe,
        checked: O === "tabs",
        action: () => {
          const U = d.value;
          if (!U) return;
          const J = ce(U);
          J !== U && (r.value = J);
        }
      }), N = g.fixedView ? [] : [
        R("row", "Row", (O) => Ls(O, u, "row")),
        R("column", "Column", (O) => Ls(O, u, "column")),
        // Already true: these are tabs, and a strip collapsed is that strip.
        R("tabs", "Tabs", (O) => O),
        R("desktop", "Desktop", (O) => Kd(O, u))
      ];
      return N.length && N.push({ separator: !0 }), N.push(...Un(g, Re(g))), N;
    }
    function _l(u) {
      const p = a.popOut?.(u);
      return !p || a.solo && d.value && We(d.value).length <= 1 ? null : {
        id: "pop-out",
        label: "Pop out to new window",
        action: () => {
          const g = x.value?.querySelector(`.dc-pane[data-dc-panel="${CSS.escape(u.id)}"]`);
          Jd(p, Zd(g)) && s("panel-pop-out", { panel: u.id, href: p });
        }
      };
    }
    function yl(u, p) {
      return o[`${u}-${p}`] ?? o[u];
    }
    function us(u, p, g, R) {
      return yl(u, p.id)?.({ panel: p, view: g, active: R });
    }
    Xd({
      panelFor: (u) => l.value.get(u) ?? null,
      viewFor: T,
      setView: K,
      movable: v(() => a.movable),
      resizable: v(() => a.resizable),
      minPanelSize: v(() => a.minPanelSize),
      spaceNames: v(() => a.spaceNames),
      rootBar: v(() => a.rootBar),
      focused: k,
      dragging: _,
      dropTarget: y,
      moving: M,
      framing: w,
      canMove: j,
      focus(u) {
        k.value !== u && (k.value = u, s("panel-activate", u));
      },
      selectPanel: Kn,
      beginDrag: je,
      toggleMoveMode: rl,
      nudge: ol,
      setSizes: il,
      frameOf: (u) => d.value ? Pe(d.value, u) : null,
      beginFrameDrag: nl,
      nudgeFrame: al,
      raise: De,
      maximized: Bt,
      toggleMaximize: qt,
      minimized: q,
      toggleMinimize: Te,
      beginFrameDragAt: ss,
      raiseAt: G,
      toggleMaximizeAt: Le,
      toggleMinimizeAt: ee,
      menuFor: hl,
      spaceMenu: cs,
      registerMenu: ul,
      closable: Hn,
      close: rs,
      renderContent: (u, p, g) => us("panel", u, p, g),
      renderActions: (u, p, g) => us("actions", u, p, g),
      layout: d
    });
    const wl = v(() => {
      if (!(!a.accent && !a.tokens))
        return { ...a.tokens, ...a.accent ? { "--dc-accent": a.accent } : {} };
    }), kl = () => {
      const u = _.value, p = S.value;
      return !u || !p ? null : Ml(
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
      move(u, p, g, R) {
        const N = d.value;
        N && de(pn(N, u, p, g, R), {
          panel: u,
          target: p,
          edge: g,
          ...R === void 0 ? {} : { index: R }
        });
      },
      /** Brings a panel's tab to the top of its group. */
      select(u) {
        const p = d.value;
        p && (r.value = zt(p, u));
      },
      /** Lifts a panel onto the float holding `near`, as a window of its own. */
      float(u, p, g) {
        const R = d.value;
        R && de(Ts(R, u, p, g), {
          panel: u,
          target: p,
          edge: "float",
          rect: g
        });
      },
      /** Puts a floating frame somewhere else, or makes it another size. */
      setRect(u, p) {
        const g = d.value;
        if (!g) return;
        const R = Rd(g, u, p);
        if (R === g) return;
        r.value = R;
        const N = Pe(R, u);
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
      rootMenu: ml,
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
      "data-dc-dragging": _.value ? "true" : "false",
      "data-dc-docking": b.value ? "true" : "false",
      style: Ee(wl.value)
    }, [
      d.value ? (f(), Z(Xf, {
        key: 0,
        node: d.value,
        path: []
      }, null, 8, ["node"])) : (f(), m("p", Qf, " This window has no panels. ")),
      ue(kl),
      C("p", Zf, F(L.value), 1)
    ], 12, Yf));
  }
}), ep = /* @__PURE__ */ pe(Jf, [["__scopeId", "data-v-02019f28"]]), tp = (e) => Math.round(e * 1e3) / 1e3;
function ta(e, t) {
  return e.title && (t.t = e.title), e.headless && (t.h = !0), e.fixedView && (t.v = !0), t;
}
function np(e) {
  return [Math.round(e.x), Math.round(e.y), Math.round(e.w), Math.round(e.h)];
}
function na(e) {
  const t = { b: np(e.rect) };
  return e.title && (t.t = e.title), e.maximized && (t.M = !0), e.minimized && (t.m = !0), t;
}
function ap(e) {
  if (e.kind !== "group" || e.panels.length !== 1) return null;
  const t = e.panels[0];
  return typeof t != "string" || e.title || e.headless || e.fixedView || e.places ? null : t;
}
function ba(e) {
  const t = ap(e);
  return t !== null ? t : Zr(e);
}
function Zr(e) {
  if (e.kind === "group") {
    const n = { g: e.panels.map((a) => typeof a == "string" ? a : Zr(a)) };
    return e.active !== void 0 && e.active !== e.panels[0] && (n.a = e.active), e.places && (n.p = e.places.map(na)), ta(e, n);
  }
  if (e.kind === "split") {
    const n = { [e.direction === "row" ? "r" : "c"]: e.children.map(ba) };
    return e.sizes && (n.z = e.sizes.map(tp)), e.places && (n.p = e.places.map(na)), ta(e, n);
  }
  const t = {
    f: e.frames.map((n) => ({ n: ba(n.node), ...na(n) }))
  };
  return ta(e, t);
}
class Jr extends Error {
}
const Se = () => {
  throw new Jr();
}, $a = (e) => typeof e == "object" && e !== null && !Array.isArray(e), St = (e) => Array.isArray(e) ? e : Se(), ns = (e) => e === void 0 ? void 0 : typeof e == "string" ? e : Se(), el = (e) => St(e).map((t) => typeof t == "number" && Number.isFinite(t) ? t : Se());
function sp(e) {
  const [t, n, a, s] = el(e);
  return s === void 0 && Se(), { x: t, y: n, w: a, h: s };
}
function aa(e) {
  if (!$a(e)) return Se();
  const t = { rect: sp(e.b) }, n = ns(e.t);
  return n && (t.title = n), e.M === !0 && (t.maximized = !0), e.m === !0 && (t.minimized = !0), t;
}
function sa(e, t) {
  const n = ns(e.t);
  return n && (t.title = n), e.h === !0 && (t.headless = !0), e.v === !0 && (t.fixedView = !0), t;
}
function kn(e) {
  if (typeof e == "string") return { kind: "group", panels: [e] };
  if (!$a(e)) return Se();
  if (e.g !== void 0) {
    const n = St(e.g).map((r) => typeof r == "string" ? r : kn(r));
    n.length === 0 && Se();
    const a = { kind: "group", panels: n }, s = ns(e.a);
    return s !== void 0 && (a.active = s), e.p !== void 0 && (a.places = St(e.p).map(aa)), sa(e, a);
  }
  const t = e.r !== void 0 ? "row" : e.c !== void 0 ? "column" : null;
  if (t) {
    const n = St(t === "row" ? e.r : e.c).map(kn), a = { kind: "split", direction: t, children: n };
    return e.z !== void 0 && (a.sizes = el(e.z)), e.p !== void 0 && (a.places = St(e.p).map(aa)), sa(e, a);
  }
  if (e.f !== void 0) {
    const a = { kind: "float", frames: St(e.f).map((s) => !$a(s) || s.n === void 0 ? Se() : { node: kn(s.n), ...aa(s) }) };
    return sa(e, a);
  }
  return Se();
}
const tl = /[ '!:(),*@$]/, rp = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][-+]?\d+)?$/;
function Fs(e) {
  return e !== "" && !tl.test(e) && !/^[-\d]/.test(e) ? e : `'${e.replace(/[!']/g, (n) => `!${n}`)}'`;
}
function xa(e) {
  return e === null ? "!n" : e === !0 ? "!t" : e === !1 ? "!f" : typeof e == "number" ? Number.isFinite(e) ? String(e) : "!n" : typeof e == "string" ? Fs(e) : Array.isArray(e) ? `!(${e.map(xa).join(",")})` : `(${Object.entries(e).map(([t, n]) => `${Fs(t)}:${xa(n)}`).join(",")})`;
}
function lp(e) {
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
    for (; t < e.length && !tl.test(e[t]); ) t++;
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
    return rp.test(l) ? Number(l) : l;
  }, i = r();
  return t !== e.length && Se(), i;
}
function ra(e) {
  return xa(ba(e));
}
function op(e) {
  try {
    return kn(lp(e));
  } catch (t) {
    if (t instanceof Jr) return null;
    throw t;
  }
}
function la(e, t) {
  for (const n of e.replace(/^[?]/, "").split("&")) {
    const a = n.indexOf("="), s = a === -1 ? n : n.slice(0, a);
    if (as(s) === t) return a === -1 ? "" : n.slice(a + 1);
  }
  return null;
}
function oa(e, t, n) {
  const a = e.replace(/^[?]/, "").split("&").filter(Boolean), s = a.findIndex((i) => {
    const o = i.indexOf("=");
    return as(o === -1 ? i : i.slice(0, o)) === t;
  }), r = n === null ? null : `${encodeURIComponent(t)}=${n}`;
  return s === -1 ? r && a.push(r) : r ? a[s] = r : a.splice(s, 1), a.length ? `?${a.join("&")}` : "";
}
function as(e) {
  try {
    return decodeURIComponent(e.replace(/\+/g, " "));
  } catch {
    return e;
  }
}
const ip = [
  [/%2C/g, ","],
  [/%3A/g, ":"],
  [/%2F/g, "/"],
  [/%40/g, "@"],
  [/%24/g, "$"],
  [/%20/g, "+"]
], Os = (e) => {
  let t = encodeURIComponent(e);
  for (const [n, a] of ip) t = t.replace(n, a);
  return t;
};
function Sp(e, t) {
  const { adapter: n } = t, a = t.param ?? "w", s = t.soloParam ?? "solo", r = t.delay ?? 200, i = () => Pt(t.home) ?? null;
  let o = la(n.search.value, a), l = null;
  const c = () => {
    l !== null && clearTimeout(l), l = null;
  }, d = (y) => y === null ? i() : op(as(y)) ?? i(), h = () => {
    c();
    const y = e.value, b = i(), M = y ? ra(y) : null, w = M === null || b && M === ra(b) ? null : Os(M);
    o = w;
    const S = oa(n.search.value, a, w);
    S !== n.search.value && n.replace(S);
  }, k = d(o);
  return k && (e.value = k), we(e, () => {
    c(), l = setTimeout(h, r);
  }), we(n.search, (y) => {
    const b = la(y, a);
    if (b === o) return;
    c(), o = b;
    const M = d(b);
    M && (e.value = M);
  }), An() && Zt(() => l !== null ? h() : void 0), {
    flush: () => l !== null ? h() : void 0,
    popOutHref: (y) => {
      let b = oa(n.search.value, a, Os(ra(Ed(Ye(y)))));
      return b = oa(b, s, "1"), n.href ? n.href(b) : `${n.path.value}${b}`;
    },
    solo: v(() => la(n.search.value, s) !== null)
  };
}
function Pp(e = "", t = "/") {
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
function Ep(e) {
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
const cp = {
  DataShell: id,
  ShellHeader: gr,
  QueryPanel: yr,
  RecordActions: kr,
  ResultsArea: Tr,
  FacetControl: _r,
  SegmentedControl: kd,
  StatusPill: nn,
  WindowFrame: ep,
  WindowPane: Qr,
  ListView: ma,
  CardsView: xr,
  GridView: Mr,
  ImagesView: Cr,
  TableView: Er,
  LinksView: Sr,
  PreviewView: Pr,
  TypeCardsView: Ar
}, Ap = {
  install(e, t = {}) {
    const n = t.prefix ?? "";
    for (const [a, s] of Object.entries(cp))
      e.component(`${n}${a}`, s);
    t.route && e.provide(Vs, t.route);
  }
};
export {
  Pn as CASCADE_STEP,
  pp as COLUMN_BREAKPOINTS,
  fp as COLUMN_ROLES,
  xr as CardsView,
  Ss as ColumnCell,
  Pl as DEFAULT_ENTITY_VIEW,
  _t as DEFAULT_FRAME,
  ia as DEFAULT_SORT,
  Sl as DEFAULT_VIEW,
  Mo as DRAFT_DELAY,
  id as DataShell,
  ca as EMPTY_CELL,
  pr as ENTITY_ALL,
  Sn as ENTITY_TERM,
  Qt as EXPRESSION_TERM,
  qa as FACET_PREFIX,
  _r as FacetControl,
  Mr as GridView,
  Ap as HeaderContentLayoutPlugin,
  Cr as ImagesView,
  Sr as LinksView,
  ma as ListView,
  Ct as MINIMIZED_GAP,
  zr as MINIMIZED_HEIGHT,
  ga as MINIMIZED_WIDTH,
  Rr as MIN_FRAME,
  $s as MOCK_TINTS,
  mp as MenuBar,
  Ua as MenuButton,
  Ka as MenuList,
  an as MetricDrill,
  ts as PANE_CONTEXT_KEY,
  Oa as PARAM_DIR,
  Ia as PARAM_ENTITY,
  Da as PARAM_EXPR,
  Ba as PARAM_PAGE,
  Fa as PARAM_SORT,
  Na as PARAM_VIEW,
  Ha as PinStar,
  Pr as PreviewView,
  Wa as QueryMark,
  yr as QueryPanel,
  dn as RECORD_STATUSES,
  Ta as RESULT_FIELDS,
  Vs as ROUTE_ADAPTER_KEY,
  kr as RecordActions,
  Tr as ResultsArea,
  fr as SHELL_CONTEXT_KEY,
  dp as SHELL_THEMES,
  sn as ScopeMark,
  kd as SegmentedControl,
  $t as SelectTick,
  hp as ShellCard,
  gr as ShellHeader,
  ha as StandingControl,
  nn as StatusPill,
  Er as TableView,
  Ar as TypeCardsView,
  Ks as VIEW_KINDS,
  El as VIEW_LABELS,
  es as WINDOW_CONTEXT_KEY,
  ep as WindowFrame,
  Qr as WindowPane,
  Ir as activePanel,
  xt as activeTab,
  za as addTerm,
  Ra as andExpression,
  Ad as axisOf,
  Dn as cascade,
  Zs as cellFull,
  en as cellText,
  gn as cellTextOf,
  He as cellValue,
  jn as changesResults,
  Jn as clampRect,
  Kr as collapseSpace,
  qd as collapseToTabs,
  _p as column,
  vs as columnAlign,
  hs as columnClass,
  ps as columnKey,
  er as columnShortcut,
  Wl as columnShortcutOf,
  ua as columnTruncates,
  Il as columnsFor,
  Tl as countPages,
  Cl as createHistoryAdapter,
  Pp as createMemoryAdapter,
  fo as createMockDataSource,
  Ep as createVueRouterAdapter,
  op as decodeLayout,
  Ol as defaultCellText,
  Ns as defaultLayout,
  Aa as defaultQuery,
  Yt as defaultViewFor,
  Xn as drillExpression,
  Rs as dropIntoSpace,
  Ft as emptyFacetState,
  Sa as emptyFacetValue,
  ra as encodeLayout,
  or as excludingTerm,
  Mn as expandShortcuts,
  Et as findEntity,
  dt as findSort,
  yp as fixedView,
  ja as float,
  Ts as floatPanel,
  jr as floatSplit,
  Vd as floatTabs,
  Kd as floatTabsAt,
  mn as fnv1a,
  Ws as focusEntity,
  Mt as formatCount,
  zl as formatDate,
  ot as formatExpression,
  Rl as formatMetric,
  Ll as formatOrdinal,
  tn as formatTerm,
  On as frame,
  mt as frameAt,
  Pe as frameOf,
  wa as framePathOf,
  Re as frontPanel,
  io as generateRows,
  gp as group,
  Tt as groupOf,
  Td as groups,
  Xs as hasActiveFacets,
  ve as hasPanel,
  Ed as headless,
  Kt as insertPanel,
  Ut as isChoosable,
  vp as isEntityScoped,
  Gs as isFacetActive,
  ae as isFloat,
  Y as isGroup,
  ut as isMaximized,
  gt as isMinimized,
  _e as isPanelTab,
  Pa as isPristineQuery,
  Dt as isSplit,
  Ve as isTabOf,
  Ea as isTypeCardsQuery,
  Hs as isViewKind,
  ks as joinExpression,
  ir as liftTerm,
  Gl as matchesExpression,
  co as matchesFacets,
  zd as maximizeFrame,
  Id as maximizeFrameAt,
  Ud as mergeSpace,
  Ld as minimizeFrame,
  Nd as minimizeFrameAt,
  pn as movePanel,
  Gt as moveTab,
  Xl as negateTerm,
  Ke as nodeAt,
  Xt as nodeTitle,
  be as normalizeLayout,
  Be as normalizeSearch,
  Za as normalizeSizes,
  Xr as onlySpace,
  Jd as openPopOut,
  Zl as oppositeTerm,
  We as panelIds,
  Ye as panelNode,
  Ps as panelTabs,
  Ne as parseExpression,
  wo as parseQuery,
  Zd as popOutRect,
  Xi as presentParts,
  br as presentRow,
  In as pressOptions,
  Yr as providePaneContext,
  po as provideShellContext,
  Xd as provideWindowContext,
  ea as raiseFrame,
  jt as raiseFrameAt,
  Fd as raisedPath,
  to as readDraft,
  Ys as reconcileFacets,
  Gd as reconcileLayout,
  lr as recordTerm,
  fa as refineExpression,
  yt as removePanel,
  st as replaceAt,
  Es as resizeRect,
  Is as resizeSplit,
  Rn as resolveView,
  Xe as roleColumn,
  Qs as roleColumns,
  En as rootSpace,
  Xa as row,
  Fl as rowKey,
  da as sameTerm,
  zn as scopeTerm,
  Wt as scopeTermFor,
  dr as scopedEntity,
  Qn as serializeQuery,
  zt as setActivePanel,
  Rd as setFrameRect,
  As as setFrameRectAt,
  wn as setSizesAt,
  bp as setSplitDirection,
  it as sizesOf,
  js as sortsFor,
  Ce as spaceChrome,
  Ot as spaceTitle,
  Ga as split,
  Ql as splitExpression,
  zs as spreadTabs,
  Ls as spreadTabsAt,
  bo as summarizeQuery,
  Va as summaryTerms,
  yn as swapPanels,
  Fn as tabNode,
  ln as tabPanels,
  La as termStanding,
  Gr as tileFloat,
  $p as toFloat,
  xp as toTiled,
  wp as toggleMaximized,
  kp as toggleMinimized,
  pu as useColumns,
  Co as useDraft,
  Vo as useEntityCounts,
  Au as useEntityPreviews,
  Sp as useLayoutRoute,
  Mp as usePaneContext,
  Cp as usePaneMenu,
  bt as usePresentedRows,
  $o as useQueryState,
  Wo as useRecordNames,
  xo as useResults,
  $e as useShellContext,
  qn as useWindowContext,
  fs as viewAcross,
  pa as withStanding,
  ur as withoutOwnScope,
  Yl as withoutTerm
};
