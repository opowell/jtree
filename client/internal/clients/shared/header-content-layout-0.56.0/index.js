import { ref as H, inject as It, provide as ka, computed as p, toValue as Pt, shallowRef as wt, watch as we, onScopeDispose as Zt, getCurrentScope as An, defineComponent as ie, onMounted as Fs, onBeforeUnmount as We, resolveComponent as Os, openBlock as f, createElementBlock as m, normalizeStyle as Ae, Fragment as ne, renderList as ge, toDisplayString as F, createCommentVNode as I, createElementVNode as M, createBlock as Z, nextTick as Nt, useId as Tn, unref as A, normalizeClass as ut, Teleport as ml, createVNode as ce, withDirectives as dt, withKeys as et, withModifiers as Ne, vModelText as bn, renderSlot as $e, useSlots as Jt, createTextVNode as Fe, withCtx as xe, reactive as cs, resolveDynamicComponent as ba, createSlots as hn, useModel as Ht, mergeModels as $n, vShow as xn, Comment as gl, Text as _l, h as yl } from "vue";
const Ds = Symbol("dc.routeAdapter");
function Be(e) {
  if (!e) return "";
  const t = e.replace(/^[?]/, "");
  return t ? `?${t}` : "";
}
function wl() {
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
const Bs = ["list", "cards", "grid", "images", "table", "links", "preview"], sp = [
  "minimal",
  "mono-size",
  "dark",
  "light",
  "auto",
  "macos",
  "windows",
  "inherit"
], dn = ["ok", "running", "queued", "review", "failed"], rp = [
  "identity",
  "reference",
  "metric",
  "state",
  "updated",
  "image",
  "tint"
], lp = [480, 620, 760, 900, 1100], kl = "cards", bl = "table";
function Yt(e, t = {}) {
  const n = (s) => s && qs(s) ? s : void 0;
  if (e === null) return n(t.view) ?? kl;
  const a = t.landing === "entity" ? n(t.view) : void 0;
  return n(t.entityView) ?? a ?? bl;
}
function us(e, t, n, a = {}) {
  return e === Yt(t, a) ? Yt(n, a) : e;
}
const sa = "updated";
function qs(e) {
  return typeof e == "string" && Bs.includes(e);
}
const $l = {
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
function Vs(e, t = {}) {
  const n = Et(e, t.entity), a = e.entities[0];
  if (!n && !a) throw new Error(`Schema "${e.key}" declares no entities`);
  return n ?? a;
}
function Ks(e, t = null) {
  return e?.columns ?? t?.columns ?? [];
}
function Hs(e, t = null) {
  if (e?.sorts?.length) return e.sorts;
  const n = /* @__PURE__ */ new Set(), a = [];
  for (const s of Ks(e, t))
    !s.sort || n.has(s.sort) || (n.add(s.sort), a.push({ key: s.sort, label: (s.label ?? s.sort).toLowerCase() }));
  return a;
}
const xl = { key: sa, label: sa };
function it(e, t, n = null) {
  const a = Hs(e, n);
  return (t ? a.find((r) => r.key === t) : void 0) ?? a.find((r) => r.key === sa) ?? a[0] ?? xl;
}
function $a(e) {
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
  for (const n of e?.facets ?? []) t[n.key] = $a(n);
  return t;
}
function Ws(e) {
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
function Us(e) {
  return Object.values(e).some(Ws);
}
function xa(e) {
  return e.entity === null && e.expr.trim() === "" && !Us(e.facets);
}
function op(e) {
  return e.entity !== null;
}
function Ma(e, t) {
  return e.entity === null && Rn(e.view, t) === "cards";
}
function Ml(e, t) {
  return t <= 0 ? 1 : Math.max(1, Math.ceil(e / t));
}
function Ca(e, t = {}) {
  const a = t.landing === "entity" ? Vs(e, t) : null;
  return {
    entity: a?.key ?? null,
    view: Yt(a?.key ?? null, t),
    sort: it(a, t.sort).key,
    dir: t.dir === "asc" ? "asc" : "desc",
    expr: "",
    facets: Ft(a),
    page: 1
  };
}
const Sa = ["entity", "sort", "dir", "expr", "facets"];
function Kn(e) {
  return Sa.some((t) => t in e);
}
function js(e, t) {
  const n = {};
  for (const a of e?.facets ?? []) {
    const s = t[a.key];
    n[a.key] = s && s.kind === a.kind ? s : $a(a);
  }
  return n;
}
function mn(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n++)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return Math.abs(t);
}
function Cl(e) {
  if (!Number.isFinite(e)) return "—";
  const t = Math.abs(e);
  return t >= 1e6 ? `${(e / 1e6).toFixed(1)}m` : t >= 1e3 ? `${(e / 1e3).toFixed(1)}k` : String(Math.round(e));
}
function Mt(e) {
  return Number.isFinite(e) ? Math.round(e).toLocaleString("en-US") : "—";
}
function Sl(e) {
  const t = new Date(e);
  if (Number.isNaN(t.getTime())) return "—";
  const n = String(t.getUTCDate()).padStart(2, "0"), a = String(t.getUTCMonth() + 1).padStart(2, "0");
  return `${n}.${a}.${t.getUTCFullYear()}`;
}
function Pl(e) {
  return String(e + 1).padStart(2, "0");
}
const ra = "—";
function Ge(e, t) {
  return e.find((n) => n.role === t);
}
function Gs(e, t) {
  return e.filter((n) => n.role === t);
}
function El(e, t) {
  const n = (t ? t.columns : e?.columns) ?? [], a = t ? "scoped" : "everything";
  return n.filter(
    (s) => s.role !== "tint" && ((s.when ?? "always") === "always" || s.when === a)
  );
}
const Al = ["id", "entityKey", "entityLabel"];
function He(e, t) {
  if (e.value) return e.value(t);
  const n = e.field ?? e.key;
  if (n !== void 0) {
    if (t.fields && n in t.fields) return t.fields[n];
    if (Al.includes(n))
      return t[n];
  }
}
function ds(e, t) {
  const n = e.key ?? e.field ?? e.label;
  return n?.trim() ? n.trim() : `column-${t}`;
}
function Tl(e, t) {
  return e.id?.trim() ? e.id : `${e.entityKey || "row"}-${t}`;
}
function Rl(e, t) {
  if (e == null || e === "") return ra;
  if (t === "number") {
    const n = typeof e == "number" ? e : Number(e);
    return Number.isFinite(n) ? Cl(n) : String(e);
  }
  return t === "date" ? Sl(String(e)) : Array.isArray(e) ? e.length ? e.join(", ") : ra : String(e);
}
function en(e, t) {
  const n = He(e, t);
  return e.format ? e.format(n, t) : Rl(n, e.kind);
}
function zl(e) {
  return typeof e == "number" ? Number.isFinite(e) ? String(e) : "" : typeof e == "string" ? e : Array.isArray(e) ? e.join(", ") : "";
}
function Xs(e, t) {
  const n = en(e, t), a = zl(He(e, t));
  return a && a !== n ? a : n;
}
function gn(e, t) {
  return e ? en(e, t) : "";
}
function fs(e) {
  return e.align ? e.align : e.kind === "number" || e.kind === "ordinal" ? "right" : "left";
}
const Ll = {
  ordinal: "dc-table__num",
  number: "dc-table__number",
  date: "dc-table__date",
  status: "dc-table__state"
};
function ps(e) {
  return [Ll[e.kind ?? "text"], e.class].filter(Boolean).join(" ");
}
function la(e) {
  if (e.truncate !== void 0) return e.truncate;
  const t = e.kind ?? "text";
  return t === "text" || t === "number" || t === "date";
}
const Il = /^([A-Za-z_][\w.-]*)\s*(>=|<=|:|=|>|<)\s*(.*)$/;
function Nl(e) {
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
function Ie(e) {
  const t = e.trim();
  if (!t) return [];
  const n = [];
  let a = [];
  for (const s of Nl(t)) {
    const r = s.toUpperCase();
    if (r === "AND" || r === "&&") continue;
    if (r === "OR" || r === "||") {
      a.length && n.push(a), a = [];
      continue;
    }
    const i = s.length > 1 && s.startsWith("-"), o = i ? s.slice(1) : s, l = i ? { negated: !0 } : {}, c = Il.exec(o);
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
const At = (e) => e.toLowerCase().replace(/\s+/g, ""), Ys = [
  ["status", "state"],
  ["state", "state"],
  ["updated", "updated"],
  ["date", "updated"],
  ["name", "identity"],
  ["ref", "reference"]
];
function Fl(e, t, n) {
  const a = At(e), s = n.columns ?? [];
  if (a === "entity") return t.entityKey;
  if (e in t.fields) return t.fields[e];
  const r = s.find(
    (c) => c.key?.toLowerCase() === e.toLowerCase() || c.field?.toLowerCase() === e.toLowerCase() || c.label !== void 0 && At(c.label) === a
  );
  if (r) return He(r, t);
  const i = n.facets.find((c) => At(c.label) === a);
  if (i && i.key in t.fields) return t.fields[i.key];
  const o = Ys.find(([c]) => c === a)?.[1];
  if (o) {
    const c = Ge(s, o);
    if (c) return He(c, t);
  }
  const l = /^metric(\d+)$/.exec(a);
  if (l) {
    const c = Gs(s, "metric")[Number(l[1]) - 1];
    if (c) return He(c, t);
  }
}
function Qs(e) {
  return (e.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).map((t) => t.charAt(0)).join("");
}
const vs = /^[a-z_][\w.-]*$/;
function Zs(e) {
  const t = (e.key ?? e.field)?.toLowerCase();
  if (t !== void 0) return vs.test(t) ? t : void 0;
  const n = e.label === void 0 ? void 0 : At(e.label);
  return n !== void 0 && vs.test(n) ? n : void 0;
}
function Ol(e, t) {
  const n = At(e);
  if (n === "entity" || Ys.some(([s]) => s === n) || /^metric\d+$/.test(n)) return !0;
  const a = (s) => s !== void 0 && At(s) === n;
  return (t.columns ?? []).some(
    (s) => a(s.key) || a(s.field) || a(s.label)
  ) || t.facets.some((s) => a(s.key) || a(s.label));
}
function Mn(e, t) {
  if (!t) return e;
  let n = !1;
  const a = Ie(e).map(
    (s) => s.map((r) => {
      if (r.kind !== "field") return r;
      const i = Js(r.field, t), o = i && Zs(i);
      return o ? (n = !0, { ...r, field: o }) : r;
    })
  );
  return n ? st(a) : e;
}
function Js(e, t) {
  if (!(!e || Ol(e, t)))
    return (t.columns ?? []).find(
      (n) => n.label !== void 0 && Qs(n.label) === e
    );
}
function Dl(e, t) {
  if (!t || e.label === void 0 || !Zs(e)) return;
  const n = Qs(e.label);
  return Js(n, t) === e ? n : void 0;
}
function Hn(e, t) {
  const n = e.toLowerCase(), a = t.toLowerCase();
  if (!a.includes("*")) return n.includes(a);
  const s = a.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(s).test(n);
}
function hs(e, t) {
  return e.toLowerCase() === t.toLowerCase();
}
function Bl(e, t, n) {
  if (e.kind === "text") {
    const i = n.columns ?? [];
    return ["identity", "reference"].some((o) => {
      const l = Ge(i, o), c = l ? He(l, t) : void 0;
      return typeof c == "string" && Hn(c, e.value);
    });
  }
  const a = Fl(e.field, t, n);
  if (a === void 0) return null;
  if (Array.isArray(a))
    return e.comparator === ":" || e.comparator === "=" ? a.some(
      (o) => e.comparator === "=" ? hs(String(o), e.value) : Hn(String(o), e.value)
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
    return e.comparator === "=" ? hs(String(a), e.value) : Hn(String(a), e.value);
  }
  const s = Number(e.value), r = typeof a == "number" ? a : Number(a);
  return !Number.isFinite(s) || !Number.isFinite(r) ? null : ql(e.comparator, r, s);
}
function ms(e, t, n) {
  const a = Bl(e, t, n);
  return a === null ? !0 : e.negated ? !a : a;
}
function ql(e, t, n) {
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
function gs(e) {
  return e.kind === "field" && !e.negated && (e.comparator === ":" || e.comparator === "=");
}
function Vl(e, t, n) {
  return e.length ? e.some((a) => {
    const s = /* @__PURE__ */ new Map();
    for (const r of a)
      gs(r) && s.set(r.field, (s.get(r.field) ?? !1) || ms(r, t, n));
    return a.every(
      (r) => gs(r) ? s.get(r.field) === !0 : ms(r, t, n)
    );
  }) : !0;
}
function _s(e) {
  return /[\s"']/.test(e) ? `"${e.replace(/["']/g, "")}"` : e;
}
function tn(e) {
  const t = e.negated ? "-" : "";
  return e.kind === "text" ? t + _s(e.value) : `${t}${e.field}${e.comparator}${_s(e.value)}`;
}
function Kl(e) {
  if (!e.negated) return { ...e, negated: !0 };
  const { negated: t, ...n } = e;
  return n;
}
function st(e) {
  return e.filter((t) => t.length).map((t) => t.map(tn).join(" ")).join(" OR ");
}
function Hl(e, t, n) {
  return e.map((a, s) => s === t ? a.filter((r, i) => i !== n) : a).filter((a) => a.length);
}
function Wl(e) {
  const t = Ie(e);
  if (t.length > 1) return { parts: [], text: e.trim() };
  const n = t[0] ?? [];
  return {
    parts: n.filter((a) => a.kind === "field"),
    text: n.filter((a) => a.kind === "text").map(tn).join(" ")
  };
}
function ys(e, t) {
  return [...e.map(tn), t.trim()].filter(Boolean).join(" ");
}
const ws = (e, t) => e.toLowerCase() === t.toLowerCase();
function oa(e, t) {
  return !!e.negated == !!t.negated && er(e, t);
}
function Ul(e, t) {
  return !!e.negated != !!t.negated && er(e, t);
}
function er(e, t) {
  return e.kind === "field" ? t.kind === "field" && e.field === t.field && e.comparator === t.comparator && ws(e.value, t.value) : t.kind === "text" && ws(e.value, t.value);
}
function jl(e, t) {
  return t.filter((n) => !e.some((a) => oa(a, n)));
}
function Pa(e, t) {
  return tr(e, t, (n) => n);
}
function ia(e, t) {
  return tr(
    e,
    t,
    (n, a) => n.filter((s) => !a.some((r) => Ul(s, r)))
  );
}
const Gl = /^[A-Za-z_][\w.-]*\s*(?:>=|<=|:|=|>|<)$/;
function Xl(e) {
  return st(
    Ie(e).map(
      (t) => t.filter(
        (n) => n.kind !== "text" || n.value !== "-" && !Gl.test(n.value)
      )
    ).filter((t) => t.length > 0)
  );
}
function tr(e, t, n) {
  const a = Ie(e), s = Ie(t);
  return a.length ? s.length ? st(
    a.flatMap(
      (r) => s.map((i) => [...n(r, i), ...jl(r, i)])
    )
  ) : st(a) : st(s);
}
const ks = [
  "oklch(0.36 0.06 240)",
  "oklch(0.34 0.07 290)",
  "oklch(0.36 0.06 160)",
  "oklch(0.38 0.06 80)",
  "oklch(0.35 0.07 30)",
  "oklch(0.34 0.05 200)"
];
function nr(e, t) {
  return `${e}_${1e4 + t * 7}`;
}
const Yl = 7, Ql = 3;
function Zl(e, t, n, a) {
  const s = (t * Yl + mn(n)) % a, r = [];
  for (let i = 0; i < Math.min(Ql, a); i++)
    r.push(nr(e, (s + i) % a));
  return r;
}
function Jl(e, t) {
  switch (e.kind) {
    case "chips":
      return e.multiple ? eo(e.options, t) : e.options[t % e.options.length] ?? "";
    case "range": {
      const n = Math.max(0, e.max - e.min);
      return e.min + (n === 0 ? 0 : t % (n + 1));
    }
    case "toggle":
      return t % 3 === 0;
  }
}
function eo(e, t) {
  if (!e.length) return [];
  const n = 1 + (t >> 5) % Math.min(3, e.length), a = t % e.length, s = /* @__PURE__ */ new Set();
  for (let r = 0; r < n; r++) s.add((a + r) % e.length);
  return [...s].sort((r, i) => r - i).map((r) => e[r]);
}
function to(e, t) {
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
      return ks[n % ks.length];
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
function no(e, t = {}) {
  const n = t.population ?? 48, a = t.seed ?? "", s = t.now ?? /* @__PURE__ */ new Date("2026-08-25T00:00:00Z"), r = e.samples, i = t.scopes ?? [];
  if (!r.length) return [];
  const o = [];
  for (let l = 0; l < n; l++) {
    const c = r[l % r.length], d = Math.floor(l / r.length), h = mn(`${a}:${e.key}:${c[0]}:${l}`), k = nr(e.key, l), g = new Date(s.getTime() - h % 900 * 36e5).toISOString(), y = {};
    for (const b of e.columns ?? []) {
      const $ = b.field ?? b.key;
      if (!$ || b.value) continue;
      const w = to(b, {
        hash: mn(`${h}:${$}`),
        sample: c,
        revision: d,
        updatedAt: g
      });
      w !== void 0 && (y[$] = w);
    }
    for (const b of e.facets)
      y[b.key] = Jl(b, mn(`${h}:${b.key}`));
    for (const [b, $] of i)
      y[b] = $ === e.key ? k : Zl($, l, b, n);
    o.push({ id: k, entityKey: e.key, entityLabel: e.label, fields: y });
  }
  return o;
}
function ao(e, t) {
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
function so(e, t) {
  const n = e.find((i) => i.sort === t);
  if (!n) return () => 0;
  const a = n.kind ?? "text", s = a === "number" || n.role === "metric", r = a === "date" || n.role === "updated";
  return (i, o) => {
    const l = He(n, i), c = He(n, o);
    return s ? Number(c ?? 0) - Number(l ?? 0) : r ? Date.parse(String(c ?? "")) - Date.parse(String(l ?? "")) : String(c ?? "").localeCompare(String(l ?? ""));
  };
}
function ro(e = {}) {
  const t = /* @__PURE__ */ new Map(), n = (a, s) => {
    const r = t.get(a.key);
    if (r) return r;
    const i = e.scopes ?? s.entities.flatMap(
      (l) => l.scope ? [[l.scope, l.key]] : []
    ), o = no(a, { ...e, scopes: i });
    return t.set(a.key, o), o;
  };
  return {
    query({ query: a, schema: s, entity: r, limit: i, offset: o }) {
      const l = Ie(a.expr), c = r ? [r] : s.entities, d = [], h = [];
      for (const y of c)
        for (const b of n(y, s))
          d.push(b), (r ? ao(b, a.facets) : !0) && Vl(l, b, y) && h.push(b);
      const k = it(r, a.sort, s), g = h.sort(so(Ks(r, s), k.key));
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
  return ar(e, t.id);
}
function ar(e, t) {
  const n = e?.scope;
  return n ? `${n}="${t.replace(/"/g, "")}"` : null;
}
function Ln(e, t) {
  if (e.kind !== "field" || t.kind !== "field") return oa(e, t);
  const n = (a) => a.comparator === ":" || a.comparator === "=";
  return oa(e, { ...t, comparator: n(e) && n(t) ? e.comparator : t.comparator });
}
function Cn(e, t) {
  return Ln(e, Kl(t));
}
function Wt(e, t) {
  return zn(
    e.entities.find((n) => n.key === t.entityKey),
    t
  );
}
function Ea(e, t) {
  if (!t) return e;
  const n = e.trim();
  if (!n) return t;
  const [a] = Ie(t).flat();
  if (!a) return n;
  const s = Ie(n);
  return s.some((o) => o.some((l) => Ln(l, a))) ? n : s.some((o) => o.some((l) => Cn(l, a))) ? st(
    s.map(
      (o) => o.map((l) => Cn(l, a) ? a : l)
    )
  ) : `${n} ${t}`;
}
function sr(e) {
  if (!e) return null;
  const t = e.trim();
  return t ? t.startsWith("-") ? t.slice(1) : `-${t}` : null;
}
function Aa(e, t) {
  if (!t || !e.trim()) return null;
  const [n] = Ie(t).flat();
  if (!n) return null;
  const a = Ie(e).flat();
  return a.some((s) => Ln(s, n)) ? n.negated ? "out" : "in" : a.some((s) => Cn(s, n)) ? n.negated ? "in" : "out" : null;
}
function rr(e, t) {
  if (!t || !e.trim()) return e;
  const [n] = Ie(t).flat();
  if (!n) return e;
  const a = Ie(e), s = a.map(
    (r) => r.filter((i) => !Ln(i, n) && !Cn(i, n))
  );
  return s.every((r, i) => r.length === a[i]?.length) ? e : st(s);
}
function ca(e, t, n) {
  return t ? n === null ? rr(e, t) : Ea(e, n === "out" ? sr(t) : t) : e;
}
function lr(e) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0;
}
function In(e) {
  return e.altKey ? { exclude: !0 } : {};
}
function Wn(e, t, n, a = {}) {
  const s = Wt(e, n);
  return Ea(t.expr, a.exclude ? sr(s) : s);
}
function or(e, t) {
  const n = e?.scope?.toLowerCase();
  if (!n || e?.keepsScope || !t.trim()) return t;
  const a = Ie(t), s = a.map(
    (r) => r.filter((i) => i.kind !== "field" || i.field !== n)
  );
  return s.every((r, i) => r.length === a[i]?.length) ? t : st(s);
}
function ir(e, t) {
  const n = t.toLowerCase();
  return e.entities.find((a) => a.scope?.toLowerCase() === n) ?? null;
}
const cr = Symbol("dc.shellContext");
function lo(e) {
  const t = e.liveQuery ? e : oo(e);
  return ka(cr, t), t;
}
function oo(e) {
  const t = e.draft ?? H("");
  return {
    draft: t,
    liveQuery: e.query,
    drafting: p(() => !1),
    commitDraft() {
      const n = t.value.trim();
      n && (e.setExpression(
        ia(e.query.value.expr, Mn(n, e.entity.value))
      ), t.value = "");
    },
    abandonDraft() {
      t.value = "";
    },
    ...e
  };
}
function be() {
  const e = It(cr, null);
  if (!e)
    throw new Error(
      "[header-content-layout] No shell context found. Render this component inside <DataShell>."
    );
  return e;
}
const Ta = "e", Ra = "v", za = "s", La = "d", Ia = "q", Na = "p", Fa = "f_", ur = "*", io = [
  Ta,
  Ra,
  za,
  La,
  Ia,
  Na
], ua = "..", dr = ",", co = [
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
function Un(e) {
  let t = encodeURIComponent(e);
  for (const [n, a] of co) t = t.replace(n, a);
  return t;
}
function at(e) {
  try {
    return decodeURIComponent(e.replace(/\+/g, " "));
  } catch {
    return e.replace(/\+/g, " ");
  }
}
function fr(e) {
  const t = e.replace(/^[?]/, "");
  if (!t) return [];
  const n = [];
  for (const a of t.split("&")) {
    if (!a) continue;
    const s = a.indexOf("="), r = s === -1 ? a : a.slice(0, s), i = s === -1 ? "" : a.slice(s + 1);
    n.push([at(r), i]);
  }
  return n;
}
function uo(e) {
  return io.includes(e) || e.startsWith(Fa);
}
function bs(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function fo(e, t) {
  const n = at(t);
  switch (e.kind) {
    case "chips": {
      const a = new Set(
        n.split(dr).map((r) => r.trim()).filter(Boolean)
      );
      return { kind: "chips", selected: e.options.filter((r) => a.has(r)) };
    }
    case "range": {
      const a = n.indexOf(ua), s = (a === -1 ? n : n.slice(0, a)).trim(), r = (a === -1 ? "" : n.slice(a + ua.length)).trim(), i = s === "" ? null : Number(s), o = r === "" ? null : Number(r);
      let l = i !== null && Number.isFinite(i) ? bs(i, e.min, e.max) : null, c = o !== null && Number.isFinite(o) ? bs(o, e.min, e.max) : null;
      return l !== null && c !== null && l > c && ([l, c] = [c, l]), { kind: "range", min: l, max: c };
    }
    case "toggle":
      return { kind: "toggle", on: n === "1" || n === "true" };
  }
}
function po(e, t) {
  switch (e.kind) {
    case "chips":
      return e.selected.length ? (t.kind === "chips" ? t.options.filter((a) => e.selected.includes(a)) : e.selected).join(dr) : null;
    case "range":
      return e.min === null && e.max === null ? null : `${e.min ?? ""}${ua}${e.max ?? ""}`;
    case "toggle":
      return e.on ? "1" : null;
  }
}
function vo(e, t, n = {}) {
  const a = Ca(t, n), s = new Map(fr(e)), r = s.get(Ta), i = r === void 0 ? a.entity : at(r), o = i === ur ? null : Et(t, i), l = s.get(Ra), c = l && qs(at(l)) ? at(l) : Yt(o?.key ?? null, n), d = s.get(za), h = it(o, d ? at(d) : n.sort, t), k = s.get(La), g = k ? at(k) === "asc" ? "asc" : "desc" : a.dir, y = s.get(Ia), b = s.get(Na), $ = b === void 0 ? 1 : Number(at(b)), w = Number.isFinite($) ? Math.max(1, Math.floor($)) : 1, C = {};
  for (const R of o?.facets ?? []) {
    const x = s.get(`${Fa}${R.key}`);
    C[R.key] = x === void 0 ? $a(R) : fo(R, x);
  }
  return {
    entity: o?.key ?? null,
    view: c,
    sort: h.key,
    dir: g,
    expr: y === void 0 ? "" : at(y),
    facets: js(o, C),
    page: w
  };
}
function jn(e, t, n = {}, a = "") {
  const s = Ca(t, n), r = Et(t, e.entity), i = fr(a).filter(([h]) => !uo(h)), o = [], l = (h, k) => o.push([h, Un(k)]), c = r?.key ?? null;
  c !== s.entity && l(Ta, c ?? ur), e.view !== Yt(c, n) && l(Ra, e.view), e.sort !== s.sort && l(za, e.sort), e.dir !== s.dir && l(La, e.dir), e.expr.trim() !== "" && l(Ia, e.expr);
  for (const h of r?.facets ?? []) {
    const k = e.facets[h.key];
    if (!k) continue;
    const g = po(k, h);
    g !== null && o.push([`${Fa}${h.key}`, Un(g)]);
  }
  e.page > 1 && l(Na, String(e.page));
  const d = [
    ...i.map(([h, k]) => [Un(h), k]),
    ...o
  ];
  return d.length ? `?${d.map(([h, k]) => k === "" ? h : `${h}=${k}`).join("&")}` : "";
}
const Sn = "entity", Qt = "expr";
function ho(e, t) {
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
function Oa(e, t) {
  const n = [];
  t && n.push({
    id: Sn,
    label: `entity:${t.key}`,
    facetKey: Sn
  });
  for (const a of t?.facets ?? []) {
    const s = e.facets[a.key];
    s && Ws(s) && n.push(...ho(a, s));
  }
  return Ie(e.expr).forEach((a, s) => {
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
function mo(e, t, n = null) {
  if (xa(e)) {
    const r = it(t, e.sort, n);
    return `everything · ${e.view} · ${r.label}`;
  }
  const a = Oa(e, t).filter((r) => r.facetKey !== Qt).map((r) => r.label), s = e.expr.trim();
  return s && a.push(`"${s}"`), a.join(" · ");
}
function go(e) {
  const { adapter: t } = e, n = p(() => Pt(e.schema)), a = p(() => Pt(e.defaults) ?? {}), s = p(() => vo(t.search.value, n.value, a.value)), r = p(() => Et(n.value, s.value.entity)), i = p(() => r.value ?? Vs(n.value, a.value)), o = p(() => Hs(r.value, n.value)), l = p(() => it(r.value, s.value.sort, n.value)), c = (w, C) => {
    const R = jn(w, n.value, a.value, t.search.value);
    return R === t.search.value ? !1 : (C === "push" ? t.push(R) : t.replace(R), !0);
  }, d = () => Pt(e.navigationMode) ?? "push", h = () => Pt(e.facetNavigationMode) ?? "replace", k = (w, C) => {
    const R = w.page ?? (Kn(w) ? 1 : s.value.page);
    return c({ ...s.value, ...w, page: R }, C);
  }, g = (w) => {
    const C = w.page ?? (Kn(w) ? 1 : s.value.page), R = jn({ ...s.value, ...w, page: C }, n.value, a.value, t.search.value);
    return t.href ? t.href(R) : `${t.path.value}${R}`;
  }, y = (w, C) => {
    const R = s.value.facets[w];
    if (!R) return;
    const x = { ...s.value.facets, [w]: C(R) };
    k({ facets: x }, h());
  }, b = (w) => {
    const C = w === null ? null : Et(n.value, w);
    return (C?.key ?? null) === s.value.entity ? {} : {
      entity: C?.key ?? null,
      view: us(s.value.view, s.value.entity, C?.key ?? null, a.value),
      sort: it(C, s.value.sort, n.value).key,
      facets: Ft(C)
    };
  }, $ = (w) => {
    const C = b(w);
    Object.keys(C).length && k(C, d());
  };
  return {
    query: s,
    entity: r,
    focus: i,
    sort: l,
    sorts: o,
    summary: p(() => mo(s.value, r.value, n.value)),
    terms: p(() => Oa(s.value, r.value)),
    isPristine: p(() => xa(s.value)),
    isEverything: p(() => s.value.entity === null),
    hasFacets: p(() => Us(s.value.facets)),
    setEntity: $,
    entityHref: (w) => g(b(w)),
    clearEntity: () => $(null),
    setView(w) {
      k({ view: w }, d());
    },
    setSort(w) {
      k({ sort: it(r.value, w, n.value).key }, d());
    },
    toggleDirection() {
      k({ dir: s.value.dir === "desc" ? "asc" : "desc" }, d());
    },
    setExpression(w) {
      return k({ expr: w }, d());
    },
    narrow(w, C, R) {
      return k({ expr: w, ...b(C), ...R ? { view: R } : {} }, d());
    },
    narrowHref(w, C, R) {
      return g({ expr: w, ...b(C), ...R ? { view: R } : {} });
    },
    setPage(w, C) {
      k({ page: Math.max(1, Math.floor(w)) }, C ?? d());
    },
    setFacet(w, C) {
      y(w, () => C);
    },
    toggleChip(w, C) {
      y(w, (R) => R.kind !== "chips" ? R : { kind: "chips", selected: R.selected.includes(C) ? R.selected.filter((S) => S !== C) : [...R.selected, C] });
    },
    setRange(w, C, R) {
      y(w, (x) => x.kind === "range" ? { kind: "range", min: C, max: R } : x);
    },
    toggleFlag(w) {
      y(
        w,
        (C) => C.kind === "toggle" ? { kind: "toggle", on: !C.on } : C
      );
    },
    removeTerm(w) {
      if (w.facetKey === Sn) {
        $(null);
        return;
      }
      if (w.facetKey === Qt) {
        const C = Hl(Ie(s.value.expr), w.group ?? 0, w.index ?? 0);
        k({ expr: st(C) }, d());
        return;
      }
      y(w.facetKey, (C) => C.kind === "chips" && w.option ? { kind: "chips", selected: C.selected.filter((R) => R !== w.option) } : C.kind === "range" ? { kind: "range", min: null, max: null } : C.kind === "toggle" ? { kind: "toggle", on: !1 } : C);
    },
    clearFilters() {
      k({ ...b(null), expr: "", facets: Ft(null) }, d());
    },
    reset() {
      c(Ca(n.value, a.value), d());
    },
    hrefFor(w) {
      const C = { ...s.value, ...w };
      return "entity" in w && !("view" in w) && (C.view = us(s.value.view, s.value.entity, C.entity, a.value)), C.page = w.page ?? (Kn(w) ? 1 : s.value.page), C.facets = js(Et(n.value, C.entity), C.facets), `${t.path.value}${jn(C, n.value, a.value, t.search.value)}`;
    }
  };
}
function _o(e) {
  const t = wt([]), n = H(0), a = H(!1), s = H(!1), r = wt(null);
  let i = 0, o = null, l = null;
  const c = p(() => (e.query.value.page - 1) * e.limit.value), d = p(() => Ml(n.value, e.limit.value)), h = () => {
    const x = e.query.value, S = e.within?.value.trim(), O = or(e.entity.value, x.expr);
    return S ? { ...x, expr: Pa(S, O) } : O === x.expr ? x : { ...x, expr: O };
  }, k = (x, S) => {
    t.value = x.rows, n.value = x.total, r.value = null, g(S);
  }, g = (x) => {
    o = { key: x, total: n.value }, s.value = !1;
  }, y = (x) => {
    r.value = x, t.value = [], n.value = 0, o = null, s.value = !1;
  }, b = (x, S, O, E) => {
    let z = !0;
    const T = () => x === i;
    let V = 0, W = !1;
    const U = (oe) => {
      V = oe, W = !0, E === void 0 && (n.value = oe);
    }, ve = () => {
      z && (z = !1, t.value = [], U(0)), r.value = null;
    };
    return {
      get open() {
        return T();
      },
      insert(oe, B) {
        if (!T()) return;
        const P = Array.isArray(oe) ? oe : [oe];
        if (!P.length) return;
        ve();
        const j = [...t.value];
        j.splice(B ?? j.length, 0, ...P), t.value = S > 0 ? j.slice(0, S) : j, U(V + P.length);
      },
      set(oe) {
        T() && (oe.rows && (ve(), t.value = S > 0 ? oe.rows.slice(0, S) : oe.rows, U(oe.rows.length)), oe.total !== void 0 && U(oe.total));
      },
      close() {
        T() && (a.value = !1, W && (n.value = V), g(O));
      },
      fail(oe) {
        T() && (y(oe), a.value = !1);
      }
    };
  }, $ = () => {
    const x = l;
    l = null, x?.();
  }, w = () => {
    const x = ++i;
    $();
    const S = C.value, O = o?.key === S ? o.total : void 0;
    s.value = O === void 0;
    const E = {
      query: h(),
      schema: e.schema.value,
      entity: e.entity.value,
      limit: e.limit.value,
      offset: c.value
    }, z = e.source.value;
    if (z.stream) {
      a.value = !0;
      try {
        l = z.stream(E, b(x, E.limit, S, O)) ?? null;
      } catch (V) {
        y(V), a.value = !1;
      }
      return;
    }
    let T;
    try {
      T = z.query(E);
    } catch (V) {
      y(V);
      return;
    }
    if (!(T instanceof Promise)) {
      k(T, S), a.value = !1;
      return;
    }
    a.value = !0, T.then((V) => {
      x === i && k(V, S);
    }).catch((V) => {
      x === i && y(V);
    }).finally(() => {
      x === i && (a.value = !1);
    });
  }, C = p(() => {
    const x = h();
    return `${e.entity.value?.key ?? e.schema.value.entities[0]?.key ?? ""}|${JSON.stringify(Sa.map((O) => x[O]))}`;
  }), R = p(() => `${C.value}|${e.query.value.page}`);
  return we([e.source, R, e.limit], w, {
    immediate: !0
  }), Zt(() => {
    i++, $();
  }, !0), { rows: t, total: n, offset: c, pageCount: d, pending: a, counting: s, error: r, refresh: w };
}
const yo = 150;
function wo(e) {
  const t = e.delay ?? yo, n = H(""), a = H("");
  let s = !1, r;
  const i = () => {
    clearTimeout(r), r = void 0;
  }, o = p(() => Mn(Xl(a.value), e.entity.value)), l = p(() => o.value.trim() !== ""), c = p(
    () => JSON.stringify([o.value, ...Sa.map((g) => e.query.value[g])])
  ), d = wt(null), h = p(() => {
    const g = e.query.value;
    if (!l.value) return g;
    const y = d.value?.of === c.value ? d.value.page : 1;
    return { ...g, expr: ia(g.expr, o.value), page: y };
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
      const y = ia(
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
const Ut = (e) => e.separator !== !0 && e.heading !== !0 && e.disabled !== !0, ko = ["aria-label"], bo = ["role", "aria-label"], $o = ["data-dc-item"], xo = {
  key: 0,
  class: "dc-menu__rule",
  role: "separator"
}, Mo = ["role", "aria-checked", "aria-haspopup", "aria-expanded", "aria-disabled", "disabled", "data-dc-item", "onClick", "onMouseenter"], Co = {
  class: "dc-menu__mark",
  "aria-hidden": "true"
}, So = { class: "dc-menu__label dc-truncate" }, Po = {
  key: 0,
  class: "dc-menu__key dc-mono"
}, Eo = {
  key: 1,
  class: "dc-menu__more",
  "aria-hidden": "true"
}, Ao = /* @__PURE__ */ ie({
  __name: "MenuList",
  props: {
    items: {},
    at: {},
    label: {},
    autofocus: { type: Boolean }
  },
  emits: ["choose", "dismiss"],
  setup(e, { expose: t, emit: n }) {
    const a = e, s = n, r = H(null), i = H([]), o = H(null), l = H(null), c = H(null), d = H(!1), h = p(
      () => a.items.flatMap((E, z) => Ut(E) ? [z] : [])
    ), k = p(() => {
      const E = [{ entries: [] }];
      return a.items.forEach((z, T) => {
        z.heading ? E.push({ heading: z, entries: [] }) : E[E.length - 1]?.entries.push({ item: z, index: T });
      }), E.filter((z) => z.entries.length > 0);
    }), g = H({ x: a.at.x, y: a.at.y });
    async function y() {
      g.value = { x: a.at.x, y: a.at.y }, await Nt();
      const E = r.value?.getBoundingClientRect();
      if (!E) return;
      const z = 8;
      let T = a.at.x, V = a.at.y;
      if (T + E.width > window.innerWidth - z) {
        const W = a.at.mirrorX === void 0 ? null : a.at.mirrorX - E.width;
        T = W !== null && W >= z ? W : window.innerWidth - E.width - z;
      }
      V + E.height > window.innerHeight - z && (V = window.innerHeight - E.height - z), g.value = { x: Math.max(z, T), y: Math.max(z, V) };
    }
    const b = p(() => ({ left: `${g.value.x}px`, top: `${g.value.y}px` }));
    function $(E) {
      o.value = E, E !== null && Nt(() => i.value[E]?.focus());
    }
    function w(E, z) {
      const T = h.value;
      if (T.length === 0) return null;
      if (E === null) return z === 1 ? T[0] ?? null : T[T.length - 1] ?? null;
      const V = T.indexOf(E);
      return V === -1 ? T[0] ?? null : T[(V + z + T.length) % T.length] ?? null;
    }
    function C(E, z) {
      if (!a.items[E]?.items?.length) return;
      const V = i.value[E]?.getBoundingClientRect(), W = r.value?.getBoundingClientRect();
      !V || !W || (c.value = { x: W.right - 4, y: V.top - 4, mirrorX: W.left + 4 }, l.value = E, d.value = z);
    }
    function R(E) {
      const z = l.value;
      l.value = null, c.value = null, E && z !== null && $(z);
    }
    function x(E) {
      const z = a.items[E];
      if (!(!z || !Ut(z))) {
        if (z.items?.length) {
          C(E, !0);
          return;
        }
        s("choose", z);
      }
    }
    function S(E) {
      const z = E.key;
      if (z === "Escape") {
        E.preventDefault(), E.stopPropagation(), l.value !== null ? R(!0) : s("dismiss");
        return;
      }
      if (z === "ArrowDown" || z === "ArrowUp") {
        E.preventDefault(), E.stopPropagation(), R(!1), $(w(o.value, z === "ArrowDown" ? 1 : -1));
        return;
      }
      if (z === "Home" || z === "End") {
        E.preventDefault(), E.stopPropagation(), R(!1), $(w(null, z === "Home" ? 1 : -1));
        return;
      }
      if (z === "ArrowRight") {
        const T = o.value;
        T !== null && a.items[T]?.items?.length && (E.preventDefault(), E.stopPropagation(), C(T, !0));
        return;
      }
      if (z === "ArrowLeft") {
        l.value !== null && (E.preventDefault(), E.stopPropagation(), R(!0));
        return;
      }
      if (z === "Enter" || z === " ") {
        const T = o.value;
        if (T === null) return;
        E.preventDefault(), E.stopPropagation(), x(T);
      }
    }
    function O(E) {
      const z = a.items[E];
      !z || !Ut(z) || (l.value !== null && l.value !== E && R(!1), $(E), z.items?.length && C(E, !1));
    }
    return Fs(() => {
      y(), a.autofocus && $(w(null, 1));
    }), we(() => a.at, y, { deep: !0 }), we(() => a.items, () => void y(), { deep: !0 }), We(() => {
      l.value = null;
    }), t({ root: r }), (E, z) => {
      const T = Os("MenuList", !0);
      return f(), m("div", {
        ref_key: "root",
        ref: r,
        class: "dc-menu",
        role: "menu",
        "aria-label": e.label,
        style: Ae(b.value),
        onKeydown: S
      }, [
        (f(!0), m(ne, null, ge(k.value, (V, W) => (f(), m("div", {
          key: `${W}-${V.heading?.label ?? ""}`,
          class: "dc-menu__group",
          role: V.heading ? "group" : "none",
          "aria-label": V.heading?.label
        }, [
          V.heading ? (f(), m("div", {
            key: 0,
            class: "dc-menu__heading dc-truncate",
            "aria-hidden": "true",
            "data-dc-item": V.heading.id
          }, F(V.heading.label), 9, $o)) : I("", !0),
          (f(!0), m(ne, null, ge(V.entries, ({ item: U, index: ve }) => (f(), m(ne, {
            key: U.id ?? `${ve}-${U.label ?? ""}`
          }, [
            U.separator ? (f(), m("div", xo)) : (f(), m("button", {
              key: 1,
              ref_for: !0,
              ref: (oe) => {
                oe && (i.value[ve] = oe);
              },
              type: "button",
              class: "dc-menu__item",
              role: U.checked === void 0 ? "menuitem" : "menuitemcheckbox",
              "aria-checked": U.checked === void 0 ? void 0 : U.checked,
              "aria-haspopup": U.items?.length ? "menu" : void 0,
              "aria-expanded": U.items?.length ? l.value === ve : void 0,
              "aria-disabled": U.disabled ? "true" : void 0,
              disabled: U.disabled,
              "data-dc-item": U.id,
              tabindex: "-1",
              onClick: (oe) => x(ve),
              onMouseenter: (oe) => O(ve)
            }, [
              M("span", Co, F(U.checked ? "✓" : ""), 1),
              M("span", So, F(U.label), 1),
              U.shortcut ? (f(), m("span", Po, F(U.shortcut), 1)) : U.items?.length ? (f(), m("span", Eo, "›")) : I("", !0)
            ], 40, Mo))
          ], 64))), 128))
        ], 8, bo))), 128)),
        l.value !== null && c.value ? (f(), Z(T, {
          key: l.value,
          items: e.items[l.value]?.items ?? [],
          at: c.value,
          label: e.items[l.value]?.label,
          autofocus: d.value,
          onChoose: z[0] || (z[0] = (V) => s("choose", V)),
          onDismiss: z[1] || (z[1] = (V) => R(!0))
        }, null, 8, ["items", "at", "label", "autofocus"])) : I("", !0)
      ], 44, ko);
    };
  }
}), de = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [a, s] of t)
    n[a] = s;
  return n;
}, Da = /* @__PURE__ */ de(Ao, [["__scopeId", "data-v-9b1413fa"]]), To = { class: "dc-pick" }, Ro = ["id"], zo = ["id", "aria-expanded", "aria-labelledby", "data-dc-value"], Lo = { class: "dc-pick__label" }, Io = /* @__PURE__ */ ie({
  __name: "PickControl",
  props: {
    modelValue: {},
    options: {},
    label: {},
    mono: { type: Boolean }
  },
  emits: ["update:modelValue", "open", "close"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = Tn() ?? "dc-pick", r = H(null), i = H(null), o = H(null), l = H(!1), c = p(() => o.value !== null), d = H(null), h = p(
      () => n.options.find((x) => x.key === n.modelValue) ?? n.options[0]
    ), k = p(
      () => n.options.map((x) => ({
        id: x.key,
        label: x.label,
        checked: x.key === n.modelValue
      }))
    ), g = p(
      () => o.value ? { maxHeight: `${window.innerHeight - o.value.y - 8}px` } : void 0
    );
    function y(x) {
      const S = r.value?.getBoundingClientRect();
      S && (d.value = r.value?.closest(".dc-shell") ?? document.body, o.value = { x: S.left, y: S.bottom + 4, mirrorX: S.right }, l.value = x, a("open"));
    }
    function b(x) {
      o.value && a("close"), o.value = null, x && r.value?.focus();
    }
    function $() {
      c.value ? b(!0) : y(!1);
    }
    function w(x) {
      x.key !== "ArrowDown" && x.key !== "ArrowUp" || c.value || (x.preventDefault(), y(!0));
    }
    function C(x) {
      const S = x.target;
      S && (r.value?.contains(S) || i.value?.root?.contains(S) || b(!1));
    }
    we(c, (x) => {
      x ? window.addEventListener("pointerdown", C, !0) : window.removeEventListener("pointerdown", C, !0);
    }), We(() => window.removeEventListener("pointerdown", C, !0));
    function R(x) {
      b(!0), !(x.id === void 0 || x.id === n.modelValue) && a("update:modelValue", x.id);
    }
    return (x, S) => (f(), m("span", To, [
      M("span", {
        id: `${A(s)}-name`,
        class: "dc-pick__name"
      }, F(e.label), 9, Ro),
      M("button", {
        id: `${A(s)}-value`,
        ref_key: "trigger",
        ref: r,
        type: "button",
        class: ut(["dc-pick__button", { "dc-mono": e.mono }]),
        "aria-haspopup": "menu",
        "aria-expanded": c.value,
        "aria-labelledby": `${A(s)}-name ${A(s)}-value`,
        "data-dc-value": e.modelValue,
        onClick: $,
        onKeydown: w
      }, [
        M("span", Lo, F(h.value?.label), 1)
      ], 42, zo),
      S[1] || (S[1] = M("span", {
        class: "dc-pick__mark",
        "aria-hidden": "true"
      }, "▾", -1)),
      o.value && d.value ? (f(), Z(ml, {
        key: 0,
        to: d.value
      }, [
        ce(Da, {
          ref_key: "menu",
          ref: i,
          class: "dc-pick__list",
          style: Ae(g.value),
          items: k.value,
          at: o.value,
          label: e.label,
          autofocus: l.value,
          onChoose: R,
          onDismiss: S[0] || (S[0] = (O) => b(!0))
        }, null, 8, ["style", "items", "at", "label", "autofocus"])
      ], 8, ["to"])) : I("", !0)
    ]));
  }
}), $s = /* @__PURE__ */ de(Io, [["__scopeId", "data-v-d21ebf1b"]]);
function No(e) {
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
      const $ = or(b, c.expr), w = k ? Pa(k, $) : $;
      let C = !1;
      const R = (S) => {
        if (o !== a) return;
        if (y) {
          g.set(b.key, S);
          return;
        }
        const O = new Map(t.value);
        O.set(b.key, S), t.value = O;
      }, x = e.source.value.query({
        query: { ...c, entity: b.key, expr: w, facets: Ft(b), page: 1 },
        schema: d,
        entity: b,
        limit: 0,
        offset: 0,
        signal: l,
        progress: (S) => {
          C || R({ total: S, pending: !0, counted: !0 });
        }
      });
      x instanceof Promise ? (g.has(b.key) || g.set(b.key, { total: 0, pending: !0, counted: !1 }), x.then((S) => {
        C = !0, R({ total: S.total, pending: !1, counted: !0 });
      })) : (C = !0, g.set(b.key, { total: x.total, pending: !1, counted: !0 }));
    }
    y = !1, t.value = g;
  };
  return An() && Zt(r), { counts: t, pristine: n, refresh: i, cancel: r };
}
const Fo = 25, pr = (e, t) => e.toLowerCase() === t.toLowerCase();
function Oo(e, t) {
  return e.find((n) => pr(n.id, t));
}
function Do(e) {
  const t = wt(/* @__PURE__ */ new Map()), n = /* @__PURE__ */ new Set(), a = (o) => {
    if (o.facetKey !== Qt || !o.field || !o.value) return null;
    const l = ir(e.schema.value, o.field);
    return l ? { entity: l, id: o.value, key: `${l.key}:${o.value}` } : null;
  }, s = (o) => {
    const { entity: l, id: c } = o, d = e.query.value;
    return e.source.value.query({
      query: {
        ...d,
        entity: l.key,
        // The reference on its own. The rest of the query is about the rows on
        // screen, which are of another type entirely.
        expr: ar(l, c) ?? "",
        facets: Ft(l),
        sort: it(l, d.sort, e.schema.value).key,
        page: 1
      },
      schema: e.schema.value,
      entity: l,
      limit: Fo,
      offset: 0
    });
  }, r = (o, l) => {
    const c = gn(Ge(o.columns ?? [], "identity"), l);
    return c === ra || pr(c, l.id) ? "" : c;
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
        const { reference: y } = l[g], b = Oo(k.rows, y.id);
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
const Bo = ["data-dc-expanded"], qo = { class: "dc-header__domain" }, Vo = {
  key: 0,
  class: "dc-header__within"
}, Ko = ["title"], Ho = ["data-dc-more", "title"], Wo = {
  key: 0,
  class: "dc-header__or dc-mono",
  "aria-hidden": "true"
}, Uo = ["title", "aria-label", "onClick"], jo = ["onKeydown"], Go = ["aria-expanded", "aria-controls"], Xo = {
  class: "dc-header__chevron",
  "aria-hidden": "true"
}, Yo = { class: "dc-header__sr" }, Qo = {
  key: 0,
  class: "dc-header__pages",
  "aria-label": "Pages"
}, Zo = ["disabled"], Jo = ["title"], ei = ["value", "onKeydown"], ti = {
  class: "dc-header__page-total",
  "aria-hidden": "true"
}, ni = {
  class: "dc-header__sr",
  "aria-live": "polite"
}, ai = ["disabled"], si = {
  key: 1,
  class: "dc-header__actions"
}, ri = "…", li = /* @__PURE__ */ ie({
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
    const n = e, a = t, s = be(), r = p(() => s.schema.value), i = p(
      () => s.hasFacets.value || !!s.liveQuery.value.expr.trim() || !!s.within.value
    ), o = p(() => r.value.formatCount ?? Mt), l = No({
      source: s.source,
      schema: s.schema,
      // What each type holds of what is on screen, the draft's results included:
      // a count of the committed query would disagree with the rows under it.
      query: s.liveQuery,
      entities: s.entities,
      within: s.within
    });
    function c(K) {
      if (n.hideCount) return K.count;
      if (K.key === s.query.value.entity && i.value) return o.value(s.total.value);
      if (l.pristine.value) return K.count;
      const X = l.counts.value.get(K.key);
      return X ? X.counted ? `${X.pending ? "~" : ""}${o.value(X.total)}` : ri : K.count;
    }
    function d(K) {
      return `${K.label} · ${c(K)}`;
    }
    const h = p(() => [
      { key: "", label: "Everything" },
      ...s.entities.value.map((K) => ({ key: K.key, label: d(K) }))
    ]), k = p(() => {
      const K = s.within.value.trim();
      return K ? Oa({ ...s.query.value, expr: K, facets: {} }, null) : [];
    }), g = p(
      () => (n.views ?? [...Bs]).map((K) => ({ key: K, label: $l[K] }))
    ), y = p(() => Rn(s.query.value.view, n.views)), b = p(() => g.value.length > 1), $ = p(() => s.query.value.entity !== null);
    function w(K) {
      s.setView(K);
    }
    const C = p(() => {
      const K = s.entity.value, Y = K?.keepsScope ? void 0 : K?.scope?.toLowerCase();
      return s.terms.value.filter((X) => X.facetKey !== Sn).map((X, De, Bt) => {
        const D = Bt[De - 1];
        return {
          term: X,
          or: D?.group !== void 0 && X.group !== void 0 && X.group !== D.group,
          idle: !!Y && X.field?.toLowerCase() === Y
        };
      });
    }), R = Do({
      source: s.source,
      schema: s.schema,
      query: s.query,
      // The scope's parts as well as the query's: it names a record more often
      // than a typed term does, being what a record's own page is built on.
      terms: p(() => [...k.value, ...s.terms.value])
    });
    function x(K) {
      return ir(r.value, K)?.scopeLabel ?? K;
    }
    function S(K) {
      return K.replace(/\s*\([^()]*\)\s*$/, "");
    }
    function O(K) {
      const Y = R.nameOf(K);
      return Y ? `${K.negated ? "-" : ""}${x(K.field)}: ${S(Y)}` : K.label;
    }
    function E(K) {
      s.setEntity(K || null);
    }
    const z = H(null);
    function T() {
      s.abandonDraft(), z.value?.blur();
    }
    function V(K) {
      if (s.draft.value) return;
      const Y = C.value.at(-1);
      Y && (K.preventDefault(), s.removeTerm(Y.term));
    }
    function W(K) {
      K.target?.closest("button, select, label, input") || a("toggle");
    }
    const U = H(null), ve = H("");
    function oe() {
      const K = U.value;
      if (!K) {
        ve.value = "";
        return;
      }
      const Y = K.scrollLeft > 1, X = K.scrollWidth - K.clientWidth - K.scrollLeft > 1;
      ve.value = Y && X ? "both" : Y ? "start" : X ? "end" : "";
    }
    let B = null;
    we(
      U,
      (K) => {
        B?.disconnect(), B = null, oe(), !(!K || typeof ResizeObserver > "u") && (B = new ResizeObserver(oe), B.observe(K));
      },
      { flush: "post" }
    ), we(C, oe, { flush: "post" }), We(() => B?.disconnect());
    const P = p(() => s.liveQuery.value.page), j = p(
      () => (s.pageCount.value > 1 || !!n.pagesNote) && !Ma(s.query.value, n.views)
    ), ae = p(
      () => `${s.counting.value ? "~" : ""}${Mt(s.pageCount.value)}`
    ), he = p(() => {
      let K = `Page ${Mt(P.value)} of ${ae.value}`;
      const Y = s.rows.value.length;
      if (Y) {
        const X = s.offset.value + 1, De = `${s.counting.value ? "~" : ""}${Mt(s.total.value)}`;
        K += ` — rows ${Mt(X)} to ${Mt(X + Y - 1)} of ${De}`;
      }
      return n.pagesNote ? `${K}
${n.pagesNote}` : K;
    }), Me = H(null), Ue = p(() => Me.value ?? String(P.value)), ft = p(
      () => `calc(${Math.max(2, String(s.pageCount.value).length)}ch + 10px)`
    );
    function je(K) {
      K.target.select();
    }
    function qe(K) {
      const Y = K.target, X = Y.value.replace(/[^0-9]/g, "");
      Y.value !== X && (Y.value = X), Me.value = X;
    }
    function tt(K) {
      const Y = K.target, X = Number(Me.value);
      Me.value = null;
      const De = Number.isFinite(X) && X >= 1 ? Math.min(Math.trunc(X), Math.max(1, s.pageCount.value)) : P.value;
      Y.value = String(De), De !== P.value && s.setPage(De);
    }
    function Oe(K) {
      const Y = K.target;
      Me.value = null, Y.value = String(P.value), Y.blur();
    }
    return (K, Y) => (f(), m("div", {
      class: "dc-header",
      "data-dc-expanded": e.expanded ? "true" : "false"
    }, [
      M("div", {
        class: "dc-header__trigger",
        onClick: W
      }, [
        M("span", qo, F(r.value.label), 1),
        k.value.length ? (f(), m("span", Vo, [
          Y[5] || (Y[5] = M("span", { class: "dc-header__sr" }, "Within", -1)),
          (f(!0), m(ne, null, ge(k.value, (X) => (f(), m("span", {
            key: `scope:${X.id}`,
            class: "dc-within dc-mono dc-truncate",
            title: O(X)
          }, F(O(X)), 9, Ko))), 128))
        ])) : I("", !0),
        M("div", {
          ref_key: "termBar",
          ref: U,
          class: "dc-header__query dc-header__terms",
          "data-dc-more": ve.value,
          title: A(s).summary.value,
          onScroll: oe
        }, [
          $.value ? (f(), Z($s, {
            key: 0,
            class: "dc-header__pick dc-header__scope-select",
            label: "Type",
            "model-value": A(s).query.value.entity ?? "",
            options: h.value,
            onOpen: A(l).refresh,
            onClose: A(l).cancel,
            "onUpdate:modelValue": E
          }, null, 8, ["model-value", "options", "onOpen", "onClose"])) : I("", !0),
          b.value ? (f(), Z($s, {
            key: 1,
            class: "dc-header__pick dc-header__view-select",
            label: "View",
            "model-value": y.value,
            options: g.value,
            "onUpdate:modelValue": w
          }, null, 8, ["model-value", "options"])) : I("", !0),
          (f(!0), m(ne, null, ge(C.value, (X) => (f(), m(ne, {
            key: X.term.id
          }, [
            X.or ? (f(), m("span", Wo, "or")) : I("", !0),
            M("button", {
              type: "button",
              class: ut(["dc-term dc-mono", { "dc-term--idle": X.idle }]),
              title: X.idle ? `Not applied to ${A(s).entity.value?.label} — remove ${O(X.term)}` : `Remove ${O(X.term)}`,
              "aria-label": `Remove ${O(X.term)}`,
              onClick: (De) => A(s).removeTerm(X.term)
            }, F(O(X.term)), 11, Uo)
          ], 64))), 128)),
          dt(M("input", {
            ref_key: "searchBox",
            ref: z,
            "onUpdate:modelValue": Y[0] || (Y[0] = (X) => A(s).draft.value = X),
            class: "dc-header__search dc-mono",
            type: "text",
            autocomplete: "off",
            spellcheck: "false",
            placeholder: "Search…",
            "aria-label": "Search",
            onKeydown: [
              Y[1] || (Y[1] = et(Ne(
                //@ts-ignore
                (...X) => A(s).commitDraft && A(s).commitDraft(...X),
                ["prevent"]
              ), ["enter"])),
              et(Ne(T, ["prevent"]), ["esc"]),
              et(V, ["backspace"])
            ]
          }, null, 40, jo), [
            [bn, A(s).draft.value]
          ])
        ], 40, Ho),
        M("button", {
          type: "button",
          class: "dc-header__toggle",
          "aria-expanded": e.expanded,
          "aria-controls": e.panelId,
          onClick: Y[2] || (Y[2] = (X) => a("toggle"))
        }, [
          M("span", Xo, F(e.expanded ? "▲" : "▼"), 1),
          M("span", Yo, F(e.expanded ? "Hide query panel" : "Edit query"), 1)
        ], 8, Go)
      ]),
      j.value ? (f(), m("nav", Qo, [
        M("button", {
          type: "button",
          class: "dc-header__step",
          "aria-label": "Previous page",
          disabled: P.value <= 1,
          onClick: Y[3] || (Y[3] = (X) => A(s).setPage(P.value - 1))
        }, [...Y[6] || (Y[6] = [
          M("span", { "aria-hidden": "true" }, "‹", -1)
        ])], 8, Zo),
        M("span", {
          class: "dc-header__page dc-mono",
          title: he.value
        }, [
          M("input", {
            class: "dc-header__page-box dc-mono",
            type: "text",
            inputmode: "numeric",
            autocomplete: "off",
            "aria-label": "Page",
            style: Ae({ width: ft.value }),
            value: Ue.value,
            onFocus: je,
            onInput: qe,
            onKeydown: [
              et(Ne(tt, ["prevent"]), ["enter"]),
              et(Ne(Oe, ["prevent"]), ["esc"])
            ],
            onBlur: tt
          }, null, 44, ei),
          M("span", ti, "/ " + F(ae.value), 1)
        ], 8, Jo),
        M("span", ni, F(he.value), 1),
        M("button", {
          type: "button",
          class: "dc-header__step",
          "aria-label": "Next page",
          disabled: P.value >= A(s).pageCount.value,
          onClick: Y[4] || (Y[4] = (X) => A(s).setPage(P.value + 1))
        }, [...Y[7] || (Y[7] = [
          M("span", { "aria-hidden": "true" }, "›", -1)
        ])], 8, ai)
      ])) : I("", !0),
      K.$slots.actions ? (f(), m("div", si, [
        $e(K.$slots, "actions", {}, void 0, !0)
      ])) : I("", !0)
    ], 8, Bo));
  }
}), vr = /* @__PURE__ */ de(li, [["__scopeId", "data-v-d4f7546d"]]), oi = { class: "dc-facet" }, ii = ["id"], ci = { class: "dc-facet__body" }, ui = ["aria-labelledby"], di = ["aria-pressed", "data-dc-active", "onClick"], fi = ["aria-labelledby"], pi = ["aria-label", "placeholder", "onKeydown"], vi = ["aria-label", "placeholder", "onKeydown"], hi = ["aria-checked"], mi = { class: "dc-switch__text" }, gi = ["data-dc-active"], _i = /* @__PURE__ */ ie({
  __name: "FacetControl",
  props: {
    facet: {},
    value: {}
  },
  emits: ["update"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = p(
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
    return (h, k) => (f(), m("div", oi, [
      M("span", {
        id: `dc-facet-${e.facet.key}`,
        class: "dc-facet__label"
      }, F(e.facet.label), 9, ii),
      M("div", ci, [
        e.facet.kind === "chips" && e.value.kind === "chips" ? (f(), m("div", {
          key: 0,
          class: "dc-facet__chips",
          role: "group",
          "aria-labelledby": `dc-facet-${e.facet.key}`
        }, [
          (f(!0), m(ne, null, ge(e.facet.options, (g) => (f(), m("button", {
            key: g,
            type: "button",
            class: "dc-chip",
            "aria-pressed": s.value.has(g),
            "data-dc-active": s.value.has(g) ? "true" : "false",
            onClick: (y) => r(g)
          }, F(g), 9, di))), 128))
        ], 8, ui)) : e.facet.kind === "range" && e.value.kind === "range" ? (f(), m("div", {
          key: 1,
          class: "dc-facet__range",
          role: "group",
          "aria-labelledby": `dc-facet-${e.facet.key}`
        }, [
          dt(M("input", {
            "onUpdate:modelValue": k[0] || (k[0] = (g) => i.value = g),
            class: "dc-input dc-mono",
            type: "number",
            inputmode: "numeric",
            "aria-label": `${e.facet.label} minimum`,
            placeholder: String(e.facet.min),
            onChange: c,
            onBlur: c,
            onKeydown: et(Ne(c, ["prevent"]), ["enter"])
          }, null, 40, pi), [
            [bn, i.value]
          ]),
          k[2] || (k[2] = M("span", {
            class: "dc-facet__dash",
            "aria-hidden": "true"
          }, "–", -1)),
          dt(M("input", {
            "onUpdate:modelValue": k[1] || (k[1] = (g) => o.value = g),
            class: "dc-input dc-mono",
            type: "number",
            inputmode: "numeric",
            "aria-label": `${e.facet.label} maximum`,
            placeholder: String(e.facet.max),
            onChange: c,
            onBlur: c,
            onKeydown: et(Ne(c, ["prevent"]), ["enter"])
          }, null, 40, vi), [
            [bn, o.value]
          ])
        ], 8, fi)) : e.facet.kind === "toggle" && e.value.kind === "toggle" ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-switch",
          role: "switch",
          "aria-checked": e.value.on,
          onClick: d
        }, [
          M("span", mi, F(e.facet.text), 1),
          M("span", {
            class: "dc-switch__track",
            "data-dc-active": e.value.on ? "true" : "false",
            "aria-hidden": "true"
          }, [...k[3] || (k[3] = [
            M("span", { class: "dc-switch__knob" }, null, -1)
          ])], 8, gi)
        ], 8, hi)) : I("", !0)
      ])
    ]));
  }
}), hr = /* @__PURE__ */ de(_i, [["__scopeId", "data-v-36d1334b"]]), yi = ["id"], wi = { class: "dc-panel__section dc-panel__rows" }, ki = { class: "dc-panel__row" }, bi = ["for"], $i = ["title", "aria-label", "onClick"], xi = ["id", "placeholder", "onKeydown"], Mi = { class: "dc-panel__actions" }, Ci = ["disabled"], Si = {
  key: 0,
  class: "dc-panel__section"
}, Pi = /* @__PURE__ */ ie({
  __name: "QueryPanel",
  props: {
    panelId: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = t, a = Jt(), s = be(), r = p(() => Wl(s.query.value.expr)), i = p(() => r.value.parts.map(tn)), o = H(r.value.text), l = H(null);
    we(
      () => r.value.text,
      (b) => {
        o.value = b;
      }
    );
    const c = p(() => o.value !== r.value.text);
    function d() {
      if (c.value) {
        const b = Mn(o.value, s.entity.value);
        s.setExpression(ys(r.value.parts, b));
      }
      n("close");
    }
    function h(b) {
      const { parts: $, text: w } = r.value;
      s.setExpression(ys($.filter((C, R) => R !== b), w));
    }
    function k(b) {
      const { parts: $ } = r.value;
      o.value || !$.length || (b.preventDefault(), h($.length - 1));
    }
    function g() {
      o.value = "", s.clearFilters();
    }
    function y(b, $) {
      s.setFacet(b, $);
    }
    return Nt(() => l.value?.focus()), (b, $) => (f(), m("div", {
      id: e.panelId,
      class: "dc-panel",
      role: "dialog",
      "aria-label": "Query",
      onKeydown: $[2] || ($[2] = et(Ne((w) => n("close"), ["stop"]), ["esc"]))
    }, [
      M("section", wi, [
        M("div", ki, [
          M("label", {
            class: "dc-panel__field-label",
            for: `${e.panelId}-expr`
          }, "Expression", 8, bi),
          M("div", {
            class: "dc-field",
            onMousedown: $[1] || ($[1] = Ne((w) => l.value?.focus(), ["self", "prevent"]))
          }, [
            (f(!0), m(ne, null, ge(i.value, (w, C) => (f(), m("button", {
              key: `${C}:${w}`,
              type: "button",
              class: "dc-part dc-mono",
              title: `Remove ${w}`,
              "aria-label": `Remove ${w}`,
              onClick: (R) => h(C)
            }, F(w), 9, $i))), 128)),
            dt(M("input", {
              id: `${e.panelId}-expr`,
              ref_key: "expressionField",
              ref: l,
              "onUpdate:modelValue": $[0] || ($[0] = (w) => o.value = w),
              class: "dc-expression dc-mono",
              type: "text",
              autocomplete: "off",
              spellcheck: "false",
              placeholder: i.value.length ? "" : A(s).schema.value.placeholder,
              onKeydown: [
                et(Ne(d, ["prevent"]), ["enter"]),
                et(k, ["backspace"])
              ]
            }, null, 40, xi), [
              [bn, o.value]
            ])
          ], 32)
        ]),
        A(s).entity.value ? (f(!0), m(ne, { key: 0 }, ge(A(s).entity.value.facets, (w) => (f(), Z(hr, {
          key: w.key,
          facet: w,
          value: A(s).query.value.facets[w.key],
          onUpdate: (C) => y(w.key, C)
        }, null, 8, ["facet", "value", "onUpdate"]))), 128)) : I("", !0),
        M("div", Mi, [
          M("button", {
            type: "button",
            class: "dc-button dc-button--primary",
            onClick: d
          }, " Run query "),
          M("button", {
            type: "button",
            class: "dc-button",
            disabled: A(s).isPristine.value && !c.value,
            onClick: g
          }, " Reset ", 8, Ci)
        ])
      ]),
      a["panel-section"] ? (f(), m("section", Si, [
        $e(b.$slots, "panel-section", {}, void 0, !0)
      ])) : I("", !0)
    ], 40, yi));
  }
}), mr = /* @__PURE__ */ de(Pi, [["__scopeId", "data-v-640ae2f5"]]), Ei = ["checked", "indeterminate"], gr = /* @__PURE__ */ ie({
  __name: "PageTick",
  setup(e) {
    const t = be(), n = p(() => t.rows.value.filter((r) => t.isSelected(r)).length), a = p(
      () => t.rows.value.length > 0 && n.value === t.rows.value.length
    ), s = p(() => n.value > 0 && !a.value);
    return (r, i) => (f(), m("input", {
      class: "dc-tick",
      type: "checkbox",
      checked: a.value,
      indeterminate: s.value,
      "aria-label": "Select every row on this page",
      title: "Select every row on this page",
      onChange: i[0] || (i[0] = (o) => A(t).selectPage(!a.value))
    }, null, 40, Ei));
  }
}), Ai = {
  key: 0,
  class: "dc-actions"
}, Ti = {
  key: 0,
  class: "dc-actions__select"
}, Ri = {
  key: 0,
  class: "dc-actions__all"
}, zi = {
  class: "dc-actions__count",
  "aria-live": "polite"
}, Li = {
  key: 1,
  class: "dc-actions__count dc-actions__all",
  "aria-live": "polite"
}, Ii = { class: "dc-actions__ops" }, Ni = ["disabled"], Fi = ["data-dc-operation", "disabled", "onClick"], Oi = ["disabled"], Di = /* @__PURE__ */ ie({
  __name: "RecordActions",
  props: {
    views: {}
  },
  setup(e) {
    const t = e, n = be(), a = p(() => n.entity.value), s = p(() => !Ma(n.query.value, t.views)), r = p(() => s.value && n.selectable.value), i = p(
      () => Rn(n.query.value.view, t.views) === "table"
    ), o = p(
      () => s.value && (r.value || !!(a.value?.create || a.value?.duplicate || a.value?.delete || a.value?.operations?.length))
    ), l = p(() => n.selection.value.ids.length), c = p(() => l.value ? `${l.value} selected` : i.value ? "None selected" : "Select all");
    function d(h) {
      return l.value ? `${h} ${l.value}` : h;
    }
    return (h, k) => o.value ? (f(), m("div", Ai, [
      r.value ? (f(), m("div", Ti, [
        i.value ? (f(), m("span", Li, F(c.value), 1)) : (f(), m("label", Ri, [
          ce(gr),
          M("span", zi, F(c.value), 1)
        ])),
        l.value ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-actions__clear",
          onClick: k[0] || (k[0] = (g) => A(n).clearSelection())
        }, " Clear ")) : I("", !0)
      ])) : I("", !0),
      M("div", Ii, [
        a.value?.create ? (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-actions__op dc-actions__new",
          onClick: k[1] || (k[1] = (g) => A(n).create(a.value))
        }, [
          k[4] || (k[4] = M("span", {
            class: "dc-actions__plus",
            "aria-hidden": "true"
          }, "+", -1)),
          Fe(" " + F(a.value.create), 1)
        ])) : I("", !0),
        a.value?.duplicate ? (f(), m("button", {
          key: 1,
          type: "button",
          class: "dc-actions__op",
          disabled: !l.value,
          onClick: k[2] || (k[2] = (g) => A(n).duplicate())
        }, F(d(a.value.duplicate)), 9, Ni)) : I("", !0),
        (f(!0), m(ne, null, ge(a.value?.operations ?? [], (g) => (f(), m("button", {
          key: g.key,
          type: "button",
          class: "dc-actions__op",
          "data-dc-operation": g.key,
          disabled: !l.value,
          onClick: (y) => A(n).operate(g.key)
        }, F(d(g.label)), 9, Fi))), 128)),
        a.value?.delete ? (f(), m("button", {
          key: 2,
          type: "button",
          class: "dc-actions__op dc-actions__danger",
          disabled: !l.value,
          onClick: k[3] || (k[3] = (g) => A(n).delete())
        }, F(d(a.value.delete)), 9, Oi)) : I("", !0)
      ])
    ])) : I("", !0);
  }
}), _r = /* @__PURE__ */ de(Di, [["__scopeId", "data-v-8548a5bf"]]), Bi = ["href"], qi = /* @__PURE__ */ ie({
  __name: "PressLink",
  props: {
    href: {}
  },
  emits: ["press"],
  setup(e, { emit: t }) {
    const n = e, a = t;
    function s(r) {
      if (n.href && lr(r)) {
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
    ], 8, Bi)) : (f(), m("button", {
      key: 1,
      type: "button",
      class: "dc-press",
      onClick: s
    }, [
      $e(r.$slots, "default", {}, void 0, !0)
    ]));
  }
}), Ye = /* @__PURE__ */ de(qi, [["__scopeId", "data-v-a9383f64"]]);
function Vi(e, t) {
  if (!e) return null;
  const n = He(e, t);
  return typeof n == "string" && n.trim() ? n : null;
}
function Ki(e, t) {
  const n = Ge(t, "state"), a = Ge(t, "tint");
  return {
    identity: gn(Ge(t, "identity"), e),
    reference: gn(Ge(t, "reference"), e),
    metrics: Gs(t, "metric").map((s) => ({
      column: s,
      label: s.label ?? "",
      text: en(s, e)
    })),
    state: n ? He(n, e) ?? null : null,
    updated: gn(Ge(t, "updated"), e),
    image: Vi(Ge(t, "image"), e),
    tint: a ? He(a, e) ?? null : null
  };
}
function yr(e, t, n, a, s = !1) {
  const r = n?.columns ?? [];
  return {
    row: e,
    key: Tl(e, t),
    entityLabel: e.entityLabel,
    entity: n,
    columns: r,
    ordinal: Pl(t),
    parts: Ki(e, r),
    pinned: a,
    selected: s
  };
}
function bt() {
  const e = be(), t = p(
    () => new Map(e.entities.value.map((n) => [n.key, n]))
  );
  return p(
    () => e.rows.value.map(
      (n, a) => yr(
        n,
        e.offset.value + a,
        t.value.get(n.entityKey) ?? null,
        e.isPinned(n),
        e.isSelected(n)
      )
    )
  );
}
const Hi = ["data-dc-status"], Wi = /* @__PURE__ */ ie({
  __name: "StatusPill",
  props: {
    status: {}
  },
  setup(e) {
    return (t, n) => (f(), m("span", {
      class: "dc-pill",
      "data-dc-status": e.status
    }, F(e.status), 9, Hi));
  }
}), nn = /* @__PURE__ */ de(Wi, [["__scopeId", "data-v-23e59fbf"]]), Ui = { key: 1 }, ji = /* @__PURE__ */ ie({
  __name: "MetricDrill",
  props: {
    entry: {},
    column: {}
  },
  setup(e) {
    const t = e, n = be(), a = p(() => !t.entry.entity?.scope || !t.column.drill ? null : n.entities.value.find((c) => c.key === t.column.drill) ?? null), s = p(() => t.column.label ?? ""), r = p(() => en(t.column, t.entry.row)), i = p(() => a.value ? n.drillHref(t.entry.row, a.value) : null);
    function o(l, c) {
      c.stopPropagation(), a.value && n.drill(t.entry.row, a.value, l);
    }
    return (l, c) => a.value ? (f(), Z(Ye, {
      key: 0,
      class: "dc-drill",
      href: i.value,
      title: `${s.value} of ${e.entry.parts.identity} — show the ${a.value.label.toLowerCase()}`,
      onPress: o
    }, {
      default: xe(() => [
        $e(l.$slots, "default", {}, () => [
          Fe(F(r.value), 1)
        ], !0)
      ]),
      _: 3
    }, 8, ["href", "title"])) : (f(), m("span", Ui, [
      $e(l.$slots, "default", {}, () => [
        Fe(F(r.value), 1)
      ], !0)
    ]));
  }
}), an = /* @__PURE__ */ de(ji, [["__scopeId", "data-v-d3e7f4e0"]]), Gi = ["data-dc-active", "aria-pressed", "aria-label"], Xi = /* @__PURE__ */ ie({
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
    }, F(e.pinned ? "★" : "☆"), 9, Gi));
  }
}), Ba = /* @__PURE__ */ de(Xi, [["__scopeId", "data-v-ef63d763"]]), Yi = ["src"], Qi = /* @__PURE__ */ ie({
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
    }, null, 40, Yi)) : I("", !0);
  }
}), Nn = /* @__PURE__ */ de(Qi, [["__scopeId", "data-v-afaab300"]]), Zi = ["data-dc-standing", "title", "aria-label"], Ji = /* @__PURE__ */ ie({
  __name: "QueryMark",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = be(), a = p(() => zn(t.entry.entity, t.entry.row)), s = p(() => Aa(n.query.value.expr, a.value)), r = p(
      () => s.value === "in" ? `The query narrows to ${t.entry.parts.identity} — press to lift that` : `The query leaves out ${t.entry.parts.identity} — press to lift that`
    );
    function i(o) {
      o.stopPropagation(), n.setExpression(rr(n.query.value.expr, a.value));
    }
    return (o, l) => s.value ? (f(), m("button", {
      key: 0,
      type: "button",
      class: "dc-standing",
      "data-dc-standing": s.value,
      title: r.value,
      "aria-label": r.value,
      onClick: i
    }, F(s.value === "in" ? "+" : "−"), 9, Zi)) : I("", !0);
  }
}), qa = /* @__PURE__ */ de(Ji, [["__scopeId", "data-v-4b8d4166"]]), ec = ["aria-label"], tc = ["data-dc-standing", "data-dc-active", "aria-checked", "title", "aria-label", "onClick"], nc = /* @__PURE__ */ ie({
  __name: "StandingControl",
  props: {
    standing: {},
    mixed: { type: Boolean },
    name: {}
  },
  emits: ["set"],
  setup(e, { emit: t }) {
    const n = e, a = t, s = p(() => [
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
      (f(!0), m(ne, null, ge(s.value, (c) => (f(), m("button", {
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
      }, F(c.sign), 9, tc))), 128))
    ], 8, ec));
  }
}), da = /* @__PURE__ */ de(nc, [["__scopeId", "data-v-adaa8412"]]), wr = /* @__PURE__ */ ie({
  __name: "RowStanding",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = be(), a = p(() => zn(t.entry.entity, t.entry.row)), s = p(() => Aa(n.query.value.expr, a.value));
    function r(i) {
      n.setExpression(ca(n.query.value.expr, a.value, i));
    }
    return (i, o) => a.value !== null ? (f(), Z(da, {
      key: 0,
      class: "dc-row-standing",
      standing: s.value,
      name: e.entry.parts.identity,
      onSet: r
    }, null, 8, ["standing", "name"])) : I("", !0);
  }
}), ac = /* @__PURE__ */ ie({
  __name: "ScopeMark",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = be(), a = p(
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
    const l = p(() => a.value ? n.drillHref(t.entry.row, null) : null);
    function c(d, h) {
      h.stopPropagation(), n.drill(t.entry.row, null, d);
    }
    return (d, h) => a.value ? (f(), Z(Ye, {
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
        Fe(" → ", -1)
      ])]),
      _: 1
    }, 8, ["href", "data-dc-pending", "title", "aria-label"])) : I("", !0);
  }
}), sn = /* @__PURE__ */ de(ac, [["__scopeId", "data-v-05d2c233"]]), sc = ["checked", "aria-label"], $t = /* @__PURE__ */ ie({
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
    }, null, 8, sc));
  }
}), rc = { class: "dc-card__top dc-mono" }, lc = { class: "dc-card__lead" }, oc = {
  key: 2,
  class: "dc-card__entity"
}, ic = { class: "dc-card__top-right" }, cc = { class: "dc-card__names" }, uc = { class: "dc-card__primary" }, dc = {
  key: 0,
  class: "dc-card__secondary dc-mono"
}, fc = {
  key: 0,
  class: "dc-card__metrics dc-mono"
}, pc = {
  key: 0,
  class: "dc-card__date"
}, vc = /* @__PURE__ */ ie({
  __name: "CardsView",
  setup(e) {
    const t = be(), n = bt(), a = p(() => t.isEverything.value), s = (i) => i.entity?.card === "picture", r = p(() => n.value.length > 0 && n.value.every(s));
    return (i, o) => (f(), m("div", {
      class: ut(["dc-cards", { "dc-cards--pictures": r.value }])
    }, [
      (f(!0), m(ne, null, ge(A(n), (l) => (f(), m("div", {
        key: l.key,
        class: ut(["dc-card", { "dc-card--picture": s(l) }])
      }, [
        M("div", rc, [
          M("span", lc, [
            A(t).selectable.value ? (f(), Z($t, {
              key: 0,
              row: l.row,
              selected: l.selected,
              name: l.parts.identity
            }, null, 8, ["row", "selected", "name"])) : I("", !0),
            s(l) ? I("", !0) : (f(), m(ne, { key: 1 }, [
              Fe(F(l.ordinal), 1)
            ], 64)),
            a.value ? (f(), m("span", oc, F(l.entityLabel), 1)) : I("", !0)
          ]),
          M("span", ic, [
            l.parts.state && !s(l) ? (f(), Z(nn, {
              key: 0,
              status: l.parts.state
            }, null, 8, ["status"])) : I("", !0),
            s(l) ? (f(), Z(qa, {
              key: 1,
              entry: l
            }, null, 8, ["entry"])) : (f(), Z(wr, {
              key: 2,
              entry: l
            }, null, 8, ["entry"])),
            ce(sn, { entry: l }, null, 8, ["entry"]),
            A(t).pinnable.value ? (f(), Z(Ba, {
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
            l.parts.image ? (f(), Z(Nn, {
              key: 0,
              class: "dc-card__image",
              src: l.parts.image
            }, null, 8, ["src"])) : I("", !0),
            M("span", cc, [
              M("span", uc, F(l.parts.identity), 1),
              s(l) ? I("", !0) : (f(), m("span", dc, F(l.parts.reference), 1))
            ])
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        s(l) ? I("", !0) : (f(), m("div", fc, [
          (f(!0), m(ne, null, ge(l.parts.metrics.slice(0, 2), (c) => (f(), Z(an, {
            key: c.column.key ?? c.label,
            entry: l,
            column: c.column
          }, {
            default: xe(() => [
              Fe(F(c.label) + " " + F(c.text), 1)
            ]),
            _: 2
          }, 1032, ["entry", "column"]))), 128)),
          l.parts.updated ? (f(), m("span", pc, F(l.parts.updated), 1)) : I("", !0)
        ]))
      ], 2))), 128))
    ], 2));
  }
}), kr = /* @__PURE__ */ de(vc, [["__scopeId", "data-v-046f11c3"]]), hc = { class: "dc-grid" }, mc = { class: "dc-tile__scrim" }, gc = { class: "dc-tile__top dc-mono" }, _c = { class: "dc-tile__chip" }, yc = { class: "dc-tile__caption" }, wc = { class: "dc-tile__secondary dc-truncate" }, kc = { class: "dc-tile__primary" }, bc = /* @__PURE__ */ ie({
  __name: "GridView",
  setup(e) {
    const t = be(), n = bt();
    return (a, s) => (f(), m("div", hc, [
      (f(!0), m(ne, null, ge(A(n), (r) => (f(), m("div", {
        key: r.key,
        class: "dc-grid__cell"
      }, [
        ce(Ye, {
          class: "dc-tile",
          style: Ae({ "--dc-tile-tint": r.parts.tint ?? void 0 }),
          href: A(t).pressHref(r.row),
          onPress: (i) => A(t).activate(r.row, i)
        }, {
          default: xe(() => [
            r.parts.image ? (f(), Z(Nn, {
              key: 0,
              class: "dc-tile__image",
              src: r.parts.image
            }, null, 8, ["src"])) : I("", !0),
            M("span", mc, [
              M("span", gc, [
                M("span", _c, F(r.ordinal), 1)
              ]),
              M("span", yc, [
                M("span", wc, F(r.parts.reference), 1),
                M("span", kc, F(r.parts.identity), 1)
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
}), br = /* @__PURE__ */ de(bc, [["__scopeId", "data-v-12dd4d94"]]);
function xs(e, t, n, a) {
  return (n - a * (t - 1)) / e;
}
function Gn(e, t) {
  return e > 0 ? Math.min(t, e) : t;
}
function $c(e) {
  return e > 0 ? e : 1 / 0;
}
function xc(e, t, n) {
  const { width: a, height: s, gap: r = 0 } = n;
  if (!e.length) return [];
  if (!(a > 0) || !(s > 0)) return [{ items: [...e], height: s, filled: !1 }];
  const i = [];
  let o = [], l = 0, c = 0;
  for (const d of e) {
    const h = t(d), k = Math.max(h.ratio, Number.EPSILON), g = h.height && h.height > 0 ? Math.max(c, h.height) : c, y = Gn(g, s), b = xs(l + k, o.length + 1, a, r);
    if (b > y) {
      o.push(d), l += k, c = g;
      continue;
    }
    const $ = Gn(c, s), w = o.length ? xs(l, o.length, a, r) : 1 / 0;
    w <= $c(c) && w - $ < y - b ? (i.push({ items: o, height: w, filled: !0 }), o = [d], l = k, c = h.height && h.height > 0 ? h.height : 0) : (i.push({ items: [...o, d], height: b, filled: !0 }), o = [], l = 0, c = 0);
  }
  return o.length && i.push({ items: o, height: Gn(c, s), filled: !1 }), i;
}
const Mc = { class: "dc-images" }, Cc = {
  key: 1,
  class: "dc-images__blank",
  "aria-hidden": "true"
}, Sc = 240, fn = 8, Pc = 1, Ec = /* @__PURE__ */ ie({
  __name: "ImagesView",
  setup(e) {
    const t = be(), n = bt(), a = cs(/* @__PURE__ */ new Map()), s = cs(/* @__PURE__ */ new Set());
    function r(y, b) {
      const $ = b.target;
      $.naturalWidth > 0 && $.naturalHeight > 0 && a.set(y, { width: $.naturalWidth, height: $.naturalHeight });
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
      return b ? { ratio: b.width / b.height, height: b.height } : { ratio: Pc };
    }
    const c = H(null), d = H(0);
    let h = null;
    function k() {
      d.value = c.value?.clientWidth ?? 0;
    }
    Fs(() => {
      k(), !(!c.value || typeof ResizeObserver > "u") && (h = new ResizeObserver(k), h.observe(c.value));
    }), We(() => {
      h?.disconnect(), h = null;
    });
    const g = p(() => {
      const y = xc(n.value, l, {
        width: d.value,
        height: Sc,
        gap: fn
      }), b = [];
      let $ = 0;
      for (const w of y) {
        let C = 0;
        for (const R of w.items) {
          const x = l(R).ratio * w.height, S = o(R), O = S !== void 0 && S.height < w.height;
          b.push({
            entry: R,
            style: {
              top: `${$}px`,
              left: `${C}px`,
              width: `${x}px`,
              height: `${w.height}px`
            },
            picture: O ? { width: `${S.width}px`, height: `${S.height}px` } : { width: "100%", height: "100%" }
          }), C += x + fn;
        }
        $ += w.height + fn;
      }
      return { boxes: b, height: y.length ? $ - fn : 0 };
    });
    return (y, b) => (f(), m("div", Mc, [
      M("div", {
        ref_key: "wall",
        ref: c,
        class: "dc-images__wall",
        style: Ae({ height: `${g.value.height}px` })
      }, [
        (f(!0), m(ne, null, ge(g.value.boxes, ({ entry: $, style: w, picture: C }) => (f(), m("div", {
          key: $.key,
          class: "dc-images__cell",
          style: Ae(w)
        }, [
          ce(Ye, {
            class: "dc-images__open",
            title: $.parts.identity,
            "aria-label": $.parts.identity,
            href: A(t).pressHref($.row),
            onPress: (R) => A(t).activate($.row, R)
          }, {
            default: xe(() => [
              i($) ? (f(), Z(Nn, {
                key: 0,
                class: "dc-images__picture",
                style: Ae(C),
                src: i($),
                onLoad: (R) => r(i($), R),
                onError: (R) => s.add(i($))
              }, null, 8, ["style", "src", "onLoad", "onError"])) : (f(), m("span", Cc, F($.parts.identity), 1))
            ]),
            _: 2
          }, 1032, ["title", "aria-label", "href", "onPress"]),
          A(t).selectable.value ? (f(), Z($t, {
            key: 0,
            class: "dc-images__tick",
            row: $.row,
            selected: $.selected,
            name: $.parts.identity
          }, null, 8, ["row", "selected", "name"])) : I("", !0)
        ], 4))), 128))
      ], 4)
    ]));
  }
}), $r = /* @__PURE__ */ de(Ec, [["__scopeId", "data-v-d77205b8"]]), Ac = { class: "dc-links" }, Tc = { class: "dc-link__primary dc-truncate" }, Rc = { class: "dc-link__secondary dc-mono dc-truncate" }, zc = /* @__PURE__ */ ie({
  __name: "LinksView",
  setup(e) {
    const t = be(), n = bt();
    return (a, s) => (f(), m("div", Ac, [
      (f(!0), m(ne, null, ge(A(n), (r) => (f(), m("span", {
        key: r.key,
        class: "dc-links__item"
      }, [
        A(t).selectable.value ? (f(), Z($t, {
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
            M("span", Tc, F(r.parts.identity), 1),
            M("span", Rc, F(r.parts.reference), 1)
          ]),
          _: 2
        }, 1032, ["href", "onPress"])
      ]))), 128))
    ]));
  }
}), xr = /* @__PURE__ */ de(zc, [["__scopeId", "data-v-f47b75cf"]]), Lc = {
  class: "dc-list",
  role: "list"
}, Ic = { class: "dc-list__ordinal dc-mono" }, Nc = { class: "dc-list__identity" }, Fc = { class: "dc-list__primary dc-truncate" }, Oc = { class: "dc-list__secondary dc-mono dc-truncate" }, Dc = {
  key: 1,
  class: "dc-list__entity dc-mono"
}, Bc = { class: "dc-list__metrics dc-mono" }, qc = { class: "dc-list__trailing" }, Vc = /* @__PURE__ */ ie({
  __name: "ListView",
  setup(e) {
    const t = be(), n = bt(), a = p(() => t.isEverything.value);
    return (s, r) => (f(), m("div", Lc, [
      (f(!0), m(ne, null, ge(A(n), (i) => (f(), m("div", {
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
        ce(wr, {
          class: "dc-list__standing",
          entry: i
        }, null, 8, ["entry"]),
        ce(Ye, {
          class: "dc-list__open",
          href: A(t).pressHref(i.row),
          onPress: (o) => A(t).activate(i.row, o)
        }, {
          default: xe(() => [
            M("span", Ic, F(i.ordinal), 1),
            M("span", Nc, [
              M("span", Fc, F(i.parts.identity), 1),
              M("span", Oc, F(i.parts.reference), 1)
            ])
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        a.value ? (f(), m("span", Dc, F(i.entityLabel), 1)) : I("", !0),
        M("span", Bc, [
          (f(!0), m(ne, null, ge(i.parts.metrics.slice(0, 2), (o) => (f(), Z(an, {
            key: o.column.key ?? o.label,
            entry: i,
            column: o.column
          }, null, 8, ["entry", "column"]))), 128))
        ]),
        M("span", qc, [
          i.parts.state ? (f(), Z(nn, {
            key: 0,
            status: i.parts.state
          }, null, 8, ["status"])) : I("", !0),
          ce(sn, { entry: i }, null, 8, ["entry"]),
          A(t).pinnable.value ? (f(), Z(Ba, {
            key: 1,
            row: i.row,
            name: i.parts.identity,
            pinned: i.pinned
          }, null, 8, ["row", "name", "pinned"])) : I("", !0)
        ])
      ]))), 128))
    ]));
  }
}), fa = /* @__PURE__ */ de(Vc, [["__scopeId", "data-v-9b2e8a87"]]), Kc = { class: "dc-preview" }, Hc = { class: "dc-preview__pager dc-mono" }, Wc = ["disabled"], Uc = { "aria-live": "polite" }, jc = ["disabled"], Gc = {
  key: 0,
  class: "dc-preview__card"
}, Xc = ["src"], Yc = { class: "dc-preview__body" }, Qc = { class: "dc-preview__top" }, Zc = { class: "dc-preview__badges" }, Jc = { class: "dc-preview__entity dc-mono" }, eu = { class: "dc-preview__marks" }, tu = { class: "dc-preview__primary" }, nu = { class: "dc-preview__secondary dc-mono" }, au = { class: "dc-preview__fields" }, su = { class: "dc-preview__key" }, ru = { class: "dc-preview__value dc-mono" }, lu = /* @__PURE__ */ ie({
  __name: "PreviewView",
  setup(e) {
    const t = be(), n = bt(), a = H(0);
    we(n, (l) => {
      a.value > l.length - 1 && (a.value = Math.max(0, l.length - 1));
    });
    const s = p(() => n.value[a.value]), r = p(() => {
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
    }), i = p(() => {
      if (!n.value.length) return "0 / 0";
      const l = t.total.value > n.value.length ? ` of ${t.total.value}` : "";
      return `${a.value + 1} / ${n.value.length}${l}`;
    }), o = (l) => {
      const c = n.value.length;
      c && (a.value = Math.min(c - 1, Math.max(0, a.value + l)));
    };
    return (l, c) => (f(), m("div", Kc, [
      M("div", Hc, [
        M("button", {
          type: "button",
          class: "dc-preview__step",
          "aria-label": "Previous result",
          disabled: a.value === 0,
          onClick: c[0] || (c[0] = (d) => o(-1))
        }, " ‹ ", 8, Wc),
        M("span", Uc, F(i.value), 1),
        M("button", {
          type: "button",
          class: "dc-preview__step",
          "aria-label": "Next result",
          disabled: a.value >= A(n).length - 1,
          onClick: c[1] || (c[1] = (d) => o(1))
        }, " › ", 8, jc)
      ]),
      s.value ? (f(), m("div", Gc, [
        M("div", {
          class: "dc-preview__media",
          style: Ae({ background: s.value.parts.tint ?? void 0 }),
          "aria-hidden": "true"
        }, [
          s.value.parts.image ? (f(), m("img", {
            key: 0,
            class: "dc-preview__image",
            src: s.value.parts.image,
            alt: ""
          }, null, 8, Xc)) : (f(), m(ne, { key: 1 }, [
            Fe(" preview ")
          ], 64))
        ], 4),
        M("div", Yc, [
          M("div", Qc, [
            M("span", Zc, [
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
              M("span", Jc, F(s.value.entityLabel), 1)
            ]),
            M("span", eu, [
              ce(qa, { entry: s.value }, null, 8, ["entry"]),
              ce(sn, { entry: s.value }, null, 8, ["entry"]),
              A(t).pinnable.value ? (f(), Z(Ba, {
                key: 0,
                row: s.value.row,
                name: s.value.parts.identity,
                pinned: s.value.pinned
              }, null, 8, ["row", "name", "pinned"])) : I("", !0)
            ])
          ]),
          M("div", null, [
            M("div", tu, F(s.value.parts.identity), 1),
            M("div", nu, F(s.value.parts.reference), 1)
          ]),
          M("dl", au, [
            (f(!0), m(ne, null, ge(r.value, (d) => (f(), m("div", {
              key: d.key,
              class: "dc-preview__field"
            }, [
              M("dt", su, F(d.key), 1),
              M("dd", ru, [
                d.column && s.value ? (f(), Z(an, {
                  key: 0,
                  entry: s.value,
                  column: d.column
                }, null, 8, ["entry", "column"])) : (f(), m(ne, { key: 1 }, [
                  Fe(F(d.value), 1)
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
              Fe(" Open record → ", -1)
            ])]),
            _: 1
          }, 8, ["href"])
        ])
      ])) : I("", !0)
    ]));
  }
}), Mr = /* @__PURE__ */ de(lu, [["__scopeId", "data-v-1bc19613"]]);
function ou() {
  const e = be();
  return p(() => El(e.schema.value, e.entity.value));
}
const iu = {
  key: 5,
  class: "dc-cell__text"
}, cu = /* @__PURE__ */ ie({
  __name: "ColumnCell",
  props: {
    column: {},
    entry: {}
  },
  setup(e) {
    const t = e, n = be(), a = p(() => t.column.kind ?? "text"), s = p(() => He(t.column, t.entry.row)), r = p(
      () => a.value === "ordinal" ? t.entry.ordinal : en(t.column, t.entry.row)
    ), i = p(() => s.value), o = p(() => t.column.activate === !0 || !!t.column.click), l = p(() => la(t.column)), c = p(() => Xs(t.column, t.entry.row));
    function d(g) {
      o.value && (g.stopPropagation(), h(In(g)));
    }
    function h(g) {
      t.column.click?.(t.entry.row, g), t.column.activate && n.activate(t.entry.row, g);
    }
    const k = p(
      () => t.column.activate && !t.column.click ? n.pressHref(t.entry.row) : null
    );
    return (g, y) => a.value === "component" && e.column.component ? (f(), Z(ba(e.column.component), {
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
      style: Ae({ maxHeight: e.column.height }),
      onClick: d
    }, null, 8, ["src", "style"])) : e.column.drill ? (f(), Z(an, {
      key: 3,
      entry: e.entry,
      column: e.column
    }, null, 8, ["entry", "column"])) : o.value ? (f(), Z(Ye, {
      key: 4,
      class: ut(["dc-table__open", { "dc-truncate": l.value }]),
      href: k.value,
      title: c.value,
      onPress: y[0] || (y[0] = (b, $) => {
        $.stopPropagation(), h(b);
      })
    }, {
      default: xe(() => [
        Fe(F(r.value), 1)
      ]),
      _: 1
    }, 8, ["class", "href", "title"])) : (f(), m("span", iu, F(r.value), 1));
  }
}), Ms = /* @__PURE__ */ de(cu, [["__scopeId", "data-v-af24c370"]]), uu = {
  key: 0,
  class: "dc-table__none"
}, du = { class: "dc-table__detail" }, fu = ["data-dc-wrap"], pu = {
  key: 0,
  class: "dc-table__pick",
  scope: "col"
}, vu = {
  key: 1,
  class: "dc-table__standing",
  scope: "col"
}, hu = ["data-dc-align", "data-dc-hide", "aria-sort", "title"], mu = ["onClick"], gu = {
  key: 2,
  class: "dc-table__head"
}, _u = ["onClick"], yu = {
  key: 0,
  class: "dc-table__pick"
}, wu = {
  key: 1,
  class: "dc-table__standing"
}, ku = ["data-dc-align", "data-dc-hide", "title"], bu = {
  key: 0,
  class: "dc-table__name"
}, $u = /* @__PURE__ */ ie({
  __name: "TableView",
  setup(e) {
    const t = be(), n = bt(), a = ou();
    function s(T, V) {
      const W = t.pressHref(T);
      if (W && lr(V)) {
        const U = V.shiftKey ? `noopener,popup,width=${window.outerWidth},height=${window.outerHeight}` : "noopener";
        window.open(W, "_blank", U);
        return;
      }
      t.activate(T, In(V));
    }
    function r(T) {
      const V = Dl(T, t.entity.value), W = V ? `Shortcut: ${V}` : void 0;
      return [T.hint, W].filter(Boolean).join(`
`) || void 0;
    }
    const i = p(
      () => a.value.find((T) => T.scope)
    ), o = p(
      () => t.entity.value ? !!t.entity.value.scope : t.entities.value.some((T) => T.scope)
    ), l = (T) => zn(T.entity, T.row), c = (T) => Aa(t.query.value.expr, l(T));
    function d(T, V) {
      t.setExpression(ca(t.query.value.expr, l(T), V));
    }
    const h = p(() => {
      const T = n.value.filter((W) => l(W) !== null), V = T.filter((W) => W.selected);
      return V.length ? V : T;
    }), k = p(() => h.value.some((T) => T.selected)), g = p(() => {
      const T = h.value[0];
      return T ? c(T) : null;
    }), y = p(
      () => h.value.some((T) => c(T) !== g.value)
    ), b = p(
      () => k.value ? "the ticked rows" : "every row on this page"
    );
    function $(T) {
      t.setExpression(
        h.value.reduce(
          (V, W) => ca(V, l(W), T),
          t.query.value.expr
        )
      );
    }
    const w = p(
      () => a.value.some((T) => T.kind === "image" || T.height !== void 0)
    );
    function C(T) {
      T && (t.query.value.sort === T ? t.toggleDirection() : t.setSort(T));
    }
    const R = p(() => t.entity.value?.label ?? "The result set"), x = p(() => new Set(t.sorts.value.map((T) => T.key))), S = (T) => T.sort !== void 0 && x.value.has(T.sort), O = (T) => {
      if (S(T))
        return t.query.value.sort !== T.sort ? "none" : t.query.value.dir === "desc" ? "descending" : "ascending";
    };
    function E(T) {
      return [
        ps(T),
        T.muted ? "dc-table__muted" : "",
        T.mono ? "dc-mono" : "",
        la(T) ? "dc-truncate" : ""
      ].filter(Boolean).join(" ");
    }
    function z(T, V) {
      if (!(!la(T) || T.activate || T.click))
        return Xs(T, V.row);
    }
    return (T, V) => A(a).length ? (f(), m("table", {
      key: 1,
      class: "dc-table",
      "data-dc-wrap": w.value ? "" : void 0
    }, [
      M("thead", null, [
        M("tr", null, [
          A(t).selectable.value ? (f(), m("th", pu, [
            ce(gr)
          ])) : I("", !0),
          o.value ? (f(), m("th", vu, [
            h.value.length ? (f(), Z(da, {
              key: 0,
              standing: g.value,
              mixed: y.value,
              name: b.value,
              onSet: $
            }, null, 8, ["standing", "mixed", "name"])) : I("", !0)
          ])) : I("", !0),
          (f(!0), m(ne, null, ge(A(a), (W, U) => (f(), m("th", {
            key: A(ds)(W, U),
            scope: "col",
            class: ut(A(ps)(W)),
            style: Ae({ width: W.width }),
            "data-dc-align": A(fs)(W),
            "data-dc-hide": W.hideBelow,
            "aria-sort": O(W),
            title: r(W)
          }, [
            S(W) ? (f(), m("button", {
              key: 0,
              type: "button",
              class: "dc-table__sort",
              onClick: (ve) => C(W.sort)
            }, F(W.label), 9, mu)) : (f(), m(ne, { key: 1 }, [
              Fe(F(W.label), 1)
            ], 64)),
            W.header ? (f(), m("span", gu, [
              (f(), Z(ba(W.header), {
                column: W,
                entity: A(t).entity.value
              }, null, 8, ["column", "entity"]))
            ])) : I("", !0)
          ], 14, hu))), 128))
        ])
      ]),
      M("tbody", null, [
        (f(!0), m(ne, null, ge(A(n), (W) => (f(), m("tr", {
          key: W.key,
          class: "dc-table__row",
          onClick: (U) => s(W.row, U)
        }, [
          A(t).selectable.value ? (f(), m("td", yu, [
            ce($t, {
              row: W.row,
              selected: W.selected,
              name: W.parts.identity
            }, null, 8, ["row", "selected", "name"])
          ])) : I("", !0),
          o.value ? (f(), m("td", wu, [
            l(W) !== null ? (f(), Z(da, {
              key: 0,
              standing: c(W),
              name: W.parts.identity,
              onSet: (U) => d(W, U)
            }, null, 8, ["standing", "name", "onSet"])) : I("", !0)
          ])) : I("", !0),
          (f(!0), m(ne, null, ge(A(a), (U, ve) => (f(), m("td", {
            key: A(ds)(U, ve),
            class: ut(E(U)),
            "data-dc-align": A(fs)(U),
            "data-dc-hide": U.hideBelow,
            title: z(U, W)
          }, [
            U === i.value ? (f(), m("span", bu, [
              ce(Ms, {
                column: U,
                entry: W
              }, null, 8, ["column", "entry"]),
              ce(sn, { entry: W }, null, 8, ["entry"])
            ])) : (f(), Z(Ms, {
              key: 1,
              column: U,
              entry: W
            }, null, 8, ["column", "entry"]))
          ], 10, ku))), 128))
        ], 8, _u))), 128))
      ])
    ], 8, fu)) : (f(), m("p", uu, [
      V[2] || (V[2] = M("span", { class: "dc-table__headline" }, "No columns declared", -1)),
      M("span", du, [
        Fe(F(R.value) + " has no ", 1),
        V[0] || (V[0] = M("code", null, "columns", -1)),
        V[1] || (V[1] = Fe(" in the schema, so there is no table to draw. ", -1))
      ])
    ]));
  }
}), Cr = /* @__PURE__ */ de($u, [["__scopeId", "data-v-a4e80859"]]);
function xu(e) {
  const t = wt([]), n = H(!1), a = wt(null);
  let s = 0;
  const r = (l, c, d, h, k) => ({
    entity: l,
    rows: e.limit.value > 0 ? c.rows.map((g, y) => yr(g, y, l, e.isPinned(g.id))) : [],
    total: c.total,
    count: d ? l.count : String(c.total),
    pinned: Mu(h, c, k)
  }), i = () => {
    const l = ++s, c = e.query.value, d = e.schema.value, h = e.entities.value, k = e.limit.value, g = e.within?.value.trim() ?? "", y = xa(c) && !g, b = g ? Pa(g, c.expr) : c.expr, $ = h.map((w) => ({
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
    if ($.every(({ outcome: w }) => !(w instanceof Promise))) {
      t.value = $.map(
        ({ entity: w, outcome: C }) => r(w, C, y, d, b)
      ), a.value = null, n.value = !1;
      return;
    }
    n.value = !0, Promise.all($.map(({ outcome: w }) => Promise.resolve(w))).then((w) => {
      l === s && (t.value = w.map(
        (C, R) => r($[R].entity, C, y, d, b)
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
function Mu(e, t, n) {
  const a = t.rows[0];
  if (t.total !== 1 || t.rows.length !== 1 || !a)
    return !1;
  const s = n.trim();
  if (!s)
    return !1;
  const r = Wt(e, a);
  return !!r && Ea(s, r) === s;
}
const Cu = ["data-dc-pending", "data-dc-heads-only"], Su = {
  key: 0,
  class: "dc-types__state",
  role: "alert"
}, Pu = {
  key: 1,
  class: "dc-types__state",
  "aria-live": "polite"
}, Eu = {
  key: 2,
  class: "dc-types__state"
}, Au = ["data-dc-empty"], Tu = { class: "dc-type__name" }, Ru = { class: "dc-type__count dc-mono" }, zu = { class: "dc-type__sr" }, Lu = {
  key: 0,
  class: "dc-type__description"
}, Iu = {
  key: 0,
  class: "dc-type__empty"
}, Nu = { class: "dc-type__identity" }, Fu = { class: "dc-type__primary dc-truncate" }, Ou = { class: "dc-type__secondary dc-mono dc-truncate" }, Du = { class: "dc-type__trailing dc-mono" }, Bu = { class: "dc-type__metric-value" }, qu = { class: "dc-type__metric-label" }, Vu = {
  key: 0,
  class: "dc-type__date"
}, Ku = ["onClick"], Hu = /* @__PURE__ */ ie({
  __name: "TypeCardsView",
  setup(e) {
    const t = be(), { previews: n, pending: a, error: s } = xu({
      source: t.source,
      schema: t.schema,
      // The query as the results are read under it, so a word being typed in the
      // header narrows the cards as it narrows any list — see `liveQuery`.
      query: t.liveQuery,
      entities: t.entities,
      limit: t.previewsPerType,
      within: t.within,
      isPinned: (l) => t.isPinnedId(l)
    }), r = p(
      () => !t.isPristine.value || !!t.within.value || t.drafting.value
    ), i = p(() => t.previewsPerType.value <= 0), o = p(
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
      A(s) ? (f(), m("p", Su, " Could not load results: " + F(A(s) instanceof Error ? A(s).message : "the data source failed."), 1)) : !o.value.length && A(a) ? (f(), m("p", Pu, " Running query… ")) : o.value.length ? I("", !0) : (f(), m("p", Eu, F(r.value ? "Nothing matches this query" : "Nothing here yet"), 1)),
      (f(!0), m(ne, null, ge(o.value, (d) => (f(), m("section", {
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
            M("span", Tu, F(d.entity.label), 1),
            M("span", Ru, F(d.count), 1),
            c[0] || (c[0] = M("span", {
              class: "dc-type__go",
              "aria-hidden": "true"
            }, "→", -1)),
            M("span", zu, "Show only " + F(d.entity.label.toLowerCase()), 1),
            d.entity.description ? (f(), m("span", Lu, F(d.entity.description), 1)) : I("", !0)
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        d.total ? I("", !0) : (f(), m("p", Iu, F(r.value ? "No matches" : "Nothing here yet"), 1)),
        (f(!0), m(ne, null, ge(d.rows, (h) => (f(), m("div", {
          key: h.key,
          class: "dc-type__row"
        }, [
          ce(Ye, {
            class: "dc-type__open",
            href: A(t).pressHref(h.row),
            onPress: (k) => A(t).activate(h.row, k)
          }, {
            default: xe(() => [
              M("span", Nu, [
                M("span", Fu, F(h.parts.identity), 1),
                M("span", Ou, F(h.parts.reference), 1)
              ])
            ]),
            _: 2
          }, 1032, ["href", "onPress"]),
          M("span", Du, [
            (f(!0), m(ne, null, ge(h.parts.metrics.slice(0, 1), (k) => (f(), Z(an, {
              key: k.column.key ?? k.label,
              class: "dc-type__metric",
              entry: h,
              column: k.column
            }, {
              default: xe(() => [
                M("span", Bu, F(k.text), 1),
                M("span", qu, F(k.label), 1)
              ]),
              _: 2
            }, 1032, ["entry", "column"]))), 128)),
            h.parts.updated ? (f(), m("span", Vu, F(h.parts.updated), 1)) : I("", !0),
            ce(qa, { entry: h }, null, 8, ["entry"]),
            ce(sn, { entry: h }, null, 8, ["entry"])
          ])
        ]))), 128)),
        d.entity.create && !i.value ? (f(), m("button", {
          key: 1,
          type: "button",
          class: "dc-type__new",
          onClick: (h) => A(t).create(d.entity)
        }, [
          c[1] || (c[1] = M("span", {
            class: "dc-type__plus",
            "aria-hidden": "true"
          }, "+", -1)),
          Fe(" " + F(d.entity.create), 1)
        ], 8, Ku)) : I("", !0)
      ], 8, Au))), 128)),
      $e(l.$slots, "after", {}, void 0, !0)
    ], 8, Cu));
  }
}), Sr = /* @__PURE__ */ de(Hu, [["__scopeId", "data-v-4b62e4f9"]]), Wu = ["data-dc-pending"], Uu = {
  key: 1,
  class: "dc-results__state",
  role: "alert"
}, ju = { class: "dc-results__detail" }, Gu = {
  key: 2,
  class: "dc-results__state",
  "aria-live": "polite"
}, Xu = {
  key: 3,
  class: "dc-results__state"
}, Yu = { class: "dc-results__detail" }, Qu = /* @__PURE__ */ ie({
  __name: "ResultsArea",
  props: {
    views: {}
  },
  setup(e) {
    const t = e, n = be(), a = Jt(), s = {
      list: fa,
      cards: kr,
      grid: br,
      images: $r,
      table: Cr,
      links: xr,
      preview: Mr
    }, r = p(() => Ma(n.query.value, t.views)), i = p(() => Rn(n.query.value.view, t.views)), o = p(() => s[i.value] ?? fa), l = p(() => n.rows.value.length > 0), c = p(() => n.error.value !== null), d = H(null);
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
      r.value ? (f(), Z(Sr, { key: 0 }, hn({ _: 2 }, [
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
      ]), 1024)) : c.value ? (f(), m("p", Uu, [
        k[1] || (k[1] = M("span", { class: "dc-results__headline" }, "Could not load results", -1)),
        M("span", ju, F(A(n).error.value instanceof Error ? A(n).error.value.message : "The data source failed."), 1)
      ])) : !l.value && A(n).pending.value ? (f(), m("p", Gu, [...k[2] || (k[2] = [
        M("span", { class: "dc-results__detail" }, "Running query…", -1)
      ])])) : l.value ? (f(), Z(ba(o.value), { key: 4 })) : (f(), m("div", Xu, [
        k[3] || (k[3] = M("span", { class: "dc-results__headline" }, "Nothing matches this query", -1)),
        M("span", Yu, F(A(n).summary.value), 1),
        A(n).isPristine.value ? I("", !0) : (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-results__clear",
          onClick: k[0] || (k[0] = (g) => A(n).clearFilters())
        }, F(A(n).isEverything.value ? "Clear filters" : "Search everything instead"), 1))
      ]))
    ], 8, Wu));
  }
}), Pr = /* @__PURE__ */ de(Qu, [["__scopeId", "data-v-d06f9125"]]), Zu = ["data-dc-theme"], Ju = ["data-dc-width", "data-dc-align"], ed = { class: "dc-shell__panel" }, td = /* @__PURE__ */ ie({
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
    const a = e, s = n, r = Ht(e, "open"), i = Ht(e, "pinned"), o = Ht(e, "selected"), l = Jt(), c = It(Ds, null), d = a.route || c ? null : wl(), h = a.route ?? c ?? d;
    We(() => d?.dispose?.());
    const k = p(() => ro({ seed: a.schema.key })), g = p(() => a.source ?? k.value), y = go({
      schema: () => a.schema,
      adapter: h,
      defaults: () => a.defaults,
      navigationMode: () => a.navigationMode,
      facetNavigationMode: () => a.facetNavigationMode
    }), b = p(() => a.within?.trim() ?? ""), $ = wo({
      query: y.query,
      entity: y.entity,
      setExpression: y.setExpression
    }), w = _o({
      source: g,
      query: $.live,
      schema: p(() => a.schema),
      entity: y.entity,
      limit: p(() => a.limit),
      within: b
    });
    we(y.query, (P) => s("query-change", P)), we(
      [w.pageCount, w.pending, y.query, $.drafting],
      () => {
        if (w.pending.value || $.drafting.value) return;
        const P = w.pageCount.value;
        y.query.value.page > P && y.setPage(P, "replace");
      },
      // Immediately, since a pasted URL is past the end before anything changes;
      // and after the render, so the correction is a navigation the mounted shell
      // makes rather than one it makes on the way up. An async source is still
      // pending here and corrects itself when its count lands.
      { immediate: !0, flush: "post" }
    );
    const C = Tn() ?? "dc-query-panel", R = H(null);
    function x() {
      r.value && (r.value = !1, Nt(() => {
        R.value?.$el?.querySelector(".dc-header__toggle")?.focus();
      }));
    }
    const S = p(() => new Set(i.value));
    function O(P) {
      const j = new Set(S.value);
      j.has(P.id) ? j.delete(P.id) : j.add(P.id), i.value = [...j], s("toggle-pin", P);
    }
    const E = p(() => {
      if (a.selectable === !0) return !0;
      const P = y.entity.value;
      return !!(P?.duplicate || P?.delete || P?.operations?.length);
    }), z = p(() => new Set(o.value));
    function T(P) {
      const j = new Set(z.value);
      j.has(P.id) ? j.delete(P.id) : j.add(P.id), o.value = [...j];
    }
    function V(P) {
      const j = new Set(z.value);
      for (const ae of w.rows.value)
        P ? j.add(ae.id) : j.delete(ae.id);
      o.value = [...j];
    }
    function W() {
      o.value.length && (o.value = []);
    }
    const U = p(() => ({
      ids: [...o.value],
      rows: w.rows.value.filter((P) => z.value.has(P.id)),
      entity: y.entity.value
    }));
    we(() => y.query.value.entity, W);
    function ve(P, j, ae = {}) {
      const he = Wn(a.schema, y.query.value, P, ae);
      ae.exclude ? y.narrow(he, j?.key ?? y.query.value.entity) : $.release(() => y.narrow(he, j?.key ?? null, j ? void 0 : "cards")), s("drill", P, j, ae);
    }
    const oe = lo({
      ...y,
      draft: $.text,
      liveQuery: $.live,
      drafting: $.drafting,
      commitDraft: $.commit,
      abandonDraft: $.abandon,
      /*
       * A page of what is on screen: the draft's, while one is live, which are
       * held beside it rather than in the URL — see `liveQuery`.
       */
      setPage: (P, j) => {
        $.drafting.value ? $.setPage(P) : y.setPage(P, j);
      },
      schema: p(() => a.schema),
      entities: p(() => a.schema.entities),
      rows: w.rows,
      total: w.total,
      limit: p(() => a.limit),
      offset: w.offset,
      pageCount: w.pageCount,
      pending: w.pending,
      counting: w.counting,
      error: w.error,
      source: g,
      previewsPerType: p(() => a.previewsPerType),
      within: b,
      pinnable: p(() => a.pinnable === !0),
      isPinned: (P) => S.value.has(P.id),
      isPinnedId: (P) => S.value.has(P),
      togglePin: O,
      selectable: E,
      selection: U,
      isSelected: (P) => z.value.has(P.id),
      toggleSelect: T,
      selectPage: V,
      clearSelection: W,
      narrowsOnPress: p(() => a.rowPress === "narrow"),
      /*
       * The one place a press is read, so every view gets the same answer without
       * knowing which of the two it is: they all call this.
       */
      activate: (P, j = {}) => {
        if (a.rowPress === "narrow" && Wt(a.schema, P)) {
          ve(P, null, j);
          return;
        }
        s("activate", P);
      },
      pressHref: (P) => a.rowPress === "narrow" && Wt(a.schema, P) ? y.narrowHref(Wn(a.schema, y.query.value, P), null, "cards") : null,
      drillHref: (P, j) => Wt(a.schema, P) ? y.narrowHref(
        Wn(a.schema, y.query.value, P),
        j?.key ?? null,
        j ? void 0 : "cards"
      ) : null,
      create: (P) => s("create", P),
      duplicate: () => s("duplicate", U.value),
      delete: () => s("delete", U.value),
      operate: (P) => s("operate", P, U.value),
      drill: ve
    }), B = p(() => {
      if (!(!a.accent && !a.tokens))
        return { ...a.tokens, ...a.accent ? { "--dc-accent": a.accent } : {} };
    });
    return t({
      query: y.query,
      openPanel: () => {
        r.value = !0;
      },
      closePanel: x
    }), (P, j) => (f(), m("div", {
      class: "dc-shell",
      "data-dc-theme": e.theme,
      style: Ae(B.value)
    }, [
      M("div", {
        class: "dc-shell__head",
        "data-dc-width": e.matchWidth,
        "data-dc-align": e.matchWidth === "shrink" ? e.headAlign : void 0
      }, [
        ce(vr, {
          ref_key: "headerRef",
          ref: R,
          expanded: r.value,
          "panel-id": A(C),
          views: e.views,
          "pages-note": e.pagesNote,
          onToggle: j[0] || (j[0] = (ae) => r.value = !r.value)
        }, hn({ _: 2 }, [
          l.actions ? {
            name: "actions",
            fn: xe(() => [
              $e(P.$slots, "actions", {}, void 0, !0)
            ]),
            key: "0"
          } : void 0
        ]), 1032, ["expanded", "panel-id", "views", "pages-note"]),
        r.value ? (f(), m(ne, { key: 0 }, [
          M("div", {
            class: "dc-shell__scrim",
            onClick: x
          }),
          M("div", ed, [
            ce(mr, {
              "panel-id": A(C),
              onClose: x
            }, hn({ _: 2 }, [
              l["panel-section"] ? {
                name: "panel-section",
                fn: xe(() => [
                  $e(P.$slots, "panel-section", {}, void 0, !0)
                ]),
                key: "0"
              } : void 0
            ]), 1032, ["panel-id"])
          ])
        ], 64)) : I("", !0)
      ], 8, Ju),
      ce(_r, { views: e.views }, null, 8, ["views"]),
      $e(P.$slots, "results", {
        rows: A(oe).rows.value,
        total: A(oe).total.value,
        offset: A(oe).offset.value,
        pageCount: A(oe).pageCount.value,
        query: A(oe).liveQuery.value,
        pending: A(oe).pending.value
      }, () => [
        ce(Pr, { views: e.views }, hn({ _: 2 }, [
          l["cards-before"] ? {
            name: "cards-before",
            fn: xe(() => [
              $e(P.$slots, "cards-before", {}, void 0, !0)
            ]),
            key: "0"
          } : void 0,
          l["cards-after"] ? {
            name: "cards-after",
            fn: xe(() => [
              $e(P.$slots, "cards-after", {}, void 0, !0)
            ]),
            key: "1"
          } : void 0
        ]), 1032, ["views"])
      ], !0)
    ], 12, Zu));
  }
}), nd = /* @__PURE__ */ de(td, [["__scopeId", "data-v-441e22d4"]]), ad = ["data-dc-muted", "data-dc-collapsed"], sd = ["data-dc-collapsible"], rd = ["aria-expanded", "aria-controls"], ld = { class: "dc-shell-card__sr" }, od = { class: "dc-shell-card__title" }, id = {
  key: 0,
  class: "dc-shell-card__count dc-mono"
}, cd = {
  key: 1,
  class: "dc-shell-card__aside"
}, ud = ["data-dc-flush"], dd = /* @__PURE__ */ ie({
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
    const n = e, a = t, s = H(n.defaultCollapsed === !0), r = p(() => n.span === "all" ? { gridColumn: "1 / -1" } : void 0), i = Jt();
    function o(E) {
      return l(E?.() ?? []);
    }
    function l(E) {
      return E.some((z) => z.type === gl ? !1 : z.type === _l ? String(z.children ?? "").trim().length > 0 : z.type === ne ? l(z.children ?? []) : !0);
    }
    const c = p(() => !!n.title || d.value || o(i.head)), d = p(() => o(i.aside)), h = p(() => o(i.default)), k = p(() => o(i.foot)), g = p(() => n.collapsible === !0 && c.value), y = p(() => g.value && (n.collapsed ?? s.value));
    function b() {
      const E = !y.value;
      s.value = E, a("update:collapsed", E);
    }
    const $ = Tn() ?? "dc-shell-card", w = `${$}-body`, C = `${$}-foot`, R = p(
      () => [h.value ? w : "", k.value ? C : ""].filter(Boolean).join(" ") || void 0
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
    ].join(", "), S = H(null);
    function O(E) {
      if (!g.value) return;
      const z = E.target?.closest(x);
      z && S.value?.contains(z) || typeof window < "u" && window.getSelection()?.toString() || b();
    }
    return (E, z) => (f(), m("section", {
      class: "dc-shell-card",
      style: Ae(r.value),
      "data-dc-muted": e.muted ? "true" : "false",
      "data-dc-collapsed": y.value ? "true" : "false"
    }, [
      c.value ? (f(), m("header", {
        key: 0,
        ref_key: "head",
        ref: S,
        class: "dc-shell-card__head",
        "data-dc-collapsible": g.value ? "true" : "false",
        onClick: O
      }, [
        g.value ? (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-shell-card__toggle",
          "aria-expanded": y.value ? "false" : "true",
          "aria-controls": R.value,
          onClick: b
        }, [
          z[0] || (z[0] = M("svg", {
            class: "dc-shell-card__chevron",
            viewBox: "0 0 10 10",
            "aria-hidden": "true"
          }, [
            M("path", { d: "M2 3.5 5 6.5 8 3.5" })
          ], -1)),
          M("span", ld, F(e.title || "Card"), 1)
        ], 8, rd)) : I("", !0),
        $e(E.$slots, "head", {}, () => [
          M("h2", od, F(e.title), 1),
          e.count !== void 0 ? (f(), m("span", id, F(e.count), 1)) : I("", !0)
        ], !0),
        d.value ? (f(), m("span", cd, [
          $e(E.$slots, "aside", {}, void 0, !0)
        ])) : I("", !0)
      ], 8, sd)) : I("", !0),
      h.value ? dt((f(), m("div", {
        key: 1,
        id: w,
        class: "dc-shell-card__body",
        "data-dc-flush": e.flush ? "true" : "false"
      }, [
        $e(E.$slots, "default", {}, void 0, !0)
      ], 8, ud)), [
        [xn, !y.value]
      ]) : I("", !0),
      k.value ? dt((f(), m("footer", {
        key: 2,
        id: C,
        class: "dc-shell-card__foot"
      }, [
        $e(E.$slots, "foot", {}, void 0, !0)
      ], 512)), [
        [xn, !y.value]
      ]) : I("", !0)
    ], 12, ad));
  }
}), ip = /* @__PURE__ */ de(dd, [["__scopeId", "data-v-1caf8572"]]), fd = ["aria-label"], pd = ["aria-checked", "data-dc-active", "tabindex", "onClick", "onKeydown"], vd = /* @__PURE__ */ ie({
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
      (f(!0), m(ne, null, ge(e.options, (l, c) => (f(), m("button", {
        key: l.key,
        ref_for: !0,
        ref_key: "buttons",
        ref: s,
        type: "button",
        role: "radio",
        class: ut(["dc-segmented__item", { "dc-segmented__item--mono": e.mono }]),
        "aria-checked": l.key === e.modelValue,
        "data-dc-active": l.key === e.modelValue ? "true" : "false",
        tabindex: l.key === e.modelValue ? 0 : -1,
        onClick: (d) => a("update:modelValue", l.key),
        onKeydown: (d) => r(d, c)
      }, F(l.label), 43, pd))), 128))
    ], 8, fd));
  }
}), hd = /* @__PURE__ */ de(vd, [["__scopeId", "data-v-63fb5482"]]), md = ["data-dc-theme", "aria-label"], gd = ["aria-expanded", "aria-disabled", "disabled", "data-dc-menu", "tabindex", "onClick", "onMouseenter"], _d = /* @__PURE__ */ ie({
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
    const n = e, a = p(() => {
      if (!(!n.accent && !n.tokens))
        return { ...n.tokens, ...n.accent ? { "--dc-accent": n.accent } : {} };
    }), s = t, r = H(null), i = H([]), o = H(null), l = H(null), c = H(!1), d = p(
      () => n.menus.flatMap((x, S) => Ut(x) ? [S] : [])
    );
    function h(x, S) {
      const O = i.value[x]?.getBoundingClientRect(), E = n.menus[x];
      !O || !E || !Ut(E) || (l.value = { x: O.left, y: O.bottom + 2, mirrorX: O.right }, o.value = x, c.value = S);
    }
    function k(x) {
      const S = o.value;
      o.value = null, l.value = null, x && S !== null && i.value[S]?.focus();
    }
    function g(x) {
      o.value === x ? k(!0) : h(x, !1);
    }
    function y(x) {
      o.value === null || o.value === x || h(x, !1);
    }
    function b(x, S) {
      const O = d.value;
      if (O.length === 0) return null;
      if (x === null) return S === 1 ? O[0] ?? null : O[O.length - 1] ?? null;
      const E = O.indexOf(x);
      return E === -1 ? O[0] ?? null : O[(E + S + O.length) % O.length] ?? null;
    }
    function $(x) {
      const S = x.key;
      if (S === "Escape") {
        if (o.value === null) return;
        x.preventDefault(), k(!0);
        return;
      }
      if (S === "ArrowDown" && o.value === null) {
        const z = w();
        if (z === null) return;
        x.preventDefault(), h(z, !0);
        return;
      }
      if (S !== "ArrowLeft" && S !== "ArrowRight") return;
      const O = o.value ?? w(), E = b(O, S === "ArrowRight" ? 1 : -1);
      E !== null && (x.preventDefault(), o.value !== null ? h(E, !0) : i.value[E]?.focus());
    }
    function w() {
      const x = i.value.findIndex((S) => S === document.activeElement);
      return x === -1 ? d.value[0] ?? null : x;
    }
    function C(x) {
      const S = x.target;
      !S || r.value?.contains(S) || k(!1);
    }
    we(o, (x) => {
      x !== null ? window.addEventListener("pointerdown", C, !0) : window.removeEventListener("pointerdown", C, !0);
    }), We(() => window.removeEventListener("pointerdown", C, !0));
    function R(x) {
      k(!0), x.action?.(), s("choose", x);
    }
    return (x, S) => (f(), m("div", {
      ref_key: "bar",
      ref: r,
      class: "dc-shell dc-menubar",
      role: "menubar",
      "data-dc-theme": e.theme,
      "aria-label": e.label ?? "Main menu",
      style: Ae(a.value),
      onKeydown: $
    }, [
      (f(!0), m(ne, null, ge(e.menus, (O, E) => (f(), m("button", {
        key: O.id ?? O.label ?? E,
        ref_for: !0,
        ref: (z) => {
          z && (i.value[E] = z);
        },
        type: "button",
        class: "dc-menubar__item",
        role: "menuitem",
        "aria-haspopup": "menu",
        "aria-expanded": o.value === E,
        "aria-disabled": O.disabled ? "true" : void 0,
        disabled: O.disabled,
        "data-dc-menu": O.id ?? O.label,
        tabindex: E === (d.value[0] ?? 0) ? 0 : -1,
        onClick: (z) => g(E),
        onMouseenter: (z) => y(E)
      }, F(O.label), 41, gd))), 128)),
      o.value !== null && l.value ? (f(), Z(Da, {
        key: o.value,
        items: e.menus[o.value]?.items ?? [],
        at: l.value,
        label: e.menus[o.value]?.label,
        autofocus: c.value,
        onChoose: R,
        onDismiss: S[0] || (S[0] = (O) => k(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : I("", !0)
    ], 44, md));
  }
}), cp = /* @__PURE__ */ de(_d, [["__scopeId", "data-v-93dbd2e4"]]), yd = ["aria-label", "aria-expanded", "disabled"], wd = { "aria-hidden": "true" }, kd = /* @__PURE__ */ ie({
  __name: "MenuButton",
  props: {
    items: {},
    label: {},
    glyph: { default: "⋯" }
  },
  emits: ["choose"],
  setup(e, { emit: t }) {
    const n = t, a = H(null), s = H(null), r = H(null), i = H(!1), o = p(() => r.value !== null);
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
      M("button", {
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
        M("span", wd, F(e.glyph), 1)
      ], 40, yd),
      r.value ? (f(), Z(Da, {
        key: 0,
        ref_key: "menu",
        ref: s,
        items: e.items,
        at: r.value,
        label: e.label,
        autofocus: i.value,
        onChoose: g,
        onDismiss: b[0] || (b[0] = ($) => c(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : I("", !0)
    ], 64));
  }
}), Va = /* @__PURE__ */ de(kd, [["__scopeId", "data-v-48f5ada5"]]), Dt = (e) => e.kind === "split", J = (e) => e.kind === "group", le = (e) => e.kind === "float", gt = { x: 16, y: 16, w: 360, h: 260 }, Pn = 28, Er = 120, pa = 220, Ar = 38, Ct = 6;
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
function up(e, t, n) {
  return {
    kind: "group",
    panels: e,
    ...t ? { active: t } : {},
    ...n ? { title: n } : {}
  };
}
const ye = (e) => typeof e == "string", Ka = (e) => ye(e) ? Xe(e) : e, ln = (e) => ye(e) ? [e] : Qe(e), Cs = (e) => e.panels.filter(ye), bd = (e) => e.panels.filter((t) => !ye(t)), Ke = (e, t) => e.panels.includes(t);
function on(e, t, n) {
  let a = !1;
  const s = e.panels.map((r) => {
    if (ye(r) || !pe(r, t)) return r;
    const i = n(r);
    return i !== r && (a = !0), i;
  });
  return a ? { ...e, panels: s } : e;
}
function Fn(e, t) {
  return { node: e, rect: { ...gt, ...t } };
}
function Ha(e, t) {
  return t ? { kind: "float", frames: e, title: t } : { kind: "float", frames: e };
}
function Wa(e, t) {
  const n = { ...gt, ...t };
  return Ha(
    e.map(
      (a, s) => Fn(a, {
        ...n,
        x: n.x + s * Pn,
        y: n.y + s * Pn
      })
    )
  );
}
function Ua(e, t, n, a) {
  return {
    kind: "split",
    direction: e,
    children: t,
    ...n ? { sizes: n } : {},
    ...a ? { title: a } : {}
  };
}
const ja = (e, t, n) => Ua("row", e, t, n), dp = (e, t, n) => Ua("column", e, t, n);
function Ce(e) {
  return {
    ...e.title ? { title: e.title } : {},
    ...e.fixedView ? { fixedView: !0 } : {},
    ...e.headless ? { headless: !0 } : {}
  };
}
const kt = (e) => e.fixedView === !0 || e.headless === !0 || !!e.title, $d = (e) => ({ ...e, headless: !0 }), fp = (e) => ({ ...e, fixedView: !0 }), xd = (e) => e === "left" || e === "right" ? "row" : "column";
function Qe(e) {
  return J(e) ? e.panels.flatMap(ln) : le(e) ? e.frames.flatMap((t) => Qe(t.node)) : e.children.flatMap(Qe);
}
function pe(e, t) {
  return J(e) ? e.panels.some((n) => ye(n) ? n === t : pe(n, t)) : le(e) ? e.frames.some((n) => pe(n.node, t)) : e.children.some((n) => pe(n, t));
}
const Tr = (e) => Qe(e).length === 0, va = (e) => !J(e) && kt(e), ha = (e) => Tr(e) && !va(e);
function On(e) {
  return Dt(e) ? e.children.map((t, n) => ({ node: t, index: n })) : le(e) ? e.frames.map((t, n) => ({ node: t.node, index: n })) : e.panels.flatMap((t, n) => ye(t) ? [] : [{ node: t, index: n }]);
}
const Ga = (e) => On(e).map((t) => t.node);
function xt(e) {
  const t = e.active;
  if (t) {
    const n = e.panels.findIndex(
      (a) => ye(a) ? a === t : pe(a, t)
    );
    if (n >= 0) return n;
  }
  return 0;
}
function Rr(e) {
  const t = e.panels[xt(e)];
  return t !== void 0 && ye(t) ? t : "";
}
function Le(e) {
  if (ye(e)) return e;
  if (J(e)) {
    const n = e.panels[xt(e)];
    return n === void 0 ? "" : Le(n);
  }
  if (le(e)) {
    const n = e.frames[e.frames.length - 1];
    return n ? Le(n.node) : "";
  }
  const t = e.children[0];
  return t ? Le(t) : "";
}
function Tt(e, t) {
  if (J(e) && Ke(e, t)) return e;
  for (const n of Ga(e)) {
    const a = Tt(n, t);
    if (a) return a;
  }
  return null;
}
function Md(e) {
  const t = Ga(e).flatMap(Md);
  return J(e) ? [e, ...t] : t;
}
function Ee(e, t) {
  if (J(e)) {
    for (const n of bd(e)) {
      const a = Ee(n, t);
      if (a) return a;
    }
    return null;
  }
  if (le(e)) {
    for (const n of e.frames)
      if (pe(n.node, t))
        return Ee(n.node, t) ?? n;
    return null;
  }
  for (const n of e.children) {
    const a = Ee(n, t);
    if (a) return a;
  }
  return null;
}
function Xn(e, t, n = Er) {
  const a = (o, l) => l > 0 ? Math.max(Math.min(o, l), Math.min(n, l)) : Math.max(o, n), s = a(e.w, t.w), r = a(e.h, t.h), i = (o, l, c) => Math.min(Math.max(o, 0), Math.max(c - l, 0));
  return {
    x: Math.round(i(e.x, s, t.w)),
    y: Math.round(i(e.y, r, t.h)),
    w: Math.round(s),
    h: Math.round(r)
  };
}
function Ss(e, t, n, a, s = Er) {
  let { x: r, y: i, w: o, h: l } = e;
  return t.includes("e") && (o = e.w + n), t.includes("w") && (o = e.w - n, r = e.x + n), t.includes("s") && (l = e.h + a), t.includes("n") && (l = e.h - a, i = e.y + a), o < s && (t.includes("w") && (r = e.x + e.w - s), o = s), l < s && (t.includes("n") && (i = e.y + e.h - s), l = s), { x: r, y: i, w: o, h: l };
}
const zr = (e, t) => e.x === t.x && e.y === t.y && e.w === t.w && e.h === t.h;
function Rt(e, t, n) {
  if (J(e)) return on(e, t, (r) => Rt(r, t, n));
  if (le(e)) {
    let r = !1;
    const i = e.frames.map((o) => {
      if (!pe(o.node, t)) return o;
      if (Ee(o.node, t)) {
        const c = Rt(o.node, t, n);
        return c === o.node ? o : (r = !0, { ...o, node: c });
      }
      const l = n(o);
      return l === o ? o : (r = !0, l);
    });
    return r ? { ...e, frames: i } : e;
  }
  if (!pe(e, t)) return e;
  let a = !1;
  const s = e.children.map((r) => {
    const i = Rt(r, t, n);
    return i !== r && (a = !0), i;
  });
  return a ? { ...e, children: s } : e;
}
function Cd(e, t, n) {
  return Rt(e, t, (a) => zr(a.rect, n) ? a : { ...a, rect: n });
}
const ot = (e) => e.maximized === !0, Lr = (e) => (t) => {
  if (ot(t) === e) return t;
  if (e) {
    const { minimized: s, ...r } = t;
    return { ...r, maximized: !0 };
  }
  const { maximized: n, ...a } = t;
  return a;
};
function Sd(e, t, n = !0) {
  return Rt(e, t, Lr(n));
}
function pp(e, t) {
  const n = Ee(e, t);
  return n ? Sd(e, t, !ot(n)) : e;
}
const mt = (e) => e.minimized === !0, Ir = (e) => (t) => {
  if (mt(t) === e) return t;
  if (e) {
    const { maximized: s, ...r } = t;
    return { ...r, minimized: !0 };
  }
  const { minimized: n, ...a } = t;
  return a;
};
function Pd(e, t, n = !0) {
  return Rt(e, t, Ir(n));
}
function vp(e, t) {
  const n = Ee(e, t);
  return n ? Pd(e, t, !mt(n)) : e;
}
function ht(e, t) {
  const n = t[t.length - 1];
  if (n === void 0) return null;
  const a = ct(e, t.slice(0, -1));
  return !a || !le(a) ? null : a.frames[n] ?? null;
}
function ma(e, t) {
  if (le(e)) {
    for (const [n, a] of e.frames.entries()) {
      if (!pe(a.node, t)) continue;
      const s = ma(a.node, t);
      return s ? [n, ...s] : [n];
    }
    return null;
  }
  for (const { node: n, index: a } of On(e)) {
    if (!pe(n, t)) continue;
    const s = ma(n, t);
    return s ? [a, ...s] : null;
  }
  return null;
}
function Xa(e, t, n) {
  const a = t[t.length - 1];
  if (a === void 0) return e;
  const s = t.slice(0, -1), r = ct(e, s);
  if (!r || !le(r)) return e;
  const i = r.frames[a];
  if (!i) return e;
  const o = n(i);
  if (o === i) return e;
  const l = [...r.frames];
  return l[a] = o, yt(e, s, { ...r, frames: l });
}
function Ps(e, t, n) {
  return Xa(
    e,
    t,
    (a) => zr(a.rect, n) ? a : { ...a, rect: n }
  );
}
function Ed(e, t, n = !0) {
  return Xa(e, t, Lr(n));
}
function Ad(e, t, n = !0) {
  return Xa(e, t, Ir(n));
}
function jt(e, t) {
  const [n, ...a] = t;
  if (n === void 0) return e;
  if (le(e)) {
    const i = e.frames[n];
    if (!i) return e;
    const o = jt(i.node, a), l = o === i.node ? i : { ...i, node: o };
    if (n === e.frames.length - 1 && l === i) return e;
    const c = [...e.frames];
    return c.splice(n, 1), c.push(l), { ...e, frames: c };
  }
  const s = ct(e, [n]);
  if (!s) return e;
  const r = jt(s, a);
  return r === s ? e : yt(e, [n], r);
}
function Td(e, t) {
  const n = [...t];
  let a = e;
  return t.forEach((s, r) => {
    a && (le(a) && (n[r] = a.frames.length - 1), a = ct(a, [s]));
  }), n;
}
function _n(e, t, n, a) {
  if (J(e)) return on(e, n, (i) => _n(i, t, n, a));
  if (le(e)) {
    const i = e.frames.findIndex((l) => pe(l.node, n)), o = e.frames[i];
    if (!o) return e;
    if (Ee(o.node, n)) {
      const l = _n(o.node, t, n, a);
      if (l === o.node) return e;
      const c = [...e.frames];
      return c[i] = { ...o, node: l }, { ...e, frames: c };
    }
    return { ...e, frames: [...e.frames, Fn(Xe(t), a)] };
  }
  if (!pe(e, n)) return e;
  let s = !1;
  const r = e.children.map((i) => {
    const o = _n(i, t, n, a);
    return o !== i && (s = !0), o;
  });
  return s ? { ...e, children: r } : e;
}
function Es(e, t, n, a) {
  if (t === n || !pe(e, t) || !pe(e, n) || !Ee(e, n)) return e;
  const s = _t(e, t);
  if (!s) return e;
  const r = _n(s, t, n, a);
  return r === s ? e : Se(r);
}
function Rd(e, t, n) {
  return le(e) ? { ...e, frames: [...e.frames, Fn(Xe(t), n)] } : J(e) ? Fr(e, t) : {
    kind: "split",
    direction: e.direction,
    children: [...e.children, Xe(t)],
    sizes: [...rt(e), 1],
    ...Ce(e)
  };
}
function Nr(e, t, n, a) {
  const s = n[0];
  if (s === void 0) return Rd(e, t, a);
  const r = n.slice(1), i = (d, h) => h === s ? Nr(d, t, r, a) : _t(d, t);
  if (le(e)) {
    const d = e.frames.flatMap((h, k) => {
      const g = i(h.node, k);
      return g ? [g === h.node ? h : { ...h, node: g }] : [];
    });
    return { ...e, frames: d };
  }
  if (J(e)) {
    const d = xt(e), h = [];
    e.panels.forEach((y, b) => {
      if (ye(y)) {
        y !== t && h.push(y);
        return;
      }
      const $ = i(y, b);
      $ && h.push($);
    });
    const g = e.active && h.some((y) => ln(y).includes(e.active)) ? e.active : Le(h[d] ?? h[h.length - 1]);
    return {
      kind: "group",
      panels: h,
      ...g ? { active: g } : {},
      ...Ce(e)
    };
  }
  const o = rt(e), l = [], c = [];
  return e.children.forEach((d, h) => {
    const k = i(d, h);
    k && (l.push(k), c.push(o[h] ?? 0));
  }), { kind: "split", direction: e.direction, children: l, sizes: c, ...Ce(e) };
}
function As(e, t, n, a) {
  const s = ct(e, n);
  return !s || !Tr(s) || !pe(e, t) ? e : Se(Nr(e, t, n, a));
}
function Yn(e, t) {
  if (J(e)) return on(e, t, (s) => Yn(s, t));
  if (le(e)) {
    const s = e.frames.findIndex((c) => pe(c.node, t)), r = e.frames[s];
    if (!r) return e;
    const i = Yn(r.node, t), o = i === r.node ? r : { ...r, node: i };
    if (s === e.frames.length - 1 && o === r) return e;
    const l = [...e.frames];
    return l.splice(s, 1), l.push(o), { ...e, frames: l };
  }
  if (!pe(e, t)) return e;
  let n = !1;
  const a = e.children.map((s) => {
    const r = Yn(s, t);
    return r !== s && (n = !0), r;
  });
  return n ? { ...e, children: a } : e;
}
function Ya(e, t) {
  if (e <= 0) return [];
  const n = () => Array.from({ length: e }, () => 1 / e);
  if (!t || t.length !== e) return n();
  const a = t.map((r) => Number.isFinite(r) && r > 0 ? r : 0), s = a.reduce((r, i) => r + i, 0);
  return s <= 0 ? n() : a.map((r) => r / s);
}
const rt = (e) => Ya(e.children.length, e.sizes), Ze = (e) => {
  const t = J(e) ? e.panels.length : e.children.length;
  return e.places?.length === t ? e.places : void 0;
};
function Se(e) {
  if (J(e)) return zd(e);
  if (le(e)) {
    const o = e.frames.flatMap((l) => {
      const c = Se(l.node);
      return ha(c) ? [] : [c === l.node ? l : { ...l, node: c }];
    });
    return o.length === e.frames.length && o.every((l, c) => l === e.frames[c]) ? e : { ...e, frames: o };
  }
  if (e.children.length === 0) return e;
  const t = rt(e), n = Ze(e), a = [], s = [], r = [];
  e.children.forEach((o, l) => {
    const c = Se(o), d = t[l] ?? 0;
    if (ha(c)) return;
    if (!n && Dt(c) && c.direction === e.direction && !Ze(c) && !kt(c)) {
      const k = rt(c);
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
    sizes: Ya(a.length, s),
    ...Ce(e),
    ...r.length === a.length && r.length > 0 ? { places: r } : {}
  };
}
function zd(e) {
  if (e.panels.every(ye)) return e;
  const t = Le(e), n = Ze(e), a = [], s = [];
  e.panels.forEach((o, l) => {
    const c = n?.[l];
    if (ye(o)) {
      a.push(o), c && s.push(c);
      return;
    }
    const d = Se(o);
    if (!ha(d)) {
      if (J(d) && !kt(d) && !Ze(d)) {
        a.push(...d.panels);
        return;
      }
      a.push(d), c && s.push(c);
    }
  });
  const r = a[0];
  if (a.length === 1 && r !== void 0 && !ye(r) && !kt(e))
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
function _t(e, t) {
  if (le(e)) {
    const i = e.frames.flatMap((o) => {
      const l = _t(o.node, t);
      return l ? [l === o.node ? o : { ...o, node: l }] : [];
    });
    return i.length === 0 && !va(e) ? null : { ...e, frames: i };
  }
  if (J(e)) {
    if (!pe(e, t)) return e;
    const i = xt(e), o = [];
    for (const d of e.panels) {
      if (ye(d)) {
        d !== t && o.push(d);
        continue;
      }
      const h = _t(d, t);
      h && o.push(h);
    }
    if (o.length === 0) return null;
    const c = e.active && o.some((d) => ln(d).includes(e.active)) ? e.active : Le(o[i] ?? o[o.length - 1]);
    return c ? { kind: "group", panels: o, active: c, ...Ce(e) } : { kind: "group", panels: o, ...Ce(e) };
  }
  const n = rt(e), a = [], s = [];
  if (e.children.forEach((i, o) => {
    const l = _t(i, t);
    l && (a.push(l), s.push(n[o] ?? 0));
  }), a.length === 0)
    return va(e) ? { kind: "split", direction: e.direction, children: a, sizes: [], ...Ce(e) } : null;
  const r = a[0];
  return a.length === 1 && r && !kt(e) ? r : Se({
    kind: "split",
    direction: e.direction,
    children: a,
    sizes: s,
    ...Ce(e)
  });
}
function Fr(e, t, n) {
  const a = e.panels.filter((r) => r !== t), s = n === void 0 ? a.length : Math.max(0, Math.min(n, a.length));
  return a.splice(s, 0, t), { kind: "group", panels: a, active: t, ...Ce(e) };
}
function Kt(e, t, n, a, s) {
  const r = (g) => rn(
    g,
    (y) => pe(y, n) ? Kt(y, t, n, a, s) : y
  );
  if (a === "float") return e;
  const i = (g) => on(g, n, (y) => Kt(y, t, n, a, s));
  if (a === "center")
    return J(e) ? Ke(e, n) ? Fr(e, t, s) : i(e) : le(e) ? r(e) : {
      ...e,
      children: e.children.map(
        (g) => pe(g, n) ? Kt(g, t, n, a, s) : g
      )
    };
  const o = xd(a), l = a === "left" || a === "top", c = (g) => ({
    kind: "split",
    direction: o,
    children: l ? [Xe(t), g] : [g, Xe(t)],
    sizes: [0.5, 0.5]
  });
  if (J(e)) return Ke(e, n) ? c(e) : i(e);
  if (le(e)) return r(e);
  const d = rt(e), h = e.children.findIndex(
    (g) => J(g) && Ke(g, n)
  );
  if (h >= 0 && e.direction === o) {
    const g = (d[h] ?? 0) / 2, y = [...e.children], b = [...d];
    return y.splice(l ? h : h + 1, 0, Xe(t)), b.splice(h, 1, g, g), {
      kind: "split",
      direction: o,
      children: y,
      sizes: b,
      ...Ce(e)
    };
  }
  const k = e.children.map((g) => pe(g, n) ? J(g) && Ke(g, n) ? c(g) : Kt(g, t, n, a) : g);
  return {
    kind: "split",
    direction: e.direction,
    children: k,
    sizes: d,
    ...Ce(e)
  };
}
function zt(e, t) {
  if (J(e)) {
    if (Ke(e, t))
      return Rr(e) === t ? e : { ...e, active: t };
    const s = e.panels.findIndex((l) => !ye(l) && pe(l, t)), r = e.panels[s];
    if (r === void 0 || ye(r)) return e;
    const i = zt(r, t);
    if (i === r && e.active === t) return e;
    const o = [...e.panels];
    return o[s] = i, { ...e, panels: o, active: t };
  }
  if (!pe(e, t)) return e;
  if (le(e)) return rn(e, (s) => zt(s, t));
  let n = !1;
  const a = e.children.map((s) => {
    const r = zt(s, t);
    return r !== s && (n = !0), r;
  });
  return n ? { ...e, children: a } : e;
}
function Gt(e, t, n) {
  if (J(e)) {
    if (!Ke(e, t)) return on(e, t, (c) => Gt(c, t, n));
    const a = e.panels.indexOf(t), s = Math.max(0, Math.min(n, e.panels.length - 1));
    if (a === s) return e;
    const r = [...e.panels];
    r.splice(a, 1), r.splice(s, 0, t);
    const i = Ze(e), o = i ? [...i] : void 0;
    o && o.splice(s, 0, ...o.splice(a, 1));
    const l = Le(e);
    return {
      kind: "group",
      panels: r,
      ...l ? { active: l } : {},
      ...Ce(e),
      ...o ? { places: o } : {}
    };
  }
  return pe(e, t) ? le(e) ? rn(e, (a) => Gt(a, t, n)) : { ...e, children: e.children.map((a) => Gt(a, t, n)) } : e;
}
function yn(e, t, n) {
  if (t === n) return e;
  if (J(e)) {
    if (!pe(e, t) && !pe(e, n)) return e;
    const a = (r) => r === t ? n : r === n ? t : r, s = e.panels.map((r) => ye(r) ? a(r) : yn(r, t, n));
    return { ...e, panels: s, ...e.active ? { active: a(e.active) } : {} };
  }
  return le(e) ? rn(e, (a) => yn(a, t, n)) : { ...e, children: e.children.map((a) => yn(a, t, n)) };
}
function pn(e, t, n, a, s) {
  if (a === "float" || !pe(e, t) || !pe(e, n)) return e;
  const r = Tt(e, t);
  if (a === "center" && r && Ke(r, n)) {
    if (s === void 0) return e;
    const o = r.panels.indexOf(t), l = s > o ? s - 1 : s;
    return l === o ? e : zt(Gt(e, t, l), t);
  }
  if (t === n) return e;
  const i = _t(e, t);
  return i ? Se(Kt(i, t, n, a, s)) : e;
}
function Or(e, t, n) {
  if (J(e)) {
    const s = e.panels[t];
    if (s === void 0 || ye(s)) return e;
    const r = [...e.panels];
    return r[t] = n, { ...e, panels: r };
  }
  if (le(e)) {
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
  if (!J(e) && a.some(({ node: s }) => J(s) && Ke(s, t))) {
    const s = n(e);
    return s === e ? null : s;
  }
  for (const { node: s, index: r } of a) {
    if (!pe(s, t)) continue;
    const i = cn(s, t, n);
    return i ? Or(e, r, i) : null;
  }
  return null;
}
function hp(e, t, n) {
  const a = cn(
    e,
    t,
    (s) => Dt(s) && s.direction !== n ? { ...s, direction: n } : s
  );
  return a ? Se(a) : e;
}
function Dr(e) {
  return le(e) ? [e] : Ze(e) || kt(e) ? [e] : J(e) ? [...e.panels] : e.children.flatMap(Dr);
}
function Br(e, t) {
  if (J(e)) return e;
  const n = Ga(e).map(Dr), a = n.flat(), s = t && a.some((i) => ln(i).includes(t)) ? t : void 0, r = Ld(e, n);
  return Se({
    kind: "group",
    panels: a,
    ...s ? { active: s } : {},
    ...Ce(e),
    ...r ? { places: r } : {}
  });
}
function Ld(e, t) {
  const n = le(e) ? e.frames.map(({ node: a, ...s }) => s) : Ze(e);
  if (n)
    return t.every((a) => a.length === 1) ? n : void 0;
}
function Id(e, t) {
  const n = cn(e, t, (a) => Br(a, t));
  return n ? Se(n) : e;
}
function Qa(e, t, n) {
  if (J(e) && Ke(e, t)) {
    const a = n(e);
    return a === e ? null : a;
  }
  for (const { node: a, index: s } of On(e)) {
    if (!pe(a, t)) continue;
    const r = Qa(a, t, n);
    return r ? Or(e, s, r) : null;
  }
  return null;
}
function Ts(e, t, n) {
  const a = Qa(e, t, (s) => {
    if (s.panels.length < 2) return s;
    const r = Ze(s);
    return {
      ...Ua(n, s.panels.map(Ka)),
      ...Ce(s),
      ...r ? { places: r } : {}
    };
  });
  return a ? Se(a) : e;
}
function ga(e, t) {
  if (J(e)) return e;
  if (le(e)) {
    const s = e.frames.findIndex(
      (o) => J(o.node) && o.node.panels.includes(t)
    ), r = e.frames[s], i = r && J(r.node) ? r.node : null;
    if (r && i && i.panels.length > 1) {
      const o = Wa(i.panels.map(Ka), r.rect).frames;
      return {
        ...e,
        frames: [...e.frames.slice(0, s), ...o, ...e.frames.slice(s + 1)]
      };
    }
    return rn(e, (o) => ga(o, t));
  }
  if (!pe(e, t)) return e;
  let n = !1;
  const a = e.children.map((s) => {
    const r = ga(s, t);
    return r !== s && (n = !0), r;
  });
  return n ? { ...e, children: a } : e;
}
function Nd(e, t, n) {
  const a = Tt(e, t);
  if (!a || a.panels.length < 2) return e;
  if (Ee(e, t)?.node === a) {
    const i = ga(e, t);
    return i === e ? e : Se(i);
  }
  const r = Qa(e, t, (i) => ({
    ...Ha(qr(i.panels.map(Ka), Ze(i), n)),
    ...Ce(i)
  }));
  return r ? Se(r) : e;
}
function qr(e, t, n) {
  return t ? e.map((a, s) => ({ ...t[s], node: a })) : Wa(e, n).frames;
}
function Vr(e, t) {
  return { ...Ha(qr(e.children, Ze(e), t)), ...Ce(e) };
}
function mp(e, t, n) {
  const a = cn(
    e,
    t,
    (s) => le(s) ? s : Vr(s, n)
  );
  return a ? Se(a) : J(e) && Ke(e, t) ? Wa([e], n) : e;
}
function Fd(e, t) {
  const n = (s) => t === "column" ? s.rect.y : s.rect.x, a = (s) => t === "column" ? s.rect.x : s.rect.y;
  return [...e].sort((s, r) => n(s) - n(r) || a(s) - a(r));
}
function Kr(e, t) {
  const n = Fd(e.frames, t);
  return {
    kind: "split",
    direction: t,
    children: n.map((a) => a.node),
    ...Ce(e),
    places: n.map(({ node: a, ...s }) => s)
  };
}
function gp(e, t, n = "row") {
  const a = cn(
    e,
    t,
    (s) => le(s) ? Kr(s, n) : s
  );
  return a ? Se(a) : e;
}
function Hr(e) {
  if (le(e)) return null;
  const t = J(e) ? e.panels.length === 1 ? e.panels[0] : void 0 : e.children.length === 1 ? e.children[0] : void 0;
  return t === void 0 || ye(t) || J(t) && t.panels.length === 1 && ye(t.panels[0]) ? null : t;
}
const Od = (e) => {
  const { title: t, fixedView: n, headless: a, ...s } = e;
  return s;
};
function Dd(e, t) {
  const n = Hr(e);
  return n ? t === "inner" ? n : { ...Od(n), ...Ce(e) } : e;
}
function Ot(e) {
  return e.title ? e.title : J(e) ? "" : le(e) ? "Desktop" : e.direction === "row" ? "Row" : "Column";
}
function Xt(e, t) {
  if (J(e)) {
    const a = e.panels[xt(e)];
    return a === void 0 ? "" : ye(a) ? t(a) ?? a : Ot(a) || Xt(a, t);
  }
  if (e.title) return e.title;
  if (le(e)) {
    const a = e.frames[e.frames.length - 1];
    return a ? a.title ?? Xt(a.node, t) : "";
  }
  const n = e.children[0];
  return n ? Xt(n, t) : "";
}
function ct(e, t) {
  let n = e;
  for (const a of t) {
    if (!n) return null;
    if (Dt(n)) n = n.children[a];
    else if (le(n)) n = n.frames[a]?.node;
    else {
      const s = n.panels[a];
      n = s === void 0 || ye(s) ? void 0 : s;
    }
  }
  return n ?? null;
}
function yt(e, t, n) {
  if (t.length === 0) return n;
  const [a, ...s] = t;
  if (a === void 0) return e;
  if (le(e)) {
    const l = e.frames[a];
    if (!l) return e;
    const c = yt(l.node, s, n);
    if (c === l.node) return e;
    const d = [...e.frames];
    return d[a] = { ...l, node: c }, { ...e, frames: d };
  }
  if (J(e)) {
    const l = e.panels[a];
    if (l === void 0 || ye(l)) return e;
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
    return Dt(e) ? { ...e, sizes: Ya(e.children.length, n) } : e;
  const [a, ...s] = t;
  if (a === void 0) return e;
  if (le(e)) {
    const o = e.frames[a];
    if (!o) return e;
    const l = wn(o.node, s, n);
    if (l === o.node) return e;
    const c = [...e.frames];
    return c[a] = { ...o, node: l }, { ...e, frames: c };
  }
  if (J(e)) {
    const o = e.panels[a];
    if (o === void 0 || ye(o)) return e;
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
function Rs(e, t, n, a = 0.02) {
  const s = e[t], r = e[t + 1];
  if (s === void 0 || r === void 0) return e;
  const i = s + r;
  if (i < a * 2) return e;
  const o = [...e], l = Math.min(Math.max(s + n, a), i - a);
  return o[t] = l, o[t + 1] = i - l, o;
}
function En(e) {
  if (!J(e) || e.panels.length >= 2) return e;
  const t = e.panels[0];
  return t !== void 0 && !ye(t) ? e : { ...ja([Bd(e)]), ...Ce(e) };
}
const Bd = (e) => {
  if (!e.title) return e;
  const { title: t, ...n } = e;
  return n;
};
function zs(e) {
  return e.length === 0 ? null : ja(e.map(Xe));
}
function qd(e, t) {
  if (!e) return zs(t);
  const n = new Set(t), a = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
  for (const l of Qe(e))
    !n.has(l) || a.has(l) ? s.add(l) : a.add(l);
  let r = e;
  for (const l of s)
    r = r ? _t(r, l) : null;
  const i = new Set(r ? Qe(r) : []), o = t.filter((l) => !i.has(l));
  if (o.length === 0) return r ? En(Se(r)) : null;
  if (!r) return zs(o);
  if (le(r)) {
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
  return En(Se(ja([r, ...o.map(Xe)])));
}
const Za = Symbol("dc.windowContext");
function Vd(e) {
  return ka(Za, e), e;
}
function Dn() {
  const e = It(Za, null);
  if (!e)
    throw new Error(
      "[header-content-layout] No window context found. Render this component inside <WindowFrame>."
    );
  return e;
}
const Kd = 320, Hd = 240;
function Wd(e) {
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
function Ud(e, t) {
  if (typeof window > "u") return null;
  const n = Math.max(Kd, Math.round(t?.width ?? window.innerWidth)), a = Math.max(Hd, Math.round(t?.height ?? window.innerHeight)), s = ["popup", `width=${n}`, `height=${a}`];
  t?.left !== void 0 && s.push(`left=${t.left}`), t?.top !== void 0 && s.push(`top=${t.top}`);
  const r = window.open(e, "_blank", s.join(","));
  if (r)
    try {
      r.opener = null;
    } catch {
    }
  return r;
}
const jd = ["data-dc-glyph"], Gd = { class: "dc-glyph__line" }, Xd = ["d"], Yd = {
  key: 0,
  class: "dc-glyph__aqua"
}, Qd = ["d"], Zd = /* @__PURE__ */ ie({
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
      M("g", Gd, [
        (f(!0), m(ne, null, ge(t[e.kind], (r) => (f(), m("path", {
          key: r,
          d: r
        }, null, 8, Xd))), 128))
      ]),
      n[e.kind] ? (f(), m("g", Yd, [
        (f(!0), m(ne, null, ge(n[e.kind], (r) => (f(), m("path", {
          key: r,
          d: r
        }, null, 8, Qd))), 128))
      ])) : I("", !0)
    ], 8, jd));
  }
}), Lt = /* @__PURE__ */ de(Zd, [["__scopeId", "data-v-4d2872c0"]]), Jd = ["data-dc-order", "data-dc-path", "data-dc-maximized", "data-dc-minimized", "data-dc-dragging"], ef = ["data-dc-movable"], tf = { class: "dc-float__title dc-truncate" }, nf = {
  key: 1,
  class: "dc-float__controls dc-controls"
}, af = ["aria-label", "aria-pressed", "data-dc-minimize"], sf = ["aria-label", "aria-pressed", "data-dc-maximize"], rf = ["aria-label", "data-dc-close"], lf = { class: "dc-float__content" }, of = ["data-dc-handle", "onPointerdown"], cf = /* @__PURE__ */ ie({
  __name: "WindowFloat",
  props: {
    frame: {},
    path: {},
    order: {},
    place: {}
  },
  setup(e) {
    const t = e, n = Dn(), a = p(() => Le(t.frame.node)), s = p(() => n.panelFor(a.value)?.fixed === !0), r = p(() => ot(t.frame)), i = p(() => mt(t.frame)), o = p(() => r.value || i.value), l = p(() => n.resizable.value && !s.value && !o.value), c = p(() => n.movable.value && !s.value && !o.value), d = p(() => {
      const S = Qe(t.frame.node);
      return S.length === 1 ? S[0] ?? null : null;
    }), h = p(() => d.value !== null && n.closable(d.value)), k = p(() => t.frame.node.headless === !0), g = p(
      () => !k.value && (!J(t.frame.node) || i.value)
    ), y = p(
      () => t.frame.title || Ot(t.frame.node) || Xt(t.frame.node, (S) => n.panelFor(S)?.title)
    ), b = p(() => n.spaceMenu(t.path));
    function $(S) {
      S.target?.closest("button, a, input, select, textarea, label") || n.beginFrameDragAt(t.path, S, "move");
    }
    function w(S) {
      S.target?.closest("button, a, input, select, textarea, label") || (i.value ? n.toggleMinimizeAt(t.path) : n.toggleMaximizeAt(t.path));
    }
    const C = p(() => {
      const S = n.framing.value;
      return S !== null && pe(t.frame.node, S);
    }), R = p(() => ({
      // Neither maximizing nor rolling up overwrites the rect: it is where the
      // window goes back to, and both are a way of not being there for a while.
      ...r.value ? { inset: "0" } : i.value && t.place ? {
        left: `${t.place.x}px`,
        bottom: `${t.place.bottom}px`,
        width: `${pa}px`,
        height: `${Ar}px`
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
    return (S, O) => (f(), m("div", {
      class: "dc-float",
      style: Ae(R.value),
      "data-dc-order": e.order,
      "data-dc-path": e.path.join("/"),
      "data-dc-maximized": r.value ? "true" : "false",
      "data-dc-minimized": i.value ? "true" : "false",
      "data-dc-dragging": C.value ? "true" : "false",
      onPointerdown: O[3] || (O[3] = (E) => A(n).raiseAt(e.path))
    }, [
      g.value ? (f(), m("header", {
        key: 0,
        class: "dc-float__bar",
        "data-dc-movable": c.value ? "true" : "false",
        onPointerdown: $,
        onDblclick: w
      }, [
        M("span", tf, F(y.value), 1),
        b.value.length ? (f(), Z(Va, {
          key: 0,
          items: b.value,
          label: `${y.value} menu`
        }, null, 8, ["items", "label"])) : I("", !0),
        !s.value || i.value && h.value && d.value ? (f(), m("div", nf, [
          s.value ? I("", !0) : (f(), m("button", {
            key: 0,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `${i.value ? "Unroll" : "Minimize"} ${y.value}`,
            "aria-pressed": i.value,
            "data-dc-minimize": a.value,
            onClick: O[0] || (O[0] = (E) => A(n).toggleMinimizeAt(e.path))
          }, [
            ce(Lt, {
              kind: i.value ? "unroll" : "minimize"
            }, null, 8, ["kind"])
          ], 8, af)),
          s.value ? I("", !0) : (f(), m("button", {
            key: 1,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `${r.value ? "Restore" : "Maximize"} ${y.value}`,
            "aria-pressed": r.value,
            "data-dc-maximize": a.value,
            onClick: O[1] || (O[1] = (E) => A(n).toggleMaximizeAt(e.path))
          }, [
            ce(Lt, {
              kind: r.value ? "restore" : "maximize"
            }, null, 8, ["kind"])
          ], 8, sf)),
          i.value && h.value && d.value ? (f(), m("button", {
            key: 2,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `Close ${y.value}`,
            "data-dc-close": d.value,
            onClick: O[2] || (O[2] = (E) => A(n).close(d.value))
          }, [
            ce(Lt, { kind: "close" })
          ], 8, rf)) : I("", !0)
        ])) : I("", !0)
      ], 40, ef)) : I("", !0),
      M("div", lf, [
        $e(S.$slots, "default", {}, void 0, !0)
      ]),
      (f(!0), m(ne, null, ge(l.value ? x : [], (E) => (f(), m("span", {
        key: E,
        class: "dc-float__grip",
        "data-dc-handle": E,
        "aria-hidden": "true",
        onPointerdown: Ne((z) => A(n).beginFrameDragAt(e.path, z, E), ["stop"])
      }, null, 40, of))), 128))
    ], 44, Jd));
  }
}), uf = /* @__PURE__ */ de(cf, [["__scopeId", "data-v-f035684c"]]), Ja = Symbol("dc.paneContext");
function Wr(e) {
  return ka(Ja, e), e;
}
function _p() {
  return It(Ja, null);
}
function yp(e) {
  const t = It(Za, null), n = It(Ja, null);
  if (!t || !n) return () => {
  };
  const a = t.registerMenu(
    () => n.panel.value,
    () => Pt(e)
  );
  return An() && Zt(a), a;
}
const df = ["data-dc-panel"], ff = /* @__PURE__ */ ie({
  __name: "WindowPaneBody",
  props: {
    panel: {},
    active: { type: Boolean }
  },
  setup(e) {
    const t = e, n = Dn();
    Wr({ panel: p(() => t.panel) });
    const a = () => {
      const s = n.panelFor(t.panel);
      return s ? n.renderContent(s, n.viewFor(t.panel), t.active) ?? null : null;
    };
    return (s, r) => (f(), m("div", {
      class: "dc-pane__content",
      "data-dc-panel": t.panel
    }, [
      ce(a)
    ], 8, df));
  }
}), pf = /* @__PURE__ */ de(ff, [["__scopeId", "data-v-31c655fd"]]), vf = ["data-dc-panel", "data-dc-panels", "data-dc-tabbed", "data-dc-floating", "data-dc-maximized", "data-dc-headless", "data-dc-active", "data-dc-dragging", "aria-label"], hf = ["data-dc-movable"], mf = ["aria-label", "aria-pressed"], gf = ["data-dc-space-name"], _f = { class: "dc-truncate" }, yf = ["aria-label"], wf = {
  key: 0,
  class: "dc-pane__insert",
  "aria-hidden": "true"
}, kf = ["id", "data-dc-panel", "data-dc-space", "aria-selected", "aria-controls", "tabindex", "onPointerdown", "onClick", "onKeydown"], bf = { class: "dc-tab__name dc-truncate" }, $f = {
  key: 0,
  class: "dc-pane__sub dc-mono dc-truncate"
}, xf = ["aria-label", "data-dc-close", "onClick"], Mf = {
  key: 0,
  class: "dc-pane__insert",
  "aria-hidden": "true"
}, Cf = { class: "dc-pane__tools" }, Sf = {
  key: 2,
  class: "dc-pane__controls dc-controls"
}, Pf = ["aria-label", "data-dc-minimize"], Ef = ["aria-label", "aria-pressed", "data-dc-maximize"], Af = ["aria-label", "data-dc-close"], Tf = ["id", "role", "aria-labelledby"], Rf = ["id", "role", "aria-labelledby"], zf = ["data-dc-edge"], Lf = /* @__PURE__ */ ie({
  __name: "WindowPane",
  props: {
    group: {},
    path: {}
  },
  setup(e) {
    const t = e, n = Dn(), a = Tn() ?? "dc-pane", s = p(
      () => t.group.panels.flatMap((D, Q) => {
        if (!ye(D)) {
          const Te = Ot(D) || Xt(D, (Re) => n.panelFor(Re)?.title);
          return [{ kind: "space", index: Q, id: `space-${Q}`, title: Te, node: D }];
        }
        const ee = n.panelFor(D);
        return ee ? [{ kind: "panel", index: Q, id: D, title: ee.title, panel: ee }] : [];
      })
    ), r = p(() => s.value.length > 1), i = p(() => {
      const D = xt(t.group);
      return s.value.find((Q) => Q.index === D) ?? s.value[0] ?? null;
    }), o = p(() => i.value?.kind === "space" ? i.value.node : null), l = p(() => o.value ? "" : Rr(t.group)), c = p(() => o.value ? null : n.panelFor(l.value)), d = p(() => i.value?.title ?? ""), h = p(() => n.spaceNames.value ? t.group.title ?? "" : ""), k = p(() => [...t.path, i.value?.index ?? 0]), g = p(() => l.value || Cs(t.group)[0] || ""), y = p(() => n.viewFor(l.value)), b = p(() => t.group.headless === !0), $ = p(() => n.focused.value === l.value), w = p(() => n.dragging.value === l.value), C = p(() => n.moving.value === l.value), R = p(() => n.frameOf(g.value) !== null), x = p(() => n.panelFor(g.value)?.fixed === !0), S = p(
      () => !o.value && (n.canMove(l.value) || R.value && n.movable.value && !x.value)
    ), O = p(
      () => o.value ? n.spaceMenu(k.value) : n.menuFor(l.value)
    ), E = (D) => n.closable(D);
    Wr({ panel: l });
    const z = p(() => n.maximized(g.value)), T = p(
      () => R.value && !x.value || !r.value && !!c.value && E(c.value.id)
    ), V = (D) => `${a}-tab-${D}`, W = p(() => `${a}-body`), U = p(() => {
      const D = n.dropTarget.value;
      return !D || !Ke(t.group, D.panel) || D.edge === "float" ? null : D;
    }), ve = p(() => U.value?.index === void 0 ? U.value?.edge ?? null : null), oe = p(() => U.value?.index ?? null), B = p(
      () => s.value.flatMap(
        (D) => D.kind === "panel" && (D.id === l.value || D.panel.keepAlive === !0) ? [D.id] : []
      )
    ), P = H(null), j = /* @__PURE__ */ new Map();
    we(
      l,
      (D, Q) => {
        const ee = P.value;
        if (!ee || (Q && j.set(Q, ee.scrollTop), !n.panelFor(D)?.keepAlive || !j.has(D))) return;
        const Te = j.get(D);
        Nt(() => {
          P.value && (P.value.scrollTop = Te);
        });
      },
      { flush: "pre" }
    );
    const ae = () => c.value ? n.renderActions(c.value, y.value, $.value) ?? null : null;
    let he = null;
    function Me(D) {
      const Q = he !== null && Math.hypot(D.clientX - he.x, D.clientY - he.y) >= 4;
      return he = null, Q;
    }
    const Ue = (D) => D.kind === "panel" ? D.id : Le(D.node);
    function ft(D, Q) {
      Q.kind !== "space" && (n.focus(Q.id), he = { x: D.clientX, y: D.clientY }, n.beginDrag(Q.id, D));
    }
    function je(D, Q) {
      if (Me(D)) return;
      const ee = Ue(Q);
      ee && n.selectPanel(ee);
    }
    function qe(D) {
      l.value && n.focus(l.value), !D.target?.closest(".dc-tab, button, a, input, select, textarea, label") && (R.value ? n.beginFrameDrag(g.value, D, "move") : n.beginDrag(l.value, D));
    }
    function tt(D) {
      he = { x: D.clientX, y: D.clientY }, n.beginDrag(l.value, D);
    }
    function Oe(D) {
      Me(D) || n.toggleMoveMode(l.value);
    }
    const K = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down"
    };
    function Y(D) {
      if (!C.value) return;
      if (D.key === "Escape") {
        D.preventDefault(), n.toggleMoveMode(l.value);
        return;
      }
      const Q = K[D.key];
      Q && (D.preventDefault(), R.value ? n.nudgeFrame(l.value, Q, D.shiftKey) : n.nudge(l.value, Q, D.shiftKey));
    }
    function X(D) {
      !R.value || D.target?.closest(".dc-tab, button, a, input, select, textarea, label") || n.toggleMaximize(g.value);
    }
    function De(D, Q) {
      D.stopPropagation(), he = null, n.close(Q);
    }
    function Bt(D, Q) {
      const ee = s.value.length;
      let Te = null;
      if (D.key === "ArrowRight" ? Te = (Q + 1) % ee : D.key === "ArrowLeft" ? Te = (Q - 1 + ee) % ee : D.key === "Home" ? Te = 0 : D.key === "End" && (Te = ee - 1), Te === null) return;
      D.preventDefault();
      const Re = s.value[Te];
      if (!Re) return;
      const qt = Ue(Re);
      qt && n.selectPanel(qt);
    }
    return (D, Q) => i.value ? (f(), m("section", {
      key: 0,
      class: "dc-pane",
      "data-dc-panel": l.value || void 0,
      "data-dc-panels": A(Cs)(e.group).join(" ") || void 0,
      "data-dc-tabbed": r.value ? "true" : "false",
      "data-dc-floating": R.value ? "true" : "false",
      "data-dc-maximized": z.value ? "true" : "false",
      "data-dc-headless": b.value ? "true" : "false",
      "data-dc-active": $.value ? "true" : "false",
      "data-dc-dragging": w.value ? "true" : "false",
      "aria-label": d.value,
      onFocusin: Q[7] || (Q[7] = (ee) => l.value && A(n).focus(l.value))
    }, [
      b.value ? I("", !0) : (f(), m("header", {
        key: 0,
        class: "dc-pane__head",
        "data-dc-movable": S.value ? "true" : "false",
        onPointerdown: qe,
        onDblclick: X
      }, [
        S.value ? (f(), m("button", {
          key: 0,
          type: "button",
          class: "dc-pane__grip",
          "aria-label": `Move ${d.value}`,
          "aria-pressed": C.value,
          onPointerdown: tt,
          onClick: Oe,
          onKeydown: Y
        }, [...Q[8] || (Q[8] = [
          M("span", { "aria-hidden": "true" }, "⠿", -1)
        ])], 40, mf)) : I("", !0),
        h.value ? (f(), m("span", {
          key: 1,
          class: "dc-pane__name",
          "data-dc-space-name": h.value
        }, [
          M("span", _f, F(h.value), 1)
        ], 8, gf)) : I("", !0),
        M("div", {
          class: "dc-pane__tabs",
          role: "tablist",
          "aria-label": `${d.value} panels`
        }, [
          (f(!0), m(ne, null, ge(s.value, (ee, Te) => (f(), m(ne, {
            key: ee.id
          }, [
            oe.value === Te ? (f(), m("span", wf)) : I("", !0),
            M("button", {
              id: V(ee.id),
              type: "button",
              role: "tab",
              class: "dc-tab",
              "data-dc-panel": ee.kind === "panel" ? ee.id : void 0,
              "data-dc-space": ee.kind === "space" ? ee.title : void 0,
              "aria-selected": ee.index === i.value.index,
              "aria-controls": W.value,
              tabindex: ee.index === i.value.index ? 0 : -1,
              onPointerdown: (Re) => ft(Re, ee),
              onClick: (Re) => je(Re, ee),
              onKeydown: (Re) => Bt(Re, Te)
            }, [
              M("span", bf, F(ee.title), 1),
              ee.kind === "panel" && ee.panel.subtitle ? (f(), m("span", $f, F(ee.panel.subtitle), 1)) : I("", !0),
              r.value && ee.kind === "panel" && E(ee.id) ? (f(), m("span", {
                key: 1,
                class: "dc-tab__close",
                role: "button",
                tabindex: "-1",
                "aria-label": `Close ${ee.title}`,
                "data-dc-close": ee.id,
                onPointerdown: Q[0] || (Q[0] = Ne(() => {
                }, ["stop"])),
                onClick: (Re) => De(Re, ee.id)
              }, [...Q[9] || (Q[9] = [
                M("span", { "aria-hidden": "true" }, "×", -1)
              ])], 40, xf)) : I("", !0)
            ], 40, kf)
          ], 64))), 128)),
          oe.value === s.value.length ? (f(), m("span", Mf)) : I("", !0)
        ], 8, yf),
        M("div", Cf, [
          ce(ae),
          O.value.length ? (f(), Z(Va, {
            key: 0,
            items: O.value,
            label: `${d.value} menu`
          }, null, 8, ["items", "label"])) : I("", !0)
        ]),
        T.value ? (f(), m("div", Sf, [
          R.value && !x.value ? (f(), m("button", {
            key: 0,
            type: "button",
            class: "dc-pane__button dc-control",
            "aria-label": `Minimize ${d.value}`,
            "data-dc-minimize": g.value,
            onPointerdown: Q[1] || (Q[1] = Ne(() => {
            }, ["stop"])),
            onClick: Q[2] || (Q[2] = (ee) => A(n).toggleMinimize(g.value))
          }, [
            ce(Lt, { kind: "minimize" })
          ], 40, Pf)) : I("", !0),
          R.value && !x.value ? (f(), m("button", {
            key: 1,
            type: "button",
            class: "dc-pane__button dc-control",
            "aria-label": `${z.value ? "Restore" : "Maximize"} ${d.value}`,
            "aria-pressed": z.value,
            "data-dc-maximize": g.value,
            onPointerdown: Q[3] || (Q[3] = Ne(() => {
            }, ["stop"])),
            onClick: Q[4] || (Q[4] = (ee) => A(n).toggleMaximize(g.value))
          }, [
            ce(Lt, {
              kind: z.value ? "restore" : "maximize"
            }, null, 8, ["kind"])
          ], 40, Ef)) : I("", !0),
          !r.value && c.value && E(c.value.id) ? (f(), m("button", {
            key: 2,
            type: "button",
            class: "dc-pane__close dc-control",
            "aria-label": `Close ${d.value}`,
            "data-dc-close": c.value.id,
            onPointerdown: Q[5] || (Q[5] = Ne(() => {
            }, ["stop"])),
            onClick: Q[6] || (Q[6] = (ee) => A(n).close(c.value.id))
          }, [
            ce(Lt, { kind: "close" })
          ], 40, Af)) : I("", !0)
        ])) : I("", !0)
      ], 40, hf)),
      o.value ? (f(), m("div", {
        key: 1,
        id: W.value,
        class: "dc-pane__space",
        role: b.value ? void 0 : "tabpanel",
        "aria-labelledby": b.value ? void 0 : V(i.value.id)
      }, [
        $e(D.$slots, "space", {
          node: o.value,
          path: k.value
        }, void 0, !0)
      ], 8, Tf)) : I("", !0),
      !o.value || B.value.length ? dt((f(), m("div", {
        key: 2,
        id: o.value ? void 0 : W.value,
        ref_key: "body",
        ref: P,
        class: "dc-pane__body",
        role: b.value || o.value ? void 0 : "tabpanel",
        "aria-labelledby": b.value || o.value ? void 0 : V(l.value)
      }, [
        (f(!0), m(ne, null, ge(B.value, (ee) => dt((f(), Z(pf, {
          key: ee,
          panel: ee,
          active: ee === l.value && $.value
        }, null, 8, ["panel", "active"])), [
          [xn, ee === l.value]
        ])), 128))
      ], 8, Rf)), [
        [xn, !o.value]
      ]) : I("", !0),
      ve.value ? (f(), m("div", {
        key: 3,
        class: "dc-pane__drop",
        "data-dc-edge": ve.value,
        "aria-hidden": "true"
      }, null, 8, zf)) : I("", !0)
    ], 40, vf)) : I("", !0);
  }
}), Ur = /* @__PURE__ */ de(Lf, [["__scopeId", "data-v-2c3c5ecf"]]), If = ["data-dc-space", "data-dc-path", "aria-label"], Nf = {
  key: 0,
  class: "dc-space__head"
}, Ff = { class: "dc-space__title dc-truncate" }, Of = ["data-dc-direction"], Df = {
  key: 0,
  class: "dc-space__drop",
  "aria-hidden": "true"
}, Bf = ["aria-orientation", "aria-label", "aria-valuenow", "aria-disabled", "tabindex", "onPointerdown", "onKeydown"], qf = /* @__PURE__ */ ie({
  __name: "WindowNode",
  props: {
    node: {},
    path: {},
    framed: { type: Boolean }
  },
  setup(e) {
    const t = e, n = Dn(), a = H(null), s = p(() => J(t.node) ? t.node : null), r = p(() => Dt(t.node) ? t.node : null), i = p(() => le(t.node) ? t.node : null), o = p(
      () => r.value ? r.value.children : i.value?.frames.map((B) => B.node) ?? []
    ), l = p(() => r.value ? rt(r.value) : []), c = p(
      () => (i.value?.frames ?? []).map((B, P) => ({
        held: B,
        /** Place in the stack, counted from the back — what `z-index` follows. */
        order: P,
        key: E(B.node),
        path: [...t.path, P]
      })).sort((B, P) => B.key < P.key ? -1 : B.key > P.key ? 1 : 0)
    ), d = p(() => Ot(t.node)), h = p(() => n.spaceMenu(t.path)), k = p(() => t.node.headless === !0), g = p(() => i.value ? "desktop" : r.value?.direction ?? ""), y = H(null), b = H(0);
    let $ = null;
    we(
      y,
      (B) => {
        $?.disconnect(), $ = null, !(!B || typeof ResizeObserver > "u") && (b.value = B.clientWidth, $ = new ResizeObserver(([P]) => {
          b.value = P?.contentRect.width ?? 0;
        }), $.observe(B));
      },
      { immediate: !0 }
    ), We(() => $?.disconnect());
    const w = p(() => {
      const B = Math.max(
        1,
        Math.floor((b.value + Ct) / (pa + Ct))
      ), P = /* @__PURE__ */ new Map();
      let j = 0;
      for (const ae of c.value)
        ae.held.minimized === !0 && (P.set(ae.key, {
          x: Ct + j % B * (pa + Ct),
          bottom: Ct + Math.floor(j / B) * (Ar + Ct)
        }), j += 1);
      return P;
    }), C = (B) => !!B && B.join("/") === t.path.join("/"), R = p(() => {
      const B = n.dropTarget.value, P = i.value;
      if (!P || !B?.rect || B.edge !== "float") return null;
      if (B.space) return C(B.space) ? B.rect : null;
      const j = Ee(P, B.panel);
      return j && P.frames.includes(j) ? B.rect : null;
    }), x = p(() => {
      const B = n.dropTarget.value;
      return !!B && !B.rect && C(B.space);
    }), S = p(() => r.value?.direction === "row"), O = p(() => o.value.map((B, P) => [...t.path, P])), E = (B) => [...Qe(B)].sort().join("/"), z = (B) => {
      const P = Qe(B)[0];
      return (P ? n.panelFor(P)?.title : null) ?? P ?? "panel";
    }, T = (B) => {
      const P = o.value[B], j = o.value[B + 1];
      return !P || !j ? "Resize panels" : `Resize ${z(P)} and ${z(j)}`;
    }, V = (B) => {
      const P = l.value[B] ?? 0, j = l.value[B + 1] ?? 0, ae = P + j;
      return ae > 0 ? Math.round(P / ae * 100) : 50;
    };
    function W() {
      const B = a.value, P = B ? S.value ? B.clientWidth : B.clientHeight : 0;
      return P <= 0 ? 0.05 : Math.min(n.minPanelSize.value / P, 0.4);
    }
    let U = null;
    function ve(B, P) {
      const j = r.value, ae = a.value;
      if (!n.resizable.value || !j || !ae || B.button !== 0) return;
      const he = S.value ? ae.clientWidth : ae.clientHeight;
      if (he <= 0) return;
      const Me = S.value ? B.clientX : B.clientY, Ue = rt(j), ft = Math.min(n.minPanelSize.value / he, 0.4);
      B.preventDefault();
      const je = (Oe) => {
        const K = ((S.value ? Oe.clientX : Oe.clientY) - Me) / he;
        n.setSizes(t.path, Rs(Ue, P, K, ft));
      }, qe = () => U?.(), tt = (Oe) => {
        Oe.key === "Escape" && (n.setSizes(t.path, Ue), U?.());
      };
      U = () => {
        window.removeEventListener("pointermove", je), window.removeEventListener("pointerup", qe), window.removeEventListener("pointercancel", qe), window.removeEventListener("keydown", tt), U = null;
      }, window.addEventListener("pointermove", je), window.addEventListener("pointerup", qe), window.addEventListener("pointercancel", qe), window.addEventListener("keydown", tt);
    }
    We(() => U?.());
    function oe(B, P) {
      const j = r.value;
      if (!n.resizable.value || !j) return;
      const ae = S.value ? "ArrowRight" : "ArrowDown", he = S.value ? "ArrowLeft" : "ArrowUp", Me = B.shiftKey ? 0.1 : 0.02;
      if (B.key !== ae && B.key !== he) return;
      const Ue = B.key === ae ? Me : -Me;
      B.preventDefault(), n.setSizes(t.path, Rs(rt(j), P, Ue, W()));
    }
    return (B, P) => {
      const j = Os("WindowNode", !0);
      return s.value ? (f(), Z(Ur, {
        key: 0,
        group: s.value,
        path: e.path
      }, {
        space: xe(({ node: ae, path: he }) => [
          ce(j, {
            node: ae,
            path: he,
            framed: ""
          }, null, 8, ["node", "path"])
        ]),
        _: 1
      }, 8, ["group", "path"])) : (f(), m("section", {
        key: 1,
        class: "dc-space",
        "data-dc-space": g.value,
        "data-dc-path": e.path.join("/"),
        "aria-label": d.value
      }, [
        !e.framed && !k.value ? (f(), m("header", Nf, [
          M("span", Ff, F(d.value), 1),
          h.value.length ? (f(), Z(Va, {
            key: 0,
            items: h.value,
            label: `${d.value} menu`
          }, null, 8, ["items", "label"])) : I("", !0)
        ])) : I("", !0),
        i.value ? (f(), m("div", {
          key: 1,
          ref_key: "desktop",
          ref: y,
          class: "dc-window__desktop"
        }, [
          R.value ? (f(), m("div", {
            key: 0,
            class: "dc-window__drop",
            style: Ae({
              left: `${R.value.x}px`,
              top: `${R.value.y}px`,
              width: `${R.value.w}px`,
              height: `${R.value.h}px`
            }),
            "aria-hidden": "true"
          }, null, 4)) : I("", !0),
          (f(!0), m(ne, null, ge(c.value, (ae) => (f(), Z(uf, {
            key: ae.key,
            frame: ae.held,
            path: ae.path,
            order: ae.order,
            place: w.value.get(ae.key) ?? null
          }, {
            default: xe(() => [
              ce(j, {
                node: ae.held.node,
                path: ae.path,
                framed: ae.held.node.kind !== "group"
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
          x.value ? (f(), m("div", Df)) : I("", !0),
          (f(!0), m(ne, null, ge(o.value, (ae, he) => (f(), m(ne, {
            key: E(ae)
          }, [
            M("div", {
              class: "dc-window__cell",
              style: Ae({ flexGrow: l.value[he] ?? 1 })
            }, [
              ce(j, {
                node: ae,
                path: O.value[he] ?? []
              }, null, 8, ["node", "path"])
            ], 4),
            he < o.value.length - 1 ? (f(), m("div", {
              key: 0,
              class: "dc-window__gutter",
              role: "separator",
              "aria-orientation": S.value ? "vertical" : "horizontal",
              "aria-label": T(he),
              "aria-valuenow": V(he),
              "aria-valuemin": "0",
              "aria-valuemax": "100",
              "aria-disabled": A(n).resizable.value ? void 0 : "true",
              tabindex: A(n).resizable.value ? 0 : -1,
              onPointerdown: (Me) => ve(Me, he),
              onKeydown: (Me) => oe(Me, he)
            }, null, 40, Bf)) : I("", !0)
          ], 64))), 128))
        ], 8, Of)) : I("", !0)
      ], 8, If));
    };
  }
}), Vf = /* @__PURE__ */ de(qf, [["__scopeId", "data-v-fb5b403f"]]), Kf = ["data-dc-theme", "data-dc-dragging", "data-dc-docking"], Hf = {
  key: 1,
  class: "dc-window__empty"
}, Wf = {
  class: "dc-window__live",
  "aria-live": "polite",
  role: "status"
}, vn = 16, Uf = /* @__PURE__ */ ie({
  __name: "WindowFrame",
  props: /* @__PURE__ */ $n({
    panels: {},
    movable: { type: Boolean, default: !1 },
    resizable: { type: Boolean, default: !0 },
    minPanelSize: { default: 120 },
    closable: { type: Boolean, default: !1 },
    menu: { type: Boolean, default: !0 },
    spaceNames: { type: Boolean, default: !0 },
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
    const a = e, s = n, r = Ht(e, "layout"), i = Ht(e, "views"), o = Jt(), l = p(() => new Map(a.panels.map((u) => [u.id, u]))), c = p(() => a.panels.map((u) => u.id)), d = p(() => qd(r.value, h.value)), h = p(() => {
      if (!a.solo || !r.value) return c.value;
      const u = new Set(Qe(r.value)), v = c.value.filter((_) => u.has(_));
      return v.length ? v : c.value;
    }), k = H(null), g = H(null), y = H(null), b = H(!0), $ = H(null), w = H(null), C = H(null), R = H(""), x = H(null);
    function S() {
      const u = x.value;
      return u ? [...u.querySelectorAll(".dc-pane[data-dc-panels]")].filter((_) => _.closest(".dc-window") === u).map((_) => ({ panels: (_.dataset.dcPanels ?? "").split(" "), element: _ })) : [];
    }
    function O(u) {
      const v = [];
      let _ = u.closest(".dc-float");
      for (; _; )
        v.unshift(Number(_.dataset.dcOrder ?? 0)), _ = _.parentElement?.closest(".dc-float") ?? null;
      return v;
    }
    function E() {
      return S().map((u) => ({ pane: u, order: O(u.element) })).sort((u, v) => {
        const _ = Math.max(u.order.length, v.order.length);
        for (let L = 0; L < _; L += 1) {
          const N = (u.order[L] ?? -1) - (v.order[L] ?? -1);
          if (N !== 0) return N;
        }
        return 0;
      }).map((u) => u.pane);
    }
    const z = (u) => S().find((v) => v.panels.includes(u)) ?? null;
    function T(u) {
      const v = l.value.get(u);
      if (!v) return "";
      const _ = i.value[u];
      return _ && v.views?.some((L) => L.key === _) ? _ : v.defaultView ?? v.views?.[0]?.key ?? "";
    }
    function V(u, v) {
      i.value = { ...i.value, [u]: v }, s("view-change", { panel: u, view: v });
    }
    const W = p(
      () => a.panels.filter((u) => u.fixed !== !0).length
    );
    function U(u) {
      return !a.movable || W.value < 1 || a.panels.length < 2 ? !1 : l.value.get(u)?.fixed !== !0;
    }
    function ve(u, v) {
      const _ = d.value;
      !u || !_ || u === _ || (r.value = u, v && s("panel-move", v));
    }
    function oe(u, v, _) {
      if (u.width <= 0 || u.height <= 0) return "center";
      const L = (v - u.left) / u.width, N = (_ - u.top) / u.height, q = 0.3;
      return L > q && L < 1 - q && N > q && N < 1 - q ? "center" : [
        { edge: "left", distance: L },
        { edge: "right", distance: 1 - L },
        { edge: "top", distance: N },
        { edge: "bottom", distance: 1 - N }
      ].reduce(
        (ue, G) => G.distance < ue.distance ? G : ue
      ).edge;
    }
    function B(u, v) {
      const _ = [...u.querySelectorAll(".dc-tab")], L = _.findIndex((N) => {
        const q = N.getBoundingClientRect();
        return v < q.left + q.width / 2;
      });
      return L === -1 ? _.length : L;
    }
    function P(u, v, _) {
      for (const { panels: L, element: N } of E().reverse()) {
        const q = N.getBoundingClientRect();
        if (u < q.left || u > q.right || v < q.top || v > q.bottom) continue;
        const fe = L.find((se) => se !== _), ue = N.querySelector(".dc-pane__tabs"), G = ue?.getBoundingClientRect();
        if (ue && G && v >= G.top && v <= G.bottom)
          return fe ? { panel: fe, edge: "center", index: B(ue, u) } : null;
        const te = N.querySelector(":scope > .dc-pane__space");
        if (te) {
          const se = te.getBoundingClientRect();
          if (u >= se.left && u <= se.right && v >= se.top && v <= se.bottom) continue;
        }
        return fe ? { panel: fe, edge: oe(q, u, v) } : null;
      }
      return ae(u, v, _) ?? Ue(u, v);
    }
    function j() {
      const u = x.value;
      return u ? [...u.querySelectorAll(".dc-window__desktop")].filter((v) => v.closest(".dc-window") === u).reverse() : [];
    }
    function ae(u, v, _) {
      const L = d.value;
      if (!L) return null;
      for (const N of j()) {
        const q = N.getBoundingClientRect();
        if (u < q.left || u > q.right || v < q.top || v > q.bottom) continue;
        const fe = ft(N), ue = fe.flatMap((me) => me.panels).find((me) => me !== _);
        if (!ue && fe.length > 0) return null;
        const G = Ee(L, _)?.rect, te = Xn(
          {
            x: u - q.left - 24,
            y: v - q.top - 12,
            w: G?.w ?? gt.w,
            h: G?.h ?? gt.h
          },
          { w: N.clientWidth, h: N.clientHeight },
          a.minPanelSize
        );
        if (ue) return { panel: ue, edge: "float", rect: te };
        const se = he(N);
        return se ? { panel: "", space: se, edge: "float", rect: te } : null;
      }
      return null;
    }
    function he(u) {
      const v = u.closest(".dc-space")?.getAttribute("data-dc-path");
      return v == null ? null : v === "" ? [] : v.split("/").map(Number);
    }
    function Me() {
      const u = x.value;
      return u ? [...u.querySelectorAll(".dc-space")].filter((v) => v.closest(".dc-window") === u).filter((v) => !v.querySelector(".dc-pane")).reverse().flatMap((v) => {
        const _ = he(v);
        return _ ? [{ element: v, path: _ }] : [];
      }) : [];
    }
    function Ue(u, v) {
      for (const { element: _, path: L } of Me()) {
        if (_.dataset.dcSpace === "desktop") continue;
        const N = _.getBoundingClientRect();
        if (!(u < N.left || u > N.right || v < N.top || v > N.bottom))
          return { panel: "", space: L, edge: "center" };
      }
      return null;
    }
    function ft(u) {
      return S().filter(
        (v) => v.element.closest(".dc-window__desktop") === u
      );
    }
    let je = null;
    const qe = (u) => u.altKey;
    function tt(u, v) {
      if (!U(u) || g.value || w.value || v.button !== 0) return;
      const _ = v.clientX, L = v.clientY;
      let N = !1, q = qe(v);
      const fe = () => {
        const _e = C.value;
        _e && (y.value = q ? ae(_e.x, _e.y, u) : P(_e.x, _e.y, u));
      }, ue = (_e) => {
        if (!N) {
          if (Math.hypot(_e.clientX - _, _e.clientY - L) < 4) return;
          N = !0, g.value = u, $.value = null;
        }
        q = qe(_e), b.value = !q, C.value = { x: _e.clientX, y: _e.clientY }, fe();
      }, G = (_e) => {
        qe(_e) !== q && (q = !q, b.value = !q, N && fe());
      }, te = (_e) => {
        je?.();
        const re = y.value, ze = d.value;
        if (_e && N && re && ze) {
          const lt = re.space ? As(ze, u, re.space, re.rect) : re.edge === "float" && re.rect ? Es(ze, u, re.panel, re.rect) : pn(ze, u, re.panel, re.edge, re.index);
          ve(lt, {
            panel: u,
            target: re.panel,
            edge: re.edge,
            ...re.space === void 0 ? {} : { space: re.space },
            ...re.index === void 0 ? {} : { index: re.index },
            ...re.rect === void 0 ? {} : { rect: re.rect }
          });
        }
        g.value = null, y.value = null, C.value = null, b.value = !0;
      }, se = () => te(!0), me = () => te(!1), ke = (_e) => {
        if (_e.key === "Escape") {
          te(!1);
          return;
        }
        G(_e);
      };
      je = () => {
        window.removeEventListener("pointermove", ue), window.removeEventListener("pointerup", se), window.removeEventListener("pointercancel", me), window.removeEventListener("keydown", ke), window.removeEventListener("keyup", G), je = null;
      }, window.addEventListener("pointermove", ue), window.addEventListener("pointerup", se), window.addEventListener("pointercancel", me), window.addEventListener("keydown", ke), window.addEventListener("keyup", G);
    }
    We(() => je?.());
    let Oe = null;
    function K(u) {
      const v = x.value;
      return v ? [...v.querySelectorAll(
        `.dc-float[data-dc-path="${u.join("/")}"]`
      )].find((N) => N.closest(".dc-window") === v)?.parentElement ?? null : null;
    }
    function Y(u) {
      const v = d.value;
      return v ? ma(v, u) : null;
    }
    function X(u) {
      const v = d.value;
      if (!v) return;
      const _ = jt(v, u);
      _ !== v && (r.value = _);
    }
    function De(u) {
      const v = Y(u);
      v && X(v);
    }
    function Bt(u) {
      const v = d.value, _ = v ? Ee(v, u) : null;
      return _ !== null && ot(_);
    }
    function D(u) {
      const v = d.value, _ = v ? Ee(v, u) : null;
      return _ !== null && mt(_);
    }
    function Q(u) {
      const v = d.value, _ = v ? ht(v, u) : null;
      return _ ? Le(_.node) : "";
    }
    function ee(u) {
      const v = d.value, _ = v ? ht(v, u) : null;
      if (!v || !_) return;
      const L = Le(_.node);
      if (l.value.get(L)?.fixed === !0) return;
      const N = !mt(_);
      let q = Ad(v, u, N);
      q !== v && (N || (q = jt(q, u)), r.value = q, s("frame-minimize", { panel: L, minimized: N }));
    }
    function Te(u) {
      const v = Y(u);
      v && ee(v);
    }
    function Re(u) {
      const v = d.value, _ = v ? ht(v, u) : null;
      if (!v || !_) return;
      const L = Le(_.node);
      if (l.value.get(L)?.fixed === !0) return;
      const N = !ot(_);
      let q = Ed(v, u, N);
      q !== v && (N && (q = jt(q, u)), r.value = q, s("frame-maximize", { panel: L, maximized: N }));
    }
    function qt(u) {
      const v = Y(u);
      v && Re(v);
    }
    function ns(u, v, _) {
      const L = d.value, N = L ? ht(L, u) : null;
      if (!L || !N || v.button !== 0 || g.value || w.value) return;
      const q = Le(N.node);
      if (l.value.get(q)?.fixed === !0 || ot(N) || mt(N) || (_ === "move" ? !a.movable : !a.resizable)) return;
      const fe = K(u), ue = Td(L, u);
      X(u);
      const G = { w: fe?.clientWidth ?? 0, h: fe?.clientHeight ?? 0 }, te = { ...N.rect }, se = v.clientX, me = v.clientY, ke = a.minPanelSize;
      w.value = q;
      const _e = (Ve) => {
        const nt = d.value;
        if (!nt) return;
        const Vt = Ps(nt, ue, Xn(Ve, G, ke));
        Vt !== nt && (r.value = Vt);
      }, re = (Ve) => {
        Ve.preventDefault();
        const nt = Ve.clientX - se, Vt = Ve.clientY - me;
        _e(
          _ === "move" ? { ...te, x: te.x + nt, y: te.y + Vt } : Ss(te, _, nt, Vt, ke)
        );
      }, ze = (Ve) => {
        if (Oe?.(), w.value = null, !Ve) {
          _e(te);
          return;
        }
        const nt = d.value ? ht(d.value, ue) : null;
        nt && s("frame-change", { panel: Q(ue), rect: nt.rect });
      }, lt = () => ze(!0), pt = () => ze(!1), vt = (Ve) => {
        Ve.key === "Escape" && ze(!1);
      };
      Oe = () => {
        window.removeEventListener("pointermove", re), window.removeEventListener("pointerup", lt), window.removeEventListener("pointercancel", pt), window.removeEventListener("keydown", vt), Oe = null;
      }, window.addEventListener("pointermove", re), window.addEventListener("pointerup", lt), window.addEventListener("pointercancel", pt), window.addEventListener("keydown", vt);
    }
    function Qr(u, v, _) {
      const L = Y(u);
      L && ns(L, v, _);
    }
    function Zr(u, v, _ = !1) {
      const L = d.value, N = Y(u), q = L && N ? ht(L, N) : null;
      if (!L || !N || !q || l.value.get(u)?.fixed === !0 || (_ ? !a.resizable : !a.movable)) return;
      if (ot(q) || mt(q)) {
        R.value = `${Je(u)} is ${ot(q) ? "maximized" : "minimized"}, so it cannot be moved.`;
        return;
      }
      const fe = v === "left" ? -vn : v === "right" ? vn : 0, ue = v === "up" ? -vn : v === "down" ? vn : 0, G = K(N), te = { w: G?.clientWidth ?? 0, h: G?.clientHeight ?? 0 }, se = _ ? Ss(q.rect, "se", fe, ue, a.minPanelSize) : { ...q.rect, x: q.rect.x + fe, y: q.rect.y + ue }, me = Ps(L, N, Xn(se, te, a.minPanelSize));
      if (me === L) {
        R.value = _ ? `${Je(u)} cannot be resized further.` : `${Je(u)} cannot move ${v}.`;
        return;
      }
      r.value = me;
      const ke = ht(me, N);
      ke && (s("frame-change", { panel: u, rect: ke.rect }), R.value = _ ? `${Je(u)} resized to ${ke.rect.w} by ${ke.rect.h}.` : `${Je(u)} moved to ${ke.rect.x}, ${ke.rect.y}.`);
    }
    We(() => Oe?.());
    function Jr(u, v) {
      const _ = z(u), L = _?.element.getBoundingClientRect();
      if (!_ || !L) return null;
      const N = v === "left" || v === "right", q = (G) => {
        if (!(N ? G.bottom > L.top + 1 && G.top < L.bottom - 1 : G.right > L.left + 1 && G.left < L.right - 1)) return null;
        const se = v === "left" ? L.left - G.right : v === "right" ? G.left - L.right : v === "up" ? L.top - G.bottom : G.top - L.bottom;
        return se < -1 ? null : se;
      }, fe = [];
      for (const G of S()) {
        if (G === _ || G.element === _.element) continue;
        const te = q(G.element.getBoundingClientRect());
        if (te === null) continue;
        const se = G.panels.find((me) => me !== u);
        se && fe.push({ to: { panel: se }, distance: te });
      }
      for (const { element: G, path: te } of Me()) {
        const se = q(G.getBoundingClientRect());
        se !== null && fe.push({ to: { space: te }, distance: se });
      }
      return fe.reduce(
        (G, te) => G && G.distance <= te.distance ? G : te,
        null
      )?.to ?? null;
    }
    function el(u) {
      const v = d.value ? Ee(d.value, u) !== null : !1;
      if (!v && !U(u)) return;
      $.value = $.value === u ? null : u;
      const _ = Je(u);
      if (!$.value) {
        R.value = `${_}: move mode off.`;
        return;
      }
      R.value = v ? `${_}: move mode on. Arrow keys move the window, shift and an arrow resize it, Escape leaves move mode.` : `${_}: move mode on. Arrow keys move the panel, shift and an arrow make it a tab of the panel that way, Escape leaves move mode.`;
    }
    const Je = (u) => l.value.get(u)?.title ?? u, tl = {
      left: "left",
      right: "right",
      up: "top",
      down: "bottom"
    };
    function nl(u, v, _ = !1) {
      if (!U(u)) return;
      const L = d.value;
      if (!L) return;
      const N = Je(u), q = Tt(L, u);
      if (!_ && q && (v === "left" || v === "right") && q.panels.length > 1) {
        const me = q.panels.indexOf(u), ke = v === "left" ? me - 1 : me + 1;
        if (ke >= 0 && ke < q.panels.length) {
          ve(Gt(L, u, ke), { panel: u, target: u, edge: "center", index: ke }), R.value = `${N} moved ${v}, now tab ${ke + 1} of ${q.panels.length}.`, Bn(u);
          return;
        }
      }
      const ue = Jr(u, v);
      if (!ue || ue.panel !== void 0 && !U(ue.panel)) {
        R.value = `${N} cannot move ${v}.`;
        return;
      }
      const G = tl[v];
      if (ue.space) {
        const me = ue.space, ke = ct(L, me), _e = Ee(L, u)?.rect, re = { ...gt, ..._e ? { w: _e.w, h: _e.h } : {} };
        ve(As(L, u, me, re), { panel: u, target: "", space: me, edge: G }), R.value = `${N} moved ${v}, into ${ke ? Ot(ke) : "the space"}.`, Bn(u);
        return;
      }
      const te = ue.panel, se = q?.panels.length === 1 && Tt(L, te)?.panels.length === 1;
      _ ? (ve(pn(L, u, te, "center"), {
        panel: u,
        target: te,
        edge: "center"
      }), R.value = `${N} joined ${Je(te)} as a tab.`) : se ? (ve(yn(L, u, te), { panel: u, target: te, edge: G }), R.value = `${N} moved ${v}, trading places with ${Je(te)}.`) : (ve(pn(L, u, te, G), { panel: u, target: te, edge: G }), R.value = `${N} moved ${v}, beside ${Je(te)}.`), Bn(u);
    }
    function Bn(u) {
      Nt(() => {
        z(u)?.element.querySelector(".dc-pane__grip")?.focus();
      });
    }
    function al(u, v) {
      const _ = d.value;
      _ && (r.value = wn(_, u, v));
    }
    function qn(u) {
      const v = d.value;
      if (!v) return;
      const _ = zt(v, u);
      _ !== v && (r.value = _, s("tab-select", { panel: u }));
    }
    function as(u) {
      return l.value.get(u)?.closable ?? a.closable;
    }
    function sl(u) {
      as(u) && s("panel-close", u);
    }
    const Vn = H(/* @__PURE__ */ new Map());
    let rl = 0;
    function ll(u, v) {
      const _ = rl += 1;
      return Vn.value.set(_, { panel: u, items: v }), () => {
        Vn.value.delete(_);
      };
    }
    function ol(u) {
      const v = [];
      for (const _ of Vn.value.values())
        _.panel() === u && v.push(..._.items());
      return v;
    }
    function ss(u) {
      const v = u.filter((_) => _.items.length > 0);
      return v.length < 2 ? v.flatMap((_) => _.items) : v.flatMap((_) => [
        { id: _.id, heading: !0, label: _.title },
        ..._.items
      ]);
    }
    const rs = (u) => u.title || "These tabs";
    function il(u, v) {
      const _ = v.id, L = Tt(u, _), N = (L?.panels.length ?? 0) > 1, q = L?.fixedView === !0, fe = (se) => ({
        action: () => {
          se !== u && (r.value = se);
        }
      }), ue = [], G = [], te = v.views ?? [];
      if (te.length > 1 && !q) {
        const se = T(_);
        ue.push({
          id: "view",
          label: "View",
          items: te.map((me) => ({
            id: `view-${me.key}`,
            label: me.label,
            checked: me.key === se,
            action: () => V(_, me.key)
          }))
        });
      }
      return N && !q && G.push(
        { id: "show-row", label: "Row", checked: !1, ...fe(Ts(u, _, "row")) },
        {
          id: "show-column",
          label: "Column",
          checked: !1,
          ...fe(Ts(u, _, "column"))
        },
        // Already true, and nothing to collapse: these panes are tabs. Ticked
        // and choosable all the same — collapsing a strip into a strip hands
        // back the tree it was given, so it is the no-op it looks like.
        {
          id: "show-tabs",
          label: "Tabs",
          checked: !0,
          ...fe(Id(u, _))
        },
        {
          id: "show-desktop",
          label: "Desktop",
          checked: !1,
          ...fe(Nd(u, _))
        }
      ), N && L && (G.length && G.push({ separator: !0 }), G.push(...ls(L, _))), { panel: ue, tabs: G, tabsTitle: L ? rs(L) : "" };
    }
    function ls(u, v) {
      const _ = xt(u), L = (N) => {
        const q = u.panels[(_ + N + u.panels.length) % u.panels.length];
        return (q === void 0 ? "" : Le(q)) || v;
      };
      return [
        { id: "next-tab", label: "Next tab", action: () => qn(L(1)) },
        { id: "previous-tab", label: "Previous tab", action: () => qn(L(-1)) }
      ];
    }
    function un(u) {
      return u.title ? u.title : J(u) ? u.panels.length > 1 ? "these tabs" : "the strip" : Ot(u);
    }
    function os(u) {
      if (!u || le(u) || u.fixedView === !0 || !u.title && u.headless !== !0 || Ze(u)) return null;
      const v = Hr(u);
      return v && v.fixedView !== !0 ? v : null;
    }
    function cl(u) {
      const v = d.value;
      if (!a.menu || !v) return [];
      const _ = ct(v, u);
      if (!_ || J(_)) return [];
      if (_.fixedView) return [];
      const L = le(_) ? "desktop" : _.direction, N = (re, ze, lt) => ({
        id: `show-${re}`,
        label: ze,
        checked: L === re,
        action: () => {
          const pt = d.value, vt = lt();
          !pt || vt === _ || (r.value = En(Se(yt(pt, u, vt))));
        }
      }), q = () => {
        const re = Br(_, ul(_));
        if (J(re) && re.panels.length === 0) return _;
        const ze = J(re) && re.panels.length === 1 ? re.panels[0] : void 0;
        return ze !== void 0 && ye(ze) ? _ : re;
      }, fe = (re) => () => le(_) ? Kr(_, re) : _.direction === re ? _ : { ..._, direction: re }, ue = u.slice(0, -1), G = u.length > 0 ? ct(v, ue) : null, te = G && J(G) && G.panels.length > 1 ? G : null, se = G && os(G) === _ ? G : null, me = os(_), ke = _.title || "this space", _e = (re, ze, lt, pt, vt) => ({
        id: re,
        label: vt,
        action: () => {
          const Ve = d.value;
          Ve && (r.value = En(Se(yt(Ve, ze, Dd(lt, pt)))));
        }
      });
      return ss([
        {
          id: "about-space",
          /*
           * Its own name, or what it is rather than how it is shown: `spaceTitle`
           * would answer "Row" for an unnamed row, which is the item directly
           * under it and the one already ticked.
           */
          title: _.title || "This space",
          items: [
            N("row", "Row", fe("row")),
            N("column", "Column", fe("column")),
            // Everything in this space in one strip: the panes as tabs, and a
            // desktop among them as a tab of its own, keeping the windows on it.
            N("tabs", "Tabs", () => q()),
            N("desktop", "Desktop", () => le(_) ? _ : Vr(_))
          ]
        },
        {
          id: "about-around",
          title: me ? `Around ${un(me)}` : "",
          items: me ? [
            // Keeping this space's bar drops the one inside, so it is offered
            // only where the space inside has no name to be dropped with it.
            ...me.title ? [] : [_e("merge-around-keep-this", u, _, "outer", `Keep ${ke}`)],
            ..._.title ? [] : [_e("merge-around-keep-that", u, _, "inner", `Keep ${un(me)}`)]
          ] : []
        },
        {
          id: "about-inside",
          title: se ? `Inside ${un(se)}` : "",
          items: se ? [
            ..._.title ? [] : [_e("merge-inside-keep-that", ue, se, "outer", `Keep ${un(se)}`)],
            ...se.title ? [] : [_e("merge-inside-keep-this", ue, se, "inner", `Keep ${ke}`)]
          ] : []
        },
        {
          id: "about-tabs",
          title: te ? rs(te) : "",
          items: te ? ls(te, Le(_)) : []
        }
      ]);
    }
    function ul(u) {
      const v = k.value;
      return v && pe(u, v) ? v : void 0;
    }
    function dl(u) {
      const v = d.value, _ = l.value.get(u);
      if (!v || !_) return [];
      const L = a.menu ? il(v, _) : null, N = ol(u);
      N.length && L?.panel.length && N.push({ separator: !0 }), L && N.push(...L.panel);
      const q = fl(_);
      q && (N.length && N.push({ separator: !0 }), N.push(q));
      const fe = ss([
        { id: "about-panel", title: _.title, items: N },
        { id: "about-tabs", title: L?.tabsTitle ?? "", items: L?.tabs ?? [] }
      ]);
      return a.paneMenu ? a.paneMenu(_, fe) : fe;
    }
    function fl(u) {
      const v = a.popOut?.(u);
      return !v || a.solo && d.value && Qe(d.value).length <= 1 ? null : {
        id: "pop-out",
        label: "Pop out to new window",
        action: () => {
          const _ = x.value?.querySelector(`.dc-pane[data-dc-panel="${CSS.escape(u.id)}"]`);
          Ud(v, Wd(_)) && s("panel-pop-out", { panel: u.id, href: v });
        }
      };
    }
    function pl(u, v) {
      return o[`${u}-${v}`] ?? o[u];
    }
    function is(u, v, _, L) {
      return pl(u, v.id)?.({ panel: v, view: _, active: L });
    }
    Vd({
      panelFor: (u) => l.value.get(u) ?? null,
      viewFor: T,
      setView: V,
      movable: p(() => a.movable),
      resizable: p(() => a.resizable),
      minPanelSize: p(() => a.minPanelSize),
      spaceNames: p(() => a.spaceNames),
      focused: k,
      dragging: g,
      dropTarget: y,
      moving: $,
      framing: w,
      canMove: U,
      focus(u) {
        k.value !== u && (k.value = u, s("panel-activate", u));
      },
      selectPanel: qn,
      beginDrag: tt,
      toggleMoveMode: el,
      nudge: nl,
      setSizes: al,
      frameOf: (u) => d.value ? Ee(d.value, u) : null,
      beginFrameDrag: Qr,
      nudgeFrame: Zr,
      raise: De,
      maximized: Bt,
      toggleMaximize: qt,
      minimized: D,
      toggleMinimize: Te,
      beginFrameDragAt: ns,
      raiseAt: X,
      toggleMaximizeAt: Re,
      toggleMinimizeAt: ee,
      menuFor: dl,
      spaceMenu: cl,
      registerMenu: ll,
      closable: as,
      close: sl,
      renderContent: (u, v, _) => is("panel", u, v, _),
      renderActions: (u, v, _) => is("actions", u, v, _),
      layout: d
    });
    const vl = p(() => {
      if (!(!a.accent && !a.tokens))
        return { ...a.tokens, ...a.accent ? { "--dc-accent": a.accent } : {} };
    }), hl = () => {
      const u = g.value, v = C.value;
      return !u || !v ? null : yl(
        "div",
        {
          class: "dc-window__ghost",
          style: { left: `${v.x}px`, top: `${v.y}px` },
          "aria-hidden": "true"
        },
        l.value.get(u)?.title ?? u
      );
    };
    return t({
      /** The layout as rendered, reconciled against the current panels. */
      layout: d,
      /** Moves a panel programmatically — the same operation a drag performs. */
      move(u, v, _, L) {
        const N = d.value;
        N && ve(pn(N, u, v, _, L), {
          panel: u,
          target: v,
          edge: _,
          ...L === void 0 ? {} : { index: L }
        });
      },
      /** Brings a panel's tab to the top of its group. */
      select(u) {
        const v = d.value;
        v && (r.value = zt(v, u));
      },
      /** Lifts a panel onto the float holding `near`, as a window of its own. */
      float(u, v, _) {
        const L = d.value;
        L && ve(Es(L, u, v, _), {
          panel: u,
          target: v,
          edge: "float",
          rect: _
        });
      },
      /** Puts a floating frame somewhere else, or makes it another size. */
      setRect(u, v) {
        const _ = d.value;
        if (!_) return;
        const L = Cd(_, u, v);
        if (L === _) return;
        r.value = L;
        const N = Ee(L, u);
        N && s("frame-change", { panel: u, rect: N.rect });
      },
      /**
       * Puts a panel on one of its views, the way its menu would — the way a pane
       * whose space fixed its view, or took its bar away, is switched at all.
       */
      setView: V,
      /** Brings a floating frame to the front of its stack. */
      raise: De,
      /** Fills the float with a window, or puts it back where it was. */
      toggleMaximize: qt,
      /** Rolls a window up to its title bar, or unrolls it. */
      toggleMinimize: Te
    }), (u, v) => (f(), m("div", {
      ref_key: "root",
      ref: x,
      class: "dc-shell dc-window",
      "data-dc-theme": e.theme,
      "data-dc-dragging": g.value ? "true" : "false",
      "data-dc-docking": b.value ? "true" : "false",
      style: Ae(vl.value)
    }, [
      d.value ? (f(), Z(Vf, {
        key: 0,
        node: d.value,
        path: []
      }, null, 8, ["node"])) : (f(), m("p", Hf, " This window has no panels. ")),
      ce(hl),
      M("p", Wf, F(R.value), 1)
    ], 12, Kf));
  }
}), jf = /* @__PURE__ */ de(Uf, [["__scopeId", "data-v-42ff8b04"]]), Gf = (e) => Math.round(e * 1e3) / 1e3;
function Qn(e, t) {
  return e.title && (t.t = e.title), e.headless && (t.h = !0), e.fixedView && (t.v = !0), t;
}
function Xf(e) {
  return [Math.round(e.x), Math.round(e.y), Math.round(e.w), Math.round(e.h)];
}
function Zn(e) {
  const t = { b: Xf(e.rect) };
  return e.title && (t.t = e.title), e.maximized && (t.M = !0), e.minimized && (t.m = !0), t;
}
function Yf(e) {
  if (e.kind !== "group" || e.panels.length !== 1) return null;
  const t = e.panels[0];
  return typeof t != "string" || e.title || e.headless || e.fixedView || e.places ? null : t;
}
function _a(e) {
  const t = Yf(e);
  return t !== null ? t : jr(e);
}
function jr(e) {
  if (e.kind === "group") {
    const n = { g: e.panels.map((a) => typeof a == "string" ? a : jr(a)) };
    return e.active !== void 0 && e.active !== e.panels[0] && (n.a = e.active), e.places && (n.p = e.places.map(Zn)), Qn(e, n);
  }
  if (e.kind === "split") {
    const n = { [e.direction === "row" ? "r" : "c"]: e.children.map(_a) };
    return e.sizes && (n.z = e.sizes.map(Gf)), e.places && (n.p = e.places.map(Zn)), Qn(e, n);
  }
  const t = {
    f: e.frames.map((n) => ({ n: _a(n.node), ...Zn(n) }))
  };
  return Qn(e, t);
}
class Gr extends Error {
}
const Pe = () => {
  throw new Gr();
}, ya = (e) => typeof e == "object" && e !== null && !Array.isArray(e), St = (e) => Array.isArray(e) ? e : Pe(), es = (e) => e === void 0 ? void 0 : typeof e == "string" ? e : Pe(), Xr = (e) => St(e).map((t) => typeof t == "number" && Number.isFinite(t) ? t : Pe());
function Qf(e) {
  const [t, n, a, s] = Xr(e);
  return s === void 0 && Pe(), { x: t, y: n, w: a, h: s };
}
function Jn(e) {
  if (!ya(e)) return Pe();
  const t = { rect: Qf(e.b) }, n = es(e.t);
  return n && (t.title = n), e.M === !0 && (t.maximized = !0), e.m === !0 && (t.minimized = !0), t;
}
function ea(e, t) {
  const n = es(e.t);
  return n && (t.title = n), e.h === !0 && (t.headless = !0), e.v === !0 && (t.fixedView = !0), t;
}
function kn(e) {
  if (typeof e == "string") return { kind: "group", panels: [e] };
  if (!ya(e)) return Pe();
  if (e.g !== void 0) {
    const n = St(e.g).map((r) => typeof r == "string" ? r : kn(r));
    n.length === 0 && Pe();
    const a = { kind: "group", panels: n }, s = es(e.a);
    return s !== void 0 && (a.active = s), e.p !== void 0 && (a.places = St(e.p).map(Jn)), ea(e, a);
  }
  const t = e.r !== void 0 ? "row" : e.c !== void 0 ? "column" : null;
  if (t) {
    const n = St(t === "row" ? e.r : e.c).map(kn), a = { kind: "split", direction: t, children: n };
    return e.z !== void 0 && (a.sizes = Xr(e.z)), e.p !== void 0 && (a.places = St(e.p).map(Jn)), ea(e, a);
  }
  if (e.f !== void 0) {
    const a = { kind: "float", frames: St(e.f).map((s) => !ya(s) || s.n === void 0 ? Pe() : { node: kn(s.n), ...Jn(s) }) };
    return ea(e, a);
  }
  return Pe();
}
const Yr = /[ '!:(),*@$]/, Zf = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][-+]?\d+)?$/;
function Ls(e) {
  return e !== "" && !Yr.test(e) && !/^[-\d]/.test(e) ? e : `'${e.replace(/[!']/g, (n) => `!${n}`)}'`;
}
function wa(e) {
  return e === null ? "!n" : e === !0 ? "!t" : e === !1 ? "!f" : typeof e == "number" ? Number.isFinite(e) ? String(e) : "!n" : typeof e == "string" ? Ls(e) : Array.isArray(e) ? `!(${e.map(wa).join(",")})` : `(${Object.entries(e).map(([t, n]) => `${Ls(t)}:${wa(n)}`).join(",")})`;
}
function Jf(e) {
  let t = 0;
  const n = () => e[t], a = (o) => e[t++] === o ? void 0 : Pe(), s = () => {
    if (n() === "'") {
      t++;
      let l = "";
      for (; ; ) {
        const c = e[t++];
        if (c === void 0) return Pe();
        if (c === "'") return l;
        if (c === "!") {
          const d = e[t++];
          d !== "!" && d !== "'" && Pe(), l += d;
        } else l += c;
      }
    }
    const o = t;
    for (; t < e.length && !Yr.test(e[t]); ) t++;
    return t === o && Pe(), e.slice(o, t);
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
        h !== "," && Pe();
      }
    }
    if (o === "!") {
      t++;
      const c = e[t++];
      if (c === "t") return !0;
      if (c === "f") return !1;
      if (c === "n") return null;
      if (c !== "(") return Pe();
      const d = [];
      if (n() === ")")
        return t++, d;
      for (; ; ) {
        d.push(r());
        const h = e[t++];
        if (h === ")") return d;
        h !== "," && Pe();
      }
    }
    if (o === "'") return s();
    const l = s();
    return Zf.test(l) ? Number(l) : l;
  }, i = r();
  return t !== e.length && Pe(), i;
}
function ta(e) {
  return wa(_a(e));
}
function ep(e) {
  try {
    return kn(Jf(e));
  } catch (t) {
    if (t instanceof Gr) return null;
    throw t;
  }
}
function na(e, t) {
  for (const n of e.replace(/^[?]/, "").split("&")) {
    const a = n.indexOf("="), s = a === -1 ? n : n.slice(0, a);
    if (ts(s) === t) return a === -1 ? "" : n.slice(a + 1);
  }
  return null;
}
function aa(e, t, n) {
  const a = e.replace(/^[?]/, "").split("&").filter(Boolean), s = a.findIndex((i) => {
    const o = i.indexOf("=");
    return ts(o === -1 ? i : i.slice(0, o)) === t;
  }), r = n === null ? null : `${encodeURIComponent(t)}=${n}`;
  return s === -1 ? r && a.push(r) : r ? a[s] = r : a.splice(s, 1), a.length ? `?${a.join("&")}` : "";
}
function ts(e) {
  try {
    return decodeURIComponent(e.replace(/\+/g, " "));
  } catch {
    return e;
  }
}
const tp = [
  [/%2C/g, ","],
  [/%3A/g, ":"],
  [/%2F/g, "/"],
  [/%40/g, "@"],
  [/%24/g, "$"],
  [/%20/g, "+"]
], Is = (e) => {
  let t = encodeURIComponent(e);
  for (const [n, a] of tp) t = t.replace(n, a);
  return t;
};
function wp(e, t) {
  const { adapter: n } = t, a = t.param ?? "w", s = t.soloParam ?? "solo", r = t.delay ?? 200, i = () => Pt(t.home) ?? null;
  let o = na(n.search.value, a), l = null;
  const c = () => {
    l !== null && clearTimeout(l), l = null;
  }, d = (y) => y === null ? i() : ep(ts(y)) ?? i(), h = () => {
    c();
    const y = e.value, b = i(), $ = y ? ta(y) : null, w = $ === null || b && $ === ta(b) ? null : Is($);
    o = w;
    const C = aa(n.search.value, a, w);
    C !== n.search.value && n.replace(C);
  }, k = d(o);
  return k && (e.value = k), we(e, () => {
    c(), l = setTimeout(h, r);
  }), we(n.search, (y) => {
    const b = na(y, a);
    if (b === o) return;
    c(), o = b;
    const $ = d(b);
    $ && (e.value = $);
  }), An() && Zt(() => l !== null ? h() : void 0), {
    flush: () => l !== null ? h() : void 0,
    popOutHref: (y) => {
      let b = aa(n.search.value, a, Is(ta($d(Xe(y)))));
      return b = aa(b, s, "1"), n.href ? n.href(b) : `${n.path.value}${b}`;
    },
    solo: p(() => na(n.search.value, s) !== null)
  };
}
function kp(e = "", t = "/") {
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
function Ns(e) {
  const t = e.indexOf("?");
  if (t === -1) return "";
  const n = e.slice(t), a = n.indexOf("#");
  return Be(a === -1 ? n : n.slice(0, a));
}
function bp(e) {
  const t = H(Ns(e.currentRoute.value.fullPath)), n = p(() => e.currentRoute.value.path), a = we(
    () => e.currentRoute.value.fullPath,
    (s) => {
      t.value = Ns(s);
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
const np = {
  DataShell: nd,
  ShellHeader: vr,
  QueryPanel: mr,
  RecordActions: _r,
  ResultsArea: Pr,
  FacetControl: hr,
  SegmentedControl: hd,
  StatusPill: nn,
  WindowFrame: jf,
  WindowPane: Ur,
  ListView: fa,
  CardsView: kr,
  GridView: br,
  ImagesView: $r,
  TableView: Cr,
  LinksView: xr,
  PreviewView: Mr,
  TypeCardsView: Sr
}, $p = {
  install(e, t = {}) {
    const n = t.prefix ?? "";
    for (const [a, s] of Object.entries(np))
      e.component(`${n}${a}`, s);
    t.route && e.provide(Ds, t.route);
  }
};
export {
  Pn as CASCADE_STEP,
  lp as COLUMN_BREAKPOINTS,
  rp as COLUMN_ROLES,
  kr as CardsView,
  Ms as ColumnCell,
  bl as DEFAULT_ENTITY_VIEW,
  gt as DEFAULT_FRAME,
  sa as DEFAULT_SORT,
  kl as DEFAULT_VIEW,
  yo as DRAFT_DELAY,
  nd as DataShell,
  ra as EMPTY_CELL,
  ur as ENTITY_ALL,
  Sn as ENTITY_TERM,
  Qt as EXPRESSION_TERM,
  Fa as FACET_PREFIX,
  hr as FacetControl,
  br as GridView,
  $p as HeaderContentLayoutPlugin,
  $r as ImagesView,
  xr as LinksView,
  fa as ListView,
  Ct as MINIMIZED_GAP,
  Ar as MINIMIZED_HEIGHT,
  pa as MINIMIZED_WIDTH,
  Er as MIN_FRAME,
  ks as MOCK_TINTS,
  cp as MenuBar,
  Va as MenuButton,
  Da as MenuList,
  an as MetricDrill,
  Ja as PANE_CONTEXT_KEY,
  La as PARAM_DIR,
  Ta as PARAM_ENTITY,
  Ia as PARAM_EXPR,
  Na as PARAM_PAGE,
  za as PARAM_SORT,
  Ra as PARAM_VIEW,
  Ba as PinStar,
  Mr as PreviewView,
  qa as QueryMark,
  mr as QueryPanel,
  dn as RECORD_STATUSES,
  Sa as RESULT_FIELDS,
  Ds as ROUTE_ADAPTER_KEY,
  _r as RecordActions,
  Pr as ResultsArea,
  cr as SHELL_CONTEXT_KEY,
  sp as SHELL_THEMES,
  sn as ScopeMark,
  hd as SegmentedControl,
  $t as SelectTick,
  ip as ShellCard,
  vr as ShellHeader,
  da as StandingControl,
  nn as StatusPill,
  Cr as TableView,
  Sr as TypeCardsView,
  Bs as VIEW_KINDS,
  $l as VIEW_LABELS,
  Za as WINDOW_CONTEXT_KEY,
  jf as WindowFrame,
  Ur as WindowPane,
  Rr as activePanel,
  xt as activeTab,
  Ea as addTerm,
  Pa as andExpression,
  xd as axisOf,
  Wa as cascade,
  Xs as cellFull,
  en as cellText,
  gn as cellTextOf,
  He as cellValue,
  Kn as changesResults,
  Xn as clampRect,
  Br as collapseSpace,
  Id as collapseToTabs,
  dp as column,
  fs as columnAlign,
  ps as columnClass,
  ds as columnKey,
  Qs as columnShortcut,
  Dl as columnShortcutOf,
  la as columnTruncates,
  El as columnsFor,
  Ml as countPages,
  wl as createHistoryAdapter,
  kp as createMemoryAdapter,
  ro as createMockDataSource,
  bp as createVueRouterAdapter,
  ep as decodeLayout,
  Rl as defaultCellText,
  zs as defaultLayout,
  Ca as defaultQuery,
  Yt as defaultViewFor,
  Wn as drillExpression,
  As as dropIntoSpace,
  Ft as emptyFacetState,
  $a as emptyFacetValue,
  ta as encodeLayout,
  sr as excludingTerm,
  Mn as expandShortcuts,
  Et as findEntity,
  it as findSort,
  fp as fixedView,
  Ha as float,
  Es as floatPanel,
  Vr as floatSplit,
  Nd as floatTabs,
  mn as fnv1a,
  Vs as focusEntity,
  Mt as formatCount,
  Sl as formatDate,
  st as formatExpression,
  Cl as formatMetric,
  Pl as formatOrdinal,
  tn as formatTerm,
  Fn as frame,
  ht as frameAt,
  Ee as frameOf,
  ma as framePathOf,
  Le as frontPanel,
  no as generateRows,
  up as group,
  Tt as groupOf,
  Md as groups,
  Us as hasActiveFacets,
  pe as hasPanel,
  $d as headless,
  Kt as insertPanel,
  Ut as isChoosable,
  op as isEntityScoped,
  Ws as isFacetActive,
  le as isFloat,
  J as isGroup,
  ot as isMaximized,
  mt as isMinimized,
  ye as isPanelTab,
  xa as isPristineQuery,
  Dt as isSplit,
  Ke as isTabOf,
  Ma as isTypeCardsQuery,
  qs as isViewKind,
  ys as joinExpression,
  rr as liftTerm,
  Vl as matchesExpression,
  ao as matchesFacets,
  Sd as maximizeFrame,
  Ed as maximizeFrameAt,
  Dd as mergeSpace,
  Pd as minimizeFrame,
  Ad as minimizeFrameAt,
  pn as movePanel,
  Gt as moveTab,
  Kl as negateTerm,
  ct as nodeAt,
  Xt as nodeTitle,
  Se as normalizeLayout,
  Be as normalizeSearch,
  Ya as normalizeSizes,
  Hr as onlySpace,
  Ud as openPopOut,
  Ul as oppositeTerm,
  Qe as panelIds,
  Xe as panelNode,
  Cs as panelTabs,
  Ie as parseExpression,
  vo as parseQuery,
  Wd as popOutRect,
  Ki as presentParts,
  yr as presentRow,
  In as pressOptions,
  Wr as providePaneContext,
  lo as provideShellContext,
  Vd as provideWindowContext,
  Yn as raiseFrame,
  jt as raiseFrameAt,
  Td as raisedPath,
  Xl as readDraft,
  js as reconcileFacets,
  qd as reconcileLayout,
  ar as recordTerm,
  ia as refineExpression,
  _t as removePanel,
  yt as replaceAt,
  Ss as resizeRect,
  Rs as resizeSplit,
  Rn as resolveView,
  Ge as roleColumn,
  Gs as roleColumns,
  En as rootSpace,
  ja as row,
  Tl as rowKey,
  oa as sameTerm,
  zn as scopeTerm,
  Wt as scopeTermFor,
  ir as scopedEntity,
  jn as serializeQuery,
  zt as setActivePanel,
  Cd as setFrameRect,
  Ps as setFrameRectAt,
  wn as setSizesAt,
  hp as setSplitDirection,
  rt as sizesOf,
  Hs as sortsFor,
  Ce as spaceChrome,
  Ot as spaceTitle,
  Ua as split,
  Wl as splitExpression,
  Ts as spreadTabs,
  mo as summarizeQuery,
  Oa as summaryTerms,
  yn as swapPanels,
  Ka as tabNode,
  ln as tabPanels,
  Aa as termStanding,
  Kr as tileFloat,
  mp as toFloat,
  gp as toTiled,
  pp as toggleMaximized,
  vp as toggleMinimized,
  ou as useColumns,
  wo as useDraft,
  No as useEntityCounts,
  xu as useEntityPreviews,
  wp as useLayoutRoute,
  _p as usePaneContext,
  yp as usePaneMenu,
  bt as usePresentedRows,
  go as useQueryState,
  Do as useRecordNames,
  _o as useResults,
  be as useShellContext,
  Dn as useWindowContext,
  us as viewAcross,
  ca as withStanding,
  or as withoutOwnScope,
  Hl as withoutTerm
};
