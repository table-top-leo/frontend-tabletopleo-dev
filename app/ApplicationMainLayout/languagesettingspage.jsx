"use client";
import { useState } from "react";

const ALL_LANGUAGES = [
  { code:"en",    name:"English",                     flag:"🇺🇸", region:"Global" },
  { code:"hi",    name:"Hindi (हिन्दी)",               flag:"🇮🇳", region:"South Asia" },
  { code:"bn",    name:"Bengali (বাংলা)",              flag:"🇧🇩", region:"South Asia" },
  { code:"te",    name:"Telugu (తెలుగు)",               flag:"🇮🇳", region:"South Asia" },
  { code:"mr",    name:"Marathi (मराठी)",              flag:"🇮🇳", region:"South Asia" },
  { code:"ta",    name:"Tamil (தமிழ்)",               flag:"🇮🇳", region:"South Asia" },
  { code:"gu",    name:"Gujarati (ગુજરાતી)",           flag:"🇮🇳", region:"South Asia" },
  { code:"kn",    name:"Kannada (ಕನ್ನಡ)",              flag:"🇮🇳", region:"South Asia" },
  { code:"ml",    name:"Malayalam (മലയാളം)",           flag:"🇮🇳", region:"South Asia" },
  { code:"pa",    name:"Punjabi (ਪੰਜਾਬੀ)",             flag:"🇮🇳", region:"South Asia" },
  { code:"ur",    name:"Urdu (اردو)",                 flag:"🇵🇰", region:"South Asia" },
  { code:"ar",    name:"Arabic (العربية)",             flag:"🇸🇦", region:"Middle East" },
  { code:"fa",    name:"Persian (فارسی)",              flag:"🇮🇷", region:"Middle East" },
  { code:"he",    name:"Hebrew (עברית)",               flag:"🇮🇱", region:"Middle East" },
  { code:"tr",    name:"Turkish (Türkçe)",             flag:"🇹🇷", region:"Europe / Asia" },
  { code:"da",    name:"Danish (Dansk)",               flag:"🇩🇰", region:"Europe" },
  { code:"de",    name:"German (Deutsch)",             flag:"🇩🇪", region:"Europe" },
  { code:"fr",    name:"French (Français)",            flag:"🇫🇷", region:"Europe" },
  { code:"es",    name:"Spanish (Español)",            flag:"🇪🇸", region:"Europe" },
  { code:"pt",    name:"Portuguese (Português)",       flag:"🇵🇹", region:"Europe" },
  { code:"it",    name:"Italian (Italiano)",           flag:"🇮🇹", region:"Europe" },
  { code:"nl",    name:"Dutch (Nederlands)",           flag:"🇳🇱", region:"Europe" },
  { code:"pl",    name:"Polish (Polski)",              flag:"🇵🇱", region:"Europe" },
  { code:"sv",    name:"Swedish (Svenska)",            flag:"🇸🇪", region:"Europe" },
  { code:"no",    name:"Norwegian (Norsk)",            flag:"🇳🇴", region:"Europe" },
  { code:"fi",    name:"Finnish (Suomi)",              flag:"🇫🇮", region:"Europe" },
  { code:"ru",    name:"Russian (Русский)",            flag:"🇷🇺", region:"Europe" },
  { code:"uk",    name:"Ukrainian (Українська)",       flag:"🇺🇦", region:"Europe" },
  { code:"el",    name:"Greek (Ελληνικά)",             flag:"🇬🇷", region:"Europe" },
  { code:"ro",    name:"Romanian (Română)",            flag:"🇷🇴", region:"Europe" },
  { code:"cs",    name:"Czech (Čeština)",              flag:"🇨🇿", region:"Europe" },
  { code:"hu",    name:"Hungarian (Magyar)",           flag:"🇭🇺", region:"Europe" },
  { code:"zh",    name:"Chinese Simplified (中文)",    flag:"🇨🇳", region:"East Asia" },
  { code:"zh-TW", name:"Chinese Traditional (繁體中文)",flag:"🇹🇼", region:"East Asia" },
  { code:"ja",    name:"Japanese (日本語)",             flag:"🇯🇵", region:"East Asia" },
  { code:"ko",    name:"Korean (한국어)",               flag:"🇰🇷", region:"East Asia" },
  { code:"th",    name:"Thai (ภาษาไทย)",              flag:"🇹🇭", region:"Southeast Asia" },
  { code:"vi",    name:"Vietnamese (Tiếng Việt)",      flag:"🇻🇳", region:"Southeast Asia" },
  { code:"id",    name:"Indonesian (Bahasa Indonesia)",flag:"🇮🇩", region:"Southeast Asia" },
  { code:"ms",    name:"Malay (Bahasa Melayu)",        flag:"🇲🇾", region:"Southeast Asia" },
  { code:"tl",    name:"Filipino (Tagalog)",           flag:"🇵🇭", region:"Southeast Asia" },
  { code:"sw",    name:"Swahili (Kiswahili)",          flag:"🇰🇪", region:"Africa" },
  { code:"am",    name:"Amharic (አማርኛ)",              flag:"🇪🇹", region:"Africa" },
  { code:"yo",    name:"Yoruba (Yorùbá)",              flag:"🇳🇬", region:"Africa" },
  { code:"ha",    name:"Hausa",                       flag:"🇳🇬", region:"Africa" },
  { code:"pt-BR", name:"Brazilian Portuguese",         flag:"🇧🇷", region:"Americas" },
  { code:"es-MX", name:"Mexican Spanish",              flag:"🇲🇽", region:"Americas" },
];

const REGIONS_LIST = ["All", ...new Set(ALL_LANGUAGES.map(l=>l.region))];

export default function LanguageSection({ languageCode, languageName, setLanguage, t, languages = [], loadingLangs = false }) {
  const [search,   setSearch]   = useState("");
  const [region,   setRegion]   = useState("All");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [selected, setSelected] = useState(languageCode || "en");

  // Use DB languages if loaded, else fall back to static list
  const langList = languages.length > 0 ? languages : ALL_LANGUAGES;
  const regions  = ["All", ...new Set(langList.map(l=>l.region))];

  const filtered = langList.filter(l => {
    const mS = l.name.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase());
    const mR = region==="All" || l.region===region;
    return mS && mR;
  });

  const handleSave = async () => {
    const lang = langList.find(l=>l.code===selected);
    if (!lang || selected===languageCode) return;
    setSaving(true);
    try { await setLanguage(lang.code, lang.name); setSaved(true); setTimeout(()=>setSaved(false),2500); }
    finally { setSaving(false); }
  };

  const current = langList.find(l=>l.code===languageCode) || langList[0];

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:"#111", margin:"0 0 4px", letterSpacing:"-0.4px" }}>Language</h2>
        <p style={{ fontSize:13, color:"#6b7280", margin:0 }}>Choose the language for your admin dashboard</p>
      </div>

      {/* Current language badge */}
      <div style={{ background:"#f0fdf4", border:"1.5px solid #bbf7d0", borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:28 }}>{current?.flag}</span>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"#16a34a", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>Current Language</div>
          <div style={{ fontSize:14, fontWeight:700, color:"#111" }}>{current?.name}</div>
        </div>
        {languageCode !== "en" && (
          <button onClick={async()=>{ setSelected("en"); await setLanguage("en","English"); }}
            style={{ marginLeft:"auto", fontSize:12, fontWeight:600, color:"#6b7280", background:"none", border:"1px solid #e4e4e7", borderRadius:8, padding:"5px 10px", cursor:"pointer" }}>
            Reset to English
          </button>
        )}
      </div>

      {/* Search + region */}
      <div style={{ display:"flex", gap:10, marginBottom:14 }}>
        <div style={{ flex:1, position:"relative" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:14 }}>🔍</span>
          <input type="text" placeholder="Search languages..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width:"100%", padding:"9px 12px 9px 32px", borderRadius:9, border:"1.5px solid #e4e4e7", fontSize:13.5, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <select value={region} onChange={e=>setRegion(e.target.value)}
          style={{ padding:"9px 12px", borderRadius:9, border:"1.5px solid #e4e4e7", fontSize:13, color:"#374151", background:"#fff", cursor:"pointer" }}>
          {regions.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Language grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8, maxHeight:420, overflowY:"auto", paddingRight:4, marginBottom:20 }}>
        {loadingLangs ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"32px 0", color:"#9ca3af", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <span style={{ width:16, height:16, border:"2px solid #e4e4e7", borderTopColor:"#635bff", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }}/>
            Loading languages...
          </div>
        ) : filtered.map(lang => {
          const isSel = selected === lang.code;
          const isCur = languageCode === lang.code;
          return (
            <button key={lang.code} onClick={()=>setSelected(lang.code)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", border:`1.5px solid ${isSel?"#635bff":isCur?"#16a34a":"#e4e4e7"}`, borderRadius:10, background:isSel?"#ede9fe":isCur?"#f0fdf4":"#fff", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{lang.flag}</span>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:isSel?"#635bff":isCur?"#16a34a":"#111", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lang.nativeName || lang.name}</div>
                <div style={{ fontSize:10.5, color:"#9ca3af" }}>{lang.code.toUpperCase()} · {lang.region}</div>
              </div>
              {(isSel||isCur) && (
                <div style={{ marginLeft:"auto", flexShrink:0, width:18, height:18, borderRadius:"50%", background:isSel?"#635bff":"#16a34a", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:"#fff", fontSize:10, fontWeight:900 }}>✓</span>
                </div>
              )}
            </button>
          );
        })}
        {!loadingLangs && filtered.length===0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"32px 0", color:"#9ca3af", fontSize:13 }}>No languages found</div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving||selected===languageCode}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"11px 28px", background:saving||selected===languageCode?"#d1d5db":"#111", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:saving||selected===languageCode?"not-allowed":"pointer" }}>
        {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Language"}
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}