/// <reference path="../content/base.d.ts" />
interface ElementWithClickable { vimiumClick?: boolean }
type kMouseMoveEvents = "mouseover" | "mouseenter" | "mousemove" | "mouseout" | "mouseleave";
type kMouseClickEvents = "mousedown" | "mouseup" | "click" | "auxclick" | "dblclick";
/* eslint-disable no-var, @typescript-eslint/no-unused-vars */
if (Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinEnsuredES6WeakMapAndWeakSet) {
  var WeakSet: WeakSetConstructor | undefined;
  var WeakMap: WeakMapConstructor | undefined;
}
if (Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinES6$ForOf$Map$SetAnd$Symbol) {
  var Set: SetConstructor | undefined;
}
if (Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinEnsured$InputDeviceCapabilities) {
  var InputDeviceCapabilities: InputDeviceCapabilitiesVar | undefined;
}
if (Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinEnsured$requestIdleCallback) {
  // it's not needed to declare it on Edge: only be used in extend_click[Chrome] and injector
  var requestIdleCallback: RequestIdleCallback | undefined;
}
interface VisualViewport { width?: number; height: number; offsetLeft: number; offsetTop: number;
    pageLeft: number; pageTop: number; scale: number; }
if (Build.BTypes & ~BrowserType.Chrome || Build.MinCVer < BrowserVer.MinEnsured$visualViewport$) {
  var visualViewport: VisualViewport | undefined;
}
declare var VOther: BrowserType;

var VDom = {
/* eslint-enable no-var, @typescript-eslint/no-unused-vars */

  /** data and DOM-shortcut section (sorted by reference numbers) */

  cache_: null as never as OnlyEnsureItemsNonNull<SettingsNS.FrontendSettingCache>,
  clickable_: null as never as { add (value: Element): object | void | number; has (value: Element): boolean },
  readyState_: "" as never as Document["readyState"],
  unsafeFramesetTag_: (Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinFramesetHasNoNamedGetter
      ? "" : 0 as never) as "frameset" | "",
  // note: scripts always means allowing timers - vPort.ClearPort requires this assumption
  allowScripts_: 1 as 0 | 1 | 2,
  jsRe_: <RegExpI & RegExpOne> /^javascript:/i,
  allowRAF_: 1 as BOOL,
  docSelectable_: true,
  devRatio_: (): number => devicePixelRatio,
  getComputedStyle_: (element: Element): CSSStyleDeclaration => getComputedStyle(element),
  getSelected_: (): Selection => getSelection(),
  /** @UNSAFE_RETURNED */
  docEl_unsafe_: (): Element | null => document.documentElement,
  /** @UNSAFE_RETURNED */
  activeEl_unsafe_: (): Element | null => document.activeElement,
  /** @UNSAFE_RETURNED */
  querySelector_unsafe_: (selector: string): Element | null => document.querySelector(selector),
  /** @UNSAFE_RETURNED */
  querySelectorAll_unsafe_: function (selector: string): NodeListOf<Element> | void {
    try { return document.querySelectorAll(selector); } catch {}
  } as <T extends BOOL = 0>(selector: string) => NodeListOf<Element> | (T extends 1 ? undefined : never),

  /** DOM-compatibility section */

  isHTML_: Build.BTypes & ~BrowserType.Firefox
      ? (): boolean => "lang" in <ElementToHTML> (VDom.docEl_unsafe_() || {})
      : (): boolean => document instanceof HTMLDocument,
  htmlTag_: (Build.BTypes & ~BrowserType.Firefox ? function (element: Element | HTMLElement): string {
    let s: Element["localName"];
    if ("lang" in element && typeof (s = element.localName) === "string") {
      return (Build.MinCVer >= BrowserVer.MinFramesetHasNoNamedGetter || !(Build.BTypes & BrowserType.Chrome)
          ? s === "form" : s === "form" || s === VDom.unsafeFramesetTag_) ? "" : s;
    }
    return "";
  } : (element: Element): string => "lang" in element ? (element as SafeHTMLElement).localName as string : ""
  ) as (element: Element) => string, // duplicate the signature, for easier F12 in VS Code
  isInTouchMode_: Build.BTypes & BrowserType.Chrome ? function (): boolean {
    const viewport = VDom.querySelector_unsafe_("meta[name=viewport]");
    return !!viewport &&
      (<RegExpI> /\b(device-width|initial-scale)\b/i).test(
          (viewport as HTMLMetaElement).content as string | undefined as /* safe even if undefined */ string);
  } : 0 as never,
  /** refer to {@link #BrowserVer.MinParentNodeInNodePrototype } */
  Getter_: Build.BTypes & ~BrowserType.Firefox ? function <Ty extends Node, Key extends keyof Ty
            , ensured extends boolean = false>(this: void
      , Cls: { prototype: Ty; new (): Ty }, instance: Ty
      , property: Key & (Ty extends Element ? "shadowRoot" | "assignedSlot" : "childNodes" | "parentNode")
      ): Exclude<NonNullable<Ty[Key]>, Window | RadioNodeList | HTMLCollection
            | (Key extends "parentNode" ? never : Element)>
          | (ensured extends true ? never : null) {
    const desc = Object.getOwnPropertyDescriptor(Cls.prototype, property);
    return desc && desc.get ? desc.get.call(instance) : null;
  } : 0 as never,
  notSafe_: (Build.BTypes & ~BrowserType.Firefox ? function (el: Element | null): el is HTMLFormElement {
    let s: Element["localName"];
    return !!el && (typeof (s = el.localName) !== "string" ||
      (Build.MinCVer >= BrowserVer.MinFramesetHasNoNamedGetter || !(Build.BTypes & BrowserType.Chrome)
        ? s === "form" : s === "form" || s === VDom.unsafeFramesetTag_)
    );
  } : 0 as never) as (el: Element | null) => el is HTMLFormElement,
  /** @safe_even_if_any_overridden_property */
  SafeEl_: (Build.BTypes & ~BrowserType.Firefox ? function (
      this: void, el: Element | null, type?: PNType.DirectElement | undefined): Node | null {
    return VDom.notSafe_(el)
      ? VDom.SafeEl_(VDom.GetParent_(el, type || PNType.RevealSlotAndGotoParent), type) : el;
  } : 0 as never) as {
    (this: void, el: SafeElement | null, type?: any): unknown;
    (this: void, el: Element | null, type?: PNType.DirectElement): SafeElement | null;
  },
  GetShadowRoot_ (el: Element): ShadowRoot | null {
    // check type of el to avoid exceptions
    if (!(Build.BTypes & ~BrowserType.Firefox)) {
      return Build.MinFFVer >= FirefoxBrowserVer.MinEnsuredShadowDOMV1 ? el.shadowRoot as ShadowRoot | null
        : <ShadowRoot | null | undefined> el.shadowRoot || null;
    }
    // Note: .webkitShadowRoot and .shadowRoot share a same object
    const sr = Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinEnsuredUnprefixedShadowDOMV0
        && VDom.cache_.v < BrowserVer.MinEnsuredUnprefixedShadowDOMV0 ? el.webkitShadowRoot : el.shadowRoot;
    // according to https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow,
    // <form> and <frameset> can not have shadowRoot
    return (!(Build.BTypes & BrowserType.Chrome) || Build.MinCVer >= BrowserVer.MinShadowDOMV0)
        && (!(Build.BTypes & BrowserType.Firefox) || Build.MinFFVer >= FirefoxBrowserVer.MinEnsuredShadowDOMV1)
        && !(Build.BTypes & ~BrowserType.ChromeOrFirefox)
      ? sr && VDom.notSafe_(el) ? null : sr as Exclude<typeof sr, undefined | Element | RadioNodeList | Window>
      : sr && !VDom.notSafe_(el) && <Exclude<typeof sr, Element | RadioNodeList | Window>> sr || null;
  },
  /**
   * Try its best to find a real parent
   * @safe_even_if_any_overridden_property
   * @UNSAFE_RETURNED
   */
  GetParent_: function (this: void, el: Node | Element
      , type: PNType.DirectNode | PNType.DirectElement | PNType.RevealSlot | PNType.RevealSlotAndGotoParent
      ): Node | null {
    /**
     * Known info about Chrome:
     * * a selection / range can only know nodes and text in a same tree scope
     */
    const a = Build.BTypes & ~BrowserType.Firefox ? VDom : 0 as never,
    kPN = "parentNode";
    if (type >= PNType.RevealSlot && Build.BTypes & ~BrowserType.Edge) {
      const ElementCls = Build.MinCVer < BrowserVer.MinNoShadowDOMv0 && Build.BTypes & BrowserType.Chrome
          ? Element : 0 as never;
      if (Build.MinCVer < BrowserVer.MinNoShadowDOMv0 && Build.BTypes & BrowserType.Chrome) {
        const func = ElementCls.prototype.getDestinationInsertionPoints,
        arr = func ? func.call(el) : [], len = arr.length;
        len > 0 && (el = arr[len - 1]);
      }
      let slot = (el as Element).assignedSlot;
      Build.BTypes & ~BrowserType.Firefox && slot && a.notSafe_(el as Element) &&
      (slot = a.Getter_(Build.MinCVer < BrowserVer.MinNoShadowDOMv0 && Build.BTypes & BrowserType.Chrome
          ? ElementCls : Element, el as HTMLFormElement, "assignedSlot"));
      if (slot) {
        if (type === PNType.RevealSlot) { return slot; }
        while (slot = slot.assignedSlot) { el = slot; }
      }
    }
    type ParentNodeProp = Node["parentNode"]; type ParentElement = Node["parentElement"];
    let pe = el.parentElement as Exclude<ParentElement, Window>
      , pn = el.parentNode as Exclude<ParentNodeProp, Window>;
    if (pe === pn /* normal pe or no parent */ || !pn /* indeed no par */) { return pn as Element | null; }
    if (Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinFramesetHasNoNamedGetter
        && pe && a.unsafeFramesetTag_) { // may be [a <frameset> with pn or pe overridden], or a <form>
      const action = +((pn as ParentNodeProp as WindowWithTop).top === top)
          + 2 * +((pe as ParentElement as WindowWithTop).top === top);
      if (action) { // indeed a <frameset>
        return action < 2 ? pe as Element : action < 3 ? pn as Node : el === document.body ? a.docEl_unsafe_()
          : a.Getter_(Node, el, kPN);
      }
    }
    // par exists but not in normal tree
    if (Build.BTypes & ~BrowserType.Firefox && !(pn.nodeType && pn.contains(el))) { // pn is overridden
      if (pe && pe.nodeType && pe.contains(el)) { /* pe is real */ return pe; }
      pn = a.Getter_(Node, el, kPN);
    }
    // pn is real (if BrowserVer.MinParentNodeGetterInNodePrototype else) real or null
    return type === PNType.DirectNode ? pn as Node | null // may return a Node instance
      : type >= PNType.ResolveShadowHost && (
        !(Build.BTypes & ~BrowserType.Firefox) || Build.MinCVer >= BrowserVer.MinParentNodeGetterInNodePrototype || pn)
        && (pn as Node).nodeType === kNode.DOCUMENT_FRAGMENT_NODE
      ? (pn as DocumentFragment as ShadowRoot).host || null // shadow root or other type of document fragment
      : (!(Build.BTypes & ~BrowserType.Firefox) || Build.MinCVer >= BrowserVer.MinParentNodeGetterInNodePrototype || pn)
        && "tagName" in (pn as Node) ? pn as Element /* in doc and .pN+.pE are overridden */
      : null /* pn is null, or some unknown type ... */;
  } as {
    (this: void, el: Element, type: PNType.DirectElement
        | PNType.ResolveShadowHost | PNType.RevealSlot | PNType.RevealSlotAndGotoParent): Element | null;
    (this: void, el: Node, type: PNType.DirectNode): ShadowRoot | DocumentFragment | Document | Element | null;
  },
  scrollingEl_ (fallback?: 1): SafeElement | null {
    // Both C73 and FF66 still supports the Quirk mode (entered by `document.open()`)
    let d = document, el = d.scrollingElement, docEl = VDom.docEl_unsafe_();
    if (Build.MinCVer < BrowserVer.Min$Document$$ScrollingElement && Build.BTypes & BrowserType.Chrome
        && el === undefined) {
      /**
       * The code about `inQuirksMode` in `Element::scrollTop()` is wrapped by a flag #scrollTopLeftInterop
       * since [2013-11-18] https://github.com/chromium/chromium/commit/25aa0914121f94d2e2efbc4bf907f231afae8b51 ,
       * while the flag is hidden on Chrome 34~43 (32-bits) for Windows (34.0.1751.0 is on 2014-04-07).
       * But the flag is under the control of #enable-experimental-web-platform-features
       */
      let body = d.body;
      el = d.compatMode === "BackCompat" || body && (
              scrollY ? body.scrollTop : (docEl as HTMLHtmlElement).scrollHeight <= body.scrollHeight)
        ? body : body ? docEl : null;
      // If not fallback, then the task is to get an exact one in order to use `scEl.scrollHeight`,
      // but if body is null in the meanwhile, then docEl.scrollHeight is not reliable (scrollY neither)
      //   when it's real scroll height is not larger than innerHeight
    }
    if (!(Build.NDEBUG
          || BrowserVer.MinEnsured$ScrollingElement$CannotBeFrameset < BrowserVer.MinFramesetHasNoNamedGetter)) {
      console.log("Assert error: MinEnsured$ScrollingElement$CannotBeFrameset < MinFramesetHasNoNamedGetter");
    }
    if (Build.MinCVer < BrowserVer.MinEnsured$ScrollingElement$CannotBeFrameset && Build.BTypes & BrowserType.Chrome) {
      el = this.notSafe_(el as Exclude<typeof el, undefined>) ? null : el;
    }
    if (!(Build.BTypes & ~BrowserType.Firefox)) {
      return el || !fallback ? el as SafeElement | null : docEl as SafeElement | null;
    }
    // here `el` may be `:root` / `:root > body` / null, but never `:root > frameset`
    return this.notSafe_(el as Exclude<typeof el, undefined>) ? null // :root is unsafe
      : el || !fallback ? el as SafeElement | null // el is safe object or null
      : this.notSafe_(docEl) ? null : docEl as SafeElement | null;
  },
  /** @UNSAFE_RETURNED */
  fullscreenEl_unsafe_ (): Element | null {
    /** On Firefox, document.fullscreenElement may not exist even since FF64 - see Min$Document$$FullscreenElement */
    return !(Build.BTypes & ~BrowserType.Firefox) || Build.BTypes & BrowserType.Firefox && VOther & BrowserType.Firefox
      ? document.mozFullScreenElement
      : !(Build.BTypes & BrowserType.Edge) && Build.MinCVer >= BrowserVer.MinEnsured$Document$$fullscreenElement
      ? document.fullscreenElement : document.webkitFullscreenElement;
  },
  // Note: sometimes a cached frameElement is not the wanted
  frameElement_ (): Element | null | void {
    let el: typeof frameElement | undefined;
    if (Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinSafeGlobal$frameElement
        || Build.BTypes & BrowserType.Edge) {
      try {
        if (!(Build.BTypes & BrowserType.Firefox)) { return frameElement; }
        else { el = frameElement; }
      } catch {}
    } else {
      if (!(Build.BTypes & BrowserType.Firefox)) { return frameElement; }
      el = frameElement;
    }
    if (Build.BTypes & BrowserType.Firefox) {
      if (el && (!(Build.BTypes & ~BrowserType.Firefox) || VOther === BrowserType.Firefox)) {
        VDom.frameElement_ = () => el;
      }
      return el;
    }
  },
  /** must be called only if having known anotherWindow is "in a same origin" */
  getWndCore_: 0 as never as (anotherWindow: Window) => ContentWindowCore | 0 | void,
  /**
   * Return a valid `ContentWindowCore`
   * only if is a child which in fact has a same origin with its parent frame (ignore `document.domain`).
   *
   * So even if it returns a valid object, `parent.***` may still be blocked
   */
  parentCore_: (Build.BTypes & BrowserType.Firefox ? function (): ContentWindowCore | 0 | void {
    if (Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinSafeGlobal$frameElement
        ? !VDom.frameElement_() : !frameElement) {
      // (in Firefox) not use the cached version of frameElement - for less exceptions in the below code
      return;
    }
    // Note: the functionality below should keep the same even if the cached version is used - for easier debugging
    const core = VDom.getWndCore_(parent as Window);
    if ((!(Build.BTypes & ~BrowserType.Firefox) || VOther === BrowserType.Firefox) && core) {
      /** the case of injector is handled in {@link ../content/injected_end.ts} */
      VDom.parentCore_ = () => core;
    }
    return core;
  } : 0 as never) as () => ContentWindowCore | 0 | void | null,

  /** computation section */

  /** depends on .docZoom_, .bZoom_, .paintBox_ */
  prepareCrop_ (inVisualViewport?: 1, limitedView?: Rect | null): number {
    let vright: number, vbottom: number, vbottoms: number, vleft: number, vtop: number, vtops: number;
    this.prepareCrop_ = (function (this: void, inVisual?: 1, limited?: Rect | null): number {
      const a = VDom, dz = Build.BTypes & ~BrowserType.Firefox ? a.docZoom_ : 1,
      fz = Build.BTypes & ~BrowserType.Firefox ? dz * a.bZoom_ : 1, b = a.paintBox_,
      max = Math.max, min = Math.min,
      d = document, visual = inVisual && visualViewport;
      let i: number, j: number, el: Element | null, doc: Document["documentElement"];
      vleft = vtop = 0;
      if (!(Build.BTypes & BrowserType.Chrome) || Build.MinCVer >= BrowserVer.MinEnsured$visualViewport$ ? visual
          : visual && visual.width) {
        vleft = (visual as VisualViewport).offsetLeft | 0, vtop = (visual as VisualViewport).offsetTop | 0;
        i = vleft + <number> (visual as VisualViewport).width | 0; j = vtop + (visual as VisualViewport).height | 0;
      }
      else if (doc = a.docEl_unsafe_(),
          el = Build.MinCVer >= BrowserVer.MinScrollTopLeftInteropIsAlwaysEnabled
              || !(Build.BTypes & BrowserType.Chrome) ? a.scrollingEl_() : d.compatMode === "BackCompat" ? d.body : doc,
          Build.MinCVer < BrowserVer.MinScrollTopLeftInteropIsAlwaysEnabled && Build.BTypes & BrowserType.Chrome
            ? el && !a.notSafe_(el) : el) {
        i = (el as SafeElement).clientWidth, j = (el as SafeElement).clientHeight;
      } else {
        i = innerWidth, j = innerHeight;
        if (!doc) { return vbottom = j, vbottoms = j - 8, vright = i; }
        // the below is not reliable but safe enough, even when docEl is unsafe
        i = min(max(i - GlobalConsts.MaxScrollbarWidth, (doc.clientWidth * dz) | 0), i);
        j = min(max(j - GlobalConsts.MaxScrollbarWidth, (doc.clientHeight * dz) | 0), j);
      }
      if (b) {
        i = min(i, b[0] * dz); j = min(j, b[1] * dz);
      }
      vright = (i / fz) | 0, vbottom = (j / fz) | 0;
      if (limited) {
        vleft = max(vleft, limited.l | 0);
        vtop = max(vtop, limited.t | 0);
        vright = min(vright, limited.r | 0);
        vbottom = min(vbottom, limited.b | 0);
      }
      vtops = vtop + 3;
      vbottoms = (vbottom - 8 / fz) | 0;
      return vright;
    });
    this.cropRectToVisible_ = (function (left, top, right, bottom): Rect | null {
      if (top > vbottoms || bottom < vtops) {
        return null;
      }
      const cr: Rect = {
        l: left   > vleft   ? (left   | 0) : vleft,
        t: top    > vtop    ? (top    | 0) : vtop,
        r: right  < vright  ? (right  | 0) : vright,
        b: bottom < vbottom ? (bottom | 0) : vbottom
      };
      return cr.r - cr.l > 2 && cr.b - cr.t > 2 ? cr : null;
    });
    return this.prepareCrop_(inVisualViewport, limitedView);
  },
  getBoundingClientRect_ (el: Element): ClientRect {
    return Build.BTypes & ~BrowserType.Firefox ? Element.prototype.getBoundingClientRect.call(el)
      : el.getBoundingClientRect();
  },
  getVisibleClientRect_ (element: SafeElement, el_style?: CSSStyleDeclaration | null): Rect | null {
    const arr = element.getClientRects();
    let cr: Rect | null, style: CSSStyleDeclaration | null, _ref: HTMLCollection | undefined
      , isVisible: boolean | undefined, notInline: boolean | undefined, str: string;
    for (let _i = 0, _len = arr.length; _i < _len; _i++) {
      const rect = arr[_i];
      if (rect.height > 0 && rect.width > 0) {
        if (cr = this.cropRectToVisible_(rect.left, rect.top, rect.right, rect.bottom)) {
          if (isVisible == null) {
            el_style || (el_style = getComputedStyle(element));
            isVisible = el_style.visibility === "visible";
          }
          return isVisible ? cr : null;
        }
        continue;
      }
      // according to https://dom.spec.whatwg.org/#dom-parentnode-children
      // .children will always be a HTMLCollection even if element is SVGElement
      if (_ref) {
        continue;
      }
      _ref = element.children;
      for (let _j = 0, _len1 = _ref.length, gCS = getComputedStyle; _j < _len1; _j++) {
        style = gCS(_ref[_j]);
        if (style.float !== "none" || ((str = style.position) !== "static" && str !== "relative")) { /* empty */ }
        else if (rect.height === 0) {
          if (notInline == null) {
            el_style || (el_style = gCS(element));
            notInline = (el_style.fontSize !== "0px" && el_style.lineHeight !== "0px")
              || !el_style.display.startsWith("inline");
          }
          if (notInline || !style.display.startsWith("inline")) { continue; }
        } else { continue; }
        if (!(Build.BTypes & ~BrowserType.Firefox && this.notSafe_(_ref[_j]))
            && (cr = this.getVisibleClientRect_(_ref[_j] as SafeHTMLElement, style))) {
          return cr;
        }
      }
      style = null;
    }
    return null;
  },
  getClientRectsForAreas_: function (this: {}, element: HTMLElementUsingMap, output: Hint5[]
      , areas?: NodeListOf<HTMLAreaElement | Element> | HTMLAreaElement[]): Rect | null {
    let diff: number, x1: number, x2: number, y1: number, y2: number, rect: Rect | null | undefined;
    const cr = VDom.getBoundingClientRect_(element);
    if (cr.height < 3 || cr.width < 3) { return null; }
    // replace is necessary: chrome allows "&quot;", and also allows no "#"
    let wantRet = areas;
    if (!areas) {
      const selector = `map[name="${element.useMap.replace(<RegExpOne> /^#/, "").replace(<RegExpG> /"/g, '\\"')}"]`;
      // on C73, if a <map> is moved outside from a #shadowRoot, then the relation of the <img> and it is kept;
      // while on F65 the relation will get lost.
      const root = (Build.MinCVer >= BrowserVer.Min$Node$$getRootNode && !(Build.BTypes & BrowserType.Edge)
          || !(Build.BTypes & ~BrowserType.Firefox) || element.getRootNode)
        ? (element as EnsureNonNull<typeof element>).getRootNode() as ShadowRoot | Document : document;
      const map = root.querySelector(selector);
      if (!map || (map as ElementToHTML).lang == null) { return null; }
      areas = map.querySelectorAll("area");
    }
    const toInt = (a: string): number => (a as string | number as number) | 0;
    for (let _i = 0, _len = areas.length; _i < _len; _i++) {
      const area = areas[_i] as HTMLAreaElement | Element;
      if (!("lang" in area)) { continue; }
      let coords = area.coords.split(",").map(toInt);
      switch (area.shape.toLowerCase()) {
      case "circle": case "circ": // note: "circ" is non-conforming
        x2 = coords[0]; y2 = coords[1]; diff = coords[2] / Math.sqrt(2);
        x1 = x2 - diff; x2 += diff; y1 = y2 - diff; y2 += diff;
        diff = 3;
        break;
      case "default":
        x1 = 0; y1 = 0; x2 = cr.width; y2 = cr.height;
        diff = 0;
        break;
      case "poly": case "polygon": // note: "polygon" is non-conforming
        y1 = coords[0], y2 = coords[2], diff = coords[4];
        x1 = Math.min(y1, y2, diff); x2 = Math.max(y1, y2, diff);
        y1 = coords[1], y2 = coords[3], diff = coords[5];
        y1 = Math.min(y1, y2, diff); y2 = Math.max(coords[1], y2, diff);
        diff = 6;
      default:
        x1 = coords[0]; y1 = coords[1]; x2 = coords[2]; y2 = coords[3];
        x1 > x2 && (x1 = x2, x2 = coords[0]);
        y1 > y2 && (y1 = y2, y2 = coords[1]);
        diff = 4;
        break;
      }
      if (coords.length < diff) { continue; }
      rect = (this as typeof VDom).cropRectToVisible_(x1 + cr.left, y1 + cr.top, x2 + cr.left, y2 + cr.top);
      if (rect) {
        output.push([area, rect, 0, [rect, 0], element]);
      }
    }
    return wantRet && output.length > 0 ? output[0][1] : null;
  } as {
    (element: HTMLElementUsingMap, output: Hint5[], areas: HTMLCollectionOf<HTMLAreaElement> | HTMLAreaElement[]
      ): Rect | null;
    (element: HTMLElementUsingMap, output: Hint5[]): null;
  },
  getCroppedRect_: function (this: {}, el: Element, crect: Rect | null): Rect | null {
    let a = this as typeof VDom, parent: Element | null = el, prect: Rect | null | undefined
      , i: number = crect ? 4 : 0, bcr: ClientRect;
    while (1 < i-- && (parent = a.GetParent_(parent, PNType.RevealSlotAndGotoParent))
        && a.getComputedStyle_(parent).overflow !== "hidden"
        ) { /* empty */ }
    if (i > 0 && parent) {
      bcr = a.getBoundingClientRect_(parent);
      prect = a.cropRectToVisible_(bcr.left, bcr.top, bcr.right, bcr.bottom);
    }
    return prect && a.isContaining_(crect as Rect, prect)
        ? prect : crect;
  } as {
    (el: Element, crect: Rect): Rect;
    (el: Element, crect: Rect | null): Rect | null;
  },
  findMainSummary_ (details: HTMLDetailsElement): SafeHTMLElement | null {
    // Specification: https://html.spec.whatwg.org/multipage/interactive-elements.html#the-summary-element
    // `HTMLDetailsElement::FindMainSummary()` in
    // https://cs.chromium.org/chromium/src/third_party/blink/renderer/core/html/html_details_element.cc?g=0&l=101
    for (let summaries = details.children, i = 0, len = summaries.length; i < len; i++) {
      const summary = summaries[i];
      // there's no window.HTMLSummaryElement on C70
      if (VDom.htmlTag_(summary) === "summary") {
        return summary as SafeHTMLElement;
      }
    }
    return null;
  },
  paintBox_: null as [number, number] | null, // it may need to use `paintBox[] / <body>.zoom`
  wdZoom_: 1, // <html>.zoom * min(devicePixelRatio, 1) := related to physical pixels
  docZoom_: 1, // zoom of <html>
  isDocZoomStrange_: 0,
  dScale_: 1, // <html>.transform:scale (ignore the case of sx != sy)
  bScale_: 1, // <body>.transform:scale (ignore the case of sx != sy)
  /** zoom of <body> (if not fullscreen else 1) */
  bZoom_: 1,
  _fixDocZoom: Build.BTypes & BrowserType.Chrome ? (zoom: number, docEl: Element, devRatio: number): number => {
    let ver = Build.MinCVer < BrowserVer.MinASameZoomOfDocElAsdevPixRatioWorksAgain
        && (!(Build.BTypes & ~BrowserType.Chrome) || VOther & BrowserType.Chrome) ? VDom.cache_.v as BrowserVer : 0,
    rectWidth: number, viewportWidth: number,
    style: CSSStyleDeclaration | false | undefined;
    if (BrowserVer.MinDevicePixelRatioImplyZoomOfDocEl !== BrowserVer.MinEnsured$visualViewport$) {
      console.log("Assert error: MinDevicePixelRatioImplyZoomOfDocEl should be equal with MinEnsured$visualViewport$");
    }
    VDom.isDocZoomStrange_ = 0;
    return Build.BTypes & ~BrowserType.Chrome && VOther & ~BrowserType.Chrome
        || zoom === 1
        || Build.MinCVer < BrowserVer.MinDevicePixelRatioImplyZoomOfDocEl
            && ver < BrowserVer.MinDevicePixelRatioImplyZoomOfDocEl
        || (rectWidth = VDom.getBoundingClientRect_(docEl).width,
            viewportWidth = (visualViewport as EnsureItemsNonNull<VisualViewport>).width,
            Math.abs(rectWidth - viewportWidth) > 1e-3
            && (Math.abs(rectWidth * zoom - viewportWidth) < 0.01
              || (Build.MinCVer >= BrowserVer.MinASameZoomOfDocElAsdevPixRatioWorksAgain
                    || ver > BrowserVer.MinASameZoomOfDocElAsdevPixRatioWorksAgain - 1)
                  && (style = !VDom.notSafe_(docEl) && (
                    docEl as TypeToAssert<Element, HTMLElement | SVGElement, "style">).style)
                  && style.zoom && style.zoom
              || (VDom.isDocZoomStrange_ = 1, zoom !== VDom._getPageZoom(zoom, devRatio, docEl))))
        ? zoom : 1;
  } : 0 as never,
  _getPageZoom: Build.BTypes & BrowserType.Chrome ? function (devRatio: number
      , docElZoom: number, docEl: Element | null): number {
    // only detect once, so that its cost is not too big
    let iframe: HTMLIFrameElement = VDom.createElement_("iframe"),
    pageZoom: number | null | undefined, doc: Document | null;
    try {
      iframe.appendChild.call(docEl, iframe);
      docEl = (doc = iframe.contentDocument) && doc.documentElement;
      pageZoom = docEl && +VDom.getComputedStyle_(docEl).zoom;
    } catch {}
    iframe.remove();
    VDom._getPageZoom = (zoom2, ratio2) => pageZoom ? ratio2 / devRatio * pageZoom : zoom2;
    return pageZoom || docElZoom;
  } as (devRatio: number, docElZoom: number, docEl: Element) => number : 0 as never,
  /**
   * also update VDom.docZoom_
   * update VDom.bZoom_ if target
   */
  getZoom_: Build.BTypes & ~BrowserType.Firefox ? function (this: {}, target?: 1 | Element): void {
    const a = this as typeof VDom;
    let docEl = a.docEl_unsafe_() as Element, ratio = a.devRatio_()
      , gcs = a.getComputedStyle_, st = gcs(docEl), zoom = +st.zoom || 1
      , el: Element | null = a.fullscreenEl_unsafe_();
    Build.BTypes & BrowserType.Chrome && (zoom = a._fixDocZoom(zoom, docEl, ratio));
    if (target) {
      const body = el ? null : document.body;
      // if fullscreen and there's nested "contain" styles,
      // then it's a whole mess and nothing can be ensured to be right
      a.bZoom_ = body && (target === 1 || a.IsInDOM_(target, body)) && +gcs(body).zoom || 1;
    }
    for (; el && el !== docEl;
        el = a.GetParent_(el, Build.MinCVer < BrowserVer.MinSlotIsNotDisplayContents
              && Build.BTypes & BrowserType.Chrome && a.cache_.v < BrowserVer.MinSlotIsNotDisplayContents
            ? PNType.RevealSlotAndGotoParent : PNType.RevealSlot)) {
      zoom *= +gcs(el).zoom || 1;
    }
    a.paintBox_ = null; // it's not so necessary to get a new paintBox here
    a.docZoom_ = zoom;
    a.wdZoom_ = Math.round(zoom * Math.min(ratio, 1) * 1000) / 1000;
  } : function (this: {}): void {
    const a = this as typeof VDom;
    a.paintBox_ = null;
    a.docZoom_ = a.bZoom_ = 1;
    /** the min() is required in {@link ../front/vomnibar.ts#Vomnibar_.activate_ } */
    a.wdZoom_ = Math.min(a.devRatio_(), 1);
  } as never,
  getViewBox_ (needBox?: 1 | 2): ViewBox | ViewOffset {
    const a = this, ratio = a.devRatio_();
    let iw = innerWidth, ih = innerHeight, ratio2 = Math.min(ratio, 1);
    if (a.fullscreenEl_unsafe_()) {
      a.getZoom_(1);
      a.dScale_ = a.bScale_ = 1;
      ratio2 = a.wdZoom_ / ratio2;
      return [0, 0, (iw / ratio2) | 0, (ih / ratio2) | 0, 0];
    }
    const float = parseFloat,
    box = a.docEl_unsafe_() as Element, st = a.getComputedStyle_(box),
    box2 = document.body, st2 = box2 ? a.getComputedStyle_(box2) : st,
    zoom2 = a.bZoom_ = Build.BTypes & ~BrowserType.Firefox && box2 && +st2.zoom || 1,
    containHasPaint = (<RegExpOne> /content|paint|strict/).test(st.contain as string),
    kMatrix = "matrix(1,",
    stacking = !(Build.BTypes & BrowserType.Chrome && needBox === 2)
        && (st.position !== "static" || containHasPaint || st.transform !== "none"),
    // NOTE: if box.zoom > 1, although document.documentElement.scrollHeight is integer,
    //   its real rect may has a float width, such as 471.333 / 472
    rect = VDom.getBoundingClientRect_(box);
    let zoom = Build.BTypes & ~BrowserType.Firefox && +st.zoom || 1,
    // ignore the case that x != y in "transform: scale(x, y)""
    _tf = st.transform, scale = a.dScale_ = _tf && !_tf.startsWith(kMatrix) && float(_tf.slice(7)) || 1;
    a.bScale_ = box2 && (_tf = st2.transform) && !_tf.startsWith(kMatrix) && float(_tf.slice(7)) || 1;
    Build.BTypes & BrowserType.Chrome && (zoom = a._fixDocZoom(zoom, box, ratio));
    a.wdZoom_ = Math.round(zoom * ratio2 * 1000) / 1000;
    a.docZoom_ = Build.BTypes & ~BrowserType.Firefox ? zoom : 1;
    let x = !stacking ? float(st.marginLeft)
          : !(Build.BTypes & ~BrowserType.Firefox)
            || Build.BTypes & BrowserType.Firefox && VOther === BrowserType.Firefox
          ? -float(st.borderLeftWidth) : 0 | -box.clientLeft
      , y = !stacking ? float(st.marginTop)
          : !(Build.BTypes & ~BrowserType.Firefox)
            || Build.BTypes & BrowserType.Firefox && VOther === BrowserType.Firefox
          ? -float(st.borderTopWidth ) : 0 | -box.clientTop
      , ltScale = Build.BTypes & BrowserType.Chrome ? needBox === 2 ? 1 : scale : 1;
    x = x * (Build.BTypes & BrowserType.Chrome ? ltScale : scale) - rect.left;
    y = y * (Build.BTypes & BrowserType.Chrome ? ltScale : scale) - rect.top;
    // note: `Math.abs(y) < 0.01` supports almost all `0.01 * N` (except .01, .26, .51, .76)
    x = Math.abs(x) < 0.01 ? 0 : Math.ceil(Math.round(x / zoom2 * 100) / 100);
    y = Math.abs(y) < 0.01 ? 0 : Math.ceil(Math.round(y / zoom2 * 100) / 100);
    if (Build.BTypes & ~BrowserType.Firefox) {
      iw /= zoom, ih /= zoom;
    }
    let mw = iw, mh = ih;
    if (containHasPaint) { // ignore the area on the block's left
      iw = rect.right, ih = rect.bottom;
    }
    a.paintBox_ = containHasPaint ? [iw - float(st.borderRightWidth ) * scale,
                                       ih - float(st.borderBottomWidth) * scale] : null;
    if (!needBox) { return [x, y]; }
    // here rect.right is not accurate because <html> may be smaller than <body>
    const sEl = a.scrollingEl_(), kHidden = "hidden",
    xScrollable = st.overflowX !== kHidden && st2.overflowX !== kHidden,
    yScrollable = st.overflowY !== kHidden && st2.overflowY !== kHidden;
    if (xScrollable) {
      mw += 64 * zoom2;
      if (!containHasPaint) {
        iw = sEl ? (sEl.scrollWidth - scrollX) / zoom : Math.max((iw - GlobalConsts.MaxScrollbarWidth) / zoom
          , rect.right);
      }
    }
    if (yScrollable) {
      mh += 20 * zoom2;
      if (!containHasPaint) {
        ih = sEl ? (sEl.scrollHeight - scrollY) / zoom : Math.max((ih - GlobalConsts.MaxScrollbarWidth) / zoom
          , rect.bottom);
      }
    }
    iw = Math.min(iw, mw), ih = Math.min(ih, mh);
    iw = (iw / zoom2) | 0, ih = (ih / zoom2) | 0;
    return [x, y, iw, yScrollable ? ih - GlobalConsts.MaxHeightOfLinkHintMarker : ih, xScrollable ? iw : 0];
  },
  NotVisible_: function (this: void, element: Element | null, rect?: ClientRect): VisibilityType {
    if (!rect) {
      rect = VDom.getBoundingClientRect_(element as Element);
    }
    return rect.height < 0.5 || rect.width < 0.5 ? VisibilityType.NoSpace
      : rect.bottom <= 0 || rect.top >= innerHeight || rect.right <= 0 || rect.left >= innerWidth
        ? VisibilityType.OutOfView : VisibilityType.Visible;
  } as {
    (element: Element): VisibilityType;
    (element: null, rect: ClientRect): VisibilityType;
  },
  IsInDOM_: function (this: void, element: Element, root?: Element | Document | Window | RadioNodeList
      , checkMouseEnter?: 1): boolean {
    if (!root) {
      const isConnected = element.isConnected; /** {@link #BrowserVer.Min$Node$$isConnected} */
      if (!(Build.BTypes & ~BrowserType.Firefox) || isConnected === !!isConnected) {
        return isConnected as boolean; // is boolean : exists and is not overridden
      }
    }
    let f: Node["getRootNode"]
      , NProto = Node.prototype, pe: Element | null;
    root = <Element | Document> root || (!(Build.BTypes & ~BrowserType.Firefox) ? element.ownerDocument as Document
        : (root = element.ownerDocument, Build.MinCVer < BrowserVer.MinFramesetHasNoNamedGetter &&
            Build.BTypes & BrowserType.Chrome &&
            VDom.unsafeFramesetTag_ && (root as WindowWithTop).top === top ||
            (root as Document | RadioNodeList).nodeType !== kNode.DOCUMENT_NODE
        ? document : root as Document));
    if (root.nodeType === kNode.DOCUMENT_NODE
        && (Build.MinCVer >= BrowserVer.Min$Node$$getRootNode && !(Build.BTypes & BrowserType.Edge)
          || !(Build.BTypes & ~BrowserType.Firefox) || (f = NProto.getRootNode))) {
      return !(Build.BTypes & ~BrowserType.Firefox)
        ? (element as EnsureNonNull<Element>).getRootNode({composed: true}) === root
        : (Build.MinCVer >= BrowserVer.Min$Node$$getRootNode && !(Build.BTypes & BrowserType.Edge)
        ? NProto.getRootNode as NonNullable<typeof f> : f as NonNullable<typeof f>
        ).call(element, {composed: true}) === root;
    }
    if (Build.BTypes & ~BrowserType.Firefox ? NProto.contains.call(root, element) : root.contains(element)) {
      return true;
    }
    while ((pe = VDom.GetParent_(element, checkMouseEnter ? PNType.RevealSlotAndGotoParent : PNType.ResolveShadowHost))
            && pe !== root) {
      element = pe;
    }
    // if not pe, then PNType.DirectNode won't return an Element
    // because .GetParent_ will only return a real parent, but not a fake <form>.parentNode
    return (pe || VDom.GetParent_(element, PNType.DirectNode)) === root;
  } as (this: void,  element: Element, root?: Element | Document, checkMouseEnter?: 1) => boolean,
  isStyleVisible_: (element: Element): boolean => VDom.getComputedStyle_(element).visibility === "visible",
  isAriaNotTrue_ (element: SafeElement, ariaType: kAria): boolean {
    let s = element.getAttribute(ariaType ? "aria-disabled" : "aria-hidden");
    return s === null || (!!s && s.toLowerCase() !== "true");
  },
  uneditableInputs_: <SafeEnum> { __proto__: null as never,
    button: 1, checkbox: 1, color: 1, file: 1, hidden: 1, //
    image: 1, radio: 1, range: 1, reset: 1, submit: 1
  },
  editableTypes_: <ReadonlySafeDict<EditableType>> { __proto__: null as never,
    input: EditableType.input_, textarea: EditableType.TextBox,
    select: EditableType.Select,
    embed: EditableType.Embed, object: EditableType.Embed
  },
  /**
   * if true, then `element` is `LockableElement`,
   * so MUST always filter out HTMLFormElement, to keep LockableElement safe
   */
  getEditableType_: function (element: Element): EditableType {
    const tag = VDom.htmlTag_(element), ty = VDom.editableTypes_[tag];
    return !tag ? EditableType.NotEditable : ty !== EditableType.input_ ? (ty ||
        ((element as HTMLElement).isContentEditable !== true
        ? EditableType.NotEditable : EditableType.TextBox)
      )
      : VDom.uneditableInputs_[(element as HTMLInputElement).type] ? EditableType.NotEditable : EditableType.TextBox;
  } as {
    (element: Element): element is LockableElement;
    <Ty extends 0>(element: Element): EditableType;
    <Ty extends 2>(element: EventTarget): element is LockableElement;
    (element: Element): element is LockableElement; // this line is just to avoid a warning on VS Code
  },
  isInputInTextMode_: Build.MinCVer >= BrowserVer.Min$selectionStart$MayBeNull || !(Build.BTypes & BrowserType.Chrome)
      ? 0 as never : function (el: TextElement): boolean | void {
    try {
      return el.selectionEnd != null;
    } catch {}
  },
  isSelected_ (): boolean {
    const element = VDom.activeEl_unsafe_() as Element, sel = VDom.getSelected_(), node = sel.anchorNode;
    return !node ? false
      : (element as TypeToAssert<Element, HTMLElement, "isContentEditable">).isContentEditable === true
      ? (Build.BTypes & ~BrowserType.Firefox ? document.contains.call(element, node) : element.contains(node))
      : element === node || "tagName" in <NodeToElement> node
        && (!(Build.BTypes & BrowserType.Chrome) || Build.MinCVer >= BrowserVer.MinFramesetHasNoNamedGetter
              || node.childNodes instanceof NodeList)
        && element === (node.childNodes as NodeList | RadioNodeList)[sel.anchorOffset];
  },
  getSelectionFocusEdge_ (sel: Selection, knownDi: VisualModeNS.ForwardDir): SafeElement | null {
    if (!sel.rangeCount) { return null; }
    let el = sel.focusNode as NonNullable<Selection["focusNode"]>, nt: Node["nodeType"]
      , o: Node | null, cn: Node["childNodes"] | null;
    if ("tagName" in <NodeToElement> el) {
      el = Build.BTypes & ~BrowserType.Firefox
        ? ((cn = (el as Element).childNodes) instanceof NodeList && !("value" in cn) // exclude RadioNodeList
            || (cn = this.Getter_(Node, el, "childNodes")))
          && cn[sel.focusOffset] || el
        : (el.childNodes as NodeList)[sel.focusOffset] || el;
    }
    for (o = el; !(Build.BTypes & BrowserType.Chrome) || Build.MinCVer >= BrowserVer.MinFramesetHasNoNamedGetter
          ? o && <number> o.nodeType - kNode.ELEMENT_NODE
          : o && (nt = o.nodeType, !(this.unsafeFramesetTag_ && (nt as WindowWithTop).top === top)
                  && <number> nt - kNode.ELEMENT_NODE);
        o = knownDi ? (o as Node).previousSibling : (o as Node).nextSibling) { /* empty */ }
    if (!(Build.BTypes & ~BrowserType.Firefox)) {
      return (/* Element | null */ o || (/* el is not Element */ el && el.parentElement)) as SafeElement | null;
    }
    return this.SafeEl_(<Element | null> o
        || (/* el is not Element */ el && el.parentElement as Element | null)
      , PNType.DirectElement);
  },
  getSelectionBoundingBox_: (sel: Selection): ClientRect => sel.getRangeAt(0).getBoundingClientRect(),

  /** action section */

  /** Note: won't call functions if Vimium C is destroyed */
  OnDocLoaded_: null as never as (callback: (this: void) => void, onloaded?: 1) => void | number,
  createElement_: document.createElement.bind(document) as {
    <K extends VimiumContainerElementType> (this: void, tagName: K): HTMLElementTagNameMap[K] & SafeHTMLElement;
  },
  createShadowRoot_<T extends HTMLDivElement | HTMLBodyElement> (box: T): ShadowRoot | T {
    return !(Build.BTypes & ~BrowserType.Edge) ? box
      : (!(Build.BTypes & BrowserType.Chrome) || Build.MinCVer >= BrowserVer.MinEnsuredShadowDOMV1)
        && (!(Build.BTypes & BrowserType.Firefox) || Build.MinFFVer >= FirefoxBrowserVer.MinEnsuredShadowDOMV1)
        && !(Build.BTypes & ~BrowserType.ChromeOrFirefox)
        || box.attachShadow
      ? (box as Ensure<typeof box, "attachShadow">).attachShadow({mode: "closed"})
      : Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinEnsuredShadowDOMV1
        && (!(Build.BTypes & ~BrowserType.Chrome) && Build.MinCVer >= BrowserVer.MinEnsuredUnprefixedShadowDOMV0
            || box.createShadowRoot)
      ? (box as Ensure<typeof box, "createShadowRoot">).createShadowRoot()
      : Build.BTypes & BrowserType.Chrome && Build.MinCVer < BrowserVer.MinEnsuredUnprefixedShadowDOMV0
        && (!(Build.BTypes & ~BrowserType.Chrome) && Build.MinCVer > BrowserVer.MinShadowDOMV0
            || box.webkitCreateShadowRoot)
      ? (box as Ensure<typeof box, "webkitCreateShadowRoot">).webkitCreateShadowRoot() : box;
  },
  mouse_: function (this: {}, element: SafeElementForMouse
      , type: kMouseClickEvents | kMouseMoveEvents
      , center: Point2D, modifiers?: MyMouseControlKeys | null, relatedTarget?: SafeElementForMouse | null
      , button?: AcceptableClickButtons): boolean {
    const doc = element.ownerDocument, view = (doc as Document).defaultView || window,
    tyKey = type.slice(5, 6),
    // is: down | up | (click) | dblclick | auxclick
    detail = !"dui".includes(tyKey) ? 0 : <number> button & kClickButton.primaryAndTwice ? 2 : 1,
    x = center[0], y = center[1], ctrlKey = modifiers ? modifiers.ctrlKey_ : !1,
    altKey = modifiers ? modifiers.altKey_ : !1, shiftKey = modifiers ? modifiers.shiftKey_ : !1,
    metaKey = modifiers ? modifiers.metaKey_ : !1;
    button = (<number> button & kClickButton.second) as kClickButton.none | kClickButton.second;
    relatedTarget = relatedTarget && relatedTarget.ownerDocument === doc ? relatedTarget : null;
    let mouseEvent: MouseEvent;
    // note: there seems no way to get correct screenX/Y of an element
    if (!(Build.BTypes & BrowserType.Chrome)
        || Build.MinCVer >= BrowserVer.MinUsable$MouseEvent$$constructor
        || (this as typeof VDom).cache_.v >= BrowserVer.MinUsable$MouseEvent$$constructor) {
      // Note: The `composed` here may require Shadow DOM support
      const init: ValidMouseEventInit = {
        bubbles: !0, cancelable: !0, composed: !0, detail, view,
        screenX: x, screenY: y, clientX: x, clientY: y, ctrlKey, shiftKey, altKey, metaKey,
        button, buttons: tyKey === "d" ? button || 1 : 0,
        relatedTarget
      },
      IDC = Build.MinCVer >= BrowserVer.MinEnsured$InputDeviceCapabilities || !(Build.BTypes & BrowserType.Chrome)
          ? null : InputDeviceCapabilities;
      if (Build.BTypes & BrowserType.Chrome
          && (!(Build.BTypes & ~BrowserType.Chrome) || VOther & BrowserType.Chrome)
          && (Build.MinCVer >= BrowserVer.MinEnsured$InputDeviceCapabilities || IDC)
          ) {
        init.sourceCapabilities = (this as typeof VDom)._idc = (this as typeof VDom)._idc ||
            new ((Build.MinCVer >= BrowserVer.MinEnsured$InputDeviceCapabilities ? InputDeviceCapabilities
                  : IDC) as NonNullable<typeof IDC>)({fireTouchEvents: !1});
      }
      mouseEvent = new MouseEvent(type, init);
    } else {
      mouseEvent = (doc as Document).createEvent("MouseEvents");
      mouseEvent.initMouseEvent(type, !0, !0, view, detail, x, y, x, y
        , ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget);
    }
    return element.dispatchEvent(mouseEvent);
  } as {
    (element: SafeElementForMouse, type: kMouseClickEvents
      , center: Point2D
      , modifiers?: MyMouseControlKeys | null, related?: SafeElementForMouse | null
      , button?: AcceptableClickButtons): boolean;
    (element: SafeElementForMouse, type: kMouseMoveEvents, center: Point2D
      , modifiers?: null, related?: SafeElementForMouse | null): boolean;
  },
  _idc: null as InputDeviceCapabilities | null,
  lastHovered_: null as SafeElementForMouse | null,
  /** note: will NOT skip even if newEl == @lastHovered */
  hover_: function (this: {}, newEl?: SafeElementForMouse | null, center?: Point2D): void {
    // if center is affected by zoom / transform, then still dispatch mousemove
    const elFromPoint = center && document.elementFromPoint(center[0], center[1]),
    canDispatchMove: boolean = !newEl || elFromPoint === newEl || !elFromPoint || !newEl.contains(elFromPoint),
    a = VDom, isInDOM = a.IsInDOM_, Null = null;
    let last = a.lastHovered_;
    if (last && isInDOM(last)) {
      const notSame = newEl !== last;
      a.mouse_(last, "mouseout", [0, 0], Null, notSame ? newEl : Null);
      if (!newEl || notSame && !isInDOM(newEl, last, 1)) {
        a.mouse_(last, "mouseleave", [0, 0], Null, newEl);
      }
    } else {
      last = Null;
    }
    a.lastHovered_ = Null;
    if (newEl && isInDOM(newEl)) {
      // then center is not null
      a.mouse_(newEl, "mouseover", center as Point2D, Null, last);
      if (isInDOM(newEl)) {
        a.mouse_(newEl, "mouseenter", center as Point2D, Null, last);
        if (canDispatchMove && isInDOM(newEl)) {
          a.mouse_(newEl, "mousemove", center as Point2D);
        }
        a.lastHovered_ = isInDOM(newEl) ? newEl : Null;
      }
    }
    // here always ensure lastHovered_ is "in DOM" or null
  } as {
    (newEl: SafeElementForMouse, center: Point2D): void;
    (_newEl?: null): void;
  },
  unhover_ (element?: SafeElementForMouse): void {
    const a = VDom, old = a.lastHovered_, active = element || old;
    if (old !== element) {
      a.hover_();
    }
    a.lastHovered_ = element || null;
    a.hover_();
    if (active && a.activeEl_unsafe_() === active) { active.blur && active.blur(); }
  },
  touch_: Build.BTypes & BrowserType.Chrome ? function (this: {}, element: SafeElementForMouse
      , [x, y]: Point2D, id?: number): number {
    const newId = id || Date.now(),
    touchObj = new Touch({
      identifier: newId, target: element,
      clientX: x, clientY: y,
      screenX: x, screenY: y,
      pageX: x + scrollX, pageY: y + scrollY,
      radiusX: 8, radiusY: 8, force: 1
    }), touches = id ? [] : [touchObj],
    touchEvent = new TouchEvent(id ? "touchend" : "touchstart", {
      cancelable: true, bubbles: true,
      touches, targetTouches: touches,
      changedTouches: [touchObj]
    });
    element.dispatchEvent(touchEvent);
    return newId;
  } : 0 as never,
  scrollIntoView_ (el: Element, dir?: boolean): void {
    !(Build.BTypes & ~BrowserType.Firefox) ? el.scrollIntoView({ block: "nearest" })
      : Element.prototype.scrollIntoView.call(el,
          Build.MinCVer < BrowserVer.MinScrollIntoViewOptions && Build.BTypes & BrowserType.Chrome &&
          dir != null ? dir : { block: "nearest" });
  },
  view_ (el: Element, oldY?: number): boolean {
    const rect = this.getBoundingClientRect_(el),
    ty = this.NotVisible_(null, rect);
    if (ty === VisibilityType.OutOfView) {
      const t = rect.top, ih = innerHeight, delta = t < 0 ? -1 : t > ih ? 1 : 0, f = oldY != null;
      Build.MinCVer < BrowserVer.MinScrollIntoViewOptions && Build.BTypes & BrowserType.Chrome
      ? this.scrollIntoView_(el, delta < 0) : this.scrollIntoView_(el);
      (delta || f) && this.scrollWndBy_(0, f ? (oldY as number) - scrollY : delta * ih / 5);
    }
    return ty === VisibilityType.Visible;
  },
  scrollWndBy_ (left: number, top: number): void {
    !(Build.BTypes & ~BrowserType.Firefox) ||
    !(Build.BTypes & BrowserType.Edge) && Build.MinCVer >= BrowserVer.MinEnsuredCSS$ScrollBehavior ||
    Element.prototype.scrollBy ? scrollBy({behavior: "instant", left, top}) : scrollBy(left, top);
  },
  runJS_ (code: string, returnEl?: 1): void | HTMLScriptElement {
    const script = VDom.createElement_("script"), docEl = VDom.docEl_unsafe_();
    script.type = "text/javascript";
    script.textContent = code;
    if (Build.BTypes & ~BrowserType.Firefox) {
      /* {@link ../Gulpfile.js#postUglify} */
      if (!(Build.BTypes & BrowserType.Chrome) || Build.MinCVer >= BrowserVer.MinEnsured$ParentNode$$appendAndPrepend) {
        script.insertBefore.call(docEl || document, script, null);
      } else {
        script.appendChild.call(docEl || document, script);
      }
    } else {
      (docEl || document).appendChild(script);
    }
    script.remove();
    if (Build.BTypes & BrowserType.Firefox && returnEl) {
      return script;
    }
  },

  /** rect section */

  center_ (rect: Rect | null): Point2D {
    let zoom = Build.BTypes & ~BrowserType.Firefox ? this.docZoom_ * this.bZoom_ / 2 : 0.5;
    rect = rect && this.cropRectToVisible_(rect.l, rect.t, rect.r, rect.b) || rect;
    return rect ? [((rect.l + rect.r) * zoom) | 0, ((rect.t + rect.b) * zoom) | 0] : [0, 0];
  },
  /** still return `true` if `paddings <= 4px` */
  isContaining_ (a: Rect, b: Rect): boolean {
    return b.b - 5 < a.b && b.r - 5 < a.r && b.t > a.t - 5 && b.l > a.l - 5;
  },
  padClientRect_ (rect: ClientRect, padding: number): WritableRect {
    const x = rect.left, y = rect.top, max = Math.max;
    padding = x || y ? padding : 0;
    return {l: x | 0, t: y | 0, r: (x + max(rect.width, padding)) | 0, b: (y + max(rect.height, padding)) | 0};
  },
  getZoomedAndCroppedRect_ (element: HTMLImageElement | HTMLInputElement
      , st: CSSStyleDeclaration | null, crop: boolean): Rect | null {
    let zoom = Build.BTypes && ~BrowserType.Firefox && +(st || VDom.getComputedStyle_(element)).zoom || 1,
    cr: ClientRect = Build.BTypes && ~BrowserType.Firefox ? VDom.getBoundingClientRect_(element) : 0 as never,
    arr: Rect | null = Build.BTypes && ~BrowserType.Firefox
        ? VDom.cropRectToVisible_(cr.left * zoom, cr.top * zoom, cr.right * zoom, cr.bottom * zoom)
        : VDom.getVisibleClientRect_(element);
    if (crop) {
      arr = VDom.getCroppedRect_(element, arr);
    }
    return arr;
  },
  setBoundary_ (style: CSSStyleDeclaration, r: WritableRect, allow_abs?: boolean): void {
    if (allow_abs && (r.t < 0 || r.l < 0 || r.b > innerHeight || r.r > innerWidth)) {
      const arr: ViewOffset = this.getViewBox_();
      r.l += arr[0], r.r += arr[0], r.t += arr[1], r.b += arr[1];
      style.position = "absolute";
    }
    style.left = r.l + "px", style.top = r.t + "px";
    style.width = (r.r - r.l) + "px", style.height = (r.b - r.t) + "px";
  },
  cropRectToVisible_: null as never as (left: number, top: number, right: number, bottom: number) => Rect | null,
  SubtractSequence_ (this: {l: Rect[]; t: Rect}, rect1: Rect): void { // rect1 - rect2
    let rect2 = this.t, a = this.l, x1: number, x2: number
      , y1 = Math.max(rect1.t, rect2.t), y2 = Math.min(rect1.b, rect2.b);
    if (y1 >= y2 || ((x1 = Math.max(rect1.l, rect2.l)) >= (x2 = Math.min(rect1.r, rect2.r)))) {
      a.push(rect1);
      return;
    }
    // 1 2 3
    // 4   5
    // 6 7 8
    const x0 = rect1.l, x3 = rect1.r, y0 = rect1.t, y3 = rect1.b;
    x0 < x1 && a.push({l: x0, t: y0, r: x1, b: y3}); // (1)4(6)
    y0 < y1 && a.push({l: x1, t: y0, r: x3, b: y1}); // 2(3)
    y2 < y3 && a.push({l: x1, t: y2, r: x3, b: y3}); // 7(8)
    x2 < x3 && a.push({l: x2, t: y1, r: x3, b: y2}); // 5
  }
};
