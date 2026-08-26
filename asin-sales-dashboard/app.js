    const state = {
      data: null,
      currency: "USD",
      search: "",
      historySearch: "",
      mapSearch: "",
      timeSearch: "",
      inventorySearch: "",
      adSearch: "",
      adPeriod: "all",
      dailyAdMonth: "",
      dailyAdSort: { key: "date", direction: "desc" },
      refundTab: "recent",
      refundMonth: "",
      adSort: {
        campaign: { key: "", direction: "" },
        term: { key: "", direction: "" },
        asin: { key: "", direction: "" }
      },
      historySort: { key: "", direction: "" },
      historySeriesVisible: { sales: true, adSales: true, adSpend: true },
      inventoryRisk: "",
      inventorySort: { key: "riskScore", direction: "desc" },
      mapZoom: 1,
      mapPanX: 0,
      mapPanY: 0,
      heatMonths: [],
      sort: { type: "month", key: "current", direction: "desc" }
    };

    const numberFmt = new Intl.NumberFormat("zh-CN");
    let inventoryData = window.INVENTORY_DATA || { metadata: {}, summary: {}, records: [], parentRelations: {} };
    let inventoryRecords = inventoryData.records || [];
    let inventorySummary = inventoryData.summary || {};
    let adData = window.AD_DATA || { metadata: {}, dailyTotals: [], asinDailyTotals: {}, monthlyTotals: [], currentTerms: [], currentCampaigns: [] };
    let currentAdTableRows = { campaign: [], term: [], asin: [] };
    const INVENTORY_COST_KEY = "inventory-aging-dashboard-costs-rmb-v1";
    const INVENTORY_COST_BACKUP_KEY = "inventory-aging-dashboard-costs-rmb-backup-v1";
    const INVENTORY_RATE_KEY = "inventory-aging-dashboard-usd-cny-rate-v1";
    const HEAT_NOTES_KEY = "asin-sales-dashboard-heat-notes-v1";
    const DEFAULT_USD_CNY_RATE = 6.77;
    const inventoryTagLabels = {
      low_stock: "低库存",
      aged: "老库存",
      slow: "滞销",
      fee: "库龄费",
      replenish: "需补货",
      missing_cost: "未录成本"
    };
    const inventoryTagClasses = {
      low_stock: "low",
      aged: "aged",
      slow: "slow",
      fee: "fee",
      replenish: "",
      missing_cost: "slow"
    };
    let inventoryCosts = loadInventoryCosts();
    let inventoryUsdCnyRate = loadInventoryExchangeRate();
    let heatNotes = loadHeatNotes();
    let activeHeatNote = null;
    const MAP_WIDTH = 1000;
    const MAP_HEIGHT = 640;
    const mapDrag = {
      active: false,
      pointerId: null,
      startClientX: 0,
      startClientY: 0,
      startPanX: 0,
      startPanY: 0,
      scaleX: 1,
      scaleY: 1
    };
    const countryNames = {
      US: { en: "United States", zh: "美国" },
      CA: { en: "Canada", zh: "加拿大" },
      MX: { en: "Mexico", zh: "墨西哥" }
    };
    const regionAliases = {
      US: {
        AL: "AL", ALABAMA: "AL", AK: "AK", ALASKA: "AK", AZ: "AZ", ARIZONA: "AZ", AR: "AR", ARKANSAS: "AR",
        CA: "CA", CALIFORNIA: "CA", CO: "CO", COLORADO: "CO", CT: "CT", CONNECTICUT: "CT", DE: "DE", DELAWARE: "DE",
        FL: "FL", FLORIDA: "FL", GA: "GA", GEORGIA: "GA", HI: "HI", HAWAII: "HI", ID: "ID", IDAHO: "ID",
        IL: "IL", ILLINOIS: "IL", IN: "IN", INDIANA: "IN", IA: "IA", IOWA: "IA", KS: "KS", KANSAS: "KS",
        KY: "KY", KENTUCKY: "KY", LA: "LA", LOUISIANA: "LA", ME: "ME", MAINE: "ME", MD: "MD", MARYLAND: "MD",
        MA: "MA", MASSACHUSETTS: "MA", MI: "MI", MICHIGAN: "MI", MN: "MN", MINNESOTA: "MN", MS: "MS", MISSISSIPPI: "MS",
        MO: "MO", MISSOURI: "MO", MT: "MT", MONTANA: "MT", NE: "NE", NEBRASKA: "NE", NV: "NV", NEVADA: "NV",
        NH: "NH", "NEW HAMPSHIRE": "NH", NJ: "NJ", "NEW JERSEY": "NJ", NM: "NM", "NEW MEXICO": "NM",
        NY: "NY", "NEW YORK": "NY", NC: "NC", "NORTH CAROLINA": "NC", ND: "ND", "NORTH DAKOTA": "ND",
        OH: "OH", OHIO: "OH", OK: "OK", OKLAHOMA: "OK", OR: "OR", OREGON: "OR", PA: "PA", PENNSYLVANIA: "PA",
        RI: "RI", "RHODE ISLAND": "RI", SC: "SC", "SOUTH CAROLINA": "SC", SD: "SD", "SOUTH DAKOTA": "SD",
        TN: "TN", TENNESSEE: "TN", TX: "TX", TEXAS: "TX", UT: "UT", UTAH: "UT", VT: "VT", VERMONT: "VT",
        VA: "VA", VIRGINIA: "VA", WA: "WA", WASHINGTON: "WA", WV: "WV", "WEST VIRGINIA": "WV",
        WI: "WI", WISCONSIN: "WI", WY: "WY", WYOMING: "WY", DC: "DC", "DISTRICT OF COLUMBIA": "DC"
      },
      CA: {
        AB: "AB", ALBERTA: "AB", BC: "BC", "BRITISH COLUMBIA": "BC", MB: "MB", MANITOBA: "MB",
        NB: "NB", "NEW BRUNSWICK": "NB", NL: "NL", "NEWFOUNDLAND AND LABRADOR": "NL", NS: "NS", "NOVA SCOTIA": "NS",
        NT: "NT", "NORTHWEST TERRITORIES": "NT", NU: "NU", NUNAVUT: "NU", ON: "ON", ONTARIO: "ON",
        PE: "PE", "PRINCE EDWARD ISLAND": "PE", QC: "QC", QUEBEC: "QC", SK: "SK", SASKATCHEWAN: "SK",
        YT: "YT", YUKON: "YT"
      },
      MX: {
        AGUASCALIENTES: "AGUASCALIENTES", "BAJA CALIFORNIA": "BAJA CALIFORNIA", "BAJA CALIFORNIA SUR": "BAJA CALIFORNIA SUR",
        CAMPECHE: "CAMPECHE", CHIAPAS: "CHIAPAS", CHIHUAHUA: "CHIHUAHUA", "CIUDAD DE MEXICO": "CIUDAD DE MEXICO",
        "CIUDAD DE MÉXICO": "CIUDAD DE MEXICO", COAHUILA: "COAHUILA", COLIMA: "COLIMA", DURANGO: "DURANGO",
        GUANAJUATO: "GUANAJUATO", GUERRERO: "GUERRERO", HIDALGO: "HIDALGO", JALISCO: "JALISCO",
        MEXICO: "MEXICO", "ESTADO DE MEXICO": "MEXICO", MICHOACAN: "MICHOACAN", "MICHOACÁN": "MICHOACAN",
        MORELOS: "MORELOS", NAYARIT: "NAYARIT", "NUEVO LEON": "NUEVO LEON", "NUEVO LEÓN": "NUEVO LEON",
        OAXACA: "OAXACA", PUEBLA: "PUEBLA", QUERETARO: "QUERETARO", "QUERÉTARO": "QUERETARO",
        "QUINTANA ROO": "QUINTANA ROO", "SAN LUIS POTOSI": "SAN LUIS POTOSI", "SAN LUIS POTOSÍ": "SAN LUIS POTOSI",
        SINALOA: "SINALOA", SONORA: "SONORA", TABASCO: "TABASCO", TAMAULIPAS: "TAMAULIPAS",
        TLAXCALA: "TLAXCALA", VERACRUZ: "VERACRUZ", YUCATAN: "YUCATAN", "YUCATÁN": "YUCATAN", ZACATECAS: "ZACATECAS"
      }
    };
    const regionMeta = {
      US: {
        AL: ["Alabama", "阿拉巴马州", 626, 336], AK: ["Alaska", "阿拉斯加州", 150, 408], AZ: ["Arizona", "亚利桑那州", 356, 336],
        AR: ["Arkansas", "阿肯色州", 565, 324], CA: ["California", "加利福尼亚州", 255, 300], CO: ["Colorado", "科罗拉多州", 432, 275],
        CT: ["Connecticut", "康涅狄格州", 785, 230], DE: ["Delaware", "特拉华州", 759, 282], FL: ["Florida", "佛罗里达州", 690, 405],
        GA: ["Georgia", "佐治亚州", 655, 352], HI: ["Hawaii", "夏威夷州", 285, 450], ID: ["Idaho", "爱达荷州", 342, 205],
        IL: ["Illinois", "伊利诺伊州", 598, 270], IN: ["Indiana", "印第安纳州", 635, 266], IA: ["Iowa", "爱荷华州", 560, 242],
        KS: ["Kansas", "堪萨斯州", 500, 294], KY: ["Kentucky", "肯塔基州", 640, 303], LA: ["Louisiana", "路易斯安那州", 560, 376],
        ME: ["Maine", "缅因州", 815, 169], MD: ["Maryland", "马里兰州", 745, 287], MA: ["Massachusetts", "马萨诸塞州", 793, 218],
        MI: ["Michigan", "密歇根州", 635, 210], MN: ["Minnesota", "明尼苏达州", 550, 190], MS: ["Mississippi", "密西西比州", 592, 353],
        MO: ["Missouri", "密苏里州", 560, 294], MT: ["Montana", "蒙大拿州", 395, 180], NE: ["Nebraska", "内布拉斯加州", 500, 258],
        NV: ["Nevada", "内华达州", 315, 282], NH: ["New Hampshire", "新罕布什尔州", 785, 196], NJ: ["New Jersey", "新泽西州", 758, 263],
        NM: ["New Mexico", "新墨西哥州", 430, 340], NY: ["New York", "纽约州", 742, 219], NC: ["North Carolina", "北卡罗来纳州", 700, 324],
        ND: ["North Dakota", "北达科他州", 500, 168], OH: ["Ohio", "俄亥俄州", 668, 259], OK: ["Oklahoma", "俄克拉荷马州", 505, 325],
        OR: ["Oregon", "俄勒冈州", 285, 220], PA: ["Pennsylvania", "宾夕法尼亚州", 720, 250], RI: ["Rhode Island", "罗德岛州", 807, 226],
        SC: ["South Carolina", "南卡罗来纳州", 690, 342], SD: ["South Dakota", "南达科他州", 500, 214], TN: ["Tennessee", "田纳西州", 625, 320],
        TX: ["Texas", "得克萨斯州", 500, 390], UT: ["Utah", "犹他州", 370, 282], VT: ["Vermont", "佛蒙特州", 773, 193],
        VA: ["Virginia", "弗吉尼亚州", 720, 300], WA: ["Washington", "华盛顿州", 292, 180], WV: ["West Virginia", "西弗吉尼亚州", 690, 288],
        WI: ["Wisconsin", "威斯康星州", 595, 215], WY: ["Wyoming", "怀俄明州", 420, 230], DC: ["District of Columbia", "哥伦比亚特区", 740, 292]
      },
      CA: {
        AB: ["Alberta", "阿尔伯塔省", 395, 92], BC: ["British Columbia", "不列颠哥伦比亚省", 315, 105], MB: ["Manitoba", "曼尼托巴省", 540, 98],
        NB: ["New Brunswick", "新不伦瑞克省", 800, 140], NL: ["Newfoundland and Labrador", "纽芬兰与拉布拉多省", 870, 105],
        NS: ["Nova Scotia", "新斯科舍省", 825, 158], NT: ["Northwest Territories", "西北地区", 460, 46], NU: ["Nunavut", "努纳武特地区", 620, 38],
        ON: ["Ontario", "安大略省", 660, 135], PE: ["Prince Edward Island", "爱德华王子岛省", 827, 145], QC: ["Quebec", "魁北克省", 740, 110],
        SK: ["Saskatchewan", "萨斯喀彻温省", 470, 105], YT: ["Yukon", "育空地区", 325, 50]
      },
      MX: {
        AGUASCALIENTES: ["Aguascalientes", "阿瓜斯卡连特斯州", 438, 446], "BAJA CALIFORNIA": ["Baja California", "下加利福尼亚州", 230, 385],
        "BAJA CALIFORNIA SUR": ["Baja California Sur", "南下加利福尼亚州", 270, 455], CAMPECHE: ["Campeche", "坎佩切州", 590, 480],
        CHIAPAS: ["Chiapas", "恰帕斯州", 555, 500], CHIHUAHUA: ["Chihuahua", "奇瓦瓦州", 355, 390], "CIUDAD DE MEXICO": ["Mexico City", "墨西哥城", 480, 462],
        COAHUILA: ["Coahuila", "科阿韦拉州", 450, 390], COLIMA: ["Colima", "科利马州", 425, 468], DURANGO: ["Durango", "杜兰戈州", 410, 420],
        GUANAJUATO: ["Guanajuato", "瓜纳华托州", 458, 450], GUERRERO: ["Guerrero", "格雷罗州", 480, 488], HIDALGO: ["Hidalgo", "伊达尔戈州", 500, 452],
        JALISCO: ["Jalisco", "哈利斯科州", 420, 455], MEXICO: ["Mexico State", "墨西哥州", 485, 468], MICHOACAN: ["Michoacan", "米却肯州", 450, 472],
        MORELOS: ["Morelos", "莫雷洛斯州", 492, 476], NAYARIT: ["Nayarit", "纳亚里特州", 390, 445], "NUEVO LEON": ["Nuevo Leon", "新莱昂州", 495, 405],
        OAXACA: ["Oaxaca", "瓦哈卡州", 520, 495], PUEBLA: ["Puebla", "普埃布拉州", 510, 470], QUERETARO: ["Queretaro", "克雷塔罗州", 478, 448],
        "QUINTANA ROO": ["Quintana Roo", "金塔纳罗奥州", 632, 475], "SAN LUIS POTOSI": ["San Luis Potosi", "圣路易斯波托西州", 485, 432],
        SINALOA: ["Sinaloa", "锡那罗亚州", 365, 430], SONORA: ["Sonora", "索诺拉州", 315, 380], TABASCO: ["Tabasco", "塔巴斯科州", 570, 490],
        TAMAULIPAS: ["Tamaulipas", "塔毛利帕斯州", 520, 425], TLAXCALA: ["Tlaxcala", "特拉斯卡拉州", 508, 462], VERACRUZ: ["Veracruz", "韦拉克鲁斯州", 535, 465],
        YUCATAN: ["Yucatan", "尤卡坦州", 610, 462], ZACATECAS: ["Zacatecas", "萨卡特卡斯州", 440, 430]
      }
    };
    const regionShortCodes = {
      MX: {
        AGUASCALIENTES: "AGS",
        "BAJA CALIFORNIA": "BC",
        "BAJA CALIFORNIA SUR": "BCS",
        CAMPECHE: "CAMP",
        CHIAPAS: "CHIS",
        CHIHUAHUA: "CHIH",
        "CIUDAD DE MEXICO": "CDMX",
        COAHUILA: "COAH",
        COLIMA: "COL",
        DURANGO: "DGO",
        GUANAJUATO: "GTO",
        GUERRERO: "GRO",
        HIDALGO: "HGO",
        JALISCO: "JAL",
        MEXICO: "MEX",
        MICHOACAN: "MICH",
        MORELOS: "MOR",
        NAYARIT: "NAY",
        "NUEVO LEON": "NL",
        OAXACA: "OAX",
        PUEBLA: "PUE",
        QUERETARO: "QRO",
        "QUINTANA ROO": "QROO",
        "SAN LUIS POTOSI": "SLP",
        SINALOA: "SIN",
        SONORA: "SON",
        TABASCO: "TAB",
        TAMAULIPAS: "TAMPS",
        TLAXCALA: "TLAX",
        VERACRUZ: "VER",
        YUCATAN: "YUC",
        ZACATECAS: "ZAC"
      }
    };

    function currencyOrder(currency) {
      return currency === "USD" ? "0-USD" : `1-${currency}`;
    }

    function orderedCurrencies(currencies) {
      return (currencies || [])
        .filter(currency => currency !== "UNKNOWN")
        .slice()
        .sort((a, b) => currencyOrder(a).localeCompare(currencyOrder(b)));
    }

    function fmtMoney(value, currency) {
      const amount = Number(value || 0);
      if (currency === "UNKNOWN") return `${amount.toLocaleString("zh-CN", { maximumFractionDigits: 2 })} 未知币种`;
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 2
        }).format(amount);
      } catch (_err) {
        return `${currency} ${amount.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
      }
    }

    function fmtHeatMoney(value, currency) {
      const amount = Number(value || 0);
      if (currency === "UNKNOWN") return `${amount.toFixed(2)} 未知`;
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(amount);
      } catch (_err) {
        return `${currency} ${amount.toFixed(2)}`;
      }
    }

    function loadInventoryCosts() {
      try {
        return JSON.parse(localStorage.getItem(INVENTORY_COST_KEY) || "{}") || {};
      } catch (_err) {
        return {};
      }
    }

    function saveInventoryCosts() {
      localStorage.setItem(INVENTORY_COST_KEY, JSON.stringify(inventoryCosts));
      localStorage.setItem(INVENTORY_COST_BACKUP_KEY, JSON.stringify({
        savedAt: new Date().toISOString(),
        currency: "RMB",
        costs: inventoryCosts
      }));
    }

    function loadInventoryExchangeRate() {
      const saved = Number(localStorage.getItem(INVENTORY_RATE_KEY));
      return Number.isFinite(saved) && saved > 0 ? saved : DEFAULT_USD_CNY_RATE;
    }

    function loadHeatNotes() {
      try {
        return JSON.parse(localStorage.getItem(HEAT_NOTES_KEY) || "{}") || {};
      } catch (_err) {
        return {};
      }
    }

    function saveHeatNotes() {
      localStorage.setItem(HEAT_NOTES_KEY, JSON.stringify(heatNotes));
    }

    function heatNoteKey(asin, date, currency = state.currency) {
      return [currency || "", String(asin || "").toUpperCase(), date || ""].join("|");
    }

    function heatNoteValue(key) {
      return String(heatNotes[key] || "").trim();
    }

    function cssEscapeValue(value) {
      return window.CSS && typeof CSS.escape === "function"
        ? CSS.escape(value)
        : String(value).replace(/["\\]/g, "\\$&");
    }

    function setHeatNoteValue(key, value) {
      const note = String(value || "").trim();
      if (note) heatNotes[key] = note;
      else delete heatNotes[key];
      saveHeatNotes();
      updateHeatNoteCell(key);
    }

    function updateHeatNoteCell(key) {
      const cell = document.querySelector(`#heatBody .heat[data-note-key="${cssEscapeValue(key)}"]`);
      if (!cell) return;
      const note = heatNoteValue(key);
      cell.classList.toggle("has-note", Boolean(note));
      if (note) cell.setAttribute("title", note);
      else cell.removeAttribute("title");
    }

    function positionHeatNoteEditor(editor, heatCell) {
      const rect = heatCell.getBoundingClientRect();
      const gap = 8;
      const width = Math.min(320, window.innerWidth - 28);
      const left = Math.min(Math.max(14, rect.left), window.innerWidth - width - 14);
      const top = Math.min(rect.bottom + gap, window.innerHeight - 210);
      editor.style.left = `${left}px`;
      editor.style.top = `${Math.max(14, top)}px`;
    }

    function openHeatNoteEditor(heatCell) {
      closeHeatNoteEditor(true);
      const key = heatCell.dataset.noteKey;
      if (!key) return;
      const editor = document.getElementById("heatNoteEditor");
      const textarea = document.getElementById("heatNoteText");
      activeHeatNote = { key, original: heatNoteValue(key) };
      textarea.value = activeHeatNote.original;
      positionHeatNoteEditor(editor, heatCell);
      editor.classList.add("open");
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.selectionStart = textarea.value.length;
        textarea.selectionEnd = textarea.value.length;
      });
    }

    function closeHeatNoteEditor(save = true) {
      const editor = document.getElementById("heatNoteEditor");
      if (!editor || !editor.classList.contains("open")) return;
      const textarea = document.getElementById("heatNoteText");
      if (save && activeHeatNote) {
        const next = textarea.value.trim();
        if (next !== activeHeatNote.original) setHeatNoteValue(activeHeatNote.key, next);
      }
      editor.classList.remove("open");
      activeHeatNote = null;
    }

    function inventoryMoney(value, currency = inventorySummary.currency || "USD") {
      return fmtMoney(value, currency);
    }

    function inventoryNumber(value, digits = 0) {
      return Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: digits });
    }

    function fmtPercent(value) {
      return `${Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}%`;
    }

    function adRowsMatchSearch(row, query) {
      const tokens = String(query || "")
        .split(/[\s,，;；]+/)
        .map(token => token.trim().toLowerCase())
        .filter(Boolean);
      if (!tokens.length) return true;
      const text = [
        row.term,
        row.targets?.join(" "),
        row.matchTypes?.join(" "),
        row.campaign,
        row.asinTarget,
        row.portfolio
      ].join(" ").toLowerCase();
      return tokens.some(token => text.includes(token));
    }

    function adTermAsin(term) {
      const match = String(term || "").trim().toUpperCase().match(/^(B0[A-Z0-9]{8})/);
      return match ? match[1] : "";
    }

    function adMetricCells(row) {
      return `
        <td>${numberFmt.format(row.impressions || 0)}</td>
        <td>${numberFmt.format(row.clicks || 0)}</td>
        <td>${numberFmt.format(row.orders || 0)}</td>
        <td>${fmtMoney(row.sales || 0, row.currency)}</td>
        <td>${fmtMoney(row.spend || 0, row.currency)}</td>
        <td>${fmtPercent(row.ctr)}</td>
        <td>${fmtPercent(row.cvr)}</td>
        <td>${fmtPercent(row.acos)}</td>
      `;
    }

    function emptyAdMetric(currency = "USD") {
      return {
        currency,
        impressions: 0,
        clicks: 0,
        spend: 0,
        orders: 0,
        sales: 0,
        ctr: 0,
        cpc: 0,
        acos: 0,
        roas: 0,
        cvr: 0,
        avgSearchImpressionShare: 0
      };
    }

    function combineAdMetrics(rows, currency = "USD") {
      const combined = rows.reduce((total, row) => {
        total.impressions += Number(row.impressions || 0);
        total.clicks += Number(row.clicks || 0);
        total.spend += Number(row.spend || 0);
        total.orders += Number(row.orders || 0);
        total.sales += Number(row.sales || 0);
        const share = Number(row.avgSearchImpressionShare || 0);
        if (share) {
          total.shareSum += share;
          total.shareCount += 1;
        }
        return total;
      }, { ...emptyAdMetric(currency), shareSum: 0, shareCount: 0 });
      combined.ctr = combined.impressions ? combined.clicks / combined.impressions * 100 : 0;
      combined.cpc = combined.clicks ? combined.spend / combined.clicks : 0;
      combined.acos = combined.sales ? combined.spend / combined.sales * 100 : 0;
      combined.roas = combined.spend ? combined.sales / combined.spend : 0;
      combined.cvr = combined.clicks ? combined.orders / combined.clicks * 100 : 0;
      combined.avgSearchImpressionShare = combined.shareCount ? combined.shareSum / combined.shareCount : 0;
      delete combined.shareSum;
      delete combined.shareCount;
      return combined;
    }

    function currentAdCurrency() {
      const currencies = adData.metadata?.currencies || [];
      return currencies.includes(state.currency) ? state.currency : (currencies.includes("USD") ? "USD" : currencies[0] || state.currency || "USD");
    }

    function adParentRelations() {
      return adData.portfolioAsinMap || { parentByChild: {}, childrenByParent: {} };
    }

    function adAsinsForTokens(tokens) {
      const source = adData.asinMonthlyTotals || {};
      if (!tokens.length) return Object.keys(source);
      const relations = adParentRelations();
      const parentByChild = relations.parentByChild || {};
      const childrenByParent = relations.childrenByParent || {};
      const matched = new Set();
      Object.keys(source).forEach(asin => {
        tokens.forEach(token => {
          const parent = parentByChild[asin] || "";
          if (
            categoryMatchesAsin(asin, token, adData.categoryRelations || {})
            || asin.includes(token)
            || parent.includes(token)
            || (childrenByParent[token] || []).includes(asin)
          ) {
            matched.add(asin);
          }
        });
      });
      tokens.forEach(token => {
        const category = categoryForFilterToken(token);
        if (category) {
          ((adData.categoryRelations || {}).categoryToRootAsins?.[category] || []).forEach(asin => {
            if (source[asin]) matched.add(asin);
          });
          ((adData.categoryRelations || {}).categoryToAsins?.[category] || []).forEach(asin => {
            if (source[asin]) matched.add(asin);
            if (parentByChild[asin] && source[parentByChild[asin]]) matched.add(parentByChild[asin]);
          });
        }
        if (source[token]) matched.add(token);
        if (parentByChild[token] && source[parentByChild[token]]) matched.add(parentByChild[token]);
      });
      return [...matched];
    }

    function selectedAdAsins() {
      return adAsinsForTokens(splitAsinTokens(state.search));
    }

    function adAvailablePeriods() {
      return ["all", ...(adData.metadata?.months || [])];
    }

    function adPeriodLabel(period) {
      return period === "all" ? "整体数据" : monthLabel(period);
    }

    function renderAdPeriodOptions() {
      const select = document.getElementById("adPeriod");
      if (!select) return;
      const periods = adAvailablePeriods();
      if (!periods.includes(state.adPeriod)) state.adPeriod = "all";
      select.innerHTML = periods.map(period => `
        <option value="${escapeHtml(period)}">${escapeHtml(adPeriodLabel(period))}</option>
      `).join("");
      select.value = state.adPeriod;
    }

    function mergeAdRows(rows, keyField) {
      const grouped = new Map();
      rows.forEach(row => {
        const key = row[keyField] || "(blank)";
        const current = grouped.get(key) || {
          [keyField]: key,
          currency: row.currency || currentAdCurrency(),
          targets: new Set(),
          matchTypes: new Set(),
          campaignCount: 0,
          adGroupCount: 0,
          portfolio: row.portfolio || "",
          rows: []
        };
        (row.targets || []).forEach(value => current.targets.add(value));
        (row.matchTypes || []).forEach(value => current.matchTypes.add(value));
        current.campaignCount += Number(row.campaignCount || 0);
        current.adGroupCount += Number(row.adGroupCount || 0);
        if (!current.portfolio && row.portfolio) current.portfolio = row.portfolio;
        current.rows.push(row);
        grouped.set(key, current);
      });
      return [...grouped.values()].map(group => ({
        ...combineAdMetrics(group.rows, group.currency),
        [keyField]: group[keyField],
        currency: group.currency,
        targets: [...group.targets].sort(),
        matchTypes: [...group.matchTypes].sort(),
        campaignCount: group.campaignCount,
        adGroupCount: group.adGroupCount,
        portfolio: group.portfolio
      })).sort((a, b) => b.spend - a.spend || b.sales - a.sales || b.clicks - a.clicks || String(a[keyField]).localeCompare(String(b[keyField])));
    }

    function adSortValue(row, key) {
      if (key === "campaign" || key === "term" || key === "asinTarget") {
        return String(row[key] || "").toUpperCase();
      }
      return Number(row[key] || 0);
    }

    function sortAdRows(table, rows) {
      const sort = state.adSort?.[table] || {};
      if (!sort.key || !sort.direction) return rows;
      const direction = sort.direction === "asc" ? 1 : -1;
      return rows.map((row, index) => ({ row, index })).sort((a, b) => {
        const aValue = adSortValue(a.row, sort.key);
        const bValue = adSortValue(b.row, sort.key);
        const result = typeof aValue === "string"
          ? aValue.localeCompare(String(bValue), "zh-CN")
          : aValue - Number(bValue || 0);
        return result ? result * direction : a.index - b.index;
      }).map(item => item.row);
    }

    function cycleAdSort(table, key) {
      const current = state.adSort[table] || { key: "", direction: "" };
      if (current.key !== key) {
        state.adSort[table] = { key, direction: "asc" };
      } else if (current.direction === "asc") {
        state.adSort[table] = { key, direction: "desc" };
      } else {
        state.adSort[table] = { key: "", direction: "" };
      }
      renderAdPerformance();
    }

    function updateAdSortButtons() {
      document.querySelectorAll("[data-ad-sort-table]").forEach(button => {
        const table = button.dataset.adSortTable;
        const key = button.dataset.adSortKey;
        const sort = state.adSort?.[table] || {};
        const active = sort.key === key && sort.direction;
        const mark = button.querySelector(".sort-mark");
        if (mark) mark.textContent = active ? (sort.direction === "asc" ? "▲" : "▼") : "";
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function adCopyCell(value) {
      const text = String(value || "");
      const safeText = escapeHtml(text);
      return `<td class="ad-copy-cell" data-ad-copy="${safeText}" title="点击复制：${safeText}">${safeText}</td>`;
    }

    async function copyAdField(value) {
      const text = String(value || "").trim();
      if (!text) return;
      try {
        await copyText(text);
        showToast(`已复制 ${text}`);
      } catch (_err) {
        showToast("复制失败，请手动选择文本");
      }
    }

    function csvCell(value) {
      return `"${String(value ?? "").replace(/"/g, '""')}"`;
    }

    function downloadCsv(filename, rows) {
      const blob = new Blob(["\ufeff" + rows.map(row => row.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      link.remove();
    }

    function exportAdTable(table) {
      const config = {
        campaign: { label: "广告活动", key: "campaign", filename: "ad-campaigns" },
        term: { label: "搜索词", key: "term", filename: "ad-search-terms" },
        asin: { label: "ASIN", key: "asinTarget", filename: "ad-asin-targets" }
      }[table];
      if (!config) return;
      const rows = currentAdTableRows[table] || [];
      if (!rows.length) {
        showToast("当前没有可导出的广告数据");
        return;
      }
      const header = [config.label, "曝光", "点击", "订单", "销售额", "花费", "CTR", "CVR", "ACOS"];
      const body = rows.map(row => [
        row[config.key] || "",
        row.impressions || 0,
        row.clicks || 0,
        row.orders || 0,
        Number(row.sales || 0).toFixed(2),
        Number(row.spend || 0).toFixed(2),
        Number(row.ctr || 0).toFixed(2),
        Number(row.cvr || 0).toFixed(2),
        Number(row.acos || 0).toFixed(2)
      ]);
      const period = state.adPeriod || "all";
      const scope = splitAsinTokens(state.search).length ? splitAsinTokens(state.search).join("-") : "all";
      downloadCsv(`${config.filename}-${period}-${scope}.csv`, [header, ...body]);
      showToast(`${config.label} CSV 已导出`);
    }

    function adCurrentMetric() {
      return adMetricForPeriod(state.adPeriod || "all", currentAdCurrency());
    }

    function renderAdPerformance() {
      const meta = adData.metadata || {};
      renderAdPeriodOptions();
      const current = adCurrentMetric();
      const currency = current.currency || "USD";
      const query = state.adSearch.trim();
      const asinTokens = splitAsinTokens(state.search);
      const asins = selectedAdAsins();
      const period = state.adPeriod || "all";
      const periodLabel = adPeriodLabel(period);
      const termSource = asinTokens.length
        ? mergeAdRows(asins.flatMap(asin => ((adData.termsByPeriodAsin || {})[asin] || {})[period] || []), "term")
        : ((adData.termsByPeriod || {})[period] || (period === meta.currentMonth ? adData.currentTerms || [] : []));
      const campaignSource = asinTokens.length
        ? mergeAdRows(asins.flatMap(asin => ((adData.campaignsByPeriodAsin || {})[asin] || {})[period] || []), "campaign")
        : ((adData.campaignsByPeriod || {})[period] || (period === meta.currentMonth ? adData.currentCampaigns || [] : []));
      const termRows = termSource.filter(row => !adTermAsin(row.term));
      const asinRows = mergeAdRows(
        termSource
          .filter(row => adTermAsin(row.term))
          .map(row => ({ ...row, asinTarget: adTermAsin(row.term) })),
        "asinTarget"
      );
      const terms = sortAdRows("term", termRows.filter(row => adRowsMatchSearch(row, query)));
      const asinTargets = sortAdRows("asin", asinRows.filter(row => adRowsMatchSearch(row, query)));
      const campaigns = sortAdRows("campaign", campaignSource.filter(row => adRowsMatchSearch(row, query)));
      currentAdTableRows = { campaign: campaigns, term: terms, asin: asinTargets };

      document.getElementById("adSearch").value = state.adSearch;
      document.getElementById("adCampaignTitle").textContent = "广告活动";
      document.getElementById("adTermTitle").textContent = "搜索词";
      document.getElementById("adAsinTitle").textContent = "ASIN";
      const adScope = asinTokens.length
        ? `当前按 ASIN 筛选广告归属，匹配 ${numberFmt.format(asins.length)} 个广告锚定 ASIN。`
        : "";
      document.getElementById("adNote").textContent = meta.rowCount
        ? `${adScope}${periodLabel} 搜索词展示份额广告报告；数据范围 ${meta.dateRange?.start || "-"} 至 ${meta.dateRange?.end || "-"}，共 ${numberFmt.format(meta.rowCount || 0)} 行。`
        : "没有读取到广告数据，请先生成 ad-data.js。";
      document.getElementById("adSummary").innerHTML = [
        ["广告花费", fmtMoney(current.spend, currency), ""],
        ["广告销售额", fmtMoney(current.sales, currency), ""],
        ["7天订单", numberFmt.format(current.orders || 0), ""],
        ["ACOS", fmtPercent(current.acos), ""],
        ["CTR", fmtPercent(current.ctr), "highlight"],
        ["CVR", fmtPercent(current.cvr), "highlight"]
      ].map(([label, value, className]) => `
        <div class="ad-chip ${className}">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `).join("");

      document.getElementById("adTermBody").innerHTML = terms.map(row => `
        <tr title="${escapeHtml(row.term)}">
          ${adCopyCell(row.term)}
          ${adMetricCells(row)}
        </tr>
      `).join("") || `<tr><td colspan="9" style="text-align:center;color:var(--muted);">没有匹配的搜索词</td></tr>`;

      document.getElementById("adAsinBody").innerHTML = asinTargets.map(row => `
        <tr title="${escapeHtml(row.asinTarget)}">
          ${adCopyCell(row.asinTarget)}
          ${adMetricCells(row)}
        </tr>
      `).join("") || `<tr><td colspan="9" style="text-align:center;color:var(--muted);">没有匹配的 ASIN 投放数据</td></tr>`;

      document.getElementById("adCampaignBody").innerHTML = campaigns.map(row => `
        <tr title="${escapeHtml(row.campaign)}">
          ${adCopyCell(row.campaign)}
          ${adMetricCells(row)}
        </tr>
      `).join("") || `<tr><td colspan="9" style="text-align:center;color:var(--muted);">没有匹配的广告活动</td></tr>`;
      updateAdSortButtons();
    }

    function inventoryParentRelations() {
      return inventoryData.parentRelations || { parentByChild: {}, childrenByParent: {} };
    }

    function inventoryParentForChild(asin) {
      return inventoryParentRelations().parentByChild[String(asin || "").toUpperCase()] || "";
    }

    function inventoryChildrenForParent(parentAsin) {
      return inventoryParentRelations().childrenByParent[String(parentAsin || "").toUpperCase()] || [];
    }

    function inventoryAsinMatchesToken(asin, token) {
      const code = String(asin || "").toUpperCase();
      const parent = inventoryParentForChild(code);
      if (categoryMatchesAsin(code, token, inventoryData.categoryRelations || {})) return true;
      if (code.includes(token) || parent.includes(token)) return true;
      return inventoryChildrenForParent(token).includes(code);
    }

    function inventoryRowMatchesSearch(row, query) {
      const tokens = splitAsinTokens(query);
      if (!tokens.length) return true;
      const text = `${row.sku || ""} ${row.fnsku || ""} ${row.title || ""}`.toUpperCase();
      return tokens.some(token => inventoryAsinMatchesToken(row.asin, token) || text.includes(token));
    }

    function inventoryCostRmb(row) {
      const value = inventoryCosts[row.sku];
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? n : 0;
    }

    function inventoryCostUsd(row) {
      return inventoryCostRmb(row) / inventoryUsdCnyRate;
    }

    function inventoryValue(row) {
      return inventoryCostUsd(row) * Number(row.totalUnits || 0);
    }

    function inventoryAvailableValue(row) {
      return inventoryCostUsd(row) * Number(row.available || 0);
    }

    function inventoryRiskTags(row) {
      const tags = [...(row.riskTags || [])];
      if (!inventoryCostRmb(row)) tags.push("missing_cost");
      return tags;
    }

    function inventoryRiskScore(row) {
      const weights = { fee: 50, aged: 40, slow: 30, low_stock: 25, replenish: 15, missing_cost: 8 };
      return inventoryRiskTags(row).reduce((sum, tag) => sum + (weights[tag] || 0), 0);
    }

    function inventoryAmazonUrl(row) {
      const marketplace = String(row.marketplace || "").trim().toUpperCase();
      const domain = marketplace === "CA"
        ? "www.amazon.ca"
        : marketplace === "MX" || marketplace === "MXN"
          ? "www.amazon.com.mx"
          : "www.amazon.com";
      return `https://${domain}/dp/${encodeURIComponent(row.asin || "")}`;
    }

    function inventoryThumbnailSrc(src) {
      const value = String(src || "").trim();
      if (!value) return "";
      if (/^(?:[a-z][a-z0-9+.-]*:|[\\/])/i.test(value)) return value;
      return `../inventory-aging-dashboard/${value.replace(/^\.?\//, "")}`;
    }

    function inventorySortValue(row, key) {
      if (key === "inventoryValue") return inventoryValue(row);
      if (key === "riskScore") return inventoryRiskScore(row);
      if (key === "fees") return Number(row.storageFeeNextMonth || 0) + Number(row.aisFeeEstimate || 0);
      return row[key];
    }

    function filteredInventoryRows() {
      const query = state.inventorySearch.trim();
      return inventoryRecords.filter(row => {
        if (!inventoryRowMatchesSearch(row, query)) return false;
        if (state.inventoryRisk && !inventoryRiskTags(row).includes(state.inventoryRisk)) return false;
        return true;
      }).sort((a, b) => {
        const aValue = inventorySortValue(a, state.inventorySort.key);
        const bValue = inventorySortValue(b, state.inventorySort.key);
        const result = typeof aValue === "string" || typeof bValue === "string"
          ? String(aValue || "").localeCompare(String(bValue || ""))
          : Number(aValue || 0) - Number(bValue || 0);
        return state.inventorySort.direction === "asc" ? result : -result;
      });
    }

    function renderInventoryRiskTabs() {
      const tabs = document.getElementById("inventoryRiskTabs");
      const items = [
        ["", "全部"],
        ["low_stock", "低库存"],
        ["aged", "老库存"],
        ["slow", "滞销"],
        ["fee", "库龄费"],
        ["replenish", "需补货"],
        ["missing_cost", "未录成本"]
      ];
      tabs.innerHTML = items.map(([key, label]) => `
        <button class="${state.inventoryRisk === key ? "active" : ""}" data-risk="${key}" type="button">${label}</button>
      `).join("");
      tabs.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => {
          state.inventoryRisk = button.dataset.risk;
          renderInventoryDashboard();
        });
      });
    }

    function renderInventoryFilters() {
      document.getElementById("inventorySearch").value = state.inventorySearch;
      renderInventoryRiskTabs();
    }

    function renderInventorySummary(rows) {
      const totalCostValue = rows.reduce((sum, row) => sum + inventoryValue(row), 0);
      const availableCostValue = rows.reduce((sum, row) => sum + inventoryAvailableValue(row), 0);
      const totalUnits = rows.reduce((sum, row) => sum + Number(row.totalUnits || 0), 0);
      const availableUnits = rows.reduce((sum, row) => sum + Number(row.available || 0), 0);
      const reservedUnits = rows.reduce((sum, row) => sum + Number(row.reserved || 0), 0);
      const inboundUnits = rows.reduce((sum, row) => sum + Number(row.inbound || 0), 0);
      const shippedT30 = rows.reduce((sum, row) => sum + Number(row.unitsShippedT30 || 0), 0);
      const aged181Plus = rows.reduce((sum, row) => sum + Number(row.aged181Plus || 0), 0);
      const storageFee = rows.reduce((sum, row) => sum + Number(row.storageFeeNextMonth || 0), 0);
      const aisFee = rows.reduce((sum, row) => sum + Number(row.aisFeeEstimate || 0), 0);
      const retailValue = rows.reduce((sum, row) => sum + Number(row.price || 0) * Number(row.totalUnits || 0), 0);
      const missingCost = rows.filter(row => !inventoryCostRmb(row)).length;
      const costCoverage = rows.length ? Math.round((1 - missingCost / rows.length) * 100) : 0;
      document.getElementById("inventorySummary").innerHTML = [
        ["总库存货值", inventoryMoney(totalCostValue), `RMB成本折USD · 覆盖 ${costCoverage}%`, missingCost ? "warn" : ""],
        ["可售货值", inventoryMoney(availableCostValue), `${inventoryNumber(availableUnits)} 件可售 · 汇率 ${inventoryNumber(inventoryUsdCnyRate, 4)}`, ""],
        ["零售价货值", inventoryMoney(retailValue), "按 your-price 估算", ""],
        ["总库存件数", inventoryNumber(totalUnits), `可售 ${inventoryNumber(availableUnits)} · 预留 ${inventoryNumber(reservedUnits)} · 在途 ${inventoryNumber(inboundUnits)}`, ""],
        ["30天销量", inventoryNumber(shippedT30), `SKU ${inventoryNumber(rows.length)} · ASIN ${inventoryNumber(new Set(rows.map(row => row.asin)).size)}`, ""],
        ["老库存/费用", inventoryNumber(aged181Plus), `仓储费 ${inventoryMoney(storageFee)} · 库龄费 ${inventoryMoney(aisFee)}`, aged181Plus ? "danger" : ""]
      ].map(([label, value, sub, cls]) => `
        <div class="inventory-metric ${cls}">
          <label>${label}</label>
          <strong>${value}</strong>
          <span>${sub}</span>
        </div>
      `).join("");
    }

    function renderInventoryAgeBar(row) {
      const entries = [
        ["0-90", row.age?.["0-90"] || 0, "inventory-a0"],
        ["91-180", row.age?.["91-180"] || 0, "inventory-a1"],
        ["181-270", row.age?.["181-270"] || 0, "inventory-a2"],
        ["271-365", row.age?.["271-365"] || 0, "inventory-a3"],
        ["366-455", row.age?.["366-455"] || 0, "inventory-a4"],
        ["456+", row.age?.["456+"] || 0, "inventory-a5"]
      ];
      const total = Math.max(1, entries.reduce((sum, [, value]) => sum + Number(value || 0), 0));
      const segments = entries.map(([label, value, cls]) => (
        value > 0 ? `<span class="inventory-age-seg ${cls}" style="width:${Math.max(2, value / total * 100)}%" title="${label}: ${value}"></span>` : ""
      )).join("");
      const text = entries.filter(([, value]) => value > 0).map(([label, value]) => `${label}:${value}`).join("  ");
      return `<div class="inventory-age-bar">${segments}</div><div class="inventory-age-text">${text || "无库龄库存"}</div>`;
    }

    function renderInventoryTable(rows) {
      document.getElementById("inventoryRowCount").textContent = `显示 ${rows.length}/${inventoryRecords.length}`;
      const body = document.getElementById("inventoryBody");
      if (!rows.length) {
        body.innerHTML = `<tr><td colspan="11"><div class="inventory-empty">没有匹配的库存记录</div></td></tr>`;
        return;
      }

      body.innerHTML = rows.map(row => {
        const costRmb = inventoryCostRmb(row);
        const costUsd = inventoryCostUsd(row);
        const coverDays = Math.round(Number(row.weeksCoverT30 || 0) * 7);
        const coverDuration = coverDays ? `${Math.floor(coverDays / 30)}月${coverDays % 30}天` : "-";
        const tags = inventoryRiskTags(row);
        const tagHtml = tags.length
          ? tags.map(tag => `<span class="inventory-tag ${inventoryTagClasses[tag] || ""}">${inventoryTagLabels[tag] || tag}</span>`).join("")
          : `<span class="inventory-tag ok">健康</span>`;
        const thumbSrc = inventoryThumbnailSrc(row.thumbnail);
        const thumb = thumbSrc
          ? `<img class="inventory-thumb" src="${escapeHtml(thumbSrc)}" alt="${escapeHtml(row.asin)}">`
          : `<div class="inventory-thumb">PIC</div>`;
        const parentTag = row.parentAsin
          ? `<div><span class="parent-tag">父体 ${escapeHtml(row.parentAsin)}</span></div>`
          : "";
        return `
          <tr>
            <td>
              <div class="inventory-product-cell">
                ${thumb}
                <div>
                  <button type="button" class="inventory-asin" data-asin="${escapeHtml(row.asin)}" title="点击复制 ASIN">${escapeHtml(row.asin)}</button>
                  <div class="inventory-id">SKU ${escapeHtml(row.sku || "-")} | FNSKU ${escapeHtml(row.fnsku || "-")}</div>
                  ${parentTag}
                  <a class="inventory-title" href="${inventoryAmazonUrl(row)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(row.title)}">${escapeHtml(row.title || "-")}</a>
                </div>
              </div>
            </td>
            <td><div class="inventory-tags">${tagHtml}</div></td>
            <td><div class="inventory-num">${inventoryNumber(row.totalUnits)}</div><div class="inventory-muted">FBA总量</div></td>
            <td><div class="inventory-num">${inventoryNumber(row.available)}</div><div class="inventory-muted">${escapeHtml(row.healthStatus || "-")}</div></td>
            <td><div class="inventory-num">${inventoryNumber(row.reserved)} / ${inventoryNumber(row.inbound)}</div><div class="inventory-muted">调拨 ${inventoryNumber(row.fcTransfer)}</div></td>
            <td><div class="inventory-num">${inventoryNumber(row.unitsShippedT30)}</div><div class="inventory-muted">7天 ${inventoryNumber(row.unitsShippedT7)} · 90天 ${inventoryNumber(row.unitsShippedT90)}</div></td>
            <td><div class="inventory-num">${row.daysOfSupply ? inventoryNumber(row.daysOfSupply, 1) : "-"}</div><div class="inventory-muted">${coverDuration}</div></td>
            <td><div class="inventory-num">${inventoryMoney(inventoryValue(row), row.currency)}</div><div class="inventory-muted">零售价 ${inventoryMoney(Number(row.price || 0) * Number(row.totalUnits || 0), row.currency)}</div></td>
            <td><input class="inventory-cost-input" type="number" min="0" step="0.01" value="${costRmb || ""}" data-sku="${escapeHtml(row.sku)}"><div class="inventory-muted">≈ ${inventoryMoney(costUsd, row.currency)}</div></td>
            <td>${renderInventoryAgeBar(row)}</td>
            <td><div class="inventory-num">${inventoryMoney(Number(row.storageFeeNextMonth || 0) + Number(row.aisFeeEstimate || 0), row.currency)}</div><div class="inventory-muted">仓储 ${inventoryMoney(row.storageFeeNextMonth, row.currency)} · 库龄 ${inventoryMoney(row.aisFeeEstimate, row.currency)}</div></td>
          </tr>
        `;
      }).join("");

      document.querySelectorAll("#inventoryBody .inventory-asin").forEach(button => {
        button.addEventListener("click", () => copyAsin(button.dataset.asin));
      });
      document.querySelectorAll("#inventoryBody .inventory-cost-input").forEach(input => {
        input.addEventListener("change", () => {
          const value = Number(input.value);
          if (Number.isFinite(value) && value > 0) inventoryCosts[input.dataset.sku] = Math.round(value * 100) / 100;
          else delete inventoryCosts[input.dataset.sku];
          saveInventoryCosts();
          renderInventoryDashboard();
          showToast("人民币成本已保存");
        });
      });
    }

    function updateInventorySortHeaders() {
      document.querySelectorAll("[data-inventory-sort]").forEach(th => {
        const label = th.textContent.replace(/[▲▼]\s*$/, "");
        th.textContent = th.dataset.inventorySort === state.inventorySort.key
          ? `${label}${state.inventorySort.direction === "asc" ? "▲" : "▼"}`
          : label;
      });
    }

    function renderInventoryDashboard() {
      if (!inventoryRecords.length) {
        document.getElementById("inventoryNote").textContent = "没有读取到库存库龄数据，请先生成 inventory-data.js。";
        return;
      }
      document.getElementById("inventorySnapshotMeta").textContent = `快照日期 ${inventorySummary.snapshotDate || "-"}`;
      document.getElementById("inventorySourceMeta").textContent = `${inventorySummary.skuCount || 0} 个 SKU · ${inventorySummary.asinCount || 0} 个 ASIN`;
      renderInventoryFilters();
      const rows = filteredInventoryRows();
      const tokens = splitAsinTokens(state.inventorySearch);
      document.getElementById("inventoryNote").textContent = tokens.length
        ? `当前按 ASIN 筛选，匹配 ${rows.length} 条库存记录。`
        : `默认展示全部库存库龄记录，共 ${rows.length} 条。`;
      renderInventorySummary(rows);
      renderInventoryTable(rows);
      updateInventorySortHeaders();
    }

    function monthLabel(month) {
      const [year, mm] = month.split("-");
      return `${year.slice(2)}年${Number(mm)}月`;
    }

    function currentMonth() {
      return (state.data.metadata.dateRange.end || "").slice(0, 7);
    }

    function previousMonths(month, count) {
      const [year, mm] = month.split("-").map(Number);
      const months = [];
      for (let i = count; i >= 1; i -= 1) {
        const date = new Date(Date.UTC(year, mm - 1 - i, 1));
        months.push(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`);
      }
      return months;
    }

    function availableSalesMonths() {
      return [...new Set((state.data.periodTotals.monthly || [])
        .map(row => row.period)
        .filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
    }

    function defaultHeatMonths() {
      const available = availableSalesMonths();
      const latest = available.includes(currentMonth())
        ? currentMonth()
        : available[available.length - 1] || currentMonth();
      const earlier = available.filter(month => month !== latest);
      return [earlier[earlier.length - 1] || latest, latest];
    }

    function daysInMonth(month) {
      const end = state.data.metadata.dateRange.end || "";
      const [year, mm] = month.split("-").map(Number);
      const endDay = end.startsWith(month)
        ? Number(end.slice(8, 10))
        : new Date(Date.UTC(year, mm, 0)).getUTCDate();
      return Array.from({ length: endDay }, (_v, idx) => String(idx + 1).padStart(2, "0"));
    }

    function totalsForPeriod(period, currency) {
      return (state.data.periodTotals[period] || [])
        .filter(row => row.currency === currency)
        .slice()
        .sort((a, b) => a.period.localeCompare(b.period));
    }

    function metricForMonth(asin, month, currency) {
      return ((state.data.asinSeries[asin] || {}).monthly || [])
        .find(row => row.currency === currency && row.period === month) || {
          sales: 0,
          units: 0,
          orders: 0,
          lines: 0,
          avgOrderValue: 0
        };
    }

    function metricForDay(asin, date, currency) {
      return ((state.data.asinSeries[asin] || {}).daily || [])
        .find(row => row.currency === currency && row.period === date) || {
          sales: 0,
          units: 0,
          orders: 0
        };
    }

    function sortValue(row, sort) {
      if (sort.type === "asin") return row.asin;
      if (sort.type === "month") return sort.key === "current" ? row.current.sales || 0 : row.months[sort.key]?.sales || 0;
      if (sort.type === "delta") return row.salesDelta || 0;
      if (sort.type === "day") return metricForDay(row.asin, sort.key, state.currency).sales || 0;
      return row.current.sales || 0;
    }

    function applySort(rows) {
      const sort = state.sort;
      return rows.slice().sort((a, b) => {
        const aValue = sortValue(a, sort);
        const bValue = sortValue(b, sort);
        let result;
        if (typeof aValue === "string" || typeof bValue === "string") {
          result = String(aValue).localeCompare(String(bValue));
        } else {
          result = Number(aValue || 0) - Number(bValue || 0);
        }
        if (result === 0) {
          return (b.current.sales || 0) - (a.current.sales || 0) || a.asin.localeCompare(b.asin);
        }
        return sort.direction === "asc" ? result : -result;
      });
    }

    function setSort(type, key) {
      if (state.sort.type === type && state.sort.key === key) {
        state.sort.direction = state.sort.direction === "desc" ? "asc" : "desc";
      } else {
        state.sort = { type, key, direction: type === "asin" ? "asc" : "desc" };
      }
      renderHeatTable();
    }

    function showToast(message) {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => toast.classList.remove("show"), 1400);
    }

    async function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    function escapeHtml(value) {
      return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char]));
    }

    async function copyAsin(asin) {
      try {
        await copyText(asin);
        showToast(`已复制 ${asin}`);
      } catch (_err) {
        showToast("复制失败，请手动选择 ASIN");
      }
    }

    function amazonListingUrl(asin) {
      const domain = state.currency === "CAD"
        ? "www.amazon.ca"
        : state.currency === "MXN"
          ? "www.amazon.com.mx"
          : "www.amazon.com";
      return `https://${domain}/dp/${encodeURIComponent(asin)}`;
    }

    function sortButton(label, type, key) {
      const active = state.sort.type === type && state.sort.key === key;
      const mark = active ? (state.sort.direction === "asc" ? "▲" : "▼") : "";
      return `<button class="sort-btn" data-sort-type="${type}" data-sort-key="${key}" type="button"><span>${label}</span><span class="sort-mark">${mark}</span></button>`;
    }

    function heatMonthHeader(month, index) {
      const otherMonth = state.heatMonths[index === 0 ? 1 : 0];
      const options = availableSalesMonths().slice().reverse().map(item => `
        <option value="${item}" ${item === month ? "selected" : ""} ${item === otherMonth ? "disabled" : ""}>${monthLabel(item)}</option>
      `).join("");
      const active = state.sort.type === "month" && state.sort.key === month;
      const mark = active ? (state.sort.direction === "asc" ? "▲" : "▼") : "↕";
      return `
        <div class="heat-month-head">
          <select class="heat-month-select" data-heat-month-index="${index}" aria-label="选择第 ${index + 1} 个对比月份">${options}</select>
          <button class="heat-month-sort" data-sort-type="month" data-sort-key="${month}" type="button" title="按 ${monthLabel(month)} 销售额排序" aria-label="按 ${monthLabel(month)} 销售额排序">${mark}</button>
        </div>
      `;
    }

    function allAsinRows(currency, months = [previousMonths(currentMonth(), 1)[0], currentMonth()], includeInactive = false) {
      const [previousMonth, month] = months;
      const asins = new Set(Object.keys(state.data.asinTotals));
      if (includeInactive) {
        inventoryRecords.forEach(row => {
          const asin = String(row.asin || "").trim().toUpperCase();
          if (asin) asins.add(asin);
        });
      }
      return [...asins]
        .filter(asin => includeInactive || months.some(item => metricForMonth(asin, item, currency).sales > 0 || metricForMonth(asin, item, currency).units > 0))
        .map(asin => {
          const inventoryRow = inventoryRecords.find(row => String(row.asin || "").toUpperCase() === asin) || {};
          const info = {
            productName: inventoryRow.title || "",
            topSkus: inventoryRow.sku ? [inventoryRow.sku] : [],
            thumbnail: inventoryThumbnailSrc(inventoryRow.thumbnail),
            ...(state.data.asinInfo[asin] || {})
          };
          const current = metricForMonth(asin, month, currency);
          const previous = metricForMonth(asin, previousMonth, currency);
          return {
            asin,
            info,
            parentAsin: parentForChild(asin) || inventoryParentForChild(asin),
            current,
            previous,
            salesDelta: Number(current.sales || 0) - Number(previous.sales || 0),
            unitsDelta: Number(current.units || 0) - Number(previous.units || 0),
            months: Object.fromEntries(months.map(item => [item, metricForMonth(asin, item, currency)]))
          };
        });
    }

    function currentMonthTotal(currency) {
      return totalsForPeriod("monthly", currency).find(row => row.period === currentMonth()) || {
        sales: 0,
        units: 0,
        orders: 0,
        lines: 0,
        avgOrderValue: 0
      };
    }

    function renderCurrencyTabs() {
      const tabs = document.getElementById("currencyTabs");
      tabs.innerHTML = "";
      orderedCurrencies(state.data.metadata.currencies).forEach(currency => {
        const button = document.createElement("button");
        button.textContent = currency;
        button.className = currency === state.currency ? "active" : "";
        button.addEventListener("click", () => {
          state.currency = currency;
          render();
        });
        tabs.appendChild(button);
      });
    }

    function renderOverview() {
      const meta = state.data.metadata;
      const month = currentMonth();
      const total = currentMonthTotal(state.currency);
      const rows = allAsinRows(state.currency).slice().sort((a, b) => (b.current.sales || 0) - (a.current.sales || 0) || a.asin.localeCompare(b.asin));
      const best = rows[0];
      const previousMonth = previousMonths(month, 1)[0];
      const previous = totalsForPeriod("monthly", state.currency).find(row => row.period === previousMonth) || { sales: 0, units: 0 };
      const salesDelta = total.sales - previous.sales;
      const deltaText = salesDelta >= 0 ? `较上月 +${fmtMoney(salesDelta, state.currency)}` : `较上月 ${fmtMoney(salesDelta, state.currency)}`;

      document.getElementById("subtitle").textContent = `${meta.dateRange.start} 至 ${meta.dateRange.end} | ${state.currency}`;
      document.getElementById("overviewNote").textContent = `${monthLabel(month)} 截至 ${meta.dateRange.end}，销售额不含税，排除 Cancelled。`;
      document.getElementById("kpis").innerHTML = [
        ["本月销售额", fmtMoney(total.sales, state.currency), deltaText],
        ["本月销量", numberFmt.format(total.units || 0), `${numberFmt.format(total.orders || 0)} 个订单`],
        ["有销售 ASIN", numberFmt.format(rows.filter(row => row.current.sales > 0 || row.current.units > 0).length), `共 ${numberFmt.format(rows.length)} 个 ASIN`],
        ["客单价", fmtMoney(total.avgOrderValue, state.currency), "按订单数计算"],
        ["TOP ASIN", best ? best.asin : "-", best ? fmtMoney(best.current.sales, state.currency) : "-"],
        ["订单行", numberFmt.format(total.lines || 0), `${monthLabel(month)} 有效行`]
      ].map(([label, value, hint]) => `
        <div class="kpi">
          <label>${label}</label>
          <strong>${value}</strong>
          <span>${hint}</span>
        </div>
      `).join("");
    }

    function heatStyle(value, max) {
      if (!value) return "";
      const ratio = Math.max(0.12, Math.min(1, value / Math.max(max, 1)));
      const light = 92 - ratio * 45;
      const saturation = 48 + ratio * 18;
      return `background:hsl(158  ${saturation}% ${light}%); color:${ratio > 0.55 ? "#ffffff" : "#075047"};`;
    }

    function scrollHeatTableToEnd() {
      requestAnimationFrame(() => {
        const tableShell = document.querySelector(".table-shell");
        if (tableShell) {
          tableShell.scrollLeft = tableShell.scrollWidth;
        }
      });
    }

    function matchesAsinFilter(row, query) {
      const tokens = query
        .split(/[\s,，;；]+/)
        .map(token => token.trim().toLowerCase())
        .filter(Boolean);
      if (!tokens.length) return true;
      const asin = row.asin.toLowerCase();
      return tokens.some(token => asin.includes(token));
    }


    function mapAsinTokens() {
      return state.mapSearch
        .split(/[\s,，;；]+/)
        .map(token => token.trim().toUpperCase())
        .filter(Boolean);
    }

    function splitAsinTokens(query) {
      const raw = String(query || "");
      const compact = raw.trim().toUpperCase().replace(/[^0-9A-Z\u4e00-\u9fff]+/g, "");
      if (categoryForFilterToken(compact)) return [compact];
      const tokens = raw
        .split(/[\s,，、;；]+/)
        .map(token => token.trim().toUpperCase())
        .filter(Boolean);
      if (compact && !tokens.includes(compact)) tokens.push(compact);
      return tokens;
    }

    function categoryForFilterToken(token) {
      const compact = String(token || "").trim().toUpperCase().replace(/[^0-9A-Z\u4e00-\u9fff]+/g, "");
      const aliases = {
        "茶具": "TEA SET",
        "TEASET": "TEA SET",
        "TEAWARE": "TEA SET",
        "CHAJU": "TEA SET",
        "茶盘": "TEA TRAY",
        "TEATRAY": "TEA TRAY",
        "CHAPAN": "TEA TRAY",
        "茶宠": "TEA PET",
        "TEAPET": "TEA PET",
        "CHACHONG": "TEA PET",
        "其他": "OTHER",
        "OTHER": "OTHER",
        "OTHERS": "OTHER",
        "QITA": "OTHER"
      };
      return aliases[compact] || "";
    }

    function categoryMatchesAsin(asin, token, relations) {
      const category = categoryForFilterToken(token);
      if (!category) return false;
      const code = String(asin || "").toUpperCase();
      const categoryByAsin = relations?.categoryByAsin || {};
      const categoryByRootAsin = relations?.categoryByRootAsin || {};
      const categoryToAsins = relations?.categoryToAsins || {};
      const categoryToRootAsins = relations?.categoryToRootAsins || {};
      return categoryByAsin[code] === category
        || categoryByRootAsin[code] === category
        || (categoryToAsins[category] || []).includes(code)
        || (categoryToRootAsins[category] || []).includes(code);
    }

    function parentRelations() {
      return state.data.parentRelations || { parentByChild: {}, childrenByParent: {} };
    }

    function parentForChild(asin) {
      return parentRelations().parentByChild[String(asin || "").toUpperCase()] || "";
    }

    function childrenForParent(parentAsin) {
      return parentRelations().childrenByParent[String(parentAsin || "").toUpperCase()] || [];
    }

    function asinMatchesToken(asin, token) {
      const code = String(asin || "").toUpperCase();
      const parent = parentForChild(code);
      if (categoryMatchesAsin(code, token, state.data.categoryRelations || {})) return true;
      if (code.includes(token) || parent.includes(token)) return true;
      return childrenForParent(token).includes(code);
    }

    function matchingAsinsForTokens(tokens, source) {
      if (!tokens.length) return Object.keys(source || {});
      return Object.keys(source || {}).filter(asin => tokens.some(token => asinMatchesToken(asin, token)));
    }

    function matchesAsinFilter(row, query) {
      const tokens = splitAsinTokens(query);
      if (!tokens.length) return true;
      return tokens.some(token => asinMatchesToken(row.asin, token) || inventoryAsinMatchesToken(row.asin, token));
    }

    function mapAsinTokens() {
      return splitAsinTokens(state.mapSearch);
    }

    function normalizeRegion(country, region) {
      const raw = String(region || "UNKNOWN").trim().toUpperCase();
      return (regionAliases[country] || {})[raw] || raw;
    }

    function titleCase(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
    }

    function locationMeta(entry) {
      const country = String(entry.country || "UNKNOWN").toUpperCase();
      const region = normalizeRegion(country, entry.region);
      const meta = (regionMeta[country] || {})[region];
      const countryLabel = countryNames[country] || { en: country, zh: country };
      const shortCode = (regionShortCodes[country] || {})[region] || region;
      if (meta) {
        return {
          key: `${country}|${region}`,
          country,
          region,
          code: shortCode,
          en: meta[0],
          zh: meta[1],
          x: meta[2],
          y: meta[3],
          label: `${meta[0]} ${meta[1]}\uff08${countryLabel.zh}\uff09`
        };
      }
      const fallback = titleCase(region);
      return {
        key: `${country}|${region}`,
        country,
        region,
        code: shortCode,
        en: fallback,
        zh: countryLabel.zh,
        x: null,
        y: null,
        label: `${fallback}\uff08${countryLabel.zh}\uff09`
      };
    }

    function mapSourceRows() {
      const tokens = mapAsinTokens();
      if (!tokens.length) return state.data.locationTotals || [];
      const asins = matchingAsinsForTokens(tokens, state.data.asinLocationTotals || {});
      return asins.flatMap(asin => state.data.asinLocationTotals[asin] || []);
    }

    function combinedLocationRows() {
      const grouped = new Map();
      mapSourceRows().forEach(entry => {
        const meta = locationMeta(entry);
        const current = grouped.get(meta.key) || {
          ...meta,
          orders: 0,
          units: 0,
          lines: 0,
          currencies: new Set()
        };
        current.orders += Number(entry.orders || 0);
        current.units += Number(entry.units || 0);
        current.lines += Number(entry.lines || 0);
        if (entry.currency) current.currencies.add(entry.currency);
        grouped.set(meta.key, current);
      });
      return [...grouped.values()]
        .map(row => ({ ...row, currencies: [...row.currencies].sort() }))
        .sort((a, b) => (b.orders || 0) - (a.orders || 0) || (b.units || 0) - (a.units || 0) || a.label.localeCompare(b.label));
    }

    function colorForOrders(orders, maxOrders) {
      const ratio = Math.max(0.08, Math.min(1, orders / Math.max(maxOrders, 1)));
      const light = 93 - ratio * 52;
      const saturation = 46 + ratio * 30;
      return `hsl(151 ${saturation}% ${light}%)`;
    }

    const mapProjection = (() => {
      const bounds = { minLon: -141, maxLon: -52, minLat: 14, maxLat: 66 };
      const padding = { left: 28, right: 28, top: 18, bottom: 18 };
      const mercatorY = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
      const minY = mercatorY(bounds.minLat);
      const maxY = mercatorY(bounds.maxLat);
      return ([lon, lat]) => {
        const x = padding.left + (lon - bounds.minLon) / (bounds.maxLon - bounds.minLon) * (MAP_WIDTH - padding.left - padding.right);
        const y = padding.top + (maxY - mercatorY(lat)) / (maxY - minY) * (MAP_HEIGHT - padding.top - padding.bottom);
        return [x, y];
      };
    })();

    function insetProjection(coord, bounds, box) {
      const [lon, lat] = coord;
      const x = box.x + (lon - bounds.minLon) / (bounds.maxLon - bounds.minLon) * box.width;
      const y = box.y + (bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat) * box.height;
      return [x, y];
    }

    function featureProjection(feature) {
      const props = feature.properties || {};
      if (props.country === "US" && props.region === "AK") {
        return coord => insetProjection(coord, { minLon: -179, maxLon: -129, minLat: 50, maxLat: 72 }, { x: 58, y: 492, width: 170, height: 105 });
      }
      if (props.country === "US" && props.region === "HI") {
        return coord => insetProjection(coord, { minLon: -161.5, maxLon: -154, minLat: 18, maxLat: 23 }, { x: 238, y: 562, width: 80, height: 42 });
      }
      return mapProjection;
    }

    function ringToPath(ring, project = mapProjection) {
      return ring.map((coord, index) => {
        const [x, y] = project(coord);
        return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(" ") + " Z";
    }

    function featureToPath(feature) {
      const geometry = feature.geometry;
      const project = featureProjection(feature);
      if (!geometry) return "";
      if (geometry.type === "Polygon") {
        return geometry.coordinates.map(ring => ringToPath(ring, project)).join(" ");
      }
      if (geometry.type === "MultiPolygon") {
        return geometry.coordinates.flatMap(polygon => polygon.map(ring => ringToPath(ring, project))).join(" ");
      }
      return "";
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function applyMapZoom() {
      const svg = document.getElementById("orderMap");
      const zoom = Math.max(1, Math.min(4, Number(state.mapZoom || 1)));
      state.mapZoom = zoom;
      const width = MAP_WIDTH / zoom;
      const height = MAP_HEIGHT / zoom;
      const maxPanX = (MAP_WIDTH - width) / 2;
      const maxPanY = (MAP_HEIGHT - height) / 2;
      state.mapPanX = clamp(Number(state.mapPanX || 0), -maxPanX, maxPanX);
      state.mapPanY = clamp(Number(state.mapPanY || 0), -maxPanY, maxPanY);
      const x = (MAP_WIDTH - width) / 2 + state.mapPanX;
      const y = (MAP_HEIGHT - height) / 2 + state.mapPanY;
      svg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
    }

    function setMapZoom(nextZoom) {
      state.mapZoom = Math.max(1, Math.min(4, Number(nextZoom || 1)));
      applyMapZoom();
    }

    function resetMapView() {
      state.mapZoom = 1;
      state.mapPanX = 0;
      state.mapPanY = 0;
      applyMapZoom();
    }

    function mapLabelPosition(row) {
      if (row.country === "US" && row.region === "AK") return [145, 544];
      if (row.country === "US" && row.region === "HI") return [278, 584];
      return [row.x, row.y];
    }

    function beginMapDrag(event) {
      if (event.button !== 0) return;
      const svg = document.getElementById("orderMap");
      const rect = svg.getBoundingClientRect();
      const viewBox = svg.viewBox.baseVal;
      mapDrag.active = true;
      mapDrag.pointerId = event.pointerId;
      mapDrag.startClientX = event.clientX;
      mapDrag.startClientY = event.clientY;
      mapDrag.startPanX = state.mapPanX;
      mapDrag.startPanY = state.mapPanY;
      mapDrag.scaleX = viewBox.width / Math.max(rect.width, 1);
      mapDrag.scaleY = viewBox.height / Math.max(rect.height, 1);
      svg.setPointerCapture(event.pointerId);
      svg.classList.add("dragging");
    }

    function moveMapDrag(event) {
      if (!mapDrag.active || event.pointerId !== mapDrag.pointerId) return;
      event.preventDefault();
      state.mapPanX = mapDrag.startPanX - (event.clientX - mapDrag.startClientX) * mapDrag.scaleX;
      state.mapPanY = mapDrag.startPanY - (event.clientY - mapDrag.startClientY) * mapDrag.scaleY;
      applyMapZoom();
    }

    function endMapDrag(event) {
      if (!mapDrag.active || event.pointerId !== mapDrag.pointerId) return;
      const svg = document.getElementById("orderMap");
      mapDrag.active = false;
      mapDrag.pointerId = null;
      svg.classList.remove("dragging");
      if (svg.hasPointerCapture(event.pointerId)) {
        svg.releasePointerCapture(event.pointerId);
      }
    }

    function renderOrderMap() {
      const rows = combinedLocationRows();
      const rowByKey = new Map(rows.map(row => [row.key, row]));
      const totalOrders = rows.reduce((sum, row) => sum + (row.orders || 0), 0);
      const maxOrders = Math.max(0, ...rows.map(row => row.orders || 0));
      const tokens = mapAsinTokens();
      const svg = document.getElementById("orderMap");
      const features = ((window.ORDER_MAP_GEO || {}).features || []);
      const base = `<rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="#f7fafc"></rect>`;
      const regions = features.map(feature => {
        const props = feature.properties || {};
        const key = `${props.country}|${props.region}`;
        const row = rowByKey.get(key);
        const meta = row || locationMeta(props);
        const path = featureToPath(feature);
        const hasOrders = Boolean(row && row.orders > 0);
        const fill = hasOrders ? colorForOrders(row.orders, maxOrders) : "#f8fafc";
        const title = hasOrders
          ? `${meta.label} | ${row.orders} \u8ba2\u5355 | ${row.units} \u4ef6`
          : meta.label;
        return `
          <path class="map-region ${hasOrders ? "has-orders" : ""}" d="${path}" style="fill:${fill}">
            <title>${escapeHtml(title)}</title>
          </path>
        `;
      }).join("");
      const labels = rows
        .filter(row => row.x !== null && row.y !== null && Number.isFinite(Number(row.x)) && Number.isFinite(Number(row.y)))
        .map(row => {
          const [x, y] = mapLabelPosition(row);
          const strong = (row.orders || 0) / Math.max(maxOrders, 1) > 0.36;
          const fontSize = String(row.code || "").length > 4 ? 8 : 10;
          const title = `${row.label} | ${row.code} | ${row.orders} \u8ba2\u5355`;
          return `
            <text class="map-label ${strong ? "strong" : ""}" x="${x}" y="${y}" style="font-size:${fontSize}px">
              <title>${escapeHtml(title)}</title>${escapeHtml(row.code)}
            </text>
          `;
        }).join("");
      svg.innerHTML = base + regions + labels;
      applyMapZoom();

      document.getElementById("mapEmpty").hidden = rows.length > 0;
      document.getElementById("mapMin").textContent = "0";
      document.getElementById("mapMax").textContent = String(maxOrders || 0);
      document.getElementById("locationTotal").textContent = `\u603b\u8ba2\u5355\u91cf\uff1a${numberFmt.format(totalOrders)}`;
      document.getElementById("locationScope").textContent = tokens.length ? `\u7b5b\u9009 ASIN\uff1a${tokens.join(", ")}` : "\u5168\u90e8 ASIN";
      document.getElementById("mapNote").textContent = tokens.length
        ? `\u5f53\u524d\u6309 ASIN \u7b5b\u9009\uff0c\u5339\u914d ${rows.length} \u4e2a\u5730\u70b9\u3002`
        : `\u9ed8\u8ba4\u5c55\u793a\u5168\u90e8\u8ba2\u5355\u5730\u70b9\u6765\u6e90\uff0c\u5171 ${rows.length} \u4e2a\u5730\u70b9\u3002`;
      document.getElementById("locationList").innerHTML = rows.map((row, index) => {
        const share = totalOrders ? `${(row.orders / totalOrders * 100).toFixed(1)}%` : "0.0%";
        return `
          <div class="location-row" title="${escapeHtml(row.label)}">
            <div class="location-rank">${index + 1}</div>
            <div class="location-name">${escapeHtml(row.label)}</div>
            <div class="location-count">${numberFmt.format(row.orders || 0)}</div>
            <div class="location-share">${share}</div>
          </div>
        `;
      }).join("") || `<div style="padding:24px;text-align:center;color:var(--muted);">\u6ca1\u6709\u5339\u914d\u7684\u8ba2\u5355\u5730\u70b9</div>`;
    }

    function timeAsinTokens() {
      return state.timeSearch
        .split(/[\s,，、]+/)
        .map(token => token.trim().toUpperCase())
        .filter(Boolean);
    }

    function timeSourceRows() {
      const tokens = timeAsinTokens();
      if (!tokens.length) return state.data.timeTotals || [];
      const asins = Object.keys(state.data.asinTimeTotals || {})
        .filter(asin => tokens.some(token => asin.includes(token)));
      return asins.flatMap(asin => state.data.asinTimeTotals[asin] || []);
    }

    function timeAsinTokens() {
      return splitAsinTokens(state.timeSearch);
    }

    function timeSourceRows() {
      const tokens = timeAsinTokens();
      if (!tokens.length) return state.data.timeTotals || [];
      const asins = matchingAsinsForTokens(tokens, state.data.asinTimeTotals || {});
      return asins.flatMap(asin => state.data.asinTimeTotals[asin] || []);
    }

    function combinedTimeRows() {
      const rows = Array.from({ length: 24 }, (_item, hour) => ({
        hour,
        orders: 0,
        units: 0,
        lines: 0,
        sales: 0,
        currencies: new Set()
      }));
      timeSourceRows().forEach(entry => {
        const hour = Math.max(0, Math.min(23, Number(entry.hour || 0)));
        rows[hour].orders += Number(entry.orders || 0);
        rows[hour].units += Number(entry.units || 0);
        rows[hour].lines += Number(entry.lines || 0);
        rows[hour].sales += Number(entry.sales || 0);
        if (entry.currency) rows[hour].currencies.add(entry.currency);
      });
      return rows.map(row => ({
        ...row,
        sales: Math.round(row.sales * 100) / 100,
        currencies: [...row.currencies].sort()
      }));
    }

    function hourLabel(hour) {
      return `${String(hour).padStart(2, "0")}:00`;
    }

    function renderTimeDistribution() {
      const rows = combinedTimeRows();
      const tokens = timeAsinTokens();
      const totalOrders = rows.reduce((sum, row) => sum + (row.orders || 0), 0);
      const totalUnits = rows.reduce((sum, row) => sum + (row.units || 0), 0);
      const maxOrders = Math.max(1, ...rows.map(row => row.orders || 0));
      const peak = rows.reduce((best, row) => (row.orders > best.orders ? row : best), rows[0]);
      const activeHours = rows.filter(row => row.orders > 0).length;

      document.getElementById("timeNote").textContent = tokens.length
        ? `当前按 ASIN 筛选，匹配 ${numberFmt.format(totalOrders)} 个订单，覆盖 ${activeHours} 个小时段。`
        : `默认展示全部订单，按订单报告 purchase-date 的小时统计，覆盖 ${activeHours} 个小时段。`;

      document.getElementById("timeSummary").innerHTML = `
        <div class="time-chip"><span>总订单量</span><strong>${numberFmt.format(totalOrders)}</strong></div>
        <div class="time-chip"><span>总件数</span><strong>${numberFmt.format(totalUnits)}</strong></div>
        <div class="time-chip"><span>高峰时段</span><strong>${hourLabel(peak.hour)} · ${numberFmt.format(peak.orders)} 单</strong></div>
      `;

      document.getElementById("timeChart").innerHTML = rows.map(row => {
        const ratio = row.orders / maxOrders;
        const percent = totalOrders ? `${(row.orders / totalOrders * 100).toFixed(1)}%` : "0.0%";
        const barHeight = `${Math.max(0, ratio * 100).toFixed(1)}%`;
        const minHeight = row.orders > 0 ? "8px" : "0px";
        const title = `${hourLabel(row.hour)} | ${numberFmt.format(row.orders)} 单 | ${numberFmt.format(row.units)} 件 | 占比 ${percent}`;
        return `
          <div class="time-slot ${row.orders > 0 ? "" : "empty"}" title="${escapeHtml(title)}">
            <div class="time-value">${row.orders ? numberFmt.format(row.orders) : ""}</div>
            <div class="time-bar-track"><div class="time-bar" style="--bar-height:${barHeight};--bar-min-height:${minHeight};"></div></div>
            <div class="time-hour">${hourLabel(row.hour).slice(0, 2)}</div>
            <div class="time-share">${row.orders ? percent : ""}</div>
          </div>
        `;
      }).join("");
    }

    function historyAsinTokens() {
      return splitAsinTokens(state.historySearch);
    }

    function combinedHistoryRows() {
      const tokens = historyAsinTokens();
      if (!tokens.length) {
        return (state.data.periodTotals.monthly || [])
          .filter(row => row.currency === state.currency)
          .map(row => ({ ...row }))
          .sort((a, b) => a.period.localeCompare(b.period));
      }

      const grouped = new Map();
      const asins = matchingAsinsForTokens(tokens, state.data.asinSeries || {});
      asins.forEach(asin => {
        (((state.data.asinSeries[asin] || {}).monthly) || [])
          .filter(row => row.currency === state.currency)
          .forEach(row => {
            const current = grouped.get(row.period) || {
              period: row.period,
              currency: state.currency,
              sales: 0,
              units: 0,
              orders: 0,
              lines: 0
            };
            current.sales += Number(row.sales || 0);
            current.units += Number(row.units || 0);
            current.orders += Number(row.orders || 0);
            current.lines += Number(row.lines || 0);
            grouped.set(row.period, current);
          });
      });
      return [...grouped.values()]
        .map(row => ({
          ...row,
          sales: Math.round(row.sales * 100) / 100,
          avgOrderValue: Math.round((row.sales / Math.max(row.orders, 1)) * 100) / 100
        }))
        .sort((a, b) => a.period.localeCompare(b.period));
    }

    function adMetricForMonth(month, currency) {
      const asinTokens = splitAsinTokens(state.search);
      if (!asinTokens.length) {
        return (adData.monthlyTotals || []).find(row => row.month === month && row.currency === currency) || emptyAdMetric(currency);
      }
      const rows = selectedAdAsins().flatMap(asin => ((adData.asinMonthlyTotals || {})[asin] || []))
        .filter(row => row.month === month && row.currency === currency);
      return combineAdMetrics(rows, currency);
    }

    function adMetricForPeriod(period, currency) {
      if (period && period !== "all") return adMetricForMonth(period, currency);
      const asinTokens = splitAsinTokens(state.search);
      if (!asinTokens.length) {
        return combineAdMetrics((adData.monthlyTotals || []).filter(row => row.currency === currency), currency);
      }
      const rows = selectedAdAsins().flatMap(asin => ((adData.asinMonthlyTotals || {})[asin] || []))
        .filter(row => row.currency === currency);
      return combineAdMetrics(rows, currency);
    }

    function dailyAdMonths() {
      return [...new Set((adData.dailyTotals || [])
        .map(row => String(row.date || "").slice(0, 7))
        .filter(Boolean))]
        .sort((a, b) => b.localeCompare(a));
    }

    function renderDailyAdMonthOptions() {
      const select = document.getElementById("dailyAdMonth");
      const months = dailyAdMonths();
      if (!months.includes(state.dailyAdMonth)) {
        state.dailyAdMonth = months.includes(adData.metadata?.currentMonth)
          ? adData.metadata.currentMonth
          : months[0] || "";
      }
      select.innerHTML = months.map(month => `<option value="${month}">${monthLabel(month)}</option>`).join("");
      select.value = state.dailyAdMonth;
    }

    function adMetricForDay(date, currency) {
      const asinTokens = splitAsinTokens(state.search);
      if (!asinTokens.length) {
        return (adData.dailyTotals || []).find(row => row.date === date && row.currency === currency) || emptyAdMetric(currency);
      }
      const rows = selectedAdAsins().flatMap(asin => ((adData.asinDailyTotals || {})[asin] || []))
        .filter(row => row.date === date && row.currency === currency);
      return combineAdMetrics(rows, currency);
    }

    function salesForDay(date, currency) {
      const asinTokens = splitAsinTokens(state.search);
      if (!asinTokens.length) {
        return Number((state.data.periodTotals.daily || [])
          .find(row => row.period === date && row.currency === currency)?.sales || 0);
      }
      return matchingAsinsForTokens(asinTokens, state.data.asinSeries || {})
        .reduce((sum, asin) => sum + Number(metricForDay(asin, date, currency).sales || 0), 0);
    }

    function dailyAdSnapshot(date, currency) {
      const ad = adMetricForDay(date, currency);
      const totalSales = salesForDay(date, currency);
      return {
        ad,
        tacos: totalSales ? Number(ad.spend || 0) / totalSales * 100 : 0
      };
    }

    function dailyAdSortValue(snapshot, key) {
      if (key === "date") return snapshot.date;
      if (key === "tacos") return Number(snapshot.tacos || 0);
      return Number(snapshot.ad[key] || 0);
    }

    function sortDailyAdSnapshots(snapshots) {
      const sort = state.dailyAdSort;
      return snapshots.slice().sort((a, b) => {
        const aValue = dailyAdSortValue(a, sort.key);
        const bValue = dailyAdSortValue(b, sort.key);
        const result = sort.key === "date"
          ? String(aValue).localeCompare(String(bValue))
          : Number(aValue || 0) - Number(bValue || 0);
        if (result === 0) return b.date.localeCompare(a.date);
        return sort.direction === "asc" ? result : -result;
      });
    }

    function updateDailyAdSortButtons() {
      document.querySelectorAll("[data-daily-ad-sort-key]").forEach(button => {
        const active = button.dataset.dailyAdSortKey === state.dailyAdSort.key;
        button.querySelector(".sort-mark").textContent = active
          ? (state.dailyAdSort.direction === "asc" ? "▲" : "▼")
          : "";
      });
    }

    function setDailyAdSort(key) {
      if (state.dailyAdSort.key === key) {
        state.dailyAdSort.direction = state.dailyAdSort.direction === "desc" ? "asc" : "desc";
      } else {
        state.dailyAdSort = { key, direction: "desc" };
      }
      renderDailyAdData();
    }

    function renderDailyAdData() {
      renderDailyAdMonthOptions();
      updateDailyAdSortButtons();
      const month = state.dailyAdMonth;
      const note = document.getElementById("dailyAdNote");
      const body = document.getElementById("dailyAdBody");
      const total = document.getElementById("dailyAdTotal");
      if (!month) {
        note.textContent = "没有读取到每日广告数据，请先生成 ad-data.js。";
        body.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--muted);">没有每日广告数据</td></tr>`;
        total.innerHTML = "";
        return;
      }

      const currency = state.currency;
      const asinTokens = splitAsinTokens(state.search);
      const dates = [...new Set((adData.dailyTotals || [])
        .filter(row => String(row.date || "").startsWith(month))
        .map(row => row.date))]
        .sort((a, b) => b.localeCompare(a));
      const hasCurrencyData = (adData.dailyTotals || [])
        .some(row => row.currency === currency && String(row.date || "").startsWith(month));
      const scope = asinTokens.length ? `当前按 ASIN 筛选；` : "";
      note.textContent = hasCurrencyData
        ? `${scope}${monthLabel(month)} 每日广告数据，共 ${dates.length} 天；TACOS = 广告花费 ÷ 当日总销售额。`
        : `广告报告中没有 ${currency} 的 ${monthLabel(month)} 每日数据。`;

      const snapshots = dates.map(date => ({ date, ...dailyAdSnapshot(date, currency) }));
      body.innerHTML = sortDailyAdSnapshots(snapshots).map(snapshot => {
        return `
          <tr>
            <td>${snapshot.date}</td>
            <td>${numberFmt.format(snapshot.ad.impressions || 0)}</td>
            <td>${numberFmt.format(snapshot.ad.clicks || 0)}</td>
            <td>${fmtMoney(snapshot.ad.spend, currency)}</td>
            <td>${fmtMoney(snapshot.ad.sales, currency)}</td>
            <td>${numberFmt.format(snapshot.ad.orders || 0)}</td>
            <td>${fmtPercent(snapshot.ad.ctr)}</td>
            <td>${fmtPercent(snapshot.ad.cvr)}</td>
            <td>${fmtPercent(snapshot.ad.acos)}</td>
            <td>${fmtPercent(snapshot.tacos)}</td>
          </tr>
        `;
      }).join("") || `<tr><td colspan="10" style="text-align:center;color:var(--muted);">该月份没有每日广告数据</td></tr>`;

      if (!snapshots.length) {
        total.innerHTML = "";
        return;
      }
      const totalAd = combineAdMetrics(snapshots.map(snapshot => snapshot.ad), currency);
      const totalSales = snapshots.reduce((sum, snapshot) => sum + salesForDay(snapshot.date, currency), 0);
      const totalTacos = totalSales ? Number(totalAd.spend || 0) / totalSales * 100 : 0;
      total.innerHTML = `
        <tr>
          <td>合计</td>
          <td>${numberFmt.format(totalAd.impressions || 0)}</td>
          <td>${numberFmt.format(totalAd.clicks || 0)}</td>
          <td>${fmtMoney(totalAd.spend, currency)}</td>
          <td>${fmtMoney(totalAd.sales, currency)}</td>
          <td>${numberFmt.format(totalAd.orders || 0)}</td>
          <td>${fmtPercent(totalAd.ctr)}</td>
          <td>${fmtPercent(totalAd.cvr)}</td>
          <td>${fmtPercent(totalAd.acos)}</td>
          <td>${fmtPercent(totalTacos)}</td>
        </tr>
      `;
    }

    function enrichHistoryRows(rows) {
      return rows.map(row => {
        const ad = adMetricForMonth(row.period, state.currency);
        const sales = Number(row.sales || 0);
        const orders = Number(row.orders || 0);
        const adSpend = Number(ad.spend || 0);
        return {
          ...row,
          ad,
          adCurrency: ad.currency || state.currency,
          avgOrderValue: sales / Math.max(orders, 1),
          adImpressions: Number(ad.impressions || 0),
          adClicks: Number(ad.clicks || 0),
          adOrders: Number(ad.orders || 0),
          adSales: Number(ad.sales || 0),
          adSpend,
          adCtr: Number(ad.ctr || 0),
          adCvr: Number(ad.cvr || 0),
          adAcos: Number(ad.acos || 0),
          tacos: sales ? adSpend / sales * 100 : 0
        };
      });
    }

    function historySortValue(row, key) {
      if (key === "period") return String(row.period || "");
      return Number(row[key] || 0);
    }

    function sortedHistoryRows(rows) {
      const defaultRows = enrichHistoryRows(rows).slice().reverse();
      const sort = state.historySort || {};
      if (!sort.key || !sort.direction) return defaultRows;
      const direction = sort.direction === "asc" ? 1 : -1;
      return defaultRows.map((row, index) => ({ row, index })).sort((a, b) => {
        const aValue = historySortValue(a.row, sort.key);
        const bValue = historySortValue(b.row, sort.key);
        const result = typeof aValue === "string"
          ? aValue.localeCompare(String(bValue), "zh-CN")
          : aValue - Number(bValue || 0);
        return result ? result * direction : a.index - b.index;
      }).map(item => item.row);
    }

    function cycleHistorySort(key) {
      const current = state.historySort || { key: "", direction: "" };
      if (current.key !== key) {
        state.historySort = { key, direction: "asc" };
      } else if (current.direction === "asc") {
        state.historySort = { key, direction: "desc" };
      } else {
        state.historySort = { key: "", direction: "" };
      }
      renderHistorySales();
    }

    function updateHistorySortButtons() {
      document.querySelectorAll("[data-history-sort-key]").forEach(button => {
        const key = button.dataset.historySortKey;
        const sort = state.historySort || {};
        const active = sort.key === key && sort.direction;
        const mark = button.querySelector(".sort-mark");
        if (mark) mark.textContent = active ? (sort.direction === "asc" ? "▲" : "▼") : "";
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function setHistoryLinkedHover(period) {
      document.querySelectorAll("[data-history-period]").forEach(element => {
        element.classList.toggle("is-linked", Boolean(period) && element.dataset.historyPeriod === period);
      });
    }

    function bindHistoryLinkedHover() {
      document.querySelectorAll(".history-hover-group[data-history-period], #historyBody tr[data-history-period]").forEach(element => {
        element.addEventListener("mouseenter", () => setHistoryLinkedHover(element.dataset.historyPeriod));
        element.addEventListener("mouseleave", () => setHistoryLinkedHover(""));
      });
    }

    function renderHistoryLineChart(rows, maxSales) {
      if (!rows.length) {
        document.getElementById("historyChart").innerHTML = `<div style="padding:24px;color:var(--muted);font-weight:800;">没有匹配的历史销售</div>`;
        return;
      }

      const rowsWithAds = rows.map(row => ({ ...row, ad: adMetricForMonth(row.period, state.currency) }));
      const visible = state.historySeriesVisible || {};
      const salesVisible = visible.sales !== false;
      const adSalesVisible = visible.adSales !== false;
      const adSpendVisible = visible.adSpend !== false;
      const visibleValues = rowsWithAds.flatMap(row => [
        ...(salesVisible ? [Number(row.sales || 0)] : []),
        ...(adSalesVisible ? [Number(row.ad.sales || 0)] : []),
        ...(adSpendVisible ? [Number(row.ad.spend || 0)] : [])
      ]);
      const fallbackValues = rowsWithAds.flatMap(row => [Number(row.sales || 0), Number(row.ad.sales || 0), Number(row.ad.spend || 0)]);
      const maxChartValue = Math.max(1, ...(visibleValues.length ? visibleValues : fallbackValues));
      const chartWidth = Math.max(860, rows.length * 86);
      const chartHeight = 286;
      const padding = { left: 42, right: 34, top: 38, bottom: 42 };
      const plotWidth = chartWidth - padding.left - padding.right;
      const plotHeight = chartHeight - padding.top - padding.bottom;
      const xFor = index => padding.left + (rows.length === 1 ? plotWidth / 2 : index / (rows.length - 1) * plotWidth);
      const yFor = value => padding.top + (1 - Number(value || 0) / Math.max(maxChartValue, 1)) * plotHeight;
      const points = rowsWithAds.map((row, index) => ({ row, x: xFor(index), y: yFor(row.sales) }));
      const adSalesPoints = rowsWithAds.map((row, index) => ({ row, x: xFor(index), y: yFor(row.ad.sales), value: row.ad.sales }));
      const adSpendPoints = rowsWithAds.map((row, index) => ({ row, x: xFor(index), y: yFor(row.ad.spend), value: row.ad.spend }));
      const linePath = points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
      const adSalesPath = adSalesPoints.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
      const adSpendPath = adSpendPoints.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
      const baseline = padding.top + plotHeight;
      const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)} ${baseline.toFixed(1)} L${points[0].x.toFixed(1)} ${baseline.toFixed(1)} Z`;
      const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = padding.top + ratio * plotHeight;
        return `<line class="history-grid-line" x1="${padding.left}" y1="${y.toFixed(1)}" x2="${chartWidth - padding.right}" y2="${y.toFixed(1)}"></line>`;
      }).join("");
      const salesMarks = salesVisible ? points.map(point => {
        const title = `${monthLabel(point.row.period)} | ${fmtMoney(point.row.sales || 0, state.currency)} | ${numberFmt.format(point.row.units || 0)} 件 | ${numberFmt.format(point.row.orders || 0)} 单`;
        return `
          <g>
            <title>${escapeHtml(title)}</title>
            <circle class="history-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="5"></circle>
            <text class="history-point-label" x="${point.x.toFixed(1)}" y="${Math.max(16, point.y - 12).toFixed(1)}">${escapeHtml(fmtHeatMoney(point.row.sales || 0, state.currency))}</text>
          </g>
        `;
      }).join("") : "";
      const axisLabels = points.map(point => `
        <text class="history-axis-label" x="${point.x.toFixed(1)}" y="${chartHeight - 15}" text-anchor="middle">${escapeHtml(monthLabel(point.row.period))}</text>
      `).join("");
      const adSalesMarks = adSalesVisible ? adSalesPoints.filter(point => Number(point.value || 0) > 0).map(point => `
        <circle class="history-point ad-sales" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4">
          <title>${escapeHtml(`${monthLabel(point.row.period)} | 广告销售额 ${fmtMoney(point.value, state.currency)} | ROAS ${Number(point.row.ad.roas || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`)}</title>
        </circle>
      `).join("") : "";
      const adSpendMarks = adSpendVisible ? adSpendPoints.filter(point => Number(point.value || 0) > 0).map(point => `
        <circle class="history-point ad-spend" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4">
          <title>${escapeHtml(`${monthLabel(point.row.period)} | 广告花费 ${fmtMoney(point.value, state.currency)} | ACOS ${fmtPercent(point.row.ad.acos)}`)}</title>
        </circle>
      `).join("") : "";
      const hoverGroups = points.map((point, index) => {
        const prevX = index > 0 ? points[index - 1].x : padding.left;
        const nextX = index < points.length - 1 ? points[index + 1].x : chartWidth - padding.right;
        const zoneLeft = index > 0 ? (prevX + point.x) / 2 : padding.left;
        const zoneRight = index < points.length - 1 ? (point.x + nextX) / 2 : chartWidth - padding.right;
        const tooltipWidth = 196;
        const tooltipRows = [
          ...(salesVisible ? [{ color: "#0b8f76", label: "销售额", value: fmtMoney(point.row.sales || 0, state.currency), y: point.y, r: 7 }] : []),
          ...(adSalesVisible ? [{ color: "#1f6fae", label: "广告销售额", value: fmtMoney(point.row.ad.sales || 0, state.currency), y: adSalesPoints[index].y, r: 6 }] : []),
          ...(adSpendVisible ? [{ color: "#d97706", label: "广告花费", value: fmtMoney(point.row.ad.spend || 0, state.currency), y: adSpendPoints[index].y, r: 6 }] : [])
        ];
        const tooltipHeight = 32 + Math.max(1, tooltipRows.length) * 20;
        const tooltipX = point.x + tooltipWidth + 18 > chartWidth - padding.right
          ? point.x - tooltipWidth - 14
          : point.x + 14;
        const tooltipY = Math.max(10, Math.min(chartHeight - tooltipHeight - 10, point.y - 56));
        const hoverDots = tooltipRows.map(item => `
          <circle class="history-hover-dot" cx="${point.x.toFixed(1)}" cy="${item.y.toFixed(1)}" r="${item.r}" fill="${item.color}"></circle>
        `).join("");
        const hoverTexts = tooltipRows.length ? tooltipRows.map((item, rowIndex) => `
          <text class="history-tooltip-text" x="${(tooltipX + 12).toFixed(1)}" y="${(tooltipY + 42 + rowIndex * 20).toFixed(1)}">${escapeHtml(`${item.label} ${item.value}`)}</text>
        `).join("") : `
          <text class="history-tooltip-text" x="${(tooltipX + 12).toFixed(1)}" y="${(tooltipY + 42).toFixed(1)}">暂无显示指标</text>
        `;
        return `
          <g class="history-hover-group" data-history-period="${escapeHtml(point.row.period)}">
            <rect class="history-hover-zone" x="${zoneLeft.toFixed(1)}" y="${padding.top}" width="${Math.max(18, zoneRight - zoneLeft).toFixed(1)}" height="${plotHeight}"></rect>
            <g class="history-hover-marker">
              <line class="history-hover-line" x1="${point.x.toFixed(1)}" y1="${padding.top}" x2="${point.x.toFixed(1)}" y2="${baseline.toFixed(1)}"></line>
              ${hoverDots}
              <rect class="history-tooltip-box" x="${tooltipX.toFixed(1)}" y="${tooltipY.toFixed(1)}" width="${tooltipWidth}" height="${tooltipHeight}" rx="8"></rect>
              <text class="history-tooltip-title" x="${(tooltipX + 12).toFixed(1)}" y="${(tooltipY + 20).toFixed(1)}">${escapeHtml(monthLabel(point.row.period))}</text>
              ${hoverTexts}
            </g>
          </g>
        `;
      }).join("");

      document.getElementById("historyChart").innerHTML = `
        <div class="history-legend">
          <button class="${salesVisible ? "" : "off"}" data-history-series="sales" type="button" aria-pressed="${salesVisible}"><i></i>销售额</button>
          <button class="ad-sales ${adSalesVisible ? "" : "off"}" data-history-series="adSales" type="button" aria-pressed="${adSalesVisible}"><i></i>广告销售额</button>
          <button class="ad-spend ${adSpendVisible ? "" : "off"}" data-history-series="adSpend" type="button" aria-pressed="${adSpendVisible}"><i></i>广告花费</button>
        </div>
        <svg class="history-line-chart" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="历史月度销售额折线图">
          ${gridLines}
          ${salesVisible ? `<path class="history-area" d="${areaPath}"></path>` : ""}
          ${salesVisible ? `<path class="history-line" d="${linePath}"></path>` : ""}
          ${adSalesVisible ? `<path class="history-line ad-sales" d="${adSalesPath}"></path>` : ""}
          ${adSpendVisible ? `<path class="history-line ad-spend" d="${adSpendPath}"></path>` : ""}
          ${adSalesMarks}
          ${adSpendMarks}
          ${salesMarks}
          ${axisLabels}
          ${hoverGroups}
        </svg>
      `;
      document.querySelectorAll("[data-history-series]").forEach(button => {
        button.addEventListener("click", () => {
          const key = button.dataset.historySeries;
          state.historySeriesVisible[key] = state.historySeriesVisible[key] === false;
          renderHistorySales();
        });
      });
    }

    function renderHistorySales() {
      const rows = combinedHistoryRows();
      const tokens = historyAsinTokens();
      const totalSales = rows.reduce((sum, row) => sum + Number(row.sales || 0), 0);
      const totalUnits = rows.reduce((sum, row) => sum + Number(row.units || 0), 0);
      const totalOrders = rows.reduce((sum, row) => sum + Number(row.orders || 0), 0);
      const maxSales = Math.max(1, ...rows.map(row => Number(row.sales || 0)));
      const peak = rows.reduce((best, row) => (Number(row.sales || 0) > Number(best.sales || 0) ? row : best), rows[0] || { period: "-", sales: 0 });
      const avgMonthlySales = rows.length ? totalSales / rows.length : 0;

      document.getElementById("historyNote").textContent = tokens.length
        ? `当前按 ASIN 筛选，匹配 ${rows.length} 个月度记录。`
        : `默认展示全部订单的每月销售额，共 ${rows.length} 个月。`;

      document.getElementById("historySummary").innerHTML = `
        <div class="history-chip"><span>累计销售额</span><strong>${fmtMoney(totalSales, state.currency)}</strong></div>
        <div class="history-chip"><span>累计销量</span><strong>${numberFmt.format(totalUnits)}</strong></div>
        <div class="history-chip"><span>累计订单</span><strong>${numberFmt.format(totalOrders)}</strong></div>
        <div class="history-chip"><span>月均销售额</span><strong>${fmtMoney(avgMonthlySales, state.currency)}</strong></div>
      `;

      renderHistoryLineChart(rows, maxSales);

      document.getElementById("historyBody").innerHTML = sortedHistoryRows(rows).map(row => {
        const ad = row.ad || emptyAdMetric(state.currency);
        const adCurrency = row.adCurrency || state.currency;
        return `
          <tr class="${row.period === peak.period ? "peak" : ""}" data-history-period="${escapeHtml(row.period)}">
            <td class="month-boundary">${monthLabel(row.period)}</td>
            <td>${fmtMoney(row.sales || 0, state.currency)}</td>
            <td>${numberFmt.format(row.units || 0)}</td>
            <td>${numberFmt.format(row.orders || 0)}</td>
            <td>${fmtMoney(row.avgOrderValue || 0, state.currency)}</td>
            <td class="group-start">${numberFmt.format(row.adImpressions || 0)}</td>
            <td>${numberFmt.format(row.adClicks || 0)}</td>
            <td>${numberFmt.format(row.adOrders || 0)}</td>
            <td>${fmtMoney(row.adSales || 0, adCurrency)}</td>
            <td>${fmtMoney(row.adSpend || 0, adCurrency)}</td>
            <td>${fmtPercent(row.adCtr)}</td>
            <td>${fmtPercent(row.adCvr)}</td>
            <td class="group-start">${fmtPercent(row.adAcos)}</td>
            <td>${fmtPercent(row.tacos)}</td>
          </tr>
        `;
      }).join("") || `<tr><td colspan="14" style="text-align:center;color:var(--muted);">没有匹配的历史销售</td></tr>`;
      updateHistorySortButtons();
      bindHistoryLinkedHover();
    }

    function exportHistoryCsv() {
      const rows = combinedHistoryRows();
      const tokens = historyAsinTokens();
      const header = [
        "month",
        "currency",
        "sales",
        "units",
        "orders",
        "avg_order_value",
        "ad_impressions",
        "ad_clicks",
        "ad_orders",
        "ad_sales",
        "ad_spend",
        "ad_ctr",
        "ad_cvr",
        "ad_acos",
        "tacos"
      ];
      const lines = [header.join(",")].concat(rows.map(row => {
        const ad = adMetricForMonth(row.period, state.currency);
        const tacos = Number(row.sales || 0) ? Number(ad.spend || 0) / Number(row.sales || 0) * 100 : 0;
        return [
          row.period,
          state.currency,
          Number(row.sales || 0).toFixed(2),
          row.units || 0,
          row.orders || 0,
          ((row.sales || 0) / Math.max(row.orders || 0, 1)).toFixed(2),
          ad.impressions || 0,
          ad.clicks || 0,
          ad.orders || 0,
          Number(ad.sales || 0).toFixed(2),
          Number(ad.spend || 0).toFixed(2),
          Number(ad.ctr || 0).toFixed(2),
          Number(ad.cvr || 0).toFixed(2),
          Number(ad.acos || 0).toFixed(2),
          tacos.toFixed(2)
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(",");
      }));
      const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      const scope = tokens.length ? tokens.join("-") : "all";
      link.href = URL.createObjectURL(blob);
      link.download = `asin-history-sales-${state.currency}-${scope}.csv`;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      link.remove();
      showToast("历史销售 CSV 已导出");
    }

    const refundReasonLabels = {
      DAMAGED_BY_FC: "仓库损坏",
      NOT_AS_DESCRIBED: "与描述不符",
      UNWANTED_ITEM: "不再需要",
      DEFECTIVE: "商品有缺陷",
      MISSING_PARTS: "缺少部件",
      FOUND_BETTER_PRICE: "找到更低价格",
      QUALITY_UNACCEPTABLE: "质量不满意",
      ORDERED_WRONG_ITEM: "买错商品",
      UNDELIVERABLE_UNKNOWN: "无法配送",
      MISSED_ESTIMATED_DELIVERY: "错过预计送达",
      APPAREL_TOO_SMALL: "尺寸偏小",
      APPAREL_TOO_LARGE: "尺寸偏大"
    };

    function refundMatchPercent(matched, total) {
      return total ? `${(Number(matched || 0) / total * 100).toFixed(0)}%` : "-";
    }

    function formatRefundDate(value) {
      if (!value) return "";
      const text = String(value).replace("T", " ");
      return `${escapeHtml(text.slice(0, 16))} UTC`;
    }

    function refundSummaryHtml(summary) {
      const data = summary || {};
      const amountRate = refundMatchPercent(data.amountMatchedOrders, data.orders);
      return `
        <div class="refund-chip money"><span>客户退款金额</span><strong>${fmtMoney(data.customerRefund || 0, "USD")}</strong><small>${numberFmt.format(data.amountMatchedOrders || 0)} 个订单有金额 · ${amountRate}</small></div>
        <div class="refund-chip money"><span>店铺净损失</span><strong>${fmtMoney(data.storeLoss || 0, "USD")}</strong><small>已扣除亚马逊退回费用</small></div>
        <div class="refund-chip"><span>退款件数</span><strong>${numberFmt.format(data.units || 0)}</strong><small>${numberFmt.format(data.records || 0)} 条退货记录</small></div>
        <div class="refund-chip"><span>退款订单</span><strong>${numberFmt.format(data.orders || 0)}</strong><small>金额按订单只计一次</small></div>
        <div class="refund-chip"><span>下单时间匹配</span><strong>${refundMatchPercent(data.orderDateMatchedRecords, data.records)}</strong><small>${numberFmt.format(data.orderDateMatchedRecords || 0)} / ${numberFmt.format(data.records || 0)} 条</small></div>
        <div class="refund-chip"><span>平均退货间隔</span><strong>${data.avgDaysToReturn == null ? "-" : `${Number(data.avgDaysToReturn).toFixed(1)} 天`}</strong><small>按匹配订单计算</small></div>
      `;
    }

    function refundAmountCell(row, key) {
      if (!row.amountMatched) return `<span class="refund-badge unmatched">金额未匹配</span>`;
      if (!row.amountIncluded) return `<span class="refund-merged">同订单合并</span>`;
      return `<span class="refund-amount">${fmtMoney(row[key] || 0, "USD")}</span>`;
    }

    function refundDetailRows(records) {
      return (records || []).map(row => {
        const reasonCode = String(row.reason || "");
        const reason = refundReasonLabels[reasonCode] || reasonCode || "-";
        const purchaseDate = row.orderDateMatched
          ? formatRefundDate(row.purchaseDate)
          : `<span class="refund-badge unmatched">未匹配</span>`;
        const days = row.daysToReturn == null ? "-" : `${numberFmt.format(row.daysToReturn)} 天`;
        const asin = escapeHtml(row.asin || "-");
        const productName = escapeHtml(row.productName || "-");
        const comments = escapeHtml(row.comments || "-");
        return `
          <tr>
            <td>${formatRefundDate(row.returnDate)}</td>
            <td>${purchaseDate}</td>
            <td>${days}</td>
            <td>${escapeHtml(row.orderId || "-")}</td>
            <td class="refund-product-cell">
              <a href="${amazonListingUrl(row.asin || "")}" target="_blank" rel="noopener noreferrer">${asin}</a>
              <span title="${productName}">${productName}</span>
            </td>
            <td>${escapeHtml(row.sku || "-")}</td>
            <td>${numberFmt.format(row.quantity || 0)}</td>
            <td><span class="refund-badge" title="${escapeHtml(reasonCode)}">${escapeHtml(reason)}</span></td>
            <td>${escapeHtml(row.disposition || "-")}</td>
            <td>${escapeHtml(row.status || "-")}</td>
            <td>${refundAmountCell(row, "customerRefund")}</td>
            <td>${refundAmountCell(row, "storeLoss")}</td>
            <td class="refund-comment-cell" title="${comments}">${comments}</td>
          </tr>
        `;
      }).join("") || `<tr><td colspan="13" style="padding:28px;text-align:center;color:var(--muted);">没有退款记录</td></tr>`;
    }

    function renderRefundDashboard() {
      const refunds = state.data.refunds;
      if (!refunds || !refunds.metadata) {
        document.getElementById("refundNote").textContent = "没有读取到退款数据，请重新生成 sales-data.js。";
        document.getElementById("refundRecentSummary").innerHTML = "";
        document.getElementById("refundRecentBody").innerHTML = `<tr><td colspan="13" style="text-align:center;color:var(--muted);">没有退款数据</td></tr>`;
        return;
      }

      const metadata = refunds.metadata;
      const recent = refunds.recent || { summary: {}, records: [] };
      const historical = refunds.historical || { summary: {}, months: [], records: [] };
      const months = historical.months || [];
      if (!months.some(row => row.month === state.refundMonth)) {
        state.refundMonth = months[0]?.month || "";
      }

      document.querySelectorAll("[data-refund-tab]").forEach(button => {
        const active = button.dataset.refundTab === state.refundTab;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      document.getElementById("refundRecentPanel").hidden = state.refundTab !== "recent";
      document.getElementById("refundHistoricalPanel").hidden = state.refundTab !== "historical";

      const orderRate = refundMatchPercent(metadata.orderDateMatchedRecords, metadata.recordCount);
      const amountRate = refundMatchPercent(metadata.amountMatchedOrders, new Set([
        ...(recent.records || []),
        ...(historical.records || [])
      ].map(row => row.orderId).filter(Boolean)).size);
      document.getElementById("refundNote").textContent = metadata.latestReturnDate
        ? `数据截至 ${metadata.latestReturnDate}；近期口径为 ${metadata.recentStartDate} 至 ${metadata.latestReturnDate}。下单时间匹配 ${orderRate}，退款金额匹配 ${amountRate}，金额统一为 USD。`
        : "退款报告中没有可用日期。";

      document.getElementById("refundRecentSummary").innerHTML = refundSummaryHtml(recent.summary);
      document.getElementById("refundHistoricalSummary").innerHTML = refundSummaryHtml(historical.summary);
      document.getElementById("refundRecentDetailNote").textContent = `${numberFmt.format(recent.summary?.records || 0)} 条记录；同一订单金额只展示一次`;
      document.getElementById("refundRecentBody").innerHTML = refundDetailRows(recent.records);

      document.getElementById("refundMonthBody").innerHTML = months.map(row => `
        <tr class="${row.month === state.refundMonth ? "selected" : ""}" data-refund-month="${escapeHtml(row.month)}">
          <td>${monthLabel(row.month)}</td>
          <td>${numberFmt.format(row.records || 0)}</td>
          <td>${numberFmt.format(row.units || 0)}</td>
          <td>${numberFmt.format(row.orders || 0)}</td>
          <td class="refund-amount">${fmtMoney(row.customerRefund || 0, "USD")}</td>
          <td class="refund-amount">${fmtMoney(row.storeLoss || 0, "USD")}</td>
          <td>${refundMatchPercent(row.orderDateMatchedRecords, row.records)}</td>
          <td>${numberFmt.format(row.amountMatchedOrders || 0)} / ${numberFmt.format(row.orders || 0)}</td>
          <td>${row.avgDaysToReturn == null ? "-" : `${Number(row.avgDaysToReturn).toFixed(1)} 天`}</td>
          <td><button class="refund-month-select" data-refund-month="${escapeHtml(row.month)}" type="button">查看明细</button></td>
        </tr>
      `).join("") || `<tr><td colspan="10" style="text-align:center;color:var(--muted);">没有历史退款月份</td></tr>`;

      const selectedRecords = (historical.records || []).filter(row => row.returnMonth === state.refundMonth);
      document.getElementById("refundHistoryDetailTitle").textContent = state.refundMonth
        ? `${monthLabel(state.refundMonth)}退款明细`
        : "历史退款明细";
      document.getElementById("refundHistoryDetailNote").textContent = `${numberFmt.format(selectedRecords.length)} 条记录；退款时间与下单时间均为 UTC`;
      document.getElementById("refundHistoryBody").innerHTML = refundDetailRows(selectedRecords);
    }

    function renderHeatTable() {
      const months = state.heatMonths;
      const month = months[1];
      const days = daysInMonth(month);
      const query = state.search.trim().toLowerCase();
      const rows = applySort(allAsinRows(state.currency, months, Boolean(query)).filter(row => {
        return matchesAsinFilter(row, query);
      }));

      const maxDailySales = Math.max(
        1,
        ...rows.flatMap(row => days.map(day => metricForDay(row.asin, `${month}-${day}`, state.currency).sales || 0))
      );

      document.getElementById("tableNote").textContent = `${monthLabel(month)} 每日销售额热力格；月度列对比 ${monthLabel(months[0])} 与 ${monthLabel(months[1])}，差异为右列减左列。当前筛选 ${rows.length} 个 ASIN。`;
      document.getElementById("heatHead").innerHTML = `
        <tr>
          <th class="asin-col">${sortButton("主图 / ASIN", "asin", "asin")}</th>
          ${months.map((item, idx) => `<th class="month-col month-${idx} ${idx < months.length - 1 ? "past-month" : "current-month"}">${heatMonthHeader(item, idx)}</th>`).join("")}
          <th class="delta-col">${sortButton("差异", "delta", "sales")}</th>
          ${days.map(day => `<th class="day-head">${sortButton(Number(day), "day", `${month}-${day}`)}</th>`).join("")}
        </tr>
      `;

      document.querySelectorAll("#heatHead .sort-btn, #heatHead .heat-month-sort").forEach(button => {
        button.addEventListener("click", () => setSort(button.dataset.sortType, button.dataset.sortKey));
      });
      document.querySelectorAll("#heatHead .heat-month-select").forEach(select => {
        select.addEventListener("change", () => {
          const index = Number(select.dataset.heatMonthIndex);
          const previousValue = state.heatMonths[index];
          state.heatMonths[index] = select.value;
          if (state.sort.type === "month" && state.sort.key === previousValue) {
            state.sort.key = select.value;
          }
          if (index === 1 && state.sort.type === "day") {
            state.sort = { type: "month", key: select.value, direction: "desc" };
          }
          renderHeatTable();
        });
      });

      document.getElementById("heatBody").innerHTML = rows.map(row => {
        const monthCells = months.map((item, idx) => {
          const metric = row.months[item];
          return `
            <td class="month-col month-${idx} ${idx < months.length - 1 ? "past-month" : "current-month"}">
              <strong>${fmtMoney(metric.sales, state.currency)}</strong>
              <span>${numberFmt.format(metric.units || 0)} 件 / ${numberFmt.format(metric.orders || 0)} 单</span>
            </td>
          `;
        }).join("");
        const deltaClass = row.salesDelta > 0 ? "positive" : row.salesDelta < 0 ? "negative" : "neutral";
        const deltaText = row.salesDelta > 0 ? `+${fmtMoney(row.salesDelta, state.currency)}` : fmtMoney(row.salesDelta, state.currency);
        const unitsDeltaText = row.unitsDelta > 0 ? `+${numberFmt.format(row.unitsDelta)}` : numberFmt.format(row.unitsDelta);
        const deltaCell = `
          <td class="delta-col ${deltaClass}">
            <strong>${deltaText}</strong>
            <span>${unitsDeltaText} 件</span>
          </td>
        `;

        const dayCells = days.map(day => {
          const date = `${month}-${day}`;
          const metric = metricForDay(row.asin, date, state.currency);
          const hasValue = metric.sales > 0 || metric.units > 0;
          const style = heatStyle(metric.sales, maxDailySales);
          const noteKey = heatNoteKey(row.asin, date);
          const note = heatNoteValue(noteKey);
          return `
            <td class="day-cell">
              <div class="heat ${hasValue ? "" : "empty"} ${note ? "has-note" : ""}" style="${style}" data-note-key="${escapeHtml(noteKey)}" ${note ? `title="${escapeHtml(note)}"` : ""}>
                ${hasValue ? `<span class="sales">${fmtHeatMoney(metric.sales, state.currency)}</span><span class="units">${metric.units || 0}件</span>` : ""}
              </div>
            </td>
          `;
        }).join("");

        const thumbnail = row.info.thumbnail
          ? `<img class="thumb" src="${row.info.thumbnail}" alt="${row.asin} 主图">`
          : `<div class="thumb-fallback">${row.asin.slice(-4)}</div>`;
        const parentTag = row.parentAsin
          ? `<div><span class="parent-tag">父体 ${escapeHtml(row.parentAsin)}</span></div>`
          : "";

        return `
          <tr>
            <td class="asin-col">
              <div class="asin-cell">
                ${thumbnail}
                <div>
                  <button class="asin-code" data-asin="${row.asin}" type="button" title="点击复制 ASIN">${row.asin}</button>
                  <div class="product">
                    <a class="product-link" href="${amazonListingUrl(row.asin)}" target="_blank" rel="noopener noreferrer" title="打开 Amazon Listing">
                      ${row.info.productName || (row.info.topSkus || []).join(", ") || "-"}
                    </a>
                  </div>
                  ${parentTag}
                </div>
              </div>
            </td>
            ${monthCells}
            ${deltaCell}
            ${dayCells}
          </tr>
        `;
      }).join("") || `
        <tr><td colspan="${4 + days.length}" style="padding:28px;text-align:center;color:var(--muted);">没有匹配的 ASIN</td></tr>
      `;

      document.querySelectorAll("#heatBody .asin-code").forEach(button => {
        button.addEventListener("click", () => copyAsin(button.dataset.asin));
      });
      scrollHeatTableToEnd();
    }

    function render() {
      renderCurrencyTabs();
      renderOverview();
      renderHeatTable();
      renderInventoryDashboard();
      renderHistorySales();
      renderRefundDashboard();
      renderDailyAdData();
      renderAdPerformance();
      renderOrderMap();
      renderTimeDistribution();
    }

    function syncAsinFilters(value) {
      state.search = value;
      state.historySearch = value;
      state.mapSearch = value;
      state.timeSearch = value;
      state.inventorySearch = value;

      ["search", "historySearch", "dailyAdSearch", "mapSearch", "timeSearch", "inventorySearch"].forEach(id => {
        const input = document.getElementById(id);
        if (input && input.value !== value) input.value = value;
      });

      renderHeatTable();
      renderInventoryDashboard();
      renderHistorySales();
      renderDailyAdData();
      renderAdPerformance();
      renderOrderMap();
      renderTimeDistribution();
    }

    ["search", "historySearch", "dailyAdSearch", "mapSearch", "timeSearch", "inventorySearch"].forEach(id => {
      document.getElementById(id).addEventListener("input", event => {
        syncAsinFilters(event.target.value);
      });
    });

    document.querySelectorAll("[data-refund-tab]").forEach(button => {
      button.addEventListener("click", () => {
        state.refundTab = button.dataset.refundTab || "recent";
        renderRefundDashboard();
      });
    });
    document.getElementById("refundMonthBody").addEventListener("click", event => {
      const target = event.target.closest("[data-refund-month]");
      if (!target) return;
      state.refundMonth = target.dataset.refundMonth || state.refundMonth;
      state.refundTab = "historical";
      renderRefundDashboard();
    });

    document.getElementById("historyExport").addEventListener("click", exportHistoryCsv);
    document.getElementById("heatBody").addEventListener("dblclick", event => {
      const heatCell = event.target.closest(".heat");
      if (!heatCell) return;
      event.preventDefault();
      event.stopPropagation();
      openHeatNoteEditor(heatCell);
    });
    document.getElementById("heatNoteSave").addEventListener("click", () => {
      closeHeatNoteEditor(true);
    });
    document.addEventListener("click", event => {
      const editor = document.getElementById("heatNoteEditor");
      if (!editor.classList.contains("open") || editor.contains(event.target)) return;
      closeHeatNoteEditor(true);
    });
    document.getElementById("adSearch").addEventListener("input", event => {
      state.adSearch = event.target.value;
      renderAdPerformance();
    });
    document.getElementById("adPeriod").addEventListener("change", event => {
      state.adPeriod = event.target.value || "all";
      renderAdPerformance();
    });
    document.getElementById("dailyAdMonth").addEventListener("change", event => {
      state.dailyAdMonth = event.target.value;
      renderDailyAdData();
    });
    document.querySelectorAll("[data-daily-ad-sort-key]").forEach(button => {
      button.addEventListener("click", () => setDailyAdSort(button.dataset.dailyAdSortKey));
    });
    document.addEventListener("click", event => {
      const cell = event.target.closest("[data-ad-copy]");
      if (!cell) return;
      copyAdField(cell.dataset.adCopy);
    });
    document.querySelectorAll("[data-ad-sort-table]").forEach(button => {
      button.addEventListener("click", () => {
        cycleAdSort(button.dataset.adSortTable, button.dataset.adSortKey);
      });
    });
    document.querySelectorAll("[data-ad-export]").forEach(button => {
      button.addEventListener("click", () => {
        exportAdTable(button.dataset.adExport);
      });
    });
    document.querySelectorAll("[data-history-sort-key]").forEach(button => {
      button.addEventListener("click", () => {
        cycleHistorySort(button.dataset.historySortKey);
      });
    });
    document.querySelectorAll("[data-inventory-sort]").forEach(th => {
      th.addEventListener("click", () => {
        const key = th.dataset.inventorySort;
        if (state.inventorySort.key === key) {
          state.inventorySort.direction = state.inventorySort.direction === "desc" ? "asc" : "desc";
        } else {
          state.inventorySort = { key, direction: "desc" };
        }
        renderInventoryDashboard();
      });
    });

    document.getElementById("mapZoomIn").addEventListener("click", () => setMapZoom(state.mapZoom * 1.25));
    document.getElementById("mapZoomOut").addEventListener("click", () => setMapZoom(state.mapZoom / 1.25));
    document.getElementById("mapZoomReset").addEventListener("click", resetMapView);
    document.getElementById("orderMap").addEventListener("pointerdown", beginMapDrag);
    document.getElementById("orderMap").addEventListener("pointermove", moveMapDrag);
    document.getElementById("orderMap").addEventListener("pointerup", endMapDrag);
    document.getElementById("orderMap").addEventListener("pointercancel", endMapDrag);
    document.getElementById("orderMap").addEventListener("wheel", event => {
      event.preventDefault();
      setMapZoom(state.mapZoom * (event.deltaY < 0 ? 1.12 : 1 / 1.12));
    }, { passive: false });

    function bootDashboard(data, preferredCurrency) {
      state.data = data;
      const currencies = orderedCurrencies(data.metadata.currencies);
      state.currency = currencies.includes(preferredCurrency) ? preferredCurrency : currencies.includes("USD") ? "USD" : currencies[0];
      state.heatMonths = defaultHeatMonths();
      state.sort = { type: "month", key: state.heatMonths[1], direction: "desc" };
      document.getElementById("error").innerHTML = "";
      document.getElementById("app").hidden = false;
      render();
    }

    if (window.SALES_DATA) {
      bootDashboard(window.SALES_DATA);
    } else {
      fetch("sales-data.json")
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then(bootDashboard)
        .catch(error => {
          document.getElementById("error").innerHTML = `<div class="error">无法读取 sales-data.json / sales-data.js：${error.message}</div>`;
        });
    }
