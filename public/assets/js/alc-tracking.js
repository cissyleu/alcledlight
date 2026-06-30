/* ===============================
ALC Website Data Tracking System V1.0
For alcledlight.com / ZHONGSHAN FLUX TECHNOLOGY CO., LTD.
=============================== */

(() => {
  "use strict";

  /*
   * Replace this value after publishing your Google Apps Script Web App.
   * Example: https://script.google.com/macros/s/AKfycbxxxxxxx/exec
   */
  const API_URL = "https://script.google.com/macros/s/AKfycbzuAwo6E8KBpmgfo9P0ZGswMHYcnFriKGL_snH8yrSgNeYcXzBt-7bFhYmCapXe0MzR/exec";
  const WEBSITE_HOST = "alcledlight.com";
  const WHATSAPP_NUMBER = "8618942391335";
  const SALES_EMAIL = "cissy@alcledlight.com";

  const pageEnterTime = Math.round(performance.timeOrigin || Date.now());
  const sessionId = getOrCreateSessionId();
  let maxScroll = 0;
  let pageViewSent = false;

  const visitorLocation = {
    ip: sessionStorage.getItem("alc_ip") || "Unknown",
    country: sessionStorage.getItem("alc_country") || "Unknown"
  };

  const userType = localStorage.getItem("alc_visited") ? "Returning" : "New";
  localStorage.setItem("alc_visited", "yes");

  const deviceType = /Mobile|Android|iP(hone|od|ad)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(navigator.userAgent)
    ? "Mobile"
    : "Desktop";

  function trackingReady() {
    return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/i.test(API_URL);
  }

  function getOrCreateSessionId() {
    const existing = sessionStorage.getItem("alc_session_id");
    if (existing) return existing;
    const id = `alc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("alc_session_id", id);
    return id;
  }

  function getFullCountryName(code) {
    if (!code || code.length !== 2) return code || "Unknown";
    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
    } catch (e) {
      return code;
    }
  }

  async function fetchVisitorIP() {
    if (visitorLocation.ip !== "Unknown") return;

    let ip = "Unknown";
    let country = "Unknown";

    try {
      const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.ip && !data.error) {
          ip = data.ip;
          country = data.country_name || "Unknown";
        }
      }
    } catch (e) {}

    if (ip === "Unknown") {
      try {
        const res = await fetch("https://ipwho.is/", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.ip && data.success !== false) {
            ip = data.ip;
            country = data.country || "Unknown";
          }
        }
      } catch (e) {}
    }

    if (ip === "Unknown") {
      try {
        const res = await fetch("https://1.1.1.1/cdn-cgi/trace", { cache: "no-store" });
        if (res.ok) {
          const text = await res.text();
          const ipMatch = text.match(/ip=([^\n]+)/);
          const locMatch = text.match(/loc=([^\n]+)/);
          if (ipMatch) {
            ip = ipMatch[1];
            country = locMatch ? getFullCountryName(locMatch[1]) : "Unknown";
          }
        }
      } catch (e) {}
    }

    if (ip !== "Unknown") {
      visitorLocation.ip = ip;
      visitorLocation.country = country;
      sessionStorage.setItem("alc_ip", ip);
      sessionStorage.setItem("alc_country", country);
    }
  }

  function getCleanTitle() {
    let title = document.title || "Home";
    title = title
      .replace(/ZHONGSHAN FLUX TECHNOLOGY CO\., LTD\.?/gi, "")
      .replace(/FLUX/gi, "")
      .replace(/alcledlight\.com/gi, "")
      .replace(/^[-\s|]+|[-\s|]+$/g, "")
      .trim();
    return title || "Home";
  }

  function trackUserPath() {
    const title = getCleanTitle();
    const path = JSON.parse(sessionStorage.getItem("alc_user_path") || "[]");

    if (path[path.length - 1] !== title) {
      path.push(title);
      if (path.length > 6) path.shift();
      sessionStorage.setItem("alc_user_path", JSON.stringify(path));
    }

    return path;
  }

  const userPathArray = trackUserPath();

  function getPageType(url) {
    const path = new URL(url).pathname.toLowerCase();

    if (path === "/" || path.endsWith("/index.html")) return "Home";
    if (path.includes("/products/")) return "Product";
    if (path.includes("/contact")) return "Contact";
    if (path.includes("/applications") || window.location.hash === "#applications") return "Applications";
    if (path.includes("/download") || path.includes("/catalogue")) return "Download";

    return "Other";
  }

  function getTrafficSource() {
    const ref = document.referrer;
    if (!ref) return "Direct";

    let host = "";
    try {
      host = new URL(ref).hostname.toLowerCase();
    } catch (e) {
      return "External";
    }

    if (host.includes(WEBSITE_HOST)) return "Internal";
    if (host.includes("google.")) return "Google Search";
    if (host.includes("bing.")) return "Bing Search";
    if (host.includes("yahoo.")) return "Yahoo Search";
    if (host.includes("facebook.")) return "Facebook";
    if (host.includes("linkedin.")) return "LinkedIn";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("youtube.")) return "YouTube";

    return `External (${host})`;
  }

  function getPageData(extra = {}) {
    return {
      website: WEBSITE_HOST,
      action: extra.action || "page_view",
      page_title: getCleanTitle(),
      page_url: window.location.href,
      page_type: getPageType(window.location.href),
      source: getTrafficSource(),
      path: userPathArray.slice(-3).join(" -> "),
      session_id: sessionId,
      user_type: userType,
      device: deviceType,
      screen_size: `${window.screen.width}×${window.screen.height}`,
      viewport_size: `${window.innerWidth}×${window.innerHeight}`,
      language: navigator.language || "",
      user_agent: navigator.userAgent,
      ip: visitorLocation.ip,
      country: visitorLocation.country,
      scroll: `${Math.max(0, Math.min(100, maxScroll))}%`,
      ...extra
    };
  }

  function sendToSheet(payload) {
    if (!trackingReady()) return false;

    const data = getPageData(payload);
    const body = JSON.stringify(data);

    fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body
    }).catch(() => {});

    return true;
  }

  function sendBeaconToSheet(payload) {
    if (!trackingReady() || !navigator.sendBeacon) return sendToSheet(payload);

    const data = getPageData(payload);
    const blob = new Blob([JSON.stringify(data)], { type: "text/plain;charset=utf-8" });
    return navigator.sendBeacon(API_URL, blob);
  }

  function trackGtagEvent(action, params = {}) {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", action, {
      event_category: params.event_category || "alc_website",
      event_label: params.event_label || window.location.href,
      page_location: window.location.href,
      ...params
    });
  }

  function buildWhatsappText(data) {
    return [
      "Hello FLUX,",
      "",
      "[ Please write your inquiry here ]",
      "",
      "------------------------",
      "Tracking Info:",
      `Page: ${data.page_title}`,
      `URL: ${data.page_url}`
    ].join("\n");
  }

  function buildEmailBody(data) {
    return [
      "Hello FLUX,",
      "",
      "[ Please write your inquiry here ]",
      "",
      "Product / meters / CCT / voltage / delivery country:",
      "",
      "------------------------",
      "Tracking Info:",
      `Page: ${data.page_title}`,
      `URL: ${data.page_url}`,
      `Device: ${data.device}`
    ].join("\n");
  }

  function isWhatsappLink(anchor) {
    const href = anchor.getAttribute("href") || "";
    return href.includes("wa.me/") || href.includes("api.whatsapp.com/") || anchor.classList.contains("whatsapp");
  }

  function isEmailLink(anchor) {
    const href = anchor.getAttribute("href") || "";
    return href.toLowerCase().startsWith(`mailto:${SALES_EMAIL}`);
  }

  function isDownloadLink(anchor) {
    const href = anchor.getAttribute("href") || "";
    return Boolean(
      anchor.hasAttribute("download") ||
      anchor.dataset.file ||
      /\.(pdf|zip|rar|docx?|xlsx?|csv|ies|ldt|dwg|dxf)(\?|#|$)/i.test(href) ||
      anchor.classList.contains("download") ||
      anchor.classList.contains("alc-download")
    );
  }

  function getDownloadName(anchor) {
    return anchor.dataset.file || anchor.textContent.trim() || (anchor.href ? anchor.href.split("/").pop() : "Unknown file");
  }

  function bindGlobalClickTracking() {
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("a");
      if (!anchor) return;

      if (isWhatsappLink(anchor)) {
        event.preventDefault();
        const data = getPageData({ action: "whatsapp_click" });
        sendToSheet({ action: "whatsapp_click" });
        trackGtagEvent("whatsapp_click", { event_category: "contact", event_label: data.page_title });
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsappText(data))}`, "_blank", "noopener");
        return;
      }

      if (isEmailLink(anchor)) {
        event.preventDefault();
        const data = getPageData({ action: "email_click" });
        sendToSheet({ action: "email_click" });
        trackGtagEvent("email_click", { event_category: "contact", event_label: data.page_title });

        const subject = `Inquiry - ${data.page_title}`;
        const body = buildEmailBody(data);
        window.location.href = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return;
      }

      if (isDownloadLink(anchor)) {
        const fileName = getDownloadName(anchor);
        const fileUrl = anchor.getAttribute("href") || "";
        sendToSheet({
          action: "download",
          file_name: fileName,
          file_url: fileUrl
        });
        trackGtagEvent("file_download", { event_category: "download", event_label: fileName });
      }
    }, false);
  }

  function bindScrollDepth() {
    let ticking = false;

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const percent = total > 0 ? Math.round((window.scrollY / total) * 100) : 0;
        if (percent > maxScroll && percent <= 100) maxScroll = percent;
        ticking = false;
      });
    }, { passive: true });
  }

  function sendPageViewOnce() {
    if (pageViewSent) return;
    pageViewSent = true;
    sendToSheet({ action: "page_view" });
    trackGtagEvent("alc_page_view", { event_category: "page", event_label: getCleanTitle() });
  }

  function bindExitTracking() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "hidden") return;

      const staySeconds = Math.round((Date.now() - pageEnterTime) / 1000);
      if (staySeconds >= 3) {
        sendBeaconToSheet({
          action: "page_stay",
          stay_time: staySeconds
        });
      }
    });
  }

  fetchVisitorIP().finally(() => {
    setTimeout(sendPageViewOnce, 350);
  });

  bindScrollDepth();
  bindExitTracking();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindGlobalClickTracking, { once: true });
  } else {
    bindGlobalClickTracking();
  }
})();
