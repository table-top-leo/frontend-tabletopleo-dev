"use client";
import { useState } from "react";

// Everything shown here now comes from either the real translation catalog
// (via `languages`, always the 12 real supported languages passed down
// from LanguageContext) or from t(). No hardcoded English strings, and no
// stale fallback list of languages that don't actually have translations.

export default function LanguageSection({ languageCode, languageName, setLanguage, t, languages = [], loadingLangs = false }) {
  const [search,   setSearch]   = useState("");
  const [region,   setRegion]   = useState("All");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [selected, setSelected] = useState(languageCode || "en");

  const langList = languages;
  const regions  = [t("all_regions"), ...new Set(langList.map(l => l.region))];

  const filtered = langList.filter(l => {
    const label = (l.nativeName || l.name || "");
    const mS = label.toLowerCase().includes(search.toLowerCase())
      || l.name.toLowerCase().includes(search.toLowerCase())
      || l.code.toLowerCase().includes(search.toLowerCase());
    const mR = region === t("all_regions") || region === "All" || l.region === region;
    return mS && mR;
  });

  const handleSave = async () => {
    const lang = langList.find(l => l.code === selected);
    if (!lang || selected === languageCode) return;
    setSaving(true);
    try { await setLanguage(lang.code, lang.name); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    finally { setSaving(false); }
  };

  const current = langList.find(l => l.code === languageCode) || langList[0];

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:"#111", margin:"0 0 4px", letterSpacing:"-0.4px" }}>{t("language")}</h2>
        <p style={{ fontSize:13, color:"#6b7280", margin:0 }}>{t("language_desc")}</p>
      </div>

      {/* Current language badge */}
      <div style={{ background:"#f0fdf4", border:"1.5px solid #bbf7d0", borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:28 }}>{current?.flag}</span>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"#16a34a", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>{t("current_language")}</div>
          <div style={{ fontSize:14, fontWeight:700, color:"#111" }}>{current?.nativeName || current?.name}</div>
        </div>
        {languageCode !== "en" && (
          <button onClick={async () => { setSelected("en"); await setLanguage("en", "English"); }}
            style={{ marginLeft:"auto", fontSize:12, fontWeight:600, color:"#6b7280", background:"none", border:"1px solid #e4e4e7", borderRadius:8, padding:"5px 10px", cursor:"pointer" }}>
            {t("reset_english")}
          </button>
        )}
      </div>

      {/* Search + region */}
      <div style={{ display:"flex", gap:10, marginBottom:14 }}>
        <div style={{ flex:1, position:"relative" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:14 }}>🔍</span>
          <input type="text" placeholder={t("search_language")} value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:"100%", padding:"9px 12px 9px 32px", borderRadius:9, border:"1.5px solid #e4e4e7", fontSize:13.5, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <select value={region} onChange={e => setRegion(e.target.value)}
          style={{ padding:"9px 12px", borderRadius:9, border:"1.5px solid #e4e4e7", fontSize:13, color:"#374151", background:"#fff", cursor:"pointer" }}>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Language grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8, maxHeight:420, overflowY:"auto", paddingRight:4, marginBottom:20 }}>
        {loadingLangs ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"32px 0", color:"#9ca3af", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <span style={{ width:16, height:16, border:"2px solid #e4e4e7", borderTopColor:"#635bff", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }}/>
            {t("loading")}
          </div>
        ) : filtered.map(lang => {
          const isSel = selected === lang.code;
          const isCur = languageCode === lang.code;
          return (
            <button key={lang.code} onClick={() => setSelected(lang.code)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", border:`1.5px solid ${isSel?"#635bff":isCur?"#16a34a":"#e4e4e7"}`, borderRadius:10, background:isSel?"#ede9fe":isCur?"#f0fdf4":"#fff", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{lang.flag}</span>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:isSel?"#635bff":isCur?"#16a34a":"#111", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lang.nativeName || lang.name}</div>
                <div style={{ fontSize:10.5, color:"#9ca3af" }}>{lang.code.toUpperCase()} · {lang.region}</div>
              </div>
              {(isSel || isCur) && (
                <div style={{ marginLeft:"auto", flexShrink:0, width:18, height:18, borderRadius:"50%", background:isSel?"#635bff":"#16a34a", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:"#fff", fontSize:10, fontWeight:900 }}>✓</span>
                </div>
              )}
            </button>
          );
        })}
        {!loadingLangs && filtered.length === 0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"32px 0", color:"#9ca3af", fontSize:13 }}>{t("no_languages_found")}</div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving || selected === languageCode}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"11px 28px", background:saving||selected===languageCode?"#d1d5db":"#111", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:saving||selected===languageCode?"not-allowed":"pointer" }}>
        {saving ? t("saving_dots") : saved ? `✓ ${t("saved_check")}` : t("save_language")}
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
