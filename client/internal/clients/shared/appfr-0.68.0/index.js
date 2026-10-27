import { ref as V, computed as p, inject as St, provide as ln, getCurrentInstance as rs, shallowRef as ft, toValue as ut, watch as be, onScopeDispose as Dt, getCurrentScope as Vn, defineComponent as ae, useSlots as cn, onBeforeUnmount as Ie, openBlock as f, createElementBlock as h, createElementVNode as E, unref as L, renderSlot as we, toDisplayString as N, Fragment as te, renderList as he, createCommentVNode as T, withModifiers as Qe, normalizeClass as Je, withDirectives as en, withKeys as bn, normalizeStyle as xe, vModelText as Wo, nextTick as yt, onMounted as un, resolveComponent as as, createBlock as Y, useId as Kn, Teleport as Wn, createVNode as de, createTextVNode as Ae, withCtx as Ee, reactive as Ca, resolveDynamicComponent as jn, createSlots as Er, useModel as Tn, onBeforeUpdate as jo, normalizeProps as Uo, guardReactiveProps as Go, mergeModels as Ln, vShow as On, Comment as Yo, Text as Xo, readonly as Qo, mergeProps as Zo, h as Jo, watchEffect as el } from "vue";
const ss = Symbol("dc.routeAdapter");
function De(e) {
  if (!e) return "";
  const t = e.replace(/^[?]/, "");
  return t ? `?${t}` : "";
}
function tl() {
  const e = typeof window < "u", t = V(e ? De(window.location.search) : ""), n = V(e ? window.location.pathname : "/"), r = () => {
    t.value = De(window.location.search), n.value = window.location.pathname;
  };
  e && window.addEventListener("popstate", r);
  const a = (s, l, i) => {
    const o = De(s);
    if (!e) {
      t.value = o, i !== void 0 && (n.value = i);
      return;
    }
    const c = i === void 0 || i === window.location.pathname ? `${window.location.pathname}${o}${window.location.hash}` : `${i}${o}`;
    l === "push" ? window.history.pushState(window.history.state, "", c) : window.history.replaceState(window.history.state, "", c), t.value = o, n.value = window.location.pathname;
  };
  return {
    search: t,
    path: n,
    href(s, l) {
      return e ? l !== void 0 && l !== window.location.pathname ? `${l}${De(s)}` : `${window.location.pathname}${De(s)}${window.location.hash}` : `${l ?? n.value}${De(s)}`;
    },
    push: (s, l) => a(s, "push", l),
    replace: (s, l) => a(s, "replace", l),
    dispose: () => {
      e && window.removeEventListener("popstate", r);
    }
  };
}
function nl(e, t) {
  const n = p(t.detached), r = p(() => n.value ? "" : e.search.value), a = p(() => n.value ? t.path() : e.path.value);
  return {
    search: r,
    path: a,
    push(s, l) {
      n.value ? e.push(s, l ?? t.path()) : e.push(s, l);
    },
    replace(s, l) {
      n.value ? e.push(s, l ?? t.path()) : e.replace(s, l);
    },
    href(s, l) {
      const i = l ?? (n.value ? t.path() : void 0);
      return e.href ? e.href(s, i) : `${i ?? e.path.value}${De(s)}`;
    }
  };
}
const os = ["list", "cards", "grid", "images", "table", "links", "preview"], Lv = [
  "minimal",
  "mono-size",
  "dark",
  "light",
  "auto",
  "macos",
  "windows",
  "inherit"
], Ut = ["ok", "running", "queued", "review", "failed"], Ov = [...Ut, "neutral", "accent"], Rv = [
  "identity",
  "reference",
  "metric",
  "state",
  "updated",
  "image",
  "tint"
], zv = [480, 620, 760, 900, 1100];
function Yt(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n++)
    t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
  return Math.abs(t);
}
function rl(e) {
  if (!Number.isFinite(e)) return "—";
  const t = Math.abs(e);
  return t >= 1e6 ? `${(e / 1e6).toFixed(1)}m` : t >= 1e3 ? `${(e / 1e3).toFixed(1)}k` : String(Math.round(e));
}
function Rn(e) {
  if (!Number.isFinite(e)) return "—";
  const t = Math.round(e), n = Math.abs(t);
  return n < 1e3 ? String(t) : n < 9950 ? `${(t / 1e3).toFixed(1)}k` : n < 999500 ? `${Math.round(t / 1e3)}k` : `${(t / 1e6).toFixed(1)}m`;
}
function Wt(e) {
  return Number.isFinite(e) ? Math.round(e).toLocaleString("en-US") : "—";
}
function al(e) {
  const t = new Date(e);
  if (Number.isNaN(t.getTime())) return "—";
  const n = String(t.getUTCDate()).padStart(2, "0"), r = String(t.getUTCMonth() + 1).padStart(2, "0");
  return `${n}.${r}.${t.getUTCFullYear()}`;
}
function sl(e) {
  return String(e + 1).padStart(2, "0");
}
function Iv(e, t) {
  if (!e) return "—";
  const n = new Date(e);
  return Number.isNaN(n.getTime()) ? "—" : n.toLocaleString(t, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function ol(e) {
  if (e == null || !Number.isFinite(e) || e < 0) return "—";
  if (e < 1e3) return `${e} B`;
  const t = ["kB", "MB", "GB", "TB"];
  let n = e, r = -1;
  for (; n >= 1e3 && r < t.length - 1; )
    n /= 1e3, r += 1;
  return `${n < 100 ? n.toFixed(1) : Math.round(n)} ${t[r]}`;
}
function ll(e) {
  if (!e || !Number.isFinite(e)) return "—";
  if (e < 1e3) return `${Math.round(e)}ms`;
  const t = e / 1e3;
  return t < 60 ? `${t.toFixed(1)}s` : `${Math.floor(t / 60)}m ${Math.round(t % 60)}s`;
}
function il(e) {
  if (e == null || !Number.isFinite(e) || e <= 0)
    return "—";
  const t = Math.floor(e / 60);
  return t ? `${t}:${String(e % 60).padStart(2, "0")}` : `${e}s`;
}
function cl(e) {
  return e == null || !Number.isFinite(e) ? "—" : `${Math.round(e * 100)}%`;
}
function ul(e) {
  return e.replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "");
}
const dl = "cards", fl = "table";
function tn(e, t = {}) {
  const n = (a) => a && ls(a) ? a : void 0;
  if (e === null) return n(t.view) ?? dl;
  const r = t.landing === "entity" ? n(t.view) : void 0;
  return n(t.entityView) ?? r ?? fl;
}
function Ea(e, t, n, r = {}) {
  return e === tn(t, r) ? tn(n, r) : e;
}
const Pr = "updated";
function ls(e) {
  return typeof e == "string" && os.includes(e);
}
const pl = {
  list: "List",
  cards: "Cards",
  grid: "Grid",
  images: "Images",
  table: "Table",
  links: "Links",
  preview: "Preview"
};
function jr(e, t) {
  const [n] = t ?? [];
  return n === void 0 || t?.includes(e) ? e : n;
}
function Ar(e) {
  return typeof e.count == "number" ? Rn(e.count) : e.count;
}
function nn(e, t) {
  return t ? e.entities.find((n) => n.key === t) ?? null : null;
}
function is(e, t = {}) {
  const n = nn(e, t.entity), r = e.entities[0];
  if (!n && !r) throw new Error(`Schema "${e.key}" declares no entities`);
  return n ?? r;
}
function cs(e, t = null) {
  return e?.columns ?? t?.columns ?? [];
}
function Un(e, t = null) {
  if (e?.sorts?.length) return e.sorts;
  const n = /* @__PURE__ */ new Set(), r = [];
  for (const a of cs(e, t))
    !a.sort || n.has(a.sort) || (n.add(a.sort), r.push({ key: a.sort, label: (a.label ?? a.sort).toLowerCase() }));
  return r;
}
const vl = { key: Pr, label: Pr };
function mt(e, t, n = null) {
  const r = Un(e, n);
  return (t ? r.find((s) => s.key === t) : void 0) ?? r.find((s) => s.key === Pr) ?? r[0] ?? vl;
}
function hl(e) {
  switch (e.kind) {
    case "chips":
      return { kind: "chips", selected: [] };
    case "range":
      return { kind: "range", min: null, max: null };
    case "toggle":
      return { kind: "toggle", on: !1 };
  }
}
function ml(e) {
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
function Ur(e) {
  return e.entity === null && e.expr.trim() === "";
}
function Nv(e) {
  return e.entity !== null;
}
function Gr(e, t) {
  return e.entity === null && jr(e.view, t) === "cards";
}
function gl(e, t) {
  return t <= 0 ? 1 : Math.max(1, Math.ceil(e / t));
}
function Yr(e, t = {}) {
  const r = t.landing === "entity" ? is(e, t) : null;
  return {
    entity: r?.key ?? null,
    view: tn(r?.key ?? null, t),
    sort: mt(r, t.sort).key,
    dir: t.dir === "asc" ? "asc" : "desc",
    expr: "",
    page: 1
  };
}
const Xr = ["entity", "sort", "dir", "expr"];
function vr(e) {
  return Xr.some((t) => t in e);
}
const it = "—";
function Xe(e, t) {
  return e.find((n) => n.role === t);
}
function us(e, t) {
  return e.filter((n) => n.role === t);
}
function yl(e, t) {
  const n = (t ? t.columns : e?.columns) ?? [], r = t ? "scoped" : "everything";
  return n.filter(
    (a) => a.role !== "tint" && ((a.when ?? "always") === "always" || a.when === r)
  );
}
const _l = ["id", "entityKey", "entityLabel"];
function He(e, t) {
  if (e.value) return e.value(t);
  const n = e.field ?? e.key;
  if (n !== void 0) {
    if (t.fields && n in t.fields) return t.fields[n];
    if (_l.includes(n))
      return t[n];
  }
}
function Pa(e, t) {
  const n = e.key ?? e.field ?? e.label;
  return n?.trim() ? n.trim() : `column-${t}`;
}
function wl(e, t) {
  return e.id?.trim() ? e.id : `${e.entityKey || "row"}-${t}`;
}
function kl(e, t) {
  if (e == null || e === "") return it;
  if (t === "number") {
    const n = typeof e == "number" ? e : Number(e);
    return Number.isFinite(n) ? rl(n) : String(e);
  }
  return t === "date" ? al(String(e)) : Array.isArray(e) ? e.length ? e.join(", ") : it : String(e);
}
function Bt(e, t) {
  const n = He(e, t);
  return e.format ? e.format(n, t) : kl(n, e.kind);
}
function bl(e) {
  return typeof e == "number" ? Number.isFinite(e) ? String(e) : "" : typeof e == "string" ? e : Array.isArray(e) ? e.join(", ") : "";
}
function ds(e, t) {
  const n = Bt(e, t), r = bl(He(e, t));
  return r && r !== n ? r : n;
}
function Sn(e, t) {
  return e ? Bt(e, t) : "";
}
function Aa(e) {
  return e.align ? e.align : e.kind === "number" || e.kind === "ordinal" ? "right" : "left";
}
const $l = {
  ordinal: "dc-table__num",
  number: "dc-table__number",
  date: "dc-table__date",
  status: "dc-table__state"
};
function Ta(e) {
  return [$l[e.kind ?? "text"], e.class].filter(Boolean).join(" ");
}
function Tr(e) {
  if (e.truncate !== void 0) return e.truncate;
  const t = e.kind ?? "text";
  return t === "text" || t === "number" || t === "date";
}
const xl = /^([A-Za-z_][\w.-]*)\s*(>=|<=|:|=|>|<)\s*(.*)$/, La = "-?(?:\\d+\\.?\\d*|\\.\\d+)", Ml = new RegExp(`^(${La})?\\.\\.(${La})?$`);
function Gn(e) {
  const t = Ml.exec(e.trim());
  if (!t || t[1] === void 0 && t[2] === void 0) return null;
  const n = t[1] === void 0 ? null : Number(t[1]), r = t[2] === void 0 ? null : Number(t[2]);
  return n !== null && r !== null && n > r ? { min: r, max: n } : { min: n, max: r };
}
function Sl(e) {
  return `${e.min ?? ""}..${e.max ?? ""}`;
}
function rn(e) {
  return e.kind === "field" && (e.comparator === ":" || e.comparator === "=") && Gn(e.value) !== null;
}
function Cl(e) {
  const t = [];
  let n = "", r = null;
  const a = () => {
    n && t.push(n), n = "";
  };
  for (let s = 0; s < e.length; s++) {
    const l = e[s];
    if (r) {
      l === r ? r = null : n += l;
      continue;
    }
    if (l === '"' || l === "'") {
      r = l;
      continue;
    }
    if (/\s/.test(l)) {
      if (/(?:>=|<=|[:=><])$/.test(n) || e.slice(s + 1).match(/^\s*(>=|<=|[:=><])/) && n) continue;
      a();
      continue;
    }
    n += l;
  }
  return a(), t;
}
function Te(e) {
  const t = e.trim();
  if (!t) return [];
  const n = [];
  let r = [];
  for (const a of Cl(t)) {
    const s = a.toUpperCase();
    if (s === "AND" || s === "&&") continue;
    if (s === "OR" || s === "||") {
      r.length && n.push(r), r = [];
      continue;
    }
    const l = a.length > 1 && a.startsWith("-"), i = l ? a.slice(1) : a, o = l ? { negated: !0 } : {}, c = xl.exec(i);
    c && c[3] !== "" ? r.push({
      kind: "field",
      field: c[1].toLowerCase(),
      comparator: c[2],
      value: c[3],
      ...o
    }) : r.push({ kind: "text", value: i, ...o });
  }
  return r.length && n.push(r), n;
}
const gt = (e) => e.toLowerCase().replace(/\s+/g, ""), fs = [
  ["status", "state"],
  ["state", "state"],
  ["updated", "updated"],
  ["date", "updated"],
  ["name", "identity"],
  ["ref", "reference"]
];
function El(e, t, n) {
  const r = gt(e), a = n.columns ?? [];
  if (r === "entity") return t.entityKey;
  if (e in t.fields) return t.fields[e];
  const s = a.find(
    (c) => c.key?.toLowerCase() === e.toLowerCase() || c.field?.toLowerCase() === e.toLowerCase() || c.label !== void 0 && gt(c.label) === r
  );
  if (s) return He(s, t);
  const l = n.facets.find(
    (c) => c.key.toLowerCase() === r || gt(c.label) === r
  );
  if (l && l.key in t.fields) return t.fields[l.key];
  const i = fs.find(([c]) => c === r)?.[1];
  if (i) {
    const c = Xe(a, i);
    if (c) return He(c, t);
  }
  const o = /^metric(\d+)$/.exec(r);
  if (o) {
    const c = us(a, "metric")[Number(o[1]) - 1];
    if (c) return He(c, t);
  }
}
function dn(e) {
  return (e.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).map((t) => t.charAt(0)).join("");
}
const Oa = /^[a-z_][\w.-]*$/;
function Yn(e) {
  const t = (e.key ?? e.field)?.toLowerCase();
  if (t !== void 0) return Oa.test(t) ? t : void 0;
  const n = e.label === void 0 ? void 0 : gt(e.label);
  return n !== void 0 && Oa.test(n) ? n : void 0;
}
function Qr(e, t) {
  const n = gt(e);
  return !!t?.entities.some((r) => r.scope && gt(r.scope) === n);
}
function Pl(e, t, n) {
  const r = gt(e);
  if (r === "entity" || fs.some(([s]) => s === r) || /^metric\d+$/.test(r) || Qr(e, n)) return !0;
  const a = (s) => s !== void 0 && gt(s) === r;
  return (t.columns ?? []).some(
    (s) => a(s.key) || a(s.field) || a(s.label)
  ) || t.facets.some((s) => a(s.key) || a(s.label));
}
function an(e, t, n) {
  return t ? vs(e, (r) => {
    const a = hs(r, t, n);
    return a && Yn(a);
  }) : e;
}
function ps(e, t, n) {
  return t ? vs(e, (r) => {
    if (Qr(r, n)) return;
    const a = (t.columns ?? []).find((s) => Yn(s) === r);
    return a && ms(a, t, n);
  }) : e;
}
function Al(e, t, n) {
  if (!t || Qr(e, n)) return;
  const r = t.facets.find((a) => a.key.toLowerCase() === e);
  return r ? r.label : (t.columns ?? []).find((a) => Yn(a) === e)?.label;
}
function vs(e, t) {
  let n = !1;
  const r = Te(e).map(
    (a) => a.map((s) => {
      if (s.kind !== "field") return s;
      const l = t(s.field);
      return !l || l === s.field ? s : (n = !0, { ...s, field: l });
    })
  );
  return n ? ot(r) : e;
}
function hs(e, t, n) {
  if (!(!e || Pl(e, t, n)))
    return (t.columns ?? []).find(
      (r) => r.label !== void 0 && dn(r.label) === e
    );
}
function ms(e, t, n) {
  if (!t || e.label === void 0 || !Yn(e)) return;
  const r = dn(e.label);
  return hs(r, t, n) === e ? r : void 0;
}
function hr(e, t) {
  const n = e.toLowerCase(), r = t.toLowerCase();
  if (!r.includes("*")) return n.includes(r);
  const a = r.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(a).test(n);
}
function Ra(e, t) {
  return e.toLowerCase() === t.toLowerCase();
}
function Tl(e, t, n, r) {
  if (e.kind === "text") {
    const o = n.columns ?? [];
    return ["identity", "reference"].some((c) => {
      const u = Xe(o, c), m = u ? He(u, t) : void 0;
      return typeof m == "string" && hr(m, e.value);
    });
  }
  const a = El(e.field, t, n);
  if (a === void 0) return r?.has(e.field) ? !1 : null;
  const s = rn(e) ? Gn(e.value) : null;
  if (s) {
    if (Array.isArray(a) || typeof a == "boolean") return null;
    const o = typeof a == "number" ? a : Number(a);
    return Number.isFinite(o) ? (s.min === null || o >= s.min) && (s.max === null || o <= s.max) : null;
  }
  if (Array.isArray(a))
    return e.comparator === ":" || e.comparator === "=" ? a.some(
      (c) => e.comparator === "=" ? Ra(String(c), e.value) : hr(String(c), e.value)
    ) : null;
  if (e.comparator === ":" || e.comparator === "=") {
    if (typeof a == "boolean") {
      const o = e.value.toLowerCase();
      return o === "true" || o === "yes" ? a : o === "false" || o === "no" ? !a : null;
    }
    if (typeof a == "number") {
      const o = Number(e.value);
      return Number.isFinite(o) ? a === o : null;
    }
    return e.comparator === "=" ? Ra(String(a), e.value) : hr(String(a), e.value);
  }
  const l = Number(e.value), i = typeof a == "number" ? a : Number(a);
  return !Number.isFinite(l) || !Number.isFinite(i) ? null : Ll(e.comparator, i, l);
}
function za(e, t, n, r) {
  const a = Tl(e, t, n, r);
  return a === null ? !0 : e.negated ? !a : a;
}
function Ll(e, t, n) {
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
function Ia(e) {
  return e.kind === "field" && !e.negated && (e.comparator === ":" || e.comparator === "=") && !rn(e);
}
const Na = /* @__PURE__ */ new WeakMap();
function Ol(e) {
  if (!e?.strictScopes) return null;
  let t = Na.get(e);
  return t || (t = new Set(
    e.entities.flatMap((n) => n.scope ? [n.scope.toLowerCase()] : [])
  ), Na.set(e, t)), t;
}
function Rl(e, t, n, r) {
  if (!e.length) return !0;
  const a = Ol(r);
  return e.some((s) => {
    const l = /* @__PURE__ */ new Map();
    for (const i of s)
      Ia(i) && l.set(
        i.field,
        (l.get(i.field) ?? !1) || za(i, t, n, a)
      );
    return s.every(
      (i) => Ia(i) ? l.get(i.field) === !0 : za(i, t, n, a)
    );
  });
}
function Ba(e) {
  return /[\s"']/.test(e) ? `"${e.replace(/["']/g, "")}"` : e;
}
function $t(e) {
  const t = e.negated ? "-" : "";
  return e.kind === "text" ? t + Ba(e.value) : `${t}${e.field}${e.comparator}${Ba(e.value)}`;
}
function zl(e) {
  if (!e.negated) return { ...e, negated: !0 };
  const { negated: t, ...n } = e;
  return n;
}
function ot(e) {
  return e.filter((t) => t.length).map((t) => t.map($t).join(" ")).join(" OR ");
}
function Il(e, t, n) {
  return e.map((r, a) => a === t ? r.filter((s, l) => l !== n) : r).filter((r) => r.length);
}
function Bv(e) {
  const t = Te(e);
  if (t.length > 1) return { parts: [], text: e.trim() };
  const n = t[0] ?? [];
  return {
    parts: n.filter((r) => r.kind === "field"),
    text: n.filter((r) => r.kind === "text").map($t).join(" ")
  };
}
function Fv(e, t) {
  return [...e.map($t), t.trim()].filter(Boolean).join(" ");
}
const Fa = (e, t) => e.toLowerCase() === t.toLowerCase();
function Lr(e, t) {
  return !!e.negated == !!t.negated && gs(e, t);
}
function Nl(e, t) {
  return !!e.negated != !!t.negated && gs(e, t);
}
function gs(e, t) {
  return e.kind === "field" ? t.kind === "field" && e.field === t.field && e.comparator === t.comparator && Fa(e.value, t.value) : t.kind === "text" && Fa(e.value, t.value);
}
function Bl(e, t) {
  return t.filter((n) => !e.some((r) => Lr(r, n)));
}
function Zr(e, t) {
  return ys(e, t, (n) => n);
}
function Or(e, t) {
  return ys(
    e,
    t,
    (n, r) => n.filter((a) => !r.some((s) => Nl(a, s)))
  );
}
const Fl = /^[A-Za-z_][\w.-]*\s*(?:>=|<=|:|=|>|<)$/;
function Dl(e) {
  return ot(
    Te(e).map(
      (t) => t.filter(
        (n) => n.kind !== "text" || n.value !== "-" && !Fl.test(n.value)
      )
    ).filter((t) => t.length > 0)
  );
}
function ys(e, t, n) {
  const r = Te(e), a = Te(t);
  return r.length ? a.length ? ot(
    r.flatMap(
      (s) => a.map((l) => [...n(s, l), ...Bl(s, l)])
    )
  ) : ot(r) : ot(a);
}
const _s = (e) => e.kind === "date" || e.role === "updated";
function Hl(e) {
  if (!e) return () => 0;
  const n = (e.kind ?? "text") === "number" || e.role === "metric", r = _s(e);
  return (a, s) => {
    const l = He(e, a), i = He(e, s);
    return n ? Number(i ?? 0) - Number(l ?? 0) : r ? Date.parse(String(i ?? "")) - Date.parse(String(l ?? "")) : String(i ?? "").localeCompare(String(l ?? ""));
  };
}
function Da(e, t) {
  return !t || !_s(t) ? !1 : !Number.isFinite(Date.parse(String(He(t, e) ?? "")));
}
function ws({ query: e, schema: t, entity: n, limit: r, offset: a }, s, l) {
  const i = Te(e.expr), o = n ? [n] : t.entities;
  let c = 0;
  const u = [];
  for (const M of o)
    for (const y of s(M))
      c += 1, Rl(i, y, M, t) && u.push(y);
  const m = mt(n, e.sort, t), $ = cs(n, t).find((M) => M.sort === m.key), w = l.undatedLast ? u.filter((M) => !Da(M, $)) : u, b = l.undatedLast ? u.filter((M) => Da(M, $)) : [];
  w.sort(Hl($)), e.dir === "asc" && w.reverse();
  const g = b.length ? [...w, ...b] : w;
  return {
    // One page out of the middle. `total` stays the whole match, which is what
    // the shell counts pages with.
    rows: l.zeroIsAll && r <= 0 ? g.slice(a) : g.slice(a, a + r),
    total: u.length,
    unfiltered: u.length === c
  };
}
const zn = [
  "oklch(0.36 0.06 240)",
  "oklch(0.34 0.07 290)",
  "oklch(0.36 0.06 160)",
  "oklch(0.38 0.06 80)",
  "oklch(0.35 0.07 30)",
  "oklch(0.34 0.05 200)"
];
function Dv(e) {
  return zn[Yt(e) % zn.length];
}
function ks(e, t) {
  return `${e}_${1e4 + t * 7}`;
}
const ql = 7, Vl = 3;
function Kl(e, t, n, r) {
  const a = (t * ql + Yt(n)) % r, s = [];
  for (let l = 0; l < Math.min(Vl, r); l++)
    s.push(ks(e, (a + l) % r));
  return s;
}
function Wl(e, t) {
  switch (e.kind) {
    case "chips":
      return e.multiple ? jl(e.options, t) : e.options[t % e.options.length] ?? "";
    case "range": {
      const n = Math.max(0, e.max - e.min);
      return e.min + (n === 0 ? 0 : t % (n + 1));
    }
    case "toggle":
      return t % 3 === 0;
  }
}
function jl(e, t) {
  if (!e.length) return [];
  const n = 1 + (t >> 5) % Math.min(3, e.length), r = t % e.length, a = /* @__PURE__ */ new Set();
  for (let s = 0; s < n; s++) a.add((r + s) % e.length);
  return [...a].sort((s, l) => s - l).map((s) => e[s]);
}
function Ul(e, t) {
  const { hash: n, sample: r, revision: a, updatedAt: s } = t, l = a ? ` · rev ${a + 1}` : "";
  switch (e.role) {
    case "identity":
      return `${r[0]}${l}`;
    case "reference":
      return a ? `${r[1]}-${a + 1}` : r[1];
    case "state":
      return Ut[n % Ut.length];
    case "updated":
      return s;
    case "tint":
      return zn[n % zn.length];
    case "metric":
      return 1 + n % 940;
  }
  switch (e.kind) {
    case "number":
      return 1 + n % 940;
    case "status":
      return Ut[n % Ut.length];
    case "date":
      return s;
    default:
      return;
  }
}
function Gl(e, t = {}) {
  const n = t.population ?? 48, r = t.seed ?? "", a = t.now ?? /* @__PURE__ */ new Date("2026-08-25T00:00:00Z"), s = e.samples, l = t.scopes ?? [];
  if (!s.length) return [];
  const i = [];
  for (let o = 0; o < n; o++) {
    const c = s[o % s.length], u = Math.floor(o / s.length), m = Yt(`${r}:${e.key}:${c[0]}:${o}`), $ = ks(e.key, o), w = new Date(a.getTime() - m % 900 * 36e5).toISOString(), b = {};
    for (const g of e.columns ?? []) {
      const M = g.field ?? g.key;
      if (!M || g.value) continue;
      const y = Ul(g, {
        hash: Yt(`${m}:${M}`),
        sample: c,
        revision: u,
        updatedAt: w
      });
      y !== void 0 && (b[M] = y);
    }
    for (const g of e.facets)
      b[g.key] = Wl(g, Yt(`${m}:${g.key}`));
    for (const [g, M] of l)
      b[g] = M === e.key ? $ : Kl(M, o, g, n);
    i.push({ id: $, entityKey: e.key, entityLabel: e.label, fields: b });
  }
  return i;
}
function Yl(e = {}) {
  const t = /* @__PURE__ */ new Map(), n = (r, a) => {
    const s = t.get(r.key);
    if (s) return s;
    const l = e.scopes ?? a.entities.flatMap(
      (o) => o.scope ? [[o.scope, o.key]] : []
    ), i = Gl(r, { ...e, scopes: l });
    return t.set(r.key, i), i;
  };
  return {
    query(r) {
      return ws(r, (a) => n(a, r.schema), {
        undatedLast: !1,
        zeroIsAll: !1
      });
    }
  };
}
const Ht = "e", Xn = "v", Jr = "s", ea = "d", Ct = "q", Qn = "p", bs = "*", Xl = [
  Ht,
  Xn,
  Jr,
  ea,
  Ct,
  Qn
], Ql = [
  [/%3D/g, "="],
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
function In(e) {
  let t = encodeURIComponent(e);
  for (const [n, r] of Ql) t = t.replace(n, r);
  return t;
}
function st(e) {
  try {
    return decodeURIComponent(e.replace(/\+/g, " "));
  } catch {
    return e.replace(/\+/g, " ");
  }
}
function ta(e) {
  const t = e.replace(/^[?]/, "");
  if (!t) return [];
  const n = [];
  for (const r of t.split("&")) {
    if (!r) continue;
    const a = r.indexOf("="), s = a === -1 ? r : r.slice(0, a), l = a === -1 ? "" : r.slice(a + 1);
    n.push([st(s), l]);
  }
  return n;
}
function Zl(e) {
  return Xl.includes(e);
}
function Zn(e, t) {
  if (!(!t || e.some((n) => n.key === t)))
    return e.find((n) => dn(n.label) === t);
}
function Jl(e, t) {
  const n = dn(e.label);
  return Zn(t.entities, n)?.key === e.key ? n : e.key;
}
function $s(e, t) {
  return t ? nn(e, t) ?? Zn(e.entities, t) ?? null : null;
}
function ei(e, t) {
  const n = dn(e.label);
  return Zn(t, n)?.key === e.key ? n : e.key;
}
function ti(e, t) {
  return t.some((n) => n.key === e) ? e : Zn(t, e)?.key ?? e;
}
function ni(e, t, n = {}) {
  const r = Yr(t, n), a = new Map(ta(e)), s = a.get(Ht), l = s === void 0 ? r.entity : st(s), i = l === bs ? null : $s(t, l), o = a.get(Xn), c = o && ls(st(o)) ? st(o) : tn(i?.key ?? null, n), u = a.get(Jr), m = mt(
    i,
    u ? ti(st(u), Un(i, t)) : n.sort,
    t
  ), $ = a.get(ea), w = $ ? st($) === "asc" ? "asc" : "desc" : r.dir, b = a.get(Ct), g = a.get(Qn), M = g === void 0 ? 1 : Number(st(g)), y = Number.isFinite(M) ? Math.max(1, Math.floor(M)) : 1;
  return {
    entity: i?.key ?? null,
    view: c,
    sort: m.key,
    dir: w,
    expr: b === void 0 ? "" : an(st(b), i, t),
    page: y
  };
}
function mr(e, t, n = {}, r = "") {
  const a = Yr(t, n), s = nn(t, e.entity), l = ta(r).filter(([m]) => !Zl(m)), i = [], o = (m, $) => i.push([m, In($)]), c = s?.key ?? null;
  if (c !== a.entity && o(Ht, s ? Jl(s, t) : bs), e.view !== tn(c, n) && o(Xn, e.view), e.sort !== a.sort) {
    const m = Un(s, t), $ = m.find((w) => w.key === e.sort);
    o(Jr, $ ? ei($, m) : e.sort);
  }
  e.dir !== a.dir && o(ea, e.dir), e.expr.trim() !== "" && o(Ct, ps(e.expr, s, t)), e.page > 1 && o(Qn, String(e.page));
  const u = [
    ...l.map(([m, $]) => [In(m), $]),
    ...i
  ];
  return u.length ? `?${u.map(([m, $]) => $ === "" ? m : `${m}=${$}`).join("&")}` : "";
}
function Hv(e) {
  const t = [];
  for (const [n, r] of Object.entries(e))
    for (const a of Array.isArray(r) ? r : [r]) {
      if (typeof a != "string") continue;
      const s = In(n);
      t.push(a === "" ? s : `${s}=${In(a)}`);
    }
  return t.length ? `?${t.join("&")}` : "";
}
function qv(e, t) {
  const n = new Map(ta(e)), r = n.get(Ct), a = r === void 0 ? "" : st(r);
  if (!t) return a;
  const s = n.get(Ht);
  return an(
    a,
    s === void 0 ? null : $s(t, st(s)),
    t
  );
}
function Jn(e, t) {
  return xs(e, t.id);
}
function xs(e, t) {
  const n = e?.scope;
  return n ? Ms(n, t) : null;
}
function Ms(e, t) {
  return `${e}="${t.replace(/"/g, "")}"`;
}
function Vv(e, t) {
  const n = typeof e == "string" ? e : e?.scope;
  if (!n) return null;
  const r = t.filter((a) => a.replace(/"/g, "") !== "").map((a) => Ms(n, a));
  return r.length ? r.join(" ") : null;
}
function er(e, t) {
  if (e.kind !== "field" || t.kind !== "field") return Lr(e, t);
  const n = (r) => r.comparator === ":" || r.comparator === "=";
  return Lr(e, { ...t, comparator: n(e) && n(t) ? e.comparator : t.comparator });
}
function Nn(e, t) {
  return er(e, zl(t));
}
function Bn(e, t) {
  return Jn(
    e.entities.find((n) => n.key === t.entityKey),
    t
  );
}
function fn(e, t) {
  if (!t) return e;
  const n = e.trim();
  if (!n) return t;
  const [r] = Te(t).flat();
  if (!r) return n;
  const a = Te(n);
  return a.some((i) => i.some((o) => er(o, r))) ? n : a.some((i) => i.some((o) => Nn(o, r))) ? ot(
    a.map(
      (i) => i.map((o) => Nn(o, r) ? r : o)
    )
  ) : `${n} ${t}`;
}
function Ss(e) {
  if (!e) return null;
  const t = e.trim();
  return t ? t.startsWith("-") ? t.slice(1) : `-${t}` : null;
}
function na(e, t) {
  if (!t || !e.trim()) return null;
  const [n] = Te(t).flat();
  if (!n) return null;
  const r = Te(e).flat();
  return r.some((a) => er(a, n)) ? n.negated ? "out" : "in" : r.some((a) => Nn(a, n)) ? n.negated ? "in" : "out" : null;
}
function Cs(e, t) {
  if (!t || !e.trim()) return e;
  const [n] = Te(t).flat();
  if (!n) return e;
  const r = Te(e), a = r.map(
    (s) => s.filter((l) => !er(l, n) && !Nn(l, n))
  );
  return a.every((s, l) => s.length === r[l]?.length) ? e : ot(a);
}
function Rr(e, t, n) {
  return t ? n === null ? Cs(e, t) : fn(e, n === "out" ? Ss(t) : t) : e;
}
function Es(e) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0;
}
function tr(e) {
  return e.altKey ? { exclude: !0 } : {};
}
function gr(e, t, n, r = {}) {
  const a = Bn(e, n);
  return fn(t.expr, r.exclude ? Ss(a) : a);
}
function Ps(e, t) {
  const n = e?.scope?.toLowerCase();
  if (!n || e?.keepsScope || !t.trim()) return t;
  const r = Te(t), a = r.map(
    (s) => s.filter((l) => l.kind !== "field" || l.field !== n)
  );
  return a.every((s, l) => s.length === r[l]?.length) ? t : ot(a);
}
function As(e, t) {
  const n = t.toLowerCase();
  return e.entities.find((r) => r.scope?.toLowerCase() === n) ?? null;
}
function Ts(e, t, n) {
  if (!t || !n) return null;
  const r = As(e, t);
  return r ? { entity: r, id: n } : null;
}
function ri(e, t) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const a of t)
    for (const s of Te(a).flat()) {
      if (s.kind !== "field" || s.negated) continue;
      const l = Ts(e, s.field, s.value);
      if (!l) continue;
      const i = `${l.entity.key}:${l.id.toLowerCase()}`;
      r.has(i) || (r.add(i), n.push({ entityKey: l.entity.key, id: l.id }));
    }
  return n;
}
function Kv(e, t, n = "cards") {
  return {
    // An expression with nothing in it is no parameter, as the shell writes it.
    [Ct]: fn(e, t) || void 0,
    [Ht]: void 0,
    [Xn]: n,
    [Qn]: void 0
  };
}
const Ls = Symbol("dc.shellContext");
function ai(e) {
  const t = e.liveQuery ? e : si(e);
  return ln(Ls, t), t;
}
function si(e) {
  const t = e.draft ?? V("");
  return {
    draft: t,
    liveQuery: e.query,
    drafting: p(() => !1),
    commitDraft() {
      const n = t.value.trim();
      n && (e.setExpression(
        Or(e.query.value.expr, an(n, e.entity.value, e.schema.value))
      ), t.value = "");
    },
    abandonDraft() {
      t.value = "";
    },
    ...e
  };
}
function Ce() {
  const e = St(Ls, null);
  if (!e)
    throw new Error(
      "[appfr] No shell context found. Render this component inside <DataShell>."
    );
  return e;
}
const Fn = Symbol("dc-shell-theme");
function zr(e) {
  return {
    read: () => ({
      theme: ut(e.theme),
      accent: ut(e.accent),
      tokens: ut(e.tokens)
    })
  };
}
function oi(e, t) {
  t ? t.provide(Fn, zr(e)) : ln(Fn, zr(e));
}
function li(e) {
  const t = rs();
  ln(Fn, {
    ...zr(e),
    element: () => t?.proxy?.$el ?? null
  });
}
function ra(e) {
  const t = rs(), n = St(Fn, null), r = ft(null);
  function a() {
    const o = t?.proxy?.$el, u = (o instanceof Element ? o : o?.parentElement)?.closest(".dc-shell");
    if (!u) {
      r.value = null;
      return;
    }
    const m = {};
    for (const $ of Array.from(u.style))
      $.startsWith("--") && (m[$] = u.style.getPropertyValue($));
    r.value = { shell: u, theme: u.dataset.dcTheme, tokens: m };
  }
  const s = p(() => {
    const o = r.value;
    if (!n) return o;
    const c = n.element?.();
    return o && c && o.shell !== c && c.contains(o.shell) ? o : n.read();
  }), l = p(() => e.theme ?? s.value?.theme ?? "minimal"), i = p(() => {
    const o = s.value, c = {
      ...o?.tokens,
      ...o?.accent ? { "--dc-accent": o.accent } : {},
      ...e.tokens,
      ...e.accent ? { "--dc-accent": e.accent } : {}
    };
    return Object.keys(c).length ? c : void 0;
  });
  return { theme: l, style: i, adopt: a };
}
function Os(e) {
  return e.key.toLowerCase();
}
const ii = /* @__PURE__ */ new Set([">", ">=", "<", "<="]);
function Rs(e, t) {
  if (e.kind !== "field" || e.negated || e.field !== Os(t)) return !1;
  const n = e.comparator === ":" || e.comparator === "=";
  switch (t.kind) {
    case "range":
      return rn(e) || ii.has(e.comparator);
    case "chips":
      return n && !rn(e) && zs(t.options, e.value) !== void 0;
    case "toggle":
      return n && ci(e.value);
  }
}
function zs(e, t) {
  const n = t.toLowerCase();
  return e.find((r) => r.toLowerCase() === n);
}
function ci(e) {
  const t = e.toLowerCase();
  return t === "true" || t === "yes";
}
function Is(e, t) {
  const n = (Te(e)[0] ?? []).filter((r) => Rs(r, t));
  switch (t.kind) {
    case "range": {
      let r = null, a = null;
      for (const s of n) {
        const l = Gn(s.value), i = Number(s.value);
        l ? (l.min !== null && (r = l.min), l.max !== null && (a = l.max)) : Number.isFinite(i) && (s.comparator.startsWith(">") ? r = i : a = i);
      }
      return { kind: "range", min: r, max: a };
    }
    case "chips": {
      const r = new Set(n.map((a) => zs(t.options, a.value)));
      return { kind: "chips", selected: t.options.filter((a) => r.has(a)) };
    }
    case "toggle":
      return { kind: "toggle", on: n.length > 0 };
  }
}
function ui(e, t) {
  const n = Os(e);
  switch (t.kind) {
    case "range":
      return t.min === null && t.max === null ? [] : [{ kind: "field", field: n, comparator: ":", value: Sl(t) }];
    case "chips":
      return t.selected.map((r) => ({ kind: "field", field: n, comparator: "=", value: r }));
    case "toggle":
      return t.on ? [{ kind: "field", field: n, comparator: ":", value: "true" }] : [];
  }
}
function Ns(e, t, n) {
  const r = ui(t, n), a = Te(e), s = (a.length ? a : [[]]).map((l) => [
    ...l.filter((i) => !Rs(i, t)),
    ...r
  ]);
  return ot(s);
}
function Wv(e, t) {
  return Ns(e, t, hl(t));
}
function di(e, t) {
  return (t?.facets ?? []).some((n) => ml(Is(e, n)));
}
const Dn = "entity", sn = "expr", fi = { ">=": "≥", "<=": "≤", ">": ">", "<": "<" };
function pi(e, t, n) {
  if (e.kind !== "field") return $t(e);
  const r = Al(e.field, t, n);
  if (r === void 0) return $t(e);
  const a = e.negated ? "-" : "", s = rn(e) ? Gn(e.value) : null;
  if (s) {
    const i = s.min !== null && s.max !== null ? `${s.min} ≤ ${r} ≤ ${s.max}` : s.max !== null ? `${r} ≤ ${s.max}` : `${r} ≥ ${s.min}`;
    return a + i;
  }
  const l = fi[e.comparator];
  return l ? `${a}${r} ${l} ${e.value}` : $t({ ...e, field: r });
}
function aa(e, t, n = null) {
  const r = [];
  return t && r.push({
    id: Dn,
    label: `entity:${t.key}`,
    facetKey: Dn
  }), Te(e.expr).forEach((a, s) => {
    a.forEach((l, i) => {
      r.push({
        id: `${sn}:${s}:${i}`,
        label: pi(l, t, n),
        address: ps($t(l), t, n),
        facetKey: sn,
        group: s,
        index: i,
        ...l.kind === "field" ? { field: l.field, value: l.value } : {},
        ...l.negated ? { negated: !0 } : {}
      });
    });
  }), r;
}
function vi(e, t, n = null) {
  if (Ur(e)) {
    const s = mt(t, e.sort, n);
    return `everything · ${e.view} · ${s.label}`;
  }
  const r = aa(e, t).filter((s) => s.facetKey !== sn).map((s) => s.label), a = e.expr.trim();
  return a && r.push(`"${a}"`), r.join(" · ");
}
function hi(e) {
  const { adapter: t } = e, n = p(() => ut(e.schema)), r = p(() => ut(e.defaults) ?? {}), a = p(() => ni(t.search.value, n.value, r.value)), s = p(() => nn(n.value, a.value.entity)), l = p(() => s.value ?? is(n.value, r.value)), i = p(() => Un(s.value, n.value)), o = p(() => mt(s.value, a.value.sort, n.value)), c = (y, C) => {
    const k = mr(y, n.value, r.value, t.search.value);
    return k === t.search.value ? !1 : (C === "push" ? t.push(k) : t.replace(k), !0);
  }, u = () => ut(e.navigationMode) ?? "push", m = () => ut(e.facetNavigationMode) ?? "replace", $ = (y, C) => {
    const k = y.page ?? (vr(y) ? 1 : a.value.page);
    return c({ ...a.value, ...y, page: k }, C);
  }, w = (y) => {
    const C = y.page ?? (vr(y) ? 1 : a.value.page), k = mr({ ...a.value, ...y, page: C }, n.value, r.value, t.search.value);
    return t.href ? t.href(k) : `${t.path.value}${k}`;
  }, b = (y, C) => {
    const k = s.value?.facets.find((S) => S.key === y);
    if (!k) return;
    const x = Ns(a.value.expr, k, C(Is(a.value.expr, k)));
    $({ expr: x }, m());
  }, g = (y) => {
    const C = y === null ? null : nn(n.value, y);
    return (C?.key ?? null) === a.value.entity ? {} : {
      entity: C?.key ?? null,
      view: Ea(a.value.view, a.value.entity, C?.key ?? null, r.value),
      sort: mt(C, a.value.sort, n.value).key
    };
  }, M = (y) => {
    const C = g(y);
    Object.keys(C).length && $(C, u());
  };
  return {
    query: a,
    entity: s,
    focus: l,
    sort: o,
    sorts: i,
    summary: p(() => vi(a.value, s.value, n.value)),
    terms: p(() => aa(a.value, s.value, n.value)),
    isPristine: p(() => Ur(a.value)),
    isEverything: p(() => a.value.entity === null),
    hasFacets: p(() => di(a.value.expr, s.value)),
    setEntity: M,
    entityHref: (y) => w(g(y)),
    clearEntity: () => M(null),
    setView(y) {
      $({ view: y }, u());
    },
    setSort(y) {
      $({ sort: mt(s.value, y, n.value).key }, u());
    },
    toggleDirection() {
      $({ dir: a.value.dir === "desc" ? "asc" : "desc" }, u());
    },
    setExpression(y) {
      return $({ expr: y }, u());
    },
    narrow(y, C, k) {
      return $({ expr: y, ...g(C), ...k ? { view: k } : {} }, u());
    },
    narrowHref(y, C, k) {
      return w({ expr: y, ...g(C), ...k ? { view: k } : {} });
    },
    setPage(y, C) {
      $({ page: Math.max(1, Math.floor(y)) }, C ?? u());
    },
    setFacet(y, C) {
      b(y, () => C);
    },
    toggleChip(y, C) {
      b(y, (k) => k.kind !== "chips" ? k : { kind: "chips", selected: k.selected.includes(C) ? k.selected.filter((S) => S !== C) : [...k.selected, C] });
    },
    setRange(y, C, k) {
      b(y, (x) => x.kind === "range" ? { kind: "range", min: C, max: k } : x);
    },
    toggleFlag(y) {
      b(
        y,
        (C) => C.kind === "toggle" ? { kind: "toggle", on: !C.on } : C
      );
    },
    removeTerm(y) {
      if (y.facetKey === Dn) {
        M(null);
        return;
      }
      if (y.facetKey === sn) {
        const C = Il(Te(a.value.expr), y.group ?? 0, y.index ?? 0);
        $({ expr: ot(C) }, u());
      }
    },
    clearFilters() {
      $({ ...g(null), expr: "" }, u());
    },
    reset() {
      c(Yr(n.value, r.value), u());
    },
    hrefFor(y) {
      const C = { ...a.value, ...y };
      return "entity" in y && !("view" in y) && (C.view = Ea(a.value.view, a.value.entity, C.entity, r.value)), C.page = y.page ?? (vr(y) ? 1 : a.value.page), `${t.path.value}${mr(C, n.value, r.value, t.search.value)}`;
    }
  };
}
function mi(e) {
  const t = ft([]), n = V(0), r = V(!1), a = V(!1), s = ft(null);
  let l = 0, i = null, o = null;
  const c = p(() => (e.query.value.page - 1) * e.limit.value), u = p(() => gl(n.value, e.limit.value)), m = () => {
    const x = e.query.value, S = e.within?.value.trim(), B = Ps(e.entity.value, x.expr);
    return S ? { ...x, expr: Zr(S, B) } : B === x.expr ? x : { ...x, expr: B };
  }, $ = (x, S) => {
    t.value = x.rows, n.value = x.total, s.value = null, w(S);
  }, w = (x) => {
    i = { key: x, total: n.value }, a.value = !1;
  }, b = (x) => {
    s.value = x, t.value = [], n.value = 0, i = null, a.value = !1;
  }, g = (x, S, B, A) => {
    let R = !0;
    const P = () => x === l;
    let K = 0, W = !1;
    const X = (ve) => {
      K = ve, W = !0, A === void 0 && (n.value = ve);
    }, ge = () => {
      R && (R = !1, t.value = [], X(0)), s.value = null;
    };
    return {
      get open() {
        return P();
      },
      insert(ve, Ne) {
        if (!P()) return;
        const q = Array.isArray(ve) ? ve : [ve];
        if (!q.length) return;
        ge();
        const G = [...t.value];
        G.splice(Ne ?? G.length, 0, ...q), t.value = S > 0 ? G.slice(0, S) : G, X(K + q.length);
      },
      set(ve) {
        P() && (ve.rows && (ge(), t.value = S > 0 ? ve.rows.slice(0, S) : ve.rows, X(ve.rows.length)), ve.total !== void 0 && X(ve.total));
      },
      close() {
        P() && (r.value = !1, W && (n.value = K), w(B));
      },
      fail(ve) {
        P() && (b(ve), r.value = !1);
      }
    };
  }, M = () => {
    const x = o;
    o = null, x?.();
  }, y = () => {
    const x = ++l;
    M();
    const S = C.value, B = i?.key === S ? i.total : void 0;
    a.value = B === void 0;
    const A = {
      query: m(),
      schema: e.schema.value,
      entity: e.entity.value,
      limit: e.limit.value,
      offset: c.value
    }, R = e.source.value;
    if (R.stream) {
      r.value = !0;
      try {
        o = R.stream(A, g(x, A.limit, S, B)) ?? null;
      } catch (K) {
        b(K), r.value = !1;
      }
      return;
    }
    let P;
    try {
      P = R.query(A);
    } catch (K) {
      b(K);
      return;
    }
    if (!(P instanceof Promise)) {
      $(P, S), r.value = !1;
      return;
    }
    r.value = !0, P.then((K) => {
      x === l && $(K, S);
    }).catch((K) => {
      x === l && b(K);
    }).finally(() => {
      x === l && (r.value = !1);
    });
  }, C = p(() => {
    const x = m();
    return `${e.entity.value?.key ?? e.schema.value.entities[0]?.key ?? ""}|${JSON.stringify(Xr.map((B) => x[B]))}`;
  }), k = p(() => `${C.value}|${e.query.value.page}`);
  return be([e.source, k, e.limit], y, {
    immediate: !0
  }), Dt(() => {
    l++, M();
  }, !0), { rows: t, total: n, offset: c, pageCount: u, pending: r, counting: a, error: s, refresh: y };
}
const gi = 150;
function yi(e) {
  const t = e.delay ?? gi, n = V(""), r = V("");
  let a = !1, s;
  const l = () => {
    clearTimeout(s), s = void 0;
  }, i = p(() => an(Dl(r.value), e.entity.value, e.schema?.value)), o = p(() => i.value.trim() !== ""), c = p(
    () => JSON.stringify([i.value, ...Xr.map((w) => e.query.value[w])])
  ), u = ft(null), m = p(() => {
    const w = e.query.value;
    if (!o.value) return w;
    const b = u.value?.of === c.value ? u.value.page : 1;
    return { ...w, expr: Or(w.expr, i.value), page: b };
  });
  be(n, (w) => {
    if (l(), !w.trim()) {
      a || (r.value = "");
      return;
    }
    a = !1, s = setTimeout(() => {
      s = void 0, r.value = n.value;
    }, t);
  }), be(
    e.query,
    () => {
      a && (a = !1, r.value = "");
    },
    { flush: "sync" }
  );
  const $ = (w) => {
    l(), a = !0, n.value = "", !w() && a && (a = !1, r.value = "");
  };
  return Vn() && Dt(l), {
    text: n,
    live: m,
    drafting: o,
    setPage(w) {
      u.value = { of: c.value, page: Math.max(1, Math.floor(w)) };
    },
    commit() {
      const w = n.value.trim();
      if (!w) return;
      const b = Or(
        e.query.value.expr,
        an(w, e.entity.value, e.schema?.value)
      );
      r.value = w, $(() => e.setExpression(b));
    },
    abandon() {
      l(), a = !1, n.value = "", r.value = "";
    },
    release: $
  };
}
const _i = 25, Bs = (e, t) => e.toLowerCase() === t.toLowerCase();
function wi(e, t) {
  return e.find((n) => Bs(n.id, t));
}
function ki(e) {
  const t = ft(/* @__PURE__ */ new Map()), n = /* @__PURE__ */ new Set(), r = (i) => {
    if (i.facetKey !== sn) return null;
    const o = Ts(e.schema.value, i.field, i.value);
    return o ? { ...o, key: `${o.entity.key}:${o.id}` } : null;
  }, a = (i) => {
    const { entity: o, id: c } = i, u = e.query.value;
    return e.source.value.query({
      query: {
        ...u,
        entity: o.key,
        // The reference on its own. The rest of the query is about the rows on
        // screen, which are of another type entirely.
        expr: xs(o, c) ?? "",
        sort: mt(o, u.sort, e.schema.value).key,
        page: 1
      },
      schema: e.schema.value,
      entity: o,
      limit: _i,
      offset: 0
    });
  }, s = (i, o) => {
    const c = Sn(Xe(i.columns ?? [], "identity"), o);
    return c === it || Bs(c, o.id) ? "" : c;
  }, l = () => {
    const i = /* @__PURE__ */ new Map();
    for (const u of e.terms.value) {
      const m = r(u);
      m && !t.value.has(m.key) && !n.has(m.key) && i.set(m.key, m);
    }
    if (!i.size) return;
    const o = [...i.values()].map((u) => ({
      reference: u,
      outcome: a(u)
    })), c = (u) => {
      const m = new Map(t.value);
      u.forEach(($, w) => {
        const { reference: b } = o[w], g = wi($.rows, b.id);
        m.set(b.key, g ? s(b.entity, g) : "");
      }), t.value = m;
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
  return be([e.source, e.schema, e.terms], () => {
    try {
      l();
    } catch {
    }
  }, { immediate: !0 }), {
    names: t,
    nameOf(i) {
      const o = r(i);
      return o && t.value.get(o.key) || null;
    }
  };
}
const bi = { class: "dc-header" }, $i = { class: "dc-header__main" }, xi = {
  class: "dc-header__brand",
  "aria-hidden": "true"
}, Mi = { class: "dc-header__sr" }, Si = {
  key: 2,
  class: "dc-header__within"
}, Ci = ["title"], Ei = { class: "dc-header__query" }, Pi = ["data-dc-more", "title"], Ai = { class: "dc-header__run" }, Ti = {
  key: 0,
  class: "dc-header__or dc-mono",
  "aria-hidden": "true"
}, Li = ["title", "aria-label", "onClick"], Oi = ["placeholder", "onKeydown"], Ri = {
  key: 0,
  class: "dc-header__pages",
  "aria-label": "Pages"
}, zi = ["disabled"], Ii = ["title"], Ni = ["value", "onKeydown"], Bi = {
  class: "dc-header__page-total",
  "aria-hidden": "true"
}, Fi = {
  class: "dc-header__sr",
  "aria-live": "polite"
}, Di = ["disabled"], Hi = {
  key: 1,
  class: "dc-header__actions"
}, qi = /* @__PURE__ */ ae({
  __name: "ShellHeader",
  props: {
    views: {},
    pagesNote: {},
    hidePages: { type: Boolean }
  },
  setup(e) {
    const t = e, n = cn(), r = Ce(), a = p(() => r.schema.value), s = p(() => {
      const F = r.within.value.trim();
      return F ? aa({ ...r.query.value, expr: F }, null) : [];
    }), l = p(() => {
      const F = r.entity.value, j = F?.keepsScope ? void 0 : F?.scope?.toLowerCase();
      return r.terms.value.filter((re) => re.facetKey !== Dn).map((re, I, Q) => {
        const ee = Q[I - 1];
        return {
          term: re,
          or: ee?.group !== void 0 && re.group !== void 0 && re.group !== ee.group,
          idle: !!j && re.field?.toLowerCase() === j
        };
      });
    }), i = ki({
      source: r.source,
      schema: r.schema,
      query: r.query,
      // The scope's parts as well as the query's: it names a record more often
      // than a typed term does, being what a record's own page is built on.
      terms: p(() => [...s.value, ...r.terms.value])
    });
    function o(F) {
      const j = As(a.value, F)?.scopeLabel ?? F;
      return j.charAt(0).toUpperCase() + j.slice(1);
    }
    function c(F) {
      return F.replace(/\s*\([^()]*\)\s*$/, "");
    }
    function u(F) {
      const j = i.nameOf(F);
      return j ? `${F.negated ? "-" : ""}${o(F.field)}: ${c(j)}` : F.label;
    }
    function m(F) {
      const j = u(F.term), re = F.idle ? `Not applied to ${r.entity.value?.label} — remove ${j}` : `Remove ${j}`, I = F.term.address;
      return I && I !== j ? `${re}
Written ${I} in the address and the search box` : re;
    }
    const $ = V(null);
    function w(F) {
      $.value = F instanceof HTMLInputElement ? F : null;
    }
    function b() {
      r.abandonDraft(), $.value?.blur();
    }
    function g() {
      M.value = null, r.commitDraft();
    }
    const M = V(null), y = p(() => Math.min(M.value ?? 1 / 0, l.value.length)), C = p(() => [
      { key: "before", entries: l.value.slice(0, y.value) },
      { key: "after", entries: l.value.slice(y.value) }
    ]), k = p(() => y.value < l.value.length);
    be(l, (F) => {
      M.value !== null && M.value >= F.length && (M.value = null);
    });
    function x(F, j) {
      M.value = F >= l.value.length ? null : Math.max(0, F), yt(() => {
        const re = $.value;
        if (!re) return;
        const I = j === "start" ? 0 : re.value.length;
        re.setSelectionRange(I, I), re.scrollIntoView({ block: "nearest", inline: "nearest" }), q();
      });
    }
    function S(F) {
      const j = $.value;
      return !j || j.selectionStart !== j.selectionEnd ? !1 : j.selectionStart === (F === "start" ? 0 : j.value.length);
    }
    function B(F) {
      y.value === 0 || !S("start") || (F.preventDefault(), x(F.key === "Home" ? 0 : y.value - 1, "start"));
    }
    function A(F) {
      !k.value || !S("end") || (F.preventDefault(), x(F.key === "End" ? l.value.length : y.value + 1, "end"));
    }
    function R(F) {
      y.value === 0 || !S("start") || (F.preventDefault(), W(l.value[y.value - 1].term, !0));
    }
    function P(F) {
      !k.value || !S("end") || (F.preventDefault(), W(l.value[y.value].term, !1));
    }
    function K(F) {
      F.isComposing || F.altKey || F.ctrlKey || F.metaKey || F.shiftKey || (F.key === "ArrowLeft" || F.key === "Home" ? B(F) : F.key === "ArrowRight" || F.key === "End" ? A(F) : F.key === "Backspace" ? R(F) : F.key === "Delete" && P(F));
    }
    function W(F, j) {
      j && M.value !== null && (M.value = Math.max(0, M.value - 1)), r.removeTerm(F);
    }
    function X(F) {
      F.target?.closest("button, input") || (F.preventDefault(), $.value?.focus(), x(l.value.length, "end"));
    }
    function ge() {
      r.draft.value || (M.value = null);
    }
    const ve = V(null), Ne = V("");
    function q() {
      const F = ve.value;
      if (!F) {
        Ne.value = "";
        return;
      }
      const j = F.scrollLeft > 1, re = F.scrollWidth - F.clientWidth - F.scrollLeft > 1;
      Ne.value = j && re ? "both" : j ? "start" : re ? "end" : "";
    }
    let G = null;
    be(
      ve,
      (F) => {
        G?.disconnect(), G = null, q(), !(!F || typeof ResizeObserver > "u") && (G = new ResizeObserver(q), G.observe(F));
      },
      { flush: "post" }
    ), be([l, y], q, { flush: "post" }), Ie(() => G?.disconnect());
    const se = p(() => r.liveQuery.value.page), ie = p(
      () => !t.hidePages && (r.pageCount.value > 1 || !!t.pagesNote) && !Gr(r.query.value, t.views)
    ), z = p(
      () => `${r.counting.value ? "~" : ""}${Wt(r.pageCount.value)}`
    ), J = p(() => {
      let F = `Page ${Wt(se.value)} of ${z.value}`;
      const j = r.rows.value.length;
      if (j) {
        const re = r.offset.value + 1, I = `${r.counting.value ? "~" : ""}${Wt(r.total.value)}`;
        F += ` — rows ${Wt(re)} to ${Wt(re + j - 1)} of ${I}`;
      }
      return t.pagesNote ? `${F}
${t.pagesNote}` : F;
    }), fe = V(null), qe = p(() => fe.value ?? String(se.value)), nt = p(
      () => `calc(${Math.max(2, String(r.pageCount.value).length)}ch + 10px)`
    );
    function rt(F) {
      F.target.select();
    }
    function Ge(F) {
      const j = F.target, re = j.value.replace(/[^0-9]/g, "");
      j.value !== re && (j.value = re), fe.value = re;
    }
    function Ve(F) {
      const j = F.target, re = Number(fe.value);
      fe.value = null;
      const I = Number.isFinite(re) && re >= 1 ? Math.min(Math.trunc(re), Math.max(1, r.pageCount.value)) : se.value;
      j.value = String(I), I !== se.value && r.setPage(I);
    }
    function Ye(F) {
      const j = F.target;
      fe.value = null, j.value = String(se.value), j.blur();
    }
    return (F, j) => (f(), h("div", bi, [
      E("div", $i, [
        n.brand ? (f(), h("button", {
          key: 0,
          type: "button",
          class: "dc-header__domain",
          "data-dc-brand": "",
          title: "Home",
          onClick: j[0] || (j[0] = (re) => L(r).reset())
        }, [
          E("span", xi, [
            we(F.$slots, "brand", {
              label: a.value.label
            }, void 0, !0)
          ]),
          E("span", Mi, N(a.value.label), 1)
        ])) : (f(), h("button", {
          key: 1,
          type: "button",
          class: "dc-header__domain",
          title: "Home",
          onClick: j[1] || (j[1] = (re) => L(r).reset())
        }, N(a.value.label), 1)),
        s.value.length ? (f(), h("span", Si, [
          j[6] || (j[6] = E("span", { class: "dc-header__sr" }, "Within", -1)),
          (f(!0), h(te, null, he(s.value, (re) => (f(), h("span", {
            key: `scope:${re.id}`,
            class: "dc-within dc-mono dc-truncate",
            title: u(re)
          }, N(u(re)), 9, Ci))), 128))
        ])) : T("", !0),
        E("div", Ei, [
          E("div", {
            class: "dc-header__field",
            onMousedown: X
          }, [
            E("div", {
              ref_key: "termBar",
              ref: ve,
              class: "dc-header__terms",
              "data-dc-more": Ne.value,
              title: L(r).summary.value,
              onScroll: q
            }, [
              (f(!0), h(te, null, he(C.value, (re) => (f(), h(te, {
                key: re.key
              }, [
                E("span", Ai, [
                  (f(!0), h(te, null, he(re.entries, (I) => (f(), h(te, {
                    key: I.term.id
                  }, [
                    I.or ? (f(), h("span", Ti, "or")) : T("", !0),
                    E("button", {
                      type: "button",
                      class: Je(["dc-term dc-mono", { "dc-term--idle": I.idle }]),
                      title: m(I),
                      "aria-label": `Remove ${u(I.term)}`,
                      onMousedown: j[2] || (j[2] = Qe(() => {
                      }, ["prevent"])),
                      onClick: (Q) => W(I.term, re.key === "before")
                    }, N(u(I.term)), 43, Li)
                  ], 64))), 128))
                ]),
                re.key === "before" ? en((f(), h("input", {
                  key: 0,
                  ref_for: !0,
                  ref: w,
                  "onUpdate:modelValue": j[3] || (j[3] = (I) => L(r).draft.value = I),
                  class: Je(["dc-header__search dc-mono", { "dc-header__search--between": k.value }]),
                  style: xe({ "--dc-typed": String(Math.max(1, L(r).draft.value.length)) }),
                  type: "text",
                  autocomplete: "off",
                  spellcheck: "false",
                  placeholder: k.value ? "" : "Search…",
                  "aria-label": "Search",
                  onKeydown: [
                    bn(Qe(g, ["prevent"]), ["enter"]),
                    bn(Qe(b, ["prevent"]), ["esc"]),
                    K
                  ],
                  onBlur: ge
                }, null, 46, Oi)), [
                  [Wo, L(r).draft.value]
                ]) : T("", !0)
              ], 64))), 128))
            ], 40, Pi)
          ], 32)
        ])
      ]),
      ie.value ? (f(), h("nav", Ri, [
        E("button", {
          type: "button",
          class: "dc-header__step",
          "aria-label": "Previous page",
          disabled: se.value <= 1,
          onClick: j[4] || (j[4] = (re) => L(r).setPage(se.value - 1))
        }, [...j[7] || (j[7] = [
          E("span", { "aria-hidden": "true" }, "‹", -1)
        ])], 8, zi),
        E("span", {
          class: "dc-header__page dc-mono",
          title: J.value
        }, [
          E("input", {
            class: "dc-header__page-box dc-mono",
            type: "text",
            inputmode: "numeric",
            autocomplete: "off",
            "aria-label": "Page",
            style: xe({ width: nt.value }),
            value: qe.value,
            onFocus: rt,
            onInput: Ge,
            onKeydown: [
              bn(Qe(Ve, ["prevent"]), ["enter"]),
              bn(Qe(Ye, ["prevent"]), ["esc"])
            ],
            onBlur: Ve
          }, null, 44, Ni),
          E("span", Bi, "/ " + N(z.value), 1)
        ], 8, Ii),
        E("span", Fi, N(J.value), 1),
        E("button", {
          type: "button",
          class: "dc-header__step",
          "aria-label": "Next page",
          disabled: se.value >= L(r).pageCount.value,
          onClick: j[5] || (j[5] = (re) => L(r).setPage(se.value + 1))
        }, [...j[8] || (j[8] = [
          E("span", { "aria-hidden": "true" }, "›", -1)
        ])], 8, Di)
      ])) : T("", !0),
      n.actions ? (f(), h("div", Hi, [
        we(F.$slots, "actions", {}, void 0, !0)
      ])) : T("", !0)
    ]));
  }
}), oe = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [r, a] of t)
    n[r] = a;
  return n;
}, Fs = /* @__PURE__ */ oe(qi, [["__scopeId", "data-v-f5e5f2f1"]]);
function Vi(e) {
  const t = ft(/* @__PURE__ */ new Map()), n = V(!0);
  let r = 0, a;
  const s = () => {
    r++, a?.abort(), a = void 0;
  }, l = () => {
    s();
    const i = r, { signal: o } = a = new AbortController(), c = e.query.value, u = e.schema.value, m = e.entities.value, $ = e.within?.value.trim() ?? "";
    n.value = c.expr.trim() === "" && !$;
    const w = /* @__PURE__ */ new Map();
    let b = !0;
    for (const g of m) {
      const M = Ps(g, c.expr), y = $ ? Zr($, M) : M;
      let C = !1;
      const k = (S) => {
        if (i !== r) return;
        if (b) {
          w.set(g.key, S);
          return;
        }
        const B = new Map(t.value);
        B.set(g.key, S), t.value = B;
      }, x = e.source.value.query({
        query: { ...c, entity: g.key, expr: y, page: 1 },
        schema: u,
        entity: g,
        limit: 0,
        offset: 0,
        signal: o,
        progress: (S) => {
          C || k({ total: S, pending: !0, counted: !0 });
        }
      });
      x instanceof Promise ? (w.has(g.key) || w.set(g.key, { total: 0, pending: !0, counted: !1 }), x.then((S) => {
        C = !0, k({ total: S.total, pending: !1, counted: !0 });
      })) : (C = !0, w.set(g.key, { total: x.total, pending: !1, counted: !0 }));
    }
    b = !1, t.value = w;
  };
  return Vn() && Dt(s), { counts: t, pristine: n, refresh: l, cancel: s };
}
const Ki = ["checked", "indeterminate"], Ds = /* @__PURE__ */ ae({
  __name: "PageTick",
  setup(e) {
    const t = Ce(), n = p(() => t.rows.value.filter((s) => t.isSelected(s)).length), r = p(
      () => t.rows.value.length > 0 && n.value === t.rows.value.length
    ), a = p(() => n.value > 0 && !r.value);
    return (s, l) => (f(), h("input", {
      class: "dc-tick",
      type: "checkbox",
      checked: r.value,
      indeterminate: a.value,
      "aria-label": "Select every row on this page",
      title: "Select every row on this page",
      onChange: l[0] || (l[0] = (i) => L(t).selectPage(!r.value))
    }, null, 40, Ki));
  }
}), Xt = (e) => e.separator !== !0 && e.heading !== !0 && e.disabled !== !0, Wi = ["aria-label"], ji = ["role", "aria-label"], Ui = ["data-dc-item"], Gi = {
  key: 0,
  class: "dc-menu__rule",
  role: "separator"
}, Yi = ["role", "aria-checked", "aria-haspopup", "aria-expanded", "aria-disabled", "disabled", "data-dc-item", "onClick", "onMouseenter"], Xi = {
  class: "dc-menu__mark",
  "aria-hidden": "true"
}, Qi = { class: "dc-menu__label dc-truncate" }, Zi = {
  key: 0,
  class: "dc-menu__key dc-mono"
}, Ji = {
  key: 1,
  class: "dc-menu__more",
  "aria-hidden": "true"
}, ec = /* @__PURE__ */ ae({
  __name: "MenuList",
  props: {
    items: {},
    at: {},
    label: {},
    autofocus: { type: Boolean }
  },
  emits: ["choose", "dismiss"],
  setup(e, { expose: t, emit: n }) {
    const r = e, a = n, s = V(null), l = V([]), i = V(null), o = V(null), c = V(null), u = V(!1), m = p(
      () => r.items.flatMap((A, R) => Xt(A) ? [R] : [])
    ), $ = p(() => {
      const A = [{ entries: [] }];
      return r.items.forEach((R, P) => {
        R.heading ? A.push({ heading: R, entries: [] }) : A[A.length - 1]?.entries.push({ item: R, index: P });
      }), A.filter((R) => R.entries.length > 0);
    }), w = V({ x: r.at.x, y: r.at.y });
    async function b() {
      w.value = { x: r.at.x, y: r.at.y }, await yt();
      const A = s.value?.getBoundingClientRect();
      if (!A) return;
      const R = 8;
      let P = r.at.x, K = r.at.y;
      if (P + A.width > window.innerWidth - R) {
        const W = r.at.mirrorX === void 0 ? null : r.at.mirrorX - A.width;
        P = W !== null && W >= R ? W : window.innerWidth - A.width - R;
      }
      K + A.height > window.innerHeight - R && (K = window.innerHeight - A.height - R), w.value = { x: Math.max(R, P), y: Math.max(R, K) };
    }
    const g = p(() => ({ left: `${w.value.x}px`, top: `${w.value.y}px` }));
    function M(A) {
      i.value = A, A !== null && yt(() => l.value[A]?.focus());
    }
    function y(A, R) {
      const P = m.value;
      if (P.length === 0) return null;
      if (A === null) return R === 1 ? P[0] ?? null : P[P.length - 1] ?? null;
      const K = P.indexOf(A);
      return K === -1 ? P[0] ?? null : P[(K + R + P.length) % P.length] ?? null;
    }
    function C(A, R) {
      if (!r.items[A]?.items?.length) return;
      const K = l.value[A]?.getBoundingClientRect(), W = s.value?.getBoundingClientRect();
      !K || !W || (c.value = { x: W.right - 4, y: K.top - 4, mirrorX: W.left + 4 }, o.value = A, u.value = R);
    }
    function k(A) {
      const R = o.value;
      o.value = null, c.value = null, A && R !== null && M(R);
    }
    function x(A) {
      const R = r.items[A];
      if (!(!R || !Xt(R))) {
        if (R.items?.length) {
          C(A, !0);
          return;
        }
        a("choose", R);
      }
    }
    function S(A) {
      const R = A.key;
      if (R === "Escape") {
        A.preventDefault(), A.stopPropagation(), o.value !== null ? k(!0) : a("dismiss");
        return;
      }
      if (R === "ArrowDown" || R === "ArrowUp") {
        A.preventDefault(), A.stopPropagation(), k(!1), M(y(i.value, R === "ArrowDown" ? 1 : -1));
        return;
      }
      if (R === "Home" || R === "End") {
        A.preventDefault(), A.stopPropagation(), k(!1), M(y(null, R === "Home" ? 1 : -1));
        return;
      }
      if (R === "ArrowRight") {
        const P = i.value;
        P !== null && r.items[P]?.items?.length && (A.preventDefault(), A.stopPropagation(), C(P, !0));
        return;
      }
      if (R === "ArrowLeft") {
        o.value !== null && (A.preventDefault(), A.stopPropagation(), k(!0));
        return;
      }
      if (R === "Enter" || R === " ") {
        const P = i.value;
        if (P === null) return;
        A.preventDefault(), A.stopPropagation(), x(P);
      }
    }
    function B(A) {
      const R = r.items[A];
      !R || !Xt(R) || (o.value !== null && o.value !== A && k(!1), M(A), R.items?.length && C(A, !1));
    }
    return un(() => {
      b(), r.autofocus && M(y(null, 1));
    }), be(() => r.at, b, { deep: !0 }), be(() => r.items, () => void b(), { deep: !0 }), Ie(() => {
      o.value = null;
    }), t({ root: s }), (A, R) => {
      const P = as("MenuList", !0);
      return f(), h("div", {
        ref_key: "root",
        ref: s,
        class: "dc-menu",
        role: "menu",
        "aria-label": e.label,
        style: xe(g.value),
        onKeydown: S
      }, [
        (f(!0), h(te, null, he($.value, (K, W) => (f(), h("div", {
          key: `${W}-${K.heading?.label ?? ""}`,
          class: "dc-menu__group",
          role: K.heading ? "group" : "none",
          "aria-label": K.heading?.label
        }, [
          K.heading ? (f(), h("div", {
            key: 0,
            class: "dc-menu__heading dc-truncate",
            "aria-hidden": "true",
            "data-dc-item": K.heading.id
          }, N(K.heading.label), 9, Ui)) : T("", !0),
          (f(!0), h(te, null, he(K.entries, ({ item: X, index: ge }) => (f(), h(te, {
            key: X.id ?? `${ge}-${X.label ?? ""}`
          }, [
            X.separator ? (f(), h("div", Gi)) : (f(), h("button", {
              key: 1,
              ref_for: !0,
              ref: (ve) => {
                ve && (l.value[ge] = ve);
              },
              type: "button",
              class: "dc-menu__item",
              role: X.checked === void 0 ? "menuitem" : "menuitemcheckbox",
              "aria-checked": X.checked === void 0 ? void 0 : X.checked,
              "aria-haspopup": X.items?.length ? "menu" : void 0,
              "aria-expanded": X.items?.length ? o.value === ge : void 0,
              "aria-disabled": X.disabled ? "true" : void 0,
              disabled: X.disabled,
              "data-dc-item": X.id,
              tabindex: "-1",
              onClick: (ve) => x(ge),
              onMouseenter: (ve) => B(ge)
            }, [
              E("span", Xi, N(X.checked ? "✓" : ""), 1),
              E("span", Qi, N(X.label), 1),
              X.shortcut ? (f(), h("span", Zi, N(X.shortcut), 1)) : X.items?.length ? (f(), h("span", Ji, "›")) : T("", !0)
            ], 40, Yi))
          ], 64))), 128))
        ], 8, ji))), 128)),
        o.value !== null && c.value ? (f(), Y(P, {
          key: o.value,
          items: e.items[o.value]?.items ?? [],
          at: c.value,
          label: e.items[o.value]?.label,
          autofocus: u.value,
          onChoose: R[0] || (R[0] = (K) => a("choose", K)),
          onDismiss: R[1] || (R[1] = (K) => k(!0))
        }, null, 8, ["items", "at", "label", "autofocus"])) : T("", !0)
      ], 44, Wi);
    };
  }
}), sa = /* @__PURE__ */ oe(ec, [["__scopeId", "data-v-9b1413fa"]]), tc = { class: "dc-pick" }, nc = ["id"], rc = ["id", "aria-expanded", "aria-labelledby", "data-dc-value"], ac = { class: "dc-pick__label" }, sc = /* @__PURE__ */ ae({
  __name: "PickControl",
  props: {
    modelValue: {},
    options: {},
    label: {},
    mono: { type: Boolean }
  },
  emits: ["update:modelValue", "open", "close"],
  setup(e, { emit: t }) {
    const n = e, r = t, a = Kn() ?? "dc-pick", s = V(null), l = V(null), i = V(null), o = V(!1), c = p(() => i.value !== null), u = V(null), m = p(
      () => n.options.find((x) => x.key === n.modelValue) ?? n.options[0]
    ), $ = p(
      () => n.options.map((x) => ({
        id: x.key,
        label: x.label,
        checked: x.key === n.modelValue
      }))
    ), w = p(
      () => i.value ? { maxHeight: `${window.innerHeight - i.value.y - 8}px` } : void 0
    );
    function b(x) {
      const S = s.value?.getBoundingClientRect();
      S && (u.value = s.value?.closest(".dc-shell") ?? document.body, i.value = { x: S.left, y: S.bottom + 4, mirrorX: S.right }, o.value = x, r("open"));
    }
    function g(x) {
      i.value && r("close"), i.value = null, x && s.value?.focus();
    }
    function M() {
      c.value ? g(!0) : b(!1);
    }
    function y(x) {
      x.key !== "ArrowDown" && x.key !== "ArrowUp" || c.value || (x.preventDefault(), b(!0));
    }
    function C(x) {
      const S = x.target;
      S && (s.value?.contains(S) || l.value?.root?.contains(S) || g(!1));
    }
    be(c, (x) => {
      x ? window.addEventListener("pointerdown", C, !0) : window.removeEventListener("pointerdown", C, !0);
    }), Ie(() => window.removeEventListener("pointerdown", C, !0));
    function k(x) {
      g(!0), !(x.id === void 0 || x.id === n.modelValue) && r("update:modelValue", x.id);
    }
    return (x, S) => (f(), h("span", tc, [
      E("span", {
        id: `${L(a)}-name`,
        class: "dc-pick__name"
      }, N(e.label), 9, nc),
      E("button", {
        id: `${L(a)}-value`,
        ref_key: "trigger",
        ref: s,
        type: "button",
        class: Je(["dc-pick__button", { "dc-mono": e.mono }]),
        "aria-haspopup": "menu",
        "aria-expanded": c.value,
        "aria-labelledby": `${L(a)}-name ${L(a)}-value`,
        "data-dc-value": e.modelValue,
        onClick: M,
        onKeydown: y
      }, [
        E("span", ac, N(m.value?.label), 1)
      ], 42, rc),
      S[1] || (S[1] = E("span", {
        class: "dc-pick__mark",
        "aria-hidden": "true"
      }, "▾", -1)),
      i.value && u.value ? (f(), Y(Wn, {
        key: 0,
        to: u.value
      }, [
        de(sa, {
          ref_key: "menu",
          ref: l,
          class: "dc-pick__list",
          style: xe(w.value),
          items: $.value,
          at: i.value,
          label: e.label,
          autofocus: o.value,
          onChoose: k,
          onDismiss: S[0] || (S[0] = (B) => g(!0))
        }, null, 8, ["style", "items", "at", "label", "autofocus"])
      ], 8, ["to"])) : T("", !0)
    ]));
  }
}), Ha = /* @__PURE__ */ oe(sc, [["__scopeId", "data-v-d21ebf1b"]]), oc = {
  key: 0,
  class: "dc-actions"
}, lc = {
  key: 2,
  class: "dc-actions__select"
}, ic = {
  key: 0,
  class: "dc-actions__all"
}, cc = {
  class: "dc-actions__count",
  "aria-live": "polite"
}, uc = {
  key: 1,
  class: "dc-actions__count dc-actions__all",
  "aria-live": "polite"
}, dc = { class: "dc-actions__ops" }, fc = ["disabled"], pc = ["data-dc-operation", "disabled", "onClick"], vc = ["disabled"], hc = "…", mc = /* @__PURE__ */ ae({
  __name: "RecordActions",
  props: {
    views: {},
    typeChooser: {}
  },
  setup(e) {
    const t = e, n = Ce(), r = p(
      () => n.hasFacets.value || !!n.liveQuery.value.expr.trim() || !!n.within.value
    ), a = Vi({
      source: n.source,
      schema: n.schema,
      // What each type holds of what is on screen, the draft's results included:
      // a count of the committed query would disagree with the rows under it.
      query: n.liveQuery,
      entities: n.entities,
      within: n.within
    });
    function s(S) {
      if (S.key === n.query.value.entity && r.value) return Rn(n.total.value);
      if (a.pristine.value) return Ar(S);
      const A = a.counts.value.get(S.key);
      return A ? A.counted ? `${A.pending ? "~" : ""}${Rn(A.total)}` : hc : Ar(S);
    }
    const l = p(() => [
      { key: "", label: "Everything" },
      ...n.entities.value.map((S) => ({
        key: S.key,
        label: `${S.label} · ${s(S)}`
      }))
    ]), i = p(
      () => t.typeChooser === "always" || n.query.value.entity !== null
    );
    function o(S) {
      n.setEntity(S || null);
    }
    const c = p(
      () => (t.views ?? [...os]).map((S) => ({ key: S, label: pl[S] }))
    ), u = p(() => jr(n.query.value.view, t.views)), m = p(() => c.value.length > 1);
    function $(S) {
      n.setView(S);
    }
    const w = p(() => n.entity.value), b = p(() => !Gr(n.query.value, t.views)), g = p(() => n.selection.value.ids.length), M = p(
      () => b.value && n.selectable.value && (n.rows.value.length > 0 || g.value > 0)
    ), y = p(() => u.value === "table"), C = p(
      () => i.value || m.value || b.value && (M.value || !!(w.value?.create || w.value?.duplicate || w.value?.delete || w.value?.operations?.length))
    ), k = p(() => g.value ? `${g.value} selected` : y.value ? "" : "Select all");
    function x(S) {
      return g.value ? `${S} ${g.value}` : S;
    }
    return (S, B) => C.value ? (f(), h("div", oc, [
      i.value ? (f(), Y(Ha, {
        key: 0,
        class: "dc-actions__pick dc-actions__type",
        label: "Type",
        "model-value": L(n).query.value.entity ?? "",
        options: l.value,
        onOpen: L(a).refresh,
        onClose: L(a).cancel,
        "onUpdate:modelValue": o
      }, null, 8, ["model-value", "options", "onOpen", "onClose"])) : T("", !0),
      m.value ? (f(), Y(Ha, {
        key: 1,
        class: "dc-actions__pick dc-actions__view",
        label: "View",
        "model-value": u.value,
        options: c.value,
        "onUpdate:modelValue": $
      }, null, 8, ["model-value", "options"])) : T("", !0),
      M.value && k.value ? (f(), h("div", lc, [
        y.value ? (f(), h("span", uc, N(k.value), 1)) : (f(), h("label", ic, [
          de(Ds),
          E("span", cc, N(k.value), 1)
        ])),
        g.value ? (f(), h("button", {
          key: 2,
          type: "button",
          class: "dc-actions__clear",
          onClick: B[0] || (B[0] = (A) => L(n).clearSelection())
        }, " Clear ")) : T("", !0)
      ])) : T("", !0),
      E("div", dc, [
        w.value?.create ? (f(), h("button", {
          key: 0,
          type: "button",
          class: "dc-actions__op dc-actions__new",
          onClick: B[1] || (B[1] = (A) => L(n).create(w.value))
        }, [
          B[4] || (B[4] = E("span", {
            class: "dc-actions__plus",
            "aria-hidden": "true"
          }, "+", -1)),
          Ae(" " + N(w.value.create), 1)
        ])) : T("", !0),
        w.value?.duplicate ? (f(), h("button", {
          key: 1,
          type: "button",
          class: "dc-actions__op",
          disabled: !g.value,
          onClick: B[2] || (B[2] = (A) => L(n).duplicate())
        }, N(x(w.value.duplicate)), 9, fc)) : T("", !0),
        (f(!0), h(te, null, he(w.value?.operations ?? [], (A) => (f(), h("button", {
          key: A.key,
          type: "button",
          class: "dc-actions__op",
          "data-dc-operation": A.key,
          disabled: !g.value,
          onClick: (R) => L(n).operate(A.key)
        }, N(x(A.label)), 9, pc))), 128)),
        w.value?.delete ? (f(), h("button", {
          key: 2,
          type: "button",
          class: "dc-actions__op dc-actions__danger",
          disabled: !g.value,
          onClick: B[3] || (B[3] = (A) => L(n).delete())
        }, N(x(w.value.delete)), 9, vc)) : T("", !0)
      ])
    ])) : T("", !0);
  }
}), Hs = /* @__PURE__ */ oe(mc, [["__scopeId", "data-v-e316c5ce"]]), gc = ["href"], yc = /* @__PURE__ */ ae({
  __name: "PressLink",
  props: {
    href: {}
  },
  emits: ["press"],
  setup(e, { emit: t }) {
    const n = e, r = t;
    function a(s) {
      if (n.href && Es(s)) {
        s.stopPropagation();
        return;
      }
      s.preventDefault(), r("press", tr(s), s);
    }
    return (s, l) => e.href ? (f(), h("a", {
      key: 0,
      href: e.href,
      class: "dc-press",
      onClick: a
    }, [
      we(s.$slots, "default", {}, void 0, !0)
    ], 8, gc)) : (f(), h("button", {
      key: 1,
      type: "button",
      class: "dc-press",
      onClick: a
    }, [
      we(s.$slots, "default", {}, void 0, !0)
    ]));
  }
}), et = /* @__PURE__ */ oe(yc, [["__scopeId", "data-v-a9383f64"]]);
function _c(e, t) {
  if (!e) return null;
  const n = He(e, t);
  return typeof n == "string" && n.trim() ? n : null;
}
const wc = (e) => e == null || typeof e == "string" && !e.trim();
function kc(e, t) {
  const n = Xe(t, "state"), r = Xe(t, "tint");
  return {
    identity: Sn(Xe(t, "identity"), e),
    reference: Sn(Xe(t, "reference"), e),
    metrics: us(t, "metric").map((a) => ({
      column: a,
      label: a.label ?? "",
      text: Bt(a, e)
    })),
    facts: t.filter((a) => a.cardLabel && !wc(He(a, e))).map((a) => ({
      column: a,
      label: a.cardLabel,
      title: [a.label, a.hint].filter(Boolean).join(" — "),
      text: Bt(a, e)
    })),
    state: n ? He(n, e) ?? null : null,
    updated: Sn(Xe(t, "updated"), e),
    image: _c(Xe(t, "image"), e),
    tint: r ? He(r, e) ?? null : null
  };
}
function qs(e, t, n, r, a = !1) {
  const s = n?.columns ?? [];
  return {
    row: e,
    key: wl(e, t),
    entityLabel: e.entityLabel,
    entity: n,
    columns: s,
    ordinal: sl(t),
    parts: kc(e, s),
    pinned: r,
    selected: a
  };
}
function Pt() {
  const e = Ce(), t = p(
    () => new Map(e.entities.value.map((n) => [n.key, n]))
  );
  return p(
    () => e.rows.value.map(
      (n, r) => qs(
        n,
        e.offset.value + r,
        t.value.get(n.entityKey) ?? null,
        e.isPinned(n),
        e.isSelected(n)
      )
    )
  );
}
const bc = ["data-dc-status", "data-dc-tone"], $c = /* @__PURE__ */ ae({
  __name: "StatusPill",
  props: {
    status: {},
    tone: {},
    label: {}
  },
  setup(e) {
    const t = e, n = p(() => t.label ?? t.status ?? "");
    return (r, a) => (f(), h("span", {
      class: "dc-pill",
      "data-dc-status": e.status,
      "data-dc-tone": e.tone
    }, N(n.value), 9, bc));
  }
}), pn = /* @__PURE__ */ oe($c, [["__scopeId", "data-v-686eb9b6"]]), xc = { key: 1 }, Mc = /* @__PURE__ */ ae({
  __name: "MetricDrill",
  props: {
    entry: {},
    column: {}
  },
  setup(e) {
    const t = e, n = Ce(), r = p(() => !t.entry.entity?.scope || !t.column.drill ? null : n.entities.value.find((c) => c.key === t.column.drill) ?? null), a = p(() => t.column.label ?? ""), s = p(() => Bt(t.column, t.entry.row)), l = p(() => r.value ? n.drillHref(t.entry.row, r.value) : null);
    function i(o, c) {
      c.stopPropagation(), r.value && n.drill(t.entry.row, r.value, o);
    }
    return (o, c) => r.value ? (f(), Y(et, {
      key: 0,
      class: "dc-drill",
      href: l.value,
      title: `${a.value} of ${e.entry.parts.identity} — show the ${r.value.label.toLowerCase()}`,
      onPress: i
    }, {
      default: Ee(() => [
        we(o.$slots, "default", {}, () => [
          Ae(N(s.value), 1)
        ], !0)
      ]),
      _: 3
    }, 8, ["href", "title"])) : (f(), h("span", xc, [
      we(o.$slots, "default", {}, () => [
        Ae(N(s.value), 1)
      ], !0)
    ]));
  }
}), vn = /* @__PURE__ */ oe(Mc, [["__scopeId", "data-v-d3e7f4e0"]]), Sc = ["data-dc-active", "aria-pressed", "aria-label"], Cc = /* @__PURE__ */ ae({
  __name: "PinStar",
  props: {
    row: {},
    pinned: { type: Boolean },
    name: {}
  },
  setup(e) {
    const t = e, n = Ce();
    function r(a) {
      a.stopPropagation(), n.togglePin(t.row);
    }
    return (a, s) => (f(), h("button", {
      type: "button",
      class: "dc-star",
      "data-dc-active": e.pinned ? "true" : "false",
      "aria-pressed": e.pinned,
      "aria-label": e.pinned ? `Unpin ${e.name}` : `Pin ${e.name}`,
      onClick: r
    }, N(e.pinned ? "★" : "☆"), 9, Sc));
  }
}), oa = /* @__PURE__ */ oe(Cc, [["__scopeId", "data-v-ef63d763"]]), Ec = ["src"], Pc = /* @__PURE__ */ ae({
  __name: "RowPicture",
  props: {
    src: {}
  },
  setup(e) {
    const t = e, n = V(!1);
    return be(
      () => t.src,
      () => {
        n.value = !1;
      }
    ), (r, a) => e.src.trim() && !n.value ? (f(), h("img", {
      key: 0,
      class: "dc-picture",
      src: e.src,
      alt: "",
      loading: "lazy",
      decoding: "async",
      onError: a[0] || (a[0] = (s) => n.value = !0)
    }, null, 40, Ec)) : T("", !0);
  }
}), nr = /* @__PURE__ */ oe(Pc, [["__scopeId", "data-v-afaab300"]]), Ac = ["data-dc-standing", "title", "aria-label"], Tc = /* @__PURE__ */ ae({
  __name: "QueryMark",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = Ce(), r = p(() => Jn(t.entry.entity, t.entry.row)), a = p(() => na(n.query.value.expr, r.value)), s = p(
      () => a.value === "in" ? `The query narrows to ${t.entry.parts.identity} — press to lift that` : `The query leaves out ${t.entry.parts.identity} — press to lift that`
    );
    function l(i) {
      i.stopPropagation(), n.setExpression(Cs(n.query.value.expr, r.value));
    }
    return (i, o) => a.value ? (f(), h("button", {
      key: 0,
      type: "button",
      class: "dc-standing",
      "data-dc-standing": a.value,
      title: s.value,
      "aria-label": s.value,
      onClick: l
    }, N(a.value === "in" ? "+" : "−"), 9, Ac)) : T("", !0);
  }
}), la = /* @__PURE__ */ oe(Tc, [["__scopeId", "data-v-4b8d4166"]]), Lc = ["aria-label"], Oc = ["data-dc-standing", "data-dc-active", "aria-checked", "title", "aria-label", "onClick"], Rc = /* @__PURE__ */ ae({
  __name: "StandingControl",
  props: {
    standing: {},
    mixed: { type: Boolean },
    name: {}
  },
  emits: ["set"],
  setup(e, { emit: t }) {
    const n = e, r = t, a = p(() => [
      { standing: "in", sign: "+", hint: `Narrow the query to ${n.name}` },
      { standing: null, sign: "·", hint: `Let the query say nothing about ${n.name}` },
      { standing: "out", sign: "−", hint: `Leave ${n.name} out of the query` }
    ]), s = (i) => !n.mixed && n.standing === i;
    function l(i, o) {
      i.stopPropagation(), r("set", o);
    }
    return (i, o) => (f(), h("span", {
      class: "dc-standing-control",
      role: "radiogroup",
      "aria-label": `Where the query stands on ${e.name}`
    }, [
      (f(!0), h(te, null, he(a.value, (c) => (f(), h("button", {
        key: c.sign,
        type: "button",
        role: "radio",
        class: "dc-standing-control__choice",
        "data-dc-standing": c.standing ?? "none",
        "data-dc-active": s(c.standing) ? "true" : "false",
        "aria-checked": s(c.standing),
        title: c.hint,
        "aria-label": c.hint,
        onClick: (u) => l(u, c.standing)
      }, N(c.sign), 9, Oc))), 128))
    ], 8, Lc));
  }
}), Ir = /* @__PURE__ */ oe(Rc, [["__scopeId", "data-v-adaa8412"]]), Vs = /* @__PURE__ */ ae({
  __name: "RowStanding",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = Ce(), r = p(() => Jn(t.entry.entity, t.entry.row)), a = p(() => na(n.query.value.expr, r.value));
    function s(l) {
      n.setExpression(Rr(n.query.value.expr, r.value, l));
    }
    return (l, i) => r.value !== null ? (f(), Y(Ir, {
      key: 0,
      class: "dc-row-standing",
      standing: a.value,
      name: e.entry.parts.identity,
      onSet: s
    }, null, 8, ["standing", "name"])) : T("", !0);
  }
}), zc = ["href", "title", "aria-label"], Ic = /* @__PURE__ */ ae({
  __name: "OpenMark",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = Ce(), r = p(() => {
      const a = t.entry.row, s = n.recordHref?.(a) ?? null;
      return s ? n.pressHref(a) === s ? null : s : null;
    });
    return (a, s) => r.value ? (f(), h("a", {
      key: 0,
      class: "dc-open",
      href: r.value,
      target: "_blank",
      rel: "noopener noreferrer",
      title: r.value,
      "aria-label": `Open ${e.entry.parts.identity} in a new tab`,
      onClick: s[0] || (s[0] = Qe(() => {
      }, ["stop"]))
    }, "↗", 8, zc)) : T("", !0);
  }
}), hn = /* @__PURE__ */ oe(Ic, [["__scopeId", "data-v-b00f390d"]]), Nc = /* @__PURE__ */ ae({
  __name: "ScopeMark",
  props: {
    entry: {}
  },
  setup(e) {
    const t = e, n = Ce(), r = p(
      () => n.narrowsOnPress.value ? null : t.entry.entity?.scope ?? null
    ), a = V(null);
    function s(u) {
      a.value = tr(u).exclude ? "out" : "in";
    }
    function l(u) {
      s(u), window.addEventListener("keydown", s), window.addEventListener("keyup", s);
    }
    function i() {
      a.value = null, window.removeEventListener("keydown", s), window.removeEventListener("keyup", s);
    }
    Ie(i);
    const o = p(() => r.value ? n.drillHref(t.entry.row, null) : null);
    function c(u, m) {
      m.stopPropagation(), n.drill(t.entry.row, null, u);
    }
    return (u, m) => r.value ? (f(), Y(et, {
      key: 0,
      class: "dc-scope",
      href: o.value,
      "data-dc-pending": a.value ?? void 0,
      title: `Narrow everything to ${r.value}: ${e.entry.row.id} — ⌥-click to leave it out`,
      "aria-label": `Narrow everything to ${e.entry.parts.identity}`,
      onPointerenter: l,
      onPointermove: s,
      onPointerleave: i,
      onPress: c
    }, {
      default: Ee(() => [...m[0] || (m[0] = [
        Ae(" → ", -1)
      ])]),
      _: 1
    }, 8, ["href", "data-dc-pending", "title", "aria-label"])) : T("", !0);
  }
}), mn = /* @__PURE__ */ oe(Nc, [["__scopeId", "data-v-05d2c233"]]), Bc = ["checked", "aria-label"], At = /* @__PURE__ */ ae({
  __name: "SelectTick",
  props: {
    row: {},
    selected: { type: Boolean },
    name: {}
  },
  setup(e) {
    const t = e, n = Ce();
    function r(a) {
      a.stopPropagation(), n.toggleSelect(t.row);
    }
    return (a, s) => (f(), h("input", {
      class: "dc-tick",
      type: "checkbox",
      checked: e.selected,
      "aria-label": `Select ${e.name}`,
      onClick: r
    }, null, 8, Bc));
  }
}), Fc = { class: "dc-card__top dc-mono" }, Dc = { class: "dc-card__lead" }, Hc = {
  key: 2,
  class: "dc-card__entity"
}, qc = { class: "dc-card__top-right" }, Vc = { class: "dc-card__names" }, Kc = { class: "dc-card__primary" }, Wc = {
  key: 0,
  class: "dc-card__secondary dc-mono"
}, jc = {
  key: 1,
  class: "dc-card__facts dc-mono"
}, Uc = ["title"], Gc = { class: "dc-card__fact-label" }, Yc = {
  key: 0,
  class: "dc-card__metrics dc-mono"
}, Xc = {
  key: 0,
  class: "dc-card__date"
}, Qc = /* @__PURE__ */ ae({
  __name: "CardsView",
  setup(e) {
    const t = Ce(), n = Pt(), r = p(() => t.isEverything.value), a = (l) => l.entity?.card === "picture", s = p(() => n.value.length > 0 && n.value.every(a));
    return (l, i) => (f(), h("div", {
      class: Je(["dc-cards", { "dc-cards--pictures": s.value }])
    }, [
      (f(!0), h(te, null, he(L(n), (o) => (f(), h("div", {
        key: o.key,
        class: Je(["dc-card", { "dc-card--picture": a(o) }])
      }, [
        E("div", Fc, [
          E("span", Dc, [
            L(t).selectable.value ? (f(), Y(At, {
              key: 0,
              row: o.row,
              selected: o.selected,
              name: o.parts.identity
            }, null, 8, ["row", "selected", "name"])) : T("", !0),
            a(o) ? T("", !0) : (f(), h(te, { key: 1 }, [
              Ae(N(o.ordinal), 1)
            ], 64)),
            r.value ? (f(), h("span", Hc, N(o.entityLabel), 1)) : T("", !0)
          ]),
          E("span", qc, [
            o.parts.state && !a(o) ? (f(), Y(pn, {
              key: 0,
              status: o.parts.state
            }, null, 8, ["status"])) : T("", !0),
            a(o) ? (f(), Y(la, {
              key: 1,
              entry: o
            }, null, 8, ["entry"])) : (f(), Y(Vs, {
              key: 2,
              entry: o
            }, null, 8, ["entry"])),
            de(mn, { entry: o }, null, 8, ["entry"]),
            de(hn, { entry: o }, null, 8, ["entry"]),
            L(t).pinnable.value ? (f(), Y(oa, {
              key: 3,
              row: o.row,
              name: o.parts.identity,
              pinned: o.pinned
            }, null, 8, ["row", "name", "pinned"])) : T("", !0)
          ])
        ]),
        de(et, {
          class: "dc-card__open",
          href: L(t).pressHref(o.row),
          onPress: (c) => L(t).activate(o.row, c)
        }, {
          default: Ee(() => [
            o.parts.image ? (f(), Y(nr, {
              key: 0,
              class: "dc-card__image",
              src: o.parts.image
            }, null, 8, ["src"])) : T("", !0),
            E("span", Vc, [
              E("span", Kc, N(o.parts.identity), 1),
              a(o) ? T("", !0) : (f(), h("span", Wc, N(o.parts.reference), 1)),
              o.parts.facts.length ? (f(), h("span", jc, [
                (f(!0), h(te, null, he(o.parts.facts, (c) => (f(), h("span", {
                  key: c.column.key ?? c.label,
                  class: "dc-card__fact",
                  title: c.title || void 0
                }, [
                  E("span", Gc, N(c.label), 1),
                  Ae(" " + N(c.text), 1)
                ], 8, Uc))), 128))
              ])) : T("", !0)
            ])
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        a(o) ? T("", !0) : (f(), h("div", Yc, [
          (f(!0), h(te, null, he(o.parts.metrics.slice(0, 2), (c) => (f(), Y(vn, {
            key: c.column.key ?? c.label,
            entry: o,
            column: c.column
          }, {
            default: Ee(() => [
              Ae(N(c.label) + " " + N(c.text), 1)
            ]),
            _: 2
          }, 1032, ["entry", "column"]))), 128)),
          o.parts.updated ? (f(), h("span", Xc, N(o.parts.updated), 1)) : T("", !0)
        ]))
      ], 2))), 128))
    ], 2));
  }
}), Ks = /* @__PURE__ */ oe(Qc, [["__scopeId", "data-v-fd252138"]]), Zc = { class: "dc-grid" }, Jc = { class: "dc-tile__scrim" }, eu = { class: "dc-tile__top dc-mono" }, tu = { class: "dc-tile__chip" }, nu = { class: "dc-tile__caption" }, ru = { class: "dc-tile__secondary dc-truncate" }, au = { class: "dc-tile__primary" }, su = /* @__PURE__ */ ae({
  __name: "GridView",
  setup(e) {
    const t = Ce(), n = Pt();
    return (r, a) => (f(), h("div", Zc, [
      (f(!0), h(te, null, he(L(n), (s) => (f(), h("div", {
        key: s.key,
        class: "dc-grid__cell"
      }, [
        de(et, {
          class: "dc-tile",
          style: xe({ "--dc-tile-tint": s.parts.tint ?? void 0 }),
          href: L(t).pressHref(s.row),
          onPress: (l) => L(t).activate(s.row, l)
        }, {
          default: Ee(() => [
            s.parts.image ? (f(), Y(nr, {
              key: 0,
              class: "dc-tile__image",
              src: s.parts.image
            }, null, 8, ["src"])) : T("", !0),
            E("span", Jc, [
              E("span", eu, [
                E("span", tu, N(s.ordinal), 1)
              ]),
              E("span", nu, [
                E("span", ru, N(s.parts.reference), 1),
                E("span", au, N(s.parts.identity), 1)
              ])
            ])
          ]),
          _: 2
        }, 1032, ["style", "href", "onPress"]),
        L(t).selectable.value ? (f(), Y(At, {
          key: 0,
          class: "dc-grid__tick",
          row: s.row,
          selected: s.selected,
          name: s.parts.identity
        }, null, 8, ["row", "selected", "name"])) : T("", !0)
      ]))), 128))
    ]));
  }
}), Ws = /* @__PURE__ */ oe(su, [["__scopeId", "data-v-89c40a9e"]]);
function qa(e, t, n, r) {
  return (n - r * (t - 1)) / e;
}
function yr(e, t) {
  return e > 0 ? Math.min(t, e) : t;
}
function ou(e) {
  return e > 0 ? e : 1 / 0;
}
function lu(e, t, n) {
  const { width: r, height: a, gap: s = 0 } = n;
  if (!e.length) return [];
  if (!(r > 0) || !(a > 0)) return [{ items: [...e], height: a, filled: !1 }];
  const l = [];
  let i = [], o = 0, c = 0;
  for (const u of e) {
    const m = t(u), $ = Math.max(m.ratio, Number.EPSILON), w = m.height && m.height > 0 ? Math.max(c, m.height) : c, b = yr(w, a), g = qa(o + $, i.length + 1, r, s);
    if (g > b) {
      i.push(u), o += $, c = w;
      continue;
    }
    const M = yr(c, a), y = i.length ? qa(o, i.length, r, s) : 1 / 0;
    y <= ou(c) && y - M < b - g ? (l.push({ items: i, height: y, filled: !0 }), i = [u], o = $, c = m.height && m.height > 0 ? m.height : 0) : (l.push({ items: [...i, u], height: g, filled: !0 }), i = [], o = 0, c = 0);
  }
  return i.length && l.push({ items: i, height: yr(c, a), filled: !1 }), l;
}
const iu = { class: "dc-images" }, cu = {
  key: 1,
  class: "dc-images__blank",
  "aria-hidden": "true"
}, uu = 240, $n = 8, du = 1, fu = /* @__PURE__ */ ae({
  __name: "ImagesView",
  setup(e) {
    const t = Ce(), n = Pt(), r = Ca(/* @__PURE__ */ new Map()), a = Ca(/* @__PURE__ */ new Set());
    function s(b, g) {
      const M = g.target;
      M.naturalWidth > 0 && M.naturalHeight > 0 && r.set(b, { width: M.naturalWidth, height: M.naturalHeight });
    }
    function l(b) {
      const g = b.parts.image;
      return g && !a.has(g) ? g : null;
    }
    function i(b) {
      const g = l(b);
      return g ? r.get(g) : void 0;
    }
    function o(b) {
      const g = i(b);
      return g ? { ratio: g.width / g.height, height: g.height } : { ratio: du };
    }
    const c = V(null), u = V(0);
    let m = null;
    function $() {
      u.value = c.value?.clientWidth ?? 0;
    }
    un(() => {
      $(), !(!c.value || typeof ResizeObserver > "u") && (m = new ResizeObserver($), m.observe(c.value));
    }), Ie(() => {
      m?.disconnect(), m = null;
    });
    const w = p(() => {
      const b = lu(n.value, o, {
        width: u.value,
        height: uu,
        gap: $n
      }), g = [];
      let M = 0;
      for (const y of b) {
        let C = 0;
        for (const k of y.items) {
          const x = o(k).ratio * y.height, S = i(k), B = S !== void 0 && S.height < y.height;
          g.push({
            entry: k,
            style: {
              top: `${M}px`,
              left: `${C}px`,
              width: `${x}px`,
              height: `${y.height}px`
            },
            picture: B ? { width: `${S.width}px`, height: `${S.height}px` } : { width: "100%", height: "100%" }
          }), C += x + $n;
        }
        M += y.height + $n;
      }
      return { boxes: g, height: b.length ? M - $n : 0 };
    });
    return (b, g) => (f(), h("div", iu, [
      E("div", {
        ref_key: "wall",
        ref: c,
        class: "dc-images__wall",
        style: xe({ height: `${w.value.height}px` })
      }, [
        (f(!0), h(te, null, he(w.value.boxes, ({ entry: M, style: y, picture: C }) => (f(), h("div", {
          key: M.key,
          class: "dc-images__cell",
          style: xe(y)
        }, [
          de(et, {
            class: "dc-images__open",
            title: M.parts.identity,
            "aria-label": M.parts.identity,
            href: L(t).pressHref(M.row),
            onPress: (k) => L(t).activate(M.row, k)
          }, {
            default: Ee(() => [
              l(M) ? (f(), Y(nr, {
                key: 0,
                class: "dc-images__picture",
                style: xe(C),
                src: l(M),
                onLoad: (k) => s(l(M), k),
                onError: (k) => a.add(l(M))
              }, null, 8, ["style", "src", "onLoad", "onError"])) : (f(), h("span", cu, N(M.parts.identity), 1))
            ]),
            _: 2
          }, 1032, ["title", "aria-label", "href", "onPress"]),
          L(t).selectable.value ? (f(), Y(At, {
            key: 0,
            class: "dc-images__tick",
            row: M.row,
            selected: M.selected,
            name: M.parts.identity
          }, null, 8, ["row", "selected", "name"])) : T("", !0)
        ], 4))), 128))
      ], 4)
    ]));
  }
}), js = /* @__PURE__ */ oe(fu, [["__scopeId", "data-v-2d267370"]]), pu = { class: "dc-links" }, vu = { class: "dc-link__primary dc-truncate" }, hu = { class: "dc-link__secondary dc-mono dc-truncate" }, mu = /* @__PURE__ */ ae({
  __name: "LinksView",
  setup(e) {
    const t = Ce(), n = Pt();
    return (r, a) => (f(), h("div", pu, [
      (f(!0), h(te, null, he(L(n), (s) => (f(), h("span", {
        key: s.key,
        class: "dc-links__item"
      }, [
        L(t).selectable.value ? (f(), Y(At, {
          key: 0,
          row: s.row,
          selected: s.selected,
          name: s.parts.identity
        }, null, 8, ["row", "selected", "name"])) : T("", !0),
        de(et, {
          class: "dc-link",
          href: L(t).pressHref(s.row),
          onPress: (l) => L(t).activate(s.row, l)
        }, {
          default: Ee(() => [
            E("span", vu, N(s.parts.identity), 1),
            E("span", hu, N(s.parts.reference), 1)
          ]),
          _: 2
        }, 1032, ["href", "onPress"])
      ]))), 128))
    ]));
  }
}), Us = /* @__PURE__ */ oe(mu, [["__scopeId", "data-v-de6c9a0f"]]), gu = {
  class: "dc-list",
  role: "list"
}, yu = { class: "dc-list__ordinal dc-mono" }, _u = { class: "dc-list__identity" }, wu = { class: "dc-list__primary dc-truncate" }, ku = { class: "dc-list__secondary dc-mono dc-truncate" }, bu = {
  key: 1,
  class: "dc-list__entity dc-mono"
}, $u = { class: "dc-list__metrics dc-mono" }, xu = { class: "dc-list__trailing" }, Mu = /* @__PURE__ */ ae({
  __name: "ListView",
  setup(e) {
    const t = Ce(), n = Pt(), r = p(() => t.isEverything.value);
    return (a, s) => (f(), h("div", gu, [
      (f(!0), h(te, null, he(L(n), (l) => (f(), h("div", {
        key: l.key,
        class: "dc-list__row",
        role: "listitem"
      }, [
        L(t).selectable.value ? (f(), Y(At, {
          key: 0,
          class: "dc-list__tick",
          row: l.row,
          selected: l.selected,
          name: l.parts.identity
        }, null, 8, ["row", "selected", "name"])) : T("", !0),
        de(Vs, {
          class: "dc-list__standing",
          entry: l
        }, null, 8, ["entry"]),
        de(et, {
          class: "dc-list__open",
          href: L(t).pressHref(l.row),
          onPress: (i) => L(t).activate(l.row, i)
        }, {
          default: Ee(() => [
            E("span", yu, N(l.ordinal), 1),
            E("span", _u, [
              E("span", wu, N(l.parts.identity), 1),
              E("span", ku, N(l.parts.reference), 1)
            ])
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        r.value ? (f(), h("span", bu, N(l.entityLabel), 1)) : T("", !0),
        E("span", $u, [
          (f(!0), h(te, null, he(l.parts.metrics.slice(0, 2), (i) => (f(), Y(vn, {
            key: i.column.key ?? i.label,
            entry: l,
            column: i.column
          }, null, 8, ["entry", "column"]))), 128))
        ]),
        E("span", xu, [
          l.parts.state ? (f(), Y(pn, {
            key: 0,
            status: l.parts.state
          }, null, 8, ["status"])) : T("", !0),
          de(mn, { entry: l }, null, 8, ["entry"]),
          de(hn, { entry: l }, null, 8, ["entry"]),
          L(t).pinnable.value ? (f(), Y(oa, {
            key: 1,
            row: l.row,
            name: l.parts.identity,
            pinned: l.pinned
          }, null, 8, ["row", "name", "pinned"])) : T("", !0)
        ])
      ]))), 128))
    ]));
  }
}), Nr = /* @__PURE__ */ oe(Mu, [["__scopeId", "data-v-3d349a10"]]), Su = { class: "dc-preview" }, Cu = { class: "dc-preview__pager dc-mono" }, Eu = ["disabled"], Pu = { "aria-live": "polite" }, Au = ["disabled"], Tu = {
  key: 0,
  class: "dc-preview__card"
}, Lu = ["src"], Ou = { class: "dc-preview__body" }, Ru = { class: "dc-preview__top" }, zu = { class: "dc-preview__badges" }, Iu = { class: "dc-preview__entity dc-mono" }, Nu = { class: "dc-preview__marks" }, Bu = { class: "dc-preview__primary" }, Fu = { class: "dc-preview__secondary dc-mono" }, Du = { class: "dc-preview__fields" }, Hu = { class: "dc-preview__key" }, qu = { class: "dc-preview__value dc-mono" }, Vu = /* @__PURE__ */ ae({
  __name: "PreviewView",
  setup(e) {
    const t = Ce(), n = Pt(), r = V(0);
    be(n, (o) => {
      r.value > o.length - 1 && (r.value = Math.max(0, o.length - 1));
    });
    const a = p(() => n.value[r.value]), s = p(() => {
      const o = a.value;
      if (!o) return [];
      const c = Xe(o.columns, "reference"), u = Xe(o.columns, "updated");
      return [
        ...c ? [{ key: c.label ?? "Reference", value: o.parts.reference, column: null }] : [],
        ...o.parts.metrics.map((m) => ({
          key: m.label,
          value: m.text,
          column: m.column
        })),
        ...u ? [{ key: u.label ?? "Updated", value: o.parts.updated, column: null }] : []
      ];
    }), l = p(() => {
      if (!n.value.length) return "0 / 0";
      const o = t.total.value > n.value.length ? ` of ${t.total.value}` : "";
      return `${r.value + 1} / ${n.value.length}${o}`;
    }), i = (o) => {
      const c = n.value.length;
      c && (r.value = Math.min(c - 1, Math.max(0, r.value + o)));
    };
    return (o, c) => (f(), h("div", Su, [
      E("div", Cu, [
        E("button", {
          type: "button",
          class: "dc-preview__step",
          "aria-label": "Previous result",
          disabled: r.value === 0,
          onClick: c[0] || (c[0] = (u) => i(-1))
        }, " ‹ ", 8, Eu),
        E("span", Pu, N(l.value), 1),
        E("button", {
          type: "button",
          class: "dc-preview__step",
          "aria-label": "Next result",
          disabled: r.value >= L(n).length - 1,
          onClick: c[1] || (c[1] = (u) => i(1))
        }, " › ", 8, Au)
      ]),
      a.value ? (f(), h("div", Tu, [
        E("div", {
          class: "dc-preview__media",
          style: xe({ background: a.value.parts.tint ?? void 0 }),
          "aria-hidden": "true"
        }, [
          a.value.parts.image ? (f(), h("img", {
            key: 0,
            class: "dc-preview__image",
            src: a.value.parts.image,
            alt: ""
          }, null, 8, Lu)) : (f(), h(te, { key: 1 }, [
            Ae(" preview ")
          ], 64))
        ], 4),
        E("div", Ou, [
          E("div", Ru, [
            E("span", zu, [
              L(t).selectable.value ? (f(), Y(At, {
                key: 0,
                row: a.value.row,
                selected: a.value.selected,
                name: a.value.parts.identity
              }, null, 8, ["row", "selected", "name"])) : T("", !0),
              a.value.parts.state ? (f(), Y(pn, {
                key: 1,
                status: a.value.parts.state
              }, null, 8, ["status"])) : T("", !0),
              E("span", Iu, N(a.value.entityLabel), 1)
            ]),
            E("span", Nu, [
              de(la, { entry: a.value }, null, 8, ["entry"]),
              de(mn, { entry: a.value }, null, 8, ["entry"]),
              de(hn, { entry: a.value }, null, 8, ["entry"]),
              L(t).pinnable.value ? (f(), Y(oa, {
                key: 0,
                row: a.value.row,
                name: a.value.parts.identity,
                pinned: a.value.pinned
              }, null, 8, ["row", "name", "pinned"])) : T("", !0)
            ])
          ]),
          E("div", null, [
            E("div", Bu, N(a.value.parts.identity), 1),
            E("div", Fu, N(a.value.parts.reference), 1)
          ]),
          E("dl", Du, [
            (f(!0), h(te, null, he(s.value, (u) => (f(), h("div", {
              key: u.key,
              class: "dc-preview__field"
            }, [
              E("dt", Hu, N(u.key), 1),
              E("dd", qu, [
                u.column && a.value ? (f(), Y(vn, {
                  key: 0,
                  entry: a.value,
                  column: u.column
                }, null, 8, ["entry", "column"])) : (f(), h(te, { key: 1 }, [
                  Ae(N(u.value), 1)
                ], 64))
              ])
            ]))), 128))
          ]),
          de(et, {
            class: "dc-preview__open",
            href: a.value ? L(t).pressHref(a.value.row) : null,
            onPress: c[2] || (c[2] = (u) => a.value && L(t).activate(a.value.row, u))
          }, {
            default: Ee(() => [...c[3] || (c[3] = [
              Ae(" Open record → ", -1)
            ])]),
            _: 1
          }, 8, ["href"])
        ])
      ])) : T("", !0)
    ]));
  }
}), Gs = /* @__PURE__ */ oe(Vu, [["__scopeId", "data-v-59e0d33b"]]);
function Ku() {
  const e = Ce();
  return p(() => yl(e.schema.value, e.entity.value));
}
const Wu = {
  key: 5,
  class: "dc-cell__text"
}, ju = /* @__PURE__ */ ae({
  __name: "ColumnCell",
  props: {
    column: {},
    entry: {}
  },
  setup(e) {
    const t = e, n = Ce(), r = p(() => t.column.kind ?? "text"), a = p(() => He(t.column, t.entry.row)), s = p(
      () => r.value === "ordinal" ? t.entry.ordinal : Bt(t.column, t.entry.row)
    ), l = p(() => a.value), i = p(() => t.column.activate === !0 || !!t.column.click), o = p(() => Tr(t.column)), c = p(() => ds(t.column, t.entry.row));
    function u(w) {
      i.value && (w.stopPropagation(), m(tr(w)));
    }
    function m(w) {
      t.column.click?.(t.entry.row, w), t.column.activate && n.activate(t.entry.row, w);
    }
    const $ = p(
      () => t.column.activate && !t.column.click ? n.pressHref(t.entry.row) : null
    );
    return (w, b) => r.value === "component" && e.column.component ? (f(), Y(jn(e.column.component), {
      key: 0,
      row: e.entry.row,
      entry: e.entry,
      value: a.value,
      column: e.column
    }, null, 8, ["row", "entry", "value", "column"])) : r.value === "status" ? (f(), Y(pn, {
      key: 1,
      status: l.value
    }, null, 8, ["status"])) : r.value === "image" ? (f(), Y(nr, {
      key: 2,
      class: "dc-cell__image",
      src: typeof a.value == "string" ? a.value : "",
      style: xe({ maxHeight: e.column.height }),
      onClick: u
    }, null, 8, ["src", "style"])) : e.column.drill ? (f(), Y(vn, {
      key: 3,
      entry: e.entry,
      column: e.column
    }, null, 8, ["entry", "column"])) : i.value ? (f(), Y(et, {
      key: 4,
      class: Je(["dc-table__open", { "dc-truncate": o.value }]),
      href: $.value,
      title: c.value,
      onPress: b[0] || (b[0] = (g, M) => {
        M.stopPropagation(), m(g);
      })
    }, {
      default: Ee(() => [
        Ae(N(s.value), 1)
      ]),
      _: 1
    }, 8, ["class", "href", "title"])) : (f(), h("span", Wu, N(s.value), 1));
  }
}), Va = /* @__PURE__ */ oe(ju, [["__scopeId", "data-v-4dd1835e"]]), Uu = {
  key: 0,
  class: "dc-table__none"
}, Gu = { class: "dc-table__detail" }, Yu = ["data-dc-wrap"], Xu = { "data-dc-stuck": "" }, Qu = {
  key: 0,
  class: "dc-table__pick",
  scope: "col"
}, Zu = {
  key: 1,
  class: "dc-table__standing",
  scope: "col"
}, Ju = ["data-dc-align", "data-dc-hide", "aria-sort", "title"], ed = ["onClick"], td = {
  key: 2,
  class: "dc-table__head"
}, nd = ["onClick"], rd = {
  key: 0,
  class: "dc-table__pick"
}, ad = {
  key: 1,
  class: "dc-table__standing"
}, sd = ["data-dc-align", "data-dc-hide", "title"], od = {
  key: 0,
  class: "dc-table__name"
}, ld = /* @__PURE__ */ ae({
  __name: "TableView",
  setup(e) {
    const t = Ce(), n = Pt(), r = Ku();
    function a(P, K) {
      const W = t.pressHref(P);
      if (W && Es(K)) {
        const X = K.shiftKey ? `noopener,popup,width=${window.outerWidth},height=${window.outerHeight}` : "noopener";
        window.open(W, "_blank", X);
        return;
      }
      t.activate(P, tr(K));
    }
    function s(P) {
      const K = ms(P, t.entity.value, t.schema.value), W = K ? `Shortcut: ${K}` : void 0;
      return [P.hint, W].filter(Boolean).join(`
`) || void 0;
    }
    const l = p(() => {
      const P = r.value.find((W) => W.scope);
      return P || ((t.entity.value ? !!t.entity.value.href : t.entities.value.some((W) => W.href)) ? r.value.find((W) => W.activate) : void 0);
    }), i = p(
      () => t.entity.value ? !!t.entity.value.scope : t.entities.value.some((P) => P.scope)
    ), o = (P) => Jn(P.entity, P.row), c = (P) => na(t.query.value.expr, o(P));
    function u(P, K) {
      t.setExpression(Rr(t.query.value.expr, o(P), K));
    }
    const m = p(() => {
      const P = n.value.filter((W) => o(W) !== null), K = P.filter((W) => W.selected);
      return K.length ? K : P;
    }), $ = p(() => m.value.some((P) => P.selected)), w = p(() => {
      const P = m.value[0];
      return P ? c(P) : null;
    }), b = p(
      () => m.value.some((P) => c(P) !== w.value)
    ), g = p(
      () => $.value ? "the ticked rows" : "every row on this page"
    );
    function M(P) {
      t.setExpression(
        m.value.reduce(
          (K, W) => Rr(K, o(W), P),
          t.query.value.expr
        )
      );
    }
    const y = p(
      () => r.value.some((P) => P.kind === "image" || P.height !== void 0)
    );
    function C(P) {
      P && (t.query.value.sort === P ? t.toggleDirection() : t.setSort(P));
    }
    const k = p(() => t.entity.value?.label ?? "The result set"), x = p(() => new Set(t.sorts.value.map((P) => P.key))), S = (P) => P.sort !== void 0 && x.value.has(P.sort), B = (P) => {
      if (S(P))
        return t.query.value.sort !== P.sort ? "none" : t.query.value.dir === "desc" ? "descending" : "ascending";
    };
    function A(P) {
      return [
        Ta(P),
        P.muted ? "dc-table__muted" : "",
        P.mono ? "dc-mono" : "",
        Tr(P) ? "dc-truncate" : ""
      ].filter(Boolean).join(" ");
    }
    function R(P, K) {
      if (!(!Tr(P) || P.activate || P.click))
        return ds(P, K.row);
    }
    return (P, K) => L(r).length ? (f(), h("table", {
      key: 1,
      class: "dc-table",
      "data-dc-wrap": y.value ? "" : void 0
    }, [
      E("thead", Xu, [
        E("tr", null, [
          L(t).selectable.value ? (f(), h("th", Qu, [
            de(Ds)
          ])) : T("", !0),
          i.value ? (f(), h("th", Zu, [
            m.value.length ? (f(), Y(Ir, {
              key: 0,
              standing: w.value,
              mixed: b.value,
              name: g.value,
              onSet: M
            }, null, 8, ["standing", "mixed", "name"])) : T("", !0)
          ])) : T("", !0),
          (f(!0), h(te, null, he(L(r), (W, X) => (f(), h("th", {
            key: L(Pa)(W, X),
            scope: "col",
            class: Je(L(Ta)(W)),
            style: xe({ width: W.width }),
            "data-dc-align": L(Aa)(W),
            "data-dc-hide": W.hideBelow,
            "aria-sort": B(W),
            title: s(W)
          }, [
            S(W) ? (f(), h("button", {
              key: 0,
              type: "button",
              class: "dc-table__sort",
              onClick: (ge) => C(W.sort)
            }, N(W.label), 9, ed)) : (f(), h(te, { key: 1 }, [
              Ae(N(W.label), 1)
            ], 64)),
            W.header ? (f(), h("span", td, [
              (f(), Y(jn(W.header), {
                column: W,
                entity: L(t).entity.value
              }, null, 8, ["column", "entity"]))
            ])) : T("", !0)
          ], 14, Ju))), 128))
        ])
      ]),
      E("tbody", null, [
        (f(!0), h(te, null, he(L(n), (W) => (f(), h("tr", {
          key: W.key,
          class: "dc-table__row",
          onClick: (X) => a(W.row, X)
        }, [
          L(t).selectable.value ? (f(), h("td", rd, [
            de(At, {
              row: W.row,
              selected: W.selected,
              name: W.parts.identity
            }, null, 8, ["row", "selected", "name"])
          ])) : T("", !0),
          i.value ? (f(), h("td", ad, [
            o(W) !== null ? (f(), Y(Ir, {
              key: 0,
              standing: c(W),
              name: W.parts.identity,
              onSet: (X) => u(W, X)
            }, null, 8, ["standing", "name", "onSet"])) : T("", !0)
          ])) : T("", !0),
          (f(!0), h(te, null, he(L(r), (X, ge) => (f(), h("td", {
            key: L(Pa)(X, ge),
            class: Je(A(X)),
            "data-dc-align": L(Aa)(X),
            "data-dc-hide": X.hideBelow,
            title: R(X, W)
          }, [
            X === l.value ? (f(), h("span", od, [
              de(Va, {
                column: X,
                entry: W
              }, null, 8, ["column", "entry"]),
              de(mn, { entry: W }, null, 8, ["entry"]),
              de(hn, { entry: W }, null, 8, ["entry"])
            ])) : (f(), Y(Va, {
              key: 1,
              column: X,
              entry: W
            }, null, 8, ["column", "entry"]))
          ], 10, sd))), 128))
        ], 8, nd))), 128))
      ])
    ], 8, Yu)) : (f(), h("p", Uu, [
      K[2] || (K[2] = E("span", { class: "dc-table__headline" }, "No columns declared", -1)),
      E("span", Gu, [
        Ae(N(k.value) + " has no ", 1),
        K[0] || (K[0] = E("code", null, "columns", -1)),
        K[1] || (K[1] = Ae(" in the schema, so there is no table to draw. ", -1))
      ])
    ]));
  }
}), Ys = /* @__PURE__ */ oe(ld, [["__scopeId", "data-v-02bea582"]]);
function id(e) {
  const t = ft([]), n = V(!1), r = ft(null);
  let a = 0;
  const s = (o, c, u, m, $) => ({
    entity: o,
    rows: e.limit.value > 0 ? c.rows.map((w, b) => qs(w, b, o, e.isPinned(w.id))) : [],
    total: c.total,
    count: u ? Ar(o) : Rn(c.total),
    pinned: cd(m, c, $)
  }), l = () => {
    const o = ++a, c = e.query.value, u = e.schema.value, m = e.entities.value, $ = e.limit.value, w = e.within?.value.trim() ?? "", b = Ur(c) && !w, g = w ? Zr(w, c.expr) : c.expr, M = m.map((y) => ({
      entity: y,
      // Scope the query to this entity, keeping the expression and ordering.
      outcome: e.source.value.query({
        // Each card is the top few of its type, wherever the shell's own
        // result set has been paged to — so this asks for the first page.
        query: { ...c, entity: y.key, expr: g, page: 1 },
        schema: u,
        entity: y,
        /*
         * One row where none are shown, not none: to a source a limit of 0 is
         * no limit, which would fetch every record of every type to draw a
         * count. The one row is still read — it is what says whether the type
         * holds nothing but the record the query named.
         */
        limit: Math.max($, 1),
        offset: 0
      })
    }));
    if (M.every(({ outcome: y }) => !(y instanceof Promise))) {
      t.value = M.map(
        ({ entity: y, outcome: C }) => s(y, C, b, u, g)
      ), r.value = null, n.value = !1;
      return;
    }
    n.value = !0, Promise.all(M.map(({ outcome: y }) => Promise.resolve(y))).then((y) => {
      o === a && (t.value = y.map(
        (C, k) => s(M[k].entity, C, b, u, g)
      ), r.value = null);
    }).catch((y) => {
      o === a && (r.value = y, t.value = []);
    }).finally(() => {
      o === a && (n.value = !1);
    });
  }, i = () => {
    try {
      l();
    } catch (o) {
      r.value = o, t.value = [], n.value = !1;
    }
  };
  return be(
    [
      e.source,
      e.schema,
      e.query,
      e.entities,
      e.limit,
      () => e.within?.value
    ],
    i,
    { immediate: !0 }
  ), { previews: t, pending: n, error: r, refresh: i };
}
function cd(e, t, n) {
  const r = t.rows[0];
  if (t.total !== 1 || t.rows.length !== 1 || !r)
    return !1;
  const a = n.trim();
  if (!a)
    return !1;
  const s = Bn(e, r);
  return !!s && fn(a, s) === a;
}
const ud = ["data-dc-pending", "data-dc-heads-only"], dd = {
  key: 0,
  class: "dc-types__state",
  role: "alert"
}, fd = {
  key: 1,
  class: "dc-types__state",
  "aria-live": "polite"
}, pd = {
  key: 2,
  class: "dc-types__state"
}, vd = ["data-dc-empty"], hd = { class: "dc-type__name" }, md = { class: "dc-type__count dc-mono" }, gd = { class: "dc-type__sr" }, yd = {
  key: 0,
  class: "dc-type__description"
}, _d = {
  key: 0,
  class: "dc-type__empty"
}, wd = { class: "dc-type__identity" }, kd = { class: "dc-type__primary dc-truncate" }, bd = { class: "dc-type__secondary dc-mono dc-truncate" }, $d = { class: "dc-type__trailing dc-mono" }, xd = { class: "dc-type__metric-value" }, Md = { class: "dc-type__metric-label" }, Sd = {
  key: 0,
  class: "dc-type__date"
}, Cd = ["onClick"], Ed = /* @__PURE__ */ ae({
  __name: "TypeCardsView",
  setup(e) {
    const t = Ce(), { previews: n, pending: r, error: a } = id({
      source: t.source,
      schema: t.schema,
      // The query as the results are read under it, so a word being typed in the
      // header narrows the cards as it narrows any list — see `liveQuery`.
      query: t.liveQuery,
      entities: t.entities,
      limit: t.previewsPerType,
      within: t.within,
      isPinned: (o) => t.isPinnedId(o)
    }), s = p(
      () => !t.isPristine.value || !!t.within.value || t.drafting.value
    ), l = p(() => t.previewsPerType.value <= 0), i = p(
      () => n.value.filter(
        (o) => !o.pinned && (o.total > 0 || !l.value && o.entity.create)
      )
    );
    return (o, c) => (f(), h("div", {
      class: "dc-types",
      "data-dc-pending": L(r) ? "true" : "false",
      "data-dc-heads-only": l.value ? "true" : "false"
    }, [
      we(o.$slots, "before", {}, void 0, !0),
      L(a) ? (f(), h("p", dd, " Could not load results: " + N(L(a) instanceof Error ? L(a).message : "the data source failed."), 1)) : !i.value.length && L(r) ? (f(), h("p", fd, " Running query… ")) : i.value.length ? T("", !0) : (f(), h("p", pd, N(s.value ? "Nothing matches this query" : "Nothing here yet"), 1)),
      (f(!0), h(te, null, he(i.value, (u) => (f(), h("section", {
        key: u.entity.key,
        class: "dc-type",
        "data-dc-empty": u.total ? "false" : "true"
      }, [
        de(et, {
          class: "dc-type__head",
          href: L(t).entityHref(u.entity.key),
          onPress: (m) => L(t).setEntity(u.entity.key)
        }, {
          default: Ee(() => [
            E("span", hd, N(u.entity.label), 1),
            E("span", md, N(u.count), 1),
            c[0] || (c[0] = E("span", {
              class: "dc-type__go",
              "aria-hidden": "true"
            }, "→", -1)),
            E("span", gd, "Show only " + N(u.entity.label.toLowerCase()), 1),
            u.entity.description ? (f(), h("span", yd, N(u.entity.description), 1)) : T("", !0)
          ]),
          _: 2
        }, 1032, ["href", "onPress"]),
        u.total ? T("", !0) : (f(), h("p", _d, N(s.value ? "No matches" : "Nothing here yet"), 1)),
        (f(!0), h(te, null, he(u.rows, (m) => (f(), h("div", {
          key: m.key,
          class: "dc-type__row"
        }, [
          de(et, {
            class: "dc-type__open",
            href: L(t).pressHref(m.row),
            onPress: ($) => L(t).activate(m.row, $)
          }, {
            default: Ee(() => [
              E("span", wd, [
                E("span", kd, N(m.parts.identity), 1),
                E("span", bd, N(m.parts.reference), 1)
              ])
            ]),
            _: 2
          }, 1032, ["href", "onPress"]),
          E("span", $d, [
            (f(!0), h(te, null, he(m.parts.metrics.slice(0, 1), ($) => (f(), Y(vn, {
              key: $.column.key ?? $.label,
              class: "dc-type__metric",
              entry: m,
              column: $.column
            }, {
              default: Ee(() => [
                E("span", xd, N($.text), 1),
                E("span", Md, N($.label), 1)
              ]),
              _: 2
            }, 1032, ["entry", "column"]))), 128)),
            m.parts.updated ? (f(), h("span", Sd, N(m.parts.updated), 1)) : T("", !0),
            de(la, { entry: m }, null, 8, ["entry"]),
            de(mn, { entry: m }, null, 8, ["entry"]),
            de(hn, { entry: m }, null, 8, ["entry"])
          ])
        ]))), 128)),
        u.entity.create && !l.value ? (f(), h("button", {
          key: 1,
          type: "button",
          class: "dc-type__new",
          onClick: (m) => L(t).create(u.entity)
        }, [
          c[1] || (c[1] = E("span", {
            class: "dc-type__plus",
            "aria-hidden": "true"
          }, "+", -1)),
          Ae(" " + N(u.entity.create), 1)
        ], 8, Cd)) : T("", !0)
      ], 8, vd))), 128)),
      we(o.$slots, "after", {}, void 0, !0)
    ], 8, ud));
  }
}), Xs = /* @__PURE__ */ oe(Ed, [["__scopeId", "data-v-91923a83"]]), Pd = ["data-dc-pending", "data-dc-more"], Ad = {
  key: 0,
  class: "dc-results__state dc-results__state--loading",
  "aria-live": "polite"
}, Td = {
  key: 2,
  class: "dc-results__state",
  role: "alert"
}, Ld = { class: "dc-results__detail" }, Od = {
  key: 3,
  class: "dc-results__state",
  "aria-live": "polite"
}, Rd = {
  key: 4,
  class: "dc-results__state"
}, zd = { class: "dc-results__detail" }, Id = /* @__PURE__ */ ae({
  __name: "ResultsArea",
  props: {
    views: {},
    loading: { type: Boolean }
  },
  setup(e) {
    const t = e, n = Ce(), r = cn(), a = {
      list: Nr,
      cards: Ks,
      grid: Ws,
      images: js,
      table: Ys,
      links: Us,
      preview: Gs
    }, s = p(() => Gr(n.query.value, t.views)), l = p(() => jr(n.query.value.view, t.views)), i = p(() => a[l.value] ?? Nr), o = p(() => n.rows.value.length > 0), c = p(() => n.error.value !== null), u = V(null);
    be(
      // The page on screen, which is the draft's own while one is being typed.
      () => n.liveQuery.value.page,
      () => {
        u.value && (u.value.scrollTop = 0);
      }
    );
    const m = V(""), $ = V({ x: 0, y: 0 }), w = V(0);
    function b() {
      const y = u.value;
      if (!y) {
        m.value = "";
        return;
      }
      const C = {
        top: y.scrollTop > 1,
        right: y.scrollWidth - y.clientWidth - y.scrollLeft > 1,
        bottom: y.scrollHeight - y.clientHeight - y.scrollTop > 1,
        left: y.scrollLeft > 1
      };
      m.value = Object.entries(C).filter(([, k]) => k).map(([k]) => k).join(" "), $.value = {
        x: y.offsetHeight - y.clientHeight,
        y: y.offsetWidth - y.clientWidth
      }, w.value = y.querySelector("[data-dc-stuck]")?.offsetHeight ?? 0;
    }
    let g = null, M = null;
    return be(
      u,
      (y, C) => {
        if (C?.removeEventListener("scroll", b), g?.disconnect(), M?.disconnect(), g = null, M = null, b(), !y || (y.addEventListener("scroll", b, { passive: !0 }), typeof ResizeObserver > "u")) return;
        const k = new ResizeObserver(b), x = () => {
          k.disconnect(), k.observe(y);
          for (const S of y.children) k.observe(S);
        };
        x(), g = k, !(typeof MutationObserver > "u") && (M = new MutationObserver(() => {
          x(), b();
        }), M.observe(y, { childList: !0 }));
      },
      { flush: "post" }
    ), Ie(() => {
      u.value?.removeEventListener("scroll", b), g?.disconnect(), M?.disconnect();
    }), (y, C) => (f(), h("div", {
      ref_key: "scroller",
      ref: u,
      class: "dc-results",
      "data-dc-pending": L(n).pending.value ? "true" : "false",
      "data-dc-more": m.value,
      style: xe({
        "--dc-results-gutter-x": `${$.value.x}px`,
        "--dc-results-gutter-y": `${$.value.y}px`,
        "--dc-results-stuck": `${w.value}px`
      })
    }, [
      e.loading ? (f(), h("p", Ad, [...C[1] || (C[1] = [
        E("span", { class: "dc-results__detail" }, "Loading…", -1)
      ])])) : s.value ? (f(), Y(Xs, { key: 1 }, Er({ _: 2 }, [
        r["cards-before"] ? {
          name: "before",
          fn: Ee(() => [
            we(y.$slots, "cards-before", {}, void 0, !0)
          ]),
          key: "0"
        } : void 0,
        r["cards-after"] ? {
          name: "after",
          fn: Ee(() => [
            we(y.$slots, "cards-after", {}, void 0, !0)
          ]),
          key: "1"
        } : void 0
      ]), 1024)) : c.value ? (f(), h("p", Td, [
        C[2] || (C[2] = E("span", { class: "dc-results__headline" }, "Could not load results", -1)),
        E("span", Ld, N(L(n).error.value instanceof Error ? L(n).error.value.message : "The data source failed."), 1)
      ])) : !o.value && L(n).pending.value ? (f(), h("p", Od, [...C[3] || (C[3] = [
        E("span", { class: "dc-results__detail" }, "Running query…", -1)
      ])])) : o.value ? (f(), Y(jn(i.value), { key: 5 })) : (f(), h("div", Rd, [
        C[4] || (C[4] = E("span", { class: "dc-results__headline" }, "Nothing matches this query", -1)),
        E("span", zd, N(L(n).summary.value), 1),
        L(n).isPristine.value ? T("", !0) : (f(), h("button", {
          key: 0,
          type: "button",
          class: "dc-results__clear",
          onClick: C[0] || (C[0] = (k) => L(n).clearFilters())
        }, N(L(n).isEverything.value ? "Clear filters" : "Search everything instead"), 1))
      ]))
    ], 12, Pd));
  }
}), Qs = /* @__PURE__ */ oe(Id, [["__scopeId", "data-v-71c5b73f"]]), Nd = ["data-dc-theme"], Bd = { class: "dc-shell__head" }, Fd = {
  key: 0,
  class: "dc-shell__page"
}, Dd = /* @__PURE__ */ ae({
  __name: "DataShell",
  props: /* @__PURE__ */ Ln({
    schema: {},
    source: {},
    route: {},
    defaults: {},
    within: {},
    limit: { default: 50 },
    previewsPerType: { default: 3 },
    views: {},
    loading: { type: Boolean, default: !1 },
    pageQuery: { default: "shell" },
    listPath: { default: "/" },
    recordCards: {},
    typeChooser: { default: "scoped" },
    accent: {},
    tokens: {},
    theme: { default: "minimal" },
    pinnable: { type: Boolean },
    selectable: { type: Boolean },
    rowPress: { default: "narrow" },
    pagesNote: {},
    navigationMode: { default: "push" },
    facetNavigationMode: { default: "replace" }
  }, {
    pinned: { default: () => [] },
    pinnedModifiers: {},
    selected: { default: () => [] },
    selectedModifiers: {}
  }),
  emits: /* @__PURE__ */ Ln(["activate", "create", "duplicate", "delete", "operate", "drill", "query-change", "toggle-pin"], ["update:pinned", "update:selected"]),
  setup(e, { expose: t, emit: n }) {
    const r = e, a = n, s = Tn(e, "pinned"), l = Tn(e, "selected"), i = cn(), o = St(ss, null), c = r.route || o ? null : tl(), u = r.route ?? o ?? c;
    Ie(() => c?.dispose?.());
    const m = V(!!i.page);
    jo(() => {
      m.value = !!i.page;
    });
    const $ = nl(u, {
      detached: () => m.value && r.pageQuery === "detached",
      path: () => r.listPath
    }), w = p(() => Yl({ seed: r.schema.key })), b = p(() => r.source ?? w.value), g = hi({
      schema: () => r.schema,
      adapter: $,
      defaults: () => r.defaults,
      navigationMode: () => r.navigationMode,
      facetNavigationMode: () => r.facetNavigationMode
    }), M = p(() => r.within?.trim() ?? ""), y = yi({
      query: g.query,
      entity: g.entity,
      schema: p(() => r.schema),
      setExpression: g.setExpression
    }), C = mi({
      source: b,
      query: y.live,
      schema: p(() => r.schema),
      entity: g.entity,
      limit: p(() => r.limit),
      within: M
    });
    be(g.query, (z) => a("query-change", z));
    const k = p(() => ri(r.schema, [g.query.value.expr])), x = p(
      () => k.value.flatMap((z) => {
        const J = r.schema.entities.find((fe) => fe.key === z.entityKey);
        return J ? [{ ...z, entity: J }] : [];
      })
    );
    function S() {
      if (i.record) return x.value;
      const z = r.recordCards;
      return z ? x.value.filter((J) => z[J.entityKey]) : [];
    }
    const B = p(() => {
      const z = r.views;
      return typeof z != "function" ? z : z({ entity: g.entity.value, records: k.value });
    });
    be(
      [C.pageCount, C.pending, g.query, y.drafting, () => r.loading, m],
      () => {
        if (C.pending.value || y.drafting.value || r.loading || m.value) return;
        const z = C.pageCount.value;
        g.query.value.page > z && g.setPage(z, "replace");
      },
      // Immediately, since a pasted URL is past the end before anything changes;
      // and after the render, so the correction is a navigation the mounted shell
      // makes rather than one it makes on the way up. An async source is still
      // pending here and corrects itself when its count lands.
      { immediate: !0, flush: "post" }
    );
    const A = p(() => new Set(s.value));
    function R(z) {
      const J = new Set(A.value);
      J.has(z.id) ? J.delete(z.id) : J.add(z.id), s.value = [...J], a("toggle-pin", z);
    }
    const P = p(() => {
      if (r.selectable === !0) return !0;
      const z = g.entity.value;
      return !!(z?.duplicate || z?.delete || z?.operations?.length);
    }), K = p(() => new Set(l.value));
    function W(z) {
      const J = new Set(K.value);
      J.has(z.id) ? J.delete(z.id) : J.add(z.id), l.value = [...J];
    }
    function X(z) {
      const J = new Set(K.value);
      for (const fe of C.rows.value)
        z ? J.add(fe.id) : J.delete(fe.id);
      l.value = [...J];
    }
    function ge() {
      l.value.length && (l.value = []);
    }
    const ve = p(() => ({
      ids: [...l.value],
      rows: C.rows.value.filter((z) => K.value.has(z.id)),
      entity: g.entity.value
    }));
    be(() => g.query.value.entity, ge);
    function Ne(z, J, fe = {}) {
      const qe = gr(r.schema, g.query.value, z, fe);
      fe.exclude ? g.narrow(qe, J?.key ?? g.query.value.entity) : y.release(() => g.narrow(qe, J?.key ?? null, J ? void 0 : "cards")), a("drill", z, J, fe);
    }
    function q(z) {
      return r.rowPress === "narrow" && Bn(r.schema, z) !== null;
    }
    function G(z) {
      return r.schema.entities.find((fe) => fe.key === z.entityKey)?.href?.(z) || null;
    }
    const se = ai({
      ...g,
      draft: y.text,
      liveQuery: y.live,
      drafting: y.drafting,
      commitDraft: y.commit,
      abandonDraft: y.abandon,
      /*
       * A page of what is on screen: the draft's, while one is live, which are
       * held beside it rather than in the URL — see `liveQuery`.
       */
      setPage: (z, J) => {
        y.drafting.value ? y.setPage(z) : g.setPage(z, J);
      },
      schema: p(() => r.schema),
      entities: p(() => r.schema.entities),
      rows: C.rows,
      total: C.total,
      limit: p(() => r.limit),
      offset: C.offset,
      pageCount: C.pageCount,
      pending: C.pending,
      counting: C.counting,
      error: C.error,
      source: b,
      previewsPerType: p(() => r.previewsPerType),
      within: M,
      pinnable: p(() => r.pinnable === !0),
      isPinned: (z) => A.value.has(z.id),
      isPinnedId: (z) => A.value.has(z),
      togglePin: R,
      selectable: P,
      selection: ve,
      isSelected: (z) => K.value.has(z.id),
      toggleSelect: W,
      selectPage: X,
      clearSelection: ge,
      narrowsOnPress: p(() => r.rowPress === "narrow"),
      /*
       * The one place a press is read, so every view gets the same answer without
       * knowing which of the two it is: they all call this.
       */
      activate: (z, J = {}) => {
        if (q(z)) {
          Ne(z, null, J);
          return;
        }
        const fe = G(z);
        if (fe) {
          window.open(fe, "_blank", "noopener");
          return;
        }
        a("activate", z);
      },
      pressHref: (z) => q(z) ? g.narrowHref(gr(r.schema, g.query.value, z), null, "cards") : G(z),
      recordHref: G,
      drillHref: (z, J) => Bn(r.schema, z) ? g.narrowHref(
        gr(r.schema, g.query.value, z),
        J?.key ?? null,
        J ? void 0 : "cards"
      ) : null,
      create: (z) => a("create", z),
      duplicate: () => a("duplicate", ve.value),
      delete: () => a("delete", ve.value),
      operate: (z) => a("operate", z, ve.value),
      drill: Ne
    });
    li({ theme: () => r.theme, accent: () => r.accent, tokens: () => r.tokens });
    const ie = p(() => {
      if (!(!r.accent && !r.tokens))
        return { ...r.tokens, ...r.accent ? { "--dc-accent": r.accent } : {} };
    });
    return t({
      query: g.query
    }), (z, J) => (f(), h("div", {
      class: "dc-shell",
      "data-dc-theme": e.theme,
      style: xe(ie.value)
    }, [
      E("div", Bd, [
        de(Fs, {
          views: B.value,
          "pages-note": e.pagesNote,
          "hide-pages": e.loading || m.value
        }, Er({ _: 2 }, [
          i.brand ? {
            name: "brand",
            fn: Ee((fe) => [
              we(z.$slots, "brand", Uo(Go(fe)), void 0, !0)
            ]),
            key: "0"
          } : void 0,
          i.actions ? {
            name: "actions",
            fn: Ee(() => [
              we(z.$slots, "actions", {}, void 0, !0)
            ]),
            key: "1"
          } : void 0
        ]), 1032, ["views", "pages-note", "hide-pages"])
      ]),
      i.page ? (f(), h("div", Fd, [
        we(z.$slots, "page", {
          query: L(se).query.value
        }, void 0, !0)
      ])) : T("", !0),
      i.page ? T("", !0) : (f(), Y(Hs, {
        key: 1,
        views: B.value,
        "type-chooser": e.typeChooser
      }, null, 8, ["views", "type-chooser"])),
      i.page ? T("", !0) : we(z.$slots, "results", {
        rows: L(se).rows.value,
        total: L(se).total.value,
        offset: L(se).offset.value,
        pageCount: L(se).pageCount.value,
        query: L(se).liveQuery.value,
        pending: L(se).pending.value,
        loading: e.loading
      }, () => [
        de(Qs, {
          views: B.value,
          loading: e.loading
        }, Er({ _: 2 }, [
          i["cards-before"] || S().length ? {
            name: "cards-before",
            fn: Ee(() => [
              (f(!0), h(te, null, he(S(), (fe) => (f(), h(te, {
                key: `${fe.entityKey}:${fe.id}`
              }, [
                i.record ? we(z.$slots, "record", {
                  id: fe.id,
                  entity: fe.entity
                }, void 0, !0, 0) : (f(), Y(jn(e.recordCards?.[fe.entityKey]), {
                  key: 1,
                  id: fe.id
                }, null, 8, ["id"]))
              ], 64))), 128)),
              we(z.$slots, "cards-before", {}, void 0, !0)
            ]),
            key: "0"
          } : void 0,
          i["cards-after"] ? {
            name: "cards-after",
            fn: Ee(() => [
              we(z.$slots, "cards-after", {}, void 0, !0)
            ]),
            key: "1"
          } : void 0
        ]), 1032, ["views", "loading"])
      ], !0, 2)
    ], 12, Nd));
  }
}), Hd = /* @__PURE__ */ oe(Dd, [["__scopeId", "data-v-6843d3d0"]]), qd = ["data-dc-muted", "data-dc-collapsed"], Vd = ["data-dc-collapsible"], Kd = ["aria-expanded", "aria-controls"], Wd = { class: "dc-shell-card__sr" }, jd = {
  key: 0,
  class: "dc-shell-card__identity"
}, Ud = { class: "dc-shell-card__title dc-shell-card__name" }, Gd = {
  key: 0,
  class: "dc-shell-card__ref dc-mono"
}, Yd = {
  key: 1,
  class: "dc-shell-card__title"
}, Xd = {
  key: 2,
  class: "dc-shell-card__count dc-mono"
}, Qd = {
  key: 1,
  class: "dc-shell-card__aside"
}, Zd = ["data-dc-flush"], Jd = /* @__PURE__ */ ae({
  __name: "ShellCard",
  props: {
    title: {},
    name: {},
    reference: {},
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
    const n = e, r = t, a = V(n.defaultCollapsed === !0), s = p(() => n.span === "all" ? { gridColumn: "1 / -1" } : void 0), l = cn();
    function i(R) {
      return o(R?.() ?? []);
    }
    function o(R) {
      return R.some((P) => P.type === Yo ? !1 : P.type === Xo ? String(P.children ?? "").trim().length > 0 : P.type === te ? o(P.children ?? []) : !0);
    }
    const c = p(
      () => !!n.title || !!n.name || u.value || i(l.head)
    ), u = p(() => i(l.aside)), m = p(() => i(l.default)), $ = p(() => i(l.foot)), w = p(
      () => !!n.name && (!!n.reference || i(l.reference))
    ), b = p(() => n.collapsible === !0 && c.value), g = p(() => b.value && (n.collapsed ?? a.value));
    function M() {
      const R = !g.value;
      a.value = R, r("update:collapsed", R);
    }
    const y = Kn() ?? "dc-shell-card", C = `${y}-body`, k = `${y}-foot`, x = p(
      () => [m.value ? C : "", $.value ? k : ""].filter(Boolean).join(" ") || void 0
    ), S = [
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
    ].join(", "), B = V(null);
    function A(R) {
      if (!b.value) return;
      const P = R.target?.closest(S);
      P && B.value?.contains(P) || typeof window < "u" && window.getSelection()?.toString() || M();
    }
    return (R, P) => (f(), h("section", {
      class: "dc-shell-card",
      style: xe(s.value),
      "data-dc-muted": e.muted ? "true" : "false",
      "data-dc-collapsed": g.value ? "true" : "false"
    }, [
      c.value ? (f(), h("header", {
        key: 0,
        ref_key: "head",
        ref: B,
        class: "dc-shell-card__head",
        "data-dc-collapsible": b.value ? "true" : "false",
        onClick: A
      }, [
        b.value ? (f(), h("button", {
          key: 0,
          type: "button",
          class: "dc-shell-card__toggle",
          "aria-expanded": g.value ? "false" : "true",
          "aria-controls": x.value,
          onClick: M
        }, [
          P[0] || (P[0] = E("svg", {
            class: "dc-shell-card__chevron",
            viewBox: "0 0 10 10",
            "aria-hidden": "true"
          }, [
            E("path", { d: "M2 3.5 5 6.5 8 3.5" })
          ], -1)),
          E("span", Wd, N(e.name || e.title || "Card"), 1)
        ], 8, Kd)) : T("", !0),
        we(R.$slots, "head", {}, () => [
          e.name ? (f(), h("div", jd, [
            E("h2", Ud, N(e.name), 1),
            w.value ? (f(), h("span", Gd, [
              we(R.$slots, "reference", {}, () => [
                Ae(N(e.reference), 1)
              ], !0)
            ])) : T("", !0)
          ])) : (f(), h("h2", Yd, N(e.title), 1)),
          e.count !== void 0 ? (f(), h("span", Xd, N(e.count), 1)) : T("", !0)
        ], !0),
        u.value ? (f(), h("span", Qd, [
          we(R.$slots, "aside", {}, void 0, !0)
        ])) : T("", !0)
      ], 8, Vd)) : T("", !0),
      m.value ? en((f(), h("div", {
        key: 1,
        id: C,
        class: "dc-shell-card__body",
        "data-dc-flush": e.flush ? "true" : "false"
      }, [
        we(R.$slots, "default", {}, void 0, !0)
      ], 8, Zd)), [
        [On, !g.value]
      ]) : T("", !0),
      $.value ? en((f(), h("footer", {
        key: 2,
        id: k,
        class: "dc-shell-card__foot"
      }, [
        we(R.$slots, "foot", {}, void 0, !0)
      ], 512)), [
        [On, !g.value]
      ]) : T("", !0)
    ], 12, qd));
  }
}), jv = /* @__PURE__ */ oe(Jd, [["__scopeId", "data-v-3a7425d2"]]), ef = ["aria-label"], tf = ["aria-checked", "data-dc-active", "tabindex", "onClick", "onKeydown"], nf = /* @__PURE__ */ ae({
  __name: "SegmentedControl",
  props: {
    modelValue: {},
    options: {},
    label: {},
    mono: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = e, r = t, a = V([]);
    function s(l, i) {
      const o = n.options.length;
      let c = null;
      if (l.key === "ArrowRight" || l.key === "ArrowDown" ? c = (i + 1) % o : l.key === "ArrowLeft" || l.key === "ArrowUp" ? c = (i - 1 + o) % o : l.key === "Home" ? c = 0 : l.key === "End" && (c = o - 1), c === null) return;
      l.preventDefault();
      const u = n.options[c];
      u && (r("update:modelValue", u.key), a.value[c]?.focus());
    }
    return (l, i) => (f(), h("div", {
      class: "dc-segmented",
      role: "radiogroup",
      "aria-label": e.label
    }, [
      (f(!0), h(te, null, he(e.options, (o, c) => (f(), h("button", {
        key: o.key,
        ref_for: !0,
        ref_key: "buttons",
        ref: a,
        type: "button",
        role: "radio",
        class: Je(["dc-segmented__item", { "dc-segmented__item--mono": e.mono }]),
        "aria-checked": o.key === e.modelValue,
        "data-dc-active": o.key === e.modelValue ? "true" : "false",
        tabindex: o.key === e.modelValue ? 0 : -1,
        onClick: (u) => r("update:modelValue", o.key),
        onKeydown: (u) => s(u, c)
      }, N(o.label), 43, tf))), 128))
    ], 8, ef));
  }
}), rf = /* @__PURE__ */ oe(nf, [["__scopeId", "data-v-63fb5482"]]), af = ["data-dc-theme", "aria-label"], sf = ["aria-expanded", "aria-disabled", "disabled", "data-dc-menu", "tabindex", "onClick", "onMouseenter"], of = /* @__PURE__ */ ae({
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
    const n = e, r = p(() => {
      if (!(!n.accent && !n.tokens))
        return { ...n.tokens, ...n.accent ? { "--dc-accent": n.accent } : {} };
    }), a = t, s = V(null), l = V([]), i = V(null), o = V(null), c = V(!1), u = p(
      () => n.menus.flatMap((x, S) => Xt(x) ? [S] : [])
    );
    function m(x, S) {
      const B = l.value[x]?.getBoundingClientRect(), A = n.menus[x];
      !B || !A || !Xt(A) || (o.value = { x: B.left, y: B.bottom + 2, mirrorX: B.right }, i.value = x, c.value = S);
    }
    function $(x) {
      const S = i.value;
      i.value = null, o.value = null, x && S !== null && l.value[S]?.focus();
    }
    function w(x) {
      i.value === x ? $(!0) : m(x, !1);
    }
    function b(x) {
      i.value === null || i.value === x || m(x, !1);
    }
    function g(x, S) {
      const B = u.value;
      if (B.length === 0) return null;
      if (x === null) return S === 1 ? B[0] ?? null : B[B.length - 1] ?? null;
      const A = B.indexOf(x);
      return A === -1 ? B[0] ?? null : B[(A + S + B.length) % B.length] ?? null;
    }
    function M(x) {
      const S = x.key;
      if (S === "Escape") {
        if (i.value === null) return;
        x.preventDefault(), $(!0);
        return;
      }
      if (S === "ArrowDown" && i.value === null) {
        const R = y();
        if (R === null) return;
        x.preventDefault(), m(R, !0);
        return;
      }
      if (S !== "ArrowLeft" && S !== "ArrowRight") return;
      const B = i.value ?? y(), A = g(B, S === "ArrowRight" ? 1 : -1);
      A !== null && (x.preventDefault(), i.value !== null ? m(A, !0) : l.value[A]?.focus());
    }
    function y() {
      const x = l.value.findIndex((S) => S === document.activeElement);
      return x === -1 ? u.value[0] ?? null : x;
    }
    function C(x) {
      const S = x.target;
      !S || s.value?.contains(S) || $(!1);
    }
    be(i, (x) => {
      x !== null ? window.addEventListener("pointerdown", C, !0) : window.removeEventListener("pointerdown", C, !0);
    }), Ie(() => window.removeEventListener("pointerdown", C, !0));
    function k(x) {
      $(!0), x.action?.(), a("choose", x);
    }
    return (x, S) => (f(), h("div", {
      ref_key: "bar",
      ref: s,
      class: "dc-shell dc-menubar",
      role: "menubar",
      "data-dc-theme": e.theme,
      "aria-label": e.label ?? "Main menu",
      style: xe(r.value),
      onKeydown: M
    }, [
      (f(!0), h(te, null, he(e.menus, (B, A) => (f(), h("button", {
        key: B.id ?? B.label ?? A,
        ref_for: !0,
        ref: (R) => {
          R && (l.value[A] = R);
        },
        type: "button",
        class: "dc-menubar__item",
        role: "menuitem",
        "aria-haspopup": "menu",
        "aria-expanded": i.value === A,
        "aria-disabled": B.disabled ? "true" : void 0,
        disabled: B.disabled,
        "data-dc-menu": B.id ?? B.label,
        tabindex: A === (u.value[0] ?? 0) ? 0 : -1,
        onClick: (R) => w(A),
        onMouseenter: (R) => b(A)
      }, N(B.label), 41, sf))), 128)),
      i.value !== null && o.value ? (f(), Y(sa, {
        key: i.value,
        items: e.menus[i.value]?.items ?? [],
        at: o.value,
        label: e.menus[i.value]?.label,
        autofocus: c.value,
        onChoose: k,
        onDismiss: S[0] || (S[0] = (B) => $(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : T("", !0)
    ], 44, af));
  }
}), Uv = /* @__PURE__ */ oe(of, [["__scopeId", "data-v-93dbd2e4"]]), lf = ["aria-label", "aria-expanded", "disabled"], cf = { "aria-hidden": "true" }, uf = /* @__PURE__ */ ae({
  __name: "MenuButton",
  props: {
    items: {},
    label: {},
    glyph: { default: "⋯" }
  },
  emits: ["choose"],
  setup(e, { emit: t }) {
    const n = t, r = V(null), a = V(null), s = V(null), l = V(!1), i = p(() => s.value !== null);
    function o(b) {
      const g = r.value?.getBoundingClientRect();
      g && (s.value = { x: g.left, y: g.bottom + 4, mirrorX: g.right }, l.value = b);
    }
    function c(b) {
      s.value = null, b && r.value?.focus();
    }
    function u() {
      i.value ? c(!0) : o(!1);
    }
    function m(b) {
      b.key !== "ArrowDown" || i.value || (b.preventDefault(), o(!0));
    }
    function $(b) {
      const g = b.target;
      g && (r.value?.contains(g) || a.value?.root?.contains(g) || c(!1));
    }
    be(i, (b) => {
      b ? window.addEventListener("pointerdown", $, !0) : window.removeEventListener("pointerdown", $, !0);
    }), Ie(() => window.removeEventListener("pointerdown", $, !0));
    function w(b) {
      c(!0), b.action?.(), n("choose", b);
    }
    return (b, g) => (f(), h(te, null, [
      E("button", {
        ref_key: "trigger",
        ref: r,
        type: "button",
        class: "dc-menu-button",
        "aria-label": e.label,
        "aria-haspopup": "menu",
        "aria-expanded": i.value,
        disabled: e.items.length === 0,
        onClick: u,
        onKeydown: m
      }, [
        E("span", cf, N(e.glyph), 1)
      ], 40, lf),
      s.value ? (f(), Y(sa, {
        key: 0,
        ref_key: "menu",
        ref: a,
        items: e.items,
        at: s.value,
        label: e.label,
        autofocus: l.value,
        onChoose: w,
        onDismiss: g[0] || (g[0] = (M) => c(!0))
      }, null, 8, ["items", "at", "label", "autofocus"])) : T("", !0)
    ], 64));
  }
}), ia = /* @__PURE__ */ oe(uf, [["__scopeId", "data-v-48f5ada5"]]), df = { class: "dc-fact__label" }, ff = ["title"], pf = /* @__PURE__ */ ae({
  __name: "ShellFact",
  props: {
    label: {},
    value: {},
    title: {},
    wide: { type: Boolean }
  },
  setup(e) {
    const t = e, n = p(() => {
      const a = t.value;
      if (a == null || a === "") return [it];
      if (Array.isArray(a)) {
        const s = a.filter((l) => l != null && l !== "");
        return s.length ? s.map(String) : [it];
      }
      return [String(a)];
    }), r = p(() => t.wide ? { gridColumn: "1 / -1" } : void 0);
    return (a, s) => (f(), h("div", {
      class: "dc-fact",
      style: xe(r.value)
    }, [
      E("dt", df, [
        we(a.$slots, "label", {}, () => [
          Ae(N(e.label), 1)
        ], !0)
      ]),
      E("dd", {
        class: "dc-fact__value dc-mono",
        title: e.title
      }, [
        we(a.$slots, "default", {}, () => [
          n.value.length === 1 ? (f(), h(te, { key: 0 }, [
            Ae(N(n.value[0]), 1)
          ], 64)) : (f(!0), h(te, { key: 1 }, he(n.value, (l, i) => (f(), h("span", {
            key: i,
            class: "dc-fact__line"
          }, N(l), 1))), 128))
        ], !0)
      ], 8, ff)
    ], 4));
  }
}), vf = /* @__PURE__ */ oe(pf, [["__scopeId", "data-v-1f6d25e6"]]), hf = /* @__PURE__ */ ae({
  __name: "ShellFacts",
  props: {
    items: { default: () => [] },
    min: { default: "200px" }
  },
  setup(e) {
    const t = e, n = p(() => ({ "--dc-facts-min": t.min }));
    return (r, a) => (f(), h("dl", {
      class: "dc-facts",
      style: xe(n.value)
    }, [
      (f(!0), h(te, null, he(e.items, (s, l) => (f(), Y(vf, {
        key: `${l}:${s.label}`,
        label: s.label,
        value: s.value,
        title: s.title,
        wide: s.wide
      }, null, 8, ["label", "value", "title", "wide"]))), 128)),
      we(r.$slots, "default", {}, void 0, !0)
    ], 4));
  }
}), Gv = /* @__PURE__ */ oe(hf, [["__scopeId", "data-v-17455afa"]]), mf = { class: "dc-counts" }, gf = ["data-dc-tone"], yf = {
  key: 0,
  class: "dc-counts__empty"
}, _f = /* @__PURE__ */ ae({
  __name: "StatusCounts",
  props: {
    counts: {},
    empty: { default: it }
  },
  setup(e) {
    const t = e, n = p(() => t.counts.filter((r) => r.count > 0));
    return (r, a) => (f(), h("span", mf, [
      (f(!0), h(te, null, he(n.value, (s) => (f(), h("span", {
        key: s.label,
        class: "dc-counts__count",
        "data-dc-tone": s.tone ?? "neutral"
      }, N(s.count) + " " + N(s.label), 9, gf))), 128)),
      n.value.length === 0 ? (f(), h("span", yf, N(e.empty), 1)) : T("", !0)
    ]));
  }
}), Yv = /* @__PURE__ */ oe(_f, [["__scopeId", "data-v-5553a9e2"]]), wf = ["data-dc-copied", "title", "aria-label"], kf = {
  key: 0,
  class: "dc-copy__mark",
  viewBox: "0 0 16 16",
  "aria-hidden": "true"
}, bf = {
  key: 1,
  class: "dc-copy__mark",
  viewBox: "0 0 16 16",
  "aria-hidden": "true"
}, $f = 1500, xf = /* @__PURE__ */ ae({
  __name: "CopyButton",
  props: {
    text: {},
    label: { default: "Copy to clipboard" }
  },
  emits: ["copied", "error"],
  setup(e, { emit: t }) {
    const n = e, r = t, a = V(!1);
    let s;
    async function l() {
      const i = typeof n.text == "function" ? n.text() : n.text;
      try {
        if (!navigator.clipboard) throw new Error("The clipboard is not available here");
        await navigator.clipboard.writeText(i);
      } catch (o) {
        r("error", o);
        return;
      }
      a.value = !0, clearTimeout(s), s = setTimeout(() => {
        a.value = !1;
      }, $f), r("copied", i);
    }
    return Ie(() => clearTimeout(s)), (i, o) => (f(), h("button", {
      type: "button",
      class: "dc-copy",
      "data-dc-copied": a.value ? "true" : "false",
      title: a.value ? "Copied" : e.label,
      "aria-label": e.label,
      onClick: l
    }, [
      a.value ? (f(), h("svg", bf, [...o[1] || (o[1] = [
        E("path", { d: "M3 8.5l3.2 3L13 4.5" }, null, -1)
      ])])) : (f(), h("svg", kf, [...o[0] || (o[0] = [
        E("rect", {
          x: "5.5",
          y: "5.5",
          width: "8",
          height: "9",
          rx: "1.5"
        }, null, -1),
        E("path", { d: "M10.5 3.5v-1a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1" }, null, -1)
      ])]))
    ], 8, wf));
  }
}), Mf = /* @__PURE__ */ oe(xf, [["__scopeId", "data-v-f4249d7f"]]), Sf = ["data-dc-copy", "data-dc-wrap", "data-dc-tone"], Cf = /* @__PURE__ */ ae({
  __name: "ShellCode",
  props: {
    code: { default: void 0 },
    maxHeight: { default: void 0 },
    copy: { type: Boolean },
    copyLabel: { default: "Copy to clipboard" },
    wrap: { type: Boolean, default: !0 },
    tone: { default: void 0 }
  },
  emits: ["copied", "error"],
  setup(e, { emit: t }) {
    const n = e, r = t, a = V(null), s = p(() => n.maxHeight === void 0 ? void 0 : { maxHeight: typeof n.maxHeight == "number" ? `${n.maxHeight}px` : n.maxHeight });
    function l() {
      return n.code ?? a.value?.textContent ?? "";
    }
    return (i, o) => (f(), h("div", {
      class: "dc-code",
      "data-dc-copy": e.copy ? "true" : "false",
      "data-dc-wrap": e.wrap ? "true" : "false",
      "data-dc-tone": e.tone
    }, [
      E("pre", {
        ref_key: "pre",
        ref: a,
        class: "dc-code__text dc-mono",
        style: xe(s.value)
      }, [
        we(i.$slots, "default", {}, () => [
          Ae(N(e.code), 1)
        ], !0)
      ], 4),
      e.copy ? (f(), Y(Mf, {
        key: 0,
        class: "dc-code__copy",
        text: l,
        label: e.copyLabel,
        onCopied: o[0] || (o[0] = (c) => r("copied", c)),
        onError: o[1] || (o[1] = (c) => r("error", c))
      }, null, 8, ["label"])) : T("", !0)
    ], 8, Sf));
  }
}), Xv = /* @__PURE__ */ oe(Cf, [["__scopeId", "data-v-67b371dd"]]), Ef = 24, Pf = /* @__PURE__ */ ae({
  __name: "ShellLog",
  props: {
    fetchChunk: {},
    stripAnsi: { type: Boolean },
    maxHeight: { default: "460px" }
  },
  setup(e, { expose: t }) {
    const n = e, r = V(""), a = p(() => n.stripAnsi ? ul(r.value) : r.value), s = V(null);
    let l = 0, i = null;
    function o() {
      return i ??= c().finally(() => {
        i = null;
      }), i;
    }
    async function c() {
      const { chunk: $, offset: w } = await n.fetchChunk(l);
      if (l = w, !$) return;
      const b = s.value, g = !b || b.scrollTop + b.clientHeight >= b.scrollHeight - Ef;
      r.value += $, g && (await yt(), s.value && (s.value.scrollTop = s.value.scrollHeight));
    }
    function u() {
      r.value = "", l = 0;
    }
    const m = p(() => n.maxHeight === void 0 ? void 0 : { maxHeight: typeof n.maxHeight == "number" ? `${n.maxHeight}px` : n.maxHeight });
    return t({ poll: o, reset: u }), ($, w) => (f(), h("pre", {
      ref_key: "pane",
      ref: s,
      class: "dc-log dc-mono",
      style: xe(m.value)
    }, N(a.value), 5));
  }
}), Qv = /* @__PURE__ */ oe(Pf, [["__scopeId", "data-v-2c86947e"]]), Af = ["data-dc-theme"], Tf = ["aria-labelledby", "aria-label"], Lf = {
  key: 1,
  class: "dc-dialog__actions"
}, jt = [], Of = /* @__PURE__ */ ae({
  __name: "ShellDialog",
  props: {
    open: { type: Boolean, default: !0 },
    title: { default: void 0 },
    label: { default: void 0 },
    to: { default: "body" },
    theme: { default: void 0 },
    accent: { default: void 0 },
    tokens: { default: void 0 },
    panelClass: { default: void 0 },
    bodyClass: { default: void 0 }
  },
  emits: ["close", "update:open"],
  setup(e, { emit: t }) {
    const n = e, r = t, { theme: a, style: s, adopt: l } = ra(n), i = `${Kn() ?? "dc-dialog"}-title`, o = V(null);
    function c() {
      r("close"), r("update:open", !1);
    }
    const u = Symbol("dc-dialog");
    function m(k) {
      k.key !== "Escape" || k.defaultPrevented || jt[jt.length - 1] === u && (k.preventDefault(), c());
    }
    let $ = !1;
    function w(k) {
      $ = k.target === k.currentTarget;
    }
    function b(k) {
      k.target === k.currentTarget && $ && c(), $ = !1;
    }
    const g = [
      "[autofocus]",
      'input:not([disabled]):not([type="hidden"])',
      "select:not([disabled])",
      "textarea:not([disabled])",
      "button:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])'
    ].join(", ");
    let M = null;
    async function y() {
      jt.push(u), document.addEventListener("keydown", m), M = document.activeElement instanceof HTMLElement ? document.activeElement : null, l(), await yt(), (o.value?.querySelector("[autofocus]") ?? o.value?.querySelector(g) ?? o.value)?.focus();
    }
    function C() {
      const k = jt.indexOf(u);
      k !== -1 && (jt.splice(k, 1), document.removeEventListener("keydown", m), M?.isConnected && M.focus(), M = null);
    }
    return un(() => {
      n.open && y();
    }), be(
      () => n.open,
      (k) => {
        k ? y() : C();
      }
    ), Ie(C), (k, x) => e.open ? (f(), Y(Wn, {
      key: 0,
      to: e.to
    }, [
      E("div", {
        class: "dc-shell dc-layer dc-dialog",
        "data-dc-theme": L(a),
        style: xe(L(s)),
        onPointerdown: w,
        onClick: b
      }, [
        E("div", {
          ref_key: "panel",
          ref: o,
          class: Je(["dc-dialog__panel", e.panelClass]),
          role: "dialog",
          "aria-modal": "true",
          tabindex: "-1",
          "aria-labelledby": e.title ? i : void 0,
          "aria-label": e.title ? void 0 : e.label
        }, [
          e.title ? (f(), h("h2", {
            key: 0,
            id: i,
            class: "dc-dialog__title"
          }, N(e.title), 1)) : T("", !0),
          E("div", {
            class: Je(["dc-dialog__body", e.bodyClass])
          }, [
            we(k.$slots, "default", {}, void 0, !0)
          ], 2),
          k.$slots.actions ? (f(), h("div", Lf, [
            we(k.$slots, "actions", {}, void 0, !0)
          ])) : T("", !0)
        ], 10, Tf)
      ], 44, Af)
    ], 8, ["to"])) : T("", !0);
  }
}), Zv = /* @__PURE__ */ oe(Of, [["__scopeId", "data-v-1e126064"]]), Rf = 4500, zf = 9e3, on = V([]);
let Ka = 0;
function Zs(e) {
  on.value = on.value.filter((t) => t.id !== e);
}
function Js(e, t = "ok") {
  Ka += 1;
  const n = Ka;
  on.value = [...on.value, { id: n, message: e, kind: t }], setTimeout(() => Zs(n), t === "err" ? zf : Rf);
}
function If(e) {
  Js(e instanceof Error ? e.message : String(e), "err");
}
function Nf() {
  return { toasts: Qo(on), toast: Js, toastError: If, dismiss: Zs };
}
const Bf = ["data-dc-theme"], Ff = ["data-dc-kind", "role"], Df = /* @__PURE__ */ ae({
  __name: "ShellToasts",
  props: {
    to: { default: "body" },
    theme: { default: void 0 },
    accent: { default: void 0 },
    tokens: { default: void 0 }
  },
  setup(e) {
    const t = e, { toasts: n } = Nf(), { theme: r, style: a, adopt: s } = ra(t);
    return un(s), (l, i) => (f(), Y(Wn, { to: e.to }, [
      E("div", {
        class: "dc-shell dc-layer dc-toasts",
        "data-dc-theme": L(r),
        style: xe(L(a)),
        "aria-live": "polite"
      }, [
        (f(!0), h(te, null, he(L(n), (o) => (f(), h("div", {
          key: o.id,
          class: "dc-toast",
          "data-dc-kind": o.kind,
          role: o.kind === "err" ? "alert" : void 0
        }, N(o.message), 9, Ff))), 128))
      ], 12, Bf)
    ], 8, ["to"]));
  }
}), Jv = /* @__PURE__ */ oe(Df, [["__scopeId", "data-v-6fb044ee"]]), Hf = 4, qf = 8, Vf = 180;
function Kf(e, t, n, r = {}) {
  const a = r.gap ?? Hf, s = r.margin ?? qf, l = r.flipBelow ?? Vf, i = r.side ?? "below", o = {
    below: n.height - e.bottom - a - s,
    above: e.top - a - s
  }, c = i === "below" ? "above" : "below", u = o[i] < l && o[c] > o[i] ? c : i, m = Math.min(r.maxHeight ?? 1 / 0, Math.max(0, o[u])), $ = Math.max(0, n.width - s * 2), w = Math.min(e.width, $), b = Math.min(Math.max(t, w), $), g = r.align === "end" ? e.right - b : e.left, M = Math.max(s, Math.min(g, n.width - b - s));
  return u === "below" ? { side: u, left: M, top: e.bottom + a, maxHeight: m, minWidth: w, maxWidth: $ } : { side: u, left: M, bottom: n.height - e.top + a, maxHeight: m, minWidth: w, maxWidth: $ };
}
const Wf = ["data-dc-theme", "data-dc-side"], vt = [], jf = /* @__PURE__ */ ae({
  inheritAttrs: !1,
  __name: "ShellPopover",
  props: {
    open: { type: Boolean, default: !1 },
    anchor: { default: null },
    side: { default: "below" },
    align: { default: "start" },
    maxHeight: { default: void 0 },
    to: { default: "body" },
    theme: { default: void 0 },
    accent: { default: void 0 },
    tokens: { default: void 0 }
  },
  emits: ["update:open", "close"],
  setup(e, { emit: t }) {
    const n = e, r = t, { theme: a, style: s, adopt: l } = ra(n), i = V(null), o = V(null), c = { root: () => i.value };
    function u() {
      const k = n.anchor;
      k && (o.value = Kf(
        k.getBoundingClientRect(),
        i.value?.offsetWidth ?? 0,
        { width: window.innerWidth, height: window.innerHeight },
        { side: n.side, align: n.align, maxHeight: n.maxHeight }
      ));
    }
    const m = p(() => {
      const k = o.value, x = k ? {
        position: "fixed",
        left: `${k.left}px`,
        ...k.top !== void 0 ? { top: `${k.top}px` } : {},
        ...k.bottom !== void 0 ? { bottom: `${k.bottom}px` } : {},
        minWidth: `${k.minWidth}px`,
        maxWidth: `${k.maxWidth}px`,
        maxHeight: `${k.maxHeight}px`,
        overflowY: "auto"
      } : { position: "fixed", visibility: "hidden" };
      return { ...s.value, ...x };
    });
    function $() {
      r("update:open", !1), r("close");
    }
    function w(k) {
      return i.value?.contains(k) || n.anchor?.contains(k) ? !0 : vt.slice(vt.indexOf(c) + 1).some((S) => S.root()?.contains(k));
    }
    function b(k) {
      const x = k.target;
      x && !w(x) && $();
    }
    function g(k) {
      k.key !== "Escape" || k.defaultPrevented || vt[vt.length - 1] === c && (k.preventDefault(), i.value?.contains(document.activeElement) && n.anchor?.focus(), $());
    }
    let M = null;
    async function y() {
      vt.includes(c) || (vt.push(c), l(), o.value = null, await yt(), u(), window.addEventListener("pointerdown", b, !0), document.addEventListener("keydown", g, !0), window.addEventListener("resize", u), window.addEventListener("scroll", u, !0), typeof ResizeObserver < "u" && i.value && (M = new ResizeObserver(() => u()), M.observe(i.value)));
    }
    function C() {
      const k = vt.indexOf(c);
      k !== -1 && (vt.splice(k, 1), window.removeEventListener("pointerdown", b, !0), document.removeEventListener("keydown", g, !0), window.removeEventListener("resize", u), window.removeEventListener("scroll", u, !0), M?.disconnect(), M = null);
    }
    return un(() => {
      n.open && y();
    }), be(
      () => n.open,
      (k) => {
        k ? y() : C();
      }
    ), be(() => n.anchor, () => {
      n.open && u();
    }), Ie(C), (k, x) => e.open ? (f(), Y(Wn, {
      key: 0,
      to: e.to
    }, [
      E("div", Zo({
        ref_key: "root",
        ref: i
      }, k.$attrs, {
        class: "dc-shell dc-layer dc-popover",
        "data-dc-theme": L(a),
        "data-dc-side": o.value?.side,
        style: m.value
      }), [
        we(k.$slots, "default", {}, void 0, !0)
      ], 16, Wf)
    ], 8, ["to"])) : T("", !0);
  }
}), eh = /* @__PURE__ */ oe(jf, [["__scopeId", "data-v-65ca5cb0"]]), qt = (e) => e.kind === "split", Z = (e) => e.kind === "group", le = (e) => e.kind === "float", xt = { x: 16, y: 16, w: 360, h: 260 }, Hn = 28, eo = 120, Br = 220, to = 38, Lt = 6;
function gn(e, t) {
  let n = !1;
  const r = e.frames.map((a, s) => {
    const l = t(a.node, s);
    return l === a.node ? a : (n = !0, { ...a, node: l });
  });
  return n ? { ...e, frames: r } : e;
}
function Ze(e) {
  return { kind: "group", panels: [e] };
}
function th(e, t, n) {
  return {
    kind: "group",
    panels: e,
    ...t ? { active: t } : {},
    ...n ? { title: n } : {}
  };
}
const $e = (e) => typeof e == "string", rr = (e) => $e(e) ? Ze(e) : e, yn = (e) => $e(e) ? [e] : Ue(e), Wa = (e) => e.panels.filter($e), Uf = (e) => e.panels.filter((t) => !$e(t)), We = (e, t) => e.panels.includes(t);
function _n(e, t, n) {
  let r = !1;
  const a = e.panels.map((s) => {
    if ($e(s) || !ye(s, t)) return s;
    const l = n(s);
    return l !== s && (r = !0), l;
  });
  return r ? { ...e, panels: a } : e;
}
function ar(e, t) {
  return { node: e, rect: { ...xt, ...t } };
}
function ca(e, t) {
  return t ? { kind: "float", frames: e, title: t } : { kind: "float", frames: e };
}
function sr(e, t) {
  const n = { ...xt, ...t };
  return ca(
    e.map(
      (r, a) => ar(r, {
        ...n,
        x: n.x + a * Hn,
        y: n.y + a * Hn
      })
    )
  );
}
function ua(e, t, n, r) {
  return {
    kind: "split",
    direction: e,
    children: t,
    ...n ? { sizes: n } : {},
    ...r ? { title: r } : {}
  };
}
const da = (e, t, n) => ua("row", e, t, n), nh = (e, t, n) => ua("column", e, t, n);
function Pe(e) {
  return {
    ...e.title ? { title: e.title } : {},
    ...e.fixedView ? { fixedView: !0 } : {},
    ...e.headless ? { headless: !0 } : {}
  };
}
const Et = (e) => e.fixedView === !0 || e.headless === !0 || !!e.title, Gf = (e) => ({ ...e, headless: !0 }), rh = (e) => ({ ...e, fixedView: !0 }), Yf = (e) => e === "left" || e === "right" ? "row" : "column";
function Ue(e) {
  return Z(e) ? e.panels.flatMap(yn) : le(e) ? e.frames.flatMap((t) => Ue(t.node)) : e.children.flatMap(Ue);
}
function ye(e, t) {
  return Z(e) ? e.panels.some((n) => $e(n) ? n === t : ye(n, t)) : le(e) ? e.frames.some((n) => ye(n.node, t)) : e.children.some((n) => ye(n, t));
}
const no = (e) => Ue(e).length === 0, Fr = (e) => !Z(e) && Et(e), Dr = (e) => no(e) && !Fr(e);
function or(e) {
  return qt(e) ? e.children.map((t, n) => ({ node: t, index: n })) : le(e) ? e.frames.map((t, n) => ({ node: t.node, index: n })) : e.panels.flatMap((t, n) => $e(t) ? [] : [{ node: t, index: n }]);
}
const fa = (e) => or(e).map((t) => t.node);
function Tt(e) {
  const t = e.active;
  if (t) {
    const n = e.panels.findIndex(
      (r) => $e(r) ? r === t : ye(r, t)
    );
    if (n >= 0) return n;
  }
  return 0;
}
function ro(e) {
  const t = e.panels[Tt(e)];
  return t !== void 0 && $e(t) ? t : "";
}
function ze(e) {
  if ($e(e)) return e;
  if (Z(e)) {
    const n = e.panels[Tt(e)];
    return n === void 0 ? "" : ze(n);
  }
  if (le(e)) {
    const n = e.frames[e.frames.length - 1];
    return n ? ze(n.node) : "";
  }
  const t = e.children[0];
  return t ? ze(t) : "";
}
function Rt(e, t) {
  if (Z(e) && We(e, t)) return e;
  for (const n of fa(e)) {
    const r = Rt(n, t);
    if (r) return r;
  }
  return null;
}
function Xf(e) {
  const t = fa(e).flatMap(Xf);
  return Z(e) ? [e, ...t] : t;
}
function Oe(e, t) {
  if (Z(e)) {
    for (const n of Uf(e)) {
      const r = Oe(n, t);
      if (r) return r;
    }
    return null;
  }
  if (le(e)) {
    for (const n of e.frames)
      if (ye(n.node, t))
        return Oe(n.node, t) ?? n;
    return null;
  }
  for (const n of e.children) {
    const r = Oe(n, t);
    if (r) return r;
  }
  return null;
}
function _r(e, t, n = eo) {
  const r = (i, o) => o > 0 ? Math.max(Math.min(i, o), Math.min(n, o)) : Math.max(i, n), a = r(e.w, t.w), s = r(e.h, t.h), l = (i, o, c) => Math.min(Math.max(i, 0), Math.max(c - o, 0));
  return {
    x: Math.round(l(e.x, a, t.w)),
    y: Math.round(l(e.y, s, t.h)),
    w: Math.round(a),
    h: Math.round(s)
  };
}
function ja(e, t, n, r, a = eo) {
  let { x: s, y: l, w: i, h: o } = e;
  return t.includes("e") && (i = e.w + n), t.includes("w") && (i = e.w - n, s = e.x + n), t.includes("s") && (o = e.h + r), t.includes("n") && (o = e.h - r, l = e.y + r), i < a && (t.includes("w") && (s = e.x + e.w - a), i = a), o < a && (t.includes("n") && (l = e.y + e.h - a), o = a), { x: s, y: l, w: i, h: o };
}
const ao = (e, t) => e.x === t.x && e.y === t.y && e.w === t.w && e.h === t.h;
function zt(e, t, n) {
  if (Z(e)) return _n(e, t, (s) => zt(s, t, n));
  if (le(e)) {
    let s = !1;
    const l = e.frames.map((i) => {
      if (!ye(i.node, t)) return i;
      if (Oe(i.node, t)) {
        const c = zt(i.node, t, n);
        return c === i.node ? i : (s = !0, { ...i, node: c });
      }
      const o = n(i);
      return o === i ? i : (s = !0, o);
    });
    return s ? { ...e, frames: l } : e;
  }
  if (!ye(e, t)) return e;
  let r = !1;
  const a = e.children.map((s) => {
    const l = zt(s, t, n);
    return l !== s && (r = !0), l;
  });
  return r ? { ...e, children: a } : e;
}
function Qf(e, t, n) {
  return zt(e, t, (r) => ao(r.rect, n) ? r : { ...r, rect: n });
}
const ht = (e) => e.maximized === !0, so = (e) => (t) => {
  if (ht(t) === e) return t;
  if (e) {
    const { minimized: a, ...s } = t;
    return { ...s, maximized: !0 };
  }
  const { maximized: n, ...r } = t;
  return r;
};
function Zf(e, t, n = !0) {
  return zt(e, t, so(n));
}
function ah(e, t) {
  const n = Oe(e, t);
  return n ? Zf(e, t, !ht(n)) : e;
}
const bt = (e) => e.minimized === !0, oo = (e) => (t) => {
  if (bt(t) === e) return t;
  if (e) {
    const { maximized: a, ...s } = t;
    return { ...s, minimized: !0 };
  }
  const { minimized: n, ...r } = t;
  return r;
};
function Jf(e, t, n = !0) {
  return zt(e, t, oo(n));
}
function sh(e, t) {
  const n = Oe(e, t);
  return n ? Jf(e, t, !bt(n)) : e;
}
function kt(e, t) {
  const n = t[t.length - 1];
  if (n === void 0) return null;
  const r = je(e, t.slice(0, -1));
  return !r || !le(r) ? null : r.frames[n] ?? null;
}
function Hr(e, t) {
  if (le(e)) {
    for (const [n, r] of e.frames.entries()) {
      if (!ye(r.node, t)) continue;
      const a = Hr(r.node, t);
      return a ? [n, ...a] : [n];
    }
    return null;
  }
  for (const { node: n, index: r } of or(e)) {
    if (!ye(n, t)) continue;
    const a = Hr(n, t);
    return a ? [r, ...a] : null;
  }
  return null;
}
function pa(e, t, n) {
  const r = t[t.length - 1];
  if (r === void 0) return e;
  const a = t.slice(0, -1), s = je(e, a);
  if (!s || !le(s)) return e;
  const l = s.frames[r];
  if (!l) return e;
  const i = n(l);
  if (i === l) return e;
  const o = [...s.frames];
  return o[r] = i, lt(e, a, { ...s, frames: o });
}
function Ua(e, t, n) {
  return pa(
    e,
    t,
    (r) => ao(r.rect, n) ? r : { ...r, rect: n }
  );
}
function ep(e, t, n = !0) {
  return pa(e, t, so(n));
}
function tp(e, t, n = !0) {
  return pa(e, t, oo(n));
}
function Qt(e, t) {
  const [n, ...r] = t;
  if (n === void 0) return e;
  if (le(e)) {
    const l = e.frames[n];
    if (!l) return e;
    const i = Qt(l.node, r), o = i === l.node ? l : { ...l, node: i };
    if (n === e.frames.length - 1 && o === l) return e;
    const c = [...e.frames];
    return c.splice(n, 1), c.push(o), { ...e, frames: c };
  }
  const a = je(e, [n]);
  if (!a) return e;
  const s = Qt(a, r);
  return s === a ? e : lt(e, [n], s);
}
function np(e, t) {
  const n = [...t];
  let r = e;
  return t.forEach((a, s) => {
    r && (le(r) && (n[s] = r.frames.length - 1), r = je(r, [a]));
  }), n;
}
function Cn(e, t, n, r) {
  if (Z(e)) return _n(e, n, (l) => Cn(l, t, n, r));
  if (le(e)) {
    const l = e.frames.findIndex((o) => ye(o.node, n)), i = e.frames[l];
    if (!i) return e;
    if (Oe(i.node, n)) {
      const o = Cn(i.node, t, n, r);
      if (o === i.node) return e;
      const c = [...e.frames];
      return c[l] = { ...i, node: o }, { ...e, frames: c };
    }
    return { ...e, frames: [...e.frames, ar(Ze(t), r)] };
  }
  if (!ye(e, n)) return e;
  let a = !1;
  const s = e.children.map((l) => {
    const i = Cn(l, t, n, r);
    return i !== l && (a = !0), i;
  });
  return a ? { ...e, children: s } : e;
}
function Ga(e, t, n, r) {
  if (t === n || !ye(e, t) || !ye(e, n) || !Oe(e, n)) return e;
  const a = Mt(e, t);
  if (!a) return e;
  const s = Cn(a, t, n, r);
  return s === a ? e : Se(s);
}
function rp(e, t, n) {
  return le(e) ? { ...e, frames: [...e.frames, ar(Ze(t), n)] } : Z(e) ? io(e, t) : {
    kind: "split",
    direction: e.direction,
    children: [...e.children, Ze(t)],
    sizes: [...dt(e), 1],
    ...Pe(e)
  };
}
function lo(e, t, n, r) {
  const a = n[0];
  if (a === void 0) return rp(e, t, r);
  const s = n.slice(1), l = (u, m) => m === a ? lo(u, t, s, r) : Mt(u, t);
  if (le(e)) {
    const u = e.frames.flatMap((m, $) => {
      const w = l(m.node, $);
      return w ? [w === m.node ? m : { ...m, node: w }] : [];
    });
    return { ...e, frames: u };
  }
  if (Z(e)) {
    const u = Tt(e), m = [];
    e.panels.forEach((b, g) => {
      if ($e(b)) {
        b !== t && m.push(b);
        return;
      }
      const M = l(b, g);
      M && m.push(M);
    });
    const w = e.active && m.some((b) => yn(b).includes(e.active)) ? e.active : ze(m[u] ?? m[m.length - 1]);
    return {
      kind: "group",
      panels: m,
      ...w ? { active: w } : {},
      ...Pe(e)
    };
  }
  const i = dt(e), o = [], c = [];
  return e.children.forEach((u, m) => {
    const $ = l(u, m);
    $ && (o.push($), c.push(i[m] ?? 0));
  }), { kind: "split", direction: e.direction, children: o, sizes: c, ...Pe(e) };
}
function Ya(e, t, n, r) {
  const a = je(e, n);
  return !a || !no(a) || !ye(e, t) ? e : Se(lo(e, t, n, r));
}
function wr(e, t) {
  if (Z(e)) return _n(e, t, (a) => wr(a, t));
  if (le(e)) {
    const a = e.frames.findIndex((c) => ye(c.node, t)), s = e.frames[a];
    if (!s) return e;
    const l = wr(s.node, t), i = l === s.node ? s : { ...s, node: l };
    if (a === e.frames.length - 1 && i === s) return e;
    const o = [...e.frames];
    return o.splice(a, 1), o.push(i), { ...e, frames: o };
  }
  if (!ye(e, t)) return e;
  let n = !1;
  const r = e.children.map((a) => {
    const s = wr(a, t);
    return s !== a && (n = !0), s;
  });
  return n ? { ...e, children: r } : e;
}
function va(e, t) {
  if (e <= 0) return [];
  const n = () => Array.from({ length: e }, () => 1 / e);
  if (!t || t.length !== e) return n();
  const r = t.map((s) => Number.isFinite(s) && s > 0 ? s : 0), a = r.reduce((s, l) => s + l, 0);
  return a <= 0 ? n() : r.map((s) => s / a);
}
const dt = (e) => va(e.children.length, e.sizes), tt = (e) => {
  const t = Z(e) ? e.panels.length : e.children.length;
  return e.places?.length === t ? e.places : void 0;
};
function Se(e) {
  if (Z(e)) return ap(e);
  if (le(e)) {
    const i = e.frames.flatMap((o) => {
      const c = Se(o.node);
      return Dr(c) ? [] : [c === o.node ? o : { ...o, node: c }];
    });
    return i.length === e.frames.length && i.every((o, c) => o === e.frames[c]) ? e : { ...e, frames: i };
  }
  if (e.children.length === 0) return e;
  const t = dt(e), n = tt(e), r = [], a = [], s = [];
  e.children.forEach((i, o) => {
    const c = Se(i), u = t[o] ?? 0;
    if (Dr(c)) return;
    if (!n && qt(c) && c.direction === e.direction && !tt(c) && !Et(c)) {
      const $ = dt(c);
      c.children.forEach((w, b) => {
        r.push(w), a.push(u * ($[b] ?? 0));
      });
      return;
    }
    r.push(c), a.push(u);
    const m = n?.[o];
    m && s.push(m);
  });
  const l = r[0];
  return r.length === 1 && l && !Et(e) ? l : {
    kind: "split",
    direction: e.direction,
    children: r,
    sizes: va(r.length, a),
    ...Pe(e),
    ...s.length === r.length && s.length > 0 ? { places: s } : {}
  };
}
function ap(e) {
  if (e.panels.every($e)) return e;
  const t = ze(e), n = tt(e), r = [], a = [];
  e.panels.forEach((i, o) => {
    const c = n?.[o];
    if ($e(i)) {
      r.push(i), c && a.push(c);
      return;
    }
    const u = Se(i);
    if (!Dr(u)) {
      if (Z(u) && !Et(u) && !tt(u) && !e.headless) {
        r.push(...u.panels);
        return;
      }
      r.push(u), c && a.push(c);
    }
  });
  const s = r[0];
  if (r.length === 1 && s !== void 0 && !$e(s) && !Et(e))
    return s;
  if (r.length === e.panels.length && r.every((i, o) => i === e.panels[o]))
    return e;
  const l = t && r.some((i) => yn(i).includes(t)) ? t : void 0;
  return {
    kind: "group",
    panels: r,
    ...l ? { active: l } : {},
    ...Pe(e),
    ...a.length === r.length && a.length > 0 ? { places: a } : {}
  };
}
function Mt(e, t) {
  if (le(e)) {
    const l = e.frames.flatMap((i) => {
      const o = Mt(i.node, t);
      return o ? [o === i.node ? i : { ...i, node: o }] : [];
    });
    return l.length === 0 && !Fr(e) ? null : { ...e, frames: l };
  }
  if (Z(e)) {
    if (!ye(e, t)) return e;
    const l = Tt(e), i = [];
    for (const u of e.panels) {
      if ($e(u)) {
        u !== t && i.push(u);
        continue;
      }
      const m = Mt(u, t);
      m && i.push(m);
    }
    if (i.length === 0) return null;
    const c = e.active && i.some((u) => yn(u).includes(e.active)) ? e.active : ze(i[l] ?? i[i.length - 1]);
    return c ? { kind: "group", panels: i, active: c, ...Pe(e) } : { kind: "group", panels: i, ...Pe(e) };
  }
  const n = dt(e), r = [], a = [];
  if (e.children.forEach((l, i) => {
    const o = Mt(l, t);
    o && (r.push(o), a.push(n[i] ?? 0));
  }), r.length === 0)
    return Fr(e) ? { kind: "split", direction: e.direction, children: r, sizes: [], ...Pe(e) } : null;
  const s = r[0];
  return r.length === 1 && s && !Et(e) ? s : Se({
    kind: "split",
    direction: e.direction,
    children: r,
    sizes: a,
    ...Pe(e)
  });
}
function io(e, t, n) {
  const r = e.panels.filter((s) => s !== t), a = n === void 0 ? r.length : Math.max(0, Math.min(n, r.length));
  return r.splice(a, 0, t), { kind: "group", panels: r, active: t, ...Pe(e) };
}
function Gt(e, t, n, r, a) {
  const s = (w) => gn(
    w,
    (b) => ye(b, n) ? Gt(b, t, n, r, a) : b
  );
  if (r === "float") return e;
  const l = (w) => _n(w, n, (b) => Gt(b, t, n, r, a));
  if (r === "center")
    return Z(e) ? We(e, n) ? io(e, t, a) : l(e) : le(e) ? s(e) : {
      ...e,
      children: e.children.map(
        (w) => ye(w, n) ? Gt(w, t, n, r, a) : w
      )
    };
  const i = Yf(r), o = r === "left" || r === "top", c = (w) => ({
    kind: "split",
    direction: i,
    children: o ? [Ze(t), w] : [w, Ze(t)],
    sizes: [0.5, 0.5]
  });
  if (Z(e)) return We(e, n) ? c(e) : l(e);
  if (le(e)) return s(e);
  const u = dt(e), m = e.children.findIndex(
    (w) => Z(w) && We(w, n)
  );
  if (m >= 0 && e.direction === i) {
    const w = (u[m] ?? 0) / 2, b = [...e.children], g = [...u];
    return b.splice(o ? m : m + 1, 0, Ze(t)), g.splice(m, 1, w, w), {
      kind: "split",
      direction: i,
      children: b,
      sizes: g,
      ...Pe(e)
    };
  }
  const $ = e.children.map((w) => ye(w, n) ? Z(w) && We(w, n) ? c(w) : Gt(w, t, n, r) : w);
  return {
    kind: "split",
    direction: e.direction,
    children: $,
    sizes: u,
    ...Pe(e)
  };
}
function It(e, t) {
  if (Z(e)) {
    if (We(e, t))
      return ro(e) === t ? e : { ...e, active: t };
    const a = e.panels.findIndex((o) => !$e(o) && ye(o, t)), s = e.panels[a];
    if (s === void 0 || $e(s)) return e;
    const l = It(s, t);
    if (l === s && e.active === t) return e;
    const i = [...e.panels];
    return i[a] = l, { ...e, panels: i, active: t };
  }
  if (!ye(e, t)) return e;
  if (le(e)) return gn(e, (a) => It(a, t));
  let n = !1;
  const r = e.children.map((a) => {
    const s = It(a, t);
    return s !== a && (n = !0), s;
  });
  return n ? { ...e, children: r } : e;
}
function Zt(e, t, n) {
  if (Z(e)) {
    if (!We(e, t)) return _n(e, t, (c) => Zt(c, t, n));
    const r = e.panels.indexOf(t), a = Math.max(0, Math.min(n, e.panels.length - 1));
    if (r === a) return e;
    const s = [...e.panels];
    s.splice(r, 1), s.splice(a, 0, t);
    const l = tt(e), i = l ? [...l] : void 0;
    i && i.splice(a, 0, ...i.splice(r, 1));
    const o = ze(e);
    return {
      kind: "group",
      panels: s,
      ...o ? { active: o } : {},
      ...Pe(e),
      ...i ? { places: i } : {}
    };
  }
  return ye(e, t) ? le(e) ? gn(e, (r) => Zt(r, t, n)) : { ...e, children: e.children.map((r) => Zt(r, t, n)) } : e;
}
function En(e, t, n) {
  if (t === n) return e;
  if (Z(e)) {
    if (!ye(e, t) && !ye(e, n)) return e;
    const r = (s) => s === t ? n : s === n ? t : s, a = e.panels.map((s) => $e(s) ? r(s) : En(s, t, n));
    return { ...e, panels: a, ...e.active ? { active: r(e.active) } : {} };
  }
  return le(e) ? gn(e, (r) => En(r, t, n)) : { ...e, children: e.children.map((r) => En(r, t, n)) };
}
function xn(e, t, n, r, a) {
  if (r === "float" || !ye(e, t) || !ye(e, n)) return e;
  const s = Rt(e, t);
  if (r === "center" && s && We(s, n)) {
    if (a === void 0) return e;
    const i = s.panels.indexOf(t), o = a > i ? a - 1 : a;
    return o === i ? e : It(Zt(e, t, o), t);
  }
  if (t === n) return e;
  const l = Mt(e, t);
  return l ? Se(Gt(l, t, n, r, a)) : e;
}
function co(e, t, n) {
  if (Z(e)) {
    const a = e.panels[t];
    if (a === void 0 || $e(a)) return e;
    const s = [...e.panels];
    return s[t] = n, { ...e, panels: s };
  }
  if (le(e)) {
    const a = e.frames[t];
    if (!a) return e;
    const s = [...e.frames];
    return s[t] = { ...a, node: n }, { ...e, frames: s };
  }
  const r = [...e.children];
  return r[t] = n, { ...e, children: r };
}
function wn(e, t, n) {
  const r = or(e);
  if (!Z(e) && r.some(({ node: a }) => Z(a) && We(a, t))) {
    const a = n(e);
    return a === e ? null : a;
  }
  for (const { node: a, index: s } of r) {
    if (!ye(a, t)) continue;
    const l = wn(a, t, n);
    return l ? co(e, s, l) : null;
  }
  return null;
}
function oh(e, t, n) {
  const r = wn(
    e,
    t,
    (a) => qt(a) && a.direction !== n ? { ...a, direction: n } : a
  );
  return r ? Se(r) : e;
}
function uo(e) {
  return le(e) ? [e] : tt(e) || Et(e) ? [e] : Z(e) ? [...e.panels] : e.children.flatMap(uo);
}
function fo(e, t) {
  if (Z(e)) return e;
  const n = fa(e).map(uo), r = n.flat(), a = t && r.some((l) => yn(l).includes(t)) ? t : void 0, s = sp(e, n);
  return Se({
    kind: "group",
    panels: r,
    ...a ? { active: a } : {},
    ...Pe(e),
    ...s ? { places: s } : {}
  });
}
function sp(e, t) {
  const n = le(e) ? e.frames.map(({ node: r, ...a }) => a) : tt(e);
  if (n)
    return t.every((r) => r.length === 1) ? n : void 0;
}
function op(e, t) {
  const n = wn(e, t, (r) => fo(r, t));
  return n ? Se(n) : e;
}
function ha(e, t, n) {
  if (Z(e) && We(e, t)) {
    const r = n(e);
    return r === e ? null : r;
  }
  for (const { node: r, index: a } of or(e)) {
    if (!ye(r, t)) continue;
    const s = ha(r, t, n);
    return s ? co(e, a, s) : null;
  }
  return null;
}
function Xa(e, t, n) {
  const r = ha(e, t, (a) => po(a, n));
  return r ? Se(r) : e;
}
function Qa(e, t, n) {
  const r = je(e, t);
  return !r || !Z(r) || r.panels.length < 2 ? e : Se(lt(e, t, po(r, n)));
}
function po(e, t) {
  if (e.panels.length < 2) return e;
  const n = tt(e);
  return {
    ...ua(t, e.panels.map(rr)),
    ...Pe(e),
    ...n ? { places: n } : {}
  };
}
function qr(e, t) {
  if (Z(e)) return e;
  if (le(e)) {
    const a = e.frames.findIndex(
      (i) => Z(i.node) && i.node.panels.includes(t)
    ), s = e.frames[a], l = s && Z(s.node) ? s.node : null;
    if (s && l && l.panels.length > 1) {
      const i = sr(l.panels.map(rr), s.rect).frames;
      return {
        ...e,
        frames: [...e.frames.slice(0, a), ...i, ...e.frames.slice(a + 1)]
      };
    }
    return gn(e, (i) => qr(i, t));
  }
  if (!ye(e, t)) return e;
  let n = !1;
  const r = e.children.map((a) => {
    const s = qr(a, t);
    return s !== a && (n = !0), s;
  });
  return n ? { ...e, children: r } : e;
}
function lp(e, t, n) {
  const r = Rt(e, t);
  if (!r || r.panels.length < 2) return e;
  if (Oe(e, t)?.node === r) {
    const l = qr(e, t);
    return l === e ? e : Se(l);
  }
  const s = ha(e, t, (l) => vo(l, n));
  return s ? Se(s) : e;
}
function ip(e, t, n) {
  const r = je(e, t);
  if (!r || !Z(r) || r.panels.length < 2) return e;
  const a = t.slice(0, -1), s = t.length > 0 ? je(e, a) : null, l = t[t.length - 1], i = s && le(s) && l !== void 0 ? s.frames[l] : void 0;
  if (s && le(s) && i && l !== void 0) {
    const o = sr(r.panels.map(rr), i.rect).frames, c = [...s.frames.slice(0, l), ...o, ...s.frames.slice(l + 1)];
    return Se(lt(e, a, { ...s, frames: c }));
  }
  return Se(lt(e, t, vo(r, n)));
}
function vo(e, t) {
  return {
    ...ca(ho(e.panels.map(rr), tt(e), t)),
    ...Pe(e)
  };
}
function ho(e, t, n) {
  return t ? e.map((r, a) => ({ ...t[a], node: r })) : sr(e, n).frames;
}
function mo(e, t) {
  return { ...ca(ho(e.children, tt(e), t)), ...Pe(e) };
}
function lh(e, t, n) {
  const r = wn(
    e,
    t,
    (a) => le(a) ? a : mo(a, n)
  );
  return r ? Se(r) : Z(e) && We(e, t) ? sr([e], n) : e;
}
function cp(e, t) {
  const n = (a) => t === "column" ? a.rect.y : a.rect.x, r = (a) => t === "column" ? a.rect.x : a.rect.y;
  return [...e].sort((a, s) => n(a) - n(s) || r(a) - r(s));
}
function go(e, t) {
  const n = cp(e.frames, t);
  return {
    kind: "split",
    direction: t,
    children: n.map((r) => r.node),
    ...Pe(e),
    places: n.map(({ node: r, ...a }) => a)
  };
}
function ih(e, t, n = "row") {
  const r = wn(
    e,
    t,
    (a) => le(a) ? go(a, n) : a
  );
  return r ? Se(r) : e;
}
function yo(e) {
  if (le(e)) return null;
  const t = Z(e) ? e.panels.length === 1 ? e.panels[0] : void 0 : e.children.length === 1 ? e.children[0] : void 0;
  return t === void 0 || $e(t) || Z(t) && t.panels.length === 1 && $e(t.panels[0]) ? null : t;
}
const up = (e) => {
  const { title: t, fixedView: n, headless: r, ...a } = e;
  return a;
};
function dp(e, t) {
  const n = yo(e);
  return n ? t === "inner" ? n : { ...up(n), ...Pe(e) } : e;
}
function Ft(e) {
  return e.title ? e.title : Z(e) ? "" : le(e) ? "Desktop" : e.direction === "row" ? "Row" : "Column";
}
function Jt(e, t) {
  if (Z(e)) {
    const r = e.panels[Tt(e)];
    return r === void 0 ? "" : $e(r) ? t(r) ?? r : Ft(r) || Jt(r, t);
  }
  if (e.title) return e.title;
  if (le(e)) {
    const r = e.frames[e.frames.length - 1];
    return r ? r.title ?? Jt(r.node, t) : "";
  }
  const n = e.children[0];
  return n ? Jt(n, t) : "";
}
function je(e, t) {
  let n = e;
  for (const r of t) {
    if (!n) return null;
    if (qt(n)) n = n.children[r];
    else if (le(n)) n = n.frames[r]?.node;
    else {
      const a = n.panels[r];
      n = a === void 0 || $e(a) ? void 0 : a;
    }
  }
  return n ?? null;
}
function lt(e, t, n) {
  if (t.length === 0) return n;
  const [r, ...a] = t;
  if (r === void 0) return e;
  if (le(e)) {
    const o = e.frames[r];
    if (!o) return e;
    const c = lt(o.node, a, n);
    if (c === o.node) return e;
    const u = [...e.frames];
    return u[r] = { ...o, node: c }, { ...e, frames: u };
  }
  if (Z(e)) {
    const o = e.panels[r];
    if (o === void 0 || $e(o)) return e;
    const c = lt(o, a, n);
    if (c === o) return e;
    const u = [...e.panels];
    return u[r] = c, { ...e, panels: u };
  }
  const s = e.children[r];
  if (!s) return e;
  const l = lt(s, a, n);
  if (l === s) return e;
  const i = [...e.children];
  return i[r] = l, { ...e, children: i };
}
function Pn(e, t, n) {
  if (t.length === 0)
    return qt(e) ? { ...e, sizes: va(e.children.length, n) } : e;
  const [r, ...a] = t;
  if (r === void 0) return e;
  if (le(e)) {
    const i = e.frames[r];
    if (!i) return e;
    const o = Pn(i.node, a, n);
    if (o === i.node) return e;
    const c = [...e.frames];
    return c[r] = { ...i, node: o }, { ...e, frames: c };
  }
  if (Z(e)) {
    const i = e.panels[r];
    if (i === void 0 || $e(i)) return e;
    const o = Pn(i, a, n);
    if (o === i) return e;
    const c = [...e.panels];
    return c[r] = o, { ...e, panels: c };
  }
  const s = e.children[r];
  if (!s) return e;
  const l = [...e.children];
  return l[r] = Pn(s, a, n), { ...e, children: l };
}
function Za(e, t, n, r = 0.02) {
  const a = e[t], s = e[t + 1];
  if (a === void 0 || s === void 0) return e;
  const l = a + s;
  if (l < r * 2) return e;
  const i = [...e], o = Math.min(Math.max(a + n, r), l - r);
  return i[t] = o, i[t + 1] = l - o, i;
}
function qn(e) {
  if (!Z(e) || e.panels.length >= 2) return e;
  const t = e.panels[0];
  return t !== void 0 && !$e(t) ? e : { ...da([fp(e)]), ...Pe(e) };
}
const fp = (e) => {
  if (!e.title) return e;
  const { title: t, ...n } = e;
  return n;
};
function Ja(e) {
  return e.length === 0 ? null : da(e.map(Ze));
}
function pp(e, t) {
  if (!e) return Ja(t);
  const n = new Set(t), r = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set();
  for (const o of Ue(e))
    !n.has(o) || r.has(o) ? a.add(o) : r.add(o);
  let s = e;
  for (const o of a)
    s = s ? Mt(s, o) : null;
  const l = new Set(s ? Ue(s) : []), i = t.filter((o) => !l.has(o));
  if (i.length === 0) return s ? qn(Se(s)) : null;
  if (!s) return Ja(i);
  if (le(s)) {
    const o = s.frames.length;
    return {
      ...s,
      frames: [
        ...s.frames,
        ...i.map(
          (c, u) => ar(Ze(c), {
            x: xt.x + (o + u) * Hn,
            y: xt.y + (o + u) * Hn
          })
        )
      ]
    };
  }
  return qn(Se(da([s, ...i.map(Ze)])));
}
const ma = Symbol("dc.windowContext");
function vp(e) {
  return ln(ma, e), e;
}
function lr() {
  const e = St(ma, null);
  if (!e)
    throw new Error(
      "[appfr] No window context found. Render this component inside <WindowFrame>."
    );
  return e;
}
const hp = 320, mp = 240;
function gp(e) {
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
function yp(e, t) {
  if (typeof window > "u") return null;
  const n = Math.max(hp, Math.round(t?.width ?? window.innerWidth)), r = Math.max(mp, Math.round(t?.height ?? window.innerHeight)), a = ["popup", `width=${n}`, `height=${r}`];
  t?.left !== void 0 && a.push(`left=${t.left}`), t?.top !== void 0 && a.push(`top=${t.top}`);
  const s = window.open(e, "_blank", a.join(","));
  if (s)
    try {
      s.opener = null;
    } catch {
    }
  return s;
}
const _p = ["data-dc-glyph"], wp = { class: "dc-glyph__line" }, kp = ["d"], bp = {
  key: 0,
  class: "dc-glyph__aqua"
}, $p = ["d"], xp = /* @__PURE__ */ ae({
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
    return (r, a) => (f(), h("svg", {
      class: "dc-glyph",
      "data-dc-glyph": e.kind,
      viewBox: "0 0 10 10",
      "aria-hidden": "true",
      focusable: "false"
    }, [
      E("g", wp, [
        (f(!0), h(te, null, he(t[e.kind], (s) => (f(), h("path", {
          key: s,
          d: s
        }, null, 8, kp))), 128))
      ]),
      n[e.kind] ? (f(), h("g", bp, [
        (f(!0), h(te, null, he(n[e.kind], (s) => (f(), h("path", {
          key: s,
          d: s
        }, null, 8, $p))), 128))
      ])) : T("", !0)
    ], 8, _p));
  }
}), Nt = /* @__PURE__ */ oe(xp, [["__scopeId", "data-v-4d2872c0"]]), Mp = ["data-dc-order", "data-dc-path", "data-dc-maximized", "data-dc-minimized", "data-dc-dragging"], Sp = ["data-dc-movable"], Cp = { class: "dc-float__title dc-truncate" }, Ep = {
  key: 1,
  class: "dc-float__controls dc-controls"
}, Pp = ["aria-label", "aria-pressed", "data-dc-minimize"], Ap = ["aria-label", "aria-pressed", "data-dc-maximize"], Tp = ["aria-label", "data-dc-close"], Lp = { class: "dc-float__content" }, Op = ["data-dc-handle", "onPointerdown"], Rp = /* @__PURE__ */ ae({
  __name: "WindowFloat",
  props: {
    frame: {},
    path: {},
    order: {},
    place: {}
  },
  setup(e) {
    const t = e, n = lr(), r = p(() => ze(t.frame.node)), a = p(() => n.panelFor(r.value)?.fixed === !0), s = p(() => ht(t.frame)), l = p(() => bt(t.frame)), i = p(() => s.value || l.value), o = p(() => n.resizable.value && !a.value && !i.value), c = p(() => !a.value && !i.value), u = p(() => {
      const S = Ue(t.frame.node);
      return S.length === 1 ? S[0] ?? null : null;
    }), m = p(() => u.value !== null && n.closable(u.value)), $ = p(() => t.frame.node.headless === !0), w = p(
      () => !$.value && (!Z(t.frame.node) || l.value)
    ), b = p(
      () => t.frame.title || Ft(t.frame.node) || Jt(t.frame.node, (S) => n.panelFor(S)?.title)
    ), g = p(() => n.spaceMenu(t.path));
    function M(S) {
      S.target?.closest("button, a, input, select, textarea, label") || n.beginFrameDragAt(t.path, S, "move");
    }
    function y(S) {
      S.target?.closest("button, a, input, select, textarea, label") || (l.value ? n.toggleMinimizeAt(t.path) : n.toggleMaximizeAt(t.path));
    }
    const C = p(() => {
      const S = n.framing.value;
      return S !== null && ye(t.frame.node, S);
    }), k = p(() => ({
      // Neither maximizing nor rolling up overwrites the rect: it is where the
      // window goes back to, and both are a way of not being there for a while.
      ...s.value ? { inset: "0" } : l.value && t.place ? {
        left: `${t.place.x}px`,
        bottom: `${t.place.bottom}px`,
        width: `${Br}px`,
        height: `${to}px`
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
    return (S, B) => (f(), h("div", {
      class: "dc-float",
      style: xe(k.value),
      "data-dc-order": e.order,
      "data-dc-path": e.path.join("/"),
      "data-dc-maximized": s.value ? "true" : "false",
      "data-dc-minimized": l.value ? "true" : "false",
      "data-dc-dragging": C.value ? "true" : "false",
      onPointerdown: B[3] || (B[3] = (A) => L(n).raiseAt(e.path))
    }, [
      w.value ? (f(), h("header", {
        key: 0,
        class: "dc-float__bar",
        "data-dc-movable": c.value ? "true" : "false",
        onPointerdown: M,
        onDblclick: y
      }, [
        E("span", Cp, N(b.value), 1),
        g.value.length ? (f(), Y(ia, {
          key: 0,
          items: g.value,
          label: `${b.value} menu`
        }, null, 8, ["items", "label"])) : T("", !0),
        !a.value || l.value && m.value && u.value ? (f(), h("div", Ep, [
          a.value ? T("", !0) : (f(), h("button", {
            key: 0,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `${l.value ? "Unroll" : "Minimize"} ${b.value}`,
            "aria-pressed": l.value,
            "data-dc-minimize": r.value,
            onClick: B[0] || (B[0] = (A) => L(n).toggleMinimizeAt(e.path))
          }, [
            de(Nt, {
              kind: l.value ? "unroll" : "minimize"
            }, null, 8, ["kind"])
          ], 8, Pp)),
          a.value ? T("", !0) : (f(), h("button", {
            key: 1,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `${s.value ? "Restore" : "Maximize"} ${b.value}`,
            "aria-pressed": s.value,
            "data-dc-maximize": r.value,
            onClick: B[1] || (B[1] = (A) => L(n).toggleMaximizeAt(e.path))
          }, [
            de(Nt, {
              kind: s.value ? "restore" : "maximize"
            }, null, 8, ["kind"])
          ], 8, Ap)),
          l.value && m.value && u.value ? (f(), h("button", {
            key: 2,
            type: "button",
            class: "dc-float__button dc-control",
            "aria-label": `Close ${b.value}`,
            "data-dc-close": u.value,
            onClick: B[2] || (B[2] = (A) => L(n).close(u.value))
          }, [
            de(Nt, { kind: "close" })
          ], 8, Tp)) : T("", !0)
        ])) : T("", !0)
      ], 40, Sp)) : T("", !0),
      E("div", Lp, [
        we(S.$slots, "default", {}, void 0, !0)
      ]),
      (f(!0), h(te, null, he(o.value ? x : [], (A) => (f(), h("span", {
        key: A,
        class: "dc-float__grip",
        "data-dc-handle": A,
        "aria-hidden": "true",
        onPointerdown: Qe((R) => L(n).beginFrameDragAt(e.path, R, A), ["stop"])
      }, null, 40, Op))), 128))
    ], 44, Mp));
  }
}), zp = /* @__PURE__ */ oe(Rp, [["__scopeId", "data-v-b10f12c6"]]), ga = Symbol("dc.paneContext");
function _o(e) {
  return ln(ga, e), e;
}
function ch() {
  return St(ga, null);
}
function uh(e) {
  const t = St(ma, null), n = St(ga, null);
  if (!t || !n) return () => {
  };
  const r = t.registerMenu(
    () => n.panel.value,
    () => ut(e)
  );
  return Vn() && Dt(r), r;
}
const Ip = ["data-dc-panel"], Np = /* @__PURE__ */ ae({
  __name: "WindowPaneBody",
  props: {
    panel: {},
    active: { type: Boolean }
  },
  setup(e) {
    const t = e, n = lr();
    _o({ panel: p(() => t.panel) });
    const r = () => {
      const a = n.panelFor(t.panel);
      return a ? n.renderContent(a, n.viewFor(t.panel), t.active) ?? null : null;
    };
    return (a, s) => (f(), h("div", {
      class: "dc-pane__content",
      "data-dc-panel": t.panel
    }, [
      de(r)
    ], 8, Ip));
  }
}), Bp = /* @__PURE__ */ oe(Np, [["__scopeId", "data-v-31c655fd"]]), Fp = ["data-dc-panel", "data-dc-panels", "data-dc-tabbed", "data-dc-floating", "data-dc-maximized", "data-dc-headless", "data-dc-active", "data-dc-dragging", "aria-label"], Dp = ["data-dc-movable"], Hp = ["aria-label", "aria-pressed"], qp = ["data-dc-space-name"], Vp = { class: "dc-truncate" }, Kp = ["aria-label"], Wp = {
  key: 0,
  class: "dc-pane__insert",
  "aria-hidden": "true"
}, jp = ["id", "data-dc-panel", "data-dc-space", "aria-selected", "aria-controls", "tabindex", "onPointerdown", "onClick", "onKeydown"], Up = { class: "dc-tab__name dc-truncate" }, Gp = {
  key: 0,
  class: "dc-pane__sub dc-mono dc-truncate"
}, Yp = ["aria-label", "data-dc-close", "onClick"], Xp = {
  key: 0,
  class: "dc-pane__insert",
  "aria-hidden": "true"
}, Qp = { class: "dc-pane__tools" }, Zp = {
  key: 2,
  class: "dc-pane__controls dc-controls"
}, Jp = ["aria-label", "data-dc-minimize"], ev = ["aria-label", "aria-pressed", "data-dc-maximize"], tv = ["aria-label", "data-dc-close"], nv = ["id", "role", "aria-labelledby"], rv = ["id", "role", "aria-labelledby"], av = ["data-dc-edge"], sv = /* @__PURE__ */ ae({
  __name: "WindowPane",
  props: {
    group: {},
    path: {}
  },
  setup(e) {
    const t = e, n = lr(), r = Kn() ?? "dc-pane", a = p(
      () => t.group.panels.flatMap((I, Q) => {
        if (!$e(I)) {
          const Re = Ft(I) || Jt(I, (Be) => n.panelFor(Be)?.title);
          return [{ kind: "space", index: Q, id: `space-${Q}`, title: Re, node: I }];
        }
        const ee = n.panelFor(I);
        return ee ? [{ kind: "panel", index: Q, id: I, title: ee.title, panel: ee }] : [];
      })
    ), s = p(() => a.value.length > 1), l = p(() => {
      const I = Tt(t.group);
      return a.value.find((Q) => Q.index === I) ?? a.value[0] ?? null;
    }), i = p(() => l.value?.kind === "space" ? l.value.node : null), o = p(() => i.value ? "" : ro(t.group)), c = p(() => i.value ? null : n.panelFor(o.value)), u = p(() => l.value?.title ?? ""), m = p(() => n.spaceNames.value ? t.group.title ?? "" : ""), $ = p(() => [...t.path, l.value?.index ?? 0]), w = p(() => o.value || Wa(t.group)[0] || ""), b = p(() => n.viewFor(o.value)), g = p(() => t.group.headless === !0), M = p(() => n.focused.value === o.value), y = p(() => n.dragging.value === o.value), C = p(() => n.moving.value === o.value), k = p(() => n.frameOf(w.value) !== null), x = p(() => n.panelFor(w.value)?.fixed === !0), S = p(
      () => !i.value && (n.canMove(o.value) || k.value && !x.value)
    ), B = p(
      () => i.value ? n.spaceMenu($.value) : n.menuFor(o.value)
    ), A = (I) => n.closable(I);
    _o({ panel: o });
    const R = p(() => n.maximized(w.value)), P = p(
      () => k.value && !x.value || !s.value && !!c.value && A(c.value.id)
    ), K = (I) => `${r}-tab-${I}`, W = p(() => `${r}-body`), X = p(() => {
      const I = n.dropTarget.value;
      return !I || !We(t.group, I.panel) || I.edge === "float" ? null : I;
    }), ge = p(() => X.value?.index === void 0 ? X.value?.edge ?? null : null), ve = p(() => X.value?.index ?? null), Ne = p(
      () => a.value.flatMap(
        (I) => I.kind === "panel" && (I.id === o.value || I.panel.keepAlive === !0) ? [I.id] : []
      )
    ), q = V(null), G = /* @__PURE__ */ new Map();
    be(
      o,
      (I, Q) => {
        const ee = q.value;
        if (!ee || (Q && G.set(Q, ee.scrollTop), !n.panelFor(I)?.keepAlive || !G.has(I))) return;
        const Re = G.get(I);
        yt(() => {
          q.value && (q.value.scrollTop = Re);
        });
      },
      { flush: "pre" }
    );
    const se = () => c.value ? n.renderActions(c.value, b.value, M.value) ?? null : null;
    let ie = null;
    function z(I) {
      const Q = ie !== null && Math.hypot(I.clientX - ie.x, I.clientY - ie.y) >= 4;
      return ie = null, Q;
    }
    const J = (I) => I.kind === "panel" ? I.id : ze(I.node);
    function fe(I, Q) {
      Q.kind !== "space" && (n.focus(Q.id), ie = { x: I.clientX, y: I.clientY }, n.beginDrag(Q.id, I));
    }
    function qe(I, Q) {
      if (z(I)) return;
      const ee = J(Q);
      ee && n.selectPanel(ee);
    }
    function nt(I) {
      o.value && n.focus(o.value), !I.target?.closest(".dc-tab, button, a, input, select, textarea, label") && (k.value ? n.beginFrameDrag(w.value, I, "move") : n.beginDrag(o.value, I));
    }
    function rt(I) {
      ie = { x: I.clientX, y: I.clientY }, n.beginDrag(o.value, I);
    }
    function Ge(I) {
      z(I) || n.toggleMoveMode(o.value);
    }
    const Ve = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down"
    };
    function Ye(I) {
      if (!C.value) return;
      if (I.key === "Escape") {
        I.preventDefault(), n.toggleMoveMode(o.value);
        return;
      }
      const Q = Ve[I.key];
      Q && (I.preventDefault(), k.value ? n.nudgeFrame(o.value, Q, I.shiftKey) : n.nudge(o.value, Q, I.shiftKey));
    }
    function F(I) {
      !k.value || I.target?.closest(".dc-tab, button, a, input, select, textarea, label") || n.toggleMaximize(w.value);
    }
    function j(I, Q) {
      I.stopPropagation(), ie = null, n.close(Q);
    }
    function re(I, Q) {
      const ee = a.value.length;
      let Re = null;
      if (I.key === "ArrowRight" ? Re = (Q + 1) % ee : I.key === "ArrowLeft" ? Re = (Q - 1 + ee) % ee : I.key === "Home" ? Re = 0 : I.key === "End" && (Re = ee - 1), Re === null) return;
      I.preventDefault();
      const Be = a.value[Re];
      if (!Be) return;
      const Vt = J(Be);
      Vt && n.selectPanel(Vt);
    }
    return (I, Q) => l.value ? (f(), h("section", {
      key: 0,
      class: "dc-pane",
      "data-dc-panel": o.value || void 0,
      "data-dc-panels": L(Wa)(e.group).join(" ") || void 0,
      "data-dc-tabbed": s.value ? "true" : "false",
      "data-dc-floating": k.value ? "true" : "false",
      "data-dc-maximized": R.value ? "true" : "false",
      "data-dc-headless": g.value ? "true" : "false",
      "data-dc-active": M.value ? "true" : "false",
      "data-dc-dragging": y.value ? "true" : "false",
      "aria-label": u.value,
      onFocusin: Q[7] || (Q[7] = (ee) => o.value && L(n).focus(o.value))
    }, [
      g.value ? T("", !0) : (f(), h("header", {
        key: 0,
        class: "dc-pane__head",
        "data-dc-movable": S.value ? "true" : "false",
        onPointerdown: nt,
        onDblclick: F
      }, [
        S.value ? (f(), h("button", {
          key: 0,
          type: "button",
          class: "dc-pane__grip",
          "aria-label": `Move ${u.value}`,
          "aria-pressed": C.value,
          onPointerdown: rt,
          onClick: Ge,
          onKeydown: Ye
        }, [...Q[8] || (Q[8] = [
          E("span", { "aria-hidden": "true" }, "⠿", -1)
        ])], 40, Hp)) : T("", !0),
        m.value ? (f(), h("span", {
          key: 1,
          class: "dc-pane__name",
          "data-dc-space-name": m.value
        }, [
          E("span", Vp, N(m.value), 1)
        ], 8, qp)) : T("", !0),
        E("div", {
          class: "dc-pane__tabs",
          role: "tablist",
          "aria-label": `${u.value} panels`
        }, [
          (f(!0), h(te, null, he(a.value, (ee, Re) => (f(), h(te, {
            key: ee.id
          }, [
            ve.value === Re ? (f(), h("span", Wp)) : T("", !0),
            E("button", {
              id: K(ee.id),
              type: "button",
              role: "tab",
              class: "dc-tab",
              "data-dc-panel": ee.kind === "panel" ? ee.id : void 0,
              "data-dc-space": ee.kind === "space" ? ee.title : void 0,
              "aria-selected": ee.index === l.value.index,
              "aria-controls": W.value,
              tabindex: ee.index === l.value.index ? 0 : -1,
              onPointerdown: (Be) => fe(Be, ee),
              onClick: (Be) => qe(Be, ee),
              onKeydown: (Be) => re(Be, Re)
            }, [
              E("span", Up, N(ee.title), 1),
              ee.kind === "panel" && ee.panel.subtitle ? (f(), h("span", Gp, N(ee.panel.subtitle), 1)) : T("", !0),
              s.value && ee.kind === "panel" && A(ee.id) ? (f(), h("span", {
                key: 1,
                class: "dc-tab__close",
                role: "button",
                tabindex: "-1",
                "aria-label": `Close ${ee.title}`,
                "data-dc-close": ee.id,
                onPointerdown: Q[0] || (Q[0] = Qe(() => {
                }, ["stop"])),
                onClick: (Be) => j(Be, ee.id)
              }, [...Q[9] || (Q[9] = [
                E("span", { "aria-hidden": "true" }, "×", -1)
              ])], 40, Yp)) : T("", !0)
            ], 40, jp)
          ], 64))), 128)),
          ve.value === a.value.length ? (f(), h("span", Xp)) : T("", !0)
        ], 8, Kp),
        E("div", Qp, [
          de(se),
          B.value.length ? (f(), Y(ia, {
            key: 0,
            items: B.value,
            label: `${u.value} menu`
          }, null, 8, ["items", "label"])) : T("", !0)
        ]),
        P.value ? (f(), h("div", Zp, [
          k.value && !x.value ? (f(), h("button", {
            key: 0,
            type: "button",
            class: "dc-pane__button dc-control",
            "aria-label": `Minimize ${u.value}`,
            "data-dc-minimize": w.value,
            onPointerdown: Q[1] || (Q[1] = Qe(() => {
            }, ["stop"])),
            onClick: Q[2] || (Q[2] = (ee) => L(n).toggleMinimize(w.value))
          }, [
            de(Nt, { kind: "minimize" })
          ], 40, Jp)) : T("", !0),
          k.value && !x.value ? (f(), h("button", {
            key: 1,
            type: "button",
            class: "dc-pane__button dc-control",
            "aria-label": `${R.value ? "Restore" : "Maximize"} ${u.value}`,
            "aria-pressed": R.value,
            "data-dc-maximize": w.value,
            onPointerdown: Q[3] || (Q[3] = Qe(() => {
            }, ["stop"])),
            onClick: Q[4] || (Q[4] = (ee) => L(n).toggleMaximize(w.value))
          }, [
            de(Nt, {
              kind: R.value ? "restore" : "maximize"
            }, null, 8, ["kind"])
          ], 40, ev)) : T("", !0),
          !s.value && c.value && A(c.value.id) ? (f(), h("button", {
            key: 2,
            type: "button",
            class: "dc-pane__close dc-control",
            "aria-label": `Close ${u.value}`,
            "data-dc-close": c.value.id,
            onPointerdown: Q[5] || (Q[5] = Qe(() => {
            }, ["stop"])),
            onClick: Q[6] || (Q[6] = (ee) => L(n).close(c.value.id))
          }, [
            de(Nt, { kind: "close" })
          ], 40, tv)) : T("", !0)
        ])) : T("", !0)
      ], 40, Dp)),
      i.value ? (f(), h("div", {
        key: 1,
        id: W.value,
        class: "dc-pane__space",
        role: g.value ? void 0 : "tabpanel",
        "aria-labelledby": g.value ? void 0 : K(l.value.id)
      }, [
        we(I.$slots, "space", {
          node: i.value,
          path: $.value
        }, void 0, !0)
      ], 8, nv)) : T("", !0),
      !i.value || Ne.value.length ? en((f(), h("div", {
        key: 2,
        id: i.value ? void 0 : W.value,
        ref_key: "body",
        ref: q,
        class: "dc-pane__body",
        role: g.value || i.value ? void 0 : "tabpanel",
        "aria-labelledby": g.value || i.value ? void 0 : K(o.value)
      }, [
        (f(!0), h(te, null, he(Ne.value, (ee) => en((f(), Y(Bp, {
          key: ee,
          panel: ee,
          active: ee === o.value && M.value
        }, null, 8, ["panel", "active"])), [
          [On, ee === o.value]
        ])), 128))
      ], 8, rv)), [
        [On, !i.value]
      ]) : T("", !0),
      ge.value ? (f(), h("div", {
        key: 3,
        class: "dc-pane__drop",
        "data-dc-edge": ge.value,
        "aria-hidden": "true"
      }, null, 8, av)) : T("", !0)
    ], 40, Fp)) : T("", !0);
  }
}), wo = /* @__PURE__ */ oe(sv, [["__scopeId", "data-v-34fe9df7"]]), ov = ["data-dc-space", "data-dc-path", "data-dc-bare", "aria-label"], lv = {
  key: 0,
  class: "dc-space__head"
}, iv = { class: "dc-space__title dc-truncate" }, cv = ["data-dc-direction"], uv = {
  key: 0,
  class: "dc-space__drop",
  "aria-hidden": "true"
}, dv = ["aria-orientation", "aria-label", "aria-valuenow", "aria-disabled", "tabindex", "onPointerdown", "onKeydown"], fv = /* @__PURE__ */ ae({
  __name: "WindowNode",
  props: {
    node: {},
    path: {},
    framed: { type: Boolean }
  },
  setup(e) {
    const t = e, n = lr(), r = V(null), a = p(() => Z(t.node) ? t.node : null), s = p(() => qt(t.node) ? t.node : null), l = p(() => le(t.node) ? t.node : null), i = p(
      () => s.value ? s.value.children : l.value?.frames.map((q) => q.node) ?? []
    ), o = p(() => s.value ? dt(s.value) : []), c = p(
      () => (l.value?.frames ?? []).map((q, G) => ({
        held: q,
        /** Place in the stack, counted from the back — what `z-index` follows. */
        order: G,
        key: R(q.node),
        path: [...t.path, G]
      })).sort((q, G) => q.key < G.key ? -1 : q.key > G.key ? 1 : 0)
    ), u = p(() => Ft(t.node)), m = p(() => n.spaceMenu(t.path)), $ = p(() => t.node.headless === !0), w = p(() => t.path.length === 0 && !n.rootBar.value), b = p(() => l.value ? "desktop" : s.value?.direction ?? ""), g = V(null), M = V(0);
    let y = null;
    be(
      g,
      (q) => {
        y?.disconnect(), y = null, !(!q || typeof ResizeObserver > "u") && (M.value = q.clientWidth, y = new ResizeObserver(([G]) => {
          M.value = G?.contentRect.width ?? 0;
        }), y.observe(q));
      },
      { immediate: !0 }
    ), Ie(() => y?.disconnect());
    const C = p(() => {
      const q = Math.max(
        1,
        Math.floor((M.value + Lt) / (Br + Lt))
      ), G = /* @__PURE__ */ new Map();
      let se = 0;
      for (const ie of c.value)
        ie.held.minimized === !0 && (G.set(ie.key, {
          x: Lt + se % q * (Br + Lt),
          bottom: Lt + Math.floor(se / q) * (to + Lt)
        }), se += 1);
      return G;
    }), k = (q) => !!q && q.join("/") === t.path.join("/"), x = p(() => {
      const q = n.dropTarget.value, G = l.value;
      if (!G || !q?.rect || q.edge !== "float") return null;
      if (q.space) return k(q.space) ? q.rect : null;
      const se = Oe(G, q.panel);
      return se && G.frames.includes(se) ? q.rect : null;
    }), S = p(() => {
      const q = n.dropTarget.value;
      return !!q && !q.rect && k(q.space);
    }), B = p(() => s.value?.direction === "row"), A = p(() => i.value.map((q, G) => [...t.path, G])), R = (q) => [...Ue(q)].sort().join("/"), P = (q) => {
      const G = Ue(q)[0];
      return (G ? n.panelFor(G)?.title : null) ?? G ?? "panel";
    }, K = (q) => {
      const G = i.value[q], se = i.value[q + 1];
      return !G || !se ? "Resize panels" : `Resize ${P(G)} and ${P(se)}`;
    }, W = (q) => {
      const G = o.value[q] ?? 0, se = o.value[q + 1] ?? 0, ie = G + se;
      return ie > 0 ? Math.round(G / ie * 100) : 50;
    };
    function X() {
      const q = r.value, G = q ? B.value ? q.clientWidth : q.clientHeight : 0;
      return G <= 0 ? 0.05 : Math.min(n.minPanelSize.value / G, 0.4);
    }
    let ge = null;
    function ve(q, G) {
      const se = s.value, ie = r.value;
      if (!n.resizable.value || !se || !ie || q.button !== 0) return;
      const z = B.value ? ie.clientWidth : ie.clientHeight;
      if (z <= 0) return;
      const J = B.value ? q.clientX : q.clientY, fe = dt(se), qe = Math.min(n.minPanelSize.value / z, 0.4);
      q.preventDefault();
      const nt = (Ve) => {
        const Ye = ((B.value ? Ve.clientX : Ve.clientY) - J) / z;
        n.setSizes(t.path, Za(fe, G, Ye, qe));
      }, rt = () => ge?.(), Ge = (Ve) => {
        Ve.key === "Escape" && (n.setSizes(t.path, fe), ge?.());
      };
      ge = () => {
        window.removeEventListener("pointermove", nt), window.removeEventListener("pointerup", rt), window.removeEventListener("pointercancel", rt), window.removeEventListener("keydown", Ge), ge = null;
      }, window.addEventListener("pointermove", nt), window.addEventListener("pointerup", rt), window.addEventListener("pointercancel", rt), window.addEventListener("keydown", Ge);
    }
    Ie(() => ge?.());
    function Ne(q, G) {
      const se = s.value;
      if (!n.resizable.value || !se) return;
      const ie = B.value ? "ArrowRight" : "ArrowDown", z = B.value ? "ArrowLeft" : "ArrowUp", J = q.shiftKey ? 0.1 : 0.02;
      if (q.key !== ie && q.key !== z) return;
      const fe = q.key === ie ? J : -J;
      q.preventDefault(), n.setSizes(t.path, Za(dt(se), G, fe, X()));
    }
    return (q, G) => {
      const se = as("WindowNode", !0);
      return a.value ? (f(), Y(wo, {
        key: 0,
        group: a.value,
        path: e.path
      }, {
        space: Ee(({ node: ie, path: z }) => [
          de(se, {
            node: ie,
            path: z,
            framed: !a.value.headless
          }, null, 8, ["node", "path", "framed"])
        ]),
        _: 1
      }, 8, ["group", "path"])) : (f(), h("section", {
        key: 1,
        class: "dc-space",
        "data-dc-space": b.value,
        "data-dc-path": e.path.join("/"),
        "data-dc-bare": w.value ? "true" : void 0,
        "aria-label": u.value
      }, [
        !e.framed && !$.value && !w.value ? (f(), h("header", lv, [
          E("span", iv, N(u.value), 1),
          m.value.length ? (f(), Y(ia, {
            key: 0,
            items: m.value,
            label: `${u.value} menu`
          }, null, 8, ["items", "label"])) : T("", !0)
        ])) : T("", !0),
        l.value ? (f(), h("div", {
          key: 1,
          ref_key: "desktop",
          ref: g,
          class: "dc-window__desktop"
        }, [
          x.value ? (f(), h("div", {
            key: 0,
            class: "dc-window__drop",
            style: xe({
              left: `${x.value.x}px`,
              top: `${x.value.y}px`,
              width: `${x.value.w}px`,
              height: `${x.value.h}px`
            }),
            "aria-hidden": "true"
          }, null, 4)) : T("", !0),
          (f(!0), h(te, null, he(c.value, (ie) => (f(), Y(zp, {
            key: ie.key,
            frame: ie.held,
            path: ie.path,
            order: ie.order,
            place: C.value.get(ie.key) ?? null
          }, {
            default: Ee(() => [
              de(se, {
                node: ie.held.node,
                path: ie.path,
                framed: ie.held.node.kind !== "group"
              }, null, 8, ["node", "path", "framed"])
            ]),
            _: 2
          }, 1032, ["frame", "path", "order", "place"]))), 128))
        ], 512)) : s.value ? (f(), h("div", {
          key: 2,
          ref_key: "container",
          ref: r,
          class: "dc-window__split",
          "data-dc-direction": s.value.direction
        }, [
          S.value ? (f(), h("div", uv)) : T("", !0),
          (f(!0), h(te, null, he(i.value, (ie, z) => (f(), h(te, {
            key: R(ie)
          }, [
            E("div", {
              class: "dc-window__cell",
              style: xe({ flexGrow: o.value[z] ?? 1 })
            }, [
              de(se, {
                node: ie,
                path: A.value[z] ?? []
              }, null, 8, ["node", "path"])
            ], 4),
            z < i.value.length - 1 ? (f(), h("div", {
              key: 0,
              class: "dc-window__gutter",
              role: "separator",
              "aria-orientation": B.value ? "vertical" : "horizontal",
              "aria-label": K(z),
              "aria-valuenow": W(z),
              "aria-valuemin": "0",
              "aria-valuemax": "100",
              "aria-disabled": L(n).resizable.value ? void 0 : "true",
              tabindex: L(n).resizable.value ? 0 : -1,
              onPointerdown: (J) => ve(J, z),
              onKeydown: (J) => Ne(J, z)
            }, null, 40, dv)) : T("", !0)
          ], 64))), 128))
        ], 8, cv)) : T("", !0)
      ], 8, ov));
    };
  }
}), pv = /* @__PURE__ */ oe(fv, [["__scopeId", "data-v-b394f0e4"]]), vv = ["data-dc-theme", "data-dc-dragging", "data-dc-docking"], hv = {
  key: 1,
  class: "dc-window__empty"
}, mv = {
  class: "dc-window__live",
  "aria-live": "polite",
  role: "status"
}, Mn = 16, gv = /* @__PURE__ */ ae({
  __name: "WindowFrame",
  props: /* @__PURE__ */ Ln({
    panels: {},
    resizable: { type: Boolean, default: !0 },
    minPanelSize: { default: 120 },
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
  emits: /* @__PURE__ */ Ln(["panel-move", "view-change", "panel-activate", "tab-select", "frame-change", "frame-maximize", "frame-minimize", "panel-close", "panel-pop-out"], ["update:layout", "update:views"]),
  setup(e, { expose: t, emit: n }) {
    const r = e, a = n, s = Tn(e, "layout"), l = Tn(e, "views"), i = cn(), o = p(() => new Map(r.panels.map((d) => [d.id, d]))), c = p(() => r.panels.map((d) => d.id)), u = p(() => pp(s.value, m.value)), m = p(() => {
      if (!r.solo || !s.value) return c.value;
      const d = new Set(Ue(s.value)), v = c.value.filter((_) => d.has(_));
      return v.length ? v : c.value;
    }), $ = V(null), w = V(null), b = V(null), g = V(!0), M = V(null), y = V(null), C = V(null), k = V(""), x = V(null);
    function S() {
      const d = x.value;
      return d ? [...d.querySelectorAll(".dc-pane[data-dc-panels]")].filter((_) => _.closest(".dc-window") === d).map((_) => ({ panels: (_.dataset.dcPanels ?? "").split(" "), element: _ })) : [];
    }
    function B(d) {
      const v = [];
      let _ = d.closest(".dc-float");
      for (; _; )
        v.unshift(Number(_.dataset.dcOrder ?? 0)), _ = _.parentElement?.closest(".dc-float") ?? null;
      return v;
    }
    function A() {
      return S().map((d) => ({ pane: d, order: B(d.element) })).sort((d, v) => {
        const _ = Math.max(d.order.length, v.order.length);
        for (let O = 0; O < _; O += 1) {
          const D = (d.order[O] ?? -1) - (v.order[O] ?? -1);
          if (D !== 0) return D;
        }
        return 0;
      }).map((d) => d.pane);
    }
    const R = (d) => S().find((v) => v.panels.includes(d)) ?? null;
    function P(d) {
      const v = o.value.get(d);
      if (!v) return "";
      const _ = l.value[d];
      return _ && v.views?.some((O) => O.key === _) ? _ : v.defaultView ?? v.views?.[0]?.key ?? "";
    }
    function K(d, v) {
      l.value = { ...l.value, [d]: v }, a("view-change", { panel: d, view: v });
    }
    const W = p(
      () => r.panels.filter((d) => d.fixed !== !0).length
    );
    function X(d) {
      return W.value < 1 || r.panels.length < 2 ? !1 : o.value.get(d)?.fixed !== !0;
    }
    function ge(d, v) {
      const _ = u.value;
      !d || !_ || d === _ || (s.value = d, v && a("panel-move", v));
    }
    function ve(d, v, _) {
      if (d.width <= 0 || d.height <= 0) return "center";
      const O = (v - d.left) / d.width, D = (_ - d.top) / d.height, H = 0.3;
      return O > H && O < 1 - H && D > H && D < 1 - H ? "center" : [
        { edge: "left", distance: O },
        { edge: "right", distance: 1 - O },
        { edge: "top", distance: D },
        { edge: "bottom", distance: 1 - D }
      ].reduce(
        (pe, U) => U.distance < pe.distance ? U : pe
      ).edge;
    }
    function Ne(d, v) {
      const _ = [...d.querySelectorAll(".dc-tab")], O = _.findIndex((D) => {
        const H = D.getBoundingClientRect();
        return v < H.left + H.width / 2;
      });
      return O === -1 ? _.length : O;
    }
    function q(d, v, _) {
      for (const { panels: O, element: D } of A().reverse()) {
        const H = D.getBoundingClientRect();
        if (d < H.left || d > H.right || v < H.top || v > H.bottom) continue;
        const me = O.find((ce) => ce !== _), pe = D.querySelector(".dc-pane__tabs"), U = pe?.getBoundingClientRect();
        if (pe && U && v >= U.top && v <= U.bottom)
          return me ? { panel: me, edge: "center", index: Ne(pe, d) } : null;
        const ne = D.querySelector(":scope > .dc-pane__space");
        if (ne) {
          const ce = ne.getBoundingClientRect();
          if (d >= ce.left && d <= ce.right && v >= ce.top && v <= ce.bottom) continue;
        }
        return me ? { panel: me, edge: ve(H, d, v) } : null;
      }
      return se(d, v, _) ?? J(d, v);
    }
    function G() {
      const d = x.value;
      return d ? [...d.querySelectorAll(".dc-window__desktop")].filter((v) => v.closest(".dc-window") === d).reverse() : [];
    }
    function se(d, v, _) {
      const O = u.value;
      if (!O) return null;
      for (const D of G()) {
        const H = D.getBoundingClientRect();
        if (d < H.left || d > H.right || v < H.top || v > H.bottom) continue;
        const me = fe(D), pe = me.flatMap((_e) => _e.panels).find((_e) => _e !== _);
        if (!pe && me.length > 0) return null;
        const U = Oe(O, _)?.rect, ne = _r(
          {
            x: d - H.left - 24,
            y: v - H.top - 12,
            w: U?.w ?? xt.w,
            h: U?.h ?? xt.h
          },
          { w: D.clientWidth, h: D.clientHeight },
          r.minPanelSize
        );
        if (pe) return { panel: pe, edge: "float", rect: ne };
        const ce = ie(D);
        return ce ? { panel: "", space: ce, edge: "float", rect: ne } : null;
      }
      return null;
    }
    function ie(d) {
      const v = d.closest(".dc-space")?.getAttribute("data-dc-path");
      return v == null ? null : v === "" ? [] : v.split("/").map(Number);
    }
    function z() {
      const d = x.value;
      return d ? [...d.querySelectorAll(".dc-space")].filter((v) => v.closest(".dc-window") === d).filter((v) => !v.querySelector(".dc-pane")).reverse().flatMap((v) => {
        const _ = ie(v);
        return _ ? [{ element: v, path: _ }] : [];
      }) : [];
    }
    function J(d, v) {
      for (const { element: _, path: O } of z()) {
        if (_.dataset.dcSpace === "desktop") continue;
        const D = _.getBoundingClientRect();
        if (!(d < D.left || d > D.right || v < D.top || v > D.bottom))
          return { panel: "", space: O, edge: "center" };
      }
      return null;
    }
    function fe(d) {
      return S().filter(
        (v) => v.element.closest(".dc-window__desktop") === d
      );
    }
    let qe = null;
    const nt = (d) => d.altKey;
    function rt(d, v) {
      if (!X(d) || w.value || y.value || v.button !== 0) return;
      const _ = v.clientX, O = v.clientY;
      let D = !1, H = nt(v);
      const me = () => {
        const ke = C.value;
        ke && (b.value = H ? se(ke.x, ke.y, d) : q(ke.x, ke.y, d));
      }, pe = (ke) => {
        if (!D) {
          if (Math.hypot(ke.clientX - _, ke.clientY - O) < 4) return;
          D = !0, w.value = d, M.value = null;
        }
        H = nt(ke), g.value = !H, C.value = { x: ke.clientX, y: ke.clientY }, me();
      }, U = (ke) => {
        nt(ke) !== H && (H = !H, g.value = !H, D && me());
      }, ne = (ke) => {
        qe?.();
        const ue = b.value, Fe = u.value;
        if (ke && D && ue && Fe) {
          const pt = ue.space ? Ya(Fe, d, ue.space, ue.rect) : ue.edge === "float" && ue.rect ? Ga(Fe, d, ue.panel, ue.rect) : xn(Fe, d, ue.panel, ue.edge, ue.index);
          ge(pt, {
            panel: d,
            target: ue.panel,
            edge: ue.edge,
            ...ue.space === void 0 ? {} : { space: ue.space },
            ...ue.index === void 0 ? {} : { index: ue.index },
            ...ue.rect === void 0 ? {} : { rect: ue.rect }
          });
        }
        w.value = null, b.value = null, C.value = null, g.value = !0;
      }, ce = () => ne(!0), _e = () => ne(!1), Me = (ke) => {
        if (ke.key === "Escape") {
          ne(!1);
          return;
        }
        U(ke);
      };
      qe = () => {
        window.removeEventListener("pointermove", pe), window.removeEventListener("pointerup", ce), window.removeEventListener("pointercancel", _e), window.removeEventListener("keydown", Me), window.removeEventListener("keyup", U), qe = null;
      }, window.addEventListener("pointermove", pe), window.addEventListener("pointerup", ce), window.addEventListener("pointercancel", _e), window.addEventListener("keydown", Me), window.addEventListener("keyup", U);
    }
    Ie(() => qe?.());
    let Ge = null;
    function Ve(d) {
      const v = x.value;
      return v ? [...v.querySelectorAll(
        `.dc-float[data-dc-path="${d.join("/")}"]`
      )].find((D) => D.closest(".dc-window") === v)?.parentElement ?? null : null;
    }
    function Ye(d) {
      const v = u.value;
      return v ? Hr(v, d) : null;
    }
    function F(d) {
      const v = u.value;
      if (!v) return;
      const _ = Qt(v, d);
      _ !== v && (s.value = _);
    }
    function j(d) {
      const v = Ye(d);
      v && F(v);
    }
    function re(d) {
      const v = u.value, _ = v ? Oe(v, d) : null;
      return _ !== null && ht(_);
    }
    function I(d) {
      const v = u.value, _ = v ? Oe(v, d) : null;
      return _ !== null && bt(_);
    }
    function Q(d) {
      const v = u.value, _ = v ? kt(v, d) : null;
      return _ ? ze(_.node) : "";
    }
    function ee(d) {
      const v = u.value, _ = v ? kt(v, d) : null;
      if (!v || !_) return;
      const O = ze(_.node);
      if (o.value.get(O)?.fixed === !0) return;
      const D = !bt(_);
      let H = tp(v, d, D);
      H !== v && (D || (H = Qt(H, d)), s.value = H, a("frame-minimize", { panel: O, minimized: D }));
    }
    function Re(d) {
      const v = Ye(d);
      v && ee(v);
    }
    function Be(d) {
      const v = u.value, _ = v ? kt(v, d) : null;
      if (!v || !_) return;
      const O = ze(_.node);
      if (o.value.get(O)?.fixed === !0) return;
      const D = !ht(_);
      let H = ep(v, d, D);
      H !== v && (D && (H = Qt(H, d)), s.value = H, a("frame-maximize", { panel: O, maximized: D }));
    }
    function Vt(d) {
      const v = Ye(d);
      v && Be(v);
    }
    function wa(d, v, _) {
      const O = u.value, D = O ? kt(O, d) : null;
      if (!O || !D || v.button !== 0 || w.value || y.value) return;
      const H = ze(D.node);
      if (o.value.get(H)?.fixed === !0 || ht(D) || bt(D) || _ !== "move" && !r.resizable) return;
      const me = Ve(d), pe = np(O, d);
      F(d);
      const U = { w: me?.clientWidth ?? 0, h: me?.clientHeight ?? 0 }, ne = { ...D.rect }, ce = v.clientX, _e = v.clientY, Me = r.minPanelSize;
      y.value = H;
      const ke = (Ke) => {
        const ct = u.value;
        if (!ct) return;
        const Kt = Ua(ct, pe, _r(Ke, U, Me));
        Kt !== ct && (s.value = Kt);
      }, ue = (Ke) => {
        Ke.preventDefault();
        const ct = Ke.clientX - ce, Kt = Ke.clientY - _e;
        ke(
          _ === "move" ? { ...ne, x: ne.x + ct, y: ne.y + Kt } : ja(ne, _, ct, Kt, Me)
        );
      }, Fe = (Ke) => {
        if (Ge?.(), y.value = null, !Ke) {
          ke(ne);
          return;
        }
        const ct = u.value ? kt(u.value, pe) : null;
        ct && a("frame-change", { panel: Q(pe), rect: ct.rect });
      }, pt = () => Fe(!0), _t = () => Fe(!1), wt = (Ke) => {
        Ke.key === "Escape" && Fe(!1);
      };
      Ge = () => {
        window.removeEventListener("pointermove", ue), window.removeEventListener("pointerup", pt), window.removeEventListener("pointercancel", _t), window.removeEventListener("keydown", wt), Ge = null;
      }, window.addEventListener("pointermove", ue), window.addEventListener("pointerup", pt), window.addEventListener("pointercancel", _t), window.addEventListener("keydown", wt);
    }
    function Mo(d, v, _) {
      const O = Ye(d);
      O && wa(O, v, _);
    }
    function So(d, v, _ = !1) {
      const O = u.value, D = Ye(d), H = O && D ? kt(O, D) : null;
      if (!O || !D || !H || o.value.get(d)?.fixed === !0 || _ && !r.resizable) return;
      if (ht(H) || bt(H)) {
        k.value = `${at(d)} is ${ht(H) ? "maximized" : "minimized"}, so it cannot be moved.`;
        return;
      }
      const me = v === "left" ? -Mn : v === "right" ? Mn : 0, pe = v === "up" ? -Mn : v === "down" ? Mn : 0, U = Ve(D), ne = { w: U?.clientWidth ?? 0, h: U?.clientHeight ?? 0 }, ce = _ ? ja(H.rect, "se", me, pe, r.minPanelSize) : { ...H.rect, x: H.rect.x + me, y: H.rect.y + pe }, _e = Ua(O, D, _r(ce, ne, r.minPanelSize));
      if (_e === O) {
        k.value = _ ? `${at(d)} cannot be resized further.` : `${at(d)} cannot move ${v}.`;
        return;
      }
      s.value = _e;
      const Me = kt(_e, D);
      Me && (a("frame-change", { panel: d, rect: Me.rect }), k.value = _ ? `${at(d)} resized to ${Me.rect.w} by ${Me.rect.h}.` : `${at(d)} moved to ${Me.rect.x}, ${Me.rect.y}.`);
    }
    Ie(() => Ge?.());
    function Co(d, v) {
      const _ = R(d), O = _?.element.getBoundingClientRect();
      if (!_ || !O) return null;
      const D = v === "left" || v === "right", H = (U) => {
        if (!(D ? U.bottom > O.top + 1 && U.top < O.bottom - 1 : U.right > O.left + 1 && U.left < O.right - 1)) return null;
        const ce = v === "left" ? O.left - U.right : v === "right" ? U.left - O.right : v === "up" ? O.top - U.bottom : U.top - O.bottom;
        return ce < -1 ? null : ce;
      }, me = [];
      for (const U of S()) {
        if (U === _ || U.element === _.element) continue;
        const ne = H(U.element.getBoundingClientRect());
        if (ne === null) continue;
        const ce = U.panels.find((_e) => _e !== d);
        ce && me.push({ to: { panel: ce }, distance: ne });
      }
      for (const { element: U, path: ne } of z()) {
        const ce = H(U.getBoundingClientRect());
        ce !== null && me.push({ to: { space: ne }, distance: ce });
      }
      return me.reduce(
        (U, ne) => U && U.distance <= ne.distance ? U : ne,
        null
      )?.to ?? null;
    }
    function Eo(d) {
      const v = u.value ? Oe(u.value, d) !== null : !1;
      if (!v && !X(d)) return;
      M.value = M.value === d ? null : d;
      const _ = at(d);
      if (!M.value) {
        k.value = `${_}: move mode off.`;
        return;
      }
      k.value = v ? `${_}: move mode on. Arrow keys move the window, shift and an arrow resize it, Escape leaves move mode.` : `${_}: move mode on. Arrow keys move the panel, shift and an arrow make it a tab of the panel that way, Escape leaves move mode.`;
    }
    const at = (d) => o.value.get(d)?.title ?? d, Po = {
      left: "left",
      right: "right",
      up: "top",
      down: "bottom"
    };
    function Ao(d, v, _ = !1) {
      if (!X(d)) return;
      const O = u.value;
      if (!O) return;
      const D = at(d), H = Rt(O, d);
      if (!_ && H && (v === "left" || v === "right") && H.panels.length > 1) {
        const _e = H.panels.indexOf(d), Me = v === "left" ? _e - 1 : _e + 1;
        if (Me >= 0 && Me < H.panels.length) {
          ge(Zt(O, d, Me), { panel: d, target: d, edge: "center", index: Me }), k.value = `${D} moved ${v}, now tab ${Me + 1} of ${H.panels.length}.`, cr(d);
          return;
        }
      }
      const pe = Co(d, v);
      if (!pe || pe.panel !== void 0 && !X(pe.panel)) {
        k.value = `${D} cannot move ${v}.`;
        return;
      }
      const U = Po[v];
      if (pe.space) {
        const _e = pe.space, Me = je(O, _e), ke = Oe(O, d)?.rect, ue = { ...xt, ...ke ? { w: ke.w, h: ke.h } : {} };
        ge(Ya(O, d, _e, ue), { panel: d, target: "", space: _e, edge: U }), k.value = `${D} moved ${v}, into ${Me ? Ft(Me) : "the space"}.`, cr(d);
        return;
      }
      const ne = pe.panel, ce = H?.panels.length === 1 && Rt(O, ne)?.panels.length === 1;
      _ ? (ge(xn(O, d, ne, "center"), {
        panel: d,
        target: ne,
        edge: "center"
      }), k.value = `${D} joined ${at(ne)} as a tab.`) : ce ? (ge(En(O, d, ne), { panel: d, target: ne, edge: U }), k.value = `${D} moved ${v}, trading places with ${at(ne)}.`) : (ge(xn(O, d, ne, U), { panel: d, target: ne, edge: U }), k.value = `${D} moved ${v}, beside ${at(ne)}.`), cr(d);
    }
    function cr(d) {
      yt(() => {
        R(d)?.element.querySelector(".dc-pane__grip")?.focus();
      });
    }
    function To(d, v) {
      const _ = u.value;
      _ && (s.value = Pn(_, d, v));
    }
    function ur(d) {
      const v = u.value;
      if (!v) return;
      const _ = It(v, d);
      _ !== v && (s.value = _, a("tab-select", { panel: d }));
    }
    function dr(d) {
      return o.value.get(d)?.closable !== !1;
    }
    function ka(d) {
      dr(d) && a("panel-close", d);
    }
    const fr = V(/* @__PURE__ */ new Map());
    let Lo = 0;
    function Oo(d, v) {
      const _ = Lo += 1;
      return fr.value.set(_, { panel: d, items: v }), () => {
        fr.value.delete(_);
      };
    }
    function Ro(d) {
      const v = [];
      for (const _ of fr.value.values())
        _.panel() === d && v.push(..._.items());
      return v;
    }
    function ba(d) {
      const v = d.filter((_) => _.items.length > 0);
      return v.length < 2 ? v.flatMap((_) => _.items) : v.flatMap((_) => [
        { id: _.id, heading: !0, label: _.title },
        ..._.items
      ]);
    }
    const $a = (d) => d.title || "These tabs";
    function zo(d, v) {
      const _ = v.id, O = Rt(d, _), D = (O?.panels.length ?? 0) > 1, H = O?.fixedView === !0, me = (ce) => ({
        action: () => {
          ce !== d && (s.value = ce);
        }
      }), pe = [], U = [], ne = v.views ?? [];
      if (ne.length > 1 && !H) {
        const ce = P(_);
        pe.push({
          id: "view",
          label: "View",
          items: ne.map((_e) => ({
            id: `view-${_e.key}`,
            label: _e.label,
            checked: _e.key === ce,
            action: () => K(_, _e.key)
          }))
        });
      }
      return D && !H && U.push(
        { id: "show-row", label: "Row", checked: !1, ...me(Xa(d, _, "row")) },
        {
          id: "show-column",
          label: "Column",
          checked: !1,
          ...me(Xa(d, _, "column"))
        },
        // Already true, and nothing to collapse: these panes are tabs. Ticked
        // and choosable all the same — collapsing a strip into a strip hands
        // back the tree it was given, so it is the no-op it looks like.
        {
          id: "show-tabs",
          label: "Tabs",
          checked: !0,
          ...me(op(d, _))
        },
        {
          id: "show-desktop",
          label: "Desktop",
          checked: !1,
          ...me(lp(d, _))
        }
      ), D && O && (U.length && U.push({ separator: !0 }), U.push(...pr(O, _))), { panel: pe, tabs: U, tabsTitle: O ? $a(O) : "" };
    }
    function pr(d, v) {
      const _ = Tt(d), O = (D) => {
        const H = d.panels[(_ + D + d.panels.length) % d.panels.length];
        return (H === void 0 ? "" : ze(H)) || v;
      };
      return [
        { id: "next-tab", label: "Next tab", action: () => ur(O(1)) },
        { id: "previous-tab", label: "Previous tab", action: () => ur(O(-1)) },
        ...Io(d)
      ];
    }
    function Io(d) {
      const v = Ue(d).filter(dr);
      return v.length ? [
        { separator: !0 },
        { id: "close-all", label: "Close all", action: () => v.forEach(ka) }
      ] : [];
    }
    function kn(d) {
      return d.title ? d.title : Z(d) ? d.panels.length > 1 ? "these tabs" : "the strip" : Ft(d);
    }
    function xa(d) {
      if (!d || le(d) || d.fixedView === !0 || !d.title && d.headless !== !0 || tt(d)) return null;
      const v = yo(d);
      return v && v.fixedView !== !0 ? v : null;
    }
    function Ma(d) {
      const v = u.value;
      if (!r.menu || !v) return [];
      const _ = je(v, d);
      if (!_ || Z(_)) return [];
      if (_.fixedView) return [];
      const O = le(_) ? "desktop" : _.direction, D = (ue, Fe, pt) => ({
        id: `show-${ue}`,
        label: Fe,
        checked: O === ue,
        action: () => {
          const _t = u.value, wt = pt();
          !_t || wt === _ || (s.value = qn(Se(lt(_t, d, wt))));
        }
      }), H = () => {
        const ue = fo(_, No(_));
        if (Z(ue) && ue.panels.length === 0) return _;
        const Fe = Z(ue) && ue.panels.length === 1 ? ue.panels[0] : void 0;
        return Fe !== void 0 && $e(Fe) ? _ : ue;
      }, me = (ue) => () => le(_) ? go(_, ue) : _.direction === ue ? _ : { ..._, direction: ue }, pe = d.slice(0, -1), U = d.length > 0 ? je(v, pe) : null, ne = U && Z(U) && U.panels.length > 1 ? U : null, ce = U && xa(U) === _ ? U : null, _e = xa(_), Me = _.title || "this space", ke = (ue, Fe, pt, _t, wt) => ({
        id: ue,
        label: wt,
        action: () => {
          const Ke = u.value;
          Ke && (s.value = qn(Se(lt(Ke, Fe, dp(pt, _t)))));
        }
      });
      return ba([
        {
          id: "about-space",
          /*
           * Its own name, or what it is rather than how it is shown: `spaceTitle`
           * would answer "Row" for an unnamed row, which is the item directly
           * under it and the one already ticked.
           */
          title: _.title || "This space",
          items: [
            D("row", "Row", me("row")),
            D("column", "Column", me("column")),
            // Everything in this space in one strip: the panes as tabs, and a
            // desktop among them as a tab of its own, keeping the windows on it.
            D("tabs", "Tabs", () => H()),
            D("desktop", "Desktop", () => le(_) ? _ : mo(_))
          ]
        },
        {
          id: "about-around",
          title: _e ? `Around ${kn(_e)}` : "",
          items: _e ? [
            // Keeping this space's bar drops the one inside, so it is offered
            // only where the space inside has no name to be dropped with it.
            ..._e.title ? [] : [ke("merge-around-keep-this", d, _, "outer", `Keep ${Me}`)],
            ..._.title ? [] : [ke("merge-around-keep-that", d, _, "inner", `Keep ${kn(_e)}`)]
          ] : []
        },
        {
          id: "about-inside",
          title: ce ? `Inside ${kn(ce)}` : "",
          items: ce ? [
            ..._.title ? [] : [ke("merge-inside-keep-that", pe, ce, "outer", `Keep ${kn(ce)}`)],
            ...ce.title ? [] : [ke("merge-inside-keep-this", pe, ce, "inner", `Keep ${Me}`)]
          ] : []
        },
        {
          id: "about-tabs",
          title: ne ? $a(ne) : "",
          items: ne ? pr(ne, ze(_)) : []
        }
      ]);
    }
    function No(d) {
      const v = $.value;
      return v && ye(d, v) ? v : void 0;
    }
    function Bo(d) {
      const v = u.value, _ = o.value.get(d);
      if (!v || !_) return [];
      const O = r.menu ? zo(v, _) : null, D = Ro(d);
      D.length && O?.panel.length && D.push({ separator: !0 }), O && D.push(...O.panel);
      const H = Ho(_);
      H && (D.length && D.push({ separator: !0 }), D.push(H));
      const me = ba([
        { id: "about-panel", title: _.title, items: D },
        { id: "about-tabs", title: O?.tabsTitle ?? "", items: O?.tabs ?? [] }
      ]);
      return r.paneMenu ? r.paneMenu(_, me) : me;
    }
    const Fo = p(() => {
      const d = u.value;
      return d ? Z(d) ? Do([]) : Ma([]) : [];
    });
    function Do(d) {
      const v = u.value, _ = v ? je(v, d) : null;
      if (!r.menu || !_ || !Z(_) || _.panels.length < 2) return [];
      const O = (H, me, pe) => ({
        id: `show-${H}`,
        label: me,
        checked: H === "tabs",
        action: () => {
          const U = u.value;
          if (!U) return;
          const ne = pe(U);
          ne !== U && (s.value = ne);
        }
      }), D = _.fixedView ? [] : [
        O("row", "Row", (H) => Qa(H, d, "row")),
        O("column", "Column", (H) => Qa(H, d, "column")),
        // Already true: these are tabs, and a strip collapsed is that strip.
        O("tabs", "Tabs", (H) => H),
        O("desktop", "Desktop", (H) => ip(H, d))
      ];
      return D.length && D.push({ separator: !0 }), D.push(...pr(_, ze(_))), D;
    }
    function Ho(d) {
      const v = r.popOut?.(d);
      return !v || r.solo && u.value && Ue(u.value).length <= 1 ? null : {
        id: "pop-out",
        label: "Pop out to new window",
        action: () => {
          const _ = x.value?.querySelector(`.dc-pane[data-dc-panel="${CSS.escape(d.id)}"]`);
          yp(v, gp(_)) && a("panel-pop-out", { panel: d.id, href: v });
        }
      };
    }
    function qo(d, v) {
      return i[`${d}-${v}`] ?? i[d];
    }
    function Sa(d, v, _, O) {
      return qo(d, v.id)?.({ panel: v, view: _, active: O });
    }
    vp({
      panelFor: (d) => o.value.get(d) ?? null,
      viewFor: P,
      setView: K,
      resizable: p(() => r.resizable),
      minPanelSize: p(() => r.minPanelSize),
      spaceNames: p(() => r.spaceNames),
      rootBar: p(() => r.rootBar),
      focused: $,
      dragging: w,
      dropTarget: b,
      moving: M,
      framing: y,
      canMove: X,
      focus(d) {
        $.value !== d && ($.value = d, a("panel-activate", d));
      },
      selectPanel: ur,
      beginDrag: rt,
      toggleMoveMode: Eo,
      nudge: Ao,
      setSizes: To,
      frameOf: (d) => u.value ? Oe(u.value, d) : null,
      beginFrameDrag: Mo,
      nudgeFrame: So,
      raise: j,
      maximized: re,
      toggleMaximize: Vt,
      minimized: I,
      toggleMinimize: Re,
      beginFrameDragAt: wa,
      raiseAt: F,
      toggleMaximizeAt: Be,
      toggleMinimizeAt: ee,
      menuFor: Bo,
      spaceMenu: Ma,
      registerMenu: Oo,
      closable: dr,
      close: ka,
      renderContent: (d, v, _) => Sa("panel", d, v, _),
      renderActions: (d, v, _) => Sa("actions", d, v, _),
      layout: u
    });
    const Vo = p(() => {
      if (!(!r.accent && !r.tokens))
        return { ...r.tokens, ...r.accent ? { "--dc-accent": r.accent } : {} };
    }), Ko = () => {
      const d = w.value, v = C.value;
      return !d || !v ? null : Jo(
        "div",
        {
          class: "dc-window__ghost",
          style: { left: `${v.x}px`, top: `${v.y}px` },
          "aria-hidden": "true"
        },
        o.value.get(d)?.title ?? d
      );
    };
    return t({
      /** The layout as rendered, reconciled against the current panels. */
      layout: u,
      /** Moves a panel programmatically — the same operation a drag performs. */
      move(d, v, _, O) {
        const D = u.value;
        D && ge(xn(D, d, v, _, O), {
          panel: d,
          target: v,
          edge: _,
          ...O === void 0 ? {} : { index: O }
        });
      },
      /** Brings a panel's tab to the top of its group. */
      select(d) {
        const v = u.value;
        v && (s.value = It(v, d));
      },
      /** Lifts a panel onto the float holding `near`, as a window of its own. */
      float(d, v, _) {
        const O = u.value;
        O && ge(Ga(O, d, v, _), {
          panel: d,
          target: v,
          edge: "float",
          rect: _
        });
      },
      /** Puts a floating frame somewhere else, or makes it another size. */
      setRect(d, v) {
        const _ = u.value;
        if (!_) return;
        const O = Qf(_, d, v);
        if (O === _) return;
        s.value = O;
        const D = Oe(O, d);
        D && a("frame-change", { panel: d, rect: D.rect });
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
      rootMenu: Fo,
      /** Brings a floating frame to the front of its stack. */
      raise: j,
      /** Fills the float with a window, or puts it back where it was. */
      toggleMaximize: Vt,
      /** Rolls a window up to its title bar, or unrolls it. */
      toggleMinimize: Re
    }), (d, v) => (f(), h("div", {
      ref_key: "root",
      ref: x,
      class: "dc-shell dc-window",
      "data-dc-theme": e.theme,
      "data-dc-dragging": w.value ? "true" : "false",
      "data-dc-docking": g.value ? "true" : "false",
      style: xe(Vo.value)
    }, [
      u.value ? (f(), Y(pv, {
        key: 0,
        node: u.value,
        path: []
      }, null, 8, ["node"])) : (f(), h("p", hv, " This window has no panels. ")),
      de(Ko),
      E("p", mv, N(k.value), 1)
    ], 12, vv));
  }
}), yv = /* @__PURE__ */ oe(gv, [["__scopeId", "data-v-7884164d"]]);
function dh(e, t) {
  const n = V(!1);
  let r = null, a = !1, s = 0;
  const l = () => {
    s++, n.value = !1, r !== null && (clearTimeout(r), r = null);
  };
  function i(u) {
    r = setTimeout(() => void o(u), t);
  }
  async function o(u) {
    if (a || u !== s) return;
    let m;
    try {
      m = await e();
    } catch {
      m = !1;
    }
    a || u !== s || (m ? i(u) : l());
  }
  const c = () => {
    n.value || (n.value = !0, o(++s));
  };
  return Dt(() => {
    a = !0, l();
  }, !0), { start: c, stop: l, polling: n };
}
function fh(e, t = {}) {
  const n = t.key ?? ((s) => JSON.stringify(s)), r = ft();
  let a = null;
  return el(() => {
    const s = e(), l = n(s);
    l !== a && (a = l, r.value = s);
  }), r;
}
const _v = (e) => Math.round(e * 1e3) / 1e3;
function kr(e, t) {
  return e.title && (t.t = e.title), e.headless && (t.h = !0), e.fixedView && (t.v = !0), t;
}
function wv(e) {
  return [Math.round(e.x), Math.round(e.y), Math.round(e.w), Math.round(e.h)];
}
function br(e) {
  const t = { b: wv(e.rect) };
  return e.title && (t.t = e.title), e.maximized && (t.M = !0), e.minimized && (t.m = !0), t;
}
function kv(e) {
  if (e.kind !== "group" || e.panels.length !== 1) return null;
  const t = e.panels[0];
  return typeof t != "string" || e.title || e.headless || e.fixedView || e.places ? null : t;
}
function Vr(e) {
  const t = kv(e);
  return t !== null ? t : ko(e);
}
function ko(e) {
  if (e.kind === "group") {
    const n = { g: e.panels.map((r) => typeof r == "string" ? r : ko(r)) };
    return e.active !== void 0 && e.active !== e.panels[0] && (n.a = e.active), e.places && (n.p = e.places.map(br)), kr(e, n);
  }
  if (e.kind === "split") {
    const n = { [e.direction === "row" ? "r" : "c"]: e.children.map(Vr) };
    return e.sizes && (n.z = e.sizes.map(_v)), e.places && (n.p = e.places.map(br)), kr(e, n);
  }
  const t = {
    f: e.frames.map((n) => ({ n: Vr(n.node), ...br(n) }))
  };
  return kr(e, t);
}
class bo extends Error {
}
const Le = () => {
  throw new bo();
}, Kr = (e) => typeof e == "object" && e !== null && !Array.isArray(e), Ot = (e) => Array.isArray(e) ? e : Le(), ya = (e) => e === void 0 ? void 0 : typeof e == "string" ? e : Le(), $o = (e) => Ot(e).map((t) => typeof t == "number" && Number.isFinite(t) ? t : Le());
function bv(e) {
  const [t, n, r, a] = $o(e);
  return a === void 0 && Le(), { x: t, y: n, w: r, h: a };
}
function $r(e) {
  if (!Kr(e)) return Le();
  const t = { rect: bv(e.b) }, n = ya(e.t);
  return n && (t.title = n), e.M === !0 && (t.maximized = !0), e.m === !0 && (t.minimized = !0), t;
}
function xr(e, t) {
  const n = ya(e.t);
  return n && (t.title = n), e.h === !0 && (t.headless = !0), e.v === !0 && (t.fixedView = !0), t;
}
function An(e) {
  if (typeof e == "string") return { kind: "group", panels: [e] };
  if (!Kr(e)) return Le();
  if (e.g !== void 0) {
    const n = Ot(e.g).map((s) => typeof s == "string" ? s : An(s));
    n.length === 0 && Le();
    const r = { kind: "group", panels: n }, a = ya(e.a);
    return a !== void 0 && (r.active = a), e.p !== void 0 && (r.places = Ot(e.p).map($r)), xr(e, r);
  }
  const t = e.r !== void 0 ? "row" : e.c !== void 0 ? "column" : null;
  if (t) {
    const n = Ot(t === "row" ? e.r : e.c).map(An), r = { kind: "split", direction: t, children: n };
    return e.z !== void 0 && (r.sizes = $o(e.z)), e.p !== void 0 && (r.places = Ot(e.p).map($r)), xr(e, r);
  }
  if (e.f !== void 0) {
    const r = { kind: "float", frames: Ot(e.f).map((a) => !Kr(a) || a.n === void 0 ? Le() : { node: An(a.n), ...$r(a) }) };
    return xr(e, r);
  }
  return Le();
}
const xo = /[ '!:(),*@$]/, $v = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][-+]?\d+)?$/;
function es(e) {
  return e !== "" && !xo.test(e) && !/^[-\d]/.test(e) ? e : `'${e.replace(/[!']/g, (n) => `!${n}`)}'`;
}
function Wr(e) {
  return e === null ? "!n" : e === !0 ? "!t" : e === !1 ? "!f" : typeof e == "number" ? Number.isFinite(e) ? String(e) : "!n" : typeof e == "string" ? es(e) : Array.isArray(e) ? `!(${e.map(Wr).join(",")})` : `(${Object.entries(e).map(([t, n]) => `${es(t)}:${Wr(n)}`).join(",")})`;
}
function xv(e) {
  let t = 0;
  const n = () => e[t], r = (i) => e[t++] === i ? void 0 : Le(), a = () => {
    if (n() === "'") {
      t++;
      let o = "";
      for (; ; ) {
        const c = e[t++];
        if (c === void 0) return Le();
        if (c === "'") return o;
        if (c === "!") {
          const u = e[t++];
          u !== "!" && u !== "'" && Le(), o += u;
        } else o += c;
      }
    }
    const i = t;
    for (; t < e.length && !xo.test(e[t]); ) t++;
    return t === i && Le(), e.slice(i, t);
  }, s = () => {
    const i = n();
    if (i === "(") {
      t++;
      const c = {};
      if (n() === ")")
        return t++, c;
      for (; ; ) {
        const u = a();
        r(":"), c[u] = s();
        const m = e[t++];
        if (m === ")") return c;
        m !== "," && Le();
      }
    }
    if (i === "!") {
      t++;
      const c = e[t++];
      if (c === "t") return !0;
      if (c === "f") return !1;
      if (c === "n") return null;
      if (c !== "(") return Le();
      const u = [];
      if (n() === ")")
        return t++, u;
      for (; ; ) {
        u.push(s());
        const m = e[t++];
        if (m === ")") return u;
        m !== "," && Le();
      }
    }
    if (i === "'") return a();
    const o = a();
    return $v.test(o) ? Number(o) : o;
  }, l = s();
  return t !== e.length && Le(), l;
}
function Mr(e) {
  return Wr(Vr(e));
}
function Mv(e) {
  try {
    return An(xv(e));
  } catch (t) {
    if (t instanceof bo) return null;
    throw t;
  }
}
function Sr(e, t) {
  for (const n of e.replace(/^[?]/, "").split("&")) {
    const r = n.indexOf("="), a = r === -1 ? n : n.slice(0, r);
    if (_a(a) === t) return r === -1 ? "" : n.slice(r + 1);
  }
  return null;
}
function Cr(e, t, n) {
  const r = e.replace(/^[?]/, "").split("&").filter(Boolean), a = r.findIndex((l) => {
    const i = l.indexOf("=");
    return _a(i === -1 ? l : l.slice(0, i)) === t;
  }), s = n === null ? null : `${encodeURIComponent(t)}=${n}`;
  return a === -1 ? s && r.push(s) : s ? r[a] = s : r.splice(a, 1), r.length ? `?${r.join("&")}` : "";
}
function _a(e) {
  try {
    return decodeURIComponent(e.replace(/\+/g, " "));
  } catch {
    return e;
  }
}
const Sv = [
  [/%2C/g, ","],
  [/%3A/g, ":"],
  [/%2F/g, "/"],
  [/%40/g, "@"],
  [/%24/g, "$"],
  [/%20/g, "+"]
], ts = (e) => {
  let t = encodeURIComponent(e);
  for (const [n, r] of Sv) t = t.replace(n, r);
  return t;
};
function ph(e, t) {
  const { adapter: n } = t, r = t.param ?? "w", a = t.soloParam ?? "solo", s = t.delay ?? 200, l = () => ut(t.home) ?? null;
  let i = Sr(n.search.value, r), o = null;
  const c = () => {
    o !== null && clearTimeout(o), o = null;
  }, u = (b) => b === null ? l() : Mv(_a(b)) ?? l(), m = () => {
    c();
    const b = e.value, g = l(), M = b ? Mr(b) : null, y = M === null || g && M === Mr(g) ? null : ts(M);
    i = y;
    const C = Cr(n.search.value, r, y);
    C !== n.search.value && n.replace(C);
  }, $ = u(i);
  return $ && (e.value = $), be(e, () => {
    c(), o = setTimeout(m, s);
  }), be(n.search, (b) => {
    const g = Sr(b, r);
    if (g === i) return;
    c(), i = g;
    const M = u(g);
    M && (e.value = M);
  }), Vn() && Dt(() => o !== null ? m() : void 0), {
    flush: () => o !== null ? m() : void 0,
    popOutHref: (b) => {
      let g = Cr(n.search.value, r, ts(Mr(Gf(Ze(b)))));
      return g = Cr(g, a, "1"), n.href ? n.href(g) : `${n.path.value}${g}`;
    },
    solo: p(() => Sr(n.search.value, a) !== null)
  };
}
function vh(e = {}) {
  return { key: "ordinal", kind: "ordinal", label: "#", width: "52px", ...e };
}
function hh(e = {}) {
  return { key: "status", role: "state", kind: "status", label: "State", width: "104px", ...e };
}
function mh(e = {}) {
  return { key: "tint", role: "tint", ...e };
}
function gh(e = {}) {
  return { key: "picture", role: "image", kind: "image", width: "56px", height: "40px", ...e };
}
function yh(e, t = {}) {
  return {
    key: "primary",
    role: "identity",
    label: e,
    sort: "name",
    activate: !0,
    truncate: !0,
    ...t
  };
}
function _h(e, t = {}) {
  return {
    key: "secondary",
    role: "reference",
    label: e,
    mono: !0,
    muted: !0,
    truncate: !0,
    ...t
  };
}
function wh(e, t, n = {}) {
  return {
    key: e,
    role: "metric",
    kind: "number",
    label: t,
    sort: e,
    width: "92px",
    hideBelow: 760,
    ...n
  };
}
function kh(e, t, n = {}) {
  return { key: e, kind: "date", label: t, sort: e, width: "104px", mono: !0, muted: !0, ...n };
}
function bh(e = {}) {
  return {
    key: "entityLabel",
    label: "Entity",
    width: "130px",
    mono: !0,
    truncate: !0,
    class: "dc-table__entity",
    ...e
  };
}
function $h(e, t, n = {}) {
  return { key: e, label: t, truncate: !0, hideBelow: 900, ...n };
}
function xh(e, t, n, r = {}) {
  return {
    key: e,
    label: t,
    value: (a) => Object.entries(n).filter(([s]) => a.fields[s] === !0).map(([, s]) => s),
    muted: !0,
    truncate: !0,
    hideBelow: 1100,
    ...r
  };
}
function ir(e) {
  return typeof e == "number" ? e : typeof e == "string" && e.trim() !== "" ? Number(e) : Number.NaN;
}
function Mh(e) {
  const t = ir(e);
  return Number.isFinite(t) && t > 0 ? ol(t) : it;
}
function Sh(e) {
  const t = ir(e);
  return Number.isFinite(t) && t > 0 ? ll(t) : it;
}
function Ch(e) {
  const t = ir(e);
  return Number.isFinite(t) && t > 0 ? il(t) : it;
}
function Eh(e) {
  const t = ir(e);
  return Number.isFinite(t) ? cl(t) : it;
}
function Cv(e) {
  if (e <= 0) return 0;
  const t = 10 ** Math.floor(Math.log10(e));
  for (const n of [1, 2, 5])
    if (e <= n * t) return n * t;
  return 10 * t;
}
function Ev(e, t) {
  const n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const a = r.fields[t];
    for (const s of Array.isArray(a) ? a : [a])
      typeof s == "string" && s && n.add(s);
  }
  return [...n].sort((r, a) => r.localeCompare(a));
}
function Pv(e, t) {
  let n = 0;
  for (const r of e) {
    const a = r.fields[t];
    typeof a == "number" && a > n && (n = a);
  }
  return n;
}
function Ph(e, t, n, r = {}) {
  return {
    kind: "chips",
    key: t,
    label: n,
    options: Ev(e, t),
    ...r.multiple ? { multiple: !0 } : {}
  };
}
function Ah(e, t, n) {
  return { kind: "range", key: t, label: n, min: 0, max: Cv(Pv(e, t)) };
}
function Th(e, t, n) {
  return { kind: "toggle", key: e, label: t, text: n };
}
function Lh(e) {
  return e.filter((t) => t.kind === "chips" ? t.options.length > 1 : t.kind === "range" ? t.max > 0 : !0);
}
function Oh(e = "", t = "/") {
  const n = V(De(e)), r = V(t), a = [`${r.value}${n.value}`];
  return {
    search: n,
    path: r,
    history: a,
    href(s, l) {
      return `${l ?? r.value}${De(s)}`;
    },
    push(s, l) {
      l !== void 0 && (r.value = l), n.value = De(s), a.push(`${r.value}${n.value}`);
    },
    replace(s, l) {
      l !== void 0 && (r.value = l), n.value = De(s), a[a.length - 1] = `${r.value}${n.value}`;
    }
  };
}
function ns(e) {
  const t = e.indexOf("?");
  if (t === -1) return "";
  const n = e.slice(t), r = n.indexOf("#");
  return De(r === -1 ? n : n.slice(0, r));
}
function Rh(e) {
  const t = V(ns(e.currentRoute.value.fullPath)), n = p(() => e.currentRoute.value.path), r = be(
    () => e.currentRoute.value.fullPath,
    (a) => {
      t.value = ns(a);
    }
  );
  return {
    search: t,
    path: n,
    push: (a, s) => e.push(`${s ?? n.value}${De(a)}`),
    replace: (a, s) => e.replace(`${s ?? n.value}${De(a)}`),
    href: (a, s) => {
      const l = `${s ?? n.value}${De(a)}`;
      return e.resolve?.(l).href ?? l;
    },
    dispose: r
  };
}
function zh(e, t, n = "/") {
  return (r) => {
    const a = r.params[t], s = Array.isArray(a) ? a.join("/") : a ?? "", l = r.query[Ct], i = typeof l == "string" ? l : "", o = `${e}="${s.replace(/"/g, "")}"`;
    return { path: n, query: { ...r.query, [Ct]: fn(i, o) } };
  };
}
function Ih(e, t = "/") {
  return (n) => ({ path: t, query: { ...n.query, [Ht]: e } });
}
function Nh(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const r = t.get(n.entityKey);
    r ? r.push(n) : t.set(n.entityKey, [n]);
  }
  return {
    query(n) {
      return ws(n, (r) => t.get(r.key) ?? [], {
        undatedLast: !0,
        zeroIsAll: !0
      });
    }
  };
}
function Bh(e, t) {
  return e.query({ ...t, limit: Number.MAX_SAFE_INTEGER, offset: 0 }).rows;
}
const Av = {
  DataShell: Hd,
  ShellHeader: Fs,
  RecordActions: Hs,
  ResultsArea: Qs,
  SegmentedControl: rf,
  StatusPill: pn,
  WindowFrame: yv,
  WindowPane: wo,
  ListView: Nr,
  CardsView: Ks,
  GridView: Ws,
  ImagesView: js,
  TableView: Ys,
  LinksView: Us,
  PreviewView: Gs,
  TypeCardsView: Xs
}, Fh = {
  install(e, t = {}) {
    const n = t.prefix ?? "";
    for (const [r, a] of Object.entries(Av))
      e.component(`${n}${r}`, a);
    t.route && e.provide(ss, t.route), (t.theme || t.accent || t.tokens) && oi({ theme: t.theme, accent: t.accent, tokens: t.tokens }, e);
  }
};
export {
  Hn as CASCADE_STEP,
  zv as COLUMN_BREAKPOINTS,
  Rv as COLUMN_ROLES,
  Ks as CardsView,
  Va as ColumnCell,
  Mf as CopyButton,
  fl as DEFAULT_ENTITY_VIEW,
  xt as DEFAULT_FRAME,
  Pr as DEFAULT_SORT,
  dl as DEFAULT_VIEW,
  gi as DRAFT_DELAY,
  Hd as DataShell,
  it as EMPTY_CELL,
  bs as ENTITY_ALL,
  Dn as ENTITY_TERM,
  sn as EXPRESSION_TERM,
  Ws as GridView,
  Fh as HeaderContentLayoutPlugin,
  js as ImagesView,
  Us as LinksView,
  Nr as ListView,
  Lt as MINIMIZED_GAP,
  to as MINIMIZED_HEIGHT,
  Br as MINIMIZED_WIDTH,
  eo as MIN_FRAME,
  zn as MOCK_TINTS,
  Uv as MenuBar,
  ia as MenuButton,
  sa as MenuList,
  vn as MetricDrill,
  hn as OpenMark,
  ga as PANE_CONTEXT_KEY,
  ea as PARAM_DIR,
  Ht as PARAM_ENTITY,
  Ct as PARAM_EXPR,
  Qn as PARAM_PAGE,
  Jr as PARAM_SORT,
  Xn as PARAM_VIEW,
  Ov as PILL_TONES,
  Vf as POPOVER_FLIP_BELOW,
  Hf as POPOVER_GAP,
  qf as POPOVER_MARGIN,
  oa as PinStar,
  Gs as PreviewView,
  la as QueryMark,
  Ut as RECORD_STATUSES,
  Xr as RESULT_FIELDS,
  ss as ROUTE_ADAPTER_KEY,
  Hs as RecordActions,
  Qs as ResultsArea,
  Ls as SHELL_CONTEXT_KEY,
  Lv as SHELL_THEMES,
  Fn as SHELL_THEME_KEY,
  mn as ScopeMark,
  rf as SegmentedControl,
  At as SelectTick,
  jv as ShellCard,
  Xv as ShellCode,
  Zv as ShellDialog,
  vf as ShellFact,
  Gv as ShellFacts,
  Fs as ShellHeader,
  Qv as ShellLog,
  eh as ShellPopover,
  Jv as ShellToasts,
  Ir as StandingControl,
  Yv as StatusCounts,
  pn as StatusPill,
  zf as TOAST_ERROR_MS,
  Rf as TOAST_MS,
  Ys as TableView,
  Xs as TypeCardsView,
  os as VIEW_KINDS,
  pl as VIEW_LABELS,
  ma as WINDOW_CONTEXT_KEY,
  yv as WindowFrame,
  wo as WindowPane,
  ro as activePanel,
  Tt as activeTab,
  fn as addTerm,
  Zr as andExpression,
  Yf as axisOf,
  Mh as bytesCell,
  sr as cascade,
  ds as cellFull,
  Bt as cellText,
  Sn as cellTextOf,
  He as cellValue,
  vr as changesResults,
  Ph as chipsFrom,
  _r as clampRect,
  fo as collapseSpace,
  op as collapseToTabs,
  nh as column,
  Aa as columnAlign,
  Ta as columnClass,
  Pa as columnKey,
  dn as columnShortcut,
  ms as columnShortcutOf,
  Tr as columnTruncates,
  yl as columnsFor,
  ps as compactShortcuts,
  gl as countPages,
  tl as createHistoryAdapter,
  Oh as createMemoryAdapter,
  Nh as createMemoryDataSource,
  Yl as createMockDataSource,
  Rh as createVueRouterAdapter,
  kh as dateColumn,
  Mv as decodeLayout,
  kl as defaultCellText,
  Ja as defaultLayout,
  Yr as defaultQuery,
  tn as defaultViewFor,
  nl as detachableAdapter,
  gr as drillExpression,
  Ya as dropIntoSpace,
  Sh as durationCell,
  Ch as elapsedCell,
  hl as emptyFacetValue,
  Mr as encodeLayout,
  Jl as entityAddress,
  bh as entityColumn,
  Ar as entityCount,
  Ih as entityRedirect,
  Ss as excludingTerm,
  an as expandShortcuts,
  $h as facetColumn,
  Os as facetField,
  Is as facetValue,
  Al as fieldHeading,
  Ms as fieldTerm,
  nn as findEntity,
  $s as findEntityByAddress,
  mt as findSort,
  rh as fixedView,
  xh as flagColumn,
  ca as float,
  Ga as floatPanel,
  mo as floatSplit,
  lp as floatTabs,
  ip as floatTabsAt,
  Yt as fnv1a,
  is as focusEntity,
  ol as formatBytes,
  Rn as formatCount,
  al as formatDate,
  Iv as formatDateTime,
  ll as formatDuration,
  il as formatElapsed,
  ot as formatExpression,
  Wt as formatInteger,
  rl as formatMetric,
  sl as formatOrdinal,
  cl as formatPercent,
  Sl as formatRange,
  $t as formatTerm,
  ar as frame,
  kt as frameAt,
  Oe as frameOf,
  Hr as framePathOf,
  ze as frontPanel,
  Gl as generateRows,
  th as group,
  Rt as groupOf,
  Xf as groups,
  di as hasActiveFacets,
  ye as hasPanel,
  Gf as headless,
  yh as identityColumn,
  Vv as idsExpression,
  Gt as insertPanel,
  Xt as isChoosable,
  Nv as isEntityScoped,
  ml as isFacetActive,
  le as isFloat,
  Z as isGroup,
  ht as isMaximized,
  bt as isMinimized,
  $e as isPanelTab,
  Ur as isPristineQuery,
  rn as isRangeTerm,
  qt as isSplit,
  We as isTabOf,
  Gr as isTypeCardsQuery,
  ls as isViewKind,
  Fv as joinExpression,
  Cs as liftTerm,
  Rl as matchesExpression,
  Zf as maximizeFrame,
  ep as maximizeFrameAt,
  dp as mergeSpace,
  wh as metricColumn,
  Jf as minimizeFrame,
  tp as minimizeFrameAt,
  xn as movePanel,
  Zt as moveTab,
  Kv as narrowPatch,
  zl as negateTerm,
  Cv as niceMax,
  je as nodeAt,
  Jt as nodeTitle,
  Se as normalizeLayout,
  De as normalizeSearch,
  va as normalizeSizes,
  yo as onlySpace,
  yp as openPopOut,
  Nl as oppositeTerm,
  vh as ordinalColumn,
  Ue as panelIds,
  Ze as panelNode,
  Wa as panelTabs,
  Te as parseExpression,
  ni as parseQuery,
  Eh as percentCell,
  gh as pictureColumn,
  Kf as placePopover,
  gp as popOutRect,
  kc as presentParts,
  qs as presentRow,
  tr as pressOptions,
  _o as providePaneContext,
  ai as provideShellContext,
  oi as provideShellTheme,
  vp as provideWindowContext,
  Bh as queryAll,
  wr as raiseFrame,
  Qt as raiseFrameAt,
  np as raisedPath,
  Ah as rangeFrom,
  Gn as rangeOf,
  Dl as readDraft,
  qv as readExpression,
  pp as reconcileLayout,
  zh as recordRedirect,
  xs as recordTerm,
  ri as recordsIn,
  _h as referenceColumn,
  Or as refineExpression,
  Mt as removePanel,
  lt as replaceAt,
  ja as resizeRect,
  Za as resizeSplit,
  jr as resolveView,
  Xe as roleColumn,
  us as roleColumns,
  qn as rootSpace,
  da as row,
  wl as rowKey,
  Lr as sameTerm,
  Jn as scopeTerm,
  Bn as scopeTermFor,
  As as scopedEntity,
  Hv as searchFromQuery,
  mr as serializeQuery,
  It as setActivePanel,
  Qf as setFrameRect,
  Ua as setFrameRectAt,
  Pn as setSizesAt,
  oh as setSplitDirection,
  dt as sizesOf,
  ei as sortAddress,
  Un as sortsFor,
  Pe as spaceChrome,
  Ft as spaceTitle,
  ua as split,
  Bv as splitExpression,
  Xa as spreadTabs,
  Qa as spreadTabsAt,
  hh as stateColumn,
  ul as stripAnsi,
  vi as summarizeQuery,
  aa as summaryTerms,
  En as swapPanels,
  rr as tabNode,
  yn as tabPanels,
  na as termStanding,
  go as tileFloat,
  mh as tintColumn,
  Dv as tintFor,
  lh as toFloat,
  ih as toTiled,
  Th as toggleFacet,
  ah as toggleMaximized,
  sh as toggleMinimized,
  Ku as useColumns,
  yi as useDraft,
  Vi as useEntityCounts,
  id as useEntityPreviews,
  ra as useLayerTheme,
  ph as useLayoutRoute,
  ch as usePaneContext,
  uh as usePaneMenu,
  dh as usePoll,
  Pt as usePresentedRows,
  hi as useQueryState,
  ki as useRecordNames,
  mi as useResults,
  Ce as useShellContext,
  fh as useStableSchema,
  Nf as useToasts,
  lr as useWindowContext,
  Lh as usefulFacets,
  Ea as viewAcross,
  Ns as withFacetValue,
  Rr as withStanding,
  Wv as withoutFacet,
  Ps as withoutOwnScope,
  Il as withoutTerm
};
